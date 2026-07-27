# Q02《花酒遗藏》

本文件记录酒气、档案和野外三种独立入口，以及影壁、三层石室、奖励深度、归属选择和坍塌结算。

## D_Q02_ACADEMY_ELDER_01

类型：dialogue
ID：D_Q02_ACADEMY_ELDER_01
所属：Q02
拥有者：npc.academy_elder
地点：academy_archive_desk
available_from：D16_morning
expires_after：D22_evening
priority：60
topic：旧封山记录
requires：
- quest.q02.stage == "unavailable"
excludes：
- world.village_closed == true
once：true
on_expire：none

[学堂家老]
“你已经能接独立调查。档案房有一份旧封山记录：西南石缝每隔数年出现酒气，却从未找到酒窖。
查明入口，奖励按普通地形任务算；发现族产，必须申报归属。”

[选择 A]
[玩家]
“我接。先看原始记录、历次测绘和封山人的签名，不要只给我后来人的结论。”

[判定]
none

[学堂家老]
“查阅签给你。原件不能带走，可以抄录。影壁、蛊虫和遗物若涉及族史，先记录再决定是否移动。”

[写入]
quest.q02.stage = "entry_rumored"
world.flags.q02_archive_unlocked = true
player.inventory += "ITEM_Q02_ARCHIVE_SLIP"
player.knowledge.q02_archive_route = true

[结束]
END

[选择 B]
[玩家]
“我不接这项调查。封山旧案由家族另派人处理。”

[判定]
none

[学堂家老]
“可以。拒绝没有惩罚，但这份查阅签不会长期留给你。之后若从别处找到入口，你仍可自行决定是否
探索。”

[写入]
quest.q02.stage = "collapsed"
quest.q02.result = "refused"
player.knowledge.q02_archive_declined = true

[结束]
END

## I_Q02_CLAN_ARCHIVE_01

类型：interaction
ID：I_Q02_CLAN_ARCHIVE_01
所属：Q02
拥有者：object.clan_archive_shelf
地点：clan_archive
available_from：D16_morning
expires_after：D22_evening
priority：60
topic：none
requires：
- quest.q02.stage == "entry_rumored"
- world.flags.q02_archive_unlocked == true
excludes：
- world.village_closed == true
once：true
on_expire：none

[提示]
查阅西南旧封山记录

[操作 A]
对照三次测绘中的缺口

[判定]
洞察 + 细察入微，对抗难度 55

[成功]
[事实结果]
“三份地图都故意省略同一段山壁。旧测绘旁的酒渍标记指向一处受潮后才显形的裂缝。”

[写入]
quest.q02.stage = "entry_known"
quest.q02.entry_source = "archive"
player.knowledge.flower_wine_entry = true
player.knowledge.archive_omission = true

[结束]
END

[失败]
[事实结果]
“确认测绘年代与封山记录不一致，但无法仅凭档案定位裂缝。野外西南坡调查仍可继续。”

[写入]
quest.q02.stage = "entry_rumored"
player.knowledge.southwest_slope_suspected = true

[结束]
END

[操作 B]
抄录封山人的最后一条备注

[判定]
none

[事实结果]
“备注写着：‘酒香不随风，只随潮气出入。’西南潮湿山壁被标为下一调查地点。”

[写入]
quest.q02.stage = "entry_known"
quest.q02.entry_source = "archive"
player.knowledge.flower_wine_entry = true

[结束]
END

## I_Q02_WINE_TRAIL_ENTRY_01

类型：interaction
ID：I_Q02_WINE_TRAIL_ENTRY_01
所属：Q02
拥有者：object.wine_trail_entry
地点：southwest_mountain_wall
available_from：D08_morning
expires_after：D25_evening
priority：60
topic：none
requires：
- player.knowledge.wine_scent_moves == true
- quest.q02.stage in ["unavailable", "entry_rumored"]
excludes：
- world.village_closed == true
once：true
on_expire：none

