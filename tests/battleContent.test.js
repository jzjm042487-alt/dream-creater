import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("battle catalogs contain every locked action, profile, encounter, and fixture", () => {
  const actions = readJson("systems/battle/actions.json");
  const profiles = readJson("systems/battle/ai-profiles.json");
  const encounters = readJson("systems/battle/encounters.json");
  const matrix = readJson("systems/balance/battle-ai-matrix.json");
  const ids = readJson("contracts/demo-v2-ids.json");

  assert.equal(actions.actions.length, 17);
  assert.equal(profiles.profiles.length, 7);
  assert.equal(encounters.encounters.length, 13);
  assert.equal(matrix.encounters.length, 13);

  assert.deepEqual(
    encounters.encounters
      .filter((entry) => entry.enemies.length === 2)
      .map((entry) => entry.battleId),
    ["B-D26-01", "B-Q05-01"]
  );

  assert.deepEqual(
    actions.actions.map((entry) => entry.id),
    ids.systemIds.battleActions
  );
  assert.deepEqual(
    profiles.profiles.map((entry) => entry.id),
    ids.systemIds.battleAiProfiles
  );
  assert.deepEqual(
    encounters.encounters.map((entry) => entry.battleId),
    ids.stableIds.battles
  );
  assert.deepEqual(
    matrix.encounters.map((entry) => entry.battleId),
    ids.stableIds.battles
  );

  for (const action of actions.actions) {
    assert.doesNotMatch(
      action.id,
      /steal|sleight|theft|wine_worm/i,
      `${action.id} must not reintroduce battle theft`
    );
  }

  for (const entry of matrix.encounters) {
    assert.deepEqual(
      entry.builds.map((build) => build.buildId),
      ids.systemIds.battleBalanceReferenceBuilds
    );
    assert.deepEqual(
      entry.policies,
      ids.systemIds.battleBalancePlayerPolicies
    );
  }
});

test("encounter entry variants match the authored mechanical table", () => {
  const encounters = readJson("systems/battle/encounters.json");
  const expected = {
    "B-D07-01": [["default", "battle", 1, 3, "player"]],
    "B-D10-01": [["default", "battle", 1, 3, "player"]],
    "B-D17-01": [["default", "battle", 1, 3, "player"]],
    "B-D19-01": [["default", "battle", 1, 3, "player"]],
    "B-D21-01": [["default", "battle", 1, 3, "player"]],
    "B-D24-01": [
      ["default", "battle", 1, 3, "player"],
      ["retreat_ready", "battle", 0, 3, "player"]
    ],
    "B-D26-01": [
      ["default", "battle", 1, 3, "player"],
      ["retreat_ready", "battle", 0, 3, "player"]
    ],
    "B-D27-01": [["default", "battle", 1, 3, "player"]],
    "B-D29-01": [
      ["default", "battle", 1, 3, "player"],
      ["rock_cover", "battle", 2, 1, "player"],
      ["retreat_ready", "battle", 0, 3, "player"]
    ],
    "B-Q02-01": [
      ["default", "battle", 1, 3, "player"],
      ["enemy_first", "battle", 1, 3, "enemy"],
      ["direct_retreat", "directResult", null, null, "retreat"]
    ],
    "B-Q03-01": [
      ["default", "battle", 1, 3, "player"],
      ["flank", "battle", 1, 1, "player"],
      ["direct_retreat", "directResult", null, null, "retreat"]
    ],
    "B-Q04-01": [
      ["default", "battle", 1, 3, "player"],
      ["flank", "battle", 1, 1, "player"]
    ],
    "B-Q05-01": [
      ["default", "battle", 1, 3, "player"],
      ["flank", "battle", 1, 1, "player"],
      ["direct_retreat", "directResult", null, null, "retreat"]
    ]
  };

  for (const encounter of encounters.encounters) {
    const actual = encounter.entryVariants.map((variant) =>
      variant.mode === "directResult"
        ? [variant.variantId, variant.mode, null, null, variant.result]
        : [
            variant.variantId,
            variant.mode,
            variant.playerSpawn.x,
            variant.playerSpawn.y,
            variant.startingPhase
          ]
    );
    assert.deepEqual(actual, expected[encounter.battleId], encounter.battleId);
  }
});

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, relativePath), "utf8")
  );
}
