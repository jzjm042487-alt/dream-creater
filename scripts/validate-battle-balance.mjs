import { pathToFileURL } from "node:url";

import {
  getAction,
  getEncounter,
  listBalanceEntries
} from "../src/game/battle/content.js";
import {
  advanceEnemyPhase,
  commitPlayerPlan
} from "../src/game/battle/controller.js";
import { enumerateLegalTurnPlans } from "../src/game/battle/legalPlans.js";
import {
  choosePlayerPlan,
  PLAYER_POLICY_IDS
} from "../src/game/battle/playerPolicies.js";
import { fnv1aUtf8, hex8 } from "../src/game/battle/random.js";
import {
  calculateDamage,
  simulateTurnPlan
} from "../src/game/battle/simulator.js";
import { createBattleState } from "../src/game/battle/state.js";

const DIFFICULTIES = Object.freeze([
  "ai_difficulty_standard",
  "ai_difficulty_beginner",
  "ai_difficulty_hard",
  "ai_difficulty_prodigy"
]);
const TIER_RULES = Object.freeze({
  battle_tier_tutorial: {
    minimumVictories: 12,
    maximumVictories: 14,
    minimumVictoryRound: 3,
    maximumVictoryRound: 5,
    healthRatio: [0.7, 0.85],
    damageRatio: [0.55, 0.7],
    mainSkillUses: [1, 2]
  },
  battle_tier_normal: {
    minimumVictories: 10,
    maximumVictories: 12,
    minimumVictoryRound: 4,
    maximumVictoryRound: 6,
    healthRatio: [0.8, 1.05],
    damageRatio: [0.65, 0.9],
    mainSkillUses: [2, 3]
  },
  battle_tier_elite: {
    minimumVictories: 8,
    maximumVictories: 10,
    minimumVictoryRound: 6,
    maximumVictoryRound: 8,
    healthRatioOne: [1.05, 1.3],
    healthRatioTwo: [0.45, 0.65],
    damageRatioOne: [0.8, 1.05],
    damageRatioTwo: [0.45, 0.65],
    mainSkillUsesOne: [3, 4],
    mainSkillUsesTwo: [1, 2]
  },
  battle_tier_boss: {
    minimumVictories: 7,
    maximumVictories: 9,
    minimumVictoryRound: 7,
    maximumVictoryRound: 10,
    healthRatio: [1.4, 1.8],
    damageRatio: [0.85, 1.1],
    mainSkillUses: [4, 6]
  }
});
const DIFFICULTY_DELTAS = Object.freeze({
  ai_difficulty_beginner: [10, 20],
  ai_difficulty_hard: [-15, -8],
  ai_difficulty_prodigy: [-20, -12]
});

export function validateBattleBalance({
  battleIds = null,
  difficulties = DIFFICULTIES,
  enforceDifficultyDeltas = false
} = {}) {
  const selectedEntries = listBalanceEntries().filter(
    (entry) => !battleIds || battleIds.includes(entry.battleId)
  );
  const reports = [];
  const errors = [];

  for (const entry of selectedEntries) {
    const encounter = getEncounter(entry.battleId);
    const byDifficulty = {};
    for (const difficultyId of difficulties) {
      const cases = [];
      for (const build of entry.builds) {
        for (const policyId of entry.policies) {
          cases.push(
            runBattleCase({
              encounter,
              entry,
              build,
              policyId,
              difficultyId
            })
          );
        }
      }
      byDifficulty[difficultyId] = summarizeCases(cases);
      validateTermination(
        entry.battleId,
        difficultyId,
        cases,
        errors
      );
    }

    const standard = byDifficulty.ai_difficulty_standard;
    if (standard) {
      validateStandardTargets(
        encounter,
        entry,
        standard,
        errors
      );
      if (enforceDifficultyDeltas) {
        validateDifficultyDeltas(
          entry.battleId,
          standard,
          byDifficulty,
          errors
        );
      }
    }
    validatePressureAndBudgets(encounter, entry, errors);
    reports.push({
      battleId: entry.battleId,
      tierId: encounter.tierId,
      difficulties: byDifficulty
    });
  }

  return {
    reports,
    errors,
    aggregateDifficultyDeltas: summarizeDifficultyDeltas(reports)
  };
}

