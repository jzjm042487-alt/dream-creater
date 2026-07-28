import {
  INVENTORY_ITEMS,
  QUESTS,
  RELATION_GROUPS,
  RIVALS,
  SOURCE_OPPORTUNITIES,
  WILDERNESS_NODES,
  filterSourceOpportunities,
} from "../mockState.js";
import {
  dataRow,
  emptyState,
  escapeHtml,
  icon,
  iconButton,
  panelHeader,
  scenePath,
  statusBadge,
} from "../components.js";

const ITEM_FILTERS = [
  { id: "all", label: "全部" },
  { id: "resource", label: "资源" },
  { id: "material", label: "材料" },
  { id: "consumable", label: "消耗品" },
  { id: "key", label: "钥匙令牌" },
];

const SOURCE_TYPES = [
  { id: "all", label: "全部", icon: "layers-3" },
  { id: "character", label: "人物", icon: "user-round" },
  { id: "gu", label: "蛊虫", icon: "bug" },
  { id: "item", label: "物品", icon: "package" },
  { id: "faction", label: "势力", icon: "landmark" },
  { id: "inheritance", label: "传承", icon: "scroll-text" },
];

const SOURCE_HORIZONS = [
  { id: "current", label: "今年", note: "当前章节" },
  { id: "one-year", label: "未来一年", note: "离山初期" },
  { id: "three-years", label: "未来三年", note: "远期机缘" },
];

function renderInventory(state) {
  const filter = state.ui.inventoryFilter;
  const acquiredItems = state.ui.acquiredItems.map((item, index) => ({
    id: `acquired-${index}`,
    name: item,
    type: "resource",
    typeLabel: "新取得",
    count: 1,
    state: "normal",
    mark: "得",
    detail: "通过探索、战斗或偷盗取得。",
  }));
  const inventory = [...INVENTORY_ITEMS, ...acquiredItems];
  const visibleItems = inventory.filter(
    ({ type }) => filter === "all" || type === filter
  );
  const activeItem =
    visibleItems.find(({ id }) => id === state.ui.activeItemId) ??
    visibleItems.find(({ type }) => type !== "empty") ??
    INVENTORY_ITEMS[0];

  return `
    <article class="panel-page inventory-page simplified-inventory-page" data-testid="panel-UI05">
      ${panelHeader({
        id: "UI05",
        eyebrow: "物品 / 装备 / 炼器",
        title: "行囊与装备",
        summary: "取得的物品直接进入行囊；这里管理消耗品、蛊材、兵器、防具、法器与炼器配方。",
        tools: `
          ${iconButton("arrow-up-down", "整理行囊", "sort-inventory")}
          ${iconButton("hammer", "打开炼器", "show-forging")}
        `,
      })}
      <div class="inventory-layout panel-scroll">
        <section class="inventory-grid-section section-block">
          <div class="section-title">
            <span>${icon("backpack")} 行囊</span>
            <small>${inventory.filter(({ type }) => type !== "empty").length} / 12 格</small>
          </div>
          <div class="segmented-control inventory-filters">
            ${ITEM_FILTERS.map(
              ({ id, label }) => `
                <button
                  type="button"
                  data-action="filter-inventory"
                  data-filter-id="${id}"
                  class="${filter === id ? "is-active" : ""}"
                >${label}</button>
              `
            ).join("")}
          </div>
          <div class="item-grid">
            ${
              visibleItems.length
                ? visibleItems
                    .map(
                      (item) => `
                        <button
                          class="item-slot state-${item.state} ${activeItem.id === item.id ? "is-selected" : ""}"
                          type="button"
                          data-action="select-item"
                          data-item-id="${item.id}"
                          ${item.state === "empty" ? "disabled" : ""}
                        >
                          <span class="item-mark">${item.mark}</span>
                          <strong>${item.name}</strong>
                          <small>${item.typeLabel}</small>
                          ${item.count > 1 ? `<b class="item-count">${item.count}</b>` : ""}
                        </button>
                      `
                    )
                    .join("")
                : emptyState("package-search", "没有匹配物品", "切换分类查看其他内容")
            }
          </div>
          <div class="inventory-direct-rule">
            ${icon("circle-check-big")}
            <span><strong>取得即入包</strong>战斗、拾取和偷盗成功后都直接加入行囊。</span>
          </div>
        </section>

        <section class="item-detail-sheet section-block">
          <div class="section-title">
            <span>${icon("package-open")} 物品详情</span>
            ${statusBadge(activeItem.typeLabel, "good")}
          </div>
          <div class="selected-item">
            <span class="selected-item-mark">${activeItem.mark}</span>
            <div>
              <small>${activeItem.typeLabel}</small>
              <strong>${activeItem.name}</strong>
              <span>数量 ${activeItem.count || 1}</span>
            </div>
          </div>
          <p class="item-description">${activeItem.detail || "空行囊位。"}</p>
          <div class="simple-item-actions">
            <button class="secondary-command" type="button" data-action="use-item" ${activeItem.type === "empty" ? "disabled" : ""}>
              ${icon("hand")} 使用
            </button>
            <button class="secondary-command" type="button" data-action="equip-item" ${activeItem.type === "empty" ? "disabled" : ""}>
              ${icon("shield-plus")} 装备
            </button>
          </div>
        </section>

        <section class="equipment-sheet section-block">
          <div class="section-title">
            <span>${icon("shield")} 装备与法器</span>
            <small>4 个槽位</small>
          </div>
          <div class="equipment-slots">
            <button type="button" data-action="inspect-equipment">
              <span>${icon("shirt")}</span><strong>学堂短打</strong><small>衣甲 · 普通</small>
            </button>
            <button type="button" data-action="inspect-equipment">
              <span>${icon("shield-half")}</span><strong>旧皮护腕</strong><small>防具 · 防护 +3</small>
            </button>
            <button type="button" data-action="inspect-equipment">
              <span>${icon("sword")}</span><strong>拆信短刃</strong><small>兵器 · 近战 +2</small>
            </button>
            <button class="is-empty" type="button" data-action="show-forging">
              <span>${icon("hammer")}</span><strong>护身法器</strong><small>空位 · 前往炼器</small>
            </button>
          </div>
          <div class="forging-preview">
            <span>${icon("anvil")} 当前配方</span>
            <strong>隐线袖囊</strong>
            <small>暮蝉蜕 0/2 · 青铜碎片 3/3 · 炼道理解 31</small>
          </div>
        </section>
      </div>
    </article>
  `;
}

