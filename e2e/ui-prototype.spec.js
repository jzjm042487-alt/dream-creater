import { expect, test } from "@playwright/test";

const panelIds = Array.from(
  { length: 18 },
  (_, index) => `UI${String(index).padStart(2, "0")}`
);

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

test("rerolls the whole character card and previews adult portrait states", async ({
  page,
}) => {
  await page.locator('[data-panel-id="UI01"]').first().click();
  const firstSeed = await page.locator(".seed-readout").textContent();
  await page.getByRole("button", { name: "整卡重 Roll" }).click();
  await expect(page.locator(".seed-readout")).not.toHaveText(firstSeed);

  await page.locator('[data-panel-id="UI09"]').first().click();
  await page.locator('[data-relation-id="he-niang"]').click();
  await page
    .locator(
      '[data-action="set-npc-portrait-state"][data-state-id="outerwear_missing"]'
    )
    .click();
  await expect(page.locator(".portrait-frame img")).toHaveAttribute(
    "src",
    /outerwear_missing\.png$/
  );
});

test("shows the player running preview when travel starts", async ({ page }) => {
  await page.locator('[data-panel-id="UI06"]').first().click();
  await page.locator('[data-location-id="tavern"]').click();
  await page.getByRole("button", { name: "前往此处" }).click();

  await expect(page.getByTestId("map-player")).toHaveClass(/is-running/);
  await expect(page.getByText("run_side · 12 FPS")).toBeVisible();
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
