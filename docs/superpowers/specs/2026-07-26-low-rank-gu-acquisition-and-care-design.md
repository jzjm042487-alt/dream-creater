# 低阶蛊虫获取、养护与简化升炼设计

## 1. 状态与权限

本文是青茅山 MVP 低阶蛊系统的权威设计输入，覆盖：

- 首批六只原著蛊的内容范围。
- 野生蛊的生态追踪、收服与炼化。
- 家族分配、传承和资产归属三种非野生获取方式。
- 低压力喂养、成长经验与简化升炼。
- 存档、确定性、迁移和验收边界。

本文不定义战斗伤害、减伤、回合行动经济、敌人 AI 或战斗动画。六只蛊
的战斗能力只声明语义和接口，具体数值由后续战斗体系规范决定。

原著事实以 `systems/canon/curated/early-gu-catalog.json` 为准。本文允许的
游戏化简化仅限明确标记的 MVP 辨蛊/收服条件、低压力养护与成长、生产经济
参数及简化升炼成本；这些内容不得冒充原著事实，也不得改写蛊的原著名称、
品阶、主要能力、已知食性、来源和具名升炼结果。
运行时固定 ID 以 `contracts/demo-v2-ids.json` 为唯一注册表。

## 2. 已确认原则

1. 获取核心是生态追踪与辨蛊，养成核心是养护、熟练和升炼。
2. 偷盗只依靠 `systems/theft-system-design.md` 的角色技能树；不创建
   妙手蛊、匿息蛊、听壁蛊、假令蛊、藏赃蛊或偷元蛊。
3. 首批蛊全部来自原著资料层。
4. 只有真正无主的野生蛊使用生态追踪；家族蛊、传承蛊和资产蛊使用
   各自来源，不强行套捕获小游戏。
5. 普通战斗不直接掉落蛊，战后搜刮也不自动转移有主蛊。
6. 喂养保留原著食物，但通过自动喂养和一键补给降低操作压力。
7. 成长经验不直接制造不存在于原著的数字升转；满足条件后只能生成
   原著中真实存在的具名形态。
8. MVP 升炼暂时不展开每条原著蛊方的专属材料，数据接口必须保留；
   后续启用蛊方时不得追收旧存档已经完成的成本。
9. 已获得的线索和成长经验不衰减。失败应推进信息，不让玩家重复劳动。
10. 低阶系统不设计永久错过。一个机会被其他角色取得后，必须转为
    交易、偷盗、继承或其他已创作路线，而不是删除该蛊实例。

## 3. 首批内容范围

### 3.1 基础蛊

| Runtime ID | Canon ID | 名称 | 品阶 | 主要职能 | 原著获取框架 |
| --- | --- | --- | ---: | --- | --- |
| `gu_moonlight` | `canon_gu_moonlight` | 月光蛊 | 1 | 攻击 | 古月学堂分配 |
| `gu_wine_worm` | `canon_gu_wine_worm` | 酒虫 | 1 | 修炼辅助 | 青竹酒诱出和追踪 |
| `gu_white_boar` | `canon_gu_white_boar` | 白豕蛊 | 1 | 肉身力量 | 花酒传承第一地藏花 |
| `gu_jade_skin` | `canon_gu_jade_skin` | 玉皮蛊 | 1 | 防御 | 花酒传承第二地藏花或家族奖励 |
| `gu_earth_communication_ear_grass` | `canon_gu_earth_communication_ear_grass` | 地听肉耳草 | 2 | 侦察 | 花酒传承后段地藏花 |
| `gu_nine_leaf_vitality_grass` | `canon_gu_nine_leaf_vitality_grass` | 九叶生机草 | 2 | 治疗与经营 | 古月冻土家产结算 |

### 3.2 MVP 升炼结果

| Runtime ID | Canon ID | 名称 | 品阶 | MVP 来源 |
| --- | --- | --- | ---: | --- |
| `gu_moon_glow` | `canon_gu_moon_glow` | 月芒蛊 | 2 | 月光蛊的首个开放分支 |
| `gu_four_flavors_liquor_worm` | `canon_gu_four_flavors_liquor_worm` | 四味酒虫 | 2 | 酒虫升炼 |
| `gu_white_jade` | `canon_gu_white_jade` | 白玉蛊 | 2 | 白豕蛊与玉皮蛊合炼 |

月霓裳、月旋蛊和月痕蛊只保留为未来分支 ID，不属于 MVP 可执行内容。
七香酒虫、九眼酒虫、天蓬蛊及所有三转结果也不属于本规范的可执行范围。

### 3.3 体量约束

- 六只基础蛊。
- 三个可执行二转结果。
- 四种获取框架。
- 一个生态追踪样板，即酒虫。
- 一个共享花酒传承地图状态，承载白豕蛊、玉皮蛊和地听肉耳草。
- 零个随机战斗掉蛊表。
- 零个每日喂养支线。

## 4. 四种获取框架

### 4.1 家族分配

月光蛊通过学堂蛊室选择获得。

- 玩家必须满足对应身份和开窍节点。
- 选择行为不使用生态追踪或随机捕获。
- 获得后状态为 `contained_unrefined`，仍需炼化。
- 若剧情让玩家失去学堂资格，必须存在交易、奖励或计划偷盗的替代路线。
- 同一机会只生成一个稳定蛊实例，不得通过重复对话复制。

### 4.2 生态追踪

酒虫是 MVP 唯一完整实现的野生生态追踪样板。未来低阶无主野生蛊复用
同一框架，但必须拥有独立线索和准备内容。

酒虫的已考证原著事实必须保留：

- 青竹酒或对应高质量酒食可以诱出。
- 饮酒后会迟缓，跟踪痕迹通向狭窄石缝。
- 跟随酒虫可发现花酒传承入口。

“雨后清晨”和“软塞酒坛”是为了让三槽辨识玩法闭合而增加的 MVP 创作
条件，不声称来自原著。UI 札记必须把“古籍/人物证实”和“玩家推演”使用
不同来源标签。

若旧剧情状态已经把唯一酒虫实例交给商贩或方源：

- 不再生成第二只酒虫。
- 已取得生态线索继续保留。
- 生态线索转为正确酒坛、活动时机和持有者路线的情报加成。
- 玩家改走购买、偷盗或夺回路线。
- 购买、偷盗或交付只更新 `uniqueInstanceId` 指向实例的 holder、owner 和
  concealment 字段，绝不创建新实例或提高 spawn ordinal。
- 即使玩家在战斗中击败持有者，也只能通过已创作的偷盗、交付或交易结算
  转移酒虫；普通胜利和战后搜刮不得自动入库。

### 4.3 花酒传承

白豕蛊、玉皮蛊和地听肉耳草共用一条传承状态：

