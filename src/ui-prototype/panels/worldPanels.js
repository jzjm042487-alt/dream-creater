import {
  CHIBI_BASE,
  EVIDENCE,
  INVENTORY_ITEMS,
  MAP_LOCATIONS,
  PORTRAIT_BASE,
  QUESTS,
  RELATIONSHIPS,
  SOURCE_OPPORTUNITIES,
  filterSourceOpportunities,
} from "../mockState.js";
import {
  dataRow,
  emptyState,
  escapeHtml,
  icon,
  iconButton,
  meter,
  panelHeader,
  statusBadge,
} from "../components.js";

const ITEM_FILTERS = [
  { id: "all", label: "全部" },
  { id: "quest", label: "任务物" },
  { id: "stolen", label: "赃物" },
  { id: "evidence", label: "证据" },
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
  { id: "current", label: "今年", note: "青茅山内可行动" },
  { id: "one-year", label: "未来一年", note: "含章节后索引" },
  { id: "three-years", label: "未来三年", note: "远期只读推演" },
];

function itemStateTone(state) {
  return {
    normal: "neutral",
    quest: "warning",
    stolen: "danger",
    hidden: "special",
    bound: "good",
    empty: "neutral",
  }[state];
}

function renderInventory(state) {
  const filter = state.ui.inventoryFilter;
  const visibleItems = INVENTORY_ITEMS.filter(
    ({ type }) => filter === "all" || type === filter
  );
  const activeItem =
    visibleItems.find(({ id }) => id === state.ui.activeItemId) ??
    visibleItems.find(({ type }) => type !== "empty") ??
    INVENTORY_ITEMS[0];

  return `
    <article class="panel-page inventory-page" data-testid="panel-UI05">
      ${panelHeader({
        id: "UI05",
        eyebrow: "行囊 / 装备 / 唯一所有权",
        title: "八格行囊与赃物追踪",
        summary: "蛊虫、装备、法器、任务物和证据分别占用资源位；物品被拿走不等于所有权已经转移。",
        tools: `
          ${iconButton("arrow-up-down", "整理行囊", "sort-inventory")}
          ${iconButton("package-open", "查看袖囊扩展", "show-pouch")}
        `,
      })}
      <div class="inventory-layout panel-scroll">
        <section class="inventory-grid-section section-block">
          <div class="section-title">
            <span>${icon("backpack")} 行囊</span>
            <small>7 / 8 格 · 负重 18 / 28</small>
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
                          class="item-slot state-${item.state} ${
                            activeItem.id === item.id ? "is-selected" : ""
                          }"
                          type="button"
                          data-action="select-item"
                          data-item-id="${item.id}"
                          ${item.state === "empty" ? "disabled" : ""}
                        >
                          <span class="item-mark">${item.mark}</span>
                          <strong>${item.name}</strong>
                          <small>${item.typeLabel}</small>
                          ${
                            item.count > 1
                              ? `<b class="item-count">${item.count}</b>`
                              : ""
                          }
                          ${
                            item.state !== "normal" &&
                            item.state !== "empty"
                              ? statusBadge(
                                  {
                                    quest: "任务",
                                    stolen: "赃",
                                    hidden: "藏",
                                    bound: "绑",
                                  }[item.state],
                                  itemStateTone(item.state),
                                  "slot-state"
                                )
                              : ""
                          }
                        </button>
                      `
                    )
                    .join("")
                : emptyState("package-search", "没有匹配物品", "切换分类查看其他行囊内容")
            }
          </div>
          <div class="pouch-line">
            ${icon("briefcase-business")}
            <span><strong>袖囊扩展未炼成</strong>炼器 40 后可追加 4 个隐藏格</span>
            ${statusBadge("配方 2/3", "warning")}
          </div>
        </section>

        <section class="ownership-sheet section-block">
          <div class="section-title">
            <span>${icon("fingerprint")} 所有权记录</span>
            ${statusBadge(activeItem.typeLabel, itemStateTone(activeItem.state))}
          </div>
          <div class="selected-item">
            <span class="selected-item-mark">${activeItem.mark}</span>
            <div>
              <small>${activeItem.typeLabel}</small>
              <strong>${activeItem.name}</strong>
              <span>数量 ${activeItem.count || 1}</span>
            </div>
          </div>
          <div class="ownership-chain">
            <div class="chain-node">
              <span>原所有者</span>
              <strong>${activeItem.owner || "无主"}</strong>
            </div>
            <div class="chain-arrow">${icon("arrow-down")}</div>
            <div class="chain-node current-holder">
              <span>当前持有者</span>
              <strong>${activeItem.heldBy || activeItem.owner || "古月砚"}</strong>
            </div>
            <div class="chain-arrow">${icon("arrow-down")}</div>
            <div class="chain-node ${
              activeItem.state === "stolen" || activeItem.state === "hidden"
                ? "chain-risk"
                : "chain-clear"
            }">
              <span>世界判定</span>
              <strong>${
                activeItem.state === "stolen"
                  ? "非法占有 · 可追查"
                  : activeItem.state === "hidden"
                    ? "来源隐藏 · 未清洗"
                    : "合法持有"
              }</strong>
            </div>
          </div>
          <button
            class="secondary-command full-command"
            type="button"
            data-action="inspect-ownership"
          >${icon("scan-search")} 查看追查来源</button>
        </section>

        <section class="equipment-sheet section-block">
          <div class="section-title">
            <span>${icon("shield")} 装备与法器</span>
            <small>防护 7 · 隐匿 3</small>
          </div>
          <div class="equipment-slots">
            <button type="button" data-action="inspect-equipment">
              <span>${icon("shirt")}</span>
              <strong>学堂短打</strong>
              <small>衣甲 · 普通</small>
            </button>
            <button type="button" data-action="inspect-equipment">
              <span>${icon("shield-half")}</span>
              <strong>旧皮护腕</strong>
              <small>防具 · 防护 +3</small>
            </button>
            <button type="button" data-action="inspect-equipment">
              <span>${icon("sword")}</span>
              <strong>拆信短刃</strong>
              <small>兵器 · 近战 +2</small>
            </button>
            <button class="is-empty" type="button" data-action="show-forging">
              <span>${icon("hammer")}</span>
              <strong>护身法器</strong>
              <small>空位 · 打开炼器</small>
            </button>
          </div>
          <div class="forging-preview">
            <span>${icon("anvil")} 炼器台</span>
            <strong>隐线袖囊</strong>
            <small>暮蝉蜕 0/2 · 青铜片 3/3 · 炼道理解 31/40</small>
          </div>
        </section>
      </div>
    </article>
  `;
}

function locationTone(state) {
  return {
    open: "good",
    current: "special",
    locked: "neutral",
    blocked: "danger",
    destroyed: "danger",
  }[state];
}

function renderMap(state) {
  const activeLocation =
    MAP_LOCATIONS.find(({ id }) => id === state.ui.activeLocationId) ??
    MAP_LOCATIONS.find(({ state: locationState }) => locationState === "current");
  const running = Boolean(state.ui.mapRunning);

  return `
    <article class="panel-page map-page" data-testid="panel-UI06">
      ${panelHeader({
        id: "UI06",
        eyebrow: "地点 / AP / 永久世界状态",
        title: "青茅山旅行图",
        summary: "旅行消耗行动点并推进时段；封锁、坍塌和毁灭会永久改变路线，不使用临时遮罩伪装可达性。",
        tools: `
          ${iconButton("locate-fixed", "回到当前位置", "locate-player")}
          ${iconButton("route", "切换路线显示", "toggle-routes")}
        `,
      })}
      <div class="map-layout panel-scroll">
        <section class="world-map section-block">
          <img
            class="map-background"
            src="/assets/game/environments/world-map.png"
            alt="青茅山区域地图"
          />
          <div class="map-shade" aria-hidden="true"></div>
          <div class="map-route route-a" aria-hidden="true"></div>
          ${MAP_LOCATIONS.map(
            (location) => `
              <button
                class="map-node state-${location.state} ${
                  activeLocation.id === location.id ? "is-selected" : ""
                }"
                style="left: ${location.x}%; top: ${location.y}%"
                type="button"
                data-action="select-location"
                data-location-id="${location.id}"
                title="${location.name}"
              >
                <span>${icon(
                  location.state === "locked"
                    ? "lock-keyhole"
                    : location.state === "current"
                      ? "map-pin-check"
                      : "map-pin"
                )}</span>
                <strong>${location.name}</strong>
              </button>
            `
          ).join("")}
          <div
            class="map-character player-map-character ${
              running ? "is-running" : ""
            }"
            style="left: ${running ? 42 : 29}%; top: ${running ? 56 : 45}%"
            data-testid="map-player"
          >
            <img src="${state.player.portrait}" alt="奔跑中的古月砚" />
            <span>${running ? "奔跑" : "当前位置"}</span>
          </div>
          <div class="map-character fang-map-character" style="left: 37%; top: 48%">
            <img src="${CHIBI_BASE}/chibi_fang_yuan.png" alt="方源" />
            <span>方源 · 未知路线</span>
          </div>
          <div class="map-legend">
            <span><i class="legend-open"></i>开放</span>
            <span><i class="legend-current"></i>当前</span>
            <span><i class="legend-locked"></i>锁定</span>
          </div>
        </section>

        <section class="travel-sheet section-block">
          <div class="section-title">
            <span>${icon("signpost")} 目的地</span>
            ${statusBadge(
              activeLocation.state === "current"
                ? "当前位置"
                : activeLocation.state === "locked"
                  ? "未开放"
                  : "可前往",
              locationTone(activeLocation.state)
            )}
          </div>
          <div class="destination-title">
            <small>${activeLocation.danger}</small>
            <strong>${activeLocation.name}</strong>
            <span>${activeLocation.ap} AP · 推进一个时段</span>
          </div>
          <div class="travel-facts">
            ${dataRow("天气", state.world.weather)}
            ${dataRow("危险", activeLocation.danger)}
            ${dataRow(
              "开放条件",
              activeLocation.condition ?? "已满足"
            )}
            ${dataRow("预计抵达", activeLocation.ap === 1 ? "戌初" : "亥初")}
          </div>
          <div class="travel-warning">
            ${icon(activeLocation.state === "locked" ? "lock-keyhole" : "footprints")}
            <p>${
              activeLocation.state === "locked"
                ? activeLocation.condition
                : "移动会消耗行动点；途中可能触发人物与危险事件。"
            }</p>
          </div>
          <button
            class="primary-command full-command"
            type="button"
            data-action="simulate-travel"
            ${
              activeLocation.state === "locked" ||
              activeLocation.state === "current"
                ? "disabled"
                : ""
            }
          >
            ${icon(running ? "pause" : "navigation")}
            ${running ? "停止移动演示" : "前往此处"}
          </button>
          <div class="run-readout">
            <span>${icon("gauge")} 主角动作</span>
            <strong>${running ? "run_side · 12 FPS" : "idle_side · 6 FPS"}</strong>
            <small>动画事件只在所有权转移帧结算一次</small>
          </div>
        </section>
      </div>
    </article>
  `;
}

function questStatusTone(status) {
  return {
    hinted: "warning",
    searching: "special",
    completed: "good",
    failed: "danger",
    expired: "danger",
    locked: "neutral",
  }[status];
}

function renderQuestLog(state) {
  const activeQuest =
    QUESTS.find(({ id }) => id === state.ui.activeQuestId) ?? QUESTS[0];
  const milestones = [
    { day: 1, label: "进入世界", state: "done" },
    { day: 3, label: "第一只蛊", state: "done" },
    { day: 8, label: "酒虫归属", state: "current" },
    { day: 10, label: "第一次归类", state: "future" },
    { day: 18, label: "商队", state: "future" },
    { day: 24, label: "调查", state: "future" },
    { day: 29, label: "回溯", state: "future" },
    { day: 30, label: "离山", state: "future" },
  ];

  return `
    <article class="panel-page quest-page" data-testid="panel-UI07">
      ${panelHeader({
        id: "UI07",
        eyebrow: "30 日时间轴 / 五条支线",
        title: "主线与机会窗口",
        summary: "失败与错过会进入补救分支，不会直接卡关；永久错过只用于改变后续局面与离山资源。",
        tools: `
          ${iconButton("calendar-days", "切换日历视图", "toggle-calendar")}
          ${iconButton("list-filter", "筛选任务状态", "filter-quests")}
        `,
      })}
      <div class="quest-layout panel-scroll">
        <section class="timeline-sheet section-block">
          <div class="section-title">
            <span>${icon("calendar-range")} 青茅山 30 日</span>
            <small>第 ${state.world.day} 日 / 30</small>
          </div>
          <div class="day-ruler">
            ${Array.from({ length: 30 }, (_, index) => {
              const day = index + 1;
              const milestone = milestones.find((item) => item.day === day);
              return `
                <span
                  class="day-tick ${
                    day < state.world.day
                      ? "is-past"
                      : day === state.world.day
                        ? "is-current"
                        : ""
                  } ${milestone ? "has-event" : ""}"
                  title="${milestone?.label ?? `第 ${day} 日`}"
                >
                  <i></i>
                  ${day % 5 === 0 || day === 1 ? `<b>${day}</b>` : ""}
                </span>
              `;
            }).join("")}
          </div>
          <div class="milestone-list">
            ${milestones
              .map(
                ({ day, label, state: milestoneState }) => `
                  <button
                    type="button"
                    class="milestone state-${milestoneState}"
                    data-action="inspect-day"
                    data-day="${day}"
                  >
                    <span>${String(day).padStart(2, "0")}</span>
                    <strong>${label}</strong>
                  </button>
                `
              )
              .join("")}
          </div>
        </section>

        <section class="quest-list-section section-block">
          <div class="section-title">
            <span>${icon("list-tree")} 任务线</span>
            <small>${QUESTS.length} 条</small>
          </div>
          <div class="quest-list">
            ${QUESTS.map(
              (quest) => `
                <button
                  class="quest-row ${
                    activeQuest.id === quest.id ? "is-selected" : ""
                  }"
                  type="button"
                  data-action="select-quest"
                  data-quest-id="${quest.id}"
                >
                  <span class="quest-code">${quest.id}</span>
                  <span>
                    <small>${quest.kind} · ${quest.window}</small>
                    <strong>${quest.title}</strong>
                    <i><b style="width: ${quest.progress}%"></b></i>
                  </span>
                  ${statusBadge(
                    quest.statusLabel,
                    questStatusTone(quest.status)
                  )}
                </button>
              `
            ).join("")}
          </div>
        </section>

        <section class="quest-detail section-block">
          <div class="section-title">
            <span>${icon("scroll-text")} ${activeQuest.id}</span>
            ${statusBadge(
              activeQuest.statusLabel,
              questStatusTone(activeQuest.status)
            )}
          </div>
          <div class="quest-detail-title">
            <small>${activeQuest.kind}</small>
            <strong>${activeQuest.title}</strong>
            <span>${activeQuest.window}</span>
          </div>
          ${meter({
            label: "当前推进",
            value: activeQuest.progress,
            tone: activeQuest.status === "searching" ? "cinnabar" : "brass",
            display: `${activeQuest.progress}%`,
          })}
          <div class="quest-next">
            <span>${icon("crosshair")} 下一步</span>
            <p>${activeQuest.next}</p>
          </div>
          <div class="quest-repair">
            <span>${icon("route")} 补救路线</span>
            <p>${activeQuest.repair}</p>
          </div>
          <button class="primary-command full-command" type="button" data-action="track-quest">
            ${icon("map-pin")} 设为当前追踪
          </button>
        </section>
      </div>
    </article>
  `;
}

function provenanceTone(provenance) {
  return {
    original: "neutral",
    verified: "good",
    inference: "warning",
    invalid: "danger",
  }[provenance];
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
          class="source-result ${
            active?.id === opportunity.id ? "is-selected" : ""
          }"
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
            ${statusBadge(
              opportunity.provenanceLabel,
              provenanceTone(opportunity.provenance)
            )}
            <b>${opportunity.feasibility}%</b>
          </span>
        </button>
      `
    )
    .join("");
}

