import "./studio.css";
import type { BearingAxis } from "../experiments/anvil-02-bearing.js";
import type { GridPosition } from "../model.js";
import { FreedomRuntimeSession } from "./runtime.js";
import {
  FreedomWorkspace,
  createEmptyFreedomSource,
  createFreedomStarterSource,
  type FreedomSourceV0,
  type GridFace,
} from "./source.js";
import { FreedomCanvas, type CanvasHit, type CanvasInterfaceHit, type CanvasMatterHit } from "./view.js";

function required<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (element === null) throw new Error(`Freedom Studio missing ${selector}`);
  return element;
}

const FACE_OFFSETS: Readonly<Record<GridFace, GridPosition>> = Object.freeze({
  "x-": { x: -1, y: 0, z: 0 },
  "x+": { x: 1, y: 0, z: 0 },
  "y-": { x: 0, y: -1, z: 0 },
  "y+": { x: 0, y: 1, z: 0 },
  "z-": { x: 0, y: 0, z: -1 },
  "z+": { x: 0, y: 0, z: 1 },
});

function gridKey(grid: GridPosition): string {
  return `${grid.x},${grid.y},${grid.z}`;
}

function addGrid(a: GridPosition, b: GridPosition): GridPosition {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function scaleGrid(value: GridPosition, scalar: number): GridPosition {
  return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar };
}

function legalAxes(face: GridFace): readonly BearingAxis[] {
  if (face.startsWith("x")) return ["y", "z"];
  if (face.startsWith("y")) return ["x", "z"];
  return ["x", "y"];
}

