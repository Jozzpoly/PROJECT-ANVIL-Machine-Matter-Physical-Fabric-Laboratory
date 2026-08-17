import test from "node:test";
import assert from "node:assert/strict";
import { compileMatter } from "../.test-build/src/compiler.js";
import { createCollapseFixture } from "../.test-build/src/fixture.js";

function expectedMass(document) {
  const materialById = new Map(document.materials.map((material) => [material.id, material]));
  const volume = document.cellSizeM ** 3;
  return document.cells.reduce((sum, cell) => {
    const material = materialById.get(cell.materialId);
    assert.ok(material);
    return sum + material.densityKgM3 * volume;
  }, 0);
}

test("intact authored matter collapses to one rigid body", () => {
  const document = createCollapseFixture(false);
  const plan = compileMatter(document);
  assert.equal(document.cells.length, 51);
  assert.equal(plan.statistics.rigidBodies, 1);
  assert.ok(plan.statistics.collisionBoxes < plan.statistics.authoredCells);
  assert.ok(plan.statistics.reductionRatio > 2);
  assert.equal(Object.keys(plan.cellToBody).length, document.cells.length);
  for (const cell of document.cells) assert.ok(plan.cellToBody[cell.id]);
  const totalMass = plan.bodies.reduce((sum, body) => sum + body.massKg, 0);
  assert.ok(Math.abs(totalMass - expectedMass(document)) < 1e-9);
});

test("removing one bridge cell changes topology without changing surviving identity", () => {
  const intact = createCollapseFixture(false);
  const cut = createCollapseFixture(true);
  const intactPlan = compileMatter(intact);
  const cutPlan = compileMatter(cut);
  assert.equal(cut.cells.length, 50);
  assert.equal(intactPlan.statistics.rigidBodies, 1);
  assert.equal(cutPlan.statistics.rigidBodies, 2);
  for (const cell of cut.cells) {
    assert.ok(intactPlan.cellToBody[cell.id]);
    assert.ok(cutPlan.cellToBody[cell.id]);
  }
  assert.equal(cutPlan.cellToBody["cell:-1:0:0"] !== cutPlan.cellToBody["cell:1:0:0"], true);
});

test("compilation is deterministic under authored array reordering", () => {
  const document = createCollapseFixture(false);
  const reversed = { ...document, cells: [...document.cells].reverse() };
  assert.deepEqual(compileMatter(reversed), compileMatter(document));
});
