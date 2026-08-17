import test from "node:test";
import assert from "node:assert/strict";
import { compileMatter } from "../.test-build/src/compiler.js";
import { createCollapseFixture } from "../.test-build/src/fixture.js";
import { CollapsePhysics } from "../.test-build/src/physics.js";
import { totalLinearMomentum } from "../.test-build/src/foundation/continuity.js";

const ZERO = { x: 0, y: 0, z: 0 };
const IDENTITY = { x: 0, y: 0, z: 0, w: 1 };
const GRAVITY = { x: 0.35, y: -9.81, z: -0.22 };
const CUT_CONNECTION = ["cell:-1:0:0", "cell:0:0:0"];
const MASS_EPS_KG = 0.1;
const IMMEDIATE_MOMENTUM_EPS_KG_MPS = 0.75;
const CONTROL_MOMENTUM_EPS_KG_MPS = 1.5;
const BARYCENTER_EPS_M = 8e-5;
const MEAN_VELOCITY_EPS_MPS = 3e-5;
const CHILD_CONTROL_VELOCITY_EPS_MPS = 4e-5;
const CHILD_CONTROL_POSITION_EPS_M = 1e-4;
const MIN_GRAVITY_VELOCITY_EFFECT_MPS = 0.1;

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(v, scalar) {
  return { x: v.x * scalar, y: v.y * scalar, z: v.z * scalar };
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

function aggregateMass(snapshots) {
  return snapshots.reduce((sum, snapshot) => sum + snapshot.massKg, 0);
}

function massWeightedMean(snapshots, selector) {
  const mass = aggregateMass(snapshots);
  assert.ok(mass > 0);
  let weighted = ZERO;
  for (const snapshot of snapshots) {
    weighted = add(weighted, scale(selector(snapshot), snapshot.massKg));
  }
  return scale(weighted, 1 / mass);
}

test("CUT gravity transfer matches an unsplit control through the next solver step", async () => {
  const document = createCollapseFixture(false);
  const beforePlan = compileMatter(document);
  const afterPlan = compileMatter(
    { ...document, revision: "anvil-01-cut/gravity-split" },
    { blockedFaceConnections: [CUT_CONNECTION] },
  );

  assert.equal(beforePlan.bodies.length, 1);
  assert.equal(afterPlan.bodies.length, 2);
  const parentPlan = beforePlan.bodies[0];
  assert.ok(parentPlan);

  const parentInitialMotion = {
    position: { x: -3.2, y: 11.5, z: 2.75 },
    rotation: IDENTITY,
    linearVelocity: { x: 1.25, y: 2.4, z: -0.65 },
    angularVelocity: ZERO,
  };

  const sourceRuntime = await CollapsePhysics.create(beforePlan, document.materials, {
    gravity: GRAVITY,
    includeGround: false,
    initialMotionByPlanBodyId: {
      [parentPlan.id]: parentInitialMotion,
    },
  });

  let parentSnapshot;
  try {
    sourceRuntime.step(31);
    const snapshots = sourceRuntime.snapshots();
    assert.equal(snapshots.length, 1);
    parentSnapshot = snapshots[0];
    assert.ok(parentSnapshot);
    assertVecNear(parentSnapshot.angularVelocity, ZERO, 1e-5, "pre-CUT angular velocity");
  } finally {
    sourceRuntime.dispose();
  }

  const parentMotion = motionFromSnapshot(parentSnapshot);

  const controlRuntime = await CollapsePhysics.create(beforePlan, document.materials, {
    gravity: GRAVITY,
    includeGround: false,
    initialMotionByPlanBodyId: {
      [parentPlan.id]: parentMotion,
    },
  });

  let controlAfterStep;
  try {
    controlRuntime.step(1);
    const snapshots = controlRuntime.snapshots();
    assert.equal(snapshots.length, 1);
    controlAfterStep = snapshots[0];
    assert.ok(controlAfterStep);
  } finally {
    controlRuntime.dispose();
  }

  const gravityVelocityEffect = magnitude(
    subtract(controlAfterStep.linearVelocity, parentSnapshot.linearVelocity),
  );
  assert.ok(
    gravityVelocityEffect >= MIN_GRAVITY_VELOCITY_EFFECT_MPS,
    `gravity control is too weak: velocity effect ${gravityVelocityEffect} m/s`,
  );

  const initialMotionByPlanBodyId = {};
  for (const child of afterPlan.bodies) {
    const authoredComOffset = subtract(child.centerOfMassWorld, parentPlan.centerOfMassWorld);
    initialMotionByPlanBodyId[child.id] = {
      position: add(parentSnapshot.position, authoredComOffset),
      rotation: { ...parentMotion.rotation },
      linearVelocity: { ...parentSnapshot.linearVelocity },
      angularVelocity: ZERO,
    };
  }

  const splitRuntime = await CollapsePhysics.create(afterPlan, document.materials, {
    gravity: GRAVITY,
    includeGround: false,
    initialMotionByPlanBodyId,
  });

  try {
    const immediate = splitRuntime.snapshots();
    assert.equal(immediate.length, 2);

    const parentMass = parentSnapshot.massKg;
    const childMass = aggregateMass(immediate);
    assert.ok(
      Math.abs(childMass - parentMass) <= MASS_EPS_KG,
      `runtime mass changed ${parentMass} -> ${childMass}`,
    );

    assertVecNear(
      momentumOf(immediate),
      momentumOf([parentSnapshot]),
      IMMEDIATE_MOMENTUM_EPS_KG_MPS,
      "immediate split momentum",
    );

    splitRuntime.step(1);
    const splitAfterStep = splitRuntime.snapshots();
    assert.equal(splitAfterStep.length, 2);

    const controlMomentum = momentumOf([controlAfterStep]);
    const splitMomentum = momentumOf(splitAfterStep);
    assertVecNear(
      splitMomentum,
      controlMomentum,
      CONTROL_MOMENTUM_EPS_KG_MPS,
      "split vs unsplit control momentum",
    );

    const controlBarycenter = controlAfterStep.position;
    const splitBarycenter = massWeightedMean(splitAfterStep, (snapshot) => snapshot.position);
    assertVecNear(
      splitBarycenter,
      controlBarycenter,
      BARYCENTER_EPS_M,
      "split vs unsplit barycenter",
    );

    const controlMeanVelocity = controlAfterStep.linearVelocity;
    const splitMeanVelocity = massWeightedMean(
      splitAfterStep,
      (snapshot) => snapshot.linearVelocity,
    );
    assertVecNear(
      splitMeanVelocity,
      controlMeanVelocity,
      MEAN_VELOCITY_EPS_MPS,
      "split vs unsplit mean velocity",
    );

    let maxChildVelocityError = 0;
    let maxChildPositionError = 0;
    for (const child of afterPlan.bodies) {
      const snapshot = splitAfterStep.find((value) => value.planBodyId === child.id);
      assert.ok(snapshot, `missing split child ${child.id}`);
      const authoredComOffset = subtract(child.centerOfMassWorld, parentPlan.centerOfMassWorld);
      const expectedPosition = add(controlAfterStep.position, authoredComOffset);
      const velocityError = magnitude(
        subtract(snapshot.linearVelocity, controlAfterStep.linearVelocity),
      );
      const positionError = magnitude(subtract(snapshot.position, expectedPosition));
      maxChildVelocityError = Math.max(maxChildVelocityError, velocityError);
      maxChildPositionError = Math.max(maxChildPositionError, positionError);
      assert.ok(
        velocityError <= CHILD_CONTROL_VELOCITY_EPS_MPS,
        `${child.id} velocity vs control error ${velocityError}`,
      );
      assert.ok(
        positionError <= CHILD_CONTROL_POSITION_EPS_M,
        `${child.id} position vs control error ${positionError}`,
      );
    }

    console.log(
      JSON.stringify({
        probe: "ANVIL-01/CUT-2C",
        gravityVelocityEffectMps: gravityVelocityEffect,
        controlVsSplitMomentumErrorKgMps: magnitude(subtract(splitMomentum, controlMomentum)),
        controlVsSplitBarycenterErrorM: magnitude(subtract(splitBarycenter, controlBarycenter)),
        controlVsSplitMeanVelocityErrorMps: magnitude(
          subtract(splitMeanVelocity, controlMeanVelocity),
        ),
        maxChildVelocityErrorMps: maxChildVelocityError,
        maxChildPositionErrorM: maxChildPositionError,
      }),
    );
  } finally {
    splitRuntime.dispose();
  }
});
