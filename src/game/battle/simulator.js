import { isActionTargetInRange, isEdgeCell, manhattan } from "./ranges.js";
import { findBattleUnit } from "./state.js";

export function calculateDamage(actor, target, action) {
  if (!action?.damage) {
    throw new Error(`${action?.id ?? "action"} does not deal damage`);
  }
  if (Number.isInteger(action.damage.fixedDamage)) {
    return action.damage.fixedDamage;
  }

  const physical = action.damage.kind === "physical";
  const attribute = physical ? actor.strength : actor.perception;
  const divisor = physical ? 20 : 25;
  const baseDefense = physical
    ? target.physicalDefense
    : target.guDefense;
  const statusDefense = (target.statuses || []).reduce(
    (total, status) =>
      total +
      (physical
        ? status.physicalDefenseBonus || 0
        : status.guDefenseBonus || 0),
    0
  );
  return Math.max(
    1,
    action.damage.basePower +
      Math.floor(attribute / divisor) -
      baseDefense -
      statusDefense
  );
}

export function applyDefendReduction(damage) {
  if (!Number.isInteger(damage) || damage < 0) {
    throw new RangeError("damage must be a non-negative integer");
  }
  return damage > 0 ? Math.max(1, Math.floor(damage / 2)) : 0;
}

export function resolveBattleResult(state, retreatSubmitted = false) {
  if (state.enemies.every((enemy) => enemy.hp <= 0)) return "victory";
  if (state.player.hp <= 0) return "defeat";
  if (retreatSubmitted) return "retreat";
  return null;
}

export function classifyCommittedPlan(before, after, plan, summary) {
  if ((summary.hpChanges || []).some((change) => change.delta < 0)) {
    return "damage";
  }
  if (
    (summary.appliedStatuses || []).some(
      (status) => (status.aiControlValue || 0) > 0
    )
  ) {
    return "control";
  }
  if (
    plan.action.type === "defend" ||
    summary.declaredCategory === "defend"
  ) {
    return "defend";
  }
  const beforeActor = findBattleUnit(before, plan.actorUnitId);
  const afterActor = findBattleUnit(after, plan.actorUnitId);
  if (
    beforeActor.position.x !== afterActor.position.x ||
    beforeActor.position.y !== afterActor.position.y
  ) {
    return "reposition";
  }
  return "pass";
}

export function simulateTurnPlan(snapshot, plan) {
  if (snapshot.result) {
    throw new Error("battle has already ended");
  }
  const before = snapshot;
  const next = clone(snapshot);
  const actorBefore = findBattleUnit(before, plan.actorUnitId);
  const actor = findBattleUnit(next, plan.actorUnitId);
  const action = next.content.actions[plan.action.actionId];
  if (!action) {
    throw new Error(`unknown battle action id: ${plan.action.actionId}`);
  }

  validatePlan(next, actor, actorBefore, action, plan);

  const appliedStatuses = [];
  const removedStatuses = [];
  const existingTurnStatuses = new Set(
    actor.statuses
      .filter((status) => status.duration === "turns")
      .map((status) => status.statusId)
  );
  const existingCooldowns = new Set(
    actor.cooldowns.map((cooldown) => cooldown.actionId)
  );
  const newlyAppliedStatusIds = new Set();
  const newlyAppliedCooldownIds = new Set();

  actor.position = { ...plan.destination };
  actor.essence -= action.essenceCost;

  if (action.consumesStatusId) {
    removeStatus(
      actor,
      action.consumesStatusId,
      removedStatuses,
      "consumed"
    );
  }

  if (action.damage) {
    const target = findBattleUnit(next, plan.action.targetUnitId);
    let damage = calculateDamage(actor, target, action);
    const defending = target.statuses.find(
      (status) =>
        status.statusId === "battle_status_defending" &&
        status.consumeOn === "nextIncomingDamage"
    );
    if (defending && damage > 0) {
      damage = applyDefendReduction(damage);
      removeStatus(
        target,
        defending.statusId,
        removedStatuses,
        "incomingDamage"
      );
    }
    target.hp = Math.max(0, target.hp - damage);
  }

  if (action.statusEffect) {
    const status = createStatus(action.statusEffect);
    actor.statuses = actor.statuses.filter(
      (entry) => entry.statusId !== status.statusId
    );
    actor.statuses.push(status);
    newlyAppliedStatusIds.add(status.statusId);
    appliedStatuses.push({ unitId: actor.unitId, ...status });
  }

  if (Number.isInteger(action.fixedHealing)) {
    actor.hp = Math.min(actor.maxHp, actor.hp + action.fixedHealing);
  }

  if (action.consumePublicItemUse) {
    const item = actor.publicItemActions.find(
      (entry) => entry.actionId === action.id
    );
    item.remainingUses -= 1;
  }

  if (action.revealAudibleHiddenUnits) {
    for (const unit of opposingLivingUnits(next, actor)) {
      if (unit.audibleHidden) unit.revealed = true;
    }
  }

  if (action.cooldownTurns > 0) {
    actor.cooldowns = actor.cooldowns.filter(
      (cooldown) => cooldown.actionId !== action.id
    );
    actor.cooldowns.push({
      actionId: action.id,
      remainingTurns: action.cooldownTurns
    });
    newlyAppliedCooldownIds.add(action.id);
  }

  if (
    actor.side === "player" &&
    !actor.revealedActionIds.includes(action.id)
  ) {
    actor.revealedActionIds.push(action.id);
  }

  expireOwnerTurnState({
    actor,
    existingTurnStatuses,
    existingCooldowns,
    newlyAppliedStatusIds,
    newlyAppliedCooldownIds,
    removedStatuses
  });

  const retreatSubmitted = action.type === "retreat";
  next.result = resolveBattleResult(next, retreatSubmitted);

  const summary = {
    actionId: action.id,
    actionCategory: null,
    declaredCategory: action.category,
    hpChanges: diffUnitNumber(before, next, "hp"),
    essenceChanges: diffUnitNumber(before, next, "essence"),
    appliedStatuses,
    removedStatuses,
    cooldownChanges: diffCooldowns(before, next),
    result: next.result
  };
  summary.actionCategory = classifyCommittedPlan(before, next, plan, summary);

  return {
    snapshot: next,
    settlementSummary: summary
  };
}

