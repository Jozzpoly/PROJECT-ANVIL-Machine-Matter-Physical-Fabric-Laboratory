import test from "node:test";
import assert from "node:assert/strict";
import { classifyStudioSource } from "../.test-build/src/studio/compile.js";
import {
  BreakLabRuntimeSession,
  classifyBreakLabSource,
  compileBreakLab,
} from "../.test-build/src/studio/break-lab.js";
import { createStudioRuntimeIdSource } from "../.test-build/src/studio/runtime.js";
import { createEmptyStudioSource } from "../.test-build/src/studio/workspace.js";

function createChainSource() {
  const base = createEmptyStudioSource();
  const materialId = base.matter.materials[0]?.id;
  assert.ok(materialId !== undefined);
  return {
    ...base,
    matter: {
      ...base.matter,
      revision: "break-lab/chain-v0",
      cells: [
        { id: "chain:a", grid: { x: 0, y: 0, z: 0 }, materialId },
        { id: "chain:b", grid: { x: 1, y: 0, z: 0 }, materialId },
        { id: "chain:c", grid: { x: 2, y: 0, z: 0 }, materialId },
      ],
    },
    bearings: [
      {
        id: "bearing:ab",
        endpointA: { cellId: "chain:a", face: "x+" },
        endpointB: { cellId: "chain:b", face: "x-" },
        freeAxis: "z",
      },
      {
        id: "bearing:bc",
        endpointA: { cellId: "chain:b", face: "x+" },
        endpointB: { cellId: "chain:c", face: "x-" },
        freeAxis: "z",
      },
    ],
    torquePatches: [
      {
        id: "torque:ab",
        target: { cellId: "chain:a", face: "x+" },
        effortNm: 100,
      },
    ],
  };
}

test("Break Lab keeps standard Studio classification honest while qualifying simultaneous multi-Bearing composition separately", () => {
  const source = createChainSource();
  const standard = classifyStudioSource(source, 7);
  assert.equal(standard.sourceGeneration, 7);
  assert.equal(standard.authoredValidity, "VALID");
  assert.equal(standard.compositionSupport, "UNSUPPORTED");
  assert.equal(standard.runReadiness, "INCOMPLETE");
  assert.ok(standard.issues.some((issue) => issue.code === "MULTI_BEARING_NOT_QUALIFIED"));

  const experimental = classifyBreakLabSource(source);
  assert.equal(experimental.eligibility, "ELIGIBLE");
  assert.ok(experimental.compilation !== null);
  assert.equal(experimental.compilation.physicalPlan.bodies.length, 3);
  assert.equal(experimental.compilation.relations.length, 2);
  assert.equal(experimental.compilation.torque.sourceBearingId, "bearing:ab");

  const direct = compileBreakLab(source);
  assert.deepEqual(
    direct.relations.map((relation) => relation.sourceBearingId),
    ["bearing:ab", "bearing:bc"],
  );
});

test("Break Lab real Box3D runtime drives one persistent TorquePatch through two composed Bearings without mutating authored source", async () => {
  const source = createChainSource();
  const sourceBefore = structuredClone(source);
  const ids = createStudioRuntimeIdSource("break-lab-session");
  const runtime = await BreakLabRuntimeSession.create(source, 3, ids);

  try {
    assert.equal(runtime.sessionId, "break-lab-session:1");
    assert.equal(runtime.sourceGeneration, 3);
    assert.equal(runtime.activation, "OFF");
    assert.equal(runtime.receipt.bodyCount, 3);
    assert.equal(runtime.receipt.jointCount, 2);
    assert.equal(runtime.receipt.relationCount, 2);

    runtime.step(60);
    const offSpeed = Math.abs(runtime.relativeAngularSpeedRadps("bearing:ab"));
    assert.ok(offSpeed < 1e-6, `OFF control moved targeted Bearing at ${offSpeed} rad/s`);

    runtime.setActivation("ON");
    runtime.step(120);
    const activeSpeed = Math.abs(runtime.relativeAngularSpeedRadps("bearing:ab"));
    const anchorErrors = runtime.anchorErrorsM();
    const maxAnchorError = Math.max(...Object.values(anchorErrors));

    console.log(JSON.stringify({
      probe: "O1-X/BREAK-LAB-V0-CHAIN",
      bodyCount: runtime.receipt.bodyCount,
      relationCount: runtime.receipt.relationCount,
      offSpeedRadps: offSpeed,
      activeSpeedRadps: activeSpeed,
      anchorErrorsM: anchorErrors,
      maxAnchorErrorM: maxAnchorError,
    }));

    assert.ok(activeSpeed > 0.05, `active TorquePatch produced too little relative motion: ${activeSpeed} rad/s`);
    assert.ok(maxAnchorError < 1e-3, `multi-Bearing anchor error exceeded gate: ${maxAnchorError} m`);
    assert.deepEqual(source, sourceBefore, "Break Lab runtime mutated authored source");
  } finally {
    runtime.dispose();
  }

  const fresh = await BreakLabRuntimeSession.create(source, 3, ids);
  try {
    assert.equal(fresh.sessionId, "break-lab-session:2");
    assert.equal(fresh.activation, "OFF");
    assert.equal(Math.abs(fresh.relativeAngularSpeedRadps("bearing:ab")), 0);
  } finally {
    fresh.dispose();
  }
});

test("Break Lab fails closed outside the frozen v0 envelope", () => {
  const source = createChainSource();
  assert.equal(classifyBreakLabSource({ ...source, bearings: source.bearings.slice(0, 1) }).eligibility, "INELIGIBLE");
  assert.equal(classifyBreakLabSource({ ...source, torquePatches: [] }).eligibility, "INELIGIBLE");
  assert.equal(
    classifyBreakLabSource({
      ...source,
      torquePatches: [
        source.torquePatches[0],
        { ...source.torquePatches[0], id: "torque:second" },
      ],
    }).eligibility,
    "INELIGIBLE",
  );
});
