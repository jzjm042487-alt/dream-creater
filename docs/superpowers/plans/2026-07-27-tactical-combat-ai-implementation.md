# Tactical Combat AI And Enemy Balance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy single-enemy chase logic with the approved deterministic `8 x 6` tactical battle engine, four AI difficulties, data-driven enemy profiles, 13 encounter definitions, lossless battle persistence, and repeatable balance/performance gates.

**Architecture:** Build a pure battle core below Phaser: immutable snapshots, an EasyStar path adapter, legal turn-plan enumeration, a shared simulator, Mistreevous intent selection, integer utility evaluation, and bounded deterministic search. JSON catalogs own actions, profiles, encounters, and balance fixtures; Phaser only renders committed state and requests player commands. Save migration persists the root battle seed and every in-progress decision field before animation, so reload never rerolls.

**Tech Stack:** JavaScript ESM, Node `node:test`, Phaser 3.90.0, Vite 8.1.5, `mistreevous@4.3.1`, `easystarjs@0.4.4`, `fast-check@4.9.0`, Playwright 1.62.0.

---

## Source Of Truth

Read these files before implementation:

- `docs/superpowers/specs/2026-07-27-tactical-combat-ai-and-enemy-balance-design.md`
- `docs/superpowers/specs/2026-07-27-qing-mao-simplified-mvp-design.md`, section 8
- `contracts/game-state-v3.md`
- `docs/superpowers/specs/2026-07-26-low-rank-gu-acquisition-and-care-design.md`, sections 8 and 9
- `docs/game-design/qing-mao-mvp-script/01-main-days-00-10.md`
- `docs/game-design/qing-mao-mvp-script/02-main-days-11-20.md`
- `docs/game-design/qing-mao-mvp-script/03-main-days-21-30.md`
- `docs/game-design/qing-mao-mvp-script/04-side-quests-q01-q03.md`
- `docs/game-design/qing-mao-mvp-script/05-side-quests-q04-q05.md`

When this plan and a source specification disagree, the specification wins. Do not silently reinterpret a formula or boundary.

## Scope And Non-Goals

This plan implements one subsystem: tactical combat, its AI, its persistence, and its encounter balance data.

It does not implement:

- narrative progression beyond changing battle entry points to registered `battleId` values;
- world travel, theft, Gu capture, Gu feeding, refinement, or crafting;
- attacks of opportunity, reactions, interrupts, facing, diagonals, fog of war, or three-enemy battles;
- battle theft, stolen essence, Wine Worm ownership transfer, Fang Yuan alertness, provenance, pursuit, or evidence;
- dynamic difficulty, hidden stat multipliers, runtime enemy scaling, or wall-clock search cutoffs.

The old `SLEIGHT_OF_HAND` and `STEAL_ESSENCE` battle actions must be removed. Theft remains a map interaction and is not represented by a combat action ID.

## File Map

### Data And Contracts

| File | Responsibility |
| --- | --- |
| `contracts/demo-v2-ids.json` | Unique registry for battle action/status/content IDs |
| `contracts/battle-action-catalog.schema.json` | Action, range, damage, status, requirement, and cost schema |
| `contracts/battle-ai-profile-catalog.schema.json` | Profile weights, preferred range, behavior-tree JSON, and boss phases |
| `contracts/battle-encounter-catalog.schema.json` | Board, entry variants, units, fixed stats, loadouts, and result policy |
| `contracts/battle-balance-matrix.schema.json` | Recommended entry states, three builds, five policies, and tier targets |
| `contracts/examples/battle-*.valid.json` | Minimal valid examples used by validator tests |
| `systems/battle/actions.json` | Runtime action source of truth |
| `systems/battle/ai-profiles.json` | Runtime Mistreevous trees and utility weights |
| `systems/battle/encounters.json` | All 13 encounter definitions |
| `systems/balance/battle-ai-matrix.json` | Fixed 13 x 3 x 5 balance fixtures |
| `THIRD_PARTY_NOTICES.md` | Exact dependency versions, licenses, and repository URLs |

### Pure Runtime

| File | Responsibility |
| --- | --- |
| `src/game/battle/content.js` | Parse catalogs once, expose frozen lookup maps, reject missing IDs |
| `src/game/battle/random.js` | UTF-8 FNV-1a, xorshift32 roll, hex seed derivation |
| `src/game/battle/pathfinder.js` | EasyStar reachability/distance and canonical U/L/R/D path reconstruction |
| `src/game/battle/ranges.js` | `melee`, `rangeN`, `lineN`, `radius1`, and `self` legality |
| `src/game/battle/state.js` | Create immutable battle state from encounter and player entry state |
| `src/game/battle/legalPlans.js` | Enumerate, key, order, and cap move-plus-action plans |
| `src/game/battle/simulator.js` | Shared movement/action/status/cooldown/result settlement |
| `src/game/battle/snapshot.js` | Public-information AI snapshot and deep freeze |
| `src/game/battle/behaviorPolicy.js` | Mistreevous JSON adapter returning exactly one intent |
| `src/game/battle/evaluator.js` | Approved features, integer weights, intent/action adjustments, tie-breaks |
| `src/game/battle/search.js` | Beginner, standard, hard, and prodigy bounded search |
| `src/game/battle/controller.js` | Fixed enemy order, atomic AI commit, phase and round advancement |
| `src/game/battle/persistence.js` | Battle-root seed, active-battle backfill, serialization checks |
| `src/game/rules/battleRules.js` | Thin public facade retained for scene imports |
| `src/game/state/persistentSeed.js` | Browser-safe one-time seed generation through Web Crypto |

### Integration And Verification

| File | Responsibility |
| --- | --- |
| `src/game/state/upgradeSaveEnvelope.js` | Browser-safe v2/old-v3/current-v3 migration |
| `scripts/game-state-v3-contract.mjs` | Node validation wrapper and backward-compatible export |
| `src/game/GameStateStore.js` | v3-first key loading, atomic battle saves, global next-battle difficulty |
| `src/main.js` | Resume active saved battle or start the persisted exploration scene |
| `src/game/scenes/BattleScene.js` | Render multiple units/obstacles and submit legal player plans |
| `src/game/scenes/ExploreScene.js` | Start battles by registered `battleId`, never by `kind` |
| `src/game/ui/GameUI.js` | Battle action list, selected difficulty label, settings binding |
| `index.html` | Compact difficulty settings control and battle readout targets |
| `src/styles.css` | Stable board/action/status dimensions for desktop and mobile |
| `scripts/validate-battle-balance.mjs` | Deterministic 15-case matrix and tier gates |
| `scripts/benchmark-battle-ai.mjs` | Warmup, P50/P95/max, leaf counts, machine metadata |
| `tests/battle*.test.js` | Unit, golden-scenario, persistence, property, and content tests |
| `e2e/battle-ai.spec.js` | Playable battle, `1v2`, difficulty display, save/reload determinism |

## Locked Runtime IDs

Increment `contracts/demo-v2-ids.json` from version `4` to version `5` and add these buckets. Do not invent aliases.

```json
{
  "battleActions": [
    "battle_action_basic_melee",
    "battle_action_defend",
    "battle_action_retreat",
    "battle_action_pass",
    "battle_action_moonblade",
    "battle_action_jade_skin",
    "battle_action_earth_listen",
    "battle_action_vitality_leaf",
    "battle_action_enemy_charge",
    "battle_action_enemy_ranged_strike",
    "battle_action_enemy_shell_guard",
    "battle_action_boss_gather_force",
    "battle_action_boss_pounce"
  ],
  "battleStatuses": [
    "battle_status_defending",
    "battle_status_jade_skin",
    "battle_status_shell_guard",
    "battle_status_gathering_force"
  ],
  "battleEncounterTiers": [
    "battle_tier_tutorial",
    "battle_tier_normal",
    "battle_tier_elite",
    "battle_tier_boss"
  ]
}
```

The already registered difficulty, profile, intent, action-category, reference-build, player-policy, and diagnostic IDs remain unchanged.

## Initial Action Values

These are the first executable values. Balance tuning may change integer power, cost, cooldown, or encounter unit stats only after the fixed matrix identifies a miss. Range semantics and action identity are not tuning knobs.

