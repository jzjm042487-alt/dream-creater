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

  const path = createEasyStarQuery(
    board,
    occupiedCells,
    start
  )(start, end);
  return path
    ? { reachable: true, distance: path.length - 1 }
    : { reachable: false };
}

export function findCanonicalPath(board, occupiedCells, start, end) {
  validateQuery(board, occupiedCells, start, end);
  if (!inside(board, end) || isBlocked(board, end)) {
    return { reachable: false };
  }
  const easyStarPath = createEasyStarQuery(
    board,
    occupiedCells,
    start
  )(start, end);
  if (!easyStarPath) return { reachable: false };
  return reconstructCanonicalPath(
    board,
    occupiedCells,
    start,
    end,
    easyStarPath.length - 1
  );
}

export function listReachableDestinations(board, occupiedCells, start, move) {
  validateQuery(board, occupiedCells, start, start);
  if (!Number.isSafeInteger(move) || move < 0) {
    throw new RangeError("move must be a non-negative safe integer");
  }

  const destinations = [];
  const query = createEasyStarQuery(board, occupiedCells, start);
  for (let y = 0; y < board.height; y += 1) {
    for (let x = 0; x < board.width; x += 1) {
      const destination = { x, y };
      if (!isWalkable(board, occupiedCells, destination, start)) continue;
      if (manhattan(start, destination) > move) continue;
      const easyStarPath = query(start, destination);
      if (!easyStarPath || easyStarPath.length - 1 > move) continue;
      const result = reconstructCanonicalPath(
        board,
        occupiedCells,
        start,
        destination,
        easyStarPath.length - 1
      );
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

function createEasyStarQuery(board, occupiedCells, actorStart) {
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
    if (sameCell(cell, actorStart)) continue;
    easyStar.avoidAdditionalPoint(cell.x, cell.y);
  }

  return (start, end) => {
    let resolvedPath;
    easyStar.findPath(start.x, start.y, end.x, end.y, (path) => {
      resolvedPath = path;
    });
    easyStar.calculate();
    return resolvedPath ?? null;
  };
}

function reconstructCanonicalPath(
  board,
  occupiedCells,
  start,
  end,
  expectedDistance
) {
  if (sameCell(start, end)) {
    return { reachable: true, cost: 0, path: [[start.x, start.y]] };
  }
  const distances = buildDistanceMap(
    board,
    occupiedCells,
    end,
    start
  );
  const startDistance = distances.get(cellKey(start));
  if (startDistance !== expectedDistance) {
    throw new Error("EasyStar and canonical distance map disagree");
  }

  const path = [[start.x, start.y]];
  let current = { ...start };
  let remaining = expectedDistance;
  while (remaining > 0) {
    const next = DIRECTION_ORDER.map((direction) => ({
      x: current.x + direction.dx,
      y: current.y + direction.dy
    })).find(
      (candidate) =>
        isWalkable(board, occupiedCells, candidate, start) &&
        distances.get(cellKey(candidate)) === remaining - 1
    );
    if (!next) {
      throw new Error(
        "canonical path reconstruction lost a shortest-path step"
      );
    }
    path.push([next.x, next.y]);
    current = next;
    remaining -= 1;
  }
  return { reachable: true, cost: expectedDistance, path };
}

function buildDistanceMap(
  board,
  occupiedCells,
  origin,
  actorStart
) {
  const distances = new Map([[cellKey(origin), 0]]);
  const queue = [{ ...origin }];
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    const nextDistance = distances.get(cellKey(current)) + 1;
    for (const direction of DIRECTION_ORDER) {
      const next = {
        x: current.x + direction.dx,
        y: current.y + direction.dy
      };
      const key = cellKey(next);
      if (
        distances.has(key) ||
        !isWalkable(board, occupiedCells, next, actorStart)
      ) {
        continue;
      }
      distances.set(key, nextDistance);
      queue.push(next);
    }
  }
  return distances;
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

function manhattan(left, right) {
  return Math.abs(left.x - right.x) + Math.abs(left.y - right.y);
}

function cellKey(point) {
  return `${point.x},${point.y}`;
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
