import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

const evidenceDir = "test-results/r2-e1-evidence";
mkdirSync(evidenceDir, { recursive: true });

async function baselinePoint(
  canvas: Locator,
  baseX: number,
  baseY: number,
  viewport: { width: number; height: number },
): Promise<{ x: number; y: number }> {
  const box = await canvas.boundingBox();
  if (box === null) throw new Error("R2 canvas has no bounding box");
  const scale = viewport.height / 800;
  return {
    x: box.x + viewport.width / 2 + (baseX - 600) * scale,
    y: box.y + viewport.height / 2 + (baseY - 400) * scale,
  };
}

async function clickBaseline(
  page: Page,
  canvas: Locator,
  viewport: { width: number; height: number },
  baseX: number,
  baseY: number,
  alt = false,
): Promise<void> {
  const point = await baselinePoint(canvas, baseX, baseY, viewport);
  if (alt) await page.keyboard.down("Alt");
  try {
    await page.mouse.click(point.x, point.y);
  } finally {
    if (alt) await page.keyboard.up("Alt");
  }
}

async function oneShot(
  page: Page,
  canvas: Locator,
  viewport: { width: number; height: number },
  key: "b" | "t",
  baseX: number,
  baseY: number,
): Promise<void> {
  await page.keyboard.press(key);
  await clickBaseline(page, canvas, viewport, baseX, baseY);
  await expect(page.locator(".r2-studio")).toHaveAttribute("data-intent", "neutral");
}

async function capture(page: Page, name: string): Promise<Buffer> {
  return page.screenshot({ path: `${evidenceDir}/${name}.png`, fullPage: true, animations: "disabled" });
}

async function semanticCrop(page: Page, viewport: { width: number; height: number }): Promise<Buffer> {
  const size = Math.max(72, Math.round(88 * viewport.height / 800));
  return page.screenshot({
    animations: "disabled",
    clip: {
      x: Math.round(viewport.width / 2 - size / 2),
      y: Math.round(viewport.height / 2 - size / 2),
      width: size,
      height: size,
    },
  });
}

async function runtimeSemanticPixels(page: Page): Promise<{ cyan: number; orange: number }> {
  return page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("canvas[data-r2-world]");
    if (canvas === null) throw new Error("R2 world canvas missing");
    const context = canvas.getContext("2d");
    if (context === null) throw new Error("R2 world context missing");
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let cyan = 0;
    let orange = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      const a = data[i + 3] ?? 0;
      if (a > 80 && g > 145 && b > 125 && r < 150 && g > r + 35) cyan += 1;
      if (a > 80 && r > 175 && g > 85 && g < 210 && b < 150 && r > g + 25) orange += 1;
    }
    return { cyan, orange };
  });
}

