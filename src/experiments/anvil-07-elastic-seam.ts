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

export type ElasticSeamVariant = "RIGID" | "ELASTIC" | "FREE";
export type ElasticSeamFace = "x-" | "x+" | "y-" | "y+" | "z-" | "z+";

export interface ElasticSeamEndpoint {
  readonly cellId: string;
  readonly face: ElasticSeamFace;
}

/**
 * Experiment-local authored compliant binding for ANVIL-07.
 *
 * Deliberately absent: Box3D joint/body ids, hertz, damping ratio, generic Bond
 * kinds, breakage, plasticity, contacts, functions or control semantics.
 */
export interface ElasticSeamMark {
  readonly id: string;
  readonly endpointA: ElasticSeamEndpoint;
  readonly endpointB: ElasticSeamEndpoint;
  readonly normalStiffnessNPerM: number;
  readonly normalDampingNsPerM: number;
}

export interface ElasticSeamFixture {
  readonly matter: MatterDocument;
  readonly seam: ElasticSeamMark;
}

export interface ElasticSeamMeasurementPlan {
  readonly endpointA: ElasticSeamEndpoint;
  readonly endpointB: ElasticSeamEndpoint;
  readonly bodyAId: string;
  readonly bodyBId: string;
  readonly normalWorld: Vec3;
  readonly restPointWorld: Vec3;
  readonly localAnchorA: Vec3;
  readonly localAnchorB: Vec3;
}

/** Disposable experiment-local solver relation. */
export interface ElasticSeamRelationPlan extends ElasticSeamMeasurementPlan {
  readonly schema: "anvil-07-elastic-seam-relation/0";
  readonly sourceSeamId: string;
  readonly stiffnessNPerM: number;
  readonly dampingNsPerM: number;
  readonly effectiveMassKg: number;
  readonly linearHertz: number;
  readonly linearDampingRatio: number;
}

export interface ElasticSeamCompilation {
  readonly variant: ElasticSeamVariant;
  readonly physicalPlan: PhysicalPlan;
  readonly measurement: ElasticSeamMeasurementPlan;
  readonly relation: ElasticSeamRelationPlan | null;
}

export interface ElasticSeamRuntimeReceipt {
  readonly engineVersion: string;
  readonly variant: ElasticSeamVariant;
  readonly relationCreated: boolean;
  readonly bodyCount: number;
  readonly bodyMassErrorsKg: Readonly<Record<string, number>>;
  readonly bodyLocalCenterErrorsM: Readonly<Record<string, number>>;
  readonly gravity: Vec3;
  readonly contactsDisabled: true;
  readonly linearDampingPerBody: 0;
  readonly angularDampingPerBody: 0;
  readonly motionLocks: {
    readonly linearX: false;
    readonly linearY: true;
    readonly linearZ: true;
    readonly angularX: true;
    readonly angularY: true;
    readonly angularZ: true;
  };
}

export interface ElasticSeamDiagnostics {
  readonly extensionM: number;
  readonly relativeSpeedMps: number;
  readonly linearMomentumMagnitudeKgMps: number;
  readonly barycenterDisplacementM: number;
}

const FACE_VECTORS: Readonly<Record<ElasticSeamFace, GridPosition>> = Object.freeze({
  "x-": { x: -1, y: 0, z: 0 },
  "x+": { x: 1, y: 0, z: 0 },
  "y-": { x: 0, y: -1, z: 0 },
  "y+": { x: 0, y: 1, z: 0 },
  "z-": { x: 0, y: 0, z: -1 },
  "z+": { x: 0, y: 0, z: 1 },
});

const ZERO: Vec3 = Object.freeze({ x: 0, y: 0, z: 0 });
const IDENTITY_BOX3D_QUAT = Object.freeze({ v: { x: 0, y: 0, z: 0 }, s: 1 });
const FIXED_DT = 1 / 60;
const SUBSTEPS = 4;

function endpointKey(endpoint: ElasticSeamEndpoint): string {
  return `${endpoint.cellId}@${endpoint.face}`;
}

