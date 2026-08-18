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
  createRebindFixture,
  transferRebindMotion,
} from "../.test-build/src/experiments/anvil-03-rebind.js";

const MAX_ANCHOR_JUMP_M = 0.00007;
const MAX_ANCHOR_VELOCITY_JUMP_MPS = 0.00007;
const MAX_BEARING_GAP_M = 0.0025;
const MAX_MOMENTUM_ERROR_KG_MPS = 0.75;
const MIN_CONTROL_GAP_M = 0.25;
const MIN_RELATIVE_ANGLE_RAD = 0.35;
const PRE_CUT_STEPS = 31;
const POST_CUT_STEPS = 120;

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

function finiteSnapshot(snapshot) {
  return [
    snapshot.position.x, snapshot.position.y, snapshot.position.z,
    snapshot.rotation.x, snapshot.rotation.y, snapshot.rotation.z, snapshot.rotation.w,
    snapshot.linearVelocity.x, snapshot.linearVelocity.y, snapshot.linearVelocity.z,
    snapshot.angularVelocity.x, snapshot.angularVelocity.y, snapshot.angularVelocity.z,
    snapshot.massKg, snapshot.localCenter.x, snapshot.localCenter.y, snapshot.localCenter.z,
  ].every(Number.isFinite);
}

function scale(value, scalar) {
  return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar };
}

function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function normalize(value) {
  const length = magnitudeVec3(value);
  assert.ok(length > 0 && Number.isFinite(length));
  return scale(value, 1 / length);
}

function axisAngleQuat(axis, angle) {
  const unit = normalize(axis);
  const half = angle / 2;
  const s = Math.sin(half);
  return { x: unit.x * s, y: unit.y * s, z: unit.z * s, w: Math.cos(half) };
}

function rotate(rotation, value) {
  const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
  const t = cross(qv, value);
  const doubled = scale(t, 2);
  return addVec3(value, addVec3(scale(doubled, rotation.w), cross(qv, doubled)));
}

function transformPoint(rotation, translation, point) {
  return addVec3(translation, rotate(rotation, point));
}

test("ANVIL-03 rejects treating the bearing seam itself as the nearby CUT", () => {
  const fixture = createRebindFixture();
  assert.throws(
    () => compileRebind({ ...fixture, cut: ["a:2", "b:0"] }),
    /CUT must be adjacent to the bearing/u,
  );
});

