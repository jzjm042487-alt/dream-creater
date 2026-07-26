import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadRegistry,
  readJson,
  schemaPathForContent,
  validateSchema,
  validateWildernessGraph
} from "./contract-validator-core.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTRACTS = path.join(ROOT, "contracts");
const registry = loadRegistry();
const selfTestInvalid = process.argv.includes("--self-test-invalid");
const inputs = process.argv.slice(2).filter((arg) => arg !== "--self-test-invalid").map((file) => path.resolve(file));
const files = inputs.length ? inputs : defaultContentFiles();
const errors = [];

if (selfTestInvalid) {
  const value = {
    id: "char_not_registered",
    displayName: "Invalid",
    publicIdentity: "Invalid",
    privateGoal: "Invalid",
    knownFacts: ["Invalid"],
    secrets: [],
    relationshipBaseline: [],
    speechPattern: "Invalid",
    availableEmotions: ["emotion_neutral"]
  };
  const schema = readJson(path.join(CONTRACTS, "character.schema.json"));
  errors.push(
    ...validateSchema(value, schema, registry).map((error) => `temporary-invalid-character.json ${error}`)
  );
} else {
  for (const file of files) {
    const schemaPath = schemaPathForContent(file);
    if (!schemaPath) continue;

    try {
      const value = readJson(file);
      const schema = readJson(schemaPath);
      errors.push(...validateSchema(value, schema, registry).map((error) => `${relative(file)} ${error}`));
      if (path.basename(schemaPath) === "wilderness-map.schema.json") {
        errors.push(...validateWildernessGraph(value).map((error) => `${relative(file)} ${error}`));
      }
    } catch (error) {
      errors.push(`${relative(file)} ${error.message}`);
    }
  }
}

if (errors.length) {
  console.error("Content validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Content validation passed (${files.length} file(s) checked).`);

function defaultContentFiles() {
  const files = [];
  for (const dir of [
    path.join(CONTRACTS, "examples"),
    path.join(ROOT, "systems", "balance"),
    path.join(ROOT, "content")
  ]) {
    if (fs.existsSync(dir)) {
      files.push(...listJsonFiles(dir));
    }
  }
  return files;
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
