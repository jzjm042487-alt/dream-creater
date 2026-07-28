import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VALIDATOR = path.join(ROOT, "scripts", "validate-content.mjs");
const BALANCE = path.join(ROOT, "systems", "balance", "demo-v2.json");

test("simplified contract examples validate", () => {
  const files = [
    "player-state.valid.json",
    "character.valid.json",
    "relationship.valid.json",
    "quest.valid.json",
    "dialogue.valid.json",
    "event.valid.json"
  ].map((name) => path.join(ROOT, "contracts", "examples", name));

  const result = runValidator(files);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("theft-cache discovery uses a structured mastery threshold", () => {
  const balance = JSON.parse(fs.readFileSync(BALANCE, "utf8"));
  const theftCache = balance.hiddenRoutes.find(({ id }) => id === "route_qm_theft_cache");

  assert.deepEqual(theftCache.discoveryCondition, {
    type: "nodeAndAttributeThreshold",
    requiredNodeId: "node_qm_theft_cache",
    attributeId: "theftMastery",
    minimumValue: 20
  });

  const result = runValidator([BALANCE]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("wilderness contract rejects legacy derived-flag thresholds", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "qingmao-wilderness-"));

  try {
    const balance = JSON.parse(fs.readFileSync(BALANCE, "utf8"));
    const theftCache = balance.hiddenRoutes.find(({ id }) => id === "route_qm_theft_cache");
    theftCache.discoveryCondition = {
      type: "nodeAndFlag",
      requiredNodeId: "node_qm_theft_cache",
      requiredFlag: "flags.theftRankAtLeast1"
    };

    const filePath = path.join(tempDir, "wilderness-map.invalid.json");
    fs.writeFileSync(filePath, `${JSON.stringify(balance, null, 2)}\n`, "utf8");

    const result = runValidator([filePath]);
    assert.notEqual(result.status, 0, "legacy derived flags must not satisfy attribute gates");
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /\$\.hiddenRoutes\[1\]\.discoveryCondition/
    );
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("wilderness contract requires every structured threshold field", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "qingmao-wilderness-"));

  try {
    const balance = JSON.parse(fs.readFileSync(BALANCE, "utf8"));
    const theftCache = balance.hiddenRoutes.find(({ id }) => id === "route_qm_theft_cache");
    delete theftCache.discoveryCondition.minimumValue;

    const filePath = path.join(tempDir, "wilderness-map.invalid.json");
    fs.writeFileSync(filePath, `${JSON.stringify(balance, null, 2)}\n`, "utf8");

    const result = runValidator([filePath]);
    assert.notEqual(result.status, 0, "attribute thresholds must declare their minimum value");
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /\$\.hiddenRoutes\.route_qm_theft_cache\.discoveryCondition\.minimumValue is required/
    );
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("temporary invalid authoring files fail at exact field paths and are removed", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "qingmao-contracts-"));
  let assertionError;

  try {
    const fixtures = invalidFixtures();
    const files = fixtures.map(({ name, value }) => {
      const filePath = path.join(tempDir, name);
      fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
      return filePath;
    });

    const result = runValidator(files);
    assert.notEqual(result.status, 0, "invalid fixtures must fail validation");

    const output = `${result.stdout}\n${result.stderr}`;
    for (const fixture of fixtures) {
      for (const expected of fixture.expected) {
        assert.match(output, new RegExp(escapeRegExp(expected)), `missing field-level error: ${expected}`);
      }
    }
  } catch (error) {
    assertionError = error;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  assert.equal(fs.existsSync(tempDir), false, "temporary invalid fixture directory must be removed");
  if (assertionError) throw assertionError;
});

test("validator self-test proves unknown IDs and removed fields are rejected", () => {
  const result = spawnSync(process.execPath, [VALIDATOR, "--self-test-invalid"], {
    cwd: ROOT,
    encoding: "utf8"
  });

  assert.notEqual(result.status, 0, "self-test invalid fixture must fail validation");
  const output = `${result.stdout}\n${result.stderr}`;
  assert.match(output, /\$\.id unknown characters id: char_not_registered/);
  assert.match(output, /\$\.relationshipBaseline\[0\]\.value is not allowed/);
});

test("validator rejects missing and unmapped input files", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "qingmao-dispatch-"));

  try {
    const missingFile = path.join(tempDir, "missing-character.json");
    const missingResult = runValidator([missingFile]);
    assert.notEqual(missingResult.status, 0, "missing input must fail");
    assert.match(`${missingResult.stdout}\n${missingResult.stderr}`, /missing-character\.json does not exist/);

    const unmappedFile = path.join(tempDir, "unmapped.json");
    fs.writeFileSync(unmappedFile, "{}\n", "utf8");
    const unmappedResult = runValidator([unmappedFile]);
    assert.notEqual(unmappedResult.status, 0, "unmapped input must fail");
    assert.match(`${unmappedResult.stdout}\n${unmappedResult.stderr}`, /unmapped\.json has no schema mapping/);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  assert.equal(fs.existsSync(tempDir), false, "dispatch test directory must be removed");
});

