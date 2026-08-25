import "./studio.css";
import type { BearingAxis, BearingEndpoint } from "../experiments/anvil-02-bearing.js";
import type { Vec3 } from "../model.js";
import { realizeFreedomSource, type FreedomDiagnostic, type FreedomRealizationPlan } from "../studio-recovery/realize.js";
import { FreedomRuntimeSession } from "../studio-recovery/runtime.js";
import {
  FreedomWorkspace,
  createEmptyFreedomSource,
  createFreedomStarterSource,
  type FreedomSnapshot,
} from "../studio-recovery/source.js";
import { R2WorldCanvas, type R2InterfaceHit, type R2MatterHit } from "./world.js";

type R2Intent =
  | { readonly kind: "neutral" }
  | { readonly kind: "bearing" }
  | { readonly kind: "torque" }
  | { readonly kind: "rebind-bearing"; readonly id: string }
  | { readonly kind: "retarget-torque"; readonly id: string };

type PointerState =
  | { readonly kind: "camera"; readonly pointerId: number; x: number; y: number; readonly pan: boolean }
  | { readonly kind: "build"; readonly pointerId: number; readonly hit: R2MatterHit; readonly startX: number; readonly startY: number; count: number }
  | { readonly kind: "hand"; readonly pointerId: number; readonly startX: number; readonly startY: number; readonly anchor: Vec3 };

interface R2Telemetry {
  authoredActions: number;
  intentChanges: number;
  contextOpens: number;
  runAttempts: number;
  runDisabledAttempts: number;
  automaticAuthoredMutations: number;
  inputChannels: Set<string>;
}

const appRoot = document.querySelector<HTMLElement>("#app");
if (appRoot === null) throw new Error("R2 Studio requires #app");
const root: HTMLElement = appRoot;

root.innerHTML = `
  <main class="r2-studio" data-runtime="build" data-intent="neutral" data-run-disabled="false">
    <canvas class="r2-world" data-r2-world tabindex="0" aria-label="ANVIL physical world"></canvas>
    <div class="r2-island r2-workspace" data-r2-workspace>
      <button type="button" data-action="new">New</button>
      <button type="button" data-action="starter">Starter</button>
      <button type="button" data-action="seed">Seed</button>
      <button type="button" data-action="undo">Undo</button>
      <button type="button" data-action="redo">Redo</button>
      <button type="button" data-action="focus">Focus</button>
    </div>
    <div class="r2-island r2-runtime" data-r2-runtime>
      <button class="r2-primary" type="button" data-action="run">RUN</button>
      <button type="button" data-action="forces" hidden>Forces OFF</button>
      <button type="button" data-action="restart" hidden>Restart</button>
      <button type="button" data-action="stop" hidden>STOP</button>
    </div>
    <div class="r2-island r2-intent" data-r2-intent hidden></div>
    <aside class="r2-island r2-context" data-r2-context hidden></aside>
    <div class="r2-island r2-receipt" data-r2-receipt></div>
  </main>
`;

function requireElement<T extends Element>(parent: ParentNode, selector: string): T {
  const element = parent.querySelector<T>(selector);
  if (element === null) throw new Error(`R2 Studio shell missing ${selector}`);
  return element;
}

const shell = requireElement<HTMLElement>(root, ".r2-studio");
const canvas = requireElement<HTMLCanvasElement>(root, "[data-r2-world]");
const contextPod = requireElement<HTMLElement>(root, "[data-r2-context]");
const intentPod = requireElement<HTMLElement>(root, "[data-r2-intent]");
const receiptPod = requireElement<HTMLElement>(root, "[data-r2-receipt]");
const seedButton = requireElement<HTMLButtonElement>(root, "[data-action=seed]");
const runButton = requireElement<HTMLButtonElement>(root, "[data-action=run]");
const forcesButton = requireElement<HTMLButtonElement>(root, "[data-action=forces]");
const restartButton = requireElement<HTMLButtonElement>(root, "[data-action=restart]");
const stopButton = requireElement<HTMLButtonElement>(root, "[data-action=stop]");

