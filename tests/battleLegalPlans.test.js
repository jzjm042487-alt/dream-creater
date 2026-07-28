import assert from "node:assert/strict";
import test from "node:test";

import {
  getAction,
  getEncounter
} from "../src/game/battle/content.js";
import {
  enumerateLegalTurnPlans,
  makeCanonicalPlanKey
} from "../src/game/battle/legalPlans.js";
import { isActionTargetInRange } from "../src/game/battle/ranges.js";
import { createBattleState } from "../src/game/battle/state.js";

test("range templates and line blockers use exact grid semantics", () => {
  const openBoard = { width: 8, height: 6, blockedCells: [] };
  const from = { x: 1, y: 1 };

  assert.equal(
    isActionTargetInRange(
      getAction("battle_action_basic_melee"),
      openBoard,
      [],
      from,
      { x: 2, y: 1 }
    ),
    true
  );
  assert.equal(
    isActionTargetInRange(
      getAction("battle_action_enemy_ranged_strike"),
      openBoard,
      [],
      from,
      { x: 3, y: 2 }
    ),
    true
  );
  assert.equal(
    isActionTargetInRange(
      getAction("battle_action_moonblade"),
      openBoard,
      [],
      from,
      { x: 4, y: 1 }
    ),
    true
  );
  assert.equal(
    isActionTargetInRange(
      getAction("battle_action_moonblade"),
      { width: 8, height: 6, blockedCells: [{ x: 3, y: 1 }] },
      [],
      from,
      { x: 4, y: 1 }
    ),
    false
  );
  assert.equal(
    isActionTargetInRange(
      getAction("battle_action_moonblade"),
      openBoard,
      [{ x: 2, y: 1 }],
      from,
      { x: 4, y: 1 }
    ),
    false
  );

  const radius = {
    ...getAction("battle_action_basic_melee"),
    range: {
      kind: "radius1",
      minimum: 0,
      maximum: 1,
      blockedByUnits: false
    }
  };
  assert.equal(isActionTargetInRange(radius, openBoard, [], from, from), true);
  assert.equal(
    isActionTargetInRange(radius, openBoard, [], from, { x: 2, y: 2 }),
    false
  );
  assert.equal(
    isActionTargetInRange(
      getAction("battle_action_defend"),
      openBoard,
      [],
      from,
      from
    ),
    true
  );
});

test("battle state resolves variants and initializes deterministic public fields", () => {
  const state = createBattleState({
    encounter: getEncounter("B-D24-01"),
    entryVariantId: "default",
    playerEntry: playerEntry(),
    difficultyId: "ai_difficulty_standard",
    aiSeed: "1234abcd",
    serial: 7,
    returnScene: { id: "world", entrance: "ridge" }
  });

  assert.equal(state.round, 1);
  assert.equal(state.phase, "player");
  assert.equal(state.result, null);
  assert.equal(state.serial, 7);
  assert.deepEqual(state.player.position, { x: 1, y: 3 });
  assert.equal(state.activeEnemyUnitId, null);
  assert.deepEqual(state.enemyUnitOrder, ["B-D24-01.enemy.1"]);
  assert.deepEqual(state.player.statuses, []);
  assert.deepEqual(state.player.cooldowns, []);
  assert.deepEqual(state.recentActionCategoriesByUnitId, {
    "B-D24-01.enemy.1": []
  });
  assert.deepEqual(state.player.revealedActionIds, [
    "battle_action_basic_melee",
    "battle_action_defend"
  ]);
  assert.equal(state.aiCursor, 0);
  assert.equal(state.decisionIndex, 0);
  assert.equal(Object.isFrozen(state.content.actions.battle_action_basic_melee), true);

  assert.throws(
    () =>
      createBattleState({
        encounter: getEncounter("B-Q02-01"),
        entryVariantId: "direct_retreat",
        playerEntry: playerEntry(),
        difficultyId: "ai_difficulty_standard",
        aiSeed: "1234abcd",
        serial: 8,
        returnScene: { id: "world", entrance: "ridge" }
      }),
    /direct-result variant direct_retreat does not create a battle/
  );
  assert.throws(
    () => getAction("battle_action_missing"),
    /unknown battle action id: battle_action_missing/
  );
});

test("legal plans contain one canonical movement and exactly one legal action", () => {
  const state = createState("B-D10-01");
  const result = enumerateLegalTurnPlans(state, "player");

  assert.equal(result.plans.length > 0, true);
  for (const plan of result.plans) {
    assert.deepEqual(plan.path[0], [state.player.position.x, state.player.position.y]);
    assert.deepEqual(plan.path.at(-1), [plan.destination.x, plan.destination.y]);
    assert.equal(plan.pathCost, plan.path.length - 1);
    assert.equal(typeof plan.action.actionId, "string");
    assert.equal(plan.canonicalKey, makeCanonicalPlanKey(plan));
  }
  assert.deepEqual(
    result.plans.map((plan) => plan.enumerationOrder),
    result.plans.map((_, index) => index)
  );
});

