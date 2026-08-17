import test from "node:test";
import assert from "node:assert/strict";
import { compileMatter } from "../.test-build/src/compiler.js";
import { createCollapseFixture } from "../.test-build/src/fixture.js";
import { CollapsePhysics } from "../.test-build/src/physics.js";
import { totalLinearMomentum } from "../.test-build/src/foundation/continuity.js";

const ZERO = { x: 0, y: 0, z: 0 };
const GRAVITY = { x: 0, y: -10, z: 0 };
const CUT_CONNECTION = ["cell:-1:0:0", "cell:0:0:0"];
const GROUND_MIN_X_M = -8;
const EDGE_CLEARANCE_M = 0.06;
const INITIAL_SUPPORTED_GAP_M = 0.06;

// The source is accepted only when the old one-body representation has already
// received a measurable ground response while the future right child is at the
// ground and the future left child is both raised and horizontally beyond the
// finite ground box. This prevents a post-bounce near-ground state from passing.
const SEARCH_STEPS = 180;
const CONTACT_BOTTOM_MIN_M = -0.03;
const CONTACT_BOTTOM_MAX_M = 0.02;
const AIRBORNE_BOTTOM_MIN_M = 0.12;
const AIRBORNE_MAX_X_M = GROUND_MIN_X_M - 0.01;
const CONTACT_MIN_X_REACH_M = GROUND_MIN_X_M + 0.35;
const SOURCE_MIN_LINEAR_CONTACT_EFFECT_MPS = 0.03;
const SOURCE_MIN_ANGULAR_CONTACT_EFFECT_RADPS = 0.01;

// Reconstructed split gates. The two split worlds start from identical state;
// only ground existence differs. Their momentum difference therefore measures
// the external ground impulse after topology reconstruction.
const INITIAL_CONTACT_BOTTOM_MIN_M = -0.04;
const INITIAL_CONTACT_BOTTOM_MAX_M = 0.03;
const INITIAL_AIRBORNE_BOTTOM_MIN_M = 0.10;
const INITIAL_AIRBORNE_MAX_X_M = GROUND_MIN_X_M - 0.005;
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

function worldBounds(planBody, snapshot) {
  const bounds = {
    minX: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
    minZ: Number.POSITIVE_INFINITY,
    maxZ: Number.NEGATIVE_INFINITY,
  };
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
          const world = add(snapshot.position, rotateVec3ByQuat(snapshot.rotation, localCorner));
          bounds.minX = Math.min(bounds.minX, world.x);
          bounds.maxX = Math.max(bounds.maxX, world.x);
          bounds.minY = Math.min(bounds.minY, world.y);
          bounds.maxY = Math.max(bounds.maxY, world.y);
          bounds.minZ = Math.min(bounds.minZ, world.z);
          bounds.maxZ = Math.max(bounds.maxZ, world.z);
        }
      }
    }
  }
  for (const value of Object.values(bounds)) assert.ok(Number.isFinite(value));
  return bounds;
}

