import { expect, test, type Locator, type Page } from "@playwright/test";

async function point(canvas: Locator, x: number, y: number): Promise<{ x: number; y: number }> {
  const box = await canvas.boundingBox();
  if (box === null) throw new Error("R2 canvas has no bounding box");
  return { x: box.x + x, y: box.y + y };
}

async function clickCanvas(page: Page, canvas: Locator, x: number, y: number, alt = false): Promise<void> {
  const p = await point(canvas, x, y);
  if (alt) await page.keyboard.down("Alt");
  try {
    await page.mouse.click(p.x, p.y);
  } finally {
    if (alt) await page.keyboard.up("Alt");
  }
}

async function dragCanvas(page: Page, canvas: Locator, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> {
  const start = await point(canvas, from.x, from.y);
  const end = await point(canvas, to.x, to.y);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down({ button: "left" });
  await page.mouse.move(end.x, end.y, { steps: 12 });
  await page.mouse.up({ button: "left" });
}

async function generation(studio: Locator): Promise<number> {
  return Number(await studio.getAttribute("data-source-generation"));
}

test("R2-D orphan meaning remains spatially reachable after exact Matter delete", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/?studio=1");

  const studio = page.locator(".r2-studio");
  const canvas = page.locator("canvas[data-r2-world]");
  const context = page.locator("[data-r2-context]");

  await page.getByRole("button", { name: "New" }).click();
  await page.getByRole("button", { name: "Seed" }).click();
  await expect(studio).toHaveAttribute("data-cells", "1");

  // Visible x- face of the focused seed. A simple click authors one adjacent cell.
  await clickCanvas(page, canvas, 554, 419);
  await expect(studio).toHaveAttribute("data-cells", "2");
  await page.keyboard.press("f");

  // For the two-cell focused world the shared interface is the camera target.
  const seam = { x: 600, y: 400 };
  await page.keyboard.press("b");
  await clickCanvas(page, canvas, seam.x, seam.y);
  await page.keyboard.press("t");
  await clickCanvas(page, canvas, seam.x, seam.y);
  await expect(studio).toHaveAttribute("data-bearings", "1");
  await expect(studio).toHaveAttribute("data-torques", "1");
  await expect(studio).toHaveAttribute("data-quality", "COMPLETE");

  // Exact-delete the left Matter cell via its exposed x- face. Meanings must survive.
  await clickCanvas(page, canvas, 503, 439, true);
  await expect(studio).toHaveAttribute("data-cells", "1");
  await expect(studio).toHaveAttribute("data-bearings", "1");
  await expect(studio).toHaveAttribute("data-torques", "1");
  await expect(studio).toHaveAttribute("data-run-disabled", "false");

  const generationBeforeRecover = await studio.getAttribute("data-source-generation");

  // The original seam is now the surviving cell's exposed face. The authored orphan
  // must own a spatial ghost there; clicking it must select meaning, not grow Matter.
  await clickCanvas(page, canvas, seam.x, seam.y);
  await expect(context).toBeVisible();
  await expect(context.locator('[data-bearing="bearing:1"]')).toBeVisible();
  await expect(context.locator('[data-torque="torque:1"]')).toBeVisible();
  await expect(studio).toHaveAttribute("data-cells", "1");
  await expect(studio).toHaveAttribute("data-source-generation", generationBeforeRecover ?? "");

  await context.locator('[data-bearing="bearing:1"] [data-rebind-bearing="bearing:1"]').click();
  await expect(studio).toHaveAttribute("data-intent", "rebind-bearing");
});

test("R2-D Escape cancels an authored extrusion before pointer release", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/?studio=1");

  const studio = page.locator(".r2-studio");
  const canvas = page.locator("canvas[data-r2-world]");
  await page.getByRole("button", { name: "New" }).click();
  await page.getByRole("button", { name: "Seed" }).click();
  await expect(studio).toHaveAttribute("data-cells", "1");
  const generationBefore = await studio.getAttribute("data-source-generation");

  const start = await point(canvas, 554, 419);
  const far = await point(canvas, 80, 610);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down({ button: "left" });
  await page.mouse.move(far.x, far.y, { steps: 10 });
  await page.keyboard.press("Escape");
  await page.mouse.up({ button: "left" });

  await expect(studio).toHaveAttribute("data-cells", "1");
  await expect(studio).toHaveAttribute("data-source-generation", generationBefore ?? "");
  await expect(studio).toHaveAttribute("data-intent", "neutral");
});

