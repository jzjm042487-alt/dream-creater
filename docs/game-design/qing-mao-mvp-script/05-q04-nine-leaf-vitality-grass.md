# Q04《九叶生机草》

本文件记录双亲遗产线索、所有权证据、舅父舅母、药堂与江牙的主张，以及九叶生机草的最终持有人。

## D_Q04_HE_NIANG_01

类型：dialogue
ID：D_Q04_HE_NIANG_01
所属：Q04
拥有者：npc.he_niang
地点：grain_shop_back_room
available_from：D09_noon
expires_after：D18_evening
priority：60
topic：旧药账
requires：
- quest.q04.stage == "unavailable"
excludes：
- world.village_closed == true
once：true
on_expire：none

[禾娘]
“你回来以后，有人来问你双亲那笔旧药账。我只管小账，不替谁认亲。账上写过一只九叶生机草，
后来由你舅父代管；是代管还是抵债，得看原页。”

[选择 A]
[玩家]
“告诉我原页在哪、谁能查。我不要求你先站队。”

[判定]
none

[禾娘]
“旧屋灶砖后可能有你母亲的薄册，药堂还有一份保管记录。两份都看，别拿我的一句话当完整证据。”

[写入]
quest.q04.stage = "ownership_rumored"
player.knowledge.parent_ledger_location = true
player.knowledge.custody_record_exists = true
npc.he_niang.met_player = true
npc.he_niang.relationship_state = "normal"

[结束]
END

[选择 B]
[玩家]
“这笔旧药账与我现在欠你的账是不是同一笔？”

[判定]
none

[禾娘]
“不是。你欠我的是回来后赊的粮；你双亲那笔牵涉药堂运输。别想用一笔模糊另一笔，也别怕我拿
小账吞你的蛊。”

[写入]
quest.q04.stage = "ownership_rumored"
player.knowledge.parent_debt_separate = true
player.knowledge.parent_ledger_location = true
npc.he_niang.met_player = true
npc.he_niang.relationship_state = "normal"

[结束]
END

[选择 C]
[玩家]
“我不追查遗产。九叶生机草由现持有人继续处理。”

[判定]
none

[禾娘]
“这话你最好也当面对舅父说。你不主张是一回事，别人以后说你从未知道又是另一回事。”

[写入]
quest.q04.stage = "settled"
quest.q04.route = "refused"
quest.q04.result = "refused"

[结束]
END

## D_Q04_UNCLE_01

类型：dialogue
ID：D_Q04_UNCLE_01
所属：Q04
拥有者：npc.uncle
地点：uncle_house
available_from：D10_morning
expires_after：D22_evening
priority：60
topic：遗产主张
requires：
- quest.q04.stage == "ownership_rumored"
excludes：
- world.village_closed == true
- quest.q04.route != "none"
once：true
on_expire：none

[舅父]
“九叶生机草在我家养了这些年，肥料、元石、药堂抽成全是我出。你双亲留下的若只有一只快饿死的
蛊，那些年成本算谁的？”

[选择 A]
[玩家]
“成本可以核算，所有权不能靠一句‘我养过’变更。我会先查购买账和药堂保管记录，再正式主张。”

[判定]
none

[舅父]
“查可以。若账上真写代管，我也要把历年成本逐项列出来。你不能只继承收益，不继承负担。”

[写入]
quest.q04.stage = "evidence_gathering"
quest.q04.route = "lawful_claim"
world.flags.q04_family_cost_account_unlocked = true
npc.uncle.relationship_state = "normal"

[结束]
END

[选择 B]
[玩家]
“我不争旧账，直接谈买回。你开一个包含这些年成本的价格。”

[判定]
none

[舅父]
“六十块元石，或者四十块加你放弃旧屋后院那块药田。钱到，药堂见证转移。”

[写入]
quest.q04.stage = "claim_selected"
quest.q04.route = "trade"
world.flags.q04_purchase_price = 60
world.flags.q04_purchase_agreed = true