test("R2-E1 semantic presentation remains spatially legible at 1440x900", async ({ page }) => {
  const viewport = { width: 1440, height: 900 };
  await page.setViewportSize(viewport);
  await page.goto("/?studio=1");
  const studio = page.locator(".r2-studio");
  const canvas = page.locator("canvas[data-r2-world]");
  const context = page.locator("[data-r2-context]");
  const loose = page.locator("[data-r2-loose]");

  await page.getByRole("button", { name: "New" }).click();
  await page.getByRole("button", { name: "Seed" }).click();
  await clickBaseline(page, canvas, viewport, 554, 419);
  await page.keyboard.press("f");
  await expect(studio).toHaveAttribute("data-cells", "2");
  await page.mouse.move(viewport.width - 40, viewport.height - 80);
  await capture(page, "after-01-shared-seam-1440x900");

  await oneShot(page, canvas, viewport, "b", 600, 400);
  await oneShot(page, canvas, viewport, "t", 600, 400);
  await expect(studio).toHaveAttribute("data-quality", "COMPLETE");
  await expect(context).toBeVisible();
  await page.mouse.move(viewport.width - 40, viewport.height - 80);
  const positiveZ = await semanticCrop(page, viewport);
  await capture(page, "after-02-bearing-torque-positive-z-1440x900");

  const axisSelect = context.locator('[data-bearing-axis="bearing:1"]');
  await axisSelect.selectOption("y");
  await expect(studio).toHaveAttribute("data-quality", "COMPLETE");
  const positiveY = await semanticCrop(page, viewport);
  expect(Buffer.compare(positiveZ, positiveY)).not.toBe(0);
  await capture(page, "after-03-bearing-axis-y-1440x900");

  const effort = context.locator('[data-torque-effort="torque:1"]');
  await effort.fill("-20");
  await context.locator('[data-apply-torque="torque:1"]').click();
  await expect(studio).toHaveAttribute("data-quality", "COMPLETE");
  const negativeY = await semanticCrop(page, viewport);
  expect(Buffer.compare(positiveY, negativeY)).not.toBe(0);
  await capture(page, "after-04-negative-torque-1440x900");

  await page.getByRole("button", { name: "RUN", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "running");
  await page.waitForTimeout(120);
  const runtimePixels = await runtimeSemanticPixels(page);
  expect(runtimePixels.cyan).toBeGreaterThan(20);
  expect(runtimePixels.orange).toBeGreaterThan(10);
  await page.mouse.move(viewport.width - 40, viewport.height - 80);
  await capture(page, "after-05-run-manifestation-1440x900");
  await page.getByRole("button", { name: "STOP", exact: true }).click();

  await oneShot(page, canvas, viewport, "b", 600, 400);
  await expect(studio).toHaveAttribute("data-quality", "MATTER_ONLY");
  await page.mouse.move(viewport.width - 40, viewport.height - 80);
  await capture(page, "after-06-conflict-1440x900");

  await page.getByRole("button", { name: "New" }).click();
  await page.getByRole("button", { name: "Seed" }).click();
  await clickBaseline(page, canvas, viewport, 554, 419);
  await page.keyboard.press("f");
  await oneShot(page, canvas, viewport, "b", 600, 400);
  await oneShot(page, canvas, viewport, "t", 600, 400);
  await clickBaseline(page, canvas, viewport, 600, 400);
  await expect(context).toBeVisible();
  await context.locator('[data-bearing="bearing:1"] [data-delete-bearing="bearing:1"]').click();
  await clickBaseline(page, canvas, viewport, 503, 439, true);
  await page.keyboard.press("f");
  await expect(studio).toHaveAttribute("data-torques", "1");
  await expect(studio).toHaveAttribute("data-loose", "0");
  await page.mouse.move(viewport.width - 40, viewport.height - 80);
  await capture(page, "after-07-single-anchor-torque-1440x900");

  await page.getByRole("button", { name: "Starter" }).click();
  await page.keyboard.press("f");
  await oneShot(page, canvas, viewport, "b", 567, 413);
  await oneShot(page, canvas, viewport, "t", 567, 413);
  await clickBaseline(page, canvas, viewport, 503, 439, true);
  await page.keyboard.press("f");
  await clickBaseline(page, canvas, viewport, 552, 363, true);
  await expect(studio).toHaveAttribute("data-loose", "1");
  await expect(loose).toBeVisible();
  await page.mouse.move(viewport.width - 40, viewport.height - 80);
  await capture(page, "after-08-loose-1440x900");
});

test("R2-E1 semantic presentation remains usable at 1024x640", async ({ page }) => {
  const viewport = { width: 1024, height: 640 };
  await page.setViewportSize(viewport);
  await page.goto("/?studio=1");
  const studio = page.locator(".r2-studio");
  const canvas = page.locator("canvas[data-r2-world]");

  await page.getByRole("button", { name: "New" }).click();
  await page.getByRole("button", { name: "Seed" }).click();
  await clickBaseline(page, canvas, viewport, 554, 419);
  await page.keyboard.press("f");
  await expect(studio).toHaveAttribute("data-cells", "2");
  await page.mouse.move(viewport.width - 30, viewport.height - 75);
  await capture(page, "after-09-shared-seam-1024x640");

  await oneShot(page, canvas, viewport, "b", 600, 400);
  await oneShot(page, canvas, viewport, "t", 600, 400);
  await expect(studio).toHaveAttribute("data-quality", "COMPLETE");
  await page.mouse.move(viewport.width - 30, viewport.height - 75);
  await capture(page, "after-10-bearing-torque-1024x640");

  await page.getByRole("button", { name: "RUN", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "running");
  await page.waitForTimeout(120);
  const runtimePixels = await runtimeSemanticPixels(page);
  expect(runtimePixels.cyan).toBeGreaterThan(15);
  expect(runtimePixels.orange).toBeGreaterThan(8);
  await page.mouse.move(viewport.width - 30, viewport.height - 75);
  await capture(page, "after-11-run-manifestation-1024x640");
});
