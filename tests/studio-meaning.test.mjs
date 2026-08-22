import test from "node:test";
import assert from "node:assert/strict";
import {
  StudioWorkspace,
  createEditableStarterSource,
} from "../.test-build/src/studio/workspace.js";
import { classifyStudioSource } from "../.test-build/src/studio/compile.js";
import { assertTorquePatchBindingCurrent } from "../.test-build/src/experiments/anvil-10-torque-patch-rebind.js";

function issueCodes(classification) {
  return classification.issues.map((entry) => entry.code);
}

test("Studio starter classifies as one current READY active-bearing composition", () => {
  const source = createEditableStarterSource();
  const result = classifyStudioSource(source, 12);

  assert.equal(result.sourceGeneration, 12);
  assert.equal(result.authoredValidity, "VALID");
  assert.equal(result.compositionSupport, "SUPPORTED");
  assert.equal(result.runReadiness, "READY");
  assert.deepEqual(result.issues, []);
  assert.equal(result.bearings.length, 1);
  assert.equal(result.torquePatches.length, 1);
  assert.equal(result.bearings[0]?.sourceId, source.bearings[0]?.id);
  assert.equal(result.torquePatches[0]?.compilation.resolvedBearingId, source.bearings[0]?.id);
  assert.doesNotThrow(() => assertTorquePatchBindingCurrent(result.torquePatches[0].compilation));
});

test("Studio Matter-only source remains valid supported construction but is not RUN-ready", () => {
  const starter = createEditableStarterSource();
  const source = { ...starter, bearings: [], torquePatches: [] };
  const result = classifyStudioSource(source);

  assert.equal(result.authoredValidity, "VALID");
  assert.equal(result.compositionSupport, "SUPPORTED");
  assert.equal(result.runReadiness, "INCOMPLETE");
  assert.deepEqual(result.issues, []);
});

test("Studio meaning-only authored transactions advance generation without rewriting Matter revision", () => {
  const source = createEditableStarterSource();
  const originalRevision = source.matter.revision;
  const originalPatch = source.torquePatches[0];
  assert.ok(originalPatch !== undefined);

  const workspace = new StudioWorkspace(source);
  workspace.commitEditTorquePatch(originalPatch.id, originalPatch.target, 135);
  let snapshot = workspace.snapshot();
  assert.equal(snapshot.sourceGeneration, 1);
  assert.equal(snapshot.source.matter.revision, originalRevision);
  assert.equal(snapshot.source.torquePatches[0]?.effortNm, 135);

  assert.equal(workspace.undo(), true);
  snapshot = workspace.snapshot();
  assert.equal(snapshot.sourceGeneration, 2);
  assert.equal(snapshot.source.matter.revision, originalRevision);
  assert.equal(snapshot.source.torquePatches[0]?.effortNm, originalPatch.effortNm);

  const bearingId = workspace.commitAddBearing(
    { cellId: "starter:b1", face: "x+" },
    { cellId: "starter:b3", face: "x-" },
    "z",
  );
  snapshot = workspace.snapshot();
  assert.equal(snapshot.sourceGeneration, 3);
  assert.equal(snapshot.source.matter.revision, originalRevision);
  assert.equal(bearingId, "studio-bearing:1");

  workspace.commitRemoveBearing(source.bearings[0].id);
  snapshot = workspace.snapshot();
  assert.equal(snapshot.sourceGeneration, 4);
  assert.equal(snapshot.source.torquePatches.length, 1, "removing Bearing silently deleted TorquePatch intent");
});

test("Studio local meaning IDs remain fresh after reopen-style reconstruction", () => {
  const source = createEditableStarterSource();
  const withOwnedIds = {
    ...source,
    bearings: [
      ...source.bearings,
      {
        id: "studio-bearing:1",
        endpointA: { cellId: "starter:b1", face: "x+" },
        endpointB: { cellId: "starter:b3", face: "x-" },
        freeAxis: "z",
      },
    ],
    torquePatches: [
      ...source.torquePatches,
      {
        id: "studio-torque-patch:1",
        target: { cellId: "starter:b0", face: "x-" },
        effortNm: 25,
      },
    ],
  };
  const workspace = new StudioWorkspace(withOwnedIds);
  const bearingId = workspace.commitAddBearing(
    { cellId: "starter:a0", face: "y+" },
    { cellId: "starter:a1", face: "y-" },
    "z",
  );
  const patchId = workspace.commitAddTorquePatch({ cellId: "starter:a2", face: "x+" }, 15);
  assert.equal(bearingId, "studio-bearing:2");
  assert.equal(patchId, "studio-torque-patch:2");
});