1. 发现花酒传承入口。
2. 完成第一段机关或力量试炼，开启地藏花并取得白豕蛊。
3. 白豕力量进度达到 `100`，开放一豕之力门槛。
4. 通过门槛，开启第二地藏花并取得玉皮蛊。
5. 到达后段传承并接受移植选择，取得地听肉耳草。

每只地藏花是永久一次事件。保存、加载或重新进入地图不得复制奖励。
三段共享地点、传承进度和对话，不各自创建独立地图。

地听肉耳草的移植必须明确提示：

- 它是二转蛊。
- 使用需要植入头部伤口。
- 植入是持久角色状态。
- 本规范不使用血腥特写；表现以剪影、文本和状态图标为主。

### 4.4 家产归属

九叶生机草通过古月冻土家产结算进入玩家路线。

允许三种创作路线：

- 继承或交易谈判。
- 证据和关系布局改变结算。
- 使用计划偷盗取得。

计划偷盗成功时遵守既有盗道规则：所有权立即归玩家，事件结束，不产生
事后追踪、热度、追回或归因。失败分支才允许产生证据和后果。

九叶生机草是生产资产，不使用野外捕获 UI。

## 5. 生态追踪状态机

### 5.1 追踪档案

每个生态机会使用稳定 `trackingOpportunityId`，保存：

```js
{
  trackingOpportunityId,
  guDefinitionId,
  abilityFamilyId,
  clueIds: [],
  identifiedGuDefinitionId: null,
  availableNodeId,
  availableFromDay,
  attemptOrdinal: 0,
  resolutionType: "wild_available",
  uniqueInstanceId: null,
  holderRouteIntelIds: [],
  legacyHolderAttemptCount: 0,
  completed: false
}
```

`abilityFamilyId` 可以在开始时显示，例如修炼辅助、攻击、防御或侦察，
但不能直接泄露具体蛊名。

`completed` 表示这个唯一世界实例已经生成并有确定去向，不表示玩家一定
拥有它。`resolutionType` 只允许 `wild_available`、
`captured_from_wild` 和 `migrated_existing_instance`。后两种状态必须有
`uniqueInstanceId`，并永久禁止再次生成该来源的序号 `0` 实例。

### 5.2 四类线索

每个野生蛊恰好创作四条核心线索：

1. `clue_habitat`：栖息地点或环境反应。
2. `clue_feeding`：食痕、诱饵或食性。
3. `clue_activity`：时辰、天气和行动方式。
4. `clue_capture_weakness`：容器、接近方式或收服弱点。

线索取得后永久保存，不因离开、失败、战斗或日结算清除。

信息节奏：

| 已知线索 | 玩家信息 |
| ---: | --- |
| 0-1 | 只显示能力大类 |
| 2 | 显示最多两个候选和粗略准备建议，允许冒险收服 |
| 3 | 确认具体蛊名、品阶和两项准确准备条件 |
| 4 | 确认全部三项准备条件和原著食性 |

### 5.3 观察成本

- 到达有效生态点后，观察本身消耗一个 `observationPoint`，不额外增加
  世界时间，也不增加 `wanderCount`。
- 每次野外远征共享三个 `observationPoint`，由
  `observationBudget.expeditionSeed` 绑定本次远征。MVP 只有酒虫一个生态
  机会，未来增加多个机会时也不得各自刷新三点。
- 未用完点数在远征结束时清除，不跨远征累积。
- 查看札记、候选和已知线索消耗为零。
- 同一线索不得重复消耗观察点。
- 已经没有可发现线索时，观察按钮必须禁用并说明原因。

观察点限制的是一次远征的信息量，不创造每日任务。玩家正常移动已经按
野外规则支付时间。

### 5.4 酒虫固定内容

唯一机会 ID 为 `tracking_wine_worm_flower_wine`，能力大类为
`gu_family_cultivation_support`。前三条线索可以按任意顺序观察；取得三条
后识别酒虫，才开放第四条收服弱点推演。因此前三条恰好揭示诱饵和时机，
第四条再揭示容器，和信息节奏表一致。

| Clue ID | 类别 | 固定来源 | 明确信息 |
| --- | --- | --- | --- |
| `clue_wine_habitat_stone_fissure` | `clue_habitat` | `node_qm_moss_wall` 观察石缝酒香与黏痕 | 原著事实：目标藏在狭窄石缝，并与隐藏入口有关 |
| `clue_wine_feeding_green_bamboo_wine` | `clue_feeding` | `node_qm_bamboo_shadow` 对比酒痕 | 原著事实：青竹酒可诱出并使其迟缓 |
| `clue_wine_activity_rain_dawn` | `clue_activity` | `node_qm_stream_bend` 对比湿痕与时辰 | MVP 创作：雨后清晨是正确时机 |
| `clue_wine_capture_drunk_sealed_jar` | `clue_capture_weakness` | 已识别后在 `node_qm_old_pine` 完成札记推演 | MVP 推演：用软塞酒坛封存迟缓目标 |

固定缺失线索揭示顺序是上表顺序，已经拥有的项跳过。前三个观察点足以让
玩家识别目标并进行一次 85% 以下的冒险尝试；完整 100% 准备需要下一次
远征再完成一条推演，或由一次失败自动补足缺失信息。

酒虫初始 `availableNodeId = "node_qm_moss_wall"`。失败后的移动不随机，
沿以下相邻节点循环前进一步：

```text
node_qm_moss_wall
  -> node_qm_stream_bend
  -> node_qm_old_pine
  -> node_qm_bamboo_shadow
  -> node_qm_boar_scrape
  -> node_qm_split_stone
  -> node_qm_moss_wall
```

## 6. 收服规则

### 6.1 准备槽

一次低阶野生蛊收服只选择三个槽：

- `baitId`：诱饵。
- `timingId`：时辰或天气。
- `containerId`：抽象的封存方式，不对应库存物品。

获得两条线索后允许提交。少于两条线索时按钮禁用，输入不收费。

酒虫各槽只允许以下固定 ID：

| 槽位 | 可选 ID | 正确项 |
| --- | --- | --- |
| 诱饵 | `bait_green_bamboo_wine`、`bait_cloudy_rice_wine`、`bait_moon_orchid_petals` | `bait_green_bamboo_wine` |
| 时机 | `timing_after_rain_dawn`、`timing_clear_midday`、`timing_dry_night` | `timing_after_rain_dawn` |
| 容器 | `container_corked_wine_jar`、`container_cloth_pouch`、`container_open_bamboo_basket` | `container_corked_wine_jar` |

错误项是有限界面选项，不从自由文本解析。只有诱饵槽对应实际库存并在
提交时消耗；时机和 `containerId` 都是抽象条件，不验证数量、不转入实例、
不销毁物品。未来若把容器改成实体道具，必须另立迁移和原子结算契约。

