# Canon Extraction

This directory is the source-backed canon layer for the game. It separates
what the supplied novel file actually supports from game-original design.

## Trust Layers

1. `extraction-seeds.json`
   - Stable IDs and manually verified entity names.
   - Aliases only merge surface forms; they do not add new lore.

2. `curated/`
   - Human-checked, paraphrased facts with chapter and source-line evidence.
   - This is the only layer that downstream design may treat as implementation
     input without another source review.

3. `generated/*-mention-index.json`
   - Deterministic mention counts and evidence coordinates for verified seeds.
   - Contains no source paragraphs or chapter titles.

4. `generated/gu-candidate-index.json`
   - Machine-extracted Gu-name candidates.
   - Every record remains unverified even when its frequency is high.

## Evidence Coordinates

`v01-s014` means volume 1, section 14 as inferred from the source's resetting
section numbers. `sourceLines` refer to the decoded GBK text file whose SHA-256
is recorded in `generated/source-manifest.json`.

Facts use these certainty values:

- `explicit`: the located passage directly states the fact.
- `explicit-by-opening-inventory-context`: the rank is fixed by the surrounding
  inventory and progression discussion even if the same sentence omits it.
- `strong-inference-not-explicit-in-located-lines`: useful but not safe to turn
  into a hard rule without another source pass.
- `not-stated-in-located-passage` or `not-located`: deliberately unresolved.

## Rebuild

The novel stays outside the repository. Rebuild all generated indexes with:

```powershell
node scripts/extract-canon.mjs `
  --source 'C:\path\to\蛊真人.txt' `
  --encoding gbk `
  --seeds systems/canon/extraction-seeds.json `
  --out systems/canon/generated
```

The command is deterministic for the same source bytes and seeds. It records
the source filename, byte size, encoding and SHA-256, but never its absolute
path.

## Current Coverage

- Entire supplied file scanned: 180,945 decoded lines.
- 1,915 section headings indexed across six numbering cycles.
- Full-file source fingerprint:
  `e48d91ad4d7b62fb60986050e735ffe634bc552d797945114d7e46034202708e`.
- Detailed manual pass: Qing Mao Mountain, the three villages, the Flower Wine
  Monk inheritance, the early cast, and Gu progression through the rank-three
  boundary.
- Broad machine pass: verified major Gu, locations, factions, characters and
  paths across the supplied file.

The source is incomplete. In particular, volume 5 omits sections 441-524 and
527-829, in addition to smaller gaps. A record marked `not-found` means only
"not found in these source bytes," not "does not exist in canon."

## Downstream Rule

Do not turn a `machine-candidate` into a game item, map node, faction or
character ID. Promote it into `extraction-seeds.json`, verify its relevant
passages, and add a curated record first. Original game connective content must
use separate non-`canon_` IDs so later source corrections remain lossless.
