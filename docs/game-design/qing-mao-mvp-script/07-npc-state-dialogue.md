# NPC 状态对白

本文件只收录任务结算后与日常 `bark`。每句台词只读取说话者合理知晓的事实，不承担任务推进。

## B_CLAN_STEWARD_MAIN_ACTIVE_01

类型：bark
ID：B_CLAN_STEWARD_MAIN_ACTIVE_01
所属：MAIN
拥有者：npc.clan_steward
地点：clan_affairs_hall
available_from：D00_morning
expires_after：D29_evening
priority：30
topic：none
requires：
- quest.main.stage in ["identity_registered", "awakened", "academy_active", "academy_established", "route_preparing", "wolf_crisis"]
excludes：
- world.village_closed == true
once：false
on_expire：none

[族务执事]
“你的族册状态正常。差役记录、任务报酬和旧屋账分别登记，别拿其中一项替代另外两项。”

[写入]
none

[结束]
END

## B_CLAN_STEWARD_MAIN_COMPLETE_01

类型：bark
ID：B_CLAN_STEWARD_MAIN_COMPLETE_01
所属：MAIN
拥有者：npc.clan_steward
地点：inner_village_muster
available_from：D30_morning
expires_after：D30_evening
priority：30
topic：none
requires：
- quest.main.stage == "departure_open"
excludes：
- world.village_closed == true
once：false
on_expire：none

[族务执事]
“离山确认只剩今日有效。确认以前你仍可处理物品；确认以后，青茅山不再是可返回地点。”

[写入]
none

[结束]
END

## B_ACADEMY_ELDER_MAIN_HIGH_01

类型：bark
ID：B_ACADEMY_ELDER_MAIN_HIGH_01
所属：MAIN
拥有者：npc.academy_elder
地点：academy_hall
available_from：D02_noon
expires_after：D25_evening
priority：30
topic：none
requires：
- world.flags.academy_standing == "high"
excludes：
- world.village_closed == true
once：false
on_expire：none

[学堂家老]
“高档考核让你先拿资源，不让你免除差役。下一次我仍看实际结果。”

[写入]
none

[结束]
END

## B_ACADEMY_ELDER_MAIN_LOW_01

类型：bark
ID：B_ACADEMY_ELDER_MAIN_LOW_01
所属：MAIN
拥有者：npc.academy_elder
地点：academy_hall
available_from：D02_noon
expires_after：D25_evening
priority：30
topic：none
requires：
- world.flags.academy_standing == "low"
excludes：
- world.village_closed == true
once：false
on_expire：none

[学堂家老]
“一次低档只减少首次奖励。完成两次合格差役，外勤资格照样往上走。”

[写入]
none

[结束]
END

## B_FANG_ZHENG_AMBIENT_01

类型：bark
ID：B_FANG_ZHENG_AMBIENT_01
所属：GENERAL
拥有者：npc.fang_zheng
地点：academy_courtyard
available_from：D01_morning
expires_after：D19_evening
priority：10
topic：none
requires：
- npc.fang_zheng.met_player == false
excludes：
- world.village_closed == true
once：false
on_expire：none

[古月方正]
“你也是这一批的新学员？点名快开始了，有事等下课再说。”

[写入]
none

[结束]
END

## B_FANG_ZHENG_AFTER_AWAKENING_01

类型：bark
ID：B_FANG_ZHENG_AFTER_AWAKENING_01
所属：MAIN
拥有者：npc.fang_zheng
地点：academy_courtyard
available_from：D02_morning
expires_after：D19_evening
priority：30
topic：none
requires：
- quest.main.stage in ["awakened", "academy_active", "academy_established"]
- npc.fang_zheng.met_player == true
excludes：
- world.village_closed == true
once：false
on_expire：none

[古月方正]
“大家都在比较资质。我想先把月光蛊练好，不然甲等也只是名册上的两个字。”

[写入]
none

[结束]
END

## B_TAVERN_KEEPER_Q01_COMPLETE_01

类型：bark
ID：B_TAVERN_KEEPER_Q01_COMPLETE_01
所属：Q01
拥有者：npc.tavern_keeper
地点：tavern
available_from：D06_morning
expires_after：D30_evening
priority：30
topic：none
requires：
- quest.q01.result == "player_acquired"
excludes：
- world.village_closed == true
once：false
on_expire：none

