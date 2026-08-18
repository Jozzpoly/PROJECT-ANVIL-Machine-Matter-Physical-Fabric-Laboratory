import "./style.css";
import type { PhysicalPlan, RigidBodyPlan } from "./model.js";
import { addVec3, magnitudeVec3, subtractVec3, type RigidMotion } from "./foundation/spatial.js";
import { velocityForRotationAboutPivot, type BearingRelationPlan, type BearingRuntimeSnapshot } from "./experiments/anvil-02-bearing.js";
import { transferRebindMotion } from "./experiments/anvil-03-rebind.js";
import {
  LOAD_REBIND_FORCE_N,
  LoadedRebindPhysics,
  compileLoadedRebind,
  createLoadedRebindFixture,
} from "./experiments/anvil-04-loaded-rebind.js";

const PRELOAD_STEPS = 31;
const POST_STEPS = 60;
const MIN_PRELOAD_FORCE_N = 2000;
const MAX_PRELOAD_FORCE_N = 6000;
const MAX_PRE_CUT_GAP_M = 0.0025;
const MIN_PRE_CUT_RELATIVE_ANGULAR_SPEED_RADPS = 1.0;
const MAX_IMMEDIATE_POSITION_JUMP_M = 0.00007;
const MAX_IMMEDIATE_VELOCITY_JUMP_MPS = 0.00007;
const MAX_FIRST_STEP_GAP_M = 0.0005;
const MAX_FIRST_STEP_ANCHOR_VELOCITY_GAP_MPS = 0.02;
const MIN_FIRST_STEP_FORCE_N = 1500;
const MAX_FIRST_STEP_FORCE_N = 7000;
const MAX_FINAL_GAP_M = 0.0025;
const MIN_CONTROL_GAP_M = 1.0;
const MIN_FINAL_RELATIVE_ANGULAR_SPEED_RADPS = 0.2;

interface Gate {
  readonly id: string;
  readonly pass: boolean;
  readonly value: number | string;
  readonly limit: string;
}

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (element === null) throw new Error(`LOAD-REBIND browser gate missing ${selector}`);
  return element;
}

function bodyById(plan: PhysicalPlan, id: string): RigidBodyPlan {
  const body = plan.bodies.find((candidate) => candidate.id === id);
  if (body === undefined) throw new Error(`LOAD-REBIND browser missing body ${id}`);
  return body;
}

