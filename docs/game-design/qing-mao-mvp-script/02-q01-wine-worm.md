# Q01《月下酒虫》

本文件记录酒肆线索、独立调查、酒虫归属、炼化与四类结算。方源分支只在他成为普通物品持有人时
出现，不是成功、Q02 入口或主线的必要条件。

## D_Q01_TAVERN_KEEPER_01

类型：dialogue
ID：D_Q01_TAVERN_KEEPER_01
所属：Q01
拥有者：npc.tavern_keeper
地点：tavern
available_from：D05_afternoon
expires_after：D10_evening
priority：60
topic：后院异香
requires：
- quest.q01.stage == "unavailable"
excludes：
- world.village_closed == true
once：true
on_expire：
- quest.q01.stage = "missed_tavern_window"
- quest.q01.result = "missed"
- item.unique.GU_WINE_WORM.owner = "missed_permanently"

[酒肆掌柜]
“你若只是喝酒，前堂有座。若是来问后院那股甜香，我先把话说明：两坛青竹酒整夜少了半坛，
封泥没破，伙计也没偷。谁能找出原因，我免他十壶酒钱。”

[选择 A]
[玩家]
“封泥没破却少酒，问题多半不在人。我替你查，但后院酒坛和进货账要让我看。”

[判定]
none

[酒肆掌柜]
“账只能在我面前看，后院也不能乱翻。你先说得出哪一坛最不对，我再给钥匙。”

[写入]
quest.q01.stage = "smell_found"
npc.tavern_keeper.met_player = true
npc.tavern_keeper.relationship_state = "normal"
player.knowledge.tavern_wine_loss = true

[结束]
END

[选择 B]
[玩家]
“我先买一碗最接近那股甜香的酒。闻得出差别，再谈查后院。”

[判定]
none

[酒肆掌柜]
“一块碎元石。甜香最重的是靠西墙那坛，但那坛偏偏封得最好。你喝慢些，别把线索当酒量。”

[写入]
quest.q01.stage = "smell_found"
player.resources.primeval_stones -= 1
player.knowledge.west_wall_wine_scent = true
npc.tavern_keeper.met_player = true
npc.tavern_keeper.relationship_state = "normal"

[结束]
END

[选择 C]
[玩家]
“这事我不接。酒少了，找伙计和守夜人比找我合适。”

[判定]
none

[酒肆掌柜]
“不接便不接。我可先提醒你，异香只留到换新酒那天，过后谁再来问，我也不会重开后院。”

[写入]
quest.q01.stage = "completed"
quest.q01.result = "refused"
npc.tavern_keeper.met_player = true
npc.tavern_keeper.relationship_state = "normal"

[结束]
END

## D_Q01_TAVERN_KEEPER_02

类型：dialogue
ID：D_Q01_TAVERN_KEEPER_02
所属：Q01
拥有者：npc.tavern_keeper
地点：tavern
available_from：D05_afternoon
expires_after：D08_evening
priority：60
topic：后院许可
requires：
- quest.q01.stage == "smell_found"
excludes：
- world.village_closed == true
once：false
on_expire：none

[酒肆掌柜]
“又是你。后院两坛酒我还没挪，先告诉我：你查的是坏酒、偷酒的人，还是别的东西？”

[选择 A]
[玩家]
“酒没有坏。甜香在封泥完整时移动，像有活物沿着酒气找路。”

[判定]
none

[酒肆掌柜]
“蛊虫？我这店赔不起一场乱斗。你可以进去，看和闻都行，不准当场放月刃，也不准把整坛酒搬走。”

[写入]
quest.q01.stage = "back_room_open"
player.inventory += "ITEM_TAVERN_BACK_ROOM_KEY"
npc.tavern_keeper.known_facts.wine_worm_suspected = true

[结束]
END

[选择 B]
[玩家]
“我还不能确定。让我检查封泥和坛底，查完只把能验证的结果告诉你。”

[判定]
none

