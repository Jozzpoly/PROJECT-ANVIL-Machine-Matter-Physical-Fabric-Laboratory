import test from "node:test";
import assert from "node:assert/strict";
import { compileRebind } from "../.test-build/src/experiments/anvil-03-rebind.js";
import {
  compileTorquePatch,
  createTorquePatchFixture,
} from "../.test-build/src/experiments/anvil-06-torque-patch.js";
import {
  assertTorquePatchBindingCurrent,
  relowerTorquePatchToBearing,
} from "../.test-build/src/experiments/anvil-10-torque-patch-rebind.js";

const ACTIVE_EFFORT_NM = 100;
const CUT = ["a:0", "a:2"];

function actionMeaning(action) {
  return {
    schema: action.schema,
    sourceTorqueId: action.sourceTorqueId,
    sourceBearingId: action.sourceBearingId,
    effortNm: action.effortNm,
    bodyAId: action.bodyAId,
    bodyBId: action.bodyBId,
    axisWorld: action.axisWorld,
    torqueAWorld: action.torqueAWorld,
    torqueBWorld: action.torqueBWorld,
  };
}

function torquePairMagnitude(action) {
  return Math.hypot(
    action.torqueAWorld.x + action.torqueBWorld.x,
    action.torqueAWorld.y + action.torqueBWorld.y,
    action.torqueAWorld.z + action.torqueBWorld.z,
  );
}

test("ANVIL-10 Micro A/B re-lowers one unchanged local patch onto the rebound bearing and rejects stale body binding", () => {
  const authored = createTorquePatchFixture(ACTIVE_EFFORT_NM);
  const sourceBefore = structuredClone(authored.patch);
  const accepted = compileTorquePatch(authored);
  const rebind = compileRebind({ bearing: authored.bearing, cut: CUT });

  // B0 — the experiment-local adapter must not change accepted ANVIL-06
  // meaning when supplied the accepted pre-CUT bearing compilation.
  const before = relowerTorquePatchToBearing(authored.patch, rebind.before);
  assert.deepEqual(before.sourceTarget, accepted.sourceTarget);
  assert.equal(before.sourcePatchId, accepted.sourcePatchId);
  assert.equal(before.resolvedBearingId, accepted.resolvedBearingId);
  assert.deepEqual(before.torque.bearing, accepted.torque.bearing);
  assert.deepEqual(actionMeaning(before.torque.action), actionMeaning(accepted.torque.action));
  assert.ok(torquePairMagnitude(before.torque.action) <= 1e-12);
  assert.doesNotThrow(() => assertTorquePatchBindingCurrent(before));

  // B1 — persistent identity stays fixed while the disposable endpoint body
  // changes from body:a:0 to body:a:2.
  const after = relowerTorquePatchToBearing(authored.patch, rebind.after);
  assert.equal(rebind.before.physicalPlan.bodies.length, 2);
  assert.equal(rebind.after.physicalPlan.bodies.length, 3);
  assert.equal(rebind.before.relation.sourceBearingId, rebind.after.relation.sourceBearingId);
  assert.deepEqual(rebind.before.relation.endpointA, rebind.after.relation.endpointA);
  assert.deepEqual(rebind.before.relation.endpointB, rebind.after.relation.endpointB);
  assert.equal(rebind.before.relation.bodyAId, "body:a:0");
  assert.equal(rebind.after.relation.bodyAId, "body:a:2");
  assert.notEqual(rebind.before.relation.bodyAId, rebind.after.relation.bodyAId);
  assert.equal(rebind.after.physicalPlan.cellToBody["a:2"], rebind.after.relation.bodyAId);
  assert.ok(
    rebind.after.physicalPlan.bodies.some((body) => body.id === "body:a:0"),
    "fixture lost the valid-looking stale sibling body",
  );
  assert.equal(after.sourcePatchId, before.sourcePatchId);
  assert.deepEqual(after.sourceTarget, before.sourceTarget);
  assert.equal(after.resolvedBearingId, before.resolvedBearingId);
  assert.equal(after.torque.action.sourceTorqueId, before.torque.action.sourceTorqueId);
  assert.equal(after.torque.action.sourceBearingId, before.torque.action.sourceBearingId);
  assert.equal(after.torque.action.effortNm, before.torque.action.effortNm);
  assert.equal(after.torque.action.bodyAId, rebind.after.relation.bodyAId);
  assert.equal(after.torque.action.bodyBId, rebind.after.relation.bodyBId);
  assert.deepEqual(after.torque.action.axisWorld, before.torque.action.axisWorld);
  assert.deepEqual(after.torque.action.torqueAWorld, before.torque.action.torqueAWorld);
  assert.deepEqual(after.torque.action.torqueBWorld, before.torque.action.torqueBWorld);
  assert.ok(torquePairMagnitude(after.torque.action) <= 1e-12);
  assert.doesNotThrow(() => assertTorquePatchBindingCurrent(after));

  // B2 — the dangerous case: the old body ID still exists after CUT, but it no
  // longer owns persistent endpoint a:2. Pairing the before action with the
  // current after relation must fail before any solver can be created.
  const stale = {
    ...before,
    torque: {
      bearing: rebind.after,
      action: before.torque.action,
    },
  };
  assert.equal(stale.torque.action.bodyAId, "body:a:0");
  assert.ok(rebind.after.physicalPlan.bodies.some((body) => body.id === stale.torque.action.bodyAId));
  assert.notEqual(stale.torque.action.bodyAId, rebind.after.relation.bodyAId);
  assert.throws(
    () => assertTorquePatchBindingCurrent(stale),
    /stale torque action body binding/u,
  );

  // Persistent authored source is not rewritten to make the remap work.
  assert.deepEqual(authored.patch, sourceBefore);
  assert.equal("bearingId" in authored.patch, false);
  assert.equal("bodyId" in authored.patch, false);
  assert.equal("jointId" in authored.patch, false);
  assert.equal("activation" in authored.patch, false);
});

test("ANVIL-10 relowering fails closed when the persistent local patch is not a current bearing endpoint", () => {
  const authored = createTorquePatchFixture(ACTIVE_EFFORT_NM);
  const rebind = compileRebind({ bearing: authored.bearing, cut: CUT });
  const misplaced = {
    ...authored.patch,
    target: { cellId: "a:0", face: "x+" },
  };
  assert.throws(
    () => relowerTorquePatchToBearing(misplaced, rebind.after),
    /not a unique current bearing endpoint/u,
  );
});
