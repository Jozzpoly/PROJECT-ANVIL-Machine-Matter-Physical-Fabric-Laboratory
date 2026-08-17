import { expect, test } from "@playwright/test";

test("ANVIL-02 production browser derives a bearing and discriminates it from no relation", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?experiment=bearing");

  await expect(page.locator("#bearing-status")).toHaveText("READY");
  await expect(page.locator("#bearing-run")).toBeEnabled();
  await expect(page.locator(".bearing-stage")).toHaveCount(2);

  const layout = await page.evaluate(() => {
    const rectOf = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (element === null) return null;
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    };
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      layout: rectOf(".layout"),
      viewportCard: rectOf(".bearing-viewport-card"),
      compare: rectOf(".bearing-compare"),
    };
  });
  const stageSizes = await page.locator(".bearing-stage canvas").evaluateAll((canvases) => canvases.map((canvas) => {
    const rect = canvas.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }));
  console.log(JSON.stringify({ probe: "ANVIL-02/BEARING-D0-LAYOUT", layout, stageSizes }));

  expect(stageSizes).toHaveLength(2);
  for (const size of stageSizes) {
    expect(size.width).toBeGreaterThanOrEqual(300);
    expect(size.height).toBeGreaterThan(400);
  }

  await page.locator("#bearing-run").click();
  await expect(page.locator("#bearing-status")).toHaveText("BEARING EVIDENCE PASS", { timeout: 15_000 });

  await expect(page.locator("#metric-source-count")).toHaveText("7 → 7");
  await expect(page.locator("#metric-body-count")).toHaveText("1 → 2");
  await expect(page.locator("#metric-relation-count")).toHaveText("0 → 1");
  await expect(page.locator("#bearing-gates li.pass")).toHaveCount(8);
  for (const id of ["identity", "topology", "relation", "anchor", "control", "free-dof", "mass", "post-step"]) {
    await expect(page.locator(`[data-gate="${id}"]`)).toHaveAttribute("data-pass", "true");
  }

  const anchorGap = Number(await page.locator("#metric-anchor-gap").getAttribute("data-value"));
  const controlGap = Number(await page.locator("#metric-control-gap").getAttribute("data-value"));
  const relativeAngle = Number(await page.locator("#metric-relative-angle").getAttribute("data-value"));
  const massError = Number(await page.locator("#metric-mass-error").getAttribute("data-value"));
  const localComError = Number(await page.locator("#metric-local-com-error").getAttribute("data-value"));
  console.log(JSON.stringify({
    probe: "ANVIL-02/BEARING-D0",
    anchorGapM: anchorGap,
    noRelationControlGapM: controlGap,
    relativeAngleRad: relativeAngle,
    maxMassErrorKg: massError,
    maxLocalComErrorM: localComError,
  }));

  expect(Number.isFinite(anchorGap) && anchorGap <= 0.0025).toBe(true);
  expect(Number.isFinite(controlGap) && controlGap >= 0.25).toBe(true);
  expect(Number.isFinite(relativeAngle) && Math.abs(relativeAngle) >= 0.35).toBe(true);
  expect(Number.isFinite(massError) && massError <= 0.1).toBe(true);
  expect(Number.isFinite(localComError) && localComError <= 7e-5).toBe(true);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(pageErrors).toEqual([]);
});
