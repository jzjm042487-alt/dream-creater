# Game State V3 Contract

Demo V2 keeps the existing local storage payload shape and adds versioned
wilderness, relationship, and low-rank Gu-system branches. Runtime code must
preserve every unrelated version 2 field during migration.

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

## Low-Rank Gu Extension

The approved low-rank Gu design adds `guSystem.version === 1` without changing
the top-level game-state version or local-storage key. Its normative fields,
instance states, ownership split, care settlement, and legacy wine-worm mapping
are defined in
`docs/superpowers/specs/2026-07-26-low-rank-gu-acquisition-and-care-design.md`.

For either a migrated v2 payload or an existing v3 payload with no `guSystem`,
add this branch once:

```js
{
  guSystem: {
    version: 1,
    autoFeed: true,
    instancesById: {},
    trackingByOpportunityId: {},
    observationBudget: {
      expeditionSeed: null,
      remaining: 0
    },
    captureResolutionsById: {},
    completedRefinementResolutionIds: [],
    completedAdvancementResolutionIds: [],
    completedGuMilestoneIds: [],
    warningLedger: [],
    nextSpawnOrdinalBySourceId: {},
    lastCareSettlementDay: null,
    characterProgressByCharacterId: {}
  }
}
```

Then map the existing `wineWorm` exactly once. Do not delete or rewrite the
legacy field. Re-loading a payload with `guSystem.version === 1` must preserve
the branch byte-for-byte apart from the normal action being resolved; it must
not create another Gu instance or grant another seven days of food. Unknown
`guSystem.version` values fail closed before scene start.

Default construction, legacy wine-worm mapping, validation, and writing the v3
key form one in-memory transaction. A failed mapping must not persist an empty
`guSystem`. The exact fixed instance ID, completed tracking record, legacy
clue/intel mapping, and migration test vectors are normative in the linked
low-rank Gu specification.

## Preservation Rule

The migration is a shallow-plus-known-branch transform: copy the whole v2 state,
replace only `version`, `scene` when it was `world`, and add missing v3 branches.
Existing `clock`, `player`, `fangYuan`, `wineWorm`, `clues`, `flags`, and
`inventory` values are not recomputed. Existing v3 payloads receive only missing
versioned branches; present branches are never reset to their defaults.

## Deterministic Saves

Saving and loading must persist `expeditionSeed`, `randomCursor`,
`routeSequence`, `traversalHistory`, `wanderCount`, and all triggered event IDs.
Loading a save must not reroll the next wilderness event.

When present, the entire `guSystem` branch and every Gu instance tombstone must
also persist. Loading must not repeat capture, refinement, daily care, growth,
advancement, warning, or migration settlement.
