import type { BearingEndpoint, GridFace, BearingAuthoredFixture } from "./anvil-02-bearing.js";
import { compileBearing, createBearingFixture } from "./anvil-02-bearing.js";
import {
  compileTorque,
  type TorqueCompilation,
} from "./anvil-05-torque.js";

export interface TorquePatch {
  readonly id: string;
  readonly target: BearingEndpoint;
  readonly effortNm: number;
}

export interface TorquePatchAuthoredFixture {
  readonly bearing: BearingAuthoredFixture;
  readonly patch: TorquePatch;
}

export interface TorquePatchCompilation {
  readonly schema: "anvil-06-torque-patch/0";
  readonly sourcePatchId: string;
  readonly sourceTarget: BearingEndpoint;
  readonly resolvedBearingId: string;
  readonly torque: TorqueCompilation;
}

const VALID_FACES = new Set<GridFace>(["x-", "x+", "y-", "y+", "z-", "z+"]);

function sameEndpoint(a: BearingEndpoint, b: BearingEndpoint): boolean {
  return a.cellId === b.cellId && a.face === b.face;
}

function validatePatchId(id: string): string {
  const trimmed = id.trim();
  if (trimmed.length === 0) throw new Error("ANVIL-06 patch id must be non-empty");
  return trimmed;
}

function validatePatchTarget(authored: TorquePatchAuthoredFixture): void {
  const target = authored.patch.target;
  const cellExists = authored.bearing.matter.cells.some((cell) => cell.id === target.cellId);
  if (!cellExists) throw new Error(`ANVIL-06 patch references unknown source cell ${target.cellId}`);
  if (!VALID_FACES.has(target.face)) throw new Error(`ANVIL-06 patch face ${String(target.face)} is invalid`);
}

export function createTorquePatchFixture(
  effortNm = 100,
  target?: BearingEndpoint,
): TorquePatchAuthoredFixture {
  const bearing = createBearingFixture();
  return {
    bearing,
    patch: {
      id: "torque-patch:seam-0",
      target: target === undefined ? { ...bearing.bearing.endpointA } : { ...target },
      effortNm,
    },
  };
}

export function compileTorquePatch(authored: TorquePatchAuthoredFixture): TorquePatchCompilation {
  const sourcePatchId = validatePatchId(authored.patch.id);
  if (!Number.isFinite(authored.patch.effortNm)) throw new Error("ANVIL-06 effortNm must be finite");
  validatePatchTarget(authored);

  const bearing = compileBearing(authored.bearing);
  const matchesA = sameEndpoint(authored.patch.target, bearing.relation.endpointA);
  const matchesB = sameEndpoint(authored.patch.target, bearing.relation.endpointB);
  if (Number(matchesA) + Number(matchesB) !== 1) {
    throw new Error(
      `ANVIL-06 patch target ${authored.patch.target.cellId}@${authored.patch.target.face} is not a unique bearing endpoint`,
    );
  }

  // The authored source never names the bearing. Once locality has resolved the
  // persistent interface identity, reuse the already-supported ANVIL-05
  // lowering as a compiled-stage adapter rather than inventing new actuator
  // physics for this semantic experiment.
  const torque = compileTorque({
    bearing: authored.bearing,
    torque: {
      id: sourcePatchId,
      bearingId: bearing.relation.sourceBearingId,
      effortNm: authored.patch.effortNm,
    },
  });

  if (torque.bearing.relation.sourceBearingId !== bearing.relation.sourceBearingId) {
    throw new Error("ANVIL-06 derived bearing identity changed during torque lowering");
  }

  return {
    schema: "anvil-06-torque-patch/0",
    sourcePatchId,
    sourceTarget: { ...authored.patch.target },
    resolvedBearingId: bearing.relation.sourceBearingId,
    torque,
  };
}
