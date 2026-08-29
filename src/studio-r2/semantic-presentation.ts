import type { BearingAxis, BearingEndpoint, BearingRuntimeSnapshot } from "../experiments/anvil-02-bearing.js";
import type { GridPosition, Vec3 } from "../model.js";
import type { FreedomRealizationPlan } from "../studio-recovery/realize.js";
import type { FreedomSourceV0, GridFace } from "../studio-recovery/source.js";
import { shouldDiscloseBearingOpportunity } from "./actionability-disclosure.js";
import { R2WorldCanvas } from "./world.js";

interface ScreenPoint {
  readonly x: number;
  readonly y: number;
  readonly depth: number;
}

interface CameraState {
  yaw: number;
  pitch: number;
  distance: number;
  target: Vec3;
}

interface PresentationState {
  source: FreedomSourceV0 | null;
  evidence: FreedomRealizationPlan | null;
  runtimePlan: FreedomRealizationPlan | null;
  runtimeBodies: readonly BearingRuntimeSnapshot[];
  camera: CameraState;
}

const FACE_OFFSETS: Readonly<Record<GridFace, GridPosition>> = Object.freeze({
  "x-": { x: -1, y: 0, z: 0 },
  "x+": { x: 1, y: 0, z: 0 },
  "y-": { x: 0, y: -1, z: 0 },
  "y+": { x: 0, y: 1, z: 0 },
  "z-": { x: 0, y: 0, z: -1 },
  "z+": { x: 0, y: 0, z: 1 },
});

const FACE_NORMALS: Readonly<Record<GridFace, Vec3>> = FACE_OFFSETS;

const OPPOSITE: Readonly<Record<GridFace, GridFace>> = Object.freeze({
  "x-": "x+",
  "x+": "x-",
  "y-": "y+",
  "y+": "y-",
  "z-": "z+",
  "z+": "z-",
});

const AXES: Readonly<Record<BearingAxis, Vec3>> = Object.freeze({
  x: { x: 1, y: 0, z: 0 },
  y: { x: 0, y: 1, z: 0 },
  z: { x: 0, y: 0, z: 1 },
});

