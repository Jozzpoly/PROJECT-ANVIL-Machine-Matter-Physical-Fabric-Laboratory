import type { BearingEndpoint, BearingRuntimeSnapshot } from "../experiments/anvil-02-bearing.js";
import type { GridPosition, Vec3 } from "../model.js";
import type { FreedomRealizationPlan } from "../studio-recovery/realize.js";
import type { FreedomSourceV0, GridFace } from "../studio-recovery/source.js";
import {
  currentR2Intent,
  currentWER1Policy,
  localWakeNeedsRefresh,
  shouldDiscloseBearingOpportunity,
} from "./actionability-disclosure.js";

export interface R2MatterHit {
  readonly kind: "matter";
  readonly cellId: string;
  readonly face: GridFace;
  readonly worldPoint: Vec3;
  readonly planBodyId: string | null;
}

export interface R2InterfaceHit {
  readonly kind: "interface";
  readonly endpointA: BearingEndpoint;
  readonly endpointB: BearingEndpoint;
  readonly worldPoint: Vec3;
  readonly bearingIds: readonly string[];
  readonly torquePatchIds: readonly string[];
  readonly bearingOpportunity: boolean;
  readonly bearingOpportunityActive: boolean;
}

export interface R2MeaningHit {
  readonly kind: "meaning";
  readonly endpoint: BearingEndpoint;
  readonly worldPoint: Vec3;
  readonly torquePatchIds: readonly string[];
}

export type R2WorldHit = R2MatterHit | R2InterfaceHit | R2MeaningHit;

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

interface MatterRecord {
  readonly hit: R2MatterHit;
  readonly polygon: readonly ScreenPoint[];
  readonly depth: number;
}

interface InterfaceRecord {
  readonly hit: R2InterfaceHit;
  readonly screen: ScreenPoint;
  readonly radius: number;
}

interface MeaningRecord {
  readonly hit: R2MeaningHit;
  readonly screen: ScreenPoint;
  readonly radius: number;
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

const FACE_VERTICES: Readonly<Record<GridFace, readonly number[]>> = Object.freeze({
  "x-": [0, 3, 7, 4],
  "x+": [1, 5, 6, 2],
  "y-": [0, 4, 5, 1],
  "y+": [3, 2, 6, 7],
  "z-": [0, 1, 2, 3],
  "z+": [4, 7, 6, 5],
});

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

function scaleGrid(value: GridPosition, scalar: number): GridPosition {
  return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar };
}

function gridKey(grid: GridPosition): string {
  return `${grid.x},${grid.y},${grid.z}`;
}

