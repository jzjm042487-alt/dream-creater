# Q05《青书的死局》

本文件记录青书或副手招募、危险证据、撤退准备、最终行动意图、救援操作契约和青书命运结算。

## D_Q05_QING_SHU_01

类型：dialogue
ID：D_Q05_QING_SHU_01
所属：Q05
拥有者：npc.qing_shu
地点：east_wall_muster
available_from：D20_morning
expires_after：D22_evening
priority：60
topic：外勤侦察
requires：
- quest.q05.stage == "unavailable"
- npc.qing_shu.alive == true
excludes：
- world.village_closed == true
once：true
on_expire：none

[古月青书]
“北坡狼群换了路线，两支侦察队的记录对不上。我缺的不是一个会说‘有危险’的人，是能把路线、
时辰和撤退点带回来的人。你接不接？”

[选择 A]
[玩家]
“接。我先查狼路和幸存者，再回报可核验的两类证据。”

[判定]
none

[古月青书]
“好。北坡石桥和旧猎棚各是一条线。不要为了证明自己深入狼巢；看见退路消失，先回来。”

[写入]
quest.q05.stage = "evidence_gathering"
world.flags.q05_recruiter = "qing_shu"
player.knowledge.q05_wolf_route_site = true
player.knowledge.q05_survivor_location = true
npc.qing_shu.met_player = true
npc.qing_shu.relationship_state = "normal"

[结束]
END

[选择 B]
[玩家]
“我只负责证据，不保证加入最终战斗。谁接到报告，谁决定是否改队伍。”

[判定]
none

[古月青书]
“可以。侦察和出战是两次决定。你把证据交到我或副手手里，之后仍能退出。”

[写入]
quest.q05.stage = "evidence_gathering"
world.flags.q05_recruiter = "qing_shu"
world.flags.q05_no_combat_commitment = true
player.knowledge.q05_wolf_route_site = true
npc.qing_shu.met_player = true
npc.qing_shu.relationship_state = "normal"

[结束]
END

[选择 C]
[玩家]
“我不接这次侦察。”

[判定]
none

[古月青书]
“知道了。副手仍会收任何偶然发现的证据，但不会把你列入准备名单。”

[写入]
quest.q05.stage = "recruited"
world.flags.q05_recruitment_declined = true
npc.qing_shu.met_player = true
npc.qing_shu.relationship_state = "normal"

[结束]
END

## D_Q05_QING_SHU_DEPUTY_01

类型：dialogue
ID：D_Q05_QING_SHU_DEPUTY_01
所属：Q05
拥有者：npc.qing_shu_deputy
地点：east_wall_muster
available_from：D20_morning
expires_after：D23_evening
priority：60
topic：替代招募
requires：
- quest.q05.stage in ["unavailable", "recruited"]
- world.flags.q05_recruiter != "qing_shu"
excludes：
- world.village_closed == true
once：true
on_expire：none

[青书副手]
“青书在外勤，任务由我代发。北坡狼路异常，旧猎棚还有一名伤员。你可以查路线、问伤员，或者
只把已经发现的东西交上来。”

[选择 A]
[玩家]
“把地点和回报标准给我。我交事实，不交预言。”

[判定]
none

[青书副手]
“石桥脚印、狼群转向、伤员口供都算；至少两类来源，才值得我们改任务。”

[写入]
quest.q05.stage = "evidence_gathering"
world.flags.q05_recruiter = "qing_shu_deputy"
player.knowledge.q05_wolf_route_site = true
player.knowledge.q05_survivor_location = true
npc.qing_shu_deputy.met_player = true

[结束]
END

[选择 B]
[玩家]
“我不正式接任务，但会提交途中看到的证据。”

[判定]
none

[青书副手]
“可以。没有任务报酬，证据有效便记普通功绩。”

[写入]
quest.q05.stage = "evidence_gathering"
world.flags.q05_recruiter = "qing_shu_deputy"
world.flags.q05_informal_investigation = true

[结束]
END

## I_Q05_WOLF_ROUTE_01

类型：interaction
ID：I_Q05_WOLF_ROUTE_01
所属：Q05
拥有者：object.north_slope_wolf_route
地点：north_slope_stone_bridge
available_from：D20_morning
expires_after：D24_evening
priority：60
topic：none
requires：
- quest.q05.stage == "evidence_gathering"
- player.knowledge.q05_wolf_route_site == true
excludes：
- world.village_closed == true
- quest.q05.evidence_flags contains "wolf_route"
once：false
on_expire：none

[提示]
调查北坡石桥的狼群路线

[操作 A]
测量脚印数量、方向与新旧层次

[判定]
洞察 + 细察入微，对抗难度 60

