import { DAY_END_ACTIONS, ENDING_ROUTES, PORTRAIT_BASE } from "../mockState.js";
import {
  dataRow,
  icon,
  iconButton,
  meter,
  panelHeader,
  scenePath,
  statusBadge,
} from "../components.js";

function renderDayEnd(state) {
  const activeAction =
    DAY_END_ACTIONS.find(({ id }) => id === state.ui.dayEndAction) ??
    DAY_END_ACTIONS[0];

  return `
    <article class="panel-page simple-rest-page" data-testid="panel-UI15">
      ${panelHeader({
        id: "UI15",
        eyebrow: "休息 / 可选夜间行动 / 普通存档",
        title: `第 ${state.world.day} 日 · 入夜`,
        summary: "晚上可以休息、修炼、喂蛊或炼器；随时使用普通存档，不承担额外剧情规则。",
        tools: `
          ${iconButton("save", "保存游戏", "save-prototype")}
          ${iconButton("folder-open", "读取存档", "load-prototype")}
        `,
      })}
      <div class="simple-rest-layout panel-scroll">
        <section class="night-action-sheet section-block">
          <div class="section-title">
            <span>${icon("moon-star")} 今夜安排</span>
            <small>选择一项</small>
          </div>
          <div class="simple-night-actions">
            ${DAY_END_ACTIONS.map(
              (action) => `
                <button
                  class="${activeAction.id === action.id ? "is-selected" : ""}"
                  type="button"
                  data-action="select-day-end"
                  data-day-action-id="${action.id}"
                >
                  <span>${icon(action.icon)}</span>
                  <span><strong>${action.title}</strong><small>${action.gain}</small></span>
                  ${icon("chevron-right")}
                </button>
              `
            ).join("")}
          </div>
        </section>

        <section class="night-preview section-block">
          <img src="${scenePath("dorm")}" alt="" />
          <div class="night-preview-shade"></div>
          <div class="night-preview-copy">
            <span>${icon(activeAction.icon)} 已选择</span>
            <h2>${activeAction.title}</h2>
            <p>${activeAction.detail}</p>
          </div>
          <div class="night-resource-preview">
            ${meter({
              label: "生命",
              value: activeAction.id === "rest" ? state.player.health.max : state.player.health.current,
              max: state.player.health.max,
              tone: "cinnabar",
            })}
            ${meter({
              label: "真元",
              value: activeAction.id === "rest" ? state.player.essence.max : state.player.essence.current,
              max: state.player.essence.max,
              tone: "jade",
            })}
            ${meter({
              label: "成长进度",
              value:
                activeAction.id === "cultivate"
                  ? Math.min(100, state.player.cultivation + 8)
                  : state.player.cultivation,
              tone: "violet",
              display: `${
                activeAction.id === "cultivate"
                  ? Math.min(100, state.player.cultivation + 8)
                  : state.player.cultivation
              }%`,
            })}
          </div>
          <button class="primary-command full-command" type="button" data-action="confirm-day-end">
            ${icon("sunrise")} 结束今天
          </button>
        </section>

        <aside class="save-slots section-block">
          <div class="section-title">
            <span>${icon("archive")} 存档</span>
            ${statusBadge("自动存档开启", "good")}
          </div>
          <button type="button" data-action="save-prototype">
            ${icon("save")}
            <span><strong>当前存档</strong><small>第 ${state.world.day} 日 · ${state.world.location}</small></span>
            <b>刚刚</b>
          </button>
          <button type="button" data-action="load-prototype">
            ${icon("folder-open")}
            <span><strong>自动存档</strong><small>第 7 日 · 山寨边门</small></span>
            <b>昨日</b>
          </button>
          <p>${icon("info")} 存档只是保存和读取当前世界，不附带替换剧情的能力。</p>
        </aside>
      </div>
    </article>
  `;
}

function renderEndings(state) {
  const activeRoute =
    ENDING_ROUTES.find(({ id }) => id === state.ui.endingRoute) ??
    ENDING_ROUTES[0];

  return `
    <article class="panel-page free-endings-page" data-testid="panel-UI17">
      ${panelHeader({
        id: "UI17",
        eyebrow: "自由选择 / 离山存档",
        title: "青茅山篇终局",
        summary: "走到章节终点后直接选择下一条路线。",
        tools: iconButton("download", "导出人物存档", "export-save"),
      })}
      <div class="free-endings-layout panel-scroll">
        <section class="free-route-list section-block">
          <div class="section-title">
            <span>${icon("signpost-big")} 离山路线</span>
            <small>${ENDING_ROUTES.length} 条均可选择</small>
          </div>
          <div class="ending-route-list">
            ${ENDING_ROUTES.map(
              (route) => `
                <button
                  class="ending-route ${activeRoute.id === route.id ? "is-selected" : ""}"
                  type="button"
                  data-action="select-ending"
                  data-ending-id="${route.id}"
                >
                  <span class="ending-code">${route.code}</span>
                  <span><strong>${route.title}</strong><small>${route.description}</small></span>
                  ${icon("chevron-right")}
                </button>
              `
            ).join("")}
          </div>
        </section>

        <section class="free-route-hero section-block">
          <img src="${scenePath(activeRoute.scene)}" alt="${activeRoute.title}" />
          <div class="free-route-shade"></div>
          <div class="free-route-copy">
            <span>${activeRoute.code} · 当前选择</span>
            <h2>${activeRoute.title}</h2>
            <p>${activeRoute.description}</p>
          </div>
          <div class="ending-party">
            <img src="${state.player.portrait}" alt="${state.player.name}" />
            ${
              activeRoute.id === "merchant"
                ? `<img src="${PORTRAIT_BASE}/portrait_npc_caravan_manager_normal.png" alt="禾娘" />`
                : ""
            }
          </div>
          <div class="simple-route-ledger">
            ${dataRow("带入后续", activeRoute.carry)}
            ${dataRow("开始位置", activeRoute.title.replace("随", "").replace("前往", ""))}
          </div>
        </section>

        <aside class="route-save-sheet section-block">
          <div class="section-title">
            <span>${icon("archive")} 离山存档</span>
            ${statusBadge("尚未建立", "warning")}
          </div>
          <div class="save-summary">
            <div><span>角色</span><strong>${state.player.name}</strong><small>${state.player.rank}</small></div>
            <div><span>核心蛊</span><strong>月光蛊 · 酒虫</strong><small>保留当前喂养状态</small></div>
            <div><span>路线</span><strong>${activeRoute.title}</strong><small>可在确认前自由更换</small></div>
          </div>
          <p class="route-choice-note">
            ${icon("compass")} 路线决定下一章的起点与同行者，不检查额外数值。
          </p>
          <button class="primary-command full-command" type="button" data-action="confirm-ending">
            ${icon("archive-restore")} 确认路线并保存
          </button>
        </aside>
      </div>
    </article>
  `;
}

export function renderEndgamePanel(panelId, state) {
  switch (panelId) {
    case "UI15":
      return renderDayEnd(state);
    case "UI17":
      return renderEndings(state);
    default:
      return "";
  }
}
