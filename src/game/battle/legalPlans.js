import { DIRECTION_ORDER, listReachableDestinations } from "./pathfinder.js";
import { isActionTargetInRange, isEdgeCell } from "./ranges.js";
import { findBattleUnit } from "./state.js";

const DEFAULT_RAW_CAP = 256;
const ACTION_TYPE_RANK = Object.freeze({
  basicAttack: 0,
  skill: 1,
  boss: 1,
  defend: 2,
  item: 3,
  retreat: 4,
  pass: 5
});

export function enumerateLegalTurnPlans(
  state,
  actorUnitId,
  { rawCap = DEFAULT_RAW_CAP } = {}
) {
  if (!Number.isSafeInteger(rawCap) || rawCap < 1) {
    throw new RangeError("rawCap must be a positive safe integer");
  }
  const actor = findBattleUnit(state, actorUnitId);
  if (actor.hp <= 0) return { plans: [], diagnostics: [] };

  const occupiedCells = livingUnits(state)
    .filter((unit) => unit.unitId !== actorUnitId)
    .map((unit) => unit.position);
  const destinations = listReachableDestinations(
    state.board,
    occupiedCells,
    actor.position,
    actor.move
  );
  const rawPlans = [];

  for (const destination of destinations) {
    const destinationPlans = enumerateDestinationPlans(
      state,
      actor,
      destination,
      occupiedCells
    );
    rawPlans.push(...destinationPlans);
  }

  rawPlans.sort(compareEnumerationOrder);
  rawPlans.forEach((plan, index) => {
    plan.enumerationOrder = index;
    plan.decisionOrder = null;
  });

  const diagnostics =
    rawPlans.length > rawCap
      ? [
          {
            type: "development-cap",
            code: "candidate_cap_truncated",
            rawCount: rawPlans.length,
            cap: rawCap
          }
        ]
      : [];
  return {
    plans: rawPlans.slice(0, rawCap),
    diagnostics
  };
}

export function makeCanonicalPlanKey(plan) {
  const directionRanks = pathDirectionRanks(plan.path).join("");
  const targetUnitId = plan.action.targetUnitId ?? "";
  const targetY = plan.action.targetCell?.y ?? "";
  const targetX = plan.action.targetCell?.x ?? "";
  return [
    plan.destination.y,
    plan.destination.x,
    directionRanks,
    actionTypeRank(plan.action.type),
    plan.action.actionId,
    targetUnitId,
    targetY,
    targetX
  ].join(",");
}

export function actionTypeRank(type) {
  if (!(type in ACTION_TYPE_RANK)) {
    throw new Error(`unsupported battle action type: ${type}`);
  }
  return ACTION_TYPE_RANK[type];
}

function enumerateDestinationPlans(state, actor, destination, occupiedCells) {
  const actions = actor.actionIds
    .map((actionId) => state.content.actions[actionId])
    .filter(Boolean)
    .sort(
      (left, right) =>
        actionTypeRank(left.type) - actionTypeRank(right.type) ||
        left.id.localeCompare(right.id)
    );
  const plans = [];

  for (const action of actions) {
    if (action.type === "pass") continue;
    if (!isActionAvailable(state, actor, action, destination)) continue;

    if (action.type === "retreat") {
      if (actor.side === "player" && isEdgeCell(state.board, destination)) {
        plans.push(createPlan(actor, destination, action, null, null));
      }
      continue;
    }

    if (action.targetSide === "self") {
      if (
        isActionTargetInRange(
          action,
          state.board,
          occupiedCells,
          destination,
          destination
        )
      ) {
        plans.push(
          createPlan(actor, destination, action, actor.unitId, destination)
        );
      }
      continue;
    }

    for (const target of opposingLivingUnits(state, actor)) {
      const dynamicOccupied = livingUnits(state)
        .filter(
          (unit) =>
            unit.unitId !== actor.unitId && unit.unitId !== target.unitId
        )
        .map((unit) => unit.position);
      if (
        isActionTargetInRange(
          action,
          state.board,
          dynamicOccupied,
          destination,
          target.position
        )
      ) {
        plans.push(
          createPlan(
            actor,
            destination,
            action,
            target.unitId,
            target.position
          )
        );
      }
    }
  }

  if (plans.length === 0) {
    const passAction =
      state.content.actions.battle_action_pass ??
      actor.actionIds
        .map((actionId) => state.content.actions[actionId])
        .find((action) => action?.type === "pass");
    if (passAction) {
      plans.push(createPlan(actor, destination, passAction, null, null));
    }
  }

  return plans;
}

