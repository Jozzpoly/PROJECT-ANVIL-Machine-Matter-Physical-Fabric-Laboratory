import test from "node:test";
import assert from "node:assert/strict";
import {
  createRuntimeHandGrab,
  runtimeHandAnchorWorld,
  runtimeHandForceWorld,
  updateRuntimeHandTarget,
} from "../.test-build/src/studio-recovery/hand.js";

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

test("FREEDOM-FIRST Runtime Hand preserves the clicked material point", () => {
  const body = snapshot();
  const point = { x: 2.5, y: -0.75, z: 0.5 };
  const grab = createRuntimeHandGrab(body, point);
  assert.deepEqual(grab.localPoint, { x: 0.5, y: 0.25, z: 0 });
  assert.deepEqual(runtimeHandAnchorWorld(grab, body), point);
});

test("FREEDOM-FIRST Runtime Hand is force-neutral at a satisfied target", () => {
  const body = snapshot();
  const point = { x: 2.5, y: -0.75, z: 0.5 };
  assert.deepEqual(runtimeHandForceWorld(createRuntimeHandGrab(body, point), body), { x: 0, y: 0, z: 0 });
});

test("FREEDOM-FIRST Runtime Hand pulls physically toward the moved target", () => {
  const body = snapshot();
  const initial = createRuntimeHandGrab(body, { x: 2.5, y: -0.75, z: 0.5 });
  const moved = updateRuntimeHandTarget(initial, { x: 2.7, y: -0.75, z: 0.5 });
  const force = runtimeHandForceWorld(moved, body);
  assert.ok(force.x > 0);
  assert.ok(Math.abs(force.y) < 1e-12);
  assert.ok(Math.abs(force.z) < 1e-12);
});

test("FREEDOM-FIRST Runtime Hand caps force by body mass times maximum acceleration", () => {
  const body = snapshot({ massKg: 12 });
  const grab = updateRuntimeHandTarget(
    createRuntimeHandGrab(body, { x: 2, y: -1, z: 0.5 }),
    { x: 102, y: -1, z: 0.5 },
  );
  const force = runtimeHandForceWorld(grab, body);
  assert.ok(Math.abs(magnitude(force) - 12 * 80) < 1e-9);
});

test("FREEDOM-FIRST Runtime Hand damps velocity of an off-center grabbed point", () => {
  const body = snapshot({ angularVelocity: { x: 0, y: 0, z: 2 } });
  const grab = createRuntimeHandGrab(body, { x: 3, y: -1, z: 0.5 });
  const force = runtimeHandForceWorld(grab, body);
  assert.ok(force.y < 0);
  assert.ok(Math.abs(force.x) < 1e-12);
  assert.ok(Math.abs(force.z) < 1e-12);
});
