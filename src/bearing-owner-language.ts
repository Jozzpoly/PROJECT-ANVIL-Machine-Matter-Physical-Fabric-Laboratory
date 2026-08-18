export {};

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (element === null) throw new Error(`BEARING human owner copy missing ${selector}`);
  return element;
}

function replaceText(element: Element, text: string): void {
  element.textContent = text;
}

const subtitle = required<HTMLElement>(".subtitle");
replaceText(subtitle, "Sprawdzamy, czy dwa kawałki mogą zostać połączone i swobodnie obracać się wokół jednego punktu.");

const viewportHead = required<HTMLElement>(".viewport-head");
const viewportColumns = Array.from(viewportHead.children);
const leftHead = viewportColumns[0];
const rightHead = viewportColumns[1];
if (!(leftHead instanceof HTMLElement) || !(rightHead instanceof HTMLElement)) {
  throw new Error("BEARING human owner copy missing comparison headings");
}
const leftHeadStrong = leftHead.querySelector("strong");
const leftHeadSpan = leftHead.querySelector("span");
const rightHeadStrong = rightHead.querySelector("strong");
const rightHeadSpan = rightHead.querySelector("span");
if (leftHeadStrong === null || leftHeadSpan === null || rightHeadStrong === null || rightHeadSpan === null) {
  throw new Error("BEARING human owner copy missing comparison heading text");
}
replaceText(leftHeadStrong, "PO LEWEJ: Z POŁĄCZENIEM");
replaceText(leftHeadSpan, "zielony punkt powinien trzymać oba kawałki razem");
replaceText(rightHeadStrong, "PO PRAWEJ: BEZ POŁĄCZENIA");
replaceText(rightHeadSpan, "czerwone punkty powinny się od siebie oddalić");

const stageCaptions = Array.from(document.querySelectorAll<HTMLElement>(".bearing-stage figcaption"));
if (stageCaptions.length !== 2) throw new Error("BEARING human owner copy expected two comparison captions");
stageCaptions[0]!.innerHTML = "POŁĄCZONE <span>obrót wokół zielonego punktu</span>";
stageCaptions[1]!.innerHTML = "NIEPOŁĄCZONE <span>powinny odlecieć od siebie</span>";

const legendItems = Array.from(document.querySelectorAll<HTMLElement>(".bearing-legend > span"));
const legendLabels = ["część A", "część B", "zielony punkt połączenia", "czerwone punkty bez połączenia"];
if (legendItems.length === legendLabels.length) {
  legendItems.forEach((item, index) => {
    const marker = item.querySelector("i");
    if (marker === null) return;
    item.replaceChildren(marker, document.createTextNode(` ${legendLabels[index] ?? ""}`));
  });
}

const intro = required<HTMLElement>(".owner-gate-intro");
replaceText(required<HTMLElement>(".owner-gate-intro .section-label"), "TEST BEARING");
replaceText(
  required<HTMLElement>(".owner-gate-intro .owner-lead"),
  "Sprawdzamy jedną prostą rzecz: po lewej dwa kawałki mają zostać połączone w zielonym punkcie i móc obracać się wokół niego. Po prawej nie ma połączenia, więc kawałki powinny odlecieć od siebie.",
);
const introSteps = required<HTMLOListElement>(".owner-gate-intro .owner-steps");
introSteps.innerHTML = `
  <li>Kliknij <strong>URUCHOM TEST</strong>.</li>
  <li>Popatrz równocześnie na obie strony: <strong>lewa ma zostać razem</strong>, a <strong>prawa ma się rozlecieć</strong>.</li>
  <li>Jeśli chcesz upewnić się jeszcze raz, kliknij <strong>POWTÓRZ OD NOWA</strong>. Potem wybierz poniżej, czy działa.</li>
`;
replaceText(
  required<HTMLElement>(".owner-gate-intro .owner-hint"),
  "Jeśli właśnie to widzisz, test wygląda dobrze. Nie musisz rozumieć żadnych liczb, skrótów ani technicznych nazw.",
);