[成功]
[事实结果]
“新脚印覆盖旧撤退线，数量超过普通狼群三倍；其中一支故意绕开石桥，指向旧猎棚后方。”

[写入]
quest.q05.evidence_flags += "wolf_route"
world.flags.q05_evidence_family_wolf = true
player.knowledge.wolf_route_flanks_hunter_hut = true

[结束]
END

[失败]
[事实结果]
“确认狼群数量增加并改变方向，但无法从混乱足迹中判断是否形成包抄。”

[写入]
quest.q05.evidence_flags += "wolf_route"
world.flags.q05_evidence_family_wolf = true

[结束]
END

[操作 B]
记录安全撤离线而不继续深入

[判定]
none

[事实结果]
“石桥东侧浅沟可避开狼群主线，能够作为撤退标记候选；没有取得猎棚后的深层路线。”

[写入]
quest.q05.evidence_flags += "wolf_route"
world.flags.q05_evidence_family_wolf = true
player.knowledge.q05_retreat_gully = true

[结束]
END

## D_Q05_SCOUT_SURVIVOR_01

类型：dialogue
ID：D_Q05_SCOUT_SURVIVOR_01
所属：Q05
拥有者：npc.scout_survivor
地点：old_hunter_hut
available_from：D20_noon
expires_after：D24_evening
priority：60
topic：侦察口供
requires：
- quest.q05.stage == "evidence_gathering"
- player.knowledge.q05_survivor_location == true
excludes：
- world.village_closed == true
- quest.q05.evidence_flags contains "survivor_report"
once：true
on_expire：none

[侦察幸存者]
“我们按旧路线撤，狼群却从后面合上来。领头的不是电狼，像有人先把它们逼向石桥。我只看见一道
白光，之后队伍就散了。”

[选择 A]
[玩家]
“白光出现的方向、距离和时辰？没看清的人不要替他补。”

[判定]
none

[侦察幸存者]
“西北岩脊，约两百步，未时前。白光之后岩面结霜，狼群才改向。其余我不能确定。”

[写入]
quest.q05.evidence_flags += "survivor_report"
world.flags.q05_evidence_family_wolf = true
player.knowledge.survivor_white_light_timeline = true
npc.scout_survivor.known_facts.statement_given = true

[结束]
END

[选择 B]
[玩家]
“先说撤退失败的具体位置。白光另找痕迹核对。”

[判定]
none

[侦察幸存者]
“第二块界碑后，旧路被狼群横断。若有人在那里提前放标记，队伍本来能转浅沟。”

[写入]
quest.q05.evidence_flags += "survivor_report"
world.flags.q05_evidence_family_wolf = true
player.knowledge.q05_marker_site = true

[结束]
END

## I_Q05_ICE_TRACE_01

类型：interaction
ID：I_Q05_ICE_TRACE_01
所属：Q05
拥有者：object.ice_trace
地点：northwest_rock_ridge
available_from：D21_morning
expires_after：D24_evening
priority：60
topic：none
requires：
- quest.q05.stage == "evidence_gathering"
excludes：
- world.village_closed == true
- quest.q05.evidence_flags contains "ice_trace"
once：false
on_expire：none

[提示]
检查西北岩脊的冰道痕迹

[操作 A]
比对霜痕方向、蛊力残留与狼群足迹

[判定]
洞察 + 细察入微，对抗难度 64

[成功]
[事实结果]
“冰道由岩脊向下贯穿狼群侧翼，时间与幸存者口供吻合。它不是针对侦察队，却迫使狼群改道包抄。”

[写入]
quest.q05.evidence_flags += "ice_trace"
world.flags.q05_evidence_family_ice = true
player.knowledge.ice_attack_redirected_wolves = true

[结束]
END

[失败]
[事实结果]
“确认这里发生过高强度冰道攻击，无法仅凭残留判断攻击目标或与狼群改道的先后。”

[写入]
quest.q05.evidence_flags += "ice_trace"
world.flags.q05_evidence_family_ice = true

[结束]
END

[操作 B]
只记录安全距离内的残留

[判定]
none

[事实结果]
“取得独立于狼路和口供的第二类证据：岩脊存在新鲜冰道蛊力残留。”

[写入]
quest.q05.evidence_flags += "ice_trace"
world.flags.q05_evidence_family_ice = true

[结束]
END

## D_Q05_BAI_NING_BING_01

类型：dialogue
ID：D_Q05_BAI_NING_BING_01
所属：Q05
拥有者：npc.bai_ning_bing
地点：northwest_rock_ridge
available_from：D21_evening
expires_after：D24_evening
priority：60
topic：冰道交锋
requires：
- quest.q05.stage == "evidence_gathering"
- quest.q05.evidence_flags contains "ice_trace"
- npc.bai_ning_bing.met_player == true
excludes：
- world.village_closed == true
- quest.q05.evidence_flags contains "battle_observation"
once：true
on_expire：none

