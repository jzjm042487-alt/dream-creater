import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { UI_PANELS } from "../src/ui-prototype/panelRegistry.js";
import {
  DEMO_STATE,
  SOURCE_OPPORTUNITIES,
  filterSourceOpportunities,
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

test("registers every production panel exactly once", () => {
  const expectedIds = Array.from(
    { length: 18 },
    (_, index) => `UI${String(index).padStart(2, "0")}`
  );
  const actualIds = UI_PANELS.map(({ id }) => id);

  assert.deepEqual(actualIds, expectedIds);
  assert.equal(new Set(actualIds).size, 18);
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
  assert.equal(DEMO_STATE.generator.sourceSync, 92);
  assert.equal(DEMO_STATE.ui.selectedPanel, "UI08");
  assert.equal(DEMO_STATE.player.attributes.length, 9);
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
