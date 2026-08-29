import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

const evidenceDir = "test-results/r2-e1-evidence/wer1q";
mkdirSync(evidenceDir, { recursive: true });

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

async function moveCanvas(page: Page, canvas: Locator, x: number, y: number): Promise<void> {
  const p = await point(canvas, x, y);
  await page.mouse.move(p.x, p.y);
}

async function dragCanvas(page: Page, canvas: Locator, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> {
  const start = await point(canvas, from.x, from.y);
  const end = await point(canvas, to.x, to.y);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down({ button: "left" });
  await page.mouse.move(end.x, end.y, { steps: 14 });
  await page.mouse.up({ button: "left" });
}

async function setupTwoCellWorld(page: Page, policy: "global" | "local"): Promise<{ studio: Locator; canvas: Locator }> {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto(`/?wer1=${policy}`);
  const studio = page.locator(".r2-studio");
  const canvas = page.locator("canvas[data-r2-world]");
  await page.getByRole("button", { name: "New" }).click();
  await page.getByRole("button", { name: "Seed" }).click();
  await clickCanvas(page, canvas, 554, 419);
  await expect(studio).toHaveAttribute("data-cells", "2");
  await page.keyboard.press("f");
  await expect(studio).toHaveAttribute("data-wer1-policy", policy);
  await expect(studio).toHaveAttribute("data-wer1-candidates", "1");
  return { studio, canvas };
}

async function capture(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `${evidenceDir}/${name}.png`, fullPage: true, animations: "disabled" });
}

async function installInputProbe(page: Page): Promise<void> {
  await page.evaluate(() => {
    const shell = document.querySelector(".r2-studio");
    if (shell === null) throw new Error("R2 shell missing");
    const target = window as Window & { __wer1Channels?: string[] };
    target.__wer1Channels = [];
    shell.addEventListener("anvil-r2-input", (event) => {
      const channel = (event as CustomEvent<{ channel?: string }>).detail.channel;
      if (channel !== undefined) target.__wer1Channels?.push(channel);
    });
  });
}

async function inputChannels(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as Window & { __wer1Channels?: string[] }).__wer1Channels ?? []);
}

test("WER-1Q quiet global has no invisible empty-candidate capture in neutral world", async ({ page }) => {
  const { studio, canvas } = await setupTwoCellWorld(page, "global");
  const context = page.locator("[data-r2-context]");
  await expect(studio).toHaveAttribute("data-intent", "neutral");
  await expect(studio).toHaveAttribute("data-wer1-disclosed", "0");
  await installInputProbe(page);
  await capture(page, "global-quiet-neutral");

  // This is the exact projected seam used by the baseline interface tests. In quiet neutral it
  // must not behave as a hidden empty-interface instrument. It may fall through to visible Matter
  // or to no world hit depending on occlusion, but it must not open empty interface Context.
  await clickCanvas(page, canvas, 600, 400);
  expect(await inputChannels(page)).not.toContain("context");
  await expect(context).toBeHidden();
  await expect(studio).toHaveAttribute("data-bearings", "0");
});

