# 青茅山 MVP 物品、恢复与蛊虫成长设计

版本：`1.0`

状态：已确认，待用户复核书面规格

关联剧本：

- `docs/game-design/qing-mao-mvp-script/01-main-quest.md`
- `docs/game-design/qing-mao-mvp-script/02-q01-wine-worm.md`
- `docs/game-design/qing-mao-mvp-script/03-q02-flower-wine-inheritance.md`
- `docs/game-design/qing-mao-mvp-script/04-q03-jia-jin-sheng-case.md`
- `docs/game-design/qing-mao-mvp-script/05-q04-nine-leaf-vitality-grass.md`
- `docs/game-design/qing-mao-mvp-script/06-q05-qing-shu-fate.md`
- `docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md`

## 1. 目标

本设计解决两个问题：

1. 剧情核心蛊具有固定地点、固定持有人和永久错过窗口，不能依赖反复刷同一只蛊维持成长。
2. 玩家需要稳定的真元、生命、修炼和构筑成长渠道，不能在资源耗尽后只剩睡觉。

最终体验应满足：

- 蛊虫仍是超凡能力和战斗构筑的核心。
- 玩家即使没有获得新的剧情蛊，也能通过境界、熟练、升炼、杀招和资源经营变强。
- 每次有效探索都有资源、情报或成长反馈。
- 核心蛊保持稀有和唯一，不采用刷怪掉蛊、碎片升星或随机装备词条。

## 2. 已确认的设计边界

### 2.1 不建立传统装备体系

以下系统全部取消：

- 武器、防具和饰品成长线。
- 手持、衣甲、随身用具和饰品槽。
- 装备强化、锻造、耐久、洗练、随机词条和套装效果。
- 白、绿、蓝、紫等装备稀有度。
- 为了填充装备栏而设计的大量普通刀剑、护腕、皮甲和首饰。

玩家默认具备普通衣物和基础短刃。它们不进入背包，不提供成长数值，也不参与掉落。

普通工具只负责开启交互选项。玩家持有工具即可自动使用，不需要预先装备。

### 2.2 不设置体力

MVP 不包含：

- 体力值。
- 饥饿值。
- 食物恢复体力。
- 体力药或疲劳恢复药。
- 由负重产生的体力消耗。

时间、真元、生命、元石和任务窗口已经足以形成资源压力。

### 2.3 不设置传统丹药体系

正式分类为：

- 普通药品。
- 消耗型蛊及蛊虫产物。

不设计红药、蓝药、经验药、修为丹、永久属性药丸或可无限叠加的战斗增益药。

### 2.4 不设置随机词条

物品可以拥有固定功能标签，但标签不是随机属性：

```text
可交易 / 限定 / 违禁 / 任务物 / 蛊食 /
医疗 / 一次性 / 有期限 / 不可丢弃
```

同名物品遵循相同效果。差异只来自明确的状态，例如剩余次数、所有者、饥饿度或是否已炼化。

## 3. 能力来源边界

### 3.1 不依赖蛊虫的基础

- 角色基础属性。
- 空窍、资质、境界和真元容量。
- 普通武艺、经验、心性、知识和战术。
- 已发现的地图、身份、证据和敌人弱点。
- 特殊体质或种族只能修正属性、容量、恢复或检定，不生成独立主动技能。

### 3.2 必须依赖蛊虫的内容

- 超凡攻击、防御、治疗、移动、侦察、储物和伪装。
- 蛊虫带来的永久肉身强化。
- 多只蛊按顺序组合形成的杀招。
- 由大量蛊构成的蛊阵和蛊屋。

设计原则是：

> 青茅山 MVP 中，所有由玩家主动触发的超凡能力必须来自一只蛊、组合催动的多只蛊或消耗型蛊。
> 境界、体质和知识可以修改效果与判定，但不能绕过蛊虫直接生成超凡主动技能。

这不等于所有成长、恢复和资源补给只能来自蛊。普通药品、元石、休息、服务和修炼仍然有效。

## 4. 玩家成长轴

玩家拥有六条互相补充的成长路径。

| 成长轴 | 获取方式 | 主要结果 |
| --- | --- | --- |
| 境界 | 吐纳、元石修炼、学堂指导、突破 | 真元上限、真元质量与基础检定提高 |
| 蛊虫 | 任务、捕捉、兑换、商队、炼制、交易或偷取 | 获得新的主动能力或超凡被动 |
| 熟练 | 实战催动和受限训练 | 降低失误、准备时间和少量真元消耗 |
| 升炼 | 蛊方、主材、辅材和炼制条件 | 将一转蛊提升至二转或进入明确分支 |
| 杀招 | 传承、推演、训练和所需蛊虫 | 用已有蛊组合出新的完整能力 |
| 知识与资源 | 调查、关系、地图、身份、食料和元石 | 降低风险并支撑其他成长轴 |

获得新蛊是重要成长，但不是唯一成长。

## 5. 物品分类与存放

| 类别 | 用途 | 存放方式 |
| --- | --- | --- |
| 蛊虫 | 主动能力、超凡被动、杀招组件 | 空窍、蛊虫栏或蛊虫保管处 |
| 元石与功绩 | 交易、修炼、恢复和家族兑换 | 资源栏 |
| 普通药品 | 轻伤、流血、骨伤和普通毒伤 | 行囊，可堆叠 |
| 消耗型蛊及产物 | 战斗急救、一次护命和直接成长 | 行囊，每个个体或批次独立 |
| 蛊材与食料 | 炼蛊、升炼、修复和喂养 | 行囊，可按同品质堆叠 |
| 普通工具 | 开启特定地图交互 | 行囊，不需要装备 |
| 身份与剧情物品 | 令牌、地图、账册、契约和信物 | 关键物品栏 |
| 蛊方与知识 | 炼制、升炼、杀招和情报 | 知识库 |

蛊虫不占普通行囊格。已经炼化并收入空窍的蛊，由蛊虫系统管理。

### 5.1 运行时权威状态

现有生产剧本使用：

```text
player.inventory: set<ITEM_IDS>
item.unique.<ITEM_ID>.owner
```

新系统不能直接删除这两个契约。第一轮实现采用“新状态为权威、旧集合为兼容索引”：

```text
player.health.current
player.health.max
player.essence.current
player.essence.max
player.cultivation.realm
player.cultivation.stage
player.cultivation.progress
player.effects.<EFFECT_ID>
player.cooldowns.<CONTENT_ID>.ready_at

player.resources.primeval_stones
player.resources.clan_merit
player.items.<ITEM_ID>.stacks.<STACK_ID>
player.key_items.<ITEM_ID>

gu.instances.<INSTANCE_ID>
item.unique.<ITEM_OR_GU_ID>.owner

player.inventory: derived compatibility set
```

`player.inventory` 在迁移期只表示“玩家当前持有该 ID”，不再承载数量、次数、蛊虫状态或分类。

统一谓词：

```text
has_item(ITEM_ID, quantity = 1)
has_item_charge(ITEM_ID, charges = 1)
has_key_item(ITEM_ID)
owns_gu(GU_ID)
owns_gu_or_descendant(GU_ID)
can_activate_gu(INSTANCE_ID)
unique_owner(ITEM_OR_GU_ID)
```

生产记录中的旧判断按以下方式解析：

```text
player.inventory contains "ITEM_*" -> has_item / has_key_item
player.inventory contains "GU_*"   -> owns_gu_or_descendant
```

### 5.2 统一取得与移除入口

所有剧本写入通过内容适配器执行，不允许 reducer 按字符串自行猜测类型：

```text
grant_content(ID, amount_or_charges, source_record_id)
remove_content(ID, amount_or_charges, reason)
transfer_unique(ID, from_owner, to_owner, source_record_id)
transfer_gu_instance(instance_id, from_owner, to_owner, source_record_id)
set_gu_custodian(instance_id, custodian, deadline, source_record_id)
transform_gu(recipe_id, input_instance_ids, source_record_id)
```

分派规则：

