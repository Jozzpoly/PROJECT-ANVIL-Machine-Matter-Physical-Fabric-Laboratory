import { mkdir } from "node:fs/promises";
import { expect, test, type Locator, type Page } from "@playwright/test";

const EVIDENCE_DIR = "test-results/r2-e1-evidence";

async function point(canvas: Locator, x: number, y: number): Promise<{ x: number; y: number }> {
  const box = await canvas.boundingBox();
  if (box === null) throw new Error("R2 canvas has no bounding box");
  return { x: box.x + x, y: box.y + y };
}

async function clickCanvas(page: Page, canvas: Locator, x: number, y: number): Promise<void> {
  const p = await point(canvas, x, y);
  await page.mouse.click(p.x, p.y);
}

async function oneShotMeaning(page: Page, canvas: Locator, key: "b" | "t", x: number, y: number): Promise<void> {
  await page.keyboard.press(key);
  await clickCanvas(page, canvas, x, y);
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
  await expect(page.locator(".r2-studio")).toHaveAttribute("data-cells", "7");
  await page.keyboard.press("f");
}

async function findSemanticPixelOutsideCentralHit(
  page: Page,
  canvas: Locator,
  center: { x: number; y: number },
  kind: "cyan" | "orange",
): Promise<{ x: number; y: number; distance: number }> {
  const result = await page.evaluate(({ cx, cy, kind }) => {
    const element = document.querySelector<HTMLCanvasElement>("canvas[data-r2-world]");
    if (element === null) throw new Error("R2 canvas missing");
    const context = element.getContext("2d", { willReadFrequently: true });
    if (context === null) throw new Error("R2 2D context missing");
    const rect = element.getBoundingClientRect();
    const scaleX = element.width / rect.width;
    const scaleY = element.height / rect.height;
    const candidates: Array<{ x: number; y: number; distance: number; score: number }> = [];
    for (let dy = -28; dy <= 28; dy += 1) {
      for (let dx = -28; dx <= 28; dx += 1) {
        const distance = Math.hypot(dx, dy);
        // The current central interface hit envelope for a represented meaning is radius 8 + 5px tolerance.
        // P1 deliberately samples only pixels visibly outside that central envelope.
        if (distance < 14 || distance > 27) continue;
        const px = Math.max(0, Math.min(element.width - 1, Math.floor((cx + dx) * scaleX)));
        const py = Math.max(0, Math.min(element.height - 1, Math.floor((cy + dy) * scaleY)));
        const data = context.getImageData(px, py, 1, 1).data;
        const r = data[0] ?? 0;
        const g = data[1] ?? 0;
        const b = data[2] ?? 0;
        const a = data[3] ?? 0;
        const matches = kind === "cyan"
          ? a > 180 && g > 155 && b > 145 && g > r * 1.25
          : a > 180 && r > 175 && g > 90 && g < 205 && b < 150 && r > g * 1.15;
        if (!matches) continue;
        const score = kind === "cyan" ? g + b - r : r + g - b;
        candidates.push({ x: cx + dx, y: cy + dy, distance, score });
      }
    }
    candidates.sort((a, b) => b.distance - a.distance || b.score - a.score);
    return candidates[0] ?? null;
  }, { cx: center.x, cy: center.y, kind });
  if (result === null) throw new Error(`No ${kind} semantic pixel found outside the central hit envelope`);
  // Keep Locator in the signature intentionally: this helper is about the rendered canvas currently under test.
  await expect(canvas).toBeVisible();
  return result;
}

test("P1-C first-touch does not prime the research conclusion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const receipt = page.locator("[data-r2-receipt]");
  await expect(receipt).toBeVisible();
  await expect.soft(receipt).not.toContainText("Owner Authority");
  await page.getByRole("button", { name: "Starter" }).click();
  await expect.soft(receipt).not.toContainText("hidden meaning");
  // Operational cues are product affordances, not research conclusions, and deliberately remain in the instrument.
  await expect(page.locator("canvas[data-r2-world]")).toBeVisible();
});

