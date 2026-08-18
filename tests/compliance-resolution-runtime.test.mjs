import test from "node:test";
import assert from "node:assert/strict";
import {
  compileComplianceResolution,
  createComplianceResolutionFixture,
} from "../.test-build/src/experiments/anvil-08-compliance-resolution.js";
import { ComplianceResolutionPhysics } from "../.test-build/src/experiments/anvil-08-compliance-resolution-runtime.js";

const LOAD_N = 1_000;
const LOADED_STEPS = 180;
const UNLOADED_STEPS = 120;

const MIN_CANDIDATE_LOADED_EXTENSION_M = 0.07;
const MAX_CANDIDATE_LOADED_EXTENSION_M = 0.13;
const MAX_CANDIDATE_LOADED_RELATIVE_SPEED_MPS = 0.10;
const MAX_RESOLUTION_LOADED_EXTENSION_DELTA_M = 0.001;
const MIN_CONTROL_LOADED_EXTENSION_M = 0.015;
const MAX_CONTROL_LOADED_EXTENSION_M = 0.040;
const MIN_FINE_VS_CONTROL_EXTENSION_ADVANTAGE_M = 0.040;
const MAX_CANDIDATE_RECOVERED_EXTENSION_M = 0.015;
const MAX_CANDIDATE_RECOVERED_RELATIVE_SPEED_MPS = 0.15;
const MIN_CANDIDATE_RECOVERY_M = 0.06;
const MAX_RESOLUTION_RECOVERED_EXTENSION_DELTA_M = 0.001;
const MAX_CANDIDATE_MOMENTUM_KG_MPS = 0.05;
const MAX_CANDIDATE_BARYCENTER_DRIFT_M = 0.0005;
const SOLVER_TUNING_TOLERANCE = 1e-6;

