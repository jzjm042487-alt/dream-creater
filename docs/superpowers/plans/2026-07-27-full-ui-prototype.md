# Qing Mao MVP Full UI Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use test-driven-development to implement this plan task by task.

**Goal:** Build a clickable, production-shaped prototype for all 18 Qing Mao MVP UI panels using the latest script state and the existing environment, portrait, and chibi assets.

**Architecture:** Add a separate Vite multi-page entry at `ui.html` so the prototype can evolve without disturbing the current Phaser game. A small vanilla JavaScript state store owns the selected panel and demo state; a registry supplies navigation metadata and render functions; panel modules render the five gameplay domains into one persistent game shell.

**Tech Stack:** Vite, vanilla JavaScript, CSS, Lucide icons, Node test runner, Playwright.

---

### Task 1: Establish the UI entry and contract

**Files:**
- Create: `ui.html`
- Create: `src/ui-prototype/main.js`
- Create: `src/ui-prototype/panelRegistry.js`
- Create: `src/ui-prototype/styles.css`
- Modify: `vite.config.js`
- Test: `tests/uiPrototype.test.js`

- [ ] Write a failing test for the independent UI entry.
- [ ] Add the smallest Vite page and module entry that makes the test pass.
- [ ] Write a failing registry test for unique `UI00` through `UI17` panel IDs.
- [ ] Implement the complete navigation registry.
- [ ] Add Vite multi-page build inputs and verify both pages build.

### Task 2: Build the persistent game shell

**Files:**
- Create: `src/ui-prototype/mockState.js`
- Create: `src/ui-prototype/components.js`
- Modify: `src/ui-prototype/main.js`
- Modify: `src/ui-prototype/styles.css`
- Test: `tests/uiPrototype.test.js`

- [ ] Write failing tests for default Day 8 script state and source-query filtering.
- [ ] Implement the demo state and pure filter helper.
- [ ] Render grouped panel navigation, current location, day/act, AP, health, essence, stones, fatigue, exposure, and source sync.
- [ ] Add accessible icon controls and a responsive mobile navigation mode.

### Task 3: Implement UI00-UI04

**Files:**
- Create: `src/ui-prototype/panels/creationPanels.js`
- Modify: `src/ui-prototype/panelRegistry.js`
- Modify: `src/ui-prototype/styles.css`

- [ ] Build world generation and source synchronization.
- [ ] Build whole-card character Roll with fixed appearance and nine attributes.
- [ ] Build player state with layered buffs, debuffs, debts, and risk.
- [ ] Build aperture/cultivation and Gu/refining/feeding panels.
- [ ] Add interactive Roll, filter, selection, and state-preview behavior.

### Task 4: Implement UI05-UI10

**Files:**
- Create: `src/ui-prototype/panels/worldPanels.js`
- Modify: `src/ui-prototype/panelRegistry.js`
- Modify: `src/ui-prototype/styles.css`

- [ ] Build inventory and ownership tracking.
- [ ] Build map/travel with AP, danger, lock, and destroyed states.
- [ ] Build the 30-day quest timeline and five side-route states.
- [ ] Build the source-query cheat with year range, entity filters, provenance, interception plan, reward, and consequence.
- [ ] Build relationship tracking and Fang Yuan's verified observation card.

### Task 5: Implement UI11-UI17

**Files:**
- Create: `src/ui-prototype/panels/actionPanels.js`
- Create: `src/ui-prototype/panels/endgamePanels.js`
- Modify: `src/ui-prototype/panelRegistry.js`
- Modify: `src/ui-prototype/styles.css`

- [ ] Build dialogue choices and transparent check composition.
- [ ] Build the three-round combat command surface.
- [ ] Build the evidence board.
- [ ] Build day-end allocation and projected settlement.
- [ ] Build rollback correction and six-route permanent save/endings.
- [ ] Wire representative buttons so panels visibly respond to player actions.

### Task 6: Validate interaction and layout

**Files:**
- Create: `e2e/ui-prototype.spec.js`
- Modify: `src/ui-prototype/styles.css`

- [ ] Add Playwright coverage for all panel navigation, source-query filtering, and Roll interaction.
- [ ] Run unit tests, production build, and UI-specific end-to-end tests.
- [ ] Capture desktop and mobile screenshots.
- [ ] Inspect screenshots for blank assets, text overflow, overlap, and unusable controls.
- [ ] Fix visual defects and repeat verification.

### Task 7: Commit the approved prototype

**Files:**
- Stage only files created or intentionally modified for this UI prototype.

- [ ] Review `git diff` and `git diff --check`.
- [ ] Confirm unrelated user-authored files remain unstaged.
- [ ] Create a conventional commit describing the full UI prototype.
