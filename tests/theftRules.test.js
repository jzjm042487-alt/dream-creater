import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateTheftChance,
  getDeterministicPercent,
  resolveTheftRoll
} from "../src/game/rules/theftChance.js";

test("theft uses the approved 15 to 95 chance formula", () => {
  assert.equal(
    calculateTheftChance({
      luck: 50,
      theftMastery: 50,
      playerRankIndex: 1,
      targetRankIndex: 1,
      itemClass: "ordinary"
    }),
    65
  );
  assert.equal(
    calculateTheftChance({
      luck: 0,
      theftMastery: 0,
      playerRankIndex: 0,
      targetRankIndex: 3,
      itemClass: "secured"
    }),
    15
  );
  assert.equal(
    calculateTheftChance({
      luck: 100,
      theftMastery: 100,
      playerRankIndex: 3,
      targetRankIndex: 0,
      itemClass: "ordinary"
    }),
    95
  );
});

test("theft roll is deterministic and advances exactly one cursor", () => {
  const input = {
    seed: "qingmao-phaser-theft-0",
    cursor: 0,
    luck: 55,
    theftMastery: 84,
    playerRankIndex: 1,
    targetRankIndex: 0,
    itemClass: "ordinary"
  };
  const first = resolveTheftRoll(input);
  const repeated = resolveTheftRoll(input);

  assert.deepEqual(first, repeated);
  assert.deepEqual(first, {
    chance: 83,
    roll: 82,
    success: true,
    nextCursor: 1
  });
  assert.equal(getDeterministicPercent(input.seed, 0), 82);
  assert.throws(
    () => calculateTheftChance({ ...input, itemClass: "unknown" }),
    /Unknown theft item class/
  );
});
