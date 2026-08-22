import Box3DFactory from "box3d.js/inline";
import type { Box3DModule, b3BodyId, b3JointId, b3WorldId } from "box3d.js";
import { jointFrameForAxis, type BearingRuntimeSnapshot } from "../experiments/anvil-02-bearing.js";
import { addVec3, magnitudeVec3, subtractVec3 } from "../foundation/spatial.js";
import type { MaterialDefinition, RigidBodyPlan, Vec3 } from "../model.js";
import {
  compileBreakLab,
  type BreakLabCompilation,
  type BreakLabRuntimePlan,
  type BreakLabRuntimeReceipt,
} from "./break-lab.js";
import {
  createRuntimeHandGrab,
  runtimeHandAnchorWorld,
  runtimeHandForceWorld,
  updateRuntimeHandTarget,
  type RuntimeHandGrab,
} from "./interaction-bandwidth.js";
import type {
  StudioRuntimeActivation,
  StudioRuntimeFrame,
  StudioRuntimeIdSource,
} from "./runtime.js";
import type { StudioSourceV0 } from "./workspace.js";

const ZERO: Vec3 = Object.freeze({ x: 0, y: 0, z: 0 });
const FIXED_DT = 1 / 60;
const SUBSTEPS = 4;

function boxHullPoints(body: RigidBodyPlan, colliderIndex: number): number[] {
  const collider = body.colliders[colliderIndex];
  if (collider === undefined) throw new Error(`Interaction Break runtime missing collider ${colliderIndex}`);
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

function runtimePlan(compilation: BreakLabCompilation): BreakLabRuntimePlan {
  const target = compilation.relations.find((relation) => relation.sourceBearingId === compilation.torque.sourceBearingId);
  if (target === undefined) throw new Error("Interaction Break runtime lost targeted Bearing relation");
  return {
    experimental: true,
    cellToBody: { ...compilation.physicalPlan.cellToBody },
    bodies: compilation.physicalPlan.bodies.map((body) => ({
      planBodyId: body.id,
      centerOfMassWorld: { ...body.centerOfMassWorld },
    })),
    bearing: {
      sourceBearingId: target.sourceBearingId,
      endpointA: { ...target.endpointA },
      endpointB: { ...target.endpointB },
      bodyAId: target.bodyAId,
      bodyBId: target.bodyBId,
      localAnchorA: { ...target.localAnchorA },
      localAnchorB: { ...target.localAnchorB },
      localAxisA: { ...target.localAxisA },
      localAxisB: { ...target.localAxisB },
    },
    bearings: compilation.relations.map((relation) => ({
      ...relation,
      endpointA: { ...relation.endpointA },
      endpointB: { ...relation.endpointB },
      localAnchorA: { ...relation.localAnchorA },
      localAnchorB: { ...relation.localAnchorB },
      localAxisA: { ...relation.localAxisA },
      localAxisB: { ...relation.localAxisB },
      axisWorld: { ...relation.axisWorld },
    })),
    torque: {
      sourcePatchId: compilation.torque.sourcePatchId,
      target: { ...compilation.torque.target },
      effortNm: compilation.torque.effortNm,
    },
  };
}

function rotateVec3ByQuat(
  rotation: { readonly x: number; readonly y: number; readonly z: number; readonly w: number },
  value: Vec3,
): Vec3 {
  const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
  const cross = (a: Vec3, b: Vec3): Vec3 => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  });
  const scale = (v: Vec3, s: number): Vec3 => ({ x: v.x * s, y: v.y * s, z: v.z * s });
  const t = cross(qv, value);
  const doubled = scale(t, 2);
  return addVec3(value, addVec3(scale(doubled, rotation.w), cross(qv, doubled)));
}

export class InteractionBreakRuntimeSession {
  readonly #sessionId: string;
  readonly #sourceGeneration: number;
  readonly #plan: BreakLabRuntimePlan;
  readonly #b3: Box3DModule;
  readonly #worldId: b3WorldId;
  readonly #bodyIds: Map<string, b3BodyId>;
  readonly #jointIds: readonly b3JointId[];
  readonly #compilation: BreakLabCompilation;
  readonly #receipt: BreakLabRuntimeReceipt;
  #activation: StudioRuntimeActivation = "OFF";
  #handGrab: RuntimeHandGrab | null = null;
  #disposed = false;

  private constructor(
    sessionId: string,
    sourceGeneration: number,
    plan: BreakLabRuntimePlan,
    b3: Box3DModule,
    worldId: b3WorldId,
    bodyIds: Map<string, b3BodyId>,
    jointIds: readonly b3JointId[],
    compilation: BreakLabCompilation,
    receipt: BreakLabRuntimeReceipt,
  ) {
    this.#sessionId = sessionId;
    this.#sourceGeneration = sourceGeneration;
    this.#plan = plan;
    this.#b3 = b3;
    this.#worldId = worldId;
    this.#bodyIds = bodyIds;
    this.#jointIds = jointIds;
    this.#compilation = compilation;
    this.#receipt = receipt;
  }

