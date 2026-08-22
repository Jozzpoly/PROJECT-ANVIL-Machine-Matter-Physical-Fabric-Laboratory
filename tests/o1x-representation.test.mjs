import test from "node:test";
import assert from "node:assert/strict";
import { projectO1xRepresentation } from "../.test-build/src/studio/o1x-representation.js";

const material = Object.freeze({
  id: "o1x:material",
  densityKgM3: 780,
  friction: 0.45,
  displayColor: "#9db6c7",
});

function source(cells, bearings = [], torquePatches = []) {
  return {
    schema: "anvil-studio-source/0",
    matter: {
      schema: "anvil-matter/0",
      revision: "o1x-representation",
      cellSizeM: 0.5,
      materials: [material],
      cells,
    },
    bearings,
    torquePatches,
  };
}

function cell(id, x, y, z = 0) {
  return { id, grid: { x, y, z }, materialId: material.id };
}

test("O1-X Surface removes the internal face between two adjacent cells while Meaning retains that interface", () => {
  const authored = source([
    cell("A", 0, 0),
    cell("B", 1, 0),
  ]);
  const projection = projectO1xRepresentation(authored);

  assert.equal(projection.surfaceFaces.length, 10);
  assert.equal(projection.sharedInterfaces.length, 1);
  assert.ok(!projection.surfaceFaces.some((face) => face.cellId === "A" && face.face === "x+"));
  assert.ok(!projection.surfaceFaces.some((face) => face.cellId === "B" && face.face === "x-"));

  const seam = projection.sharedInterfaces[0];
  assert.ok(seam !== undefined);
  assert.deepEqual(seam.endpointA, { cellId: "A", face: "x+" });
  assert.deepEqual(seam.endpointB, { cellId: "B", face: "x-" });
  assert.deepEqual(seam.legalAxes, ["y", "z"]);
  assert.deepEqual(seam.centerGrid, [1, 0.5, 0.5]);

  const provenance = new Set(projection.surfaceFaces.map((face) => face.key));
  assert.equal(provenance.size, 10);
  for (const face of projection.surfaceFaces) {
    assert.equal(face.key, `${face.cellId}@${face.face}`);
  }
});

test("O1-X 2x2 projection is canonical under source order and separates 16 exterior faces from 4 internal interfaces", () => {
  const cells = [
    cell("A", 0, 0),
    cell("B", 1, 0),
    cell("C", 0, 1),
    cell("D", 1, 1),
  ];
  const forward = projectO1xRepresentation(source(cells));
  const reverse = projectO1xRepresentation(source([...cells].reverse()));

  assert.deepEqual(reverse, forward);
  assert.equal(forward.surfaceFaces.length, 16);
  assert.equal(forward.sharedInterfaces.length, 4);
  assert.equal(new Set(forward.sharedInterfaces.map((entry) => entry.key)).size, 4);
});

test("O1-X Meaning projection associates persistent Bearing and TorquePatch without renderer identity", () => {
  const authored = source(
    [cell("A", 0, 0), cell("B", 1, 0)],
    [{
      id: "bearing:seam",
      endpointA: { cellId: "A", face: "x+" },
      endpointB: { cellId: "B", face: "x-" },
      freeAxis: "z",
    }],
    [{
      id: "torque:seam",
      target: { cellId: "A", face: "x+" },
      effortNm: 25,
    }],
  );

  const projection = projectO1xRepresentation(authored);
  const seam = projection.sharedInterfaces[0];
  assert.ok(seam !== undefined);
  assert.deepEqual(seam.bearingIds, ["bearing:seam"]);
  assert.deepEqual(seam.torquePatchIds, ["torque:seam"]);
  assert.equal(Object.hasOwn(seam, "objectId"), false);
  assert.equal(Object.hasOwn(seam, "meshId"), false);
  assert.equal(Object.hasOwn(seam, "runtimeId"), false);
});
