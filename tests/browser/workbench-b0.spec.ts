import { expect, test } from "@playwright/test";

test("W1 B0 production browser follows the frozen owner path without front-loading technical interpretation", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?experiment=workbench");

  const status = page.locator("#wb-status");
  const primary = page.locator("#wb-primary");
  const details = page.locator("#wb-details");
  const canvas = page.locator("#wb-canvas");

  await expect(status).toHaveAttribute("data-phase", "INITIAL", { timeout: 10_000 });
  await expect(status).toHaveText("READY");
  await expect(primary).toHaveText("CONTINUE TO CUT READY");
  await expect(page.locator("#wb-reset")).toHaveText("RESET SPECIMEN");
  await expect(page.locator("#wb-source-cells")).toHaveText("7");
  await expect(page.locator("#wb-runtime-bodies")).toHaveText("2");
  await expect(page.locator("#wb-activation")).toHaveText("OFF");
  await expect(details).not.toHaveAttribute("open", "");
  await expect(page.locator("#wb-first-pass")).toBeHidden();

  for (const selector of ["#wb-view-authored", "#wb-view-runtime", "#wb-view-both"]) {
    await expect(page.locator(selector)).toBeVisible();
  }
  await expect(page.locator("#wb-view-both")).toHaveClass(/active/u);

  const layoutDiagnostic = await canvas.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const viewportCard = element.closest(".wb-viewport-card");
    const layout = element.closest(".wb-layout");
    const canvasStyle = getComputedStyle(element);
    const cardStyle = viewportCard === null ? null : getComputedStyle(viewportCard);
    const layoutStyle = layout === null ? null : getComputedStyle(layout);
    return {
      canvas: {
        width: rect.width,
        height: rect.height,
        cssWidth: canvasStyle.width,
        display: canvasStyle.display,
        flex: canvasStyle.flex,
        minHeight: canvasStyle.minHeight,
      },
      viewportCard: viewportCard === null ? null : {
        width: viewportCard.getBoundingClientRect().width,
        display: cardStyle?.display,
        minWidth: cardStyle?.minWidth,
      },
      layout: layout === null ? null : {
        width: layout.getBoundingClientRect().width,
        display: layoutStyle?.display,
        gridTemplateColumns: layoutStyle?.gridTemplateColumns,
      },
      stylesheets: Array.from(document.styleSheets).map((sheet) => sheet.href ?? "inline"),
    };
  });
  console.log(JSON.stringify({ probe: "W1/B0-LAYOUT", ...layoutDiagnostic }));

  await expect.poll(
    () => canvas.evaluate((element) => element.getBoundingClientRect().width),
    { timeout: 5_000, message: "W1 B0 canvas should occupy the main Workbench viewport" },
  ).toBeGreaterThan(650);
  await expect.poll(
    () => canvas.evaluate((element) => element.getBoundingClientRect().height),
    { timeout: 5_000, message: "W1 B0 canvas should retain a useful observation height" },
  ).toBeGreaterThan(430);

  await page.locator("#wb-view-authored").click();
  await expect(page.locator("#wb-view-authored")).toHaveClass(/active/u);
  await expect(page.locator("#wb-view-title")).toHaveText("AUTHORED MATTER");
  await page.locator("#wb-view-runtime").click();
  await expect(page.locator("#wb-view-title")).toHaveText("RUNTIME INTERPRETATION");
  await page.locator("#wb-view-both").click();
  await expect(page.locator("#wb-view-title")).toHaveText("BOTH");

  await primary.click();
  await expect(status).toHaveAttribute("data-phase", "CUT_READY");
  await expect(status).toHaveText("CUT READY");
  await expect(primary).toHaveText("EXECUTE ACCEPTED CUT");
  await expect(page.locator("#wb-runtime-bodies")).toHaveText("2");
  await expect(page.locator("#wb-activation")).toHaveText("OFF");
  await expect(details).not.toHaveAttribute("open", "");

  await primary.click();
  await expect(status).toHaveAttribute("data-phase", "POST_CUT_OFF", { timeout: 10_000 });
  await expect(status).toHaveText("POST-CUT · OFF");
  await expect(page.locator("#wb-runtime-bodies")).toHaveText("2 → 3");
  await expect(page.locator("#wb-activation")).toHaveText("OFF");
  await expect(primary).toHaveText("ACTIVATE TORQUE");
  await expect(details).not.toHaveAttribute("open", "");
  await expect(page.locator("#wb-first-pass")).toBeHidden();

  await primary.click();
  await expect(status).toHaveAttribute("data-phase", "OBSERVED", { timeout: 10_000 });
  await expect(status).toHaveText("OBSERVED");
  await expect(page.locator("#wb-activation")).toHaveText("ON");
  await expect(primary).toBeDisabled();
  await expect(page.locator("#wb-first-pass")).toBeVisible();
  await expect(page.locator("#wb-first-pass")).toContainText("Co Twoim zdaniem pozostało tym samym");
  await expect(page.locator("#wb-first-pass")).toContainText("Co przewidziałbyś");
  await expect(page.locator("#wb-first-pass")).toContainText("Co chciałbyś teraz sam zbudować");
  await expect(details).not.toHaveAttribute("open", "");

  await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
  await expect(page.locator("#wb-metric-source")).toHaveText("7 → 7");
  await expect(page.locator("#wb-metric-bodies")).toHaveText("2 → 3");
  await expect(page.locator("#wb-metric-bearing-source")).toHaveText("bearing:seam-0");
  await expect(page.locator("#wb-metric-patch-source")).toHaveText("torque-patch:seam-0");
  await expect(page.locator("#wb-metric-endpoint")).toHaveText("body:a:0 → body:a:2");
  await expect(page.locator("#wb-metric-fresh-action")).toHaveText("body:a:2");
  await expect(page.locator("#wb-metric-fresh-off")).toHaveText("OFF");
  await expect(page.locator("#wb-metric-runtime-replace")).toContainText("old runtime disposed");

  const speedAdvantage = Number(await page.locator("#wb-metric-speed-advantage").getAttribute("data-value"));
  const staleAngular = Number(await page.locator("#wb-metric-stale-angular").getAttribute("data-value"));
  const staleLinear = Number(await page.locator("#wb-metric-stale-linear").getAttribute("data-value"));
  console.log(JSON.stringify({
    probe: "W1/B0-BROWSER",
    speedAdvantageRadps: speedAdvantage,
    staleSiblingAngularDeltaRadps: staleAngular,
    staleSiblingLinearDeltaMps: staleLinear,
  }));
  expect(Number.isFinite(speedAdvantage) && speedAdvantage >= 0.25).toBe(true);
  expect(Number.isFinite(staleAngular) && staleAngular <= 1e-6).toBe(true);
  expect(Number.isFinite(staleLinear) && staleLinear <= 1e-6).toBe(true);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(pageErrors).toEqual([]);

  await page.locator("#wb-reset").click();
  await expect(status).toHaveAttribute("data-phase", "INITIAL", { timeout: 10_000 });
  await expect(status).toHaveText("READY");
  await expect(page.locator("#wb-runtime-bodies")).toHaveText("2");
  await expect(page.locator("#wb-activation")).toHaveText("OFF");
  await expect(page.locator("#wb-first-pass")).toBeHidden();
  await expect(details).not.toHaveAttribute("open", "");
});
