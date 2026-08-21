import { expect, test } from "@playwright/test";

test("Studio first-run enters one world-first authored Matter workshop", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/?studio=1");
  await expect(page.getByRole("region", { name: "New workspace" })).toBeVisible();
  await expect(page.locator("canvas[data-studio-world='true']")).toHaveAttribute("data-authored-cells", "0");

  await page.getByRole("button", { name: "Editable Starter" }).click();
  await expect(page.getByRole("navigation", { name: "Intent" })).toBeVisible();
  await expect(page.locator("canvas[data-studio-world='true']")).toHaveAttribute("data-authored-cells", "7");
  await expect(page.locator("[data-anvil-studio='substrate']")).toHaveAttribute("data-source-generation", "0");
  await expect(page.getByRole("button", { name: "Matter" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Undo" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Redo" })).toBeDisabled();

  await page.getByRole("button", { name: "Matter" }).click();
  await expect(page.getByRole("region", { name: "Matter tools" })).toBeVisible();
  await expect(page.getByText("Hover an exposed face and click to add one cell.")).toBeVisible();

  expect(pageErrors).toEqual([]);
});
