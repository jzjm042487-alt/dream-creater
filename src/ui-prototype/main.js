import { createIcons, icons } from "lucide";
import {
  createBattleState,
  reduceBattle,
} from "../game/rules/battleRules.js";
import { icon, iconButton, scenePath, statusBadge } from "./components.js";
import {
  DAY_END_ACTIONS,
  DEMO_STATE,
  DIALOGUE_CHOICES,
  ENDING_ROUTES,
  GU_WORMS,
  QUESTS,
  RELATION_GROUPS,
  RIVALS,
  ROLL_CARDS,
  SOURCE_OPPORTUNITIES,
  THEFT_TARGETS,
  TOWN_INTERACTABLES,
  WILDERNESS_NODES,
  calculateTheftChance,
  filterSourceOpportunities,
  findNearbyTownTarget,
  getDeterministicPercent,
  moveTownPosition,
} from "./mockState.js";
import { UI_GROUPS, UI_PANELS, getPanel } from "./panelRegistry.js";
import { renderActionPanel } from "./panels/actionPanels.js";
import { renderCreationPanel } from "./panels/creationPanels.js";
import { renderEndgamePanel } from "./panels/endgamePanels.js";
import {
  renderSourceDetail,
  renderSourceResults,
  renderWorldPanel,
} from "./panels/worldPanels.js";

const root = document.querySelector("#ui-prototype");
let state = structuredClone(DEMO_STATE);
let toastTimer;
let travelTimer;
let townMoveTimer;
let townMoveAnimation;
let townQueuedDirection;
let townHeldDirection;
let townMoveSequence = 0;

const TOWN_STEP_DURATION_MS = 320;

function createDemoBattle() {
  return createBattleState(
    "fangYuan",
    {
      player: {
        hp: state.player.health.current,
        maxHp: state.player.health.max,
        essence: state.player.essence.current,
        maxEssence: state.player.essence.max,
      },
      flags: {
        fangYuanActionWindow: false,
      },
    },
    {
      player: { x: 1, y: 4, move: 3 },
      enemy: { x: 6, y: 1, hp: 42, maxHp: 42, attack: 9, move: 2 },
    }
  );
}

state.combat = createDemoBattle();

function resolveTheftTarget(targetId) {
  const explicit = THEFT_TARGETS.find(({ id }) => id === targetId);
  if (explicit) {
    return explicit;
  }

  const rival = RIVALS.find(({ id }) => id === targetId);
  if (!rival) {
    return THEFT_TARGETS[0];
  }

  const level = rival.realm.startsWith("三转")
    ? 3
    : rival.realm.startsWith("二转")
      ? 2
      : 1;

  return {
    id: rival.id,
    name: rival.name,
    realm: rival.realm,
    level,
    portrait: rival.portrait,
    items: [
      {
        id: `${rival.id}-stones`,
        name: "元石袋",
        description: "随身修炼资源",
        itemClass: "ordinary",
      },
      {
        id: `${rival.id}-gu-food`,
        name: "常用蛊材",
        description: `${rival.gu}的食料`,
        itemClass: "ordinary",
      },
      {
        id: `${rival.id}-token`,
        name: "随身令牌",
        description: "当前身份凭证",
        itemClass: "secured",
      },
    ],
  };
}

function ensureTheftState() {
  if (!Array.isArray(state.ui.theftAttemptedTargetIds)) {
    state.ui.theftAttemptedTargetIds = [];
  }
  if (!Array.isArray(state.ui.stolenItemIds)) {
    state.ui.stolenItemIds = [];
  }
  if (typeof state.player.theftSeed !== "string" || !state.player.theftSeed) {
    state.player.theftSeed = "qingmao-ui-demo-theft-v1";
  }
  if (!Number.isInteger(state.player.theftRandomCursor)) {
    state.player.theftRandomCursor = 0;
  }
}

function availableTheftItems(target) {
  ensureTheftState();
  const stolenItemIds = new Set(state.ui.stolenItemIds);
  return target.items.filter(({ id }) => !stolenItemIds.has(id));
}

function renderPanel(panelId) {
  if (["UI00", "UI01", "UI02", "UI03", "UI04"].includes(panelId)) {
    return renderCreationPanel(panelId, state);
  }
  if (["UI05", "UI06", "UI07", "UI08", "UI09", "UI10"].includes(panelId)) {
    return renderWorldPanel(panelId, state);
  }
  if (["UI11", "UI12", "UI13"].includes(panelId)) {
    return renderActionPanel(panelId, state);
  }
  return renderEndgamePanel(panelId, state);
}

