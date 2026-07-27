# Q03《贾金生遗案》

本文件记录商队接触、路线选择、贾金生事件、现场证据、贾富与铁若男问话，以及合法、黑市、
旁观、失败、拒绝和错过结果。

## D_Q03_JIA_JIN_SHENG_01

类型：dialogue
ID：D_Q03_JIA_JIN_SHENG_01
所属：Q03
拥有者：npc.jia_jin_sheng
地点：caravan_luxury_stall
available_from：D11_noon
expires_after：D13_evening
priority：60
topic：山外生意
requires：
- quest.q03.stage == "unavailable"
- npc.jia_jin_sheng.alive == true
excludes：
- world.village_closed == true
once：true
on_expire：none

[贾金生]
“古月家的新人也来挑货？我这里不只卖蛊。你若想在山外有个能报出来的身份，我可以给你一笔生意；
做成以后，贾家的车和账都会记得你。”

[选择 A]
[玩家]
“先说货物、路线和谁承担损失。身份可以谈，空白委托不接。”

[判定]
none

[贾金生]
“谨慎得像我大哥的账房。货是一只未登记木箱，从营地送到西山交接点；你只负责同行和见证，出了
山寨再告诉你买家。”

[写入]
quest.q03.stage = "contacted"
npc.jia_jin_sheng.met_player = true
npc.jia_jin_sheng.relationship_state = "normal"
player.knowledge.jia_private_offer = true

[结束]
END

[选择 B]
[玩家]
“我只接能入商队正式账的工作。你有合法委托便说，没有我去找账房。”

[判定]
none

[贾金生]
“正式账赚得慢。也罢，你先听完我的价，再去比较。若还选账房，我不拦。”

[写入]
quest.q03.stage = "contacted"
player.knowledge.jia_legal_fallback = true
npc.jia_jin_sheng.met_player = true
npc.jia_jin_sheng.relationship_state = "normal"

[结束]
END

[选择 C]
[玩家]
“我对你的货没兴趣，只想观察商队如何登记山外身份。”

[判定]
none

[贾金生]
“看可以，别站在客人面前挡生意。你若真能从账里看出门道，也算有点用处。”

[写入]
quest.q03.stage = "contacted"
player.knowledge.jia_observer_route = true
npc.jia_jin_sheng.met_player = true
npc.jia_jin_sheng.relationship_state = "normal"

[结束]
END

## D_Q03_CARAVAN_ACCOUNTANT_01

类型：dialogue
ID：D_Q03_CARAVAN_ACCOUNTANT_01
所属：Q03
拥有者：npc.caravan_accountant
地点：caravan_accounting_tent
available_from：D11_noon
expires_after：D14_evening
priority：60
topic：合法替代
requires：
- quest.q03.stage in ["unavailable", "contacted"]
excludes：
- world.village_closed == true
- quest.q03.route != "none"
once：true
on_expire：none

[商队账房]
“贾金生若给你私活，我不替他担保。你要正式记录，可以验三批货、守一夜账箱，或者交二十块押金。
报酬少，出了事却能查到每一笔。”

[选择 A]
[玩家]
“我选验货。给我封条清单和异常处理规则。”

[判定]
none

[商队账房]
“发现未登记货箱不要私开，记下位置、封条和经手人，直接交我。做完三批，你会得到一条合法差役
记录。”

[写入]
quest.q03.stage = "route_selected"
quest.q03.route = "legal"
world.flags.q03_legal_work_unlocked = true
player.knowledge.caravan_seal_rules = true

[结束]
END

[选择 B]
[玩家]
“我只旁观账目和货物流程，不领取报酬，也不替任何一方作口头担保。”

[判定]
none

[商队账房]
“可以。观察者不得碰封条；你看见异常，报或不报都会留下时辰记录。”

[写入]
quest.q03.stage = "route_selected"
quest.q03.route = "observer"
world.flags.q03_observer_access = true

[结束]
END

[选择 C]
[玩家]
“两边的委托我都不接。”

[判定]
none

[商队账房]
“记为拒绝，不记违约。商队离开后，这一批货和身份机会不会为你重开。”

[写入]
quest.q03.stage = "settled"
quest.q03.route = "refused"
quest.q03.result = "refused"

