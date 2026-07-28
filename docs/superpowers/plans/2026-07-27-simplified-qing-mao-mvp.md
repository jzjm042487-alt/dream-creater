# Simplified Qing Mao MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the state-heavy Qing Mao design with one coherent, low-pressure MVP built around free exploration, directional wilderness travel, opportunity competition, simple theft, Gu loadouts, and 8x6 grid combat.

**Architecture:** A new simplified-MVP specification is the normative product source. The GDD, systems contracts, screenplay, UI specification, and supporting design documents must reference that source and may add detail only inside their ownership area. Runtime implementation is deliberately deferred; this plan changes design, content contracts, schemas, examples, and validation only.

**Tech Stack:** Markdown design documents, JSON Schema draft 2020-12, Node.js contract validators, `node:test`, Git.

---

## Non-Negotiable Product Decisions

- Story progression uses authored flow. Favor, merit, evidence counts, suspicion, and similar meters cannot gate the next main step.
- Quest UI exposes only current step, next step, and completion state.
- Player state keeps health, primeval essence, primeval stones, rank, attributes, and ordinary buffs/debuffs.
- Fatigue, identity exposure, old debt, bloodstain, stolen-goods provenance, pursuit, evidence, rewind correction, and canon-deviation punishment are removed.
- Cultivation progress comes mainly from battle, with smaller gains from training and dangerous exploration. Night cultivation is optional.
- Full cultivation progress permits breakthrough. The MVP adds no safe-place, resource-stockpile, or multi-gate breakthrough checklist.
- Theft is a map interaction: approach a character, inspect stealable items, choose one, resolve one roll, then end. Successful theft directly grants the item and creates no pursuit state.
- Theft chance uses luck, theft mastery, and rank difference, with an explicit non-zero floor for every valid target.
- Relationships are a descriptive bloodline/friends-and-family graph. They are not numeric trust, suspicion, leverage, or progression gates.
- Canon initializes the world and powers the reference lookup. Once play starts, the world does not preserve the novel's original route.
- Fang Yuan is one competitor in the talent roster. He has no plot armor, alert meter, special cognition model, or exclusive correction rules.
- Dialogue is scene background, portrait, text box, and short choices. No AP price, risk formula, locked choice, or confirmation step appears.
- Combat uses the existing 8x6 grid. Units move into a Gu or physical technique's grid range and act until victory, defeat, or retreat. No interrupt-condition subsystem is included.
- Adult portraits retain clothing and emotion variants. Map chibi sprites do not switch with those portrait states.

## Execution Waves

- Wave A: Task 1 is the blocking foundation and is completed first.
- Wave B: Tasks 2-6 may run in parallel only after the canonical specification and authoring contracts from Task 1 are stable. Their write sets are disjoint.
- Wave C: Task 7 runs after every Wave B change is integrated and reviewed.

## Task 1: Establish The Canonical Simplified Contract

**Files:**
- Create: `docs/superpowers/specs/2026-07-27-qing-mao-simplified-mvp-design.md`
- Modify: `systems/demo-v2-rules.md`
- Modify: `contracts/game-state-v3.md`
- Modify: `contracts/demo-v2-ids.json`
- Modify: `contracts/character.schema.json`
- Create: `contracts/player-state.schema.json`
- Create: `contracts/resource-pool.schema.json`
- Create: `contracts/buff-instance.schema.json`
- Create: `contracts/debuff-instance.schema.json`
- Create: `contracts/status-duration.enum.json`
- Modify: `contracts/quest.schema.json`
- Modify: `contracts/relationship.schema.json`
- Delete: `contracts/relationship-dimension.enum.json`
- Create: `contracts/relationship-kind.enum.json`
- Create: `contracts/opportunity.schema.json`
- Create: `contracts/opportunity-status.enum.json`
- Create: `contracts/dialogue-choice-action.enum.json`
- Create: `contracts/character-life-status.enum.json`
- Modify: `contracts/event.schema.json`
- Modify: `contracts/dialogue.schema.json`
- Modify: `contracts/examples/character.valid.json`
- Create: `contracts/examples/player-state.valid.json`
- Create: `contracts/examples/opportunity.valid.json`
- Modify: `contracts/examples/quest.valid.json`
- Modify: `contracts/examples/relationship.valid.json`
- Modify: `contracts/examples/event.valid.json`
- Modify: `contracts/examples/dialogue.valid.json`
- Modify: `scripts/contract-validator-core.mjs`
- Modify: `scripts/validate-contracts.mjs`
- Modify: `scripts/validate-content.mjs`
- Create: `scripts/game-state-v3-contract.mjs`
- Create: `tests/contractValidation.test.js`
- Create: `tests/gameStateV3Contract.test.js`
- Temporary only: a directory created under `os.tmpdir()` by `tests/contractValidation.test.js`, deleted in `finally`

