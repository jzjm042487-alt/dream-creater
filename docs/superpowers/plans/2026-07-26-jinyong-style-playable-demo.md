# 群侠传式可玩 Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把现有地点按钮文字原型改造成一个复古像素风、可自由行走、拥有三条酒虫路线、回合制战斗和方源动态行动的浏览器 RPG Demo。

**Architecture:** 使用 Phaser 3.90 管理场景、输入、镜头、精灵与碰撞，Vite 负责开发和构建。所有任务、时间、盗取、战斗和存档规则保留为独立纯 JavaScript 模块，Phaser 场景只负责收集输入、播放表现并派发领域事件。环境图使用用户确认的复古像素图作为可交互背景，地图碰撞与触发区由显式数据定义。

**Tech Stack:** JavaScript ES modules, Phaser 3.90.0, Vite 8.1.5, Node test runner, Playwright 1.62.0, localStorage, generated PNG assets.

---

## Workspace Note

`D:\codeing\06-research\1-game` 当前不是 Git 仓库。不要擅自执行 `git init`。下列任务以测试通过和文件检查作为 checkpoint；若用户之后启用 Git，再补做任务级提交。

## File Structure

### Entry And Tooling

- Modify: `package.json` - dependencies and test/build scripts.
- Modify: `index.html` - Phaser canvas mount point and accessible fallback.
- Replace: `src/app.js` with `src/main.js` - start the Phaser game.
- Modify: `src/styles.css` - full-screen game shell and responsive canvas.
- Create: `vite.config.js` - dev server configuration.
- Create: `playwright.config.js` - browser-test server and viewports.

### Pure Domain

- Create: `src/game/state/createInitialState.js` - versioned initial state.
- Create: `src/game/state/gameReducer.js` - pure persistent-state transitions.
- Create: `src/game/state/selectors.js` - UI-safe derived values.
- Create: `src/game/state/saveStore.js` - localStorage serialization and validation.
- Create: `src/game/rules/timeRules.js` - time costs, action ordering, cutoff logic.
- Create: `src/game/rules/theftRules.js` - deterministic theft formula and outcomes.
- Create: `src/game/rules/battleRules.js` - deterministic grid combat reducer.
- Create: `src/game/content/wineWormQuest.js` - conditions and effects for all routes.
- Create: `src/game/content/dialogues.js` - compact dialogue and clue content.
- Create: `src/game/content/maps.js` - scene background, collision, exits, NPCs, triggers.
- Modify: `src/gameState.js` - compatibility exports during migration.
- Modify: `src/content.js` - remove legacy action-card content after the Phaser shell lands.

### Phaser Runtime

- Create: `src/game/config.js` - Phaser configuration and scene list.
- Create: `src/game/GameStateStore.js` - reducer wrapper with subscriptions and autosave.
- Create: `src/game/scenes/BootScene.js` - preload assets and validate load failures.
- Create: `src/game/scenes/WorldScene.js` - overworld movement and fixed encounter.
- Create: `src/game/scenes/LocationScene.js` - data-driven village/interior scenes.
- Create: `src/game/scenes/BattleScene.js` - grid rendering and battle input.
- Create: `src/game/scenes/UIScene.js` - HUD, dialogue, journal, inventory, pause.
- Create: `src/game/systems/InteractionSystem.js` - nearest-facing interaction target.
- Create: `src/game/systems/NpcScheduleSystem.js` - place NPCs from time and quest state.
- Create: `src/game/systems/PlayerController.js` - normalized 8-way movement with 4-way animation.

### Assets

- Create: `public/assets/game/environments/world-map.png`
- Create: `public/assets/game/environments/village.png`
- Create: `public/assets/game/environments/academy.png`
- Create: `public/assets/game/environments/tavern.png`
- Create: `public/assets/game/environments/dorm.png`
- Create: `public/assets/game/environments/forest-battle.png`
- Create: `public/assets/game/sprites/player-sheet.png`
- Create: `public/assets/game/sprites/fang-yuan-sheet.png`
- Create: `public/assets/game/sprites/keeper-sheet.png`
- Create: `public/assets/game/sprites/merchant-sheet.png`
- Create: `public/assets/game/sprites/clerk-sheet.png`
- Create: `public/assets/game/sprites/villager-sheet.png`
- Create: `public/assets/game/sprites/guard-sheet.png`
- Create: `public/assets/game/items/item-sheet.png`
- Create: `scripts/validate-assets.mjs` - dimensions, existence, and alpha checks.

