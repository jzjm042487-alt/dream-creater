import {
  DAY_END_ACTIONS,
  ENDING_ROUTES,
  PORTRAIT_BASE,
  QUESTS,
} from "../mockState.js";
import {
  dataRow,
  icon,
  iconButton,
  meter,
  panelHeader,
  statusBadge,
} from "../components.js";

function renderDayEnd(state) {
  const activeAction =
    DAY_END_ACTIONS.find(({ id }) => id === state.ui.dayEndAction) ??
    DAY_END_ACTIONS[0];

  return `
    <article class="panel-page day-end-page" data-testid="panel-UI15">
      ${panelHeader({
        id: "UI15",
        eyebrow: "幕间安排 / 自动结算",
        title: "第 8 日 · 日终",
        summary: "夜间只能安排一个主要行动；确认前预览修炼、喂养、到期任务和 NPC 行动，确认后写入不可撤回的世界状态。",
        tools: iconButton("history", "查看前夜结算", "show-day-history"),
      })}
      <div class="day-end-layout panel-scroll">
        <section class="night-actions section-block">
          <div class="section-title">
            <span>${icon("moon-star")} 选择今夜安排</span>
            <small>1 个主要行动</small>
          </div>
          <div class="night-action-list">
            ${DAY_END_ACTIONS.map(
              (action) => `
                <button
                  class="night-action ${
                    activeAction.id === action.id ? "is-selected" : ""
                  }"
                  type="button"
                  data-action="select-day-end"
                  data-day-action-id="${action.id}"
                >
                  <span>${icon(action.icon)}</span>
                  <span>
                    <strong>${action.title}</strong>
                    <small>${action.gain}</small>
                  </span>
                  ${icon("chevron-right")}
                </button>
              `
            ).join("")}
          </div>
        </section>

        <section class="settlement-preview section-block">
          <div class="section-title">
            <span>${icon("scan-line")} 结算预览</span>
            ${statusBadge("未确认", "warning")}
          </div>
          <div class="active-night-action">
            <span>${icon(activeAction.icon)}</span>
            <div>
              <small>主要行动</small>
              <strong>${activeAction.title}</strong>
              <p>${activeAction.gain}</p>
            </div>
          </div>
          <div class="settlement-ledger">
            ${dataRow("消耗", activeAction.cost)}
            ${dataRow("风险", activeAction.risk)}
            ${dataRow("次日行动点", "3 / 3")}
            ${dataRow("预计醒来", "第 9 日 · 卯正")}
          </div>
          <div class="projected-bars">
            ${meter({
              label: "修炼进度",
              value:
                activeAction.id === "cultivate"
                  ? state.player.cultivation + 12
                  : state.player.cultivation,
              tone: "jade",
              display: `${
                activeAction.id === "cultivate"
                  ? state.player.cultivation + 12
                  : state.player.cultivation
              }%`,
            })}
            ${meter({
              label: "疲惫",
              value:
                activeAction.id === "earn"
                  ? state.player.fatigue + 8
                  : Math.max(0, state.player.fatigue - 12),
              tone: "brass",
              display: `${
                activeAction.id === "earn"
                  ? state.player.fatigue + 8
                  : Math.max(0, state.player.fatigue - 12)
              }%`,
            })}
          </div>
          <button class="primary-command full-command" type="button" data-action="confirm-day-end">
            ${icon("moon")} 确认并结束第 8 日
          </button>
          <p class="irreversible-note">${icon("lock-keyhole")} 确认后只能通过第 29 日的剧情回溯修正关键目标，不能普通读档撤销。</p>
        </section>

        <section class="automatic-settlement section-block">
          <div class="section-title">
            <span>${icon("workflow")} 自动结算队列</span>
            <small>4 项</small>
          </div>
          <div class="settlement-queue">
            <div class="queue-row is-urgent">
              <span>${icon("bug")}</span>
              <span><strong>匿息蛊缺食</strong><small>效果将降至 50%</small></span>
              ${statusBadge("今夜", "danger")}
            </div>
            <div class="queue-row">
              <span>${icon("scroll-text")}</span>
              <span><strong>Q01 酒虫归属</strong><small>根据当前归属切换四分支</small></span>
              ${statusBadge("强制", "warning")}
            </div>
            <div class="queue-row">
              <span>${icon("eye")}</span>
              <span><strong>方源重新规划</strong><small>读取警觉 38 与酒虫归属</small></span>
              ${statusBadge("隐藏", "special")}
            </div>
            <div class="queue-row">
              <span>${icon("file-warning")}</span>
              <span><strong>旁支债据</strong><small>第 9 日旧账上门</small></span>
              ${statusBadge("明日", "neutral")}
            </div>
          </div>
        </section>
      </div>
    </article>
  `;
}

