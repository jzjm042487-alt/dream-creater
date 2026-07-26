const defaultState = {
  version: 2,
  clock: {
    day: 1,
    tick: 0,
  },
  scene: {
    id: "world",
    entrance: "gu-yue-road",
  },
  player: {
    hp: 40,
    maxHp: 40,
    essence: 20,
    maxEssence: 20,
    stones: 6,
    cultivation: 0,
    theftRank: 1,
    stats: {
      agility: 3,
      insight: 3,
      caution: 2,
    },
  },
  fangYuan: {
    alert: 8,
    stance: "ignore",
  },
  wineWorm: {
    owner: "merchant",
    status: "carried",
    failedAttempts: 0,
  },
  clues: [],
  flags: {},
  inventory: [],
};

export function createInitialState(overrides = {}) {
  return {
    ...defaultState,
    ...overrides,
    clock: {
      ...defaultState.clock,
      ...overrides.clock,
    },
    scene: {
      ...defaultState.scene,
      ...overrides.scene,
    },
    player: {
      ...defaultState.player,
      ...overrides.player,
      stats: {
        ...defaultState.player.stats,
        ...overrides.player?.stats,
      },
    },
    fangYuan: {
      ...defaultState.fangYuan,
      ...overrides.fangYuan,
    },
    wineWorm: {
      ...defaultState.wineWorm,
      ...overrides.wineWorm,
    },
    flags: {
      ...defaultState.flags,
      ...overrides.flags,
    },
    clues: overrides.clues ? [...overrides.clues] : [],
    inventory: overrides.inventory ? [...overrides.inventory] : [],
  };
}
