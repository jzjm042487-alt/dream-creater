import {
  compareEnemyDecisions,
  comparePlayerResponses,
  evaluateBattleState,
  filterThirdRepeat
} from "./evaluator.js";
import { enumerateLegalTurnPlans } from "./legalPlans.js";
import {
  beginnerChoiceIndex,
  deterministicRandom
} from "./random.js";
import { resolveBattleIntent } from "./behaviorPolicy.js";
import { simulateTurnPlan } from "./simulator.js";
import { findBattleUnit } from "./state.js";

const DIFFICULTIES = new Set([
  "ai_difficulty_beginner",
  "ai_difficulty_standard",
  "ai_difficulty_hard",
  "ai_difficulty_prodigy"
]);

export function chooseEnemyPlan(snapshot, dependencies = {}) {
  if (dependencies.timeBudgetMs !== undefined) {
    throw new Error("battle search does not accept a time budget");
  }
  if (snapshot.result) return null;
  const deps = resolveDependencies(dependencies);
  const actorUnitId = resolveActiveEnemy(snapshot);
  const rootGeneration = scoreEnemyCandidates(
    snapshot,
    actorUnitId,
    deps
  );
  if (rootGeneration.candidates.length === 0) {
    throw new Error(`no legal battle plan for ${actorUnitId}`);
  }
  const trace = createTrace();
  const context = {
    snapshot,
    actorUnitId,
    rootGeneration,
    deps,
    trace
  };

  let result;
  switch (snapshot.difficultyId) {
    case "ai_difficulty_beginner":
      result = searchBeginner(context);
      break;
    case "ai_difficulty_standard":
      result = searchStandard(context);
      break;
    case "ai_difficulty_hard":
      result = searchHard(context);
      break;
    case "ai_difficulty_prodigy":
      result = searchProdigy(context);
      break;
    default:
      throw new Error(`unknown battle AI difficulty: ${snapshot.difficultyId}`);
  }

  return {
    ...result.selected,
    choiceIndex: result.choiceIndex,
    consumedRandom: result.consumedRandom,
    roll: result.roll,
    orderedCandidates: result.orderedCandidates,
    diagnostics: rootGeneration.diagnostics,
    trace
  };
}

export function searchBeginner(context) {
  const candidates = capActionsPerDestination(
    context.rootGeneration.candidates,
    2
  );
  const top = candidates.slice(0, 3);
  const roll = context.deps.random(
    context.snapshot.aiSeed,
    context.snapshot.aiCursor
  );
  const choiceIndex = beginnerChoiceIndex(top.length, roll);
  context.trace.rootWidth = context.rootGeneration.evaluatedCount;
  context.trace.leafCount = context.rootGeneration.evaluatedCount;
  return {
    selected: top[choiceIndex],
    orderedCandidates: candidates,
    choiceIndex,
    consumedRandom: true,
    roll
  };
}

export function searchStandard(context) {
  const candidates = capActionsPerDestination(
    context.rootGeneration.candidates,
    3
  );
  context.trace.rootWidth = context.rootGeneration.evaluatedCount;
  context.trace.leafCount = context.rootGeneration.evaluatedCount;
  return {
    selected: candidates[0],
    orderedCandidates: candidates,
    choiceIndex: 0,
    consumedRandom: false,
    roll: null
  };
}

export function searchHard(context) {
  const roots = context.rootGeneration.candidates.slice(0, 8);
  context.trace.rootWidth = roots.length;
  const resolvedRoots = roots.map((root) =>
    evaluateHardRoot(context, root)
  );
  resolvedRoots.sort(compareEnemyDecisions);
  return deterministicResult(resolvedRoots);
}

export function searchProdigy(context) {
  const remainingEnemyIds = remainingEnemyUnitIds(
    context.snapshot,
    context.actorUnitId
  );
  if (context.snapshot.enemies.length === 1) {
    return searchProdigyOneOnOne(context);
  }
  if (remainingEnemyIds.length > 0) {
    return searchProdigyFirstOfTwo(context, remainingEnemyIds[0]);
  }
  return searchProdigySecondOfTwo(context);
}

