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
world.flags.q05_decision_actor:
none / qing_shu / qing_shu_deputy
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
world.flags.<registered_id>: boolean / registered enum / nonnegative integer

player.attributes.<registered_id>: integer
player.traits.<registered_id>: true / false
player.inventory: set<ITEM_IDS>
player.knowledge.<registered_id>: true / false
player.resources.primeval_stones: integer >= 0
player.resources.clan_merit: integer

npc.<NPC_ID>.alive: true / false
npc.<NPC_ID>.met_player: true / false
npc.<NPC_ID>.relationship_state:
stranger / normal / cooperative / conflict
npc.<NPC_ID>.known_facts.<registered_id>: true / false
npc.<NPC_ID>.transactions.<registered_id>: true / false
npc.<NPC_ID>.direct_conflicts.<registered_id>: true / false

item.unique.<ITEM_ID>.owner:
none / player / clan / medicine_hall / lost /
missed_permanently / npc.<NPC_ID> / object.<OBJECT_ID>

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

## NPC_IDS

```text
academy_elder
academy_instructor
armory_keeper
aunt
bai_ning_bing
black_market_broker
caravan_accountant
caravan_gambling_merchant
caravan_guard
clan_steward
clan_storekeeper
fang_yuan
fang_zheng
he_niang
jia_fu
jia_jin_sheng
jiang_ya
last_supply_merchant
medicine_elder
mountain_road_witness
old_contact_chen
ordinary_wine_worm_holder
qing_shu
qing_shu_deputy
scout_survivor
tavern_helper
tavern_keeper
tie_ruo_nan
uncle
village_guard
```

## OBJECT_IDS

```text
academy_trial_board
awakening_array
back_room_jar
clan_archive_shelf
dorm_refining_station
earth_treasury_flower
emergency_exit
flower_wine_exit
flower_wine_shadow_wall
hidden_chamber_lock
ice_trace
jade_skin_pedestal
jia_incident_scene
medicine_custody_record
moonlight_refining_station
mountain_crack
mountain_road_departure_marker
nine_leaf_cultivation_bed
north_slope_wolf_route
parent_hidden_ledger
purple_gold_stone
retreat_marker_board
secret_map_pedestal
strength_gate
unregistered_crate
white_boar_pedestal
wine_scent_trail
wine_trail_entry
wine_worm_hideout
```

## LOCATION_IDS

```text
academy_archive_desk
academy_courtyard
academy_dorm
academy_dorm_lane
academy_hall
academy_refining_room
academy_store
academy_training_yard
branch_house_kitchen
branch_house_lane
caravan_accounting_tent
caravan_gambling_stall
caravan_guard_post
caravan_infirmary
caravan_luxury_stall
caravan_rear_storage
clan_affairs_hall
clan_archive
clan_armory
dry_well_passage
east_alley_market
east_wall_muster
east_wall_rest_point
east_wall_survivor_point
flower_wine_entrance
flower_wine_escape_tunnel
flower_wine_first_chamber
flower_wine_hidden_chamber
flower_wine_second_chamber
flower_wine_second_gate
grain_shop
grain_shop_back_room
hope_gu_flower_sea
inner_village_muster
last_caravan_supply_cart
medicine_hall
medicine_hall_archive
north_cliff_emergency_path
north_slope_stone_bridge
northwest_rock_ridge
old_hunter_hut
south_gate
south_gate_infirmary
south_road_caravan_point
southwest_mountain_wall
southwest_slope
tavern
tavern_back_room
tavern_bamboo_fence
tavern_side_door
temporary_inquiry_room
uncle_house
uncle_house_medicine_garden
west_mountain_incident_site
west_mountain_road
```

## ITEM_IDS

