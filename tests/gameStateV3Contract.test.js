import assert from "node:assert/strict";
import test from "node:test";

const MODULE_URL = new URL("../scripts/game-state-v3-contract.mjs", import.meta.url);

test("v2 save envelope migrates losslessly into active v3 branches", async () => {
  const { upgradeSaveEnvelope } = await loadContractModule();
  assert.equal(typeof upgradeSaveEnvelope, "function", "upgradeSaveEnvelope must be exported");

  const legacy = {
    state: {
      version: 2,
      clock: { day: 7, tick: 3 },
      scene: { id: "world", entrance: "gu-yue-road" },
      player: {
        hp: 31,
        maxHp: 40,
        essence: 11,
        maxEssence: 20,
        stones: 9,
        cultivation: 27,
        theftRank: 2,
        stats: { agility: 4, insight: 5, caution: 3 }
      },
      fangYuan: { alert: 99, stance: "watch" },
      wineWorm: { owner: "merchant", status: "carried", failedAttempts: 1 },
      clues: ["legacy-clue"],
      flags: { legacyFlag: true },
      inventory: ["item_moon_orchid_petal"],
      untouchedSentinel: { nested: ["keep", 7] }
    },
    journal: ["legacy journal"],
    envelopeSentinel: { keep: true }
  };
  const before = structuredClone(legacy);

  const migrated = upgradeSaveEnvelope(legacy, {
    expeditionSeed: "expedition-seed",
    theftSeed: "theft-seed"
  });

  assert.deepEqual(legacy, before, "migration must not mutate the v2 envelope");
  assert.deepEqual(migrated.journal, before.journal);
  assert.deepEqual(migrated.envelopeSentinel, before.envelopeSentinel);
  assert.deepEqual(migrated.state.untouchedSentinel, before.state.untouchedSentinel);
  assert.deepEqual(migrated.state.fangYuan, before.state.fangYuan);
  assert.deepEqual(migrated.state.clues, before.state.clues);
  assert.equal(migrated.state.version, 3);
  assert.deepEqual(migrated.state.mvp.migration.sourceScene, before.state.scene);
  assert.equal(migrated.state.mvp.currentScene.id, "loc_qingmao_wilderness");
  assert.equal(migrated.state.mvp.currentScene.entrance, "node_qm_entry");
  assert.deepEqual(migrated.state.mvp.player.health, { current: 31, maximum: 40 });
  assert.deepEqual(migrated.state.mvp.player.primevalEssence, { current: 11, maximum: 20 });
  assert.equal(migrated.state.mvp.player.primevalStones, 9);
  assert.equal(migrated.state.mvp.player.cultivationProgress, 27);
  assert.equal(migrated.state.mvp.player.attributes.agility, 40);
  assert.equal(migrated.state.mvp.player.attributes.perception, 50);
  assert.equal(migrated.state.mvp.player.attributes.willpower, 30);
  assert.equal(migrated.state.mvp.player.attributes.theftMastery, 20);
  assert.equal(migrated.state.mvp.inventory.itemQuantitiesById.item_moon_orchid_petal, 1);
  assert.equal(migrated.state.wilderness.expeditionSeed, "expedition-seed");
  assert.equal(migrated.state.mvp.theft.theftSeed, "theft-seed");
  assert.equal(migrated.state.mvp.opportunitiesById.opportunity_wine_worm.status, "inactive");
  assert.equal(migrated.state.mvp.charactersById.char_fang_yuan.lifeStatus, "alive");
});

