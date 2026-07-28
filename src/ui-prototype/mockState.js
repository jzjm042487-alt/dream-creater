export const PORTRAIT_BASE = "/assets/game/portraits";
export const CHIBI_BASE = "/assets/game/characters/chibi";
export const ENVIRONMENT_BASE = "/assets/game/environments";

export const ROLL_CARDS = [
  {
    seed: "QM-008-7134",
    aptitude: "丙等一",
    aperture: "四成一",
    fate: "天外之魂",
    talents: ["酒虫亲和", "善藏气息"],
    flaw: "命薄福浅",
    background: "古月旁支 · 猎户遗孤",
    attributes: [
      { id: "root", label: "根骨", value: 48, tone: "neutral" },
      { id: "insight", label: "悟性", value: 76, tone: "good" },
      { id: "soul", label: "神魂", value: 58, tone: "neutral" },
      { id: "agility", label: "身法", value: 72, tone: "good" },
      { id: "charm", label: "魅力", value: 44, tone: "warning" },
      { id: "mind", label: "心性", value: 63, tone: "neutral" },
      { id: "luck", label: "气运", value: 55, tone: "neutral" },
      { id: "memory", label: "原著记忆", value: 88, tone: "special" },
      { id: "theft", label: "盗道天赋", value: 81, tone: "special" },
    ],
  },
  {
    seed: "QM-009-1182",
    aptitude: "乙等下",
    aperture: "六成一",
    fate: "盗门余脉",
    talents: ["袖里乾坤", "商道敏感"],
    flaw: "心性偏执",
    background: "古月旁支 · 商队旧识",
    attributes: [
      { id: "root", label: "根骨", value: 61, tone: "neutral" },
      { id: "insight", label: "悟性", value: 59, tone: "neutral" },
      { id: "soul", label: "神魂", value: 52, tone: "neutral" },
      { id: "agility", label: "身法", value: 83, tone: "good" },
      { id: "charm", label: "魅力", value: 68, tone: "good" },
      { id: "mind", label: "心性", value: 47, tone: "warning" },
      { id: "luck", label: "气运", value: 64, tone: "good" },
      { id: "memory", label: "原著记忆", value: 70, tone: "special" },
      { id: "theft", label: "盗道天赋", value: 92, tone: "special" },
    ],
  },
  {
    seed: "QM-010-5609",
    aptitude: "丁等",
    aperture: "三成二",
    fate: "空窍残缺",
    talents: ["早慧少年", "盗心澄明"],
    flaw: "真元稀薄",
    background: "古月旁支 · 无人问津",
    attributes: [
      { id: "root", label: "根骨", value: 36, tone: "danger" },
      { id: "insight", label: "悟性", value: 91, tone: "good" },
      { id: "soul", label: "神魂", value: 74, tone: "good" },
      { id: "agility", label: "身法", value: 65, tone: "neutral" },
      { id: "charm", label: "魅力", value: 41, tone: "warning" },
      { id: "mind", label: "心性", value: 82, tone: "good" },
      { id: "luck", label: "气运", value: 28, tone: "danger" },
      { id: "memory", label: "原著记忆", value: 96, tone: "special" },
      { id: "theft", label: "盗道天赋", value: 78, tone: "special" },
    ],
  },
];

export const GU_WORMS = [
  {
    id: "moonlight",
    name: "月光蛊",
    rank: "一转",
    path: "月道",
    state: "active",
    stateLabel: "已炼化",
    essence: 5,
    feed: "月兰花瓣",
    feeding: 74,
    nextFeed: "3 日",
    effect: "凝成月刃，对攻击范围内的目标造成伤害。",
    mark: "月",
  },
  {
    id: "wine-worm",
    name: "酒虫",
    rank: "一转",
    path: "食道",
    state: "wild",
    stateLabel: "待炼化",
    essence: 0,
    feed: "青竹酒",
    feeding: 42,
    nextFeed: "今夜",
    effect: "精炼一转真元，提升修炼效率。",
    mark: "酒",
  },
  {
    id: "hidden-breath",
    name: "匿息蛊",
    rank: "一转",
    path: "盗道",
    state: "hungry",
    stateLabel: "缺食",
    essence: 3,
    feed: "暮蝉蜕",
    feeding: 18,
    nextFeed: "1 日内",
    effect: "收束气息，提高潜行与偷盗成功率。",
    mark: "匿",
  },
  {
    id: "jade-skin",
    name: "玉皮蛊",
    rank: "一转",
    path: "防道",
    state: "dormant",
    stateLabel: "未炼化",
    essence: 4,
    feed: "青玉粉",
    feeding: 0,
    nextFeed: "炼化后",
    effect: "强化皮肤，降低近战伤害。",
    mark: "玉",
  },
];