function searchProdigyOneOnOne(context) {
  const roots = context.rootGeneration.candidates.slice(0, 8);
  context.trace.rootWidth = roots.length;
  const resolvedRoots = roots.map((root) => {
    const rootBranch = [root.step];
    if (root.snapshot.result) {
      recordLeaf(context.trace, rootBranch);
      return withSearchScore(root, root.score);
    }
    const responses = buildPlayerResponses(
      root.snapshot,
      rootBranch,
      context,
      6
    );
    context.trace.maxPlayerWidth = Math.max(
      context.trace.maxPlayerWidth,
      responses.length
    );
    const responseValues = responses.map((response) => {
      const responseBranch = [...rootBranch, response.step];
      if (response.snapshot.result) {
        recordLeaf(context.trace, responseBranch);
        return response.score;
      }
      const followGeneration = scoreEnemyCandidates(
        response.snapshot,
        context.actorUnitId,
        context.deps
      );
      const followUps = followGeneration.candidates.slice(0, 6);
      context.trace.maxFollowUpWidth = Math.max(
        context.trace.maxFollowUpWidth,
        followUps.length
      );
      if (followUps.length === 0) {
        recordLeaf(context.trace, responseBranch);
        return evaluateRootBranch(
          context,
          response.snapshot,
          responseBranch
        );
      }
      return Math.max(
        ...followUps.map((followUp) => {
          const branch = [...responseBranch, followUp.step];
          recordLeaf(context.trace, branch);
          return evaluateRootBranch(
            context,
            followUp.snapshot,
            branch
          );
        })
      );
    });
    return withSearchScore(
      root,
      responseValues.length > 0
        ? Math.min(...responseValues)
        : root.score
    );
  });
  resolvedRoots.sort(compareEnemyDecisions);
  return deterministicResult(resolvedRoots);
}

function searchProdigyFirstOfTwo(context, allyUnitId) {
  const roots = context.rootGeneration.candidates.slice(0, 5);
  context.trace.rootWidth = roots.length;
  const resolvedRoots = roots.map((root) => {
    const rootBranch = [root.step];
    if (root.snapshot.result) {
      recordLeaf(context.trace, rootBranch);
      return withSearchScore(root, root.score);
    }
    const allyGeneration = scoreEnemyCandidates(
      root.snapshot,
      allyUnitId,
      context.deps
    );
    const allyCandidates = allyGeneration.candidates.slice(0, 5);
    context.trace.maxAllyWidth = Math.max(
      context.trace.maxAllyWidth,
      allyCandidates.length
    );
    const combinationValues = allyCandidates.map((ally) => {
      const allyBranch = [...rootBranch, ally.step];
      if (ally.snapshot.result) {
        recordLeaf(context.trace, allyBranch);
        return evaluateRootBranch(context, ally.snapshot, allyBranch);
      }
      const responses = buildPlayerResponses(
        ally.snapshot,
        allyBranch,
        context,
        6
      );
      context.trace.maxPlayerWidth = Math.max(
        context.trace.maxPlayerWidth,
        responses.length
      );
      if (responses.length === 0) {
        recordLeaf(context.trace, allyBranch);
        return evaluateRootBranch(context, ally.snapshot, allyBranch);
      }
      for (const response of responses) {
        recordLeaf(context.trace, [...allyBranch, response.step]);
      }
      return Math.min(...responses.map((response) => response.score));
    });
    return withSearchScore(
      root,
      combinationValues.length > 0
        ? Math.max(...combinationValues)
        : root.score
    );
  });
  resolvedRoots.sort(compareEnemyDecisions);
  return deterministicResult(resolvedRoots);
}

function searchProdigySecondOfTwo(context) {
  const roots = context.rootGeneration.candidates.slice(0, 5);
  context.trace.rootWidth = roots.length;
  const resolvedRoots = roots.map((root) => {
    const rootBranch = [root.step];
    if (root.snapshot.result) {
      recordLeaf(context.trace, rootBranch);
      return withSearchScore(root, root.score);
    }
    const responses = buildPlayerResponses(
      root.snapshot,
      rootBranch,
      context,
      6
    );
    context.trace.maxPlayerWidth = Math.max(
      context.trace.maxPlayerWidth,
      responses.length
    );
    if (responses.length === 0) {
      recordLeaf(context.trace, rootBranch);
      return withSearchScore(root, root.score);
    }
    for (const response of responses) {
      recordLeaf(context.trace, [...rootBranch, response.step]);
    }
    return withSearchScore(
      root,
      Math.min(...responses.map((response) => response.score))
    );
  });
  resolvedRoots.sort(compareEnemyDecisions);
  return deterministicResult(resolvedRoots);
}

