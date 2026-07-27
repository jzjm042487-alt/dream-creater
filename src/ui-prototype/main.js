import { createIcons, icons } from "lucide";
import { icon, iconButton, meter, scenePath, statusBadge } from "./components.js";
import {
  DEMO_STATE,
  GU_WORMS,
  INVENTORY_ITEMS,
  MAP_LOCATIONS,
  QUESTS,
  RELATIONSHIPS,
  ROLL_CARDS,
  SOURCE_OPPORTUNITIES,
  filterSourceOpportunities,
} from "./mockState.js";
import { UI_GROUPS, UI_PANELS, getPanel } from "./panelRegistry.js";
import { renderCreationPanel } from "./panels/creationPanels.js";
import { renderActionPanel } from "./panels/actionPanels.js";
import { renderEndgamePanel } from "./panels/endgamePanels.js";
import {
  renderSourceDetail,
  renderSourceResults,
  renderWorldPanel,
} from "./panels/worldPanels.js";

const root = document.querySelector("#ui-prototype");
const state = structuredClone(DEMO_STATE);
let toastTimer;

function renderPanel(panelId) {
  const panelNumber = Number(panelId.slice(2));

  if (panelNumber <= 4) {
    return renderCreationPanel(panelId, state);
  }
  if (panelNumber <= 10) {
    return renderWorldPanel(panelId, state);
  }
  if (panelNumber <= 14) {
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
                  class="nav-item ${
                    state.ui.selectedPanel === panel.id ? "is-active" : ""
                  } ${panel.featured ? "is-featured" : ""}"
                  type="button"
                  data-panel-id="${panel.id}"
                  aria-current="${
                    state.ui.selectedPanel === panel.id ? "page" : "false"
                  }"
                  title="${panel.title}"
                >
                  <span class="nav-icon">${icon(panel.icon)}</span>
                  <span class="nav-copy">
                    <small>${panel.id}</small>
                    <strong>${panel.title}</strong>
                  </span>
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
        <div>
          <strong>天外盗客</strong>
          <small>青茅山 · 全量 UI</small>
        </div>
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
        <div class="hud-resource resource-ap" title="本时段行动点">
          <span>AP</span>
          <strong>${player.ap.current}/${player.ap.max}</strong>
          <i>
            ${Array.from(
              { length: player.ap.max },
              (_, index) => `<b class="${index < player.ap.current ? "is-full" : ""}"></b>`
            ).join("")}
          </i>
        </div>
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
        ${iconButton("save", "保存原型状态", "save-prototype")}
        ${iconButton("settings", "界面设置", "show-settings")}
        ${iconButton("maximize", "切换全屏", "toggle-fullscreen")}
      </nav>
      <div class="current-panel-mobile">
        <span>${panel.id}</span>
        <strong>${panel.title}</strong>
      </div>
    </header>
  `;
}

function renderContextRail(panel) {
  const activeQuest =
    QUESTS.find(({ id }) => id === state.ui.activeQuestId) ?? QUESTS[0];
  const sourceDelta = 100 - state.generator.sourceSync;

  return `
    <aside class="context-rail" aria-label="当前情境">
      <section class="context-scene">
        <img src="${scenePath(panel.scene)}" alt="" />
        <div></div>
        <span>${state.world.weather}</span>
        <strong>${state.world.location}</strong>
        <small>第 ${state.world.day} 日 · ${state.world.time}</small>
      </section>

      <section class="context-objective">
        <header>
          <span>${icon("crosshair")} 当前机缘</span>
          ${statusBadge(activeQuest.statusLabel, "special")}
        </header>
        <small>${activeQuest.id} · ${activeQuest.kind}</small>
        <strong>${activeQuest.title}</strong>
        <p>${activeQuest.next}</p>
        ${meter({
          label: "推进",
          value: activeQuest.progress,
          tone: "cinnabar",
          display: `${activeQuest.progress}%`,
          compact: true,
        })}
      </section>

      <section class="context-presence">
        <header>
          <span>${icon("users-round")} 现场人物</span>
          <small>2</small>
        </header>
        <div class="presence-stage">
          <div>
            <img src="${state.player.portrait}" alt="${state.player.name}" />
            <span>${state.player.name}</span>
          </div>
          <i>${icon("move-horizontal")}</i>
          <div>
            <img
              src="/assets/game/characters/chibi/chibi_fang_yuan.png"
              alt="古月方源"
            />
            <span>古月方源</span>
          </div>
        </div>
      </section>

      <section class="context-risks">
        <header><span>${icon("activity")} 世界压力</span></header>
        ${meter({
          label: "方源警觉",
          value: state.fangYuan.alert,
          tone: "cinnabar",
          display: `${state.fangYuan.alert}`,
          compact: true,
        })}
        ${meter({
          label: "身份暴露",
          value: state.player.exposure,
          tone: "brass",
          display: `${state.player.exposure}%`,
          compact: true,
        })}
        ${meter({
          label: "原文偏移",
          value: sourceDelta,
          tone: "violet",
          display: `${sourceDelta}%`,
          compact: true,
        })}
      </section>

      <footer class="context-footer">
        <span>${icon("radio")} 原文同步</span>
        <strong>${state.generator.sourceSync}%</strong>
        <button type="button" data-panel-id="UI08" title="打开原文查询">
          ${icon("book-open-text")}
        </button>
      </footer>
    </aside>
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
            <button
              type="button"
              data-panel-id="${item.id}"
              class="${panel.id === item.id ? "is-active" : ""}"
            >
              ${icon(item.icon)}
              <span>${item.shortTitle}</span>
            </button>
          `;
        })
        .join("")}
    </nav>
  `;
}

