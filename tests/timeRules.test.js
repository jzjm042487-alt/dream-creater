import test from "node:test";
import assert from "node:assert/strict";

import { createInitialState } from "../src/game/state/createInitialState.js";
import {
  canStartTimedAction,
  resolveTimedPlayerAction,
  sleepToNextDay,
} from "../src/game/rules/timeRules.js";

test("two point actions cannot start after tick ten", () => {
  const state = createInitialState({ clock: { day: 1, tick: 11 } });

  assert.equal(canStartTimedAction(state, 2), false);
  assert.equal(canStartTimedAction(state, 1), true);
});

test("player result at the cutoff resolves before the scheduled Fang Yuan claim", () => {
  const state = createInitialState({
    clock: { day: 2, tick: 6 },
    wineWorm: { owner: "merchant", status: "carried", failedAttempts: 0 },
  });

  const next = resolveTimedPlayerAction(
    state,
    2,
    (current) => ({
      ...current,
      wineWorm: {
        ...current.wineWorm,
        owner: "player",
        status: "unhidden",
      },
    })
  );

  assert.deepEqual(next.clock, { day: 2, tick: 8 });
  assert.equal(next.wineWorm.owner, "player");
});

test("sleep advances to the next morning and restores health and essence", () => {
  const state = createInitialState({
    clock: { day: 1, tick: 7 },
    player: { hp: 9, essence: 2 },
  });

  const next = sleepToNextDay(state);

  assert.deepEqual(next.clock, { day: 2, tick: 0 });
  assert.equal(next.player.hp, 40);
  assert.equal(next.player.essence, 20);
});

test("an exposed wine worm becomes an ordinary Fang Yuan known fact", () => {
  const state = createInitialState({
    wineWorm: { owner: "player", status: "unhidden", failedAttempts: 0 },
  });

  const next = sleepToNextDay(state);

  assert.equal("alert" in next.fangYuan, false);
  assert.equal(next.fangYuan.knownFacts.playerHasWineWorm, true);
  assert.equal(next.fangYuan.relationshipState, "conflict");
});
