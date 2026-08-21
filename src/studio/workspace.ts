import type { GridPosition, MaterialDefinition, MatterCell, MatterDocument } from "../model.js";
import type { BearingMark } from "../experiments/anvil-02-bearing.js";
import type { TorquePatch } from "../experiments/anvil-06-torque-patch.js";

export type StudioGridFace = "x-" | "x+" | "y-" | "y+" | "z-" | "z+";

export interface StudioSourceV0 {
  readonly schema: "anvil-studio-source/0";
  readonly matter: MatterDocument;
  readonly bearings: readonly BearingMark[];
  readonly torquePatches: readonly TorquePatch[];
}

export interface AddMatterPreview {
  readonly grid: GridPosition;
  readonly materialId: string;
}

export interface RemoveMatterPreview {
  readonly cellId: string;
  readonly dependentBearingIds: readonly string[];
  readonly dependentTorquePatchIds: readonly string[];
}

export interface StudioWorkspaceSnapshot {
  readonly source: StudioSourceV0;
  readonly sourceGeneration: number;
  readonly dirty: boolean;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}

export type StudioIdSource = () => string;

const FACE_OFFSETS: Readonly<Record<StudioGridFace, GridPosition>> = Object.freeze({
  "x-": { x: -1, y: 0, z: 0 },
  "x+": { x: 1, y: 0, z: 0 },
  "y-": { x: 0, y: -1, z: 0 },
  "y+": { x: 0, y: 1, z: 0 },
  "z-": { x: 0, y: 0, z: -1 },
  "z+": { x: 0, y: 0, z: 1 },
});

