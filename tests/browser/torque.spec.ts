import { expect, test } from "@playwright/test";

function finiteMetric(value: string | null, label: string): number {
  const parsed = Number(value);
  expect(Number.isFinite(parsed), `${label} must be finite`).toBe(true);
  return parsed;
}

test("ANVIL-05 production Chromium independently verifies signed authored torque", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?experiment=torque");

  await expect(page.locator("html")).toHaveAttribute("data-torque-evidence", "PASS", { timeout: 15_000 });
  await expect(page.locator("#torque-status")).toHaveAttribute("data-state", "PASS");
  await expect(page.locator("#torque-status")).toHaveText("PASS");
  await expect(page.locator("#torque-error")).toHaveCount(0);

  const expectedGates = [
    "source-count",
    "body-count",
    "source-identity",
    "positive-angle",
    "negative-angle",
    "control-angle",
    "positive-speed",
    "negative-speed",
    "control-speed",
    "positive-gap",
    "negative-gap",
    "positive-momentum",
    "negative-momentum",
    "positive-barycenter",
    "negative-barycenter",
    "finite-state",
  ];
  await expect(page.locator("#torque-gates li")).toHaveCount(expectedGates.length);
  for (const id of expectedGates) {
    await expect(page.locator(`[data-gate="${id}"]`)).toHaveAttribute("data-pass", "true");
  }

  const metric = async (key: string): Promise<number> => finiteMetric(
    await page.locator(`[data-metric="${key}"]`).getAttribute("data-raw"),
    key,
  );

  const positiveAngleRad = await metric("positive-angle-rad");
  const controlAngleRad = await metric("control-angle-rad");
  const negativeAngleRad = await metric("negative-angle-rad");
  const positiveSpeedRadps = await metric("positive-speed-radps");
  const controlSpeedRadps = await metric("control-speed-radps");
  const negativeSpeedRadps = await metric("negative-speed-radps");
  const positiveGapM = await metric("positive-gap-m");
  const negativeGapM = await metric("negative-gap-m");
  const positiveMomentumKgMps = await metric("positive-momentum-kgmps");
  const negativeMomentumKgMps = await metric("negative-momentum-kgmps");
  const positiveBarycenterM = await metric("positive-barycenter-m");
  const negativeBarycenterM = await metric("negative-barycenter-m");

  console.log(JSON.stringify({
    probe: "ANVIL-05/TORQUE-D0",
    positiveAngleRad,
    controlAngleRad,
    negativeAngleRad,
    positiveSpeedRadps,
    controlSpeedRadps,
    negativeSpeedRadps,
    positiveGapM,
    negativeGapM,
    positiveMomentumKgMps,
    negativeMomentumKgMps,
    positiveBarycenterM,
    negativeBarycenterM,
  }));

  // Independent browser-side reapplication of the frozen C0 thresholds.
  expect(positiveAngleRad).toBeGreaterThanOrEqual(0.35);
  expect(negativeAngleRad).toBeLessThanOrEqual(-0.35);
  expect(Math.abs(controlAngleRad)).toBeLessThanOrEqual(0.01);
  expect(positiveSpeedRadps).toBeGreaterThanOrEqual(0.35);
  expect(negativeSpeedRadps).toBeLessThanOrEqual(-0.35);
  expect(Math.abs(controlSpeedRadps)).toBeLessThanOrEqual(0.01);
  expect(positiveGapM).toBeLessThanOrEqual(0.0025);
  expect(negativeGapM).toBeLessThanOrEqual(0.0025);
  expect(positiveMomentumKgMps).toBeLessThanOrEqual(0.05);
  expect(negativeMomentumKgMps).toBeLessThanOrEqual(0.05);
  expect(positiveBarycenterM).toBeLessThanOrEqual(0.0005);
  expect(negativeBarycenterM).toBeLessThanOrEqual(0.0005);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(pageErrors).toEqual([]);
});
