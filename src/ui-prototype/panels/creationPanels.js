import { GU_WORMS, ROLL_CARDS } from "../mockState.js";
import {
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
    ready: ["世界已就绪", "进入第 8 日演示", "door-open"],
    checking: ["正在读取索引", "完成读取", "loader-circle"],
    entered: ["世界运行中", "查看角色底盘", "circle-check-big"],
  }[state.ui.generatorStage];

  return `
    <article class="panel-page generator-page mvp-generator-page" data-testid="panel-UI00">
      ${panelHeader({
        id: "UI00",
        eyebrow: "原文设定 / 自由世界",
        title: "生成《蛊真人》世界",
        summary: "原文建立人物、势力、蛊虫和机缘索引；进入世界后，一切按玩家行动继续演化。",
        tools: iconButton("refresh-cw", "重新读取原文索引", "generator-reset"),
      })}
      <div class="generator-grid panel-scroll">
        <section class="source-terminal section-block">
          <div class="section-title">
            <span>${icon("file-text")} 原文源</span>
            ${statusBadge("只读", "good")}
          </div>
          <div class="source-file">
            <span class="file-seal">蛊</span>
            <div>
              <strong>${escapeHtml(generator.sourceFile)}</strong>
              <span>本地文本 · 设定与未来机缘索引</span>
            </div>
            ${icon("shield-check")}
          </div>
          <div class="terminal-log">
            <p><b>01</b><span>人物与血脉</span><strong>完成</strong></p>
            <p><b>02</b><span>势力与地点</span><strong>完成</strong></p>
            <p><b>03</b><span>蛊虫与物品</span><strong>完成</strong></p>
            <p><b>04</b><span>未来三年机缘</span><strong>完成</strong></p>
            <p class="terminal-current"><b>05</b><span>自由世界初始化</span><strong>就绪</strong></p>
          </div>
        </section>

        <section class="generation-readout section-block">
          <div class="section-title">
            <span>${icon("database")} 世界内容</span>
            <small>全部可查询</small>
          </div>
          <div class="generation-meters">
            ${meter({ label: "世界规则", value: generator.rules, tone: "jade" })}
            ${meter({ label: "关键人物", value: generator.characters, tone: "jade" })}
            ${meter({ label: "势力地点", value: generator.factions, tone: "brass" })}
            ${meter({ label: "未来机缘", value: generator.opportunities, tone: "cinnabar" })}
          </div>
          <div class="generation-spec">
            ${dataRow("世界模式", generator.mode)}
            ${dataRow("玩家身份", generator.identity)}
            ${dataRow("查询范围", generator.queryDepth)}
            ${dataRow("剧情原则", "玩家行动优先")}
          </div>
        </section>

        <section class="world-contract section-block">
          <div class="section-title">
            <span>${icon("compass")} 世界原则</span>
            ${statusBadge("MVP", "warning")}
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
            <div><span>主流程</span><strong>1</strong></div>
            <div><span>人物事件</span><strong>5</strong></div>
            <div><span>当前天骄</span><strong>6</strong></div>
            <div><span>离山路线</span><strong>6</strong></div>
          </div>
        </section>

        <footer class="generator-footer">
          <div>
            ${icon(stageCopy[2])}
            <span><small>当前状态</small><strong>${stageCopy[0]}</strong></span>
          </div>
          <button class="primary-command" type="button" data-action="generator-advance">
            ${stageCopy[1]} ${icon("arrow-right")}
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
        eyebrow: "整卡生成 / 九项属性",
        title: "古月旁支角色卡",
        summary: "身份与外观固定，资质、命格、天赋、缺陷与九项属性随整卡一起生成。",
        tools: `<span class="seed-readout">${icon("hash")} ${card.seed}</span>`,
      })}
      <div class="roll-layout panel-scroll">
        <section class="fixed-avatar section-block">
          <div class="section-title">
            <span>${icon("fingerprint")} 固定身份</span>
            ${statusBadge(locked ? "已确认" : "待确认", locked ? "good" : "warning")}
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
            ${dataRow("外观", "固定 Q 版模板")}
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
            ${icon("dices")}
            <p><strong>属性直接参与玩法</strong>战斗、偷盗、交谈与探索在后台读取对应属性。</p>
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
              <span>命格</span><strong>${card.fate}</strong><small>决定特殊玩法倾向</small>
            </div>
            ${card.talents
              .map(
                (talent) => `
                  <div class="trait-row trait-talent">
                    <span>天赋</span><strong>${talent}</strong><small>提供对应行动优势</small>
                  </div>
                `
              )
              .join("")}
            <div class="trait-row trait-flaw">
              <span>缺陷</span><strong>${card.flaw}</strong><small>在对应场景产生弱点</small>
            </div>
          </div>
          <div class="roll-actions">
            <button class="secondary-command" type="button" data-action="reroll" ${locked ? "disabled" : ""}>
              ${icon("dices")} 整卡重 Roll
            </button>
            <button class="primary-command" type="button" data-action="lock-roll" ${locked ? "disabled" : ""}>
              ${icon(locked ? "lock-keyhole" : "badge-check")}
              ${locked ? "角色卡已确认" : "确认角色卡"}
            </button>
          </div>
        </section>
      </div>
    </article>
  `;
}