### Tests

- Move: `tests/gameState.test.js` to `tests/legacy-gameState.test.js` - preserve the ten legacy tests unchanged.
- Create: `tests/gameState.test.js` - new persistent-state behavior.
- Create: `tests/timeRules.test.js`
- Create: `tests/theftRules.test.js`
- Create: `tests/wineWormQuest.test.js`
- Create: `tests/battleRules.test.js`
- Create: `tests/saveStore.test.js`
- Create: `tests/assets.test.js`
- Create: `e2e/exploration.spec.js`
- Create: `e2e/wine-worm.spec.js`
- Create: `e2e/battle.spec.js`

---

### Task 1: Establish The Toolchain And Preserve The Red Baseline

**Files:**
- Modify: `package.json`
- Create: `vite.config.js`
- Create: `playwright.config.js`
- Test: `tests/gameState.test.js`

- [ ] **Step 1: Record the existing expected failures**

Run:

```powershell
npm test
```

Expected: eight tests pass and the two existing hide/refine tests fail with unknown actions. Save the important output in the work log; do not weaken or delete these tests.

- [ ] **Step 2: Add exact dependencies and scripts**

Update `package.json` to include:

```json
{
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "node --test",
    "test:e2e": "playwright test",
    "test:all": "npm test && npm run build && npm run test:e2e"
  },
  "dependencies": {
    "phaser": "3.90.0"
  },
  "devDependencies": {
    "@playwright/test": "1.62.0",
    "pngjs": "7.0.0",
    "vite": "8.1.5"
  }
}
```

- [ ] **Step 3: Install packages**

Run:

```powershell
npm install
npx playwright install chromium
```

Expected: `package-lock.json` is created or updated without dependency errors and the Chromium runtime is available.

- [ ] **Step 4: Configure Vite**

Create `vite.config.js`:

```js
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: false,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: false,
  },
});
```

- [ ] **Step 5: Configure Playwright**

Create `playwright.config.js` with one Chromium desktop project, screenshots on failure, and:

```js
const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  use: { baseURL: externalBaseUrl || "http://127.0.0.1:4173" },
  webServer: externalBaseUrl
    ? undefined
    : {
        command: "npm run dev -- --port 4173 --strictPort",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: true,
      },
});
```

- [ ] **Step 6: Verify the toolchain without claiming the app is fixed**

Run:

```powershell
npm run build
```

Expected: the legacy app still builds. `npm test` is still red only for the two known missing actions.

Checkpoint: dependencies and scripts are reproducible.

---

### Task 2: Build The Versioned State, Time Rules, Hide, And Refine

**Files:**
- Create: `src/game/state/createInitialState.js`
- Create: `src/game/state/gameReducer.js`
- Create: `src/game/rules/timeRules.js`
- Modify: `src/gameState.js`
- Modify: `src/content.js`
- Move: `tests/gameState.test.js` to `tests/legacy-gameState.test.js`
- Create: `tests/gameState.test.js`
- Create: `tests/timeRules.test.js`

- [ ] **Step 1: Write failing tests for the approved initial state**

First move the existing file to `tests/legacy-gameState.test.js` without changing its assertions. Create the new `tests/gameState.test.js` for the nested version-2 state.

Test exact values:

```js
assert.deepEqual(
  {
    day: state.clock.day,
    tick: state.clock.tick,
    stones: state.player.stones,
    hp: state.player.hp,
    essence: state.player.essence,
    alert: state.fangYuan.alert,
    owner: state.wineWorm.owner,
  },
  {
    day: 1,
    tick: 0,
    stones: 6,
    hp: 40,
    essence: 20,
    alert: 8,
    owner: "merchant",
  }
);
```

- [ ] **Step 2: Write failing tests for time priority**

Cover:

- zero-cost UI events do not advance time;
- a two-point action started at tick `6` may claim the wine worm before the tick-`8` cutoff;
- the cutoff runs after the player result at tick `8`;
- no two-point action starts after tick `10`;
- sleep advances to next day tick `0`.

- [ ] **Step 3: Write failing hide/refine tests**

Use reducer events rather than legacy action IDs:

```js
state = reduceGameState(state, { type: "WINE_WORM_ACQUIRED", route: "theft" });
state = reduceGameState(state, { type: "WINE_WORM_HIDDEN" });
assert.equal(state.wineWorm.status, "hidden");

state = reduceGameState(state, { type: "WINE_WORM_REFINED" });
assert.equal(state.wineWorm.status, "refined");
assert.equal(state.player.cultivation, 30);
assert.equal(state.player.essence, 12);
```

