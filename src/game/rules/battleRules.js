import {
  resolveTimedPlayerAction,
  sleepToNextDay,
} from "./timeRules.js";

const WIDTH = 8;
const HEIGHT = 6;
const DIRECTIONS = [
  { x: 0, y: -1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
];

export function createBattleState(kind, persistentState, overrides = {}) {
  const enemyDefaults =
    kind === "fangYuan"
      ? { x: 6, y: 1, hp: 42, maxHp: 42, attack: 9, move: 3 }
      : { x: 6, y: 1, hp: 28, maxHp: 28, attack: 6, move: 2 };

  return {
    kind,
    width: WIDTH,
    height: HEIGHT,
    turn: "player",
    result: null,
    wineContested: false,
    sleightUsed: false,
    player: {
      x: 1,
      y: 4,
      hp: persistentState.player.hp,
      maxHp: persistentState.player.maxHp,
      essence: persistentState.player.essence,
      maxEssence: persistentState.player.maxEssence,
      move: 3,
      defended: false,
      stealEssenceCooldown: 0,
      ...overrides.player,
    },
    enemy: {
      ...enemyDefaults,
      ...overrides.enemy,
    },
    flags: {
      actionWindow: Boolean(persistentState.flags.fangYuanActionWindow),
    },
  };
}

export function getReachableCells(battle) {
  const start = { x: battle.player.x, y: battle.player.y, distance: 0 };
  const queue = [start];
  const visited = new Map([[cellKey(start.x, start.y), start]]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current.distance >= battle.player.move) {
      continue;
    }

    for (const direction of DIRECTIONS) {
      const x = current.x + direction.x;
      const y = current.y + direction.y;
      const key = cellKey(x, y);
      if (
        !insideGrid(battle, x, y) ||
        (x === battle.enemy.x && y === battle.enemy.y) ||
        visited.has(key)
      ) {
        continue;
      }
      const cell = { x, y, distance: current.distance + 1 };
      visited.set(key, cell);
      queue.push(cell);
    }
  }

  return [...visited.values()].map(({ x, y }) => ({ x, y }));
}

export function reduceBattle(battle, action) {
  if (battle.result) {
    return battle;
  }

  if (action.type === "MOVE") {
    const reachable = getReachableCells(battle);
    if (!reachable.some(({ x, y }) => x === action.x && y === action.y)) {
      throw new Error("Cell is not reachable.");
    }
    return {
      ...battle,
      player: {
        ...battle.player,
        x: action.x,
        y: action.y,
      },
    };
  }

  if (action.type === "ESCAPE") {
    if (!isEdgeCell(battle, battle.player.x, battle.player.y)) {
      throw new Error("Escape is only possible from an edge cell.");
    }
    return {
      ...battle,
      result: "escaped",
    };
  }

  if (action.type === "ATTACK") {
    requireRange(battle, 1);
    const next = {
      ...battle,
      enemy: {
        ...battle.enemy,
        hp: Math.max(0, battle.enemy.hp - 8),
      },
    };
    return next.enemy.hp === 0
      ? { ...next, result: "victory" }
      : resolveEnemyTurn(next);
  }

  if (action.type === "DEFEND") {
    return resolveEnemyTurn({
      ...battle,
      player: {
        ...battle.player,
        defended: true,
      },
    });
  }

  if (action.type === "SLEIGHT_OF_HAND") {
    requireRange(battle, 1);
    if (battle.sleightUsed) {
      throw new Error("Sleight of hand has already been used on this target.");
    }
    if (battle.player.essence < 3) {
      throw new Error("Not enough essence.");
    }

    const contestsWineWorm = battle.kind === "fangYuan" && battle.flags.actionWindow;
    return resolveEnemyTurn({
      ...battle,
      sleightUsed: true,
      wineContested: contestsWineWorm || battle.wineContested,
      player: {
        ...battle.player,
        essence: battle.player.essence - 3,
      },
    });
  }

  if (action.type === "STEAL_ESSENCE") {
    requireRange(battle, 2);
    if (battle.player.essence < 4) {
      throw new Error("Not enough essence.");
    }
    if (battle.player.stealEssenceCooldown > 0) {
      throw new Error("Steal essence is cooling down.");
    }

    const next = {
      ...battle,
      enemy: {
        ...battle.enemy,
        hp: Math.max(0, battle.enemy.hp - 6),
      },
      player: {
        ...battle.player,
        essence: Math.min(
          battle.player.maxEssence,
          battle.player.essence - 4 + 3
        ),
        stealEssenceCooldown: 2,
      },
    };
    return next.enemy.hp === 0
      ? { ...next, result: "victory" }
      : resolveEnemyTurn(next);
  }

  throw new Error(`Unknown battle action: ${action.type}`);
}

