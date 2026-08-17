import "./style.css";
import { compileMatter } from "./compiler.js";
import { createCollapseFixture } from "./fixture.js";
import type { MatterCell, PhysicalPlan, RigidBodyPlan, Vec3 } from "./model.js";
import { CollapsePhysics, type RuntimeBodySnapshot } from "./physics.js";
import {
  analyzeProvenanceLineage,
  bodyProvenanceFromPhysicalPlan,
} from "./foundation/provenance.js";
import { rigidVelocityAtWorldPoint, totalLinearMomentum } from "./foundation/continuity.js";
import type { Quat, RigidMotion } from "./foundation/spatial.js";

const CUT_CONNECTION = ["cell:-1:0:0", "cell:0:0:0"] as const;
const ZERO: Vec3 = { x: 0, y: 0, z: 0 };
const WARMUP_STEPS = 19;
const MASS_EPS_KG = 0.1;
const POSITION_EPS_M = 7e-5;
const VELOCITY_EPS_MPS = 2e-5;
const ANGULAR_EPS_RADPS = 2e-5;
const INTERFACE_VELOCITY_EPS_MPS = 5e-5;
const MOMENTUM_EPS_KG_MPS = 0.75;
const MIN_ROTATED_OFFSET_EFFECT_M = 0.05;
const MIN_RIGID_FIELD_EFFECT_MPS = 0.05;

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

interface CutEvidence {
  readonly metrics: readonly EvidenceMetric[];
  readonly gates: readonly EvidenceGate[];
  readonly pass: boolean;
}

interface TransferPlan {
  readonly motions: Record<string, RigidMotion>;
  readonly maxRotatedOffsetEffectM: number;
  readonly maxRigidFieldEffectMps: number;
}

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (element === null) throw new Error(`missing ${selector}`);
  return element;
}

