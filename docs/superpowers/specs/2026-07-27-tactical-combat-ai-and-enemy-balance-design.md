# 青茅山 MVP 战术战斗 AI 与敌人平衡设计

## 1. 文档地位

本文是青茅山精简 MVP 的敌方战斗决策、难度差异、敌人模板、数值验收和
第三方依赖契约。

上位规则仍是
`docs/superpowers/specs/2026-07-27-qing-mao-simplified-mvp-design.md`。
本文只细化其 `8 x 6` 战斗，不改变以下既定规则：

- 玩家每回合最多移动一次并执行一个动作。
- 默认 `1v1`，少量事件使用 `1v2`。
- 没有行动点池、反应动作、待机反击或中断条件。
- 合法射程内必定命中，不增加命中随机。
- 玩家始终拥有普通肉搏。
- 战斗允许胜利、失败或从边缘撤退。

发生冲突时按以下顺序处理：

1. 上位规则决定产品范围和基础战斗规则。
2. 本文决定敌方 AI、难度和敌人平衡。
3. 具体战斗内容只能在上述范围内配置敌人、棋盘和奖励。

## 2. 设计目标

### 2.1 玩家体验

敌人需要让玩家感到它在观察距离、技能射程、真元、障碍和同伴位置，而
不是只会沿直线贴近。不同敌人应通过相同规则表现出不同战斗习惯。

难度的作用是改变敌人如何思考，不是暗中提高属性。玩家在低难度仍能看见
完整机制，在高难度则需要更认真地使用走位、蛊虫搭配和防御。

### 2.2 工程目标

- 合法动作、状态模拟、评价和决策相互分离。
- 同一战斗状态、难度、随机种子和游标必须得到同一结果。
- AI 只通过正式战斗动作修改状态。
- 新敌人优先通过数据模板接入，不复制一套专属 AI。
- `8 x 6`、最多两个敌人的 MVP 棋盘上不出现可感知卡顿。
- 复用成熟的行为树、寻路和性质测试库，游戏规则仍由项目自己持有。

### 2.3 非目标

本次不实现：

- 机器学习、在线训练或大语言模型决策。
- 实时制导航、转向行为、群集移动或三维导航网格。
- 战争迷雾、隐藏仇恨值或全队职业编成。
- 三名及以上敌人的通用协同搜索。
- 动态难度暗改、敌人属性作弊或奖励惩罚。
- 读取玩家尚未公开的蛊虫、道具或未来随机结果。
- 为单个剧情角色编写绕过统一规则的硬编码脚本。

## 3. 依赖决策

### 3.1 固定组合

工程实施时使用以下精确版本，不使用范围符号：

| 包 | 版本 | 依赖类型 | 唯一职责 | 许可证 |
| --- | --- | --- | --- | --- |
| `mistreevous` | `4.3.1` | runtime | 行为树执行、敌人模式与首领阶段选择 | MIT |
| `easystarjs` | `0.4.4` | runtime | 正交网格最短路径与不可达判定 | MIT |
| `fast-check` | `4.9.0` | dev | 战斗状态和 AI 决策的性质测试、模糊测试 | MIT |

实施时必须：

1. 将版本精确写入 `package.json`。
2. 提交同步生成的 `package-lock.json`。
3. 在第三方许可证清单中保留包名、版本、许可证和仓库地址。
4. 若精确版本无法安装，停止实施并回到本规格评审，不得静默替换库。

官方仓库：

- `mistreevous`：<https://github.com/nikkorn/mistreevous>
- `easystarjs`：<https://github.com/prettymuchbryce/easystarjs>
- `fast-check`：<https://github.com/dubzzz/fast-check>

### 3.2 明确不引入

- 不安装 `boardgame.io`。其 MCTS 代码只作为搜索组织方式的参考；完整框架会
  重复项目现有的回合、状态和存档职责。
- 不安装 `yuka`。它面向实时和三维游戏 AI，本项目不需要转向、导航网格和
  实体组件框架。
- 不安装第二套寻路库。
- 不把行为树当作战斗规则引擎，也不让第三方库直接修改持久状态。

### 3.3 依赖边界

`mistreevous` 只回答“本单位当前采用什么意图”，例如进攻、拉开距离、
自保或首领阶段切换。它不负责：

- 生成合法格子。
- 计算伤害。
- 扣除真元。
- 决定胜负。
- 直接调用 Phaser 场景。

`easystarjs` 只回答“两个合法格之间是否可达以及最短距离是多少”。它不
负责决定目标、评估危险格或选择技能。

`fast-check` 不进入生产包，不参与玩家运行时。

## 4. 总体架构

```text
BattleTurnController
  -> createAiSnapshot
  -> BehaviorPolicyAdapter (mistreevous)
  -> enumerateLegalTurnPlans
       -> PathfinderAdapter (easystarjs)
  -> simulateTurnPlan
  -> evaluateBattleState
  -> searchAndChoose
  -> commitBattleAction
  -> persistBattleState
```

每个模块只有一个职责：

| 模块 | 输入 | 输出 | 禁止事项 |
| --- | --- | --- | --- |
| `createAiSnapshot` | 当前战斗状态、行动单位 ID | 只读决策快照 | 不得推进随机游标 |
| `BehaviorPolicyAdapter` | 快照、AI 模板 | 当前意图 | 不得执行动作或过滤合法候选 |
| `PathfinderAdapter` | 棋盘、起点、终点 | 可达性、距离、规范路径 | 不得评价战术 |
| `enumerateLegalTurnPlans` | 快照、行动单位、意图 | 完整合法候选 | 不得修改快照 |
| `simulateTurnPlan` | 快照、候选 | 新快照、结算摘要 | 不得写持久存档 |
| `evaluateBattleState` | 完整评价上下文 | 整数效用分 | 不得使用隐藏信息 |
| `searchAndChoose` | 有序候选、难度 | 唯一候选与决策记录 | 不得按运行耗时截断 |
| `commitBattleAction` | 真实状态、已选候选 | 正式状态增量 | 必须复用玩家同类规则 |

Phaser 场景只展示正式提交后的结果。AI 核心不能读取 DOM、动画状态、墙钟
时间或帧率。

## 5. 固定 ID

以下 ID 是本规格的唯一正式值，后续内容和工程不得自创同义 ID。

### 5.1 难度

| ID | 显示名 |
| --- | --- |
| `ai_difficulty_beginner` | 入门 |
| `ai_difficulty_standard` | 标准 |
| `ai_difficulty_hard` | 困难 |
| `ai_difficulty_prodigy` | 天骄 |

默认值是 `ai_difficulty_standard`。

### 5.2 AI 模板

