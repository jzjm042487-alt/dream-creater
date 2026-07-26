export function canStartTimedAction(state, cost) {
  return Number.isInteger(cost) && cost >= 0 && state.clock.tick + cost <= 12;
}

export function resolveTimedPlayerAction(state, cost, applyPlayerResult) {
  if (!canStartTimedAction(state, cost)) {
    throw new Error("Not enough time remains for this action.");
  }

  let next = applyPlayerResult(state);

  for (let elapsed = 0; elapsed < cost; elapsed += 1) {
    next = applyScheduledTick({
      ...next,
      clock: {
        ...next.clock,
        tick: next.clock.tick + 1,
      },
    });
  }

  return next;
}

export function sleepToNextDay(state) {
  const carriedWineWorm =
    state.wineWorm.owner === "player" && state.wineWorm.status === "unhidden";
  const alert = Math.min(100, state.fangYuan.alert + (carriedWineWorm ? 8 : 0));

  return {
    ...state,
    clock: {
      day: state.clock.day + 1,
      tick: 0,
    },
    player: {
      ...state.player,
      hp: state.player.maxHp,
      essence: state.player.maxEssence,
    },
    fangYuan: {
      ...state.fangYuan,
      alert,
      stance: alert >= 40 ? "test" : alert >= 20 ? "observe" : "ignore",
    },
  };
}

function applyScheduledTick(state) {
  if (
    state.clock.day === 2 &&
    state.clock.tick === 8 &&
    state.wineWorm.owner === "merchant"
  ) {
    return {
      ...state,
      wineWorm: {
        ...state.wineWorm,
        owner: "fangYuan",
        status: "carried",
      },
    };
  }

  return state;
}
