import test from "node:test";
import assert from "node:assert/strict";
import {
  addVec3,
  magnitudeVec3,
  subtractVec3,
} from "../.test-build/src/foundation/spatial.js";
import { velocityForRotationAboutPivot } from "../.test-build/src/experiments/anvil-02-bearing.js";
import { transferRebindMotion } from "../.test-build/src/experiments/anvil-03-rebind.js";
import {
  LOAD_REBIND_FORCE_N,
  LoadedRebindPhysics,
  compileLoadedRebind,
  createLoadedRebindFixture,
} from "../.test-build/src/experiments/anvil-04-loaded-rebind.js";

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

function relativeAngularSpeedZ(snapshots, relation) {
  const a = snapshotById(snapshots, relation.bodyAId);
  const b = snapshotById(snapshots, relation.bodyBId);
  return Math.abs(b.angularVelocity.z - a.angularVelocity.z);
}

test("ANVIL-04 cold rebind preserves a moving bearing while it carries the same 2.5 kN preload", async () => {
  const fixture = createLoadedRebindFixture();
  const compilation = compileLoadedRebind(fixture);
  const before = compilation.before;
  const after = compilation.after;

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

  const beforeRuntime = await LoadedRebindPhysics.create(
    before,
    fixture.bearing.matter.materials,
    initialMotion,
    true,
  );

  let beforeSnapshots;
  let beforeKinematics;
  let preloadForceN;
  let preloadRelativeAngularSpeedRadps;
  try {
    beforeRuntime.stepLoaded(LOAD_REBIND_FORCE_N, PRELOAD_STEPS);
    beforeSnapshots = beforeRuntime.snapshots();
    beforeKinematics = beforeRuntime.bearingKinematics();
    preloadForceN = beforeRuntime.constraintForceMagnitudeN();
    preloadRelativeAngularSpeedRadps = relativeAngularSpeedZ(beforeSnapshots, before.relation);

    assert.notEqual(preloadForceN, null);
    assert.ok(preloadForceN >= MIN_PRELOAD_FORCE_N, `moving preload force ${preloadForceN} below ${MIN_PRELOAD_FORCE_N}`);
    assert.ok(preloadForceN <= MAX_PRELOAD_FORCE_N, `moving preload force ${preloadForceN} above ${MAX_PRELOAD_FORCE_N}`);
    assert.ok(beforeKinematics.anchorGapM <= MAX_PRE_CUT_GAP_M, `moving preload bearing gap ${beforeKinematics.anchorGapM}`);
    assert.ok(
      preloadRelativeAngularSpeedRadps >= MIN_PRE_CUT_RELATIVE_ANGULAR_SPEED_RADPS,
      `moving preload relative angular speed ${preloadRelativeAngularSpeedRadps} below ${MIN_PRE_CUT_RELATIVE_ANGULAR_SPEED_RADPS}`,
    );
    assert.ok(beforeSnapshots.every(finiteSnapshot), "non-finite moving pre-CUT loaded state");
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
    const immediateSnapshots = constrained.snapshots();
    const immediateKinematics = constrained.bearingKinematics();
    const positionJumpA = assertVecNear(
      immediateKinematics.anchorAWorld,
      beforeKinematics.anchorAWorld,
      MAX_IMMEDIATE_POSITION_JUMP_M,
      "moving loaded anchor A position",
    );
    const positionJumpB = assertVecNear(
      immediateKinematics.anchorBWorld,
      beforeKinematics.anchorBWorld,
      MAX_IMMEDIATE_POSITION_JUMP_M,
      "moving loaded anchor B position",
    );
    const velocityJumpA = assertVecNear(
      immediateKinematics.anchorVelocityA,
      beforeKinematics.anchorVelocityA,
      MAX_IMMEDIATE_VELOCITY_JUMP_MPS,
      "moving loaded anchor A velocity",
    );
    const velocityJumpB = assertVecNear(
      immediateKinematics.anchorVelocityB,
      beforeKinematics.anchorVelocityB,
      MAX_IMMEDIATE_VELOCITY_JUMP_MPS,
      "moving loaded anchor B velocity",
    );
    assert.ok(immediateSnapshots.every(finiteSnapshot), "non-finite moving immediate loaded state");

    constrained.stepLoaded(LOAD_REBIND_FORCE_N, 1);
    control.stepLoaded(LOAD_REBIND_FORCE_N, 1);
    const firstStepSnapshots = constrained.snapshots();
    const firstStepKinematics = constrained.bearingKinematics();
    const firstStepForceN = constrained.constraintForceMagnitudeN();
    assert.notEqual(firstStepForceN, null);

    assert.ok(firstStepKinematics.anchorGapM <= MAX_FIRST_STEP_GAP_M, `moving first-step anchor gap ${firstStepKinematics.anchorGapM}`);
    assert.ok(
      firstStepKinematics.anchorVelocityGapMps <= MAX_FIRST_STEP_ANCHOR_VELOCITY_GAP_MPS,
      `moving first-step anchor velocity gap ${firstStepKinematics.anchorVelocityGapMps}`,
    );
    assert.ok(firstStepForceN >= MIN_FIRST_STEP_FORCE_N, `moving first-step constraint force ${firstStepForceN} below ${MIN_FIRST_STEP_FORCE_N}`);
    assert.ok(firstStepForceN <= MAX_FIRST_STEP_FORCE_N, `moving first-step constraint force ${firstStepForceN} above ${MAX_FIRST_STEP_FORCE_N}`);
    assert.ok(firstStepSnapshots.every(finiteSnapshot), "non-finite moving first-step loaded state");

    constrained.stepLoaded(LOAD_REBIND_FORCE_N, POST_STEPS - 1);
    control.stepLoaded(LOAD_REBIND_FORCE_N, POST_STEPS - 1);
    const finalSnapshots = constrained.snapshots();
    const controlSnapshots = control.snapshots();
    const finalKinematics = constrained.bearingKinematics();
    const controlKinematics = control.bearingKinematics();
    const finalRelativeAngularSpeedRadps = relativeAngularSpeedZ(finalSnapshots, after.relation);

    console.log(JSON.stringify({
      probe: "ANVIL-04/LOAD-REBIND-C1",
      loadN: LOAD_REBIND_FORCE_N,
      bearingBodyBefore: before.relation.bodyAId,
      bearingBodyAfter: after.relation.bodyAId,
      preloadConstraintForceN: preloadForceN,
      preloadGapM: beforeKinematics.anchorGapM,
      preloadRelativeAngularSpeedRadps,
      immediateGapM: immediateKinematics.anchorGapM,
      positionJumpA_M: positionJumpA,
      positionJumpB_M: positionJumpB,
      velocityJumpA_Mps: velocityJumpA,
      velocityJumpB_Mps: velocityJumpB,
      firstStepGapM: firstStepKinematics.anchorGapM,
      firstStepAnchorVelocityGapMps: firstStepKinematics.anchorVelocityGapMps,
      firstStepConstraintForceN: firstStepForceN,
      finalGapM: finalKinematics.anchorGapM,
      finalRelativeAngularSpeedRadps,
      noRelationControlGapM: controlKinematics.anchorGapM,
    }));

    assert.ok(finalKinematics.anchorGapM <= MAX_FINAL_GAP_M, `moving final loaded bearing gap ${finalKinematics.anchorGapM}`);
    assert.ok(controlKinematics.anchorGapM >= MIN_CONTROL_GAP_M, `moving no-bearing control gap ${controlKinematics.anchorGapM} below ${MIN_CONTROL_GAP_M}`);
    assert.ok(
      finalRelativeAngularSpeedRadps >= MIN_FINAL_RELATIVE_ANGULAR_SPEED_RADPS,
      `moving final relative angular speed ${finalRelativeAngularSpeedRadps} below ${MIN_FINAL_RELATIVE_ANGULAR_SPEED_RADPS}`,
    );
    assert.ok(finalSnapshots.every(finiteSnapshot), "non-finite moving final loaded state");
    assert.ok(controlSnapshots.every(finiteSnapshot), "non-finite moving no-bearing control state");
  } finally {
    constrained.dispose();
    control.dispose();
  }
});
