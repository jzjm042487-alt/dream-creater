export const locations = [
  {
    id: "academy",
    name: "学堂",
    description: "少年蛊师在这里听课、比斗、分配资源。排班和补贴记录都藏在不起眼的木柜里。",
    actions: ["study-at-academy", "steal-academy-roster"],
  },
  {
    id: "tavern",
    name: "酒馆",
    description: "酒气、商旅和传闻混在一起。你记得未来有一缕异香会改变修炼速度。",
    actions: ["investigate-wine-scent", "stakeout-wine-merchant", "steal-wine-worm"],
  },
  {
    id: "dorm",
    name: "住处",
    description: "简陋安全的休息处。适合整理赃物，也适合让今天的风声先过去。",
    actions: ["hide-wine-worm", "refine-wine-worm", "end-day"],
  },
];

export const actions = {
  "study-at-academy": {
    label: "在学堂修炼",
    location: "academy",
    cost: 1,
    type: "normal",
    description: "按部就班吸纳真元，收益稳定，也不会引起方源注意。",
  },
  "steal-academy-roster": {
    label: "偷取学堂排班",
    location: "academy",
    cost: 2,
    type: "theft",
    difficulty: 7,
    alertDelta: 6,
    description: "摸进木柜寻找排班记录。它能帮你判断蛊室和酒馆的安全窗口。",
  },
  "investigate-wine-scent": {
    label: "调查酒肆异香",
    location: "tavern",
    cost: 1,
    type: "memory",
    description: "用原著记忆比对酒馆传闻，尝试打开酒虫机缘线。",
  },
  "stakeout-wine-merchant": {
    label: "盯梢卖酒商贩",
    location: "tavern",
    cost: 1,
    type: "theft",
    difficulty: 6,
    alertDelta: 4,
    requires: "hasWineLead",
    description: "确认商贩藏酒、换岗和方源可能出现的窗口。",
  },
  "steal-wine-worm": {
    label: "截胡酒虫",
    location: "tavern",
    cost: 2,
    type: "theft",
    difficulty: 10,
    alertDelta: 24,
    requires: "hasMerchantWindow",
    description: "趁商贩松懈夺取酒虫。收益极高，但方源一定会察觉剧本被动过。",
  },
  "hide-wine-worm": {
    label: "藏匿酒虫",
    location: "dorm",
    cost: 1,
    type: "theft",
    description: "处理酒虫气息，再把它藏进住处夹层。",
  },
  "refine-wine-worm": {
    label: "炼化酒虫",
    location: "dorm",
    cost: 2,
    type: "cultivation",
    description: "在气息处理妥当后炼化酒虫，补足修炼速度。",
  },
  "end-day": {
    label: "结束当天",
    location: "dorm",
    cost: 0,
    type: "rest",
    description: "进入下一天。方源也会继续推进自己的计划。",
  },
};

export const memoryHints = [
  "未来的酒香不会主动等你。酒虫线索可能出现在酒馆，也可能先落入方源眼中。",
  "方源重生而来，他会优先寻找能加速修炼的东西。你必须比他更早、更安静。",
  "有些机缘不是拿到手才算偷走，让世界以为它本该属于你，也是一种盗。",
];
