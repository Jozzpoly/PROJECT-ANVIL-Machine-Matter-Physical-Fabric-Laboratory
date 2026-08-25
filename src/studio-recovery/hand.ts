import type { BearingRuntimeSnapshot } from "../experiments/anvil-02-bearing.js";
import { addVec3, crossVec3, magnitudeVec3, subtractVec3 } from "../foundation/spatial.js";
import type { Vec3 } from "../model.js";

export interface RuntimeHandGrab {
  readonly planBodyId: string;
  readonly localPoint: Vec3;
  readonly targetWorld: Vec3;
}

export interface RuntimeHandTuning {
  readonly angularFrequencyRadps: number;
  readonly dampingRatio: number;
  readonly maxAccelerationMps2: number;
}

export const DEFAULT_RUNTIME_HAND_TUNING: RuntimeHandTuning = Object.freeze({
  angularFrequencyRadps: 14,
  dampingRatio: 0.9,
  maxAccelerationMps2: 80,
});

function scale(value: Vec3, scalar: number): Vec3 {
  return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar };
}

function rotateVec3ByQuat(
  rotation: { readonly x: number; readonly y: number; readonly z: number; readonly w: number },
  value: Vec3,
): Vec3 {
  const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
  const t = crossVec3(qv, value);
  const doubled = scale(t, 2);
  return addVec3(value, addVec3(scale(doubled, rotation.w), crossVec3(qv, doubled)));
}

function inverseRotateVec3ByQuat(
  rotation: { readonly x: number; readonly y: number; readonly z: number; readonly w: number },
  value: Vec3,
): Vec3 {
  return rotateVec3ByQuat({ x: -rotation.x, y: -rotation.y, z: -rotation.z, w: rotation.w }, value);
}

function assertFiniteVec3(value: Vec3, label: string): void {
  if (![value.x, value.y, value.z].every(Number.isFinite)) throw new Error(`${label} must be finite`);
}

function assertSnapshot(snapshot: BearingRuntimeSnapshot): void {
  if (!Number.isFinite(snapshot.massKg) || snapshot.massKg <= 0) throw new Error("Runtime Hand requires positive finite body mass");
  assertFiniteVec3(snapshot.position, "Runtime Hand body position");
  assertFiniteVec3(snapshot.linearVelocity, "Runtime Hand body linear velocity");
  assertFiniteVec3(snapshot.angularVelocity, "Runtime Hand body angular velocity");
}

function assertTuning(tuning: RuntimeHandTuning): void {
  if (!Number.isFinite(tuning.angularFrequencyRadps) || tuning.angularFrequencyRadps <= 0) {
    throw new Error("Runtime Hand angular frequency must be positive and finite");
  }
  if (!Number.isFinite(tuning.dampingRatio) || tuning.dampingRatio < 0) {
    throw new Error("Runtime Hand damping ratio must be non-negative and finite");
  }
  if (!Number.isFinite(tuning.maxAccelerationMps2) || tuning.maxAccelerationMps2 <= 0) {
    throw new Error("Runtime Hand max acceleration must be positive and finite");
  }
}

export function createRuntimeHandGrab(snapshot: BearingRuntimeSnapshot, worldPoint: Vec3): RuntimeHandGrab {
  assertSnapshot(snapshot);
  assertFiniteVec3(worldPoint, "Runtime Hand world point");
  return {
    planBodyId: snapshot.planBodyId,
    localPoint: inverseRotateVec3ByQuat(snapshot.rotation, subtractVec3(worldPoint, snapshot.position)),
    targetWorld: { ...worldPoint },
  };
}

export function updateRuntimeHandTarget(grab: RuntimeHandGrab, targetWorld: Vec3): RuntimeHandGrab {
  assertFiniteVec3(targetWorld, "Runtime Hand target");
  return { ...grab, targetWorld: { ...targetWorld } };
}

export function runtimeHandAnchorWorld(grab: RuntimeHandGrab, snapshot: BearingRuntimeSnapshot): Vec3 {
  if (snapshot.planBodyId !== grab.planBodyId) {
    throw new Error(`Runtime Hand grab targets ${grab.planBodyId}, received ${snapshot.planBodyId}`);
  }
  assertSnapshot(snapshot);
  return addVec3(snapshot.position, rotateVec3ByQuat(snapshot.rotation, grab.localPoint));
}

export function runtimeHandForceWorld(
  grab: RuntimeHandGrab,
  snapshot: BearingRuntimeSnapshot,
  tuning: RuntimeHandTuning = DEFAULT_RUNTIME_HAND_TUNING,
): Vec3 {
  assertTuning(tuning);
  const anchorWorld = runtimeHandAnchorWorld(grab, snapshot);
  const armWorld = subtractVec3(anchorWorld, snapshot.position);
  const pointVelocity = addVec3(snapshot.linearVelocity, crossVec3(snapshot.angularVelocity, armWorld));
  const error = subtractVec3(grab.targetWorld, anchorWorld);
  const stiffness = snapshot.massKg * tuning.angularFrequencyRadps * tuning.angularFrequencyRadps;
  const damping = 2 * tuning.dampingRatio * snapshot.massKg * tuning.angularFrequencyRadps;
  const raw = subtractVec3(scale(error, stiffness), scale(pointVelocity, damping));
  const magnitude = magnitudeVec3(raw);
  const maxForce = snapshot.massKg * tuning.maxAccelerationMps2;
  if (magnitude <= maxForce || magnitude === 0) return raw;
  return scale(raw, maxForce / magnitude);
}