[白凝冰]
“你在量冰痕，是想知道谁出的手，还是想知道下一次会死多少人？前一个问题没意思，后一个可以
算。”

[选择 A]
[玩家]
“我只需要攻击方向、范围和狼群受力后的改道。名字不进入报告。”

[判定]
none

[白凝冰]
“从岩脊斜切两百步，最强处足以断百兽王前腿。狼群没死完，便会朝阻力最小的旧猎棚绕。你的队伍
若还走旧路，正好撞上。”

[写入]
quest.q05.evidence_flags += "battle_observation"
world.flags.q05_evidence_family_ice = true
player.knowledge.ice_attack_parameters = true
npc.bai_ning_bing.relationship_state = "normal"

[结束]
END

[选择 B]
[玩家]
“我已经有冰痕证据，不需要你解释。”

[判定]
none

[白凝冰]
“那就别问。能从痕迹算出来，比记住一个名字有用。”

[写入]
npc.bai_ning_bing.relationship_state = "normal"

[结束]
END

## D_Q05_QING_SHU_02

类型：dialogue
ID：D_Q05_QING_SHU_02
所属：Q05
拥有者：npc.qing_shu
地点：east_wall_muster
available_from：D21_morning
expires_after：D24_evening
priority：80
topic：提交证据
requires：
- quest.q05.stage == "evidence_gathering"
- npc.qing_shu.alive == true
excludes：
- world.village_closed == true
- quest.q05.stage == "warning_ready"
once：false
on_expire：none

[古月青书]
“你带回了什么？按来源分开说。狼路、幸存者、冰痕和亲眼战斗不能混成一句‘我知道会出事’。”

[选择 A]
[玩家]
“第一类是狼路与幸存者，证明旧撤退线会被包抄；第二类是冰痕或战斗参数，证明狼群被外力改道。
两类能互相核对。”

[判定]
none

[古月青书]
“足够改任务。我们不再沿旧路硬退，下一步准备药、护具、标记和队伍信号；至少完成两项，再决定
谁去。”

[写入]
quest.q05.evidence_family_count = 2
quest.q05.stage = "warning_ready"
world.flags.q05_preparation_unlocked = true
npc.qing_shu.known_facts.two_evidence_families = true

[结束]
END

[选择 B]
[玩家]
“我现在只有一类可靠证据：`{q05_available_evidence}`。另一类还没有核实。”

[判定]
none

[古月青书]
“这能让队伍提高警惕，不能让我彻底改路线。继续查另一类，或者到截止时按现有情报决定。”

[写入]
quest.q05.evidence_family_count = 1
npc.qing_shu.known_facts.one_evidence_family = true

[结束]
END

[选择 C]
[玩家]
“我没有新证据，只是觉得这次任务危险。”

[判定]
none

[古月青书]
“每次外勤都危险。没有路线、时辰或痕迹，我不能让整队为了你的感觉改变。”

[写入]
npc.qing_shu.relationship_state = "normal"

[结束]
END

## D_Q05_QING_SHU_DEPUTY_02

类型：dialogue
ID：D_Q05_QING_SHU_DEPUTY_02
所属：Q05
拥有者：npc.qing_shu_deputy
地点：east_wall_muster
available_from：D21_morning
expires_after：D24_evening
priority：80
topic：替代汇报
requires：
- quest.q05.stage == "evidence_gathering"
- world.flags.q05_recruiter == "qing_shu_deputy"
excludes：
- world.village_closed == true
once：false
on_expire：none

[青书副手]
“青书还没回来，证据先交我。我能改队伍准备，不能替他承诺私人信物。”

[选择 A]
[玩家]
“两类证据齐全：狼路或幸存者一类，冰痕或战斗观察一类。请按队伍权限改准备。”

[判定]
none

[青书副手]
“我确认来源独立。准备清单现在开放，最终行动由当时的队伍负责人决定。”

[写入]
quest.q05.evidence_family_count = 2
quest.q05.stage = "warning_ready"
world.flags.q05_preparation_unlocked = true
npc.qing_shu_deputy.known_facts.two_evidence_families = true

[结束]
END

[选择 B]
[玩家]
“目前只有一类，我先留档。”

[判定]
none

[青书副手]
“已记。第二类证据未补齐前，只做普通警戒。”

[写入]
quest.q05.evidence_family_count = 1
npc.qing_shu_deputy.known_facts.one_evidence_family = true

[结束]
END

## D_Q05_MEDICINE_ELDER_01

