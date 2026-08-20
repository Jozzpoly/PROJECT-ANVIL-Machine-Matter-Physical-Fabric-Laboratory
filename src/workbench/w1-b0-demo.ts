import "../style.css";
import "./w1-b0.css";
import type { Vec3 } from "../model.js";
import type { Quat } from "../foundation/spatial.js";
import {
  WorkbenchB0Specimen,
  type WorkbenchB0VisualBody,
  type WorkbenchB0VisualCell,
  type WorkbenchB0VisualSnapshot,
} from "./w1-b0-specimen.js";

type ViewMode = "authored" | "runtime" | "both";

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (element === null) throw new Error(`W1 Workbench missing ${selector}`);
  return element;
}

const root = required<HTMLDivElement>("#app");
document.title = "PROJECT ANVIL — Physical Fabric Workbench v0";
root.innerHTML = `
  <header class="topbar wb-topbar">
    <div>
      <p class="eyebrow">PROJECT ANVIL · PHYSICAL FABRIC WORKBENCH v0</p>
      <h1>B0 · POST-REBIND ACTIVATION</h1>
      <p class="subtitle">Jeden zamrożony specimen. Najpierw obserwacja, potem interpretacja.</p>
    </div>
    <div class="status wb-status" id="wb-status" data-phase="BOOTING">BOOTING</div>
  </header>
  <main class="wb-layout">
    <section class="viewport-card wb-viewport-card">
      <div class="wb-viewbar" aria-label="Workbench view selector">
        <div>
          <span class="wb-kicker">VIEW</span>
          <strong id="wb-view-title">BOTH</strong>
        </div>
        <div class="segmented wb-segmented">
          <button id="wb-view-authored" data-view="authored">AUTHORED MATTER</button>
          <button id="wb-view-runtime" data-view="runtime">RUNTIME INTERPRETATION</button>
          <button id="wb-view-both" data-view="both" class="active">BOTH</button>
        </div>
      </div>
      <canvas id="wb-canvas" aria-label="Physical Fabric Workbench B0 specimen"></canvas>
      <div class="wb-legend" aria-label="Workbench visual legend">
        <span><i class="wb-legend-source"></i> authored/source</span>
        <span><i class="wb-legend-runtime"></i> runtime body interpretation</span>
        <span><i class="wb-legend-bearing"></i> bearing mark</span>
        <span><i class="wb-legend-torque"></i> torque patch</span>
        <span><i class="wb-legend-cut"></i> accepted CUT</span>
      </div>
    </section>

    <aside class="panel wb-panel">
      <section class="wb-state-section">
        <p class="section-label">SPECIMEN STATE</p>
        <p id="wb-phase" class="wb-phase" data-phase="BOOTING">Przygotowuję specimen…</p>
        <div class="wb-facts">
          <div><span>AUTHORED</span><strong id="wb-source-cells">—</strong><small>source cells</small></div>
          <div><span>RUNTIME</span><strong id="wb-runtime-bodies">—</strong><small>bodies</small></div>
          <div><span>ACTIVATION</span><strong id="wb-activation">—</strong><small>fresh runtime</small></div>
        </div>
      </section>

      <section>
        <p class="section-label">BOUNDED ACTION</p>
        <p id="wb-action-note" class="note wb-action-note">Tylko akcje należące do zamrożonego B0 są dostępne.</p>
        <div class="button-row wb-actions">
          <button id="wb-primary" disabled>PRZYGOTOWUJĘ…</button>
          <button id="wb-reset" disabled>RESET SPECIMEN</button>
        </div>
        <div class="wb-progress" aria-hidden="true"><span id="wb-progress"></span></div>
      </section>

      <section id="wb-first-pass" class="wb-first-pass" hidden>
        <p class="section-label">FIRST-PASS OWNER OBSERVATION</p>
        <p class="wb-first-pass-intro">Zanim otworzysz technikalia, opisz własnymi słowami:</p>
        <ol>
          <li>Co Twoim zdaniem pozostało tym samym przez CUT?</li>
          <li>Co zostało zastąpione?</li>
          <li>Gdzie według Ciebie „żyje” zdolność torque?</li>
          <li>Co przewidziałbyś dla podobnej zmiany, której ten specimen nie pokazuje?</li>
          <li>Co chciałbyś teraz sam zbudować, zmienić albo sprawdzić?</li>
        </ol>
        <p class="note">Nie ma tu automatycznego „dobrego wyniku”. Czytelny, ale skryptowany mechanizm pozostaje pełnoprawnym werdyktem.</p>
      </section>

      <details id="wb-details" class="wb-details">
        <summary>TECHNICAL DETAILS — otwórz po własnej obserwacji</summary>
        <div class="wb-tech-body">
          <dl id="wb-tech" class="metrics"></dl>
        </div>
      </details>

      <section class="boundary wb-boundary">
        <p class="section-label">BOUNDARY</p>
        <p>To jest jeden przygotowany specimen integracyjny. Nie jest edytorem, nowym ANVIL-NN ani dowodem uniwersalnej ontologii.</p>
      </section>
    </aside>
  </main>`;

