import { expect, test } from "@playwright/test";

test("ANVIL-03 production browser keeps the bearing on the correct post-CUT child and discriminates no relation", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?experiment=rebind");

  const status = page.locator("#rebind-status");
  await expect(status).toHaveAttribute("data-state", "READY", { timeout: 10_000 });
  await expect(status).toHaveText("GOTOWE");
  await expect(page.locator("#rebind-run")).toHaveText("URUCHOM TEST");
  await expect(page.locator("#rebind-reset")).toHaveText("OD NOWA");
  await expect(page.locator(".rebind-owner-focus")).toContainText("Najpierw obie strony są takie same");
  await expect(page.locator(".rebind-owner-focus")).toContainText("Po lewej");
  await expect(page.locator(".rebind-owner-focus")).toContainText("Po prawej");
  await expect(page.locator(".rebind-technical-details")).not.toHaveAttribute("open", "");

  const layout = await page.evaluate(() => {
    const rectOf = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (element === null) return null;
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    };
    return {
      viewport: { width: innerWidth, height: innerHeight },
      viewportCard: rectOf(".rebind-viewport-card"),
      panel: rectOf(".rebind-panel"),
      compare: rectOf(".rebind-compare"),
    };
  });
  const stageSizes = await page.locator(".rebind-stage canvas").evaluateAll((canvases) => canvases.map((canvas) => {
    const rect = canvas.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }));
  console.log(JSON.stringify({ probe: "ANVIL-03/REBIND-D0-LAYOUT", layout, stageSizes }));
  expect(stageSizes).toHaveLength(2);
  for (const size of stageSizes) {
    expect(size.width).toBeGreaterThan(300);
    expect(size.height).toBeGreaterThan(400);
    expect(size.height).toBeLessThan(760);
  }

  await page.locator("#rebind-run").click();
  await expect(status).toHaveAttribute("data-state", "PASS", { timeout: 15_000 });
  await expect(status).toHaveText("TEST: OK");
  await expect(page.locator("#rebind-phase")).toHaveAttribute("data-phase", "complete");

  await page.locator(".rebind-technical-details > summary").click();
  await expect(page.locator("#metric-rebind-source")).toHaveText("7 → 7");
  await expect(page.locator("#metric-rebind-bodies")).toHaveText("2 → 3");
  await expect(page.locator("#metric-rebind-bearing")).toHaveText("1 → 1");
  await expect(page.locator("#metric-rebind-body-id")).toHaveText("body:a:0 → body:a:2");
  await expect(page.locator("#rebind-gates li.pass")).toHaveCount(11);
  for (const id of ["identity", "topology", "rebind", "position", "velocity", "momentum", "transaction", "final", "control", "rotation", "finite"]) {
    await expect(page.locator(`[data-gate="${id}"]`)).toHaveAttribute("data-pass", "true");
  }

  const positionJump = Number(await page.locator("#metric-rebind-position-jump").getAttribute("data-value"));
  const velocityJump = Number(await page.locator("#metric-rebind-velocity-jump").getAttribute("data-value"));
  const momentumError = Number(await page.locator("#metric-rebind-momentum").getAttribute("data-value"));
  const finalGap = Number(await page.locator("#metric-rebind-gap").getAttribute("data-value"));
  const controlGap = Number(await page.locator("#metric-rebind-control").getAttribute("data-value"));
  const angle = Number(await page.locator("#metric-rebind-angle").getAttribute("data-value"));
  console.log(JSON.stringify({
    probe: "ANVIL-03/REBIND-D0",
    positionJumpM: positionJump,
    velocityJumpMps: velocityJump,
    momentumErrorKgMps: momentumError,
    finalGapM: finalGap,
    noRelationControlGapM: controlGap,
    finalBearingAngleRad: angle,
  }));

  expect(Number.isFinite(positionJump) && positionJump <= 0.00007).toBe(true);
  expect(Number.isFinite(velocityJump) && velocityJump <= 0.00007).toBe(true);
  expect(Number.isFinite(momentumError) && momentumError <= 0.75).toBe(true);
  expect(Number.isFinite(finalGap) && finalGap <= 0.0025).toBe(true);
  expect(Number.isFinite(controlGap) && controlGap >= 0.25).toBe(true);
  expect(Number.isFinite(angle) && Math.abs(angle) >= 0.35).toBe(true);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(pageErrors).toEqual([]);

  await page.locator("#rebind-reset").click();
  await expect(status).toHaveAttribute("data-state", "READY", { timeout: 10_000 });
  await expect(status).toHaveText("GOTOWE");
});
