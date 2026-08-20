export type WorkbenchB0Phase =
  | "INITIAL"
  | "PRE_CUT"
  | "CUT_READY"
  | "POST_CUT_OFF"
  | "OBSERVING"
  | "OBSERVED";

export interface WorkbenchB0State {
  readonly phase: WorkbenchB0Phase;
  readonly torqueActivation: "OFF" | "ON";
  readonly cutAvailable: boolean;
  readonly activationAvailable: boolean;
}

const STATE_BY_PHASE: Readonly<Record<WorkbenchB0Phase, WorkbenchB0State>> = Object.freeze({
  INITIAL: Object.freeze({
    phase: "INITIAL",
    torqueActivation: "OFF",
    cutAvailable: false,
    activationAvailable: false,
  }),
  PRE_CUT: Object.freeze({
    phase: "PRE_CUT",
    torqueActivation: "OFF",
    cutAvailable: false,
    activationAvailable: false,
  }),
  CUT_READY: Object.freeze({
    phase: "CUT_READY",
    torqueActivation: "OFF",
    cutAvailable: true,
    activationAvailable: false,
  }),
  POST_CUT_OFF: Object.freeze({
    phase: "POST_CUT_OFF",
    torqueActivation: "OFF",
    cutAvailable: false,
    activationAvailable: true,
  }),
  OBSERVING: Object.freeze({
    phase: "OBSERVING",
    torqueActivation: "ON",
    cutAvailable: false,
    activationAvailable: false,
  }),
  OBSERVED: Object.freeze({
    phase: "OBSERVED",
    torqueActivation: "OFF",
    cutAvailable: false,
    activationAvailable: false,
  }),
});

function invalidTransition(action: string, phase: WorkbenchB0Phase): never {
  throw new Error(`W1 B0 cannot ${action} from ${phase}`);
}

/**
 * Workbench-specific presentation/orchestration state only.
 *
 * This class deliberately knows nothing about Matter, BEARING, TORQUE-PATCH,
 * runtime body IDs, Box3D or compiler/runtime internals. Those accepted
 * experiment-local semantics are composed by the W1 specimen adapter later.
 */
export class WorkbenchB0Controller {
  #phase: WorkbenchB0Phase = "INITIAL";

  get state(): WorkbenchB0State {
    return STATE_BY_PHASE[this.#phase];
  }

  start(): WorkbenchB0State {
    if (this.#phase !== "INITIAL") invalidTransition("start", this.#phase);
    this.#phase = "PRE_CUT";
    return this.state;
  }

  reachCutReady(): WorkbenchB0State {
    if (this.#phase !== "PRE_CUT") invalidTransition("reach CUT READY", this.#phase);
    this.#phase = "CUT_READY";
    return this.state;
  }

  recordAcceptedCutComplete(): WorkbenchB0State {
    if (this.#phase !== "CUT_READY") invalidTransition("complete the accepted CUT", this.#phase);
    this.#phase = "POST_CUT_OFF";
    return this.state;
  }

  activateTorque(): WorkbenchB0State {
    if (this.#phase !== "POST_CUT_OFF") invalidTransition("activate torque", this.#phase);
    this.#phase = "OBSERVING";
    return this.state;
  }

  finishObservation(): WorkbenchB0State {
    if (this.#phase !== "OBSERVING") invalidTransition("finish observation", this.#phase);
    this.#phase = "OBSERVED";
    return this.state;
  }

  reset(): WorkbenchB0State {
    this.#phase = "INITIAL";
    return this.state;
  }
}
