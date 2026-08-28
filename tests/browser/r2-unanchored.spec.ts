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

test("R2-D6 fully unanchored authored meaning stays directly reachable without fake world position", async ({ page }) => {
  test.setTimeout(45_000);
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/?studio=1");

  const studio = page.locator(".r2-studio");
  const canvas = page.locator("canvas[data-r2-world]");
  const context = page.locator("[data-r2-context]");

  await page.getByRole("button", { name: "Starter" }).click();
  await expect(studio).toHaveAttribute("data-cells", "3");
  await expect(studio).toHaveAttribute("data-bearings", "0");
  await expect(studio).toHaveAttribute("data-torques", "0");
  await page.keyboard.press("f");

  // Focused three-cell starter: author Bearing+Torque on the left shared seam.
  const seam = { x: 567, y: 413 };
  await page.keyboard.press("b");
  await clickCanvas(page, canvas, seam.x, seam.y);
  await page.keyboard.press("t");
  await clickCanvas(page, canvas, seam.x, seam.y);
  await expect(studio).toHaveAttribute("data-bearings", "1");
  await expect(studio).toHaveAttribute("data-torques", "1");
  await expect(studio).toHaveAttribute("data-quality", "COMPLETE");

  // Delete endpoint A exactly. Bearing+Torque survive and the remaining endpoint carries
  // the already-qualified spatial orphan ghost.
  await clickCanvas(page, canvas, 503, 439, true);
  await expect(studio).toHaveAttribute("data-cells", "2");
  await expect(studio).toHaveAttribute("data-bearings", "1");
  await expect(studio).toHaveAttribute("data-torques", "1");
  await page.keyboard.press("f");

  // Delete endpoint B through its exposed y+ face rather than through the orphan ghost.
  // The unrelated third Matter cell remains, but neither authored endpoint exists now.
  await clickCanvas(page, canvas, 552, 363, true);
  await expect(studio).toHaveAttribute("data-cells", "1");
  await expect(studio).toHaveAttribute("data-bearings", "1");
  await expect(studio).toHaveAttribute("data-torques", "1");
  await expect(studio).toHaveAttribute("data-quality", "MATTER_ONLY");
  await expect(studio).toHaveAttribute("data-realized-bearings", "0");
  await expect(studio).toHaveAttribute("data-realized-torques", "0");
  await expect(studio).toHaveAttribute("data-run-disabled", "false");

  const generationBeforeReach = await studio.getAttribute("data-source-generation");

  // Zero surviving spatial referents means no honest world position exists. R2-D6 requires
  // the authored objects to move to a small explicit Loose tray instead of disappearing or
  // being given a fabricated location. First loose marker is frozen at this canvas-space slot.
  await clickCanvas(page, canvas, 78, 96);
  await expect(context).toBeVisible();
  await expect(context.locator('[data-bearing="bearing:1"]')).toBeVisible();
  await expect(context.locator('[data-torque="torque:1"]')).toBeVisible();
  await expect(context.locator('[data-rebind-bearing="bearing:1"]')).toBeVisible();
  await expect(context.locator('[data-retarget-torque="torque:1"]')).toBeVisible();
  await expect(studio).toHaveAttribute("data-source-generation", generationBeforeReach ?? "");

  // Loose is not a repair gate. The unrelated Matter world still enters real runtime and
  // STOP returns to the exact same authored generation with the loose meanings preserved.
  await page.getByRole("button", { name: "RUN", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "running");
  await page.waitForTimeout(80);
  await page.getByRole("button", { name: "STOP", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "build");
  await expect(studio).toHaveAttribute("data-bearings", "1");
  await expect(studio).toHaveAttribute("data-torques", "1");
  await expect(studio).toHaveAttribute("data-source-generation", generationBeforeReach ?? "");
});
