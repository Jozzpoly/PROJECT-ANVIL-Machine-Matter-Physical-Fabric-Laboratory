import test from "node:test";
import assert from "node:assert/strict";
import { totalLinearMomentum } from "../.test-build/src/foundation/continuity.js";
import {
  addVec3,
  magnitudeVec3,
  subtractVec3,
} from "../.test-build/src/foundation/spatial.js";
import { velocityForRotationAboutPivot } from "../.test-build/src/experiments/anvil-02-bearing.js";
import {
  RebindPhysics,
  compileRebind,
  transferRebindMotion,
} from "../.test-build/src/experiments/anvil-03-rebind.js";
import { createTorquePatchFixture } from "../.test-build/src/experiments/anvil-06-torque-patch.js";
import { relowerTorquePatchToBearing } from "../.test-build/src/experiments/anvil-10-torque-patch-rebind.js";
import { TorquePatchRebindPhysics } from "../.test-build/src/experiments/anvil-10-torque-patch-rebind-runtime.js";

const ACTIVE_EFFORT_NM = 100;
const CUT = ["a:0", "a:2"];
const PRE_CUT_STEPS = 31;
const POST_CUT_STEPS = 30;
const MAX_ANCHOR_JUMP_M = 0.00007;
const MAX_ANCHOR_VELOCITY_JUMP_MPS = 0.00007;
const MAX_BEARING_GAP_M = 0.0025;
const MAX_MOMENTUM_ERROR_KG_MPS = 0.75;
const MAX_WORLD_BRANCH_DELTA = 1e-6;
const MIN_ACTIVE_SPEED_ADVANTAGE_RADPS = 0.25;
const MAX_ACTIVE_CONTROL_MOMENTUM_DELTA_KG_MPS = 0.05;
const MAX_BARYCENTER_SEPARATION_M = 0.0005;
const MAX_STALE_SIBLING_ANGULAR_DELTA_RADPS = 1e-6;
const MAX_STALE_SIBLING_LINEAR_DELTA_MPS = 1e-6;

function bodyById(plan, id) {
  const body = plan.bodies.find((candidate) => candidate.id === id);
  assert.ok(body, `missing body ${id}`);
  return body;
}

function snapshotById(snapshots, id) {
  const snapshot = snapshots.find((candidate) => candidate.planBodyId === id);
  assert.ok(snapshot, `missing snapshot ${id}`);
  return snapshot;
}

function scale(value, scalar) {
  return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar };
}

function assertVecNear(actual, expected, tolerance, label) {
  const error = magnitudeVec3(subtractVec3(actual, expected));
  assert.ok(error <= tolerance, `${label} error ${error} exceeds ${tolerance}`);
  return error;
}

function momentum(snapshots) {
  return totalLinearMomentum(snapshots.map((snapshot) => ({
    massKg: snapshot.massKg,
    linearVelocity: snapshot.linearVelocity,
  })));
}