  static async create(
    source: StudioSourceV0,
    sourceGeneration: number,
    idSource: StudioRuntimeIdSource,
  ): Promise<InteractionBreakRuntimeSession> {
    const compilation = compileBreakLab(source);
    const sessionId = idSource().trim();
    if (sessionId.length === 0) throw new Error("Interaction Break runtime id source returned an empty id");
    const plan = runtimePlan(compilation);
    const b3 = await Box3DFactory();
    const version = b3.b3GetVersion();
    if (version.major !== 0 || version.minor !== 1 || version.revision !== 0) {
      throw new Error(`Interaction Break runtime expects Box3D 0.1.0, got ${version.major}.${version.minor}.${version.revision}`);
    }

    const materialById = new Map(source.matter.materials.map((material) => [material.id, material] as const));
    const worldDef = b3.b3DefaultWorldDef();
    worldDef.gravity = { ...ZERO };
    worldDef.workerCount = 0;
    const worldId = b3.b3CreateWorld(worldDef);
    const bodyIds = new Map<string, b3BodyId>();
    const jointIds: b3JointId[] = [];

    try {
      for (const body of compilation.physicalPlan.bodies) {
        const bodyDef = b3.b3DefaultBodyDef();
        bodyDef.type = b3.b3BodyType.b3_dynamicBody;
        bodyDef.position = { ...body.centerOfMassWorld };
        bodyDef.linearDamping = 0;
        bodyDef.angularDamping = 0;
        bodyDef.enableSleep = false;
        bodyDef.isAwake = true;
        const bodyId = b3.b3CreateBody(worldId, bodyDef);
        bodyIds.set(body.id, bodyId);
        InteractionBreakRuntimeSession.#addBodyShapes(b3, bodyId, body, materialById);
      }

      for (const relation of compilation.relations) {
        const bodyA = bodyIds.get(relation.bodyAId);
        const bodyB = bodyIds.get(relation.bodyBId);
        if (bodyA === undefined || bodyB === undefined) throw new Error(`Interaction Break relation ${relation.sourceBearingId} lost runtime body`);
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

      const counters = b3.b3World_GetCounters(worldId);
      return new InteractionBreakRuntimeSession(
        sessionId,
        sourceGeneration,
        plan,
        b3,
        worldId,
        bodyIds,
        jointIds,
        compilation,
        {
          engineVersion: `${version.major}.${version.minor}.${version.revision}`,
          bodyCount: counters.bodyCount,
          jointCount: counters.jointCount,
          relationCount: compilation.relations.length,
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
      if (material === undefined) throw new Error(`Interaction Break runtime missing material ${collider.materialId}`);
      const hull = b3.b3CreateHull(boxHullPoints(body, index));
      if (hull === null || hull === undefined) throw new Error(`Box3D rejected Interaction Break collider ${collider.id}`);
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

  get sessionId(): string {
    this.#assertActive();
    return this.#sessionId;
  }

  get sourceGeneration(): number {
    this.#assertActive();
    return this.#sourceGeneration;
  }

  get plan(): BreakLabRuntimePlan {
    this.#assertActive();
    return this.#plan;
  }

  get receipt(): BreakLabRuntimeReceipt {
    this.#assertActive();
    return this.#receipt;
  }

  get activation(): StudioRuntimeActivation {
    this.#assertActive();
    return this.#activation;
  }

  get handActive(): boolean {
    this.#assertActive();
    return this.#handGrab !== null;
  }

  setActivation(value: StudioRuntimeActivation): void {
    this.#assertActive();
    if (value !== "OFF" && value !== "ON") throw new Error(`Interaction Break activation is invalid: ${String(value)}`);
    this.#activation = value;
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

  step(stepCount = 1): StudioRuntimeFrame {
    this.#assertActive();
    if (!Number.isInteger(stepCount) || stepCount < 0) throw new Error("Interaction Break stepCount must be a non-negative integer");
    const torqueBodyA = this.#bodyIds.get(this.#compilation.torque.bodyAId);
    const torqueBodyB = this.#bodyIds.get(this.#compilation.torque.bodyBId);
    if (torqueBodyA === undefined || torqueBodyB === undefined) throw new Error("Interaction Break torque action lost runtime body");

    for (let index = 0; index < stepCount; index += 1) {
      if (this.#activation === "ON") {
        this.#b3.b3Body_ApplyTorque(torqueBodyA, { ...this.#compilation.torque.torqueAWorld }, true);
        this.#b3.b3Body_ApplyTorque(torqueBodyB, { ...this.#compilation.torque.torqueBWorld }, true);
      }
      this.#applyRuntimeHand();
      this.#b3.b3World_Step(this.#worldId, FIXED_DT, SUBSTEPS);
    }
    return this.frame();
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

  frame(): StudioRuntimeFrame {
    this.#assertActive();
    return {
      sessionId: this.#sessionId,
      sourceGeneration: this.#sourceGeneration,
      activation: this.#activation,
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
    for (const relation of this.#compilation.relations) {
      const a = snapshots.get(relation.bodyAId);
      const b = snapshots.get(relation.bodyBId);
      if (a === undefined || b === undefined) throw new Error(`Interaction Break lost relation ${relation.sourceBearingId}`);
      const worldA = addVec3(a.position, rotateVec3ByQuat(a.rotation, relation.localAnchorA));
      const worldB = addVec3(b.position, rotateVec3ByQuat(b.rotation, relation.localAnchorB));
      result[relation.sourceBearingId] = magnitudeVec3(subtractVec3(worldA, worldB));
    }
    return result;
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#handGrab = null;
    if (this.#b3.b3World_IsValid(this.#worldId)) this.#b3.b3DestroyWorld(this.#worldId);
    this.#disposed = true;
  }

  #assertActive(): void {
    if (this.#disposed) throw new Error("Interaction Break runtime has been disposed");
  }
}
