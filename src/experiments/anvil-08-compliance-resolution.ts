import { compileMatter, type BlockedFaceConnection } from "../compiler.js";
import type {
  GridPosition,
  MaterialDefinition,
  MatterCell,
  MatterDocument,
  PhysicalPlan,
  RigidBodyPlan,
  Vec3,
} from "../model.js";

export type ComplianceResolutionMode = "AREA" | "FIXED_PATCH_CONTROL";
export type ComplianceResolutionScale = "COARSE" | "FINE";
export type ComplianceFace = "x-" | "x+" | "y-" | "y+" | "z-" | "z+";

export interface ComplianceFaceTarget {
  readonly cellId: string;
  readonly face: ComplianceFace;
}

/** Experiment-local ANVIL-08 authored hypothesis. */
export interface NormalCompliancePatch {
  readonly id: string;
  readonly target: ComplianceFaceTarget;
  readonly normalStiffnessPerAreaNPerM3: number;
  readonly normalDampingPerAreaNsPerM3: number;
}

export interface ComplianceResolutionFixture {
  readonly matter: MatterDocument;
  readonly patches: readonly NormalCompliancePatch[];
}

export interface ResolvedCompliancePatchPlan {
  readonly sourcePatchId: string;
  readonly sourceTarget: ComplianceFaceTarget;
  readonly resolvedNeighbor: ComplianceFaceTarget;
  readonly canonicalCellAId: string;
  readonly canonicalCellBId: string;
  readonly normalWorld: Vec3;
  readonly centerWorld: Vec3;
  readonly areaM2: number;
  readonly stiffnessNPerM: number;
  readonly dampingNsPerM: number;
}

export interface ComplianceResolutionRelationPlan {
  readonly schema: "anvil-08-compliance-resolution-relation/0";
  readonly sourcePatchIds: readonly string[];
  readonly sourcePatchCount: number;
  readonly totalAreaM2: number;
  readonly bodyAId: string;
  readonly bodyBId: string;
  readonly normalWorld: Vec3;
  readonly restPointWorld: Vec3;
  readonly localAnchorA: Vec3;
  readonly localAnchorB: Vec3;
  readonly stiffnessNPerM: number;
  readonly dampingNsPerM: number;
  readonly effectiveMassKg: number;
  readonly linearHertz: number;
  readonly linearDampingRatio: number;
}

export interface ComplianceResolutionCompilation {
  readonly schema: "anvil-08-compliance-resolution-compilation/0";
  readonly mode: ComplianceResolutionMode;
  readonly physicalPlan: PhysicalPlan;
  readonly occupiedVolumeM3: number;
  readonly patches: readonly ResolvedCompliancePatchPlan[];
  readonly relation: ComplianceResolutionRelationPlan;
}

const FACE_VECTORS: Readonly<Record<ComplianceFace, GridPosition>> = Object.freeze({
  "x-": { x: -1, y: 0, z: 0 },
  "x+": { x: 1, y: 0, z: 0 },
  "y-": { x: 0, y: -1, z: 0 },
  "y+": { x: 0, y: 1, z: 0 },
  "z-": { x: 0, y: 0, z: -1 },
  "z+": { x: 0, y: 0, z: 1 },
});

const OPPOSITE_FACE: Readonly<Record<ComplianceFace, ComplianceFace>> = Object.freeze({
  "x-": "x+",
  "x+": "x-",
  "y-": "y+",
  "y+": "y-",
  "z-": "z+",
  "z+": "z-",
});

const AREA_STIFFNESS_N_PER_M3 = 40_000;
const AREA_DAMPING_NS_PER_M3 = 7_200;
const FIXED_PATCH_STIFFNESS_N_PER_M = 10_000;
const FIXED_PATCH_DAMPING_NS_PER_M = 1_800;

