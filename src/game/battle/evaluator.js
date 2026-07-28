import { enumerateLegalTurnPlans } from "./legalPlans.js";
import { manhattan } from "./ranges.js";
import { applyDefendReduction, calculateDamage } from "./simulator.js";
import { findBattleUnit } from "./state.js";

const TERMINAL_SCORES = Object.freeze({
  defeat: 100_000,
  retreat: 90_000,
  victory: -100_000
});
const REPEAT_CATEGORIES = new Set(["defend", "reposition", "pass"]);

export function buildEvaluationFeatures(context) {
  validateContext(context);
  const root = findBattleUnit(
    context.leafAfterSnapshot,
    context.rootActorUnitId
  );
  const player = context.leafAfterSnapshot.player;
  const enemies = context.leafAfterSnapshot.enemies;
  const profile = getRootProfile(context);
  const rootIsAlive = root.hp > 0;
  const teamMaxEssence = enemies.reduce(
    (total, enemy) => total + enemy.maxEssence,
    0
  );

  return {
    targetLoss: clamp01(1 - player.hp / player.maxHp),
    teamSurvival:
      enemies.reduce(
        (total, enemy) => total + clamp01(enemy.hp / enemy.maxHp),
        0
      ) / enemies.length,
    immediateThreat: rootIsAlive
      ? clamp01(
          maximumDamage(
            context.leafAfterSnapshot,
            root.unitId,
            player.unitId
          ) / player.maxHp
        )
      : 0,
    exposure: rootIsAlive
      ? clamp01(
          maximumDamage(
            context.leafAfterSnapshot,
            player.unitId,
            root.unitId
          ) / root.maxHp
        )
      : 0,
    rangeFit: rootIsAlive ? rangeFit(root, player, profile) : 0,
    controlValue: clamp(
      (controlBalance(context.leafAfterSnapshot) -
        controlBalance(context.rootBeforeSnapshot)) /
        100,
      -1,
      1
    ),
    resourceReserve:
      teamMaxEssence > 0
        ? clamp01(
            enemies.reduce(
              (total, enemy) => total + enemy.essence,
              0
            ) / teamMaxEssence
          )
        : 0,
    coordination: coordinationValue(context.leafAfterSnapshot)
  };
}

export function evaluateBattleState(context) {
  validateContext(context);
  const terminalScore = TERMINAL_SCORES[context.leafAfterSnapshot.result];
  if (Number.isInteger(terminalScore)) return terminalScore;

  const profile = getRootProfile(context);
  const features = buildEvaluationFeatures(context);
  const weights = profile.weights;
  const rootStep = context.branchSteps[0];
  const action =
    context.rootBeforeSnapshot.content.actions[
      rootStep?.settlementSummary?.actionId
    ] ??
    context.leafAfterSnapshot.content.actions[
      rootStep?.settlementSummary?.actionId
    ];

  return (
    Math.round(features.targetLoss * weights.targetLoss) +
    Math.round(features.teamSurvival * weights.teamSurvival) +
    Math.round(features.immediateThreat * weights.immediateThreat) -
    Math.round(features.exposure * weights.exposure) +
    Math.round(features.rangeFit * weights.rangeFit) +
    Math.round(features.controlValue * weights.control) +
    Math.round(features.resourceReserve * weights.resourceReserve) +
    Math.round(features.coordination * weights.coordination) +
    (action?.aiUtilityAdjustment ?? 0) +
    intentAdjustment(context, features, profile, action)
  );
}

export function compareEnemyDecisions(left, right) {
  return (
    right.score - left.score ||
    Number(isTerminalDecision(right)) - Number(isTerminalDecision(left)) ||
    decisionActionRank(left) - decisionActionRank(right) ||
    planOf(left).essenceCost - planOf(right).essenceCost ||
    planOf(left).pathCost - planOf(right).pathCost ||
    compareLexical(
      planOf(left).canonicalKey,
      planOf(right).canonicalKey
    )
  );
}

