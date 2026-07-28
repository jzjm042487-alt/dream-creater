import assert from "node:assert/strict";
import test from "node:test";

import {
  advanceEnemyPhase,
  commitEnemyDecision,
  commitPlayerPlan
} from "../src/game/battle/controller.js";
import { getEncounter } from "../src/game/battle/content.js";
import { enumerateLegalTurnPlans } from "../src/game/battle/legalPlans.js";
import { createAiSnapshot } from "../src/game/battle/snapshot.js";
import { createBattleState } from "../src/game/battle/state.js";

test("player commits one move-plus-action before enemy phase starts", () => {
  const state = makeState("B-D10-01");
  const { plans } = enumerateLegalTurnPlans(state, state.player.unitId);
  const plan = plans.find(
    (candidate) =>
      candidate.action.actionId === "battle_action_defend" &&
      candidate.pathCost === 1
  );
  const before = structuredClone(state);
  const committed = commitPlayerPlan(state, plan);

  assert.deepEqual(state, before);
  assert.equal(committed.state.phase, "enemy");
  assert.equal(
    committed.state.activeEnemyUnitId,
    state.enemyUnitOrder[0]
  );
  assert.deepEqual(committed.state.player.position, plan.destination);
  assert.ok(
    committed.state.player.statuses.some(
      (status) => status.statusId === "battle_status_defending"
    )
  );
});

test("enemy phase uses authored order, skips dead units, and reads prior commits", () => {
  const state = makeState("B-D26-01", {
    phase: "enemy",
    activeEnemyUnitId: "B-D26-01.enemy.1"
  });
  const observed = [];
  const result = advanceEnemyPhase(state, {
    choose(snapshot) {
      observed.push(structuredClone(snapshot));
      return deterministicDecision(snapshot);
    }
  });

  assert.equal(observed.length, 2);
  assert.equal(
    observed[0].activeEnemyUnitId,
    "B-D26-01.enemy.1"
  );
  assert.equal(
    observed[1].activeEnemyUnitId,
    "B-D26-01.enemy.2"
  );
  assert.deepEqual(
    observed[1].enemies[0].position,
    result.summaries[0].afterPosition
  );
  assert.equal(result.state.phase, "player");
  assert.equal(result.state.round, 2);

  const withDeadFirst = makeState("B-D26-01", {
    phase: "enemy",
    activeEnemyUnitId: "B-D26-01.enemy.1"
  });
  withDeadFirst.enemies[0].hp = 0;
  const seen = [];
  advanceEnemyPhase(withDeadFirst, {
    choose(snapshot) {
      seen.push(snapshot.activeEnemyUnitId);
      return deterministicDecision(snapshot);
    }
  });
  assert.deepEqual(seen, ["B-D26-01.enemy.2"]);
});

test("standard revalidates once and falls through the existing ordering", () => {
  const state = makeState("B-D10-01", {
    phase: "enemy",
    activeEnemyUnitId: "B-D10-01.enemy.1"
  });
  const legal = enumerateLegalTurnPlans(
    createAiSnapshot(state),
    state.activeEnemyUnitId
  ).plans;
  const valid = legal[0];
  const invalid = invalidPlan(valid);
  let chooseCalls = 0;

  const result = commitEnemyDecision(state, {
    choose() {
      chooseCalls += 1;
      return decisionResult([invalid, valid], invalid, {
        consumedRandom: false
      });
    }
  });

  assert.equal(chooseCalls, 1);
  assert.equal(result.plan.canonicalKey, valid.canonicalKey);
  assert.equal(result.state.decisionIndex, 1);
  assert.equal(result.state.aiCursor, 0);
});

test("beginner remaps the same uncommitted roll and advances cursor once", () => {
  const state = makeState("B-D10-01", {
    phase: "enemy",
    activeEnemyUnitId: "B-D10-01.enemy.1",
    difficultyId: "ai_difficulty_beginner"
  });
  const legal = enumerateLegalTurnPlans(
    createAiSnapshot(state),
    state.activeEnemyUnitId
  ).plans.slice(0, 3);
  const invalid = invalidPlan(legal[0]);
  const ordered = [legal[0], invalid, legal[2]];

  const result = commitEnemyDecision(state, {
    choose() {
      return decisionResult(ordered, invalid, {
        consumedRandom: true,
        roll: 0.7,
        choiceIndex: 1
      });
    }
  });

  assert.equal(result.plan.canonicalKey, legal[2].canonicalKey);
  assert.equal(result.state.aiCursor, 1);
  assert.equal(result.state.decisionIndex, 1);
});

