import test from "node:test";
import assert from "node:assert/strict";
import Box3DFactory from "box3d.js/inline";

const EPS = 1e-9;

function assertFiniteVec3(value, label) {
  assert.ok(Number.isFinite(value.x), `${label}.x must be finite`);
  assert.ok(Number.isFinite(value.y), `${label}.y must be finite`);
  assert.ok(Number.isFinite(value.z), `${label}.z must be finite`);
}

function assertVec3Near(actual, expected, tolerance, label) {
  assertFiniteVec3(actual, label);
  for (const axis of ["x", "y", "z"]) {
    const delta = Math.abs(actual[axis] - expected[axis]);
    assert.ok(delta <= tolerance, `${label}.${axis} delta ${delta} exceeds ${tolerance}`);
  }
}

function axisAngleQuat(axis, angle) {
  const length = Math.hypot(axis.x, axis.y, axis.z);
  assert.ok(length > 0);
  const half = angle / 2;
  const scale = Math.sin(half) / length;
  return {
    v: { x: axis.x * scale, y: axis.y * scale, z: axis.z * scale },
    s: Math.cos(half),
  };
}

function quatDot(a, b) {
  return a.v.x * b.v.x + a.v.y * b.v.y + a.v.z * b.v.z + a.s * b.s;
}

function assertQuatEquivalent(actual, expected, tolerance, label) {
  assertFiniteVec3(actual.v, `${label}.v`);
  assert.ok(Number.isFinite(actual.s), `${label}.s must be finite`);
  const length = Math.hypot(actual.v.x, actual.v.y, actual.v.z, actual.s);
  assert.ok(Math.abs(length - 1) <= 1e-7, `${label} quaternion length ${length}`);
  const alignment = Math.abs(quatDot(actual, expected));
  assert.ok(1 - alignment <= tolerance, `${label} orientation mismatch ${1 - alignment}`);
}

test("CUT binding gate round-trips pose and motion state on exact box3d.js binding", async () => {
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

  try {
    const initialPosition = { x: 1.125, y: -2.25, z: 3.5 };
    const initialRotation = axisAngleQuat({ x: 1, y: 2, z: -3 }, 0.73);
    const initialLinearVelocity = { x: 2.75, y: -1.5, z: 0.625 };
    const initialAngularVelocity = { x: -0.45, y: 1.2, z: 0.8 };

    const bodyDef = b3.b3DefaultBodyDef();
    bodyDef.type = b3.b3BodyType.b3_dynamicBody;
    bodyDef.position = initialPosition;
    bodyDef.rotation = initialRotation;
    bodyDef.linearVelocity = initialLinearVelocity;
    bodyDef.angularVelocity = initialAngularVelocity;
    bodyDef.gravityScale = 0;
    bodyDef.enableSleep = false;

    const bodyId = b3.b3CreateBody(worldId, bodyDef);
    const shapeDef = b3.b3DefaultShapeDef();
    shapeDef.density = 640;
    b3.b3CreateBoxShape(bodyId, shapeDef, 0.45, 0.7, 0.9);

    assertVec3Near(b3.b3Body_GetPosition(bodyId), initialPosition, EPS, "initial position");
    assertQuatEquivalent(b3.b3Body_GetRotation(bodyId), initialRotation, 1e-10, "initial rotation");
    assertVec3Near(
      b3.b3Body_GetLinearVelocity(bodyId),
      initialLinearVelocity,
      EPS,
      "initial linear velocity",
    );
    assertVec3Near(
      b3.b3Body_GetAngularVelocity(bodyId),
      initialAngularVelocity,
      EPS,
      "initial angular velocity",
    );

    const massData = b3.b3Body_GetMassData(bodyId);
    assert.ok(Number.isFinite(massData.mass) && massData.mass > 0, `invalid mass ${massData.mass}`);
    assertFiniteVec3(massData.center, "mass local center");

    const replacementPosition = { x: -4.75, y: 1.875, z: 2.125 };
    const replacementRotation = axisAngleQuat({ x: -2, y: 5, z: 1 }, -1.11);
    const replacementLinearVelocity = { x: -3.25, y: 0.875, z: 1.5 };
    const replacementAngularVelocity = { x: 0.95, y: -0.35, z: 1.45 };

    b3.b3Body_SetTransform(bodyId, replacementPosition, replacementRotation);
    b3.b3Body_SetLinearVelocity(bodyId, replacementLinearVelocity);
    b3.b3Body_SetAngularVelocity(bodyId, replacementAngularVelocity);

    assertVec3Near(b3.b3Body_GetPosition(bodyId), replacementPosition, EPS, "replacement position");
    assertQuatEquivalent(
      b3.b3Body_GetRotation(bodyId),
      replacementRotation,
      1e-10,
      "replacement rotation",
    );
    assertVec3Near(
      b3.b3Body_GetLinearVelocity(bodyId),
      replacementLinearVelocity,
      EPS,
      "replacement linear velocity",
    );
    assertVec3Near(
      b3.b3Body_GetAngularVelocity(bodyId),
      replacementAngularVelocity,
      EPS,
      "replacement angular velocity",
    );

    b3.b3World_Step(worldId, 1 / 60, 4);
    const steppedPosition = b3.b3Body_GetPosition(bodyId);
    const steppedRotation = b3.b3Body_GetRotation(bodyId);
    const steppedLinearVelocity = b3.b3Body_GetLinearVelocity(bodyId);
    const steppedAngularVelocity = b3.b3Body_GetAngularVelocity(bodyId);

    assertFiniteVec3(steppedPosition, "stepped position");
    assertFiniteVec3(steppedRotation.v, "stepped rotation.v");
    assert.ok(Number.isFinite(steppedRotation.s), "stepped rotation.s must be finite");
    assertFiniteVec3(steppedLinearVelocity, "stepped linear velocity");
    assertFiniteVec3(steppedAngularVelocity, "stepped angular velocity");
    assert.ok(
      Math.hypot(
        steppedPosition.x - replacementPosition.x,
        steppedPosition.y - replacementPosition.y,
        steppedPosition.z - replacementPosition.z,
      ) > 1e-5,
      "body did not advance after state initialization",
    );
  } finally {
    if (b3.b3World_IsValid(worldId)) b3.b3DestroyWorld(worldId);
  }
});