| ID | 用途 |
| --- | --- |
| `ai_profile_melee_pursuer` | 稳定接近后近战，供木傀和普通野兽使用 |
| `ai_profile_charger` | 优先制造直线或短距突进，供电狼使用 |
| `ai_profile_ranged_skirmisher` | 保持有效射程并规避贴身，供远程蛊师和叶蛾使用 |
| `ai_profile_guardian` | 看重生存、阻路和防御，供地甲虫与石皮傀儡使用 |
| `ai_profile_duelist` | 平衡伤害、走位、真元和收割，供同窗与普通蛊师使用 |
| `ai_profile_pack_hunter` | 两个单位分侧施压并避免无效堵路，只用于 `1v2` |
| `ai_profile_boss_hunter` | 使用阶段规则、蓄势和收割，供百兽王使用 |

### 5.3 内部枚举与平衡金样

行为意图固定为：

```text
finish, attack, reposition, defend, conserve, phase_action
```

持久动作类别固定为：

```text
damage, control, defend, reposition, pass
```

平衡参考构筑固定为：

```text
reference_minimum, reference_balanced, reference_specialist
```

自动玩家策略固定为：

```text
player_policy_aggressive
player_policy_kiting
player_policy_defensive
player_policy_conserving
player_policy_retreat_aware
```

以上值与难度、AI 模板均已登记在 `contracts/demo-v2-ids.json`。测试夹具也
必须引用注册值，不能用显示名或数组序号代替。
运行时唯一开发诊断 ID 为 `ai_no_legal_plan`，同样已登记。

## 6. 战斗决策状态

### 6.1 决策快照

AI 读取的快照必须是普通 JSON 数据，至少包含：

```js
{
  battleId,
  round,
  phase: "enemy",
  board: {
    width: 8,
    height: 6,
    blockedCells: [{ x, y }]
  },
  player: {
    unitId,
    position: { x, y },
    hp,
    maxHp,
    essence,
    maxEssence,
    move,
    strength,
    perception,
    physicalDefense,
    guDefense,
    visibleStatuses: [{
      statusId,
      duration,
      remainingTurns
    }],
    publicCooldowns: [{ actionId, remainingTurns }],
    revealedActionIds,
    publicItemActions: [{ actionId, remainingUses }]
  },
  enemies: [{
    unitId,
    profileId,
    position: { x, y },
    hp,
    maxHp,
    essence,
    maxEssence,
    move,
    strength,
    perception,
    physicalDefense,
    guDefense,
    statuses: [{
      statusId,
      duration,
      remainingTurns
    }],
    cooldowns: [{ actionId, remainingTurns }],
    actionIds
  }],
  recentActionCategoriesByUnitId,
  activeEnemyUnitId,
  enemyUnitOrder,
  difficultyId,
  aiSeed,
  aiCursor,
  decisionIndex
}
```

快照不得包含玩家未公开的：

- 空窍储备蛊。
- 未使用的主动蛊与杀招。
- 行囊道具。
- 隐藏被动的内部 ID。
- 后续随机结果。

玩家普通肉搏、移动、防御和已经在本场战斗中公开使用过的动作始终属于
`revealedActionIds`。可见状态的公开数值可以读取。

`actionIds`、`revealedActionIds` 和状态 ID 通过当前战斗的只读内容快照解析
完整规则，包括伤害类型、基础威力、射程、目标模板、真元消耗、冷却、
持续期和 `aiControlValue`。决策期间不得再读取可变的场景对象或全局行囊。

快照中的力量、感知、防御和移动力都是应用可见状态后的有效整数。隐藏被动
造成但尚未公开的修正不能泄漏进 AI 快照；实际结算仍由正式战斗规则使用
真实状态处理。

`remainingTurns` 只在持续类型为 `turns` 时出现；`scene` 与 `untilRest`
不携带该字段。`publicCooldowns` 只包含玩家已经公开动作的冷却，未公开动作
不因冷却信息而暴露。

`recentActionCategoriesByUnitId` 为每个敌人保存最近两个已提交类别，只能是
`damage`、`control`、`defend`、`reposition` 或 `pass`。不足两个时按实际
长度保存。

一个复合回合只保存一个类别，必须在正式结算后按以下首个命中项决定：

1. 对玩家造成正生命伤害：`damage`。
2. 未造成伤害但施加有效控制：`control`。
3. 动作类型是防御：`defend`。
4. 终点不同于起点：`reposition`。
5. 其他动作，包括原地无伤技能和原地 `pass`：`pass`。

因此移动加防御记为 `defend`，移动加 `pass` 记为 `reposition`，同时造成
伤害和控制记为 `damage`。模拟器和正式提交必须调用同一分类函数。

### 6.2 候选回合计划

一个候选是“零或一次移动加一个动作”的完整组合：

```js
{
  actorUnitId,
  destination: { x, y },
  path: [{ x, y }],
  action: {
    type,
    actionId,
    targetUnitId,
    targetCell
  },
  pathCost,
  essenceCost,
  canonicalKey
}
```

规则：

- `destination` 可以等于起点。
- `path` 包含起点和终点。
- `pathCost` 不得超过单位 `move`。
- 动作目标必须在移动后的合法射程内。
- 候选必须已满足冷却、真元、状态和目标类型要求。
- 敌人默认动作集为普通攻击、公开技能、防御和明确声明的首领动作。
- 敌人没有物品栏，也不会撤退，除非具体战斗将来另开上位规则。
- 若没有攻击、技能或防御候选，必须产生显式 `pass` 候选。

搜索玩家回应时使用同一个候选结构，并额外允许：

- 玩家位于或可移动到边缘格时的 `retreat`。
- 玩家已经在本场公开使用、剩余数量也已公开的物品动作。

未公开的行囊和物品数量不进入快照，因此不被 AI 预测。实际玩家仍可使用
这些物品；这是公开信息边界带来的合理盲区，不是禁用物品。

`canonicalKey` 固定按以下字段拼接：

```text
destination.y,destination.x,pathDirectionRanks,actionTypeRank,actionId,targetUnitId,target.y,target.x
```

空字段使用空字符串。这个键只用于稳定排序，不作为内容 ID。
`actionTypeRank` 固定为普通攻击 `0`、技能或首领动作 `1`、防御 `2`、
物品 `3`、撤退 `4`、`pass` `5`。技能是否能击杀只影响第 9.4 节的效用
等分比较，不改变这个基础排名。

## 7. 寻路契约

### 7.1 网格

- 只允许上、左、右、下移动。
- 方向排名固定为上 `0`、左 `1`、右 `2`、下 `3`。
- 不启用对角线。
- MVP 每个可走格成本为 `1`。
- 障碍格、玩家格和其他单位占用格不可穿过或停留。
- 行动单位自己的起点临时视为可走格。
- 已在本敌方阶段完成行动的单位位置会立即成为后续单位的动态障碍。

### 7.2 EasyStar 适配

适配层必须为每次决策快照重新设置网格和占用，不得让上一次查询的临时
避让点泄漏到下一次。

适配层可以使用同步计算模式，但业务层不得依赖 EasyStar 对等长路径的内部
遍历顺序。规范路径按以下方式得到：

