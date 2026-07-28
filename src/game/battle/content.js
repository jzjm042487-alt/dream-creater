import actionsCatalogValue from "../../../systems/battle/actions.json" with { type: "json" };
import profilesCatalogValue from "../../../systems/battle/ai-profiles.json" with { type: "json" };
import encountersCatalogValue from "../../../systems/battle/encounters.json" with { type: "json" };
import balanceCatalogValue from "../../../systems/balance/battle-ai-matrix.json" with { type: "json" };

const actionsCatalog = deepFreeze(actionsCatalogValue);
const profilesCatalog = deepFreeze(profilesCatalogValue);
const encountersCatalog = deepFreeze(encountersCatalogValue);
const balanceCatalog = deepFreeze(balanceCatalogValue);

const actionById = createIndex(actionsCatalog.actions, "id", "battle action");
const profileById = createIndex(profilesCatalog.profiles, "id", "battle AI profile");
const encounterById = createIndex(encountersCatalog.encounters, "battleId", "battle");
const balanceById = createIndex(balanceCatalog.encounters, "battleId", "battle balance");

export function getAction(actionId) {
  return requireIndexed(actionById, actionId, "battle action");
}

export function getProfile(profileId) {
  return requireIndexed(profileById, profileId, "battle AI profile");
}

export function getEncounter(battleId) {
  return requireIndexed(encounterById, battleId, "battle");
}

export function getBalanceEntry(battleId) {
  return requireIndexed(balanceById, battleId, "battle balance");
}

export function listActions() {
  return actionsCatalog.actions;
}

export function listProfiles() {
  return profilesCatalog.profiles;
}

export function listEncounters() {
  return encountersCatalog.encounters;
}

export function listBalanceEntries() {
  return balanceCatalog.encounters;
}

export function createContentSnapshot() {
  return deepFreeze({
    actions: Object.fromEntries(actionsCatalog.actions.map((action) => [action.id, action])),
    profiles: Object.fromEntries(profilesCatalog.profiles.map((profile) => [profile.id, profile]))
  });
}

function createIndex(values, field, label) {
  const index = new Map();
  for (const value of values) {
    if (index.has(value[field])) {
      throw new Error(`duplicate ${label} id: ${value[field]}`);
    }
    index.set(value[field], value);
  }
  return index;
}

function requireIndexed(index, id, label) {
  if (!index.has(id)) {
    throw new Error(`unknown ${label} id: ${id}`);
  }
  return index.get(id);
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
