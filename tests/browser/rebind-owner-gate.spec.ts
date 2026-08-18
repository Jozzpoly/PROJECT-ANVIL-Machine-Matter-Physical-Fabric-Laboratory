import { expect, test, type Page } from "@playwright/test";

const canonicalManifest = {
  schema: "anvil-forge-owner-gate/v2",
  project: "PROJECT ANVIL / Physical Fabric Laboratory",
  gate: "ANVIL-03 / REBIND",
  entryPath: "/?experiment=rebind",
  forgeRevision: "v0.2.1-human-owner-copy",
  provenance: "github-actions",
  sourceRepository: "Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory",
  sourceSha: "0123456789abcdef0123456789abcdef01234567",
  checkoutSha: "89abcdef0123456789abcdef0123456789abcdef",
  sourceRef: "experiment/anvil-03-rebind",
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

async function runToPass(page: Page): Promise<void> {
  await page.goto("/?experiment=rebind");
  await expect(page.locator("#rebind-status")).toHaveAttribute("data-state", "READY", { timeout: 10_000 });
  await page.locator("#rebind-run").click();
  await expect(page.locator("#rebind-status")).toHaveAttribute("data-state", "PASS", { timeout: 15_000 });
}

test("ANVIL-03 Forge owner flow is plain Polish while the report stays technical", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await routeManifest(page);
  await page.goto("/?experiment=rebind");
  await expect(page.locator("#rebind-status")).toHaveAttribute("data-state", "READY", { timeout: 10_000 });

  await expect(page.locator(".rebind-owner-focus")).toContainText("Najpierw obie strony są takie same");
  await expect(page.locator(".viewport-head")).toContainText("PO LEWEJ: POŁĄCZENIE WRACA");
  await expect(page.locator(".viewport-head")).toContainText("PO PRAWEJ: BRAK POŁĄCZENIA");
  await expect(page.locator(".rebind-transaction")).toContainText("2 kawałki + połączenie");
  await expect(page.locator(".rebind-transaction")).toContainText("3 kawałki + to samo połączenie");
  await expect(page.locator('[data-owner-verdict="ACCEPT"]')).toHaveText("DZIAŁA");
  await expect(page.locator('[data-owner-verdict="REJECT"]')).toHaveText("NIE DZIAŁA");
  await expect(page.locator('[data-owner-verdict="INCONCLUSIVE"]')).toHaveText("NIE WIEM");
  await expect(page.locator(".rebind-technical-details")).not.toHaveAttribute("open", "");
  await expect(page.locator("#rebind-forge-build-state")).toBeHidden();
  await expect(page.locator(".rebind-owner-verdict")).not.toContainText("canonical");
  await expect(page.locator(".rebind-owner-verdict")).not.toContainText("fail-closed");
  await expect(page.locator(".rebind-owner-verdict")).not.toContainText("provenance");
  await expect(page.locator(".rebind-owner-verdict")).not.toContainText("schema");

  await page.locator("#rebind-run").click();
  await expect(page.locator("#rebind-status")).toHaveAttribute("data-state", "PASS", { timeout: 15_000 });
  await expect(page.locator('[data-owner-verdict="ACCEPT"]')).toBeEnabled();
  await expect(page.locator("#rebind-owner-state")).toContainText("wybierz „DZIAŁA”");

  await page.locator("#rebind-reset").click();
  await expect(page.locator("#rebind-status")).toHaveAttribute("data-state", "READY", { timeout: 10_000 });
  await page.locator("#rebind-run").click();
  await expect(page.locator("#rebind-status")).toHaveAttribute("data-state", "PASS", { timeout: 15_000 });
  await expect(page.locator("#rebind-owner-state")).toContainText("Powtórki: 2");

  await page.locator("#rebind-owner-notes").fill("Po lewej zielone połączenie zostało na właściwym kawałku, po prawej czerwone punkty odjechały.");
  await page.locator('[data-owner-verdict="ACCEPT"]').click();
  const report = page.locator("#rebind-owner-report");
  await expect(report).toHaveValue(/forge report integrity: PASS/);
  await expect(report).toHaveValue(/forge schema: anvil-forge-owner-gate\/v2/);
  await expect(report).toHaveValue(/forge revision: v0\.2\.1-human-owner-copy/);
  await expect(report).toHaveValue(/gate: ANVIL-03 \/ REBIND/);
  await expect(report).toHaveValue(/entry path: \/\?experiment=rebind/);
  await expect(report).toHaveValue(/source sha: 0123456789abcdef0123456789abcdef01234567/);
  await expect(report).toHaveValue(/checkout sha: 89abcdef0123456789abcdef0123456789abcdef/);
  await expect(report).toHaveValue(/ci run: 987654321 attempt 1/);
  await expect(report).toHaveValue(/owner verdict: ACCEPT/);
  await expect(report).toHaveValue(/observed REBIND runs: 2/);
  await expect(report).toHaveValue(/automated gates: 11\/11 PASS/);
  await expect(report).toHaveValue(/source cells: 7 → 7/);
  await expect(report).toHaveValue(/runtime bodies: 2 → 3/);
  await expect(report).toHaveValue(/source bearing: 1 → 1/);
  await expect(report).toHaveValue(/endpoint runtime body: body:a:0 → body:a:2/);
  await expect(report).toHaveValue(/external provenance check: REQUIRED AFTER HANDOFF/);
  await expect(report).toHaveValue(/zielone połączenie zostało/);
  await expect(page.locator("#rebind-owner-copy")).toBeEnabled();

  await page.locator(".rebind-technical-details > summary").click();
  await expect(page.locator("#rebind-forge-build-state")).toContainText("BUILD IDENTIFIED");
  expect(pageErrors).toEqual([]);
});

