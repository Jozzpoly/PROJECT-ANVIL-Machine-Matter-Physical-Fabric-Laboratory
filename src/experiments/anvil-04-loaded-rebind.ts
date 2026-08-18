import Box3DFactory from "box3d.js/inline";
import type { Box3DModule, b3BodyId, b3JointId, b3WorldId } from "box3d.js";
import type { MaterialDefinition, RigidBodyPlan, Vec3 } from "../model.js";
import {
  addVec3,
  crossVec3,
  magnitudeVec3,
  rigidVelocityAtWorldPoint,
  subtractVec3,
  type Quat,
  type RigidMotion,
} from "../foundation/spatial.js";
import {
  jointFrameForAxis,
  type BearingCompilation,
  type BearingKinematics as _UnusedBearingKinematics,
  type BearingRelationPlan,
  type BearingRuntimeSnapshot,
} from "./anvil-02-bearing.js";
import {
  compileRebind,
  createRebindFixture,
  type RebindCompilation,
  type RebindFixture,
} from "./anvil-03-rebind.js";

export const LOAD_REBIND_FORCE_N = 2500;
export const LOAD_REBIND_DIRECTION: Vec3 = Object.freeze({ x: 1, y: 0, z: 0 });

export interface LoadedBearingKinematics {
  readonly anchorAWorld: Vec3;
  readonly anchorBWorld: Vec3;
  readonly anchorGapM: number;
  readonly anchorVelocityA: Vec3;
  readonly anchorVelocityB: Vec3;
  readonly anchorVelocityGapMps: number;
}

