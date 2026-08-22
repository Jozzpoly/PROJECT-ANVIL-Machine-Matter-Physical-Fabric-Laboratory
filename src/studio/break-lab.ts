import Box3DFactory from "box3d.js/inline";
import type { Box3DModule, b3BodyId, b3JointId, b3WorldId } from "box3d.js";
import { compileMatter, type BlockedFaceConnection } from "../compiler.js";
import {
  addVec3,
  magnitudeVec3,
  subtractVec3,
} from "../foundation/spatial.js";
import type {
  GridPosition,
  MaterialDefinition,
  MatterCell,
  PhysicalPlan,
  RigidBodyPlan,
  Vec3,
} from "../model.js";
import {
  jointFrameForAxis,
  type BearingAxis,
  type BearingEndpoint,
  type BearingMark,
  type BearingRuntimeSnapshot,
} from "../experiments/anvil-02-bearing.js";
import type { TorquePatch } from "../experiments/anvil-06-torque-patch.js";
import type {
  StudioRuntimeActivation,
  StudioRuntimeFrame,
  StudioRuntimeIdSource,
  StudioRuntimePlan,
  StudioRuntimeBearingPlan,
} from "./runtime.js";
import type { StudioSourceV0 } from "./workspace.js";

export interface BreakLabRelationPlan extends StudioRuntimeBearingPlan {
  readonly axisWorld: Vec3;
}

export interface BreakLabTorquePlan {
  readonly sourcePatchId: string;
  readonly sourceBearingId: string;
  readonly target: BearingEndpoint;
  readonly effortNm: number;
  readonly bodyAId: string;
  readonly bodyBId: string;
  readonly axisWorld: Vec3;
  readonly torqueAWorld: Vec3;
  readonly torqueBWorld: Vec3;
}

export interface BreakLabCompilation {
  readonly schema: "o1x-break-lab-v0/0";
  readonly physicalPlan: PhysicalPlan;
  readonly relations: readonly BreakLabRelationPlan[];
  readonly torque: BreakLabTorquePlan;
}

export interface BreakLabClassification {
  readonly eligibility: "ELIGIBLE" | "INELIGIBLE";
  readonly reason: string;
  readonly compilation: BreakLabCompilation | null;
}

export interface BreakLabRuntimePlan extends StudioRuntimePlan {
  readonly experimental: true;
  readonly bearings: readonly BreakLabRelationPlan[];
}

