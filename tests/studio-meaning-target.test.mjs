import test from "node:test";
import assert from "node:assert/strict";
import { createEditableStarterSource } from "../.test-build/src/studio/workspace.js";
import { resolveBearingTarget } from "../.test-build/src/studio/meaning.js";

test("Studio resolves a shared authored seam and exposes only tangent Bearing axes", () => {
  const source = createEditableStarterSource();
  const target = resolveBearingTarget(source, "starter:a2", "x+");
  assert.ok(target !== null);
  assert.deepEqual(target.endpointA, { cellId: "starter:a2", face: "x+" });
  assert.deepEqual(target.endpointB, { cellId: "starter:b0", face: "x-" });
  assert.deepEqual(target.legalAxes, ["y", "z"]);
  assert.equal(target.existingBearings.length, 1);
  assert.equal(target.existingBearings[0]?.id, "bearing:starter-seam");
});

test("Studio does not invent Bearing semantics on an exposed outer face", () => {
  const source = createEditableStarterSource();
  assert.equal(resolveBearingTarget(source, "starter:b3", "x+"), null);
});

test("Studio recognizes the same persistent seam from either endpoint direction", () => {
  const source = createEditableStarterSource();
  const target = resolveBearingTarget(source, "starter:b0", "x-");
  assert.ok(target !== null);
  assert.deepEqual(target.legalAxes, ["y", "z"]);
  assert.equal(target.existingBearings.length, 1);
  assert.equal(target.existingBearings[0]?.id, "bearing:starter-seam");
});

test("Studio axis choices rotate with the authored shared face", () => {
  const source = createEditableStarterSource();
  const yTarget = resolveBearingTarget(source, "starter:a0", "y+");
  assert.ok(yTarget !== null);
  assert.deepEqual(yTarget.legalAxes, ["x", "z"]);

  const zSource = {
    ...source,
    matter: {
      ...source.matter,
      cells: [
        ...source.matter.cells,
        { id: "z-neighbor", grid: { x: 2, y: 0, z: 1 }, materialId: source.matter.materials[0].id },
      ],
    },
  };
  const zTarget = resolveBearingTarget(zSource, "starter:b3", "z+");
  assert.ok(zTarget !== null);
  assert.deepEqual(zTarget.legalAxes, ["x", "y"]);
});
