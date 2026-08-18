import "./style.css";
import type { MatterCell, PhysicalPlan, RigidBodyPlan, Vec3 } from "./model.js";
import type { Quat, RigidMotion } from "./foundation/spatial.js";
import { addVec3, crossVec3, magnitudeVec3, subtractVec3 } from "./foundation/spatial.js";
import { totalLinearMomentum } from "./foundation/continuity.js";
import { velocityForRotationAboutPivot, type BearingRelationPlan, type BearingRuntimeSnapshot } from "./experiments/anvil-02-bearing.js";
import {
  RebindPhysics,
  compileRebind,
  createRebindFixture,
  transferRebindMotion,
  type BearingKinematics,
} from "./experiments/anvil-03-rebind.js";

const PRE_CUT_STEPS = 31;
const POST_CUT_STEPS = 120;
const MAX_ANCHOR_JUMP_M = 0.00007;
const MAX_ANCHOR_VELOCITY_JUMP_MPS = 0.00007;
const MAX_BEARING_GAP_M = 0.0025;
const MAX_MOMENTUM_ERROR_KG_MPS = 0.75;
const MIN_CONTROL_GAP_M = 0.25;
const MIN_RELATIVE_ANGLE_RAD = 0.35;

interface EvidenceMetric {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly raw?: number;
}
interface EvidenceGate {
  readonly id: string;
  readonly label: string;
  readonly pass: boolean;
  readonly detail: string;
}
interface RebindEvidence {
  readonly metrics: readonly EvidenceMetric[];
  readonly gates: readonly EvidenceGate[];
  readonly pass: boolean;
}
type VisualPhase = "ready" | "before" | "cut" | "after" | "complete";

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (element === null) throw new Error(`REBIND browser gate missing ${selector}`);
  return element;
}
function scale(value: Vec3, scalar: number): Vec3 { return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar }; }
function rotate(rotation: Quat, value: Vec3): Vec3 {
  const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
  const t = crossVec3(qv, value);
  const doubled = scale(t, 2);
  return addVec3(value, addVec3(scale(doubled, rotation.w), crossVec3(qv, doubled)));
}
function cellCenter(cell: MatterCell): Vec3 {
  const size = fixture.bearing.matter.cellSizeM;
  return { x: (cell.grid.x + 0.5) * size, y: (cell.grid.y + 0.5) * size, z: (cell.grid.z + 0.5) * size };
}
function finiteSnapshot(snapshot: BearingRuntimeSnapshot): boolean {
  return [
    snapshot.position.x, snapshot.position.y, snapshot.position.z,
    snapshot.rotation.x, snapshot.rotation.y, snapshot.rotation.z, snapshot.rotation.w,
    snapshot.linearVelocity.x, snapshot.linearVelocity.y, snapshot.linearVelocity.z,
    snapshot.angularVelocity.x, snapshot.angularVelocity.y, snapshot.angularVelocity.z,
    snapshot.massKg, snapshot.localCenter.x, snapshot.localCenter.y, snapshot.localCenter.z,
  ].every(Number.isFinite);
}
function worldPoint(snapshot: BearingRuntimeSnapshot, localPoint: Vec3): Vec3 {
  return addVec3(snapshot.position, rotate(snapshot.rotation, localPoint));
}
function momentum(snapshots: readonly BearingRuntimeSnapshot[]): Vec3 {
  return totalLinearMomentum(snapshots.map((snapshot) => ({ massKg: snapshot.massKg, linearVelocity: snapshot.linearVelocity })));
}
function bodyFor(plan: PhysicalPlan, id: string): RigidBodyPlan {
  const body = plan.bodies.find((candidate) => candidate.id === id);
  if (body === undefined) throw new Error(`REBIND browser missing body ${id}`);
  return body;
}

