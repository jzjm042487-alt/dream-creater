import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadRegistry,
  readJson,
  schemaPathForContent,
  validateBattleCatalogSet,
  validateContentValue,
  validateWildernessGraph
} from "./contract-validator-core.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTRACTS = path.join(ROOT, "contracts");
const registry = loadRegistry();
const errors = [];

for (const file of listJsonFiles(CONTRACTS)) {
  try {
    readJson(file);
  } catch (error) {
    errors.push(`${relative(file)} failed to parse: ${error.message}`);
  }
}

checkEnumFile("emotion.enum.json", registry.emotions);
checkEnumFile("relationship-kind.enum.json", registry.relationshipKinds);
checkEnumFile("opportunity-status.enum.json", registry.opportunityStatuses);
checkEnumFile("status-duration.enum.json", registry.statusDurations);
checkEnumFile("dialogue-choice-action.enum.json", registry.dialogueChoiceActions);
checkEnumFile("character-life-status.enum.json", registry.characterLifeStatuses);

const contentFiles = [
  ...listJsonFiles(path.join(CONTRACTS, "examples")),
  path.join(ROOT, "systems", "balance", "demo-v2.json"),
  path.join(ROOT, "systems", "battle", "actions.json"),
  path.join(ROOT, "systems", "battle", "ai-profiles.json"),
  path.join(ROOT, "systems", "battle", "encounters.json"),
  path.join(ROOT, "systems", "balance", "battle-ai-matrix.json")
];
let validatedContentCount = 0;

for (const file of contentFiles) {
  const schemaPath = schemaPathForContent(file);
  if (!schemaPath) {
    errors.push(`${relative(file)} has no schema mapping`);
    continue;
  }

  const value = readJson(file);
  validatedContentCount += 1;
  errors.push(
    ...validateContentValue(value, schemaPath, registry).map((error) => `${relative(file)} ${error}`)
  );

  if (path.basename(schemaPath) === "wilderness-map.schema.json") {
    errors.push(...validateWildernessGraph(value).map((error) => `${relative(file)} ${error}`));
  }
}

errors.push(
  ...validateBattleCatalogSet(
    readJson(path.join(ROOT, "systems", "battle", "actions.json")),
    readJson(path.join(ROOT, "systems", "battle", "ai-profiles.json")),
    readJson(path.join(ROOT, "systems", "battle", "encounters.json")),
    readJson(path.join(ROOT, "systems", "balance", "battle-ai-matrix.json")),
    registry
  ).map((error) => `battle catalog set ${error}`)
);

if (errors.length) {
  console.error("Contract validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Contract validation passed (${listJsonFiles(CONTRACTS).length} JSON files parsed, ` +
  `${validatedContentCount} content files validated).`
);

function checkEnumFile(fileName, expected) {
  const actual = readJson(path.join(CONTRACTS, fileName));
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    errors.push(`${fileName} does not match demo-v2-ids.json`);
  }
}

function listJsonFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listJsonFiles(filePath));
    if (entry.isFile() && entry.name.endsWith(".json")) files.push(filePath);
  }
  return files;
}

function relative(file) {
  return path.relative(ROOT, file).replaceAll("\\", "/");
}
