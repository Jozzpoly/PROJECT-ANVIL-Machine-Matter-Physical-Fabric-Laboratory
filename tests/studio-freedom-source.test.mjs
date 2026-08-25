import test from "node:test";
import assert from "node:assert/strict";
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

test("FREEDOM-FIRST removing a Bearing cannot strand hidden dependent Torque debt", () => {
  const { workspace, first } = twoBearingWorld();
  const patch = workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, 100);
  const before = workspace.snapshot();
  assert.equal(before.source.bearings.length, 2);
  assert.equal(before.source.torquePatches.length, 1);

  const receipt = workspace.removeBearing(first);
  const after = workspace.snapshot();
  assert.deepEqual(receipt.removedBearingIds, [first]);
  assert.deepEqual(receipt.removedTorquePatchIds, [patch]);
  assert.equal(after.source.bearings.length, 1);
  assert.equal(after.source.torquePatches.length, 0);

  assert.equal(workspace.undo(), true);
  const restored = workspace.snapshot();
  assert.equal(restored.source.bearings.length, 2);
  assert.equal(restored.source.torquePatches.length, 1);
  assert.equal(restored.source.torquePatches[0].id, patch);
});

test("FREEDOM-FIRST removing Matter cascades only meanings that lost their local referent", () => {
  const { workspace, first, second } = twoBearingWorld();
  const firstTorque = workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, 75);
  const secondTorque = workspace.addTorquePatch({ cellId: "starter:c", face: "x-" }, -30);

  const receipt = workspace.removeMatter("starter:a");
  const after = workspace.snapshot();
  assert.deepEqual(receipt.removedMatterIds, ["starter:a"]);
  assert.deepEqual(receipt.removedBearingIds, [first]);
  assert.deepEqual(receipt.removedTorquePatchIds, [firstTorque]);
  assert.equal(after.source.bearings.some((bearing) => bearing.id === first), false);
  assert.equal(after.source.bearings.some((bearing) => bearing.id === second), true);
  assert.equal(after.source.torquePatches.some((patch) => patch.id === firstTorque), false);
  assert.equal(after.source.torquePatches.some((patch) => patch.id === secondTorque), true);
});

test("FREEDOM-FIRST authored source accepts multiple Bearings and multiple TorquePatches without permission gates", () => {
  const { workspace, first, second } = twoBearingWorld();
  const torqueA = workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, 20);
  const torqueB = workspace.addTorquePatch({ cellId: "starter:b", face: "x+" }, 40);
  const torqueC = workspace.addTorquePatch({ cellId: "starter:c", face: "x-" }, -10);
  const snapshot = workspace.snapshot();

  assert.deepEqual(snapshot.source.bearings.map((bearing) => bearing.id), [first, second]);
  assert.deepEqual(snapshot.source.torquePatches.map((patch) => patch.id), [torqueA, torqueB, torqueC]);
  assert.equal(snapshot.generation, 5);
});

test("FREEDOM-FIRST authoring transactions remain reversible rather than preventively gated", () => {
  const workspace = new FreedomWorkspace(createFreedomStarterSource());
  const added = workspace.addMatterFromFace("starter:c", "x+");
  assert.equal(workspace.snapshot().source.matter.cells.some((cell) => cell.id === added), true);
  assert.equal(workspace.undo(), true);
  assert.equal(workspace.snapshot().source.matter.cells.some((cell) => cell.id === added), false);
  assert.equal(workspace.redo(), true);
  assert.equal(workspace.snapshot().source.matter.cells.some((cell) => cell.id === added), true);
});
