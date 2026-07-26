import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadRegistry,
  readJson,
  validateSchema,
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
checkEnumFile("relationship-dimension.enum.json", registry.relationshipDimensions);

const mapSchema = readJson(path.join(CONTRACTS, "wilderness-map.schema.json"));
for (const file of [
  path.join(ROOT, "systems", "balance", "demo-v2.json"),
  path.join(CONTRACTS, "examples", "wilderness-map.valid.json")
]) {
  const value = readJson(file);
  errors.push(...validateSchema(value, mapSchema, registry).map((error) => `${relative(file)} ${error}`));
  errors.push(...validateWildernessGraph(value).map((error) => `${relative(file)} ${error}`));
}

if (errors.length) {
  console.error("Contract validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Contract validation passed (${listJsonFiles(CONTRACTS).length} JSON files checked).`);

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
