import { enumerateLegalTurnPlans } from "./legalPlans.js";
import { getEncounter } from "./content.js";
import { manhattan } from "./ranges.js";
import { simulateTurnPlan } from "./simulator.js";

export const PLAYER_POLICY_IDS = Object.freeze([
  "player_policy_aggressive",
  "player_policy_kiting",
  "player_policy_defensive",
  "player_policy_conserving",
  "player_policy_retreat_aware"
]);

const POLICY_TUPLES = Object.freeze({
  player_policy_aggressive: (metrics) => [
    metrics.victory,
    metrics.nonRetreat,
    metrics.survives,
    metrics.killCount,
    metrics.damage,
    metrics.controlGain,
    metrics.hpGain,
    metrics.threatensNext,
    -metrics.essenceCost,
    -metrics.pathCost
  ],
  player_policy_kiting: (metrics) => [
    metrics.victory,
    metrics.nonRetreat,
    metrics.survives,
    metrics.safe,
    -metrics.incomingDamageBp,
    -metrics.incomingControl,
    metrics.damage,
    metrics.controlGain,
    metrics.nearestDistance,
    metrics.hpGain,
    -metrics.essenceCost,
    -metrics.pathCost
  ],
  player_policy_defensive: (metrics) => [
    metrics.victory,
    metrics.nonRetreat,
    metrics.survives,
    -metrics.incomingDamageBp,
    -metrics.incomingControl,
    metrics.hpGain,
    metrics.defends,
    metrics.damage,
    metrics.controlGain,
    -metrics.essenceCost,
    -metrics.pathCost
  ],
  player_policy_conserving: (metrics) => [
    metrics.victory,
    metrics.nonRetreat,
    metrics.survives,
    metrics.killCount,
    metrics.zeroEssence,
    metrics.efficiency,
    metrics.damage,
    metrics.controlGain,
    metrics.hpGain,
    -metrics.incomingDamageBp,
    -metrics.pathCost
  ]
});
const LATE_PROGRESS_ROUND_BY_TIER = Object.freeze({
  battle_tier_tutorial: 5,
  battle_tier_normal: 5,
  battle_tier_elite: 5,
  battle_tier_boss: 7
});

export function choosePlayerPlan(snapshot, policyId) {
  requirePolicy(policyId);
  if (snapshot.result) return null;

  const previewCache = new WeakMap();
  const scoredCandidates = filterPlayerThirdRepeat(
    previewActorPlans(
      snapshot,
      snapshot.player.unitId,
      previewCache
    ),
    snapshot
  ).map((preview) => ({
      ...preview,
      metrics: buildPlayerPlanMetrics(
        snapshot,
        preview,
        previewCache
      )
    }));
  const candidates = forceLateRoundProgress(
    scoredCandidates,
    snapshot,
    policyId
  );
  if (candidates.length === 0) {
    throw new Error("player policy has no legal plan");
  }

  const rootIncomingDamage = sumIncomingActivationMetrics(
    snapshot,
    previewCache
  ).damage;
  return selectScoredPlayerCandidate(policyId, candidates, {
    rootIncomingDamage,
    rootPlayerHp: snapshot.player.hp
  });
}

function forceLateRoundProgress(candidates, snapshot, policyId) {
  const tierId = getEncounter(snapshot.battleId).tierId;
  const progressRound =
    LATE_PROGRESS_ROUND_BY_TIER[tierId] ?? 8;
  if (
    snapshot.round < progressRound ||
    policyId === "player_policy_retreat_aware"
  ) {
    return candidates;
  }
  const immediateProgress = candidates.filter(
    (candidate) =>
      candidate.metrics.damage > 0 ||
      candidate.metrics.controlGain > 0
  );
  if (immediateProgress.length > 0) return immediateProgress;

  const currentDistance = livingEnemies(snapshot).reduce(
    (nearest, enemy) =>
      Math.min(
        nearest,
        manhattan(snapshot.player.position, enemy.position)
      ),
    99
  );
  const closingPlans = candidates.filter(
    (candidate) =>
      candidate.metrics.nonRetreat &&
      candidate.metrics.nearestDistance < currentDistance
  );
  return closingPlans.length > 0 ? closingPlans : candidates;
}

