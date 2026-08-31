import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { FreedomRuntimeSession } from "../.test-build/src/studio-recovery/runtime.js";
import { FreedomWorkspace, createFreedomStarterSource } from "../.test-build/src/studio-recovery/source.js";

const SETTLE_STEPS = 240;
const DRIVE_STEPS = 180;
const EFFORTS_NM = [0, 20, 100, 250, 500, 750, 1000];
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

async function runCondition({ grounded, effortNm }) {
  const { source, bearing } = createBeam(effortNm);
  const runtime = await FreedomRuntimeSession.create(source, 0, { grounded });
  try {
    const baseId = runtime.plan.physicalPlan.cellToBody["starter:a"];
    const armId = runtime.plan.physicalPlan.cellToBody["starter:b"];
    assert.ok(baseId, "starter:a has no realized body");
    assert.ok(armId, "starter:b has no realized body");
    assert.notEqual(baseId, armId, "Bearing did not split the beam into two rigid islands");

    let maxAnchorErrorM = maxValue(runtime.anchorErrorsM());
    for (let step = 0; step < SETTLE_STEPS; step += 1) {
      runtime.step(1);
      maxAnchorErrorM = Math.max(maxAnchorErrorM, maxValue(runtime.anchorErrorsM()));
    }

    const settledBase = snapshotById(runtime, baseId);
    const settledArm = snapshotById(runtime, armId);
    const settledRelativeSpeedRadps = runtime.relativeAngularSpeedRadps(bearing);
    const anchorErrorBeforeDriveM = maxValue(runtime.anchorErrorsM());

    runtime.setForcesEnabled(true);
    for (let step = 0; step < DRIVE_STEPS; step += 1) {
      runtime.step(1);
      maxAnchorErrorM = Math.max(maxAnchorErrorM, maxValue(runtime.anchorErrorsM()));
    }

    const finalBase = snapshotById(runtime, baseId);
    const finalArm = snapshotById(runtime, armId);
    const relativeSpeedRadps = runtime.relativeAngularSpeedRadps(bearing);
    const anchorErrorAfterDriveM = maxValue(runtime.anchorErrorsM());
    const allFinite = runtime.snapshots().every(finiteSnapshot);

    return {
      grounded,
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
      maxAnchorErrorM,
      anchorPass: maxAnchorErrorM < ANCHOR_LIMIT_M,
      allFinite,
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
for (const grounded of [false, true]) {
  for (const effortNm of EFFORTS_NM) conditions.push(await runCondition({ grounded, effortNm }));
}

const groundedConditions = conditions.filter((condition) => condition.grounded);
const neutralConditions = conditions.filter((condition) => !condition.grounded);
const firstAnchorRed = (entries) => entries.find((condition) => !condition.anchorPass)?.effortNm ?? null;
const grounded1000 = groundedConditions.find((condition) => condition.effortNm === 1000);
const neutral1000 = neutralConditions.find((condition) => condition.effortNm === 1000);
assert.ok(grounded1000 && neutral1000);

const classification = {
  solverAnchorRed: conditions.some((condition) => !condition.anchorPass),
  groundedAnchorRed: groundedConditions.some((condition) => !condition.anchorPass),
  environmentNeutralAnchorRed: neutralConditions.some((condition) => !condition.anchorPass),
  firstGroundedAnchorRedEffortNm: firstAnchorRed(groundedConditions),
  firstEnvironmentNeutralAnchorRedEffortNm: firstAnchorRed(neutralConditions),
  nonFiniteRed: conditions.some((condition) => !condition.allFinite),
  grounded20NmActionable: groundedConditions.find((condition) => condition.effortNm === 20)?.absoluteRelativeSpeedRadps > ACTIONABLE_SPEED_RADPS,
  grounded100NmActionable: groundedConditions.find((condition) => condition.effortNm === 100)?.absoluteRelativeSpeedRadps > ACTIONABLE_SPEED_RADPS,
  grounded1000NmActionable: grounded1000.absoluteRelativeSpeedRadps > ACTIONABLE_SPEED_RADPS,
  groundedDynamicBaseMateriallyMovesAt1000Nm: grounded1000.baseTranslationM > 0.02 || grounded1000.baseRotationRad > 0.05,
  anchorAmplificationAt1000FromGroundContact: grounded1000.maxAnchorErrorM / Math.max(neutral1000.maxAnchorErrorM, Number.EPSILON),
};

const report = {
  schema: "anvil-grounded-runtime-reality-falsifier/1",
  sourceSha: process.env.GITHUB_SHA ?? null,
  fixture: "same three-cell beam in both environments; Bearing starter:a x+ ↔ starter:b x-; freeAxis=y; starter:a and starter:b/c remain dynamic authored islands",
  timing: { settleSteps: SETTLE_STEPS, driveSteps: DRIVE_STEPS, fixedDtS: 1 / 60 },
  thresholds: { actionableSpeedRadps: ACTIONABLE_SPEED_RADPS, anchorLimitM: ANCHOR_LIMIT_M },
  effortsNm: EFFORTS_NM,
  conditions,
  classification,
  verdict: classification.nonFiniteRed
    ? "RUNTIME_NONFINITE_RED"
    : classification.groundedAnchorRed && !classification.environmentNeutralAnchorRed
      ? "GROUNDED_CONTACT_CONSTRAINT_RED"
      : classification.groundedAnchorRed && classification.environmentNeutralAnchorRed
        ? "GENERAL_CONSTRAINT_RED"
        : "NO_CONSTRAINT_RED_IN_PROBE",
};

await mkdir("test-results", { recursive: true });
await writeFile("test-results/grounded-runtime-reality-falsifier.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
