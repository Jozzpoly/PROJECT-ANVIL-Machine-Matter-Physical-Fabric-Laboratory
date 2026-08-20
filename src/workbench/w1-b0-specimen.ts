import type { GridPosition, RigidBodyPlan, Vec3 } from "../model.js";
import {
  addVec3,
  magnitudeVec3,
  subtractVec3,
  type Quat,
  type RigidMotion,
} from "../foundation/spatial.js";
import {
  velocityForRotationAboutPivot,
  type BearingRuntimeSnapshot,
} from "../experiments/anvil-02-bearing.js";
import {
  RebindPhysics,
  compileRebind,
  transferRebindMotion,
  type RebindCompilation,
} from "../experiments/anvil-03-rebind.js";
import {
  createTorquePatchFixture,
  type TorquePatchAuthoredFixture,
} from "../experiments/anvil-06-torque-patch.js";
import { relowerTorquePatchToBearing } from "../experiments/anvil-10-torque-patch-rebind.js";
import { TorquePatchRebindPhysics } from "../experiments/anvil-10-torque-patch-rebind-runtime.js";
import { WorkbenchB0Controller, type WorkbenchB0State } from "./w1-b0-controller.js";

const ACTIVE_EFFORT_NM = 100;
const CUT = ["a:0", "a:2"] as const;
const PRE_CUT_STEPS = 31;
const POST_CUT_STEPS = 30;

const OMEGA_A = Object.freeze({ x: 0, y: 0, z: -0.65 });
const OMEGA_B = Object.freeze({ x: 0, y: 0, z: 0.95 });
const COMMON_DRIFT = Object.freeze({ x: 0.8, y: -0.25, z: 0.35 });
const IDENTITY = Object.freeze({ x: 0, y: 0, z: 0, w: 1 });

export interface WorkbenchB0AuthoredSummary {
  readonly matterRevision: string;
  readonly sourceCellIds: readonly string[];
  readonly sourceBearingId: string;
  readonly sourcePatchId: string;
  readonly sourcePatchTarget: Readonly<{ cellId: string; face: string }>;
  readonly effortNm: number;
}

export interface WorkbenchB0CutReadyReceipt {
  readonly preCutSteps: number;
  readonly runtimeBodyIds: readonly string[];
  readonly sourceBearingId: string;
}

export interface WorkbenchB0TransitionReceipt {
  readonly beforeRuntimeBodyIds: readonly string[];
  readonly afterRuntimeBodyIds: readonly string[];
  readonly beforeEndpointBodyId: string;
  readonly afterEndpointBodyId: string;
  readonly sourceBearingIdBefore: string;
  readonly sourceBearingIdAfter: string;
  readonly sourcePatchId: string;
  readonly sourcePatchTarget: Readonly<{ cellId: string; face: string }>;
  readonly freshActionBodyAId: string;
  readonly freshActionBodyBId: string;
  readonly oldEndpointBodyStillExists: boolean;
  readonly oldRuntimeDisposed: true;
  readonly freshActivation: "OFF";
}

export interface WorkbenchB0ObservationReceipt {
  readonly observationSteps: number;
  readonly activeActivation: "ON";
  readonly controlActivation: "OFF";
  readonly activeRelativeAngularSpeedRadps: number;
  readonly controlRelativeAngularSpeedRadps: number;
  readonly activeSpeedAdvantageRadps: number;
  readonly activeBearingGapM: number;
  readonly controlBearingGapM: number;
  readonly staleSiblingBodyId: string;
  readonly staleSiblingAngularDeltaRadps: number;
  readonly staleSiblingLinearDeltaMps: number;
}

export interface WorkbenchB0VisualCell {
  readonly id: string;
  readonly grid: GridPosition;
  readonly displayColor: string;
}

export interface WorkbenchB0VisualBody {
  readonly id: string;
  readonly sourceCellIds: readonly string[];
  readonly sourceCenterOfMassWorld: Vec3;
  readonly position: Vec3;
  readonly rotation: Quat;
}

