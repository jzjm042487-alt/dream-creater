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

const q01Ids = [
  "D_Q01_TAVERN_KEEPER_01",
  "D_Q01_TAVERN_KEEPER_02",
  "I_Q01_BACK_ROOM_JAR_01",
  "I_Q01_WINE_SCENT_TRAIL_01",
  "D_Q01_HELPER_01",
  "I_Q01_WINE_WORM_01",
  "I_Q01_DORM_REFINING_01",
  "D_Q01_CLAN_STOREKEEPER_01",
  "D_Q01_FANG_YUAN_01",
  "D_Q01_TAVERN_KEEPER_RESULT_PLAYER_01",
  "D_Q01_TAVERN_KEEPER_RESULT_OTHER_01",
  "D_Q01_TAVERN_KEEPER_RESULT_REFUSED_01",
  "D_Q01_TAVERN_KEEPER_RESULT_MISSED_01",
];

const q02Ids = [
  "D_Q02_ACADEMY_ELDER_01",
  "I_Q02_CLAN_ARCHIVE_01",
  "I_Q02_WINE_TRAIL_ENTRY_01",
  "I_Q02_MOUNTAIN_CRACK_01",
  "I_Q02_SHADOW_WALL_01",
  "D_Q02_CLAN_STEWARD_CLAIM_01",
  "D_Q02_QING_SHU_CLAIM_01",
  "D_Q02_FANG_YUAN_CLAIM_01",
  "I_Q02_EARTH_FLOWER_01",
  "I_Q02_WHITE_BOAR_TRAINING_01",
  "I_Q02_STRENGTH_GATE_01",
  "I_Q02_JADE_CHAMBER_01",
  "I_Q02_HIDDEN_CHAMBER_01",
  "I_Q02_SECRET_MAP_01",
  "D_Q02_CLAN_STEWARD_SETTLEMENT_01",
  "D_Q02_ACADEMY_ELDER_RESULT_01",
  "D_Q02_ACADEMY_ELDER_FAILED_01",
  "D_Q02_ACADEMY_ELDER_REFUSED_01",
  "D_Q02_ACADEMY_ELDER_MISSED_01",
];

const q03Ids = [
  "D_Q03_JIA_JIN_SHENG_01",
  "D_Q03_CARAVAN_ACCOUNTANT_01",
  "D_Q03_JIA_JIN_SHENG_02",
  "I_Q03_UNREGISTERED_CRATE_01",
  "D_Q03_JIA_JIN_SHENG_03",
  "D_Q03_CARAVAN_GUARD_01",
  "I_Q03_MOUNTAIN_ROAD_01",
  "I_Q03_CRIME_SCENE_01",
  "D_Q03_WITNESS_01",
  "D_Q03_JIA_FU_01",
  "D_Q03_JIA_FU_02",
  "D_Q03_TIE_RUO_NAN_01",
  "D_Q03_TIE_RUO_NAN_02",
  "D_Q03_JIA_FU_REWARD_LEGAL_01",
  "D_Q03_BLACK_MARKET_BROKER_REWARD_01",
  "D_Q03_JIA_FU_FAILED_01",
  "D_Q03_JIA_FU_REFUSED_01",
  "D_Q03_JIA_FU_MISSED_01",
];

const q04Ids = [
  "D_Q04_HE_NIANG_01",
  "D_Q04_UNCLE_01",
  "D_Q04_AUNT_01",
  "I_Q04_PARENT_LEDGER_01",
  "I_Q04_CUSTODY_RECORD_01",
  "D_Q04_MEDICINE_ELDER_01",
  "D_Q04_JIANG_YA_01",
  "D_Q04_HE_NIANG_02",
  "I_Q04_NINE_LEAF_GRASS_01",
  "D_Q04_UNCLE_RESULT_FAILED_01",
  "D_Q04_UNCLE_RESULT_REFUSED_01",
  "D_Q04_MEDICINE_ELDER_SETTLEMENT_01",
  "D_Q04_JIANG_YA_SETTLEMENT_01",
  "D_Q04_MEDICINE_ELDER_MISSED_01",
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

test("provides every Wine Worm route and terminal response", () => {
  const ids = new Set(recordFiles.flatMap(parseRecords).map(({ id }) => id));

  for (const id of q01Ids) {
    assert.equal(ids.has(id), true, `${id} must exist`);
  }
});

test("provides every Flower Wine entrance, chamber, and terminal response", () => {
  const ids = new Set(recordFiles.flatMap(parseRecords).map(({ id }) => id));

  for (const id of q02Ids) {
    assert.equal(ids.has(id), true, `${id} must exist`);
  }
});

test("provides every Jia Jin Sheng route, investigation, and endpoint", () => {
  const ids = new Set(recordFiles.flatMap(parseRecords).map(({ id }) => id));

  for (const id of q03Ids) {
    assert.equal(ids.has(id), true, `${id} must exist`);
  }
});

test("provides every Nine Leaf ownership route and endpoint", () => {
  const ids = new Set(recordFiles.flatMap(parseRecords).map(({ id }) => id));

  for (const id of q04Ids) {
    assert.equal(ids.has(id), true, `${id} must exist`);
  }
});

test("keeps production records free of visual-novel directions", () => {
  const source = recordFiles.map(readScript).join("\n");

  for (const forbidden of ["[镜头]", "[动作]", "[旁白]", "[音效]", "inline_next"]) {
    assert.equal(source.includes(forbidden), false, `${forbidden} must not appear`);
  }
});