export interface LoadedRebindRuntimeReceipt {
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

function bodyFor(compilation: BearingCompilation, bodyId: string): RigidBodyPlan {
  const body = compilation.physicalPlan.bodies.find((candidate) => candidate.id === bodyId);
  if (body === undefined) throw new Error(`ANVIL-04 missing compiled body ${bodyId}`);
  return body;
}

function rotateVec3ByQuat(rotation: Quat, value: Vec3): Vec3 {
  const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
  const t = crossVec3(qv, value);
  const doubled = scale(t, 2);
  return addVec3(value, addVec3(scale(doubled, rotation.w), crossVec3(qv, doubled)));
}

function toBox3DQuat(rotation: Quat): { v: Vec3; s: number } {
  return { v: { x: rotation.x, y: rotation.y, z: rotation.z }, s: rotation.w };
}

function finiteVec3(value: Vec3, label: string): void {
  if (![value.x, value.y, value.z].every(Number.isFinite)) throw new Error(`${label} must be finite`);
}

function finiteMotion(motion: RigidMotion, label: string): void {
  finiteVec3(motion.position, `${label} position`);
  finiteVec3(motion.linearVelocity, `${label} linear velocity`);
  finiteVec3(motion.angularVelocity, `${label} angular velocity`);
  const q = motion.rotation;
  if (![q.x, q.y, q.z, q.w].every(Number.isFinite)) throw new Error(`${label} rotation must be finite`);
  const length = Math.hypot(q.x, q.y, q.z, q.w);
  if (Math.abs(length - 1) > 1e-5) throw new Error(`${label} rotation must be unit length`);
}

function boxHullPoints(body: RigidBodyPlan, colliderIndex: number): number[] {
  const collider = body.colliders[colliderIndex];
  if (collider === undefined) throw new Error(`ANVIL-04 missing collider ${colliderIndex}`);
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

function worldPoint(snapshot: BearingRuntimeSnapshot, localPoint: Vec3): Vec3 {
  return addVec3(snapshot.position, rotateVec3ByQuat(snapshot.rotation, localPoint));
}

function snapshotMotion(snapshot: BearingRuntimeSnapshot): RigidMotion {
  return {
    position: { ...snapshot.position },
    rotation: { ...snapshot.rotation },
    linearVelocity: { ...snapshot.linearVelocity },
    angularVelocity: { ...snapshot.angularVelocity },
  };
}

export function createLoadedRebindFixture(): RebindFixture {
  return createRebindFixture();
}

export function compileLoadedRebind(fixture: RebindFixture = createLoadedRebindFixture()): RebindCompilation {
  return compileRebind(fixture);
}

export function createLoadedRebindInitialMotion(
  compilation: BearingCompilation,
): Readonly<Record<string, RigidMotion>> {
  const result: Record<string, RigidMotion> = {};
  for (const body of compilation.physicalPlan.bodies) {
    result[body.id] = {
      position: { ...body.centerOfMassWorld },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      linearVelocity: { ...ZERO },
      angularVelocity: { ...ZERO },
    };
  }
  return result;
}

export class LoadedRebindPhysics {
  readonly #b3: Box3DModule;
  readonly #worldId: b3WorldId;
  readonly #bodyIds: Map<string, b3BodyId>;
  readonly #relation: BearingRelationPlan;
  readonly #jointId: b3JointId | null;
  readonly #receipt: LoadedRebindRuntimeReceipt;
  #disposed = false;

  private constructor(
    b3: Box3DModule,
    worldId: b3WorldId,
    bodyIds: Map<string, b3BodyId>,
    relation: BearingRelationPlan,
    jointId: b3JointId | null,
    receipt: LoadedRebindRuntimeReceipt,
  ) {
    this.#b3 = b3;
    this.#worldId = worldId;
    this.#bodyIds = bodyIds;
    this.#relation = relation;
    this.#jointId = jointId;
    this.#receipt = receipt;
  }

  static async create(
    compilation: BearingCompilation,
    materials: readonly MaterialDefinition[],
    initialMotionByPlanBodyId: Readonly<Record<string, RigidMotion>>,
    createRelation = true,
  ): Promise<LoadedRebindPhysics> {
    const b3 = await Box3DFactory();
    const version = b3.b3GetVersion();
    if (version.major !== 0 || version.minor !== 1 || version.revision !== 0) {
      throw new Error(`ANVIL-04 expects Box3D 0.1.0, got ${version.major}.${version.minor}.${version.revision}`);
    }

    const knownIds = new Set(compilation.physicalPlan.bodies.map((body) => body.id));
    for (const bodyId of Object.keys(initialMotionByPlanBodyId)) {
      if (!knownIds.has(bodyId)) throw new Error(`ANVIL-04 initial motion references unknown body ${bodyId}`);
    }
    for (const body of compilation.physicalPlan.bodies) {
      if (initialMotionByPlanBodyId[body.id] === undefined) throw new Error(`ANVIL-04 missing initial motion for ${body.id}`);
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
      for (const body of compilation.physicalPlan.bodies) {
        const motion = initialMotionByPlanBodyId[body.id];
        if (motion === undefined) throw new Error(`ANVIL-04 missing initial motion for ${body.id}`);
        finiteMotion(motion, `ANVIL-04 ${body.id}`);
        const bodyDef = b3.b3DefaultBodyDef();
        bodyDef.type = b3.b3BodyType.b3_dynamicBody;
        bodyDef.position = { ...motion.position };
        bodyDef.rotation = toBox3DQuat(motion.rotation);
        bodyDef.linearVelocity = { ...motion.linearVelocity };
        bodyDef.angularVelocity = { ...motion.angularVelocity };
        bodyDef.enableSleep = false;
        bodyDef.isAwake = true;
        const bodyId = b3.b3CreateBody(worldId, bodyDef);
        bodyIds.set(body.id, bodyId);

        for (let index = 0; index < body.colliders.length; index += 1) {
          const collider = body.colliders[index];
          if (collider === undefined) continue;
          const material = materialById.get(collider.materialId);
          if (material === undefined) throw new Error(`ANVIL-04 missing material ${collider.materialId}`);
          const hull = b3.b3CreateHull(boxHullPoints(body, index));
          if (hull === null || hull === undefined) throw new Error(`Box3D rejected ANVIL-04 collider ${collider.id}`);
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

      let jointId: b3JointId | null = null;
      if (createRelation) {
        const bodyA = bodyIds.get(compilation.relation.bodyAId);
        const bodyB = bodyIds.get(compilation.relation.bodyBId);
        if (bodyA === undefined || bodyB === undefined) throw new Error("ANVIL-04 relation references missing runtime body");
        const def = b3.b3DefaultRevoluteJointDef();
        def.base.bodyIdA = bodyA;
        def.base.bodyIdB = bodyB;
        def.base.localFrameA = {
          p: { ...compilation.relation.localAnchorA },
          q: toBox3DQuat(jointFrameForAxis(compilation.relation.localAxisA)),
        };
        def.base.localFrameB = {
          p: { ...compilation.relation.localAnchorB },
          q: toBox3DQuat(jointFrameForAxis(compilation.relation.localAxisB)),
        };
        def.base.collideConnected = false;
        jointId = b3.b3CreateRevoluteJoint(worldId, def);
      }

      return new LoadedRebindPhysics(b3, worldId, bodyIds, compilation.relation, jointId, {
        engineVersion: `${version.major}.${version.minor}.${version.revision}`,
        relationCreated: jointId !== null,
        bodyMassErrorsKg: massErrors,
        bodyLocalCenterErrorsM: centerErrors,
      });
    } catch (error: unknown) {
      if (b3.b3World_IsValid(worldId)) b3.b3DestroyWorld(worldId);
      throw error;
    }
  }

  get receipt(): LoadedRebindRuntimeReceipt {
    this.#assertActive();
    return this.#receipt;
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

  bearingKinematics(): LoadedBearingKinematics {
    this.#assertActive();
    const snapshots = new Map(this.snapshots().map((snapshot) => [snapshot.planBodyId, snapshot] as const));
    const a = snapshots.get(this.#relation.bodyAId);
    const b = snapshots.get(this.#relation.bodyBId);
    if (a === undefined || b === undefined) throw new Error("ANVIL-04 bearing measurement missing body snapshot");
    const anchorAWorld = worldPoint(a, this.#relation.localAnchorA);
    const anchorBWorld = worldPoint(b, this.#relation.localAnchorB);
    const anchorVelocityA = rigidVelocityAtWorldPoint(snapshotMotion(a), anchorAWorld);
    const anchorVelocityB = rigidVelocityAtWorldPoint(snapshotMotion(b), anchorBWorld);
    return {
      anchorAWorld,
      anchorBWorld,
      anchorGapM: magnitudeVec3(subtractVec3(anchorAWorld, anchorBWorld)),
      anchorVelocityA,
      anchorVelocityB,
      anchorVelocityGapMps: magnitudeVec3(subtractVec3(anchorVelocityA, anchorVelocityB)),
    };
  }

  constraintForce(): Vec3 | null {
    this.#assertActive();
    if (this.#jointId === null) return null;
    const force = this.#b3.b3Joint_GetConstraintForce(this.#jointId);
    return { x: force.x, y: force.y, z: force.z };
  }

  constraintForceMagnitudeN(): number | null {
    const force = this.constraintForce();
    return force === null ? null : magnitudeVec3(force);
  }

  stepLoaded(loadN = LOAD_REBIND_FORCE_N, stepCount = 1): void {
    this.#assertActive();
    if (!Number.isFinite(loadN) || loadN <= 0) throw new Error("ANVIL-04 load must be positive and finite");
    if (!Number.isInteger(stepCount) || stepCount < 0) throw new Error("ANVIL-04 stepCount must be a non-negative integer");
    const bodyA = this.#bodyIds.get(this.#relation.bodyAId);
    const bodyB = this.#bodyIds.get(this.#relation.bodyBId);
    if (bodyA === undefined || bodyB === undefined) throw new Error("ANVIL-04 load endpoints reference missing body");
    const forceA = scale(LOAD_REBIND_DIRECTION, -loadN);
    const forceB = scale(LOAD_REBIND_DIRECTION, loadN);

    for (let index = 0; index < stepCount; index += 1) {
      const kinematics = this.bearingKinematics();
      this.#b3.b3Body_ApplyForce(bodyA, forceA, kinematics.anchorAWorld, true);
      this.#b3.b3Body_ApplyForce(bodyB, forceB, kinematics.anchorBWorld, true);
      this.#b3.b3World_Step(this.#worldId, FIXED_DT, SUBSTEPS);
    }
  }

  dispose(): void {
    if (this.#disposed) return;
    if (this.#b3.b3World_IsValid(this.#worldId)) this.#b3.b3DestroyWorld(this.#worldId);
    this.#disposed = true;
  }

  #assertActive(): void {
    if (this.#disposed) throw new Error("ANVIL-04 runtime has been disposed");
  }
}