export const INVENTORY_ITEMS = [
  {
    id: "primeval-stone",
    name: "元石",
    type: "resource",
    typeLabel: "资源",
    count: 18,
    state: "normal",
    mark: "石",
    detail: "修炼、炼蛊与交易的通用资源。",
  },
  {
    id: "bamboo-wine",
    name: "青竹酒",
    type: "consumable",
    typeLabel: "消耗品",
    count: 2,
    state: "normal",
    mark: "酒",
    detail: "酒虫喜爱的食料，也可在酒肆交易。",
  },
  {
    id: "old-key",
    name: "旧屋铜钥",
    type: "key",
    typeLabel: "钥匙",
    count: 1,
    state: "normal",
    mark: "钥",
    detail: "可开启旁支旧屋与后院小库。",
  },
  {
    id: "academy-token",
    name: "蛊室令牌",
    type: "key",
    typeLabel: "令牌",
    count: 1,
    state: "normal",
    mark: "令",
    detail: "进入学堂蛊室的身份凭证。",
  },
  {
    id: "moon-orchid",
    name: "月兰花瓣",
    type: "material",
    typeLabel: "蛊材",
    count: 6,
    state: "normal",
    mark: "兰",
    detail: "月光蛊食料，也可用于低阶炼器。",
  },
  {
    id: "bronze-fragment",
    name: "青铜碎片",
    type: "material",
    typeLabel: "炼材",
    count: 3,
    state: "normal",
    mark: "铜",
    detail: "打造护腕与袖囊的基础材料。",
  },
  {
    id: "healing-paste",
    name: "止血膏",
    type: "consumable",
    typeLabel: "消耗品",
    count: 1,
    state: "normal",
    mark: "药",
    detail: "战斗后恢复少量生命。",
  },
  {
    id: "empty-slot",
    name: "空位",
    type: "empty",
    typeLabel: "空",
    count: 0,
    state: "empty",
    mark: "+",
    detail: "",
  },
];

export const WILDERNESS_NODES = {
  "bamboo-entry": {
    id: "bamboo-entry",
    name: "竹林入口",
    scene: "forest-battle",
    description: "雾从竹根间漫上来，四条小径都没有路牌。",
    event: "前方传来极淡的酒香。",
    exits: {
      forward: "mist-slope",
      back: "old-road",
      left: "stream-bank",
      right: "stone-cleft",
    },
  },
  "mist-slope": {
    id: "mist-slope",
    name: "雾坡",
    scene: "forest-battle",
    description: "坡上视线极短，脚印在湿泥里断断续续。",
    event: "可能遭遇野兽，也可能找到近路。",
    exits: {
      forward: "wine-cave",
      back: "bamboo-entry",
      left: "stone-cleft",
      right: "stream-bank",
    },
  },
  "old-road": {
    id: "old-road",
    name: "猎户旧道",
    scene: "world-map",
    description: "废弃猎道通向山寨，沿途能看见旧营火。",
    event: "返回安全区域，途中仍会经过随机事件。",
    exits: {
      forward: "bamboo-entry",
      back: "village-edge",
      left: "stream-bank",
      right: "stone-cleft",
    },
  },
  "stream-bank": {
    id: "stream-bank",
    name: "青溪浅滩",
    scene: "forest-battle",
    description: "溪水掩去足迹，岸边散着新折的竹叶。",
    event: "发现一份可采集的蛊材。",
    exits: {
      forward: "stone-cleft",
      back: "bamboo-entry",
      left: "old-road",
      right: "wine-cave",
    },
  },
  "stone-cleft": {
    id: "stone-cleft",
    name: "裂石窄径",
    scene: "forest-battle",
    description: "仅容一人侧身通过，尽头有虫鸣。",
    event: "此处容易触发近距离战斗。",
    exits: {
      forward: "wine-cave",
      back: "bamboo-entry",
      left: "stream-bank",
      right: "mist-slope",
    },
  },
  "wine-cave": {
    id: "wine-cave",
    name: "花酒行者洞口",
    scene: "forest-battle",
    description: "酒香从石缝中涌出，洞口附近已经有人。",
    event: "古月方源正在寻找酒虫。",
    exits: {
      forward: "stone-cleft",
      back: "mist-slope",
      left: "stream-bank",
      right: "bamboo-entry",
    },
  },
  "village-edge": {
    id: "village-edge",
    name: "山寨边门",
    scene: "village",
    description: "灯火与巡夜人的脚步都近在眼前。",
    event: "可返回山寨休整。",
    exits: {
      forward: "old-road",
      back: "bamboo-entry",
      left: "stream-bank",
      right: "stone-cleft",
    },
  },
};