function validatePlan(state, actor, actorBefore, action, plan) {
  if (actor.hp <= 0) throw new Error(`${actor.unitId} cannot act while defeated`);
  if (
    !actor.actionIds.includes(action.id) &&
    action.id !== "battle_action_pass"
  ) {
    throw new Error(`${actor.unitId} does not know action ${action.id}`);
  }
  if (actor.essence < action.essenceCost) {
    throw new Error(`${action.id} requires more essence`);
  }
  if (
    actor.cooldowns.some(
      (cooldown) =>
        cooldown.actionId === action.id && cooldown.remainingTurns > 0
    )
  ) {
    throw new Error(`${action.id} is on cooldown`);
  }
  const statusIds = new Set(actor.statuses.map((status) => status.statusId));
  if (action.requiresStatusId && !statusIds.has(action.requiresStatusId)) {
    throw new Error(`${action.id} requires status ${action.requiresStatusId}`);
  }
  if (action.forbiddenStatusId && statusIds.has(action.forbiddenStatusId)) {
    throw new Error(`${action.id} is forbidden by status ${action.forbiddenStatusId}`);
  }
  if (
    manhattan(actorBefore.position, plan.destination) > actor.move ||
    plan.pathCost > actor.move
  ) {
    throw new Error("plan destination exceeds movement");
  }

  const occupied = livingUnits(state)
    .filter((unit) => unit.unitId !== actor.unitId)
    .map((unit) => unit.position);
  if (
    occupied.some(
      (cell) =>
        cell.x === plan.destination.x && cell.y === plan.destination.y
    )
  ) {
    throw new Error("plan destination is occupied");
  }
  if (
    state.board.blockedCells.some(
      (cell) =>
        cell.x === plan.destination.x && cell.y === plan.destination.y
    )
  ) {
    throw new Error("plan destination is blocked");
  }

  if (action.type === "retreat") {
    if (actor.side !== "player" || !isEdgeCell(state.board, plan.destination)) {
      throw new Error("retreat requires a player edge destination");
    }
    return;
  }

  if (action.type === "item") {
    const item = actor.publicItemActions.find(
      (entry) => entry.actionId === action.id
    );
    if (!item || item.remainingUses <= 0) {
      throw new Error(`${action.id} has no remaining public item use`);
    }
  }

  if (action.targetSide === "self") {
    if (
      plan.action.targetUnitId !== actor.unitId &&
      action.type !== "pass"
    ) {
      throw new Error(`${action.id} must target self`);
    }
    return;
  }

  const target = findBattleUnit(state, plan.action.targetUnitId);
  if (target.side === actor.side || target.hp <= 0) {
    throw new Error(`${action.id} requires a living opponent`);
  }
  const lineOccupied = livingUnits(state)
    .filter(
      (unit) =>
        unit.unitId !== actor.unitId && unit.unitId !== target.unitId
    )
    .map((unit) => unit.position);
  if (
    !isActionTargetInRange(
      action,
      state.board,
      lineOccupied,
      plan.destination,
      target.position
    )
  ) {
    throw new Error(`${action.id} target is out of range`);
  }
}

