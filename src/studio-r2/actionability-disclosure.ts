import type { BearingEndpoint } from "../experiments/anvil-02-bearing.js";
import type { GridPosition } from "../model.js";
import type { FreedomSourceV0, GridFace } from "../studio-recovery/source.js";

export type WER1ActionabilityPolicy = "baseline" | "global" | "local";

export interface BearingOpportunity {
  readonly key: string;
  readonly endpointA: BearingEndpoint;
  readonly endpointB: BearingEndpoint;
}

export const WER1_LOCAL_WAKE_RADIUS_PX = 96;

const FACE_OFFSETS: Readonly<Record<GridFace, GridPosition>> = Object.freeze({
  "x-": { x: -1, y: 0, z: 0 },
  "x+": { x: 1, y: 0, z: 0 },
  "y-": { x: 0, y: -1, z: 0 },
  "y+": { x: 0, y: 1, z: 0 },
  "z-": { x: 0, y: 0, z: -1 },
  "z+": { x: 0, y: 0, z: 1 },
});

const OPPOSITE: Readonly<Record<GridFace, GridFace>> = Object.freeze({
  "x-": "x+",
  "x+": "x-",
  "y-": "y+",
  "y+": "y-",
  "z-": "z+",
  "z+": "z-",
});

let pointerClient: { readonly x: number; readonly y: number } | null = null;
let pointerListenersInstalled = false;

function gridKey(grid: GridPosition): string {
  return `${grid.x},${grid.y},${grid.z}`;
}

function endpointKey(endpoint: BearingEndpoint): string {
  return `${endpoint.cellId}@${endpoint.face}`;
}

function canonicalOpportunityKey(a: BearingEndpoint, b: BearingEndpoint): string {
  const left = endpointKey(a);
  const right = endpointKey(b);
  return left.localeCompare(right) <= 0 ? `${left}\u0000${right}` : `${right}\u0000${left}`;
}

function installPointerListeners(): void {
  if (pointerListenersInstalled || typeof window === "undefined") return;
  pointerListenersInstalled = true;
  const remember = (event: PointerEvent): void => {
    pointerClient = { x: event.clientX, y: event.clientY };
  };
  window.addEventListener("pointermove", remember, { capture: true, passive: true });
  window.addEventListener("pointerdown", remember, { capture: true, passive: true });
}

installPointerListeners();

export function currentWER1Policy(): WER1ActionabilityPolicy {
  if (typeof window === "undefined") return "baseline";
  const value = new URLSearchParams(window.location.search).get("wer1");
  return value === "global" || value === "local" ? value : "baseline";
}

export function currentR2Intent(): string {
  if (typeof document === "undefined") return "neutral";
  return document.querySelector<HTMLElement>(".r2-studio")?.dataset.intent ?? "neutral";
}

export function enumerateBearingOpportunities(source: FreedomSourceV0): readonly BearingOpportunity[] {
  const byGrid = new Map(source.matter.cells.map((cell) => [gridKey(cell.grid), cell] as const));
  const seen = new Set<string>();
  const opportunities: BearingOpportunity[] = [];

  for (const cell of source.matter.cells) {
    for (const face of Object.keys(FACE_OFFSETS) as GridFace[]) {
      const offset = FACE_OFFSETS[face];
      const neighbor = byGrid.get(gridKey({
        x: cell.grid.x + offset.x,
        y: cell.grid.y + offset.y,
        z: cell.grid.z + offset.z,
      }));
      if (neighbor === undefined) continue;
      const endpointA: BearingEndpoint = { cellId: cell.id, face };
      const endpointB: BearingEndpoint = { cellId: neighbor.id, face: OPPOSITE[face] };
      const key = canonicalOpportunityKey(endpointA, endpointB);
      if (seen.has(key)) continue;
      seen.add(key);
      opportunities.push({ key, endpointA, endpointB });
    }
  }

  return opportunities;
}

export function shouldDiscloseBearingOpportunity(
  screen: { readonly x: number; readonly y: number },
  canvasRect: Pick<DOMRect, "left" | "top">,
): boolean {
  const policy = currentWER1Policy();
  if (policy === "baseline") return true;

  const intent = currentR2Intent();
  if (intent === "neutral") return false;
  if (intent !== "bearing") return true;
  if (policy === "global") return true;

  const pointer = pointerClient;
  if (pointer === null) return false;
  const localX = pointer.x - canvasRect.left;
  const localY = pointer.y - canvasRect.top;
  return Math.hypot(screen.x - localX, screen.y - localY) <= WER1_LOCAL_WAKE_RADIUS_PX;
}

export function localWakeNeedsRefresh(): boolean {
  return currentWER1Policy() !== "baseline" && currentR2Intent() === "bearing";
}
