# 主线：旁支蛊师与永久离山

本文件只记录玩家主动触发的主线对话与物件交互。创建角色、日期推进、到期结算和离山确认是系统
流程，不伪装成连续剧情。

## 系统流程：创建角色

进入新游戏后，系统依次提供：

1. 输入姓名。姓氏固定为“古月”，玩家输入一至三个字的名。
2. 确认固定男性角色立绘与 Q 版形象；本 MVP 不提供捏脸。
3. 生成五项基础属性：体魄、身法、洞察、心性、交涉。
4. 生成甲、乙、丙、丁四档资质及对应空窍容量。
5. 生成一项天赋、一项缺陷和一项命格。
6. 玩家选择“确认”或“重新 Roll”。确认后本存档不能再次修改。

可生成天赋：

```text
真元亲和：炼化与基础修炼判定降低难度
细察入微：调查痕迹时增加有效信息
市井通达：交易和套话判定降低难度
筋骨坚韧：负伤与体力消耗降低
心如止水：恐惧、诱导与压力判定降低难度
```

可生成缺陷：

```text
经脉滞涩：连续使用蛊虫的真元成本增加
旧伤：高强度体魄行动有额外风险
不善言辞：首次交涉判定难度增加
多疑：合作收益降低，但识破欺骗获得修正
贪杯：酒类资源消耗增加，辨酒获得修正
```

命格只改变事件权重，不直接给予任务答案：

```text
逢凶见路 / 财来带险 / 旧债相随 / 贵人迟至 / 孤锋自持
```

确认写入：

```text
quest.main.stage = "created"
quest.main.departure_route = "none"
world.day = 0
world.period = "morning"
world.departure_open = false
world.village_closed = false
```

## D_MAIN_CLAN_STEWARD_01

类型：dialogue
ID：D_MAIN_CLAN_STEWARD_01
所属：MAIN
拥有者：npc.clan_steward
地点：clan_affairs_hall
available_from：D00_morning
expires_after：D03_evening
priority：60
topic：none
requires：
- quest.main.stage == "created"
excludes：
- world.village_closed == true
once：true
on_expire：none

[族务执事]
“古月{player_name}，旁支旧屋空了七年，你的名字却一直留在族册末页。回来可以，先把来历、住处和
应尽的份例说清楚。”

[选择 A]
[玩家]
“我按族册登记。旧屋归我使用，族中该出的差役和供奉，也按旁支规矩来。”

[判定]
none

[族务执事]
“说得明白就好。旧屋钥匙、两日口粮和一块身份木牌给你。开窍以前，每日到学堂点名；开窍以后，
差役由学堂和族务堂共同派。”

[写入]
quest.main.stage = "identity_registered"
player.inventory += "ITEM_BRANCH_HOUSE_KEY"
player.inventory += "ITEM_CLAN_WOOD_BADGE"
npc.clan_steward.met_player = true
npc.clan_steward.relationship_state = "normal"

[结束]
END

[选择 B]
[玩家]
“登记以前，我要先知道旁支要交什么、能领什么，免得日后各说一套。”

[判定]
none

[族务执事]
“谨慎不算坏事。未开窍时领口粮、住旧屋；开窍后按修为领元石，也要接采集、巡查和守寨差役。
账在右边木牌上，你看完再按手印。”

[写入]
quest.main.stage = "identity_registered"
player.inventory += "ITEM_BRANCH_HOUSE_KEY"
player.inventory += "ITEM_CLAN_WOOD_BADGE"
player.knowledge.branch_obligations = true
npc.clan_steward.met_player = true
npc.clan_steward.relationship_state = "normal"

[结束]
END

[选择 C]
[玩家]
“族册既然留着我的名字，旧屋和双亲未领的份例也该有账。我登记，但请把旧账一并封存给我查。”

[判定]
交涉 + 市井通达，对抗难度 55

[成功]
[族务执事]
“你知道先问账，倒不像在外面白过了几年。旧账不能带走，我给你一张查阅签；三日内去档案房，
过期重申请。”

[写入]
quest.main.stage = "identity_registered"
player.inventory += "ITEM_BRANCH_HOUSE_KEY"
player.inventory += "ITEM_CLAN_WOOD_BADGE"
player.inventory += "ITEM_ARCHIVE_READING_SLIP"
player.knowledge.parent_account_exists = true
npc.clan_steward.met_player = true
npc.clan_steward.relationship_state = "cooperative"

[结束]
END

[失败]
[族务执事]
“族册证明你是谁，不证明族里欠你什么。先登记，旧账等你开窍后凭功绩申请。别把两件事混在
一起。”

[写入]
quest.main.stage = "identity_registered"
player.inventory += "ITEM_BRANCH_HOUSE_KEY"
player.inventory += "ITEM_CLAN_WOOD_BADGE"
player.knowledge.parent_account_exists = true
npc.clan_steward.met_player = true
npc.clan_steward.relationship_state = "normal"

[结束]
END

## D_MAIN_OLD_CONTACT_01

类型：dialogue
ID：D_MAIN_OLD_CONTACT_01
所属：MAIN
拥有者：npc.old_contact_chen
地点：branch_house_lane
available_from：D00_noon
expires_after：D05_evening
priority：60
topic：none
requires：
- quest.main.stage == "identity_registered"
excludes：
- world.village_closed == true
- npc.old_contact_chen.met_player == true
once：true
on_expire：none

[陈伯]
“木牌上的名字没错。你小时候怕雷，每逢雨夜就把东窗下的米缸盖搬到床边，说那块木头比屋顶
结实。如今还记得那只米缸么？”

