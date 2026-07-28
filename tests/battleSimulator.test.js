import assert from "node:assert/strict";
import test from "node:test";

import { getAction, getEncounter } from "../src/game/battle/content.js";
import { enumerateLegalTurnPlans } from "../src/game/battle/legalPlans.js";
import {
  applyDefendReduction,
  calculateDamage,
  classifyCommittedPlan,
  resolveBattleResult,
  simulateTurnPlan
} from "../src/game/battle/simulator.js";
import { createBattleState } from "../src/game/battle/state.js";

test("physical, Gu, fixed, floor, and minimum damage use one formula", () => {
  const actor = { strength: 20, perception: 30, statuses: [] };
  const target = { physicalDefense: 1, guDefense: 1, statuses: [] };

  assert.equal(
    calculateDamage(actor, target, getAction("battle_action_basic_melee")),
    6
  );
  assert.equal(
    calculateDamage(actor, target, getAction("battle_action_moonblade")),
    14
  );
  assert.equal(
    calculateDamage(actor, target, getAction("battle_action_boss_pounce")),
    13
  );
  assert.equal(
    calculateDamage(
      { strength: 0, perception: 0, statuses: [] },
      { physicalDefense: 99, guDefense: 99, statuses: [] },
      getAction("battle_action_basic_melee")
    ),
    1
  );
  assert.equal(applyDefendReduction(7), 3);
  assert.equal(applyDefendReduction(1), 1);
});

test("legal attacks always hit without consulting a random source", () => {
  const state = adjacentState();
  const attack = planFor(
    state,
    "player",
    "battle_action_basic_melee",
    "B-D10-01.enemy.1"
  );
  const originalRandom = Math.random;
  Math.random = () => {
    throw new Error("random source must not be used");
  };

  try {
    const result = simulateTurnPlan(state, attack);
    assert.equal(result.snapshot.enemies[0].hp, 35);
  } finally {
    Math.random = originalRandom;
  }
});

test("defend halves one positive incoming hit and is then consumed", () => {
  let state = adjacentState();
  const defend = planFor(state, "player", "battle_action_defend");
  state = simulateTurnPlan(state, defend).snapshot;

  assert.deepEqual(state.player.statuses, [
    {
      statusId: "battle_status_defending",
      duration: "scene",
      consumeOn: "nextIncomingDamage",
      aiControlValue: 0
    }
  ]);

  const attack = planFor(
    state,
    "B-D10-01.enemy.1",
    "battle_action_enemy_melee_light",
    "player"
  );
  state = simulateTurnPlan(state, attack).snapshot;

  assert.equal(state.player.hp, 35);
  assert.equal(
    state.player.statuses.some(
      (status) => status.statusId === "battle_status_defending"
    ),
    false
  );
});

test("Jade Skin and Shell Guard apply modifiers for exact owner activations", () => {
  let state = adjacentState();
  state.player.actionIds = [
    "battle_action_jade_skin",
    "battle_action_pass"
  ];
  const jade = planFor(state, "player", "battle_action_jade_skin");
  state = simulateTurnPlan(state, jade).snapshot;

  assert.equal(state.player.essence, 16);
  assert.deepEqual(state.player.cooldowns, [
    { actionId: "battle_action_jade_skin", remainingTurns: 2 }
  ]);
  assert.equal(state.player.statuses[0].remainingTurns, 2);
  assert.equal(
    calculateDamage(
      state.enemies[0],
      state.player,
      getAction("battle_action_basic_melee")
    ),
    4
  );

  state = simulateTurnPlan(
    state,
    planFor(state, "player", "battle_action_pass")
  ).snapshot;
  assert.equal(state.player.statuses[0].remainingTurns, 1);
  assert.equal(state.player.cooldowns[0].remainingTurns, 1);

  state = simulateTurnPlan(
    state,
    planFor(state, "player", "battle_action_pass")
  ).snapshot;
  assert.deepEqual(state.player.statuses, []);
  assert.deepEqual(state.player.cooldowns, []);
});

test("gather force enables and is consumed by fixed-damage pounce", () => {
  let state = adjacentState();
  state.enemies[0].actionIds = [
    "battle_action_boss_gather_force",
    "battle_action_boss_pounce",
    "battle_action_pass"
  ];
  state.enemies[0].essence = 10;
  state.enemies[0].maxEssence = 10;

  assert.throws(
    () =>
      simulateTurnPlan(
        state,
        manualPlan(
          state.enemies[0],
          "battle_action_boss_pounce",
          state.player
        )
      ),
    /requires status battle_status_gathering_force/
  );

  const gather = planFor(
    state,
    "B-D10-01.enemy.1",
    "battle_action_boss_gather_force"
  );
  state = simulateTurnPlan(state, gather).snapshot;
  assert.equal(
    state.enemies[0].statuses[0].statusId,
    "battle_status_gathering_force"
  );

  const pounce = planFor(
    state,
    "B-D10-01.enemy.1",
    "battle_action_boss_pounce",
    "player"
  );
  state = simulateTurnPlan(state, pounce).snapshot;
  assert.equal(state.player.hp, 27);
  assert.equal(
    state.enemies[0].statuses.some(
      (status) => status.statusId === "battle_status_gathering_force"
    ),
    false
  );
});

