import type { BearingRuntimeSnapshot } from "../experiments/anvil-02-bearing.js";
import { ActivatePhysics } from "../experiments/anvil-09-activate-runtime.js";
import type { Vec3 } from "../model.js";
import type { StudioClassification } from "./compile.js";
import type { StudioSourceV0 } from "./workspace.js";

export type StudioRuntimeActivation = "OFF" | "ON";
export type StudioRuntimeIdSource = () => string;

export interface StudioRuntimeBodyRef {
  readonly sessionId: string;
  readonly sourceGeneration: number;
  readonly planBodyId: string;
}

export interface StudioRuntimePlanBody {
  readonly planBodyId: string;
  readonly centerOfMassWorld: Vec3;
}

export interface StudioRuntimePlan {
  readonly cellToBody: Readonly<Record<string, string>>;
  readonly bodies: readonly StudioRuntimePlanBody[];
}

export interface StudioRuntimeFrame {
  readonly sessionId: string;
  readonly sourceGeneration: number;
  readonly activation: StudioRuntimeActivation;
  readonly bodies: readonly BearingRuntimeSnapshot[];
}

export function createStudioRuntimeIdSource(prefix = "studio-runtime"): StudioRuntimeIdSource {
  let next = 1;
  return () => `${prefix}:${next++}`;
}

const DEFAULT_RUNTIME_ID_SOURCE = createStudioRuntimeIdSource();

function requireSingleReadyCompilation(
  source: StudioSourceV0,
  sourceGeneration: number,
  classification: StudioClassification,
) {
  if (classification.sourceGeneration !== sourceGeneration) {
    throw new Error(
      `Studio runtime refused stale classification generation ${classification.sourceGeneration}; current source generation is ${sourceGeneration}`,
    );
  }
  if (
    classification.authoredValidity !== "VALID" ||
    classification.compositionSupport !== "SUPPORTED" ||
    classification.runReadiness !== "READY"
  ) {
    throw new Error("Studio runtime requires one current VALID / SUPPORTED / READY authored composition");
  }
  if (
    source.bearings.length !== 1 ||
    source.torquePatches.length !== 1 ||
    classification.bearings.length !== 1 ||
    classification.torquePatches.length !== 1
  ) {
    throw new Error("Studio runtime READY classification does not contain exactly one Bearing and TorquePatch");
  }

  const authoredBearing = source.bearings[0];
  const authoredPatch = source.torquePatches[0];
  const bearing = classification.bearings[0];
  const patch = classification.torquePatches[0];
  if (authoredBearing === undefined || authoredPatch === undefined || bearing === undefined || patch === undefined) {
    throw new Error("Studio runtime READY composition is incomplete");
  }
  if (bearing.sourceId !== authoredBearing.id || patch.sourceId !== authoredPatch.id) {
    throw new Error("Studio runtime classification source identity is stale");
  }
  if (
    patch.compilation.sourcePatchId !== authoredPatch.id ||
    patch.compilation.resolvedBearingId !== authoredBearing.id
  ) {
    throw new Error("Studio runtime compiled local meaning is stale");
  }
  return patch.compilation;
}

function runtimePlanFromCompilation(compilation: ReturnType<typeof requireSingleReadyCompilation>): StudioRuntimePlan {
  const physicalPlan = compilation.torque.bearing.physicalPlan;
  return {
    cellToBody: { ...physicalPlan.cellToBody },
    bodies: physicalPlan.bodies.map((body) => ({
      planBodyId: body.id,
      centerOfMassWorld: { ...body.centerOfMassWorld },
    })),
  };
}

export class StudioRuntimeSession {
  readonly #sessionId: string;
  readonly #sourceGeneration: number;
  readonly #plan: StudioRuntimePlan;
  readonly #physics: ActivatePhysics;
  #disposed = false;

  private constructor(
    sessionId: string,
    sourceGeneration: number,
    plan: StudioRuntimePlan,
    physics: ActivatePhysics,
  ) {
    this.#sessionId = sessionId;
    this.#sourceGeneration = sourceGeneration;
    this.#plan = plan;
    this.#physics = physics;
  }

  static async create(
    source: StudioSourceV0,
    sourceGeneration: number,
    classification: StudioClassification,
    idSource: StudioRuntimeIdSource = DEFAULT_RUNTIME_ID_SOURCE,
  ): Promise<StudioRuntimeSession> {
    const compilation = requireSingleReadyCompilation(source, sourceGeneration, classification);
    const sessionId = idSource().trim();
    if (sessionId.length === 0) throw new Error("Studio runtime id source returned an empty id");
    const plan = runtimePlanFromCompilation(compilation);
    const physics = await ActivatePhysics.create(compilation, source.matter.materials);
    return new StudioRuntimeSession(sessionId, sourceGeneration, plan, physics);
  }

  get sessionId(): string {
    this.#assertActive();
    return this.#sessionId;
  }

  get sourceGeneration(): number {
    this.#assertActive();
    return this.#sourceGeneration;
  }

  get plan(): StudioRuntimePlan {
    this.#assertActive();
    return this.#plan;
  }

  get activation(): StudioRuntimeActivation {
    this.#assertActive();
    return this.#physics.activation;
  }

  setActivation(value: StudioRuntimeActivation): void {
    this.#assertActive();
    this.#physics.setActivation(value);
  }

  step(stepCount = 1): StudioRuntimeFrame {
    this.#assertActive();
    this.#physics.step(stepCount);
    return this.frame();
  }

  frame(): StudioRuntimeFrame {
    this.#assertActive();
    return {
      sessionId: this.#sessionId,
      sourceGeneration: this.#sourceGeneration,
      activation: this.#physics.activation,
      bodies: this.#physics.snapshots(),
    };
  }

  bodyRef(planBodyId: string): StudioRuntimeBodyRef {
    this.#assertActive();
    if (!this.#physics.snapshots().some((snapshot) => snapshot.planBodyId === planBodyId)) {
      throw new Error(`Studio runtime has no body ${planBodyId}`);
    }
    return {
      sessionId: this.#sessionId,
      sourceGeneration: this.#sourceGeneration,
      planBodyId,
    };
  }

  resolveBodyRef(ref: StudioRuntimeBodyRef): BearingRuntimeSnapshot {
    this.#assertActive();
    if (ref.sessionId !== this.#sessionId) {
      throw new Error(`Studio runtime ref belongs to stale session ${ref.sessionId}`);
    }
    if (ref.sourceGeneration !== this.#sourceGeneration) {
      throw new Error(`Studio runtime ref belongs to stale source generation ${ref.sourceGeneration}`);
    }
    const snapshot = this.#physics.snapshots().find((candidate) => candidate.planBodyId === ref.planBodyId);
    if (snapshot === undefined) throw new Error(`Studio runtime ref body ${ref.planBodyId} no longer exists`);
    return snapshot;
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#physics.dispose();
    this.#disposed = true;
  }

  #assertActive(): void {
    if (this.#disposed) throw new Error("Studio runtime session has been disposed");
  }
}