[酒肆掌柜]
“后院清净了。你喂酒虫照常付账，底酒按我们约好的时辰来取。”

[写入]
none

[结束]
END

## B_TAVERN_KEEPER_Q01_OTHER_OWNER_01

类型：bark
ID：B_TAVERN_KEEPER_Q01_OTHER_OWNER_01
所属：Q01
拥有者：npc.tavern_keeper
地点：tavern
available_from：D06_morning
expires_after：D30_evening
priority：30
topic：none
requires：
- quest.q01.result in ["clan_custody", "other_acquired"]
excludes：
- world.village_closed == true
once：false
on_expire：none

[酒肆掌柜]
“酒虫最后归谁是你们的事。我的酒不再少，这笔生意账已经结了。”

[写入]
none

[结束]
END

## B_TAVERN_KEEPER_Q01_MISSED_01

类型：bark
ID：B_TAVERN_KEEPER_Q01_MISSED_01
所属：Q01
拥有者：npc.tavern_keeper
地点：tavern
available_from：D11_morning
expires_after：D30_evening
priority：30
topic：none
requires：
- quest.q01.result == "missed"
excludes：
- world.village_closed == true
once：false
on_expire：none

[酒肆掌柜]
“旧酒和旧泥都换了。如今再闻到甜香，也不是当时那条线索。”

[写入]
none

[结束]
END

## B_HE_NIANG_DEBT_01

类型：bark
ID：B_HE_NIANG_DEBT_01
所属：Q04
拥有者：npc.he_niang
地点：grain_shop
available_from：D09_morning
expires_after：D24_evening
priority：30
topic：none
requires：
- player.knowledge.parent_debt == true
- quest.q04.result == "none"
excludes：
- world.village_closed == true
once：false
on_expire：none

[禾娘]
“你欠我的粮钱和双亲的药账是两笔。先分开，才有可能把任何一笔算清。”

[写入]
none

[结束]
END

## B_HE_NIANG_SETTLED_01

类型：bark
ID：B_HE_NIANG_SETTLED_01
所属：Q04
拥有者：npc.he_niang
地点：grain_shop
available_from：D18_morning
expires_after：D30_evening
priority：30
topic：none
requires：
- quest.q04.stage == "settled"
- npc.he_niang.known_facts.parent_ledger_seen == true
excludes：
- world.village_closed == true
once：false
on_expire：none

[禾娘]
“我证明的是字迹和当年的交账，不是替任何人决定九叶该归谁。”

[写入]
none

[结束]
END

## B_CLAN_STEWARD_Q02_CLAN_OWNED_01

类型：bark
ID：B_CLAN_STEWARD_Q02_CLAN_OWNED_01
所属：Q02
拥有者：npc.clan_steward
地点：clan_affairs_hall
available_from：D16_morning
expires_after：D30_evening
priority：30
topic：none
requires：
- quest.q02.claim in ["clan", "shared"]
- quest.q02.result == "completed"
excludes：
- world.village_closed == true
once：false
on_expire：none

[族务执事]
“遗藏清单已经封存。个人所得按结算保留，族产部分不会再重复发给第二个人。”

[写入]
none

[结束]
END

## B_ACADEMY_ELDER_Q02_PLAYER_DEPTH_01

类型：bark
ID：B_ACADEMY_ELDER_Q02_PLAYER_DEPTH_01
所属：Q02
拥有者：npc.academy_elder
地点：academy_hall
available_from：D16_morning
expires_after：D30_evening
priority：30
topic：none
requires：
- quest.q02.claim == "player"
- quest.q02.result == "completed"
excludes：
- world.village_closed == true
once：false
on_expire：none

[学堂家老]
“你的探索深度是 `{q02_depth}`。取得多少是结果，能否养得起才是后续问题。”

[写入]
none

[结束]
END

## B_QING_SHU_Q02_SHARED_01

类型：bark
ID：B_QING_SHU_Q02_SHARED_01
所属：Q02
拥有者：npc.qing_shu
地点：east_wall_rest_point
available_from：D18_morning
expires_after：D25_evening
priority：30
topic：none
requires：
- quest.q02.claim == "shared"
- npc.qing_shu.alive == true
excludes：
- world.village_closed == true
once：false
on_expire：none

