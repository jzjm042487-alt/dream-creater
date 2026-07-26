import { actions, locations } from "./content.js";
import { createInitialState, resolveAction } from "./gameState.js";

let state = createInitialState();

const app = document.querySelector("#app");

function render() {
  app.innerHTML = `
    <section class="topbar">
      <div>
        <p class="eyebrow">青茅山篇文字原型</p>
        <h1>蛊真人：天外盗剧本</h1>
      </div>
      <button class="reset-button" data-reset>重开</button>
    </section>

    <section class="layout">
      <aside class="panel stats-panel">
        ${renderPlayer()}
        ${renderFangYuan()}
        ${renderQuest()}
      </aside>

      <section class="main-panel">
        <article class="memory">
          <p class="eyebrow">原著记忆</p>
          <p>${state.memoryHint}</p>
        </article>
        <figure class="map-panel">
          <img src="./assets/qingmao-map.svg" alt="青茅山势力节点地图" />
        </figure>
        ${renderLocations()}
      </section>

      <aside class="panel log-panel">
        <p class="eyebrow">事件记录</p>
        <div class="log-list">
          ${state.log
            .slice()
            .reverse()
            .map((entry) => `<p>${entry}</p>`)
            .join("")}
        </div>
      </aside>
    </section>
  `;

  app.querySelector("[data-reset]").addEventListener("click", () => {
    state = createInitialState();
    render();
  });

  app.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      state = resolveAction(state, button.dataset.action);
      render();
    });
  });
}

function renderPlayer() {
  const { player } = state;
  return `
    <article class="card">
      <p class="eyebrow">玩家</p>
      <div class="portrait">盗</div>
      <h2>${player.name}</h2>
      <dl>
        <div><dt>日期</dt><dd>第 ${state.day} 日</dd></div>
        <div><dt>行动点</dt><dd>${state.actionPoints}/3</dd></div>
        <div><dt>境界</dt><dd>${player.realm}</dd></div>
        <div><dt>修炼</dt><dd>${player.cultivation}/100</dd></div>
        <div><dt>盗道</dt><dd>梁上手</dd></div>
      </dl>
    </article>
  `;
}

function renderFangYuan() {
  const alertLevel = Math.min(100, state.fangYuan.alert);
  return `
    <article class="card danger">
      <p class="eyebrow">竞争者</p>
      <div class="portrait fang">源</div>
      <h2>方源</h2>
      <dl>
        <div><dt>警觉</dt><dd>${alertLevel}/100</dd></div>
        <div><dt>态度</dt><dd>${state.fangYuan.stance}</dd></div>
        <div><dt>计划进度</dt><dd>${state.fangYuan.progress}/100</dd></div>
      </dl>
      <div class="meter"><span style="width: ${alertLevel}%"></span></div>
    </article>
  `;
}

function renderQuest() {
  const labels = {
    unknown: "未发现",
    "lead-found": "已发现线索",
    "window-open": "截胡窗口已打开",
    contested: "被方源察觉",
    completed: "酒虫已入手",
  };
  const inventory = state.inventory.length
    ? state.inventory.map((item) => (item === "wine-worm" ? "酒虫" : item)).join("、")
    : "无";

  return `
    <article class="card quest-card" data-quest-status="${state.quest.wineWorm}" data-wine-owner="${state.flags.wineWormOwner || "none"}">
      <p class="eyebrow">当前机缘</p>
      <h2>酒虫</h2>
      <dl>
        <div><dt>进度</dt><dd>${labels[state.quest.wineWorm]}</dd></div>
        <div><dt>归属</dt><dd>${state.flags.wineWormOwner === "player" ? "玩家" : "未定"}</dd></div>
        <div><dt>战利品</dt><dd>${inventory}</dd></div>
      </dl>
    </article>
  `;
}

function renderLocations() {
  return `
    <div class="locations">
      ${locations
        .map(
          (location) => `
            <article class="location">
              <div>
                <p class="eyebrow">${location.name}</p>
                <p>${location.description}</p>
              </div>
              <div class="actions">
                ${location.actions.map(renderActionButton).join("")}
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderActionButton(actionId) {
  const action = actions[actionId];
  const locked = getActionLockedReason(action, actionId);
  const disabled = Boolean(locked);
  return `
    <button data-action="${actionId}" ${disabled ? "disabled" : ""}>
      <span>${action.label}</span>
      <small>${locked || action.description}</small>
    </button>
  `;
}

function getActionLockedReason(action, actionId) {
  if (actionId === "steal-wine-worm" && state.flags.wineWormOwner === "player") {
    return "酒虫已入手，接下来该考虑藏匿和炼化。";
  }
  if (action.type !== "rest" && state.actionPoints < action.cost) {
    return "行动点不足。";
  }
  if (action.requires && !state.flags[action.requires]) {
    if (action.requires === "hasWineLead") {
      return "需要先调查酒肆异香。";
    }
    if (action.requires === "hasMerchantWindow") {
      return "需要先盯梢卖酒商贩。";
    }
    return "条件不足。";
  }
  return "";
}

render();