[结束]
END

## D_Q03_JIA_JIN_SHENG_02

类型：dialogue
ID：D_Q03_JIA_JIN_SHENG_02
所属：Q03
拥有者：npc.jia_jin_sheng
地点：caravan_luxury_stall
available_from：D11_noon
expires_after：D13_evening
priority：80
topic：选择路线
requires：
- quest.q03.stage == "contacted"
- quest.q03.route == "none"
- npc.jia_jin_sheng.alive == true
excludes：
- world.village_closed == true
once：true
on_expire：none

[贾金生]
“我把价开明白：私货送到西山，三十块元石；走正式账，只有八块；只跟着看，一块没有。别说我
逼你，三条路都是你自己选。”

[选择 A]
[玩家]
“我走正式账。货物、时辰和经手人全部留记录。”

[判定]
none

[贾金生]
“八块就八块。你去账房领清单，别指望我替你在大哥面前多说好话。”

[写入]
quest.q03.stage = "route_selected"
quest.q03.route = "legal"
world.flags.q03_legal_work_unlocked = true

[结束]
END

[选择 B]
[玩家]
“我接私货，但先检查木箱。箱内若与约定不符，我有权退出。”

[判定]
none

[贾金生]
“看外封可以，不能拆内层。你若把货名说出去，三十块就变成我追你的价。”

[写入]
quest.q03.stage = "route_selected"
quest.q03.route = "black_market"
world.flags.q03_crate_unlocked = true
npc.jia_jin_sheng.transactions.private_crate = true

[结束]
END

[选择 C]
[玩家]
“我只观察，不碰货、不收钱，也不替你证明任何说法。”

[判定]
none

[贾金生]
“旁观最容易装清白。可以，我倒想看看出事时你还会不会说自己什么都没看见。”

[写入]
quest.q03.stage = "route_selected"
quest.q03.route = "observer"
world.flags.q03_observer_access = true

[结束]
END

[选择 D]
[玩家]
“三条路我都不选。你的货和身份条件与我无关。”

[判定]
none

[贾金生]
“行。以后别拿‘当时若是我’来讨价。”

[写入]
quest.q03.stage = "settled"
quest.q03.route = "refused"
quest.q03.result = "refused"

[结束]
END

## I_Q03_UNREGISTERED_CRATE_01

类型：interaction
ID：I_Q03_UNREGISTERED_CRATE_01
所属：Q03
拥有者：object.unregistered_crate
地点：caravan_rear_storage
available_from：D12_morning
expires_after：D14_noon
priority：80
topic：none
requires：
- quest.q03.route == "black_market"
- world.flags.q03_crate_unlocked == true
excludes：
- world.village_closed == true
once：false
on_expire：none

[提示]
检查未登记木箱外封

[操作 A]
记录封条号、重量与夹层痕迹

[判定]
洞察 + 细察入微，对抗难度 57

[成功]
[事实结果]
“外封使用贾家蜡印，编号却不在公开清单。箱底夹层有重新钉合痕迹，重量比申报的酒材多出两成。”

[写入]
quest.q03.evidence_flags += "unregistered_crate"
quest.q03.evidence_flags += "trade_record"
player.knowledge.crate_false_manifest = true

[结束]
END

[失败]
[事实结果]
“只确认箱体没有公开货签。无法证明封条、重量或内容曾被篡改。”

[写入]
quest.q03.evidence_flags += "unregistered_crate"

[结束]
END

[操作 B]
不检查并保持封条完整

[判定]
none

[事实结果]
“木箱没有被玩家开启。现有证据仍只有贾金生的口头委托。”

[写入]
none

[结束]
END

## D_Q03_JIA_JIN_SHENG_03

类型：dialogue
ID：D_Q03_JIA_JIN_SHENG_03
所属：Q03
拥有者：npc.jia_jin_sheng
地点：caravan_rear_storage
available_from：D12_noon
expires_after：D14_noon
priority：80
topic：风险警告
requires：
- quest.q03.stage == "route_selected"
- npc.jia_jin_sheng.alive == true
excludes：
- world.village_closed == true
- world.flags.q03_warning_resolved == true
once：true
on_expire：none

