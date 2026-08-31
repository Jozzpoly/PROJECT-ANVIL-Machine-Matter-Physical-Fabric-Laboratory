import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  testIgnore: "r2-pages-smoke.spec.ts",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
  },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