export interface BreakLabRuntimeReceipt {
  readonly engineVersion: string;
  readonly bodyCount: number;
  readonly jointCount: number;
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

function sameEndpoint(a: BearingEndpoint, b: BearingEndpoint): boolean {
  return a.cellId === b.cellId && a.face === b.face;
}

function patchTargetsBearing(patch: TorquePatch, bearing: BearingMark): boolean {
  return sameEndpoint(patch.target, bearing.endpointA) || sameEndpoint(patch.target, bearing.endpointB);
}

function cellCenter(cell: MatterCell, cellSizeM: number): Vec3 {
  return {
    x: (cell.grid.x + 0.5) * cellSizeM,
    y: (cell.grid.y + 0.5) * cellSizeM,
    z: (cell.grid.z + 0.5) * cellSizeM,
  };
}

function bodyFor(plan: PhysicalPlan, id: string): RigidBodyPlan {
  const body = plan.bodies.find((candidate) => candidate.id === id);
  if (body === undefined) throw new Error(`Break Lab missing compiled body ${id}`);
  return body;
}

function validateBearing(
  source: StudioSourceV0,
  bearing: BearingMark,
): {
  readonly source: BearingMark;
  readonly endpointA: BearingEndpoint;
  readonly endpointB: BearingEndpoint;
  readonly cellA: MatterCell;
  readonly cellB: MatterCell;
} {
  const id = bearing.id.trim();
  if (id.length === 0) throw new Error("Bearing id must be non-empty");
  const [endpointA, endpointB] = canonicalEndpoints(bearing.endpointA, bearing.endpointB);
  if (endpointA.cellId === endpointB.cellId) throw new Error(`Bearing ${id} endpoints must reference two cells`);

  const byId = new Map(source.matter.cells.map((cell) => [cell.id, cell] as const));
  const cellA = byId.get(endpointA.cellId);
  const cellB = byId.get(endpointB.cellId);
  if (cellA === undefined || cellB === undefined) throw new Error(`Bearing ${id} references missing Matter`);

  const faceA = FACE_VECTORS[endpointA.face];
  const faceB = FACE_VECTORS[endpointB.face];
  if (faceA.x !== -faceB.x || faceA.y !== -faceB.y || faceA.z !== -faceB.z) {
    throw new Error(`Bearing ${id} faces are not opposite`);
  }
  const delta = {
    x: cellB.grid.x - cellA.grid.x,
    y: cellB.grid.y - cellA.grid.y,
    z: cellB.grid.z - cellA.grid.z,
  };
  if (delta.x !== faceA.x || delta.y !== faceA.y || delta.z !== faceA.z) {
    throw new Error(`Bearing ${id} endpoints are not face-adjacent`);
  }
  const axis = AXIS_VECTORS[bearing.freeAxis];
  if (Math.abs(dot(axis, faceA)) > 0) throw new Error(`Bearing ${id} axis is normal to its shared face`);

  return {
    source: { ...bearing, id },
    endpointA: { ...endpointA },
    endpointB: { ...endpointB },
    cellA,
    cellB,
  };
}

export function compileBreakLab(source: StudioSourceV0): BreakLabCompilation {
  if (source.bearings.length < 2) throw new Error("Break Lab requires at least two authored Bearings");
  if (source.torquePatches.length !== 1) throw new Error("Break Lab v0 requires exactly one TorquePatch");

  const ids = new Set<string>();
  const seams = new Set<string>();
  const prepared = source.bearings.map((bearing) => {
    const validated = validateBearing(source, bearing);
    if (!ids.add(validated.source.id)) throw new Error(`duplicate Bearing id: ${validated.source.id}`);
    const key = seamKey(validated.endpointA, validated.endpointB);
    if (!seams.add(key)) throw new Error(`duplicate Bearing seam: ${key}`);
    return validated;
  }).sort((left, right) => left.source.id.localeCompare(right.source.id));

  const blockedFaceConnections: BlockedFaceConnection[] = prepared.map(({ cellA, cellB }) => [cellA.id, cellB.id]);
  const physicalPlan = compileMatter(source.matter, { blockedFaceConnections });

  const relations: BreakLabRelationPlan[] = prepared.map(({ source: bearing, endpointA, endpointB, cellA }) => {
    const bodyAId = physicalPlan.cellToBody[endpointA.cellId];
    const bodyBId = physicalPlan.cellToBody[endpointB.cellId];
    if (bodyAId === undefined || bodyBId === undefined) throw new Error(`Bearing ${bearing.id} lost compiled provenance`);
    if (bodyAId === bodyBId) {
      throw new Error(`Bearing ${bearing.id} still has an alternate rigid bypass in the composed topology`);
    }

    const bodyA = bodyFor(physicalPlan, bodyAId);
    const bodyB = bodyFor(physicalPlan, bodyBId);
    const faceA = FACE_VECTORS[endpointA.face];
    const axisWorld = AXIS_VECTORS[bearing.freeAxis];
    const pivotWorld = addVec3(
      cellCenter(cellA, source.matter.cellSizeM),
      scale(faceA, source.matter.cellSizeM / 2),
    );

    return {
      sourceBearingId: bearing.id,
      endpointA,
      endpointB,
      bodyAId,
      bodyBId,
      localAnchorA: subtractVec3(pivotWorld, bodyA.centerOfMassWorld),
      localAnchorB: subtractVec3(pivotWorld, bodyB.centerOfMassWorld),
      localAxisA: { ...axisWorld },
      localAxisB: { ...axisWorld },
      axisWorld: { ...axisWorld },
    };
  });

  const patch = source.torquePatches[0];
  if (patch === undefined || patch.id.trim().length === 0 || !Number.isFinite(patch.effortNm)) {
    throw new Error("Break Lab TorquePatch must have a non-empty id and finite effort");
  }
  const bearingMatches = source.bearings.filter((bearing) => patchTargetsBearing(patch, bearing));
  if (bearingMatches.length !== 1) throw new Error("Break Lab TorquePatch must target exactly one authored Bearing endpoint");
  const targetBearing = bearingMatches[0];
  if (targetBearing === undefined) throw new Error("Break Lab lost TorquePatch Bearing target");
  const targetRelation = relations.find((relation) => relation.sourceBearingId === targetBearing.id);
  if (targetRelation === undefined) throw new Error("Break Lab TorquePatch target has no composed Bearing relation");

  const torqueBWorld = scale(targetRelation.axisWorld, patch.effortNm);
  const torqueAWorld = scale(torqueBWorld, -1);
  if (magnitudeVec3(addVec3(torqueAWorld, torqueBWorld)) > 1e-12) {
    throw new Error("Break Lab torque pair is not equal and opposite");
  }

  return {
    schema: "o1x-break-lab-v0/0",
    physicalPlan,
    relations,
    torque: {
      sourcePatchId: patch.id,
      sourceBearingId: targetBearing.id,
      target: { ...patch.target },
      effortNm: patch.effortNm,
      bodyAId: targetRelation.bodyAId,
      bodyBId: targetRelation.bodyBId,
      axisWorld: { ...targetRelation.axisWorld },
      torqueAWorld,
      torqueBWorld,
    },
  };
}

export function classifyBreakLabSource(source: StudioSourceV0): BreakLabClassification {
  try {
    const compilation = compileBreakLab(source);
    return {
      eligibility: "ELIGIBLE",
      reason: `${compilation.relations.length} Bearings can be attempted with one active TorquePatch.`,
      compilation,
    };
  } catch (error: unknown) {
    return {
      eligibility: "INELIGIBLE",
      reason: error instanceof Error ? error.message : String(error),
      compilation: null,
    };
  }
}

function boxHullPoints(body: RigidBodyPlan, colliderIndex: number): number[] {
  const collider = body.colliders[colliderIndex];
  if (collider === undefined) throw new Error(`Break Lab missing collider ${colliderIndex}`);
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
  if (target === undefined) throw new Error("Break Lab runtime lost targeted Bearing relation");
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

export class BreakLabRuntimeSession {
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
  ): Promise<BreakLabRuntimeSession> {
    const compilation = compileBreakLab(source);
    const sessionId = idSource().trim();
    if (sessionId.length === 0) throw new Error("Break Lab runtime id source returned an empty id");
    const plan = runtimePlan(compilation);
    const b3 = await Box3DFactory();
    const version = b3.b3GetVersion();
    if (version.major !== 0 || version.minor !== 1 || version.revision !== 0) {
      throw new Error(`Break Lab expects Box3D 0.1.0, got ${version.major}.${version.minor}.${version.revision}`);
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

        for (let index = 0; index < body.colliders.length; index += 1) {
          const collider = body.colliders[index];
          if (collider === undefined) continue;
          const material = materialById.get(collider.materialId);
          if (material === undefined) throw new Error(`Break Lab missing material ${collider.materialId}`);
          const hull = b3.b3CreateHull(boxHullPoints(body, index));
          if (hull === null || hull === undefined) throw new Error(`Box3D rejected Break Lab collider ${collider.id}`);
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

      for (const relation of compilation.relations) {
        const bodyA = bodyIds.get(relation.bodyAId);
        const bodyB = bodyIds.get(relation.bodyBId);
        if (bodyA === undefined || bodyB === undefined) throw new Error(`Break Lab relation ${relation.sourceBearingId} lost runtime body`);
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
      return new BreakLabRuntimeSession(
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

  setActivation(value: StudioRuntimeActivation): void {
    this.#assertActive();
    if (value !== "OFF" && value !== "ON") throw new Error(`Break Lab activation is invalid: ${String(value)}`);
    this.#activation = value;
  }

  step(stepCount = 1): StudioRuntimeFrame {
    this.#assertActive();
    if (!Number.isInteger(stepCount) || stepCount < 0) throw new Error("Break Lab stepCount must be a non-negative integer");
    const bodyA = this.#bodyIds.get(this.#compilation.torque.bodyAId);
    const bodyB = this.#bodyIds.get(this.#compilation.torque.bodyBId);
    if (bodyA === undefined || bodyB === undefined) throw new Error("Break Lab torque action lost runtime body");

    for (let index = 0; index < stepCount; index += 1) {
      if (this.#activation === "ON") {
        this.#b3.b3Body_ApplyTorque(bodyA, { ...this.#compilation.torque.torqueAWorld }, true);
        this.#b3.b3Body_ApplyTorque(bodyB, { ...this.#compilation.torque.torqueBWorld }, true);
      }
      this.#b3.b3World_Step(this.#worldId, FIXED_DT, SUBSTEPS);
    }
    return this.frame();
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
      if (a === undefined || b === undefined) throw new Error(`Break Lab lost relation ${relation.sourceBearingId}`);
      const worldA = addVec3(a.position, rotateVec3ByQuat(a.rotation, relation.localAnchorA));
      const worldB = addVec3(b.position, rotateVec3ByQuat(b.rotation, relation.localAnchorB));
      result[relation.sourceBearingId] = magnitudeVec3(subtractVec3(worldA, worldB));
    }
    return result;
  }

  relativeAngularSpeedRadps(sourceBearingId: string): number {
    this.#assertActive();
    const relation = this.#compilation.relations.find((candidate) => candidate.sourceBearingId === sourceBearingId);
    if (relation === undefined) throw new Error(`Break Lab has no Bearing ${sourceBearingId}`);
    const snapshots = new Map(this.snapshots().map((snapshot) => [snapshot.planBodyId, snapshot] as const));
    const a = snapshots.get(relation.bodyAId);
    const b = snapshots.get(relation.bodyBId);
    if (a === undefined || b === undefined) throw new Error(`Break Lab lost Bearing snapshots for ${sourceBearingId}`);
    return dot(subtractVec3(b.angularVelocity, a.angularVelocity), relation.axisWorld);
  }

  dispose(): void {
    if (this.#disposed) return;
    if (this.#b3.b3World_IsValid(this.#worldId)) this.#b3.b3DestroyWorld(this.#worldId);
    this.#disposed = true;
  }

  #assertActive(): void {
    if (this.#disposed) throw new Error("Break Lab runtime has been disposed");
  }
}