[贾金生]
“你看箱子的时间比搬箱子的时间还长。有什么话现在说，别到了西山才突然反悔。”

[选择 A]
[玩家]
“封条号不在公开清单，箱底也重钉过。继续走这条路，你大哥查账时会先查到你。”

[判定]
none

[贾金生]
“这才算证据。箱子暂不出营，我先换一份清单。你把记录留给我，报酬减半，风险也减半。”

[写入]
world.flags.q03_warning_resolved = true
npc.jia_jin_sheng.known_facts.crate_evidence = true
world.flags.q03_incident_risk_reduced = true

[结束]
END

[选择 B]
[玩家]
“西山路线有伏击风险。守卫没有记录你的出营时辰，我建议改走正式队伍。”

[判定]
交涉 + 已验证证据数量，对抗难度 60

[成功]
[贾金生]
“你不是拿一句晦气话吓我，至少查过守卫记录。改到正式队伍，我少赚一些，总比让别人替我收货
强。”

[写入]
world.flags.q03_warning_resolved = true
world.flags.q03_incident_risk_reduced = true
npc.jia_jin_sheng.relationship_state = "cooperative"

[结束]
END

[失败]
[贾金生]
“‘有风险’谁都会说。没有地点、人数和来源，我不会因为你的预感丢一笔生意。”

[写入]
world.flags.q03_warning_resolved = true
npc.jia_jin_sheng.relationship_state = "normal"

[结束]
END

[选择 C]
[玩家]
“我没有可验证的新证据。按原约定继续。”

[判定]
none

[贾金生]
“那就少说不吉利的话。西山交接，迟到不等。”

[写入]
world.flags.q03_warning_resolved = true

[结束]
END

## D_Q03_CARAVAN_GUARD_01

类型：dialogue
ID：D_Q03_CARAVAN_GUARD_01
所属：Q03
拥有者：npc.caravan_guard
地点：caravan_guard_post
available_from：D12_morning
expires_after：D14_noon
priority：60
topic：路线护卫
requires：
- quest.q03.route in ["legal", "observer"]
excludes：
- world.village_closed == true
- world.flags.q03_guard_preparation_done == true
once：true
on_expire：none

[商队守卫]
“账房说你要跟西山那批货。正式队伍只保登记路线，谁私自偏离，我们不会追。你现在可以领一枚
信号火蛊，回来时必须归还。”

[选择 A]
[玩家]
“我领信号蛊，并把我的路线和预计返回时辰写进守卫簿。”

[判定]
none

[商队守卫]
“记好了。失联超过一个时辰，我们只在登记路线搜一次，不为私货进入岔道。”

[写入]
player.inventory += "ITEM_SIGNAL_FIRE_GU_LOAN"
quest.q03.evidence_flags += "trade_record"
world.flags.q03_guard_preparation_done = true
player.knowledge.registered_mountain_route = true

[结束]
END

[选择 B]
[玩家]
“我不领借用品，只登记旁观身份。”

[判定]
none

[商队守卫]
“可以。没有信号便不要离队。你看见什么是你的事，队伍只按名册清点人数。”

[写入]
world.flags.q03_guard_preparation_done = true
player.knowledge.observer_limit = true

[结束]
END

## I_Q03_MOUNTAIN_ROAD_01

类型：interaction
ID：I_Q03_MOUNTAIN_ROAD_01
所属：Q03
拥有者：object.mountain_road_departure_marker
地点：west_mountain_road
available_from：D13_afternoon
expires_after：D14_noon
priority：80
topic：none
requires：
- quest.q03.stage == "route_selected"
excludes：
- world.village_closed == true
- quest.q03.stage == "incident_pending"
once：true
on_expire：none

[提示]
选择西山行动方式

[操作 A]
跟随正式护卫路线

[判定]
none

[事实结果]
“玩家按守卫簿路线出发。行动模块将读取护卫记录、信号蛊和已提交警告，之后写入贾金生事件状态。”

[写入]
quest.q03.stage = "incident_pending"
world.flags.q03_incident_approach = "guarded"

[结束]
END

[操作 B]
保持距离观察贾金生与木箱

[判定]
none

[事实结果]
“玩家不承担搬运，也不进入交易点。行动模块将读取洞察、隐蔽和已登记旁观身份。”

