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

export type GridFace = "x-" | "x+" | "y-" | "y+" | "z-" | "z+";
export type BearingAxis = "x" | "y" | "z";

export interface BearingEndpoint {
  readonly cellId: string;
  readonly face: GridFace;
}

/**
 * Experiment-local authored physical-interface mark.
 *
 * Deliberately absent: Box3D joint/body IDs, motor/limit policy, generic
 * relation kinds and reusable frame entities. ANVIL-02 must earn those before
 * any promotion is considered.
 */
export interface BearingMark {
  readonly id: string;
  readonly endpointA: BearingEndpoint;
  readonly endpointB: BearingEndpoint;
  readonly freeAxis: BearingAxis;
}

export interface BearingAuthoredFixture {
  readonly matter: MatterDocument;
  readonly bearing: BearingMark;
}

/** Disposable experiment-local relation output. */
export interface BearingRelationPlan {
  readonly schema: "anvil-02-bearing-relation/0";
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

export interface BearingCompilation {
  readonly physicalPlan: PhysicalPlan;
  readonly relation: BearingRelationPlan;
}

export interface BearingRuntimeSnapshot {
  readonly planBodyId: string;
  readonly position: Vec3;
  readonly rotation: Quat;
  readonly linearVelocity: Vec3;
  readonly angularVelocity: Vec3;
  readonly massKg: number;
  readonly localCenter: Vec3;
}

export interface BearingRuntimeReceipt {
  readonly engineVersion: string;
  readonly relationCreated: boolean;
  readonly bodyMassErrorsKg: Readonly<Record<string, number>>;
  readonly bodyLocalCenterErrorsM: Readonly<Record<string, number>>;
}

export interface BearingPhysicsOptions {
  readonly gravity?: Vec3;
  readonly createRelation?: boolean;
  readonly initialLinearVelocityByPlanBodyId?: Readonly<Record<string, Vec3>>;
  readonly initialAngularVelocityByPlanBodyId?: Readonly<Record<string, Vec3>>;
}

const FACE_VECTORS: Readonly<Record<GridFace, GridPosition>> = Object.freeze({
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
const IDENTITY: Quat = Object.freeze({ x: 0, y: 0, z: 0, w: 1 });
const FIXED_DT = 1 / 60;
const SUBSTEPS = 4;

function endpointKey(endpoint: BearingEndpoint): string {
  return `${endpoint.cellId}@${endpoint.face}`;
}

function canonicalEndpoints(a: BearingEndpoint, b: BearingEndpoint): readonly [BearingEndpoint, BearingEndpoint] {
  return endpointKey(a).localeCompare(endpointKey(b)) <= 0 ? [a, b] : [b, a];
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

function normalize(value: Vec3, label: string): Vec3 {
  const length = magnitude(value);
  if (!Number.isFinite(length) || length <= 0) throw new Error(`${label} must be non-zero and finite`);
  return scale(value, 1 / length);
}

function negate(value: Vec3): Vec3 {
  return scale(value, -1);
}

function sameVector(a: Vec3, b: Vec3): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

function cellCenter(cell: MatterCell, cellSizeM: number): Vec3 {
  return {
    x: (cell.grid.x + 0.5) * cellSizeM,
    y: (cell.grid.y + 0.5) * cellSizeM,
    z: (cell.grid.z + 0.5) * cellSizeM,
  };
}

function bodyFor(plan: PhysicalPlan, bodyId: string): RigidBodyPlan {
  const body = plan.bodies.find((candidate) => candidate.id === bodyId);
  if (body === undefined) throw new Error(`bearing compilation missing body ${bodyId}`);
  return body;
}

function validateBearingId(id: string): void {
  if (id.trim().length === 0) throw new Error("bearing id must be non-empty");
}

export function compileBearing(authored: BearingAuthoredFixture): BearingCompilation {
  validateBearingId(authored.bearing.id);
  const [endpointA, endpointB] = canonicalEndpoints(
    authored.bearing.endpointA,
    authored.bearing.endpointB,
  );
  if (endpointA.cellId === endpointB.cellId) throw new Error("bearing endpoints must reference two cells");

  const byId = new Map(authored.matter.cells.map((cell) => [cell.id, cell] as const));
  const cellA = byId.get(endpointA.cellId);
  const cellB = byId.get(endpointB.cellId);
  if (cellA === undefined || cellB === undefined) {
    throw new Error(`bearing references unknown endpoint cell: ${endpointA.cellId} <-> ${endpointB.cellId}`);
  }

  const faceA = FACE_VECTORS[endpointA.face];
  const faceB = FACE_VECTORS[endpointB.face];
  if (!sameVector(faceB, negate(faceA))) {
    throw new Error(`bearing endpoint faces must be opposite: ${endpointA.face} <-> ${endpointB.face}`);
  }
  const aToB: Vec3 = {
    x: cellB.grid.x - cellA.grid.x,
    y: cellB.grid.y - cellA.grid.y,
    z: cellB.grid.z - cellA.grid.z,
  };
  if (!sameVector(aToB, faceA)) {
    throw new Error(`bearing endpoints are not adjacent through the declared faces: ${endpointA.cellId} <-> ${endpointB.cellId}`);
  }

  const axisWorld = AXIS_VECTORS[authored.bearing.freeAxis];
  if (Math.abs(dot(axisWorld, faceA)) > 0) {
    throw new Error(`bearing free axis ${authored.bearing.freeAxis} is normal to shared face ${endpointA.face}`);
  }

  const baseline = compileMatter(authored.matter);
  const baselineBodyA = baseline.cellToBody[cellA.id];
  const baselineBodyB = baseline.cellToBody[cellB.id];
  if (baselineBodyA === undefined || baselineBodyB === undefined) throw new Error("bearing baseline provenance missing endpoint body");
  if (baselineBodyA !== baselineBodyB) {
    throw new Error("bearing endpoints are already in different rigid islands before the interface mark");
  }

  const blocked: BlockedFaceConnection = [cellA.id, cellB.id];
  const physicalPlan = compileMatter(authored.matter, { blockedFaceConnections: [blocked] });
  const bodyAId = physicalPlan.cellToBody[cellA.id];
  const bodyBId = physicalPlan.cellToBody[cellB.id];
  if (bodyAId === undefined || bodyBId === undefined) throw new Error("bearing compiled provenance missing endpoint body");
  if (bodyAId === bodyBId) {
    throw new Error("bearing seam does not split rigid connectivity; an alternate rigid path bypasses the interface");
  }

  const bodyA = bodyFor(physicalPlan, bodyAId);
  const bodyB = bodyFor(physicalPlan, bodyBId);
  const pivotWorld = add(cellCenter(cellA, authored.matter.cellSizeM), scale(faceA, authored.matter.cellSizeM / 2));

  return {
    physicalPlan,
    relation: {
      schema: "anvil-02-bearing-relation/0",
      sourceBearingId: authored.bearing.id.trim(),
      endpointA: { ...endpointA },
      endpointB: { ...endpointB },
      bodyAId,
      bodyBId,
      pivotWorld,
      axisWorld: { ...axisWorld },
      localAnchorA: subtract(pivotWorld, bodyA.centerOfMassWorld),
      localAnchorB: subtract(pivotWorld, bodyB.centerOfMassWorld),
      localAxisA: { ...axisWorld },
      localAxisB: { ...axisWorld },
    },
  };
}

export function createBearingFixture(): BearingAuthoredFixture {
  const material: MaterialDefinition = {
    id: "anvil-02-alloy",
    densityKgM3: 780,
    friction: 0.45,
    displayColor: "#89c7ff",
  };
  const cells: MatterCell[] = [
    { id: "a:0", grid: { x: -2, y: 0, z: 0 }, materialId: material.id },
    { id: "a:1", grid: { x: -2, y: 1, z: 0 }, materialId: material.id },
    { id: "a:2", grid: { x: -1, y: 0, z: 0 }, materialId: material.id },
    { id: "b:0", grid: { x: 0, y: 0, z: 0 }, materialId: material.id },
    { id: "b:1", grid: { x: 1, y: 0, z: 0 }, materialId: material.id },
    { id: "b:2", grid: { x: 1, y: -1, z: 0 }, materialId: material.id },
    { id: "b:3", grid: { x: 2, y: 0, z: 0 }, materialId: material.id },
  ];
  return {
    matter: {
      schema: "anvil-matter/0",
      revision: "anvil-02-bearing/fixture-v1",
      cellSizeM: 0.5,
      materials: [material],
      cells,
    },
    bearing: {
      id: "bearing:seam-0",
      endpointA: { cellId: "a:2", face: "x+" },
      endpointB: { cellId: "b:0", face: "x-" },
      freeAxis: "z",
    },
  };
}

function boxHullPoints(body: RigidBodyPlan, colliderIndex: number): number[] {
  const collider = body.colliders[colliderIndex];
  if (collider === undefined) throw new Error(`missing collider ${colliderIndex}`);
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

function finiteVec3(value: Vec3, label: string): void {
  if (![value.x, value.y, value.z].every(Number.isFinite)) throw new Error(`${label} must be finite`);
}

function rotateVec3ByQuat(rotation: Quat, value: Vec3): Vec3 {
  const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
  const t = cross(qv, value);
  const doubled = scale(t, 2);
  return add(value, add(scale(doubled, rotation.w), cross(qv, doubled)));
}

/** Quaternion whose local Z axis points along the supplied unit axis. */
export function jointFrameForAxis(axis: Vec3): Quat {
  const target = normalize(axis, "bearing axis");
  const z = { x: 0, y: 0, z: 1 };
  const alignment = dot(z, target);
  if (alignment > 1 - 1e-12) return { ...IDENTITY };
  if (alignment < -1 + 1e-12) return { x: 1, y: 0, z: 0, w: 0 };
  const vector = cross(z, target);
  const candidate = { x: vector.x, y: vector.y, z: vector.z, w: 1 + alignment };
  const length = Math.hypot(candidate.x, candidate.y, candidate.z, candidate.w);
  return {
    x: candidate.x / length,
    y: candidate.y / length,
    z: candidate.z / length,
    w: candidate.w / length,
  };
}

function toBox3DQuat(rotation: Quat): { v: Vec3; s: number } {
  return { v: { x: rotation.x, y: rotation.y, z: rotation.z }, s: rotation.w };
}

function worldPoint(snapshot: BearingRuntimeSnapshot, localPoint: Vec3): Vec3 {
  return add(snapshot.position, rotateVec3ByQuat(snapshot.rotation, localPoint));
}

export class BearingPhysics {
  readonly #b3: Box3DModule;
  readonly #worldId: b3WorldId;
  readonly #bodyIds: Map<string, b3BodyId>;
  readonly #relation: BearingRelationPlan;
  readonly #jointId: b3JointId | null;
  readonly #receipt: BearingRuntimeReceipt;
  #disposed = false;

  private constructor(
    b3: Box3DModule,
    worldId: b3WorldId,
    bodyIds: Map<string, b3BodyId>,
    relation: BearingRelationPlan,
    jointId: b3JointId | null,
    receipt: BearingRuntimeReceipt,
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
    options: BearingPhysicsOptions = {},
  ): Promise<BearingPhysics> {
    const b3 = await Box3DFactory();
    const version = b3.b3GetVersion();
    if (version.major !== 0 || version.minor !== 1 || version.revision !== 0) {
      throw new Error(`ANVIL-02 expects Box3D 0.1.0, got ${version.major}.${version.minor}.${version.revision}`);
    }

    const materialById = new Map(materials.map((material) => [material.id, material] as const));
    const knownBodyIds = new Set(compilation.physicalPlan.bodies.map((body) => body.id));
    const linearById = options.initialLinearVelocityByPlanBodyId ?? {};
    const angularById = options.initialAngularVelocityByPlanBodyId ?? {};
    for (const bodyId of [...Object.keys(linearById), ...Object.keys(angularById)]) {
      if (!knownBodyIds.has(bodyId)) throw new Error(`bearing runtime motion references unknown body ${bodyId}`);
    }

    const gravity = options.gravity ?? ZERO;
    finiteVec3(gravity, "bearing runtime gravity");
    const worldDef = b3.b3DefaultWorldDef();
    worldDef.gravity = { ...gravity };
    worldDef.workerCount = 0;
    const worldId = b3.b3CreateWorld(worldDef);
    const bodyIds = new Map<string, b3BodyId>();
    const massErrors: Record<string, number> = {};
    const centerErrors: Record<string, number> = {};

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
          finiteVec3(linear, `bearing initial linear velocity ${body.id}`);
          bodyDef.linearVelocity = { ...linear };
        }
        if (angular !== undefined) {
          finiteVec3(angular, `bearing initial angular velocity ${body.id}`);
          bodyDef.angularVelocity = { ...angular };
        }
        const bodyId = b3.b3CreateBody(worldId, bodyDef);
        bodyIds.set(body.id, bodyId);

        for (let index = 0; index < body.colliders.length; index += 1) {
          const collider = body.colliders[index];
          if (collider === undefined) continue;
          const material = materialById.get(collider.materialId);
          if (material === undefined) throw new Error(`missing material ${collider.materialId}`);
          const hull = b3.b3CreateHull(boxHullPoints(body, index));
          if (hull === null || hull === undefined) throw new Error(`Box3D rejected bearing collider ${collider.id}`);
          const shapeDef = b3.b3DefaultShapeDef();
          shapeDef.density = material.densityKgM3;
          shapeDef.baseMaterial.friction = material.friction;
          // Isolate the relation constraint: no body-body contacts may rescue the no-relation control.
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
      if (options.createRelation ?? true) {
        const bodyA = bodyIds.get(compilation.relation.bodyAId);
        const bodyB = bodyIds.get(compilation.relation.bodyBId);
        if (bodyA === undefined || bodyB === undefined) throw new Error("bearing relation references missing runtime body");
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

      return new BearingPhysics(
        b3,
        worldId,
        bodyIds,
        compilation.relation,
        jointId,
        {
          engineVersion: `${version.major}.${version.minor}.${version.revision}`,
          relationCreated: jointId !== null,
          bodyMassErrorsKg: massErrors,
          bodyLocalCenterErrorsM: centerErrors,
        },
      );
    } catch (error: unknown) {
      if (b3.b3World_IsValid(worldId)) b3.b3DestroyWorld(worldId);
      throw error;
    }
  }

  get receipt(): BearingRuntimeReceipt {
    this.#assertActive();
    return this.#receipt;
  }

  step(stepCount = 1): void {
    this.#assertActive();
    if (!Number.isInteger(stepCount) || stepCount < 0) throw new Error("bearing stepCount must be a non-negative integer");
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

  bearingAngleRad(): number | null {
    this.#assertActive();
    return this.#jointId === null ? null : this.#b3.b3RevoluteJoint_GetAngle(this.#jointId);
  }

  bearingAnchorErrorM(): number {
    this.#assertActive();
    const snapshots = new Map(this.snapshots().map((snapshot) => [snapshot.planBodyId, snapshot] as const));
    const a = snapshots.get(this.#relation.bodyAId);
    const b = snapshots.get(this.#relation.bodyBId);
    if (a === undefined || b === undefined) throw new Error("bearing anchor measurement missing body snapshot");
    const worldA = worldPoint(a, this.#relation.localAnchorA);
    const worldB = worldPoint(b, this.#relation.localAnchorB);
    return magnitude(subtract(worldA, worldB));
  }

  dispose(): void {
    if (this.#disposed) return;
    if (this.#b3.b3World_IsValid(this.#worldId)) this.#b3.b3DestroyWorld(this.#worldId);
    this.#disposed = true;
  }

  #assertActive(): void {
    if (this.#disposed) throw new Error("bearing physics runtime has been disposed");
  }
}

export function velocityForRotationAboutPivot(angularVelocity: Vec3, centerOfMass: Vec3, pivot: Vec3): Vec3 {
  return cross(angularVelocity, subtract(centerOfMass, pivot));
}

export function rotateAxisWithJointFrame(axis: Vec3): Vec3 {
  return rotateVec3ByQuat(jointFrameForAxis(axis), { x: 0, y: 0, z: 1 });
}