| Action ID | Type/category | Range | Cost/CD | Effect |
| --- | --- | --- | --- | --- |
| `battle_action_basic_melee` | basic attack/damage | `melee` | `0/0` | physical, base power `6`, attribute formula |
| `battle_action_defend` | defend/defend | `self` | `0/0` | next incoming hit halved, floor, minimum `1` |
| `battle_action_retreat` | retreat/reposition | edge self | `0/0` | player-only immediate retreat |
| `battle_action_pass` | pass/pass | `self` | `0/0` | no effect |
| `battle_action_moonblade` | skill/damage | `line3` | `3/0` | Gu damage, base power `8`, attribute formula |
| `battle_action_jade_skin` | skill/defend | `self` | `4/2` | `+3` physical defense, `+2` Gu defense, `2` turns |
| `battle_action_earth_listen` | skill/pass | `self` | `2/1` | reveal configured audible hidden units; unavailable when none exist |
| `battle_action_vitality_leaf` | item/pass | `self` | `0/0` | heal fixed `10`, consume one public use |
| `battle_action_enemy_charge` | skill/damage | `line3` | `4/2` | physical, base power `8`, attribute formula |
| `battle_action_enemy_ranged_strike` | skill/damage | `range3` | `3/1` | Gu damage, base power `7`, attribute formula |
| `battle_action_enemy_shell_guard` | skill/defend | `self` | `3/2` | `+4` physical defense, `+2` Gu defense, `2` turns |
| `battle_action_boss_gather_force` | boss/pass | `self` | `0/3` | apply visible gathering status for `1` enemy activation |
| `battle_action_boss_pounce` | boss/damage | `line3` | `5/3` | requires and consumes gathering status; fixed damage `13` |

Every applied battle status declares `aiControlValue: 0`; none of these effects removes the player's move or action.

## Initial Encounter Values

Use the board coordinates already fixed by the production screenplay. All units target only the opposing side.

| Battle | Enemy stats `HP/E/M/S/P/PD/GD` | Profile | Actions |
| --- | --- | --- | --- |
| `B-D07-01` | `32/6/3/20/30/1/1` | duelist | melee, moonblade, defend |
| `B-D10-01` | `38/0/2/40/10/2/1` | melee pursuer | melee |
| `B-D17-01` | `40/6/2/40/10/4/2` | guardian | melee, shell guard |
| `B-D19-01` | `50/15/3/40/55/3/3` | duelist | melee, moonblade, defend |
| `B-D21-01` | `38/8/3/50/20/2/1` | charger | melee, charge |
| `B-D24-01` | `38/12/3/20/50/1/2` | ranged skirmisher | melee, ranged strike, defend |
| `B-D26-01` | each `24/4/3/20/20/1/1` | pack hunter | melee, charge |
| `B-D27-01` | `42/8/3/60/20/2/1` | charger | melee, charge |
| `B-D29-01` | `68/24/3/70/50/4/4` | boss hunter | melee, gather force, pounce, defend |
| `B-Q02-01` | `50/8/2/50/10/5/3` | guardian | melee, shell guard |
| `B-Q03-01` | `40/12/3/40/40/2/2` | duelist | melee, ranged strike, defend |
| `B-Q04-01` | `36/12/3/10/50/1/1` | ranged skirmisher | ranged strike, defend |
| `B-Q05-01` | each `24/4/3/20/20/1/1` | pack hunter | melee, charge |

Legend: `HP` max health, `E` max essence, `M` move, `S` strength, `P` perception, `PD` physical defense, `GD` Gu defense.

The initial values are not accepted merely because they match this table. Task 13 must tune them until all automatic gates pass while preserving the pressure limits.

## Encounter Entry Variants

Every encounter has a `default` battle variant at the screenplay's default
player coordinate with `startingPhase: "player"`. The following additional
mechanical variants are exact:

| Battle | Variant | Mode | Player start | Starting phase/result |
| --- | --- | --- | --- | --- |
| `B-D24-01` | `retreat_ready` | battle | `(0,3)` | player |
| `B-D26-01` | `retreat_ready` | battle | `(0,3)` | player |
| `B-D29-01` | `rock_cover` | battle | `(2,1)` | player |
| `B-D29-01` | `retreat_ready` | battle | `(0,3)` | player |
| `B-Q02-01` | `enemy_first` | battle | `(1,3)` | enemy |
| `B-Q02-01` | `direct_retreat` | direct result | n/a | retreat |
| `B-Q03-01` | `flank` | battle | `(1,1)` | player |
| `B-Q03-01` | `direct_retreat` | direct result | n/a | retreat |
| `B-Q04-01` | `flank` | battle | `(1,1)` | player |
| `B-Q05-01` | `flank` | battle | `(1,1)` | player |
| `B-Q05-01` | `direct_retreat` | direct result | n/a | retreat |

A direct-result variant does not create a battle, derive a seed, or consume a
battle instance serial. The calling content event settles it as retreat.
Cosmetic opponent choices such as Mo Bei versus Chi Cheng do not create a
mechanical variant.

`startBattle(battleId, variantId = "default")` captures the current
`state.mvp.currentScene` as the persisted battle `returnScene`. The caller and
encounter JSON cannot pass a competing return scene. Victory and retreat return
there after content settlement; defeat returns there under the special defeat
rules. This makes the actual entry node authoritative and reload-safe.

## Boss Phase Values

`ai_profile_boss_hunter` defines three profile-local phase keys, used by
`B-D29-01` and evaluated only when the boss begins a decision:

| Phase | HP ratio | Phase action |
| --- | --- | --- |
| `healthy` | `(0.65, 1]` | none |
| `wounded` | `(0.30, 0.65]` | `battle_action_boss_gather_force` when legal |
| `desperate` | `[0, 0.30]` | `battle_action_boss_gather_force` when legal |

If the phase action is on cooldown, its required status is already present, or
the action is otherwise illegal, `HasPhaseAction` is false and the common tree
continues to defend/conserve/attack/reposition. Pounce is selected through
`finish` or `attack` after gathering force is present. Crossing `0.65` or
`0.30` during settlement does not rewrite the current intent; the new phase
first applies at that unit's next decision.

## Reference Build Fixtures

Balance uses the `default` entry variant. Each compact stat tuple is
`HP/E/M/S/P/PD/GD` in the same order as the enemy table. Current health and
essence start at their listed maxima; Buff/Debuff arrays start empty. All 39
fixtures use `rankId: "rank_one"` so the baseline never assumes an optional
breakthrough.

| Battle | `reference_minimum` | `reference_balanced` | `reference_specialist` |
| --- | --- | --- | --- |
| `B-D07-01` | `36/16/3/15/20/0/0` | `40/20/3/20/30/1/1` | `38/24/3/10/45/0/2` |
| `B-D10-01` | `36/16/3/15/20/0/0` | `40/20/3/20/30/1/1` | `38/24/3/10/45/0/2` |
| `B-D17-01` | `40/20/3/25/30/1/1` | `44/24/3/30/40/2/2` | `42/28/3/20/55/1/3` |
| `B-D19-01` | `42/22/3/30/35/2/2` | `46/26/3/35/45/3/3` | `44/30/3/25/60/2/4` |
| `B-D21-01` | `44/24/3/35/40/2/2` | `48/28/3/40/50/3/3` | `46/32/3/30/65/2/4` |
| `B-D24-01` | `44/24/3/35/40/2/2` | `48/28/3/40/50/3/3` | `46/32/3/30/65/2/4` |
| `B-D26-01` | `46/26/3/40/45/3/3` | `50/30/3/45/55/4/4` | `48/34/3/35/70/3/5` |
| `B-D27-01` | `46/26/3/40/45/3/3` | `50/30/3/45/55/4/4` | `48/34/3/35/70/3/5` |
| `B-D29-01` | `48/28/3/45/50/4/4` | `52/32/3/50/60/5/5` | `50/36/3/40/75/4/6` |
| `B-Q02-01` | `40/20/3/25/30/1/1` | `44/24/3/30/40/2/2` | `42/28/3/20/55/1/3` |
| `B-Q03-01` | `42/22/3/30/35/2/2` | `46/26/3/35/45/3/3` | `44/30/3/25/60/2/4` |
| `B-Q04-01` | `44/24/3/35/40/2/2` | `48/28/3/40/50/3/3` | `46/32/3/30/65/2/4` |
| `B-Q05-01` | `46/26/3/40/45/3/3` | `50/30/3/45/55/4/4` | `48/34/3/35/70/3/5` |

All 39 fixtures expose exactly these action IDs:

```text
battle_action_basic_melee
battle_action_moonblade
battle_action_defend
battle_action_retreat
battle_action_pass
```