1. 取得起点到终点的最短距离 `D`。
2. 从起点按上、左、右、下检查相邻合法格。
3. 选择第一个到终点距离为 `D - 1` 的格。
4. 重复直到抵达终点。

因此库升级或内部队列变化不会改变等长路径结果。

不可达时返回明确的 `{ reachable: false }`，不能退化为忽略障碍的曼哈顿
直线，也不能让单位原地穿越障碍。

### 7.3 可达终点

先枚举棋盘上的全部空格，再用寻路距离过滤 `distance <= move`。最终按：

1. 路径成本从小到大。
2. 终点 `y` 从小到大。
3. 终点 `x` 从小到大。
4. 规范路径方向序列。

排序。

系统使用两种不可混用的总顺序：

1. `enumerationOrder`：先使用上述终点顺序，再比较
   `actionTypeRank`、`actionId`、目标单位 ID、目标 `y`、目标 `x`。
   第 11.6 节的原始安全上限只使用这个顺序。
2. `decisionOrder`：效用分从高到低，等分时使用第 9.4 节。每终点动作上限、
   搜索束宽和最终选择都使用这个顺序。

不得用对象插入顺序、库返回顺序或排序稳定性补足缺失字段。

## 8. 行为树职责

### 8.1 统一意图

行为树每次只返回以下一个意图：

| 意图 | 含义 |
| --- | --- |
| `finish` | 玩家已进入可靠击杀范围，优先合法收割动作 |
| `attack` | 以本回合有效伤害或控制为主 |
| `reposition` | 调整到模板偏好的射程、角度或侧面 |
| `defend` | 本单位处于公开的高致死风险，优先减伤或离开威胁格 |
| `conserve` | 真元低于模板阈值，保留高消耗技能 |
| `phase_action` | 首领满足明确阶段条件，允许阶段专属动作 |

行为树不能过滤、创造或执行候选。意图对决策的唯一影响是第 9.3 节固定的
`intentAdjustment`；即使候选不符合当前意图，它仍保留原有效用分并可以
在总分更高时被选中。第 9.3 节反拖延过滤属于所有难度共用的系统规则，
不属于行为树。

### 8.2 固定判断顺序

普通模板按以下顺序：

1. 战斗已经结束：不产生决策。
2. 存在本回合可击杀玩家的候选：`finish`。
3. 本单位生命不高于 `30%` 且玩家下回合存在公开可见的击杀计划：
   `defend`。
4. 真元不高于 `25%` 且存在零消耗有效候选：`conserve`。
5. 存在有效攻击或控制候选：`attack`。
6. 否则：`reposition`。

`ai_profile_boss_hunter` 可以在第 2 步之后、第 3 步之前插入
`phase_action`。阶段条件必须只由生命比例、回合数和已公开状态组成。

“玩家下回合存在公开可见的击杀计划”精确定义为：只用第 6.1 节快照里的
公开玩家动作，枚举一次合法移动加一次合法动作，其中至少一个模拟结果使
当前敌人生命降到 `0`。未知蛊虫、未知物品和未知被动不参与判断。

“有效控制候选”指新施加一个 `aiControlValue > 0` 且目标当前不存在同
ID、同强度、剩余持续期不短于新效果的状态。重复刷新但没有延长或增强的
状态不算有效控制。

### 8.3 行为树数据

工程实施时以 JSON 作为仓库内唯一源格式。不得同时维护 DSL 和 JSON 两套
真源。所有树在内容验证阶段完成：

- 节点类型校验。
- 条件名和动作名白名单校验。
- 无引用循环校验。
- 至少存在一个可结束分支。
- 固定种子下的可重复执行校验。

允许的行为树节点只包括立即完成的 selector、sequence、condition 和
action。禁止 `wait`、`lotto`、带随机次数的 `repeat`/`retry` 以及返回
`RUNNING` 的叶节点。

不使用 Mistreevous 的默认随机函数或墙钟时间。若未来需要随机分支，必须
另行修改本契约并通过项目的 `aiSeed + aiCursor` 适配器提供随机值。

## 9. 效用评价

### 9.1 公共特征

`evaluateBattleState` 的完整输入固定为一个评价上下文：

```js
{
  rootActorUnitId,
  rootIntent,
  rootProfileId,
  rootBeforeSnapshot,
  leafAfterSnapshot,
  branchSteps: [{
    side: "enemy" | "player",
    actorUnitId,
    intent,
    profileId,
    beforeSnapshot,
    afterSnapshot,
    settlementSummary
  }]
}
```

`settlementSummary` 是每一步模拟器返回的只读结果，至少包含动作 ID、动作
类别、生命与真元变化、施加/移除的状态、冷却变化和正式战斗结果。
`branchSteps` 按真实回合顺序保存从根动作到叶状态的全部步骤，不把多个
动作压成一个来源不明的摘要。
玩家步骤的 `intent` 与 `profileId` 固定为 `null`；敌人步骤必须填写当次
本地行为树得到的意图和正式模板 ID。

最终叶分始终从当前正在决定动作的根敌人视角计算：

- `rootBeforeSnapshot` 永远是根敌人行动前状态。
- `leafAfterSnapshot` 是该搜索分支最后一步后的状态。
- `immediateThreat`、`rangeFit` 和 `exposure` 使用
  `rootActorUnitId`；根敌人已死亡时三者都为 `0`。
- 权重使用 `rootProfileId`。
- `actionAdjustment` 只取 `branchSteps[0]` 的根动作。
- `intentAdjustment` 只使用 `rootIntent` 和根动作。
- 终局、目标生命、团队生存、资源和协同使用叶状态。

搜索中为了截断某个非根演员的候选时，为该演员临时建立只有一个
`branchStep` 的本地评价上下文，使用它自己的行动前状态、意图和模板。
本地分只决定束内排序，不能替代最终根视角叶分。玩家回应不使用敌方
`actionAdjustment` 或 `intentAdjustment`，而是直接按完整根视角叶分从
低到高排序。

评价器不得从 Phaser 场景反查任何信息。

每个模拟后的叶状态计算以下特征；除特别注明外范围为 `0..1`：

| 特征 | 计算 |
| --- | --- |
| `targetLoss` | `1 - player.hp / player.maxHp` |
| `teamSurvival` | 战斗创建时全部敌人 `hp / maxHp` 的平均值；死亡敌人按 `0` 计 |
| `immediateThreat` | 敌方下一次激活时一个合法移动加动作可造成的最大伤害除以玩家最大生命，截断到 `1` |
| `exposure` | 玩家用公开动作在下回合一个合法移动加动作可造成的最大伤害除以行动单位最大生命，截断到 `1` |
| `rangeFit` | `max(0, 1 - 0.25 * gap)`；距离在偏好区间内时 `gap=0`，否则为到最近边界的格数 |
| `controlValue` | 叶状态相对根状态的有效控制净变化，按下文计算并截断到 `-1..1` |
| `resourceReserve` | 敌方团队剩余真元除以最大真元，截断到 `0..1` |
| `coordination` | `1v1` 固定为 `0`；`1v2` 按第 10 节计算 |

