import test from "node:test";
import assert from "node:assert/strict";
import { realizeFreedomSource } from "../.test-build/src/studio-recovery/realize.js";
import {
  FreedomWorkspace,
  createFreedomStarterSource,
} from "../.test-build/src/studio-recovery/source.js";

function twoBearingWorld() {
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
  return { workspace, first, second };
}

test("OWNER-AUTHORITY exact Bearing delete preserves dependent authored Torque and RUN degrades locally", () => {
  const { workspace, first, second } = twoBearingWorld();
  const orphanedTorque = workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, 100);
  const liveTorque = workspace.addTorquePatch({ cellId: "starter:c", face: "x-" }, -30);
  const beforeDelete = workspace.snapshot();

  const receipt = workspace.removeBearing(first);
  const afterDelete = workspace.snapshot();
  assert.deepEqual(receipt, {
    removedMatterIds: [],
    removedBearingIds: [first],
    removedTorquePatchIds: [],
  });
  assert.equal(afterDelete.generation, beforeDelete.generation + 1, "exact delete must be one authored transaction");
  assert.equal(afterDelete.source.bearings.some((bearing) => bearing.id === first), false);
  assert.equal(afterDelete.source.bearings.some((bearing) => bearing.id === second), true);
  assert.equal(afterDelete.source.torquePatches.some((patch) => patch.id === orphanedTorque), true);
  assert.equal(afterDelete.source.torquePatches.some((patch) => patch.id === liveTorque), true);

  const partial = realizeFreedomSource(afterDelete.source);
  assert.equal(partial.quality, "PARTIAL");
  assert.deepEqual(partial.bearings.map((bearing) => bearing.sourceBearingId), [second]);
  assert.deepEqual(partial.torques.map((torque) => torque.sourcePatchId), [liveTorque]);
  assert.equal(
    partial.diagnostics.some((entry) => entry.sourceId === orphanedTorque && entry.code === "UNRESOLVED_TARGET"),
    true,
  );

  assert.equal(workspace.undo(), true);
  const restored = workspace.snapshot();
  assert.deepEqual(restored.source, beforeDelete.source, "Undo must restore exactly the pre-delete authored world");
});

test("OWNER-AUTHORITY exact Matter delete preserves orphaned meanings while unrelated realization remains live", () => {
  const { workspace, first, second } = twoBearingWorld();
  const orphanedTorque = workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, 75);
  const liveTorque = workspace.addTorquePatch({ cellId: "starter:c", face: "x-" }, -30);

  const receipt = workspace.removeMatter("starter:a");
  const after = workspace.snapshot();
  assert.deepEqual(receipt, {
    removedMatterIds: ["starter:a"],
    removedBearingIds: [],
    removedTorquePatchIds: [],
  });
  assert.equal(after.source.bearings.some((bearing) => bearing.id === first), true);
  assert.equal(after.source.bearings.some((bearing) => bearing.id === second), true);
  assert.equal(after.source.torquePatches.some((patch) => patch.id === orphanedTorque), true);
  assert.equal(after.source.torquePatches.some((patch) => patch.id === liveTorque), true);

  const plan = realizeFreedomSource(after.source);
  assert.equal(plan.quality, "PARTIAL");
  assert.deepEqual(plan.bearings.map((bearing) => bearing.sourceBearingId), [second]);
  assert.deepEqual(plan.torques.map((torque) => torque.sourcePatchId), [liveTorque]);
  assert.equal(plan.diagnostics.some((entry) => entry.sourceId === first && entry.code === "INVALID_LOCALITY"), true);
  assert.equal(plan.diagnostics.some((entry) => entry.sourceId === orphanedTorque && entry.code === "UNRESOLVED_TARGET"), true);
});

