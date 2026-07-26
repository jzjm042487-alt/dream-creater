import {
  resolveTimedPlayerAction,
  sleepToNextDay,
} from "../rules/timeRules.js";
import { calculateTheftResult } from "../rules/theftRules.js";

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
    const result = theftCheck(state, 8, state.flags.clerkObserved ? 2 : 0);
    return resolveTimedPlayerAction(state, 2, (current) => ({
      ...withAlert(current, result.band === "failure" ? 6 : 4),
      clues: addUnique(
        current.clues,
        result.band === "success" ? "patrol-sheet" : "patrol-window-hint"
      ),
      flags: {
        ...current.flags,
        patrolSheet: result.band === "success",
        patrolHint: result.band === "partial",
      },
    }));
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
    const preparation =
      (state.flags.patrolSheet ? 2 : state.flags.patrolHint ? 1 : 0) +
      (state.flags.correctWineJar ? 2 : 0);
    const result = theftCheck(state, 9, preparation);

    return resolveTimedPlayerAction(state, 2, (current) =>
      resolveMerchantAttempt(current, result, {
        successAlert: 18,
        failureAlert: 10,
      })
    );
  }

  if (actionId === "follow-fang-yuan") {
    const followedAllCheckpoints =
      context.checkpoints?.join(",") === "street,tavern,alley";
    const keptDistance = context.minimumDistance >= 64;

    if (!followedAllCheckpoints || !keptDistance) {
      return resolveTimedPlayerAction(state, 2, (current) =>
        withAlert(current, 8)
      );
    }
    if (state.player.stones < 2) {
      throw new Error("Two primeval stones are required for the distraction.");
    }

    const result = theftCheck(state, 11, 5);
    return resolveTimedPlayerAction(state, 2, (current) => {
      const paid = {
        ...current,
        player: {
          ...current.player,
          stones: current.player.stones - 2,
        },
      };
      return resolveMerchantAttempt(paid, result, {
        successAlert: 24,
        failureAlert: 10,
      });
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
      throw new Error("The daily theft target is already alert.");
    }
    return resolveTimedPlayerAction(state, 2, (current) => ({
      ...withAlert(current, 3),
      player: {
        ...current.player,
        stones: current.player.stones + 4,
      },
      flags: {
        ...current.flags,
        ordinaryTheftDay: current.clock.day,
      },
    }));
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
      acquireWineWorm(
        {
          ...current,
          player: {
            ...current.player,
            stones: current.player.stones - price,
          },
        },
        10
      )
    );
  }

  if (actionId === "tavern-conflict") {
    if (state.player.stones < 2) {
      throw new Error("Two primeval stones are required to start the conflict.");
    }
    const result = theftCheck(state, 9, 2);
    return resolveTimedPlayerAction(state, 2, (current) => {
      const paid = {
        ...current,
        player: {
          ...current.player,
          stones: current.player.stones - 2,
        },
      };
      return resolveMerchantAttempt(paid, result, {
        successAlert: 18,
        failureAlert: 10,
      });
    });
  }

  if (actionId === "sleep") {
    return sleepToNextDay(state);
  }

  throw new Error(`Unknown wine worm action: ${actionId}`);
}

function theftCheck(state, difficulty, preparation) {
  return calculateTheftResult({
    theftRank: state.player.theftRank,
    agility: state.player.stats.agility,
    insight: state.player.stats.insight,
    caution: state.player.stats.caution,
    preparation,
    difficulty,
  });
}

function resolveMerchantAttempt(state, result, alertDelta) {
  if (result.band === "success") {
    return acquireWineWorm(state, alertDelta.successAlert);
  }

  const failedAttempts = state.wineWorm.failedAttempts + 1;
  if (failedAttempts >= 2) {
    return {
      ...withAlert(state, alertDelta.failureAlert),
      wineWorm: {
        ...state.wineWorm,
        owner: "fangYuan",
        status: "carried",
        failedAttempts,
      },
    };
  }

  return {
    ...withAlert(state, alertDelta.failureAlert),
    wineWorm: {
      ...state.wineWorm,
      owner: "merchant",
      status: "guest-room",
      failedAttempts,
    },
    flags: {
      ...state.flags,
      guestRoomKey: result.band === "partial",
    },
  };
}

function acquireWineWorm(state, alertDelta) {
  return {
    ...withAlert(state, alertDelta),
    wineWorm: {
      ...state.wineWorm,
      owner: "player",
      status: "unhidden",
    },
    inventory: addUnique(state.inventory, "wine-worm"),
  };
}

function withAlert(state, delta) {
  const alert = Math.min(100, state.fangYuan.alert + delta);
  return {
    ...state,
    fangYuan: {
      ...state.fangYuan,
      alert,
      stance: alert >= 40 ? "test" : alert >= 20 ? "observe" : "ignore",
    },
  };
}

function addUnique(values, value) {
  return values.includes(value) ? values : [...values, value];
}
