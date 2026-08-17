import test from "node:test";
import assert from "node:assert/strict";
import { compileMatter } from "../.test-build/src/compiler.js";
import { createCollapseFixture } from "../.test-build/src/fixture.js";
import { CollapsePhysics } from "../.test-build/src/physics.js";
import {
  rigidVelocityAtWorldPoint,
  totalLinearMomentum,
  translationalKineticEnergyJ,
} from "../.test-build/src/foundation/continuity.js";

const ZERO = { x: 0, y: 0, z: 0 };
const CUT_CONNECTION = ["cell:-1:0:0", "cell:0:0:0"];
const POSITION_EPS_M = 7e-5;
const VELOCITY_EPS_MPS = 2e-5;
const ANGULAR_EPS_RADPS = 2e-5;
const QUAT_ALIGNMENT_EPS = 2e-7;
const MASS_EPS_KG = 0.1;
const MOMENTUM_EPS_KG_MPS = 0.75;
const POST_STEP_MOMENTUM_EPS_KG_MPS = 1.5;
const INTERFACE_VELOCITY_EPS_MPS = 5e-5;
const MIN_ROTATED_OFFSET_EFFECT_M = 0.05;
const MIN_RIGID_FIELD_EFFECT_MPS = 0.05;

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function magnitude(v) {
  return Math.hypot(v.x, v.y, v.z);
}

function assertVecNear(actual, expected, tolerance, label) {
  const delta = magnitude(subtract(actual, expected));
  assert.ok(delta <= tolerance, `${label} error ${delta} exceeds ${tolerance}`);
}

function axisAngleQuat(axis, angle) {
  const length = magnitude(axis);
  assert.ok(length > 0);
  const half = angle / 2;
  const scale = Math.sin(half) / length;
  return {
    x: axis.x * scale,
    y: axis.y * scale,
    z: axis.z * scale,
    w: Math.cos(half),
  };
}

function quatDot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
}

function assertQuatEquivalent(actual, expected, tolerance, label) {
  const actualLength = Math.hypot(actual.x, actual.y, actual.z, actual.w);
  assert.ok(Math.abs(actualLength - 1) <= 3e-6, `${label} quaternion length ${actualLength}`);
  const alignment = Math.abs(quatDot(actual, expected));
  assert.ok(1 - alignment <= tolerance, `${label} orientation mismatch ${1 - alignment}`);
}