[古月青书]
“共有不等于所有人一起挤进石室。首次探索者、记录者和撤退负责人仍要分开。”

[写入]
none

[结束]
END

## B_MEDICINE_ELDER_Q04_PLAYER_OWNS_01

类型：bark
ID：B_MEDICINE_ELDER_Q04_PLAYER_OWNS_01
所属：Q04
拥有者：npc.medicine_elder
地点：medicine_hall
available_from：D18_morning
expires_after：D30_evening
priority：30
topic：none
requires：
- quest.q04.result == "player_owned"
excludes：
- world.village_closed == true
once：false
on_expire：none

[药堂家老]
“九叶归你，喂养和征集也归你。每旬的生机叶别忘了登记。”

[写入]
none

[结束]
END

## B_MEDICINE_ELDER_Q04_SURRENDERED_01

类型：bark
ID：B_MEDICINE_ELDER_Q04_SURRENDERED_01
所属：Q04
拥有者：npc.medicine_elder
地点：medicine_hall
available_from：D18_morning
expires_after：D30_evening
priority：30
topic：none
requires：
- quest.q04.result == "medicine_hall_owned"
excludes：
- world.village_closed == true
once：false
on_expire：none

[药堂家老]
“九叶由药堂统一催叶。你的元石报酬和保护药已结清，不再承担喂养。”

[写入]
none

[结束]
END

## B_JIANG_YA_Q04_DEAL_01

类型：bark
ID：B_JIANG_YA_Q04_DEAL_01
所属：Q04
拥有者：npc.jiang_ya
地点：east_alley_market
available_from：D19_evening
expires_after：D30_evening
priority：30
topic：none
requires：
- quest.q04.result == "jiang_ya_owned"
excludes：
- world.village_closed == true
once：false
on_expire：none

[江牙]
“七十块已经结清。今后叶价涨跌是我的账，不再回头找你补差。”

[写入]
none

[结束]
END

## B_UNCLE_Q04_LOST_01

类型：bark
ID：B_UNCLE_Q04_LOST_01
所属：Q04
拥有者：npc.uncle
地点：uncle_house
available_from：D18_morning
expires_after：D30_evening
priority：30
topic：none
requires：
- item.unique.GU_NINE_LEAF.owner != "npc.uncle"
- npc.uncle.known_facts.nine_leaf_transfer == true
excludes：
- world.village_closed == true
once：false
on_expire：none

[舅父]
“九叶已经不在我家，养护旧账仍按裁定结。你拿走蛊，不等于所有成本消失。”

[写入]
none

[结束]
END

## B_AUNT_Q04_LOST_01

类型：bark
ID：B_AUNT_Q04_LOST_01
所属：Q04
拥有者：npc.aunt
地点：uncle_house
available_from：D18_morning
expires_after：D30_evening
priority：30
topic：none
requires：
- item.unique.GU_NINE_LEAF.owner != "npc.uncle"
- npc.aunt.known_facts.cost_statement_given == true
excludes：
- world.village_closed == true
once：false
on_expire：none

[舅母]
“蛊归了别人，账也该一笔笔结。别再说这些年全是白占便宜。”

[写入]
none

[结束]
END

## B_JIA_JIN_SHENG_Q03_LEGAL_01

类型：bark
ID：B_JIA_JIN_SHENG_Q03_LEGAL_01
所属：Q03
拥有者：npc.jia_jin_sheng
地点：caravan_luxury_stall
available_from：D11_morning
expires_after：D27_evening
priority：30
topic：none
requires：
- quest.q03.route == "legal"
- npc.jia_jin_sheng.alive == true
excludes：
- world.village_closed == true
once：false
on_expire：none

[贾金生]
“走正式账赚得少，至少出了问题你能拿编号说话，不必靠谁记得你。”

[写入]
none

[结束]
END

## B_JIA_JIN_SHENG_Q03_BLACK_MARKET_01