const DIRECTIONS = [
  { id: "forward", label: "向前", icon: "arrow-up" },
  { id: "left", label: "向左", icon: "arrow-left" },
  { id: "right", label: "向右", icon: "arrow-right" },
  { id: "back", label: "向后", icon: "arrow-down" },
];

function renderTravel(state) {
  const node =
    WILDERNESS_NODES[state.ui.travelNodeId] ?? WILDERNESS_NODES["bamboo-entry"];
  const moving = state.ui.travelMoving;
  const nearbyRival =
    node.id === "wine-cave"
      ? RIVALS.find(({ id }) => id === "fang-yuan")
      : null;

  return `
    <article class="panel-page hidden-route-page" data-testid="panel-UI06">
      ${panelHeader({
        id: "UI06",
        eyebrow: "隐式路线 / 相对方向",
        title: "野外旅行",
        summary: "玩家只看见当前环境与前后左右四个选择，移动途中触发探索、人物或战斗事件。",
        tools: iconButton("history", "查看行路记录", "show-travel-history"),
      })}
      <div class="hidden-route-layout panel-scroll" data-travel-node="${node.id}">
        <section class="travel-scene section-block ${nearbyRival ? "has-encounter" : ""}">
          <img src="${scenePath(node.scene)}" alt="${node.name}" />
          <div class="travel-scene-shade"></div>
          <div class="travel-location-copy">
            <span>${icon("map-pin")} 当前环境</span>
            <h2>${node.name}</h2>
            <p>${node.description}</p>
          </div>
          <div class="travel-avatar ${moving ? "is-running" : ""}">
            <img src="${state.player.portrait}" alt="${moving ? "奔跑中的古月砚" : "古月砚"}" />
            <span>${moving ? "奔跑" : "观察"}</span>
          </div>
          ${
            nearbyRival
              ? `
                <div class="travel-npc-marker">
                  <img src="${nearbyRival.portrait}" alt="${nearbyRival.name}" />
                  <span>附近 · ${nearbyRival.name}</span>
                </div>
                <div class="travel-encounter-actions" aria-label="附近人物操作">
                  <div class="travel-encounter-copy">
                    <small>${icon("scan-face")} 可交互人物</small>
                    <strong>${nearbyRival.name}</strong>
                  </div>
                  <button type="button" data-action="start-dialogue" title="交谈">
                    ${icon("message-square")}
                    <span>交谈</span>
                  </button>
                  <button
                    class="is-theft"
                    type="button"
                    data-action="open-theft"
                    data-theft-target-id="${nearbyRival.id}"
                    title="偷盗"
                  >
                    ${icon("hand")}
                    <span>偷盗</span>
                  </button>
                  <button type="button" data-action="start-combat" title="挑战">
                    ${icon("swords")}
                    <span>挑战</span>
                  </button>
                </div>
              `
              : ""
          }
          <div class="travel-event-line">
            ${icon("sparkles")}
            <span><small>环境信息</small><strong>${node.event}</strong></span>
          </div>
        </section>

        <section class="direction-sheet section-block">
          <div class="section-title">
            <span>${icon("navigation")} 选择方向</span>
            <small>不显示目的地</small>
          </div>
          <div class="travel-direction-grid">
            ${DIRECTIONS.map(
              ({ id, label, icon: iconName }) => `
                <button
                  class="direction-${id}"
                  type="button"
                  data-action="travel-direction"
                  data-direction-id="${id}"
                  aria-label="${label}"
                >
                  ${icon(iconName)}
                  <strong>${label}</strong>
                  <small>${id === "back" ? "回看来路" : "进入未知区域"}</small>
                </button>
              `
            ).join("")}
            <div class="direction-center">
              ${icon("footprints")}
              <strong>${node.name}</strong>
            </div>
          </div>
          <div class="run-readout">
            <span>${icon("gauge")} 主角动作</span>
            <strong>${moving ? "run_side · 12 FPS" : "idle_side · 6 FPS"}</strong>
            <small>抵达后自动恢复待机</small>
          </div>
        </section>

        <aside class="travel-log section-block">
          <div class="section-title">
            <span>${icon("route")} 最近行程</span>
            <small>${state.ui.travelHistory.length} 步</small>
          </div>
          ${
            state.ui.travelHistory.length
              ? `<ol>${state.ui.travelHistory
                  .slice(-5)
                  .reverse()
                  .map(
                    ({ from, direction, to }) => `
                      <li><span>${direction}</span><strong>${from}</strong>${icon("arrow-right")}<b>${to}</b></li>
                    `
                  )
                  .join("")}</ol>`
              : emptyState("footprints", "还没有移动", "选择一个方向开始旅行")
          }
          <div class="travel-rule-note">
            ${icon("swords")}
            <p>危险事件会直接切入棋盘战斗，普通事件则在场景中弹出对话或拾取。</p>
          </div>
        </aside>
      </div>
    </article>
  `;
}

