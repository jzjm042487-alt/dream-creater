import ids from "../../contracts/demo-v2-ids.json" with { type: "json" };
import {
  advanceEnemyPhase as advanceBattleEnemies,
  commitPlayerPlan
} from "./battle/controller.js";
import { getEncounter } from "./battle/content.js";
import {
  hydrateActiveBattle,
  reserveBattleInstance,
  serializeActiveBattle
} from "./battle/persistence.js";
import { settleBattleEnvelope } from "./rules/battleRules.js";
import { resolveWineWormAction } from "./content/wineWormQuest.js";
import {
  resolveTimedPlayerAction,
  sleepToNextDay
} from "./rules/timeRules.js";
import { createInitialState } from "./state/createInitialState.js";
import { generatePersistentSeed } from "./state/persistentSeed.js";
import { reduceGameState } from "./state/gameReducer.js";
import { upgradeSaveEnvelope } from "./state/upgradeSaveEnvelope.js";

export const STORAGE_KEY_V3 = "tianwai-daojuren-save-v3";
export const STORAGE_KEY_V2 = "tianwai-daojuren-save-v2";

const migrationRegistry = {
  cultivationRanks: ids.stableIds.cultivationRanks,
  items: ids.stableIds.items,
  locations: ids.stableIds.locations,
  opportunities: ids.stableIds.opportunities,
  characters: ids.stableIds.characters
};
const DIFFICULTIES = new Set(ids.systemIds.battleAiDifficulties);

export class GameStateStore {
  constructor(
    storage = window.localStorage,
    { cryptoSource = globalThis.crypto } = {}
  ) {
    this.storage = storage;
    this.cryptoSource = cryptoSource;
    this.listeners = new Set();
    this.envelope = this.initializeEnvelope();
  }

  getState() {
    return this.envelope.state;
  }

