import assert from "node:assert/strict";
import test from "node:test";

import { getProfile } from "../src/game/battle/content.js";
import {
  resolveBattleIntent,
  runBehaviorPolicy
} from "../src/game/battle/behaviorPolicy.js";

test("terminal battles do not create an AI decision", () => {
  assert.equal(
    resolveBattleIntent({
      snapshot: { result: "victory" },
      actorUnitId: "enemy",
      candidates: [],
      profile: getProfile("ai_profile_melee_pursuer")
    }),
    null
  );
});

test("behavior policy resolves exact finish-phase-defend-conserve-attack order", () => {
  const normal = getProfile("ai_profile_melee_pursuer");
  const boss = getProfile("ai_profile_boss_hunter");

  assert.equal(
    run(normal, {
      canFinish: true,
      hasPhaseAction: true,
      shouldDefend: true,
      shouldConserve: true,
      hasEffectiveAttack: true
    }).intent,
    "finish"
  );
  assert.equal(
    run(boss, {
      hasPhaseAction: true,
      shouldDefend: true,
      shouldConserve: true,
      hasEffectiveAttack: true
    }).intent,
    "phase_action"
  );
  assert.equal(
    run(normal, {
      shouldDefend: true,
      shouldConserve: true,
      hasEffectiveAttack: true
    }).intent,
    "defend"
  );
  assert.equal(
    run(normal, {
      shouldConserve: true,
      hasEffectiveAttack: true
    }).intent,
    "conserve"
  );
  assert.equal(
    run(normal, { hasEffectiveAttack: true }).intent,
    "attack"
  );
  assert.equal(run(normal, {}).intent, "reposition");
});

test("one deterministic tree step resolves and never requests randomness", () => {
  const originalRandom = Math.random;
  Math.random = () => {
    throw new Error("Math.random must not be used");
  };

  try {
    const result = runBehaviorPolicy(
      getProfile("ai_profile_duelist"),
      {
        canFinish: false,
        hasPhaseAction: false,
        shouldDefend: false,
        shouldConserve: false,
        hasEffectiveAttack: true
      }
    );
    assert.equal(result.intent, "attack");
    assert.equal(result.steps, 1);
    assert.equal(result.running, false);
    assert.equal(result.state, "SUCCEEDED");
  } finally {
    Math.random = originalRandom;
  }
});

function run(profile, overrides) {
  return runBehaviorPolicy(profile, {
    canFinish: false,
    hasPhaseAction: false,
    shouldDefend: false,
    shouldConserve: false,
    hasEffectiveAttack: false,
    ...overrides
  });
}
