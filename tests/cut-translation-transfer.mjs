import test from "node:test";
import assert from "node:assert/strict";
import { compileMatter } from "../.test-build/src/compiler.js";
import { createCollapseFixture } from "../.test-build/src/fixture.js";
import { CollapsePhysics } from "../.test-build/src/physics.js";
import { totalLinearMomentum } from "../.test-build/src/foundation/continuity.js";

const ZERO = { x: 0, y: 0, z: 0 };
const IDENTITY = { x: 0, y: 0, z: 0, w: 1 };
const CUT_CONNECTION = ["cell:-1:0:0", "cell:0:0:0"];
const POSITION_EPS_M = 5e-5;
const VELOCITY_EPS_MPS = 5e-6;
const ANGULAR_EPS_RADPS = 5e-6;
const MASS_EPS_KG = 0.1;
const MOMENTUM_EPS_KG_MPS = 0.5;
const POST_STEP_MOMENTUM_EPS_KG_MPS = 1.0;

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function magnitude(v) {
  return Math.hypot(v.x, v.y, v.z);
}

function assertVecNear(actual, expected, tolerance, label) {
  const delta = magnitude(subtract(actual, expected));
  assert.ok(delta <= tolerance, `${label} error ${delta} exceeds ${tolerance}`);
}

function motionFromSnapshot(snapshot) {
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

function momentumOf(snapshots) {
  return totalLinearMomentum(
    snapshots.map((snapshot) => ({
      massKg: snapshot.massKg,
      linearVelocity: snapshot.linearVelocity,
    })),
  );
}

test("CUT translation transfer reconstructs a moving 1-body runtime as 2 bodies without an impulse", async () => {
  const document = createCollapseFixture(false);
  const beforePlan = compileMatter(document);
  const afterPlan = compileMatter(
    { ...document, revision: "anvil-01-cut/translation-split" },
    { blockedFaceConnections: [CUT_CONNECTION] },
  );

  assert.equal(beforePlan.bodies.length, 1);
  assert.equal(afterPlan.bodies.length, 2);
  const parentPlan = beforePlan.bodies[0];
  assert.ok(parentPlan);

  const parentInitialMotion = {
    position: { x: 4.25, y: 6.5, z: -2.75 },
    rotation: IDENTITY,
    linearVelocity: { x: 2.4, y: -0.35, z: 1.15 },
    angularVelocity: ZERO,
  };

  const beforeRuntime = await CollapsePhysics.create(beforePlan, document.materials, {
    gravity: ZERO,
    includeGround: false,
    initialMotionByPlanBodyId: {
      [parentPlan.id]: parentInitialMotion,
    },
  });

  let parentSnapshot;
  try {
    beforeRuntime.step(23);
    const snapshots = beforeRuntime.snapshots();
    assert.equal(snapshots.length, 1);
    parentSnapshot = snapshots[0];
    assert.ok(parentSnapshot);
    assertVecNear(
      parentSnapshot.linearVelocity,
      parentInitialMotion.linearVelocity,
      VELOCITY_EPS_MPS,
      "pre-CUT parent linear velocity",
    );
    assertVecNear(
      parentSnapshot.angularVelocity,
      ZERO,
      ANGULAR_EPS_RADPS,
      "pre-CUT parent angular velocity",
    );
  } finally {
    beforeRuntime.dispose();
  }

  const initialMotionByPlanBodyId = {};
  for (const child of afterPlan.bodies) {
    const authoredComOffset = subtract(child.centerOfMassWorld, parentPlan.centerOfMassWorld);
    initialMotionByPlanBodyId[child.id] = {
      position: add(parentSnapshot.position, authoredComOffset),
      rotation: {
        x: parentSnapshot.rotation.x,
        y: parentSnapshot.rotation.y,
        z: parentSnapshot.rotation.z,
        w: parentSnapshot.rotation.w,
      },
      linearVelocity: { ...parentSnapshot.linearVelocity },
      angularVelocity: { ...parentSnapshot.angularVelocity },
    };
  }

  const afterRuntime = await CollapsePhysics.create(afterPlan, document.materials, {
    gravity: ZERO,
    includeGround: false,
    initialMotionByPlanBodyId,
  });

  try {
    const immediate = afterRuntime.snapshots();
    assert.equal(immediate.length, 2);

    for (const child of afterPlan.bodies) {
      const snapshot = immediate.find((value) => value.planBodyId === child.id);
      assert.ok(snapshot, `missing runtime child ${child.id}`);
      const expected = initialMotionByPlanBodyId[child.id];
      assert.ok(expected);
      assertVecNear(snapshot.position, expected.position, POSITION_EPS_M, `${child.id} position`);
      assertVecNear(
        snapshot.linearVelocity,
        expected.linearVelocity,
        VELOCITY_EPS_MPS,
        `${child.id} linear velocity`,
      );
      assertVecNear(
        snapshot.angularVelocity,
        expected.angularVelocity,
        ANGULAR_EPS_RADPS,
        `${child.id} angular velocity`,
      );
    }

    const parentMass = parentSnapshot.massKg;
    const childMass = immediate.reduce((sum, snapshot) => sum + snapshot.massKg, 0);
    assert.ok(
      Math.abs(childMass - parentMass) <= MASS_EPS_KG,
      `runtime mass changed ${parentMass} -> ${childMass}`,
    );

    const parentMomentum = momentumOf([parentSnapshot]);
    const immediateMomentum = momentumOf(immediate);
    assertVecNear(
      immediateMomentum,
      parentMomentum,
      MOMENTUM_EPS_KG_MPS,
      "immediate linear momentum",
    );

    afterRuntime.step(1);
    const afterStep = afterRuntime.snapshots();
    assert.equal(afterStep.length, 2);
    for (const snapshot of afterStep) {
      const motion = motionFromSnapshot(snapshot);
      for (const value of [
        motion.position.x,
        motion.position.y,
        motion.position.z,
        motion.linearVelocity.x,
        motion.linearVelocity.y,
        motion.linearVelocity.z,
        motion.angularVelocity.x,
        motion.angularVelocity.y,
        motion.angularVelocity.z,
      ]) {
        assert.ok(Number.isFinite(value), `non-finite post-step state in ${snapshot.planBodyId}`);
      }
    }
    assertVecNear(
      momentumOf(afterStep),
      parentMomentum,
      POST_STEP_MOMENTUM_EPS_KG_MPS,
      "post-step linear momentum",
    );
  } finally {
    afterRuntime.dispose();
  }
});
