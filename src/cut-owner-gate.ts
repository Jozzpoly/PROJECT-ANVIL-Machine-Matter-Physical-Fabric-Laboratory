import "./cut-owner-gate.css";

type OwnerVerdict = "ACCEPT" | "REJECT" | "INCONCLUSIVE";
type ForgeProvenance = "github-actions" | "local-unverified";

interface ForgeManifest {
  readonly schema: "anvil-forge-owner-gate/v1";
  readonly project: string;
  readonly gate: string;
  readonly forgeRevision: string;
  readonly provenance: ForgeProvenance;
  readonly sourceRepository: string;
  readonly sourceSha: string;
  readonly checkoutSha: string;
  readonly sourceRef: string;
  readonly ciEvent: string;
  readonly ciRunId: string;
  readonly ciRunAttempt: string;
  readonly artifactName: string;
  readonly builtAt: string;
}

const EXPECTED_METRICS = {
  "source-count": "51 → 51",
  "body-count": "1 → 2",
  "source-delta": "0 / 0",
} as const;
const REQUIRED_GATES = [
  "identity",
  "topology",
  "sensitivity",
  "mass",
  "pose",
  "rigid-field",
  "momentum",
  "post-step",
] as const;

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (element === null) throw new Error(`CUT owner gate missing ${selector}`);
  return element;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function parseManifest(value: unknown): ForgeManifest {
  if (!isRecord(value)) throw new Error("forge-gate.json is not an object");
  const schema = readString(value, "schema");
  const project = readString(value, "project");
  const gate = readString(value, "gate");
  const forgeRevision = readString(value, "forgeRevision");
  const provenance = readString(value, "provenance");
  const sourceRepository = readString(value, "sourceRepository");
  const sourceSha = readString(value, "sourceSha");
  const checkoutSha = readString(value, "checkoutSha");
  const sourceRef = readString(value, "sourceRef");
  const ciEvent = readString(value, "ciEvent");
  const ciRunId = readString(value, "ciRunId");
  const ciRunAttempt = readString(value, "ciRunAttempt");
  const artifactName = readString(value, "artifactName");
  const builtAt = readString(value, "builtAt");

  if (schema !== "anvil-forge-owner-gate/v1") throw new Error(`unsupported Forge schema: ${schema ?? "missing"}`);
  if (project !== "PROJECT ANVIL / Physical Fabric Laboratory") throw new Error("unexpected Forge project identity");
  if (gate !== "ANVIL-01 / CUT") throw new Error("unexpected Forge gate identity");
  if (provenance !== "github-actions" && provenance !== "local-unverified") throw new Error("invalid Forge provenance");
  if (
    forgeRevision === null || sourceRepository === null || sourceSha === null || checkoutSha === null || sourceRef === null ||
    ciEvent === null || ciRunId === null || ciRunAttempt === null || artifactName === null || builtAt === null
  ) throw new Error("Forge manifest is missing required identity fields");
  if (provenance === "github-actions") {
    if (!/^[0-9a-f]{40}$/i.test(sourceSha)) throw new Error("Forge source SHA is not an exact 40-hex commit");
    if (!/^[0-9a-f]{40}$/i.test(checkoutSha)) throw new Error("Forge checkout SHA is not an exact 40-hex commit");
    if (!/^\d+$/.test(ciRunId) || !/^\d+$/.test(ciRunAttempt)) throw new Error("Forge CI run identity is invalid");
    if (sourceRepository !== "Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory") {
      throw new Error("Forge source repository does not match PROJECT ANVIL");
    }
  }

  return {
    schema,
    project,
    gate,
    forgeRevision,
    provenance,
    sourceRepository,
    sourceSha,
    checkoutSha,
    sourceRef,
    ciEvent,
    ciRunId,
    ciRunAttempt,
    artifactName,
    builtAt,
  };
}

const panel = required<HTMLElement>(".panel");
const status = required<HTMLElement>("#cut-status");
const runButton = required<HTMLButtonElement>("#cut-run");
const resetButton = required<HTMLButtonElement>("#cut-replay");
const metricsElement = required<HTMLElement>("#cut-metrics");
const gatesElement = required<HTMLElement>("#cut-gates");
const originalSections = Array.from(panel.children).filter(
  (element): element is HTMLElement => element instanceof HTMLElement && element.tagName === "SECTION",
);
const transactionSection = originalSections[0];
if (transactionSection === undefined) throw new Error("CUT owner gate missing transaction section");

const transactionLabel = transactionSection.querySelector<HTMLElement>(".section-label");
if (transactionLabel !== null) transactionLabel.textContent = "OWNER TEST";
const transactionNote = transactionSection.querySelector<HTMLElement>(".note");
if (transactionNote !== null) {
  transactionNote.textContent =
    "Najpierw patrz na sam moment rozdzielenia. Nie próbuj potwierdzać zielonych metryk: interesuje nas, czy coś teleportuje się, szarpie, resetuje albo wygląda fizycznie źle.";
}

