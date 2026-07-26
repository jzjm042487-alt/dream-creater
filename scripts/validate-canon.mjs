import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CANON = path.join(ROOT, "systems", "canon");
const GENERATED = path.join(CANON, "generated");
const CURATED = path.join(CANON, "curated");
const errors = [];

const seeds = readJson(path.join(CANON, "extraction-seeds.json"));
const manifest = readJson(path.join(GENERATED, "source-manifest.json"));
const chapterIndex = readJson(path.join(GENERATED, "chapter-index.json"));
const sourceSha256 = manifest.source.sha256;
const seedCategories = ["gu", "locations", "factions", "characters", "paths"];
const knownIds = new Set();

for (const category of seedCategories) {
  validateSeedCategory(category, seeds[category] ?? []);
}

if (chapterIndex.sourceSha256 !== sourceSha256) {
  errors.push("generated/chapter-index.json sourceSha256 does not match source-manifest.json");
}
if (chapterIndex.chapters.length !== manifest.source.headingCount) {
  errors.push("chapter index count does not match source manifest headingCount");
}

const chapterBounds = buildChapterBounds(chapterIndex.chapters, manifest.source.lineCount);
const generatedFiles = [
  "gu-mention-index.json",
  "gu-candidate-index.json",
  "location-mention-index.json",
  "faction-mention-index.json",
  "character-mention-index.json",
  "path-mention-index.json"
];
const generated = new Map();

for (const fileName of generatedFiles) {
  const value = readJson(path.join(GENERATED, fileName));
  generated.set(fileName, value);
  if (value.sourceSha256 !== sourceSha256) {
    errors.push(`generated/${fileName} sourceSha256 does not match source-manifest.json`);
  }
  validateEvidence(value, `generated/${fileName}`);
  rejectSourceProseFields(value, `generated/${fileName}`);
}

const canonicalGu = generated.get("gu-mention-index.json").records;
const seedGuIds = new Set(seeds.gu.map((entry) => entry.id));
if (canonicalGu.length !== seeds.gu.length) {
  errors.push(
    `generated/gu-mention-index.json has ${canonicalGu.length} records; expected ${seeds.gu.length}`
  );
}
for (const record of canonicalGu) {
  if (!seedGuIds.has(record.id)) {
    errors.push(`generated/gu-mention-index.json contains unknown Gu id ${record.id}`);
  }
}

const curatedFiles = listJsonFiles(CURATED);
const curatedValues = curatedFiles.map((file) => [file, readJson(file)]);
for (const [, value] of curatedValues) collectLocalIds(value, knownIds);

for (const [file, value] of curatedValues) {
  const label = relative(file);
  if (value.sourceSha256 !== sourceSha256) {
    errors.push(`${label} sourceSha256 does not match source-manifest.json`);
  }
  validateCuratedTopLevel(value, label);
  validateEvidence(value, label);
  rejectSourceProseFields(value, label);
  validateCanonReferences(value, label);
}