类型：bark
ID：B_JIA_JIN_SHENG_Q03_BLACK_MARKET_01
所属：Q03
拥有者：npc.jia_jin_sheng
地点：caravan_rear_storage
available_from：D11_morning
expires_after：D27_evening
priority：30
topic：none
requires：
- quest.q03.route == "black_market"
- npc.jia_jin_sheng.alive == true
excludes：
- world.village_closed == true
once：false
on_expire：none

[贾金生]
“私货价高，因为没人替你担保。你既然选了，就别拿正式账的规矩要求它。”

[写入]
none

[结束]
END

## B_JIA_JIN_SHENG_Q03_RESCUED_01

类型：bark
ID：B_JIA_JIN_SHENG_Q03_RESCUED_01
所属：Q03
拥有者：npc.jia_jin_sheng
地点：caravan_infirmary
available_from：D14_morning
expires_after：D27_evening
priority：30
topic：none
requires：
- quest.q03.incident == "jia_alive"
- npc.jia_jin_sheng.alive == true
excludes：
- world.village_closed == true
once：false
on_expire：none

[贾金生]
“我活着回来，不代表那条路安全。谁说自己早就知道，先把当时留下的证据拿出来。”

[写入]
none

[结束]
END

## B_JIA_FU_Q03_LEGAL_01

类型：bark
ID：B_JIA_FU_Q03_LEGAL_01
所属：Q03
拥有者：npc.jia_fu
地点：caravan_accounting_tent
available_from：D15_morning
expires_after：D30_evening
priority：30
topic：none
requires：
- quest.q03.result == "legal"
excludes：
- world.village_closed == true
once：false
on_expire：none

[贾富]
“商令只证明公开往来。保管好编号，丢了可以补记录，不能补你错过的车队。”

[写入]
none

[结束]
END

## B_JIA_FU_Q03_DOUBTFUL_01

类型：bark
ID：B_JIA_FU_Q03_DOUBTFUL_01
所属：Q03
拥有者：npc.jia_fu
地点：caravan_accounting_tent
available_from：D15_morning
expires_after：D30_evening
priority：30
topic：none
requires：
- quest.q03.investigation_result == "doubtful"
excludes：
- world.village_closed == true
once：false
on_expire：none

[贾富]
“存疑不是定罪，也不是结案。你离山时带好原始记录，别拿后来整理的说法替代。”

[写入]
none

[结束]
END

## B_TIE_RUO_NAN_Q03_CLEARED_01

类型：bark
ID：B_TIE_RUO_NAN_Q03_CLEARED_01
所属：Q03
拥有者：npc.tie_ruo_nan
地点：temporary_inquiry_room
available_from：D27_morning
expires_after：D30_evening
priority：30
topic：none
requires：
- quest.q03.investigation_result == "cleared"
excludes：
- world.village_closed == true
once：false
on_expire：none

[铁若男]
“现有证据能排除你的直接责任。以后出现新事实，再从新事实开始。”

[写入]
none

[结束]
END

## B_TIE_RUO_NAN_Q03_PURSUIT_01

类型：bark
ID：B_TIE_RUO_NAN_Q03_PURSUIT_01
所属：Q03
拥有者：npc.tie_ruo_nan
地点：temporary_inquiry_room
available_from：D27_morning
expires_after：D30_evening
priority：30
topic：none
requires：
- quest.q03.investigation_result == "pursuit"
excludes：
- world.village_closed == true
once：false
on_expire：none

[铁若男]
“你的时间线仍有实质矛盾。离山不等于结案，关卡会复核身份与随身证据。”

[写入]
none

[结束]
END

## B_QING_SHU_Q05_ACTIVE_01

类型：bark
ID：B_QING_SHU_Q05_ACTIVE_01
所属：Q05
拥有者：npc.qing_shu
地点：east_wall_muster
available_from：D20_morning
expires_after：D25_evening
priority：30
topic：none
requires：
- quest.q05.stage in ["evidence_gathering", "warning_ready", "departure_pending"]
- npc.qing_shu.alive == true
excludes：
- world.village_closed == true
once：false
on_expire：none

[古月青书]
“先确认路线和撤退责任。多带一件东西，不如少留一个没人负责的位置。”

[写入]
none

[结束]
END

## B_QING_SHU_Q05_SAVED_01