生命和真元除法的分母必须大于 `0`，不合法内容在验证阶段失败。

能被战斗动作施加的 Buff/Debuff 必须声明整数 `aiControlValue`，范围
`0..100`。只有限制敌方移动、伤害、防御、资源或动作选择的 Debuff 可以
大于 `0`；Buff、纯伤害、纯表现或不影响本场行动选择的状态使用 `0`。

对根状态和叶状态分别计算：

```text
controlBalance =
  sum(active hostile control values on player)
  - sum(active hostile control values on all enemies)

controlValue =
  clamp((leafControlBalance - rootControlBalance) / 100, -1, 1)
```

同一目标同一状态只取当前最高 `aiControlValue`，不按层数或
`branchSteps` 重复相加。分支中曾施加但到叶状态已经结束的控制不计分。

### 9.2 模板权重

非终局分数使用整数：

```text
score =
  round(targetLoss * wTargetLoss)
  + round(teamSurvival * wTeamSurvival)
  + round(immediateThreat * wImmediateThreat)
  - round(exposure * wExposure)
  + round(rangeFit * wRangeFit)
  + round(controlValue * wControl)
  + round(resourceReserve * wResource)
  + round(coordination * wCoordination)
  + actionAdjustment
  + intentAdjustment
```

| AI 模板 | 目标损失 | 团队生存 | 即时威胁 | 暴露惩罚 | 射程适配 | 控制 | 真元保留 | 协同 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `melee_pursuer` | 400 | 100 | 220 | 80 | 180 | 50 | 30 | 40 |
| `charger` | 500 | 40 | 240 | 40 | 160 | 20 | 0 | 40 |
| `ranged_skirmisher` | 330 | 170 | 180 | 220 | 250 | 60 | 50 | 40 |
| `guardian` | 250 | 220 | 120 | 140 | 140 | 80 | 50 | 100 |
| `duelist` | 380 | 150 | 200 | 130 | 190 | 60 | 50 | 40 |
| `pack_hunter` | 360 | 120 | 200 | 100 | 160 | 40 | 20 | 180 |
| `boss_hunter` | 420 | 180 | 200 | 140 | 160 | 80 | 20 | 0 |

表中短名对应第 5.2 节同后缀正式 ID。

### 9.3 终局分与修正

每次动作和回合末状态结算后，先按固定顺序产生唯一正式结果：

1. 所有敌人生命为 `0`：玩家胜利。
2. 否则玩家生命为 `0`：玩家失败。
3. 否则玩家已提交合法撤退：玩家撤退。
4. 否则战斗继续。

因此同时归零按玩家胜利处理，不存在平局。

AI 视角终局分：

- 玩家失败：`+100000`。
- 玩家撤退：`+90000`。
- 玩家胜利：`-100000`。
- 技能可配置 `aiUtilityAdjustment`，范围只能是 `-100..100`。
- 没有显式修正的动作使用 `0`。

意图修正：

| 意图 | 修正 |
| --- | --- |
| `finish` | 可在本回合击杀玩家的候选 `+10000`，其他候选 `0` |
| `attack` | 造成正伤害或新控制的候选 `+120` |
| `reposition` | `rangeFit` 比行动前提高的候选 `+100` |
| `defend` | 使 `exposure` 至少下降 `0.25` 的候选 `+160` |
| `conserve` | 真元消耗为 `0` 的候选 `+100` |
| `phase_action` | 当前阶段指定动作 `+180` |

所有浮点只存在于中间特征，最终分数必须经 `round` 成为整数。

防止原地拖延的过滤发生在评分前：

1. 读取行动单位最近两个已提交动作类别。
2. 若两者同为 `defend`、`reposition` 或 `pass`，检查本次是否存在“推进
   候选”。
3. 推进候选指造成正伤害、施加有效控制，或使 `rangeFit` 严格提高的合法
   候选。
4. 存在推进候选时，排除第三个同类别候选；不存在时允许继续自保或移动。

这个过滤只读取第 6.1 节已持久化的历史，不读取动画或墙钟时间。

### 9.4 等分顺序

候选效用完全相同时依次比较：

1. 能否结束战斗。
2. 动作类型：击杀技能、普通攻击、其他技能、防御、移动后 `pass`。
3. 真元消耗从低到高。
4. 路径成本从低到高。
5. `canonicalKey` 字典序。

难度未声明随机选择时，必须取排序后的第一个候选。

玩家回应使用相反目标排序：AI 效用分从低到高，等分时只按
`canonicalKey` 字典序。第 11 节所称玩家“前 N 个最佳回应”均使用这个
顺序。合法撤退和公开物品动作都参与该排序。

## 10. `1v2` 协同

MVP 不做全队职业系统，只处理两个敌人的位置冲突和夹击。

### 10.1 行动顺序

`enemyUnitOrder` 在战斗创建时按内容顺序固定并存档。每个敌人提交动作后，
下一个敌人读取更新后的棋盘。

单位死亡后从行动中跳过，但不重排剩余 ID。读档必须恢复同一顺序。

### 10.2 协同分

`coordination` 始终在当前搜索叶状态上取以下三项平均值：

1. `occupancy`：两敌人不争抢同一目标格为 `1`，否则候选直接不合法。
2. `approachSides`：两敌人相对玩家处于不同主方向为 `1`，同方向为 `0`。
3. `attackCoverage`：按叶状态中的当前格子和可用动作，两敌人都能在各自
   下一次激活时用一次合法移动加动作威胁玩家为 `1`，只有一个为 `0.5`，
   均不能为 `0`。

主方向按横纵绝对差决定；相等时优先横向，左、右、上、下为四个不同方向。

标准难度评价第一个敌人时，第二个敌人保持当前已提交位置，不预测它本阶段
尚未发生的动作；困难和天骄搜索到敌方阶段末的叶状态时，则使用模拟后的
两个位置。因此四档都能从自己的实际叶状态计算，不读取虚构的未来格子。

协同只提升位置质量，不允许两名敌人合并伤害、共享真元或同时行动。

## 11. 四档难度

### 11.1 共同规则

所有难度：

- 使用完全相同的玩家和敌人属性。
- 使用完全相同的技能、棋盘、奖励和失败结果。
- 遵守相同的公开信息边界。
- 不修改敌人冷却、真元、移动力或伤害。
- 不预测玩家未公开动作。

设置页可随时修改全局难度，但进行中的战斗使用创建时保存的
`difficultyId`。新设置从下一场战斗生效。

### 11.2 入门

`ai_difficulty_beginner`：

- 只评价当前敌人本回合的结果，不模拟玩家回应。
- 每个移动终点最多保留效用最高的两个动作。
- 全部候选排序后，从前三名中按 `60% / 25% / 15%` 选择。
- 不足三项时把缺失概率并入第一名。
- 随机选择必须消耗一次 `aiCursor`。
- `finish` 意图下若存在必杀候选，仍参与前三名选择，不保证一定收割。

