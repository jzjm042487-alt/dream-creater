import { expect, test } from "@playwright/test";

test("loads the walkable world and moves the player", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("蛊真人：天外盗客");
  await expect(page.getByTestId("scene-name")).toHaveText("青茅山");
  await expect(page.getByTestId("clock")).toContainText("第一日");
  await expect(page.locator("canvas")).toBeVisible();

  const initialX = Number(
    await page.getByTestId("game-root").getAttribute("data-player-x")
  );
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(350);
  await page.keyboard.up("ArrowRight");

  await expect
    .poll(async () =>
      Number(await page.getByTestId("game-root").getAttribute("data-player-x"))
    )
    .toBeGreaterThan(initialX);
});

test("debug clock action advances the current period", async ({ page }) => {
  await page.goto("/?testMode=1");

  await page.getByRole("button", { name: "推进一刻" }).click();

  await expect(page.getByTestId("clock")).toContainText("第一日 · 辰初");
});

test("route A is playable from the world map through refining", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto("/");

  await interactAt(page, 910, 125);
  await expect(page.getByTestId("scene-name")).toHaveText("古月山寨");

  await interactAt(page, 285, 365);
  await expect(page.getByTestId("scene-name")).toHaveText("醉仙楼");

  await interactAt(page, 475, 315);
  await page.getByRole("button", { name: "坐下饮茶，暗中观察" }).click();

  await interactAt(page, 650, 245);
  await page
    .getByRole("button", { name: "施展盗术取走关键一页" })
    .click();

  await interactAt(page, 1030, 245);
  await page.getByRole("button", { name: "逐一辨认异香" }).click();

  await interactAt(page, 1080, 345);
  await page.getByRole("button", { name: "潜入后房盗取酒虫" }).click();
  await expect(page.getByTestId("quest-state")).toContainText("先去住处藏匿");

  await interactAt(page, 640, 670);
  await expect(page.getByTestId("scene-name")).toHaveText("古月山寨");
  await interactAt(page, 970, 490);
  await expect(page.getByTestId("scene-name")).toHaveText("弟子住处");

  await interactAt(page, 950, 430);
  await page.getByRole("button", { name: "藏匿酒虫" }).click();
  await expect(page.getByTestId("quest-state")).toContainText("可以开始炼化");

  await interactAt(page, 540, 455);
  await page
    .getByRole("button", { name: "消耗八成真元炼化酒虫" })
    .click();
  await expect(page.getByTestId("quest-state")).toContainText("已经炼化");
  await expect(page.getByTestId("clock")).toContainText("申正");
});

test("forest encounter opens the tactical battle and accepts a turn", async ({
  page,
}) => {
  await page.goto("/");

  await interactAt(page, 635, 510);
  await page.getByRole("button", { name: "踏入林地迎战" }).click();

  await expect(page.getByTestId("scene-name")).toHaveText(
    "战斗 B-D17-01"
  );
  await expect(
    page.getByRole("button", { name: "防御", exact: true })
  ).toBeVisible();
  await expect(page.locator("[data-battle-status]")).toContainText(
    "敌1 40/40"
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
    .toBe(1);
  await expect(page.locator("[data-battle-status]")).toContainText(
    "第2回合"
  );
});

async function interactAt(page, x, y) {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const scene =
            window.__TIANWAI_GAME__?.game?.scene?.getScene("explore");
          return Boolean(scene?.player?.active && scene.interactables?.length);
        }),
      { timeout: 15_000 }
    )
    .toBe(true);

  const interactableName = await page.evaluate(
    ({ x: targetX, y: targetY }) => {
      const scene = window.__TIANWAI_GAME__.game.scene.getScene("explore");
      scene.player.setPosition(targetX, targetY);
      scene.currentInteractable = scene.findNearestInteractable();
      return scene.currentInteractable?.definition?.name ?? "";
    },
    { x, y }
  );
  expect(interactableName).not.toBe("");
  await page.evaluate(() => {
    const scene = window.__TIANWAI_GAME__.game.scene.getScene("explore");
    scene.interact();
  });
}