类型：dialogue
ID：D_Q05_MEDICINE_ELDER_01
所属：Q05
拥有者：npc.medicine_elder
地点：medicine_hall
available_from：D21_morning
expires_after：D25_noon
priority：60
topic：撤退药包
requires：
- quest.q05.stage == "warning_ready"
- world.flags.q05_preparation_unlocked == true
excludes：
- world.village_closed == true
- quest.q05.preparation_flags contains "medicine_supply"
once：true
on_expire：none

[药堂家老]
“你们改撤退线，需要的是止血和稳脉，不是把整间药堂背走。我可以给两份药包；谁携带、给谁用，
现在写清。”

[选择 A]
[玩家]
“一份由前队携带，一份留撤退点。重伤优先，不按个人关系分。”

[判定]
none

[药堂家老]
“分配合理。封条颜色不同，前队用红，撤退点用白。私自拆作普通补给，后续不再补发。”

[写入]
quest.q05.preparation_flags += "medicine_supply"
quest.q05.preparation_count += 1
player.inventory += "ITEM_Q05_MEDICINE_PACKS"
npc.medicine_elder.known_facts.q05_supply_issued = true

[结束]
END

[选择 B]
[玩家]
“只领一份撤退药包，另一份留给守寨伤员。”

[判定]
none

[药堂家老]
“可以。准备仍算完成，行动容错会比两份低。”

[写入]
quest.q05.preparation_flags += "medicine_supply"
quest.q05.preparation_count += 1
player.inventory += "ITEM_Q05_MEDICINE_PACK_1"
world.flags.q05_medicine_supply_limited = true

[结束]
END

## D_Q05_ARMORY_KEEPER_01

类型：dialogue
ID：D_Q05_ARMORY_KEEPER_01
所属：Q05
拥有者：npc.armory_keeper
地点：clan_armory
available_from：D21_morning
expires_after：D25_noon
priority：60
topic：外勤护具
requires：
- quest.q05.stage == "warning_ready"
- world.flags.q05_preparation_unlocked == true
excludes：
- world.village_closed == true
- quest.q05.preparation_flags contains "armory_gear"
once：true
on_expire：none

[兵库保管员]
“青书队的临时配额只够三件：护腕、信号索和一面折盾。全拿要留下功绩押金，任务后归还可退。”

[选择 A]
[玩家]
“三件都领，押金从我的功绩扣。归还时按编号验收。”

[判定]
none

[兵库保管员]
“编号记下了。少一件按全价赔，战损要有队伍记录。”

[写入]
player.resources.clan_merit -= 5
player.inventory += "ITEM_Q05_ARMORY_SET"
quest.q05.preparation_flags += "armory_gear"
quest.q05.preparation_count += 1

[结束]
END

[选择 B]
[玩家]
“只领信号索和折盾，护腕留给前排。”

[判定]
none

[兵库保管员]
“可以。少一件不影响准备计数，但近身受伤风险由你自己承担。”

[写入]
player.inventory += "ITEM_Q05_SIGNAL_AND_SHIELD"
quest.q05.preparation_flags += "armory_gear"
quest.q05.preparation_count += 1
world.flags.q05_armory_gear_limited = true

[结束]
END

## I_Q05_RETREAT_MARKERS_01

类型：interaction
ID：I_Q05_RETREAT_MARKERS_01
所属：Q05
拥有者：object.retreat_marker_board
地点：east_wall_muster
available_from：D21_morning
expires_after：D25_noon
priority：60
topic：none
requires：
- quest.q05.stage == "warning_ready"
- world.flags.q05_preparation_unlocked == true
excludes：
- world.village_closed == true
once：false
on_expire：none

[提示]
配置撤退标记与队伍信号

[操作 A]
按浅沟、界碑和猎棚设置三枚撤退标记

[判定]
洞察 + 已知路线证据，对抗难度 54

[成功]
[事实结果]
“三枚标记与实际安全线一致，队伍能够在旧路被切断时转入浅沟。”

[写入]
quest.q05.preparation_flags += "retreat_markers"
quest.q05.preparation_count += 1
world.flags.q05_retreat_route_valid = true

[结束]
END

[失败]
[事实结果]
“一枚标记位置与狼群新路线冲突。标记仍可用，但行动时需要额外确认。”

[写入]
quest.q05.preparation_flags += "retreat_markers"
quest.q05.preparation_count += 1
world.flags.q05_retreat_marker_error = true

[结束]
END

[操作 B]
统一三短一长的队伍撤退信号

[判定]
none

[事实结果]
“队伍成员登记统一信号，并指定副手在青书失联时接管撤退命令。”

[写入]
quest.q05.preparation_flags += "team_signal"
quest.q05.preparation_count += 1
world.flags.q05_deputy_command = true

