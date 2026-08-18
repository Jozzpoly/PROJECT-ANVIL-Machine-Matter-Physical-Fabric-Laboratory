import test from "node:test";
import assert from "node:assert/strict";
import {
  magnitudeVec3,
  subtractVec3,
} from "../.test-build/src/foundation/spatial.js";
import { transferRebindMotion } from "../.test-build/src/experiments/anvil-03-rebind.js";
import {
  LOAD_REBIND_FORCE_N,
  LoadedRebindPhysics,
  compileLoadedRebind,
  createLoadedRebindFixture,
  createLoadedRebindInitialMotion,
} from "../.test-build/src/experiments/anvil-04-loaded-rebind.js";

const PRELOAD_STEPS = 120;
const POST_STEPS = 60;
const MAX_SETTLED_LINEAR_SPEED_MPS = 0.001;
const MAX_SETTLED_ANGULAR_SPEED_RADPS = 0.001;
const MIN_PRELOAD_FORCE_N = 2000;
const MAX_PRELOAD_FORCE_N = 3000;
const MAX_PRE_CUT_GAP_M = 0.0025;
const MAX_IMMEDIATE_POSITION_JUMP_M = 0.00007;
const MAX_IMMEDIATE_VELOCITY_JUMP_MPS = 0.00007;
const MAX_FIRST_STEP_GAP_M = 0.0005;
const MAX_FIRST_STEP_ANCHOR_VELOCITY_GAP_MPS = 0.02;
const MAX_FIRST_STEP_BODY_SPEED_MPS = 0.1;
const MIN_FIRST_STEP_FORCE_N = 1500;
const MAX_FIRST_STEP_FORCE_N = 3500;
const MAX_FINAL_GAP_M = 0.0025;
const MIN_CONTROL_GAP_M = 1.0;

function maxSpeed(snapshots) {
  return Math.max(...snapshots.map((snapshot) => magnitudeVec3(snapshot.linearVelocity)));
}