function questTone(status) {
  return {
    active: "special",
    available: "good",
    future: "neutral",
    completed: "good",
  }[status];
}

function renderQuestLog(state) {
  const activeQuest =
    QUESTS.find(({ id }) => id === state.ui.activeQuestId) ?? QUESTS[0];

  return `
    <article class="panel-page quest-page simplified-quest-page" data-testid="panel-UI07">
      ${panelHeader({
        id: "UI07",
        eyebrow: "流程推进 / 清晰下一步",
        title: "任务日志",
        summary: "任务按事件流程推进，不需要额外刷数值或维护隐藏条件。",
        tools: iconButton("list-filter", "筛选任务", "filter-quests"),
      })}
      <div class="simple-quest-layout panel-scroll">
        <section class="quest-list-section section-block">
          <div class="section-title">
            <span>${icon("list-tree")} 当前任务</span>
            <small>${QUESTS.length} 条</small>
          </div>
          <div class="quest-list">
            ${QUESTS.map(
              (quest) => `
                <button
                  class="quest-row ${activeQuest.id === quest.id ? "is-selected" : ""}"
                  type="button"
                  data-action="select-quest"
                  data-quest-id="${quest.id}"
                >
                  <span class="quest-code">${quest.id}</span>
                  <span><small>${quest.kind}</small><strong>${quest.title}</strong><em>${quest.step}</em></span>
                  ${statusBadge(quest.statusLabel, questTone(quest.status))}
                </button>
              `
            ).join("")}
          </div>
        </section>

        <section class="simple-quest-detail section-block">
          <div class="section-title">
            <span>${icon("scroll-text")} ${activeQuest.id}</span>
            ${statusBadge(activeQuest.statusLabel, questTone(activeQuest.status))}
          </div>
          <div class="quest-detail-title">
            <small>${activeQuest.kind}</small>
            <strong>${activeQuest.title}</strong>
          </div>
          <div class="quest-flow">
            <div class="is-done">${icon("circle-check")}<span><small>已发生</small><strong>任务进入日志</strong></span></div>
            <i></i>
            <div class="${activeQuest.status === "active" ? "is-current" : ""}">
              ${icon(activeQuest.status === "active" ? "play" : "circle")}
              <span><small>当前步骤</small><strong>${activeQuest.step}</strong></span>
            </div>
            <i></i>
            <div>${icon("flag")}<span><small>下一步</small><strong>${activeQuest.next}</strong></span></div>
          </div>
          <button class="primary-command full-command" type="button" data-action="track-quest">
            ${icon("crosshair")} 设为当前任务
          </button>
        </section>

        <aside class="quest-mvp-note section-block">
          ${icon("route")}
          <h2>流程优先</h2>
          <p>能做的步骤直接显示；当前不能发生的内容不生成按钮，也不额外展示门槛。</p>
          <div>
            <span>${icon("check")} 无关系数值门槛</span>
            <span>${icon("check")} 无多层任务进度</span>
            <span>${icon("check")} 无隐藏写入清单</span>
          </div>
        </aside>
      </div>
    </article>
  `;
}

