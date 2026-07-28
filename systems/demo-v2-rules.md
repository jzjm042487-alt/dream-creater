# Demo V2 Simplified Systems Rules

## Authority

- Product rules: `docs/superpowers/specs/2026-07-27-qing-mao-simplified-mvp-design.md`
- ID registry: `contracts/demo-v2-ids.json`
- Active player state: `contracts/player-state.schema.json`
- Save contract: `contracts/game-state-v3.md`
- Wilderness map and balance: `systems/balance/demo-v2.json`
- Hidden-route details: `docs/superpowers/specs/2026-07-26-wilderness-hidden-route-design.md`
- Low-rank Gu details: `docs/superpowers/specs/2026-07-26-low-rank-gu-acquisition-and-care-design.md`
- Battle AI and enemy balance:
  `docs/superpowers/specs/2026-07-27-tactical-combat-ai-and-enemy-balance-design.md`

New content must use registered IDs. IDs under `legacyIds` are readable only for
save migration and are invalid in new authoring data.

## Active State Boundary

The active MVP reads only the `mvp` branch described by
`contracts/game-state-v3.md`, plus the existing `wilderness` and `guSystem`
branches.

The active player model contains health, primeval essence, primeval stones,
rank, cultivation progress, six attributes, buffs, and debuffs. Fatigue,
identity exposure, old debt, bloodstain, action points, evidence, alert meters,
and stolen-item provenance are not active inputs.

Legacy fields may remain in a migrated payload. Runtime must not display, update,
or branch on them.

Buff and Debuff instances store a registered category-specific `id`, a
`duration` of `turns`, `scene`, or `untilRest`, and `remainingTurns` only for
turn-counted effects.

## Cultivation

Base gains are:

| Source | Gain |
| --- | ---: |
| Ordinary battle victory | 8 |
| Elite or boss victory | 12 |
| Survived defeat or retreat | 2 |
| First dangerous exploration completion | 4 |
| Training completion | 3 |
| Optional night cultivation | 2 |

Settlement:

```text
raw = cultivationProgress + gain
cultivationProgress = min(100, raw)
storedOverflow = min(20, max(0, raw - 100))
```

At `cultivationProgress === 100`, breakthrough is immediately available and
always succeeds unless the player is already at rank three, the MVP cap. It has
no location, resource, relationship, quest, or random gate.

## Quest Flow

An active quest has:

- `status`
- `currentStepId`
- optional `nextStepId`

Only a step's authored `completionTrigger` advances it. The UI shows the current
step, next step, and completion state. It never shows a percentage.

Production main-scene IDs `D00-S01` through `D30-S01` are also the fixed main
quest-step IDs. Completed quests omit `nextStepId`; they never write `null`.

Chapter day numbers are labels, not deadlines. Optional opportunities cannot
block the main flow.

## Opportunities

The five optional opportunities use exactly `inactive`, `available`,
`contested`, `resolved`, and `gone`. These values are independent from quest
statuses. The active save persists every opportunity result and optional
resolving character.

## Relationship Graph

Relationships are categorical edges using
`contracts/relationship-kind.enum.json`. They have no numeric value and no event
delta ledger.

The graph exists for reference and presentation. It cannot modify checks, unlock
tasks, or gate departure.

## Theft

The map interaction is:

1. Approach a character.
2. Open theft.
3. Inspect available items.
4. Select one item.
5. Resolve once and show the result in the map layer.

Chance:

```text
rankGap = targetRankIndex - playerRankIndex
luckBonus = round((luck - 50) * 0.20)
masteryBonus = round((theftMastery - 50) * 0.35)
rankModifier = rankGap > 0
  ? -10 * rankGap
  : 5 * min(-rankGap, 2)
rawChance = 65 + luckBonus + masteryBonus + rankModifier - itemPenalty
finalChance = clamp(15, 95, rawChance)
```

Item penalties are ordinary `0`, equipment `5`, outerwear `8`, close-worn `10`,
and secured `15`.

