import assert from "node:assert/strict";
import test from "node:test";

import {
  beginnerChoiceIndex,
  deriveBattleSeed,
  deriveBattleSeedRoot,
  deterministicRandom
} from "../src/game/battle/random.js";

test("battle random functions match the approved fixed vectors", () => {
  assert.equal(deterministicRandom("00000000", 0), 0.5137210513930768);
  assert.equal(deterministicRandom("abc", 0), 0.11610232456587255);
  assert.equal(deterministicRandom("abc", 1), 0.25398650323040783);
  assert.equal(deriveBattleSeedRoot("theft-seed"), "fe5f99fb");
  assert.equal(deriveBattleSeed("fe5f99fb", "B-D10-01", 0), "54c47c21");
});

test("battle random rejects unstable seed, cursor, and serial inputs", () => {
  for (const seed of [null, 1, {}, []]) {
    assert.throws(() => deterministicRandom(seed, 0), /seed must be a string/);
  }
  for (const cursor of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1, Infinity]) {
    assert.throws(
      () => deterministicRandom("abc", cursor),
      /cursor must be a non-negative safe integer/
    );
  }
  for (const serial of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1, Infinity]) {
    assert.throws(
      () => deriveBattleSeed("root", "B-D10-01", serial),
      /serial must be a non-negative safe integer/
    );
  }
});

test("beginner choice buckets preserve exact edge semantics", () => {
  assert.equal(beginnerChoiceIndex(1, 0.9999999999999999), 0);

  assert.equal(beginnerChoiceIndex(2, 0), 0);
  assert.equal(beginnerChoiceIndex(2, 0.599999), 0);
  assert.equal(beginnerChoiceIndex(2, 0.6), 1);
  assert.equal(beginnerChoiceIndex(2, 0.849999), 1);
  assert.equal(beginnerChoiceIndex(2, 0.85), 0);
  assert.equal(beginnerChoiceIndex(2, 0.9999999999999999), 0);

  assert.equal(beginnerChoiceIndex(3, 0), 0);
  assert.equal(beginnerChoiceIndex(3, 0.599999), 0);
  assert.equal(beginnerChoiceIndex(3, 0.6), 1);
  assert.equal(beginnerChoiceIndex(3, 0.849999), 1);
  assert.equal(beginnerChoiceIndex(3, 0.85), 2);
  assert.equal(beginnerChoiceIndex(3, 0.9999999999999999), 2);
});
