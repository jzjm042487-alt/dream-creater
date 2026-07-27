import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const scriptRoot = `${repoRoot}docs/game-design/qing-mao-mvp-script/`;

const targetFiles = [
  "README.md",
  "00-quest-overview.md",
  "01-main-quest.md",
  "02-q01-wine-worm.md",
  "03-q02-flower-wine-inheritance.md",
  "04-q03-jia-jin-sheng-case.md",
  "05-q04-nine-leaf-vitality-grass.md",
  "06-q05-qing-shu-fate.md",
  "07-npc-state-dialogue.md",
  "08-schedules-states-rewards.md",
];

const recordFiles = targetFiles.filter((file) =>
  /^(?:01|02|03|04|05|06|07)-/.test(file),
);

const earlyMainlineIds = [
  "D_MAIN_CLAN_STEWARD_01",
  "D_MAIN_OLD_CONTACT_01",
  "D_MAIN_ACADEMY_ELDER_01",
  "I_MAIN_AWAKENING_ARRAY_01",
  "D_MAIN_ACADEMY_ELDER_02",
  "D_MAIN_INSTRUCTOR_01",
  "I_MAIN_MOONLIGHT_REFINING_01",
  "D_MAIN_INSTRUCTOR_02",
  "I_MAIN_ACADEMY_TRIAL_01",
  "D_MAIN_ACADEMY_ELDER_03",
];

const laterMainlineIds = [
  "D_MAIN_CARAVAN_ACCOUNTANT_01",
  "I_MAIN_PURPLE_GOLD_STONE_01",
  "D_MAIN_CARAVAN_MERCHANT_01",
  "D_MAIN_CARAVAN_MERCHANT_02",
  "D_MAIN_ACADEMY_ELDER_04",
  "D_MAIN_VILLAGE_GUARD_01",
  "D_MAIN_CLAN_STEWARD_02",
  "D_MAIN_CARAVAN_ACCOUNTANT_02",
  "D_MAIN_BLACK_MARKET_BROKER_01",
  "D_MAIN_QING_SHU_DEPUTY_01",
  "I_MAIN_FLOWER_WINE_EXIT_01",
  "I_MAIN_EMERGENCY_EXIT_01",
];

function readScript(file) {
  return readFileSync(`${scriptRoot}${file}`, "utf8");
}

function parseRecords(file) {
  const source = readScript(file);
  const matches = [...source.matchAll(/^## ([DIB]_[A-Z0-9_]+)\r?$/gm)];

  return matches.map((match, index) => ({
    id: match[1],
    file,
    text: source.slice(match.index, matches[index + 1]?.index ?? source.length),
  }));
}

test("provides every replacement Qing Mao script file", () => {
  for (const file of targetFiles) {
    assert.equal(existsSync(`${scriptRoot}${file}`), true, `${file} must exist`);
  }
});

test("replacement overview states the player-first interaction model", () => {
  const source = readScript("00-quest-overview.md");

  assert.match(source, /玩家是唯一主角/);
  assert.match(source, /找到\s*角色或物件/);
  assert.match(source, /方源.*可选/);
  assert.match(source, /world\.village_closed/);
});

test("provides the complete early-mainline interaction inventory", () => {
  const ids = new Set(recordFiles.flatMap(parseRecords).map(({ id }) => id));

  for (const id of earlyMainlineIds) {
    assert.equal(ids.has(id), true, `${id} must exist`);
  }
});

test("provides caravan, crisis, and permanent-departure interactions", () => {
  const ids = new Set(recordFiles.flatMap(parseRecords).map(({ id }) => id));

  for (const id of laterMainlineIds) {
    assert.equal(ids.has(id), true, `${id} must exist`);
  }
});

test("keeps production records free of visual-novel directions", () => {
  const source = recordFiles.map(readScript).join("\n");

  for (const forbidden of ["[镜头]", "[动作]", "[旁白]", "[音效]", "inline_next"]) {
    assert.equal(source.includes(forbidden), false, `${forbidden} must not appear`);
  }
});
