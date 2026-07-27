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

const q05Ids = [
  "D_Q05_QING_SHU_01",
  "D_Q05_QING_SHU_DEPUTY_01",
  "I_Q05_WOLF_ROUTE_01",
  "D_Q05_SCOUT_SURVIVOR_01",
  "I_Q05_ICE_TRACE_01",
  "D_Q05_BAI_NING_BING_01",
  "D_Q05_QING_SHU_02",
  "D_Q05_QING_SHU_DEPUTY_02",
  "D_Q05_MEDICINE_ELDER_01",
  "D_Q05_ARMORY_KEEPER_01",
  "I_Q05_RETREAT_MARKERS_01",
  "D_Q05_QING_SHU_03",
  "D_Q05_QING_SHU_DEPUTY_03",
  "D_Q05_QING_SHU_EXIT_01",
  "D_Q05_QING_SHU_DEPUTY_EXIT_01",
  "D_Q05_QING_SHU_RESULT_SAVED_01",
  "D_Q05_QING_SHU_RESULT_COSTLY_01",
  "D_Q05_QING_SHU_RESULT_REPLACED_01",
  "D_Q05_QING_SHU_RESULT_WITHDREW_01",
  "D_Q05_QING_SHU_DEPUTY_RESULT_DEAD_01",
  "D_Q05_QING_SHU_RESULT_REFUSED_01",
  "D_Q05_QING_SHU_DEPUTY_MISSED_01",
];

const barkIds = [
  "B_CLAN_STEWARD_MAIN_ACTIVE_01",
  "B_CLAN_STEWARD_MAIN_COMPLETE_01",
  "B_ACADEMY_ELDER_MAIN_HIGH_01",
  "B_ACADEMY_ELDER_MAIN_LOW_01",
  "B_FANG_ZHENG_AMBIENT_01",
  "B_FANG_ZHENG_AFTER_AWAKENING_01",
  "B_TAVERN_KEEPER_Q01_COMPLETE_01",
  "B_TAVERN_KEEPER_Q01_OTHER_OWNER_01",
  "B_TAVERN_KEEPER_Q01_MISSED_01",
  "B_HE_NIANG_DEBT_01",
  "B_HE_NIANG_SETTLED_01",
  "B_CLAN_STEWARD_Q02_CLAN_OWNED_01",
  "B_ACADEMY_ELDER_Q02_PLAYER_DEPTH_01",
  "B_QING_SHU_Q02_SHARED_01",
  "B_MEDICINE_ELDER_Q04_PLAYER_OWNS_01",
  "B_MEDICINE_ELDER_Q04_SURRENDERED_01",
  "B_JIANG_YA_Q04_DEAL_01",
  "B_UNCLE_Q04_LOST_01",
  "B_AUNT_Q04_LOST_01",
  "B_JIA_JIN_SHENG_Q03_LEGAL_01",
  "B_JIA_JIN_SHENG_Q03_BLACK_MARKET_01",
  "B_JIA_JIN_SHENG_Q03_RESCUED_01",
  "B_JIA_FU_Q03_LEGAL_01",
  "B_JIA_FU_Q03_DOUBTFUL_01",
  "B_TIE_RUO_NAN_Q03_CLEARED_01",
  "B_TIE_RUO_NAN_Q03_PURSUIT_01",
  "B_QING_SHU_Q05_ACTIVE_01",
  "B_QING_SHU_Q05_SAVED_01",
  "B_QING_SHU_DEPUTY_Q05_DEAD_01",
  "B_BAI_NING_BING_Q05_AFTER_01",
  "B_FANG_YUAN_AMBIENT_01",
  "B_FANG_YUAN_TRADE_01",
  "B_FANG_YUAN_CONFLICT_01",
  "B_FANG_YUAN_Q02_AFTER_01",
];

const requiredHeaders = [
  "类型",
  "ID",
  "所属",
  "拥有者",
  "地点",
  "available_from",
  "expires_after",
  "priority",
  "topic",
  "requires",
  "excludes",
  "once",
  "on_expire",
];

const allowedPriorities = new Set(["100", "80", "70", "60", "30", "10"]);

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

function fieldValue(record, label) {
  return record.text.match(new RegExp(`^${label}：([^\\r\\n]*)`, "m"))?.[1].trim();
}

