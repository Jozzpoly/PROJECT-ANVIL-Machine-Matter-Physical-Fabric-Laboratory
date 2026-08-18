import test from "node:test";
import assert from "node:assert/strict";
import Box3DFactory from "box3d.js/inline";

test("ANVIL-04 exact Box3D binding exposes direct force and joint-force observation", async () => {
  const b3 = await Box3DFactory();
  const version = b3.b3GetVersion();
  assert.deepEqual(
    { major: version.major, minor: version.minor, revision: version.revision },
    { major: 0, minor: 1, revision: 0 },
  );
  assert.equal(typeof b3.b3Body_ApplyForce, "function", "binding does not expose b3Body_ApplyForce");
  assert.equal(typeof b3.b3Joint_GetConstraintForce, "function", "binding does not expose b3Joint_GetConstraintForce");
});