function cubeVertices(center: Vec3, half: number): Vec3[] {
  return [
    { x: center.x - half, y: center.y - half, z: center.z - half },
    { x: center.x + half, y: center.y - half, z: center.z - half },
    { x: center.x + half, y: center.y + half, z: center.z - half },
    { x: center.x - half, y: center.y + half, z: center.z - half },
    { x: center.x - half, y: center.y - half, z: center.z + half },
    { x: center.x + half, y: center.y - half, z: center.z + half },
    { x: center.x + half, y: center.y + half, z: center.z + half },
    { x: center.x - half, y: center.y + half, z: center.z + half },
  ];
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

function pointInPolygon(x: number, y: number, polygon: readonly ScreenPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i];
    const b = polygon[j];
    if (a === undefined || b === undefined) continue;
    const intersects = (a.y > y) !== (b.y > y) &&
      x < ((b.x - a.x) * (y - a.y)) / ((b.y - a.y) || 1e-9) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

function rgba(hex: string, alpha: number): string {
  const match = /^#([0-9a-f]{6})$/iu.exec(hex);
  if (match === null) return `rgba(145,170,190,${alpha})`;
  const value = Number.parseInt(match[1] ?? "91aabe", 16);
  return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`;
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

export class R2WorldCanvas {
  readonly #canvas: HTMLCanvasElement;
  readonly #context: CanvasRenderingContext2D;
  readonly #camera: CameraState = {
    yaw: -0.72,
    pitch: 0.48,
    distance: 6.5,
    target: { x: 0.5, y: 0, z: 0 },
  };
  #source: FreedomSourceV0 | null = null;
  #evidence: FreedomRealizationPlan | null = null;
  #runtimePlan: FreedomRealizationPlan | null = null;
  #runtimeBodies: readonly BearingRuntimeSnapshot[] = [];
  #previewCells: readonly GridPosition[] = [];
  #hover: R2WorldHit | null = null;
  #matterHits: MatterRecord[] = [];
  #interfaceHits: InterfaceRecord[] = [];
  #meaningHits: MeaningRecord[] = [];
  #handReady = false;
  #handActive = false;

  constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
    const context = canvas.getContext("2d");
    if (context === null) throw new Error("R2 requires Canvas2D support");
    this.#context = context;
    this.resize();
  }

  setSource(source: FreedomSourceV0, evidence: FreedomRealizationPlan): void {
    this.#source = source;
    this.#evidence = evidence;
  }

  setRuntime(plan: FreedomRealizationPlan, bodies: readonly BearingRuntimeSnapshot[]): void {
    this.#runtimePlan = plan;
    this.#runtimeBodies = bodies;
  }

  clearRuntime(): void {
    this.#runtimePlan = null;
    this.#runtimeBodies = [];
    this.#handReady = false;
    this.#handActive = false;
  }

  setPreviewCells(cells: readonly GridPosition[]): void {
    this.#previewCells = cells;
  }

  setHover(hit: R2WorldHit | null): void {
    this.#hover = hit;
  }

  setHandState(ready: boolean, active: boolean): void {
    this.#handReady = ready;
    this.#handActive = active;
  }

  resize(): void {
    const rect = this.#canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.#canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    this.#canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    this.#context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  orbit(deltaX: number, deltaY: number): void {
    this.#camera.yaw -= deltaX * 0.007;
    this.#camera.pitch = Math.max(-1.25, Math.min(1.25, this.#camera.pitch + deltaY * 0.007));
    this.draw();
  }

  pan(deltaX: number, deltaY: number): void {
    const basis = this.#cameraBasis();
    const factor = this.#camera.distance * 0.0014;
    this.#camera.target = add(this.#camera.target, add(scale(basis.right, -deltaX * factor), scale(basis.up, deltaY * factor)));
    this.draw();
  }

  zoom(deltaY: number): void {
    this.#camera.distance = Math.max(1.6, Math.min(28, this.#camera.distance * Math.exp(deltaY * 0.0012)));
    this.draw();
  }

  focusSource(): void {
    const source = this.#source;
    if (source === null || source.matter.cells.length === 0) {
      this.#camera.target = { x: 0, y: 0, z: 0 };
      this.#camera.distance = 6;
      this.draw();
      return;
    }
    const s = source.matter.cellSizeM;
    let min = { x: Infinity, y: Infinity, z: Infinity };
    let max = { x: -Infinity, y: -Infinity, z: -Infinity };
    for (const cell of source.matter.cells) {
      const center = { x: (cell.grid.x + 0.5) * s, y: (cell.grid.y + 0.5) * s, z: (cell.grid.z + 0.5) * s };
      min = { x: Math.min(min.x, center.x), y: Math.min(min.y, center.y), z: Math.min(min.z, center.z) };
      max = { x: Math.max(max.x, center.x), y: Math.max(max.y, center.y), z: Math.max(max.z, center.z) };
    }
    this.#camera.target = scale(add(min, max), 0.5);
    const extent = Math.max(max.x - min.x, max.y - min.y, max.z - min.z, s);
    this.#camera.distance = Math.max(3, extent * 2.4 + 2);
    this.draw();
  }

  hit(clientX: number, clientY: number): R2WorldHit | null {
    if (localWakeNeedsRefresh()) this.draw();
    const rect = this.#canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const bearingIntent = currentR2Intent() === "bearing";
    for (const entry of [...this.#interfaceHits].sort((a, b) => a.screen.depth - b.screen.depth)) {
      if (bearingIntent && (!entry.hit.bearingOpportunity || !entry.hit.bearingOpportunityActive)) continue;
      if (Math.hypot(entry.screen.x - x, entry.screen.y - y) <= entry.radius + 5) return entry.hit;
    }
    for (const entry of [...this.#meaningHits].sort((a, b) => a.screen.depth - b.screen.depth)) {
      if (Math.hypot(entry.screen.x - x, entry.screen.y - y) <= entry.radius + 5) return entry.hit;
    }
    for (const entry of [...this.#matterHits].sort((a, b) => a.depth - b.depth)) {
      if (pointInPolygon(x, y, entry.polygon)) return entry.hit;
    }
    return null;
  }

  extrusionCount(hit: R2MatterHit, startX: number, startY: number, currentX: number, currentY: number): number {
    const source = this.#source;
    if (source === null) return 1;
    const a = this.#project(hit.worldPoint);
    const b = this.#project(add(hit.worldPoint, scale(FACE_NORMALS[hit.face], source.matter.cellSizeM)));
    if (a === null || b === null) return 1;
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const lengthSquared = vx * vx + vy * vy;
    if (lengthSquared < 4) return 1;
    const projection = ((currentX - startX) * vx + (currentY - startY) * vy) / lengthSquared;
    return Math.max(1, Math.min(64, Math.round(projection + 1)));
  }

  previewFor(hit: R2MatterHit, count: number): readonly GridPosition[] {
    const source = this.#source;
    if (source === null) return [];
    const sourceCell = source.matter.cells.find((cell) => cell.id === hit.cellId);
    if (sourceCell === undefined) return [];
    const occupied = new Set(source.matter.cells.map((cell) => gridKey(cell.grid)));
    const cells: GridPosition[] = [];
    for (let step = 1; step <= count; step += 1) {
      const grid = addGrid(sourceCell.grid, scaleGrid(FACE_OFFSETS[hit.face], step));
      if (occupied.has(gridKey(grid))) break;
      cells.push(grid);
      occupied.add(gridKey(grid));
    }
    return cells;
  }

  worldDeltaForScreenDrag(anchorWorld: Vec3, deltaX: number, deltaY: number): Vec3 {
    const rect = this.#canvas.getBoundingClientRect();
    const basis = this.#cameraBasis();
    const depth = Math.max(0.05, dot(subtract(anchorWorld, basis.position), basis.forward));
    const focal = rect.height / (2 * Math.tan((Math.PI / 3.2) / 2));
    return add(scale(basis.right, (deltaX * depth) / focal), scale(basis.up, (-deltaY * depth) / focal));
  }

  draw(): void {
    const rect = this.#canvas.getBoundingClientRect();
    const context = this.#context;
    context.clearRect(0, 0, rect.width, rect.height);
    context.fillStyle = "#080b0d";
    context.fillRect(0, 0, rect.width, rect.height);
    this.#drawGround();
    this.#matterHits = [];
    this.#interfaceHits = [];
    this.#meaningHits = [];
    const source = this.#source;
    if (source === null) return;
    if (this.#runtimePlan === null) {
      this.#drawAuthored(source);
      this.#drawInterfaces(source, this.#evidence);
      this.#drawPreview(source);
    } else {
      this.#drawRuntime(source, this.#runtimePlan, this.#runtimeBodies);
    }
    this.#drawCue();
  }

  #cameraPosition(): Vec3 {
    const c = Math.cos(this.#camera.pitch);
    return {
      x: this.#camera.target.x + this.#camera.distance * c * Math.sin(this.#camera.yaw),
      y: this.#camera.target.y + this.#camera.distance * Math.sin(this.#camera.pitch),
      z: this.#camera.target.z + this.#camera.distance * c * Math.cos(this.#camera.yaw),
    };
  }

  #cameraBasis(): { position: Vec3; forward: Vec3; right: Vec3; up: Vec3 } {
    const position = this.#cameraPosition();
    const forward = normalize(subtract(this.#camera.target, position));
    let right = normalize(cross(forward, { x: 0, y: 1, z: 0 }));
    if (Math.hypot(right.x, right.y, right.z) < 1e-6) right = { x: 1, y: 0, z: 0 };
    return { position, forward, right, up: normalize(cross(right, forward)) };
  }

  #project(point: Vec3): ScreenPoint | null {
    const rect = this.#canvas.getBoundingClientRect();
    const basis = this.#cameraBasis();
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

  #drawGround(): void {
    const context = this.#context;
    context.save();
    context.strokeStyle = "rgba(137,151,158,0.08)";
    context.lineWidth = 1;
    for (let value = -10; value <= 10; value += 1) {
      for (const [a, b] of [
        [{ x: -10, y: -0.26, z: value }, { x: 10, y: -0.26, z: value }],
        [{ x: value, y: -0.26, z: -10 }, { x: value, y: -0.26, z: 10 }],
      ] as const) {
        const pa = this.#project(a);
        const pb = this.#project(b);
        if (pa === null || pb === null) continue;
        context.beginPath(); context.moveTo(pa.x, pa.y); context.lineTo(pb.x, pb.y); context.stroke();
      }
    }
    context.restore();
  }

  #authoredCenter(source: FreedomSourceV0, cellId: string): Vec3 | null {
    const cell = source.matter.cells.find((candidate) => candidate.id === cellId);
    if (cell === undefined) return null;
    const s = source.matter.cellSizeM;
    return { x: (cell.grid.x + 0.5) * s, y: (cell.grid.y + 0.5) * s, z: (cell.grid.z + 0.5) * s };
  }

  #drawAuthored(source: FreedomSourceV0): void {
    const occupied = new Set(source.matter.cells.map((cell) => gridKey(cell.grid)));
    const materials = new Map(source.matter.materials.map((material) => [material.id, material] as const));
    const s = source.matter.cellSizeM;
    const faces: Array<{ cellId: string; face: GridFace; center: Vec3; normal: Vec3; vertices: Vec3[]; color: string }> = [];
    for (const cell of source.matter.cells) {
      const center = this.#authoredCenter(source, cell.id);
      if (center === null) continue;
      const vertices = cubeVertices(center, s / 2);
      for (const face of Object.keys(FACE_VERTICES) as GridFace[]) {
        if (occupied.has(gridKey(addGrid(cell.grid, FACE_OFFSETS[face])))) continue;
        faces.push({
          cellId: cell.id,
          face,
          center: add(center, scale(FACE_NORMALS[face], s / 2)),
          normal: FACE_NORMALS[face],
          vertices: FACE_VERTICES[face].map((index) => vertices[index]).filter((value): value is Vec3 => value !== undefined),
          color: materials.get(cell.materialId)?.displayColor ?? "#91aabe",
        });
      }
    }
    this.#paintFaces(faces, null);
  }

  #drawRuntime(source: FreedomSourceV0, plan: FreedomRealizationPlan, bodies: readonly BearingRuntimeSnapshot[]): void {
    const snapshots = new Map(bodies.map((body) => [body.planBodyId, body] as const));
    const bodyPlans = new Map(plan.physicalPlan.bodies.map((body) => [body.id, body] as const));
    const byGrid = new Map(source.matter.cells.map((cell) => [gridKey(cell.grid), cell] as const));
    const materials = new Map(source.matter.materials.map((material) => [material.id, material] as const));
    const s = source.matter.cellSizeM;
    const faces: Array<{ cellId: string; face: GridFace; center: Vec3; normal: Vec3; vertices: Vec3[]; color: string }> = [];
    for (const cell of source.matter.cells) {
      const bodyId = plan.physicalPlan.cellToBody[cell.id];
      const snapshot = bodyId === undefined ? undefined : snapshots.get(bodyId);
      const bodyPlan = bodyId === undefined ? undefined : bodyPlans.get(bodyId);
      const authoredCenter = this.#authoredCenter(source, cell.id);
      if (snapshot === undefined || bodyPlan === undefined || authoredCenter === null) continue;
      const localCenter = subtract(authoredCenter, bodyPlan.centerOfMassWorld);
      const center = add(snapshot.position, rotateByQuat(snapshot.rotation, localCenter));
      const localVertices = cubeVertices(localCenter, s / 2);
      const vertices = localVertices.map((vertex) => add(snapshot.position, rotateByQuat(snapshot.rotation, vertex)));
      for (const face of Object.keys(FACE_VERTICES) as GridFace[]) {
        const neighbor = byGrid.get(gridKey(addGrid(cell.grid, FACE_OFFSETS[face])));
        if (neighbor !== undefined && plan.physicalPlan.cellToBody[neighbor.id] === bodyId) continue;
        const normal = rotateByQuat(snapshot.rotation, FACE_NORMALS[face]);
        faces.push({
          cellId: cell.id,
          face,
          center: add(center, scale(normal, s / 2)),
          normal,
          vertices: FACE_VERTICES[face].map((index) => vertices[index]).filter((value): value is Vec3 => value !== undefined),
          color: materials.get(cell.materialId)?.displayColor ?? "#91aabe",
        });
      }
    }
    this.#paintFaces(faces, plan);
  }

  #paintFaces(
    faces: readonly { cellId: string; face: GridFace; center: Vec3; normal: Vec3; vertices: readonly Vec3[]; color: string }[],
    plan: FreedomRealizationPlan | null,
  ): void {
    const camera = this.#cameraPosition();
    const light = normalize({ x: -0.4, y: 0.8, z: 0.55 });
    const prepared: Array<{ face: typeof faces[number]; points: ScreenPoint[]; depth: number; brightness: number }> = [];
    for (const face of faces) {
      if (dot(face.normal, subtract(camera, face.center)) <= 0) continue;
      const projected = face.vertices.map((vertex) => this.#project(vertex));
      if (projected.some((point) => point === null)) continue;
      const points = projected.filter((point): point is ScreenPoint => point !== null);
      if (points.length !== 4) continue;
      prepared.push({
        face,
        points,
        depth: points.reduce((sum, point) => sum + point.depth, 0) / 4,
        brightness: 0.55 + Math.max(0, dot(face.normal, light)) * 0.45,
      });
    }
    prepared.sort((a, b) => b.depth - a.depth);
    for (const entry of prepared) {
      const first = entry.points[0];
      if (first === undefined) continue;
      const hovered = this.#hover?.kind === "matter" && this.#hover.cellId === entry.face.cellId && this.#hover.face === entry.face.face;
      const context = this.#context;
      context.beginPath(); context.moveTo(first.x, first.y);
      for (const point of entry.points.slice(1)) context.lineTo(point.x, point.y);
      context.closePath();
      context.fillStyle = hovered ? "rgba(184,216,229,0.58)" : rgba(entry.face.color, 0.22 + entry.brightness * 0.22);
      context.fill();
      context.strokeStyle = hovered ? "rgba(224,245,255,0.92)" : "rgba(185,205,214,0.24)";
      context.lineWidth = hovered ? 1.6 : 0.8;
      context.stroke();
      this.#matterHits.push({
        hit: {
          kind: "matter",
          cellId: entry.face.cellId,
          face: entry.face.face,
          worldPoint: { ...entry.face.center },
          planBodyId: plan?.physicalPlan.cellToBody[entry.face.cellId] ?? null,
        },
        polygon: entry.points,
        depth: entry.depth,
      });
    }
  }

  #drawInterfaces(source: FreedomSourceV0, evidence: FreedomRealizationPlan | null): void {
    const byGrid = new Map(source.matter.cells.map((cell) => [gridKey(cell.grid), cell] as const));
    const seen = new Set<string>();
    const representedTorqueIds = new Set<string>();
    const s = source.matter.cellSizeM;
    const canvasRect = this.#canvas.getBoundingClientRect();
    let fullCandidateCount = 0;
    let disclosedCandidateCount = 0;
    const realizedBearings = new Set(evidence?.bearings.map((entry) => entry.sourceBearingId) ?? []);
    const realizedTorques = new Set(evidence?.torques.map((entry) => entry.sourcePatchId) ?? []);
    const diagnostics = new Map<string, string[]>();
    for (const entry of evidence?.diagnostics ?? []) {
      const values = diagnostics.get(entry.sourceId) ?? [];
      values.push(entry.code);
      diagnostics.set(entry.sourceId, values);
    }
    for (const cell of source.matter.cells) {
      const center = this.#authoredCenter(source, cell.id);
      if (center === null) continue;
      for (const face of Object.keys(FACE_OFFSETS) as GridFace[]) {
        const neighbor = byGrid.get(gridKey(addGrid(cell.grid, FACE_OFFSETS[face])));
        if (neighbor === undefined) continue;
        const key = canonicalInterfaceKey(cell.id, neighbor.id);
        if (seen.has(key)) continue;
        seen.add(key);
        const endpointA: BearingEndpoint = { cellId: cell.id, face };
        const endpointB: BearingEndpoint = { cellId: neighbor.id, face: OPPOSITE[face] };
        const bearingIds = source.bearings.filter((bearing) =>
          (sameEndpoint(bearing.endpointA, endpointA) && sameEndpoint(bearing.endpointB, endpointB)) ||
          (sameEndpoint(bearing.endpointA, endpointB) && sameEndpoint(bearing.endpointB, endpointA)),
        ).map((bearing) => bearing.id);
        const torquePatchIds = source.torquePatches.filter((patch) => sameEndpoint(patch.target, endpointA) || sameEndpoint(patch.target, endpointB)).map((patch) => patch.id);
        for (const id of torquePatchIds) representedTorqueIds.add(id);
        const worldPoint = add(center, scale(FACE_NORMALS[face], s / 2));
        const screen = this.#project(worldPoint);
        if (screen === null) continue;
        fullCandidateCount += 1;
        const bearingOpportunityActive = shouldDiscloseBearingOpportunity(screen, canvasRect);
        if (bearingOpportunityActive) disclosedCandidateCount += 1;
        const hasAuthoredMeaning = bearingIds.length > 0 || torquePatchIds.length > 0;
        if (!hasAuthoredMeaning && !bearingOpportunityActive) continue;
        const conflicted = bearingIds.some((id) => (diagnostics.get(id) ?? []).some((code) => code === "DUPLICATE_SEAM" || code === "DUPLICATE_ID"));
        const unresolved = bearingIds.some((id) => !realizedBearings.has(id)) || torquePatchIds.some((id) => !realizedTorques.has(id));
        const radius = hasAuthoredMeaning ? 8 : 4;
        const hovered = this.#hover?.kind === "interface" &&
          Math.hypot(this.#hover.worldPoint.x - worldPoint.x, this.#hover.worldPoint.y - worldPoint.y, this.#hover.worldPoint.z - worldPoint.z) < 1e-6;
        const context = this.#context;
        context.save();
        if (conflicted) context.setLineDash([3, 3]);
        context.beginPath(); context.arc(screen.x, screen.y, hovered ? radius + 3 : radius, 0, Math.PI * 2);
        if (bearingIds.length > 0) {
          context.strokeStyle = conflicted ? "rgba(184,130,235,0.95)" : unresolved ? "rgba(213,183,99,0.88)" : "rgba(54,205,198,0.9)";
          context.lineWidth = hovered ? 3 : 2;
          context.stroke();
        } else {
          context.fillStyle = hovered ? "rgba(210,229,235,0.78)" : "rgba(167,187,194,0.16)";
          context.fill();
        }
        if (torquePatchIds.length > 0) {
          context.beginPath(); context.arc(screen.x, screen.y, 2.4, 0, Math.PI * 2);
          context.fillStyle = unresolved ? "rgba(220,167,91,0.52)" : "#f2a253";
          context.fill();
        }
        context.restore();
        this.#interfaceHits.push({
          hit: {
            kind: "interface",
            endpointA,
            endpointB,
            worldPoint,
            bearingIds,
            torquePatchIds,
            bearingOpportunity: true,
            bearingOpportunityActive,
          },
          screen,
          radius,
        });
      }
    }

    const shell = document.querySelector<HTMLElement>(".r2-studio");
    if (shell !== null) {
      shell.dataset.wer1Policy = currentWER1Policy();
      shell.dataset.wer1Candidates = String(fullCandidateCount);
      shell.dataset.wer1Disclosed = String(disclosedCandidateCount);
    }

    const byId = new Map(source.matter.cells.map((cell) => [cell.id, cell] as const));
    for (const bearing of source.bearings) {
      const cellA = byId.get(bearing.endpointA.cellId);
      const cellB = byId.get(bearing.endpointB.cellId);
      const represented = cellA !== undefined && cellB !== undefined &&
        gridKey(addGrid(cellA.grid, FACE_OFFSETS[bearing.endpointA.face])) === gridKey(cellB.grid) &&
        bearing.endpointB.face === OPPOSITE[bearing.endpointA.face];
      if (represented) continue;

      const anchor = cellA !== undefined ? bearing.endpointA : cellB !== undefined ? bearing.endpointB : null;
      if (anchor === null) continue;
      const center = this.#authoredCenter(source, anchor.cellId);
      if (center === null) continue;
      const worldPoint = add(center, scale(FACE_NORMALS[anchor.face], s / 2));
      const screen = this.#project(worldPoint);
      if (screen === null) continue;
      const torquePatchIds = source.torquePatches
        .filter((patch) => sameEndpoint(patch.target, bearing.endpointA) || sameEndpoint(patch.target, bearing.endpointB))
        .map((patch) => patch.id);
      for (const id of torquePatchIds) representedTorqueIds.add(id);
      const conflicted = (diagnostics.get(bearing.id) ?? []).some((code) => code === "DUPLICATE_SEAM" || code === "DUPLICATE_ID");
      const hovered = this.#hover?.kind === "interface" &&
        Math.hypot(this.#hover.worldPoint.x - worldPoint.x, this.#hover.worldPoint.y - worldPoint.y, this.#hover.worldPoint.z - worldPoint.z) < 1e-6;
      const radius = 9;
      const context = this.#context;
      context.save();
      context.setLineDash([4, 3]);
      context.beginPath();
      context.arc(screen.x, screen.y, hovered ? radius + 3 : radius, 0, Math.PI * 2);
      context.strokeStyle = conflicted ? "rgba(184,130,235,0.98)" : "rgba(213,183,99,0.92)";
      context.lineWidth = hovered ? 3 : 2;
      context.stroke();
      context.setLineDash([]);
      context.beginPath();
      context.moveTo(screen.x - 3, screen.y);
      context.lineTo(screen.x + 3, screen.y);
      context.strokeStyle = "rgba(231,205,126,0.78)";
      context.lineWidth = 1.4;
      context.stroke();
      if (torquePatchIds.length > 0) {
        context.beginPath();
        context.arc(screen.x, screen.y, 2.5, 0, Math.PI * 2);
        context.fillStyle = "rgba(220,167,91,0.62)";
        context.fill();
      }
      context.restore();
      this.#interfaceHits.push({
        hit: {
          kind: "interface",
          endpointA: bearing.endpointA,
          endpointB: bearing.endpointB,
          worldPoint,
          bearingIds: [bearing.id],
          torquePatchIds,
          bearingOpportunity: false,
          bearingOpportunityActive: false,
        },
        screen,
        radius,
      });
    }

    const singleAnchorTargets = new Map<string, { endpoint: BearingEndpoint; torquePatchIds: string[] }>();
    for (const patch of source.torquePatches) {
      if (representedTorqueIds.has(patch.id) || !byId.has(patch.target.cellId)) continue;
      const key = endpointKey(patch.target);
      const existing = singleAnchorTargets.get(key);
      if (existing === undefined) {
        singleAnchorTargets.set(key, { endpoint: { ...patch.target }, torquePatchIds: [patch.id] });
      } else {
        existing.torquePatchIds.push(patch.id);
      }
    }

    for (const entry of singleAnchorTargets.values()) {
      const center = this.#authoredCenter(source, entry.endpoint.cellId);
      if (center === null) continue;
      const worldPoint = add(center, scale(FACE_NORMALS[entry.endpoint.face], s / 2));
      const screen = this.#project(worldPoint);
      if (screen === null) continue;
      const radius = 7;
      const hovered = this.#hover?.kind === "meaning" && sameEndpoint(this.#hover.endpoint, entry.endpoint);
      const context = this.#context;
      context.save();
      context.setLineDash([2, 2]);
      context.beginPath();
      context.arc(screen.x, screen.y, hovered ? radius + 3 : radius, 0, Math.PI * 2);
      context.strokeStyle = "rgba(220,167,91,0.84)";
      context.lineWidth = hovered ? 2.5 : 1.7;
      context.stroke();
      context.setLineDash([]);
      context.beginPath();
      context.arc(screen.x, screen.y, 2.5, 0, Math.PI * 2);
      context.fillStyle = hovered ? "rgba(242,162,83,0.92)" : "rgba(220,167,91,0.62)";
      context.fill();
      context.restore();
      this.#meaningHits.push({
        hit: {
          kind: "meaning",
          endpoint: { ...entry.endpoint },
          worldPoint,
          torquePatchIds: [...entry.torquePatchIds],
        },
        screen,
        radius,
      });
    }
  }

  #drawPreview(source: FreedomSourceV0): void {
    const context = this.#context;
    const s = source.matter.cellSizeM;
    context.save();
    context.strokeStyle = "rgba(135,222,188,0.76)";
    context.fillStyle = "rgba(101,199,160,0.08)";
    context.lineWidth = 1.3;
    for (const grid of this.#previewCells) {
      const center = { x: (grid.x + 0.5) * s, y: (grid.y + 0.5) * s, z: (grid.z + 0.5) * s };
      const vertices = cubeVertices(center, s / 2);
      for (const face of Object.keys(FACE_VERTICES) as GridFace[]) {
        const points = FACE_VERTICES[face].map((index) => this.#project(vertices[index] ?? center)).filter((point): point is ScreenPoint => point !== null);
        const first = points[0];
        if (points.length !== 4 || first === undefined) continue;
        context.beginPath(); context.moveTo(first.x, first.y);
        for (const point of points.slice(1)) context.lineTo(point.x, point.y);
        context.closePath(); context.fill(); context.stroke();
      }
    }
    context.restore();
  }

  #drawCue(): void {
    const context = this.#context;
    const rect = this.#canvas.getBoundingClientRect();
    context.save();
    context.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.fillStyle = "rgba(190,207,213,0.5)";
    context.textAlign = "right";
    const text = this.#runtimePlan === null
      ? "LMB build · drag extrude · B bearing · T torque · Alt exact delete"
      : this.#handActive
        ? "LMB HAND · MMB orbit · Shift+MMB pan · wheel zoom"
        : this.#handReady
          ? "LMB grab · MMB orbit · Shift+MMB pan · wheel zoom"
          : "MMB orbit · Shift+MMB pan · wheel zoom";
    context.fillText(text, rect.width - 14, rect.height - 14);
    context.restore();
  }
}