export interface WorkbenchB0VisualSnapshot {
  readonly phase: WorkbenchB0State["phase"];
  readonly cellSizeM: number;
  readonly cells: readonly WorkbenchB0VisualCell[];
  readonly bodies: readonly WorkbenchB0VisualBody[];
  readonly bearing: Readonly<{
    sourceBearingId: string;
    bodyAId: string;
    bodyBId: string;
    anchorAWorld: Vec3;
    anchorBWorld: Vec3;
    anchorGapM: number;
  }>;
  readonly patch: Readonly<{
    sourcePatchId: string;
    target: Readonly<{ cellId: string; face: string }>;
    currentBodyId: string;
  }>;
}

function bodyById(bodies: readonly RigidBodyPlan[], id: string): RigidBodyPlan {
  const body = bodies.find((candidate) => candidate.id === id);
  if (body === undefined) throw new Error(`W1 B0 missing accepted body ${id}`);
  return body;
}

function snapshotById(snapshots: readonly BearingRuntimeSnapshot[], id: string): BearingRuntimeSnapshot {
  const snapshot = snapshots.find((candidate) => candidate.planBodyId === id);
  if (snapshot === undefined) throw new Error(`W1 B0 missing runtime snapshot ${id}`);
  return snapshot;
}

function createInitialMotion(rebind: RebindCompilation): Readonly<Record<string, RigidMotion>> {
  const before = rebind.before;
  const bodyA = bodyById(before.physicalPlan.bodies, before.relation.bodyAId);
  const bodyB = bodyById(before.physicalPlan.bodies, before.relation.bodyBId);

  return {
    [bodyA.id]: {
      position: { ...bodyA.centerOfMassWorld },
      rotation: { ...IDENTITY },
      linearVelocity: addVec3(
        COMMON_DRIFT,
        velocityForRotationAboutPivot(OMEGA_A, bodyA.centerOfMassWorld, before.relation.pivotWorld),
      ),
      angularVelocity: { ...OMEGA_A },
    },
    [bodyB.id]: {
      position: { ...bodyB.centerOfMassWorld },
      rotation: { ...IDENTITY },
      linearVelocity: addVec3(
        COMMON_DRIFT,
        velocityForRotationAboutPivot(OMEGA_B, bodyB.centerOfMassWorld, before.relation.pivotWorld),
      ),
      angularVelocity: { ...OMEGA_B },
    },
  };
}

async function createPreCutRuntime(
  authored: TorquePatchAuthoredFixture,
  rebind: RebindCompilation,
): Promise<RebindPhysics> {
  return RebindPhysics.create(
    rebind.before,
    authored.bearing.matter.materials,
    createInitialMotion(rebind),
    true,
  );
}

/**
 * Exact W1/B0 integration specimen.
 *
 * This is intentionally not a generic runtime. It coordinates only the frozen
 * ANVIL-10 fixture/path selected by W0 and keeps accepted experiment-local
 * compiler/runtime semantics in their existing modules.
 */
export class WorkbenchB0Specimen {
  readonly #authored: TorquePatchAuthoredFixture;
  readonly #rebind: RebindCompilation;
  readonly #controller = new WorkbenchB0Controller();
  #preRuntime: RebindPhysics | null;
  #postRuntime: TorquePatchRebindPhysics | null = null;
  #controlRuntime: TorquePatchRebindPhysics | null = null;
  #cutReadySnapshots: readonly BearingRuntimeSnapshot[] | null = null;
  #cutReadyReceipt: WorkbenchB0CutReadyReceipt | null = null;
  #transitionReceipt: WorkbenchB0TransitionReceipt | null = null;
  #observationReceipt: WorkbenchB0ObservationReceipt | null = null;
  #observationStepsCompleted = 0;
  #disposed = false;

  private constructor(
    authored: TorquePatchAuthoredFixture,
    rebind: RebindCompilation,
    preRuntime: RebindPhysics,
  ) {
    this.#authored = authored;
    this.#rebind = rebind;
    this.#preRuntime = preRuntime;
  }