function isActionAvailable(state, actor, action) {
  if (actor.essence < action.essenceCost) return false;
  if (
    actor.cooldowns.some(
      (cooldown) =>
        cooldown.actionId === action.id && cooldown.remainingTurns > 0
    )
  ) {
    return false;
  }
  const statusIds = new Set(actor.statuses.map((status) => status.statusId));
  if (action.requiresStatusId && !statusIds.has(action.requiresStatusId)) {
    return false;
  }
  if (action.forbiddenStatusId && statusIds.has(action.forbiddenStatusId)) {
    return false;
  }
  if (
    action.type === "item" &&
    !actor.publicItemActions.some(
      (item) => item.actionId === action.id && item.remainingUses > 0
    )
  ) {
    return false;
  }
  if (
    action.revealAudibleHiddenUnits &&
    !opposingLivingUnits(state, actor).some((unit) => unit.audibleHidden)
  ) {
    return false;
  }
  return true;
}

function createPlan(actor, destinationEntry, action, targetUnitId, targetCell) {
  const plan = {
    actorUnitId: actor.unitId,
    destination: { x: destinationEntry.x, y: destinationEntry.y },
    path: destinationEntry.path.map(([x, y]) => [x, y]),
    action: {
      type: action.type,
      actionId: action.id,
      targetUnitId,
      targetCell: targetCell ? { x: targetCell.x, y: targetCell.y } : null
    },
    pathCost: destinationEntry.pathCost,
    essenceCost: action.essenceCost,
    canonicalKey: ""
  };
  plan.canonicalKey = makeCanonicalPlanKey(plan);
  return plan;
}

function compareEnumerationOrder(left, right) {
  return (
    left.pathCost - right.pathCost ||
    left.destination.y - right.destination.y ||
    left.destination.x - right.destination.x ||
    compareNumberArrays(
      pathDirectionRanks(left.path),
      pathDirectionRanks(right.path)
    ) ||
    actionTypeRank(left.action.type) - actionTypeRank(right.action.type) ||
    left.action.actionId.localeCompare(right.action.actionId) ||
    (left.action.targetUnitId ?? "").localeCompare(
      right.action.targetUnitId ?? ""
    ) ||
    (left.action.targetCell?.y ?? -1) - (right.action.targetCell?.y ?? -1) ||
    (left.action.targetCell?.x ?? -1) - (right.action.targetCell?.x ?? -1)
  );
}

function pathDirectionRanks(path) {
  const ranks = [];
  for (let index = 1; index < path.length; index += 1) {
    const [fromX, fromY] = path[index - 1];
    const [toX, toY] = path[index];
    const rank = DIRECTION_ORDER.find(
      (direction) =>
        fromX + direction.dx === toX && fromY + direction.dy === toY
    )?.rank;
    if (!Number.isInteger(rank)) {
      throw new Error("plan path contains a non-orthogonal step");
    }
    ranks.push(rank);
  }
  return ranks;
}

function compareNumberArrays(left, right) {
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const delta =
      (left[index] ?? Number.MAX_SAFE_INTEGER) -
      (right[index] ?? Number.MAX_SAFE_INTEGER);
    if (delta !== 0) return delta;
  }
  return 0;
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