function provenanceTone(provenance) {
  return {
    original: "good",
    inference: "warning",
  }[provenance] ?? "neutral";
}

function resolveSourceResults(state) {
  const results = filterSourceOpportunities(SOURCE_OPPORTUNITIES, {
    horizon: state.ui.queryHorizon,
    type: state.ui.queryType,
    query: state.ui.queryText,
  });
  const active =
    results.find(({ id }) => id === state.ui.activeOpportunityId) ?? results[0];

  return { results, active };
}

export function renderSourceResults(state) {
  const { results, active } = resolveSourceResults(state);

  if (!results.length) {
    return emptyState(
      "book-x",
      "没有匹配的原文节点",
      "扩大时间范围，或改用人物、地点与蛊虫名称查询"
    );
  }

  return results
    .map(
      (opportunity) => `
        <button
          class="source-result ${active?.id === opportunity.id ? "is-selected" : ""}"
          type="button"
          data-action="select-opportunity"
          data-opportunity-id="${opportunity.id}"
        >
          <span class="source-result-icon">${icon(
            {
              character: "user-round",
              gu: "bug",
              item: "package",
              faction: "landmark",
              inheritance: "scroll-text",
            }[opportunity.type]
          )}</span>
          <span class="source-result-copy">
            <small>${opportunity.horizonLabel} · ${opportunity.typeLabel}</small>
            <strong>${opportunity.title}</strong>
            <span>${opportunity.window}</span>
          </span>
          <span class="source-result-meta">
            ${statusBadge(opportunity.provenanceLabel, provenanceTone(opportunity.provenance))}
            ${icon("chevron-right")}
          </span>
        </button>
      `
    )
    .join("");
}

