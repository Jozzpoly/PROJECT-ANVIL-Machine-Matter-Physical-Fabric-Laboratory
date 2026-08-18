import type { Vec3 } from "../model.js";
import type { TorquePatchCompilation } from "./anvil-06-torque-patch.js";

export type ActivationState = "OFF" | "ON";

export interface ActivationSnapshot {
  readonly activation: ActivationState;
}

export interface ActivationTorquePair {
  readonly torqueAWorld: Vec3;
  readonly torqueBWorld: Vec3;
}

const ZERO: Vec3 = Object.freeze({ x: 0, y: 0, z: 0 });

function cloneVec3(value: Vec3): Vec3 {
  return { x: value.x, y: value.y, z: value.z };
}

function validateActivation(value: unknown): ActivationState {
  if (value !== "OFF" && value !== "ON") {
    throw new Error(`ANVIL-09 activation must be OFF or ON, got ${String(value)}`);
  }
  return value;
}

/**
 * Experiment-local transient state around one already-compiled TORQUE-PATCH.
 *
 * This object deliberately does not compile source, own solver objects or expose
 * a generic command-routing model. It only decides whether the accepted signed
 * torque action is presently supplied to a later runtime lowering.
 */
export class ActivateControlState {
  readonly #compilation: TorquePatchCompilation;
  #activation: ActivationState = "OFF";

  constructor(compilation: TorquePatchCompilation) {
    this.#compilation = compilation;
  }

  get sourceCompilation(): TorquePatchCompilation {
    return this.#compilation;
  }

  get activation(): ActivationState {
    return this.#activation;
  }

  setActivation(value: unknown): void {
    this.#activation = validateActivation(value);
  }

  snapshot(): ActivationSnapshot {
    return { activation: this.#activation };
  }

  torquePair(): ActivationTorquePair {
    if (this.#activation === "OFF") {
      return {
        torqueAWorld: cloneVec3(ZERO),
        torqueBWorld: cloneVec3(ZERO),
      };
    }

    const action = this.#compilation.torque.action;
    return {
      torqueAWorld: cloneVec3(action.torqueAWorld),
      torqueBWorld: cloneVec3(action.torqueBWorld),
    };
  }
}
