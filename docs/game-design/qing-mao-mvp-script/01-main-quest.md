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