function requireSingleBody(plan: PhysicalPlan, label: string): RigidBodyPlan {
  if (plan.bodies.length !== 1) throw new Error(`${label} expected one body, got ${plan.bodies.length}`);
  const body = plan.bodies[0];
  if (body === undefined) throw new Error(`${label} missing body`);
  return body;
}

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function subtract(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function magnitude(value: Vec3): number {
  return Math.hypot(value.x, value.y, value.z);
}

function axisAngleQuat(axis: Vec3, angle: number): Quat {
  const length = magnitude(axis);
  if (length <= 0) throw new Error("rotation axis must be non-zero");
  const half = angle / 2;
  const scale = Math.sin(half) / length;
  return {
    x: axis.x * scale,
    y: axis.y * scale,
    z: axis.z * scale,
    w: Math.cos(half),
  };
}

function rotateVec3ByQuat(rotation: Quat, value: Vec3): Vec3 {
  const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
  const t = cross(qv, value);
  const doubled = { x: 2 * t.x, y: 2 * t.y, z: 2 * t.z };
  return add(
    value,
    add(
      { x: rotation.w * doubled.x, y: rotation.w * doubled.y, z: rotation.w * doubled.z },
      cross(qv, doubled),
    ),
  );
}

function motionFromSnapshot(snapshot: RuntimeBodySnapshot): RigidMotion {
  return {
    position: snapshot.position,
    rotation: {
      x: snapshot.rotation.x,
      y: snapshot.rotation.y,
      z: snapshot.rotation.z,
      w: snapshot.rotation.w,
    },
    linearVelocity: snapshot.linearVelocity,
    angularVelocity: snapshot.angularVelocity,
  };
}

function cellCenter(cell: MatterCell, cellSizeM: number): Vec3 {
  return {
    x: (cell.grid.x + 0.5) * cellSizeM,
    y: (cell.grid.y + 0.5) * cellSizeM,
    z: (cell.grid.z + 0.5) * cellSizeM,
  };
}

function quatAlignmentError(actual: Quat, expected: Quat): number {
  const dot =
    actual.x * expected.x +
    actual.y * expected.y +
    actual.z * expected.z +
    actual.w * expected.w;
  return 1 - Math.abs(dot);
}

function momentumOf(snapshots: readonly RuntimeBodySnapshot[]): Vec3 {
  return totalLinearMomentum(
    snapshots.map((snapshot) => ({ massKg: snapshot.massKg, linearVelocity: snapshot.linearVelocity })),
  );
}

function finiteSnapshot(snapshot: RuntimeBodySnapshot): boolean {
  return [
    snapshot.position.x,
    snapshot.position.y,
    snapshot.position.z,
    snapshot.rotation.x,
    snapshot.rotation.y,
    snapshot.rotation.z,
    snapshot.rotation.w,
    snapshot.linearVelocity.x,
    snapshot.linearVelocity.y,
    snapshot.linearVelocity.z,
    snapshot.angularVelocity.x,
    snapshot.angularVelocity.y,
    snapshot.angularVelocity.z,
    snapshot.massKg,
  ].every(Number.isFinite);
}

function buildChildTransfer(
  parentPlan: RigidBodyPlan,
  childPlan: PhysicalPlan,
  parentMotion: RigidMotion,
): TransferPlan {
  const motions: Record<string, RigidMotion> = {};
  let maxRotatedOffsetEffectM = 0;
  let maxRigidFieldEffectMps = 0;

  for (const child of childPlan.bodies) {
    const authoredOffset = subtract(child.centerOfMassWorld, parentPlan.centerOfMassWorld);
    const worldOffset = rotateVec3ByQuat(parentMotion.rotation, authoredOffset);
    const worldCom = add(parentMotion.position, worldOffset);
    const linearVelocity = rigidVelocityAtWorldPoint(parentMotion, worldCom);
    maxRotatedOffsetEffectM = Math.max(
      maxRotatedOffsetEffectM,
      magnitude(subtract(worldOffset, authoredOffset)),
    );
    maxRigidFieldEffectMps = Math.max(
      maxRigidFieldEffectMps,
      magnitude(subtract(linearVelocity, parentMotion.linearVelocity)),
    );
    motions[child.id] = {
      position: worldCom,
      rotation: { ...parentMotion.rotation },
      linearVelocity,
      angularVelocity: { ...parentMotion.angularVelocity },
    };
  }

  return { motions, maxRotatedOffsetEffectM, maxRigidFieldEffectMps };
}

const root = required<HTMLDivElement>("#app");
document.title = "PROJECT ANVIL — CUT";
root.innerHTML = `<header class="topbar"><div><p class="eyebrow">PROJECT ANVIL · ANVIL-01</p><h1>CUT</h1><p class="subtitle">Mass-preserving topology transaction · persistent matter → disposable runtime</p></div><div class="status" id="cut-status">BOOTING</div></header><main class="layout"><section class="viewport-card"><div class="viewport-head"><div><strong>PERSISTENT SOURCE</strong><span>51 authored cells · identity survives</span></div><div><strong>DISPOSABLE RUNTIME</strong><span id="cut-phase">initializing</span></div></div><canvas id="viewport"></canvas><div class="legend"><span><i></i> persistent source cells</span><span><i class="collider-mark"></i> runtime body COM</span></div></section><aside class="panel"><section><p class="section-label">TRANSACTION</p><div class="button-row"><button id="cut-run" disabled>RUN CUT</button><button id="cut-replay" disabled>RESET</button></div><p class="note">One moving+rotating Box3D body is discarded at a solver-step boundary and rebuilt as two bodies. The same 51 authored source cells survive; no source cell is deleted.</p></section><section><p class="section-label">EVIDENCE METRICS</p><dl id="cut-metrics" class="metrics"></dl></section><section><p class="section-label">FALSIFICATION GATES</p><ul id="cut-gates" class="gates"></ul></section><section class="boundary"><p class="section-label">BOUNDARY</p><p>Real production-browser Box3D evidence for isolated disposable-world reconstruction. This does <strong>not</strong> claim in-place manifold/joint migration, arbitrary fracture geometry, damage propagation, or deformable matter.</p></section><section><p class="section-label">CONTROL</p><p class="note"><a href="/" style="color:#b6ff9e">Open accepted ANVIL-00 / COLLAPSE</a></p></section></aside></main>`;

const canvas = required<HTMLCanvasElement>("#viewport");
const contextCandidate = canvas.getContext("2d");
if (contextCandidate === null) throw new Error("2D canvas unavailable");
const context: CanvasRenderingContext2D = contextCandidate;
const status = required<HTMLDivElement>("#cut-status");
const phase = required<HTMLSpanElement>("#cut-phase");
const metricsElement = required<HTMLDListElement>("#cut-metrics");
const gatesElement = required<HTMLUListElement>("#cut-gates");
const runButton = required<HTMLButtonElement>("#cut-run");
const replayButton = required<HTMLButtonElement>("#cut-replay");

const matter = createCollapseFixture(false);
const beforePlan = compileMatter(matter);
const afterPlan = compileMatter(
  { ...matter, revision: "anvil-01-cut/browser" },
  { blockedFaceConnections: [CUT_CONNECTION] },
);
const parentPlan = requireSingleBody(beforePlan, "CUT browser source");
if (afterPlan.bodies.length !== 2) throw new Error(`CUT browser expected two child bodies, got ${afterPlan.bodies.length}`);

const initialMotion: RigidMotion = {
  position: { x: -2.8, y: 2.7, z: -0.7 },
  rotation: axisAngleQuat({ x: 1, y: -2, z: 0.75 }, 0.71),
  linearVelocity: { x: 1.7, y: -0.45, z: 0.9 },
  angularVelocity: { x: 0.42, y: 0.95, z: -0.61 },
};

let physics: CollapsePhysics | null = null;
let activePlan = beforePlan;
let evidence: CutEvidence | null = null;
let busy = false;
let animateAfterCut = false;
let accumulator = 0;
let lastFrame = performance.now();

function resizeCanvas(): void {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function project(point: Vec3): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(75, Math.max(34, rect.width / 16));
  return {
    x: rect.width * 0.5 + (point.x - point.z * 0.35) * scale,
    y: rect.height * 0.64 - point.y * scale + point.z * scale * 0.12,
  };
}

function drawScene(): void {
  const rect = canvas.getBoundingClientRect();
  context.clearRect(0, 0, rect.width, rect.height);
  context.fillStyle = "#070b12";
  context.fillRect(0, 0, rect.width, rect.height);

  const snapshots = physics?.snapshots() ?? [];
  const snapshotByBody = new Map(snapshots.map((snapshot) => [snapshot.planBodyId, snapshot] as const));
  const bodyById = new Map(activePlan.bodies.map((body) => [body.id, body] as const));
  const materialById = new Map(matter.materials.map((material) => [material.id, material] as const));
  const cellRadius = Math.max(2.2, Math.min(5.2, rect.width / 170));

  for (const cell of matter.cells) {
    const bodyId = activePlan.cellToBody[cell.id];
    if (bodyId === undefined) continue;
    const body = bodyById.get(bodyId);
    const snapshot = snapshotByBody.get(bodyId);
    if (body === undefined || snapshot === undefined) continue;
    const local = subtract(cellCenter(cell, matter.cellSizeM), body.centerOfMassWorld);
    const world = add(snapshot.position, rotateVec3ByQuat(snapshot.rotation, local));
    const screen = project(world);
    context.fillStyle = materialById.get(cell.materialId)?.displayColor ?? "#8bd5ff";
    context.globalAlpha = 0.72;
    context.fillRect(screen.x - cellRadius, screen.y - cellRadius, cellRadius * 2, cellRadius * 2);
  }
  context.globalAlpha = 1;

  for (const [index, body] of activePlan.bodies.entries()) {
    const snapshot = snapshotByBody.get(body.id);
    if (snapshot === undefined) continue;
    const screen = project(snapshot.position);
    context.fillStyle = index === 0 ? "#b6ff9e" : "#ffb86b";
    context.beginPath();
    context.arc(screen.x, screen.y, 6, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#ffffff";
    context.lineWidth = 1;
    context.stroke();
  }

  context.fillStyle = "#7890ad";
  context.font = "700 12px ui-sans-serif, system-ui";
  context.fillText(activePlan.bodies.length === 1 ? "RUNTIME: 1 BODY" : "RUNTIME: 2 BODIES", 18, 28);
  context.fillText("51 PERSISTENT SOURCE CELLS", 18, 47);
}

function setStatus(text: string, kind: "neutral" | "pass" | "fail" = "neutral"): void {
  status.textContent = text;
  status.className = kind === "neutral" ? "status" : `status ${kind}`;
}

function renderEvidence(): void {
  if (evidence === null) {
    metricsElement.innerHTML = `<dt>source cells</dt><dd>51 → 51</dd><dt>runtime bodies</dt><dd>1 → 2</dd><dt>Box3D</dt><dd>${physics?.receipt.engineVersion ?? "loading"}</dd>`;
    gatesElement.innerHTML = `<li><strong>PENDING · CUT TRANSACTION</strong><span>Run the bounded moving+rotating 1→2 transaction.</span></li>`;
    return;
  }
  metricsElement.innerHTML = evidence.metrics
    .map((metric) => `<dt>${metric.label}</dt><dd id="metric-${metric.id}" data-value="${metric.raw}">${metric.value}</dd>`)
    .join("");
  gatesElement.innerHTML = evidence.gates
    .map((gate) => `<li class="${gate.pass ? "pass" : "fail"}" data-gate="${gate.id}" data-pass="${gate.pass}"><strong>${gate.pass ? "PASS" : "FAIL"} · ${gate.label}</strong><span>${gate.detail}</span></li>`)
    .join("");
}

async function resetExperiment(): Promise<void> {
  busy = true;
  runButton.disabled = true;
  replayButton.disabled = true;
  animateAfterCut = false;
  evidence = null;
  physics?.dispose();
  physics = null;
  activePlan = beforePlan;
  setStatus("BOOTING");
  phase.textContent = "constructing 1-body source runtime";
  renderEvidence();

  try {
    physics = await CollapsePhysics.create(beforePlan, matter.materials, {
      gravity: ZERO,
      includeGround: false,
      initialMotionByPlanBodyId: { [parentPlan.id]: initialMotion },
    });
    setStatus("READY");
    phase.textContent = "1 body · moving + rotating · ready";
    runButton.disabled = false;
    replayButton.disabled = false;
  } catch (error: unknown) {
    setStatus("BLOCKED", "fail");
    phase.textContent = error instanceof Error ? error.message : String(error);
    console.error(error);
  } finally {
    busy = false;
  }
}

async function nextFrame(): Promise<void> {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function runCut(): Promise<void> {
  if (busy || physics === null) return;
  busy = true;
  runButton.disabled = true;
  replayButton.disabled = true;
  evidence = null;
  renderEvidence();
  setStatus("RUNNING");
  phase.textContent = "1 body · warmup in real Box3D";

  try {
    for (let step = 0; step < WARMUP_STEPS; step += 1) {
      physics.step(1);
      drawScene();
      await nextFrame();
    }

    const parentSnapshot = physics.snapshots()[0];
    if (parentSnapshot === undefined) throw new Error("missing parent snapshot");
    const parentMotion = motionFromSnapshot(parentSnapshot);
    const parentMomentum = momentumOf([parentSnapshot]);
    const lineage = analyzeProvenanceLineage(
      bodyProvenanceFromPhysicalPlan(beforePlan),
      bodyProvenanceFromPhysicalPlan(afterPlan),
    );
    const transfer = buildChildTransfer(parentPlan, afterPlan, parentMotion);

    phase.textContent = "step boundary · snapshot → compile → rebuild";
    await new Promise<void>((resolve) => window.setTimeout(resolve, 180));
    physics.dispose();
    physics = null;
    activePlan = afterPlan;
    physics = await CollapsePhysics.create(afterPlan, matter.materials, {
      gravity: ZERO,
      includeGround: false,
      initialMotionByPlanBodyId: transfer.motions,
    });

    const immediate = physics.snapshots();
    if (immediate.length !== 2) throw new Error(`expected 2 replacement bodies, got ${immediate.length}`);

    let maxPositionErrorM = 0;
    let maxVelocityErrorMps = 0;
    let maxAngularErrorRadps = 0;
    let maxRotationAlignmentError = 0;
    for (const child of afterPlan.bodies) {
      const expected = transfer.motions[child.id];
      const actual = immediate.find((snapshot) => snapshot.planBodyId === child.id);
      if (expected === undefined || actual === undefined) throw new Error(`missing child state ${child.id}`);
      maxPositionErrorM = Math.max(maxPositionErrorM, magnitude(subtract(actual.position, expected.position)));
      maxVelocityErrorMps = Math.max(maxVelocityErrorMps, magnitude(subtract(actual.linearVelocity, expected.linearVelocity)));
      maxAngularErrorRadps = Math.max(maxAngularErrorRadps, magnitude(subtract(actual.angularVelocity, expected.angularVelocity)));
      maxRotationAlignmentError = Math.max(maxRotationAlignmentError, quatAlignmentError(actual.rotation, expected.rotation));
    }

    const interfaceAuthored = { x: 0, y: matter.cellSizeM / 2, z: matter.cellSizeM / 2 };
    const interfaceWorld = add(
      parentMotion.position,
      rotateVec3ByQuat(parentMotion.rotation, subtract(interfaceAuthored, parentPlan.centerOfMassWorld)),
    );
    const expectedInterfaceVelocity = rigidVelocityAtWorldPoint(parentMotion, interfaceWorld);
    let maxInterfaceVelocityErrorMps = 0;
    for (const snapshot of immediate) {
      const actualVelocity = rigidVelocityAtWorldPoint(motionFromSnapshot(snapshot), interfaceWorld);
      maxInterfaceVelocityErrorMps = Math.max(
        maxInterfaceVelocityErrorMps,
        magnitude(subtract(actualVelocity, expectedInterfaceVelocity)),
      );
    }

    const massErrorKg = Math.abs(
      immediate.reduce((sum, snapshot) => sum + snapshot.massKg, 0) - parentSnapshot.massKg,
    );
    const momentumErrorKgMps = magnitude(subtract(momentumOf(immediate), parentMomentum));
    physics.step(1);
    const postStepFinite = physics.snapshots().length === 2 && physics.snapshots().every(finiteSnapshot);

    const sourceIdsBefore = Object.keys(beforePlan.cellToBody).sort();
    const sourceIdsAfter = Object.keys(afterPlan.cellToBody).sort();
    const identityPass =
      sourceIdsBefore.length === 51 &&
      sourceIdsAfter.length === 51 &&
      sourceIdsBefore.every((id, index) => id === sourceIdsAfter[index]) &&
      lineage.addedSourceIds.length === 0 &&
      lineage.removedSourceIds.length === 0;
    const lineageSplit =
      lineage.components.length === 1 &&
      lineage.components[0]?.kind === "split" &&
      lineage.components[0].beforeEntityIds.length === 1 &&
      lineage.components[0].afterEntityIds.length === 2;

    const gates: EvidenceGate[] = [
      { id: "identity", label: "PERSISTENT SOURCE IDENTITY", pass: identityPass, detail: `51 → 51 source cells; added ${lineage.addedSourceIds.length}, removed ${lineage.removedSourceIds.length}` },
      { id: "topology", label: "MASS-PRESERVING 1 → 2 SPLIT", pass: lineageSplit, detail: "one provenance split; no source deletion" },
      { id: "sensitivity", label: "NONTRIVIAL ROTATING FIXTURE", pass: transfer.maxRotatedOffsetEffectM >= MIN_ROTATED_OFFSET_EFFECT_M && transfer.maxRigidFieldEffectMps >= MIN_RIGID_FIELD_EFFECT_MPS, detail: `COM effect ${transfer.maxRotatedOffsetEffectM.toFixed(3)} m · ω×r ${transfer.maxRigidFieldEffectMps.toFixed(3)} m/s` },
      { id: "mass", label: "RUNTIME MASS CONTINUITY", pass: massErrorKg <= MASS_EPS_KG, detail: `|Δm| ${massErrorKg.toExponential(3)} kg` },
      { id: "pose", label: "CHILD POSE CONTINUITY", pass: maxPositionErrorM <= POSITION_EPS_M && maxRotationAlignmentError <= 2e-7, detail: `max COM error ${maxPositionErrorM.toExponential(3)} m` },
      { id: "rigid-field", label: "RIGID VELOCITY FIELD", pass: maxVelocityErrorMps <= VELOCITY_EPS_MPS && maxAngularErrorRadps <= ANGULAR_EPS_RADPS && maxInterfaceVelocityErrorMps <= INTERFACE_VELOCITY_EPS_MPS, detail: `child Δv ${maxVelocityErrorMps.toExponential(3)} m/s · interface ${maxInterfaceVelocityErrorMps.toExponential(3)} m/s` },
      { id: "momentum", label: "TOTAL LINEAR MOMENTUM", pass: momentumErrorKgMps <= MOMENTUM_EPS_KG_MPS, detail: `error ${momentumErrorKgMps.toExponential(3)} kg·m/s` },
      { id: "post-step", label: "POST-TRANSACTION SOLVER STEP", pass: postStepFinite, detail: postStepFinite ? "two replacement bodies remain finite" : "invalid post-step state" },
    ];

    evidence = {
      gates,
      pass: gates.every((gate) => gate.pass),
      metrics: [
        { id: "source-count", label: "source cells", value: "51 → 51", raw: 51 },
        { id: "body-count", label: "runtime bodies", value: "1 → 2", raw: 2 },
        { id: "source-delta", label: "source add / remove", value: "0 / 0", raw: 0 },
        { id: "mass-error", label: "runtime |Δm|", value: `${massErrorKg.toExponential(3)} kg`, raw: massErrorKg },
        { id: "momentum-error", label: "linear momentum error", value: `${momentumErrorKgMps.toExponential(3)} kg·m/s`, raw: momentumErrorKgMps },
        { id: "position-error", label: "max child COM error", value: `${maxPositionErrorM.toExponential(3)} m`, raw: maxPositionErrorM },
        { id: "velocity-error", label: "max child Δv", value: `${maxVelocityErrorMps.toExponential(3)} m/s`, raw: maxVelocityErrorMps },
        { id: "interface-error", label: "interface velocity error", value: `${maxInterfaceVelocityErrorMps.toExponential(3)} m/s`, raw: maxInterfaceVelocityErrorMps },
        { id: "engine", label: "Box3D runtime", value: physics.receipt.engineVersion, raw: 0.1 },
      ],
    };

    renderEvidence();
    phase.textContent = "2 bodies · source matter unchanged · live after split";
    setStatus(evidence.pass ? "CUT EVIDENCE PASS" : "CUT EVIDENCE FAIL", evidence.pass ? "pass" : "fail");
    animateAfterCut = evidence.pass;
    replayButton.disabled = false;
  } catch (error: unknown) {
    animateAfterCut = false;
    setStatus("CUT EVIDENCE FAIL", "fail");
    phase.textContent = error instanceof Error ? error.message : String(error);
    console.error(error);
    replayButton.disabled = false;
  } finally {
    busy = false;
  }
}

runButton.addEventListener("click", () => void runCut());
replayButton.addEventListener("click", () => void resetExperiment());

function frame(now: number): void {
  const elapsed = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;
  if (animateAfterCut && physics !== null && !busy) {
    accumulator += elapsed;
    let steps = 0;
    while (accumulator >= 1 / 60 && steps < 4) {
      physics.step(1);
      accumulator -= 1 / 60;
      steps += 1;
    }
  }
  drawScene();
  requestAnimationFrame(frame);
}

void resetExperiment().then(() => requestAnimationFrame(frame));
