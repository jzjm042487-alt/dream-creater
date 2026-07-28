import assert from "node:assert/strict";
import test from "node:test";

import { getAction, getProfile } from "../src/game/battle/content.js";
import {
  buildEvaluationFeatures,
  compareEnemyDecisions,
  comparePlayerResponses,
  evaluateBattleState,
  filterThirdRepeat
} from "../src/game/battle/evaluator.js";

test("all eight public features use exact root-view definitions", () => {
  const root = makeSnapshot({
    player: { hp: 100, maxHp: 100, position: { x: 4, y: 2 } },
    enemies: [
      makeEnemy({
        hp: 40,
        maxHp: 40,
        essence: 10,
        maxEssence: 10,
        position: { x: 2, y: 2 }
      })
    ]
  });
  const leaf = makeSnapshot({
    player: {
      hp: 50,
      maxHp: 100,
      position: { x: 4, y: 2 },
      statuses: [
        controlStatus("battle_status_test_snare", 20),
        controlStatus("battle_status_test_snare", 30)
      ]
    },
    enemies: [
      makeEnemy({
        hp: 30,
        maxHp: 40,
        essence: 5,
        maxEssence: 10,
        position: { x: 2, y: 2 }
      })
    ]
  });

  assert.deepEqual(
    buildEvaluationFeatures(makeContext(root, leaf)),
    {
      targetLoss: 0.5,
      teamSurvival: 0.75,
      immediateThreat: 0.06,
      exposure: 0.15,
      rangeFit: 1,
      controlValue: 0.3,
      resourceReserve: 0.5,
      coordination: 0
    }
  );
});

test("dead root actor has no threat, exposure, or range fit", () => {
  const root = makeSnapshot();
  const leaf = makeSnapshot({
    enemies: [makeEnemy({ hp: 0 })]
  });

  const features = buildEvaluationFeatures(makeContext(root, leaf));
  assert.equal(features.immediateThreat, 0);
  assert.equal(features.exposure, 0);
  assert.equal(features.rangeFit, 0);
});

test("coordination covers zero, one, and two attacking enemies", () => {
  const noCoverage = makeSnapshot({
    player: { position: { x: 4, y: 2 } },
    enemies: [
      makeEnemy({
        unitId: "enemy-a",
        move: 0,
        position: { x: 1, y: 1 }
      }),
      makeEnemy({
        unitId: "enemy-b",
        move: 0,
        position: { x: 1, y: 2 }
      })
    ]
  });
  const halfCoverage = makeSnapshot({
    player: { position: { x: 4, y: 2 } },
    enemies: [
      makeEnemy({
        unitId: "enemy-a",
        move: 0,
        position: { x: 3, y: 2 }
      }),
      makeEnemy({
        unitId: "enemy-b",
        move: 0,
        position: { x: 2, y: 2 }
      })
    ]
  });
  const fullCoverage = makeSnapshot({
    player: { position: { x: 4, y: 2 } },
    enemies: [
      makeEnemy({
        unitId: "enemy-a",
        move: 0,
        position: { x: 3, y: 2 }
      }),
      makeEnemy({
        unitId: "enemy-b",
        move: 0,
        position: { x: 5, y: 2 }
      })
    ]
  });

  assert.equal(featuresFor(noCoverage).coordination, 1 / 3);
  assert.equal(featuresFor(halfCoverage).coordination, 0.5);
  assert.equal(featuresFor(fullCoverage).coordination, 1);
});

test("terminal scores are exact and simultaneous zero is player victory", () => {
  for (const [result, expected] of [
    ["defeat", 100_000],
    ["retreat", 90_000],
    ["victory", -100_000]
  ]) {
    const leaf = makeSnapshot({ result });
    assert.equal(evaluateBattleState(makeContext(makeSnapshot(), leaf)), expected);
  }

  const simultaneous = makeSnapshot({
    result: "victory",
    player: { hp: 0 },
    enemies: [makeEnemy({ hp: 0 })]
  });
  assert.equal(
    evaluateBattleState(makeContext(makeSnapshot(), simultaneous)),
    -100_000
  );
});

test("weighted terms round independently before adjustments", () => {
  const profile = makeProfile({
    weights: zeroWeights({
      targetLoss: 3,
      teamSurvival: 3
    })
  });
  const root = makeSparseSnapshot(profile);
  const leaf = makeSparseSnapshot(profile, {
    playerHp: 50,
    enemyHp: 20
  });
  const context = makeContext(root, leaf, {
    rootProfileId: profile.id
  });

  assert.equal(evaluateBattleState(context), 4);
});

