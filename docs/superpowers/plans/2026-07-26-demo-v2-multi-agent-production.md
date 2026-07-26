# Demo V2 Multi-Agent Production Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a second playable vertical slice that replaces meaningless wilderness walking with hidden directional routes, externalizes the wine-worm narrative content, introduces a minimal relationship graph, and upgrades the five required characters without breaking the existing demo.

**Architecture:** This task uses one controlling thread and five specialist agents. The Systems agent first locks all schemas and enums in Wave 0. Narrative, Art, and early QA then work in parallel from that accepted contract commit; Engineering starts from their integrated Wave 1 commit, and final black-box QA starts from the Engineering commit.

**Tech Stack:** Git worktrees, Markdown/JSON content contracts, Phaser 3, Vite, Node test runner, Playwright, generated pixel-art assets.

---

## 1. Team Shape

The controlling thread acts as game director and integration owner. It owns scope, stable IDs, merge order, and conflict resolution.

| Agent | Starts | Owns | Must not change |
| --- | --- | --- | --- |
| Systems | Wave 0 | `systems/`, `contracts/`, contract validation scripts, wilderness system spec | Runtime code, dialogue, art |
| Narrative | Wave 1 | `content/`, `docs/narrative/` | Formulas, runtime code, art |
| Art | Wave 1 | `art/`, `assets/game/characters/`, `assets/game/ui/` | Story conditions, formulas, runtime code |
| QA | Wave 1 and Wave 3 | `tests/specs/`, fixtures, `e2e/qa/`, reports | Production behavior, Engineering-owned tests, balance values |
| Engineering | Wave 2 | `src/`, unit tests, integration tests, migrations | Canon, final balance, unapproved art |

No two agents may modify the same file. Changes to a contract require a written change request to the controlling thread.

## 2. Branch and Worktree Rules

Create the Systems branch from the accepted `main` commit:

```text
agent/systems-demo-v2
```

After Systems is approved, merge it into `integration/demo-v2-contracts`. Create all Wave 1 branches from that exact contract commit:

```text
agent/narrative-demo-v2
agent/art-demo-v2
agent/qa-demo-v2
```

Merge approved Wave 1 outputs into `integration/demo-v2-wave1`. Create Engineering from that exact integrated commit:

```text
agent/engineering-demo-v2
```

After Engineering passes its local suite, merge it into `integration/demo-v2-engineering`. Create final QA from that exact commit:

```text
agent/qa-final-demo-v2
```

Each agent uses its own worktree. Agents commit only their owned files with conventional commit messages. Downstream branches are never created from the original base after an upstream wave has completed.

## 3. Canonical Demo Scope

Demo V2 includes:

- One Qing Mao Mountain hidden route graph.
- Ordinary destinations: Gu Yue Village and Bamboo Hunting Ground.
- One discoverable hidden cave and one one-time theft cache.
- Twenty-step ordinary-destination guarantee.
- The existing three wine-worm acquisition routes.
- Five authored characters: player, Fang Yuan, wine merchant, tavern clerk, academy elder.
- Minimal directed relationship values: trust, vigilance, enmity, debt, and interest.
- Physical theft only.
- One wine worm with acquire, hide, refine, and owned states.
- Existing forest and Fang Yuan battles.
- Save migration from state version 2 to version 3.

Demo V2 explicitly defers:

- Concept, identity, time, or fate theft.
- Full equipment and sect progression.
- A general-purpose procedural quest generator.
- Multiple wilderness maps.
- Moving secret realms and weather-dependent paths.
- A complete emotional portrait set for every generic NPC.

## 4. Stable IDs

All agents use these IDs:

```text
char_player
char_fang_yuan
char_wine_merchant
char_tavern_clerk
char_academy_elder

quest_wine_worm

state_wine_unknown
state_wine_clerk_observed
state_wine_patrol_known
state_wine_jar_confirmed
state_wine_player_unhidden
state_wine_player_hidden
state_wine_player_refined
state_wine_fang_yuan_owned

loc_qingmao_wilderness
loc_gu_yue_village
loc_bamboo_hunting_ground
loc_hidden_cave
loc_theft_cache

event_wilderness_boar
event_hidden_cave_discovery
event_theft_cache_discovery

gu_wine_worm

emotion_neutral
emotion_guarded
emotion_hostile
emotion_alarmed
emotion_wounded

relation_trust
relation_vigilance
relation_enmity
relation_debt
relation_interest
```

