import test from "node:test";
import assert from "node:assert/strict";
import { FreedomWorkspace, createFreedomStarterSource } from "../.test-build/src/studio-recovery/source.js";

test("FREEDOM-FIRST Matter extrusion adds a whole run in one authored transaction", () => {
  const workspace = new FreedomWorkspace(createFreedomStarterSource());
  const before = workspace.snapshot();
  const ids = workspace.extrudeMatterFromFace("starter:c", "x+", 5);
  const after = workspace.snapshot();
  assert.equal(ids.length, 5);
  assert.equal(after.generation, before.generation + 1);
  assert.equal(after.source.matter.cells.length, before.source.matter.cells.length + 5);
  assert.deepEqual(
    after.source.matter.cells.filter((cell) => ids.includes(cell.id)).map((cell) => cell.grid.x),
    [2, 3, 4, 5, 6],
  );

  assert.equal(workspace.undo(), true);
  const undone = workspace.snapshot();
  assert.equal(undone.source.matter.cells.length, before.source.matter.cells.length);
  assert.equal(ids.some((id) => undone.source.matter.cells.some((cell) => cell.id === id)), false);

  assert.equal(workspace.redo(), true);
  const redone = workspace.snapshot();
  assert.equal(ids.every((id) => redone.source.matter.cells.some((cell) => cell.id === id)), true);
});

test("FREEDOM-FIRST extrusion stops at existing Matter instead of rejecting the whole gesture", () => {
  const source = createFreedomStarterSource();
  const materialId = source.matter.materials[0].id;
  const withObstacle = {
    ...source,
    matter: {
      ...source.matter,
      cells: [...source.matter.cells, { id: "obstacle", grid: { x: 4, y: 0, z: 0 }, materialId }],
    },
  };
  const workspace = new FreedomWorkspace(withObstacle);
  const ids = workspace.extrudeMatterFromFace("starter:c", "x+", 8);
  const snapshot = workspace.snapshot();
  assert.equal(ids.length, 2);
  assert.deepEqual(
    snapshot.source.matter.cells.filter((cell) => ids.includes(cell.id)).map((cell) => cell.grid.x),
    [2, 3],
  );
  assert.equal(snapshot.source.matter.cells.some((cell) => cell.id === "obstacle" && cell.grid.x === 4), true);
});

test("FREEDOM-FIRST blocked first extrusion step is a harmless no-op, not a permission failure", () => {
  const workspace = new FreedomWorkspace(createFreedomStarterSource());
  const before = workspace.snapshot();
  const ids = workspace.extrudeMatterFromFace("starter:b", "x+", 10);
  const after = workspace.snapshot();
  assert.deepEqual(ids, []);
  assert.equal(after.generation, before.generation);
  assert.deepEqual(after.source, before.source);
});
