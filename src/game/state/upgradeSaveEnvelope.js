import {
  deriveBattleSeed,
  deriveBattleSeedRoot
} from "../battle/random.js";

const PROFILE_BY_BATTLE_ID = Object.freeze({
  "B-D07-01": "ai_profile_duelist",
  "B-D10-01": "ai_profile_melee_pursuer",
  "B-D17-01": "ai_profile_guardian",
  "B-D19-01": "ai_profile_duelist",
  "B-D21-01": "ai_profile_charger",
  "B-D24-01": "ai_profile_ranged_skirmisher",
  "B-D26-01": "ai_profile_pack_hunter",
  "B-D27-01": "ai_profile_charger",
  "B-D29-01": "ai_profile_boss_hunter",
  "B-Q02-01": "ai_profile_guardian",
  "B-Q03-01": "ai_profile_duelist",
  "B-Q04-01": "ai_profile_ranged_skirmisher",
  "B-Q05-01": "ai_profile_pack_hunter"
});

export function upgradeSaveEnvelope(
  envelope,
  { registry, seeds = {} } = {}
) {
  assertEnvelope(envelope);
  requireRegistry(registry);
  const sourceState = structuredClone(envelope.state);
  if (sourceState.version !== 2 && sourceState.version !== 3) {
    throw new Error(
      `unsupported save state version: ${sourceState.version}`
    );
  }
  if (
    sourceState.version === 3 &&
    sourceState.mvp?.rulesVersion !== undefined &&
    sourceState.mvp.rulesVersion !== 1
  ) {
    throw new Error(
      `unsupported MVP rules version: ${sourceState.mvp.rulesVersion}`
    );
  }

  const migrated = structuredClone(envelope);
  if (
    sourceState.version === 3 &&
    sourceState.mvp?.rulesVersion === 1
  ) {
    migrated.state.mvp = addBattleDefaults(
      structuredClone(sourceState.mvp)
    );
    return migrated;
  }

  migrated.state.version = 3;
  migrated.state.mvp = createMvpState(sourceState, seeds, registry);
  migrated.state.wilderness = createWildernessState(
    sourceState.wilderness,
    seeds
  );
  migrated.state.guSystem = upgradeGuSystem(
    sourceState.guSystem,
    sourceState.wineWorm
  );
  return migrated;
}

function createMvpState(sourceState, seeds, registry) {
  const sourceVersion = sourceState.version;
  const currentScene = migrateScene(sourceState.scene);
  const existingMvp =
    sourceVersion === 3 && sourceState.mvp
      ? structuredClone(sourceState.mvp)
      : {};
  const mvp = {
    ...existingMvp,
    rulesVersion: 1,
    migration: existingMvp.migration ?? {
      sourceVersion,
      sourceScene: structuredClone(sourceState.scene ?? null)
    },
    currentScene: existingMvp.currentScene ?? currentScene,
    player:
      existingMvp.player ??
      migratePlayer(sourceState.player, registry),
    questFlow: existingMvp.questFlow ?? {
      activeQuestId: "quest_main_qingmao",
      questsById: {
        quest_main_qingmao: {
          status: "active",
          currentStepId: "D00-S01",
          nextStepId: "D01-S01"
        }
      }
    },
    relationships: existingMvp.relationships ?? [],
    talentRosterByCharacterId:
      existingMvp.talentRosterByCharacterId ?? {},
    inventory:
      existingMvp.inventory ??
      migrateInventory(sourceState.inventory, registry),
    discoveredLocationIds:
      existingMvp.discoveredLocationIds ??
      initialLocations(currentScene, registry),
    opportunitiesById:
      existingMvp.opportunitiesById ??
      initialOpportunities(sourceState.wineWorm, registry),
    charactersById:
      existingMvp.charactersById ??
      initialCharacters(currentScene, registry),
    theft: existingMvp.theft ?? {
      theftSeed: requiredSeed(seeds.theftSeed, "theftSeed"),
      theftRandomCursor: 0,
      attemptedTargetIdsBySceneVisit: {}
    },
    battle: existingMvp.battle ?? null,
    completedRewardIds: existingMvp.completedRewardIds ?? []
  };
  return addBattleDefaults(mvp);
}

