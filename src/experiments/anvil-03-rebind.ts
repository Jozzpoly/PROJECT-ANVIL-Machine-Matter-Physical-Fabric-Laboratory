import Box3DFactory from "box3d.js/inline";
import type { Box3DModule, b3BodyId, b3JointId, b3WorldId } from "box3d.js";
import { compileMatter, type BlockedFaceConnection } from "../compiler.js";
import type { MaterialDefinition, PhysicalPlan, RigidBodyPlan, Vec3 } from "../model.js";
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
  compileBearing,
  createBearingFixture,
  jointFrameForAxis,
  type BearingAuthoredFixture,
  type BearingCompilation,
  type BearingRelationPlan,
  type BearingRuntimeSnapshot,
} from "./anvil-02-bearing.js";

export interface RebindFixture {
  readonly bearing: BearingAuthoredFixture;
  readonly cut: BlockedFaceConnection;
}

export interface RebindCompilation {
  readonly before: BearingCompilation;
  readonly after: BearingCompilation;
  readonly cut: BlockedFaceConnection;
  readonly parentBodyByAfterBodyId: Readonly<Record<string, string>>;
}

export interface RebindRuntimeReceipt {
  readonly engineVersion: string;
  readonly relationCreated: boolean;
  readonly bodyMassErrorsKg: Readonly<Record<string, number>>;
  readonly bodyLocalCenterErrorsM: Readonly<Record<string, number>>;
}

export interface BearingKinematics {
  readonly anchorAWorld: Vec3;
  readonly anchorBWorld: Vec3;
  readonly anchorGapM: number;
  readonly anchorVelocityA: Vec3;
  readonly anchorVelocityB: Vec3;
  readonly anchorVelocityGapMps: number;
}

const ZERO: Vec3 = Object.freeze({ x: 0, y: 0, z: 0 });
const FIXED_DT = 1 / 60;
const SUBSTEPS = 4;

function connectionKey(connection: BlockedFaceConnection): string {
  const [a, b] = connection;
  return a.localeCompare(b) <= 0 ? `${a}\u0000${b}` : `${b}\u0000${a}`;
}

function bodyFor(plan: PhysicalPlan, bodyId: string): RigidBodyPlan {
  const body = plan.bodies.find((candidate) => candidate.id === bodyId);
  if (body === undefined) throw new Error(`ANVIL-03 missing compiled body ${bodyId}`);
  return body;
}

