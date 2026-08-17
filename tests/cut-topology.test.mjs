import test from "node:test";
import assert from "node:assert/strict";
import { compileMatter } from "../.test-build/src/compiler.js";
import { createCollapseFixture } from "../.test-build/src/fixture.js";
import {
  analyzeProvenanceLineage,
  bodyProvenanceFromPhysicalPlan,
} from "../.test-build/src/foundation/provenance.js";

const CUT_CONNECTION = ["cell:-1:0:0", "cell:0:0:0"];

function totalMass(plan) {
  return plan.bodies.reduce((sum, body) => sum + body.massKg, 0);
}

function sortedSourceIds(document) {
  return document.cells.map((cell) => cell.id).sort();
}

test("CUT topology seam splits one rigid island without deleting matter or mass", () => {
  const document = createCollapseFixture(false);
  const before = compileMatter(document);
  const after = compileMatter(
    { ...document, revision: "anvil-01-cut/severed" },
    { blockedFaceConnections: [CUT_CONNECTION] },
  );

  assert.equal(document.cells.length, 51);
  assert.equal(before.statistics.authoredCells, 51);
  assert.equal(after.statistics.authoredCells, 51);
  assert.equal(before.statistics.rigidBodies, 1);
  assert.equal(after.statistics.rigidBodies, 2);

  const beforeSourceIds = Object.keys(before.cellToBody).sort();
  const afterSourceIds = Object.keys(after.cellToBody).sort();
  assert.deepEqual(beforeSourceIds, sortedSourceIds(document));
  assert.deepEqual(afterSourceIds, beforeSourceIds);

  assert.ok(
    Math.abs(totalMass(after) - totalMass(before)) < 1e-9,
    `mass changed across connectivity-only CUT: ${totalMass(before)} -> ${totalMass(after)}`,
  );

  assert.notEqual(after.cellToBody["cell:-1:0:0"], after.cellToBody["cell:0:0:0"]);

  const lineage = analyzeProvenanceLineage(
    bodyProvenanceFromPhysicalPlan(before),
    bodyProvenanceFromPhysicalPlan(after),
  );
  assert.deepEqual(lineage.addedSourceIds, []);
  assert.deepEqual(lineage.removedSourceIds, []);
  assert.equal(lineage.components.length, 1);
  const component = lineage.components[0];
  assert.ok(component);
  assert.equal(component.kind, "split");
  assert.equal(component.beforeEntityIds.length, 1);
  assert.equal(component.afterEntityIds.length, 2);
  assert.equal(component.sharedSourceIds.length, 51);
  assert.deepEqual(component.sharedSourceIds, beforeSourceIds);
});

test("CUT topology seam is deterministic under source and connection ordering", () => {
  const document = createCollapseFixture(false);
  const reversed = {
    ...document,
    cells: [...document.cells].reverse(),
  };

  const canonical = compileMatter(document, {
    blockedFaceConnections: [CUT_CONNECTION],
  });
  const reordered = compileMatter(reversed, {
    blockedFaceConnections: [[CUT_CONNECTION[1], CUT_CONNECTION[0]]],
  });

  assert.deepEqual(reordered, canonical);
});

test("CUT topology seam rejects invalid or ambiguous blocked connections", () => {
  const document = createCollapseFixture(false);

  assert.throws(
    () =>
      compileMatter(document, {
        blockedFaceConnections: [["cell:-1:0:0", "cell:1:0:0"]],
      }),
    /not face-adjacent/,
  );

  assert.throws(
    () =>
      compileMatter(document, {
        blockedFaceConnections: [["cell:-1:0:0", "cell:missing"]],
      }),
    /unknown cell/,
  );

  assert.throws(
    () =>
      compileMatter(document, {
        blockedFaceConnections: [CUT_CONNECTION, [CUT_CONNECTION[1], CUT_CONNECTION[0]]],
      }),
    /duplicate blocked face connection/,
  );
});
