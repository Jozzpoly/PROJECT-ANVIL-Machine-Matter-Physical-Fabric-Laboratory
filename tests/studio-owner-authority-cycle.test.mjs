import test from "node:test";
import assert from "node:assert/strict";
import { FreedomRuntimeSession } from "../.test-build/src/studio-recovery/runtime.js";
import { FreedomWorkspace, createFreedomStarterSource } from "../.test-build/src/studio-recovery/source.js";

function canonical(value) {
  return JSON.stringify(value);
}

function maxValue(record) {
  return Math.max(0, ...Object.values(record));
}

function createAuthorityRuntime(source, generation) {
  return FreedomRuntimeSession.create(source, generation, { grounded: false });
}

test("R1 authority cycle: orphan -> partial Box3D -> rebind same IDs -> complete Box3D -> exact Undo", async () => {
  const workspace = new FreedomWorkspace(createFreedomStarterSource());
  const first = workspace.addBearing(
    { cellId: "starter:a", face: "x+" },
    { cellId: "starter:b", face: "x-" },
    "z",
  );
  const second = workspace.addBearing(
    { cellId: "starter:b", face: "x+" },
    { cellId: "starter:c", face: "x-" },
    "z",
  );
  const firstTorque = workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, 55);
  const secondTorque = workspace.addTorquePatch({ cellId: "starter:c", face: "x-" }, -20);

  workspace.removeMatter("starter:a");
  const orphaned = workspace.snapshot();
  assert.equal(orphaned.source.bearings.some((bearing) => bearing.id === first), true);
  assert.equal(orphaned.source.torquePatches.some((patch) => patch.id === firstTorque), true);

  const partialRuntime = await createAuthorityRuntime(orphaned.source, orphaned.generation);
  try {
    assert.equal(partialRuntime.receipt.quality, "PARTIAL");
    assert.equal(partialRuntime.receipt.jointCount, 1);
    assert.equal(partialRuntime.receipt.torqueCount, 1);
    assert.equal(partialRuntime.receipt.diagnostics.some((entry) => entry.sourceId === first && entry.code === "INVALID_LOCALITY"), true);
    assert.equal(partialRuntime.receipt.diagnostics.some((entry) => entry.sourceId === firstTorque && entry.code === "UNRESOLVED_TARGET"), true);
    partialRuntime.setForcesEnabled(true);
    partialRuntime.step(60);
    assert.ok(Math.abs(partialRuntime.relativeAngularSpeedRadps(second)) > 0.05);
    assert.ok(maxValue(partialRuntime.anchorErrorsM()) < 0.003);
  } finally {
    partialRuntime.dispose();
  }

  const [replacementCell] = workspace.extrudeMatterFromFace("starter:c", "x+", 1);
  assert.ok(replacementCell);
  workspace.rebindBearing(
    first,
    { cellId: "starter:c", face: "x+" },
    { cellId: replacementCell, face: "x-" },
    "y",
  );
  workspace.retargetTorquePatch(firstTorque, { cellId: "starter:c", face: "x+" });
  const repaired = workspace.snapshot();
  assert.equal(repaired.source.bearings.some((bearing) => bearing.id === first), true);
  assert.equal(repaired.source.torquePatches.some((patch) => patch.id === firstTorque), true);
  assert.equal(repaired.source.bearings.some((bearing) => bearing.id === second), true);
  assert.equal(repaired.source.torquePatches.some((patch) => patch.id === secondTorque), true);

  const authoredBeforeRuntime = canonical(repaired.source);
  const completeRuntime = await createAuthorityRuntime(repaired.source, repaired.generation);
  try {
    assert.equal(completeRuntime.receipt.quality, "COMPLETE");
    assert.equal(completeRuntime.receipt.bodyCount, 3);
    assert.equal(completeRuntime.receipt.jointCount, 2);
    assert.equal(completeRuntime.receipt.torqueCount, 2);
    completeRuntime.setForcesEnabled(true);
    completeRuntime.step(60);
    assert.ok(maxValue(completeRuntime.anchorErrorsM()) < 0.003);
    assert.equal(canonical(repaired.source), authoredBeforeRuntime, "runtime mutated repaired authored source");
  } finally {
    completeRuntime.dispose();
  }

  assert.equal(workspace.undo(), true, "retarget undo missing");
  assert.equal(workspace.undo(), true, "rebind undo missing");
  assert.equal(workspace.undo(), true, "replacement Matter undo missing");
  assert.deepEqual(workspace.snapshot().source, orphaned.source, "three exact undos did not restore orphaned authored checkpoint");
  assert.equal(workspace.redo(), true);
  assert.equal(workspace.redo(), true);
  assert.equal(workspace.redo(), true);
  assert.deepEqual(workspace.snapshot().source, repaired.source, "three redos did not restore repaired authored checkpoint");
});