const fixture = createRebindFixture();
const compilation = compileRebind(fixture);
const before = compilation.before;
const after = compilation.after;
const beforeA = bodyFor(before.physicalPlan, before.relation.bodyAId);
const beforeB = bodyFor(before.physicalPlan, before.relation.bodyBId);
const initialMotion: Readonly<Record<string, RigidMotion>> = {
  [beforeA.id]: {
    position: beforeA.centerOfMassWorld,
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    linearVelocity: addVec3(
      { x: 0.8, y: -0.25, z: 0.35 },
      velocityForRotationAboutPivot({ x: 0, y: 0, z: -0.65 }, beforeA.centerOfMassWorld, before.relation.pivotWorld),
    ),
    angularVelocity: { x: 0, y: 0, z: -0.65 },
  },
  [beforeB.id]: {
    position: beforeB.centerOfMassWorld,
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    linearVelocity: addVec3(
      { x: 0.8, y: -0.25, z: 0.35 },
      velocityForRotationAboutPivot({ x: 0, y: 0, z: 0.95 }, beforeB.centerOfMassWorld, before.relation.pivotWorld),
    ),
    angularVelocity: { x: 0, y: 0, z: 0.95 },
  },
};

const root = required<HTMLDivElement>("#app");
document.title = "PROJECT ANVIL — REBIND";
root.innerHTML = `<header class="topbar"><div><p class="eyebrow">PROJECT ANVIL · ANVIL-03</p><h1>REBIND</h1><p class="subtitle">Czy po podziale poruszającego się elementu połączenie trafia z powrotem we właściwe miejsce?</p></div><div class="status rebind-status" id="rebind-status" data-state="BOOTING">START…</div></header><main class="layout rebind-layout"><section class="viewport-card rebind-viewport-card"><div class="viewport-head"><div><strong>PO LEWEJ: POŁĄCZENIE ODTWORZONE</strong><span>po CUT zielony punkt ma nadal trzymać właściwy nowy kawałek</span></div><div><strong>PO PRAWEJ: BEZ ODTWORZENIA</strong><span>ten sam CUT i ruch, ale połączenie celowo znika</span></div></div><div class="rebind-compare"><figure class="rebind-stage"><figcaption>REBIND <span>po CUT bearing wraca na nowy child</span></figcaption><canvas id="rebind-view" aria-label="REBIND reconstruction simulation"></canvas></figure><figure class="rebind-stage"><figcaption>CONTROL <span>po CUT relation nie jest odtworzona</span></figcaption><canvas id="rebind-control-view" aria-label="REBIND no-relation control"></canvas></figure></div><div class="legend rebind-legend"><span><i></i> część przy połączeniu</span><span><i class="split-mark"></i> nowy odcięty child</span><span><i class="lobe-b"></i> druga strona</span><span><i class="pivot-mark"></i> zielone połączenie</span><span><i class="control-mark"></i> czerwone punkty bez połączenia</span></div></section><aside class="panel rebind-panel"><section><p class="section-label">CO MASZ ZOBACZYĆ</p><p class="note rebind-owner-focus"><strong>Najpierw obie strony są takie same.</strong> Po chwili niebieski element dzieli się na dwa. Po lewej zielone połączenie ma zostać na właściwym nowym kawałku i dalej pozwalać na obrót. Po prawej celowo go nie odtwarzamy, więc czerwone punkty powinny się rozjechać.</p><div class="button-row"><button id="rebind-run" disabled>URUCHOM TEST</button><button id="rebind-reset" disabled>OD NOWA</button></div><p id="rebind-phase" class="note rebind-phase" data-phase="ready">Przygotowuję test…</p><div class="rebind-transaction"><span>PRZED CUT<br><strong>7 cells · 2 bodies · 1 bearing</strong></span><span class="rebind-arrow">→ CUT →</span><span>PO CUT<br><strong>7 cells · 3 bodies · ten sam bearing</strong></span></div><details class="rebind-technical-details"><summary>Szczegóły techniczne — nie musisz tego czytać</summary><div class="rebind-tech-body"><dl id="rebind-metrics" class="metrics"></dl><ul id="rebind-gates" class="gates"></ul></div></details></section><section class="boundary"><p class="section-label">CO TEN TEST NAPRAWDĘ SPRAWDZA</p><p class="rebind-note">Runtime body i runtime joint mogą zostać wyrzucone i zbudowane ponownie. Sprawdzamy, czy trwała informacja o materii i miejscu połączenia wystarcza, żeby po zmianie fizyki odtworzyć połączenie na właściwym kawałku.</p></section></aside></main>`;