export const TOWN_INTERACTABLES = [
  {
    id: "tavern",
    name: "醉仙楼",
    kind: "place",
    x: 20,
    y: 48,
    radius: 11,
    icon: "wine",
  },
  {
    id: "academy",
    name: "古月学堂",
    kind: "place",
    x: 58,
    y: 24,
    radius: 11,
    icon: "landmark",
  },
  {
    id: "dorm",
    name: "弟子住处",
    kind: "place",
    x: 77,
    y: 71,
    radius: 11,
    icon: "house",
  },
  {
    id: "village-gate",
    name: "山寨外道",
    kind: "place",
    x: 90,
    y: 21,
    radius: 11,
    icon: "door-open",
  },
  {
    id: "market-stall",
    name: "市集摊位",
    kind: "object",
    x: 31,
    y: 59,
    radius: 9,
    icon: "store",
  },
  {
    id: "fang-yuan",
    name: "古月方源",
    kind: "npc",
    x: 54,
    y: 51,
    radius: 18,
    portrait: `${CHIBI_BASE}/chibi_fang_yuan.png`,
  },
];

export const TOWN_COLLISION_OBSTACLES = [
  { id: "northwest-cliffs", x1: 0, y1: 0, x2: 31, y2: 21 },
  { id: "tavern-building", x1: 0, y1: 22, x2: 32, y2: 47 },
  { id: "academy-building", x1: 47, y1: 2, x2: 69, y2: 21 },
  { id: "central-compound", x1: 47, y1: 29, x2: 80, y2: 47 },
  { id: "dorm-building", x1: 65, y1: 48, x2: 90, y2: 68 },
  { id: "west-stream", x1: 0, y1: 56, x2: 25, y2: 68 },
  { id: "southwest-bamboo", x1: 0, y1: 68, x2: 37, y2: 100 },
  { id: "southeast-cliffs", x1: 61, y1: 79, x2: 100, y2: 100 },
];

export function isTownPositionWalkable(position) {
  const footprint = { x: 1.25, y: 1.8 };
  const insideBounds =
    position.x - footprint.x >= 4 &&
    position.x + footprint.x <= 96 &&
    position.y - footprint.y >= 8 &&
    position.y + footprint.y <= 92;

  if (!insideBounds) {
    return false;
  }

  return !TOWN_COLLISION_OBSTACLES.some(
    ({ x1, y1, x2, y2 }) =>
      position.x + footprint.x > x1 &&
      position.x - footprint.x < x2 &&
      position.y + footprint.y > y1 &&
      position.y - footprint.y < y2
  );
}

export function moveTownPosition(position, direction, step = 4) {
  const delta = {
    up: { x: 0, y: -step },
    down: { x: 0, y: step },
    left: { x: -step, y: 0 },
    right: { x: step, y: 0 },
  }[direction] ?? { x: 0, y: 0 };

  const candidate = {
    x: position.x + delta.x,
    y: position.y + delta.y,
  };

  return isTownPositionWalkable(candidate) ? candidate : { ...position };
}

export function findNearbyTownTarget(position) {
  return (
    TOWN_INTERACTABLES.map((target) => ({
      target,
      distance: Math.hypot(target.x - position.x, target.y - position.y),
    }))
      .filter(({ target, distance }) => distance <= target.radius)
      .sort((a, b) => a.distance - b.distance)[0]?.target ?? null
  );
}