export function runBattleCase({
  encounter,
  entry,
  build,
  policyId,
  difficultyId
}) {
  if (!PLAYER_POLICY_IDS.includes(policyId)) {
    throw new Error(`unknown balance policy ${policyId}`);
  }
  let state = createBattleState({
    encounter,
    entryVariantId: entry.recommendedEntryVariantId,
    playerEntry: playerEntryFromBuild(build),
    difficultyId,
    aiSeed: balanceSeed(encounter.battleId, build.buildId, policyId),
    serial: 0,
    returnScene: {
      id: "loc_qingmao_wilderness",
      entrance: "node_qm_entry"
    }
  });

  while (!state.result && state.round <= 20) {
    if (state.phase === "player") {
      const selected = choosePlayerPlan(state, policyId);
      state = commitPlayerPlan(state, selected.plan).state;
    } else {
      state = advanceEnemyPhase(state).state;
    }
  }

  return {
    battleId: encounter.battleId,
    buildId: build.buildId,
    policyId,
    difficultyId,
    result: state.result,
    round: Math.min(state.round, 20),
    didNotTerminate: !state.result,
    finalPlayerHp: state.player.hp,
    finalEnemyHp: state.enemies.reduce(
      (total, enemy) => total + enemy.hp,
      0
    )
  };
}

function summarizeCases(cases) {
  const victoryRounds = cases
    .filter((entry) => entry.result === "victory")
    .map((entry) => entry.round)
    .sort((left, right) => left - right);
  const victories = victoryRounds.length;
  return {
    cases,
    victories,
    victoryRate: victories / 15,
    victoryRoundMedian: median(victoryRounds),
    retreats: cases.filter((entry) => entry.result === "retreat").length,
    defeats: cases.filter((entry) => entry.result === "defeat").length,
    unresolved: cases.filter((entry) => entry.didNotTerminate).length
  };
}

function validateTermination(battleId, difficultyId, cases, errors) {
  for (const entry of cases.filter((value) => value.didNotTerminate)) {
    errors.push(
      `$.${battleId}.${difficultyId}.${entry.buildId}.${entry.policyId}: did_not_terminate at round 20`
    );
  }
}

function validateStandardTargets(
  encounter,
  entry,
  standard,
  errors
) {
  const rules = requireTierRules(encounter.tierId);
  checkRange(
    `$.${entry.battleId}.standard.victories`,
    standard.victories,
    entry.targets.minimumVictories,
    entry.targets.maximumVictories,
    errors
  );
  if (standard.victoryRoundMedian === null) {
    errors.push(
      `$.${entry.battleId}.standard.victoryRoundMedian: no victories`
    );
  } else {
    checkRange(
      `$.${entry.battleId}.standard.victoryRoundMedian`,
      standard.victoryRoundMedian,
      rules.minimumVictoryRound,
      entry.targets.maximumVictoryRound,
      errors
    );
  }
  if (
    entry.targets.minimumVictories !== rules.minimumVictories ||
    entry.targets.maximumVictories !== rules.maximumVictories ||
    entry.targets.maximumVictoryRound !== rules.maximumVictoryRound
  ) {
    errors.push(
      `$.${entry.battleId}.targets: values do not match ${encounter.tierId}`
    );
  }
}

function validateDifficultyDeltas(
  battleId,
  standard,
  byDifficulty,
  errors
) {
  for (const [difficultyId, range] of Object.entries(
    DIFFICULTY_DELTAS
  )) {
    const report = byDifficulty[difficultyId];
    if (!report) continue;
    const delta =
      ((report.victories - standard.victories) / 15) * 100;
    checkRange(
      `$.${battleId}.${difficultyId}.victoryRateDeltaPp`,
      delta,
      range[0],
      range[1],
      errors
    );
  }
}

function summarizeDifficultyDeltas(reports) {
  const standardVictories = reports.reduce(
    (total, report) =>
      total +
      (report.difficulties.ai_difficulty_standard?.victories ?? 0),
    0
  );
  const standardCases = reports.reduce(
    (total, report) =>
      total +
      (report.difficulties.ai_difficulty_standard?.cases.length ?? 0),
    0
  );
  return Object.fromEntries(
    Object.keys(DIFFICULTY_DELTAS).map((difficultyId) => {
      const victories = reports.reduce(
        (total, report) =>
          total + (report.difficulties[difficultyId]?.victories ?? 0),
        0
      );
      const cases = reports.reduce(
        (total, report) =>
          total + (report.difficulties[difficultyId]?.cases.length ?? 0),
        0
      );
      const deltaPp =
        cases && standardCases
          ? (victories / cases - standardVictories / standardCases) * 100
          : null;
      return [
        difficultyId,
        {
          victories,
          cases,
          deltaPp
        }
      ];
    })
  );
}