Success removes the target entry, adds the same item to ordinary inventory,
applies direct portrait/status tags when authored, advances the persisted random
cursor, and ends. It writes no owner, stolen, illegal, evidence, pursuit, heat,
or attribution fields.

Failure transfers nothing, consumes the target's attempt for the current map
visit, displays an immediate reaction, advances the random cursor, and ends. It
creates no cross-scene state.

## Dialogue Actions

Each short choice has one registered action: `nextNode`, `endDialogue`,
`openMap`, `startBattle`, `openShop`, `openPanel`, `openOpportunity`, or
`applyEventDelta`. Actions carry only their matching registered target field.
There are no locked choices, AP costs, risk formulas, or confirmation flags.

## Battle

Battle uses an `8 x 6` orthogonal grid and Manhattan distance.

Each player turn permits:

1. zero or one movement up to `move` cells;
2. exactly one action or an explicit pass.

Actions are physical attack, one Gu skill, one killer move, defend, item, or
retreat. There are no interrupts or reaction windows.

Default encounters are `1v1`; a small authored subset may be `1v2`. Damage and
enemy decisions are deterministic. Enemy AI combines registered behavior
profiles, legal turn-plan enumeration, utility scoring, and difficulty-bounded
search. Beginner, standard, hard, and prodigy difficulty share the same enemy
stats, skills, rewards, and battle rules. Retreat is available from a board
edge.

## Gu Loadout

Base aperture capacities are rank one `6`, rank two `10`, and rank three `15`.
Rank-one, rank-two, and rank-three Gu cost `1`, `2`, and `4` load.

Only Gu in the aperture provide battle actions or passive effects. Reserve Gu
remain valid ingredients and can be equipped outside battle.

A low-rank Gu has at most one signature active and one passive or exploration
function. Duplicate behavior is controlled per Gu by `unique`,
`highestInstance`, `additiveCapped`, or `recipeComponent`; no global diminishing
returns formula is implied.

Killer moves use one core Gu, zero to two required supports, and zero to one
compatible optional modifier.

## Wilderness Resolution

One successful movement command resolves atomically:

1. Validate the relative command.
2. Translate it to an absolute direction; `back` first uses traversal history.
3. Move and update facing.
4. Increment `wanderCount`.
5. Append to `routeSequence`.
6. Charge time only on moves 1, 5, 9, 13, and 17.
7. Check ordinary destination arrival.
8. Check hidden discovery.
9. Check the step-20 guarantee.
10. Resolve allowed events in priority order.

The travel charge table is:

| Successful moves | Total charged ticks |
| --- | ---: |
| 0 | 0 |
| 1-4 | 1 |
| 5-8 | 2 |
| 9-12 | 3 |
| 13-16 | 4 |
| 17+ | 5 |

For moves 1-19, event priority is destination, hidden discovery, permanent,
daily, expedition, random battle, then non-blocking hint.

On move 20, if neither arrival nor hidden discovery resolved, suppress blocking
events and apply the guarantee from the wilderness specification. Arrival and
the guarantee add no extra time charge.

Wilderness counters and event ledgers are local to the current expedition. They
cannot become story, social, or pressure gates.

## Deterministic Saves

Persist:

- wilderness seed, cursor, route, history, counters, and event IDs;
- theft seed and cursor;
- current battle board, turn, deterministic AI order, and result;
- inventory counts, equipment, recipes, discovered locations, opportunity
  states, and character life/location states;
- Gu instances and completed settlement IDs;
- cultivation overflow and completed reward IDs.

Loading must not reroll, repeat rewards, or repeat settlement.

## Compatibility

Read `tianwai-daojuren-save-v3` first and
`tianwai-daojuren-save-v2` second. Migration reads the existing
`{ state, journal }` envelope, copies it losslessly, adds missing active
branches, writes the v3 key, and leaves the v2 key intact.

Preserving a legacy field is not permission to use it in the simplified MVP.