类型：bark
ID：B_QING_SHU_Q05_SAVED_01
所属：Q05
拥有者：npc.qing_shu
地点：east_wall_rest_point
available_from：D24_morning
expires_after：D30_evening
priority：30
topic：none
requires：
- quest.q05.result in ["saved_stable", "saved_costly", "replaced"]
- npc.qing_shu.alive == true
excludes：
- world.village_closed == true
once：false
on_expire：none

[古月青书]
“行动结果已经写进队伍账。以后复盘看证据、准备和命令，不靠一句‘本来会怎样’。”

[写入]
none

[结束]
END

## B_QING_SHU_DEPUTY_Q05_DEAD_01

类型：bark
ID：B_QING_SHU_DEPUTY_Q05_DEAD_01
所属：Q05
拥有者：npc.qing_shu_deputy
地点：east_wall_rest_point
available_from：D24_morning
expires_after：D30_evening
priority：30
topic：none
requires：
- quest.q05.result == "dead"
- npc.qing_shu.alive == false
excludes：
- world.village_closed == true
once：false
on_expire：none

[青书副手]
“青书没回来。队伍会照记录继续撤，不用一句安慰替代死亡时辰和失败位置。”

[写入]
none

[结束]
END

## B_BAI_NING_BING_Q05_AFTER_01

类型：bark
ID：B_BAI_NING_BING_Q05_AFTER_01
所属：Q05
拥有者：npc.bai_ning_bing
地点：northwest_rock_ridge
available_from：D24_morning
expires_after：D30_evening
priority：30
topic：none
requires：
- npc.bai_ning_bing.known_facts.q05_result == true
excludes：
- world.village_closed == true
once：false
on_expire：none

[白凝冰]
“你们用路线和准备换了一个结果。下次山势、狼群或人变了，照抄这次仍会死人。”

[写入]
none

[结束]
END

## B_FANG_YUAN_AMBIENT_01

类型：bark
ID：B_FANG_YUAN_AMBIENT_01
所属：GENERAL
拥有者：npc.fang_yuan
地点：academy_dorm_lane
available_from：D03_morning
expires_after：D19_evening
priority：10
topic：none
requires：
- npc.fang_yuan.met_player == true
- npc.fang_yuan.relationship_state == "normal"
excludes：
- world.village_closed == true
once：false
on_expire：none

[方源]
“有事便说。没有交易，也没有共同目标，就各走各的。”

[写入]
none

[结束]
END

## B_FANG_YUAN_TRADE_01

类型：bark
ID：B_FANG_YUAN_TRADE_01
所属：GENERAL
拥有者：npc.fang_yuan
地点：academy_dorm_lane
available_from：D06_morning
expires_after：D25_evening
priority：30
topic：none
requires：
- npc.fang_yuan.transactions.wine_worm == true
excludes：
- world.village_closed == true
once：false
on_expire：none

[方源]
“酒虫那笔交易已经结清。新东西按新价谈，不拿旧人情抵账。”

[写入]
none

[结束]
END

## B_FANG_YUAN_CONFLICT_01

类型：bark
ID：B_FANG_YUAN_CONFLICT_01
所属：GENERAL
拥有者：npc.fang_yuan
地点：academy_dorm_lane
available_from：D06_morning
expires_after：D25_evening
priority：30
topic：none
requires：
- npc.fang_yuan.relationship_state == "conflict"
- npc.fang_yuan.direct_conflicts.q01 == true
excludes：
- world.village_closed == true
once：false
on_expire：none

[方源]
“上次争的是具体东西，账还在。你若又要同一件，先说愿意付什么。”

[写入]
none

[结束]
END

## B_FANG_YUAN_Q02_AFTER_01

类型：bark
ID：B_FANG_YUAN_Q02_AFTER_01
所属：Q02
拥有者：npc.fang_yuan
地点：southwest_slope
available_from：D16_morning
expires_after：D25_evening
priority：30
topic：none
requires：
- npc.fang_yuan.transactions.flower_wine_partition == true
- quest.q02.stage in ["completed", "collapsed"]
excludes：
- world.village_closed == true
once：false
on_expire：none

[方源]
“入口分配按约结了。你拿到多少是你的成本和结果，不需要向我解释。”

[写入]
none

[结束]
END