- [ ] **Step 4: Run focused tests and confirm they fail**

Run:

```powershell
node --test tests/gameState.test.js tests/timeRules.test.js
```

Expected: failures for missing new modules or reducer events.

- [ ] **Step 5: Implement the minimal state shape**

`createInitialState()` must include:

```js
{
  version: 2,
  clock: { day: 1, tick: 0 },
  scene: { id: "world", entrance: "gu-yue-road" },
  player: {
    hp: 40,
    maxHp: 40,
    essence: 20,
    maxEssence: 20,
    stones: 6,
    cultivation: 0,
    theftRank: 1,
    stats: { agility: 3, insight: 3, caution: 2 }
  },
  fangYuan: { alert: 8, stance: "ignore" },
  wineWorm: { owner: "merchant", status: "carried", failedAttempts: 0 },
  clues: [],
  flags: {},
  inventory: []
}
```

- [ ] **Step 6: Implement player-first time resolution**

Expose pure functions:

```js
canStartAction(state, cost)
advanceAfterPlayerResult(state, cost)
sleepToNextDay(state)
```

Advance one tick at a time and run the cutoff callback after each tick.

- [ ] **Step 7: Implement hide and refine events with time settlement**

Reject hide unless owner is `player` and one time point remains. Resolve hiding first, then advance exactly `1` time point. Reject refine unless status is `hidden`, essence is at least `8`, and two time points remain. Resolve refining first, then advance exactly `2` time points; refining deducts `8` essence and adds `30` cultivation.

- [ ] **Step 8: Keep the legacy prototype isolated and fix its two known red actions**

Do not make the new nested state impersonate the legacy flat state. Keep `src/gameState.js` and the old UI isolated until Task 6. Add `hide-wine-worm` and `refine-wine-worm` directly to the legacy `src/content.js` and `src/gameState.js`, including legacy flags and action-point costs, solely to make its existing ten tests green. New tests import the new modules from `src/game/`.

- [ ] **Step 9: Verify**

Run:

```powershell
npm test
```

Expected: all legacy and new state/time tests pass. No compatibility adapter between the two state shapes exists.

Checkpoint: the repository returns to green before frontend replacement.

---

### Task 3: Implement Deterministic Theft And The Wine-Worm Graph

**Files:**
- Create: `src/game/rules/theftRules.js`
- Create: `src/game/content/wineWormQuest.js`
- Create: `tests/theftRules.test.js`
- Create: `tests/wineWormQuest.test.js`

- [ ] **Step 1: Write the theft-score tests**

Test:

```js
assert.equal(
  calculateTheftResult({
    theftRank: 1,
    agility: 3,
    insight: 3,
    caution: 2,
    preparation: 4,
    difficulty: 9,
  }).band,
  "success"
);
```

Also cover exact boundaries `3`, `0`, and `-1`.

- [ ] **Step 2: Write one failing end-to-end domain test per route**

Route A:

```text
observe clerk -> steal patrol sheet -> confirm jar -> steal at tavern -> hide -> refine
```

Route B:

```text
start at tick 3 -> pass three checkpoints -> pay 2 stones -> deterministic theft -> hide -> refine
```

Route C:

```text
start with 6 -> first training stipend +4 -> forest reward +8 -> pay 18 before cutoff -> hide -> refine
```

- [ ] **Step 3: Write failure-forward tests**

Cover:

- first partial success gives the guest-room key;
- first full failure raises price to `22`;
- second acquisition failure transfers ownership to Fang Yuan;
- deadline at day 2 tick `8` transfers ownership only if the player has not already claimed it;
- Fang Yuan's night window repeats after defeat.

- [ ] **Step 4: Run tests and confirm failure**

Run:

```powershell
node --test tests/theftRules.test.js tests/wineWormQuest.test.js
```

- [ ] **Step 5: Implement theft rules**

Return:

```js
{
  score,
  band: score >= 3 ? "success" : score >= 0 ? "partial" : "failure"
}
```

Do not call `Math.random()`.

- [ ] **Step 6: Implement quest actions as data**

Each action entry must contain:

```js
{
  id,
  availability(state, context),
  timeCost,
  stoneCost,
  difficulty,
  preparation(state),
  resolve(state, outcome)
}
```

