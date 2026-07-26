# Character State UI Image Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use the built-in image generation workflow to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Produce the approved MVP art set: 15 independent transparent adult female character portraits, five three-state review sheets, one shared hostile UI effect, and one complete UI icon sheet.

**Architecture:** Generate one normal portrait per role, then use it as the identity reference for the role's two event-state portraits. Every portrait is generated on a flat chroma-key field, converted locally to transparent RGBA, normalized to 1024×1536, and inspected in a three-state review sheet. Supporting UI art is generated separately and never baked into the character portraits.

**Tech Stack:** Built-in `image_gen`, imagegen chroma-key removal helper, local image inspection, PowerShell, Pillow only for deterministic validation/contact-sheet assembly.

---

## File Structure

- Create: `docs/game-design/assets/character-state-ui/portraits/portrait_npc_clan_steward_normal.png`
- Create: `docs/game-design/assets/character-state-ui/portraits/portrait_npc_clan_steward_outerwear_missing.png`
- Create: `docs/game-design/assets/character-state-ui/portraits/portrait_npc_clan_steward_privacy_layer_missing.png`
- Create: `docs/game-design/assets/character-state-ui/portraits/portrait_npc_caravan_manager_normal.png`
- Create: `docs/game-design/assets/character-state-ui/portraits/portrait_npc_caravan_manager_outerwear_missing.png`
- Create: `docs/game-design/assets/character-state-ui/portraits/portrait_npc_caravan_manager_privacy_layer_missing.png`
- Create: `docs/game-design/assets/character-state-ui/portraits/portrait_npc_demonic_cultivator_normal.png`
- Create: `docs/game-design/assets/character-state-ui/portraits/portrait_npc_demonic_cultivator_outerwear_missing.png`
- Create: `docs/game-design/assets/character-state-ui/portraits/portrait_npc_demonic_cultivator_privacy_layer_missing.png`
- Create: `docs/game-design/assets/character-state-ui/portraits/portrait_npc_medicine_physician_normal.png`
- Create: `docs/game-design/assets/character-state-ui/portraits/portrait_npc_medicine_physician_outerwear_missing.png`
- Create: `docs/game-design/assets/character-state-ui/portraits/portrait_npc_medicine_physician_privacy_layer_missing.png`
- Create: `docs/game-design/assets/character-state-ui/portraits/portrait_npc_tavern_keeper_normal.png`
- Create: `docs/game-design/assets/character-state-ui/portraits/portrait_npc_tavern_keeper_outerwear_missing.png`
- Create: `docs/game-design/assets/character-state-ui/portraits/portrait_npc_tavern_keeper_privacy_layer_missing.png`
- Create: `docs/game-design/assets/character-state-ui/reviews/<character_id>-three-state-review.png`
- Create: `docs/game-design/assets/character-state-ui/ui_hostile_fx_overlay.png`
- Create: `docs/game-design/assets/character-state-ui/ui-icon-sheet.png`
- Create: `docs/game-design/assets/character-state-ui/README.md`
- Reference: `docs/game-design/assets/character-state-ui-reference-v2.png`
- Reference: `docs/superpowers/specs/2026-07-26-character-state-portrait-ui-design.md`

## Reference Rules

The approved reference image may be used only for:

- facial and body acting contrast among the three states;
- clothing silhouette differences;
- restrained charcoal, aged gold, jade, and crimson color language;
- light and threat-intensity progression.

It must not be copied for:

- UI layout;
- labels, numeric values, or slot text;
- portrait background;
- the incorrect third-panel inner-slot marker.

## Shared Portrait Requirements

- Every subject is explicitly an adult woman with the stated age.
- Output is a 1024×1536 transparent RGBA PNG.
- The portrait has no background after chroma-key removal.
- The body remains inside x 8%-92%, y 4%-100%.
- The face remains inside x 20%-80%, y 8%-38%.
- Hands and profession props remain inside x 5%-95%, y 12%-96%.
- A role's three portraits use matching scale and eye height; head-position drift stays within 5% of canvas height.
- Normal, outerwear-missing, and privacy-layer-missing are distinguishable without labels.
- Relative to normal, each event-state portrait changes at least four of these six categories: facial expression, gaze direction, shoulder/torso posture, hand action, clothing layer or fastening, and rim-light color.
- Outerwear-missing removes the formal outer robe but keeps a complete opaque high-collar inner robe and temporary shawl.
- Privacy-layer-missing retains a completely closed outer robe; the event is conveyed through face, gaze, defensive posture, hand action, and threat lighting.
- No nudity, lingerie display, transparent fabric, cleavage, sexualized pose, or suggestive camera angle.