export function renderSourceDetail(state) {
  const { active } = resolveSourceResults(state);

  if (!active) {
    return emptyState(
      "scan-search",
      "等待选择节点",
      "查询结果会在这里显示原归属、截胡方法与后果"
    );
  }

  return `
    <div class="source-detail-head">
      <div>
        <span>${active.horizonLabel} · ${active.typeLabel}</span>
        <h2>${active.title}</h2>
        <p>${active.summary}</p>
      </div>
      <div class="feasibility-score ${
        active.feasibility < 35 ? "is-low" : ""
      }">
        <span>截胡可行性</span>
        <strong>${active.feasibility}</strong>
        <small>/ 100</small>
      </div>
    </div>
    <div class="source-detail-grid">
      ${dataRow("原归属者", active.owner)}
      ${dataRow("时间窗口", active.window)}
      ${dataRow("发生地点", active.location)}
      ${dataRow("牵涉势力", active.faction)}
    </div>
    <div class="source-plan">
      <section>
        <span>${icon("route")} 截胡方法</span>
        <p>${active.method}</p>
      </section>
      <section>
        <span>${icon("gem")} 预计收益</span>
        <p>${active.reward}</p>
      </section>
      <section class="is-risk">
        <span>${icon("triangle-alert")} 世界后果</span>
        <p>${active.consequence}</p>
      </section>
    </div>
    <footer class="source-detail-footer">
      <div>
        ${statusBadge(
          active.provenanceLabel,
          provenanceTone(active.provenance)
        )}
        <span>${active.reachable ? "可转化为当前任务" : "超出当前地图 · 只读索引"}</span>
      </div>
      <button
        class="primary-command"
        type="button"
        data-action="convert-opportunity"
        ${active.reachable ? "" : "disabled"}
      >
        ${icon(active.reachable ? "crosshair" : "lock-keyhole")}
        ${active.reachable ? "建立截胡任务" : "保存未来索引"}
      </button>
    </footer>
  `;
}