function snapshotById(snapshots: readonly BearingRuntimeSnapshot[], id: string): BearingRuntimeSnapshot {
  const snapshot = snapshots.find((candidate) => candidate.planBodyId === id);
  if (snapshot === undefined) throw new Error(`LOAD-REBIND browser missing snapshot ${id}`);
  return snapshot;
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

function vecError(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
  return magnitudeVec3(subtractVec3(a, b));
}

function relativeAngularSpeedZ(snapshots: readonly BearingRuntimeSnapshot[], relation: BearingRelationPlan): number {
  const a = snapshotById(snapshots, relation.bodyAId);
  const b = snapshotById(snapshots, relation.bodyBId);
  return Math.abs(b.angularVelocity.z - a.angularVelocity.z);
}

const root = required<HTMLDivElement>("#app");
document.title = "PROJECT ANVIL — LOAD-REBIND browser evidence";
root.innerHTML = `<header class="topbar"><div><p class="eyebrow">PROJECT ANVIL · ANVIL-04</p><h1>LOAD-REBIND</h1><p class="subtitle">Automated production-browser evidence probe. Owner action is not required.</p></div><div class="status" id="load-rebind-status" data-state="RUNNING">RUNNING</div></header><main class="layout"><section class="viewport-card"><div style="padding:24px;max-width:900px"><h2>Cold relation reconstruction under 2.5 kN load</h2><p>This page executes the moving C1 fixture in the production browser bundle. It is technical evidence, not an owner gate.</p><dl id="load-rebind-metrics" class="metrics"></dl><ul id="load-rebind-gates" class="gates"></ul></div></section></main>`;

const status = required<HTMLElement>("#load-rebind-status");
const metrics = required<HTMLDListElement>("#load-rebind-metrics");
const gateList = required<HTMLUListElement>("#load-rebind-gates");

function renderMetric(label: string, value: number | string, dataKey?: string): void {
  const dt = document.createElement("dt");
  const dd = document.createElement("dd");
  dt.textContent = label;
  dd.textContent = typeof value === "number" ? String(value) : value;
  if (dataKey !== undefined) dd.dataset.metric = dataKey;
  dd.dataset.raw = String(value);
  metrics.append(dt, dd);
}

function renderGate(gate: Gate): void {
  const li = document.createElement("li");
  li.dataset.gate = gate.id;
  li.dataset.pass = String(gate.pass);
  li.textContent = `${gate.pass ? "PASS" : "FAIL"} · ${gate.id} · ${gate.value} · ${gate.limit}`;
  gateList.append(li);
}

async function run(): Promise<void> {
  const fixture = createLoadedRebindFixture();
  const compilation = compileLoadedRebind(fixture);
  const before = compilation.before;
  const after = compilation.after;
  const bodyA = bodyById(before.physicalPlan, before.relation.bodyAId);
  const bodyB = bodyById(before.physicalPlan, before.relation.bodyBId);
  const omegaA = { x: 0, y: 0, z: -0.65 };
  const omegaB = { x: 0, y: 0, z: 0.95 };
  const commonDrift = { x: 0.8, y: -0.25, z: 0.35 };
  const initialMotion: Readonly<Record<string, RigidMotion>> = {
    [bodyA.id]: {
      position: bodyA.centerOfMassWorld,
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      linearVelocity: addVec3(commonDrift, velocityForRotationAboutPivot(omegaA, bodyA.centerOfMassWorld, before.relation.pivotWorld)),
      angularVelocity: omegaA,
    },
    [bodyB.id]: {
      position: bodyB.centerOfMassWorld,
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      linearVelocity: addVec3(commonDrift, velocityForRotationAboutPivot(omegaB, bodyB.centerOfMassWorld, before.relation.pivotWorld)),
      angularVelocity: omegaB,
    },
  };

  const beforeRuntime = await LoadedRebindPhysics.create(before, fixture.bearing.matter.materials, initialMotion, true);
  let beforeSnapshots: readonly BearingRuntimeSnapshot[];
  let beforeKinematics;
  let preloadForceN: number;
  let preloadRelativeAngularSpeedRadps: number;
  try {
    beforeRuntime.stepLoaded(LOAD_REBIND_FORCE_N, PRELOAD_STEPS);
    beforeSnapshots = beforeRuntime.snapshots();
    beforeKinematics = beforeRuntime.bearingKinematics();
    const force = beforeRuntime.constraintForceMagnitudeN();
    if (force === null) throw new Error("LOAD-REBIND browser pre-CUT relation force unavailable");
    preloadForceN = force;
    preloadRelativeAngularSpeedRadps = relativeAngularSpeedZ(beforeSnapshots, before.relation);
  } finally {
    beforeRuntime.dispose();
  }

  const transferredMotion = transferRebindMotion(compilation, beforeSnapshots);
  const constrained = await LoadedRebindPhysics.create(after, fixture.bearing.matter.materials, transferredMotion, true);
  const control = await LoadedRebindPhysics.create(after, fixture.bearing.matter.materials, transferredMotion, false);

  try {
    const immediateSnapshots = constrained.snapshots();
    const immediateKinematics = constrained.bearingKinematics();
    const positionJumpA = vecError(immediateKinematics.anchorAWorld, beforeKinematics.anchorAWorld);
    const positionJumpB = vecError(immediateKinematics.anchorBWorld, beforeKinematics.anchorBWorld);
    const velocityJumpA = vecError(immediateKinematics.anchorVelocityA, beforeKinematics.anchorVelocityA);
    const velocityJumpB = vecError(immediateKinematics.anchorVelocityB, beforeKinematics.anchorVelocityB);

    constrained.stepLoaded(LOAD_REBIND_FORCE_N, 1);
    control.stepLoaded(LOAD_REBIND_FORCE_N, 1);
    const firstStepSnapshots = constrained.snapshots();
    const firstStepKinematics = constrained.bearingKinematics();
    const firstForce = constrained.constraintForceMagnitudeN();
    if (firstForce === null) throw new Error("LOAD-REBIND browser fresh relation force unavailable");

    constrained.stepLoaded(LOAD_REBIND_FORCE_N, POST_STEPS - 1);
    control.stepLoaded(LOAD_REBIND_FORCE_N, POST_STEPS - 1);
    const finalSnapshots = constrained.snapshots();
    const controlSnapshots = control.snapshots();
    const finalKinematics = constrained.bearingKinematics();
    const controlKinematics = control.bearingKinematics();
    const finalRelativeAngularSpeedRadps = relativeAngularSpeedZ(finalSnapshots, after.relation);

    const maxPositionJump = Math.max(positionJumpA, positionJumpB);
    const maxVelocityJump = Math.max(velocityJumpA, velocityJumpB);
    const gates: Gate[] = [
      { id: "source-count", pass: fixture.bearing.matter.cells.length === 7, value: fixture.bearing.matter.cells.length, limit: "= 7" },
      { id: "body-transition", pass: before.physicalPlan.bodies.length === 2 && after.physicalPlan.bodies.length === 3, value: `${before.physicalPlan.bodies.length}->${after.physicalPlan.bodies.length}`, limit: "= 2->3" },
      { id: "endpoint-rebound", pass: before.relation.bodyAId !== after.relation.bodyAId, value: `${before.relation.bodyAId}->${after.relation.bodyAId}`, limit: "must change" },
      { id: "preload-force", pass: preloadForceN >= MIN_PRELOAD_FORCE_N && preloadForceN <= MAX_PRELOAD_FORCE_N, value: preloadForceN, limit: `${MIN_PRELOAD_FORCE_N}..${MAX_PRELOAD_FORCE_N} N` },
      { id: "preload-gap", pass: beforeKinematics.anchorGapM <= MAX_PRE_CUT_GAP_M, value: beforeKinematics.anchorGapM, limit: `<= ${MAX_PRE_CUT_GAP_M} m` },
      { id: "preload-motion", pass: preloadRelativeAngularSpeedRadps >= MIN_PRE_CUT_RELATIVE_ANGULAR_SPEED_RADPS, value: preloadRelativeAngularSpeedRadps, limit: `>= ${MIN_PRE_CUT_RELATIVE_ANGULAR_SPEED_RADPS} rad/s` },
      { id: "immediate-position", pass: maxPositionJump <= MAX_IMMEDIATE_POSITION_JUMP_M, value: maxPositionJump, limit: `<= ${MAX_IMMEDIATE_POSITION_JUMP_M} m` },
      { id: "immediate-velocity", pass: maxVelocityJump <= MAX_IMMEDIATE_VELOCITY_JUMP_MPS, value: maxVelocityJump, limit: `<= ${MAX_IMMEDIATE_VELOCITY_JUMP_MPS} m/s` },
      { id: "first-step-gap", pass: firstStepKinematics.anchorGapM <= MAX_FIRST_STEP_GAP_M, value: firstStepKinematics.anchorGapM, limit: `<= ${MAX_FIRST_STEP_GAP_M} m` },
      { id: "first-step-anchor-velocity", pass: firstStepKinematics.anchorVelocityGapMps <= MAX_FIRST_STEP_ANCHOR_VELOCITY_GAP_MPS, value: firstStepKinematics.anchorVelocityGapMps, limit: `<= ${MAX_FIRST_STEP_ANCHOR_VELOCITY_GAP_MPS} m/s` },
      { id: "first-step-force", pass: firstForce >= MIN_FIRST_STEP_FORCE_N && firstForce <= MAX_FIRST_STEP_FORCE_N, value: firstForce, limit: `${MIN_FIRST_STEP_FORCE_N}..${MAX_FIRST_STEP_FORCE_N} N` },
      { id: "final-gap", pass: finalKinematics.anchorGapM <= MAX_FINAL_GAP_M, value: finalKinematics.anchorGapM, limit: `<= ${MAX_FINAL_GAP_M} m` },
      { id: "control-separation", pass: controlKinematics.anchorGapM >= MIN_CONTROL_GAP_M, value: controlKinematics.anchorGapM, limit: `>= ${MIN_CONTROL_GAP_M} m` },
      { id: "free-rotation", pass: finalRelativeAngularSpeedRadps >= MIN_FINAL_RELATIVE_ANGULAR_SPEED_RADPS, value: finalRelativeAngularSpeedRadps, limit: `>= ${MIN_FINAL_RELATIVE_ANGULAR_SPEED_RADPS} rad/s` },
      { id: "finite-state", pass: [...immediateSnapshots, ...firstStepSnapshots, ...finalSnapshots, ...controlSnapshots].every(finiteSnapshot), value: "all finite", limit: "required" },
    ];

    renderMetric("preload force N", preloadForceN, "preload-force-n");
    renderMetric("preload gap m", beforeKinematics.anchorGapM, "preload-gap-m");
    renderMetric("preload relative angular speed rad/s", preloadRelativeAngularSpeedRadps, "preload-relative-angular-speed-radps");
    renderMetric("max immediate position jump m", maxPositionJump, "max-position-jump-m");
    renderMetric("max immediate velocity jump m/s", maxVelocityJump, "max-velocity-jump-mps");
    renderMetric("first-step gap m", firstStepKinematics.anchorGapM, "first-step-gap-m");
    renderMetric("first-step anchor velocity gap m/s", firstStepKinematics.anchorVelocityGapMps, "first-step-anchor-velocity-gap-mps");
    renderMetric("first-step force N", firstForce, "first-step-force-n");
    renderMetric("final gap m", finalKinematics.anchorGapM, "final-gap-m");
    renderMetric("control gap m", controlKinematics.anchorGapM, "control-gap-m");
    renderMetric("final relative angular speed rad/s", finalRelativeAngularSpeedRadps, "final-relative-angular-speed-radps");
    for (const gate of gates) renderGate(gate);

    const pass = gates.every((gate) => gate.pass);
    status.dataset.state = pass ? "PASS" : "FAIL";
    status.textContent = pass ? "PASS" : "FAIL";
    status.className = pass ? "status pass" : "status fail";
    document.documentElement.dataset.loadRebindEvidence = pass ? "PASS" : "FAIL";
    if (!pass) throw new Error(`ANVIL-04 production browser evidence failed: ${gates.filter((gate) => !gate.pass).map((gate) => gate.id).join(", ")}`);
  } finally {
    constrained.dispose();
    control.dispose();
  }
}

void run().catch((error: unknown) => {
  status.dataset.state = "FAIL";
  status.textContent = "FAIL";
  status.className = "status fail";
  document.documentElement.dataset.loadRebindEvidence = "FAIL";
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  const pre = document.createElement("pre");
  pre.id = "load-rebind-error";
  pre.textContent = message;
  root.append(pre);
  console.error(error);
});
