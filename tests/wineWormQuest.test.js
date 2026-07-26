import test from "node:test";
import assert from "node:assert/strict";

import { createInitialState } from "../src/game/state/createInitialState.js";
import { resolveWineWormAction } from "../src/game/content/wineWormQuest.js";

test("route A acquires the wine worm through the patrol sheet and correct jar", () => {
  let state = createInitialState();
  state = resolveWineWormAction(state, "observe-clerk");
  state = resolveWineWormAction(state, "steal-patrol-sheet");
  state = resolveWineWormAction(state, "confirm-wine-jar");
  state = resolveWineWormAction(state, "steal-back-room");

  assert.equal(state.wineWorm.owner, "player");
  assert.equal(state.wineWorm.status, "unhidden");
  assert.equal(state.fangYuan.alert, 30);
});

test("route B consumes one two-point action and pays for the distraction", () => {
  const state = createInitialState({
    clock: { day: 1, tick: 3 },
  });

  const next = resolveWineWormAction(state, "follow-fang-yuan", {
    checkpoints: ["street", "tavern", "alley"],
    minimumDistance: 70,
  });

  assert.equal(next.clock.tick, 5);
  assert.equal(next.player.stones, 4);
  assert.equal(next.wineWorm.owner, "player");
  assert.equal(next.fangYuan.alert, 32);
});

test("route C can fund the purchase without combat", () => {
  let state = createInitialState();
  state = resolveWineWormAction(state, "train-at-academy");
  state = resolveWineWormAction(state, "ordinary-theft");
  state = resolveWineWormAction(state, "sleep");
  state = resolveWineWormAction(state, "train-at-academy");
  state = resolveWineWormAction(state, "buy-wine-worm");

  assert.equal(state.clock.day, 2);
  assert.equal(state.player.stones, 0);
  assert.equal(state.wineWorm.owner, "player");
  assert.equal(state.fangYuan.alert, 21);
});

test("a partial first attempt reveals the guest room instead of blocking the quest", () => {
  const state = createInitialState();

  const next = resolveWineWormAction(state, "steal-back-room");

  assert.equal(next.wineWorm.owner, "merchant");
  assert.equal(next.wineWorm.status, "guest-room");
  assert.equal(next.wineWorm.failedAttempts, 1);
  assert.equal(next.flags.guestRoomKey, true);
});

test("a second failed acquisition transfers the wine worm to Fang Yuan", () => {
  const state = createInitialState({
    player: {
      stats: { agility: 0, insight: 0, caution: 0 },
    },
    wineWorm: {
      owner: "merchant",
      status: "guest-room",
      failedAttempts: 1,
    },
  });

  const next = resolveWineWormAction(state, "tavern-conflict");

  assert.equal(next.wineWorm.owner, "fangYuan");
  assert.equal(next.wineWorm.failedAttempts, 2);
});
