import assert from "node:assert/strict";
import test from "node:test";

import {
  findCanonicalPath,
  findDistance,
  listReachableDestinations
} from "../src/game/battle/pathfinder.js";

test("equal shortest paths use canonical up-left-right-down reconstruction", () => {
  const result = findCanonicalPath(board(5, 5), [], point(2, 2), point(1, 1));

  assert.deepEqual(result, {
    reachable: true,
    cost: 2,
    path: [[2, 2], [2, 1], [1, 1]]
  });
});

test("canonical path routes around a full-height obstacle segment", () => {
  const blockedCells = [0, 1, 2, 3].map((y) => ({ x: 2, y }));
  const result = findCanonicalPath(
    board(5, 5, blockedCells),
    [],
    point(0, 2),
    point(4, 2)
  );

  assert.deepEqual(result.path, [
    [0, 2],
    [1, 2],
    [1, 3],
    [1, 4],
    [2, 4],
    [3, 4],
    [3, 3],
    [3, 2],
    [4, 2]
  ]);
  assert.equal(result.cost, 8);
});

test("occupied units block paths while the actor start remains walkable", () => {
  const occupied = [point(1, 2), point(2, 2), point(3, 2), point(2, 1)];
  const result = findCanonicalPath(
    board(5, 5),
    occupied,
    point(1, 2),
    point(4, 2)
  );

  assert.equal(result.reachable, true);
  assert.deepEqual(result.path[0], [1, 2]);
  assert.equal(
    result.path.some(([x, y]) => occupied.slice(1).some((cell) => cell.x === x && cell.y === y)),
    false
  );
});

test("unreachable destinations return an explicit false result", () => {
  const blockedCells = [0, 1, 2, 3, 4].map((y) => ({ x: 2, y }));
  const value = findDistance(
    board(5, 5, blockedCells),
    [],
    point(0, 2),
    point(4, 2)
  );

  assert.deepEqual(value, { reachable: false });
});

test("fresh EasyStar contexts do not leak avoided points between calls", () => {
  const first = findCanonicalPath(
    board(5, 3),
    [point(2, 1)],
    point(0, 1),
    point(4, 1)
  );
  const second = findCanonicalPath(
    board(5, 3),
    [],
    point(0, 1),
    point(4, 1)
  );

  assert.equal(first.cost, 6);
  assert.deepEqual(second.path, [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]]);
});

test("reachable endpoints sort by cost, y, x, then canonical direction ranks", () => {
  const values = listReachableDestinations(
    board(3, 3),
    [],
    point(1, 1),
    1
  );

  assert.deepEqual(
    values.map(({ x, y, pathCost }) => [x, y, pathCost]),
    [
      [1, 1, 0],
      [1, 0, 1],
      [0, 1, 1],
      [2, 1, 1],
      [1, 2, 1]
    ]
  );
});

function board(width, height, blockedCells = []) {
  return { width, height, blockedCells };
}

function point(x, y) {
  return { x, y };
}
