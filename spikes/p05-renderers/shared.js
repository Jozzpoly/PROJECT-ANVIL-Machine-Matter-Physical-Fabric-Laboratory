import { compileBearing } from "../../src/experiments/anvil-02-bearing.ts";
import { relowerTorquePatchToBearing } from "../../src/experiments/anvil-10-torque-patch-rebind.ts";
import { ActivatePhysics } from "../../src/experiments/anvil-09-activate-runtime.ts";

export const PERF_COUNT = 10_000;

export function makePerfGrid(count = PERF_COUNT) {
  const side = Math.ceil(Math.sqrt(count));
  const spacing = 0.05;
  const half = ((side - 1) * spacing) / 2;
  const positions = [];
  for (let i = 0; i < count; i += 1) {
    const x = (i % side) * spacing - half;
    const y = Math.floor(i / side) * spacing - half;
    positions.push({ id: `cell:${i}`, x, y, z: -0.6 });
  }
  const targetIndex = Math.min(count - 1, Math.floor(side * 0.8) * side + Math.floor(side * 0.8));
  return { count, side, spacing, positions, targetIndex, target: positions[targetIndex] };
}

export function createActiveBearingSource() {
  const material = {
    id: "p05-alloy",
    densityKgM3: 900,
    friction: 0.5,
    displayColor: "#8bc9ff",
  };
  return {
    matter: {
      schema: "anvil-matter/0",
      revision: "studio-p05/renderer-proof",
      cellSizeM: 0.5,
      materials: [material],
      cells: [
        { id: "left", grid: { x: 0, y: 0, z: 0 }, materialId: material.id },
        { id: "right", grid: { x: 1, y: 0, z: 0 }, materialId: material.id },
      ],
    },
    bearing: {
      id: "bearing:p05",
      endpointA: { cellId: "left", face: "x+" },
      endpointB: { cellId: "right", face: "x-" },
      freeAxis: "z",
    },
    patch: {
      id: "torque-patch:p05",
      target: { cellId: "left", face: "x+" },
      effortNm: 80,
    },
  };
}

function cellCenter(matter, cellId) {
  const cell = matter.cells.find((candidate) => candidate.id === cellId);
  if (!cell) throw new Error(`missing source cell ${cellId}`);
  const s = matter.cellSizeM;
  return { x: (cell.grid.x + 0.5) * s, y: (cell.grid.y + 0.5) * s, z: (cell.grid.z + 0.5) * s };
}

export function buildStaticPresentation(source, compilation) {
  const plan = compilation.bearing.physicalPlan;
  const relation = compilation.bearing.relation;
  const patchCenter = cellCenter(source.matter, source.patch.target.cellId);
  patchCenter.x += source.matter.cellSizeM / 2;
  return {
    schema: "p05-renderer-neutral-presentation/0",
    source: {
      cells: source.matter.cells.map((cell) => ({ id: cell.id, grid: { ...cell.grid }, materialId: cell.materialId })),
      bearing: structuredClone(source.bearing),
      torquePatch: structuredClone(source.patch),
    },
    compiled: {
      bodies: plan.bodies.map((body) => ({
        id: body.id,
        sourceCellIds: [...body.sourceCellIds],
        centerOfMassWorld: { ...body.centerOfMassWorld },
      })),
      bearing: {
        sourceBearingId: relation.sourceBearingId,
        pivotWorld: { ...relation.pivotWorld },
        axisWorld: { ...relation.axisWorld },
      },
      torque: {
        sourcePatchId: compilation.torquePatch.sourcePatchId,
        targetCenterWorld: patchCenter,
        effortNm: compilation.torquePatch.torque.action.effortNm,
      },
    },
  };
}

export async function createRuntimeHarness() {
  const source = createActiveBearingSource();
  const bearing = compileBearing({ matter: source.matter, bearing: source.bearing });
  const torquePatch = relowerTorquePatchToBearing(source.patch, bearing);
  const compilation = { bearing, torquePatch };
  const presentation = buildStaticPresentation(source, compilation);
  const runtime = await ActivatePhysics.create(torquePatch, source.matter.materials);
  runtime.step(10);
  const offSpeedRadps = runtime.relativeAngularSpeedRadps();
  runtime.setActivation("ON");
  return {
    source,
    compilation,
    presentation,
    runtime,
    offSpeedRadps,
    step(steps = 1) {
      runtime.step(steps);
      return {
        activation: runtime.activation,
        relativeAngularSpeedRadps: runtime.relativeAngularSpeedRadps(),
        bodies: runtime.snapshots().map((snapshot) => ({
          planBodyId: snapshot.planBodyId,
          position: { ...snapshot.position },
          rotation: { ...snapshot.rotation },
          linearVelocity: { ...snapshot.linearVelocity },
          angularVelocity: { ...snapshot.angularVelocity },
        })),
      };
    },
    dispose() { runtime.dispose(); },
  };
}

export function faceFromNormal(normal) {
  const axes = [
    ["x", Math.abs(normal.x), normal.x],
    ["y", Math.abs(normal.y), normal.y],
    ["z", Math.abs(normal.z), normal.z],
  ].sort((a, b) => b[1] - a[1]);
  return `${axes[0][0]}${axes[0][2] >= 0 ? "+" : "-"}`;
}

export function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
