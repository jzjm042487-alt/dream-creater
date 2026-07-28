import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { PNG } from "pngjs";
import { UI_PANELS } from "../src/ui-prototype/panelRegistry.js";
import {
  calculateTheftChance,
  DEMO_STATE,
  RELATION_GROUPS,
  RIVALS,
  SOURCE_OPPORTUNITIES,
  TOWN_INTERACTABLES,
  WILDERNESS_NODES,
  filterSourceOpportunities,
  isTownPositionWalkable,
  moveTownPosition,
} from "../src/ui-prototype/mockState.js";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const uiEntryPath = `${repoRoot}ui.html`;

test("provides an independent Vite entry for the full UI prototype", () => {
  assert.equal(
    existsSync(uiEntryPath),
    true,
    "ui.html must exist as a separate prototype entry"
  );

  const html = readFileSync(uiEntryPath, "utf8");
  assert.match(html, /id="ui-prototype"/);
  assert.match(html, /src="\/src\/ui-prototype\/main\.js"/);
});

test("registers only the simplified MVP panels", () => {
  const expectedIds = [
    "UI00",
    "UI01",
    "UI02",
    "UI03",
    "UI04",
    "UI05",
    "UI06",
    "UI07",
    "UI08",
    "UI09",
    "UI10",
    "UI11",
    "UI12",
    "UI13",
    "UI15",
    "UI17",
  ];
  const actualIds = UI_PANELS.map(({ id }) => id);

  assert.deepEqual(actualIds, expectedIds);
  assert.equal(new Set(actualIds).size, expectedIds.length);
  assert.equal(
    UI_PANELS.find(({ id }) => id === "UI12")?.title,
    "山寨行走",
    "UI12 is repurposed as the free-movement town scene"
  );
  assert.equal(actualIds.includes("UI14"), false, "evidence board is removed");
  assert.equal(actualIds.includes("UI16"), false, "rollback correction is removed");
  assert.ok(
    UI_PANELS.every(({ title, group, icon }) => title && group && icon),
    "every panel needs navigation metadata"
  );
});

test("starts from the Day 8 wine-worm interception showcase", () => {
  assert.equal(DEMO_STATE.world.day, 8);
  assert.equal(DEMO_STATE.world.act, 2);
  assert.equal(DEMO_STATE.world.location, "花酒行者洞口");
  assert.equal(DEMO_STATE.player.ap.current, 2);
  assert.equal(DEMO_STATE.player.ap.max, 3);
  assert.equal(DEMO_STATE.ui.selectedPanel, "UI08");
  assert.equal(DEMO_STATE.player.attributes.length, 9);
  assert.equal("fatigue" in DEMO_STATE.player, false);
  assert.equal("exposure" in DEMO_STATE.player, false);
  assert.equal("debt" in DEMO_STATE.player, false);
  assert.equal("bloodPollution" in DEMO_STATE.player, false);
  assert.equal("sourceSync" in DEMO_STATE.generator, false);
});

test("filters source opportunities by horizon, entity type, and search text", () => {
  const currentGu = filterSourceOpportunities(SOURCE_OPPORTUNITIES, {
    horizon: "current",
    type: "gu",
    query: "",
  });
  const baiNingBing = filterSourceOpportunities(SOURCE_OPPORTUNITIES, {
    horizon: "three-years",
    type: "all",
    query: "白凝冰",
  });

  assert.ok(currentGu.length > 0);
  assert.ok(
    currentGu.every(
      ({ horizon, type }) => horizon === "current" && type === "gu"
    )
  );
  assert.deepEqual(
    baiNingBing.map(({ id }) => id),
    ["bai-ning-bing-awakening"]
  );
  assert.ok(
    filterSourceOpportunities(SOURCE_OPPORTUNITIES, {
      horizon: "three-years",
      type: "all",
      query: "",
    }).length > currentGu.length
  );
});

