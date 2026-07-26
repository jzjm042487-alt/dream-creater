import test from "node:test";
import assert from "node:assert/strict";

import { createInitialState, resolveAction } from "../src/gameState.js";

test("initial state starts before awakening with Fang Yuan unaware", () => {
  const state = createInitialState();

  assert.equal(state.day, 1);
  assert.equal(state.actionPoints, 3);
  assert.equal(state.player.realm, "凡人");
  assert.equal(state.fangYuan.alert, 8);
  assert.match(state.memoryHint, /酒香|酒虫|未来/);
});

test("normal training spends action points and increases cultivation without alerting Fang Yuan", () => {
  const state = createInitialState();
  const next = resolveAction(state, "study-at-academy");

  assert.equal(next.actionPoints, 2);
  assert.equal(next.player.cultivation, state.player.cultivation + 8);
  assert.equal(next.fangYuan.alert, state.fangYuan.alert);
  assert.match(next.log.at(-1), /学堂/);
});

test("stealing the roster can partly succeed while raising Fang Yuan alert", () => {
  const state = createInitialState({
    player: { theftRank: 1, stats: { agility: 4, insight: 3, caution: 3 } },
  });

  const next = resolveAction(state, "steal-academy-roster");

  assert.equal(next.actionPoints, 1);
  assert.equal(next.flags.hasRosterLead, true);
  assert.equal(next.fangYuan.alert, 14);
  assert.match(next.log.at(-1), /排班|警觉/);
});

test("ending a day restores action points and advances Fang Yuan plan", () => {
  const state = resolveAction(createInitialState(), "study-at-academy");
  const next = resolveAction(state, "end-day");

  assert.equal(next.day, 2);
  assert.equal(next.actionPoints, 3);
  assert.equal(next.fangYuan.progress, state.fangYuan.progress + 7);
  assert.match(next.log.at(-1), /第二日|方源/);
});

test("end day log names the actual next day instead of repeating day two", () => {
  const dayTwo = resolveAction(createInitialState(), "end-day");
  const dayThree = resolveAction(dayTwo, "end-day");

  assert.equal(dayThree.day, 3);
  assert.match(dayThree.log.at(-1), /第三日/);
  assert.doesNotMatch(dayThree.log.at(-1), /第二日/);
});

test("wine worm quest can progress from roster lead to wine lead and merchant window", () => {
  const withRoster = resolveAction(
    createInitialState({
      player: { stats: { agility: 4, insight: 3, caution: 3 } },
    }),
    "steal-academy-roster"
  );
  const withWineLead = resolveAction(withRoster, "investigate-wine-scent");
  const nextDay = resolveAction(withWineLead, "end-day");
  const withWindow = resolveAction(nextDay, "stakeout-wine-merchant");

  assert.equal(withWineLead.flags.hasWineLead, true);
  assert.equal(withWindow.flags.hasMerchantWindow, true);
  assert.equal(withWindow.quest.wineWorm, "window-open");
});

test("stealing wine worm completes the quest and increases Fang Yuan alert", () => {
  const prepared = createInitialState({
    day: 2,
    flags: { hasWineLead: true, hasMerchantWindow: true },
    quest: { wineWorm: "window-open" },
    player: {
      stats: { agility: 4, insight: 4, caution: 4 },
    },
  });

  const next = resolveAction(prepared, "steal-wine-worm");

  assert.equal(next.quest.wineWorm, "completed");
  assert.equal(next.inventory.includes("wine-worm"), true);
  assert.equal(next.flags.wineWormOwner, "player");
  assert.equal(next.fangYuan.alert, prepared.fangYuan.alert + 24);
});

test("default player can complete the full wine worm route with proper preparation", () => {
  const withRoster = resolveAction(createInitialState(), "steal-academy-roster");
  const withWineLead = resolveAction(withRoster, "investigate-wine-scent");
  const nextDay = resolveAction(withWineLead, "end-day");
  const withWindow = resolveAction(nextDay, "stakeout-wine-merchant");
  const completed = resolveAction(withWindow, "steal-wine-worm");

  assert.equal(completed.quest.wineWorm, "completed");
  assert.equal(completed.flags.wineWormOwner, "player");
});

test("after stealing wine worm player can hide it before refining", () => {
  const completed = createInitialState({
    actionPoints: 3,
    flags: { wineWormOwner: "player" },
    quest: { wineWorm: "completed" },
    inventory: ["wine-worm"],
  });

  const hidden = resolveAction(completed, "hide-wine-worm");

  assert.equal(hidden.flags.wineWormHidden, true);
  assert.equal(hidden.quest.wineWorm, "hidden");
  assert.equal(hidden.actionPoints, 2);
});

test("refining hidden wine worm upgrades quest state and boosts cultivation", () => {
  const hidden = createInitialState({
    actionPoints: 3,
    flags: { wineWormOwner: "player", wineWormHidden: true },
    quest: { wineWorm: "hidden" },
    inventory: ["wine-worm"],
  });

  const refined = resolveAction(hidden, "refine-wine-worm");

  assert.equal(refined.flags.wineWormRefined, true);
  assert.equal(refined.quest.wineWorm, "refined");
  assert.equal(refined.player.cultivation, hidden.player.cultivation + 30);
  assert.equal(refined.actionPoints, 1);
});