test("OWNER-AUTHORITY orphaned intent can be rebound and retargeted without replacing its authored identity", () => {
  const { workspace, first } = twoBearingWorld();
  const torque = workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, 55);
  workspace.removeMatter("starter:a");

  const [newCell] = workspace.extrudeMatterFromFace("starter:c", "x+", 1);
  assert.ok(newCell);
  workspace.rebindBearing(
    first,
    { cellId: "starter:c", face: "x+" },
    { cellId: newCell, face: "x-" },
    "y",
  );
  workspace.retargetTorquePatch(torque, { cellId: "starter:c", face: "x+" });

  const repaired = workspace.snapshot();
  const bearing = repaired.source.bearings.find((candidate) => candidate.id === first);
  const patch = repaired.source.torquePatches.find((candidate) => candidate.id === torque);
  assert.ok(bearing);
  assert.ok(patch);
  assert.equal(bearing.id, first);
  assert.equal(bearing.freeAxis, "y");
  assert.equal(patch.id, torque);

  const plan = realizeFreedomSource(repaired.source);
  assert.equal(plan.quality, "COMPLETE");
  assert.equal(plan.bearings.some((candidate) => candidate.sourceBearingId === first), true);
  assert.equal(plan.torques.some((candidate) => candidate.sourcePatchId === torque), true);
});

test("OWNER-AUTHORITY destructive cascade exists only as an explicit separate Bearing operation", () => {
  const { workspace, first, second } = twoBearingWorld();
  const firstTorque = workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, 75);
  const secondTorque = workspace.addTorquePatch({ cellId: "starter:c", face: "x-" }, -30);
  const before = workspace.snapshot();

  const receipt = workspace.removeBearingWithDependents(first);
  const after = workspace.snapshot();
  assert.deepEqual(receipt.removedBearingIds, [first]);
  assert.deepEqual(receipt.removedTorquePatchIds, [firstTorque]);
  assert.equal(after.source.bearings.some((bearing) => bearing.id === second), true);
  assert.equal(after.source.torquePatches.some((patch) => patch.id === secondTorque), true);

  assert.equal(workspace.undo(), true);
  assert.deepEqual(workspace.snapshot().source, before.source);
});

test("OWNER-AUTHORITY destructive cascade exists only as an explicit separate Matter operation", () => {
  const { workspace, first, second } = twoBearingWorld();
  const firstTorque = workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, 75);
  const secondTorque = workspace.addTorquePatch({ cellId: "starter:c", face: "x-" }, -30);

  const receipt = workspace.removeMatterWithDependents("starter:a");
  const after = workspace.snapshot();
  assert.deepEqual(receipt.removedMatterIds, ["starter:a"]);
  assert.deepEqual(receipt.removedBearingIds, [first]);
  assert.deepEqual(receipt.removedTorquePatchIds, [firstTorque]);
  assert.equal(after.source.bearings.some((bearing) => bearing.id === second), true);
  assert.equal(after.source.torquePatches.some((patch) => patch.id === secondTorque), true);
});

test("OWNER-AUTHORITY authored source still accepts multiple Bearings and multiple TorquePatches without permission gates", () => {
  const { workspace, first, second } = twoBearingWorld();
  const torqueA = workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, 20);
  const torqueB = workspace.addTorquePatch({ cellId: "starter:b", face: "x+" }, 40);
  const torqueC = workspace.addTorquePatch({ cellId: "starter:c", face: "x-" }, -10);
  const snapshot = workspace.snapshot();

  assert.deepEqual(snapshot.source.bearings.map((bearing) => bearing.id), [first, second]);
  assert.deepEqual(snapshot.source.torquePatches.map((patch) => patch.id), [torqueA, torqueB, torqueC]);
  assert.equal(snapshot.generation, 5);
});

test("OWNER-AUTHORITY ordinary authoring remains reversible rather than preventively gated", () => {
  const workspace = new FreedomWorkspace(createFreedomStarterSource());
  const added = workspace.addMatterFromFace("starter:c", "x+");
  assert.equal(workspace.snapshot().source.matter.cells.some((cell) => cell.id === added), true);
  assert.equal(workspace.undo(), true);
  assert.equal(workspace.snapshot().source.matter.cells.some((cell) => cell.id === added), false);
  assert.equal(workspace.redo(), true);
  assert.equal(workspace.snapshot().source.matter.cells.some((cell) => cell.id === added), true);
});
