import Box3DFactory from "box3d.js/inline";
import type { Box3DModule, b3BodyId, b3WorldId } from "box3d.js";
import type { MaterialDefinition, PhysicalPlan, RigidBodyPlan, Vec3 } from "./model.js";
import type { Quat, RigidMotion } from "./foundation/spatial.js";
import type { PhysicsRuntime, RuntimeBodyMotionState } from "./foundation/runtime.js";

const FIXED_DT = 1 / 60;
const SUBSTEPS = 4;
const DEFAULT_SPAWN_OFFSET: Vec3 = { x: 0, y: 3.5, z: 0 };
const DEFAULT_GRAVITY: Vec3 = { x: 0, y: -10, z: 0 };

export interface RuntimeReceipt {
  readonly engineVersion: string;
  readonly bodyMassErrorsKg: Readonly<Record<string, number>>;
  readonly bodyLocalCenterErrorsM: Readonly<Record<string, number>>;
}

/**
 * Experiment/runtime construction options. Defaults preserve the accepted
 * ANVIL-00 viewer behavior. CUT may instead construct a free runtime from an
 * explicit solver-neutral motion state for every replacement body.
 */
export interface CollapsePhysicsOptions {
  readonly gravity?: Vec3;
  readonly includeGround?: boolean;
  readonly spawnOffset?: Vec3;
  readonly initialMotionByPlanBodyId?: Readonly<Record<string, RigidMotion>>;
}

/**
 * ANVIL-00 viewer compatibility shape. The promoted foundation contract is the
 * x/y/z/w `Quat`; v/s are temporary aliases used only by the original viewer.
 */
interface ViewerQuat extends Quat {
  readonly v: Vec3;
  readonly s: number;
}

export interface RuntimeBodySnapshot extends Omit<RuntimeBodyMotionState, "rotation"> {
  readonly rotation: ViewerQuat;
}

function boxHullPoints(body: RigidBodyPlan, colliderIndex: number): number[] {
  const collider = body.colliders[colliderIndex];
  if (collider === undefined) throw new Error(`missing collider ${colliderIndex}`);
  const center = {
    x: collider.centerWorld.x - body.centerOfMassWorld.x,
    y: collider.centerWorld.y - body.centerOfMassWorld.y,
    z: collider.centerWorld.z - body.centerOfMassWorld.z,
  };
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
  if (!Number.isFinite(value.x) || !Number.isFinite(value.y) || !Number.isFinite(value.z)) {
    throw new Error(`${label} must contain finite components`);
  }
}

function validateMotion(motion: RigidMotion, label: string): void {
  finiteVec3(motion.position, `${label}.position`);
  finiteVec3(motion.linearVelocity, `${label}.linearVelocity`);
  finiteVec3(motion.angularVelocity, `${label}.angularVelocity`);
  const q = motion.rotation;
  if (![q.x, q.y, q.z, q.w].every(Number.isFinite)) {
    throw new Error(`${label}.rotation must contain finite components`);
  }
  const length = Math.hypot(q.x, q.y, q.z, q.w);
  if (Math.abs(length - 1) > 1e-5) {
    throw new Error(`${label}.rotation must be normalized`);
  }
}

function toBox3DQuat(rotation: Quat): { v: Vec3; s: number } {
  return {
    v: { x: rotation.x, y: rotation.y, z: rotation.z },
    s: rotation.w,
  };
}

export class CollapsePhysics implements PhysicsRuntime<RuntimeBodySnapshot> {
  readonly #b3: Box3DModule;
  readonly #worldId: b3WorldId;
  readonly #bodyIds = new Map<string, b3BodyId>();
  readonly #receipt: RuntimeReceipt;
  #disposed = false;

  private constructor(
    b3: Box3DModule,
    worldId: b3WorldId,
    bodyIds: ReadonlyMap<string, b3BodyId>,
    receipt: RuntimeReceipt,
  ) {
    this.#b3 = b3;
    this.#worldId = worldId;
    for (const [key, value] of bodyIds) this.#bodyIds.set(key, value);
    this.#receipt = receipt;
  }