线索已经验证的准备槽自动选中正确项并锁定，避免玩家重复抄答案；尚未
验证的槽才允许猜测。取得四条线索后三个槽都锁定为正确项，因此不会出现
“已知全部答案却故意选错、失败后又无新线索可揭示”的空转状态。

### 6.2 酒虫固定成功表

| 正确准备项 | 基础成功率 |
| ---: | ---: |
| 0 | 40% |
| 1 | 55% |
| 2 | 70% |
| 3 | 85% |
| 3 且四条线索全部取得 | 100% |

MVP 酒虫不再叠加属性、盗道等级、战斗等级或付费道具修正。界面直接显示
最终百分比和每项准备是否已由线索验证。

未来野生蛊可以声明 `wildnessModifier`，但：

- 该修正不适用于 MVP 酒虫。
- 具备该蛊全部专属线索且三项准备全部正确时，内容仍可声明 100% 成功。
- 一转玩家不得直接收服二转野生蛊；只能标记机会并在修为达标后回来。

### 6.3 成本与失败推进

一次已通过验证的收服提交：

- 消耗一个世界时间点。
- 消耗所选诱饵一份。
- 创建稳定
  `captureAttemptId = "gu-capture:<trackingOpportunityId>:<attemptOrdinal>"`。
- 结算一次或直接应用 100% 结果。

失败时：

1. 不生成蛊实例。
2. 保留所有已知线索和身份判断。
3. 按固定 `clueOrder` 自动揭示一条尚未取得的线索。
4. 目标移动到内容声明的相邻生态点。
5. 设置 `availableFromDay = currentDay + 1`。
6. 自动保存完整失败结果。

失败不造成永久伤势、装备损坏或额外支线。由于失败会揭示线索，玩家在
完整准备后一定可以消除随机性。

### 6.4 原子顺序

1. 验证机会、线索数、节点、目标可用日、准备 ID、诱饵数量和剩余时间。
2. 快照输入，创建 `captureAttemptId`，扣除一个时间点和一份诱饵。
3. 读取成功率。
4. 成功率为 100 时不读取随机数；否则读取并提交一个确定性随机结果。
5. 成功时用当前 spawn ordinal 生成唯一 `contained_unrefined` 实例，将
   该来源下一序号原子改为 1，把机会改为
   `completed = true`、`resolutionType = "captured_from_wild"` 并保存
   `uniqueInstanceId`。实例必须使用 13.1 的完整
   `createContainedGuInstance` 构造器，捕获参数为玩家 holder/owner、
   `not_required` 和酒虫定义。
6. 失败时应用线索和迁移结果。
7. 自动保存。
8. 最后开始表现动画。

任何无效输入不得扣除时间、诱饵或随机游标。

每次有效提交在 `captureResolutionsById[captureAttemptId]` 保存机会 ID、
三个选择 ID、成功率、`randomCursorBefore`、FNV-1a hash 或 `null`、成功布尔值、
揭示线索 ID 或 `null`、结算日和结果实例 ID 或 `null`。同一
`captureAttemptId` 再次送达时直接返回已存结果，不得再次收费。

## 7. 炼化与所有权

### 7.1 状态

```text
wild_unowned（只存在于追踪机会，不生成实例）
  -> contained_unrefined
  -> refining
  -> refined_bonded
       -> consumed_advancement
```

- `contained_unrefined`：蛊已经被妥善封存并归 `inventoryOwnerId`，但尚未
  与任何人建立炼化联系，不能催动、出战、成长或升炼。封存方式不是独立
  库存物品。
- `refining`：已投入部分真元，进度保存为 `0..99`。
- `refined_bonded`：进度达到 100，蛊与玩家建立炼化联系并开放养护与能力。
- `consumed_advancement`：已被升炼消耗的实例墓碑，只用于追溯原子结算。

`lifecycleStatus` 的唯一合法值为 `contained_unrefined`、`refining`、
`refined_bonded` 和 `consumed_advancement`。实例进入
`consumed_advancement` 后不得离开。`wild_unowned` 是机会状态，不是
实例状态。MVP 养护不会永久杀死唯一蛊实例。

财产所有权和炼化联系必须分开：

- `inventoryOwnerId` 表示蛊实例的最终所有权。捕获、分配、继承或成功
  偷盗后立即设为玩家。
- `refinedOwnerId` 表示谁能够催动该蛊。炼化完成前为 `null`。
- `holderId` 表示当前物理持有者；转移结算必须同时明确它和
  `inventoryOwnerId`，不能从场景位置猜测。
- `concealmentStatus` 的合法值为 `not_required`、`unhidden`、`hidden`、
  `aperture` 和 `body_implanted`，它只描述保管方式，不改变所有权。
- 成功偷盗产生的最终所有权不会因后续炼化状态、战败或读档被撤销。

低阶 MVP 炼化不做第二次随机检定。投入不会失败、倒退或因读档重掷。

旧酒虫偷盗路线保留一次性藏匿准备：

- 偷到但尚未藏匿时为 `unhidden`；在安全地点花一个时间点可确定性改为
  `hidden`。
- 这一步不做暴露检定，不产生追踪、热度或事后支线；偷盗成功本身已经
  结算完毕。
- 旧路线的酒虫必须为 `hidden` 才能开始炼化。生态收服使用正确封存方式，
  家族分配、继承和交易属于清白来源，三者均为 `not_required`。
- 已经是 `hidden` 或 `not_required` 时，重复藏匿按钮禁用且不收费。

### 7.2 分段炼化

每次炼化行动：

- 必须位于安全地点。
- 玩家修为品阶必须不低于蛊的品阶；未达标只能保管，输入不收费。
- 必须满足该实例的 `concealmentStatus` 要求。
- 玩家选择投入 `1..8` 点真元。
- 本次时间成本为 `ceil(投入真元 / 4)`，即一到四点真元消耗一个时间点，
  五到八点真元消耗两个时间点。
- 每点真元固定增加 `12.5` 炼化进度。
- 最终进度向下显示为整数，但内部保留精确值。
- 八点真元和两个时间点可以一次完成一只低阶蛊的炼化。

超过完成所需的投入被输入验证拒绝，不多扣真元。进度达到 100 后：

- `inventoryOwnerId = char_player` 保持不变。
- `refinedOwnerId = char_player`。
- `lifecycleStatus` 改为 `refined_bonded`。
- `careStatus` 改为 `fed`。
- 一般蛊的 `concealmentStatus` 改为 `aperture`；地听肉耳草完成移植时改为
  `body_implanted`。