function addGrid(a: GridPosition, b: GridPosition): GridPosition {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function subtract(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(a: Vec3, scalar: number): Vec3 {
  return { x: a.x * scalar, y: a.y * scalar, z: a.z * scalar };
}

function sameVector(a: Vec3, b: Vec3): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function coordKey(position: GridPosition): string {
  return `${position.x},${position.y},${position.z}`;
}

function physicalPairKey(aId: string, bId: string): string {
  return aId.localeCompare(bId) <= 0 ? `${aId}\u0000${bId}` : `${bId}\u0000${aId}`;
}

function cellCenter(cell: MatterCell, cellSizeM: number): Vec3 {
  return {
    x: (cell.grid.x + 0.5) * cellSizeM,
    y: (cell.grid.y + 0.5) * cellSizeM,
    z: (cell.grid.z + 0.5) * cellSizeM,
  };
}

function faceCenter(cell: MatterCell, face: ComplianceFace, cellSizeM: number): Vec3 {
  const vector = FACE_VECTORS[face];
  return add(cellCenter(cell, cellSizeM), scale(vector, cellSizeM / 2));
}

function bodyFor(plan: PhysicalPlan, bodyId: string): RigidBodyPlan {
  const body = plan.bodies.find((candidate) => candidate.id === bodyId);
  if (body === undefined) throw new Error(`ANVIL-08 missing compiled body ${bodyId}`);
  return body;
}

function canonicalPair(
  a: MatterCell,
  b: MatterCell,
): { readonly cellA: MatterCell; readonly cellB: MatterCell; readonly normalWorld: Vec3 } {
  const dx = b.grid.x - a.grid.x;
  const dy = b.grid.y - a.grid.y;
  const dz = b.grid.z - a.grid.z;
  const distance = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
  if (distance !== 1) throw new Error(`ANVIL-08 internal adjacency is not face-local: ${a.id} <-> ${b.id}`);

  if (dx !== 0) {
    return dx > 0
      ? { cellA: a, cellB: b, normalWorld: { x: 1, y: 0, z: 0 } }
      : { cellA: b, cellB: a, normalWorld: { x: 1, y: 0, z: 0 } };
  }
  if (dy !== 0) {
    return dy > 0
      ? { cellA: a, cellB: b, normalWorld: { x: 0, y: 1, z: 0 } }
      : { cellA: b, cellB: a, normalWorld: { x: 0, y: 1, z: 0 } };
  }
  return dz > 0
    ? { cellA: a, cellB: b, normalWorld: { x: 0, y: 0, z: 1 } }
    : { cellA: b, cellB: a, normalWorld: { x: 0, y: 0, z: 1 } };
}

function validatePatchNumber(value: number, label: string, allowZero: boolean): void {
  if (!Number.isFinite(value) || (allowZero ? value < 0 : value <= 0)) {
    throw new Error(`${label} must be finite and ${allowZero ? "non-negative" : "positive"}`);
  }
}

function makeMaterial(): MaterialDefinition {
  return {
    id: "anvil-08-alloy",
    densityKgM3: 780,
    friction: 0.45,
    displayColor: "#89c7ff",
  };
}

function makeCoarseCells(materialId: string): MatterCell[] {
  return [
    { id: "a:0", grid: { x: -2, y: 0, z: 0 }, materialId },
    { id: "a:1", grid: { x: -2, y: 1, z: 0 }, materialId },
    { id: "a:2", grid: { x: -1, y: 0, z: 0 }, materialId },
    { id: "b:0", grid: { x: 0, y: 0, z: 0 }, materialId },
    { id: "b:1", grid: { x: 1, y: 0, z: 0 }, materialId },
    { id: "b:2", grid: { x: 1, y: -1, z: 0 }, materialId },
    { id: "b:3", grid: { x: 2, y: 0, z: 0 }, materialId },
  ];
}

function refineCells(cells: readonly MatterCell[]): MatterCell[] {
  const refined: MatterCell[] = [];
  for (const cell of cells) {
    for (const dx of [0, 1]) {
      for (const dy of [0, 1]) {
        for (const dz of [0, 1]) {
          refined.push({
            id: `${cell.id}/${dx}${dy}${dz}`,
            grid: {
              x: 2 * cell.grid.x + dx,
              y: 2 * cell.grid.y + dy,
              z: 2 * cell.grid.z + dz,
            },
            materialId: cell.materialId,
          });
        }
      }
    }
  }
  return refined;
}

function makePatch(id: string, target: ComplianceFaceTarget): NormalCompliancePatch {
  return {
    id,
    target,
    normalStiffnessPerAreaNPerM3: AREA_STIFFNESS_N_PER_M3,
    normalDampingPerAreaNsPerM3: AREA_DAMPING_NS_PER_M3,
  };
}

export function createComplianceResolutionFixture(scaleName: ComplianceResolutionScale): ComplianceResolutionFixture {
  const material = makeMaterial();
  const coarseCells = makeCoarseCells(material.id);
  if (scaleName === "COARSE") {
    return {
      matter: {
        schema: "anvil-matter/0",
        revision: "anvil-08-compliance-resolution/coarse-c0-v1",
        cellSizeM: 0.5,
        materials: [material],
        cells: coarseCells,
      },
      patches: [makePatch("compliance:coarse:0", { cellId: "a:2", face: "x+" })],
    };
  }

  return {
    matter: {
      schema: "anvil-matter/0",
      revision: "anvil-08-compliance-resolution/fine-c0-v1",
      cellSizeM: 0.25,
      materials: [material],
      cells: refineCells(coarseCells),
    },
    patches: [
      makePatch("compliance:fine:00", { cellId: "a:2/100", face: "x+" }),
      makePatch("compliance:fine:01", { cellId: "a:2/101", face: "x+" }),
      makePatch("compliance:fine:10", { cellId: "a:2/110", face: "x+" }),
      makePatch("compliance:fine:11", { cellId: "a:2/111", face: "x+" }),
    ],
  };
}

export function compileComplianceResolution(
  authored: ComplianceResolutionFixture,
  mode: ComplianceResolutionMode,
): ComplianceResolutionCompilation {
  if (mode !== "AREA" && mode !== "FIXED_PATCH_CONTROL") {
    throw new Error(`ANVIL-08 unknown compilation mode ${String(mode)}`);
  }
  if (authored.patches.length === 0) throw new Error("ANVIL-08 requires at least one compliance patch");

  const baseline = compileMatter(authored.matter);
  const byId = new Map(authored.matter.cells.map((cell) => [cell.id, cell] as const));
  const byCoord = new Map(authored.matter.cells.map((cell) => [coordKey(cell.grid), cell] as const));
  const patchIds = new Set<string>();
  const physicalPairs = new Set<string>();
  const blocked: BlockedFaceConnection[] = [];
  const resolvedRaw: Array<{
    readonly patch: NormalCompliancePatch;
    readonly targetCell: MatterCell;
    readonly neighborCell: MatterCell;
    readonly canonicalCellA: MatterCell;
    readonly canonicalCellB: MatterCell;
    readonly normalWorld: Vec3;
    readonly centerWorld: Vec3;
  }> = [];

  for (const patch of authored.patches) {
    const sourcePatchId = patch.id.trim();
    if (sourcePatchId.length === 0) throw new Error("ANVIL-08 patch id must be non-empty");
    if (patchIds.has(sourcePatchId)) throw new Error(`ANVIL-08 duplicate patch id ${sourcePatchId}`);
    patchIds.add(sourcePatchId);

    validatePatchNumber(
      patch.normalStiffnessPerAreaNPerM3,
      `ANVIL-08 patch ${sourcePatchId} stiffness-per-area`,
      false,
    );
    validatePatchNumber(
      patch.normalDampingPerAreaNsPerM3,
      `ANVIL-08 patch ${sourcePatchId} damping-per-area`,
      true,
    );

    const targetCell = byId.get(patch.target.cellId);
    if (targetCell === undefined) throw new Error(`ANVIL-08 patch ${sourcePatchId} references unknown source cell ${patch.target.cellId}`);
    const faceVector = FACE_VECTORS[patch.target.face];
    if (faceVector === undefined) throw new Error(`ANVIL-08 patch ${sourcePatchId} has invalid face ${String(patch.target.face)}`);
    const neighborCell = byCoord.get(coordKey(addGrid(targetCell.grid, faceVector)));
    if (neighborCell === undefined) {
      throw new Error(`ANVIL-08 patch ${sourcePatchId} target ${patch.target.cellId}@${patch.target.face} has no adjacent matter`);
    }

    const baselineA = baseline.cellToBody[targetCell.id];
    const baselineB = baseline.cellToBody[neighborCell.id];
    if (baselineA === undefined || baselineB === undefined || baselineA !== baselineB) {
      throw new Error(`ANVIL-08 patch ${sourcePatchId} does not replace an ordinary rigid adjacency`);
    }

    const pairKey = physicalPairKey(targetCell.id, neighborCell.id);
    if (physicalPairs.has(pairKey)) {
      throw new Error(`ANVIL-08 physical face adjacency is marked more than once: ${targetCell.id} <-> ${neighborCell.id}`);
    }
    physicalPairs.add(pairKey);

    const canonical = canonicalPair(targetCell, neighborCell);
    blocked.push([canonical.cellA.id, canonical.cellB.id]);
    resolvedRaw.push({
      patch: { ...patch, id: sourcePatchId, target: { ...patch.target } },
      targetCell,
      neighborCell,
      canonicalCellA: canonical.cellA,
      canonicalCellB: canonical.cellB,
      normalWorld: canonical.normalWorld,
      centerWorld: faceCenter(targetCell, patch.target.face, authored.matter.cellSizeM),
    });
  }

  const first = resolvedRaw[0];
  if (first === undefined) throw new Error("ANVIL-08 internal patch resolution is empty");
  const referenceNormal = first.normalWorld;
  const referencePlane = dot(first.centerWorld, referenceNormal);
  for (const resolved of resolvedRaw) {
    if (!sameVector(resolved.normalWorld, referenceNormal)) {
      throw new Error("ANVIL-08 C0 compliance patches must share one canonical normal");
    }
    if (Math.abs(dot(resolved.centerWorld, referenceNormal) - referencePlane) > 1e-12) {
      throw new Error("ANVIL-08 C0 compliance patches must be coplanar");
    }
  }

  const physicalPlan = compileMatter(authored.matter, { blockedFaceConnections: blocked });
  if (physicalPlan.bodies.length !== 2) {
    throw new Error(`ANVIL-08 marked interface must produce exactly two rigid islands, got ${physicalPlan.bodies.length}`);
  }

  const firstBodyAId = physicalPlan.cellToBody[first.canonicalCellA.id];
  const firstBodyBId = physicalPlan.cellToBody[first.canonicalCellB.id];
  if (firstBodyAId === undefined || firstBodyBId === undefined || firstBodyAId === firstBodyBId) {
    throw new Error("ANVIL-08 marked interface did not separate the first physical patch across two bodies");
  }

  for (const resolved of resolvedRaw) {
    const bodyAId = physicalPlan.cellToBody[resolved.canonicalCellA.id];
    const bodyBId = physicalPlan.cellToBody[resolved.canonicalCellB.id];
    if (bodyAId !== firstBodyAId || bodyBId !== firstBodyBId) {
      throw new Error("ANVIL-08 C0 patches do not all connect the same two oriented rigid islands");
    }
  }

  const areaM2 = authored.matter.cellSizeM ** 2;
  const patches: ResolvedCompliancePatchPlan[] = resolvedRaw.map((resolved) => ({
    sourcePatchId: resolved.patch.id,
    sourceTarget: { ...resolved.patch.target },
    resolvedNeighbor: {
      cellId: resolved.neighborCell.id,
      face: OPPOSITE_FACE[resolved.patch.target.face],
    },
    canonicalCellAId: resolved.canonicalCellA.id,
    canonicalCellBId: resolved.canonicalCellB.id,
    normalWorld: { ...resolved.normalWorld },
    centerWorld: { ...resolved.centerWorld },
    areaM2,
    stiffnessNPerM: mode === "AREA"
      ? resolved.patch.normalStiffnessPerAreaNPerM3 * areaM2
      : FIXED_PATCH_STIFFNESS_N_PER_M,
    dampingNsPerM: mode === "AREA"
      ? resolved.patch.normalDampingPerAreaNsPerM3 * areaM2
      : FIXED_PATCH_DAMPING_NS_PER_M,
  })).sort((a, b) => a.sourcePatchId.localeCompare(b.sourcePatchId));

  const totalAreaM2 = patches.reduce((sum, patch) => sum + patch.areaM2, 0);
  const stiffnessNPerM = patches.reduce((sum, patch) => sum + patch.stiffnessNPerM, 0);
  const dampingNsPerM = patches.reduce((sum, patch) => sum + patch.dampingNsPerM, 0);
  const restPointWorld = scale(
    patches.reduce((sum, patch) => add(sum, scale(patch.centerWorld, patch.areaM2)), { x: 0, y: 0, z: 0 }),
    1 / totalAreaM2,
  );

  const bodyA = bodyFor(physicalPlan, firstBodyAId);
  const bodyB = bodyFor(physicalPlan, firstBodyBId);
  const effectiveMassKg = 1 / (1 / bodyA.massKg + 1 / bodyB.massKg);
  const omegaNaturalRadPerS = Math.sqrt(stiffnessNPerM / effectiveMassKg);
  const linearHertz = omegaNaturalRadPerS / (2 * Math.PI);
  const linearDampingRatio = dampingNsPerM / (2 * Math.sqrt(stiffnessNPerM * effectiveMassKg));
  if (![totalAreaM2, stiffnessNPerM, dampingNsPerM, effectiveMassKg, linearHertz, linearDampingRatio].every(Number.isFinite)) {
    throw new Error("ANVIL-08 compiled compliance quantities must be finite");
  }
  if (totalAreaM2 <= 0 || stiffnessNPerM <= 0 || dampingNsPerM < 0 || effectiveMassKg <= 0 || linearHertz <= 0 || linearDampingRatio < 0) {
    throw new Error("ANVIL-08 compiled compliance quantities are outside their physical domain");
  }

  return {
    schema: "anvil-08-compliance-resolution-compilation/0",
    mode,
    physicalPlan,
    occupiedVolumeM3: authored.matter.cells.length * authored.matter.cellSizeM ** 3,
    patches,
    relation: {
      schema: "anvil-08-compliance-resolution-relation/0",
      sourcePatchIds: patches.map((patch) => patch.sourcePatchId),
      sourcePatchCount: patches.length,
      totalAreaM2,
      bodyAId: firstBodyAId,
      bodyBId: firstBodyBId,
      normalWorld: { ...referenceNormal },
      restPointWorld,
      localAnchorA: subtract(restPointWorld, bodyA.centerOfMassWorld),
      localAnchorB: subtract(restPointWorld, bodyB.centerOfMassWorld),
      stiffnessNPerM,
      dampingNsPerM,
      effectiveMassKg,
      linearHertz,
      linearDampingRatio,
    },
  };
}