function renderPlayerState(state) {
  const { player } = state;
  const view = state.ui.playerView ?? "overview";

  return `
    <article class="panel-page player-page simplified-player-page" data-testid="panel-UI02">
      ${panelHeader({
        id: "UI02",
        eyebrow: "战斗资源 / 状态效果",
        title: `${player.name} · ${player.rank}`,
        summary: "状态页只保留会直接影响行动的生命、真元、成长、属性与增减益。",
        tools: iconButton("scan-face", "切换角色视图", "cycle-player-view"),
      })}
      <div class="player-layout panel-scroll">
        <section class="player-portrait section-block">
          <div class="segmented-control portrait-state-tabs">
            ${[
              ["overview", "常态"],
              ["combat", "战斗"],
              ["injured", "受伤"],
            ]
              .map(
                ([id, label]) => `
                  <button
                    type="button"
                    data-action="set-player-view"
                    data-view-id="${id}"
                    class="${view === id ? "is-active" : ""}"
                  >${label}</button>
                `
              )
              .join("")}
          </div>
          <div class="player-state-stage state-${view}">
            <span class="state-signal">${view === "overview" ? "常态" : view === "combat" ? "备战" : "轻伤"}</span>
            <img src="${player.portrait}" alt="${escapeHtml(player.name)} Q 版角色" />
            <div class="injury-overlay" aria-hidden="true"></div>
          </div>
          <div class="player-nameplate">
            <div><strong>${escapeHtml(player.name)}</strong><span>${escapeHtml(player.title)}</span></div>
            ${statusBadge(player.theftRank, "special")}
          </div>
        </section>

        <section class="vitals-sheet section-block">
          <div class="section-title">
            <span>${icon("activity")} 核心状态</span>
            <small>第 ${state.world.day} 日 · ${state.world.time}</small>
          </div>
          <div class="vital-grid compact-vital-grid">
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
              label: "境界进度",
              value: player.cultivation,
              tone: "brass",
              display: `${player.cultivation}%`,
            })}
            ${meter({
              label: "实战经验",
              value: player.combatExperience,
              tone: "violet",
              display: `${player.combatExperience}%`,
            })}
          </div>
          <div class="ledger-strip compact-ledger-strip">
            <div><span>元石</span><strong>${player.stones}</strong></div>
            <div><span>功绩</span><strong>${player.merit}</strong></div>
            <div><span>行动点</span><strong>${player.ap.current}/${player.ap.max}</strong></div>
            <div><span>盗道</span><strong>${player.theftMastery}</strong></div>
          </div>
          <div class="attribute-summary">
            ${player.attributes
              .map(
                ({ label, value, tone }) => `
                  <span class="tone-${tone}"><small>${label}</small><strong>${value}</strong></span>
                `
              )
              .join("")}
          </div>
        </section>

        <section class="status-ledger section-block">
          <div class="section-title">
            <span>${icon("layers-3")} Buff / Debuff</span>
            <small>${player.buffs.length} 项</small>
          </div>
          <div class="status-list">
            ${player.buffs
              .map(
                ({ name, layer, effect, tone }) => `
                  <button class="status-row tone-${tone}" type="button" data-action="inspect-status">
                    <span class="status-icon">${icon(
                      tone === "danger" ? "bandage" : tone === "warning" ? "triangle-alert" : "sparkles"
                    )}</span>
                    <span><small>${escapeHtml(layer)}</small><strong>${escapeHtml(name)}</strong><em>${escapeHtml(effect)}</em></span>
                    ${icon("chevron-right")}
                  </button>
                `
              )
              .join("")}
          </div>
          <p class="mvp-rule-note">${icon("info")} 状态改变数值与战斗表现，不负责锁住剧情流程。</p>
        </section>
      </div>
    </article>
  `;
}

