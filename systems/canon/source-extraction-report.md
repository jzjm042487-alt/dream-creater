# Source Extraction Report

## Source

| Field | Value |
| --- | --- |
| File | `蛊真人.txt` |
| Encoding | GBK |
| Bytes | 13,304,057 |
| Decoded lines | 180,945 |
| SHA-256 | `e48d91ad4d7b62fb60986050e735ffe634bc552d797945114d7e46034202708e` |
| Last supplied section | volume 6, section 364 |
| Coverage judgment | Incomplete |

The cover metadata says the file is updated to section 364 because section
numbering resets by major volume. The body contains six numbering cycles and
1,915 recognizable section headings.

## Missing Ranges

| Volume | Last section number | Headings found | Missing or unlabeled ranges |
| --- | ---: | ---: | --- |
| 1 | 199 | 195 | 34; 140-142 |
| 2 | 206 | 206 | none |
| 3 | 244 | 244 | none |
| 4 | 373 | 372 | 211 |
| 5 | 951 | 554 | 193; 211; 244; 411; 441-524; 527-829; 894-898; 941 |
| 6 | 364 | 344 | 1; 15; 18-21; 24-27; 29-30; 44; 58; 61; 110; 119-121; 129 |

The two large volume-5 jumps are direct source jumps, not parser uncertainty.
Smaller gaps may be absent chapters, scraper omissions or numbering defects;
they remain gaps until checked against another lawfully obtained edition.
The first heading labeled section 323 between sections 320 and 322 is recorded
as section 321 with its original label retained in `sourceSection`.

## Delivered Data

- `generated/chapter-index.json`: title-free chapter coordinates and title
  hashes.
- `generated/gu-mention-index.json`: verified Gu seeds merged across aliases.
- `generated/gu-candidate-index.json`: filtered, unverified Gu candidates for
  later review.
- `generated/location-mention-index.json`: major location occurrences.
- `generated/faction-mention-index.json`: major faction occurrences.
- `generated/character-mention-index.json`: major character occurrences.
- `generated/path-mention-index.json`: cultivation-path occurrences.
- `curated/early-gu-catalog.json`: rank, form, ability, acquisition, feeding,
  refinement, development and limitations for the opening Gu set.
- `curated/qing-mao-world.json`: local geography, faction specialties,
  time-scoped relations, key characters and the opening timeline.

Generated evidence is compressed to one locator per entity per chapter. It
stores only first/last source line, mention count and fact tags.

## Canon Findings Relevant To The Game

### Gu acquisition is not one loop

The opening already supplies several distinct canonical acquisition patterns:

| Pattern | Canon example | Player activity |
| --- | --- | --- |
| Clan allocation | Moonlight Gu, Little Light Gu | qualify, choose, accept political ownership |
| Lure and tracking | Wine Worm | buy bait, read weather, wait, observe, follow |
| Hidden cache | White Boar Gu, Jade Skin Gu | find Earth Treasury Flower, open a staged inheritance |
| Beast ownership | Hidden Stone Gu | hunt or defeat the stone-monkey king |
| Refinement chain | Four Flavors Liquor Worm, White Jade Gu | gather exact ingredients, pay resources, accept failure risk |
| Renewable estate asset | Nine-Leaf Vitality Grass | inherit or seize production rights, then operate the resource |
| Body installation | Earth Communication Ear Grass | recover the Gu, feed it, accept a painful graft |
| High-risk guardian capture | Chainsaw Golden Centipede | scout first, return at sufficient rank, subdue a wild rank-three Gu |
| Battle spoil | Water Shield Gu | defeat an owner and secure the surviving Gu |

This directly supports the requested "interesting wilderness acquisition"
direction. Random repeat battles can be one source of materials, but are not a
sufficient primary Gu-acquisition loop.

### Liquor Worm progression is a complete canonical ladder

| Rank | Gu | Main effect | Core refinement requirement |
| ---: | --- | --- | --- |
| 1 | Wine Worm | refine green-copper essence by one minor stage | captured wild/inheritance Gu |
| 2 | Four Flavors Liquor Worm | refine red-steel essence by one minor stage | two Wine Worms plus sour, sweet, bitter and spicy wines |
| 3 | Seven Fragrances Liquor Worm | refine white-silver essence by one minor stage | two Four Flavors Liquor Worms plus seven fragrances |
| 4 | Nine Eyes Liquor Worm | refine yellow-gold essence by one minor stage | two Seven Fragrances Liquor Worms plus nine hundred-beast-king eyes |

The supplied source explicitly says this line has no rank-five continuation.
For the current below-rank-three game scope, Wine Worm and Four Flavors Liquor
Worm are directly usable; Seven Fragrances is the progression boundary.

### Qing Mao political map is time-dependent

- Before the wolf tide, Gu Yue is the weakening traditional hegemon, Bai is the
  rising challenger, and Xiong is the strength-focused third power.
- The wolf tide forces a formal alliance with mutual aid, an internal-killing
  ban, investigation and joint punishment.
- Cooperation never erases competition over prestige, battle results and
  resource allocation.
- At volume 1 section 199 the regional political structure collapses when Qing
  Mao Mountain becomes an ice disaster zone.

Faction "emotion" therefore cannot be one timeless value. It must be a
time-scoped relation snapshot, as represented in
`curated/qing-mao-world.json`.

## Known Limits

- The generated Gu candidate list is a review queue, not a canonical database.
  Chinese prose frequently places verbs, owners and ranks immediately before
  `蛊`; automatic suffix extraction cannot establish identity by itself.
- Automatic rank and path tags are proximity hints. Curated records take
  precedence.
- The repository deliberately contains no novel chapters, paragraph excerpts
  or reconstructed table of contents.
- Full detailed dossiers for every late-game Gu cannot be complete from this
  source because the file itself has major missing ranges.
