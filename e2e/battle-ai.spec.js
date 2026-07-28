import { expect, test } from "@playwright/test";

const SAVE_KEY = "tianwai-daojuren-save-v3";

test("renders the authored 8x6 battle without exposing AI internals", async ({
  page
}) => {
  await page.goto("/?testMode=1&battleId=B-D17-01");

  await expect(page.getByTestId("scene-name")).toHaveText(
    "战斗 B-D17-01"
  );
  const root = page.getByTestId("game-root");
  await expect(root).toHaveAttribute("data-battle-board", "8x6");
  await expect(root).toHaveAttribute("data-battle-enemy-count", "1");
  await expect(root).toHaveAttribute(
    "data-battle-difficulty",
    "ai_difficulty_standard"
  );
  await expect(page.getByTestId("battle-difficulty")).toHaveText("标准");
  await expect(page.locator("[data-battle-panel]")).not.toContainText(
    /分数|意图|深度|候选/
  );
});

test("renders authored multi-enemy encounters and resolves one fixed enemy phase", async ({
  page
}) => {
  await page.goto("/?testMode=1&battleId=B-D26-01");

  await expect(page.getByTestId("game-root")).toHaveAttribute(
    "data-battle-enemy-count",
    "2"
  );
  await page
    .getByRole("button", { name: "防御", exact: true })
    .click();

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.__TIANWAI_GAME__.game.scene.getScene("battle")
            .lastEnemySummaries.length
      )
    )
    .toBe(2);
  await expect(page.locator("[data-battle-status]")).toContainText(
    "第2回合"
  );
});

test("reloading the same enemy-phase save reproduces action and damage", async ({
  page
}) => {
  test.setTimeout(60_000);
  await page.goto("/?testMode=1");
  const baseline = await page.evaluate(() => {
    window.__TIANWAI_GAME__.store.startBattle(
      "B-Q02-01",
      "enemy_first"
    );
    return localStorage.getItem("tianwai-daojuren-save-v3");
  });

  const first = await replayEnemyPhase(page, baseline);
  const second = await replayEnemyPhase(page, baseline);

  expect(second).toEqual(first);
  expect(first.summaries).toHaveLength(1);
  expect(first.decisionIndex).toBe(1);
});

test("difficulty is frozen per battle and unknown save fields survive", async ({
  page
}) => {
  await page.goto("/?testMode=1");
  await page
    .locator("[data-battle-difficulty]")
    .selectOption("ai_difficulty_hard");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.__TIANWAI_GAME__.store.getBattleDifficulty()
      )
    )
    .toBe("ai_difficulty_hard");

  await page.evaluate(() => {
    const envelope = JSON.parse(
      localStorage.getItem("tianwai-daojuren-save-v3")
    );
    envelope.futureWrapper = { sentinel: "preserve-me" };
    localStorage.setItem(
      "tianwai-daojuren-save-v3",
      JSON.stringify(envelope)
    );
  });
  await page.reload();
  await page.evaluate(() => {
    window.__TIANWAI_GAME__.store.startBattle("B-D17-01");
    window.__TIANWAI_GAME__.store.setBattleDifficulty(
      "ai_difficulty_beginner"
    );
    window.__TIANWAI_GAME__.store.save();
  });

  const persisted = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("tianwai-daojuren-save-v3"))
  );
  expect(persisted.futureWrapper).toEqual({
    sentinel: "preserve-me"
  });
  expect(persisted.state.mvp.battle.difficultyId).toBe(
    "ai_difficulty_hard"
  );
  expect(persisted.state.mvp.settings.battleDifficultyId).toBe(
    "ai_difficulty_beginner"
  );
});

test("mobile landscape keeps HUD, board, and actions separate", async ({
  page
}) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/?testMode=1&battleId=B-D17-01");
  await expect(page.getByTestId("scene-name")).toHaveText(
    "战斗 B-D17-01"
  );

  const layout = await page.evaluate(() => {
    const stage = document.querySelector(".game-stage");
    const hud = document.querySelector(".hud");
    const panel = document.querySelector("[data-battle-panel]");
    const touch = document.querySelector(".touch-controls");
    const stageBox = stage.getBoundingClientRect();
    const hudBox = hud.getBoundingClientRect();
    const panelBox = panel.getBoundingClientRect();
    const boardTop = stageBox.top + (104 / 720) * stageBox.height;
    const boardBottom =
      stageBox.top + ((104 + 6 * 72) / 720) * stageBox.height;
    return {
      hudBottom: hudBox.bottom,
      boardTop,
      boardBottom,
      panelTop: panelBox.top,
      panelBottom: panelBox.bottom,
      stageBottom: stageBox.bottom,
      viewportHeight: window.innerHeight,
      touchDisplay: getComputedStyle(touch).display
    };
  });

  expect(layout.hudBottom).toBeLessThanOrEqual(layout.boardTop + 1);
  expect(layout.boardBottom).toBeLessThanOrEqual(layout.panelTop);
  expect(layout.panelBottom).toBeLessThanOrEqual(
    layout.stageBottom
  );
  expect(layout.stageBottom).toBeLessThanOrEqual(
    layout.viewportHeight
  );
  expect(layout.touchDisplay).toBe("none");
});

async function replayEnemyPhase(page, serializedEnvelope) {
  await page.evaluate(
    ({ key, value }) => localStorage.setItem(key, value),
    { key: SAVE_KEY, value: serializedEnvelope }
  );
  await page.reload();
  await expect(page.getByTestId("scene-name")).toHaveText(
    "战斗 B-Q02-01"
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.__TIANWAI_GAME__.game.scene.getScene("battle")
            .lastEnemySummaries.length
      )
    )
    .toBe(1);
  return page.evaluate(() => {
    const scene =
      window.__TIANWAI_GAME__.game.scene.getScene("battle");
    const battle =
      window.__TIANWAI_GAME__.store.getActiveBattle();
    return {
      summaries: scene.lastEnemySummaries,
      playerHp: battle.player.hp,
      enemyPosition: battle.enemies[0].position,
      aiCursor: battle.aiCursor,
      decisionIndex: battle.decisionIndex
    };
  });
}
