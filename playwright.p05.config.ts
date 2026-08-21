import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./spikes/p05-renderers",
  testMatch: "p05-renderers.spec.ts",
  timeout: 35_000,
  expect: { timeout: 10_000 },
  use: { baseURL: "http://127.0.0.1:4174", headless: true, viewport: { width: 1280, height: 800 } },
  webServer: {
    command: "npx vite --host 127.0.0.1 --port 4174",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