export function comparePlayerResponses(left, right) {
  return (
    left.score - right.score ||
    compareLexical(
      planOf(left).canonicalKey,
      planOf(right).canonicalKey
    )
  );
}

export function filterThirdRepeat(candidates, snapshot, actorUnitId) {
  const recent =
    snapshot.recentActionCategoriesByUnitId?.[actorUnitId] || [];
  const repeatedCategory = recent.at(-1);
  if (
    recent.length < 2 ||
    recent.at(-2) !== repeatedCategory ||
    !REPEAT_CATEGORIES.has(repeatedCategory) ||
    !candidates.some((candidate) =>
      isProgressCandidate(candidate, snapshot, actorUnitId)
    )
  ) {
    return candidates;
  }

  return candidates.filter(
    (candidate) => actionCategoryOf(candidate) !== repeatedCategory
  );
}

function intentAdjustment(context, features, profile, action) {
  const summary = context.branchSteps[0]?.settlementSummary;
  if (!summary) return 0;

  switch (context.rootIntent) {
    case "finish":
      return summary.result === "defeat" ? 10_000 : 0;
    case "attack":
      return dealsPositiveDamage(summary) || appliesEffectiveControl(summary)
        ? 120
        : 0;
    case "reposition":
      return features.rangeFit > rootBeforeFeature(context, "rangeFit")
        ? 100
        : 0;
    case "defend":
      return (
        rootBeforeFeature(context, "exposure") - features.exposure >=
        0.25
      )
        ? 160
        : 0;
    case "conserve":
      return action?.essenceCost === 0 ? 100 : 0;
    case "phase_action":
      return currentPhaseActionId(
        profile,
        findBattleUnit(
          context.rootBeforeSnapshot,
          context.rootActorUnitId
        )
      ) === action?.id
        ? 180
        : 0;
    default:
      return 0;
  }
}

function rootBeforeFeature(context, featureName) {
  return buildEvaluationFeatures({
    ...context,
    leafAfterSnapshot: context.rootBeforeSnapshot,
    branchSteps: []
  })[featureName];
}

function maximumDamage(snapshot, actorUnitId, targetUnitId) {
  if (snapshot.result) return 0;
  const actor = findBattleUnit(snapshot, actorUnitId);
  const target = findBattleUnit(snapshot, targetUnitId);
  if (actor.hp <= 0 || target.hp <= 0) return 0;

  const { plans } = enumerateLegalTurnPlans(snapshot, actorUnitId);
  let maximum = 0;
  for (const plan of plans) {
    if (plan.action.targetUnitId !== targetUnitId) continue;
    const action = snapshot.content.actions[plan.action.actionId];
    if (!action?.damage) continue;
    let damage = calculateDamage(actor, target, action);
    if (
      target.statuses.some(
        (status) =>
          status.statusId === "battle_status_defending" &&
          status.consumeOn === "nextIncomingDamage"
      )
    ) {
      damage = applyDefendReduction(damage);
    }
    maximum = Math.max(maximum, damage);
  }
  return maximum;
}

function rangeFit(actor, player, profile) {
  const distance = manhattan(actor.position, player.position);
  const preferred = profile.preferredRange;
  const gap =
    distance < preferred.minimum
      ? preferred.minimum - distance
      : distance > preferred.maximum
        ? distance - preferred.maximum
        : 0;
  return Math.max(0, 1 - 0.25 * gap);
}

function controlBalance(snapshot) {
  return (
    unitControlValue(snapshot.player) -
    snapshot.enemies.reduce(
      (total, enemy) => total + unitControlValue(enemy),
      0
    )
  );
}

function unitControlValue(unit) {
  const highestByStatus = new Map();
  for (const status of unit.statuses || []) {
    highestByStatus.set(
      status.statusId,
      Math.max(
        highestByStatus.get(status.statusId) || 0,
        status.aiControlValue || 0
      )
    );
  }
  return [...highestByStatus.values()].reduce(
    (total, value) => total + value,
    0
  );
}

