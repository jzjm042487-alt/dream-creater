import {
  resolveTimedPlayerAction,
  sleepToNextDay,
} from "../rules/timeRules.js";
import { resolveTheftRoll } from "../rules/theftChance.js";

export function resolveWineWormAction(state, actionId, context = {}) {
  if (actionId === "observe-clerk") {
    return resolveTimedPlayerAction(state, 1, (current) => ({
      ...current,
      clues: addUnique(current.clues, "patrol-handover"),
      flags: {
        ...current.flags,
        clerkObserved: true,
      },
    }));
  }

  if (actionId === "steal-patrol-sheet") {
    const result = theftCheck(state, "secured", 0);
    return resolveTimedPlayerAction(state, 2, (current) => {
      const rolled = withTheftCursor(current, result);
      return {
        ...rolled,
        clues: addUnique(
          rolled.clues,
          result.success ? "patrol-sheet" : "patrol-window-hint"
        ),
        flags: {
          ...rolled.flags,
          patrolSheet: result.success,
          patrolHint: !result.success,
        },
      };
    });
  }

  if (actionId === "confirm-wine-jar") {
    return resolveTimedPlayerAction(state, 1, (current) => ({
      ...current,
      clues: addUnique(current.clues, "correct-wine-jar"),
      flags: {
        ...current.flags,
        correctWineJar: true,
      },
    }));
  }

  if (actionId === "steal-back-room") {
    const result = theftCheck(state, "secured", 0);

    return resolveTimedPlayerAction(state, 2, (current) =>
      resolveMerchantAttempt(withTheftCursor(current, result), result)
    );
  }

  if (actionId === "follow-fang-yuan") {
    const followedAllCheckpoints =
      context.checkpoints?.join(",") === "street,tavern,alley";
    const keptDistance = context.minimumDistance >= 64;

    if (!followedAllCheckpoints || !keptDistance) {
      return resolveTimedPlayerAction(state, 2, (current) =>
        withFangYuanConflict(current, "playerFollowedMe")
      );
    }
    if (state.player.stones < 2) {
      throw new Error("Two primeval stones are required for the distraction.");
    }

    const result = theftCheck(state, "ordinary", 0);
    return resolveTimedPlayerAction(state, 2, (current) => {
      const paid = {
        ...withTheftCursor(current, result),
        player: {
          ...current.player,
          theftRandomCursor: result.nextCursor,
          stones: current.player.stones - 2,
        },
      };
      return withFangYuanFact(
        resolveMerchantAttempt(paid, result),
        "playerCompetesForWineWorm",
        result.success ? "rival" : "conflict"
      );
    });
  }

  if (actionId === "train-at-academy") {
    if (state.player.essence < 4) {
      throw new Error("Not enough essence to train.");
    }
    const receivesStipend = state.flags.academyStipendDay !== state.clock.day;
    return resolveTimedPlayerAction(state, 2, (current) => ({
      ...current,
      player: {
        ...current.player,
        essence: current.player.essence - 4,
        cultivation: current.player.cultivation + 8,
        stones: current.player.stones + (receivesStipend ? 4 : 0),
      },
      flags: {
        ...current.flags,
        academyStipendDay: receivesStipend
          ? current.clock.day
          : current.flags.academyStipendDay,
      },
    }));
  }

  if (actionId === "ordinary-theft") {
    if (state.flags.ordinaryTheftDay === state.clock.day) {
      throw new Error("The daily theft target has already been attempted.");
    }
    const result = theftCheck(state, "ordinary", 0);
    return resolveTimedPlayerAction(state, 2, (current) => {
      const rolled = withTheftCursor(current, result);
      return {
        ...rolled,
        player: {
          ...rolled.player,
          stones: rolled.player.stones + (result.success ? 4 : 0),
        },
        flags: {
          ...rolled.flags,
          ordinaryTheftDay: current.clock.day,
          ordinaryTheftSucceeded: result.success,
        },
      };
    });
  }

  if (actionId === "buy-wine-worm") {
    if (
      state.clock.day > 2 ||
      (state.clock.day === 2 && state.clock.tick >= 8)
    ) {
      throw new Error("The merchant has already lost the wine worm.");
    }
    const price = state.wineWorm.failedAttempts > 0 ? 22 : 18;
    if (state.player.stones < price) {
      throw new Error("Not enough primeval stones.");
    }
    return resolveTimedPlayerAction(state, 2, (current) =>
      acquireWineWorm({
        ...current,
        player: {
          ...current.player,
          stones: current.player.stones - price,
        },
      })
    );
  }

  if (actionId === "tavern-conflict") {
    if (state.player.stones < 2) {
      throw new Error("Two primeval stones are required to start the conflict.");
    }
    const result = theftCheck(state, "secured", 0);
    return resolveTimedPlayerAction(state, 2, (current) => {
      const paid = {
        ...withTheftCursor(current, result),
        player: {
          ...current.player,
          theftRandomCursor: result.nextCursor,
          stones: current.player.stones - 2,
        },
      };
      return withFangYuanConflict(
        resolveMerchantAttempt(paid, result),
        "tavernWineWorm"
      );
    });
  }

  if (actionId === "sleep") {
    return sleepToNextDay(state);
  }

  throw new Error(`Unknown wine worm action: ${actionId}`);
}

function theftCheck(state, itemClass, targetRankIndex) {
  return resolveTheftRoll({
    seed: state.player.theftSeed,
    cursor: state.player.theftRandomCursor,
    luck: state.player.luck,
    theftMastery: state.player.theftMastery,
    playerRankIndex: state.player.rankIndex,
    targetRankIndex,
    itemClass,
  });
}

function resolveMerchantAttempt(state, result) {
  if (result.success) {
    return acquireWineWorm(state);
  }

  const failedAttempts = state.wineWorm.failedAttempts + 1;
  if (failedAttempts >= 2) {
    return {
      ...state,
      wineWorm: {
        ...state.wineWorm,
        owner: "fangYuan",
        status: "carried",
        failedAttempts,
      },
    };
  }

  return {
    ...state,
    wineWorm: {
      ...state.wineWorm,
      owner: "merchant",
      status: "guest-room",
      failedAttempts,
    },
    flags: {
      ...state.flags,
      guestRoomKey: true,
    },
  };
}

function acquireWineWorm(state) {
  return {
    ...state,
    wineWorm: {
      ...state.wineWorm,
      owner: "player",
      status: "unhidden",
    },
    inventory: addUnique(state.inventory, "wine-worm"),
  };
}

function withTheftCursor(state, result) {
  return {
    ...state,
    player: {
      ...state.player,
      theftRandomCursor: result.nextCursor,
    },
  };
}

function withFangYuanFact(state, factId, relationshipState) {
  return {
    ...state,
    fangYuan: {
      ...state.fangYuan,
      relationshipState,
      knownFacts: {
        ...state.fangYuan.knownFacts,
        [factId]: true,
      },
    },
  };
}

function withFangYuanConflict(state, conflictId) {
  return {
    ...state,
    fangYuan: {
      ...state.fangYuan,
      relationshipState: "conflict",
      directConflicts: {
        ...state.fangYuan.directConflicts,
        [conflictId]: true,
      },
    },
  };
}

function addUnique(values, value) {
  return values.includes(value) ? values : [...values, value];
}