[结束]
END

[选择 C]
[玩家]
“我先不主张，也不交易。第二区间内我会再答复。”

[判定]
none

[舅父]
“可以拖，但第二十四日晚以后药堂征用，我不会再替你保留谈价。”

[写入]
quest.q04.stage = "evidence_gathering"
quest.q04.route = "observer"
player.knowledge.q04_deadline = true

[结束]
END

[选择 D]
[玩家]
“我明确放弃主张。九叶继续归你家。”

[判定]
none

[舅父]
“当着禾娘或药堂再说一次，免得以后反悔。”

[写入]
quest.q04.stage = "settled"
quest.q04.route = "refused"
quest.q04.result = "refused"
item.unique.GU_NINE_LEAF.owner = "npc.uncle"

[结束]
END

## D_Q04_AUNT_01

类型：dialogue
ID：D_Q04_AUNT_01
所属：Q04
拥有者：npc.aunt
地点：uncle_house
available_from：D10_noon
expires_after：D22_evening
priority：60
topic：养蛊成本
requires：
- quest.q04.stage in ["ownership_rumored", "evidence_gathering", "claim_selected"]
excludes：
- world.village_closed == true
- npc.aunt.known_facts.cost_statement_given == true
once：true
on_expire：none

[舅母]
“你只听见一只蛊值钱，没听见它每年吃多少。九叶要腐土、月井水和药堂许可，少一项都催不出
生机叶。我们不是白替你守宝。”

[选择 A]
[玩家]
“把历年支出和卖出生机叶的收入一起列。只列成本，不列收益，不是完整账。”

[判定]
交涉 + 市井通达，对抗难度 60

[成功]
[舅母]
“你倒会看账。收入确实抵掉大半支出，剩下多少让药堂算。别指望算完一块不付。”

[写入]
player.knowledge.family_nine_leaf_profit = true
quest.q04.evidence_flags += "custody_record"
npc.aunt.known_facts.cost_statement_given = true

[结束]
END

[失败]
[舅母]
“账是我们家的，不是你来一句便全摊开。你去药堂查公开记录。”

[写入]
player.knowledge.medicine_hall_has_public_record = true
npc.aunt.known_facts.cost_statement_given = true

[结束]
END

[选择 B]
[玩家]
“我承认有养护成本。若所有权归我，合理成本从后续生机叶收入里分期补。”

[判定]
none

[舅母]
“这比空手拿走强。你舅父未必答应分期，但我会把这条件告诉他。”

[写入]
world.flags.q04_installment_offer = true
npc.aunt.known_facts.cost_statement_given = true

[结束]
END

## I_Q04_PARENT_LEDGER_01

类型：interaction
ID：I_Q04_PARENT_LEDGER_01
所属：Q04
拥有者：object.parent_hidden_ledger
地点：branch_house_kitchen
available_from：D09_morning
expires_after：D24_evening
priority：60
topic：none
requires：
- quest.q04.stage in ["ownership_rumored", "evidence_gathering"]
- player.knowledge.parent_ledger_location == true
excludes：
- world.village_closed == true
- quest.q04.evidence_flags contains "parent_ledger"
once：true
on_expire：none

[提示]
检查旧屋灶台后的双亲薄账

[操作 A]
核对九叶购买、代管与收益页

[判定]
none

[事实结果]
“薄账记录九叶生机草由玩家双亲购买；托舅父代养，养护成本从生机叶收益中扣除；没有永久转让或
抵债条款。”

[写入]
quest.q04.evidence_flags += "parent_ledger"
player.knowledge.nine_leaf_parent_owned = true
player.inventory += "ITEM_PARENT_LEDGER"

[结束]
END

[操作 B]
只抄录相关页，原册留在旧屋

[判定]
none

[事实结果]
“抄录包含购买价、代管人和收益抵扣方式，可以与药堂记录交叉核验。”