```text
GU_HIDDEN_STONE
GU_JADE_SKIN
GU_MOONLIGHT
GU_MUDSKIN_TOAD
GU_NINE_LEAF
GU_RED_IRON_RELIC
GU_SLEEVE_POUCH
GU_WHITE_BOAR
GU_WINE_WORM
ITEM_ARCHIVE_READING_SLIP
ITEM_BLACK_LEDGER
ITEM_BRANCH_HOUSE_KEY
ITEM_CLAN_HISTORY_RECORD
ITEM_CLAN_WOOD_BADGE
ITEM_CUSTODY_SUMMARY
ITEM_FLOWER_WINE_MAP
ITEM_GREEN_VINE_CHARM
ITEM_HE_NIANG_LIMITED_GUARANTEE
ITEM_JIA_PASS
ITEM_LIFE_LEAF_3
ITEM_MEDICINE_PROTECTION
ITEM_PARENT_LEDGER
ITEM_PARENT_LEDGER_COPY
ITEM_PRIMEVAL_STONE_STARTER_1
ITEM_PRIMEVAL_STONE_STARTER_3
ITEM_Q02_ARCHIVE_SLIP
ITEM_Q03_STATEMENT_COPY
ITEM_Q05_ARMORY_SET
ITEM_Q05_MEDICINE_PACK_1
ITEM_Q05_MEDICINE_PACKS
ITEM_Q05_OPERATION_RECORD
ITEM_Q05_REPLACEMENT_RECORD
ITEM_Q05_SIGNAL_AND_SHIELD
ITEM_QING_SHU_DEATH_RECORD
ITEM_QING_SHU_SUPPORT
ITEM_QING_SHU_TOKEN
ITEM_RETREAT_MARKER_2
ITEM_SIGNAL_FIRE_GU_LOAN
ITEM_TAVERN_BACK_ROOM_KEY
ITEM_TEN_WINE_CREDITS
ITEM_TWO_WINE_CREDITS
ITEM_WINE_BAIT
```

## TEMPLATE_VARIABLES

```text
academy_standing
aperture_capacity
aptitude
cultivation_multiplier
nine_leaf_owner
player_name
q02_depth
q03_available_evidence
q03_investigation_result
q03_last_seen_fact
q03_route
q05_available_evidence
q05_missed_requirements
```

所有模板变量在显示前解析。无法解析时，对应记录或选择禁用，不把花括号原样显示给玩家。

## STATE_KEYS_AND_VALUES

```text
quest.main.stage:
created / identity_registered / awakened / academy_active /
academy_established / route_preparing / wolf_crisis / departure_open / departed
quest.main.departure_route:
none / clan / jia_caravan / black_market /
qing_shu_survivors / flower_wine / emergency

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
quest.q02.depth: 0 / 1 / 2 / 3
quest.q02.claim: none / player / clan / shared / other
quest.q02.result: none / completed / failed / refused / collapsed / missed

quest.q03.stage:
unavailable / contacted / route_selected / incident_pending /
case_open / evidence_disposition / settled / missed
quest.q03.route: none / legal / black_market / observer / refused
quest.q03.incident: pending / jia_alive / jia_missing / jia_dead / jia_disgraced
quest.q03.investigation_result: none / cleared / doubtful / pursuit
quest.q03.result: none / legal / black_market / observer / failed / refused / missed
quest.q03.evidence_flags:
unregistered_crate / road_trace / witness_statement /
trade_record / player_contradiction

quest.q04.stage:
unavailable / ownership_rumored / evidence_gathering /
claim_selected / ownership_contested / settled / missed
quest.q04.route: none / lawful_claim / trade / theft / surrender / observer / refused
quest.q04.result:
none / player_owned / medicine_hall_owned / jiang_ya_owned /
family_owned / failed / refused / missed
quest.q04.evidence_flags:
parent_ledger / custody_record / he_niang_testimony

quest.q05.stage:
unavailable / recruited / evidence_gathering / warning_ready /
departure_pending / resolved / missed
quest.q05.intent:
none / stable_rescue / costly_rescue / replace / withdraw / refuse
quest.q05.operation_result: not_started / success / partial / failure
quest.q05.result:
none / saved_stable / saved_costly / replaced /
dead / withdrew / refused / missed
world.flags.q05_decision_actor:
none / qing_shu / qing_shu_deputy
quest.q05.evidence_flags:
wolf_route / survivor_report / ice_trace / battle_observation
quest.q05.preparation_flags:
medicine_supply / armory_gear / retreat_markers / team_signal
quest.q05.evidence_family_count: 0 / 1 / 2
quest.q05.preparation_count: 0 / 1 / 2 / 3 / 4
quest.q05.casualties: 0 / 1 / 2

world.day: integer 0..30
world.period: morning / noon / afternoon / evening
world.departure_open: boolean
world.village_closed: boolean
world.flags.<registered_id>: boolean / registered enum / nonnegative integer

player.attributes.<registered_id>: integer
player.traits.<registered_id>: boolean
player.inventory: set<ITEM_IDS>
player.knowledge.<registered_id>: boolean
player.resources.primeval_stones: nonnegative integer
player.resources.clan_merit: integer

npc.<NPC_ID>.alive: boolean
npc.<NPC_ID>.met_player: boolean
npc.<NPC_ID>.relationship_state: stranger / normal / cooperative / conflict
npc.<NPC_ID>.known_facts.<registered_id>: boolean
npc.<NPC_ID>.transactions.<registered_id>: boolean
npc.<NPC_ID>.direct_conflicts.<registered_id>: boolean

item.unique.<ITEM_ID>.owner:
none / player / clan / medicine_hall / lost / missed_permanently /
npc.<NPC_ID> / object.<OBJECT_ID>

operation.q05_rescue:
locked / ready / running / settled / skipped
```

