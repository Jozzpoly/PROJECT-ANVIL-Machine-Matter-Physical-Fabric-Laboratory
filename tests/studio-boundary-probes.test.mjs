import test from "node:test";
import assert from "node:assert/strict";

import { compileMatter } from "../.test-build/src/compiler.js";
import {
  analyzeProvenanceLineage,
  bodyProvenanceFromPhysicalPlan,
} from "../.test-build/src/foundation/provenance.js";
import { compileBearing } from "../.test-build/src/experiments/anvil-02-bearing.js";
import { relowerTorquePatchToBearing } from "../.test-build/src/experiments/anvil-10-torque-patch-rebind.js";
import { ActivatePhysics } from "../.test-build/src/experiments/anvil-09-activate-runtime.js";

const MATERIAL = Object.freeze({
  id: "studio-probe-material",
  densityKgM3: 900,
  friction: 0.5,
  displayColor: "#7fc8ff",
});

function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function activeBearingSource() {
  return {
    generation: 1,
    matter: {
      schema: "anvil-matter/0",
      revision: "studio-p04/custom-source-v1",
      cellSizeM: 0.5,
      materials: [MATERIAL],
      cells: [
        { id: "left", grid: { x: 0, y: 0, z: 0 }, materialId: MATERIAL.id },
        { id: "right", grid: { x: 1, y: 0, z: 0 }, materialId: MATERIAL.id },
      ],
    },
    bearings: [{
      id: "bearing:studio-probe",
      endpointA: { cellId: "left", face: "x+" },
      endpointB: { cellId: "right", face: "x-" },
      freeAxis: "z",
    }],
    torquePatches: [{
      id: "torque-patch:studio-probe",
      target: { cellId: "left", face: "x+" },
      effortNm: 80,
    }],
    experimentalMeanings: [],
  };
}