目的：敌人能展示走位和技能，但会稳定出现可利用的次优决策。

### 11.3 标准

`ai_difficulty_standard`：

- 只评价当前敌人本回合的结果。
- 每个移动终点最多保留效用最高的三个动作。
- 选择全局最高分，不使用随机。
- `1v2` 敌人依次读取前一敌人提交后的状态，但不预先搜索联合行动。

这是默认和主要平衡档。

### 11.4 困难

`ai_difficulty_hard`：

1. 先按当前效用保留敌方前 `8` 个候选。
2. 对每个候选，先按 `enemyUnitOrder` 模拟本阶段尚未行动的敌人；每个
   后续敌人使用标准难度的确定性最高分动作，不使用随机。
3. 只有全部存活的后续敌人模拟完成后，才进入玩家回合。
4. 玩家使用第 6.2 节完整公开回应集，每个移动终点保留最高收益的两个
   动作，全局保留前 `6` 个回应。
5. 假定玩家选择对敌方最不利的回应。
6. 以该最差回应后的分数选择当前敌方动作。

因此 `1v2` 的顺序始终是“当前敌人、剩余敌人、玩家”，不会在两名敌人
之间插入玩家回应。当前单位是本阶段最后一名敌人时，第 2 步为空。敌方
候选已经产生终局结果时立即评价，不再模拟后续单位或玩家。

### 11.5 天骄

`ai_difficulty_prodigy`：

`1v1` 使用三层搜索：

1. 敌方前 `8` 个候选。
2. 玩家前 `6` 个最佳回应。
3. 下一敌方阶段中同一敌人的前 `6` 个后续候选。
4. 对每个玩家回应，敌方在第三层六个叶分中取最大值。
5. 玩家在上述六个“敌方最大值”中取最小值。
6. 根敌人在八个“玩家最小值”中取最大值并提交对应首步。

写成递推式：

```text
V(rootAction) =
  min over playerResponse (
    max over enemyFollowUp (
      evaluateRootBranch(rootAction, playerResponse, enemyFollowUp)
    )
  )

chosenRootAction = argmax V(rootAction)
```

若玩家回应已经产生终局结果，不展开第三层，直接使用该终局叶分。若战斗
继续但敌人没有合法后续动作，则用显式 `pass` 作为唯一第三层候选。

`1v2` 在当前敌人之后仍有一名敌人时，使用本敌方阶段联合规划：

1. 第一个敌人保留前 `5` 个候选。
2. 每个首步下为第二个敌人保留前 `5` 个候选，最多形成 `25` 个组合。
3. 对每个组合模拟玩家前 `6` 个最佳回应。
4. 按极小化结果选择组合，但当前只提交第一个敌人的动作。
5. 第二个敌人行动时不盲从未提交的旧组合，而是从真实已提交状态重新执行
   “当前敌人前 `5` 个候选、玩家前 `6` 个回应”的极小化搜索。

第一个敌人决策的搜索顺序是“第一敌人、第二敌人、玩家”；第二个敌人实际
决策的搜索顺序是“第二敌人、玩家”。任一中间动作产生终局结果时立即停止
该分支。玩家回应集包括合法撤退和已公开物品，不包括隐藏行囊。

天骄难度不会记住读档前发生但读档后尚未发生的事情。

### 11.6 搜索上限

搜索只能按固定候选数量截断，不得按毫秒、帧数或机器速度截断。

单个敌人原始候选上限为 `256`。超过时先按第 7.3 节
`enumerationOrder` 保留前 `256` 个，再模拟和评分，并记录开发诊断。
每终点动作上限和各难度束宽在评分后按 `decisionOrder` 截断。正式 MVP
内容不得在标准棋盘上触发原始上限诊断。

单次决策的搜索叶上限固定为：

| 难度/场景 | 最大叶状态 |
| --- | ---: |
| 入门、标准 | `256` |
| 困难 | `8 x 6 = 48`，另加每分支至多一次确定性后续敌人展开 |
| 天骄 `1v1` | `8 x 6 x 6 = 288` |
| 天骄 `1v2` 第一敌人 | `5 x 5 x 6 = 150` |
| 天骄 `1v2` 第二敌人 | `5 x 6 = 30` |

目标性能：

| 难度 | 单次敌方决策 P95 |
| --- | ---: |
| 入门 | `< 25 ms` |
| 标准 | `< 50 ms` |
| 困难 | `< 100 ms` |
| 天骄 | `< 150 ms` |

性能测量不改变决策结果。若不达标，应优化枚举、缓存或模拟器，不能删减
规则或引入时间截断。

P95 使用固定基准工具测量：

1. Node 版本、操作系统、CPU 型号、逻辑核心数和内存写入测试报告。
2. 使用发布构建中的纯 AI 核心，不运行 Phaser 动画。
3. 先预热每档 `100` 次，再对第 13.2 节全部战斗的固定金样循环取
   `1000` 次决策。
4. 单次样本从快照创建开始，到选出 `canonicalKey` 结束。
5. 报告每档 P50、P95、最大值和展开叶节点数。

候选上限和展开叶节点上限是跨机器的硬门；毫秒 P95 是指定发布基准机上的
硬门。更换基准机后必须保留旧报告并生成新报告，不能直接比较不同机器。

## 12. 确定性随机与存读档

### 12.1 随机函数

只有入门难度的前三候选选择会使用随机。随机值必须来自项目统一的确定性
生成器。算法固定为“UTF-8 FNV-1a 32 位，再执行一次 xorshift32”：

```js
function deterministicRandom(seed, cursor) {
  const bytes = new TextEncoder().encode(`${seed}|${cursor}`);
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash = Math.imul((hash ^ byte) >>> 0, 0x01000193) >>> 0;
  }

  let value = hash === 0 ? 0x9e3779b9 : hash;
  value = (value ^ (value << 13)) >>> 0;
  value = (value ^ (value >>> 17)) >>> 0;
  value = (value ^ (value << 5)) >>> 0;
  return value / 0x100000000;
}
```

输入种子必须是字符串，游标必须是 `0..Number.MAX_SAFE_INTEGER` 的整数。
返回值范围为 `0 <= roll < 1`。候选概率区间固定为 `[0, 0.60)`、
`[0.60, 0.85)`、`[0.85, 1)`。

固定测试向量：

| seed | cursor | roll |
| --- | ---: | ---: |
| `00000000` | `0` | `0.5137210513930768` |
| `abc` | `0` | `0.11610232456587255` |
| `abc` | `1` | `0.25398650323040783` |

`mistreevous`、`easystarjs`、`Math.random()` 和墙钟时间都不能成为随机源。

### 12.2 战斗种子

存档根保存：

```js
state.mvp.battleAi = {
  battleSeedRoot,
  nextBattleInstanceSerial
}
```

