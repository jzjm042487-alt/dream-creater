import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const coreModule = import("../scripts/canon-extractor-core.mjs").catch(() => null);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("parses Chinese section numbers used by the source", async () => {
  const core = await coreModule;
  assert.ok(core, "canon extractor core should exist");

  assert.equal(core.parseChineseNumber("一"), 1);
  assert.equal(core.parseChineseNumber("三百六十四"), 364);
  assert.equal(core.parseChineseNumber("九百五十一"), 951);
  assert.equal(core.parseChineseNumber("1002"), 1002);
});

test("splits reset section numbering into volumes and reports missing sections", async () => {
  const core = await coreModule;
  assert.ok(core, "canon extractor core should exist");

  const parsed = core.parseCorpus([
    "第一节：开端",
    "青茅山中有一转月光蛊。",
    "第三节：缺口之后",
    "此蛊名为春秋蝉，是六转宙道仙蛊。",
    "第一百二十节：本卷末段",
    "一个倒序标题不应另开新卷。",
    "第二节：新卷缺少首节",
    "方源取得酒虫，能够精炼真元。"
  ].join("\n"));

  assert.deepEqual(
    parsed.chapters.map(({ id, volume, section, sourceLine }) => ({
      id,
      volume,
      section,
      sourceLine
    })),
    [
      { id: "v01-s001", volume: 1, section: 1, sourceLine: 1 },
      { id: "v01-s003", volume: 1, section: 3, sourceLine: 3 },
      { id: "v01-s120", volume: 1, section: 120, sourceLine: 5 },
      { id: "v02-s002", volume: 2, section: 2, sourceLine: 7 }
    ]
  );
  assert.deepEqual(parsed.volumes[0].missingRanges, [
    { from: 2, to: 2 },
    { from: 4, to: 119 }
  ]);
  assert.deepEqual(parsed.volumes[1].missingRanges, [{ from: 1, to: 1 }]);
});

test("does not treat a local out-of-order heading as a new volume", async () => {
  const core = await coreModule;
  assert.ok(core, "canon extractor core should exist");

  const parsed = core.parseCorpus([
    "第一节：开端",
    "第三百二十三节：先出现",
    "第三百二十二节：源文件倒序",
    "第九百五十一节：卷末",
    "第二节：下一卷"
  ].join("\n"));

  assert.equal(parsed.volumes.length, 2);
  assert.equal(parsed.chapters[2].id, "v01-s322");
  assert.equal(parsed.chapters[4].id, "v02-s002");
});

test("repairs a duplicated out-of-order section label when its neighbors prove the sequence", async () => {
  const core = await coreModule;
  assert.ok(core, "canon extractor core should exist");

  const parsed = core.parseCorpus([
    "第三百二十节：前一节",
    "第三百二十三节：误标的三百二十一",
    "第三百二十二节：后一节",
    "第三百二十三节：真正的三百二十三",
    "第三百二十四节：继续"
  ].join("\n"));

  assert.deepEqual(
    parsed.chapters.map((chapter) => chapter.id),
    ["v01-s320", "v01-s321", "v01-s322", "v01-s323", "v01-s324"]
  );
  assert.equal(parsed.chapters[1].sourceSection, 323);
  assert.equal(parsed.chapters[1].sectionCorrection, "sequence-repair");
});

test("accepts scraper headings that omit the title colon", async () => {
  const core = await coreModule;
  assert.ok(core, "canon extractor core should exist");

  const parsed = core.parseCorpus("第一百八十五节散迫身亡不可待\n正文");

  assert.equal(parsed.chapters.length, 1);
  assert.equal(parsed.chapters[0].section, 185);
  assert.equal(parsed.chapters[0].title, "散迫身亡不可待");
});