[提示]
比较酒虫残留酒气与山壁潮气

[操作 A]
沿相同甜香检查潮湿裂缝

[判定]
none

[事实结果]
“山壁裂缝中的甜香与酒肆异香同源，却更陈旧。潮气退去时，裂缝后露出人工修整的石缘。”

[写入]
quest.q02.stage = "entry_known"
quest.q02.entry_source = "wine_trail"
player.knowledge.flower_wine_entry = true

[结束]
END

[操作 B]
只记录气味，不打开裂缝

[判定]
none

[事实结果]
“入口位置已经记录。玩家可在 D25_evening 前再次返回，不会因离开本次交互而自动坍塌。”

[写入]
quest.q02.stage = "entry_known"
quest.q02.entry_source = "wine_trail"
player.knowledge.flower_wine_entry = true

[结束]
END

## I_Q02_MOUNTAIN_CRACK_01

类型：interaction
ID：I_Q02_MOUNTAIN_CRACK_01
所属：Q02
拥有者：object.mountain_crack
地点：southwest_slope
available_from：D17_morning
expires_after：D25_evening
priority：60
topic：none
requires：
- quest.main.stage in ["route_preparing", "wolf_crisis"]
- quest.q02.stage in ["unavailable", "entry_rumored"]
excludes：
- world.village_closed == true
once：false
on_expire：none

[提示]
调查西南坡异常山缝

[操作 A]
检查石缝边缘与潮气

[判定]
洞察 + 细察入微，对抗难度 64

[成功]
[事实结果]
“苔藓下存在旧凿痕，石缝内壁有干涸酒垢。裂缝是人工入口，不是自然断层。”

[写入]
quest.q02.stage = "entry_known"
quest.q02.entry_source = "field"
player.knowledge.flower_wine_entry = true

[结束]
END

[失败]
[事实结果]
“只确认此处潮气异常。没有找到足以安全开启的人工结构，本次仍可离开后重新调查。”

[写入]
player.knowledge.southwest_humidity = true

[结束]
END

[操作 B]
用一块元石照亮深处

[判定]
none

[事实结果]
“元石光照出一道向内收窄的石门边线，边线上刻有酒杯与月影符号。”

[写入]
player.resources.primeval_stones -= 1
quest.q02.stage = "entry_known"
quest.q02.entry_source = "field"
player.knowledge.flower_wine_entry = true

[结束]
END

## I_Q02_SHADOW_WALL_01

类型：interaction
ID：I_Q02_SHADOW_WALL_01
所属：Q02
拥有者：object.flower_wine_shadow_wall
地点：flower_wine_entrance
available_from：D08_morning
expires_after：D25_evening
priority：80
topic：none
requires：
- quest.q02.stage == "entry_known"
- player.knowledge.flower_wine_entry == true
excludes：
- world.village_closed == true
once：false
on_expire：none

[提示]
处理花酒行者影壁

[操作 A]
完整记录人物、族徽和留言

[判定]
洞察 + 心性，对抗难度 58

[成功]
[事实结果]
“记录包含花酒行者与古月先人的冲突、入口机关顺序及一段未收入族史的交易。内容足以作为正式
谈判证据。”

[写入]
quest.q02.stage = "shadow_wall"
player.inventory += "ITEM_CLAN_HISTORY_RECORD"
item.unique.ITEM_CLAN_HISTORY_RECORD.owner = "player"
player.knowledge.shadow_wall_mechanism = true
player.knowledge.hidden_clan_history = true
world.flags.q02_chambers_unlocked = true

[结束]
END

[失败]
[事实结果]
“只记录到机关顺序，人物与族徽部分因影像衰减无法形成可验证证据。”

[写入]
quest.q02.stage = "shadow_wall"
player.knowledge.shadow_wall_mechanism = true
world.flags.q02_chambers_unlocked = true

[结束]
END

[操作 B]
只记录机关，不复制族史

[判定]
none

