import { expect, test } from "@playwright/test";

const pagesUrl = process.env.ANVIL_PAGES_URL;
const expectedSourceSha = process.env.EXPECTED_SOURCE_SHA;

test("deployed Owner candidate preserves provenance and boots R2 at the public root", async ({ page, request }) => {
  if (pagesUrl === undefined || expectedSourceSha === undefined) {
    throw new Error("Pages smoke requires ANVIL_PAGES_URL and EXPECTED_SOURCE_SHA");
  }

  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  const response = await page.goto(pagesUrl, { waitUntil: "networkidle" });
  expect(response?.ok()).toBe(true);
  await expect(page.locator(".r2-studio")).toBeVisible();
  await expect(page).toHaveTitle(/PROJECT ANVIL/u);
  await expect(page).not.toHaveTitle(/COLLAPSE/u);

  const manifestUrl = new URL("./anvil-artifact.json", page.url()).toString();
  const manifestResponse = await request.get(manifestUrl);
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json() as {
    schema?: string;
    role?: string;
    entryPath?: string;
    sourceSha?: string;
  };
  expect(manifest.schema).toBe("anvil-owner-artifact/v1");
  expect(manifest.role).toBe("browser-laboratory");
  expect(manifest.entryPath).toBe("/");
  expect(manifest.sourceSha).toBe(expectedSourceSha);

  const studio = page.locator(".r2-studio");
  await expect(studio).toHaveAttribute("data-runtime", "build");
  await page.getByRole("button", { name: "RUN", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "running");
  await page.getByRole("button", { name: "STOP", exact: true }).click();
  await expect(studio).toHaveAttribute("data-runtime", "build");

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