  static async create(): Promise<WorkbenchB0Specimen> {
    const authored = createTorquePatchFixture(ACTIVE_EFFORT_NM);
    const rebind = compileRebind({ bearing: authored.bearing, cut: [...CUT] });
    const preRuntime = await createPreCutRuntime(authored, rebind);
    return new WorkbenchB0Specimen(authored, rebind, preRuntime);
  }

  get state(): WorkbenchB0State {
    this.#assertUsable();
    return this.#controller.state;
  }

  get authoredSummary(): WorkbenchB0AuthoredSummary {
    this.#assertUsable();
    return {
      matterRevision: this.#authored.bearing.matter.revision,
      sourceCellIds: this.#authored.bearing.matter.cells.map((cell) => cell.id),
      sourceBearingId: this.#authored.bearing.bearing.id,
      sourcePatchId: this.#authored.patch.id,
      sourcePatchTarget: { ...this.#authored.patch.target },
      effortNm: this.#authored.patch.effortNm,
    };
  }

  get cutReadyReceipt(): WorkbenchB0CutReadyReceipt | null {
    this.#assertUsable();
    return this.#cutReadyReceipt;
  }

  get transitionReceipt(): WorkbenchB0TransitionReceipt | null {
    this.#assertUsable();
    return this.#transitionReceipt;
  }

  get observationReceipt(): WorkbenchB0ObservationReceipt | null {
    this.#assertUsable();
    return this.#observationReceipt;
  }

  visualSnapshot(): WorkbenchB0VisualSnapshot {
    this.#assertUsable();
    const phase = this.#controller.state.phase;
    const preCut = phase === "INITIAL" || phase === "PRE_CUT" || phase === "CUT_READY";
    const compilation = preCut ? this.#rebind.before : this.#rebind.after;
    const runtime = preCut ? this.#preRuntime : this.#postRuntime;
    if (runtime === null) throw new Error(`W1 B0 visual runtime unavailable in ${phase}`);

    const snapshots = runtime.snapshots();
    const kinematics = runtime.bearingKinematics();
    const materialById = new Map(
      this.#authored.bearing.matter.materials.map((material) => [material.id, material] as const),
    );
    const currentBodyId = compilation.physicalPlan.cellToBody[this.#authored.patch.target.cellId];
    if (currentBodyId === undefined) throw new Error("W1 B0 visual patch target has no current body");

    return {
      phase,
      cellSizeM: this.#authored.bearing.matter.cellSizeM,
      cells: this.#authored.bearing.matter.cells.map((cell) => ({
        id: cell.id,
        grid: { ...cell.grid },
        displayColor: materialById.get(cell.materialId)?.displayColor ?? "#d8e2f0",
      })),
      bodies: compilation.physicalPlan.bodies.map((body) => {
        const snapshot = snapshotById(snapshots, body.id);
        return {
          id: body.id,
          sourceCellIds: [...body.sourceCellIds],
          sourceCenterOfMassWorld: { ...body.centerOfMassWorld },
          position: { ...snapshot.position },
          rotation: { ...snapshot.rotation },
        };
      }),
      bearing: {
        sourceBearingId: compilation.relation.sourceBearingId,
        bodyAId: compilation.relation.bodyAId,
        bodyBId: compilation.relation.bodyBId,
        anchorAWorld: { ...kinematics.anchorAWorld },
        anchorBWorld: { ...kinematics.anchorBWorld },
        anchorGapM: kinematics.anchorGapM,
      },
      patch: {
        sourcePatchId: this.#authored.patch.id,
        target: { ...this.#authored.patch.target },
        currentBodyId,
      },
    };
  }