[结束]
END

[操作 C]
不修改准备

[判定]
none

[事实结果]
“没有增加准备项。最终决策仍会读取当前准备数量。”

[写入]
none

[结束]
END

## D_Q05_QING_SHU_03

类型：dialogue
ID：D_Q05_QING_SHU_03
所属：Q05
拥有者：npc.qing_shu
地点：east_wall_muster
available_from：D24_morning
expires_after：D25_evening
priority：80
topic：最终决定
requires：
- quest.q05.stage == "warning_ready"
- quest.q05.evidence_family_count == 2
- npc.qing_shu.alive == true
excludes：
- world.village_closed == true
once：true
on_expire：none

[古月青书]
“证据够了，现在谈谁承担。稳妥改线需要至少两项准备；准备不足可以冒险救援；你也可以顶替我的
前锋位置、在出发前撤回，或者明确拒绝。没有哪项会因为你知道危险就自动成功。”

[选择 A]
[玩家]
“按新路线稳妥救援。两类证据、至少两项准备都已确认。”

[判定]
none

[古月青书]
“我领前队，你负责第二撤退点。任何人失联超过约定时辰，副手直接带队撤，不回头追单个人。”

[写入]
quest.q05.intent = "stable_rescue"
quest.q05.stage = "departure_pending"
operation.q05_rescue = "ready"
world.flags.q05_operation_unlocked = true

[结束]
END

[选择 B]
[玩家]
“准备不足也出发，优先把旧路上的队员带回来，接受更高伤亡和消耗。”

[判定]
none

[古月青书]
“这是冒险救援，不叫稳妥。药包和护具可能全部耗尽，行动结束也未必还有青藤护符。”

[写入]
quest.q05.intent = "costly_rescue"
quest.q05.stage = "departure_pending"
operation.q05_rescue = "ready"
world.flags.q05_operation_unlocked = true

[结束]
END

[选择 C]
[玩家]
“我顶替你的前锋位置。你留在撤退点统筹队伍。”

[判定]
none

[古月青书]
“我接受，但你先证明能承担前锋判定。行动失败时，我仍可能为接应进入危险区，不是把我的风险
凭空删掉。”

[写入]
quest.q05.intent = "replace"
quest.q05.stage = "departure_pending"
operation.q05_rescue = "ready"
world.flags.q05_operation_unlocked = true

[结束]
END

[选择 D]
[玩家]
“我在出发前撤回。证据与准备留给队伍，我不参加行动。”

[判定]
none

[古月青书]
“可以。你没有临阵脱队，准备仍归队伍使用；私人救援奖励关闭。”

[写入]
quest.q05.intent = "withdraw"
quest.q05.operation_result = "not_started"
quest.q05.result = "withdrew"
quest.q05.stage = "resolved"
operation.q05_rescue = "skipped"

[结束]
END

[选择 E]
[玩家]
“我拒绝这次行动，也不提供个人物资。”

[判定]
none

[古月青书]
“拒绝记录成立。之前提交的事实留在任务档案，未交付的物资仍归你。”

[写入]
quest.q05.intent = "refuse"
quest.q05.operation_result = "not_started"
quest.q05.result = "refused"
quest.q05.stage = "resolved"
operation.q05_rescue = "skipped"

[结束]
END

## D_Q05_QING_SHU_DEPUTY_03

类型：dialogue
ID：D_Q05_QING_SHU_DEPUTY_03
所属：Q05
拥有者：npc.qing_shu_deputy
地点：east_wall_muster
available_from：D24_morning
expires_after：D25_evening
priority：80
topic：替代决策
requires：
- quest.q05.stage == "warning_ready"
- quest.q05.evidence_family_count == 2
- world.flags.q05_recruiter == "qing_shu_deputy"
excludes：
- world.village_closed == true
once：true
on_expire：none

[青书副手]
“青书不在集合点，由我按队伍权限决定。稳妥改线、冒险救援、由你顶替前锋、撤回或拒绝都可以；
我不能替青书预先承诺他的私人信物。”

[选择 A]
[玩家]
“准备达到两项，按新路线稳妥救援。”

[判定]
none

[青书副手]
“通过。行动中若青书出现，由他接前队；否则我负责撤退命令。”

[写入]
quest.q05.intent = "stable_rescue"
quest.q05.stage = "departure_pending"
operation.q05_rescue = "ready"
world.flags.q05_operation_unlocked = true

[结束]
END

[选择 B]
[玩家]
“按现有准备冒险救援，接受资源与伤亡代价。”

[判定]
none

[青书副手]
“通过。队伍不会把这条路线记成低风险。”

