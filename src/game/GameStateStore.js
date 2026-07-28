import { reduceGameState } from "./state/gameReducer.js";
import { createInitialState } from "./state/createInitialState.js";
import {
  resolveTimedPlayerAction,
  sleepToNextDay,
} from "./rules/timeRules.js";
import { resolveWineWormAction } from "./content/wineWormQuest.js";
import { commitBattleResult } from "./rules/battleRules.js";

const STORAGE_KEY = "tianwai-daojuren-save-v2";

export class GameStateStore {
  constructor(storage = window.localStorage) {
    this.storage = storage;
    this.state = createInitialState();
    this.listeners = new Set();
    this.journal = ["你从异世记忆中醒来。方源尚未拿到酒虫。"];
  }

  getState() {
    return this.state;
  }

  getJournal() {
    return [...this.journal];
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  travel(sceneId, entrance, cost = 0) {
    const move = (current) => ({
      ...current,
      scene: {
        id: sceneId,
        entrance,
      },
    });
    const next = cost > 0
      ? resolveTimedPlayerAction(this.state, cost, move)
      : move(this.state);
    this.commit(next, `抵达${sceneId}。`);
  }

  runQuestAction(actionId, context = {}) {
    const next = resolveWineWormAction(this.state, actionId, context);
    this.commit(next, questActionMessage(actionId, next));
  }

  apply(event, message) {
    this.commit(reduceGameState(this.state, event), message);
  }

  sleep() {
    this.commit(sleepToNextDay(this.state), "休息一夜，状态恢复。");
  }

  advanceTick(cost = 1) {
    const next = resolveTimedPlayerAction(this.state, cost, (current) => current);
    this.commit(next, "时间向前推进。");
  }

  commitBattle(battle) {
    const next = commitBattleResult(this.state, battle);
    const message =
      battle.result === "victory"
        ? "你赢下了这场交锋。"
        : battle.result === "escaped"
          ? "你脱离了战场。"
          : "你负伤败退，醒来时已是次日。";
    this.commit(next, message);
  }

  save() {
    this.storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: this.state,
        journal: this.journal,
      })
    );
  }

  load() {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) {
      throw new Error("还没有可读取的存档。");
    }
    const saved = JSON.parse(raw);
    if (!saved.state || saved.state.version !== 2) {
      throw new Error("存档版本不兼容。");
    }
    this.state = createInitialState(saved.state);
    this.journal = Array.isArray(saved.journal) ? saved.journal.slice(-12) : [];
    this.emit();
  }

  reset() {
    this.state = createInitialState();
    this.journal = ["新的推演开始。酒虫仍在客栈商贩手中。"];
    this.emit();
  }

  commit(next, message) {
    this.state = next;
    if (message) {
      this.journal = [...this.journal.slice(-11), message];
    }
    this.emit();
  }

  emit() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

function questActionMessage(actionId, state) {
  const messages = {
    "observe-clerk": "你摸清了伙计交班的空隙。",
    "steal-patrol-sheet": state.flags.patrolSheet
      ? "巡夜薄已悄然落入你手中。"
      : "你没拿到巡夜薄，但记住了一段巡逻空档。",
    "confirm-wine-jar": "异香来自后房那只封泥酒坛。",
    "steal-back-room": state.wineWorm.owner === "player"
      ? "你从酒坛夹层截走了酒虫。"
      : "这次伸手惊动了商贩，酒虫被转移。",
    "follow-fang-yuan": state.wineWorm.owner === "player"
      ? "你借方源制造的混乱，先一步取走酒虫。"
      : "尾随露出破绽，方源开始留意你。",
    "train-at-academy": "学堂修行结束，你领到当日补贴。",
    "ordinary-theft": state.flags.ordinaryTheftSucceeded
      ? "市集里少了四块元石，无人看清是谁。"
      : "这次伸手没有得手。",
    "buy-wine-worm": "元石交割，酒虫归你。",
    "tavern-conflict": state.wineWorm.owner === "player"
      ? "争执遮住众人视线，酒虫已经换了主人。"
      : "混乱没能替你遮住这次失手。",
    sleep: "你休息到次日清晨。",
  };
  return messages[actionId] || "局势发生了变化。";
}
