import test from "node:test";
import assert from "node:assert/strict";
import { FreedomRuntimeSession } from "../.test-build/src/studio-recovery/runtime.js";
import { FreedomWorkspace, createFreedomStarterSource } from "../.test-build/src/studio-recovery/source.js";

function canonical(value) {
  return JSON.stringify(value);
}

function maxValue(record) {
  return Math.max(0, ...Object.values(record));
}

function createAuthorityRuntime(source, generation) {
  return FreedomRuntimeSession.create(source, generation, { grounded: false });
}

function makeTwoBearingSource({ torques = true } = {}) {
  const workspace = new FreedomWorkspace(createFreedomStarterSource());
  const left = workspace.addBearing(
    { cellId: "starter:a", face: "x+" },
    { cellId: "starter:b", face: "x-" },
    "z",
  );
  const right = workspace.addBearing(
    { cellId: "starter:b", face: "x+" },
    { cellId: "starter:c", face: "x-" },
    "z",
  );
  if (torques) {
    workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, 40);
    workspace.addTorquePatch({ cellId: "starter:b", face: "x+" }, -15);
    workspace.addTorquePatch({ cellId: "starter:c", face: "x-" }, 5);
  }
  return { workspace, left, right };
}

test("OWNER-AUTHORITY one invalid local meaning cannot globally block a realizable Box3D world", async () => {
  const workspace = new FreedomWorkspace(createFreedomStarterSource());
  const left = workspace.addBearing(
    { cellId: "starter:a", face: "x+" },
    { cellId: "starter:b", face: "x-" },
    "z",
  );
  workspace.addBearing(
    { cellId: "missing", face: "x+" },
    { cellId: "starter:a", face: "x-" },
    "z",
  );
  workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, 35);
  const snapshot = workspace.snapshot();
  const authoredBefore = canonical(snapshot.source);
  const runtime = await createAuthorityRuntime(snapshot.source, snapshot.generation);
  try {
    assert.equal(runtime.receipt.quality, "PARTIAL");
    assert.equal(runtime.receipt.bodyCount, 2);
    assert.equal(runtime.receipt.jointCount, 1);
    assert.equal(runtime.receipt.torqueCount, 1);
    assert.equal(runtime.receipt.diagnostics.some((entry) => entry.code === "INVALID_LOCALITY"), true);

    runtime.step(30);
    assert.ok(Math.abs(runtime.relativeAngularSpeedRadps(left)) < 1e-6, "forces OFF control moved materially");
    runtime.setForcesEnabled(true);
    runtime.step(60);
    assert.ok(Math.abs(runtime.relativeAngularSpeedRadps(left)) > 0.05, "realized Torque failed to move partial world");
    assert.ok(maxValue(runtime.anchorErrorsM()) < 0.003, "partial runtime lost Bearing anchors");
    assert.equal(canonical(snapshot.source), authoredBefore, "runtime mutated authored source snapshot");
  } finally {
    runtime.dispose();
  }
});

test("OWNER-AUTHORITY exact Bearing delete preserves orphan source while independent Box3D realization still runs", async () => {
  const { workspace, left, right } = makeTwoBearingSource({ torques: false });
  const orphanedTorque = workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, 80);
  const liveTorque = workspace.addTorquePatch({ cellId: "starter:c", face: "x-" }, -25);
  workspace.removeBearing(left);
  const snapshot = workspace.snapshot();
  const authoredBefore = canonical(snapshot.source);

  assert.equal(snapshot.source.torquePatches.some((patch) => patch.id === orphanedTorque), true);
  assert.equal(snapshot.source.torquePatches.some((patch) => patch.id === liveTorque), true);

  const runtime = await createAuthorityRuntime(snapshot.source, snapshot.generation);
  try {
    assert.equal(runtime.receipt.quality, "PARTIAL");
    assert.equal(runtime.receipt.jointCount, 1);
    assert.equal(runtime.receipt.torqueCount, 1);
    assert.equal(
      runtime.receipt.diagnostics.some((entry) => entry.sourceId === orphanedTorque && entry.code === "UNRESOLVED_TARGET"),
      true,
    );
    runtime.setForcesEnabled(true);
    runtime.step(60);
    assert.ok(Math.abs(runtime.relativeAngularSpeedRadps(right)) > 0.05, "independent Bearing failed after exact delete orphaning");
    assert.ok(maxValue(runtime.anchorErrorsM()) < 0.003, "exact-delete partial runtime lost Bearing anchors");
    assert.equal(canonical(snapshot.source), authoredBefore, "runtime rewrote orphaned authored source");
  } finally {
    runtime.dispose();
  }
});