const ROLLBACK_CHOICES = [
  {
    id: "save-qing-shu",
    title: "替换青书的狼潮站位",
    category: "人物命运",
    effect: "古月青书存活；木魅反噬转移为长期伤势。",
    cost: "放弃修改酒虫归属与商队证据。",
    icon: "shield-plus",
  },
  {
    id: "hide-source",
    title: "抹去一次先知暴露",
    category: "身份风险",
    effect: "方源删除一条已验证事实；警觉 -8。",
    cost: "Q04 青书生路恢复原记录。",
    icon: "eye-off",
  },
  {
    id: "move-ledger",
    title: "提前转移商队私账",
    category: "证据归属",
    effect: "铁家证据链更早建立；贾富关系 +10。",
    cost: "玩家成为私账最后可追溯持有者。",
    icon: "file-key",
  },
];

function renderRollback(state) {
  const activeChoice =
    ROLLBACK_CHOICES.find(({ id }) => id === state.ui.rollbackChoice) ??
    ROLLBACK_CHOICES[0];

  return `
    <article class="panel-page rollback-page" data-testid="panel-UI16">
      ${panelHeader({
        id: "UI16",
        eyebrow: "第 29 日 / 唯一剧情修正",
        title: "回溯：替换一条世界记录",
        summary: "回溯不恢复整个存档，只把第一次灾变、第 26 日快照和玩家外部记忆并排比较，然后允许替换一个关键目标。",
        tools: iconButton("scan-search", "检查记录差异", "scan-rollback"),
      })}
      <div class="rollback-layout panel-scroll">
        <section class="record-comparison section-block">
          <div class="section-title">
            <span>${icon("git-compare-arrows")} 三重记录</span>
            ${statusBadge("差异 7", "warning")}
          </div>
          <div class="record-columns">
            <article>
              <span>第一次记录</span>
              <strong>青茅山灾变</strong>
              <small>不可修改的原始锚点</small>
              <ul>
                <li>青书：战死</li>
                <li>酒虫：方源持有</li>
                <li>商队账册：遗失</li>
              </ul>
            </article>
            <article>
              <span>第 26 日快照</span>
              <strong>当前世界线</strong>
              <small>回溯的恢复基线</small>
              <ul>
                <li>青书：重伤预警</li>
                <li>酒虫：玩家持有</li>
                <li>商队账册：已隐藏</li>
              </ul>
            </article>
            <article class="external-memory">
              <span>外部记忆</span>
              <strong>玩家保留</strong>
              <small>不属于蛊界的记录</small>
              <ul>
                <li>知道青书死亡位置</li>
                <li>知道狼潮替代路径</li>
                <li>知道方源备用计划</li>
              </ul>
            </article>
          </div>
          <div class="rollback-timeline">
            <span class="record-a"><b>01</b>原始灾变</span>
            <i></i>
            <span class="record-b"><b>26</b>世界快照</span>
            <i></i>
            <span class="record-c"><b>29</b>回溯修正</span>
          </div>
        </section>

        <section class="correction-actions section-block">
          <div class="section-title">
            <span>${icon("history")} 选择唯一修正</span>
            <small>1 / 1</small>
          </div>
          <div class="correction-list">
            ${ROLLBACK_CHOICES.map(
              (choice) => `
                <button
                  class="correction-row ${
                    activeChoice.id === choice.id ? "is-selected" : ""
                  }"
                  type="button"
                  data-action="select-rollback"
                  data-rollback-id="${choice.id}"
                >
                  <span>${icon(choice.icon)}</span>
                  <span>
                    <small>${choice.category}</small>
                    <strong>${choice.title}</strong>
                    <p>${choice.effect}</p>
                  </span>
                  ${icon("chevron-right")}
                </button>
              `
            ).join("")}
          </div>
        </section>

        <section class="correction-preview section-block">
          <div class="section-title">
            <span>${icon("scan-line")} 修正后预览</span>
            ${statusBadge("永久替换", "danger")}
          </div>
          <div class="correction-seal">${icon(activeChoice.icon)}</div>
          <small>${activeChoice.category}</small>
          <h2>${activeChoice.title}</h2>
          <div class="correction-effect">
            <span>${icon("circle-check")} 新记录</span>
            <p>${activeChoice.effect}</p>
          </div>
          <div class="correction-cost">
            <span>${icon("triangle-alert")} 无法同时保留</span>
            <p>${activeChoice.cost}</p>
          </div>
          <button class="primary-command full-command danger-command" type="button" data-action="confirm-rollback">
            ${icon("replace")} 替换世界记录
          </button>
        </section>
      </div>
    </article>
  `;
}

