import Box3DFactory from "box3d.js/inline";
import type { Box3DModule, b3BodyId, b3JointId, b3WorldId } from "box3d.js";
import type { MaterialDefinition, RigidBodyPlan, Vec3 } from "../model.js";
import {
  addVec3,
  magnitudeVec3,
  subtractVec3,
} from "../foundation/spatial.js";
import {
  jointFrameForAxis,
  type BearingRuntimeSnapshot,
} from "./anvil-02-bearing.js";
import type { TorquePatchCompilation } from "./anvil-06-torque-patch.js";
import { ActivateControlState, type ActivationState } from "./anvil-09-activate.js";

export interface ActivateRuntimeReceipt {
  readonly engineVersion: string;
  readonly relationCreated: boolean;
  readonly bodyCount: number;
  readonly jointCount: number;
  readonly bodyMassErrorsKg: Readonly<Record<string, number>>;
  readonly bodyLocalCenterErrorsM: Readonly<Record<string, number>>;
  readonly gravity: Vec3;
  readonly contactsDisabled: boolean;
  readonly bodyLinearDamping: Readonly<Record<string, number>>;
  readonly bodyAngularDamping: Readonly<Record<string, number>>;
  readonly bodySleepEnabled: Readonly<Record<string, boolean>>;
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

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function rotateVec3ByQuat(
  rotation: { x: number; y: number; z: number; w: number },
  value: Vec3,
): Vec3 {
  const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
  const t = cross(qv, value);
  const doubled = scale(t, 2);
  return addVec3(value, addVec3(scale(doubled, rotation.w), cross(qv, doubled)));
}

function boxHullPoints(body: RigidBodyPlan, colliderIndex: number): number[] {
  const collider = body.colliders[colliderIndex];
  if (collider === undefined) throw new Error(`ANVIL-09 missing collider ${colliderIndex}`);
  const center = subtractVec3(collider.centerWorld, body.centerOfMassWorld);
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

function toBox3DQuat(rotation: { x: number; y: number; z: number; w: number }): { v: Vec3; s: number } {
  return { v: { x: rotation.x, y: rotation.y, z: rotation.z }, s: rotation.w };
}

export class ActivatePhysics {
  readonly #b3: Box3DModule;
  readonly #worldId: b3WorldId;
  readonly #bodyIds: Map<string, b3BodyId>;
  readonly #compilation: TorquePatchCompilation;
  readonly #jointId: b3JointId;
  readonly #receipt: ActivateRuntimeReceipt;
  readonly #control: ActivateControlState;
  #disposed = false;

  private constructor(
    b3: Box3DModule,
    worldId: b3WorldId,
    bodyIds: Map<string, b3BodyId>,
    compilation: TorquePatchCompilation,
    jointId: b3JointId,
    receipt: ActivateRuntimeReceipt,
  ) {
    this.#b3 = b3;
    this.#worldId = worldId;
    this.#bodyIds = bodyIds;
    this.#compilation = compilation;
    this.#jointId = jointId;
    this.#receipt = receipt;
    this.#control = new ActivateControlState(compilation);
  }

  static async create(
    compilation: TorquePatchCompilation,
    materials: readonly MaterialDefinition[],
  ): Promise<ActivatePhysics> {
    const b3 = await Box3DFactory();
    const version = b3.b3GetVersion();
    if (version.major !== 0 || version.minor !== 1 || version.revision !== 0) {
      throw new Error(`ANVIL-09 expects Box3D 0.1.0, got ${version.major}.${version.minor}.${version.revision}`);
    }

    const materialById = new Map(materials.map((material) => [material.id, material] as const));
    const worldDef = b3.b3DefaultWorldDef();
    worldDef.gravity = { ...ZERO };
    worldDef.workerCount = 0;
    const worldId = b3.b3CreateWorld(worldDef);
    const bodyIds = new Map<string, b3BodyId>();
    const massErrors: Record<string, number> = {};
    const centerErrors: Record<string, number> = {};
    const linearDamping: Record<string, number> = {};
    const angularDamping: Record<string, number> = {};
    const sleepEnabled: Record<string, boolean> = {};
    let contactsDisabled = true;

    try {
      for (const body of compilation.torque.bearing.physicalPlan.bodies) {
        const bodyDef = b3.b3DefaultBodyDef();
        bodyDef.type = b3.b3BodyType.b3_dynamicBody;
        bodyDef.position = { ...body.centerOfMassWorld };
        bodyDef.linearDamping = 0;
        bodyDef.angularDamping = 0;
        bodyDef.enableSleep = false;
        bodyDef.isAwake = true;
        const bodyId = b3.b3CreateBody(worldId, bodyDef);
        bodyIds.set(body.id, bodyId);

        for (let index = 0; index < body.colliders.length; index += 1) {
          const collider = body.colliders[index];
          if (collider === undefined) continue;
          const material = materialById.get(collider.materialId);
          if (material === undefined) throw new Error(`ANVIL-09 missing material ${collider.materialId}`);
          const hull = b3.b3CreateHull(boxHullPoints(body, index));
          if (hull === null || hull === undefined) throw new Error(`Box3D rejected ANVIL-09 collider ${collider.id}`);
          const shapeDef = b3.b3DefaultShapeDef();
          shapeDef.density = material.densityKgM3;
          shapeDef.baseMaterial.friction = material.friction;
          shapeDef.filter.maskBits = 0n;
          try {
            const shapeId = b3.b3CreateHullShape(bodyId, shapeDef, hull);
            contactsDisabled = contactsDisabled && b3.b3Shape_GetFilter(shapeId).maskBits === 0n;
          } finally {
            (hull as unknown as { delete?: () => void }).delete?.();
          }
        }

        const mass = b3.b3Body_GetMassData(bodyId);
        massErrors[body.id] = mass.mass - body.massKg;
        centerErrors[body.id] = Math.hypot(mass.center.x, mass.center.y, mass.center.z);
        linearDamping[body.id] = b3.b3Body_GetLinearDamping(bodyId);
        angularDamping[body.id] = b3.b3Body_GetAngularDamping(bodyId);
        sleepEnabled[body.id] = b3.b3Body_IsSleepEnabled(bodyId);
      }

      const relation = compilation.torque.bearing.relation;
      const bodyA = bodyIds.get(relation.bodyAId);
      const bodyB = bodyIds.get(relation.bodyBId);
      if (bodyA === undefined || bodyB === undefined) throw new Error("ANVIL-09 bearing relation references missing runtime body");
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
      const jointId = b3.b3CreateRevoluteJoint(worldId, def);
      const counters = b3.b3World_GetCounters(worldId);
      const gravity = b3.b3World_GetGravity(worldId);

      return new ActivatePhysics(b3, worldId, bodyIds, compilation, jointId, {
        engineVersion: `${version.major}.${version.minor}.${version.revision}`,
        relationCreated: counters.jointCount === 1,
        bodyCount: counters.bodyCount,
        jointCount: counters.jointCount,
        bodyMassErrorsKg: massErrors,
        bodyLocalCenterErrorsM: centerErrors,
        gravity: { x: gravity.x, y: gravity.y, z: gravity.z },
        contactsDisabled,
        bodyLinearDamping: linearDamping,
        bodyAngularDamping: angularDamping,
        bodySleepEnabled: sleepEnabled,
      });
    } catch (error: unknown) {
      if (b3.b3World_IsValid(worldId)) b3.b3DestroyWorld(worldId);
      throw error;
    }
  }

  get sourceCompilation(): TorquePatchCompilation {
    this.#assertActive();
    return this.#compilation;
  }

  get receipt(): ActivateRuntimeReceipt {
    this.#assertActive();
    return this.#receipt;
  }

  get activation(): ActivationState {
    this.#assertActive();
    return this.#control.activation;
  }

  setActivation(value: unknown): void {
    this.#assertActive();
    this.#control.setActivation(value);
  }

  step(stepCount = 1): void {
    this.#assertActive();
    if (!Number.isInteger(stepCount) || stepCount < 0) throw new Error("ANVIL-09 stepCount must be a non-negative integer");
    const action = this.#compilation.torque.action;
    const bodyA = this.#bodyIds.get(action.bodyAId);
    const bodyB = this.#bodyIds.get(action.bodyBId);
    if (bodyA === undefined || bodyB === undefined) throw new Error("ANVIL-09 torque action lost runtime body");

    for (let index = 0; index < stepCount; index += 1) {
      if (this.#control.activation === "ON") {
        const pair = this.#control.torquePair();
        this.#b3.b3Body_ApplyTorque(bodyA, { ...pair.torqueAWorld }, true);
        this.#b3.b3Body_ApplyTorque(bodyB, { ...pair.torqueBWorld }, true);
      }
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
    const relation = this.#compilation.torque.bearing.relation;
    const snapshots = new Map(this.snapshots().map((snapshot) => [snapshot.planBodyId, snapshot] as const));
    const a = snapshots.get(relation.bodyAId);
    const b = snapshots.get(relation.bodyBId);
    if (a === undefined || b === undefined) throw new Error("ANVIL-09 bearing gap missing runtime snapshot");

    const worldA = addVec3(a.position, rotateVec3ByQuat(a.rotation, relation.localAnchorA));
    const worldB = addVec3(b.position, rotateVec3ByQuat(b.rotation, relation.localAnchorB));
    return magnitudeVec3(subtractVec3(worldA, worldB));
  }

  relativeAngularSpeedRadps(): number {
    this.#assertActive();
    const relation = this.#compilation.torque.bearing.relation;
    const snapshots = new Map(this.snapshots().map((snapshot) => [snapshot.planBodyId, snapshot] as const));
    const a = snapshots.get(relation.bodyAId);
    const b = snapshots.get(relation.bodyBId);
    if (a === undefined || b === undefined) throw new Error("ANVIL-09 relative angular speed missing runtime snapshot");
    return dot(subtractVec3(b.angularVelocity, a.angularVelocity), relation.axisWorld);
  }

  dispose(): void {
    if (this.#disposed) return;
    if (this.#b3.b3World_IsValid(this.#worldId)) this.#b3.b3DestroyWorld(this.#worldId);
    this.#disposed = true;
  }

  #assertActive(): void {
    if (this.#disposed) throw new Error("ANVIL-09 runtime has been disposed");
  }
}
