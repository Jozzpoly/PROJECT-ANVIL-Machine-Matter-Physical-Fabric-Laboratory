import Box3DFactory from "box3d.js/inline";
import type { Box3DModule, b3BodyId, b3JointId, b3WorldId } from "box3d.js";
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
import type { Quat } from "../foundation/spatial.js";
import {
  jointFrameForAxis,
  type BearingAxis,
  type BearingEndpoint,
  type BearingMark,
  type BearingRuntimeSnapshot,
} from "./anvil-02-bearing.js";

export interface MultiBearingAuthoredFixture {
  readonly matter: MatterDocument;
  readonly bearings: readonly BearingMark[];
}

export interface MultiBearingRelationPlan {
  readonly schema: "o1x-multi-bearing-relation/0";
  readonly sourceBearingId: string;
  readonly endpointA: BearingEndpoint;
  readonly endpointB: BearingEndpoint;
  readonly bodyAId: string;
  readonly bodyBId: string;
  readonly pivotWorld: Vec3;
  readonly axisWorld: Vec3;
  readonly localAnchorA: Vec3;
  readonly localAnchorB: Vec3;
  readonly localAxisA: Vec3;
  readonly localAxisB: Vec3;
}

export interface MultiBearingCompilation {
  readonly schema: "o1x-multi-bearing-compilation/0";
  readonly physicalPlan: PhysicalPlan;
  readonly relations: readonly MultiBearingRelationPlan[];
}

export interface MultiBearingPhysicsOptions {
  readonly gravity?: Vec3;
  readonly createRelations?: boolean;
  readonly initialLinearVelocityByPlanBodyId?: Readonly<Record<string, Vec3>>;
  readonly initialAngularVelocityByPlanBodyId?: Readonly<Record<string, Vec3>>;
}

export interface MultiBearingRuntimeReceipt {
  readonly engineVersion: string;
  readonly relationCount: number;
}

const FACE_VECTORS: Readonly<Record<BearingEndpoint["face"], GridPosition>> = Object.freeze({
  "x-": { x: -1, y: 0, z: 0 },
  "x+": { x: 1, y: 0, z: 0 },
  "y-": { x: 0, y: -1, z: 0 },
  "y+": { x: 0, y: 1, z: 0 },
  "z-": { x: 0, y: 0, z: -1 },
  "z+": { x: 0, y: 0, z: 1 },
});

const AXIS_VECTORS: Readonly<Record<BearingAxis, Vec3>> = Object.freeze({
  x: { x: 1, y: 0, z: 0 },
  y: { x: 0, y: 1, z: 0 },
  z: { x: 0, y: 0, z: 1 },
});

const ZERO: Vec3 = Object.freeze({ x: 0, y: 0, z: 0 });
const FIXED_DT = 1 / 60;
const SUBSTEPS = 4;

function endpointKey(endpoint: BearingEndpoint): string {
  return `${endpoint.cellId}@${endpoint.face}`;
}

function canonicalEndpoints(
  a: BearingEndpoint,
  b: BearingEndpoint,
): readonly [BearingEndpoint, BearingEndpoint] {
  return endpointKey(a).localeCompare(endpointKey(b)) <= 0 ? [a, b] : [b, a];
}

