import type { GridPosition, MaterialDefinition, MatterCell, MatterDocument } from "../model.js";
import type { BearingAxis, BearingEndpoint, BearingMark } from "../experiments/anvil-02-bearing.js";
import type { TorquePatch } from "../experiments/anvil-06-torque-patch.js";

export type GridFace = "x-" | "x+" | "y-" | "y+" | "z-" | "z+";

export interface FreedomSourceV0 {
  readonly schema: "anvil-studio-source/0";
  readonly matter: MatterDocument;
  readonly bearings: readonly BearingMark[];
  readonly torquePatches: readonly TorquePatch[];
}

export interface FreedomSnapshot {
  readonly source: FreedomSourceV0;
  readonly generation: number;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}

export interface RemovalReceipt {
  readonly removedMatterIds: readonly string[];
  readonly removedBearingIds: readonly string[];
  readonly removedTorquePatchIds: readonly string[];
}

const FACE_OFFSETS: Readonly<Record<GridFace, GridPosition>> = Object.freeze({
  "x-": { x: -1, y: 0, z: 0 },
  "x+": { x: 1, y: 0, z: 0 },
  "y-": { x: 0, y: -1, z: 0 },
  "y+": { x: 0, y: 1, z: 0 },
  "z-": { x: 0, y: 0, z: -1 },
  "z+": { x: 0, y: 0, z: 1 },
});

const DEFAULT_MATERIAL: MaterialDefinition = Object.freeze({
  id: "studio:alloy",
  densityKgM3: 780,
  friction: 0.45,
  displayColor: "#91AABE",
});

function cloneEndpoint(endpoint: BearingEndpoint): BearingEndpoint {
  return { ...endpoint };
}

function cloneBearing(bearing: BearingMark): BearingMark {
  return {
    ...bearing,
    endpointA: cloneEndpoint(bearing.endpointA),
    endpointB: cloneEndpoint(bearing.endpointB),
  };
}

function clonePatch(patch: TorquePatch): TorquePatch {
  return { ...patch, target: cloneEndpoint(patch.target) };
}

function cloneCell(cell: MatterCell): MatterCell {
  return { ...cell, grid: { ...cell.grid } };
}

function cloneMaterial(material: MaterialDefinition): MaterialDefinition {
  return { ...material };
}

export function cloneFreedomSource(source: FreedomSourceV0): FreedomSourceV0 {
  return {
    schema: "anvil-studio-source/0",
    matter: {
      ...source.matter,
      materials: source.matter.materials.map(cloneMaterial),
      cells: source.matter.cells.map(cloneCell),
    },
    bearings: source.bearings.map(cloneBearing),
    torquePatches: source.torquePatches.map(clonePatch),
  };
}

export function createEmptyFreedomSource(): FreedomSourceV0 {
  return {
    schema: "anvil-studio-source/0",
    matter: {
      schema: "anvil-matter/0",
      revision: "studio-freedom/empty",
      cellSizeM: 0.5,
      materials: [{ ...DEFAULT_MATERIAL }],
      cells: [],
    },
    bearings: [],
    torquePatches: [],
  };
}

export function createFreedomStarterSource(): FreedomSourceV0 {
  const material = { ...DEFAULT_MATERIAL };
  return {
    schema: "anvil-studio-source/0",
    matter: {
      schema: "anvil-matter/0",
      revision: "studio-freedom/starter-v0",
      cellSizeM: 0.5,
      materials: [material],
      cells: [
        { id: "starter:a", grid: { x: -1, y: 0, z: 0 }, materialId: material.id },
        { id: "starter:b", grid: { x: 0, y: 0, z: 0 }, materialId: material.id },
        { id: "starter:c", grid: { x: 1, y: 0, z: 0 }, materialId: material.id },
      ],
    },
    bearings: [],
    torquePatches: [],
  };
}

function gridKey(grid: GridPosition): string {
  return `${grid.x},${grid.y},${grid.z}`;
}

function addGrid(a: GridPosition, b: GridPosition): GridPosition {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function scaleGrid(value: GridPosition, scalar: number): GridPosition {
  return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar };
}

function sameEndpoint(a: BearingEndpoint, b: BearingEndpoint): boolean {
  return a.cellId === b.cellId && a.face === b.face;
}

function patchDependsOnBearing(patch: TorquePatch, bearing: BearingMark): boolean {
  return sameEndpoint(patch.target, bearing.endpointA) || sameEndpoint(patch.target, bearing.endpointB);
}

function nextId(prefix: string, ids: ReadonlySet<string>): string {
  for (let index = 1; index < 100_000; index += 1) {
    const candidate = `${prefix}:${index}`;
    if (!ids.has(candidate)) return candidate;
  }
  throw new Error(`Could not allocate ${prefix} id`);
}

function requireCell(source: FreedomSourceV0, cellId: string): MatterCell {
  const cell = source.matter.cells.find((candidate) => candidate.id === cellId);
  if (cell === undefined) throw new Error(`No Matter cell ${cellId}`);
  return cell;
}