[事实结果]
“取得开启第一层石室所需的月影、酒杯、石花顺序。族史影像仍留在原处。”

[写入]
quest.q02.stage = "shadow_wall"
player.knowledge.shadow_wall_mechanism = true
world.flags.q02_chambers_unlocked = true

[结束]
END

[操作 C]
破坏影壁以隐藏入口

[判定]
体魄 + 月光蛊熟练，对抗难度 65

[成功]
[事实结果]
“影壁记录被破坏，机关仍可使用一次。家族无法从原物复核历史，入口稳定性开始下降。”

[写入]
quest.q02.stage = "shadow_wall"
player.knowledge.shadow_wall_mechanism = true
world.flags.q02_chambers_unlocked = true
world.flags.q02_shadow_wall_damaged = true

[结束]
END

[失败]
[事实结果]
“破坏触发了封闭机关。影壁与第一层石门同时锁死，未取得的遗藏永久关闭。”

[写入]
quest.q02.stage = "collapsed"
quest.q02.result = "failed"
world.flags.q02_shadow_wall_damaged = true

[结束]
END

[操作 D]
保持原状并离开

[判定]
none

[事实结果]
“影壁和入口未改变。玩家可以在截止前再次返回。”

[写入]
none

[结束]
END

## D_Q02_CLAN_STEWARD_CLAIM_01

类型：dialogue
ID：D_Q02_CLAN_STEWARD_CLAIM_01
所属：Q02
拥有者：npc.clan_steward
地点：clan_affairs_hall
available_from：D16_morning
expires_after：D25_evening
priority：60
topic：遗藏归属
requires：
- quest.q02.stage == "shadow_wall"
- player.knowledge.hidden_clan_history == true
excludes：
- world.village_closed == true
- quest.q02.claim != "none"
once：true
on_expire：none

[族务执事]
“记录若能复核，遗藏至少有一部分属于族史和族产。你是发现人，可以申请先取一件；若完全隐瞒，
以后被发现便按私吞处理。”

[选择 A]
[玩家]
“我提交记录副本，接受发现人先取一件，其余由族中登记。”

[判定]
none

[族务执事]
“按共有处理。你先取的核心蛊归个人，后续物品要登记。族中也会派人记录入口，不抢你的首次
探索时段。”

[写入]
quest.q02.claim = "shared"
quest.q02.stage = "chambers_open"
world.flags.q02_reward_share = "one_player_then_clan"
npc.clan_steward.known_facts.flower_wine_inheritance = true

[结束]
END

[选择 B]
[玩家]
“入口和风险由我发现、承担。我保留个人主张，暂不提交记录。”

[判定]
交涉 + 市井通达，对抗难度 68

[成功]
[族务执事]
“可以暂缓到截止日，但你必须登记入口存在。你取得的蛊先记个人所有，族史记录不得毁掉。”

[写入]
quest.q02.claim = "player"
quest.q02.stage = "chambers_open"
world.flags.q02_personal_claim_registered = true

[结束]
END

[失败]
[族务执事]
“入口在古月山寨地界，族史又涉及先人。你可以先取一件，不能主张全部。按共有登记。”

[写入]
quest.q02.claim = "shared"
quest.q02.stage = "chambers_open"
world.flags.q02_reward_share = "one_player_then_clan"

[结束]
END

## D_Q02_QING_SHU_CLAIM_01

类型：dialogue
ID：D_Q02_QING_SHU_CLAIM_01
所属：Q02
拥有者：npc.qing_shu
地点：east_wall_rest_point
available_from：D18_morning
expires_after：D25_evening
priority：60
topic：安全探索
requires：
- quest.q02.stage == "shadow_wall"
- quest.q02.claim == "none"
excludes：
- world.village_closed == true
- npc.qing_shu.alive == false
once：true
on_expire：none

[古月青书]
“你问遗藏归属以前，先说入口能不能撤。石室里的东西不是凭空等人拿，封闭机关一旦失控，谁负责
把同行者带出来？”