function downloadSource(source: FreedomSourceV0): void {
  const blob = new Blob([JSON.stringify(source, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "anvil-freedom-world.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

const root = document.querySelector<HTMLDivElement>("#app");
if (root === null) throw new Error("Freedom Studio requires #app");
root.innerHTML = `
  <main class="freedom-studio" data-studio-recovery="freedom-first">
    <canvas class="freedom-world" aria-label="ANVIL physical world"></canvas>

    <header class="freedom-workspace island">
      <div class="brand"><strong>ANVIL</strong><span>Physical Fabric Lab</span></div>
      <div class="compact-row">
        <button data-action="empty" title="Start an empty world">Empty</button>
        <button data-action="starter" title="Start three plain Matter cells">Starter</button>
        <span class="divider"></span>
        <button data-action="undo" title="Undo · Ctrl+Z">Undo</button>
        <button data-action="redo" title="Redo · Ctrl+Shift+Z">Redo</button>
        <button data-action="focus" title="Focus world · F">Focus</button>
        <button data-action="save" title="Save authored world · Ctrl+S">Save</button>
      </div>
    </header>

    <section class="freedom-intent island" aria-label="Direct meaning tools">
      <button data-intent="bearing" title="Bearing: press B, then click a shared interface"><kbd>B</kbd> Bearing</button>
      <button data-intent="torque" title="Torque: press T, then click a Bearing interface"><kbd>T</kbd> Torque</button>
      <div class="axis-picker" aria-label="Bearing axis">
        <button data-axis="x">X</button><button data-axis="y">Y</button><button data-axis="z" class="active">Z</button>
      </div>
      <label class="torque-effort">Nm <input data-effort type="number" step="5" value="40" /></label>
    </section>

    <section class="freedom-sim island">
      <button class="run primary" data-action="run">RUN</button>
      <button class="runtime-only" data-action="pause" hidden>Pause</button>
      <button class="runtime-only" data-action="forces" hidden>Forces OFF</button>
      <button class="runtime-only danger-soft" data-action="stop" hidden>STOP</button>
    </section>

    <section class="freedom-context island" data-context hidden></section>

    <section class="freedom-status island" aria-live="polite">
      <div class="status-main"><span class="dot"></span><strong data-status>BUILD</strong><span data-summary>World is yours.</span></div>
      <details data-diagnostics><summary>details</summary><div class="diagnostic-list" data-diagnostic-list></div></details>
    </section>

    <div class="freedom-notice" data-notice hidden></div>
  </main>
`;

const studio = required<HTMLElement>(root, ".freedom-studio");
const canvasElement = required<HTMLCanvasElement>(studio, ".freedom-world");
const view = new FreedomCanvas(canvasElement);
const statusText = required<HTMLElement>(studio, "[data-status]");
const summaryText = required<HTMLElement>(studio, "[data-summary]");
const diagnosticDetails = required<HTMLDetailsElement>(studio, "[data-diagnostics]");
const diagnosticList = required<HTMLElement>(studio, "[data-diagnostic-list]");
const notice = required<HTMLElement>(studio, "[data-notice]");
const contextPod = required<HTMLElement>(studio, "[data-context]");
const runButton = required<HTMLButtonElement>(studio, "[data-action='run']");
const pauseButton = required<HTMLButtonElement>(studio, "[data-action='pause']");
const forcesButton = required<HTMLButtonElement>(studio, "[data-action='forces']");
const stopButton = required<HTMLButtonElement>(studio, "[data-action='stop']");
const undoButton = required<HTMLButtonElement>(studio, "[data-action='undo']");
const redoButton = required<HTMLButtonElement>(studio, "[data-action='redo']");
const effortInput = required<HTMLInputElement>(studio, "[data-effort]");

let workspace = new FreedomWorkspace(createFreedomStarterSource());
let runtime: FreedomRuntimeSession | null = null;
let runtimeRunning = false;
let pendingIntent: "bearing" | "torque" | null = null;
let bearingAxis: BearingAxis = "z";
let selectedInterface: CanvasInterfaceHit | null = null;
let pointerBuild: {
  readonly hit: CanvasMatterHit;
  readonly startX: number;
  readonly startY: number;
  previewCount: number;
} | null = null;
let cameraDrag: { readonly startX: number; readonly startY: number; lastX: number; lastY: number; readonly pan: boolean } | null = null;
let handDrag: { readonly origin: CanvasMatterHit; readonly startX: number; readonly startY: number } | null = null;
let lastTime = performance.now();
let accumulator = 0;

function effortValue(): number {
  const value = Number(effortInput.value);
  return Number.isFinite(value) ? value : 40;
}

function flash(message: string): void {
  notice.textContent = message;
  notice.hidden = false;
  window.clearTimeout(Number(notice.dataset.timer ?? "0"));
  const timer = window.setTimeout(() => { notice.hidden = true; }, 2400);
  notice.dataset.timer = String(timer);
}

function source(): FreedomSourceV0 {
  return workspace.snapshot().source;
}

function refreshBuildView(): void {
  const snapshot = workspace.snapshot();
  view.setSource(snapshot.source);
  undoButton.disabled = !snapshot.canUndo;
  redoButton.disabled = !snapshot.canRedo;
  statusText.textContent = "BUILD";
  summaryText.textContent = `${snapshot.source.matter.cells.length} Matter · ${snapshot.source.bearings.length} Bearings · ${snapshot.source.torquePatches.length} Torques`;
  diagnosticList.textContent = "RUN will attempt whatever can be physically realized. Nothing here grants permission.";
  diagnosticDetails.open = false;
  refreshContext();
}

function resetWorld(next: FreedomSourceV0): void {
  stopRuntime();
  workspace = new FreedomWorkspace(next);
  pendingIntent = null;
  selectedInterface = null;
  view.setPreviewCells([]);
  refreshIntentButtons();
  refreshBuildView();
  view.focusSource();
}

function refreshIntentButtons(): void {
  for (const button of studio.querySelectorAll<HTMLButtonElement>("[data-intent]")) {
    button.classList.toggle("active", button.dataset.intent === pendingIntent);
  }
  for (const button of studio.querySelectorAll<HTMLButtonElement>("[data-axis]")) {
    button.classList.toggle("active", button.dataset.axis === bearingAxis);
  }
}

function refreshContext(): void {
  if (runtime !== null || selectedInterface === null) {
    contextPod.hidden = true;
    contextPod.innerHTML = "";
    return;
  }
  const current = source();
  const hit = selectedInterface;
  const bearings = current.bearings.filter((bearing) => hit.bearingIds.includes(bearing.id));
  const patches = current.torquePatches.filter((patch) => hit.torquePatchIds.includes(patch.id));
  contextPod.hidden = false;
  const bearingRows = bearings.length === 0
    ? `<div class="context-row"><span>Shared interface</span><button data-context-add-bearing>Add Bearing</button></div>`
    : bearings.map((bearing) => `
      <div class="context-row meaning-row">
        <span><i class="bearing-swatch"></i>Bearing <b>${bearing.freeAxis.toUpperCase()}</b></span>
        <button data-delete-bearing="${bearing.id}" class="danger-soft">Delete</button>
      </div>`).join("");
  const torqueRows = patches.map((patch) => `
    <div class="context-row meaning-row">
      <span><i class="torque-swatch"></i>Torque</span>
      <input data-edit-torque="${patch.id}" type="number" step="5" value="${patch.effortNm}" />
      <button data-delete-torque="${patch.id}" class="danger-soft">Delete</button>
    </div>`).join("");
  contextPod.innerHTML = `
    <div class="context-title">Local interface</div>
    ${bearingRows}
    ${bearings.length > 0 ? `<div class="context-row"><button data-context-add-torque>Add Torque ${effortValue()} Nm</button></div>` : ""}
    ${torqueRows}
    <div class="context-hint">Nothing here blocks RUN. Conflicts become runtime diagnostics.</div>
  `;

  contextPod.querySelector<HTMLButtonElement>("[data-context-add-bearing]")?.addEventListener("click", () => {
    addBearingAt(hit);
  });
  contextPod.querySelector<HTMLButtonElement>("[data-context-add-torque]")?.addEventListener("click", () => {
    addTorqueAt(hit);
  });
  for (const button of contextPod.querySelectorAll<HTMLButtonElement>("[data-delete-bearing]")) {
    button.addEventListener("click", () => {
      const id = button.dataset.deleteBearing;
      if (id === undefined) return;
      const receipt = workspace.removeBearing(id);
      selectedInterface = null;
      refreshBuildView();
      flash(`Removed Bearing${receipt.removedTorquePatchIds.length > 0 ? ` + ${receipt.removedTorquePatchIds.length} dependent Torque` : ""}. Undo restores it.`);
    });
  }
  for (const button of contextPod.querySelectorAll<HTMLButtonElement>("[data-delete-torque]")) {
    button.addEventListener("click", () => {
      const id = button.dataset.deleteTorque;
      if (id === undefined) return;
      workspace.removeTorquePatch(id);
      selectedInterface = null;
      refreshBuildView();
      flash("Removed Torque. Undo restores it.");
    });
  }
  for (const input of contextPod.querySelectorAll<HTMLInputElement>("[data-edit-torque]")) {
    input.addEventListener("change", () => {
      const id = input.dataset.editTorque;
      const value = Number(input.value);
      if (id === undefined || !Number.isFinite(value)) return;
      workspace.editTorquePatch(id, value);
      selectedInterface = null;
      refreshBuildView();
      flash(`Torque set to ${value} Nm.`);
    });
  }
}

function addBearingAt(hit: CanvasInterfaceHit): void {
  const axes = legalAxes(hit.endpointA.face);
  const axis = axes.includes(bearingAxis) ? bearingAxis : axes[0];
  if (axis === undefined) return;
  const id = workspace.addBearing(hit.endpointA, hit.endpointB, axis);
  pendingIntent = null;
  selectedInterface = null;
  refreshIntentButtons();
  refreshBuildView();
  flash(`Added ${id} · axis ${axis.toUpperCase()}.`);
}

function addTorqueAt(hit: CanvasInterfaceHit): void {
  if (hit.bearingIds.length === 0) {
    flash("Torque is local to a Bearing here. Add the Bearing first — RUN itself remains unrestricted.");
    return;
  }
  const id = workspace.addTorquePatch(hit.endpointA, effortValue());
  pendingIntent = null;
  selectedInterface = null;
  refreshIntentButtons();
  refreshBuildView();
  flash(`Added ${id} · ${effortValue()} Nm.`);
}

function interfaceClick(hit: CanvasInterfaceHit): void {
  if (pendingIntent === "bearing") {
    addBearingAt(hit);
    return;
  }
  if (pendingIntent === "torque") {
    addTorqueAt(hit);
    return;
  }
  selectedInterface = hit;
  refreshContext();
}

function previewExtrusion(hit: CanvasMatterHit, count: number): readonly GridPosition[] {
  const current = source();
  const cell = current.matter.cells.find((candidate) => candidate.id === hit.cellId);
  if (cell === undefined) return [];
  const occupied = new Set(current.matter.cells.map((candidate) => gridKey(candidate.grid)));
  const direction = FACE_OFFSETS[hit.face];
  const preview: GridPosition[] = [];
  for (let step = 1; step <= count; step += 1) {
    const grid = addGrid(cell.grid, scaleGrid(direction, step));
    if (occupied.has(gridKey(grid))) break;
    preview.push(grid);
  }
  return preview;
}

function finishExtrusion(event: PointerEvent): void {
  const build = pointerBuild;
  if (build === null) return;
  pointerBuild = null;
  view.setPreviewCells([]);
  const moved = Math.hypot(event.clientX - build.startX, event.clientY - build.startY);
  const count = moved < 7 ? 1 : Math.max(1, Math.min(64, build.previewCount));
  const ids = workspace.extrudeMatterFromFace(build.hit.cellId, build.hit.face, count);
  refreshBuildView();
  if (ids.length === 0) flash("That direction is occupied. Nothing changed.");
  else if (ids.length > 1) flash(`Extruded ${ids.length} Matter cells · one Undo step.`);
}

async function startRuntime(): Promise<void> {
  if (runtime !== null) return;
  const snapshot = workspace.snapshot();
  if (snapshot.source.matter.cells.length === 0) {
    flash("World is empty. Add Matter and RUN whenever you want.");
    return;
  }
  try {
    runtime = await FreedomRuntimeSession.create(snapshot.source, snapshot.generation);
    runtimeRunning = true;
    view.setRuntime(runtime.plan, runtime.snapshots());
    view.setHandState(true, false);
    statusText.textContent = runtime.receipt.quality === "COMPLETE" ? "RUN" : `RUN · ${runtime.receipt.quality}`;
    summaryText.textContent = `${runtime.receipt.bodyCount} bodies · ${runtime.receipt.jointCount} Bearings · ${runtime.receipt.torqueCount} Torques`;
    diagnosticList.innerHTML = runtime.receipt.diagnostics.length === 0
      ? `<div class="diagnostic-ok">Everything authored was realized in this attempt.</div>`
      : runtime.receipt.diagnostics.map((entry) => `<div><b>${entry.subject} · ${entry.sourceId}</b><span>${entry.message}</span></div>`).join("");
    diagnosticDetails.open = runtime.receipt.diagnostics.length > 0;
    selectedInterface = null;
    contextPod.hidden = true;
    runButton.hidden = true;
    for (const element of studio.querySelectorAll<HTMLElement>(".runtime-only")) element.hidden = false;
    pauseButton.textContent = "Pause";
    forcesButton.textContent = "Forces OFF";
    forcesButton.classList.remove("active");
    studio.dataset.runtime = "true";
  } catch (error: unknown) {
    runtime?.dispose();
    runtime = null;
    flash(error instanceof Error ? `Runtime fault: ${error.message}` : "Runtime fault");
  }
}

function stopRuntime(): void {
  runtime?.dispose();
  runtime = null;
  runtimeRunning = false;
  accumulator = 0;
  view.clearRuntime();
  runButton.hidden = false;
  for (const element of studio.querySelectorAll<HTMLElement>(".runtime-only")) element.hidden = true;
  delete studio.dataset.runtime;
  refreshBuildView();
}

function togglePause(): void {
  if (runtime === null) return;
  runtimeRunning = !runtimeRunning;
  pauseButton.textContent = runtimeRunning ? "Pause" : "Resume";
}

function toggleForces(): void {
  if (runtime === null) return;
  runtime.setForcesEnabled(!runtime.forcesEnabled);
  forcesButton.textContent = runtime.forcesEnabled ? "Forces ON" : "Forces OFF";
  forcesButton.classList.toggle("active", runtime.forcesEnabled);
}

function handleIntent(intent: "bearing" | "torque"): void {
  if (runtime !== null) return;
  pendingIntent = pendingIntent === intent ? null : intent;
  selectedInterface = null;
  refreshIntentButtons();
  refreshContext();
  if (pendingIntent !== null) flash(`${pendingIntent === "bearing" ? "Bearing" : "Torque"}: click a local interface. One action, then back to building.`);
}

studio.querySelector<HTMLButtonElement>("[data-action='empty']")?.addEventListener("click", () => resetWorld(createEmptyFreedomSource()));
studio.querySelector<HTMLButtonElement>("[data-action='starter']")?.addEventListener("click", () => resetWorld(createFreedomStarterSource()));
studio.querySelector<HTMLButtonElement>("[data-action='focus']")?.addEventListener("click", () => view.focusSource());
studio.querySelector<HTMLButtonElement>("[data-action='save']")?.addEventListener("click", () => downloadSource(source()));
undoButton.addEventListener("click", () => { if (runtime === null && workspace.undo()) { selectedInterface = null; refreshBuildView(); } });
redoButton.addEventListener("click", () => { if (runtime === null && workspace.redo()) { selectedInterface = null; refreshBuildView(); } });
runButton.addEventListener("click", () => { void startRuntime(); });
pauseButton.addEventListener("click", togglePause);
forcesButton.addEventListener("click", toggleForces);
stopButton.addEventListener("click", stopRuntime);

for (const button of studio.querySelectorAll<HTMLButtonElement>("[data-intent]")) {
  button.addEventListener("click", () => {
    const intent = button.dataset.intent;
    if (intent === "bearing" || intent === "torque") handleIntent(intent);
  });
}
for (const button of studio.querySelectorAll<HTMLButtonElement>("[data-axis]")) {
  button.addEventListener("click", () => {
    const axis = button.dataset.axis;
    if (axis === "x" || axis === "y" || axis === "z") {
      bearingAxis = axis;
      refreshIntentButtons();
    }
  });
}

canvasElement.addEventListener("contextmenu", (event) => event.preventDefault());
canvasElement.addEventListener("wheel", (event) => {
  event.preventDefault();
  view.zoom(event.deltaY);
}, { passive: false });

canvasElement.addEventListener("pointerdown", (event) => {
  if (event.button === 1 || event.button === 2) {
    cameraDrag = { startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastY: event.clientY, pan: event.shiftKey };
    canvasElement.setPointerCapture(event.pointerId);
    return;
  }
  if (event.button !== 0) return;
  const hit = view.hit(event.clientX, event.clientY);
  view.setHover(hit);

  if (runtime !== null) {
    if (hit?.kind === "matter" && hit.planBodyId !== null) {
      runtime.beginHandGrab(hit.planBodyId, hit.worldPoint);
      handDrag = { origin: hit, startX: event.clientX, startY: event.clientY };
      view.setHandState(true, true);
      canvasElement.setPointerCapture(event.pointerId);
    }
    return;
  }

  if (event.altKey && hit?.kind === "matter") {
    const receipt = workspace.removeMatter(hit.cellId);
    selectedInterface = null;
    refreshBuildView();
    flash(`Removed Matter${receipt.removedBearingIds.length > 0 ? ` + ${receipt.removedBearingIds.length} local Bearing` : ""}${receipt.removedTorquePatchIds.length > 0 ? ` + ${receipt.removedTorquePatchIds.length} Torque` : ""}. Undo restores all.`);
    return;
  }
  if (hit?.kind === "interface") {
    interfaceClick(hit);
    return;
  }
  if (hit?.kind === "matter" && pendingIntent === null) {
    pointerBuild = { hit, startX: event.clientX, startY: event.clientY, previewCount: 1 };
    view.setPreviewCells(previewExtrusion(hit, 1));
    canvasElement.setPointerCapture(event.pointerId);
  }
});

canvasElement.addEventListener("pointermove", (event) => {
  if (cameraDrag !== null) {
    const dx = event.clientX - cameraDrag.lastX;
    const dy = event.clientY - cameraDrag.lastY;
    if (cameraDrag.pan) view.pan(dx, dy);
    else view.orbit(dx, dy);
    cameraDrag.lastX = event.clientX;
    cameraDrag.lastY = event.clientY;
    return;
  }
  if (runtime !== null && handDrag !== null) {
    const dx = event.clientX - handDrag.startX;
    const dy = event.clientY - handDrag.startY;
    const scale = Math.max(0.0015, Math.min(0.012, 0.0045));
    runtime.updateHandTarget({
      x: handDrag.origin.worldPoint.x + dx * scale,
      y: handDrag.origin.worldPoint.y - dy * scale,
      z: handDrag.origin.worldPoint.z,
    });
    return;
  }
  if (pointerBuild !== null) {
    const distance = Math.hypot(event.clientX - pointerBuild.startX, event.clientY - pointerBuild.startY);
    pointerBuild.previewCount = Math.max(1, Math.min(64, Math.round(distance / 30)));
    view.setPreviewCells(previewExtrusion(pointerBuild.hit, pointerBuild.previewCount));
    return;
  }
  const hit = view.hit(event.clientX, event.clientY);
  view.setHover(hit);
});

function endPointer(event: PointerEvent): void {
  if (cameraDrag !== null) {
    cameraDrag = null;
  } else if (runtime !== null && handDrag !== null) {
    runtime.endHandGrab();
    handDrag = null;
    view.setHandState(true, false);
  } else if (pointerBuild !== null) {
    finishExtrusion(event);
  }
  if (canvasElement.hasPointerCapture(event.pointerId)) canvasElement.releasePointerCapture(event.pointerId);
}
canvasElement.addEventListener("pointerup", endPointer);
canvasElement.addEventListener("pointercancel", endPointer);

window.addEventListener("resize", () => view.resize());
window.addEventListener("keydown", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || (target instanceof HTMLElement && target.isContentEditable)) return;
  const key = event.key.toLowerCase();
  if (event.key === "Escape") {
    pendingIntent = null;
    selectedInterface = null;
    pointerBuild = null;
    view.setPreviewCells([]);
    refreshIntentButtons();
    refreshContext();
    return;
  }
  if (runtime === null && !event.ctrlKey && !event.metaKey && !event.altKey) {
    if (key === "b") { event.preventDefault(); handleIntent("bearing"); return; }
    if (key === "t") { event.preventDefault(); handleIntent("torque"); return; }
    if (key === "x" || key === "y" || key === "z") {
      bearingAxis = key;
      refreshIntentButtons();
      return;
    }
  }
  if (key === "f") { event.preventDefault(); view.focusSource(); return; }
  if ((event.ctrlKey || event.metaKey) && key === "s") { event.preventDefault(); downloadSource(source()); return; }
  if ((event.ctrlKey || event.metaKey) && key === "z" && runtime === null) {
    event.preventDefault();
    if (event.shiftKey) workspace.redo(); else workspace.undo();
    selectedInterface = null;
    refreshBuildView();
  }
});

function animate(now: number): void {
  const elapsed = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  if (runtime !== null) {
    if (runtimeRunning) {
      accumulator += elapsed;
      let steps = 0;
      while (accumulator >= 1 / 60 && steps < 5) {
        runtime.step(1);
        accumulator -= 1 / 60;
        steps += 1;
      }
    }
    view.setRuntime(runtime.plan, runtime.snapshots());
  }
  view.draw();
  requestAnimationFrame(animate);
}

refreshIntentButtons();
refreshBuildView();
view.focusSource();
requestAnimationFrame(animate);
