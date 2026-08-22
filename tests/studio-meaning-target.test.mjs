import test from "node:test";
import assert from "node:assert/strict";
import { createEditableStarterSource } from "../.test-build/src/studio/workspace.js";
import {
  applyTorqueDraftDrag,
  resolveBearingTarget,
  resolveTorqueTarget,
} from "../.test-build/src/studio/meaning.js";

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

test("Studio TorquePatch targets exactly one authored Bearing endpoint", () => {
  const source = createEditableStarterSource();
  const a = resolveTorqueTarget(source, "starter:a2", "x+");
  assert.ok(a !== null);
  assert.equal(a.bearing.id, "bearing:starter-seam");
  assert.deepEqual(a.target, { cellId: "starter:a2", face: "x+" });
  assert.equal(a.existingPatches.length, 1);
  assert.equal(a.existingPatches[0]?.id, "torque-patch:starter-seam");

  const b = resolveTorqueTarget(source, "starter:b0", "x-");
  assert.ok(b !== null);
  assert.equal(b.bearing.id, "bearing:starter-seam");
  assert.deepEqual(b.target, { cellId: "starter:b0", face: "x-" });
  assert.equal(b.existingPatches.length, 0);

  assert.equal(resolveTorqueTarget(source, "starter:b3", "x+"), null);
  assert.equal(resolveTorqueTarget(source, "missing", "x+"), null);
});

test("Studio TorquePatch target refuses ambiguous Bearing endpoint ownership", () => {
  const source = createEditableStarterSource();
  const original = source.bearings[0];
  assert.ok(original !== undefined);
  const ambiguous = {
    ...source,
    bearings: [
      ...source.bearings,
      { ...original, id: "bearing:duplicate-endpoint", freeAxis: "y" },
    ],
  };
  assert.equal(resolveTorqueTarget(ambiguous, "starter:a2", "x+"), null);
});

test("Studio Torque drag is relative, no-jump and Shift-fine without a semantic clamp", () => {
  const base = 100;
  assert.equal(applyTorqueDraftDrag(base, 0, false), base, "pointer-down equivalent changed draft value");
  assert.equal(applyTorqueDraftDrag(base, 12, false), 112);
  assert.equal(applyTorqueDraftDrag(base, -25, false), 75);
  assert.equal(applyTorqueDraftDrag(base, 12, true), 101.2);
  assert.equal(applyTorqueDraftDrag(3, -8, false), -5, "draft could not cross zero and reverse direction");
  assert.equal(applyTorqueDraftDrag(1_000_000, 500_000, false), 1_500_000, "UI invented a scientific torque clamp");
  assert.throws(() => applyTorqueDraftDrag(Number.NaN, 1, false), /finite values/u);
  assert.throws(() => applyTorqueDraftDrag(1, Number.POSITIVE_INFINITY, false), /finite values/u);
});