[选择 A]
[玩家]
“我只带自己进入，先取一层并保留撤退资源。发现物按个人主张登记。”

[判定]
none

[古月青书]
“独自进去可以少牵连人，但没人替你报失联。留下路线和截止时辰，我替你登记个人探索。”

[写入]
quest.q02.claim = "player"
quest.q02.stage = "chambers_open"
world.flags.q02_retreat_deadline_registered = true
npc.qing_shu.relationship_state = "cooperative"

[结束]
END

[选择 B]
[玩家]
“我接受家族共有，条件是先确认撤退机关，再谈取物。”

[判定]
none

[古月青书]
“这才是顺序。我会给你两枚撤退标记，第一枚放入口，第二枚放你决定继续深入的位置。”

[写入]
quest.q02.claim = "shared"
quest.q02.stage = "chambers_open"
player.inventory += "ITEM_RETREAT_MARKER_2"
world.flags.q02_safe_retreat = true
npc.qing_shu.relationship_state = "cooperative"

[结束]
END

## D_Q02_FANG_YUAN_CLAIM_01

类型：dialogue
ID：D_Q02_FANG_YUAN_CLAIM_01
所属：Q02
拥有者：npc.fang_yuan
地点：southwest_slope
available_from：D16_evening
expires_after：D25_evening
priority：60
topic：入口分配
requires：
- quest.q02.stage == "shadow_wall"
- quest.q02.claim == "none"
- npc.fang_yuan.known_facts.flower_wine_entry == true
excludes：
- world.village_closed == true
once：true
on_expire：none

[方源]
“入口只有一条，里面的东西未必够两个人分。你先说想拿哪一层，省得进去以后才争。”

[选择 A]
[玩家]
“第一件核心蛊归我，后续各凭自己打开的机关。谁先退出，不能封死另一个人的路。”

[判定]
none

[方源]
“可以。第一件你拿，之后不互相担保，也不替对方承担机关成本。”

[写入]
quest.q02.claim = "player"
quest.q02.stage = "chambers_open"
npc.fang_yuan.transactions.flower_wine_partition = true

[结束]
END

[选择 B]
[玩家]
“我不与你共同探索。入口信息到此为止。”

[判定]
none

[方源]
“那便各走各的。你没有义务告诉我机关，我也不会替你留里面的东西。”

[写入]
quest.q02.claim = "player"
quest.q02.stage = "chambers_open"
npc.fang_yuan.relationship_state = "normal"

[结束]
END

## I_Q02_EARTH_FLOWER_01

类型：interaction
ID：I_Q02_EARTH_FLOWER_01
所属：Q02
拥有者：object.earth_treasury_flower
地点：flower_wine_first_chamber
available_from：D08_morning
expires_after：D25_evening
priority：80
topic：none
requires：
- quest.q02.stage in ["shadow_wall", "chambers_open"]
- world.flags.q02_chambers_unlocked == true
excludes：
- world.village_closed == true
- world.flags.q02_first_chamber_open == true
once：false
on_expire：none

[提示]
开启地藏花石门

[操作 A]
按影壁顺序投入三块元石

[判定]
none

[事实结果]
“月影、酒杯、石花三处机关依次响应，第一层石室稳定开启。投入的元石无法取回。”

[写入]
player.resources.primeval_stones -= 3
quest.q02.stage = "chambers_open"
world.flags.q02_first_chamber_open = true

[结束]
END

[操作 B]
强行推动石门

[判定]
体魄 + 筋骨坚韧，对抗难度 72

[成功]
[事实结果]
“石门被推开到足以通行，机关没有完全复位。入口可用，但深层稳定性降低。”

[写入]
quest.q02.stage = "chambers_open"
world.flags.q02_first_chamber_open = true
world.flags.q02_forced_entry = true

[结束]
END

[失败]
[事实结果]
“石门没有开启，反震造成轻伤。入口仍可按正确顺序重新处理。”