- [x] **Step 1: Add validator assertions for the simplified contract**

The valid examples must prove:

```json
{
  "status": "active",
  "currentStepId": "D00-S01",
  "nextStepId": "D01-S01"
}
```

The relationship example must use a categorical kinship/social edge and contain no numeric affinity meter. The negative test creates temporary files outside the repository and exercises this matrix:

- player state: reject `fatigue`, `identityExposure`, `oldDebt`, `bloodstain`, and unknown rank/status IDs;
- character/relationship: reject unknown character and relationship-kind IDs plus `value`, `trust`, `suspicion`, `leverage`, and `appliedEventDeltaIds`;
- quest: reject unknown quest and quest-step IDs plus `progress`, `requirements`, `remediationRoutes`, and relationship/evidence gates;
- dialogue: reject unknown dialogue-node, speaker, quest-step, and emotion IDs plus `actionPointCost`, `riskFormula`, `locked`, and `requiresConfirmation`;
- event: reject unknown event, event-delta, and location IDs plus `relationshipDeltas`, `evidenceDelta`, `fangYuanAlertDelta`, and `canonDeviationDelta`.
- opportunity: reject unknown opportunity/status/character IDs and contradictory `gone + resolvedByCharacterId`;
- validator dispatch: reject nonexistent and unmapped input files instead of reporting them as checked.

Every registry-backed field receives at least one unknown-ID assertion. Every removed property receives an exact `$.path is not allowed` assertion. A `finally` block deletes the temporary directory, then the test asserts it no longer exists.

- [x] **Step 2: Run the focused validators and confirm the old examples fail**

Run:

```powershell
node scripts/validate-contracts.mjs
node scripts/validate-content.mjs
node --test tests/contractValidation.test.js tests/gameStateV3Contract.test.js
```

Expected: the new test fails before the schema and examples are updated, for the asserted field path rather than an unrelated parse error.

- [x] **Step 3: Write the normative simplified-MVP specification**

Define exact state, travel, quest, theft, growth, breakthrough, relationship, canon lookup, dialogue, combat, save/load, and UI boundaries. Record every deleted subsystem in one explicit rejection table.

The acceptance table must explicitly prove:

- active player state contains health, primeval essence, primeval stones, rank, attributes, buffs, and debuffs;
- battle is the primary cultivation source, training and dangerous exploration are secondary sources, and night cultivation is optional;
- cultivation progress reaching full capacity at the current rank enables direct breakthrough with no environment or stockpile gate;
- theft chance is a bounded formula using luck, theft mastery, and rank difference, with a documented non-zero floor for every valid target;
- theft success grants the selected item atomically and writes no pursuit, provenance, victim, or illegal-possession state;
- quest presentation contains current step, next step, and completion state, and contains no percentage.

- [x] **Step 4: Update schemas, examples, IDs, and save migration**

The resulting schemas must keep `required`, `additionalProperties: false`, registry-backed IDs, enums, and bounded numbers.

Authoring contracts and persistence compatibility are separate:

- new authoring JSON is validated only against the simplified schemas and must reject removed fields;
- the v2 local-storage payload is copied losslessly during v2-to-v3 migration;
- legacy top-level fields and branches may remain byte-for-byte in the migrated payload, but active MVP systems never read, mutate, display, or branch on them;
- active simplified branches have their own documented defaults and contain no old meters;
- compatibility data is not accepted as new quest, relationship, dialogue, or event authoring content.

- [x] **Step 5: Run focused validation**

Run:

```powershell
node scripts/validate-contracts.mjs
node scripts/validate-content.mjs
node --test tests/contractValidation.test.js
```

