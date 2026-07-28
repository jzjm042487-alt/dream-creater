import {
  advanceEnemyPhase,
  commitPlayerPlan
} from "../battle/controller.js";
import { getEncounter } from "../battle/content.js";
import { enumerateLegalTurnPlans } from "../battle/legalPlans.js";
import { hydrateActiveBattle } from "../battle/persistence.js";
import { createBattleState } from "../battle/state.js";

export function createBattleFromId(
  battleId,
  {
    variantId = "default",
    playerEntry,
    difficultyId,
    aiSeed,
    serial,
    returnScene
  }
) {
  const encounter = getEncounter(battleId);
  return createBattleState({
    encounter,
    entryVariantId: variantId,
    playerEntry,
    difficultyId,
    aiSeed,
    serial,
    returnScene
  });
}

export function getPlayerPlans(battle, actorUnitId = battle.player.unitId) {
  return enumerateLegalTurnPlans(battle, actorUnitId).plans;
}

export function submitPlayerPlan(battle, plan, dependencies = {}) {
  return commitPlayerPlan(battle, plan, dependencies);
}

export function resolveEnemyPhase(battle, dependencies = {}) {
  return advanceEnemyPhase(battle, dependencies);
}

export function settleBattleEnvelope(
  envelope,
  applyContentDelta = (state) => state
) {
  if (!envelope?.state?.mvp?.battle) {
    throw new Error("no active battle to settle");
  }
  if (typeof applyContentDelta !== "function") {
    throw new TypeError("battle content delta must be a function");
  }
  const nextEnvelope = structuredClone(envelope);
  const battle = hydrateActiveBattle(nextEnvelope.state.mvp.battle);
  if (!battle.result) {
    throw new Error("battle has not ended");
  }
  const player = nextEnvelope.state.mvp.player;
  if (battle.result === "defeat") {
    player.health.current = Math.max(
      1,
      Math.floor((player.health.maximum * 30) / 100)
    );
    player.debuffs = [
      ...player.debuffs.filter(
        (entry) => entry.id !== "debuff_wounded"
      ),
      { id: "debuff_wounded", duration: "untilRest" }
    ];
  } else {
    player.health.current = clamp(
      battle.player.hp,
      0,
      player.health.maximum
    );
  }
  player.primevalEssence.current = clamp(
    battle.player.essence,
    0,
    player.primevalEssence.maximum
  );
  nextEnvelope.state.mvp.currentScene = structuredClone(
    battle.returnScene
  );
  nextEnvelope.state.mvp.battle = null;
  synchronizeLegacyPlayer(nextEnvelope.state);

  const settledState = applyContentDelta(nextEnvelope.state, {
    battleId: battle.battleId,
    result: battle.result,
    returnScene: structuredClone(battle.returnScene)
  });
  if (
    !settledState ||
    typeof settledState !== "object" ||
    typeof settledState.then === "function"
  ) {
    throw new Error("battle content delta must return state synchronously");
  }
  nextEnvelope.state = settledState;
  return nextEnvelope;
}

function synchronizeLegacyPlayer(state) {
  if (!state.player) return;
  state.player.hp = state.mvp.player.health.current;
  state.player.maxHp = state.mvp.player.health.maximum;
  state.player.essence =
    state.mvp.player.primevalEssence.current;
  state.player.maxEssence =
    state.mvp.player.primevalEssence.maximum;
  state.player.stones = state.mvp.player.primevalStones;
  state.player.cultivation =
    state.mvp.player.cultivationProgress;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}