[酒肆掌柜]
“这话比拍胸口可信。钥匙拿去，一个时段内还我。你若弄坏酒坛，按整坛市价赔。”

[写入]
quest.q01.stage = "back_room_open"
player.inventory += "ITEM_TAVERN_BACK_ROOM_KEY"
npc.tavern_keeper.relationship_state = "cooperative"

[结束]
END

[选择 C]
[玩家]
“我暂时不查。你先别换酒，也别清西墙的酒渍。”

[判定]
none

[酒肆掌柜]
“我最多留到第八日晚。做生意不能为了你的猜测一直空着后院。”

[写入]
player.knowledge.tavern_back_room_deadline = true

[结束]
END

## I_Q01_BACK_ROOM_JAR_01

类型：interaction
ID：I_Q01_BACK_ROOM_JAR_01
所属：Q01
拥有者：object.back_room_jar
地点：tavern_back_room
available_from：D05_afternoon
expires_after：D08_evening
priority：60
topic：none
requires：
- quest.q01.stage == "back_room_open"
- player.inventory contains "ITEM_TAVERN_BACK_ROOM_KEY"
excludes：
- world.village_closed == true
once：false
on_expire：none

[提示]
检查后院异香酒坛

[操作 A]
辨认酒香移动方向

[判定]
none

[事实结果]
“封泥完整。甜香从坛内渗出，却没有向上散开，而是贴着西墙地缝缓慢向后院竹篱移动。”

[写入]
quest.q01.stage = "trail_found"
player.knowledge.wine_scent_moves = true

[结束]
END

[操作 B]
检查封泥、坛底和地面酒渍

[判定]
洞察 + 细察入微，对抗难度 48

[成功]
[事实结果]
“坛底没有裂口。地面酒渍中有数个米粒大小的圆形压痕，间距一致，不是鼠爪或鞋印。”

[写入]
quest.q01.stage = "trail_found"
player.knowledge.wine_worm_trace = true

[结束]
END

[失败]
[事实结果]
“确认封泥和坛底完整，但杂乱脚印遮住了更小的痕迹。没有得到可用于辨认生物的结果。”

[写入]
quest.q01.stage = "trail_found"
player.knowledge.jar_seal_intact = true

[结束]
END

[操作 C]
不进行检查

[判定]
none

[事实结果]
“酒坛与钥匙状态不变。”

[写入]
none

[结束]
END

## I_Q01_WINE_SCENT_TRAIL_01

类型：interaction
ID：I_Q01_WINE_SCENT_TRAIL_01
所属：Q01
拥有者：object.wine_scent_trail
地点：tavern_bamboo_fence
available_from：D05_evening
expires_after：D09_evening
priority：60
topic：none
requires：
- quest.q01.stage == "trail_found"
excludes：
- world.village_closed == true
- player.knowledge.wine_worm_hideout == true
once：false
on_expire：none

[提示]
追查贴地移动的酒香

[操作 A]
沿地缝与竹根逐段辨味

[判定]
洞察 + 贪杯修正，对抗难度 52

[成功]
[事实结果]
“普通青竹酒的辛气停在篱笆边，独有的甜香继续通向西南侧空心竹根。根内有微弱活物气息。”

[写入]
player.knowledge.wine_worm_hideout = true
world.flags.wine_worm_interaction_unlocked = true

[结束]
END

[失败]
[事实结果]
“雨水和厨房气味混在一起，只能确认甜香离开酒肆，无法锁定是哪一段竹根。”

[写入]
player.knowledge.wine_scent_left_tavern = true

[结束]
END

[操作 B]
撒少量青竹酒观察气味变化

[判定]
none

[事实结果]
“新酒气在西南侧空心竹根前消失得最快。该位置可以投放酒饵或直接检查。”

[写入]
player.resources.primeval_stones -= 1
player.knowledge.wine_worm_hideout = true
world.flags.wine_worm_interaction_unlocked = true

[结束]
END

[操作 C]
停止追查

[判定]
none