[选择 A]
[玩家]
“不记得米缸，只记得东窗漏水。你若真认识我双亲，说一件族册上没有的事。”

[判定]
none

[陈伯]
“你父亲左手少了半截小指，平日用布套遮着；你母亲不许人在你面前提那伤。旧屋灶台第三块砖后
还藏过她记药钱的薄册。是不是还在，我不敢保证。”

[写入]
npc.old_contact_chen.met_player = true
npc.old_contact_chen.relationship_state = "normal"
player.knowledge.parent_hidden_ledger_hint = true
world.flags.identity_memory_confirmed = true

[结束]
END

[选择 B]
[玩家]
“我离开太久，旧事模糊了。你告诉我，他们最后为什么把我送走？”

[判定]
none

[陈伯]
“不是送走，是托人避债。你父亲替药堂运货时少了一箱，账落在你家名下；两人后来死在山外，
这笔账就一直悬着。你回来，债主迟早也会想起。”

[写入]
npc.old_contact_chen.met_player = true
npc.old_contact_chen.relationship_state = "cooperative"
player.knowledge.parent_debt = true
world.flags.identity_memory_confirmed = true

[结束]
END

[选择 C]
[玩家]
“我今天只来认门。旧事等我安顿好再问。”

[判定]
none

[陈伯]
“也好。东墙那口井别直接喝，雨后会泛苦。你若要找我，午后我在粮铺后面修竹筐。”

[写入]
npc.old_contact_chen.met_player = true
npc.old_contact_chen.relationship_state = "normal"
player.knowledge.old_contact_schedule = true

[结束]
END

## D_MAIN_ACADEMY_ELDER_01

类型：dialogue
ID：D_MAIN_ACADEMY_ELDER_01
所属：MAIN
拥有者：npc.academy_elder
地点：academy_hall
available_from：D01_morning
expires_after：D04_noon
priority：60
topic：none
requires：
- quest.main.stage == "identity_registered"
excludes：
- world.village_closed == true
- world.flags.awakening_registered == true
once：false
on_expire：none

[学堂家老]
“古月{player_name}，族务堂的木牌已经送到。名字列在这一批最后，不代表你能迟到。进花海以前，
我只问一次：身体有没有旧伤，昨夜有没有饮酒？”

[选择 A]
[玩家]
“没有饮酒，身体可以入阵。请按名册安排。”

[判定]
none

[学堂家老]
“去西侧候着。轮到名字便进入花海，跟随希望蛊的光走，不要追逐旁人的光点。”

[写入]
world.flags.awakening_registered = true
player.knowledge.awakening_rules = true

[结束]
END

[选择 B]
[玩家]
“我有旧伤，但不影响行走。若开窍时发作，阵中如何退出？”

[判定]
none

[学堂家老]
“举起木牌，守阵蛊师会把你带出。退出不等于失败，只是本次结果作废，下一批再来。隐瞒旧伤才会
真的害你。”

[写入]
world.flags.awakening_registered = true
player.knowledge.awakening_rules = true
player.knowledge.awakening_exit = true

[结束]
END

[选择 C]
[玩家]
“我还没有准备好。今日先不入阵。”

[判定]
none

[学堂家老]
“可以。第四日午前是最后一批，过时便等来年。你自己承担这段时间的口粮和身份限制。”

[写入]
player.knowledge.awakening_deadline = true

[结束]
END

## I_MAIN_AWAKENING_ARRAY_01

类型：interaction
ID：I_MAIN_AWAKENING_ARRAY_01
所属：MAIN
拥有者：object.awakening_array
地点：hope_gu_flower_sea
available_from：D01_morning
expires_after：D04_noon
priority：80
topic：none
requires：
- quest.main.stage == "identity_registered"
- world.flags.awakening_registered == true
excludes：
- world.village_closed == true
once：true
on_expire：none

[提示]
完成开窍流程

[操作 A]
进入希望蛊花海并完成开窍

[判定]
none

[事实结果]
“希望蛊的光在空窍中稳定下来。系统登记资质为 `{aptitude}`，空窍容量为
`{aperture_capacity}`，修炼倍率为 `{cultivation_multiplier}`。”

[写入]
quest.main.stage = "awakened"
player.knowledge.aperture_result = true
world.flags.awakening_complete = true

[结束]
END

[操作 B]
复核守阵说明

[判定]
none

[事实结果]
“守阵说明只确认退出方式、禁止争抢希望蛊，以及开窍结果由学堂统一登记；没有隐藏的第二次
判定。”

[写入]
player.knowledge.awakening_rules = true

[结束]
END

[操作 C]
暂时离开

[判定]
none

[事实结果]
“本次没有进入花海，开窍名额仍保留到 D04_noon。”

[写入]
none

[结束]
END

## D_MAIN_ACADEMY_ELDER_02

类型：dialogue
ID：D_MAIN_ACADEMY_ELDER_02
所属：MAIN
拥有者：npc.academy_elder
地点：academy_hall
available_from：D01_noon
expires_after：D06_evening
priority：70
topic：none
requires：
- quest.main.stage == "awakened"
- world.flags.awakening_complete == true
excludes：
- world.village_closed == true
- world.flags.awakening_briefed == true
once：true
on_expire：none

[学堂家老]
“结果已经入册：`{aptitude}`。资质决定你起步时能装多少真元，不决定你会不会把每一块元石浪费
掉。现在问，过了今日我只看你的功课。”

[选择 A]
[玩家]
“这份资质在同批里处于什么位置？我能领到多少修炼资源？”

[判定]
none