[写入]
quest.q05.intent = "costly_rescue"
quest.q05.stage = "departure_pending"
operation.q05_rescue = "ready"
world.flags.q05_operation_unlocked = true

[结束]
END

[选择 C]
[玩家]
“我顶替前锋，队伍按替代编组出发。”

[判定]
none

[青书副手]
“编组修改。你承担前锋检定，我保留强制撤退权。”

[写入]
quest.q05.intent = "replace"
quest.q05.stage = "departure_pending"
operation.q05_rescue = "ready"
world.flags.q05_operation_unlocked = true

[结束]
END

[选择 D]
[玩家]
“我撤回，但已交付准备留给队伍。”

[判定]
none

[青书副手]
“记录为出发前撤回，不记临阵脱队。”

[写入]
quest.q05.intent = "withdraw"
quest.q05.operation_result = "not_started"
quest.q05.result = "withdrew"
quest.q05.stage = "resolved"
operation.q05_rescue = "skipped"

[结束]
END

[选择 E]
[玩家]
“我拒绝行动，也不交个人物资。”

[判定]
none

[青书副手]
“记录为拒绝。任务由队伍自行结算。”

[写入]
quest.q05.intent = "refuse"
quest.q05.operation_result = "not_started"
quest.q05.result = "refused"
quest.q05.stage = "resolved"
operation.q05_rescue = "skipped"

[结束]
END

## operation.q05_rescue

这是战斗/逃生玩法与剧情状态之间的契约，不是对话记录。

输入：

```text
quest.q05.intent
quest.q05.evidence_flags
quest.q05.preparation_flags
quest.q05.evidence_family_count
quest.q05.preparation_count
player 当前战斗与资源状态
npc.qing_shu.alive
```

开始行动：

```text
operation.q05_rescue = "running"
```

输出：

```text
quest.q05.operation_result = success / partial / failure
npc.qing_shu.alive = true / false
quest.q05.casualties = 0 / 1 / 2
消耗实际使用的药包、护具、标记或支援
```

终局优先级：

```text
failure 或 npc.qing_shu.alive == false
-> quest.q05.result = "dead"

success + stable_rescue + evidence_family_count == 2 + preparation_count >= 2
-> quest.q05.result = "saved_stable"

partial + stable_rescue + npc.qing_shu.alive == true
-> quest.q05.result = "saved_costly"

success/partial + costly_rescue + npc.qing_shu.alive == true
-> quest.q05.result = "saved_costly"

success/partial + replace + npc.qing_shu.alive == true
-> quest.q05.result = "replaced"
```

每种组合必须且只能命中一个终局。随后统一写入：

```text
operation.q05_rescue = "settled"
quest.q05.stage = "resolved"
```

## D_Q05_QING_SHU_RESULT_SAVED_01

类型：dialogue
ID：D_Q05_QING_SHU_RESULT_SAVED_01
所属：Q05
拥有者：npc.qing_shu
地点：east_wall_rest_point
available_from：D24_morning
expires_after：D30_evening
priority：70
topic：稳妥救援结算
requires：
- quest.q05.result == "saved_stable"
- npc.qing_shu.alive == true
excludes：
- world.village_closed == true
once：true
on_expire：none

[古月青书]
“两条证据让我们改了路线，两项准备让改线不只是纸上计划。队伍按信号撤回，没有人留在旧路。
这不是你提前说中，是你把每一步做成了别人能执行的东西。”

[选择 A]
[玩家]
“按队伍结算。信物、青藤护符和支援各写明用途，不用关系数代替。”

[判定]
none

[古月青书]
“信物用于联系遗民；青藤护符抵一次致命物理伤；支援在狼潮中替你完成一个已登记目标。三件都
唯一，不会重复发。”

[写入]
player.inventory += "ITEM_QING_SHU_TOKEN"
player.inventory += "ITEM_GREEN_VINE_CHARM"
player.inventory += "ITEM_QING_SHU_SUPPORT"
item.unique.ITEM_QING_SHU_TOKEN.owner = "player"
item.unique.ITEM_GREEN_VINE_CHARM.owner = "player"
item.unique.ITEM_QING_SHU_SUPPORT.owner = "player"
npc.qing_shu.relationship_state = "cooperative"

[结束]
END

[选择 B]
[玩家]
“信物和支援留下，护符优先给本次伤员。”

[判定]
none

[古月青书]
“可以。你放弃个人护符，换两点额外队伍功绩。选择写进结算，不会在离山时重新出现一枚。”

[写入]
player.inventory += "ITEM_QING_SHU_TOKEN"
player.inventory += "ITEM_QING_SHU_SUPPORT"
item.unique.ITEM_QING_SHU_TOKEN.owner = "player"
item.unique.ITEM_GREEN_VINE_CHARM.owner = "missed_permanently"
item.unique.ITEM_QING_SHU_SUPPORT.owner = "player"
player.resources.clan_merit += 2

