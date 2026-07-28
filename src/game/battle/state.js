import {
  createContentSnapshot,
  getProfile
} from "./content.js";

export function createBattleState({
  encounter,
  entryVariantId,
  playerEntry,
  difficultyId,
  aiSeed,
  serial,
  returnScene
}) {
  requireObject(encounter, "encounter");
  requireObject(playerEntry, "playerEntry");
  requireObject(returnScene, "returnScene");
  if (!Number.isSafeInteger(serial) || serial < 0) {
    throw new RangeError("serial must be a non-negative safe integer");
  }
  if (typeof aiSeed !== "string" || typeof difficultyId !== "string") {
    throw new TypeError("difficultyId and aiSeed must be strings");
  }

  const variant = encounter.entryVariants.find(
    (entry) => entry.variantId === entryVariantId
  );
  if (!variant) {
    throw new Error(
      `unknown entry variant ${entryVariantId} for battle ${encounter.battleId}`
    );
  }
  if (variant.mode === "directResult") {
    throw new Error(
      `direct-result variant ${entryVariantId} does not create a battle`
    );
  }

  const player = createPlayer(playerEntry, variant.playerSpawn);
  const enemies = encounter.enemies.map(createEnemy);
  validatePlacement(encounter.board, [player, ...enemies]);

  const enemyUnitOrder = [...encounter.enemyUnitOrder];
  const activeEnemyUnitId =
    variant.startingPhase === "enemy"
      ? enemyUnitOrder.find(
          (unitId) => enemies.find((enemy) => enemy.unitId === unitId)?.hp > 0
        ) ?? null
      : null;

  return {
    battleId: encounter.battleId,
    entryVariantId,
    serial,
    round: 1,
    phase: variant.startingPhase,
    result: null,
    returnScene: clone(returnScene),
    board: clone(encounter.board),
    resultPolicy: clone(encounter.resultPolicy),
    player,
    enemies,
    enemyUnitOrder,
    activeEnemyUnitId,
    recentActionCategoriesByUnitId: Object.fromEntries(
      enemyUnitOrder.map((unitId) => [unitId, []])
    ),
    difficultyId,
    aiSeed,
    aiCursor: 0,
    decisionIndex: 0,
    diagnostics: [],
    content: createContentSnapshot()
  };
}

export function findBattleUnit(state, unitId) {
  if (state.player.unitId === unitId) return state.player;
  const enemy = state.enemies.find((unit) => unit.unitId === unitId);
  if (!enemy) throw new Error(`unknown battle unit id: ${unitId}`);
  return enemy;
}

function createPlayer(entry, spawn) {
  const actionIds = uniqueStrings(entry.actionIds || []);
  const requiredRevealed = [
    "battle_action_basic_melee",
    "battle_action_defend"
  ].filter((actionId) => actionIds.includes(actionId));
  return {
    unitId: entry.unitId || "player",
    side: "player",
    position: clone(spawn),
    hp: entry.hp ?? entry.maxHealth,
    maxHp: entry.maxHealth,
    essence: entry.essence ?? entry.maxEssence,
    maxEssence: entry.maxEssence,
    move: entry.move,
    strength: entry.strength,
    perception: entry.perception,
    physicalDefense: entry.physicalDefense,
    guDefense: entry.guDefense,
    statuses: clone(entry.statuses || []),
    cooldowns: clone(entry.cooldowns || []),
    actionIds,
    revealedActionIds: uniqueStrings([
      ...requiredRevealed,
      ...(entry.revealedActionIds || [])
    ]),
    publicItemActions: clone(entry.publicItemActions || [])
  };
}

function createEnemy(enemy) {
  getProfile(enemy.profileId);
  return {
    unitId: enemy.unitId,
    side: "enemy",
    profileId: enemy.profileId,
    position: clone(enemy.spawn),
    hp: enemy.maxHealth,
    maxHp: enemy.maxHealth,
    essence: enemy.maxEssence,
    maxEssence: enemy.maxEssence,
    move: enemy.move,
    strength: enemy.attributes.strength,
    perception: enemy.attributes.perception,
    physicalDefense: enemy.defenses.physical,
    guDefense: enemy.defenses.gu,
    statuses: [],
    cooldowns: [],
    actionIds: [...enemy.actionIds],
    audibleHidden: Boolean(enemy.audibleHidden)
  };
}

function validatePlacement(board, units) {
  const occupied = new Set();
  const blocked = new Set(board.blockedCells.map(cellKey));
  for (const unit of units) {
    if (!inside(board, unit.position)) {
      throw new Error(`${unit.unitId} starts outside the board`);
    }
    const key = cellKey(unit.position);
    if (blocked.has(key)) {
      throw new Error(`${unit.unitId} starts on blocked cell ${key}`);
    }
    if (occupied.has(key)) {
      throw new Error(`${unit.unitId} overlaps another unit at ${key}`);
    }
    occupied.add(key);
  }
}

function uniqueStrings(values) {
  return [...new Set(values)];
}

function requireObject(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${name} must be an object`);
  }
}

function inside(board, cell) {
  return (
    cell.x >= 0 &&
    cell.x < board.width &&
    cell.y >= 0 &&
    cell.y < board.height
  );
}

function cellKey(cell) {
  return `${cell.x},${cell.y}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
