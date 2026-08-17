import "./cut-owner-gate.css";

type OwnerVerdict = "ACCEPT" | "REJECT" | "INCONCLUSIVE";

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (element === null) throw new Error(`CUT owner gate missing ${selector}`);
  return element;
}

const panel = required<HTMLElement>(".panel");
const status = required<HTMLElement>("#cut-status");
const runButton = required<HTMLButtonElement>("#cut-run");
const resetButton = required<HTMLButtonElement>("#cut-replay");
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
    "Najpierw patrz na sam moment rozdzielenia. Nie próbuj potwierdzać zielonych metryk: interesuje nas, czy coś teleportuje się, szarpie, resetuje albo po prostu wygląda fizycznie źle.";
}

const intro = document.createElement("section");
intro.className = "owner-gate-intro";
intro.innerHTML = `
  <p class="section-label">FORGE OWNER GATE · V0</p>
  <p class="owner-lead">Twój test ma być krótki: uruchom CUT, obejrzyj moment zmiany, zresetuj i powtórz kilka razy.</p>
  <ol class="owner-steps">
    <li><strong>RUN CUT</strong> — obserwuj przede wszystkim chwilę 1 → 2.</li>
    <li><strong>RESET</strong> — powtórz 2–3 razy, jeśli potrzebujesz.</li>
    <li>Na końcu wybierz swój werdykt i skopiuj gotowy raport do rozmowy.</li>
  </ol>
  <p class="owner-hint">Automatyczne PASS nie jest Twoim ACCEPT. Jeśli coś wygląda podejrzanie, odrzuć albo oznacz jako niejednoznaczne.</p>
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

const ownerState = required<HTMLElement>("#owner-gate-state");
const notes = required<HTMLTextAreaElement>("#owner-notes");
const report = required<HTMLTextAreaElement>("#owner-report");
const copyButton = required<HTMLButtonElement>("#owner-copy-report");
const copyStatus = required<HTMLElement>("#owner-copy-status");
const verdictButtons = Array.from(
  verdictSection.querySelectorAll<HTMLButtonElement>("[data-owner-verdict]"),
);

let selectedVerdict: OwnerVerdict | null = null;
let completedRuns = 0;
let countedCurrentRun = false;
let lastStatus = status.textContent?.trim() ?? "";

function metricText(id: string, fallback: string): string {
  return document.querySelector<HTMLElement>(`#metric-${id}`)?.textContent?.trim() || fallback;
}

function automatedEvidenceLabel(): string {
  const value = status.textContent?.trim() ?? "UNKNOWN";
  if (value === "CUT EVIDENCE PASS") return "PASS";
  if (value === "CUT EVIDENCE FAIL") return "FAIL";
  return value;
}

function buildReport(): string {
  const verdict = selectedVerdict ?? "NOT_SELECTED";
  const noteText = notes.value.trim() || "(brak dodatkowych uwag)";
  const viewport = `${window.innerWidth}x${window.innerHeight} @ DPR ${window.devicePixelRatio || 1}`;
  return [
    "FORGE OWNER REPORT",
    "project: PROJECT ANVIL / Physical Fabric Laboratory",
    "gate: ANVIL-01 / CUT",
    `owner verdict: ${verdict}`,
    `observed CUT runs: ${completedRuns}`,
    `automated evidence: ${automatedEvidenceLabel()}`,
    `source cells: ${metricText("source-count", "51 → 51")}`,
    `runtime bodies: ${metricText("body-count", "1 → 2")}`,
    `source add / remove: ${metricText("source-delta", "0 / 0")}`,
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

function enableVerdict(enabled: boolean): void {
  for (const button of verdictButtons) button.disabled = !enabled;
}

function syncOwnerState(): void {
  const current = status.textContent?.trim() ?? "";
  if (current === lastStatus) return;
  lastStatus = current;

  if (current === "RUNNING") {
    countedCurrentRun = false;
    enableVerdict(false);
    ownerState.textContent = "Obserwuj moment CUT — werdykt wybierz po zakończeniu.";
    clearDecision();
    return;
  }

  if (current === "CUT EVIDENCE PASS" || current === "CUT EVIDENCE FAIL") {
    if (!countedCurrentRun) {
      completedRuns += 1;
      countedCurrentRun = true;
    }
    enableVerdict(true);
    ownerState.textContent = `CUT zakończony · powtórki: ${completedRuns}. Możesz RESET i powtórzyć albo wybrać werdykt.`;
    refreshReport();
    return;
  }

  if (current === "READY") {
    enableVerdict(false);
    ownerState.textContent = completedRuns === 0 ? "Najpierw wykonaj CUT." : `Gotowe do kolejnej powtórki · wykonane: ${completedRuns}.`;
  }
}

for (const button of verdictButtons) {
  button.addEventListener("click", () => {
    const verdict = button.dataset.ownerVerdict as OwnerVerdict | undefined;
    if (verdict === undefined) return;
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
  enableVerdict(false);
});

copyButton.addEventListener("click", async () => {
  refreshReport();
  if (report.value.length === 0) return;
  try {
    await navigator.clipboard.writeText(report.value);
    copyStatus.textContent = "Skopiowane — wklej raport do rozmowy.";
  } catch {
    report.focus();
    report.select();
    copyStatus.textContent = "Nie udało się skopiować automatycznie — raport jest zaznaczony poniżej.";
  }
});

const observer = new MutationObserver(syncOwnerState);
observer.observe(status, { childList: true, characterData: true, subtree: true });
syncOwnerState();
