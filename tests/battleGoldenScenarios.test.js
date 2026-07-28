import assert from "node:assert/strict";
import test from "node:test";

import {
  getEncounter,
  getProfile,
  listEncounters
} from "../src/game/battle/content.js";
import { enumerateLegalTurnPlans } from "../src/game/battle/legalPlans.js";
import { chooseEnemyPlan } from "../src/game/battle/search.js";
import { createAiSnapshot } from "../src/game/battle/snapshot.js";
import { createBattleState } from "../src/game/battle/state.js";

test("standard chooses a legal kill over non-lethal alternatives", () => {
  const snapshot = makeRealSnapshot({
    enemy: {
      spawn: { x: 2, y: 2 },
      maxHealth: 40,
      maxEssence: 10,
      move: 1,
      strength: 20,
      actionIds: [
        "battle_action_basic_melee",
        "battle_action_defend"
      ]
    },
    player: {
      hp: 5,
      position: { x: 3, y: 2 }
    }
  });
  const result = chooseEnemyPlan(snapshot);

  assert.equal(result.settlementSummary.result, "defeat");
  assert.equal(result.plan.action.actionId, "battle_action_basic_melee");
});

test("melee pursuer takes the canonical route around obstacles then attacks", () => {
  let snapshot = makeRealSnapshot({
    profileId: "ai_profile_melee_pursuer",
    blockedCells: [
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 2, y: 4 }
    ],
    enemy: {
      spawn: { x: 1, y: 2 },
      maxHealth: 40,
      maxEssence: 0,
      move: 3,
      strength: 120,
      actionIds: ["battle_action_basic_melee"]
    },
    player: {
      hp: 40,
      position: { x: 3, y: 2 }
    }
  });

  const first = chooseEnemyPlan(snapshot);
  assert.deepEqual(first.plan.path.slice(0, 3), [
    [1, 2],
    [1, 1],
    [1, 0]
  ]);
  snapshot = first.previewSnapshot;
  const second = chooseEnemyPlan(snapshot);
  assert.equal(second.plan.action.actionId, "battle_action_basic_melee");
  assert.ok(
    second.settlementSummary.hpChanges.some(
      (change) => change.unitId === "player" && change.delta < 0
    )
  );
});

test("a distant melee enemy still closes the raw preferred-range gap", () => {
  const snapshot = makeRealSnapshot({
    profileId: "ai_profile_guardian",
    enemy: {
      spawn: { x: 6, y: 3 },
      maxHealth: 40,
      maxEssence: 0,
      move: 2,
      actionIds: ["battle_action_basic_melee"]
    },
    player: {
      hp: 40,
      position: { x: 0, y: 0 }
    }
  });
  const beforeDistance =
    Math.abs(
      snapshot.enemies[0].position.x - snapshot.player.position.x
    ) +
    Math.abs(
      snapshot.enemies[0].position.y - snapshot.player.position.y
    );

  const result = chooseEnemyPlan(snapshot);
  const afterDistance =
    Math.abs(
      result.plan.destination.x - snapshot.player.position.x
    ) +
    Math.abs(
      result.plan.destination.y - snapshot.player.position.y
    );

  assert.equal(result.intent, "reposition");
  assert.ok(afterDistance < beforeDistance);
});

test("ranged skirmisher creates distance while retaining an attack", () => {
  const snapshot = makeRealSnapshot({
    profileId: "ai_profile_ranged_skirmisher",
    enemy: {
      spawn: { x: 2, y: 2 },
      maxHealth: 38,
      maxEssence: 12,
      move: 3,
      perception: 50,
      actionIds: [
        "battle_action_basic_melee",
        "battle_action_enemy_ranged_strike",
        "battle_action_defend"
      ]
    },
    player: {
      hp: 40,
      position: { x: 3, y: 2 }
    }
  });
  const result = chooseEnemyPlan(snapshot);
  const distance =
    Math.abs(result.plan.destination.x - snapshot.player.position.x) +
    Math.abs(result.plan.destination.y - snapshot.player.position.y);

  assert.ok(distance >= 2);
  assert.equal(
    result.plan.action.actionId,
    "battle_action_enemy_ranged_strike"
  );
});