const canvas = required<HTMLCanvasElement>("#wb-canvas");
const contextCandidate = canvas.getContext("2d");
if (contextCandidate === null) throw new Error("W1 Workbench 2D canvas unavailable");
const context: CanvasRenderingContext2D = contextCandidate;
const status = required<HTMLElement>("#wb-status");
const phaseText = required<HTMLElement>("#wb-phase");
const sourceCells = required<HTMLElement>("#wb-source-cells");
const runtimeBodies = required<HTMLElement>("#wb-runtime-bodies");
const activation = required<HTMLElement>("#wb-activation");
const actionNote = required<HTMLElement>("#wb-action-note");
const primaryButton = required<HTMLButtonElement>("#wb-primary");
const resetButton = required<HTMLButtonElement>("#wb-reset");
const progress = required<HTMLElement>("#wb-progress");
const firstPass = required<HTMLElement>("#wb-first-pass");
const details = required<HTMLDetailsElement>("#wb-details");
const tech = required<HTMLDListElement>("#wb-tech");
const viewTitle = required<HTMLElement>("#wb-view-title");
const authoredButton = required<HTMLButtonElement>("#wb-view-authored");
const runtimeButton = required<HTMLButtonElement>("#wb-view-runtime");
const bothButton = required<HTMLButtonElement>("#wb-view-both");

let specimen: WorkbenchB0Specimen | null = null;
let viewMode: ViewMode = "both";
let busy = false;
let observationFrame = 0;
let bootError: string | null = null;

const SOURCE_STROKE = "#85bfff";
const RUNTIME_PATCH_BODY = "#7ce7ff";
const RUNTIME_OTHER_A = "#b7a4ff";
const RUNTIME_BODY_B = "#ffb86b";
const BEARING = "#89ff9d";
const TORQUE = "#ffce67";
const CUT = "#ff6b73";

function scaleVec(value: Vec3, scalar: number): Vec3 {
  return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar };
}

