import test from "node:test";
import assert from "node:assert/strict";
import {
  ElasticSeamPhysics,
  compileElasticSeam,
  createElasticSeamFixture,
} from "../.test-build/src/experiments/anvil-07-elastic-seam.js";

const LOAD_N = 1_000;
const LOADED_STEPS = 180;
const UNLOADED_STEPS = 120;

const MAX_RIGID_EXTENSION_M = 0.001;
const MIN_ELASTIC_LOADED_EXTENSION_M = 0.07;
const MAX_ELASTIC_LOADED_EXTENSION_M = 0.13;
const MAX_ELASTIC_LOADED_RELATIVE_SPEED_MPS = 0.10;
const MIN_FREE_LOADED_EXTENSION_M = 2.0;
const MIN_FREE_ADVANTAGE_M = 1.0;
const MAX_ELASTIC_RECOVERED_EXTENSION_M = 0.015;
const MAX_ELASTIC_RECOVERED_RELATIVE_SPEED_MPS = 0.15;
const MIN_ELASTIC_RECOVERY_M = 0.06;
const FREE_RECOVERY_ALLOWANCE_M = 0.05;
const MIN_FREE_REMAINING_EXTENSION_M = 0.20;
const MAX_ELASTIC_MOMENTUM_KG_MPS = 0.05;
const MAX_ELASTIC_BARYCENTER_DRIFT_M = 0.0005;
const RUNTIME_TUNING_TOLERANCE = 1e-6;

const EXPECTED_MOTION_LOCKS = Object.freeze({
  linearX: false,
  linearY: true,
  linearZ: true,
  angularX: true,
  angularY: true,
  angularZ: true,
});

function clone(value) {
  return structuredClone(value);
}

function totalMass(plan) {
  return plan.bodies.reduce((sum, body) => sum + body.massKg, 0);
}