function expectNear(actual, expected, tolerance, label) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} vs ${expected} ± ${tolerance}`);
}

function assertFiniteDiagnostics(diagnostics, label) {
  for (const [key, value] of Object.entries(diagnostics)) {
    assert.ok(Number.isFinite(value), `${label}.${key} is not finite: ${value}`);
  }
}

function assertCandidateDiagnostics(diagnostics, phase, label) {
  assert.ok(diagnostics.linearMomentumMagnitudeKgMps <= MAX_CANDIDATE_MOMENTUM_KG_MPS,
    `${label}.${phase} momentum ${diagnostics.linearMomentumMagnitudeKgMps} kg·m/s exceeds ${MAX_CANDIDATE_MOMENTUM_KG_MPS}`);
  assert.ok(diagnostics.barycenterDisplacementM <= MAX_CANDIDATE_BARYCENTER_DRIFT_M,
    `${label}.${phase} barycenter drift ${diagnostics.barycenterDisplacementM} m exceeds ${MAX_CANDIDATE_BARYCENTER_DRIFT_M} m`);
}

function assertRuntimeReceipt(receipt, compilation, expectedSourcePatches, label) {
  assert.equal(receipt.backend, "anvil-07-elastic-seam-1d-adapter");
  assert.equal(receipt.sourcePatchCount, expectedSourcePatches);
  assert.equal(receipt.aggregateRuntimeRelationCount, 1);
  assert.equal(receipt.engineVersion, "0.1.0");
  assert.equal(receipt.bodyCount, 2);
  assert.equal(receipt.jointCount, 1);
  assert.deepEqual(receipt.gravity, { x: 0, y: 0, z: 0 });
  assert.equal(receipt.contactsDisabled, true);

  const receiptBodyIds = Object.keys(receipt.bodyMassErrorsKg).sort();
  assert.equal(receiptBodyIds.length, 2, `${label} receipt must report both runtime bodies`);
  for (const [field, values] of Object.entries({
    bodyLocalCenterErrorsM: receipt.bodyLocalCenterErrorsM,
    bodyLinearDamping: receipt.bodyLinearDamping,
    bodyAngularDamping: receipt.bodyAngularDamping,
    bodySleepEnabled: receipt.bodySleepEnabled,
    bodyMotionLocks: receipt.bodyMotionLocks,
  })) {
    assert.deepEqual(Object.keys(values).sort(), receiptBodyIds, `${label} ${field} body coverage`);
  }

  for (const [bodyId, value] of Object.entries(receipt.bodyLinearDamping)) {
    assert.equal(value, 0, `${label} linear damping for ${bodyId}`);
  }
  for (const [bodyId, value] of Object.entries(receipt.bodyAngularDamping)) {
    assert.equal(value, 0, `${label} angular damping for ${bodyId}`);
  }
  for (const [bodyId, value] of Object.entries(receipt.bodySleepEnabled)) {
    assert.equal(value, false, `${label} sleep state for ${bodyId}`);
  }
  for (const [bodyId, locks] of Object.entries(receipt.bodyMotionLocks)) {
    assert.deepEqual(locks, {
      linearX: false,
      linearY: true,
      linearZ: true,
      angularX: true,
      angularY: true,
      angularZ: true,
    }, `${label} motion locks for ${bodyId}`);
  }
  for (const [bodyId, error] of Object.entries(receipt.bodyMassErrorsKg)) {
    assert.ok(Math.abs(error) <= 0.1, `${label} runtime mass error for ${bodyId}: ${error} kg`);
  }
  for (const [bodyId, error] of Object.entries(receipt.bodyLocalCenterErrorsM)) {
    assert.ok(Math.abs(error) <= 7e-5, `${label} runtime local COM error for ${bodyId}: ${error} m`);
  }

  expectNear(receipt.jointTuning.linearHertz, compilation.relation.linearHertz, SOLVER_TUNING_TOLERANCE, `${label} solver hertz`);
  expectNear(receipt.jointTuning.linearDampingRatio, compilation.relation.linearDampingRatio, SOLVER_TUNING_TOLERANCE, `${label} solver damping ratio`);
  assert.equal(receipt.jointTuning.angularHertz, 0, `${label} angular hertz`);
  assert.equal(receipt.jointTuning.angularDampingRatio, 1, `${label} angular damping ratio`);
}

function massSummary(compilation) {
  const bodies = [...compilation.physicalPlan.bodies].sort((a, b) => a.massKg - b.massKg);
  return bodies.map((body) => ({
    sourceCellCount: body.sourceCellIds.length,
    massKg: body.massKg,
    centerOfMassWorld: body.centerOfMassWorld,
  }));
}

test("ANVIL-08 C0 preserves area-normalized compliance across 2x source refinement and rejects fixed spring-per-patch behavior", async () => {
  const coarseSource = createComplianceResolutionFixture("COARSE");
  const fineSource = createComplianceResolutionFixture("FINE");
  const coarseCompilation = compileComplianceResolution(coarseSource, "AREA");
  const fineCompilation = compileComplianceResolution(fineSource, "AREA");
  const controlCompilation = compileComplianceResolution(fineSource, "FIXED_PATCH_CONTROL");

  const coarse = await ComplianceResolutionPhysics.create(coarseCompilation, coarseSource.matter.materials);
  const fine = await ComplianceResolutionPhysics.create(fineCompilation, fineSource.matter.materials);
  const control = await ComplianceResolutionPhysics.create(controlCompilation, fineSource.matter.materials);

  try {
    assertRuntimeReceipt(coarse.receipt, coarseCompilation, 1, "COARSE_AREA");
    assertRuntimeReceipt(fine.receipt, fineCompilation, 4, "FINE_AREA");
    assertRuntimeReceipt(control.receipt, controlCompilation, 4, "FINE_FIXED_PATCH_CONTROL");

    for (let step = 0; step < LOADED_STEPS; step += 1) {
      coarse.applyOutwardLoad(LOAD_N);
      fine.applyOutwardLoad(LOAD_N);
      control.applyOutwardLoad(LOAD_N);
      coarse.step();
      fine.step();
      control.step();
    }

    const coarseLoaded = coarse.diagnostics();
    const fineLoaded = fine.diagnostics();
    const controlLoaded = control.diagnostics();
    assertFiniteDiagnostics(coarseLoaded, "COARSE_AREA.loaded");
    assertFiniteDiagnostics(fineLoaded, "FINE_AREA.loaded");
    assertFiniteDiagnostics(controlLoaded, "FINE_FIXED_PATCH_CONTROL.loaded");

    for (const [label, diagnostics] of [["COARSE_AREA", coarseLoaded], ["FINE_AREA", fineLoaded]]) {
      assert.ok(diagnostics.extensionM >= MIN_CANDIDATE_LOADED_EXTENSION_M,
        `${label} loaded extension ${diagnostics.extensionM} m is below ${MIN_CANDIDATE_LOADED_EXTENSION_M} m`);
      assert.ok(diagnostics.extensionM <= MAX_CANDIDATE_LOADED_EXTENSION_M,
        `${label} loaded extension ${diagnostics.extensionM} m exceeds ${MAX_CANDIDATE_LOADED_EXTENSION_M} m`);
      assert.ok(Math.abs(diagnostics.relativeSpeedMps) <= MAX_CANDIDATE_LOADED_RELATIVE_SPEED_MPS,
        `${label} loaded relative speed ${diagnostics.relativeSpeedMps} m/s exceeds ${MAX_CANDIDATE_LOADED_RELATIVE_SPEED_MPS} m/s`);
      assertCandidateDiagnostics(diagnostics, "loaded", label);
    }

    assert.ok(Math.abs(coarseLoaded.extensionM - fineLoaded.extensionM) <= MAX_RESOLUTION_LOADED_EXTENSION_DELTA_M,
      `COARSE/FINE loaded extension delta ${Math.abs(coarseLoaded.extensionM - fineLoaded.extensionM)} m exceeds ${MAX_RESOLUTION_LOADED_EXTENSION_DELTA_M} m`);

    assert.ok(controlLoaded.extensionM >= MIN_CONTROL_LOADED_EXTENSION_M,
      `control loaded extension ${controlLoaded.extensionM} m is below ${MIN_CONTROL_LOADED_EXTENSION_M} m`);
    assert.ok(controlLoaded.extensionM <= MAX_CONTROL_LOADED_EXTENSION_M,
      `control loaded extension ${controlLoaded.extensionM} m exceeds ${MAX_CONTROL_LOADED_EXTENSION_M} m`);
    assert.ok(fineLoaded.extensionM - controlLoaded.extensionM >= MIN_FINE_VS_CONTROL_EXTENSION_ADVANTAGE_M,
      `FINE_AREA minus fixed-patch control extension ${fineLoaded.extensionM - controlLoaded.extensionM} m is below ${MIN_FINE_VS_CONTROL_EXTENSION_ADVANTAGE_M} m`);

    coarse.step(UNLOADED_STEPS);
    fine.step(UNLOADED_STEPS);
    control.step(UNLOADED_STEPS);

    const coarseRecovered = coarse.diagnostics();
    const fineRecovered = fine.diagnostics();
    const controlRecovered = control.diagnostics();
    assertFiniteDiagnostics(coarseRecovered, "COARSE_AREA.recovered");
    assertFiniteDiagnostics(fineRecovered, "FINE_AREA.recovered");
    assertFiniteDiagnostics(controlRecovered, "FINE_FIXED_PATCH_CONTROL.recovered");

    for (const [label, loaded, recovered] of [
      ["COARSE_AREA", coarseLoaded, coarseRecovered],
      ["FINE_AREA", fineLoaded, fineRecovered],
    ]) {
      assert.ok(Math.abs(recovered.extensionM) <= MAX_CANDIDATE_RECOVERED_EXTENSION_M,
        `${label} recovered extension ${recovered.extensionM} m exceeds ${MAX_CANDIDATE_RECOVERED_EXTENSION_M} m`);
      assert.ok(Math.abs(recovered.relativeSpeedMps) <= MAX_CANDIDATE_RECOVERED_RELATIVE_SPEED_MPS,
        `${label} recovered relative speed ${recovered.relativeSpeedMps} m/s exceeds ${MAX_CANDIDATE_RECOVERED_RELATIVE_SPEED_MPS} m/s`);
      assert.ok(loaded.extensionM - Math.abs(recovered.extensionM) >= MIN_CANDIDATE_RECOVERY_M,
        `${label} recovery ${loaded.extensionM - Math.abs(recovered.extensionM)} m is below ${MIN_CANDIDATE_RECOVERY_M} m`);
      assertCandidateDiagnostics(recovered, "recovered", label);
    }

    assert.ok(Math.abs(coarseRecovered.extensionM - fineRecovered.extensionM) <= MAX_RESOLUTION_RECOVERED_EXTENSION_DELTA_M,
      `COARSE/FINE recovered extension delta ${Math.abs(coarseRecovered.extensionM - fineRecovered.extensionM)} m exceeds ${MAX_RESOLUTION_RECOVERED_EXTENSION_DELTA_M} m`);

    console.log(JSON.stringify({
      probe: "ANVIL-08/COMPLIANCE-RESOLUTION-C0",
      loadN: LOAD_N,
      loadedSteps: LOADED_STEPS,
      unloadedSteps: UNLOADED_STEPS,
      source: {
        coarse: { cellSizeM: coarseSource.matter.cellSizeM, cells: coarseSource.matter.cells.length, patches: coarseSource.patches.length },
        fine: { cellSizeM: fineSource.matter.cellSizeM, cells: fineSource.matter.cells.length, patches: fineSource.patches.length },
      },
      compiled: {
        coarse: {
          occupiedVolumeM3: coarseCompilation.occupiedVolumeM3,
          bodies: massSummary(coarseCompilation),
          relation: coarseCompilation.relation,
        },
        fine: {
          occupiedVolumeM3: fineCompilation.occupiedVolumeM3,
          bodies: massSummary(fineCompilation),
          relation: fineCompilation.relation,
        },
        fixedPatchControl: {
          occupiedVolumeM3: controlCompilation.occupiedVolumeM3,
          bodies: massSummary(controlCompilation),
          relation: controlCompilation.relation,
        },
      },
      solverReadback: {
        coarse: coarse.receipt,
        fine: fine.receipt,
        fixedPatchControl: control.receipt,
      },
      diagnostics: {
        coarse: { loaded: coarseLoaded, recovered: coarseRecovered },
        fine: { loaded: fineLoaded, recovered: fineRecovered },
        fixedPatchControl: { loaded: controlLoaded, recovered: controlRecovered },
      },
    }));
  } finally {
    coarse.dispose();
    fine.dispose();
    control.dispose();
  }
});