export function renderSourceDetail(state) {
  const { active } = resolveSourceResults(state);

  if (!active) {
    return emptyState("scan-search", "等待选择节点", "查询结果会在这里显示原作未来与截胡方式");
  }

  return `
    <div class="source-detail-head simplified-source-head">
      <div>
        <span>${active.horizonLabel} · ${active.typeLabel}</span>
        <h2>${active.title}</h2>
        <p>${active.summary}</p>
      </div>
      ${statusBadge(active.provenanceLabel, provenanceTone(active.provenance))}
    </div>
    <div class="source-detail-grid">
      ${dataRow("原作归属", active.owner)}
      ${dataRow("发生时间", active.window)}
      ${dataRow("发生地点", active.location)}
      ${dataRow("相关势力", active.faction)}
    </div>
    <div class="source-plan">
      <section><span>${icon("route")} 截胡思路</span><p>${active.method}</p></section>
      <section><span>${icon("gem")} 可能收益</span><p>${active.reward}</p></section>
      <section class="is-risk"><span>${icon("shuffle")} 改变之后</span><p>${active.consequence}</p></section>
    </div>
    <footer class="source-detail-footer">
      <div>
        ${icon("book-open-check")}
        <span>这是原作未来情报，不是必须维持的命运。</span>
      </div>
      <button class="primary-command" type="button" data-action="convert-opportunity">
        ${icon("bookmark-plus")} 标记这条机缘
      </button>
    </footer>
  `;
}

function renderSourceQuery(state) {
  const { results } = resolveSourceResults(state);

  return `
    <article class="panel-page source-page simplified-source-page" data-testid="panel-UI08">
      ${panelHeader({
        id: "UI08",
        eyebrow: "天外外挂 / 原文只读查询",
        title: "查询今年与未来三年的机缘",
        summary: "输入人物、蛊虫、势力或地点，查看原作中会发生的奇遇，再决定是否提前截取。",
        tools: iconButton("bookmark", "查看已标记机缘", "show-bookmarks"),
      })}
      <div class="source-layout panel-scroll">
        <section class="source-controls section-block">
          <div class="horizon-control" role="tablist" aria-label="查询时间">
            ${SOURCE_HORIZONS.map(
              ({ id, label, note }) => `
                <button
                  type="button"
                  role="tab"
                  aria-selected="${state.ui.queryHorizon === id}"
                  data-action="set-query-horizon"
                  data-horizon-id="${id}"
                  class="${state.ui.queryHorizon === id ? "is-active" : ""}"
                ><strong>${label}</strong><small>${note}</small></button>
              `
            ).join("")}
          </div>
          <label class="source-search">
            ${icon("search")}
            <input
              type="search"
              placeholder="输入人物、地点、蛊虫或势力"
              value="${escapeHtml(state.ui.queryText)}"
              data-query-input
              aria-label="查询原文"
            />
            <kbd>原文</kbd>
          </label>
          <div class="source-type-filters" aria-label="机缘类型">
            ${SOURCE_TYPES.map(
              ({ id, label, icon: iconName }) => `
                <button
                  type="button"
                  data-action="set-query-type"
                  data-type-id="${id}"
                  class="${state.ui.queryType === id ? "is-active" : ""}"
                >${icon(iconName)}<span>${label}</span></button>
              `
            ).join("")}
          </div>
          <div class="source-count">
            <span>${icon("database")} 查询结果</span>
            <strong data-source-count>${results.length}</strong>
          </div>
        </section>

        <section class="source-results section-block">
          <div class="section-title">
            <span>${icon("list-filter")} 匹配节点</span>
            <small>按时间排列</small>
          </div>
          <div class="source-result-list" data-source-results>${renderSourceResults(state)}</div>
        </section>

        <section class="source-detail section-block" data-source-detail>
          ${renderSourceDetail(state)}
        </section>
      </div>
    </article>
  `;
}

