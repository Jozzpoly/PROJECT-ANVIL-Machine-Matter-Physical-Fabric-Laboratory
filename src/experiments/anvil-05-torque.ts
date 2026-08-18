import Box3DFactory from "box3d.js/inline";
import type { Box3DModule, b3BodyId, b3JointId, b3WorldId } from "box3d.js";
import type { MaterialDefinition, RigidBodyPlan, Vec3 } from "../model.js";
import {
  addVec3,
  magnitudeVec3,
  subtractVec3,
} from "../foundation/spatial.js";
import {
  compileBearing,
  createBearingFixture,
  jointFrameForAxis,
  type BearingAuthoredFixture,
  type BearingCompilation,
  type BearingRuntimeSnapshot,
} from "./anvil-02-bearing.js";

export interface TorqueMark {
  readonly id: string;
  readonly bearingId: string;
  readonly effortNm: number;
}

export interface TorqueAuthoredFixture {
  readonly bearing: BearingAuthoredFixture;
  readonly torque: TorqueMark;
}

export interface TorqueActionPlan {
  readonly schema: "anvil-05-torque-action/0";
  readonly sourceTorqueId: string;
  readonly sourceBearingId: string;
  readonly effortNm: number;
  readonly bodyAId: string;
  readonly bodyBId: string;
  readonly axisWorld: Vec3;
  readonly torqueAWorld: Vec3;
  readonly torqueBWorld: Vec3;
}

export interface TorqueCompilation {
  readonly bearing: BearingCompilation;
  readonly action: TorqueActionPlan;
}

export interface TorqueRuntimeReceipt {
  readonly engineVersion: string;
  readonly relationCreated: boolean;
  readonly bodyMassErrorsKg: Readonly<Record<string, number>>;
  readonly bodyLocalCenterErrorsM: Readonly<Record<string, number>>;
}

const ZERO: Vec3 = Object.freeze({ x: 0, y: 0, z: 0 });
const FIXED_DT = 1 / 60;
const SUBSTEPS = 4;

function scale(value: Vec3, scalar: number): Vec3 {
  return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar };
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function validateId(value: string, label: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) throw new Error(`ANVIL-05 ${label} must be non-empty`);
  return trimmed;
}

function bodyFor(compilation: BearingCompilation, id: string): RigidBodyPlan {
  const body = compilation.physicalPlan.bodies.find((candidate) => candidate.id === id);
  if (body === undefined) throw new Error(`ANVIL-05 missing compiled body ${id}`);
  return body;
}

function boxHullPoints(body: RigidBodyPlan, colliderIndex: number): number[] {
  const collider = body.colliders[colliderIndex];
  if (collider === undefined) throw new Error(`ANVIL-05 missing collider ${colliderIndex}`);
  const center = subtractVec3(collider.centerWorld, body.centerOfMassWorld);
  const h = collider.halfExtentsM;
  const points: number[] = [];
  for (const dx of [-1, 1]) {
    for (const dy of [-1, 1]) {
      for (const dz of [-1, 1]) points.push(center.x + dx * h.x, center.y + dy * h.y, center.z + dz * h.z);
    }
  }
  return points;
}

function toBox3DQuat(rotation: { x: number; y: number; z: number; w: number }): { v: Vec3; s: number } {
  return { v: { x: rotation.x, y: rotation.y, z: rotation.z }, s: rotation.w };
}

export function createTorqueFixture(effortNm = 100): TorqueAuthoredFixture {
  const bearing = createBearingFixture();
  return {
    bearing,
    torque: {
      id: "torque:bearing-0",
      bearingId: bearing.bearing.id,
      effortNm,
    },
  };
}

