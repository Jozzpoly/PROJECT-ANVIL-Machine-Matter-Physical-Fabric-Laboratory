import test from "node:test";
import assert from "node:assert/strict";
import Box3DFactory from "box3d.js/inline";
import {
  compileBearing,
  createBearingFixture,
  jointFrameForAxis,
} from "../.test-build/src/experiments/anvil-02-bearing.js";

const MAX_INITIAL_GAP_M = 0.00001;
const MAX_ANCHOR_GAP_M = 0.0025;
const MIN_CONTROL_GAP_M = 0.25;
const MIN_RELATIVE_ANGLE_RAD = 0.35;
const FIXED_DT = 1 / 60;
const SUBSTEPS = 4;

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}
function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}
function scale(a, scalar) {
  return { x: a.x * scalar, y: a.y * scalar, z: a.z * scalar };
}
function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}
function magnitude(value) {
  return Math.hypot(value.x, value.y, value.z);
}
function normalize(value) {
  const length = magnitude(value);
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
  return add(value, add(scale(doubled, rotation.w), cross(qv, doubled)));
}
function transformPoint(rotation, translation, point) {
  return add(translation, rotate(rotation, point));
}
function toB3Quat(rotation) {
  return { v: { x: rotation.x, y: rotation.y, z: rotation.z }, s: rotation.w };
}
function worldPoint(b3, bodyId, local) {
  const p = b3.b3Body_GetPosition(bodyId);
  const q = b3.b3Body_GetRotation(bodyId);
  return add(
    { x: p.x, y: p.y, z: p.z },
    rotate({ x: q.v.x, y: q.v.y, z: q.v.z, w: q.s }, local),
  );
}
function gap(a, b) {
  return magnitude(subtract(a, b));
}
function bodyById(compilation, id) {
  const body = compilation.physicalPlan.bodies.find((candidate) => candidate.id === id);
  assert.ok(body, `missing compiled body ${id}`);
  return body;
}

async function createWorld(compilation, rotation, translation, linearById, angularById, withRelation) {
  const b3 = await Box3DFactory();
  const version = b3.b3GetVersion();
  assert.deepEqual(
    { major: version.major, minor: version.minor, revision: version.revision },
    { major: 0, minor: 1, revision: 0 },
  );
  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { x: 0, y: 0, z: 0 };
  worldDef.workerCount = 0;
  const worldId = b3.b3CreateWorld(worldDef);
  const bodyIds = new Map();
  try {
    for (const body of compilation.physicalPlan.bodies) {
      const def = b3.b3DefaultBodyDef();
      def.type = b3.b3BodyType.b3_dynamicBody;
      def.position = transformPoint(rotation, translation, body.centerOfMassWorld);
      def.rotation = toB3Quat(rotation);
      def.linearVelocity = linearById[body.id];
      def.angularVelocity = angularById[body.id];
      def.enableSleep = false;
      def.isAwake = true;
      const bodyId = b3.b3CreateBody(worldId, def);
      bodyIds.set(body.id, bodyId);
      const shape = b3.b3DefaultShapeDef();
      shape.density = 780;
      shape.filter.maskBits = 0n;
      b3.b3CreateBoxShape(bodyId, shape, 0.18, 0.18, 0.18);
    }

    let jointId = null;
    if (withRelation) {
      const relation = compilation.relation;
      const bodyAId = bodyIds.get(relation.bodyAId);
      const bodyBId = bodyIds.get(relation.bodyBId);
      assert.ok(bodyAId && bodyBId, "missing runtime relation bodies");
      const def = b3.b3DefaultRevoluteJointDef();
      def.base.bodyIdA = bodyAId;
      def.base.bodyIdB = bodyBId;
      def.base.localFrameA = {
        p: relation.localAnchorA,
        q: toB3Quat(jointFrameForAxis(relation.localAxisA)),
      };
      def.base.localFrameB = {
        p: relation.localAnchorB,
        q: toB3Quat(jointFrameForAxis(relation.localAxisB)),
      };
      def.base.collideConnected = false;
      jointId = b3.b3CreateRevoluteJoint(worldId, def);
    }

    return { b3, worldId, bodyIds, jointId };
  } catch (error) {
    if (b3.b3World_IsValid(worldId)) b3.b3DestroyWorld(worldId);
    throw error;
  }
}