集合写入只使用 `+=`，移除只使用 `-=`。唯一物品转移必须在同一结果块中同时更新
`player.inventory` 与 `item.unique.<ITEM_ID>.owner`。

## NPC 日程

| NPC | 日期 | 上午 | 中午 | 下午 | 晚间 | 缺席或替代 |
| --- | --- | --- | --- | --- | --- | --- |
| `clan_steward` | D00–D29 | 族务堂 | 族务堂 | 族务堂 | 缺席 | D30 转内寨集合点；主线信息由学堂家老或守卫替代 |
| `old_contact_chen` | D00–D05 | 旁支巷 | 粮铺后 | 粮铺后 | 缺席 | 身份核验为辅助信息，不是主线门槛 |
| `academy_elder` | D01–D25 | 学堂正厅 | 学堂正厅 | 档案桌 | 缺席 | 教习替代基础课信息 |
| `academy_instructor` | D01–D12 | 器材房 | 训练场 | 炼化室 | 缺席 | 学堂家老替代资格信息 |
| `fang_zheng` | D01–D19 | 学堂院 | 学堂院 | 训练场 | 宿舍巷 | 无必需信息 |
| `tavern_keeper` | D05–D30 | 酒肆 | 酒肆 | 酒肆 | 酒肆 | 任务截止后只保留结算回应 |
| `tavern_helper` | D05–D09 | 侧门 | 前堂 | 侧门 | 后院 | 酒饵为可选准备 |
| `clan_storekeeper` | D06–D10 | 族库 | 族库 | 酒肆后院 | 缺席 | 仅 Q01 上缴路线 |
| `fang_yuan` | D03–D25 | 按普通学员日程 | 按普通学员日程 | 按普通任务地点 | 宿舍巷 | 所有内容可跳过，无专用调度系统 |
| `caravan_accountant` | D11–D15 | 账房帐 | 账房帐 | 验货区 | 账房帐 | D30 在南路撤离点；应急出口替代离山功能 |
| `caravan_gambling_merchant` | D12 | 赌石摊 | 赌石摊 | 赌石摊 | 离场 | 紫金石永久错过 |
| `caravan_guard` | D12–D14 | 守卫岗 | 守卫岗 | 西山路 | 营地 | 账房提供登记规则 |
| `last_supply_merchant` | D23 | 最后补给车 | 最后补给车 | 最后补给车 | 离场 | 赤铁舍利蛊永久错过 |
| `jia_jin_sheng` | D11–D14 | 豪华摊 | 豪华摊 | 后仓或西山 | 营地 | 缺席时账房提供合法与旁观入口 |
| `jia_fu` | D14–D27 | 账房帐 | 账房帐 | 账房帐 | 缺席 | 铁若男只替代 D27 后果复核 |
| `mountain_road_witness` | D14–D15 | 南门医棚 | 南门医棚 | 南门医棚 | 缺席 | 现场痕迹可替代证言 |
| `tie_ruo_nan` | D27 | 临时问话室 | 临时问话室 | 临时问话室 | 离场 | 系统按证据写最终调查状态 |
| `he_niang` | D09–D24 | 粮铺 | 粮铺后 | 粮铺 | 粮铺后 | 两份书证可替代她的证言 |
| `uncle` | D10–D24 | 舅父家 | 药圃 | 舅父家 | 舅父家 | 药堂可执行合法裁定 |
| `aunt` | D10–D24 | 舅父家 | 舅父家 | 药圃 | 舅父家 | 公开药堂账可替代成本陈述 |
| `medicine_elder` | D11–D30 | 药堂 | 药堂 | 药堂 | 缺席 | 药堂档案物件提供 Q04 证据 |
| `jiang_ya` | D19–D24 | 缺席 | 东巷 | 东巷 | 东巷 | 仅交易替代，不是 Q04 门槛 |
| `qing_shu` | D18–D30 | 东墙集合点 | 外勤或休息点 | 外勤 | 休息点 | 副手替代招募、汇报和决策 |
| `qing_shu_deputy` | D20–D30 | 东墙集合点 | 东墙集合点 | 东墙集合点 | 休息点 | 青书在场时仍负责队伍级信息 |
| `scout_survivor` | D20–D24 | 旧猎棚 | 旧猎棚 | 南门医棚 | 缺席 | 狼路物件可独立提供同证据家族 |
| `armory_keeper` | D21–D25 | 兵库 | 兵库 | 兵库 | 缺席 | 药包和标记仍能满足两项准备 |
| `bai_ning_bing` | D21–D24 | 西北岩脊 | 西北岩脊 | 离场 | 离场 | 冰痕物件完全替代其证言 |
| `black_market_broker` | D15–D30 | 缺席 | 枯井暗道 | 枯井暗道 | 枯井暗道 | 仅黑市奖励与离山路线 |
| `village_guard` | D26–D29 | 南门 | 南门 | 南门 | 南门 | 守备告示提供相同狼潮信息 |

