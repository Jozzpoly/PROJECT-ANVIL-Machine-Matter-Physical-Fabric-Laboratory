import "./style.css";
import { totalLinearMomentum } from "./foundation/continuity.js";
import { magnitudeVec3, subtractVec3 } from "./foundation/spatial.js";
import type { BearingRuntimeSnapshot } from "./experiments/anvil-02-bearing.js";
import {
  TorquePhysics,
  compileTorque,
  createTorqueFixture,
} from "./experiments/anvil-05-torque.js";

const ACTIVE_EFFORT_NM = 100;
const STEPS = 60;
const MAX_BEARING_GAP_M = 0.0025;
const MIN_ACTIVE_ANGLE_RAD = 0.35;
const MAX_CONTROL_ANGLE_RAD = 0.01;
const MIN_ACTIVE_SPEED_RADPS = 0.35;
const MAX_CONTROL_SPEED_RADPS = 0.01;
const MAX_LINEAR_MOMENTUM_KG_MPS = 0.05;
const MAX_BARYCENTER_DRIFT_M = 0.0005;

interface VariantResult {
  readonly sourceCells: number;
  readonly bodies: number;
  readonly sourceBearingId: string;
  readonly sourceTorqueId: string;
  readonly effortNm: number;
  readonly angleRad: number;
  readonly relativeAngularSpeedRadps: number;
  readonly bearingGapM: number;
  readonly linearMomentumMagnitudeKgMps: number;
  readonly barycenterDriftM: number;
  readonly finite: boolean;
}

interface Gate {
  readonly id: string;
  readonly pass: boolean;
  readonly value: number | string;
  readonly limit: string;
}

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (element === null) throw new Error(`TORQUE browser probe missing ${selector}`);
  return element;
}

function scale(value: { x: number; y: number; z: number }, scalar: number): { x: number; y: number; z: number } {
  return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar };
}

