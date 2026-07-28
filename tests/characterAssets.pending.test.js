import assert from "node:assert/strict";
import { test } from "node:test";
import { ASSETS, MAPS } from "../src/game/content/maps.js";

const expectedStaticCharacters = new Map([
  ["character-fang-yuan", "/assets/game/characters/chibi/chibi_fang_yuan.png"],
  [
    "character-npc-clan-steward",
    "/assets/game/characters/chibi/chibi_npc_clan_steward.png",
  ],
  [
    "character-npc-caravan-manager",
    "/assets/game/characters/chibi/chibi_npc_caravan_manager.png",
  ],
  [
    "character-npc-demonic-cultivator",
    "/assets/game/characters/chibi/chibi_npc_demonic_cultivator.png",
  ],
  [
    "character-npc-medicine-physician",
    "/assets/game/characters/chibi/chibi_npc_medicine_physician.png",
  ],
  [
    "character-npc-tavern-keeper",
    "/assets/game/characters/chibi/chibi_npc_tavern_keeper.png",
  ],
]);

test.skip("preloads one state-independent Q character asset per static NPC role", () => {
  const assets = new Map(ASSETS);

  for (const [key, url] of expectedStaticCharacters) {
    assert.equal(assets.get(key), url);
    assert.doesNotMatch(
      `${key}:${url}`,
      /normal|outerwear|privacy|emotion|anger|missing/
    );
  }
});

test.skip("visible NPCs bind to their own static Q character texture", () => {
  const expectedBindings = new Map([
    ["fang-yuan", "character-fang-yuan"],
    ["clerk", "character-npc-tavern-keeper"],
    ["merchant", "character-npc-caravan-manager"],
    ["instructor", "character-npc-clan-steward"],
  ]);

  const visibleNpcs = Object.values(MAPS)
    .flatMap((map) => map.interactables)
    .filter(({ kind }) => kind === "npc");

  for (const [id, texture] of expectedBindings) {
    assert.equal(
      visibleNpcs.find((npc) => npc.id === id)?.texture,
      texture
    );
  }
});
