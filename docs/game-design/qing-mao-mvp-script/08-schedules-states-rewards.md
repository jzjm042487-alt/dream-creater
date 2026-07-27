# 青茅山状态、日程与奖励索引

本文件是生产剧本的共享状态契约，登记枚举、截止、NPC 日程、地点、唯一物品和限定奖励。

## 主线状态

```text
quest.main.stage:
created / identity_registered / awakened / academy_active /
academy_established / route_preparing / wolf_crisis /
departure_open / departed

quest.main.departure_route:
none / clan / jia_caravan / black_market /
qing_shu_survivors / flower_wine / emergency
```

## 支线状态

```text
quest.q01.stage:
unavailable / rumored / smell_found / back_room_open /
trail_found / worm_found / refining / completed /
missed_tavern_window / lost
quest.q01.result:
none / player_acquired / clan_custody / other_acquired / refused / missed

quest.q02.stage:
unavailable / entry_rumored / entry_known / shadow_wall /
chambers_open / settling / completed / collapsed
quest.q02.entry_source:
none / wine_trail / archive / field
quest.q02.depth:
0 / 1 / 2 / 3
quest.q02.claim:
none / player / clan / shared / other
quest.q02.result:
none / completed / failed / refused / collapsed / missed

quest.q03.stage:
unavailable / contacted / route_selected / incident_pending /
case_open / evidence_disposition / settled / missed
quest.q03.route:
none / legal / black_market / observer / refused
quest.q03.incident:
pending / jia_alive / jia_missing / jia_dead / jia_disgraced
quest.q03.investigation_result:
none / cleared / doubtful / pursuit
quest.q03.result:
none / legal / black_market / observer / failed / refused / missed

quest.q04.stage:
unavailable / ownership_rumored / evidence_gathering /
claim_selected / ownership_contested / settled / missed
quest.q04.route:
none / lawful_claim / trade / theft / surrender / observer / refused
quest.q04.result:
none / player_owned / medicine_hall_owned / jiang_ya_owned /
family_owned / failed / refused / missed

quest.q05.stage:
unavailable / recruited / evidence_gathering / warning_ready /
departure_pending / resolved / missed
quest.q05.intent:
none / stable_rescue / costly_rescue / replace / withdraw / refuse
quest.q05.operation_result:
not_started / success / partial / failure
quest.q05.result:
none / saved_stable / saved_costly / replaced / dead / withdrew / refused / missed
```

集合字段：

```text
quest.q03.evidence_flags:
unregistered_crate / road_trace / witness_statement /
trade_record / player_contradiction

quest.q04.evidence_flags:
parent_ledger / custody_record / he_niang_testimony

quest.q05.evidence_flags:
wolf_route / survivor_report / ice_trace / battle_observation

quest.q05.preparation_flags:
medicine_supply / armory_gear / retreat_markers / team_signal
```

计数字段：

```text
quest.q05.evidence_family_count: 0 / 1 / 2
quest.q05.preparation_count: 0 / 1 / 2 / 3 / 4
```

## 通用状态

```text
world.day: 0..30
world.period: morning / noon / afternoon / evening
world.departure_open: true / false
world.village_closed: true / false
world.flags.<id>: true / false

player.attributes.<id>: integer
player.traits.<id>: true / false
player.inventory: set<ITEM_IDS>
player.knowledge.<id>: true / false

npc.<id>.alive: true / false
npc.<id>.met_player: true / false
npc.<id>.relationship_state:
stranger / normal / cooperative / conflict
npc.<id>.known_facts.<id>: true / false
npc.<id>.transactions.<id>: true / false
npc.<id>.direct_conflicts.<id>: true / false

item.unique.<item_id>.owner:
none / player / clan / medicine_hall / lost /
missed_permanently / npc.<id> / object.<id>

operation.q05_rescue:
locked / ready / running / settled / skipped
```

所有青茅山记录隐含：

```text
excludes:
- world.village_closed == true
```

## 截止

| 内容 | 包含的最后时段 | 到期结果 |
| --- | --- | --- |
| Q01 | D10_evening | `quest.q01.result=missed` |
| Q03 初结算 | D15_evening | 锁定案件路线 |
| Q04 | D24_evening | `quest.q04.result=missed` |
| Q02 | D25_evening | 入口坍塌并按已取得深度结算 |
| Q05 | D25_evening | `quest.q05.result=missed` |
| Q03 后果 | D27_evening | 锁定追查结果 |
| 离山选择 | D30_evening | 自动紧急流亡 |

## 限定奖励

| ID | 来源 | 最后窗口 | 即时用途 | 中期用途 | 成本或代价 |
| --- | --- | --- | --- | --- | --- |
| `GU_WINE_WORM` | Q01 自留 | D10_evening | 提高一转真元质量 | 四味酒虫路线材料 | 喂养青竹酒 |
| `GU_WHITE_BOAR` | Q02 深度 1 | D25_evening | 增长力量 | 力道构筑核心 | 长期肉食 |
| `GU_JADE_SKIN` | Q02 深度 2 | D25_evening | 防御皮肤 | 近战防护 | 真元维持 |
| `GU_HIDDEN_STONE` | Q02 深度 3 | D25_evening | 隐匿气息 | 潜行与藏物 | 移动速度代价 |
| `ITEM_FLOWER_WINE_MAP` | Q02 深度 3 | D25_evening | 标记密道 | 离山路线 | 承担遗藏暴露风险 |
| `GU_MUDSKIN_TOAD` | 紫金石 | D12_evening | 出售换启动资金 | 炼道材料 | 占用资金和喂养 |
| `GU_RED_IRON_RELIC` | 最后商队 | D23_evening | 提升一转修为 | 缩短晋升期 | 高价且唯一 |
| `ITEM_JIA_PASS` | Q03 合法路线 | D27_evening | 合法通行 | 商旅身份 | 放弃黑市奖励 |
| `GU_SLEEVE_POUCH` | Q03 黑市路线 | D27_evening | 扩充随身空间 | 走私与撤离 | 放弃合法身份 |
| `ITEM_BLACK_LEDGER` | Q03 黑市路线 | D27_evening | 黑市联系人 | 灰色商路 | 被调查风险 |
| `GU_NINE_LEAF` | Q04 自留 | D24_evening | 催生生机叶 | 持续治疗经济 | 药堂压力与喂养 |
| `ITEM_MEDICINE_PROTECTION` | Q04 上缴 | D24_evening | 一次保命治疗 | 药堂关系 | 放弃九叶所有权 |
| `ITEM_QING_SHU_TOKEN` | Q05 非背弃结算 | D25_evening | 证明队伍关系 | 遗民接应 | 不能交易 |
| `ITEM_GREEN_VINE_CHARM` | Q05 稳妥救援 | D25_evening | 抵消一次致命物理伤害 | 中期护命 | 一次性 |
| `ITEM_QING_SHU_SUPPORT` | Q05 充分准备 | D25_evening | 狼潮自动完成一项目标 | 遗民协助 | 一次性 |
| `ITEM_CLAN_HISTORY_RECORD` | Q02 特殊影壁处置 | D25_evening | 提供家族谈判证据 | 后续调查条件 | 提高家族关注 |

离山后可以获得升级材料，但不会重新生成上表的基础物、信物和通行权。
