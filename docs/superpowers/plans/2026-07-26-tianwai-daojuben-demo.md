# Tianwai Daojuben Demo Implementation Plan

> **Status: Deprecated as of 2026-07-27.** This text-only, alert-driven plan is
> retained for history only. Use `2026-07-27-simplified-qing-mao-mvp.md` and
> `../specs/2026-07-27-qing-mao-simplified-mvp-design.md` instead.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a small browser-playable text RPG demo that proves the core loop: daily action, theft checks, Fang Yuan alert, memory hints, and the first Wine Worm lead.

**Architecture:** Use a static HTML/CSS/JavaScript app with pure game-state functions separated from DOM rendering. Tests cover state transitions before UI is wired, so the demo logic can later move into a larger engine.

**Tech Stack:** Plain HTML, CSS, JavaScript ES modules, Node built-in test runner, PowerShell local static server.

---

## File Structure

- Create `package.json`: project metadata and test script.
- Create `index.html`: app shell.
- Create `src/content.js`: locations, actions, characters, and text snippets.
- Create `src/gameState.js`: pure game-state creation, action resolution, theft checks, and Fang Yuan alert updates.
- Create `src/app.js`: DOM rendering and click handlers.
- Create `src/styles.css`: game UI styling.
- Create `tests/gameState.test.js`: Node tests for core game rules.

## Task 1: Core Game State

**Files:**
- Create: `src/content.js`
- Create: `src/gameState.js`
- Test: `tests/gameState.test.js`

- [ ] Step 1: Write failing tests for initial state, normal action, and theft action.
- [ ] Step 2: Run `npm test` and verify the tests fail because implementation files do not exist.
- [ ] Step 3: Implement minimal content and pure state functions.
- [ ] Step 4: Run `npm test` and verify tests pass.

## Task 2: Browser UI

**Files:**
- Create: `index.html`
- Create: `src/app.js`
- Create: `src/styles.css`

- [ ] Step 1: Write a minimal shell that loads the app module.
- [ ] Step 2: Render player stats, Fang Yuan panel, memory hint, event log, and location actions.
- [ ] Step 3: Wire action buttons to `resolveAction`.
- [ ] Step 4: Manually verify the app in browser/server.

## Task 3: Local Run

**Files:**
- Modify: `package.json`

- [ ] Step 1: Add scripts for `test` and `start`.
- [ ] Step 2: Run `npm test`.
- [ ] Step 3: Start a local static server.
- [ ] Step 4: Report the local URL and what the demo currently supports.