function validatePressureAndBudgets(encounter, entry, errors) {
  const rules = requireTierRules(encounter.tierId);
  const balanced = entry.builds.find(
    (build) => build.buildId === "reference_balanced"
  );
  if (!balanced) {
    errors.push(`$.${entry.battleId}.builds: missing reference_balanced`);
    return;
  }
  const state = createBattleState({
    encounter,
    entryVariantId: entry.recommendedEntryVariantId,
    playerEntry: playerEntryFromBuild(balanced),
    difficultyId: "ai_difficulty_standard",
    aiSeed: "00000000",
    serial: 0,
    returnScene: { id: "balance", entrance: "balance" }
  });
  const retreatReachable = enumerateLegalTurnPlans(
    state,
    state.player.unitId
  ).plans.some((plan) => plan.action.type === "retreat");
  if (!retreatReachable) {
    errors.push(
      `$.${entry.battleId}.recommendedEntryVariantId: retreat is not reachable`
    );
  }

  const twoEnemyTier = encounter.enemies.length === 2;
  const healthRange =
    rules.healthRatio ??
    (twoEnemyTier ? rules.healthRatioTwo : rules.healthRatioOne);
  const damageRange =
    rules.damageRatio ??
    (twoEnemyTier ? rules.damageRatioTwo : rules.damageRatioOne);
  const skillUseRange =
    rules.mainSkillUses ??
    (twoEnemyTier
      ? rules.mainSkillUsesTwo
      : rules.mainSkillUsesOne);

  encounter.enemies.forEach((enemy, enemyIndex) => {
    checkRange(
      `$.${entry.battleId}.enemies[${enemyIndex}].maxHealthRatio`,
      enemy.maxHealth / balanced.maxHealth,
      healthRange[0],
      healthRange[1],
      errors
    );
    checkRange(
      `$.${entry.battleId}.enemies[${enemyIndex}].move`,
      enemy.move,
      2,
      3,
      errors
    );
    const commonEnemyDamage = commonEnemyDamageAgainst(
      state.enemies[enemyIndex],
      state.player,
      state
    );
    const commonPlayerDamage = commonPlayerDamageAgainst(
      state.player,
      state.enemies[enemyIndex],
      state
    );
    checkRange(
      `$.${entry.battleId}.enemies[${enemyIndex}].commonDamageRatio`,
      commonEnemyDamage / Math.max(1, commonPlayerDamage),
      damageRange[0],
      damageRange[1],
      errors
    );
    const mainSkillUses = authoredMainSkillUses(enemy);
    if (mainSkillUses !== null) {
      checkRange(
        `$.${entry.battleId}.enemies[${enemyIndex}].mainSkillUses`,
        mainSkillUses,
        skillUseRange[0],
        skillUseRange[1],
        errors
      );
    }
  });

  if (encounter.tierId === "battle_tier_normal") {
    const maximumHit = Math.max(
      ...state.enemies.map((enemy) =>
        maximumDirectDamage(enemy, state.player, state)
      )
    );
    if (maximumHit * 2 >= balanced.maxHealth) {
      errors.push(
        `$.${entry.battleId}.pressure.twoFullHealthHits: ${maximumHit} * 2 must be below ${balanced.maxHealth}`
      );
    }
  }

  if (encounter.enemies.length === 2) {
    const theoretical = state.enemies.reduce(
      (total, enemy) =>
        total + maximumDirectDamage(enemy, state.player, state),
      0
    );
    const firstRound = state.enemies.reduce(
      (total, enemy) =>
        total + maximumLegalDamage(state, enemy.unitId, state.player.unitId),
      0
    );
    if (theoretical / balanced.maxHealth > 0.55) {
      errors.push(
        `$.${entry.battleId}.pressure.maximumTeamDamageRatio: ${ratio(theoretical, balanced.maxHealth)} exceeds 0.55`
      );
    }
    if (firstRound / balanced.maxHealth > 0.4) {
      errors.push(
        `$.${entry.battleId}.pressure.firstRoundDamageRatio: ${ratio(firstRound, balanced.maxHealth)} exceeds 0.40`
      );
    }
  }
}

function commonEnemyDamageAgainst(actor, target, state) {
  const actions = actor.actionIds
    .map(getAction)
    .filter((action) => action.damage && !action.requiresStatusId);
  const basicActions = actions.filter(
    (action) => action.type === "basicAttack"
  );
  if (basicActions.length > 0) {
    return Math.max(
      ...basicActions.map((action) =>
        calculateDamage(actor, target, action)
      )
    );
  }
  actions.sort(
      (left, right) =>
        left.cooldownTurns - right.cooldownTurns ||
        left.essenceCost - right.essenceCost ||
        left.id.localeCompare(right.id)
  );
  return actions.length
    ? calculateDamage(actor, target, actions[0])
    : maximumDirectDamage(actor, target, state);
}

function commonPlayerDamageAgainst(actor, target, state) {
  const damages = actor.actionIds
    .map(getAction)
    .filter(
      (action) =>
        action.damage &&
        !action.requiresStatusId &&
        action.cooldownTurns === 0 &&
        action.essenceCost * 3 <= actor.maxEssence
    )
    .map((action) => calculateDamage(actor, target, action));
  return damages.length ? Math.max(...damages) : 1;
}

function maximumDirectDamage(actor, target) {
  const damages = actor.actionIds
    .map(getAction)
    .filter((action) => action.damage)
    .map((action) => calculateDamage(actor, target, action));
  return damages.length ? Math.max(...damages) : 0;
}