[写入]
world.flags.player_minor_injury = true

[结束]
END

## I_Q02_WHITE_BOAR_TRAINING_01

类型：interaction
ID：I_Q02_WHITE_BOAR_TRAINING_01
所属：Q02
拥有者：object.white_boar_pedestal
地点：flower_wine_first_chamber
available_from：D08_morning
expires_after：D25_evening
priority：80
topic：none
requires：
- world.flags.q02_first_chamber_open == true
- item.unique.GU_WHITE_BOAR.owner == "object.white_boar_pedestal"
excludes：
- world.village_closed == true
once：true
on_expire：none

[提示]
处理第一层白豕蛊与训练碑

[操作 A]
完成碑上基础体魄循环并收取白豕蛊

[判定]
体魄 + 筋骨坚韧，对抗难度 56

[成功]
[事实结果]
“训练循环完成，白豕蛊解除石座束缚。玩家取得第一层核心蛊，并保留继续深入的体力。”

[写入]
player.inventory += "GU_WHITE_BOAR"
item.unique.GU_WHITE_BOAR.owner = "player"
quest.q02.depth = 1
world.flags.q02_strength_gate_unlocked = true

[结束]
END

[失败]
[事实结果]
“训练循环勉强完成，玩家取得白豕蛊，但需要额外休整才能挑战第二层机关。”

[写入]
player.inventory += "GU_WHITE_BOAR"
item.unique.GU_WHITE_BOAR.owner = "player"
quest.q02.depth = 1
world.flags.q02_strength_gate_unlocked = true
world.flags.q02_deep_cost += 1

[结束]
END

[操作 B]
收取白豕蛊并结束本次探索

[判定]
none

[事实结果]
“玩家取得第一层核心蛊，封存继续深入的机关位置并准备结算。”

[写入]
player.inventory += "GU_WHITE_BOAR"
item.unique.GU_WHITE_BOAR.owner = "player"
quest.q02.depth = 1
quest.q02.stage = "settling"

[结束]
END

## I_Q02_STRENGTH_GATE_01

类型：interaction
ID：I_Q02_STRENGTH_GATE_01
所属：Q02
拥有者：object.strength_gate
地点：flower_wine_second_gate
available_from：D08_morning
expires_after：D25_evening
priority：80
topic：none
requires：
- quest.q02.depth == 1
- world.flags.q02_strength_gate_unlocked == true
excludes：
- world.village_closed == true
- world.flags.q02_second_chamber_open == true
once：false
on_expire：none

[提示]
开启第二层力门

[操作 A]
使用白豕蛊增幅后推动

[判定]
体魄 + 白豕蛊熟练，对抗难度 62

[成功]
[事实结果]
“力门完成一次完整行程，第二层石室开启。白豕蛊消耗真元但没有受损。”

[写入]
world.flags.q02_second_chamber_open = true

[结束]
END

[失败]
[事实结果]
“力门只移动一半便回落。玩家可以补充真元后重试，也可以结束在深度一。”

[写入]
world.flags.q02_deep_cost += 1

[结束]
END

[操作 B]
结束探索并保留第一层所得

[判定]
none

[事实结果]
“第二层保持关闭。玩家以深度一进入结算。”

[写入]
quest.q02.stage = "settling"

[结束]
END

## I_Q02_JADE_CHAMBER_01

类型：interaction
ID：I_Q02_JADE_CHAMBER_01
所属：Q02
拥有者：object.jade_skin_pedestal
地点：flower_wine_second_chamber
available_from：D08_morning
expires_after：D25_evening
priority：80
topic：none
requires：
- world.flags.q02_second_chamber_open == true
- item.unique.GU_JADE_SKIN.owner == "object.jade_skin_pedestal"
excludes：
- world.village_closed == true
once：true
on_expire：none

[提示]
处理第二层玉皮蛊

[操作 A]
解除石座真元锁并继续寻找暗层

[判定]
心性 + 资质修正，对抗难度 60

