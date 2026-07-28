import assert from "node:assert/strict";
import test from "node:test";

import { getEncounter } from "../src/game/battle/content.js";
import {
  hydrateActiveBattle,
  reserveBattleInstance,
  serializeActiveBattle
} from "../src/game/battle/persistence.js";
import {
  deriveBattleSeed,
  deriveBattleSeedRoot
} from "../src/game/battle/random.js";
import { generatePersistentSeed } from "../src/game/state/persistentSeed.js";

const CONTRACT_URL = new URL(
  "../scripts/game-state-v3-contract.mjs",
  import.meta.url
);

test("persistent seed uses exactly sixteen Web Crypto bytes", () => {
  const cryptoSource = {
    getRandomValues(bytes) {
      bytes.forEach((_, index) => {
        bytes[index] = index;
      });
      return bytes;
    }
  };
  assert.equal(
    generatePersistentSeed(cryptoSource),
    "000102030405060708090a0b0c0d0e0f"
  );
  assert.throws(
    () => generatePersistentSeed({}),
    /Web Crypto getRandomValues is required/
  );
});

test("battle reservation consumes one serial and freezes difficulty and return scene", () => {
  const envelope = makeEnvelope();
  const before = structuredClone(envelope);
  const reserved = reserveBattleInstance(envelope, {
    encounter: getEncounter("B-D10-01"),
    variantId: "default"
  });

  assert.deepEqual(envelope, before);
  assert.equal(reserved.serial, 0);
  assert.equal(
    reserved.aiSeed,
    deriveBattleSeed("fe5f99fb", "B-D10-01", 0)
  );
  assert.equal(
    reserved.envelope.state.mvp.battleAi.nextBattleInstanceSerial,
    1
  );
  assert.equal(
    reserved.battle.difficultyId,
    "ai_difficulty_hard"
  );
  assert.deepEqual(reserved.battle.returnScene, {
    id: "loc_qingmao_wilderness",
    entrance: "node_qm_entry"
  });

  reserved.envelope.state.mvp.settings.battleDifficultyId =
    "ai_difficulty_beginner";
  assert.equal(
    reserved.envelope.state.mvp.battle.difficultyId,
    "ai_difficulty_hard"
  );
});

test("active battle serialization restores content without losing AI cursors", () => {
  const reserved = reserveBattleInstance(makeEnvelope(), {
    encounter: getEncounter("B-D26-01"),
    variantId: "default"
  });
  reserved.battle.aiCursor = 3;
  reserved.battle.decisionIndex = 4;
  reserved.battle.recentActionCategoriesByUnitId[
    reserved.battle.enemyUnitOrder[0]
  ] = ["defend", "reposition"];

  const serialized = serializeActiveBattle(reserved.battle);
  const hydrated = hydrateActiveBattle(structuredClone(serialized));

  assert.equal("content" in serialized, false);
  assert.equal(hydrated.aiCursor, 3);
  assert.equal(hydrated.decisionIndex, 4);
  assert.deepEqual(
    hydrated.recentActionCategoriesByUnitId,
    reserved.battle.recentActionCategoriesByUnitId
  );
  assert.ok(hydrated.content.actions.battle_action_basic_melee);
});

test("old active battle receives one deterministic serial backfill exactly once", async () => {
  const { upgradeSaveEnvelope } = await import(CONTRACT_URL);
  const root = deriveBattleSeedRoot("theft-seed");
  const old = {
    state: {
      version: 3,
      mvp: {
        rulesVersion: 1,
        currentScene: {
          id: "loc_qingmao_wilderness",
          entrance: "node_qm_entry"
        },
        player: makePlayer(),
        theft: {
          theftSeed: "theft-seed",
          theftRandomCursor: 0,
          attemptedTargetIdsBySceneVisit: {}
        },
        battle: {
          battleId: "B-D26-01",
          player: { revealedActionIds: [] },
          enemies: [
            {
              unitId: "enemy-1",
              profileId: "ai_profile_pack_hunter",
              hp: 10
            },
            {
              unitId: "enemy-2",
              profileId: "ai_profile_pack_hunter",
              hp: 10
            }
          ]
        }
      },
      wilderness: {
        expeditionSeed: "expedition-seed"
      }
    },
    journal: []
  };

  const upgraded = upgradeSaveEnvelope(old);
  const battle = upgraded.state.mvp.battle;
  assert.deepEqual(upgraded.state.mvp.battleAi, {
    contractVersion: 1,
    battleSeedRoot: root,
    nextBattleInstanceSerial: 1
  });
  assert.equal(battle.serial, 0);
  assert.equal(
    battle.aiSeed,
    deriveBattleSeed(root, "B-D26-01", 0)
  );
  assert.equal(battle.aiCursor, 0);
  assert.equal(battle.decisionIndex, 0);
  assert.deepEqual(battle.enemyUnitOrder, ["enemy-1", "enemy-2"]);
  assert.equal(battle.difficultyId, "ai_difficulty_standard");

  const again = upgradeSaveEnvelope(upgraded);
  assert.deepEqual(again, upgraded);
  assert.equal(JSON.stringify(again), JSON.stringify(upgraded));
});

function makeEnvelope() {
  return {
    state: {
      version: 3,
      mvp: {
        rulesVersion: 1,
        currentScene: {
          id: "loc_qingmao_wilderness",
          entrance: "node_qm_entry"
        },
        player: makePlayer(),
        inventory: {
          itemQuantitiesById: {},
          guMaterialQuantitiesById: {},
          equipmentBySlot: {
            weapon: null,
            armor: null,
            artifact: null
          },
          unlockedRecipeIds: []
        },
        theft: {
          theftSeed: "theft-seed",
          theftRandomCursor: 0,
          attemptedTargetIdsBySceneVisit: {}
        },
        battleAi: {
          contractVersion: 1,
          battleSeedRoot: "fe5f99fb",
          nextBattleInstanceSerial: 0
        },
        settings: {
          battleDifficultyId: "ai_difficulty_hard"
        },
        battle: null
      }
    },
    journal: []
  };
}

function makePlayer() {
  return {
    health: { current: 40, maximum: 40 },
    primevalEssence: { current: 20, maximum: 20 },
    primevalStones: 6,
    rankId: "rank_one",
    cultivationProgress: 0,
    storedOverflow: 0,
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
  };
}
