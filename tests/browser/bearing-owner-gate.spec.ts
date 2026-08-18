import { expect, test, type Page } from "@playwright/test";

const canonicalManifest = {
  schema: "anvil-forge-owner-gate/v2",
  project: "PROJECT ANVIL / Physical Fabric Laboratory",
  gate: "ANVIL-02 / BEARING",
  entryPath: "/?experiment=bearing",
  forgeRevision: "v0.2.1-human-owner-copy",
  provenance: "github-actions",
  sourceRepository: "Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory",
  sourceSha: "0123456789abcdef0123456789abcdef01234567",
  checkoutSha: "89abcdef0123456789abcdef0123456789abcdef",
  sourceRef: "forge/v0.2.1-human-owner-copy",
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

test("Forge V0.2.1 keeps the owner path plain while preserving the technical report", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await routeManifest(page);
  await page.goto("/?experiment=bearing");
  await expect(page.locator("#bearing-status")).toHaveText("READY");

  const intro = page.locator(".owner-gate-intro");
  await expect(intro).toContainText("Sprawdzamy jedną prostą rzecz");
  await expect(intro).toContainText("lewa ma zostać razem");
  await expect(intro).toContainText("prawa ma się rozlecieć");
  await expect(intro).not.toContainText("SECOND CONSUMER");
  await expect(intro).not.toContainText("authored");
  await expect(intro).not.toContainText("canonical");
  await expect(intro).not.toContainText("fail-closed");
  await expect(page.locator("#bearing-run")).toHaveText("URUCHOM TEST");
  await expect(page.locator("#bearing-reset")).toHaveText("POWTÓRZ OD NOWA");
  await expect(page.locator('[data-owner-verdict="ACCEPT"]')).toHaveText("DZIAŁA");
  await expect(page.locator('[data-owner-verdict="REJECT"]')).toHaveText("NIE DZIAŁA");
  await expect(page.locator('[data-owner-verdict="INCONCLUSIVE"]')).toHaveText("NIE WIEM");
  await expect(page.locator(".owner-technical-details > summary")).toHaveText("Szczegóły techniczne — nie musisz tego czytać");
  await expect(page.locator(".owner-technical-details")).not.toHaveAttribute("open", "");
  await expect(page.locator("#forge-build-state")).toBeHidden();
  await expect(page.locator(".bearing-signal")).toBeHidden();
  await expect(page.locator("#owner-gate-state")).toContainText("URUCHOM TEST");

  const readyBadge = await page.locator("#bearing-status").evaluate((element) => getComputedStyle(element, "::after").content);
  expect(readyBadge).toContain("GOTOWE");

  await page.locator("#bearing-run").click();
  await expect(page.locator("#bearing-status")).toHaveText("BEARING EVIDENCE PASS", { timeout: 15_000 });
  const passBadge = await page.locator("#bearing-status").evaluate((element) => getComputedStyle(element, "::after").content);
  expect(passBadge).toContain("TEST: OK");
  await expect(page.locator('[data-owner-verdict="ACCEPT"]')).toBeEnabled();

  await page.locator("#bearing-reset").click();
  await expect(page.locator("#bearing-status")).toHaveText("READY");
  await page.locator("#bearing-run").click();
  await expect(page.locator("#bearing-status")).toHaveText("BEARING EVIDENCE PASS", { timeout: 15_000 });
  await expect(page.locator("#owner-gate-state")).toContainText("Powtórki: 2");

  await page.locator("#owner-notes").fill("Po lewej połączone, po prawej odlatują od siebie.");
  await page.locator('[data-owner-verdict="ACCEPT"]').click();
  const report = page.locator("#owner-report");
  await expect(report).toHaveValue(/forge report integrity: PASS/);
  await expect(report).toHaveValue(/forge schema: anvil-forge-owner-gate\/v2/);
  await expect(report).toHaveValue(/forge revision: v0\.2\.1-human-owner-copy/);
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
  await expect(report).toHaveValue(/Po lewej połączone/);

  await page.locator(".owner-technical-details > summary").click();
  await expect(page.locator("#forge-build-state")).toContainText("BUILD IDENTIFIED");
  await expect(page.locator(".bearing-signal")).toContainText("source interface");
  expect(pageErrors).toEqual([]);
});

test("Forge V0.2.1 keeps a wrong-gate failure technical but blocks DZIAŁA", async ({ page }) => {
  await routeManifest(page, { ...canonicalManifest, gate: "ANVIL-01 / CUT", entryPath: "/?experiment=cut" });
  await runBearingToPass(page);
  await expect(page.locator("#forge-build-state")).toContainText("BUILD IDENTITY BLOCKED");
  await expect(page.locator("#forge-build-state")).toBeHidden();
  await expect(page.locator('[data-owner-verdict="ACCEPT"]')).toBeDisabled();
  await expect(page.locator('[data-owner-verdict="INCONCLUSIVE"]')).toBeEnabled();
  await expect(page.locator("#owner-gate-state")).toContainText("paczka albo wyniki kontroli technicznej");
});

test("Forge V0.2.1 revokes internal ACCEPT when required evidence mutates", async ({ page }) => {
  await routeManifest(page);
  await runBearingToPass(page);
  await page.locator('[data-owner-verdict="ACCEPT"]').click();
  await expect(page.locator("#owner-report")).toHaveValue(/owner verdict: ACCEPT/);

  await page.locator("#metric-relation-count").evaluate((element) => { element.textContent = "0 → 0"; });
  await expect(page.locator('[data-owner-verdict="ACCEPT"]')).toBeDisabled();
  await expect(page.locator("#owner-report")).toHaveValue("");
  await expect(page.locator("#owner-copy-report")).toBeDisabled();
  await expect(page.locator("#owner-gate-state")).toContainText("paczka albo wyniki kontroli technicznej");
  await expect(page.locator("#owner-gate-state")).toHaveAttribute("data-technical-state", /required metric mismatch: relation-count/);
});

test("Forge V0.2.1 blocks DZIAŁA for a local/unverified build", async ({ page }) => {
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
  await expect(page.locator("#forge-build-state")).toBeHidden();
  await expect(page.locator('[data-owner-verdict="ACCEPT"]')).toBeDisabled();
  await expect(page.locator('[data-owner-verdict="REJECT"]')).toBeEnabled();
  await expect(page.locator('[data-owner-verdict="REJECT"]')).toHaveText("NIE DZIAŁA");
});
