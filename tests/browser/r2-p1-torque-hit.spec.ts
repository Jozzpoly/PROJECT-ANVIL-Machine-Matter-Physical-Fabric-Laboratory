import { expect, test, type Locator, type Page } from "@playwright/test";

async function point(canvas: Locator, x: number, y: number): Promise<{ x: number; y: number }> {
  const box = await canvas.boundingBox();
  if (box === null) throw new Error("R2 canvas has no bounding box");
  return { x: box.x + x, y: box.y + y };
}

async function clickCanvas(page: Page, canvas: Locator, x: number, y: number): Promise<void> {
  const p = await point(canvas, x, y);
  await page.mouse.click(p.x, p.y);
}

async function buildSevenCellArm(page: Page, canvas: Locator): Promise<void> {
  await page.getByRole("button", { name: "New" }).click();
  await page.getByRole("button", { name: "Seed" }).click();
  const start = await point(canvas, 554, 419);
  const end = await point(canvas, 20, 635);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down({ button: "left" });
  await page.mouse.move(end.x, end.y, { steps: 14 });
  await page.mouse.up({ button: "left" });
  await page.keyboard.press("f");
}

async function findOuterOrangePixel(page: Page, center: { x: number; y: number }): Promise<{ x: number; y: number }> {
  const result = await page.evaluate(({ cx, cy }) => {
    const canvas = document.querySelector<HTMLCanvasElement>("canvas[data-r2-world]");
    if (canvas === null) throw new Error("R2 canvas missing");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (context === null) throw new Error("R2 2D context missing");
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const candidates: Array<{ x: number; y: number; distance: number; score: number }> = [];
    for (let dy = -30; dy <= 30; dy += 1) {
      for (let dx = -30; dx <= 30; dx += 1) {
        const distance = Math.hypot(dx, dy);
        if (distance < 14 || distance > 28) continue;
        const px = Math.max(0, Math.min(canvas.width - 1, Math.floor((cx + dx) * scaleX)));
        const py = Math.max(0, Math.min(canvas.height - 1, Math.floor((cy + dy) * scaleY)));
        const data = context.getImageData(px, py, 1, 1).data;
        const r = data[0] ?? 0;
        const g = data[1] ?? 0;
        const b = data[2] ?? 0;
        if (r > 175 && g > 90 && g < 210 && b < 150 && r > g * 1.12) {
          candidates.push({ x: cx + dx, y: cy + dy, distance, score: r + g - b });
        }
      }
    }
    candidates.sort((a, b) => b.distance - a.distance || b.score - a.score);
    return candidates[0] ?? null;
  }, { cx: center.x, cy: center.y });
  if (result === null) throw new Error("No outer Torque pixel found beyond the central interface hit envelope");
  return result;
}

test("P1-A outer Torque arrow remains locally interactive without authoring Matter", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  const studio = page.locator(".r2-studio");
  const canvas = page.locator("canvas[data-r2-world]");
  const context = page.locator("[data-r2-context]");
  await buildSevenCellArm(page, canvas);

  const seam = { x: 671, y: 371 };
  await page.keyboard.press("b");
  await clickCanvas(page, canvas, seam.x, seam.y);
  await page.keyboard.press("t");
  await clickCanvas(page, canvas, seam.x, seam.y);
  await expect(studio).toHaveAttribute("data-bearings", "1");
  await expect(studio).toHaveAttribute("data-torques", "1");
  const cellsBefore = await studio.getAttribute("data-cells");

  const outerTorquePixel = await findOuterOrangePixel(page, seam);
  await clickCanvas(page, canvas, outerTorquePixel.x, outerTorquePixel.y);

  await expect.soft(studio).toHaveAttribute("data-cells", cellsBefore ?? "7");
  await expect.soft(context).toBeVisible();
  await expect.soft(context).toContainText("Torque torque:1");
});
