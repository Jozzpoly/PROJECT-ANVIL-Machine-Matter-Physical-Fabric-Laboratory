import test from "node:test";
import assert from "node:assert/strict";
import { compileMatter } from "../.test-build/src/compiler.js";
import { createCollapseFixture } from "../.test-build/src/fixture.js";
import { CollapsePhysics } from "../.test-build/src/physics.js";
import { totalLinearMomentum } from "../.test-build/src/foundation/continuity.js";

const ZERO = { x: 0, y: 0, z: 0 };
const IDENTITY = { x: 0, y: 0, z: 0, w: 1 };
const GRAVITY = { x: 0, y: -10, z: 0 };
const CUT_CONNECTION = ["cell:-1:0:0", "cell:0:0:0"];
const SOURCE_SETTLE_STEPS = 240;
const LONG_HORIZON_STEPS = 30;

// Fixture/sensitivity gates: this test is invalid unless it truly exercises a
// body that fell onto the real ground and reached a supported, nearly static state.
const MIN_SOURCE_DROP_M = 1.0;
const SOURCE_SUPPORT_GAP_EPS_M = 0.025;
const SOURCE_LINEAR_SPEED_EPS_MPS = 0.03;
const SOURCE_ANGULAR_SPEED_EPS_RADPS = 0.03;
const SOURCE_ROTATION_VECTOR_EPS = 0.01;

// Reconstruction gates. Ground contact is an external impulse source, so the
// split is compared to a fresh unsplit control reconstructed from the same state.
const ONE_STEP_BARYCENTER_EPS_M = 2e-4;
const ONE_STEP_MEAN_VELOCITY_EPS_MPS = 2e-3;
const ONE_STEP_MOMENTUM_EPS_KG_MPS = 4.0;
const LONG_BARYCENTER_EPS_M = 2e-3;
const LONG_MEAN_VELOCITY_EPS_MPS = 0.01;
const LONG_MOMENTUM_EPS_KG_MPS = 20.0;
const LONG_CHILD_SUPPORT_GAP_EPS_M = 0.03;
const LONG_CHILD_LINEAR_SPEED_EPS_MPS = 0.05;
const LONG_CHILD_ANGULAR_SPEED_EPS_RADPS = 0.05;

