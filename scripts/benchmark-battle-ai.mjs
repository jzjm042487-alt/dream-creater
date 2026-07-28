import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

import {
  getEncounter,
  listBalanceEntries
} from "../src/game/battle/content.js";
import { commitPlayerPlan } from "../src/game/battle/controller.js";
import { choosePlayerPlan } from "../src/game/battle/playerPolicies.js";
import { fnv1aUtf8, hex8 } from "../src/game/battle/random.js";
import { chooseEnemyPlan } from "../src/game/battle/search.js";
import { createAiSnapshot } from "../src/game/battle/snapshot.js";
import { createBattleState } from "../src/game/battle/state.js";

const DIFFICULTIES = Object.freeze([
  "ai_difficulty_beginner",
  "ai_difficulty_standard",
  "ai_difficulty_hard",
  "ai_difficulty_prodigy"
]);
const DEFAULT_WARMUPS_PER_DIFFICULTY = 100;
const DEFAULT_MEASURED_PER_DIFFICULTY = 1000;

const args = parseArgs(process.argv.slice(2));
const cases = createBenchmarkCases();
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  node: process.version,
  platform: `${process.platform}-${process.arch}`,
  warmupsPerDifficulty: args.warmups,
  measuredPerDifficulty: args.measured,
  caseCount: cases.length,
  cases: cases.map((entry) => ({
    battleId: entry.battleId,
    buildId: entry.buildId,
    policyId: entry.policyId
  })),
  difficulties: {}
};

for (const difficultyId of DIFFICULTIES) {
  for (let index = 0; index < args.warmups; index += 1) {
    const benchmarkCase = cases[index % cases.length];
    chooseEnemyPlan(
      withDifficulty(benchmarkCase.snapshot, difficultyId, index)
    );
  }

  const timings = [];
  const leafCounts = [];
  for (let index = 0; index < args.measured; index += 1) {
    const benchmarkCase = cases[index % cases.length];
    const snapshot = withDifficulty(
      benchmarkCase.snapshot,
      difficultyId,
      index
    );
    const started = performance.now();
    const result = chooseEnemyPlan(snapshot);
    timings.push(performance.now() - started);
    leafCounts.push(result.trace?.leafCount ?? 0);
  }
  report.difficulties[difficultyId] = summarize(timings, leafCounts);
}

const reportDirectory = join(projectRoot(), "reports", "battle-ai");
mkdirSync(reportDirectory, { recursive: true });
const fileName = `benchmark-${timestampForFile(report.generatedAt)}.json`;
const outputPath = join(reportDirectory, fileName);
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(
  join(reportDirectory, "latest.json"),
  `${JSON.stringify(report, null, 2)}\n`
);

printReport(report, outputPath);

function createBenchmarkCases() {
  return listBalanceEntries().map((entry) => {
    const encounter = getEncounter(entry.battleId);
    const build =
      entry.builds.find((value) => value.buildId === "reference_balanced") ??
      entry.builds[0];
    const initial = createBattleState({
      encounter,
      entryVariantId: entry.recommendedEntryVariantId,
      playerEntry: playerEntryFromBuild(build),
      difficultyId: "ai_difficulty_standard",
      aiSeed: hex8(fnv1aUtf8(`benchmark|${entry.battleId}`)),
      serial: 0,
      returnScene: {
        id: "benchmark",
        entrance: "benchmark"
      }
    });
    const afterPlayer = commitPlayerPlan(
      initial,
      choosePlayerPlan(initial, entry.policies[0]).plan
    ).state;
    if (afterPlayer.result || afterPlayer.phase !== "enemy") {
      throw new Error(`${entry.battleId} benchmark case ended before enemy AI`);
    }
    return {
      battleId: entry.battleId,
      buildId: build.buildId,
      policyId: entry.policies[0],
      snapshot: createAiSnapshot(afterPlayer)
    };
  });
}

function playerEntryFromBuild(build) {
  return {
    unitId: "player",
    maxHealth: build.maxHealth,
    maxEssence: build.maxEssence,
    move: build.move,
    strength: build.attributes.strength,
    perception: build.attributes.perception,
    physicalDefense: build.defenses.physical,
    guDefense: build.defenses.gu,
    actionIds: [...build.actionIds],
    revealedActionIds: [...build.actionIds],
    publicItemActions: structuredClone(build.publicItemUses)
  };
}

function withDifficulty(snapshot, difficultyId, cursor) {
  const next = structuredClone(snapshot);
  next.content = snapshot.content;
  next.difficultyId = difficultyId;
  next.aiCursor = cursor;
  return next;
}

function summarize(timings, leafCounts) {
  const sortedTimings = [...timings].sort((left, right) => left - right);
  const sortedLeaves = [...leafCounts].sort((left, right) => left - right);
  return {
    p50Ms: round(percentile(sortedTimings, 0.5)),
    p95Ms: round(percentile(sortedTimings, 0.95)),
    maxMs: round(sortedTimings.at(-1) ?? 0),
    leafP50: percentile(sortedLeaves, 0.5),
    leafP95: percentile(sortedLeaves, 0.95),
    leafMax: sortedLeaves.at(-1) ?? 0
  };
}

function percentile(sortedValues, percentileValue) {
  if (sortedValues.length === 0) return 0;
  const index = Math.min(
    sortedValues.length - 1,
    Math.ceil(sortedValues.length * percentileValue) - 1
  );
  return sortedValues[index];
}

function printReport(reportValue, outputPath) {
  console.log(`Battle AI benchmark wrote ${outputPath}`);
  for (const [difficultyId, values] of Object.entries(
    reportValue.difficulties
  )) {
    console.log(
      `${difficultyId.replace("ai_difficulty_", "")}: ` +
        `p50 ${values.p50Ms}ms, p95 ${values.p95Ms}ms, max ${values.maxMs}ms, ` +
        `leaf p95 ${values.leafP95}`
    );
  }
}

function parseArgs(argv) {
  let warmups = DEFAULT_WARMUPS_PER_DIFFICULTY;
  let measured = DEFAULT_MEASURED_PER_DIFFICULTY;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--warmups") {
      warmups = parsePositiveInteger(argv[++index], "warmups");
    } else if (argument === "--measured") {
      measured = parsePositiveInteger(argv[++index], "measured");
    } else {
      throw new Error(`unknown argument: ${argument}`);
    }
  }
  return { warmups, measured };
}

function parsePositiveInteger(value, name) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

function projectRoot() {
  return dirname(dirname(fileURLToPath(import.meta.url)));
}

function timestampForFile(value) {
  return value.replace(/[:.]/g, "-");
}

function round(value) {
  return Number(value.toFixed(4));
}