Implement route actions and the fixed alert deltas from the spec.

- [ ] **Step 7: Verify all route and anti-softlock tests**

Run:

```powershell
npm test
```

Expected: all domain tests pass.

Checkpoint: the complete酒虫 state graph works with no browser.

---

### Task 4: Implement Deterministic Grid Combat

**Files:**
- Create: `src/game/rules/battleRules.js`
- Create: `tests/battleRules.test.js`

- [ ] **Step 1: Write failing tests for movement and turn order**

Cover:

- player moves at most three orthogonal cells;
- diagonal movement is invalid in battle;
- enemy moves at most two cells after the player action;
- BFS ties use up, left, right, down.

- [ ] **Step 2: Write failing tests for every action**

Test exact values:

- basic attack deals `8`;
- defense reduces `9` to `4`;
- `妙手` costs `3` essence and steals once;
- `偷元` deals `6`, restores `3`, costs `4`, and starts a two-turn cooldown;
- escape works only on an edge cell.

- [ ] **Step 3: Write wine-worm ownership tests**

Cover:

- successful `妙手` against Fang Yuan sets transient `contested`;
- escape or victory commits player ownership;
- defeat restores Fang Yuan ownership;
- victory without `妙手` awards the wine worm.

- [ ] **Step 4: Run and confirm failure**

Run:

```powershell
node --test tests/battleRules.test.js
```

- [ ] **Step 5: Implement a pure battle reducer**

Required API:

```js
createBattleState(kind, persistentState)
getReachableCells(battle)
reduceBattle(battle, action)
commitBattleResult(persistentState, battle)
```

- [ ] **Step 6: Verify**

Run:

```powershell
npm test
```

Checkpoint: battle rules are complete before Phaser rendering.

---

### Task 5: Generate And Validate The Real Pixel Assets

**Files:**
- Create: `public/assets/game/environments/*.png`
- Create: `public/assets/game/sprites/*.png`
- Create: `public/assets/game/items/item-sheet.png`
- Create: `scripts/validate-assets.mjs`
- Create: `scripts/normalize-sprites.mjs`
- Create: `scripts/validate-sprite-grid.mjs`
- Create: `tests/assets.test.js`

- [ ] **Step 1: Create public asset directories and inspect the approved tavern reference**

Keep the concept source unchanged:

```text
assets/concepts/retro-pixel-tavern-reference.png
```

Load it with `view_image` before using it as an imagegen style/edit reference. Runtime Phaser URLs will use `/assets/game/...`; all runtime-loaded PNGs live under `public/assets/game/` so Vite copies them to `dist` unchanged.

- [ ] **Step 2: Create a character-free tavern and five matching environments with imagegen**

First edit the approved tavern reference into `public/assets/game/environments/tavern.png`:

```text
Remove every baked-in person and character sprite while preserving the room geometry, counter, tables, wine jars, doors, walkable floor, pixel scale, lighting, and camera exactly. Reconstruct the floor and furniture naturally behind removed actors. No people, silhouettes, text, UI, logos, or watermark.
```

Then generate the other five images separately, using the approved tavern only as a style reference, with the common constraints:

```text
Use case: stylized-concept
Asset type: playable 2D RPG environment background
Style/medium: late-1990s Chinese DOS RPG pixel art, crisp 16-bit tiles and sprites, original interpretation
Composition/framing: landscape 16:9, three-quarter top-down gameplay camera, fully readable walkable paths
Constraints: consistent scale with the approved tavern; no UI; no text; no logo; no watermark; no blur
```

Scene-specific prompts:

- `world-map.png`: 青茅山山脉、古月山寨、山林岔路、隐藏洞口、明确道路。
- `village.png`: 古月山寨街区、学堂入口、酒馆入口、玩家住处、后巷。
- `academy.png`: 木制学堂、执事桌、行政木柜、修炼席位、清晰走道。
- `dorm.png`: 简陋住处、床铺、藏赃夹层、炼化蒲团、门口。
- `forest-battle.png`: 林间空地、岩石和竹木边界、适合覆盖 `8 x 6` 战斗网格。

- [ ] **Step 3: Generate one character per sprite sheet on flat chroma-key backgrounds**

Generate:

- player: four direction rows, three walk frames per row;
- Fang Yuan: same layout and scale;
- separate keeper, merchant, clerk, villager, and guard sheets, each with the same `3 x 4` layout;
- item sheet: wine worm, wine jar, patrol sheet, primeval stone.

