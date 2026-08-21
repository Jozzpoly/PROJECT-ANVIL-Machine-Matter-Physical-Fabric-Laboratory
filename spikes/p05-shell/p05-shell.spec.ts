import { test, expect } from "@playwright/test";

test("Three + React keeps the hot renderer loop outside React and gizmo edits presentation only", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/spikes/p05-shell/editor-shell.html");
  await expect(page).toHaveTitle(/Three\.js \+ React Boundary Proof/);
  await expect(page.locator("#editor-viewport")).toBeVisible();
  await expect(page.getByText("ready", { exact: true })).toBeVisible({ timeout: 20_000 });

  await page.waitForFunction(() => (window as any).__P05B.rendererFrames >= 45);
  const steady = await page.evaluate(() => ({ ...(window as any).__P05B }));
  expect(steady.ready).toBe(true);
  expect(steady.rendererFrames).toBeGreaterThanOrEqual(45);
  expect(steady.reactRenderCount).toBeLessThanOrEqual(3);
  expect(Math.abs(steady.runtimeSpeedRadps)).toBeGreaterThan(0.1);
  expect(steady.sourceUntouched).toBe(true);
  expect(steady.sourceSnapshot).toBeTruthy();

  const renderCountBeforeSelection = steady.reactRenderCount;
  await page.mouse.click(steady.targetScreen.x, steady.targetScreen.y);
  await expect(page.locator("#selected-cell")).toHaveText(steady.targetCellId);
  await expect(page.locator("#selected-face")).toHaveText("z+");
  const selected = await page.evaluate(() => ({ ...(window as any).__P05B }));
  expect(selected.selection?.cellId).toBe(steady.targetCellId);
  expect(selected.selection?.face).toBe("z+");
  expect(selected.reactRenderCount).toBeLessThanOrEqual(renderCountBeforeSelection + 2);

  const sourceBeforePreview = selected.sourceSnapshot;
  const rendersBeforePreview = selected.reactRenderCount;
  await page.locator("#nudge-preview").click();
  await expect(page.locator("#preview-x")).not.toHaveText("—");
  const previewed = await page.evaluate(() => ({ ...(window as any).__P05B }));
  expect(previewed.preview).toBeTruthy();
  expect(previewed.sourceUntouched).toBe(true);
  expect(previewed.sourceSnapshot).toBe(sourceBeforePreview);
  expect(previewed.reactRenderCount).toBeLessThanOrEqual(rendersBeforePreview + 2);

  const framesBeforeIdle = previewed.rendererFrames;
  const rendersBeforeIdle = previewed.reactRenderCount;
  await page.waitForFunction((frame) => (window as any).__P05B.rendererFrames >= frame + 25, framesBeforeIdle);
  const afterIdle = await page.evaluate(() => ({ ...(window as any).__P05B }));
  expect(afterIdle.rendererFrames).toBeGreaterThanOrEqual(framesBeforeIdle + 25);
  expect(afterIdle.reactRenderCount).toBe(rendersBeforeIdle);
  expect(afterIdle.sourceUntouched).toBe(true);
  expect(errors).toEqual([]);

  await page.screenshot({ path: "p05b-results/three-react-shell.png", fullPage: false });
  console.log(`P05_SHELL_METRICS ${JSON.stringify(afterIdle)}`);
});
