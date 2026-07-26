# Wilderness Hidden Route Design

## Scope

Demo V2 replaces the old free-walking `world` scene with a hidden-route
wilderness map for Qing Mao Mountain. The player sees only relative commands:
`forward`, `back`, `left`, and `right`. The runtime resolves those commands
against an absolute directed graph that is hidden from the UI.

This spec is binding for Systems Wave 0. Runtime, narrative, art, and QA may
reference these IDs and rules but may not invent new graph, dialogue, event, or
formula IDs.

## Direction Contract

Absolute directions are `north`, `east`, `south`, and `west`. Each graph edge
uses one absolute direction and one destination node.

Initial entry for Demo V2:

- `mapId`: `map_qingmao_wilderness_v2`
- `origin`: `loc_gu_yue_village`
- `currentNodeId`: `node_qm_entry`
- `facing`: `north`

Relative command translation:

| Facing | forward | left | right | back |
| --- | --- | --- | --- | --- |
| north | north | west | east | history pop |
| east | east | north | south | history pop |
| south | south | east | west | history pop |
| west | west | south | north | history pop |

`back` is not a normal absolute edge lookup while history exists. It pops the
last entry from `traversalHistory` and restores `currentNodeId` and `facing`
from that entry. This makes repeated backtracking deterministic: pressing back
three times returns through the last three real traversals in reverse order.

If `traversalHistory` is empty, `back` resolves as the absolute opposite of the
current facing only if that edge exists. If no such edge exists, the command is
unavailable and must not increment `wanderCount`.

For `forward`, `left`, and `right`, the engine translates to an absolute
direction, finds an outgoing edge with that direction, pushes the previous
`{ nodeId, facing }` onto `traversalHistory`, moves to the edge target, and sets
`facing` to the absolute direction travelled.

## Counters And Time

Only successful movement commands count. Opening UI, inspecting text, selecting
a disabled command, choosing an already discovered direct destination, and
resolving arrival do not count as wilderness choices.

Use these independent fields:

- `wanderCount`: successful movement count in the current expedition.
- `chargedTravelTicks`: number of wilderness travel ticks already charged.
- `routeSequence`: recent relative commands for hidden route matching.
- `traversalHistory`: reversible history stack for backtracking.
- `randomCursor`: persisted deterministic random cursor.

Time charges occur immediately after a successful move and before event
resolution. Charge exactly one tick when the new `wanderCount` is one of
`1`, `5`, `9`, `13`, or `17`. Zero choices cost zero time. Destination arrival
and the step-20 guarantee cost no additional time. This replaces the old
world-to-destination travel cost.

## Destination State

`availableOrdinaryDestinations` are ordinary, non-hidden exits protected by the
20-step guarantee. Demo V2 contains:

- `loc_gu_yue_village`
- `loc_bamboo_hunting_ground`

`discoveredHiddenLocations` are hidden locations permanently discovered by the
player. Demo V2 contains discoverable hidden locations:

- `loc_hidden_cave`
- `loc_theft_cache`

`origin` is the ordinary location that started the current wilderness
expedition. Before step 20, the player may always return directly to `origin`.

`directTravelLocations` is the visible direct-travel menu. Before step 20 it may
contain only `origin` plus `discoveredHiddenLocations` whose current availability
conditions pass. It must not contain undiscovered hidden locations. At step 20,
ordinary destinations are exposed by the guarantee, but hidden destinations are
still excluded unless already discovered.

## Step-20 Guarantee

After the 20th successful movement, resolve in this exact order:

1. Apply the movement and any time charge. Step 20 has no charge because charges
   only happen at 1, 5, 9, 13, and 17.
2. If the node is an ordinary destination, arrive there normally.
3. Else if the move completes a hidden discovery, resolve that discovery.
4. Else suppress blocking encounters, including random battles and forced
   ambushes.
5. Expose all `availableOrdinaryDestinations` in a destination chooser.
6. Player selection arrives immediately with no extra time cost.

Non-blocking environmental hints may still be logged at step 20 after the
chooser appears, but they must not block the chooser.

## Battle Return

Victory and escape from a wilderness battle return to the post-movement
`currentNodeId` and `facing` that triggered the battle. They preserve
`wanderCount`, `chargedTravelTicks`, `traversalHistory`, `expeditionSeed`,
`randomCursor`, and triggered event IDs. They clear only `routeSequence` so the
player cannot use battle reloads to splice a hidden route.

