import { actions, memoryHints } from "./content.js";

const defaultState = {
  day: 1,
  actionPoints: 3,
  memoryHint: memoryHints[0],
  player: {
    name: "天外盗种",
    realm: "凡人",
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
    progress: 12,
    stance: "无视你",
  },
  flags: {
    hasRosterLead: false,
    hasWineLead: false,
    hasMerchantWindow: false,
    wineWormOwner: null,
    wineWormHidden: false,
    wineWormRefined: false,
  },
  quest: {
    wineWorm: "unknown",
  },
  inventory: [],
  log: ["你在青茅山醒来。原著的碎片像冷酒一样压在喉间。"],
};

export function createInitialState(overrides = {}) {
  return mergeState(defaultState, overrides);
}

export function resolveAction(state, actionId) {
  const action = actions[actionId];
  if (!action) {
    throw new Error(`Unknown action: ${actionId}`);
  }

  if (action.type !== "rest" && state.actionPoints < action.cost) {
    return appendLog(state, "行动点不足。夜色压下来，你不能把所有风险都塞进同一天。");
  }

  if (action.requires && !state.flags[action.requires]) {
    return appendLog(state, getRequirementMessage(actionId));
  }

  if (actionId === "study-at-academy") {
    return appendLog(
      {
        ...state,
        actionPoints: state.actionPoints - action.cost,
        player: {
          ...state.player,
          cultivation: state.player.cultivation + 8,
        },
      },
      "你在学堂按规矩修炼。进展不快，但没有人会因为勤奋怀疑你。"
    );
  }

  if (actionId === "steal-academy-roster") {
    const score = theftScore(state) - action.difficulty;
    const partlySucceeded = score >= 3;
    return appendLog(
      {
        ...state,
        actionPoints: state.actionPoints - action.cost,
        fangYuan: updateFangYuanAlert(state.fangYuan, action.alertDelta),
        flags: {
          ...state.flags,
          hasRosterLead: partlySucceeded,
        },
      },
      partlySucceeded
        ? "你偷到了学堂排班，但柜门边缘留下了轻微刮痕。方源警觉上升。"
        : "你没能偷出排班，只确认了守卫换岗时间。风声变紧，方源警觉上升。"
    );
  }

  if (actionId === "investigate-wine-scent") {
    const hasLead = state.flags.hasRosterLead || state.player.stats.insight >= 4;
    return appendLog(
      {
        ...state,
        actionPoints: state.actionPoints - action.cost,
        flags: {
          ...state.flags,
          hasWineLead: hasLead,
        },
        quest: {
          ...state.quest,
          wineWorm: hasLead ? "lead-found" : state.quest.wineWorm,
        },
        memoryHint: memoryHints[1],
      },
      hasLead
        ? "你把排班与酒馆传闻对上了。酒虫线索浮出水面，但方源不会慢太久。"
        : "酒馆里确有异香，但线索太散。你需要排班、账册或更强的洞察。"
    );
  }

  if (actionId === "stakeout-wine-merchant") {
    const score = theftScore(state) - action.difficulty;
    const hasWindow = score >= 3;
    return appendLog(
      {
        ...state,
        actionPoints: state.actionPoints - action.cost,
        fangYuan: updateFangYuanAlert(state.fangYuan, action.alertDelta),
        flags: {
          ...state.flags,
          hasMerchantWindow: hasWindow,
        },
        quest: {
          ...state.quest,
          wineWorm: hasWindow ? "window-open" : "lead-found",
        },
      },
      hasWindow
        ? "你盯住了卖酒商贩的空档：明日午后，酒坛会短暂离开掌柜视线。"
        : "你盯了一整段时间，只确认方源也在靠近这条线。窗口还不够清楚。"
    );
  }

  if (actionId === "steal-wine-worm") {
    if (state.flags.wineWormOwner === "player") {
      return appendLog(state, "酒虫已经在你手里。现在的问题不是再偷一次，而是怎么藏住它。");
    }

    const preparationBonus = (state.flags.hasRosterLead ? 2 : 0) + (state.flags.hasWineLead ? 1 : 0);
    const score = theftScore(state) + preparationBonus - action.difficulty;
    const success = score >= 3;

    if (!success) {
      return appendLog(
        {
          ...state,
          actionPoints: state.actionPoints - action.cost,
          fangYuan: updateFangYuanAlert(state.fangYuan, 12),
          quest: {
            ...state.quest,
            wineWorm: "contested",
          },
        },
        "你出手慢了一线，只偷到沾着异香的酒布。方源已经意识到有人在截他的机缘。"
      );
    }

    return appendLog(
      {
        ...state,
        actionPoints: state.actionPoints - action.cost,
        inventory: [...state.inventory, "wine-worm"],
        player: {
          ...state.player,
          cultivation: state.player.cultivation + 18,
        },
        fangYuan: updateFangYuanAlert(state.fangYuan, action.alertDelta),
        flags: {
          ...state.flags,
          wineWormOwner: "player",
        },
        quest: {
          ...state.quest,
          wineWorm: "completed",
        },
        memoryHint: memoryHints[2],
      },
      "你截胡了酒虫。修炼速度的缺口被硬生生补上，但方源必然会重新审视你。"
    );
  }

  if (actionId === "hide-wine-worm") {
    if (state.flags.wineWormOwner !== "player") {
      return appendLog(state, "你还没有酒虫可藏。");
    }

    if (state.flags.wineWormHidden) {
      return appendLog(state, "酒虫已经藏好。");
    }

    return appendLog(
      {
        ...state,
        actionPoints: state.actionPoints - action.cost,
        flags: {
          ...state.flags,
          wineWormHidden: true,
        },
        quest: {
          ...state.quest,
          wineWorm: "hidden",
        },
      },
      "你用旧酒坛和灰布封住酒虫气息，再把它藏进住处夹层。"
    );
  }

  if (actionId === "refine-wine-worm") {
    if (!state.flags.wineWormHidden) {
      return appendLog(state, "酒虫气息尚未处理，强行炼化太容易暴露。");
    }

    if (state.flags.wineWormRefined) {
      return appendLog(state, "酒虫已经炼化。");
    }

    return appendLog(
      {
        ...state,
        actionPoints: state.actionPoints - action.cost,
        player: {
          ...state.player,
          cultivation: state.player.cultivation + 30,
        },
        flags: {
          ...state.flags,
          wineWormRefined: true,
        },
        quest: {
          ...state.quest,
          wineWorm: "refined",
        },
      },
      "酒虫入窍，修炼速度的缺口被补上。方源失去这段先手。"
    );
  }

  if (actionId === "end-day") {
    const nextDay = state.day + 1;
    return appendLog(
      {
        ...state,
        day: nextDay,
        actionPoints: 3,
        memoryHint: memoryHints[(nextDay - 1) % memoryHints.length],
        fangYuan: {
          ...state.fangYuan,
          progress: state.fangYuan.progress + 7,
        },
      },
      `${formatDay(nextDay)}将至。方源也没有停下，他的计划又往前推了一步。`
    );
  }

  return state;
}