function renderNavigation() {
  return UI_GROUPS.map((group) => {
    const panels = UI_PANELS.filter(({ group: groupId }) => groupId === group.id);

    return `
      <section class="nav-group">
        <h2>${group.label}</h2>
        <div class="nav-group-items">
          ${panels
            .map(
              (panel) => `
                <button
                  class="nav-item ${state.ui.selectedPanel === panel.id ? "is-active" : ""} ${
                    panel.featured ? "is-featured" : ""
                  }"
                  type="button"
                  data-panel-id="${panel.id}"
                  aria-current="${state.ui.selectedPanel === panel.id ? "page" : "false"}"
                  title="${panel.title}"
                >
                  <span class="nav-icon">${icon(panel.icon)}</span>
                  <span class="nav-copy"><small>${panel.id}</small><strong>${panel.title}</strong></span>
                  ${panel.featured ? `<i class="feature-dot" aria-label="核心系统"></i>` : ""}
                </button>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }).join("");
}

function renderTopBar(panel) {
  const { player, world } = state;

  return `
    <header class="prototype-topbar">
      <div class="prototype-brand">
        <span class="brand-seal">盗</span>
        <div><strong>天外盗客</strong><small>青茅山 · MVP UI</small></div>
      </div>
      <button
        class="icon-button mobile-nav-toggle"
        type="button"
        data-action="toggle-navigation"
        aria-label="打开界面目录"
        title="打开界面目录"
      >${icon("panel-left")}</button>
      <div class="world-breadcrumb">
        <span>${world.chapter}</span>
        ${icon("chevron-right")}
        <strong>${world.actLabel}</strong>
        <i></i>
        <span>第 ${world.day} 日 · ${world.time}</span>
        <i></i>
        <span>${world.location}</span>
      </div>
      <div class="hud-resources" aria-label="玩家资源">
        <div class="hud-resource resource-health" title="生命">
          ${icon("heart-pulse")}
          <span><small>生命</small><strong>${player.health.current}</strong></span>
        </div>
        <div class="hud-resource resource-essence" title="青铜真元">
          ${icon("droplets")}
          <span><small>真元</small><strong>${player.essence.current}</strong></span>
        </div>
        <div class="hud-resource resource-stones" title="元石">
          ${icon("gem")}
          <span><small>元石</small><strong>${player.stones}</strong></span>
        </div>
      </div>
      <nav class="topbar-actions" aria-label="系统操作">
        ${iconButton("save", "保存游戏", "save-prototype")}
        ${iconButton("folder-open", "读取存档", "load-prototype")}
        ${iconButton("maximize", "切换全屏", "toggle-fullscreen")}
      </nav>
      <div class="current-panel-mobile"><span>${panel.id}</span><strong>${panel.title}</strong></div>
    </header>
  `;
}

function renderContextRail(panel) {
  const activeQuest =
    QUESTS.find(({ id }) => id === state.ui.activeQuestId) ?? QUESTS[0];
  const currentRivals = RIVALS.filter(({ status }) => status !== "dead").slice(0, 3);

  return `
    <aside class="context-rail simplified-context-rail" aria-label="当前情境">
      <section class="context-scene">
        <img src="${scenePath(panel.scene)}" alt="" />
        <div></div>
        <span>${state.world.weather}</span>
        <strong>${state.world.location}</strong>
        <small>第 ${state.world.day} 日 · ${state.world.time}</small>
      </section>

      <section class="context-objective">
        <header>
          <span>${icon("crosshair")} 当前任务</span>
          ${statusBadge(activeQuest.statusLabel, "special")}
        </header>
        <small>${activeQuest.id} · ${activeQuest.kind}</small>
        <strong>${activeQuest.title}</strong>
        <p>${activeQuest.step}</p>
      </section>

      <section class="context-presence">
        <header><span>${icon("users-round")} 现场人物</span><small>2</small></header>
        <div class="presence-stage">
          <div>
            <img src="${state.player.portrait}" alt="${state.player.name}" />
            <span>${state.player.name}</span>
          </div>
          <i>${icon("move-horizontal")}</i>
          <button
            type="button"
            data-action="open-theft"
            data-theft-target-id="fang-yuan"
            aria-label="接近古月方源"
          >
            <img src="/assets/game/characters/chibi/chibi_fang_yuan.png" alt="" />
            <span>古月方源</span>
            <small>${icon("hand")} 偷盗</small>
          </button>
        </div>
      </section>

      <section class="context-rivals">
        <header><span>${icon("swords")} 附近竞争者</span></header>
        ${currentRivals
          .map(
            (rival) => `
              <button type="button" data-panel-id="UI10">
                <img src="${rival.portrait}" alt="" />
                <span><strong>${rival.name}</strong><small>${rival.realm}</small></span>
                ${statusBadge(rival.statusLabel, rival.status === "injured" ? "warning" : "good")}
              </button>
            `
          )
          .join("")}
      </section>

      <footer class="context-footer">
        <span>${icon("book-open-text")} 原文查询外挂</span>
        <button type="button" data-panel-id="UI08" title="打开原文查询">
          ${icon("arrow-up-right")}
        </button>
      </footer>
    </aside>
  `;
}

