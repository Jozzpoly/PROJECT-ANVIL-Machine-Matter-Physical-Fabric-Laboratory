import test from "node:test";
import assert from "node:assert/strict";
import { FreedomRuntimeSession } from "../.test-build/src/studio-recovery/runtime.js";
import { realizeFreedomSource } from "../.test-build/src/studio-recovery/realize.js";
import { FreedomWorkspace, createEmptyFreedomSource, createFreedomStarterSource } from "../.test-build/src/studio-recovery/source.js";

test("R1 duplicate Torque IDs remain authored but are not applied under ambiguous provenance", async () => {
  const starter = createFreedomStarterSource();
  const source = {
    ...starter,
    bearings: [
      {
        id: "bearing:left",
        endpointA: { cellId: "starter:a", face: "x+" },
        endpointB: { cellId: "starter:b", face: "x-" },
        freeAxis: "z",
      },
    ],
    torquePatches: [
      { id: "torque:duplicate", target: { cellId: "starter:a", face: "x+" }, effortNm: 10 },
      { id: "torque:duplicate", target: { cellId: "starter:a", face: "x+" }, effortNm: 90 },
      { id: "torque:independent", target: { cellId: "starter:b", face: "x-" }, effortNm: -15 },
    ],
  };

  const plan = realizeFreedomSource(source);
  assert.equal(source.torquePatches.length, 3, "realization mutated ambiguous authored source");
  assert.equal(plan.quality, "PARTIAL");
  assert.equal(plan.bearings.length, 1);
  assert.deepEqual(plan.torques.map((torque) => torque.sourcePatchId), ["torque:independent"]);
  assert.equal(
    plan.diagnostics.filter((entry) => entry.subject === "TORQUE" && entry.sourceId === "torque:duplicate" && entry.code === "DUPLICATE_ID").length,
    2,
  );

  const runtime = await FreedomRuntimeSession.create(source, 0);
  try {
    assert.equal(runtime.receipt.quality, "PARTIAL");
    assert.equal(runtime.receipt.jointCount, 1);
    assert.equal(runtime.receipt.torqueCount, 1);
    runtime.setForcesEnabled(true);
    runtime.step(30);
  } finally {
    runtime.dispose();
  }
});

test("R1 duplicate Bearing IDs are all omitted rather than selecting one identity instance", () => {
  const starter = createFreedomStarterSource();
  const source = {
    ...starter,
    bearings: [
      {
        id: "bearing:duplicate",
        endpointA: { cellId: "starter:a", face: "x+" },
        endpointB: { cellId: "starter:b", face: "x-" },
        freeAxis: "z",
      },
      {
        id: "bearing:duplicate",
        endpointA: { cellId: "starter:b", face: "x+" },
        endpointB: { cellId: "starter:c", face: "x-" },
        freeAxis: "z",
      },
    ],
    torquePatches: [],
  };

  const plan = realizeFreedomSource(source);
  assert.equal(source.bearings.length, 2);
  assert.equal(plan.quality, "MATTER_ONLY");
  assert.equal(plan.bearings.length, 0);
  assert.equal(
    plan.diagnostics.filter((entry) => entry.subject === "BEARING" && entry.sourceId === "bearing:duplicate" && entry.code === "DUPLICATE_ID").length,
    2,
  );
});

test("R2 authored IDs are never reincarnated after exact delete within one workspace", () => {
  const workspace = new FreedomWorkspace(createEmptyFreedomSource());

  const firstMatterId = workspace.addSeedMatter();
  workspace.removeMatter(firstMatterId);
  const secondMatterId = workspace.addSeedMatter();
  assert.notEqual(secondMatterId, firstMatterId, "new Matter reincarnated a deleted authored identity");

  const neighborId = workspace.addMatterFromFace(secondMatterId, "x+");
  const firstBearingId = workspace.addBearing(
    { cellId: secondMatterId, face: "x+" },
    { cellId: neighborId, face: "x-" },
    "z",
  );
  workspace.removeBearing(firstBearingId);
  const secondBearingId = workspace.addBearing(
    { cellId: secondMatterId, face: "x+" },
    { cellId: neighborId, face: "x-" },
    "z",
  );
  assert.notEqual(secondBearingId, firstBearingId, "new Bearing reincarnated a deleted authored identity");

  const firstTorqueId = workspace.addTorquePatch({ cellId: secondMatterId, face: "x+" }, 10);
  workspace.removeTorquePatch(firstTorqueId);
  const secondTorqueId = workspace.addTorquePatch({ cellId: secondMatterId, face: "x+" }, 20);
  assert.notEqual(secondTorqueId, firstTorqueId, "new Torque reincarnated a deleted authored identity");

  workspace.undo();
  workspace.redo();
  workspace.removeTorquePatch(secondTorqueId);
  const thirdTorqueId = workspace.addTorquePatch({ cellId: secondMatterId, face: "x+" }, 30);
  assert.notEqual(thirdTorqueId, firstTorqueId);
  assert.notEqual(thirdTorqueId, secondTorqueId, "Undo/Redo rewound the identity allocator");
});