  static async create(
    plan: PhysicalPlan,
    materials: readonly MaterialDefinition[],
    options: CollapsePhysicsOptions = {},
  ): Promise<CollapsePhysics> {
    const b3 = await Box3DFactory();
    const version = b3.b3GetVersion();
    if (version.major !== 0 || version.minor !== 1 || version.revision !== 0) {
      throw new Error(
        `ANVIL expects Box3D 0.1.0, got ${version.major}.${version.minor}.${version.revision}`,
      );
    }

    const materialById = new Map(materials.map((material) => [material.id, material] as const));
    const planBodyIds = new Set(plan.bodies.map((body) => body.id));
    const initialMotion = options.initialMotionByPlanBodyId ?? {};
    for (const [planBodyId, motion] of Object.entries(initialMotion)) {
      if (!planBodyIds.has(planBodyId)) {
        throw new Error(`initial motion references unknown plan body ${planBodyId}`);
      }
      validateMotion(motion, `initial motion ${planBodyId}`);
    }

    const gravity = options.gravity ?? DEFAULT_GRAVITY;
    finiteVec3(gravity, "gravity");
    const spawnOffset = options.spawnOffset ?? DEFAULT_SPAWN_OFFSET;
    finiteVec3(spawnOffset, "spawnOffset");

    const worldDef = b3.b3DefaultWorldDef();
    worldDef.gravity = { ...gravity };
    worldDef.workerCount = 0;
    const worldId = b3.b3CreateWorld(worldDef);
    const bodyIds = new Map<string, b3BodyId>();
    const massErrors: Record<string, number> = {};
    const centerErrors: Record<string, number> = {};

    try {
      if (options.includeGround ?? true) {
        const groundDef = b3.b3DefaultBodyDef();
        groundDef.position = { x: 0, y: -0.5, z: 0 };
        const groundId = b3.b3CreateBody(worldId, groundDef);
        const groundShape = b3.b3DefaultShapeDef();
        groundShape.baseMaterial.friction = 0.8;
        b3.b3CreateBoxShape(groundId, groundShape, 8, 0.5, 6);
      }

      for (const body of plan.bodies) {
        const bodyDef = b3.b3DefaultBodyDef();
        bodyDef.type = b3.b3BodyType.b3_dynamicBody;
        const explicit = initialMotion[body.id];
        if (explicit !== undefined) {
          bodyDef.position = { ...explicit.position };
          bodyDef.rotation = toBox3DQuat(explicit.rotation);
          bodyDef.linearVelocity = { ...explicit.linearVelocity };
          bodyDef.angularVelocity = { ...explicit.angularVelocity };
          bodyDef.enableSleep = false;
          bodyDef.isAwake = true;
        } else {
          bodyDef.position = {
            x: body.centerOfMassWorld.x + spawnOffset.x,
            y: body.centerOfMassWorld.y + spawnOffset.y,
            z: body.centerOfMassWorld.z + spawnOffset.z,
          };
        }
        const bodyId = b3.b3CreateBody(worldId, bodyDef);
        bodyIds.set(body.id, bodyId);

        for (let index = 0; index < body.colliders.length; index += 1) {
          const collider = body.colliders[index];
          if (collider === undefined) continue;
          const material = materialById.get(collider.materialId);
          if (material === undefined) throw new Error(`missing material ${collider.materialId}`);
          const hull = b3.b3CreateHull(boxHullPoints(body, index));
          if (hull === null || hull === undefined) {
            throw new Error(`Box3D rejected collider hull ${collider.id}`);
          }
          const shapeDef = b3.b3DefaultShapeDef();
          shapeDef.density = material.densityKgM3;
          shapeDef.baseMaterial.friction = material.friction;
          try {
            b3.b3CreateHullShape(bodyId, shapeDef, hull);
          } finally {
            (hull as unknown as { delete?: () => void }).delete?.();
          }
        }

        const massData = b3.b3Body_GetMassData(bodyId);
        massErrors[body.id] = massData.mass - body.massKg;
        centerErrors[body.id] = Math.hypot(
          massData.center.x,
          massData.center.y,
          massData.center.z,
        );
      }

      return new CollapsePhysics(b3, worldId, bodyIds, {
        engineVersion: `${version.major}.${version.minor}.${version.revision}`,
        bodyMassErrorsKg: massErrors,
        bodyLocalCenterErrorsM: centerErrors,
      });
    } catch (error: unknown) {
      if (b3.b3World_IsValid(worldId)) b3.b3DestroyWorld(worldId);
      throw error;
    }
  }

  get receipt(): RuntimeReceipt {
    this.#assertActive();
    return this.#receipt;
  }

  step(stepCount = 1): void {
    this.#assertActive();
    for (let index = 0; index < stepCount; index += 1) {
      this.#b3.b3World_Step(this.#worldId, FIXED_DT, SUBSTEPS);
    }
  }

  snapshots(): readonly RuntimeBodySnapshot[] {
    this.#assertActive();
    return [...this.#bodyIds.entries()].map(([planBodyId, bodyId]) => {
      const position = this.#b3.b3Body_GetPosition(bodyId);
      const rotation = this.#b3.b3Body_GetRotation(bodyId);
      const linearVelocity = this.#b3.b3Body_GetLinearVelocity(bodyId);
      const angularVelocity = this.#b3.b3Body_GetAngularVelocity(bodyId);
      const mass = this.#b3.b3Body_GetMassData(bodyId);
      const vector = { x: rotation.v.x, y: rotation.v.y, z: rotation.v.z };
      return {
        planBodyId,
        position: { x: position.x, y: position.y, z: position.z },
        rotation: {
          x: vector.x,
          y: vector.y,
          z: vector.z,
          w: rotation.s,
          v: vector,
          s: rotation.s,
        },
        linearVelocity: {
          x: linearVelocity.x,
          y: linearVelocity.y,
          z: linearVelocity.z,
        },
        angularVelocity: {
          x: angularVelocity.x,
          y: angularVelocity.y,
          z: angularVelocity.z,
        },
        massKg: mass.mass,
        localCenter: { x: mass.center.x, y: mass.center.y, z: mass.center.z },
      };
    });
  }

  dispose(): void {
    if (this.#disposed) return;
    if (this.#b3.b3World_IsValid(this.#worldId)) this.#b3.b3DestroyWorld(this.#worldId);
    this.#disposed = true;
  }

  #assertActive(): void {
    if (this.#disposed) throw new Error("physics runtime has been disposed");
  }
}