function runValidator(files) {
  return spawnSync(process.execPath, [VALIDATOR, ...files], {
    cwd: ROOT,
    encoding: "utf8"
  });
}

function invalidFixtures() {
  return [
    {
      name: "player-state.invalid.json",
      value: {
        health: { current: 70, maximum: 100 },
        primevalEssence: { current: 30, maximum: 60 },
        primevalStones: 18,
        rankId: "rank_unknown",
        cultivationProgress: 25,
        storedOverflow: 0,
        attributes: {
          strength: 20,
          agility: 24,
          perception: 25,
          luck: 30,
          willpower: 22,
          theftMastery: 18
        },
        buffs: [
          {
            id: "buff_unknown",
            duration: "turns",
            remainingTurns: 1
          }
        ],
        debuffs: [],
        fatigue: 4,
        identityExposure: 12,
        oldDebt: 3,
        bloodstain: true
      },
      expected: [
        "$.rankId unknown cultivationRanks id: rank_unknown",
        "$.buffs[0].id unknown buffIds id: buff_unknown",
        "$.fatigue is not allowed",
        "$.identityExposure is not allowed",
        "$.oldDebt is not allowed",
        "$.bloodstain is not allowed"
      ]
    },
    {
      name: "player-state-semantics.invalid.json",
      value: {
        health: { current: 100, maximum: 1 },
        primevalEssence: { current: 30, maximum: 60 },
        primevalStones: 18,
        rankId: "rank_one",
        cultivationProgress: 25,
        storedOverflow: 0,
        attributes: {
          strength: 20,
          agility: 24,
          perception: 25,
          luck: 30,
          willpower: 22,
          theftMastery: 18
        },
        buffs: [
          {
            id: "debuff_wounded",
            duration: "turns"
          }
        ],
        debuffs: [
          {
            id: "buff_training_focus",
            duration: "scene"
          }
        ]
      },
      expected: [
        "$.health.current must be less than or equal to $.health.maximum",
        "$.buffs[0].id unknown buffIds id: debuff_wounded",
        "$.buffs[0].remainingTurns is required when duration is turns",
        "$.debuffs[0].id unknown debuffIds id: buff_training_focus"
      ]
    },
    {
      name: "character.invalid.json",
      value: {
        id: "char_unknown",
        displayName: "Unknown",
        publicIdentity: "Unknown",
        privateGoal: "Unknown",
        knownFacts: ["Unknown"],
        secrets: [],
        relationshipBaseline: [
          {
            sourceCharacterId: "char_unknown",
            targetCharacterId: "char_player",
            kind: "relation_unknown",
            value: 10
          }
        ],
        speechPattern: "Unknown",
        availableEmotions: ["emotion_neutral"]
      },
      expected: [
        "$.id unknown characters id: char_unknown",
        "$.relationshipBaseline[0].sourceCharacterId unknown characters id: char_unknown",
        "$.relationshipBaseline[0].kind unknown relationshipKinds id: relation_unknown",
        "$.relationshipBaseline[0].value is not allowed"
      ]
    },
    {
      name: "relationship.invalid.json",
      value: {
        sourceCharacterId: "char_unknown",
        targetCharacterId: "char_player",
        kind: "relation_unknown",
        value: 10,
        trust: 10,
        suspicion: 10,
        leverage: 10,
        appliedEventDeltaIds: ["delta_hidden_cave_discovered"]
      },
      expected: [
        "$.sourceCharacterId unknown characters id: char_unknown",
        "$.kind unknown relationshipKinds id: relation_unknown",
        "$.value is not allowed",
        "$.trust is not allowed",
        "$.suspicion is not allowed",
        "$.leverage is not allowed",
        "$.appliedEventDeltaIds is not allowed"
      ]
    },
    {
      name: "quest.invalid.json",
      value: {
        id: "quest_unknown",
        title: "Unknown quest",
        status: "active",
        currentStepId: "step_unknown",
        nextStepId: "step_unknown",
        steps: [
          {
            id: "step_unknown",
            objective: "Unknown",
            completionTrigger: "UNKNOWN",
            terminal: false
          }
        ],
        progress: 50,
        requirements: ["relation_trust:20"],
        remediationRoutes: ["collect-evidence"],
        relationshipGate: "relation_trust:20",
        evidenceGate: 3
      },
      expected: [
        "$.id unknown quests id: quest_unknown",
        "$.currentStepId unknown questSteps id: step_unknown",
        "$.nextStepId unknown questSteps id: step_unknown",
        "$.steps[0].id unknown questSteps id: step_unknown",
        "$.progress is not allowed",
        "$.requirements is not allowed",
        "$.remediationRoutes is not allowed",
        "$.relationshipGate is not allowed",
        "$.evidenceGate is not allowed"
      ]
    },
    {
      name: "quest-semantics.invalid.json",
      value: {
        id: "quest_main_qingmao",
        title: "Contradictory completed quest",
        status: "completed",
        currentStepId: "D00-S01",
        nextStepId: "D01-S01",
        steps: [
          {
            id: "D00-S01",
            objective: "Find a lead.",
            completionTrigger: "WINE_WORM_LEAD_FOUND",
            terminal: false,
            nextStepId: "D01-S01"
          },
          {
            id: "D01-S01",
            objective: "Reach the hiding place.",
            completionTrigger: "WINE_WORM_HIDING_PLACE_REACHED",
            terminal: true
          },
          {
            id: "D00-S01",
            objective: "Duplicate step.",
            completionTrigger: "DUPLICATE",
            terminal: true
          }
        ]
      },
      expected: [
        "$.steps[2].id duplicates D00-S01",
        "$.currentStepId must reference a terminal step when status is completed",
        "$.nextStepId is not allowed when status is completed"
      ]
    },
    {
      name: "dialogue.invalid.json",
      value: {
        id: "quest_unknown.zh-CN",
        locale: "zh-CN",
        questId: "quest_unknown",
        nodes: [
          {
            id: "dlg_unknown",
            speakerId: "char_unknown",
            emotionId: "emotion_unknown",
            questStepId: "step_unknown",
            text: "Unknown",
            actionPointCost: 1,
            riskFormula: "luck - suspicion",
            choices: [
              {
                label: "Unknown",
                action: "action_unknown",
                nextNodeId: "dlg_unknown",
                locked: true,
                requiresConfirmation: true
              }
            ]
          }
        ]
      },
      expected: [
        "$.questId unknown quests id: quest_unknown",
        "$.nodes[0].id unknown dialogueNodes id: dlg_unknown",
        "$.nodes[0].speakerId unknown characters id: char_unknown",
        "$.nodes[0].emotionId unknown emotions id: emotion_unknown",
        "$.nodes[0].questStepId unknown questSteps id: step_unknown",
        "$.nodes[0].actionPointCost is not allowed",
        "$.nodes[0].riskFormula is not allowed",
        "$.nodes[0].choices[0].action unknown dialogueChoiceActions id: action_unknown",
        "$.nodes[0].choices[0].nextNodeId unknown dialogueNodes id: dlg_unknown",
        "$.nodes[0].choices[0].locked is not allowed",
        "$.nodes[0].choices[0].requiresConfirmation is not allowed"
      ]
    },
    {
      name: "dialogue-semantics.invalid.json",
      value: {
        id: "quest_main_qingmao.zh-CN",
        locale: "zh-CN",
        questId: "quest_main_qingmao",
        nodes: [
          {
            id: "dlg_wilderness_entry",
            speakerId: "char_player",
            emotionId: "emotion_neutral",
            text: "Leave.",
            choices: [
              {
                label: "End",
                action: "endDialogue",
                nextNodeId: "dlg_hidden_cave_found"
              }
            ]
          }
        ]
      },
      expected: [
        "$.nodes[0].choices[0].nextNodeId is not allowed for action endDialogue"
      ]
    },
    {
      name: "event.invalid.json",
      value: {
        id: "invalid-events.zh-CN",
        locale: "zh-CN",
        events: [
          {
            id: "event_unknown",
            kind: "battle",
            lifetime: "daily",
            text: "Unknown",
            eventDeltaId: "delta_unknown"
          }
        ],
        eventDeltas: [
          {
            id: "delta_unknown",
            applyOnce: true,
            effects: {
              discoverLocationId: "loc_unknown",
              addInventoryItemId: "item_unknown",
              addBuff: {
                id: "buff_training_focus",
                duration: "turns"
              },
              relationshipDeltas: [],
              evidenceDelta: 1,
              fangYuanAlertDelta: 1,
              canonDeviationDelta: 1
            }
          }
        ]
      },
      expected: [
        "$.events[0].id unknown events id: event_unknown",
        "$.events[0].eventDeltaId unknown eventDeltas id: delta_unknown",
        "$.eventDeltas[0].id unknown eventDeltas id: delta_unknown",
        "$.eventDeltas[0].effects.discoverLocationId unknown locations id: loc_unknown",
        "$.eventDeltas[0].effects.addInventoryItemId unknown items id: item_unknown",
        "$.eventDeltas[0].effects.addBuff.remainingTurns is required when duration is turns",
        "$.eventDeltas[0].effects.relationshipDeltas is not allowed",
        "$.eventDeltas[0].effects.evidenceDelta is not allowed",
        "$.eventDeltas[0].effects.fangYuanAlertDelta is not allowed",
        "$.eventDeltas[0].effects.canonDeviationDelta is not allowed"
      ]
    },
    {
      name: "opportunity.invalid.json",
      value: {
        id: "opportunity_unknown",
        title: "Unknown opportunity",
        status: "opportunity_status_unknown",
        resolvedByCharacterId: "char_unknown"
      },
      expected: [
        "$.id unknown opportunities id: opportunity_unknown",
        "$.status unknown opportunityStatuses id: opportunity_status_unknown",
        "$.resolvedByCharacterId unknown characters id: char_unknown"
      ]
    },
    {
      name: "opportunity-semantics.invalid.json",
      value: {
        id: "opportunity_wine_worm",
        title: "Gone opportunity with a contradictory resolver",
        status: "gone",
        resolvedByCharacterId: "char_player"
      },
      expected: [
        "$.resolvedByCharacterId is only allowed when status is resolved"
      ]
    }
  ];
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