| ID 类型 | 权威写入 |
| --- | --- |
| `GU_*` | 创建或转移 `gu.instances`，唯一蛊同时更新 `item.unique` |
| 元石批次 | 直接增加 `player.resources.primeval_stones` |
| 可堆叠药品、材料、食料 | 按目录规则创建或合并 `player.items.<ID>.stacks` |
| 有次数凭证或独立批次 | 创建独立 `STACK_ID` 并记录剩余次数 |
| 身份、证据、地图、账册 | 写入 `player.key_items` |
| 蛊方与知识 | 写入 `player.knowledge` 或知识库记录 |

每次写入后刷新派生的 `player.inventory`，保证尚未迁移的剧情谓词继续工作。

蛊虫的永久转让必须经 `transfer_gu_instance`：

1. 只允许转让当前未死亡、未转化的蛊个体；归档的 `transformed` 输入不能单独转让。
2. 更新当前个体的 `owner`、`custodian` 和 `location`。
3. 若当前物种或其 `lineage_species_ids` 中存在唯一蛊，则同步更新这些 `item.unique` 记录的
   `owner`、`instance_id` 与 `transformed_into`。
4. 同时刷新转出方和转入方的兼容 `inventory` 与 `owns_gu_or_descendant` 查询。

临时借用只调用 `set_gu_custodian`，不得改变蛊和谱系的所有者。`transfer_unique` 收到蛊 ID 时必须先
解析当前活体实例并转调 `transfer_gu_instance`，不得只改一条 `item.unique` 字段。归档输入中的
`owner` 只表示发生升炼时的历史所有者，不参与当前所有权判断。

每个普通物品目录项必须声明：

```text
storage_mode = quantity | charges | key_item | resource | knowledge
merge_key_fields = [quality, contamination, expires_at, source_group]
```

`quantity` 与 `charges` 都使用批次状态：

```text
player.items.<ITEM_ID>.stacks.<STACK_ID>:
  quantity
  charges
  quality
  contamination
  source_record_id
  source_group
  created_at
  expires_at
```

规则如下：

- `storage_mode = quantity` 只读取 `quantity`，`charges` 为空。
- `storage_mode = charges` 表示一份有次数的凭证或产物，`quantity = 1`。
- 只有 `merge_key_fields` 完全一致且目录允许堆叠的批次才能合并。
- 不同品质、污染状态、到期时间或来源隔离要求的批次必须保留不同 `STACK_ID`。
- `has_item` 汇总所有有效批次的 `quantity`；`has_item_charge` 汇总所有有效批次的 `charges`。
- 消耗时优先使用最早到期批次；同到期时间按最早取得顺序。

### 5.3 蛊虫存放与可用状态

```text
野生或未炼化蛊:
owner = player
refinement_state = wild / refining
location = living_container

已炼化蛊:
owner = player
refinement_state = refined
location = player_aperture

借用蛊:
owner = lending_faction
custodian = player
location = player_aperture / living_container
loan_expires_after = registered deadline
```

`can_activate_gu` 必须同时满足：

```text
custodian 或 owner 是 player
refinement_state == refined，或该借用记录明确授予临时催动权
health_state in {healthy, weakened}
hunger_state != dormant
当前真元 >= activation_cost + 当前状态修正
```

MVP 不增加类似装备栏的“出战蛊槽”。所有满足上述条件的已炼化蛊均可选择，实际限制来自真元、
喂养、炼化和具体记录条件。

蛊虫健康状态固定为：

| 状态 | 可否催动 | 恢复方式 |
| --- | --- | --- |
| `healthy` | 可以 | 无需恢复 |
| `weakened` | 可以，但催动难度 `+5` 且真元消耗 `+1` | 补足一份食料并休息一个时段 |
| `damaged` | 不可以 | 在学堂炼蛊室或药堂修复 |
| `dead` | 不可以 | 不可恢复 |
| `transformed` | 不可以 | 已被升炼输出取代，只保留谱系和审计记录 |

修复 `damaged` 蛊固定消耗一个时段、2 块元石和该蛊一份登记食料，完成后变为 `healthy`。当前
三条 MVP 升炼配方不会直接导致核心蛊死亡。

蛊虫饥饿状态固定为 `sated`、`hungry`、`dormant`。捕捉、取得、迁移或升炼生成蛊个体时，设置
`hunger_state = sated` 与 `feed_due_at = current_time + feed_interval`。每次载入存档和推进世界
时段都调用一次 `settle_gu_hunger(current_time)`：

| 当前时间 | 饥饿状态 | 健康变化 |
| --- | --- | --- |
| `current_time < feed_due_at` | `sated` | 不变 |
| `feed_due_at <= current_time < feed_due_at + 1 interval` | `hungry` | 不变；催动真元消耗 `+1` |
| `feed_due_at + 1 interval <= current_time < feed_due_at + 2 intervals` | `dormant` | `healthy` 降为 `weakened` |
| `feed_due_at + 2 intervals <= current_time < feed_due_at + 3 intervals` | `dormant` | 变为 `damaged` |
| `current_time >= feed_due_at + 3 intervals` | `dormant` | 普通非唯一蛊变为 `dead`；剧情唯一蛊保持 `damaged` |

`interval` 使用该蛊目录中的 `feed_interval`。结算必须幂等，同一时间点重复载入不会重复降低健康。
系统在到期前一个世界时段、进入 `hungry` 和进入 `dormant` 时各提示一次。

喂养规则：

- `sated` 时可以提前喂养一次，将 `feed_due_at` 延后一个周期，但最多延至当前时间后的两个周期。
- `hungry` 时消耗登记食料后，设为 `sated`，新期限为当前时间加一个周期。
- `dormant + weakened` 时，消耗食料并休息一个时段后恢复为 `healthy + sated`。
- `damaged` 必须走修复流程；修复所消耗的食料同时完成喂养并重置期限。
- `dead` 与 `transformed` 不能喂养。

### 5.4 存档迁移

旧存档首次载入时：

1. `player.inventory` 中的 `GU_*` 转为对应蛊个体，并按目录设置 `sated` 与首次喂养期限。
2. 元石批次转为资源数值。
3. 批次和次数物品按目录的 `storage_mode` 转为一个带来源记录的 `STACK_ID`。
4. 身份、地图、账册和证据转入关键物品栏。
5. 迁移完成后保存 `item_system_version = 1`，不得重复转换。
6. `item.unique` 与蛊个体所有者冲突时，以已结算的 `item.unique` 为准并记录修复日志。

## 6. 普通工具规则

普通工具没有攻击、防御或属性成长。

示例用途：

| 工具 | 自动开启的交互 |
| --- | --- |
| 火折与灯油 | 查看暗室、读取微小刻痕 |
| 采集刀 | 完整采下蛊材，降低材料损坏 |
| `ITEM_HEMP_ROPE` 麻绳 | 设置撤退点、下井、固定伤员或布置大型捕捉点 |
| `ITEM_EMPTY_PORCELAIN_JAR` 空瓷罐 | 保存活体蛊材、酒液、诱饵或小型水生蛊 |
| `ITEM_BAMBOO_GU_CAGE` 竹制蛊笼 | 捕捉和临时保管小型陆生凡蛊 |
| 细布与木夹板 | 执行基础止血和骨伤处理 |

没有工具时，记录可以：

- 提供风险更高的替代操作。
- 只取得部分信息或低品质材料。
- 暂时保留节点，允许玩家准备后返回。

工具不需要拖入槽位，也不要求玩家在每次交互前整理装备。
上述三个带 ID 的 MVP 工具均为 `storage_mode = quantity`、不可堆叠、普通使用不消耗；只有剧情明确
写出遗失或损坏时才移除。
第 8.4 节捕捉表中的“必需工具”是硬条件；没有登记替代操作时，不能以徒手高风险检定绕过。

## 7. 恢复体系

### 7.1 真元