test("P1-A a visible Bearing semantic pixel remains locally interactive", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  const studio = page.locator(".r2-studio");
  const canvas = page.locator("canvas[data-r2-world]");
  const context = page.locator("[data-r2-context]");
  await buildSevenCellArm(page, canvas);

  const seam = { x: 671, y: 371 };
  await oneShotMeaning(page, canvas, "b", seam.x, seam.y);
  await expect(studio).toHaveAttribute("data-bearings", "1");
  const cellsBefore = await studio.getAttribute("data-cells");

  const visibleAxisPixel = await findSemanticPixelOutsideCentralHit(page, canvas, seam, "cyan");
  await clickCanvas(page, canvas, visibleAxisPixel.x, visibleAxisPixel.y);

  await expect.soft(studio).toHaveAttribute("data-cells", cellsBefore ?? "7");
  await expect.soft(context).toBeVisible();
  await expect.soft(context).toContainText("Bearing bearing:1");
});

test("P1-B representative dense state remains renderable and operable", async ({ page }) => {
  test.setTimeout(60_000);
  await mkdir(EVIDENCE_DIR, { recursive: true });
  await page.setViewportSize({ width: 1200, height: 800 });
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.goto("/");
  const studio = page.locator(".r2-studio");
  const canvas = page.locator("canvas[data-r2-world]");
  const context = page.locator("[data-r2-context]");
  await buildSevenCellArm(page, canvas);

  const seam1 = { x: 671, y: 371 };
  const seam2 = { x: 644, y: 382 };
  const seam3 = { x: 615, y: 394 };
  for (const seam of [seam1, seam2, seam3]) await oneShotMeaning(page, canvas, "b", seam.x, seam.y);
  for (const seam of [seam1, seam2, seam3]) await oneShotMeaning(page, canvas, "t", seam.x, seam.y);
  await expect(studio).toHaveAttribute("data-bearings", "3");
  await expect(studio).toHaveAttribute("data-torques", "3");
  await expect(studio).toHaveAttribute("data-quality", "COMPLETE");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.keyboard.press("f");
  await page.screenshot({ path: `${EVIDENCE_DIR}/p1-dense-complete-1440x900.png`, fullPage: true });

  await page.setViewportSize({ width: 1200, height: 800 });
  await page.keyboard.press("f");
  await clickCanvas(page, canvas, seam1.x, seam1.y);
  await expect(context).toBeVisible();
  await context.locator('[data-bearing="bearing:1"] [data-delete-bearing="bearing:1"]').click();
  await expect(studio).toHaveAttribute("data-quality", "PARTIAL");

  // Deliberately add a second Bearing on an already occupied seam, preserving the conflict as authored evidence.
  await oneShotMeaning(page, canvas, "b", seam2.x, seam2.y);
  await expect(studio).toHaveAttribute("data-bearings", "3");
  await expect(studio).toHaveAttribute("data-quality", "PARTIAL");
  await clickCanvas(page, canvas, seam2.x, seam2.y);
  await expect(context).toBeVisible();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.keyboard.press("f");
  await page.screenshot({ path: `${EVIDENCE_DIR}/p1-dense-partial-context-1440x900.png`, fullPage: true });

  await page.getByRole("button", { name: "RUN", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "running");
  await page.waitForTimeout(180);
  await page.screenshot({ path: `${EVIDENCE_DIR}/p1-dense-runtime-1440x900.png`, fullPage: true });

  await page.setViewportSize({ width: 1024, height: 640 });
  await page.keyboard.press("f");
  await page.waitForTimeout(80);
  await page.screenshot({ path: `${EVIDENCE_DIR}/p1-dense-runtime-1024x640.png`, fullPage: true });
  await expect(page.getByRole("button", { name: "STOP", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "STOP", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "build");

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});