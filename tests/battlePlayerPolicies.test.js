import assert from "node:assert/strict";
import test from "node:test";

import {
  PLAYER_POLICY_IDS,
  choosePlayerPlan,
  selectScoredPlayerCandidate
} from "../src/game/battle/playerPolicies.js";
import {
  getBalanceEntry,
  getEncounter
} from "../src/game/battle/content.js";
import { createBattleState } from "../src/game/battle/state.js";

test("five deterministic player policies choose five distinct winners", () => {
  const candidates = [
    candidate("aggressive", {
      damage: 20,
      essenceCost: 3,
      efficiency: 666,
      nearestDistance: 2
    }),
    candidate("kiting", {
      damage: 10,
      essenceCost: 1,
      efficiency: 1000,
      safe: 1,
      incomingDamageBp: 0,
      nearestDistance: 7
    }),
    candidate("defensive", {
      hpGain: 3,
      defends: 1,
      safe: 1,
      incomingDamageBp: 0,
      nearestDistance: 3
    }),
    candidate("conserving", {
      damage: 6,
      zeroEssence: 1,
      essenceCost: 0,
      efficiency: 600,
      incomingDamageBp: 2000,
      nearestDistance: 2
    }),
    candidate(
      "retreat",
      {
        nonRetreat: 0,
        survives: 1,
        pathCost: 1
      },
      "retreat"
    )
  ];
  const expected = {
    player_policy_aggressive: "aggressive",
    player_policy_kiting: "kiting",
    player_policy_defensive: "defensive",
    player_policy_conserving: "conserving",
    player_policy_retreat_aware: "retreat"
  };

  for (const policyId of PLAYER_POLICY_IDS) {
    const options = {
      rootIncomingDamage: 30,
      rootPlayerHp: 30
    };
    assert.equal(
      selectScoredPlayerCandidate(
        policyId,
        candidates,
        options
      ).plan.canonicalKey,
      expected[policyId]
    );
    assert.equal(
      selectScoredPlayerCandidate(
        policyId,
        [...candidates].reverse(),
        options
      ).plan.canonicalKey,
      expected[policyId]
    );
  }
});

test("a third defensive repeat yields to an available progress plan", () => {
  const encounter = getEncounter("B-D17-01");
  const build = getBalanceEntry("B-D17-01").builds.find(
    (entry) => entry.buildId === "reference_balanced"
  );
  const state = createBattleState({
    encounter,
    entryVariantId: "default",
    playerEntry: {
      unitId: "player",
      maxHealth: build.maxHealth,
      maxEssence: build.maxEssence,
      move: build.move,
      strength: build.attributes.strength,
      perception: build.attributes.perception,
      physicalDefense: build.defenses.physical,
      guDefense: build.defenses.gu,
      actionIds: build.actionIds,
      revealedActionIds: build.actionIds,
      publicItemActions: []
    },
    difficultyId: "ai_difficulty_standard",
    aiSeed: "00000000",
    serial: 0,
    returnScene: { id: "test", entrance: "test" }
  });
  state.recentActionCategoriesByUnitId.player = [
    "defend",
    "defend"
  ];

  const selected = choosePlayerPlan(
    state,
    "player_policy_defensive"
  );

  assert.notEqual(selected.plan.action.type, "defend");
  assert.notEqual(
    selected.settlementSummary.actionCategory,
    "defend"
  );
});

test("late-round reference policies force immediate combat progress", () => {
  const encounter = getEncounter("B-D17-01");
  const build = getBalanceEntry("B-D17-01").builds.find(
    (entry) => entry.buildId === "reference_balanced"
  );
  const state = createBattleState({
    encounter,
    entryVariantId: "default",
    playerEntry: {
      unitId: "player",
      maxHealth: build.maxHealth,
      maxEssence: build.maxEssence,
      move: build.move,
      strength: build.attributes.strength,
      perception: build.attributes.perception,
      physicalDefense: build.defenses.physical,
      guDefense: build.defenses.gu,
      actionIds: build.actionIds,
      revealedActionIds: build.actionIds,
      publicItemActions: []
    },
    difficultyId: "ai_difficulty_standard",
    aiSeed: "00000000",
    serial: 0,
    returnScene: { id: "test", entrance: "test" }
  });
  state.round = 5;

  const selected = choosePlayerPlan(
    state,
    "player_policy_defensive"
  );

  assert.ok(selected.metrics.damage > 0);
});

function candidate(canonicalKey, overrides, type = "skill") {
  return {
    plan: {
      canonicalKey,
      pathCost: overrides.pathCost ?? 0,
      essenceCost: overrides.essenceCost ?? 1,
      action: { type }
    },
    metrics: {
      victory: 0,
      nonRetreat: 1,
      survives: 1,
      killCount: 0,
      damage: 0,
      controlGain: 0,
      hpGain: 0,
      incomingDamageBp: 1000,
      incomingControl: 0,
      safe: 0,
      threatensNext: 1,
      nearestDistance: 2,
      zeroEssence: 0,
      efficiency: 0,
      defends: 0,
      essenceCost: overrides.essenceCost ?? 1,
      pathCost: overrides.pathCost ?? 0,
      ...overrides
    }
  };
}
