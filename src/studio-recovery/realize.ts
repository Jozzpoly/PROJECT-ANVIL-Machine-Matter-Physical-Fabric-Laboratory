import { compileMatter, type BlockedFaceConnection } from "../compiler.js";
import type { GridPosition, MatterCell, PhysicalPlan, RigidBodyPlan, Vec3 } from "../model.js";
import type { BearingAxis, BearingEndpoint, BearingMark } from "../experiments/anvil-02-bearing.js";
import type { FreedomSourceV0 } from "./source.js";

export type RealizationQuality = "COMPLETE" | "PARTIAL" | "MATTER_ONLY";

export interface FreedomDiagnostic {
  readonly subject: "BEARING" | "TORQUE";
  readonly sourceId: string;
  readonly code:
    | "INVALID_LOCALITY"
    | "DUPLICATE_ID"
    | "DUPLICATE_SEAM"
    | "RIGID_BYPASS"
    | "INVALID_EFFORT"
    | "UNRESOLVED_TARGET"
    | "AMBIGUOUS_TARGET";
  readonly message: string;
}

export interface FreedomBearingPlan {
  readonly sourceBearingId: string;
  readonly endpointA: BearingEndpoint;
  readonly endpointB: BearingEndpoint;
  readonly freeAxis: BearingAxis;
  readonly bodyAId: string;
  readonly bodyBId: string;
  readonly pivotWorld: Vec3;
  readonly axisWorld: Vec3;
  readonly localAnchorA: Vec3;
  readonly localAnchorB: Vec3;
}

export interface FreedomTorquePlan {
  readonly sourcePatchId: string;
  readonly sourceBearingId: string;
  readonly effortNm: number;
  readonly bodyAId: string;
  readonly bodyBId: string;
  readonly torqueAWorld: Vec3;
  readonly torqueBWorld: Vec3;
}

export interface FreedomRealizationPlan {
  readonly schema: "anvil-freedom-realization/0";
  readonly quality: RealizationQuality;
  readonly physicalPlan: PhysicalPlan;
  readonly bearings: readonly FreedomBearingPlan[];
  readonly torques: readonly FreedomTorquePlan[];
  readonly diagnostics: readonly FreedomDiagnostic[];
  readonly authoredCounts: {
    readonly matterCells: number;
    readonly bearings: number;
    readonly torquePatches: number;
  };
  readonly realizedCounts: {
    readonly bodies: number;
    readonly bearings: number;
    readonly torques: number;
  };
}

const FACE_VECTORS: Readonly<Record<BearingEndpoint["face"], GridPosition>> = Object.freeze({
  "x-": { x: -1, y: 0, z: 0 },
  "x+": { x: 1, y: 0, z: 0 },
  "y-": { x: 0, y: -1, z: 0 },
  "y+": { x: 0, y: 1, z: 0 },
  "z-": { x: 0, y: 0, z: -1 },
  "z+": { x: 0, y: 0, z: 1 },
});

