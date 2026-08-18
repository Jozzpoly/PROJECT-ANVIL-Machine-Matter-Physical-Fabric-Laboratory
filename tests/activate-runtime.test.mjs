import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { totalLinearMomentum } from "../.test-build/src/foundation/continuity.js";
import { magnitudeVec3, subtractVec3 } from "../.test-build/src/foundation/spatial.js";
import {
  compileTorquePatch,
  createTorquePatchFixture,
} from "../.test-build/src/experiments/anvil-06-torque-patch.js";
import { ActivatePhysics } from "../.test-build/src/experiments/anvil-09-activate-runtime.js";

const ACTIVE_EFFORT_NM = 100;
const OFF_STEPS = 60;
const ON_STEPS = 60;
const BRANCH_STEPS = 30;
const MAX_BEARING_GAP_M = 0.0025;
const MAX_OFF_ANGLE_RAD = 0.01;
const MAX_OFF_SPEED_RADPS = 0.01;
const MAX_BRANCH_DELTA = 1e-6;
const MIN_ON_ANGLE_INCREASE_RAD = 0.35;
const MIN_ON_SPEED_RADPS = 0.35;
const MIN_POST_OFF_SPEED_RADPS = 0.35;
const MIN_POST_OFF_ANGLE_INCREASE_RAD = 0.10;
const MIN_CONTINUED_ON_SPEED_ADVANTAGE_RADPS = 0.25;
const MAX_LINEAR_MOMENTUM_KG_MPS = 0.05;
const MAX_BARYCENTER_DRIFT_M = 0.0005;

function scale(value, scalar) {
  return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar };
}

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function barycenter(snapshots) {
  let totalMass = 0;
  let weighted = { x: 0, y: 0, z: 0 };
  for (const snapshot of snapshots) {
    totalMass += snapshot.massKg;
    weighted = add(weighted, scale(snapshot.position, snapshot.massKg));
  }
  assert.ok(totalMass > 0 && Number.isFinite(totalMass));
  return scale(weighted, 1 / totalMass);
}

function finiteSnapshot(snapshot) {
  return [
    snapshot.position.x, snapshot.position.y, snapshot.position.z,
    snapshot.rotation.x, snapshot.rotation.y, snapshot.rotation.z, snapshot.rotation.w,
    snapshot.linearVelocity.x, snapshot.linearVelocity.y, snapshot.linearVelocity.z,
    snapshot.angularVelocity.x, snapshot.angularVelocity.y, snapshot.angularVelocity.z,
    snapshot.massKg, snapshot.localCenter.x, snapshot.localCenter.y, snapshot.localCenter.z,
  ].every(Number.isFinite);
}

function observe(runtime, initialBarycenter) {
  const snapshots = runtime.snapshots();
  const momentum = totalLinearMomentum(snapshots.map((snapshot) => ({
    massKg: snapshot.massKg,
    linearVelocity: snapshot.linearVelocity,
  })));
  return {
    activation: runtime.activation,
    angleRad: runtime.bearingAngleRad(),
    relativeAngularSpeedRadps: runtime.relativeAngularSpeedRadps(),
    bearingGapM: runtime.bearingGapM(),
    linearMomentumMagnitudeKgMps: magnitudeVec3(momentum),
    barycenterDriftM: magnitudeVec3(subtractVec3(barycenter(snapshots), initialBarycenter)),
    finite: snapshots.every(finiteSnapshot),
  };
}

function assertIsolation(label, result) {
  assert.ok(result.finite, `${label} contains non-finite runtime state`);
  assert.ok(result.bearingGapM <= MAX_BEARING_GAP_M, `${label} bearing gap ${result.bearingGapM}`);
  assert.ok(
    result.linearMomentumMagnitudeKgMps <= MAX_LINEAR_MOMENTUM_KG_MPS,
    `${label} linear momentum ${result.linearMomentumMagnitudeKgMps}`,
  );
  assert.ok(result.barycenterDriftM <= MAX_BARYCENTER_DRIFT_M, `${label} barycenter drift ${result.barycenterDriftM}`);
}