export function compileTorque(authored: TorqueAuthoredFixture): TorqueCompilation {
  const sourceTorqueId = validateId(authored.torque.id, "torque id");
  const sourceBearingId = validateId(authored.torque.bearingId, "torque bearingId");
  if (!Number.isFinite(authored.torque.effortNm)) throw new Error("ANVIL-05 effortNm must be finite");

  const bearing = compileBearing(authored.bearing);
  if (sourceBearingId !== bearing.relation.sourceBearingId) {
    throw new Error(`ANVIL-05 torque references unknown bearing ${sourceBearingId}`);
  }

  const torqueBWorld = scale(bearing.relation.axisWorld, authored.torque.effortNm);
  const torqueAWorld = scale(torqueBWorld, -1);
  const net = addVec3(torqueAWorld, torqueBWorld);
  if (magnitudeVec3(net) > 1e-12) throw new Error("ANVIL-05 torque pair is not equal and opposite");

  return {
    bearing,
    action: {
      schema: "anvil-05-torque-action/0",
      sourceTorqueId,
      sourceBearingId,
      effortNm: authored.torque.effortNm,
      bodyAId: bearing.relation.bodyAId,
      bodyBId: bearing.relation.bodyBId,
      axisWorld: { ...bearing.relation.axisWorld },
      torqueAWorld,
      torqueBWorld,
    },
  };
}

export class TorquePhysics {
  readonly #b3: Box3DModule;
  readonly #worldId: b3WorldId;
  readonly #bodyIds: Map<string, b3BodyId>;
  readonly #compilation: TorqueCompilation;
  readonly #jointId: b3JointId;
  readonly #receipt: TorqueRuntimeReceipt;
  #disposed = false;

  private constructor(
    b3: Box3DModule,
    worldId: b3WorldId,
    bodyIds: Map<string, b3BodyId>,
    compilation: TorqueCompilation,
    jointId: b3JointId,
    receipt: TorqueRuntimeReceipt,
  ) {
    this.#b3 = b3;
    this.#worldId = worldId;
    this.#bodyIds = bodyIds;
    this.#compilation = compilation;
    this.#jointId = jointId;
    this.#receipt = receipt;
  }

