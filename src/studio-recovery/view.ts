import type { BearingRuntimeSnapshot, BearingEndpoint } from "../experiments/anvil-02-bearing.js";
import type { GridPosition, Vec3 } from "../model.js";
import type { FreedomRealizationPlan } from "./realize.js";
import type { FreedomSourceV0, GridFace } from "./source.js";

export interface CanvasMatterHit {
  readonly kind: "matter";
  readonly cellId: string;
  readonly face: GridFace;
  readonly worldPoint: Vec3;
  readonly planBodyId: string | null;
}

export interface CanvasInterfaceHit {
  readonly kind: "interface";
  readonly endpointA: BearingEndpoint;
  readonly endpointB: BearingEndpoint;
  readonly worldPoint: Vec3;
  readonly bearingIds: readonly string[];
  readonly torquePatchIds: readonly string[];
}

export type CanvasHit = CanvasMatterHit | CanvasInterfaceHit;

interface ScreenPoint {
  readonly x: number;
  readonly y: number;
  readonly depth: number;
}

interface FaceRecord {
  readonly hit: CanvasMatterHit;
  readonly polygon: readonly ScreenPoint[];
  readonly depth: number;
}

interface InterfaceRecord {
  readonly hit: CanvasInterfaceHit;
  readonly screen: ScreenPoint;
  readonly radius: number;
}

interface CameraState {
  yaw: number;
  pitch: number;
  distance: number;
  target: Vec3;
}

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

const FACE_VERTICES: Readonly<Record<GridFace, readonly number[]>> = Object.freeze({
  "x-": [0, 3, 7, 4],
  "x+": [1, 5, 6, 2],
  "y-": [0, 4, 5, 1],
  "y+": [3, 2, 6, 7],
  "z-": [0, 1, 2, 3],
  "z+": [4, 7, 6, 5],
});

