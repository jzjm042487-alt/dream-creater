# Qing Mao MVP Stateful Dialogue Script Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 30-day visual-novel screenplay with a complete, player-centered Qing Mao Mountain MVP script made of conventional conditional NPC dialogue, object interactions, state barks, and permanently missable starter-village rewards.

**Architecture:** The rewrite is documentation-first. Each quest owns one focused Markdown file containing canonical `dialogue`, `interaction`, and `bark` records; a shared overview and state/reward index define cross-quest contracts. A small Node `node:test` suite validates record shape, forbidden presentation tags, required record IDs, Fang Yuan optionality, and file migration without changing the game runtime.

**Tech Stack:** Markdown, Node.js ESM, built-in `node:test`, built-in `node:assert`, Git.

---

## Authoritative Inputs

Read these before writing any production dialogue:

- `docs/superpowers/specs/2026-07-27-qing-mao-mvp-stateful-dialogue-script-design.md`
- `docs/game-design/qing-mao-mvp-script/README.md`
- `docs/game-design/qing-mao-mvp-script/01-main-days-00-10.md`
- `docs/game-design/qing-mao-mvp-script/02-main-days-11-20.md`
- `docs/game-design/qing-mao-mvp-script/03-main-days-21-30.md`
- `docs/game-design/qing-mao-mvp-script/04-side-quests-q01-q03.md`
- `docs/game-design/qing-mao-mvp-script/05-side-quests-q04-q05.md`
- `docs/game-design/qing-mao-mvp-script/06-repeatable-dialogue.md`
- `docs/game-design/gu-zhen-ren-tianwai-daojuben-gdd.md`

The 2026-07-27 spec is authoritative wherever older documents conflict. Older screenplay files are source material only:

- Preserve usable world facts, character motives, deadlines, item effects, and dialogue intent.
- Rewrite every retained exchange into the canonical record schema.
- Discard camera direction, action direction, narration, sound cues, forced daily scenes, source-sync scoring, rollback-centered plotting, and Fang Yuan protagonist treatment.

Do not modify the GDD, UI prototype, runtime, maps, save system, or unrelated tests in this plan.

## Target File Map

### Production Content

- Modify: `docs/game-design/qing-mao-mvp-script/README.md`
  - File index, canonical authoring rules, validation command, and supersession notice.
- Create: `docs/game-design/qing-mao-mvp-script/00-quest-overview.md`
  - Player mainline, five side-quest graph, system-only flows, record inventory, and walkthrough matrices.
- Create: `docs/game-design/qing-mao-mvp-script/01-main-quest.md`
  - Character entry, identity, awakening, academy standing, caravan opportunities, wolf crisis, and departure routes.
- Create: `docs/game-design/qing-mao-mvp-script/02-q01-wine-worm.md`
  - Wine Worm clue, investigation, ownership, refinement, optional Fang Yuan branch, success, loss, and expiry.
- Create: `docs/game-design/qing-mao-mvp-script/03-q02-flower-wine-inheritance.md`
  - Multiple entrance sources, inheritance chambers, claimants, depth rewards, collapse, and settlement.
- Create: `docs/game-design/qing-mao-mvp-script/04-q03-jia-jin-sheng-case.md`
  - Player-centered caravan contact, route selection, incident, evidence, Jia Fu/Tie Ruo Nan outcomes, and route rewards.
- Create: `docs/game-design/qing-mao-mvp-script/05-q04-nine-leaf-vitality-grass.md`
  - Ownership evidence, family/medicine-hall conflict, acquisition routes, final owner, and reward alternatives.
- Create: `docs/game-design/qing-mao-mvp-script/06-q05-qing-shu-fate.md`
  - Recruitment, evidence, preparations, final decision, Qing Shu outcomes, and survivor rewards.
- Create: `docs/game-design/qing-mao-mvp-script/07-npc-state-dialogue.md`
  - Post-result and ambient `bark` records for required NPC states.
- Create: `docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md`
  - NPC schedules, quest enums, deadlines, unique ownership, reward effects, and departure requirements.

### Content Validation

- Create: `tests/qingMaoDialogueScript.test.js`
  - File migration, canonical record fields, per-type body rules, unique IDs, required record inventory, forbidden tags, and no mandatory Fang Yuan dependency.

### Remove Only After All Replacement Content Has Passed Final Validation

- Delete: `docs/game-design/qing-mao-mvp-script/01-main-days-00-10.md`
- Delete: `docs/game-design/qing-mao-mvp-script/02-main-days-11-20.md`
- Delete: `docs/game-design/qing-mao-mvp-script/03-main-days-21-30.md`
- Delete: `docs/game-design/qing-mao-mvp-script/04-side-quests-q01-q03.md`
- Delete: `docs/game-design/qing-mao-mvp-script/05-side-quests-q04-q05.md`
- Delete: `docs/game-design/qing-mao-mvp-script/06-repeatable-dialogue.md`

## Shared Content Rules

Every implementation task must preserve these rules:

1. Use `apply_patch` for manual file edits.
2. Every `dialogue` has one NPC opening and one player-choice round only.
3. Every player choice contains `[玩家]`, `[判定]`, an NPC response, `[写入]`, and `END`.
4. Every `interaction` operation contains `[判定]`, `[事实结果]`, `[写入]`, and `END`.
5. Every `bark` contains one owner-valid line, `[写入]`, and `END`.
6. Use exact canonical headers and explicit `none`; never omit a field.
7. Dialogue can accept, reject, report, persuade, trade, or unlock an action. It cannot complete travel, searching, combat, tracking, theft, or refinement.
8. All follow-up choices require ending the current interaction and triggering a new record.
9. Fang Yuan uses ordinary NPC facts, owns no required mainline information, and is optional in every quest.
10. System-only character creation, time advance, expiry, departure confirmation, and automatic emergency flight are indexed but are not dialogue records.
11. Dates are inclusive. A date without a period defaults to morning through evening.
12. Do not stage or commit unrelated dirty-worktree changes.

## Task 1: Replace the File Layout and Add the Base Validator

**Files:**
- Create: `tests/qingMaoDialogueScript.test.js`
- Modify: `docs/game-design/qing-mao-mvp-script/README.md`
- Create: all nine target Markdown files listed above

- [ ] **Step 0: Record the rewrite base**

Before changing production content, run:

```powershell
git rev-parse HEAD
```

Record the returned SHA as `REWRITE_BASE` in the execution notes. Task 17 uses that exact SHA to check every
file changed across the full multi-commit rewrite, not only the final task's working-tree diff.

- [ ] **Step 1: Write the failing file-migration test**

Create `tests/qingMaoDialogueScript.test.js` with the repository paths, target set, legacy set, and parsing helpers:

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const scriptRoot = `${repoRoot}docs/game-design/qing-mao-mvp-script/`;

const targetFiles = [
  "README.md",
  "00-quest-overview.md",
  "01-main-quest.md",
  "02-q01-wine-worm.md",
  "03-q02-flower-wine-inheritance.md",
  "04-q03-jia-jin-sheng-case.md",
  "05-q04-nine-leaf-vitality-grass.md",
  "06-q05-qing-shu-fate.md",
  "07-npc-state-dialogue.md",
  "08-schedules-states-rewards.md",
];

const recordFiles = targetFiles.filter(
  (file) => /^(?:01|02|03|04|05|06|07)-/.test(file)
);

const legacyFiles = [
  "01-main-days-00-10.md",
  "02-main-days-11-20.md",
  "03-main-days-21-30.md",
  "04-side-quests-q01-q03.md",
  "05-side-quests-q04-q05.md",
  "06-repeatable-dialogue.md",
];

const requiredHeaders = [
  "类型",
  "ID",
  "所属",
  "拥有者",
  "地点",
  "available_from",
  "expires_after",
  "priority",
  "topic",
  "requires",
  "excludes",
  "once",
  "on_expire",
];

const allowedPriorities = new Set(["100", "80", "70", "60", "30", "10"]);
const requiredIdsByFile = new Map();

function readScript(file) {
  return readFileSync(`${scriptRoot}${file}`, "utf8");
}