[结束]
END

## D_Q05_QING_SHU_RESULT_COSTLY_01

类型：dialogue
ID：D_Q05_QING_SHU_RESULT_COSTLY_01
所属：Q05
拥有者：npc.qing_shu
地点：medicine_hall
available_from：D24_morning
expires_after：D30_evening
priority：70
topic：高成本生还
requires：
- quest.q05.result == "saved_costly"
- npc.qing_shu.alive == true
excludes：
- world.village_closed == true
once：true
on_expire：none

[古月青书]
“人回来了，代价也是真的。药包和护具已经耗尽，伤员需要继续照看。我能给你信物，青藤护符这次
凝不出来，狼潮支援也只能保留一部分。”

[选择 A]
[玩家]
“按高成本生还结算，不把消耗抹掉。”

[判定]
none

[古月青书]
“信物给你。它能证明你参与过队伍，不代表这次行动没有伤亡。”

[写入]
player.inventory += "ITEM_QING_SHU_TOKEN"
item.unique.ITEM_QING_SHU_TOKEN.owner = "player"
item.unique.ITEM_GREEN_VINE_CHARM.owner = "missed_permanently"
item.unique.ITEM_QING_SHU_SUPPORT.owner = "missed_permanently"
npc.qing_shu.relationship_state = "cooperative"

[结束]
END

[选择 B]
[玩家]
“信物也留给队伍，我只保留行动记录。”

[判定]
none

[古月青书]
“可以。记录写明你承担了什么，日后不靠一块木牌证明。”

[写入]
item.unique.ITEM_QING_SHU_TOKEN.owner = "missed_permanently"
player.inventory += "ITEM_Q05_OPERATION_RECORD"

[结束]
END

## D_Q05_QING_SHU_RESULT_REPLACED_01

类型：dialogue
ID：D_Q05_QING_SHU_RESULT_REPLACED_01
所属：Q05
拥有者：npc.qing_shu
地点：east_wall_rest_point
available_from：D24_morning
expires_after：D30_evening
priority：70
topic：顶替结算
requires：
- quest.q05.result == "replaced"
- npc.qing_shu.alive == true
excludes：
- world.village_closed == true
once：true
on_expire：none

[古月青书]
“你替我走了前锋位置，队伍也按你的路线撤了。这个结果不是‘我的死局被删除’，是责任换了人，
而你把它承担下来。”

[选择 A]
[玩家]
“把顶替记录、信物和一次队伍支援给我，伤亡按实际结算。”

[判定]
none

[古月青书]
“可以。青藤护符留给后续伤员，你得到信物和支援。第 30 日东墙遗民路线也会认这份记录。”

[写入]
player.inventory += "ITEM_QING_SHU_TOKEN"
player.inventory += "ITEM_QING_SHU_SUPPORT"
item.unique.ITEM_QING_SHU_TOKEN.owner = "player"
item.unique.ITEM_QING_SHU_SUPPORT.owner = "player"
item.unique.ITEM_GREEN_VINE_CHARM.owner = "missed_permanently"
npc.qing_shu.relationship_state = "cooperative"

[结束]
END

[选择 B]
[玩家]
“我只要顶替记录，不领取私人奖励。”

[判定]
none

[古月青书]
“记录给你。你放弃物品，不会抹去队伍欠你的事实。”

[写入]
player.inventory += "ITEM_Q05_REPLACEMENT_RECORD"
item.unique.ITEM_QING_SHU_TOKEN.owner = "missed_permanently"
item.unique.ITEM_QING_SHU_SUPPORT.owner = "missed_permanently"

[结束]
END

## D_Q05_QING_SHU_RESULT_WITHDREW_01

类型：dialogue
ID：D_Q05_QING_SHU_RESULT_WITHDREW_01
所属：Q05
拥有者：npc.qing_shu
地点：east_wall_muster
available_from：D24_morning
expires_after：D30_evening
priority：70
topic：出发前撤回
requires：
- quest.q05.result == "withdrew"
- npc.qing_shu.alive == true
excludes：
- world.village_closed == true
once：true
on_expire：none

[古月青书]
“你在出发前撤回，证据和已交准备仍帮到了队伍。我不会把你写成临阵脱逃，也不会发只有参战者
才能拿的信物和护符。”

[选择 A]
[玩家]
“这样结算即可。我的未交物资仍归我。”

[判定]
none

[古月青书]
“清单已经分开。队伍只用了你明确交付的部分。”

[写入]
world.flags.q05_withdrawal_acknowledged = true

