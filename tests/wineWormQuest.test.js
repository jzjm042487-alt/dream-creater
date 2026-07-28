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
  assert.equal("alert" in state.fangYuan, false);
  assert.deepEqual(state.fangYuan.knownFacts, {});
  assert.equal(state.player.theftRandomCursor, 2);
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
  assert.equal("alert" in next.fangYuan, false);
  assert.equal(next.fangYuan.relationshipState, "rival");
  assert.equal(next.fangYuan.knownFacts.playerCompetesForWineWorm, true);
  assert.equal(next.player.theftRandomCursor, 1);
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
  assert.equal("alert" in state.fangYuan, false);
  assert.equal(state.player.theftRandomCursor, 1);
});

test("a failed ordinary theft consumes the daily target without awarding stones", () => {
  const state = createInitialState({
    player: {
      luck: 0,
      theftMastery: 0,
    },
  });

  const next = resolveWineWormAction(state, "ordinary-theft");

  assert.equal(next.player.stones, state.player.stones);
  assert.equal(next.flags.ordinaryTheftSucceeded, false);
  assert.equal(next.flags.ordinaryTheftDay, state.clock.day);
  assert.equal(next.player.theftRandomCursor, 1);
  assert.throws(
    () => resolveWineWormAction(next, "ordinary-theft"),
    /already been attempted/
  );
});

test("a failed first attempt reveals the guest room instead of blocking the quest", () => {
  const state = createInitialState();

  const next = resolveWineWormAction(state, "steal-back-room");

  assert.equal(next.wineWorm.owner, "merchant");
  assert.equal(next.wineWorm.status, "guest-room");
  assert.equal(next.wineWorm.failedAttempts, 1);
  assert.equal(next.flags.guestRoomKey, true);
  assert.equal(next.player.theftRandomCursor, 1);
});

test("a second failed acquisition transfers the wine worm to Fang Yuan", () => {
  const state = createInitialState({
    player: {
      luck: 0,
      theftMastery: 0,
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
  assert.equal(next.fangYuan.relationshipState, "conflict");
  assert.equal(next.fangYuan.directConflicts.tavernWineWorm, true);
  assert.equal(next.player.theftRandomCursor, 1);
});
