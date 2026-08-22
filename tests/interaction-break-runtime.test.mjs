import test from "node:test";
import assert from "node:assert/strict";
import { InteractionBreakRuntimeSession } from "../.test-build/src/studio/interaction-break-runtime.js";
import { createStudioRuntimeIdSource } from "../.test-build/src/studio/runtime.js";
import { createEditableStarterSource } from "../.test-build/src/studio/workspace.js";

function createStarterBreakSource() {
  const source = createEditableStarterSource();
  return {
    ...source,
    bearings: [
      ...source.bearings,
      {
        id: "bearing:break-second",
        endpointA: { cellId: "starter:b0", face: "x+" },
        endpointB: { cellId: "starter:b1", face: "x-" },
        freeAxis: "z",
      },
    ],
  };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

test("Runtime Hand physically pulls a composed Break body without writing runtime motion into authored source", async () => {
  const source = createStarterBreakSource();
  const sourceBefore = structuredClone(source);
  const ids = createStudioRuntimeIdSource("interaction-hand");
  const runtime = await InteractionBreakRuntimeSession.create(source, 4, ids);

  try {
    assert.equal(runtime.activation, "OFF");
    assert.equal(runtime.handActive, false);
    assert.equal(runtime.receipt.bodyCount, 3);
    assert.equal(runtime.receipt.jointCount, 2);

    const planBodyId = runtime.plan.cellToBody["starter:b3"];
    assert.ok(planBodyId !== undefined);
    const worldPoint = { x: 1.25, y: 0.25, z: 0.25 };
    const target = { x: worldPoint.x, y: worldPoint.y + 0.1, z: worldPoint.z };

    runtime.beginHandGrab(planBodyId, worldPoint);
    runtime.updateHandTarget(target);
    assert.equal(runtime.handActive, true);
    assert.deepEqual(runtime.handTargetWorld(), target);

    const startAnchor = runtime.handAnchorWorld();
    assert.ok(startAnchor !== null);
    runtime.step(30);
    const endAnchor = runtime.handAnchorWorld();
    assert.ok(endAnchor !== null);

    const displacement = distance(startAnchor, endAnchor);
    const targetError = distance(endAnchor, target);
    const anchorErrors = runtime.anchorErrorsM();
    const maxBearingAnchorError = Math.max(...Object.values(anchorErrors));

    console.log(JSON.stringify({
      probe: "O1-X/INTERACTION-BANDWIDTH-RUNTIME-HAND-C0",
      planBodyId,
      requestedTargetDeltaM: 0.1,
      grabbedPointDisplacementM: displacement,
      finalTargetErrorM: targetError,
      bearingAnchorErrorsM: anchorErrors,
      maxBearingAnchorErrorM: maxBearingAnchorError,
    }));

    assert.ok(displacement > 0.02, `Runtime Hand moved grabbed point only ${displacement} m`);
    assert.ok(endAnchor.y > startAnchor.y, "Runtime Hand moved opposite the requested target direction");
    assert.ok(maxBearingAnchorError < 2e-3, `Runtime Hand exceeded frozen 2 mm Bearing anchor gate: ${maxBearingAnchorError} m`);
    assert.deepEqual(source, sourceBefore, "Runtime Hand mutated authored source");

    runtime.endHandGrab();
    assert.equal(runtime.handActive, false);
    assert.equal(runtime.handAnchorWorld(), null);
  } finally {
    runtime.dispose();
  }

  const fresh = await InteractionBreakRuntimeSession.create(source, 4, ids);
  try {
    assert.equal(fresh.sessionId, "interaction-hand:2");
    assert.equal(fresh.activation, "OFF");
    assert.equal(fresh.handActive, false);
  } finally {
    fresh.dispose();
  }
});