They have no public item action and no remaining item use. This deliberately
balances required progression without optional hidden opportunities such as
Jade Skin or Nine Leaf Vitality Grass. Optional Gu and items may make a real
player stronger, but are not needed to satisfy a baseline gate. The JSON stores
all 39 expanded objects with explicit integers and action arrays; it does not
store tuple strings or derive them at runtime.

## Implementation Tasks

### Task 1: Pin And Smoke-Test Third-Party Dependencies

**Files:**
- Create: `tests/battleDependencies.test.js`
- Create: `THIRD_PARTY_NOTICES.md`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Write the failing dependency smoke test**

```js
import test from "node:test";
import assert from "node:assert/strict";

test("approved battle libraries expose the required APIs", async () => {
  const mistreevous = await import("mistreevous");
  const easyStarModule = await import("easystarjs");
  const fastCheck = await import("fast-check");

  assert.equal(typeof mistreevous.BehaviourTree, "function");
  assert.equal("SUCCEEDED" in mistreevous.State, true);
  assert.equal(typeof (easyStarModule.default ?? easyStarModule).js, "function");
  assert.equal(typeof fastCheck.default.assert, "function");
  assert.equal(typeof fastCheck.default.property, "function");
});
```

- [ ] **Step 2: Verify the test fails because the packages are absent**

Run: `node --test tests/battleDependencies.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for the first missing approved package.

- [ ] **Step 3: Install exact versions**

Run:

```powershell
npm install --save-exact mistreevous@4.3.1 easystarjs@0.4.4
npm install --save-dev --save-exact fast-check@4.9.0
```

Verify `package.json` contains no `^` or `~` for these three packages.

- [ ] **Step 4: Add the notice file**

Record package, exact version, MIT license, and official repository URL for all three packages. Do not copy entire third-party license texts into source modules.

- [ ] **Step 5: Run the smoke test and build**

Run: `node --test tests/battleDependencies.test.js`

Expected: PASS.

Run: `npm run build`

Expected: Vite build exits `0`.

- [ ] **Step 6: Commit**

```powershell
git add package.json package-lock.json THIRD_PARTY_NOTICES.md tests/battleDependencies.test.js
git commit -m "build: add tactical battle AI dependencies"
```

### Task 2: Add Battle IDs, Schemas, And Validator Dispatch

**Files:**
- Create: `contracts/battle-action-catalog.schema.json`
- Create: `contracts/battle-ai-profile-catalog.schema.json`
- Create: `contracts/battle-encounter-catalog.schema.json`
- Create: `contracts/battle-balance-matrix.schema.json`
- Create: `contracts/examples/battle-actions.valid.json`
- Create: `contracts/examples/battle-ai-profiles.valid.json`
- Create: `contracts/examples/battle-encounters.valid.json`
- Create: `contracts/examples/battle-balance-matrix.valid.json`
- Modify: `contracts/demo-v2-ids.json`
- Modify: `scripts/contract-validator-core.mjs`
- Modify: `scripts/validate-contracts.mjs`
- Modify: `tests/contractValidation.test.js`

- [ ] **Step 1: Extend the validator tests first**

Add all four valid examples to `simplified contract examples validate`. Add temporary invalid fixtures that prove these paths fail:

```text
$.actions[0].id unknown battleActions id: battle_action_unknown
$.profiles[0].id unknown battleAiProfiles id: ai_profile_unknown
$.encounters[0].battleId unknown battles id: B-UNKNOWN
$.encounters[0].enemies[0].profileId unknown battleAiProfiles id: ai_profile_unknown
$.profiles[0].weights.targetLoss must be <= 1000
$.actions[0].aiUtilityAdjustment must be >= -100
$.actions[0].statusEffect.aiControlValue is required
$.encounters[0].board.blockedCells[0].x must be <= 7
$.profiles[0].phases[1].maximumHpRatio must be <= 1
$.profiles[0].phases[1] overlaps the previous phase
```

The fixtures must still be created under `os.tmpdir()` and removed in `finally`.

- [ ] **Step 2: Run the focused test to see schema dispatch fail**

Run: `node --test tests/contractValidation.test.js`

Expected: FAIL because battle examples have no schema mapping or registry bucket.

- [ ] **Step 3: Add registry buckets and validator mappings**

Add the locked IDs above and expose them from `loadRegistry()` as:

```js
battleActions: ids.systemIds.battleActions,
battleStatuses: ids.systemIds.battleStatuses,
battleEncounterTiers: ids.systemIds.battleEncounterTiers,
battleAiDifficulties: ids.systemIds.battleAiDifficulties,
battleAiProfiles: ids.systemIds.battleAiProfiles,
battleAiIntents: ids.systemIds.battleAiIntents,
battleActionCategories: ids.systemIds.battleActionCategories,
battleBalanceReferenceBuilds: ids.systemIds.battleBalanceReferenceBuilds,
battleBalancePlayerPolicies: ids.systemIds.battleBalancePlayerPolicies
```

Map exact basenames before generic `"battle"` matching:

```js
if (base.includes("battle-actions") || normalized.endsWith("/systems/battle/actions.json")) {
  return path.join(CONTRACTS, "battle-action-catalog.schema.json");
}
if (base.includes("battle-ai-profiles") || normalized.endsWith("/systems/battle/ai-profiles.json")) {
  return path.join(CONTRACTS, "battle-ai-profile-catalog.schema.json");
}
if (base.includes("battle-encounters") || normalized.endsWith("/systems/battle/encounters.json")) {
  return path.join(CONTRACTS, "battle-encounter-catalog.schema.json");
}
if (base.includes("battle-balance-matrix")) return path.join(CONTRACTS, "battle-balance-matrix.schema.json");
```

- [ ] **Step 4: Implement strict Draft 2020-12-compatible schema subsets**

All top-level and nested authored objects use `additionalProperties: false`. Require:

- action ID/type/category/target/range/cost/cooldown/utility adjustment;
- range bounds with `0 <= min <= max <= 12`; `self` requires `0..0`,
  `melee` requires `1..1`, and all other offensive templates require positive
  maximum range;
- damage kind and either fixed damage or base-power formula, never both;
- status ID, duration, and integer `aiControlValue` `0..100`;
- profile ID, preferred range, all eight integer weights, and behavior-tree root;
- encounter battle ID/tier/board/entry variants/enemy list/order/result policy;
- unit max health/max essence/move/attributes/defenses/loadout;
- one or more entry variants, first variant `default`, with unique local IDs,
  exact battle/direct-result fields, and a starting phase for battle variants;
- balance battle ID, recommended rank/entry, exactly three registered builds,
  exactly five policies, and targets.

The current hand-written validator does not implement JSON Schema `oneOf`. Add a small semantic validator for mutually exclusive action fields and range ordering instead of pretending unsupported keywords are enforced.

- [ ] **Step 5: Add valid examples and semantic checks**

Examples must be complete small catalogs, not empty placeholders. Add semantic checks for:

- duplicate action/profile/battle IDs;
- encounter loadout action IDs not present in the action catalog when validating production content;
- duplicate unit IDs or occupied start cells;
- duplicate/missing entry variants and spawn cells occupied by obstacles/units;
- battle variants missing `playerSpawn`/`startingPhase`, direct-result variants
  carrying battle-only fields, and unknown `variantId` lookups;
- blocked/start cells outside `8 x 6`;
- `enemyUnitOrder` exactly matching enemy content order;
- `ai_profile_pack_hunter` only on two-enemy encounters;
- preferred range within `0..12`;
- allowed Mistreevous node types only: `root`, `selector`, `sequence`, `condition`, `action`;
- condition/action calls limited to the adapter whitelist;
- at least one terminal `SetIntent` action;
- no `wait`, `lotto`, `repeat`, `retry`, promises, or `RUNNING`.

- [ ] **Step 6: Run contract validation**

Run: `node scripts/validate-contracts.mjs`

Expected: PASS with the increased JSON/content counts.

Run: `node --test tests/contractValidation.test.js`

Expected: PASS, including field-level invalid errors and temp cleanup.

- [ ] **Step 7: Commit**

```powershell
git add contracts scripts/contract-validator-core.mjs scripts/validate-contracts.mjs tests/contractValidation.test.js
git commit -m "feat(contracts): define tactical battle catalogs"
```

### Task 3: Author Runtime Action, Profile, Encounter, And Balance Catalogs

**Files:**
- Create: `systems/battle/actions.json`
- Create: `systems/battle/ai-profiles.json`
- Create: `systems/battle/encounters.json`
- Create: `systems/balance/battle-ai-matrix.json`
- Create: `tests/battleContent.test.js`
- Modify: `scripts/validate-contracts.mjs`
- Modify: `scripts/validate-content.mjs`

- [ ] **Step 1: Write content assertions before catalogs**

Test exact counts and mappings:

```js
assert.equal(actions.actions.length, 13);
assert.equal(profiles.profiles.length, 7);
assert.equal(encounters.encounters.length, 13);
assert.equal(matrix.encounters.length, 13);
assert.deepEqual(
  encounters.encounters.filter((entry) => entry.enemies.length === 2).map((entry) => entry.battleId),
  ["B-D26-01", "B-Q05-01"]
);
```

Also assert every registered battle appears exactly once, all four difficulties share one encounter object, and no action ID contains `steal`, `sleight`, `theft`, or `wine_worm`.
Assert the complete encounter-entry table above, including exact coordinates,
starting phases, direct results, and the rule that direct results consume no
serial.

- [ ] **Step 2: Run the test and confirm missing catalogs**

Run: `node --test tests/battleContent.test.js`

Expected: FAIL with module/file-not-found.

- [ ] **Step 3: Author `actions.json` from the locked action table**

Use an object catalog:

```json
{
  "version": 1,
  "actions": [
    {
      "id": "battle_action_basic_melee",
      "type": "basicAttack",
      "category": "damage",
      "targetSide": "opponent",
      "range": { "kind": "melee", "minimum": 1, "maximum": 1, "blockedByUnits": false },
      "essenceCost": 0,
      "cooldownTurns": 0,
      "damage": { "kind": "physical", "basePower": 6, "usesAttribute": true },
      "aiUtilityAdjustment": 0
    }
  ]
}
```

Fill every remaining entry from the action table. Do not add battle-only theft or unapproved range kinds.

- [ ] **Step 4: Author all seven profiles**

Each profile contains:

- exact registered ID;
- preferred range from section 13.1;
- the eight weights from section 9.2;
- `lowHealthRatio: 0.30`;
- `lowEssenceRatio: 0.25`;
- JSON behavior tree;
- boss phases only for `ai_profile_boss_hunter`, using the exact
  `healthy`/`wounded`/`desperate` thresholds and action mapping above.

Use this common tree shape:

```json
{
  "type": "root",
  "child": {
    "type": "selector",
    "children": [
      { "type": "sequence", "children": [
        { "type": "condition", "call": "CanFinish" },
        { "type": "action", "call": "SetIntent", "args": ["finish"] }
      ]},
      { "type": "sequence", "children": [
        { "type": "condition", "call": "HasPhaseAction" },
        { "type": "action", "call": "SetIntent", "args": ["phase_action"] }
      ]},
      { "type": "sequence", "children": [
        { "type": "condition", "call": "ShouldDefend" },
        { "type": "action", "call": "SetIntent", "args": ["defend"] }
      ]},
      { "type": "sequence", "children": [
        { "type": "condition", "call": "ShouldConserve" },
        { "type": "action", "call": "SetIntent", "args": ["conserve"] }
      ]},
      { "type": "sequence", "children": [
        { "type": "condition", "call": "HasEffectiveAttack" },
        { "type": "action", "call": "SetIntent", "args": ["attack"] }
      ]},
      { "type": "action", "call": "SetIntent", "args": ["reposition"] }
    ]
  }
}
```

`HasPhaseAction` returns false for non-boss profiles. This is still JSON as the only source; do not maintain an MDSL copy.

- [ ] **Step 5: Author all 13 encounters**

Copy exact board/spawn/obstacle data from the screenplay files and exact stats/loadouts from the initial encounter table. Give every enemy a stable encounter-local unit ID such as `B-D26-01.enemy.1`; `enemyUnitOrder` is the authored array order.

Every encounter stores:

```js
{
  battleId,
  tierId,
  board: { width: 8, height: 6, blockedCells },
  entryVariants: [{
    variantId: "default",
    mode: "battle",
    playerSpawn: { x, y },
    startingPhase: "player"
  }],
  enemies,
  enemyUnitOrder,
  resultPolicy: {
    simultaneousZero: "playerVictory",
    allowRetreat: true,
    returnMode: "entryScene",
    maxBalanceRounds: 20
  }
}
```

`variantId` is encounter-local and must match `^[a-z][a-z0-9_]*$`. The first
entry is always the `default` battle variant. A battle variant requires
`playerSpawn` and `startingPhase`; a direct-result variant requires `result`
and forbids both fields. Author the exact entry-variant and boss-phase tables
above. The scene passes the selected local variant when it starts the encounter;
a missing variant is a content error, not a reason to choose a fallback cell.
Scenery cells such as the `B-Q03-01` cargo box and `B-Q04-01` central seedling
belong in `board.blockedCells` with a local `kind` label and are never units or
targets.

Do not add story rewards to this catalog. Reward IDs and quest progression remain owned by content events.

- [ ] **Step 6: Author three builds and five policies for every battle**

Expand the exact 39 reference fixtures above into explicit JSON objects. Do not
derive enemy values from the selected player build at runtime. The three build
IDs and five policy IDs must appear once per encounter, and every build stores
its rank, full health, essence, movement, four public attributes/defenses,
action array, and empty public item-use array.

- [ ] **Step 7: Validate and run content tests**

Run: `node scripts/validate-contracts.mjs`

Expected: PASS.

Run: `node scripts/validate-content.mjs systems/battle/actions.json systems/battle/ai-profiles.json systems/battle/encounters.json systems/balance/battle-ai-matrix.json`

Expected: PASS.

Run: `node --test tests/battleContent.test.js`

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add systems contracts scripts tests/battleContent.test.js
git commit -m "feat(content): add tactical battle data catalogs"
```

