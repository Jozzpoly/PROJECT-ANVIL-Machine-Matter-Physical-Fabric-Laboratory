import test from "node:test";
import assert from "node:assert/strict";
import { WorkbenchB0Controller } from "../.test-build/src/workbench/w1-b0-controller.js";

function assertState(controller, expected) {
  assert.deepEqual(controller.state, expected);
}

test("W1 B0 controller enforces the exact frozen phase path", () => {
  const controller = new WorkbenchB0Controller();

  assertState(controller, {
    phase: "INITIAL",
    torqueActivation: "OFF",
    cutAvailable: false,
    activationAvailable: false,
  });

  assert.equal(controller.start().phase, "PRE_CUT");
  assert.equal(controller.state.torqueActivation, "OFF");
  assert.equal(controller.state.cutAvailable, false);
  assert.equal(controller.state.activationAvailable, false);

  assert.equal(controller.reachCutReady().phase, "CUT_READY");
  assert.equal(controller.state.torqueActivation, "OFF");
  assert.equal(controller.state.cutAvailable, true);
  assert.equal(controller.state.activationAvailable, false);

  assert.equal(controller.recordAcceptedCutComplete().phase, "POST_CUT_OFF");
  assert.equal(controller.state.torqueActivation, "OFF");
  assert.equal(controller.state.cutAvailable, false);
  assert.equal(controller.state.activationAvailable, true);

  assert.equal(controller.activateTorque().phase, "OBSERVING");
  assert.equal(controller.state.torqueActivation, "ON");
  assert.equal(controller.state.cutAvailable, false);
  assert.equal(controller.state.activationAvailable, false);

  assert.equal(controller.finishObservation().phase, "OBSERVED");
  assert.equal(controller.state.torqueActivation, "ON");
  assert.equal(controller.state.cutAvailable, false);
  assert.equal(controller.state.activationAvailable, false);
});

test("W1 B0 controller fails closed on forbidden shortcuts and pre-CUT activation", () => {
  const controller = new WorkbenchB0Controller();

  assert.throws(() => controller.activateTorque(), /cannot activate torque from INITIAL/u);
  assert.throws(() => controller.recordAcceptedCutComplete(), /cannot complete the accepted CUT from INITIAL/u);
  assert.throws(() => controller.reachCutReady(), /cannot reach CUT READY from INITIAL/u);

  controller.start();
  assert.throws(() => controller.activateTorque(), /cannot activate torque from PRE_CUT/u);
  assert.throws(() => controller.recordAcceptedCutComplete(), /cannot complete the accepted CUT from PRE_CUT/u);

  controller.reachCutReady();
  assert.throws(() => controller.activateTorque(), /cannot activate torque from CUT_READY/u);
  assert.throws(() => controller.start(), /cannot start from CUT_READY/u);

  controller.recordAcceptedCutComplete();
  assert.throws(() => controller.recordAcceptedCutComplete(), /cannot complete the accepted CUT from POST_CUT_OFF/u);
  assert.throws(() => controller.reachCutReady(), /cannot reach CUT READY from POST_CUT_OFF/u);

  controller.activateTorque();
  assert.throws(() => controller.recordAcceptedCutComplete(), /cannot complete the accepted CUT from OBSERVING/u);
  assert.throws(() => controller.activateTorque(), /cannot activate torque from OBSERVING/u);

  controller.finishObservation();
  assert.throws(() => controller.activateTorque(), /cannot activate torque from OBSERVED/u);
});

test("W1 B0 reset returns every phase to the exact initial contract", () => {
  const checkpoints = [
    (controller) => controller.start(),
    (controller) => {
      controller.start();
      controller.reachCutReady();
    },
    (controller) => {
      controller.start();
      controller.reachCutReady();
      controller.recordAcceptedCutComplete();
    },
    (controller) => {
      controller.start();
      controller.reachCutReady();
      controller.recordAcceptedCutComplete();
      controller.activateTorque();
    },
    (controller) => {
      controller.start();
      controller.reachCutReady();
      controller.recordAcceptedCutComplete();
      controller.activateTorque();
      controller.finishObservation();
    },
  ];

  for (const advance of checkpoints) {
    const controller = new WorkbenchB0Controller();
    advance(controller);
    const reset = controller.reset();
    assert.deepEqual(reset, {
      phase: "INITIAL",
      torqueActivation: "OFF",
      cutAvailable: false,
      activationAvailable: false,
    });
  }
});