function seamKey(a: BearingEndpoint, b: BearingEndpoint): string {
  const [left, right] = canonicalEndpoints(a, b);
  return `${endpointKey(left)}\u0000${endpointKey(right)}`;
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

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function magnitude(value: Vec3): number {
  return Math.hypot(value.x, value.y, value.z);
}

function rotateVec3ByQuat(rotation: Quat, value: Vec3): Vec3 {
  const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
  const t = cross(qv, value);
  const doubled = scale(t, 2);
  return add(value, add(scale(doubled, rotation.w), cross(qv, doubled)));
}

function cellCenter(cell: MatterCell, cellSizeM: number): Vec3 {
  return {
    x: (cell.grid.x + 0.5) * cellSizeM,
    y: (cell.grid.y + 0.5) * cellSizeM,
    z: (cell.grid.z + 0.5) * cellSizeM,
  };
}

function finiteVec3(value: Vec3, label: string): void {
  if (![value.x, value.y, value.z].every(Number.isFinite)) {
    throw new Error(`${label} must be finite`);
  }
}

function bodyFor(plan: PhysicalPlan, bodyId: string): RigidBodyPlan {
  const body = plan.bodies.find((candidate) => candidate.id === bodyId);
  if (body === undefined) throw new Error(`multi-bearing composition missing body ${bodyId}`);
  return body;
}

function validateAndCanonicalizeBearing(
  matter: MatterDocument,
  bearing: BearingMark,
): {
  readonly bearing: BearingMark;
  readonly endpointA: BearingEndpoint;
  readonly endpointB: BearingEndpoint;
  readonly cellA: MatterCell;
  readonly cellB: MatterCell;
} {
  const id = bearing.id.trim();
  if (id.length === 0) throw new Error("multi-bearing source id must be non-empty");
  const [endpointA, endpointB] = canonicalEndpoints(bearing.endpointA, bearing.endpointB);
  if (endpointA.cellId === endpointB.cellId) {
    throw new Error(`multi-bearing ${id} endpoints must reference two cells`);
  }

  const byId = new Map(matter.cells.map((cell) => [cell.id, cell] as const));
  const cellA = byId.get(endpointA.cellId);
  const cellB = byId.get(endpointB.cellId);
  if (cellA === undefined || cellB === undefined) {
    throw new Error(`multi-bearing ${id} references unknown endpoint cell`);
  }

  const faceA = FACE_VECTORS[endpointA.face];
  const faceB = FACE_VECTORS[endpointB.face];
  if (faceA.x !== -faceB.x || faceA.y !== -faceB.y || faceA.z !== -faceB.z) {
    throw new Error(`multi-bearing ${id} endpoint faces must be opposite`);
  }
  const aToB = {
    x: cellB.grid.x - cellA.grid.x,
    y: cellB.grid.y - cellA.grid.y,
    z: cellB.grid.z - cellA.grid.z,
  };
  if (aToB.x !== faceA.x || aToB.y !== faceA.y || aToB.z !== faceA.z) {
    throw new Error(`multi-bearing ${id} endpoints are not face-adjacent through their declared faces`);
  }

  const axis = AXIS_VECTORS[bearing.freeAxis];
  if (Math.abs(dot(axis, faceA)) > 0) {
    throw new Error(`multi-bearing ${id} free axis ${bearing.freeAxis} is normal to its shared face`);
  }

  return {
    bearing: { ...bearing, id },
    endpointA: { ...endpointA },
    endpointB: { ...endpointB },
    cellA,
    cellB,
  };
}

export function compileMultiBearing(authored: MultiBearingAuthoredFixture): MultiBearingCompilation {
  if (authored.bearings.length === 0) {
    throw new Error("multi-bearing composition requires at least one Bearing mark");
  }

  const sourceIds = new Set<string>();
  const seams = new Set<string>();
  const prepared = authored.bearings.map((bearing) => {
    const validated = validateAndCanonicalizeBearing(authored.matter, bearing);
    if (!sourceIds.add(validated.bearing.id)) {
      throw new Error(`duplicate multi-bearing source id: ${validated.bearing.id}`);
    }
    const key = seamKey(validated.endpointA, validated.endpointB);
    if (!seams.add(key)) {
      throw new Error(`duplicate multi-bearing seam: ${key}`);
    }
    return validated;
  }).sort((left, right) => left.bearing.id.localeCompare(right.bearing.id));

  const blockedFaceConnections: BlockedFaceConnection[] = prepared.map(({ cellA, cellB }) => [cellA.id, cellB.id]);
  const physicalPlan = compileMatter(authored.matter, { blockedFaceConnections });

  const relations = prepared.map(({ bearing, endpointA, endpointB, cellA }) => {
    const bodyAId = physicalPlan.cellToBody[endpointA.cellId];
    const bodyBId = physicalPlan.cellToBody[endpointB.cellId];
    if (bodyAId === undefined || bodyBId === undefined) {
      throw new Error(`multi-bearing ${bearing.id} compiled provenance is missing an endpoint body`);
    }
    if (bodyAId === bodyBId) {
      throw new Error(`multi-bearing ${bearing.id} seam still has an alternate rigid bypass in the composed topology`);
    }

    const bodyA = bodyFor(physicalPlan, bodyAId);
    const bodyB = bodyFor(physicalPlan, bodyBId);
    const faceA = FACE_VECTORS[endpointA.face];
    const axisWorld = AXIS_VECTORS[bearing.freeAxis];
    const pivotWorld = add(
      cellCenter(cellA, authored.matter.cellSizeM),
      scale(faceA, authored.matter.cellSizeM / 2),
    );

    return {
      schema: "o1x-multi-bearing-relation/0" as const,
      sourceBearingId: bearing.id,
      endpointA,
      endpointB,
      bodyAId,
      bodyBId,
      pivotWorld,
      axisWorld: { ...axisWorld },
      localAnchorA: subtract(pivotWorld, bodyA.centerOfMassWorld),
      localAnchorB: subtract(pivotWorld, bodyB.centerOfMassWorld),
      localAxisA: { ...axisWorld },
      localAxisB: { ...axisWorld },
    };
  });

  return {
    schema: "o1x-multi-bearing-compilation/0",
    physicalPlan,
    relations,
  };
}

function boxHullPoints(body: RigidBodyPlan, colliderIndex: number): number[] {
  const collider = body.colliders[colliderIndex];
  if (collider === undefined) throw new Error(`missing multi-bearing collider ${colliderIndex}`);
  const center = subtract(collider.centerWorld, body.centerOfMassWorld);
  const h = collider.halfExtentsM;
  const points: number[] = [];
  for (const dx of [-1, 1]) {
    for (const dy of [-1, 1]) {
      for (const dz of [-1, 1]) {
        points.push(center.x + dx * h.x, center.y + dy * h.y, center.z + dz * h.z);
      }
    }
  }
  return points;
}

function toBox3DQuat(rotation: Quat): { v: Vec3; s: number } {
  return { v: { x: rotation.x, y: rotation.y, z: rotation.z }, s: rotation.w };
}

function worldPoint(snapshot: BearingRuntimeSnapshot, localPoint: Vec3): Vec3 {
  return add(snapshot.position, rotateVec3ByQuat(snapshot.rotation, localPoint));
}

export class MultiBearingPhysics {
  readonly #b3: Box3DModule;
  readonly #worldId: b3WorldId;
  readonly #bodyIds: Map<string, b3BodyId>;
  readonly #relations: readonly MultiBearingRelationPlan[];
  readonly #jointIds: readonly b3JointId[];
  readonly #receipt: MultiBearingRuntimeReceipt;
  #disposed = false;

  private constructor(
    b3: Box3DModule,
    worldId: b3WorldId,
    bodyIds: Map<string, b3BodyId>,
    relations: readonly MultiBearingRelationPlan[],
    jointIds: readonly b3JointId[],
    receipt: MultiBearingRuntimeReceipt,
  ) {
    this.#b3 = b3;
    this.#worldId = worldId;
    this.#bodyIds = bodyIds;
    this.#relations = relations;
    this.#jointIds = jointIds;
    this.#receipt = receipt;
  }

  static async create(
    compilation: MultiBearingCompilation,
    materials: readonly MaterialDefinition[],
    options: MultiBearingPhysicsOptions = {},
  ): Promise<MultiBearingPhysics> {
    const b3 = await Box3DFactory();
    const version = b3.b3GetVersion();
    if (version.major !== 0 || version.minor !== 1 || version.revision !== 0) {
      throw new Error(`O1-X multi-bearing expects Box3D 0.1.0, got ${version.major}.${version.minor}.${version.revision}`);
    }

    const materialById = new Map(materials.map((material) => [material.id, material] as const));
    const knownBodyIds = new Set(compilation.physicalPlan.bodies.map((body) => body.id));
    const linearById = options.initialLinearVelocityByPlanBodyId ?? {};
    const angularById = options.initialAngularVelocityByPlanBodyId ?? {};
    for (const bodyId of [...Object.keys(linearById), ...Object.keys(angularById)]) {
      if (!knownBodyIds.has(bodyId)) throw new Error(`multi-bearing runtime motion references unknown body ${bodyId}`);
    }

    const gravity = options.gravity ?? ZERO;
    finiteVec3(gravity, "multi-bearing runtime gravity");
    const worldDef = b3.b3DefaultWorldDef();
    worldDef.gravity = { ...gravity };
    worldDef.workerCount = 0;
    const worldId = b3.b3CreateWorld(worldDef);
    const bodyIds = new Map<string, b3BodyId>();
    const jointIds: b3JointId[] = [];

    try {
      for (const body of compilation.physicalPlan.bodies) {
        const bodyDef = b3.b3DefaultBodyDef();
        bodyDef.type = b3.b3BodyType.b3_dynamicBody;
        bodyDef.position = { ...body.centerOfMassWorld };
        bodyDef.enableSleep = false;
        bodyDef.isAwake = true;
        const linear = linearById[body.id];
        const angular = angularById[body.id];
        if (linear !== undefined) {
          finiteVec3(linear, `multi-bearing initial linear velocity ${body.id}`);
          bodyDef.linearVelocity = { ...linear };
        }
        if (angular !== undefined) {
          finiteVec3(angular, `multi-bearing initial angular velocity ${body.id}`);
          bodyDef.angularVelocity = { ...angular };
        }
        const bodyId = b3.b3CreateBody(worldId, bodyDef);
        bodyIds.set(body.id, bodyId);

        for (let index = 0; index < body.colliders.length; index += 1) {
          const collider = body.colliders[index];
          if (collider === undefined) continue;
          const material = materialById.get(collider.materialId);
          if (material === undefined) throw new Error(`missing multi-bearing material ${collider.materialId}`);
          const hull = b3.b3CreateHull(boxHullPoints(body, index));
          if (hull === null || hull === undefined) throw new Error(`Box3D rejected multi-bearing collider ${collider.id}`);
          const shapeDef = b3.b3DefaultShapeDef();
          shapeDef.density = material.densityKgM3;
          shapeDef.baseMaterial.friction = material.friction;
          shapeDef.filter.maskBits = 0n;
          try {
            b3.b3CreateHullShape(bodyId, shapeDef, hull);
          } finally {
            (hull as unknown as { delete?: () => void }).delete?.();
          }
        }
      }

      if (options.createRelations ?? true) {
        for (const relation of compilation.relations) {
          const bodyA = bodyIds.get(relation.bodyAId);
          const bodyB = bodyIds.get(relation.bodyBId);
          if (bodyA === undefined || bodyB === undefined) {
            throw new Error(`multi-bearing relation ${relation.sourceBearingId} references a missing runtime body`);
          }
          const def = b3.b3DefaultRevoluteJointDef();
          def.base.bodyIdA = bodyA;
          def.base.bodyIdB = bodyB;
          def.base.localFrameA = {
            p: { ...relation.localAnchorA },
            q: toBox3DQuat(jointFrameForAxis(relation.localAxisA)),
          };
          def.base.localFrameB = {
            p: { ...relation.localAnchorB },
            q: toBox3DQuat(jointFrameForAxis(relation.localAxisB)),
          };
          def.base.collideConnected = false;
          jointIds.push(b3.b3CreateRevoluteJoint(worldId, def));
        }
      }

      return new MultiBearingPhysics(
        b3,
        worldId,
        bodyIds,
        compilation.relations,
        jointIds,
        {
          engineVersion: `${version.major}.${version.minor}.${version.revision}`,
          relationCount: jointIds.length,
        },
      );
    } catch (error: unknown) {
      if (b3.b3World_IsValid(worldId)) b3.b3DestroyWorld(worldId);
      throw error;
    }
  }

  get receipt(): MultiBearingRuntimeReceipt {
    this.#assertActive();
    return this.#receipt;
  }

  step(stepCount = 1): void {
    this.#assertActive();
    if (!Number.isInteger(stepCount) || stepCount < 0) {
      throw new Error("multi-bearing stepCount must be a non-negative integer");
    }
    for (let index = 0; index < stepCount; index += 1) {
      this.#b3.b3World_Step(this.#worldId, FIXED_DT, SUBSTEPS);
    }
  }

  snapshots(): readonly BearingRuntimeSnapshot[] {
    this.#assertActive();
    return [...this.#bodyIds.entries()].map(([planBodyId, bodyId]) => {
      const position = this.#b3.b3Body_GetPosition(bodyId);
      const rotation = this.#b3.b3Body_GetRotation(bodyId);
      const linear = this.#b3.b3Body_GetLinearVelocity(bodyId);
      const angular = this.#b3.b3Body_GetAngularVelocity(bodyId);
      const mass = this.#b3.b3Body_GetMassData(bodyId);
      return {
        planBodyId,
        position: { x: position.x, y: position.y, z: position.z },
        rotation: { x: rotation.v.x, y: rotation.v.y, z: rotation.v.z, w: rotation.s },
        linearVelocity: { x: linear.x, y: linear.y, z: linear.z },
        angularVelocity: { x: angular.x, y: angular.y, z: angular.z },
        massKg: mass.mass,
        localCenter: { x: mass.center.x, y: mass.center.y, z: mass.center.z },
      };
    });
  }

  anchorErrorsM(): Readonly<Record<string, number>> {
    this.#assertActive();
    const snapshots = new Map(this.snapshots().map((snapshot) => [snapshot.planBodyId, snapshot] as const));
    const errors: Record<string, number> = {};
    for (const relation of this.#relations) {
      const a = snapshots.get(relation.bodyAId);
      const b = snapshots.get(relation.bodyBId);
      if (a === undefined || b === undefined) {
        throw new Error(`multi-bearing anchor measurement lost relation ${relation.sourceBearingId}`);
      }
      const worldA = worldPoint(a, relation.localAnchorA);
      const worldB = worldPoint(b, relation.localAnchorB);
      errors[relation.sourceBearingId] = magnitude(subtract(worldA, worldB));
    }
    return errors;
  }

  dispose(): void {
    if (this.#disposed) return;
    if (this.#b3.b3World_IsValid(this.#worldId)) this.#b3.b3DestroyWorld(this.#worldId);
    this.#disposed = true;
  }

  #assertActive(): void {
    if (this.#disposed) throw new Error("multi-bearing runtime has been disposed");
  }
}