function parseRecords(file) {
  const source = readScript(file);
  const matches = [...source.matchAll(/^## ([DIB]_[A-Z0-9_]+)\r?$/gm)];
  return matches.map((match, index) => ({
    id: match[1],
    file,
    text: source.slice(
      match.index,
      matches[index + 1]?.index ?? source.length
    ),
  }));
}

function fieldValue(record, label) {
  return record.text.match(new RegExp(`^${label}：([^\\r\\n]*)`, "m"))?.[1].trim();
}

function blocks(record, label) {
  return record.text
    .split(new RegExp(`^\\[${label} [A-Z]\\]\\r?$`, "m"))
    .slice(1);
}

test("provides every replacement Qing Mao script file", () => {
  for (const file of targetFiles) {
    assert.equal(existsSync(`${scriptRoot}${file}`), true, `${file} must exist`);
  }
});
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run:

```powershell
node --test tests/qingMaoDialogueScript.test.js
```

Expected: FAIL because the replacement files do not exist.

- [ ] **Step 3: Create the replacement files while retaining the six source files**

Use `apply_patch`. Give every new file an H1 title and a one-paragraph responsibility statement. Do not copy old scene bodies. Rewrite `README.md` to mark the old format superseded and link the 2026-07-27 spec.

Keep all six legacy screenplay files in place through Tasks 2–16 so every content task can consult them directly.
Task 17 deletes them only after all replacement files and walkthroughs are complete.

- [ ] **Step 4: Add canonical-shape validation**

Extend the test with:

```js
test("uses globally unique canonical record headers", () => {
  const records = recordFiles.flatMap(parseRecords);
  const seen = new Set();

  for (const record of records) {
    assert.equal(seen.has(record.id), false, `duplicate record ${record.id}`);
    seen.add(record.id);

    for (const header of requiredHeaders) {
      assert.match(record.text, new RegExp(`^${header}：`, "m"));
    }

    assert.equal(fieldValue(record, "ID"), record.id);
    assert.ok(allowedPriorities.has(fieldValue(record, "priority")));
    assert.match(fieldValue(record, "available_from"), /^D\\d{2}_(?:morning|noon|afternoon|evening)$/);
    assert.match(fieldValue(record, "expires_after"), /^D\\d{2}_(?:morning|noon|afternoon|evening)$/);
  }
});

test("keeps production records free of visual-novel directions and removed systems", () => {
  const source = recordFiles.map(readScript).join("\n");
  for (const forbidden of [
    "[镜头]",
    "[动作]",
    "[旁白]",
    "[音效]",
    "inline_next",
    "方源警觉",
    "方源敌意",
    "原作同步率",
    "source_sync",
    "npc.fang_yuan.alert",
  ]) {
    assert.equal(source.includes(forbidden), false, `${forbidden} must not appear`);
  }
});
```

Add per-type checks:

- `D_`: `类型=dialogue`, `拥有者` begins `npc.`, and 2–4 `[选择 X]` blocks.
- `I_`: `类型=interaction`, `拥有者` begins `object.`, and at least one `[操作 X]`.
- `B_`: no `[选择 X]` or `[操作 X]`; contains one speaker line, `[写入]`, `[结束]`, and `END`.
- `B_`: `类型=bark` and `拥有者` begins `npc.`.
- `所属` is one of `MAIN/Q01/Q02/Q03/Q04/Q05/GENERAL`.
- `once` is exactly `true` or `false`.
- `topic` is either exact `none` or non-empty text.
- `requires`, `excludes`, and `on_expire` are exact `none` on the same line or contain at least one `- ` list item before the next canonical header.
- No canonical header may be blank.

Use exactly two judgment grammars.

No-check dialogue choice:

```text
[判定]
none
[NPC owner]
...
[写入]
...
[结束]
END
```

Checked dialogue choice:

```text
[判定]
<formula and difficulty>
[成功]
[NPC owner]
...
[写入]
...
[结束]
END
[失败]
[NPC owner]
...
[写入]
...
[结束]
END
```

Interactions use the same grammar, replacing the NPC response under each outcome with `[事实结果]`. The validator
must reject a non-`none` check without exactly one `[成功]` and one `[失败]`, and reject `[成功]`/`[失败]` when
the check is `none`.

Allow files to contain zero records until their content task begins.

- [ ] **Step 5: Run the targeted test**

Run:

```powershell
node --test tests/qingMaoDialogueScript.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit the layout and validator**

```powershell
git add -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script
git commit -m "test(game): establish dialogue script content contract"
```

## Task 2: Write the Quest Overview and Shared State Foundation

**Files:**
- Modify: `tests/qingMaoDialogueScript.test.js`
- Modify: `docs/game-design/qing-mao-mvp-script/00-quest-overview.md`
- Modify: `docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md`

- [ ] **Step 1: Add failing overview/index assertions**

Assert that the overview names the mainline and Q01–Q05, states that Fang Yuan is optional, identifies the Day 30 emergency-flight exception, and contains a no-Fang-Yuan walkthrough row. Assert that the index declares all quest-stage enums and every core limited reward ID.

- [ ] **Step 2: Run the targeted test**

Expected: FAIL because the overview and index are still skeletons.

- [ ] **Step 3: Write `00-quest-overview.md`**

Include:

- The player-centered mainline stages.
- A compact Day 0–30 world calendar; dates open content but never auto-play dialogue.
- Q01–Q05 contact, investigation, decision, settlement, and expiry flow.
- Cross-quest links:
  - Q01 can reveal one Q02 entrance, but Q02 also has archive and field-investigation entrances.
  - Q03 route rewards can unlock departure options but cannot block the mainline.
  - Q04 healing resources and Q05 survivor support aid the crisis but are optional.
- System-only flows: character Roll, time advance, deadline settlement, departure confirmation, automatic emergency flight.
- A record-inventory table that will be filled by later tasks.
- Walkthrough rows for pure mainline, no Fang Yuan, all side quests missed, and all limited rewards.

- [ ] **Step 4: Write the initial shared state tables**

In `08-schedules-states-rewards.md`, declare exactly:

```text
quest.main.stage:
created / identity_registered / awakened / academy_active /
academy_established / route_preparing / wolf_crisis /
departure_open / departed

quest.main.departure_route:
none / clan / jia_caravan / black_market /
qing_shu_survivors / flower_wine / emergency

quest.q01.stage:
unavailable / rumored / smell_found / back_room_open /
trail_found / worm_found / refining / completed /
missed_tavern_window / lost

quest.q01.result:
none / player_acquired / clan_custody / other_acquired /
refused / missed

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

quest.q03.evidence_flags:
unregistered_crate / road_trace / witness_statement /
trade_record / player_contradiction

quest.q03.investigation_result:
none / cleared / doubtful / pursuit

quest.q03.result:
none / legal / black_market / observer / failed / refused / missed

quest.q04.stage:
unavailable / ownership_rumored / evidence_gathering /
claim_selected / ownership_contested / settled / missed

quest.q04.route:
none / lawful_claim / trade / theft / surrender / observer / refused

quest.q04.evidence_flags:
parent_ledger / custody_record / he_niang_testimony

quest.q04.result:
none / player_owned / medicine_hall_owned / jiang_ya_owned /
family_owned / failed / refused / missed

quest.q05.stage:
unavailable / recruited / evidence_gathering / warning_ready /
departure_pending / resolved / missed

quest.q05.evidence_flags:
wolf_route / survivor_report / ice_trace / battle_observation

quest.q05.preparation_flags:
medicine_supply / armory_gear / retreat_markers / team_signal

quest.q05.evidence_family_count:
0 / 1 / 2

quest.q05.preparation_count:
0 / 1 / 2 / 3 / 4

quest.q05.intent:
none / stable_rescue / costly_rescue / replace /
withdraw / refuse

quest.q05.operation_result:
not_started / success / partial / failure

quest.q05.casualties:
0 / 1 / 2

quest.q05.result:
none / saved_stable / saved_costly / replaced /
dead / withdrew / refused / missed
```

Every record and walkthrough must use the full `quest.<id>.<field>` key. Do not introduce shorthand such as
`main.stage` or `q01.stage`.

Add the canonical generic NPC relationship states:

```text
stranger / normal / cooperative / conflict
```

Declare the non-quest state schema and allowed value types used by production records:

```text
world.day: integer 0..30
world.period: morning / noon / afternoon / evening
world.departure_open: true / false
world.village_closed: true / false
world.flags.<id>: true / false

player.attributes.<id>: integer
player.traits.<id>: true / false
player.inventory: set of ITEM_IDS
player.knowledge.<id>: true / false

npc.<id>.alive: true / false
npc.<id>.met_player: true / false
npc.<id>.relationship_state: stranger / normal / cooperative / conflict
npc.<id>.known_facts.<id>: true / false
npc.<id>.transactions.<id>: true / false
npc.<id>.direct_conflicts.<id>: true / false

item.unique.<item_id>.owner:
none / player / clan / medicine_hall / lost /
missed_permanently / npc.<id> / object.<id>

operation.q05_rescue:
locked / ready / running / settled / skipped
```

Exact mainline departure transitions are:

```text
D30_morning when quest.main.stage != departed:
quest.main.stage = departure_open
world.departure_open = true

confirmed departure interaction:
quest.main.departure_route = <selected route>
quest.main.stage = departed
world.village_closed = true

advance past D30_evening without confirmation:
quest.main.departure_route = emergency
quest.main.stage = departed
world.village_closed = true
```

Add the initial deadline table:

- Q01: through `D10_evening`
- Q02: through `D25_evening`
- Q03 initial settlement: `D15_evening`; final consequence: `D27_evening`
- Q04: through `D24_evening`
- Q05: through `D25_evening`
- Departure choice: through `D30_evening`

- [ ] **Step 5: Add the limited-reward registry**

Register owner, source, last window, immediate effect, midgame effect, and upkeep/route cost for:

```text
GU_WINE_WORM
GU_WHITE_BOAR
GU_JADE_SKIN
GU_HIDDEN_STONE
ITEM_FLOWER_WINE_MAP
GU_MUDSKIN_TOAD
GU_RED_IRON_RELIC
ITEM_JIA_PASS
GU_SLEEVE_POUCH
ITEM_BLACK_LEDGER
GU_NINE_LEAF
ITEM_MEDICINE_PROTECTION
ITEM_QING_SHU_TOKEN
ITEM_GREEN_VINE_CHARM
ITEM_QING_SHU_SUPPORT
ITEM_CLAN_HISTORY_RECORD
```

- [ ] **Step 6: Run the targeted test and commit**

```powershell
node --test tests/qingMaoDialogueScript.test.js
git add -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script/00-quest-overview.md docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md
git commit -m "docs(game): define dialogue quest and state foundation"
```

Expected: PASS before commit.

## Task 3: Write Mainline Identity, Awakening, and Academy Nodes

**Files:**
- Modify: `tests/qingMaoDialogueScript.test.js`
- Modify: `docs/game-design/qing-mao-mvp-script/01-main-quest.md`
- Modify: `docs/game-design/qing-mao-mvp-script/00-quest-overview.md`

- [ ] **Step 1: Add the required early-mainline IDs to the test**

Require:

```text
D_MAIN_CLAN_STEWARD_01
D_MAIN_OLD_CONTACT_01
D_MAIN_ACADEMY_ELDER_01
D_MAIN_ACADEMY_ELDER_02
D_MAIN_INSTRUCTOR_01
I_MAIN_MOONLIGHT_REFINING_01
D_MAIN_INSTRUCTOR_02
D_MAIN_ACADEMY_ELDER_03
```

- [ ] **Step 2: Run the test**

Expected: FAIL listing the missing IDs.

- [ ] **Step 3: Write the system-only character entry**

At the top of `01-main-quest.md`, document without a narrative record:

- Name input.
- Fixed male portrait/Q character.
- One generated attribute, aptitude, talent, flaw, and destiny set.
- Confirm/reroll behavior.
- Initial state write `quest.main.stage=created`.
- No appearance customization.

- [ ] **Step 4: Write identity and awakening dialogues**

Write complete nodes for:

- Clan steward registration and branch-family obligations.
- Seeded old contact confirming one memory detail without treating the player as a suspected impostor by default.
- Academy elder attendance and opening result.
- Academy elder response variants based on randomized aptitude.

Player options must express worldly explanations. No player line may mention a novel, script, or game.

- [ ] **Step 5: Write starter-Gu and academy-standing records**

Write:

- Instructor explanation of starter resources.
- Moonlight Gu refinement as an `interaction`, with separate attempts and factual results.
- Instructor response to success/failure.
- Academy elder assessment with success, partial standing, and low-standing continuation. Failure may reduce rewards but never block `quest.main.stage=academy_established`.

- [ ] **Step 6: Add an early-mainline trace**

In `00-quest-overview.md`, trace:

```text
created
→ identity_registered
→ awakened
→ academy_active
→ academy_established
```

Show that no transition reads `npc.fang_yuan`.

- [ ] **Step 7: Run and commit**

```powershell
node --test tests/qingMaoDialogueScript.test.js
git add -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script/01-main-quest.md docs/game-design/qing-mao-mvp-script/00-quest-overview.md
git commit -m "docs(game): write player identity and academy mainline"
```

## Task 4: Write Mainline Caravan and Build-Preparation Nodes

**Files:**
- Modify: `tests/qingMaoDialogueScript.test.js`
- Modify: `docs/game-design/qing-mao-mvp-script/01-main-quest.md`
- Modify: `docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md`

- [ ] **Step 1: Add the required mid-mainline IDs**

```text
D_MAIN_CARAVAN_ACCOUNTANT_01
I_MAIN_PURPLE_GOLD_STONE_01
D_MAIN_CARAVAN_MERCHANT_01
D_MAIN_CARAVAN_MERCHANT_02
D_MAIN_ACADEMY_ELDER_04
```

- [ ] **Step 2: Run the test**

Expected: FAIL with the five missing records.

- [ ] **Step 3: Write the caravan identity conversation**

The accountant explains legal travel papers and work requirements. Options may ask for price, offer labor, present a Q03 result, or decline. This node introduces routes but does not grant a pass without its actual conditions.

- [ ] **Step 4: Write the two hidden caravan rewards**

Write:

- `I_MAIN_PURPLE_GOLD_STONE_01` for inspecting/purchasing the one stone that can contain `GU_MUDSKIN_TOAD`.
- `D_MAIN_CARAVAN_MERCHANT_01` for sale/retention consequences.
- `D_MAIN_CARAVAN_MERCHANT_02` for the final `GU_RED_IRON_RELIC` purchase window.

Each unique item transfer updates one owner only. Wealth cannot buy task trust, evidence, or missed limited rewards.

- [ ] **Step 5: Write the academy build-preparation conversation**

The academy elder offers ordinary field duty, guarded clan work, or independent preparation. All choices advance `quest.main.stage=route_preparing`; they change starting resources and available contacts, not mainline reachability.

- [ ] **Step 6: Update schedules and run tests**

Add caravan arrival/departure and merchant availability to `08-schedules-states-rewards.md`.

```powershell
node --test tests/qingMaoDialogueScript.test.js
```

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script/01-main-quest.md docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md
git commit -m "docs(game): write caravan and build preparation mainline"
```

## Task 5: Write Mainline Wolf Crisis and Permanent Departure

**Files:**
- Modify: `tests/qingMaoDialogueScript.test.js`
- Modify: `docs/game-design/qing-mao-mvp-script/01-main-quest.md`
- Modify: `docs/game-design/qing-mao-mvp-script/00-quest-overview.md`
- Modify: `docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md`

- [ ] **Step 1: Add the required late-mainline IDs**

```text
D_MAIN_VILLAGE_GUARD_01
D_MAIN_CLAN_STEWARD_02
D_MAIN_CARAVAN_ACCOUNTANT_02
D_MAIN_BLACK_MARKET_BROKER_01
D_MAIN_QING_SHU_DEPUTY_01
I_MAIN_FLOWER_WINE_EXIT_01
I_MAIN_EMERGENCY_EXIT_01
```

- [ ] **Step 2: Add the no-mandatory-Fang assertion**

For every record in `01-main-quest.md`, extract the text between `requires：` and `excludes：` and assert it does not contain `fang_yuan`.

- [ ] **Step 3: Run the test**

Expected: FAIL on missing records.

- [ ] **Step 4: Write the wolf-crisis transition**

The village guard reports access restrictions and available duties. The dialogue may unlock combat or evacuation interactions but cannot auto-complete battles or relocation.

- [ ] **Step 5: Write departure contacts**

Write distinct route offers:

- Clan evacuation contact based on mainline standing.
- Jia caravan contact based on `ITEM_JIA_PASS`.
- Black-market broker based on `ITEM_BLACK_LEDGER`.
- Qing Shu survivor contact based on valid survivor support.
- Flower Wine exit object based on `ITEM_FLOWER_WINE_MAP`.
- Manual emergency exit available without side-quest success.

Each route ends at a system confirmation, not another dialogue chain. The source record only opens that
confirmation; accepting it writes the exact route and closes the village:

```text
confirmation opened by D_MAIN_CLAN_STEWARD_02
-> quest.main.departure_route = clan

confirmation opened by D_MAIN_CARAVAN_ACCOUNTANT_02
-> quest.main.departure_route = jia_caravan

confirmation opened by D_MAIN_BLACK_MARKET_BROKER_01
-> quest.main.departure_route = black_market

confirmation opened by D_MAIN_QING_SHU_DEPUTY_01
-> quest.main.departure_route = qing_shu_survivors

confirmation opened by I_MAIN_FLOWER_WINE_EXIT_01
-> quest.main.departure_route = flower_wine

confirmation opened by I_MAIN_EMERGENCY_EXIT_01
-> quest.main.departure_route = emergency

Every confirmed route also writes:
quest.main.stage = departed
world.village_closed = true
```

- [ ] **Step 6: Write the Day 30 system settlement**

In overview/index form, define:

- `world.departure_open=true` at `D30_morning`.
- Known and unknown missing-limited-item display.
- Confirmation writes `world.village_closed=true`.
- Advancing past `D30_evening` without confirmation chooses emergency flight and closes the village with no forced dialogue.

- [ ] **Step 7: Trace the pure-mainline and no-Fang routes**

Both traces must reach `quest.main.stage=departed`.

- [ ] **Step 8: Run and commit**

```powershell
node --test tests/qingMaoDialogueScript.test.js
git add -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script/00-quest-overview.md docs/game-design/qing-mao-mvp-script/01-main-quest.md docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md
git commit -m "docs(game): write wolf crisis and departure mainline"
```

## Task 6: Write Q01 `Moonlit Wine Worm`

**Files:**
- Modify: `tests/qingMaoDialogueScript.test.js`
- Modify: `docs/game-design/qing-mao-mvp-script/02-q01-wine-worm.md`
- Modify: `docs/game-design/qing-mao-mvp-script/00-quest-overview.md`
- Modify: `docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md`

- [ ] **Step 1: Require the Q01 record inventory**

```text
D_Q01_TAVERN_KEEPER_01
D_Q01_TAVERN_KEEPER_02
I_Q01_BACK_ROOM_JAR_01
I_Q01_WINE_SCENT_TRAIL_01
D_Q01_HELPER_01
I_Q01_WINE_WORM_01
I_Q01_DORM_REFINING_01
D_Q01_CLAN_STOREKEEPER_01
D_Q01_FANG_YUAN_01
D_Q01_TAVERN_KEEPER_RESULT_PLAYER_01
D_Q01_TAVERN_KEEPER_RESULT_OTHER_01
D_Q01_TAVERN_KEEPER_RESULT_REFUSED_01
D_Q01_TAVERN_KEEPER_RESULT_MISSED_01
```

- [ ] **Step 2: Run the test**

Expected: FAIL listing Q01 IDs.

- [ ] **Step 3: Write clue and investigation records**

The tavern keeper provides a commercial problem, not a prophecy. The helper offers a secondary clue. The jar and scent trail are object interactions. Refusing or leaving does not consume the whole quest unless the deadline passes.

- [ ] **Step 4: Write ownership and refinement records**

`I_Q01_WINE_WORM_01` handles only finding and attempting to secure the wild Gu. `I_Q01_DORM_REFINING_01` separately handles refinement. Define:

- Player acquires and refines.
- Clan store takes custody.
- Another ordinary NPC acquires it.
- Player misses the window.

- [ ] **Step 5: Write the optional Fang Yuan branch**

`D_Q01_FANG_YUAN_01` is valid only when normal item ownership and known-fact conditions put him in possession. It offers trade, withdrawal, or direct conflict preparation. It cannot be required for Q01 success, Q02 entry, or the mainline.

- [ ] **Step 6: Write all tavern-keeper result conversations**

Success, other owner/failure, explicit refusal, and missed results each get a priority-70 one-time response and
concrete state writes.

- [ ] **Step 7: Trace success, loss, and no-Fang success**

Update overview/index with owner transitions and the `D10_evening` expiry owner.

- [ ] **Step 8: Run and commit**

```powershell
node --test tests/qingMaoDialogueScript.test.js
git add -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script/00-quest-overview.md docs/game-design/qing-mao-mvp-script/02-q01-wine-worm.md docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md
git commit -m "docs(game): write conditional Wine Worm quest"
```

## Task 7: Write Q02 Entrances, Shadow Wall, and Claimants

**Files:**
- Modify: `tests/qingMaoDialogueScript.test.js`
- Modify: `docs/game-design/qing-mao-mvp-script/03-q02-flower-wine-inheritance.md`
- Modify: `docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md`

- [ ] **Step 1: Require the Q02 entrance inventory**

```text
D_Q02_ACADEMY_ELDER_01
I_Q02_CLAN_ARCHIVE_01
I_Q02_WINE_TRAIL_ENTRY_01
I_Q02_MOUNTAIN_CRACK_01
I_Q02_SHADOW_WALL_01
D_Q02_CLAN_STEWARD_CLAIM_01
D_Q02_QING_SHU_CLAIM_01
D_Q02_FANG_YUAN_CLAIM_01
```

- [ ] **Step 2: Run the test**

Expected: FAIL listing Q02 entrance IDs.

- [ ] **Step 3: Write three independent entrance sources**

Implement:

- Q01 wine-scent trail.
- Clan archive research after speaking to the academy elder.
- Direct field discovery at the mountain crack.

Any one can set `quest.q02.stage=entry_known`. The archive and field routes must work without meeting Fang Yuan.

- [ ] **Step 4: Write the shadow-wall interaction**

Operations separately cover recording clan history, recording only mechanisms, leaving it intact, or damaging it. `ITEM_CLAN_HISTORY_RECORD` transfers once and changes only NPCs who later learn about it.

- [ ] **Step 5: Write claimant conversations**

The clan steward and Qing Shu use family-duty logic. Fang Yuan appears only if his schedule, knowledge, and objective overlap. Every claimant conversation unlocks a later world action or settlement; none auto-loots a chamber.

- [ ] **Step 6: Add schedules and run tests**

```powershell
node --test tests/qingMaoDialogueScript.test.js
```

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script/03-q02-flower-wine-inheritance.md docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md
git commit -m "docs(game): write Flower Wine inheritance entrances"
```

## Task 8: Write Q02 Chambers, Depth Rewards, and Collapse

**Files:**
- Modify: `tests/qingMaoDialogueScript.test.js`
- Modify: `docs/game-design/qing-mao-mvp-script/03-q02-flower-wine-inheritance.md`
- Modify: `docs/game-design/qing-mao-mvp-script/00-quest-overview.md`
- Modify: `docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md`

- [ ] **Step 1: Require the Q02 chamber inventory**

```text
I_Q02_EARTH_FLOWER_01
I_Q02_WHITE_BOAR_TRAINING_01
I_Q02_STRENGTH_GATE_01
I_Q02_JADE_CHAMBER_01
I_Q02_HIDDEN_CHAMBER_01
I_Q02_SECRET_MAP_01
D_Q02_CLAN_STEWARD_SETTLEMENT_01
D_Q02_ACADEMY_ELDER_RESULT_01
D_Q02_ACADEMY_ELDER_FAILED_01
D_Q02_ACADEMY_ELDER_REFUSED_01
D_Q02_ACADEMY_ELDER_MISSED_01
```

- [ ] **Step 2: Run the test**

Expected: FAIL listing chamber IDs.

- [ ] **Step 3: Write each chamber as a separate interaction**

No chamber result is delivered through dialogue. Each operation has its own cost, fact result, item owner write, and exit.

- [ ] **Step 4: Enforce reward depth**

Document and implement in state writes:

- Normal completion: one core Gu.
- Prepared route: two core Gu.
- Deep/high-cost route: three core Gu plus the complete map.

Do not infer depth from inventory. Write `quest.q02.depth=1/2/3` and validate each reward against it.

- [ ] **Step 5: Write settlement and missed conversations**

The clan steward settles disclosure/ownership. The academy elder separately responds to success, attempted-but-failed
exploration, explicit refusal/abandonment, and an untouched missed window. Collapse at `D25_evening` closes unclaimed
items and opens the appropriate failure or missed response.

- [ ] **Step 6: Trace one-, two-, and three-depth routes**

Show unique owner transitions for `GU_WHITE_BOAR`, `GU_JADE_SKIN`, `GU_HIDDEN_STONE`, and `ITEM_FLOWER_WINE_MAP`.

- [ ] **Step 7: Run and commit**

```powershell
node --test tests/qingMaoDialogueScript.test.js
git add -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script/00-quest-overview.md docs/game-design/qing-mao-mvp-script/03-q02-flower-wine-inheritance.md docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md
git commit -m "docs(game): write Flower Wine inheritance rewards"
```

## Task 9: Write Q03 Caravan Contact and Route Selection

**Files:**
- Modify: `tests/qingMaoDialogueScript.test.js`
- Modify: `docs/game-design/qing-mao-mvp-script/04-q03-jia-jin-sheng-case.md`
- Modify: `docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md`

- [ ] **Step 1: Require the Q03 contact inventory**

```text
D_Q03_JIA_JIN_SHENG_01
D_Q03_CARAVAN_ACCOUNTANT_01
D_Q03_JIA_JIN_SHENG_02
I_Q03_UNREGISTERED_CRATE_01
D_Q03_JIA_JIN_SHENG_03
D_Q03_CARAVAN_GUARD_01
I_Q03_MOUNTAIN_ROAD_01
```

- [ ] **Step 2: Run the test**

Expected: FAIL listing contact IDs.

- [ ] **Step 3: Write primary and fallback contacts**

Jia Jin Sheng offers a personal deal. The accountant offers a more expensive legal fallback if Jia Jin Sheng is absent or refused. Both center the player's desired identity and profit, not Fang Yuan's original plot.

- [ ] **Step 4: Write route choices**

Support:

```text
legal / black_market / observer / refused
```

The unregistered crate is a separate object interaction. The guard offers protection preparation. The mountain-road interaction chooses an approach but does not auto-resolve combat or a death.

- [ ] **Step 5: Write warning responses**

Jia Jin Sheng reacts according to the concrete evidence shown and his current relationship state. “You will die” without evidence does not force compliance.

- [ ] **Step 6: Update caravan schedules, run, and commit**

```powershell
node --test tests/qingMaoDialogueScript.test.js
git add -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script/04-q03-jia-jin-sheng-case.md docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md
git commit -m "docs(game): write Jia Jin Sheng caravan routes"
```

## Task 10: Write Q03 Incident, Investigation, and Route Rewards

**Files:**
- Modify: `tests/qingMaoDialogueScript.test.js`
- Modify: `docs/game-design/qing-mao-mvp-script/04-q03-jia-jin-sheng-case.md`
- Modify: `docs/game-design/qing-mao-mvp-script/00-quest-overview.md`
- Modify: `docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md`

- [ ] **Step 1: Require the Q03 investigation inventory**

```text
I_Q03_CRIME_SCENE_01
D_Q03_WITNESS_01
D_Q03_JIA_FU_01
D_Q03_JIA_FU_02
D_Q03_TIE_RUO_NAN_01
D_Q03_TIE_RUO_NAN_02
D_Q03_JIA_FU_REWARD_LEGAL_01
D_Q03_BLACK_MARKET_BROKER_REWARD_01
D_Q03_JIA_FU_FAILED_01
D_Q03_JIA_FU_REFUSED_01
D_Q03_JIA_FU_MISSED_01
```

- [ ] **Step 2: Run the test**

Expected: FAIL listing investigation IDs.

- [ ] **Step 3: Write incident-state variants**

The crime scene and witness records read whether Jia Jin Sheng is alive, missing, dead, or disgraced. They only reveal evidence the player actually examines.

- [ ] **Step 4: Write Jia Fu questioning**

Every player answer is a complete statement. Real evidence, partial disclosure, supported accusation, refusal, and attempted deception receive distinct replies and writes.

- [ ] **Step 5: Write Tie Ruo Nan follow-up**

She checks timeline, source, and contradiction facts. Do not use a generic hostility score. Her final state is cleared, doubtful, or pursuit-marked.

- [ ] **Step 6: Write mutually exclusive rewards**

Legal route can issue `ITEM_JIA_PASS`. Black-market route can issue `GU_SLEEVE_POUCH` and `ITEM_BLACK_LEDGER`.
One reward family closes the other. A failed investigation, an explicit refusal to participate, and a missed deadline
each receive separate priority-70 endpoints.

- [ ] **Step 7: Trace legal, black-market, refusal, and missed routes**

Show that all routes return to the mainline and that no case step requires speaking to Fang Yuan.

- [ ] **Step 8: Run and commit**

```powershell
node --test tests/qingMaoDialogueScript.test.js
git add -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script/00-quest-overview.md docs/game-design/qing-mao-mvp-script/04-q03-jia-jin-sheng-case.md docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md
git commit -m "docs(game): write Jia Jin Sheng case outcomes"
```

## Task 11: Write Q04 Ownership Evidence and Competing Claims

**Files:**
- Modify: `tests/qingMaoDialogueScript.test.js`
- Modify: `docs/game-design/qing-mao-mvp-script/05-q04-nine-leaf-vitality-grass.md`
- Modify: `docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md`

- [ ] **Step 1: Require the Q04 evidence inventory**

```text
D_Q04_HE_NIANG_01
D_Q04_UNCLE_01
D_Q04_AUNT_01
I_Q04_PARENT_LEDGER_01
I_Q04_CUSTODY_RECORD_01
D_Q04_MEDICINE_ELDER_01
D_Q04_JIANG_YA_01
D_Q04_HE_NIANG_02
```

- [ ] **Step 2: Run the test**

Expected: FAIL listing Q04 evidence IDs.

- [ ] **Step 3: Write family ownership conversations**

The uncle and aunt justify possession through care costs, clan procedure, and control of the estate. Give the player lawful claim, trade, delay, and refusal lines. Do not turn them into exposition devices.

- [ ] **Step 4: Write documentary interactions**

The parent ledger and custody record separately establish source, transfer, and current control. Looking at one does not grant facts from the other.

- [ ] **Step 5: Write medicine-hall and Jiang Ya offers**

The medicine elder offers institutional protection at the cost of ownership. Jiang Ya offers liquidity and concealment at a different cost. Dialogue unlocks acquisition/transfer actions but does not perform theft.

- [ ] **Step 6: Write He Niang's testimony**

Her answer depends on the player's debt and which document she has seen. She does not take large risks without payment or a concrete reason.

- [ ] **Step 7: Run and commit**

```powershell
node --test tests/qingMaoDialogueScript.test.js
git add -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script/05-q04-nine-leaf-vitality-grass.md docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md
git commit -m "docs(game): write Nine Leaf ownership conflict"
```

## Task 12: Write Q04 Acquisition, Final Owner, and Rewards

**Files:**
- Modify: `tests/qingMaoDialogueScript.test.js`
- Modify: `docs/game-design/qing-mao-mvp-script/05-q04-nine-leaf-vitality-grass.md`
- Modify: `docs/game-design/qing-mao-mvp-script/00-quest-overview.md`
- Modify: `docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md`

- [ ] **Step 1: Require the Q04 settlement inventory**

```text
I_Q04_NINE_LEAF_GRASS_01
D_Q04_UNCLE_RESULT_FAILED_01
D_Q04_UNCLE_RESULT_REFUSED_01
D_Q04_MEDICINE_ELDER_SETTLEMENT_01
D_Q04_JIANG_YA_SETTLEMENT_01
D_Q04_MEDICINE_ELDER_MISSED_01
```

- [ ] **Step 2: Run the test**

Expected: FAIL listing settlement IDs.

- [ ] **Step 3: Write the ownership interaction**

Operations cover a supported claim, agreed purchase, unlocked theft attempt, surrender, and leave. Each operation separately writes owner/result; dialogue alone never marks theft successful.

- [ ] **Step 4: Write settlement conversations**

Cover:

- Player retains `GU_NINE_LEAF`.
- Medicine hall receives it and grants merit, leaves, and `ITEM_MEDICINE_PROTECTION`.
- Jiang Ya receives it through a valid deal.
- Family retains it after a failed claim.
- Player explicitly refuses/abandons the claim.
- Deadline passes with no valid claim.

- [ ] **Step 5: Trace final-owner routes**

Every route has exactly one owner and a result bark target. Q04 failure cannot block mainline departure.

- [ ] **Step 6: Run and commit**

```powershell
node --test tests/qingMaoDialogueScript.test.js
git add -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script/00-quest-overview.md docs/game-design/qing-mao-mvp-script/05-q04-nine-leaf-vitality-grass.md docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md
git commit -m "docs(game): write Nine Leaf quest settlements"
```

## Task 13: Write Q05 Evidence and Retreat Preparation

**Files:**
- Modify: `tests/qingMaoDialogueScript.test.js`
- Modify: `docs/game-design/qing-mao-mvp-script/06-q05-qing-shu-fate.md`
- Modify: `docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md`

- [ ] **Step 1: Require the Q05 preparation inventory**

```text
D_Q05_QING_SHU_01
D_Q05_QING_SHU_DEPUTY_01
I_Q05_WOLF_ROUTE_01
D_Q05_SCOUT_SURVIVOR_01
I_Q05_ICE_TRACE_01
D_Q05_BAI_NING_BING_01
D_Q05_QING_SHU_02
D_Q05_QING_SHU_DEPUTY_02
D_Q05_MEDICINE_ELDER_01
D_Q05_ARMORY_KEEPER_01
I_Q05_RETREAT_MARKERS_01
```

- [ ] **Step 2: Run the test**

Expected: FAIL listing preparation IDs.

- [ ] **Step 3: Write recruitment and fallback**

Qing Shu recruits based on ordinary field needs. His deputy can open the same evidence work if Qing Shu is unavailable. Neither route requires the player to mention future knowledge.

- [ ] **Step 4: Write two independent evidence families**

Evidence family one comes from wolf routes/survivor reports. Evidence family two comes from ice traces, battle observations, or an optional Bai Ning Bing conversation. The Bai conversation is never mandatory.

- [ ] **Step 5: Write both evidence-report paths**

Qing Shu accepts action only when two evidence families are present. A bare warning produces a respectful refusal and leaves investigation open.

`D_Q05_QING_SHU_DEPUTY_02` performs the same evidence gate when Qing Shu is unavailable and advances the team
to `quest.q05.stage=warning_ready`; it cannot issue Qing Shu's personal token or speak on his behalf.

- [ ] **Step 6: Write preparation sources**

Medicine supplies, armory access, and retreat markers are separate. At least two preparation flags are required for stable rescue. Dialogue can grant permission or goods but cannot mark field placement complete.

- [ ] **Step 7: Run and commit**

```powershell
node --test tests/qingMaoDialogueScript.test.js
git add -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script/06-q05-qing-shu-fate.md docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md
git commit -m "docs(game): write Qing Shu evidence and preparation"
```

## Task 14: Write Q05 Final Decision and Qing Shu Outcomes

**Files:**
- Modify: `tests/qingMaoDialogueScript.test.js`
- Modify: `docs/game-design/qing-mao-mvp-script/06-q05-qing-shu-fate.md`
- Modify: `docs/game-design/qing-mao-mvp-script/00-quest-overview.md`
- Modify: `docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md`

- [ ] **Step 1: Require the Q05 outcome inventory**

```text
D_Q05_QING_SHU_03
D_Q05_QING_SHU_DEPUTY_03
D_Q05_QING_SHU_RESULT_SAVED_01
D_Q05_QING_SHU_RESULT_COSTLY_01
D_Q05_QING_SHU_RESULT_REPLACED_01
D_Q05_QING_SHU_RESULT_WITHDREW_01
D_Q05_QING_SHU_DEPUTY_RESULT_DEAD_01
D_Q05_QING_SHU_RESULT_REFUSED_01
D_Q05_QING_SHU_DEPUTY_MISSED_01
```

- [ ] **Step 2: Run the test**

Expected: FAIL listing outcome IDs.

- [ ] **Step 3: Write both final-decision contacts**

Offer stable rescue, costly rescue, player replacement, withdrawal, and refusal only when their concrete
conditions apply. Stable rescue, costly rescue, and replacement write `operation.q05_rescue=ready`; combat/escape
systems later write their operation results. Withdrawal and refusal are immediate terminal decisions and never
start the operation. Stable rescue specifically requires two evidence families and at least two preparations;
the validator rejects `quest.q05.intent=stable_rescue` without both counts.

`D_Q05_QING_SHU_DEPUTY_03` offers the same team-level choices when Qing Shu is unavailable before departure,
but excludes outcomes that require Qing Shu to personally authorize them.

- [ ] **Step 4: Define the Markdown-level rescue operation contract**

In `06-q05-qing-shu-fate.md`, add a non-dialogue contract named `operation.q05_rescue`:

```text
Inputs:
- quest.q05.intent
- quest.q05.evidence_flags
- quest.q05.preparation_flags
- player combat/resource state
- npc.qing_shu.alive

Outputs:
- operation.q05_rescue = running / settled
- quest.q05.operation_result = success / partial / failure
- npc.qing_shu.alive = true / false
- quest.q05.casualties = 0 / 1 / 2
- consumed preparation item IDs

Transitions:
- stable_rescue / costly_rescue / replace selected
  -> operation.q05_rescue = ready
  -> quest.q05.stage = departure_pending
- operation begins
  -> operation.q05_rescue = running
- success + stable_rescue + two evidence families + two preparations
  -> quest.q05.result = saved_stable
- partial + stable_rescue + npc.qing_shu.alive = true
  -> quest.q05.result = saved_costly
- success/partial + costly_rescue + npc.qing_shu.alive = true
  -> quest.q05.result = saved_costly
- success/partial + replace + npc.qing_shu.alive = true
  -> quest.q05.result = replaced
- failure or npc.qing_shu.alive = false
  -> quest.q05.result = dead
- every operation result above
  -> operation.q05_rescue = settled
  -> quest.q05.stage = resolved
- withdraw selected
  -> operation.q05_rescue = skipped
  -> quest.q05.operation_result = not_started
  -> quest.q05.result = withdrew
  -> quest.q05.stage = resolved
- refuse selected
  -> operation.q05_rescue = skipped
  -> quest.q05.operation_result = not_started
  -> quest.q05.result = refused
  -> quest.q05.stage = resolved
```

Evaluate `failure or npc.qing_shu.alive=false -> dead` before the surviving outcome rules. The validator must
enumerate every allowed intent/result/alive combination and assert that exactly one terminal result applies;
no `partial` or `success` combination may leave `quest.q05.result=none`.

The contract documents the future gameplay handoff; this plan does not implement combat code.

- [ ] **Step 5: Write result conversations**

Cover:

```text
saved_stable / saved_costly / replaced / withdrew / dead / refused / missed
```

Map `replaced` to `D_Q05_QING_SHU_RESULT_REPLACED_01` and `withdrew` to
`D_Q05_QING_SHU_RESULT_WITHDREW_01`. Qing Shu speaks only when alive. His deputy reports death/missing outcomes.

- [ ] **Step 6: Write rewards**

- Non-betrayal can grant `ITEM_QING_SHU_TOKEN`.
- Stable rescue can grant one `ITEM_GREEN_VINE_CHARM`.
- Sufficient preparation can grant `ITEM_QING_SHU_SUPPORT`.
- Never issue the same unique reward twice.

- [ ] **Step 7: Remove old rollback dependence**

Do not recreate Q05's old rollback-correction scene. The quest result is based on evidence, preparation, choice, and field-operation result.

- [ ] **Step 8: Trace all Q05 outcomes**

Include stable rescue, costly rescue, replacement, withdrawal, death, refusal, missed, and no-Bai-conversation
routes. Every trace must show `quest.q05.stage=resolved` or `quest.q05.stage=missed`.

- [ ] **Step 9: Run and commit**

```powershell
node --test tests/qingMaoDialogueScript.test.js
git add -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script/00-quest-overview.md docs/game-design/qing-mao-mvp-script/06-q05-qing-shu-fate.md docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md
git commit -m "docs(game): write Qing Shu fate outcomes"
```

## Task 15: Write Mainline, Q01, Q02, and Q04 State Barks

**Files:**
- Modify: `tests/qingMaoDialogueScript.test.js`
- Modify: `docs/game-design/qing-mao-mvp-script/07-npc-state-dialogue.md`

- [ ] **Step 1: Require the first bark inventory**

```text
B_CLAN_STEWARD_MAIN_ACTIVE_01
B_CLAN_STEWARD_MAIN_COMPLETE_01
B_ACADEMY_ELDER_MAIN_HIGH_01
B_ACADEMY_ELDER_MAIN_LOW_01
B_FANG_ZHENG_AMBIENT_01
B_FANG_ZHENG_AFTER_AWAKENING_01
B_TAVERN_KEEPER_Q01_COMPLETE_01
B_TAVERN_KEEPER_Q01_OTHER_OWNER_01
B_TAVERN_KEEPER_Q01_MISSED_01
B_HE_NIANG_DEBT_01
B_HE_NIANG_SETTLED_01
B_CLAN_STEWARD_Q02_CLAN_OWNED_01
B_ACADEMY_ELDER_Q02_PLAYER_DEPTH_01
B_QING_SHU_Q02_SHARED_01
B_MEDICINE_ELDER_Q04_PLAYER_OWNS_01
B_MEDICINE_ELDER_Q04_SURRENDERED_01
B_JIANG_YA_Q04_DEAL_01
B_UNCLE_Q04_LOST_01
B_AUNT_Q04_LOST_01
```

- [ ] **Step 2: Run the test**

Expected: FAIL listing bark IDs.

- [ ] **Step 3: Write one-fact, one-line state responses**

Each bark uses only facts its owner can know. Keep relationship variants to stranger/normal/cooperative/conflict; do not restore numeric trust ladders.

- [ ] **Step 4: Verify bark priorities**

- First success/failure/missed responses belong in quest files at priority 70.
- Repeated post-result barks use priority 30.
- Ambient barks use priority 10.

- [ ] **Step 5: Run and commit**

```powershell
node --test tests/qingMaoDialogueScript.test.js
git add -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script/07-npc-state-dialogue.md
git commit -m "docs(game): write early quest state dialogue"
```

## Task 16: Write Q03, Q05, Bai Ning Bing, and Optional Fang Yuan Barks

**Files:**
- Modify: `tests/qingMaoDialogueScript.test.js`
- Modify: `docs/game-design/qing-mao-mvp-script/07-npc-state-dialogue.md`

- [ ] **Step 1: Require the second bark inventory**

```text
B_JIA_JIN_SHENG_Q03_LEGAL_01
B_JIA_JIN_SHENG_Q03_BLACK_MARKET_01
B_JIA_JIN_SHENG_Q03_RESCUED_01
B_JIA_FU_Q03_LEGAL_01
B_JIA_FU_Q03_DOUBTFUL_01
B_TIE_RUO_NAN_Q03_CLEARED_01
B_TIE_RUO_NAN_Q03_PURSUIT_01
B_QING_SHU_Q05_ACTIVE_01
B_QING_SHU_Q05_SAVED_01
B_QING_SHU_DEPUTY_Q05_DEAD_01
B_BAI_NING_BING_Q05_AFTER_01
B_FANG_YUAN_AMBIENT_01
B_FANG_YUAN_TRADE_01
B_FANG_YUAN_CONFLICT_01
B_FANG_YUAN_Q02_AFTER_01
```

- [ ] **Step 2: Run the test**

Expected: FAIL listing bark IDs.

- [ ] **Step 3: Write Q03 and Q05 barks**

Jia Fu and Tie Ruo Nan speak from evidence state. Qing Shu/deputy speak from survival state. Bai Ning Bing speaks from the encounter fact, not a romance or interest meter.

- [ ] **Step 4: Write Fang Yuan as an ordinary optional NPC**

His four barks may read only:

```text
npc.fang_yuan.met_player
npc.fang_yuan.relationship_state
npc.fang_yuan.known_facts
npc.fang_yuan.transactions
npc.fang_yuan.direct_conflicts
```

Do not add alert, hostility, protagonist AI, source-sync, or mainline hints.

- [ ] **Step 5: Add the generic-Fang-state assertion**

Assert that `07-npc-state-dialogue.md` contains none of:

```text
alert
hostility
source_sync
daily_plan
countermeasure
```

- [ ] **Step 6: Run and commit**

```powershell
node --test tests/qingMaoDialogueScript.test.js
git add -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script/07-npc-state-dialogue.md
git commit -m "docs(game): write late quest and optional NPC barks"
```

## Task 17: Complete Schedules, Walkthroughs, README, and Final Audit

**Files:**
- Modify: `tests/qingMaoDialogueScript.test.js`
- Modify: `docs/game-design/qing-mao-mvp-script/README.md`
- Modify: `docs/game-design/qing-mao-mvp-script/00-quest-overview.md`
- Modify: `docs/game-design/qing-mao-mvp-script/08-schedules-states-rewards.md`
- Review: all production script files
- Delete: the six superseded screenplay source files, after all checks below are defined

- [ ] **Step 1: Add final completeness assertions**

Assert:

- Every required ID accumulated in Tasks 3–16 exists exactly once.
- Every major NPC in spec section 8.4 appears as an owner or explicit substitute.
- Each of Q01–Q05 has separately enumerated contact, investigation, decision, success, failure, refusal, and missed IDs.
- The mainline separately enumerates identity contact, world interaction, departure decision, active departure, and the
  system-only timeout emergency; it does not invent a mainline missed-dialogue record.
- Every limited reward appears in the state/reward index with owner, last window, immediate effect, midgame effect, and cost.
- The mainline `requires` sections never mention Fang Yuan.
- `00-quest-overview.md` contains all required walkthrough names.

Represent endpoint coverage explicitly in the test instead of inferring it from prose:

```js
const endpointCoverage = {
  Q01: {
    contact: ["D_Q01_TAVERN_KEEPER_01"],
    investigation: ["I_Q01_BACK_ROOM_JAR_01"],
    decision: ["I_Q01_WINE_WORM_01"],
    success: ["D_Q01_TAVERN_KEEPER_RESULT_PLAYER_01"],
    failure: ["D_Q01_TAVERN_KEEPER_RESULT_OTHER_01"],
    refusal: ["D_Q01_TAVERN_KEEPER_RESULT_REFUSED_01"],
    missed: ["D_Q01_TAVERN_KEEPER_RESULT_MISSED_01"],
  },
  Q02: {
    contact: ["D_Q02_ACADEMY_ELDER_01"],
    investigation: ["I_Q02_SHADOW_WALL_01"],
    decision: ["D_Q02_CLAN_STEWARD_CLAIM_01"],
    success: ["D_Q02_ACADEMY_ELDER_RESULT_01"],
    failure: ["D_Q02_ACADEMY_ELDER_FAILED_01"],
    refusal: ["D_Q02_ACADEMY_ELDER_REFUSED_01"],
    missed: ["D_Q02_ACADEMY_ELDER_MISSED_01"],
  },
  Q03: {
    contact: ["D_Q03_JIA_JIN_SHENG_01", "D_Q03_CARAVAN_ACCOUNTANT_01"],
    investigation: ["I_Q03_CRIME_SCENE_01"],
    decision: ["D_Q03_JIA_FU_02"],
    success: [
      "D_Q03_JIA_FU_REWARD_LEGAL_01",
      "D_Q03_BLACK_MARKET_BROKER_REWARD_01",
    ],
    failure: ["D_Q03_JIA_FU_FAILED_01"],
    refusal: ["D_Q03_JIA_FU_REFUSED_01"],
    missed: ["D_Q03_JIA_FU_MISSED_01"],
  },
  Q04: {
    contact: ["D_Q04_HE_NIANG_01", "D_Q04_UNCLE_01"],
    investigation: ["I_Q04_PARENT_LEDGER_01"],
    decision: ["I_Q04_NINE_LEAF_GRASS_01"],
    success: [
      "D_Q04_MEDICINE_ELDER_SETTLEMENT_01",
      "D_Q04_JIANG_YA_SETTLEMENT_01",
    ],
    failure: ["D_Q04_UNCLE_RESULT_FAILED_01"],
    refusal: ["D_Q04_UNCLE_RESULT_REFUSED_01"],
    missed: ["D_Q04_MEDICINE_ELDER_MISSED_01"],
  },
  Q05: {
    contact: ["D_Q05_QING_SHU_01", "D_Q05_QING_SHU_DEPUTY_01"],
    investigation: ["I_Q05_WOLF_ROUTE_01", "I_Q05_ICE_TRACE_01"],
    decision: ["D_Q05_QING_SHU_03", "D_Q05_QING_SHU_DEPUTY_03"],
    success: [
      "D_Q05_QING_SHU_RESULT_SAVED_01",
      "D_Q05_QING_SHU_RESULT_COSTLY_01",
      "D_Q05_QING_SHU_RESULT_REPLACED_01",
    ],
    failure: ["D_Q05_QING_SHU_DEPUTY_RESULT_DEAD_01"],
    withdrawal: ["D_Q05_QING_SHU_RESULT_WITHDREW_01"],
    refusal: ["D_Q05_QING_SHU_RESULT_REFUSED_01"],
    missed: ["D_Q05_QING_SHU_DEPUTY_MISSED_01"],
  },
};
```

- [ ] **Step 2: Add catalog and reference validation**

Add machine-readable catalog sections to `08-schedules-states-rewards.md` for:

```text
NPC_IDS
OBJECT_IDS
LOCATION_IDS
ITEM_IDS
TEMPLATE_VARIABLES
STATE_KEYS_AND_VALUES
```

`STATE_KEYS_AND_VALUES` contains every exact and wildcard schema declared in Task 2: `world.*`, `player.*`,
`npc.*`, `quest.*`, `item.*`, and `operation.*`. It distinguishes enum, boolean, integer, set, NPC/object owner,
and item-ID values.

Extend `tests/qingMaoDialogueScript.test.js` to scan every record header and body, not only `拥有者`, and reject:

- Any `npc.<id>` reference whose `<id>` is missing from `NPC_IDS`.
- Any `object.<id>` reference whose `<id>` is missing from `OBJECT_IDS`.
- A location missing from `LOCATION_IDS`.
- Any bare `GU_*` or `ITEM_*` token missing from `ITEM_IDS`, including inventory operations and reward prose.
- An `item.unique.<item_id>` reference whose `<item_id>` is missing from `ITEM_IDS`.
- Any referenced or assigned `world.*`, `player.*`, `npc.*`, `quest.*`, `item.*`, or `operation.*` state key
  that does not match an exact or wildcard entry in `STATE_KEYS_AND_VALUES`.
- Any compared or assigned enum, boolean, item, NPC/object owner, or bounded integer value that violates the
  matched `STATE_KEYS_AND_VALUES` entry.
- A `{template_name}` missing from `TEMPLATE_VARIABLES`.
- More than one non-`none` `on_expire` owner for the same `所属` plus required stage value.
- A unique-reward write after its registered deadline.
- Any reward record available after `D30_evening`.
- Absence of the global `world.village_closed=true` guard that disables all Qing Mao records.

For topic conflicts, parse equality requirements and exact-value exclusions before comparing records:

1. Two records are proven mutually exclusive when they require different values for the same state key, or one
   record excludes an exact condition required by the other.
2. Proven-mutually-exclusive records do not need topics even if owner, location, date range, and priority match.
   Academy high/low variants and distinct Q01 result variants are explicit passing fixtures.
3. Treat every pair that cannot be proven mutually exclusive as potentially coexisting.
4. At an overlapping owner/location/date window, only records tied for the highest active priority conflict.
   Every potentially coexisting record in that tie must have a distinct non-`none` topic.

Add focused fixtures proving one mutually exclusive pair passes and one genuinely coexisting, topic-less pair
fails, so the validator does not turn ordinary state variants into false positives.

- [ ] **Step 3: Run the test**

Expected: FAIL on any unfinished index or walkthrough entry.

- [ ] **Step 4: Complete NPC schedules**

For every NPC owner, list:

- Available date range.
- Morning/noon/afternoon/evening location.
- State-dependent relocation or absence.
- Replacement source for required mainline information.

Do not create a special Fang Yuan schedule system. His rows use the same table as everyone else.

- [ ] **Step 5: Complete ownership and deadline audit**

For each unique item:

- Start owner.
- Every legal transfer record.
- Final deadline.
- `missed_permanently` result.
- Departure carry behavior.

Only one record per quest stage owns a non-`none` `on_expire`.

- [ ] **Step 6: Complete all walkthrough matrices**

Write explicit state traces for:

```text
pure mainline
no Fang Yuan interaction
all side quests missed
Q01 success and loss
Q02 depth 1, 2, and 3
Q03 legal and black-market
Q04 retain and surrender
Q05 stable rescue, costly rescue, replacement, withdrawal, death, refusal, and missed
all limited rewards
Day 30 timeout emergency flight
different Roll: low aptitude with no relevant talent
different Roll: social talent
different Roll: high cultivation talent
```

Each different-Roll trace must still reach:

```text
quest.main.stage = identity_registered
-> quest.main.stage = academy_established
-> quest.main.stage = departed
```

The traces may differ only in legal dialogue options, check formulas/difficulties, starting resources, and
academy rewards. No Roll result may remove all mainline transitions or the emergency departure.

- [ ] **Step 7: Finish README**

Document:

- File responsibilities.
- Canonical header/body templates.
- ID naming.
- Priority and deadline semantics.
- The targeted validation command.
- The fact that runtime integration is deferred.

Do not include forbidden production tags inside record files; README may describe them only as prose.

- [ ] **Step 8: Delete the six legacy screenplay files**

Use `apply_patch` only after every replacement content file, index, and walkthrough is complete. Add the final
`legacyFiles` absence assertion to the migration test, then delete:

```text
01-main-days-00-10.md
02-main-days-11-20.md
03-main-days-21-30.md
04-side-quests-q01-q03.md
05-side-quests-q04-q05.md
06-repeatable-dialogue.md
```

- [ ] **Step 9: Run targeted validation**

```powershell
node --test tests/qingMaoDialogueScript.test.js
```

Expected: PASS.

- [ ] **Step 10: Run the full unit suite**

```powershell
npm test
```

Expected: all unit tests PASS. If unrelated dirty-worktree tests fail, record the exact pre-existing failure and do not modify unrelated files.

- [ ] **Step 11: Run scoped text and whitespace checks**

```powershell
$rewriteBase = "<paste REWRITE_BASE recorded in Task 1>"
git diff --check "$rewriteBase..HEAD" -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script
git diff --check -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script
```

Expected: no whitespace errors in either the committed rewrite range or the final working-tree changes.

- [ ] **Step 12: Stage only intended files and audit the index**

```powershell
git add -- tests/qingMaoDialogueScript.test.js docs/game-design/qing-mao-mvp-script
git diff --cached --name-status
```

Expected: only `tests/qingMaoDialogueScript.test.js` and files under
`docs/game-design/qing-mao-mvp-script/` appear. Unrelated dirty-worktree files must not appear.

- [ ] **Step 13: Commit the final content audit**

```powershell
git commit -m "docs(game): complete Qing Mao dialogue script rewrite"
```

## Completion Checklist

- [ ] One player-centered mainline is complete.
- [ ] Q01–Q05 each separately include contact, investigation, decision, success, failure, refusal, and missed content.
- [ ] All required dialogue choices have exact player lines and exact NPC responses.
- [ ] All object operations settle independently.
- [ ] No record includes camera, action, narration, sound, or continuous-scene directions.
- [ ] Every normal follow-up requires a new interaction.
- [ ] Fang Yuan is optional in the mainline and every side quest.
- [ ] No Fang-specific alert, hostility, protagonist AI, or source-sync system exists.
- [ ] All limited items have one owner, one deadline, a midgame use, and a permanent missed state.
- [ ] No-side-quest and no-Fang-Yuan walkthroughs reach permanent departure.
- [ ] Low-aptitude, social-talent, and high-cultivation Roll walkthroughs all reach permanent departure.
- [ ] Day 30 timeout reaches emergency flight without forced dialogue.
- [ ] Targeted content validation passes.
- [ ] Full unit tests pass or only documented unrelated pre-existing failures remain.