Expected: valid examples pass; the test suite proves temporary unknown-ID and removed-field fixtures fail with exact field-level errors; `finally` cleanup is asserted and leaves no repository or operating-system temporary files behind.

## Task 2: Rewrite Core GDD And Systems Documents

**Files:**
- Rewrite: `docs/game-design/gu-zhen-ren-tianwai-daojuben-gdd.md`
- Rewrite: `systems/theft-system-design.md`
- Modify: `docs/superpowers/specs/2026-07-26-low-rank-gu-acquisition-and-care-design.md`

- [x] **Step 1: Replace the GDD structure**

Use these sections: product scope, core loop, world and canon, map travel, opportunity competition, player growth, aperture and Gu loadout, 8x6 combat, theft, quest flow, relationships, dialogue, UI, save/load, MVP content, out-of-scope systems, and acceptance criteria.

- [x] **Step 2: Replace theft with the one-roll interaction**

Keep a compact pre-demigod theft skill tree and progression, but remove evidence, heat, attribution, pursuit, stolen ownership, false trails, laundering, combat interrupts, and post-success consequences. Clothing and close-worn items remain selectable item slots for adult characters and may switch portrait/emotion presentation immediately.

- [x] **Step 3: Reduce Gu upkeep pressure**

Keep interesting wilderness acquisition, finite low-rank advancement, recipe extension points, rank-weighted aperture capacity, passive stacking contracts, active Gu grid ranges, and fixed-core killer-move assembly. Remove chores or gates that contradict the approved low-pressure loop.

- [x] **Step 4: Audit rejected terms**

Run:

```powershell
rg -n "警觉|证据|追查|赃物|所有权追踪|同步率|回溯修正|中断条件" docs/game-design/gu-zhen-ren-tianwai-daojuben-gdd.md systems/theft-system-design.md docs/superpowers/specs/2026-07-26-low-rank-gu-acquisition-and-care-design.md
```

Expected: matches only in explicit "removed/out of scope" statements.

## Task 3: Rewrite The Complete Screenplay Package

**Files:**
- Rewrite: `docs/superpowers/specs/2026-07-26-qing-mao-mvp-complete-script-design.md`
- Rewrite: `docs/game-design/qing-mao-mvp-script/README.md`
- Rewrite: `docs/game-design/qing-mao-mvp-script/01-main-days-00-10.md`
- Rewrite: `docs/game-design/qing-mao-mvp-script/02-main-days-11-20.md`
- Rewrite: `docs/game-design/qing-mao-mvp-script/03-main-days-21-30.md`
- Rewrite: `docs/game-design/qing-mao-mvp-script/04-side-quests-q01-q03.md`
- Rewrite: `docs/game-design/qing-mao-mvp-script/05-side-quests-q04-q05.md`
- Rewrite: `docs/game-design/qing-mao-mvp-script/06-repeatable-dialogue.md`

- [x] **Step 1: Replace the screenplay contract**

Use a linear thirty-day chapter spine with optional opportunities. "Day 0" through "Day 30" are authored chapter labels, not a countdown, deadline, daily action budget, or failure pressure. Resting, exploration, and optional content cannot make the main chapter expire.

Each scene records scene ID, location, cast, current objective, short dialogue, optional choice, battle/travel interaction, immediate reward, and next scene. Do not model percentages, evidence counts, relationship gates, remediation routes, or hidden state matrices.

- [x] **Step 2: Rewrite days 0-30**

Preserve Qing Mao setting and named competitors, but allow the simulated world to diverge naturally. Fang Yuan may fail, lose an opportunity, leave, or die through ordinary rules.

- [x] **Step 3: Rewrite optional opportunities**

Keep no more than five compact opportunity lines. Each line is optional, independently resolvable, and cannot block the main chapter.

- [x] **Step 4: Rewrite repeatable dialogue**

Dialogue nodes use short choices and immediate results only. Remove AP prices, formula displays, locked choices, warning confirmations, and forensic exposition.

- [x] **Step 5: Audit screenplay state**

Run:

```powershell
rg -n "信任|怀疑|警觉|证据|可信度|回溯|同步率|纠偏|前置条件|补救路线|百分比" docs/superpowers/specs/2026-07-26-qing-mao-mvp-complete-script-design.md docs/game-design/qing-mao-mvp-script
```

Expected: matches only in the package's explicit rejection notice.

## Task 4: Rewrite Visual And Character Presentation

**Files:**
- Rewrite: `docs/superpowers/specs/2026-07-27-qing-mao-mvp-visual-ui-action-production-design.md`
- Modify: `docs/superpowers/specs/2026-07-26-character-state-portrait-ui-design.md`

- [x] **Step 1: Replace the panel registry**

The MVP panel set must cover map/HUD, dialogue, character and aperture, inventory/crafting, quest steps, talent roster, canon lookup, battle, pause/save, and result overlays. Delete standalone judgment, evidence, and rewind panels.

- [x] **Step 2: Simplify HUD and dialogue**

Show player essentials plus the task's current step, next step, and completion state. Do not show task percentages. Dialogue presents background, portrait, text, and short choices without AP, risk, formulas, locks, or double confirmation.

- [x] **Step 3: Simplify portrait state**

Preserve adult normal/outerwear-missing/close-worn-item-missing assets and emotion variants. Replace numeric emotion simulation and theft-pursuit records with direct authored presentation tags. Map chibi sprites remain unchanged.

- [x] **Step 4: Audit removed UI**

Run:

```powershell
rg -n "UI12|UI14|UI16|证据|可信度|时间线|矛盾|回溯修正|警觉值" docs/superpowers/specs/2026-07-27-qing-mao-mvp-visual-ui-action-production-design.md docs/superpowers/specs/2026-07-26-character-state-portrait-ui-design.md
```

Expected: matches only in explicit removed-panel notes.

## Task 5: Align Supporting World, Demo, And Travel Specs

**Files:**
- Rewrite: `docs/superpowers/specs/2026-07-26-gu-zhen-ren-open-world-design.md`
- Modify: `docs/superpowers/specs/2026-07-26-jinyong-style-playable-demo-design.md`
- Modify: `docs/superpowers/specs/2026-07-26-wilderness-hidden-route-design.md`

- [x] **Step 1: Rewrite the open-world contract**

Canon provides initial people, factions, locations, relations, cultivation paths, and opportunity records. At runtime, only game rules and resolved actions determine the world. Remove Fang Yuan exclusivity, canon-track enforcement, theft negative-state simulation, and relationship meters.

- [x] **Step 2: Align the playable demo**

Keep map dialogue and 8x6 combat. Replace click-to-travel, branching wine-worm ownership, Fang Yuan alertness, and pursuit with directional travel, opportunity competition, and immediate theft resolution.

- [x] **Step 3: Clean the hidden-route spec**

Retain absolute directions, facing conversion, reversible traversal history, continuous backtracking, charge ticks 1/5/9/13/17, destination state, step-20 guarantee, deterministic randomness, event lifecycles, and v2-to-v3 migration. These fields are local mechanics of the current wilderness expedition only; they cannot gate story scenes, accumulate social pressure, or become global simulation meters. Remove character-specific wording.

- [x] **Step 4: Verify supporting specifications**

Run:

```powershell
rg -n "方源警觉|原轨|同步率|证据系统|所有权追踪|中断条件" docs/superpowers/specs/2026-07-26-gu-zhen-ren-open-world-design.md docs/superpowers/specs/2026-07-26-jinyong-style-playable-demo-design.md docs/superpowers/specs/2026-07-26-wilderness-hidden-route-design.md
```

Expected: matches only in explicit rejection or migration notes.

## Task 6: Deprecate Old Plans

**Files:**
- Modify: `docs/superpowers/plans/2026-07-27-full-ui-prototype.md`
- Modify: `docs/superpowers/plans/2026-07-26-jinyong-style-playable-demo.md`
- Modify: `docs/superpowers/plans/2026-07-26-tianwai-daojuben-demo.md`
- Modify: `docs/superpowers/plans/2026-07-26-demo-v2-multi-agent-production.md`

- [x] **Step 1: Add a deprecation banner**

Each superseded plan must point to this plan and the canonical simplified-MVP specification. Historical content remains readable but is not implementation authority.