function theftScore(state) {
  const { agility, insight, caution } = state.player.stats;
  return state.player.theftRank * 2 + agility + insight + caution;
}

function updateFangYuanAlert(fangYuan, delta) {
  const alert = Math.min(100, fangYuan.alert + delta);
  return {
    ...fangYuan,
    alert,
    stance: alert >= 40 ? "观察你" : "无视你",
  };
}

function appendLog(state, message) {
  return {
    ...state,
    log: [...state.log, message],
  };
}

function getRequirementMessage(actionId) {
  if (actionId === "stakeout-wine-merchant") {
    return "你还没有可靠的酒虫线索。先调查酒肆异香，或偷到学堂排班再来。";
  }
  if (actionId === "steal-wine-worm") {
    return "你还没锁定商贩的空档。直接动手只会把自己送进方源和守卫眼里。";
  }
  return "条件不足。";
}

function formatDay(day) {
  const numerals = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  if (day >= 0 && day <= 10) {
    return `第${numerals[day]}日`;
  }
  return `第 ${day} 日`;
}

function mergeState(base, overrides) {
  return {
    ...base,
    ...overrides,
    player: {
      ...base.player,
      ...overrides.player,
      stats: {
        ...base.player.stats,
        ...overrides.player?.stats,
      },
    },
    fangYuan: {
      ...base.fangYuan,
      ...overrides.fangYuan,
    },
    flags: {
      ...base.flags,
      ...overrides.flags,
    },
    quest: {
      ...base.quest,
      ...overrides.quest,
    },
    inventory: overrides.inventory ?? [...base.inventory],
    log: overrides.log ?? [...base.log],
  };
}
