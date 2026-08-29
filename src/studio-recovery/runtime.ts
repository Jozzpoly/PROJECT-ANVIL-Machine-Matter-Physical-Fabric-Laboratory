import Box3DFactory from "box3d.js/inline";
import type { Box3DModule, b3BodyId, b3JointId, b3WorldId } from "box3d.js";
import { jointFrameForAxis, type BearingRuntimeSnapshot } from "../experiments/anvil-02-bearing.js";
import { addVec3, magnitudeVec3, subtractVec3 } from "../foundation/spatial.js";
import type { MaterialDefinition, RigidBodyPlan, Vec3 } from "../model.js";
import {
  realizeFreedomSource,
  type FreedomBearingPlan,
  type FreedomDiagnostic,
  type FreedomRealizationPlan,
} from "./realize.js";
import {
  createRuntimeHandGrab,
  runtimeHandAnchorWorld,
  runtimeHandForceWorld,
  updateRuntimeHandTarget,
  type RuntimeHandGrab,
} from "./hand.js";
import type { FreedomSourceV0 } from "./source.js";

const ZERO: Vec3 = Object.freeze({ x: 0, y: 0, z: 0 });
const GRAVITY: Vec3 = Object.freeze({ x: 0, y: -10, z: 0 });
const GROUND_TOP_Y_M = -0.26;
const GROUND_HALF_HEIGHT_M = 0.5;
const GROUND_HALF_EXTENT_X_M = 10;
const GROUND_HALF_EXTENT_Z_M = 10;
const GROUND_FRICTION = 0.8;
const FIXED_DT = 1 / 60;
const SUBSTEPS = 4;

export interface FreedomRuntimeOptions {
  readonly grounded?: boolean;
}

export interface FreedomRuntimeReceipt {
  readonly engineVersion: string;
  readonly quality: FreedomRealizationPlan["quality"];
  readonly bodyCount: number;
  readonly jointCount: number;
  readonly torqueCount: number;
  readonly diagnostics: readonly FreedomDiagnostic[];
}

export interface FreedomRuntimeFrame {
  readonly sourceGeneration: number;
  readonly forcesEnabled: boolean;
  readonly bodies: readonly BearingRuntimeSnapshot[];
}

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
  rotation: { readonly x: number; readonly y: number; readonly z: number; readonly w: number },
  value: Vec3,
): Vec3 {
  const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
  const t = cross(qv, value);
  const doubled = scale(t, 2);
  return addVec3(value, addVec3(scale(doubled, rotation.w), cross(qv, doubled)));
}