[学堂家老]
“学堂按资质给基础份额，按考核给追加份额。资质低，便少犯无意义的错；资质高，也别把别人的
资源当成理所当然。”

[写入]
world.flags.awakening_briefed = true
player.knowledge.academy_resource_rule = true
npc.academy_elder.met_player = true
npc.academy_elder.relationship_state = "normal"

[结束]
END

[选择 B]
[玩家]
“若起步慢，我能不能用任务功绩换取额外元石和蛊虫？”

[判定]
none

[学堂家老]
“能。采集、巡查、照看蛊材都有功绩。学堂不会因为资质低把门关死，也不会因为资质高替你完成
差役。”

[写入]
world.flags.awakening_briefed = true
player.knowledge.merit_tasks = true
npc.academy_elder.met_player = true
npc.academy_elder.relationship_state = "normal"

[结束]
END

[选择 C]
[玩家]
“我明白了。先学会用第一只蛊，再谈以后。”

[判定]
none

[学堂家老]
“去器材房找教习。今日领月光蛊，三日内完成第一次炼化。失败可以重来，耗掉的真元和时间不会
回来。”

[写入]
world.flags.awakening_briefed = true
player.knowledge.starter_gu_assignment = true
npc.academy_elder.met_player = true
npc.academy_elder.relationship_state = "normal"

[结束]
END

## D_MAIN_INSTRUCTOR_01

类型：dialogue
ID：D_MAIN_INSTRUCTOR_01
所属：MAIN
拥有者：npc.academy_instructor
地点：academy_store
available_from：D01_noon
expires_after：D07_evening
priority：60
topic：none
requires：
- quest.main.stage == "awakened"
- world.flags.awakening_briefed == true
excludes：
- world.village_closed == true
- player.inventory contains "GU_MOONLIGHT"
once：true
on_expire：none

[教习]
“木牌给我。月光蛊一只、炼化用元石三块、三日口粮。月光蛊擅长直线攻击，耗真元不低；第一课
不是放月刃，是先让它认你的真元。”

[选择 A]
[玩家]
“炼化时最容易出错的地方是什么？”

[判定]
none

[教习]
“急。蛊虫反抗时，新人总想一次压服，真元散得比水还快。分三次包住它的意志，每次只推进一层。
空窍发痛就停。”

[写入]
quest.main.stage = "academy_active"
player.inventory += "GU_MOONLIGHT"
player.inventory += "ITEM_PRIMEVAL_STONE_STARTER_3"
player.knowledge.moonlight_refining_method = true
npc.academy_instructor.met_player = true
npc.academy_instructor.relationship_state = "normal"

[结束]
END

[选择 B]
[玩家]
“月光蛊不合我的天赋，能否换成侦查或防护蛊？”

[判定]
none

[教习]
“基础课不换。你得先证明能炼化、喂养并控制一只标准蛊，才有资格从族库换别的。天赋是修正，
不是免课凭证。”

[写入]
quest.main.stage = "academy_active"
player.inventory += "GU_MOONLIGHT"
player.inventory += "ITEM_PRIMEVAL_STONE_STARTER_3"
player.knowledge.gu_exchange_rule = true
npc.academy_instructor.met_player = true
npc.academy_instructor.relationship_state = "normal"

[结束]
END

[选择 C]
[玩家]
“数量无误。我先完成炼化，再来领下一课。”

[判定]
none

[教习]
“炼化室在东廊，宿舍也能做。别在人多的饭堂尝试，失控的月光蛊会先割伤离你最近的人。”

[写入]
quest.main.stage = "academy_active"
player.inventory += "GU_MOONLIGHT"
player.inventory += "ITEM_PRIMEVAL_STONE_STARTER_3"
npc.academy_instructor.met_player = true
npc.academy_instructor.relationship_state = "normal"

[结束]
END

## I_MAIN_MOONLIGHT_REFINING_01

类型：interaction
ID：I_MAIN_MOONLIGHT_REFINING_01
所属：MAIN
拥有者：object.moonlight_refining_station
地点：academy_refining_room
available_from：D01_afternoon
expires_after：D10_evening
priority：80
topic：none
requires：
- quest.main.stage == "academy_active"
- player.inventory contains "GU_MOONLIGHT"
excludes：
- world.village_closed == true
- world.flags.moonlight_refined == true
once：false
on_expire：none

[提示]
炼化月光蛊

[操作 A]
按教习的方法分段注入真元

[判定]
心性 + 资质修正 + 真元亲和，对抗难度 55

[成功]
[事实结果]
“月光蛊的反抗逐层减弱，最终接受玩家真元。炼化完成，剩余资源足以参加基础考核。”

[写入]
world.flags.moonlight_refined = true
world.flags.moonlight_refining_failed = false
player.inventory -= "ITEM_PRIMEVAL_STONE_STARTER_1"

[结束]
END

[失败]
[事实结果]
“真元在最后一层失去连续性，月光蛊重新封闭意志。蛊虫没有损坏，本次元石与一个时段已经消耗。”

[写入]
world.flags.moonlight_refining_failed = true
player.inventory -= "ITEM_PRIMEVAL_STONE_STARTER_1"

[结束]
END

[操作 B]
先复核真元回路

[判定]
none

[事实结果]
“回路与教习说明一致。系统显示下一次炼化仍需一块元石与一个时段，不会自动成功。”

[写入]
player.knowledge.moonlight_refining_method = true

[结束]
END

[操作 C]
不消耗资源并离开

[判定]
none

[事实结果]
“没有进行炼化，月光蛊和元石状态不变。”

[写入]
none

[结束]
END

## D_MAIN_INSTRUCTOR_02

