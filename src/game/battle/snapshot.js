const SYSTEM_ACTION_IDS = Object.freeze([
  "battle_action_pass",
  "battle_action_retreat"
]);

export function createAiSnapshot(state) {
  requireBattleState(state);

  const revealedActionIds = uniqueStrings(
    state.player.revealedActionIds || []
  );
  const publicItemActions = clone(state.player.publicItemActions || []);
  const publicPlayerActionIds = uniqueStrings([
    ...revealedActionIds,
    ...publicItemActions.map((entry) => entry.actionId),
    ...SYSTEM_ACTION_IDS
  ]);
  const publicActionIds = new Set([
    ...revealedActionIds,
    ...publicItemActions.map((entry) => entry.actionId),
    ...state.enemies.flatMap((enemy) => enemy.actionIds || []),
    ...state.enemies.flatMap((enemy) =>
      phaseActionIds(state.content.profiles[enemy.profileId])
    ),
    ...SYSTEM_ACTION_IDS
  ]);
  const publicProfileIds = new Set(
    state.enemies.map((enemy) => enemy.profileId)
  );

  return deepFreeze({
    battleId: state.battleId,
    round: state.round,
    phase: state.phase,
    result: state.result,
    board: clone(state.board),
    player: {
      ...copyPublicUnitFields(state.player),
      actionIds: publicPlayerActionIds,
      statuses: clone(state.player.statuses || []),
      cooldowns: filterPublicCooldowns(
        state.player.cooldowns || [],
        new Set(revealedActionIds)
      ),
      revealedActionIds,
      publicCooldowns: filterPublicCooldowns(
        state.player.cooldowns || [],
        new Set(revealedActionIds)
      ),
      publicItemActions
    },
    enemies: state.enemies.map((enemy) => ({
      ...copyPublicUnitFields(enemy),
      profileId: enemy.profileId,
      actionIds: [...enemy.actionIds],
      statuses: clone(enemy.statuses || []),
      cooldowns: clone(enemy.cooldowns || []),
      publicItemActions: []
    })),
    enemyUnitOrder: [...state.enemyUnitOrder],
    activeEnemyUnitId: state.activeEnemyUnitId,
    recentActionCategoriesByUnitId: clone(
      state.recentActionCategoriesByUnitId || {}
    ),
    difficultyId: state.difficultyId,
    aiSeed: state.aiSeed,
    aiCursor: state.aiCursor,
    decisionIndex: state.decisionIndex,
    content: {
      actions: filterRecord(state.content.actions, publicActionIds),
      profiles: filterRecord(state.content.profiles, publicProfileIds)
    }
  });
}

function copyPublicUnitFields(unit) {
  return {
    unitId: unit.unitId,
    side: unit.side,
    position: clone(unit.position),
    hp: unit.hp,
    maxHp: unit.maxHp,
    essence: unit.essence,
    maxEssence: unit.maxEssence,
    move: unit.move,
    strength: unit.strength,
    perception: unit.perception,
    physicalDefense: unit.physicalDefense,
    guDefense: unit.guDefense,
    audibleHidden: Boolean(unit.audibleHidden),
    revealed: Boolean(unit.revealed)
  };
}

function filterPublicCooldowns(cooldowns, revealedActionIds) {
  return clone(
    cooldowns.filter((entry) => revealedActionIds.has(entry.actionId))
  );
}

function phaseActionIds(profile) {
  return (profile?.phases || [])
    .map((phase) => phase.phaseActionId)
    .filter(Boolean);
}

function filterRecord(record, allowedIds) {
  return Object.fromEntries(
    Object.entries(record)
      .filter(([id]) => allowedIds.has(id))
      .map(([id, value]) => [id, clone(value)])
  );
}

function uniqueStrings(values) {
  return [...new Set(values)];
}

function requireBattleState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    throw new TypeError("battle state must be an object");
  }
  if (!state.player || !Array.isArray(state.enemies) || !state.content) {
    throw new TypeError("battle state is missing required public fields");
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