[写入]
quest.q03.stage = "incident_pending"
world.flags.q03_incident_approach = "observer"

[结束]
END

[操作 C]
沿私货岔道同行

[判定]
none

[事实结果]
“玩家选择未登记岔道。行动模块将读取私货证据、警告结果和个人战斗资源，不在本交互中自动决定
生死。”

[写入]
quest.q03.stage = "incident_pending"
world.flags.q03_incident_approach = "private"

[结束]
END

[操作 D]
放弃出发

[判定]
none

[事实结果]
“玩家没有进入山路。路线按主动退出结算，后续案件仍可能发生，但玩家不再拥有行动见证。”

[写入]
quest.q03.stage = "settled"
quest.q03.result = "refused"

[结束]
END

## 行动模块：贾金生事件

山路玩法完成后必须写入且只写入一种事件状态：

```text
quest.q03.incident =
jia_alive / jia_missing / jia_dead / jia_disgraced
quest.q03.stage = "case_open"
```

证据充分、护卫登记和有效警告提高 `jia_alive` 或 `jia_disgraced` 权重；私路失败提高
`jia_missing` 或 `jia_dead` 权重。任何结果都来自山路行动，不由对话自动杀死或救下贾金生。

## I_Q03_CRIME_SCENE_01

类型：interaction
ID：I_Q03_CRIME_SCENE_01
所属：Q03
拥有者：object.jia_incident_scene
地点：west_mountain_incident_site
available_from：D14_morning
expires_after：D15_evening
priority：80
topic：none
requires：
- quest.q03.stage == "case_open"
- quest.q03.incident in ["jia_missing", "jia_dead", "jia_disgraced"]
excludes：
- world.village_closed == true
once：false
on_expire：none

[提示]
检查贾金生事件地点

[操作 A]
检查木箱、道路与拖拽痕迹

[判定]
洞察 + 细察入微，对抗难度 60

[成功]
[事实结果]
“木箱由内向外破损，岔道上有两组来回足迹，拖拽痕迹却只朝交易点。现场不符合单纯野兽袭击。”

[写入]
quest.q03.evidence_flags += "road_trace"
player.knowledge.scene_not_simple_beast_attack = true

[结束]
END

[失败]
[事实结果]
“确认木箱破损和道路混乱，无法可靠区分护卫、买家与事后搜查者留下的痕迹。”

[写入]
player.knowledge.scene_contaminated = true

[结束]
END

[操作 B]
比对公开货签与残留封蜡

[判定]
none

[事实结果]
“残蜡编号与未登记木箱一致，不在公开清单。它能证明私货存在，不能单独证明谁造成事件。”

[写入]
quest.q03.evidence_flags += "unregistered_crate"
quest.q03.evidence_flags += "trade_record"

[结束]
END

[操作 C]
不接触现场

[判定]
none

[事实结果]
“没有新增证据。现场会在 D15_evening 后由贾家封存。”

[写入]
none

[结束]
END

## D_Q03_WITNESS_01

类型：dialogue
ID：D_Q03_WITNESS_01
所属：Q03
拥有者：npc.mountain_road_witness
地点：south_gate_infirmary
available_from：D14_morning
expires_after：D15_evening
priority：60
topic：山路证言
requires：
- quest.q03.stage == "case_open"
excludes：
- world.village_closed == true
- quest.q03.evidence_flags contains "witness_statement"
once：true
on_expire：none

[山路见证人]
“我只看见贾家二少爷在岔道停过，后来有人抬着破箱回来。别问我凶手，我没看见谁动手。”

[选择 A]
[玩家]
“我不问凶手。你最后见到贾金生的时辰、同行人数和木箱是否完整？”

[判定]
none

[山路见证人]
“未时过半，三个人，箱子外封完整。守卫队到申时才经过。再晚的事我不知道。”

[写入]
quest.q03.evidence_flags += "witness_statement"
player.knowledge.witness_timeline = true
npc.mountain_road_witness.known_facts.statement_given = true

[结束]
END

[选择 B]
[玩家]
“你是否看到玩家离开登记路线？”

[判定]
交涉 + 交涉天赋，对抗难度 55