export function selectScoredPlayerCandidate(
  policyId,
  candidates,
  { rootIncomingDamage = 0, rootPlayerHp = Number.POSITIVE_INFINITY } = {}
) {
  requirePolicy(policyId);
  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new Error("player policy requires at least one candidate");
  }

  if (
    policyId === "player_policy_retreat_aware" &&
    rootIncomingDamage >= rootPlayerHp
  ) {
    const retreatCandidates = candidates
      .filter((candidate) => candidate.plan.action.type === "retreat")
      .sort(
        (left, right) =>
          left.plan.pathCost - right.plan.pathCost ||
          compareLexical(
            left.plan.canonicalKey,
            right.plan.canonicalKey
          )
      );
    if (retreatCandidates.length > 0) return retreatCandidates[0];
  }

  const tupleFor =
    POLICY_TUPLES[
      policyId === "player_policy_retreat_aware"
        ? "player_policy_aggressive"
        : policyId
    ];
  return [...candidates].sort((left, right) =>
    comparePolicyCandidates(left, right, tupleFor)
  )[0];
}

export function buildPlayerPlanMetrics(
  before,
  preview,
  previewCache = new WeakMap()
) {
  const after = preview.snapshot;
  const incoming = sumIncomingActivationMetrics(after, previewCache);
  const damage = before.enemies.reduce((total, enemy, index) => {
    const afterEnemy = after.enemies[index];
    return total + Math.max(0, enemy.hp - afterEnemy.hp);
  }, 0);
  const controlGain = before.enemies.reduce(
    (total, enemy, index) =>
      total +
      Math.max(
        0,
        effectiveControl(after.enemies[index]) -
          effectiveControl(enemy)
      ),
    0
  );
  const nearestDistance = livingEnemies(after).reduce(
    (nearest, enemy) =>
      Math.min(
        nearest,
        manhattan(after.player.position, enemy.position)
      ),
    99
  );
  const essenceCost = preview.plan.essenceCost;

  return {
    victory: Number(after.result === "victory"),
    nonRetreat: Number(preview.plan.action.type !== "retreat"),
    survives: Number(after.result !== "defeat"),
    killCount: before.enemies.filter(
      (enemy, index) =>
        enemy.hp > 0 && after.enemies[index].hp <= 0
    ).length,
    damage,
    controlGain,
    hpGain: Math.max(0, after.player.hp - before.player.hp),
    incomingDamageBp: Math.round(
      (incoming.damage / after.player.maxHp) * 10_000
    ),
    incomingControl: incoming.control,
    safe: Number(incoming.damage === 0 && incoming.control === 0),
    threatensNext: Number(
      playerThreatensNextActivation(after, previewCache)
    ),
    nearestDistance,
    zeroEssence: Number(essenceCost === 0),
    efficiency: Math.floor(
      (100 * damage) / Math.max(1, essenceCost)
    ),
    defends: Number(preview.plan.action.type === "defend"),
    essenceCost,
    pathCost: preview.plan.pathCost
  };
}

function sumIncomingActivationMetrics(snapshot, previewCache) {
  if (snapshot.result) return { damage: 0, control: 0 };
  return livingEnemies(snapshot).reduce(
    (total, enemy) => {
      const maximum = maximumActivationMetrics(
        snapshot,
        enemy.unitId,
        snapshot.player.unitId,
        previewCache
      );
      return {
        damage: total.damage + maximum.damage,
        control: total.control + maximum.control
      };
    },
    { damage: 0, control: 0 }
  );
}