function addBattleDefaults(mvp) {
  const theftSeed = requiredSeed(mvp.theft?.theftSeed, "theftSeed");
  const existingBattleAi = isPlainObject(mvp.battleAi)
    ? structuredClone(mvp.battleAi)
    : {};
  if (
    existingBattleAi.contractVersion !== undefined &&
    existingBattleAi.contractVersion !== 1
  ) {
    throw new Error(
      `unsupported battle AI contract version: ${existingBattleAi.contractVersion}`
    );
  }
  const battleAi = {
    ...existingBattleAi,
    contractVersion: 1,
    battleSeedRoot:
      existingBattleAi.battleSeedRoot ??
      deriveBattleSeedRoot(theftSeed),
    nextBattleInstanceSerial:
      existingBattleAi.nextBattleInstanceSerial ?? 0
  };
  requireCounter(
    battleAi.nextBattleInstanceSerial,
    "nextBattleInstanceSerial"
  );
  const settings = {
    ...(isPlainObject(mvp.settings)
      ? structuredClone(mvp.settings)
      : {}),
    battleDifficultyId:
      mvp.settings?.battleDifficultyId ??
      "ai_difficulty_standard"
  };
  const battle = mvp.battle
    ? backfillActiveBattle(
        structuredClone(mvp.battle),
        battleAi,
        settings.battleDifficultyId
      )
    : null;

  return {
    ...mvp,
    battleAi,
    settings,
    battle
  };
}

function backfillActiveBattle(battle, battleAi, difficultyId) {
  const enemies = Array.isArray(battle.enemies)
    ? battle.enemies
    : battle.enemy
      ? [battle.enemy]
      : [];
  const enemyUnitOrder =
    battle.enemyUnitOrder ??
    enemies.map(
      (enemy, index) =>
        enemy.unitId ?? `${battle.battleId}.enemy.${index + 1}`
    );
  enemies.forEach((enemy, index) => {
    enemy.unitId ??= enemyUnitOrder[index];
    enemy.profileId ??=
      PROFILE_BY_BATTLE_ID[battle.battleId] ??
      "ai_profile_duelist";
  });

  const needsSeed =
    typeof battle.aiSeed !== "string" ||
    !Number.isSafeInteger(battle.serial);
  if (needsSeed) {
    const serial = battleAi.nextBattleInstanceSerial;
    battle.serial = serial;
    battle.aiSeed = deriveBattleSeed(
      battleAi.battleSeedRoot,
      battle.battleId,
      serial
    );
    battleAi.nextBattleInstanceSerial = serial + 1;
  }

  const firstLiving =
    enemyUnitOrder.find((unitId) => {
      const enemy = enemies.find((entry) => entry.unitId === unitId);
      return enemy && (enemy.hp ?? 1) > 0;
    }) ?? null;
  const revealedActionIds = uniqueStrings([
    "battle_action_basic_melee",
    "battle_action_defend",
    ...(battle.revealedPlayerActionIds || []),
    ...(battle.player?.revealedActionIds || []),
    ...revealedActionsFromLog(battle)
  ]);
  const publicItemActions = structuredClone(
    battle.publicItemActions ??
      battle.player?.publicItemActions ??
      []
  );

  battle.enemies = enemies;
  battle.enemyUnitOrder = [...enemyUnitOrder];
  battle.activeEnemyUnitId =
    battle.activeEnemyUnitId &&
    enemyUnitOrder.includes(battle.activeEnemyUnitId)
      ? battle.activeEnemyUnitId
      : firstLiving;
  battle.difficultyId =
    battle.difficultyId ?? difficultyId;
  battle.aiCursor = battle.aiCursor ?? 0;
  battle.decisionIndex = battle.decisionIndex ?? 0;
  battle.profileByUnitId =
    battle.profileByUnitId ??
    Object.fromEntries(
      enemies.map((enemy) => [enemy.unitId, enemy.profileId])
    );
  battle.revealedPlayerActionIds = revealedActionIds;
  battle.publicItemActions = publicItemActions;
  battle.recentActionCategoriesByUnitId = {
    ...Object.fromEntries(
      enemyUnitOrder.map((unitId) => [unitId, []])
    ),
    ...(isPlainObject(battle.recentActionCategoriesByUnitId)
      ? structuredClone(battle.recentActionCategoriesByUnitId)
      : {})
  };
  battle.player = {
    ...(isPlainObject(battle.player)
      ? structuredClone(battle.player)
      : {}),
    revealedActionIds,
    publicItemActions
  };
  return battle;
}