- `feedingMode === "stocked"` 时初始 `supplyDays = 7`；其他模式为 `null`。
- 初始 `growthXp = 0`。
- 九叶生机草额外初始化 `availableLeaves = 9` 和 `lastHarvestDay = null`；
  其他蛊的 `availableLeaves = null`。
- 写入一次性 `refinementResolutionId`。

地听肉耳草的移植可与最后一次炼化行动合并，不增加炼化时间之外的额外
时间费用。

## 8. 低压力养护

### 8.1 原著食物

MVP 养护从 `refined_bonded` 开始。`contained_unrefined` 和 `refining` 视为
处于临时封存，不扣口粮、不累计断粮天数；这是降低过渡期压力的游戏化
简化，不声称原著蛊可以永久绝食。

| 蛊 | 原著食物 | UI 计量 |
| --- | --- | --- |
| 月光蛊 | 每日四片月兰花瓣 | `supplyDays` |
| 酒虫 | 青竹酒；一坛约四天 | `supplyDays` |
| 白豕蛊 | 成年猪肉；约五日一头 | `supplyDays` |
| 玉皮蛊 | 玉石；约十日二两 | `supplyDays` |
| 地听肉耳草 | 人参根，可晒干储存 | `supplyDays` |
| 九叶生机草 | 水与阳光 | `self_sustaining` |

库存 UI 显示原著食物名称，但日常结算统一使用供应天数，玩家无需每天
拆分花瓣、猪肉或人参数量。

升炼结果的食物处理必须服从资料层：

| 蛊 | 资料状态 | MVP `feedingMode` | 处理 |
| --- | --- | --- | --- |
| 月芒蛊 | 尚未考证 | `canon_pending` | 暂不扣口粮，不得推测食物 |
| 四味酒虫 | 当前摘录未找到 | `canon_pending` | 暂不扣口粮，不得把四味酒当作日常食物 |
| 白玉蛊 | 继承玉皮蛊的食性 | `stocked` | 显示玉石，每七日三块元石 |

`feedingMode` 只允许 `stocked`、`self_sustaining` 和 `canon_pending`。
`canon_pending` 是资料缺口保护，不代表原著中无需喂养；以后补齐资料时，
只从启用该规则后的下一次日结算开始收费，不追扣旧存档。

### 8.2 一键补给

在古月山寨或允许补给的安全商人处，可以执行：

`补充全部已炼化蛊七日口粮`

- 打开和查看界面为零时间。
- 补给行为为零时间。
- 每只蛊最多储备 21 天。
- 每次确认只为 `feedingMode === "stocked"` 且 `supplyDays <= 14` 的蛊各
  增加恰好七天；15 到 21 天的蛊不参与本次结算。
- 每只参与的蛊只收一份七日费用，不做不足七天的零售拆分。
- 元石不足时，界面显示可补给的子集，默认优先当前出战蛊，玩家可取消。

每七日基础费用：

| 蛊 | 元石 |
| --- | ---: |
| 月光蛊 | 1 |
| 酒虫 | 2 |
| 白豕蛊 | 2 |
| 玉皮蛊 | 2 |
| 地听肉耳草 | 1 |
| 九叶生机草 | 0 |

六只基础蛊全部持有且尚未升炼时，七日总维护费上限为八块元石。升炼为
白玉蛊后按三块元石的七日费用替代被消耗输入的费用。系统不得为普通补给
生成独立任务、随机短缺或讨价还价界面。

### 8.3 自动喂养

`guSystem.autoFeed = true` 是新游戏和迁移默认值，并在 MVP 中固定开启，
不提供关闭按钮。这样玩家只管理补给，不承担逐只点击喂食。

每日结束时：

1. 对每只 `lifecycleStatus === "refined_bonded"` 的蛊结算一次。
2. `self_sustaining` 和 `canon_pending` 蛊视为已喂养，不扣供应。
3. `stocked` 且 `supplyDays > 0` 时扣一并视为已喂养。
4. `stocked` 且供应为零时按一次零供应日处理。
5. 应用成长经验。
6. 自动保存。

视为已喂养时必须把 `zeroSupplyDays = 0` 并更新 `careStatus = "fed"`。

### 8.4 断粮状态

`zeroSupplyDays` 只在连续零供应的日结算增加，达到 30 后饱和；补给后
归零。

| 连续零供应 | 状态 | 影响 |
| ---: | --- | --- |
| 0 | `fed` | 正常 |
| 1-2 | `hungry` | 仅预警，不降低能力 |
| 3-6 | `weak` | 不获得成长或升炼资格；向战斗系统输出 `weak` 状态 |
| 7+ | `dormant` | 不能催动、出战、成长或升炼；补给后可恢复 |

`careStatus` 的唯一合法值为 `not_applicable`、`fed`、`hungry`、`weak` 和
`dormant`。未炼化和已消耗实例只能使用 `not_applicable`。`weak` 对命中、
伤害、减伤、行动经济和真元成本的具体影响全部留给战斗规范；本文不预设
倍率或取整。

补给立即把 `careStatus` 从 `hungry`、`weak` 或 `dormant` 恢复为 `fed`，
不要求额外任务，也不收复苏费，但恢复当天不补发错过的经验。第 30 次及
以后的零供应结算仍保持 `dormant` 和 `zeroSupplyDays = 30`，不会死亡。

UI 在剩余两天、零供应和即将休眠时各警告一次。警告记录按蛊实例保存，
读档不能重复弹窗。警告 ID 固定为
`gu-care-warning:<instanceId>:<threshold>:<worldDay>`；只有跨过对应阈值
的当日生成，因此补给后的下一次断粮仍会正常预警。

## 9. 成长经验

### 9.1 目标

成长经验代表玩家对该蛊的养护和催动熟练，不改变原著品阶。它只用于
MVP 简化升炼的准备门槛。

每只已炼化、未休眠的蛊保存 `growthXp = 0..100`。

### 9.2 获取

| 来源 | 经验 | 限制 |
| --- | ---: | --- |
| 日结算时处于 `fed` | +3 | 自动，无操作 |
| 当日第一次产生实际效果的催动 | +7 | 每只蛊每日一次 |
| 蛊专属创作里程碑 | +15 | 每个稳定 milestone ID 一次 |

普通可重复来源每日最多提供 10 点，即自动养护 3 点加首次有效催动 7 点。
创作里程碑不受每日上限影响。
MVP 六只基础蛊不强制配置任何里程碑；即使零里程碑，也能依靠自动养护和
正常使用达到 100。该行只是给后续重要剧情保留奖励接口。

以下行为不提供经验：

- 打开面板。
- 对无效目标空放。
- 在同一天重复低价值催动。
- 保存和加载。
- 未炼化、断粮虚弱或休眠状态。
- 战后搜刮。