export const QUESTS = [
  {
    id: "Q01",
    title: "酒虫归属",
    kind: "主线机缘",
    status: "active",
    statusLabel: "进行中",
    step: "进入洞口，决定如何取得酒虫。",
    next: "沿流程完成洞口事件。",
  },
  {
    id: "Q02",
    title: "商队南行",
    kind: "人物支线",
    status: "available",
    statusLabel: "可接取",
    step: "商队抵达后，与领队交谈。",
    next: "等待商队进入青茅山。",
  },
  {
    id: "Q03",
    title: "贾金生之死",
    kind: "世界事件",
    status: "future",
    statusLabel: "未发生",
    step: "事件会按角色行动自然发生。",
    next: "无需提前准备。",
  },
  {
    id: "Q04",
    title: "青书生路",
    kind: "人物事件",
    status: "future",
    statusLabel: "未发生",
    step: "狼潮出现后可直接介入。",
    next: "继续推进时间。",
  },
  {
    id: "Q05",
    title: "白凝冰的兴致",
    kind: "天骄事件",
    status: "future",
    statusLabel: "未相遇",
    step: "在白家寨附近行动时触发。",
    next: "离山后前往白家地界。",
  },
];

export const SOURCE_OPPORTUNITIES = [
  {
    id: "wine-worm",
    title: "酒虫与花酒行者遗藏",
    subject: "古月方源",
    horizon: "current",
    horizonLabel: "今年",
    type: "gu",
    typeLabel: "蛊虫",
    owner: "原作中由方源取得",
    window: "第 3-8 日",
    location: "青茅山 · 花酒行者洞口",
    faction: "无主机缘",
    provenance: "original",
    provenanceLabel: "原作记录",
    reachable: true,
    method: "携带青竹酒进入洞口，可直接争夺、交易或偷取。",
    reward: "酒虫与花酒传承入口。",
    consequence: "取得后世界继续自由演化，方源会改用其他成长路线。",
    summary: "方源原本会在洞中取得酒虫，并由此发现花酒行者遗藏。",
    tags: ["方源", "酒虫", "花酒行者", "青竹酒"],
  },
  {
    id: "white-boar-gu",
    title: "白豕蛊调拨窗口",
    subject: "古月漠北",
    horizon: "current",
    horizonLabel: "今年",
    type: "gu",
    typeLabel: "蛊虫",
    owner: "家族蛊室",
    window: "第 11-16 日",
    location: "古月山寨 · 蛊室",
    faction: "古月一族",
    provenance: "original",
    provenanceLabel: "原作记录",
    reachable: true,
    method: "趁库存调拨时以功绩换取，也可在持有者身边尝试偷盗。",
    reward: "白豕蛊，一猪之力。",
    consequence: "其他同届会转而争夺替代蛊虫。",
    summary: "族中竞争会制造短暂的库存调拨窗口。",
    tags: ["白豕蛊", "蛊室", "力道", "古月漠北"],
  },
  {
    id: "shang-xin-ci-caravan",
    title: "商心慈南下商队",
    subject: "商心慈",
    horizon: "one-year",
    horizonLabel: "未来一年",
    type: "character",
    typeLabel: "人物",
    owner: "商心慈",
    window: "离山后第 4-7 月",
    location: "南疆商路",
    faction: "商家",
    provenance: "original",
    provenanceLabel: "原作记录",
    reachable: false,
    method: "记下南下路线，离山后自行寻找商队。",
    reward: "商家入口与长期商路。",
    consequence: "玩家的选择可能让商队改道或提前离开。",
    summary: "南下商队是离山后的重要人物与贸易节点。",
    tags: ["商心慈", "商队", "南疆", "商家"],
  },
  {
    id: "bai-ning-bing-awakening",
    title: "白凝冰的十绝体终局",
    subject: "白凝冰",
    horizon: "three-years",
    horizonLabel: "未来三年",
    type: "character",
    typeLabel: "人物",
    owner: "白凝冰",
    window: "狼潮前后",
    location: "白家寨 / 青茅山",
    faction: "白家",
    provenance: "original",
    provenanceLabel: "原作记录",
    reachable: false,
    method: "提前接触白凝冰，战斗、合作或截取冰道资源。",
    reward: "冰道资源、十绝体情报与强敌路线。",
    consequence: "白凝冰可能死亡、结盟或走向完全不同的未来。",
    summary: "北冥冰魄体的自爆压力支配着白凝冰早期的选择。",
    tags: ["白凝冰", "十绝体", "白家", "狼潮"],
  },
  {
    id: "three-kings-inheritance",
    title: "三王传承开启",
    subject: "三王传承",
    horizon: "three-years",
    horizonLabel: "未来三年",
    type: "inheritance",
    typeLabel: "传承",
    owner: "无主传承",
    window: "离山后约三年",
    location: "三叉山",
    faction: "南疆群雄",
    provenance: "original",
    provenanceLabel: "原作记录",
    reachable: false,
    method: "保留时间与地点索引，届时自行争夺。",
    reward: "奴道、炼道与犬王传承机缘。",
    consequence: "参与者会因当前世界状态而变化。",
    summary: "远期大型传承，可作为离山后的成长目标。",
    tags: ["三王传承", "三叉山", "传承", "南疆"],
  },
];