  continueToCutReady(): WorkbenchB0CutReadyReceipt {
    this.#assertUsable();
    if (this.#controller.state.phase !== "INITIAL") {
      throw new Error(`W1 B0 cannot continue to CUT READY from ${this.#controller.state.phase}`);
    }
    const preRuntime = this.#preRuntime;
    if (preRuntime === null) throw new Error("W1 B0 pre-CUT runtime is unavailable");

    this.#controller.start();
    preRuntime.step(PRE_CUT_STEPS);
    const snapshots = preRuntime.snapshots();
    this.#cutReadySnapshots = snapshots;
    this.#controller.reachCutReady();
    this.#cutReadyReceipt = {
      preCutSteps: PRE_CUT_STEPS,
      runtimeBodyIds: snapshots.map((snapshot) => snapshot.planBodyId),
      sourceBearingId: this.#rebind.before.relation.sourceBearingId,
    };
    return this.#cutReadyReceipt;
  }

  async executeAcceptedCut(): Promise<WorkbenchB0TransitionReceipt> {
    this.#assertUsable();
    if (this.#controller.state.phase !== "CUT_READY") {
      throw new Error(`W1 B0 cannot execute accepted CUT from ${this.#controller.state.phase}`);
    }
    const preRuntime = this.#preRuntime;
    const preSnapshots = this.#cutReadySnapshots;
    if (preRuntime === null || preSnapshots === null) {
      throw new Error("W1 B0 CUT READY snapshot/runtime invariant is broken");
    }

    const beforeRelation = this.#rebind.before.relation;
    const afterRelation = this.#rebind.after.relation;

    // W0 requires replacement, not mutation/migration of the old runtime.
    preRuntime.dispose();
    this.#preRuntime = null;

    try {
      const transferredMotion = transferRebindMotion(this.#rebind, preSnapshots);
      const freshCompilation = relowerTorquePatchToBearing(this.#authored.patch, this.#rebind.after);
      const postRuntime = await TorquePatchRebindPhysics.create(
        freshCompilation,
        this.#authored.bearing.matter.materials,
        transferredMotion,
      );
      const controlRuntime = await TorquePatchRebindPhysics.create(
        freshCompilation,
        this.#authored.bearing.matter.materials,
        transferredMotion,
      );
      if (postRuntime.activation !== "OFF" || controlRuntime.activation !== "OFF") {
        postRuntime.dispose();
        controlRuntime.dispose();
        throw new Error("W1 B0 fresh post-CUT runtime/control did not start OFF");
      }
      this.#postRuntime = postRuntime;
      this.#controlRuntime = controlRuntime;

      const afterBodyIds = this.#rebind.after.physicalPlan.bodies.map((body) => body.id);
      const receipt: WorkbenchB0TransitionReceipt = {
        beforeRuntimeBodyIds: this.#rebind.before.physicalPlan.bodies.map((body) => body.id),
        afterRuntimeBodyIds: afterBodyIds,
        beforeEndpointBodyId: beforeRelation.bodyAId,
        afterEndpointBodyId: afterRelation.bodyAId,
        sourceBearingIdBefore: beforeRelation.sourceBearingId,
        sourceBearingIdAfter: afterRelation.sourceBearingId,
        sourcePatchId: freshCompilation.sourcePatchId,
        sourcePatchTarget: { ...freshCompilation.sourceTarget },
        freshActionBodyAId: freshCompilation.torque.action.bodyAId,
        freshActionBodyBId: freshCompilation.torque.action.bodyBId,
        oldEndpointBodyStillExists: afterBodyIds.includes(beforeRelation.bodyAId),
        oldRuntimeDisposed: true,
        freshActivation: "OFF",
      };
      this.#transitionReceipt = receipt;
      this.#controller.recordAcceptedCutComplete();
      return receipt;
    } catch (error: unknown) {
      this.#postRuntime?.dispose();
      this.#controlRuntime?.dispose();
      this.#postRuntime = null;
      this.#controlRuntime = null;
      this.#disposed = true;
      throw error;
    }
  }

  beginObservation(): WorkbenchB0State {
    this.#assertUsable();
    if (this.#controller.state.phase !== "POST_CUT_OFF") {
      throw new Error(`W1 B0 cannot activate bounded observation from ${this.#controller.state.phase}`);
    }
    const active = this.#postRuntime;
    const control = this.#controlRuntime;
    if (active === null || control === null || this.#transitionReceipt === null) {
      throw new Error("W1 B0 post-CUT runtime/control invariant is broken");
    }

    this.#controller.activateTorque();
    active.setActivation("ON");
    if (active.activation !== "ON") throw new Error("W1 B0 active runtime failed to enter ON");
    if (control.activation !== "OFF") throw new Error("W1 B0 background control was not OFF at observation start");
    this.#observationStepsCompleted = 0;
    this.#observationReceipt = null;
    return this.#controller.state;
  }

  stepObservation(stepCount = 1): WorkbenchB0ObservationReceipt | null {
    this.#assertUsable();
    if (this.#controller.state.phase !== "OBSERVING") {
      throw new Error(`W1 B0 cannot step bounded observation from ${this.#controller.state.phase}`);
    }
    if (!Number.isInteger(stepCount) || stepCount <= 0) {
      throw new Error("W1 B0 observation stepCount must be a positive integer");
    }
    if (this.#observationStepsCompleted + stepCount > POST_CUT_STEPS) {
      throw new Error("W1 B0 observation cannot exceed the frozen 30-step window");
    }

    const active = this.#postRuntime;
    const control = this.#controlRuntime;
    if (active === null || control === null || this.#transitionReceipt === null) {
      throw new Error("W1 B0 observation runtime/control invariant is broken");
    }

    active.step(stepCount);
    control.step(stepCount);
    this.#observationStepsCompleted += stepCount;
    if (this.#observationStepsCompleted < POST_CUT_STEPS) return null;

    const transition = this.#transitionReceipt;
    const activeFinal = active.snapshots();
    const controlFinal = control.snapshots();
    const activeSibling = snapshotById(activeFinal, transition.beforeEndpointBodyId);
    const controlSibling = snapshotById(controlFinal, transition.beforeEndpointBodyId);
    const activeSpeed = active.relativeAngularSpeedRadps();
    const controlSpeed = control.relativeAngularSpeedRadps();
    const activeActivation = active.activation;
    const controlActivation = control.activation;
    if (activeActivation !== "ON") throw new Error("W1 B0 active runtime lost ON during bounded observation");
    if (controlActivation !== "OFF") throw new Error("W1 B0 background control left OFF during bounded observation");

    const receipt: WorkbenchB0ObservationReceipt = {
      observationSteps: POST_CUT_STEPS,
      activeActivation,
      controlActivation,
      activeRelativeAngularSpeedRadps: activeSpeed,
      controlRelativeAngularSpeedRadps: controlSpeed,
      activeSpeedAdvantageRadps: activeSpeed - controlSpeed,
      activeBearingGapM: active.bearingKinematics().anchorGapM,
      controlBearingGapM: control.bearingKinematics().anchorGapM,
      staleSiblingBodyId: transition.beforeEndpointBodyId,
      staleSiblingAngularDeltaRadps: magnitudeVec3(
        subtractVec3(activeSibling.angularVelocity, controlSibling.angularVelocity),
      ),
      staleSiblingLinearDeltaMps: magnitudeVec3(
        subtractVec3(activeSibling.linearVelocity, controlSibling.linearVelocity),
      ),
    };
    this.#observationReceipt = receipt;
    this.#controller.finishObservation();
    return receipt;
  }

  activateAndObserve(): WorkbenchB0ObservationReceipt {
    this.beginObservation();
    const receipt = this.stepObservation(POST_CUT_STEPS);
    if (receipt === null) throw new Error("W1 B0 frozen observation did not complete");
    return receipt;
  }

  async reset(): Promise<WorkbenchB0State> {
    this.#assertUsable();
    this.#preRuntime?.dispose();
    this.#postRuntime?.dispose();
    this.#controlRuntime?.dispose();
    this.#preRuntime = await createPreCutRuntime(this.#authored, this.#rebind);
    this.#postRuntime = null;
    this.#controlRuntime = null;
    this.#cutReadySnapshots = null;
    this.#cutReadyReceipt = null;
    this.#transitionReceipt = null;
    this.#observationReceipt = null;
    this.#observationStepsCompleted = 0;
    return this.#controller.reset();
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#preRuntime?.dispose();
    this.#postRuntime?.dispose();
    this.#controlRuntime?.dispose();
    this.#preRuntime = null;
    this.#postRuntime = null;
    this.#controlRuntime = null;
    this.#disposed = true;
  }

  #assertUsable(): void {
    if (this.#disposed) throw new Error("W1 B0 specimen has been disposed");
  }
}