const runButton = required<HTMLButtonElement>("#bearing-run");
const resetButton = required<HTMLButtonElement>("#bearing-reset");
replaceText(runButton, "URUCHOM TEST");
replaceText(resetButton, "POWTÓRZ OD NOWA");
const ownerTestSection = runButton.closest("section");
if (!(ownerTestSection instanceof HTMLElement)) throw new Error("BEARING human owner copy missing owner-test section");
const ownerTestLabel = ownerTestSection.querySelector<HTMLElement>(".section-label");
const ownerFocus = ownerTestSection.querySelector<HTMLElement>(".bearing-owner-focus");
if (ownerTestLabel === null || ownerFocus === null) throw new Error("BEARING human owner copy missing owner-test text");
replaceText(ownerTestLabel, "CO MASZ ZROBIĆ");
replaceText(
  ownerFocus,
  "Patrz tylko na ruch: po lewej zielone kółko ma trzymać oba kawałki razem, ale pozwalać im się obracać. Po prawej czerwone kółka powinny się od siebie oddalać. I tyle — nie musisz czytać zielonych liczb.",
);

const verdictSection = required<HTMLElement>(".owner-verdict");
const verdictLabel = verdictSection.querySelector<HTMLElement>(".section-label");
if (verdictLabel === null) throw new Error("BEARING human owner copy missing verdict label");
replaceText(verdictLabel, "CZY TO DZIAŁA?");
replaceText(required<HTMLButtonElement>('[data-owner-verdict="ACCEPT"]'), "DZIAŁA");
replaceText(required<HTMLButtonElement>('[data-owner-verdict="REJECT"]'), "NIE DZIAŁA");
replaceText(required<HTMLButtonElement>('[data-owner-verdict="INCONCLUSIVE"]'), "NIE WIEM");
replaceText(required<HTMLLabelElement>(".owner-notes-label"), "Jeśli chcesz, napisz krótko co zauważyłeś");
const report = required<HTMLTextAreaElement>("#owner-report");
report.placeholder = "Po wybraniu odpowiedzi pojawi się tu techniczny raport dla GPT.";
const reportHint = document.createElement("p");
reportHint.className = "note owner-report-human-hint";
reportHint.textContent = "Raport poniżej jest dla GPT. Nie musisz go czytać — po prostu skopiuj go po wybraniu odpowiedzi.";
report.insertAdjacentElement("beforebegin", reportHint);
replaceText(required<HTMLButtonElement>("#owner-copy-report"), "SKOPIUJ RAPORT DLA GPT");

const technicalDetails = required<HTMLDetailsElement>(".owner-technical-details");
const technicalSummary = technicalDetails.querySelector("summary");
if (technicalSummary === null) throw new Error("BEARING human owner copy missing technical summary");
replaceText(technicalSummary, "Szczegóły techniczne — nie musisz tego czytać");
const technicalIdentity = document.createElement("div");
technicalIdentity.className = "owner-human-technical-identity";
const buildState = required<HTMLElement>("#forge-build-state");
const sourceSignal = required<HTMLElement>(".bearing-signal");
technicalIdentity.append(buildState, sourceSignal);
const firstTechnicalSection = technicalDetails.querySelector("section");
technicalDetails.insertBefore(technicalIdentity, firstTechnicalSection);

const status = required<HTMLElement>("#bearing-status");
function syncHumanStatus(): void {
  const technical = status.textContent?.trim() ?? "";
  const human = technical === "BOOTING" ? "START…"
    : technical === "READY" ? "GOTOWE"
      : technical === "RUNNING" ? "TEST TRWA"
        : technical === "BEARING EVIDENCE PASS" ? "TEST: OK"
          : technical === "BEARING EVIDENCE FAIL" ? "TEST: PROBLEM"
            : "STATUS";
  status.dataset.humanStatus = human;
}
new MutationObserver(syncHumanStatus).observe(status, { childList: true, characterData: true, subtree: true });
syncHumanStatus();