function maximumLegalDamage(state, actorUnitId, targetUnitId) {
  return enumerateLegalTurnPlans(state, actorUnitId).plans.reduce(
    (maximum, plan) => {
      if (plan.action.targetUnitId !== targetUnitId) return maximum;
      const simulation = simulateTurnPlan(state, plan);
      const damage =
        -(
          simulation.settlementSummary.hpChanges.find(
            (change) =>
              change.unitId === targetUnitId && change.delta < 0
          )?.delta ?? 0
        );
      return Math.max(maximum, damage);
    },
    0
  );
}

function authoredMainSkillUses(enemy) {
  const costs = enemy.actionIds
    .map(getAction)
    .filter(
      (action) =>
        action.essenceCost > 0 &&
        action.type !== "item" &&
        action.type !== "defend" &&
        action.category !== "defend" &&
        action.category !== "pass"
    )
    .map((action) => action.essenceCost);
  return costs.length
    ? Math.floor(enemy.maxEssence / Math.min(...costs))
    : null;
}

function playerEntryFromBuild(build) {
  return {
    unitId: "player",
    maxHealth: build.maxHealth,
    maxEssence: build.maxEssence,
    move: build.move,
    strength: build.attributes.strength,
    perception: build.attributes.perception,
    physicalDefense: build.defenses.physical,
    guDefense: build.defenses.gu,
    actionIds: [...build.actionIds],
    revealedActionIds: [...build.actionIds],
    publicItemActions: structuredClone(build.publicItemUses)
  };
}

function balanceSeed(battleId, buildId, policyId) {
  return hex8(
    fnv1aUtf8(`balance|${battleId}|${buildId}|${policyId}`)
  );
}

function median(values) {
  if (values.length === 0) return null;
  const middle = Math.floor(values.length / 2);
  return values.length % 2 === 1
    ? values[middle]
    : (values[middle - 1] + values[middle]) / 2;
}

function checkRange(path, value, minimum, maximum, errors) {
  if (value < minimum || value > maximum) {
    errors.push(
      `${path}: ${format(value)} is outside ${format(minimum)}..${format(maximum)}`
    );
  }
}

function requireTierRules(tierId) {
  const rules = TIER_RULES[tierId];
  if (!rules) throw new Error(`unknown battle tier ${tierId}`);
  return rules;
}

function ratio(numerator, denominator) {
  return format(numerator / denominator);
}

function format(value) {
  return Number.isInteger(value)
    ? String(value)
    : Number(value.toFixed(4)).toString();
}

function parseCliArgs(argv) {
  const battleIds = [];
  const difficulties = [];
  let enforceDifficultyDeltas = false;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--battle") {
      battleIds.push(argv[++index]);
    } else if (argument === "--difficulty") {
      const value = argv[++index];
      difficulties.push(
        value.startsWith("ai_difficulty_")
          ? value
          : `ai_difficulty_${value}`
      );
    } else if (argument === "--skip-deltas") {
      enforceDifficultyDeltas = false;
    } else if (argument === "--enforce-deltas") {
      enforceDifficultyDeltas = true;
    } else {
      throw new Error(`unknown argument: ${argument}`);
    }
  }
  return {
    battleIds: battleIds.length ? battleIds : null,
    difficulties: difficulties.length ? difficulties : DIFFICULTIES,
    enforceDifficultyDeltas
  };
}

function printReport(result) {
  for (const report of result.reports) {
    const parts = Object.entries(report.difficulties).map(
      ([difficultyId, values]) =>
        `${difficultyId.replace("ai_difficulty_", "")}: ` +
        `${values.victories}/15 wins, median ${values.victoryRoundMedian ?? "-"}, ` +
        `${values.retreats} retreat, ${values.defeats} defeat, ${values.unresolved} unresolved`
    );
    console.log(`${report.battleId} [${report.tierId}]`);
    for (const part of parts) console.log(`  ${part}`);
  }
  if (result.errors.length > 0) {
    console.error(`Battle balance validation failed (${result.errors.length}):`);
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    const aggregateParts = Object.entries(
      result.aggregateDifficultyDeltas
    )
      .filter(([, value]) => value.deltaPp !== null)
      .map(
        ([difficultyId, value]) =>
          `${difficultyId.replace("ai_difficulty_", "")}: ` +
          `${format(value.deltaPp)}pp (${value.victories}/${value.cases})`
      );
    if (aggregateParts.length > 0) {
      console.log(`Aggregate difficulty deltas: ${aggregateParts.join(", ")}`);
    }
    console.log(
      `Battle balance validation passed (${result.reports.length} encounters).`
    );
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  printReport(validateBattleBalance(parseCliArgs(process.argv.slice(2))));
}
