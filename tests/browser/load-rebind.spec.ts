import { expect, test } from "@playwright/test";

function finiteMetric(value: string | null, label: string): number {
  const parsed = Number(value);
  expect(Number.isFinite(parsed), `${label} must be finite`).toBe(true);
  return parsed;
}

test("ANVIL-04 production Chromium independently verifies moving 2.5 kN cold rebind", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?experiment=load-rebind");

  const status = page.locator("#load-rebind-status");
  await expect(page.locator("html")).toHaveAttribute("data-load-rebind-evidence", "PASS", { timeout: 15_000 });
  await expect(status).toHaveAttribute("data-state", "PASS");
  await expect(status).toHaveText("PASS");
  await expect(page.locator("#load-rebind-error")).toHaveCount(0);

  const gates = page.locator("#load-rebind-gates li");
  await expect(gates).toHaveCount(15);
  for (const id of [
    "source-count",
    "body-transition",
    "endpoint-rebound",
    "preload-force",
    "preload-gap",
    "preload-motion",
    "immediate-position",
    "immediate-velocity",
    "first-step-gap",
    "first-step-anchor-velocity",
    "first-step-force",
    "final-gap",
    "control-separation",
    "free-rotation",
    "finite-state",
  ]) {
    await expect(page.locator(`[data-gate="${id}"]`)).toHaveAttribute("data-pass", "true");
  }

  const metric = async (key: string): Promise<number> => finiteMetric(
    await page.locator(`[data-metric="${key}"]`).getAttribute("data-raw"),
    key,
  );

  const preloadForceN = await metric("preload-force-n");
  const preloadGapM = await metric("preload-gap-m");
  const preloadRelativeAngularSpeedRadps = await metric("preload-relative-angular-speed-radps");
  const maxPositionJumpM = await metric("max-position-jump-m");
  const maxVelocityJumpMps = await metric("max-velocity-jump-mps");
  const firstStepGapM = await metric("first-step-gap-m");
  const firstStepAnchorVelocityGapMps = await metric("first-step-anchor-velocity-gap-mps");
  const firstStepForceN = await metric("first-step-force-n");
  const finalGapM = await metric("final-gap-m");
  const controlGapM = await metric("control-gap-m");
  const finalRelativeAngularSpeedRadps = await metric("final-relative-angular-speed-radps");

  console.log(JSON.stringify({
    probe: "ANVIL-04/LOAD-REBIND-D0",
    preloadForceN,
    preloadGapM,
    preloadRelativeAngularSpeedRadps,
    maxPositionJumpM,
    maxVelocityJumpMps,
    firstStepGapM,
    firstStepAnchorVelocityGapMps,
    firstStepForceN,
    finalGapM,
    controlGapM,
    finalRelativeAngularSpeedRadps,
  }));

  // Re-check the important C1 thresholds outside the in-page evidence code.
  expect(preloadForceN).toBeGreaterThanOrEqual(2000);
  expect(preloadForceN).toBeLessThanOrEqual(6000);
  expect(preloadGapM).toBeLessThanOrEqual(0.0025);
  expect(preloadRelativeAngularSpeedRadps).toBeGreaterThanOrEqual(1.0);
  expect(maxPositionJumpM).toBeLessThanOrEqual(0.00007);
  expect(maxVelocityJumpMps).toBeLessThanOrEqual(0.00007);
  expect(firstStepGapM).toBeLessThanOrEqual(0.0005);
  expect(firstStepAnchorVelocityGapMps).toBeLessThanOrEqual(0.02);
  expect(firstStepForceN).toBeGreaterThanOrEqual(1500);
  expect(firstStepForceN).toBeLessThanOrEqual(7000);
  expect(finalGapM).toBeLessThanOrEqual(0.0025);
  expect(controlGapM).toBeGreaterThanOrEqual(1.0);
  expect(finalRelativeAngularSpeedRadps).toBeGreaterThanOrEqual(0.2);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(pageErrors).toEqual([]);
});