test("v3 upgrades are idempotent and never regenerate persisted random seeds", async () => {
  const { upgradeSaveEnvelope } = await loadContractModule();
  assert.equal(typeof upgradeSaveEnvelope, "function", "upgradeSaveEnvelope must be exported");

  const oldV3 = {
    state: {
      version: 3,
      scene: { id: "loc_gu_yue_village", entrance: "village-square" },
      mvp: {
        currentScene: {
          id: "loc_hidden_cave",
          entrance: "inner-mouth"
        },
        player: {
          health: { current: 9, maximum: 55 },
          primevalEssence: { current: 7, maximum: 33 },
          primevalStones: 88,
          rankId: "rank_two",
          cultivationProgress: 64,
          storedOverflow: 0,
          attributes: {
            strength: 41,
            agility: 42,
            perception: 43,
            luck: 44,
            willpower: 45,
            theftMastery: 46
          },
          buffs: [],
          debuffs: []
        },
        oldMvpSentinel: { keep: true }
      },
      wilderness: {
        expeditionSeed: "existing-expedition-seed",
        randomCursor: 8
      },
      guSystem: {
        version: 1,
        instancesById: { gu_instance_keep: { id: "gu_instance_keep" } }
      },
      legacyV3Sentinel: true
    },
    journal: ["old v3"]
  };

  const upgraded = upgradeSaveEnvelope(oldV3, {
    expeditionSeed: "must-not-replace",
    theftSeed: "new-theft-seed"
  });
  const again = upgradeSaveEnvelope(upgraded, {
    expeditionSeed: "must-not-replace-again",
    theftSeed: "must-not-replace-again"
  });

  assert.equal(upgraded.state.wilderness.expeditionSeed, "existing-expedition-seed");
  assert.equal(upgraded.state.wilderness.randomCursor, 8);
  assert.deepEqual(upgraded.state.mvp.player, oldV3.state.mvp.player);
  assert.deepEqual(upgraded.state.mvp.currentScene, oldV3.state.mvp.currentScene);
  assert.deepEqual(upgraded.state.mvp.oldMvpSentinel, oldV3.state.mvp.oldMvpSentinel);
  assert.deepEqual(
    upgraded.state.guSystem.instancesById,
    oldV3.state.guSystem.instancesById,
    "legacy Gu data must remain at its original path"
  );
  assert.ok(upgraded.state.guSystem.guInstancesById, "active Gu instance map must exist");
  assert.deepEqual(
    upgraded.state.guSystem.guInstancesById.gu_instance_keep,
    oldV3.state.guSystem.instancesById.gu_instance_keep,
    "legacy v3 Gu instances must be visible through the active field"
  );
  assert.equal(upgraded.state.legacyV3Sentinel, true);
  assert.deepEqual(again, upgraded, "upgrading an active v3 envelope must be byte-stable by value");
});

test("a player-owned legacy Wine Worm maps exactly once into the active Gu system", async () => {
  const { upgradeSaveEnvelope } = await loadContractModule();
  assert.equal(typeof upgradeSaveEnvelope, "function", "upgradeSaveEnvelope must be exported");

  const legacy = {
    state: {
      version: 2,
      scene: { id: "world", entrance: "gu-yue-road" },
      player: {},
      wineWorm: {
        owner: "player",
        status: "refined",
        failedAttempts: 0
      }
    },
    journal: []
  };

  const migrated = upgradeSaveEnvelope(legacy, {
    expeditionSeed: "expedition-seed",
    theftSeed: "theft-seed"
  });
  assert.ok(migrated.state.guSystem.guInstancesById, "active Gu instance map must exist");
  const instance = migrated.state.guSystem.guInstancesById.gu_instance_legacy_wine_worm;

  assert.ok(instance, "legacy Wine Worm instance must be created");
  assert.equal(instance.guDefinitionId, "gu_wine_worm");
  assert.equal(instance.refined, true);
  assert.equal(instance.supplyDays, 7);
  assert.equal(instance.location, "reserve");
  assert.deepEqual(migrated.state.guSystem.completedOpportunityIds, ["opportunity_wine_worm"]);
  assert.deepEqual(migrated.state.mvp.opportunitiesById.opportunity_wine_worm, {
    status: "resolved",
    resolvedByCharacterId: "char_player"
  });

  const again = upgradeSaveEnvelope(migrated, {
    expeditionSeed: "different",
    theftSeed: "different"
  });
  assert.deepEqual(again, migrated);
  assert.equal(
    Object.keys(again.state.guSystem.guInstancesById).filter(
      (id) => id === "gu_instance_legacy_wine_worm"
    ).length,
    1
  );
});

async function loadContractModule() {
  try {
    return await import(MODULE_URL);
  } catch {
    return {};
  }
}