function maxAngularSpeed(snapshots) {
  return Math.max(...snapshots.map((snapshot) => magnitudeVec3(snapshot.angularVelocity)));
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

function assertVecNear(actual, expected, tolerance, label) {
  const error = magnitudeVec3(subtractVec3(actual, expected));
  assert.ok(error <= tolerance, `${label} error ${error} exceeds ${tolerance}`);
  return error;
}

test("ANVIL-04 cold rebind carries a sustained 2.5 kN bearing preload without first-step shock", async () => {
  const fixture = createLoadedRebindFixture();
  const compilation = compileLoadedRebind(fixture);
  const before = compilation.before;
  const after = compilation.after;

  const sourceBefore = [...fixture.bearing.matter.cells.map((cell) => cell.id)].sort();
  const sourceAfter = [...fixture.bearing.matter.cells.map((cell) => cell.id)].sort();
  assert.deepEqual(sourceAfter, sourceBefore);
  assert.equal(sourceBefore.length, 7);
  assert.equal(before.physicalPlan.bodies.length, 2);
  assert.equal(after.physicalPlan.bodies.length, 3);
  assert.equal(before.relation.sourceBearingId, after.relation.sourceBearingId);
  assert.deepEqual(before.relation.endpointA, after.relation.endpointA);
  assert.deepEqual(before.relation.endpointB, after.relation.endpointB);
  assert.notEqual(after.relation.bodyAId, before.relation.bodyAId, "fixture did not force the A endpoint onto a new runtime body");
  assert.equal(after.physicalPlan.cellToBody[after.relation.endpointA.cellId], after.relation.bodyAId);
  assert.equal(after.physicalPlan.cellToBody[after.relation.endpointB.cellId], after.relation.bodyBId);

  const initialMotion = createLoadedRebindInitialMotion(before);
  const beforeRuntime = await LoadedRebindPhysics.create(
    before,
    fixture.bearing.matter.materials,
    initialMotion,
    true,
  );

  let beforeSnapshots;
  let beforeKinematics;
  let preloadForceN;
  try {
    beforeRuntime.stepLoaded(LOAD_REBIND_FORCE_N, PRELOAD_STEPS);
    beforeSnapshots = beforeRuntime.snapshots();
    beforeKinematics = beforeRuntime.bearingKinematics();
    preloadForceN = beforeRuntime.constraintForceMagnitudeN();
    assert.notEqual(preloadForceN, null);
    assert.ok(preloadForceN >= MIN_PRELOAD_FORCE_N, `preload force ${preloadForceN} below ${MIN_PRELOAD_FORCE_N}`);
    assert.ok(preloadForceN <= MAX_PRELOAD_FORCE_N, `preload force ${preloadForceN} above ${MAX_PRELOAD_FORCE_N}`);
    assert.ok(maxSpeed(beforeSnapshots) <= MAX_SETTLED_LINEAR_SPEED_MPS, `preload state still translating at ${maxSpeed(beforeSnapshots)}`);
    assert.ok(maxAngularSpeed(beforeSnapshots) <= MAX_SETTLED_ANGULAR_SPEED_RADPS, `preload state still rotating at ${maxAngularSpeed(beforeSnapshots)}`);
    assert.ok(beforeKinematics.anchorGapM <= MAX_PRE_CUT_GAP_M, `preload bearing gap ${beforeKinematics.anchorGapM}`);
    assert.ok(beforeSnapshots.every(finiteSnapshot), "non-finite pre-CUT loaded state");
  } finally {
    beforeRuntime.dispose();
  }

  const transferredMotion = transferRebindMotion(compilation, beforeSnapshots);
  const constrained = await LoadedRebindPhysics.create(
    after,
    fixture.bearing.matter.materials,
    transferredMotion,
    true,
  );
  const control = await LoadedRebindPhysics.create(
    after,
    fixture.bearing.matter.materials,
    transferredMotion,
    false,
  );

  try {
    assert.equal(constrained.receipt.relationCreated, true);
    assert.equal(control.receipt.relationCreated, false);

    const immediate = constrained.snapshots();
    const immediateKinematics = constrained.bearingKinematics();
    const positionJumpA = assertVecNear(
      immediateKinematics.anchorAWorld,
      beforeKinematics.anchorAWorld,
      MAX_IMMEDIATE_POSITION_JUMP_M,
      "loaded rebind anchor A position",
    );
    const positionJumpB = assertVecNear(
      immediateKinematics.anchorBWorld,
      beforeKinematics.anchorBWorld,
      MAX_IMMEDIATE_POSITION_JUMP_M,
      "loaded rebind anchor B position",
    );
    const velocityJumpA = assertVecNear(
      immediateKinematics.anchorVelocityA,
      beforeKinematics.anchorVelocityA,
      MAX_IMMEDIATE_VELOCITY_JUMP_MPS,
      "loaded rebind anchor A velocity",
    );
    const velocityJumpB = assertVecNear(
      immediateKinematics.anchorVelocityB,
      beforeKinematics.anchorVelocityB,
      MAX_IMMEDIATE_VELOCITY_JUMP_MPS,
      "loaded rebind anchor B velocity",
    );
    assert.ok(immediate.every(finiteSnapshot), "non-finite immediate loaded REBIND state");

    constrained.stepLoaded(LOAD_REBIND_FORCE_N, 1);
    control.stepLoaded(LOAD_REBIND_FORCE_N, 1);

    const firstStep = constrained.snapshots();
    const firstStepKinematics = constrained.bearingKinematics();
    const firstStepForceN = constrained.constraintForceMagnitudeN();
    assert.notEqual(firstStepForceN, null);
    const firstStepMaxSpeed = maxSpeed(firstStep);
    assert.ok(firstStepKinematics.anchorGapM <= MAX_FIRST_STEP_GAP_M, `first-step anchor gap ${firstStepKinematics.anchorGapM}`);
    assert.ok(
      firstStepKinematics.anchorVelocityGapMps <= MAX_FIRST_STEP_ANCHOR_VELOCITY_GAP_MPS,
      `first-step anchor velocity gap ${firstStepKinematics.anchorVelocityGapMps}`,
    );
    assert.ok(firstStepMaxSpeed <= MAX_FIRST_STEP_BODY_SPEED_MPS, `first-step max body speed ${firstStepMaxSpeed}`);
    assert.ok(firstStepForceN >= MIN_FIRST_STEP_FORCE_N, `first-step constraint force ${firstStepForceN} below ${MIN_FIRST_STEP_FORCE_N}`);
    assert.ok(firstStepForceN <= MAX_FIRST_STEP_FORCE_N, `first-step constraint force ${firstStepForceN} above ${MAX_FIRST_STEP_FORCE_N}`);
    assert.ok(firstStep.every(finiteSnapshot), "non-finite first-step loaded REBIND state");

    constrained.stepLoaded(LOAD_REBIND_FORCE_N, POST_STEPS - 1);
    control.stepLoaded(LOAD_REBIND_FORCE_N, POST_STEPS - 1);
    const finalKinematics = constrained.bearingKinematics();
    const controlKinematics = control.bearingKinematics();
    const finalSnapshots = constrained.snapshots();
    const controlSnapshots = control.snapshots();

    console.log(JSON.stringify({
      probe: "ANVIL-04/LOAD-REBIND-C0",
      loadN: LOAD_REBIND_FORCE_N,
      sourceCells: sourceBefore.length,
      bodiesBefore: before.physicalPlan.bodies.length,
      bodiesAfter: after.physicalPlan.bodies.length,
      bearingBodyBefore: before.relation.bodyAId,
      bearingBodyAfter: after.relation.bodyAId,
      preloadConstraintForceN: preloadForceN,
      preloadGapM: beforeKinematics.anchorGapM,
      preloadMaxLinearSpeedMps: maxSpeed(beforeSnapshots),
      preloadMaxAngularSpeedRadps: maxAngularSpeed(beforeSnapshots),
      immediateGapM: immediateKinematics.anchorGapM,
      positionJumpA_M: positionJumpA,
      positionJumpB_M: positionJumpB,
      velocityJumpA_Mps: velocityJumpA,
      velocityJumpB_Mps: velocityJumpB,
      firstStepGapM: firstStepKinematics.anchorGapM,
      firstStepAnchorVelocityGapMps: firstStepKinematics.anchorVelocityGapMps,
      firstStepMaxBodySpeedMps: firstStepMaxSpeed,
      firstStepConstraintForceN: firstStepForceN,
      finalGapM: finalKinematics.anchorGapM,
      noRelationControlGapM: controlKinematics.anchorGapM,
    }));

    assert.ok(finalKinematics.anchorGapM <= MAX_FINAL_GAP_M, `final loaded bearing gap ${finalKinematics.anchorGapM}`);
    assert.ok(controlKinematics.anchorGapM >= MIN_CONTROL_GAP_M, `no-bearing control gap ${controlKinematics.anchorGapM} below ${MIN_CONTROL_GAP_M}`);
    assert.ok(finalSnapshots.every(finiteSnapshot), "non-finite final loaded REBIND state");
    assert.ok(controlSnapshots.every(finiteSnapshot), "non-finite no-bearing control state");
  } finally {
    constrained.dispose();
    control.dispose();
  }
});
