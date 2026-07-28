import { expect, test } from "@playwright/test";

const panelIds = [
  "UI00",
  "UI01",
  "UI02",
  "UI03",
  "UI04",
  "UI05",
  "UI06",
  "UI07",
  "UI08",
  "UI09",
  "UI10",
  "UI11",
  "UI12",
  "UI13",
  "UI15",
  "UI17",
];

test.beforeEach(async ({ page }) => {
  await page.goto("/ui.html");
  await expect(page.getByTestId("ui-prototype")).toBeVisible();
});

test("navigates through every production UI panel", async ({ page }) => {
  for (const panelId of panelIds) {
    await page.locator(`[data-panel-id="${panelId}"]`).first().click();
    await expect(page.getByTestId(`panel-${panelId}`)).toBeVisible();
    await expect(page.locator(`[data-active-panel="${panelId}"]`)).toBeVisible();
  }
});

test("queries a future character opportunity from the source cheat", async ({
  page,
}) => {
  await page.locator('[data-action="set-query-horizon"][data-horizon-id="three-years"]').click();
  await page.getByRole("searchbox", { name: "查询原文" }).fill("白凝冰");

  await expect(page.locator("[data-source-results] .source-result")).toHaveCount(1);
  await expect(page.locator("[data-source-detail] h2")).toHaveText(
    "白凝冰的十绝体终局"
  );
  await expect(page.locator("[data-source-count]")).toHaveText("1");
});

test("rerolls the whole character card and shows the relationship graph", async ({
  page,
}) => {
  await page.locator('[data-panel-id="UI01"]').first().click();
  const firstSeed = await page.locator(".seed-readout").textContent();
  await page.getByRole("button", { name: "整卡重 Roll" }).click();
  await expect(page.locator(".seed-readout")).not.toHaveText(firstSeed);

  await page.locator('[data-panel-id="UI09"]').first().click();
  await expect(page.getByRole("tab", { name: "血脉关系" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "亲朋关系" })).toBeVisible();
  await expect(page.locator(".relationship-graph")).toBeVisible();
});

test("travels by choosing a relative direction instead of clicking a map", async ({
  page,
}) => {
  await page.locator('[data-panel-id="UI06"]').first().click();
  const initialNode = await page.locator("[data-travel-node]").getAttribute("data-travel-node");
  await page.getByRole("button", { name: "向前" }).click();

  await expect(page.locator("[data-travel-node]")).not.toHaveAttribute(
    "data-travel-node",
    initialNode
  );
  await expect(page.locator(".travel-direction-grid")).toBeVisible();
  await expect(page.locator("[data-location-id]")).toHaveCount(0);
});

test("uses simple portrait dialogue choices without exposed formulas", async ({
  page,
}) => {
  await page.locator('[data-panel-id="UI11"]').first().click();

  await expect(page.locator(".classic-dialogue-box")).toBeVisible();
  await expect(page.locator(".classic-choice-list button")).toHaveCount(3);
  await expect(page.getByText(/vs|风险|AP|前置条件/)).toHaveCount(0);
});

test("opens a one-roll theft picker from the scene", async ({ page }) => {
  await page.locator('[data-panel-id="UI06"]').first().click();
  const nearbyActions = page.locator(".travel-encounter-actions");

  await expect(nearbyActions).toBeVisible();
  await expect(nearbyActions.getByText("古月方源")).toBeVisible();
  await nearbyActions.getByRole("button", { name: "偷盗" }).click();

  await expect(page.getByRole("dialog", { name: "偷盗 古月方源" })).toBeVisible();
  await expect(page.getByText(/成功率 \d+%/)).toBeVisible();
  await page.locator('[data-action="attempt-theft"]').first().click();
  await expect(page.locator("[data-theft-result]")).toBeVisible();
});

test("moves freely inside the village and reveals nearby actions", async ({
  page,
}) => {
  await page.locator('[data-panel-id="UI12"]').first().click();
  const townScene = page.locator(".town-free-move-scene");
  const initialY = await townScene.getAttribute("data-town-y");

  await expect(townScene).toBeVisible();
  await expect(page.locator("[data-town-action]")).toContainText("待机");
  await expect(page.locator("[data-town-emotion]")).toContainText("警觉");
  await page.getByRole("button", { name: "向上移动" }).click();
  await expect(page.locator(".town-player-run-sheet")).toBeVisible();
  await expect(page.locator("[data-town-action]")).toContainText("奔跑");
  await expect(page.locator(".town-player-marker")).toHaveClass(/is-moving/);
  await expect(townScene).not.toHaveAttribute("data-town-y", initialY);
  await expect(page.locator("[data-town-action]")).toContainText("待机");
  await expect(page.locator(".town-nearby-actions")).toContainText("古月方源");
  await expect(
    page.locator('.town-nearby-actions [data-action="open-theft"]')
  ).toBeVisible();
});

