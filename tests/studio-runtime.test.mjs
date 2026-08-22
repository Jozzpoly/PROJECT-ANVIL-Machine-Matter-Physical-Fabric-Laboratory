import test from "node:test";
import assert from "node:assert/strict";
import { classifyStudioSource } from "../.test-build/src/studio/compile.js";
import {
  StudioRuntimeSession,
  createStudioRuntimeIdSource,
} from "../.test-build/src/studio/runtime.js";
import {
  StudioWorkspace,
  createEditableStarterSource,
  createEmptyStudioSource,
} from "../.test-build/src/studio/workspace.js";

function rotationDistance(a, b) {
  return Math.hypot(
    a.x - b.x,
    a.y - b.y,
    a.z - b.z,
    a.w - b.w,
  );
}

test("Studio runtime starts as a fresh OFF session and advances accepted ActivatePhysics without mutating authored source", async () => {
  const source = createEditableStarterSource();
  const sourceBefore = structuredClone(source);
  const classification = classifyStudioSource(source, 0);
  const runtime = await StudioRuntimeSession.create(
    source,
    0,
    classification,
    createStudioRuntimeIdSource("test-session"),
  );

  try {
    assert.equal(runtime.sessionId, "test-session:1");
    assert.equal(runtime.sourceGeneration, 0);
    assert.equal(runtime.activation, "OFF");
    const initial = runtime.frame();
    assert.equal(initial.sessionId, runtime.sessionId);
    assert.equal(initial.sourceGeneration, 0);
    assert.equal(initial.activation, "OFF");
    assert.ok(initial.bodies.length >= 2);

    runtime.step(30);
    assert.equal(runtime.activation, "OFF");

    runtime.setActivation("ON");
    const active = runtime.step(60);
    assert.equal(active.activation, "ON");
    assert.ok(
      active.bodies.some((body, index) => {
        const before = initial.bodies[index];
        return before !== undefined && rotationDistance(body.rotation, before.rotation) > 1e-4;
      }),
      "accepted active-bearing runtime produced no visible body rotation",
    );
    assert.deepEqual(source, sourceBefore, "Studio runtime mutated authored source");
  } finally {
    runtime.dispose();
  }
});

test("Studio runtime refs die across Restart even when planBodyId repeats", async () => {
  const source = createEditableStarterSource();
  const classification = classifyStudioSource(source, 0);
  const ids = createStudioRuntimeIdSource("restart-session");

  const first = await StudioRuntimeSession.create(source, 0, classification, ids);
  const firstBody = first.frame().bodies[0];
  assert.ok(firstBody !== undefined);
  const staleRef = first.bodyRef(firstBody.planBodyId);
  const repeatedPlanBodyId = staleRef.planBodyId;
  assert.equal(staleRef.sessionId, "restart-session:1");
  first.dispose();

  const second = await StudioRuntimeSession.create(source, 0, classification, ids);
  try {
    assert.equal(second.sessionId, "restart-session:2");
    assert.ok(second.frame().bodies.some((body) => body.planBodyId === repeatedPlanBodyId));
    assert.throws(
      () => second.resolveBodyRef(staleRef),
      /stale session/u,
    );
    const currentRef = second.bodyRef(repeatedPlanBodyId);
    assert.equal(currentRef.sessionId, second.sessionId);
    assert.equal(second.resolveBodyRef(currentRef).planBodyId, repeatedPlanBodyId);
  } finally {
    second.dispose();
  }
});

test("Studio runtime refuses stale classification generation before creating physics", async () => {
  const workspace = new StudioWorkspace(createEditableStarterSource());
  const before = workspace.snapshot();
  const staleClassification = classifyStudioSource(before.source, before.sourceGeneration);
  const patch = before.source.torquePatches[0];
  assert.ok(patch !== undefined);
  workspace.commitEditTorquePatch(patch.id, patch.target, patch.effortNm + 1);
  const after = workspace.snapshot();
  assert.equal(after.sourceGeneration, before.sourceGeneration + 1);

  await assert.rejects(
    StudioRuntimeSession.create(after.source, after.sourceGeneration, staleClassification),
    /stale classification generation/u,
  );
});

test("Studio runtime refuses ordinary INCOMPLETE BUILD source", async () => {
  const source = createEmptyStudioSource();
  const classification = classifyStudioSource(source, 0);
  assert.equal(classification.runReadiness, "INCOMPLETE");
  await assert.rejects(
    StudioRuntimeSession.create(source, 0, classification),
    /VALID \/ SUPPORTED \/ READY/u,
  );
});

test("disposed Studio runtime invalidates its session boundary", async () => {
  const source = createEditableStarterSource();
  const classification = classifyStudioSource(source, 0);
  const runtime = await StudioRuntimeSession.create(source, 0, classification);
  runtime.dispose();
  assert.throws(() => runtime.frame(), /disposed/u);
  assert.throws(() => runtime.setActivation("ON"), /disposed/u);
  assert.throws(() => runtime.step(), /disposed/u);
});