Prompt every sheet for a perfectly flat `#00ff00` background with no shadows, no text, consistent cells, generous padding, and no green inside subjects.

- [ ] **Step 4: Remove chroma key**

Use the installed imagegen helper for each sprite sheet:

```powershell
python "C:\Users\15709\.codex\skills\.system\imagegen\scripts\remove_chroma_key.py" --input <source> --out <final.png> --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill
```

Retry once with `--edge-contract 1` only if a green fringe remains.

- [ ] **Step 5: Inspect every asset**

Use `view_image` and verify:

- no accidental text or watermark;
- walkable areas are visually obvious;
- character sizes match;
- transparent corners exist on sprite sheets;
- key colors do not leak into characters.

- [ ] **Step 6: Normalize and validate sprite grids**

Each character sheet must contain exactly one character with `3` equal-width frames by `4` equal-height direction rows. Use `pngjs` in `scripts/normalize-sprites.mjs` to crop only uniform outer padding and place the existing pixels on a canvas whose width is divisible by `3` and height by `4`; do not stretch individual characters. If the generated poses do not align to that grid, regenerate the sheet instead of guessing frame boundaries.

`scripts/validate-sprite-grid.mjs` verifies:

- width `% 3 === 0`;
- height `% 4 === 0`;
- every frame contains non-transparent subject pixels;
- frame dimensions match across player, Fang Yuan, keeper, merchant, clerk, villager, and guard sheets.

- [ ] **Step 7: Add deterministic asset validation**

`scripts/validate-assets.mjs` must fail on missing files, zero dimensions, or sprites without alpha. `tests/assets.test.js` calls the validator.

- [ ] **Step 8: Verify**

Run:

```powershell
node scripts/validate-assets.mjs
node scripts/normalize-sprites.mjs --check
node scripts/validate-sprite-grid.mjs
npm test
```

Checkpoint: the project contains real, inspected assets rather than wireframe placeholders.

---

### Task 6: Replace The Static UI With A Walking Phaser Shell

**Files:**
- Modify: `index.html`
- Replace: `src/app.js` with `src/main.js`
- Modify: `src/styles.css`
- Create: `src/game/config.js`
- Create: `src/game/GameStateStore.js`
- Create: `src/game/scenes/BootScene.js`
- Create: `src/game/scenes/WorldScene.js`
- Create: `src/game/scenes/LocationScene.js`
- Create: `src/game/scenes/UIScene.js`
- Create: `src/game/systems/PlayerController.js`
- Create: `src/game/content/maps.js`
- Create: `e2e/exploration.spec.js`

- [ ] **Step 1: Write a failing browser smoke test**

Name the test exactly `"production asset smoke"` so Task 12 can select it with `--grep`. Assert:

```js
await expect(page.locator("canvas")).toBeVisible();
await expect(page.locator("[data-testid='location-name']")).toHaveText("青茅山");
```

- [ ] **Step 2: Write a failing movement and collision test**

Expose a development-only state snapshot on `window.__GAME_DEBUG__`. Press `ArrowRight`, assert player `x` increases, then hold into a blocker and assert the position stops.

- [ ] **Step 3: Run and confirm failure**

Run:

```powershell
npx playwright test e2e/exploration.spec.js
```

- [ ] **Step 4: Bootstrap Phaser without the not-yet-created battle scene**

Use:

```js
new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-root",
  width: 1280,
  height: 720,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
  scene: [BootScene, WorldScene, LocationScene, UIScene],
});
```

Task 9 adds and registers `BattleScene`; Task 6 must build without importing it.

- [ ] **Step 5: Load real assets with a visible error fallback**

BootScene must show progress. Any failed asset displays an error overlay with a retry button instead of a blank canvas.

- [ ] **Step 6: Implement map data**

Each map entry contains:

```js
{
  id,
  texture,
  worldSize,
  spawnPoints,
  collisionRects,
  exits,
  interactions,
  npcSlots
}
```

Start with the world, village, academy, tavern, and dorm. Define collision rectangles from the actual inspected images.

- [ ] **Step 7: Implement movement**

Normalize diagonal velocity. Use the last dominant axis to select one of four animations. Camera follows the player and stops at world bounds.

- [ ] **Step 8: Implement data-driven transition costs**

Walking into an exit shows a small `E` prompt. Each exit declares `timeCost`:

- overworld into a named destination: `1`;
- named destination back to overworld: `0`;
- village street into academy, tavern, or dorm: `0`;
- any transition marked `returnHome`: `0` and remains usable at tick `12`.

