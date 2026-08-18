export {};

type OwnerVerdict = "ACCEPT" | "REJECT" | "INCONCLUSIVE";
type ForgeProvenance = "github-actions" | "local-unverified";

interface ForgeManifestV2 {
  readonly schema: "anvil-forge-owner-gate/v2";
  readonly project: string;
  readonly gate: string;
  readonly entryPath: string;
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

const EXPECTED_PROJECT = "PROJECT ANVIL / Physical Fabric Laboratory";
const EXPECTED_REPOSITORY = "Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory";
const EXPECTED_GATE = "ANVIL-03 / REBIND";
const EXPECTED_ENTRY = "/?experiment=rebind";
const EXPECTED_TEXT_METRICS = {
  "rebind-source": "7 → 7",
  "rebind-bodies": "2 → 3",
  "rebind-bearing": "1 → 1",
  "rebind-body-id": "body:a:0 → body:a:2",
} as const;
const REQUIRED_NUMERIC_METRICS = [
  "rebind-position-jump",
  "rebind-velocity-jump",
  "rebind-momentum",
  "rebind-gap",
  "rebind-control",
  "rebind-angle",
] as const;
const REQUIRED_GATES = [
  "identity",
  "topology",
  "rebind",
  "position",
  "velocity",
  "momentum",
  "transaction",
  "final",
  "control",
  "rotation",
  "finite",
] as const;

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (element === null) throw new Error(`REBIND owner gate missing ${selector}`);
  return element;
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function parseManifest(value: unknown): ForgeManifestV2 {
  if (!isRecord(value)) throw new Error("forge-gate.json is not an object");
  const schema = readString(value, "schema");
  const project = readString(value, "project");
  const gate = readString(value, "gate");
  const entryPath = readString(value, "entryPath");
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

  if (schema !== "anvil-forge-owner-gate/v2") throw new Error(`unsupported Forge schema: ${schema ?? "missing"}`);
  if (project !== EXPECTED_PROJECT) throw new Error("unexpected Forge project identity");
  if (gate !== EXPECTED_GATE) throw new Error(`unexpected Forge gate identity: ${gate ?? "missing"}`);
  if (entryPath !== EXPECTED_ENTRY) throw new Error(`unexpected Forge entry path: ${entryPath ?? "missing"}`);
  if (provenance !== "github-actions" && provenance !== "local-unverified") throw new Error("invalid Forge provenance");
  if (
    forgeRevision === null || sourceRepository === null || sourceSha === null || checkoutSha === null || sourceRef === null ||
    ciEvent === null || ciRunId === null || ciRunAttempt === null || artifactName === null || builtAt === null
  ) throw new Error("Forge manifest is missing required identity fields");
  if (provenance === "github-actions") {
    if (sourceRepository !== EXPECTED_REPOSITORY) throw new Error("Forge source repository does not match PROJECT ANVIL");
    if (!/^[0-9a-f]{40}$/iu.test(sourceSha)) throw new Error("Forge source SHA is not an exact 40-hex commit");
    if (!/^[0-9a-f]{40}$/iu.test(checkoutSha)) throw new Error("Forge checkout SHA is not an exact 40-hex commit");
    if (!/^\d+$/u.test(ciRunId) || !/^\d+$/u.test(ciRunAttempt)) throw new Error("Forge CI run identity is invalid");
  }
  return {
    schema,
    project,
    gate,
    entryPath,
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

const panel = required<HTMLElement>(".rebind-panel");
const status = required<HTMLElement>("#rebind-status");
const runButton = required<HTMLButtonElement>("#rebind-run");
const resetButton = required<HTMLButtonElement>("#rebind-reset");
const metricsElement = required<HTMLElement>("#rebind-metrics");
const gatesElement = required<HTMLElement>("#rebind-gates");
const technicalDetails = required<HTMLDetailsElement>(".rebind-technical-details");
const firstSection = panel.querySelector<HTMLElement>(":scope > section");
if (firstSection === null) throw new Error("REBIND owner gate missing primary test section");

const headings = Array.from(document.querySelectorAll<HTMLElement>(".viewport-head > div"));
if (headings.length === 2) {
  const leftStrong = headings[0]?.querySelector("strong");
  const leftSpan = headings[0]?.querySelector("span");
  const rightStrong = headings[1]?.querySelector("strong");
  const rightSpan = headings[1]?.querySelector("span");
  if (leftStrong !== null && leftStrong !== undefined) leftStrong.textContent = "PO LEWEJ: POŁĄCZENIE WRACA";
  if (leftSpan !== null && leftSpan !== undefined) leftSpan.textContent = "po podziale zielony punkt ma nadal trzymać właściwy kawałek";
  if (rightStrong !== null && rightStrong !== undefined) rightStrong.textContent = "PO PRAWEJ: BRAK POŁĄCZENIA";
  if (rightSpan !== null && rightSpan !== undefined) rightSpan.textContent = "po podziale czerwone punkty powinny się od siebie oddalić";
}
const captions = Array.from(document.querySelectorAll<HTMLElement>(".rebind-stage figcaption"));
if (captions.length === 2) {
  captions[0]!.innerHTML = "POŁĄCZENIE WRACA <span>zielony punkt zostaje na właściwym kawałku</span>";
  captions[1]!.innerHTML = "BRAK POŁĄCZENIA <span>czerwone punkty rozjeżdżają się</span>";
}
const transaction = document.querySelector<HTMLElement>(".rebind-transaction");
if (transaction !== null) {
  transaction.innerHTML = `<span>PRZED PODZIAŁEM<br><strong>2 kawałki + połączenie</strong></span><span class="rebind-arrow">→ PODZIAŁ →</span><span>PO PODZIALE<br><strong>3 kawałki + to samo połączenie</strong></span>`;
}
const boundaryText = panel.querySelector<HTMLElement>(".boundary .rebind-note");
if (boundaryText !== null) {
  boundaryText.textContent = "Sprawdzamy, czy po przebudowie fizyki program potrafi znaleźć ten sam punkt połączenia na właściwym nowym kawałku. Nie musisz rozumieć, jak robi to pod spodem.";
}

const buildState = document.createElement("p");
buildState.id = "rebind-forge-build-state";
buildState.className = "forge-build-state";
buildState.textContent = "BUILD IDENTITY · READING…";
const techBody = required<HTMLElement>(".rebind-tech-body");
techBody.insertBefore(buildState, techBody.firstChild);

const verdictSection = document.createElement("section");
verdictSection.className = "owner-verdict rebind-owner-verdict";
verdictSection.innerHTML = `
  <p class="section-label">CZY TO DZIAŁA?</p>
  <p id="rebind-owner-state" class="owner-gate-state">Najpierw kliknij „URUCHOM TEST”.</p>
  <div class="owner-verdict-row" role="group" aria-label="Twoja ocena testu">
    <button type="button" data-owner-verdict="ACCEPT" disabled>DZIAŁA</button>
    <button type="button" data-owner-verdict="REJECT" disabled>NIE DZIAŁA</button>
    <button type="button" data-owner-verdict="INCONCLUSIVE" disabled>NIE WIEM</button>
  </div>
  <label class="owner-notes-label" for="rebind-owner-notes">Jeśli chcesz, napisz krótko co zauważyłeś</label>
  <textarea id="rebind-owner-notes" class="owner-notes" placeholder="np. po lewej zielone połączenie zostało, po prawej czerwone punkty odleciały"></textarea>
  <p class="note owner-report-human-hint">Raport jest dla GPT. Nie musisz go czytać — po wybraniu odpowiedzi po prostu go skopiuj.</p>
  <div class="owner-copy-row">
    <button type="button" id="rebind-owner-copy" disabled>SKOPIUJ RAPORT DLA GPT</button>
    <span id="rebind-owner-copy-status" class="owner-copy-status" aria-live="polite"></span>
  </div>
  <details class="rebind-owner-report-details">
    <summary>Raport dla GPT — nie musisz tego czytać</summary>
    <textarea id="rebind-owner-report" class="owner-report" readonly aria-label="Raport dla GPT"></textarea>
  </details>
`;
firstSection.insertAdjacentElement("afterend", verdictSection);

const ownerState = required<HTMLElement>("#rebind-owner-state");
const notes = required<HTMLTextAreaElement>("#rebind-owner-notes");
const report = required<HTMLTextAreaElement>("#rebind-owner-report");
const copyButton = required<HTMLButtonElement>("#rebind-owner-copy");
const copyStatus = required<HTMLElement>("#rebind-owner-copy-status");
const verdictButtons = Array.from(verdictSection.querySelectorAll<HTMLButtonElement>("[data-owner-verdict]"));
const acceptButton = required<HTMLButtonElement>('[data-owner-verdict="ACCEPT"]');

let manifest: ForgeManifestV2 | null = null;
let manifestError: string | null = "manifest not loaded";
let selectedVerdict: OwnerVerdict | null = null;
let completedRuns = 0;
let countedCurrentRun = false;
const sessionId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `session-${Date.now()}`;

function metricElement(id: string): HTMLElement | null {
  const elements = metricsElement.querySelectorAll<HTMLElement>(`[id="metric-${id}"]`);
  return elements.length === 1 ? elements[0] ?? null : null;
}
function metricText(id: string): string | null {
  const value = metricElement(id)?.textContent?.trim();
  return value && value.length > 0 ? value : null;
}
function metricNumber(id: string): number | null {
  const raw = metricElement(id)?.dataset.value;
  if (raw === undefined) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
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
  const state = status.dataset.state ?? "UNKNOWN";
  if (state === "PASS") return "PASS";
  if (state === "FAIL") return "FAIL";
  return state;
}
function forgeIssues(): string[] {
  const issues: string[] = [];
  if (manifest === null) issues.push(`embedded provenance unavailable: ${manifestError ?? "unknown error"}`);
  else if (manifest.provenance !== "github-actions") issues.push("embedded provenance is local/unverified, not a canonical GitHub Actions claim");

  const terminal = automatedEvidenceLabel();
  if (terminal === "PASS" || terminal === "FAIL") {
    for (const [id, expected] of Object.entries(EXPECTED_TEXT_METRICS)) {
      const actual = metricText(id);
      if (actual === null) issues.push(`missing or duplicate required metric: ${id}`);
      else if (actual !== expected) issues.push(`required metric mismatch: ${id} = ${actual}; expected ${expected}`);
    }
    for (const id of REQUIRED_NUMERIC_METRICS) {
      if (metricNumber(id) === null) issues.push(`missing, duplicate or non-finite numeric metric: ${id}`);
    }

    const position = metricNumber("rebind-position-jump");
    const velocity = metricNumber("rebind-velocity-jump");
    const momentum = metricNumber("rebind-momentum");
    const gap = metricNumber("rebind-gap");
    const control = metricNumber("rebind-control");
    const angle = metricNumber("rebind-angle");
    if (position !== null && position > 0.00007) issues.push(`anchor position jump exceeds gate: ${position}`);
    if (velocity !== null && velocity > 0.00007) issues.push(`anchor velocity jump exceeds gate: ${velocity}`);
    if (momentum !== null && momentum > 0.75) issues.push(`linear momentum error exceeds gate: ${momentum}`);
    if (gap !== null && gap > 0.0025) issues.push(`final bearing gap exceeds gate: ${gap}`);
    if (control !== null && control < 0.25) issues.push(`no-relation control gap is not discriminating: ${control}`);
    if (angle !== null && Math.abs(angle) < 0.35) issues.push(`relative bearing angle is not discriminating: ${angle}`);

    const gateRows = gatesElement.querySelectorAll<HTMLElement>("[data-gate]");
    if (gateRows.length !== REQUIRED_GATES.length) issues.push(`required gate set size mismatch: ${gateRows.length}; expected ${REQUIRED_GATES.length}`);
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
function passedGateCount(): number {
  return REQUIRED_GATES.filter((id) => gatePass(id) === true).length;
}
function buildReport(): string {
  const verdict = selectedVerdict ?? "NOT_SELECTED";
  const issues = forgeIssues();
  const noteText = notes.value.trim() || "(brak dodatkowych uwag)";
  return [
    "FORGE OWNER REPORT",
    `forge report integrity: ${issues.length === 0 ? "PASS" : "FAIL"}`,
    `forge issues: ${issues.length === 0 ? "none" : issues.join(" | ")}`,
    `forge schema: ${manifest?.schema ?? "UNAVAILABLE"}`,
    `forge revision: ${manifest?.forgeRevision ?? "UNAVAILABLE"}`,
    `session id: ${sessionId}`,
    `project: ${manifest?.project ?? EXPECTED_PROJECT}`,
    `gate: ${manifest?.gate ?? EXPECTED_GATE}`,
    `entry path: ${manifest?.entryPath ?? "UNAVAILABLE"}`,
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
    `observed REBIND runs: ${completedRuns}`,
    `automated evidence: ${automatedEvidenceLabel()}`,
    `automated gates: ${passedGateCount()}/${REQUIRED_GATES.length} PASS`,
    `source cells: ${metricText("rebind-source") ?? "UNAVAILABLE"}`,
    `runtime bodies: ${metricText("rebind-bodies") ?? "UNAVAILABLE"}`,
    `source bearing: ${metricText("rebind-bearing") ?? "UNAVAILABLE"}`,
    `endpoint runtime body: ${metricText("rebind-body-id") ?? "UNAVAILABLE"}`,
    `max anchor position jump: ${metricText("rebind-position-jump") ?? "UNAVAILABLE"}`,
    `max anchor velocity jump: ${metricText("rebind-velocity-jump") ?? "UNAVAILABLE"}`,
    `linear momentum error: ${metricText("rebind-momentum") ?? "UNAVAILABLE"}`,
    `final bearing gap: ${metricText("rebind-gap") ?? "UNAVAILABLE"}`,
    `no-relation control gap: ${metricText("rebind-control") ?? "UNAVAILABLE"}`,
    `relative bearing angle: ${metricText("rebind-angle") ?? "UNAVAILABLE"}`,
    `viewport: ${window.innerWidth}x${window.innerHeight} @ DPR ${window.devicePixelRatio || 1}`,
    `browser: ${navigator.userAgent}`,
    `timestamp: ${new Date().toISOString()}`,
    "notes:",
    noteText,
  ].join("\n");
}

function refreshBuildState(): void {
  buildState.classList.remove("identified", "blocked");
  if (manifest === null) {
    buildState.textContent = `BUILD IDENTITY BLOCKED · ${manifestError ?? "manifest unavailable"}`;
    buildState.classList.add("blocked");
    return;
  }
  if (manifest.provenance !== "github-actions") {
    buildState.textContent = `BUILD UNVERIFIED · ${manifest.gate} · ${manifest.entryPath}`;
    buildState.classList.add("blocked");
    return;
  }
  buildState.textContent = `BUILD IDENTIFIED · ${manifest.sourceSha.slice(0, 12)} · RUN ${manifest.ciRunId} · ${manifest.gate}`;
  buildState.classList.add("identified");
}
function clearDecision(message = ""): void {
  selectedVerdict = null;
  report.value = "";
  copyButton.disabled = true;
  copyStatus.textContent = message;
  for (const button of verdictButtons) button.classList.remove("selected");
}
function refreshOwnerControls(): void {
  const state = automatedEvidenceLabel();
  const terminal = state === "PASS" || state === "FAIL";
  const acceptAllowed = canonicalAcceptAllowed();
  for (const button of verdictButtons) {
    const verdict = button.dataset.ownerVerdict as OwnerVerdict | undefined;
    button.disabled = !terminal || (verdict === "ACCEPT" && !acceptAllowed);
  }

  if (selectedVerdict === "ACCEPT" && !acceptAllowed) {
    clearDecision("Poprzednie „DZIAŁA” zostało cofnięte, bo kontrola techniczna przestała być spójna.");
  }
  if (!terminal) {
    ownerState.textContent = state === "RUNNING" ? "Patrz na oba okna. Odpowiedź wybierzesz po zakończeniu." : "Najpierw kliknij „URUCHOM TEST”.";
  } else if (state === "PASS" && acceptAllowed) {
    ownerState.textContent = `Test zakończony. Powtórki: ${completedRuns}. Jeśli po lewej połączenie zostało, a po prawej się rozjechało — wybierz „DZIAŁA”.`;
  } else if (state === "PASS") {
    ownerState.textContent = "Ruch wygląda na zakończony, ale kontrola techniczna paczki wykryła problem. Nie wybieraj „DZIAŁA”; możesz powtórzyć test albo wybrać „NIE DZIAŁA” / „NIE WIEM”.";
  } else {
    ownerState.textContent = "Automatyczna kontrola wykryła problem. Możesz powtórzyć test albo wybrać „NIE DZIAŁA” / „NIE WIEM”.";
  }
}
function updateRunCounter(): void {
  const state = status.dataset.state ?? "UNKNOWN";
  if ((state === "PASS" || state === "FAIL") && !countedCurrentRun) {
    completedRuns += 1;
    countedCurrentRun = true;
  }
  if (state === "READY") countedCurrentRun = false;
}
function reconcile(): void {
  updateRunCounter();
  refreshBuildState();
  refreshOwnerControls();
  if (selectedVerdict !== null) {
    report.value = buildReport();
    copyButton.disabled = false;
  }
}

for (const button of verdictButtons) {
  button.addEventListener("click", () => {
    const verdict = button.dataset.ownerVerdict as OwnerVerdict | undefined;
    if (verdict === undefined) return;
    if (verdict === "ACCEPT" && !canonicalAcceptAllowed()) return;
    selectedVerdict = verdict;
    for (const candidate of verdictButtons) candidate.classList.toggle("selected", candidate === button);
    report.value = buildReport();
    copyButton.disabled = false;
    copyStatus.textContent = "Gotowe. Skopiuj raport i wklej go do rozmowy ze mną.";
  });
}
notes.addEventListener("input", () => {
  if (selectedVerdict !== null) report.value = buildReport();
});
runButton.addEventListener("click", () => {
  clearDecision();
  ownerState.textContent = "Patrz na oba okna. Odpowiedź wybierzesz po zakończeniu.";
});
resetButton.addEventListener("click", () => {
  clearDecision();
  ownerState.textContent = `Gotowe do powtórki. Wykonane testy: ${completedRuns}.`;
});
copyButton.addEventListener("click", async () => {
  if (report.value.length === 0) return;
  try {
    await navigator.clipboard.writeText(report.value);
    copyStatus.textContent = "Skopiowane. Wklej raport do rozmowy ze mną — resztą zajmę się ja.";
  } catch {
    const details = required<HTMLDetailsElement>(".rebind-owner-report-details");
    details.open = true;
    report.focus();
    report.select();
    copyStatus.textContent = "Nie udało się skopiować automatycznie. Raport poniżej jest zaznaczony — skopiuj go ręcznie.";
  }
});

new MutationObserver(reconcile).observe(status, { attributes: true, attributeFilter: ["data-state"], childList: true });
new MutationObserver(reconcile).observe(metricsElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-value"] });
new MutationObserver(reconcile).observe(gatesElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-pass"] });

void (async () => {
  try {
    const response = await fetch("./forge-gate.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    manifest = parseManifest(await response.json());
    manifestError = null;
  } catch (error: unknown) {
    manifest = null;
    manifestError = error instanceof Error ? error.message : String(error);
  }
  reconcile();
})();

technicalDetails.dataset.ownerGate = "forge-v0.2.1";
reconcile();
