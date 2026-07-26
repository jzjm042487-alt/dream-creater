import test from "node:test";
import assert from "node:assert/strict";

import { createInitialState } from "../src/game/state/createInitialState.js";
import {
  commitBattleResult,
  createBattleState,
  getReachableCells,
  reduceBattle,
} from "../src/game/rules/battleRules.js";

test("battle movement is orthogonal and limited to three cells", () => {
  const battle = createBattleState("forest", createInitialState());
  const reachable = getReachableCells(battle);

  assert.equal(reachable.some(({ x, y }) => x === 4 && y === 4), true);
  assert.equal(reachable.some(({ x, y }) => x === 4 && y === 1), false);
  assert.equal(reachable.some(({ x, y }) => x === 3 && y === 3), true);
});

test("basic attack deals eight damage before the enemy turn", () => {
  const battle = createBattleState("forest", createInitialState(), {
    player: { x: 2, y: 2 },
    enemy: { x: 3, y: 2 },
  });

  const next = reduceBattle(battle, { type: "ATTACK" });

  assert.equal(next.enemy.hp, 20);
});

test("defense rounds Fang Yuan damage down from nine to four", () => {
  const battle = createBattleState("fangYuan", createInitialState(), {
    player: { x: 2, y: 2 },
    enemy: { x: 3, y: 2 },
  });

  const next = reduceBattle(battle, { type: "DEFEND" });

  assert.equal(next.player.hp, 36);
});

test("stealing the wine worm then escaping commits player ownership", () => {
  const persistent = createInitialState({
    wineWorm: { owner: "fangYuan", status: "carried", failedAttempts: 2 },
    flags: { fangYuanActionWindow: true },
  });
  let battle = createBattleState("fangYuan", persistent, {
    player: { x: 0, y: 2 },
    enemy: { x: 1, y: 2 },
  });

  battle = reduceBattle(battle, { type: "SLEIGHT_OF_HAND" });
  battle = reduceBattle(battle, { type: "ESCAPE" });
  const next = commitBattleResult(persistent, battle);

  assert.equal(next.wineWorm.owner, "player");
  assert.equal(next.wineWorm.status, "unhidden");
});

test("defeat with eighteen stones loses exactly four and advances to next morning", () => {
  const persistent = createInitialState({
    clock: { day: 2, tick: 9 },
    player: { hp: 3, stones: 18 },
  });
  const battle = createBattleState("fangYuan", persistent, {
    player: { x: 2, y: 2, hp: 3 },
    enemy: { x: 3, y: 2 },
  });

  const defeated = reduceBattle(battle, { type: "ATTACK" });
  const next = commitBattleResult(persistent, defeated);

  assert.equal(defeated.result, "defeat");
  assert.equal(next.player.stones, 14);
  assert.deepEqual(next.clock, { day: 3, tick: 0 });
});