export const RELATION_GROUPS = {
  blood: [
    {
      id: "fang-yuan",
      name: "古月方源",
      relation: "同族旁支",
      status: "在世",
      note: "同届族人，当前正在争夺酒虫。",
      portrait: `${CHIBI_BASE}/chibi_fang_yuan.png`,
    },
    {
      id: "fang-zheng",
      name: "古月方正",
      relation: "同族旁支",
      status: "在世",
      note: "甲等资质，被家族重点培养。",
      portrait: `${CHIBI_BASE}/chibi_npc_clan_steward.png`,
    },
    {
      id: "clan-steward",
      name: "古月兰心",
      relation: "族中长辈",
      status: "在世",
      note: "负责旁支名册与学堂事务。",
      portrait: `${PORTRAIT_BASE}/portrait_npc_clan_steward_normal.png`,
    },
  ],
  social: [
    {
      id: "tavern-keeper",
      name: "青竹娘",
      relation: "酒肆掌柜",
      status: "可交谈",
      note: "熟悉山寨流言与酒类货源。",
      portrait: `${PORTRAIT_BASE}/portrait_npc_tavern_keeper_normal.png`,
    },
    {
      id: "caravan-manager",
      name: "禾娘",
      relation: "商队旧识",
      status: "将抵达",
      note: "离山与南下商路的重要联系人。",
      portrait: `${PORTRAIT_BASE}/portrait_npc_caravan_manager_normal.png`,
    },
    {
      id: "medicine-physician",
      name: "药婆",
      relation: "医者",
      status: "可拜访",
      note: "出售伤药，也收购稀有蛊材。",
      portrait: `${PORTRAIT_BASE}/portrait_npc_medicine_physician_normal.png`,
    },
  ],
};

export const RIVALS = [
  {
    id: "fang-yuan",
    name: "古月方源",
    realm: "一转初阶",
    gu: "月光蛊",
    status: "active",
    statusLabel: "活跃",
    relation: "同族竞争者",
    record: "正在争夺花酒行者遗藏，可交战并击杀。",
    portrait: `${CHIBI_BASE}/chibi_fang_yuan.png`,
  },
  {
    id: "fang-zheng",
    name: "古月方正",
    realm: "一转初阶",
    gu: "月光蛊",
    status: "active",
    statusLabel: "活跃",
    relation: "同届天骄",
    record: "甲等资质，修行速度极快。",
    portrait: `${CHIBI_BASE}/chibi_npc_clan_steward.png`,
  },
  {
    id: "mo-bei",
    name: "古月漠北",
    realm: "一转初阶",
    gu: "月光蛊",
    status: "active",
    statusLabel: "活跃",
    relation: "漠脉竞争者",
    record: "争夺学堂功绩与家族资源。",
    portrait: `${CHIBI_BASE}/chibi_npc_caravan_manager.png`,
  },
  {
    id: "chi-cheng",
    name: "古月赤城",
    realm: "一转初阶",
    gu: "月光蛊",
    status: "injured",
    statusLabel: "轻伤",
    relation: "赤脉竞争者",
    record: "有家族资源扶持，近日训练受伤。",
    portrait: `${CHIBI_BASE}/chibi_npc_clan_steward.png`,
  },
  {
    id: "bai-ning-bing",
    name: "白凝冰",
    realm: "三转",
    gu: "冰刃蛊",
    status: "active",
    statusLabel: "活跃",
    relation: "远期强敌",
    record: "尚未正式相遇，原文显示其活动于白家寨。",
    portrait: `${CHIBI_BASE}/chibi_fang_yuan.png`,
  },
  {
    id: "qing-shu",
    name: "古月青书",
    realm: "二转巅峰",
    gu: "木魅蛊",
    status: "active",
    statusLabel: "活跃",
    relation: "家族前辈",
    record: "当前负责带领新人执行任务。",
    portrait: `${CHIBI_BASE}/chibi_player.png`,
  },
];