export function commitBattleResult(persistentState, battle) {
  if (!battle.result) {
    throw new Error("Battle has not ended.");
  }

  if (battle.result === "defeat") {
    const stones = persistentState.player.stones;
    const loss = stones > 0 ? Math.max(1, Math.floor(stones * 0.25)) : 0;
    let next = sleepToNextDay({
      ...persistentState,
      player: {
        ...persistentState.player,
        stones: stones - loss,
      },
    });
    if (battle.wineContested) {
      next = {
        ...next,
        wineWorm: {
          ...next.wineWorm,
          owner: "fangYuan",
          status: "carried",
        },
      };
    }
    return next;
  }

  let next = {
    ...persistentState,
    player: {
      ...persistentState.player,
      hp: battle.player.hp,
      essence: battle.player.essence,
    },
  };

  if (battle.kind === "forest" && battle.result === "victory") {
    next = {
      ...next,
      player: {
        ...next.player,
        stones: next.player.stones + 8,
      },
      flags: {
        ...next.flags,
        forestEncounterDay: next.clock.day,
      },
    };
  }

  if (
    battle.kind === "fangYuan" &&
    (battle.wineContested || battle.result === "victory")
  ) {
    next = {
      ...next,
      wineWorm: {
        ...next.wineWorm,
        owner: "player",
        status: "unhidden",
      },
      inventory: next.inventory.includes("wine-worm")
        ? next.inventory
        : [...next.inventory, "wine-worm"],
    };
  }

  return resolveTimedPlayerAction(next, 2, (current) => current);
}

function resolveEnemyTurn(battle) {
  let enemy = { ...battle.enemy };
  let distance = manhattan(enemy, battle.player);

  for (let step = 0; step < enemy.move && distance > 1; step += 1) {
    const candidate = chooseEnemyStep(battle, enemy);
    if (!candidate) {
      break;
    }
    enemy = {
      ...enemy,
      ...candidate,
    };
    distance = manhattan(enemy, battle.player);
  }

  let player = {
    ...battle.player,
    stealEssenceCooldown: Math.max(0, battle.player.stealEssenceCooldown - 1),
  };

  if (distance === 1) {
    const damage = player.defended
      ? Math.floor(enemy.attack / 2)
      : enemy.attack;
    player = {
      ...player,
      hp: Math.max(0, player.hp - damage),
      defended: false,
    };
  }

  return {
    ...battle,
    enemy,
    player,
    result: player.hp === 0 ? "defeat" : null,
  };
}

function chooseEnemyStep(battle, enemy) {
  const candidates = DIRECTIONS.map((direction) => ({
    x: enemy.x + direction.x,
    y: enemy.y + direction.y,
  })).filter(
    ({ x, y }) =>
      insideGrid(battle, x, y) &&
      !(x === battle.player.x && y === battle.player.y)
  );

  candidates.sort((a, b) => {
    const distanceDelta =
      manhattan(a, battle.player) - manhattan(b, battle.player);
    if (distanceDelta !== 0) {
      return distanceDelta;
    }
    return directionIndex(enemy, a) - directionIndex(enemy, b);
  });

  return candidates[0] || null;
}

function directionIndex(origin, target) {
  return DIRECTIONS.findIndex(
    (direction) =>
      origin.x + direction.x === target.x && origin.y + direction.y === target.y
  );
}

function requireRange(battle, range) {
  if (manhattan(battle.player, battle.enemy) > range) {
    throw new Error("Target is out of range.");
  }
}

function insideGrid(battle, x, y) {
  return x >= 0 && x < battle.width && y >= 0 && y < battle.height;
}

function isEdgeCell(battle, x, y) {
  return x === 0 || y === 0 || x === battle.width - 1 || y === battle.height - 1;
}

function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function cellKey(x, y) {
  return `${x},${y}`;
}