| 方式 | 基础效果 | 代价与限制 |
| --- | --- | --- |
| 自然恢复 | 每推进一个时段恢复部分真元 | 消耗任务窗口 |
| 睡眠 | 恢复全部真元 | 推进至次日 |
| 吸收元石 | 消耗 1 块，恢复约 20% 真元 | 与交易、炼蛊和修炼竞争货币 |
| 战斗中急吸元石 | 消耗行动和 1 块元石，恢复约 10% 真元 | 下一次催蛊的真元消耗提高 |
| 恢复类蛊 | 提供更高效率或特殊恢复方式 | 必须持有、可催动并按期喂养，不占出战槽 |

百分比是初始调试基线，不是最终平衡值。

酒虫只精炼当前一转真元，使其质量等效提高一个小境界；它不恢复真元，也不直接增加修炼进度。

战斗中急吸元石只提供应急选择，不能成为无代价的蓝药：

```text
player.effects.EFFECT_APERTURE_STRAIN:
  stacks = 1
  source_id = "primeval_stone_emergency_absorb"
  expires_on_event = "next_gu_activation_finished_or_cancelled"

存在 EFFECT_APERTURE_STRAIN 时:
下一次催蛊真元消耗 +2
不能再次执行战斗中急吸元石
完成或取消该次催蛊后移除 EFFECT_APERTURE_STRAIN
```

### 7.2 生命与伤势

| 物品或服务 | 类型 | 效果边界 |
| --- | --- | --- |
| `ITEM_HEMOSTATIC_PASTE` 止血膏 | 普通药品 | 清除 `EFFECT_BLEEDING_NORMAL`，并创建一次后续时段回血效果 |
| `ITEM_BONE_SETTING_POWDER` 接骨散 | 普通药品 | 配合一个完整休息时段清除 `EFFECT_FRACTURE_NORMAL`，战斗中不可使用 |
| `ITEM_DETOX_POWDER` 清毒散 | 普通药品 | 将 `EFFECT_POISON_NORMAL.severity` 降低 1，不能处理特殊蛊毒 |
| `ITEM_LIFE_LEAF_3` 生机叶 | 九叶生机草蛊的消耗产物 | 每次消耗 1 次，立即恢复较多生命并清除普通流血 |
| 药堂治疗 | 服务 | 支付元石或功绩，处理重伤与复杂异常 |
| 青藤护符 | 限定一次性物品 | 将一次致命物理伤害降为重伤，随后破碎 |

普通药品不能连续用于战斗回血。使用战斗急救需要消耗行动。

重伤、断肢、特殊蛊毒和空窍损伤不能用普通药品完全治愈，必须依赖药堂、治疗蛊、任务或更高阶资源。

持续状态统一使用：

```text
player.effects.<EFFECT_ID>:
  severity
  stacks
  source_id
  started_at
  expires_at
  expires_on_event
  next_tick_at
```

止血膏创建 `EFFECT_HEMOSTATIC_RECOVERY`，在下一个世界时段开始时结算一次后移除。生机叶使用后写入
`player.cooldowns.ITEM_LIFE_LEAF_3.ready_at = current_time + 1 time_slot`；冷却未结束时不能再次使用，
但不会浪费次数。最终恢复数值可以调参，状态的创建、阻止与移除时机固定不变。

### 7.3 修炼

- 每日吐纳提供稳定修炼进度。
- 元石辅助修炼加快进度，但消耗通用货币。
- 学堂指导、传承心得和任务奖励提供一次性修炼进度。
- 舍利蛊直接提高一个小境界，属于稀有一次性成长蛊。
- 普通药品不增加修炼进度、资质或永久属性。

### 7.4 时间与行动

- 不存在恢复行动时间的普通物品。
- 药品和元石不能回退已消耗时段。
- 第 30 日永久离山窗口不能通过消耗品延后。
- 游戏暂停、读档等元操作不属于世界内物品效果。

## 8. 蛊虫获取

### 8.1 获取渠道

| 渠道 | 主要内容 |
| --- | --- |
| 主线与支线 | 固定的重要蛊，保证关键构筑和剧情奖励 |
| 区域生态 | 普通野蛊、蛊材和食料 |
| 家族兑换 | 使用功绩换取常见蛊、蛊方和炼化材料 |
| 商队库存 | 从固定商品池中按到访批次轮换 |
| 自行炼制 | 使用蛊方、主材、辅材和设施制造目标蛊 |
| NPC 交易或偷取 | 保持明确世界持有人和所有权转移 |
| 遗藏与传承 | 唯一蛊、升炼路线、蛊方和杀招知识 |

固定剧情蛊不刷新。普通凡蛊可以存在多个个体；MVP 区域生态只投放一转普通蛊。

### 8.2 区域生态

普通区域不直接掉落蛊，而是提供调查、准备和捕捉链：

```text
调查区域
-> 发现足迹、食痕、蛊力残留或巢穴
-> 判断可能的蛊虫种类
-> 准备诱饵和捕捉方式
-> 在有效时辰再次前往
-> 捕捉并执行炼化
```

每个区域登记：

- 2 至 4 种普通野蛊。
- 4 至 8 种蛊材或食料。
- 可出现时辰。
- 天气或环境条件。
- 诱饵与工具条件。
- 调查线索池。
- 捕捉难度与失败后果。
- 资源恢复周期。

区域使用受控的半动态池，不使用完全独立的纯随机掉落。

### 8.3 线索保底

每次有效调查至少获得以下一种内容：

- 蛊材。
- 食料。
- 元石或可出售资源。
- NPC 或任务情报。
- 野蛊生态线索。

连续调查没有得到野蛊线索时，提高下一次有效线索的权重。保底只保证发现可追踪机会，不保证直接取得蛊虫。

具体保底规则：

```text
取得野蛊线索:
ecology.<location_id>.clue_miss_count = 0

有效调查但未取得野蛊线索:
ecology.<location_id>.clue_miss_count += 1

clue_miss_count >= 2:
下一次有效调查必须发出该地点当前池中的一条野蛊线索
```

因此，最迟第三次有效调查得到可追踪线索。“每两至三次探索出现线索”描述的是这一规则，不是另一套概率。

### 8.4 MVP 生态范围

MVP 只实现三个普通生态地点、三种可重复出现的普通凡蛊。剧情蛊不进入这些池。

普通蛊登记：

| ID | 名称 | 固定作用 | 标准真元 | 食料与周期 |
| --- | --- | --- | ---: | --- |
| `GU_CRYSTAL_LADYBUG` | 水晶瓢虫 | 保存一批液体，存入或取出时防止普通腐坏与泄漏 | 每次存或取 1 | 山露 1 份 / 3 日 |
| `GU_DRAGON_PILL_CRICKET` | 龙丸蛐蛐蛊 | 向选定方向跃退约十米 | 4 | 干草籽 1 份 / 2 日 |
| `GU_BEAST_SKIN` | 兽皮蛊 | 将下一次普通物理伤害结算降低一级 | 4 | 兽皮碎料 1 份 / 3 日 |

生态物资登记：

```text
MAT_MOUNTAIN_DEW       山露
MAT_DRY_GRASS_SEED     干草籽
MAT_BEAST_HIDE_SCRAP   兽皮碎料
MAT_YELLOW_MUD         肥黄泥
MAT_MOON_ORCHID_PETAL  月兰花瓣
MAT_JADE_CHIP          玉石碎料
MAT_BAMBOO_SAP         青竹汁
MAT_FROST_MOSS         霜苔
MAT_ROCK_SNAKE_SLOUGH  岩蛇蜕
```

地点池：

| 地点 | 开放 | 普通蛊池 | 物资池 | 有效线索示例 |
| --- | --- | --- | --- | --- |
| `southwest_slope` | D03–D25，上午/下午 | 水晶瓢虫、龙丸蛐蛐蛊 | 山露、干草籽、月兰花瓣、青竹汁 | 完整露珠被搬空；草茎出现连续弹跳折痕 |
| `northwest_rock_ridge` | D18–D24，上午/中午 | 兽皮蛊、龙丸蛐蛐蛊 | 兽皮碎料、干草籽、玉石碎料、霜苔、岩蛇蜕 | 岩缝留下薄皮；碎石间出现圆形落脚坑 |
| `west_mountain_road` | D11–D20，中午/下午 | 水晶瓢虫、兽皮蛊 | 山露、肥黄泥、兽皮碎料、青竹汁 | 液体痕迹无蒸发；兽毛下藏有蛊力残留 |