  static async create(compilation: TorqueCompilation, materials: readonly MaterialDefinition[]): Promise<TorquePhysics> {
    const b3 = await Box3DFactory();
    const version = b3.b3GetVersion();
    if (version.major !== 0 || version.minor !== 1 || version.revision !== 0) {
      throw new Error(`ANVIL-05 expects Box3D 0.1.0, got ${version.major}.${version.minor}.${version.revision}`);
    }

    const materialById = new Map(materials.map((material) => [material.id, material] as const));
    const worldDef = b3.b3DefaultWorldDef();
    worldDef.gravity = { ...ZERO };
    worldDef.workerCount = 0;
    const worldId = b3.b3CreateWorld(worldDef);
    const bodyIds = new Map<string, b3BodyId>();
    const massErrors: Record<string, number> = {};
    const centerErrors: Record<string, number> = {};

    try {
      for (const body of compilation.bearing.physicalPlan.bodies) {
        const bodyDef = b3.b3DefaultBodyDef();
        bodyDef.type = b3.b3BodyType.b3_dynamicBody;
        bodyDef.position = { ...body.centerOfMassWorld };
        bodyDef.enableSleep = false;
        bodyDef.isAwake = true;
        const bodyId = b3.b3CreateBody(worldId, bodyDef);
        bodyIds.set(body.id, bodyId);

        for (let index = 0; index < body.colliders.length; index += 1) {
          const collider = body.colliders[index];
          if (collider === undefined) continue;
          const material = materialById.get(collider.materialId);
          if (material === undefined) throw new Error(`ANVIL-05 missing material ${collider.materialId}`);
          const hull = b3.b3CreateHull(boxHullPoints(body, index));
          if (hull === null || hull === undefined) throw new Error(`Box3D rejected ANVIL-05 collider ${collider.id}`);
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

        const mass = b3.b3Body_GetMassData(bodyId);
        massErrors[body.id] = mass.mass - body.massKg;
        centerErrors[body.id] = Math.hypot(mass.center.x, mass.center.y, mass.center.z);
      }

      const bodyA = bodyIds.get(compilation.bearing.relation.bodyAId);
      const bodyB = bodyIds.get(compilation.bearing.relation.bodyBId);
      if (bodyA === undefined || bodyB === undefined) throw new Error("ANVIL-05 bearing relation references missing runtime body");
      const def = b3.b3DefaultRevoluteJointDef();
      def.base.bodyIdA = bodyA;
      def.base.bodyIdB = bodyB;
      def.base.localFrameA = {
        p: { ...compilation.bearing.relation.localAnchorA },
        q: toBox3DQuat(jointFrameForAxis(compilation.bearing.relation.localAxisA)),
      };
      def.base.localFrameB = {
        p: { ...compilation.bearing.relation.localAnchorB },
        q: toBox3DQuat(jointFrameForAxis(compilation.bearing.relation.localAxisB)),
      };
      def.base.collideConnected = false;
      const jointId = b3.b3CreateRevoluteJoint(worldId, def);

      return new TorquePhysics(b3, worldId, bodyIds, compilation, jointId, {
        engineVersion: `${version.major}.${version.minor}.${version.revision}`,
        relationCreated: true,
        bodyMassErrorsKg: massErrors,
        bodyLocalCenterErrorsM: centerErrors,
      });
    } catch (error: unknown) {
      if (b3.b3World_IsValid(worldId)) b3.b3DestroyWorld(worldId);
      throw error;
    }
  }

  get receipt(): TorqueRuntimeReceipt {
    this.#assertActive();
    return this.#receipt;
  }

  step(stepCount = 1): void {
    this.#assertActive();
    if (!Number.isInteger(stepCount) || stepCount < 0) throw new Error("ANVIL-05 stepCount must be a non-negative integer");
    const bodyA = this.#bodyIds.get(this.#compilation.action.bodyAId);
    const bodyB = this.#bodyIds.get(this.#compilation.action.bodyBId);
    if (bodyA === undefined || bodyB === undefined) throw new Error("ANVIL-05 torque action lost runtime body");
    for (let index = 0; index < stepCount; index += 1) {
      this.#b3.b3Body_ApplyTorque(bodyA, { ...this.#compilation.action.torqueAWorld }, true);
      this.#b3.b3Body_ApplyTorque(bodyB, { ...this.#compilation.action.torqueBWorld }, true);
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

  bearingAngleRad(): number {
    this.#assertActive();
    return this.#b3.b3RevoluteJoint_GetAngle(this.#jointId);
  }

  bearingGapM(): number {
    this.#assertActive();
    const relation = this.#compilation.bearing.relation;
    const snapshots = new Map(this.snapshots().map((snapshot) => [snapshot.planBodyId, snapshot] as const));
    const a = snapshots.get(relation.bodyAId);
    const b = snapshots.get(relation.bodyBId);
    if (a === undefined || b === undefined) throw new Error("ANVIL-05 bearing gap missing runtime snapshot");

    const rotate = (rotation: { x: number; y: number; z: number; w: number }, value: Vec3): Vec3 => {
      const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
      const cross = (left: Vec3, right: Vec3): Vec3 => ({
        x: left.y * right.z - left.z * right.y,
        y: left.z * right.x - left.x * right.z,
        z: left.x * right.y - left.y * right.x,
      });
      const t = cross(qv, value);
      const doubled = scale(t, 2);
      return addVec3(value, addVec3(scale(doubled, rotation.w), cross(qv, doubled)));
    };

    const worldA = addVec3(a.position, rotate(a.rotation, relation.localAnchorA));
    const worldB = addVec3(b.position, rotate(b.rotation, relation.localAnchorB));
    return magnitudeVec3(subtractVec3(worldA, worldB));
  }

  relativeAngularSpeedRadps(): number {
    this.#assertActive();
    const relation = this.#compilation.bearing.relation;
    const snapshots = new Map(this.snapshots().map((snapshot) => [snapshot.planBodyId, snapshot] as const));
    const a = snapshots.get(relation.bodyAId);
    const b = snapshots.get(relation.bodyBId);
    if (a === undefined || b === undefined) throw new Error("ANVIL-05 relative angular speed missing runtime snapshot");
    return dot(subtractVec3(b.angularVelocity, a.angularVelocity), relation.axisWorld);
  }

  dispose(): void {
    if (this.#disposed) return;
    if (this.#b3.b3World_IsValid(this.#worldId)) this.#b3.b3DestroyWorld(this.#worldId);
    this.#disposed = true;
  }

  #assertActive(): void {
    if (this.#disposed) throw new Error("ANVIL-05 runtime has been disposed");
  }
}