function coordinationValue(snapshot) {
  if (snapshot.enemies.length !== 2) return 0;
  const [left, right] = snapshot.enemies;
  const occupancy =
    left.position.x === right.position.x &&
    left.position.y === right.position.y
      ? 0
      : 1;
  const approachSides =
    mainDirection(left.position, snapshot.player.position) ===
    mainDirection(right.position, snapshot.player.position)
      ? 0
      : 1;
  const threateningCount = snapshot.enemies.filter(
    (enemy) =>
      maximumDamage(snapshot, enemy.unitId, snapshot.player.unitId) > 0
  ).length;
  const attackCoverage = threateningCount / 2;
  return (occupancy + approachSides + attackCoverage) / 3;
}

function mainDirection(position, playerPosition) {
  const dx = position.x - playerPosition.x;
  const dy = position.y - playerPosition.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? "left" : "right";
  return dy < 0 ? "up" : "down";
}

function isProgressCandidate(candidate, snapshot, actorUnitId) {
  if (
    dealsPositiveDamage(candidate.settlementSummary) ||
    appliesEffectiveControl(candidate.settlementSummary)
  ) {
    return true;
  }
  const after =
    candidate.snapshot ??
    candidate.afterSnapshot ??
    candidate.preview?.snapshot;
  if (!after) return false;
  const actor = findBattleUnit(snapshot, actorUnitId);
  const profile = snapshot.content.profiles[actor.profileId];
  return (
    rangeFit(
      findBattleUnit(after, actorUnitId),
      after.player,
      profile
    ) > rangeFit(actor, snapshot.player, profile)
  );
}

function dealsPositiveDamage(summary) {
  return Boolean(summary?.hpChanges?.some((change) => change.delta < 0));
}

function appliesEffectiveControl(summary) {
  return Boolean(
    summary?.appliedStatuses?.some(
      (status) => (status.aiControlValue || 0) > 0
    )
  );
}

function currentPhaseActionId(profile, actor) {
  const ratio = actor.maxHp > 0 ? actor.hp / actor.maxHp : 0;
  return (profile.phases || [])
    .filter(
      (phase) =>
        ratio >= phase.minimumHpRatio &&
        ratio <= phase.maximumHpRatio
    )
    .sort(
      (left, right) =>
        left.maximumHpRatio - right.maximumHpRatio ||
        left.minimumHpRatio - right.minimumHpRatio
    )[0]?.phaseActionId;
}

function actionCategoryOf(candidate) {
  return (
    candidate.settlementSummary?.actionCategory ??
    candidate.actionCategory ??
    candidate.preview?.settlementSummary?.actionCategory
  );
}

function decisionActionRank(decision) {
  if (isTerminalDecision(decision)) return 0;
  const type = planOf(decision).action.type;
  if (type === "basicAttack") return 1;
  if (type === "skill" || type === "boss" || type === "item") return 2;
  if (type === "defend") return 3;
  return 4;
}

function isTerminalDecision(decision) {
  return Boolean(
    decision.settlementSummary?.result ??
    decision.preview?.settlementSummary?.result
  );
}

function planOf(decision) {
  return decision.plan ?? decision;
}

function getRootProfile(context) {
  const profile =
    context.rootBeforeSnapshot.content.profiles[context.rootProfileId] ??
    context.leafAfterSnapshot.content.profiles[context.rootProfileId];
  if (!profile) {
    throw new Error(`unknown root battle AI profile: ${context.rootProfileId}`);
  }
  return profile;
}

function validateContext(context) {
  if (
    !context ||
    !context.rootActorUnitId ||
    !context.rootProfileId ||
    !context.rootBeforeSnapshot ||
    !context.leafAfterSnapshot ||
    !Array.isArray(context.branchSteps)
  ) {
    throw new TypeError("invalid battle evaluation context");
  }
  if (context.leafAfterSnapshot.enemies.length === 0) {
    throw new Error("battle evaluation requires at least one enemy");
  }
}

function compareLexical(left, right) {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}