MVP 不单独生成天气，三个地点的 `weather_requirement = ANY` 且 `required_knowledge = []`。日期、
时段和地点本身就是环境门槛。

有效调查按以下固定顺序结算：

1. 先增加该地点 `investigation_count` 并写入存档，读档不能重抽本次结果。
2. 若 `clue_miss_count >= 2`，直接生成当前蛊池的一条线索。
3. 否则按运行种子、地点和 `investigation_count` 做固定抽取：25% 线索、60% 当前可采物资、15% 生态情报。
4. 物资结果从 `available_after_day <= current_day` 的项目中等权选择并取得 1 份；若没有可采物资，
   改为生态情报。
5. 生态情报令 `player.knowledge.ecology_notes += 1`，不会生成新的货币或物品。

诱饵直接使用对应食料，不增加独立诱饵货币。玩家必须先取得线索，才能在后续时段提交食料并进入捕捉。
每次捕捉消耗一个世界时段和一份诱饵，工具不会因普通失败损坏。

| 野蛊 | 诱饵 | 必需工具 | 捕捉检定 | 普通失败 |
| --- | --- | --- | --- | --- |
| 水晶瓢虫 | `MAT_MOUNTAIN_DEW` 1 | `ITEM_EMPTY_PORCELAIN_JAR` | 洞察 + 心性，对抗难度 55 | 消耗诱饵，线索在期限内保留 |
| 龙丸蛐蛐蛊 | `MAT_DRY_GRASS_SEED` 1 | `ITEM_BAMBOO_GU_CAGE` | 身法 + 洞察，对抗难度 62 | 消耗诱饵，线索在期限内保留 |
| 兽皮蛊 | `MAT_BEAST_HIDE_SCRAP` 1 | `ITEM_HEMP_ROPE` | 体魄 + 洞察，对抗难度 66 | 消耗诱饵并触发一次普通轻伤结算，线索在期限内保留 |

检定成功时创建一个 `owner = player`、`refinement_state = wild`、`location = living_container` 的独立蛊
个体并关闭线索。检定失败不生成蛊；只要线索尚未到期，玩家可以重新准备诱饵后再试。

刷新规则：

- 每个地点同时只保留一条未解决野蛊线索。
- 存在未解决线索时，该地点不再开放“有效生态调查”，只开放准备、捕捉或放弃线索。
- 线索生成时确定蛊种，存档读档不重抽。
- 线索保留两个完整时段，逾期后关闭并设置 `clue_miss_count = 0`。
- 采集物资后设置 `available_after_day = current_day + 2`，到达该日后恢复。
- 捕捉成功或线索到期后，该地点下一条线索重新从普通蛊池选择。
- 同一地点同一日最多执行一次有效生态调查。

## 9. 重复蛊

每只蛊是独立活物，不堆叠为数量，也不转化为碎片。

规则如下：

- 同种蛊默认只炼化一只作为当前使用蛊。
- 多余个体可以出售、交易、用于升炼或留作替补。
- 未炼化蛊也需要最低限度的容器和食料。
- 长期不喂养会进入衰弱、受损和死亡状态。
- 不采用重复蛊升星、吞卡突破或自动转化货币。

凡蛊允许多个个体。仙蛊唯一性不属于青茅山 MVP 的可玩范围，但数据结构不得阻止后续实现。

## 10. 蛊虫成长

### 10.1 炼化

野生或他人所有的蛊必须完成所有权转移和炼化，才能稳定催动。

现有主线与支线蛊继续执行各自生产记录中的炼化检定和结算。第 8.4 节捕捉的三种普通野蛊统一
执行以下状态机，不允许实现端自行生成另一套概率：

```text
初始:
refinement_state = wild
refinement_progress = 0

开始首次炼化:
refinement_state = refining

检定成功:
refinement_progress += 40

检定失败:
refinement_progress += 15
refinement_failure_count += 1

refinement_progress >= 100:
refinement_state = refined
refinement_progress = 100
location = player_aperture
mastery.stage = novice
mastery.progress = 0
```

每次尝试固定消耗一个世界时段和目录中的 `refinement_essence_cost`，无论成功失败都不退还。真元不足、
蛊为 `damaged/dead/transformed`、或当前所有者不是玩家时不能开始。`weakened` 蛊可以继续炼化，但
检定难度 `+5`。普通炼化失败不会销毁蛊，也不会重置已经积累的进度。

| 普通野蛊 | 炼化检定 | 每次真元 |
| --- | --- | ---: |
| `GU_CRYSTAL_LADYBUG` | 心性 + 资质修正 + 真元亲和，对抗难度 55 | 3 |
| `GU_DRAGON_PILL_CRICKET` | 心性 + 资质修正 + 真元亲和，对抗难度 60 | 4 |
| `GU_BEAST_SKIN` | 心性 + 资质修正 + 真元亲和，对抗难度 65 | 4 |

达到 100 的那次尝试在同一原子结算中完成炼化、迁入空窍并开放催动。读档只读取已保存的进度，
不能重抽已经结算的尝试。

### 10.2 熟练

MVP 固定使用三个可见阶段：

```text
novice（生疏） -> practiced（熟练） -> mastered（精通）
```

| 阶段 | 进度 | 固定作用 |
| --- | ---: | --- |
| `novice` 生疏 | 0–39 | 使用基础效果，保留标准失误和准备成本 |
| `practiced` 熟练 | 40–79 | 相关催动检定获得 `+5`，有准备步骤时减少一步 |
| `mastered` 精通 | 80–100 | 保留熟练效果；真元消耗减少 `1`，最低仍为 `1`；开放固定进阶用法 |

熟练不直接提供大幅伤害倍率。
当检定项写作“某蛊熟练”时，生疏阶段提供 `0`，熟练与精通阶段提供 `+5`；精通的额外收益按上表
单独结算，不再额外提高该检定项。

进度来源：

```text
完成一次当日专项训练: +10，每只蛊每日最多一次
首次在真实风险记录中成功催动: +4，每只蛊每日最多两次
真实风险记录中催动失败但未放弃: +1，每只蛊每日最多两次
```

“真实风险记录”必须同时满足：

- 内容记录拥有唯一 `risk_record_id`。
- 失败会消耗世界时段或有限资源，或产生受伤、暴露、关系下降、任务分支关闭中的至少一项。
- 同一 `risk_record_id` 对同一蛊个体每天最多提供一次熟练奖励。
- 训练场、无代价重复对话和已经结算的交互不属于真实风险记录。

每日计数写入蛊个体：

```text
mastery.daily.day
mastery.daily.training_count
mastery.daily.risk_success_count
mastery.daily.risk_failure_count
mastery.daily.credited_risk_record_ids
```

只有世界日期变化时才重置每日计数；读档、切换地图和退出战斗都不能重置。

MVP 精通用法：

| 蛊 | 精通用法 | 效果 |
| --- | --- | --- |
| `GU_MOONLIGHT` | 精准月刃 | 可以避开目标相邻的中立单位和易碎任务物，不增加伤害 |
| `GU_JADE_SKIN` | 局部玉化 | 只保护一个指定部位或下一次普通物理命中，真元消耗为标准催动的一半并向上取整 |
| `GU_HIDDEN_STONE` | 分藏 | 在隐藏自身和隐藏一件手掌大小物品之间选择，不能同时生效 |
| `GU_SLEEVE_POUCH` | 急取 | 战斗或追逐中取出一件已登记小型物品，不额外消耗准备动作 |
| `GU_DRAGON_PILL_CRICKET` | 折向 | 跃退途中允许选择一次左或右折向，距离不增加 |
| `GU_BEAST_SKIN` | 护住要害 | 本次防御只作用于一次命中，但普通物理致命结果最多结算为重伤 |

未列入表中的蛊在 MVP 可以积累熟练进度，但到达精通时只获得通用效果，不自动生成新主动能力。

### 10.3 升炼

升炼必须具有明确目标，不随机生成结果：