function canonicalEndpoints(
  a: ElasticSeamEndpoint,
  b: ElasticSeamEndpoint,
): readonly [ElasticSeamEndpoint, ElasticSeamEndpoint] {
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

function negate(value: Vec3): Vec3 {
  return scale(value, -1);
}

function sameVector(a: Vec3, b: Vec3): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

function finiteVec3(value: Vec3, label: string): void {
  if (![value.x, value.y, value.z].every(Number.isFinite)) throw new Error(`${label} must be finite`);
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
  if (body === undefined) throw new Error(`elastic seam compilation missing body ${bodyId}`);
  return body;
}

function validateSeam(mark: ElasticSeamMark): void {
  if (mark.id.trim().length === 0) throw new Error("elastic seam id must be non-empty");
  if (!Number.isFinite(mark.normalStiffnessNPerM) || mark.normalStiffnessNPerM <= 0) {
    throw new Error("elastic seam stiffness must be finite and positive");
  }
  if (!Number.isFinite(mark.normalDampingNsPerM) || mark.normalDampingNsPerM < 0) {
    throw new Error("elastic seam damping must be finite and non-negative");
  }
}

export function compileElasticSeam(
  authored: ElasticSeamFixture,
  variant: ElasticSeamVariant,
): ElasticSeamCompilation {
  validateSeam(authored.seam);
  const [endpointA, endpointB] = canonicalEndpoints(authored.seam.endpointA, authored.seam.endpointB);
  if (endpointA.cellId === endpointB.cellId) {
    throw new Error("elastic seam endpoints must reference two distinct cells");
  }

  const byId = new Map(authored.matter.cells.map((cell) => [cell.id, cell] as const));
  const cellA = byId.get(endpointA.cellId);
  const cellB = byId.get(endpointB.cellId);
  if (cellA === undefined || cellB === undefined) {
    throw new Error(`elastic seam references unknown endpoint cell: ${endpointA.cellId} <-> ${endpointB.cellId}`);
  }

  const faceA = FACE_VECTORS[endpointA.face];
  const faceB = FACE_VECTORS[endpointB.face];
  if (!sameVector(faceB, negate(faceA))) {
    throw new Error(`elastic seam endpoint faces must be opposite: ${endpointA.face} <-> ${endpointB.face}`);
  }
  const aToB: Vec3 = {
    x: cellB.grid.x - cellA.grid.x,
    y: cellB.grid.y - cellA.grid.y,
    z: cellB.grid.z - cellA.grid.z,
  };
  if (!sameVector(aToB, faceA)) {
    throw new Error(`elastic seam endpoints are not adjacent through the declared faces: ${endpointA.cellId} <-> ${endpointB.cellId}`);
  }

  const baseline = compileMatter(authored.matter);
  const baselineBodyA = baseline.cellToBody[cellA.id];
  const baselineBodyB = baseline.cellToBody[cellB.id];
  if (baselineBodyA === undefined || baselineBodyB === undefined) {
    throw new Error("elastic seam baseline provenance missing endpoint body");
  }
  if (baselineBodyA !== baselineBodyB) {
    throw new Error("elastic seam endpoints are already in different rigid islands before the seam mark");
  }

  const blocked: BlockedFaceConnection = [cellA.id, cellB.id];
  const physicalPlan = variant === "RIGID"
    ? baseline
    : compileMatter(authored.matter, { blockedFaceConnections: [blocked] });

  const bodyAId = physicalPlan.cellToBody[cellA.id];
  const bodyBId = physicalPlan.cellToBody[cellB.id];
  if (bodyAId === undefined || bodyBId === undefined) {
    throw new Error("elastic seam compiled provenance missing endpoint body");
  }
  if (variant !== "RIGID" && bodyAId === bodyBId) {
    throw new Error("elastic seam does not split rigid connectivity; an alternate rigid path bypasses the interface");
  }
  if (variant === "RIGID" && bodyAId !== bodyBId) {
    throw new Error("rigid control unexpectedly compiled the seam endpoints into separate bodies");
  }

  const bodyA = bodyFor(physicalPlan, bodyAId);
  const bodyB = bodyFor(physicalPlan, bodyBId);
  const restPointWorld = add(
    cellCenter(cellA, authored.matter.cellSizeM),
    scale(faceA, authored.matter.cellSizeM / 2),
  );
  const measurement: ElasticSeamMeasurementPlan = {
    endpointA: { ...endpointA },
    endpointB: { ...endpointB },
    bodyAId,
    bodyBId,
    normalWorld: { ...faceA },
    restPointWorld,
    localAnchorA: subtract(restPointWorld, bodyA.centerOfMassWorld),
    localAnchorB: subtract(restPointWorld, bodyB.centerOfMassWorld),
  };

  if (variant !== "ELASTIC") {
    return { variant, physicalPlan, measurement, relation: null };
  }

  const effectiveMassKg = 1 / (1 / bodyA.massKg + 1 / bodyB.massKg);
  const omegaNaturalRadPerS = Math.sqrt(authored.seam.normalStiffnessNPerM / effectiveMassKg);
  const linearHertz = omegaNaturalRadPerS / (2 * Math.PI);
  const linearDampingRatio = authored.seam.normalDampingNsPerM /
    (2 * Math.sqrt(authored.seam.normalStiffnessNPerM * effectiveMassKg));
  if (![effectiveMassKg, linearHertz, linearDampingRatio].every(Number.isFinite)) {
    throw new Error("elastic seam derived solver tuning must be finite");
  }
  if (effectiveMassKg <= 0 || linearHertz <= 0 || linearDampingRatio < 0) {
    throw new Error("elastic seam derived solver tuning is outside its physical domain");
  }

  return {
    variant,
    physicalPlan,
    measurement,
    relation: {
      schema: "anvil-07-elastic-seam-relation/0",
      sourceSeamId: authored.seam.id.trim(),
      ...measurement,
      stiffnessNPerM: authored.seam.normalStiffnessNPerM,
      dampingNsPerM: authored.seam.normalDampingNsPerM,
      effectiveMassKg,
      linearHertz,
      linearDampingRatio,
    },
  };
}

export function createElasticSeamFixture(): ElasticSeamFixture {
  const material: MaterialDefinition = {
    id: "anvil-07-alloy",
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
      revision: "anvil-07-elastic-seam/c0-v1",
      cellSizeM: 0.5,
      materials: [material],
      cells,
    },
    seam: {
      id: "elastic-seam:0",
      endpointA: { cellId: "a:2", face: "x+" },
      endpointB: { cellId: "b:0", face: "x-" },
      normalStiffnessNPerM: 10_000,
      normalDampingNsPerM: 1_800,
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

function rotateVec3ByQuat(rotation: Quat, value: Vec3): Vec3 {
  const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
  const t = cross(qv, value);
  const doubled = scale(t, 2);
  return add(value, add(scale(doubled, rotation.w), cross(qv, doubled)));
}

export class ElasticSeamPhysics {
  readonly #b3: Box3DModule;
  readonly #worldId: b3WorldId;
  readonly #bodyIds: Map<string, b3BodyId>;
  readonly #compilation: ElasticSeamCompilation;
  readonly #jointId: b3JointId | null;
  readonly #receipt: ElasticSeamRuntimeReceipt;
  readonly #runtimeMassByBodyId: Map<string, number>;
  readonly #initialBarycenter: Vec3;
  readonly #initialExtensionM: number;
  #disposed = false;

  private constructor(
    b3: Box3DModule,
    worldId: b3WorldId,
    bodyIds: Map<string, b3BodyId>,
    compilation: ElasticSeamCompilation,
    jointId: b3JointId | null,
    receipt: ElasticSeamRuntimeReceipt,
    runtimeMassByBodyId: Map<string, number>,
  ) {
    this.#b3 = b3;
    this.#worldId = worldId;
    this.#bodyIds = bodyIds;
    this.#compilation = compilation;
    this.#jointId = jointId;
    this.#receipt = receipt;
    this.#runtimeMassByBodyId = runtimeMassByBodyId;
    this.#initialBarycenter = this.#barycenterWorld();
    this.#initialExtensionM = this.#rawExtensionM();
  }

  static async create(
    compilation: ElasticSeamCompilation,
    materials: readonly MaterialDefinition[],
  ): Promise<ElasticSeamPhysics> {
    const b3 = await Box3DFactory();
    const version = b3.b3GetVersion();
    if (version.major !== 0 || version.minor !== 1 || version.revision !== 0) {
      throw new Error(`ANVIL-07 expects Box3D 0.1.0, got ${version.major}.${version.minor}.${version.revision}`);
    }

    const worldDef = b3.b3DefaultWorldDef();
    worldDef.gravity = { ...ZERO };
    worldDef.workerCount = 0;
    const worldId = b3.b3CreateWorld(worldDef);
    const materialById = new Map(materials.map((material) => [material.id, material] as const));
    const bodyIds = new Map<string, b3BodyId>();
    const runtimeMassByBodyId = new Map<string, number>();
    const massErrors: Record<string, number> = {};
    const centerErrors: Record<string, number> = {};

    try {
      for (const body of compilation.physicalPlan.bodies) {
        const bodyDef = b3.b3DefaultBodyDef();
        bodyDef.type = b3.b3BodyType.b3_dynamicBody;
        bodyDef.position = { ...body.centerOfMassWorld };
        bodyDef.linearDamping = 0;
        bodyDef.angularDamping = 0;
        bodyDef.motionLocks = {
          linearX: false,
          linearY: true,
          linearZ: true,
          angularX: true,
          angularY: true,
          angularZ: true,
        };
        bodyDef.enableSleep = false;
        bodyDef.isAwake = true;
        const bodyId = b3.b3CreateBody(worldId, bodyDef);
        bodyIds.set(body.id, bodyId);

        for (let index = 0; index < body.colliders.length; index += 1) {
          const collider = body.colliders[index];
          if (collider === undefined) continue;
          const material = materialById.get(collider.materialId);
          if (material === undefined) throw new Error(`missing material ${collider.materialId}`);
          const hull = b3.b3CreateHull(boxHullPoints(body, index));
          if (hull === null || hull === undefined) throw new Error(`Box3D rejected elastic seam collider ${collider.id}`);
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
        runtimeMassByBodyId.set(body.id, mass.mass);
        massErrors[body.id] = mass.mass - body.massKg;
        centerErrors[body.id] = Math.hypot(mass.center.x, mass.center.y, mass.center.z);
      }

      let jointId: b3JointId | null = null;
      if (compilation.relation !== null) {
        const bodyA = bodyIds.get(compilation.relation.bodyAId);
        const bodyB = bodyIds.get(compilation.relation.bodyBId);
        if (bodyA === undefined || bodyB === undefined) {
          throw new Error("elastic seam relation references missing runtime body");
        }
        const def = b3.b3DefaultWeldJointDef();
        def.base.bodyIdA = bodyA;
        def.base.bodyIdB = bodyB;
        def.base.localFrameA = {
          p: { ...compilation.relation.localAnchorA },
          q: IDENTITY_BOX3D_QUAT,
        };
        def.base.localFrameB = {
          p: { ...compilation.relation.localAnchorB },
          q: IDENTITY_BOX3D_QUAT,
        };
        def.base.collideConnected = false;
        def.linearHertz = compilation.relation.linearHertz;
        def.linearDampingRatio = compilation.relation.linearDampingRatio;
        def.angularHertz = 0;
        def.angularDampingRatio = 1;
        jointId = b3.b3CreateWeldJoint(worldId, def);
      }

      return new ElasticSeamPhysics(
        b3,
        worldId,
        bodyIds,
        compilation,
        jointId,
        {
          engineVersion: `${version.major}.${version.minor}.${version.revision}`,
          variant: compilation.variant,
          relationCreated: jointId !== null,
          bodyCount: bodyIds.size,
          bodyMassErrorsKg: massErrors,
          bodyLocalCenterErrorsM: centerErrors,
          gravity: { ...ZERO },
          contactsDisabled: true,
          linearDampingPerBody: 0,
          angularDampingPerBody: 0,
          motionLocks: {
            linearX: false,
            linearY: true,
            linearZ: true,
            angularX: true,
            angularY: true,
            angularZ: true,
          },
        },
        runtimeMassByBodyId,
      );
    } catch (error: unknown) {
      if (b3.b3World_IsValid(worldId)) b3.b3DestroyWorld(worldId);
      throw error;
    }
  }

  get receipt(): ElasticSeamRuntimeReceipt {
    this.#assertActive();
    return this.#receipt;
  }

  applyOutwardLoad(forceN: number): void {
    this.#assertActive();
    if (!Number.isFinite(forceN) || forceN < 0) {
      throw new Error("elastic seam outward load must be finite and non-negative");
    }
    const measurement = this.#compilation.measurement;
    const bodyA = this.#runtimeBody(measurement.bodyAId);
    const bodyB = this.#runtimeBody(measurement.bodyBId);
    const pointA = this.#worldAnchor(measurement.bodyAId, measurement.localAnchorA);
    const pointB = this.#worldAnchor(measurement.bodyBId, measurement.localAnchorB);
    const force = scale(measurement.normalWorld, forceN);
    this.#b3.b3Body_ApplyForce(bodyA, negate(force), pointA, true);
    this.#b3.b3Body_ApplyForce(bodyB, force, pointB, true);
  }

  step(stepCount = 1): void {
    this.#assertActive();
    if (!Number.isInteger(stepCount) || stepCount < 0) {
      throw new Error("elastic seam stepCount must be a non-negative integer");
    }
    for (let index = 0; index < stepCount; index += 1) {
      this.#b3.b3World_Step(this.#worldId, FIXED_DT, SUBSTEPS);
    }
  }

  diagnostics(): ElasticSeamDiagnostics {
    this.#assertActive();
    const measurement = this.#compilation.measurement;
    const velocityA = this.#b3.b3Body_GetLinearVelocity(this.#runtimeBody(measurement.bodyAId));
    const velocityB = this.#b3.b3Body_GetLinearVelocity(this.#runtimeBody(measurement.bodyBId));
    const relativeVelocity = subtract(
      { x: velocityB.x, y: velocityB.y, z: velocityB.z },
      { x: velocityA.x, y: velocityA.y, z: velocityA.z },
    );
    const momentum = this.#linearMomentum();
    return {
      extensionM: this.#rawExtensionM() - this.#initialExtensionM,
      relativeSpeedMps: dot(relativeVelocity, measurement.normalWorld),
      linearMomentumMagnitudeKgMps: magnitude(momentum),
      barycenterDisplacementM: magnitude(subtract(this.#barycenterWorld(), this.#initialBarycenter)),
    };
  }

  dispose(): void {
    if (this.#disposed) return;
    if (this.#b3.b3World_IsValid(this.#worldId)) this.#b3.b3DestroyWorld(this.#worldId);
    this.#disposed = true;
  }

  #runtimeBody(planBodyId: string): b3BodyId {
    const bodyId = this.#bodyIds.get(planBodyId);
    if (bodyId === undefined) throw new Error(`elastic seam runtime missing body ${planBodyId}`);
    return bodyId;
  }

  #worldAnchor(planBodyId: string, localAnchor: Vec3): Vec3 {
    const bodyId = this.#runtimeBody(planBodyId);
    const position = this.#b3.b3Body_GetPosition(bodyId);
    const rotation = this.#b3.b3Body_GetRotation(bodyId);
    const rotated = rotateVec3ByQuat(
      { x: rotation.v.x, y: rotation.v.y, z: rotation.v.z, w: rotation.s },
      localAnchor,
    );
    return add({ x: position.x, y: position.y, z: position.z }, rotated);
  }

  #rawExtensionM(): number {
    const measurement = this.#compilation.measurement;
    const pointA = this.#worldAnchor(measurement.bodyAId, measurement.localAnchorA);
    const pointB = this.#worldAnchor(measurement.bodyBId, measurement.localAnchorB);
    return dot(subtract(pointB, pointA), measurement.normalWorld);
  }

  #linearMomentum(): Vec3 {
    let total = { ...ZERO };
    for (const [planBodyId, bodyId] of this.#bodyIds) {
      const mass = this.#runtimeMassByBodyId.get(planBodyId);
      if (mass === undefined) throw new Error(`elastic seam runtime mass missing body ${planBodyId}`);
      const velocity = this.#b3.b3Body_GetLinearVelocity(bodyId);
      total = add(total, scale({ x: velocity.x, y: velocity.y, z: velocity.z }, mass));
    }
    return total;
  }

  #barycenterWorld(): Vec3 {
    let weighted = { ...ZERO };
    let totalMass = 0;
    for (const [planBodyId, bodyId] of this.#bodyIds) {
      const mass = this.#runtimeMassByBodyId.get(planBodyId);
      if (mass === undefined) throw new Error(`elastic seam runtime mass missing body ${planBodyId}`);
      const position = this.#b3.b3Body_GetPosition(bodyId);
      weighted = add(weighted, scale({ x: position.x, y: position.y, z: position.z }, mass));
      totalMass += mass;
    }
    if (!Number.isFinite(totalMass) || totalMass <= 0) throw new Error("elastic seam runtime total mass must be positive");
    return scale(weighted, 1 / totalMass);
  }

  #assertActive(): void {
    if (this.#disposed) throw new Error("elastic seam physics is disposed");
  }
}
