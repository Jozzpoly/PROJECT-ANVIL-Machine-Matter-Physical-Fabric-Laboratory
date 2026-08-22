import { expect, test } from "@playwright/test";

async function openStarter(page: import("@playwright/test").Page) {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/?studio=1");
  await page.getByRole("button", { name: "Editable Starter" }).click();
  return {
    studio: page.locator("[data-anvil-studio='substrate']"),
    canvas: page.locator("canvas[data-studio-world='true']"),
    intent: page.getByRole("navigation", { name: "Intent" }),
    simulation: page.getByRole("region", { name: "Simulation" }),
    lensDock: page.locator("[data-o1x-lens-dock='true']"),
  };
}

async function canvasPoint(
  canvas: import("@playwright/test").Locator,
  x: number,
  y: number,
): Promise<{ x: number; y: number }> {
  const box = await canvas.boundingBox();
  if (box === null) throw new Error("Studio canvas has no bounding box");
  return { x: box.x + x, y: box.y + y };
}

async function addSecondStarterBearing(
  page: import("@playwright/test").Page,
  canvas: import("@playwright/test").Locator,
  intent: import("@playwright/test").Locator,
): Promise<void> {
  await intent.getByRole("button", { name: "Meaning" }).click();
  await page.getByRole("button", { name: /Bearing/ }).click();
  const seam = await canvasPoint(canvas, 624, 447);
  await page.mouse.click(seam.x, seam.y);
  await expect(page.getByText("New Bearing draft.")).toBeVisible();
  await page.keyboard.press("Enter");
}

test("Interaction Bandwidth keeps authoring context while Runtime Hand, zoom and orbit operate directly in BREAK", async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  const { studio, canvas, intent, simulation, lensDock } = await openStarter(page);
  await page.evaluate(() => {
    const world = document.querySelector("canvas[data-studio-world='true']");
    if (world === null) throw new Error("Studio world canvas missing");
    (window as Window & { __anvilInputChannels?: string[] }).__anvilInputChannels = [];
    world.addEventListener("anvil-studio-input", (event) => {
      const detail = (event as CustomEvent<{ channel?: string }>).detail;
      if (detail?.channel !== undefined) {
        (window as Window & { __anvilInputChannels?: string[] }).__anvilInputChannels?.push(detail.channel);
      }
    });
  });

  await addSecondStarterBearing(page, canvas, intent);
  await expect(studio).toHaveAttribute("data-source-generation", "1");
  await expect(studio).toHaveAttribute("data-break-lab-eligibility", "ELIGIBLE");

  // Owner feedback: larger construction loses time to modal rail travel. A is an
  // immediate authoring shortcut and the context below must survive BREAK → Restart → Stop.
  await page.keyboard.press("a");
  await expect(studio).toHaveAttribute("data-authoring-intent", "matter");
  await expect(studio).toHaveAttribute("data-authoring-tool", "add");
  await lensDock.getByRole("button", { name: "Cells" }).click();
  await expect(canvas).toHaveAttribute("data-o1x-lens", "cells");

  await simulation.getByRole("button", { name: "BREAK RUN", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime-mode", "BREAK");
  await expect(studio).toHaveAttribute("data-work-state", "RUNNING");
  await expect(canvas).toHaveAttribute("data-runtime-hand", "ready");
  await expect(canvas).toHaveAttribute("data-o1x-lens", "surface");
  await expect(simulation.getByText(/LMB drag body/)).toBeVisible();
  await expect.poll(async () => Number(await canvas.getAttribute("data-runtime-frames"))).toBeGreaterThan(0);

  // Frozen initial camera projection for starter:b3 center (1.25, 0.25, 0.25)
  // in the 1200×800 owner viewport is approximately (690, 472). BREAK starts
  // OFF/zero-gravity, so the point is still there when the physical hand begins.
  const grab = await canvasPoint(canvas, 690, 472);
  const framesBeforeGrab = Number(await canvas.getAttribute("data-runtime-frames"));
  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down({ button: "left" });
  await expect(canvas).toHaveAttribute("data-runtime-hand", "active");
  await page.mouse.move(grab.x + 90, grab.y - 55, { steps: 10 });
  await page.waitForTimeout(160);
  await expect.poll(async () => Number(await canvas.getAttribute("data-runtime-frames"))).toBeGreaterThan(framesBeforeGrab);
  await page.mouse.up({ button: "left" });
  await expect(canvas).toHaveAttribute("data-runtime-hand", "ready");

  // Camera remains available while the physical runtime is live.
  await page.mouse.move(grab.x - 120, grab.y - 90);
  await page.mouse.wheel(0, -180);
  await page.mouse.down({ button: "middle" });
  await page.mouse.move(grab.x - 70, grab.y - 120, { steps: 5 });
  await page.mouse.up({ button: "middle" });

  const channels = await page.evaluate(() =>
    (window as Window & { __anvilInputChannels?: string[] }).__anvilInputChannels ?? [],
  );
  expect(channels).toContain("hand");
  expect(channels).toContain("zoom");
  expect(channels).toContain("orbit");

  const firstSession = await studio.getAttribute("data-runtime-session");
  if (firstSession === null || firstSession.length === 0) throw new Error("Interaction BREAK runtime has no first session id");
  await simulation.getByRole("button", { name: "Restart" }).click();
  await expect(studio).toHaveAttribute("data-runtime-mode", "BREAK");
  await expect(studio).toHaveAttribute("data-runtime-activation", "OFF");
  await expect(canvas).toHaveAttribute("data-runtime-hand", "ready");
  await expect.poll(async () => await studio.getAttribute("data-runtime-session")).not.toBe(firstSession);

  await simulation.getByRole("button", { name: "Stop" }).click();
  await expect(studio).toHaveAttribute("data-work-state", "BUILD");
  await expect(studio).toHaveAttribute("data-runtime-mode", "NONE");
  await expect(studio).toHaveAttribute("data-source-generation", "1");
  await expect(studio).toHaveAttribute("data-authoring-intent", "matter");
  await expect(studio).toHaveAttribute("data-authoring-tool", "add");
  await expect(canvas).toHaveAttribute("data-o1x-lens", "cells");

  // Physical manipulation is transient runtime evidence only.
  await expect(studio).toHaveAttribute("data-composition-support", "UNSUPPORTED");
  await expect(studio).toHaveAttribute("data-break-lab-eligibility", "ELIGIBLE");
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