function renderTheftModal() {
  if (!state.ui.theftOpen) {
    return "";
  }

  const target = resolveTheftTarget(state.ui.theftTargetId);
  const availableItems = availableTheftItems(target);
  const selectedItem =
    availableItems.find(({ id }) => id === state.ui.theftItemId) ??
    availableItems[0];
  const attempted = state.ui.theftAttemptedTargetIds.includes(target.id);
  const luck =
    state.player.attributes.find(({ id }) => id === "luck")?.value ?? 50;
  const chance = selectedItem
    ? calculateTheftChance({
        luck,
        theftMastery: state.player.theftMastery,
        playerRankIndex: state.player.level,
        targetRankIndex: target.level,
        itemClass: selectedItem.itemClass,
      })
    : 0;

  return `
    <div class="theft-modal-backdrop" data-action="close-theft">
      <section
        class="theft-modal"
        role="dialog"
        aria-modal="true"
        aria-label="偷盗 ${target.name}"
        data-theft-dialog
      >
        <header>
          <div>
            <span>${icon("hand")} 靠近人物</span>
            <h2>偷盗 ${target.name}</h2>
            <p>选择一件物品，然后进行一次成功或失败判定。</p>
          </div>
          <button class="icon-button" type="button" data-action="close-theft" aria-label="关闭偷盗">${icon("x")}</button>
        </header>
        <div class="theft-modal-body">
          <aside class="theft-target">
            <img src="${target.portrait}" alt="${target.name}" />
            <strong>${target.name}</strong>
            <span>${target.realm}</span>
          </aside>
          <div class="theft-picker">
            <div class="section-title">
              <span>${icon("package-search")} 可偷盗内容</span>
              ${
                selectedItem
                  ? statusBadge(`成功率 ${chance}%`, chance >= 60 ? "good" : chance >= 30 ? "warning" : "danger")
                  : statusBadge("无可用目标", "neutral")
              }
            </div>
            <div class="theft-item-list">
              ${availableItems
                .map(
                  (item) => `
                    <button
                      type="button"
                      data-action="select-theft-item"
                      data-theft-item-id="${item.id}"
                      class="${selectedItem.id === item.id ? "is-selected" : ""}"
                    >
                      <span>${icon("package")}</span>
                      <span><strong>${item.name}</strong><small>${item.description}</small></span>
                      ${icon("check")}
                    </button>
                  `
                )
                .join("")}
            </div>
            <div class="theft-chance-note">
              ${icon("dices")}
              <span>概率由气运、盗道、双方境界差与物品类别计算，合法目标至少保留 15% 成功率。</span>
            </div>
            ${
              state.ui.theftResult
                ? `
                  <div class="theft-result ${state.ui.theftResult.startsWith("成功") ? "is-success" : "is-failure"}" data-theft-result>
                    ${icon(state.ui.theftResult.startsWith("成功") ? "circle-check-big" : "circle-x")}
                    <strong>${state.ui.theftResult}</strong>
                  </div>
                `
                : attempted
                  ? `
                    <div class="theft-result is-failure" data-theft-result>
                      ${icon("circle-minus")}
                      <strong>本次进入已完成判定</strong>
                    </div>
                  `
                  : !selectedItem
                    ? `
                      <div class="theft-result" data-theft-result>
                        ${icon("package-x")}
                        <strong>没有剩余可偷盗物品</strong>
                      </div>
                    `
                : `
                  <button class="primary-command full-command" type="button" data-action="attempt-theft">
                    ${icon("hand")} 偷取 ${selectedItem.name}
                  </button>
                `
            }
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderMobileDock() {
  const panel = getPanel(state.ui.selectedPanel);
  const adjacentIds = ["UI02", "UI06", "UI08", "UI11", "UI15"];

  return `
    <nav class="mobile-dock" aria-label="常用界面">
      ${adjacentIds
        .map((panelId) => {
          const item = getPanel(panelId);
          return `
            <button type="button" data-panel-id="${item.id}" class="${panel.id === item.id ? "is-active" : ""}">
              ${icon(item.icon)}<span>${item.shortTitle}</span>
            </button>
          `;
        })
        .join("")}
    </nav>
  `;
}

function renderApp() {
  if (townMoveAnimation) {
    cancelTownMovement();
  }
  ensureTheftState();
  const panel = getPanel(state.ui.selectedPanel);

  root.innerHTML = `
    <div
      class="ui-shell panel-${panel.id.toLowerCase()} ${state.ui.navigationOpen ? "navigation-open" : ""}"
      data-active-panel="${panel.id}"
    >
      <img class="shell-backdrop" src="${scenePath(panel.scene)}" alt="" />
      <div class="shell-backdrop-shade" aria-hidden="true"></div>
      ${renderTopBar(panel)}
      <div class="prototype-workspace">
        <aside class="panel-navigation" aria-label="全部游戏界面">
          <header class="nav-header">
            <span>界面总览</span>
            <strong>${UI_PANELS.length}</strong>
            <button
              class="icon-button close-mobile-nav"
              type="button"
              data-action="toggle-navigation"
              aria-label="关闭界面目录"
              title="关闭界面目录"
            >${icon("x")}</button>
          </header>
          <div class="nav-scroll">${renderNavigation()}</div>
          <footer class="nav-footer">
            <a href="/" title="返回当前可玩原型">
              ${icon("gamepad-2")}
              <span><small>可玩原型</small><strong>返回青茅山</strong></span>
              ${icon("arrow-up-right")}
            </a>
          </footer>
        </aside>
        <main class="panel-workspace" id="panel-workspace" tabindex="-1">${renderPanel(panel.id)}</main>
        ${renderContextRail(panel)}
      </div>
      ${renderMobileDock()}
      ${renderTheftModal()}
      <div class="app-toast" role="status" aria-live="polite" hidden></div>
    </div>
  `;

  createIcons({
    icons,
    attrs: {
      "stroke-width": 1.8,
    },
  });
}

function flash(message, tone = "neutral") {
  const toast = root.querySelector(".app-toast");
  if (!toast) {
    return;
  }

  clearTimeout(toastTimer);
  toast.className = `app-toast tone-${tone}`;
  toast.innerHTML = `${icon(
    tone === "danger" ? "triangle-alert" : tone === "good" ? "circle-check" : "info"
  )}<span>${message}</span>`;
  toast.hidden = false;
  createIcons({ icons, attrs: { "stroke-width": 1.8 } });
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

function navigate(panelId) {
  if (!UI_PANELS.some(({ id }) => id === panelId)) {
    return;
  }

  if (state.ui.selectedPanel === "UI12" && panelId !== "UI12") {
    cancelTownMovement();
  }
  state.ui.selectedPanel = panelId;
  state.ui.navigationOpen = false;
  renderApp();
  root.querySelector("#panel-workspace")?.focus({ preventScroll: true });
}

function refreshSourceQuery() {
  const results = root.querySelector("[data-source-results]");
  const detail = root.querySelector("[data-source-detail]");
  const count = root.querySelector("[data-source-count]");

  if (!results || !detail || !count) {
    return;
  }

  const filtered = filterSourceOpportunities(SOURCE_OPPORTUNITIES, {
    horizon: state.ui.queryHorizon,
    type: state.ui.queryType,
    query: state.ui.queryText,
  });
  results.innerHTML = renderSourceResults(state);
  detail.innerHTML = renderSourceDetail(state);
  count.textContent = String(filtered.length);
  createIcons({ icons, attrs: { "stroke-width": 1.8 } });
}

function rerenderAndFlash(message, tone = "neutral") {
  renderApp();
  flash(message, tone);
}

function getTownDirection(key) {
  return {
    ArrowUp: "up",
    w: "up",
    W: "up",
    ArrowDown: "down",
    s: "down",
    S: "down",
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right",
  }[key];
}

function updateTownPlayerPresentation(direction, { moving, blocked }) {
  const marker = root.querySelector(".town-player-marker");
  if (!marker) {
    return null;
  }

  for (const facing of ["up", "down", "left", "right"]) {
    marker.classList.remove(`is-facing-${facing}`);
  }
  marker.classList.add(`is-facing-${direction}`);
  marker.classList.toggle("is-moving", moving);
  marker.classList.toggle("is-blocked", blocked);

  const actionLabel = root.querySelector("[data-town-action] b");
  const emotionLabel = root.querySelector("[data-town-emotion] b");
  if (actionLabel) {
    actionLabel.textContent = moving ? "奔跑" : blocked ? "受阻" : "待机";
  }
  if (emotionLabel) {
    emotionLabel.textContent = blocked
      ? "谨慎"
      : moving
        ? state.ui.townEmotion === "alert"
          ? "警觉"
          : "专注"
        : state.ui.townEmotion === "alert"
          ? "警觉"
          : "平静";
  }

  return marker;
}

function cancelTownMovement() {
  townMoveSequence += 1;
  townMoveAnimation?.cancel();
  townMoveAnimation = undefined;
  townQueuedDirection = undefined;
  townHeldDirection = undefined;
  clearTimeout(townMoveTimer);
  state.ui.townMoving = false;
  state.ui.townBlocked = false;
  state.ui.townAction = "idle";
}

function settleTownMovement(direction) {
  state.ui.townMoving = false;
  state.ui.townBlocked = false;
  state.ui.townAction = "idle";
  state.ui.townEmotion =
    findNearbyTownTarget(state.ui.townPosition)?.kind === "npc"
      ? "alert"
      : "calm";

  if (state.ui.selectedPanel === "UI12") {
    renderApp();
  } else {
    updateTownPlayerPresentation(direction, {
      moving: false,
      blocked: false,
    });
  }
}

function showBlockedTownMovement(direction) {
  townQueuedDirection = undefined;
  townHeldDirection = undefined;
  state.ui.townMoving = false;
  state.ui.townBlocked = true;
  state.ui.townAction = "blocked";
  state.ui.townEmotion = "cautious";
  updateTownPlayerPresentation(direction, {
    moving: false,
    blocked: true,
  });

  clearTimeout(townMoveTimer);
  townMoveTimer = window.setTimeout(() => {
    state.ui.townBlocked = false;
    state.ui.townAction = "idle";
    state.ui.townEmotion =
      findNearbyTownTarget(state.ui.townPosition)?.kind === "npc"
        ? "alert"
        : "calm";
    if (state.ui.selectedPanel === "UI12") {
      renderApp();
    } else {
      updateTownPlayerPresentation(direction, {
        moving: false,
        blocked: false,
      });
    }
  }, 260);
}

function completeTownStep({ animation, direction, marker, next, sequence }) {
  if (sequence !== townMoveSequence || townMoveAnimation !== animation) {
    return;
  }

  marker.style.left = `${next.x}%`;
  marker.style.top = `${next.y}%`;
  animation.cancel();
  townMoveAnimation = undefined;
  state.ui.townMoveFrom = next;
  state.ui.townPosition = next;

  const nextDirection = townQueuedDirection ?? townHeldDirection;
  townQueuedDirection = undefined;
  if (nextDirection) {
    moveTownPlayer(nextDirection);
    return;
  }

  settleTownMovement(direction);
}

function moveTownPlayer(direction) {
  if (!direction) {
    return;
  }

  if (townMoveAnimation) {
    townQueuedDirection = direction;
    return;
  }

  const current = state.ui.townPosition ?? { x: 44, y: 56 };
  const next = moveTownPosition(current, direction);
  const moved = next.x !== current.x || next.y !== current.y;
  state.ui.townFacing = direction;

  if (!moved) {
    showBlockedTownMovement(direction);
    return;
  }

  clearTimeout(townMoveTimer);
  state.ui.townMoveFrom = current;
  state.ui.townMoving = true;
  state.ui.townBlocked = false;
  state.ui.townAction = "run";
  state.ui.townEmotion = moved
    ? findNearbyTownTarget(next)?.kind === "npc"
      ? "alert"
      : "focused"
    : "cautious";

  const marker = updateTownPlayerPresentation(direction, {
    moving: true,
    blocked: false,
  });
  if (!marker || typeof marker.animate !== "function") {
    state.ui.townPosition = next;
    settleTownMovement(direction);
    return;
  }

  const sequence = ++townMoveSequence;
  const animation = marker.animate(
    [
      { left: `${current.x}%`, top: `${current.y}%` },
      { left: `${next.x}%`, top: `${next.y}%` },
    ],
    {
      duration: TOWN_STEP_DURATION_MS,
      easing: "linear",
      fill: "forwards",
    }
  );
  townMoveAnimation = animation;
  animation.finished
    .then(() =>
      completeTownStep({ animation, direction, marker, next, sequence })
    )
    .catch(() => {});
}

function getTownTarget(targetId) {
  return (
    TOWN_INTERACTABLES.find(({ id }) => id === targetId) ??
    findNearbyTownTarget(state.ui.townPosition ?? { x: 44, y: 56 })
  );
}

function showTownMoment(action, emotion, message, tone = "good") {
  cancelTownMovement();
  state.ui.townMoving = false;
  state.ui.townBlocked = false;
  state.ui.townAction = action;
  state.ui.townEmotion = emotion;
  clearTimeout(townMoveTimer);
  renderApp();
  flash(message, tone);

  townMoveTimer = window.setTimeout(() => {
    state.ui.townAction = "idle";
    state.ui.townEmotion =
      findNearbyTownTarget(state.ui.townPosition)?.kind === "npc"
        ? "alert"
        : "calm";
    if (state.ui.selectedPanel === "UI12" && !state.ui.theftOpen) {
      renderApp();
    }
  }, 700);
}

function syncBattlePlayer() {
  state.player.health.current = state.combat.player.hp;
  state.player.essence.current = state.combat.player.essence;
}

function resolveBattleAction(action) {
  try {
    const previousResult = state.combat.result;
    state.combat = reduceBattle(state.combat, action);
    syncBattlePlayer();

    if (!previousResult && state.combat.result === "victory") {
      state.player.combatExperience = Math.min(
        100,
        state.player.combatExperience + 18
      );
      state.player.cultivation = Math.min(100, state.player.cultivation + 18);
    }

    if (action.type === "MOVE") {
      state.ui.battleMoved = true;
    } else {
      state.ui.battleMoved = false;
      state.ui.battleAction = "";
    }
    renderApp();
    return true;
  } catch (error) {
    const message = error.message.includes("range")
      ? "目标不在攻击距离内，请先移动"
      : error.message.includes("edge")
        ? "必须移动到棋盘边缘才能撤离"
        : error.message.includes("essence")
          ? "真元不足"
          : "当前行动无法执行";
    flash(message, "danger");
    return false;
  }
}

function handlePanelAction(action, target) {
  switch (action) {
    case "toggle-navigation":
      state.ui.navigationOpen = !state.ui.navigationOpen;
      renderApp();
      break;
    case "save-prototype":
      localStorage.setItem("tianwai-mvp-save", JSON.stringify(state));
      flash("游戏已保存", "good");
      break;
    case "load-prototype": {
      const saved = localStorage.getItem("tianwai-mvp-save");
      if (!saved) {
        flash("还没有可读取的存档");
        break;
      }
      state = JSON.parse(saved);
      renderApp();
      flash("存档已读取", "good");
      break;
    }
    case "toggle-fullscreen":
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen?.();
      }
      break;
    case "generator-reset":
      state.ui.generatorStage = "checking";
      rerenderAndFlash("正在重新读取人物、势力与机缘索引");
      break;
    case "generator-advance":
      if (state.ui.generatorStage === "ready") {
        state.ui.generatorStage = "entered";
        rerenderAndFlash("自由世界已载入", "good");
      } else if (state.ui.generatorStage === "checking") {
        state.ui.generatorStage = "ready";
        rerenderAndFlash("原文索引读取完成", "good");
      } else {
        navigate("UI01");
      }
      break;
    case "reroll":
      state.ui.rollIndex = (state.ui.rollIndex + 1) % ROLL_CARDS.length;
      state.player.attributes = structuredClone(
        ROLL_CARDS[state.ui.rollIndex].attributes
      );
      rerenderAndFlash(`已生成种子 ${ROLL_CARDS[state.ui.rollIndex].seed}`);
      break;
    case "lock-roll":
      state.ui.rollLocked = true;
      rerenderAndFlash("角色卡已确认", "good");
      break;
    case "cycle-player-view": {
      const views = ["overview", "combat", "injured"];
      const index = views.indexOf(state.ui.playerView ?? "overview");
      state.ui.playerView = views[(index + 1) % views.length];
      renderApp();
      break;
    }
    case "set-player-view":
      state.ui.playerView = target.dataset.viewId;
      renderApp();
      break;
    case "start-combat":
      navigate("UI13");
      break;
    case "select-gu":
      state.ui.activeGuId = target.dataset.guId;
      renderApp();
      break;
    case "feed-gu": {
      const gu = GU_WORMS.find(({ id }) => id === state.ui.activeGuId);
      flash(`${gu.name}需要食料：${gu.feed}`);
      break;
    }
    case "refine-gu": {
      const gu = GU_WORMS.find(({ id }) => id === state.ui.activeGuId);
      flash(`${gu.name}炼化已加入当前行动`);
      break;
    }
    case "filter-inventory":
      state.ui.inventoryFilter = target.dataset.filterId;
      state.ui.activeItemId = "";
      renderApp();
      break;
    case "select-item":
      state.ui.activeItemId = target.dataset.itemId;
      renderApp();
      break;
    case "travel-direction": {
      const direction = target.dataset.directionId;
      const current = WILDERNESS_NODES[state.ui.travelNodeId];
      const next = WILDERNESS_NODES[current.exits[direction]];
      const labels = {
        forward: "向前",
        back: "向后",
        left: "向左",
        right: "向右",
      };
      state.ui.travelHistory.push({
        from: current.name,
        direction: labels[direction],
        to: next.name,
      });
      state.ui.travelNodeId = next.id;
      state.ui.travelMoving = true;
      state.world.location = next.name;
      renderApp();
      clearTimeout(travelTimer);
      travelTimer = window.setTimeout(() => {
        state.ui.travelMoving = false;
        if (state.ui.selectedPanel === "UI06") {
          renderApp();
        }
      }, 650);
      break;
    }
    case "select-quest":
      state.ui.activeQuestId = target.dataset.questId;
      renderApp();
      break;
    case "track-quest":
      rerenderAndFlash("当前任务已更新", "good");
      break;
    case "set-query-horizon":
      state.ui.queryHorizon = target.dataset.horizonId;
      renderApp();
      break;
    case "set-query-type":
      state.ui.queryType = target.dataset.typeId;
      renderApp();
      break;
    case "select-opportunity":
      state.ui.activeOpportunityId = target.dataset.opportunityId;
      renderApp();
      break;
    case "convert-opportunity": {
      const opportunity = SOURCE_OPPORTUNITIES.find(
        ({ id }) => id === state.ui.activeOpportunityId
      );
      flash(`${opportunity?.title ?? "该机缘"}已标记`, "good");
      break;
    }
    case "set-relation-group":
      state.ui.relationGroup = target.dataset.groupId;
      state.ui.activeRelationId = RELATION_GROUPS[state.ui.relationGroup][0].id;
      state.ui.npcPortraitState = "normal";
      renderApp();
      break;
    case "select-relation":
      state.ui.activeRelationId = target.dataset.relationId;
      state.ui.npcPortraitState = "normal";
      renderApp();
      break;
    case "set-npc-portrait-state":
      state.ui.npcPortraitState = target.dataset.stateId;
      renderApp();
      break;
    case "start-dialogue":
      navigate("UI11");
      break;
    case "town-move":
      moveTownPlayer(target.dataset.directionId);
      break;
    case "reset-town-position":
      cancelTownMovement();
      state.ui.townPosition = { x: 44, y: 56 };
      state.ui.townMoveFrom = { x: 44, y: 56 };
      state.ui.townFacing = "up";
      state.ui.townMoving = false;
      state.ui.townBlocked = false;
      state.ui.townAction = "idle";
      state.ui.townEmotion = "alert";
      rerenderAndFlash("已回到中央街区", "good");
      break;
    case "leave-town":
      navigate("UI06");
      break;
    case "town-interact": {
      const townTarget = getTownTarget();
      if (!townTarget) {
        flash("附近没有可互动目标");
        break;
      }
      showTownMoment(
        "interact",
        townTarget.kind === "npc" ? "alert" : "focused",
        `已接近${townTarget.name}`
      );
      break;
    }
    case "town-enter": {
      const townTarget = getTownTarget(target.dataset.townTargetId);
      if (!townTarget) {
        flash("入口已不在互动范围");
        break;
      }
      if (townTarget.id === "village-gate") {
        navigate("UI06");
        break;
      }
      showTownMoment(
        "interact",
        "focused",
        `进入${townTarget.name}`
      );
      break;
    }
    case "town-examine": {
      const townTarget = getTownTarget(target.dataset.townTargetId);
      showTownMoment(
        "inspect",
        "focused",
        `调查${townTarget?.name ?? "附近物件"}`
      );
      break;
    }
    case "select-dialogue-choice": {
      const choice = DIALOGUE_CHOICES.find(
        ({ id }) => id === target.dataset.choiceId
      );
      state.ui.activeDialogueChoice = choice.id;
      state.ui.dialogueLine = choice.response;
      renderApp();
      break;
    }
    case "select-rival":
      state.ui.activeRivalId = target.dataset.rivalId;
      renderApp();
      break;
    case "open-theft": {
      const requestedId = target.dataset.theftTargetId || "fang-yuan";
      const theftTarget = resolveTheftTarget(requestedId);
      const theftItems = availableTheftItems(theftTarget);
      const attempted = state.ui.theftAttemptedTargetIds.includes(theftTarget.id);
      if (state.ui.selectedPanel === "UI12") {
        state.ui.townAction = "steal";
        state.ui.townEmotion = "focused";
      }
      state.ui.theftTargetId = theftTarget.id;
      state.ui.theftItemId = theftItems[0]?.id ?? "";
      state.ui.theftResult = attempted ? "已结算：本次进入不能再次尝试" : "";
      state.ui.theftOpen = true;
      renderApp();
      break;
    }
    case "close-theft":
      state.ui.theftOpen = false;
      if (state.ui.selectedPanel === "UI12") {
        state.ui.townAction = "idle";
      }
      renderApp();
      break;
    case "select-theft-item":
      state.ui.theftItemId = target.dataset.theftItemId;
      state.ui.theftResult = "";
      renderApp();
      break;
    case "attempt-theft": {
      const theftTarget = resolveTheftTarget(state.ui.theftTargetId);
      ensureTheftState();
      if (state.ui.theftAttemptedTargetIds.includes(theftTarget.id)) {
        flash("本次进入已经尝试过该目标");
        break;
      }
      const theftItems = availableTheftItems(theftTarget);
      const item =
        theftItems.find(({ id }) => id === state.ui.theftItemId) ??
        theftItems[0];
      if (!item) {
        flash("该目标没有剩余可偷盗物品");
        break;
      }
      const luck =
        state.player.attributes.find(({ id }) => id === "luck")?.value ?? 50;
      const chance = calculateTheftChance({
        luck,
        theftMastery: state.player.theftMastery,
        playerRankIndex: state.player.level,
        targetRankIndex: theftTarget.level,
        itemClass: item.itemClass,
      });
      const roll = getDeterministicPercent(
        state.player.theftSeed,
        state.player.theftRandomCursor
      );
      const success = roll < chance;
      state.player.theftRandomCursor += 1;
      state.ui.theftAttemptedTargetIds.push(theftTarget.id);
      if (success) {
        state.ui.stolenItemIds.push(item.id);
        state.ui.acquiredItems.push(item.name);
        state.ui.theftResult = `成功：${item.name}已放入行囊`;
        state.ui.townEmotion = "confident";
      } else {
        state.ui.theftResult = `失败：${theftTarget.name}察觉了你的动作`;
        state.ui.townEmotion = "tense";
      }
      localStorage.setItem("tianwai-mvp-save", JSON.stringify(state));
      renderApp();
      break;
    }
    case "battle-move":
      if (state.ui.battleMoved) {
        flash("本回合已经移动过，请出招或防御");
        break;
      }
      resolveBattleAction({
        type: "MOVE",
        x: Number(target.dataset.x),
        y: Number(target.dataset.y),
      });
      break;
    case "battle-select-action":
      state.ui.battleAction = target.dataset.battleActionId;
      renderApp();
      break;
    case "battle-target":
      if (!state.ui.battleAction) {
        flash("先选择一种攻击或蛊术");
        break;
      }
      resolveBattleAction({ type: state.ui.battleAction });
      break;
    case "battle-defend":
      resolveBattleAction({ type: "DEFEND" });
      break;
    case "battle-escape":
      resolveBattleAction({ type: "ESCAPE" });
      break;
    case "reset-battle":
      state.combat = createDemoBattle();
      state.ui.battleAction = "";
      state.ui.battleMoved = false;
      renderApp();
      break;
    case "select-day-end":
      state.ui.dayEndAction = target.dataset.dayActionId;
      renderApp();
      break;
    case "confirm-day-end": {
      const selected =
        DAY_END_ACTIONS.find(({ id }) => id === state.ui.dayEndAction) ??
        DAY_END_ACTIONS[0];
      if (selected.id === "rest") {
        state.player.health.current = state.player.health.max;
        state.player.essence.current = state.player.essence.max;
      }
      if (selected.id === "cultivate") {
        state.player.cultivation = Math.min(100, state.player.cultivation + 8);
      }
      state.world.day += 1;
      state.world.time = "卯正";
      state.ui.theftAttemptedTargetIds = [];
      state.ui.theftResult = "";
      rerenderAndFlash(`第 ${state.world.day} 日开始`, "good");
      break;
    }
    case "select-ending":
      state.ui.endingRoute = target.dataset.endingId;
      renderApp();
      break;
    case "confirm-ending": {
      const route =
        ENDING_ROUTES.find(({ id }) => id === state.ui.endingRoute) ??
        ENDING_ROUTES[0];
      localStorage.setItem("tianwai-mvp-save", JSON.stringify(state));
      rerenderAndFlash(`${route.title}路线已保存`, "good");
      break;
    }
    default:
      flash("该入口将在玩法实现阶段接入");
  }
}

root.addEventListener("click", (event) => {
  const panelTarget = event.target.closest("[data-panel-id]");
  if (panelTarget) {
    navigate(panelTarget.dataset.panelId);
    return;
  }

  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget || actionTarget.disabled) {
    return;
  }

  if (
    actionTarget.classList.contains("theft-modal-backdrop") &&
    event.target !== actionTarget
  ) {
    return;
  }

  handlePanelAction(actionTarget.dataset.action, actionTarget);
});

root.addEventListener("input", (event) => {
  if (event.target.matches("[data-query-input]")) {
    state.ui.queryText = event.target.value;
    refreshSourceQuery();
  }
});

root.addEventListener("change", (event) => {
  if (event.target.matches("[data-player-name]")) {
    const suffix = event.target.value.trim() || "砚";
    state.player.name = `古月${suffix}`;
    rerenderAndFlash(`世界内姓名已更新为 ${state.player.name}`);
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.ui.theftOpen) {
    state.ui.theftOpen = false;
    renderApp();
    return;
  }
  if (
    state.ui.selectedPanel === "UI12" &&
    !state.ui.theftOpen &&
    !event.target.closest?.("input, textarea, button")
  ) {
    const direction = getTownDirection(event.key);

    if (direction) {
      event.preventDefault();
      townHeldDirection = direction;
      if (!event.repeat) {
        moveTownPlayer(direction);
      }
      return;
    }

    if (event.key === "e" || event.key === "E" || event.key === " ") {
      event.preventDefault();
      const townTarget = getTownTarget();
      if (townTarget) {
        showTownMoment(
          "interact",
          townTarget.kind === "npc" ? "alert" : "focused",
          `已接近${townTarget.name}`
        );
      } else {
        flash("附近没有可互动目标");
      }
      return;
    }
  }
  if (event.key === "Escape" && state.ui.navigationOpen) {
    state.ui.navigationOpen = false;
    renderApp();
  }
});

window.addEventListener("keyup", (event) => {
  const direction = getTownDirection(event.key);
  if (!direction || townHeldDirection !== direction) {
    return;
  }

  townHeldDirection = undefined;
  if (townQueuedDirection === direction) {
    townQueuedDirection = undefined;
  }
});

renderApp();