IDs are ASCII and immutable. Chinese display names live in content fields. Systems owns all additional graph-node, dialogue-node, event-delta, and schema-enum IDs; Narrative, Art, and QA may reference but never invent them.

---

### Task 1: Systems Agent Work Order

**Files:**
- Modify: `docs/superpowers/specs/2026-07-26-wilderness-hidden-route-design.md`
- Create: `contracts/demo-v2-ids.json`
- Create: `contracts/game-state-v3.md`
- Create: `contracts/character.schema.json`
- Create: `contracts/quest.schema.json`
- Create: `contracts/dialogue.schema.json`
- Create: `contracts/event.schema.json`
- Create: `contracts/wilderness-map.schema.json`
- Create: `contracts/relationship.schema.json`
- Create: `contracts/emotion.enum.json`
- Create: `contracts/relationship-dimension.enum.json`
- Create: `scripts/validate-contracts.mjs`
- Create: `scripts/validate-content.mjs`
- Create: `systems/demo-v2-rules.md`
- Create: `systems/balance/demo-v2.json`

- [ ] **Step 1: Resolve the wilderness spec review**

Define absolute node bearings, initial facing, relative-command translation, a reversible history stack, and repeated-back behavior.

- [ ] **Step 2: Fix incremental time charging**

Specify zero choices as zero cost; choices 1, 5, 9, 13, and 17 each charge one time point. This replaces the old world-to-destination travel cost. Destination arrival and the twenty-step guarantee charge no additional time.

- [ ] **Step 3: Define destination states**

Distinguish `availableOrdinaryDestinations`, `discoveredHiddenLocations`, `origin`, and `directTravelLocations`. Before step twenty, players may only return to their origin or directly visit a previously discovered hidden location.

- [ ] **Step 4: Guarantee step twenty**

On step twenty, destination arrival or hidden discovery may resolve first. If neither occurs, suppress blocking encounters and expose all available ordinary destinations.

- [ ] **Step 5: Define battle return and event lifetimes**

Victory or escape returns to the post-movement node and facing, preserves `wanderCount`, travel charges, history, and random cursor, and clears only the hidden-route matching sequence. Separate permanent, daily, and per-expedition event IDs.

- [ ] **Step 6: Define deterministic randomness**

Use event results keyed by expedition seed plus edge traversal index, or persist the PRNG cursor. Saving and loading must not reroll the next event.

- [ ] **Step 7: Define state version 3 migration**

Preserve every unrelated version 2 field. Continue reading the existing local-storage key `tianwai-daojuren-save-v2`, migrate its payload to version 3, then persist to `tianwai-daojuren-save-v3`. Convert `scene.id === "world"` to the wilderness entrance with explicit defaults.

- [ ] **Step 8: Provide a finite first graph**

List every graph-node ID, absolute edge, entry facing, ordinary route, hidden route, dialogue-node ID, event-delta ID, event slot, and discovery condition.

- [ ] **Step 9: Validate every JSON contract**

```bash
node scripts/validate-contracts.mjs
```

- [ ] **Step 10: Prove invalid content is rejected**

Run `node scripts/validate-content.mjs` against one valid example and one temporary example containing an unknown ID. The valid example must pass and the unknown ID must fail with a field-specific message.

- [ ] **Step 11: Commit**

```bash
git add contracts systems scripts docs/superpowers/specs/2026-07-26-wilderness-hidden-route-design.md
git commit -m "docs(systems): define demo v2 gameplay contracts"
```

**Done when:** All JSON files parse, the spec has no unresolved review issue, and another engineer can implement the graph without inventing topology or formulas.

---

### Task 2: Narrative Agent Work Order

**Prerequisite:** Create this branch from the approved `integration/demo-v2-contracts` commit. All content must validate against the Systems-owned schemas and enums.

