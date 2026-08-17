export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface GridPosition {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface MaterialDefinition {
  readonly id: string;
  readonly densityKgM3: number;
  readonly friction: number;
  readonly displayColor: string;
}

export interface MatterCell {
  readonly id: string;
  readonly grid: GridPosition;
  readonly materialId: string;
}

/**
 * Persistent authored truth for ANVIL-00.
 *
 * Deliberately absent: Box3D handles, body IDs, collider IDs, runtime transforms.
 * The grid is only the first experimental authoring dialect, not a commitment
 * that Machine Matter must remain voxel-based.
 */
export interface MatterDocument {
  readonly schema: "anvil-matter/0";
  readonly revision: string;
  readonly cellSizeM: number;
  readonly materials: readonly MaterialDefinition[];
  readonly cells: readonly MatterCell[];
}

export interface ColliderBoxPlan {
  readonly id: string;
  readonly materialId: string;
  readonly sourceCellIds: readonly string[];
  readonly minGrid: GridPosition;
  readonly sizeCells: GridPosition;
  readonly centerWorld: Vec3;
  readonly halfExtentsM: Vec3;
}

export interface RigidBodyPlan {
  readonly id: string;
  readonly sourceCellIds: readonly string[];
  readonly massKg: number;
  readonly centerOfMassWorld: Vec3;
  readonly colliders: readonly ColliderBoxPlan[];
}

/** Disposable compiled representation. Never persist its IDs as authored truth. */
export interface PhysicalPlan {
  readonly schema: "anvil-physical-plan/0";
  readonly sourceRevision: string;
  readonly bodies: readonly RigidBodyPlan[];
  readonly cellToBody: Readonly<Record<string, string>>;
  readonly statistics: {
    readonly authoredCells: number;
    readonly rigidBodies: number;
    readonly collisionBoxes: number;
    readonly reductionRatio: number;
  };
}