function requireBearing(source: FreedomSourceV0, bearingId: string): BearingMark {
  const bearing = source.bearings.find((candidate) => candidate.id === bearingId);
  if (bearing === undefined) throw new Error(`No Bearing ${bearingId}`);
  return bearing;
}

function requirePatch(source: FreedomSourceV0, patchId: string): TorquePatch {
  const patch = source.torquePatches.find((candidate) => candidate.id === patchId);
  if (patch === undefined) throw new Error(`No TorquePatch ${patchId}`);
  return patch;
}

export class FreedomWorkspace {
  #source: FreedomSourceV0;
  #generation = 0;
  #history: FreedomSourceV0[] = [];
  #future: FreedomSourceV0[] = [];

  constructor(source: FreedomSourceV0) {
    this.#source = cloneFreedomSource(source);
  }

  snapshot(): FreedomSnapshot {
    return {
      source: cloneFreedomSource(this.#source),
      generation: this.#generation,
      canUndo: this.#history.length > 0,
      canRedo: this.#future.length > 0,
    };
  }

  #commit(next: FreedomSourceV0): void {
    this.#history.push(cloneFreedomSource(this.#source));
    this.#source = cloneFreedomSource(next);
    this.#future = [];
    this.#generation += 1;
  }

  undo(): boolean {
    const previous = this.#history.pop();
    if (previous === undefined) return false;
    this.#future.push(cloneFreedomSource(this.#source));
    this.#source = previous;
    this.#generation += 1;
    return true;
  }

  redo(): boolean {
    const next = this.#future.pop();
    if (next === undefined) return false;
    this.#history.push(cloneFreedomSource(this.#source));
    this.#source = next;
    this.#generation += 1;
    return true;
  }

