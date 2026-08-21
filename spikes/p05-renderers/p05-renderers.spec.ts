import { test, expect } from "@playwright/test";

for (const candidate of ["three", "babylon"] as const) {
  test(`${candidate}: 10k cells, exact face picking, overlays and real ANVIL runtime`, async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
      if (message.type() === "warning") warnings.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(`/spikes/p05-renderers/${candidate}.html`);
    await expect(page).toHaveTitle(new RegExp(candidate === "three" ? "Three" : "Babylon"));
    await expect(page.locator("canvas#viewport")).toBeVisible();
    await expect(page.locator("#status")).toHaveText("ready", { timeout: 25_000 });

    const before = await page.evaluate(() => (window as any).__P05);
    expect(before.ready).toBe(true);
    expect(before.instanceCount).toBe(10_000);
    expect(before.presentationSerializable).toBe(true);
    expect(before.overlayKinds).toEqual(["bearing-pivot", "bearing-axis", "torque-face"]);
    expect(before.runtime.bodyCount).toBe(2);
    expect(Math.abs(before.runtime.offSpeedRadps)).toBeLessThan(1e-5);
    expect(Math.abs(before.runtime.onSpeedRadps)).toBeGreaterThan(0.1);
    expect(before.benchmarkPick?.cellId).toBe(before.targetCellId);
    expect(before.benchmarkPick?.face).toBe("z+");
    expect(before.pick20Ms).toBeLessThan(2_000);
    expect(before.update10kMs).toBeLessThan(1_000);
    expect(Number.isFinite(before.frameMedianMs)).toBe(true);

    await page.mouse.click(before.targetScreen.x, before.targetScreen.y);
    await expect(page.locator("#selection")).toContainText(before.targetCellId);
    const after = await page.evaluate(() => (window as any).__P05);
    expect(after.lastPick?.cellId).toBe(before.targetCellId);
    expect(after.lastPick?.face).toBe("z+");
    expect(errors).toEqual([]);

    await page.screenshot({ path: `p05-results/${candidate}.png`, fullPage: false });
    console.log(`P05_RENDERER_METRICS ${candidate} ${JSON.stringify({ ...after, warnings })}`);
  });
}
