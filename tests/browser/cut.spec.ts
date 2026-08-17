import { expect, test } from "@playwright/test";

test("CUT performs the mass-preserving moving+rotating 1-to-2 transaction in the production browser", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/?experiment=cut");
  await expect(page.locator("#cut-status")).toHaveText("READY");
  await expect(page.locator("#cut-run")).toBeEnabled();

  await page.locator("#cut-run").click();
  await expect(page.locator("#cut-status")).toHaveText("CUT EVIDENCE PASS");

  await expect(page.locator("#metric-source-count")).toHaveText("51 → 51");
  await expect(page.locator("#metric-body-count")).toHaveText("1 → 2");
  await expect(page.locator("#metric-source-delta")).toHaveText("0 / 0");
  await expect(page.locator("#cut-gates li.pass")).toHaveCount(8);
  await expect(page.locator('[data-gate="identity"]')).toHaveAttribute("data-pass", "true");
  await expect(page.locator('[data-gate="topology"]')).toHaveAttribute("data-pass", "true");
  await expect(page.locator('[data-gate="rigid-field"]')).toHaveAttribute("data-pass", "true");
  await expect(page.locator('[data-gate="momentum"]')).toHaveAttribute("data-pass", "true");
  await expect(page.locator('[data-gate="post-step"]')).toHaveAttribute("data-pass", "true");

  const massError = Number(await page.locator("#metric-mass-error").getAttribute("data-value"));
  const momentumError = Number(await page.locator("#metric-momentum-error").getAttribute("data-value"));
  const positionError = Number(await page.locator("#metric-position-error").getAttribute("data-value"));
  const velocityError = Number(await page.locator("#metric-velocity-error").getAttribute("data-value"));
  const interfaceError = Number(await page.locator("#metric-interface-error").getAttribute("data-value"));

  expect(Number.isFinite(massError) && massError <= 0.1).toBe(true);
  expect(Number.isFinite(momentumError) && momentumError <= 0.75).toBe(true);
  expect(Number.isFinite(positionError) && positionError <= 7e-5).toBe(true);
  expect(Number.isFinite(velocityError) && velocityError <= 2e-5).toBe(true);
  expect(Number.isFinite(interfaceError) && interfaceError <= 5e-5).toBe(true);
  expect(pageErrors).toEqual([]);
});