### Task 1: Prepare Output and Production Manifest

**Files:**
- Create: `docs/game-design/assets/character-state-ui/README.md`

- [x] **Step 1: Create stable directories**

Create `portraits/`, `reviews/`, and `sources/` beneath `docs/game-design/assets/character-state-ui/`.

- [x] **Step 2: Record the prompt matrix**

Record character ID, adult age, identity features, palette, profession prop, state acting, generated source path, final path, and validation result.

- [x] **Step 3: Confirm chroma-key workflow**

Use a perfectly flat `#00ff00` background with no shadow, texture, gradient, or reflected green. Remove it with the installed imagegen helper using soft matte and despill.

Preflight:

```powershell
Test-Path 'C:\Users\15709\.codex\skills\.system\imagegen\scripts\remove_chroma_key.py'
```

Expected: `True`.

Conversion command for each generated source:

```powershell
python 'C:\Users\15709\.codex\skills\.system\imagegen\scripts\remove_chroma_key.py' `
  --input '<generated-source.png>' `
  --out '<final-portrait.png>' `
  --auto-key border `
  --soft-matte `
  --transparent-threshold 12 `
  --opaque-threshold 220 `
  --despill
```

If a thin fringe remains, rerun once with `--edge-contract 1`. If the helper is absent or the second pass still fails, stop that asset instead of inventing a different extraction method.

### Task 2: Produce Clan Steward Portraits

**Files:**
- Create the three `npc_clan_steward` portrait files.
- Create: `reviews/npc_clan_steward-three-state-review.png`

- [x] **Step 1: Generate normal**

Generate a 28-year-old adult woman, a clan steward with a stable oval face, black hair in a high official coil, a narrow bronze authority hairpin, dark teal formal uniform, ledger, and authority token. Acting is composed, careful, and official.

- [x] **Step 2: Generate outerwear-missing from the normal identity**

Preserve face, hair, age, scale, and profession markers. Remove the formal outer robe; use opaque high-collar inner clothing and a temporary shawl. She controls panic, secures the shawl, and checks exits.

- [x] **Step 3: Generate privacy-layer-missing from the normal identity**

Preserve identity and restore the fully closed outer robe. She remains officially controlled but visibly furious, grips an authority token, and prepares to seal the storehouse and investigate.

- [x] **Step 4: Remove chroma key and validate**

Convert all three to transparent RGBA PNG, verify dimensions and transparent corners, then assemble a review sheet. For each event state, record which four or more visual categories changed from normal.

### Task 3: Produce Caravan Manager Portraits

**Files:**
- Create the three `npc_caravan_manager` portrait files.
- Create: `reviews/npc_caravan_manager-three-state-review.png`

- [x] **Step 1: Generate normal**

Generate a 32-year-old adult woman with a square-oval face, dark brown braided travel bun, brass trade seal, burgundy and muted green layered travel clothes, ledger or abacus, confident posture, and a decisive appraising gaze.

- [x] **Step 2: Generate outerwear-missing from the normal identity**

Preserve identity. She uses a practical travel shawl over opaque inner clothing, checks the missing asset before reacting, and judges the player and nearby cargo.

- [x] **Step 3: Generate privacy-layer-missing from the normal identity**

Preserve identity and closed outer travel robe. Her expression becomes cold and contractual; one hand closes the ledger while the other reaches for a trade seal, preparing detention or negotiation.

- [x] **Step 4: Remove chroma key and validate**

Convert, validate, assemble the three-state review sheet, and record at least four changed visual categories for each event state.

### Task 4: Produce Demonic Cultivator Portraits

**Files:**
- Create the three `npc_demonic_cultivator` portrait files.
- Create: `reviews/npc_demonic_cultivator-three-state-review.png`

- [x] **Step 1: Generate normal**

Generate a 30-year-old adult woman with a long angular face, ash-black hair with one pale streak, restrained crimson cords, a closed charcoal combat robe, Gu vessel or combat talisman, predatory calm, and a faint testing smile.

- [x] **Step 2: Generate outerwear-missing from the normal identity**

Preserve identity. Use complete opaque inner combat clothing and a rough shawl; embarrassment stays low while vigilance and killing intent rise, one hand already near the Gu vessel.

- [x] **Step 3: Generate privacy-layer-missing from the normal identity**

Preserve identity and restore a fully closed combat robe. She does not avert her gaze; she locks onto the suspect with direct threat and planned retaliation.

- [x] **Step 4: Remove chroma key and validate**

Convert, validate, assemble the three-state review sheet, and record at least four changed visual categories for each event state.

### Task 5: Produce Medicine Physician Portraits

**Files:**
- Create the three `npc_medicine_physician` portrait files.
- Create: `reviews/npc_medicine_physician-three-state-review.png`

- [x] **Step 1: Generate normal**

Generate a 35-year-old adult woman with a calm mature face, dark hair secured by a celadon medical pin, layered celadon, white, and charcoal physician robes, medicine case or herb ledger, and professional composure.

- [x] **Step 2: Generate outerwear-missing from the normal identity**

Preserve identity. Use complete opaque inner physician clothing and a clean emergency shawl; surprise turns into methodical inspection for poison, powder, or Gu traces.

- [x] **Step 3: Generate privacy-layer-missing from the normal identity**

Preserve identity and restore a fully closed physician robe. Her defensive posture is measured rather than theatrical; she seals the space, protects her medical case, and studies evidence.

- [x] **Step 4: Remove chroma key and validate**

Convert, validate, assemble the three-state review sheet, and record at least four changed visual categories for each event state.

### Task 6: Produce Tavern Intelligence Keeper Portraits

**Files:**
- Create the three `npc_tavern_keeper` portrait files.
- Create: `reviews/npc_tavern_keeper-three-state-review.png`

- [x] **Step 1: Generate normal**

Generate a 38-year-old adult woman with a warm mature face, dark auburn hair pinned with brass keys, deep red and ink-blue closed tavern robes, a small account slate or wine key ring, a confident social smile, and alert eyes.

- [x] **Step 2: Generate outerwear-missing from the normal identity**

Preserve identity. Use complete opaque inner clothing and a hastily borrowed shawl; the social mask cracks while she tracks witnesses and the likely rumor source.

- [x] **Step 3: Generate privacy-layer-missing from the normal identity**

Preserve identity and restore a fully closed tavern robe. She converts humiliation into public pressure and controlled retaliation, gripping the key ring while preparing a rumor response.

- [x] **Step 4: Remove chroma key and validate**

Convert, validate, assemble the three-state review sheet, and record at least four changed visual categories for each event state.

### Task 7: Produce Shared UI Support Art

**Files:**
- Create: `docs/game-design/assets/character-state-ui/ui_hostile_fx_overlay.png`
- Create: `docs/game-design/assets/character-state-ui/ui-icon-sheet.png`

- [x] **Step 1: Generate the hostile effect**

Create one 1024×1536 transparent UI layer containing only a restrained crimson border, rim-light arcs, and a background sealing motif. It must contain no face, body, clothing, words, or numbers.

- [x] **Step 2: Generate the icon sheet**

Create a consistent 2048×2048 transparent sprite sheet with a 4×4 grid of 512×512 cells. Keep each icon inside the central 70% of its cell and use this exact row-major mapping:

| Cell | Coordinates | Symbol |
| --- | --- | --- |
| r1c1 | x 0-511, y 0-511 | clothing outer |
| r1c2 | x 512-1023, y 0-511 | clothing inner |
| r1c3 | x 1024-1535, y 0-511 | clothing privacy, abstract closed-layer symbol |
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
| r4c4 | x 1536-2047, y 1536-2047 | empty reserved cell |

Use abstract symbols only. Do not depict underwear or a nude body.

- [x] **Step 3: Validate support art**

Verify that every required icon is present once in the assigned cell, the reserved cell is empty, the hostile layer is transparent and contains no character art, and both files are readable at runtime scale. Record the table above verbatim in the manifest as the runtime slice map.

### Task 8: Final Verification and Manifest

**Files:**
- Modify: `docs/game-design/assets/character-state-ui/README.md`

- [x] **Step 1: Verify file count**

Expected:

- exactly 15 transparent portrait PNGs;
- exactly five three-state review PNGs;
- one hostile UI effect PNG;
- one UI icon sheet PNG.

- [x] **Step 2: Verify technical properties**

For every portrait, verify 1024×1536 dimensions, RGBA mode, transparent corners, non-empty subject bounds, and safe-zone coverage.

- [x] **Step 3: Visually inspect review sheets**

Check identity stability, eye-height drift, distinct state acting, complete coverage, profession identity, and absence of visual overlap or corrupted content.

- [x] **Step 4: Complete manifest**

Record final paths, dimensions, generation prompt summaries, identity reference relationships, and pass/fail notes.

- [x] **Step 5: Review repository changes**

Run `git status --short` and `git diff --check`. Do not stage or commit unrelated existing worktree changes.