[成功]
[山路见证人]
“我看到玩家在岔道口停过，但没有看见进入交易点。这句话我愿意当着贾家人再说一次。”

[写入]
quest.q03.evidence_flags += "witness_statement"
player.knowledge.witness_limits_player_presence = true

[结束]
END

[失败]
[山路见证人]
“我不替任何人作保。我只说看见的时辰和人数。”

[写入]
quest.q03.evidence_flags += "witness_statement"

[结束]
END

## D_Q03_JIA_FU_01

类型：dialogue
ID：D_Q03_JIA_FU_01
所属：Q03
拥有者：npc.jia_fu
地点：caravan_accounting_tent
available_from：D14_noon
expires_after：D15_evening
priority：80
topic：首次问话
requires：
- quest.q03.stage == "case_open"
excludes：
- world.village_closed == true
- world.flags.q03_jia_fu_initial_statement == true
once：true
on_expire：none

[贾富]
“我不问你喜不喜欢贾金生。我问账：你何时接触他，拿过多少钱，走哪条路，最后一次见他是什么
状态？按顺序答。”

[选择 A]
[玩家]
“第十一日接触；报酬按 `{q03_route}` 路线约定；第十三日从西山出发；最后见到他的状态是
`{q03_last_seen_fact}`。我愿意提交对应记录。”

[判定]
none

[贾富]
“顺序清楚。把守卫簿、封条或证言中你实际持有的部分交出来。没有的不要补猜。”

[写入]
world.flags.q03_jia_fu_initial_statement = true
npc.jia_fu.known_facts.player_timeline = true

[结束]
END

[选择 B]
[玩家]
“我接触过他，但没有参与未登记交易。我的可验证记录只有 `{q03_available_evidence}`。”

[判定]
none

[贾富]
“我会按证据范围记，不替你扩大，也不替你缩小。若后面查到遗漏，再解释为什么第一次没说。”

[写入]
world.flags.q03_jia_fu_initial_statement = true
quest.q03.evidence_flags += "player_contradiction"
npc.jia_fu.known_facts.player_partial_statement = true

[结束]
END

[选择 C]
[玩家]
“在看见正式指控以前，我拒绝回答与自己无关的问题。”

[判定]
none

[贾富]
“可以拒绝。商队也可以在事实查清以前冻结与你有关的报酬和通行记录。”

[写入]
world.flags.q03_jia_fu_initial_statement = true
world.flags.q03_rewards_frozen = true
npc.jia_fu.relationship_state = "conflict"

[结束]
END

## D_Q03_JIA_FU_02

类型：dialogue
ID：D_Q03_JIA_FU_02
所属：Q03
拥有者：npc.jia_fu
地点：caravan_accounting_tent
available_from：D14_noon
expires_after：D15_evening
priority：80
topic：证据处置
requires：
- world.flags.q03_jia_fu_initial_statement == true
- quest.q03.stage == "case_open"
excludes：
- world.village_closed == true
once：true
on_expire：none

[贾富]
“现在处置证据。你可以完整提交、只提交能证明自己的部分、提出有依据的指向，或者明确拒绝。
每一种都会进账。”

[选择 A]
[玩家]
“我完整提交封条、路线和证言，并标明每项能证明什么、不能证明什么。”

[判定]
none

[贾富]
“这种写法省去许多废话。证据进入贾家账，原件编号给你。只要后续没有矛盾，你的合法报酬照付。”

[写入]
quest.q03.stage = "evidence_disposition"
world.flags.q03_evidence_disposition = "full"
npc.jia_fu.relationship_state = "cooperative"

[结束]
END

[选择 B]
[玩家]
“我提交守卫簿和见证人时辰，私货部分暂不交。”

[判定]
none

[贾富]
“部分提交可以，但我会继续查缺口。你保留的不是不存在，只是暂时不在我桌上。”

[写入]
quest.q03.stage = "evidence_disposition"
world.flags.q03_evidence_disposition = "partial"
quest.q03.evidence_flags += "player_contradiction"

[结束]
END

[选择 C]
[玩家]
“木箱封条和拖痕共同指向预先安排的私货交接。我指认交易接头人，不把推测写成亲眼所见。”