const AXES: Readonly<Record<BearingAxis, Vec3>> = Object.freeze({
  x: { x: 1, y: 0, z: 0 },
  y: { x: 0, y: 1, z: 0 },
  z: { x: 0, y: 0, z: 1 },
});

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function subtract(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(value: Vec3, scalar: number): Vec3 {
  return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar };
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function sameEndpoint(a: BearingEndpoint, b: BearingEndpoint): boolean {
  return a.cellId === b.cellId && a.face === b.face;
}

function endpointKey(endpoint: BearingEndpoint): string {
  return `${endpoint.cellId}@${endpoint.face}`;
}

function seamKey(a: BearingEndpoint, b: BearingEndpoint): string {
  const left = endpointKey(a);
  const right = endpointKey(b);
  return left.localeCompare(right) <= 0 ? `${left}\u0000${right}` : `${right}\u0000${left}`;
}

function bodyFor(plan: PhysicalPlan, id: string): RigidBodyPlan {
  const body = plan.bodies.find((candidate) => candidate.id === id);
  if (body === undefined) throw new Error(`Freedom realization lost body ${id}`);
  return body;
}

function cellCenter(cell: MatterCell, cellSizeM: number): Vec3 {
  return {
    x: (cell.grid.x + 0.5) * cellSizeM,
    y: (cell.grid.y + 0.5) * cellSizeM,
    z: (cell.grid.z + 0.5) * cellSizeM,
  };
}

interface PreparedBearing {
  readonly source: BearingMark;
  readonly endpointA: BearingEndpoint;
  readonly endpointB: BearingEndpoint;
  readonly cellA: MatterCell;
  readonly cellB: MatterCell;
}

function prepareBearing(source: FreedomSourceV0, bearing: BearingMark): PreparedBearing | string {
  if (bearing.id.trim().length === 0) return "Bearing id is empty";
  if (bearing.endpointA.cellId === bearing.endpointB.cellId) return "Bearing endpoints reference the same cell";

  const byId = new Map(source.matter.cells.map((cell) => [cell.id, cell] as const));
  const cellA = byId.get(bearing.endpointA.cellId);
  const cellB = byId.get(bearing.endpointB.cellId);
  if (cellA === undefined || cellB === undefined) return "Bearing endpoint references missing Matter";

  const faceA = FACE_VECTORS[bearing.endpointA.face];
  const faceB = FACE_VECTORS[bearing.endpointB.face];
  if (faceA.x !== -faceB.x || faceA.y !== -faceB.y || faceA.z !== -faceB.z) {
    return "Bearing faces are not opposite";
  }

  const delta = {
    x: cellB.grid.x - cellA.grid.x,
    y: cellB.grid.y - cellA.grid.y,
    z: cellB.grid.z - cellA.grid.z,
  };
  if (delta.x !== faceA.x || delta.y !== faceA.y || delta.z !== faceA.z) {
    return "Bearing endpoints are not adjacent across their authored faces";
  }

  const axis = AXES[bearing.freeAxis];
  if (Math.abs(dot(axis, faceA)) > 0) return "Bearing free axis is normal to the shared face";

  return {
    source: bearing,
    endpointA: { ...bearing.endpointA },
    endpointB: { ...bearing.endpointB },
    cellA,
    cellB,
  };
}

function diagnostic(
  subject: FreedomDiagnostic["subject"],
  sourceId: string,
  code: FreedomDiagnostic["code"],
  message: string,
): FreedomDiagnostic {
  return { subject, sourceId, code, message };
}

function uniquePreparedBearings(
  source: FreedomSourceV0,
  diagnostics: FreedomDiagnostic[],
): PreparedBearing[] {
  const idCounts = new Map<string, number>();
  for (const bearing of source.bearings) idCounts.set(bearing.id, (idCounts.get(bearing.id) ?? 0) + 1);

  const valid: PreparedBearing[] = [];
  for (const bearing of [...source.bearings].sort((a, b) => a.id.localeCompare(b.id))) {
    if ((idCounts.get(bearing.id) ?? 0) > 1) {
      diagnostics.push(diagnostic("BEARING", bearing.id, "DUPLICATE_ID", "Duplicate Bearing id is ambiguous; this intent was omitted from runtime."));
      continue;
    }
    const result = prepareBearing(source, bearing);
    if (typeof result === "string") {
      diagnostics.push(diagnostic("BEARING", bearing.id, "INVALID_LOCALITY", `${result}; authored intent remains in source.`));
      continue;
    }
    valid.push(result);
  }

  const bySeam = new Map<string, PreparedBearing[]>();
  for (const bearing of valid) {
    const key = seamKey(bearing.endpointA, bearing.endpointB);
    const group = bySeam.get(key);
    if (group === undefined) bySeam.set(key, [bearing]);
    else group.push(bearing);
  }

  const prepared: PreparedBearing[] = [];
  for (const key of [...bySeam.keys()].sort()) {
    const group = bySeam.get(key) ?? [];
    if (group.length > 1) {
      for (const bearing of group.sort((a, b) => a.source.id.localeCompare(b.source.id))) {
        diagnostics.push(diagnostic("BEARING", bearing.source.id, "DUPLICATE_SEAM", "Multiple authored Bearings occupy this seam; none was chosen on the Owner's behalf."));
      }
      continue;
    }
    const bearing = group[0];
    if (bearing !== undefined) prepared.push(bearing);
  }
  prepared.sort((a, b) => a.source.id.localeCompare(b.source.id));
  return prepared;
}

export function realizeFreedomSource(source: FreedomSourceV0): FreedomRealizationPlan {
  const diagnostics: FreedomDiagnostic[] = [];
  const prepared = uniquePreparedBearings(source, diagnostics);
  const blocked = prepared.map((bearing): BlockedFaceConnection => [bearing.cellA.id, bearing.cellB.id]);
  const physicalPlan = compileMatter(source.matter, { blockedFaceConnections: blocked });
  const realizedBearings: FreedomBearingPlan[] = [];

  for (const bearing of prepared) {
    const bodyAId = physicalPlan.cellToBody[bearing.endpointA.cellId];
    const bodyBId = physicalPlan.cellToBody[bearing.endpointB.cellId];
    if (bodyAId === undefined || bodyBId === undefined) {
      diagnostics.push(diagnostic("BEARING", bearing.source.id, "INVALID_LOCALITY", "Compiled Matter lost Bearing provenance."));
      continue;
    }
    if (bodyAId === bodyBId) {
      diagnostics.push(diagnostic("BEARING", bearing.source.id, "RIGID_BYPASS", "This Bearing did not separate two rigid islands in the composed topology; it was omitted from runtime."));
      continue;
    }

    const face = FACE_VECTORS[bearing.endpointA.face];
    const pivotWorld = add(cellCenter(bearing.cellA, source.matter.cellSizeM), scale(face, source.matter.cellSizeM / 2));
    const bodyA = bodyFor(physicalPlan, bodyAId);
    const bodyB = bodyFor(physicalPlan, bodyBId);
    realizedBearings.push({
      sourceBearingId: bearing.source.id,
      endpointA: { ...bearing.endpointA },
      endpointB: { ...bearing.endpointB },
      freeAxis: bearing.source.freeAxis,
      bodyAId,
      bodyBId,
      pivotWorld,
      axisWorld: { ...AXES[bearing.source.freeAxis] },
      localAnchorA: subtract(pivotWorld, bodyA.centerOfMassWorld),
      localAnchorB: subtract(pivotWorld, bodyB.centerOfMassWorld),
    });
  }

  const realizedTorques: FreedomTorquePlan[] = [];
  for (const patch of [...source.torquePatches].sort((a, b) => a.id.localeCompare(b.id))) {
    if (!Number.isFinite(patch.effortNm)) {
      diagnostics.push(diagnostic("TORQUE", patch.id, "INVALID_EFFORT", "Non-finite TorquePatch effort was omitted from runtime."));
      continue;
    }
    const matches = realizedBearings.filter(
      (bearing) => sameEndpoint(patch.target, bearing.endpointA) || sameEndpoint(patch.target, bearing.endpointB),
    );
    if (matches.length === 0) {
      diagnostics.push(diagnostic("TORQUE", patch.id, "UNRESOLVED_TARGET", "TorquePatch has no realized Bearing at its local target; it was omitted from runtime."));
      continue;
    }
    if (matches.length > 1) {
      diagnostics.push(diagnostic("TORQUE", patch.id, "AMBIGUOUS_TARGET", "TorquePatch target resolves to multiple realized Bearings; it was omitted from runtime."));
      continue;
    }
    const bearing = matches[0];
    if (bearing === undefined) continue;
    const torqueBWorld = scale(bearing.axisWorld, patch.effortNm);
    realizedTorques.push({
      sourcePatchId: patch.id,
      sourceBearingId: bearing.sourceBearingId,
      effortNm: patch.effortNm,
      bodyAId: bearing.bodyAId,
      bodyBId: bearing.bodyBId,
      torqueAWorld: scale(torqueBWorld, -1),
      torqueBWorld,
    });
  }

  diagnostics.sort((a, b) => a.subject.localeCompare(b.subject) || a.sourceId.localeCompare(b.sourceId) || a.code.localeCompare(b.code));
  const anyMeaningRealized = realizedBearings.length > 0 || realizedTorques.length > 0;
  const quality: RealizationQuality = diagnostics.length === 0 ? "COMPLETE" : anyMeaningRealized ? "PARTIAL" : "MATTER_ONLY";

  return {
    schema: "anvil-freedom-realization/0",
    quality,
    physicalPlan,
    bearings: realizedBearings,
    torques: realizedTorques,
    diagnostics,
    authoredCounts: {
      matterCells: source.matter.cells.length,
      bearings: source.bearings.length,
      torquePatches: source.torquePatches.length,
    },
    realizedCounts: {
      bodies: physicalPlan.bodies.length,
      bearings: realizedBearings.length,
      torques: realizedTorques.length,
    },
  };
}