[成功]
[事实结果]
“真元锁解除，玩家取得玉皮蛊，并发现石座背后的隐蔽导流槽。”

[写入]
player.inventory += "GU_JADE_SKIN"
item.unique.GU_JADE_SKIN.owner = "player"
quest.q02.depth = 2
world.flags.q02_hidden_chamber_hint = true

[结束]
END

[失败]
[事实结果]
“真元锁被耗尽后解除。玩家取得玉皮蛊，但额外消耗使深层探索成本增加。”

[写入]
player.inventory += "GU_JADE_SKIN"
item.unique.GU_JADE_SKIN.owner = "player"
quest.q02.depth = 2
world.flags.q02_hidden_chamber_hint = true
world.flags.q02_deep_cost += 1

[结束]
END

[操作 B]
收取玉皮蛊并结束探索

[判定]
none

[事实结果]
“玩家取得第二件核心蛊，以深度二进入结算。”

[写入]
player.inventory += "GU_JADE_SKIN"
item.unique.GU_JADE_SKIN.owner = "player"
quest.q02.depth = 2
quest.q02.stage = "settling"

[结束]
END

## I_Q02_HIDDEN_CHAMBER_01

类型：interaction
ID：I_Q02_HIDDEN_CHAMBER_01
所属：Q02
拥有者：object.hidden_chamber_lock
地点：flower_wine_second_chamber
available_from：D08_morning
expires_after：D25_evening
priority：80
topic：none
requires：
- quest.q02.depth == 2
- world.flags.q02_hidden_chamber_hint == true
excludes：
- world.village_closed == true
- world.flags.q02_hidden_chamber_open == true
once：false
on_expire：none

[提示]
开启导流槽后的隐藏石室

[操作 A]
消耗五块元石稳定导流槽

[判定]
洞察 + 心性 + 细察入微，对抗难度 70

[成功]
[事实结果]
“导流槽稳定反转，隐藏石门完整开启。第三层物品与密道图仍可取得。”

[写入]
player.resources.primeval_stones -= 5
world.flags.q02_hidden_chamber_open = true
world.flags.q02_deep_cost += 2

[结束]
END

[失败]
[事实结果]
“导流槽只稳定了短暂时间，隐藏石门卡在半开位置。可以再投入资源强行固定，但坍塌风险提高。”

[写入]
player.resources.primeval_stones -= 5
world.flags.q02_deep_cost += 2
world.flags.q02_collapse_risk = true

[结束]
END

[操作 B]
放弃第三层并按深度二结算

[判定]
none

[事实结果]
“隐藏石室保持关闭，玩家保留前两层所得。”

[写入]
quest.q02.stage = "settling"

[结束]
END

## I_Q02_SECRET_MAP_01

类型：interaction
ID：I_Q02_SECRET_MAP_01
所属：Q02
拥有者：object.secret_map_pedestal
地点：flower_wine_hidden_chamber
available_from：D08_morning
expires_after：D25_evening
priority：80
topic：none
requires：
- world.flags.q02_hidden_chamber_open == true
- item.unique.GU_HIDDEN_STONE.owner == "object.secret_map_pedestal"
excludes：
- world.village_closed == true
once：true
on_expire：none

[提示]
收取第三层隐石蛊与花酒密道图

[操作 A]
分别登记蛊虫与地图后收取

[判定]
none

[事实结果]
“玩家取得隐石蛊和完整密道图。地图标明一条单向南侧出口，可在第 30 日作为离山路线。”

[写入]
player.inventory += "GU_HIDDEN_STONE"
player.inventory += "ITEM_FLOWER_WINE_MAP"
item.unique.GU_HIDDEN_STONE.owner = "player"
item.unique.ITEM_FLOWER_WINE_MAP.owner = "player"
quest.q02.depth = 3
quest.q02.stage = "settling"

[结束]
END

[操作 B]
只取密道图，保留蛊虫原位

[判定]
none