const status = required<HTMLElement>("#rebind-status");
const phaseElement = required<HTMLElement>("#rebind-phase");
const runButton = required<HTMLButtonElement>("#rebind-run");
const resetButton = required<HTMLButtonElement>("#rebind-reset");
const metricsElement = required<HTMLDListElement>("#rebind-metrics");
const gatesElement = required<HTMLUListElement>("#rebind-gates");
const leftCanvas = required<HTMLCanvasElement>("#rebind-view");
const rightCanvas = required<HTMLCanvasElement>("#rebind-control-view");
const leftContextCandidate = leftCanvas.getContext("2d");
const rightContextCandidate = rightCanvas.getContext("2d");
if (leftContextCandidate === null || rightContextCandidate === null) throw new Error("REBIND 2D canvas unavailable");
const leftContext: CanvasRenderingContext2D = leftContextCandidate;
const rightContext: CanvasRenderingContext2D = rightContextCandidate;

let beforeRuntime: RebindPhysics | null = null;
let reboundRuntime: RebindPhysics | null = null;
let controlRuntime: RebindPhysics | null = null;
let visualPhase: VisualPhase = "ready";
let evidence: RebindEvidence | null = null;
let busy = false;

function setStatus(machineState: "BOOTING" | "READY" | "RUNNING" | "PASS" | "FAIL", human: string): void {
  status.dataset.state = machineState;
  status.textContent = human;
  status.className = machineState === "PASS" ? "status rebind-status pass" : machineState === "FAIL" ? "status rebind-status fail" : "status rebind-status";
}
function setPhase(value: VisualPhase, text: string): void {
  visualPhase = value;
  phaseElement.dataset.phase = value;
  phaseElement.textContent = text;
}
function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
function resizeCanvas(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}
function resizeCanvases(): void {
  resizeCanvas(leftCanvas, leftContext);
  resizeCanvas(rightCanvas, rightContext);
  drawBoth();
}
window.addEventListener("resize", resizeCanvases);