test("Studio dangling local meaning is INVALID while authored intent survives", () => {
  const source = createEditableStarterSource();
  const dangling = {
    ...source,
    matter: {
      ...source.matter,
      cells: source.matter.cells.filter((cell) => cell.id !== "starter:a2"),
    },
  };
  const result = classifyStudioSource(dangling);

  assert.equal(result.authoredValidity, "INVALID");
  assert.equal(result.compositionSupport, "SUPPORTED");
  assert.equal(result.runReadiness, "INCOMPLETE");
  assert.ok(issueCodes(result).includes("BEARING_INVALID"));
  assert.ok(issueCodes(result).includes("TORQUE_PATCH_INVALID"));
  assert.equal(dangling.bearings.length, 1);
  assert.equal(dangling.torquePatches.length, 1);
});

test("Studio maps an alternate rigid Bearing bypass to UNSUPPORTED rather than INVALID", () => {
  const source = createEditableStarterSource();
  const materialId = source.matter.materials[0].id;
  const bypass = {
    ...source,
    matter: {
      ...source.matter,
      cells: [
        ...source.matter.cells,
        { id: "bypass:0", grid: { x: -1, y: 1, z: 0 }, materialId },
        { id: "bypass:1", grid: { x: 0, y: 1, z: 0 }, materialId },
      ],
    },
  };
  const result = classifyStudioSource(bypass);

  assert.equal(result.authoredValidity, "VALID");
  assert.equal(result.compositionSupport, "UNSUPPORTED");
  assert.equal(result.runReadiness, "INCOMPLETE");
  assert.ok(issueCodes(result).includes("BEARING_TOPOLOGY_NOT_QUALIFIED"));
  assert.ok(!issueCodes(result).includes("BEARING_INVALID"));
});

test("Studio preserves a second independently valid Bearing as unsupported composition", () => {
  const source = createEditableStarterSource();
  const secondBearing = {
    id: "bearing:second",
    endpointA: { cellId: "starter:b1", face: "x+" },
    endpointB: { cellId: "starter:b3", face: "x-" },
    freeAxis: "z",
  };
  const composed = { ...source, bearings: [...source.bearings, secondBearing] };
  const result = classifyStudioSource(composed);

  assert.equal(result.authoredValidity, "VALID");
  assert.equal(result.compositionSupport, "UNSUPPORTED");
  assert.equal(result.runReadiness, "INCOMPLETE");
  assert.equal(result.bearings.length, 2);
  assert.ok(issueCodes(result).includes("MULTI_BEARING_NOT_QUALIFIED"));
  assert.equal(composed.bearings.length, 2);
});

test("Studio preserves a second valid TorquePatch and classifies joint action unsupported", () => {
  const source = createEditableStarterSource();
  const secondPatch = {
    id: "torque-patch:second",
    target: { cellId: "starter:b0", face: "x-" },
    effortNm: -40,
  };
  const composed = { ...source, torquePatches: [...source.torquePatches, secondPatch] };
  const result = classifyStudioSource(composed);

  assert.equal(result.authoredValidity, "VALID");
  assert.equal(result.compositionSupport, "UNSUPPORTED");
  assert.equal(result.runReadiness, "INCOMPLETE");
  assert.equal(result.torquePatches.length, 2);
  assert.ok(issueCodes(result).includes("MULTI_TORQUE_PATCH_NOT_QUALIFIED"));
  assert.equal(composed.torquePatches.length, 2);
});

test("Studio rejects an illegal Bearing normal axis as authored INVALID", () => {
  const source = createEditableStarterSource();
  const invalid = {
    ...source,
    bearings: source.bearings.map((bearing) => ({ ...bearing, freeAxis: "x" })),
  };
  const result = classifyStudioSource(invalid);

  assert.equal(result.authoredValidity, "INVALID");
  assert.equal(result.runReadiness, "INCOMPLETE");
  assert.ok(issueCodes(result).includes("BEARING_INVALID"));
});