### Task 4: Implement Deterministic Random And Battle Seed Derivation

**Files:**
- Create: `src/game/battle/random.js`
- Create: `tests/battleRandom.test.js`

- [ ] **Step 1: Write fixed-vector and boundary tests**

Cover:

```js
assert.equal(deterministicRandom("00000000", 0), 0.5137210513930768);
assert.equal(deterministicRandom("abc", 0), 0.11610232456587255);
assert.equal(deterministicRandom("abc", 1), 0.25398650323040783);
assert.equal(deriveBattleSeedRoot("theft-seed"), "fe5f99fb");
assert.equal(deriveBattleSeed("fe5f99fb", "B-D10-01", 0), "54c47c21");
```

Also reject non-string seeds, negative/fractional/unsafe cursors, and negative/fractional serials. Test beginner bucket edges with injected rolls `0`, `0.599999`, `0.60`, `0.849999`, `0.85`, and just below `1`.

- [ ] **Step 2: Verify the module is missing**

Run: `node --test tests/battleRandom.test.js`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement the approved algorithm verbatim**

Export:

```js
export function fnv1aUtf8(text) {}
export function xorshift32(value) {}
export function deterministicRandom(seed, cursor) {}
export function hex8(value) {}
export function deriveBattleSeedRoot(theftSeed) {}
export function deriveBattleSeed(root, battleId, serial) {}
export function beginnerChoiceIndex(candidateCount, roll) {}
```

`beginnerChoiceIndex` returns `0` when only one candidate exists; with two candidates, missing third-place probability is added to first place; with three or more it uses `60/25/15`.

- [ ] **Step 4: Run focused tests**

Run: `node --test tests/battleRandom.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/game/battle/random.js tests/battleRandom.test.js
git commit -m "feat(battle): add deterministic AI random"
```

### Task 5: Implement EasyStar Reachability And Canonical Paths

**Files:**
- Create: `src/game/battle/pathfinder.js`
- Create: `tests/battlePathfinder.test.js`

- [ ] **Step 1: Write golden path tests**

Cover:

- open-grid equal paths choose up, then left, then right, then down;
- a full obstacle column is routed around;
- player, other enemies, and already-moved enemies are occupied;
- the actor start is temporarily walkable;
- unreachable returns `{ reachable: false }`;
- the adapter does not leak `avoidAdditionalPoint` state between calls;
- reachable endpoints sort by path cost, `y`, `x`, then direction ranks.

Use an obstacle case whose exact canonical path is asserted as coordinate arrays, not only distance.

- [ ] **Step 2: Verify failure**

Run: `node --test tests/battlePathfinder.test.js`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement a fresh EasyStar query context per snapshot**

Export:

```js
export const DIRECTION_ORDER = Object.freeze([
  { name: "up", dx: 0, dy: -1, rank: 0 },
  { name: "left", dx: -1, dy: 0, rank: 1 },
  { name: "right", dx: 1, dy: 0, rank: 2 },
  { name: "down", dx: 0, dy: 1, rank: 3 }
]);

export function findDistance(board, occupiedCells, start, end) {}
export function findCanonicalPath(board, occupiedCells, start, end) {}
export function listReachableDestinations(board, occupiedCells, start, move) {}
```

Use `enableSync()`, `setGrid()`, `setAcceptableTiles([0])`, `findPath()`, and `calculate()`. EasyStar determines shortest distance/reachability. Reconstruct the canonical path by checking U/L/R/D neighbors whose remaining distance is exactly `D - 1`; do not trust EasyStar's equal-path ordering.

- [ ] **Step 4: Run focused tests**

Run: `node --test tests/battlePathfinder.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/game/battle/pathfinder.js tests/battlePathfinder.test.js
git commit -m "feat(battle): add canonical grid pathfinding"
```

### Task 6: Create Battle State, Range Rules, And Legal Turn Plans

**Files:**
- Create: `src/game/battle/content.js`
- Create: `src/game/battle/ranges.js`
- Create: `src/game/battle/state.js`
- Create: `src/game/battle/legalPlans.js`
- Create: `tests/battleLegalPlans.test.js`

- [ ] **Step 1: Write tests for each range and legality constraint**

Test:

- `melee`, `range3`, `line3`, `radius1`, and `self`;
- line blockers include units and board obstacles;
- a plan is zero-or-one movement plus exactly one action;
- path includes start/end and `pathCost === path.length - 1`;
- essence, cooldown, required/forbidden status, target side, and remaining item use;
- retreat only from a reachable edge destination;
- explicit pass when no attack/skill/defend plan exists;
- candidate key and raw enumeration order;
- raw cap `256` truncates only by `enumerationOrder` and records a development
  cap diagnostic; it never uses `ai_no_legal_plan` and never uses a time budget.

Assert the key format:

```text
destination.y,destination.x,pathDirectionRanks,actionTypeRank,actionId,targetUnitId,target.y,target.x
```

- [ ] **Step 2: Verify tests fail**

Run: `node --test tests/battleLegalPlans.test.js`

Expected: FAIL with missing modules.

- [ ] **Step 3: Add frozen catalog lookup**

`content.js` imports the four JSON catalogs with JSON import attributes, builds `Map` lookups once, deep-freezes exposed values, and throws an exact missing-ID error. It must work under both Node tests and Vite.

- [ ] **Step 4: Implement state creation and ranges**

`createBattleState()` receives
`{ encounter, entryVariantId, playerEntry, difficultyId, aiSeed, serial, returnScene }`.
It resolves the registered entry variant before creating state; direct-result
variants are rejected here because they never create a battle.

- `round: 1`, the variant's exact `startingPhase`, no result;
- board and fixed obstacles;
- player plus one or two enemies;
- `enemyUnitOrder`; `activeEnemyUnitId` is `null` for player start or the first
  living authored enemy for enemy start;
- copied action definitions/content snapshot;
- empty cooldown/status/history arrays;
- revealed player actions containing move, basic melee, and defend;
- `aiCursor: 0`, `decisionIndex: 0`.

Reject overlapping/out-of-board content before returning.

- [ ] **Step 5: Implement complete candidate enumeration**

Use canonical reachable endpoints, then legal actions/targets. Sort once with explicit comparators; never rely on object insertion order. Keep separate `enumerationOrder` and `decisionOrder`.

- [ ] **Step 6: Run focused tests**

Run: `node --test tests/battleLegalPlans.test.js`

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add src/game/battle tests/battleLegalPlans.test.js
git commit -m "feat(battle): enumerate legal turn plans"
```

### Task 7: Implement The Shared Pure Simulator

**Files:**
- Create: `src/game/battle/simulator.js`
- Create: `tests/battleSimulator.test.js`

- [ ] **Step 1: Write settlement tests**

Cover:

- physical and Gu formulas, fixed damage, floor, and minimum damage `1`;
- legal range always hits and no random source is called;
- defend halves one incoming hit, floors, and still deals at least `1`;
- Jade Skin/Shell Guard duration and modifiers;
- gather-force then pounce requirement/consumption;
- essence cost and cooldown;
- item use decrement and healing clamp;
- status/cooldown end timing;
- action category priority: damage, control, defend, reposition, pass;
- terminal order: all enemies dead, player dead, retreat, continue;
- simultaneous player/last-enemy zero is player victory;
- simulation never mutates input or persistent save state.

Lock numeric fixtures:

```js
// 6 + floor(20 / 20) - 1
assert.equal(calculateDamage(strength20, physicalDefense1, basicMelee), 6);
// 8 + floor(30 / 25) - 1
assert.equal(calculateDamage(perception30, guDefense1, moonblade), 8);
assert.equal(calculateDamage(anyActor, anyDefense, fixedBossPounce), 13);
assert.equal(applyDefendReduction(7), 3);
```

- [ ] **Step 2: Verify tests fail**

Run: `node --test tests/battleSimulator.test.js`

Expected: FAIL with missing simulator.

- [ ] **Step 3: Implement one settlement path for preview and commit**

Export:

```js
export function calculateDamage(actor, target, action) {}
export function classifyCommittedPlan(before, after, plan, summary) {}
export function resolveBattleResult(state, retreatSubmitted = false) {}
export function simulateTurnPlan(snapshot, plan) {}
```

Return:

```js
{
  snapshot,
  settlementSummary: {
    actionId,
    actionCategory,
    hpChanges,
    essenceChanges,
    appliedStatuses,
    removedStatuses,
    cooldownChanges,
    result
  }
}
```

No separate "AI damage" implementation is allowed. Formal commit calls this same function, then writes its returned snapshot.

`battle_status_defending` uses `duration: "scene"` plus action metadata
`consumeOn: "nextIncomingDamage"` and is removed after it modifies one positive
incoming hit. It does not expire merely because the owner receives another
activation. Turn-based statuses added during an activation are not decremented
at the end of the same activation; their first decrement is at the end of the
owner's next activation. This makes two-turn Jade/Shell defense and one-
activation boss gathering deterministic.

- [ ] **Step 4: Run focused tests**

Run: `node --test tests/battleSimulator.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/game/battle/simulator.js tests/battleSimulator.test.js
git commit -m "feat(battle): add pure combat settlement"
```

### Task 8: Enforce Public Information And Resolve Intent With Mistreevous

**Files:**
- Create: `src/game/battle/snapshot.js`
- Create: `src/game/battle/behaviorPolicy.js`
- Create: `tests/battleSnapshot.test.js`
- Create: `tests/battleBehaviorPolicy.test.js`

- [ ] **Step 1: Write public-snapshot leak tests**

Build a player with:

- one revealed action;
- one unrevealed action;
- one public item use;
- one hidden inventory item;
- visible and hidden passive fields.

Assert JSON serialization of `createAiSnapshot()` contains only the approved public fields and cannot be mutated.

- [ ] **Step 2: Write intent-order tests**

Test exact priority:

1. no decision after terminal;
2. `finish`;
3. boss `phase_action`;
4. `defend`;
5. `conserve`;
6. `attack`;
7. `reposition`.

Assert one `tree.step()` resolves and never returns `RUNNING`. Stub `Math.random` to throw to prove the adapter never uses it.

- [ ] **Step 3: Verify tests fail**

Run: `node --test tests/battleSnapshot.test.js tests/battleBehaviorPolicy.test.js`

Expected: FAIL with missing modules.

- [ ] **Step 4: Implement the public snapshot**

Copy only section 6.1 fields. Resolve action definitions into the immutable content snapshot before decision-making. Unknown Gu, item, passive, and future random fields remain inaccessible.

- [ ] **Step 5: Implement the Mistreevous adapter**

Use:

```js
const tree = new BehaviourTree(profile.behaviorTree, agent, {
  getDeltaTime: () => 0,
  random: () => {
    throw new Error("battle behavior trees may not request randomness");
  }
});
tree.step();
```

Every condition is pure. `SetIntent(intent)` stores one registered intent and returns `State.SUCCEEDED`. Reject unresolved/RUNNING trees as content defects.

- [ ] **Step 6: Run focused tests**

Run: `node --test tests/battleSnapshot.test.js tests/battleBehaviorPolicy.test.js`

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add src/game/battle/snapshot.js src/game/battle/behaviorPolicy.js tests/battleSnapshot.test.js tests/battleBehaviorPolicy.test.js
git commit -m "feat(battle): add public AI behavior policy"
```

