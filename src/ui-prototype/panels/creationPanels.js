import {
  GU_WORMS,
  ROLL_CARDS,
} from "../mockState.js";
import {
  choiceButton,
  dataRow,
  escapeHtml,
  icon,
  iconButton,
  meter,
  panelHeader,
  statusBadge,
} from "../components.js";

function renderGenerator(state) {
  const { generator } = state;
  const stageCopy = {
    ready: {
      label: "世界已就绪",
      action: "进入第 8 日演示",
      icon: "door-open",
    },
    checking: {
      label: "正在重新校验",
      action: "完成校验",
      icon: "loader-circle",
    },
    entered: {
      label: "世界运行中",
      action: "查看角色底盘",
      icon: "circle-check-big",
    },
  }[state.ui.generatorStage];

  return `
    <article class="panel-page generator-page" data-testid="panel-UI00">
      ${panelHeader({
        id: "UI00",
        eyebrow: "生成器 / 世界边界",
        title: "生成《蛊真人》世界",
        summary: "载入原文，校验人物与不可逆事件，然后生成一个会因玩家介入而继续演化的完整世界。",
        tools: iconButton("rotate-ccw", "重新校验原文", "generator-reset"),
      })}
      <div class="generator-grid panel-scroll">
        <section class="source-terminal section-block">
          <div class="section-title">
            <span>${icon("file-text")} 原文源</span>
            ${statusBadge("已识别", "good")}
          </div>
          <div class="source-file">
            <span class="file-seal">蛊</span>
            <div>
              <strong>${escapeHtml(generator.sourceFile)}</strong>
              <span>文本源 · 本地只读索引</span>
            </div>
            ${icon("shield-check")}
          </div>
          <div class="terminal-log" aria-label="生成器日志">
            <p><b>01</b><span>识别世界规则</span><strong>完成</strong></p>
            <p><b>02</b><span>识别人物关系</span><strong>完成</strong></p>
            <p><b>03</b><span>标记不可逆事件</span><strong>完成</strong></p>
            <p><b>04</b><span>计算可变资源归属</span><strong>完成</strong></p>
            <p class="terminal-current"><b>05</b><span>建立未来三年索引</span><strong>在线</strong></p>
          </div>
        </section>

        <section class="generation-readout section-block">
          <div class="section-title">
            <span>${icon("binary")} 世界层校验</span>
            <small>同步率 ${generator.sourceSync}%</small>
          </div>
          <div class="generation-meters">
            ${meter({ label: "世界规则", value: generator.rules, tone: "jade" })}
            ${meter({ label: "人物关系", value: generator.relationships, tone: "jade" })}
            ${meter({
              label: "不可逆事件",
              value: generator.irreversibleEvents,
              tone: "brass",
            })}
            ${meter({
              label: "可变资源归属",
              value: generator.mutableOwnership,
              tone: "cinnabar",
            })}
          </div>
          <div class="generation-spec">
            ${dataRow("生成模式", generator.mode)}
            ${dataRow("玩家模式", generator.identity)}
            ${dataRow("查询深度", generator.queryDepth)}
            ${dataRow("章节边界", "青茅山覆灭后永久离开")}
          </div>
        </section>

        <section class="world-contract section-block">
          <div class="section-title">
            <span>${icon("triangle-alert")} 世界契约</span>
            ${statusBadge("不可撤回", "danger")}
          </div>
          <ol class="contract-list">
            ${generator.warnings
              .map(
                (warning, index) => `
                  <li>
                    <span>${String(index + 1).padStart(2, "0")}</span>
                    <p>${escapeHtml(warning)}</p>
                  </li>
                `
              )
              .join("")}
          </ol>
          <div class="boundary-grid">
            <div><span>主线</span><strong>1</strong></div>
            <div><span>支线</span><strong>5</strong></div>
            <div><span>关键日</span><strong>30</strong></div>
            <div><span>离山路线</span><strong>6</strong></div>
          </div>
        </section>

        <footer class="generator-footer">
          <div>
            ${icon(stageCopy.icon)}
            <span>
              <small>当前状态</small>
              <strong>${stageCopy.label}</strong>
            </span>
          </div>
          <button class="primary-command" type="button" data-action="generator-advance">
            ${stageCopy.action}
            ${icon("arrow-right")}
          </button>
        </footer>
      </div>
    </article>
  `;
}

