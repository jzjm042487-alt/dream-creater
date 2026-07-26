import { resolveTimedPlayerAction } from "../rules/timeRules.js";

export function reduceGameState(state, event) {
  if (event.type === "WINE_WORM_ACQUIRED") {
    return {
      ...state,
      wineWorm: {
        ...state.wineWorm,
        owner: "player",
        status: "unhidden",
      },
      flags: {
        ...state.flags,
        wineWormRoute: event.route,
      },
      inventory: state.inventory.includes("wine-worm")
        ? state.inventory
        : [...state.inventory, "wine-worm"],
    };
  }

  if (event.type === "WINE_WORM_HIDDEN") {
    if (state.wineWorm.owner !== "player") {
      throw new Error("The player does not own the wine worm.");
    }

    return resolveTimedPlayerAction(state, 1, (current) => ({
      ...current,
      wineWorm: {
        ...current.wineWorm,
        status: "hidden",
      },
    }));
  }

  if (event.type === "WINE_WORM_REFINED") {
    if (state.wineWorm.owner !== "player" || state.wineWorm.status !== "hidden") {
      throw new Error("The wine worm must be owned and hidden before refining.");
    }
    if (state.player.essence < 8) {
      throw new Error("Not enough essence to refine the wine worm.");
    }

    return resolveTimedPlayerAction(state, 2, (current) => ({
      ...current,
      player: {
        ...current.player,
        essence: current.player.essence - 8,
        cultivation: current.player.cultivation + 30,
      },
      wineWorm: {
        ...current.wineWorm,
        status: "refined",
      },
    }));
  }

  return state;
}
