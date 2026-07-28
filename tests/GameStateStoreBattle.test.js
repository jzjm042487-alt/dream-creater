import assert from "node:assert/strict";
import test from "node:test";

import { GameStateStore } from "../src/game/GameStateStore.js";
import { serializeActiveBattle } from "../src/game/battle/persistence.js";

test("fresh store writes one v3 envelope with persistent seeds", () => {
  const storage = new MemoryStorage();
  const store = new GameStateStore(storage, {
    cryptoSource: deterministicCrypto()
  });
  const saved = JSON.parse(
    storage.getItem("tianwai-daojuren-save-v3")
  );

  assert.equal(saved.state.version, 3);
  assert.equal(
    saved.state.mvp.theft.theftSeed,
    "000102030405060708090a0b0c0d0e0f"
  );
  assert.equal(
    saved.state.wilderness.expeditionSeed,
    "101112131415161718191a1b1c1d1e1f"
  );
  assert.equal(store.getBattleDifficulty(), "ai_difficulty_standard");
  assert.equal(storage.setCalls, 1);
});

test("v2 migration preserves the old key and prefers v3 afterward", () => {
  const legacy = {
    state: {
      version: 2,
      scene: { id: "world", entrance: "default" },
      player: {},
      inventory: []
    },
    journal: ["legacy"]
  };
  const rawLegacy = JSON.stringify(legacy);
  const storage = new MemoryStorage({
    "tianwai-daojuren-save-v2": rawLegacy
  });
  const store = new GameStateStore(storage, {
    cryptoSource: deterministicCrypto()
  });

  assert.equal(
    storage.getItem("tianwai-daojuren-save-v2"),
    rawLegacy
  );
  assert.equal(store.getState().version, 3);
  assert.ok(storage.getItem("tianwai-daojuren-save-v3"));
});

test("difficulty affects the next battle while active difficulty stays frozen", () => {
  const storage = new MemoryStorage();
  const store = new GameStateStore(storage, {
    cryptoSource: deterministicCrypto()
  });
  store.setBattleDifficulty("ai_difficulty_hard");
  const battle = store.startBattle("B-D17-01");
  store.setBattleDifficulty("ai_difficulty_beginner");

  assert.equal(battle.difficultyId, "ai_difficulty_hard");
  assert.equal(
    store.getActiveBattle().difficultyId,
    "ai_difficulty_hard"
  );
  assert.equal(store.getBattleDifficulty(), "ai_difficulty_beginner");
});

test("failed battle reservation leaves memory and storage unchanged", () => {
  const storage = new MemoryStorage();
  const store = new GameStateStore(storage, {
    cryptoSource: deterministicCrypto()
  });
  const beforeState = structuredClone(store.getState());
  const beforeRaw = storage.getItem("tianwai-daojuren-save-v3");
  storage.failWrites = true;

  assert.throws(() => store.startBattle("B-D17-01"), /write failed/);
  assert.deepEqual(store.getState(), beforeState);
  assert.equal(
    storage.getItem("tianwai-daojuren-save-v3"),
    beforeRaw
  );
});

test("finish callback and generic settlement share one atomic write", () => {
  const storage = new MemoryStorage();
  const store = new GameStateStore(storage, {
    cryptoSource: deterministicCrypto()
  });
  store.startBattle("B-D17-01");
  const active = store.getActiveBattle();
  active.result = "victory";
  active.player.hp = 19;
  store.envelope.state.mvp.battle = serializeActiveBattle(active);
  const beforeWrites = storage.setCalls;

  store.finishBattle((state) => ({
    ...state,
    rewardSentinel: { granted: true }
  }));
  assert.equal(storage.setCalls, beforeWrites + 1);
  assert.equal(store.getState().mvp.battle, null);
  assert.deepEqual(store.getState().rewardSentinel, {
    granted: true
  });

  store.startBattle("B-D17-01");
  const second = store.getActiveBattle();
  second.result = "victory";
  store.envelope.state.mvp.battle = serializeActiveBattle(second);
  const before = structuredClone(store.getState());
  const rawBefore = storage.getItem("tianwai-daojuren-save-v3");
  assert.throws(
    () =>
      store.finishBattle(() => {
        throw new Error("content delta failed");
      }),
    /content delta failed/
  );
  assert.deepEqual(store.getState(), before);
  assert.equal(
    storage.getItem("tianwai-daojuren-save-v3"),
    rawBefore
  );
});

class MemoryStorage {
  constructor(entries = {}) {
    this.values = new Map(Object.entries(entries));
    this.setCalls = 0;
    this.failWrites = false;
  }

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    if (this.failWrites) throw new Error("write failed");
    this.setCalls += 1;
    this.values.set(key, String(value));
  }
}

function deterministicCrypto() {
  let batch = 0;
  return {
    getRandomValues(bytes) {
      const offset = batch * 16;
      bytes.forEach((_, index) => {
        bytes[index] = offset + index;
      });
      batch += 1;
      return bytes;
    }
  };
}
