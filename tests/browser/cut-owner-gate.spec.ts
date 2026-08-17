import { expect, test } from "@playwright/test";

test("CUT owner gate keeps technical evidence secondary and produces a paste-ready owner report", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/?experiment=cut");
  await expect(page.locator("#cut-status")).toHaveText("READY");
  await expect(page.locator(".owner-gate-intro")).toContainText("FORGE OWNER GATE · V0");
  await expect(page.locator(".owner-technical-details")).not.toHaveAttribute("open", "");

  const verdictButtons = page.locator("[data-owner-verdict]");
  await expect(verdictButtons).toHaveCount(3);
  await expect(verdictButtons.first()).toBeDisabled();

  await page.locator("#cut-run").click();
  await expect(page.locator("#cut-status")).toHaveText("CUT EVIDENCE PASS");
  await expect(page.locator('[data-owner-verdict="ACCEPT"]')).toBeEnabled();

  await page.locator("#cut-replay").click();
  await expect(page.locator("#cut-status")).toHaveText("READY");
  await page.locator("#cut-run").click();
  await expect(page.locator("#cut-status")).toHaveText("CUT EVIDENCE PASS");
  await expect(page.locator("#owner-gate-state")).toContainText("powtórki: 2");

  await page.locator("#owner-notes").fill("Ruch wygląda ciągle; nie widzę teleportu ani resetu.");
  await page.locator('[data-owner-verdict="ACCEPT"]').click();

  const report = page.locator("#owner-report");
  await expect(report).toHaveValue(/FORGE OWNER REPORT/);
  await expect(report).toHaveValue(/gate: ANVIL-01 \/ CUT/);
  await expect(report).toHaveValue(/owner verdict: ACCEPT/);
  await expect(report).toHaveValue(/observed CUT runs: 2/);
  await expect(report).toHaveValue(/automated evidence: PASS/);
  await expect(report).toHaveValue(/source cells: 51 → 51/);
  await expect(report).toHaveValue(/runtime bodies: 1 → 2/);
  await expect(report).toHaveValue(/Ruch wygląda ciągle/);
  await expect(page.locator("#owner-copy-report")).toBeEnabled();
  expect(pageErrors).toEqual([]);
});