const states = new WeakMap<R2WorldCanvas, PresentationState>();
let installed = false;

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function subtract(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(value: Vec3, scalar: number): Vec3 {
  return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar };
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function normalize(value: Vec3): Vec3 {
  const length = Math.hypot(value.x, value.y, value.z);
  return length <= 1e-12 ? { x: 0, y: 0, z: 0 } : scale(value, 1 / length);
}

function addGrid(a: GridPosition, b: GridPosition): GridPosition {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function gridKey(grid: GridPosition): string {
  return `${grid.x},${grid.y},${grid.z}`;
}

function sameEndpoint(a: BearingEndpoint, b: BearingEndpoint): boolean {
  return a.cellId === b.cellId && a.face === b.face;
}

function endpointKey(endpoint: BearingEndpoint): string {
  return `${endpoint.cellId}@${endpoint.face}`;
}

function canonicalInterfaceKey(a: string, b: string): string {
  return a.localeCompare(b) <= 0 ? `${a}\u0000${b}` : `${b}\u0000${a}`;
}

function rotateByQuat(
  rotation: { readonly x: number; readonly y: number; readonly z: number; readonly w: number },
  value: Vec3,
): Vec3 {
  const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
  const t = cross(qv, value);
  const doubled = scale(t, 2);
  return add(value, add(scale(doubled, rotation.w), cross(qv, doubled)));
}

function stateFor(world: R2WorldCanvas): PresentationState {
  const existing = states.get(world);
  if (existing !== undefined) return existing;
  const created: PresentationState = {
    source: null,
    evidence: null,
    runtimePlan: null,
    runtimeBodies: [],
    camera: {
      yaw: -0.72,
      pitch: 0.48,
      distance: 6.5,
      target: { x: 0.5, y: 0, z: 0 },
    },
  };
  states.set(world, created);
  return created;
}

function cameraPosition(camera: CameraState): Vec3 {
  const c = Math.cos(camera.pitch);
  return {
    x: camera.target.x + camera.distance * c * Math.sin(camera.yaw),
    y: camera.target.y + camera.distance * Math.sin(camera.pitch),
    z: camera.target.z + camera.distance * c * Math.cos(camera.yaw),
  };
}

function cameraBasis(camera: CameraState): { position: Vec3; forward: Vec3; right: Vec3; up: Vec3 } {
  const position = cameraPosition(camera);
  const forward = normalize(subtract(camera.target, position));
  let right = normalize(cross(forward, { x: 0, y: 1, z: 0 }));
  if (Math.hypot(right.x, right.y, right.z) < 1e-6) right = { x: 1, y: 0, z: 0 };
  return { position, forward, right, up: normalize(cross(right, forward)) };
}

function project(canvas: HTMLCanvasElement, camera: CameraState, point: Vec3): ScreenPoint | null {
  const rect = canvas.getBoundingClientRect();
  const basis = cameraBasis(camera);
  const relative = subtract(point, basis.position);
  const depth = dot(relative, basis.forward);
  if (depth <= 0.05) return null;
  const focal = rect.height / (2 * Math.tan((Math.PI / 3.2) / 2));
  return {
    x: rect.width / 2 + (dot(relative, basis.right) / depth) * focal,
    y: rect.height / 2 - (dot(relative, basis.up) / depth) * focal,
    depth,
  };
}

function authoredCenter(source: FreedomSourceV0, cellId: string): Vec3 | null {
  const cell = source.matter.cells.find((candidate) => candidate.id === cellId);
  if (cell === undefined) return null;
  const s = source.matter.cellSizeM;
  return { x: (cell.grid.x + 0.5) * s, y: (cell.grid.y + 0.5) * s, z: (cell.grid.z + 0.5) * s };
}

function axisScreenDirection(
  canvas: HTMLCanvasElement,
  camera: CameraState,
  worldPoint: Vec3,
  axis: Vec3,
): { readonly x: number; readonly y: number } | null {
  const center = project(canvas, camera, worldPoint);
  const end = project(canvas, camera, add(worldPoint, scale(normalize(axis), 0.45)));
  if (center === null || end === null) return null;
  const dx = end.x - center.x;
  const dy = end.y - center.y;
  const length = Math.hypot(dx, dy);
  if (length < 1.5) return null;
  return { x: dx / length, y: dy / length };
}

function drawRing(
  context: CanvasRenderingContext2D,
  screen: ScreenPoint,
  radius: number,
  color: string,
  lineWidth: number,
  dash: readonly number[] = [],
): void {
  context.save();
  context.setLineDash([...dash]);
  context.beginPath();
  context.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.stroke();
  context.restore();
}

function drawAxis(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  camera: CameraState,
  worldPoint: Vec3,
  axis: Vec3,
  color: string,
  lineWidth = 2,
): void {
  const screen = project(canvas, camera, worldPoint);
  if (screen === null) return;
  const direction = axisScreenDirection(canvas, camera, worldPoint, axis);
  context.save();
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = lineWidth;
  if (direction === null) {
    context.beginPath();
    context.arc(screen.x, screen.y, 3.1, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(screen.x, screen.y, 1.25, 0, Math.PI * 2);
    context.fill();
  } else {
    const half = 15;
    context.beginPath();
    context.moveTo(screen.x - direction.x * half, screen.y - direction.y * half);
    context.lineTo(screen.x + direction.x * half, screen.y + direction.y * half);
    context.stroke();
    context.beginPath();
    context.arc(screen.x - direction.x * half, screen.y - direction.y * half, 1.5, 0, Math.PI * 2);
    context.arc(screen.x + direction.x * half, screen.y + direction.y * half, 1.5, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function drawSeamTarget(
  context: CanvasRenderingContext2D,
  screen: ScreenPoint,
  emphasized: boolean,
): void {
  context.save();
  context.strokeStyle = emphasized ? "rgba(205,225,232,0.78)" : "rgba(172,195,203,0.42)";
  context.lineWidth = emphasized ? 1.5 : 1.05;
  context.beginPath();
  context.arc(screen.x, screen.y, emphasized ? 6 : 5, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.moveTo(screen.x - 2.7, screen.y);
  context.lineTo(screen.x + 2.7, screen.y);
  context.moveTo(screen.x, screen.y - 2.7);
  context.lineTo(screen.x, screen.y + 2.7);
  context.stroke();
  context.restore();
}

function drawPatch(
  context: CanvasRenderingContext2D,
  screen: ScreenPoint,
  resolved: boolean,
): void {
  context.save();
  if (!resolved) context.setLineDash([2, 2]);
  context.beginPath();
  context.moveTo(screen.x, screen.y - 5);
  context.lineTo(screen.x + 5, screen.y);
  context.lineTo(screen.x, screen.y + 5);
  context.lineTo(screen.x - 5, screen.y);
  context.closePath();
  context.fillStyle = resolved ? "rgba(242,162,83,0.22)" : "rgba(220,167,91,0.13)";
  context.strokeStyle = resolved ? "rgba(242,162,83,0.96)" : "rgba(220,167,91,0.78)";
  context.lineWidth = 1.4;
  context.fill();
  context.stroke();
  context.restore();
}

function drawArrow(
  context: CanvasRenderingContext2D,
  start: { readonly x: number; readonly y: number },
  direction: { readonly x: number; readonly y: number },
  sign: number,
): void {
  if (sign === 0) return;
  const dx = direction.x * sign;
  const dy = direction.y * sign;
  const end = { x: start.x + dx * 17, y: start.y + dy * 17 };
  context.save();
  context.strokeStyle = "rgba(242,162,83,0.96)";
  context.fillStyle = "rgba(242,162,83,0.96)";
  context.lineWidth = 1.8;
  context.beginPath();
  context.moveTo(start.x - dx * 8, start.y - dy * 8);
  context.lineTo(end.x, end.y);
  context.stroke();
  const perpendicular = { x: -dy, y: dx };
  context.beginPath();
  context.moveTo(end.x, end.y);
  context.lineTo(end.x - dx * 6 + perpendicular.x * 3.5, end.y - dy * 6 + perpendicular.y * 3.5);
  context.lineTo(end.x - dx * 6 - perpendicular.x * 3.5, end.y - dy * 6 - perpendicular.y * 3.5);
  context.closePath();
  context.fill();
  context.restore();
}

function drawTorque(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  camera: CameraState,
  worldPoint: Vec3,
  axis: Vec3 | null,
  effortNm: number,
  resolved: boolean,
): void {
  const screen = project(canvas, camera, worldPoint);
  if (screen === null) return;
  drawPatch(context, screen, resolved);
  const direction = axis === null ? null : axisScreenDirection(canvas, camera, worldPoint, axis);
  if (direction !== null) {
    const perpendicular = { x: -direction.y, y: direction.x };
    drawArrow(
      context,
      { x: screen.x + perpendicular.x * 8, y: screen.y + perpendicular.y * 8 },
      direction,
      Math.sign(effortNm),
    );
    return;
  }
  context.save();
  context.font = "600 10px ui-sans-serif, system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = resolved ? "rgba(255,205,151,0.95)" : "rgba(225,188,136,0.82)";
  context.fillText(effortNm > 0 ? "+" : effortNm < 0 ? "−" : "0", screen.x + 11, screen.y - 10);
  context.restore();
}

function drawAuthoredPresentation(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: PresentationState,
): void {
  const source = state.source;
  if (source === null) return;
  const evidence = state.evidence;
  const byGrid = new Map(source.matter.cells.map((cell) => [gridKey(cell.grid), cell] as const));
  const byId = new Map(source.matter.cells.map((cell) => [cell.id, cell] as const));
  const representedBearingIds = new Set<string>();
  const representedTorqueIds = new Set<string>();
  const seen = new Set<string>();
  const realizedBearings = new Set(evidence?.bearings.map((entry) => entry.sourceBearingId) ?? []);
  const realizedTorques = new Set(evidence?.torques.map((entry) => entry.sourcePatchId) ?? []);
  const diagnosticCodes = new Map<string, Set<string>>();
  for (const diagnostic of evidence?.diagnostics ?? []) {
    const codes = diagnosticCodes.get(diagnostic.sourceId) ?? new Set<string>();
    codes.add(diagnostic.code);
    diagnosticCodes.set(diagnostic.sourceId, codes);
  }
  const shell = document.querySelector<HTMLElement>(".r2-studio");
  const intentActive = shell?.dataset.intent !== undefined && shell.dataset.intent !== "neutral";
  const s = source.matter.cellSizeM;
  const canvasRect = canvas.getBoundingClientRect();

  for (const cell of source.matter.cells) {
    const center = authoredCenter(source, cell.id);
    if (center === null) continue;
    for (const face of Object.keys(FACE_OFFSETS) as GridFace[]) {
      const neighbor = byGrid.get(gridKey(addGrid(cell.grid, FACE_OFFSETS[face])));
      if (neighbor === undefined) continue;
      const key = canonicalInterfaceKey(cell.id, neighbor.id);
      if (seen.has(key)) continue;
      seen.add(key);
      const endpointA: BearingEndpoint = { cellId: cell.id, face };
      const endpointB: BearingEndpoint = { cellId: neighbor.id, face: OPPOSITE[face] };
      const bearings = source.bearings.filter((bearing) =>
        (sameEndpoint(bearing.endpointA, endpointA) && sameEndpoint(bearing.endpointB, endpointB)) ||
        (sameEndpoint(bearing.endpointA, endpointB) && sameEndpoint(bearing.endpointB, endpointA)),
      );
      const torques = source.torquePatches.filter((patch) => sameEndpoint(patch.target, endpointA) || sameEndpoint(patch.target, endpointB));
      for (const bearing of bearings) representedBearingIds.add(bearing.id);
      for (const patch of torques) representedTorqueIds.add(patch.id);
      const worldPoint = add(center, scale(FACE_NORMALS[face], s / 2));
      const screen = project(canvas, state.camera, worldPoint);
      if (screen === null) continue;

      if (bearings.length === 0 && torques.length === 0) {
        if (shouldDiscloseBearingOpportunity(screen, canvasRect)) drawSeamTarget(context, screen, intentActive);
        continue;
      }

      const conflicted = bearings.some((bearing) => {
        const codes = diagnosticCodes.get(bearing.id);
        return codes?.has("DUPLICATE_SEAM") === true || codes?.has("DUPLICATE_ID") === true;
      });
      const unresolved = bearings.some((bearing) => !realizedBearings.has(bearing.id));
      const bearingColor = conflicted
        ? "rgba(184,130,235,0.98)"
        : unresolved
          ? "rgba(213,183,99,0.95)"
          : "rgba(75,199,193,0.96)";
      if (bearings.length > 0) {
        drawRing(context, screen, 10, bearingColor, 2.2, conflicted ? [4, 3] : unresolved ? [3, 3] : []);
        for (const bearing of bearings) drawAxis(context, canvas, state.camera, worldPoint, AXES[bearing.freeAxis], bearingColor, 1.8);
      }

      const uniqueAxis = bearings.length === 1 ? AXES[bearings[0]?.freeAxis ?? "z"] : null;
      for (const patch of torques) {
        drawTorque(context, canvas, state.camera, worldPoint, uniqueAxis, patch.effortNm, realizedTorques.has(patch.id));
      }
    }
  }

  for (const bearing of source.bearings) {
    if (representedBearingIds.has(bearing.id)) continue;
    const hasA = byId.has(bearing.endpointA.cellId);
    const hasB = byId.has(bearing.endpointB.cellId);
    if (hasA === hasB) continue;
    const anchor = hasA ? bearing.endpointA : bearing.endpointB;
    const center = authoredCenter(source, anchor.cellId);
    if (center === null) continue;
    const worldPoint = add(center, scale(FACE_NORMALS[anchor.face], s / 2));
    const screen = project(canvas, state.camera, worldPoint);
    if (screen === null) continue;
    const codes = diagnosticCodes.get(bearing.id);
    const conflicted = codes?.has("DUPLICATE_SEAM") === true || codes?.has("DUPLICATE_ID") === true;
    const color = conflicted ? "rgba(184,130,235,0.98)" : "rgba(213,183,99,0.95)";
    drawRing(context, screen, 10, color, 2.2, [4, 3]);
    drawAxis(context, canvas, state.camera, worldPoint, AXES[bearing.freeAxis], color, 1.8);
    const torques = source.torquePatches.filter((patch) => sameEndpoint(patch.target, bearing.endpointA) || sameEndpoint(patch.target, bearing.endpointB));
    for (const patch of torques) {
      representedTorqueIds.add(patch.id);
      drawTorque(context, canvas, state.camera, worldPoint, AXES[bearing.freeAxis], patch.effortNm, false);
    }
  }

  for (const patch of source.torquePatches) {
    if (representedTorqueIds.has(patch.id) || !byId.has(patch.target.cellId)) continue;
    const center = authoredCenter(source, patch.target.cellId);
    if (center === null) continue;
    const worldPoint = add(center, scale(FACE_NORMALS[patch.target.face], s / 2));
    drawTorque(context, canvas, state.camera, worldPoint, null, patch.effortNm, false);
  }
}

function runtimeBearingPose(
  bearing: FreedomRealizationPlan["bearings"][number],
  snapshots: ReadonlyMap<string, BearingRuntimeSnapshot>,
): { readonly pivot: Vec3; readonly axis: Vec3 } | null {
  const bodyA = snapshots.get(bearing.bodyAId);
  const bodyB = snapshots.get(bearing.bodyBId);
  if (bodyA === undefined || bodyB === undefined) return null;
  const pivotA = add(bodyA.position, rotateByQuat(bodyA.rotation, bearing.localAnchorA));
  const pivotB = add(bodyB.position, rotateByQuat(bodyB.rotation, bearing.localAnchorB));
  const axisA = rotateByQuat(bodyA.rotation, bearing.axisWorld);
  const axisB = rotateByQuat(bodyB.rotation, bearing.axisWorld);
  const combinedAxis = normalize(add(axisA, axisB));
  return {
    pivot: scale(add(pivotA, pivotB), 0.5),
    axis: Math.hypot(combinedAxis.x, combinedAxis.y, combinedAxis.z) > 1e-6 ? combinedAxis : normalize(axisA),
  };
}

function drawRuntimePresentation(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: PresentationState,
): void {
  const plan = state.runtimePlan;
  if (plan === null) return;
  const snapshots = new Map(state.runtimeBodies.map((body) => [body.planBodyId, body] as const));
  const bearingPoses = new Map<string, { readonly pivot: Vec3; readonly axis: Vec3 }>();

  for (const bearing of plan.bearings) {
    const pose = runtimeBearingPose(bearing, snapshots);
    if (pose === null) continue;
    bearingPoses.set(bearing.sourceBearingId, pose);
    const screen = project(canvas, state.camera, pose.pivot);
    if (screen === null) continue;
    drawRing(context, screen, 13, "rgba(75,199,193,0.28)", 1.2);
    drawRing(context, screen, 9, "rgba(75,199,193,0.96)", 2.1);
    drawAxis(context, canvas, state.camera, pose.pivot, pose.axis, "rgba(107,225,218,0.94)", 2);
  }

  for (const torque of plan.torques) {
    const pose = bearingPoses.get(torque.sourceBearingId);
    if (pose === undefined) continue;
    drawTorque(context, canvas, state.camera, pose.pivot, pose.axis, torque.effortNm, true);
  }
}

function drawPresentation(world: R2WorldCanvas): void {
  const canvas = document.querySelector<HTMLCanvasElement>("canvas[data-r2-world]");
  if (canvas === null) return;
  const context = canvas.getContext("2d");
  if (context === null) return;
  const state = stateFor(world);
  if (state.runtimePlan === null) drawAuthoredPresentation(context, canvas, state);
  else drawRuntimePresentation(context, canvas, state);
}

export function installSemanticPresentation(): void {
  if (installed) return;
  installed = true;

  const originalSetSource = R2WorldCanvas.prototype.setSource;
  R2WorldCanvas.prototype.setSource = function setSourceWithPresentation(
    this: R2WorldCanvas,
    source: FreedomSourceV0,
    evidence: FreedomRealizationPlan,
  ): void {
    const state = stateFor(this);
    state.source = source;
    state.evidence = evidence;
    originalSetSource.call(this, source, evidence);
  };

  const originalSetRuntime = R2WorldCanvas.prototype.setRuntime;
  R2WorldCanvas.prototype.setRuntime = function setRuntimeWithPresentation(
    this: R2WorldCanvas,
    plan: FreedomRealizationPlan,
    bodies: readonly BearingRuntimeSnapshot[],
  ): void {
    const state = stateFor(this);
    state.runtimePlan = plan;
    state.runtimeBodies = bodies;
    originalSetRuntime.call(this, plan, bodies);
  };

  const originalClearRuntime = R2WorldCanvas.prototype.clearRuntime;
  R2WorldCanvas.prototype.clearRuntime = function clearRuntimeWithPresentation(this: R2WorldCanvas): void {
    const state = stateFor(this);
    state.runtimePlan = null;
    state.runtimeBodies = [];
    originalClearRuntime.call(this);
  };

  const originalOrbit = R2WorldCanvas.prototype.orbit;
  R2WorldCanvas.prototype.orbit = function orbitWithPresentation(this: R2WorldCanvas, deltaX: number, deltaY: number): void {
    const camera = stateFor(this).camera;
    camera.yaw -= deltaX * 0.007;
    camera.pitch = Math.max(-1.25, Math.min(1.25, camera.pitch + deltaY * 0.007));
    originalOrbit.call(this, deltaX, deltaY);
  };

  const originalPan = R2WorldCanvas.prototype.pan;
  R2WorldCanvas.prototype.pan = function panWithPresentation(this: R2WorldCanvas, deltaX: number, deltaY: number): void {
    const camera = stateFor(this).camera;
    const basis = cameraBasis(camera);
    const factor = camera.distance * 0.0014;
    camera.target = add(camera.target, add(scale(basis.right, -deltaX * factor), scale(basis.up, deltaY * factor)));
    originalPan.call(this, deltaX, deltaY);
  };

  const originalZoom = R2WorldCanvas.prototype.zoom;
  R2WorldCanvas.prototype.zoom = function zoomWithPresentation(this: R2WorldCanvas, deltaY: number): void {
    const camera = stateFor(this).camera;
    camera.distance = Math.max(1.6, Math.min(28, camera.distance * Math.exp(deltaY * 0.0012)));
    originalZoom.call(this, deltaY);
  };

  const originalFocusSource = R2WorldCanvas.prototype.focusSource;
  R2WorldCanvas.prototype.focusSource = function focusSourceWithPresentation(this: R2WorldCanvas): void {
    const state = stateFor(this);
    const source = state.source;
    if (source === null || source.matter.cells.length === 0) {
      state.camera.target = { x: 0, y: 0, z: 0 };
      state.camera.distance = 6;
    } else {
      const s = source.matter.cellSizeM;
      let min = { x: Infinity, y: Infinity, z: Infinity };
      let max = { x: -Infinity, y: -Infinity, z: -Infinity };
      for (const cell of source.matter.cells) {
        const center = { x: (cell.grid.x + 0.5) * s, y: (cell.grid.y + 0.5) * s, z: (cell.grid.z + 0.5) * s };
        min = { x: Math.min(min.x, center.x), y: Math.min(min.y, center.y), z: Math.min(min.z, center.z) };
        max = { x: Math.max(max.x, center.x), y: Math.max(max.y, center.y), z: Math.max(max.z, center.z) };
      }
      state.camera.target = scale(add(min, max), 0.5);
      const extent = Math.max(max.x - min.x, max.y - min.y, max.z - min.z, s);
      state.camera.distance = Math.max(3, extent * 2.4 + 2);
    }
    originalFocusSource.call(this);
  };

  const originalDraw = R2WorldCanvas.prototype.draw;
  R2WorldCanvas.prototype.draw = function drawWithPresentation(this: R2WorldCanvas): void {
    originalDraw.call(this);
    drawPresentation(this);
  };
}