// Dynamic-impact probe. Here the oracle is deliberately NOT the unsplit body:
// topology changes may legitimately change the impact response. Instead we
// compare a split topology that has existed throughout free fall against the
// same split topology reconstructed from the parent state just before impact.
const PREIMPACT_MIN_GAP_M = 0.05;
const PREIMPACT_MAX_GAP_M = 0.23;
const PREIMPACT_MIN_DOWNWARD_SPEED_MPS = 2.0;
const PREIMPACT_MAX_SEARCH_STEPS = 180;
const PREIMPACT_CHILD_POSITION_EPS_M = 2e-4;
const PREIMPACT_CHILD_VELOCITY_EPS_MPS = 2e-5;
const PREIMPACT_CHILD_ANGULAR_EPS_RADPS = 2e-5;
const IMPACT_MAX_SEARCH_STEPS = 12;
const MIN_CONTACT_IMPULSE_VELOCITY_EFFECT_MPS = 1.0;
const IMPACT_BARYCENTER_EPS_M = 7e-4;
const IMPACT_MEAN_VELOCITY_EPS_MPS = 0.02;
const IMPACT_MOMENTUM_EPS_KG_MPS = 30.0;
const IMPACT_POST_STEPS = 20;
const POST_IMPACT_BARYCENTER_EPS_M = 3e-3;
const POST_IMPACT_MEAN_VELOCITY_EPS_MPS = 0.03;
const POST_IMPACT_MOMENTUM_EPS_KG_MPS = 45.0;
const POST_IMPACT_CHILD_POSITION_EPS_M = 0.01;
const POST_IMPACT_CHILD_VELOCITY_EPS_MPS = 0.05;
const POST_IMPACT_SUPPORT_GAP_EPS_M = 0.04;

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(v, scalar) {
  return { x: v.x * scalar, y: v.y * scalar, z: v.z * scalar };
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

function rotateVec3ByQuat(rotation, value) {
  const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
  const t = cross(qv, value);
  const doubled = { x: 2 * t.x, y: 2 * t.y, z: 2 * t.z };
  return add(
    value,
    add(
      { x: rotation.w * doubled.x, y: rotation.w * doubled.y, z: rotation.w * doubled.z },
      cross(qv, doubled),
    ),
  );
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

function momentumOf(snapshots) {
  return totalLinearMomentum(
    snapshots.map((snapshot) => ({
      massKg: snapshot.massKg,
      linearVelocity: snapshot.linearVelocity,
    })),
  );
}

function lowestWorldY(planBody, snapshot) {
  let minimum = Number.POSITIVE_INFINITY;
  for (const collider of planBody.colliders) {
    const localCenter = subtract(collider.centerWorld, planBody.centerOfMassWorld);
    const h = collider.halfExtentsM;
    for (const dx of [-1, 1]) {
      for (const dy of [-1, 1]) {
        for (const dz of [-1, 1]) {
          const localCorner = {
            x: localCenter.x + dx * h.x,
            y: localCenter.y + dy * h.y,
            z: localCenter.z + dz * h.z,
          };
          const worldCorner = add(
            snapshot.position,
            rotateVec3ByQuat(snapshot.rotation, localCorner),
          );
          minimum = Math.min(minimum, worldCorner.y);
        }
      }
    }
  }
  assert.ok(Number.isFinite(minimum));
  return minimum;
}

function aggregateSnapshot(snapshots) {
  return {
    barycenter: massWeightedMean(snapshots, (snapshot) => snapshot.position),
    meanVelocity: massWeightedMean(snapshots, (snapshot) => snapshot.linearVelocity),
    momentum: momentumOf(snapshots),
  };
}

function childMotionsFromParent(parentPlan, afterPlan, parentMotion) {
  const motions = {};
  for (const child of afterPlan.bodies) {
    const authoredComOffset = subtract(child.centerOfMassWorld, parentPlan.centerOfMassWorld);
    const worldComOffset = rotateVec3ByQuat(parentMotion.rotation, authoredComOffset);
    const childWorldCom = add(parentMotion.position, worldComOffset);
    motions[child.id] = {
      position: childWorldCom,
      rotation: { ...parentMotion.rotation },
      linearVelocity: add(
        parentMotion.linearVelocity,
        cross(parentMotion.angularVelocity, worldComOffset),
      ),
      angularVelocity: { ...parentMotion.angularVelocity },
    };
  }
  return motions;
}

test("CUT reconstructs a settled supported contact without an artificial launch or sink", async () => {
  const document = createCollapseFixture(false);
  const beforePlan = compileMatter(document);
  const afterPlan = compileMatter(
    { ...document, revision: "anvil-01-cut/contact-support-split" },
    { blockedFaceConnections: [CUT_CONNECTION] },
  );

  assert.equal(beforePlan.bodies.length, 1);
  assert.equal(afterPlan.bodies.length, 2);
  const parentPlan = beforePlan.bodies[0];
  assert.ok(parentPlan);

  const parentInitialMotion = {
    position: { x: 0, y: 3.2, z: 0 },
    rotation: IDENTITY,
    linearVelocity: ZERO,
    angularVelocity: ZERO,
  };

  const initialPseudoSnapshot = {
    position: parentInitialMotion.position,
    rotation: parentInitialMotion.rotation,
  };
  const initialBottomY = lowestWorldY(parentPlan, initialPseudoSnapshot);

  const sourceRuntime = await CollapsePhysics.create(beforePlan, document.materials, {
    gravity: GRAVITY,
    includeGround: true,
    initialMotionByPlanBodyId: {
      [parentPlan.id]: parentInitialMotion,
    },
  });

  let supportedSnapshot;
  try {
    sourceRuntime.step(SOURCE_SETTLE_STEPS);
    const snapshots = sourceRuntime.snapshots();
    assert.equal(snapshots.length, 1);
    supportedSnapshot = snapshots[0];
    assert.ok(supportedSnapshot);
  } finally {
    sourceRuntime.dispose();
  }

  const supportedBottomY = lowestWorldY(parentPlan, supportedSnapshot);
  const sourceDropM = initialBottomY - supportedBottomY;
  const sourceLinearSpeed = magnitude(supportedSnapshot.linearVelocity);
  const sourceAngularSpeed = magnitude(supportedSnapshot.angularVelocity);
  const sourceRotationVectorMagnitude = Math.hypot(
    supportedSnapshot.rotation.x,
    supportedSnapshot.rotation.y,
    supportedSnapshot.rotation.z,
  );

  assert.ok(
    sourceDropM >= MIN_SOURCE_DROP_M,
    `contact fixture did not fall far enough: ${sourceDropM} m`,
  );
  assert.ok(
    Math.abs(supportedBottomY) <= SOURCE_SUPPORT_GAP_EPS_M,
    `source is not demonstrably supported at ground y=0: bottom ${supportedBottomY} m`,
  );
  assert.ok(
    sourceLinearSpeed <= SOURCE_LINEAR_SPEED_EPS_MPS,
    `source did not settle translationally: ${sourceLinearSpeed} m/s`,
  );
  assert.ok(
    sourceAngularSpeed <= SOURCE_ANGULAR_SPEED_EPS_RADPS,
    `source did not settle rotationally: ${sourceAngularSpeed} rad/s`,
  );
  assert.ok(
    sourceRotationVectorMagnitude <= SOURCE_ROTATION_VECTOR_EPS,
    `source contact introduced too much rotation for this isolated contact fixture: ${sourceRotationVectorMagnitude}`,
  );

  const parentMotion = motionFromSnapshot(supportedSnapshot);
  const controlRuntime = await CollapsePhysics.create(beforePlan, document.materials, {
    gravity: GRAVITY,
    includeGround: true,
    initialMotionByPlanBodyId: {
      [parentPlan.id]: parentMotion,
    },
  });

  const childInitialMotion = childMotionsFromParent(parentPlan, afterPlan, parentMotion);
  const splitRuntime = await CollapsePhysics.create(afterPlan, document.materials, {
    gravity: GRAVITY,
    includeGround: true,
    initialMotionByPlanBodyId: childInitialMotion,
  });

  try {
    controlRuntime.step(1);
    splitRuntime.step(1);
    const controlOne = controlRuntime.snapshots();
    const splitOne = splitRuntime.snapshots();
    assert.equal(controlOne.length, 1);
    assert.equal(splitOne.length, 2);

    const controlOneAggregate = aggregateSnapshot(controlOne);
    const splitOneAggregate = aggregateSnapshot(splitOne);
    assertVecNear(
      splitOneAggregate.barycenter,
      controlOneAggregate.barycenter,
      ONE_STEP_BARYCENTER_EPS_M,
      "one-step contact barycenter",
    );
    assertVecNear(
      splitOneAggregate.meanVelocity,
      controlOneAggregate.meanVelocity,
      ONE_STEP_MEAN_VELOCITY_EPS_MPS,
      "one-step contact mean velocity",
    );
    assertVecNear(
      splitOneAggregate.momentum,
      controlOneAggregate.momentum,
      ONE_STEP_MOMENTUM_EPS_KG_MPS,
      "one-step contact momentum",
    );

    controlRuntime.step(LONG_HORIZON_STEPS - 1);
    splitRuntime.step(LONG_HORIZON_STEPS - 1);
    const controlLong = controlRuntime.snapshots();
    const splitLong = splitRuntime.snapshots();
    assert.equal(controlLong.length, 1);
    assert.equal(splitLong.length, 2);

    const controlLongAggregate = aggregateSnapshot(controlLong);
    const splitLongAggregate = aggregateSnapshot(splitLong);
    assertVecNear(
      splitLongAggregate.barycenter,
      controlLongAggregate.barycenter,
      LONG_BARYCENTER_EPS_M,
      "long-horizon contact barycenter",
    );
    assertVecNear(
      splitLongAggregate.meanVelocity,
      controlLongAggregate.meanVelocity,
      LONG_MEAN_VELOCITY_EPS_MPS,
      "long-horizon contact mean velocity",
    );
    assertVecNear(
      splitLongAggregate.momentum,
      controlLongAggregate.momentum,
      LONG_MOMENTUM_EPS_KG_MPS,
      "long-horizon contact momentum",
    );

    let maxChildSupportGapM = 0;
    let maxChildLinearSpeedMps = 0;
    let maxChildAngularSpeedRadps = 0;
    for (const child of afterPlan.bodies) {
      const snapshot = splitLong.find((value) => value.planBodyId === child.id);
      assert.ok(snapshot, `missing supported child ${child.id}`);
      const bottomY = lowestWorldY(child, snapshot);
      const supportGap = Math.abs(bottomY);
      const linearSpeed = magnitude(snapshot.linearVelocity);
      const angularSpeed = magnitude(snapshot.angularVelocity);
      maxChildSupportGapM = Math.max(maxChildSupportGapM, supportGap);
      maxChildLinearSpeedMps = Math.max(maxChildLinearSpeedMps, linearSpeed);
      maxChildAngularSpeedRadps = Math.max(maxChildAngularSpeedRadps, angularSpeed);
      assert.ok(
        supportGap <= LONG_CHILD_SUPPORT_GAP_EPS_M,
        `${child.id} lost supported contact: bottom ${bottomY} m`,
      );
      assert.ok(
        linearSpeed <= LONG_CHILD_LINEAR_SPEED_EPS_MPS,
        `${child.id} artificial linear motion ${linearSpeed} m/s`,
      );
      assert.ok(
        angularSpeed <= LONG_CHILD_ANGULAR_SPEED_EPS_RADPS,
        `${child.id} artificial angular motion ${angularSpeed} rad/s`,
      );
    }

    console.log(
      JSON.stringify({
        probe: "ANVIL-01/CUT-2D1",
        sourceDropM,
        sourceSupportedBottomY: supportedBottomY,
        sourceLinearSpeedMps: sourceLinearSpeed,
        sourceAngularSpeedRadps: sourceAngularSpeed,
        oneStepBarycenterErrorM: magnitude(
          subtract(splitOneAggregate.barycenter, controlOneAggregate.barycenter),
        ),
        oneStepMeanVelocityErrorMps: magnitude(
          subtract(splitOneAggregate.meanVelocity, controlOneAggregate.meanVelocity),
        ),
        oneStepMomentumErrorKgMps: magnitude(
          subtract(splitOneAggregate.momentum, controlOneAggregate.momentum),
        ),
        longBarycenterErrorM: magnitude(
          subtract(splitLongAggregate.barycenter, controlLongAggregate.barycenter),
        ),
        longMeanVelocityErrorMps: magnitude(
          subtract(splitLongAggregate.meanVelocity, controlLongAggregate.meanVelocity),
        ),
        longMomentumErrorKgMps: magnitude(
          subtract(splitLongAggregate.momentum, controlLongAggregate.momentum),
        ),
        maxChildSupportGapM,
        maxChildLinearSpeedMps,
        maxChildAngularSpeedRadps,
      }),
    );
  } finally {
    controlRuntime.dispose();
    splitRuntime.dispose();
  }
});

test("CUT reconstructed split matches a pre-existing split through a dynamic ground impact", async () => {
  const document = createCollapseFixture(false);
  const beforePlan = compileMatter(document);
  const afterPlan = compileMatter(
    { ...document, revision: "anvil-01-cut/contact-impact-split" },
    { blockedFaceConnections: [CUT_CONNECTION] },
  );
  const parentPlan = beforePlan.bodies[0];
  assert.ok(parentPlan);
  assert.equal(afterPlan.bodies.length, 2);

  const parentInitialMotion = {
    position: { x: 0, y: 3.2, z: 0 },
    rotation: IDENTITY,
    linearVelocity: ZERO,
    angularVelocity: ZERO,
  };

  // Find a real pre-impact parent state instead of guessing the integrator.
  const parentRuntime = await CollapsePhysics.create(beforePlan, document.materials, {
    gravity: GRAVITY,
    includeGround: true,
    initialMotionByPlanBodyId: {
      [parentPlan.id]: parentInitialMotion,
    },
  });

  let preImpactParent;
  let stepsToPreImpact = 0;
  let preImpactGapM = Number.NaN;
  try {
    for (let step = 1; step <= PREIMPACT_MAX_SEARCH_STEPS; step += 1) {
      parentRuntime.step(1);
      const snapshot = parentRuntime.snapshots()[0];
      assert.ok(snapshot);
      const bottomY = lowestWorldY(parentPlan, snapshot);
      if (
        bottomY >= PREIMPACT_MIN_GAP_M &&
        bottomY <= PREIMPACT_MAX_GAP_M &&
        snapshot.linearVelocity.y <= -PREIMPACT_MIN_DOWNWARD_SPEED_MPS
      ) {
        preImpactParent = snapshot;
        stepsToPreImpact = step;
        preImpactGapM = bottomY;
        break;
      }
    }
  } finally {
    parentRuntime.dispose();
  }

  assert.ok(preImpactParent, "failed to locate a non-contacting dynamic pre-impact state");
  assert.ok(preImpactGapM > 0, `pre-impact parent already penetrates ground: ${preImpactGapM}`);
  assert.ok(
    preImpactParent.linearVelocity.y <= -PREIMPACT_MIN_DOWNWARD_SPEED_MPS,
    `pre-impact state is not dynamically falling: vy=${preImpactParent.linearVelocity.y}`,
  );

  // Reference: the split topology exists for the whole free-fall history.
  const referenceInitialChildren = childMotionsFromParent(
    parentPlan,
    afterPlan,
    parentInitialMotion,
  );
  const referenceRuntime = await CollapsePhysics.create(afterPlan, document.materials, {
    gravity: GRAVITY,
    includeGround: true,
    initialMotionByPlanBodyId: referenceInitialChildren,
  });
  referenceRuntime.step(stepsToPreImpact);
  const referencePreImpact = referenceRuntime.snapshots();
  assert.equal(referencePreImpact.length, 2);

  // Candidate: topology changes at the parent snapshot and the split runtime is
  // recreated immediately before impact using the already-tested rigid field.
  const reconstructedInitialChildren = childMotionsFromParent(
    parentPlan,
    afterPlan,
    motionFromSnapshot(preImpactParent),
  );
  const reconstructedRuntime = await CollapsePhysics.create(afterPlan, document.materials, {
    gravity: GRAVITY,
    includeGround: true,
    initialMotionByPlanBodyId: reconstructedInitialChildren,
  });
  const reconstructedPreImpact = reconstructedRuntime.snapshots();
  assert.equal(reconstructedPreImpact.length, 2);

  let maxPreImpactPositionErrorM = 0;
  let maxPreImpactVelocityErrorMps = 0;
  let maxPreImpactAngularErrorRadps = 0;
  for (const child of afterPlan.bodies) {
    const reference = referencePreImpact.find((value) => value.planBodyId === child.id);
    const reconstructed = reconstructedPreImpact.find((value) => value.planBodyId === child.id);
    assert.ok(reference && reconstructed, `missing pre-impact child ${child.id}`);
    const positionError = magnitude(subtract(reconstructed.position, reference.position));
    const velocityError = magnitude(
      subtract(reconstructed.linearVelocity, reference.linearVelocity),
    );
    const angularError = magnitude(
      subtract(reconstructed.angularVelocity, reference.angularVelocity),
    );
    maxPreImpactPositionErrorM = Math.max(maxPreImpactPositionErrorM, positionError);
    maxPreImpactVelocityErrorMps = Math.max(maxPreImpactVelocityErrorMps, velocityError);
    maxPreImpactAngularErrorRadps = Math.max(maxPreImpactAngularErrorRadps, angularError);
    assert.ok(
      positionError <= PREIMPACT_CHILD_POSITION_EPS_M,
      `${child.id} pre-impact position mismatch ${positionError}`,
    );
    assert.ok(
      velocityError <= PREIMPACT_CHILD_VELOCITY_EPS_MPS,
      `${child.id} pre-impact velocity mismatch ${velocityError}`,
    );
    assert.ok(
      angularError <= PREIMPACT_CHILD_ANGULAR_EPS_RADPS,
      `${child.id} pre-impact angular mismatch ${angularError}`,
    );
  }

  const referencePreAggregate = aggregateSnapshot(referencePreImpact);
  let impactStep = 0;
  let referenceImpact;
  let reconstructedImpact;
  let contactImpulseVelocityEffectMps = 0;

  try {
    for (let step = 1; step <= IMPACT_MAX_SEARCH_STEPS; step += 1) {
      referenceRuntime.step(1);
      reconstructedRuntime.step(1);
      const referenceNow = referenceRuntime.snapshots();
      const reconstructedNow = reconstructedRuntime.snapshots();
      const referenceMinBottomY = Math.min(
        ...afterPlan.bodies.map((child) => {
          const snapshot = referenceNow.find((value) => value.planBodyId === child.id);
          assert.ok(snapshot);
          return lowestWorldY(child, snapshot);
        }),
      );
      const referenceAggregate = aggregateSnapshot(referenceNow);
      const verticalVelocityEffect = Math.abs(
        referenceAggregate.meanVelocity.y - referencePreAggregate.meanVelocity.y,
      );
      if (
        referenceMinBottomY <= SOURCE_SUPPORT_GAP_EPS_M &&
        verticalVelocityEffect >= MIN_CONTACT_IMPULSE_VELOCITY_EFFECT_MPS
      ) {
        impactStep = step;
        referenceImpact = referenceNow;
        reconstructedImpact = reconstructedNow;
        contactImpulseVelocityEffectMps = verticalVelocityEffect;
        break;
      }
    }

    assert.ok(referenceImpact && reconstructedImpact, "dynamic impact was not observed in search horizon");
    const referenceImpactAggregate = aggregateSnapshot(referenceImpact);
    const reconstructedImpactAggregate = aggregateSnapshot(reconstructedImpact);
    assertVecNear(
      reconstructedImpactAggregate.barycenter,
      referenceImpactAggregate.barycenter,
      IMPACT_BARYCENTER_EPS_M,
      "dynamic-impact barycenter",
    );
    assertVecNear(
      reconstructedImpactAggregate.meanVelocity,
      referenceImpactAggregate.meanVelocity,
      IMPACT_MEAN_VELOCITY_EPS_MPS,
      "dynamic-impact mean velocity",
    );
    assertVecNear(
      reconstructedImpactAggregate.momentum,
      referenceImpactAggregate.momentum,
      IMPACT_MOMENTUM_EPS_KG_MPS,
      "dynamic-impact momentum",
    );

    referenceRuntime.step(IMPACT_POST_STEPS);
    reconstructedRuntime.step(IMPACT_POST_STEPS);
    const referencePost = referenceRuntime.snapshots();
    const reconstructedPost = reconstructedRuntime.snapshots();
    const referencePostAggregate = aggregateSnapshot(referencePost);
    const reconstructedPostAggregate = aggregateSnapshot(reconstructedPost);

    assertVecNear(
      reconstructedPostAggregate.barycenter,
      referencePostAggregate.barycenter,
      POST_IMPACT_BARYCENTER_EPS_M,
      "post-impact barycenter",
    );
    assertVecNear(
      reconstructedPostAggregate.meanVelocity,
      referencePostAggregate.meanVelocity,
      POST_IMPACT_MEAN_VELOCITY_EPS_MPS,
      "post-impact mean velocity",
    );
    assertVecNear(
      reconstructedPostAggregate.momentum,
      referencePostAggregate.momentum,
      POST_IMPACT_MOMENTUM_EPS_KG_MPS,
      "post-impact momentum",
    );

    let maxPostChildPositionErrorM = 0;
    let maxPostChildVelocityErrorMps = 0;
    let maxReconstructedSupportGapM = 0;
    for (const child of afterPlan.bodies) {
      const reference = referencePost.find((value) => value.planBodyId === child.id);
      const reconstructed = reconstructedPost.find((value) => value.planBodyId === child.id);
      assert.ok(reference && reconstructed, `missing post-impact child ${child.id}`);
      const positionError = magnitude(subtract(reconstructed.position, reference.position));
      const velocityError = magnitude(
        subtract(reconstructed.linearVelocity, reference.linearVelocity),
      );
      const supportGap = Math.abs(lowestWorldY(child, reconstructed));
      maxPostChildPositionErrorM = Math.max(maxPostChildPositionErrorM, positionError);
      maxPostChildVelocityErrorMps = Math.max(maxPostChildVelocityErrorMps, velocityError);
      maxReconstructedSupportGapM = Math.max(maxReconstructedSupportGapM, supportGap);
      assert.ok(
        positionError <= POST_IMPACT_CHILD_POSITION_EPS_M,
        `${child.id} post-impact position mismatch ${positionError}`,
      );
      assert.ok(
        velocityError <= POST_IMPACT_CHILD_VELOCITY_EPS_MPS,
        `${child.id} post-impact velocity mismatch ${velocityError}`,
      );
      assert.ok(
        supportGap <= POST_IMPACT_SUPPORT_GAP_EPS_M,
        `${child.id} reconstructed impact lost ground support: ${supportGap} m`,
      );
    }

    console.log(
      JSON.stringify({
        probe: "ANVIL-01/CUT-2D2",
        stepsToPreImpact,
        preImpactGapM,
        preImpactDownwardSpeedMps: -preImpactParent.linearVelocity.y,
        maxPreImpactPositionErrorM,
        maxPreImpactVelocityErrorMps,
        maxPreImpactAngularErrorRadps,
        impactStepAfterReconstruction: impactStep,
        contactImpulseVelocityEffectMps,
        impactBarycenterErrorM: magnitude(
          subtract(reconstructedImpactAggregate.barycenter, referenceImpactAggregate.barycenter),
        ),
        impactMeanVelocityErrorMps: magnitude(
          subtract(reconstructedImpactAggregate.meanVelocity, referenceImpactAggregate.meanVelocity),
        ),
        impactMomentumErrorKgMps: magnitude(
          subtract(reconstructedImpactAggregate.momentum, referenceImpactAggregate.momentum),
        ),
        postImpactBarycenterErrorM: magnitude(
          subtract(reconstructedPostAggregate.barycenter, referencePostAggregate.barycenter),
        ),
        postImpactMeanVelocityErrorMps: magnitude(
          subtract(reconstructedPostAggregate.meanVelocity, referencePostAggregate.meanVelocity),
        ),
        postImpactMomentumErrorKgMps: magnitude(
          subtract(reconstructedPostAggregate.momentum, referencePostAggregate.momentum),
        ),
        maxPostChildPositionErrorM,
        maxPostChildVelocityErrorMps,
        maxReconstructedSupportGapM,
      }),
    );
  } finally {
    referenceRuntime.dispose();
    reconstructedRuntime.dispose();
  }
});
