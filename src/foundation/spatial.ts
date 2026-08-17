export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Quat {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
}

export interface RigidPose {
  readonly position: Vec3;
  readonly rotation: Quat;
}

/** Solver-neutral instantaneous rigid motion in world space. */
export interface RigidMotion extends RigidPose {
  readonly linearVelocity: Vec3;
  readonly angularVelocity: Vec3;
}

export const ZERO_VEC3: Vec3 = Object.freeze({ x: 0, y: 0, z: 0 });
export const IDENTITY_QUAT: Quat = Object.freeze({ x: 0, y: 0, z: 0, w: 1 });

export function addVec3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function subtractVec3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function scaleVec3(value: Vec3, scalar: number): Vec3 {
  return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar };
}

export function dotVec3(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function crossVec3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function magnitudeSquaredVec3(value: Vec3): number {
  return dotVec3(value, value);
}

export function magnitudeVec3(value: Vec3): number {
  return Math.sqrt(magnitudeSquaredVec3(value));
}

export function distanceVec3(a: Vec3, b: Vec3): number {
  return magnitudeVec3(subtractVec3(a, b));
}

export function isFiniteVec3(value: Vec3): boolean {
  return Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z);
}

/**
 * Velocity of a material point belonging to an instantaneously rigid body.
 * This is the kinematic field v(point) = v(COM) + omega x (point - COM).
 * It is a measurement primitive for future topology/state-transfer experiments,
 * not proof that any particular transfer policy is correct.
 */
export function rigidVelocityAtWorldPoint(motion: RigidMotion, worldPoint: Vec3): Vec3 {
  const offset = subtractVec3(worldPoint, motion.position);
  return addVec3(motion.linearVelocity, crossVec3(motion.angularVelocity, offset));
}
