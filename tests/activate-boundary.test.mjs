import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { magnitudeVec3 } from "../.test-build/src/foundation/spatial.js";
import {
  compileTorquePatch,
  createTorquePatchFixture,
} from "../.test-build/src/experiments/anvil-06-torque-patch.js";
import {
  ActivateControlState,
} from "../.test-build/src/experiments/anvil-09-activate.js";

const ACTIVE_EFFORT_NM = 100;

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

test("ANVIL-09 activation remains runtime-only, defaults OFF and fails closed", () => {
  const authored = createTorquePatchFixture(ACTIVE_EFFORT_NM);
  const compilation = compileTorquePatch(authored);
  const authoredBefore = structuredClone(authored);
  const compilationBefore = structuredClone(compilation);
  deepFreeze(authored);
  deepFreeze(compilation);

  const control = new ActivateControlState(compilation);
  assert.equal(control.sourceCompilation, compilation, "ACTIVATE did not retain the exact compiled object");
  assert.equal(control.activation, "OFF");
  assert.deepEqual(control.snapshot(), { activation: "OFF" });
  assert.deepEqual(Object.keys(control.snapshot()), ["activation"]);

  control.setActivation("ON");
  assert.equal(control.activation, "ON");
  assert.deepEqual(control.snapshot(), { activation: "ON" });

  control.setActivation("OFF");
  assert.equal(control.activation, "OFF");

  assert.throws(() => control.setActivation("REVERSE"), /activation must be OFF or ON/u);
  assert.throws(() => control.setActivation(1), /activation must be OFF or ON/u);
  assert.equal(control.activation, "OFF", "invalid activation changed runtime state");

  assert.deepEqual(authored, authoredBefore, "ACTIVATE mutated persistent authored source");
  assert.deepEqual(compilation, compilationBefore, "ACTIVATE mutated persistent compilation");
  assert.equal("activation" in authored.patch, false);
  assert.equal("activation" in compilation, false);
  assert.equal("activation" in compilation.torque.action, false);
});

test("ANVIL-09 OFF supplies zero torque while ON reproduces the accepted compiled torque pair", () => {
  const authored = createTorquePatchFixture(ACTIVE_EFFORT_NM);
  const compilation = compileTorquePatch(authored);
  const control = new ActivateControlState(compilation);

  const off = control.torquePair();
  assert.ok(magnitudeVec3(off.torqueAWorld) <= 1e-12);
  assert.ok(magnitudeVec3(off.torqueBWorld) <= 1e-12);

  control.setActivation("ON");
  const on = control.torquePair();
  assert.deepEqual(on.torqueAWorld, compilation.torque.action.torqueAWorld);
  assert.deepEqual(on.torqueBWorld, compilation.torque.action.torqueBWorld);
  assert.notEqual(on.torqueAWorld, compilation.torque.action.torqueAWorld, "ACTIVATE leaked mutable compiled vector identity");
  assert.notEqual(on.torqueBWorld, compilation.torque.action.torqueBWorld, "ACTIVATE leaked mutable compiled vector identity");

  const net = add(on.torqueAWorld, on.torqueBWorld);
  assert.ok(magnitudeVec3(net) <= 1e-12, `non-zero active torque pair sum ${magnitudeVec3(net)}`);

  control.setActivation("OFF");
  const offAgain = control.torquePair();
  assert.ok(magnitudeVec3(offAgain.torqueAWorld) <= 1e-12);
  assert.ok(magnitudeVec3(offAgain.torqueBWorld) <= 1e-12);
});

test("ANVIL-09 control boundary contains no compiler, solver-motor or runtime-identity control path", async () => {
  const source = await readFile(new URL("../src/experiments/anvil-09-activate.ts", import.meta.url), "utf8");

  for (const forbidden of [
    "compileTorquePatch",
    "box3d",
    "motorSpeed",
    "maxMotorTorque",
    "enableMotor",
    "SetAngularVelocity",
    "bodyId",
    "jointId",
  ]) {
    assert.equal(source.includes(forbidden), false, `ANVIL-09 control boundary contains forbidden token ${forbidden}`);
  }
});