function addVec(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function subtractVec(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function crossVec(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function rotate(rotation: Quat, value: Vec3): Vec3 {
  const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
  const t = crossVec(qv, value);
  const doubled = scaleVec(t, 2);
  return addVec(value, addVec(scaleVec(doubled, rotation.w), crossVec(qv, doubled)));
}

function authoredCenter(cell: WorkbenchB0VisualCell, size: number): Vec3 {
  return {
    x: (cell.grid.x + 0.5) * size,
    y: (cell.grid.y + 0.5) * size,
    z: (cell.grid.z + 0.5) * size,
  };
}

function bodyForCell(snapshot: WorkbenchB0VisualSnapshot, cellId: string): WorkbenchB0VisualBody {
  const body = snapshot.bodies.find((candidate) => candidate.sourceCellIds.includes(cellId));
  if (body === undefined) throw new Error(`W1 Workbench visual body missing source cell ${cellId}`);
  return body;
}

function runtimeCellCenter(snapshot: WorkbenchB0VisualSnapshot, cell: WorkbenchB0VisualCell): Vec3 {
  const body = bodyForCell(snapshot, cell.id);
  const local = subtractVec(authoredCenter(cell, snapshot.cellSizeM), body.sourceCenterOfMassWorld);
  return addVec(body.position, rotate(body.rotation, local));
}

function faceOffset(face: string, half: number): Vec3 {
  if (face === "x+") return { x: half, y: 0, z: 0 };
  if (face === "x-") return { x: -half, y: 0, z: 0 };
  if (face === "y+") return { x: 0, y: half, z: 0 };
  if (face === "y-") return { x: 0, y: -half, z: 0 };
  if (face === "z+") return { x: 0, y: 0, z: half };
  if (face === "z-") return { x: 0, y: 0, z: -half };
  return { x: 0, y: 0, z: 0 };
}

function runtimePatchPoint(snapshot: WorkbenchB0VisualSnapshot): Vec3 {
  const cell = snapshot.cells.find((candidate) => candidate.id === snapshot.patch.target.cellId);
  if (cell === undefined) throw new Error("W1 Workbench patch cell missing");
  const body = bodyForCell(snapshot, cell.id);
  const sourcePoint = addVec(
    authoredCenter(cell, snapshot.cellSizeM),
    faceOffset(snapshot.patch.target.face, snapshot.cellSizeM / 2),
  );
  return addVec(body.position, rotate(body.rotation, subtractVec(sourcePoint, body.sourceCenterOfMassWorld)));
}

function authoredPatchPoint(snapshot: WorkbenchB0VisualSnapshot): Vec3 {
  const cell = snapshot.cells.find((candidate) => candidate.id === snapshot.patch.target.cellId);
  if (cell === undefined) throw new Error("W1 Workbench authored patch cell missing");
  return addVec(
    authoredCenter(cell, snapshot.cellSizeM),
    faceOffset(snapshot.patch.target.face, snapshot.cellSizeM / 2),
  );
}

function cutPoint(snapshot: WorkbenchB0VisualSnapshot): Vec3 {
  const left = snapshot.cells.find((cell) => cell.id === "a:0");
  const right = snapshot.cells.find((cell) => cell.id === "a:2");
  if (left === undefined || right === undefined) return { x: -0.5, y: 0.25, z: 0.25 };
  const a = authoredCenter(left, snapshot.cellSizeM);
  const b = authoredCenter(right, snapshot.cellSizeM);
  return scaleVec(addVec(a, b), 0.5);
}

function projection(canvasRect: DOMRect, point: Vec3): { x: number; y: number } {
  const factor = Math.min(155, Math.max(78, Math.min(canvasRect.width / 5.2, canvasRect.height / 3.4)));
  return {
    x: canvasRect.width * 0.5 + point.x * factor - point.z * factor * 0.16,
    y: canvasRect.height * 0.54 - point.y * factor + point.z * factor * 0.08,
  };
}

function drawGrid(rect: DOMRect): void {
  context.fillStyle = "#070b12";
  context.fillRect(0, 0, rect.width, rect.height);
  context.save();
  context.strokeStyle = "#142131";
  context.lineWidth = 1;
  for (let n = -6; n <= 6; n += 1) {
    const a = projection(rect, { x: n * 0.5, y: -2, z: 0.25 });
    const b = projection(rect, { x: n * 0.5, y: 2, z: 0.25 });
    context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
    const c = projection(rect, { x: -3, y: n * 0.5, z: 0.25 });
    const d = projection(rect, { x: 3, y: n * 0.5, z: 0.25 });
    context.beginPath(); context.moveTo(c.x, c.y); context.lineTo(d.x, d.y); context.stroke();
  }
  context.restore();
}

function drawSquare(rect: DOMRect, center: Vec3, sizeM: number, options: {
  readonly stroke: string;
  readonly fill?: string;
  readonly alpha?: number;
  readonly dashed?: boolean;
  readonly width?: number;
}): void {
  const factor = Math.min(155, Math.max(78, Math.min(rect.width / 5.2, rect.height / 3.4)));
  const projected = projection(rect, center);
  const size = Math.max(12, sizeM * factor * 0.9);
  context.save();
  context.globalAlpha = options.alpha ?? 1;
  context.strokeStyle = options.stroke;
  context.lineWidth = options.width ?? 1.5;
  if (options.dashed === true) context.setLineDash([6, 5]);
  if (options.fill !== undefined) {
    context.fillStyle = options.fill;
    context.fillRect(projected.x - size / 2, projected.y - size / 2, size, size);
  }
  context.strokeRect(projected.x - size / 2, projected.y - size / 2, size, size);
  context.restore();
}

function runtimeColor(bodyId: string, patchBodyId: string): string {
  if (bodyId === patchBodyId) return RUNTIME_PATCH_BODY;
  if (bodyId.startsWith("body:b:")) return RUNTIME_BODY_B;
  return RUNTIME_OTHER_A;
}

function drawMarker(rect: DOMRect, point: Vec3, color: string, radius: number, label?: string): void {
  const p = projection(rect, point);
  context.save();
  context.strokeStyle = color;
  context.fillStyle = "#071018";
  context.lineWidth = 3;
  context.beginPath(); context.arc(p.x, p.y, radius, 0, Math.PI * 2); context.fill(); context.stroke();
  if (label !== undefined) {
    context.fillStyle = color;
    context.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.fillText(label, p.x + radius + 7, p.y - radius - 2);
  }
  context.restore();
}

function drawCutMarker(rect: DOMRect, snapshot: WorkbenchB0VisualSnapshot): void {
  if (snapshot.phase === "INITIAL" || snapshot.phase === "PRE_CUT") return;
  const p = projection(rect, cutPoint(snapshot));
  context.save();
  context.strokeStyle = CUT;
  context.fillStyle = CUT;
  context.lineWidth = 2;
  context.setLineDash([4, 4]);
  context.beginPath(); context.moveTo(p.x, p.y - 36); context.lineTo(p.x, p.y + 36); context.stroke();
  context.setLineDash([]);
  context.font = "700 10px ui-monospace, SFMono-Regular, Menlo, monospace";
  context.fillText("ACCEPTED CUT", p.x + 7, p.y - 26);
  context.restore();
}

function drawScene(): void {
  const current = specimen;
  if (current === null) return;
  const snapshot = current.visualSnapshot();
  const rect = canvas.getBoundingClientRect();
  drawGrid(rect);

  if (viewMode === "authored" || viewMode === "both") {
    for (const cell of snapshot.cells) {
      drawSquare(rect, authoredCenter(cell, snapshot.cellSizeM), snapshot.cellSizeM, {
        stroke: SOURCE_STROKE,
        alpha: viewMode === "both" ? 0.42 : 0.92,
        dashed: true,
        width: 1.6,
      });
    }
    drawMarker(rect, authoredPatchPoint(snapshot), TORQUE, 6, "TORQUE PATCH");
  }

  if (viewMode === "runtime" || viewMode === "both") {
    for (const cell of snapshot.cells) {
      const body = bodyForCell(snapshot, cell.id);
      const color = runtimeColor(body.id, snapshot.patch.currentBodyId);
      drawSquare(rect, runtimeCellCenter(snapshot, cell), snapshot.cellSizeM, {
        stroke: color,
        fill: color,
        alpha: viewMode === "both" ? 0.36 : 0.68,
        width: 1.8,
      });
    }
    const anchorMid = scaleVec(addVec(snapshot.bearing.anchorAWorld, snapshot.bearing.anchorBWorld), 0.5);
    drawMarker(rect, anchorMid, BEARING, 8, "BEARING");
    drawMarker(rect, runtimePatchPoint(snapshot), TORQUE, 5);
  }

  drawCutMarker(rect, snapshot);
}

function resizeCanvas(): void {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  drawScene();
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function setView(mode: ViewMode): void {
  viewMode = mode;
  authoredButton.classList.toggle("active", mode === "authored");
  runtimeButton.classList.toggle("active", mode === "runtime");
  bothButton.classList.toggle("active", mode === "both");
  viewTitle.textContent = mode === "authored" ? "AUTHORED MATTER" : mode === "runtime" ? "RUNTIME INTERPRETATION" : "BOTH";
  drawScene();
}

function formatNumber(value: number, digits = 3): string {
  return Number.isFinite(value) ? value.toFixed(digits) : "—";
}

function updateTechnical(): void {
  const current = specimen;
  if (current === null) return;
  const authored = current.authoredSummary;
  const transition = current.transitionReceipt;
  const observation = current.observationReceipt;
  const rows: Array<{ id: string; label: string; value: string; raw?: number }> = [
    { id: "source", label: "authored cells", value: `${authored.sourceCellIds.length} → ${authored.sourceCellIds.length}` },
    { id: "bearing-source", label: "source bearing", value: authored.sourceBearingId },
    { id: "patch-source", label: "source torque patch", value: authored.sourcePatchId },
    { id: "patch-target", label: "source patch target", value: `${authored.sourcePatchTarget.cellId}@${authored.sourcePatchTarget.face}` },
  ];
  if (transition !== null) {
    rows.push(
      { id: "bodies", label: "runtime bodies", value: `${transition.beforeRuntimeBodyIds.length} → ${transition.afterRuntimeBodyIds.length}` },
      { id: "endpoint", label: "bearing endpoint body", value: `${transition.beforeEndpointBodyId} → ${transition.afterEndpointBodyId}` },
      { id: "bearing-rebuild", label: "bearing source before / after", value: `${transition.sourceBearingIdBefore} / ${transition.sourceBearingIdAfter}` },
      { id: "fresh-action", label: "fresh action body A", value: transition.freshActionBodyAId },
      { id: "stale-exists", label: "old endpoint body still exists", value: transition.oldEndpointBodyStillExists ? "YES" : "NO" },
      { id: "fresh-off", label: "fresh activation after CUT", value: transition.freshActivation },
      { id: "runtime-replace", label: "runtime transaction", value: transition.oldRuntimeDisposed ? "old runtime disposed · fresh action derived" : "unexpected" },
    );
  }
  if (observation !== null) {
    rows.push(
      { id: "active-speed", label: "ACTIVE final rel. speed", value: `${formatNumber(observation.activeRelativeAngularSpeedRadps, 6)} rad/s`, raw: observation.activeRelativeAngularSpeedRadps },
      { id: "control-speed", label: "OFF control final rel. speed", value: `${formatNumber(observation.controlRelativeAngularSpeedRadps, 6)} rad/s`, raw: observation.controlRelativeAngularSpeedRadps },
      { id: "speed-advantage", label: "ACTIVE − OFF advantage", value: `${formatNumber(observation.activeSpeedAdvantageRadps, 6)} rad/s`, raw: observation.activeSpeedAdvantageRadps },
      { id: "stale-angular", label: "stale sibling angular Δ", value: `${observation.staleSiblingAngularDeltaRadps.toExponential(3)} rad/s`, raw: observation.staleSiblingAngularDeltaRadps },
      { id: "stale-linear", label: "stale sibling linear Δ", value: `${observation.staleSiblingLinearDeltaMps.toExponential(3)} m/s`, raw: observation.staleSiblingLinearDeltaMps },
    );
  }
  tech.innerHTML = rows.map((row) => `<dt>${row.label}</dt><dd id="wb-metric-${row.id}"${row.raw === undefined ? "" : ` data-value="${row.raw}"`}>${row.value}</dd>`).join("");
}

function phaseCopy(phase: ReturnType<WorkbenchB0Specimen["visualSnapshot"]>["phase"]): { status: string; note: string; action: string | null } {
  if (phase === "INITIAL") return {
    status: "READY",
    note: "Specimen jest w pozycji startowej. Doprowadź go do jednego zamrożonego punktu CUT READY.",
    action: "CONTINUE TO CUT READY",
  };
  if (phase === "PRE_CUT") return { status: "PRE-CUT", note: "Trwa deterministyczny przygotowany ruch.", action: null };
  if (phase === "CUT_READY") return {
    status: "CUT READY",
    note: "Specimen jest zatrzymany. Dostępna jest dokładnie jedna zaakceptowana zmiana topologii.",
    action: "EXECUTE ACCEPTED CUT",
  };
  if (phase === "POST_CUT_OFF") return {
    status: "POST-CUT · OFF",
    note: "Transakcja zakończona. Obejrzyj widoki przed uruchomieniem jednego bounded okna aktywacji.",
    action: "ACTIVATE TORQUE",
  };
  if (phase === "OBSERVING") return {
    status: "OBSERVING",
    note: `Trwa zamrożone okno obserwacji: ${observationFrame}/30 kroków.`,
    action: null,
  };
  return {
    status: "OBSERVED",
    note: "Okno obserwacji zakończone. Symulacja nie jest dalej krokowana; zapisz własną interpretację przed otwarciem technikaliów.",
    action: null,
  };
}

function refresh(): void {
  const current = specimen;
  if (current === null) return;
  const snapshot = current.visualSnapshot();
  const copy = phaseCopy(snapshot.phase);
  status.dataset.phase = snapshot.phase;
  status.textContent = copy.status;
  status.className = snapshot.phase === "OBSERVED" ? "status wb-status pass" : "status wb-status";
  phaseText.dataset.phase = snapshot.phase;
  phaseText.textContent = copy.note;
  actionNote.textContent = copy.note;
  sourceCells.textContent = String(snapshot.cells.length);
  runtimeBodies.textContent = current.transitionReceipt === null ? String(snapshot.bodies.length) : `2 → ${snapshot.bodies.length}`;
  activation.textContent = current.state.torqueActivation;
  primaryButton.textContent = copy.action ?? (snapshot.phase === "OBSERVING" ? "OBSERVING…" : "OBSERVATION COMPLETE");
  primaryButton.disabled = busy || copy.action === null;
  resetButton.disabled = busy;
  firstPass.hidden = snapshot.phase !== "OBSERVED";
  progress.parentElement?.classList.toggle("active", snapshot.phase === "OBSERVING");
  progress.style.width = `${Math.min(100, (observationFrame / 30) * 100)}%`;
  updateTechnical();
  drawScene();
}

async function runPrimary(): Promise<void> {
  const current = specimen;
  if (current === null || busy) return;
  busy = true;
  try {
    const phase = current.state.phase;
    if (phase === "INITIAL") {
      current.continueToCutReady();
    } else if (phase === "CUT_READY") {
      await current.executeAcceptedCut();
    } else if (phase === "POST_CUT_OFF") {
      observationFrame = 0;
      current.beginObservation();
      refresh();
      for (let step = 1; step <= 30; step += 1) {
        await nextFrame();
        current.stepObservation();
        observationFrame = step;
        refresh();
      }
    }
  } catch (error: unknown) {
    bootError = error instanceof Error ? error.message : String(error);
    status.dataset.phase = "BLOCKED";
    status.textContent = "BLOCKED";
    status.className = "status wb-status fail";
    phaseText.textContent = bootError;
    console.error(error);
  } finally {
    busy = false;
    refresh();
  }
}

async function resetSpecimen(): Promise<void> {
  const current = specimen;
  if (current === null || busy) return;
  busy = true;
  try {
    await current.reset();
    observationFrame = 0;
    bootError = null;
    details.open = false;
  } catch (error: unknown) {
    bootError = error instanceof Error ? error.message : String(error);
    console.error(error);
  } finally {
    busy = false;
    refresh();
  }
}

authoredButton.addEventListener("click", () => setView("authored"));
runtimeButton.addEventListener("click", () => setView("runtime"));
bothButton.addEventListener("click", () => setView("both"));
primaryButton.addEventListener("click", () => void runPrimary());
resetButton.addEventListener("click", () => void resetSpecimen());
window.addEventListener("resize", resizeCanvas);
window.addEventListener("beforeunload", () => specimen?.dispose());

async function boot(): Promise<void> {
  try {
    specimen = await WorkbenchB0Specimen.create();
    primaryButton.disabled = false;
    resetButton.disabled = false;
    resizeCanvas();
    refresh();
  } catch (error: unknown) {
    bootError = error instanceof Error ? error.message : String(error);
    status.dataset.phase = "BLOCKED";
    status.textContent = "BLOCKED";
    status.className = "status wb-status fail";
    phaseText.textContent = bootError;
    console.error(error);
  }
}

void boot();