[事实结果]
“没有消耗资源，也没有取得新的位置情报。”

[写入]
none

[结束]
END

## D_Q01_HELPER_01

类型：dialogue
ID：D_Q01_HELPER_01
所属：Q01
拥有者：npc.tavern_helper
地点：tavern_side_door
available_from：D06_morning
expires_after：D09_evening
priority：60
topic：酒饵
requires：
- quest.q01.stage == "trail_found"
- player.knowledge.wine_worm_hideout == true
excludes：
- world.village_closed == true
- player.inventory contains "ITEM_WINE_BAIT"
once：true
on_expire：none

[酒肆伙计]
“你在找竹根里那东西吧？我昨夜看见一团白影钻进去。掌柜不许我碰，但我能给你一小壶剩酒，
条件是别说我偷看过后院。”

[选择 A]
[玩家]
“酒我收下。只要你说的是亲眼所见，我不会把你的名字写进掌柜的损失账。”

[判定]
none

[酒肆伙计]
“亲眼看见，月光下像一只白蚕，闻到酒便不动。小壶够引它一次，洒错地方就没了。”

[写入]
player.inventory += "ITEM_WINE_BAIT"
player.knowledge.wine_worm_shape = true
npc.tavern_helper.relationship_state = "cooperative"

[结束]
END

[选择 B]
[玩家]
“我不替你保密。你可以把这件事自己告诉掌柜，酒也不用给我。”

[判定]
none

[酒肆伙计]
“那便算了。我只想少挨一顿骂，不想为了半壶酒再欠你一件事。”

[写入]
npc.tavern_helper.relationship_state = "normal"

[结束]
END

## I_Q01_WINE_WORM_01

类型：interaction
ID：I_Q01_WINE_WORM_01
所属：Q01
拥有者：object.wine_worm_hideout
地点：tavern_bamboo_fence
available_from：D06_evening
expires_after：D10_evening
priority：80
topic：none
requires：
- quest.q01.stage in ["trail_found", "worm_found"]
- player.knowledge.wine_worm_hideout == true
excludes：
- world.village_closed == true
- item.unique.GU_WINE_WORM.owner != "object.wine_worm_hideout"
once：false
on_expire：none

[提示]
处理空心竹根中的野生酒虫

[操作 A]
使用酒饵诱出并以真元包裹

[判定]
心性 + 洞察 + 真元亲和，对抗难度 60

[成功]
[事实结果]
“酒虫离开竹根后停在酒饵旁，真元在它退回藏处前完成第一层包裹。玩家取得未完全炼化的酒虫。”

[写入]
player.inventory -= "ITEM_WINE_BAIT"
player.inventory += "GU_WINE_WORM"
item.unique.GU_WINE_WORM.owner = "player"
quest.q01.stage = "refining"

[结束]
END

[失败]
[事实结果]
“真元收束过早，酒虫挣脱后被另一名循着酒香赶来的普通学员截住。玩家没有取得蛊虫。”

[写入]
player.inventory -= "ITEM_WINE_BAIT"
item.unique.GU_WINE_WORM.owner = "npc.fang_yuan"
quest.q01.stage = "worm_found"
player.knowledge.fang_yuan_has_wine_worm = true

[结束]
END

[操作 B]
不使用酒饵，直接封住竹根两端

[判定]
身法 + 洞察，对抗难度 72

[成功]
[事实结果]
“酒虫被迫从侧孔钻出，玩家在它接触地面前以真元压住。玩家取得未完全炼化的酒虫。”

[写入]
player.inventory += "GU_WINE_WORM"
item.unique.GU_WINE_WORM.owner = "player"
quest.q01.stage = "refining"

[结束]
END

[失败]
[事实结果]
“竹根侧孔比预想更多。酒虫脱离可见范围，当晚被另一名酒肆客人发现并带走。”

[写入]
item.unique.GU_WINE_WORM.owner = "npc.ordinary_wine_worm_holder"
quest.q01.stage = "lost"
quest.q01.result = "other_acquired"

