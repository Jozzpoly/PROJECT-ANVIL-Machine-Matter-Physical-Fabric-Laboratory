import test from "node:test";
import assert from "node:assert/strict";
import { compileMatter } from "../.test-build/src/compiler.js";
import { createCollapseFixture } from "../.test-build/src/fixture.js";
import { CollapsePhysics } from "../.test-build/src/physics.js";
import { totalLinearMomentum } from "../.test-build/src/foundation/continuity.js";

const ZERO = { x: 0, y: 0, z: 0 };
const GRAVITY = { x: 0, y: -10, z: 0 };
const CUT_CONNECTION = ["cell:-1:0:0", "cell:0:0:0"];

// Source search gates: the old one-body representation must already have a real
// asymmetric ground response while only one would-be child is geometrically in contact.
const SEARCH_STEPS = 120;
const CONTACT_BOTTOM_MIN_M = -0.03;
const CONTACT_BOTTOM_MAX_M = 0.02;
const AIRBORNE_BOTTOM_MIN_M = 0.12;
const SOURCE_MIN_LINEAR_CONTACT_EFFECT_MPS = 0.03;
const SOURCE_MIN_ANGULAR_CONTACT_EFFECT_RADPS = 0.01;

// Reconstructed split gates. Both split worlds start from exactly the same state;
// only ground existence differs, so their momentum difference is an external
// contact-impulse measurement rather than a topology comparison.
const INITIAL_CONTACT_BOTTOM_MIN_M = -0.04;
const INITIAL_CONTACT_BOTTOM_MAX_M = 0.03;
const INITIAL_AIRBORNE_BOTTOM_MIN_M = 0.10;
const MIN_EXTERNAL_CONTACT_IMPULSE_KG_MPS = 5.0;
const MIN_CONTACT_CHILD_VELOCITY_EFFECT_MPS = 0.02;
const MIN_CONTACT_CHILD_UPWARD_EFFECT_MPS = 0.02;
const POST_STEP_MIN_BOTTOM_M = -0.04;
const FOLLOWUP_STEPS = 8;
const FOLLOWUP_MIN_BOTTOM_M = -0.05;

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

function childMotionsFromParent(parentPlan, childPlan, parentMotion) {
  const motions = {};
  for (const child of childPlan.bodies) {
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

function childBottomsFromParent(parentPlan, childPlan, parentSnapshot) {
  const motions = childMotionsFromParent(parentPlan, childPlan, motionFromSnapshot(parentSnapshot));
  return childPlan.bodies
    .map((child) => {
      const motion = motions[child.id];
      assert.ok(motion);
      return { child, bottomY: lowestWorldY(child, motion) };
    })
    .sort((a, b) => a.bottomY - b.bottomY);
}

function momentumOf(snapshots) {
  return totalLinearMomentum(
    snapshots.map((snapshot) => ({
      massKg: snapshot.massKg,
      linearVelocity: snapshot.linearVelocity,
    })),
  );
}

function assertFiniteSnapshot(snapshot) {
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
    snapshot.massKg,
  ]) {
    assert.ok(Number.isFinite(value), `non-finite state in ${snapshot.planBodyId}`);
  }
}