```text
基础蛊 + 指定蛊方 + 主材 + 辅材 + 设施或环境
-> 目标二转蛊
```

升炼失败的后果由蛊方声明，可包括：

- 辅材损失。
- 主材部分损失。
- 蛊虫受损。
- 蛊虫死亡。
- 炼制者受伤或获得空窍负担。

涉及核心剧情蛊时，UI 必须在确认前明确展示可能失去该蛊。

MVP 升炼配方固定为三条：

| 配方 ID | 输入与输出 | 升炼检定 | 解锁 | 失败后果 |
| --- | --- | --- | --- | --- |
| `RECIPE_MOON_GLOW` | 月光蛊 1、小光蛊 2、月兰花瓣 8、元石 8 -> `GU_MOON_GLOW` | 心性 + 资质修正 + 月光蛊熟练，对抗难度 68 | 月光蛊熟练后向学堂兑换 | 消耗一只小光蛊、全部花瓣和元石；月光蛊变为 `damaged` |
| `RECIPE_WHITE_JADE` | 白豕蛊 1、玉皮蛊 1、白玉粉 3、元石 12 -> `GU_WHITE_JADE` | 心性 + 体魄 + 两只核心蛊的较低熟练加成，对抗难度 75 | Q02 深度 2 且取得两只核心蛊 | 消耗全部白玉粉和元石；两只核心蛊变为 `damaged` |
| `RECIPE_HIDDEN_SCALE` | 隐石蛊 1、岩蛇蜕 3、石心粉 2、元石 10 -> `GU_HIDDEN_SCALE` | 洞察 + 心性 + 隐石蛊熟练，对抗难度 72 | Q02 深度 3 的传承知识 | 消耗全部辅材和元石；隐石蛊变为 `damaged` |

升炼成功必须通过单个原子操作 `transform_gu` 结算：

1. 验证配方、输入个体、所有权、炼化状态、材料、元石和设施，随后锁定输入。
2. 一次性扣除配方中的所有蛊虫、材料和元石。
3. 输入蛊个体改为 `health_state = transformed`，保留在审计记录中并写入 `transformed_into`。
4. 创建一个 `owner = player`、`custodian = player`、`refinement_state = refined`、`health_state = healthy`
   的输出个体，位置为玩家空窍。
5. 输出个体记录全部 `lineage_instance_ids` 和 `lineage_species_ids`。
6. 输出熟练进度为 `min(39, floor(最高输入熟练进度 / 2))`，因此一定从“生疏”阶段重新掌握。
7. 核心输入的 `item.unique` 记录保持最终所有者并写入 `transformed_into`；输出物种登记新的唯一记录。

升炼检定失败时，失败表中的扣除与受损结果作为一个原子结算提交。只有技术异常、写盘失败或结算中断
才全部回滚，不允许出现材料已扣但输入蛊未变化的中间状态。`owns_gu(GU_ID)` 只判断当前存活的准确
蛊种；旧剧情所有权检查和离山结算改用 `owns_gu_or_descendant(GU_ID)`。派生 `player.inventory` 为
兼容旧剧情保留玩家当前拥有的输出蛊 ID 及其核心谱系 ID，但 UI 只展示当前蛊个体。

新增与输出蛊的固定能力：

| 蛊 | 品阶 | 固定能力 | 标准真元 | 食料与周期 |
| --- | --- | --- | ---: | --- |
| `GU_LITTLE_LIGHT` 小光蛊 | 一转 | 当前交互取消普通黑暗环境惩罚，不揭破蛊术隐匿 | 2 | 月兰花瓣 1 份 / 3 日 |
| `GU_MOON_GLOW` 月芒蛊 | 二转 | 发出月刃，本次月刃攻击检定 `+5`，使用登记的标准月刃伤害 | 8 | 月兰花瓣 2 份 / 3 日 |
| `GU_WHITE_JADE` 白玉蛊 | 二转 | 保留已写入角色的白豕蛊肉身强化；将下一次普通物理伤害降低两级 | 7 | 白玉粉 1 份 / 4 日 |
| `GU_HIDDEN_SCALE` 隐鳞蛊 | 二转 | 当前潜行或藏物检定 `+10`，并可同时隐藏一件手掌大小物品 | 6 | 岩蛇蜕 1 份 / 4 日 |

普通物理伤害等级固定为 `无伤 -> 轻伤 -> 重伤 -> 致命`；“降低一级”沿此顺序向左移动，最低为无伤。
蛊术、毒伤、空窍伤害和剧情指定的不可减免结果不使用这条物理降级规则。

配方新增内容 ID：

```text
GU_LITTLE_LIGHT
GU_MOON_GLOW
GU_WHITE_JADE
GU_HIDDEN_SCALE
MAT_WHITE_JADE_POWDER
MAT_ROCK_SNAKE_SLOUGH
MAT_STONE_HEART_POWDER
```

配方输入与输出食料的来源固定如下：

| 内容 | 首次保底来源 | MVP 重复来源 |
| --- | --- | --- |
| `GU_LITTLE_LIGHT` | 解锁月芒蛊配方时，学堂开放 2 只，每只 4 功绩 | 学堂每 3 日补 1 只；D11、D21 商队各有 1 只 |
| `MAT_MOON_ORCHID_PETAL` | 西南山坡物资池 | 学堂在配方解锁后每 2 日提供一包 4 份，价格 2 功绩 |
| `MAT_WHITE_JADE_POWDER` | Q02 深度 2 首次结算固定取得 3 份 | 学堂在配方解锁后每 4 日提供 1 份，初始价格 2 元石 |
| `MAT_ROCK_SNAKE_SLOUGH` | Q02 深度 3 首次结算固定取得 3 份 | 西北石岭物资池；D21 商队固定出售 2 份 |
| `MAT_STONE_HEART_POWDER` | Q02 深度 3 首次结算固定取得 2 份 | 学堂炼蛊室将玉石碎料 2 份和元石 1 块加工为 1 份，每日最多一次 |

“每 N 日补充”以首次解锁日为第 0 日，只累积一个未购买批次，不因长期不买而无限囤货。表中价格是
首轮可执行值，可以随第 19 节经济调参修改，但保底数量、刷新频率和来源不能删除。小光蛊不进入
野外生态池。

### 10.4 杀招

杀招是多只蛊的固定催动方案，不是脱离蛊虫独立存在的法术。

所有杀招必须满足：

- 持有并炼化全部核心蛊。
- 获得杀招知识或传承残页。
- 对指定核心蛊达到记录要求的熟练阶段。
- 完成一次训练检定。

杀招提供新战术，但同时消耗更多真元、承担催动失败或蛊虫受损风险。

MVP 只实现两条组合能力：

| ID | 所需蛊 | 解锁 | 催动检定 | 固定效果 | 催动失败 |
| --- | --- | --- | --- | --- | --- |
| `COMBO_EXPANDED_MOONBLADE` | 月光蛊、小光蛊 | 两只均已炼化；月光蛊达到熟练；完成学堂组合训练 | 心性 + 两只蛊中较低的熟练加成，对抗难度 60 | 获得下方组件表登记的攻击加成，消耗两蛊标准真元之和 | 不获得组合攻击加成，仍发出当前月刃并消耗两蛊标准真元 |
| `KILLER_MOVE_HIDDEN_MOONBLADE` | 月光蛊、隐石蛊 | 两只均已炼化且达到熟练；取得 Q02 深层刻痕知识 | 心性 + 洞察 + 两只蛊中较低的熟练加成，对抗难度 68 | `target.awareness_of_player != aware` 时获得下方组件表登记的攻击加成；基础伤害不变 | 隐匿提前破裂，不获得组合攻击加成，玩家位置暴露并消耗两蛊标准真元 |

组合能力使用“当前活体组件”，允许明确登记的升炼后继替代原蛊：

```text
moon_component   = GU_MOONLIGHT | GU_MOON_GLOW
stealth_component = GU_HIDDEN_STONE | GU_HIDDEN_SCALE
light_component  = GU_LITTLE_LIGHT
```