test("WER-1Q global disclosure couples visible Bearing opportunities to authoring without filtering conflicts", async ({ page }) => {
  const { studio, canvas } = await setupTwoCellWorld(page, "global");
  const seam = { x: 600, y: 400 };
  await expect(studio).toHaveAttribute("data-wer1-disclosed", "0");

  await page.keyboard.press("b");
  await expect(studio).toHaveAttribute("data-intent", "bearing");
  await moveCanvas(page, canvas, 100, 100);
  await expect(studio).toHaveAttribute("data-wer1-disclosed", "1");
  await capture(page, "global-bearing-disclosure");
  await clickCanvas(page, canvas, seam.x, seam.y);
  await expect(studio).toHaveAttribute("data-bearings", "1");
  await expect(studio).toHaveAttribute("data-intent", "neutral");
  await expect(studio).toHaveAttribute("data-wer1-disclosed", "0");

  // Existing Meaning does not remove the same topological P. The Owner can deliberately author a
  // duplicate and let evidence report the conflict instead of having the candidate filtered away.
  await page.keyboard.press("b");
  await moveCanvas(page, canvas, 100, 100);
  await expect(studio).toHaveAttribute("data-wer1-disclosed", "1");
  await clickCanvas(page, canvas, seam.x, seam.y);
  await expect(studio).toHaveAttribute("data-bearings", "2");
  await expect(studio).toHaveAttribute("data-run-disabled", "false");
  await capture(page, "global-authored-conflict");

  await page.getByRole("button", { name: "RUN", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "running");
  await page.getByRole("button", { name: "STOP", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "build");
});

test("WER-1Q local wake-up masks one shared P set without secret clickability", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/?wer1=local");
  const studio = page.locator(".r2-studio");
  const canvas = page.locator("canvas[data-r2-world]");
  await page.getByRole("button", { name: "New" }).click();
  await page.getByRole("button", { name: "Seed" }).click();
  await dragCanvas(page, canvas, { x: 554, y: 419 }, { x: 20, y: 635 });
  await expect(studio).toHaveAttribute("data-cells", "7");
  await page.keyboard.press("f");
  await expect(studio).toHaveAttribute("data-wer1-policy", "local");
  await expect(studio).toHaveAttribute("data-wer1-candidates", "6");
  await expect(studio).toHaveAttribute("data-wer1-disclosed", "0");

  const seam1 = { x: 671, y: 371 };
  await page.keyboard.press("b");
  await moveCanvas(page, canvas, seam1.x, seam1.y);
  const disclosed = Number(await studio.getAttribute("data-wer1-disclosed"));
  expect(disclosed).toBeGreaterThan(0);
  expect(disclosed).toBeLessThan(6);
  await capture(page, "local-bearing-wake");
  await clickCanvas(page, canvas, seam1.x, seam1.y);
  await expect(studio).toHaveAttribute("data-bearings", "1");
  await expect(studio).toHaveAttribute("data-intent", "neutral");
  await expect(studio).toHaveAttribute("data-wer1-candidates", "6");
  await expect(studio).toHaveAttribute("data-wer1-disclosed", "0");
});

test("WER-1Q quiet policy keeps orphan Bearing as authored M but never reclassifies it as P", async ({ page }) => {
  const { studio, canvas } = await setupTwoCellWorld(page, "global");
  const context = page.locator("[data-r2-context]");
  const seam = { x: 600, y: 400 };

  await page.keyboard.press("b");
  await moveCanvas(page, canvas, 100, 100);
  await clickCanvas(page, canvas, seam.x, seam.y);
  await expect(studio).toHaveAttribute("data-bearings", "1");

  // Remove the left Matter cell exactly. The Bearing survives as authored world evidence, but there
  // is no longer an adjacent-Matter Bearing opportunity.
  await clickCanvas(page, canvas, 503, 439, true);
  await expect(studio).toHaveAttribute("data-cells", "1");
  await expect(studio).toHaveAttribute("data-bearings", "1");
  await expect(studio).toHaveAttribute("data-wer1-candidates", "0");
  await expect(studio).toHaveAttribute("data-wer1-disclosed", "0");

  await clickCanvas(page, canvas, seam.x, seam.y);
  await expect(context).toBeVisible();
  await expect(context.locator('[data-bearing="bearing:1"]')).toBeVisible();
  await capture(page, "global-orphan-bearing-meaning");

  // Under a new Bearing intent the same orphan referent is still M, not P. Generic R2InterfaceHit
  // identity must not manufacture another invalid-locality Bearing.
  await page.keyboard.press("b");
  await moveCanvas(page, canvas, seam.x, seam.y);
  await expect(studio).toHaveAttribute("data-wer1-disclosed", "0");
  await clickCanvas(page, canvas, seam.x, seam.y);
  await expect(studio).toHaveAttribute("data-bearings", "1");
  await expect(studio).toHaveAttribute("data-intent", "bearing");
  await page.keyboard.press("Escape");
  await expect(studio).toHaveAttribute("data-intent", "neutral");
});

test("WER-1Q quiet policy preserves standalone Torque locality independently of dormant P", async ({ page }) => {
  const { studio, canvas } = await setupTwoCellWorld(page, "global");
  const context = page.locator("[data-r2-context]");
  const seam = { x: 600, y: 400 };

  await page.keyboard.press("b");
  await moveCanvas(page, canvas, 100, 100);
  await clickCanvas(page, canvas, seam.x, seam.y);
  await page.keyboard.press("t");
  await clickCanvas(page, canvas, seam.x, seam.y);
  await expect(studio).toHaveAttribute("data-bearings", "1");
  await expect(studio).toHaveAttribute("data-torques", "1");

  await clickCanvas(page, canvas, seam.x, seam.y);
  await expect(context).toBeVisible();
  await context.locator('[data-bearing="bearing:1"] [data-delete-bearing="bearing:1"]').click();
  await expect(studio).toHaveAttribute("data-bearings", "0");
  await expect(studio).toHaveAttribute("data-torques", "1");

  // Delete the neighboring left Matter cell. Torque:1 targets the surviving seed endpoint, so the
  // shared P disappears while the Torque's truthful single-anchor cell@face remains.
  await clickCanvas(page, canvas, 503, 439, true);
  await expect(studio).toHaveAttribute("data-cells", "1");
  await expect(studio).toHaveAttribute("data-wer1-candidates", "0");
  await expect(studio).toHaveAttribute("data-wer1-disclosed", "0");
  await clickCanvas(page, canvas, seam.x, seam.y);
  await expect(context).toBeVisible();
  await expect(context.locator('[data-torque="torque:1"]')).toBeVisible();
  await capture(page, "global-standalone-torque-meaning");
});
