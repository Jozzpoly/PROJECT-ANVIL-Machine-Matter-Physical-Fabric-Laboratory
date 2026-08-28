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

async function capture(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `${evidenceDir}/${name}.png`, fullPage: true, animations: "disabled" });
}

test("R2-E1 baseline rendered evidence at 1440x900", async ({ page }) => {
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
  await capture(page, "baseline-01-shared-seam-1440x900");

  await oneShot(page, canvas, viewport, "b", 600, 400);
  await oneShot(page, canvas, viewport, "t", 600, 400);
  await expect(studio).toHaveAttribute("data-quality", "COMPLETE");
  await page.mouse.move(viewport.width - 40, viewport.height - 80);
  await capture(page, "baseline-02-bearing-torque-1440x900");

  await page.getByRole("button", { name: "RUN", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "running");
  await page.waitForTimeout(120);
  await page.mouse.move(viewport.width - 40, viewport.height - 80);
  await capture(page, "baseline-03-run-1440x900");
  await page.getByRole("button", { name: "STOP", exact: true }).click();

  await oneShot(page, canvas, viewport, "b", 600, 400);
  await expect(studio).toHaveAttribute("data-quality", "PARTIAL");
  await page.mouse.move(viewport.width - 40, viewport.height - 80);
  await capture(page, "baseline-04-conflict-1440x900");

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
  await capture(page, "baseline-05-single-anchor-torque-1440x900");

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
  await capture(page, "baseline-06-loose-1440x900");
});

test("R2-E1 baseline rendered evidence at 1024x640", async ({ page }) => {
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
  await capture(page, "baseline-07-shared-seam-1024x640");

  await oneShot(page, canvas, viewport, "b", 600, 400);
  await oneShot(page, canvas, viewport, "t", 600, 400);
  await expect(studio).toHaveAttribute("data-quality", "COMPLETE");
  await page.mouse.move(viewport.width - 30, viewport.height - 75);
  await capture(page, "baseline-08-bearing-torque-1024x640");

  await page.getByRole("button", { name: "RUN", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "running");
  await page.waitForTimeout(120);
  await page.mouse.move(viewport.width - 30, viewport.height - 75);
  await capture(page, "baseline-09-run-1024x640");
});