类型：dialogue
ID：D_MAIN_INSTRUCTOR_02
所属：MAIN
拥有者：npc.academy_instructor
地点：academy_training_yard
available_from：D02_morning
expires_after：D12_evening
priority：60
topic：none
requires：
- quest.main.stage == "academy_active"
- world.flags.moonlight_refined == true
excludes：
- world.village_closed == true
- world.flags.academy_trial_unlocked == true
once：true
on_expire：none

[教习]
“能让蛊虫认主，只算你没有把第一份资源丢掉。下一项考核三选一：移动靶、真元控制，或者基础
差役。考核结果只改变奖励，不会把你赶出学堂。”

[选择 A]
[玩家]
“我选移动靶。先告诉我命中和误伤分别怎么计分。”

[判定]
none

[教习]
“三枚木靶，命中两枚合格；碰到人形禁靶直接降档。月刃离手以后不会听你拐弯，出手前先看清
整条线。”

[写入]
world.flags.academy_trial_unlocked = true
world.flags.academy_trial_preference = "moving_target"
player.knowledge.moving_target_rules = true

[结束]
END

[选择 B]
[玩家]
“我选真元控制。资质不同，考核消耗是否按同一个标准？”

[判定]
none

[教习]
“看完成比例，不看你空窍总量。甲等能浪费，丁等也能精准。别用资质替自己的控制找借口。”

[写入]
world.flags.academy_trial_unlocked = true
world.flags.academy_trial_preference = "essence_control"
player.knowledge.essence_trial_rules = true

[结束]
END

[选择 C]
[玩家]
“我先做基础差役。稳定拿到学堂资格，再补战斗训练。”

[判定]
none

[教习]
“可以。把蛊材仓的月兰按成熟度分箱，错一箱扣一块元石。没有额外奖励，但完成便算合格。”

[写入]
world.flags.academy_trial_unlocked = true
world.flags.academy_trial_preference = "basic_duty"
player.knowledge.basic_duty_rules = true

[结束]
END

## I_MAIN_ACADEMY_TRIAL_01

类型：interaction
ID：I_MAIN_ACADEMY_TRIAL_01
所属：MAIN
拥有者：object.academy_trial_board
地点：academy_training_yard
available_from：D02_morning
expires_after：D12_evening
priority：80
topic：none
requires：
- quest.main.stage == "academy_active"
- world.flags.academy_trial_unlocked == true
excludes：
- world.village_closed == true
- world.flags.academy_trial_resolved == true
once：true
on_expire：none

[提示]
选择并完成一项学堂基础考核

[操作 A]
完成移动靶考核

[判定]
洞察 + 身法 + 月光蛊熟练，对抗难度 60

[成功]
[事实结果]
“三枚木靶命中两枚以上，没有触碰人形禁靶。考核登记为高档。”

[写入]
world.flags.academy_trial_resolved = true
world.flags.academy_standing = "high"
world.flags.academy_reward_tier = "high"

[结束]
END

[失败]
[事实结果]
“有效命中不足两枚，或月刃擦过禁靶。考核登记为低档，但基础资格保留。”

[写入]
world.flags.academy_trial_resolved = true
world.flags.academy_standing = "low"
world.flags.academy_reward_tier = "low"

[结束]
END

[操作 B]
完成真元控制考核

[判定]
心性 + 资质修正 + 真元亲和，对抗难度 58

[成功]
[事实结果]
“规定时间内完成三次等量真元输出，误差低于标准。考核登记为高档。”

[写入]
world.flags.academy_trial_resolved = true
world.flags.academy_standing = "high"
world.flags.academy_reward_tier = "high"

[结束]
END

[失败]
[事实结果]
“三次真元输出误差超过标准。考核登记为低档，但基础资格保留。”

[写入]
world.flags.academy_trial_resolved = true
world.flags.academy_standing = "low"
world.flags.academy_reward_tier = "low"

[结束]
END

[操作 C]
完成蛊材仓基础差役

[判定]
none

[事实结果]
“月兰按成熟度完成分箱。没有追加奖励，考核登记为标准档。”

[写入]
world.flags.academy_trial_resolved = true
world.flags.academy_standing = "standard"
world.flags.academy_reward_tier = "standard"

[结束]
END

## D_MAIN_ACADEMY_ELDER_03

类型：dialogue
ID：D_MAIN_ACADEMY_ELDER_03
所属：MAIN
拥有者：npc.academy_elder
地点：academy_hall
available_from：D02_noon
expires_after：D15_evening
priority：70
topic：none
requires：
- quest.main.stage == "academy_active"
- world.flags.academy_trial_resolved == true
excludes：
- world.village_closed == true
once：true
on_expire：none

[学堂家老]
“教习的记录到了。你的考核档次是 `{academy_standing}`。从现在起，你能接正式差役，也可以继续
留在学堂补课。档次影响第一份奖励，不影响你是不是蛊师。”

[选择 A]
[玩家]
“按考核档次结算奖励，再给我一份适合当前修为的差役名单。”

[判定]
none

[学堂家老]
“奖励去器材房领。名单上有采集、巡查、守库和商队杂役，先看风险，再看报酬。活着交差比逞强
重要。”

[写入]
quest.main.stage = "academy_established"
world.flags.academy_reward_claimable = true
player.knowledge.field_duty_board = true

[结束]
END

[选择 B]
[玩家]
“若档次不高，我需要做到什么，才能取得与高档相同的外勤资格？”

[判定]
none

[学堂家老]
“完成两次无违纪差役，或者在下一次月考补上。学堂看持续结果。你今天的低档不会消失，也不会
成为永远的门槛。”