[判定]
洞察 + 有效证据数量，对抗难度 65

[成功]
[贾富]
“指向成立，措辞也没有越过证据。这个人和对应账目由我查，你的口供记为支持性证言。”

[写入]
quest.q03.stage = "evidence_disposition"
world.flags.q03_evidence_disposition = "supported_accusation"
npc.jia_fu.relationship_state = "cooperative"

[结束]
END

[失败]
[贾富]
“证据能证明私货，不能证明你指的那个人在场。你的结论超出事实，记为存疑。”

[写入]
quest.q03.stage = "evidence_disposition"
world.flags.q03_evidence_disposition = "overclaim"
quest.q03.evidence_flags += "player_contradiction"

[结束]
END

[选择 D]
[玩家]
“我拒绝提交，也不接受商队以报酬换口供。”

[判定]
none

[贾富]
“拒绝记录成立。你的路线奖励关闭，案件仍按其他证据继续。”

[写入]
quest.q03.stage = "settled"
quest.q03.result = "failed"
world.flags.q03_rewards_frozen = true

[结束]
END

## D_Q03_TIE_RUO_NAN_01

类型：dialogue
ID：D_Q03_TIE_RUO_NAN_01
所属：Q03
拥有者：npc.tie_ruo_nan
地点：temporary_inquiry_room
available_from：D27_morning
expires_after：D27_evening
priority：80
topic：时间线复核
requires：
- quest.q03.stage == "evidence_disposition"
excludes：
- world.village_closed == true
once：true
on_expire：none

[铁若男]
“我只核对三件事：你的时间线来自哪里，哪一段是亲眼所见，哪一段后来听说。先从最后见到贾金生
的时刻开始。”

[选择 A]
[玩家]
“亲眼所见止于 `{q03_last_seen_fact}`；之后的时辰来自守卫簿；交易点情况来自现场与见证人，
三类来源我分开陈述。”

[判定]
none

[铁若男]
“来源边界清楚。下一步我只查三份记录是否互相冲突，不猜你的动机。”

[写入]
world.flags.q03_tie_timeline_checked = true
npc.tie_ruo_nan.known_facts.player_source_boundaries = true

[结束]
END

[选择 B]
[玩家]
“我不能确认所有时辰。能确认的只有我自己的出发记录和封条号。”

[判定]
none

[铁若男]
“承认不知道比补齐一条漂亮时间线有用。我会把空白留着，再查其他来源。”

[写入]
world.flags.q03_tie_timeline_checked = true
world.flags.q03_timeline_incomplete = true

[结束]
END

[选择 C]
[玩家]
“贾金生一定是被预定的凶手所害，时间线只是手段。”

[判定]
none

[铁若男]
“你先给结论，再让事实服从它。这句话不能作为证据，只会让我重新核对你为何如此确定。”

[写入]
world.flags.q03_tie_timeline_checked = true
quest.q03.evidence_flags += "player_contradiction"

[结束]
END

## D_Q03_TIE_RUO_NAN_02

类型：dialogue
ID：D_Q03_TIE_RUO_NAN_02
所属：Q03
拥有者：npc.tie_ruo_nan
地点：temporary_inquiry_room
available_from：D27_morning
expires_after：D27_evening
priority：80
topic：调查结论
requires：
- world.flags.q03_tie_timeline_checked == true
excludes：
- world.village_closed == true
once：true
on_expire：none

[铁若男]
“复核完了。结论只针对你的陈述与现有证据，不评价你这个人。你要听完整理由，还是只听状态？”

[选择 A]
[玩家]
“说完整理由。”

[判定]
none

[铁若男]
“来源边界、守卫记录和现场能互相印证的部分决定你是清白、存疑或被追查。系统将按实际矛盾数写入
`{q03_investigation_result}`，后续新证据仍可改变案件，不会改变本轮回答。”

[写入]
quest.q03.investigation_result = "{q03_investigation_result}"
quest.q03.stage = "settled"
world.flags.q03_tie_review_complete = true

[结束]
END

[选择 B]
[玩家]
“只告诉我当前状态和离山时会不会被拦。”

[判定]
none

[铁若男]
“当前状态是 `{q03_investigation_result}`。清白不加关卡；存疑需要复核身份；追查会在离山点核对
随身证据。”