if (errors.length) {
  console.error("Canon validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Canon validation passed (${manifest.source.headingCount} chapters, ${seeds.gu.length} verified Gu, ${curatedFiles.length} curated files).`
);

function validateSeedCategory(category, entries) {
  const ids = new Set();
  const surfaces = new Map();

  for (const entry of entries) {
    if (!entry.id?.startsWith("canon_")) {
      errors.push(`extraction-seeds.json ${category} entry has invalid id ${entry.id}`);
    }
    if (ids.has(entry.id)) {
      errors.push(`extraction-seeds.json ${category} duplicates id ${entry.id}`);
    }
    ids.add(entry.id);
    if (knownIds.has(entry.id)) {
      errors.push(`extraction-seeds.json duplicates id across categories: ${entry.id}`);
    }
    knownIds.add(entry.id);

    for (const surface of [entry.name, ...(entry.aliases ?? [])]) {
      const owner = surfaces.get(surface);
      if (owner && owner !== entry.id) {
        errors.push(
          `extraction-seeds.json ${category} surface ${surface} belongs to both ${owner} and ${entry.id}`
        );
      }
      surfaces.set(surface, entry.id);
    }
  }
}

function validateCuratedTopLevel(value, label) {
  if (label.endsWith("early-gu-catalog.json")) {
    for (const record of value.records ?? []) {
      if (!seeds.gu.some((entry) => entry.id === record.id)) {
        errors.push(`${label} record ${record.id} is not registered in extraction-seeds.json gu`);
      }
    }
  }

  if (label.endsWith("qing-mao-world.json")) {
    for (const record of value.locations ?? []) {
      if (!seeds.locations.some((entry) => entry.id === record.id)) {
        errors.push(`${label} location ${record.id} is not registered`);
      }
    }
    for (const record of value.factions ?? []) {
      if (!seeds.factions.some((entry) => entry.id === record.id)) {
        errors.push(`${label} faction ${record.id} is not registered`);
      }
    }
    for (const record of value.characters ?? []) {
      if (!seeds.characters.some((entry) => entry.id === record.id)) {
        errors.push(`${label} character ${record.id} is not registered`);
      }
    }
  }
}

function buildChapterBounds(chapters, sourceLineCount) {
  const bounds = new Map();
  const ids = new Set();
  for (let index = 0; index < chapters.length; index += 1) {
    const chapter = chapters[index];
    if (ids.has(chapter.id)) errors.push(`chapter-index.json duplicates chapter id ${chapter.id}`);
    ids.add(chapter.id);
    const next = chapters[index + 1];
    bounds.set(chapter.id, {
      from: chapter.sourceLine,
      to: next ? next.sourceLine - 1 : sourceLineCount
    });
  }
  return bounds;
}

function validateEvidence(value, label) {
  walk(value, (node, nodePath) => {
    if (!node || typeof node !== "object" || Array.isArray(node) || !node.chapterId) return;
    const bounds = chapterBounds.get(node.chapterId);
    if (!bounds) {
      errors.push(`${label}${nodePath} references unknown chapter ${node.chapterId}`);
      return;
    }

    const lines = [];
    if (Array.isArray(node.sourceLines)) lines.push(...node.sourceLines);
    if (Number.isInteger(node.firstSourceLine)) lines.push(node.firstSourceLine);
    if (Number.isInteger(node.lastSourceLine)) lines.push(node.lastSourceLine);
    for (const line of lines) {
      if (!Number.isInteger(line) || line < bounds.from || line > bounds.to) {
        errors.push(
          `${label}${nodePath} line ${line} is outside ${node.chapterId} (${bounds.from}-${bounds.to})`
        );
      }
    }
  });
}

function rejectSourceProseFields(value, label) {
  const forbidden = new Set(["text", "excerpt", "paragraph", "quote", "sourceText"]);
  walk(value, (node, nodePath) => {
    if (!node || typeof node !== "object" || Array.isArray(node)) return;
    for (const key of Object.keys(node)) {
      if (forbidden.has(key)) errors.push(`${label}${nodePath} contains forbidden source field ${key}`);
    }
  });
}

function validateCanonReferences(value, label) {
  walk(value, (node, nodePath) => {
    if (typeof node !== "string" || !node.startsWith("canon_")) return;
    if (knownIds.has(node) || node.startsWith("canon_material_")) return;
    errors.push(`${label}${nodePath} references unknown canon id ${node}`);
  });
}

function collectLocalIds(value, target) {
  walk(value, (node) => {
    if (
      node &&
      typeof node === "object" &&
      !Array.isArray(node) &&
      typeof node.id === "string" &&
      node.id.startsWith("canon_")
    ) {
      target.add(node.id);
    }
  });
}

function walk(value, visit, currentPath = "") {
  visit(value, currentPath);
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visit, `${currentPath}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, item] of Object.entries(value)) {
    walk(item, visit, `${currentPath}.${key}`);
  }
}

function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    console.error(`${relative(file)} failed to parse: ${error.message}`);
    process.exit(1);
  }
}

function relative(file) {
  return path.relative(ROOT, file).replaceAll("\\", "/");
}