[写入]
quest.main.stage = "academy_established"
world.flags.academy_reward_claimable = true
player.knowledge.academy_recovery_route = true

[结束]
END

[选择 C]
[玩家]
“我先保留差役资格，自行准备修炼构筑。需要家族许可时我再来。”

[判定]
none

[学堂家老]
“可以。蛊虫来源、喂养和伤人后果都由你负责。你仍受族规约束，别把‘自行准备’理解成无人过问。”

[写入]
quest.main.stage = "academy_established"
world.flags.academy_reward_claimable = true
player.knowledge.independent_build_rule = true

[结束]
END

## D_MAIN_CARAVAN_ACCOUNTANT_01

类型：dialogue
ID：D_MAIN_CARAVAN_ACCOUNTANT_01
所属：MAIN
拥有者：npc.caravan_accountant
地点：caravan_accounting_tent
available_from：D11_morning
expires_after：D15_evening
priority：60
topic：none
requires：
- quest.main.stage == "academy_established"
excludes：
- world.village_closed == true
once：true
on_expire：none

[商队账房]
“古月家的年轻蛊师？先说好，商队不收一句‘想出山’当路费。正式路签要有担保、货物份额或连续
三日的差役记录。临时同行也要押金。”

[选择 A]
[玩家]
“把三种办法的价码分别说清楚。我只比较能兑现的条件。”

[判定]
none

[商队账房]
“家族担保最省钱，但离队要报备；货物份额要四十块元石；差役不用先付钱，却要搬货、守夜、验
封条，缺一次便清零。你自己选成本。”

[写入]
quest.main.stage = "route_preparing"
player.knowledge.jia_caravan_pass_terms = true
npc.caravan_accountant.met_player = true
npc.caravan_accountant.relationship_state = "normal"

[结束]
END

[选择 B]
[玩家]
“我可以做差役。先给我一项能留下正式记录的工作，不接只靠口头作证的活。”

[判定]
none

[商队账房]
“懂得要记录，省得日后争。去找东侧验货人，他会把时辰和封条号写进账。三次合格记录可以抵一半
押金，也能在贾家商路上证明身份。”

[写入]
quest.main.stage = "route_preparing"
world.flags.caravan_labor_unlocked = true
player.knowledge.jia_caravan_pass_terms = true
npc.caravan_accountant.met_player = true
npc.caravan_accountant.relationship_state = "cooperative"

[结束]
END

[选择 C]
[玩家]
“我暂时不跟商队走，只想知道青茅山以外最近的落脚点。”

[判定]
none

[商队账房]
“向南两日是白骨山旧驿，向东要过河谷。没有路签也不是不能走，只是关卡、客栈和商队都按无籍
流民看你。”

[写入]
quest.main.stage = "route_preparing"
player.knowledge.nearest_outside_routes = true
npc.caravan_accountant.met_player = true
npc.caravan_accountant.relationship_state = "normal"

[结束]
END

## I_MAIN_PURPLE_GOLD_STONE_01

类型：interaction
ID：I_MAIN_PURPLE_GOLD_STONE_01
所属：MAIN
拥有者：object.purple_gold_stone
地点：caravan_gambling_stall
available_from：D12_morning
expires_after：D12_evening
priority：60
topic：none
requires：
- quest.main.stage == "route_preparing"
excludes：
- world.village_closed == true
- item.unique.GU_MUDSKIN_TOAD.owner != "object.purple_gold_stone"
once：false
on_expire：
- item.unique.GU_MUDSKIN_TOAD.owner = "missed_permanently"

[提示]
查看赌石摊最后一枚紫金石

[操作 A]
检查重量、温度和石皮回声

[判定]
洞察 + 细察入微，对抗难度 62

[成功]
[事实结果]
“石块下半部比同体积紫金石轻，贴近时有间歇性的微弱温差。内部不是空洞，更像一只进入休眠的
活物。”

[写入]
player.knowledge.purple_gold_stone_alive = true
world.flags.purple_gold_discount = true

[结束]
END

[失败]
[事实结果]
“石皮回声混乱，重量也在紫金石的正常误差内。没有取得足以判断内部物的可靠证据。”

[写入]
player.knowledge.purple_gold_stone_examined = true

[结束]
END

[操作 B]
按摊价购买并请摊主当场解石

[判定]
none

[事实结果]
“石皮解开后，休眠的癞土蛤蟆恢复呼吸。交易已经完成，蛊虫归玩家所有。”

[写入]
player.resources.primeval_stones -= 18
player.inventory += "GU_MUDSKIN_TOAD"
item.unique.GU_MUDSKIN_TOAD.owner = "player"

[结束]
END

[操作 C]
放弃购买

[判定]
none

[事实结果]
“没有发生交易。紫金石在 D12_evening 后随赌石摊离开。”

[写入]
none

[结束]
END

## D_MAIN_CARAVAN_MERCHANT_01

类型：dialogue
ID：D_MAIN_CARAVAN_MERCHANT_01
所属：MAIN
拥有者：npc.caravan_gambling_merchant
地点：caravan_gambling_stall
available_from：D12_morning
expires_after：D12_evening
priority：70
topic：none
requires：
- item.unique.GU_MUDSKIN_TOAD.owner == "player"
excludes：
- world.village_closed == true
- npc.caravan_gambling_merchant.transactions.mudskin_toad_settled == true
once：true
on_expire：none

[赌石商]
“好眼力也好，好运也罢，石头开出来便不退。癞土蛤蟆不适合你现在斗战，我出三十二块元石收回；
你也可以留下，等遇到炼道蛊师再谈。”