[写入]
quest.q03.investigation_result = "{q03_investigation_result}"
quest.q03.stage = "settled"
world.flags.q03_tie_review_complete = true

[结束]
END

## D_Q03_JIA_FU_REWARD_LEGAL_01

类型：dialogue
ID：D_Q03_JIA_FU_REWARD_LEGAL_01
所属：Q03
拥有者：npc.jia_fu
地点：caravan_accounting_tent
available_from：D15_morning
expires_after：D27_evening
priority：70
topic：合法路线奖励
requires：
- quest.q03.route == "legal"
- world.flags.q03_evidence_disposition in ["full", "supported_accusation"]
- item.unique.ITEM_JIA_PASS.owner == "npc.jia_fu"
excludes：
- world.village_closed == true
once：true
on_expire：none

[贾富]
“你的记录替商队省下了查错账的时间。报酬之外，我给你一枚贾家通行商令。它保合法商路，不保你
永远不被问话。”

[选择 A]
[玩家]
“我接受商令，并确认黑市奖励同时关闭。”

[判定]
none

[贾富]
“对。合法身份与黑市名册互斥。你拿了这枚令，贾家账上便把你列入公开往来。”

[写入]
player.inventory += "ITEM_JIA_PASS"
item.unique.ITEM_JIA_PASS.owner = "player"
item.unique.GU_SLEEVE_POUCH.owner = "missed_permanently"
item.unique.ITEM_BLACK_LEDGER.owner = "missed_permanently"
quest.q03.result = "legal"
npc.jia_fu.transactions.legal_reward = true

[结束]
END

[选择 B]
[玩家]
“我不要商令，只结算元石报酬。”

[判定]
none

[贾富]
“可以。二十块元石，身份路线不保留，黑市奖励也不会因此自动开放。”

[写入]
player.resources.primeval_stones += 20
item.unique.ITEM_JIA_PASS.owner = "missed_permanently"
quest.q03.result = "legal"

[结束]
END

## D_Q03_BLACK_MARKET_BROKER_REWARD_01

类型：dialogue
ID：D_Q03_BLACK_MARKET_BROKER_REWARD_01
所属：Q03
拥有者：npc.black_market_broker
地点：dry_well_passage
available_from：D15_morning
expires_after：D27_evening
priority：70
topic：黑市路线奖励
requires：
- quest.q03.route == "black_market"
- world.flags.q03_evidence_disposition in ["partial", "overclaim"]
- item.unique.ITEM_BLACK_LEDGER.owner == "npc.black_market_broker"
excludes：
- world.village_closed == true
once：true
on_expire：none

[黑市掮客]
“你没把整条私货线交给贾家，名单上的人愿意认这份情。袖囊蛊和一册暗名录，换你今后替名录做
一趟货。拿了就没有贾家商令。”

[选择 A]
[玩家]
“我接受袖囊蛊和暗名录，也接受一次明确记账的运货债。”

[判定]
none

[黑市掮客]
“债写在暗页第一行。你可以拒绝未来的货，但拒绝便失去这条路的接应。”

[写入]
player.inventory += "GU_SLEEVE_POUCH"
player.inventory += "ITEM_BLACK_LEDGER"
item.unique.GU_SLEEVE_POUCH.owner = "player"
item.unique.ITEM_BLACK_LEDGER.owner = "player"
item.unique.ITEM_JIA_PASS.owner = "missed_permanently"
quest.q03.result = "black_market"
world.flags.black_market_delivery_debt = true

[结束]
END

[选择 B]
[玩家]
“我不要名录，只收袖囊蛊，之后互不欠账。”

[判定]
交涉 + 市井通达，对抗难度 62

[成功]
[黑市掮客]
“可以。没有暗名录，你只得到藏物能力，不得到山外接应。”

[写入]
player.inventory += "GU_SLEEVE_POUCH"
item.unique.GU_SLEEVE_POUCH.owner = "player"
item.unique.ITEM_BLACK_LEDGER.owner = "missed_permanently"
item.unique.ITEM_JIA_PASS.owner = "missed_permanently"
quest.q03.result = "black_market"

[结束]
END