function revealedActionsFromLog(battle) {
  if (!Array.isArray(battle.actionLog)) return [];
  return battle.actionLog
    .filter(
      (entry) =>
        entry?.side === "player" &&
        typeof entry.actionId === "string"
    )
    .map((entry) => entry.actionId);
}

function migrateScene(scene) {
  if (scene?.id === "world") {
    return {
      id: "loc_qingmao_wilderness",
      entrance: "node_qm_entry"
    };
  }
  if (isPlainObject(scene) && typeof scene.id === "string") {
    return structuredClone(scene);
  }
  return {
    id: "loc_gu_yue_village",
    entrance: "village-square"
  };
}

function migratePlayer(player = {}, registry) {
  const maximumHealth = positiveIntegerOr(player.maxHp, 40);
  const maximumEssence = positiveIntegerOr(player.maxEssence, 20);
  return {
    health: {
      current: clamp(
        integerOr(player.hp, maximumHealth),
        0,
        maximumHealth
      ),
      maximum: maximumHealth
    },
    primevalEssence: {
      current: clamp(
        integerOr(player.essence, maximumEssence),
        0,
        maximumEssence
      ),
      maximum: maximumEssence
    },
    primevalStones: clamp(
      integerOr(player.stones, 0),
      0,
      999_999
    ),
    rankId: registry.cultivationRanks.includes(player.rankId)
      ? player.rankId
      : "rank_one",
    cultivationProgress: clamp(
      integerOr(player.cultivation, 0),
      0,
      100
    ),
    storedOverflow: 0,
    attributes: {
      strength: 20,
      agility: scaledLegacyAttribute(player.stats?.agility, 20),
      perception: scaledLegacyAttribute(player.stats?.insight, 20),
      luck: 50,
      willpower: scaledLegacyAttribute(player.stats?.caution, 20),
      theftMastery: scaledLegacyAttribute(player.theftRank, 20)
    },
    buffs: [],
    debuffs: []
  };
}

function migrateInventory(inventory, registry) {
  const itemQuantitiesById = {};
  if (Array.isArray(inventory)) {
    for (const itemId of inventory) {
      if (registry.items.includes(itemId)) {
        itemQuantitiesById[itemId] =
          (itemQuantitiesById[itemId] ?? 0) + 1;
      }
    }
  }
  return {
    itemQuantitiesById,
    guMaterialQuantitiesById: {},
    equipmentBySlot: {
      weapon: null,
      armor: null,
      artifact: null
    },
    unlockedRecipeIds: []
  };
}

function initialLocations(currentScene, registry) {
  const locations = new Set(["loc_gu_yue_village"]);
  if (registry.locations.includes(currentScene.id)) {
    locations.add(currentScene.id);
  }
  return [...locations];
}

function initialOpportunities(legacyWineWorm, registry) {
  const opportunities = Object.fromEntries(
    registry.opportunities.map((id) => [
      id,
      { status: "inactive" }
    ])
  );
  if (legacyWineWorm?.owner === "player") {
    opportunities.opportunity_wine_worm = {
      status: "resolved",
      resolvedByCharacterId: "char_player"
    };
  } else if (
    legacyWineWorm?.owner === "fangYuan" ||
    legacyWineWorm?.owner === "fang_yuan"
  ) {
    opportunities.opportunity_wine_worm = {
      status: "resolved",
      resolvedByCharacterId: "char_fang_yuan"
    };
  } else if (legacyWineWorm?.status === "gone") {
    opportunities.opportunity_wine_worm = { status: "gone" };
  }
  return opportunities;
}