function addGrid(a: GridPosition, b: GridPosition): GridPosition {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function gridKey(grid: GridPosition): string {
  return `${grid.x},${grid.y},${grid.z}`;
}

function cloneMaterial(material: MaterialDefinition): MaterialDefinition {
  return { ...material };
}

function cloneCell(cell: MatterCell): MatterCell {
  return { ...cell, grid: { ...cell.grid } };
}

function cloneBearing(bearing: BearingMark): BearingMark {
  return {
    ...bearing,
    endpointA: { ...bearing.endpointA },
    endpointB: { ...bearing.endpointB },
  };
}

function cloneTorquePatch(patch: TorquePatch): TorquePatch {
  return { ...patch, target: { ...patch.target } };
}

export function cloneStudioSource(source: StudioSourceV0): StudioSourceV0 {
  return {
    schema: "anvil-studio-source/0",
    matter: {
      ...source.matter,
      materials: source.matter.materials.map(cloneMaterial),
      cells: source.matter.cells.map(cloneCell),
    },
    bearings: source.bearings.map(cloneBearing),
    torquePatches: source.torquePatches.map(cloneTorquePatch),
  };
}

export function createStudioIdSource(prefix = "studio-cell"): StudioIdSource {
  let next = 1;
  return () => `${prefix}:${next++}`;
}

const DEFAULT_MATERIAL: MaterialDefinition = Object.freeze({
  id: "studio:alloy",
  densityKgM3: 780,
  friction: 0.45,
  displayColor: "#91AABE",
});

export function createEmptyStudioSource(): StudioSourceV0 {
  return {
    schema: "anvil-studio-source/0",
    matter: {
      schema: "anvil-matter/0",
      revision: "studio-matter/empty",
      cellSizeM: 0.5,
      materials: [{ ...DEFAULT_MATERIAL }],
      cells: [],
    },
    bearings: [],
    torquePatches: [],
  };
}

export function createEditableStarterSource(): StudioSourceV0 {
  const material = { ...DEFAULT_MATERIAL };
  return {
    schema: "anvil-studio-source/0",
    matter: {
      schema: "anvil-matter/0",
      revision: "studio-matter/editable-starter-v0",
      cellSizeM: 0.5,
      materials: [material],
      cells: [
        { id: "starter:a0", grid: { x: -2, y: 0, z: 0 }, materialId: material.id },
        { id: "starter:a1", grid: { x: -2, y: 1, z: 0 }, materialId: material.id },
        { id: "starter:a2", grid: { x: -1, y: 0, z: 0 }, materialId: material.id },
        { id: "starter:b0", grid: { x: 0, y: 0, z: 0 }, materialId: material.id },
        { id: "starter:b1", grid: { x: 1, y: 0, z: 0 }, materialId: material.id },
        { id: "starter:b2", grid: { x: 1, y: -1, z: 0 }, materialId: material.id },
        { id: "starter:b3", grid: { x: 2, y: 0, z: 0 }, materialId: material.id },
      ],
    },
    bearings: [
      {
        id: "bearing:starter-seam",
        endpointA: { cellId: "starter:a2", face: "x+" },
        endpointB: { cellId: "starter:b0", face: "x-" },
        freeAxis: "z",
      },
    ],
    torquePatches: [
      {
        id: "torque-patch:starter-seam",
        target: { cellId: "starter:a2", face: "x+" },
        effortNm: 100,
      },
    ],
  };
}

function cellById(source: StudioSourceV0, cellId: string): MatterCell {
  const cell = source.matter.cells.find((candidate) => candidate.id === cellId);
  if (cell === undefined) throw new Error(`Studio source has no Matter cell ${cellId}`);
  return cell;
}

function assertKnownMaterial(source: StudioSourceV0, materialId: string): void {
  if (!source.matter.materials.some((material) => material.id === materialId)) {
    throw new Error(`Studio source has no material ${materialId}`);
  }
}

function assertGridFree(source: StudioSourceV0, grid: GridPosition): void {
  const key = gridKey(grid);
  if (source.matter.cells.some((cell) => gridKey(cell.grid) === key)) {
    throw new Error(`Studio Matter position ${key} is already occupied`);
  }
}

export function previewSeedMatter(source: StudioSourceV0, materialId: string): AddMatterPreview {
  if (source.matter.cells.length !== 0) throw new Error("Studio seed Matter is only available in an empty workspace");
  assertKnownMaterial(source, materialId);
  return { grid: { x: 0, y: 0, z: 0 }, materialId };
}

export function previewAddMatterFromFace(
  source: StudioSourceV0,
  cellId: string,
  face: StudioGridFace,
  materialId: string,
): AddMatterPreview {
  assertKnownMaterial(source, materialId);
  const cell = cellById(source, cellId);
  const grid = addGrid(cell.grid, FACE_OFFSETS[face]);
  assertGridFree(source, grid);
  return { grid, materialId };
}

export function previewRemoveMatter(source: StudioSourceV0, cellId: string): RemoveMatterPreview {
  cellById(source, cellId);
  return {
    cellId,
    dependentBearingIds: source.bearings
      .filter((bearing) => bearing.endpointA.cellId === cellId || bearing.endpointB.cellId === cellId)
      .map((bearing) => bearing.id),
    dependentTorquePatchIds: source.torquePatches
      .filter((patch) => patch.target.cellId === cellId)
      .map((patch) => patch.id),
  };
}

function sourceWithAddedCell(source: StudioSourceV0, preview: AddMatterPreview, id: string): StudioSourceV0 {
  if (id.trim().length === 0) throw new Error("Studio Matter cell id must be non-empty");
  if (source.matter.cells.some((cell) => cell.id === id)) throw new Error(`Studio Matter cell id already exists: ${id}`);
  assertKnownMaterial(source, preview.materialId);
  assertGridFree(source, preview.grid);
  return {
    ...cloneStudioSource(source),
    matter: {
      ...source.matter,
      materials: source.matter.materials.map(cloneMaterial),
      cells: [...source.matter.cells.map(cloneCell), { id, grid: { ...preview.grid }, materialId: preview.materialId }],
    },
  };
}

function sourceWithRemovedCell(source: StudioSourceV0, cellId: string): StudioSourceV0 {
  cellById(source, cellId);
  const next = cloneStudioSource(source);
  return {
    ...next,
    matter: {
      ...next.matter,
      cells: next.matter.cells.filter((cell) => cell.id !== cellId),
    },
  };
}

function sourceWithAssignedMaterial(source: StudioSourceV0, cellId: string, materialId: string): StudioSourceV0 {
  cellById(source, cellId);
  assertKnownMaterial(source, materialId);
  const next = cloneStudioSource(source);
  return {
    ...next,
    matter: {
      ...next.matter,
      cells: next.matter.cells.map((cell) =>
        cell.id === cellId ? { ...cell, materialId } : cell,
      ),
    },
  };
}

function canonicalSource(source: StudioSourceV0): string {
  return JSON.stringify(source);
}

export class StudioWorkspace {
  readonly #idSource: StudioIdSource;
  #source: StudioSourceV0;
  #sourceGeneration = 0;
  #history: StudioSourceV0[] = [];
  #future: StudioSourceV0[] = [];
  #savedCanonical: string;

  constructor(source: StudioSourceV0, idSource: StudioIdSource = createStudioIdSource()) {
    this.#source = cloneStudioSource(source);
    this.#idSource = idSource;
    this.#savedCanonical = canonicalSource(this.#source);
  }

  snapshot(): StudioWorkspaceSnapshot {
    return {
      source: cloneStudioSource(this.#source),
      sourceGeneration: this.#sourceGeneration,
      dirty: canonicalSource(this.#source) !== this.#savedCanonical,
      canUndo: this.#history.length > 0,
      canRedo: this.#future.length > 0,
    };
  }

  replaceWithOpenedSource(source: StudioSourceV0): void {
    this.#source = cloneStudioSource(source);
    this.#sourceGeneration = 0;
    this.#history = [];
    this.#future = [];
    this.#savedCanonical = canonicalSource(this.#source);
  }

  markSaved(): void {
    this.#savedCanonical = canonicalSource(this.#source);
  }

  commitSeedMatter(materialId: string): string {
    const preview = previewSeedMatter(this.#source, materialId);
    const id = this.#idSource();
    this.#commit(sourceWithAddedCell(this.#source, preview, id), true);
    return id;
  }

  commitAddMatterFromFace(cellId: string, face: StudioGridFace, materialId: string): string {
    const preview = previewAddMatterFromFace(this.#source, cellId, face, materialId);
    const id = this.#idSource();
    this.#commit(sourceWithAddedCell(this.#source, preview, id), true);
    return id;
  }

  commitRemoveMatter(cellId: string): RemoveMatterPreview {
    const preview = previewRemoveMatter(this.#source, cellId);
    this.#commit(sourceWithRemovedCell(this.#source, cellId), true);
    return preview;
  }

  commitAssignMaterial(cellId: string, materialId: string): void {
    this.#commit(sourceWithAssignedMaterial(this.#source, cellId, materialId), true);
  }

  undo(): boolean {
    const previous = this.#history.pop();
    if (previous === undefined) return false;
    this.#future.push(cloneStudioSource(this.#source));
    this.#source = previous;
    this.#sourceGeneration += 1;
    return true;
  }

  redo(): boolean {
    const next = this.#future.pop();
    if (next === undefined) return false;
    this.#history.push(cloneStudioSource(this.#source));
    this.#source = next;
    this.#sourceGeneration += 1;
    return true;
  }

  #commit(next: StudioSourceV0, matterChanged: boolean): void {
    const nextGeneration = this.#sourceGeneration + 1;
    this.#history.push(cloneStudioSource(this.#source));
    this.#future = [];
    const committed = cloneStudioSource(next);
    this.#source = matterChanged
      ? {
          ...committed,
          matter: {
            ...committed.matter,
            revision: `studio-matter/session-${nextGeneration}`,
          },
        }
      : committed;
    this.#sourceGeneration = nextGeneration;
  }
}
