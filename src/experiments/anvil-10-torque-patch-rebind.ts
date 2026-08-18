import type { Vec3 } from "../model.js";
import type { BearingCompilation, BearingEndpoint, GridFace } from "./anvil-02-bearing.js";
import type { TorqueActionPlan, TorqueCompilation } from "./anvil-05-torque.js";
import type { TorquePatch, TorquePatchCompilation } from "./anvil-06-torque-patch.js";

const VALID_FACES = new Set<GridFace>(["x-", "x+", "y-", "y+", "z-", "z+"]);

function sameEndpoint(a: BearingEndpoint, b: BearingEndpoint): boolean {
  return a.cellId === b.cellId && a.face === b.face;
}

function scale(value: Vec3, scalar: number): Vec3 {
  return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar };
}

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function magnitude(value: Vec3): number {
  return Math.hypot(value.x, value.y, value.z);
}

function validatePatch(patch: TorquePatch): string {
  const id = patch.id.trim();
  if (id.length === 0) throw new Error("ANVIL-10 patch id must be non-empty");
  if (!Number.isFinite(patch.effortNm)) throw new Error("ANVIL-10 effortNm must be finite");
  if (!VALID_FACES.has(patch.target.face)) {
    throw new Error(`ANVIL-10 patch face ${String(patch.target.face)} is invalid`);
  }
  return id;
}

function validateBearingCompilation(bearing: BearingCompilation): void {
  const relation = bearing.relation;
  const knownBodies = new Set(bearing.physicalPlan.bodies.map((body) => body.id));
  if (!knownBodies.has(relation.bodyAId) || !knownBodies.has(relation.bodyBId)) {
    throw new Error("ANVIL-10 bearing relation references a body absent from its physical plan");
  }
  if (relation.bodyAId === relation.bodyBId) {
    throw new Error("ANVIL-10 bearing endpoints resolve to one disposable body");
  }
  if (bearing.physicalPlan.cellToBody[relation.endpointA.cellId] !== relation.bodyAId) {
    throw new Error("ANVIL-10 bearing endpoint A body binding disagrees with current provenance");
  }
  if (bearing.physicalPlan.cellToBody[relation.endpointB.cellId] !== relation.bodyBId) {
    throw new Error("ANVIL-10 bearing endpoint B body binding disagrees with current provenance");
  }
}

/**
 * Experiment-local relowering adapter for ANVIL-10.
 *
 * The persistent patch is resolved against an already-derived BEARING
 * compilation. This function deliberately does not compile Matter or BEARING
 * again: the supplied relation is the current disposable representation that
 * the persistent local source must bind to.
 */
export function relowerTorquePatchToBearing(
  patch: TorquePatch,
  bearing: BearingCompilation,
): TorquePatchCompilation {
  const sourcePatchId = validatePatch(patch);
  validateBearingCompilation(bearing);

  const relation = bearing.relation;
  const matchesA = sameEndpoint(patch.target, relation.endpointA);
  const matchesB = sameEndpoint(patch.target, relation.endpointB);
  if (Number(matchesA) + Number(matchesB) !== 1) {
    throw new Error(
      `ANVIL-10 patch target ${patch.target.cellId}@${patch.target.face} is not a unique current bearing endpoint`,
    );
  }

  const targetBodyId = bearing.physicalPlan.cellToBody[patch.target.cellId];
  if (targetBodyId === undefined) {
    throw new Error(`ANVIL-10 patch target cell ${patch.target.cellId} is absent from current provenance`);
  }
  const expectedTargetBodyId = matchesA ? relation.bodyAId : relation.bodyBId;
  if (targetBodyId !== expectedTargetBodyId) {
    throw new Error("ANVIL-10 patch target resolves to a body inconsistent with the current bearing relation");
  }

  const torqueBWorld = scale(relation.axisWorld, patch.effortNm);
  const torqueAWorld = scale(torqueBWorld, -1);
  if (magnitude(add(torqueAWorld, torqueBWorld)) > 1e-12) {
    throw new Error("ANVIL-10 derived torque pair is not equal and opposite");
  }

  const action: TorqueActionPlan = {
    schema: "anvil-05-torque-action/0",
    sourceTorqueId: sourcePatchId,
    sourceBearingId: relation.sourceBearingId,
    effortNm: patch.effortNm,
    bodyAId: relation.bodyAId,
    bodyBId: relation.bodyBId,
    axisWorld: { ...relation.axisWorld },
    torqueAWorld,
    torqueBWorld,
  };
  const torque: TorqueCompilation = { bearing, action };

  const result: TorquePatchCompilation = {
    schema: "anvil-06-torque-patch/0",
    sourcePatchId,
    sourceTarget: { ...patch.target },
    resolvedBearingId: relation.sourceBearingId,
    torque,
  };
  assertTorquePatchBindingCurrent(result);
  return result;
}

/**
 * Fail-closed guard against a valid-looking stale action. Body existence is not
 * sufficient: the disposable action must agree exactly with the current
 * BEARING relation and persistent endpoint provenance.
 */
export function assertTorquePatchBindingCurrent(compilation: TorquePatchCompilation): void {
  const bearing = compilation.torque.bearing;
  const relation = bearing.relation;
  const action = compilation.torque.action;
  validateBearingCompilation(bearing);

  const matchesA = sameEndpoint(compilation.sourceTarget, relation.endpointA);
  const matchesB = sameEndpoint(compilation.sourceTarget, relation.endpointB);
  if (Number(matchesA) + Number(matchesB) !== 1) {
    throw new Error("ANVIL-10 compilation source target is not a unique current bearing endpoint");
  }
  if (compilation.resolvedBearingId !== relation.sourceBearingId) {
    throw new Error("ANVIL-10 resolved persistent bearing identity is stale");
  }
  if (action.sourceTorqueId !== compilation.sourcePatchId) {
    throw new Error("ANVIL-10 torque action source identity is stale");
  }
  if (action.sourceBearingId !== relation.sourceBearingId) {
    throw new Error("ANVIL-10 torque action bearing identity is stale");
  }
  if (action.bodyAId !== relation.bodyAId || action.bodyBId !== relation.bodyBId) {
    throw new Error(
      `ANVIL-10 stale torque action body binding: action ${action.bodyAId}/${action.bodyBId}, current relation ${relation.bodyAId}/${relation.bodyBId}`,
    );
  }

  const targetBodyId = bearing.physicalPlan.cellToBody[compilation.sourceTarget.cellId];
  const expectedTargetBodyId = matchesA ? relation.bodyAId : relation.bodyBId;
  if (targetBodyId !== expectedTargetBodyId) {
    throw new Error("ANVIL-10 source target no longer belongs to the action's current bearing endpoint body");
  }
}