test("duelist profile applies every published integer weight", () => {
  const root = makeSnapshot({
    player: { hp: 100, maxHp: 100, position: { x: 4, y: 2 } },
    enemies: [
      makeEnemy({
        hp: 40,
        maxHp: 40,
        essence: 10,
        maxEssence: 10,
        position: { x: 2, y: 2 }
      })
    ]
  });
  const leaf = makeSnapshot({
    player: {
      hp: 50,
      maxHp: 100,
      position: { x: 4, y: 2 },
      statuses: [controlStatus("battle_status_test_snare", 30)]
    },
    enemies: [
      makeEnemy({
        hp: 30,
        maxHp: 40,
        essence: 5,
        maxEssence: 10,
        position: { x: 2, y: 2 }
      })
    ]
  });

  assert.equal(evaluateBattleState(makeContext(root, leaf)), 528);
});

test("action and intent adjustments are added to integer utility", () => {
  const profile = makeProfile({ weights: zeroWeights() });
  const action = {
    ...getAction("battle_action_defend"),
    id: "battle_action_test_adjusted",
    aiUtilityAdjustment: 7
  };
  const root = makeSparseSnapshot(profile, { action });
  const leaf = makeSparseSnapshot(profile, { action });
  const baseStep = makeStep();
  baseStep.settlementSummary = {
    ...baseStep.settlementSummary,
    actionId: action.id,
    actionCategory: "defend"
  };

  assert.equal(
    evaluateBattleState(
      makeContext(root, leaf, {
        rootProfileId: profile.id,
        rootIntent: "conserve",
        branchSteps: [
          {
            ...baseStep,
            settlementSummary: {
              ...baseStep.settlementSummary,
              essenceChanges: []
            }
          }
        ]
      })
    ),
    107
  );
});

test("difficulty weights immediate enemy damage monotonically", () => {
  const profile = makeProfile({ weights: zeroWeights() });
  const scores = [
    "ai_difficulty_beginner",
    "ai_difficulty_standard",
    "ai_difficulty_hard",
    "ai_difficulty_prodigy"
  ].map((difficultyId) => {
    const root = makeSparseSnapshot(profile);
    const leaf = makeSparseSnapshot(profile, { playerHp: 90 });
    root.difficultyId = difficultyId;
    leaf.difficultyId = difficultyId;
    const step = makeStep();
    step.settlementSummary.hpChanges = [
      { unitId: "player", delta: -10 }
    ];
    return evaluateBattleState(
      makeContext(root, leaf, {
        rootProfileId: profile.id,
        branchSteps: [step]
      })
    );
  });

  assert.ok(scores[0] < scores[1]);
  assert.ok(scores[1] < scores[2]);
  assert.ok(scores[2] < scores[3]);
});

test("enemy and player tie-breaks are stable and opposite", () => {
  const candidates = [
    decision("z-pass", 10, {
      type: "pass",
      essenceCost: 0,
      pathCost: 1
    }),
    decision("y-skill", 10, {
      type: "skill",
      essenceCost: 3,
      pathCost: 1
    }),
    decision("x-basic", 10, {
      type: "basicAttack",
      essenceCost: 0,
      pathCost: 2
    }),
    decision("w-kill", 10, {
      type: "skill",
      result: "defeat",
      essenceCost: 5,
      pathCost: 3
    })
  ];
  assert.deepEqual(
    [...candidates].sort(compareEnemyDecisions).map(keyOf),
    ["w-kill", "x-basic", "y-skill", "z-pass"]
  );

  const lower = decision("b-lower", 9);
  const lexical = decision("a-lower", 9);
  assert.deepEqual(
    [candidates[0], lower, lexical]
      .sort(comparePlayerResponses)
      .map(keyOf),
    ["a-lower", "b-lower", "z-pass"]
  );
});

test("third defensive repeat is filtered only when progress exists", () => {
  const snapshot = makeSnapshot();
  snapshot.recentActionCategoriesByUnitId.enemy = ["defend", "defend"];
  const defend = candidate("defend", {
    actionCategory: "defend"
  });
  const progress = candidate("damage", {
    actionCategory: "damage",
    hpChanges: [{ unitId: "player", delta: -1 }]
  });

  assert.deepEqual(
    filterThirdRepeat([defend, progress], snapshot, "enemy").map(keyOf),
    ["damage"]
  );
  assert.deepEqual(
    filterThirdRepeat([defend], snapshot, "enemy").map(keyOf),
    ["defend"]
  );
});

function makeContext(rootBeforeSnapshot, leafAfterSnapshot, overrides = {}) {
  return {
    rootActorUnitId: "enemy",
    rootIntent: "attack",
    rootProfileId: "ai_profile_duelist",
    rootBeforeSnapshot,
    leafAfterSnapshot,
    branchSteps: [makeStep()],
    ...overrides
  };
}

function makeStep(overrides = {}) {
  return {
    side: "enemy",
    actorUnitId: "enemy",
    intent: "attack",
    profileId: "ai_profile_duelist",
    beforeSnapshot: null,
    afterSnapshot: null,
    settlementSummary: {
      actionId: "battle_action_basic_melee",
      actionCategory: "damage",
      hpChanges: [],
      essenceChanges: [],
      appliedStatuses: [],
      removedStatuses: [],
      cooldownChanges: [],
      result: null
    },
    ...overrides
  };
}

