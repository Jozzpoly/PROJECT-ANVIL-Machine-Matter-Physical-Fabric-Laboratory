import type { RigidMotion, Vec3 } from "./spatial.js";
import {
  magnitudeVec3,
  rigidVelocityAtWorldPoint,
  scaleVec3,
  subtractVec3,
} from "./spatial.js";

export interface ContinuityError {
  readonly positionErrorM: number;
  readonly linearVelocityErrorMps: number;
  readonly angularVelocityErrorRadps: number;
}

export interface MomentumSample {
  readonly massKg: number;
  readonly linearVelocity: Vec3;
}

export function compareRigidMotion(expected: RigidMotion, actual: RigidMotion): ContinuityError {
  return {
    positionErrorM: magnitudeVec3(subtractVec3(actual.position, expected.position)),
    linearVelocityErrorMps: magnitudeVec3(
      subtractVec3(actual.linearVelocity, expected.linearVelocity),
    ),
    angularVelocityErrorRadps: magnitudeVec3(
      subtractVec3(actual.angularVelocity, expected.angularVelocity),
    ),
  };
}

export function linearMomentum(sample: MomentumSample): Vec3 {
  if (!Number.isFinite(sample.massKg) || sample.massKg < 0) {
    throw new RangeError("massKg must be finite and non-negative");
  }
  return scaleVec3(sample.linearVelocity, sample.massKg);
}

export function totalLinearMomentum(samples: readonly MomentumSample[]): Vec3 {
  let x = 0;
  let y = 0;
  let z = 0;
  for (const sample of samples) {
    const momentum = linearMomentum(sample);
    x += momentum.x;
    y += momentum.y;
    z += momentum.z;
  }
  return { x, y, z };
}

export function translationalKineticEnergyJ(sample: MomentumSample): number {
  if (!Number.isFinite(sample.massKg) || sample.massKg < 0) {
    throw new RangeError("massKg must be finite and non-negative");
  }
  const speed = magnitudeVec3(sample.linearVelocity);
  return 0.5 * sample.massKg * speed * speed;
}

export { rigidVelocityAtWorldPoint };