function project(canvas: HTMLCanvasElement, point: Vec3): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const relative = subtractVec3(point, before.relation.pivotWorld);
  const factor = Math.min(112, Math.max(64, Math.min(rect.width / 6.2, rect.height / 4.6)));
  return {
    x: rect.width * 0.34 + (relative.x - relative.z * 0.22) * factor,
    y: rect.height * 0.52 - relative.y * factor + relative.z * factor * 0.1,
  };
}
function drawGrid(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
  const rect = canvas.getBoundingClientRect();
  context.fillStyle = "#070b12";
  context.fillRect(0, 0, rect.width, rect.height);
  context.strokeStyle = "#142030";
  context.lineWidth = 1;
  for (let n = -5; n <= 7; n += 1) {
    const p0 = project(canvas, { x: n * 0.5, y: -3, z: before.relation.pivotWorld.z });
    const p1 = project(canvas, { x: n * 0.5, y: 3, z: before.relation.pivotWorld.z });
    context.beginPath(); context.moveTo(p0.x, p0.y); context.lineTo(p1.x, p1.y); context.stroke();
    const q0 = project(canvas, { x: -3, y: n * 0.5, z: before.relation.pivotWorld.z });
    const q1 = project(canvas, { x: 5, y: n * 0.5, z: before.relation.pivotWorld.z });
    context.beginPath(); context.moveTo(q0.x, q0.y); context.lineTo(q1.x, q1.y); context.stroke();
  }
}
function cellColor(cell: MatterCell, plan: PhysicalPlan, isAfter: boolean): string {
  if (cell.id.startsWith("b:")) return "#ffb86b";
  if (!isAfter) return "#8bd5ff";
  const bodyId = plan.cellToBody[cell.id];
  return bodyId === after.relation.bodyAId ? "#8bd5ff" : "#a99bff";
}
function drawCell(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  snapshot: BearingRuntimeSnapshot,
  body: RigidBodyPlan,
  cell: MatterCell,
  color: string,
): void {
  const half = fixture.bearing.matter.cellSizeM / 2;
  const local = subtractVec3(cellCenter(cell), body.centerOfMassWorld);
  const corners = [
    { x: local.x - half, y: local.y - half, z: local.z },
    { x: local.x + half, y: local.y - half, z: local.z },
    { x: local.x + half, y: local.y + half, z: local.z },
    { x: local.x - half, y: local.y + half, z: local.z },
  ].map((corner) => project(canvas, worldPoint(snapshot, corner)));
  const first = corners[0];
  if (first === undefined) return;
  context.save();
  context.fillStyle = color;
  context.strokeStyle = "#e8edf5";
  context.globalAlpha = 0.72;
  context.lineWidth = 1.2;
  context.beginPath(); context.moveTo(first.x, first.y);
  for (const corner of corners.slice(1)) context.lineTo(corner.x, corner.y);
  context.closePath(); context.fill();
  context.globalAlpha = 0.92; context.stroke();
  context.restore();
}
function drawCircle(context: CanvasRenderingContext2D, point: { x: number; y: number }, color: string, radius: number): void {
  context.save(); context.strokeStyle = color; context.lineWidth = 2.4;
  context.beginPath(); context.arc(point.x, point.y, radius, 0, Math.PI * 2); context.stroke(); context.restore();
}
function drawRuntime(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  snapshots: readonly BearingRuntimeSnapshot[],
  plan: PhysicalPlan,
  relation: BearingRelationPlan,
  mode: "before" | "rebound" | "control",
): void {
  drawGrid(canvas, context);
  const byBody = new Map(snapshots.map((snapshot) => [snapshot.planBodyId, snapshot] as const));
  const bodies = new Map(plan.bodies.map((body) => [body.id, body] as const));
  const isAfter = mode !== "before";
  for (const cell of fixture.bearing.matter.cells) {
    const bodyId = plan.cellToBody[cell.id];
    if (bodyId === undefined) continue;
    const body = bodies.get(bodyId);
    const snapshot = byBody.get(bodyId);
    if (body === undefined || snapshot === undefined) continue;
    drawCell(canvas, context, snapshot, body, cell, cellColor(cell, plan, isAfter));
  }
  const snapshotA = byBody.get(relation.bodyAId);
  const snapshotB = byBody.get(relation.bodyBId);
  if (snapshotA === undefined || snapshotB === undefined) return;
  const anchorAWorld = worldPoint(snapshotA, relation.localAnchorA);
  const anchorBWorld = worldPoint(snapshotB, relation.localAnchorB);
  const anchorA = project(canvas, anchorAWorld);
  const anchorB = project(canvas, anchorBWorld);
  const isControl = mode === "control";
  const color = isControl ? "#ff8d82" : "#b6ff9e";
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 1.5;
  context.setLineDash([5, 5]);
  context.beginPath(); context.moveTo(anchorA.x, anchorA.y); context.lineTo(anchorB.x, anchorB.y); context.stroke();
  context.setLineDash([]);
  drawCircle(context, anchorA, color, 8);
  drawCircle(context, anchorB, isControl ? "#ffb0a8" : "#d9ffd0", 4.5);
  context.fillStyle = "#8fa2bb";
  context.font = "700 11px ui-monospace, SFMono-Regular, Consolas, monospace";
  const gapMm = magnitudeVec3(subtractVec3(anchorAWorld, anchorBWorld)) * 1000;
  context.fillText(`GAP ${gapMm.toFixed(2)} mm`, 15, 24);
  context.fillText(mode === "before" ? "PRZED CUT · BEARING AKTYWNY" : isControl ? "PO CUT · BEARING NIEODTWORZONY" : "PO CUT · BEARING ODTWORZONY", 15, 42);
  if (mode !== "before") {
    context.fillStyle = "#ffd278";
    context.fillText("CUT: 2 BODY → 3 BODY", 15, 60);
  }
  context.restore();
}
function drawBoth(): void {
  if (visualPhase === "ready" || visualPhase === "before") {
    const snapshots = beforeRuntime?.snapshots() ?? [];
    drawRuntime(leftCanvas, leftContext, snapshots, before.physicalPlan, before.relation, "before");
    drawRuntime(rightCanvas, rightContext, snapshots, before.physicalPlan, before.relation, "before");
    return;
  }
  const reboundSnapshots = reboundRuntime?.snapshots() ?? [];
  const controlSnapshots = controlRuntime?.snapshots() ?? [];
  drawRuntime(leftCanvas, leftContext, reboundSnapshots, after.physicalPlan, after.relation, "rebound");
  drawRuntime(rightCanvas, rightContext, controlSnapshots, after.physicalPlan, after.relation, "control");
}