function evaluateHardRoot(context, root) {
  let branchSnapshot = root.snapshot;
  const branchSteps = [root.step];
  if (branchSnapshot.result) {
    recordLeaf(context.trace, branchSteps);
    return withSearchScore(root, root.score);
  }

  const remainingIds = remainingEnemyUnitIds(
    context.snapshot,
    context.actorUnitId
  );
  context.trace.maxAllyWidth = Math.max(
    context.trace.maxAllyWidth,
    remainingIds.length
  );
  for (const unitId of remainingIds) {
    if (findBattleUnit(branchSnapshot, unitId).hp <= 0) continue;
    const generation = scoreEnemyCandidates(
      branchSnapshot,
      unitId,
      context.deps
    );
    const standardCandidates = capActionsPerDestination(
      generation.candidates,
      3
    );
    const chosen = standardCandidates[0];
    if (!chosen) continue;
    branchSteps.push(chosen.step);
    branchSnapshot = chosen.snapshot;
    if (branchSnapshot.result) {
      recordLeaf(context.trace, branchSteps);
      return withSearchScore(
        root,
        evaluateRootBranch(context, branchSnapshot, branchSteps)
      );
    }
  }

  const responses = buildPlayerResponses(
    branchSnapshot,
    branchSteps,
    context,
    6
  );
  context.trace.maxPlayerWidth = Math.max(
    context.trace.maxPlayerWidth,
    responses.length
  );
  if (responses.length === 0) {
    recordLeaf(context.trace, branchSteps);
    return withSearchScore(
      root,
      evaluateRootBranch(context, branchSnapshot, branchSteps)
    );
  }
  for (const response of responses) {
    recordLeaf(context.trace, [...branchSteps, response.step]);
  }
  return withSearchScore(
    root,
    Math.min(...responses.map((response) => response.score))
  );
}

function scoreEnemyCandidates(snapshot, actorUnitId, deps) {
  const actor = findBattleUnit(snapshot, actorUnitId);
  const profile = snapshot.content.profiles[actor.profileId];
  if (!profile) {
    throw new Error(`missing AI profile ${actor.profileId} for ${actorUnitId}`);
  }
  const enumeration = deps.enumerate(snapshot, actorUnitId);
  const previews = enumeration.plans.map((plan) => {
    const simulation = deps.simulate(snapshot, plan);
    return {
      plan,
      previewSnapshot: simulation.snapshot,
      snapshot: simulation.snapshot,
      settlementSummary: simulation.settlementSummary
    };
  });
  const filtered = filterThirdRepeat(previews, snapshot, actorUnitId);
  const intent = deps.resolveIntent({
    snapshot,
    actorUnitId,
    candidates: filtered,
    profile,
    facts: deriveSearchFacts(snapshot, actor, profile, filtered, deps)
  });
  const candidates = filtered.map((preview) => {
    const step = createBranchStep(
      "enemy",
      actorUnitId,
      intent,
      profile.id,
      snapshot,
      preview.snapshot,
      preview.settlementSummary
    );
    const evaluationContext = {
      rootActorUnitId: actorUnitId,
      rootIntent: intent,
      rootProfileId: profile.id,
      rootBeforeSnapshot: snapshot,
      leafAfterSnapshot: preview.snapshot,
      branchSteps: [step]
    };
    return {
      ...preview,
      step,
      intent,
      profileId: profile.id,
      score: deps.evaluate(evaluationContext)
    };
  });
  candidates.sort(compareEnemyDecisions);
  candidates.forEach((candidate, index) => {
    candidate.plan.decisionOrder = index;
  });
  return {
    candidates,
    diagnostics: enumeration.diagnostics || [],
    evaluatedCount: previews.length
  };
}

function buildPlayerResponses(
  snapshot,
  priorSteps,
  rootContext,
  limit
) {
  if (snapshot.result) return [];
  const enumeration = rootContext.deps.enumerate(
    snapshot,
    snapshot.player.unitId
  );
  const responses = enumeration.plans.map((plan) => {
    const simulation = rootContext.deps.simulate(snapshot, plan);
    const step = createBranchStep(
      "player",
      snapshot.player.unitId,
      null,
      null,
      snapshot,
      simulation.snapshot,
      simulation.settlementSummary
    );
    const branchSteps = [...priorSteps, step];
    return {
      plan,
      snapshot: simulation.snapshot,
      previewSnapshot: simulation.snapshot,
      settlementSummary: simulation.settlementSummary,
      step,
      score: evaluateRootBranch(
        rootContext,
        simulation.snapshot,
        branchSteps
      )
    };
  });
  responses.sort(comparePlayerResponses);
  const retained = capActionsPerDestination(responses, 2).slice(0, limit);
  rootContext.trace.playerResponseActionIds.push(
    ...retained.map((response) => response.plan.action.actionId)
  );
  return retained;
}

function evaluateRootBranch(context, leafSnapshot, branchSteps) {
  const rootActor = findBattleUnit(
    context.snapshot,
    context.actorUnitId
  );
  return context.deps.evaluate({
    rootActorUnitId: context.actorUnitId,
    rootIntent: context.rootGeneration.candidates[0].intent,
    rootProfileId: rootActor.profileId,
    rootBeforeSnapshot: context.snapshot,
    leafAfterSnapshot: leafSnapshot,
    branchSteps
  });
}

