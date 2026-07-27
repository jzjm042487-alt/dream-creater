import {
  CHIBI_BASE,
  DIALOGUE_CHOICES,
  EVIDENCE,
  PORTRAIT_BASE,
} from "../mockState.js";
import {
  dataRow,
  icon,
  iconButton,
  meter,
  panelHeader,
  statusBadge,
} from "../components.js";

function renderDialogue(state) {
  const selectedChoice = DIALOGUE_CHOICES.find(
    ({ id }) => id === state.ui.activeDialogueChoice
  );

  return `
    <article class="panel-page dialogue-page" data-testid="panel-UI11">
      ${panelHeader({
        id: "UI11",
        eyebrow: "世界内行动 / 条件 / 风险",
        title: "花酒行者洞口 · 同时看见",
        summary: "选项先描述角色在世界中的行动，再明确行动点、前置条件、判定构成和可能留下的长期后果。",
        tools: `
          ${iconButton("history", "查看对话记录", "show-dialogue-history")}
          ${iconButton("volume-2", "切换语音", "toggle-voice")}
        `,
      })}
      <div class="dialogue-layout panel-scroll">
        <section class="dialogue-scene section-block">
          <img
            class="dialogue-background"
            src="/assets/game/environments/forest-battle.png"
            alt=""
          />
          <div class="dialogue-scene-shade"></div>
          <img
            class="dialogue-speaker"
            src="${CHIBI_BASE}/chibi_fang_yuan.png"
            alt="古月方源"
          />
          <div class="speaker-plate">
            <span>古月旁支</span>
            <strong>古月方源</strong>
            <small>${statusBadge("警觉 38", "warning")}</small>
          </div>
          <div class="dialogue-line">
            <span class="quote-mark">“</span>
            <p>酒香不是从洞里出来的。是有人想让它进去。</p>
            <span class="dialogue-beat">他的目光从酒坛移到你的袖口，没有停留太久。</span>
          </div>
        </section>

        <section class="choice-sheet section-block">
          <div class="section-title">
            <span>${icon("messages-square")} 你的行动</span>
            <small>剩余 ${state.player.ap.current} AP</small>
          </div>
          <div class="dialogue-choice-list">
            ${DIALOGUE_CHOICES.map(
              (choice, index) => `
                <button
                  class="dialogue-choice ${
                    selectedChoice?.id === choice.id ? "is-selected" : ""
                  }"
                  type="button"
                  data-action="select-dialogue-choice"
                  data-choice-id="${choice.id}"
                  ${choice.available ? "" : "disabled"}
                >
                  <span class="choice-index">${index + 1}</span>
                  <span class="choice-body">
                    <span>
                      <strong>${choice.label}</strong>
                      ${statusBadge(
                        `${choice.ap} AP`,
                        choice.ap > state.player.ap.current
                          ? "danger"
                          : "neutral"
                      )}
                      ${statusBadge(
                        `风险 ${choice.risk}`,
                        choice.risk === "中"
                          ? "warning"
                          : choice.risk === "永久" || choice.risk === "极高"
                            ? "danger"
                            : "neutral"
                      )}
                    </span>
                    <p>${choice.detail}</p>
                    <small>${icon("scale")} ${choice.check}</small>
                  </span>
                  ${icon(choice.available ? "chevron-right" : "lock-keyhole")}
                </button>
              `
            ).join("")}
          </div>
          <footer class="choice-confirmation">
            <div>
              ${
                selectedChoice
                  ? `
                    <span>已选择</span>
                    <strong>${selectedChoice.label}</strong>
                    <small>${selectedChoice.check}</small>
                  `
                  : `
                    <span>等待选择</span>
                    <strong>世界会在确认后继续行动</strong>
                    <small>互斥选项将永久关闭</small>
                  `
              }
            </div>
            <button
              class="primary-command"
              type="button"
              data-action="confirm-dialogue-choice"
              ${selectedChoice ? "" : "disabled"}
            >
              确认行动 ${icon("arrow-right")}
            </button>
          </footer>
        </section>
      </div>
    </article>
  `;
}