[结束]
END

[操作 C]
只确认蛊虫存在并报告族库

[判定]
none

[事实结果]
“位置和活物气息得到确认。族库保管员可在酒肆后院处理归属，玩家尚未触碰蛊虫。”

[写入]
quest.q01.stage = "worm_found"
world.flags.q01_clan_reported = true

[结束]
END

## I_Q01_DORM_REFINING_01

类型：interaction
ID：I_Q01_DORM_REFINING_01
所属：Q01
拥有者：object.dorm_refining_station
地点：academy_dorm
available_from：D06_evening
expires_after：D10_evening
priority：80
topic：none
requires：
- quest.q01.stage == "refining"
- item.unique.GU_WINE_WORM.owner == "player"
excludes：
- world.village_closed == true
once：false
on_expire：none

[提示]
炼化酒虫

[操作 A]
以青竹酒安抚后持续炼化

[判定]
心性 + 资质修正 + 真元亲和，对抗难度 66

[成功]
[事实结果]
“酒虫接受玩家真元，炼化完成。它可以在一转阶段提高真元质量，但需要持续供应酒类食物。”

[写入]
quest.q01.stage = "completed"
quest.q01.result = "player_acquired"
world.flags.wine_worm_refined = true
player.knowledge.wine_worm_feeding = true

[结束]
END

[失败]
[事实结果]
“炼化推进后又被酒虫顶回。蛊虫仍由玩家控制，本次青竹酒和一个时段已经消耗，可以再次尝试。”

[写入]
player.resources.primeval_stones -= 1
world.flags.wine_worm_refining_failed = true

[结束]
END

[操作 B]
暂不炼化

[判定]
none

[事实结果]
“酒虫所有权不变。超过 D10_evening 仍未炼化时，任务按未稳定取得结算。”

[写入]
none

[结束]
END

## D_Q01_CLAN_STOREKEEPER_01

类型：dialogue
ID：D_Q01_CLAN_STOREKEEPER_01
所属：Q01
拥有者：npc.clan_storekeeper
地点：tavern_bamboo_fence
available_from：D06_morning
expires_after：D10_evening
priority：80
topic：酒虫归属
requires：
- quest.q01.stage == "worm_found"
- world.flags.q01_clan_reported == true
- item.unique.GU_WINE_WORM.owner == "object.wine_worm_hideout"
excludes：
- world.village_closed == true
once：true
on_expire：none

[族库保管员]
“位置是你报的，酒虫却生在酒肆地界。按族规，野蛊先归族库鉴定；你可以领发现功绩，也可以撤回
报告，自己承担捕捉风险。”

[选择 A]
[玩家]
“交族库。请把发现人、地点和功绩写进正式账，不接受口头记功。”

[判定]
none

[族库保管员]
“可以。账上记你三点功绩和一次野蛊发现。酒虫由族库收走，你以后可以凭功绩申请，但它不会为你
保留。”

[写入]
item.unique.GU_WINE_WORM.owner = "clan"
quest.q01.stage = "completed"
quest.q01.result = "clan_custody"
player.resources.clan_merit += 3
npc.clan_storekeeper.transactions.wine_worm = true

[结束]
END

[选择 B]
[玩家]
“我撤回报告，自己捕捉。若失败或伤人，由我承担。”

[判定]
none

[族库保管员]
“我会在账上写‘报告人自行处理’，不是从未报告。你今日仍可动手，族库不再派人。”

[写入]
world.flags.q01_clan_reported = false
quest.q01.stage = "trail_found"

[结束]
END

## D_Q01_FANG_YUAN_01

类型：dialogue
ID：D_Q01_FANG_YUAN_01
所属：Q01
拥有者：npc.fang_yuan
地点：academy_dorm_lane
available_from：D06_evening
expires_after：D10_evening
priority：60
topic：酒虫交易
requires：
- item.unique.GU_WINE_WORM.owner == "npc.fang_yuan"
- player.knowledge.fang_yuan_has_wine_worm == true
excludes：
- world.village_closed == true
once：true
on_expire：none

