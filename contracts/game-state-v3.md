# Game State V3 Contract

Demo V2 keeps the existing local storage payload shape and adds versioned
wilderness and relationship branches. Runtime code must preserve every unrelated
version 2 field during migration.

## Storage Keys

- Read order: first `tianwai-daojuren-save-v3`, then legacy
  `tianwai-daojuren-save-v2`.
- If only the v2 key exists and `state.version === 2`, migrate in memory, set
  `state.version = 3`, then persist the migrated payload to
  `tianwai-daojuren-save-v3`.
- Do not delete the v2 key during migration.
- Unknown versions must fail closed and start no scene until the UI reports the
  incompatibility.

## Added State

```js
{
  version: 3,
  scene: {
    id: "loc_qingmao_wilderness",
    entrance: "node_qm_entry"
  },
  wilderness: {
    mapId: "map_qingmao_wilderness_v2",
    origin: "loc_gu_yue_village",
    currentNodeId: "node_qm_entry",
    facing: "north",
    wanderCount: 0,
    chargedTravelTicks: 0,
    routeSequence: [],
    traversalHistory: [],
    expeditionSeed: "persisted string",
    randomCursor: 0,
    triggeredEventIds: {
      permanent: [],
      daily: {},
      expedition: []
    },
    discoveredHiddenLocations: [],
    knownRoutes: []
  },
  relationships: []
}
```

## Migration Defaults

For a v2 save with `scene.id === "world"`:

- `scene.id` becomes `loc_qingmao_wilderness`.
- `scene.entrance` becomes `node_qm_entry`.
- `wilderness.mapId` is `map_qingmao_wilderness_v2`.
- `wilderness.origin` is `loc_gu_yue_village`.
- `wilderness.currentNodeId` is `node_qm_entry`.
- `wilderness.facing` is `north`.
- `wanderCount`, `chargedTravelTicks`, and `randomCursor` are `0`.
- `routeSequence`, `traversalHistory`, `discoveredHiddenLocations`,
  `knownRoutes`, and all triggered-event arrays are empty.
- `expeditionSeed` is generated once during migration and then persisted.

For any other v2 scene:

- Preserve `scene` exactly.
- Add an inactive wilderness branch with the same defaults except
  `currentNodeId = "node_qm_entry"` and `origin = "loc_gu_yue_village"`.

## Preservation Rule

The migration is a shallow-plus-known-branch transform: copy the whole v2 state,
replace only `version`, `scene` when it was `world`, and add missing v3 branches.
Existing `clock`, `player`, `fangYuan`, `wineWorm`, `clues`, `flags`, and
`inventory` values are not recomputed.

## Deterministic Saves

Saving and loading must persist `expeditionSeed`, `randomCursor`,
`routeSequence`, `traversalHistory`, `wanderCount`, and all triggered event IDs.
Loading a save must not reroll the next wilderness event.
