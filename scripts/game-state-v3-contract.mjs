import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadRegistry,
  validateContentValue
} from "./contract-validator-core.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLAYER_SCHEMA = path.join(ROOT, "contracts", "player-state.schema.json");
const registry = loadRegistry();

export function upgradeSaveEnvelope(envelope, seeds = {}) {
  assertEnvelope(envelope);
  const migrated = structuredClone(envelope);
  const sourceState = structuredClone(envelope.state);

  if (sourceState.version === 3 && sourceState.mvp?.rulesVersion === 1) {
    return migrated;
  }
  if (sourceState.version !== 2 && sourceState.version !== 3) {
    throw new Error(`unsupported save state version: ${sourceState.version}`);
  }
  if (
    sourceState.version === 3 &&
    sourceState.mvp &&
    sourceState.mvp.rulesVersion !== undefined
  ) {
    throw new Error(`unsupported MVP rules version: ${sourceState.mvp.rulesVersion}`);
  }

  migrated.state.version = 3;
  migrated.state.mvp = createMvpState(sourceState, seeds);
  migrated.state.wilderness = createWildernessState(sourceState.wilderness, seeds);
  migrated.state.guSystem = upgradeGuSystem(sourceState.guSystem, sourceState.wineWorm);

  const playerErrors = validateContentValue(
    migrated.state.mvp.player,
    PLAYER_SCHEMA,
    registry
  );
  if (playerErrors.length) {
    throw new Error(`migrated player state is invalid: ${playerErrors.join("; ")}`);
  }

  return migrated;
}

function createMvpState(sourceState, seeds) {
  const sourceVersion = sourceState.version;
  const currentScene = migrateScene(sourceState.scene);
  const player = migratePlayer(sourceState.player);
  const existingMvp = sourceVersion === 3 && sourceState.mvp
    ? structuredClone(sourceState.mvp)
    : {};

  return {
    ...existingMvp,
    rulesVersion: 1,
    migration: existingMvp.migration ?? {
      sourceVersion,
      sourceScene: structuredClone(sourceState.scene ?? null)
    },
    currentScene: existingMvp.currentScene ?? currentScene,
    player: existingMvp.player ?? player,
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
    talentRosterByCharacterId: existingMvp.talentRosterByCharacterId ?? {},
    inventory: existingMvp.inventory ?? migrateInventory(sourceState.inventory),
    discoveredLocationIds: existingMvp.discoveredLocationIds ?? initialLocations(currentScene),
    opportunitiesById: existingMvp.opportunitiesById ?? initialOpportunities(sourceState.wineWorm),
    charactersById: existingMvp.charactersById ?? initialCharacters(currentScene),
    theft: existingMvp.theft ?? {
      theftSeed: requiredSeed(seeds.theftSeed, "theftSeed"),
      theftRandomCursor: 0,
      attemptedTargetIdsBySceneVisit: {}
    },
    battle: existingMvp.battle ?? null,
    completedRewardIds: existingMvp.completedRewardIds ?? []
  };
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

function migratePlayer(player = {}) {
  const maximumHealth = positiveIntegerOr(player.maxHp, 40);
  const maximumEssence = positiveIntegerOr(player.maxEssence, 20);

  return {
    health: {
      current: clamp(integerOr(player.hp, maximumHealth), 0, maximumHealth),
      maximum: maximumHealth
    },
    primevalEssence: {
      current: clamp(integerOr(player.essence, maximumEssence), 0, maximumEssence),
      maximum: maximumEssence
    },
    primevalStones: clamp(integerOr(player.stones, 0), 0, 999999),
    rankId: registry.cultivationRanks.includes(player.rankId) ? player.rankId : "rank_one",
    cultivationProgress: clamp(integerOr(player.cultivation, 0), 0, 100),
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

function migrateInventory(inventory) {
  const itemQuantitiesById = {};

  if (Array.isArray(inventory)) {
    for (const itemId of inventory) {
      if (registry.items.includes(itemId)) {
        itemQuantitiesById[itemId] = (itemQuantitiesById[itemId] ?? 0) + 1;
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

function initialLocations(currentScene) {
  const locations = new Set(["loc_gu_yue_village"]);
  if (registry.locations.includes(currentScene.id)) locations.add(currentScene.id);
  return [...locations];
}

function initialOpportunities(legacyWineWorm) {
  const opportunities = Object.fromEntries(
    registry.opportunities.map((id) => [id, { status: "inactive" }])
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

function initialCharacters(currentScene) {
  return Object.fromEntries(
    registry.characters.map((id) => [
      id,
      {
        lifeStatus: "alive",
        currentLocationId: id === "char_player" ? currentScene.id : null
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
    expeditionSeed: requiredSeed(existing?.expeditionSeed ?? seeds.expeditionSeed, "expeditionSeed"),
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
        completedOpportunityIds: uniqueStrings(existing.completedOpportunityIds),
        knownCaptureClueIds: uniqueStrings(existing.knownCaptureClueIds),
        completedRecipeResolutionIds: uniqueStrings(existing.completedRecipeResolutionIds),
        captureResolutionByOpportunityId: isPlainObject(existing.captureResolutionByOpportunityId)
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

function requiredSeed(value, name) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${name} must be generated once before migration`);
  }
  return value;
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
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
