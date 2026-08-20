import test from "node:test";
import assert from "node:assert/strict";
import { WorkbenchB0Specimen } from "../.test-build/src/workbench/w1-b0-specimen.js";

// Integration assertions reuse the already-accepted ANVIL-10 envelope. They do
// not define new W1 physics thresholds or broaden the scientific claim.
const MIN_ACTIVE_SPEED_ADVANTAGE_RADPS = 0.25;
const MAX_BEARING_GAP_M = 0.0025;
const MAX_STALE_SIBLING_ANGULAR_DELTA_RADPS = 1e-6;
const MAX_STALE_SIBLING_LINEAR_DELTA_MPS = 1e-6;

test("W1 B0 runs one bounded post-CUT active observation against the accepted OFF control", async () => {
  const specimen = await WorkbenchB0Specimen.create();
  try {
    specimen.continueToCutReady();
    await specimen.executeAcceptedCut();

    const observation = specimen.activateAndObserve();
    assert.equal(observation.observationSteps, 30);
    assert.equal(observation.activeActivation, "ON");
    assert.equal(observation.controlActivation, "OFF");
    assert.ok(
      observation.activeSpeedAdvantageRadps >= MIN_ACTIVE_SPEED_ADVANTAGE_RADPS,
      `ACTIVE speed advantage ${observation.activeSpeedAdvantageRadps}`,
    );
    assert.ok(observation.activeBearingGapM <= MAX_BEARING_GAP_M);
    assert.ok(observation.controlBearingGapM <= MAX_BEARING_GAP_M);
    assert.equal(observation.staleSiblingBodyId, "body:a:0");
    assert.ok(
      observation.staleSiblingAngularDeltaRadps <= MAX_STALE_SIBLING_ANGULAR_DELTA_RADPS,
      `stale sibling angular delta ${observation.staleSiblingAngularDeltaRadps}`,
    );
    assert.ok(
      observation.staleSiblingLinearDeltaMps <= MAX_STALE_SIBLING_LINEAR_DELTA_MPS,
      `stale sibling linear delta ${observation.staleSiblingLinearDeltaMps}`,
    );

    assert.equal(specimen.state.phase, "OBSERVED");
    assert.equal(specimen.state.torqueActivation, "ON");
    assert.equal(specimen.state.activationAvailable, false);
    assert.deepEqual(specimen.observationReceipt, observation);
  } finally {
    specimen.dispose();
  }
});

test("W1 B0 bounded observation cannot start before the accepted CUT transaction", async () => {
  const specimen = await WorkbenchB0Specimen.create();
  try {
    assert.throws(
      () => specimen.activateAndObserve(),
      /cannot activate bounded observation from INITIAL/u,
    );
    specimen.continueToCutReady();
    assert.throws(
      () => specimen.activateAndObserve(),
      /cannot activate bounded observation from CUT_READY/u,
    );
    await specimen.executeAcceptedCut();
    specimen.activateAndObserve();
    assert.throws(
      () => specimen.activateAndObserve(),
      /cannot activate bounded observation from OBSERVED/u,
    );
  } finally {
    specimen.dispose();
  }
});
