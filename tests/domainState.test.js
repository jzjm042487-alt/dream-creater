import test from "node:test";
import assert from "node:assert/strict";

import { createInitialState } from "../src/game/state/createInitialState.js";
import { reduceGameState } from "../src/game/state/gameReducer.js";

test("version two state starts outside Gu Yue village with the approved resources", () => {
  const state = createInitialState();

  assert.equal(state.version, 2);
  assert.deepEqual(state.clock, { day: 1, tick: 0 });
  assert.deepEqual(state.scene, { id: "world", entrance: "gu-yue-road" });
  assert.equal(state.player.hp, 40);
  assert.equal(state.player.essence, 20);
  assert.equal(state.player.stones, 6);
  assert.equal("alert" in state.fangYuan, false);
  assert.equal(state.fangYuan.relationshipState, "stranger");
  assert.deepEqual(state.fangYuan.knownFacts, {});
  assert.deepEqual(state.fangYuan.directConflicts, {});
  assert.equal(state.wineWorm.owner, "merchant");
  assert.equal(state.wineWorm.status, "carried");
});

test("hiding the acquired wine worm advances one time point", () => {
  let state = createInitialState();
  state = reduceGameState(state, { type: "WINE_WORM_ACQUIRED", route: "theft" });
  state = reduceGameState(state, { type: "WINE_WORM_HIDDEN" });

  assert.equal(state.wineWorm.owner, "player");
  assert.equal(state.wineWorm.status, "hidden");
  assert.equal(state.clock.tick, 1);
});

test("refining a hidden wine worm consumes essence and two time points", () => {
  let state = createInitialState();
  state = reduceGameState(state, { type: "WINE_WORM_ACQUIRED", route: "trade" });
  state = reduceGameState(state, { type: "WINE_WORM_HIDDEN" });
  state = reduceGameState(state, { type: "WINE_WORM_REFINED" });

  assert.equal(state.wineWorm.status, "refined");
  assert.equal(state.player.cultivation, 30);
  assert.equal(state.player.essence, 12);
  assert.equal(state.clock.tick, 3);
});
