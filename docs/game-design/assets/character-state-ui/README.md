# Character State UI Assets

Production assets for the approved adult character state portrait system.

## References

- Design spec: `docs/superpowers/specs/2026-07-26-character-state-portrait-ui-design.md`
- Production plan: `docs/superpowers/plans/2026-07-26-character-state-ui-image-production.md`
- Acting reference: `docs/game-design/assets/character-state-ui-reference-v2.png`

The acting reference is not a runtime layout reference. Its labels, values, slot text, and panel structure are not production requirements.

## Portrait Manifest

| Character | Age | State | File | Identity reference | Validation |
| --- | ---: | --- | --- | --- | --- |
| Clan steward | 28 | normal | `portraits/portrait_npc_clan_steward_normal.png` | self | pass: 1024×1536 RGBA |
| Clan steward | 28 | outerwear missing | `portraits/portrait_npc_clan_steward_outerwear_missing.png` | clan steward normal | pass: 1024×1536 RGBA |
| Clan steward | 28 | privacy layer missing | `portraits/portrait_npc_clan_steward_privacy_layer_missing.png` | clan steward normal | pass: 1024×1536 RGBA |
| Caravan manager | 32 | normal | `portraits/portrait_npc_caravan_manager_normal.png` | self | pass: 1024×1536 RGBA |
| Caravan manager | 32 | outerwear missing | `portraits/portrait_npc_caravan_manager_outerwear_missing.png` | caravan manager normal | pass: 1024×1536 RGBA |
| Caravan manager | 32 | privacy layer missing | `portraits/portrait_npc_caravan_manager_privacy_layer_missing.png` | caravan manager normal | pass: 1024×1536 RGBA |
| Demonic cultivator | 30 | normal | `portraits/portrait_npc_demonic_cultivator_normal.png` | self | pass: 1024×1536 RGBA |
| Demonic cultivator | 30 | outerwear missing | `portraits/portrait_npc_demonic_cultivator_outerwear_missing.png` | demonic cultivator normal | pass: 1024×1536 RGBA |
| Demonic cultivator | 30 | privacy layer missing | `portraits/portrait_npc_demonic_cultivator_privacy_layer_missing.png` | demonic cultivator normal | pass: 1024×1536 RGBA |
| Medicine physician | 35 | normal | `portraits/portrait_npc_medicine_physician_normal.png` | self | pass: 1024×1536 RGBA |
| Medicine physician | 35 | outerwear missing | `portraits/portrait_npc_medicine_physician_outerwear_missing.png` | medicine physician normal | pass: 1024×1536 RGBA |
| Medicine physician | 35 | privacy layer missing | `portraits/portrait_npc_medicine_physician_privacy_layer_missing.png` | medicine physician normal | pass: 1024×1536 RGBA |
| Tavern intelligence keeper | 38 | normal | `portraits/portrait_npc_tavern_keeper_normal.png` | self | pass: 1024×1536 RGBA |
| Tavern intelligence keeper | 38 | outerwear missing | `portraits/portrait_npc_tavern_keeper_outerwear_missing.png` | tavern keeper normal | pass: 1024×1536 RGBA |
| Tavern intelligence keeper | 38 | privacy layer missing | `portraits/portrait_npc_tavern_keeper_privacy_layer_missing.png` | tavern keeper normal | pass: 1024×1536 RGBA |

## Review Sheets

| Character | File | Validation |
| --- | --- | --- |
| Clan steward | `reviews/npc_clan_steward-three-state-review.png` | pass |
| Caravan manager | `reviews/npc_caravan_manager-three-state-review.png` | pass |
| Demonic cultivator | `reviews/npc_demonic_cultivator-three-state-review.png` | pass |
| Medicine physician | `reviews/npc_medicine_physician-three-state-review.png` | pass |
| Tavern intelligence keeper | `reviews/npc_tavern_keeper-three-state-review.png` | pass |

Additional overview files:

- `reviews/all-character-three-state-overview.png`
- `reviews/normal-identity-lineup.png`

## Support Art

| Asset | File | Validation |
| --- | --- | --- |
| Shared hostile effect | `ui_hostile_fx_overlay.png` | pass: 1024×1536 RGBA |
| UI icon sheet | `ui-icon-sheet.png` | pass: 2048×2048 RGBA |

## Generation Method