let workspace = new FreedomWorkspace(createFreedomStarterSource());
let snapshot: FreedomSnapshot = workspace.snapshot();
let evidence: FreedomRealizationPlan = realizeFreedomSource(snapshot.source);
let runtime: FreedomRuntimeSession | null = null;
let intent: R2Intent = { kind: "neutral" };
let pointer: PointerState | null = null;
let selectedInterface: R2InterfaceHit | null = null;
let startingRuntime = false;
let lastFrameTime = performance.now();
let accumulator = 0;
const world = new R2WorldCanvas(canvas);
const telemetry: R2Telemetry = {
  authoredActions: 0,
  intentChanges: 0,
  contextOpens: 0,
  runAttempts: 0,
  runDisabledAttempts: 0,
  automaticAuthoredMutations: 0,
  inputChannels: new Set(),
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/gu, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[character] ?? character));
}

function emitInput(channel: string): void {
  telemetry.inputChannels.add(channel);
  shell.dispatchEvent(new CustomEvent("anvil-r2-input", { detail: { channel } }));
  syncTelemetry();
}

function syncTelemetry(): void {
  shell.dataset.telemetry = JSON.stringify({
    authoredActions: telemetry.authoredActions,
    intentChanges: telemetry.intentChanges,
    contextOpens: telemetry.contextOpens,
    runAttempts: telemetry.runAttempts,
    runDisabledAttempts: telemetry.runDisabledAttempts,
    automaticAuthoredMutations: telemetry.automaticAuthoredMutations,
    inputChannels: [...telemetry.inputChannels].sort(),
  });
}

function defaultAxis(endpoint: BearingEndpoint): BearingAxis {
  if (endpoint.face === "x-" || endpoint.face === "x+") return "z";
  if (endpoint.face === "y-" || endpoint.face === "y+") return "x";
  return "y";
}

function sameEndpoint(a: BearingEndpoint, b: BearingEndpoint): boolean {
  return a.cellId === b.cellId && a.face === b.face;
}

function diagnosticsFor(id: string): readonly FreedomDiagnostic[] {
  return evidence.diagnostics.filter((entry) => entry.sourceId === id);
}

function currentInterfaceMeanings(hit: R2InterfaceHit): { bearingIds: string[]; torqueIds: string[] } {
  const source = snapshot.source;
  const bearingIds = source.bearings.filter((bearing) =>
    (sameEndpoint(bearing.endpointA, hit.endpointA) && sameEndpoint(bearing.endpointB, hit.endpointB)) ||
    (sameEndpoint(bearing.endpointA, hit.endpointB) && sameEndpoint(bearing.endpointB, hit.endpointA)),
  ).map((bearing) => bearing.id);
  const torqueIds = source.torquePatches.filter((patch) => sameEndpoint(patch.target, hit.endpointA) || sameEndpoint(patch.target, hit.endpointB)).map((patch) => patch.id);
  return { bearingIds, torqueIds };
}

function setIntent(next: R2Intent): void {
  if (intent.kind !== next.kind || ("id" in intent && "id" in next && intent.id !== next.id)) telemetry.intentChanges += 1;
  intent = next;
  shell.dataset.intent = intent.kind;
  if (intent.kind === "neutral") {
    intentPod.hidden = true;
    intentPod.textContent = "";
  } else {
    intentPod.hidden = false;
    intentPod.textContent = intent.kind === "bearing"
      ? "Bearing · click a shared interface · Esc cancel"
      : intent.kind === "torque"
        ? "Torque · click a local interface · Esc cancel"
        : intent.kind === "rebind-bearing"
          ? `Rebind ${intent.id} · click a new shared interface · Esc cancel`
          : `Retarget ${intent.id} · click a new local interface · Esc cancel`;
  }
  syncTelemetry();
}

function renderReceipt(extra?: string): void {
  const authored = snapshot.source;
  const receipt = `${evidence.quality} · Matter ${authored.matter.cells.length} · Bearing ${evidence.realizedCounts.bearings}/${authored.bearings.length} · Torque ${evidence.realizedCounts.torques}/${authored.torquePatches.length}`;
  receiptPod.textContent = extra === undefined ? receipt : `${receipt} · ${extra}`;
}

function syncShell(): void {
  shell.dataset.sourceGeneration = String(snapshot.generation);
  shell.dataset.quality = evidence.quality;
  shell.dataset.cells = String(snapshot.source.matter.cells.length);
  shell.dataset.bearings = String(snapshot.source.bearings.length);
  shell.dataset.torques = String(snapshot.source.torquePatches.length);
  shell.dataset.realizedBearings = String(evidence.realizedCounts.bearings);
  shell.dataset.realizedTorques = String(evidence.realizedCounts.torques);
  shell.dataset.diagnostics = String(evidence.diagnostics.length);
  shell.dataset.runDisabled = "false";
  seedButton.hidden = snapshot.source.matter.cells.length !== 0 || runtime !== null;
  runButton.hidden = runtime !== null;
  forcesButton.hidden = runtime === null;
  restartButton.hidden = runtime === null;
  stopButton.hidden = runtime === null;
  shell.dataset.runtime = runtime === null ? (startingRuntime ? "starting" : "build") : "running";
  shell.dataset.hand = runtime?.handActive === true ? "active" : "ready";
  if (runtime !== null) {
    forcesButton.textContent = runtime.forcesEnabled ? "Forces ON" : "Forces OFF";
    forcesButton.classList.toggle("r2-force-on", runtime.forcesEnabled);
  }
  syncTelemetry();
}

