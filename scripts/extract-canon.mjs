import fs from "node:fs";
import path from "node:path";

import {
  buildChapterIndex,
  buildSourceManifest,
  extractGuMentions,
  extractSeededEntityMentions,
  parseCorpus
} from "./canon-extractor-core.mjs";

const options = parseArgs(process.argv.slice(2));
const sourceBytes = fs.readFileSync(options.source);
const sourceText = new TextDecoder(options.encoding).decode(sourceBytes);
const seeds = readJson(options.seeds);
const corpus = parseCorpus(sourceText);
const manifest = buildSourceManifest({
  sourceBytes,
  fileName: path.basename(options.source),
  encoding: options.encoding,
  corpus
});
const sourceSha256 = manifest.source.sha256;
const seededGuNames = (seeds.gu ?? []).flatMap((entry) => [entry.name, ...(entry.aliases ?? [])]);
const guExtraction = curateGuRecords(
  extractGuMentions(corpus, { seedNames: seededGuNames }),
  seeds.gu ?? [],
  new Set(seeds.guDenyNames ?? [])
);

fs.mkdirSync(options.out, { recursive: true });
writeJson("source-manifest.json", manifest);
writeJson("chapter-index.json", buildChapterIndex(corpus, sourceSha256));
writeIndex("gu-mention-index.json", guExtraction.canonical);
writeIndex("gu-candidate-index.json", guExtraction.candidates);

for (const [key, fileName] of [
  ["locations", "location-mention-index.json"],
  ["factions", "faction-mention-index.json"],
  ["characters", "character-mention-index.json"],
  ["paths", "path-mention-index.json"]
]) {
  writeIndex(fileName, extractSeededEntityMentions(corpus, seeds[key] ?? []));
}

console.log(
  [
    `Canon extraction passed`,
    `source=${manifest.source.sha256}`,
    `chapters=${manifest.source.headingCount}`,
    `volumes=${manifest.source.volumeCount}`,
    `guRecords=${guExtraction.canonical.length}`,
    `guCandidates=${guExtraction.candidates.length}`
  ].join(" ")
);

function curateGuRecords(records, seedEntries, denyNames) {
  const seededBySurface = new Map();
  for (const entry of seedEntries) {
    for (const surface of [entry.name, ...(entry.aliases ?? [])]) {
      seededBySurface.set(surface, entry);
    }
  }

  const candidates = records
    .filter((record) => {
      if (denyNames.has(record.name)) return false;
      if (seededBySurface.has(record.name)) return false;
      if (!record.name.endsWith("蛊")) return false;
      if (record.name.length > 6) return false;
      if (looksLikeProse(record.name)) return false;
      return (
        (record.mentionCount >= 2 && record.factTags.length > 0) ||
        (record.confidence === "high" && record.name.endsWith("蛊"))
      );
    })
    .map((record) => ({ ...record, curationStatus: "machine-candidate" }));

  const recordBySurface = new Map(records.map((record) => [record.name, record]));
  const canonical = seedEntries.map((seed) => {
    const surfaces = [seed.name, ...(seed.aliases ?? [])];
    const matchedRecords = surfaces.map((surface) => recordBySurface.get(surface)).filter(Boolean);
    return mergeCanonicalGu(seed, matchedRecords);
  });

  return { canonical, candidates };
}

function mergeCanonicalGu(seed, records) {
  const evidenceByChapter = new Map();
  const ranks = new Set();
  const paths = new Set();
  const factTags = new Set();

  for (const record of records) {
    for (const rank of record.ranks) ranks.add(rank);
    for (const pathName of record.paths) paths.add(pathName);
    for (const tag of record.factTags) factTags.add(tag);
    for (const evidence of record.evidence) {
      const merged = evidenceByChapter.get(evidence.chapterId) ?? {
        chapterId: evidence.chapterId,
        volume: evidence.volume,
        section: evidence.section,
        firstSourceLine: evidence.firstSourceLine,
        lastSourceLine: evidence.lastSourceLine,
        mentionLines: 0,
        reasons: new Set(),
        factTags: new Set()
      };
      merged.firstSourceLine = Math.min(merged.firstSourceLine, evidence.firstSourceLine);
      merged.lastSourceLine = Math.max(merged.lastSourceLine, evidence.lastSourceLine);
      merged.mentionLines += evidence.mentionLines;
      for (const reason of evidence.reasons) merged.reasons.add(reason);
      for (const tag of evidence.factTags) merged.factTags.add(tag);
      evidenceByChapter.set(evidence.chapterId, merged);
    }
  }

  return {
    id: seed.id,
    name: seed.name,
    aliases: seed.aliases ?? [],
    sourceStatus: records.length ? "found" : "not-found",
    mentionCount: records.reduce((sum, record) => sum + record.mentionCount, 0),
    matchedSurfaces: [seed.name, ...(seed.aliases ?? [])].filter((surface) =>
      records.some((record) => record.name === surface)
    ),
    ranks: [...ranks].sort((a, b) => a - b),
    paths: [...paths].sort((a, b) => a.localeCompare(b, "zh-CN")),
    factTags: [...factTags],
    evidence: [...evidenceByChapter.values()]
      .sort((a, b) => a.firstSourceLine - b.firstSourceLine)
      .map((evidence) => ({
        ...evidence,
        reasons: [...evidence.reasons],
        factTags: [...evidence.factTags]
      })),
    curationStatus: "verified-seed"
  };
}

function looksLikeProse(name) {
  return /方源|白凝冰|仙子|天君|本身|本体|比如|帮助|已经|就是|不是|没有|各种|其他|一只|两只|三只|八转|九转|炼蛊|仙蛊和|蛊仙/u.test(
    name
  );
}

function writeIndex(fileName, records) {
  writeJson(fileName, {
    schemaVersion: 1,
    sourceSha256,
    records
  });
}

function writeJson(fileName, value) {
  fs.writeFileSync(path.join(options.out, fileName), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function parseArgs(args) {
  const values = {};
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      fail("Arguments must be supplied as --name value pairs.");
    }
    values[key.slice(2)] = value;
  }

  for (const required of ["source", "seeds", "out"]) {
    if (!values[required]) fail(`Missing required argument --${required}.`);
  }

  return {
    source: path.resolve(values.source),
    seeds: path.resolve(values.seeds),
    out: path.resolve(values.out),
    encoding: values.encoding ?? "gbk"
  };
}

function fail(message) {
  console.error(
    `${message}\nUsage: node scripts/extract-canon.mjs --source <txt> --seeds <json> --out <dir> [--encoding gbk]`
  );
  process.exit(2);
}
