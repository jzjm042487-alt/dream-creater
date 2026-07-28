import assert from "node:assert/strict";
import test from "node:test";

import { getProfile } from "../src/game/battle/content.js";
import { chooseEnemyPlan } from "../src/game/battle/search.js";

test("beginner and standard use exact destination caps and root-only search", () => {
  const beginnerHarness = makeHarness();
  const beginner = chooseEnemyPlan(
    makeFakeSnapshot("ai_difficulty_beginner"),
    beginnerHarness.dependencies
  );
  assert.equal(beginner.consumedRandom, true);
  assert.equal(beginner.choiceIndex, 1);
  assert.equal(beginner.trace.leafCount, 10);
  assert.equal(beginner.trace.rootWidth, 10);
  assert.equal(maximumDestinationCount(beginner.orderedCandidates), 2);

  const standardHarness = makeHarness();
  const standard = chooseEnemyPlan(
    makeFakeSnapshot("ai_difficulty_standard"),
    standardHarness.dependencies
  );
  assert.equal(standard.consumedRandom, false);
  assert.equal(standard.choiceIndex, 0);
  assert.equal(standard.trace.leafCount, 10);
  assert.equal(maximumDestinationCount(standard.orderedCandidates), 3);
});

test("hard expands 8 roots by 6 player responses after remaining enemies", () => {
  const harness = makeHarness();
  const result = chooseEnemyPlan(
    makeFakeSnapshot("ai_difficulty_hard", {
      enemyCount: 2,
      activeEnemyIndex: 0
    }),
    harness.dependencies
  );

  assert.equal(result.trace.rootWidth, 8);
  assert.equal(result.trace.leafCount, 48);
  assert.equal(result.trace.maxPlayerWidth, 6);
  assert.equal(result.trace.maxAllyWidth, 1);
  assert.ok(
    result.trace.branchActorOrders.every(
      (order) =>
        order.indexOf("enemy-2") >= 0 &&
        order.indexOf("enemy-2") < order.indexOf("player")
    )
  );
});

test("prodigy uses exact 1v1 and 1v2 bounded search shapes", () => {
  const oneOnOne = chooseEnemyPlan(
    makeFakeSnapshot("ai_difficulty_prodigy"),
    makeHarness().dependencies
  );
  assert.deepEqual(
    pickShape(oneOnOne.trace),
    {
      rootWidth: 8,
      maxAllyWidth: 0,
      maxPlayerWidth: 6,
      maxFollowUpWidth: 6,
      leafCount: 288
    }
  );

  const firstOfTwo = chooseEnemyPlan(
    makeFakeSnapshot("ai_difficulty_prodigy", {
      enemyCount: 2,
      activeEnemyIndex: 0
    }),
    makeHarness().dependencies
  );
  assert.deepEqual(
    pickShape(firstOfTwo.trace),
    {
      rootWidth: 5,
      maxAllyWidth: 5,
      maxPlayerWidth: 6,
      maxFollowUpWidth: 0,
      leafCount: 150
    }
  );
  assert.ok(
    firstOfTwo.trace.branchActorOrders.every(
      (order) =>
        order.indexOf("enemy-2") >= 0 &&
        order.indexOf("enemy-2") < order.indexOf("player")
    )
  );

  const secondOfTwo = chooseEnemyPlan(
    makeFakeSnapshot("ai_difficulty_prodigy", {
      enemyCount: 2,
      activeEnemyIndex: 1
    }),
    makeHarness().dependencies
  );
  assert.deepEqual(
    pickShape(secondOfTwo.trace),
    {
      rootWidth: 5,
      maxAllyWidth: 0,
      maxPlayerWidth: 6,
      maxFollowUpWidth: 0,
      leafCount: 30
    }
  );
});

test("terminal branches exit before later actors and time budgets are rejected", () => {
  const harness = makeHarness({ terminalRootIndex: 9 });
  const result = chooseEnemyPlan(
    makeFakeSnapshot("ai_difficulty_prodigy"),
    harness.dependencies
  );
  assert.ok(result.trace.leafCount < 288);

  assert.throws(
    () =>
      chooseEnemyPlan(makeFakeSnapshot("ai_difficulty_standard"), {
        ...makeHarness().dependencies,
        timeBudgetMs: 5
      }),
    /time budget/i
  );
});

test("hard and prodigy retain legal retreat among predicted player responses", () => {
  for (const difficultyId of [
    "ai_difficulty_hard",
    "ai_difficulty_prodigy"
  ]) {
    const result = chooseEnemyPlan(
      makeFakeSnapshot(difficultyId),
      makeHarness({ includeRetreat: true }).dependencies
    );
    assert.ok(
      result.trace.playerResponseActionIds.includes(
        "battle_action_retreat"
      )
    );
  }
});