const CHECK_OUTCOMES = {
  perfect: {
    label: "大成功",
    roll: 19,
    total: 22,
    tone: "special",
    summary: "你不仅换走了酒坛，还在方源袖口留下了错误气味。",
    gains: ["截胡进度 +20", "额外：方源误判 -5", "暴露值不增加"],
  },
  success: {
    label: "成功",
    roll: 12,
    total: 15,
    tone: "good",
    summary: "酒坛完成偷换，方源暂时没有确认你的动作。",
    gains: ["截胡进度 +12", "取得第一接触权", "方源警觉 +3"],
  },
  partial: {
    label: "部分成功",
    roll: 7,
    total: 10,
    tone: "warning",
    summary: "酒坛到手，但袖口沾上了无法立刻清理的酒香。",
    gains: ["截胡进度 +8", "获得：酒虫线索", "新增：气味残留"],
  },
  failure: {
    label: "失败",
    roll: 2,
    total: 5,
    tone: "danger",
    summary: "方源按住了酒坛，你的手停在最不该出现的位置。",
    gains: ["行动点 -2", "方源警觉 +10", "触发：洞口对质"],
  },
};

function renderCheckResult(state) {
  const outcome = CHECK_OUTCOMES[state.ui.checkOutcome] ?? CHECK_OUTCOMES.success;
  const modifiers = [
    { label: "主属性 · 身法", value: 7, tone: "good" },
    { label: "技能 · 梁上手", value: 4, tone: "good" },
    { label: "蛊虫 · 匿息", value: 3, tone: "good" },
    { label: "情报 · 酒香", value: 4, tone: "good" },
    { label: "准备 · 双酒坛", value: 5, tone: "good" },
    { label: "目标防备", value: -8, tone: "danger" },
    { label: "窄洞环境", value: -12, tone: "danger" },
  ];
  const modifierTotal = modifiers.reduce((sum, item) => sum + item.value, 0);

  return `
    <article class="panel-page check-page" data-testid="panel-UI12">
      ${panelHeader({
        id: "UI12",
        eyebrow: "公开构成 / 四档结果",
        title: "盗道判定 · 偷换酒坛",
        summary: "所有加减项在掷骰前可见；结果不是只有成功和失败，部分成功会保留收益并生成新的局面。",
        tools: iconButton("rotate-ccw", "重新演示判定", "reroll-check"),
      })}
      <div class="check-layout panel-scroll">
        <section class="check-formula section-block">
          <div class="section-title">
            <span>${icon("sigma")} 判定构成</span>
            <small>固定修正 ${modifierTotal >= 0 ? "+" : ""}${modifierTotal}</small>
          </div>
          <div class="modifier-list">
            ${modifiers
              .map(
                ({ label, value, tone }) => `
                  <div class="modifier-row tone-${tone}">
                    <span>${label}</span>
                    <strong>${value >= 0 ? "+" : ""}${value}</strong>
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="formula-total">
            <span>固定修正</span>
            <strong>${modifierTotal >= 0 ? "+" : ""}${modifierTotal}</strong>
            ${icon("plus")}
            <span>1d20</span>
          </div>
        </section>

        <section class="dice-result section-block tone-${outcome.tone}">
          <div class="result-seal">
            <span>1d20</span>
            <strong>${outcome.roll}</strong>
            <small>总值 ${outcome.total}</small>
          </div>
          <div class="result-copy">
            ${statusBadge(outcome.label, outcome.tone)}
            <h2>${outcome.summary}</h2>
            <ul>
              ${outcome.gains
                .map(
                  (gain) => `
                    <li>${icon(
                      gain.includes("新增") || gain.includes("警觉")
                        ? "triangle-alert"
                        : "check"
                    )}<span>${gain}</span></li>
                  `
                )
                .join("")}
            </ul>
          </div>
          <button class="primary-command" type="button" data-action="accept-check">
            写入世界状态 ${icon("arrow-right")}
          </button>
        </section>

        <section class="threshold-sheet section-block">
          <div class="section-title">
            <span>${icon("chart-no-axes-column-increasing")} 结果阈值</span>
            <small>当前总值 ${outcome.total}</small>
          </div>
          <div class="threshold-scale">
            <button
              type="button"
              data-action="set-check-outcome"
              data-outcome-id="failure"
              class="${state.ui.checkOutcome === "failure" ? "is-active" : ""}"
            >
              <strong>0-7</strong><span>失败</span><small>未达成 + 后果</small>
            </button>
            <button
              type="button"
              data-action="set-check-outcome"
              data-outcome-id="partial"
              class="${state.ui.checkOutcome === "partial" ? "is-active" : ""}"
            >
              <strong>8-11</strong><span>部分成功</span><small>达成 + 后患</small>
            </button>
            <button
              type="button"
              data-action="set-check-outcome"
              data-outcome-id="success"
              class="${state.ui.checkOutcome === "success" ? "is-active" : ""}"
            >
              <strong>12-17</strong><span>成功</span><small>达成目标</small>
            </button>
            <button
              type="button"
              data-action="set-check-outcome"
              data-outcome-id="perfect"
              class="${state.ui.checkOutcome === "perfect" ? "is-active" : ""}"
            >
              <strong>18+</strong><span>大成功</span><small>额外收益</small>
            </button>
          </div>
          <div class="fairness-note">
            ${icon("eye")} <span>目标防备与环境难度均来自当前世界状态，可在行动前通过侦查降低。</span>
          </div>
        </section>
      </div>
    </article>
  `;
}

const COMBAT_ACTIONS = [
  {
    id: "moonblade",
    name: "月刃",
    icon: "moon",
    cost: "5 真元",
    target: "方源",
    preview: "中距攻击 · 预计 12-18 伤害",
  },
  {
    id: "close",
    name: "贴身抢位",
    icon: "move-right",
    cost: "0 真元",
    target: "距离",
    preview: "距离 中 → 近 · 下一击先手 +4",
  },
  {
    id: "steal",
    name: "妙手",
    icon: "hand",
    cost: "3 真元",
    target: "元石",
    preview: "盗取 1 元石 · 暴露概率 32%",
  },
  {
    id: "guard",
    name: "守势",
    icon: "shield",
    cost: "0 真元",
    target: "自身",
    preview: "本回合受伤 -40% · 观察 +1",
  },
  {
    id: "retreat",
    name: "撤退",
    icon: "log-out",
    cost: "放弃目标",
    target: "出口",
    preview: "身法检定 · 保留已取得情报",
  },
];

function renderCombat(state) {
  const selectedAction = COMBAT_ACTIONS.find(
    ({ id }) => id === state.ui.combatAction
  );
  const round = state.ui.combatRound ?? 1;

  return `
    <article class="panel-page combat-page" data-testid="panel-UI13">
      ${panelHeader({
        id: "UI13",
        eyebrow: "三回合目标 / 场景战术",
        title: "教学战 · 一块元石",
        summary: "战斗围绕短目标与资源交换展开；每回合只能确认一个主行动，距离和场景目标会改变可用招式。",
        tools: `
          ${iconButton("pause", "暂停战斗", "pause-combat")}
          ${iconButton("scroll-text", "查看战斗记录", "show-combat-log")}
        `,
      })}
      <div class="combat-layout panel-scroll">
        <section class="battle-stage section-block">
          <img
            class="battle-background"
            src="/assets/game/environments/forest-battle.png"
            alt=""
          />
          <div class="battle-stage-shade"></div>
          <div class="fighter fighter-player">
            <div class="fighter-bar">
              <span>${state.player.name}</span>
              <i><b style="width: 84%"></b></i>
            </div>
            <img src="${CHIBI_BASE}/chibi_player.png" alt="${state.player.name}" />
          </div>
          <div class="fighter fighter-enemy">
            <div class="fighter-bar">
              <span>古月方源</span>
              <i><b style="width: 72%"></b></i>
            </div>
            <img src="${CHIBI_BASE}/chibi_fang_yuan.png" alt="古月方源" />
          </div>
          <div class="distance-line">
            <span>近</span><i></i><b>中距 · 6 步</b><i></i><span>远</span>
          </div>
          <button class="scene-object" type="button" data-action="target-scene-object">
            ${icon("package")} 石袋
            <small>场景目标</small>
          </button>
          <div class="round-strip">
            ${[1, 2, 3]
              .map(
                (value) => `
                  <span class="${
                    value < round
                      ? "is-done"
                      : value === round
                        ? "is-current"
                        : ""
                  }">
                    <b>${value}</b>
                    <small>${value === 1 ? "抢位" : value === 2 ? "夺石" : "脱离"}</small>
                  </span>
                `
              )
              .join("")}
          </div>
        </section>

        <section class="combat-command-sheet section-block">
          <div class="section-title">
            <span>${icon("swords")} 回合 ${round} · 选择主行动</span>
            <small>18 秒</small>
          </div>
          <div class="combat-resources">
            ${meter({
              label: "生命",
              value: state.player.health.current,
              max: state.player.health.max,
              tone: "cinnabar",
              compact: true,
            })}
            ${meter({
              label: "青铜真元",
              value: state.player.essence.current,
              max: state.player.essence.max,
              tone: "jade",
              compact: true,
            })}
          </div>
          <div class="combat-actions">
            ${COMBAT_ACTIONS.map(
              (action) => `
                <button
                  type="button"
                  data-action="select-combat-action"
                  data-combat-action-id="${action.id}"
                  class="${selectedAction?.id === action.id ? "is-selected" : ""}"
                >
                  <span>${icon(action.icon)}</span>
                  <strong>${action.name}</strong>
                  <small>${action.cost}</small>
                </button>
              `
            ).join("")}
          </div>
          <div class="combat-preview">
            ${
              selectedAction
                ? `
                  <div>
                    <span>目标 · ${selectedAction.target}</span>
                    <strong>${selectedAction.preview}</strong>
                  </div>
                  <button class="primary-command" type="button" data-action="resolve-combat-action">
                    确认行动 ${icon("arrow-right")}
                  </button>
                `
                : `
                  <div>
                    <span>等待指令</span>
                    <strong>选择招式以预览真元、距离与风险变化</strong>
                  </div>
                  <button class="primary-command" type="button" disabled>
                    确认行动 ${icon("arrow-right")}
                  </button>
                `
            }
          </div>
        </section>

        <aside class="battle-objective section-block">
          <div class="section-title">
            <span>${icon("crosshair")} 战斗目标</span>
            ${statusBadge("3 回合", "warning")}
          </div>
          <strong>在不重伤同窗的前提下夺得石袋</strong>
          <ul>
            <li>${icon("check")} 撑过第一轮月刃</li>
            <li>${icon("circle-dashed")} 接触石袋</li>
            <li>${icon("circle-dashed")} 带着元石离开圈线</li>
          </ul>
          <div class="retreat-rule">
            ${icon("door-open")}
            <span><strong>撤退始终可用</strong>失败会失去一块元石，但不会中断主线。</span>
          </div>
        </aside>
      </div>
    </article>
  `;
}

function evidenceStatusTone(status) {
  return {
    confirmed: "good",
    suspicious: "warning",
    forged: "danger",
    hidden: "special",
    locked: "neutral",
  }[status];
}

function evidenceStatusLabel(status) {
  return {
    confirmed: "已证实",
    suspicious: "可疑",
    forged: "伪造",
    hidden: "已隐藏",
    locked: "未建立",
  }[status];
}

function renderEvidenceBoard(state) {
  const activeEvidence =
    EVIDENCE.find(({ id }) => id === state.ui.activeEvidenceId) ?? EVIDENCE[0];

  return `
    <article class="panel-page evidence-page" data-testid="panel-UI14">
      ${panelHeader({
        id: "UI14",
        eyebrow: "来源 / 时间线 / 矛盾",
        title: "Q03 · 贾金生案证据板",
        summary: "每条证据保留来源与可信度；伪证和隐藏证据不会消失，而会改变铁家最终能建立的闭环。",
        tools: `
          ${iconButton("zoom-in", "放大证据板", "zoom-evidence")}
          ${iconButton("download", "导出案卷", "export-evidence")}
        `,
      })}
      <div class="evidence-layout panel-scroll">
        <section class="evidence-board section-block">
          <div class="board-grid" aria-hidden="true"></div>
          <svg class="evidence-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <line x1="16" y1="24" x2="46" y2="14"></line>
            <line x1="46" y1="14" x2="73" y2="28"></line>
            <line x1="16" y1="24" x2="30" y2="60"></line>
            <line x1="30" y1="60" x2="61" y2="64" class="link-suspicious"></line>
            <line x1="61" y1="64" x2="83" y2="76" class="link-forged"></line>
            <line x1="73" y1="28" x2="83" y2="76"></line>
          </svg>
          ${EVIDENCE.map(
            (evidence) => `
              <button
                class="evidence-node state-${evidence.status} ${
                  activeEvidence.id === evidence.id ? "is-selected" : ""
                }"
                style="left: ${evidence.x}%; top: ${evidence.y}%"
                type="button"
                data-action="select-evidence"
                data-evidence-id="${evidence.id}"
              >
                <span>${icon(
                  evidence.status === "confirmed"
                    ? "badge-check"
                    : evidence.status === "forged"
                      ? "file-warning"
                      : evidence.status === "hidden"
                        ? "eye-off"
                        : evidence.status === "locked"
                          ? "lock-keyhole"
                          : "circle-help"
                )}</span>
                <small>${evidence.category}</small>
                <strong>${evidence.title}</strong>
              </button>
            `
          ).join("")}
          <div class="evidence-board-legend">
            <span><i class="confirmed"></i>已证实</span>
            <span><i class="suspicious"></i>可疑</span>
            <span><i class="forged"></i>伪造</span>
            <span><i class="hidden"></i>隐藏</span>
          </div>
        </section>

        <section class="evidence-detail section-block">
          <div class="section-title">
            <span>${icon("file-search")} 证据详情</span>
            ${statusBadge(
              evidenceStatusLabel(activeEvidence.status),
              evidenceStatusTone(activeEvidence.status)
            )}
          </div>
          <div class="evidence-title">
            <small>${activeEvidence.category}</small>
            <strong>${activeEvidence.title}</strong>
            <span>来源：${activeEvidence.source}</span>
          </div>
          <div class="evidence-facts">
            ${dataRow("取得时间", "第 22 日 · 戌正")}
            ${dataRow("保管者", "古月砚")}
            ${dataRow(
              "可信度",
              activeEvidence.status === "confirmed"
                ? "高"
                : activeEvidence.status === "forged"
                  ? "已发现矛盾"
                  : "待交叉验证"
            )}
            ${dataRow("铁家可见", activeEvidence.status === "hidden" ? "否" : "是")}
          </div>
          <div class="contradiction-block">
            <span>${icon("split")} 关联矛盾</span>
            <p>
              ${
                activeEvidence.status === "forged"
                  ? "脚印方向与后窗泥水流向相反，可能是案发后补造。"
                  : "需要与酉时空档和酒肆目击进行交叉验证。"
              }
            </p>
          </div>
          <div class="evidence-actions">
            <button class="secondary-command" type="button" data-action="hide-evidence">
              ${icon("eye-off")} 隐藏
            </button>
            <button class="primary-command" type="button" data-action="link-evidence">
              ${icon("link")} 建立关联
            </button>
          </div>
        </section>
      </div>
    </article>
  `;
}

export function renderActionPanel(panelId, state) {
  switch (panelId) {
    case "UI11":
      return renderDialogue(state);
    case "UI12":
      return renderCheckResult(state);
    case "UI13":
      return renderCombat(state);
    case "UI14":
      return renderEvidenceBoard(state);
    default:
      return "";
  }
}