function refreshAuthoring(extra?: string): void {
  snapshot = workspace.snapshot();
  evidence = realizeFreedomSource(snapshot.source);
  world.setSource(snapshot.source, evidence);
  world.draw();
  renderReceipt(extra);
  syncShell();
  renderContext();
}

function renderDiagnostic(entries: readonly FreedomDiagnostic[]): string {
  return entries.map((entry) => `<div class="r2-diagnostic ${entry.code.includes("DUPLICATE") ? "r2-conflict" : ""}">${escapeHtml(entry.code)} · ${escapeHtml(entry.message)}</div>`).join("");
}

function renderContext(): void {
  const hit = selectedInterface;
  if (runtime !== null || hit === null) {
    contextPod.hidden = true;
    contextPod.innerHTML = "";
    return;
  }
  const meanings = currentInterfaceMeanings(hit);
  const bearings = meanings.bearingIds.map((id) => snapshot.source.bearings.find((entry) => entry.id === id)).filter((entry) => entry !== undefined);
  const torques = meanings.torqueIds.map((id) => snapshot.source.torquePatches.find((entry) => entry.id === id)).filter((entry) => entry !== undefined);
  const bearingMarkup = bearings.map((bearing) => `
    <div class="r2-meaning" data-bearing="${escapeHtml(bearing.id)}">
      <div class="r2-meaning-head"><span class="r2-meaning-id">Bearing ${escapeHtml(bearing.id)}</span><button class="r2-danger" data-delete-bearing="${escapeHtml(bearing.id)}">Delete</button></div>
      <div class="r2-meaning-controls">
        <label>axis <select data-bearing-axis="${escapeHtml(bearing.id)}"><option value="x" ${bearing.freeAxis === "x" ? "selected" : ""}>x</option><option value="y" ${bearing.freeAxis === "y" ? "selected" : ""}>y</option><option value="z" ${bearing.freeAxis === "z" ? "selected" : ""}>z</option></select></label>
        <button data-rebind-bearing="${escapeHtml(bearing.id)}">Rebind</button>
      </div>
      ${renderDiagnostic(diagnosticsFor(bearing.id))}
    </div>`).join("");
  const torqueMarkup = torques.map((patch) => `
    <div class="r2-meaning" data-torque="${escapeHtml(patch.id)}">
      <div class="r2-meaning-head"><span class="r2-meaning-id">Torque ${escapeHtml(patch.id)}</span><button class="r2-danger" data-delete-torque="${escapeHtml(patch.id)}">Delete</button></div>
      <div class="r2-meaning-controls">
        <label>Nm <input type="number" step="1" value="${patch.effortNm}" data-torque-effort="${escapeHtml(patch.id)}"></label>
        <button data-apply-torque="${escapeHtml(patch.id)}">Apply</button>
        <button data-retarget-torque="${escapeHtml(patch.id)}">Retarget</button>
      </div>
      ${renderDiagnostic(diagnosticsFor(patch.id))}
    </div>`).join("");
  contextPod.innerHTML = `
    <h3>Local interface</h3>
    <p class="r2-small">${escapeHtml(hit.endpointA.cellId)}@${hit.endpointA.face} ↔ ${escapeHtml(hit.endpointB.cellId)}@${hit.endpointB.face}</p>
    <div class="r2-meaning-controls"><button data-add-bearing>B Bearing</button><button data-add-torque>T Torque</button></div>
    ${bearingMarkup}${torqueMarkup}
  `;
  contextPod.hidden = false;
}

function afterAuthoredAction(channel: string, extra?: string): void {
  telemetry.authoredActions += 1;
  emitInput(channel);
  refreshAuthoring(extra);
}

