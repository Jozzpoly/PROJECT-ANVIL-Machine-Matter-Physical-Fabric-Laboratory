import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";

const path = "artifacts/reference-support-geometry-falsifier/result.json";
const raw = JSON.parse(await readFile(path, "utf8"));
const TARGETS = [10, 20];

const row = (mode, target) => {
  const found = raw.rows.find((candidate) => candidate.mode === mode && candidate.targetSpeedRadps === target);
  assert.ok(found, `Missing ${mode} / ${target}`);
  return found;
};
const operational = (candidate) => candidate.integrityPass && candidate.actionable;
const allOperational = (mode) => TARGETS.every((target) => operational(row(mode, target)));
const anyOperationalFailure = (mode) => TARGETS.some((target) => !operational(row(mode, target)));

const checks = {
  dynamicFloorOperationalFailure: anyOperationalFailure("dynamic-floor"),
  fixedFloorOperationalFailure: anyOperationalFailure("fixed-floor"),
  fixedInsufficientOperationalFailure: anyOperationalFailure("fixed-insufficient"),
  fixedBoundaryOperationalPass: allOperational("fixed-boundary"),
  fixedClearOperationalPass: allOperational("fixed-clear"),
  fixedClearNoGroundOperationalPass: allOperational("fixed-clear-noground"),
  yControlsOperationalPass: raw.rows.filter((candidate) => candidate.axis === "y").every(operational),
  passiveImpactReproduced: raw.passiveRows.every((candidate) => !candidate.integrityPass),
};

let verdict = "REFERENCE_SUPPORT_OPERATIONAL_RESULT_MIXED";
if (
  checks.dynamicFloorOperationalFailure &&
  checks.fixedFloorOperationalFailure &&
  checks.fixedInsufficientOperationalFailure &&
  checks.fixedBoundaryOperationalPass &&
  checks.fixedClearOperationalPass &&
  checks.fixedClearNoGroundOperationalPass &&
  checks.yControlsOperationalPass
) verdict = "REFERENCE_PLUS_CLEARANCE_SUFFICIENT_IN_FIXTURE";
else if (!checks.fixedClearOperationalPass) verdict = "REFERENCE_PLUS_CLEARANCE_NOT_SUFFICIENT";

const summary = TARGETS.map((target) => ({
  targetSpeedRadps: target,
  dynamicFloor: {
    anchorM: row("dynamic-floor", target).maxAnchorDriveM,
    tailSpeedRadps: row("dynamic-floor", target).meanTailAbsSpeedRadps,
    operationalPass: operational(row("dynamic-floor", target)),
  },
  fixedFloor: {
    anchorM: row("fixed-floor", target).maxAnchorDriveM,
    tailSpeedRadps: row("fixed-floor", target).meanTailAbsSpeedRadps,
    operationalPass: operational(row("fixed-floor", target)),
  },
  fixedInsufficient: {
    predictedFullSweepClearanceM: row("fixed-insufficient", target).predictedFullSweepClearanceM,
    anchorM: row("fixed-insufficient", target).maxAnchorDriveM,
    tailSpeedRadps: row("fixed-insufficient", target).meanTailAbsSpeedRadps,
    operationalPass: operational(row("fixed-insufficient", target)),
  },
  fixedBoundary: {
    predictedFullSweepClearanceM: row("fixed-boundary", target).predictedFullSweepClearanceM,
    minMeasuredClearanceM: row("fixed-boundary", target).minMovingClearanceM,
    anchorM: row("fixed-boundary", target).maxAnchorDriveM,
    tailSpeedRadps: row("fixed-boundary", target).meanTailAbsSpeedRadps,
    operationalPass: operational(row("fixed-boundary", target)),
  },
  fixedClear: {
    predictedFullSweepClearanceM: row("fixed-clear", target).predictedFullSweepClearanceM,
    minMeasuredClearanceM: row("fixed-clear", target).minMovingClearanceM,
    anchorM: row("fixed-clear", target).maxAnchorDriveM,
    tailSpeedRadps: row("fixed-clear", target).meanTailAbsSpeedRadps,
    operationalPass: operational(row("fixed-clear", target)),
  },
}));

const qualified = {
  schema: "anvil-reference-support-geometry-qualified/0",
  sourceSha: process.env.GITHUB_SHA ?? null,
  productBaseSha: raw.productBaseSha,
  rawHarnessVerdictRejected: raw.verdict,
  qualificationRule: "operational PASS requires both anchor integrity and sustained actionability",
  geometry: raw.geometry,
  summary,
  firstTransferPassingSubsteps: raw.firstTransferPassingSubsteps,
  transferRows: raw.transferRows,
  passiveRows: raw.passiveRows,
  checks,
  verdict,
};

assert.equal(verdict, "REFERENCE_PLUS_CLEARANCE_SUFFICIENT_IN_FIXTURE");
await writeFile("artifacts/reference-support-geometry-falsifier/qualified-result.json", `${JSON.stringify(qualified, null, 2)}\n`, "utf8");
console.log(JSON.stringify(qualified, null, 2));