function compileStudioProbe(source) {
  if (source.experimentalMeanings.length > 0) {
    return {
      status: "UNSUPPORTED",
      code: "EXPERIMENTAL_MEANING_NOT_IN_ACTIVE_BEARING_ENVELOPE",
    };
  }
  if (source.bearings.length > 1) {
    return { status: "UNSUPPORTED", code: "MULTI_BEARING_NOT_QUALIFIED" };
  }
  if (source.torquePatches.length > 1) {
    return { status: "UNSUPPORTED", code: "MULTI_TORQUE_PATCH_NOT_QUALIFIED" };
  }
  if (source.bearings.length === 0) {
    if (source.torquePatches.length > 0) {
      return { status: "INVALID", code: "TORQUE_PATCH_REQUIRES_BEARING" };
    }
    try {
      return {
        status: "VALID",
        kind: "MATTER",
        sourceGeneration: source.generation,
        physicalPlan: compileMatter(source.matter),
      };
    } catch (error) {
      return {
        status: "INVALID",
        code: "MATTER_COMPILE_REJECTED",
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  try {
    const bearing = compileBearing({ matter: source.matter, bearing: source.bearings[0] });
    if (source.torquePatches.length === 0) {
      return {
        status: "VALID",
        kind: "BEARING",
        sourceGeneration: source.generation,
        bearing,
      };
    }
    const torquePatch = relowerTorquePatchToBearing(source.torquePatches[0], bearing);
    return {
      status: "VALID",
      kind: "ACTIVE_BEARING",
      sourceGeneration: source.generation,
      bearing,
      torquePatch,
    };
  } catch (error) {
    return {
      status: "INVALID",
      code: "ACTIVE_BEARING_COMPILE_REJECTED",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

function presentationProjection(source, compilation, runtimeSessionId, snapshots, activation) {
  assert.equal(compilation.status, "VALID");
  assert.equal(compilation.kind, "ACTIVE_BEARING");
  const plan = compilation.bearing.physicalPlan;
  const relation = compilation.bearing.relation;
  const patch = compilation.torquePatch;

  return {
    source: {
      generation: source.generation,
      cells: source.matter.cells.map((cell) => ({
        id: cell.id,
        grid: { ...cell.grid },
        materialId: cell.materialId,
      })),
      bearings: source.bearings.map((bearing) => structuredClone(bearing)),
      torquePatches: source.torquePatches.map((torquePatch) => structuredClone(torquePatch)),
    },
    compilation: {
      sourceGeneration: compilation.sourceGeneration,
      bodies: plan.bodies.map((body) => ({
        id: body.id,
        sourceCellIds: [...body.sourceCellIds],
        centerOfMassWorld: { ...body.centerOfMassWorld },
        colliders: body.colliders.map((collider) => ({
          id: collider.id,
          sourceCellIds: [...collider.sourceCellIds],
          centerWorld: { ...collider.centerWorld },
          halfExtentsM: { ...collider.halfExtentsM },
          materialId: collider.materialId,
        })),
      })),
      bearingOverlay: {
        sourceBearingId: relation.sourceBearingId,
        endpointA: { ...relation.endpointA },
        endpointB: { ...relation.endpointB },
        pivotWorld: { ...relation.pivotWorld },
        axisWorld: { ...relation.axisWorld },
      },
      torqueOverlay: {
        sourcePatchId: patch.sourcePatchId,
        sourceTarget: { ...patch.sourceTarget },
        effortNm: patch.torque.action.effortNm,
      },
    },
    runtime: {
      sessionId: runtimeSessionId,
      activation,
      bodies: snapshots.map((snapshot) => ({
        planBodyId: snapshot.planBodyId,
        position: { ...snapshot.position },
        rotation: { ...snapshot.rotation },
        linearVelocity: { ...snapshot.linearVelocity },
        angularVelocity: { ...snapshot.angularVelocity },
        massKg: snapshot.massKg,
        localCenter: { ...snapshot.localCenter },
      })),
    },
  };
}

function compiledSelection(generation, id) {
  return { kind: "COMPILED_BODY", generation, id };
}

function sourceSelection(sourceId) {
  return { kind: "SOURCE_CELL", sourceId };
}

function reconcileSelectionAfterRecompile(selection, nextGeneration, beforePlan, afterPlan) {
  if (selection.kind === "SOURCE_CELL") {
    const survives = afterPlan.bodies.some((body) => body.sourceCellIds.includes(selection.sourceId));
    return { selection: survives ? selection : null, trace: null };
  }
  if (selection.kind === "COMPILED_BODY") {
    assert.notEqual(selection.generation, nextGeneration);
    const lineage = analyzeProvenanceLineage(
      bodyProvenanceFromPhysicalPlan(beforePlan),
      bodyProvenanceFromPhysicalPlan(afterPlan),
    );
    const trace = lineage.components.find((component) => component.beforeEntityIds.includes(selection.id)) ?? null;
    return { selection: null, trace, lineage };
  }
  throw new Error(`unknown selection kind ${selection.kind}`);
}

const PROFILES = Object.freeze({
  "matter-lab": Object.freeze({
    id: "matter-lab",
    allowedCompilationKinds: Object.freeze(["MATTER"]),
  }),
  "active-bearing-lab": Object.freeze({
    id: "active-bearing-lab",
    allowedCompilationKinds: Object.freeze(["ACTIVE_BEARING"]),
    expectedRuntime: Object.freeze({
      gravity: Object.freeze({ x: 0, y: 0, z: 0 }),
      contactsDisabled: true,
      sleepEnabled: false,
      linearDamping: 0,
      angularDamping: 0,
    }),
  }),
  "elastic-1d-lab": Object.freeze({
    id: "elastic-1d-lab",
    allowedCompilationKinds: Object.freeze([]),
  }),
});

function runCompatibility(compilation, profile) {
  if (compilation.status !== "VALID") {
    return { allowed: false, code: `COMPILE_${compilation.status}` };
  }
  if (!profile.allowedCompilationKinds.includes(compilation.kind)) {
    return {
      allowed: false,
      code: "PROFILE_INCOMPATIBLE",
      compilationKind: compilation.kind,
      profileId: profile.id,
    };
  }
  return { allowed: true, compilationKind: compilation.kind, profileId: profile.id };
}

function finiteSnapshot(snapshot) {
  return [
    snapshot.position.x,
    snapshot.position.y,
    snapshot.position.z,
    snapshot.rotation.x,
    snapshot.rotation.y,
    snapshot.rotation.z,
    snapshot.rotation.w,
    snapshot.linearVelocity.x,
    snapshot.linearVelocity.y,
    snapshot.linearVelocity.z,
    snapshot.angularVelocity.x,
    snapshot.angularVelocity.y,
    snapshot.angularVelocity.z,
    snapshot.massKg,
    snapshot.localCenter.x,
    snapshot.localCenter.y,
    snapshot.localCenter.z,
  ].every(Number.isFinite);
}

test("P04 A-B: custom authored source compiles and runs through accepted active-bearing path without fixture helpers", async () => {
  const source = activeBearingSource();
  const sourceBefore = structuredClone(source);
  deepFreeze(source);

  const compilation = compileStudioProbe(source);
  assert.equal(compilation.status, "VALID");
  assert.equal(compilation.kind, "ACTIVE_BEARING");
  assert.equal(compilation.bearing.physicalPlan.bodies.length, 2);
  assert.equal(compilation.bearing.relation.sourceBearingId, "bearing:studio-probe");
  assert.equal(compilation.torquePatch.sourcePatchId, "torque-patch:studio-probe");
  assert.equal(compilation.torquePatch.torque.action.effortNm, 80);

  const runtime = await ActivatePhysics.create(compilation.torquePatch, source.matter.materials);
  try {
    assert.equal(runtime.activation, "OFF");
    assert.equal(runtime.snapshots().length, 2);
    assert.ok(runtime.snapshots().every(finiteSnapshot));

    runtime.step(10);
    const offSpeed = runtime.relativeAngularSpeedRadps();
    assert.ok(Math.abs(offSpeed) <= 1e-6, `unexpected OFF speed ${offSpeed}`);

    runtime.setActivation("ON");
    runtime.step(30);
    const onSpeed = runtime.relativeAngularSpeedRadps();
    assert.ok(Math.abs(onSpeed) >= 0.1, `active custom source failed to generate motion: ${onSpeed}`);
    assert.ok(runtime.snapshots().every(finiteSnapshot));

    assert.deepEqual(source, sourceBefore, "accepted compiler/runtime path mutated Studio probe source");
  } finally {
    runtime.dispose();
  }
});

test("P04 C: renderer-neutral presentation projection needs only source, compilation and neutral snapshots", async () => {
  const source = activeBearingSource();
  const compilation = compileStudioProbe(source);
  assert.equal(compilation.status, "VALID");
  assert.equal(compilation.kind, "ACTIVE_BEARING");

  const runtime = await ActivatePhysics.create(compilation.torquePatch, source.matter.materials);
  try {
    runtime.setActivation("ON");
    runtime.step(12);
    const projection = presentationProjection(
      source,
      compilation,
      7,
      runtime.snapshots(),
      runtime.activation,
    );

    assert.deepEqual(structuredClone(projection), projection, "presentation projection is not plain structured data");
    assert.equal(projection.source.cells.length, 2);
    assert.equal(projection.compilation.bodies.length, 2);
    assert.equal(projection.runtime.bodies.length, 2);
    assert.equal(projection.compilation.bearingOverlay.sourceBearingId, "bearing:studio-probe");
    assert.equal(projection.compilation.torqueOverlay.sourcePatchId, "torque-patch:studio-probe");
    assert.equal(projection.runtime.activation, "ON");

    const runtimeIds = new Set(projection.runtime.bodies.map((body) => body.planBodyId));
    for (const body of projection.compilation.bodies) assert.ok(runtimeIds.has(body.id));

    const serialized = JSON.stringify(projection);
    assert.equal(serialized.includes("b3WorldId"), false);
    assert.equal(serialized.includes("b3BodyId"), false);
    assert.equal(serialized.includes("b3JointId"), false);
  } finally {
    runtime.dispose();
  }
});

test("P04 D: recompilation invalidates compiled selection while provenance describes lineage and source selection survives", () => {
  const matterBefore = {
    schema: "anvil-matter/0",
    revision: "studio-p04/selection-before",
    cellSizeM: 0.5,
    materials: [MATERIAL],
    cells: [
      { id: "left", grid: { x: 0, y: 0, z: 0 }, materialId: MATERIAL.id },
      { id: "right", grid: { x: 2, y: 0, z: 0 }, materialId: MATERIAL.id },
    ],
  };
  const matterAfter = {
    ...matterBefore,
    revision: "studio-p04/selection-after",
    cells: [
      matterBefore.cells[0],
      { id: "bridge", grid: { x: 1, y: 0, z: 0 }, materialId: MATERIAL.id },
      matterBefore.cells[1],
    ],
  };

  const beforePlan = compileMatter(matterBefore);
  const afterPlan = compileMatter(matterAfter);
  assert.equal(beforePlan.bodies.length, 2);
  assert.equal(afterPlan.bodies.length, 1);

  const selectedBody = beforePlan.bodies.find((body) => body.sourceCellIds.includes("left"));
  assert.ok(selectedBody);
  const compiled = compiledSelection(10, selectedBody.id);
  const compiledResult = reconcileSelectionAfterRecompile(compiled, 11, beforePlan, afterPlan);
  assert.equal(compiledResult.selection, null);
  assert.ok(compiledResult.trace);
  assert.equal(compiledResult.trace.kind, "merge");
  assert.equal(compiledResult.trace.beforeEntityIds.length, 2);
  assert.equal(compiledResult.trace.afterEntityIds.length, 1);
  assert.deepEqual(compiledResult.lineage.addedSourceIds, ["bridge"]);

  const source = sourceSelection("left");
  const sourceResult = reconcileSelectionAfterRecompile(source, 11, beforePlan, afterPlan);
  assert.deepEqual(sourceResult.selection, source);
  assert.equal(sourceResult.trace, null);
});

test("P04 E: application orchestration can preserve unsupported intent without modifying accepted core", () => {
  const source = activeBearingSource();
  source.generation = 2;
  source.bearings.push({
    id: "bearing:second-unqualified",
    endpointA: { cellId: "left", face: "y+" },
    endpointB: { cellId: "right", face: "y-" },
    freeAxis: "x",
  });
  const sourceBefore = structuredClone(source);

  const result = compileStudioProbe(source);
  assert.deepEqual(result, { status: "UNSUPPORTED", code: "MULTI_BEARING_NOT_QUALIFIED" });
  assert.deepEqual(source, sourceBefore, "UNSUPPORTED classification mutated authored intent");
});

test("P04 F: simulation profile compatibility is separate from source validity and active-bearing descriptor matches real runtime", async () => {
  const source = activeBearingSource();
  const compilation = compileStudioProbe(source);
  assert.equal(compilation.status, "VALID");

  assert.deepEqual(runCompatibility(compilation, PROFILES["active-bearing-lab"]), {
    allowed: true,
    compilationKind: "ACTIVE_BEARING",
    profileId: "active-bearing-lab",
  });
  assert.deepEqual(runCompatibility(compilation, PROFILES["matter-lab"]), {
    allowed: false,
    code: "PROFILE_INCOMPATIBLE",
    compilationKind: "ACTIVE_BEARING",
    profileId: "matter-lab",
  });
  assert.deepEqual(runCompatibility(compilation, PROFILES["elastic-1d-lab"]), {
    allowed: false,
    code: "PROFILE_INCOMPATIBLE",
    compilationKind: "ACTIVE_BEARING",
    profileId: "elastic-1d-lab",
  });

  const runtime = await ActivatePhysics.create(compilation.torquePatch, source.matter.materials);
  try {
    const expected = PROFILES["active-bearing-lab"].expectedRuntime;
    assert.deepEqual(runtime.receipt.gravity, expected.gravity);
    assert.equal(runtime.receipt.contactsDisabled, expected.contactsDisabled);
    for (const value of Object.values(runtime.receipt.bodySleepEnabled)) assert.equal(value, expected.sleepEnabled);
    for (const value of Object.values(runtime.receipt.bodyLinearDamping)) assert.equal(value, expected.linearDamping);
    for (const value of Object.values(runtime.receipt.bodyAngularDamping)) assert.equal(value, expected.angularDamping);
  } finally {
    runtime.dispose();
  }
});