组件必须是玩家当前持有、已炼化且可催动的活体实例，不能只靠历史谱系通过。输出蛊在重新练到配方
要求的熟练阶段前，知识仍保留但组合按钮禁用。月芒蛊升炼消耗的小光蛊不会自动保留，玩家需要从
第 10.3 节重复来源另行取得一只，才能再次使用展开月刃。

升级组件的效果按下表替换基础表中的攻击加成，不与物种自身加成重复相加：

| 组合 | 当前组件 | 最终攻击检定加成 |
| --- | --- | ---: |
| 展开月刃 | 月光蛊 + 小光蛊 | `+8` |
| 展开月刃 | 月芒蛊 + 小光蛊 | `+12` |
| 隐月刃 | 月光蛊 + 隐石蛊 | `+10` |
| 隐月刃 | 月芒蛊或隐鳞蛊其中一个升级 | `+12` |
| 隐月刃 | 月芒蛊 + 隐鳞蛊 | `+15` |

目标对玩家的察觉状态只取 `unaware`、`suspicious`、`aware` 三值，由触发该战斗或潜入记录在进入时
写定；攻击、暴露或记录结算可以把它提高，读档不重抽。

白豕蛊与玉皮蛊在 MVP 的组合成长优先通过白玉蛊升炼体现，不再额外增加第三条杀招。

## 11. 奖励节奏

- 每次有效探索至少获得一种资源、情报或成长反馈。
- 同一地点连续两次有效调查未出现野蛊线索时，第三次必须出现可追踪线索。
- 每条完整支线至少提供一种永久成长。
- 永久成长可以是蛊虫、蛊方、杀招、境界资源或长期资源渠道。
- 普通材料和食料可以恢复，剧情核心蛊、身份和传承不恢复。
- 不用大量低价值蛊虫填充奖励列表。

## 12. 现有剧本物品归类

### 12.1 蛊虫

以下内容进入蛊虫系统，不属于装备：

```text
GU_MOONLIGHT
GU_WINE_WORM
GU_WHITE_BOAR
GU_JADE_SKIN
GU_HIDDEN_STONE
GU_MUDSKIN_TOAD
GU_RED_IRON_RELIC
GU_SLEEVE_POUCH
GU_NINE_LEAF
```

具体定位：

| ID | 定位 |
| --- | --- |
| `GU_MOONLIGHT` | 保底攻伐蛊与基础训练核心 |
| `GU_WINE_WORM` | 真元质量与修炼路线核心 |
| `GU_WHITE_BOAR` | 永久力量成长和力道入口 |
| `GU_JADE_SKIN` | 防御蛊，不生成对应护甲装备 |
| `GU_HIDDEN_STONE` | 隐匿与藏物能力，不生成潜行饰品 |
| `GU_MUDSKIN_TOAD` | 可交易、研究或后续升炼的特殊蛊 |
| `GU_RED_IRON_RELIC` | 一次性境界成长蛊 |
| `GU_SLEEVE_POUCH` | 储物蛊，不占随身用具槽 |
| `GU_NINE_LEAF` | 生产生机叶的资源蛊 |

### 12.2 药品与一次性资源

| ID 或名称 | 分类 | 规则 |
| --- | --- | --- |
| `ITEM_HEMOSTATIC_PASTE` | 普通药品 | 清除普通流血并提供一次延迟恢复 |
| `ITEM_BONE_SETTING_POWDER` | 普通药品 | 配合一个完整休息时段处理普通骨伤 |
| `ITEM_DETOX_POWDER` | 普通药品 | 将普通毒伤严重度降低一层 |
| `ITEM_LIFE_LEAF_3` | 九叶生机草蛊的消耗产物 | `storage_mode = charges`，初始 3 次，逐片消耗 |
| `ITEM_GREEN_VINE_CHARM` | 限定一次性物品 | 自动抵消一次致命物理结果后破碎 |
| `ITEM_MEDICINE_PROTECTION` | 服务凭证 | 兑换一次药堂保命治疗，不作为饰品装备 |

### 12.3 Q01 酒虫线物品

| ID | 权威状态 | 生命周期 |
| --- | --- | --- |
| `ITEM_TAVERN_BACK_ROOM_KEY` | 关键物品 | 取得时登记 `return_at = current_slot_end`；完成本时段后室交互或时间推进时自动归还，以先发生者为准 |
| `ITEM_WINE_BAIT` | `charges = 1` | 捕捉操作成功或失败均消耗；D10_evening 后变质并移除 |
| `ITEM_TEN_WINE_CREDITS` | `charges = 10` | 每次兑换一份登记酒虫食料减 1；离山时未用次数失效 |
| `ITEM_TWO_WINE_CREDITS` | `charges = 2` | 每次兑换一份登记酒虫食料减 1；离山时未用次数失效 |

两种酒资凭证互斥，由 Q01 结算路线决定其一。它们不是货币，不能出售、转让或兑换元石。

### 12.4 Q02 撤退标记

`ITEM_RETREAT_MARKER_2` 来自 Q02 青书共有路线，不属于 Q05：

```text
player.items.ITEM_RETREAT_MARKER_2.stacks.<STACK_ID>.charges = 2
```

- 进入花酒遗藏时，入口标记自动消耗 1。
- 玩家首次决定继续深入时，第二枚自动消耗。
- 任一未使用标记在 Q02 结算或 D25_evening 坍塌结算时移除。
- 标记的效果已经写入 `world.flags.q02_safe_retreat`，不能带入 Q05 重复计算准备。

### 12.5 Q03 借用信号火蛊

`ITEM_SIGNAL_FIRE_GU_LOAN` 是旧剧本兼容 ID，运行时必须转成借用蛊个体：

```text
species_id = GU_SIGNAL_FIRE
owner = npc.caravan_guard
custodian = player
temporary_activation_right = true
loan_expires_after = Q03 山路行动结算
```

- `GU_SIGNAL_FIRE` 的临时催动固定消耗 2 点真元，在当前地点升起仅任务队伍可识别的信号火。
- 信号火不造成伤害，也不提供常驻照明。
- 借用期限短于其喂养周期，Q03 不要求玩家喂养；归还后由商队继续维护。
- 山路行动结算时自动归还并移除兼容 ID。
- 若行动结果明确写为遗失或毁坏，则写入商队债务，不生成玩家所有的永久蛊。
- 没有进入山路行动时，D15_morning 自动归还。
- 不得带离青茅山，也不得作为升炼材料。

### 12.6 Q05 行动准备

以下内容不进入永久装备体系：

```text
ITEM_Q05_ARMORY_SET
ITEM_Q05_SIGNAL_AND_SHIELD
ITEM_Q05_MEDICINE_PACK_1
ITEM_Q05_MEDICINE_PACKS
```

它们属于任务借用品、准备资源或临时蛊借用：

- 领取时写入对应准备状态。
- 行动中按实际使用消耗。
- 未使用部分在结算时归还。
- 不生成武器、防具或饰品槽。
- 不允许带离青茅山形成永久装备成长。

### 12.7 身份、证据与知识

以下内容进入关键物品栏或知识库：

```text
ITEM_BRANCH_HOUSE_KEY
ITEM_CLAN_WOOD_BADGE
ITEM_ARCHIVE_READING_SLIP
ITEM_Q02_ARCHIVE_SLIP
ITEM_CLAN_HISTORY_RECORD
ITEM_FLOWER_WINE_MAP
ITEM_JIA_PASS
ITEM_BLACK_LEDGER
ITEM_PARENT_LEDGER
ITEM_PARENT_LEDGER_COPY
ITEM_CUSTODY_SUMMARY
ITEM_HE_NIANG_LIMITED_GUARANTEE
ITEM_QING_SHU_TOKEN
ITEM_QING_SHU_SUPPORT
ITEM_Q03_STATEMENT_COPY
ITEM_Q05_OPERATION_RECORD
ITEM_Q05_REPLACEMENT_RECORD
ITEM_QING_SHU_DEATH_RECORD
```

这些物品提供地点、身份、对话、交易和后续任务条件，不直接增加攻击、防御或生命。

### 12.8 元石与食料