- [x] **Step 2: Confirm no active document cites a deprecated plan as normative**

Run:

```powershell
rg -n "2026-07-27-full-ui-prototype|2026-07-26-jinyong-style-playable-demo|2026-07-26-tianwai-daojuben-demo|2026-07-26-demo-v2-multi-agent-production" docs systems contracts
```

Expected: references describe history or deprecation only.

## Task 7: Full Verification And Commit

**Files:**
- Verify all changed files.

- [x] **Step 1: Run contract and content validators**

```powershell
node scripts/validate-contracts.mjs
node scripts/validate-content.mjs
node scripts/validate-canon.mjs
```

- [x] **Step 2: Run repository tests and build**

```powershell
npm test
npm run build
```

- [x] **Step 3: Inspect the final diff and rejected-term audit**

```powershell
git diff --check
git status --short
rg -n "UI12|UI14|UI16|方源警觉|所有权追踪|赃物|追查|疲惫|身份暴露|旧债|血污|证据|同步率|偏移值|纠偏惩罚|回溯修正|中断条件|fatigue|identityExposure|oldDebt|bloodstain|evidence|pursuit|provenance|canonDeviation" docs systems contracts
```

All surviving matches must be historical deprecation, compatibility, or explicit out-of-scope statements.

- [x] **Step 4: Commit**

```powershell
git add -- `
  contracts/character.schema.json `
  contracts/demo-v2-ids.json `
  contracts/dialogue.schema.json `
  contracts/event.schema.json `
  contracts/examples/character.valid.json `
  contracts/examples/dialogue.valid.json `
  contracts/examples/event.valid.json `
  contracts/examples/player-state.valid.json `
  contracts/examples/quest.valid.json `
  contracts/examples/relationship.valid.json `
  contracts/game-state-v3.md `
  contracts/player-state.schema.json `
  contracts/quest.schema.json `
  contracts/resource-pool.schema.json `
  contracts/relationship-kind.enum.json `
  contracts/relationship.schema.json `
  docs/game-design/gu-zhen-ren-tianwai-daojuben-gdd.md `
  docs/game-design/qing-mao-mvp-script/README.md `
  docs/game-design/qing-mao-mvp-script/01-main-days-00-10.md `
  docs/game-design/qing-mao-mvp-script/02-main-days-11-20.md `
  docs/game-design/qing-mao-mvp-script/03-main-days-21-30.md `
  docs/game-design/qing-mao-mvp-script/04-side-quests-q01-q03.md `
  docs/game-design/qing-mao-mvp-script/05-side-quests-q04-q05.md `
  docs/game-design/qing-mao-mvp-script/06-repeatable-dialogue.md `
  docs/superpowers/plans/2026-07-26-demo-v2-multi-agent-production.md `
  docs/superpowers/plans/2026-07-26-jinyong-style-playable-demo.md `
  docs/superpowers/plans/2026-07-26-tianwai-daojuben-demo.md `
  docs/superpowers/plans/2026-07-27-full-ui-prototype.md `
  docs/superpowers/plans/2026-07-27-simplified-qing-mao-mvp.md `
  docs/superpowers/specs/2026-07-26-character-state-portrait-ui-design.md `
  docs/superpowers/specs/2026-07-26-gu-zhen-ren-open-world-design.md `
  docs/superpowers/specs/2026-07-26-jinyong-style-playable-demo-design.md `
  docs/superpowers/specs/2026-07-26-low-rank-gu-acquisition-and-care-design.md `
  docs/superpowers/specs/2026-07-26-qing-mao-mvp-complete-script-design.md `
  docs/superpowers/specs/2026-07-26-wilderness-hidden-route-design.md `
  docs/superpowers/specs/2026-07-27-qing-mao-mvp-visual-ui-action-production-design.md `
  docs/superpowers/specs/2026-07-27-qing-mao-simplified-mvp-design.md `
  scripts/contract-validator-core.mjs `
  scripts/validate-content.mjs `
  scripts/validate-contracts.mjs `
  systems/demo-v2-rules.md `
  systems/theft-system-design.md `
  tests/contractValidation.test.js
git add -u -- contracts/relationship-dimension.enum.json
git commit -m "docs(game): simplify Qing Mao MVP systems"
```
