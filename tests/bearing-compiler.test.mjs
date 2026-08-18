import test from "node:test";
import assert from "node:assert/strict";
import { compileMatter } from "../.test-build/src/compiler.js";
import {
  compileBearing,
  createBearingFixture,
  rotateAxisWithJointFrame,
} from "../.test-build/src/experiments/anvil-02-bearing.js";

function sourceIds(plan) {
  return Object.keys(plan.cellToBody).sort();
}

test("ANVIL-02 authored bearing causes one rigid island to become two bodies plus one relation", () => {
  const fixture = createBearingFixture();
  const baseline = compileMatter(fixture.matter);
  assert.equal(baseline.bodies.length, 1, "fixture without bearing mark must be one rigid island");

  const compiled = compileBearing(fixture);
  assert.equal(compiled.physicalPlan.bodies.length, 2);
  assert.deepEqual(sourceIds(compiled.physicalPlan), fixture.matter.cells.map((cell) => cell.id).sort());
  assert.equal(compiled.relation.schema, "anvil-02-bearing-relation/0");
  assert.equal(compiled.relation.sourceBearingId, "bearing:seam-0");
  assert.notEqual(compiled.relation.bodyAId, compiled.relation.bodyBId);
  assert.deepEqual(compiled.relation.pivotWorld, { x: 0, y: 0.25, z: 0.25 });
  assert.deepEqual(compiled.relation.axisWorld, { x: 0, y: 0, z: 1 });
  assert.deepEqual(compiled.relation.localAxisA, { x: 0, y: 0, z: 1 });
  assert.deepEqual(compiled.relation.localAxisB, { x: 0, y: 0, z: 1 });
});

test("ANVIL-02 bearing compilation is canonical under source order and symmetric endpoint swap", () => {
  const fixture = createBearingFixture();
  const normal = compileBearing(fixture);
  const reordered = compileBearing({
    matter: { ...fixture.matter, cells: [...fixture.matter.cells].reverse() },
    bearing: {
      ...fixture.bearing,
      endpointA: fixture.bearing.endpointB,
      endpointB: fixture.bearing.endpointA,
    },
  });
  assert.deepEqual(reordered, normal);
});

test("ANVIL-02 bearing fails closed on invalid interface geometry", () => {
  const fixture = createBearingFixture();
  assert.throws(
    () => compileBearing({ ...fixture, bearing: { ...fixture.bearing, id: "   " } }),
    /bearing id must be non-empty/,
  );
  assert.throws(
    () => compileBearing({
      ...fixture,
      bearing: { ...fixture.bearing, endpointB: { cellId: "missing", face: "x-" } },
    }),
    /unknown endpoint cell/,
  );
  assert.throws(
    () => compileBearing({
      ...fixture,
      bearing: { ...fixture.bearing, endpointB: { cellId: "b:1", face: "x-" } },
    }),
    /not adjacent through the declared faces/,
  );
  assert.throws(
    () => compileBearing({
      ...fixture,
      bearing: { ...fixture.bearing, endpointB: { cellId: "b:0", face: "y-" } },
    }),
    /must be opposite/,
  );
  assert.throws(
    () => compileBearing({ ...fixture, bearing: { ...fixture.bearing, freeAxis: "x" } }),
    /normal to shared face/,
  );
});

test("ANVIL-02 bearing detects an alternate rigid bypass around the marked seam", () => {
  const fixture = createBearingFixture();
  const extra = [
    { id: "bypass:a", grid: { x: -1, y: 1, z: 0 }, materialId: "anvil-02-alloy" },
    { id: "bypass:b", grid: { x: 0, y: 1, z: 0 }, materialId: "anvil-02-alloy" },
  ];
  assert.throws(
    () => compileBearing({
      ...fixture,
      matter: { ...fixture.matter, revision: "anvil-02-bearing/bypass", cells: [...fixture.matter.cells, ...extra] },
    }),
    /alternate rigid path bypasses the interface/,
  );
});

test("ANVIL-02 joint-frame helper maps local Z onto all canonical authored axes", () => {
  for (const axis of [
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: 0, z: 1 },
  ]) {
    const rotated = rotateAxisWithJointFrame(axis);
    assert.ok(Math.hypot(rotated.x - axis.x, rotated.y - axis.y, rotated.z - axis.z) <= 1e-12);
  }
});
