import { beginnerChoiceIndex } from "./random.js";
import { chooseEnemyPlan } from "./search.js";
import { createAiSnapshot } from "./snapshot.js";
import { enumerateLegalTurnPlans, makeCanonicalPlanKey } from "./legalPlans.js";
import { simulateTurnPlan } from "./simulator.js";
import { findBattleUnit } from "./state.js";

export function commitPlayerPlan(state, plan, dependencies = {}) {
  if (state.result) throw new Error("battle has already ended");
  if (state.phase !== "player") {
    throw new Error("player plan can only commit during player phase");
  }
  const deps = resolveDependencies(dependencies);
  const legalPlan = findRevalidatedPlan(
    state,
    state.player.unitId,
    plan,
    deps
  );
  if (!legalPlan) throw new Error("player plan is no longer legal");

  const simulation = deps.simulate(state, legalPlan);
  const next = simulation.snapshot;
  appendActionCategory(
    next,
    state.player.unitId,
    simulation.settlementSummary.actionCategory
  );
  if (!next.result) {
    next.phase = "enemy";
    next.activeEnemyUnitId = firstLivingEnemyId(next);
  }
  return {
    state: next,
    plan: legalPlan,
    summary: simulation.settlementSummary
  };
}

export function commitEnemyDecision(state, dependencies = {}) {
  if (state.result) throw new Error("battle has already ended");
  if (state.phase !== "enemy") {
    throw new Error("enemy decision can only commit during enemy phase");
  }
  const deps = resolveDependencies(dependencies);
  const actorUnitId = normalizeActiveEnemy(state);
  const actorBefore = findBattleUnit(state, actorUnitId);
  let decision;
  let chosenPlan;
  let developmentLog = [];

  try {
    decision = deps.choose(createAiSnapshot({
      ...state,
      activeEnemyUnitId: actorUnitId
    }));
    chosenPlan = selectRevalidatedDecision(
      state,
      actorUnitId,
      decision,
      deps
    );
  } catch {
    chosenPlan = chooseOriginOnlyPlan(state, actorUnitId, deps);
    decision = {
      consumedRandom: false,
      roll: null,
      orderedCandidates: chosenPlan ? [{ plan: chosenPlan }] : []
    };
  }

  if (!chosenPlan) {
    chosenPlan = createOriginPassPlan(state, actorUnitId);
    developmentLog = ["ai_no_legal_plan"];
  }

  const simulation = deps.simulate(state, chosenPlan);
  const next = simulation.snapshot;
  appendActionCategory(
    next,
    actorUnitId,
    simulation.settlementSummary.actionCategory
  );
  if (decision?.consumedRandom) next.aiCursor += 1;
  next.decisionIndex += 1;
  advanceAfterEnemy(next, actorUnitId);

  const actorAfter = findBattleUnit(next, actorUnitId);
  return {
    state: next,
    plan: chosenPlan,
    summary: {
      ...simulation.settlementSummary,
      actorUnitId,
      beforePosition: structuredClone(actorBefore.position),
      afterPosition: structuredClone(actorAfter.position)
    },
    decision,
    developmentLog
  };
}

export function advanceEnemyPhase(state, dependencies = {}) {
  let current = structuredClone(state);
  current.content = state.content;
  const summaries = [];
  const developmentLog = [];
  while (!current.result && current.phase === "enemy") {
    current.activeEnemyUnitId = normalizeActiveEnemy(current);
    const committed = commitEnemyDecision(current, dependencies);
    current = committed.state;
    summaries.push(committed.summary);
    developmentLog.push(...committed.developmentLog);
  }
  return {
    state: current,
    summaries,
    developmentLog
  };
}

function selectRevalidatedDecision(
  state,
  actorUnitId,
  decision,
  deps
) {
  if (!decision?.plan) return null;
  const ordered = (decision.orderedCandidates || [])
    .map((candidate) => candidate.plan ?? candidate)
    .filter(Boolean);

  if (decision.consumedRandom) {
    const pool = ordered.slice(0, 3);
    let candidate = decision.plan;
    while (candidate) {
      const legal = findRevalidatedPlan(
        state,
        actorUnitId,
        candidate,
        deps
      );
      if (legal) return legal;
      removeMatchingPlan(pool, candidate);
      if (pool.length === 0) return null;
      candidate =
        pool[beginnerChoiceIndex(pool.length, decision.roll)];
    }
    return null;
  }

  const candidates = [
    decision.plan,
    ...ordered.filter(
      (plan) => plan.canonicalKey !== decision.plan.canonicalKey
    )
  ];
  for (const candidate of candidates) {
    const legal = findRevalidatedPlan(
      state,
      actorUnitId,
      candidate,
      deps
    );
    if (legal) return legal;
  }
  return null;
}