const intro = document.createElement("section");
intro.className = "owner-gate-intro";
intro.innerHTML = `
  <p class="section-label">FORGE OWNER GATE · V0.1 FIELD TRIAL</p>
  <p class="owner-lead">Krótka pętla: uruchom CUT, obejrzyj moment zmiany, zresetuj i powtórz tylko tyle razy, ile potrzebujesz do decyzji.</p>
  <ol class="owner-steps">
    <li><strong>RUN CUT</strong> — obserwuj przede wszystkim chwilę 1 → 2.</li>
    <li><strong>RESET</strong> — powtórz, jeśli chcesz sprawdzić ciągłość jeszcze raz.</li>
    <li>Wybierz werdykt i skopiuj raport. Forge dołączy tożsamość builda i evidence; agent sprawdzi ją potem live na GitHub.</li>
  </ol>
  <p class="owner-hint">Automatyczne PASS nie jest Twoim ACCEPT. Forge zablokuje ACCEPT, jeżeli build albo wymagane evidence są niepełne.</p>
  <p id="forge-build-state" class="forge-build-state">BUILD IDENTITY · READING…</p>
`;
panel.insertBefore(intro, transactionSection);

const verdictSection = document.createElement("section");
verdictSection.className = "owner-verdict";
verdictSection.innerHTML = `
  <p class="section-label">TWÓJ WERDYKT</p>
  <p id="owner-gate-state" class="owner-gate-state">Najpierw wykonaj CUT.</p>
  <div class="owner-verdict-row" role="group" aria-label="Owner verdict">
    <button type="button" data-owner-verdict="ACCEPT" disabled>ACCEPT</button>
    <button type="button" data-owner-verdict="REJECT" disabled>REJECT</button>
    <button type="button" data-owner-verdict="INCONCLUSIVE" disabled>INCONCLUSIVE</button>
  </div>
  <label class="owner-notes-label" for="owner-notes">Krótka uwaga — tylko jeśli masz coś do dodania</label>
  <textarea id="owner-notes" class="owner-notes" placeholder="np. przy podziale prawa część wygląda jakby lekko przeskakiwała"></textarea>
  <textarea id="owner-report" class="owner-report" readonly aria-label="Owner report" placeholder="Po wybraniu werdyktu tutaj pojawi się gotowy raport."></textarea>
  <div class="owner-copy-row">
    <button type="button" id="owner-copy-report" disabled>KOPIUJ RAPORT DO GPT</button>
    <span id="owner-copy-status" class="owner-copy-status" aria-live="polite"></span>
  </div>
`;
transactionSection.insertAdjacentElement("afterend", verdictSection);

const technicalDetails = document.createElement("details");
technicalDetails.className = "owner-technical-details";
technicalDetails.innerHTML = `<summary>TECHNICZNE EVIDENCE — opcjonalne</summary>`;
for (const section of originalSections.slice(1)) technicalDetails.append(section);
verdictSection.insertAdjacentElement("afterend", technicalDetails);

const buildState = required<HTMLElement>("#forge-build-state");
const ownerState = required<HTMLElement>("#owner-gate-state");
const notes = required<HTMLTextAreaElement>("#owner-notes");
const report = required<HTMLTextAreaElement>("#owner-report");
const copyButton = required<HTMLButtonElement>("#owner-copy-report");
const copyStatus = required<HTMLElement>("#owner-copy-status");
const verdictButtons = Array.from(verdictSection.querySelectorAll<HTMLButtonElement>("[data-owner-verdict]"));
const acceptButton = required<HTMLButtonElement>('[data-owner-verdict="ACCEPT"]');

let selectedVerdict: OwnerVerdict | null = null;
let completedRuns = 0;
let countedCurrentRun = false;
let lastStatus = status.textContent?.trim() ?? "";
let manifest: ForgeManifest | null = null;
let manifestError: string | null = "manifest not loaded";
const sessionId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `session-${Date.now()}`;

function metricText(id: string): string | null {
  const elements = metricsElement.querySelectorAll<HTMLElement>(`[id="metric-${id}"]`);
  if (elements.length !== 1) return null;
  const text = elements[0]?.textContent?.trim();
  return text && text.length > 0 ? text : null;
}

