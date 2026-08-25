import test from "node:test";
import assert from "node:assert/strict";
import { realizeFreedomSource } from "../.test-build/src/studio-recovery/realize.js";
import { createFreedomStarterSource } from "../.test-build/src/studio-recovery/source.js";

function withMeanings({ badBearing = false, badTorque = false, duplicateSeam = false } = {}) {
  const source = createFreedomStarterSource();
  const bearings = [
    {
      id: "bearing:left",
      endpointA: { cellId: "starter:a", face: "x+" },
      endpointB: { cellId: "starter:b", face: "x-" },
      freeAxis: "z",
    },
    {
      id: "bearing:right",
      endpointA: { cellId: "starter:b", face: "x+" },
      endpointB: { cellId: "starter:c", face: "x-" },
      freeAxis: "z",
    },
  ];
  if (badBearing) {
    bearings.push({
      id: "bearing:bad",
      endpointA: { cellId: "missing", face: "x+" },
      endpointB: { cellId: "starter:a", face: "x-" },
      freeAxis: "z",
    });
  }
  if (duplicateSeam) {
    bearings.push({
      id: "bearing:duplicate",
      endpointA: { cellId: "starter:a", face: "x+" },
      endpointB: { cellId: "starter:b", face: "x-" },
      freeAxis: "y",
    });
  }

  const torquePatches = [
    { id: "torque:left", target: { cellId: "starter:a", face: "x+" }, effortNm: 20 },
    { id: "torque:right-a", target: { cellId: "starter:b", face: "x+" }, effortNm: 40 },
    { id: "torque:right-b", target: { cellId: "starter:c", face: "x-" }, effortNm: -10 },
  ];
  if (badTorque) torquePatches.push({ id: "torque:bad", target: { cellId: "starter:a", face: "y+" }, effortNm: 100 });

  return { ...source, bearings, torquePatches };
}

test("FREEDOM-FIRST best-effort realization accepts multiple Bearings and multiple TorquePatches", () => {
  const plan = realizeFreedomSource(withMeanings());
  assert.equal(plan.quality, "COMPLETE");
  assert.equal(plan.physicalPlan.bodies.length, 3);
  assert.equal(plan.bearings.length, 2);
  assert.equal(plan.torques.length, 3);
  assert.equal(plan.diagnostics.length, 0);
  assert.deepEqual(plan.bearings.map((bearing) => bearing.sourceBearingId), ["bearing:left", "bearing:right"]);
  assert.deepEqual(plan.torques.map((torque) => torque.sourcePatchId), ["torque:left", "torque:right-a", "torque:right-b"]);
});

test("FREEDOM-FIRST one invalid local Bearing remains authored evidence but cannot globally block realizable Matter", () => {
  const source = withMeanings({ badBearing: true });
  const plan = realizeFreedomSource(source);
  assert.equal(source.bearings.length, 3, "test accidentally mutated authored source");
  assert.equal(plan.quality, "PARTIAL");
  assert.equal(plan.physicalPlan.bodies.length, 3);
  assert.equal(plan.bearings.length, 2);
  assert.equal(plan.torques.length, 3);
  assert.equal(plan.diagnostics.some((entry) => entry.sourceId === "bearing:bad" && entry.code === "INVALID_LOCALITY"), true);
});

test("FREEDOM-FIRST unresolved Torque is omitted locally while the rest of the world still realizes", () => {
  const plan = realizeFreedomSource(withMeanings({ badTorque: true }));
  assert.equal(plan.quality, "PARTIAL");
  assert.equal(plan.physicalPlan.bodies.length, 3);
  assert.equal(plan.bearings.length, 2);
  assert.equal(plan.torques.length, 3);
  assert.equal(plan.diagnostics.some((entry) => entry.sourceId === "torque:bad" && entry.code === "UNRESOLVED_TARGET"), true);
});

test("FREEDOM-FIRST conflicting Bearings on one seam are omitted locally without choosing for the Owner", () => {
  const plan = realizeFreedomSource(withMeanings({ duplicateSeam: true }));
  assert.equal(plan.quality, "PARTIAL");
  assert.equal(plan.physicalPlan.bodies.length, 2, "unrelated right seam should still be attempted");
  assert.equal(plan.bearings.length, 1);
  assert.equal(plan.bearings[0].sourceBearingId, "bearing:right");
  assert.equal(plan.diagnostics.some((entry) => entry.sourceId === "bearing:duplicate" && entry.code === "DUPLICATE_SEAM"), true);
  assert.equal(plan.diagnostics.some((entry) => entry.sourceId === "bearing:left" && entry.code === "DUPLICATE_SEAM"), true);
  assert.equal(plan.diagnostics.some((entry) => entry.sourceId === "torque:left" && entry.code === "UNRESOLVED_TARGET"), true);
});

test("FREEDOM-FIRST realization is deterministic under authored array reorder", () => {
  const source = withMeanings();
  const a = realizeFreedomSource(source);
  const b = realizeFreedomSource({
    ...source,
    matter: { ...source.matter, cells: [...source.matter.cells].reverse() },
    bearings: [...source.bearings].reverse(),
    torquePatches: [...source.torquePatches].reverse(),
  });
  assert.deepEqual(a.physicalPlan, b.physicalPlan);
  assert.deepEqual(a.bearings, b.bearings);
  assert.deepEqual(a.torques, b.torques);
  assert.deepEqual(a.diagnostics, b.diagnostics);
});
