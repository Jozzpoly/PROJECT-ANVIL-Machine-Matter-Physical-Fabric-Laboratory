import test from "node:test";
import assert from "node:assert/strict";
import {
  StudioWorkspace,
  createEditableStarterSource,
  createEmptyStudioSource,
  previewAddMatterFromFace,
  previewRemoveMatter,
} from "../.test-build/src/studio/workspace.js";
import {
  parseStudioSource,
  serializeStudioSource,
} from "../.test-build/src/studio/storage.js";

test("Studio Matter draft previews remain source-neutral and commits advance generation once", () => {
  const source = createEditableStarterSource();
  const before = JSON.stringify(source);
  const preview = previewAddMatterFromFace(source, "starter:b3", "x+", "studio:alloy");
  assert.deepEqual(preview.grid, { x: 3, y: 0, z: 0 });
  assert.equal(JSON.stringify(source), before, "preview mutated authored source");

  let nextId = 0;
  const workspace = new StudioWorkspace(source, () => `cell:test:${++nextId}`);
  const addedId = workspace.commitAddMatterFromFace("starter:b3", "x+", "studio:alloy");
  let snapshot = workspace.snapshot();
  assert.equal(addedId, "cell:test:1");
  assert.equal(snapshot.sourceGeneration, 1);
  assert.equal(snapshot.source.matter.cells.length, source.matter.cells.length + 1);
  assert.equal(snapshot.dirty, true);
  assert.equal(snapshot.canUndo, true);
  assert.equal(snapshot.canRedo, false);

  assert.equal(workspace.undo(), true);
  snapshot = workspace.snapshot();
  assert.equal(snapshot.sourceGeneration, 2);
  assert.deepEqual(snapshot.source, source);
  assert.equal(snapshot.dirty, false);
  assert.equal(snapshot.canRedo, true);

  assert.equal(workspace.redo(), true);
  snapshot = workspace.snapshot();
  assert.equal(snapshot.sourceGeneration, 3);
  assert.equal(snapshot.source.matter.cells.length, source.matter.cells.length + 1);
  assert.equal(snapshot.dirty, true);
});

test("Studio empty workspace can seed one first cell without inventing a second authoring mode", () => {
  let ids = 0;
  const workspace = new StudioWorkspace(createEmptyStudioSource(), () => `seed:${++ids}`);
  const cellId = workspace.commitSeedMatter("studio:alloy");
  const snapshot = workspace.snapshot();
  assert.equal(cellId, "seed:1");
  assert.equal(snapshot.sourceGeneration, 1);
  assert.deepEqual(snapshot.source.matter.cells[0]?.grid, { x: 0, y: 0, z: 0 });
  assert.throws(() => workspace.commitSeedMatter("studio:alloy"), /only available in an empty workspace/u);
});

test("Studio Remove preserves dependent local meaning as dangling authored intent", () => {
  const source = createEditableStarterSource();
  const preview = previewRemoveMatter(source, "starter:a2");
  assert.deepEqual(preview.dependentBearingIds, ["bearing:starter-seam"]);
  assert.deepEqual(preview.dependentTorquePatchIds, ["torque-patch:starter-seam"]);

  const workspace = new StudioWorkspace(source);
  workspace.commitRemoveMatter("starter:a2");
  const snapshot = workspace.snapshot();
  assert.equal(snapshot.source.matter.cells.some((cell) => cell.id === "starter:a2"), false);
  assert.equal(snapshot.source.bearings.length, 1, "Remove silently deleted Bearing intent");
  assert.equal(snapshot.source.torquePatches.length, 1, "Remove silently deleted TorquePatch intent");
  assert.equal(snapshot.source.bearings[0]?.endpointA.cellId, "starter:a2");
  assert.equal(snapshot.source.torquePatches[0]?.target.cellId, "starter:a2");
});

test("Studio material assignment is authored history and Save/Open persists source only", () => {
  const source = createEditableStarterSource();
  const primaryMaterial = source.matter.materials[0];
  const secondMaterial = source.matter.materials[1];
  assert.ok(primaryMaterial !== undefined && secondMaterial !== undefined, "Studio starter must expose a real material choice");
  assert.equal(secondMaterial.densityKgM3, primaryMaterial.densityKgM3, "v0 material choice invented a new density claim");
  assert.equal(secondMaterial.friction, primaryMaterial.friction, "v0 material choice invented a new friction claim");
  assert.notEqual(secondMaterial.displayColor, primaryMaterial.displayColor, "material choice has no visible authored consequence");

  const workspace = new StudioWorkspace(source);
  workspace.commitAssignMaterial("starter:b3", secondMaterial.id);
  let snapshot = workspace.snapshot();
  assert.equal(snapshot.sourceGeneration, 1);
  assert.equal(snapshot.source.matter.cells.find((cell) => cell.id === "starter:b3")?.materialId, secondMaterial.id);

  const serialized = serializeStudioSource(snapshot.source);
  assert.equal(serialized.includes("runtimeSession"), false);
  assert.equal(serialized.includes("body:"), false);
  const reopened = parseStudioSource(serialized);
  assert.deepEqual(reopened, snapshot.source);

  workspace.markSaved();
  snapshot = workspace.snapshot();
  assert.equal(snapshot.dirty, false);
});

test("Studio reopened workspace continues authoring with fresh persistent cell identity", () => {
  const workspace = new StudioWorkspace(createEditableStarterSource());
  const firstId = workspace.commitAddMatterFromFace("starter:b3", "x+", "studio:alloy");
  assert.equal(firstId, "studio-cell:1");

  const reopenedSource = parseStudioSource(serializeStudioSource(workspace.snapshot().source));
  const reopened = new StudioWorkspace(reopenedSource);
  const secondId = reopened.commitAddMatterFromFace(firstId, "x+", "studio:alloy");
  assert.equal(secondId, "studio-cell:2");
  const ids = reopened.snapshot().source.matter.cells.map((cell) => cell.id);
  assert.equal(new Set(ids).size, ids.length, "reopen reused an existing authored cell identity");
});

test("Studio new Matter identity never captures a dangling local-meaning target after reopen", () => {
  const source = createEmptyStudioSource();
  const dangling = {
    ...source,
    bearings: [
      {
        id: "bearing:dangling",
        endpointA: { cellId: "studio-cell:1", face: "x+" },
        endpointB: { cellId: "missing-peer", face: "x-" },
        freeAxis: "z",
      },
    ],
  };
  const workspace = new StudioWorkspace(dangling);
  const cellId = workspace.commitSeedMatter("studio:alloy");
  assert.equal(cellId, "studio-cell:2", "fresh Matter accidentally rebound dangling authored meaning");
});

test("Studio parser fails closed on malformed structure but preserves structurally valid dangling intent", () => {
  const source = createEditableStarterSource();
  const dangling = {
    ...source,
    matter: {
      ...source.matter,
      cells: source.matter.cells.filter((cell) => cell.id !== "starter:a2"),
    },
  };
  assert.deepEqual(parseStudioSource(serializeStudioSource(dangling)), dangling);
  assert.throws(() => parseStudioSource("not json"), /not valid JSON/u);
  assert.throws(() => parseStudioSource(JSON.stringify({ schema: "future" })), /Unsupported Studio workspace schema/u);
});