[写入]
quest.q04.evidence_flags += "parent_ledger"
player.knowledge.nine_leaf_parent_owned = true
player.inventory += "ITEM_PARENT_LEDGER_COPY"

[结束]
END

## I_Q04_CUSTODY_RECORD_01

类型：interaction
ID：I_Q04_CUSTODY_RECORD_01
所属：Q04
拥有者：object.medicine_custody_record
地点：medicine_hall_archive
available_from：D11_morning
expires_after：D24_evening
priority：60
topic：none
requires：
- quest.q04.stage in ["ownership_rumored", "evidence_gathering", "claim_selected"]
- player.knowledge.custody_record_exists == true
excludes：
- world.village_closed == true
- quest.q04.evidence_flags contains "custody_record"
once：true
on_expire：none

[提示]
查阅九叶生机草药堂保管记录

[操作 A]
核对持有人、代管人和历年生机叶登记

[判定]
洞察 + 细察入微，对抗难度 52

[成功]
[事实结果]
“药堂原始持有人栏仍是玩家双亲，舅父列为代管与交叶人。历年收益足以覆盖大部分养护成本，
最近两年有未申报差额。”

[写入]
quest.q04.evidence_flags += "custody_record"
player.knowledge.nine_leaf_custody_not_transfer = true
player.knowledge.family_unreported_leaf_income = true

[结束]
END

[失败]
[事实结果]
“确认舅父是当前代管人，原始持有人栏因旧墨模糊无法在本次核清。仍可结合双亲薄账或证言。”

[写入]
quest.q04.evidence_flags += "custody_record"
player.knowledge.uncle_is_custodian = true

[结束]
END

[操作 B]
不抄录收入，只取得代管证明

[判定]
none

[事实结果]
“取得药堂盖印的代管摘要。摘要证明保管关系，不证明历年净收益。”

[写入]
quest.q04.evidence_flags += "custody_record"
player.inventory += "ITEM_CUSTODY_SUMMARY"

[结束]
END

## D_Q04_MEDICINE_ELDER_01

类型：dialogue
ID：D_Q04_MEDICINE_ELDER_01
所属：Q04
拥有者：npc.medicine_elder
地点：medicine_hall
available_from：D18_morning
expires_after：D24_evening
priority：60
topic：药堂方案
requires：
- quest.q04.stage in ["evidence_gathering", "claim_selected", "ownership_contested"]
excludes：
- world.village_closed == true
- world.flags.q04_medicine_offer_resolved == true
once：true
on_expire：none

[药堂家老]
“九叶的所有权可以按证据裁定，也可以直接交药堂统管。自留意味着你承担喂养、征集与家族追问；
上缴则换元石报酬、稳定生机叶份额和一次保命药。”

[选择 A]
[玩家]
“先按证据裁定所有权。若归我，我再决定自留或上缴。”

[判定]
none

[药堂家老]
“可以。两份书面证据足以开启正式主张；只有口头说法，药堂不会替你从现持有人手里取蛊。”

[写入]
quest.q04.stage = "claim_selected"
quest.q04.route = "lawful_claim"
world.flags.q04_lawful_claim_unlocked = true
world.flags.q04_medicine_offer_resolved = true

[结束]
END

[选择 B]
[玩家]
“我愿意在确认归属后立即上缴，换药堂保护与保命药。”

[判定]
none

[药堂家老]
“药堂会见证转移，不会凭你的承诺先抢蛊。取得所有权后，到九叶圃执行上缴。”

[写入]
quest.q04.stage = "claim_selected"
quest.q04.route = "surrender"
world.flags.q04_surrender_unlocked = true
world.flags.q04_medicine_offer_resolved = true

[结束]
END

[选择 C]
[玩家]
“我不接受药堂方案。所有权争议由家族和原账处理。”

[判定]
none

[药堂家老]
“可以。狼潮征集时仍按所有持有治疗蛊者的规则处理，不因你拒绝这份方案而额外处罚。”

[写入]
world.flags.q04_medicine_offer_resolved = true

[结束]
END

