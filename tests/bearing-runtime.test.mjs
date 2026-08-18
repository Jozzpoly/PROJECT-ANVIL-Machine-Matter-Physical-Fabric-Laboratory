import test from "node:test";
import assert from "node:assert/strict";
import {
  BearingPhysics,
  compileBearing,
  createBearingFixture,
  velocityForRotationAboutPivot,
} from "../.test-build/src/experiments/anvil-02-bearing.js";

const MAX_ANCHOR_GAP_M = 0.0025;
const MIN_CONTROL_GAP_M = 0.25;
const MIN_RELATIVE_ANGLE_RAD = 0.35;

function bodyById(compilation, id) {
  const body = compilation.physicalPlan.bodies.find((candidate) => candidate.id === id);
  assert.ok(body, `missing body ${id}`);
  return body;
}

test("ANVIL-02 compiled bearing constrains the pivot while preserving free relative rotation", async () => {
  const fixture = createBearingFixture();
  const compilation = compileBearing(fixture);
  const relation = compilation.relation;
  const bodyA = bodyById(compilation, relation.bodyAId);
  const bodyB = bodyById(compilation, relation.bodyBId);

  const omegaA = { x: 0, y: 0, z: -0.6 };
  const omegaB = { x: 0, y: 0, z: 0.9 };
  const linearById = {
    [bodyA.id]: velocityForRotationAboutPivot(omegaA, bodyA.centerOfMassWorld, relation.pivotWorld),
    [bodyB.id]: velocityForRotationAboutPivot(omegaB, bodyB.centerOfMassWorld, relation.pivotWorld),
  };
  const angularById = { [bodyA.id]: omegaA, [bodyB.id]: omegaB };

  const constrained = await BearingPhysics.create(compilation, fixture.matter.materials, {
    createRelation: true,
    initialLinearVelocityByPlanBodyId: linearById,
    initialAngularVelocityByPlanBodyId: angularById,
  });
  const control = await BearingPhysics.create(compilation, fixture.matter.materials, {
    createRelation: false,
    initialLinearVelocityByPlanBodyId: linearById,
    initialAngularVelocityByPlanBodyId: angularById,
  });

  try {
    assert.equal(constrained.receipt.engineVersion, "0.1.0");
    assert.equal(constrained.receipt.relationCreated, true);
    assert.equal(control.receipt.relationCreated, false);
    for (const error of Object.values(constrained.receipt.bodyMassErrorsKg)) {
      assert.ok(Math.abs(error) <= 0.1, `body mass error ${error} kg exceeds 0.1 kg`);
    }
    for (const error of Object.values(constrained.receipt.bodyLocalCenterErrorsM)) {
      assert.ok(Math.abs(error) <= 7e-5, `body local COM error ${error} m exceeds 7e-5 m`);
    }

    constrained.step(120);
    control.step(120);

    const constrainedGap = constrained.bearingAnchorErrorM();
    const controlGap = control.bearingAnchorErrorM();
    const angle = constrained.bearingAngleRad();
    assert.notEqual(angle, null);

    console.log(JSON.stringify({
      probe: "ANVIL-02/BEARING-C2",
      constrainedGapM: constrainedGap,
      noRelationControlGapM: controlGap,
      revoluteAngleRad: angle,
    }));

    assert.ok(
      constrainedGap <= MAX_ANCHOR_GAP_M,
      `bearing anchor gap ${constrainedGap} m exceeds ${MAX_ANCHOR_GAP_M} m`,
    );
    assert.ok(
      controlGap >= MIN_CONTROL_GAP_M,
      `no-relation control gap ${controlGap} m does not reach ${MIN_CONTROL_GAP_M} m`,
    );
    assert.ok(
      Math.abs(angle) >= MIN_RELATIVE_ANGLE_RAD,
      `bearing relative angle ${angle} rad does not reach ${MIN_RELATIVE_ANGLE_RAD} rad`,
    );
  } finally {
    constrained.dispose();
    control.dispose();
  }
});
