import test from "node:test";
import assert from "node:assert/strict";
import {
  createRuntimeHandGrab,
  runtimeHandAnchorWorld,
  runtimeHandForceWorld,
  updateRuntimeHandTarget,
} from "../.test-build/src/studio/interaction-bandwidth.js";

function snapshot(overrides = {}) {
  return {
    planBodyId: "body:0",
    position: { x: 2, y: -1, z: 0.5 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    linearVelocity: { x: 0, y: 0, z: 0 },
    angularVelocity: { x: 0, y: 0, z: 0 },
    massKg: 10,
    localCenter: { x: 0, y: 0, z: 0 },
    ...overrides,
  };
}

function magnitude(v) {
  return Math.hypot(v.x, v.y, v.z);
}

test("Runtime Hand preserves the clicked material point in body-local coordinates", () => {
  const body = snapshot();
  const point = { x: 2.5, y: -0.75, z: 0.5 };
  const grab = createRuntimeHandGrab(body, point);
  assert.deepEqual(grab.localPoint, { x: 0.5, y: 0.25, z: 0 });
  assert.deepEqual(runtimeHandAnchorWorld(grab, body), point);
});

test("Runtime Hand is force-neutral at a stationary satisfied target", () => {
  const body = snapshot();
  const point = { x: 2.5, y: -0.75, z: 0.5 };
  const grab = createRuntimeHandGrab(body, point);
  assert.deepEqual(runtimeHandForceWorld(grab, body), { x: 0, y: 0, z: 0 });
});

test("Runtime Hand spring pulls toward the pointer target without mutating the grab", () => {
  const body = snapshot();
  const initial = createRuntimeHandGrab(body, { x: 2.5, y: -0.75, z: 0.5 });
  const moved = updateRuntimeHandTarget(initial, { x: 2.7, y: -0.75, z: 0.5 });
  const force = runtimeHandForceWorld(moved, body);
  assert.equal(initial.targetWorld.x, 2.5);
  assert.equal(moved.targetWorld.x, 2.7);
  assert.ok(force.x > 0);
  assert.ok(Math.abs(force.y) < 1e-12);
  assert.ok(Math.abs(force.z) < 1e-12);
});

test("Runtime Hand caps force by body mass times maximum acceleration", () => {
  const body = snapshot({ massKg: 12 });
  const grab = updateRuntimeHandTarget(
    createRuntimeHandGrab(body, { x: 2, y: -1, z: 0.5 }),
    { x: 102, y: -1, z: 0.5 },
  );
  const force = runtimeHandForceWorld(grab, body);
  assert.ok(Math.abs(magnitude(force) - 12 * 80) < 1e-9);
});

test("Runtime Hand damps the velocity of an off-center grabbed point", () => {
  const body = snapshot({ angularVelocity: { x: 0, y: 0, z: 2 } });
  const grab = createRuntimeHandGrab(body, { x: 3, y: -1, z: 0.5 });
  const force = runtimeHandForceWorld(grab, body);
  // omega Z cross arm +X gives point velocity +Y, so damping must pull -Y.
  assert.ok(force.y < 0);
  assert.ok(Math.abs(force.x) < 1e-12);
  assert.ok(Math.abs(force.z) < 1e-12);
});