function renderEvidence(): void {
  if (evidence === null) {
    metricsElement.innerHTML = `<dt>source cells</dt><dd id="metric-rebind-source">7 → 7</dd><dt>runtime bodies</dt><dd id="metric-rebind-bodies">2 → 3</dd><dt>source bearing</dt><dd id="metric-rebind-bearing">1 → 1</dd><dt>endpoint body</dt><dd id="metric-rebind-body-id">${before.relation.bodyAId} → ${after.relation.bodyAId}</dd>`;
    gatesElement.innerHTML = `<li><strong>OCZEKUJE · REBIND</strong><span>Uruchom test, żeby zebrać produkcyjne browser evidence.</span></li>`;
    return;
  }
  metricsElement.innerHTML = evidence.metrics.map((metric) => `<dt>${metric.label}</dt><dd id="metric-${metric.id}"${metric.raw === undefined ? "" : ` data-value="${metric.raw}"`}>${metric.value}</dd>`).join("");
  gatesElement.innerHTML = evidence.gates.map((gate) => `<li class="${gate.pass ? "pass" : ""}" data-gate="${gate.id}" data-pass="${gate.pass}"><strong>${gate.pass ? "PASS" : "FAIL"} · ${gate.label}</strong><span>${gate.detail}</span></li>`).join("");
}