经验不衰减，不设置单独训练支线，也不要求连续登录。

## 10. 简化升炼

### 10.1 通用规则

MVP 使用 `advancementMode = "mastery_simplified"`：

- 结果必须是资料层已经确认的原著具名蛊。
- 所有输入蛊必须已炼化、处于 `fed` 或 `hungry`，且成长达到 100。
- 玩家修为必须至少等于结果品阶。
- 在安全地点执行。
- 成功率固定为 100%。
- 不读取随机数。
- 输入蛊被消耗，生成一个新的结果实例。
- 输入实例改为 `consumed_advancement` 并保留墓碑，不从存档中删除。
- 被消耗实例同时改为 `careStatus = "not_applicable"`、
  `refinedOwnerId = null` 和 `supplyDays = null`。
- 结果实例初始为 `refined_bonded`，玩家同时是
  `inventoryOwnerId`、`holderId` 和 `refinedOwnerId`，
  `concealmentStatus = "aperture"`，`growthXp = 0`。
- 结果的 `feedingMode` 来自蛊定义；`stocked` 初始 `supplyDays = 7`，
  其他模式为 `null`。
- 结果实例使用对应 `advancementId` 当前的 spawn ordinal，并在同一事务
  将下一序号加一；实例必须使用 13.1 的完整
  `createAdvancedGuInstance` 构造器。
- 时间、真元、元石、输入消耗和结果生成原子提交。

### 10.2 MVP 配置

| Advancement ID | 结果 | 输入 | 时间 | 真元 | 元石 |
| --- | --- | --- | ---: | ---: | ---: |
| `advance_moonlight_to_moon_glow` | 月芒蛊 | 月光蛊 | 2 | 8 | 8 |
| `advance_wine_worm_to_four_flavors` | 四味酒虫 | 酒虫 | 2 | 8 | 8 |
| `advance_white_boar_jade_skin_to_white_jade` | 白玉蛊 | 白豕蛊 + 玉皮蛊 | 2 | 10 | 12 |

上述成本仅是 MVP 游戏化简化，不声称是原著完整蛊方。

白玉蛊要求两只输入蛊都达到成长 100。成功后：

- 两个输入实例同时消耗。
- 一豕之力的永久角色成长保留。
- 创建一个白玉蛊实例。
- 不允许只消耗其中一只或产生部分结果。

### 10.3 未来蛊方接口

每个升炼记录预留：

```js
{
  advancementId,
  resultGuDefinitionId,
  advancementMode,
  inputGuRequirements: [],
  materialRequirements: [],
  environmentRequirements: [],
  cultivationRequirement,
  timeCost,
  essenceCost,
  stoneCost
}
```

未来可以把单条记录切换为 `advancementMode = "canonical_recipe"`。迁移规则：

- 已存在结果蛊不降级。
- 已完成的 `advancementResolutionId` 不重新收费。
- 正在进行但未提交的升炼不保存中间扣费；玩家加载后按新要求重新确认。
- 旧存档输入蛊、经验、口粮和所有权不得重算。

已知原著蛊方先作为不可执行资料保留：

| 结果 | 已知原著输入 | MVP 差异 |
| --- | --- | --- |
| 月芒蛊 | 月光蛊 + 两只小光蛊 | MVP 暂不要求小光蛊 |
| 四味酒虫 | 两只酒虫 + 酸甜苦辣四种酒 | MVP 暂不要求第二只酒虫和四酒 |
| 白玉蛊 | 白豕蛊 + 玉皮蛊；方源实例另使用雪银獠牙 | MVP 只保留两只核心蛊输入 |

未来切换时必须使用资料层的 Canon ID 建立新材料定义，不能把本表文字当作
自由字符串。雪银獠牙在资料层只作为方源成功案例材料，不在本规范中断言
它是所有白玉蛊方的必需品。

## 11. 六只蛊的玩法接口

本章的“原著语义”来自资料层；所有每日次数、进度、时间、真元和库存上限
均是 MVP 平衡参数，不是原著事实。战斗相关参数仍由后续战斗规范定义。

### 11.1 月光蛊

- 原著语义：发出蓝色月刃进行远程切割。
- 系统标签：`combat_ranged_attack`、`moon_path`。
- 非战斗用途：切开明确标记为一转可破坏的藤蔓、绳索或薄障碍。
- 战斗伤害、射程和命中由战斗规范定义。
- MVP 升炼只开放月芒蛊。

### 11.2 酒虫

- 原著语义：使一转青铜真元临时提升一个小境界使用。
- 系统标签：`cultivation_essence_quality`。
- 修炼行动可以读取 `essenceQualityMinorStageBonus = 1`。
- 不提高资质，不直接增加空窍上限。
- MVP 升炼结果是四味酒虫；二转后的战斗和修炼数值由后续规范读取。

### 11.3 白豕蛊

- 原著语义：逐步增加肉身力量，最终获得一豕之力。
- 系统标签：`body_strength_growth`。
- 当日第一次有效力量训练同时提供成长经验和 `boarStrengthProgress +10`。
- 只有 `fed` 或 `hungry` 状态的训练增加力量进度；`weak` 状态即使勉强
  催动也不增加。
- `boarStrengthProgress` 上限 100，不衰减。
- 达到 100 后写入永久角色状态 `strength_boar_1`。
- 白豕蛊后来被合炼也不删除该永久状态。
- 战斗中的伤害、推撞和负重效果由战斗规范定义。

### 11.4 玉皮蛊

- 原著语义：低真元消耗强化皮肤，提供一转防御。
- 系统标签：`combat_body_defense`。
- 可以通过明确的一转环境伤害检查。
- 真元成本、减伤和持续方式由战斗规范定义。

### 11.5 地听肉耳草

- 原著语义：根须接触地面时侦察范围显著提升，资料样板范围为三百步。
- 系统标签：`exploration_ground_sense`。
- 在野外图中揭示内容标记为三百步范围内的有声事件类别和大致方向。
- 不直接显示隐藏路线答案、敌人精确属性或无声机关。
- 根须不能接地时按钮禁用并说明原因。
- 战斗中的侦察、伏击和先手效果由战斗规范定义。

### 11.6 九叶生机草

- 原著语义：叶片可成为生机叶，投入真元可以再生，是医疗和交易资产。
- 系统标签：`healing_leaf_production`、`renewable_asset`。
- MVP 平衡：实例保存 `availableLeaves = 0..9`。
- MVP 平衡：采摘为零时间，每日最多一次，生成一片生机叶。
- MVP 平衡：在安全地点投入四点真元和一个时间点，可以把缺失叶片全部
  恢复到九片。
- 生机叶的战斗治疗量由战斗规范定义。
- MVP 平衡：库存最多三片可交易生机叶；超过上限时采摘按钮禁用，防止
  无成本刷经济。

