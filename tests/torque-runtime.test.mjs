import test from "node:test";
import assert from "node:assert/strict";
import { totalLinearMomentum } from "../.test-build/src/foundation/continuity.js";
import { magnitudeVec3, subtractVec3 } from "../.test-build/src/foundation/spatial.js";
import {
  TorquePhysics,
  compileTorque,
  createTorqueFixture,
} from "../.test-build/src/experiments/anvil-05-torque.js";

const ACTIVE_EFFORT_NM = 100;
const STEPS = 60;
const MAX_BEARING_GAP_M = 0.0025;
const MIN_ACTIVE_ANGLE_RAD = 0.35;
const MAX_CONTROL_ANGLE_RAD = 0.01;
const MIN_ACTIVE_SPEED_RADPS = 0.35;
const MAX_CONTROL_SPEED_RADPS = 0.01;
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

async function runVariant(effortNm) {
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
      authored,
      compilation,
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

test("ANVIL-05 torque function compiles against persistent bearing identity and fails closed", () => {
  const positive = compileTorque(createTorqueFixture(ACTIVE_EFFORT_NM));
  const control = compileTorque(createTorqueFixture(0));
  const negative = compileTorque(createTorqueFixture(-ACTIVE_EFFORT_NM));

  assert.equal(positive.bearing.physicalPlan.bodies.length, 2);
  assert.equal(positive.bearing.relation.sourceBearingId, "bearing:seam-0");
  assert.deepEqual(control.bearing, positive.bearing);
  assert.deepEqual(negative.bearing, positive.bearing);

  for (const compilation of [positive, control, negative]) {
    const net = add(compilation.action.torqueAWorld, compilation.action.torqueBWorld);
    assert.ok(magnitudeVec3(net) <= 1e-12, `non-zero compiled torque pair sum ${magnitudeVec3(net)}`);
    assert.equal(compilation.action.sourceBearingId, compilation.bearing.relation.sourceBearingId);
    assert.equal(compilation.action.bodyAId, compilation.bearing.relation.bodyAId);
    assert.equal(compilation.action.bodyBId, compilation.bearing.relation.bodyBId);
  }

  assert.ok(magnitudeVec3(control.action.torqueAWorld) <= 1e-12, "control A torque is not zero");
  assert.ok(magnitudeVec3(control.action.torqueBWorld) <= 1e-12, "control B torque is not zero");
  assert.equal(positive.action.torqueBWorld.z, ACTIVE_EFFORT_NM);
  assert.equal(negative.action.torqueBWorld.z, -ACTIVE_EFFORT_NM);

  const wrongBearing = createTorqueFixture(ACTIVE_EFFORT_NM);
  assert.throws(
    () => compileTorque({ ...wrongBearing, torque: { ...wrongBearing.torque, bearingId: "bearing:missing" } }),
    /unknown bearing/u,
  );
  const invalidEffort = createTorqueFixture(Number.NaN);
  assert.throws(() => compileTorque(invalidEffort), /effortNm must be finite/u);
});

test("ANVIL-05 signed authored torque causes opposite active rotation without linear thrust", async () => {
  const positive = await runVariant(ACTIVE_EFFORT_NM);
  const control = await runVariant(0);
  const negative = await runVariant(-ACTIVE_EFFORT_NM);

  console.log(JSON.stringify({
    probe: "ANVIL-05/TORQUE-C0",
    effortNm: ACTIVE_EFFORT_NM,
    positive: {
      angleRad: positive.angleRad,
      relativeAngularSpeedRadps: positive.relativeAngularSpeedRadps,
      bearingGapM: positive.bearingGapM,
      linearMomentumMagnitudeKgMps: positive.linearMomentumMagnitudeKgMps,
      barycenterDriftM: positive.barycenterDriftM,
    },
    control: {
      angleRad: control.angleRad,
      relativeAngularSpeedRadps: control.relativeAngularSpeedRadps,
      bearingGapM: control.bearingGapM,
      linearMomentumMagnitudeKgMps: control.linearMomentumMagnitudeKgMps,
      barycenterDriftM: control.barycenterDriftM,
    },
    negative: {
      angleRad: negative.angleRad,
      relativeAngularSpeedRadps: negative.relativeAngularSpeedRadps,
      bearingGapM: negative.bearingGapM,
      linearMomentumMagnitudeKgMps: negative.linearMomentumMagnitudeKgMps,
      barycenterDriftM: negative.barycenterDriftM,
    },
  }));

  assert.ok(positive.finite && control.finite && negative.finite, "non-finite TORQUE runtime state");
  assert.ok(positive.bearingGapM <= MAX_BEARING_GAP_M, `positive bearing gap ${positive.bearingGapM}`);
  assert.ok(negative.bearingGapM <= MAX_BEARING_GAP_M, `negative bearing gap ${negative.bearingGapM}`);

  assert.ok(positive.angleRad >= MIN_ACTIVE_ANGLE_RAD, `positive angle ${positive.angleRad}`);
  assert.ok(negative.angleRad <= -MIN_ACTIVE_ANGLE_RAD, `negative angle ${negative.angleRad}`);
  assert.ok(Math.abs(control.angleRad) <= MAX_CONTROL_ANGLE_RAD, `control angle ${control.angleRad}`);
  assert.ok(positive.relativeAngularSpeedRadps >= MIN_ACTIVE_SPEED_RADPS, `positive speed ${positive.relativeAngularSpeedRadps}`);
  assert.ok(negative.relativeAngularSpeedRadps <= -MIN_ACTIVE_SPEED_RADPS, `negative speed ${negative.relativeAngularSpeedRadps}`);
  assert.ok(Math.abs(control.relativeAngularSpeedRadps) <= MAX_CONTROL_SPEED_RADPS, `control speed ${control.relativeAngularSpeedRadps}`);

  for (const [label, result] of [["positive", positive], ["negative", negative]]) {
    assert.ok(
      result.linearMomentumMagnitudeKgMps <= MAX_LINEAR_MOMENTUM_KG_MPS,
      `${label} linear momentum ${result.linearMomentumMagnitudeKgMps}`,
    );
    assert.ok(
      result.barycenterDriftM <= MAX_BARYCENTER_DRIFT_M,
      `${label} barycenter drift ${result.barycenterDriftM}`,
    );
  }
});
