import type { MaterialDefinition, Vec3 } from "../model.js";
import {
  ElasticSeamPhysics,
  type ElasticSeamCompilation,
  type ElasticSeamDiagnostics,
} from "./anvil-07-elastic-seam.js";
import type {
  ComplianceFace,
  ComplianceResolutionCompilation,
} from "./anvil-08-compliance-resolution.js";

export interface ComplianceResolutionMotionLocksReceipt {
  readonly linearX: boolean;
  readonly linearY: boolean;
  readonly linearZ: boolean;
  readonly angularX: boolean;
  readonly angularY: boolean;
  readonly angularZ: boolean;
}

export interface ComplianceResolutionJointTuningReceipt {
  readonly linearHertz: number;
  readonly linearDampingRatio: number;
  readonly angularHertz: number;
  readonly angularDampingRatio: number;
}

export interface ComplianceResolutionRuntimeReceipt {
  readonly backend: "anvil-07-elastic-seam-1d-adapter";
  readonly sourcePatchCount: number;
  readonly aggregateRuntimeRelationCount: 1;
  readonly engineVersion: string;
  readonly bodyCount: number;
  readonly jointCount: number;
  readonly bodyMassErrorsKg: Readonly<Record<string, number>>;
  readonly bodyLocalCenterErrorsM: Readonly<Record<string, number>>;
  readonly gravity: Vec3;
  readonly contactsDisabled: boolean;
  readonly bodyLinearDamping: Readonly<Record<string, number>>;
  readonly bodyAngularDamping: Readonly<Record<string, number>>;
  readonly bodySleepEnabled: Readonly<Record<string, boolean>>;
  readonly bodyMotionLocks: Readonly<Record<string, ComplianceResolutionMotionLocksReceipt>>;
  readonly jointTuning: ComplianceResolutionJointTuningReceipt;
}

function positiveFaceForNormal(normal: Vec3): ComplianceFace {
  if (normal.x === 1 && normal.y === 0 && normal.z === 0) return "x+";
  if (normal.x === 0 && normal.y === 1 && normal.z === 0) return "y+";
  if (normal.x === 0 && normal.y === 0 && normal.z === 1) return "z+";
  throw new Error(`ANVIL-08 runtime adapter requires a canonical positive axis normal, got ${normal.x},${normal.y},${normal.z}`);
}

function oppositeFace(face: ComplianceFace): ComplianceFace {
  switch (face) {
    case "x+": return "x-";
    case "x-": return "x+";
    case "y+": return "y-";
    case "y-": return "y+";
    case "z+": return "z-";
    case "z-": return "z+";
  }
}

/**
 * Disposable adapter into the already-accepted ANVIL-07 one-dimensional Box3D
 * lowering. ANVIL-08 authored/compiled truth remains in its own local schema;
 * this compatibility object is never exported as source meaning or foundation.
 */
function adaptToElasticSeamBackend(
  compilation: ComplianceResolutionCompilation,
): ElasticSeamCompilation {
  const firstPatch = compilation.patches[0];
  if (firstPatch === undefined) throw new Error("ANVIL-08 runtime adapter requires at least one compiled patch");
  const relation = compilation.relation;
  const faceA = positiveFaceForNormal(relation.normalWorld);
  const endpointA = { cellId: firstPatch.canonicalCellAId, face: faceA } as const;
  const endpointB = { cellId: firstPatch.canonicalCellBId, face: oppositeFace(faceA) } as const;
  const measurement = {
    endpointA,
    endpointB,
    bodyAId: relation.bodyAId,
    bodyBId: relation.bodyBId,
    normalWorld: { ...relation.normalWorld },
    restPointWorld: { ...relation.restPointWorld },
    localAnchorA: { ...relation.localAnchorA },
    localAnchorB: { ...relation.localAnchorB },
  };

  return {
    variant: "ELASTIC",
    physicalPlan: compilation.physicalPlan,
    measurement,
    relation: {
      schema: "anvil-07-elastic-seam-relation/0",
      sourceSeamId: `anvil-08-runtime:${relation.sourcePatchIds.join("|")}`,
      ...measurement,
      stiffnessNPerM: relation.stiffnessNPerM,
      dampingNsPerM: relation.dampingNsPerM,
      effectiveMassKg: relation.effectiveMassKg,
      linearHertz: relation.linearHertz,
      linearDampingRatio: relation.linearDampingRatio,
    },
  };
}

export class ComplianceResolutionPhysics {
  readonly #inner: ElasticSeamPhysics;
  readonly #receipt: ComplianceResolutionRuntimeReceipt;

  private constructor(inner: ElasticSeamPhysics, receipt: ComplianceResolutionRuntimeReceipt) {
    this.#inner = inner;
    this.#receipt = receipt;
  }

  static async create(
    compilation: ComplianceResolutionCompilation,
    materials: readonly MaterialDefinition[],
  ): Promise<ComplianceResolutionPhysics> {
    const inner = await ElasticSeamPhysics.create(adaptToElasticSeamBackend(compilation), materials);
    try {
      const engine = inner.receipt;
      if (engine.jointTuning === null) {
        throw new Error("ANVIL-08 runtime adapter expected one aggregate compliant relation");
      }
      return new ComplianceResolutionPhysics(inner, {
        backend: "anvil-07-elastic-seam-1d-adapter",
        sourcePatchCount: compilation.relation.sourcePatchCount,
        aggregateRuntimeRelationCount: 1,
        engineVersion: engine.engineVersion,
        bodyCount: engine.bodyCount,
        jointCount: engine.jointCount,
        bodyMassErrorsKg: { ...engine.bodyMassErrorsKg },
        bodyLocalCenterErrorsM: { ...engine.bodyLocalCenterErrorsM },
        gravity: { ...engine.gravity },
        contactsDisabled: engine.contactsDisabled,
        bodyLinearDamping: { ...engine.bodyLinearDamping },
        bodyAngularDamping: { ...engine.bodyAngularDamping },
        bodySleepEnabled: { ...engine.bodySleepEnabled },
        bodyMotionLocks: Object.fromEntries(
          Object.entries(engine.bodyMotionLocks).map(([bodyId, locks]) => [bodyId, { ...locks }]),
        ),
        jointTuning: { ...engine.jointTuning },
      });
    } catch (error: unknown) {
      inner.dispose();
      throw error;
    }
  }

  get receipt(): ComplianceResolutionRuntimeReceipt {
    return this.#receipt;
  }

  applyOutwardLoad(forceN: number): void {
    this.#inner.applyOutwardLoad(forceN);
  }

  step(stepCount = 1): void {
    this.#inner.step(stepCount);
  }

  diagnostics(): ElasticSeamDiagnostics {
    return this.#inner.diagnostics();
  }

  dispose(): void {
    this.#inner.dispose();
  }
}
