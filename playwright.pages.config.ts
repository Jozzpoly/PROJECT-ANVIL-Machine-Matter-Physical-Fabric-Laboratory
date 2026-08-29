import { defineConfig } from "@playwright/test";

const baseURL = process.env.ANVIL_PAGES_URL;
if (baseURL === undefined || baseURL.trim().length === 0) {
  throw new Error("ANVIL_PAGES_URL is required for the deployed Pages smoke gate");
}

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "r2-pages-smoke.spec.ts",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    headless: true,
  },
});
