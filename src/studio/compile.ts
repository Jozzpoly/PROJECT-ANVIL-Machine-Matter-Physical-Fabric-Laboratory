import { compileMatter } from "../compiler.js";
import type { PhysicalPlan } from "../model.js";
import {
  compileBearing,
  type BearingCompilation,
  type BearingEndpoint,
  type BearingMark,
} from "../experiments/anvil-02-bearing.js";
import type { TorquePatchCompilation } from "../experiments/anvil-06-torque-patch.js";
import { relowerTorquePatchToBearing } from "../experiments/anvil-10-torque-patch-rebind.js";
import type { StudioSourceV0 } from "./workspace.js";

export type StudioAuthoredValidity = "VALID" | "INVALID";
export type StudioCompositionSupport = "SUPPORTED" | "UNSUPPORTED";
export type StudioRunReadiness = "READY" | "INCOMPLETE";

export type StudioIssueCode =
  | "MATTER_INVALID"
  | "BEARING_INVALID"
  | "BEARING_TOPOLOGY_NOT_QUALIFIED"
  | "MULTI_BEARING_NOT_QUALIFIED"
  | "TORQUE_PATCH_INVALID"
  | "MULTI_TORQUE_PATCH_NOT_QUALIFIED";

export interface StudioIssue {
  readonly code: StudioIssueCode;
  readonly sourceId?: string;
  readonly message: string;
  readonly detail?: string;
}

export interface StudioBearingProductCompilation {
  readonly sourceId: string;
  readonly compilation: BearingCompilation;
}

export interface StudioTorquePatchProductCompilation {
  readonly sourceId: string;
  readonly compilation: TorquePatchCompilation;
}

export interface StudioClassification {
  readonly sourceGeneration: number;
  readonly authoredValidity: StudioAuthoredValidity;
  readonly compositionSupport: StudioCompositionSupport;
  readonly runReadiness: StudioRunReadiness;
  readonly issues: readonly StudioIssue[];
  readonly matterPlan: PhysicalPlan | null;
  readonly bearings: readonly StudioBearingProductCompilation[];
  readonly torquePatches: readonly StudioTorquePatchProductCompilation[];
}

type BearingProductResult =
  | {
      readonly kind: "VALID";
      readonly source: BearingMark;
      readonly compilation: BearingCompilation;
    }
  | {
      readonly kind: "UNSUPPORTED";
      readonly source: BearingMark;
    }
  | {
      readonly kind: "INVALID";
      readonly source: BearingMark;
    };

const VALID_FACES = new Set(["x-", "x+", "y-", "y+", "z-", "z+"]);

const MATTER_INVALID_PATTERNS: readonly RegExp[] = [
  /^cellSizeM must be finite and positive$/u,
  /^duplicate material id:/u,
  /^invalid density for material /u,
  /^duplicate cell id:/u,
  /^two authored cells occupy /u,
  /^cell .* references unknown material /u,
];

const BEARING_INVALID_PATTERNS: readonly RegExp[] = [
  /^bearing id must be non-empty$/u,
  /^bearing endpoints must reference two cells$/u,
  /^bearing references unknown endpoint cell:/u,
  /^bearing endpoint faces must be opposite:/u,
  /^bearing endpoints are not adjacent through the declared faces:/u,
  /^bearing free axis .* is normal to shared face /u,
];

const BEARING_TOPOLOGY_UNSUPPORTED =
  "bearing seam does not split rigid connectivity; an alternate rigid path bypasses the interface";

const TORQUE_INVALID_PATTERNS: readonly RegExp[] = [
  /^ANVIL-10 patch id must be non-empty$/u,
  /^ANVIL-10 effortNm must be finite$/u,
  /^ANVIL-10 patch face .* is invalid$/u,
  /^ANVIL-10 patch target .* is not a unique current bearing endpoint$/u,
  /^ANVIL-10 patch target cell .* is absent from current provenance$/u,
];

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function matchesKnown(message: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(message));
}