### Task 9: Implement Integer Utility Evaluation And Stable Tie-Breaks

**Files:**
- Create: `src/game/battle/evaluator.js`
- Create: `tests/battleEvaluator.test.js`

- [ ] **Step 1: Write feature, terminal, adjustment, and tie tests**

Test all eight features, exact profile weights, terminal scores
`+100000/+90000/-100000`, action adjustment, intent adjustment, and
per-weighted-term integer rounding before summation. Include:

- dead root actor gives zero immediate threat/range fit/exposure;
- duplicate control takes the highest value only;
- `1v1` coordination is zero;
- `1v2` occupancy/approach-side/attack-coverage score;
- third consecutive defend/reposition/pass is filtered only when a progress plan exists;
- equal utility follows finish, action rank, lower essence, lower path, canonical key.
- a rounding fixture with two features of `0.5` and weights `3` that contributes
  `round(1.5) + round(1.5) = 4`, never `round(3) = 3`;
- a control fixture whose root/leaf balances produce exactly `0.30`;
- coordination fixtures for coverage `0`, `0.5`, and `1`.

- [ ] **Step 2: Verify tests fail**

Run: `node --test tests/battleEvaluator.test.js`

Expected: FAIL with missing evaluator.

- [ ] **Step 3: Implement the approved evaluation context**

Export:

```js
export function buildEvaluationFeatures(context) {}
export function evaluateBattleState(context) {}
export function compareEnemyDecisions(a, b) {}
export function comparePlayerResponses(a, b) {}
export function filterThirdRepeat(candidates, snapshot, actorUnitId) {}
```

Use root actor/profile/intent for the complete branch. Local scores used to trim a non-root actor's candidates must not replace the final root-view leaf score.
Round each of the eight weighted feature products separately exactly as shown
in specification section 9.2, including separately rounded exposure subtraction;
never round the final floating subtotal as one value.

- [ ] **Step 4: Run focused tests**

Run: `node --test tests/battleEvaluator.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/game/battle/evaluator.js tests/battleEvaluator.test.js
git commit -m "feat(battle): add deterministic utility evaluation"
```

### Task 10: Implement Four Difficulty Searches And `1v2` Ordering

**Files:**
- Create: `src/game/battle/search.js`
- Create: `tests/battleSearch.test.js`
- Create: `tests/battleGoldenScenarios.test.js`

- [ ] **Step 1: Write search-shape tests**

Instrument leaf expansion and assert:

| Mode | Required search |
| --- | --- |
| beginner | current enemy only; top 3 roll; max 2 actions per destination |
| standard | current enemy only; global best; max 3 actions per destination |
| hard | top 8 root, remaining enemies first, top 6 player responses |
| prodigy `1v1` | `8 x 6 x 6`, terminal early exit |
| prodigy first enemy `1v2` | `5 x 5 x 6` |
| prodigy second enemy `1v2` | `5 x 6` |

Assert hard/prodigy never place a player response between two enemies in the same enemy phase.

- [ ] **Step 2: Add approved golden scenarios**

Include:

- melee enemy routes around an obstacle column and attacks;
- ranged enemy repositions when engaged in melee;
- low-health enemy defends or repositions under a revealed kill threat;
- standard selects a legal kill over non-lethal damage;
- beginner fixed seed chooses second or third candidate;
- pack hunters avoid duplicate destination and approach from different sides;
- save after enemy one means enemy two's next canonical plan is unchanged;
- crossing boss HP from above to at/below `0.65`, and from above to at/below
  `0.30`, changes phase only on the boss's next decision;
- every `retreat_ready` entry has a legal zero-move retreat plan immediately;
- hard and prodigy include a legal edge retreat among predicted player
  responses; use a fixture where excluding retreat selects a different root
  action, and assert the retreat-aware root result;
- save/load with two prior defend/reposition/pass categories preserves the
  third-repeat filter and next decision;
- simultaneous final zero scores as player victory.

- [ ] **Step 3: Verify tests fail**

Run: `node --test tests/battleSearch.test.js tests/battleGoldenScenarios.test.js`

Expected: FAIL with missing search module.

- [ ] **Step 4: Implement bounded search without clock checks**

Export:

```js
export function chooseEnemyPlan(snapshot, dependencies = {}) {}
export function searchBeginner(context) {}
export function searchStandard(context) {}
export function searchHard(context) {}
export function searchProdigy(context) {}
```

The dependency object may inject enumerator/simulator/evaluator for test instrumentation. It may not inject a time budget. Only beginner returns `consumedRandom: true`.

- [ ] **Step 5: Run focused tests**

Run: `node --test tests/battleSearch.test.js tests/battleGoldenScenarios.test.js`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/game/battle/search.js tests/battleSearch.test.js tests/battleGoldenScenarios.test.js
git commit -m "feat(battle): add bounded difficulty search"
```

### Task 11: Add Atomic Controller And Lossless Battle Persistence

**Files:**
- Create: `src/game/battle/controller.js`
- Create: `src/game/battle/persistence.js`
- Create: `src/game/state/persistentSeed.js`
- Create: `src/game/state/upgradeSaveEnvelope.js`
- Create: `tests/battleController.test.js`
- Create: `tests/battlePersistence.test.js`
- Modify: `scripts/game-state-v3-contract.mjs`
- Modify: `tests/gameStateV3Contract.test.js`
- Modify: `contracts/game-state-v3.md`

- [ ] **Step 1: Write controller order tests**

Test:

- player move plus one action, then end-of-player effects;
- enemy order is authored and dead units are skipped without reordering;
- each enemy reads the previously committed enemy state;
- every AI plan is revalidated before commit;
- one invalid beginner candidate reuses the same uncommitted roll against the
  remaining top three; no cursor advances until a plan commits;
- one invalid non-beginner candidate chooses the next item from the already
  ordered list without rerunning search;
- all invalid candidates commit explicit pass, increment `decisionIndex`, and
  log `ai_no_legal_plan` only to the development log;
- a pathfinder exception restricts the actor to origin-cell actions, then pass
  if none exist; it never permits teleporting or direct damage;
- formal category history keeps only two entries;
- beginner increments `aiCursor` once, other modes never do;
- every committed AI action increments `decisionIndex` once;
- round advances only after all living enemies finish.

- [ ] **Step 2: Write migration/idempotence tests**

Cover v2, old v3 with no rules version, v3 rules version `1` with no battle AI root, and current v3. Assert:

```js
state.mvp.battleAi = {
  contractVersion: 1,
  battleSeedRoot: "derived-once",
  nextBattleInstanceSerial: 0
};

