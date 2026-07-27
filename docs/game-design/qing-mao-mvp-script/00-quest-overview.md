# 青茅山 MVP 任务总览

玩家是唯一主角。方源只是普通、可选的路边 NPC；不与方源交互也能完成主线和五条支线。
日期只更新世界状态、NPC 出勤和任务截止。除第 30 日晚的紧急流亡外，玩家必须在正确地点找到
角色或物件，主动触发一次对话或交互。

## 玩家入口

```text
输入姓名
-> 生成古月旁支男性身份
-> Roll 资质、属性、天赋、缺陷和命格
-> 确认或重掷
-> quest.main.stage = created
```

玩家清楚自己正在游玩由小说生成的游戏。系统界面可以显示原作信息；玩家对 NPC 说出的每一句话
都必须是世界内角色能够理解的说法。

## 主线

```text
created
-> identity_registered
-> awakened
-> academy_active
-> academy_established
-> route_preparing
-> wolf_crisis
-> departure_open
-> departed
```

1. 族务执事登记玩家的旁支身份。
2. 旧识提供一条可核验的生活记忆。
3. 学堂家老主持开窍并按 Roll 结果回应。
4. 玩家炼化月光蛊，通过或承受学堂考核结果。
5. 商队、家族和灰色渠道提供不同离山准备。
6. 狼潮开放任务与撤离路线。
7. 第 30 日玩家在地图上选择已解锁路线并确认永久离山。
8. 第 30 日晚仍未确认时，系统自动写入紧急流亡。

任何主线节点都不读取 `npc.fang_yuan`。

## 五条支线

| ID | 名称 | 接触 | 调查 | 决定 | 最后窗口 |
| --- | --- | --- | --- | --- | --- |
| Q01 | 月下酒虫 | 酒肆掌柜的异香麻烦 | 酒坛、酒气轨迹、藏身处 | 自留炼化、交族库、让他人取得、拒绝 | D10_evening |
| Q02 | 花酒遗藏 | 酒气、学堂档案或野外痕迹 | 影壁与三层石室 | 自取、共有、上缴、放弃 | D25_evening |
| Q03 | 贾金生遗案 | 贾金生或商队账房 | 私货、路线、案发处、证言 | 合法、黑市、旁观、拒绝 | D15 初结算，D27 后果 |
| Q04 | 九叶生机草 | 禾娘、舅父舅母或药堂 | 遗产账、保管记录、证言 | 合法主张、交易、偷取、上缴、放弃 | D24_evening |
| Q05 | 青书的死局 | 青书、副手或外勤告示 | 狼路、幸存者、冰痕、战斗观察 | 稳妥救援、冒险救援、顶替、撤回、拒绝 | D25_evening |

## 交叉关系

- Q01 的酒气轨迹可以提供 Q02 入口，但学堂档案和野外调查都是独立入口。
- Q03 奖励可以开放合法商队或黑市离山路线，但紧急路线永远存在。
- Q04 的药物和 Q05 的遗民支援可以降低狼潮成本，但都不是主线门槛。
- 方源可能持有某件任务物品；每条任务始终存在不经过他的成功路线。

## 系统流程

以下流程不伪装成 NPC 对话：

| 流程 | 输入 | 写入 |
| --- | --- | --- |
| 角色 Roll | 姓名、确认或重掷 | 属性、资质、天赋、缺陷、命格、`quest.main.stage=created` |
| 时间推进 | 玩家结束时段 | `world.day`、`world.period`、到期结算 |
| D30 开放离山 | 进入 D30_morning | `quest.main.stage=departure_open`、`world.departure_open=true` |
| 离山确认 | 玩家在离山交互点确认 | 选择路线、`quest.main.stage=departed`、`world.village_closed=true` |
| 紧急流亡 | 推进超过 D30_evening 且未离山 | `departure_route=emergency`、`stage=departed`、村庄关闭 |

`world.village_closed=true` 后，本目录的所有 NPC、物件、商店和任务记录都不可再触发。

## 基础走查

### 纯主线

```text
确认 Roll
-> 族务堂登记
-> 旧屋核验记忆
-> 开窍
-> 炼化月光蛊
-> 学堂考核
-> 选择普通外勤准备
-> D30 手动紧急出口
-> quest.main.stage = departed
```

五条支线均保持 `unavailable` 或在截止时写入 `missed`，主线仍然完成。

### 不接触方源

```text
主线全部使用族务执事、旧识、学堂家老、教习、商队账房、守卫和出口物件
-> visited(D_Q01_FANG_YUAN_01) = false
-> 所有主线阶段照常推进
-> quest.main.departure_route = emergency
-> world.village_closed = true
```

### 全部错过

```text
D10: Q01 -> missed
D15/D27: Q03 -> missed
D24: Q04 -> missed
D25: Q02/Q05 -> missed
D30: 缺失清单只显示玩家已发现的限定物名称
-> 紧急流亡
```

### 全限定收集

玩家依次完成 Q01 自留、Q02 深度 3、Q03 选定一条互斥路线、Q04 自留或药堂替代奖励、
Q05 稳妥救援，并取得紫金石与最后商队隐藏物。每件唯一物品只能有一个最终持有人。

### 不同 Roll

- 低资质且无相关天赋：学堂奖励较少，普通任务仍开放，最终可紧急离山。
- 社交天赋：可降低说服难度，不代替证据或物品，最终可任意满足条件的路线离山。
- 高修炼天赋：更容易炼化与取得学堂资源，不自动取得支线奖励，最终仍需主动离山。

三类 Roll 都必须经过：