function rotateVec3ByQuat(rotation, value) {
  const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
  const t = cross(qv, value);
  const doubled = { x: 2 * t.x, y: 2 * t.y, z: 2 * t.z };
  return add(value, add(
    { x: rotation.w * doubled.x, y: rotation.w * doubled.y, z: rotation.w * doubled.z },
    cross(qv, doubled),
  ));
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

function translationalEnergyOf(snapshots) {
  return snapshots.reduce(
    (sum, snapshot) =>
      sum +
      translationalKineticEnergyJ({
        massKg: snapshot.massKg,
        linearVelocity: snapshot.linearVelocity,
      }),
    0,
  );
}

test("CUT rotation transfer preserves the instantaneous rigid velocity field across a mass-preserving split", async () => {
  const document = createCollapseFixture(false);
  const beforePlan = compileMatter(document);
  const afterPlan = compileMatter(
    { ...document, revision: "anvil-01-cut/rotation-split" },
    { blockedFaceConnections: [CUT_CONNECTION] },
  );

  assert.equal(beforePlan.bodies.length, 1);
  assert.equal(afterPlan.bodies.length, 2);
  const parentPlan = beforePlan.bodies[0];
  assert.ok(parentPlan);

  const parentInitialMotion = {
    position: { x: 3.75, y: 5.4, z: -2.1 },
    rotation: axisAngleQuat({ x: 1, y: -2, z: 0.75 }, 0.71),
    linearVelocity: { x: 1.7, y: -0.45, z: 0.9 },
    angularVelocity: { x: 0.42, y: 0.95, z: -0.61 },
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
    beforeRuntime.step(19);
    const snapshots = beforeRuntime.snapshots();
    assert.equal(snapshots.length, 1);
    parentSnapshot = snapshots[0];
    assert.ok(parentSnapshot);
    assert.ok(
      magnitude(parentSnapshot.angularVelocity) > 0.2,
      `parent angular velocity became trivial: ${magnitude(parentSnapshot.angularVelocity)}`,
    );
  } finally {
    beforeRuntime.dispose();
  }

  const parentMotion = motionFromSnapshot(parentSnapshot);
  const initialMotionByPlanBodyId = {};
  let maxRotatedOffsetEffect = 0;
  let maxRigidFieldEffect = 0;

  for (const child of afterPlan.bodies) {
    const authoredComOffset = subtract(child.centerOfMassWorld, parentPlan.centerOfMassWorld);
    const worldComOffset = rotateVec3ByQuat(parentMotion.rotation, authoredComOffset);
    const childWorldCom = add(parentMotion.position, worldComOffset);
    const childLinearVelocity = rigidVelocityAtWorldPoint(parentMotion, childWorldCom);

    maxRotatedOffsetEffect = Math.max(
      maxRotatedOffsetEffect,
      magnitude(subtract(worldComOffset, authoredComOffset)),
    );
    maxRigidFieldEffect = Math.max(
      maxRigidFieldEffect,
      magnitude(subtract(childLinearVelocity, parentMotion.linearVelocity)),
    );

    initialMotionByPlanBodyId[child.id] = {
      position: childWorldCom,
      rotation: { ...parentMotion.rotation },
      linearVelocity: childLinearVelocity,
      angularVelocity: { ...parentMotion.angularVelocity },
    };
  }

  assert.ok(
    maxRotatedOffsetEffect >= MIN_ROTATED_OFFSET_EFFECT_M,
    `rotation fixture is too weak: rotated-offset effect ${maxRotatedOffsetEffect} m`,
  );
  assert.ok(
    maxRigidFieldEffect >= MIN_RIGID_FIELD_EFFECT_MPS,
    `rotation fixture is too weak: rigid-field velocity effect ${maxRigidFieldEffect} m/s`,
  );

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
      assertQuatEquivalent(
        snapshot.rotation,
        expected.rotation,
        QUAT_ALIGNMENT_EPS,
        `${child.id} rotation`,
      );
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
      "immediate total linear momentum",
    );

    // The blocked adjacency lies at x=0, inside the authored bridge cell face.
    // This point belongs to the common interface of the two replacement bodies.
    const interfacePointAuthored = {
      x: 0,
      y: document.cellSizeM / 2,
      z: document.cellSizeM / 2,
    };
    const interfaceLocalOffset = subtract(interfacePointAuthored, parentPlan.centerOfMassWorld);
    const interfaceWorld = add(
      parentMotion.position,
      rotateVec3ByQuat(parentMotion.rotation, interfaceLocalOffset),
    );
    const parentInterfaceVelocity = rigidVelocityAtWorldPoint(parentMotion, interfaceWorld);

    const childInterfaceVelocities = immediate.map((snapshot) =>
      rigidVelocityAtWorldPoint(motionFromSnapshot(snapshot), interfaceWorld),
    );
    for (const [index, velocity] of childInterfaceVelocities.entries()) {
      assertVecNear(
        velocity,
        parentInterfaceVelocity,
        INTERFACE_VELOCITY_EPS_MPS,
        `child ${index} interface velocity`,
      );
    }
    assertVecNear(
      childInterfaceVelocities[0],
      childInterfaceVelocities[1],
      INTERFACE_VELOCITY_EPS_MPS,
      "relative interface velocity at reconstruction",
    );

    const parentTranslationalEnergyJ = translationalEnergyOf([parentSnapshot]);
    const immediateTranslationalEnergyJ = translationalEnergyOf(immediate);
    assert.ok(Number.isFinite(parentTranslationalEnergyJ));
    assert.ok(Number.isFinite(immediateTranslationalEnergyJ));

    afterRuntime.step(1);
    const afterStep = afterRuntime.snapshots();
    assert.equal(afterStep.length, 2);
    for (const snapshot of afterStep) {
      for (const value of [
        snapshot.position.x,
        snapshot.position.y,
        snapshot.position.z,
        snapshot.rotation.x,
        snapshot.rotation.y,
        snapshot.rotation.z,
        snapshot.rotation.w,
        snapshot.linearVelocity.x,
        snapshot.linearVelocity.y,
        snapshot.linearVelocity.z,
        snapshot.angularVelocity.x,
        snapshot.angularVelocity.y,
        snapshot.angularVelocity.z,
      ]) {
        assert.ok(Number.isFinite(value), `non-finite post-step state in ${snapshot.planBodyId}`);
      }
    }

    assertVecNear(
      momentumOf(afterStep),
      parentMomentum,
      POST_STEP_MOMENTUM_EPS_KG_MPS,
      "post-step total linear momentum",
    );

    const maxPostStepLinearVelocityDelta = Math.max(
      ...afterStep.map((snapshot) => {
        const immediateSnapshot = immediate.find((value) => value.planBodyId === snapshot.planBodyId);
        assert.ok(immediateSnapshot);
        return magnitude(subtract(snapshot.linearVelocity, immediateSnapshot.linearVelocity));
      }),
    );

    console.log(
      JSON.stringify({
        probe: "ANVIL-01/CUT-2B",
        maxRotatedOffsetEffectM: maxRotatedOffsetEffect,
        maxRigidFieldEffectMps: maxRigidFieldEffect,
        immediateMomentumErrorKgMps: magnitude(subtract(immediateMomentum, parentMomentum)),
        postStepMomentumErrorKgMps: magnitude(subtract(momentumOf(afterStep), parentMomentum)),
        maxPostStepLinearVelocityDeltaMps: maxPostStepLinearVelocityDelta,
        parentTranslationalEnergyJ,
        childComTranslationalEnergyJ: immediateTranslationalEnergyJ,
        translationalEnergyDeltaJ: immediateTranslationalEnergyJ - parentTranslationalEnergyJ,
      }),
    );
  } finally {
    afterRuntime.dispose();
  }
});
