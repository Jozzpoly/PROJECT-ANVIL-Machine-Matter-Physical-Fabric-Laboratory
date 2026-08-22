import { expect, test } from "@playwright/test";

test("Studio substrate owns its route, viewport and input channels", async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/?studio=1");

  const surface = page.locator("[data-anvil-studio='substrate']");
  const canvas = page.locator("canvas[data-studio-world='true']");
  await expect(surface).toBeVisible();
  await expect(canvas).toBeVisible();

  const bounds = await canvas.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds?.x).toBe(0);
  expect(bounds?.y).toBe(0);
  expect(bounds?.width).toBe(1200);
  expect(bounds?.height).toBe(800);

  const historicalCss = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((name) =>
        ["bearing-demo", "bearing-owner-language", "cut-owner-gate", "rebind-demo"].some((token) =>
          name.includes(token),
        ),
      ),
  );
  expect(historicalCss).toEqual([]);

  await canvas.evaluate((element) => {
    const channels: string[] = [];
    (window as Window & { __anvilStudioInputChannels?: string[] }).__anvilStudioInputChannels = channels;
    element.addEventListener("anvil-studio-input", (event) => {
      const detail = (event as CustomEvent<{ channel: string }>).detail;
      channels.push(detail.channel);
    });
  });

  const centerX = 600;
  const centerY = 400;
  await page.mouse.move(centerX, centerY);
  await page.mouse.down({ button: "left" });
  await page.mouse.up({ button: "left" });

  await page.mouse.down({ button: "middle" });
  await page.mouse.move(centerX + 45, centerY + 20, { steps: 3 });
  await page.mouse.up({ button: "middle" });

  await page.keyboard.down("Shift");
  await page.mouse.down({ button: "middle" });
  await page.mouse.move(centerX + 75, centerY + 35, { steps: 3 });
  await page.mouse.up({ button: "middle" });
  await page.keyboard.up("Shift");

  await page.mouse.wheel(0, -120);
  await page.keyboard.press("f");

  const channels = await page.evaluate(
    () => (window as Window & { __anvilStudioInputChannels?: string[] }).__anvilStudioInputChannels ?? [],
  );
  expect(channels).toEqual(["semantic", "orbit", "pan", "zoom", "focus"]);

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