test("indexes explicit and seeded Gu names without retaining source prose", async () => {
  const core = await coreModule;
  assert.ok(core, "canon extractor core should exist");

  const parsed = core.parseCorpus([
    "第一节：开端",
    "青茅山中有一转月光蛊。",
    "此蛊名为春秋蝉，是六转宙道仙蛊。",
    "第三节：所得",
    "方源取得酒虫，能够精炼真元。"
  ].join("\n"));
  const records = core.extractGuMentions(parsed, { seedNames: ["酒虫"] });
  const byName = new Map(records.map((record) => [record.name, record]));

  assert.deepEqual([...byName.keys()].sort(), ["春秋蝉", "月光蛊", "酒虫"]);
  assert.deepEqual(byName.get("月光蛊").ranks, [1]);
  assert.deepEqual(byName.get("春秋蝉").ranks, [6]);
  assert.deepEqual(byName.get("春秋蝉").paths, ["宙道"]);
  assert.deepEqual(byName.get("酒虫").factTags, ["ability", "acquisition"]);
  assert.equal(byName.get("酒虫").evidence[0].chapterId, "v01-s003");
  assert.doesNotMatch(JSON.stringify(records), /"text"|"excerpt"|"paragraph"/);
});

test("keeps Gu surface names while rejecting actor phrases and Gu Master names", async () => {
  const core = await coreModule;
  assert.ok(core, "canon extractor core should exist");

  const parsed = core.parseCorpus([
    "第一节：交锋",
    "白凝冰撑起天蓬蛊，又撤销水罩蛊。",
    "说话的此人名为雷坦，乃是六转蛊仙。",
    "方源拥有飞剑仙蛊和月光蛊。"
  ].join("\n"));
  const names = core.extractGuMentions(parsed).map((record) => record.name);

  assert.deepEqual(names.sort(), ["天蓬蛊", "月光蛊", "水罩蛊", "飞剑仙蛊"].sort());
  assert.equal(names.some((name) => name.includes("白凝冰")), false);
  assert.equal(names.includes("雷坦"), false);
});

test("trims ranks, quantities, owners, and prose from direct Gu mentions", async () => {
  const core = await coreModule;
  assert.ok(core, "canon extractor core should exist");

  const parsed = core.parseCorpus([
    "第一节：名录",
    "爱情蛊不仅是九转仙蛊。",
    "库中保存八颗紫晶舍利蛊。",
    "白凝冰的冰魄仙蛊已经受损。",
    "这里只剩半只九转仙蛊。"
  ].join("\n"));
  const names = core.extractGuMentions(parsed).map((record) => record.name);

  assert.deepEqual(names.sort(), ["冰魄仙蛊", "爱情蛊", "紫晶舍利蛊"].sort());
  assert.equal(names.includes("仙蛊"), false);
});

test("indexes curated entities by canonical id and aliases", async () => {
  const core = await coreModule;
  assert.ok(core, "canon extractor core should exist");

  const parsed = core.parseCorpus([
    "第一节：山寨",
    "古月一族盘踞青茅山，方源回到古月山寨。",
    "第三节：对峙",
    "古月族与白家寨长期竞争。"
  ].join("\n"));
  const records = core.extractSeededEntityMentions(parsed, [
    { id: "faction_gu_yue_clan", name: "古月一族", aliases: ["古月族"] },
    { id: "location_qing_mao_mountain", name: "青茅山", aliases: [] }
  ]);
  const byId = new Map(records.map((record) => [record.id, record]));

  assert.equal(byId.get("faction_gu_yue_clan").mentionCount, 2);
  assert.deepEqual(byId.get("faction_gu_yue_clan").matchedAliases, ["古月一族", "古月族"]);
  assert.equal(byId.get("location_qing_mao_mountain").evidence[0].chapterId, "v01-s001");
  assert.doesNotMatch(JSON.stringify(records), /"text"|"excerpt"|"paragraph"/);
});

test("compresses repeated evidence into one locator per chapter", async () => {
  const core = await coreModule;
  assert.ok(core, "canon extractor core should exist");

  const parsed = core.parseCorpus([
    "第一节：重复",
    "方源得到月光蛊。",
    "方源再次催动月光蛊。",
    "第二节：下一节",
    "方源收起月光蛊。"
  ].join("\n"));
  const gu = core.extractGuMentions(parsed, { seedNames: ["月光蛊"] }).find(
    (record) => record.name === "月光蛊"
  );
  const characters = core.extractSeededEntityMentions(parsed, [
    { id: "character_fang_yuan", name: "方源", aliases: [] }
  ]);

  assert.equal(gu.evidence.length, 2);
  assert.equal(gu.evidence[0].mentionLines, 2);
  assert.equal(gu.evidence[0].firstSourceLine, 2);
  assert.equal(gu.evidence[0].lastSourceLine, 3);
  assert.equal(characters[0].evidence.length, 2);
  assert.equal(characters[0].evidence[0].mentionCount, 2);
});