const FACE_NORMALS: Readonly<Record<GridFace, Vec3>> = Object.freeze({
  "x-": { x: -1, y: 0, z: 0 },
  "x+": { x: 1, y: 0, z: 0 },
  "y-": { x: 0, y: -1, z: 0 },
  "y+": { x: 0, y: 1, z: 0 },
  "z-": { x: 0, y: 0, z: -1 },
  "z+": { x: 0, y: 0, z: 1 },
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
  if (length <= 1e-12) return { x: 0, y: 0, z: 0 };
  return scale(value, 1 / length);
}

function gridKey(grid: GridPosition): string {
  return `${grid.x},${grid.y},${grid.z}`;
}

function addGrid(a: GridPosition, b: GridPosition): GridPosition {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
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

function pointInPolygon(x: number, y: number, polygon: readonly ScreenPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i];
    const b = polygon[j];
    if (a === undefined || b === undefined) continue;
    const intersects = ((a.y > y) !== (b.y > y)) &&
      x < ((b.x - a.x) * (y - a.y)) / Math.max(1e-9, b.y - a.y) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

function rgba(hex: string, alpha: number): string {
  const match = /^#([0-9a-f]{6})$/iu.exec(hex);
  if (match === null) return `rgba(145,170,190,${alpha})`;
  const value = Number.parseInt(match[1] ?? "91aabe", 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export class FreedomCanvas {
  readonly #canvas: HTMLCanvasElement;
  readonly #context: CanvasRenderingContext2D;
  readonly #camera: CameraState = {
    yaw: -0.72,
    pitch: 0.48,
    distance: 6.5,
    target: { x: 0.5, y: 0, z: 0 },
  };
  #source: FreedomSourceV0 | null = null;
  #runtimePlan: FreedomRealizationPlan | null = null;
  #runtimeBodies: readonly BearingRuntimeSnapshot[] = [];
  #previewCells: readonly GridPosition[] = [];
  #matterHits: FaceRecord[] = [];
  #interfaceHits: InterfaceRecord[] = [];
  #hover: CanvasHit | null = null;
  #handReady = false;
  #handActive = false;

  constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
    const context = canvas.getContext("2d");
    if (context === null) throw new Error("Freedom Studio requires 2D canvas support");
    this.#context = context;
    this.resize();
  }

  setSource(source: FreedomSourceV0): void {
    this.#source = source;
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

  setHover(hit: CanvasHit | null): void {
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
  }

  zoom(deltaY: number): void {
    this.#camera.distance = Math.max(1.6, Math.min(25, this.#camera.distance * Math.exp(deltaY * 0.0012)));
  }

  pan(deltaX: number, deltaY: number): void {
    const basis = this.#cameraBasis();
    const scaleFactor = this.#camera.distance * 0.0014;
    this.#camera.target = add(
      this.#camera.target,
      add(scale(basis.right, -deltaX * scaleFactor), scale(basis.up, deltaY * scaleFactor)),
    );
  }

  focusSource(): void {
    const source = this.#source;
    if (source === null || source.matter.cells.length === 0) {
      this.#camera.target = { x: 0, y: 0, z: 0 };
      this.#camera.distance = 6;
      return;
    }
    const s = source.matter.cellSizeM;
    let min = { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY, z: Number.POSITIVE_INFINITY };
    let max = { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY, z: Number.NEGATIVE_INFINITY };
    for (const cell of source.matter.cells) {
      const center = { x: (cell.grid.x + 0.5) * s, y: (cell.grid.y + 0.5) * s, z: (cell.grid.z + 0.5) * s };
      min = { x: Math.min(min.x, center.x), y: Math.min(min.y, center.y), z: Math.min(min.z, center.z) };
      max = { x: Math.max(max.x, center.x), y: Math.max(max.y, center.y), z: Math.max(max.z, center.z) };
    }
    this.#camera.target = scale(add(min, max), 0.5);
    const extent = Math.max(max.x - min.x, max.y - min.y, max.z - min.z, s);
    this.#camera.distance = Math.max(3, extent * 2.5 + 2);
  }

  hit(clientX: number, clientY: number): CanvasHit | null {
    const rect = this.#canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    for (const entry of [...this.#interfaceHits].sort((a, b) => a.screen.depth - b.screen.depth)) {
      if (Math.hypot(entry.screen.x - x, entry.screen.y - y) <= entry.radius + 4) return entry.hit;
    }
    for (const entry of [...this.#matterHits].sort((a, b) => a.depth - b.depth)) {
      if (pointInPolygon(x, y, entry.polygon)) return entry.hit;
    }
    return null;
  }

  draw(): void {
    const source = this.#source;
    const rect = this.#canvas.getBoundingClientRect();
    const context = this.#context;
    context.clearRect(0, 0, rect.width, rect.height);
    context.fillStyle = "#080b0d";
    context.fillRect(0, 0, rect.width, rect.height);
    this.#drawGround(rect.width, rect.height);
    this.#matterHits = [];
    this.#interfaceHits = [];
    if (source === null) return;

    if (this.#runtimePlan === null) {
      this.#drawAuthored(source);
      this.#drawInterfaces(source);
      this.#drawPreview(source);
    } else {
      this.#drawRuntime(source, this.#runtimePlan, this.#runtimeBodies);
    }
    this.#drawCornerCue();
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
    const up = normalize(cross(right, forward));
    return { position, forward, right, up };
  }

  #project(point: Vec3): ScreenPoint | null {
    const rect = this.#canvas.getBoundingClientRect();
    const basis = this.#cameraBasis();
    const relative = subtract(point, basis.position);
    const depth = dot(relative, basis.forward);
    if (depth <= 0.05) return null;
    const fov = Math.PI / 3.2;
    const focal = rect.height / (2 * Math.tan(fov / 2));
    return {
      x: rect.width / 2 + (dot(relative, basis.right) / depth) * focal,
      y: rect.height / 2 - (dot(relative, basis.up) / depth) * focal,
      depth,
    };
  }

  #drawGround(width: number, height: number): void {
    const context = this.#context;
    const extent = 12;
    context.save();
    context.lineWidth = 1;
    context.strokeStyle = "rgba(137,151,158,0.09)";
    for (let value = -extent; value <= extent; value += 1) {
      const a = this.#project({ x: -extent, y: -0.26, z: value });
      const b = this.#project({ x: extent, y: -0.26, z: value });
      const c = this.#project({ x: value, y: -0.26, z: -extent });
      const d = this.#project({ x: value, y: -0.26, z: extent });
      if (a !== null && b !== null) {
        context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
      }
      if (c !== null && d !== null) {
        context.beginPath(); context.moveTo(c.x, c.y); context.lineTo(d.x, d.y); context.stroke();
      }
    }
    const vignette = context.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, Math.max(width, height) * 0.7);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.55)");
    context.fillStyle = vignette;
    context.fillRect(0, 0, width, height);
    context.restore();
  }

  #authoredCenter(source: FreedomSourceV0, cellId: string): Vec3 | null {
    const cell = source.matter.cells.find((candidate) => candidate.id === cellId);
    if (cell === undefined) return null;
    const s = source.matter.cellSizeM;
    return { x: (cell.grid.x + 0.5) * s, y: (cell.grid.y + 0.5) * s, z: (cell.grid.z + 0.5) * s };
  }

  #drawAuthored(source: FreedomSourceV0): void {
    const s = source.matter.cellSizeM;
    const occupied = new Map(source.matter.cells.map((cell) => [gridKey(cell.grid), cell] as const));
    const materials = new Map(source.matter.materials.map((material) => [material.id, material] as const));
    const faces: Array<{ cellId: string; face: GridFace; vertices: Vec3[]; center: Vec3; normal: Vec3; color: string }> = [];

    for (const cell of source.matter.cells) {
      const center = this.#authoredCenter(source, cell.id);
      if (center === null) continue;
      const vertices = cubeVertices(center, s / 2);
      for (const face of Object.keys(FACE_VERTICES) as GridFace[]) {
        const neighbor = occupied.get(gridKey(addGrid(cell.grid, FACE_OFFSETS[face])));
        if (neighbor !== undefined) continue;
        const indices = FACE_VERTICES[face];
        const faceVertices = indices.map((index) => vertices[index]).filter((value): value is Vec3 => value !== undefined);
        faces.push({
          cellId: cell.id,
          face,
          vertices: faceVertices,
          center: add(center, scale(FACE_NORMALS[face], s / 2)),
          normal: FACE_NORMALS[face],
          color: materials.get(cell.materialId)?.displayColor ?? "#91aabe",
        });
      }
    }
    this.#paintFaces(faces, null);
  }

  #drawRuntime(
    source: FreedomSourceV0,
    plan: FreedomRealizationPlan,
    bodies: readonly BearingRuntimeSnapshot[],
  ): void {
    const s = source.matter.cellSizeM;
    const snapshots = new Map(bodies.map((body) => [body.planBodyId, body] as const));
    const bodyPlans = new Map(plan.physicalPlan.bodies.map((body) => [body.id, body] as const));
    const cellsByGrid = new Map(source.matter.cells.map((cell) => [gridKey(cell.grid), cell] as const));
    const materials = new Map(source.matter.materials.map((material) => [material.id, material] as const));
    const faces: Array<{ cellId: string; face: GridFace; vertices: Vec3[]; center: Vec3; normal: Vec3; color: string }> = [];

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
        const neighbor = cellsByGrid.get(gridKey(addGrid(cell.grid, FACE_OFFSETS[face])));
        const neighborBodyId = neighbor === undefined ? undefined : plan.physicalPlan.cellToBody[neighbor.id];
        if (neighbor !== undefined && neighborBodyId === bodyId) continue;
        const indices = FACE_VERTICES[face];
        const faceVertices = indices.map((index) => vertices[index]).filter((value): value is Vec3 => value !== undefined);
        faces.push({
          cellId: cell.id,
          face,
          vertices: faceVertices,
          center: add(center, rotateByQuat(snapshot.rotation, scale(FACE_NORMALS[face], s / 2))),
          normal: rotateByQuat(snapshot.rotation, FACE_NORMALS[face]),
          color: materials.get(cell.materialId)?.displayColor ?? "#91aabe",
        });
      }
    }
    this.#paintFaces(faces, plan);
  }

  #paintFaces(
    faces: readonly { cellId: string; face: GridFace; vertices: readonly Vec3[]; center: Vec3; normal: Vec3; color: string }[],
    plan: FreedomRealizationPlan | null,
  ): void {
    const cameraPosition = this.#cameraPosition();
    const prepared: Array<{
      face: typeof faces[number];
      projected: ScreenPoint[];
      depth: number;
      brightness: number;
    }> = [];
    const light = normalize({ x: -0.4, y: 0.8, z: 0.55 });

    for (const face of faces) {
      if (dot(face.normal, subtract(cameraPosition, face.center)) <= 0) continue;
      const projected = face.vertices.map((vertex) => this.#project(vertex));
      if (projected.some((entry) => entry === null)) continue;
      const points = projected.filter((entry): entry is ScreenPoint => entry !== null);
      if (points.length !== 4) continue;
      const depth = points.reduce((sum, point) => sum + point.depth, 0) / points.length;
      prepared.push({ face, projected: points, depth, brightness: 0.55 + Math.max(0, dot(face.normal, light)) * 0.45 });
    }
    prepared.sort((a, b) => b.depth - a.depth);

    for (const entry of prepared) {
      const context = this.#context;
      const hovered = this.#hover?.kind === "matter" && this.#hover.cellId === entry.face.cellId && this.#hover.face === entry.face.face;
      context.beginPath();
      const first = entry.projected[0];
      if (first === undefined) continue;
      context.moveTo(first.x, first.y);
      for (const point of entry.projected.slice(1)) context.lineTo(point.x, point.y);
      context.closePath();
      context.fillStyle = hovered ? "rgba(184,216,229,0.55)" : rgba(entry.face.color, 0.22 + 0.22 * entry.brightness);
      context.fill();
      context.strokeStyle = hovered ? "rgba(224,245,255,0.9)" : "rgba(185,205,214,0.24)";
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
        polygon: entry.projected,
        depth: entry.depth,
      });
    }
  }

  #drawInterfaces(source: FreedomSourceV0): void {
    const byGrid = new Map(source.matter.cells.map((cell) => [gridKey(cell.grid), cell] as const));
    const s = source.matter.cellSizeM;
    const context = this.#context;
    const seen = new Set<string>();

    for (const cell of source.matter.cells) {
      const center = this.#authoredCenter(source, cell.id);
      if (center === null) continue;
      for (const face of Object.keys(FACE_OFFSETS) as GridFace[]) {
        const neighbor = byGrid.get(gridKey(addGrid(cell.grid, FACE_OFFSETS[face])));
        if (neighbor === undefined) continue;
        const ids = [cell.id, neighbor.id].sort();
        const key = `${ids[0]}\u0000${ids[1]}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const endpointA: BearingEndpoint = { cellId: cell.id, face };
        const endpointB: BearingEndpoint = { cellId: neighbor.id, face: OPPOSITE[face] };
        const bearingIds = source.bearings
          .filter((bearing) => {
            const same = (left: BearingEndpoint, right: BearingEndpoint): boolean => left.cellId === right.cellId && left.face === right.face;
            return (same(bearing.endpointA, endpointA) && same(bearing.endpointB, endpointB)) ||
              (same(bearing.endpointA, endpointB) && same(bearing.endpointB, endpointA));
          })
          .map((bearing) => bearing.id);
        const torquePatchIds = source.torquePatches
          .filter((patch) => (patch.target.cellId === endpointA.cellId && patch.target.face === endpointA.face) ||
            (patch.target.cellId === endpointB.cellId && patch.target.face === endpointB.face))
          .map((patch) => patch.id);
        const worldPoint = add(center, scale(FACE_NORMALS[face], s / 2));
        const screen = this.#project(worldPoint);
        if (screen === null) continue;
        const radius = bearingIds.length > 0 ? 8 : 4.5;
        const hovered = this.#hover?.kind === "interface" &&
          Math.hypot(this.#hover.worldPoint.x - worldPoint.x, this.#hover.worldPoint.y - worldPoint.y, this.#hover.worldPoint.z - worldPoint.z) < 1e-6;
        context.beginPath();
        context.arc(screen.x, screen.y, hovered ? radius + 3 : radius, 0, Math.PI * 2);
        if (bearingIds.length > 0) {
          context.strokeStyle = hovered ? "rgba(90,238,229,1)" : "rgba(54,205,198,0.86)";
          context.lineWidth = hovered ? 3 : 2;
          context.stroke();
          context.beginPath();
          context.arc(screen.x, screen.y, 2.2, 0, Math.PI * 2);
          context.fillStyle = torquePatchIds.length > 0 ? "#f2a253" : "#55d2cb";
          context.fill();
        } else {
          context.fillStyle = hovered ? "rgba(210,229,235,0.8)" : "rgba(167,187,194,0.18)";
          context.fill();
        }
        this.#interfaceHits.push({
          hit: { kind: "interface", endpointA, endpointB, worldPoint, bearingIds, torquePatchIds },
          screen,
          radius,
        });
      }
    }
  }

  #drawPreview(source: FreedomSourceV0): void {
    if (this.#previewCells.length === 0) return;
    const s = source.matter.cellSizeM;
    const context = this.#context;
    for (const grid of this.#previewCells) {
      const center = { x: (grid.x + 0.5) * s, y: (grid.y + 0.5) * s, z: (grid.z + 0.5) * s };
      const vertices = cubeVertices(center, s / 2);
      const projected = vertices.map((vertex) => this.#project(vertex));
      const points = projected.filter((entry): entry is ScreenPoint => entry !== null);
      if (points.length !== 8) continue;
      context.save();
      context.strokeStyle = "rgba(135,222,188,0.72)";
      context.fillStyle = "rgba(101,199,160,0.08)";
      context.lineWidth = 1.4;
      for (const face of Object.keys(FACE_VERTICES) as GridFace[]) {
        const polygon = FACE_VERTICES[face].map((index) => points[index]).filter((entry): entry is ScreenPoint => entry !== undefined);
        const first = polygon[0];
        if (first === undefined) continue;
        context.beginPath(); context.moveTo(first.x, first.y);
        for (const point of polygon.slice(1)) context.lineTo(point.x, point.y);
        context.closePath(); context.fill(); context.stroke();
      }
      context.restore();
    }
  }

  #drawCornerCue(): void {
    const context = this.#context;
    const rect = this.#canvas.getBoundingClientRect();
    context.save();
    context.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.fillStyle = "rgba(190,207,213,0.48)";
    context.textAlign = "right";
    context.fillText(
      this.#runtimePlan === null
        ? "LMB build · drag extrude · B bearing · T torque · Alt delete"
        : this.#handActive
          ? "LMB HAND ACTIVE · MMB/RMB orbit · wheel zoom"
          : this.#handReady
            ? "LMB grab body · MMB/RMB orbit · wheel zoom"
            : "MMB/RMB orbit · wheel zoom",
      rect.width - 14,
      rect.height - 14,
    );
    context.restore();
  }
}
