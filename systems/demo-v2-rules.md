# Demo V2 Systems Rules

## Stable Sources

- ID registry: `contracts/demo-v2-ids.json`
- Wilderness map and balance: `systems/balance/demo-v2.json`
- Save contract: `contracts/game-state-v3.md`
- Content schemas: `contracts/*.schema.json`
- Low-rank Gu acquisition, care, and advancement:
  `docs/superpowers/specs/2026-07-26-low-rank-gu-acquisition-and-care-design.md`

Downstream agents may reference these IDs but must not invent IDs for graph
nodes, dialogue nodes, event slots, event deltas, relationship dimensions, or
emotions.

## Wilderness Resolution

One movement command resolves as:

1. Validate that the relative command is enabled from the current state.
2. Translate relative command to an absolute direction, except `back`, which
   first uses `traversalHistory`.
3. Move to the target node and update facing.
4. Increment `wanderCount`.
5. Append the relative command to `routeSequence`, keeping at least the last
   eight commands.
6. Apply a time tick only when `wanderCount` is `1`, `5`, `9`, `13`, or `17`.
7. Check normal destination arrival.
8. Check hidden discovery.
9. Check step-20 guarantee.
10. Resolve unique, forced, random, and flavor events in that order, unless
    suppressed by the step-20 guarantee.

The command is atomic for saving: a save made after the command must include all
counter, time, node, facing, event, and random cursor updates.

## Time Rules

The wilderness travel charge table is:

| Successful moves | Total charged ticks |
| --- | --- |
| 0 | 0 |
| 1-4 | 1 |
| 5-8 | 2 |
| 9-12 | 3 |
| 13-16 | 4 |
| 17+ | 5 |

This is implemented by charging on moves `1`, `5`, `9`, `13`, and `17`, not by
charging on arrival. The existing scheduled world updates run after each charged
tick using the current time system's player-result-first semantics.

## Event Priority

For moves 1-19:

1. Ordinary destination arrival.
2. Hidden discovery.
3. Permanent unique event.
4. Daily event.
5. Expedition event.
6. Random battle.
7. Non-blocking environmental hint.

For move 20, use the stricter guarantee order from the wilderness spec. Random
battles and other blocking events are suppressed if neither arrival nor hidden
discovery resolved first.

## Relationship Rules

Relationships are directed. `char_player -> char_fang_yuan` and
`char_fang_yuan -> char_player` are separate records. Each record has one of the
five dimensions in `contracts/relationship-dimension.enum.json` and a value from
`-100` to `100`.

Event deltas are idempotent when `applyOnce` is true. Store applied event delta
IDs per relationship record or in an equivalent global event-delta ledger.
Applying the same one-time delta twice is a contract violation.

## Wine Worm State IDs

Runtime may keep its legacy `wineWorm.owner` and `wineWorm.status` fields during
migration, but content-facing quest states must map as follows:

| Contract state | Legacy condition |
| --- | --- |
| `state_wine_unknown` | no wine clues and merchant owns the worm |
| `state_wine_clerk_observed` | `flags.clerkObserved === true` |
| `state_wine_patrol_known` | `flags.patrolSheet || flags.patrolHint` |
| `state_wine_jar_confirmed` | `flags.correctWineJar === true` |
| `state_wine_player_unhidden` | owner player, status unhidden |
| `state_wine_player_hidden` | owner player, status hidden |
| `state_wine_player_refined` | owner player, status refined |
| `state_wine_fang_yuan_owned` | owner Fang Yuan |

## Event Delta IDs

- `delta_hidden_cave_discovered`: add `loc_hidden_cave` to
  `discoveredHiddenLocations` and `knownRoutes`.
- `delta_theft_cache_looted`: add `loc_theft_cache` to
  `discoveredHiddenLocations`, add the cache reward once, and mark the permanent
  event complete.
- `delta_boar_victory`: apply battle victory reward once per battle instance.
- `delta_boar_escape`: no reward; preserve expedition state as battle return.
- `delta_boar_defeat`: use existing defeat recovery and end expedition.

## Future Gu Acquisition Boundary

Demo V2's wilderness acquisition loop is limited to unowned low-rank wild Gu.
High-rank Gu acquisition is reserved for a later contract and must not be
implemented as an ordinary wilderness reward.

- Combat, formations, or environmental hazards may be prerequisites that
  suppress a high-rank Gu before a later capture or sealing resolution.
- Battle victory must never add a high-rank Gu directly to inventory.
- Defeating a Gu Master does not automatically transfer ownership of their Gu.
  Escape, destruction, backlash, sealing, and authored acquisition are possible
  future outcomes.
- The future contract must define rank-gap limits, suppression state, ownership
  transfer, post-battle capture, failure consequences, and save fields before
  any high-rank acquisition content is authored.
- Demo V2 defines no high-rank Gu IDs, recipes, drop rates, or combat-acquisition
  formulas. Downstream agents must not invent them.

## Non-Negotiable Compatibility

Version 3 migration may add branches but must not recompute existing v2 clock,
player, Fang Yuan, wine worm, clues, flags, or inventory values. The old key
`tianwai-daojuren-save-v2` remains readable.