function maximumActivationMetrics(
  snapshot,
  actorUnitId,
  targetUnitId,
  previewCache
) {
  let damage = 0;
  let control = 0;
  for (const preview of previewActorPlans(
    snapshot,
    actorUnitId,
    previewCache
  )) {
    damage = Math.max(
      damage,
      positiveDamageTo(preview.settlementSummary, targetUnitId)
    );
    control = Math.max(
      control,
      appliedControlTo(preview.settlementSummary, targetUnitId)
    );
  }
  return { damage, control };
}

function playerThreatensNextActivation(snapshot, previewCache) {
  if (snapshot.result || livingEnemies(snapshot).length === 0) {
    return false;
  }
  return previewActorPlans(
    snapshot,
    snapshot.player.unitId,
    previewCache
  ).some(
    (preview) =>
      snapshot.enemies.some(
        (enemy) =>
          positiveDamageTo(
            preview.settlementSummary,
            enemy.unitId
          ) > 0 ||
          appliedControlTo(
            preview.settlementSummary,
            enemy.unitId
          ) > 0
      )
  );
}

function filterPlayerThirdRepeat(candidates, snapshot) {
  const recent =
    snapshot.recentActionCategoriesByUnitId?.[
      snapshot.player.unitId
    ] || [];
  const repeated = recent.at(-1);
  if (
    recent.length < 2 ||
    recent.at(-2) !== repeated ||
    !["defend", "reposition", "pass"].includes(repeated)
  ) {
    return candidates;
  }
  const hasProgress = candidates.some(
    (candidate) =>
      candidate.settlementSummary.hpChanges.some(
        (change) =>
          change.delta < 0 &&
          snapshot.enemies.some(
            (enemy) => enemy.unitId === change.unitId
          )
      ) ||
      candidate.settlementSummary.appliedStatuses.some(
        (status) =>
          (status.aiControlValue || 0) > 0 &&
          snapshot.enemies.some(
            (enemy) => enemy.unitId === status.unitId
          )
      )
  );
  if (!hasProgress) return candidates;
  const filtered = candidates.filter(
    (candidate) =>
      candidate.settlementSummary.actionCategory !== repeated
  );
  return filtered.length > 0 ? filtered : candidates;
}

function previewActorPlans(snapshot, actorUnitId, cache) {
  let actorPreviews = cache.get(snapshot);
  if (!actorPreviews) {
    actorPreviews = new Map();
    cache.set(snapshot, actorPreviews);
  }
  if (!actorPreviews.has(actorUnitId)) {
    const { plans } = enumerateLegalTurnPlans(snapshot, actorUnitId);
    actorPreviews.set(
      actorUnitId,
      plans.map((plan) => {
        const simulation = simulateTurnPlan(snapshot, plan);
        return {
          plan,
          snapshot: simulation.snapshot,
          settlementSummary: simulation.settlementSummary
        };
      })
    );
  }
  return actorPreviews.get(actorUnitId);
}

function comparePolicyCandidates(left, right, tupleFor) {
  const leftTuple = tupleFor(left.metrics);
  const rightTuple = tupleFor(right.metrics);
  for (let index = 0; index < leftTuple.length; index += 1) {
    if (leftTuple[index] !== rightTuple[index]) {
      return rightTuple[index] - leftTuple[index];
    }
  }
  return compareLexical(
    left.plan.canonicalKey,
    right.plan.canonicalKey
  );
}

function positiveDamageTo(summary, unitId) {
  const change = summary.hpChanges.find(
    (entry) => entry.unitId === unitId && entry.delta < 0
  );
  return change ? -change.delta : 0;
}

function appliedControlTo(summary, unitId) {
  return summary.appliedStatuses
    .filter((status) => status.unitId === unitId)
    .reduce(
      (total, status) =>
        total + Math.max(0, status.aiControlValue || 0),
      0
    );
}

function effectiveControl(unit) {
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

function livingEnemies(snapshot) {
  return snapshot.enemies.filter((enemy) => enemy.hp > 0);
}

function compareLexical(left, right) {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function requirePolicy(policyId) {
  if (!PLAYER_POLICY_IDS.includes(policyId)) {
    throw new Error(`unknown deterministic player policy: ${policyId}`);
  }
}
