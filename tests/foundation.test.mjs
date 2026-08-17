import test from "node:test";
import assert from "node:assert/strict";
import { compileMatter } from "../.test-build/src/compiler.js";
import { createCollapseFixture } from "../.test-build/src/fixture.js";
import {
  analyzeProvenanceLineage,
  bodyProvenanceFromPhysicalPlan,
} from "../.test-build/src/foundation/provenance.js";
import { computeMassProperties } from "../.test-build/src/foundation/mass-properties.js";
import { rigidVelocityAtWorldPoint } from "../.test-build/src/foundation/spatial.js";
import {
  linearMomentum,
  totalLinearMomentum,
  translationalKineticEnergyJ,
} from "../.test-build/src/foundation/continuity.js";
import { buildEvidenceReport } from "../.test-build/src/foundation/evidence.js";

test("mass properties are canonical across authored order", () => {
  const elements = [
    {
      id: "b",
      massKg: 1,
      center: { x: 3, y: 0, z: 0 },
      halfExtents: { x: 0.5, y: 0.5, z: 0.5 },
    },
    {
      id: "a",
      massKg: 2,
      center: { x: 0, y: 0, z: 0 },
      halfExtents: { x: 0.5, y: 0.5, z: 0.5 },
    },
  ];
  const forward = computeMassProperties(elements);
  const reverse = computeMassProperties([...elements].reverse());
  assert.deepEqual(forward, reverse);
  assert.equal(forward.massKg, 3);
  assert.deepEqual(forward.centerOfMass, { x: 1, y: 0, z: 0 });
  assert.ok(forward.inertiaDiagonalKgM2.x > 0);
  assert.ok(forward.inertiaDiagonalKgM2.y > forward.inertiaDiagonalKgM2.x);
});

test("provenance lineage classifies the COLLAPSE topology probe without trusting body IDs", () => {
  const intact = compileMatter(createCollapseFixture(false));
  const cut = compileMatter(createCollapseFixture(true));
  const split = analyzeProvenanceLineage(
    bodyProvenanceFromPhysicalPlan(intact),
    bodyProvenanceFromPhysicalPlan(cut),
  );
  assert.equal(split.addedSourceIds.length, 0);
  assert.equal(split.removedSourceIds.length, 1);
  assert.equal(split.components.length, 1);
  assert.equal(split.components[0]?.kind, "split");
  assert.equal(split.components[0]?.beforeEntityIds.length, 1);
  assert.equal(split.components[0]?.afterEntityIds.length, 2);

  const merge = analyzeProvenanceLineage(
    bodyProvenanceFromPhysicalPlan(cut),
    bodyProvenanceFromPhysicalPlan(intact),
  );
  assert.equal(merge.addedSourceIds.length, 1);
  assert.equal(merge.removedSourceIds.length, 0);
  assert.equal(merge.components.length, 1);
  assert.equal(merge.components[0]?.kind, "merge");

  const unchanged = analyzeProvenanceLineage(
    bodyProvenanceFromPhysicalPlan(intact),
    bodyProvenanceFromPhysicalPlan(intact),
  );
  assert.equal(unchanged.components.length, 1);
  assert.equal(unchanged.components[0]?.kind, "continued");
});

test("rigid point velocity exposes the kinematic continuity field needed by CUT", () => {
  const velocity = rigidVelocityAtWorldPoint(
    {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      linearVelocity: { x: 1, y: 2, z: 3 },
      angularVelocity: { x: 0, y: 0, z: 2 },
    },
    { x: 1, y: 0, z: 0 },
  );
  assert.deepEqual(velocity, { x: 1, y: 4, z: 3 });
});

test("continuity primitives measure momentum and translational energy without solver state", () => {
  const a = { massKg: 2, linearVelocity: { x: 3, y: 0, z: 0 } };
  const b = { massKg: 1, linearVelocity: { x: -1, y: 2, z: 0 } };
  assert.deepEqual(linearMomentum(a), { x: 6, y: 0, z: 0 });
  assert.deepEqual(totalLinearMomentum([a, b]), { x: 5, y: 2, z: 0 });
  assert.equal(translationalKineticEnergyJ(a), 9);
});

test("evidence reports fail closed and reject duplicate check identity", () => {
  const report = buildEvidenceReport([
    { id: "identity", pass: true, summary: "stable source identity" },
    { id: "continuity", pass: false, summary: "deliberate synthetic failure", metrics: { errorM: 0.1 } },
  ]);
  assert.equal(report.pass, false);
  assert.deepEqual(report.failedCheckIds, ["continuity"]);
  assert.throws(
    () => buildEvidenceReport([
      { id: "same", pass: true, summary: "a" },
      { id: "same", pass: true, summary: "b" },
    ]),
    /duplicate evidence check id/,
  );
});