test("public item use decrements once and healing clamps to maximum", () => {
  const state = adjacentState();
  state.player.hp = 35;
  state.player.actionIds = ["battle_action_vitality_leaf"];
  state.player.publicItemActions = [
    { actionId: "battle_action_vitality_leaf", remainingUses: 1 }
  ];

  const plan = planFor(state, "player", "battle_action_vitality_leaf");
  const result = simulateTurnPlan(state, plan);

  assert.equal(result.snapshot.player.hp, 40);
  assert.deepEqual(result.snapshot.player.publicItemActions, [
    { actionId: "battle_action_vitality_leaf", remainingUses: 0 }
  ]);
  assert.deepEqual(result.settlementSummary.hpChanges, [
    { unitId: "player", before: 35, after: 40, delta: 5 }
  ]);
});

test("committed action category follows damage-control-defend-move-pass priority", () => {
  const before = adjacentState();
  const movedAfter = structuredClone(before);
  movedAfter.player.position = { x: 4, y: 3 };
  const basePlan = manualPlan(
    before.player,
    "battle_action_pass",
    null,
    { x: 4, y: 3 }
  );

  assert.equal(
    classifyCommittedPlan(before, movedAfter, basePlan, {
      hpChanges: [{ unitId: "B-D10-01.enemy.1", before: 10, after: 5, delta: -5 }],
      appliedStatuses: []
    }),
    "damage"
  );
  assert.equal(
    classifyCommittedPlan(before, movedAfter, basePlan, {
      hpChanges: [],
      appliedStatuses: [{ statusId: "test_control", aiControlValue: 20 }]
    }),
    "control"
  );
  assert.equal(
    classifyCommittedPlan(
      before,
      movedAfter,
      {
        ...basePlan,
        action: { ...basePlan.action, type: "defend" }
      },
      { hpChanges: [], appliedStatuses: [] }
    ),
    "defend"
  );
  assert.equal(
    classifyCommittedPlan(before, movedAfter, basePlan, {
      hpChanges: [],
      appliedStatuses: []
    }),
    "reposition"
  );
  assert.equal(
    classifyCommittedPlan(before, before, basePlan, {
      hpChanges: [],
      appliedStatuses: []
    }),
    "pass"
  );
});

test("terminal result order gives simultaneous zero to the player", () => {
  const state = adjacentState();
  assert.equal(resolveBattleResult(state), null);

  const enemiesDead = structuredClone(state);
  enemiesDead.enemies[0].hp = 0;
  assert.equal(resolveBattleResult(enemiesDead), "victory");

  const playerDead = structuredClone(state);
  playerDead.player.hp = 0;
  assert.equal(resolveBattleResult(playerDead), "defeat");

  const bothDead = structuredClone(playerDead);
  bothDead.enemies[0].hp = 0;
  assert.equal(resolveBattleResult(bothDead), "victory");
  assert.equal(resolveBattleResult(state, true), "retreat");
});

test("simulation does not mutate its battle input or unrelated save state", () => {
  const state = adjacentState();
  const persistent = { untouched: { value: 7 } };
  const stateBefore = structuredClone(state);
  const persistentBefore = structuredClone(persistent);
  const plan = planFor(
    state,
    "player",
    "battle_action_basic_melee",
    "B-D10-01.enemy.1"
  );

  simulateTurnPlan(state, plan);

  assert.deepEqual(state, stateBefore);
  assert.deepEqual(persistent, persistentBefore);
});

function adjacentState() {
  const state = createBattleState({
    encounter: getEncounter("B-D10-01"),
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
        "battle_action_pass"
      ],
      publicItemActions: []
    },
    difficultyId: "ai_difficulty_standard",
    aiSeed: "1234abcd",
    serial: 0,
    returnScene: { id: "world", entrance: "default" }
  });
  state.player.position = { x: 5, y: 3 };
  return state;
}

function planFor(state, actorUnitId, actionId, targetUnitId = null) {
  const actor =
    actorUnitId === state.player.unitId
      ? state.player
      : state.enemies.find((unit) => unit.unitId === actorUnitId);
  const result = enumerateLegalTurnPlans(state, actorUnitId, { rawCap: 1024 });
  const action = getAction(actionId);
  const expectedTargetUnitId =
    action.targetSide === "self" && action.type !== "pass"
      ? actorUnitId
      : targetUnitId;
  const plan = result.plans.find(
    (candidate) =>
      candidate.action.actionId === actionId &&
      candidate.action.targetUnitId === expectedTargetUnitId &&
      candidate.destination.x === actor.position.x &&
      candidate.destination.y === actor.position.y
  );
  assert.ok(
    plan,
    `missing plan ${actorUnitId} ${actionId} ${expectedTargetUnitId ?? ""}`
  );
  return plan;
}

function manualPlan(actor, actionId, target, destination = actor.position) {
  const action = getAction(actionId);
  return {
    actorUnitId: actor.unitId,
    destination: { ...destination },
    path: [[actor.position.x, actor.position.y], ...(destination.x === actor.position.x && destination.y === actor.position.y ? [] : [[destination.x, destination.y]])],
    action: {
      type: action.type,
      actionId,
      targetUnitId: target?.unitId ?? null,
      targetCell: target ? { ...target.position } : null
    },
    pathCost:
      Math.abs(destination.x - actor.position.x) +
      Math.abs(destination.y - actor.position.y),
    essenceCost: action.essenceCost,
    canonicalKey: "manual"
  };
}