test("R2-D Escape releases Runtime Hand instead of leaving an invisible force", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/?studio=1");

  const studio = page.locator(".r2-studio");
  const canvas = page.locator("canvas[data-r2-world]");
  await page.getByRole("button", { name: "New" }).click();
  await page.getByRole("button", { name: "Seed" }).click();
  await page.getByRole("button", { name: "RUN", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "running");

  const grab = await point(canvas, 554, 419);
  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down({ button: "left" });
  await expect(studio).toHaveAttribute("data-hand", "active");
  await page.mouse.move(grab.x - 55, grab.y + 35, { steps: 6 });

  // Escape is an owner cancellation signal. It must end the physical spring now,
  // not merely forget the pointer while Runtime Hand remains active underneath.
  await page.keyboard.press("Escape");
  await expect(studio).toHaveAttribute("data-hand", "ready");
  await page.mouse.up({ button: "left" });

  // The next grab must work normally, proving cancellation did not strand pointer/Hand state.
  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down({ button: "left" });
  await expect(studio).toHaveAttribute("data-hand", "active");
  await page.mouse.up({ button: "left" });
  await expect(studio).toHaveAttribute("data-hand", "ready");
});

test("R2-D Matter grammar branches across X Y and Z without entering a build mode", async ({ page }) => {
  test.setTimeout(45_000);
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/?studio=1");

  const studio = page.locator(".r2-studio");
  const canvas = page.locator("canvas[data-r2-world]");
  await page.getByRole("button", { name: "New" }).click();
  await page.getByRole("button", { name: "Seed" }).click();
  await expect(studio).toHaveAttribute("data-cells", "1");
  await expect(studio).toHaveAttribute("data-intent", "neutral");

  // X- arm: one gesture grows six cells and advances source generation exactly once.
  const beforeX = await generation(studio);
  await dragCanvas(page, canvas, { x: 554, y: 419 }, { x: 20, y: 635 });
  await expect(studio).toHaveAttribute("data-cells", "7");
  expect(await generation(studio)).toBe(beforeX + 1);
  await expect(studio).toHaveAttribute("data-intent", "neutral");
  await page.keyboard.press("f");

  // Y+ branch from the far end. Projection is frozen against the explicit focused camera.
  const beforeY = await generation(studio);
  await dragCanvas(page, canvas, { x: 497, y: 421 }, { x: 491, y: 339 });
  await expect(studio).toHaveAttribute("data-cells", "10");
  expect(await generation(studio)).toBe(beforeY + 1);
  await expect(studio).toHaveAttribute("data-intent", "neutral");

  // The face used for Y extrusion is now a real shared Y interface. Meaning must author there
  // without entering a persistent Meaning mode.
  await page.keyboard.press("b");
  await clickCanvas(page, canvas, 497, 421);
  await expect(studio).toHaveAttribute("data-intent", "neutral");
  await page.keyboard.press("t");
  await clickCanvas(page, canvas, 497, 421);
  await expect(studio).toHaveAttribute("data-intent", "neutral");
  await expect(studio).toHaveAttribute("data-bearings", "1");
  await expect(studio).toHaveAttribute("data-torques", "1");
  await expect(studio).toHaveAttribute("data-quality", "COMPLETE");

  // Z+ branch from the top of the Y branch, still through the same neutral Matter grammar.
  const beforeZ = await generation(studio);
  await dragCanvas(page, canvas, { x: 503, y: 321 }, { x: 563, y: 350 });
  await expect(studio).toHaveAttribute("data-cells", "13");
  expect(await generation(studio)).toBe(beforeZ + 1);
  await expect(studio).toHaveAttribute("data-intent", "neutral");

  // The branched world is not merely authorable: its non-X local meaning enters the same RUN.
  const beforeRun = await studio.getAttribute("data-source-generation");
  await page.getByRole("button", { name: "RUN", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "running");
  await expect(studio).toHaveAttribute("data-run-disabled", "false");
  await page.waitForTimeout(100);
  await page.getByRole("button", { name: "STOP", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "build");
  await expect(studio).toHaveAttribute("data-source-generation", beforeRun ?? "");
});

test("R2-D conflicting meanings remain jointly reachable and no silent winner is chosen", async ({ page }) => {
  test.setTimeout(45_000);
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/?studio=1");

  const studio = page.locator(".r2-studio");
  const canvas = page.locator("canvas[data-r2-world]");
  const context = page.locator("[data-r2-context]");

  await page.getByRole("button", { name: "New" }).click();
  await page.getByRole("button", { name: "Seed" }).click();
  await clickCanvas(page, canvas, 554, 419);
  await expect(studio).toHaveAttribute("data-cells", "2");
  await page.keyboard.press("f");
  await clickCanvas(page, canvas, 503, 439);
  await expect(studio).toHaveAttribute("data-cells", "3");
  await page.keyboard.press("f");

  // Frozen projections for the focused 3-cell line.
  const conflictSeam = { x: 567, y: 413 };
  const independentSeam = { x: 631, y: 387 };

  // Two authored Bearings deliberately occupy the same seam. Both identities must survive.
  await page.keyboard.press("b");
  await clickCanvas(page, canvas, conflictSeam.x, conflictSeam.y);
  await page.keyboard.press("b");
  await clickCanvas(page, canvas, conflictSeam.x, conflictSeam.y);
  await expect(studio).toHaveAttribute("data-bearings", "2");

  // A separate Bearing+Torque remains realizable, proving conflict is local rather than global.
  await page.keyboard.press("b");
  await clickCanvas(page, canvas, independentSeam.x, independentSeam.y);
  await page.keyboard.press("t");
  await clickCanvas(page, canvas, independentSeam.x, independentSeam.y);
  await expect(studio).toHaveAttribute("data-bearings", "3");
  await expect(studio).toHaveAttribute("data-torques", "1");
  await expect(studio).toHaveAttribute("data-quality", "PARTIAL");
  await expect(studio).toHaveAttribute("data-realized-bearings", "1");
  await expect(studio).toHaveAttribute("data-run-disabled", "false");

  const generationBeforeRun = await studio.getAttribute("data-source-generation");
  await page.getByRole("button", { name: "RUN", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "running");
  await page.waitForTimeout(80);
  await page.getByRole("button", { name: "STOP", exact: true }).click();
  await expect(studio).toHaveAttribute("data-source-generation", generationBeforeRun ?? "");

  // The conflict is still a place in the world, not a collapsed winner or an issue-list entry.
  await clickCanvas(page, canvas, conflictSeam.x, conflictSeam.y);
  await expect(context).toBeVisible();
  await expect(context.locator('[data-bearing="bearing:1"]')).toBeVisible();
  await expect(context.locator('[data-bearing="bearing:2"]')).toBeVisible();
  await expect(context.locator('[data-bearing="bearing:1"] .r2-conflict')).toBeVisible();
  await expect(context.locator('[data-bearing="bearing:2"] .r2-conflict')).toBeVisible();
  await expect(context.locator('[data-bearing="bearing:3"]')).toHaveCount(0);

  // Resolving one side is an explicit local Owner action. It is not required before the first RUN.
  await context.locator('[data-bearing="bearing:1"] [data-delete-bearing="bearing:1"]').click();
  await expect(studio).toHaveAttribute("data-bearings", "2");
  await expect(studio).toHaveAttribute("data-quality", "COMPLETE");
  await expect(studio).toHaveAttribute("data-realized-bearings", "2");

  await page.getByRole("button", { name: "RUN", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "running");
  await page.getByRole("button", { name: "STOP", exact: true }).click();
});
