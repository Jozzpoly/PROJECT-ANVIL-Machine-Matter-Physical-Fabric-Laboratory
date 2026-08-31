import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { FreedomRuntimeSession } from "../.test-build/src/studio-recovery/runtime.js";
import { FreedomWorkspace, createFreedomStarterSource } from "../.test-build/src/studio-recovery/source.js";

const SETTLE_STEPS = 240;
const DRIVE_STEPS = 180;
const EFFORTS_NM = [0, 20, 100, 1000];
const ACTIONABLE_SPEED_RADPS = 0.05;
const ANCHOR_LIMIT_M = 0.003;

function maxValue(record) {
  return Math.max(0, ...Object.values(record));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function rotationDeltaRad(a, b) {
  const dot = Math.abs(a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w);
  return 2 * Math.acos(Math.min(1, Math.max(-1, dot)));
}

function finiteSnapshot(snapshot) {
  return [
    snapshot.position.x, snapshot.position.y, snapshot.position.z,
    snapshot.rotation.x, snapshot.rotation.y, snapshot.rotation.z, snapshot.rotation.w,
    snapshot.linearVelocity.x, snapshot.linearVelocity.y, snapshot.linearVelocity.z,
    snapshot.angularVelocity.x, snapshot.angularVelocity.y, snapshot.angularVelocity.z,
  ].every(Number.isFinite);
}

function snapshotById(runtime, planBodyId) {
  const snapshot = runtime.snapshots().find((candidate) => candidate.planBodyId === planBodyId);
  assert.ok(snapshot, `missing runtime body ${planBodyId}`);
  return snapshot;
}

function createBeam(effortNm) {
  const workspace = new FreedomWorkspace(createFreedomStarterSource());
  const bearing = workspace.addBearing(
    { cellId: "starter:a", face: "x+" },
    { cellId: "starter:b", face: "x-" },
    "y",
  );
  workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, effortNm);
  return { source: workspace.snapshot().source, bearing };
}

async function runCondition(effortNm) {
  const { source, bearing } = createBeam(effortNm);
  const runtime = await FreedomRuntimeSession.create(source, 0);
  try {
    const baseId = runtime.plan.physicalPlan.cellToBody["starter:a"];
    const armId = runtime.plan.physicalPlan.cellToBody["starter:b"];
    assert.ok(baseId, "starter:a has no realized body");
    assert.ok(armId, "starter:b has no realized body");
    assert.notEqual(baseId, armId, "Bearing did not split the beam into two rigid islands");

    runtime.step(SETTLE_STEPS);
    const settledBase = snapshotById(runtime, baseId);
    const settledArm = snapshotById(runtime, armId);
    const settledRelativeSpeedRadps = runtime.relativeAngularSpeedRadps(bearing);
    const anchorErrorBeforeDriveM = maxValue(runtime.anchorErrorsM());

    runtime.setForcesEnabled(true);
    runtime.step(DRIVE_STEPS);

    const finalBase = snapshotById(runtime, baseId);
    const finalArm = snapshotById(runtime, armId);
    const relativeSpeedRadps = runtime.relativeAngularSpeedRadps(bearing);
    const anchorErrorAfterDriveM = maxValue(runtime.anchorErrorsM());

    assert.equal(runtime.snapshots().every(finiteSnapshot), true, `${effortNm} Nm produced non-finite runtime state`);
    assert.ok(
      Math.max(anchorErrorBeforeDriveM, anchorErrorAfterDriveM) < ANCHOR_LIMIT_M,
      `${effortNm} Nm exceeded Bearing anchor limit: before=${anchorErrorBeforeDriveM}, after=${anchorErrorAfterDriveM}`,
    );

    return {
      effortNm,
      receipt: {
        bodyCount: runtime.receipt.bodyCount,
        jointCount: runtime.receipt.jointCount,
        torqueCount: runtime.receipt.torqueCount,
        quality: runtime.receipt.quality,
      },
      settledRelativeSpeedRadps,
      relativeSpeedRadps,
      absoluteRelativeSpeedRadps: Math.abs(relativeSpeedRadps),
      anchorErrorBeforeDriveM,
      anchorErrorAfterDriveM,
      baseTranslationM: distance(settledBase.position, finalBase.position),
      armTranslationM: distance(settledArm.position, finalArm.position),
      baseRotationRad: rotationDeltaRad(settledBase.rotation, finalBase.rotation),
      armRotationRad: rotationDeltaRad(settledArm.rotation, finalArm.rotation),
      baseFinalAngularSpeedRadps: Math.hypot(
        finalBase.angularVelocity.x,
        finalBase.angularVelocity.y,
        finalBase.angularVelocity.z,
      ),
      armFinalAngularSpeedRadps: Math.hypot(
        finalArm.angularVelocity.x,
        finalArm.angularVelocity.y,
        finalArm.angularVelocity.z,
      ),
    };
  } finally {
    runtime.dispose();
  }
}

const conditions = [];
for (const effortNm of EFFORTS_NM) conditions.push(await runCondition(effortNm));

const byEffort = new Map(conditions.map((condition) => [condition.effortNm, condition]));
const c0 = byEffort.get(0);
const c20 = byEffort.get(20);
const c100 = byEffort.get(100);
const c1000 = byEffort.get(1000);
assert.ok(c0 && c20 && c100 && c1000);

const report = {
  schema: "anvil-grounded-runtime-reality-falsifier/0",
  sourceSha: process.env.GITHUB_SHA ?? null,
  fixture: "three-cell beam on grounded runtime; Bearing starter:a x+ ↔ starter:b x-; freeAxis=y",
  timing: { settleSteps: SETTLE_STEPS, driveSteps: DRIVE_STEPS, fixedDtS: 1 / 60 },
  thresholds: { actionableSpeedRadps: ACTIONABLE_SPEED_RADPS, anchorLimitM: ANCHOR_LIMIT_M },
  conditions,
  classification: {
    zeroControlActionable: c0.absoluteRelativeSpeedRadps > ACTIONABLE_SPEED_RADPS,
    twentyNmActionable: c20.absoluteRelativeSpeedRadps > ACTIONABLE_SPEED_RADPS,
    hundredNmActionable: c100.absoluteRelativeSpeedRadps > ACTIONABLE_SPEED_RADPS,
    thousandNmActionable: c1000.absoluteRelativeSpeedRadps > ACTIONABLE_SPEED_RADPS,
    dynamicBaseMateriallyMovesAt1000Nm: c1000.baseTranslationM > 0.02 || c1000.baseRotationRad > 0.05,
    solverAnchorRed: conditions.some((condition) => condition.anchorErrorAfterDriveM >= ANCHOR_LIMIT_M),
    nonFiniteRed: false,
  },
};

await mkdir("test-results", { recursive: true });
await writeFile("test-results/grounded-runtime-reality-falsifier.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