function buildEvidence(args: {
  beforeKinematics: BearingKinematics;
  immediateKinematics: BearingKinematics;
  positionJumpM: number;
  velocityJumpMps: number;
  momentumErrorKgMps: number;
  oneStepGapM: number;
  finalGapM: number;
  controlGapM: number;
  angleRad: number;
  finite: boolean;
}): RebindEvidence {
  const bodyChanged = before.relation.bodyAId !== after.relation.bodyAId;
  const lineageOk = compilation.parentBodyByAfterBodyId[after.relation.bodyAId] === before.relation.bodyAId;
  const gates: EvidenceGate[] = [
    { id: "identity", label: "SOURCE IDENTITY", pass: fixture.bearing.matter.cells.length === 7 && before.relation.sourceBearingId === after.relation.sourceBearingId, detail: "same 7 source cells and same source bearing ID" },
    { id: "topology", label: "2 → 3 BODIES", pass: before.physicalPlan.bodies.length === 2 && after.physicalPlan.bodies.length === 3, detail: "nearby CUT changes the disposable body decomposition" },
    { id: "rebind", label: "ENDPOINT REBOUND", pass: bodyChanged && lineageOk, detail: `${before.relation.bodyAId} → ${after.relation.bodyAId} through source-cell lineage` },
    { id: "position", label: "ANCHOR POSITION CONTINUITY", pass: args.positionJumpM <= MAX_ANCHOR_JUMP_M, detail: `${(args.positionJumpM * 1000).toFixed(6)} mm <= ${(MAX_ANCHOR_JUMP_M * 1000).toFixed(3)} mm` },
    { id: "velocity", label: "ANCHOR VELOCITY CONTINUITY", pass: args.velocityJumpMps <= MAX_ANCHOR_VELOCITY_JUMP_MPS, detail: `${args.velocityJumpMps.toExponential(3)} m/s <= ${MAX_ANCHOR_VELOCITY_JUMP_MPS} m/s` },
    { id: "momentum", label: "LINEAR MOMENTUM", pass: args.momentumErrorKgMps <= MAX_MOMENTUM_ERROR_KG_MPS, detail: `${args.momentumErrorKgMps.toExponential(3)} kg·m/s <= ${MAX_MOMENTUM_ERROR_KG_MPS}` },
    { id: "transaction", label: "TRANSACTION GAP", pass: args.beforeKinematics.anchorGapM <= MAX_BEARING_GAP_M && args.immediateKinematics.anchorGapM <= MAX_BEARING_GAP_M && args.oneStepGapM <= MAX_BEARING_GAP_M, detail: "pre-CUT, immediate and one-step pivot gaps remain bounded" },
    { id: "final", label: "REBIND HOLDS", pass: args.finalGapM <= MAX_BEARING_GAP_M, detail: `${(args.finalGapM * 1000).toFixed(3)} mm <= ${(MAX_BEARING_GAP_M * 1000).toFixed(1)} mm` },
    { id: "control", label: "NO-RELATION CONTROL", pass: args.controlGapM >= MIN_CONTROL_GAP_M, detail: `${args.controlGapM.toFixed(3)} m >= ${MIN_CONTROL_GAP_M} m` },
    { id: "rotation", label: "FREE ROTATION", pass: Math.abs(args.angleRad) >= MIN_RELATIVE_ANGLE_RAD, detail: `${Math.abs(args.angleRad).toFixed(3)} rad >= ${MIN_RELATIVE_ANGLE_RAD} rad` },
    { id: "finite", label: "FINITE POST-CUT STATE", pass: args.finite, detail: "all replacement runtime snapshots remain finite" },
  ];
  const metrics: EvidenceMetric[] = [
    { id: "rebind-source", label: "source cells", value: "7 → 7" },
    { id: "rebind-bodies", label: "runtime bodies", value: "2 → 3" },
    { id: "rebind-bearing", label: "source bearing", value: "1 → 1" },
    { id: "rebind-body-id", label: "endpoint body", value: `${before.relation.bodyAId} → ${after.relation.bodyAId}` },
    { id: "rebind-position-jump", label: "max anchor jump", value: `${(args.positionJumpM * 1000).toFixed(6)} mm`, raw: args.positionJumpM },
    { id: "rebind-velocity-jump", label: "max anchor velocity jump", value: `${args.velocityJumpMps.toExponential(3)} m/s`, raw: args.velocityJumpMps },
    { id: "rebind-momentum", label: "linear momentum error", value: `${args.momentumErrorKgMps.toExponential(3)} kg·m/s`, raw: args.momentumErrorKgMps },
    { id: "rebind-gap", label: "final bearing gap", value: `${(args.finalGapM * 1000).toFixed(3)} mm`, raw: args.finalGapM },
    { id: "rebind-control", label: "no-relation gap", value: `${args.controlGapM.toFixed(3)} m`, raw: args.controlGapM },
    { id: "rebind-angle", label: "relative angle", value: `${args.angleRad.toFixed(3)} rad`, raw: args.angleRad },
  ];
  return { metrics, gates, pass: gates.every((gate) => gate.pass) };
}