function integrationFault(stage: string, sourceId: string | null, error: unknown): never {
  const location = sourceId === null ? stage : `${stage} ${sourceId}`;
  throw new Error(`Studio integration fault while evaluating ${location}: ${errorMessage(error)}`);
}

function sameEndpoint(a: BearingEndpoint, b: BearingEndpoint): boolean {
  return a.cellId === b.cellId && a.face === b.face;
}

function patchTargetsBearing(target: BearingEndpoint, bearing: BearingMark): boolean {
  return sameEndpoint(target, bearing.endpointA) || sameEndpoint(target, bearing.endpointB);
}

function duplicateIds(ids: readonly string[]): ReadonlySet<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id);
    else seen.add(id);
  }
  return duplicates;
}

function issue(
  code: StudioIssueCode,
  message: string,
  sourceId?: string,
  detail?: string,
): StudioIssue {
  return {
    code,
    message,
    ...(sourceId === undefined ? {} : { sourceId }),
    ...(detail === undefined ? {} : { detail }),
  };
}

export function classifyStudioSource(
  source: StudioSourceV0,
  sourceGeneration = 0,
): StudioClassification {
  const issues: StudioIssue[] = [];
  let matterPlan: PhysicalPlan;

  try {
    matterPlan = compileMatter(source.matter);
  } catch (error: unknown) {
    const detail = errorMessage(error);
    if (!matchesKnown(detail, MATTER_INVALID_PATTERNS)) integrationFault("Matter", null, error);
    return {
      sourceGeneration,
      authoredValidity: "INVALID",
      compositionSupport: "SUPPORTED",
      runReadiness: "INCOMPLETE",
      issues: [issue("MATTER_INVALID", "Matter source needs repair before it can be realized.", undefined, detail)],
      matterPlan: null,
      bearings: [],
      torquePatches: [],
    };
  }

  const duplicateBearingIds = duplicateIds(source.bearings.map((bearing) => bearing.id));
  const bearingResults: BearingProductResult[] = [];

  for (const bearing of source.bearings) {
    if (duplicateBearingIds.has(bearing.id)) {
      issues.push(issue(
        "BEARING_INVALID",
        "Bearing identity is duplicated and needs repair.",
        bearing.id,
        `duplicate Bearing id: ${bearing.id}`,
      ));
      bearingResults.push({ kind: "INVALID", source: bearing });
      continue;
    }

    try {
      const compilation = compileBearing({ matter: source.matter, bearing });
      bearingResults.push({ kind: "VALID", source: bearing, compilation });
    } catch (error: unknown) {
      const detail = errorMessage(error);
      if (detail === BEARING_TOPOLOGY_UNSUPPORTED) {
        issues.push(issue(
          "BEARING_TOPOLOGY_NOT_QUALIFIED",
          "This Bearing seam has another rigid path around it, so this topology is not qualified yet.",
          bearing.id,
          detail,
        ));
        bearingResults.push({ kind: "UNSUPPORTED", source: bearing });
        continue;
      }
      if (matchesKnown(detail, BEARING_INVALID_PATTERNS)) {
        issues.push(issue(
          "BEARING_INVALID",
          "Bearing intent does not currently form a valid local interface.",
          bearing.id,
          detail,
        ));
        bearingResults.push({ kind: "INVALID", source: bearing });
        continue;
      }
      integrationFault("Bearing", bearing.id, error);
    }
  }

  const locallyValidBearings = bearingResults.filter((result) => result.kind !== "INVALID");
  if (locallyValidBearings.length > 1) {
    issues.push(issue(
      "MULTI_BEARING_NOT_QUALIFIED",
      "Multiple Bearings can remain authored, but their joint composition is not qualified yet.",
    ));
  }

  const duplicatePatchIds = duplicateIds(source.torquePatches.map((patch) => patch.id));
  const validPatchCompilations: StudioTorquePatchProductCompilation[] = [];
  let locallyValidPatchCount = 0;
  const knownCellIds = new Set(source.matter.cells.map((cell) => cell.id));

  for (const patch of source.torquePatches) {
    if (
      duplicatePatchIds.has(patch.id) ||
      patch.id.trim().length === 0 ||
      !Number.isFinite(patch.effortNm) ||
      !knownCellIds.has(patch.target.cellId) ||
      !VALID_FACES.has(patch.target.face)
    ) {
      issues.push(issue(
        "TORQUE_PATCH_INVALID",
        "TorquePatch intent needs a valid local Bearing endpoint and finite effort.",
        patch.id,
      ));
      continue;
    }

    const bearingMatches = locallyValidBearings.filter((result) => patchTargetsBearing(patch.target, result.source));
    if (bearingMatches.length !== 1) {
      issues.push(issue(
        "TORQUE_PATCH_INVALID",
        "TorquePatch must target exactly one current authored Bearing endpoint.",
        patch.id,
      ));
      continue;
    }

    const bearingMatch = bearingMatches[0];
    if (bearingMatch === undefined) integrationFault("TorquePatch bearing match", patch.id, "missing match");
    locallyValidPatchCount += 1;

    if (bearingMatch.kind === "UNSUPPORTED") {
      continue;
    }
    if (bearingMatch.kind !== "VALID") integrationFault("TorquePatch bearing state", patch.id, bearingMatch.kind);

    try {
      validPatchCompilations.push({
        sourceId: patch.id,
        compilation: relowerTorquePatchToBearing(patch, bearingMatch.compilation),
      });
    } catch (error: unknown) {
      const detail = errorMessage(error);
      if (matchesKnown(detail, TORQUE_INVALID_PATTERNS)) {
        locallyValidPatchCount -= 1;
        issues.push(issue(
          "TORQUE_PATCH_INVALID",
          "TorquePatch no longer resolves cleanly to its current Bearing endpoint.",
          patch.id,
          detail,
        ));
        continue;
      }
      integrationFault("TorquePatch", patch.id, error);
    }
  }

  if (locallyValidPatchCount > 1) {
    issues.push(issue(
      "MULTI_TORQUE_PATCH_NOT_QUALIFIED",
      "Multiple TorquePatches can remain authored, but their joint action is not qualified yet.",
    ));
  }

  const authoredValidity: StudioAuthoredValidity = issues.some((candidate) =>
    candidate.code === "MATTER_INVALID" ||
    candidate.code === "BEARING_INVALID" ||
    candidate.code === "TORQUE_PATCH_INVALID"
  ) ? "INVALID" : "VALID";

  const compositionSupport: StudioCompositionSupport = issues.some((candidate) =>
    candidate.code === "BEARING_TOPOLOGY_NOT_QUALIFIED" ||
    candidate.code === "MULTI_BEARING_NOT_QUALIFIED" ||
    candidate.code === "MULTI_TORQUE_PATCH_NOT_QUALIFIED"
  ) ? "UNSUPPORTED" : "SUPPORTED";

  const validBearingCompilations: StudioBearingProductCompilation[] = bearingResults.flatMap((result) =>
    result.kind === "VALID"
      ? [{ sourceId: result.source.id, compilation: result.compilation }]
      : [],
  );

  const runReadiness: StudioRunReadiness =
    authoredValidity === "VALID" &&
    compositionSupport === "SUPPORTED" &&
    validBearingCompilations.length === 1 &&
    validPatchCompilations.length === 1 &&
    source.bearings.length === 1 &&
    source.torquePatches.length === 1
      ? "READY"
      : "INCOMPLETE";

  return {
    sourceGeneration,
    authoredValidity,
    compositionSupport,
    runReadiness,
    issues,
    matterPlan,
    bearings: validBearingCompilations,
    torquePatches: validPatchCompilations,
  };
}
