import type { BearingAxis, BearingEndpoint } from "../experiments/anvil-02-bearing.js";
import type { StudioGridFace, StudioSourceV0 } from "./workspace.js";

export interface O1xSurfaceFace {
  readonly key: string;
  readonly cellId: string;
  readonly face: StudioGridFace;
  readonly materialId: string;
  readonly centerGrid: readonly [number, number, number];
}

export interface O1xSharedInterface {
  readonly key: string;
  readonly endpointA: BearingEndpoint;
  readonly endpointB: BearingEndpoint;
  readonly centerGrid: readonly [number, number, number];
  readonly legalAxes: readonly [BearingAxis, BearingAxis];
  readonly bearingIds: readonly string[];
  readonly torquePatchIds: readonly string[];
}

export interface O1xRepresentationProjection {
  readonly surfaceFaces: readonly O1xSurfaceFace[];
  readonly sharedInterfaces: readonly O1xSharedInterface[];
}

interface FaceRule {
  readonly offset: readonly [number, number, number];
  readonly opposite: StudioGridFace;
  readonly legalAxes: readonly [BearingAxis, BearingAxis];
}

const FACE_RULES: Readonly<Record<StudioGridFace, FaceRule>> = Object.freeze({
  "x-": { offset: [-1, 0, 0], opposite: "x+", legalAxes: ["y", "z"] },
  "x+": { offset: [1, 0, 0], opposite: "x-", legalAxes: ["y", "z"] },
  "y-": { offset: [0, -1, 0], opposite: "y+", legalAxes: ["x", "z"] },
  "y+": { offset: [0, 1, 0], opposite: "y-", legalAxes: ["x", "z"] },
  "z-": { offset: [0, 0, -1], opposite: "z+", legalAxes: ["x", "y"] },
  "z+": { offset: [0, 0, 1], opposite: "z-", legalAxes: ["x", "y"] },
});

const FACE_ORDER: readonly StudioGridFace[] = ["x-", "x+", "y-", "y+", "z-", "z+"];
const POSITIVE_INTERFACE_FACES: readonly StudioGridFace[] = ["x+", "y+", "z+"];

function coordKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

function endpointKey(endpoint: BearingEndpoint): string {
  return `${endpoint.cellId}@${endpoint.face}`;
}

function interfaceKey(a: BearingEndpoint, b: BearingEndpoint): string {
  const left = endpointKey(a);
  const right = endpointKey(b);
  return left.localeCompare(right) <= 0 ? `${left}|${right}` : `${right}|${left}`;
}

function sameEndpoint(a: BearingEndpoint, b: BearingEndpoint): boolean {
  return a.cellId === b.cellId && a.face === b.face;
}

function sameInterface(
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

function faceCenterGrid(
  grid: { readonly x: number; readonly y: number; readonly z: number },
  face: StudioGridFace,
): readonly [number, number, number] {
  const [dx, dy, dz] = FACE_RULES[face].offset;
  return [grid.x + 0.5 + dx * 0.5, grid.y + 0.5 + dy * 0.5, grid.z + 0.5 + dz * 0.5];
}

export function projectO1xRepresentation(source: StudioSourceV0): O1xRepresentationProjection {
  const byCoord = new Map(
    source.matter.cells.map((cell) => [coordKey(cell.grid.x, cell.grid.y, cell.grid.z), cell] as const),
  );
  const orderedCells = [...source.matter.cells].sort((left, right) =>
    left.grid.x - right.grid.x ||
    left.grid.y - right.grid.y ||
    left.grid.z - right.grid.z ||
    left.id.localeCompare(right.id)
  );

  const surfaceFaces: O1xSurfaceFace[] = [];
  const sharedInterfaces: O1xSharedInterface[] = [];

  for (const cell of orderedCells) {
    for (const face of FACE_ORDER) {
      const rule = FACE_RULES[face];
      const [dx, dy, dz] = rule.offset;
      const neighbor = byCoord.get(coordKey(cell.grid.x + dx, cell.grid.y + dy, cell.grid.z + dz));
      if (neighbor !== undefined) continue;
      surfaceFaces.push({
        key: `${cell.id}@${face}`,
        cellId: cell.id,
        face,
        materialId: cell.materialId,
        centerGrid: faceCenterGrid(cell.grid, face),
      });
    }

    for (const face of POSITIVE_INTERFACE_FACES) {
      const rule = FACE_RULES[face];
      const [dx, dy, dz] = rule.offset;
      const neighbor = byCoord.get(coordKey(cell.grid.x + dx, cell.grid.y + dy, cell.grid.z + dz));
      if (neighbor === undefined) continue;

      const endpointA: BearingEndpoint = { cellId: cell.id, face };
      const endpointB: BearingEndpoint = { cellId: neighbor.id, face: rule.opposite };
      const bearingIds = source.bearings
        .filter((bearing) => sameInterface(endpointA, endpointB, bearing.endpointA, bearing.endpointB))
        .map((bearing) => bearing.id)
        .sort();
      const torquePatchIds = source.torquePatches
        .filter((patch) => sameEndpoint(patch.target, endpointA) || sameEndpoint(patch.target, endpointB))
        .map((patch) => patch.id)
        .sort();

      sharedInterfaces.push({
        key: interfaceKey(endpointA, endpointB),
        endpointA,
        endpointB,
        centerGrid: faceCenterGrid(cell.grid, face),
        legalAxes: rule.legalAxes,
        bearingIds,
        torquePatchIds,
      });
    }
  }

  surfaceFaces.sort((left, right) => left.key.localeCompare(right.key));
  sharedInterfaces.sort((left, right) => left.key.localeCompare(right.key));
  return { surfaceFaces, sharedInterfaces };
}
