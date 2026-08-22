import test from "node:test";
import assert from "node:assert/strict";
import { BearingPhysics } from "../.test-build/src/experiments/anvil-02-bearing.js";
import {
  MultiBearingPhysics,
  compileMultiBearing,
} from "../.test-build/src/experiments/o1x-multi-bearing-composition.js";

const material = Object.freeze({
  id: "o1x:loop-alloy",
  densityKgM3: 780,
  friction: 0.45,
  displayColor: "#8bbfd9",
});

function loopFixture() {
  return {
    matter: {
      schema: "anvil-matter/0",
      revision: "o1x/loop-kinematic-closure",
      cellSizeM: 0.5,
      materials: [material],
      cells: [
        { id: "A", grid: { x: 0, y: 0, z: 0 }, materialId: material.id },
        { id: "B", grid: { x: 1, y: 0, z: 0 }, materialId: material.id },
        { id: "C", grid: { x: 0, y: 1, z: 0 }, materialId: material.id },
        { id: "D", grid: { x: 1, y: 1, z: 0 }, materialId: material.id },
      ],
    },
    bearings: [
      {
        id: "bearing:lower",
        endpointA: { cellId: "A", face: "x+" },
        endpointB: { cellId: "B", face: "x-" },
        freeAxis: "z",
      },
      {
        id: "bearing:upper",
        endpointA: { cellId: "C", face: "x+" },
        endpointB: { cellId: "D", face: "x-" },
        freeAxis: "z",
      },
    ],
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function conjugate(q) {
  return { x: -q.x, y: -q.y, z: -q.z, w: q.w };
}

function multiplyQuat(a, b) {
  return {
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  };
}

function relativeRotationAngleRad(a, b) {
  const relative = multiplyQuat(conjugate(a), b);
  return 2 * Math.acos(clamp(Math.abs(relative.w), -1, 1));
}

function maxValue(record) {
  return Math.max(...Object.values(record));
}

test("O1-X LOOP two distinct parallel Bearings remove the revolute freedom present with either relation alone", async () => {
  const fixture = loopFixture();
  const compiled = compileMultiBearing(fixture);
  assert.equal(compiled.physicalPlan.bodies.length, 2);
  assert.equal(compiled.relations.length, 2);

  const lower = compiled.relations.find((relation) => relation.sourceBearingId === "bearing:lower");
  assert.ok(lower !== undefined);
  const leftBodyId = compiled.physicalPlan.cellToBody.A;
  const rightBodyId = compiled.physicalPlan.cellToBody.B;
  assert.ok(leftBodyId && rightBodyId && leftBodyId !== rightBodyId);

  const angularVelocity = {
    [leftBodyId]: { x: 0, y: 0, z: 0 },
    [rightBodyId]: { x: 0, y: 0, z: 2 },
  };

  const lowerOnly = await BearingPhysics.create(
    { physicalPlan: compiled.physicalPlan, relation: lower },
    fixture.matter.materials,
    { initialAngularVelocityByPlanBodyId: angularVelocity },
  );
  const both = await MultiBearingPhysics.create(
    compiled,
    fixture.matter.materials,
    { initialAngularVelocityByPlanBodyId: angularVelocity },
  );

  try {
    lowerOnly.step(120);
    both.step(120);

    const lowerOnlyAngle = Math.abs(lowerOnly.bearingAngleRad() ?? 0);
    const lowerOnlyAnchorError = lowerOnly.bearingAnchorErrorM();
    assert.ok(
      lowerOnlyAnchorError <= 1e-3,
      `LOWER_ONLY anchor error ${lowerOnlyAnchorError} m exceeds 1e-3 m`,
    );
    assert.ok(
      lowerOnlyAngle >= 0.25,
      `LOWER_ONLY rotated only ${lowerOnlyAngle} rad; control did not expose free revolute motion`,
    );

    const bothErrors = both.anchorErrorsM();
    const bothMaxAnchorError = maxValue(bothErrors);
    assert.ok(
      bothMaxAnchorError <= 1e-3,
      `BOTH max anchor error ${bothMaxAnchorError} m exceeds 1e-3 m`,
    );

    const snapshots = new Map(both.snapshots().map((snapshot) => [snapshot.planBodyId, snapshot]));
    const left = snapshots.get(leftBodyId);
    const right = snapshots.get(rightBodyId);
    assert.ok(left !== undefined && right !== undefined);
    for (const snapshot of [left, right]) {
      assert.ok([
        snapshot.position.x,
        snapshot.position.y,
        snapshot.position.z,
        snapshot.rotation.x,
        snapshot.rotation.y,
        snapshot.rotation.z,
        snapshot.rotation.w,
        snapshot.angularVelocity.x,
        snapshot.angularVelocity.y,
        snapshot.angularVelocity.z,
      ].every(Number.isFinite));
    }

    const bothRelativeAngle = relativeRotationAngleRad(left.rotation, right.rotation);
    assert.ok(
      bothRelativeAngle <= 0.05,
      `BOTH retained ${bothRelativeAngle} rad relative rotation; expected kinematic closure <= 0.05 rad`,
    );

    console.log(JSON.stringify({
      probe: "O1-X/LOOP-KINEMATIC-CLOSURE",
      steps: 120,
      initialRelativeAngularSpeedRadps: 2,
      lowerOnly: {
        jointAngleRad: lowerOnlyAngle,
        anchorErrorM: lowerOnlyAnchorError,
      },
      both: {
        relationCount: both.receipt.relationCount,
        anchorErrorsM: bothErrors,
        maxAnchorErrorM: bothMaxAnchorError,
        relativeRotationAngleRad: bothRelativeAngle,
        leftAngularVelocity: left.angularVelocity,
        rightAngularVelocity: right.angularVelocity,
      },
    }));
  } finally {
    lowerOnly.dispose();
    both.dispose();
  }
});