- 元石进入资源栏，不以单块物品占据行囊。
- `ITEM_PRIMEVAL_STONE_STARTER_1` 和 `ITEM_PRIMEVAL_STONE_STARTER_3` 在运行时转换为对应数量的元石。
- 青竹酒属于酒虫食料和交易品，不作为真元恢复药。
- 蛊虫食料按种类和品质登记，可堆叠，但不得合并不同品质或被污染的批次。

## 13. 数据契约

### 13.1 普通物品

```text
item.catalog.<ITEM_ID>.name
item.catalog.<ITEM_ID>.category
item.catalog.<ITEM_ID>.tags[]
item.catalog.<ITEM_ID>.storage_mode
item.catalog.<ITEM_ID>.merge_key_fields[]
item.catalog.<ITEM_ID>.stack_limit
item.catalog.<ITEM_ID>.trade_value
item.catalog.<ITEM_ID>.use_context
item.catalog.<ITEM_ID>.effect_id
item.catalog.<ITEM_ID>.quest_links[]

player.items.<ITEM_ID>.stacks.<STACK_ID>.quantity
player.items.<ITEM_ID>.stacks.<STACK_ID>.charges
player.items.<ITEM_ID>.stacks.<STACK_ID>.quality
player.items.<ITEM_ID>.stacks.<STACK_ID>.contamination
player.items.<ITEM_ID>.stacks.<STACK_ID>.source_record_id
player.items.<ITEM_ID>.stacks.<STACK_ID>.source_group
player.items.<ITEM_ID>.stacks.<STACK_ID>.created_at
player.items.<ITEM_ID>.stacks.<STACK_ID>.expires_at

player.key_items.<ITEM_ID>.source_record_id
player.key_items.<ITEM_ID>.acquired_at
player.key_items.<ITEM_ID>.return_at
player.key_items.<ITEM_ID>.expires_at

world.content_sources.<SOURCE_ID>.<CONTENT_ID>.unlocked_at
world.content_sources.<SOURCE_ID>.<CONTENT_ID>.next_refresh_day
world.content_sources.<SOURCE_ID>.<CONTENT_ID>.available_quantity
world.content_sources.<SOURCE_ID>.<CONTENT_ID>.max_stock
world.service_limits.<SERVICE_ID>.last_used_day
```

不包含：

```text
rarity_color
random_affixes
equipment_slot
enhancement_level
durability
set_id
```

### 13.2 蛊虫个体

```text
gu.catalog.<GU_ID>.rank
gu.catalog.<GU_ID>.path
gu.catalog.<GU_ID>.function
gu.catalog.<GU_ID>.activation_cost
gu.catalog.<GU_ID>.refinement_difficulty
gu.catalog.<GU_ID>.refinement_essence_cost
gu.catalog.<GU_ID>.feed_item_ids[]
gu.catalog.<GU_ID>.feed_quantity
gu.catalog.<GU_ID>.feed_interval
gu.catalog.<GU_ID>.upgrade_recipes[]
gu.catalog.<GU_ID>.killer_move_links[]
gu.catalog.<GU_ID>.unique_scope

gu.instances.<INSTANCE_ID>.species_id
gu.instances.<INSTANCE_ID>.owner
gu.instances.<INSTANCE_ID>.custodian
gu.instances.<INSTANCE_ID>.location
gu.instances.<INSTANCE_ID>.refinement_state
gu.instances.<INSTANCE_ID>.refinement_progress
gu.instances.<INSTANCE_ID>.refinement_failure_count
gu.instances.<INSTANCE_ID>.mastery.stage
gu.instances.<INSTANCE_ID>.mastery.progress
gu.instances.<INSTANCE_ID>.mastery.daily.day
gu.instances.<INSTANCE_ID>.mastery.daily.training_count
gu.instances.<INSTANCE_ID>.mastery.daily.risk_success_count
gu.instances.<INSTANCE_ID>.mastery.daily.risk_failure_count
gu.instances.<INSTANCE_ID>.mastery.daily.credited_risk_record_ids[]
gu.instances.<INSTANCE_ID>.health_state
gu.instances.<INSTANCE_ID>.hunger_state
gu.instances.<INSTANCE_ID>.feed_due_at
gu.instances.<INSTANCE_ID>.temporary_activation_right
gu.instances.<INSTANCE_ID>.loan_expires_after
gu.instances.<INSTANCE_ID>.lineage_instance_ids[]
gu.instances.<INSTANCE_ID>.lineage_species_ids[]
gu.instances.<INSTANCE_ID>.transformed_into
gu.instances.<INSTANCE_ID>.historical_owner_at_transformation

item.unique.<ITEM_OR_GU_ID>.owner
item.unique.<ITEM_OR_GU_ID>.instance_id
item.unique.<ITEM_OR_GU_ID>.transformed_into
item.unique.<ITEM_OR_GU_ID>.final_disposition
```

同种凡蛊通过 `instance_id` 区分个体。

### 13.3 伤势、效果与冷却

```text
player.effects.<EFFECT_ID>.severity
player.effects.<EFFECT_ID>.stacks
player.effects.<EFFECT_ID>.source_id
player.effects.<EFFECT_ID>.started_at
player.effects.<EFFECT_ID>.expires_at
player.effects.<EFFECT_ID>.expires_on_event
player.effects.<EFFECT_ID>.next_tick_at

player.cooldowns.<CONTENT_ID>.ready_at
```

不存在的效果视为严重度和层数均为 0。效果处理器必须先执行当前时间点的到期与跳数结算，再开放
依赖状态的交互，防止读档或跨时段跳过伤势。

### 13.4 区域生态

```text
ecology.location_id
ecology.common_gu_pool[]
ecology.material_pool[]
ecology.feed_pool[]
ecology.valid_periods[]
ecology.weather_requirement
ecology.required_knowledge[]
ecology.capture_rules.<GU_ID>.bait_item_id
ecology.capture_rules.<GU_ID>.bait_quantity
ecology.capture_rules.<GU_ID>.tool_item_id
ecology.capture_rules.<GU_ID>.check_terms[]
ecology.capture_rules.<GU_ID>.difficulty
ecology.capture_rules.<GU_ID>.failure_effects[]
ecology.clue_deck[]
ecology.clue_miss_count
ecology.investigation_count
ecology.active_clue
ecology.active_clue_expires_after
ecology.last_investigated_day
ecology.resources.<MAT_ID>.available_after_day
ecology.refresh_policy
```

固定剧情蛊不进入普通生态刷新池。

### 13.5 新内容注册

本规格新增的 ID 必须先加入内容注册表，之后才能被任务、生态或 UI 引用：

```text
GU_SIGNAL_FIRE
GU_CRYSTAL_LADYBUG
GU_DRAGON_PILL_CRICKET
GU_BEAST_SKIN
GU_LITTLE_LIGHT
GU_MOON_GLOW
GU_WHITE_JADE
GU_HIDDEN_SCALE

ITEM_HEMOSTATIC_PASTE
ITEM_BONE_SETTING_POWDER
ITEM_DETOX_POWDER
ITEM_HEMP_ROPE
ITEM_EMPTY_PORCELAIN_JAR
ITEM_BAMBOO_GU_CAGE

MAT_MOUNTAIN_DEW
MAT_DRY_GRASS_SEED
MAT_BEAST_HIDE_SCRAP
MAT_YELLOW_MUD
MAT_MOON_ORCHID_PETAL
MAT_JADE_CHIP
MAT_BAMBOO_SAP
MAT_FROST_MOSS
MAT_WHITE_JADE_POWDER
MAT_ROCK_SNAKE_SLOUGH
MAT_STONE_HEART_POWDER

RECIPE_MOON_GLOW
RECIPE_WHITE_JADE
RECIPE_HIDDEN_SCALE
COMBO_EXPANDED_MOONBLADE
KILLER_MOVE_HIDDEN_MOONBLADE

EFFECT_APERTURE_STRAIN
EFFECT_BLEEDING_NORMAL
EFFECT_FRACTURE_NORMAL
EFFECT_POISON_NORMAL
EFFECT_HEMOSTATIC_RECOVERY
EFFECT_INJURY_LIGHT
```