## D_Q04_JIANG_YA_01

类型：dialogue
ID：D_Q04_JIANG_YA_01
所属：Q04
拥有者：npc.jiang_ya
地点：east_alley_market
available_from：D19_evening
expires_after：D24_noon
priority：60
topic：变现方案
requires：
- quest.q04.stage in ["evidence_gathering", "claim_selected", "ownership_contested"]
excludes：
- world.village_closed == true
- world.flags.q04_jiang_deal_unlocked == true
once：true
on_expire：none

[江牙]
“九叶留在你手里，是一门慢生意；卖给我，是一次拿钱。你先证明能合法取得，我出七十块元石，
也可以替你藏来源，但后一种价更低。”

[选择 A]
[玩家]
“我只谈合法转让。取得所有权后，药堂见证，七十块当场结清。”

[判定]
none

[江牙]
“行。合法转让我出七十，不替你付给舅父的养护成本。”

[写入]
quest.q04.route = "trade"
world.flags.q04_jiang_deal_unlocked = true
world.flags.q04_jiang_price = 70
npc.jiang_ya.transactions.nine_leaf_offer = true

[结束]
END

[选择 B]
[玩家]
“我不卖，只想知道山寨里谁会收生机叶。”

[判定]
none

[江牙]
“药堂公开收，猎队私下收，价差取决于狼潮伤员。知道买家不等于你能避开征集。”

[写入]
player.knowledge.nine_leaf_market = true
npc.jiang_ya.relationship_state = "normal"

[结束]
END

[选择 C]
[玩家]
“我不接受你的方案。”

[判定]
none

[江牙]
“那便没有债。以后你真拿到蛊，价格会随狼潮变，不保证还是七十。”

[写入]
world.flags.q04_jiang_offer_declined = true

[结束]
END

[选择 D]
[玩家]
“我不买卖。只要药圃换班与警戒规律，风险和后果由我承担。”

[判定]
交涉 + 市井通达，对抗难度 66

[成功]
[江牙]
“东墙钟响后换班，药圃有一刻空档。话只说一次；你若被抓，我不会承认是我给的。”

[写入]
quest.q04.route = "theft"
quest.q04.stage = "claim_selected"
world.flags.q04_theft_unlocked = true
npc.jiang_ya.transactions.nine_leaf_patrol_info = true

[结束]
END

[失败]
[江牙]
“这种消息比蛊还容易惹事。没有更高价，也没有能让我信你的理由，我不卖。”

[写入]
world.flags.q04_theft_unlocked = false

[结束]
END

## D_Q04_HE_NIANG_02

类型：dialogue
ID：D_Q04_HE_NIANG_02
所属：Q04
拥有者：npc.he_niang
地点：grain_shop_back_room
available_from：D18_morning
expires_after：D24_evening
priority：60
topic：代管证言
requires：
- quest.q04.stage in ["evidence_gathering", "claim_selected", "ownership_contested"]
- quest.q04.evidence_flags contains "parent_ledger"
excludes：
- world.village_closed == true
- quest.q04.evidence_flags contains "he_niang_testimony"
once：true
on_expire：none

[禾娘]
“薄账我认得，是你母亲的字。要我去药堂作证，可以；先把你欠我的粮钱结清，或者给我一份不会把
我卷进偷蛊的书面说明。”

[选择 A]
[玩家]
“粮钱当场结清。你只证明字迹、代管约定和当年交账，不替我评价现在该归谁。”

[判定]
none

[禾娘]
“这风险我能担。话我会照实说，多一句不加，少一句不减。”

[写入]
player.resources.primeval_stones -= 6
quest.q04.evidence_flags += "he_niang_testimony"
npc.he_niang.relationship_state = "cooperative"
npc.he_niang.known_facts.parent_ledger_seen = true

[结束]
END

[选择 B]
[玩家]
“我暂时没钱。给你一份书面保证：证言只用于合法裁定，不用于偷取或威胁。”

