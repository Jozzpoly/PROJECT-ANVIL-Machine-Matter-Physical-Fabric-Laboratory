import { expect, test, type Locator, type Page } from "@playwright/test";

async function point(canvas: Locator, x: number, y: number): Promise<{ x: number; y: number }> {
  const box = await canvas.boundingBox();
  if (box === null) throw new Error("R2 canvas has no bounding box");
  return { x: box.x + x, y: box.y + y };
}

async function clickCanvas(page: Page, canvas: Locator, x: number, y: number, options?: { alt?: boolean }): Promise<void> {
  const p = await point(canvas, x, y);
  if (options?.alt === true) await page.keyboard.down("Alt");
  try {
    await page.mouse.click(p.x, p.y);
  } finally {
    if (options?.alt === true) await page.keyboard.up("Alt");
  }
}

async function oneShotMeaning(page: Page, canvas: Locator, key: "b" | "t", x: number, y: number): Promise<void> {
  await page.keyboard.press(key);
  const expected = key === "b" ? "bearing" : "torque";
  await expect(page.locator(".r2-studio")).toHaveAttribute("data-intent", expected);
  await clickCanvas(page, canvas, x, y);
  await expect(page.locator(".r2-studio")).toHaveAttribute("data-intent", "neutral");
}

test("R2 synthetic Owner session builds, breaks, partially runs, repairs and keeps authority in the world", async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1200, height: 800 });
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });

  await page.goto("/?studio=1");
  const studio = page.locator(".r2-studio");
  const canvas = page.locator("canvas[data-r2-world]");
  const context = page.locator("[data-r2-context]");

  await expect(studio).toHaveAttribute("data-runtime", "build");
  await expect(studio).toHaveAttribute("data-run-disabled", "false");
  await expect(studio).toHaveAttribute("data-bearings", "0");
  await expect(studio).toHaveAttribute("data-torques", "0");

  await page.evaluate(() => {
    const shell = document.querySelector(".r2-studio");
    if (shell === null) throw new Error("R2 shell missing");
    (window as Window & { __r2Channels?: string[] }).__r2Channels = [];
    shell.addEventListener("anvil-r2-input", (event) => {
      const channel = (event as CustomEvent<{ channel?: string }>).detail.channel;
      if (channel !== undefined) (window as Window & { __r2Channels?: string[] }).__r2Channels?.push(channel);
    });
  });

  // Empty → seed: no hidden authored meaning appears.
  await page.getByRole("button", { name: "New" }).click();
  await expect(studio).toHaveAttribute("data-cells", "0");
  await page.getByRole("button", { name: "Seed" }).click();
  await expect(studio).toHaveAttribute("data-cells", "1");
  await expect(studio).toHaveAttribute("data-bearings", "0");
  await expect(studio).toHaveAttribute("data-torques", "0");

  // One real drag grows a useful arm in one authored transaction. The point is the
  // actually visible x- face of the seed, not the projected centre of a hidden backface.
  const extrusionStart = await point(canvas, 554, 419);
  const extrusionEnd = await point(canvas, 20, 635);
  await page.mouse.move(extrusionStart.x, extrusionStart.y);
  await page.mouse.down({ button: "left" });
  await page.mouse.move(extrusionEnd.x, extrusionEnd.y, { steps: 14 });
  await page.mouse.up({ button: "left" });
  await expect(studio).toHaveAttribute("data-cells", "7");

  // Focus the now-long arm once. All following frozen points refer to this explicit
  // camera state, which keeps the whole authored arm visible.
  await page.keyboard.press("f");

  // Shared interfaces after focus: x=0, -0.5, -1.0 respectively.
  const seam1 = { x: 671, y: 371 };
  const seam2 = { x: 644, y: 382 };
  const seam3 = { x: 615, y: 394 };
  const farFace = { x: 480, y: 449 }; // exposed x- face at x=-3

  // Three one-shot Bearings and three one-shot Torques. No persistent mode hierarchy.
  await oneShotMeaning(page, canvas, "b", seam1.x, seam1.y);
  await oneShotMeaning(page, canvas, "b", seam2.x, seam2.y);
  await oneShotMeaning(page, canvas, "b", seam3.x, seam3.y);
  await oneShotMeaning(page, canvas, "t", seam1.x, seam1.y);
  await oneShotMeaning(page, canvas, "t", seam2.x, seam2.y);
  await oneShotMeaning(page, canvas, "t", seam3.x, seam3.y);
  await expect(studio).toHaveAttribute("data-bearings", "3");
  await expect(studio).toHaveAttribute("data-torques", "3");
  await expect(studio).toHaveAttribute("data-quality", "COMPLETE");

  // RUN is an attempt, not a qualification gate. Physical Hand uses the same runtime.
  const generationBeforeFirstRun = await studio.getAttribute("data-source-generation");
  await page.getByRole("button", { name: "RUN", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "running");
  await expect(studio).toHaveAttribute("data-run-disabled", "false");
  const grab = await point(canvas, farFace.x, farFace.y);
  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down({ button: "left" });
  await expect(studio).toHaveAttribute("data-hand", "active");
  await page.mouse.move(grab.x - 65, grab.y + 42, { steps: 8 });
  await page.waitForTimeout(120);
  await page.mouse.up({ button: "left" });
  await expect(studio).toHaveAttribute("data-hand", "ready");
  await page.getByRole("button", { name: "STOP", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "build");
  await expect(studio).toHaveAttribute("data-source-generation", generationBeforeFirstRun ?? "");

  // Exact-delete one Bearing. Its Torque remains authored and becomes local unresolved evidence.
  await clickCanvas(page, canvas, seam1.x, seam1.y);
  await expect(context).toBeVisible();
  await context.locator('[data-bearing="bearing:1"] [data-delete-bearing="bearing:1"]').click();
  await expect(studio).toHaveAttribute("data-bearings", "2");
  await expect(studio).toHaveAttribute("data-torques", "3");
  await expect(studio).toHaveAttribute("data-quality", "PARTIAL");
  await expect(studio).toHaveAttribute("data-run-disabled", "false");

  // The partial world still enters real Box3D runtime.
  const generationBeforePartial = await studio.getAttribute("data-source-generation");
  await page.getByRole("button", { name: "RUN", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "running");
  await page.waitForTimeout(80);
  await page.getByRole("button", { name: "STOP", exact: true }).click();
  await expect(studio).toHaveAttribute("data-source-generation", generationBeforePartial ?? "");

  // Rebind an existing Bearing onto the orphaned interface, preserving its own ID.
  await clickCanvas(page, canvas, seam2.x, seam2.y);
  await context.locator('[data-bearing="bearing:2"] [data-rebind-bearing="bearing:2"]').click();
  await expect(studio).toHaveAttribute("data-intent", "rebind-bearing");
  await clickCanvas(page, canvas, seam1.x, seam1.y);
  await expect(studio).toHaveAttribute("data-intent", "neutral");

  // Torque:2 stayed on seam2 when its Bearing moved. Retarget it explicitly to seam1.
  await clickCanvas(page, canvas, seam2.x, seam2.y);
  await context.locator('[data-torque="torque:2"] [data-retarget-torque="torque:2"]').click();
  await expect(studio).toHaveAttribute("data-intent", "retarget-torque");
  await clickCanvas(page, canvas, seam1.x, seam1.y);
  await expect(studio).toHaveAttribute("data-quality", "COMPLETE");

  // Exact Matter delete → Undo → Redo → continue building. No cleanup workflow appears.
  await clickCanvas(page, canvas, 400, 650); // close the context island without authoring.
  await clickCanvas(page, canvas, farFace.x, farFace.y, { alt: true });
  await expect(studio).toHaveAttribute("data-cells", "6");
  await page.keyboard.press("Control+z");
  await expect(studio).toHaveAttribute("data-cells", "7");
  await page.keyboard.press("Control+Shift+z");
  await expect(studio).toHaveAttribute("data-cells", "6");
  // After redo the exposed x- face moved from x=-3 to x=-2.5.
  await clickCanvas(page, canvas, 517, 434);
  await expect(studio).toHaveAttribute("data-cells", "7");

  // Deliberately author a conflicting Bearing on an occupied seam. It remains authored;
  // the independent part still runs and RUN is never disabled.
  await oneShotMeaning(page, canvas, "b", seam1.x, seam1.y);
  await expect(studio).toHaveAttribute("data-bearings", "3");
  await expect(studio).toHaveAttribute("data-quality", "PARTIAL");
  await expect(studio).toHaveAttribute("data-run-disabled", "false");
  const finalGeneration = await studio.getAttribute("data-source-generation");
  await page.getByRole("button", { name: "RUN", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "running");

  // Camera and Hand coexist in the live partial world.
  const finalGrab = await point(canvas, farFace.x, farFace.y);
  await page.mouse.move(finalGrab.x, finalGrab.y);
  await page.mouse.down({ button: "left" });
  await page.mouse.move(finalGrab.x - 45, finalGrab.y + 30, { steps: 6 });
  await page.mouse.up({ button: "left" });
  await page.mouse.wheel(0, -140);
  await page.mouse.move(650, 500);
  await page.mouse.down({ button: "middle" });
  await page.mouse.move(700, 465, { steps: 5 });
  await page.mouse.up({ button: "middle" });

  // Restart is fresh transient physics; source is still the same authored generation.
  await page.getByRole("button", { name: "Restart" }).click();
  await expect(studio).toHaveAttribute("data-runtime", "running");
  await expect(page.getByRole("button", { name: "Forces OFF" })).toBeVisible();
  await page.getByRole("button", { name: "STOP", exact: true }).click();
  await expect(studio).toHaveAttribute("data-source-generation", finalGeneration ?? "");
  await expect(studio).toHaveAttribute("data-runtime", "build");

  const telemetry = JSON.parse(await studio.getAttribute("data-telemetry") ?? "{}") as {
    runAttempts?: number;
    runDisabledAttempts?: number;
    automaticAuthoredMutations?: number;
    inputChannels?: string[];
  };
  expect(telemetry.runAttempts).toBeGreaterThanOrEqual(4);
  expect(telemetry.runDisabledAttempts).toBe(0);
  expect(telemetry.automaticAuthoredMutations).toBe(0);
  expect(telemetry.inputChannels).toEqual(expect.arrayContaining([
    "build", "bearing", "torque", "run", "hand", "stop", "delete", "undo", "redo", "rebind", "retarget", "zoom", "orbit",
  ]));
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