function renderSourceQuery(state) {
  const { results } = resolveSourceResults(state);

  return `
    <article class="panel-page source-page" data-testid="panel-UI08">
      ${panelHeader({
        id: "UI08",
        eyebrow: "天外外挂 / 原文只读索引",
        title: "查询未来三年的原作机缘",
        summary: "查询会显示原归属、窗口、截胡方法和世界后果；被玩家改变的节点会从“原作记录”降级为“当前推演”。",
        tools: `
          <span class="sync-indicator">${icon("radio")} 同步率 ${state.generator.sourceSync}%</span>
          ${iconButton("bookmark", "查看已保存索引", "show-bookmarks")}
        `,
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
                >
                  <strong>${label}</strong>
                  <small>${note}</small>
                </button>
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
                >
                  ${icon(iconName)}
                  <span>${label}</span>
                </button>
              `
            ).join("")}
          </div>
          <div class="source-count">
            <span>${icon("database")} 索引结果</span>
            <strong data-source-count>${results.length}</strong>
          </div>
        </section>

        <section class="source-results section-block">
          <div class="section-title">
            <span>${icon("list-filter")} 匹配节点</span>
            <small>按可行动性排序</small>
          </div>
          <div class="source-result-list" data-source-results>
            ${renderSourceResults(state)}
          </div>
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

  return relation.portrait.replace(
    "_normal.png",
    `_${portraitState}.png`
  );
}

