import { expect, test } from "@playwright/test";

test("COLLAPSE produces live evidence in a real browser", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/?experiment=collapse");
  await expect(page.locator("#status")).toHaveText("LIVE EVIDENCE");
  await expect(page.locator("#metrics dd").nth(0)).toHaveText("51");
  await expect(page.locator("#metrics dd").nth(1)).toHaveText("1");
  await expect(page.locator("#gates li.pass")).toHaveCount(4);

  await page.locator("#cut").click();
  await expect(page.locator("#status")).toHaveText("LIVE EVIDENCE");
  await expect(page.locator("#metrics dd").nth(0)).toHaveText("50");
  await expect(page.locator("#metrics dd").nth(1)).toHaveText("2");
  await expect(page.locator("#gates li.pass")).toHaveCount(4);

  expect(pageErrors).toEqual([]);
});
