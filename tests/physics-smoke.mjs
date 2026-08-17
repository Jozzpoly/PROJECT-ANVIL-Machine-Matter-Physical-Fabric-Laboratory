import test from "node:test";
import assert from "node:assert/strict";
import { compileMatter } from "../.test-build/src/compiler.js";
import { createCollapseFixture } from "../.test-build/src/fixture.js";
import { CollapsePhysics } from "../.test-build/src/physics.js";

for (const cutBridge of [false, true]) {
  test(`Box3D lowering preserves compiled mass and COM (${cutBridge ? "cut" : "intact"})`, async () => {
    const document = createCollapseFixture(cutBridge);
    const plan = compileMatter(document);
    const runtime = await CollapsePhysics.create(plan, document.materials);
    try {
      assert.equal(runtime.receipt.engineVersion, "0.1.0");
      const massErrors = Object.values(runtime.receipt.bodyMassErrorsKg);
      const centerErrors = Object.values(runtime.receipt.bodyLocalCenterErrorsM);
      assert.equal(massErrors.length, plan.bodies.length);
      assert.equal(centerErrors.length, plan.bodies.length);
      for (const error of massErrors) assert.ok(Math.abs(error) < 0.05, `mass delta ${error}`);
      for (const error of centerErrors) assert.ok(error < 1e-5, `local COM delta ${error}`);
      const before = runtime.snapshots();
      assert.equal(before.length, plan.bodies.length);
      runtime.step(60);
      const after = runtime.snapshots();
      assert.equal(after.length, plan.bodies.length);
      assert.ok(after.some((body, index) => body.position.y < before[index].position.y - 0.1));
    } finally {
      runtime.dispose();
    }
  });
}