**Files:**
- Create: `content/characters/char_player.json`
- Create: `content/characters/char_fang_yuan.json`
- Create: `content/characters/char_wine_merchant.json`
- Create: `content/characters/char_tavern_clerk.json`
- Create: `content/characters/char_academy_elder.json`
- Create: `content/quests/quest_wine_worm.json`
- Create: `content/dialogue/quest_wine_worm.zh-CN.json`
- Create: `content/events/qingmao_wilderness.zh-CN.json`
- Create: `docs/narrative/demo-v2-narrative-notes.md`

- [ ] **Step 1: Write five character records**

Each record defines public identity, private goal, known facts, secrets, relationship baseline, speech pattern, and available emotional states.

- [ ] **Step 2: Convert the wine-worm quest into a state graph**

Represent routes A, B, C, partial success, two failures, Fang Yuan ownership, hiding, and refining. Keep all existing deadlines and fail-forward behavior.

- [ ] **Step 3: Write dialogue by node and emotion**

Every dialogue entry references stable character, quest, and state IDs. Do not embed formulas or executable JavaScript.

- [ ] **Step 4: Write wilderness event text**

Provide concise descriptions for route landmarks, the boar event, hidden cave clues, theft cache clues, discoveries, and repeat visits.

- [ ] **Step 5: Add consequence notes**

For every choice, declare relationship deltas, alert changes, evidence, ownership changes, and follow-up state IDs without choosing their numeric formulas.

- [ ] **Step 6: Validate every content JSON file against its assigned schema**

```bash
node scripts/validate-content.mjs
```

- [ ] **Step 7: Commit**

```bash
git add content docs/narrative
git commit -m "feat(content): author demo v2 narrative package"
```

**Done when:** Every existing wine-worm outcome maps to a content state, every speaking character has authored text, and no content file contains engine code.

---

### Task 3: Art Agent Work Order

**Prerequisite:** Create this branch from the approved `integration/demo-v2-contracts` commit. Use only character and emotion IDs defined in the accepted contracts.

**Files:**
- Create: `art/demo-v2-art-bible.md`
- Create: `art/demo-v2-asset-manifest.json`
- Create: `art/character-emotion-matrix.md`
- Create: `assets/game/characters/concepts/`
- Create: `assets/game/characters/portraits/`
- Create: `assets/game/characters/sprites/`
- Create: `assets/game/ui/`

- [ ] **Step 1: Lock the visual rules**

Use the approved late-1990s Chinese RPG pixel style. Define palette, outline, lighting, portrait crop, sprite scale, and transparent-background requirements.

- [ ] **Step 2: Build the asset manifest**

List exact filenames, dimensions, character ID, usage, emotional state, completion status, and source prompt for every required asset.

- [ ] **Step 3: Produce five concept sheets**

Concept sheets must make the five silhouettes, faction clothing, age, and social status distinguishable.

- [ ] **Step 4: Produce portrait minimums**

Player and Fang Yuan need neutral, guarded, and hostile portraits. Merchant, clerk, and elder need neutral and alarmed portraits.

- [ ] **Step 5: Produce map sprites**

Player and Fang Yuan require idle plus four directional movement frames. Other Demo characters may use a single idle pose.

- [ ] **Step 6: Produce wilderness UI assets**

Create directional controls, route feedback markers, hidden-discovery marker, and destination seals without drawing a visible path graph.

- [ ] **Step 7: Verify every asset**

Check dimensions, alpha, filename, manifest entry, readability at in-game scale, and absence of text baked into raster art.

- [ ] **Step 8: Commit**

```bash
git add art assets/game/characters assets/game/ui
git commit -m "feat(art): add demo v2 character and route assets"
```

**Done when:** The manifest has no missing required entry and every delivered asset renders cleanly at its intended size.

---

### Task 4: QA Agent Early Work Order

**Prerequisite:** Create this branch from the approved `integration/demo-v2-contracts` commit. QA fixtures must validate against the accepted wilderness and relationship schemas.