  addSeedMatter(materialId = DEFAULT_MATERIAL.id): string {
    if (this.#source.matter.cells.length !== 0) throw new Error("Seed Matter requires an empty world");
    if (!this.#source.matter.materials.some((material) => material.id === materialId)) throw new Error(`Unknown material ${materialId}`);
    const id = nextId("matter", new Set(this.#source.matter.cells.map((cell) => cell.id)));
    const next = cloneFreedomSource(this.#source);
    this.#commit({
      ...next,
      matter: {
        ...next.matter,
        cells: [...next.matter.cells, { id, grid: { x: 0, y: 0, z: 0 }, materialId }],
      },
    });
    return id;
  }

  addMatterFromFace(cellId: string, face: GridFace): string {
    const added = this.extrudeMatterFromFace(cellId, face, 1);
    const id = added[0];
    if (id === undefined) throw new Error("Adjacent Matter position is occupied");
    return id;
  }

  extrudeMatterFromFace(cellId: string, face: GridFace, requestedCount: number): readonly string[] {
    if (!Number.isInteger(requestedCount) || requestedCount < 1 || requestedCount > 64) {
      throw new Error("Matter extrusion count must be an integer from 1 to 64");
    }
    const sourceCell = requireCell(this.#source, cellId);
    const direction = FACE_OFFSETS[face];
    const occupied = new Set(this.#source.matter.cells.map((cell) => gridKey(cell.grid)));
    const reservedIds = new Set(this.#source.matter.cells.map((cell) => cell.id));
    const cells: MatterCell[] = [];
    const ids: string[] = [];

    for (let step = 1; step <= requestedCount; step += 1) {
      const grid = addGrid(sourceCell.grid, scaleGrid(direction, step));
      const key = gridKey(grid);
      if (occupied.has(key)) break;
      const id = nextId("matter", reservedIds);
      reservedIds.add(id);
      occupied.add(key);
      ids.push(id);
      cells.push({ id, grid, materialId: sourceCell.materialId });
    }

    if (cells.length === 0) return [];
    const next = cloneFreedomSource(this.#source);
    this.#commit({
      ...next,
      matter: { ...next.matter, cells: [...next.matter.cells, ...cells] },
    });
    return ids;
  }

  addBearing(endpointA: BearingEndpoint, endpointB: BearingEndpoint, freeAxis: BearingAxis): string {
    const id = nextId("bearing", new Set(this.#source.bearings.map((bearing) => bearing.id)));
    const next = cloneFreedomSource(this.#source);
    this.#commit({
      ...next,
      bearings: [...next.bearings, { id, endpointA: cloneEndpoint(endpointA), endpointB: cloneEndpoint(endpointB), freeAxis }],
    });
    return id;
  }

  rebindBearing(
    bearingId: string,
    endpointA: BearingEndpoint,
    endpointB: BearingEndpoint,
    freeAxis?: BearingAxis,
  ): void {
    const bearing = requireBearing(this.#source, bearingId);
    const next = cloneFreedomSource(this.#source);
    this.#commit({
      ...next,
      bearings: next.bearings.map((candidate) => candidate.id === bearingId
        ? {
            ...candidate,
            endpointA: cloneEndpoint(endpointA),
            endpointB: cloneEndpoint(endpointB),
            freeAxis: freeAxis ?? bearing.freeAxis,
          }
        : candidate),
    });
  }

  addTorquePatch(target: BearingEndpoint, effortNm: number): string {
    if (!Number.isFinite(effortNm)) throw new Error("Torque effort must be finite");
    const id = nextId("torque", new Set(this.#source.torquePatches.map((patch) => patch.id)));
    const next = cloneFreedomSource(this.#source);
    this.#commit({ ...next, torquePatches: [...next.torquePatches, { id, target: cloneEndpoint(target), effortNm }] });
    return id;
  }

  editTorquePatch(patchId: string, effortNm: number): void {
    requirePatch(this.#source, patchId);
    if (!Number.isFinite(effortNm)) throw new Error("Torque effort must be finite");
    const next = cloneFreedomSource(this.#source);
    this.#commit({
      ...next,
      torquePatches: next.torquePatches.map((patch) => patch.id === patchId ? { ...patch, effortNm } : patch),
    });
  }

  retargetTorquePatch(patchId: string, target: BearingEndpoint): void {
    requirePatch(this.#source, patchId);
    const next = cloneFreedomSource(this.#source);
    this.#commit({
      ...next,
      torquePatches: next.torquePatches.map((patch) => patch.id === patchId
        ? { ...patch, target: cloneEndpoint(target) }
        : patch),
    });
  }

  removeTorquePatch(patchId: string): RemovalReceipt {
    requirePatch(this.#source, patchId);
    const next = cloneFreedomSource(this.#source);
    this.#commit({ ...next, torquePatches: next.torquePatches.filter((patch) => patch.id !== patchId) });
    return { removedMatterIds: [], removedBearingIds: [], removedTorquePatchIds: [patchId] };
  }

  /** Exact delete: remove only the authored Bearing explicitly named by the Owner. */
  removeBearing(bearingId: string): RemovalReceipt {
    requireBearing(this.#source, bearingId);
    const next = cloneFreedomSource(this.#source);
    this.#commit({
      ...next,
      bearings: next.bearings.filter((candidate) => candidate.id !== bearingId),
    });
    return { removedMatterIds: [], removedBearingIds: [bearingId], removedTorquePatchIds: [] };
  }

  /** Explicit destructive operation: remove a Bearing and Torque meanings currently anchored to its endpoints. */
  removeBearingWithDependents(bearingId: string): RemovalReceipt {
    const bearing = requireBearing(this.#source, bearingId);
    const dependentTorquePatchIds = this.#source.torquePatches
      .filter((patch) => patchDependsOnBearing(patch, bearing))
      .map((patch) => patch.id);
    const dependent = new Set(dependentTorquePatchIds);
    const next = cloneFreedomSource(this.#source);
    this.#commit({
      ...next,
      bearings: next.bearings.filter((candidate) => candidate.id !== bearingId),
      torquePatches: next.torquePatches.filter((patch) => !dependent.has(patch.id)),
    });
    return {
      removedMatterIds: [],
      removedBearingIds: [bearingId],
      removedTorquePatchIds: dependentTorquePatchIds,
    };
  }

  /** Exact delete: remove only the authored Matter explicitly named by the Owner. */
  removeMatter(cellId: string): RemovalReceipt {
    requireCell(this.#source, cellId);
    const next = cloneFreedomSource(this.#source);
    this.#commit({
      ...next,
      matter: { ...next.matter, cells: next.matter.cells.filter((cell) => cell.id !== cellId) },
    });
    return { removedMatterIds: [cellId], removedBearingIds: [], removedTorquePatchIds: [] };
  }

  /** Explicit destructive operation: remove Matter plus meanings that directly lose that local referent. */
  removeMatterWithDependents(cellId: string): RemovalReceipt {
    requireCell(this.#source, cellId);
    const removedBearings = this.#source.bearings.filter(
      (bearing) => bearing.endpointA.cellId === cellId || bearing.endpointB.cellId === cellId,
    );
    const removedBearingIds = removedBearings.map((bearing) => bearing.id);
    const removedTorquePatchIds = this.#source.torquePatches
      .filter((patch) => patch.target.cellId === cellId || removedBearings.some((bearing) => patchDependsOnBearing(patch, bearing)))
      .map((patch) => patch.id);
    const bearingSet = new Set(removedBearingIds);
    const torqueSet = new Set(removedTorquePatchIds);
    const next = cloneFreedomSource(this.#source);
    this.#commit({
      ...next,
      matter: { ...next.matter, cells: next.matter.cells.filter((cell) => cell.id !== cellId) },
      bearings: next.bearings.filter((bearing) => !bearingSet.has(bearing.id)),
      torquePatches: next.torquePatches.filter((patch) => !torqueSet.has(patch.id)),
    });
    return {
      removedMatterIds: [cellId],
      removedBearingIds,
      removedTorquePatchIds,
    };
  }
}
