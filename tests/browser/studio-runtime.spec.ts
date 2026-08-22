import { expect, test } from "@playwright/test";

function numericAttribute(value: string | null): number {
  if (value === null) throw new Error("expected numeric attribute");
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`invalid numeric attribute ${value}`);
  return parsed;
}

test("Studio realization preserves runtime lifetime and Three hot-loop ownership", async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/?studio=1");

  const studio = page.locator("[data-anvil-studio='substrate']");
  const canvas = page.locator("canvas[data-studio-world='true']");
  await page.getByRole("button", { name: "Editable Starter" }).click();
  await expect(studio).toHaveAttribute("data-run-readiness", "READY");
  await expect(studio).toHaveAttribute("data-work-state", "BUILD");
  const sourceGeneration = await studio.getAttribute("data-source-generation");

  await page.getByRole("button", { name: "RUN" }).click();
  await expect(studio).toHaveAttribute("data-work-state", "RUNNING");
  await expect(studio).toHaveAttribute("data-runtime-activation", "OFF");
  await expect(studio).not.toHaveAttribute("data-runtime-session", "");
  const firstSession = await studio.getAttribute("data-runtime-session");
  expect(firstSession).not.toBeNull();

  await expect.poll(async () => numericAttribute(await canvas.getAttribute("data-runtime-frames"))).toBeGreaterThan(2);
  await page.waitForTimeout(80);
  const framesBeforeHotLoop = numericAttribute(await canvas.getAttribute("data-runtime-frames"));
  const rendersBeforeHotLoop = numericAttribute(await studio.getAttribute("data-react-renders"));
  await page.waitForTimeout(220);
  const framesAfterHotLoop = numericAttribute(await canvas.getAttribute("data-runtime-frames"));
  const rendersAfterHotLoop = numericAttribute(await studio.getAttribute("data-react-renders"));
  expect(framesAfterHotLoop).toBeGreaterThan(framesBeforeHotLoop);
  expect(rendersAfterHotLoop).toBe(rendersBeforeHotLoop);

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(studio).toHaveAttribute("data-work-state", "PAUSED");
  await page.waitForTimeout(80);
  const pausedFrames = numericAttribute(await canvas.getAttribute("data-runtime-frames"));
  await page.waitForTimeout(180);
  expect(numericAttribute(await canvas.getAttribute("data-runtime-frames"))).toBe(pausedFrames);

  await page.getByRole("button", { name: "Step" }).click();
  expect(numericAttribute(await canvas.getAttribute("data-runtime-frames"))).toBe(pausedFrames + 1);
  expect(await studio.getAttribute("data-runtime-session")).toBe(firstSession);

  await page.getByRole("button", { name: "Activate" }).click();
  await expect(studio).toHaveAttribute("data-runtime-activation", "ON");
  const framesWhilePausedAndActivated = numericAttribute(await canvas.getAttribute("data-runtime-frames"));
  await page.waitForTimeout(120);
  expect(numericAttribute(await canvas.getAttribute("data-runtime-frames"))).toBe(framesWhilePausedAndActivated);

  await page.getByRole("button", { name: "Matter" }).click();
  await expect(studio).toHaveAttribute("data-work-state", "PAUSED");
  await expect(page.getByText(/REQUIRES BUILD/u)).toBeVisible();

  await page.getByRole("button", { name: "Resume" }).click();
  await expect(studio).toHaveAttribute("data-work-state", "RUNNING");
  await expect.poll(async () => numericAttribute(await canvas.getAttribute("data-runtime-frames"))).toBeGreaterThan(framesWhilePausedAndActivated);

  await page.getByRole("button", { name: "Restart" }).click();
  await expect(studio).toHaveAttribute("data-work-state", "RUNNING");
  await expect(studio).toHaveAttribute("data-runtime-activation", "OFF");
  await expect.poll(async () => await studio.getAttribute("data-runtime-session")).not.toBe(firstSession);
  const secondSession = await studio.getAttribute("data-runtime-session");
  expect(secondSession).not.toBeNull();
  expect(secondSession).not.toBe(firstSession);
  expect(await studio.getAttribute("data-source-generation")).toBe(sourceGeneration);

  await page.getByRole("button", { name: "Stop" }).click();
  await expect(studio).toHaveAttribute("data-work-state", "BUILD");
  await expect(studio).toHaveAttribute("data-runtime-activation", "NONE");
  await expect(studio).toHaveAttribute("data-runtime-session", "");
  await expect(canvas).not.toHaveAttribute("data-runtime-frames", /.+/u);
  expect(await studio.getAttribute("data-source-generation")).toBe(sourceGeneration);

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
