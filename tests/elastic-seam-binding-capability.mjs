import test from "node:test";
import assert from "node:assert/strict";
import Box3DFactory from "box3d.js/inline";

const IDENTITY = { v: { x: 0, y: 0, z: 0 }, s: 1 };

test("ANVIL-07 exact box3d.js binding exposes weld spring tuning on Box3D 0.1.0", async () => {
  const b3 = await Box3DFactory();
  const version = b3.b3GetVersion();
  assert.deepEqual(
    { major: version.major, minor: version.minor, revision: version.revision },
    { major: 0, minor: 1, revision: 0 },
  );

  assert.equal(typeof b3.b3DefaultWeldJointDef, "function", "binding lacks b3DefaultWeldJointDef");
  assert.equal(typeof b3.b3CreateWeldJoint, "function", "binding lacks b3CreateWeldJoint");
  assert.equal(typeof b3.b3Body_ApplyForce, "function", "binding lacks b3Body_ApplyForce");

  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { x: 0, y: 0, z: 0 };
  worldDef.workerCount = 0;
  const world = b3.b3CreateWorld(worldDef);

  try {
    const makeBody = (x) => {
      const def = b3.b3DefaultBodyDef();
      def.type = b3.b3BodyType.b3_dynamicBody;
      def.position = { x, y: 0, z: 0 };
      def.enableSleep = false;
      def.isAwake = true;
      const id = b3.b3CreateBody(world, def);
      const shape = b3.b3DefaultShapeDef();
      shape.density = 500;
      shape.filter.maskBits = 0n;
      b3.b3CreateBoxShape(id, shape, 0.25, 0.25, 0.25);
      return id;
    };

    const bodyA = makeBody(-0.25);
    const bodyB = makeBody(0.25);
    const def = b3.b3DefaultWeldJointDef();

    assert.equal(typeof def.linearHertz, "number", "binding does not expose weld linearHertz");
    assert.equal(typeof def.angularHertz, "number", "binding does not expose weld angularHertz");
    assert.equal(typeof def.linearDampingRatio, "number", "binding does not expose weld linearDampingRatio");
    assert.equal(typeof def.angularDampingRatio, "number", "binding does not expose weld angularDampingRatio");

    def.base.bodyIdA = bodyA;
    def.base.bodyIdB = bodyB;
    def.base.localFrameA = { p: { x: 0.25, y: 0, z: 0 }, q: IDENTITY };
    def.base.localFrameB = { p: { x: -0.25, y: 0, z: 0 }, q: IDENTITY };
    def.base.collideConnected = false;
    def.linearHertz = 1.0;
    def.linearDampingRatio = 0.7;
    def.angularHertz = 0;
    def.angularDampingRatio = 1;

    b3.b3CreateWeldJoint(world, def);
    b3.b3World_Step(world, 1 / 60, 4);

    const pA = b3.b3Body_GetPosition(bodyA);
    const pB = b3.b3Body_GetPosition(bodyB);
    assert.ok([pA.x, pA.y, pA.z, pB.x, pB.y, pB.z].every(Number.isFinite), "weld capability step produced non-finite body state");
  } finally {
    if (b3.b3World_IsValid(world)) b3.b3DestroyWorld(world);
  }
});