function renderGrowth(state) {
  const { player } = state;
  const sources = [
    { icon: "swords", title: "战斗胜利", gain: "+18", note: "主要来源", tone: "primary" },
    { icon: "footprints", title: "危险探索", gain: "+10", note: "发现地点或脱离险境", tone: "secondary" },
    { icon: "target", title: "日常训练", gain: "+6", note: "稳定补充", tone: "secondary" },
    { icon: "moon-star", title: "夜间修炼", gain: "+8", note: "完全可选", tone: "optional" },
  ];

  return `
    <article class="panel-page cultivation-page growth-page" data-testid="panel-UI03">
      ${panelHeader({
        id: "UI03",
        eyebrow: "战斗为主 / 多路成长",
        title: `${player.rank} · 成长进度`,
        summary: "战斗是修为成长的主路线；探索、训练和夜间修炼都能补充进度。",
        tools: iconButton("scroll-text", "查看成长记录", "show-growth-log"),
      })}
      <div class="growth-layout panel-scroll">
        <section class="growth-progress-card section-block">
          <div class="section-title">
            <span>${icon("gauge")} 距一转中阶</span>
            ${statusBadge(`${player.cultivation}%`, "good")}
          </div>
          <div class="growth-ring" style="--progress: ${player.cultivation}">
            <span>${player.rank}</span>
            <strong>${player.cultivation}%</strong>
            <small>成长进度</small>
          </div>
          ${meter({
            label: "本阶实战经验",
            value: player.combatExperience,
            tone: "violet",
            display: `${player.combatExperience}/100`,
          })}
          <button class="primary-command full-command" type="button" data-action="start-combat">
            ${icon("swords")} 进入棋盘战斗
          </button>
        </section>

        <section class="growth-sources section-block">
          <div class="section-title">
            <span>${icon("trending-up")} 成长来源</span>
            <small>完成行动后直接结算</small>
          </div>
          <div class="growth-source-list">
            ${sources
              .map(
                ({ icon: iconName, title, gain, note, tone }) => `
                  <div class="growth-source-row tone-${tone}">
                    <span>${icon(iconName)}</span>
                    <div><strong>${title}</strong><small>${note}</small></div>
                    <b>${gain}</b>
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="growth-explanation">
            ${icon("circle-check-big")}
            <p><strong>不需要等到晚上</strong>只要战斗、探索或训练结算，成长进度就会立刻增加。</p>
          </div>
        </section>

        <section class="rank-benefits section-block">
          <div class="section-title">
            <span>${icon("badge-plus")} 晋升收益</span>
            <small>进度满后直接晋升</small>
          </div>
          <div class="benefit-grid">
            <div>${icon("heart-pulse")}<span><strong>生命上限 +12</strong><small>承受更多伤害</small></span></div>
            <div>${icon("droplets")}<span><strong>真元上限 +8</strong><small>可多次催动蛊虫</small></span></div>
            <div>${icon("move")}<span><strong>属性点 +3</strong><small>自由分配至九项属性</small></span></div>
            <div>${icon("bug")}<span><strong>蛊虫栏 +1</strong><small>装备更多战斗蛊</small></span></div>
          </div>
          <div class="simple-rank-note">
            <span>${icon("zap")} 晋升</span>
            <p>进度达到 100 后在战斗结算或休息时完成，没有额外清单。</p>
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
        summary: "蛊虫提供战斗招式和探索能力，需要炼化并按周期投喂。",
        tools: iconButton("flask-conical", "查看合炼配方", "show-recipes"),
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
                  <span><strong>${gu.name}</strong><small>${gu.rank} · ${gu.path}</small></span>
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
              <span><strong>${activeGu.name}</strong><small>${activeGu.rank} · ${activeGu.path}</small></span>
              ${statusBadge(activeGu.stateLabel, guStateTone(activeGu.state))}
            </div>
            <p class="gu-effect">${activeGu.effect}</p>
            <div class="gu-facts">
              ${dataRow("催动消耗", activeGu.essence ? `${activeGu.essence} 点青铜真元` : "无需真元")}
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
              <button class="secondary-command" type="button" data-action="feed-gu" ${activeGu.state === "dormant" ? "disabled" : ""}>
                ${icon("wheat")} 投喂
              </button>
              <button class="primary-command" type="button" data-action="refine-gu" ${activeGu.state === "active" ? "disabled" : ""}>
                ${icon("flame")} ${activeGu.state === "wild" ? "开始炼化" : "查看炼化"}
              </button>
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
            <span>炼道理解 31</span><span>成功率 46%</span><span class="is-missing">缺少：小光蛊</span>
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
      return renderGrowth(state);
    case "UI04":
      return renderGu(state);
    default:
      return "";
  }
}