[判定]
交涉 + 市井通达，对抗难度 58

[成功]
[禾娘]
“保证写清责任，我便去一次。若你后来偷蛊，我会把这份保证交药堂。”

[写入]
quest.q04.evidence_flags += "he_niang_testimony"
player.inventory += "ITEM_HE_NIANG_LIMITED_GUARANTEE"
npc.he_niang.relationship_state = "cooperative"

[结束]
END

[失败]
[禾娘]
“你写得太虚，出了事还是我承担。先还粮钱，再谈证言。”

[写入]
npc.he_niang.relationship_state = "normal"

[结束]
END

## I_Q04_NINE_LEAF_GRASS_01

类型：interaction
ID：I_Q04_NINE_LEAF_GRASS_01
所属：Q04
拥有者：object.nine_leaf_cultivation_bed
地点：uncle_house_medicine_garden
available_from：D18_morning
expires_after：D24_evening
priority：80
topic：none
requires：
- quest.q04.stage in ["claim_selected", "ownership_contested", "evidence_gathering"]
excludes：
- world.village_closed == true
- quest.q04.stage == "settled"
once：false
on_expire：none

[提示]
处理九叶生机草最终归属

[操作 A]
凭两份书面证据或一份书证加禾娘证言执行合法主张

[判定]
交涉 + 有效所有权证据，对抗难度 62

[成功]
[事实结果]
“药堂确认双亲原始所有权和舅父代管关系。扣除已核实成本后，九叶生机草转归玩家。”

[写入]
player.inventory += "GU_NINE_LEAF"
item.unique.GU_NINE_LEAF.owner = "player"
quest.q04.stage = "settled"
quest.q04.result = "player_owned"
world.flags.q04_family_cost_due = true

[结束]
END

[失败]
[事实结果]
“现有材料不足以推翻当前代管人的控制。九叶仍由舅父家持有，本轮合法主张失败。”

[写入]
item.unique.GU_NINE_LEAF.owner = "npc.uncle"
quest.q04.stage = "settled"
quest.q04.result = "failed"

[结束]
END

[操作 B]
按已谈妥的六十块价格购买

[判定]
none

[事实结果]
“药堂见证六十块元石交付，舅父签署转让。九叶生机草转归玩家。”

[写入]
player.resources.primeval_stones -= 60
player.inventory += "GU_NINE_LEAF"
item.unique.GU_NINE_LEAF.owner = "player"
quest.q04.stage = "settled"
quest.q04.result = "player_owned"

[结束]
END

[操作 C]
执行已解锁的偷取尝试

[判定]
身法 + 隐蔽能力，对抗难度 75

[成功]
[事实结果]
“九叶生机草脱离药圃控制且未触发当场警报。玩家取得蛊虫，家族之后仍可能根据证据追查来源。”

[写入]
player.inventory += "GU_NINE_LEAF"
item.unique.GU_NINE_LEAF.owner = "player"
quest.q04.stage = "settled"
quest.q04.result = "player_owned"
world.flags.q04_theft_suspected = true
npc.uncle.direct_conflicts.nine_leaf = true

[结束]
END

[失败]
[事实结果]
“药圃警戒触发，蛊虫未离开原位。舅父家保留控制，玩家的偷取意图被记录。”

[写入]
item.unique.GU_NINE_LEAF.owner = "npc.uncle"
quest.q04.stage = "settled"
quest.q04.result = "failed"
world.flags.q04_theft_exposed = true
npc.uncle.relationship_state = "conflict"

[结束]
END

[操作 D]
将已确认的所有权上缴药堂

[判定]
none

[事实结果]
“九叶生机草进入药堂培养圃。药堂成为唯一持有人，玩家进入元石与保护奖励结算。”

[写入]
player.inventory -= "GU_NINE_LEAF"
item.unique.GU_NINE_LEAF.owner = "medicine_hall"
quest.q04.stage = "settled"
quest.q04.result = "medicine_hall_owned"

[结束]
END