test("OWNER-AUTHORITY exact Matter delete preserves orphan meanings while independent Box3D realization still runs", async () => {
  const { workspace, right } = makeTwoBearingSource({ torques: false });
  const orphanedTorque = workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, 60);
  workspace.addTorquePatch({ cellId: "starter:c", face: "x-" }, -20);
  workspace.removeMatter("starter:a");
  const snapshot = workspace.snapshot();
  const authoredBefore = canonical(snapshot.source);

  const runtime = await createAuthorityRuntime(snapshot.source, snapshot.generation);
  try {
    assert.equal(runtime.receipt.quality, "PARTIAL");
    assert.equal(runtime.receipt.jointCount, 1);
    assert.equal(runtime.receipt.torqueCount, 1);
    assert.equal(runtime.receipt.diagnostics.some((entry) => entry.code === "INVALID_LOCALITY"), true);
    assert.equal(
      runtime.receipt.diagnostics.some((entry) => entry.sourceId === orphanedTorque && entry.code === "UNRESOLVED_TARGET"),
      true,
    );
    runtime.setForcesEnabled(true);
    runtime.step(60);
    assert.ok(Math.abs(runtime.relativeAngularSpeedRadps(right)) > 0.05, "unrelated realization was blocked by removed Matter orphaning");
    assert.ok(maxValue(runtime.anchorErrorsM()) < 0.003);
    assert.equal(canonical(snapshot.source), authoredBefore, "runtime mutated exact-delete Matter source");
  } finally {
    runtime.dispose();
  }
});

test("OWNER-AUTHORITY one runtime composes multiple Bearings and multiple TorquePatches", async () => {
  const { workspace, left, right } = makeTwoBearingSource();
  const snapshot = workspace.snapshot();
  const runtime = await createAuthorityRuntime(snapshot.source, snapshot.generation);
  try {
    assert.equal(runtime.receipt.quality, "COMPLETE");
    assert.equal(runtime.receipt.bodyCount, 3);
    assert.equal(runtime.receipt.jointCount, 2);
    assert.equal(runtime.receipt.torqueCount, 3);
    runtime.setForcesEnabled(true);
    runtime.step(60);
    const speeds = [
      Math.abs(runtime.relativeAngularSpeedRadps(left)),
      Math.abs(runtime.relativeAngularSpeedRadps(right)),
    ];
    assert.ok(Math.max(...speeds) > 0.05, `multi-action runtime stayed static: ${speeds.join(", ")}`);
    assert.ok(maxValue(runtime.anchorErrorsM()) < 0.003, "multi-Bearing anchors exceeded 3 mm");
    assert.equal(runtime.snapshots().every((body) => [
      body.position.x, body.position.y, body.position.z,
      body.rotation.x, body.rotation.y, body.rotation.z, body.rotation.w,
      body.linearVelocity.x, body.linearVelocity.y, body.linearVelocity.z,
      body.angularVelocity.x, body.angularVelocity.y, body.angularVelocity.z,
    ].every(Number.isFinite)), true);
  } finally {
    runtime.dispose();
  }
});

test("OWNER-AUTHORITY Runtime Hand directly moves the live mechanism in the same runtime", async () => {
  const { workspace } = makeTwoBearingSource({ torques: false });
  const snapshot = workspace.snapshot();
  const authoredBefore = canonical(snapshot.source);
  const runtime = await createAuthorityRuntime(snapshot.source, snapshot.generation);
  try {
    const bodyId = runtime.plan.physicalPlan.cellToBody["starter:c"];
    assert.ok(bodyId);
    const body = runtime.snapshots().find((candidate) => candidate.planBodyId === bodyId);
    assert.ok(body);
    const initial = { ...body.position };
    runtime.beginHandGrab(bodyId, initial);
    runtime.updateHandTarget({ x: initial.x, y: initial.y + 0.1, z: initial.z });
    runtime.step(30);
    const moved = runtime.handAnchorWorld();
    assert.ok(moved);
    assert.ok(moved.y - initial.y > 0.02, `Hand moved only ${moved.y - initial.y} m toward 0.1 m target`);
    assert.ok(maxValue(runtime.anchorErrorsM()) < 0.003, "Hand broke Bearing anchors");
    runtime.endHandGrab();
    assert.equal(runtime.handActive, false);
    assert.equal(canonical(snapshot.source), authoredBefore, "Hand wrote runtime motion into source");
  } finally {
    runtime.dispose();
  }
});

test("OWNER-AUTHORITY fresh runtime forgets prior physical pose and transient Hand state", async () => {
  const { workspace } = makeTwoBearingSource({ torques: false });
  const snapshot = workspace.snapshot();
  const first = await createAuthorityRuntime(snapshot.source, snapshot.generation);
  const bodyId = first.plan.physicalPlan.cellToBody["starter:c"];
  assert.ok(bodyId);
  const initial = first.snapshots().find((candidate) => candidate.planBodyId === bodyId);
  assert.ok(initial);
  first.beginHandGrab(bodyId, initial.position);
  first.updateHandTarget({ x: initial.position.x, y: initial.position.y + 0.12, z: initial.position.z });
  first.step(30);
  const displaced = first.snapshots().find((candidate) => candidate.planBodyId === bodyId);
  assert.ok(displaced);
  assert.ok(Math.abs(displaced.position.y - initial.position.y) > 0.01);
  first.dispose();

  const second = await createAuthorityRuntime(snapshot.source, snapshot.generation);
  try {
    const fresh = second.snapshots().find((candidate) => candidate.planBodyId === bodyId);
    assert.ok(fresh);
    assert.equal(second.handActive, false);
    assert.equal(second.forcesEnabled, false);
    assert.ok(Math.abs(fresh.position.y - initial.position.y) < 1e-9, "fresh runtime inherited prior pose");
  } finally {
    second.dispose();
  }
});
