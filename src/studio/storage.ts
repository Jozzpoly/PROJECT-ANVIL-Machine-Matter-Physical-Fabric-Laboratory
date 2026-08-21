import type { StudioGridFace, StudioSourceV0 } from "./workspace.js";
import { cloneStudioSource } from "./workspace.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

const FACES = new Set<StudioGridFace>(["x-", "x+", "y-", "y+", "z-", "z+"]);
const AXES = new Set(["x", "y", "z"]);

function assertEndpoint(value: unknown, label: string): void {
  if (!isRecord(value) || typeof value.cellId !== "string" || !FACES.has(value.face as StudioGridFace)) {
    throw new Error(`${label} is not a valid cell/face endpoint`);
  }
}

export function parseStudioSource(text: string): StudioSourceV0 {
  let value: unknown;
  try {
    value = JSON.parse(text) as unknown;
  } catch {
    throw new Error("Studio workspace is not valid JSON");
  }

  if (!isRecord(value) || value.schema !== "anvil-studio-source/0") {
    throw new Error("Unsupported Studio workspace schema");
  }
  if (!isRecord(value.matter) || value.matter.schema !== "anvil-matter/0") {
    throw new Error("Studio workspace has no supported Matter document");
  }
  const matter = value.matter;
  if (typeof matter.revision !== "string" || !isFiniteNumber(matter.cellSizeM) || matter.cellSizeM <= 0) {
    throw new Error("Studio workspace Matter header is malformed");
  }
  if (!Array.isArray(matter.materials) || !Array.isArray(matter.cells)) {
    throw new Error("Studio workspace Matter collections are malformed");
  }
  for (const material of matter.materials) {
    if (
      !isRecord(material) ||
      typeof material.id !== "string" ||
      !isFiniteNumber(material.densityKgM3) ||
      !isFiniteNumber(material.friction) ||
      typeof material.displayColor !== "string"
    ) {
      throw new Error("Studio workspace contains a malformed material");
    }
  }
  for (const cell of matter.cells) {
    if (
      !isRecord(cell) ||
      typeof cell.id !== "string" ||
      typeof cell.materialId !== "string" ||
      !isRecord(cell.grid) ||
      !isFiniteNumber(cell.grid.x) ||
      !isFiniteNumber(cell.grid.y) ||
      !isFiniteNumber(cell.grid.z)
    ) {
      throw new Error("Studio workspace contains a malformed Matter cell");
    }
  }

  if (!Array.isArray(value.bearings) || !Array.isArray(value.torquePatches)) {
    throw new Error("Studio workspace local-meaning collections are malformed");
  }
  for (const bearing of value.bearings) {
    if (!isRecord(bearing) || typeof bearing.id !== "string" || !AXES.has(bearing.freeAxis)) {
      throw new Error("Studio workspace contains a malformed Bearing mark");
    }
    assertEndpoint(bearing.endpointA, "Bearing endpoint A");
    assertEndpoint(bearing.endpointB, "Bearing endpoint B");
  }
  for (const patch of value.torquePatches) {
    if (!isRecord(patch) || typeof patch.id !== "string" || !isFiniteNumber(patch.effortNm)) {
      throw new Error("Studio workspace contains a malformed TorquePatch");
    }
    assertEndpoint(patch.target, "TorquePatch target");
  }

  return cloneStudioSource(value as unknown as StudioSourceV0);
}

export function serializeStudioSource(source: StudioSourceV0): string {
  return `${JSON.stringify(source, null, 2)}\n`;
}

export function downloadStudioSource(source: StudioSourceV0, filename = "anvil-studio.json"): void {
  const blob = new Blob([serializeStudioSource(source)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function readStudioSourceFile(file: File): Promise<StudioSourceV0> {
  return parseStudioSource(await file.text());
}