function relationPortraitPath(relation, portraitState) {
  if (!relation.portrait.includes("_normal.png")) {
    return relation.portrait;
  }

  return relation.portrait.replace("_normal.png", `_${portraitState}.png`);
}

function renderRelationships(state) {
  const groupId = state.ui.relationGroup;
  const relations = RELATION_GROUPS[groupId];
  const active =
    relations.find(({ id }) => id === state.ui.activeRelationId) ?? relations[0];
  const portraitState = active.portrait.includes("_normal.png")
    ? state.ui.npcPortraitState ?? "normal"
    : "normal";
  const portraitStates = [
    ["normal", "常态"],
    ["outerwear_missing", "外衣遗失"],
    ["privacy_layer_missing", "贴身衣物遗失"],
  ];

  return `
    <article class="panel-page relations-page graph-relations-page" data-testid="panel-UI09">
      ${panelHeader({
        id: "UI09",
        eyebrow: "血脉 / 亲朋",
        title: "人物关系",
        summary: "关系图只展示角色之间是什么关系、是否在世，以及当前可公开得知的信息。",
        tools: iconButton("users-round", "查看全部人物", "show-all-relations"),
      })}
      <div class="graph-relations-layout panel-scroll">
        <section class="relationship-graph-sheet section-block">
          <div class="relation-group-tabs" role="tablist" aria-label="关系类别">
            <button
              type="button"
              role="tab"
              aria-selected="${groupId === "blood"}"
              data-action="set-relation-group"
              data-group-id="blood"
              class="${groupId === "blood" ? "is-active" : ""}"
            >${icon("git-fork")} 血脉关系</button>
            <button
              type="button"
              role="tab"
              aria-selected="${groupId === "social"}"
              data-action="set-relation-group"
              data-group-id="social"
              class="${groupId === "social" ? "is-active" : ""}"
            >${icon("users")} 亲朋关系</button>
          </div>
          <div class="relationship-graph">
            <div class="relationship-lines" aria-hidden="true">
              <i></i><i></i><i></i>
            </div>
            <div class="relation-player-node">
              <img src="${state.player.portrait}" alt="" />
              <strong>${state.player.name}</strong>
              <small>自己</small>
            </div>
            ${relations
              .map(
                (relation, index) => `
                  <button
                    class="relation-graph-node node-${index + 1} ${active.id === relation.id ? "is-selected" : ""}"
                    type="button"
                    data-action="select-relation"
                    data-relation-id="${relation.id}"
                  >
                    <img src="${relation.portrait}" alt="" />
                    <span><strong>${relation.name}</strong><small>${relation.relation}</small></span>
                  </button>
                `
              )
              .join("")}
          </div>
        </section>

        <section class="relation-profile section-block">
          <div class="relation-profile-portrait state-${portraitState}">
            <img src="${relationPortraitPath(active, portraitState)}" alt="${active.name}角色立绘" />
            <div><span>${active.status}</span><strong>${active.name}</strong><small>${active.relation}</small></div>
          </div>
          ${
            active.portrait.includes("_normal.png")
              ? `
                <div class="segmented-control portrait-preview-control">
                  ${portraitStates
                    .map(
                      ([id, label]) => `
                        <button
                          type="button"
                          data-action="set-npc-portrait-state"
                          data-state-id="${id}"
                          class="${portraitState === id ? "is-active" : ""}"
                        >${label}</button>
                      `
                    )
                    .join("")}
                </div>
              `
              : `<p class="q-static-note">${icon("info")} 地图 Q 版角色始终保持固定形象。</p>`
          }
        </section>

        <section class="relation-public-info section-block">
          <div class="section-title">
            <span>${icon("contact")} 关系信息</span>
            ${statusBadge(active.status, "good")}
          </div>
          ${dataRow("姓名", active.name)}
          ${dataRow("与你的关系", active.relation)}
          ${dataRow("当前状态", active.status)}
          <div class="relation-note">
            <span>${icon("message-circle")} 已知近况</span>
            <p>${active.note}</p>
          </div>
          <button class="primary-command full-command" type="button" data-action="start-dialogue">
            ${icon("messages-square")} 与此人交谈
          </button>
        </section>
      </div>
    </article>
  `;
}