function makeSnapshot(overrides = {}) {
  const playerOverrides = overrides.player || {};
  const enemies = overrides.enemies || [makeEnemy()];
  const profile = overrides.profile || getProfile("ai_profile_duelist");
  const actions = {
    battle_action_basic_melee: getAction("battle_action_basic_melee"),
    battle_action_defend: getAction("battle_action_defend"),
    battle_action_pass: getAction("battle_action_pass")
  };
  return {
    battleId: "B-TEST",
    round: 1,
    phase: "enemy",
    result: overrides.result ?? null,
    board: {
      width: 8,
      height: 6,
      blockedCells: []
    },
    player: makePlayer(playerOverrides),
    enemies,
    enemyUnitOrder: enemies.map((enemy) => enemy.unitId),
    activeEnemyUnitId: enemies[0]?.unitId ?? null,
    recentActionCategoriesByUnitId: Object.fromEntries(
      enemies.map((enemy) => [enemy.unitId, []])
    ),
    difficultyId: "ai_difficulty_standard",
    aiSeed: "00000000",
    aiCursor: 0,
    decisionIndex: 0,
    content: {
      actions,
      profiles: {
        [profile.id]: profile
      }
    }
  };
}

function makePlayer(overrides = {}) {
  return {
    unitId: "player",
    side: "player",
    position: { x: 4, y: 2 },
    hp: 100,
    maxHp: 100,
    essence: 10,
    maxEssence: 10,
    move: 1,
    strength: 20,
    perception: 20,
    physicalDefense: 1,
    guDefense: 1,
    statuses: [],
    cooldowns: [],
    actionIds: ["battle_action_basic_melee", "battle_action_defend"],
    revealedActionIds: [
      "battle_action_basic_melee",
      "battle_action_defend"
    ],
    publicItemActions: [],
    ...overrides
  };
}

function makeEnemy(overrides = {}) {
  return {
    unitId: "enemy",
    side: "enemy",
    profileId: "ai_profile_duelist",
    position: { x: 2, y: 2 },
    hp: 40,
    maxHp: 40,
    essence: 10,
    maxEssence: 10,
    move: 1,
    strength: 20,
    perception: 20,
    physicalDefense: 1,
    guDefense: 1,
    statuses: [],
    cooldowns: [],
    actionIds: ["battle_action_basic_melee", "battle_action_defend"],
    publicItemActions: [],
    ...overrides
  };
}

function makeProfile(overrides = {}) {
  return {
    ...getProfile("ai_profile_duelist"),
    id: "ai_profile_test",
    ...overrides
  };
}

function makeSparseSnapshot(profile, options = {}) {
  const action =
    options.action || getAction("battle_action_pass");
  const player = makePlayer({
    position: { x: 7, y: 5 },
    hp: options.playerHp ?? 100,
    actionIds: [],
    revealedActionIds: [],
    move: 0
  });
  const enemy = makeEnemy({
    position: { x: 0, y: 0 },
    hp: options.enemyHp ?? 40,
    essence: 0,
    move: 0,
    profileId: profile.id,
    actionIds: [action.id]
  });
  const snapshot = makeSnapshot({
    player,
    enemies: [enemy],
    profile
  });
  snapshot.content.actions = {
    [action.id]: action,
    battle_action_pass: getAction("battle_action_pass")
  };
  return snapshot;
}

function zeroWeights(overrides = {}) {
  return {
    targetLoss: 0,
    teamSurvival: 0,
    immediateThreat: 0,
    exposure: 0,
    rangeFit: 0,
    control: 0,
    resourceReserve: 0,
    coordination: 0,
    ...overrides
  };
}

function controlStatus(statusId, aiControlValue) {
  return {
    statusId,
    duration: "turns",
    remainingTurns: 1,
    aiControlValue
  };
}

function featuresFor(snapshot) {
  const rootActor = snapshot.enemies[0];
  return buildEvaluationFeatures(
    makeContext(snapshot, snapshot, {
      rootActorUnitId: rootActor.unitId,
      rootProfileId: rootActor.profileId
    })
  );
}

function decision(canonicalKey, score, overrides = {}) {
  return {
    score,
    plan: {
      canonicalKey,
      pathCost: overrides.pathCost ?? 0,
      essenceCost: overrides.essenceCost ?? 0,
      action: {
        type: overrides.type ?? "skill",
        actionId: canonicalKey
      }
    },
    settlementSummary: {
      result: overrides.result ?? null,
      hpChanges: [],
      appliedStatuses: []
    }
  };
}

function candidate(canonicalKey, summaryOverrides) {
  return {
    plan: {
      canonicalKey,
      action: {
        type: summaryOverrides.actionCategory,
        actionId: canonicalKey
      }
    },
    settlementSummary: {
      actionCategory: summaryOverrides.actionCategory,
      hpChanges: summaryOverrides.hpChanges || [],
      appliedStatuses: summaryOverrides.appliedStatuses || []
    }
  };
}

function keyOf(candidateValue) {
  return candidateValue.plan.canonicalKey;
}
