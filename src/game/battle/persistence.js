import { createContentSnapshot } from "./content.js";
import { deriveBattleSeed } from "./random.js";
import { createBattleState } from "./state.js";

export function reserveBattleInstance(
  envelope,
  { encounter, variantId = "default", playerEntry = null }
) {
  requireEnvelope(envelope);
  if (!encounter || typeof encounter.battleId !== "string") {
    throw new TypeError("a registered battle encounter is required");
  }
  const variant = encounter.entryVariants.find(
    (entry) => entry.variantId === variantId
  );
  if (!variant) {
    throw new Error(
      `unknown entry variant ${variantId} for ${encounter.battleId}`
    );
  }
  if (variant.mode !== "battle") {
    throw new Error("direct-result variants do not reserve battle serials");
  }

  const nextEnvelope = structuredClone(envelope);
  const mvp = nextEnvelope.state.mvp;
  const battleAi = mvp.battleAi;
  if (battleAi?.contractVersion !== 1) {
    throw new Error("battle AI contract version 1 is required");
  }
  if (
    !Number.isSafeInteger(battleAi.nextBattleInstanceSerial) ||
    battleAi.nextBattleInstanceSerial < 0
  ) {
    throw new Error("next battle instance serial is invalid");
  }
  const serial = battleAi.nextBattleInstanceSerial;
  const aiSeed = deriveBattleSeed(
    battleAi.battleSeedRoot,
    encounter.battleId,
    serial
  );
  const difficultyId =
    mvp.settings?.battleDifficultyId ??
    "ai_difficulty_standard";
  const battle = createBattleState({
    encounter,
    entryVariantId: variantId,
    playerEntry: playerEntry ?? playerEntryFromMvp(mvp.player),
    difficultyId,
    aiSeed,
    serial,
    returnScene: structuredClone(mvp.currentScene)
  });

  battleAi.nextBattleInstanceSerial = serial + 1;
  mvp.battle = serializeActiveBattle(battle);
  return {
    envelope: nextEnvelope,
    battle,
    serial,
    aiSeed
  };
}

export function serializeActiveBattle(battle) {
  if (!battle || typeof battle !== "object") {
    throw new TypeError("active battle must be an object");
  }
  const serialized = structuredClone(battle);
  delete serialized.content;
  return serialized;
}

export function hydrateActiveBattle(serialized) {
  if (!serialized || typeof serialized !== "object") {
    throw new TypeError("serialized active battle must be an object");
  }
  return {
    ...structuredClone(serialized),
    content: createContentSnapshot()
  };
}

function playerEntryFromMvp(player) {
  if (!player?.health || !player?.primevalEssence) {
    throw new Error("active MVP player state is required");
  }
  return {
    unitId: "player",
    hp: player.health.current,
    maxHealth: player.health.maximum,
    essence: player.primevalEssence.current,
    maxEssence: player.primevalEssence.maximum,
    move: 3,
    strength: player.attributes.strength,
    perception: player.attributes.perception,
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
  };
}

function requireEnvelope(envelope) {
  if (
    !envelope ||
    typeof envelope !== "object" ||
    envelope.state?.version !== 3 ||
    !envelope.state.mvp
  ) {
    throw new TypeError("a v3 save envelope with MVP state is required");
  }
}
