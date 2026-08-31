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

test("R2-D6C preserved standalone Torque stays reachable on its surviving exposed cell@face", async ({ page }) => {
  test.setTimeout(45_000);
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/?studio=1");

  const studio = page.locator(".r2-studio");
  const canvas = page.locator("canvas[data-r2-world]");
  const context = page.locator("[data-r2-context]");
  const loose = page.locator("[data-r2-loose]");

  // Build the smallest legal authored seam through the real world grammar.
  await page.getByRole("button", { name: "New" }).click();
  await page.getByRole("button", { name: "Seed" }).click();
  await clickCanvas(page, canvas, 554, 419);
  await expect(studio).toHaveAttribute("data-cells", "2");
  await page.keyboard.press("f");

  const seam = { x: 600, y: 400 };
  await page.keyboard.press("b");
  await clickCanvas(page, canvas, seam.x, seam.y);
  await page.keyboard.press("t");
  await clickCanvas(page, canvas, seam.x, seam.y);
  await expect(studio).toHaveAttribute("data-bearings", "1");
  await expect(studio).toHaveAttribute("data-torques", "1");
  await expect(studio).toHaveAttribute("data-quality", "COMPLETE");

  // Exact-delete only the Bearing. R1 requires the Torque to remain authored on its
  // own persistent cell@face target and become unresolved rather than being cascaded away.
  await clickCanvas(page, canvas, seam.x, seam.y);
  await expect(context).toBeVisible();
  await context.locator('[data-bearing="bearing:1"] [data-delete-bearing="bearing:1"]').click();
  await expect(studio).toHaveAttribute("data-bearings", "0");
  await expect(studio).toHaveAttribute("data-torques", "1");
  await expect(studio).toHaveAttribute("data-quality", "MATTER_ONLY");
  await expect(studio).toHaveAttribute("data-realized-torques", "0");
  await expect(studio).toHaveAttribute("data-run-disabled", "false");
  await expect(studio).toHaveAttribute("data-loose", "0");
  await expect(loose).toBeHidden();

  // Delete the opposite Matter cell through its exposed outer face. The Torque target is
  // the original seed's x- face, so that exact target cell survives and the target face is
  // now exposed. This is a truthful single spatial anchor, not a Loose case.
  await clickCanvas(page, canvas, 503, 439, true);
  await expect(studio).toHaveAttribute("data-cells", "1");
  await expect(studio).toHaveAttribute("data-bearings", "0");
  await expect(studio).toHaveAttribute("data-torques", "1");
  await expect(studio).toHaveAttribute("data-quality", "MATTER_ONLY");
  await expect(studio).toHaveAttribute("data-realized-torques", "0");
  await expect(studio).toHaveAttribute("data-run-disabled", "false");
  await expect(studio).toHaveAttribute("data-loose", "0");
  await expect(loose).toBeHidden();

  // Unresolved meaning is evidence, not a RUN permission gate. Runtime must not rewrite source.
  const generationBeforeRun = await studio.getAttribute("data-source-generation");
  await page.getByRole("button", { name: "RUN", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "running");
  await page.waitForTimeout(80);
  await page.getByRole("button", { name: "STOP", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "build");
  await expect(studio).toHaveAttribute("data-source-generation", generationBeforeRun ?? "");
  await expect(studio).toHaveAttribute("data-torques", "1");

  // The surviving authored target is the visible x- face of the focused single cell.
  // Direct pointer-down there must select Torque rather than start a Matter extrusion.
  await page.keyboard.press("f");
  const target = await point(canvas, 554, 419);
  const generationBeforeReach = await studio.getAttribute("data-source-generation");
  await page.mouse.move(target.x, target.y);
  await page.mouse.down({ button: "left" });
  await expect(context).toBeVisible();
  await expect(context.locator('[data-bearing="bearing:1"]')).toHaveCount(0);
  await expect(context.locator('[data-torque="torque:1"]')).toBeVisible();
  await expect(context.locator('[data-retarget-torque="torque:1"]')).toBeVisible();
  await expect(context.locator('[data-delete-torque="torque:1"]')).toBeVisible();
  await expect(studio).toHaveAttribute("data-source-generation", generationBeforeReach ?? "");
  await page.mouse.up({ button: "left" });
  await expect(studio).toHaveAttribute("data-cells", "1");

  // The same authored identity must expose its existing Retarget path without automatic repair.
  await context.locator('[data-retarget-torque="torque:1"]').click();
  await expect(studio).toHaveAttribute("data-intent", "retarget-torque");
  await expect(studio).toHaveAttribute("data-torques", "1");
  await page.keyboard.press("Escape");
  await expect(studio).toHaveAttribute("data-intent", "neutral");
  await expect(studio).toHaveAttribute("data-torques", "1");

  // Re-select the same single-anchor meaning and exact-delete only that Torque.
  await page.mouse.move(target.x, target.y);
  await page.mouse.down({ button: "left" });
  await expect(context.locator('[data-torque="torque:1"]')).toBeVisible();
  await page.mouse.up({ button: "left" });
  await context.locator('[data-delete-torque="torque:1"]').click();
  await expect(studio).toHaveAttribute("data-torques", "0");
  await expect(studio).toHaveAttribute("data-cells", "1");
  await expect(studio).toHaveAttribute("data-loose", "0");
});