Confirming validates the declared cost, autosaves, and starts the destination map at a named entrance.

- [ ] **Step 9: Verify**

Run:

```powershell
npm test
npm run build
npx playwright test e2e/exploration.spec.js
```

Checkpoint: a player can walk through the real world and local scene images.

---

### Task 7: Add Proximity Interaction, Dialogue, Journal, And NPC Schedules

**Files:**
- Create: `src/game/systems/InteractionSystem.js`
- Create: `src/game/systems/NpcScheduleSystem.js`
- Create: `src/game/content/dialogues.js`
- Create: `src/game/state/selectors.js`
- Modify: `src/game/scenes/LocationScene.js`
- Modify: `src/game/scenes/UIScene.js`
- Modify: `e2e/exploration.spec.js`

- [ ] **Step 1: Write failing interaction tests**

Verify:

- no prompt when farther than `56` pixels;
- nearest object in the facing cone is selected;
- `E` opens dialogue or investigation;
- dialogue locks movement and never advances time unless its choice produces a valid clue.

- [ ] **Step 2: Write failing schedule tests**

At exact ticks, assert the merchant and Fang Yuan occupy the spec's map slots. Assert pause and journal do not move them. Add exact stance tests:

- alert `19` => `ignore`;
- alert `20` => `observe`;
- alert `40` => `test`.

Add behavior tests:

- observe mode creates one nearby Fang Yuan appearance per day and exposes the false wine-jar clue;
- test mode places Fang Yuan outside the dorm next morning;
- after refinement in test mode, the village exit interaction becomes the final test dialogue.

- [ ] **Step 3: Implement the interaction system**

Pure selection helper:

```js
findFacingInteraction(player, targets, {
  maxDistance: 56,
  coneDotThreshold: 0.35,
});
```

- [ ] **Step 4: Implement data-driven dialogue**

Dialogue nodes contain exact text, conditions, choices, events, and whether they consume time. Include all route clues and avoid task-arrow language.

- [ ] **Step 5: Implement journal and inventory overlays**

`J` and `I` toggle overlays. Journal separates:

- 原著记忆；
- 已知事实；
- 玩家推测。

No section displays a required next destination.

- [ ] **Step 6: Implement selectors and NPC schedule placement**

Create pure selectors for `fangYuanStance`, visible journal facts, route availability, and the three alert-derived behaviors. On every clock change, despawn or reposition NPC sprites from those selectors. The world state remains authoritative; the false clue is tagged internally so it can be contradicted by the correct-jar fact.

- [ ] **Step 7: Bind both interaction keys**

`E` and Space invoke the same proximity interaction command. Space must call `preventDefault()` while the game has focus so the page does not scroll.

- [ ] **Step 8: Verify**

Run:

```powershell
npm test
npx playwright test e2e/exploration.spec.js
```

Checkpoint: exploration now reveals clues through people and objects.

---

### Task 8: Integrate All Three Wine-Worm Routes

**Files:**
- Modify: `src/game/content/wineWormQuest.js`
- Modify: `src/game/content/dialogues.js`
- Modify: `src/game/content/maps.js`
- Modify: `src/game/scenes/LocationScene.js`
- Modify: `src/game/scenes/UIScene.js`
- Create: `e2e/wine-worm.spec.js`

- [ ] **Step 1: Write three failing Playwright routes**

Each test starts a fresh save and uses movement plus interactions, never direct reducer calls:

- route A: patrol sheet and back-room theft;
- route B: follow checkpoints and paid distraction;
- route C: day-one stipend `+4`, day-one ordinary theft `+4`, day-two stipend `+4`, and purchase for `18`.

End each test with:

```js
expect(await page.evaluate(() => window.__GAME_DEBUG__.state.wineWorm.status))
  .toBe("refined");
```

- [ ] **Step 2: Write a pre-combat failure-forward browser test**

Fail two merchant attempts, assert Fang Yuan acquires the item, advance to the night window, and assert the recovery interaction is visible. Do not click into combat yet; Task 9 adds the complete defeat-and-retry test after `BattleScene` exists.

- [ ] **Step 3: Add scene triggers for route A**

Implement clerk observation, patrol cabinet, correct jar, back-room window, and theft resolution.

- [ ] **Step 4: Add route B trigger zones**

While following is active:

- freeze time settlement until the sequence ends;
- track three zones in order;
- fail when distance is below `64`;
- apply exactly one two-point cost at completion;
- apply the deterministic theft check.

- [ ] **Step 5: Add route C resource interactions**

Implement daily training stipend, once-per-day ordinary theft, merchant prices `18` and `22`, and deadline transfer. Keep the fixed forest encounter trigger inactive until Task 9 registers `BattleScene`; the domain reward is already tested in Task 4.

- [ ] **Step 6: Add hide and refine object interactions**

The dorm's hidden compartment and mat call the already tested reducer events. Hiding advances exactly `1` time point and refining advances exactly `2`, using the shared player-first time resolver. Show a clear explanation when prerequisites fail.

- [ ] **Step 7: Verify**

Run:

```powershell
npm test
npx playwright test e2e/wine-worm.spec.js
```

Checkpoint: the central quest is complete without action cards.

---

### Task 9: Render And Integrate Turn-Based Combat

**Files:**
- Create: `src/game/scenes/BattleScene.js`
- Modify: `src/game/scenes/WorldScene.js`
- Modify: `src/game/scenes/LocationScene.js`
- Modify: `src/game/scenes/UIScene.js`
- Create: `e2e/battle.spec.js`
- Modify: `e2e/wine-worm.spec.js`

- [ ] **Step 1: Write failing Playwright battle tests**

Cover:

- the fixed forest clearing starts combat once per day;
- basic attack changes enemy HP by `8`;
- defense rounds Fang Yuan's `9` to `4`;
- escape only works from an edge;
- defeat returns to the dorm on the next morning;
- defeat with `18` stones loses exactly `4` stones (`floor(18 * 0.25)`);
- stealing then escaping from Fang Yuan commits player ownership.

Extend `e2e/wine-worm.spec.js` with the complete failure-forward route: fail twice, let Fang Yuan acquire the item, lose one night encounter, sleep, return the next night, win or steal-and-escape, then hide and refine.

- [ ] **Step 2: Render the grid over the real forest background**

Use stable tile dimensions derived from the canvas. Do not place the battle scene inside a decorative card.

- [ ] **Step 3: Add keyboard and pointer controls**

Arrow/WASD selects reachable cells. Buttons use icons plus short labels for attack, defend, 妙手, 偷元, and escape.

- [ ] **Step 4: Animate only state transitions**

Use short movement tweens and hit flashes. The pure battle reducer remains authoritative; animation callbacks must not decide damage.

- [ ] **Step 5: Commit persistent results only after battle**

Autosave before encounter. At battle end, `commitBattleResult` applies ownership, HP/essence consequences, rewards, and then advances persistent time by exactly `2` points once. Autosave only after that combined result. Do not save transient turn state.

- [ ] **Step 6: Verify**

Run:

```powershell
npm test
npx playwright test e2e/battle.spec.js
```

Checkpoint: combat supports funding, failure, escape, and Fang Yuan recovery.

---

### Task 10: Implement Autosave, Reset, And Recovery UX

**Files:**
- Create: `src/game/state/saveStore.js`
- Create: `tests/saveStore.test.js`
- Modify: `src/game/GameStateStore.js`
- Modify: `src/game/scenes/UIScene.js`

- [ ] **Step 1: Write failing save tests**

Cover:

- round trip under `tianwai-demo-save-v2`;
- malformed JSON returns a visible reset reason and fresh state;
- wrong version returns fresh state;
- transient battle state is omitted;
- reset removes only this key.

- [ ] **Step 2: Implement schema validation**

Do not accept a save without every required branch:

```js
version === 2
clock && clock.day >= 1
clock && clock.tick >= 0 && clock.tick <= 12
scene && typeof scene.id === "string" && typeof scene.entrance === "string"
player && Number.isFinite(player.hp) && Number.isFinite(player.maxHp)
player && Number.isFinite(player.essence) && Number.isFinite(player.maxEssence)
player && Number.isFinite(player.stones) && Number.isFinite(player.cultivation)
player && player.stats && Number.isFinite(player.stats.agility)
fangYuan && Number.isFinite(fangYuan.alert)
wineWorm && ["merchant", "player", "fangYuan"].includes(wineWorm.owner)
wineWorm && ["carried", "unhidden", "hidden", "refined"].includes(wineWorm.status)
Array.isArray(clues) && Array.isArray(inventory)
```

- [ ] **Step 3: Autosave after persistent events and scene transitions**

Use a subscription in `GameStateStore`; do not scatter direct localStorage writes through scenes.

