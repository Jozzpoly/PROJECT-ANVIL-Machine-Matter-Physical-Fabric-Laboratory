import test from "node:test";
import assert from "node:assert/strict";
import Box3DFactory from "box3d.js/inline";

const IDENTITY = { v: { x: 0, y: 0, z: 0 }, s: 1 };

function rotate(rotation, value) {
  const q = rotation.v;
  const t = {
    x: q.y * value.z - q.z * value.y,
    y: q.z * value.x - q.x * value.z,
    z: q.x * value.y - q.y * value.x,
  };
  const doubled = { x: 2 * t.x, y: 2 * t.y, z: 2 * t.z };
  const cross2 = {
    x: q.y * doubled.z - q.z * doubled.y,
    y: q.z * doubled.x - q.x * doubled.z,
    z: q.x * doubled.y - q.y * doubled.x,
  };
  return {
    x: value.x + rotation.s * doubled.x + cross2.x,
    y: value.y + rotation.s * doubled.y + cross2.y,
    z: value.z + rotation.s * doubled.z + cross2.z,
  };
}

function worldPoint(b3, bodyId, local) {
  const p = b3.b3Body_GetPosition(bodyId);
  const q = b3.b3Body_GetRotation(bodyId);
  const r = rotate(q, local);
  return { x: p.x + r.x, y: p.y + r.y, z: p.z + r.z };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

test("ANVIL-02 exact box3d.js binding creates a free revolute relation", async () => {
  const b3 = await Box3DFactory();
  const version = b3.b3GetVersion();
  assert.deepEqual(
    { major: version.major, minor: version.minor, revision: version.revision },
    { major: 0, minor: 1, revision: 0 },
  );
  assert.equal(typeof b3.b3DefaultRevoluteJointDef, "function");
  assert.equal(typeof b3.b3CreateRevoluteJoint, "function");
  assert.equal(typeof b3.b3RevoluteJoint_GetAngle, "function");

  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { x: 0, y: 0, z: 0 };
  worldDef.workerCount = 0;
  const world = b3.b3CreateWorld(worldDef);

  try {
    const makeBody = (x, vy, wz) => {
      const def = b3.b3DefaultBodyDef();
      def.type = b3.b3BodyType.b3_dynamicBody;
      def.position = { x, y: 0, z: 0 };
      def.linearVelocity = { x: 0, y: vy, z: 0 };
      def.angularVelocity = { x: 0, y: 0, z: wz };
      def.enableSleep = false;
      def.isAwake = true;
      const id = b3.b3CreateBody(world, def);
      const shape = b3.b3DefaultShapeDef();
      shape.density = 500;
      shape.filter.maskBits = 0n;
      b3.b3CreateBoxShape(id, shape, 0.2, 0.2, 0.2);
      return id;
    };

    const bodyA = makeBody(-0.75, 0.3, -0.4);
    const bodyB = makeBody(0.75, 0.6, 0.8);
    const localA = { x: 0.75, y: 0, z: 0 };
    const localB = { x: -0.75, y: 0, z: 0 };

    const def = b3.b3DefaultRevoluteJointDef();
    def.base.bodyIdA = bodyA;
    def.base.bodyIdB = bodyB;
    def.base.localFrameA = { p: localA, q: IDENTITY };
    def.base.localFrameB = { p: localB, q: IDENTITY };
    def.base.collideConnected = false;
    const joint = b3.b3CreateRevoluteJoint(world, def);

    for (let step = 0; step < 60; step += 1) b3.b3World_Step(world, 1 / 60, 4);

    const gap = distance(worldPoint(b3, bodyA, localA), worldPoint(b3, bodyB, localB));
    const angle = b3.b3RevoluteJoint_GetAngle(joint);
    assert.ok(Number.isFinite(gap), `non-finite bearing anchor gap ${gap}`);
    assert.ok(Number.isFinite(angle), `non-finite bearing angle ${angle}`);
    assert.ok(gap <= 0.0025, `revolute anchor gap ${gap} m exceeds 0.0025 m`);
    assert.ok(Math.abs(angle) >= 0.2, `revolute relative angle ${angle} rad is not discriminating`);
  } finally {
    if (b3.b3World_IsValid(world)) b3.b3DestroyWorld(world);
  }
});