function assertReceipt(receipt) {
  assert.equal(receipt.engineVersion, "0.1.0");
  assert.equal(receipt.relationCreated, true);
  assert.equal(receipt.bodyCount, 2);
  assert.equal(receipt.jointCount, 1);
  assert.ok(magnitudeVec3(receipt.gravity) <= 1e-12);
  assert.equal(receipt.contactsDisabled, true);
  for (const value of Object.values(receipt.bodyMassErrorsKg)) assert.ok(Number.isFinite(value));
  for (const value of Object.values(receipt.bodyLocalCenterErrorsM)) assert.ok(Number.isFinite(value));
  for (const value of Object.values(receipt.bodyLinearDamping)) assert.equal(value, 0);
  for (const value of Object.values(receipt.bodyAngularDamping)) assert.equal(value, 0);
  for (const value of Object.values(receipt.bodySleepEnabled)) assert.equal(value, false);
}

function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

test("ANVIL-09 C0-C3 transient OFF/ON/OFF separates from continued ON in real Box3D", async () => {
  const authored = createTorquePatchFixture(ACTIVE_EFFORT_NM);
  const compilation = compileTorquePatch(authored);
  const authoredBefore = structuredClone(authored);
  const compilationBefore = structuredClone(compilation);
  deepFreeze(authored);
  deepFreeze(compilation);

  const deactivated = await ActivatePhysics.create(compilation, authored.bearing.matter.materials);
  const continuedOn = await ActivatePhysics.create(compilation, authored.bearing.matter.materials);

  try {
    assert.equal(deactivated.sourceCompilation, compilation);
    assert.equal(continuedOn.sourceCompilation, compilation);
    assert.equal(deactivated.activation, "OFF");
    assert.equal(continuedOn.activation, "OFF");
    assertReceipt(deactivated.receipt);
    assertReceipt(continuedOn.receipt);

    const initialBarycenterDeactivated = barycenter(deactivated.snapshots());
    const initialBarycenterContinued = barycenter(continuedOn.snapshots());

    deactivated.step(OFF_STEPS);
    continuedOn.step(OFF_STEPS);
    const offDeactivated = observe(deactivated, initialBarycenterDeactivated);
    const offContinued = observe(continuedOn, initialBarycenterContinued);

    for (const [label, result] of [["OFF deactivated", offDeactivated], ["OFF continued", offContinued]]) {
      assert.equal(result.activation, "OFF");
      assert.ok(Math.abs(result.angleRad) <= MAX_OFF_ANGLE_RAD, `${label} angle ${result.angleRad}`);
      assert.ok(Math.abs(result.relativeAngularSpeedRadps) <= MAX_OFF_SPEED_RADPS, `${label} speed ${result.relativeAngularSpeedRadps}`);
      assertIsolation(label, result);
    }
    assert.ok(Math.abs(offDeactivated.angleRad - offContinued.angleRad) <= MAX_BRANCH_DELTA);
    assert.ok(Math.abs(offDeactivated.relativeAngularSpeedRadps - offContinued.relativeAngularSpeedRadps) <= MAX_BRANCH_DELTA);
    assert.ok(Math.abs(offDeactivated.bearingGapM - offContinued.bearingGapM) <= MAX_BRANCH_DELTA);

    deactivated.setActivation("ON");
    continuedOn.setActivation("ON");
    deactivated.step(ON_STEPS);
    continuedOn.step(ON_STEPS);
    const activeDeactivated = observe(deactivated, initialBarycenterDeactivated);
    const activeContinued = observe(continuedOn, initialBarycenterContinued);

    for (const [label, off, active] of [
      ["ON deactivated", offDeactivated, activeDeactivated],
      ["ON continued", offContinued, activeContinued],
    ]) {
      assert.equal(active.activation, "ON");
      assert.ok(active.angleRad - off.angleRad >= MIN_ON_ANGLE_INCREASE_RAD, `${label} angle increase ${active.angleRad - off.angleRad}`);
      assert.ok(active.relativeAngularSpeedRadps >= MIN_ON_SPEED_RADPS, `${label} speed ${active.relativeAngularSpeedRadps}`);
      assertIsolation(label, active);
    }
    assert.ok(Math.abs(activeDeactivated.angleRad - activeContinued.angleRad) <= MAX_BRANCH_DELTA);
    assert.ok(Math.abs(activeDeactivated.relativeAngularSpeedRadps - activeContinued.relativeAngularSpeedRadps) <= MAX_BRANCH_DELTA);
    assert.ok(Math.abs(activeDeactivated.bearingGapM - activeContinued.bearingGapM) <= MAX_BRANCH_DELTA);

    deactivated.setActivation("OFF");
    continuedOn.setActivation("ON");
    deactivated.step(BRANCH_STEPS);
    continuedOn.step(BRANCH_STEPS);
    const finalDeactivated = observe(deactivated, initialBarycenterDeactivated);
    const finalContinued = observe(continuedOn, initialBarycenterContinued);

    console.log(JSON.stringify({
      probe: "ANVIL-09/ACTIVATE-C0-C3",
      sourceEffortNm: authored.patch.effortNm,
      off: { deactivated: offDeactivated, continuedOn: offContinued },
      active: { deactivated: activeDeactivated, continuedOn: activeContinued },
      final: { deactivated: finalDeactivated, continuedOn: finalContinued },
      postOffSpeedChangeRadps: finalDeactivated.relativeAngularSpeedRadps - activeDeactivated.relativeAngularSpeedRadps,
      continuedOnSpeedAdvantageRadps: finalContinued.relativeAngularSpeedRadps - finalDeactivated.relativeAngularSpeedRadps,
    }));

    assert.equal(finalDeactivated.activation, "OFF");
    assert.ok(finalDeactivated.relativeAngularSpeedRadps >= MIN_POST_OFF_SPEED_RADPS, `post-OFF speed ${finalDeactivated.relativeAngularSpeedRadps}`);
    assert.ok(
      finalDeactivated.angleRad - activeDeactivated.angleRad >= MIN_POST_OFF_ANGLE_INCREASE_RAD,
      `post-OFF angle increase ${finalDeactivated.angleRad - activeDeactivated.angleRad}`,
    );
    assertIsolation("final deactivated", finalDeactivated);

    assert.equal(finalContinued.activation, "ON");
    assert.ok(
      finalContinued.relativeAngularSpeedRadps - finalDeactivated.relativeAngularSpeedRadps >= MIN_CONTINUED_ON_SPEED_ADVANTAGE_RADPS,
      `continued-ON speed advantage ${finalContinued.relativeAngularSpeedRadps - finalDeactivated.relativeAngularSpeedRadps}`,
    );
    assertIsolation("final continued ON", finalContinued);

    assert.deepEqual(authored, authoredBefore, "ANVIL-09 runtime mutated authored source");
    assert.deepEqual(compilation, compilationBefore, "ANVIL-09 runtime mutated persistent compilation");
  } finally {
    deactivated.dispose();
    continuedOn.dispose();
  }
});

test("ANVIL-09 real-solver runtime applies body torque without motor or velocity-setter control paths", async () => {
  const source = await readFile(new URL("../src/experiments/anvil-09-activate-runtime.ts", import.meta.url), "utf8");
  assert.equal(source.includes("b3Body_ApplyTorque"), true);
  for (const forbidden of [
    "motorSpeed",
    "maxMotorTorque",
    "EnableMotor",
    "SetMotor",
    "SetAngularVelocity",
  ]) {
    assert.equal(source.includes(forbidden), false, `ANVIL-09 runtime contains forbidden solver-control token ${forbidden}`);
  }
});