[事实结果]
“玩家取得完整密道图，隐石蛊仍留在即将关闭的第三层石座。”

[写入]
player.inventory += "ITEM_FLOWER_WINE_MAP"
item.unique.ITEM_FLOWER_WINE_MAP.owner = "player"
item.unique.GU_HIDDEN_STONE.owner = "missed_permanently"
quest.q02.depth = 3
quest.q02.stage = "settling"

[结束]
END

## D_Q02_CLAN_STEWARD_SETTLEMENT_01

类型：dialogue
ID：D_Q02_CLAN_STEWARD_SETTLEMENT_01
所属：Q02
拥有者：npc.clan_steward
地点：clan_affairs_hall
available_from：D16_morning
expires_after：D25_evening
priority：80
topic：遗藏结算
requires：
- quest.q02.stage == "settling"
- quest.q02.claim in ["clan", "shared"]
excludes：
- world.village_closed == true
once：true
on_expire：none

[族务执事]
“你的探索深度是 `{q02_depth}`。按登记，第一件个人所得不追缴；共有部分要留下清单。族中只收
尚未明确归你的物品，不会凭一句‘族产’复制已经唯一归属的蛊虫。”

[选择 A]
[玩家]
“按共有登记结算。我的个人所得保留，其余资料交族中封存。”

[判定]
none

[族务执事]
“清单核对无误。发现功绩入账，入口在今夜后封闭。以后若要查族史，用你的记录编号申请。”

[写入]
quest.q02.stage = "completed"
quest.q02.result = "completed"
player.resources.clan_merit += 8
npc.clan_steward.known_facts.q02_settled = true

[结束]
END

[选择 B]
[玩家]
“我撤回共有主张，未交付物仍归我，并接受较低功绩。”

[判定]
交涉 + 市井通达，对抗难度 72

[成功]
[族务执事]
“可以，前提是入口和族史副本留下。功绩减半，个人物品不追缴。”

[写入]
quest.q02.claim = "player"
quest.q02.stage = "completed"
quest.q02.result = "completed"
player.resources.clan_merit += 4

[结束]
END

[失败]
[族务执事]
“共有登记已经生效，不能在取完东西后单方面撤回。按原清单结算。”

[写入]
quest.q02.stage = "completed"
quest.q02.result = "completed"
player.resources.clan_merit += 8

[结束]
END

## D_Q02_ACADEMY_ELDER_RESULT_01

类型：dialogue
ID：D_Q02_ACADEMY_ELDER_RESULT_01
所属：Q02
拥有者：npc.academy_elder
地点：academy_hall
available_from：D16_morning
expires_after：D30_evening
priority：70
topic：遗藏完成
requires：
- quest.q02.stage == "settling"
- quest.q02.claim == "player"
excludes：
- world.village_closed == true
once：true
on_expire：none

[学堂家老]
“深度 `{q02_depth}` 已登记。你保留合法取得的个人蛊虫；是否公开族史记录，会影响族中怎么看你的
来源，不改写蛊虫已经发生的唯一归属。”

[选择 A]
[玩家]
“我提交族史副本，保留原件和个人所得。”

[判定]
none

[学堂家老]
“副本入档，原件编号归你。今后有人质疑入口来源，你有可核验的记录。”

[写入]
quest.q02.stage = "completed"
quest.q02.result = "completed"
world.flags.clan_history_copy_submitted = true
player.resources.clan_merit += 4

[结束]
END

[选择 B]
[玩家]
“我只报告探索深度，不提交未要求公开的历史内容。”

[判定]
none

[学堂家老]
“可以。族中只记录你有未公开资料；若以后用它谈条件，别人也会追问来源。”

[写入]
quest.q02.stage = "completed"
quest.q02.result = "completed"
world.flags.clan_history_withheld = true

[结束]
END

## D_Q02_ACADEMY_ELDER_FAILED_01