function createStatus(effect) {
  const status = {
    statusId: effect.id,
    duration: effect.duration,
    aiControlValue: effect.aiControlValue
  };
  if (effect.duration === "turns") {
    status.remainingTurns = effect.durationTurns;
  }
  for (const field of [
    "consumeOn",
    "physicalDefenseBonus",
    "guDefenseBonus"
  ]) {
    if (field in effect) status[field] = effect[field];
  }
  return status;
}

function expireOwnerTurnState({
  actor,
  existingTurnStatuses,
  existingCooldowns,
  newlyAppliedStatusIds,
  newlyAppliedCooldownIds,
  removedStatuses
}) {
  actor.statuses = actor.statuses.filter((status) => {
    if (
      status.duration !== "turns" ||
      !existingTurnStatuses.has(status.statusId) ||
      newlyAppliedStatusIds.has(status.statusId)
    ) {
      return true;
    }
    status.remainingTurns -= 1;
    if (status.remainingTurns > 0) return true;
    removedStatuses.push({
      unitId: actor.unitId,
      statusId: status.statusId,
      reason: "expired",
      aiControlValue: status.aiControlValue
    });
    return false;
  });

  actor.cooldowns = actor.cooldowns.filter((cooldown) => {
    if (
      !existingCooldowns.has(cooldown.actionId) ||
      newlyAppliedCooldownIds.has(cooldown.actionId)
    ) {
      return true;
    }
    cooldown.remainingTurns -= 1;
    return cooldown.remainingTurns > 0;
  });
}

function removeStatus(unit, statusId, removedStatuses, reason) {
  const status = unit.statuses.find((entry) => entry.statusId === statusId);
  if (!status) return;
  unit.statuses = unit.statuses.filter((entry) => entry.statusId !== statusId);
  removedStatuses.push({
    unitId: unit.unitId,
    statusId,
    reason,
    aiControlValue: status.aiControlValue
  });
}

function diffUnitNumber(before, after, field) {
  const beforeById = new Map(
    [before.player, ...before.enemies].map((unit) => [unit.unitId, unit])
  );
  const changes = [];
  for (const unit of [after.player, ...after.enemies]) {
    const previous = beforeById.get(unit.unitId);
    if (previous[field] !== unit[field]) {
      changes.push({
        unitId: unit.unitId,
        before: previous[field],
        after: unit[field],
        delta: unit[field] - previous[field]
      });
    }
  }
  return changes;
}

function diffCooldowns(before, after) {
  const changes = [];
  for (const unit of [after.player, ...after.enemies]) {
    const previousUnit = findBattleUnit(before, unit.unitId);
    const actionIds = new Set([
      ...previousUnit.cooldowns.map((entry) => entry.actionId),
      ...unit.cooldowns.map((entry) => entry.actionId)
    ]);
    for (const actionId of [...actionIds].sort()) {
      const previous =
        previousUnit.cooldowns.find((entry) => entry.actionId === actionId)
          ?.remainingTurns ?? 0;
      const current =
        unit.cooldowns.find((entry) => entry.actionId === actionId)
          ?.remainingTurns ?? 0;
      if (previous !== current) {
        changes.push({
          unitId: unit.unitId,
          actionId,
          before: previous,
          after: current
        });
      }
    }
  }
  return changes;
}

function livingUnits(state) {
  return [state.player, ...state.enemies].filter((unit) => unit.hp > 0);
}

function opposingLivingUnits(state, actor) {
  return actor.side === "player"
    ? state.enemies.filter((unit) => unit.hp > 0)
    : state.player.hp > 0
      ? [state.player]
      : [];
}

function clone(value) {
  const { content, ...mutableState } = value;
  return {
    ...JSON.parse(JSON.stringify(mutableState)),
    content
  };
}
