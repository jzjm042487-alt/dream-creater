import assert from "node:assert/strict";
import test from "node:test";

import fc from "fast-check";

import {
  getEncounter,
  listBalanceEntries
} from "../src/game/battle/content.js";
import {
  advanceEnemyPhase,
  commitPlayerPlan
} from "../src/game/battle/controller.js";
import { enumerateLegalTurnPlans } from "../src/game/battle/legalPlans.js";
import { choosePlayerPlan } from "../src/game/battle/playerPolicies.js";
import { fnv1aUtf8, hex8 } from "../src/game/battle/random.js";
import { chooseEnemyPlan } from "../src/game/battle/search.js";
import { createAiSnapshot } from "../src/game/battle/snapshot.js";
import { createBattleState } from "../src/game/battle/state.js";

const DIFFICULTIES = Object.freeze([
  "ai_difficulty_beginner",
  "ai_difficulty_standard"
]);
const ENTRIES = listBalanceEntries();

test("legal player commits keep board invariants across catalog states", () => {
  fc.assert(
    fc.property(
      fc.record({
        entryIndex: fc.integer({ min: 0, max: ENTRIES.length - 1 }),
        buildIndex: fc.integer({ min: 0, max: 2 }),
        policyIndex: fc.integer({ min: 0, max: 4 }),
        seedSalt: fc.integer({ min: 0, max: 0xffff })
      }),
      (sample) => {
        const entry = ENTRIES[sample.entryIndex];
        const encounter = getEncounter(entry.battleId);
        const build = entry.builds[sample.buildIndex % entry.builds.length];
        const policyId =
          entry.policies[sample.policyIndex % entry.policies.length];
        const state = createBattleState({
          encounter,
          entryVariantId: entry.recommendedEntryVariantId,
          playerEntry: playerEntryFromBuild(build),
          difficultyId: "ai_difficulty_standard",
          aiSeed: hex8(
            fnv1aUtf8(
              `property|${entry.battleId}|${build.buildId}|${sample.seedSalt}`
            )
          ),
          serial: sample.seedSalt,
          returnScene: {
            id: "property",
            entrance: "property"
          }
        });

        assertBoardInvariants(state);
        const legal = enumerateLegalTurnPlans(state, state.player.unitId);
        assert.ok(legal.plans.length > 0);
        assert.equal(
          new Set(legal.plans.map((plan) => plan.canonicalKey)).size,
          legal.plans.length
        );
        const playerChoice = choosePlayerPlan(state, policyId);
        const afterPlayer = commitPlayerPlan(state, playerChoice.plan).state;
        assertBoardInvariants(afterPlayer);
      }
    ),
    {
      numRuns: 1000,
      seed: 20260727
    }
  );
});

test("battle AI decisions are deterministic on fixed catalog samples", () => {
  for (const entry of ENTRIES) {
    for (const difficultyId of DIFFICULTIES) {
      const encounter = getEncounter(entry.battleId);
      const build = entry.builds[1] ?? entry.builds[0];
      const state = createBattleState({
        encounter,
        entryVariantId: entry.recommendedEntryVariantId,
        playerEntry: playerEntryFromBuild(build),
        difficultyId,
        aiSeed: hex8(fnv1aUtf8(`deterministic|${entry.battleId}`)),
        serial: 0,
        returnScene: {
          id: "property",
          entrance: "property"
        }
      });
      const playerChoice = choosePlayerPlan(
        state,
        entry.policies[0]
      );
      const afterPlayer = commitPlayerPlan(
        state,
        playerChoice.plan
      ).state;
      if (afterPlayer.result || afterPlayer.phase !== "enemy") continue;

      const snapshot = createAiSnapshot(afterPlayer);
      const beforeJson = JSON.stringify(snapshot);
      const first = chooseEnemyPlan(structuredClone(snapshot));
      const second = chooseEnemyPlan(structuredClone(snapshot));
      assert.equal(JSON.stringify(snapshot), beforeJson);
      assert.equal(first.plan.canonicalKey, second.plan.canonicalKey);
      assert.deepEqual(first.settlementSummary, second.settlementSummary);

      const afterEnemy = advanceEnemyPhase(afterPlayer).state;
      assertBoardInvariants(afterEnemy);
    }
  }
});

function playerEntryFromBuild(build) {
  return {
    unitId: "player",
    maxHealth: build.maxHealth,
    maxEssence: build.maxEssence,
    move: build.move,
    strength: build.attributes.strength,
    perception: build.attributes.perception,
    physicalDefense: build.defenses.physical,
    guDefense: build.defenses.gu,
    actionIds: [...build.actionIds],
    revealedActionIds: [...build.actionIds],
    publicItemActions: structuredClone(build.publicItemUses)
  };
}

function assertBoardInvariants(state) {
  const blocked = new Set(
    state.board.blockedCells.map((cell) => cellKey(cell))
  );
  const occupied = new Set();
  for (const unit of [state.player, ...state.enemies]) {
    assert.ok(unit.hp >= 0, `${unit.unitId} hp below zero`);
    assert.ok(unit.hp <= unit.maxHp, `${unit.unitId} hp above max`);
    assert.ok(unit.essence >= 0, `${unit.unitId} essence below zero`);
    assert.ok(
      unit.essence <= unit.maxEssence,
      `${unit.unitId} essence above max`
    );
    if (unit.hp <= 0) continue;
    assert.ok(
      unit.position.x >= 0 &&
        unit.position.x < state.board.width &&
        unit.position.y >= 0 &&
        unit.position.y < state.board.height,
      `${unit.unitId} outside board`
    );
    const key = cellKey(unit.position);
    assert.equal(blocked.has(key), false, `${unit.unitId} on blocked cell`);
    assert.equal(occupied.has(key), false, `${unit.unitId} overlaps`);
    occupied.add(key);
  }
}

function cellKey(cell) {
  return `${cell.x},${cell.y}`;
}