  getJournal() {
    return [...(this.envelope.journal || [])];
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getBattleDifficulty() {
    return this.envelope.state.mvp.settings.battleDifficultyId;
  }

  setBattleDifficulty(difficultyId) {
    if (!DIFFICULTIES.has(difficultyId)) {
      throw new Error(`unknown battle AI difficulty: ${difficultyId}`);
    }
    const next = structuredClone(this.envelope);
    next.state.mvp.settings.battleDifficultyId = difficultyId;
    this.persistAndAdopt(next);
  }

  getActiveBattle() {
    const serialized = this.envelope.state.mvp.battle;
    return serialized ? hydrateActiveBattle(serialized) : null;
  }

  startBattle(battleId, variantId = "default") {
    if (this.envelope.state.mvp.battle) {
      throw new Error("an active battle is already in progress");
    }
    const encounter = getEncounter(battleId);
    const variant = encounter.entryVariants.find(
      (entry) => entry.variantId === variantId
    );
    if (!variant) {
      throw new Error(
        `unknown entry variant ${variantId} for ${battleId}`
      );
    }
    if (variant.mode === "directResult") {
      return {
        mode: "directResult",
        battleId,
        variantId,
        result: variant.result
      };
    }

    const reserved = reserveBattleInstance(this.envelope, {
      encounter,
      variantId
    });
    this.persistAndAdopt(reserved.envelope);
    return reserved.battle;
  }

  submitPlayerPlan(plan) {
    const battle = this.requireActiveBattle();
    const committed = commitPlayerPlan(battle, plan);
    const next = structuredClone(this.envelope);
    next.state.mvp.battle = serializeActiveBattle(committed.state);
    synchronizeMvpPlayerFromBattle(next.state, committed.state);
    this.persistAndAdopt(next);
    return committed;
  }

  advanceEnemyPhase() {
    const battle = this.requireActiveBattle();
    const committed = advanceBattleEnemies(battle);
    const next = structuredClone(this.envelope);
    next.state.mvp.battle = serializeActiveBattle(committed.state);
    synchronizeMvpPlayerFromBattle(next.state, committed.state);
    this.persistAndAdopt(next);
    return committed;
  }

  finishBattle(applyContentDelta = (state) => state) {
    const settled = settleBattleEnvelope(
      this.envelope,
      applyContentDelta
    );
    this.persistAndAdopt(settled);
    return settled.state;
  }

  travel(sceneId, entrance, cost = 0) {
    const move = (current) => ({
      ...current,
      scene: { id: sceneId, entrance }
    });
    const next =
      cost > 0
        ? resolveTimedPlayerAction(this.getState(), cost, move)
        : move(this.getState());
    this.commit(next, `抵达${sceneId}。`);
  }

  runQuestAction(actionId, context = {}) {
    const next = resolveWineWormAction(
      this.getState(),
      actionId,
      context
    );
    this.commit(next, questActionMessage(actionId, next));
  }

  apply(event, message) {
    this.commit(reduceGameState(this.getState(), event), message);
  }

  sleep() {
    this.commit(sleepToNextDay(this.getState()), "休息一夜，状态恢复。");
  }

  advanceTick(cost = 1) {
    const next = resolveTimedPlayerAction(
      this.getState(),
      cost,
      (current) => current
    );
    this.commit(next, "时间向前推进。");
  }

  save() {
    this.writeEnvelope(this.envelope);
  }

  load() {
    const source = this.readStoredEnvelope();
    if (!source) throw new Error("还没有可读取的存档。");
    const migrated = this.prepareEnvelope(source.envelope);
    this.writeEnvelope(migrated);
    this.envelope = migrated;
    this.emit();
  }

  reset() {
    const next = this.createFreshEnvelope();
    this.writeEnvelope(next);
    this.envelope = next;
    this.emit();
  }

  commit(nextState, message) {
    const next = structuredClone(this.envelope);
    next.state = synchronizeMvpFromLegacy(nextState);
    if (message) {
      next.journal = [
        ...(next.journal || []).slice(-11),
        message
      ];
    }
    this.envelope = next;
    this.emit();
  }

  requireActiveBattle() {
    const battle = this.getActiveBattle();
    if (!battle) throw new Error("no active battle");
    return battle;
  }

  initializeEnvelope() {
    const source = this.readStoredEnvelope();
    if (!source) {
      const fresh = this.createFreshEnvelope();
      this.writeEnvelope(fresh);
      return fresh;
    }
    const migrated = this.prepareEnvelope(source.envelope);
    if (
      source.key !== STORAGE_KEY_V3 ||
      JSON.stringify(migrated) !== JSON.stringify(source.envelope)
    ) {
      this.writeEnvelope(migrated);
    }
    return migrated;
  }

  createFreshEnvelope() {
    return this.prepareEnvelope({
      state: createInitialState(),
      journal: ["你从异世记忆中醒来。"]
    });
  }

  prepareEnvelope(envelope) {
    const source = structuredClone(envelope);
    const seeds = {};
    const existingTheftSeed =
      source.state.mvp?.theft?.theftSeed;
    const existingExpeditionSeed =
      source.state.wilderness?.expeditionSeed;
    if (!existingTheftSeed) {
      seeds.theftSeed = generatePersistentSeed(this.cryptoSource);
    }
    if (!existingExpeditionSeed) {
      seeds.expeditionSeed = generatePersistentSeed(this.cryptoSource);
    }

    if (
      source.state.version === 3 &&
      source.state.mvp?.rulesVersion === 1
    ) {
      source.state.mvp.theft ??= {
        theftSeed: seeds.theftSeed,
        theftRandomCursor: 0,
        attemptedTargetIdsBySceneVisit: {}
      };
      source.state.wilderness ??= {};
      source.state.wilderness.expeditionSeed ??=
        seeds.expeditionSeed;
    }
    return upgradeSaveEnvelope(source, {
      registry: migrationRegistry,
      seeds
    });
  }

  readStoredEnvelope() {
    for (const key of [STORAGE_KEY_V3, STORAGE_KEY_V2]) {
      const raw = this.storage.getItem(key);
      if (raw) return { key, envelope: JSON.parse(raw) };
    }
    return null;
  }

  persistAndAdopt(nextEnvelope) {
    this.writeEnvelope(nextEnvelope);
    this.envelope = nextEnvelope;
    this.emit();
  }

  writeEnvelope(envelope) {
    const serialized = JSON.stringify(envelope);
    this.storage.setItem(STORAGE_KEY_V3, serialized);
  }

  emit() {
    for (const listener of this.listeners) {
      listener(this.getState());
    }
  }
}

function synchronizeMvpPlayerFromBattle(state, battle) {
  const player = state.mvp.player;
  player.health.current = battle.player.hp;
  player.primevalEssence.current = battle.player.essence;
  if (state.player) {
    state.player.hp = battle.player.hp;
    state.player.essence = battle.player.essence;
  }
}

function synchronizeMvpFromLegacy(state) {
  if (!state.mvp) return state;
  if (state.player) {
    state.mvp.player.health.current = state.player.hp;
    state.mvp.player.health.maximum = state.player.maxHp;
    state.mvp.player.primevalEssence.current =
      state.player.essence;
    state.mvp.player.primevalEssence.maximum =
      state.player.maxEssence;
    state.mvp.player.primevalStones = state.player.stones;
    state.mvp.player.cultivationProgress =
      state.player.cultivation;
  }
  if (state.scene) {
    state.mvp.currentScene = migrateLegacyScene(state.scene);
  }
  return state;
}

function migrateLegacyScene(scene) {
  if (scene.id === "world") {
    return {
      id: "loc_qingmao_wilderness",
      entrance: "node_qm_entry"
    };
  }
  if (scene.id === "village") {
    return {
      id: "loc_gu_yue_village",
      entrance: scene.entrance
    };
  }
  return structuredClone(scene);
}

function questActionMessage(actionId, state) {
  const messages = {
    "observe-clerk": "你摸清了伙计交班的空隙。",
    "steal-patrol-sheet": state.flags.patrolSheet
      ? "巡夜簿已悄然落入你手中。"
      : "你记住了一段巡逻空档。",
    "confirm-wine-jar": "异香来自后房封泥酒坛。",
    "steal-back-room": "这次伸手已经有了结果。",
    "follow-fang-yuan": "尾随暴露了新的破绽。",
    "train-at-academy": "学堂修行结束。",
    "ordinary-theft": "市集里少了几块元石。",
    "buy-wine-worm": "元石交割，酒虫归你。",
    "tavern-conflict": "争执暂时告一段落。"
  };
  return messages[actionId] || "局势发生了变化。";
}
