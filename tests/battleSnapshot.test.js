import assert from "node:assert/strict";
import test from "node:test";

import { getEncounter } from "../src/game/battle/content.js";
import { createAiSnapshot } from "../src/game/battle/snapshot.js";
import { createBattleState } from "../src/game/battle/state.js";

test("AI snapshot serializes only approved public player information", () => {
  const state = createBattleState({
    encounter: getEncounter("B-D24-01"),
    entryVariantId: "default",
    playerEntry: {
      unitId: "player",
      hp: 40,
      maxHealth: 40,
      essence: 18,
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
        "battle_action_vitality_leaf"
      ],
      revealedActionIds: ["battle_action_basic_melee"],
      publicItemActions: [
        { actionId: "battle_action_vitality_leaf", remainingUses: 1 }
      ],
      statuses: [
        {
          statusId: "battle_status_jade_skin",
          duration: "turns",
          remainingTurns: 2,
          aiControlValue: 0,
          physicalDefenseBonus: 3,
          guDefenseBonus: 2
        }
      ]
    },
    difficultyId: "ai_difficulty_standard",
    aiSeed: "1234abcd",
    serial: 0,
    returnScene: { id: "world", entrance: "default" }
  });
  state.player.reserveGuIds = ["secret_reserve_gu"];
  state.player.inventory = ["secret_inventory_item"];
  state.player.hiddenPassiveInternalId = "secret_hidden_passive";
  state.futureRandomResult = "secret_future_roll";
  state.player.cooldowns = [
    { actionId: "battle_action_moonblade", remainingTurns: 1 },
    { actionId: "battle_action_basic_melee", remainingTurns: 2 }
  ];

  const snapshot = createAiSnapshot(state);
  const serialized = JSON.stringify(snapshot);

  assert.deepEqual(snapshot.player.revealedActionIds, [
    "battle_action_basic_melee",
    "battle_action_defend"
  ]);
  assert.deepEqual(snapshot.player.publicCooldowns, [
    { actionId: "battle_action_basic_melee", remainingTurns: 2 }
  ]);
  assert.deepEqual(snapshot.player.publicItemActions, [
    { actionId: "battle_action_vitality_leaf", remainingUses: 1 }
  ]);
  assert.equal(
    "battle_action_basic_melee" in snapshot.content.actions,
    true
  );
  assert.equal(
    "battle_action_vitality_leaf" in snapshot.content.actions,
    true
  );
  assert.equal("battle_action_moonblade" in snapshot.content.actions, false);
  assert.doesNotMatch(serialized, /secret_reserve_gu/);
  assert.doesNotMatch(serialized, /secret_inventory_item/);
  assert.doesNotMatch(serialized, /secret_hidden_passive/);
  assert.doesNotMatch(serialized, /secret_future_roll/);
  assert.doesNotMatch(serialized, /battle_action_moonblade/);
});

test("AI snapshot is recursively immutable", () => {
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
        "battle_action_defend"
      ],
      publicItemActions: []
    },
    difficultyId: "ai_difficulty_standard",
    aiSeed: "1234abcd",
    serial: 0,
    returnScene: { id: "world", entrance: "default" }
  });
  const snapshot = createAiSnapshot(state);

  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.player), true);
  assert.equal(Object.isFrozen(snapshot.content.actions), true);
  assert.throws(() => {
    snapshot.player.hp = 1;
  }, TypeError);
});