test("CUT reconstructs a real one-lobe ground contact and exposes its external impulse", async () => {
  const document = createCollapseFixture(false);
  const beforePlan = compileMatter(document);
  const afterPlan = compileMatter(
    { ...document, revision: "anvil-01-cut/one-lobe-contact-split" },
    { blockedFaceConnections: [CUT_CONNECTION] },
  );
  assert.equal(beforePlan.bodies.length, 1);
  assert.equal(afterPlan.bodies.length, 2);
  const parentPlan = beforePlan.bodies[0];
  assert.ok(parentPlan);

  // Positive z rotation lowers the negative-x lobe. The source is allowed to
  // evolve in the real solver; the search below accepts only a measured state
  // where the asymmetry and actual ground response are both demonstrated.
  const initialMotion = {
    position: { x: 0, y: 1.45, z: 0 },
    rotation: axisAngleQuat({ x: 0, y: 0, z: 1 }, 0.17),
    linearVelocity: { x: 0, y: -1.25, z: 0 },
    angularVelocity: ZERO,
  };

  const groundedParentRuntime = await CollapsePhysics.create(beforePlan, document.materials, {
    gravity: GRAVITY,
    includeGround: true,
    initialMotionByPlanBodyId: { [parentPlan.id]: initialMotion },
  });
  const freeParentRuntime = await CollapsePhysics.create(beforePlan, document.materials, {
    gravity: GRAVITY,
    includeGround: false,
    initialMotionByPlanBodyId: { [parentPlan.id]: initialMotion },
  });

  let sourceSnapshot;
  let contactChildId = "";
  let airborneChildId = "";
  let sourceStep = 0;
  let sourceContactBottomM = Number.NaN;
  let sourceAirborneBottomM = Number.NaN;
  let sourceLinearContactEffectMps = 0;
  let sourceAngularContactEffectRadps = 0;
  let bestCandidate = null;

  try {
    for (let step = 1; step <= SEARCH_STEPS; step += 1) {
      groundedParentRuntime.step(1);
      freeParentRuntime.step(1);
      const grounded = groundedParentRuntime.snapshots()[0];
      const free = freeParentRuntime.snapshots()[0];
      assert.ok(grounded && free);

      const bottoms = childBottomsFromParent(parentPlan, afterPlan, grounded);
      const lower = bottoms[0];
      const upper = bottoms[1];
      assert.ok(lower && upper);
      const linearEffect = magnitude(subtract(grounded.linearVelocity, free.linearVelocity));
      const angularEffect = magnitude(subtract(grounded.angularVelocity, free.angularVelocity));

      const candidate = {
        step,
        lowerId: lower.child.id,
        upperId: upper.child.id,
        lowerBottomM: lower.bottomY,
        upperBottomM: upper.bottomY,
        linearEffectMps: linearEffect,
        angularEffectRadps: angularEffect,
      };
      if (
        bestCandidate === null ||
        (Math.abs(candidate.lowerBottomM) < Math.abs(bestCandidate.lowerBottomM) &&
          candidate.upperBottomM > bestCandidate.upperBottomM * 0.7)
      ) {
        bestCandidate = candidate;
      }

      const asymmetricGeometry =
        lower.bottomY >= CONTACT_BOTTOM_MIN_M &&
        lower.bottomY <= CONTACT_BOTTOM_MAX_M &&
        upper.bottomY >= AIRBORNE_BOTTOM_MIN_M;
      const actualContactResponse =
        linearEffect >= SOURCE_MIN_LINEAR_CONTACT_EFFECT_MPS ||
        angularEffect >= SOURCE_MIN_ANGULAR_CONTACT_EFFECT_RADPS;

      if (asymmetricGeometry && actualContactResponse) {
        sourceSnapshot = grounded;
        contactChildId = lower.child.id;
        airborneChildId = upper.child.id;
        sourceStep = step;
        sourceContactBottomM = lower.bottomY;
        sourceAirborneBottomM = upper.bottomY;
        sourceLinearContactEffectMps = linearEffect;
        sourceAngularContactEffectRadps = angularEffect;
        break;
      }
    }
  } finally {
    groundedParentRuntime.dispose();
    freeParentRuntime.dispose();
  }

  assert.ok(
    sourceSnapshot,
    `failed to find real one-lobe contact state; best=${JSON.stringify(bestCandidate)}`,
  );
  assert.notEqual(contactChildId, airborneChildId);
  assert.ok(sourceAirborneBottomM - sourceContactBottomM >= AIRBORNE_BOTTOM_MIN_M - CONTACT_BOTTOM_MAX_M);

  const splitInitialMotion = childMotionsFromParent(
    parentPlan,
    afterPlan,
    motionFromSnapshot(sourceSnapshot),
  );
  const groundedSplitRuntime = await CollapsePhysics.create(afterPlan, document.materials, {
    gravity: GRAVITY,
    includeGround: true,
    initialMotionByPlanBodyId: splitInitialMotion,
  });
  const freeSplitRuntime = await CollapsePhysics.create(afterPlan, document.materials, {
    gravity: GRAVITY,
    includeGround: false,
    initialMotionByPlanBodyId: splitInitialMotion,
  });

  try {
    const groundedInitial = groundedSplitRuntime.snapshots();
    const freeInitial = freeSplitRuntime.snapshots();
    assert.equal(groundedInitial.length, 2);
    assert.equal(freeInitial.length, 2);

    const contactPlan = afterPlan.bodies.find((body) => body.id === contactChildId);
    const airbornePlan = afterPlan.bodies.find((body) => body.id === airborneChildId);
    const groundedContactInitial = groundedInitial.find((body) => body.planBodyId === contactChildId);
    const groundedAirborneInitial = groundedInitial.find((body) => body.planBodyId === airborneChildId);
    assert.ok(contactPlan && airbornePlan && groundedContactInitial && groundedAirborneInitial);

    const initialContactBottomM = lowestWorldY(contactPlan, groundedContactInitial);
    const initialAirborneBottomM = lowestWorldY(airbornePlan, groundedAirborneInitial);
    assert.ok(
      initialContactBottomM >= INITIAL_CONTACT_BOTTOM_MIN_M &&
        initialContactBottomM <= INITIAL_CONTACT_BOTTOM_MAX_M,
      `reconstructed contact child is not at ground: ${initialContactBottomM} m`,
    );
    assert.ok(
      initialAirborneBottomM >= INITIAL_AIRBORNE_BOTTOM_MIN_M,
      `reconstructed airborne child is too close to ground: ${initialAirborneBottomM} m`,
    );

    groundedSplitRuntime.step(1);
    freeSplitRuntime.step(1);
    const groundedOne = groundedSplitRuntime.snapshots();
    const freeOne = freeSplitRuntime.snapshots();
    for (const snapshot of [...groundedOne, ...freeOne]) assertFiniteSnapshot(snapshot);

    const groundedMomentum = momentumOf(groundedOne);
    const freeMomentum = momentumOf(freeOne);
    const externalContactImpulseKgMps = magnitude(subtract(groundedMomentum, freeMomentum));
    assert.ok(
      externalContactImpulseKgMps >= MIN_EXTERNAL_CONTACT_IMPULSE_KG_MPS,
      `reconstructed split did not expose a measurable ground impulse: ${externalContactImpulseKgMps} kg·m/s`,
    );

    const groundedContact = groundedOne.find((body) => body.planBodyId === contactChildId);
    const freeContact = freeOne.find((body) => body.planBodyId === contactChildId);
    const groundedAirborne = groundedOne.find((body) => body.planBodyId === airborneChildId);
    const freeAirborne = freeOne.find((body) => body.planBodyId === airborneChildId);
    assert.ok(groundedContact && freeContact && groundedAirborne && freeAirborne);

    const contactChildVelocityEffectMps = magnitude(
      subtract(groundedContact.linearVelocity, freeContact.linearVelocity),
    );
    const airborneChildVelocityEffectMps = magnitude(
      subtract(groundedAirborne.linearVelocity, freeAirborne.linearVelocity),
    );
    const contactChildUpwardEffectMps =
      groundedContact.linearVelocity.y - freeContact.linearVelocity.y;
    assert.ok(
      contactChildVelocityEffectMps >= MIN_CONTACT_CHILD_VELOCITY_EFFECT_MPS,
      `contact child did not respond measurably to ground: ${contactChildVelocityEffectMps} m/s`,
    );
    assert.ok(
      contactChildUpwardEffectMps >= MIN_CONTACT_CHILD_UPWARD_EFFECT_MPS,
      `ground did not provide the expected upward effect: ${contactChildUpwardEffectMps} m/s`,
    );

    const contactBottomAfterOneM = lowestWorldY(contactPlan, groundedContact);
    const airborneBottomAfterOneM = lowestWorldY(airbornePlan, groundedAirborne);
    assert.ok(
      contactBottomAfterOneM >= POST_STEP_MIN_BOTTOM_M,
      `contact child sank too deeply after reconstruction: ${contactBottomAfterOneM} m`,
    );
    assert.ok(
      airborneBottomAfterOneM > contactBottomAfterOneM,
      "one-lobe spatial ordering was lost immediately after reconstruction",
    );

    groundedSplitRuntime.step(FOLLOWUP_STEPS);
    const followup = groundedSplitRuntime.snapshots();
    for (const snapshot of followup) assertFiniteSnapshot(snapshot);
    const minFollowupBottomM = Math.min(
      ...afterPlan.bodies.map((child) => {
        const snapshot = followup.find((body) => body.planBodyId === child.id);
        assert.ok(snapshot);
        return lowestWorldY(child, snapshot);
      }),
    );
    assert.ok(
      minFollowupBottomM >= FOLLOWUP_MIN_BOTTOM_M,
      `reconstructed contact became deeply invalid over follow-up: ${minFollowupBottomM} m`,
    );

    console.log(
      JSON.stringify({
        probe: "ANVIL-01/CUT-2D3",
        sourceStep,
        contactChildId,
        airborneChildId,
        sourceContactBottomM,
        sourceAirborneBottomM,
        sourceLinearContactEffectMps,
        sourceAngularContactEffectRadps,
        initialContactBottomM,
        initialAirborneBottomM,
        externalContactImpulseKgMps,
        contactChildVelocityEffectMps,
        airborneChildVelocityEffectMps,
        contactChildUpwardEffectMps,
        contactBottomAfterOneM,
        airborneBottomAfterOneM,
        minFollowupBottomM,
      }),
    );
  } finally {
    groundedSplitRuntime.dispose();
    freeSplitRuntime.dispose();
  }
});
