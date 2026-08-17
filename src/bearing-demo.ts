import "./style.css";
import "./bearing-demo.css";
import { compileMatter } from "./compiler.js";
import type { MatterCell, RigidBodyPlan, Vec3 } from "./model.js";
import type { Quat } from "./foundation/spatial.js";
import {
  BearingPhysics,
  compileBearing,
  createBearingFixture,
  velocityForRotationAboutPivot,
  type BearingRuntimeSnapshot,
} from "./experiments/anvil-02-bearing.js";

const MAX_ANCHOR_GAP_M = 0.0025;
const MIN_CONTROL_GAP_M = 0.25;
const MIN_RELATIVE_ANGLE_RAD = 0.35;
const MASS_EPS_KG = 0.1;
const LOCAL_COM_EPS_M = 7e-5;
const EVIDENCE_STEPS = 120;

interface EvidenceMetric {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly raw: number;
}
interface EvidenceGate {
  readonly id: string;
  readonly label: string;
  readonly pass: boolean;
  readonly detail: string;
}
interface BearingEvidence {
  readonly metrics: readonly EvidenceMetric[];
  readonly gates: readonly EvidenceGate[];
  readonly pass: boolean;
}

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (element === null) throw new Error(`BEARING browser gate missing ${selector}`);
  return element;
}
function add(a: Vec3, b: Vec3): Vec3 { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
function subtract(a: Vec3, b: Vec3): Vec3 { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
function scale(a: Vec3, scalar: number): Vec3 { return { x: a.x * scalar, y: a.y * scalar, z: a.z * scalar }; }
function cross(a: Vec3, b: Vec3): Vec3 {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}
function magnitude(value: Vec3): number { return Math.hypot(value.x, value.y, value.z); }
function rotate(rotation: Quat, value: Vec3): Vec3 {
  const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
  const t = cross(qv, value);
  const doubled = scale(t, 2);
  return add(value, add(scale(doubled, rotation.w), cross(qv, doubled)));
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

const fixture = createBearingFixture();
const baseline = compileMatter(fixture.matter);
const compilation = compileBearing(fixture);
const relation = compilation.relation;
const bodyById = new Map(compilation.physicalPlan.bodies.map((body) => [body.id, body] as const));
const bodyA = bodyById.get(relation.bodyAId);
const bodyB = bodyById.get(relation.bodyBId);
if (bodyA === undefined || bodyB === undefined) throw new Error("BEARING browser fixture missing compiled relation body");

const root = required<HTMLDivElement>("#app");
document.title = "PROJECT ANVIL — BEARING";
root.innerHTML = `<header class="topbar"><div><p class="eyebrow">PROJECT ANVIL · ANVIL-02</p><h1>BEARING</h1><p class="subtitle">Local physical interface → rigid split + derived rotational relation</p></div><div class="status" id="bearing-status">BOOTING</div></header><main class="layout"><section class="viewport-card bearing-viewport-card"><div class="viewport-head"><div><strong>AUTHORED SIGNAL</strong><span>same 7 persistent source cells</span></div><div><strong>RUNTIME CONTRAST</strong><span>derived relation vs deliberately absent relation</span></div></div><div class="bearing-compare"><figure class="bearing-stage"><figcaption>DERIVED BEARING <span>compiled relation active</span></figcaption><canvas id="bearing-view" aria-label="Derived bearing simulation"></canvas></figure><figure class="bearing-stage"><figcaption>NO RELATION CONTROL <span>same bodies · relation disabled</span></figcaption><canvas id="bearing-control-view" aria-label="No relation control simulation"></canvas></figure></div><div class="legend bearing-legend"><span><i></i> lobe A</span><span><i class="lobe-b"></i> lobe B</span><span><i class="pivot-mark"></i> bearing anchors</span><span><i class="control-mark"></i> separated control anchors</span></div></section><aside class="panel"><section><p class="section-label">OWNER TEST</p><div class="button-row bearing-button-row"><button id="bearing-run" disabled>RUN BEARING</button><button id="bearing-reset" disabled>RESET</button></div><p class="note bearing-owner-focus">Patrz na ruch, nie na zielone metryki: po lewej obie części powinny obracać się względem siebie bez rozrywania wspólnego pivotu. Po prawej identyczny układ bez relacji powinien wyraźnie się rozjechać. Szukaj teleportu, szarpnięcia, resetu albo zachowania jak weld.</p><p id="bearing-phase" class="note bearing-run-progress">initializing</p><div class="bearing-signal">source interface · a:2@x+ ↔ b:0@x- · free axis z</div></section><section><p class="section-label">EVIDENCE METRICS</p><dl id="bearing-metrics" class="metrics"></dl></section><section><p class="section-label">FALSIFICATION GATES</p><ul id="bearing-gates" class="gates"></ul></section><section class="boundary"><p class="section-label">BOUNDARY</p><p>The browser gate demonstrates one authored local bearing interface compiling to two disposable rigid bodies plus one stock Box3D revolute relation. It does <strong>not</strong> claim a generic relation ontology, motors/limits, damage, closed mechanisms or joint migration across a topology transaction.</p></section></aside></main>`;

const status = required<HTMLElement>("#bearing-status");
const phase = required<HTMLElement>("#bearing-phase");
const runButton = required<HTMLButtonElement>("#bearing-run");
const resetButton = required<HTMLButtonElement>("#bearing-reset");
const metricsElement = required<HTMLDListElement>("#bearing-metrics");
const gatesElement = required<HTMLUListElement>("#bearing-gates");
const bearingCanvas = required<HTMLCanvasElement>("#bearing-view");
const controlCanvas = required<HTMLCanvasElement>("#bearing-control-view");
const bearingContextCandidate = bearingCanvas.getContext("2d");
const controlContextCandidate = controlCanvas.getContext("2d");
if (bearingContextCandidate === null || controlContextCandidate === null) throw new Error("BEARING 2D canvas unavailable");
const bearingContext: CanvasRenderingContext2D = bearingContextCandidate;
const controlContext: CanvasRenderingContext2D = controlContextCandidate;

let constrained: BearingPhysics | null = null;
let control: BearingPhysics | null = null;
let evidence: BearingEvidence | null = null;
let busy = false;

function resizeCanvas(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}
function resizeCanvases(): void {
  resizeCanvas(bearingCanvas, bearingContext);
  resizeCanvas(controlCanvas, controlContext);
  drawBoth();
}
window.addEventListener("resize", resizeCanvases);

function cellCenter(cell: MatterCell): Vec3 {
  const size = fixture.matter.cellSizeM;
  return { x: (cell.grid.x + 0.5) * size, y: (cell.grid.y + 0.5) * size, z: (cell.grid.z + 0.5) * size };
}
function snapshotWorldPoint(snapshot: BearingRuntimeSnapshot, localPoint: Vec3): Vec3 {
  return add(snapshot.position, rotate(snapshot.rotation, localPoint));
}
function project(canvas: HTMLCanvasElement, point: Vec3): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleFactor = Math.min(135, Math.max(76, Math.min(rect.width / 4.8, rect.height / 3.6)));
  const relative = subtract(point, relation.pivotWorld);
  return {
    x: rect.width * 0.5 + (relative.x - relative.z * 0.22) * scaleFactor,
    y: rect.height * 0.55 - relative.y * scaleFactor + relative.z * scaleFactor * 0.09,
  };
}
function drawGrid(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
  const rect = canvas.getBoundingClientRect();
  context.fillStyle = "#070b12";
  context.fillRect(0, 0, rect.width, rect.height);
  context.strokeStyle = "#142030";
  context.lineWidth = 1;
  for (let n = -4; n <= 4; n += 1) {
    const x0 = project(canvas, { x: -2.5, y: n * 0.5, z: relation.pivotWorld.z });
    const x1 = project(canvas, { x: 2.5, y: n * 0.5, z: relation.pivotWorld.z });
    context.beginPath(); context.moveTo(x0.x, x0.y); context.lineTo(x1.x, x1.y); context.stroke();
    const y0 = project(canvas, { x: n * 0.5, y: -2, z: relation.pivotWorld.z });
    const y1 = project(canvas, { x: n * 0.5, y: 2, z: relation.pivotWorld.z });
    context.beginPath(); context.moveTo(y0.x, y0.y); context.lineTo(y1.x, y1.y); context.stroke();
  }
}
function drawCell(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  snapshot: BearingRuntimeSnapshot,
  body: RigidBodyPlan,
  cell: MatterCell,
): void {
  const half = fixture.matter.cellSizeM / 2;
  const localCenter = subtract(cellCenter(cell), body.centerOfMassWorld);
  const corners = [
    { x: localCenter.x - half, y: localCenter.y - half, z: localCenter.z },
    { x: localCenter.x + half, y: localCenter.y - half, z: localCenter.z },
    { x: localCenter.x + half, y: localCenter.y + half, z: localCenter.z },
    { x: localCenter.x - half, y: localCenter.y + half, z: localCenter.z },
  ].map((corner) => project(canvas, snapshotWorldPoint(snapshot, corner)));
  const color = cell.id.startsWith("a:") ? "#8bd5ff" : "#ffb86b";
  context.save();
  context.fillStyle = color;
  context.strokeStyle = "#e8edf5";
  context.globalAlpha = 0.68;
  context.lineWidth = 1.2;
  context.beginPath();
  const first = corners[0];
  if (first !== undefined) context.moveTo(first.x, first.y);
  for (const corner of corners.slice(1)) context.lineTo(corner.x, corner.y);
  context.closePath();
  context.fill();
  context.globalAlpha = 0.9;
  context.stroke();
  context.restore();
}
function drawAnchor(context: CanvasRenderingContext2D, point: { x: number; y: number }, color: string, radius: number): void {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 2.2;
  context.beginPath(); context.arc(point.x, point.y, radius, 0, Math.PI * 2); context.stroke();
  context.restore();
}
function drawRuntime(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, runtime: BearingPhysics | null, isControl: boolean): void {
  drawGrid(canvas, context);
  const snapshots = runtime?.snapshots() ?? [];
  const byBody = new Map(snapshots.map((snapshot) => [snapshot.planBodyId, snapshot] as const));
  for (const cell of fixture.matter.cells) {
    const bodyId = compilation.physicalPlan.cellToBody[cell.id];
    if (bodyId === undefined) continue;
    const body = bodyById.get(bodyId);
    const snapshot = byBody.get(bodyId);
    if (body === undefined || snapshot === undefined) continue;
    drawCell(canvas, context, snapshot, body, cell);
  }
  const a = byBody.get(relation.bodyAId);
  const b = byBody.get(relation.bodyBId);
  if (a === undefined || b === undefined) return;
  const anchorAWorld = snapshotWorldPoint(a, relation.localAnchorA);
  const anchorBWorld = snapshotWorldPoint(b, relation.localAnchorB);
  const anchorA = project(canvas, anchorAWorld);
  const anchorB = project(canvas, anchorBWorld);
  const initialPivot = project(canvas, relation.pivotWorld);
  const axisA = project(canvas, add(relation.pivotWorld, scale(relation.axisWorld, 0.35)));
  const axisB = project(canvas, add(relation.pivotWorld, scale(relation.axisWorld, -0.35)));
  context.save();
  context.strokeStyle = "#36516f";
  context.lineWidth = 1.3;
  context.beginPath(); context.moveTo(axisA.x, axisA.y); context.lineTo(axisB.x, axisB.y); context.stroke();
  context.setLineDash([4, 4]);
  context.strokeStyle = isControl ? "#ff8d82" : "#b6ff9e";
  context.beginPath(); context.moveTo(anchorA.x, anchorA.y); context.lineTo(anchorB.x, anchorB.y); context.stroke();
  context.setLineDash([]);
  drawAnchor(context, anchorA, isControl ? "#ffb0a8" : "#b6ff9e", 7);
  drawAnchor(context, anchorB, isControl ? "#ff8d82" : "#d9ffd0", 4);
  context.fillStyle = "#71849c";
  context.font = "700 11px ui-monospace, SFMono-Regular, Consolas, monospace";
  const gapMm = magnitude(subtract(anchorAWorld, anchorBWorld)) * 1000;
  context.fillText(`ANCHOR GAP ${gapMm.toFixed(2)} mm`, 15, 24);
  context.fillText(isControl ? "RELATION DISABLED" : "REVOLUTE RELATION", 15, 42);
  context.strokeStyle = "#48627e";
  context.beginPath(); context.arc(initialPivot.x, initialPivot.y, 12, 0, Math.PI * 2); context.stroke();
  context.restore();
}
function drawBoth(): void {
  drawRuntime(bearingCanvas, bearingContext, constrained, false);
  drawRuntime(controlCanvas, controlContext, control, true);
}

function setStatus(text: string, kind: "neutral" | "pass" | "fail" = "neutral"): void {
  status.textContent = text;
  status.className = kind === "neutral" ? "status" : `status ${kind}`;
}
function renderEvidence(): void {
  if (evidence === null) {
    metricsElement.innerHTML = `<dt>source cells</dt><dd id="metric-source-count">7 → 7</dd><dt>runtime bodies</dt><dd id="metric-body-count">1 → 2</dd><dt>derived relation</dt><dd id="metric-relation-count">0 → 1</dd><dt>Box3D</dt><dd>${constrained?.receipt.engineVersion ?? "loading"}</dd>`;
    gatesElement.innerHTML = `<li><strong>PENDING · BEARING TRANSACTION</strong><span>Run the derived relation beside its no-relation control.</span></li>`;
    return;
  }
  metricsElement.innerHTML = evidence.metrics.map((metric) => `<dt>${metric.label}</dt><dd id="metric-${metric.id}" data-value="${metric.raw}">${metric.value}</dd>`).join("");
  gatesElement.innerHTML = evidence.gates.map((gate) => `<li class="${gate.pass ? "pass" : "fail"}" data-gate="${gate.id}" data-pass="${gate.pass}"><strong>${gate.pass ? "PASS" : "FAIL"} · ${gate.label}</strong><span>${gate.detail}</span></li>`).join("");
}
function initialMotion(): {
  linear: Readonly<Record<string, Vec3>>;
  angular: Readonly<Record<string, Vec3>>;
} {
  const omegaA = { x: 0, y: 0, z: -0.6 };
  const omegaB = { x: 0, y: 0, z: 0.9 };
  return {
    linear: {
      [bodyA.id]: velocityForRotationAboutPivot(omegaA, bodyA.centerOfMassWorld, relation.pivotWorld),
      [bodyB.id]: velocityForRotationAboutPivot(omegaB, bodyB.centerOfMassWorld, relation.pivotWorld),
    },
    angular: { [bodyA.id]: omegaA, [bodyB.id]: omegaB },
  };
}
async function resetExperiment(): Promise<void> {
  busy = true;
  runButton.disabled = true;
  resetButton.disabled = true;
  evidence = null;
  constrained?.dispose();
  control?.dispose();
  constrained = null;
  control = null;
  setStatus("BOOTING");
  phase.textContent = "constructing identical relation / no-relation runtimes";
  renderEvidence();
  drawBoth();
  const motion = initialMotion();
  try {
    constrained = await BearingPhysics.create(compilation, fixture.matter.materials, {
      createRelation: true,
      initialLinearVelocityByPlanBodyId: motion.linear,
      initialAngularVelocityByPlanBodyId: motion.angular,
    });
    control = await BearingPhysics.create(compilation, fixture.matter.materials, {
      createRelation: false,
      initialLinearVelocityByPlanBodyId: motion.linear,
      initialAngularVelocityByPlanBodyId: motion.angular,
    });
    setStatus("READY");
    phase.textContent = "ready · 120 solver steps / 2 s evidence run";
    runButton.disabled = false;
    resetButton.disabled = false;
    renderEvidence();
    resizeCanvases();
  } catch (error: unknown) {
    setStatus("BLOCKED", "fail");
    phase.textContent = error instanceof Error ? error.message : String(error);
    console.error(error);
  } finally {
    busy = false;
  }
}
function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
async function runBearing(): Promise<void> {
  if (busy || constrained === null || control === null) return;
  busy = true;
  evidence = null;
  runButton.disabled = true;
  resetButton.disabled = true;
  setStatus("RUNNING");
  renderEvidence();
  try {
    for (let step = 0; step < EVIDENCE_STEPS; step += 1) {
      constrained.step(1);
      control.step(1);
      drawBoth();
      phase.textContent = `running · solver step ${step + 1} / ${EVIDENCE_STEPS}`;
      await nextFrame();
    }
    const constrainedGap = constrained.bearingAnchorErrorM();
    const controlGap = control.bearingAnchorErrorM();
    const angle = constrained.bearingAngleRad();
    if (angle === null) throw new Error("BEARING runtime did not create the compiled relation");
    const maxMassError = Math.max(...Object.values(constrained.receipt.bodyMassErrorsKg).map((value) => Math.abs(value)));
    const maxLocalComError = Math.max(...Object.values(constrained.receipt.bodyLocalCenterErrorsM).map((value) => Math.abs(value)));
    const sourceIds = Object.keys(compilation.physicalPlan.cellToBody).sort();
    const expectedSourceIds = fixture.matter.cells.map((cell) => cell.id).sort();
    const sourceIdentity = sourceIds.length === expectedSourceIds.length && sourceIds.every((id, index) => id === expectedSourceIds[index]);
    const postStepFinite = constrained.snapshots().length === 2 && control.snapshots().length === 2 && [...constrained.snapshots(), ...control.snapshots()].every(finiteSnapshot);
    const gates: EvidenceGate[] = [
      { id: "identity", label: "PERSISTENT SOURCE IDENTITY", pass: sourceIdentity, detail: `${sourceIds.length} persistent source cells remain mapped` },
      { id: "topology", label: "RIGID TOPOLOGY CAUSALITY", pass: baseline.bodies.length === 1 && compilation.physicalPlan.bodies.length === 2, detail: `${baseline.bodies.length} rigid body → ${compilation.physicalPlan.bodies.length} after local bearing interface` },
      { id: "relation", label: "DERIVED RELATION LOWERING", pass: constrained.receipt.relationCreated && !control.receipt.relationCreated, detail: "same compiled bodies; revolute enabled only in relation runtime" },
      { id: "anchor", label: "SHARED PIVOT CONSTRAINT", pass: constrainedGap <= MAX_ANCHOR_GAP_M, detail: `${(constrainedGap * 1000).toFixed(3)} mm ≤ ${(MAX_ANCHOR_GAP_M * 1000).toFixed(1)} mm` },
      { id: "control", label: "NO-RELATION DISCRIMINATION", pass: controlGap >= MIN_CONTROL_GAP_M, detail: `${controlGap.toFixed(3)} m ≥ ${MIN_CONTROL_GAP_M.toFixed(2)} m` },
      { id: "free-dof", label: "FREE ROTATIONAL DOF", pass: Math.abs(angle) >= MIN_RELATIVE_ANGLE_RAD, detail: `${Math.abs(angle).toFixed(3)} rad ≥ ${MIN_RELATIVE_ANGLE_RAD.toFixed(2)} rad` },
      { id: "mass", label: "BODY LOWERING INVARIANTS", pass: maxMassError <= MASS_EPS_KG && maxLocalComError <= LOCAL_COM_EPS_M, detail: `max |Δm| ${maxMassError.toExponential(2)} kg · local COM ${maxLocalComError.toExponential(2)} m` },
      { id: "post-step", label: "POST-RELATION SOLVER STATE", pass: postStepFinite, detail: postStepFinite ? "both 2-body runtimes remain finite" : "invalid runtime state" },
    ];
    evidence = {
      gates,
      pass: gates.every((gate) => gate.pass),
      metrics: [
        { id: "source-count", label: "source cells", value: "7 → 7", raw: 7 },
        { id: "body-count", label: "runtime bodies", value: "1 → 2", raw: 2 },
        { id: "relation-count", label: "derived relation", value: "0 → 1", raw: 1 },
        { id: "anchor-gap", label: "bearing anchor gap", value: `${(constrainedGap * 1000).toFixed(3)} mm`, raw: constrainedGap },
        { id: "control-gap", label: "no-relation anchor gap", value: `${controlGap.toFixed(3)} m`, raw: controlGap },
        { id: "relative-angle", label: "relative bearing angle", value: `${angle.toFixed(3)} rad`, raw: angle },
        { id: "mass-error", label: "max runtime |Δm|", value: `${maxMassError.toExponential(3)} kg`, raw: maxMassError },
        { id: "local-com-error", label: "max local COM error", value: `${maxLocalComError.toExponential(3)} m`, raw: maxLocalComError },
        { id: "engine", label: "Box3D runtime", value: constrained.receipt.engineVersion, raw: 0.1 },
      ],
    };
    renderEvidence();
    drawBoth();
    phase.textContent = "complete · RESET to repeat the same owner-visible run";
    setStatus(evidence.pass ? "BEARING EVIDENCE PASS" : "BEARING EVIDENCE FAIL", evidence.pass ? "pass" : "fail");
    resetButton.disabled = false;
  } catch (error: unknown) {
    setStatus("BEARING EVIDENCE FAIL", "fail");
    phase.textContent = error instanceof Error ? error.message : String(error);
    console.error(error);
    resetButton.disabled = false;
  } finally {
    busy = false;
  }
}

runButton.addEventListener("click", () => void runBearing());
resetButton.addEventListener("click", () => void resetExperiment());
void resetExperiment();