[结束]
END

[选择 B]
[玩家]
“把我提交证据的普通功绩结清。”

[判定]
none

[古月青书]
“两点调查功绩，不含行动奖励。”

[写入]
player.resources.clan_merit += 2

[结束]
END

## D_Q05_QING_SHU_DEPUTY_RESULT_DEAD_01

类型：dialogue
ID：D_Q05_QING_SHU_DEPUTY_RESULT_DEAD_01
所属：Q05
拥有者：npc.qing_shu_deputy
地点：east_wall_rest_point
available_from：D24_morning
expires_after：D30_evening
priority：70
topic：青书死亡
requires：
- quest.q05.result == "dead"
- npc.qing_shu.alive == false
excludes：
- world.village_closed == true
once：true
on_expire：none

[青书副手]
“行动失败，或者接应时青书没能回来。证据、准备和你的选择都记在队伍账里；死亡不会因为我们曾
有更好方案就自动改写。”

[选择 A]
[玩家]
“把死亡时辰、队伍伤亡和失败点完整记下。”

[判定]
none

[青书副手]
“记录会给你一份。它能用于后续复盘，不会变成重开同一行动的钥匙。”

[写入]
player.inventory += "ITEM_QING_SHU_DEATH_RECORD"
item.unique.ITEM_QING_SHU_TOKEN.owner = "missed_permanently"
item.unique.ITEM_GREEN_VINE_CHARM.owner = "missed_permanently"
item.unique.ITEM_QING_SHU_SUPPORT.owner = "missed_permanently"

[结束]
END

[选择 B]
[玩家]
“我不取遗物。按死亡结果结算。”

[判定]
none

[青书副手]
“已经锁定。遗民会记得参与者，也会记得谁没有回来。”

[写入]
world.flags.q05_death_acknowledged = true

[结束]
END

## D_Q05_QING_SHU_RESULT_REFUSED_01

类型：dialogue
ID：D_Q05_QING_SHU_RESULT_REFUSED_01
所属：Q05
拥有者：npc.qing_shu
地点：east_wall_muster
available_from：D24_morning
expires_after：D30_evening
priority：70
topic：拒绝行动
requires：
- quest.q05.result == "refused"
excludes：
- world.village_closed == true
once：true
on_expire：none

[古月青书]
“你明确拒绝了行动。之前提交的事实仍属于任务档案，未交物资仍归你；信物、护符和支援不会发放。”

[选择 A]
[玩家]
“确认拒绝，不要求行动奖励。”

[判定]
none

[古月青书]
“记下了。之后的狼潮任务仍按普通资格开放。”

[写入]
world.flags.q05_refusal_acknowledged = true

[结束]
END

[选择 B]
[玩家]
“我只领取已验证证据的普通功绩。”

[判定]
none

[古月青书]
“证据功绩两点，与救援结果分开。”

[写入]
player.resources.clan_merit += 2

[结束]
END

## D_Q05_QING_SHU_DEPUTY_MISSED_01

类型：dialogue
ID：D_Q05_QING_SHU_DEPUTY_MISSED_01
所属：Q05
拥有者：npc.qing_shu_deputy
地点：east_wall_muster
available_from：D26_morning
expires_after：D30_evening
priority：70
topic：错过行动
requires：
- quest.q05.result == "missed"
excludes：
- world.village_closed == true
once：true
on_expire：none

[青书副手]
“第二十五日晚队伍已经出发。玩家没有在截止前形成两类证据并完成决定，按错过处理。现在能做的
是狼潮准备，不是回到出发前重选。”

[选择 A]
[玩家]
“记录我缺的是证据、准备还是最终决定。”

[判定]
none

[青书副手]
“系统会列出当时缺失项：`{q05_missed_requirements}`。这是复盘，不重开节点。”

[写入]
player.knowledge.q05_missed_requirements = true

[结束]
END

[选择 B]
[玩家]
“按永久错过结算。”

[判定]
none

[青书副手]
“已经锁定。”

[写入]
item.unique.ITEM_QING_SHU_TOKEN.owner = "missed_permanently"
item.unique.ITEM_GREEN_VINE_CHARM.owner = "missed_permanently"
item.unique.ITEM_QING_SHU_SUPPORT.owner = "missed_permanently"

[结束]
END

## 系统到期结算

`D25_evening` 推进结束时：

```text
quest.q05.result == "none"
-> quest.q05.stage = "missed"
-> quest.q05.result = "missed"
-> operation.q05_rescue = "skipped"
```

白凝冰对话从不参与 `evidence_family_count` 的最低可达性证明。玩家仅凭狼路/幸存者与冰痕两组
地图交互和普通 NPC 证言即可进入全部最终决定。