[失败]
[黑市掮客]
“两件是一份价。你不接债，便都不拿。”

[写入]
item.unique.GU_SLEEVE_POUCH.owner = "missed_permanently"
item.unique.ITEM_BLACK_LEDGER.owner = "missed_permanently"
quest.q03.result = "failed"

[结束]
END

## D_Q03_JIA_FU_FAILED_01

类型：dialogue
ID：D_Q03_JIA_FU_FAILED_01
所属：Q03
拥有者：npc.jia_fu
地点：caravan_accounting_tent
available_from：D15_morning
expires_after：D30_evening
priority：70
topic：案件失败
requires：
- quest.q03.result == "failed"
excludes：
- world.village_closed == true
once：true
on_expire：none

[贾富]
“证据没有形成可用结论，或者你拒绝了必要核对。报酬和路线奖励关闭，案件本身仍留在账上。”

[选择 A]
[玩家]
“我接受本轮失败，不要求用推测换奖励。”

[判定]
none

[贾富]
“那便到此为止。以后有新证据，是新调查，不补发这次奖励。”

[写入]
world.flags.q03_failure_acknowledged = true

[结束]
END

[选择 B]
[玩家]
“保留我的原始陈述副本。”

[判定]
none

[贾富]
“可以。副本只证明你当时说过什么，不证明内容为真。”

[写入]
player.inventory += "ITEM_Q03_STATEMENT_COPY"

[结束]
END

## D_Q03_JIA_FU_REFUSED_01

类型：dialogue
ID：D_Q03_JIA_FU_REFUSED_01
所属：Q03
拥有者：npc.jia_fu
地点：caravan_accounting_tent
available_from：D11_morning
expires_after：D30_evening
priority：70
topic：拒绝商队任务
requires：
- quest.q03.result == "refused"
excludes：
- world.village_closed == true
once：true
on_expire：none

[贾富]
“你没有接贾家的任务，也没有违约。案件若与你无关，不会强行把你写成参与者；对应通行与黑市
奖励同样不存在。”

[选择 A]
[玩家]
“确认。我只保留普通商队交易资格。”

[判定]
none

[贾富]
“普通买卖照旧，任务账关闭。”

[写入]
world.flags.q03_refusal_acknowledged = true

[结束]
END

[选择 B]
[玩家]
“我后来取得了案件证据，能否单独提交？”

[判定]
none

[贾富]
“可以提交线索，不能把拒绝过的任务倒签成完成。线索另记功绩。”

[写入]
player.knowledge.q03_post_refusal_tip_allowed = true

[结束]
END

## D_Q03_JIA_FU_MISSED_01

类型：dialogue
ID：D_Q03_JIA_FU_MISSED_01
所属：Q03
拥有者：npc.jia_fu
地点：caravan_accounting_tent
available_from：D16_morning
expires_after：D30_evening
priority：70
topic：错过初查
requires：
- quest.q03.result == "missed"
excludes：
- world.village_closed == true
once：true
on_expire：none

[贾富]
“初查在第十五日晚封账。你没有提交路线、证据或拒绝声明，故按错过处理。第二十七日的调查只查
案件后果，不重开这一批奖励。”

[选择 A]
[玩家]
“把封账时辰记给我。”

[判定]
none

[贾富]
“第十五日日落。时辰可以记，商令不能补。”

[写入]
player.knowledge.q03_initial_deadline = true

[结束]
END

[选择 B]
[玩家]
“明白，按永久错过结算。”

[判定]
none

[贾富]
“账已经锁定。”

[写入]
world.flags.q03_miss_acknowledged = true

[结束]
END

## 系统到期结算

```text
D15_evening:
quest.q03.stage in ["unavailable", "contacted", "route_selected", "incident_pending", "case_open"]
and quest.q03.result == "none"
-> quest.q03.stage = "missed"
-> quest.q03.result = "missed"

D27_evening:
quest.q03.stage == "evidence_disposition"
-> 根据来源边界与 player_contradiction 数量写入
   quest.q03.investigation_result = cleared / doubtful / pursuit
-> quest.q03.stage = "settled"
```

合法奖励与黑市奖励互斥。一方写入玩家所有权时，另一方全部写入 `missed_permanently`。