```text
quest.main.stage = identity_registered
-> quest.main.stage = academy_established
-> quest.main.stage = departed
```

### Q01 成功与失去

玩家成功：

```text
unavailable
-> D_Q01_TAVERN_KEEPER_01: smell_found
-> D_Q01_TAVERN_KEEPER_02: back_room_open
-> I_Q01_BACK_ROOM_JAR_01: trail_found
-> I_Q01_WINE_SCENT_TRAIL_01: wine_worm_hideout=true
-> I_Q01_WINE_WORM_01: item.owner=player, stage=refining
-> I_Q01_DORM_REFINING_01: result=player_acquired
-> D_Q01_TAVERN_KEEPER_RESULT_PLAYER_01
```

失去：

```text
捕捉失败
-> item.owner=npc.fang_yuan 或 npc.ordinary_wine_worm_holder
-> 可选交易成功则回到 refining
-> 不交易或再失败则 result=other_acquired
-> D_Q01_TAVERN_KEEPER_RESULT_OTHER_01
```

不接触方源的成功路线使用酒饵或直接捕捉；上缴族库则写入 `clan_custody`。拒绝与 D10 超时分别
进入 `refused` 和 `missed`，不会复用失败对白。

### Q02 深度一、二、三

任一入口：

```text
wine_trail / archive / field
-> entry_known
-> I_Q02_SHADOW_WALL_01
-> chambers_open
```

深度一：

```text
I_Q02_EARTH_FLOWER_01
-> I_Q02_WHITE_BOAR_TRAINING_01
-> GU_WHITE_BOAR.owner=player
-> depth=1
-> settling -> completed
```

深度二：

```text
深度一
-> I_Q02_STRENGTH_GATE_01
-> I_Q02_JADE_CHAMBER_01
-> GU_JADE_SKIN.owner=player
-> depth=2
-> settling -> completed
```

深度三：

```text
深度二
-> I_Q02_HIDDEN_CHAMBER_01
-> I_Q02_SECRET_MAP_01
-> GU_HIDDEN_STONE.owner=player
-> ITEM_FLOWER_WINE_MAP.owner=player
-> depth=3
-> settling -> completed
```

未找方源、未完成 Q01 时，档案或野外入口仍可完成深度三。D25 后，仍在物件上的奖励全部变为
`missed_permanently`。

### Q03 合法与黑市

合法：

```text
D_Q03_CARAVAN_ACCOUNTANT_01 或 D_Q03_JIA_JIN_SHENG_02
-> route=legal
-> 守卫登记与山路行动
-> case_open
-> 完整证据提交
-> ITEM_JIA_PASS.owner=player
-> result=legal
```

黑市：

```text
D_Q03_JIA_JIN_SHENG_02
-> route=black_market
-> I_Q03_UNREGISTERED_CRATE_01
-> 山路行动
-> 部分保留私货线
-> GU_SLEEVE_POUCH.owner=player
-> ITEM_BLACK_LEDGER.owner=player
-> result=black_market
```

取得一组奖励时，另一组立即写入 `missed_permanently`。旁观路线在 D27 复核后写
`result=observer`；拒绝、调查失败和未在 D15 封账前参与分别进入独立终点。全流程不需要方源。

### Q04 自留、上缴与失去

自留：

```text
ownership_rumored
-> parent_ledger + custody_record
-> lawful_claim
-> I_Q04_NINE_LEAF_GRASS_01 成功
-> GU_NINE_LEAF.owner=player
-> result=player_owned
```

上缴：

```text
确认玩家所有权
-> route=surrender
-> I_Q04_NINE_LEAF_GRASS_01 上缴
-> GU_NINE_LEAF.owner=medicine_hall
-> ITEM_MEDICINE_PROTECTION.owner=player
-> result=medicine_hall_owned
```

失去：

```text
合法主张失败或偷取失败
-> GU_NINE_LEAF.owner=npc.uncle
-> result=failed
```

合法交易给江牙则写 `owner=npc.jiang_ya`；明确放弃写 `refused`；D24 未完成任何有效转移写
`missed`。每条路线只有一个最终持有人，均不阻断离山。

### Q05 七种终局

共同前半：

```text
青书或副手招募
-> 狼路/幸存者组成证据家族一
-> 冰痕组成证据家族二
-> evidence_family_count=2
-> 至少准备药包、护具、标记、信号中的可用项目
-> 最终决定
```

终局矩阵：

| 选择与操作结果 | 任务结果 | 结算角色 |
| --- | --- | --- |
| 稳妥救援成功，准备至少两项 | `saved_stable` | 青书 |
| 稳妥救援部分成功 | `saved_costly` | 青书 |
| 冒险救援成功或部分成功 | `saved_costly` | 青书 |
| 顶替成功或部分成功 | `replaced` | 青书 |
| 出发前撤回 | `withdrew` | 青书或副手 |
| 明确拒绝 | `refused` | 青书或副手 |
| 操作失败或青书死亡 | `dead` | 青书副手 |

未在 D25 前决定则是第八个非操作终点 `missed`。不与白凝冰交谈时，`I_Q05_ICE_TRACE_01` 独立
满足第二证据家族。每条终局都写 `stage=resolved` 或 `stage=missed`。

### 第 30 日超时紧急流亡

```text
D30_morning
-> quest.main.stage=departure_open
-> world.departure_open=true
-> 玩家不触发任何离山确认
-> 推进超过 D30_evening
-> quest.main.departure_route=emergency
-> quest.main.stage=departed
-> world.village_closed=true
```

该兜底不播放强制对话，不检查支线、Roll 或是否见过任何 NPC。