function choiceBlocks(record, label) {
  return record.text
    .split(new RegExp(`^\\[${label} [A-Z]\\]\\r?$`, "m"))
    .slice(1);
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

test("provides every Qing Shu evidence, preparation, decision, and endpoint", () => {
  const ids = new Set(recordFiles.flatMap(parseRecords).map(({ id }) => id));

  for (const id of q05Ids) {
    assert.equal(ids.has(id), true, `${id} must exist`);
  }
});

test("provides state-aware barks for all major quest consequences", () => {
  const ids = new Set(recordFiles.flatMap(parseRecords).map(({ id }) => id));

  for (const id of barkIds) {
    assert.equal(ids.has(id), true, `${id} must exist`);
  }
});

test("keeps optional Fang Yuan barks on ordinary NPC facts", () => {
  const source = readScript("07-npc-state-dialogue.md");

  for (const forbidden of [
    "npc.fang_yuan.alert",
    "hostility",
    "source_sync",
    "daily_plan",
    "countermeasure",
  ]) {
    assert.equal(source.includes(forbidden), false, `${forbidden} must not appear`);
  }
});

test("uses globally unique canonical record headers", () => {
  const records = recordFiles.flatMap(parseRecords);
  const seen = new Set();

  for (const record of records) {
    assert.equal(seen.has(record.id), false, `duplicate record ${record.id}`);
    seen.add(record.id);

    for (const header of requiredHeaders) {
      assert.match(record.text, new RegExp(`^${header}：`, "m"), `${record.id} lacks ${header}`);
    }

    assert.equal(fieldValue(record, "ID"), record.id);
    assert.match(fieldValue(record, "类型"), /^(?:dialogue|interaction|bark)$/);
    assert.match(fieldValue(record, "所属"), /^(?:MAIN|Q01|Q02|Q03|Q04|Q05|GENERAL)$/);
    assert.match(fieldValue(record, "available_from"), /^D\d{2}_(?:morning|noon|afternoon|evening)$/);
    assert.match(fieldValue(record, "expires_after"), /^D\d{2}_(?:morning|noon|afternoon|evening)$/);
    assert.equal(allowedPriorities.has(fieldValue(record, "priority")), true);
    assert.match(fieldValue(record, "once"), /^(?:true|false)$/);
  }
});

test("gives every record a complete single-interaction body", () => {
  const records = recordFiles.flatMap(parseRecords);

  for (const record of records) {
    const type = fieldValue(record, "类型");
    const owner = fieldValue(record, "拥有者");

    if (type === "dialogue") {
      const choices = choiceBlocks(record, "选择");
      assert.match(owner, /^npc\./, `${record.id} must be owned by an NPC`);
      assert.ok(choices.length >= 2 && choices.length <= 4, `${record.id} must have 2-4 choices`);

      for (const block of choices) {
        assert.match(block, /^\[玩家\]$/m, `${record.id} choice lacks player speech`);
        assert.match(block, /^\[判定\]$/m, `${record.id} choice lacks judgment`);
        assert.match(block, /^\[写入\]$/m, `${record.id} choice lacks writes`);
        assert.match(block, /^\[结束\]\r?\nEND$/m, `${record.id} choice lacks END`);
      }
    } else if (type === "interaction") {
      const operations = choiceBlocks(record, "操作");
      assert.match(owner, /^object\./, `${record.id} must be owned by an object`);
      assert.ok(operations.length >= 1, `${record.id} must have an operation`);

      for (const block of operations) {
        assert.match(block, /^\[判定\]$/m, `${record.id} operation lacks judgment`);
        assert.match(block, /^\[事实结果\]$/m, `${record.id} operation lacks factual result`);
        assert.match(block, /^\[写入\]$/m, `${record.id} operation lacks writes`);
        assert.match(block, /^\[结束\]\r?\nEND$/m, `${record.id} operation lacks END`);
      }
    } else {
      assert.match(owner, /^npc\./, `${record.id} must be owned by an NPC`);
      assert.equal(record.text.includes("[选择 "), false, `${record.id} bark has a choice`);
      assert.equal(record.text.includes("[操作 "), false, `${record.id} bark has an operation`);
      assert.match(record.text, /^\[写入\]$/m);
      assert.match(record.text, /^\[结束\]\r?\nEND$/m);
    }
  }
});

test("keeps production records free of visual-novel directions", () => {
  const source = recordFiles.map(readScript).join("\n");

  for (const forbidden of ["[镜头]", "[动作]", "[旁白]", "[音效]", "inline_next"]) {
    assert.equal(source.includes(forbidden), false, `${forbidden} must not appear`);
  }
});