test("beginner fixed roll may choose the second-ranked candidate", () => {
  const snapshot = makeRealSnapshot({
    difficultyId: "ai_difficulty_beginner"
  });
  const standard = chooseEnemyPlan({
    ...snapshot,
    difficultyId: "ai_difficulty_standard"
  });
  const beginner = chooseEnemyPlan(snapshot, {
    random: () => 0.7
  });

  assert.equal(beginner.choiceIndex, 1);
  assert.notEqual(beginner.plan.canonicalKey, standard.plan.canonicalKey);
});

test("retreat-ready player state exposes a zero-move legal retreat", () => {
  const snapshot = makeRealSnapshot({
    player: {
      position: { x: 0, y: 3 }
    }
  });
  const { plans } = enumerateLegalTurnPlans(
    snapshot,
    snapshot.player.unitId
  );

  assert.ok(
    plans.some(
      (plan) =>
        plan.action.actionId === "battle_action_retreat" &&
        plan.pathCost === 0
    )
  );
});

test("low-health enemy under a revealed kill threat defends or repositions", () => {
  const snapshot = makeRealSnapshot({
    enemy: {
      currentHp: 12,
      spawn: { x: 2, y: 2 },
      maxHealth: 40,
      maxEssence: 10,
      move: 3,
      actionIds: [
        "battle_action_basic_melee",
        "battle_action_defend"
      ]
    },
    player: {
      hp: 40,
      position: { x: 3, y: 2 },
      strength: 400
    }
  });
  const result = chooseEnemyPlan(snapshot);

  assert.equal(result.intent, "defend");
  assert.ok(
    ["defend", "reposition"].includes(
      result.settlementSummary.actionCategory
    )
  );
});

test("boss phase action starts at the exact 0.65 and 0.30 boundaries", () => {
  for (const currentHp of [65, 30]) {
    const snapshot = makeRealSnapshot({
      profileId: "ai_profile_boss_hunter",
      enemy: {
        currentHp,
        spawn: { x: 2, y: 2 },
        maxHealth: 100,
        maxEssence: 24,
        move: 3,
        strength: 70,
        perception: 50,
        actionIds: [
          "battle_action_basic_melee",
          "battle_action_boss_gather_force",
          "battle_action_boss_pounce",
          "battle_action_defend"
        ]
      },
      player: {
        hp: 40,
        position: { x: 5, y: 2 }
      }
    });
    const result = chooseEnemyPlan(snapshot);

    assert.equal(result.intent, "phase_action");
    assert.equal(
      result.plan.action.actionId,
      "battle_action_boss_gather_force"
    );
  }
});

test("pack hunters commit to distinct cells and preserve different sides", () => {
  let snapshot = structuredClone(
    makeCatalogSnapshot(
      "B-D26-01",
      "default",
      "ai_difficulty_standard"
    )
  );
  snapshot.board.blockedCells = [];
  snapshot.player.position = { x: 4, y: 2 };
  snapshot.enemies[0].position = { x: 3, y: 2 };
  snapshot.enemies[1].position = { x: 5, y: 2 };
  const first = chooseEnemyPlan(snapshot);
  snapshot = first.previewSnapshot;
  snapshot.activeEnemyUnitId = snapshot.enemyUnitOrder[1];
  const second = chooseEnemyPlan(snapshot);

  const [firstEnemy, secondEnemy] = second.previewSnapshot.enemies;
  assert.notDeepEqual(firstEnemy.position, secondEnemy.position);
  assert.notEqual(
    mainDirection(firstEnemy.position, second.previewSnapshot.player.position),
    mainDirection(secondEnemy.position, second.previewSnapshot.player.position)
  );
});

test("same saved snapshot produces the same next plan and settlement", () => {
  const snapshot = makeCatalogSnapshot(
    "B-D24-01",
    "retreat_ready",
    "ai_difficulty_standard"
  );
  const first = chooseEnemyPlan(structuredClone(snapshot));
  const reloaded = chooseEnemyPlan(structuredClone(snapshot));

  assert.equal(first.plan.canonicalKey, reloaded.plan.canonicalKey);
  assert.deepEqual(first.settlementSummary, reloaded.settlementSummary);
});