`battleSeedRoot` 只生成一次，固定为
`hex8(fnv1aUtf8("battle-ai-v1|" + theftSeed))`。这里的 FNV-1a 与第 12.1
节哈希循环相同，但不执行 xorshift；`fnv1aUtf8` 返回 `>>> 0` 后的无符号
整数，`hex8(value)` 固定为
`(value >>> 0).toString(16).padStart(8, "0")`。

创建战斗时：

1. 读取 `serial = nextBattleInstanceSerial`。
2. 立即把 `nextBattleInstanceSerial` 加 `1`。
3. 计算
   `aiSeed = hex8(fnv1aUtf8(battleSeedRoot + "|" + battleId + "|" + serial))`。
4. 把 `serial`、`aiSeed`、`aiCursor = 0` 和 `decisionIndex = 0` 写入战斗。
5. 原子保存后才进入战斗画面。

同一 `battleId` 的重复野外战斗因 `serial` 不同而拥有独立序列。

种子派生固定向量：`theftSeed = "theft-seed"` 时，
`battleSeedRoot = "fe5f99fb"`；该 root、`battleId = "B-D10-01"`、
`serial = 0` 时，`aiSeed = "54c47c21"`。

### 12.3 旧存档补全

旧 v3 或 v2 迁移后的活动状态缺少 `battleAi` 时：

1. 先按第 12.2 节从已经持久化的 `theftSeed` 派生
   `battleSeedRoot`。
2. `nextBattleInstanceSerial` 默认 `0`。
3. 若没有进行中战斗，到此结束。
4. 若有进行中战斗但没有 AI 字段，消费当前 serial，为它派生 `aiSeed`，
   然后将 next serial 加 `1`。
5. 难度默认 `ai_difficulty_standard`，`aiCursor` 和 `decisionIndex`
   默认 `0`。
6. `enemyUnitOrder` 按旧战斗敌人数组顺序；当前行动单位取旧回合游标指向的
   首个存活敌人，否则取第一个存活敌人。
7. AI 模板按第 13.2 节战斗映射补全。
8. 玩家公开动作默认只有移动、普通肉搏和防御，再合并旧战斗日志中能证明
   已使用的动作；没有日志时不得猜测。
9. `recentActionCategoriesByUnitId` 全部为空数组。

已经存在的 `battleSeedRoot`、serial、`aiSeed`、游标、难度、单位顺序和
公开动作一律保留。第二次执行补全必须得到字节级相同结果，不能重新消费
serial。

### 12.4 原子提交

一次敌方决策按以下顺序提交：

1. 基于已保存的 `aiSeed` 和 `aiCursor` 选择候选。
2. 重新验证候选仍合法。
3. 应用移动、动作、伤害、状态、真元和冷却。
4. 按第 9.3 节结算本单位动作后的死亡和战斗结果。
5. 把已提交动作类别追加到该单位历史，只保留最近两个。
6. 若本次使用随机，将 `aiCursor` 精确加 `1`。
7. 将 `decisionIndex` 精确加 `1`。
8. 保存完整战斗状态。
9. 播放表现。

动画崩溃或页面刷新不能导致再次抽取。

### 12.5 必须保存

进行中的战斗至少保存：

```js
{
  difficultyId,
  aiSeed,
  aiCursor,
  decisionIndex,
  enemyUnitOrder,
  activeEnemyUnitId,
  profileByUnitId,
  revealedPlayerActionIds,
  publicItemActions,
  recentActionCategoriesByUnitId
}
```

根状态保存 `battleSeedRoot` 与 `nextBattleInstanceSerial`。进行中战斗还
必须保存上位契约要求的棋盘、单位、回合、状态持续期、冷却和结果。

同一存档连续读取两次，下一敌方动作的 `canonicalKey`、伤害、状态变化和
随机游标必须完全相同。

## 13. 敌人模板

### 13.1 模板行为

| 模板 | 偏好射程 | 主要行为 | 明确弱点 |
| --- | --- | --- | --- |
| 近战追击 | `1` | 取稳定最短路，攻击优先于保存真元 | 容易被障碍和拉扯限制 |
| 突进 | `1` | 主动缩短距离，优先突进与爆发 | 暴露惩罚低，容易冲入反击区 |
| 远程游击 | `2..3` | 保持距离，受贴身威胁时换位 | 被逼到边缘后选择减少 |
| 守卫 | `1` | 生存、防御和阻路权重高 | 追击与收割意愿较低 |
| 决斗者 | `1..2` | 平衡技能收益、资源和暴露 | 没有极端优势 |
| 群猎 | `1` | 两侧接近，减少堵位 | 单体权重低于专精模板 |
| 首领猎手 | 动作声明 | 按生命阶段切换，但仍走统一候选流程 | 阶段行为公开且可学习 |

内容作者可以配置：

- 基础属性。
- 合法动作和技能。
- 正式 AI 模板 ID。
- 偏好射程。
- 技能 `aiUtilityAdjustment`。
- 首领阶段阈值和阶段动作。

内容作者不能配置：

- 任意代码表达式。
- 读取隐藏玩家数据的条件。
- 绕过真元、冷却、射程或障碍的 AI 专属动作。
- 难度专属伤害或生命倍率。

### 13.2 现有战斗映射

| 战斗 ID | 敌人 | AI 模板 | 战斗级别 |
| --- | --- | --- | --- |
| `B-D07-01` | 同窗对手 | `ai_profile_duelist` | 教学 |
| `B-D10-01` | 木傀 | `ai_profile_melee_pursuer` | 普通 |
| `B-D17-01` | 地甲虫 | `ai_profile_guardian` | 普通 |
| `B-D19-01` | 天骄对手 | `ai_profile_duelist` | 精英 |
| `B-D21-01` | 电狼 | `ai_profile_charger` | 普通 |
| `B-D24-01` | 侦察蛊师 | `ai_profile_ranged_skirmisher` | 普通 |
| `B-D26-01` | 两只电狼 | `ai_profile_pack_hunter` | 精英 `1v2` |
| `B-D27-01` | 精壮电狼 | `ai_profile_charger` | 普通 |
| `B-D29-01` | 百兽王 | `ai_profile_boss_hunter` | 首领 |
| `B-Q02-01` | 石皮傀儡 | `ai_profile_guardian` | 精英 |
| `B-Q03-01` | 劫货蛊师 | `ai_profile_duelist` | 普通 |
| `B-Q04-01` | 叶蛾 | `ai_profile_ranged_skirmisher` | 普通 |
| `B-Q05-01` | 两只电狼 | `ai_profile_pack_hunter` | 精英 `1v2` |

这张表只确定思考方式，不补写尚未设计的敌方蛊术和数值。

## 14. 敌人数值平衡

### 14.1 平衡基准

每场战斗必须指定一个“推荐进入状态”，包含：

- 玩家境界。
- 参考最大生命与真元。
- 参考物理和蛊防御。
- 参考移动力。
- `reference_minimum`：当期最低合理状态，以普通肉搏和剧情必得蛊为主。
- `reference_balanced`：系统推荐的攻防混合空窍。
- `reference_specialist`：当期合法的单方向强化构筑，但不得依赖隐藏机缘。