const phase = required<HTMLElement>("#bearing-phase");
function syncHumanPhase(): void {
  const raw = phase.textContent?.trim() ?? "";
  let human: string | null = null;
  if (raw === "initializing") human = "Przygotowuję test…";
  else if (raw.startsWith("running · solver step")) human = "Test trwa…";
  else if (raw === "complete · RESET to repeat the same owner-visible run") human = "Test zakończony. Możesz kliknąć „POWTÓRZ OD NOWA”.";
  if (human !== null && human !== raw) {
    phase.dataset.technicalState = raw;
    phase.textContent = human;
  }
}
new MutationObserver(syncHumanPhase).observe(phase, { childList: true, characterData: true, subtree: true });
syncHumanPhase();

const ownerState = required<HTMLElement>("#owner-gate-state");
function humanOwnerState(raw: string): string | null {
  if (raw === "Najpierw wykonaj BEARING.") return "Najpierw kliknij „URUCHOM TEST”.";
  if (raw === "Obserwuj oba panele — werdykt wybierz po zakończeniu.") return "Patrz na lewą i prawą stronę. Odpowiedź wybierz po zakończeniu testu.";
  const readyMatch = /^Gotowe do kolejnej powtórki · wykonane: (\d+)\.$/u.exec(raw);
  if (readyMatch !== null) return `Gotowe. Jeśli chcesz, uruchom test ponownie. Powtórki: ${readyMatch[1]}.`;
  const passMatch = /^BEARING zakończony · powtórki: (\d+)\. Możesz RESET i powtórzyć albo wybrać werdykt\.$/u.exec(raw);
  if (passMatch !== null) return `Test zakończony. Powtórki: ${passMatch[1]}. Możesz powtórzyć albo wybrać poniżej, czy działa.`;
  if (raw.startsWith("BEARING zakończył się FAIL")) return "Automatyczna kontrola wykryła problem. Nie wybieraj „DZIAŁA”. Możesz powtórzyć test albo wybrać „NIE DZIAŁA” / „NIE WIEM”.";
  if (raw.includes("Forge blokuje ACCEPT") || raw.startsWith("ACCEPT zablokowany:")) {
    return "Nie mogę teraz pozwolić na „DZIAŁA”, bo paczka albo wyniki kontroli technicznej nie są kompletne. Możesz powtórzyć test albo wybrać „NIE DZIAŁA” / „NIE WIEM”.";
  }
  return null;
}
function syncHumanOwnerState(): void {
  const raw = ownerState.textContent?.trim() ?? "";
  const human = humanOwnerState(raw);
  if (human !== null && human !== raw) {
    ownerState.dataset.technicalState = raw;
    ownerState.textContent = human;
  }
}
new MutationObserver(syncHumanOwnerState).observe(ownerState, { childList: true, characterData: true, subtree: true });
syncHumanOwnerState();

const copyStatus = required<HTMLElement>("#owner-copy-status");
function syncHumanCopyStatus(): void {
  const raw = copyStatus.textContent?.trim() ?? "";
  let human: string | null = null;
  if (raw.startsWith("Skopiowane —")) human = "Skopiowane. Wklej raport do rozmowy ze mną — resztą zajmę się ja.";
  else if (raw.startsWith("Nie udało się skopiować automatycznie")) human = "Nie udało się skopiować automatycznie. Raport poniżej jest zaznaczony — skopiuj go ręcznie.";
  else if (raw.startsWith("Poprzedni ACCEPT anulowany")) human = "Poprzednia odpowiedź została cofnięta, bo kontrola techniczna przestała być spójna. Powtórz test albo wybierz inną odpowiedź.";
  if (human !== null && human !== raw) {
    copyStatus.dataset.technicalState = raw;
    copyStatus.textContent = human;
  }
}
new MutationObserver(syncHumanCopyStatus).observe(copyStatus, { childList: true, characterData: true, subtree: true });
syncHumanCopyStatus();

intro.dataset.ownerLanguage = "plain-pl-v1";
