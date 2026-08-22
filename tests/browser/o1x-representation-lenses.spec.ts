import { expect, test } from "@playwright/test";

async function openStarter(page: import("@playwright/test").Page) {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/?studio=1");
  await page.getByRole("button", { name: "Editable Starter" }).click();
  return {
    studio: page.locator("[data-anvil-studio='substrate']"),
    canvas: page.locator("canvas[data-studio-world='true']"),
    lensDock: page.locator("[data-o1x-lens-dock='true']"),
    intent: page.getByRole("navigation", { name: "Intent" }),
  };
}

async function clickStarterMeaningPivot(page: import("@playwright/test").Page) {
  const canvas = page.locator("canvas[data-studio-world='true']");
  const box = await canvas.boundingBox();
  if (box === null) throw new Error("Studio canvas has no bounding box");
  // Frozen starter/camera projection for authored seam pivot (0, 0.25, 0.25).
  await page.mouse.click(box.x + 583, box.y + 432);
}

test("O1-X Surface Cells Meaning lenses change presentation without mutating authored source", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const { studio, canvas, lensDock } = await openStarter(page);

  await expect(canvas).toHaveAttribute("data-o1x-lens", "surface");
  await expect(canvas).toHaveAttribute("data-o1x-surface-faces", "30");
  await expect(canvas).toHaveAttribute("data-o1x-shared-interfaces", "6");
  await expect(studio).toHaveAttribute("data-source-generation", "0");

  await lensDock.getByRole("button", { name: "Cells" }).click();
  await expect(canvas).toHaveAttribute("data-o1x-lens", "cells");
  await expect(studio).toHaveAttribute("data-source-generation", "0");

  await lensDock.getByRole("button", { name: "Meaning" }).click();
  await expect(canvas).toHaveAttribute("data-o1x-lens", "meaning");
  await expect(studio).toHaveAttribute("data-source-generation", "0");

  await lensDock.getByRole("button", { name: "Surface" }).click();
  await expect(canvas).toHaveAttribute("data-o1x-lens", "surface");
  await expect(studio).toHaveAttribute("data-source-generation", "0");
  expect(pageErrors).toEqual([]);
});

test("O1-X semantic world picking re-enters the same persistent Bearing and TorquePatch", async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  const { studio, canvas, intent } = await openStarter(page);

  await intent.getByRole("button", { name: "Meaning" }).click();
  await expect(canvas).toHaveAttribute("data-o1x-lens", "meaning");
  await page.getByRole("button", { name: "Bearing" }).click();

  await clickStarterMeaningPivot(page);
  await expect(page.getByText("Editing the Bearing on this interface.")).toBeVisible();
  await page.getByRole("button", { name: "Axis Y" }).click();
  await page.getByRole("button", { name: "Commit" }).click();
  await expect(studio).toHaveAttribute("data-source-generation", "1");

  await clickStarterMeaningPivot(page);
  await expect(page.getByText("Editing the Bearing on this interface.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Axis Y" })).toHaveClass(/active/u);
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.getByRole("button", { name: "Torque" }).click();
  await clickStarterMeaningPivot(page);
  await expect(page.getByText("Editing this TorquePatch.")).toBeVisible();
  const effort = page.getByRole("textbox", { name: "Torque effort Nm" });
  await expect(effort).toHaveValue("100");
  await effort.fill("10");
  await page.getByRole("button", { name: "Commit" }).click();
  await expect(studio).toHaveAttribute("data-source-generation", "2");

  await clickStarterMeaningPivot(page);
  await expect(page.getByText("Editing this TorquePatch.")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Torque effort Nm" })).toHaveValue("10");

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