不得只用单一最优构筑验收。

### 14.2 标准难度目标

标准难度使用固定自动矩阵作为可重复的数值门：

| 战斗级别 | 目标胜率 | 目标回合数 | 撤退 |
| --- | ---: | ---: | --- |
| 教学 | `80%..95%` | `3..5` | 必须容易抵达边缘 |
| 普通 | `65%..80%` | `4..6` | 必须存在至少一条合法路线 |
| 精英 | `50%..70%` | `6..8` | 必须存在，但可以付出走位代价 |
| 首领 | `45%..65%` | `7..10` | 必须存在，不锁死棋盘边缘 |

每场战斗的自动矩阵固定为第 14.1 节三个构筑乘以下五个确定性玩家策略，
共 `15` 局：

五个策略都先枚举玩家当前所有合法“移动加动作”候选，包括普通肉搏、已装
入空窍的技能、杀招、防御、物品、撤退和 `pass`，再用正式模拟器得到以下
指标：

| 指标 | 精确定义 |
| --- | --- |
| `victory` | 候选立即使玩家胜利为 `1`，否则 `0` |
| `nonRetreat` | 候选不是撤退为 `1`，否则 `0` |
| `survives` | 候选没有使玩家失败为 `1`，否则 `0` |
| `killCount` | 本候选使生命从正数降到 `0` 的敌人数 |
| `damage` | 对全部敌人造成的正生命伤害总和 |
| `controlGain` | 叶状态相对根状态新增的敌方有效控制值总和 |
| `hpGain` | 玩家正生命恢复量 |
| `incomingDamageBp` | 叶格局下每个存活敌人下一次激活的最大公开伤害之和除以玩家最大生命，再乘 `10000` 并 `round` |
| `incomingControl` | 叶格局下每个存活敌人下一次激活可施加的最高 `aiControlValue` 之和 |
| `safe` | `incomingDamageBp == 0` 且 `incomingControl == 0` 时为 `1` |
| `threatensNext` | 玩家下次激活存在一个可造成正伤害或有效控制的合法计划时为 `1` |
| `nearestDistance` | 叶格局下玩家到最近存活敌人的曼哈顿距离；敌方全灭时为 `99` |
| `zeroEssence` | 真元消耗为 `0` 时为 `1` |
| `efficiency` | `floor(100 * damage / max(1, essenceCost))` |
| `defends` | 动作类型为防御时为 `1` |

`essenceCost` 与 `pathCost` 直接取候选字段，均为非负整数。

除撤退策略的明确分支外，每个策略为每个合法候选建立一个数字元组，按从左
到右、数值从大到小比较，最后用 `canonicalKey` 字典序打破完全相等：

| 策略 | 排序元组 |
| --- | --- |
| `player_policy_aggressive` | `[victory, nonRetreat, survives, killCount, damage, controlGain, hpGain, threatensNext, -essenceCost, -pathCost]` |
| `player_policy_kiting` | `[victory, nonRetreat, survives, safe, -incomingDamageBp, -incomingControl, damage, controlGain, nearestDistance, hpGain, -essenceCost, -pathCost]` |
| `player_policy_defensive` | `[victory, nonRetreat, survives, -incomingDamageBp, -incomingControl, hpGain, defends, damage, controlGain, -essenceCost, -pathCost]` |
| `player_policy_conserving` | `[victory, nonRetreat, survives, killCount, zeroEssence, efficiency, damage, controlGain, hpGain, -incomingDamageBp, -pathCost]` |

`player_policy_retreat_aware` 使用完整分支：

1. 在行动前状态计算全部存活敌人下一次激活的最大公开伤害之和。
2. 若该值不低于玩家当前生命，并且至少存在一个合法撤退候选，只在撤退
   候选中按 `pathCost` 从低到高、再按 `canonicalKey` 选择。
3. 否则完整复用 `player_policy_aggressive`。

因此每个合法动作类都有唯一排序位置，防御与降低暴露之间也由
`incomingDamageBp`、`incomingControl`、`hpGain`、`defends` 的固定顺序
决定。

策略只读取玩家在正常 UI 可见的自身状态、行囊、棋盘和敌人公开动作，不
读取敌方 AI 分数、隐藏技能或超过下一次激活的搜索未来。

每个矩阵案例使用
`aiSeed = hex8(fnv1aUtf8("balance|" + battleId + "|" + buildId + "|" + policyId))`。
标准难度不消费该种子，其他难度使用它，保证难度对比可复现。

统计规则：

- `winRate = victories / 15`。
- 失败、撤退和超过 `20` 回合仍未结束都计为非胜利。
- 目标回合数取胜利样本的回合中位数；没有胜利样本则直接失败。
- 百分比下界向上换算、上界向下换算，因此教学需胜 `12..14` 局，普通
  `10..12` 局，精英 `8..10` 局，首领 `7..9` 局。

此外每个战斗级别至少执行 `10` 次不读攻略的人工首玩，记录胜负、撤退、
回合数和主观压力。人工样本用于发现自动策略未覆盖的问题，不把十人样本
包装成统计显著结论。

### 14.3 初始预算

以下是相对于推荐玩家状态的首轮配置范围，不是运行时缩放：

| 战斗级别 | 单敌生命 | 单次常用伤害 | 总敌方真元 | 移动力 |
| --- | ---: | ---: | ---: | ---: |
| 教学 `1v1` | `70%..85%` | `55%..70%` 的玩家常用伤害 | `1..2` 次主技能 | `2..3` |
| 普通 `1v1` | `80%..105%` | `65%..90%` | `2..3` 次主技能 | `2..3` |
| 精英 `1v1` | `105%..130%` | `80%..105%` | `3..4` 次主技能 | `2..3` |
| 精英 `1v2` 每只 | `45%..65%` | `45%..65%` | `1..2` 次主技能 | `2..3` |
| 首领 `1v1` | `140%..180%` | `85%..110%` | `4..6` 次主技能 | `2..3` |

“玩家常用伤害”取参考构筑三个非终结回合的平均实际伤害。内容配置落定后
必须把百分比换成明确整数，运行时不得按玩家当前属性动态缩放敌人。

### 14.4 压力限制

为了保持低压力 MVP：

- 普通战斗不得设计成玩家连续两次满生命直接受击就必死。
- 精英和首领的高伤害动作必须提前一回合出现可见蓄势状态，或受明确射程
  限制。
- `1v2` 两名敌人在同一敌方阶段的理论最大总伤害不得超过推荐玩家最大生命
  的 `55%`，首回合不得超过 `40%`。
- MVP 控制效果不得剥夺玩家完整回合，也不得删除移动或动作步骤。
- 防御、无伤换位或 `pass` 的第三次同类连续选择按第 9.3 节过滤；最近
  两次类别按第 12.5 节保存，读档不能清除。
- 不通过提高敌人生命来补偿 AI 缺陷，先修正技能、棋盘或模板。