function resetWorkspace(kind: "new" | "starter"): void {
  if (runtime !== null || startingRuntime) return;
  workspace = new FreedomWorkspace(kind === "new" ? createEmptyFreedomSource() : createFreedomStarterSource());
  selectedInterface = null;
  setIntent({ kind: "neutral" });
  telemetry.authoredActions += 1;
  emitInput(kind);
  refreshAuthoring(kind === "new" ? "empty authored world" : "starter has Matter only · no hidden meaning");
  world.focusSource();
}

async function startRuntime(): Promise<void> {
  if (runtime !== null || startingRuntime) return;
  telemetry.runAttempts += 1;
  emitInput("run");
  startingRuntime = true;
  selectedInterface = null;
  setIntent({ kind: "neutral" });
  syncShell();
  const startSnapshot = workspace.snapshot();
  try {
    const next = await FreedomRuntimeSession.create(startSnapshot.source, startSnapshot.generation);
    if (workspace.snapshot().generation !== startSnapshot.generation) {
      next.dispose();
      throw new Error("Authored source changed while runtime was starting");
    }
    runtime = next;
    world.setRuntime(next.plan, next.frame().bodies);
    world.setHandState(true, false);
    world.draw();
    accumulator = 0;
    lastFrameTime = performance.now();
    renderReceipt(`${next.receipt.quality} runtime · ${next.receipt.diagnostics.length} diagnostic(s)`);
  } catch (error: unknown) {
    renderReceipt(`runtime fault · ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    startingRuntime = false;
    syncShell();
    renderContext();
  }
}

function stopRuntime(reason = "STOP · authored source preserved"): void {
  const active = runtime;
  if (active === null) return;
  try {
    if (active.handActive) active.endHandGrab();
  } finally {
    active.dispose();
    runtime = null;
    pointer = null;
    world.clearRuntime();
    world.setPreviewCells([]);
    refreshAuthoring(reason);
    emitInput("stop");
  }
}

async function restartRuntime(): Promise<void> {
  if (runtime === null) return;
  emitInput("restart");
  const active = runtime;
  try {
    if (active.handActive) active.endHandGrab();
  } finally {
    active.dispose();
    runtime = null;
    world.clearRuntime();
  }
  await startRuntime();
}

function applyInterfaceIntent(hit: R2InterfaceHit): void {
  if (runtime !== null) return;
  if (intent.kind === "bearing") {
    workspace.addBearing(hit.endpointA, hit.endpointB, defaultAxis(hit.endpointA));
    setIntent({ kind: "neutral" });
    selectedInterface = hit;
    afterAuthoredAction("bearing");
    return;
  }
  if (intent.kind === "torque") {
    workspace.addTorquePatch(hit.endpointA, 20);
    setIntent({ kind: "neutral" });
    selectedInterface = hit;
    afterAuthoredAction("torque");
    return;
  }
  if (intent.kind === "rebind-bearing") {
    const id = intent.id;
    const bearing = snapshot.source.bearings.find((entry) => entry.id === id);
    if (bearing !== undefined) workspace.rebindBearing(bearing.id, hit.endpointA, hit.endpointB, bearing.freeAxis);
    setIntent({ kind: "neutral" });
    selectedInterface = hit;
    afterAuthoredAction("rebind", `rebound ${id}`);
    return;
  }
  if (intent.kind === "retarget-torque") {
    const id = intent.id;
    const patch = snapshot.source.torquePatches.find((entry) => entry.id === id);
    if (patch !== undefined) workspace.retargetTorquePatch(patch.id, hit.endpointA);
    setIntent({ kind: "neutral" });
    selectedInterface = hit;
    afterAuthoredAction("retarget", `retargeted ${id}`);
    return;
  }
  selectedInterface = hit;
  telemetry.contextOpens += 1;
  emitInput("context");
  renderContext();
}

function exactDeleteInterface(hit: R2InterfaceHit): void {
  const meanings = currentInterfaceMeanings(hit);
  const total = meanings.bearingIds.length + meanings.torqueIds.length;
  if (total !== 1) {
    selectedInterface = hit;
    telemetry.contextOpens += 1;
    emitInput("context");
    renderContext();
    return;
  }
  if (meanings.torqueIds.length === 1) workspace.removeTorquePatch(meanings.torqueIds[0] ?? "");
  else workspace.removeBearing(meanings.bearingIds[0] ?? "");
  selectedInterface = hit;
  afterAuthoredAction("delete");
}

canvas.addEventListener("contextmenu", (event) => event.preventDefault());
canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  world.zoom(event.deltaY);
  emitInput("zoom");
}, { passive: false });

canvas.addEventListener("pointerdown", (event) => {
  canvas.focus();
  if (event.button === 1) {
    pointer = { kind: "camera", pointerId: event.pointerId, x: event.clientX, y: event.clientY, pan: event.shiftKey };
    canvas.setPointerCapture(event.pointerId);
    emitInput(event.shiftKey ? "pan" : "orbit");
    return;
  }
  if (event.button !== 0) return;
  const hit = world.hit(event.clientX, event.clientY);
  world.setHover(hit);
  if (runtime !== null) {
    if (hit?.kind !== "matter" || hit.planBodyId === null) return;
    runtime.beginHandGrab(hit.planBodyId, hit.worldPoint);
    pointer = { kind: "hand", pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, anchor: { ...hit.worldPoint } };
    canvas.setPointerCapture(event.pointerId);
    world.setHandState(true, true);
    shell.dataset.hand = "active";
    emitInput("hand");
    return;
  }
  if (event.altKey && hit?.kind === "matter") {
    workspace.removeMatter(hit.cellId);
    selectedInterface = null;
    afterAuthoredAction("delete", `exact-delete Matter ${hit.cellId}`);
    return;
  }
  if (event.altKey && hit?.kind === "interface") {
    exactDeleteInterface(hit);
    return;
  }
  if (hit?.kind === "interface") {
    applyInterfaceIntent(hit);
    return;
  }
  if (intent.kind !== "neutral") return;
  if (hit?.kind === "matter") {
    selectedInterface = null;
    pointer = { kind: "build", pointerId: event.pointerId, hit, startX: event.clientX, startY: event.clientY, count: 1 };
    canvas.setPointerCapture(event.pointerId);
    world.setPreviewCells(world.previewFor(hit, 1));
    emitInput("build");
  } else {
    selectedInterface = null;
    renderContext();
  }
});

canvas.addEventListener("pointermove", (event) => {
  const active = pointer;
  if (active?.kind === "camera" && active.pointerId === event.pointerId) {
    const dx = event.clientX - active.x;
    const dy = event.clientY - active.y;
    active.x = event.clientX;
    active.y = event.clientY;
    if (active.pan) world.pan(dx, dy); else world.orbit(dx, dy);
    return;
  }
  if (active?.kind === "build" && active.pointerId === event.pointerId) {
    active.count = world.extrusionCount(active.hit, active.startX, active.startY, event.clientX, event.clientY);
    world.setPreviewCells(world.previewFor(active.hit, active.count));
    return;
  }
  if (active?.kind === "hand" && active.pointerId === event.pointerId && runtime !== null) {
    const delta = world.worldDeltaForScreenDrag(active.anchor, event.clientX - active.startX, event.clientY - active.startY);
    runtime.updateHandTarget({ x: active.anchor.x + delta.x, y: active.anchor.y + delta.y, z: active.anchor.z + delta.z });
    return;
  }
  const hit = world.hit(event.clientX, event.clientY);
  world.setHover(hit);
});

function releasePointer(event: PointerEvent): void {
  const active = pointer;
  if (active === null || active.pointerId !== event.pointerId) return;
  pointer = null;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  if (active.kind === "build") {
    const added = workspace.extrudeMatterFromFace(active.hit.cellId, active.hit.face, active.count);
    world.setPreviewCells([]);
    if (added.length > 0) afterAuthoredAction("build", `extruded ${added.length} cell(s)`);
    else refreshAuthoring("Matter unchanged · path occupied");
  } else if (active.kind === "hand" && runtime !== null) {
    runtime.endHandGrab();
    world.setHandState(true, false);
    shell.dataset.hand = "ready";
  }
}
canvas.addEventListener("pointerup", releasePointer);
canvas.addEventListener("pointercancel", (event) => {
  if (pointer?.kind === "build") world.setPreviewCells([]);
  if (pointer?.kind === "hand" && runtime !== null && runtime.handActive) runtime.endHandGrab();
  pointer = null;
  world.setHandState(runtime !== null, false);
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
});

root.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = target.dataset.action;
  if (action === "new") resetWorkspace("new");
  else if (action === "starter") resetWorkspace("starter");
  else if (action === "seed" && runtime === null && snapshot.source.matter.cells.length === 0) {
    workspace.addSeedMatter();
    afterAuthoredAction("seed");
    world.focusSource();
  } else if (action === "undo" && runtime === null) {
    if (workspace.undo()) afterAuthoredAction("undo");
  } else if (action === "redo" && runtime === null) {
    if (workspace.redo()) afterAuthoredAction("redo");
  } else if (action === "focus") {
    world.focusSource();
    emitInput("focus");
  } else if (action === "run") void startRuntime();
  else if (action === "forces" && runtime !== null) {
    runtime.setForcesEnabled(!runtime.forcesEnabled);
    emitInput("forces");
    syncShell();
  } else if (action === "restart") void restartRuntime();
  else if (action === "stop") stopRuntime();

  const deleteBearing = target.dataset.deleteBearing;
  if (deleteBearing !== undefined && runtime === null) {
    workspace.removeBearing(deleteBearing);
    afterAuthoredAction("delete", `exact-delete Bearing ${deleteBearing}`);
  }
  const deleteTorque = target.dataset.deleteTorque;
  if (deleteTorque !== undefined && runtime === null) {
    workspace.removeTorquePatch(deleteTorque);
    afterAuthoredAction("delete", `exact-delete Torque ${deleteTorque}`);
  }
  const rebindBearing = target.dataset.rebindBearing;
  if (rebindBearing !== undefined && runtime === null) setIntent({ kind: "rebind-bearing", id: rebindBearing });
  const retargetTorque = target.dataset.retargetTorque;
  if (retargetTorque !== undefined && runtime === null) setIntent({ kind: "retarget-torque", id: retargetTorque });
  if (target.hasAttribute("data-add-bearing") && runtime === null) setIntent({ kind: "bearing" });
  if (target.hasAttribute("data-add-torque") && runtime === null) setIntent({ kind: "torque" });
  const applyTorque = target.dataset.applyTorque;
  if (applyTorque !== undefined && runtime === null) {
    const input = contextPod.querySelector<HTMLInputElement>(`[data-torque-effort="${CSS.escape(applyTorque)}"]`);
    const effort = input === null ? Number.NaN : Number(input.value);
    if (Number.isFinite(effort)) {
      workspace.editTorquePatch(applyTorque, effort);
      afterAuthoredAction("torque-edit", `Torque ${applyTorque} = ${effort} Nm`);
    }
  }
});

contextPod.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement) || runtime !== null) return;
  const bearingId = target.dataset.bearingAxis;
  if (bearingId === undefined) return;
  const bearing = snapshot.source.bearings.find((entry) => entry.id === bearingId);
  const axis = target.value;
  if (bearing === undefined || (axis !== "x" && axis !== "y" && axis !== "z")) return;
  workspace.rebindBearing(bearing.id, bearing.endpointA, bearing.endpointB, axis);
  afterAuthoredAction("bearing-edit", `Bearing ${bearing.id} axis ${axis}`);
});

window.addEventListener("keydown", (event) => {
  const target = event.target;
  const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
  if (typing) return;
  if (event.key === "Escape") {
    setIntent({ kind: "neutral" });
    if (pointer?.kind === "build") world.setPreviewCells([]);
    pointer = null;
    return;
  }
  if (runtime === null && !event.ctrlKey && !event.metaKey && !event.altKey) {
    if (event.key.toLowerCase() === "b") { setIntent({ kind: "bearing" }); emitInput("intent-bearing"); return; }
    if (event.key.toLowerCase() === "t") { setIntent({ kind: "torque" }); emitInput("intent-torque"); return; }
  }
  if (event.key.toLowerCase() === "f") { world.focusSource(); emitInput("focus"); return; }
  if (runtime === null && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    const changed = event.shiftKey ? workspace.redo() : workspace.undo();
    if (changed) afterAuthoredAction(event.shiftKey ? "redo" : "undo");
  }
});

window.addEventListener("resize", () => world.resize());

function animate(now: number): void {
  const active = runtime;
  if (active !== null) {
    const elapsed = Math.min(0.1, Math.max(0, (now - lastFrameTime) / 1000));
    lastFrameTime = now;
    accumulator += elapsed;
    let steps = 0;
    try {
      while (accumulator >= 1 / 60 && steps < 4) {
        active.step(1);
        accumulator -= 1 / 60;
        steps += 1;
      }
      world.setRuntime(active.plan, active.frame().bodies);
      shell.dataset.hand = active.handActive ? "active" : "ready";
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      stopRuntime(`solver/runtime fault · ${message}`);
    }
  } else {
    lastFrameTime = now;
    accumulator = 0;
  }
  world.draw();
  requestAnimationFrame(animate);
}

refreshAuthoring("R2 · Owner Authority core active");
world.focusSource();
requestAnimationFrame(animate);