function renderApp() {
  const panel = getPanel(state.ui.selectedPanel);

  root.innerHTML = `
    <div
      class="ui-shell panel-${panel.id.toLowerCase()} ${
        state.ui.navigationOpen ? "navigation-open" : ""
      }"
      data-active-panel="${panel.id}"
    >
      <img class="shell-backdrop" src="${scenePath(panel.scene)}" alt="" />
      <div class="shell-backdrop-shade" aria-hidden="true"></div>
      ${renderTopBar(panel)}
      <div class="prototype-workspace">
        <aside class="panel-navigation" aria-label="全部游戏界面">
          <header class="nav-header">
            <span>界面总览</span>
            <strong>18</strong>
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
        <main class="panel-workspace" id="panel-workspace" tabindex="-1">
          ${renderPanel(panel.id)}
        </main>
        ${renderContextRail(panel)}
      </div>
      ${renderMobileDock()}
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
    tone === "danger"
      ? "triangle-alert"
      : tone === "good"
        ? "circle-check"
        : "info"
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

function handlePanelAction(action, target) {
  switch (action) {
    case "toggle-navigation":
      state.ui.navigationOpen = !state.ui.navigationOpen;
      renderApp();
      break;
    case "save-prototype":
      flash("原型状态已暂存到当前会话", "good");
      break;
    case "show-settings":
      flash("界面缩放 100% · 动效标准 · 信息密度高");
      break;
    case "toggle-fullscreen":
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen?.();
      }
      break;
    case "generator-reset":
      state.ui.generatorStage = "checking";
      rerenderAndFlash("开始重新校验世界规则与可变归属");
      break;
    case "generator-advance":
      if (state.ui.generatorStage === "ready") {
        state.ui.generatorStage = "entered";
        rerenderAndFlash("世界载入完成 · 当前同步率 92%", "good");
      } else if (state.ui.generatorStage === "checking") {
        state.ui.generatorStage = "ready";
        rerenderAndFlash("原文校验完成", "good");
      } else {
        navigate("UI01");
      }
      break;
    case "reroll": {
      state.ui.rollIndex = (state.ui.rollIndex + 1) % ROLL_CARDS.length;
      state.player.attributes = ROLL_CARDS[state.ui.rollIndex].attributes;
      rerenderAndFlash(`已生成种子 ${ROLL_CARDS[state.ui.rollIndex].seed}`);
      break;
    }
    case "lock-roll":
      state.ui.rollLocked = true;
      rerenderAndFlash("角色卡已锁定，族谱与旧屋记录已生成", "good");
      break;
    case "cycle-portrait": {
      const states = ["normal", "alert", "injured", "critical"];
      const currentIndex = states.indexOf(state.ui.portraitState ?? "normal");
      state.ui.portraitState = states[(currentIndex + 1) % states.length];
      renderApp();
      break;
    }
    case "set-portrait-state":
      state.ui.portraitState = target.dataset.stateId;
      renderApp();
      break;
    case "set-cultivation-method":
      state.ui.cultivationMethod = target.dataset.methodId;
      renderApp();
      break;
    case "preview-cultivation":
      state.ui.dayEndAction = "cultivate";
      navigate("UI15");
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
      flash(`${gu.name}炼化条件已加入行动预览`);
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
    case "select-location":
      state.ui.activeLocationId = target.dataset.locationId;
      state.ui.mapRunning = false;
      renderApp();
      break;
    case "locate-player":
      state.ui.activeLocationId = "flower-wine-cave";
      state.ui.mapRunning = false;
      renderApp();
      break;
    case "simulate-travel":
      state.ui.mapRunning = !state.ui.mapRunning;
      rerenderAndFlash(
        state.ui.mapRunning
          ? "主角切换 run_side，路径插值开始"
          : "移动演示已停止"
      );
      break;
    case "select-quest":
      state.ui.activeQuestId = target.dataset.questId;
      renderApp();
      break;
    case "track-quest":
      rerenderAndFlash("已更新常驻追踪目标", "good");
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
      flash(`${opportunity?.title ?? "该机缘"}已转化为追踪任务`, "good");
      break;
    }
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
    case "select-dialogue-choice":
      state.ui.activeDialogueChoice = target.dataset.choiceId;
      renderApp();
      break;
    case "confirm-dialogue-choice":
      state.ui.checkOutcome = "success";
      navigate("UI12");
      break;
    case "set-check-outcome":
      state.ui.checkOutcome = target.dataset.outcomeId;
      renderApp();
      break;
    case "reroll-check": {
      const outcomes = ["failure", "partial", "success", "perfect"];
      const index = outcomes.indexOf(state.ui.checkOutcome);
      state.ui.checkOutcome = outcomes[(index + 1) % outcomes.length];
      renderApp();
      break;
    }
    case "accept-check":
      rerenderAndFlash("判定结果已写入 Q01 与方源观察卡", "good");
      break;
    case "select-combat-action":
      state.ui.combatAction = target.dataset.combatActionId;
      renderApp();
      break;
    case "resolve-combat-action":
      state.ui.combatRound = Math.min(3, (state.ui.combatRound ?? 1) + 1);
      state.ui.combatAction = "";
      rerenderAndFlash("回合结算完成，距离与资源已更新", "good");
      break;
    case "select-evidence":
      state.ui.activeEvidenceId = target.dataset.evidenceId;
      renderApp();
      break;
    case "select-day-end":
      state.ui.dayEndAction = target.dataset.dayActionId;
      renderApp();
      break;
    case "confirm-day-end":
      rerenderAndFlash("第 8 日结算预览已锁定", "good");
      break;
    case "select-rollback":
      state.ui.rollbackChoice = target.dataset.rollbackId;
      renderApp();
      break;
    case "confirm-rollback":
      rerenderAndFlash("修正将替换唯一世界记录，请在剧情节点最终确认", "danger");
      break;
    case "select-ending":
      state.ui.endingRoute = target.dataset.endingId;
      renderApp();
      break;
    case "confirm-ending":
      rerenderAndFlash("永久存档预览已生成，青茅山尚未关闭", "good");
      break;
    default:
      flash("该入口已纳入原型交互，下一阶段接入正式规则");
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
  if (event.key === "Escape" && state.ui.navigationOpen) {
    state.ui.navigationOpen = false;
    renderApp();
  }
});

renderApp();