类型：dialogue
ID：D_Q02_ACADEMY_ELDER_FAILED_01
所属：Q02
拥有者：npc.academy_elder
地点：academy_hall
available_from：D16_morning
expires_after：D30_evening
priority：70
topic：遗藏失败
requires：
- quest.q02.result in ["failed", "collapsed"]
excludes：
- world.village_closed == true
once：true
on_expire：none

[学堂家老]
“入口已经封死。你取得的已归属物仍保留，没拿出的东西按永久失落登记。族里不会为了补一份奖励
重开坍塌山体。”

[选择 A]
[玩家]
“把坍塌原因写进档案，避免下一次调查重复同样的处理。”

[判定]
none

[学堂家老]
“会写。若是强行破坏造成，也会连同责任一起写。”

[写入]
player.knowledge.q02_failure_archived = true

[结束]
END

[选择 B]
[玩家]
“明白。未取得物按永久错过结算。”

[判定]
none

[学堂家老]
“结算已经锁定。”

[写入]
world.flags.q02_failure_acknowledged = true

[结束]
END

## D_Q02_ACADEMY_ELDER_REFUSED_01

类型：dialogue
ID：D_Q02_ACADEMY_ELDER_REFUSED_01
所属：Q02
拥有者：npc.academy_elder
地点：academy_hall
available_from：D16_morning
expires_after：D30_evening
priority：70
topic：拒绝旧案
requires：
- quest.q02.result == "refused"
excludes：
- world.village_closed == true
once：true
on_expire：none

[学堂家老]
“你拒绝了档案调查，查阅签已经收回。若你从野外自行发现入口，那是另一条来源；档案任务本身不再
重开。”

[选择 A]
[玩家]
“我确认拒绝，不再申请这份档案。”

[判定]
none

[学堂家老]
“记下了。没有惩罚，也没有发现功绩。”

[写入]
world.flags.q02_refusal_acknowledged = true

[结束]
END

[选择 B]
[玩家]
“我会自行调查西南坡，不使用族中档案。”

[判定]
none

[学堂家老]
“可以。你自己发现什么，便用自己的证据说话。”

[写入]
quest.q02.stage = "unavailable"
quest.q02.result = "none"
player.knowledge.q02_field_route_only = true

[结束]
END

## D_Q02_ACADEMY_ELDER_MISSED_01

类型：dialogue
ID：D_Q02_ACADEMY_ELDER_MISSED_01
所属：Q02
拥有者：npc.academy_elder
地点：academy_hall
available_from：D26_morning
expires_after：D30_evening
priority：70
topic：错过遗藏
requires：
- quest.q02.result == "missed"
excludes：
- world.village_closed == true
once：true
on_expire：none

[学堂家老]
“西南入口昨夜塌了。没有人登记进入，也没有物品完成归属。地图上会保留‘已错过遗藏’，
不会再显示可进入地点。”

[选择 A]
[玩家]
“把入口最后稳定时辰告诉我，我只做记录。”

[判定]
none

[学堂家老]
“第二十五日傍晚。之后山体受狼潮震动闭合，重开成本超过遗藏价值。”

[写入]
player.knowledge.q02_last_window = true

[结束]
END

[选择 B]
[玩家]
“不用补救。按永久错过结算。”

[判定]
none

[学堂家老]
“已经锁定。”

[写入]
world.flags.q02_miss_acknowledged = true

[结束]
END

## 系统到期结算

`D25_evening` 推进结束时：

```text
quest.q02.stage == "unavailable"
-> quest.q02.stage = "collapsed"
-> quest.q02.result = "missed"

quest.q02.stage in ["entry_rumored", "entry_known", "shadow_wall", "chambers_open", "settling"]
and quest.q02.result == "none"
-> quest.q02.stage = "collapsed"
-> quest.q02.result = "collapsed"
```

所有仍以 `object.*` 为持有人的 Q02 限定物写入 `missed_permanently`。已经归玩家、家族或其他 NPC
所有的物品不被复制或追溯改写。