[选择 A]
[玩家]
“三十五块，当场结清。你省下找下一位买家的时间。”

[判定]
交涉 + 市井通达，对抗难度 58

[成功]
[赌石商]
“三十五。你把它的腹印留给我拓一份，往后出了别的配方，别说我没提醒你。”

[写入]
player.inventory -= "GU_MUDSKIN_TOAD"
player.resources.primeval_stones += 35
item.unique.GU_MUDSKIN_TOAD.owner = "npc.caravan_gambling_merchant"
npc.caravan_gambling_merchant.transactions.mudskin_toad_settled = true

[结束]
END

[失败]
[赌石商]
“三十二，一块不加。你若不卖，今晚我也带不走你的蛊。”

[写入]
player.inventory -= "GU_MUDSKIN_TOAD"
player.resources.primeval_stones += 32
item.unique.GU_MUDSKIN_TOAD.owner = "npc.caravan_gambling_merchant"
npc.caravan_gambling_merchant.transactions.mudskin_toad_settled = true

[结束]
END

[选择 B]
[玩家]
“我不卖。告诉我最低限度的喂养方法，这桩赌石交易便到此为止。”

[判定]
none

[赌石商]
“湿土、细碎矿粉，七日喂一次。它的价值不在斗战，在胃囊能压住某些炼材杂气。养不起时再找
炼道铺，别饿死了才来估价。”

[写入]
player.knowledge.mudskin_toad_feeding = true
npc.caravan_gambling_merchant.transactions.mudskin_toad_settled = true

[结束]
END

## D_MAIN_CARAVAN_MERCHANT_02

类型：dialogue
ID：D_MAIN_CARAVAN_MERCHANT_02
所属：MAIN
拥有者：npc.last_supply_merchant
地点：last_caravan_supply_cart
available_from：D23_morning
expires_after：D23_evening
priority：80
topic：最后补给
requires：
- quest.main.stage == "route_preparing"
- player.resources.primeval_stones >= 55
- item.unique.GU_RED_IRON_RELIC.owner == "npc.last_supply_merchant"
excludes：
- world.village_closed == true
once：true
on_expire：
- item.unique.GU_RED_IRON_RELIC.owner = "missed_permanently"

[最后商队商人]
“赤铁舍利蛊一只，五十五块元石。它能直接抬高一转小境界，不能替你补根基。我们日落开拔，
不赊、不换货，也不等你筹钱。”

[选择 A]
[玩家]
“五十五块，当场验明活性和所有权，交易后不留寄售名目。”

[判定]
none

[最后商队商人]
“行。封蜡、气息、账号都在这里。你付钱以后，它只记你的真元，商队也不再对它主张任何权利。”

[写入]
player.resources.primeval_stones -= 55
player.inventory += "GU_RED_IRON_RELIC"
item.unique.GU_RED_IRON_RELIC.owner = "player"
npc.last_supply_merchant.transactions.red_iron_relic = true

[结束]
END

[选择 B]
[玩家]
“我不买。把这只蛊的真假识别方法告诉我，算我付一块问价费。”

[判定]
none

[最后商队商人]
“舍利蛊受真元一触会亮三息，假货只热不亮。问价费我收了，蛊不留。日落以后，你在青茅山找
不到第二只。”

[写入]
player.resources.primeval_stones -= 1
player.knowledge.red_iron_relic_authentication = true

[结束]
END

## D_MAIN_ACADEMY_ELDER_04

类型：dialogue
ID：D_MAIN_ACADEMY_ELDER_04
所属：MAIN
拥有者：npc.academy_elder
地点：academy_hall
available_from：D13_morning
expires_after：D22_evening
priority：60
topic：外勤准备
requires：
- quest.main.stage == "academy_established"
excludes：
- world.village_closed == true
once：true
on_expire：none

[学堂家老]
“学堂阶段到这里便不再替你安排每一步。接下来三种去处：跟族中队伍做有护卫的差役，接普通
野外任务，或者自行筹备蛊虫和离山身份。没有一种免风险。”

[选择 A]
[玩家]
“我跟族中队伍。先建立稳定功绩和同队记录。”

[判定]
none

[学堂家老]
“去守备堂登记。收入少一些，出事时有人接应。你必须服从撤退号令，不能为了私人物品让整队
回头。”

[写入]
quest.main.stage = "route_preparing"
world.flags.main_preparation_route = "clan_guarded"
player.knowledge.clan_field_team = true

[结束]
END

[选择 B]
[玩家]
“我接普通野外任务。风险和收益由我自己筛。”

[判定]
none

[学堂家老]
“任务板会标明最低修为，不会标明所有意外。接任务以前留一份路线；失联后族里是否找你，要看
任务等级和当时人手。”

[写入]
quest.main.stage = "route_preparing"
world.flags.main_preparation_route = "ordinary_field"
player.knowledge.field_mission_board = true

[结束]
END

[选择 C]
[玩家]
“我自行准备。只保留族规要求的报备，不占队伍名额。”

[判定]
none

[学堂家老]
“准。你可以和商队、药堂、猎户或灰市交易，所得后果也由你承担。狼潮迹象已经出现，别把准备
拖到寨门关闭以后。”

[写入]
quest.main.stage = "route_preparing"
world.flags.main_preparation_route = "independent"
player.knowledge.wolf_tide_warning = true

[结束]
END

## D_MAIN_VILLAGE_GUARD_01

类型：dialogue
ID：D_MAIN_VILLAGE_GUARD_01
所属：MAIN
拥有者：npc.village_guard
地点：south_gate
available_from：D26_morning
expires_after：D29_evening
priority：80
topic：狼潮封寨
requires：
- quest.main.stage == "route_preparing"
excludes：
- world.village_closed == true
once：true
on_expire：none

