# Game State V3 Simplified MVP Contract

## 1. Authority And Storage Keys

This document defines persistence for the simplified Qing Mao MVP. The
executable reference is `scripts/game-state-v3-contract.mjs`; its regression
tests are `tests/gameStateV3Contract.test.js`.

Read local-storage keys in this order:

1. `tianwai-daojuren-save-v3`
2. `tianwai-daojuren-save-v2`

After a successful migration, write the complete result to the v3 key. Never
delete or overwrite the v2 key.

The existing application stores an envelope, not a bare state object:

```js
{
  state: { version: 2, /* existing game state */ },
  journal: ["existing log entries"],
  // unknown envelope fields may also exist
}
```

V3 keeps this envelope. `state.version`, not an envelope-level field, selects
the state contract.

## 2. Compatibility Rule

New authoring JSON must pass the simplified schemas and cannot contain removed
meters. Save migration is different: it deep-copies the complete old envelope,
including unknown wrapper fields and every old state branch.

Migration changes `state.version` from `2` to `3` and adds active branches. It
does not delete or rewrite legacy `player`, `scene`, `fangYuan`, `wineWorm`,
`clues`, `flags`, `inventory`, `clock`, `journal`, or unknown fields.

The previous version and scene are retained at:

```js
state.mvp.migration = {
  sourceVersion: 2,
  sourceScene: { id: "world", entrance: "gu-yue-road" }
}
```

Legacy branches are inert. Active MVP code reads only `state.mvp`,
`state.wilderness`, and `state.guSystem`.

## 3. Active V3 Shape

```js
{
  state: {
    version: 3,

    // Preserved legacy branches remain here unchanged.
    scene: { id: "world", entrance: "gu-yue-road" },

    mvp: {
      rulesVersion: 1,
      migration: {
        sourceVersion: 2,
        sourceScene: { id: "world", entrance: "gu-yue-road" }
      },
      currentScene: {
        id: "loc_qingmao_wilderness",
        entrance: "node_qm_entry"
      },
      player: {
        health: { current: 40, maximum: 40 },
        primevalEssence: { current: 20, maximum: 20 },
        primevalStones: 6,
        rankId: "rank_one",
        cultivationProgress: 0,
        storedOverflow: 0,
        attributes: {
          strength: 20,
          agility: 30,
          perception: 30,
          luck: 50,
          willpower: 20,
          theftMastery: 10
        },
        buffs: [
          {
            id: "buff_training_focus",
            duration: "scene"
          }
        ],
        debuffs: [
          {
            id: "debuff_wounded",
            duration: "untilRest"
          }
        ]
      },
      questFlow: {
        activeQuestId: "quest_main_qingmao",
        questsById: {
          quest_main_qingmao: {
            status: "active",
            currentStepId: "D00-S01",
            nextStepId: "D01-S01"
          }
        }
      },
      relationships: [],
      talentRosterByCharacterId: {},
      inventory: {
        itemQuantitiesById: {
          item_moon_orchid_petal: 1
        },
        guMaterialQuantitiesById: {},
        equipmentBySlot: {
          weapon: null,
          armor: null,
          artifact: null
        },
        unlockedRecipeIds: []
      },
      discoveredLocationIds: [
        "loc_gu_yue_village",
        "loc_qingmao_wilderness"
      ],
      opportunitiesById: {
        opportunity_wine_worm: { status: "inactive" },
        opportunity_flower_wine_inheritance: { status: "inactive" },
        opportunity_merchant_goods: { status: "inactive" },
        opportunity_nine_leaf_vitality: { status: "inactive" },
        opportunity_qing_shu_fate: { status: "inactive" }
      },
      charactersById: {
        char_player: {
          lifeStatus: "alive",
          currentLocationId: "loc_qingmao_wilderness"
        },
        char_fang_yuan: {
          lifeStatus: "alive",
          currentLocationId: null
        }
      },
      theft: {
        theftSeed: "persisted string",
        theftRandomCursor: 0,
        attemptedTargetIdsBySceneVisit: {}
      },
      battle: null,
      completedRewardIds: []
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

    guSystem: {
      version: 1,
      autoFeed: true,
      guInstancesById: {},
      completedOpportunityIds: [],
      knownCaptureClueIds: [],
      completedRecipeResolutionIds: [],
      captureResolutionByOpportunityId: {}
    }
  },
  journal: ["preserved existing log"]
}
```

## 4. Active Branch Rules

### 4.1 Player

`state.mvp.player` validates directly against
`contracts/player-state.schema.json`.

Buff and Debuff instances contain:

- `id`: registered in the correct Buff or Debuff bucket;
- `duration`: `turns`, `scene`, or `untilRest`;
- `remainingTurns`: required only when `duration === "turns"`.

The same effect ID cannot appear twice in the same array. `current` cannot
exceed `maximum` for health or primeval essence.

### 4.2 Quest Flow

`currentStepId` and `nextStepId` use the same fixed IDs as the production scene
spine, `D00-S01` through `D30-S01`.

An active quest points to a non-terminal current step and its declared next
step. A completed quest points to a terminal current step and omits
`nextStepId`; it never writes `null`.

### 4.3 Inventory, Equipment, And Crafting

- Item and material maps store registered IDs with non-negative integer counts.
- Equipment slots are `weapon`, `armor`, and `artifact`.
- `unlockedRecipeIds` contains registered recipe IDs.
- Gu instances remain in `state.guSystem`, not in an item stack.
- A stolen item is added to the ordinary count for its item ID.

No inventory entry stores owner, victim, provenance, legality, pursuit, or
return obligations.

### 4.4 Opportunities

All five opportunities use one lifecycle:

