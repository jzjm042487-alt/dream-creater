import assert from "node:assert/strict";
import test from "node:test";

import {
  createBattleFromId,
  getPlayerPlans,
  resolveEnemyPhase,
  settleBattleEnvelope,
  submitPlayerPlan
} from "../src/game/rules/battleRules.js";
import { serializeActiveBattle } from "../src/game/battle/persistence.js";

test("registered battles create authored obstacles and multiple enemies", () => {
  const single = createBattleFromId("B-D17-01", battleOptions());
  assert.equal(single.board.width, 8);
  assert.equal(single.board.height, 6);
  assert.ok(single.board.blockedCells.length > 0);
  assert.equal(single.enemies.length, 1);

  const pair = createBattleFromId("B-D26-01", battleOptions());
  assert.equal(pair.enemies.length, 2);
  assert.deepEqual(
    pair.enemyUnitOrder,
    pair.enemies.map((enemy) => enemy.unitId)
  );
  assert.throws(
    () => createBattleFromId("forest", battleOptions()),
    /unknown battle/i
  );
});

test("facade commits player move-plus-action then a fixed enemy phase", () => {
  const battle = createBattleFromId("B-D17-01", battleOptions());
  const plan = getPlayerPlans(battle).find(
    (candidate) =>
      candidate.action.actionId === "battle_action_defend" &&
      candidate.pathCost === 1
  );
  const playerCommit = submitPlayerPlan(battle, plan);

  assert.deepEqual(playerCommit.state.player.position, plan.destination);
  assert.equal(playerCommit.state.phase, "enemy");
  const enemyCommit = resolveEnemyPhase(playerCommit.state, {
    choose(snapshot) {
      const candidates = getPlayerPlans(
        snapshot,
        snapshot.activeEnemyUnitId
      );
      return {
        ...candidates[0],
        plan: candidates[0],
        orderedCandidates: candidates.map((candidate) => ({
          plan: candidate
        })),
        consumedRandom: false,
        roll: null
      };
    }
  });
  assert.equal(enemyCommit.state.phase, "player");
  assert.equal(enemyCommit.state.round, 2);
});

test("battle facade exposes no theft combat action", () => {
  const battle = createBattleFromId("B-D19-01", battleOptions());
  const actionIds = new Set([
    ...battle.player.actionIds,
    ...battle.enemies.flatMap((enemy) => enemy.actionIds)
  ]);
  assert.equal(actionIds.has("SLEIGHT_OF_HAND"), false);
  assert.equal(actionIds.has("STEAL_ESSENCE"), false);
  assert.ok(
    [...actionIds].every((actionId) =>
      actionId.startsWith("battle_action_")
    )
  );
});

test("defeat applies only health recovery and one wounded debuff", () => {
  const envelope = settlementEnvelope("defeat");
  const preserved = {
    inventory: structuredClone(envelope.state.mvp.inventory),
    guSystem: structuredClone(envelope.state.guSystem),
    stones: envelope.state.mvp.player.primevalStones,
    cultivation: envelope.state.mvp.player.cultivationProgress,
    overflow: envelope.state.mvp.player.storedOverflow,
    unknown: structuredClone(envelope.state.unknownSentinel)
  };
  const settled = settleBattleEnvelope(envelope);

  assert.equal(settled.state.mvp.player.health.current, 12);
  assert.deepEqual(
    settled.state.mvp.player.debuffs.filter(
      (entry) => entry.id === "debuff_wounded"
    ),
    [{ id: "debuff_wounded", duration: "untilRest" }]
  );
  assert.deepEqual(settled.state.mvp.currentScene, {
    id: "loc_qingmao_wilderness",
    entrance: "node_qm_entry"
  });
  assert.equal(settled.state.mvp.battle, null);
  assert.deepEqual(settled.state.mvp.inventory, preserved.inventory);
  assert.deepEqual(settled.state.guSystem, preserved.guSystem);
  assert.equal(settled.state.mvp.player.primevalStones, preserved.stones);
  assert.equal(
    settled.state.mvp.player.cultivationProgress,
    preserved.cultivation
  );
  assert.equal(settled.state.mvp.player.storedOverflow, preserved.overflow);
  assert.deepEqual(settled.state.unknownSentinel, preserved.unknown);
});

test("victory and retreat persist final resources without generic punishment", () => {
  for (const result of ["victory", "retreat"]) {
    const envelope = settlementEnvelope(result);
    envelope.state.mvp.battle.player.hp = 17;
    envelope.state.mvp.battle.player.essence = 9;
    const settled = settleBattleEnvelope(envelope);

    assert.equal(settled.state.mvp.player.health.current, 17);
    assert.equal(
      settled.state.mvp.player.primevalEssence.current,
      9
    );
    assert.deepEqual(settled.state.mvp.player.debuffs, []);
    assert.equal(settled.state.mvp.player.primevalStones, 23);
  }
});

function battleOptions() {
  return {
    variantId: "default",
    difficultyId: "ai_difficulty_standard",
    aiSeed: "abc",
    serial: 0,
    returnScene: {
      id: "loc_qingmao_wilderness",
      entrance: "node_qm_entry"
    },
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
    }
  };
}

function settlementEnvelope(result) {
  const battle = createBattleFromId("B-D17-01", battleOptions());
  battle.result = result;
  battle.player.hp = result === "defeat" ? 0 : 17;
  battle.player.essence = 9;
  return {
    state: {
      version: 3,
      unknownSentinel: { nested: ["keep", 7] },
      mvp: {
        rulesVersion: 1,
        currentScene: { id: "battle", entrance: "active" },
        player: {
          health: { current: 40, maximum: 40 },
          primevalEssence: { current: 20, maximum: 20 },
          primevalStones: 23,
          rankId: "rank_one",
          cultivationProgress: 47,
          storedOverflow: 8,
          attributes: {
            strength: 20,
            agility: 30,
            perception: 30,
            luck: 50,
            willpower: 20,
            theftMastery: 10
          },
          buffs: [],
          debuffs: []
        },
        inventory: {
          itemQuantitiesById: { item_moon_orchid_petal: 2 },
          guMaterialQuantitiesById: { material_test: 3 },
          equipmentBySlot: {
            weapon: "equipment_test",
            armor: null,
            artifact: null
          },
          unlockedRecipeIds: ["recipe_test"]
        },
        battle: serializeActiveBattle(battle)
      },
      guSystem: {
        version: 1,
        guInstancesById: {
          gu_instance_keep: { instanceId: "gu_instance_keep" }
        }
      }
    },
    journal: []
  };
}