function findRevalidatedPlan(state, actorUnitId, plan, deps) {
  if (deps.revalidate && !deps.revalidate(state, plan)) return null;
  if (deps.revalidate) return plan;
  const { plans } = deps.enumerate(state, actorUnitId);
  return (
    plans.find(
      (candidate) => candidate.canonicalKey === plan.canonicalKey
    ) ?? null
  );
}

function chooseOriginOnlyPlan(state, actorUnitId, deps) {
  const originState = structuredClone(state);
  originState.content = state.content;
  findBattleUnit(originState, actorUnitId).move = 0;
  try {
    const { plans } = deps.enumerate(originState, actorUnitId);
    const origin = findBattleUnit(state, actorUnitId).position;
    return (
      plans.find(
        (plan) =>
          plan.destination.x === origin.x &&
          plan.destination.y === origin.y &&
          plan.action.actionId !== "battle_action_pass"
      ) ??
      plans.find(
        (plan) =>
          plan.destination.x === origin.x &&
          plan.destination.y === origin.y
      ) ??
      null
    );
  } catch {
    return null;
  }
}

function createOriginPassPlan(state, actorUnitId) {
  const actor = findBattleUnit(state, actorUnitId);
  const plan = {
    actorUnitId,
    destination: structuredClone(actor.position),
    path: [[actor.position.x, actor.position.y]],
    action: {
      type: "pass",
      actionId: "battle_action_pass",
      targetUnitId: null,
      targetCell: null
    },
    pathCost: 0,
    essenceCost: 0,
    canonicalKey: "",
    enumerationOrder: 0,
    decisionOrder: 0
  };
  plan.canonicalKey = makeCanonicalPlanKey(plan);
  return plan;
}

function appendActionCategory(state, actorUnitId, category) {
  const recent =
    state.recentActionCategoriesByUnitId[actorUnitId] || [];
  state.recentActionCategoriesByUnitId[actorUnitId] = [
    ...recent,
    category
  ].slice(-2);
}

function advanceAfterEnemy(state, actorUnitId) {
  if (state.result) {
    state.activeEnemyUnitId = null;
    return;
  }
  const actorIndex = state.enemyUnitOrder.indexOf(actorUnitId);
  const nextEnemyId = state.enemyUnitOrder
    .slice(actorIndex + 1)
    .find((unitId) => findBattleUnit(state, unitId).hp > 0);
  if (nextEnemyId) {
    state.phase = "enemy";
    state.activeEnemyUnitId = nextEnemyId;
    return;
  }
  state.phase = "player";
  state.activeEnemyUnitId = null;
  state.round += 1;
}

function normalizeActiveEnemy(state) {
  if (
    state.activeEnemyUnitId &&
    findBattleUnit(state, state.activeEnemyUnitId).hp > 0
  ) {
    return state.activeEnemyUnitId;
  }
  const living = firstLivingEnemyId(state);
  if (!living) throw new Error("enemy phase has no living enemy");
  return living;
}

function firstLivingEnemyId(state) {
  return (
    state.enemyUnitOrder.find(
      (unitId) => findBattleUnit(state, unitId).hp > 0
    ) ?? null
  );
}

function removeMatchingPlan(plans, plan) {
  const index = plans.findIndex(
    (candidate) => candidate.canonicalKey === plan.canonicalKey
  );
  if (index >= 0) plans.splice(index, 1);
}

function resolveDependencies(dependencies) {
  return {
    choose: dependencies.choose ?? chooseEnemyPlan,
    enumerate: dependencies.enumerate ?? enumerateLegalTurnPlans,
    simulate: dependencies.simulate ?? simulateTurnPlan,
    revalidate: dependencies.revalidate ?? null
  };
}