function childStatesFromParent(parentPlan, childPlan, parentSnapshot) {
  const motions = childMotionsFromParent(parentPlan, childPlan, motionFromSnapshot(parentSnapshot));
  return childPlan.bodies.map((child) => {
    const motion = motions[child.id];
    assert.ok(motion);
    return { child, motion, bounds: worldBounds(child, motion) };
  });
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

  const orderedChildren = [...afterPlan.bodies].sort(
    (a, b) => a.centerOfMassWorld.x - b.centerOfMassWorld.x,
  );
  const leftChild = orderedChildren[0];
  const rightChild = orderedChildren[1];
  assert.ok(leftChild && rightChild);

  // Use the real finite ground edge instead of trying to catch a transient bounce
  // on an infinite-looking flat patch. A negative z tilt raises the negative-x
  // (left) lobe and lowers the positive-x (right) lobe. Translation is derived
  // from compiled child bounds: left is placed beyond x=-8 while right is low and
  // extends onto the ground. No hand-tuned absolute parent pose is required.
  const initialRotation = axisAngleQuat({ x: 0, y: 0, z: 1 }, -0.17);
  const prototypeParentMotion = {
    position: ZERO,
    rotation: initialRotation,
    linearVelocity: { x: 0, y: -0.5, z: 0 },
    angularVelocity: ZERO,
  };
  const prototypeStates = childStatesFromParent(parentPlan, afterPlan, {
    ...prototypeParentMotion,
    planBodyId: parentPlan.id,
    massKg: parentPlan.massKg,
  });
  const prototypeLeft = prototypeStates.find((state) => state.child.id === leftChild.id);
  const prototypeRight = prototypeStates.find((state) => state.child.id === rightChild.id);
  assert.ok(prototypeLeft && prototypeRight);

  const initialMotion = {
    position: {
      x: GROUND_MIN_X_M - EDGE_CLEARANCE_M - prototypeLeft.bounds.maxX,
      y: INITIAL_SUPPORTED_GAP_M - prototypeRight.bounds.minY,
      z: 0,
    },
    rotation: initialRotation,
    linearVelocity: { x: 0, y: -0.5, z: 0 },
    angularVelocity: ZERO,
  };

  const initialStates = childMotionsFromParent(parentPlan, afterPlan, initialMotion);
  const initialLeftBounds = worldBounds(leftChild, initialStates[leftChild.id]);
  const initialRightBounds = worldBounds(rightChild, initialStates[rightChild.id]);
  assert.ok(
    initialLeftBounds.maxX <= GROUND_MIN_X_M - EDGE_CLEARANCE_M + 1e-9,
    `left lobe was not placed beyond ground edge: maxX=${initialLeftBounds.maxX}`,
  );
  assert.ok(
    initialRightBounds.maxX >= CONTACT_MIN_X_REACH_M,
    `right lobe does not extend onto ground: maxX=${initialRightBounds.maxX}`,
  );
  assert.ok(
    initialLeftBounds.minY >= AIRBORNE_BOTTOM_MIN_M,
    `tilt fixture does not raise left lobe enough: minY=${initialLeftBounds.minY}`,
  );
  assert.ok(
    Math.abs(initialRightBounds.minY - INITIAL_SUPPORTED_GAP_M) <= 1e-8,
    `right lobe initial ground gap mismatch: ${initialRightBounds.minY}`,
  );

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
  let sourceStep = 0;
  let sourceContactBounds;
  let sourceAirborneBounds;
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

      const childStates = childStatesFromParent(parentPlan, afterPlan, grounded);
      const left = childStates.find((state) => state.child.id === leftChild.id);
      const right = childStates.find((state) => state.child.id === rightChild.id);
      assert.ok(left && right);
      const linearEffect = magnitude(subtract(grounded.linearVelocity, free.linearVelocity));
      const angularEffect = magnitude(subtract(grounded.angularVelocity, free.angularVelocity));

      const candidate = {
        step,
        rightBottomM: right.bounds.minY,
        leftBottomM: left.bounds.minY,
        leftMaxX: left.bounds.maxX,
        rightMaxX: right.bounds.maxX,
        linearEffectMps: linearEffect,
        angularEffectRadps: angularEffect,
      };
      if (
        bestCandidate === null ||
        (Math.abs(candidate.rightBottomM) < Math.abs(bestCandidate.rightBottomM) &&
          candidate.leftBottomM > AIRBORNE_BOTTOM_MIN_M * 0.7)
      ) {
        bestCandidate = candidate;
      }

      const oneLobeGeometry =
        right.bounds.minY >= CONTACT_BOTTOM_MIN_M &&
        right.bounds.minY <= CONTACT_BOTTOM_MAX_M &&
        right.bounds.maxX >= CONTACT_MIN_X_REACH_M &&
        left.bounds.minY >= AIRBORNE_BOTTOM_MIN_M &&
        left.bounds.maxX <= AIRBORNE_MAX_X_M;
      const actualContactResponse =
        linearEffect >= SOURCE_MIN_LINEAR_CONTACT_EFFECT_MPS ||
        angularEffect >= SOURCE_MIN_ANGULAR_CONTACT_EFFECT_RADPS;

      if (oneLobeGeometry && actualContactResponse) {
        sourceSnapshot = grounded;
        sourceStep = step;
        sourceContactBounds = right.bounds;
        sourceAirborneBounds = left.bounds;
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
    `failed to find active one-lobe edge contact; best=${JSON.stringify(bestCandidate)}`,
  );
  assert.ok(sourceContactBounds && sourceAirborneBounds);

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

    const groundedContactInitial = groundedInitial.find((body) => body.planBodyId === rightChild.id);
    const groundedAirborneInitial = groundedInitial.find((body) => body.planBodyId === leftChild.id);
    assert.ok(groundedContactInitial && groundedAirborneInitial);
    const initialContactBounds = worldBounds(rightChild, groundedContactInitial);
    const initialAirborneBounds = worldBounds(leftChild, groundedAirborneInitial);
    assert.ok(
      initialContactBounds.minY >= INITIAL_CONTACT_BOTTOM_MIN_M &&
        initialContactBounds.minY <= INITIAL_CONTACT_BOTTOM_MAX_M,
      `reconstructed supported child is not at ground: ${initialContactBounds.minY} m`,
    );
    assert.ok(
      initialContactBounds.maxX >= CONTACT_MIN_X_REACH_M,
      `reconstructed supported child no longer reaches ground footprint: ${initialContactBounds.maxX}`,
    );
    assert.ok(
      initialAirborneBounds.minY >= INITIAL_AIRBORNE_BOTTOM_MIN_M,
      `reconstructed airborne child is too low: ${initialAirborneBounds.minY} m`,
    );
    assert.ok(
      initialAirborneBounds.maxX <= INITIAL_AIRBORNE_MAX_X_M,
      `reconstructed airborne child overlaps ground footprint: maxX=${initialAirborneBounds.maxX}`,
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
      `reconstructed split did not expose measurable ground impulse: ${externalContactImpulseKgMps} kg·m/s`,
    );

    const groundedContact = groundedOne.find((body) => body.planBodyId === rightChild.id);
    const freeContact = freeOne.find((body) => body.planBodyId === rightChild.id);
    const groundedAirborne = groundedOne.find((body) => body.planBodyId === leftChild.id);
    const freeAirborne = freeOne.find((body) => body.planBodyId === leftChild.id);
    assert.ok(groundedContact && freeContact && groundedAirborne && freeAirborne);

    const contactChildVelocityEffectMps = magnitude(
      subtract(groundedContact.linearVelocity, freeContact.linearVelocity),
    );
    const airborneChildVelocityEffectMps = magnitude(
      subtract(groundedAirborne.linearVelocity, freeAirborne.linearVelocity),
    );
    const contactChildUpwardEffectMps = groundedContact.linearVelocity.y - freeContact.linearVelocity.y;
    assert.ok(
      contactChildVelocityEffectMps >= MIN_CONTACT_CHILD_VELOCITY_EFFECT_MPS,
      `supported child did not respond measurably to ground: ${contactChildVelocityEffectMps} m/s`,
    );
    assert.ok(
      contactChildUpwardEffectMps >= MIN_CONTACT_CHILD_UPWARD_EFFECT_MPS,
      `ground did not provide expected upward effect: ${contactChildUpwardEffectMps} m/s`,
    );

    const contactBoundsAfterOne = worldBounds(rightChild, groundedContact);
    const airborneBoundsAfterOne = worldBounds(leftChild, groundedAirborne);
    assert.ok(
      contactBoundsAfterOne.minY >= POST_STEP_MIN_BOTTOM_M,
      `supported child sank too deeply after reconstruction: ${contactBoundsAfterOne.minY} m`,
    );
    assert.ok(
      airborneBoundsAfterOne.minY > contactBoundsAfterOne.minY,
      "one-lobe vertical ordering was lost immediately after reconstruction",
    );

    groundedSplitRuntime.step(FOLLOWUP_STEPS);
    const followup = groundedSplitRuntime.snapshots();
    for (const snapshot of followup) assertFiniteSnapshot(snapshot);
    const minFollowupBottomM = Math.min(
      ...afterPlan.bodies.map((child) => {
        const snapshot = followup.find((body) => body.planBodyId === child.id);
        assert.ok(snapshot);
        return worldBounds(child, snapshot).minY;
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
        contactChildId: rightChild.id,
        airborneChildId: leftChild.id,
        sourceContactBottomM: sourceContactBounds.minY,
        sourceAirborneBottomM: sourceAirborneBounds.minY,
        sourceAirborneMaxX: sourceAirborneBounds.maxX,
        sourceContactMaxX: sourceContactBounds.maxX,
        sourceLinearContactEffectMps,
        sourceAngularContactEffectRadps,
        initialContactBottomM: initialContactBounds.minY,
        initialAirborneBottomM: initialAirborneBounds.minY,
        initialAirborneMaxX: initialAirborneBounds.maxX,
        externalContactImpulseKgMps,
        contactChildVelocityEffectMps,
        airborneChildVelocityEffectMps,
        contactChildUpwardEffectMps,
        contactBottomAfterOneM: contactBoundsAfterOne.minY,
        airborneBottomAfterOneM: airborneBoundsAfterOne.minY,
        minFollowupBottomM,
      }),
    );
  } finally {
    groundedSplitRuntime.dispose();
    freeSplitRuntime.dispose();
  }
});
