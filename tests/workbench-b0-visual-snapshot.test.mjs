import test from "node:test";
import assert from "node:assert/strict";
import { WorkbenchB0Specimen } from "../.test-build/src/workbench/w1-b0-specimen.js";

test("W1 B0 presentation snapshot separates authored cells from disposable runtime bodies", async () => {
  const specimen = await WorkbenchB0Specimen.create();
  try {
    const initial = specimen.visualSnapshot();
    assert.equal(initial.phase, "INITIAL");
    assert.equal(initial.cells.length, 7);
    assert.equal(initial.bodies.length, 2);
    assert.equal(initial.bearing.sourceBearingId, "bearing:seam-0");
    assert.equal(initial.patch.sourcePatchId, "torque-patch:seam-0");
    assert.equal(initial.patch.target.cellId, "a:2");
    assert.equal(initial.patch.currentBodyId, "body:a:0");
    assert.ok(initial.bodies.some((body) => body.id === initial.patch.currentBodyId));

    specimen.continueToCutReady();
    const ready = specimen.visualSnapshot();
    assert.equal(ready.phase, "CUT_READY");
    assert.equal(ready.cells.length, 7);
    assert.equal(ready.bodies.length, 2);

    await specimen.executeAcceptedCut();
    const postCut = specimen.visualSnapshot();
    assert.equal(postCut.phase, "POST_CUT_OFF");
    assert.equal(postCut.cells.length, 7);
    assert.equal(postCut.bodies.length, 3);
    assert.equal(postCut.bearing.sourceBearingId, initial.bearing.sourceBearingId);
    assert.equal(postCut.patch.sourcePatchId, initial.patch.sourcePatchId);
    assert.deepEqual(postCut.patch.target, initial.patch.target);
    assert.equal(postCut.patch.currentBodyId, "body:a:2");
    assert.notEqual(postCut.patch.currentBodyId, initial.patch.currentBodyId);
    assert.ok(postCut.bodies.some((body) => body.id === "body:a:0"));
    assert.ok(postCut.bodies.some((body) => body.id === postCut.patch.currentBodyId));

    specimen.activateAndObserve();
    const observed = specimen.visualSnapshot();
    assert.equal(observed.phase, "OBSERVED");
    assert.equal(observed.cells.length, 7);
    assert.equal(observed.bodies.length, 3);
    assert.equal(observed.patch.currentBodyId, "body:a:2");
    assert.ok(Number.isFinite(observed.bearing.anchorGapM));
  } finally {
    specimen.dispose();
  }
});