function renderRoll(state) {
  const card = ROLL_CARDS[state.ui.rollIndex % ROLL_CARDS.length];
  const locked = state.ui.rollLocked;

  return `
    <article class="panel-page roll-page" data-testid="panel-UI01">
      ${panelHeader({
        id: "UI01",
        eyebrow: "整卡生成 / 不可锁单项",
        title: "古月旁支角色卡",
        summary: "外观与世界内身份固定；资质、九属性、命格、两项天赋和一项缺陷随整卡 Roll 一起变化。",
        tools: `
          <span class="seed-readout">${icon("hash")} ${card.seed}</span>
          ${iconButton("history", "查看 Roll 记录", "show-roll-history")}
        `,
      })}
      <div class="roll-layout panel-scroll">
        <section class="fixed-avatar section-block">
          <div class="section-title">
            <span>${icon("fingerprint")} 固定身份</span>
            ${statusBadge(locked ? "已锁定" : "待确认", locked ? "good" : "warning")}
          </div>
          <div class="avatar-stage">
            <div class="avatar-halo" aria-hidden="true">古月</div>
            <img src="${state.player.portrait}" alt="古月砚 Q 版角色" />
            <div class="avatar-shadow"></div>
          </div>
          <label class="field-label" for="player-name">世界内姓名</label>
          <div class="name-field">
            <span>古月</span>
            <input
              id="player-name"
              type="text"
              maxlength="4"
              value="${escapeHtml(state.player.name.replace(/^古月/, ""))}"
              data-player-name
              ${locked ? "disabled" : ""}
            />
          </div>
          <div class="identity-lines">
            ${dataRow("性别", "男")}
            ${dataRow("年龄", "与方源、方正同届")}
            ${dataRow("背景", card.background)}
            ${dataRow("外观", "固定模板")}
          </div>
        </section>

        <section class="attribute-sheet section-block">
          <div class="section-title">
            <span>${icon("chart-no-axes-column")} 九项底盘</span>
            <small>0-100</small>
          </div>
          <div class="attribute-grid">
            ${card.attributes
              .map(
                ({ id, label, value, tone }) => `
                  <div class="attribute-cell tone-${tone}" data-attribute="${id}">
                    <span>${escapeHtml(label)}</span>
                    <strong>${value}</strong>
                    <div class="attribute-track"><i style="width: ${value}%"></i></div>
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="roll-risk-note">
            ${icon("scale")}
            <p>
              <strong>强项附带代价</strong>
              原著记忆越高，天意关注越强；盗道天赋越高，正道身份越难维持。
            </p>
          </div>
        </section>

        <section class="fate-sheet section-block">
          <div class="section-title">
            <span>${icon("sparkles")} 命格组合</span>
            <small>${card.aptitude} · ${card.aperture}</small>
          </div>
          <div class="aptitude-display">
            <span>空窍资质</span>
            <strong>${card.aptitude}</strong>
            <small>真元海 ${card.aperture}</small>
          </div>
          <div class="trait-stack">
            <div class="trait-row trait-fate">
              <span>命格</span>
              <strong>${card.fate}</strong>
              <small>原著记忆 +20 · 天意关注 +10</small>
            </div>
            ${card.talents
              .map(
                (talent) => `
                  <div class="trait-row trait-talent">
                    <span>天赋</span>
                    <strong>${talent}</strong>
                    <small>${talent === "酒虫亲和" ? "酒虫线提前 · 炼化难度下降" : "开启专属任务解法"}</small>
                  </div>
                `
              )
              .join("")}
            <div class="trait-row trait-flaw">
              <span>缺陷</span>
              <strong>${card.flaw}</strong>
              <small>关键失败会生成长期后果</small>
            </div>
          </div>
          <div class="roll-actions">
            <button
              class="secondary-command"
              type="button"
              data-action="reroll"
              ${locked ? "disabled" : ""}
            >
              ${icon("dices")} 整卡重 Roll
            </button>
            <button
              class="primary-command"
              type="button"
              data-action="lock-roll"
              ${locked ? "disabled" : ""}
            >
              ${icon(locked ? "lock-keyhole" : "badge-check")}
              ${locked ? "角色卡已锁定" : "确认并建立族谱"}
            </button>
          </div>
        </section>
      </div>
    </article>
  `;
}

function renderPlayerState(state) {
  const { player } = state;
  const portraitState = state.ui.portraitState ?? "normal";
  const portraitLabels = {
    normal: "常态",
    alert: "警觉",
    injured: "轻伤",
    critical: "重伤",
  };

  return `
    <article class="panel-page player-page" data-testid="panel-UI02">
      ${panelHeader({
        id: "UI02",
        eyebrow: "角色 / 风险 / 长期后果",
        title: `${player.name} · ${player.rank}`,
        summary: "把即时战斗状态、长期伤势、剧情标记、世界压力和不可移除命格分层展示。",
        tools: iconButton("scan-face", "切换立绘状态", "cycle-portrait"),
      })}
      <div class="player-layout panel-scroll">
        <section class="player-portrait section-block">
          <div class="portrait-state-tabs segmented-control">
            ${Object.entries(portraitLabels)
              .map(
                ([id, label]) => `
                  <button
                    type="button"
                    data-action="set-portrait-state"
                    data-state-id="${id}"
                    class="${portraitState === id ? "is-active" : ""}"
                  >${label}</button>
                `
              )
              .join("")}
          </div>
          <div class="player-state-stage state-${portraitState}">
            <span class="state-signal">${portraitLabels[portraitState]}</span>
            <img src="${player.portrait}" alt="${escapeHtml(player.name)} Q 版角色" />
            <div class="injury-overlay" aria-hidden="true"></div>
          </div>
          <div class="player-nameplate">
            <div>
              <strong>${escapeHtml(player.name)}</strong>
              <span>${escapeHtml(player.title)}</span>
            </div>
            ${statusBadge(player.theftRank, "special")}
          </div>
        </section>

        <section class="vitals-sheet section-block">
          <div class="section-title">
            <span>${icon("activity")} 生存与资源</span>
            <small>第 ${state.world.day} 日 · ${state.world.time}</small>
          </div>
          <div class="vital-grid">
            ${meter({
              label: "生命",
              value: player.health.current,
              max: player.health.max,
              tone: "cinnabar",
            })}
            ${meter({
              label: "青铜真元",
              value: player.essence.current,
              max: player.essence.max,
              tone: "jade",
            })}
            ${meter({
              label: "疲惫",
              value: player.fatigue,
              tone: "brass",
              display: `${player.fatigue}%`,
            })}
            ${meter({
              label: "身份暴露",
              value: player.exposure,
              tone: "cinnabar",
              display: `${player.exposure}%`,
            })}
          </div>
          <div class="ledger-strip">
            <div><span>元石</span><strong>${player.stones}</strong></div>
            <div><span>功绩</span><strong>${player.merit}</strong></div>
            <div><span>旧债</span><strong>${player.debt}</strong></div>
            <div><span>血污</span><strong>${player.bloodPollution}</strong></div>
          </div>
          <div class="mastery-block">
            ${meter({
              label: `盗道 · ${player.theftRank}`,
              value: player.theftMastery,
              tone: "violet",
              display: `${player.theftMastery}/100`,
            })}
            <p>突破条件：偷取低级令牌，并完成一次追查清理。</p>
          </div>
        </section>

        <section class="status-ledger section-block">
          <div class="section-title">
            <span>${icon("layers-3")} 状态分层</span>
            <small>${player.buffs.length} 项生效</small>
          </div>
          <div class="status-list">
            ${player.buffs
              .map(
                ({ name, layer, effect, tone }) => `
                  <button class="status-row tone-${tone}" type="button" data-action="inspect-status">
                    <span class="status-icon">${icon(
                      tone === "danger"
                        ? "eye"
                        : tone === "warning"
                          ? "triangle-alert"
                          : tone === "special"
                            ? "orbit"
                            : "sparkles"
                    )}</span>
                    <span>
                      <small>${escapeHtml(layer)}</small>
                      <strong>${escapeHtml(name)}</strong>
                      <em>${escapeHtml(effect)}</em>
                    </span>
                    ${icon("chevron-right")}
                  </button>
                `
              )
              .join("")}
          </div>
        </section>
      </div>
    </article>
  `;
}

function renderCultivation(state) {
  const { player } = state;
  const method = state.ui.cultivationMethod ?? "steady";
  const methods = {
    steady: {
      label: "稳炼",
      multiplier: "×1.0",
      gain: "+12",
      risk: "无额外风险",
    },
    force: {
      label: "强冲",
      multiplier: "×1.35",
      gain: "+17",
      risk: "反噬 18%",
    },
    wine: {
      label: "酒虫精炼",
      multiplier: "×1.3",
      gain: "+16",
      risk: "需先炼化酒虫",
    },
  };
  const active = methods[method];

  return `
    <article class="panel-page cultivation-page" data-testid="panel-UI03">
      ${panelHeader({
        id: "UI03",
        eyebrow: "空窍 / 真元 / 突破",
        title: "一转初阶 · 青铜真元",
        summary: "资质决定海面上限与恢复速度；修炼方式改变当夜收益、资源消耗与反噬窗口。",
        tools: iconButton("book-marked", "查看修炼记录", "show-cultivation-log"),
      })}
      <div class="cultivation-layout panel-scroll">
        <section class="aperture-stage section-block">
          <div class="aperture-visual" aria-label="空窍真元海">
            <div class="aperture-ring ring-outer"></div>
            <div class="aperture-ring ring-inner"></div>
            <div class="aperture-core">
              <span>青铜海</span>
              <strong>${player.essence.current}</strong>
              <small>/ ${player.essence.max}</small>
            </div>
            <i class="aperture-level" style="height: ${Math.round(
              (player.essence.current / player.essence.max) * 100
            )}%"></i>
          </div>
          <div class="aperture-caption">
            <span>${statusBadge(player.aperture, "warning")}</span>
            <strong>真元恢复 ×1.0</strong>
            <small>空窍稳定 · 无暗伤</small>
          </div>
        </section>

        <section class="cultivation-progress section-block">
          <div class="section-title">
            <span>${icon("gauge")} 小境界进度</span>
            <small>预计 5 次稳炼</small>
          </div>
          <div class="large-progress">
            <div>
              <strong>${player.cultivation}%</strong>
              <span>距一转中阶</span>
            </div>
            <div class="large-progress-track">
              <i style="width: ${player.cultivation}%"></i>
              <b style="left: 70%">资源校验</b>
            </div>
          </div>
          <div class="method-tabs segmented-control">
            ${Object.entries(methods)
              .map(
                ([id, item]) => `
                  <button
                    type="button"
                    data-action="set-cultivation-method"
                    data-method-id="${id}"
                    class="${method === id ? "is-active" : ""}"
                  >
                    <strong>${item.label}</strong>
                    <small>${item.multiplier}</small>
                  </button>
                `
              )
              .join("")}
          </div>
          <div class="method-preview">
            <div>
              <span>预计进度</span>
              <strong>${active.gain}</strong>
            </div>
            <div>
              <span>修炼倍率</span>
              <strong>${active.multiplier}</strong>
            </div>
            <div>
              <span>代价</span>
              <strong>${active.risk}</strong>
            </div>
          </div>
          <button class="primary-command full-command" type="button" data-action="preview-cultivation">
            ${icon("moon-star")} 加入今夜幕间计划
          </button>
        </section>

        <section class="breakthrough-sheet section-block">
          <div class="section-title">
            <span>${icon("mountain")} 突破条件</span>
            ${statusBadge("尚未满足", "warning")}
          </div>
          <div class="requirement-list">
            <div class="is-done">${icon("circle-check")}<span>开窍完成</span><strong>满足</strong></div>
            <div>${icon("circle-dashed")}<span>修炼进度达到 100</span><strong>43 / 100</strong></div>
            <div class="is-done">${icon("circle-check")}<span>安全环境</span><strong>旧屋可用</strong></div>
            <div>${icon("circle-dashed")}<span>元石储备</span><strong>18 / 24</strong></div>
          </div>
          <div class="failure-note">
            ${icon("triangle-alert")}
            <p><strong>突破失败</strong>会损失真元、降低进度，并生成“虚弱”状态与方源行动窗口。</p>
          </div>
        </section>
      </div>
    </article>
  `;
}

function guStateTone(state) {
  return {
    active: "good",
    wild: "special",
    hungry: "warning",
    dormant: "neutral",
  }[state];
}

function renderGu(state) {
  const activeGu =
    GU_WORMS.find(({ id }) => id === state.ui.activeGuId) ?? GU_WORMS[0];

  return `
    <article class="panel-page gu-page" data-testid="panel-UI04">
      ${panelHeader({
        id: "UI04",
        eyebrow: "炼化 / 催动 / 喂养",
        title: "蛊虫与空窍席位",
        summary: "每只蛊拥有唯一所有者、炼化状态、真元消耗和独立食料周期；缺食不会静默失效。",
        tools: `
          ${iconButton("list-filter", "筛选蛊虫", "filter-gu")}
          ${iconButton("flask-conical", "打开合炼配方", "show-recipes")}
        `,
      })}
      <div class="gu-layout panel-scroll">
        <section class="gu-collection section-block">
          <div class="section-title">
            <span>${icon("bug")} 蛊册</span>
            <small>${GU_WORMS.length} / 8 席</small>
          </div>
          <div class="gu-list">
            ${GU_WORMS.map(
              (gu) => `
                <button
                  class="gu-list-item ${gu.id === activeGu.id ? "is-selected" : ""}"
                  type="button"
                  data-action="select-gu"
                  data-gu-id="${gu.id}"
                >
                  <span class="gu-mark state-${gu.state}">${gu.mark}</span>
                  <span>
                    <strong>${gu.name}</strong>
                    <small>${gu.rank} · ${gu.path}</small>
                  </span>
                  ${statusBadge(gu.stateLabel, guStateTone(gu.state))}
                </button>
              `
            ).join("")}
          </div>
        </section>

        <section class="gu-detail section-block">
          <div class="gu-card-visual state-${activeGu.state}">
            <span class="gu-rank">${activeGu.rank}</span>
            <div class="gu-emblem">${activeGu.mark}</div>
            <span class="gu-path">${activeGu.path}</span>
          </div>
          <div class="gu-detail-copy">
            <div class="section-title">
              <span>
                <strong>${activeGu.name}</strong>
                <small>${activeGu.rank} · ${activeGu.path}</small>
              </span>
              ${statusBadge(
                activeGu.stateLabel,
                guStateTone(activeGu.state)
              )}
            </div>
            <p class="gu-effect">${activeGu.effect}</p>
            <div class="gu-facts">
              ${dataRow("唯一所有者", activeGu.owner)}
              ${dataRow(
                "催动消耗",
                activeGu.essence ? `${activeGu.essence} 点青铜真元` : "无需真元"
              )}
              ${dataRow("食料", activeGu.feed)}
              ${dataRow("下次喂养", activeGu.nextFeed)}
            </div>
            ${meter({
              label: "饱食度",
              value: activeGu.feeding,
              tone: activeGu.feeding < 25 ? "cinnabar" : "brass",
              display: `${activeGu.feeding}%`,
            })}
            <div class="gu-actions">
              <button
                class="secondary-command"
                type="button"
                data-action="feed-gu"
                ${activeGu.state === "dormant" ? "disabled" : ""}
              >${icon("wheat")} 投喂</button>
              <button
                class="primary-command"
                type="button"
                data-action="refine-gu"
                ${activeGu.state === "active" ? "disabled" : ""}
              >${icon("flame")} ${activeGu.state === "wild" ? "开始炼化" : "查看炼化条件"}</button>
            </div>
          </div>
        </section>

        <section class="refining-route section-block">
          <div class="section-title">
            <span>${icon("git-merge")} 合炼路线</span>
            <small>已发现 2 条</small>
          </div>
          <div class="recipe-flow">
            <div><span class="gu-mark">月</span><strong>月光蛊</strong></div>
            ${icon("plus")}
            <div><span class="item-mark">光</span><strong>小光蛊</strong></div>
            ${icon("arrow-right")}
            <div class="recipe-result"><span class="gu-mark">辉</span><strong>月辉蛊</strong></div>
          </div>
          <div class="recipe-status">
            <span>炼道理解 31</span>
            <span>成功率 46%</span>
            <span class="is-missing">缺少：小光蛊</span>
          </div>
          <button class="text-command" type="button" data-action="show-recipes">
            查看全部配方 ${icon("chevron-right")}
          </button>
        </section>
      </div>
    </article>
  `;
}

export function renderCreationPanel(panelId, state) {
  switch (panelId) {
    case "UI00":
      return renderGenerator(state);
    case "UI01":
      return renderRoll(state);
    case "UI02":
      return renderPlayerState(state);
    case "UI03":
      return renderCultivation(state);
    case "UI04":
      return renderGu(state);
    default:
      return "";
  }
}