- Generator: built-in `image_gen`.
- Portrait identity: each event state references its role's normal-state chroma source.
- Transparency: flat `#00ff00` background removed with the installed imagegen chroma-key helper using soft matte and despill.
- Normalization: final portraits are centered and fitted into the approved safe zone on a 1024×1536 transparent canvas.
- Safety: every prompt explicitly requires an adult woman, complete opaque coverage, and no nudity, lingerie display, transparent fabric, cleavage, erotic framing, or suggestive pose.

## Prompt Summary

| Role | Normal identity | Outerwear-missing direction | Privacy-layer-missing direction |
| --- | --- | --- | --- |
| Clan steward | Dark-teal official uniform, ledger, authority token, controlled bearing | Opaque inner robe and borrowed shawl; checks exits while holding the shawl and token | Closed official robe; strained composure, sealed-room authority and evidence control |
| Caravan manager | Burgundy-green travel robe, abacus-ledger, trade seal, appraising gaze | Practical shawl; assesses cargo, witnesses and loss before acting | Closed travel robe; cold contractual pressure, detention or negotiation stance |
| Demonic cultivator | Charcoal combat robe, silver hair streak, Gu vessel, predatory calm | Rough shawl; low embarrassment, high vigilance and killing intent | Closed combat robe; direct confrontation, Gu vessel and talisman ready |
| Medicine physician | Celadon physician robe, medicine case, herb ledger, mature composure | Emergency shawl; checks poison, powder and Gu traces | Closed physician robe; protects evidence and prepares to seal the room |
| Tavern keeper | Deep-red and ink-blue robe, account slate, keys, social confidence | Borrowed shawl; tracks witnesses and rumor sources as the social mask cracks | Closed tavern robe; converts humiliation into public pressure and information retaliation |

## Visual Change Record

Each event portrait changes at least four categories relative to normal.

| Role | State | Changed categories |
| --- | --- | --- |
| Clan steward | outerwear missing | clothing, expression, gaze, shoulder posture, hand action, cool rim light |
| Clan steward | privacy layer missing | expression, gaze, torso angle, hand action, tightened fastening, crimson rim light |
| Caravan manager | outerwear missing | clothing, expression, gaze, torso angle, hand action, cool brass rim light |
| Caravan manager | privacy layer missing | expression, gaze, squared posture, hand action, tightened fastening, crimson rim light |
| Demonic cultivator | outerwear missing | clothing, expression, gaze, combat posture, hand action, crimson rim light |
| Demonic cultivator | privacy layer missing | expression, gaze, forward posture, hand action, tightened bindings, crimson rim light |
| Medicine physician | outerwear missing | clothing, expression, evidence-focused gaze, protective posture, hand action, cool rim light |
| Medicine physician | privacy layer missing | expression, averted evidence gaze, defensive torso angle, hand action, tightened fastening, cinnabar rim light |
| Tavern keeper | outerwear missing | clothing, expression, witness-scanning gaze, protective posture, hand action, cool rim light |
| Tavern keeper | privacy layer missing | expression, direct pressure gaze, defensive torso angle, hand action, tightened fastening, deep-crimson rim light |

## Icon Sheet Slice Map

The icon sheet is 2048×2048 with a 4×4 grid of 512×512 cells.

| Cell | Coordinates | Symbol |
| --- | --- | --- |
| r1c1 | x 0-511, y 0-511 | clothing outer |
| r1c2 | x 512-1023, y 0-511 | clothing inner |
| r1c3 | x 1024-1535, y 0-511 | clothing privacy |
| r1c4 | x 1536-2047, y 0-511 | state equipped |
| r2c1 | x 0-511, y 512-1023 | state missing |
| r2c2 | x 512-1023, y 512-1023 | emotion calm |
| r2c3 | x 1024-1535, y 512-1023 | emotion trust |
| r2c4 | x 1536-2047, y 512-1023 | emotion vigilance |
| r3c1 | x 0-511, y 1024-1535 | emotion shame-anger |
| r3c2 | x 512-1023, y 1024-1535 | emotion anger |
| r3c3 | x 1024-1535, y 1024-1535 | emotion retaliation |
| r3c4 | x 1536-2047, y 1024-1535 | action return |
| r4c1 | x 0-511, y 1536-2047 | action soothe |
| r4c2 | x 512-1023, y 1536-2047 | action investigate |
| r4c3 | x 1024-1535, y 1536-2047 | action negotiate |
| r4c4 | x 1536-2047, y 1536-2047 | reserved empty |