## 12. 时间与压力预算

系统不得让玩家因为持有更多蛊而每天增加必须点击的行动。

必需操作上限：

- 日常喂养：零次，默认自动。
- 七日补给：一次批量操作，零时间。
- 每只蛊成长：正常使用和日结算自动推进。
- 生态追踪：一个机会最多四条线索。
- 完整准备后的收服：一次必定成功。
- 偷盗路线的酒虫藏匿：至多一次确定性行动。
- 低阶炼化：最多八点真元和两个时间点，可以一次完成。
- 升炼：满足门槛后一次原子行动。

世界时间成本：

| 行为 | 时间点 |
| --- | ---: |
| 查看蛊册、札记和口粮 | 0 |
| 在生态点观察 | 0，消耗一个 observationPoint |
| 提交一次收服 | 1 |
| 藏匿偷盗路线的酒虫 | 1，仅一次 |
| 一次分段炼化 | `ceil(投入真元 / 4)`，范围 1-2 |
| 一键补给 | 0 |
| 采摘一片生机叶 | 0 |
| 恢复九叶生机草叶片 | 1 |
| 单蛊升炼 | 2 |
| 双蛊合炼 | 2 |

时间结算继续使用现有玩家结果优先语义。一次行为只收费一次。

## 13. 存档契约

### 13.1 新分支

V3 状态增加等价结构：

```js
{
  guSystem: {
    version: 1,
    autoFeed: true,
    instancesById: {},
    trackingByOpportunityId: {},
    observationBudget: {
      expeditionSeed: null,
      remaining: 0
    },
    captureResolutionsById: {},
    completedRefinementResolutionIds: [],
    completedAdvancementResolutionIds: [],
    completedGuMilestoneIds: [],
    warningLedger: [],
    nextSpawnOrdinalBySourceId: {},
    lastCareSettlementDay: null,
    characterProgressByCharacterId: {}
  }
}
```

远征开始时用当前 `wilderness.expeditionSeed` 初始化
`observationBudget = { expeditionSeed, remaining: 3 }`。保存、加载或战斗
返回只恢复该对象；远征结束后改回 `null/0`。同一天的日结算必须先比较
`lastCareSettlementDay`，已经结算过则直接返回，不得重复扣粮或加经验。

每个实例至少保存：

```js
{
  instanceId,
  guDefinitionId,
  canonId,
  rank,
  spawnOrdinal,
  holderId,
  inventoryOwnerId,
  refinedOwnerId,
  lifecycleStatus,
  concealmentStatus,
  careStatus,
  feedingMode,
  refinementProgress,
  growthXp,
  supplyDays,
  zeroSupplyDays,
  lastMeaningfulUseDay,
  availableLeaves,
  lastHarvestDay,
  refinementResolutionId,
  producedByAdvancementResolutionId,
  consumedByAdvancementResolutionId,
  sourceId
}
```

字段约束：

- `refinementProgress` 是 `0..100`、步长 `12.5` 的数。
- `growthXp`、`zeroSupplyDays` 和 `availableLeaves` 分别为 `0..100`、
  `0..30` 和 `0..9` 的整数。
- `supplyDays` 仅在 `refined_bonded + stocked` 时为 `0..21` 的整数；未炼化、
  炼化中、已消耗或其他 feeding mode 必须为 `null`。
- `availableLeaves` 仅在已炼化九叶生机草实例上为整数；未炼化九叶生机草
  和其他实例必须为 `null`。
- `lastMeaningfulUseDay`、`lastHarvestDay`、`refinementResolutionId`、
  `producedByAdvancementResolutionId` 和 `consumedByAdvancementResolutionId`
  均允许 `null`。
- `characterProgressByCharacterId.char_player` 至少保存
  `boarStrengthProgress: 0..100` 和去重的 `permanentEffectIds`；一豕之力
  的固定 ID 为 `strength_boar_1`。

所有新实例只能通过以下两个等价构造器产生。字段名必须全部写出，不能依靠
调用方事后补默认值。

`createContainedGuInstance(definition, sourceId, spawnOrdinal, holderId,
inventoryOwnerId, concealmentStatus)`：

```js
{
  instanceId:
    `gu-instance:${definition.id}:${sourceId}:${spawnOrdinal}`,
  guDefinitionId: definition.id,
  canonId: definition.canonId,
  rank: definition.rank,
  spawnOrdinal,
  holderId,
  inventoryOwnerId,
  refinedOwnerId: null,
  lifecycleStatus: "contained_unrefined",
  concealmentStatus,
  careStatus: "not_applicable",
  feedingMode: definition.feedingMode,
  refinementProgress: 0,
  growthXp: 0,
  supplyDays: null,
  zeroSupplyDays: 0,
  lastMeaningfulUseDay: null,
  availableLeaves: null,
  lastHarvestDay: null,
  refinementResolutionId: null,
  producedByAdvancementResolutionId: null,
  consumedByAdvancementResolutionId: null,
  sourceId
}
```

`createAdvancedGuInstance(definition, advancementId, spawnOrdinal,
advancementResolutionId)`：

```js
{
  instanceId:
    `gu-instance:${definition.id}:${advancementId}:${spawnOrdinal}`,
  guDefinitionId: definition.id,
  canonId: definition.canonId,
  rank: definition.rank,
  spawnOrdinal,
  holderId: "char_player",
  inventoryOwnerId: "char_player",
  refinedOwnerId: "char_player",
  lifecycleStatus: "refined_bonded",
  concealmentStatus: "aperture",
  careStatus: "fed",
  feedingMode: definition.feedingMode,
  refinementProgress: 100,
  growthXp: 0,
  supplyDays: definition.feedingMode === "stocked" ? 7 : null,
  zeroSupplyDays: 0,
  lastMeaningfulUseDay: null,
  availableLeaves:
    definition.id === "gu_nine_leaf_vitality_grass" ? 9 : null,
  lastHarvestDay: null,
  refinementResolutionId: null,
  producedByAdvancementResolutionId: advancementResolutionId,
  consumedByAdvancementResolutionId: null,
  sourceId: advancementId
}
```

`advancementResolutionId` 固定为
`gu-advancement:<advancementId>:<spawnOrdinal>`。同一事务把它写入结果
实例、每个输入实例的 `consumedByAdvancementResolutionId` 和
`completedAdvancementResolutionIds`。三个位置缺一即整次回滚。

所有列表使用稳定 ID 去重。未知蛊、线索、材料、机会或升炼 ID 必须验证
失败并阻止场景开始，不能静默丢弃。

### 13.2 实例 ID

内容定义 ID 使用：

```text
^[a-z][a-z0-9_]{0,63}$
```