function makeHarness(options = {}) {
  const calls = {
    enumeratedActors: [],
    evaluatedContexts: []
  };
  const dependencies = {
    enumerate(snapshot, actorUnitId) {
      calls.enumeratedActors.push(actorUnitId);
      const plans = [];
      for (let index = 0; index < 10; index += 1) {
        const destinationIndex = Math.floor(index / 4);
        const isRetreat =
          options.includeRetreat &&
          actorUnitId === "player" &&
          index === 9;
        plans.push({
          actorUnitId,
          destination: {
            x: destinationIndex,
            y: actorUnitId === "player" ? 1 : 0
          },
          path: [[0, 0]],
          action: {
            type: isRetreat ? "retreat" : "skill",
            actionId: isRetreat
              ? "battle_action_retreat"
              : `${actorUnitId}-action-${index}`,
            targetUnitId:
              actorUnitId === "player"
                ? snapshot.activeEnemyUnitId
                : "player",
            targetCell: null
          },
          pathCost: destinationIndex,
          essenceCost: index % 3,
          canonicalKey: `${actorUnitId}-${String(index).padStart(2, "0")}`,
          enumerationOrder: index,
          decisionOrder: null
        });
      }
      return { plans, diagnostics: [] };
    },
    simulate(snapshot, plan) {
      const next = structuredClone(snapshot);
      const actionIndex =
        plan.action.actionId === "battle_action_retreat"
          ? 9
          : Number(plan.action.actionId.split("-").at(-1));
      next.debugActionIndexes = [
        ...(next.debugActionIndexes || []),
        actionIndex
      ];
      next.debugActorOrder = [
        ...(next.debugActorOrder || []),
        plan.actorUnitId
      ];
      if (
        plan.actorUnitId !== "player" &&
        actionIndex === options.terminalRootIndex &&
        (next.debugActorOrder?.length || 0) === 1
      ) {
        next.result = "defeat";
      }
      return {
        snapshot: next,
        settlementSummary: {
          actionId: plan.action.actionId,
          actionCategory: "damage",
          declaredCategory: "damage",
          hpChanges: [{ unitId: plan.action.targetUnitId, delta: -1 }],
          essenceChanges: [],
          appliedStatuses: [],
          removedStatuses: [],
          cooldownChanges: [],
          result: next.result
        }
      };
    },
    evaluate(context) {
      calls.evaluatedContexts.push(context);
      return context.branchSteps.reduce((score, step) => {
        const index =
          step.settlementSummary.actionId === "battle_action_retreat"
            ? 9
            : Number(
                step.settlementSummary.actionId.split("-").at(-1)
              );
        return score + (step.side === "enemy" ? index : -index);
      }, 0);
    },
    resolveIntent() {
      return "attack";
    },
    random() {
      return 0.7;
    }
  };
  return { calls, dependencies };
}

function makeFakeSnapshot(
  difficultyId,
  { enemyCount = 1, activeEnemyIndex = 0 } = {}
) {
  const profile = getProfile("ai_profile_duelist");
  const enemies = Array.from({ length: enemyCount }, (_, index) => ({
    unitId: `enemy-${index + 1}`,
    side: "enemy",
    profileId: profile.id,
    position: { x: index, y: 0 },
    hp: 40,
    maxHp: 40,
    essence: 10,
    maxEssence: 10,
    move: 3,
    strength: 20,
    perception: 20,
    physicalDefense: 1,
    guDefense: 1,
    statuses: [],
    cooldowns: [],
    actionIds: [],
    publicItemActions: []
  }));
  return {
    battleId: "B-SEARCH-TEST",
    round: 1,
    phase: "enemy",
    result: null,
    board: { width: 8, height: 6, blockedCells: [] },
    player: {
      unitId: "player",
      side: "player",
      position: { x: 7, y: 5 },
      hp: 40,
      maxHp: 40,
      essence: 10,
      maxEssence: 10,
      move: 3,
      strength: 20,
      perception: 20,
      physicalDefense: 1,
      guDefense: 1,
      statuses: [],
      cooldowns: [],
      actionIds: [],
      revealedActionIds: [],
      publicItemActions: []
    },
    enemies,
    enemyUnitOrder: enemies.map((enemy) => enemy.unitId),
    activeEnemyUnitId: enemies[activeEnemyIndex].unitId,
    recentActionCategoriesByUnitId: Object.fromEntries(
      enemies.map((enemy) => [enemy.unitId, []])
    ),
    difficultyId,
    aiSeed: "abc",
    aiCursor: 0,
    decisionIndex: 0,
    content: {
      actions: {},
      profiles: { [profile.id]: profile }
    }
  };
}

function maximumDestinationCount(candidates) {
  const counts = new Map();
  for (const candidate of candidates) {
    const key = `${candidate.plan.destination.x},${candidate.plan.destination.y}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Math.max(...counts.values());
}

function pickShape(trace) {
  return {
    rootWidth: trace.rootWidth,
    maxAllyWidth: trace.maxAllyWidth,
    maxPlayerWidth: trace.maxPlayerWidth,
    maxFollowUpWidth: trace.maxFollowUpWidth,
    leafCount: trace.leafCount
  };
}