function endingTone(status) {
  return {
    available: "good",
    danger: "warning",
    locked: "neutral",
    fallback: "danger",
  }[status];
}

function endingLabel(status) {
  return {
    available: "可用",
    danger: "高风险",
    locked: "未满足",
    fallback: "兜底",
  }[status];
}

function renderEndings(state) {
  const activeRoute =
    ENDING_ROUTES.find(({ id }) => id === state.ui.endingRoute) ??
    ENDING_ROUTES[0];

  return `
    <article class="panel-page endings-page" data-testid="panel-UI17">
      ${panelHeader({
        id: "UI17",
        eyebrow: "离山路线 / 永久存档",
        title: "青茅山篇终局",
        summary: "六条路线决定离山身份、同行人物、可带走资源与后续索引；失败路线可以回选，最终确认会永久关闭青茅山。",
        tools: iconButton("download", "导出永久人物卡", "export-save"),
      })}
      <div class="endings-layout panel-scroll">
        <section class="route-list-section section-block">
          <div class="section-title">
            <span>${icon("signpost-big")} 六条离山路线</span>
            <small>3 可用 · 1 高风险 · 1 锁定 · 1 兜底</small>
          </div>
          <div class="ending-route-list">
            ${ENDING_ROUTES.map(
              (route) => `
                <button
                  class="ending-route ${
                    activeRoute.id === route.id ? "is-selected" : ""
                  } state-${route.status}"
                  type="button"
                  data-action="select-ending"
                  data-ending-id="${route.id}"
                >
                  <span class="ending-code">${route.code}</span>
                  <span>
                    <strong>${route.title}</strong>
                    <small>${route.requirement}</small>
                  </span>
                  ${statusBadge(endingLabel(route.status), endingTone(route.status))}
                </button>
              `
            ).join("")}
          </div>
        </section>

        <section class="ending-hero section-block state-${activeRoute.status}">
          <img
            src="/assets/game/environments/world-map.png"
            alt="青茅山离山路线"
          />
          <div class="ending-hero-shade"></div>
          <div class="ending-route-copy">
            <span>${activeRoute.code} · ${endingLabel(activeRoute.status)}</span>
            <h2>${activeRoute.title}</h2>
            <p>${activeRoute.requirement}</p>
          </div>
          <div class="ending-party">
            <img src="${state.player.portrait}" alt="${state.player.name}" />
            ${
              activeRoute.id === "merchant"
                ? `<img src="${PORTRAIT_BASE}/portrait_npc_caravan_manager_normal.png" alt="禾娘" />`
                : ""
            }
          </div>
          <div class="route-ledger">
            ${dataRow("路线代价", activeRoute.cost)}
            ${dataRow("带入后续", activeRoute.carry)}
            ${dataRow(
              "失败处理",
              activeRoute.status === "locked" ? "返回路线选择" : "允许重新选择未锁路线"
            )}
          </div>
        </section>

        <section class="permanent-save section-block">
          <div class="section-title">
            <span>${icon("archive")} 永久存档预览</span>
            ${statusBadge("尚未写入", "warning")}
          </div>
          <div class="save-summary">
            <div>
              <span>角色</span>
              <strong>${state.player.name}</strong>
              <small>${state.player.rank} · ${state.player.theftRank}</small>
            </div>
            <div>
              <span>核心蛊</span>
              <strong>月光蛊 · 酒虫</strong>
              <small>喂养状态随存档保留</small>
            </div>
            <div>
              <span>支线</span>
              <strong>3 延续 · 1 改写 · 1 关闭</strong>
              <small>Q01-Q05 永久结果</small>
            </div>
          </div>
          <div class="closed-content">
            <span>${icon("lock-keyhole")} 确认后永久关闭</span>
            <ul>
              <li>青茅山地点与本地商店</li>
              <li>未取得的新手村限定蛊</li>
              <li>未完成的第 1-30 日补救窗口</li>
            </ul>
          </div>
          <button
            class="primary-command full-command"
            type="button"
            data-action="confirm-ending"
            ${activeRoute.status === "locked" ? "disabled" : ""}
          >
            ${icon("archive-restore")} 确认路线并建立永久存档
          </button>
        </section>
      </div>
    </article>
  `;
}

export function renderEndgamePanel(panelId, state) {
  switch (panelId) {
    case "UI15":
      return renderDayEnd(state);
    case "UI16":
      return renderRollback(state);
    case "UI17":
      return renderEndings(state);
    default:
      return "";
  }
}