function initialCharacters(currentScene, registry) {
  return Object.fromEntries(
    registry.characters.map((id) => [
      id,
      {
        lifeStatus: "alive",
        currentLocationId:
          id === "char_player" ? currentScene.id : null
      }
    ])
  );
}

function createWildernessState(existing, seeds) {
  const defaults = {
    mapId: "map_qingmao_wilderness_v2",
    origin: "loc_gu_yue_village",
    currentNodeId: "node_qm_entry",
    facing: "north",
    wanderCount: 0,
    chargedTravelTicks: 0,
    routeSequence: [],
    traversalHistory: [],
    expeditionSeed: requiredSeed(
      existing?.expeditionSeed ?? seeds.expeditionSeed,
      "expeditionSeed"
    ),
    randomCursor: 0,
    triggeredEventIds: {
      permanent: [],
      daily: {},
      expedition: []
    },
    discoveredHiddenLocations: [],
    knownRoutes: []
  };
  if (!isPlainObject(existing)) return defaults;
  return {
    ...defaults,
    ...structuredClone(existing),
    triggeredEventIds: {
      ...defaults.triggeredEventIds,
      ...(isPlainObject(existing.triggeredEventIds)
        ? structuredClone(existing.triggeredEventIds)
        : {})
    }
  };
}

function upgradeGuSystem(existing, legacyWineWorm) {
  const defaults = createGuSystem();
  const system = isPlainObject(existing)
    ? {
        ...defaults,
        ...structuredClone(existing),
        guInstancesById: structuredClone(
          existing.guInstancesById ?? existing.instancesById ?? {}
        ),
        completedOpportunityIds: uniqueStrings(
          existing.completedOpportunityIds
        ),
        knownCaptureClueIds: uniqueStrings(
          existing.knownCaptureClueIds
        ),
        completedRecipeResolutionIds: uniqueStrings(
          existing.completedRecipeResolutionIds
        ),
        captureResolutionByOpportunityId: isPlainObject(
          existing.captureResolutionByOpportunityId
        )
          ? structuredClone(existing.captureResolutionByOpportunityId)
          : {}
      }
    : defaults;
  if (
    !existing &&
    legacyWineWorm?.owner === "player" &&
    !system.guInstancesById.gu_instance_legacy_wine_worm
  ) {
    system.guInstancesById.gu_instance_legacy_wine_worm = {
      instanceId: "gu_instance_legacy_wine_worm",
      guDefinitionId: "gu_wine_worm",
      rank: 1,
      location: "reserve",
      refined: legacyWineWorm.status === "refined",
      supplyDays: 7,
      graceDays: 0,
      careStatus: "fed",
      sourceOpportunityId: "opportunity_wine_worm",
      consumedByRecipeResolutionId: null
    };
    system.completedOpportunityIds = ["opportunity_wine_worm"];
  }
  return system;
}

function createGuSystem() {
  return {
    version: 1,
    autoFeed: true,
    guInstancesById: {},
    completedOpportunityIds: [],
    knownCaptureClueIds: [],
    completedRecipeResolutionIds: [],
    captureResolutionByOpportunityId: {}
  };
}

function uniqueStrings(value) {
  return Array.isArray(value)
    ? [...new Set(value.filter((item) => typeof item === "string"))]
    : [];
}

function assertEnvelope(envelope) {
  if (!isPlainObject(envelope) || !isPlainObject(envelope.state)) {
    throw new Error("save envelope must contain an object state");
  }
  if (!Number.isInteger(envelope.state.version)) {
    throw new Error("save envelope state.version must be an integer");
  }
}

function requireRegistry(registry) {
  for (const key of [
    "cultivationRanks",
    "items",
    "locations",
    "opportunities",
    "characters"
  ]) {
    if (!Array.isArray(registry?.[key])) {
      throw new Error(`migration registry.${key} must be an array`);
    }
  }
}

function requiredSeed(value, name) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${name} must be generated once before migration`);
  }
  return value;
}

function requireCounter(value, name) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative safe integer`);
  }
}

function scaledLegacyAttribute(value, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return clamp(Math.round(value * 10), 0, 100);
}

function positiveIntegerOr(value, fallback) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function integerOr(value, fallback) {
  return Number.isInteger(value) ? value : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}