- `inactive`: not yet exposed;
- `available`: visible and enterable;
- `contested`: at least two characters are resolving it now;
- `resolved`: a result is fixed and may name a resolving character;
- `gone`: the opportunity disappeared without an acquirer.

These values come from `opportunity-status.enum.json`. They are not quest
statuses. `resolvedByCharacterId` is allowed only with `resolved`; `gone` and
all pre-resolution states cannot name an acquirer.

### 4.5 Characters And Locations

`charactersById.*.lifeStatus` is `alive`, `wounded`, `dead`, or `departed`.
`currentLocationId` is a registered location or `null`.

`discoveredLocationIds` controls map visibility. Hidden-route discovery remains
in the wilderness branch and adds the resulting registered location here when
settled.

### 4.6 Battle

`battle` is `null` outside combat. During combat it stores the board, turn,
unit positions, health, essence, active effects, deterministic AI order,
random cursor if used, and the return scene. Saving cannot create a reaction or
interrupt queue because that subsystem does not exist.

## 5. Exact V2 Mapping

The input paths below refer to `envelope.state`.

| V2 source | V3 active destination | Rule |
| --- | --- | --- |
| `player.hp` / `player.maxHp` | `mvp.player.health` | Clamp current to `0..maximum`; defaults `40/40` |
| `player.essence` / `player.maxEssence` | `mvp.player.primevalEssence` | Clamp current to `0..maximum`; defaults `20/20` |
| `player.stones` | `mvp.player.primevalStones` | Clamp to `0..999999`; default `0` |
| `player.cultivation` | `mvp.player.cultivationProgress` | Clamp to `0..100`; default `0` |
| no V2 rank field | `mvp.player.rankId` | `rank_one` |
| `player.stats.agility` | `mvp.player.attributes.agility` | `clamp(round(value * 10), 0, 100)` |
| `player.stats.insight` | `mvp.player.attributes.perception` | Same formula |
| `player.stats.caution` | `mvp.player.attributes.willpower` | Same formula |
| `player.theftRank` | `mvp.player.attributes.theftMastery` | Same formula |
| no V2 equivalent | strength / luck | `20` / `50` |
| registered strings in `inventory` | `mvp.inventory.itemQuantitiesById` | Count each known item; unknown values remain only in preserved legacy inventory |

`storedOverflow` is `0`; Buffs and Debuffs are empty. Migration never derives
fatigue, exposure, debt, bloodstain, evidence, alertness, ownership, or
provenance.

## 6. World Scene Migration

The legacy `state.scene` remains unchanged for lossless compatibility.

If `state.scene.id === "world"`, the active scene is:

```js
state.mvp.currentScene = {
  id: "loc_qingmao_wilderness",
  entrance: "node_qm_entry"
}
```

The wilderness defaults are:

- `mapId = "map_qingmao_wilderness_v2"`;
- `origin = "loc_gu_yue_village"`;
- `currentNodeId = "node_qm_entry"`;
- `facing = "north"`;
- counters and random cursor are `0`;
- route, history, discovery, route-knowledge, and event arrays are empty;
- `expeditionSeed` is generated once before migration and persisted.

If the legacy scene is not `world`, copy it to `mvp.currentScene`.

Arrival and the step-20 guarantee add no extra time charge.

## 7. Migration Transaction

For a v2 envelope:

1. Parse and validate that `envelope.state.version === 2`.
2. Deep-copy the complete envelope.
3. Set the copied `state.version = 3`.
4. Add `state.mvp` using the exact mapping above.
5. Add `state.wilderness` defaults.
6. Add or upgrade `state.guSystem` through the existing low-rank Gu migration
   contract.
7. Validate every active branch.
8. Serialize and write the complete copy to the v3 key in one operation.

On any error, write nothing.

For a legacy v3 envelope with no `mvp.rulesVersion`, preserve all existing v3
branches and add only missing active fields. Existing wilderness seed/cursor
and existing `guSystem` are never reset. If an older Gu branch uses
`instancesById`, preserve it and expose the same instances through
`guInstancesById`.

If v2 `state.wineWorm.owner === "player"`, create exactly one
`gu_instance_legacy_wine_worm`, mark `opportunity_wine_worm` resolved by
`char_player`, and grant seven supply days only during that migration. If the
legacy owner is Fang Yuan, mark the opportunity resolved by `char_fang_yuan`
without granting the player a Gu. Re-loading v3 cannot repeat either mapping.

For a v3 envelope with `mvp.rulesVersion === 1`, loading is identity-preserving:
no migration default, seed, item, reward, or Gu instance is generated again.
Unknown state or MVP versions fail closed before a scene starts.

## 8. Deterministic Save Requirements

Persist:

- wilderness seed, cursor, route, history, counters, discoveries, and event IDs;
- theft seed, cursor, and the current scene-visit attempt set;
- battle board, turn, units, effects, AI order, and return scene;
- opportunity status and resolver;
- character life status and current location;
- item counts, equipment, recipes, Gu instances, and all one-time settlement IDs;
- cultivation overflow and completed reward IDs.

Loading cannot reroll an event or theft, repeat a reward, restore a dead
character, reset an opportunity, duplicate a Gu, or repeat capture, care,
refinement, advancement, battle, cultivation, or breakthrough settlement.

## 9. Verification

Run:

```powershell
node --test tests/gameStateV3Contract.test.js
```

The tests prove:

- the real `{ state, journal }` v2 envelope is accepted;
- input data and unknown sentinels remain unchanged;
- exact player paths map to the active branch;
- the world scene receives its active migration default;
- inventory, opportunity, and character state exist;
- existing v3 wilderness and Gu data survive upgrade;
- a player-owned legacy Wine Worm becomes one active Gu instance exactly once;
- a second v3 upgrade does not regenerate random seeds or reset state.
