import test from "node:test";
import assert from "node:assert/strict";
import {
  compileComplianceResolution,
  createComplianceResolutionFixture,
} from "../.test-build/src/experiments/anvil-08-compliance-resolution.js";

function clone(value) {
  return structuredClone(value);
}

function expectNear(actual, expected, tolerance, label) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} vs ${expected} ± ${tolerance}`);
}

function totalMass(plan) {
  return plan.bodies.reduce((sum, body) => sum + body.massKg, 0);
}

function bodyByMass(plan, expectedMassKg) {
  const body = plan.bodies.find((candidate) => Math.abs(candidate.massKg - expectedMassKg) <= 1e-9);
  assert.ok(body, `missing body near ${expectedMassKg} kg`);
  return body;
}

function assertVecNear(actual, expected, tolerance, label) {
  expectNear(actual.x, expected.x, tolerance, `${label}.x`);
  expectNear(actual.y, expected.y, tolerance, `${label}.y`);
  expectNear(actual.z, expected.z, tolerance, `${label}.z`);
}

function assertPhysicalRegionMeaningEqual(left, right, label) {
  expectNear(totalMass(left.physicalPlan), totalMass(right.physicalPlan), 1e-9, `${label} total mass`);
  for (const massKg of [292.5, 390.0]) {
    const leftBody = bodyByMass(left.physicalPlan, massKg);
    const rightBody = bodyByMass(right.physicalPlan, massKg);
    assertVecNear(leftBody.centerOfMassWorld, rightBody.centerOfMassWorld, 1e-12, `${label} ${massKg}kg COM`);
  }
  expectNear(left.relation.totalAreaM2, right.relation.totalAreaM2, 1e-12, `${label} total area`);
  expectNear(left.relation.stiffnessNPerM, right.relation.stiffnessNPerM, 1e-9, `${label} stiffness`);
  expectNear(left.relation.dampingNsPerM, right.relation.dampingNsPerM, 1e-9, `${label} damping`);
  expectNear(left.relation.effectiveMassKg, right.relation.effectiveMassKg, 1e-10, `${label} effective mass`);
  expectNear(left.relation.linearHertz, right.relation.linearHertz, 1e-12, `${label} hertz`);
  expectNear(left.relation.linearDampingRatio, right.relation.linearDampingRatio, 1e-12, `${label} damping ratio`);
  assert.deepEqual(left.relation.normalWorld, right.relation.normalWorld, `${label} normal`);
  assertVecNear(left.relation.restPointWorld, right.relation.restPointWorld, 1e-12, `${label} centroid`);
}

function assertSamePhysicalBodies(left, right, label) {
  expectNear(totalMass(left.physicalPlan), totalMass(right.physicalPlan), 1e-9, `${label} total mass`);
  for (const massKg of [292.5, 390.0]) {
    const leftBody = bodyByMass(left.physicalPlan, massKg);
    const rightBody = bodyByMass(right.physicalPlan, massKg);
    assert.equal(leftBody.sourceCellIds.length, rightBody.sourceCellIds.length, `${label} ${massKg}kg source-cell count`);
    assertVecNear(leftBody.centerOfMassWorld, rightBody.centerOfMassWorld, 1e-12, `${label} ${massKg}kg COM`);
  }
  expectNear(left.relation.totalAreaM2, right.relation.totalAreaM2, 1e-12, `${label} total area`);
  assert.deepEqual(left.relation.normalWorld, right.relation.normalWorld, `${label} normal`);
  assertVecNear(left.relation.restPointWorld, right.relation.restPointWorld, 1e-12, `${label} centroid`);
}

test("ANVIL-08 A/B preserves one physical compliant interface across exact 2x authored refinement", () => {
  const coarseSource = createComplianceResolutionFixture("COARSE");
  const fineSource = createComplianceResolutionFixture("FINE");
  const coarseUntouched = JSON.stringify(coarseSource);
  const fineUntouched = JSON.stringify(fineSource);

  assert.equal(coarseSource.matter.cells.length, 7);
  assert.equal(fineSource.matter.cells.length, 56);
  assert.equal(coarseSource.matter.cellSizeM, 0.5);
  assert.equal(fineSource.matter.cellSizeM, 0.25);
  assert.equal(coarseSource.matter.materials.length, 1);
  assert.equal(fineSource.matter.materials.length, 1);
  assert.equal(coarseSource.matter.materials[0]?.densityKgM3, 780);
  assert.equal(fineSource.matter.materials[0]?.densityKgM3, 780);
  assert.equal(coarseSource.patches.length, 1);
  assert.equal(fineSource.patches.length, 4);

  for (const source of [coarseSource, fineSource]) {
    for (const patch of source.patches) {
      assert.deepEqual(Object.keys(patch).sort(), [
        "id",
        "normalDampingPerAreaNsPerM3",
        "normalStiffnessPerAreaNPerM3",
        "target",
      ]);
      assert.equal("bodyId" in patch, false);
      assert.equal("jointId" in patch, false);
      assert.equal("linearHertz" in patch, false);
      assert.equal("linearDampingRatio" in patch, false);
      assert.equal("areaM2" in patch, false);
      assert.equal("stiffnessNPerM" in patch, false);
      assert.equal("dampingNsPerM" in patch, false);
    }
  }

  const coarse = compileComplianceResolution(coarseSource, "AREA");
  const fine = compileComplianceResolution(fineSource, "AREA");
  const naive = compileComplianceResolution(fineSource, "FIXED_PATCH_CONTROL");
  assert.equal(JSON.stringify(coarseSource), coarseUntouched, "COARSE compilation mutated authored source");
  assert.equal(JSON.stringify(fineSource), fineUntouched, "FINE compilation mutated authored source");

  expectNear(coarse.occupiedVolumeM3, 0.875, 1e-12, "COARSE occupied volume");
  expectNear(fine.occupiedVolumeM3, 0.875, 1e-12, "FINE occupied volume");
  expectNear(totalMass(coarse.physicalPlan), 682.5, 1e-9, "COARSE total mass");
  expectNear(totalMass(fine.physicalPlan), 682.5, 1e-9, "FINE total mass");

  assert.equal(coarse.physicalPlan.bodies.length, 2);
  assert.equal(fine.physicalPlan.bodies.length, 2);
  assert.equal(naive.physicalPlan.bodies.length, 2);

  const coarseLeft = bodyByMass(coarse.physicalPlan, 292.5);
  const coarseRight = bodyByMass(coarse.physicalPlan, 390.0);
  const fineLeft = bodyByMass(fine.physicalPlan, 292.5);
  const fineRight = bodyByMass(fine.physicalPlan, 390.0);
  assert.equal(coarseLeft.sourceCellIds.length, 3);
  assert.equal(coarseRight.sourceCellIds.length, 4);
  assert.equal(fineLeft.sourceCellIds.length, 24);
  assert.equal(fineRight.sourceCellIds.length, 32);
  assertVecNear(coarseLeft.centerOfMassWorld, { x: -0.5833333333333334, y: 0.4166666666666667, z: 0.25 }, 1e-12, "COARSE left COM");
  assertVecNear(coarseRight.centerOfMassWorld, { x: 0.75, y: 0.125, z: 0.25 }, 1e-12, "COARSE right COM");
  assertVecNear(fineLeft.centerOfMassWorld, coarseLeft.centerOfMassWorld, 1e-12, "FINE left COM equivalence");
  assertVecNear(fineRight.centerOfMassWorld, coarseRight.centerOfMassWorld, 1e-12, "FINE right COM equivalence");

  assert.equal(coarse.relation.sourcePatchCount, 1);
  assert.equal(fine.relation.sourcePatchCount, 4);
  assert.equal(naive.relation.sourcePatchCount, 4);
  expectNear(coarse.relation.totalAreaM2, 0.25, 1e-12, "COARSE interface area");
  expectNear(fine.relation.totalAreaM2, 0.25, 1e-12, "FINE interface area");
  assertVecNear(coarse.relation.restPointWorld, { x: 0, y: 0.25, z: 0.25 }, 1e-12, "COARSE interface centroid");
  assertVecNear(fine.relation.restPointWorld, coarse.relation.restPointWorld, 1e-12, "FINE interface centroid");
  assert.deepEqual(coarse.relation.normalWorld, { x: 1, y: 0, z: 0 });
  assert.deepEqual(fine.relation.normalWorld, coarse.relation.normalWorld);

  assert.deepEqual(coarse.patches[0]?.resolvedNeighbor, { cellId: "b:0", face: "x-" });
  const expectedFineNeighbors = new Map([
    ["compliance:fine:00", { cellId: "b:0/000", face: "x-" }],
    ["compliance:fine:01", { cellId: "b:0/001", face: "x-" }],
    ["compliance:fine:10", { cellId: "b:0/010", face: "x-" }],
    ["compliance:fine:11", { cellId: "b:0/011", face: "x-" }],
  ]);
  for (const patch of fine.patches) {
    assert.deepEqual(patch.resolvedNeighbor, expectedFineNeighbors.get(patch.sourcePatchId), `${patch.sourcePatchId} resolved neighbor`);
  }

  expectNear(coarse.relation.stiffnessNPerM, 10_000, 1e-9, "COARSE aggregate stiffness");
  expectNear(coarse.relation.dampingNsPerM, 1_800, 1e-9, "COARSE aggregate damping");
  expectNear(fine.relation.stiffnessNPerM, 10_000, 1e-9, "FINE aggregate stiffness");
  expectNear(fine.relation.dampingNsPerM, 1_800, 1e-9, "FINE aggregate damping");
  expectNear(coarse.relation.effectiveMassKg, 167.14285714285717, 1e-10, "COARSE effective mass");
  expectNear(fine.relation.effectiveMassKg, coarse.relation.effectiveMassKg, 1e-10, "FINE effective mass");
  expectNear(coarse.relation.linearHertz, 1.2310514975102163, 1e-12, "COARSE hertz");
  expectNear(fine.relation.linearHertz, coarse.relation.linearHertz, 1e-12, "FINE hertz");
  expectNear(coarse.relation.linearDampingRatio, 0.6961432213383856, 1e-12, "COARSE damping ratio");
  expectNear(fine.relation.linearDampingRatio, coarse.relation.linearDampingRatio, 1e-12, "FINE damping ratio");

  for (const patch of fine.patches) {
    expectNear(patch.areaM2, 0.0625, 1e-12, `${patch.sourcePatchId} area`);
    expectNear(patch.stiffnessNPerM, 2_500, 1e-9, `${patch.sourcePatchId} stiffness`);
    expectNear(patch.dampingNsPerM, 450, 1e-9, `${patch.sourcePatchId} damping`);
  }

  expectNear(naive.relation.stiffnessNPerM, 40_000, 1e-9, "naive aggregate stiffness");
  expectNear(naive.relation.dampingNsPerM, 7_200, 1e-9, "naive aggregate damping");
  expectNear(naive.relation.linearHertz, 2.4621029950204325, 1e-12, "naive hertz");
  expectNear(naive.relation.linearDampingRatio, 1.3922864426767712, 1e-12, "naive damping ratio");
  assertSamePhysicalBodies(fine, naive, "FINE candidate/control physical identity");

  assertPhysicalRegionMeaningEqual(coarse, fine, "COARSE/FINE candidate");

  const cellsOnlyReordered = clone(fineSource);
  cellsOnlyReordered.matter.cells = [...cellsOnlyReordered.matter.cells].reverse();
  const cellsOnlyCompilation = compileComplianceResolution(cellsOnlyReordered, "AREA");
  assertPhysicalRegionMeaningEqual(fine, cellsOnlyCompilation, "FINE cell-order invariance");
  assert.deepEqual(cellsOnlyCompilation.relation.sourcePatchIds, fine.relation.sourcePatchIds);

  const patchesOnlyReordered = clone(fineSource);
  patchesOnlyReordered.patches = [...patchesOnlyReordered.patches].reverse();
  const patchesOnlyCompilation = compileComplianceResolution(patchesOnlyReordered, "AREA");
  assertPhysicalRegionMeaningEqual(fine, patchesOnlyCompilation, "FINE patch-order invariance");
  assert.deepEqual(patchesOnlyCompilation.relation.sourcePatchIds, fine.relation.sourcePatchIds);

  const zeroDamping = clone(coarseSource);
  zeroDamping.patches[0].normalDampingPerAreaNsPerM3 = 0;
  expectNear(compileComplianceResolution(zeroDamping, "AREA").relation.dampingNsPerM, 0, 1e-12, "zero damping boundary");

  assert.throws(() => compileComplianceResolution(coarseSource, "UNKNOWN"), /unknown compilation mode/);

  for (const badId of ["", "   "]) {
    const invalid = clone(coarseSource);
    invalid.patches[0].id = badId;
    assert.throws(() => compileComplianceResolution(invalid, "AREA"), /id must be non-empty/);
  }

  const duplicateId = clone(fineSource);
  duplicateId.patches[1].id = duplicateId.patches[0].id;
  assert.throws(() => compileComplianceResolution(duplicateId, "AREA"), /duplicate patch id/);

  for (const stiffness of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    const invalid = clone(coarseSource);
    invalid.patches[0].normalStiffnessPerAreaNPerM3 = stiffness;
    assert.throws(() => compileComplianceResolution(invalid, "AREA"), /stiffness-per-area/);
  }
  for (const damping of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
    const invalid = clone(coarseSource);
    invalid.patches[0].normalDampingPerAreaNsPerM3 = damping;
    assert.throws(() => compileComplianceResolution(invalid, "AREA"), /damping-per-area/);
  }

  const unknownCell = clone(coarseSource);
  unknownCell.patches[0].target.cellId = "missing";
  assert.throws(() => compileComplianceResolution(unknownCell, "AREA"), /unknown source cell/);

  const invalidFace = clone(coarseSource);
  invalidFace.patches[0].target.face = "bad-face";
  assert.throws(() => compileComplianceResolution(invalidFace, "AREA"), /invalid face/);

  const exteriorFace = clone(coarseSource);
  exteriorFace.patches[0].target = { cellId: "a:1", face: "x-" };
  assert.throws(() => compileComplianceResolution(exteriorFace, "AREA"), /has no adjacent matter/);

  const duplicatePhysicalPair = clone(coarseSource);
  duplicatePhysicalPair.patches.push({
    ...clone(duplicatePhysicalPair.patches[0]),
    id: "compliance:duplicate-opposite",
    target: { cellId: "b:0", face: "x-" },
  });
  assert.throws(() => compileComplianceResolution(duplicatePhysicalPair, "AREA"), /marked more than once/);

  const nonCoplanar = clone(coarseSource);
  nonCoplanar.patches.push({
    ...clone(nonCoplanar.patches[0]),
    id: "compliance:non-coplanar",
    target: { cellId: "a:0", face: "x+" },
  });
  assert.throws(() => compileComplianceResolution(nonCoplanar, "AREA"), /coplanar/);

  const mixedNormal = clone(coarseSource);
  mixedNormal.patches.push({
    ...clone(mixedNormal.patches[0]),
    id: "compliance:mixed-normal",
    target: { cellId: "a:0", face: "y+" },
  });
  assert.throws(() => compileComplianceResolution(mixedNormal, "AREA"), /canonical normal/);
});
