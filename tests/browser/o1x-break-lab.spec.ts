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
  };
}

async function clickSecondStarterSeam(page: import("@playwright/test").Page) {
  const canvas = page.locator("canvas[data-studio-world='true']");
  const box = await canvas.boundingBox();
  if (box === null) throw new Error("Studio canvas has no bounding box");
  // Frozen starter/camera projection for shared interface starter:b0@x+ ↔ starter:b1@x-.
  // World pivot (0.5, 0.25, 0.25) projects to approximately (624, 447)
  // in the 1200×800 owner viewport. This is a real semantic pointer hit.
  await page.mouse.click(box.x + 624, box.y + 447);
}

test("O1-X Break Lab lets a real second Bearing remain UNSUPPORTED yet run experimentally through the normal Studio lifecycle", async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  const { studio, canvas, intent, simulation } = await openStarter(page);
  await expect(studio).toHaveAttribute("data-source-generation", "0");
  await expect(studio).toHaveAttribute("data-composition-support", "SUPPORTED");
  await expect(studio).toHaveAttribute("data-run-readiness", "READY");

  await intent.getByRole("button", { name: "Meaning" }).click();
  await page.getByRole("button", { name: "Bearing" }).click();
  await expect(canvas).toHaveAttribute("data-o1x-lens", "meaning");

  await clickSecondStarterSeam(page);
  await expect(page.getByText("New Bearing draft.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Commit · Enter" })).toBeVisible();

  // Owner feedback: Enter was already implemented but insufficiently discoverable.
  // This gate uses the keyboard path instead of clicking Commit.
  await page.keyboard.press("Enter");
  await expect(studio).toHaveAttribute("data-source-generation", "1");
  await expect(studio).toHaveAttribute("data-authored-validity", "VALID");
  await expect(studio).toHaveAttribute("data-composition-support", "UNSUPPORTED");
  await expect(studio).toHaveAttribute("data-run-readiness", "INCOMPLETE");
  await expect(studio).toHaveAttribute("data-break-lab-eligibility", "ELIGIBLE");

  await expect(simulation.getByRole("button", { name: "RUN", exact: true })).toBeDisabled();
  const breakRun = simulation.getByRole("button", { name: "BREAK RUN", exact: true });
  await expect(breakRun).toBeEnabled();
  await breakRun.click();

  await expect(studio).toHaveAttribute("data-runtime-mode", "BREAK");
  await expect(studio).toHaveAttribute("data-work-state", "RUNNING");
  await expect(studio).toHaveAttribute("data-runtime-activation", "OFF");
  await expect.poll(async () => Number(await canvas.getAttribute("data-runtime-frames"))).toBeGreaterThan(0);

  await simulation.getByRole("button", { name: "Activate" }).click();
  await expect(studio).toHaveAttribute("data-runtime-activation", "ON");
  await expect.poll(async () => Number(await canvas.getAttribute("data-runtime-frames"))).toBeGreaterThan(3);

  await simulation.getByRole("button", { name: "Pause" }).click();
  await expect(studio).toHaveAttribute("data-work-state", "PAUSED");
  const beforeStep = Number(await canvas.getAttribute("data-runtime-frames"));
  await simulation.getByRole("button", { name: "Step" }).click();
  await expect.poll(async () => Number(await canvas.getAttribute("data-runtime-frames"))).toBeGreaterThan(beforeStep);

  const firstSession = await studio.getAttribute("data-runtime-session");
  if (firstSession === null || firstSession.length === 0) throw new Error("Break Lab did not expose its first runtime session id");
  await simulation.getByRole("button", { name: "Restart" }).click();
  await expect(studio).toHaveAttribute("data-runtime-mode", "BREAK");
  await expect(studio).toHaveAttribute("data-work-state", "RUNNING");
  await expect(studio).toHaveAttribute("data-runtime-activation", "OFF");
  await expect.poll(async () => await studio.getAttribute("data-runtime-session")).not.toBe(firstSession);

  await simulation.getByRole("button", { name: "Stop" }).click();
  await expect(studio).toHaveAttribute("data-work-state", "BUILD");
  await expect(studio).toHaveAttribute("data-runtime-mode", "NONE");
  await expect(studio).toHaveAttribute("data-source-generation", "1");
  await expect(studio).toHaveAttribute("data-composition-support", "UNSUPPORTED");
  await expect(studio).toHaveAttribute("data-break-lab-eligibility", "ELIGIBLE");

  // STOP must return to the same authored world. Re-enter the second persistent Bearing
  // through the representation lens rather than any list/runtime identity.
  await intent.getByRole("button", { name: "Meaning" }).click();
  await page.getByRole("button", { name: "Bearing" }).click();
  await clickSecondStarterSeam(page);
  await expect(page.getByText("Editing the Bearing on this interface.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Axis Y" })).toHaveClass(/active/u);

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