function barycenter(snapshots) {
  let totalMass = 0;
  let weighted = { x: 0, y: 0, z: 0 };
  for (const snapshot of snapshots) {
    totalMass += snapshot.massKg;
    weighted = addVec3(weighted, scale(snapshot.position, snapshot.massKg));
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

test("ANVIL-10 C0-C2 rebinds the local torque action onto the moving post-CUT runtime without touching the stale sibling", async () => {
  const authored = createTorquePatchFixture(ACTIVE_EFFORT_NM);
  const rebind = compileRebind({ bearing: authored.bearing, cut: CUT });
  const before = rebind.before;
  const bodyA = bodyById(before.physicalPlan, before.relation.bodyAId);
  const bodyB = bodyById(before.physicalPlan, before.relation.bodyBId);
  const omegaA = { x: 0, y: 0, z: -0.65 };
  const omegaB = { x: 0, y: 0, z: 0.95 };
  const commonDrift = { x: 0.8, y: -0.25, z: 0.35 };
  const initialMotion = {
    [bodyA.id]: {
      position: bodyA.centerOfMassWorld,
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      linearVelocity: addVec3(
        commonDrift,
        velocityForRotationAboutPivot(omegaA, bodyA.centerOfMassWorld, before.relation.pivotWorld),
      ),
      angularVelocity: omegaA,
    },
    [bodyB.id]: {
      position: bodyB.centerOfMassWorld,
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      linearVelocity: addVec3(
        commonDrift,
        velocityForRotationAboutPivot(omegaB, bodyB.centerOfMassWorld, before.relation.pivotWorld),
      ),
      angularVelocity: omegaB,
    },
  };

  const preRuntime = await RebindPhysics.create(before, authored.bearing.matter.materials, initialMotion, true);
  let preSnapshots;
  let preKinematics;
  let preMomentum;
  try {
    preRuntime.step(PRE_CUT_STEPS);
    preSnapshots = preRuntime.snapshots();
    preKinematics = preRuntime.bearingKinematics();
    preMomentum = momentum(preSnapshots);
    assert.ok(preKinematics.anchorGapM <= MAX_BEARING_GAP_M, `pre-CUT gap ${preKinematics.anchorGapM}`);
  } finally {
    preRuntime.dispose();
  }

  const transferredMotion = transferRebindMotion(rebind, preSnapshots);
  const afterCompilation = relowerTorquePatchToBearing(authored.patch, rebind.after);
  const active = await TorquePatchRebindPhysics.create(
    afterCompilation,
    authored.bearing.matter.materials,
    transferredMotion,
  );
  const control = await TorquePatchRebindPhysics.create(
    afterCompilation,
    authored.bearing.matter.materials,
    transferredMotion,
  );

  try {
    // C0 — fresh reconstructed worlds are passive, identical and preserve the
    // already-earned REBIND transaction continuity before any active torque.
    assert.equal(active.activation, "OFF");
    assert.equal(control.activation, "OFF");
    assert.equal(active.sourceCompilation, afterCompilation);
    assert.equal(control.sourceCompilation, afterCompilation);
    for (const runtime of [active, control]) {
      assert.equal(runtime.receipt.engineVersion, "0.1.0");
      assert.equal(runtime.receipt.relationCreated, true);
      assert.equal(runtime.receipt.bodyCount, 3);
      assert.equal(runtime.receipt.jointCount, 1);
      assert.equal(runtime.receipt.contactsDisabled, true);
      assert.ok(Object.values(runtime.receipt.bodyLinearDamping).every((value) => value === 0));
      assert.ok(Object.values(runtime.receipt.bodyAngularDamping).every((value) => value === 0));
      assert.ok(Object.values(runtime.receipt.bodySleepEnabled).every((value) => value === false));
    }

    const activeImmediate = active.snapshots();
    const controlImmediate = control.snapshots();
    assert.equal(activeImmediate.length, 3);
    assert.equal(controlImmediate.length, 3);
    assert.ok(activeImmediate.every(finiteSnapshot));
    assert.ok(controlImmediate.every(finiteSnapshot));

    const activeImmediateKinematics = active.bearingKinematics();
    const controlImmediateKinematics = control.bearingKinematics();
    const positionJumpA = assertVecNear(
      activeImmediateKinematics.anchorAWorld,
      preKinematics.anchorAWorld,
      MAX_ANCHOR_JUMP_M,
      "bearing A anchor position",
    );
    const positionJumpB = assertVecNear(
      activeImmediateKinematics.anchorBWorld,
      preKinematics.anchorBWorld,
      MAX_ANCHOR_JUMP_M,
      "bearing B anchor position",
    );
    const velocityJumpA = assertVecNear(
      activeImmediateKinematics.anchorVelocityA,
      preKinematics.anchorVelocityA,
      MAX_ANCHOR_VELOCITY_JUMP_MPS,
      "bearing A material-point velocity",
    );
    const velocityJumpB = assertVecNear(
      activeImmediateKinematics.anchorVelocityB,
      preKinematics.anchorVelocityB,
      MAX_ANCHOR_VELOCITY_JUMP_MPS,
      "bearing B material-point velocity",
    );
    assert.ok(activeImmediateKinematics.anchorGapM <= MAX_BEARING_GAP_M);
    assert.ok(controlImmediateKinematics.anchorGapM <= MAX_BEARING_GAP_M);
    assert.ok(
      Math.abs(activeImmediateKinematics.anchorGapM - controlImmediateKinematics.anchorGapM) <= MAX_WORLD_BRANCH_DELTA,
    );
    assert.ok(
      Math.abs(active.relativeAngularSpeedRadps() - control.relativeAngularSpeedRadps()) <= MAX_WORLD_BRANCH_DELTA,
    );
    const immediateMomentumError = magnitudeVec3(subtractVec3(momentum(activeImmediate), preMomentum));
    assert.ok(immediateMomentumError <= MAX_MOMENTUM_ERROR_KG_MPS, `momentum error ${immediateMomentumError}`);

    // C1 — branch only after the identical fresh worlds have passed C0.
    active.setActivation("ON");
    assert.equal(active.activation, "ON");
    assert.equal(control.activation, "OFF");
    active.step(1);
    control.step(1);
    assert.ok(control.snapshots().every(finiteSnapshot));
    assert.ok(control.bearingKinematics().anchorGapM <= MAX_BEARING_GAP_M);
    active.step(POST_CUT_STEPS - 1);
    control.step(POST_CUT_STEPS - 1);

    const activeFinal = active.snapshots();
    const controlFinal = control.snapshots();
    assert.ok(activeFinal.every(finiteSnapshot));
    assert.ok(controlFinal.every(finiteSnapshot));
    const activeSpeed = active.relativeAngularSpeedRadps();
    const controlSpeed = control.relativeAngularSpeedRadps();
    const speedAdvantage = activeSpeed - controlSpeed;
    const activeGap = active.bearingKinematics().anchorGapM;
    const controlGap = control.bearingKinematics().anchorGapM;
    const momentumDelta = magnitudeVec3(subtractVec3(momentum(activeFinal), momentum(controlFinal)));
    const barycenterSeparation = magnitudeVec3(subtractVec3(barycenter(activeFinal), barycenter(controlFinal)));

    assert.ok(
      speedAdvantage >= MIN_ACTIVE_SPEED_ADVANTAGE_RADPS,
      `ACTIVE speed advantage ${speedAdvantage} below ${MIN_ACTIVE_SPEED_ADVANTAGE_RADPS}`,
    );
    assert.ok(activeGap <= MAX_BEARING_GAP_M, `ACTIVE bearing gap ${activeGap}`);
    assert.ok(controlGap <= MAX_BEARING_GAP_M, `CONTROL bearing gap ${controlGap}`);
    assert.ok(
      momentumDelta <= MAX_ACTIVE_CONTROL_MOMENTUM_DELTA_KG_MPS,
      `ACTIVE/CONTROL momentum delta ${momentumDelta}`,
    );
    assert.ok(
      barycenterSeparation <= MAX_BARYCENTER_SEPARATION_M,
      `ACTIVE/CONTROL barycenter separation ${barycenterSeparation}`,
    );

    // C2 — the valid-looking stale sibling body:a:0 is disconnected from the
    // rebound bearing endpoint and must not receive the remapped action.
    const activeSibling = snapshotById(activeFinal, "body:a:0");
    const controlSibling = snapshotById(controlFinal, "body:a:0");
    const staleSiblingAngularDelta = magnitudeVec3(
      subtractVec3(activeSibling.angularVelocity, controlSibling.angularVelocity),
    );
    const staleSiblingLinearDelta = magnitudeVec3(
      subtractVec3(activeSibling.linearVelocity, controlSibling.linearVelocity),
    );
    assert.ok(
      staleSiblingAngularDelta <= MAX_STALE_SIBLING_ANGULAR_DELTA_RADPS,
      `stale sibling angular delta ${staleSiblingAngularDelta}`,
    );
    assert.ok(
      staleSiblingLinearDelta <= MAX_STALE_SIBLING_LINEAR_DELTA_MPS,
      `stale sibling linear delta ${staleSiblingLinearDelta}`,
    );

    console.log(JSON.stringify({
      probe: "ANVIL-10/TORQUE-PATCH-REBIND-C0-C2",
      sourcePatchId: afterCompilation.sourcePatchId,
      sourceTarget: afterCompilation.sourceTarget,
      bearingBodyBefore: rebind.before.relation.bodyAId,
      bearingBodyAfter: rebind.after.relation.bodyAId,
      staleSiblingBody: "body:a:0",
      preCutGapM: preKinematics.anchorGapM,
      immediateGapM: activeImmediateKinematics.anchorGapM,
      positionJumpA_M: positionJumpA,
      positionJumpB_M: positionJumpB,
      velocityJumpA_Mps: velocityJumpA,
      velocityJumpB_Mps: velocityJumpB,
      immediateMomentumErrorKgMps: immediateMomentumError,
      activeFinalSpeedRadps: activeSpeed,
      controlFinalSpeedRadps: controlSpeed,
      activeSpeedAdvantageRadps: speedAdvantage,
      activeGapM: activeGap,
      controlGapM: controlGap,
      activeControlMomentumDeltaKgMps: momentumDelta,
      barycenterSeparationM: barycenterSeparation,
      staleSiblingAngularDeltaRadps: staleSiblingAngularDelta,
      staleSiblingLinearDeltaMps: staleSiblingLinearDelta,
    }));
  } finally {
    active.dispose();
    control.dispose();
  }
});