[守寨蛊师]
“南门从现在起只进不出。狼群已经切断两条山路，守备堂征用治疗蛊和运输蛊师。你有正式队伍便去
报到，没有便登记撤离位置，别在警钟响后乱跑。”

[选择 A]
[玩家]
“我登记守寨差役。把集合点、撤退号和失守后的备用门告诉我。”

[判定]
none

[守寨蛊师]
“东墙三号台集合，三短一长是撤退号。东门失守便退内寨，不许自行开南门。你的名字记入轮值，
具体战斗由守备堂安排。”

[写入]
quest.main.stage = "wolf_crisis"
world.flags.wolf_crisis_duty = "wall"
player.knowledge.crisis_retreat_signal = true

[结束]
END

[选择 B]
[玩家]
“我不占守墙位置，登记物资转运和伤员撤离。”

[判定]
none

[守寨蛊师]
“药堂与内寨之间缺人。你去领白布臂带，见到三道红纹的伤员先送，普通轻伤让他们自己走。”

[写入]
quest.main.stage = "wolf_crisis"
world.flags.wolf_crisis_duty = "evacuation"
player.knowledge.crisis_casualty_priority = true

[结束]
END

[选择 C]
[玩家]
“我不接差役，只登记个人避难和离山准备。”

[判定]
none

[守寨蛊师]
“记下了。族里不会替你保留外门通道，警钟后擅开封锁会被当成破坏守备。第三十日若还有路，
你只能从系统开放的撤离点确认。”

[写入]
quest.main.stage = "wolf_crisis"
world.flags.wolf_crisis_duty = "none"
player.knowledge.departure_confirmation_rule = true

[结束]
END

## D_MAIN_CLAN_STEWARD_02

类型：dialogue
ID：D_MAIN_CLAN_STEWARD_02
所属：MAIN
拥有者：npc.clan_steward
地点：inner_village_muster
available_from：D30_morning
expires_after：D30_evening
priority：100
topic：家族撤离
requires：
- quest.main.stage == "departure_open"
- world.departure_open == true
- world.flags.clan_departure_eligible == true
excludes：
- world.village_closed == true
once：false
on_expire：none

[族务执事]
“你的名字在内寨撤离册上。跟家族队伍走，身份和基本供给有人担保；作为代价，离山后第一个落脚
点由队伍决定，中途不能擅自脱离。”

[选择 A]
[玩家]
“把家族撤离列为我的离山选择，打开不可逆确认。”

[判定]
none

[族务执事]
“可以。确认界面会列出你仍未取得的已知限定物。你按下确认以后，旧屋、任务和这里的人都不会再
作为可返回地点保留。”

[写入]
world.flags.departure_confirmation_source = "D_MAIN_CLAN_STEWARD_02"

[结束]
END

[选择 B]
[玩家]
“我先不确认。撤离册保留到什么时候？”

[判定]
none

[族务执事]
“只到今晚。最后一声警钟以后，队伍不再等单个人。”

[写入]
player.knowledge.departure_deadline = true

[结束]
END

## D_MAIN_CARAVAN_ACCOUNTANT_02

类型：dialogue
ID：D_MAIN_CARAVAN_ACCOUNTANT_02
所属：MAIN
拥有者：npc.caravan_accountant
地点：south_road_caravan_point
available_from：D30_morning
expires_after：D30_evening
priority：100
topic：贾家商路
requires：
- quest.main.stage == "departure_open"
- world.departure_open == true
- player.inventory contains "ITEM_JIA_PASS"
excludes：
- world.village_closed == true
once：false
on_expire：none

[商队账房]
“通行商令是真的，账号也对。我们带你过第一道山关，之后按商队雇员登记。货车优先，不保证替你
保任何没上清单的私人物品。”

[选择 A]
[玩家]
“按商令登记，把贾家商路列为我的离山选择并打开确认。”

[判定]
none

[商队账房]
“名字已录。确认以后跟紧第三辆车，掉队不会折返。”

[写入]
world.flags.departure_confirmation_source = "D_MAIN_CARAVAN_ACCOUNTANT_02"

[结束]
END

[选择 B]
[玩家]
“暂不确认。我先处理随身物品。”

[判定]
none

[商队账房]
“日落前回来。过时商令仍是真的，车队却不会还在这里。”

[写入]
none

[结束]
END

## D_MAIN_BLACK_MARKET_BROKER_01

类型：dialogue
ID：D_MAIN_BLACK_MARKET_BROKER_01
所属：MAIN
拥有者：npc.black_market_broker
地点：dry_well_passage
available_from：D30_morning
expires_after：D30_evening
priority：100
topic：黑市暗道
requires：
- quest.main.stage == "departure_open"
- world.departure_open == true
- player.inventory contains "ITEM_BLACK_LEDGER"
excludes：
- world.village_closed == true
once：false
on_expire：none

[黑市掮客]
“名册能证明你不是临时跟来的眼线。暗道只保你出寨，不保山外身份；出去以后，你欠名单上第一个
落脚点一趟货。”

[选择 A]
[玩家]
“债和风险我听清了。把黑市暗道列为离山选择，打开确认。”

[判定]
none

[黑市掮客]
“确认后烧掉你手里的明页，只留暗记。旧身份在关卡上帮不了你，名单上的人却会认这笔债。”

[写入]
world.flags.departure_confirmation_source = "D_MAIN_BLACK_MARKET_BROKER_01"

[结束]
END

