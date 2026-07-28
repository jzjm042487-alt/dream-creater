export function isActionTargetInRange(
  action,
  board,
  occupiedCells,
  origin,
  target
) {
  if (!action?.range || !board || !Array.isArray(occupiedCells)) {
    throw new TypeError("action, board, and occupiedCells are required");
  }
  const distance = manhattan(origin, target);
  if (distance < action.range.minimum || distance > action.range.maximum) {
    return false;
  }

  switch (action.range.kind) {
    case "self":
      return sameCell(origin, target);
    case "melee":
      return distance === 1;
    case "range3":
      return true;
    case "radius1":
      return distance <= 1;
    case "line3":
      return (
        (origin.x === target.x || origin.y === target.y) &&
        !hasLineBlocker(action, board, occupiedCells, origin, target)
      );
    default:
      throw new Error(`unsupported battle range kind: ${action.range.kind}`);
  }
}

function hasLineBlocker(action, board, occupiedCells, origin, target) {
  if (origin.x !== target.x && origin.y !== target.y) return true;
  const dx = Math.sign(target.x - origin.x);
  const dy = Math.sign(target.y - origin.y);
  let x = origin.x + dx;
  let y = origin.y + dy;

  while (x !== target.x || y !== target.y) {
    if (board.blockedCells.some((cell) => cell.x === x && cell.y === y)) {
      return true;
    }
    if (
      action.range.blockedByUnits &&
      occupiedCells.some((cell) => cell.x === x && cell.y === y)
    ) {
      return true;
    }
    x += dx;
    y += dy;
  }
  return false;
}

export function manhattan(left, right) {
  return Math.abs(left.x - right.x) + Math.abs(left.y - right.y);
}

export function isEdgeCell(board, cell) {
  return (
    cell.x === 0 ||
    cell.y === 0 ||
    cell.x === board.width - 1 ||
    cell.y === board.height - 1
  );
}

function sameCell(left, right) {
  return left.x === right.x && left.y === right.y;
}
