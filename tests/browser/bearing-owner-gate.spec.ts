import { expect, test, type Page } from "@playwright/test";

const canonicalManifest = {
  schema: "anvil-forge-owner-gate/v2",
  project: "PROJECT ANVIL / Physical Fabric Laboratory",
  gate: "ANVIL-02 / BEARING",
  entryPath: "/?experiment=bearing",
  forgeRevision: "v0.2-second-consumer",
  provenance: "github-actions",
  sourceRepository: "Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory",
  sourceSha: "0123456789abcdef0123456789abcdef01234567",
  checkoutSha: "89abcdef0123456789abcdef0123456789abcdef",
  sourceRef: "experiment/anvil-02-bearing",
  ciEvent: "pull_request",
  ciRunId: "987654321",
  ciRunAttempt: "1",
  artifactName: "anvil-browser-laboratory",
  builtAt: "2026-08-18T00:00:00.000Z",
};

async function routeManifest(page: Page, manifest: Record<string, unknown> = canonicalManifest): Promise<void> {
  await page.route("**/forge-gate.json", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(manifest) });
  });
}

async function runBearingToPass(page: Page): Promise<void> {
  await page.goto("/?experiment=bearing");
  await expect(page.locator("#bearing-status")).toHaveText("READY");
  await page.locator("#bearing-run").click();
  await expect(page.locator("#bearing-status")).toHaveText("BEARING EVIDENCE PASS", { timeout: 15_000 });
}

test("Forge V0.2 BEARING gate produces a provenance-complete owner report", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await routeManifest(page);
  await runBearingToPass(page);

  await expect(page.locator(".owner-gate-intro")).toContainText("V0.2 SECOND CONSUMER");
  await expect(page.locator("#forge-build-state")).toContainText("BUILD IDENTIFIED");
  await expect(page.locator('[data-owner-verdict="ACCEPT"]')).toBeEnabled();
  await expect(page.locator(".owner-technical-details")).not.toHaveAttribute("open", "");

  await page.locator("#bearing-reset").click();
  await expect(page.locator("#bearing-status")).toHaveText("READY");
  await page.locator("#bearing-run").click();
  await expect(page.locator("#bearing-status")).toHaveText("BEARING EVIDENCE PASS", { timeout: 15_000 });
  await expect(page.locator("#owner-gate-state")).toContainText("powtórki: 2");

  await page.locator("#owner-notes").fill("Lewy pivot stabilny; control wyraźnie się rozjeżdża; obrót pozostaje swobodny.");
  await page.locator('[data-owner-verdict="ACCEPT"]').click();
  const report = page.locator("#owner-report");
  await expect(report).toHaveValue(/forge report integrity: PASS/);
  await expect(report).toHaveValue(/forge schema: anvil-forge-owner-gate\/v2/);
  await expect(report).toHaveValue(/gate: ANVIL-02 \/ BEARING/);
  await expect(report).toHaveValue(/entry path: \/\?experiment=bearing/);
  await expect(report).toHaveValue(/source sha: 0123456789abcdef0123456789abcdef01234567/);
  await expect(report).toHaveValue(/checkout sha: 89abcdef0123456789abcdef0123456789abcdef/);
  await expect(report).toHaveValue(/ci run: 987654321 attempt 1/);
  await expect(report).toHaveValue(/external provenance check: REQUIRED AFTER HANDOFF/);
  await expect(report).toHaveValue(/owner verdict: ACCEPT/);
  await expect(report).toHaveValue(/observed BEARING runs: 2/);
  await expect(report).toHaveValue(/automated gates: 8\/8 PASS/);
  await expect(report).toHaveValue(/source cells: 7 → 7/);
  await expect(report).toHaveValue(/runtime bodies: 1 → 2/);
  await expect(report).toHaveValue(/derived relation: 0 → 1/);
  await expect(report).toHaveValue(/Lewy pivot stabilny/);
  expect(pageErrors).toEqual([]);
});

test("Forge V0.2 blocks ACCEPT when artifact identifies the wrong active gate", async ({ page }) => {
  await routeManifest(page, { ...canonicalManifest, gate: "ANVIL-01 / CUT", entryPath: "/?experiment=cut" });
  await runBearingToPass(page);
  await expect(page.locator("#forge-build-state")).toContainText("BUILD IDENTITY BLOCKED");
  await expect(page.locator("#forge-build-state")).toContainText("unexpected Forge gate identity");
  await expect(page.locator('[data-owner-verdict="ACCEPT"]')).toBeDisabled();
  await expect(page.locator('[data-owner-verdict="INCONCLUSIVE"]')).toBeEnabled();
});

test("Forge V0.2 revokes BEARING ACCEPT when required evidence mutates", async ({ page }) => {
  await routeManifest(page);
  await runBearingToPass(page);
  await page.locator('[data-owner-verdict="ACCEPT"]').click();
  await expect(page.locator("#owner-report")).toHaveValue(/owner verdict: ACCEPT/);

  await page.locator("#metric-relation-count").evaluate((element) => { element.textContent = "0 → 0"; });
  await expect(page.locator('[data-owner-verdict="ACCEPT"]')).toBeDisabled();
  await expect(page.locator("#owner-report")).toHaveValue("");
  await expect(page.locator("#owner-copy-report")).toBeDisabled();
  await expect(page.locator("#owner-gate-state")).toContainText("required metric mismatch: relation-count");
});

test("Forge V0.2 blocks canonical ACCEPT for local/unverified BEARING build", async ({ page }) => {
  await routeManifest(page, {
    ...canonicalManifest,
    provenance: "local-unverified",
    sourceRepository: "LOCAL_UNVERIFIED",
    sourceSha: "LOCAL_UNVERIFIED",
    checkoutSha: "LOCAL_UNVERIFIED",
    sourceRef: "LOCAL_UNVERIFIED",
    ciEvent: "LOCAL_UNVERIFIED",
    ciRunId: "LOCAL_UNVERIFIED",
    ciRunAttempt: "LOCAL_UNVERIFIED",
  });
  await runBearingToPass(page);
  await expect(page.locator("#forge-build-state")).toContainText("BUILD UNVERIFIED");
  await expect(page.locator('[data-owner-verdict="ACCEPT"]')).toBeDisabled();
  await expect(page.locator('[data-owner-verdict="REJECT"]')).toBeEnabled();
});