function rivalStatusTone(status) {
  return {
    active: "good",
    injured: "warning",
    dead: "danger",
  }[status];
}

function renderRivals(state) {
  const active =
    RIVALS.find(({ id }) => id === state.ui.activeRivalId) ?? RIVALS[0];

  return `
    <article class="panel-page rivals-page" data-testid="panel-UI10">
      ${panelHeader({
        id: "UI10",
        eyebrow: "天骄 / 竞争者 / 生死状态",
        title: "青茅山竞争者",
        summary: "方源只是众多竞争者之一；所有角色都可以被击败或杀死，结果由当前世界承接。",
        tools: iconButton("swords", "查看交战记录", "show-rival-history"),
      })}
      <div class="rivals-layout panel-scroll">
        <section class="rival-roster section-block">
          <div class="section-title">
            <span>${icon("users-round")} 已知天骄</span>
            <small>${RIVALS.length} 人</small>
          </div>
          <div class="rival-list">
            ${RIVALS.map(
              (rival) => `
                <button
                  class="rival-row ${active.id === rival.id ? "is-selected" : ""}"
                  type="button"
                  data-action="select-rival"
                  data-rival-id="${rival.id}"
                >
                  <img src="${rival.portrait}" alt="" />
                  <span><small>${rival.relation}</small><strong>${rival.name}</strong><em>${rival.realm}</em></span>
                  ${statusBadge(rival.statusLabel, rivalStatusTone(rival.status))}
                </button>
              `
            ).join("")}
          </div>
        </section>

        <section class="rival-focus section-block">
          <div class="rival-focus-stage">
            <span class="rival-mark">${active.name.slice(-1)}</span>
            <img src="${active.portrait}" alt="${active.name}" />
          </div>
          <div class="rival-focus-name">
            <span>${active.relation}</span>
            <h2>${active.name}</h2>
            ${statusBadge(active.statusLabel, rivalStatusTone(active.status))}
          </div>
          <div class="rival-facts">
            ${dataRow("境界", active.realm)}
            ${dataRow("已知蛊虫", active.gu)}
            ${dataRow("生死状态", active.statusLabel)}
          </div>
        </section>

        <section class="rival-actions-sheet section-block">
          <div class="section-title">
            <span>${icon("scroll-text")} 公开记录</span>
            <small>当前世界</small>
          </div>
          <p class="rival-record">${active.record}</p>
          <div class="rival-action-list">
            <button type="button" data-action="start-dialogue">${icon("messages-square")}<span><strong>交谈</strong><small>进入普通剧情对话</small></span></button>
            <button type="button" data-action="open-theft" data-theft-target-id="${active.id}">${icon("hand")}<span><strong>偷盗</strong><small>查看可偷取物品并做一次判定</small></span></button>
            <button type="button" data-action="start-combat">${icon("swords")}<span><strong>挑战</strong><small>进入棋盘战斗，可产生致死结果</small></span></button>
          </div>
          <div class="free-world-note">
            ${icon("skull")}
            <p>角色死亡后会从后续事件中移除，不会被剧情自动复活。</p>
          </div>
        </section>
      </div>
    </article>
  `;
}

export function renderWorldPanel(panelId, state) {
  switch (panelId) {
    case "UI05":
      return renderInventory(state);
    case "UI06":
      return renderTravel(state);
    case "UI07":
      return renderQuestLog(state);
    case "UI08":
      return renderSourceQuery(state);
    case "UI09":
      return renderRelationships(state);
    case "UI10":
      return renderRivals(state);
    default:
      return "";
  }
}