test("builds deterministic source metadata and a title-free chapter index", async () => {
  const core = await coreModule;
  assert.ok(core, "canon extractor core should exist");

  const bytes = Buffer.from("第一节：秘密标题\n正文", "utf8");
  const parsed = core.parseCorpus(bytes.toString("utf8"));
  const manifest = core.buildSourceManifest({
    sourceBytes: bytes,
    fileName: "source.txt",
    encoding: "utf8",
    corpus: parsed
  });
  const index = core.buildChapterIndex(parsed, manifest.source.sha256);

  assert.equal(
    manifest.source.sha256,
    "d33e0e25425e142705354eac94d3ffc92fcbc6b7854f84c1fdc86b97dee2a0c0"
  );
  assert.equal(manifest.source.headingCount, 1);
  assert.equal(index.chapters[0].id, "v01-s001");
  assert.match(index.chapters[0].titleHash, /^[a-f0-9]{16}$/);
  assert.equal(JSON.stringify(index).includes("秘密标题"), false);
});

test("CLI writes deterministic indexes from an external source without copying prose", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "canon-extractor-"));
  const sourcePath = path.join(tempRoot, "source.txt");
  const seedsPath = path.join(tempRoot, "seeds.json");
  const outPath = path.join(tempRoot, "out");

  try {
    fs.writeFileSync(
      sourcePath,
      ["第一节：开端", "青茅山中有月光蛊，方源得到酒虫，又称酒蛊。"].join("\n"),
      "utf8"
    );
    fs.writeFileSync(
      seedsPath,
      JSON.stringify({
        schemaVersion: 1,
        gu: [{ id: "gu_wine_worm", name: "酒虫", aliases: ["酒蛊"] }],
        locations: [{ id: "location_qing_mao_mountain", name: "青茅山", aliases: [] }],
        factions: [],
        characters: [{ id: "character_fang_yuan", name: "方源", aliases: [] }],
        paths: []
      }),
      "utf8"
    );

    const result = spawnSync(
      process.execPath,
      [
        path.join(ROOT, "scripts", "extract-canon.mjs"),
        "--source",
        sourcePath,
        "--encoding",
        "utf8",
        "--seeds",
        seedsPath,
        "--out",
        outPath
      ],
      { encoding: "utf8" }
    );

    assert.equal(result.status, 0, result.stderr);
    const guIndex = JSON.parse(
      fs.readFileSync(path.join(outPath, "gu-mention-index.json"), "utf8")
    );
    const locationIndex = JSON.parse(
      fs.readFileSync(path.join(outPath, "location-mention-index.json"), "utf8")
    );
    const allOutput = fs
      .readdirSync(outPath)
      .map((file) => fs.readFileSync(path.join(outPath, file), "utf8"))
      .join("\n");

    const wineWormRecords = guIndex.records.filter(
      (record) => record.id === "gu_wine_worm"
    );
    assert.equal(wineWormRecords.length, 1);
    assert.equal(wineWormRecords[0].name, "酒虫");
    assert.deepEqual(wineWormRecords[0].matchedSurfaces, ["酒虫", "酒蛊"]);
    assert.equal(locationIndex.records[0].id, "location_qing_mao_mountain");
    assert.equal(allOutput.includes("方源得到酒虫"), false);
    assert.equal(allOutput.includes("第一节：开端"), false);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("repository canon artifacts pass cross-reference and evidence validation", () => {
  const result = spawnSync(
    process.execPath,
    [path.join(ROOT, "scripts", "validate-canon.mjs")],
    { cwd: ROOT, encoding: "utf8" }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Canon validation passed/);
});