function expectNear(actual, expected, tolerance, label) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} vs ${expected} ± ${tolerance}`);
}

function assertFiniteDiagnostics(diagnostics, label) {
  for (const [key, value] of Object.entries(diagnostics)) {
    assert.ok(Number.isFinite(value), `${label}.${key} is not finite: ${value}`);
  }
}

function bodySourceCells(compilation, bodyId) {
  const body = compilation.physicalPlan.bodies.find((candidate) => candidate.id === bodyId);
  assert.ok(body, `compiled body ${bodyId} missing`);
  return [...body.sourceCellIds].sort();
}

function bodyMass(compilation, bodyId) {
  const body = compilation.physicalPlan.bodies.find((candidate) => candidate.id === bodyId);
  assert.ok(body, `compiled body ${bodyId} missing`);
  return body.massKg;
}

function assertEquivalentElasticCompilation(actualCompilation, expectedCompilation, label) {
  const actual = actualCompilation.relation;
  const expected = expectedCompilation.relation;
  assert.ok(actual, `${label} relation missing`);
  assert.ok(expected, `${label} baseline relation missing`);
  assert.equal(actual.sourceSeamId, expected.sourceSeamId, `${label} source seam id changed`);
  assert.deepEqual(actual.endpointA, expected.endpointA, `${label} endpointA changed`);
  assert.deepEqual(actual.endpointB, expected.endpointB, `${label} endpointB changed`);
  assert.deepEqual(actual.normalWorld, expected.normalWorld, `${label} normal changed`);
  assert.deepEqual(
    bodySourceCells(actualCompilation, actual.bodyAId),
    bodySourceCells(expectedCompilation, expected.bodyAId),
    `${label} bodyA source-cell mapping changed`,
  );
  assert.deepEqual(
    bodySourceCells(actualCompilation, actual.bodyBId),
    bodySourceCells(expectedCompilation, expected.bodyBId),
    `${label} bodyB source-cell mapping changed`,
  );
  expectNear(bodyMass(actualCompilation, actual.bodyAId), bodyMass(expectedCompilation, expected.bodyAId), 1e-12, `${label} bodyA mass`);
  expectNear(bodyMass(actualCompilation, actual.bodyBId), bodyMass(expectedCompilation, expected.bodyBId), 1e-12, `${label} bodyB mass`);
  expectNear(actual.effectiveMassKg, expected.effectiveMassKg, 1e-12, `${label} effective mass`);
  expectNear(actual.linearHertz, expected.linearHertz, 1e-12, `${label} hertz`);
  expectNear(actual.linearDampingRatio, expected.linearDampingRatio, 1e-12, `${label} damping ratio`);
}

function assertRuntimeReceipt(receipt, compilation) {
  const expectedBodyIds = compilation.physicalPlan.bodies.map((body) => body.id).sort();
  const expectedJointCount = compilation.relation === null ? 0 : 1;

  assert.equal(receipt.engineVersion, "0.1.0");
  assert.equal(receipt.variant, compilation.variant);
  assert.equal(receipt.bodyCount, compilation.physicalPlan.bodies.length);
  assert.equal(receipt.jointCount, expectedJointCount);
  assert.equal(receipt.relationCreated, expectedJointCount === 1);
  assert.deepEqual(receipt.gravity, { x: 0, y: 0, z: 0 });
  assert.equal(receipt.contactsDisabled, true);

  for (const record of [
    receipt.bodyMassErrorsKg,
    receipt.bodyLocalCenterErrorsM,
    receipt.bodyLinearDamping,
    receipt.bodyAngularDamping,
    receipt.bodySleepEnabled,
    receipt.bodyMotionLocks,
  ]) {
    assert.deepEqual(Object.keys(record).sort(), expectedBodyIds, "runtime receipt body keys differ from compiled bodies");
  }

  for (const bodyId of expectedBodyIds) {
    assert.equal(receipt.bodyLinearDamping[bodyId], 0, `${bodyId} runtime linear damping is not zero`);
    assert.equal(receipt.bodyAngularDamping[bodyId], 0, `${bodyId} runtime angular damping is not zero`);
    assert.equal(receipt.bodySleepEnabled[bodyId], false, `${bodyId} runtime sleep unexpectedly enabled`);
    assert.deepEqual(receipt.bodyMotionLocks[bodyId], EXPECTED_MOTION_LOCKS, `${bodyId} runtime motion locks differ`);
  }

  for (const error of Object.values(receipt.bodyMassErrorsKg)) {
    assert.ok(Math.abs(error) <= 0.1, `runtime body mass error ${error} kg exceeds 0.1 kg`);
  }
  for (const error of Object.values(receipt.bodyLocalCenterErrorsM)) {
    assert.ok(Math.abs(error) <= 7e-5, `runtime local COM error ${error} m exceeds 7e-5 m`);
  }

  if (compilation.relation === null) {
    assert.equal(receipt.jointTuning, null);
  } else {
    assert.ok(receipt.jointTuning);
    expectNear(
      receipt.jointTuning.linearHertz,
      compilation.relation.linearHertz,
      RUNTIME_TUNING_TOLERANCE,
      "runtime weld linear hertz",
    );
    expectNear(
      receipt.jointTuning.linearDampingRatio,
      compilation.relation.linearDampingRatio,
      RUNTIME_TUNING_TOLERANCE,
      "runtime weld linear damping ratio",
    );
    expectNear(receipt.jointTuning.angularHertz, 0, RUNTIME_TUNING_TOLERANCE, "runtime weld angular hertz");
    expectNear(receipt.jointTuning.angularDampingRatio, 1, RUNTIME_TUNING_TOLERANCE, "runtime weld angular damping ratio");
  }
}

test("ANVIL-07 source and compiler gates preserve one local elastic seam without promoting solver semantics", () => {
  const fixture = createElasticSeamFixture();
  const untouchedSource = JSON.stringify(fixture);

  assert.equal(fixture.matter.cells.length, 7);
  assert.deepEqual(Object.keys(fixture.seam).sort(), [
    "endpointA",
    "endpointB",
    "id",
    "normalDampingNsPerM",
    "normalStiffnessNPerM",
  ]);
  assert.equal("linearHertz" in fixture.seam, false);
  assert.equal("linearDampingRatio" in fixture.seam, false);
  assert.equal("bodyAId" in fixture.seam, false);
  assert.equal("bodyBId" in fixture.seam, false);

  const rigid = compileElasticSeam(fixture, "RIGID");
  const elastic = compileElasticSeam(fixture, "ELASTIC");
  const free = compileElasticSeam(fixture, "FREE");
  assert.equal(JSON.stringify(fixture), untouchedSource, "compilation mutated authored source");

  assert.equal(rigid.physicalPlan.statistics.authoredCells, 7);
  assert.equal(elastic.physicalPlan.statistics.authoredCells, 7);
  assert.equal(free.physicalPlan.statistics.authoredCells, 7);
  assert.equal(rigid.physicalPlan.bodies.length, 1);
  assert.equal(elastic.physicalPlan.bodies.length, 2);
  assert.equal(free.physicalPlan.bodies.length, 2);
  assert.equal(rigid.relation, null);
  assert.notEqual(elastic.relation, null);
  assert.equal(free.relation, null);

  expectNear(totalMass(rigid.physicalPlan), 682.5, 1e-9, "RIGID total mass");
  expectNear(totalMass(elastic.physicalPlan), 682.5, 1e-9, "ELASTIC total mass");
  expectNear(totalMass(free.physicalPlan), 682.5, 1e-9, "FREE total mass");

  const relation = elastic.relation;
  assert.ok(relation);
  assert.equal(relation.sourceSeamId, "elastic-seam:0");
  assert.deepEqual(relation.endpointA, { cellId: "a:2", face: "x+" });
  assert.deepEqual(relation.endpointB, { cellId: "b:0", face: "x-" });
  assert.deepEqual(relation.normalWorld, { x: 1, y: 0, z: 0 });
  assert.ok(elastic.physicalPlan.bodies.find((body) => body.id === relation.bodyAId)?.sourceCellIds.includes("a:2"));
  assert.ok(elastic.physicalPlan.bodies.find((body) => body.id === relation.bodyBId)?.sourceCellIds.includes("b:0"));

  const bodyA = elastic.physicalPlan.bodies.find((body) => body.id === relation.bodyAId);
  const bodyB = elastic.physicalPlan.bodies.find((body) => body.id === relation.bodyBId);
  assert.ok(bodyA && bodyB);
  expectNear(bodyA.massKg, 292.5, 1e-9, "compiled left-island mass");
  expectNear(bodyB.massKg, 390.0, 1e-9, "compiled right-island mass");
  expectNear(relation.effectiveMassKg, 167.14285714285717, 1e-10, "derived effective mass");
  expectNear(relation.linearHertz, 1.2310514975102163, 1e-12, "derived weld linear hertz");
  expectNear(relation.linearDampingRatio, 0.6961432213383856, 1e-12, "derived weld damping ratio");
  expectNear(LOAD_N / relation.stiffnessNPerM, 0.1, 1e-12, "ideal static extension");

  const reordered = clone(fixture);
  reordered.matter.cells = [...reordered.matter.cells].reverse();
  assertEquivalentElasticCompilation(compileElasticSeam(reordered, "ELASTIC"), elastic, "source-order-only");

  const endpointSwapped = clone(fixture);
  [endpointSwapped.seam.endpointA, endpointSwapped.seam.endpointB] = [
    endpointSwapped.seam.endpointB,
    endpointSwapped.seam.endpointA,
  ];
  assertEquivalentElasticCompilation(compileElasticSeam(endpointSwapped, "ELASTIC"), elastic, "endpoint-swap-only");

  const reorderedAndSwapped = clone(endpointSwapped);
  reorderedAndSwapped.matter.cells = [...reorderedAndSwapped.matter.cells].reverse();
  assertEquivalentElasticCompilation(
    compileElasticSeam(reorderedAndSwapped, "ELASTIC"),
    elastic,
    "source-order-plus-endpoint-swap",
  );

  for (const [label, mutate, pattern] of [
    ["blank id", (seam) => { seam.id = ""; }, /id must be non-empty/],
    ["whitespace id", (seam) => { seam.id = " \t "; }, /id must be non-empty/],
    ["zero stiffness", (seam) => { seam.normalStiffnessNPerM = 0; }, /stiffness must be finite and positive/],
    ["negative stiffness", (seam) => { seam.normalStiffnessNPerM = -1; }, /stiffness must be finite and positive/],
    ["NaN stiffness", (seam) => { seam.normalStiffnessNPerM = Number.NaN; }, /stiffness must be finite and positive/],
    ["infinite stiffness", (seam) => { seam.normalStiffnessNPerM = Number.POSITIVE_INFINITY; }, /stiffness must be finite and positive/],
    ["negative damping", (seam) => { seam.normalDampingNsPerM = -1; }, /damping must be finite and non-negative/],
    ["NaN damping", (seam) => { seam.normalDampingNsPerM = Number.NaN; }, /damping must be finite and non-negative/],
    ["infinite damping", (seam) => { seam.normalDampingNsPerM = Number.POSITIVE_INFINITY; }, /damping must be finite and non-negative/],
  ]) {
    const invalid = clone(fixture);
    mutate(invalid.seam);
    assert.throws(() => compileElasticSeam(invalid, "ELASTIC"), pattern, label);
  }

  const zeroDamping = clone(fixture);
  zeroDamping.seam.normalDampingNsPerM = 0;
  const zeroDampingCompilation = compileElasticSeam(zeroDamping, "ELASTIC");
  assert.ok(zeroDampingCompilation.relation);
  assert.equal(zeroDampingCompilation.relation.dampingNsPerM, 0);
  assert.equal(zeroDampingCompilation.relation.linearDampingRatio, 0);

  const sameCell = clone(fixture);
  sameCell.seam.endpointB = { ...sameCell.seam.endpointA };
  assert.throws(() => compileElasticSeam(sameCell, "ELASTIC"), /distinct cells/);

  const wrongFace = clone(fixture);
  wrongFace.seam.endpointB = { cellId: "b:0", face: "x+" };
  assert.throws(() => compileElasticSeam(wrongFace, "ELASTIC"), /faces must be opposite/);

  const notAdjacent = clone(fixture);
  notAdjacent.seam.endpointB = { cellId: "b:1", face: "x-" };
  assert.throws(() => compileElasticSeam(notAdjacent, "ELASTIC"), /not adjacent/);

  const unknownCell = clone(fixture);
  unknownCell.seam.endpointB = { cellId: "missing", face: "x-" };
  assert.throws(() => compileElasticSeam(unknownCell, "ELASTIC"), /unknown endpoint cell/);

  const bypass = clone(fixture);
  bypass.matter.cells = [
    ...bypass.matter.cells,
    { id: "bridge:0", grid: { x: -1, y: 1, z: 0 }, materialId: "anvil-07-alloy" },
    { id: "bridge:1", grid: { x: 0, y: 1, z: 0 }, materialId: "anvil-07-alloy" },
  ];
  assert.throws(() => compileElasticSeam(bypass, "ELASTIC"), /alternate rigid path bypasses/);
});

test("ANVIL-07 C0 discriminates RIGID / ELASTIC / FREE under the frozen load-unload schedule", async () => {
  const fixture = createElasticSeamFixture();
  const rigidCompilation = compileElasticSeam(fixture, "RIGID");
  const elasticCompilation = compileElasticSeam(fixture, "ELASTIC");
  const freeCompilation = compileElasticSeam(fixture, "FREE");
  assert.ok(elasticCompilation.relation);

  const elasticBodyA = elasticCompilation.physicalPlan.bodies.find(
    (body) => body.id === elasticCompilation.relation.bodyAId,
  );
  const elasticBodyB = elasticCompilation.physicalPlan.bodies.find(
    (body) => body.id === elasticCompilation.relation.bodyBId,
  );
  assert.ok(elasticBodyA && elasticBodyB);

  const rigid = await ElasticSeamPhysics.create(rigidCompilation, fixture.matter.materials);
  const elastic = await ElasticSeamPhysics.create(elasticCompilation, fixture.matter.materials);
  const free = await ElasticSeamPhysics.create(freeCompilation, fixture.matter.materials);

  try {
    assertRuntimeReceipt(rigid.receipt, rigidCompilation);
    assertRuntimeReceipt(elastic.receipt, elasticCompilation);
    assertRuntimeReceipt(free.receipt, freeCompilation);

    for (let step = 0; step < LOADED_STEPS; step += 1) {
      rigid.applyOutwardLoad(LOAD_N);
      elastic.applyOutwardLoad(LOAD_N);
      free.applyOutwardLoad(LOAD_N);
      rigid.step();
      elastic.step();
      free.step();
    }

    const rigidLoaded = rigid.diagnostics();
    const elasticLoaded = elastic.diagnostics();
    const freeLoaded = free.diagnostics();
    assertFiniteDiagnostics(rigidLoaded, "RIGID.loaded");
    assertFiniteDiagnostics(elasticLoaded, "ELASTIC.loaded");
    assertFiniteDiagnostics(freeLoaded, "FREE.loaded");

    assert.ok(Math.abs(rigidLoaded.extensionM) <= MAX_RIGID_EXTENSION_M,
      `RIGID loaded extension ${rigidLoaded.extensionM} m exceeds ${MAX_RIGID_EXTENSION_M} m`);
    assert.ok(elasticLoaded.extensionM >= MIN_ELASTIC_LOADED_EXTENSION_M,
      `ELASTIC loaded extension ${elasticLoaded.extensionM} m is below ${MIN_ELASTIC_LOADED_EXTENSION_M} m`);
    assert.ok(elasticLoaded.extensionM <= MAX_ELASTIC_LOADED_EXTENSION_M,
      `ELASTIC loaded extension ${elasticLoaded.extensionM} m exceeds ${MAX_ELASTIC_LOADED_EXTENSION_M} m`);
    assert.ok(Math.abs(elasticLoaded.relativeSpeedMps) <= MAX_ELASTIC_LOADED_RELATIVE_SPEED_MPS,
      `ELASTIC loaded relative speed ${elasticLoaded.relativeSpeedMps} m/s exceeds ${MAX_ELASTIC_LOADED_RELATIVE_SPEED_MPS} m/s`);
    assert.ok(freeLoaded.extensionM >= MIN_FREE_LOADED_EXTENSION_M,
      `FREE loaded extension ${freeLoaded.extensionM} m is below ${MIN_FREE_LOADED_EXTENSION_M} m`);
    assert.ok(freeLoaded.extensionM - elasticLoaded.extensionM >= MIN_FREE_ADVANTAGE_M,
      `FREE minus ELASTIC loaded extension ${freeLoaded.extensionM - elasticLoaded.extensionM} m is below ${MIN_FREE_ADVANTAGE_M} m`);
    assert.ok(elasticLoaded.linearMomentumMagnitudeKgMps <= MAX_ELASTIC_MOMENTUM_KG_MPS,
      `ELASTIC loaded momentum ${elasticLoaded.linearMomentumMagnitudeKgMps} kg·m/s exceeds ${MAX_ELASTIC_MOMENTUM_KG_MPS}`);
    assert.ok(elasticLoaded.barycenterDisplacementM <= MAX_ELASTIC_BARYCENTER_DRIFT_M,
      `ELASTIC loaded barycenter drift ${elasticLoaded.barycenterDisplacementM} m exceeds ${MAX_ELASTIC_BARYCENTER_DRIFT_M} m`);

    rigid.step(UNLOADED_STEPS);
    elastic.step(UNLOADED_STEPS);
    free.step(UNLOADED_STEPS);

    const rigidRecovered = rigid.diagnostics();
    const elasticRecovered = elastic.diagnostics();
    const freeRecovered = free.diagnostics();
    assertFiniteDiagnostics(rigidRecovered, "RIGID.recovered");
    assertFiniteDiagnostics(elasticRecovered, "ELASTIC.recovered");
    assertFiniteDiagnostics(freeRecovered, "FREE.recovered");

    console.log(JSON.stringify({
      probe: "ANVIL-07/ELASTIC-SEAM-C0",
      sourceCells: fixture.matter.cells.length,
      compiledBodyCounts: {
        rigid: rigidCompilation.physicalPlan.bodies.length,
        elastic: elasticCompilation.physicalPlan.bodies.length,
        free: freeCompilation.physicalPlan.bodies.length,
      },
      runtimeBodyCounts: {
        rigid: rigid.receipt.bodyCount,
        elastic: elastic.receipt.bodyCount,
        free: free.receipt.bodyCount,
      },
      runtimeJointCounts: {
        rigid: rigid.receipt.jointCount,
        elastic: elastic.receipt.jointCount,
        free: free.receipt.jointCount,
      },
      loadN: LOAD_N,
      loadedSteps: LOADED_STEPS,
      unloadedSteps: UNLOADED_STEPS,
      massKg: {
        rigidTotal: totalMass(rigidCompilation.physicalPlan),
        elasticTotal: totalMass(elasticCompilation.physicalPlan),
        freeTotal: totalMass(freeCompilation.physicalPlan),
        left: elasticBodyA.massKg,
        right: elasticBodyB.massKg,
        effective: elasticCompilation.relation.effectiveMassKg,
      },
      derived: {
        linearHertz: elasticCompilation.relation.linearHertz,
        linearDampingRatio: elasticCompilation.relation.linearDampingRatio,
        idealStaticExtensionM: LOAD_N / elasticCompilation.relation.stiffnessNPerM,
      },
      solverReadback: {
        rigid: rigid.receipt,
        elastic: elastic.receipt,
        free: free.receipt,
      },
      rigid: { loaded: rigidLoaded, recovered: rigidRecovered },
      elastic: { loaded: elasticLoaded, recovered: elasticRecovered },
      free: { loaded: freeLoaded, recovered: freeRecovered },
    }));

    assert.ok(Math.abs(rigidRecovered.extensionM) <= MAX_RIGID_EXTENSION_M,
      `RIGID recovered extension ${rigidRecovered.extensionM} m exceeds ${MAX_RIGID_EXTENSION_M} m`);
    assert.ok(Math.abs(elasticRecovered.extensionM) <= MAX_ELASTIC_RECOVERED_EXTENSION_M,
      `ELASTIC recovered extension ${elasticRecovered.extensionM} m exceeds ${MAX_ELASTIC_RECOVERED_EXTENSION_M} m`);
    assert.ok(Math.abs(elasticRecovered.relativeSpeedMps) <= MAX_ELASTIC_RECOVERED_RELATIVE_SPEED_MPS,
      `ELASTIC recovered relative speed ${elasticRecovered.relativeSpeedMps} m/s exceeds ${MAX_ELASTIC_RECOVERED_RELATIVE_SPEED_MPS} m/s`);
    assert.ok(elasticLoaded.extensionM - Math.abs(elasticRecovered.extensionM) >= MIN_ELASTIC_RECOVERY_M,
      `ELASTIC recovery ${elasticLoaded.extensionM - Math.abs(elasticRecovered.extensionM)} m is below ${MIN_ELASTIC_RECOVERY_M} m`);
    assert.ok(freeRecovered.extensionM >= freeLoaded.extensionM - FREE_RECOVERY_ALLOWANCE_M,
      `FREE recovered extension ${freeRecovered.extensionM} m fell below loaded ${freeLoaded.extensionM} m beyond ${FREE_RECOVERY_ALLOWANCE_M} m allowance`);
    assert.ok(Math.abs(freeRecovered.extensionM) > MIN_FREE_REMAINING_EXTENSION_M,
      `FREE recovered extension ${freeRecovered.extensionM} m incorrectly converged near rest`);
    assert.ok(elasticRecovered.linearMomentumMagnitudeKgMps <= MAX_ELASTIC_MOMENTUM_KG_MPS,
      `ELASTIC recovered momentum ${elasticRecovered.linearMomentumMagnitudeKgMps} kg·m/s exceeds ${MAX_ELASTIC_MOMENTUM_KG_MPS}`);
    assert.ok(elasticRecovered.barycenterDisplacementM <= MAX_ELASTIC_BARYCENTER_DRIFT_M,
      `ELASTIC recovered barycenter drift ${elasticRecovered.barycenterDisplacementM} m exceeds ${MAX_ELASTIC_BARYCENTER_DRIFT_M} m`);
  } finally {
    rigid.dispose();
    elastic.dispose();
    free.dispose();
  }
});
