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