## 唯一物品所有权

| ID | 初始持有人 | 合法转移记录 | 最后窗口 | 未取得结果 | 离山 |
| --- | --- | --- | --- | --- | --- |
| `GU_WINE_WORM` | `object.wine_worm_hideout` | `I_Q01_WINE_WORM_01`、`D_Q01_CLAN_STOREKEEPER_01`、`D_Q01_FANG_YUAN_01` | D10_evening | `missed_permanently` | 玩家持有时携带 |
| `GU_WHITE_BOAR` | `object.white_boar_pedestal` | `I_Q02_WHITE_BOAR_TRAINING_01` | D25_evening | `missed_permanently` | 玩家持有时携带 |
| `GU_JADE_SKIN` | `object.jade_skin_pedestal` | `I_Q02_JADE_CHAMBER_01` | D25_evening | `missed_permanently` | 玩家持有时携带 |
| `GU_HIDDEN_STONE` | `object.secret_map_pedestal` | `I_Q02_SECRET_MAP_01` | D25_evening | `missed_permanently` | 玩家持有时携带 |
| `ITEM_FLOWER_WINE_MAP` | `object.secret_map_pedestal` | `I_Q02_SECRET_MAP_01` | D25_evening | `missed_permanently` | 解锁后携带 |
| `GU_MUDSKIN_TOAD` | `object.purple_gold_stone` | `I_MAIN_PURPLE_GOLD_STONE_01`、`D_MAIN_CARAVAN_MERCHANT_01` | D12_evening | `missed_permanently` | 玩家持有时携带 |
| `GU_RED_IRON_RELIC` | `npc.last_supply_merchant` | `D_MAIN_CARAVAN_MERCHANT_02` | D23_evening | `missed_permanently` | 玩家持有时携带 |
| `ITEM_JIA_PASS` | `npc.jia_fu` | `D_Q03_JIA_FU_REWARD_LEGAL_01` | D27_evening | `missed_permanently` | 解锁合法路线 |
| `GU_SLEEVE_POUCH` | `npc.black_market_broker` | `D_Q03_BLACK_MARKET_BROKER_REWARD_01` | D27_evening | `missed_permanently` | 玩家持有时携带 |
| `ITEM_BLACK_LEDGER` | `npc.black_market_broker` | `D_Q03_BLACK_MARKET_BROKER_REWARD_01` | D27_evening | `missed_permanently` | 解锁黑市路线 |
| `GU_NINE_LEAF` | `npc.uncle` | `I_Q04_NINE_LEAF_GRASS_01`、`D_Q04_MEDICINE_ELDER_SETTLEMENT_01`、`D_Q04_JIANG_YA_SETTLEMENT_01` | D24_evening | 保持当时合法持有人 | 最终持有人携带或留存 |
| `ITEM_MEDICINE_PROTECTION` | `medicine_hall` | `D_Q04_MEDICINE_ELDER_SETTLEMENT_01` | D24_evening | `missed_permanently` | 玩家持有时携带 |
| `ITEM_QING_SHU_TOKEN` | `npc.qing_shu` | Q05 生还或顶替结算 | D25_evening | `missed_permanently` | 解锁遗民身份 |
| `ITEM_GREEN_VINE_CHARM` | `npc.qing_shu` | `D_Q05_QING_SHU_RESULT_SAVED_01` | D25_evening | `missed_permanently` | 一次性携带 |
| `ITEM_QING_SHU_SUPPORT` | `npc.qing_shu` | Q05 稳妥或顶替结算 | D25_evening | `missed_permanently` | 解锁遗民路线 |
| `ITEM_CLAN_HISTORY_RECORD` | `object.flower_wine_shadow_wall` | `I_Q02_SHADOW_WALL_01` | D25_evening | `missed_permanently` | 玩家持有时携带 |