[选择 B]
[玩家]
“我不确认。名册仍由我保管。”

[判定]
none

[黑市掮客]
“保管可以。寨子毁了以后，纸上的名字有些是门，有些是追债的人。”

[写入]
none

[结束]
END

## D_MAIN_QING_SHU_DEPUTY_01

类型：dialogue
ID：D_MAIN_QING_SHU_DEPUTY_01
所属：MAIN
拥有者：npc.qing_shu_deputy
地点：east_wall_survivor_point
available_from：D30_morning
expires_after：D30_evening
priority：100
topic：青书遗民
requires：
- quest.main.stage == "departure_open"
- world.departure_open == true
- player.inventory contains "ITEM_QING_SHU_SUPPORT"
excludes：
- world.village_closed == true
once：false
on_expire：none

[青书副手]
“我们欠你一次完整的接应。东墙旧藤桥还能撑一趟，队伍会带你过断崖；过桥以后，大家以遗民身份
共同寻找落脚地，不接受临时甩下伤员。”

[选择 A]
[玩家]
“我接受共同撤离。把青书遗民路线列为离山选择，打开确认。”

[判定]
none

[青书副手]
“我把你的名字放在中段。确认以后听队伍信号，不要独自抢桥。”

[写入]
world.flags.departure_confirmation_source = "D_MAIN_QING_SHU_DEPUTY_01"

[结束]
END

[选择 B]
[玩家]
“我暂不确认。把我的位置让给伤员。”

[判定]
none

[青书副手]
“位置不是一次性的名额，但时间是。今晚以前回来，我们仍会接你。”

[写入]
npc.qing_shu_deputy.relationship_state = "cooperative"

[结束]
END

## I_MAIN_FLOWER_WINE_EXIT_01

类型：interaction
ID：I_MAIN_FLOWER_WINE_EXIT_01
所属：MAIN
拥有者：object.flower_wine_exit
地点：flower_wine_escape_tunnel
available_from：D30_morning
expires_after：D30_evening
priority：100
topic：花酒密道
requires：
- quest.main.stage == "departure_open"
- world.departure_open == true
- player.inventory contains "ITEM_FLOWER_WINE_MAP"
excludes：
- world.village_closed == true
once：false
on_expire：none

[提示]
使用花酒密道离山

[操作 A]
核对地图并打开离山确认

[判定]
none

[事实结果]
“地图与石壁刻痕吻合。密道通向山体南侧，路线只能容纳玩家及随身物品，不提供山外合法身份。”

[写入]
world.flags.departure_confirmation_source = "I_MAIN_FLOWER_WINE_EXIT_01"

[结束]
END

[操作 B]
检查密道是否还能返回

[判定]
none

[事实结果]
“出口段有单向塌落机关。确认离山后，密道与青茅山地图一起永久关闭。”

[写入]
player.knowledge.flower_wine_exit_one_way = true

[结束]
END

[操作 C]
离开出口

[判定]
none

[事实结果]
“没有启动离山确认，当前世界状态不变。”

[写入]
none

[结束]
END

## I_MAIN_EMERGENCY_EXIT_01

类型：interaction
ID：I_MAIN_EMERGENCY_EXIT_01
所属：MAIN
拥有者：object.emergency_exit
地点：north_cliff_emergency_path
available_from：D30_morning
expires_after：D30_evening
priority：100
topic：负伤出山
requires：
- quest.main.stage == "departure_open"
- world.departure_open == true
excludes：
- world.village_closed == true
once：false
on_expire：none

[提示]
从北崖应急山路离开

[操作 A]
选择无身份担保的应急路线并打开确认

[判定]
none

[事实结果]
“路线不要求任何支线物品。系统提示：玩家一定能够离山，但会按负伤、失散物资和无登记流亡者
身份结算具体代价。”

[写入]
world.flags.departure_confirmation_source = "I_MAIN_EMERGENCY_EXIT_01"

[结束]
END

[操作 B]
查看已知限定物缺失清单

[判定]
none

[事实结果]
“系统列出玩家已经发现但尚未取得的限定物名称、最后取得地点与关闭原因；未发现物只显示为
‘仍有未确认的限定资源’。”

[写入]
world.flags.departure_review_requested = true

[结束]
END

[操作 C]
暂不离山

[判定]
none

[事实结果]
“没有启动离山确认。推进超过 D30_evening 时仍会自动结算紧急流亡。”

[写入]
none

[结束]
END

## 系统流程：离山确认

离山确认读取 `world.flags.departure_confirmation_source`，显示不可逆提示和已知限定物缺失清单。
玩家取消时只清空确认来源；玩家确认时执行：

```text
D_MAIN_CLAN_STEWARD_02
-> quest.main.departure_route = "clan"

D_MAIN_CARAVAN_ACCOUNTANT_02
-> quest.main.departure_route = "jia_caravan"

D_MAIN_BLACK_MARKET_BROKER_01
-> quest.main.departure_route = "black_market"

D_MAIN_QING_SHU_DEPUTY_01
-> quest.main.departure_route = "qing_shu_survivors"

I_MAIN_FLOWER_WINE_EXIT_01
-> quest.main.departure_route = "flower_wine"

I_MAIN_EMERGENCY_EXIT_01
-> quest.main.departure_route = "emergency"
```

每一种确认都继续写入：

```text
quest.main.stage = "departed"
world.village_closed = true
world.departure_open = false
```

推进超过 `D30_evening` 且尚未确认时，不播放对话，直接写入：

```text
quest.main.departure_route = "emergency"
quest.main.stage = "departed"
world.village_closed = true
world.departure_open = false
```