function gatePass(id: string): boolean | null {
  const elements = gatesElement.querySelectorAll<HTMLElement>(`[data-gate="${id}"]`);
  if (elements.length !== 1) return null;
  const value = elements[0]?.dataset.pass;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function automatedEvidenceLabel(): string {
  const value = status.textContent?.trim() ?? "UNKNOWN";
  if (value === "CUT EVIDENCE PASS") return "PASS";
  if (value === "CUT EVIDENCE FAIL") return "FAIL";
  return value || "UNKNOWN";
}

function forgeIssues(): string[] {
  const issues: string[] = [];
  if (manifest === null) issues.push(`embedded provenance unavailable: ${manifestError ?? "unknown error"}`);
  else if (manifest.provenance !== "github-actions") issues.push("embedded provenance is local/unverified, not a canonical GitHub Actions claim");

  const terminal = automatedEvidenceLabel();
  if (terminal === "PASS" || terminal === "FAIL") {
    for (const [id, expected] of Object.entries(EXPECTED_METRICS)) {
      const actual = metricText(id);
      if (actual === null) issues.push(`missing or duplicate required metric: ${id}`);
      else if (actual !== expected) issues.push(`required metric mismatch: ${id} = ${actual}; expected ${expected}`);
    }

    const gateRows = gatesElement.querySelectorAll<HTMLElement>("[data-gate]");
    if (gateRows.length !== REQUIRED_GATES.length) {
      issues.push(`required gate set size mismatch: ${gateRows.length}; expected ${REQUIRED_GATES.length}`);
    }
    for (const id of REQUIRED_GATES) {
      const pass = gatePass(id);
      if (pass === null) issues.push(`missing, duplicate or invalid required gate: ${id}`);
      else if (terminal === "PASS" && !pass) issues.push(`status says PASS but gate failed: ${id}`);
    }
  }
  return issues;
}

function canonicalAcceptAllowed(): boolean {
  return automatedEvidenceLabel() === "PASS" && forgeIssues().length === 0;
}

function buildReport(): string {
  const verdict = selectedVerdict ?? "NOT_SELECTED";
  const noteText = notes.value.trim() || "(brak dodatkowych uwag)";
  const viewport = `${window.innerWidth}x${window.innerHeight} @ DPR ${window.devicePixelRatio || 1}`;
  const issues = forgeIssues();
  const passedGates = REQUIRED_GATES.filter((id) => gatePass(id) === true).length;
  return [
    "FORGE OWNER REPORT",
    `forge report integrity: ${issues.length === 0 ? "PASS" : "FAIL"}`,
    `forge issues: ${issues.length === 0 ? "none" : issues.join(" | ")}`,
    `forge schema: ${manifest?.schema ?? "UNAVAILABLE"}`,
    `forge revision: ${manifest?.forgeRevision ?? "UNAVAILABLE"}`,
    `session id: ${sessionId}`,
    `project: ${manifest?.project ?? "PROJECT ANVIL / Physical Fabric Laboratory"}`,
    `gate: ${manifest?.gate ?? "ANVIL-01 / CUT"}`,
    `source repository: ${manifest?.sourceRepository ?? "UNAVAILABLE"}`,
    `source sha: ${manifest?.sourceSha ?? "UNAVAILABLE"}`,
    `checkout sha: ${manifest?.checkoutSha ?? "UNAVAILABLE"}`,
    `source ref: ${manifest?.sourceRef ?? "UNAVAILABLE"}`,
    `ci event: ${manifest?.ciEvent ?? "UNAVAILABLE"}`,
    `ci run: ${manifest === null ? "UNAVAILABLE" : `${manifest.ciRunId} attempt ${manifest.ciRunAttempt}`}`,
    `artifact: ${manifest?.artifactName ?? "UNAVAILABLE"}`,
    `embedded provenance: ${manifest?.provenance ?? "UNAVAILABLE"}`,
    "external provenance check: REQUIRED AFTER HANDOFF",
    `built at: ${manifest?.builtAt ?? "UNAVAILABLE"}`,
    `owner verdict: ${verdict}`,
    `observed CUT runs: ${completedRuns}`,
    `automated evidence: ${automatedEvidenceLabel()}`,
    `automated gates: ${passedGates}/${REQUIRED_GATES.length} PASS`,
    `source cells: ${metricText("source-count") ?? "UNAVAILABLE"}`,
    `runtime bodies: ${metricText("body-count") ?? "UNAVAILABLE"}`,
    `source add / remove: ${metricText("source-delta") ?? "UNAVAILABLE"}`,
    `viewport: ${viewport}`,
    `browser: ${navigator.userAgent}`,
    `timestamp: ${new Date().toISOString()}`,
    "notes:",
    noteText,
  ].join("\n");
}

function refreshReport(): void {
  if (selectedVerdict === null) {
    report.value = "";
    copyButton.disabled = true;
    return;
  }
  report.value = buildReport();
  copyButton.disabled = false;
}

function clearDecision(): void {
  selectedVerdict = null;
  copyStatus.textContent = "";
  for (const button of verdictButtons) button.classList.remove("selected");
  refreshReport();
}

function refreshDecisionAvailability(): void {
  const terminal = automatedEvidenceLabel();
  const finished = terminal === "PASS" || terminal === "FAIL";
  const acceptAllowed = canonicalAcceptAllowed();
  for (const button of verdictButtons) button.disabled = !finished;
  if (!acceptAllowed) acceptButton.disabled = true;

  if (selectedVerdict === "ACCEPT" && !acceptAllowed) {
    clearDecision();
    copyStatus.textContent = "Poprzedni ACCEPT anulowany, bo wymagane evidence przestało być kompletne/spójne.";
  }

  if (!finished) return;
  const issues = forgeIssues();
  if (terminal === "FAIL") ownerState.textContent = `CUT zakończył się FAIL · powtórki: ${completedRuns}. ACCEPT jest zablokowany.`;
  else if (issues.length > 0) ownerState.textContent = `CUT zakończony · Forge blokuje ACCEPT: ${issues[0]}`;
  else ownerState.textContent = `CUT zakończony · powtórki: ${completedRuns}. Możesz RESET i powtórzyć albo wybrać werdykt.`;
}

function syncOwnerState(): void {
  const current = status.textContent?.trim() ?? "";
  if (current !== lastStatus) {
    lastStatus = current;
    if (current === "RUNNING") {
      countedCurrentRun = false;
      ownerState.textContent = "Obserwuj moment CUT — werdykt wybierz po zakończeniu.";
      clearDecision();
    } else if (current === "CUT EVIDENCE PASS" || current === "CUT EVIDENCE FAIL") {
      if (!countedCurrentRun) {
        completedRuns += 1;
        countedCurrentRun = true;
      }
    } else if (current === "READY") {
      ownerState.textContent = completedRuns === 0 ? "Najpierw wykonaj CUT." : `Gotowe do kolejnej powtórki · wykonane: ${completedRuns}.`;
    }
  }
  refreshDecisionAvailability();
  refreshReport();
}

for (const button of verdictButtons) {
  button.addEventListener("click", () => {
    const verdict = button.dataset.ownerVerdict as OwnerVerdict | undefined;
    if (verdict === undefined) return;
    if (verdict === "ACCEPT" && !canonicalAcceptAllowed()) {
      ownerState.textContent = `ACCEPT zablokowany: ${forgeIssues()[0] ?? "automated evidence is not PASS"}`;
      return;
    }
    selectedVerdict = verdict;
    for (const candidate of verdictButtons) candidate.classList.toggle("selected", candidate === button);
    copyStatus.textContent = "";
    refreshReport();
  });
}

notes.addEventListener("input", refreshReport);
runButton.addEventListener("click", () => {
  countedCurrentRun = false;
  clearDecision();
});
resetButton.addEventListener("click", () => {
  clearDecision();
  for (const button of verdictButtons) button.disabled = true;
});

copyButton.addEventListener("click", async () => {
  refreshReport();
  if (report.value.length === 0) return;
  try {
    await navigator.clipboard.writeText(report.value);
    copyStatus.textContent = "Skopiowane — wklej raport do rozmowy; agent sprawdzi build/run live na GitHub.";
  } catch {
    report.focus();
    report.select();
    copyStatus.textContent = "Nie udało się skopiować automatycznie — raport jest zaznaczony poniżej.";
  }
});

const statusObserver = new MutationObserver(syncOwnerState);
statusObserver.observe(status, { childList: true, characterData: true, subtree: true });
const evidenceObserver = new MutationObserver(syncOwnerState);
evidenceObserver.observe(metricsElement, { childList: true, characterData: true, subtree: true, attributes: true });
evidenceObserver.observe(gatesElement, { childList: true, characterData: true, subtree: true, attributes: true });

void (async () => {
  try {
    const response = await fetch("./forge-gate.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    manifest = parseManifest(await response.json());
    manifestError = null;
    if (manifest.provenance === "github-actions") {
      buildState.textContent = `BUILD IDENTIFIED · ${manifest.sourceSha.slice(0, 12)} · RUN ${manifest.ciRunId} · external check after report`;
      buildState.classList.add("identified");
    } else {
      buildState.textContent = "BUILD UNVERIFIED · local build · ACCEPT disabled";
      buildState.classList.add("blocked");
    }
  } catch (error: unknown) {
    manifest = null;
    manifestError = error instanceof Error ? error.message : String(error);
    buildState.textContent = `BUILD IDENTITY BLOCKED · ${manifestError}`;
    buildState.classList.add("blocked");
  }
  syncOwnerState();
})();

syncOwnerState();