export const THEFT_TARGETS = [
  {
    id: "fang-yuan",
    name: "古月方源",
    realm: "一转初阶",
    level: 1,
    portrait: `${CHIBI_BASE}/chibi_fang_yuan.png`,
    items: [
      { id: "fang-stones", name: "元石袋", description: "约有 6 枚元石" },
      { id: "bamboo-flask", name: "青竹酒壶", description: "洞口事件用品" },
      { id: "moon-petal", name: "月兰花瓣", description: "月光蛊食料" },
    ],
  },
  {
    id: "clan-steward",
    name: "古月兰心",
    realm: "二转初阶",
    level: 2,
    portrait: `${PORTRAIT_BASE}/portrait_npc_clan_steward_normal.png`,
    items: [
      { id: "store-key", name: "蛊室侧门钥匙", description: "可开启侧门" },
      { id: "steward-stones", name: "元石袋", description: "约有 18 枚元石" },
    ],
  },
];

export function calculateTheftChance({ luck, theft, levelGap }) {
  const chance = 25 + theft * 0.6 + (luck - 50) * 0.3 + levelGap * 8;
  return Math.max(5, Math.min(95, Math.round(chance)));
}

export const DIALOGUE_CHOICES = [
  {
    id: "offer",
    label: "把一坛青竹酒推给他",
    response: "方源接过酒坛，目光却仍停在洞口。",
  },
  {
    id: "question",
    label: "问他是否也闻到了酒香",
    response: "“闻到了。”他答得很快，显然不打算多说。",
  },
  {
    id: "leave",
    label: "侧身让路，观察他的选择",
    response: "方源没有客气，越过你走向石缝。",
  },
];

export const DAY_END_ACTIONS = [
  {
    id: "rest",
    title: "休息",
    icon: "bed",
    gain: "恢复生命与真元",
    detail: "安稳睡到次日，补满行动点。",
  },
  {
    id: "cultivate",
    title: "打坐修炼",
    icon: "sparkles",
    gain: "修为进度 +8",
    detail: "可选补充成长，不是升级的必经路线。",
  },
  {
    id: "feed",
    title: "照料蛊虫",
    icon: "bug",
    gain: "补充选定蛊虫饱食度",
    detail: "消耗对应食料，维持蛊虫状态。",
  },
  {
    id: "forge",
    title: "炼制装备",
    icon: "hammer",
    gain: "推进一件炼器配方",
    detail: "消耗材料，打造防具、兵器或法器。",
  },
];

export const ENDING_ROUTES = [
  {
    id: "clan",
    code: "E01",
    title: "随家族撤离",
    description: "加入古月一族的撤离队伍。",
    carry: "家族身份、现有蛊虫与同行族人。",
    scene: "village",
  },
  {
    id: "merchant",
    code: "E02",
    title: "随商队南下",
    description: "搭上南下商路，进入商家势力范围。",
    carry: "商路见闻、现有装备与商队联系人。",
    scene: "world-map",
  },
  {
    id: "hunter",
    code: "E03",
    title: "穿越荒野",
    description: "从猎户旧道独自翻越山岭。",
    carry: "全部随身物品与自由身份。",
    scene: "forest-battle",
  },
  {
    id: "bai",
    code: "E04",
    title: "前往白家寨",
    description: "主动寻找白凝冰与冰道资源。",
    carry: "白家寨索引与一条高强度竞争路线。",
    scene: "world-map",
  },
  {
    id: "fang",
    code: "E05",
    title: "追杀方源",
    description: "把方源视为当前目标，沿其逃离方向追击。",
    carry: "方源行踪与一场可致死的遭遇战。",
    scene: "forest-battle",
  },
  {
    id: "solo",
    code: "E06",
    title: "自择去处",
    description: "不依附任何势力，自由选择下一片区域。",
    carry: "全部物品、蛊虫与未完成的人物缘分。",
    scene: "world-map",
  },
];