test("essence, cooldown, status, target side, and item uses gate candidates", () => {
  const state = structuredClone(createState("B-D24-01"));
  state.player.position = { x: 5, y: 3 };
  state.player.essence = 5;
  state.player.actionIds = [
    "battle_action_moonblade",
    "battle_action_boss_gather_force",
    "battle_action_boss_pounce",
    "battle_action_vitality_leaf"
  ];
  state.player.cooldowns = [
    { actionId: "battle_action_moonblade", remainingTurns: 1 }
  ];
  state.player.statuses = [
    {
      statusId: "battle_status_gathering_force",
      duration: "turns",
      remainingTurns: 1
    }
  ];
  state.player.publicItemActions = [
    { actionId: "battle_action_vitality_leaf", remainingUses: 0 }
  ];

  let result = enumerateLegalTurnPlans(state, "player");
  const actionIds = new Set(result.plans.map((plan) => plan.action.actionId));
  assert.equal(actionIds.has("battle_action_moonblade"), false);
  assert.equal(actionIds.has("battle_action_boss_gather_force"), false);
  assert.equal(actionIds.has("battle_action_boss_pounce"), true);
  assert.equal(actionIds.has("battle_action_vitality_leaf"), false);
  assert.equal(
    result.plans
      .filter((plan) => plan.action.actionId === "battle_action_boss_pounce")
      .every((plan) => plan.action.targetUnitId === "B-D24-01.enemy.1"),
    true
  );

  state.player.essence = 4;
  state.player.statuses = [];
  state.player.publicItemActions[0].remainingUses = 1;
  result = enumerateLegalTurnPlans(state, "player");
  const nextActionIds = new Set(result.plans.map((plan) => plan.action.actionId));
  assert.equal(nextActionIds.has("battle_action_boss_pounce"), false);
  assert.equal(nextActionIds.has("battle_action_boss_gather_force"), true);
  assert.equal(nextActionIds.has("battle_action_vitality_leaf"), true);
});

test("retreat uses only reachable edge cells and pass is an explicit fallback", () => {
  const playerState = createState("B-D10-01");
  const playerPlans = enumerateLegalTurnPlans(playerState, "player").plans;
  const retreats = playerPlans.filter(
    (plan) => plan.action.actionId === "battle_action_retreat"
  );
  assert.equal(retreats.length > 0, true);
  assert.equal(
    retreats.every(({ destination }) =>
      destination.x === 0 ||
      destination.x === 7 ||
      destination.y === 0 ||
      destination.y === 5
    ),
    true
  );

  const enemyState = structuredClone(createState("B-D10-01"));
  enemyState.enemies[0].move = 0;
  enemyState.enemies[0].actionIds = ["battle_action_basic_melee"];
  const fallback = enumerateLegalTurnPlans(
    enemyState,
    "B-D10-01.enemy.1"
  ).plans;

  assert.equal(fallback.length, 1);
  assert.equal(fallback[0].action.actionId, "battle_action_pass");
  assert.equal(fallback[0].canonicalKey, "3,6,,5,battle_action_pass,,,");
});

test("raw candidate cap truncates enumeration order with a development diagnostic", () => {
  const state = structuredClone(createState("B-D10-01"));
  const actions = {};
  const actionIds = [];
  for (let index = 0; index < 10; index += 1) {
    const id = `test_defend_${String(index).padStart(2, "0")}`;
    actionIds.push(id);
    actions[id] = {
      id,
      type: "defend",
      category: "defend",
      targetSide: "self",
      range: { kind: "self", minimum: 0, maximum: 0, blockedByUnits: false },
      essenceCost: 0,
      cooldownTurns: 0,
      aiUtilityAdjustment: 0
    };
  }
  state.player.actionIds = actionIds;
  state.player.move = 20;
  state.content.actions = actions;

  const result = enumerateLegalTurnPlans(state, "player", { rawCap: 256 });
  assert.equal(result.plans.length, 256);
  assert.deepEqual(result.diagnostics, [
    {
      type: "development-cap",
      code: "candidate_cap_truncated",
      rawCount: 450,
      cap: 256
    }
  ]);
  assert.equal(
    result.diagnostics.some((entry) => entry.code === "ai_no_legal_plan"),
    false
  );
});

function createState(battleId) {
  return createBattleState({
    encounter: getEncounter(battleId),
    entryVariantId: "default",
    playerEntry: playerEntry(),
    difficultyId: "ai_difficulty_standard",
    aiSeed: "1234abcd",
    serial: 0,
    returnScene: { id: "world", entrance: "default" }
  });
}

function playerEntry() {
  return {
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
      "battle_action_moonblade",
      "battle_action_defend",
      "battle_action_retreat",
      "battle_action_pass"
    ],
    publicItemActions: []
  };
}
