import test from "node:test";
import assert from "node:assert/strict";

import { compileBearing } from "../.test-build/src/experiments/anvil-02-bearing.js";
import { relowerTorquePatchToBearing } from "../.test-build/src/experiments/anvil-10-torque-patch-rebind.js";
import { ActivatePhysics } from "../.test-build/src/experiments/anvil-09-activate-runtime.js";

const MATERIAL = Object.freeze({
  id: "studio-p04-adversarial-material",
  densityKgM3: 900,
  friction: 0.5,
  displayColor: "#8bd5ff",
});

function threeCellMatter(revision = "studio-p04/multi-bearing") {
  return {
    schema: "anvil-matter/0",
    revision,
    cellSizeM: 0.5,
    materials: [MATERIAL],
    cells: [
      { id: "left", grid: { x: 0, y: 0, z: 0 }, materialId: MATERIAL.id },
      { id: "middle", grid: { x: 1, y: 0, z: 0 }, materialId: MATERIAL.id },
      { id: "right", grid: { x: 2, y: 0, z: 0 }, materialId: MATERIAL.id },
    ],
  };
}

function oneBearingSource({ generation = 1, effortNm = 80 } = {}) {
  const matter = {
    schema: "anvil-matter/0",
    revision: "studio-p04/source-revision-stays-constant",
    cellSizeM: 0.5,
    materials: [MATERIAL],
    cells: [
      { id: "left", grid: { x: 0, y: 0, z: 0 }, materialId: MATERIAL.id },
      { id: "right", grid: { x: 1, y: 0, z: 0 }, materialId: MATERIAL.id },
    ],
  };
  return {
    generation,
    matter,
    bearing: {
      id: "bearing:identity-probe",
      endpointA: { cellId: "left", face: "x+" },
      endpointB: { cellId: "right", face: "x-" },
      freeAxis: "z",
    },
    patch: {
      id: "torque-patch:identity-probe",
      target: { cellId: "left", face: "x+" },
      effortNm,
    },
  };
}

function compileOneBearingSource(source) {
  const bearing = compileBearing({ matter: source.matter, bearing: source.bearing });
  const torquePatch = relowerTorquePatchToBearing(source.patch, bearing);
  return { sourceGeneration: source.generation, bearing, torquePatch };
}

function classifyCurrentStudioEnvelope(source) {
  if (source.bearings.length > 1) {
    return { status: "UNSUPPORTED", code: "MULTI_BEARING_NOT_QUALIFIED" };
  }
  return { status: "WITHIN_CURRENT_ENVELOPE" };
}

test("P04 E2: two individually valid bearings are cleanly unsupported only at composition level", () => {
  const matter = threeCellMatter();
  const bearingA = {
    id: "bearing:left-middle",
    endpointA: { cellId: "left", face: "x+" },
    endpointB: { cellId: "middle", face: "x-" },
    freeAxis: "z",
  };
  const bearingB = {
    id: "bearing:middle-right",
    endpointA: { cellId: "middle", face: "x+" },
    endpointB: { cellId: "right", face: "x-" },
    freeAxis: "z",
  };

  const compilationA = compileBearing({ matter, bearing: bearingA });
  const compilationB = compileBearing({ matter, bearing: bearingB });
  assert.equal(compilationA.physicalPlan.bodies.length, 2);
  assert.equal(compilationB.physicalPlan.bodies.length, 2);
  assert.equal(compilationA.relation.sourceBearingId, bearingA.id);
  assert.equal(compilationB.relation.sourceBearingId, bearingB.id);

  const source = { matter, bearings: [bearingA, bearingB] };
  const before = structuredClone(source);
  assert.deepEqual(classifyCurrentStudioEnvelope(source), {
    status: "UNSUPPORTED",
    code: "MULTI_BEARING_NOT_QUALIFIED",
  });
  assert.deepEqual(source, before, "UNSUPPORTED classification mutated individually valid authored intent");
});

test("P04 G: MatterDocument revision cannot identify a TorquePatch-only authored change", () => {
  const first = oneBearingSource({ generation: 31, effortNm: 80 });
  const second = oneBearingSource({ generation: 32, effortNm: 125 });
  const compiledFirst = compileOneBearingSource(first);
  const compiledSecond = compileOneBearingSource(second);

  assert.equal(first.matter.revision, second.matter.revision);
  assert.equal(compiledFirst.bearing.physicalPlan.sourceRevision, compiledSecond.bearing.physicalPlan.sourceRevision);
  assert.notEqual(first.generation, second.generation);
  assert.equal(compiledFirst.torquePatch.torque.action.effortNm, 80);
  assert.equal(compiledSecond.torquePatch.torque.action.effortNm, 125);

  const firstBodyIds = compiledFirst.bearing.physicalPlan.bodies.map((body) => body.id);
  const secondBodyIds = compiledSecond.bearing.physicalPlan.bodies.map((body) => body.id);
  assert.deepEqual(firstBodyIds, secondBodyIds, "compiled IDs unexpectedly changed for a patch-only authored edit");
});

test("P04 H: fresh runtime sessions may reuse planBodyId while transient state remains session-local", async () => {
  const source = oneBearingSource({ generation: 41, effortNm: 80 });
  const compilation = compileOneBearingSource(source);
  const runtimeA = await ActivatePhysics.create(compilation.torquePatch, source.matter.materials);
  const runtimeB = await ActivatePhysics.create(compilation.torquePatch, source.matter.materials);

  try {
    const idsA = runtimeA.snapshots().map((snapshot) => snapshot.planBodyId).sort();
    const idsB = runtimeB.snapshots().map((snapshot) => snapshot.planBodyId).sort();
    assert.deepEqual(idsA, idsB, "fresh runtime unexpectedly produced different planBodyIds");
    assert.equal(runtimeA.activation, "OFF");
    assert.equal(runtimeB.activation, "OFF");

    runtimeA.setActivation("ON");
    runtimeA.step(20);
    runtimeB.step(20);

    assert.equal(runtimeA.activation, "ON");
    assert.equal(runtimeB.activation, "OFF");
    assert.ok(Math.abs(runtimeA.relativeAngularSpeedRadps()) >= 0.1);
    assert.ok(Math.abs(runtimeB.relativeAngularSpeedRadps()) <= 1e-6);
  } finally {
    runtimeA.dispose();
    runtimeB.dispose();
  }
});
