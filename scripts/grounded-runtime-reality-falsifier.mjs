import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { FreedomRuntimeSession } from "../.test-build/src/studio-recovery/runtime.js";
import { FreedomWorkspace, createFreedomStarterSource } from "../.test-build/src/studio-recovery/source.js";

const SETTLE_STEPS = 240;
const DRIVE_STEPS = 180;
const LEGACY_ACTIONABILITY_DRIVE_STEPS = 120;
const NEUTRAL_EFFORTS_NM = [0, 20, 40, 60, 80, 100, 150];
const GROUNDED_EFFORTS_NM = [0, 20, 100, 250, 300, 350, 400, 450, 500, 750, 1000];
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

    let maxAnchorErrorDuringSettleM = maxValue(runtime.anchorErrorsM());
    for (let step = 0; step < SETTLE_STEPS; step += 1) {
      runtime.step(1);
      maxAnchorErrorDuringSettleM = Math.max(maxAnchorErrorDuringSettleM, maxValue(runtime.anchorErrorsM()));
    }

    const settledBase = snapshotById(runtime, baseId);
    const settledArm = snapshotById(runtime, armId);
    const settledRelativeSpeedRadps = runtime.relativeAngularSpeedRadps(bearing);
    const anchorErrorBeforeDriveM = maxValue(runtime.anchorErrorsM());

    runtime.setForcesEnabled(true);
    let maxAnchorErrorDuringDriveM = anchorErrorBeforeDriveM;
    let peakAbsoluteRelativeSpeedRadps = Math.abs(settledRelativeSpeedRadps);
    let firstDriveAnchorRedStep = null;
    let firstActionableDriveStep = null;
    let anchorErrorAtLegacyDriveStepM = null;
    let absoluteRelativeSpeedAtLegacyDriveStepRadps = null;
    for (let step = 1; step <= DRIVE_STEPS; step += 1) {
      runtime.step(1);
      const anchorErrorM = maxValue(runtime.anchorErrorsM());
      const absoluteRelativeSpeedRadps = Math.abs(runtime.relativeAngularSpeedRadps(bearing));
      maxAnchorErrorDuringDriveM = Math.max(maxAnchorErrorDuringDriveM, anchorErrorM);
      peakAbsoluteRelativeSpeedRadps = Math.max(peakAbsoluteRelativeSpeedRadps, absoluteRelativeSpeedRadps);
      if (firstDriveAnchorRedStep === null && anchorErrorM >= ANCHOR_LIMIT_M) firstDriveAnchorRedStep = step;
      if (firstActionableDriveStep === null && absoluteRelativeSpeedRadps > ACTIONABLE_SPEED_RADPS) firstActionableDriveStep = step;
      if (step === LEGACY_ACTIONABILITY_DRIVE_STEPS) {
        anchorErrorAtLegacyDriveStepM = anchorErrorM;
        absoluteRelativeSpeedAtLegacyDriveStepRadps = absoluteRelativeSpeedRadps;
      }
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
      peakAbsoluteRelativeSpeedRadps,
      firstActionableDriveStep,
      firstDriveAnchorRedStep,
      anchorErrorAtLegacyDriveStepM,
      absoluteRelativeSpeedAtLegacyDriveStepRadps,
      anchorErrorBeforeDriveM,
      anchorErrorAfterDriveM,
      maxAnchorErrorDuringSettleM,
      maxAnchorErrorDuringDriveM,
      driveAnchorPass: maxAnchorErrorDuringDriveM < ANCHOR_LIMIT_M,
      settledAnchorPass: anchorErrorBeforeDriveM < ANCHOR_LIMIT_M,
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

const neutralConditions = [];
for (const effortNm of NEUTRAL_EFFORTS_NM) neutralConditions.push(await runCondition({ grounded: false, effortNm }));
const groundedConditions = [];
for (const effortNm of GROUNDED_EFFORTS_NM) groundedConditions.push(await runCondition({ grounded: true, effortNm }));
const conditions = [...neutralConditions, ...groundedConditions];

const firstDriveAnchorRed = (entries) => entries.find((condition) => !condition.driveAnchorPass)?.effortNm ?? null;
const firstActionable = (entries) => entries.find((condition) => condition.absoluteRelativeSpeedRadps > ACTIONABLE_SPEED_RADPS)?.effortNm ?? null;
const grounded1000 = groundedConditions.find((condition) => condition.effortNm === 1000);
assert.ok(grounded1000);

const classification = {
  solverDriveAnchorRed: conditions.some((condition) => !condition.driveAnchorPass),
  groundedDriveAnchorRed: groundedConditions.some((condition) => !condition.driveAnchorPass),
  environmentNeutralDriveAnchorRed: neutralConditions.some((condition) => !condition.driveAnchorPass),
  firstGroundedDriveAnchorRedEffortNm: firstDriveAnchorRed(groundedConditions),
  firstEnvironmentNeutralDriveAnchorRedEffortNm: firstDriveAnchorRed(neutralConditions),
  firstGroundedActionableEffortNm: firstActionable(groundedConditions),
  firstEnvironmentNeutralActionableEffortNm: firstActionable(neutralConditions),
  groundSettleTransientOver3mm: groundedConditions.some((condition) => condition.maxAnchorErrorDuringSettleM >= ANCHOR_LIMIT_M),
  groundSettlesBackWithin3mm: groundedConditions.every((condition) => condition.settledAnchorPass),
  nonFiniteRed: conditions.some((condition) => !condition.allFinite),
  grounded20NmActionable: groundedConditions.find((condition) => condition.effortNm === 20)?.absoluteRelativeSpeedRadps > ACTIONABLE_SPEED_RADPS,
  grounded1000NmActionable: grounded1000.absoluteRelativeSpeedRadps > ACTIONABLE_SPEED_RADPS,
  grounded1000NmAnchorAlreadyRedAtLegacy120DriveSteps: (grounded1000.anchorErrorAtLegacyDriveStepM ?? 0) >= ANCHOR_LIMIT_M,
  grounded1000NmFirstAnchorRedDriveStep: grounded1000.firstDriveAnchorRedStep,
  groundedDynamicBaseMateriallyMovesAt1000Nm: grounded1000.baseTranslationM > 0.02 || grounded1000.baseRotationRad > 0.05,
};

const report = {
  schema: "anvil-grounded-runtime-reality-falsifier/3",
  sourceSha: process.env.GITHUB_SHA ?? null,
  fixture: "same three-cell beam; Bearing starter:a x+ ↔ starter:b x-; freeAxis=y; starter:a and starter:b/c remain dynamic authored islands",
  timing: {
    settleSteps: SETTLE_STEPS,
    driveSteps: DRIVE_STEPS,
    legacyActionabilityDriveSteps: LEGACY_ACTIONABILITY_DRIVE_STEPS,
    fixedDtS: 1 / 60,
  },
  thresholds: { actionableSpeedRadps: ACTIONABLE_SPEED_RADPS, anchorLimitM: ANCHOR_LIMIT_M },
  sweep: { neutralEffortsNm: NEUTRAL_EFFORTS_NM, groundedEffortsNm: GROUNDED_EFFORTS_NM },
  conditions,
  classification,
  verdict: classification.nonFiniteRed
    ? "RUNTIME_NONFINITE_RED"
    : classification.environmentNeutralDriveAnchorRed
      ? "GENERAL_HIGH_SPEED_CONSTRAINT_RED"
      : classification.groundedDriveAnchorRed
        ? "GROUNDED_CONTACT_CONSTRAINT_RED"
        : "NO_DRIVE_CONSTRAINT_RED_IN_PROBE",
};

await mkdir("test-results", { recursive: true });
await writeFile("test-results/grounded-runtime-reality-falsifier.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