[操作 E]
不改变当前归属

[判定]
none

[事实结果]
“没有发生所有权转移。玩家可在 D24_evening 前再次处理。”

[写入]
none

[结束]
END

## D_Q04_UNCLE_RESULT_FAILED_01

类型：dialogue
ID：D_Q04_UNCLE_RESULT_FAILED_01
所属：Q04
拥有者：npc.uncle
地点：uncle_house
available_from：D18_morning
expires_after：D30_evening
priority：70
topic：主张失败
requires：
- quest.q04.result == "failed"
excludes：
- world.village_closed == true
once：true
on_expire：none

[舅父]
“药堂已经裁定，或者你的手被当场抓住。九叶仍在我家。你可以保留账本，但不能拿同一份材料无限
重开所有权。”

[选择 A]
[玩家]
“我接受本轮结果。请把最终持有人写入家族账。”

[判定]
none

[舅父]
“会写。以后生机叶按现持有人缴纳，不再以你双亲名义挂账。”

[写入]
item.unique.GU_NINE_LEAF.owner = "npc.uncle"
world.flags.q04_failure_acknowledged = true

[结束]
END

[选择 B]
[玩家]
“我保留对未申报收益的追账，不再主张蛊虫。”

[判定]
none

[舅父]
“收益账可以另算，蛊虫归属不跟着重开。”

[写入]
player.knowledge.q04_income_claim_preserved = true

[结束]
END

## D_Q04_UNCLE_RESULT_REFUSED_01

类型：dialogue
ID：D_Q04_UNCLE_RESULT_REFUSED_01
所属：Q04
拥有者：npc.uncle
地点：uncle_house
available_from：D10_morning
expires_after：D30_evening
priority：70
topic：放弃主张
requires：
- quest.q04.result == "refused"
excludes：
- world.village_closed == true
once：true
on_expire：none

[舅父]
“你当面放弃了九叶主张，我也把这句话记进账。以后你可以查双亲旧债，不能再说九叶一直等你来拿。”

[选择 A]
[玩家]
“确认放弃。九叶归现持有人。”

[判定]
none

[舅父]
“好。旧屋其他东西另算。”

[写入]
item.unique.GU_NINE_LEAF.owner = "npc.uncle"
world.flags.q04_refusal_acknowledged = true

[结束]
END

[选择 B]
[玩家]
“我只放弃蛊虫，不放弃查阅双亲账本。”

[判定]
none

[舅父]
“账本你可以查。别把查账变成重新取蛊。”

[写入]
player.knowledge.parent_accounts_still_open = true

[结束]
END

## D_Q04_MEDICINE_ELDER_SETTLEMENT_01

类型：dialogue
ID：D_Q04_MEDICINE_ELDER_SETTLEMENT_01
所属：Q04
拥有者：npc.medicine_elder
地点：medicine_hall
available_from：D18_morning
expires_after：D30_evening
priority：70
topic：药堂结算
requires：
- quest.q04.result in ["player_owned", "medicine_hall_owned"]
excludes：
- world.village_closed == true
once：true
on_expire：none

[药堂家老]
“最终持有人已经登记为 `{nine_leaf_owner}`。自留者承担喂养和征集；上缴者领取元石、生机叶份额
和一次保命药。选择不会复制第二只九叶。”

[选择 A]
[玩家]
“九叶归我，我承担喂养与征集，领取自留登记。”

[判定]
none

[药堂家老]
“登记完成。每旬交一片生机叶，狼潮时按全寨标准征集。你保留剩余产出。”

[写入]
item.unique.GU_NINE_LEAF.owner = "player"
quest.q04.result = "player_owned"
player.knowledge.nine_leaf_upkeep = true
npc.medicine_elder.known_facts.player_owns_nine_leaf = true

[结束]
END

[选择 B]
[玩家]
“九叶交药堂，按约结算元石、生机叶份额和保命药。”

[判定]
none