注册表测试必须拒绝任何未登记的蛊、物品、物资、配方、杀招或效果 ID。

## 14. 状态与失败处理

### 14.1 行囊不足

- 关键物品和知识不得因普通行囊已满而丢失。
- 可堆叠资源优先并入已有堆叠。
- 普通材料需要玩家丢弃、寄存或放弃后才能取得。
- 活体未炼化蛊需要空容器或专门保管条件。

### 14.2 资源不足

- 真元不足时禁用催蛊选项，并显示所需与当前真元。
- 元石不足时禁用吸收、购买或辅助修炼选项。
- 食料不足不会立即删除蛊，先进入饥饿和衰弱阶段。

### 14.3 唯一物品

- 唯一剧情物品必须保持单一持有人。
- 所有权转移必须同时更新原持有人、目标持有人和任务结果。
- 永久离山后，青茅山限定物不重新生成。

### 14.4 到期与错过

- 有期限的药品、借用品和任务物显示最后有效时段。
- 到期结算不能静默删除物品，必须写入归还、腐坏、没收或永久错过原因。
- 离山确认前允许处理随身资源；确认后不能返回寄存点取物。

## 15. UI 影响

后续实现需要删除当前原型中的：

- 四个装备槽。
- 学堂短打、旧皮护腕、拆信短刃等装备展示。
- 护身法器空槽。
- 装备与法器标题。
- `equip-item`、`inspect-equipment` 和 `show-forging` 操作。
- “行囊与装备”标题。
- “取得的物品直接进入行囊”的规则说明。
- 炼制装备入口和隐线袖囊锻造预览。
- `src/ui-prototype/mockState.js` 中的“炼制装备”行动。
- 角色创建页“蛊虫栏 +1”和“装备更多战斗蛊”的说明。
- 任何要求玩家把蛊放入出战栏、战斗栏或快捷装备槽的操作。
- 装备、强化、耐久和套装相关筛选。

保留并强化：

- 蛊虫与空窍界面。
- 行囊分类。
- 关键物品栏。
- 元石、功绩和真元显示。
- 药品使用条件。
- 蛊材、食料和喂养期限。
- 蛊方、杀招和知识库。
- 区域生态线索与捕捉准备。

物品页改名为“物品与资源”。所有取得结果按 `grant_content` 分派：

- 蛊虫显示在蛊虫与空窍页。
- 元石与功绩只更新资源条。
- 身份、地图、账册和证据进入关键物品页。
- 普通药品、工具、材料和食料进入行囊。
- 蛊方、组合催动和杀招进入知识库。

## 16. 验收标准

1. 游戏中不存在武器、防具或饰品装备槽。
2. 游戏中不存在体力值和体力恢复物品。
3. 游戏中不存在随机词条、装备强化、耐久和套装。
4. 所有超凡装备效果都迁移为蛊虫、消耗型蛊或一次性封存蛊力。
5. 不存在出战蛊槽；所有满足状态条件的已炼化蛊均可直接选择。
6. 每一个由玩家主动触发的超凡能力都能追溯到蛊个体、组合催动或消耗型蛊产物。
7. 元石可以用于交易、修炼和真元恢复。
8. 普通药品与消耗型蛊具有不同效果边界。
9. 不同品质、污染状态、到期时间或隔离来源的物品批次不会错误合并。
10. 核心剧情蛊不进入普通刷新池。
11. 三个 MVP 生态地点只从各自固定池生成水晶瓢虫、龙丸蛐蛐蛊和兽皮蛊。
12. 同一地点连续两次有效调查未得到野蛊线索时，第三次必定得到可追踪线索。
13. 捕捉成功、失败、线索到期和物资恢复均按登记状态结算，读档不重抽。
14. 每次有效探索至少提供一种资源、情报或成长反馈。
15. 同种凡蛊可以有多个独立个体，但不堆叠、不碎片化、不升星。
16. 蛊虫熟练进度遵循三个固定阶段、每日训练上限和读档不重置规则。
17. 三条升炼配方与两条组合能力只能按登记输入和固定结果执行，不产生随机词条。
18. 升炼成功完整转化输入个体并生成可用输出；失败、回滚和受损修复不会产生复制或丢失中间态。
19. Q01 酒资按次数消耗，后室钥匙在借用时段结束前归还，酒饵使用或过期后移除。
20. Q02 撤退标记只有两次使用次数，并在 Q02 结算后移除。
21. Q03 信号火蛊以借用蛊个体存在，并在行动结束或 D15 到期时归还。
22. Q04 的九叶生机草蛊、生机叶批次和药堂保护分别进入蛊虫、消耗品和服务凭证状态。
23. Q05 借用品只影响行动准备，不形成永久装备。
24. 青藤护符自动触发且只使用一次，不占装备槽。
25. 所有青茅山限定物在离山后保持最终所有权，不重新生成。
26. 旧存档迁移后，`player.inventory` 与 `item.unique` 查询结果和迁移前一致，新增状态成为唯一写入源。
27. UI 中不存在装备、出战蛊槽、锻造或强化入口，物品取得结果进入其对应页面而非统一装备背包。
28. 持续效果、药品冷却和战斗急吸惩罚在跨时段与读档后只结算一次，且不能通过读档重复使用。
29. 三种普通野蛊捕捉后都能按固定炼化进度进入 `refined`，成功、失败与完成结算均可存档复现。
30. 每只蛊在喂养到期、饥饿、休眠、受损和死亡阈值上只结算一次，剧情唯一蛊不会因欠食直接死亡。
31. 三条升炼配方的首次材料均有保底来源，输出蛊的食料在 MVP 结束前有至少一个重复来源。
32. 月光蛊与隐石蛊升炼后，已学习的两条组合知识保留，并能用登记后继蛊在重新练熟后继续催动。
33. 转让升炼输出蛊时，当前物种与全部唯一核心谱系的所有权同步变化，不留下玩家虚假持有记录。

## 17. 实施里程碑

实施必须按以下顺序进行，后一步只依赖前一步已经稳定的契约：

1. **状态与内容迁移**：建立统一内容注册表、物品批次、持续效果、蛊虫个体、`grant_content`、`remove_content`、`transfer_unique`、`transform_gu` 和旧存档迁移。
2. **恢复与界面收口**：接入生命、真元、普通药品、元石恢复和消耗型蛊；删除装备、锻造及其兼容操作。
3. **生态与捕捉**：实现三个地点池、有效调查反馈、线索保底、诱饵提交、捕捉和刷新。
4. **蛊虫成长**：实现普通蛊炼化、喂养状态机、材料来源、熟练进度、三条升炼配方、谱系转让、
   两条组合能力及对应知识解锁。
5. **剧本回归**：逐条验证主线、Q01、Q02、Q03、Q04、Q05 与离山结算，不允许新系统改变已确认的任务所有权和错过窗口。

每个里程碑都必须补充状态迁移、资源扣除、重复领取、到期移除和存档读档测试，不能等到最后统一补测。

## 18. 本期明确不做

以下内容留给青茅山 MVP 之后，不得为预留它们而扩张当前界面或经济系统：

- 三转及以上升炼、仙蛊和仙元。
- 蛊阵、蛊屋及其布阵资源。
- 自动生成蛊方、杀招或生态地点。
- 蛊虫繁殖、血统、品质、星级和随机个体属性。
- 玩家交易市场、拍卖行和跨地区动态物价。
- 武器、防具、饰品、法器装备槽及任何替代名称的同类系统。
- 更多普通生态地点、普通蛊池和升炼分支。

数据结构可以保留扩展能力，但 MVP 不展示空入口、不投放占位资源，也不建立尚未使用的成长货币。

## 19. 后续待定数值

以下内容在战斗、时间和经济模型稳定后再定：

- 每时段自然恢复真元比例。
- 元石恢复真元的最终比例。
- 普通药品的生命恢复量。
- 生机叶的生命恢复量。
- 普通蛊、蛊材、食料和药品价格。
- 行囊格数与活体蛊保管容量。

这些参数调整不得改变本规格已经确认的系统边界。