实例 ID 由运行时构造：

```text
gu-instance:<guDefinitionId>:<sourceId>:<spawnOrdinal>
```

基础六蛊使用以下固定来源 ID：

| 蛊 | Source ID |
| --- | --- |
| 月光蛊 | `source_gu_moonlight_academy_allocation` |
| 酒虫 | `tracking_wine_worm_flower_wine` |
| 白豕蛊 | `source_gu_white_boar_flower_wine_cache_1` |
| 玉皮蛊 | `source_gu_jade_skin_flower_wine_cache_2` |
| 地听肉耳草 | `source_gu_earth_ear_flower_wine_cache_3` |
| 九叶生机草 | `source_gu_nine_leaf_estate_settlement` |

升炼结果使用对应 `advancementId` 作为 `sourceId`。`spawnOrdinal` 必须持久
化，保存和加载不得增加它；六个固定基础来源在 MVP 的合法序号都只有 `0`。

## 14. 兼容迁移

继续先读取 `tianwai-daojuren-save-v3`，再读取
`tianwai-daojuren-save-v2`。不删除旧 key。

迁移只创建以下固定实例一次：

```js
{
  instanceId:
    "gu-instance:gu_wine_worm:tracking_wine_worm_flower_wine:0",
  guDefinitionId: "gu_wine_worm",
  canonId: "canon_gu_wine_worm",
  rank: 1,
  spawnOrdinal: 0,
  sourceId: "tracking_wine_worm_flower_wine",
  holderId: OWNER_MAPPING,
  inventoryOwnerId: OWNER_MAPPING,
  refinedOwnerId: null,
  lifecycleStatus: "contained_unrefined",
  concealmentStatus: "not_required",
  careStatus: "not_applicable",
  feedingMode: "stocked",
  refinementProgress: 0,
  growthXp: 0,
  supplyDays: null,
  zeroSupplyDays: 0,
  lastMeaningfulUseDay: null,
  availableLeaves: null,
  lastHarvestDay: null,
  refinementResolutionId: null,
  producedByAdvancementResolutionId: null,
  consumedByAdvancementResolutionId: null
}
```

`OWNER_MAPPING` 把 `merchant`、`fangYuan`、`player` 分别映射为
`char_wine_merchant`、`char_fang_yuan`、`char_player`。然后只覆盖：

| 旧组合 | 覆盖字段 |
| --- | --- |
| merchant + carried | 保持基准对象 |
| merchant + guest-room | 保持基准对象；原 guest-room 进度由 `legacyHolderAttemptCount` 和情报保留 |
| fangYuan + carried | 保持基准对象 |
| player + unhidden | `concealmentStatus = "unhidden"` |
| player + hidden | `concealmentStatus = "hidden"` |
| player + refined | `refinedOwnerId = "char_player"`；`lifecycleStatus = "refined_bonded"`；`concealmentStatus = "aperture"`；`careStatus = "fed"`；`refinementProgress = 100`；`supplyDays = 7`；`refinementResolutionId = "gu-refinement:migration:wine-worm"` |

其他 owner/status 组合验证失败并显示存档兼容错误，不猜测状态。

同一次迁移还必须写入：

```js
trackingByOpportunityId.tracking_wine_worm_flower_wine = {
  trackingOpportunityId: "tracking_wine_worm_flower_wine",
  guDefinitionId: "gu_wine_worm",
  abilityFamilyId: "gu_family_cultivation_support",
  clueIds: [],
  identifiedGuDefinitionId: IDENTIFIED_MAPPING,
  availableNodeId: null,
  availableFromDay: null,
  attemptOrdinal: 0,
  resolutionType: "migrated_existing_instance",
  uniqueInstanceId:
    "gu-instance:gu_wine_worm:tracking_wine_worm_flower_wine:0",
  holderRouteIntelIds: LEGACY_INTEL_MAPPING,
  legacyHolderAttemptCount: wineWorm.failedAttempts ?? 0,
  completed: true
};

nextSpawnOrdinalBySourceId.tracking_wine_worm_flower_wine = 1;
```

`IDENTIFIED_MAPPING` 在旧 owner 不是 `merchant`，或
`flags.correctWineJar === true` 时为 `gu_wine_worm`，否则为 `null`。
旧线索只映射为持有人路线情报，不伪装成生态观察：

| 旧字段或值 | 新 Intel ID |
| --- | --- |
| `flags.clerkObserved` 或 `clues` 含 `patrol-handover` | `intel_wine_patrol_handover` |
| `flags.patrolSheet` 或 `clues` 含 `patrol-sheet` | `intel_wine_patrol_sheet` |
| `flags.patrolHint` 或 `clues` 含 `patrol-window-hint` | `intel_wine_patrol_window_hint` |
| `flags.correctWineJar` 或 `clues` 含 `correct-wine-jar` | `intel_wine_correct_merchant_jar` |

`LEGACY_INTEL_MAPPING` 按上表注册表顺序去重。若旧状态已经炼化，还要把
`gu-refinement:migration:wine-worm` 加入
`completedRefinementResolutionIds`。空 `clueIds` 和 `completed = true`
共同保证旧唯一实例在商贩或方源手里时，生态捕获也不会再开放。

迁移必须：

- 保留旧 `wineWorm`、任务、时钟、玩家、方源、线索、旗标和库存字段。
- 不复制第二只酒虫。
- 不因新养护系统立即扣粮。
- 所有已炼化旧蛊获得七天初始供应。
- 默认自动喂养开启。
- 不补算迁移前日期的饥饿或成长经验。
- 保留旧炼化动作已经给予的修为值；新通用炼化本身不再额外奖励修为。
- `hidden` 绝不能迁移为 `refining`，因为藏匿和炼化是两个独立状态。
- 同一 V3 存档重复加载时不得重复创建实例、口粮或迁移奖励。
- 在旧运行时代码移除前，酒虫转移、藏匿和炼化必须同时更新新实例与旧
  `wineWorm` 字段；`guSystem` 是权威值，旧字段是兼容镜像。一次动作只
  自动保存一次。加载时若两者都存在却语义不一致，必须报兼容错误，不能
  静默选择一边。

必须提供四组迁移测试向量：

1. 真实 V2 初始存档 `merchant + carried`：创建固定实例，holder/owner 为
   商贩，机会已完成，下一序号为 1。
2. 真实 V2 `merchant + guest-room + failedAttempts: 1`，并带有
   `clerkObserved`、`patrolHint` 和对应旧 clues：保持商贩持有，
   `legacyHolderAttemptCount = 1`，生成两条去重 Intel，机会仍已完成。
3. 无 `guSystem` 的旧 V3 `player + hidden`：创建同一固定实例，状态为
   `contained_unrefined + hidden`，不写炼化完成 ID。