[方源]
“你找的是酒虫。如今它在我手里。若要买，就说你拿什么换；若只想问我怎么找到的，这句话没有
价钱。”

[选择 A]
[玩家]
“二十块元石，换未炼化的酒虫。钱和蛊当面交清，之后互不追索。”

[判定]
none

[方源]
“二十块够我换别的蛊材。成交。它还没有认主，你今日之内炼化，省得再被别人截走。”

[写入]
player.resources.primeval_stones -= 20
player.inventory += "GU_WINE_WORM"
item.unique.GU_WINE_WORM.owner = "player"
quest.q01.stage = "refining"
npc.fang_yuan.transactions.wine_worm = true

[结束]
END

[选择 B]
[玩家]
“我用酒虫的稳定喂养来源换价。酒肆每次换坛都会留下底酒，你拿不到那条供给。”

[判定]
交涉 + 市井通达，对抗难度 65

[成功]
[方源]
“供给能省长期成本。十块元石，加上你把取底酒的时间和规矩写清楚。”

[写入]
player.resources.primeval_stones -= 10
player.inventory += "GU_WINE_WORM"
item.unique.GU_WINE_WORM.owner = "player"
quest.q01.stage = "refining"
player.knowledge.wine_dregs_trade_disclosed = true
npc.fang_yuan.transactions.wine_worm = true

[结束]
END

[失败]
[方源]
“酒肆的底酒谁都能买，你没有独占。二十块，或者到此为止。”

[写入]
quest.q01.stage = "lost"
quest.q01.result = "other_acquired"
npc.fang_yuan.transactions.wine_worm = false

[结束]
END

[选择 C]
[玩家]
“既然归属已经变了，我退出。这件事到此为止。”

[判定]
none

[方源]
“好。你追到这里的线索归你，蛊归我。”

[写入]
quest.q01.stage = "lost"
quest.q01.result = "other_acquired"

[结束]
END

## D_Q01_TAVERN_KEEPER_RESULT_PLAYER_01

类型：dialogue
ID：D_Q01_TAVERN_KEEPER_RESULT_PLAYER_01
所属：Q01
拥有者：npc.tavern_keeper
地点：tavern
available_from：D06_morning
expires_after：D30_evening
priority：70
topic：酒虫结算
requires：
- quest.q01.result == "player_acquired"
excludes：
- world.village_closed == true
once：true
on_expire：none

[酒肆掌柜]
“后院昨夜一滴酒都没少。看来东西真让你拿住了。按约定，十壶酒钱免掉；往后你喂蛊要买酒，
照常付账。”

[选择 A]
[玩家]
“可以。把免单折成十次取酒记录，我每次只领一壶。”

[判定]
none

[酒肆掌柜]
“这样最好，账清楚，也省得你一次搬走喝坏。伙计会在木牌上逐次划掉。”

[写入]
player.inventory += "ITEM_TEN_WINE_CREDITS"
npc.tavern_keeper.relationship_state = "cooperative"
npc.tavern_keeper.known_facts.player_has_wine_worm = true

[结束]
END

[选择 B]
[玩家]
“奖励我不要。只请你保留普通底酒给我，按市价结算。”

[判定]
none

[酒肆掌柜]
“行。你不欠我，我也不白送。每次换坛前来取，过时便倒进酒糟。”

[写入]
world.flags.wine_dregs_supply = true
npc.tavern_keeper.relationship_state = "cooperative"
npc.tavern_keeper.known_facts.player_has_wine_worm = true

[结束]
END

## D_Q01_TAVERN_KEEPER_RESULT_OTHER_01

类型：dialogue
ID：D_Q01_TAVERN_KEEPER_RESULT_OTHER_01
所属：Q01
拥有者：npc.tavern_keeper
地点：tavern
available_from：D06_morning
expires_after：D30_evening
priority：70
topic：酒虫结算
requires：
- quest.q01.result in ["clan_custody", "other_acquired"]
excludes：
- world.village_closed == true
once：true
on_expire：none