- [ ] **Step 4: Add pause recovery controls**

Pause menu:

- continue;
- return to current map entrance;
- restart with a confirmation modal.

- [ ] **Step 5: Verify refresh behavior**

Add Playwright coverage that obtains a clue, refreshes, and sees the clue and current scene restored.

Checkpoint: refreshing and failure cannot strand the player.

---

### Task 11: Remove Legacy Cards And Polish The Playable Presentation

**Files:**
- Delete after migration: `src/app.js`
- Replace legacy content: `src/content.js`
- Modify: `src/styles.css`
- Modify: `index.html`
- Modify: all Phaser scenes as needed

- [ ] **Step 1: Remove the old card renderer**

Only after all reducer compatibility tests and browser routes pass, remove imports and markup for the old location/action cards. Preserve `src/gameState.js` and `src/content.js` legacy compatibility exports until `tests/legacy-gameState.test.js` is deliberately retired in a later project; this Demo must keep those ten tests green.

- [ ] **Step 2: Apply the approved restrained HUD**

Keep:

- top-left date/time, HP, essence;
- top-right location and small map;
- bottom dialogue only when active;
- proximity prompt near the interactable;
- Fang Yuan stance as words, not his hidden plan.

- [ ] **Step 3: Add pixel-safe responsive behavior**

Desktop is primary. At widths below `900px`, fit the entire canvas and stack modal controls without changing gameplay coordinates. Do not add touch controls.

- [ ] **Step 4: Audit visible copy**

Remove any “click this next” instructions, feature explanations, legacy “当前机缘” cards, or test labels outside development mode.

- [ ] **Step 5: Build**

Run:

```powershell
npm run build
```

Expected: Vite builds without warnings caused by project code.

Checkpoint: the first screen is the game itself.

---

### Task 12: Full Verification And Browser Handoff

**Files:**
- Modify only when verification reveals a scoped defect.
- Create: `demo-jinyong-style-desktop.png`
- Create: `demo-jinyong-style-battle.png`

- [ ] **Step 1: Run all unit tests**

```powershell
npm test
```

Expected: all tests pass with zero failures.

- [ ] **Step 2: Run the production build**

```powershell
npm run build
```

Expected: success and a populated `dist/`.

- [ ] **Step 3: Smoke-test the built assets through Vite preview**

Start preview as a hidden child process, wait for its URL, run the production-asset smoke test, and stop it:

```powershell
$previewProcess = Start-Process -FilePath 'node.exe' -ArgumentList 'node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4174','--strictPort' -WorkingDirectory 'D:\codeing\06-research\1-game' -WindowStyle Hidden -PassThru
try {
  for ($attempt = 0; $attempt -lt 50; $attempt++) {
    try {
      Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4174' | Out-Null
      break
    } catch {
      Start-Sleep -Milliseconds 100
    }
  }
  $env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:4174'
  npx playwright test e2e/exploration.spec.js --grep "production asset smoke"
} finally {
  Stop-Process -Id $previewProcess.Id -ErrorAction SilentlyContinue
  Remove-Item Env:PLAYWRIGHT_BASE_URL -ErrorAction SilentlyContinue
}
```

Expected: all `/assets/game/...` requests succeed from `dist`; canvas and player sprites render.

- [ ] **Step 4: Run all Playwright routes**

```powershell
npm run test:e2e
```

Expected: exploration, all three wine-worm routes, failure recovery, combat, and refresh tests pass.

- [ ] **Step 5: Start the dev server**

```powershell
npm run dev -- --port 4173
```

If `4173` is occupied, use the next free port and report it.

- [ ] **Step 6: Capture and inspect desktop screenshots**

Capture:

- world or village exploration;
- tavern interaction;
- battle grid.

Inspect with `view_image` for blank canvas, wrong scaling, overlaps, unreadable interactables, and inconsistent sprite sizes.

- [ ] **Step 7: Perform canvas-pixel checks**

Use Playwright screenshot sampling to prove the canvas is not a uniform blank color and that assets rendered after scene transitions.

- [ ] **Step 8: Manual smoke route**

Play route A from a clean save entirely through visible controls:

```text
enter village -> academy clue -> tavern jar -> acquire -> dorm hide -> refine
```

- [ ] **Step 9: Report the playable URL and controls**

Report the local URL, exact controls, completed routes, test counts, and any deliberately deferred content.

Checkpoint: the user can immediately open and play the Demo.
