import test from "node:test";
import assert from "node:assert/strict";
import { WorkbenchB0Specimen } from "../.test-build/src/workbench/w1-b0-specimen.js";

const EXPECTED_SOURCE_CELLS = ["a:0", "a:1", "a:2", "b:0", "b:1", "b:2", "b:3"];

test("W1 B0 composes the exact accepted CUT -> rebuild -> re-lower -> fresh OFF transaction", async () => {
  const specimen = await WorkbenchB0Specimen.create();
  try {
    const authoredBefore = specimen.authoredSummary;
    assert.deepEqual(authoredBefore.sourceCellIds, EXPECTED_SOURCE_CELLS);
    assert.equal(authoredBefore.sourceBearingId, "bearing:seam-0");
    assert.equal(authoredBefore.sourcePatchId, "torque-patch:seam-0");
    assert.deepEqual(authoredBefore.sourcePatchTarget, { cellId: "a:2", face: "x+" });
    assert.equal(authoredBefore.effortNm, 100);
    assert.equal(specimen.state.phase, "INITIAL");
    assert.equal(specimen.state.torqueActivation, "OFF");

    const ready = specimen.continueToCutReady();
    assert.equal(specimen.state.phase, "CUT_READY");
    assert.equal(specimen.state.torqueActivation, "OFF");
    assert.equal(specimen.state.cutAvailable, true);
    assert.equal(ready.preCutSteps, 31);
    assert.equal(ready.runtimeBodyIds.length, 2);
    assert.equal(ready.sourceBearingId, authoredBefore.sourceBearingId);

    const transition = await specimen.executeAcceptedCut();
    assert.equal(specimen.state.phase, "POST_CUT_OFF");
    assert.equal(specimen.state.torqueActivation, "OFF");
    assert.equal(specimen.state.activationAvailable, true);

    assert.equal(transition.beforeRuntimeBodyIds.length, 2);
    assert.equal(transition.afterRuntimeBodyIds.length, 3);
    assert.equal(transition.beforeEndpointBodyId, "body:a:0");
    assert.equal(transition.afterEndpointBodyId, "body:a:2");
    assert.notEqual(transition.beforeEndpointBodyId, transition.afterEndpointBodyId);
    assert.equal(transition.sourceBearingIdBefore, authoredBefore.sourceBearingId);
    assert.equal(transition.sourceBearingIdAfter, authoredBefore.sourceBearingId);
    assert.equal(transition.sourcePatchId, authoredBefore.sourcePatchId);
    assert.deepEqual(transition.sourcePatchTarget, authoredBefore.sourcePatchTarget);
    assert.equal(transition.freshActionBodyAId, transition.afterEndpointBodyId);
    assert.ok(transition.afterRuntimeBodyIds.includes(transition.freshActionBodyAId));
    assert.ok(transition.afterRuntimeBodyIds.includes(transition.freshActionBodyBId));
    assert.equal(transition.oldEndpointBodyStillExists, true);
    assert.ok(transition.afterRuntimeBodyIds.includes(transition.beforeEndpointBodyId));
    assert.notEqual(transition.freshActionBodyAId, transition.beforeEndpointBodyId);
    assert.equal(transition.oldRuntimeDisposed, true);
    assert.equal(transition.freshActivation, "OFF");

    const authoredAfter = specimen.authoredSummary;
    assert.deepEqual(authoredAfter, authoredBefore);
  } finally {
    specimen.dispose();
  }
});

test("W1 B0 transaction fails closed before deterministic CUT READY", async () => {
  const specimen = await WorkbenchB0Specimen.create();
  try {
    await assert.rejects(
      specimen.executeAcceptedCut(),
      /cannot execute accepted CUT from INITIAL/u,
    );
    assert.equal(specimen.state.phase, "INITIAL");
    assert.equal(specimen.transitionReceipt, null);
  } finally {
    specimen.dispose();
  }
});

test("W1 B0 reset reconstructs the exact initial specimen after CUT", async () => {
  const specimen = await WorkbenchB0Specimen.create();
  try {
    const authoredBefore = specimen.authoredSummary;
    specimen.continueToCutReady();
    await specimen.executeAcceptedCut();

    const reset = await specimen.reset();
    assert.deepEqual(reset, {
      phase: "INITIAL",
      torqueActivation: "OFF",
      cutAvailable: false,
      activationAvailable: false,
    });
    assert.deepEqual(specimen.authoredSummary, authoredBefore);
    assert.equal(specimen.cutReadyReceipt, null);
    assert.equal(specimen.transitionReceipt, null);

    const readyAgain = specimen.continueToCutReady();
    assert.equal(readyAgain.preCutSteps, 31);
    assert.equal(readyAgain.runtimeBodyIds.length, 2);
  } finally {
    specimen.dispose();
  }
});