4. 已有 `guSystem.version === 1` 的 V3：迁移函数返回深度相等状态；连续调用
   两次也不增加实例、口粮、情报、完成 ID 或 spawn ordinal。

默认分支构造、旧酒虫映射、校验和 V3 key 写入必须是一个内存事务；任何
映射失败都不得先留下空 `guSystem` 后再启动场景。

## 15. 确定性与读档

成功率低于 100 时使用固定 `gu-capture-v1` 算法：

1. 按顺序取五个 UTF-8 字段：版本字符串 `gu-capture-v1`、
   `expeditionSeed`、`trackingOpportunityId`、提交前 `attemptOrdinal` 的
   十进制字符串、提交前 `wilderness.randomCursor` 的十进制字符串。
2. 每个字段编码为“四字节无符号大端长度 + UTF-8 内容”，五段直接拼接，
   不加分隔符或终止符。
3. 对完整字节串计算 32 位 FNV-1a：初值 `2166136261`；逐字节异或后乘
   `16777619`，每一步只保留无符号低 32 位。JavaScript 必须使用
   `Math.imul(hash, 16777619) >>> 0`。
4. `threshold = floor(chancePercent * 4294967296 / 100)`。
5. 当且仅当 `hash < threshold` 时成功。等于阈值视为失败。
6. `roll = hash / 4294967296` 只用于显示和日志，不参与第二次判定。

固定测试向量：

| Seed / ordinal / cursor | Chance | Hash | Threshold | 结果 |
| --- | ---: | ---: | ---: | --- |
| `demo-seed-001` / `0` / `0` | 40 | `964895450` (`0x398322da`) | `1717986918` | 成功 |
| `demo-seed-002` / `0` / `0` | 40 | `3027336399` (`0xb4717ccf`) | `1717986918` | 失败 |
| `demo-seed-001` / `1` / `1` | 70 | `674334464` (`0x28318700`) | `3006477107` | 成功 |

- `attemptOrdinal` 和 `wilderness.randomCursor` 都在有效提交结算后原子加一。
- 只有成功率小于 100 的有效提交计算哈希；100% 结果不计算哈希且只增加
  `attemptOrdinal`，不增加随机游标。
- 无效输入和 100% 保证成功不推进随机游标。
- 失败揭示的线索使用内容固定 `clueOrder`，不随机。
- `captureResolutionsById` 已存在同一 attempt ID 时直接复用，其中保存的
  hash 和输入游标必须与测试算法一致；读档后不得重算或重掷。
- 炼化、喂养、成长和升炼不使用随机数。

## 16. UI 契约

### 16.1 寻蛊札记

必须显示：

- 能力大类。
- 已知线索 `0..4`。
- 候选蛊和当前可信度层级。
- 诱饵、时机、容器三个准备槽。
- 每项是否已被线索验证。
- 最终收服成功率。
- 失败的明确成本。
- 目标下次可用日。

界面不得显示玩家尚未取得的正确答案。

### 16.2 蛊册

必须显示：

- 名称、品阶、原著能力摘要。
- 所有权和炼化状态。
- 口粮天数与原著食物名称。
- `canon_pending` 时显示“食性资料待考，MVP 暂免维护”，不得显示猜测食物。
- 饥饿状态。
- 成长经验。
- 出战状态。
- 可用升炼结果与未满足条件。

一键补给必须先展示总费用和补给对象，确认后原子结算。

### 16.3 升炼

必须显示：

- 输入蛊。
- 原著具名结果。
- 玩家修为门槛。
- 成长、时间、真元和元石成本。
- 当前 `advancementMode`。
- 专属蛊方尚未启用时明确标记为 MVP 简化规则。

不得把尚未开放的月道分支显示为可执行按钮。

## 17. 验收标准

### 17.1 生态追踪

- 两条线索前不能提交收服。
- 四条线索均可通过有限地图状态取得。
- 线索跨远征、战斗和读档保留。
- 每次远征恰好获得三个观察点。
- 无剩余线索时观察不收费。
- 成功率表对 0、1、2、3 个匹配项分别为 40、55、70、85。
- 四线索和三匹配项为 100，且不读取随机数。
- 失败消耗一次时间和诱饵，揭示一个缺失线索，并在次日开放目标。
- 失败不能复制、删除或永久关闭唯一酒虫实例。

### 17.2 炼化与养护

- 未炼化蛊不能催动、成长或升炼。
- 八点真元和总计两个时间点可以完成低阶蛊炼化。
- 分段炼化保存精确进度，不倒退。
- 迁移旧酒虫不复制实例。
- 日结算自动扣除一天供应，九叶生机草除外。
- 七日补给全部六只的总费用不超过八块元石。
- MVP 自动喂养固定开启，不需要逐只喂食，也不能通过设置冻结饥饿。
- 月芒蛊和四味酒虫在资料食性补齐前不扣口粮，也不追扣历史成本。
- 连续零供应 1、3、7 天分别进入 hungry、weak、dormant；第 30 天封顶，
  不会永久死亡。
- 补给立即恢复休眠蛊，不生成任务或复苏成本。
- 旧 `hidden` 酒虫迁移为已藏匿、未炼化，不跳过八点真元炼化。

### 17.3 成长与升炼

- 正常 fed 日结算增加 3 点。
- 每只蛊每日只有第一次有效催动增加 7 点。
- 重复空放、读档和查看界面不增加经验。
- 经验永不衰减。
- 未达到 100、修为不足或资源不足时不扣任何成本。
- 月芒蛊和四味酒虫各消耗 2 时间、8 真元、8 元石。
- 白玉蛊同时消耗两只成长 100 的输入蛊、2 时间、10 真元和12元石。
- 被升炼消耗的实例保留为 `consumed_advancement` 墓碑，读档不能再次使用。
- 升炼成功不读取随机数，结果不能复制。
- 未来开启蛊方不追收旧结果成本。

### 17.4 压力边界

- 玩家持有六只蛊时，日结算不要求任何点击。
- 普通补给不创建支线。
- 完整线索和准备可以消除收服随机性。
- 炼化和升炼不失败。
- 战斗胜利不直接增加蛊虫库存。
- 本规范中不存在原创盗道蛊。

## 18. 后续边界

后续战斗体系必须为月光蛊、月芒蛊、玉皮蛊、白玉蛊、白豕力量、地听
肉耳草、九叶生机草和生机叶定义战斗接口，但不得修改本规范已经确定的
原著能力和所有权状态。

高阶蛊、三转结果和复杂蛊方另立规范。战斗可以成为高阶蛊的压制前置，
但战斗胜利不得直接把有主蛊或高阶蛊加入玩家库存。