**Files:**
- Create: `tests/specs/demo-v2-acceptance.md`
- Create: `tests/fixtures/wilderness-map.valid.json`
- Create: `tests/fixtures/wilderness-map.invalid.json`
- Create: `tests/fixtures/save-v2-realistic.json`
- Create: `reports/demo-v2-risk-register.md`

- [ ] **Step 1: Write the acceptance matrix**

Cover route direction semantics, repeated back, costs at 0/1/4/5/20 choices, step-twenty ordering, hidden discovery, direct revisit, battle return, save/reload, migration from the real `tianwai-daojuren-save-v2` key, and existing wine-worm routes.

- [ ] **Step 2: Define anti-exploit tests**

Cover reload rerolls, duplicate unique rewards, repeated random battles, time-cost bypass, hidden location leakage, and relationship delta duplication.

- [ ] **Step 3: Define relationship acceptance**

Cover asymmetric `A -> B` and `B -> A` values, all five relationship dimensions, persistence, event-delta idempotence, and unchanged unrelated relationships.

- [ ] **Step 4: Define functional UI acceptance**

Cover mouse, keyboard, and touch direction controls; step-twenty destination choice; compact-layout visibility and clickability; dialogue focus; and the absence of a freely moving player in the wilderness.

- [ ] **Step 5: Create graph and migration fixtures**

Invalid fixtures include dead nodes, unreachable ordinary destinations, duplicate IDs, impossible hidden sequences, and missing reverse history metadata.

- [ ] **Step 6: Commit**

```bash
git add tests/specs tests/fixtures reports
git commit -m "test: define demo v2 acceptance coverage"
```

**Done when:** The test matrix can reject an implementation that violates any approved system or narrative rule.

---

## 5. Wave 0 and Wave 1 Integration Gates

Wave 0 passes only when:

- [ ] Systems contracts parse and contain every enum needed by Narrative, Art, and QA.
- [ ] The finite graph has no invented placeholders.
- [ ] The wilderness spec reviewer returns `Approved`.
- [ ] `integration/demo-v2-contracts` points at the approved Systems commit.

Wave 1 passes only when the controlling thread checks:

- [ ] All stable IDs match.
- [ ] JSON schemas and content examples agree.
- [ ] Narrative references only defined states and relationship dimensions.
- [ ] Art manifest contains every required narrative character and emotion.
- [ ] QA covers every systems acceptance rule.
- [ ] No Wave 1 branch modifies `src/`.
- [ ] All Wave 1 branches have been merged into `integration/demo-v2-wave1`.

Only after this gate passes may the engineering agent start.

---

### Task 5: Engineering Agent Work Order

**Prerequisite:** Create this branch from the accepted `integration/demo-v2-wave1` commit, never from the original `main` or contract-only commit.

**Files:**
- Create: `src/game/wilderness/wildernessGraph.js`
- Create: `src/game/wilderness/wildernessRules.js`
- Create: `src/game/wilderness/wildernessEvents.js`
- Create: `src/game/content/contentLoader.js`
- Create: `src/game/relationships/relationshipRules.js`
- Create: `src/game/scenes/WildernessScene.js`
- Modify: `src/game/state/createInitialState.js`
- Modify: `src/game/state/gameReducer.js`
- Modify: `src/game/GameStateStore.js`
- Modify: `src/main.js`
- Modify: `src/game/ui/GameUI.js`
- Modify: `src/game/content/maps.js`
- Modify: `src/game/content/wineWormQuest.js`
- Modify: `src/game/scenes/ExploreScene.js`
- Modify: `src/game/scenes/BattleScene.js`
- Modify: `src/styles.css`
- Test: `tests/wildernessRules.test.js`
- Test: `tests/relationshipRules.test.js`
- Test: `tests/stateMigration.test.js`
- Modify: `tests/domainState.test.js`
- Test: `e2e/wilderness.spec.js`
- Test: `e2e/migration.spec.js`
- Test: `e2e/game.spec.js`

- [ ] **Step 1: Write failing schema and graph tests**

Run:

```bash
node --test tests/wildernessRules.test.js
```

Expected: fail because the wilderness modules do not exist.

- [ ] **Step 2: Implement graph validation and direction translation**

Support absolute edges, relative commands, history-backed return, and fixed entry facing.

