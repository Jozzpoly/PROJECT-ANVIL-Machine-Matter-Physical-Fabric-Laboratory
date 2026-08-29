import test from "node:test";
import assert from "node:assert/strict";
import { enumerateBearingOpportunities } from "../.test-build/src/studio-r2/actionability-disclosure.js";
import { realizeFreedomSource } from "../.test-build/src/studio-recovery/realize.js";
import { createFreedomStarterSource } from "../.test-build/src/studio-recovery/source.js";

function opportunityPairs(source) {
  return enumerateBearingOpportunities(source).map((entry) => [
    `${entry.endpointA.cellId}@${entry.endpointA.face}`,
    `${entry.endpointB.cellId}@${entry.endpointB.face}`,
  ].sort().join(" | ")).sort();
}

test("WER-1 P is derived from adjacent authored Matter topology, not existing Meaning", () => {
  const starter = createFreedomStarterSource();
  const baseline = opportunityPairs(starter);
  assert.deepEqual(baseline, [
    "starter:a@x+ | starter:b@x-",
    "starter:b@x+ | starter:c@x-",
  ]);

  const withBearing = {
    ...starter,
    bearings: [{
      id: "bearing:existing",
      endpointA: { cellId: "starter:a", face: "x+" },
      endpointB: { cellId: "starter:b", face: "x-" },
      freeAxis: "z",
    }],
  };
  assert.deepEqual(opportunityPairs(withBearing), baseline, "existing Bearing must not remove the duplicate-authoring opportunity");

  const withOrphan = {
    ...withBearing,
    bearings: [
      ...withBearing.bearings,
      {
        id: "bearing:orphan",
        endpointA: { cellId: "missing", face: "x+" },
        endpointB: { cellId: "starter:a", face: "x-" },
        freeAxis: "z",
      },
    ],
  };
  assert.deepEqual(opportunityPairs(withOrphan), baseline, "preserved orphan Meaning must not manufacture a potential Bearing opportunity");
});

test("WER-1 P is not filtered by predicted RIGID_BYPASS realization", () => {
  const base = createFreedomStarterSource();
  const materialId = base.matter.materials[0].id;
  const square = {
    ...base,
    matter: {
      ...base.matter,
      revision: "wer1/rigid-bypass-square",
      cells: [
        { id: "a", grid: { x: 0, y: 0, z: 0 }, materialId },
        { id: "b", grid: { x: 1, y: 0, z: 0 }, materialId },
        { id: "c", grid: { x: 1, y: 1, z: 0 }, materialId },
        { id: "d", grid: { x: 0, y: 1, z: 0 }, materialId },
      ],
    },
    bearings: [{
      id: "bearing:bypass",
      endpointA: { cellId: "a", face: "x+" },
      endpointB: { cellId: "b", face: "x-" },
      freeAxis: "y",
    }],
    torquePatches: [],
  };

  const plan = realizeFreedomSource(square);
  assert.equal(plan.diagnostics.some((entry) => entry.sourceId === "bearing:bypass" && entry.code === "RIGID_BYPASS"), true);
  assert.equal(
    opportunityPairs(square).includes("a@x+ | b@x-"),
    true,
    "a topological seam must remain P even when realization later reports RIGID_BYPASS",
  );
});