test("every authored retreat-ready entry permits immediate retreat", () => {
  const entries = listEncounters().flatMap((encounter) =>
    encounter.entryVariants
      .filter((variant) => variant.variantId === "retreat_ready")
      .map((variant) => [encounter.battleId, variant.variantId])
  );
  assert.ok(entries.length > 0);

  for (const [battleId, variantId] of entries) {
    const snapshot = makeCatalogSnapshot(
      battleId,
      variantId,
      "ai_difficulty_standard"
    );
    const { plans } = enumerateLegalTurnPlans(
      snapshot,
      snapshot.player.unitId
    );
    assert.ok(
      plans.some(
        (plan) =>
          plan.action.actionId === "battle_action_retreat" &&
          plan.pathCost === 0
      ),
      `${battleId}/${variantId}`
    );
  }
});

function makeRealSnapshot(options = {}) {
  const profileId = options.profileId || "ai_profile_duelist";
  const profile = getProfile(profileId);
  const playerPosition = options.player?.position || { x: 6, y: 3 };
  const encounter = {
    battleId: "B-SEARCH-GOLDEN",
    tierId: "battle_tier_normal",
    board: {
      width: 8,
      height: 6,
      blockedCells: options.blockedCells || []
    },
    entryVariants: [
      {
        variantId: "default",
        mode: "battle",
        playerSpawn: playerPosition,
        startingPhase: "enemy"
      }
    ],
    enemies: [
      {
        unitId: "enemy",
        profileId,
        spawn: options.enemy?.spawn || { x: 2, y: 3 },
        maxHealth: options.enemy?.maxHealth ?? 40,
        maxEssence: options.enemy?.maxEssence ?? 10,
        move: options.enemy?.move ?? 3,
        attributes: {
          strength: options.enemy?.strength ?? 20,
          perception: options.enemy?.perception ?? 20
        },
        defenses: {
          physical: options.enemy?.physicalDefense ?? 1,
          gu: options.enemy?.guDefense ?? 1
        },
        actionIds:
          options.enemy?.actionIds || [
            "battle_action_basic_melee",
            "battle_action_defend"
          ]
      }
    ],
    enemyUnitOrder: ["enemy"],
    resultPolicy: {
      victory: "return",
      defeat: "return",
      retreat: "return"
    }
  };
  const state = createBattleState({
    encounter,
    entryVariantId: "default",
    playerEntry: {
      unitId: "player",
      hp: options.player?.hp ?? 40,
      maxHealth: 40,
      essence: 20,
      maxEssence: 20,
      move: 3,
      strength: options.player?.strength ?? 20,
      perception: 30,
      physicalDefense: 1,
      guDefense: 1,
      actionIds: [
        "battle_action_basic_melee",
        "battle_action_moonblade",
        "battle_action_defend"
      ],
      revealedActionIds: [
        "battle_action_basic_melee",
        "battle_action_defend"
      ],
      publicItemActions: []
    },
    difficultyId:
      options.difficultyId || "ai_difficulty_standard",
    aiSeed: "abc",
    serial: 0,
    returnScene: { id: "world", entrance: "default" }
  });
  state.enemies[0].hp =
    options.enemy?.currentHp ?? state.enemies[0].hp;
  const snapshot = createAiSnapshot(state);
  assert.equal(snapshot.content.profiles[profile.id].id, profile.id);
  return snapshot;
}

function makeCatalogSnapshot(battleId, variantId, difficultyId) {
  const encounter = getEncounter(battleId);
  const state = createBattleState({
    encounter,
    entryVariantId: variantId,
    playerEntry: {
      unitId: "player",
      hp: 40,
      maxHealth: 40,
      essence: 20,
      maxEssence: 20,
      move: 3,
      strength: 20,
      perception: 30,
      physicalDefense: 1,
      guDefense: 1,
      actionIds: [
        "battle_action_basic_melee",
        "battle_action_moonblade",
        "battle_action_defend"
      ],
      revealedActionIds: [
        "battle_action_basic_melee",
        "battle_action_defend"
      ],
      publicItemActions: []
    },
    difficultyId,
    aiSeed: "abc",
    serial: 0,
    returnScene: { id: "world", entrance: "default" }
  });
  state.phase = "enemy";
  state.activeEnemyUnitId = state.enemyUnitOrder[0];
  return createAiSnapshot(state);
}

function mainDirection(position, playerPosition) {
  const dx = position.x - playerPosition.x;
  const dy = position.y - playerPosition.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? "left" : "right";
  return dy < 0 ? "up" : "down";
}