function rotateVec3ByQuat(rotation: Quat, value: Vec3): Vec3 {
  const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
  const t = crossVec3(qv, value);
  const doubled = { x: 2 * t.x, y: 2 * t.y, z: 2 * t.z };
  return addVec3(value, addVec3(
    { x: rotation.w * doubled.x, y: rotation.w * doubled.y, z: rotation.w * doubled.z },
    crossVec3(qv, doubled),
  ));
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
  if (collider === undefined) throw new Error(`ANVIL-03 missing collider ${colliderIndex}`);
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

function snapshotMotion(snapshot: BearingRuntimeSnapshot): RigidMotion {
  return {
    position: { ...snapshot.position },
    rotation: { ...snapshot.rotation },
    linearVelocity: { ...snapshot.linearVelocity },
    angularVelocity: { ...snapshot.angularVelocity },
  };
}

function worldPoint(snapshot: BearingRuntimeSnapshot, localPoint: Vec3): Vec3 {
  return addVec3(snapshot.position, rotateVec3ByQuat(snapshot.rotation, localPoint));
}

function reboundRelation(source: BearingRelationPlan, afterPlan: PhysicalPlan): BearingRelationPlan {
  const bodyAId = afterPlan.cellToBody[source.endpointA.cellId];
  const bodyBId = afterPlan.cellToBody[source.endpointB.cellId];
  if (bodyAId === undefined || bodyBId === undefined) throw new Error("ANVIL-03 rebound bearing lost an endpoint cell");
  if (bodyAId === bodyBId) throw new Error("ANVIL-03 rebound bearing endpoints collapsed into one rigid body");
  const bodyA = bodyFor(afterPlan, bodyAId);
  const bodyB = bodyFor(afterPlan, bodyBId);
  return {
    ...source,
    bodyAId,
    bodyBId,
    localAnchorA: subtractVec3(source.pivotWorld, bodyA.centerOfMassWorld),
    localAnchorB: subtractVec3(source.pivotWorld, bodyB.centerOfMassWorld),
  };
}

export function createRebindFixture(): RebindFixture {
  return {
    bearing: createBearingFixture(),
    cut: ["a:0", "a:2"],
  };
}

export function compileRebind(fixture: RebindFixture): RebindCompilation {
  const before = compileBearing(fixture.bearing);
  const bearingConnection: BlockedFaceConnection = [
    before.relation.endpointA.cellId,
    before.relation.endpointB.cellId,
  ];
  if (connectionKey(fixture.cut) === connectionKey(bearingConnection)) {
    throw new Error("ANVIL-03 CUT must be adjacent to the bearing, not the bearing seam itself");
  }

  const afterMatter = {
    ...fixture.bearing.matter,
    revision: "anvil-03-rebind/after-cut",
  };
  const afterPlan = compileMatter(afterMatter, {
    blockedFaceConnections: [bearingConnection, fixture.cut],
  });

  const parentBodyByAfterBodyId: Record<string, string> = {};
  for (const child of afterPlan.bodies) {
    const parentIds = new Set<string>();
    for (const cellId of child.sourceCellIds) {
      const parentId = before.physicalPlan.cellToBody[cellId];
      if (parentId === undefined) throw new Error(`ANVIL-03 lineage lost source cell ${cellId}`);
      parentIds.add(parentId);
    }
    if (parentIds.size !== 1) {
      throw new Error(`ANVIL-03 only supports split lineage; ${child.id} maps to ${parentIds.size} parents`);
    }
    const parentId = parentIds.values().next().value as string | undefined;
    if (parentId === undefined) throw new Error(`ANVIL-03 empty lineage for ${child.id}`);
    parentBodyByAfterBodyId[child.id] = parentId;
  }

  return {
    before,
    after: {
      physicalPlan: afterPlan,
      relation: reboundRelation(before.relation, afterPlan),
    },
    cut: [...fixture.cut],
    parentBodyByAfterBodyId,
  };
}

export function transferRebindMotion(
  compilation: RebindCompilation,
  beforeSnapshots: readonly BearingRuntimeSnapshot[],
): Readonly<Record<string, RigidMotion>> {
  const snapshotsByBodyId = new Map<string, BearingRuntimeSnapshot>();
  for (const snapshot of beforeSnapshots) {
    if (snapshotsByBodyId.has(snapshot.planBodyId)) throw new Error(`ANVIL-03 duplicate before snapshot ${snapshot.planBodyId}`);
    snapshotsByBodyId.set(snapshot.planBodyId, snapshot);
  }
  if (snapshotsByBodyId.size !== compilation.before.physicalPlan.bodies.length) {
    throw new Error("ANVIL-03 before snapshot set does not cover the complete runtime");
  }

  const result: Record<string, RigidMotion> = {};
  for (const child of compilation.after.physicalPlan.bodies) {
    const parentId = compilation.parentBodyByAfterBodyId[child.id];
    if (parentId === undefined) throw new Error(`ANVIL-03 missing lineage for ${child.id}`);
    const parentPlan = bodyFor(compilation.before.physicalPlan, parentId);
    const parentSnapshot = snapshotsByBodyId.get(parentId);
    if (parentSnapshot === undefined) throw new Error(`ANVIL-03 missing parent snapshot ${parentId}`);
    const parentMotion = snapshotMotion(parentSnapshot);
    const authoredOffset = subtractVec3(child.centerOfMassWorld, parentPlan.centerOfMassWorld);
    const worldOffset = rotateVec3ByQuat(parentMotion.rotation, authoredOffset);
    const childWorldCom = addVec3(parentMotion.position, worldOffset);
    result[child.id] = {
      position: childWorldCom,
      rotation: { ...parentMotion.rotation },
      linearVelocity: rigidVelocityAtWorldPoint(parentMotion, childWorldCom),
      angularVelocity: { ...parentMotion.angularVelocity },
    };
  }
  return result;
}

export class RebindPhysics {
  readonly #b3: Box3DModule;
  readonly #worldId: b3WorldId;
  readonly #bodyIds: Map<string, b3BodyId>;
  readonly #relation: BearingRelationPlan;
  readonly #jointId: b3JointId | null;
  readonly #receipt: RebindRuntimeReceipt;
  #disposed = false;

  private constructor(
    b3: Box3DModule,
    worldId: b3WorldId,
    bodyIds: Map<string, b3BodyId>,
    relation: BearingRelationPlan,
    jointId: b3JointId | null,
    receipt: RebindRuntimeReceipt,
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
  ): Promise<RebindPhysics> {
    const b3 = await Box3DFactory();
    const version = b3.b3GetVersion();
    if (version.major !== 0 || version.minor !== 1 || version.revision !== 0) {
      throw new Error(`ANVIL-03 expects Box3D 0.1.0, got ${version.major}.${version.minor}.${version.revision}`);
    }
    const knownIds = new Set(compilation.physicalPlan.bodies.map((body) => body.id));
    for (const bodyId of Object.keys(initialMotionByPlanBodyId)) {
      if (!knownIds.has(bodyId)) throw new Error(`ANVIL-03 initial motion references unknown body ${bodyId}`);
    }
    for (const body of compilation.physicalPlan.bodies) {
      if (initialMotionByPlanBodyId[body.id] === undefined) throw new Error(`ANVIL-03 missing initial motion for ${body.id}`);
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
        if (motion === undefined) throw new Error(`ANVIL-03 missing initial motion for ${body.id}`);
        finiteMotion(motion, `ANVIL-03 ${body.id}`);
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
          if (material === undefined) throw new Error(`ANVIL-03 missing material ${collider.materialId}`);
          const hull = b3.b3CreateHull(boxHullPoints(body, index));
          if (hull === null || hull === undefined) throw new Error(`Box3D rejected ANVIL-03 collider ${collider.id}`);
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
        if (bodyA === undefined || bodyB === undefined) throw new Error("ANVIL-03 relation references missing runtime body");
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

      return new RebindPhysics(b3, worldId, bodyIds, compilation.relation, jointId, {
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

  get receipt(): RebindRuntimeReceipt {
    this.#assertActive();
    return this.#receipt;
  }

  step(stepCount = 1): void {
    this.#assertActive();
    if (!Number.isInteger(stepCount) || stepCount < 0) throw new Error("ANVIL-03 stepCount must be a non-negative integer");
    for (let index = 0; index < stepCount; index += 1) this.#b3.b3World_Step(this.#worldId, FIXED_DT, SUBSTEPS);
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

  bearingKinematics(): BearingKinematics {
    this.#assertActive();
    const snapshots = new Map(this.snapshots().map((snapshot) => [snapshot.planBodyId, snapshot] as const));
    const a = snapshots.get(this.#relation.bodyAId);
    const b = snapshots.get(this.#relation.bodyBId);
    if (a === undefined || b === undefined) throw new Error("ANVIL-03 bearing measurement missing body snapshot");
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

  bearingAngleRad(): number | null {
    this.#assertActive();
    return this.#jointId === null ? null : this.#b3.b3RevoluteJoint_GetAngle(this.#jointId);
  }

  dispose(): void {
    if (this.#disposed) return;
    if (this.#b3.b3World_IsValid(this.#worldId)) this.#b3.b3DestroyWorld(this.#worldId);
    this.#disposed = true;
  }

  #assertActive(): void {
    if (this.#disposed) throw new Error("ANVIL-03 runtime has been disposed");
  }
}