function boxHullPoints(body: RigidBodyPlan, colliderIndex: number): number[] {
  const collider = body.colliders[colliderIndex];
  if (collider === undefined) throw new Error(`Freedom runtime missing collider ${colliderIndex}`);
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

function toBox3DQuat(rotation: { readonly x: number; readonly y: number; readonly z: number; readonly w: number }): { v: Vec3; s: number } {
  return { v: { x: rotation.x, y: rotation.y, z: rotation.z }, s: rotation.w };
}

export class FreedomRuntimeSession {
  readonly #sourceGeneration: number;
  readonly #plan: FreedomRealizationPlan;
  readonly #b3: Box3DModule;
  readonly #worldId: b3WorldId;
  readonly #bodyIds: Map<string, b3BodyId>;
  readonly #jointIds: readonly b3JointId[];
  readonly #receipt: FreedomRuntimeReceipt;
  #forcesEnabled = false;
  #handGrab: RuntimeHandGrab | null = null;
  #disposed = false;

  private constructor(
    sourceGeneration: number,
    plan: FreedomRealizationPlan,
    b3: Box3DModule,
    worldId: b3WorldId,
    bodyIds: Map<string, b3BodyId>,
    jointIds: readonly b3JointId[],
    receipt: FreedomRuntimeReceipt,
  ) {
    this.#sourceGeneration = sourceGeneration;
    this.#plan = plan;
    this.#b3 = b3;
    this.#worldId = worldId;
    this.#bodyIds = bodyIds;
    this.#jointIds = jointIds;
    this.#receipt = receipt;
  }

  static async create(
    source: FreedomSourceV0,
    sourceGeneration: number,
    options: FreedomRuntimeOptions = {},
  ): Promise<FreedomRuntimeSession> {
    const plan = realizeFreedomSource(source);
    const b3 = await Box3DFactory();
    const version = b3.b3GetVersion();
    if (version.major !== 0 || version.minor !== 1 || version.revision !== 0) {
      throw new Error(`Freedom runtime expects Box3D 0.1.0, got ${version.major}.${version.minor}.${version.revision}`);
    }

    const grounded = options.grounded ?? true;
    const materialById = new Map(source.matter.materials.map((material) => [material.id, material] as const));
    const worldDef = b3.b3DefaultWorldDef();
    worldDef.gravity = { ...(grounded ? GRAVITY : ZERO) };
    worldDef.workerCount = 0;
    const worldId = b3.b3CreateWorld(worldDef);
    const bodyIds = new Map<string, b3BodyId>();
    const jointIds: b3JointId[] = [];

    try {
      if (grounded) {
        const groundDef = b3.b3DefaultBodyDef();
        groundDef.position = { x: 0, y: GROUND_TOP_Y_M - GROUND_HALF_HEIGHT_M, z: 0 };
        const groundId = b3.b3CreateBody(worldId, groundDef);
        const groundShape = b3.b3DefaultShapeDef();
        groundShape.baseMaterial.friction = GROUND_FRICTION;
        b3.b3CreateBoxShape(
          groundId,
          groundShape,
          GROUND_HALF_EXTENT_X_M,
          GROUND_HALF_HEIGHT_M,
          GROUND_HALF_EXTENT_Z_M,
        );
      }

      for (const body of plan.physicalPlan.bodies) {
        const bodyDef = b3.b3DefaultBodyDef();
        bodyDef.type = b3.b3BodyType.b3_dynamicBody;
        bodyDef.position = { ...body.centerOfMassWorld };
        bodyDef.linearDamping = 0;
        bodyDef.angularDamping = 0;
        bodyDef.enableSleep = false;
        bodyDef.isAwake = true;
        const bodyId = b3.b3CreateBody(worldId, bodyDef);
        bodyIds.set(body.id, bodyId);
        FreedomRuntimeSession.#addBodyShapes(b3, bodyId, body, materialById);
      }

      for (const relation of plan.bearings) {
        const bodyA = bodyIds.get(relation.bodyAId);
        const bodyB = bodyIds.get(relation.bodyBId);
        if (bodyA === undefined || bodyB === undefined) throw new Error(`Freedom relation ${relation.sourceBearingId} lost runtime body`);
        const def = b3.b3DefaultRevoluteJointDef();
        def.base.bodyIdA = bodyA;
        def.base.bodyIdB = bodyB;
        def.base.localFrameA = {
          p: { ...relation.localAnchorA },
          q: toBox3DQuat(jointFrameForAxis(relation.axisWorld)),
        };
        def.base.localFrameB = {
          p: { ...relation.localAnchorB },
          q: toBox3DQuat(jointFrameForAxis(relation.axisWorld)),
        };
        def.base.collideConnected = false;
        jointIds.push(b3.b3CreateRevoluteJoint(worldId, def));
      }

      return new FreedomRuntimeSession(
        sourceGeneration,
        plan,
        b3,
        worldId,
        bodyIds,
        jointIds,
        {
          engineVersion: `${version.major}.${version.minor}.${version.revision}`,
          quality: plan.quality,
          bodyCount: bodyIds.size,
          jointCount: jointIds.length,
          torqueCount: plan.torques.length,
          diagnostics: plan.diagnostics.map((entry) => ({ ...entry })),
        },
      );
    } catch (error: unknown) {
      if (b3.b3World_IsValid(worldId)) b3.b3DestroyWorld(worldId);
      throw error;
    }
  }

  static #addBodyShapes(
    b3: Box3DModule,
    bodyId: b3BodyId,
    body: RigidBodyPlan,
    materialById: ReadonlyMap<string, MaterialDefinition>,
  ): void {
    for (let index = 0; index < body.colliders.length; index += 1) {
      const collider = body.colliders[index];
      if (collider === undefined) continue;
      const material = materialById.get(collider.materialId);
      if (material === undefined) throw new Error(`Freedom runtime missing material ${collider.materialId}`);
      const hull = b3.b3CreateHull(boxHullPoints(body, index));
      if (hull === null || hull === undefined) throw new Error(`Box3D rejected Freedom collider ${collider.id}`);
      const shapeDef = b3.b3DefaultShapeDef();
      shapeDef.density = material.densityKgM3;
      shapeDef.baseMaterial.friction = material.friction;
      try {
        b3.b3CreateHullShape(bodyId, shapeDef, hull);
      } finally {
        (hull as unknown as { delete?: () => void }).delete?.();
      }
    }
  }

  get sourceGeneration(): number {
    this.#assertActive();
    return this.#sourceGeneration;
  }

  get plan(): FreedomRealizationPlan {
    this.#assertActive();
    return this.#plan;
  }

  get receipt(): FreedomRuntimeReceipt {
    this.#assertActive();
    return this.#receipt;
  }

  get forcesEnabled(): boolean {
    this.#assertActive();
    return this.#forcesEnabled;
  }

  get handActive(): boolean {
    this.#assertActive();
    return this.#handGrab !== null;
  }

  setForcesEnabled(enabled: boolean): void {
    this.#assertActive();
    this.#forcesEnabled = enabled;
  }

  beginHandGrab(planBodyId: string, worldPoint: Vec3): void {
    this.#assertActive();
    const snapshot = this.snapshots().find((candidate) => candidate.planBodyId === planBodyId);
    if (snapshot === undefined) throw new Error(`Runtime Hand cannot grab missing body ${planBodyId}`);
    this.#handGrab = createRuntimeHandGrab(snapshot, worldPoint);
  }

  updateHandTarget(targetWorld: Vec3): void {
    this.#assertActive();
    if (this.#handGrab === null) throw new Error("Runtime Hand has no active grab");
    this.#handGrab = updateRuntimeHandTarget(this.#handGrab, targetWorld);
  }

  endHandGrab(): void {
    this.#assertActive();
    this.#handGrab = null;
  }

  handAnchorWorld(): Vec3 | null {
    this.#assertActive();
    const grab = this.#handGrab;
    if (grab === null) return null;
    const snapshot = this.snapshots().find((candidate) => candidate.planBodyId === grab.planBodyId);
    if (snapshot === undefined) throw new Error(`Runtime Hand lost grabbed body ${grab.planBodyId}`);
    return runtimeHandAnchorWorld(grab, snapshot);
  }

  handTargetWorld(): Vec3 | null {
    this.#assertActive();
    return this.#handGrab === null ? null : { ...this.#handGrab.targetWorld };
  }

  step(stepCount = 1): FreedomRuntimeFrame {
    this.#assertActive();
    if (!Number.isInteger(stepCount) || stepCount < 0) throw new Error("Freedom runtime stepCount must be a non-negative integer");

    for (let index = 0; index < stepCount; index += 1) {
      if (this.#forcesEnabled) this.#applyTorques();
      this.#applyRuntimeHand();
      this.#b3.b3World_Step(this.#worldId, FIXED_DT, SUBSTEPS);
    }
    return this.frame();
  }

  #applyTorques(): void {
    for (const torque of this.#plan.torques) {
      const bodyA = this.#bodyIds.get(torque.bodyAId);
      const bodyB = this.#bodyIds.get(torque.bodyBId);
      if (bodyA === undefined || bodyB === undefined) throw new Error(`Torque ${torque.sourcePatchId} lost runtime body`);
      this.#b3.b3Body_ApplyTorque(bodyA, { ...torque.torqueAWorld }, true);
      this.#b3.b3Body_ApplyTorque(bodyB, { ...torque.torqueBWorld }, true);
    }
  }

  #applyRuntimeHand(): void {
    const grab = this.#handGrab;
    if (grab === null) return;
    const snapshot = this.snapshots().find((candidate) => candidate.planBodyId === grab.planBodyId);
    const bodyId = this.#bodyIds.get(grab.planBodyId);
    if (snapshot === undefined || bodyId === undefined) throw new Error(`Runtime Hand lost grabbed body ${grab.planBodyId}`);
    const anchorWorld = runtimeHandAnchorWorld(grab, snapshot);
    const forceWorld = runtimeHandForceWorld(grab, snapshot);
    this.#b3.b3Body_ApplyForce(bodyId, forceWorld, anchorWorld, true);
  }

  frame(): FreedomRuntimeFrame {
    this.#assertActive();
    return {
      sourceGeneration: this.#sourceGeneration,
      forcesEnabled: this.#forcesEnabled,
      bodies: this.snapshots(),
    };
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
    const result: Record<string, number> = {};
    for (const relation of this.#plan.bearings) {
      const a = snapshots.get(relation.bodyAId);
      const b = snapshots.get(relation.bodyBId);
      if (a === undefined || b === undefined) throw new Error(`Freedom runtime lost relation ${relation.sourceBearingId}`);
      const worldA = addVec3(a.position, rotateVec3ByQuat(a.rotation, relation.localAnchorA));
      const worldB = addVec3(b.position, rotateVec3ByQuat(b.rotation, relation.localAnchorB));
      result[relation.sourceBearingId] = magnitudeVec3(subtractVec3(worldA, worldB));
    }
    return result;
  }

  relativeAngularSpeedRadps(sourceBearingId: string): number {
    this.#assertActive();
    const relation: FreedomBearingPlan | undefined = this.#plan.bearings.find(
      (candidate) => candidate.sourceBearingId === sourceBearingId,
    );
    if (relation === undefined) throw new Error(`Freedom runtime has no realized Bearing ${sourceBearingId}`);
    const snapshots = new Map(this.snapshots().map((snapshot) => [snapshot.planBodyId, snapshot] as const));
    const a = snapshots.get(relation.bodyAId);
    const b = snapshots.get(relation.bodyBId);
    if (a === undefined || b === undefined) throw new Error(`Freedom runtime lost Bearing snapshots for ${sourceBearingId}`);
    return dot(subtractVec3(b.angularVelocity, a.angularVelocity), relation.axisWorld);
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#handGrab = null;
    if (this.#b3.b3World_IsValid(this.#worldId)) this.#b3.b3DestroyWorld(this.#worldId);
    this.#disposed = true;
  }

  #assertActive(): void {
    if (this.#disposed) throw new Error("Freedom runtime is disposed");
  }
}