async function disposeAll(): Promise<void> {
  beforeRuntime?.dispose();
  reboundRuntime?.dispose();
  controlRuntime?.dispose();
  beforeRuntime = null;
  reboundRuntime = null;
  controlRuntime = null;
}
async function resetSimulation(): Promise<void> {
  if (busy) return;
  await disposeAll();
  evidence = null;
  renderEvidence();
  setStatus("BOOTING", "START…");
  setPhase("ready", "Przygotowuję test…");
  runButton.disabled = true;
  resetButton.disabled = true;
  try {
    beforeRuntime = await RebindPhysics.create(before, fixture.bearing.matter.materials, initialMotion, true);
    setPhase("ready", "Gotowe. Kliknij „URUCHOM TEST”.");
    setStatus("READY", "GOTOWE");
    runButton.disabled = false;
    resetButton.disabled = false;
    resizeCanvases();
  } catch (error: unknown) {
    setStatus("FAIL", "TEST: PROBLEM");
    setPhase("complete", `Nie udało się przygotować testu: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

async function runSimulation(): Promise<void> {
  if (busy || beforeRuntime === null) return;
  busy = true;
  runButton.disabled = true;
  resetButton.disabled = true;
  evidence = null;
  renderEvidence();
  setStatus("RUNNING", "TEST TRWA");
  try {
    setPhase("before", "Najpierw oba przykłady są identyczne — bearing działa po obu stronach.");
    for (let step = 0; step < PRE_CUT_STEPS; step += 1) {
      beforeRuntime.step(1);
      drawBoth();
      await nextFrame();
    }
    const beforeSnapshots = beforeRuntime.snapshots();
    const beforeKinematics = beforeRuntime.bearingKinematics();
    const beforeMomentum = momentum(beforeSnapshots);
    const transferred = transferRebindMotion(compilation, beforeSnapshots);
    beforeRuntime.dispose();
    beforeRuntime = null;

    [reboundRuntime, controlRuntime] = await Promise.all([
      RebindPhysics.create(after, fixture.bearing.matter.materials, transferred, true),
      RebindPhysics.create(after, fixture.bearing.matter.materials, transferred, false),
    ]);
    const immediateSnapshots = reboundRuntime.snapshots();
    const immediateKinematics = reboundRuntime.bearingKinematics();
    const positionJumpM = Math.max(
      magnitudeVec3(subtractVec3(immediateKinematics.anchorAWorld, beforeKinematics.anchorAWorld)),
      magnitudeVec3(subtractVec3(immediateKinematics.anchorBWorld, beforeKinematics.anchorBWorld)),
    );
    const velocityJumpMps = Math.max(
      magnitudeVec3(subtractVec3(immediateKinematics.anchorVelocityA, beforeKinematics.anchorVelocityA)),
      magnitudeVec3(subtractVec3(immediateKinematics.anchorVelocityB, beforeKinematics.anchorVelocityB)),
    );
    const momentumErrorKgMps = magnitudeVec3(subtractVec3(momentum(immediateSnapshots), beforeMomentum));

    setPhase("cut", "CUT wykonany: 2 body → 3 body. Patrz, co dzieje się z połączeniem.");
    drawBoth();
    for (let pause = 0; pause < 10; pause += 1) await nextFrame();

    let oneStepGapM = Number.NaN;
    setPhase("after", "Po lewej bearing jest odtworzony na właściwym nowym kawałku. Po prawej go nie ma.");
    for (let step = 0; step < POST_CUT_STEPS; step += 1) {
      reboundRuntime.step(1);
      controlRuntime.step(1);
      if (step === 0) oneStepGapM = reboundRuntime.bearingKinematics().anchorGapM;
      drawBoth();
      await nextFrame();
    }

    const finalKinematics = reboundRuntime.bearingKinematics();
    const controlKinematics = controlRuntime.bearingKinematics();
    const angle = reboundRuntime.bearingAngleRad();
    if (angle === null) throw new Error("REBIND browser lost the recreated revolute relation");
    const finite = reboundRuntime.snapshots().every(finiteSnapshot) && controlRuntime.snapshots().every(finiteSnapshot);
    evidence = buildEvidence({
      beforeKinematics,
      immediateKinematics,
      positionJumpM,
      velocityJumpMps,
      momentumErrorKgMps,
      oneStepGapM,
      finalGapM: finalKinematics.anchorGapM,
      controlGapM: controlKinematics.anchorGapM,
      angleRad: angle,
      finite,
    });
    renderEvidence();
    setPhase("complete", evidence.pass ? "Gotowe. Po lewej połączenie przetrwało przebudowę; po prawej control się rozjechał." : "Test wykrył problem. Rozwiń szczegóły techniczne.");
    setStatus(evidence.pass ? "PASS" : "FAIL", evidence.pass ? "TEST: OK" : "TEST: PROBLEM");
    drawBoth();
  } catch (error: unknown) {
    setStatus("FAIL", "TEST: PROBLEM");
    setPhase("complete", `Test zatrzymał się: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  } finally {
    busy = false;
    resetButton.disabled = false;
    runButton.disabled = visualPhase === "complete";
  }
}

runButton.addEventListener("click", () => { void runSimulation(); });
resetButton.addEventListener("click", () => { void resetSimulation(); });
window.addEventListener("beforeunload", () => { void disposeAll(); });
renderEvidence();
void resetSimulation();