test("uses a hidden-route travel graph with four relative choices", () => {
  const entry = WILDERNESS_NODES["bamboo-entry"];

  assert.equal(entry.name, "竹林入口");
  assert.deepEqual(Object.keys(entry.exits).sort(), [
    "back",
    "forward",
    "left",
    "right",
  ]);
  assert.ok(
    Object.values(entry.exits).every((nodeId) => WILDERNESS_NODES[nodeId]),
    "every visible direction must lead to a real node"
  );
});

test("keeps free town movement on streets and outside building walls", () => {
  assert.deepEqual(moveTownPosition({ x: 44, y: 44 }, "up"), {
    x: 44,
    y: 40,
  });
  assert.deepEqual(
    moveTownPosition({ x: 44, y: 44 }, "right"),
    { x: 44, y: 44 },
    "the central compound wall blocks rightward movement"
  );
  assert.equal(isTownPositionWalkable({ x: 58, y: 14 }), false);
  assert.equal(isTownPositionWalkable({ x: 54, y: 51 }), true);
  assert.ok(TOWN_INTERACTABLES.every(({ x, y }) => x >= 0 && y >= 0));
});

test("uses a square-cell eight-frame run cycle for every facing", () => {
  const runSheetPath = `${repoRoot}public/assets/game/characters/player/player_run_sheet_8f.png`;
  assert.equal(existsSync(runSheetPath), true, "the 24-frame run sheet must exist");

  const runSheet = PNG.sync.read(readFileSync(runSheetPath));
  assert.equal(
    runSheet.width / 4,
    runSheet.height / 6,
    "the 4 by 6 sheet must use square animation cells"
  );

  const styles = readFileSync(
    `${repoRoot}src/ui-prototype/styles.css`,
    "utf8"
  );
  assert.match(styles, /background-size:\s*400%\s+600%/);
  assert.match(styles, /animation:\s*town-run-frames\s+0\.5[0-9]s/);
});

test("models relationships as kinship and social graphs without scores", () => {
  assert.deepEqual(Object.keys(RELATION_GROUPS), ["blood", "social"]);

  for (const relation of Object.values(RELATION_GROUPS).flat()) {
    assert.ok(relation.id && relation.name && relation.relation);
    assert.equal("trust" in relation, false);
    assert.equal("suspicion" in relation, false);
    assert.equal("leverage" in relation, false);
  }
});

test("treats Fang Yuan as one killable rival among several talents", () => {
  assert.ok(RIVALS.length >= 5);
  assert.ok(RIVALS.some(({ id }) => id === "fang-yuan"));
  assert.ok(RIVALS.some(({ id }) => id === "bai-ning-bing"));
  assert.ok(RIVALS.every(({ status }) => ["active", "injured", "dead"].includes(status)));
  assert.ok(RIVALS.every((rival) => !("alert" in rival)));
});

test("gives every character a non-zero one-roll theft chance", () => {
  assert.equal(
    calculateTheftChance({ luck: 0, theft: 0, levelGap: -99 }),
    5
  );
  assert.equal(
    calculateTheftChance({ luck: 100, theft: 100, levelGap: 99 }),
    95
  );
  assert.ok(
    calculateTheftChance({ luck: 55, theft: 81, levelGap: 1 }) >
      calculateTheftChance({ luck: 55, theft: 81, levelGap: -1 })
  );
});

test("removed systems no longer appear in UI production modules", () => {
  const files = [
    "src/ui-prototype/main.js",
    "src/ui-prototype/panelRegistry.js",
    "src/ui-prototype/panels/creationPanels.js",
    "src/ui-prototype/panels/worldPanels.js",
    "src/ui-prototype/panels/actionPanels.js",
    "src/ui-prototype/panels/endgamePanels.js",
  ];
  const source = files
    .map((file) => readFileSync(`${repoRoot}${file}`, "utf8"))
    .join("\n");

  for (const removedCopy of [
    "方源警觉",
    "身份暴露",
    "原文同步",
    "所有权记录",
    "证据板",
    "回溯修正",
  ]) {
    assert.equal(source.includes(removedCopy), false, `${removedCopy} must be removed`);
  }
});
