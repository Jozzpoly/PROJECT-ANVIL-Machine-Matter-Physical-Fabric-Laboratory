import test from "node:test";
import assert from "node:assert/strict";
import { compileBearing } from "../.test-build/src/experiments/anvil-02-bearing.js";
import {
  MultiBearingPhysics,
  compileMultiBearing,
} from "../.test-build/src/experiments/o1x-multi-bearing-composition.js";

const material = Object.freeze({
  id: "o1x:alloy",
  densityKgM3: 780,
  friction: 0.45,
  displayColor: "#8bbfd9",
});

function matter(cells, revision) {
  return {
    schema: "anvil-matter/0",
    revision,
    cellSizeM: 0.5,
    materials: [material],
    cells,
  };
}

function cell(id, x, y, z = 0) {
  return { id, grid: { x, y, z }, materialId: material.id };
}

function chainFixture() {
  const source = matter([
    cell("A", 0, 0),
    cell("B", 1, 0),
    cell("C", 2, 0),
  ], "o1x/chain");
  const bearings = [
    {
      id: "bearing:ab",
      endpointA: { cellId: "A", face: "x+" },
      endpointB: { cellId: "B", face: "x-" },
      freeAxis: "z",
    },
    {
      id: "bearing:bc",
      endpointA: { cellId: "B", face: "x+" },
      endpointB: { cellId: "C", face: "x-" },
      freeAxis: "z",
    },
  ];
  return { matter: source, bearings };
}

function loopFixture() {
  const source = matter([
    cell("A", 0, 0),
    cell("B", 1, 0),
    cell("C", 0, 1),
    cell("D", 1, 1),
  ], "o1x/loop");
  const lower = {
    id: "bearing:lower",
    endpointA: { cellId: "A", face: "x+" },
    endpointB: { cellId: "B", face: "x-" },
    freeAxis: "z",
  };
  const upper = {
    id: "bearing:upper",
    endpointA: { cellId: "C", face: "x+" },
    endpointB: { cellId: "D", face: "x-" },
    freeAxis: "z",
  };
  return { matter: source, bearings: [lower, upper], lower, upper };
}

function finiteRelation(relation) {
  for (const value of [
    relation.pivotWorld,
    relation.axisWorld,
    relation.localAnchorA,
    relation.localAnchorB,
    relation.localAxisA,
    relation.localAxisB,
  ]) {
    assert.ok([value.x, value.y, value.z].every(Number.isFinite));
  }
}

function maxValue(record) {
  return Math.max(...Object.values(record));
}

test("O1-X CHAIN lowers two Bearing marks into one deterministic three-body physical plan", () => {
  const fixture = chainFixture();
  const forward = compileMultiBearing(fixture);
  const reverse = compileMultiBearing({ ...fixture, bearings: [...fixture.bearings].reverse() });

  assert.deepEqual(reverse, forward, "multi-bearing composition depends on authored Bearing array order");
  assert.equal(forward.physicalPlan.bodies.length, 3);
  assert.equal(forward.relations.length, 2);
  assert.deepEqual(forward.relations.map((relation) => relation.sourceBearingId), ["bearing:ab", "bearing:bc"]);

  for (const relation of forward.relations) {
    assert.notEqual(relation.bodyAId, relation.bodyBId);
    assert.ok(forward.physicalPlan.bodies.some((body) => body.id === relation.bodyAId));
    assert.ok(forward.physicalPlan.bodies.some((body) => body.id === relation.bodyBId));
    finiteRelation(relation);
  }

  assert.equal(forward.physicalPlan.cellToBody.A, forward.relations[0].bodyAId);
  assert.equal(forward.physicalPlan.cellToBody.B, forward.relations[0].bodyBId);
  assert.equal(forward.physicalPlan.cellToBody.B, forward.relations[1].bodyAId);
  assert.equal(forward.physicalPlan.cellToBody.C, forward.relations[1].bodyBId);
});

test("O1-X LOOP proves collective seams can change topology even when each Bearing fails in isolation", () => {
  const fixture = loopFixture();

  assert.throws(
    () => compileBearing({ matter: fixture.matter, bearing: fixture.lower }),
    /alternate rigid path bypasses the interface/u,
  );
  assert.throws(
    () => compileBearing({ matter: fixture.matter, bearing: fixture.upper }),
    /alternate rigid path bypasses the interface/u,
  );

  const compiled = compileMultiBearing(fixture);
  assert.equal(compiled.physicalPlan.bodies.length, 2);
  assert.equal(compiled.relations.length, 2);

  const components = compiled.physicalPlan.bodies
    .map((body) => [...body.sourceCellIds].sort())
    .sort((left, right) => left[0].localeCompare(right[0]));
  assert.deepEqual(components, [["A", "C"], ["B", "D"]]);

  const bodyPairs = compiled.relations.map((relation) => [relation.bodyAId, relation.bodyBId]);
  assert.deepEqual(bodyPairs[0], bodyPairs[1], "collective loop Bearings did not resolve against one shared body pair");
  for (const relation of compiled.relations) finiteRelation(relation);
});

test("O1-X real Box3D chain keeps both Bearing anchors while no-relation control diverges", async () => {
  const fixture = chainFixture();
  const sourceBefore = structuredClone(fixture);
  const compiled = compileMultiBearing(fixture);
  const bodyA = compiled.physicalPlan.cellToBody.A;
  const bodyB = compiled.physicalPlan.cellToBody.B;
  const bodyC = compiled.physicalPlan.cellToBody.C;
  assert.ok(bodyA && bodyB && bodyC);

  const velocities = {
    [bodyA]: { x: -1, y: 0, z: 0 },
    [bodyB]: { x: 0, y: 0, z: 0 },
    [bodyC]: { x: 1, y: 0, z: 0 },
  };

  const constrained = await MultiBearingPhysics.create(compiled, fixture.matter.materials, {
    createRelations: true,
    initialLinearVelocityByPlanBodyId: velocities,
  });
  const control = await MultiBearingPhysics.create(compiled, fixture.matter.materials, {
    createRelations: false,
    initialLinearVelocityByPlanBodyId: velocities,
  });

  try {
    assert.equal(constrained.receipt.relationCount, 2);
    assert.equal(control.receipt.relationCount, 0);
    constrained.step(60);
    control.step(60);

    const constrainedError = maxValue(constrained.anchorErrorsM());
    const controlError = maxValue(control.anchorErrorsM());
    assert.ok(
      constrainedError <= 1e-3,
      `multi-bearing constrained anchor error ${constrainedError} m exceeds 1e-3 m`,
    );
    assert.ok(
      controlError >= 0.5,
      `multi-bearing no-relation control separated only ${controlError} m`,
    );

    for (const snapshot of constrained.snapshots()) {
      assert.ok([
        snapshot.position.x,
        snapshot.position.y,
        snapshot.position.z,
        snapshot.rotation.x,
        snapshot.rotation.y,
        snapshot.rotation.z,
        snapshot.rotation.w,
      ].every(Number.isFinite));
    }
    assert.deepEqual(fixture, sourceBefore, "O1-X runtime mutated authored fixture");
  } finally {
    constrained.dispose();
    control.dispose();
  }
});