- [ ] **Step 3: Implement counters and incremental time**

Keep `wanderCount`, `routeSequence`, `chargedTravelTicks`, history, and deterministic event cursor separate.

- [ ] **Step 4: Implement destination and event priority**

Guarantee normal destinations at step twenty and prevent blocking random events from overriding the guarantee.

- [ ] **Step 5: Implement state version 3 and migration**

Load a realistic payload from `tianwai-daojuren-save-v2`, preserve all version 2 state outside the new wilderness fields, write the migrated payload to `tianwai-daojuren-save-v3`, and verify the browser resumes in the correct scene.

- [ ] **Step 6: Implement minimal directed relationships**

Store values by source character, target character, dimension, and event history. Apply each event delta once.

- [ ] **Step 7: Load approved content data**

Replace only the wine-worm and wilderness text touched by Demo V2. Update `wineWormQuest.js` only where needed to consume approved content/state IDs. Do not rewrite unrelated legacy content.

- [ ] **Step 8: Build the wilderness scene**

Replace the old `world` behavior in `ExploreScene.js` with `WildernessScene`. Update map entry and battle-return handoffs in `maps.js` and `BattleScene.js`. Render environment feedback, stable direction controls, route log, origin exit, discovered hidden destinations, and the step-twenty destination chooser.

- [ ] **Step 9: Integrate approved art**

Use manifest filenames and graceful placeholders for optional assets. Missing required assets fail development validation.

- [ ] **Step 10: Run unit tests**

```bash
npm test
```

Expected: all existing and new tests pass.

- [ ] **Step 11: Run build and browser tests**

```bash
npm run build
npm run test:e2e
```

Expected: production build succeeds and all browser tests pass.

- [ ] **Step 12: Commit**

```bash
git add src tests e2e
git commit -m "feat(wilderness): add hidden route exploration"
```

**Done when:** The new route scene is playable, old quest routes still pass, state migration works, and no production text or formulas were invented outside approved inputs.

---

### Task 6: QA Agent Final Work Order

**Files:**
- Create: `e2e/qa/demo-v2-acceptance.spec.js`
- Create: `reports/demo-v2-verification.md`

**Prerequisite:** Create this branch from the accepted `integration/demo-v2-engineering` commit. Do not modify Engineering-owned unit or integration test files. Report production failures to Engineering for fixes.

- [ ] **Step 1: Run the full suite**

```bash
npm run test:all
```

- [ ] **Step 2: Execute every acceptance route**

Verify ordinary destinations before and at step twenty, hidden discovery and revisit, battle victory/escape/defeat, three wine-worm routes, Fang Yuan ownership recovery, and save migration.

- [ ] **Step 3: Verify relationships functionally**

Verify all five dimensions, directional values, save/load persistence, one-time event deltas, and no unintended changes to unrelated edges.

- [ ] **Step 4: Verify desktop and compact UI functionally**

Confirm no overlap, clipped text, hidden controls, blank canvas, or unreadable assets. Use mouse, keyboard, and touch controls at both viewports and complete the step-twenty destination choice.

- [ ] **Step 5: Report findings by owner**

Every issue names severity, reproduction steps, expected behavior, actual behavior, responsible role, and blocking status.

- [ ] **Step 6: Commit the black-box suite and report**

```bash
git add e2e/qa reports/demo-v2-verification.md
git commit -m "test: verify demo v2 vertical slice"
```

**Done when:** There are no blocking findings, the full suite passes, and the controlling thread has inspected the final diff.

---

## 6. Recommended Dispatch Order

1. Start Systems alone as Wave 0.
2. Review Systems and merge the approved output to `integration/demo-v2-contracts`.
3. Create Narrative, Art, and early QA from that exact contract commit and run them in parallel.
4. Merge their approved outputs to `integration/demo-v2-wave1` and pass the Wave 1 gate.
5. Create Engineering from the Wave 1 integration commit.
6. Merge a green Engineering result to `integration/demo-v2-engineering`.
7. Create final QA from the Engineering integration commit.
8. Send every production defect back to Engineering; final QA never patches production code.
9. Merge to `main` only after final QA approval.
