import test from "node:test";
import assert from "node:assert/strict";
import { totalLinearMomentum } from "../.test-build/src/foundation/continuity.js";
import { magnitudeVec3, subtractVec3 } from "../.test-build/src/foundation/spatial.js";
import {
  TorquePhysics,
  compileTorque,
  createTorqueFixture,
} from "../.test-build/src/experiments/anvil-05-torque.js";
import {
  compileTorquePatch,
  createTorquePatchFixture,
} from "../.test-build/src/experiments/anvil-06-torque-patch.js";

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

function actionMeaning(action) {
  return {
    sourceBearingId: action.sourceBearingId,
    effortNm: action.effortNm,
    bodyAId: action.bodyAId,
    bodyBId: action.bodyBId,
    axisWorld: action.axisWorld,
    torqueAWorld: action.torqueAWorld,
    torqueBWorld: action.torqueBWorld,
  };
}

async function runVariant(effortNm) {
  const authored = createTorquePatchFixture(effortNm);
  const compilation = compileTorquePatch(authored);
  const runtime = await TorquePhysics.create(compilation.torque, authored.bearing.matter.materials);
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

test("ANVIL-06 local source-face torque patch resolves BEARING deterministically and fails closed", () => {
  const authored = createTorquePatchFixture(ACTIVE_EFFORT_NM);
  assert.equal("bearingId" in authored.patch, false);
  assert.equal("bodyId" in authored.patch, false);
  assert.equal("jointId" in authored.patch, false);

  const compiled = compileTorquePatch(authored);
  assert.equal(compiled.resolvedBearingId, authored.bearing.bearing.id);
  assert.deepEqual(compiled.sourceTarget, authored.patch.target);
  assert.equal(compiled.torque.bearing.physicalPlan.bodies.length, 2);

  const direct = compileTorque(createTorqueFixture(ACTIVE_EFFORT_NM));
  assert.deepEqual(
    actionMeaning(compiled.torque.action),
    actionMeaning(direct.action),
    "local binding changed the already-supported torque action meaning",
  );

  const net = add(compiled.torque.action.torqueAWorld, compiled.torque.action.torqueBWorld);
  assert.ok(magnitudeVec3(net) <= 1e-12, `non-zero compiled torque pair sum ${magnitudeVec3(net)}`);

  const control = compileTorquePatch(createTorquePatchFixture(0));
  const negative = compileTorquePatch(createTorquePatchFixture(-ACTIVE_EFFORT_NM));
  assert.deepEqual(control.torque.bearing, compiled.torque.bearing);
  assert.deepEqual(negative.torque.bearing, compiled.torque.bearing);

  const reorderedSource = createTorquePatchFixture(ACTIVE_EFFORT_NM);
  const reordered = compileTorquePatch({
    ...reorderedSource,
    bearing: {
      ...reorderedSource.bearing,
      matter: {
        ...reorderedSource.bearing.matter,
        cells: [...reorderedSource.bearing.matter.cells].reverse(),
      },
    },
  });
  assert.deepEqual(actionMeaning(reordered.torque.action), actionMeaning(compiled.torque.action));

  const swappedSource = createTorquePatchFixture(ACTIVE_EFFORT_NM);
  const swapped = compileTorquePatch({
    ...swappedSource,
    bearing: {
      ...swappedSource.bearing,
      bearing: {
        ...swappedSource.bearing.bearing,
        endpointA: { ...swappedSource.bearing.bearing.endpointB },
        endpointB: { ...swappedSource.bearing.bearing.endpointA },
      },
    },
  });
  assert.deepEqual(actionMeaning(swapped.torque.action), actionMeaning(compiled.torque.action));

  const misplaced = createTorquePatchFixture(ACTIVE_EFFORT_NM, { cellId: "a:2", face: "x-" });
  assert.throws(() => compileTorquePatch(misplaced), /not a unique bearing endpoint/u);

  const unknown = createTorquePatchFixture(ACTIVE_EFFORT_NM, { cellId: "missing", face: "x+" });
  assert.throws(() => compileTorquePatch(unknown), /unknown source cell/u);

  const invalidFace = createTorquePatchFixture(ACTIVE_EFFORT_NM);
  assert.throws(
    () => compileTorquePatch({
      ...invalidFace,
      patch: {
        ...invalidFace.patch,
        target: { cellId: invalidFace.patch.target.cellId, face: "q+" },
      },
    }),
    /face q\+ is invalid/u,
  );

  const blankId = createTorquePatchFixture(ACTIVE_EFFORT_NM);
  assert.throws(() => compileTorquePatch({ ...blankId, patch: { ...blankId.patch, id: "   " } }), /id must be non-empty/u);

  const invalidEffort = createTorquePatchFixture(Number.NaN);
  assert.throws(() => compileTorquePatch(invalidEffort), /effortNm must be finite/u);
});

test("ANVIL-06 locally painted signed torque preserves accepted causal Box3D behavior", async () => {
  const positive = await runVariant(ACTIVE_EFFORT_NM);
  const control = await runVariant(0);
  const negative = await runVariant(-ACTIVE_EFFORT_NM);

  console.log(JSON.stringify({
    probe: "ANVIL-06/TORQUE-PATCH-C0",
    target: positive.compilation.sourceTarget,
    resolvedBearingId: positive.compilation.resolvedBearingId,
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

  assert.ok(positive.finite && control.finite && negative.finite, "non-finite TORQUE-PATCH runtime state");
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