function add(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
): { x: number; y: number; z: number } {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function barycenter(snapshots: readonly BearingRuntimeSnapshot[]): { x: number; y: number; z: number } {
  let totalMass = 0;
  let weighted = { x: 0, y: 0, z: 0 };
  for (const snapshot of snapshots) {
    totalMass += snapshot.massKg;
    weighted = add(weighted, scale(snapshot.position, snapshot.massKg));
  }
  if (!(totalMass > 0) || !Number.isFinite(totalMass)) throw new Error("TORQUE browser invalid total mass");
  return scale(weighted, 1 / totalMass);
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

async function runVariant(effortNm: number): Promise<VariantResult> {
  const authored = createTorqueFixture(effortNm);
  const compilation = compileTorque(authored);
  const runtime = await TorquePhysics.create(compilation, authored.bearing.matter.materials);
  try {
    const initial = runtime.snapshots();
    const initialBarycenter = barycenter(initial);
    runtime.step(STEPS);
    const final = runtime.snapshots();
    const momentum = totalLinearMomentum(final.map((snapshot) => ({
      massKg: snapshot.massKg,
      linearVelocity: snapshot.linearVelocity,
    })));
    return {
      sourceCells: authored.bearing.matter.cells.length,
      bodies: compilation.bearing.physicalPlan.bodies.length,
      sourceBearingId: compilation.bearing.relation.sourceBearingId,
      sourceTorqueId: compilation.action.sourceTorqueId,
      effortNm,
      angleRad: runtime.bearingAngleRad(),
      relativeAngularSpeedRadps: runtime.relativeAngularSpeedRadps(),
      bearingGapM: runtime.bearingGapM(),
      linearMomentumMagnitudeKgMps: magnitudeVec3(momentum),
      barycenterDriftM: magnitudeVec3(subtractVec3(barycenter(final), initialBarycenter)),
      finite: final.every(finiteSnapshot),
    };
  } finally {
    runtime.dispose();
  }
}

const root = required<HTMLDivElement>("#app");
document.title = "PROJECT ANVIL — TORQUE browser evidence";
root.innerHTML = `<header class="topbar"><div><p class="eyebrow">PROJECT ANVIL · ANVIL-05</p><h1>TORQUE</h1><p class="subtitle">Production-browser evidence probe. No owner action required.</p></div><div class="status" id="torque-status" data-state="RUNNING">RUNNING</div></header><main class="layout"><section class="viewport-card"><div style="padding:24px;max-width:980px"><h2>Local authored torque through BEARING</h2><p>This technical probe runs +100 N·m, 0 N·m and -100 N·m variants through the production browser bundle. It is not an owner gate.</p><dl id="torque-metrics" class="metrics"></dl><ul id="torque-gates" class="gates"></ul></div></section></main>`;

const status = required<HTMLElement>("#torque-status");
const metrics = required<HTMLDListElement>("#torque-metrics");
const gateList = required<HTMLUListElement>("#torque-gates");

function appendMetric(id: string, label: string, value: number | string): void {
  const dt = document.createElement("dt");
  dt.textContent = label;
  const dd = document.createElement("dd");
  dd.dataset.metric = id;
  dd.dataset.raw = String(value);
  dd.textContent = typeof value === "number" ? String(value) : value;
  metrics.append(dt, dd);
}

function appendGate(gate: Gate): void {
  const li = document.createElement("li");
  li.dataset.gate = gate.id;
  li.dataset.pass = String(gate.pass);
  li.textContent = `${gate.pass ? "PASS" : "FAIL"} · ${gate.id} · ${String(gate.value)} · ${gate.limit}`;
  gateList.append(li);
}

void (async () => {
  try {
    const positive = await runVariant(ACTIVE_EFFORT_NM);
    const control = await runVariant(0);
    const negative = await runVariant(-ACTIVE_EFFORT_NM);

    const gates: readonly Gate[] = [
      { id: "source-count", pass: positive.sourceCells === 7 && control.sourceCells === 7 && negative.sourceCells === 7, value: `${positive.sourceCells}/${control.sourceCells}/${negative.sourceCells}`, limit: "7/7/7" },
      { id: "body-count", pass: positive.bodies === 2 && control.bodies === 2 && negative.bodies === 2, value: `${positive.bodies}/${control.bodies}/${negative.bodies}`, limit: "2/2/2" },
      { id: "source-identity", pass: positive.sourceBearingId === control.sourceBearingId && control.sourceBearingId === negative.sourceBearingId && positive.sourceTorqueId === control.sourceTorqueId && control.sourceTorqueId === negative.sourceTorqueId, value: `${positive.sourceBearingId} + ${positive.sourceTorqueId}`, limit: "stable persistent identities" },
      { id: "positive-angle", pass: positive.angleRad >= MIN_ACTIVE_ANGLE_RAD, value: positive.angleRad, limit: `>= ${MIN_ACTIVE_ANGLE_RAD} rad` },
      { id: "negative-angle", pass: negative.angleRad <= -MIN_ACTIVE_ANGLE_RAD, value: negative.angleRad, limit: `<= -${MIN_ACTIVE_ANGLE_RAD} rad` },
      { id: "control-angle", pass: Math.abs(control.angleRad) <= MAX_CONTROL_ANGLE_RAD, value: control.angleRad, limit: `abs <= ${MAX_CONTROL_ANGLE_RAD} rad` },
      { id: "positive-speed", pass: positive.relativeAngularSpeedRadps >= MIN_ACTIVE_SPEED_RADPS, value: positive.relativeAngularSpeedRadps, limit: `>= ${MIN_ACTIVE_SPEED_RADPS} rad/s` },
      { id: "negative-speed", pass: negative.relativeAngularSpeedRadps <= -MIN_ACTIVE_SPEED_RADPS, value: negative.relativeAngularSpeedRadps, limit: `<= -${MIN_ACTIVE_SPEED_RADPS} rad/s` },
      { id: "control-speed", pass: Math.abs(control.relativeAngularSpeedRadps) <= MAX_CONTROL_SPEED_RADPS, value: control.relativeAngularSpeedRadps, limit: `abs <= ${MAX_CONTROL_SPEED_RADPS} rad/s` },
      { id: "positive-gap", pass: positive.bearingGapM <= MAX_BEARING_GAP_M, value: positive.bearingGapM, limit: `<= ${MAX_BEARING_GAP_M} m` },
      { id: "negative-gap", pass: negative.bearingGapM <= MAX_BEARING_GAP_M, value: negative.bearingGapM, limit: `<= ${MAX_BEARING_GAP_M} m` },
      { id: "positive-momentum", pass: positive.linearMomentumMagnitudeKgMps <= MAX_LINEAR_MOMENTUM_KG_MPS, value: positive.linearMomentumMagnitudeKgMps, limit: `<= ${MAX_LINEAR_MOMENTUM_KG_MPS} kg*m/s` },
      { id: "negative-momentum", pass: negative.linearMomentumMagnitudeKgMps <= MAX_LINEAR_MOMENTUM_KG_MPS, value: negative.linearMomentumMagnitudeKgMps, limit: `<= ${MAX_LINEAR_MOMENTUM_KG_MPS} kg*m/s` },
      { id: "positive-barycenter", pass: positive.barycenterDriftM <= MAX_BARYCENTER_DRIFT_M, value: positive.barycenterDriftM, limit: `<= ${MAX_BARYCENTER_DRIFT_M} m` },
      { id: "negative-barycenter", pass: negative.barycenterDriftM <= MAX_BARYCENTER_DRIFT_M, value: negative.barycenterDriftM, limit: `<= ${MAX_BARYCENTER_DRIFT_M} m` },
      { id: "finite-state", pass: positive.finite && control.finite && negative.finite, value: String(positive.finite && control.finite && negative.finite), limit: "true" },
    ];

    appendMetric("positive-angle-rad", "positive angle rad", positive.angleRad);
    appendMetric("control-angle-rad", "control angle rad", control.angleRad);
    appendMetric("negative-angle-rad", "negative angle rad", negative.angleRad);
    appendMetric("positive-speed-radps", "positive relative speed rad/s", positive.relativeAngularSpeedRadps);
    appendMetric("control-speed-radps", "control relative speed rad/s", control.relativeAngularSpeedRadps);
    appendMetric("negative-speed-radps", "negative relative speed rad/s", negative.relativeAngularSpeedRadps);
    appendMetric("positive-gap-m", "positive bearing gap m", positive.bearingGapM);
    appendMetric("negative-gap-m", "negative bearing gap m", negative.bearingGapM);
    appendMetric("positive-momentum-kgmps", "positive linear momentum kg*m/s", positive.linearMomentumMagnitudeKgMps);
    appendMetric("negative-momentum-kgmps", "negative linear momentum kg*m/s", negative.linearMomentumMagnitudeKgMps);
    appendMetric("positive-barycenter-m", "positive barycenter drift m", positive.barycenterDriftM);
    appendMetric("negative-barycenter-m", "negative barycenter drift m", negative.barycenterDriftM);
    for (const gate of gates) appendGate(gate);

    const pass = gates.every((gate) => gate.pass);
    document.documentElement.dataset.torqueEvidence = pass ? "PASS" : "FAIL";
    status.dataset.state = pass ? "PASS" : "FAIL";
    status.textContent = pass ? "PASS" : "FAIL";
    if (!pass) throw new Error("ANVIL-05 production browser evidence gate failed");
  } catch (error: unknown) {
    document.documentElement.dataset.torqueEvidence = "FAIL";
    status.dataset.state = "FAIL";
    status.textContent = "FAIL";
    const pre = document.createElement("pre");
    pre.id = "torque-error";
    pre.textContent = error instanceof Error ? error.stack ?? error.message : String(error);
    root.append(pre);
    throw error;
  }
})();
