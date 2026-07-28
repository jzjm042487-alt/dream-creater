import EasyStar from "easystarjs";

export const DIRECTION_ORDER = Object.freeze([
  Object.freeze({ name: "up", dx: 0, dy: -1, rank: 0 }),
  Object.freeze({ name: "left", dx: -1, dy: 0, rank: 1 }),
  Object.freeze({ name: "right", dx: 1, dy: 0, rank: 2 }),
  Object.freeze({ name: "down", dx: 0, dy: 1, rank: 3 })
]);

export function findDistance(board, occupiedCells, start, end) {
  validateQuery(board, occupiedCells, start, end);
  if (!inside(board, end) || isBlocked(board, end)) {
    return { reachable: false };
  }
  if (sameCell(start, end)) {
    return { reachable: true, distance: 0 };
  }

  const path = queryEasyStar(board, occupiedCells, start, end);
  return path
    ? { reachable: true, distance: path.length - 1 }
    : { reachable: false };
}

export function findCanonicalPath(board, occupiedCells, start, end) {
  const initial = findDistance(board, occupiedCells, start, end);
  if (!initial.reachable) return { reachable: false };

  const path = [[start.x, start.y]];
  let current = { x: start.x, y: start.y };
  let remaining = initial.distance;

  while (remaining > 0) {
    let next = null;
    for (const direction of DIRECTION_ORDER) {
      const candidate = {
        x: current.x + direction.dx,
        y: current.y + direction.dy
      };
      if (!isWalkable(board, occupiedCells, candidate, start)) continue;
      const result = findDistance(board, occupiedCells, candidate, end);
      if (result.reachable && result.distance === remaining - 1) {
        next = candidate;
        break;
      }
    }
    if (!next) {
      throw new Error("canonical path reconstruction lost a shortest-path step");
    }
    path.push([next.x, next.y]);
    current = next;
    remaining -= 1;
  }

  return {
    reachable: true,
    cost: initial.distance,
    path
  };
}

export function listReachableDestinations(board, occupiedCells, start, move) {
  validateQuery(board, occupiedCells, start, start);
  if (!Number.isSafeInteger(move) || move < 0) {
    throw new RangeError("move must be a non-negative safe integer");
  }

  const destinations = [];
  for (let y = 0; y < board.height; y += 1) {
    for (let x = 0; x < board.width; x += 1) {
      const destination = { x, y };
      if (!isWalkable(board, occupiedCells, destination, start)) continue;
      const result = findCanonicalPath(board, occupiedCells, start, destination);
      if (!result.reachable || result.cost > move) continue;
      destinations.push({
        x,
        y,
        pathCost: result.cost,
        path: result.path,
        directionRanks: pathDirectionRanks(result.path)
      });
    }
  }

  destinations.sort(
    (left, right) =>
      left.pathCost - right.pathCost ||
      left.y - right.y ||
      left.x - right.x ||
      compareNumberArrays(left.directionRanks, right.directionRanks)
  );
  return destinations;
}

function queryEasyStar(board, occupiedCells, start, end) {
  const easyStar = new EasyStar.js();
  easyStar.enableSync();
  easyStar.setGrid(
    Array.from({ length: board.height }, (_, y) =>
      Array.from({ length: board.width }, (_, x) =>
        isBlocked(board, { x, y }) ? 1 : 0
      )
    )
  );
  easyStar.setAcceptableTiles([0]);

  for (const cell of occupiedCells) {
    if (sameCell(cell, start)) continue;
    easyStar.avoidAdditionalPoint(cell.x, cell.y);
  }

  let resolvedPath;
  easyStar.findPath(start.x, start.y, end.x, end.y, (path) => {
    resolvedPath = path;
  });
  easyStar.calculate();
  return resolvedPath ?? null;
}

function validateQuery(board, occupiedCells, start, end) {
  if (
    !board ||
    !Number.isSafeInteger(board.width) ||
    !Number.isSafeInteger(board.height) ||
    board.width < 1 ||
    board.height < 1 ||
    !Array.isArray(board.blockedCells)
  ) {
    throw new TypeError("board must define positive width, height, and blockedCells");
  }
  if (!Array.isArray(occupiedCells)) {
    throw new TypeError("occupiedCells must be an array");
  }
  if (!isPoint(start) || !isPoint(end) || !inside(board, start)) {
    throw new RangeError("start and end must be integer board points");
  }
}

function isWalkable(board, occupiedCells, point, actorStart) {
  return (
    inside(board, point) &&
    !isBlocked(board, point) &&
    !occupiedCells.some(
      (occupied) => sameCell(occupied, point) && !sameCell(point, actorStart)
    )
  );
}

function isBlocked(board, point) {
  return board.blockedCells.some((cell) => sameCell(cell, point));
}

function inside(board, point) {
  return (
    point.x >= 0 &&
    point.x < board.width &&
    point.y >= 0 &&
    point.y < board.height
  );
}

function isPoint(value) {
  return value && Number.isInteger(value.x) && Number.isInteger(value.y);
}

function sameCell(left, right) {
  return left.x === right.x && left.y === right.y;
}

function pathDirectionRanks(path) {
  const ranks = [];
  for (let index = 1; index < path.length; index += 1) {
    const [previousX, previousY] = path[index - 1];
    const [x, y] = path[index];
    ranks.push(
      DIRECTION_ORDER.find(
        (direction) =>
          previousX + direction.dx === x && previousY + direction.dy === y
      )?.rank ?? Number.MAX_SAFE_INTEGER
    );
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
