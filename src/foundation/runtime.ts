import type { Quat, Vec3 } from "./spatial.js";

/**
 * Minimal solver-neutral observation already demonstrated by ANVIL-00.
 * No Box3D handle or Box3D-specific math type may cross this boundary.
 */
export interface RuntimeBodyObservation {
  readonly planBodyId: string;
  readonly position: Vec3;
  readonly rotation: Quat;
  readonly massKg: number;
  readonly localCenter: Vec3;
}

/**
 * State required by topology/state-continuity experiments such as CUT.
 * The current COLLAPSE runtime does not yet claim that it can capture/restore
 * this complete state; this contract defines what the next experiment must expose.
 */
export interface RuntimeBodyMotionState extends RuntimeBodyObservation {
  readonly linearVelocity: Vec3;
  readonly angularVelocity: Vec3;
}

export interface PhysicsRuntime<TSnapshot extends RuntimeBodyObservation = RuntimeBodyObservation> {
  step(stepCount?: number): void;
  snapshots(): readonly TSnapshot[];
  dispose(): void;
}