function deriveSearchFacts(snapshot, actor, profile, candidates, deps) {
  const phaseActionId = selectPhaseActionId(profile, actor);
  const lowHealth =
    actor.maxHp > 0 && actor.hp / actor.maxHp <= profile.lowHealthRatio;
  return {
    canFinish: candidates.some(
      (candidate) => candidate.settlementSummary.result === "defeat"
    ),
    hasPhaseAction: Boolean(
      phaseActionId &&
        candidates.some(
          (candidate) =>
            candidate.plan.action.actionId === phaseActionId
        )
    ),
    shouldDefend:
      lowHealth && playerHasPublicKill(snapshot, actor.unitId, deps),
    shouldConserve:
      actor.maxEssence > 0 &&
      actor.essence / actor.maxEssence <= profile.lowEssenceRatio &&
      candidates.some(
        (candidate) =>
          candidate.plan.essenceCost === 0 &&
          isEffectiveCandidate(candidate)
      ),
    hasEffectiveAttack: candidates.some(isEffectiveCandidate)
  };
}

function playerHasPublicKill(snapshot, enemyUnitId, deps) {
  const enumeration = deps.enumerate(snapshot, snapshot.player.unitId);
  return enumeration.plans.some((plan) => {
    const simulation = deps.simulate(snapshot, plan);
    return findBattleUnit(simulation.snapshot, enemyUnitId).hp <= 0;
  });
}

function isEffectiveCandidate(candidate) {
  return (
    candidate.settlementSummary.hpChanges.some(
      (change) => change.delta < 0
    ) ||
    candidate.settlementSummary.appliedStatuses.some(
      (status) => (status.aiControlValue || 0) > 0
    )
  );
}

function selectPhaseActionId(profile, actor) {
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

function remainingEnemyUnitIds(snapshot, actorUnitId) {
  const actorIndex = snapshot.enemyUnitOrder.indexOf(actorUnitId);
  if (actorIndex < 0) {
    throw new Error(`${actorUnitId} is absent from enemyUnitOrder`);
  }
  return snapshot.enemyUnitOrder
    .slice(actorIndex + 1)
    .filter((unitId) => findBattleUnit(snapshot, unitId).hp > 0);
}

function capActionsPerDestination(candidates, cap) {
  const counts = new Map();
  const retained = [];
  for (const candidate of candidates) {
    const destination = candidate.plan.destination;
    const key = `${destination.x},${destination.y}`;
    const count = counts.get(key) || 0;
    if (count >= cap) continue;
    counts.set(key, count + 1);
    retained.push(candidate);
  }
  return retained;
}

function createBranchStep(
  side,
  actorUnitId,
  intent,
  profileId,
  beforeSnapshot,
  afterSnapshot,
  settlementSummary
) {
  return {
    side,
    actorUnitId,
    intent,
    profileId,
    beforeSnapshot,
    afterSnapshot,
    settlementSummary
  };
}

function withSearchScore(candidate, score) {
  return {
    ...candidate,
    localScore: candidate.localScore ?? candidate.score,
    score
  };
}

function deterministicResult(orderedCandidates) {
  return {
    selected: orderedCandidates[0],
    orderedCandidates,
    choiceIndex: 0,
    consumedRandom: false,
    roll: null
  };
}

function createTrace() {
  return {
    rootWidth: 0,
    maxAllyWidth: 0,
    maxPlayerWidth: 0,
    maxFollowUpWidth: 0,
    leafCount: 0,
    branchActorOrders: [],
    playerResponseActionIds: []
  };
}

function recordLeaf(trace, branchSteps) {
  trace.leafCount += 1;
  trace.branchActorOrders.push(
    branchSteps.map((step) => step.actorUnitId)
  );
}

function resolveActiveEnemy(snapshot) {
  if (
    snapshot.activeEnemyUnitId &&
    findBattleUnit(snapshot, snapshot.activeEnemyUnitId).hp > 0
  ) {
    return snapshot.activeEnemyUnitId;
  }
  const next = snapshot.enemyUnitOrder.find(
    (unitId) => findBattleUnit(snapshot, unitId).hp > 0
  );
  if (!next) throw new Error("enemy phase has no living enemy");
  return next;
}

function resolveDependencies(dependencies) {
  for (const key of Object.keys(dependencies)) {
    if (
      ![
        "enumerate",
        "simulate",
        "evaluate",
        "resolveIntent",
        "random"
      ].includes(key)
    ) {
      throw new Error(`unsupported battle search dependency: ${key}`);
    }
  }
  return {
    enumerate:
      dependencies.enumerate ?? enumerateLegalTurnPlans,
    simulate: dependencies.simulate ?? simulateTurnPlan,
    evaluate: dependencies.evaluate ?? evaluateBattleState,
    resolveIntent:
      dependencies.resolveIntent ?? resolveBattleIntent,
    random: dependencies.random ?? deterministicRandom
  };
}

export function assertDifficultyId(difficultyId) {
  if (!DIFFICULTIES.has(difficultyId)) {
    throw new Error(`unknown battle AI difficulty: ${difficultyId}`);
  }
  return difficultyId;
}
