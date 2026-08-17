import { expect, test, type Page } from "@playwright/test";

const canonicalManifest = {
  schema: "anvil-forge-owner-gate/v1",
  project: "PROJECT ANVIL / Physical Fabric Laboratory",
  gate: "ANVIL-01 / CUT",
  forgeRevision: "v0.1-field-trial",
  provenance: "github-actions",
  sourceRepository: "Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory",
  sourceSha: "0123456789abcdef0123456789abcdef01234567",
  checkoutSha: "89abcdef0123456789abcdef0123456789abcdef",
  sourceRef: "foundation/forge-cut-field-trial",
  ciEvent: "pull_request",
  ciRunId: "123456789",
  ciRunAttempt: "1",
  artifactName: "anvil-browser-laboratory",
  builtAt: "2026-08-18T00:00:00.000Z",
};

async function routeCanonicalManifest(page: Page): Promise<void> {
  await page.route("**/forge-gate.json", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(canonicalManifest) });
  });
}

test("Forge CUT gate produces a provenance-complete fail-closed owner report", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await routeCanonicalManifest(page);

  await page.goto("/?experiment=cut");
  await expect(page.locator("#cut-status")).toHaveText("READY");
  await expect(page.locator(".owner-gate-intro")).toContainText("FORGE OWNER GATE · V0.1 FIELD TRIAL");
  await expect(page.locator("#forge-build-state")).toContainText("BUILD VERIFIED");
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
  await expect(report).toHaveValue(/forge report validity: VALID/);
  await expect(report).toHaveValue(/forge issues: none/);
  await expect(report).toHaveValue(/source sha: 0123456789abcdef0123456789abcdef01234567/);
  await expect(report).toHaveValue(/checkout sha: 89abcdef0123456789abcdef0123456789abcdef/);
  await expect(report).toHaveValue(/ci event: pull_request/);
  await expect(report).toHaveValue(/ci run: 123456789 attempt 1/);
  await expect(report).toHaveValue(/artifact: anvil-browser-laboratory/);
  await expect(report).toHaveValue(/owner verdict: ACCEPT/);
  await expect(report).toHaveValue(/observed CUT runs: 2/);
  await expect(report).toHaveValue(/automated evidence: PASS/);
  await expect(report).toHaveValue(/automated gates: 8\/8 PASS/);
  await expect(report).toHaveValue(/source cells: 51 → 51/);
  await expect(report).toHaveValue(/runtime bodies: 1 → 2/);
  await expect(report).toHaveValue(/Ruch wygląda ciągle/);
  await expect(page.locator("#owner-copy-report")).toBeEnabled();
  expect(pageErrors).toEqual([]);
});

test("Forge blocks ACCEPT and reports UNAVAILABLE when required evidence disappears", async ({ page }) => {
  await routeCanonicalManifest(page);
  await page.goto("/?experiment=cut");
  await page.locator("#cut-run").click();
  await expect(page.locator("#cut-status")).toHaveText("CUT EVIDENCE PASS");
  await expect(page.locator('[data-owner-verdict="ACCEPT"]')).toBeEnabled();

  await page.locator("#metric-source-count").evaluate((element) => element.remove());
  await expect(page.locator('[data-owner-verdict="ACCEPT"]')).toBeDisabled();
  await expect(page.locator('[data-owner-verdict="REJECT"]')).toBeEnabled();
  await expect(page.locator("#owner-gate-state")).toContainText("missing required metric: source-count");

  await page.locator('[data-owner-verdict="REJECT"]').click();
  const report = page.locator("#owner-report");
  await expect(report).toHaveValue(/forge report validity: INVALID/);
  await expect(report).toHaveValue(/missing required metric: source-count/);
  await expect(report).toHaveValue(/source cells: UNAVAILABLE/);
});

test("Forge blocks ACCEPT for an unverified local build even when CUT passes", async ({ page }) => {
  await page.route("**/forge-gate.json", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...canonicalManifest,
        provenance: "local-unverified",
        sourceRepository: "LOCAL_UNVERIFIED",
        sourceSha: "LOCAL_UNVERIFIED",
        checkoutSha: "LOCAL_UNVERIFIED",
        sourceRef: "LOCAL_UNVERIFIED",
        ciEvent: "LOCAL_UNVERIFIED",
        ciRunId: "LOCAL_UNVERIFIED",
        ciRunAttempt: "LOCAL_UNVERIFIED",
      }),
    });
  });

  await page.goto("/?experiment=cut");
  await expect(page.locator("#forge-build-state")).toContainText("BUILD UNVERIFIED");
  await page.locator("#cut-run").click();
  await expect(page.locator("#cut-status")).toHaveText("CUT EVIDENCE PASS");
  await expect(page.locator('[data-owner-verdict="ACCEPT"]')).toBeDisabled();
  await expect(page.locator('[data-owner-verdict="INCONCLUSIVE"]')).toBeEnabled();
});