test("ANVIL-03 Forge blocks DZIAŁA when the artifact points at the wrong gate", async ({ page }) => {
  await routeManifest(page, { ...canonicalManifest, gate: "ANVIL-02 / BEARING", entryPath: "/?experiment=bearing" });
  await runToPass(page);
  await expect(page.locator('[data-owner-verdict="ACCEPT"]')).toBeDisabled();
  await expect(page.locator('[data-owner-verdict="REJECT"]')).toBeEnabled();
  await expect(page.locator("#rebind-owner-state")).toContainText("kontrola techniczna paczki wykryła problem");
  await expect(page.locator("#rebind-forge-build-state")).toContainText("BUILD IDENTITY BLOCKED");
  await expect(page.locator("#rebind-forge-build-state")).toBeHidden();
});

test("ANVIL-03 Forge blocks DZIAŁA for a local/unverified build", async ({ page }) => {
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
  await runToPass(page);
  await expect(page.locator('[data-owner-verdict="ACCEPT"]')).toBeDisabled();
  await expect(page.locator('[data-owner-verdict="INCONCLUSIVE"]')).toBeEnabled();
  await expect(page.locator("#rebind-forge-build-state")).toContainText("BUILD UNVERIFIED");
});

test("ANVIL-03 Forge revokes ACCEPT if required REBIND evidence changes afterwards", async ({ page }) => {
  await routeManifest(page);
  await runToPass(page);
  await page.locator('[data-owner-verdict="ACCEPT"]').click();
  await expect(page.locator("#rebind-owner-report")).toHaveValue(/owner verdict: ACCEPT/);

  await page.locator("#metric-rebind-body-id").evaluate((element) => { element.textContent = "body:a:0 → body:a:0"; });
  await expect(page.locator('[data-owner-verdict="ACCEPT"]')).toBeDisabled();
  await expect(page.locator("#rebind-owner-report")).toHaveValue("");
  await expect(page.locator("#rebind-owner-copy")).toBeDisabled();
  await expect(page.locator("#rebind-owner-copy-status")).toContainText("zostało cofnięte");
});
