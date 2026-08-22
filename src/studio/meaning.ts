import type {
  BearingAxis,
  BearingEndpoint,
  BearingMark,
} from "../experiments/anvil-02-bearing.js";
import type { TorquePatch } from "../experiments/anvil-06-torque-patch.js";
import type { StudioGridFace, StudioSourceV0 } from "./workspace.js";

export interface StudioBearingTarget {
  readonly endpointA: BearingEndpoint;
  readonly endpointB: BearingEndpoint;
  readonly legalAxes: readonly [BearingAxis, BearingAxis];
  readonly existingBearings: readonly BearingMark[];
}

export interface StudioTorqueTarget {
  readonly target: BearingEndpoint;
  readonly bearing: BearingMark;
  readonly existingPatches: readonly TorquePatch[];
}

const FACE_OFFSET: Readonly<Record<StudioGridFace, readonly [number, number, number]>> = Object.freeze({
  "x-": [-1, 0, 0],
  "x+": [1, 0, 0],
  "y-": [0, -1, 0],
  "y+": [0, 1, 0],
  "z-": [0, 0, -1],
  "z+": [0, 0, 1],
});

const OPPOSITE_FACE: Readonly<Record<StudioGridFace, StudioGridFace>> = Object.freeze({
  "x-": "x+",
  "x+": "x-",
  "y-": "y+",
  "y+": "y-",
  "z-": "z+",
  "z+": "z-",
});

const TANGENT_AXES: Readonly<Record<StudioGridFace, readonly [BearingAxis, BearingAxis]>> = Object.freeze({
  "x-": ["y", "z"],
  "x+": ["y", "z"],
  "y-": ["x", "z"],
  "y+": ["x", "z"],
  "z-": ["x", "y"],
  "z+": ["x", "y"],
});

const TORQUE_NM_PER_PIXEL = 1;
const TORQUE_FINE_SCALE = 0.1;

function sameEndpoint(a: BearingEndpoint, b: BearingEndpoint): boolean {
  return a.cellId === b.cellId && a.face === b.face;
}

function sameSeam(
  a0: BearingEndpoint,
  a1: BearingEndpoint,
  b0: BearingEndpoint,
  b1: BearingEndpoint,
): boolean {
  return (
    sameEndpoint(a0, b0) && sameEndpoint(a1, b1)
  ) || (
    sameEndpoint(a0, b1) && sameEndpoint(a1, b0)
  );
}

export function resolveBearingTarget(
  source: StudioSourceV0,
  cellId: string,
  face: StudioGridFace,
): StudioBearingTarget | null {
  const cell = source.matter.cells.find((candidate) => candidate.id === cellId);
  if (cell === undefined) return null;

  const offset = FACE_OFFSET[face];
  const neighbor = source.matter.cells.find((candidate) =>
    candidate.grid.x === cell.grid.x + offset[0] &&
    candidate.grid.y === cell.grid.y + offset[1] &&
    candidate.grid.z === cell.grid.z + offset[2]
  );
  if (neighbor === undefined) return null;

  const endpointA: BearingEndpoint = { cellId: cell.id, face };
  const endpointB: BearingEndpoint = { cellId: neighbor.id, face: OPPOSITE_FACE[face] };
  return {
    endpointA,
    endpointB,
    legalAxes: TANGENT_AXES[face],
    existingBearings: source.bearings.filter((bearing) =>
      sameSeam(endpointA, endpointB, bearing.endpointA, bearing.endpointB)
    ),
  };
}

export function resolveTorqueTarget(
  source: StudioSourceV0,
  cellId: string,
  face: StudioGridFace,
): StudioTorqueTarget | null {
  const target: BearingEndpoint = { cellId, face };
  if (!source.matter.cells.some((cell) => cell.id === cellId)) return null;

  const bearings = source.bearings.filter((bearing) =>
    sameEndpoint(target, bearing.endpointA) || sameEndpoint(target, bearing.endpointB)
  );
  if (bearings.length !== 1) return null;
  const bearing = bearings[0];
  if (bearing === undefined) return null;

  return {
    target,
    bearing,
    existingPatches: source.torquePatches.filter((patch) => sameEndpoint(patch.target, target)),
  };
}

export function applyTorqueDraftDrag(
  currentEffortNm: number,
  deltaPixels: number,
  fineAdjustment: boolean,
): number {
  if (!Number.isFinite(currentEffortNm) || !Number.isFinite(deltaPixels)) {
    throw new Error("Studio Torque draft drag requires finite values");
  }
  const scale = TORQUE_NM_PER_PIXEL * (fineAdjustment ? TORQUE_FINE_SCALE : 1);
  return currentEffortNm + deltaPixels * scale;
}