function anchorGap(runtime, relation) {
  const bodyA = runtime.bodyIds.get(relation.bodyAId);
  const bodyB = runtime.bodyIds.get(relation.bodyBId);
  assert.ok(bodyA && bodyB, "missing runtime bodies for anchor measurement");
  return gap(
    worldPoint(runtime.b3, bodyA, relation.localAnchorA),
    worldPoint(runtime.b3, bodyB, relation.localAnchorB),
  );
}

function dispose(runtime) {
  if (runtime.b3.b3World_IsValid(runtime.worldId)) runtime.b3.b3DestroyWorld(runtime.worldId);
}

test("ANVIL-02 compiled local bearing frame is covariant under an arbitrary common rigid transform", async () => {
  const fixture = createBearingFixture();
  const compilation = compileBearing(fixture);
  const relation = compilation.relation;
  const bodyA = bodyById(compilation, relation.bodyAId);
  const bodyB = bodyById(compilation, relation.bodyBId);

  const rotation = axisAngleQuat({ x: 0.37, y: -0.81, z: 0.44 }, 0.91);
  const translation = { x: 2.4, y: -1.3, z: 1.7 };
  const pivotWorld = transformPoint(rotation, translation, relation.pivotWorld);
  const axisWorld = normalize(rotate(rotation, relation.axisWorld));
  const comAWorld = transformPoint(rotation, translation, bodyA.centerOfMassWorld);
  const comBWorld = transformPoint(rotation, translation, bodyB.centerOfMassWorld);
  const omegaA = scale(axisWorld, -0.55);
  const omegaB = scale(axisWorld, 0.85);
  const linearById = {
    [bodyA.id]: cross(omegaA, subtract(comAWorld, pivotWorld)),
    [bodyB.id]: cross(omegaB, subtract(comBWorld, pivotWorld)),
  };
  const angularById = { [bodyA.id]: omegaA, [bodyB.id]: omegaB };

  const constrained = await createWorld(
    compilation,
    rotation,
    translation,
    linearById,
    angularById,
    true,
  );
  const control = await createWorld(
    compilation,
    rotation,
    translation,
    linearById,
    angularById,
    false,
  );

  try {
    const initialGap = anchorGap(constrained, relation);
    assert.ok(initialGap <= MAX_INITIAL_GAP_M, `initial transformed anchor gap ${initialGap} m`);

    for (let step = 0; step < 120; step += 1) {
      constrained.b3.b3World_Step(constrained.worldId, FIXED_DT, SUBSTEPS);
      control.b3.b3World_Step(control.worldId, FIXED_DT, SUBSTEPS);
    }

    const constrainedGap = anchorGap(constrained, relation);
    const controlGap = anchorGap(control, relation);
    assert.notEqual(constrained.jointId, null);
    const angle = constrained.b3.b3RevoluteJoint_GetAngle(constrained.jointId);

    console.log(JSON.stringify({
      probe: "ANVIL-02/BEARING-C5",
      initialTransformedGapM: initialGap,
      constrainedGapM: constrainedGap,
      noRelationControlGapM: controlGap,
      revoluteAngleRad: angle,
      transformedAxisWorld: axisWorld,
    }));

    assert.ok(constrainedGap <= MAX_ANCHOR_GAP_M, `transformed bearing gap ${constrainedGap} m exceeds ${MAX_ANCHOR_GAP_M} m`);
    assert.ok(controlGap >= MIN_CONTROL_GAP_M, `transformed control gap ${controlGap} m does not reach ${MIN_CONTROL_GAP_M} m`);
    assert.ok(Math.abs(angle) >= MIN_RELATIVE_ANGLE_RAD, `transformed bearing angle ${angle} rad does not reach ${MIN_RELATIVE_ANGLE_RAD} rad`);
  } finally {
    dispose(constrained);
    dispose(control);
  }
});