[药堂家老]
“九叶归药堂。你得十二枚元石、三片生机叶和一份封脉保命药；以后不再承担喂养。”

[写入]
player.inventory -= "GU_NINE_LEAF"
item.unique.GU_NINE_LEAF.owner = "medicine_hall"
player.resources.primeval_stones += 12
player.inventory += "ITEM_LIFE_LEAF_3"
player.inventory += "ITEM_MEDICINE_PROTECTION"
item.unique.ITEM_MEDICINE_PROTECTION.owner = "player"
quest.q04.result = "medicine_hall_owned"

[结束]
END

## D_Q04_JIANG_YA_SETTLEMENT_01

类型：dialogue
ID：D_Q04_JIANG_YA_SETTLEMENT_01
所属：Q04
拥有者：npc.jiang_ya
地点：east_alley_market
available_from：D19_evening
expires_after：D24_evening
priority：70
topic：九叶交易
requires：
- quest.q04.result == "player_owned"
- item.unique.GU_NINE_LEAF.owner == "player"
- world.flags.q04_jiang_deal_unlocked == true
excludes：
- world.village_closed == true
once：true
on_expire：none

[江牙]
“所有权是真的，药堂印也齐。七十块元石仍有效。你现在卖，往后生机叶涨价也与你无关。”

[选择 A]
[玩家]
“按七十块成交，药堂登记你为新持有人。”

[判定]
none

[江牙]
“钱和转让页都在这里。蛊归我，你不再承担喂养，也不再分后续收益。”

[写入]
player.inventory -= "GU_NINE_LEAF"
player.resources.primeval_stones += 70
item.unique.GU_NINE_LEAF.owner = "npc.jiang_ya"
quest.q04.result = "jiang_ya_owned"
npc.jiang_ya.transactions.nine_leaf = true

[结束]
END

[选择 B]
[玩家]
“我不卖，九叶继续归我。”

[判定]
none

[江牙]
“可以。以后你来卖，价格重新谈，不沿用今天。”

[写入]
world.flags.q04_jiang_offer_closed = true

[结束]
END

## D_Q04_MEDICINE_ELDER_MISSED_01

类型：dialogue
ID：D_Q04_MEDICINE_ELDER_MISSED_01
所属：Q04
拥有者：npc.medicine_elder
地点：medicine_hall
available_from：D25_morning
expires_after：D30_evening
priority：70
topic：错过九叶
requires：
- quest.q04.result == "missed"
excludes：
- world.village_closed == true
once：true
on_expire：none

[药堂家老]
“第二十四日晚所有权窗口关闭。九叶按当时控制关系进入狼潮征集，玩家未形成有效主张。元石报酬、
保命药和个人持有路线全部关闭。”

[选择 A]
[玩家]
“记录最后持有人和关闭原因。”

[判定]
none

[药堂家老]
“最后持有人是 `{nine_leaf_owner}`，关闭原因是未在截止前完成证据、交易或转让。”

[写入]
player.knowledge.q04_final_owner = true
item.unique.GU_NINE_LEAF.owner = "{nine_leaf_owner}"

[结束]
END

[选择 B]
[玩家]
“按永久错过结算，不再重开。”

[判定]
none

[药堂家老]
“已经锁定。”

[写入]
world.flags.q04_miss_acknowledged = true

[结束]
END

## 系统到期结算

`D24_evening` 推进结束时：

```text
quest.q04.result == "none"
-> quest.q04.stage = "missed"
-> quest.q04.result = "missed"
-> item.unique.GU_NINE_LEAF.owner = 当时唯一合法控制者
```

所有路线最终只能写入 `player`、`medicine_hall`、`npc.jiang_ya`、`npc.uncle` 或
`missed_permanently` 中的一种所有权。Q04 结果不参与主线离山门槛。

`I_Q04_NINE_LEAF_GRASS_01` 的操作 C 只在 `world.flags.q04_theft_unlocked == true` 时显示；
未解锁时不允许通过直接选中文字绕过江牙提供的药圃时辰。