### 14.5 难度不参与数值预算

四档难度共用同一个敌人内容对象。胜率目标主要以标准难度验收：

- 入门预期比标准高 `10..20` 个百分点。
- 困难预期比标准低 `8..15` 个百分点。
- 天骄预期比标准低 `12..20` 个百分点。

若差异超出范围，只能调整搜索宽度、候选随机或评价权重；不得给难度添加
属性倍率。

## 15. 错误与降级

### 15.1 内容错误

以下错误必须在验证阶段以字段级路径失败：

- 未注册的难度或 AI 模板 ID。
- 不存在的技能 ID。
- `aiUtilityAdjustment` 超出 `-100..100`。
- 可施加战斗状态缺少 `aiControlValue` 或超出 `0..100`。
- 偏好射程为空、反转或超出棋盘最大曼哈顿距离。
- 首领阶段阈值不在 `0..1` 或顺序重叠。
- 行为树引用未知条件、动作或节点类型。
- 敌人最大生命、最大真元、公开战斗属性或移动力不合法。
- 行为树使用 `RUNNING`、时间节点或未适配随机节点。

不得在生产运行时静默改用其他模板。

### 15.2 运行时防线

若单个候选在提交前失效：

1. 丢弃该候选。
2. 入门难度用同一次尚未提交的 roll 对剩余前三候选重新映射；其他难度从
   同一次已经排序的候选中选择下一项。
3. 不推进随机游标，直到某项正式提交。

若所有候选都失效：

1. 提交显式 `pass`。
2. `decisionIndex + 1`。
3. 保存诊断码 `ai_no_legal_plan` 到开发日志，不写玩家永久状态。

若寻路适配器异常：

1. 记录开发错误。
2. 本单位只枚举原地合法动作。
3. 若仍无动作则 `pass`。

不得回退到穿越障碍、瞬移或直接扣血。

## 16. 测试与验收

### 16.1 单元测试

至少覆盖：

- 每种射程模板的候选生成。
- 移动后施放和原地施放。
- 真元、冷却、状态和目标限制。
- 等长路径按上、左、右、下稳定选择。
- 动态单位占位和不可达终点。
- 七类模板的意图切换。
- 效用分、终局分和等分排序。
- 四档难度的候选截断与搜索层数。
- `1v2` 顺序、堵位与分侧评分。
- 多层搜索的本地束排序与根视角最终叶分。
- 天骄 `1v1` 的 `max-min-max` 固定递推。
- 入门随机游标只在提交时推进一次。
- 伤害加控制、移动加防御、移动加 `pass` 的类别优先级。
- 玩家撤退、公开物品和隐藏物品的回应边界。
- 双方同时归零时按玩家胜利结算。
- FNV-1a、xorshift32 和 seed 派生的固定测试向量。
- 旧存档补全连续执行两次不改变 seed、serial 或游标。
- 三个依赖的实际 import 和最小 API 冒烟测试。

### 16.2 `fast-check` 性质

对随机生成的合法 `8 x 6` 战斗状态，至少验证：

1. AI 永远不返回棋盘外坐标。
2. AI 永远不穿过或停在障碍、玩家或其他单位格。
3. 移动成本永远不超过单位移动力。
4. 动作永远满足射程、目标、真元和冷却。
5. 模拟器不修改输入对象。
6. 正式提交后生命和真元不低于 `0`。
7. 同一快照连续决策得到相同 `canonicalKey`。
8. 保存再读取后得到相同动作和结算摘要。
9. 保持公开快照相同而改变隐藏玩家数据，不会改变 AI 决策。
10. 任意合法状态都能在候选上限内结束决策，不抛出未处理异常。
11. 困难和天骄 `1v2` 的任何搜索分支都遵守“剩余敌人先于玩家”的顺序。
12. 最近动作历史保存再读取后，第三次拖延过滤结果不变。

每项性质默认至少运行 `1000` 个样本。失败种子必须输出并可单独复现。

### 16.3 情景金样

必须保留以下固定情景：

- 近战敌人绕过一列障碍后攻击。
- 远程敌人被贴身后主动拉开。
- 低生命敌人在可见致死范围内防御或换位。
- 有必杀与普通伤害并存时，标准难度选择必杀。
- 入门难度在固定种子下选择第二或第三候选。
- 两只电狼从不同方向接近且不争抢格子。
- 存档发生在第一个敌人行动后，读档后第二个敌人决策不变。
- 首领跨过生命阶段阈值后只在下一次决策切换阶段。
- 玩家已在边缘时，困难和天骄搜索都能枚举撤退回应。
- 玩家与最后敌人同时归零时，AI 叶状态得到玩家胜利终局分。
- 同一个旧进行中战斗补全两次，只消费一次 battle serial。
- 五个自动玩家策略对包含全部动作类型的同一候选集给出固定唯一排序。

### 16.4 完成门

只有同时满足以下条件才可称为战斗 AI 实现完成：

- 三个依赖按第 3 节精确版本安装并锁定。
- 所有 AI 内容通过 Schema 与 ID 注册验证。
- 单元测试、性质测试和情景金样全部通过。
- 现有仓库测试无回归。
- 四档难度的第 14.2 节固定 `15` 案例矩阵都能在 `20` 回合内产生胜利、
  失败或撤退，不存在挂起。
- 标准难度按明确的胜率分母和回合中位数满足第 14.2 节区间。
- 同一 `15` 案例矩阵满足第 14.5 节难度差异区间。
- 搜索不超过第 11.6 节候选与叶节点硬上限，且指定发布基准机上的报告满足
  P95 目标。
- 对进行中战斗执行存档、关闭、读档，不改变下一敌方动作。
- v2、旧 v3、当前 v3 三类存档迁移和重复升级不重建战斗 seed 或消费第二次
  serial。
- UI 只显示玩家选择的难度，不暴露效用分、搜索深度或内部意图。

## 17. 实施边界

下一阶段实施计划应拆成：

1. 纯战斗状态与动作枚举。
2. EasyStar 寻路适配和规范路径。
3. 纯状态模拟器与评价函数。
4. Mistreevous 行为模板适配。
5. 四档搜索与确定性随机。
6. 存档字段和迁移默认值。
7. 敌人配置、13 场映射和平衡。
8. 单元、性质、情景和性能验证。

不得先在 Phaser 场景里堆叠条件分支，再反向补测试。

## 18. 已确认结论

- 使用“行为模板 + 合法动作枚举 + 效用评分 + 浅层确定性搜索”。
- 依赖组合固定为 `mistreevous + easystarjs + fast-check`。
- 默认难度为标准，共提供入门、标准、困难、天骄四档。
- 难度只改变决策质量，不改变敌人属性、规则或奖励。
- 敌人只读取公开战场信息。
- MVP 只支持 `1v1` 和少量 `1v2`，不扩展复杂队伍 AI。
- AI 与玩家共用正式技能、移动、伤害和状态规则。
- 本规格没有待总控裁决的未决项。