test("R1 conflict: runtime omits ambiguous seam instead of choosing a Bearing for the Owner", async () => {
  const workspace = new FreedomWorkspace(createFreedomStarterSource());
  const leftA = workspace.addBearing(
    { cellId: "starter:a", face: "x+" },
    { cellId: "starter:b", face: "x-" },
    "z",
  );
  const leftB = workspace.addBearing(
    { cellId: "starter:a", face: "x+" },
    { cellId: "starter:b", face: "x-" },
    "y",
  );
  const right = workspace.addBearing(
    { cellId: "starter:b", face: "x+" },
    { cellId: "starter:c", face: "x-" },
    "z",
  );
  const conflictedTorque = workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, 70);
  workspace.addTorquePatch({ cellId: "starter:c", face: "x-" }, -20);
  const snapshot = workspace.snapshot();
  const authoredBefore = canonical(snapshot.source);

  const runtime = await createAuthorityRuntime(snapshot.source, snapshot.generation);
  try {
    assert.equal(runtime.receipt.quality, "PARTIAL");
    assert.equal(runtime.receipt.bodyCount, 2);
    assert.equal(runtime.receipt.jointCount, 1);
    assert.equal(runtime.receipt.torqueCount, 1);
    assert.equal(runtime.receipt.diagnostics.some((entry) => entry.sourceId === leftA && entry.code === "DUPLICATE_SEAM"), true);
    assert.equal(runtime.receipt.diagnostics.some((entry) => entry.sourceId === leftB && entry.code === "DUPLICATE_SEAM"), true);
    assert.equal(runtime.receipt.diagnostics.some((entry) => entry.sourceId === conflictedTorque && entry.code === "UNRESOLVED_TARGET"), true);
    runtime.setForcesEnabled(true);
    runtime.step(60);
    assert.ok(Math.abs(runtime.relativeAngularSpeedRadps(right)) > 0.05, "unrelated seam was blocked by ambiguous authored seam");
    assert.ok(maxValue(runtime.anchorErrorsM()) < 0.003);
    assert.equal(canonical(snapshot.source), authoredBefore, "conflict handling rewrote authored intent");
  } finally {
    runtime.dispose();
  }
});

test("R1 MATTER_ONLY remains a runnable observation when every authored meaning is unresolved", async () => {
  const workspace = new FreedomWorkspace(createFreedomStarterSource());
  const badBearing = workspace.addBearing(
    { cellId: "missing", face: "x+" },
    { cellId: "starter:a", face: "x-" },
    "z",
  );
  const badTorque = workspace.addTorquePatch({ cellId: "starter:a", face: "y+" }, 100);
  const snapshot = workspace.snapshot();
  const authoredBefore = canonical(snapshot.source);

  const runtime = await createAuthorityRuntime(snapshot.source, snapshot.generation);
  try {
    assert.equal(runtime.receipt.quality, "MATTER_ONLY");
    assert.equal(runtime.receipt.bodyCount, 1);
    assert.equal(runtime.receipt.jointCount, 0);
    assert.equal(runtime.receipt.torqueCount, 0);
    assert.equal(runtime.receipt.diagnostics.some((entry) => entry.sourceId === badBearing && entry.code === "INVALID_LOCALITY"), true);
    assert.equal(runtime.receipt.diagnostics.some((entry) => entry.sourceId === badTorque && entry.code === "UNRESOLVED_TARGET"), true);
    runtime.step(10);
    assert.equal(runtime.snapshots().length, 1);
    assert.equal(canonical(snapshot.source), authoredBefore);
  } finally {
    runtime.dispose();
  }
});
