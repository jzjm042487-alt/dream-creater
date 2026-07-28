import path from "node:path";
import { fileURLToPath } from "node:url";
import { upgradeSaveEnvelope as upgradePure } from "../src/game/state/upgradeSaveEnvelope.js";
import {
  loadRegistry,
  validateContentValue
} from "./contract-validator-core.mjs";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const PLAYER_SCHEMA = path.join(
  ROOT,
  "contracts",
  "player-state.schema.json"
);
const registry = loadRegistry();

export function upgradeSaveEnvelope(envelope, seeds = {}) {
  const migrated = upgradePure(envelope, { registry, seeds });
  const playerErrors = validateContentValue(
    migrated.state.mvp.player,
    PLAYER_SCHEMA,
    registry
  );
  if (playerErrors.length) {
    throw new Error(
      `migrated player state is invalid: ${playerErrors.join("; ")}`
    );
  }
  return migrated;
}