[酒肆掌柜]
“东西不在你手里，但后院的麻烦停了。是族库拿走，还是别人先到，我不追问。你至少让我知道酒
不是伙计偷的。”

[选择 A]
[玩家]
“线索查清了，归属没拿到。免酒的约定不必算给我。”

[判定]
none

[酒肆掌柜]
“一码归一码。你查清原因，我免你两壶，不是十壶。生意不能全靠人情，也不能装作你没做事。”

[写入]
player.inventory += "ITEM_TWO_WINE_CREDITS"
npc.tavern_keeper.relationship_state = "normal"

[结束]
END

[选择 B]
[玩家]
“若以后再有同样的异香，先别让任何人动，给我留句话。”

[判定]
none

[酒肆掌柜]
“可以，但我只留一个时段。你来不来，是你的事。”

[写入]
npc.tavern_keeper.known_facts.player_tracks_wine_gu = true

[结束]
END

## D_Q01_TAVERN_KEEPER_RESULT_REFUSED_01

类型：dialogue
ID：D_Q01_TAVERN_KEEPER_RESULT_REFUSED_01
所属：Q01
拥有者：npc.tavern_keeper
地点：tavern
available_from：D05_afternoon
expires_after：D30_evening
priority：70
topic：拒绝调查
requires：
- quest.q01.result == "refused"
excludes：
- world.village_closed == true
once：true
on_expire：none

[酒肆掌柜]
“你上次说不接，我记得。后来谁拿到好处、谁赔了酒，都与你无关；来喝酒我照常卖。”

[选择 A]
[玩家]
“明白。我不再问后院的事。”

[判定]
none

[酒肆掌柜]
“那就坐前堂。青竹酒一块碎元石，先付后喝。”

[写入]
npc.tavern_keeper.relationship_state = "normal"

[结束]
END

[选择 B]
[玩家]
“我改变主意了。现在还能查么？”

[判定]
none

[酒肆掌柜]
“不能。你拒绝后我已经另找了人。任务可以拒绝，机会不会为了反悔停着。”

[写入]
player.knowledge.q01_refusal_permanent = true

[结束]
END

## D_Q01_TAVERN_KEEPER_RESULT_MISSED_01

类型：dialogue
ID：D_Q01_TAVERN_KEEPER_RESULT_MISSED_01
所属：Q01
拥有者：npc.tavern_keeper
地点：tavern
available_from：D11_morning
expires_after：D30_evening
priority：70
topic：错过异香
requires：
- quest.q01.result == "missed"
excludes：
- world.village_closed == true
once：true
on_expire：none

[酒肆掌柜]
“旧酒已经换完，西墙也重新铺了泥。那股甜香没留下，后来有人说在寨外见过白影。现在再查，
也不是当初那只酒虫了。”

[选择 A]
[玩家]
“把最后见到异香的时辰告诉我。我只记档，不再追这只蛊。”

[判定]
none

[酒肆掌柜]
“第十日傍晚，日落前两刻。记可以，别拿这条旧账来要求我重开后院。”

[写入]
player.knowledge.wine_worm_last_seen = true
item.unique.GU_WINE_WORM.owner = "missed_permanently"

[结束]
END

[选择 B]
[玩家]
“不用说了。是我错过了窗口。”

[判定]
none

[酒肆掌柜]
“知道便好。青茅山的货和人都不会一直等。”

[写入]
item.unique.GU_WINE_WORM.owner = "missed_permanently"

[结束]
END

## 系统到期结算

`D10_evening` 推进结束时：

```text
quest.q01.result == "none"
-> quest.q01.stage = "missed_tavern_window"
-> quest.q01.result = "missed"
-> item.unique.GU_WINE_WORM.owner = "missed_permanently"
```

已经写入 `player_acquired`、`clan_custody`、`other_acquired` 或 `refused` 的存档不再改写。