test("ANVIL-03 rebinds one persistent bearing onto a changed moving body decomposition", async () => {
  const fixture = createRebindFixture();
  const compilation = compileRebind(fixture);
  const before = compilation.before;
  const after = compilation.after;

  const beforeSource = [...fixture.bearing.matter.cells.map((cell) => cell.id)].sort();
  const afterSource = [...fixture.bearing.matter.cells.map((cell) => cell.id)].sort();
  assert.deepEqual(afterSource, beforeSource);
  assert.equal(beforeSource.length, 7);
  assert.equal(before.physicalPlan.bodies.length, 2);
  assert.equal(after.physicalPlan.bodies.length, 3);
  assert.equal(after.relation.sourceBearingId, before.relation.sourceBearingId);
  assert.deepEqual(after.relation.endpointA, before.relation.endpointA);
  assert.deepEqual(after.relation.endpointB, before.relation.endpointB);
  assert.notEqual(after.relation.bodyAId, before.relation.bodyAId, "fixture did not force the bearing endpoint onto a new runtime body");
  assert.equal(
    compilation.parentBodyByAfterBodyId[after.relation.bodyAId],
    before.relation.bodyAId,
    "rebound A endpoint did not resolve to its source parent",
  );
  assert.equal(
    compilation.parentBodyByAfterBodyId[after.relation.bodyBId],
    before.relation.bodyBId,
    "rebound B endpoint did not resolve to its source parent",
  );

  const bodyA = bodyById(before.physicalPlan, before.relation.bodyAId);
  const bodyB = bodyById(before.physicalPlan, before.relation.bodyBId);
  const omegaA = { x: 0, y: 0, z: -0.65 };
  const omegaB = { x: 0, y: 0, z: 0.95 };
  const commonDrift = { x: 0.8, y: -0.25, z: 0.35 };
  const initialMotion = {
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

  const beforeRuntime = await RebindPhysics.create(before, fixture.bearing.matter.materials, initialMotion, true);
  let beforeSnapshots;
  let beforeKinematics;
  let beforeMomentum;
  try {
    beforeRuntime.step(PRE_CUT_STEPS);
    beforeSnapshots = beforeRuntime.snapshots();
    beforeKinematics = beforeRuntime.bearingKinematics();
    beforeMomentum = momentum(beforeSnapshots);
    assert.equal(beforeSnapshots.length, 2);
    assert.ok(beforeKinematics.anchorGapM <= MAX_BEARING_GAP_M, `pre-CUT bearing gap ${beforeKinematics.anchorGapM}`);
    const beforeAngle = beforeRuntime.bearingAngleRad();
    assert.notEqual(beforeAngle, null);
    assert.ok(Math.abs(beforeAngle) >= 0.2, `pre-CUT fixture rotation too weak: ${beforeAngle}`);
  } finally {
    beforeRuntime.dispose();
  }

  const transferredMotion = transferRebindMotion(compilation, beforeSnapshots);
  const constrained = await RebindPhysics.create(after, fixture.bearing.matter.materials, transferredMotion, true);
  const control = await RebindPhysics.create(after, fixture.bearing.matter.materials, transferredMotion, false);

  try {
    const immediate = constrained.snapshots();
    const immediateKinematics = constrained.bearingKinematics();
    assert.equal(immediate.length, 3);
    assert.equal(constrained.receipt.relationCreated, true);
    assert.equal(control.receipt.relationCreated, false);

    const positionJumpA = assertVecNear(
      immediateKinematics.anchorAWorld,
      beforeKinematics.anchorAWorld,
      MAX_ANCHOR_JUMP_M,
      "bearing A anchor position",
    );
    const positionJumpB = assertVecNear(
      immediateKinematics.anchorBWorld,
      beforeKinematics.anchorBWorld,
      MAX_ANCHOR_JUMP_M,
      "bearing B anchor position",
    );
    const velocityJumpA = assertVecNear(
      immediateKinematics.anchorVelocityA,
      beforeKinematics.anchorVelocityA,
      MAX_ANCHOR_VELOCITY_JUMP_MPS,
      "bearing A material-point velocity",
    );
    const velocityJumpB = assertVecNear(
      immediateKinematics.anchorVelocityB,
      beforeKinematics.anchorVelocityB,
      MAX_ANCHOR_VELOCITY_JUMP_MPS,
      "bearing B material-point velocity",
    );
    assert.ok(immediateKinematics.anchorGapM <= MAX_BEARING_GAP_M, `immediate rebound gap ${immediateKinematics.anchorGapM}`);

    for (const child of after.physicalPlan.bodies) {
      const snapshot = snapshotById(immediate, child.id);
      const expected = transferredMotion[child.id];
      assert.ok(expected, `missing transferred motion ${child.id}`);
      assertVecNear(snapshot.position, expected.position, MAX_ANCHOR_JUMP_M, `${child.id} COM position`);
      assertVecNear(snapshot.linearVelocity, expected.linearVelocity, MAX_ANCHOR_VELOCITY_JUMP_MPS, `${child.id} COM velocity`);
      assertVecNear(snapshot.angularVelocity, expected.angularVelocity, MAX_ANCHOR_VELOCITY_JUMP_MPS, `${child.id} angular velocity`);
    }

    const immediateMomentum = momentum(immediate);
    const momentumError = assertVecNear(
      immediateMomentum,
      beforeMomentum,
      MAX_MOMENTUM_ERROR_KG_MPS,
      "total linear momentum",
    );

    constrained.step(1);
    control.step(1);
    const oneStep = constrained.snapshots();
    assert.equal(oneStep.length, 3);
    assert.ok(oneStep.every(finiteSnapshot), "non-finite one-step REBIND state");
    const oneStepGap = constrained.bearingKinematics().anchorGapM;
    assert.ok(oneStepGap <= MAX_BEARING_GAP_M, `one-step rebound gap ${oneStepGap}`);

    constrained.step(POST_CUT_STEPS - 1);
    control.step(POST_CUT_STEPS - 1);
    const finalKinematics = constrained.bearingKinematics();
    const controlKinematics = control.bearingKinematics();
    const finalAngle = constrained.bearingAngleRad();
    assert.notEqual(finalAngle, null);

    console.log(JSON.stringify({
      probe: "ANVIL-03/REBIND-C0",
      sourceCells: beforeSource.length,
      bodiesBefore: before.physicalPlan.bodies.length,
      bodiesAfter: after.physicalPlan.bodies.length,
      bearingBodyBefore: before.relation.bodyAId,
      bearingBodyAfter: after.relation.bodyAId,
      preCutGapM: beforeKinematics.anchorGapM,
      immediateGapM: immediateKinematics.anchorGapM,
      positionJumpA_M: positionJumpA,
      positionJumpB_M: positionJumpB,
      velocityJumpA_Mps: velocityJumpA,
      velocityJumpB_Mps: velocityJumpB,
      immediateMomentumErrorKgMps: momentumError,
      oneStepGapM: oneStepGap,
      finalGapM: finalKinematics.anchorGapM,
      noRelationControlGapM: controlKinematics.anchorGapM,
      finalBearingAngleRad: finalAngle,
    }));

    assert.ok(finalKinematics.anchorGapM <= MAX_BEARING_GAP_M, `final rebound gap ${finalKinematics.anchorGapM}`);
    assert.ok(controlKinematics.anchorGapM >= MIN_CONTROL_GAP_M, `control gap ${controlKinematics.anchorGapM} did not reach ${MIN_CONTROL_GAP_M}`);
    assert.ok(Math.abs(finalAngle) >= MIN_RELATIVE_ANGLE_RAD, `rebound angle ${finalAngle} did not reach ${MIN_RELATIVE_ANGLE_RAD}`);
  } finally {
    constrained.dispose();
    control.dispose();
  }
});

test("ANVIL-03 REBIND remains covariant under an arbitrary common rigid transform", async () => {
  const fixture = createRebindFixture();
  const compilation = compileRebind(fixture);
  const before = compilation.before;
  const after = compilation.after;
  const bodyA = bodyById(before.physicalPlan, before.relation.bodyAId);
  const bodyB = bodyById(before.physicalPlan, before.relation.bodyBId);

  const commonRotation = axisAngleQuat({ x: 0.37, y: -0.81, z: 0.44 }, 0.91);
  const commonTranslation = { x: 2.4, y: -1.3, z: 1.7 };
  const pivotWorld = transformPoint(commonRotation, commonTranslation, before.relation.pivotWorld);
  const bodyAWorld = transformPoint(commonRotation, commonTranslation, bodyA.centerOfMassWorld);
  const bodyBWorld = transformPoint(commonRotation, commonTranslation, bodyB.centerOfMassWorld);
  const axisWorld = normalize(rotate(commonRotation, { x: 0, y: 0, z: 1 }));
  const omegaA = scale(axisWorld, -0.65);
  const omegaB = scale(axisWorld, 0.95);
  const commonDrift = { x: 0.55, y: -0.35, z: 0.72 };
  const initialMotion = {
    [bodyA.id]: {
      position: bodyAWorld,
      rotation: { ...commonRotation },
      linearVelocity: addVec3(commonDrift, velocityForRotationAboutPivot(omegaA, bodyAWorld, pivotWorld)),
      angularVelocity: omegaA,
    },
    [bodyB.id]: {
      position: bodyBWorld,
      rotation: { ...commonRotation },
      linearVelocity: addVec3(commonDrift, velocityForRotationAboutPivot(omegaB, bodyBWorld, pivotWorld)),
      angularVelocity: omegaB,
    },
  };

  const beforeRuntime = await RebindPhysics.create(before, fixture.bearing.matter.materials, initialMotion, true);
  let beforeSnapshots;
  let beforeKinematics;
  let beforeMomentum;
  try {
    beforeRuntime.step(PRE_CUT_STEPS);
    beforeSnapshots = beforeRuntime.snapshots();
    beforeKinematics = beforeRuntime.bearingKinematics();
    beforeMomentum = momentum(beforeSnapshots);
    assert.equal(beforeSnapshots.length, 2);
    assert.ok(beforeKinematics.anchorGapM <= MAX_BEARING_GAP_M, `C1 pre-CUT bearing gap ${beforeKinematics.anchorGapM}`);
    const beforeAngle = beforeRuntime.bearingAngleRad();
    assert.notEqual(beforeAngle, null);
    assert.ok(Math.abs(beforeAngle) >= 0.2, `C1 pre-CUT fixture rotation too weak: ${beforeAngle}`);
  } finally {
    beforeRuntime.dispose();
  }

  const transferredMotion = transferRebindMotion(compilation, beforeSnapshots);
  const constrained = await RebindPhysics.create(after, fixture.bearing.matter.materials, transferredMotion, true);
  const control = await RebindPhysics.create(after, fixture.bearing.matter.materials, transferredMotion, false);

  try {
    const immediate = constrained.snapshots();
    const immediateKinematics = constrained.bearingKinematics();
    assert.equal(immediate.length, 3);
    assert.equal(constrained.receipt.relationCreated, true);
    assert.equal(control.receipt.relationCreated, false);

    const positionJumpA = assertVecNear(
      immediateKinematics.anchorAWorld,
      beforeKinematics.anchorAWorld,
      MAX_ANCHOR_JUMP_M,
      "C1 bearing A anchor position",
    );
    const positionJumpB = assertVecNear(
      immediateKinematics.anchorBWorld,
      beforeKinematics.anchorBWorld,
      MAX_ANCHOR_JUMP_M,
      "C1 bearing B anchor position",
    );
    const velocityJumpA = assertVecNear(
      immediateKinematics.anchorVelocityA,
      beforeKinematics.anchorVelocityA,
      MAX_ANCHOR_VELOCITY_JUMP_MPS,
      "C1 bearing A material-point velocity",
    );
    const velocityJumpB = assertVecNear(
      immediateKinematics.anchorVelocityB,
      beforeKinematics.anchorVelocityB,
      MAX_ANCHOR_VELOCITY_JUMP_MPS,
      "C1 bearing B material-point velocity",
    );
    assert.ok(immediateKinematics.anchorGapM <= MAX_BEARING_GAP_M, `C1 immediate rebound gap ${immediateKinematics.anchorGapM}`);

    const momentumError = assertVecNear(
      momentum(immediate),
      beforeMomentum,
      MAX_MOMENTUM_ERROR_KG_MPS,
      "C1 total linear momentum",
    );

    constrained.step(1);
    control.step(1);
    const oneStep = constrained.snapshots();
    assert.equal(oneStep.length, 3);
    assert.ok(oneStep.every(finiteSnapshot), "non-finite C1 one-step REBIND state");
    const oneStepGap = constrained.bearingKinematics().anchorGapM;
    assert.ok(oneStepGap <= MAX_BEARING_GAP_M, `C1 one-step rebound gap ${oneStepGap}`);

    constrained.step(POST_CUT_STEPS - 1);
    control.step(POST_CUT_STEPS - 1);
    const finalKinematics = constrained.bearingKinematics();
    const controlKinematics = control.bearingKinematics();
    const finalAngle = constrained.bearingAngleRad();
    assert.notEqual(finalAngle, null);

    console.log(JSON.stringify({
      probe: "ANVIL-03/REBIND-C1",
      commonRotation,
      commonTranslation,
      transformedAxisWorld: axisWorld,
      preCutGapM: beforeKinematics.anchorGapM,
      immediateGapM: immediateKinematics.anchorGapM,
      positionJumpA_M: positionJumpA,
      positionJumpB_M: positionJumpB,
      velocityJumpA_Mps: velocityJumpA,
      velocityJumpB_Mps: velocityJumpB,
      immediateMomentumErrorKgMps: momentumError,
      oneStepGapM: oneStepGap,
      finalGapM: finalKinematics.anchorGapM,
      noRelationControlGapM: controlKinematics.anchorGapM,
      finalBearingAngleRad: finalAngle,
    }));

    assert.ok(finalKinematics.anchorGapM <= MAX_BEARING_GAP_M, `C1 final rebound gap ${finalKinematics.anchorGapM}`);
    assert.ok(controlKinematics.anchorGapM >= MIN_CONTROL_GAP_M, `C1 control gap ${controlKinematics.anchorGapM} did not reach ${MIN_CONTROL_GAP_M}`);
    assert.ok(Math.abs(finalAngle) >= MIN_RELATIVE_ANGLE_RAD, `C1 rebound angle ${finalAngle} did not reach ${MIN_RELATIVE_ANGLE_RAD}`);
  } finally {
    constrained.dispose();
    control.dispose();
  }
});