test("keeps the running character footprint aligned with idle", async ({
  page,
}) => {
  await page.locator('[data-panel-id="UI12"]').first().click();

  const sizes = await page.locator(".town-player-marker").evaluate((marker) => {
    const idle = marker.querySelector(".town-player-idle-frame");
    const run = marker.querySelector(".town-player-run-sheet");
    const idleRect = idle.getBoundingClientRect();
    const runRect = run.getBoundingClientRect();

    return {
      idle: { width: idleRect.width, height: idleRect.height },
      run: { width: runRect.width, height: runRect.height },
    };
  });

  expect(sizes.run.width).toBeLessThanOrEqual(sizes.idle.width * 1.15);
  expect(sizes.run.height).toBeLessThanOrEqual(sizes.idle.height);
});

test("keeps the player node stable until a town step lands", async ({
  page,
}) => {
  await page.locator('[data-panel-id="UI12"]').first().click();
  const townScene = page.locator(".town-free-move-scene");
  const player = page.locator(".town-player-marker");
  const initialX = await townScene.getAttribute("data-town-x");

  await player.evaluate((element) => {
    element.dataset.movementProbe = "stable";
  });
  await page.keyboard.down("ArrowRight");

  await expect(player).toHaveAttribute("data-movement-probe", "stable");
  await expect(player).toHaveClass(/is-moving/);
  await expect(townScene).toHaveAttribute("data-town-x", initialX);

  await page.keyboard.up("ArrowRight");
  await expect(townScene).not.toHaveAttribute("data-town-x", initialX);
});

test("commits the last valid town position when held movement hits a wall", async ({
  page,
}) => {
  await page.locator('[data-panel-id="UI12"]').first().click();
  const townScene = page.locator(".town-free-move-scene");

  await page.keyboard.down("ArrowRight");
  await expect(townScene).toHaveAttribute("data-town-x", "60", {
    timeout: 3000,
  });
  await page.keyboard.up("ArrowRight");

  await expect(page.locator(".town-player-marker")).not.toHaveClass(
    /is-moving/
  );
});

test("does not render a movement ghost layer in front of the player", async ({
  page,
}) => {
  await page.locator('[data-panel-id="UI12"]').first().click();
  await expect(page.locator(".town-player-dust")).toHaveCount(0);
  await expect(page.locator(".town-player-sprite")).toHaveCSS("filter", "none");
});

test("renders an interactive 8 by 6 grid battle", async ({ page }) => {
  await page.locator('[data-panel-id="UI13"]').first().click();

  await expect(page.locator(".battle-cell")).toHaveCount(48);
  await expect(page.locator(".battle-piece.player-piece")).toBeVisible();
  await expect(page.locator(".battle-piece.enemy-piece")).toBeVisible();
  await expect(page.locator(".battle-cell.is-reachable").first()).toBeVisible();

  await page.locator('.battle-cell[data-x="4"][data-y="4"]').click();
  await expect(
    page.locator('.battle-cell[data-x="4"][data-y="4"] .player-piece')
  ).toBeVisible();
  await expect(page.locator(".battle-cell.is-reachable")).toHaveCount(0);

  await page.locator('[data-action="battle-defend"]').click();
  await expect(page.locator(".battle-cell.is-reachable").first()).toBeVisible();
  await page.locator('.battle-cell[data-x="4"][data-y="2"]').click();
  await page
    .locator(
      '[data-action="battle-select-action"][data-battle-action-id="ATTACK"]'
    )
    .click();
  await page.locator(".battle-cell:has(.enemy-piece)").click();
  await expect(page.locator(".enemy-summary > b")).toHaveText("34/42");
});

test("keeps mobile navigation usable without page-level horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  await page.getByRole("button", { name: "打开界面目录" }).click();
  await expect(page.locator(".ui-shell")).toHaveClass(/navigation-open/);
  await page.locator('[data-panel-id="UI17"]').first().click();
  await expect(page.getByTestId("panel-UI17")).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