Defeat follows existing battle defeat semantics: wake at the recovery location
on the next day and end the current expedition. The expedition branch resets to
the default entry node and facing, while permanent discoveries remain.

## Event Lifecycle

Permanent event IDs live for the whole save. Use for hidden discoveries and
one-time rewards:

- `event_hidden_cave_discovery`
- `event_theft_cache_discovery`

Daily event IDs reset by `clock.day`. Use for once-per-day random battles:

- `event_wilderness_boar`

Expedition event IDs reset when the player starts a fresh wilderness expedition
or reaches any final destination. Use for non-blocking route hints and repeated
flavor suppression.

- `event_qm_entry_hint`

Path matching clear range:

- Clear `routeSequence` on hidden discovery, battle start, teleport, expedition
  end, or direct travel.
- Do not clear `wanderCount` except on destination arrival, direct return to
  origin, direct travel to a discovered hidden location, defeat, or explicit
  expedition cancel.
- Do not clear `traversalHistory` on battle victory or escape.

## Deterministic Randomness

Each expedition has a persisted `expeditionSeed`. Random results are keyed by
`expeditionSeed` plus `randomCursor`, then `randomCursor` increments only after
the result is committed. An equivalent implementation may key by
`expeditionSeed` plus absolute edge traversal index if the traversal index is
persisted.

Saving and loading must persist the seed and cursor. Loading must not reroll the
next event. If the player saves before choosing a command, the next command after
load must resolve the same random event it would have resolved before load.

## Future Gu Acquisition Handoff

The wilderness graph may later hand an unowned low-rank wild Gu encounter to a
dedicated tracking, luring, and capture minigame. That interaction is outside
the Demo V2 wilderness implementation defined here.

High-rank Gu are explicitly reserved. A future encounter may require combat or
another suppression challenge before capture, but battle victory must not grant
the Gu directly. The wilderness resolver must hand off to a future acquisition
contract instead of treating a high-rank Gu as loot. No high-rank Gu IDs,
rank-gap rules, capture formulas, ownership-transfer rules, or save fields are
defined by this specification.

## Finite First Map

The map is defined in `systems/balance/demo-v2.json`. Required implementation
facts:

- Nodes: `node_qm_entry`, `node_qm_old_pine`, `node_qm_split_stone`,
  `node_qm_bamboo_shadow`, `node_qm_boar_scrape`, `node_qm_stream_bend`,
  `node_qm_village_ridge`, `node_qm_hunting_gate`, `node_qm_moss_wall`,
  `node_qm_cave_mouth`, `node_qm_theft_cache`.
- Ordinary routes: `route_qm_to_village`,
  `route_qm_to_bamboo_hunting_ground`.
- Hidden routes: `route_qm_hidden_cave`, `route_qm_theft_cache`.
- Event slots: `slot_qm_entry_hint`, `slot_qm_boar_daily`,
  `slot_qm_hidden_cave`, `slot_qm_theft_cache`.
- Dialogue nodes: `dlg_wilderness_entry`, `dlg_wilderness_boar_warning`,
  `dlg_hidden_cave_found`, `dlg_theft_cache_found`,
  `dlg_destination_gu_yue_village`,
  `dlg_destination_bamboo_hunting_ground`.
- Event deltas: `delta_hidden_cave_discovered`,
  `delta_theft_cache_looted`, `delta_boar_victory`, `delta_boar_escape`,
  `delta_boar_defeat`.

Discovery conditions:

- `loc_hidden_cave`: match `route_qm_hidden_cave` or arrive at
  `node_qm_moss_wall` with a route sequence suffix of
  `right,left,forward,left,forward`.
- `loc_theft_cache`: arrive at `node_qm_theft_cache`, player has
  `theftRank >= 1`, and route sequence suffix is
  `right,left,forward,left,forward,left`.

## Save Migration

See `contracts/game-state-v3.md`. The compatibility rule is mandatory:
read `tianwai-daojuren-save-v3` first, then `tianwai-daojuren-save-v2`, migrate
v2 to v3, preserve unrelated fields, and persist the migrated payload to the v3
key.

## Acceptance Criteria

- Zero wilderness moves cost zero time.
- Moves 1, 5, 9, 13, and 17 each cost one tick.
- Step 20 never adds time by itself.
- Repeated `back` commands walk the history stack in reverse.
- Battle victory or escape returns to post-movement state and clears only the
  hidden-route matching sequence.
- Saving and loading cannot reroll the next wilderness event.
- Undiscovered hidden locations never appear in the step-20 ordinary destination
  chooser.