state.mvp.settings = {
  battleDifficultyId: "ai_difficulty_standard"
};
```

For an old active battle, assert one serial is consumed exactly once and backfilled fields are byte-identical after a second migration.

Test `generatePersistentSeed()` with an injected Web Crypto stub that writes
bytes `00..0f` and expect exactly
`"000102030405060708090a0b0c0d0e0f"`. Missing `getRandomValues` throws; there
is no `Math.random` fallback.

- [ ] **Step 3: Verify focused tests fail**

Run: `node --test tests/battleController.test.js tests/battlePersistence.test.js tests/gameStateV3Contract.test.js`

Expected: FAIL with missing controller/persistence and missing migration defaults.

- [ ] **Step 4: Move migration logic to a browser-safe pure module**

`src/game/state/upgradeSaveEnvelope.js` accepts explicit registry/seeds dependencies and contains no `node:path`, `node:fs`, DOM, or localStorage access. Keep `scripts/game-state-v3-contract.mjs` as a wrapper that injects the contract registry, validates the migrated player, and re-exports the same public function for existing tests.

Do not bump `state.version`; add a battle contract version under `state.mvp.battleAi.contractVersion: 1`. Existing `mvp.rulesVersion: 1` saves must receive additive idempotent battle defaults instead of taking the old early return.

Implement:

```js
export function generatePersistentSeed(cryptoSource = globalThis.crypto) {
  if (!cryptoSource || typeof cryptoSource.getRandomValues !== "function") {
    throw new Error("Web Crypto getRandomValues is required to create a save seed");
  }
  const bytes = new Uint8Array(16);
  cryptoSource.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
```

This randomness is used only to create persistent save seeds. Battle decisions
still use only saved `aiSeed + aiCursor`.

- [ ] **Step 5: Implement root seed reservation and active battle serialization**

`reserveBattleInstance()` must return a new envelope and battle seed in one pure operation. The caller persists that envelope before entering Phaser. `commitEnemyDecision()` performs the exact nine-step atomic order in specification section 12.4.

- [ ] **Step 6: Update the persistence contract**

Document every mandatory field, additive old-v3 migration, serial consumption,
category history, public actions/items, difficulty freeze, byte-identical
repeated upgrade, and the exact defeat settlement from simplified MVP section
8.8.

The persisted global selection lives only at
`state.mvp.settings.battleDifficultyId`. A battle copies it to
`state.mvp.battle.difficultyId` at reservation time; changing settings later
does not mutate the active battle.

- [ ] **Step 7: Run focused tests**

Run: `node --test tests/battleController.test.js tests/battlePersistence.test.js tests/gameStateV3Contract.test.js`

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add src/game/battle/controller.js src/game/battle/persistence.js src/game/state/persistentSeed.js src/game/state/upgradeSaveEnvelope.js scripts/game-state-v3-contract.mjs contracts/game-state-v3.md tests
git commit -m "feat(battle): persist deterministic battle decisions"
```

### Task 12: Integrate The New Engine With Store, Scene, And UI

**Files:**
- Modify: `src/game/GameStateStore.js`
- Modify: `src/main.js`
- Modify: `src/game/rules/battleRules.js`
- Modify: `src/game/scenes/BattleScene.js`
- Modify: `src/game/scenes/ExploreScene.js`
- Modify: `src/game/ui/GameUI.js`
- Modify: `index.html`
- Modify: `src/styles.css`
- Replace: `tests/battleRules.test.js`
- Create: `e2e/battle-ai.spec.js`

- [ ] **Step 1: Replace legacy rule tests**

Delete expectations for battle theft, stolen essence, Fang Yuan Wine Worm transfer, old defeat stone loss, and immediate one-enemy retaliation. Add facade tests for:

- registered `battleId` creation;
- obstacles and multiple enemies;
- player move-plus-action;
- fixed enemy phase;
- victory/failure/retreat result;
- defeat restores health to
  `max(1, floor(maximumHealth * 30 / 100))`, adds one non-duplicated
  `debuff_wounded` with `duration: "untilRest"`, and returns to the persisted
  entry scene;
- defeat preserves item counts, Gu instances, primeval stones, cultivation
  progress/overflow, equipment, recipes, and unknown migrated branches
  byte-for-byte;
- victory/retreat persist final health/essence and return to the same entry
  scene without applying generic punishment;
- fresh game, reset, and v2 migration each persist generated seeds once; a
  failed storage write changes neither in-memory state nor the v2 key;
- `finishBattle` applies a reward and quest-step callback in the same single
  storage write as result settlement; a throwing callback leaves battle,
  reward, quest, and storage unchanged;
- no battle action exposes theft.

- [ ] **Step 2: Write E2E tests before scene changes**

Test:

- enter `B-D17-01`, see an `8 x 6` board with obstacles and one enemy;
- move, choose an action, and observe committed enemy action;
- test-mode entry to `B-D26-01` renders two distinct enemies;
- battle panel shows selected difficulty label only, not score/intent/depth;
- save during battle, reload, and observe identical next enemy canonical action/damage;
- load an envelope with an unknown wrapper sentinel, save again, and verify the
  sentinel remains byte-equivalent in the v3 localStorage payload;
- mobile viewport has no board/HUD/action overlap.

- [ ] **Step 3: Run tests and verify legacy implementation fails**

Run: `node --test tests/battleRules.test.js`

Expected: FAIL because the old facade accepts `kind` and exposes theft actions.

Run: `npx playwright test e2e/battle-ai.spec.js`

Expected: FAIL because the old scene renders one enemy and has no v3 battle save.

- [ ] **Step 4: Upgrade `GameStateStore` transaction boundaries**

Read keys in order:

1. `tianwai-daojuren-save-v3`
2. `tianwai-daojuren-save-v2`

After successful migration, write v3 only and preserve v2. Expose:

```js
getBattleDifficulty()
setBattleDifficulty(difficultyId)
startBattle(battleId, variantId = "default")
submitPlayerPlan(plan)
advanceEnemyPhase()
finishBattle(applyContentDelta = (state, context) => state)
```

For a fresh game, reset, or v2/old-v3 migration missing a required seed:

1. generate only the missing `theftSeed` and `expeditionSeed` with
   `generatePersistentSeed(globalThis.crypto)`;
2. build and validate the complete v3 envelope in memory;
3. derive `battleSeedRoot` from the now-persisted theft seed;
4. write the complete envelope to `tianwai-daojuren-save-v3` with one
   `setItem`;
5. replace `this.envelope` only after that write succeeds.

If generation, migration, validation, serialization, or `setItem` throws,
retain the previous in-memory envelope and write nothing else. Never overwrite
or delete the v2 key. Reset creates fresh seeds once and immediately persists
the new v3 envelope before restarting a scene.

The setting changes the next battle only. Active battle difficulty remains frozen.
`startBattle` captures `state.mvp.currentScene` as `returnScene`; it accepts no
caller override. A direct-result variant returns a content-resolution result
without reserving a battle serial.

`finishBattle(applyContentDelta)` performs one synchronous transaction:

1. deep-copy the complete envelope;
2. apply generic victory/defeat/retreat settlement to the copy;
3. call the pure synchronous callback with the copied state and
   `{ battleId, serial, result }`;
4. require the callback to return the next state without touching storage;
5. clear `state.mvp.battle`;
6. validate and serialize the complete envelope;
7. call v3 `setItem` exactly once;
8. replace `this.envelope` and emit only after the write succeeds.

If the callback throws or any later step fails, the old active battle remains
in memory and storage and no reward is committed. Encounter rewards and quest
progression are therefore applied by the caller in the same write; the generic
battle layer never invents them. On defeat it applies the exact `30%`/wounded
settlement above and never removes or changes items, Gu, stones, cultivation,
equipment, recipes, opportunities, or character state before the caller's
explicit content delta.

- [ ] **Step 5: Preserve the complete envelope and resume its active scene**

The store owns `this.envelope`, not only reconstructed `state` and `journal`
fields. Every save updates those two fields on a deep copy of the complete
loaded/migrated envelope, preserving unknown wrapper and state branches before
writing the v3 key.

Replace `restartExplore()` in `src/main.js` with `resumePersistedScene()`:

```js
function resumePersistedScene() {
  game.scene.stop("battle");
  game.scene.stop("explore");
  const state = store.getState();
  if (state.mvp.battle) {
    game.scene.start("battle", { resume: true });
    return;
  }
  game.scene.start("explore", {
    mapId: state.mvp.currentScene.id,
    entrance: state.mvp.currentScene.entrance
  });
}
```

Use this branch after initial boot, load, and reset. A resumed battle reads only
the persisted battle state; it does not reserve a serial, reconstruct units, or
run an AI decision until the normal controller requests the next activation.

- [ ] **Step 6: Make `battleRules.js` a thin facade**

Re-export state creation, legal player plans, player commit, enemy phase, and result commit from focused modules. Do not restore the old monolith.

- [ ] **Step 7: Rewrite BattleScene around committed state**

Render:

- authored blocked cells;
- player and all living enemies;
- current unit, health, essence, statuses, and difficulty label;
- reachable player destinations;
- legal action targets after destination selection;
- action buttons from public action definitions.

The scene must not run search during drawing. It requests the controller decision, persists it, then animates the returned settlement summary.

- [ ] **Step 8: Replace `kind` battle entry**

`ExploreScene` and dialogue actions pass registered `battleId`. Remove `forest`/`fangYuan` combat kinds. Do not preserve the old Fang Yuan battle-theft route; the simplified content flow owns Wine Worm acquisition outside combat.

- [ ] **Step 9: Add a compact difficulty setting**

Use a four-option segmented control in the existing system settings surface. Display labels are `入门`, `标准`, `困难`, `天骄`; values are registered IDs. In battle, show only the selected label. Add tooltips/accessible labels, but no visible explanation of search depth or internal scoring.

- [ ] **Step 10: Stabilize responsive layout**

Keep the board aspect ratio `8 / 6`, fixed cell tracks, and bounded action bar. At `1280 x 720`, `1024 x 768`, and `390 x 844`, no text, unit, status, or action button may overlap another control.

- [ ] **Step 11: Run unit, build, and E2E**

Run: `node --test tests/battleRules.test.js tests/battleController.test.js tests/battlePersistence.test.js`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

Run: `npx playwright test e2e/battle-ai.spec.js`

Expected: PASS.

- [ ] **Step 12: Commit**

```powershell
git add src index.html tests/battleRules.test.js e2e/battle-ai.spec.js
git commit -m "feat(battle): integrate tactical combat AI"
```

### Task 13: Add Property Tests And Tune The 13-Encounter Balance Matrix

**Files:**
- Create: `tests/battleProperties.test.js`
- Create: `src/game/battle/playerPolicies.js`
- Create: `scripts/validate-battle-balance.mjs`
- Modify: `systems/balance/battle-ai-matrix.json`
- Modify: `systems/battle/actions.json`
- Modify: `systems/battle/encounters.json`

- [ ] **Step 1: Add fast-check state generators**

Generate valid `8 x 6` boards, one/two enemies, legal stats, cooldowns, statuses, and public action subsets. Every property uses at least
`{ numRuns: 1000, seed: 20260727 }` and prints the seed/path on
failure for exact replay.

- [ ] **Step 2: Encode all required properties**

At minimum:

1. deterministic same input/difficulty/seed/cursor gives same plan;
2. input snapshots are unchanged;
3. plans stay in board and on canonical paths;
4. actions satisfy target/range/essence/cooldown;
5. units never overlap;
6. committed HP/essence never fall below zero;
7. one terminal result follows the fixed order;
8. beginner consumes exactly one cursor, others zero;
9. candidate/leaf hard caps hold;
10. AI cannot read unrevealed player content;
11. hard/prodigy `1v2` preserve remaining-enemies-before-player order;
12. save/load next decision is identical;
13. every generated valid state completes enumeration/search without an
    unhandled exception and stays within the candidate/leaf caps;
14. generated save/load cases preserve
    `recentActionCategoriesByUnitId` byte-for-byte and therefore preserve the
    third-repeat filter result.

- [ ] **Step 3: Verify properties find missing edge cases**

Run: `node --test tests/battleProperties.test.js`

Expected before final fixes: at least one purposeful RED assertion or missing implementation failure. Do not weaken generators to make a defect disappear.

- [ ] **Step 4: Implement deterministic player policies**

`playerPolicies.js` implements the exact tuples in specification section 14.2 and the retreat-aware branch. It uses the formal legal enumerator and simulator, not a second battle model.

Add one crafted candidate set in which the five policies have five distinct,
fixed winners:

- aggressive chooses the highest-damage plan;
- kiting chooses the safe far plan;
- defensive chooses defend;
- conserving chooses the zero-essence efficient plan;
- retreat-aware chooses retreat under visible lethal pressure.

Assert each winning `canonicalKey`, then permute input order and assert the same
five winners.

- [ ] **Step 5: Implement the 15-case balance runner**

For every encounter:

- run 3 builds x 5 policies on standard;
- run the same 15 cases on beginner, hard, and prodigy after standard passes;
- cap at 20 rounds;
- derive the documented `balance|battle|build|policy` seed;
- count victory denominator exactly `15`;
- calculate victory-round median;
- prove retreat reachability;
- verify pressure limits and no dynamic stats.
- verify beginner, hard, and prodigy win-rate deltas against standard stay in
  the approved `+10..+20`, `-15..-8`, and `-20..-12` percentage-point bands.
- validate every tuned encounter against section 14.3 using its checked-in
  `reference_balanced` fixture: health ratio, actual common-damage ratio, total
  main-skill uses from essence/cost, and move `2..3`. Fail with the exact field
  path when an authored integer leaves its tier budget.

Use denominator `15` exactly. Standard must win `12..14` tutorial cases,
`10..12` normal cases, `8..10` elite cases, and `7..9` boss cases. Failure,
retreat, and unresolved after round `20` are all non-victories. The round target
is the median of victory samples only and fails closed when there are no
victories.

Additionally, any case still unresolved after the round-20 settlement makes the
entire validation command fail, even if the tier's victory count would
otherwise be in range. Record it as a non-victory for statistics and as a
separate `did_not_terminate` hard-gate error.

Exit nonzero with battle/build/policy diagnostics on failure.

- [ ] **Step 6: Tune only authored integer values**

Start from the action/encounter tables above. Iterate:

1. run the focused failing battle matrix;
2. change the smallest relevant integer in action or encounter data;
3. rerun its 15 cases;
4. rerun all 13 before commit.

Do not change search rules to force standard balance. Do not add difficulty-specific stats. Do not raise health to cover a pathing/skill defect.

- [ ] **Step 7: Verify all balance gates**

Run: `node scripts/validate-battle-balance.mjs`

Expected: PASS for all 13 battles, with tier victory counts, victory-round
medians, pressure limits, and four-difficulty deltas in range.

Run: `node --test tests/battleProperties.test.js`

Expected: PASS with zero property failures.

- [ ] **Step 8: Commit**

```powershell
git add src/game/battle/playerPolicies.js scripts/validate-battle-balance.mjs systems/battle systems/balance tests/battleProperties.test.js
git commit -m "test(battle): enforce tactical balance properties"
```

### Task 14: Benchmark, Full Regression, And Final Evidence

**Files:**
- Create: `scripts/benchmark-battle-ai.mjs`
- Create: `reports/battle-ai/.gitkeep`
- Create: `reports/battle-ai/manual-first-play-template.md`
- Modify: `package.json`

- [ ] **Step 1: Add script commands**

```json
{
  "scripts": {
    "validate:battle": "node scripts/validate-battle-balance.mjs",
    "benchmark:battle": "node scripts/benchmark-battle-ai.mjs"
  }
}
```

- [ ] **Step 2: Implement benchmark protocol exactly**

Record Node version, OS, CPU model, logical cores, and memory. Use pure production AI, all 13 fixed goldens, 100 warmups per difficulty, then 1000 measured decisions per difficulty. Report P50, P95, max, and leaf counts to a timestamped JSON file under `reports/battle-ai/`.

Targets:

```text
beginner P95 < 25 ms
standard P95 < 50 ms
hard P95 < 100 ms
prodigy P95 < 150 ms
```

Never stop search based on elapsed time.

- [ ] **Step 3: Prepare the human first-play evidence sheet**

Create `reports/battle-ai/manual-first-play-template.md` with ten rows for each
encounter tier and columns for build familiarity, result, retreat, rounds, and
subjective pressure. Do not fabricate sessions. Automated completion can mark
the software gate green, but release acceptance remains pending until product
control supplies the required human records.

- [ ] **Step 4: Run all contract and content validation**

Run: `node scripts/validate-contracts.mjs`

Expected: PASS.

Run: `node scripts/validate-content.mjs`

Expected: PASS.

- [ ] **Step 5: Run all tests**

Run: `npm test`

Expected: PASS, zero failures.

- [ ] **Step 6: Run balance and benchmark**

Run: `npm run validate:battle`

Expected: all 13 encounters PASS.

Run: `npm run benchmark:battle`

Expected: all four P95 targets PASS and a report path is printed.

- [ ] **Step 7: Run build and Playwright**

Run: `npm run build`

Expected: PASS.

Run: `npm run test:e2e`

Expected: PASS.

- [ ] **Step 8: Check repository hygiene**

Run: `git status --short`

Expected: only the intentionally generated benchmark report and planned source changes before staging; no temp invalid fixtures, screenshots, caches, or untracked save files.

- [ ] **Step 9: Commit final verification assets**

```powershell
git add package.json package-lock.json scripts/benchmark-battle-ai.mjs reports/battle-ai
git commit -m "chore(battle): add AI performance gate"
```

## Final Acceptance Checklist

- [ ] Four difficulties use identical encounter stats, skills, rewards, cooldowns, and rules.
- [ ] Only beginner consumes deterministic random, exactly once per committed decision.
- [ ] Save/reload preserves next `canonicalKey`, damage, statuses, and cursor.
- [ ] `1v2` order is stable and saved; dead units are skipped without reordering.
- [ ] AI snapshots contain no unrevealed Gu, item, passive, or future random data.
- [ ] EasyStar is used only for reachability/distance; canonical ties are U/L/R/D.
- [ ] Mistreevous returns intent only and never mutates battle state.
- [ ] Simulator is shared by preview, search, player commit, and enemy commit.
- [ ] All 13 encounter IDs exist exactly once and validate at field-level paths.
- [ ] No battle action or UI offers theft, stolen essence, ownership transfer, or pursuit.
- [ ] Automatic balance, property, persistence, build, E2E, and benchmark gates pass.
- [ ] Human first-play evidence is recorded by product control; it is never
  synthesized by an implementation agent.