export const DEMO_STATE = {
  ui: {
    selectedPanel: "UI08",
    rollIndex: 0,
    activeGuId: "wine-worm",
    inventoryFilter: "all",
    activeItemId: "primeval-stone",
    activeQuestId: "Q01",
    queryHorizon: "current",
    queryType: "all",
    queryText: "",
    activeOpportunityId: "wine-worm",
    relationGroup: "blood",
    activeRelationId: "fang-yuan",
    activeRivalId: "fang-yuan",
    activeDialogueChoice: "",
    dialogueLine: "酒香不是从洞里出来的。是有人想让它进去。",
    travelNodeId: "wine-cave",
    travelHistory: [],
    travelMoving: false,
    townPosition: { x: 44, y: 56 },
    townMoveFrom: { x: 44, y: 56 },
    townFacing: "up",
    townMoving: false,
    townBlocked: false,
    townAction: "idle",
    townEmotion: "alert",
    theftOpen: false,
    theftTargetId: "fang-yuan",
    theftItemId: "fang-stones",
    theftResult: "",
    acquiredItems: [],
    battleAction: "",
    dayEndAction: "rest",
    endingRoute: "merchant",
    generatorStage: "ready",
  },
  world: {
    chapter: "青茅山篇",
    act: 2,
    actLabel: "第二章 · 截胡者",
    day: 8,
    time: "酉初",
    location: "花酒行者洞口",
    weather: "山雾渐浓",
  },
  player: {
    name: "古月砚",
    title: "旁支少年 · 天外之魂",
    portrait: `${CHIBI_BASE}/chibi_player.png`,
    rank: "一转初阶",
    level: 1,
    aperture: "丙等一",
    health: { current: 84, max: 100 },
    essence: { current: 31, max: 47 },
    ap: { current: 2, max: 3 },
    stones: 18,
    merit: 16,
    cultivation: 43,
    combatExperience: 62,
    theftRank: "梁上手",
    theftMastery: 68,
    attributes: ROLL_CARDS[0].attributes,
    buffs: [
      {
        id: "source-flash",
        name: "原著灵光",
        layer: "增益",
        effect: "本次原文查询可见更完整的地点线索。",
        tone: "good",
      },
      {
        id: "hidden-breath",
        name: "匿息",
        layer: "增益",
        effect: "本次偷盗成功率提高。",
        tone: "good",
      },
      {
        id: "gu-hunger",
        name: "蛊虫饥饿",
        layer: "减益",
        effect: "匿息蛊效果减半，投喂后解除。",
        tone: "warning",
      },
      {
        id: "light-wound",
        name: "左臂轻伤",
        layer: "减益",
        effect: "近战伤害略低，休息或用药后解除。",
        tone: "danger",
      },
    ],
  },
  generator: {
    sourceFile: "蛊真人.txt",
    mode: "自由世界",
    identity: "古月旁支",
    queryDepth: "未来三年",
    rules: 100,
    characters: 100,
    factions: 100,
    opportunities: 100,
    warnings: [
      "原文只提供世界设定与未来情报，不约束玩家选择。",
      "任何角色都可能因战斗死亡，世界不会自动恢复原轨。",
      "玩家改变机缘后，后续人物会按当前局面自由行动。",
    ],
  },
};

const HORIZON_RANK = {
  current: 0,
  "one-year": 1,
  "three-years": 2,
};

export function filterSourceOpportunities(
  opportunities,
  { horizon = "current", type = "all", query = "" } = {}
) {
  const selectedRank = HORIZON_RANK[horizon] ?? 0;
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");

  return opportunities.filter((opportunity) => {
    const horizonMatches =
      HORIZON_RANK[opportunity.horizon] <= selectedRank;
    const typeMatches = type === "all" || opportunity.type === type;
    const searchableText = [
      opportunity.title,
      opportunity.subject,
      opportunity.location,
      opportunity.faction,
      opportunity.owner,
      opportunity.summary,
      ...opportunity.tags,
    ]
      .join(" ")
      .toLocaleLowerCase("zh-CN");

    return (
      horizonMatches &&
      typeMatches &&
      (!normalizedQuery || searchableText.includes(normalizedQuery))
    );
  });
}
