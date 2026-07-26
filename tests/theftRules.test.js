import test from "node:test";
import assert from "node:assert/strict";

import { calculateTheftResult } from "../src/game/rules/theftRules.js";

test("theft uses the approved deterministic formula", () => {
  const result = calculateTheftResult({
    theftRank: 1,
    agility: 3,
    insight: 3,
    caution: 2,
    preparation: 4,
    difficulty: 9,
  });

  assert.deepEqual(result, { score: 5, band: "success" });
});

test("theft outcome boundaries are success at three and partial at zero", () => {
  assert.equal(calculateTheftResult({ baseScore: 3, difficulty: 0 }).band, "success");
  assert.equal(calculateTheftResult({ baseScore: 0, difficulty: 0 }).band, "partial");
  assert.equal(calculateTheftResult({ baseScore: -1, difficulty: 0 }).band, "failure");
});