test("all invalid candidates commit origin pass and log only a diagnostic", () => {
  const state = makeState("B-D10-01", {
    phase: "enemy",
    activeEnemyUnitId: "B-D10-01.enemy.1"
  });
  const legal = enumerateLegalTurnPlans(
    createAiSnapshot(state),
    state.activeEnemyUnitId
  ).plans[0];
  const beforeDiagnostics = structuredClone(state.diagnostics);

  const result = commitEnemyDecision(state, {
    choose() {
      const invalid = invalidPlan(legal);
      return decisionResult([invalid], invalid, {
        consumedRandom: false
      });
    },
    revalidate() {
      return false;
    }
  });

  assert.equal(
    result.summary.actionId,
    "battle_action_pass"
  );
  assert.deepEqual(result.plan.destination, state.enemies[0].position);
  assert.equal(result.state.decisionIndex, 1);
  assert.deepEqual(result.state.diagnostics, beforeDiagnostics);
  assert.deepEqual(result.developmentLog, ["ai_no_legal_plan"]);
});

test("pathfinder failure permits only origin actions and never teleports", () => {
  const state = makeState("B-D10-01", {
    phase: "enemy",
    activeEnemyUnitId: "B-D10-01.enemy.1"
  });
  state.enemies[0].position = { x: 2, y: 2 };
  state.player.position = { x: 3, y: 2 };

  const result = commitEnemyDecision(state, {
    choose() {
      throw new Error("pathfinder failed");
    }
  });

  assert.deepEqual(result.plan.destination, { x: 2, y: 2 });
  assert.equal(
    result.plan.action.actionId,
    "battle_action_enemy_melee_light"
  );
  assert.ok(
    result.summary.hpChanges.some(
      (change) => change.unitId === "player" && change.delta < 0
    )
  );
});

test("commits keep two categories and advance round only after final enemy", () => {
  let state = makeState("B-D26-01", {
    phase: "enemy",
    activeEnemyUnitId: "B-D26-01.enemy.1"
  });
  state.recentActionCategoriesByUnitId["B-D26-01.enemy.1"] = [
    "defend",
    "reposition"
  ];
  const first = commitEnemyDecision(state, {
    choose: deterministicDecision
  });
  assert.equal(first.state.round, 1);
  assert.equal(first.state.phase, "enemy");
  assert.equal(
    first.state.recentActionCategoriesByUnitId[
      "B-D26-01.enemy.1"
    ].length,
    2
  );

  const second = commitEnemyDecision(first.state, {
    choose: deterministicDecision
  });
  assert.equal(second.state.round, 2);
  assert.equal(second.state.phase, "player");
  assert.equal(second.state.decisionIndex, 2);
});

function makeState(battleId, overrides = {}) {
  const state = createBattleState({
    encounter: getEncounter(battleId),
    entryVariantId: "default",
    playerEntry: {
      unitId: "player",
      hp: 40,
      maxHealth: 40,
      essence: 20,
      maxEssence: 20,
      move: 3,
      strength: 20,
      perception: 30,
      physicalDefense: 1,
      guDefense: 1,
      actionIds: [
        "battle_action_basic_melee",
        "battle_action_defend",
        "battle_action_retreat"
      ],
      revealedActionIds: [
        "battle_action_basic_melee",
        "battle_action_defend"
      ],
      publicItemActions: []
    },
    difficultyId:
      overrides.difficultyId || "ai_difficulty_standard",
    aiSeed: "abc",
    serial: 0,
    returnScene: { id: "world", entrance: "default" }
  });
  Object.assign(state, overrides);
  return state;
}

function deterministicDecision(snapshot) {
  const { plans } = enumerateLegalTurnPlans(
    snapshot,
    snapshot.activeEnemyUnitId
  );
  return decisionResult(plans, plans[0], {
    consumedRandom: false
  });
}

function decisionResult(
  plans,
  selected,
  { consumedRandom, roll = null, choiceIndex = 0 }
) {
  return {
    plan: selected,
    orderedCandidates: plans.map((plan) => ({ plan })),
    consumedRandom,
    roll,
    choiceIndex,
    intent: "attack"
  };
}

function invalidPlan(plan) {
  return {
    ...structuredClone(plan),
    destination: { x: 99, y: 99 },
    canonicalKey: `invalid-${plan.canonicalKey}`
  };
}