function renderRelationships(state) {
  const activeRelation =
    RELATIONSHIPS.find(({ id }) => id === state.ui.activeRelationId) ??
    RELATIONSHIPS[0];
  const supportsPortraitStates = activeRelation.portrait.includes("_normal.png");
  const portraitState = supportsPortraitStates
    ? state.ui.npcPortraitState ?? "normal"
    : "normal";
  const portraitLabels = [
    { id: "normal", label: "常态" },
    { id: "outerwear_missing", label: "外衣遗失" },
    { id: "privacy_layer_missing", label: "隐私层异常" },
  ];

  return `
    <article class="panel-page relations-page" data-testid="panel-UI09">
      ${panelHeader({
        id: "UI09",
        eyebrow: "信任 / 怀疑 / 杠杆",
        title: "人物关系与可接触状态",
        summary: "关系不是单一好感条；信任、怀疑、利益杠杆、生死与角色专属指标会分别改变事件入口。",
        tools: iconButton("users-round", "切换关系网络", "toggle-network"),
      })}
      <div class="relations-layout panel-scroll">
        <section class="relationship-list section-block">
          <div class="section-title">
            <span>${icon("contact")} 已识别人物</span>
            <small>${RELATIONSHIPS.length} 人</small>
          </div>
          <div class="relation-list">
            ${RELATIONSHIPS.map(
              (relation) => `
                <button
                  class="relation-row ${
                    activeRelation.id === relation.id ? "is-selected" : ""
                  }"
                  type="button"
                  data-action="select-relation"
                  data-relation-id="${relation.id}"
                >
                  <img src="${relation.portrait}" alt="" />
                  <span>
                    <small>${relation.role}</small>
                    <strong>${relation.name}</strong>
                    <em>${relation.metric}</em>
                  </span>
                  <b>${relation.trust}</b>
                </button>
              `
            ).join("")}
          </div>
        </section>

        <section class="relation-portrait section-block">
          <div class="portrait-frame state-${portraitState}">
            <img
              src="${relationPortraitPath(activeRelation, portraitState)}"
              alt="${escapeHtml(activeRelation.name)}角色立绘"
            />
            <div class="portrait-caption">
              <span>${activeRelation.status}</span>
              <strong>${activeRelation.name}</strong>
              <small>${activeRelation.role}</small>
            </div>
          </div>
          ${
            supportsPortraitStates
              ? `
                <div class="segmented-control portrait-preview-control">
                  ${portraitLabels
                    .map(
                      ({ id, label }) => `
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
                <p class="portrait-rule-note">${icon("info")} 立绘状态独立于地图 Q 版；Q 版始终使用正常服装静态图。</p>
              `
              : `
                <div class="q-static-note">
                  ${icon("badge-info")}
                  <span>地图 Q 版静态形象</span>
                  <strong>不跟随情绪或服装状态切换</strong>
                </div>
              `
          }
        </section>

        <section class="relation-detail section-block">
          <div class="section-title">
            <span>${icon("chart-spline")} 关系拆解</span>
            ${statusBadge(activeRelation.contact, "good")}
          </div>
          <div class="relation-meters">
            ${meter({
              label: "信任",
              value: activeRelation.trust,
              tone: "jade",
              display: `${activeRelation.trust}`,
            })}
            ${meter({
              label: "对你怀疑",
              value: activeRelation.suspicion,
              tone: "cinnabar",
              display: `${activeRelation.suspicion}`,
            })}
            ${meter({
              label: "利益杠杆",
              value: activeRelation.leverage,
              tone: "brass",
              display: `${activeRelation.leverage}`,
            })}
          </div>
          <div class="relation-facts">
            ${dataRow("生死状态", activeRelation.status)}
            ${dataRow("接触状态", activeRelation.contact)}
            ${dataRow("专属指标", activeRelation.metric)}
          </div>
          <div class="last-relation-event">
            <span>${icon("clock-3")} 最近变化</span>
            <p>${activeRelation.lastEvent}</p>
          </div>
          <div class="relation-actions">
            <button class="secondary-command" type="button" data-action="inspect-leverage">
              ${icon("key-round")} 查看筹码
            </button>
            <button class="primary-command" type="button" data-action="start-dialogue">
              ${icon("messages-square")} 安排接触
            </button>
          </div>
        </section>
      </div>
    </article>
  `;
}

function renderFangYuan(state) {
  const fang = state.fangYuan;

  return `
    <article class="panel-page fang-page" data-testid="panel-UI10">
      ${panelHeader({
        id: "UI10",
        eyebrow: "只显示已验证认知",
        title: "古月方源 · 观察卡",
        summary: "警觉是长期记录，不等于敌意；未知想法不会被伪造成可读数值，只有玩家验证过的事实进入面板。",
        tools: iconButton("scan-eye", "查看观察来源", "inspect-fang-sources"),
      })}
      <div class="fang-layout panel-scroll">
        <section class="fang-portrait section-block">
          <div class="fang-stage">
            <span class="fang-moon" aria-hidden="true">源</span>
            <img src="${CHIBI_BASE}/chibi_fang_yuan.png" alt="古月方源 Q 版角色" />
            <div class="gaze-line" aria-hidden="true"></div>
          </div>
          <div class="fang-identity">
            <span>古月旁支 · 同届</span>
            <strong>古月方源</strong>
            <small>当前可接触 · 位于洞口附近</small>
          </div>
          ${meter({
            label: "方源警觉",
            value: fang.alert,
            tone: "cinnabar",
            display: `${fang.alert} / 100`,
          })}
          <div class="alert-thresholds">
            <span class="is-past">注意 20</span>
            <span>试探 40</span>
            <span>反制 60</span>
            <span>敌对 80</span>
          </div>
        </section>

        <section class="fang-intent section-block">
          <div class="section-title">
            <span>${icon("crosshair")} 已知行动意图</span>
            ${statusBadge("有限认知", "warning")}
          </div>
          <div class="intent-block">
            <span>当前目标</span>
            <strong>${fang.currentGoal}</strong>
          </div>
          <div class="fang-facts">
            ${dataRow("对你的认知", fang.cognition)}
            ${dataRow("交易信用", fang.tradeCredit)}
            ${dataRow("当前关系", "竞争 · 可交易")}
          </div>
          <div class="intent-warning">
            ${icon("shield-question")}
            <p>观察卡不会显示“隐藏敌意”或未被验证的备用计划。方源可能已经改变行动，但系统只记录可证实结果。</p>
          </div>
        </section>

        <section class="verified-ledger section-block">
          <div class="section-title">
            <span>${icon("badge-check")} 已验证事实</span>
            <small>${fang.verifiedFacts.length} 条</small>
          </div>
          <ol class="verified-facts">
            ${fang.verifiedFacts
              .map(
                (fact, index) => `
                  <li>
                    <span>${String(index + 1).padStart(2, "0")}</span>
                    <p>${fact}</p>
                    ${icon("check")}
                  </li>
                `
              )
              .join("")}
          </ol>
          <div class="unknown-facts">
            ${Array.from({ length: fang.unknown }, (_, index) => `
              <div>
                ${icon("lock-keyhole")}
                <span>未知事实 ${index + 1}</span>
                <strong>需要观察、交易或盗念验证</strong>
              </div>
            `).join("")}
          </div>
          <button class="secondary-command full-command" type="button" data-action="plan-observation">
            ${icon("telescope")} 安排下一次观察
          </button>
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
      return renderMap(state);
    case "UI07":
      return renderQuestLog(state);
    case "UI08":
      return renderSourceQuery(state);
    case "UI09":
      return renderRelationships(state);
    case "UI10":
      return renderFangYuan(state);
    default:
      return "";
  }
}
