import * as THREE from "three";
import { applyTorqueDraftDrag } from "../meaning.js";
import type { StudioRuntimeFrame, StudioRuntimeSession } from "../runtime.js";
import {
  createEmptyStudioSource,
  previewAddMatterFromFace,
  previewSeedMatter,
  type StudioGridFace,
  type StudioSourceV0,
} from "../workspace.js";
import {
  StudioMeaningPresentation,
  type StudioBearingDraftVisual,
  type StudioTorqueDraftVisual,
} from "./StudioMeaningPresentation.js";

export type StudioMatterTool = "add" | "remove" | "material";
export type StudioMeaningTool = "bearing" | "torque";
export type StudioViewportTool = "select" | StudioMatterTool | StudioMeaningTool;

export interface StudioViewportHit {
  readonly cellId: string;
  readonly face: StudioGridFace;
}

export type StudioAddRequest =
  | { readonly kind: "seed" }
  | { readonly kind: "face"; readonly cellId: string; readonly face: StudioGridFace };

export interface StudioViewportCallbacks {
  readonly onSelect: (cellId: string | null) => void;
  readonly onHover: (hit: StudioViewportHit | null) => void;
  readonly onAdd: (request: StudioAddRequest) => void;
  readonly onRemove: (cellId: string) => void;
  readonly onMeaningTarget: (hit: StudioViewportHit) => void;
  readonly onTorqueDraftEffort: (effortNm: number) => void;
  readonly onRuntimeFault?: (message: string) => void;
}

type ViewDragMode = "orbit" | "pan";

interface ViewDrag {
  readonly pointerId: number;
  readonly mode: ViewDragMode;
  x: number;
  y: number;
}

interface TorqueDrag {
  readonly pointerId: number;
  readonly mode: "torque";
  x: number;
  effortNm: number;
}

type ActiveDrag = ViewDrag | TorqueDrag;

const INITIAL_CAMERA = new THREE.Vector3(5.5, 4.25, 6.5);
const MIN_DISTANCE = 1.25;
const MAX_DISTANCE = 80;
const ORBIT_RADIANS_PER_PIXEL = 0.006;
const RUNTIME_STEP_MS = 1000 / 60;
const MAX_RUNTIME_STEPS_PER_FRAME = 4;
const STOP_GHOST_MS = 280;

function centerForGrid(grid: { x: number; y: number; z: number }, cellSizeM: number): THREE.Vector3 {
  return new THREE.Vector3(
    (grid.x + 0.5) * cellSizeM,
    (grid.y + 0.5) * cellSizeM,
    (grid.z + 0.5) * cellSizeM,
  );
}

function faceFromNormal(normal: THREE.Vector3): StudioGridFace {
  const ax = Math.abs(normal.x);
  const ay = Math.abs(normal.y);
  const az = Math.abs(normal.z);
  if (ax >= ay && ax >= az) return normal.x >= 0 ? "x+" : "x-";
  if (ay >= ax && ay >= az) return normal.y >= 0 ? "y+" : "y-";
  return normal.z >= 0 ? "z+" : "z-";
}

function vector3(value: { readonly x: number; readonly y: number; readonly z: number }): THREE.Vector3 {
  return new THREE.Vector3(value.x, value.y, value.z);
}

function quaternion(value: { readonly x: number; readonly y: number; readonly z: number; readonly w: number }): THREE.Quaternion {
  return new THREE.Quaternion(value.x, value.y, value.z, value.w);
}

export class StudioViewport {
  readonly #canvas: HTMLCanvasElement;
  readonly #callbacks: StudioViewportCallbacks;
  readonly #renderer: THREE.WebGLRenderer;
  readonly #scene = new THREE.Scene();
  readonly #camera = new THREE.PerspectiveCamera(45, 1, 0.05, 1000);
  readonly #target = new THREE.Vector3(0, 0.5, 0);
  readonly #raycaster = new THREE.Raycaster();
  readonly #matterGroup = new THREE.Group();
  readonly #stopGhostGroup = new THREE.Group();
  readonly #cellGeometry = new THREE.BoxGeometry(1, 1, 1);
  readonly #ghostMaterial = new THREE.MeshBasicMaterial({
    color: 0xa8c1d4,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  readonly #resizeObserver: ResizeObserver;
  readonly #meaningPresentation: StudioMeaningPresentation;
  #source: StudioSourceV0 = createEmptyStudioSource();
  #tool: StudioViewportTool = "select";
  #selection: string | null = null;
  #cellMeshes: THREE.Mesh[] = [];
  #cellById = new Map<string, THREE.Mesh>();
  #cellMaterials: THREE.MeshStandardMaterial[] = [];
  #stopGhostMaterials: THREE.MeshBasicMaterial[] = [];
  #stopGhostStartedAt: number | null = null;
  #ghost: THREE.Mesh | null = null;
  #selectionHelper: THREE.BoxHelper | null = null;
  #removeHelper: THREE.BoxHelper | null = null;
  #hoverKey: string | null = null;
  #drag: ActiveDrag | null = null;
  #runtime: StudioRuntimeSession | null = null;
  #runtimeRunning = false;
  #runtimeLastTimestamp: number | null = null;
  #runtimeAccumulatorMs = 0;
  #runtimeStepCount = 0;
  #frame = 0;
  #disposed = false;

  constructor(canvas: HTMLCanvasElement, callbacks: StudioViewportCallbacks) {
    this.#canvas = canvas;
    this.#callbacks = callbacks;
    const context = canvas.getContext("webgl2", {
      antialias: true,
      alpha: false,
      depth: true,
      powerPreference: "high-performance",
    });
    if (context === null) throw new Error("ANVIL Studio requires WebGL2");

    this.#renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true, alpha: false });
    this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.#renderer.setClearColor(0x202327, 1);
    this.#renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.#camera.position.copy(INITIAL_CAMERA);
    this.#camera.lookAt(this.#target);

    const hemisphere = new THREE.HemisphereLight(0xe7edf2, 0x41464d, 1.7);
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(5, 8, 6);
    const grid = new THREE.GridHelper(40, 40, 0x545c66, 0x30353b);
    this.#meaningPresentation = new StudioMeaningPresentation(this.#source);
    this.#scene.add(
      hemisphere,
      key,
      grid,
      this.#matterGroup,
      this.#stopGhostGroup,
      this.#meaningPresentation.group,
    );

    this.#resizeObserver = new ResizeObserver(() => this.#resize());
    this.#resizeObserver.observe(canvas);
    this.#bindInput();
    this.#resize();
    this.#rebuildMatter();
    this.#frame = requestAnimationFrame(this.#render);
  }

  setSource(source: StudioSourceV0): void {
    if (this.#runtime !== null) throw new Error("Studio viewport source cannot change while a runtime session is live");
    this.#source = source;
    this.#rebuildMatter();
    this.#meaningPresentation.setSource(source);
    this.#setHover(null);
    this.#refreshDraftOverlay();
    this.#refreshSelection();
  }

  setTool(tool: StudioViewportTool): void {
    if (this.#runtime !== null && tool !== "select") {
      throw new Error("Studio viewport persistent authoring requires BUILD");
    }
    this.#tool = tool;
    this.#setHover(null);
    this.#refreshDraftOverlay();
  }

  setSelection(cellId: string | null): void {
    this.#selection = cellId;
    this.#refreshSelection();
  }

  setBearingDraft(draft: StudioBearingDraftVisual | null): void {
    if (this.#runtime !== null && draft !== null) throw new Error("Studio Bearing draft requires BUILD");
    this.#meaningPresentation.setBearingDraft(draft);
  }

  setTorqueDraft(draft: StudioTorqueDraftVisual | null): void {
    if (this.#runtime !== null && draft !== null) throw new Error("Studio TorquePatch draft requires BUILD");
    this.#meaningPresentation.setTorqueDraft(draft);
  }

  attachRuntime(runtime: StudioRuntimeSession): void {
    if (this.#runtime !== null) throw new Error("Studio viewport already owns a live runtime session");
    this.#clearStopGhost();
    this.clearDraft();
    this.#tool = "select";
    this.#runtime = runtime;
    this.#runtimeRunning = true;
    this.#runtimeLastTimestamp = null;
    this.#runtimeAccumulatorMs = 0;
    this.#runtimeStepCount = 0;
    this.#canvas.dataset.runtimeFrames = "0";
    const frame = runtime.frame();
    this.#meaningPresentation.startRuntime(runtime.plan, frame);
    this.#applyRuntimeFrame(frame);
  }

  setRuntimeRunning(running: boolean): void {
    if (this.#runtime === null) throw new Error("Studio viewport has no live runtime session");
    this.#runtimeRunning = running;
    this.#runtimeLastTimestamp = null;
    this.#runtimeAccumulatorMs = 0;
  }

  stepRuntimeOnce(): void {
    const runtime = this.#runtime;
    if (runtime === null) throw new Error("Studio viewport has no live runtime session");
    try {
      this.#applyRuntimeFrame(runtime.step(1));
      this.#runtimeStepCount += 1;
      this.#canvas.dataset.runtimeFrames = String(this.#runtimeStepCount);
    } catch (error: unknown) {
      this.#handleRuntimeFault(error);
    }
  }

  detachRuntime(showGhost = true): void {
    if (this.#runtime === null) return;
    if (showGhost) this.#beginStopGhost();
    this.#runtime = null;
    this.#runtimeRunning = false;
    this.#runtimeLastTimestamp = null;
    this.#runtimeAccumulatorMs = 0;
    delete this.#canvas.dataset.runtimeFrames;
    this.#meaningPresentation.stopRuntime();
    this.#rebuildMatter();
    this.#meaningPresentation.setSource(this.#source);
    this.#refreshSelection();
  }

  clearDraft(): void {
    this.#setHover(null);
    this.#removeGhost();
    this.#removeRemoveHelper();
    this.#meaningPresentation.clearTransient();
    this.#refreshDraftOverlay();
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    cancelAnimationFrame(this.#frame);
    this.#resizeObserver.disconnect();
    this.#canvas.removeEventListener("pointerdown", this.#onPointerDown);
    this.#canvas.removeEventListener("pointermove", this.#onPointerMove);
    this.#canvas.removeEventListener("pointerup", this.#onPointerUp);
    this.#canvas.removeEventListener("pointercancel", this.#onPointerUp);
    this.#canvas.removeEventListener("wheel", this.#onWheel);
    window.removeEventListener("keydown", this.#onKeyDown);
    this.#runtime = null;
    this.#clearStopGhost();
    this.#removeGhost();
    this.#removeRemoveHelper();
    this.#selectionHelper?.geometry.dispose();
    this.#meaningPresentation.dispose();
    this.#cellGeometry.dispose();
    this.#ghostMaterial.dispose();
    for (const material of this.#cellMaterials) material.dispose();
    this.#renderer.dispose();
  }

  #bindInput(): void {
    this.#canvas.addEventListener("pointerdown", this.#onPointerDown);
    this.#canvas.addEventListener("pointermove", this.#onPointerMove);
    this.#canvas.addEventListener("pointerup", this.#onPointerUp);
    this.#canvas.addEventListener("pointercancel", this.#onPointerUp);
    this.#canvas.addEventListener("wheel", this.#onWheel, { passive: false });
    window.addEventListener("keydown", this.#onKeyDown);
  }

  readonly #onPointerDown = (event: PointerEvent): void => {
    if (event.button === 0) {
      this.#emitInput("semantic");
      if (this.#tool === "torque") {
        const effortNm = this.#meaningPresentation.torqueDraftEffortNm();
        if (effortNm !== null && this.#pickTorqueHandle(event)) {
          event.preventDefault();
          this.#drag = {
            pointerId: event.pointerId,
            mode: "torque",
            x: event.clientX,
            effortNm,
          };
          this.#canvas.setPointerCapture(event.pointerId);
          return;
        }
      }

      const hit = this.#pickMatter(event);
      if (this.#tool === "add") {
        if (this.#source.matter.cells.length === 0) {
          if (this.#pickGhost(event)) this.#callbacks.onAdd({ kind: "seed" });
          return;
        }
        if (hit === null) return;
        try {
          previewAddMatterFromFace(
            this.#source,
            hit.cellId,
            hit.face,
            this.#source.matter.materials[0]?.id ?? "",
          );
          this.#callbacks.onAdd({ kind: "face", cellId: hit.cellId, face: hit.face });
        } catch {
          return;
        }
        return;
      }
      if (this.#tool === "remove") {
        if (hit !== null) this.#callbacks.onRemove(hit.cellId);
        return;
      }
      if (this.#tool === "bearing" || this.#tool === "torque") {
        if (hit !== null) this.#callbacks.onMeaningTarget(hit);
        return;
      }
      this.#callbacks.onSelect(hit?.cellId ?? null);
      return;
    }
    if (event.button !== 1) return;

    event.preventDefault();
    const mode: ViewDragMode = event.shiftKey ? "pan" : "orbit";
    this.#drag = { pointerId: event.pointerId, mode, x: event.clientX, y: event.clientY };
    this.#canvas.setPointerCapture(event.pointerId);
    this.#emitInput(mode);
  };

  readonly #onPointerMove = (event: PointerEvent): void => {
    const drag = this.#drag;
    if (drag !== null && drag.pointerId === event.pointerId) {
      const dx = event.clientX - drag.x;
      drag.x = event.clientX;
      if (drag.mode === "torque") {
        drag.effortNm = applyTorqueDraftDrag(drag.effortNm, dx, event.shiftKey);
        this.#callbacks.onTorqueDraftEffort(drag.effortNm);
        return;
      }

      const dy = event.clientY - drag.y;
      drag.y = event.clientY;
      if (drag.mode === "orbit") this.#orbit(dx, dy);
      else this.#pan(dx, dy);
      return;
    }
    this.#setHover(this.#pickMatter(event));
  };

  readonly #onPointerUp = (event: PointerEvent): void => {
    if (this.#drag?.pointerId !== event.pointerId) return;
    this.#drag = null;
    if (this.#canvas.hasPointerCapture(event.pointerId)) this.#canvas.releasePointerCapture(event.pointerId);
  };

  readonly #onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    const offset = this.#camera.position.clone().sub(this.#target);
    const distance = THREE.MathUtils.clamp(
      offset.length() * Math.exp(event.deltaY * 0.001),
      MIN_DISTANCE,
      MAX_DISTANCE,
    );
    offset.setLength(distance);
    this.#camera.position.copy(this.#target).add(offset);
    this.#camera.lookAt(this.#target);
    this.#emitInput("zoom");
  };

  readonly #onKeyDown = (event: KeyboardEvent): void => {
    if (event.key.toLowerCase() !== "f") return;
    const selected = this.#selection === null ? undefined : this.#cellById.get(this.#selection);
    const nextTarget = selected?.position.clone() ?? new THREE.Vector3(0, 0.5, 0);
    const offset = this.#camera.position.clone().sub(this.#target);
    this.#target.copy(nextTarget);
    this.#camera.position.copy(this.#target).add(offset);
    this.#camera.lookAt(this.#target);
    this.#emitInput("focus");
  };

  #setRayFromPointer(event: PointerEvent): boolean {
    const rect = this.#canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.#raycaster.setFromCamera(pointer, this.#camera);
    return true;
  }

  #pickMatter(event: PointerEvent): StudioViewportHit | null {
    if (!this.#setRayFromPointer(event)) return null;
    const intersection = this.#raycaster.intersectObjects(this.#cellMeshes, false)[0];
    if (intersection === undefined || intersection.face == null) return null;
    const cellId = (intersection.object.userData.cellId as string | undefined) ?? null;
    if (cellId === null) return null;
    return { cellId, face: faceFromNormal(intersection.face.normal) };
  }

  #pickGhost(event: PointerEvent): boolean {
    const ghost = this.#ghost;
    if (ghost === null || !this.#setRayFromPointer(event)) return false;
    return this.#raycaster.intersectObject(ghost, false).length > 0;
  }

  #pickTorqueHandle(event: PointerEvent): boolean {
    if (!this.#setRayFromPointer(event)) return false;
    return this.#meaningPresentation.hitTorqueHandle(this.#raycaster);
  }

  #setHover(hit: StudioViewportHit | null): void {
    const key = hit === null ? null : `${hit.cellId}@${hit.face}`;
    if (key !== this.#hoverKey) {
      this.#hoverKey = key;
      this.#callbacks.onHover(hit);
    }
    this.#removeGhost();
    this.#removeRemoveHelper();
    this.#meaningPresentation.setHover(
      hit,
      this.#tool === "bearing" || this.#tool === "torque" ? this.#tool : null,
    );

    if (this.#tool === "add") {
      if (this.#source.matter.cells.length === 0) {
        this.#showSeedGhost();
        return;
      }
      if (hit === null) return;
      const materialId = this.#source.matter.materials[0]?.id;
      if (materialId === undefined) return;
      try {
        const preview = previewAddMatterFromFace(this.#source, hit.cellId, hit.face, materialId);
        this.#showGhost(preview.grid);
      } catch {
        return;
      }
    } else if (this.#tool === "remove" && hit !== null) {
      const mesh = this.#cellById.get(hit.cellId);
      if (mesh !== undefined) {
        this.#removeHelper = new THREE.BoxHelper(mesh, 0xd7bc68);
        this.#scene.add(this.#removeHelper);
      }
    }
  }

  #refreshDraftOverlay(): void {
    if (this.#tool === "add" && this.#source.matter.cells.length === 0) this.#showSeedGhost();
  }

  #showSeedGhost(): void {
    const materialId = this.#source.matter.materials[0]?.id;
    if (materialId === undefined) return;
    try {
      const preview = previewSeedMatter(this.#source, materialId);
      this.#showGhost(preview.grid);
    } catch {
      return;
    }
  }

  #showGhost(grid: { x: number; y: number; z: number }): void {
    this.#removeGhost();
    const size = this.#source.matter.cellSizeM;
    const ghost = new THREE.Mesh(this.#cellGeometry, this.#ghostMaterial);
    ghost.scale.setScalar(size * 0.98);
    ghost.position.copy(centerForGrid(grid, size));
    ghost.renderOrder = 2;
    this.#ghost = ghost;
    this.#scene.add(ghost);
  }

  #removeGhost(): void {
    if (this.#ghost === null) return;
    this.#scene.remove(this.#ghost);
    this.#ghost = null;
  }

  #removeRemoveHelper(): void {
    if (this.#removeHelper === null) return;
    this.#scene.remove(this.#removeHelper);
    this.#removeHelper.geometry.dispose();
    this.#removeHelper = null;
  }

  #beginStopGhost(): void {
    this.#clearStopGhost();
    for (const mesh of this.#cellMeshes) {
      const sourceMaterial = mesh.material;
      const color = !Array.isArray(sourceMaterial) && "color" in sourceMaterial
        ? (sourceMaterial as THREE.MeshStandardMaterial).color
        : new THREE.Color(0xa8c1d4);
      const material = new THREE.MeshBasicMaterial({
        color: color.clone(),
        transparent: true,
        opacity: 0.24,
        depthWrite: false,
      });
      const ghost = new THREE.Mesh(this.#cellGeometry, material);
      ghost.position.copy(mesh.position);
      ghost.quaternion.copy(mesh.quaternion);
      ghost.scale.copy(mesh.scale);
      ghost.renderOrder = 6;
      this.#stopGhostGroup.add(ghost);
      this.#stopGhostMaterials.push(material);
    }
    this.#stopGhostStartedAt = performance.now();
  }

  #updateStopGhost(timestamp: number): void {
    const startedAt = this.#stopGhostStartedAt;
    if (startedAt === null) return;
    const progress = Math.max(0, Math.min(1, (timestamp - startedAt) / STOP_GHOST_MS));
    const opacity = 0.24 * (1 - progress);
    for (const material of this.#stopGhostMaterials) material.opacity = opacity;
    if (progress >= 1) this.#clearStopGhost();
  }

  #clearStopGhost(): void {
    this.#stopGhostGroup.clear();
    for (const material of this.#stopGhostMaterials) material.dispose();
    this.#stopGhostMaterials = [];
    this.#stopGhostStartedAt = null;
  }

  #refreshSelection(): void {
    if (this.#selectionHelper !== null) {
      this.#scene.remove(this.#selectionHelper);
      this.#selectionHelper.geometry.dispose();
      this.#selectionHelper = null;
    }
    if (this.#selection === null) return;
    const mesh = this.#cellById.get(this.#selection);
    if (mesh === undefined) return;
    this.#selectionHelper = new THREE.BoxHelper(mesh, 0xf2f5f7);
    this.#scene.add(this.#selectionHelper);
  }

  #rebuildMatter(): void {
    this.#removeGhost();
    this.#removeRemoveHelper();
    this.#matterGroup.clear();
    this.#cellMeshes = [];
    this.#cellById.clear();
    for (const material of this.#cellMaterials) material.dispose();
    this.#cellMaterials = [];

    const materialById = new Map<string, THREE.MeshStandardMaterial>();
    for (const authored of this.#source.matter.materials) {
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(authored.displayColor),
        roughness: 0.78,
        metalness: 0.04,
      });
      materialById.set(authored.id, material);
      this.#cellMaterials.push(material);
    }

    const size = this.#source.matter.cellSizeM;
    for (const cell of this.#source.matter.cells) {
      const material = materialById.get(cell.materialId);
      if (material === undefined) continue;
      const mesh = new THREE.Mesh(this.#cellGeometry, material);
      mesh.scale.setScalar(size * 0.96);
      mesh.position.copy(centerForGrid(cell.grid, size));
      mesh.userData.cellId = cell.id;
      this.#matterGroup.add(mesh);
      this.#cellMeshes.push(mesh);
      this.#cellById.set(cell.id, mesh);
    }
    this.#canvas.dataset.authoredCells = String(this.#source.matter.cells.length);
  }

  #applyRuntimeFrame(frame: StudioRuntimeFrame): void {
    const runtime = this.#runtime;
    if (runtime === null) throw new Error("Studio viewport received a runtime frame without a live session");
    if (frame.sessionId !== runtime.sessionId || frame.sourceGeneration !== runtime.sourceGeneration) {
      throw new Error("Studio viewport received a stale runtime frame");
    }

    const plan = runtime.plan;
    const runtimeBodies = new Map(frame.bodies.map((body) => [body.planBodyId, body] as const));
    const planBodies = new Map(plan.bodies.map((body) => [body.planBodyId, body] as const));
    const size = this.#source.matter.cellSizeM;

    for (const cell of this.#source.matter.cells) {
      const mesh = this.#cellById.get(cell.id);
      if (mesh === undefined) continue;
      const planBodyId = plan.cellToBody[cell.id];
      if (planBodyId === undefined) throw new Error(`Studio runtime plan lost cell ${cell.id}`);
      const planBody = planBodies.get(planBodyId);
      const runtimeBody = runtimeBodies.get(planBodyId);
      if (planBody === undefined || runtimeBody === undefined) {
        throw new Error(`Studio runtime lost body ${planBodyId} for cell ${cell.id}`);
      }

      const rotation = quaternion(runtimeBody.rotation);
      const localCenter = centerForGrid(cell.grid, size).sub(vector3(planBody.centerOfMassWorld));
      mesh.position.copy(localCenter.applyQuaternion(rotation).add(vector3(runtimeBody.position)));
      mesh.quaternion.copy(rotation);
    }
    this.#meaningPresentation.updateRuntime(frame);
    this.#selectionHelper?.update();
  }

  #handleRuntimeFault(error: unknown): void {
    this.#runtimeRunning = false;
    this.#runtimeLastTimestamp = null;
    this.#runtimeAccumulatorMs = 0;
    this.#callbacks.onRuntimeFault?.(error instanceof Error ? error.message : "Studio runtime fault");
  }

  #advanceRuntime(timestamp: number): void {
    const runtime = this.#runtime;
    if (runtime === null || !this.#runtimeRunning) return;
    if (this.#runtimeLastTimestamp === null) {
      this.#runtimeLastTimestamp = timestamp;
      return;
    }

    const elapsed = Math.min(100, Math.max(0, timestamp - this.#runtimeLastTimestamp));
    this.#runtimeLastTimestamp = timestamp;
    this.#runtimeAccumulatorMs += elapsed;
    let steps = 0;
    let latestFrame: StudioRuntimeFrame | null = null;

    while (this.#runtimeAccumulatorMs >= RUNTIME_STEP_MS && steps < MAX_RUNTIME_STEPS_PER_FRAME) {
      latestFrame = runtime.step(1);
      this.#runtimeAccumulatorMs -= RUNTIME_STEP_MS;
      steps += 1;
      this.#runtimeStepCount += 1;
    }
    if (steps === MAX_RUNTIME_STEPS_PER_FRAME && this.#runtimeAccumulatorMs >= RUNTIME_STEP_MS) {
      this.#runtimeAccumulatorMs = 0;
    }
    if (latestFrame !== null) {
      this.#applyRuntimeFrame(latestFrame);
      this.#canvas.dataset.runtimeFrames = String(this.#runtimeStepCount);
    }
  }

  #orbit(dx: number, dy: number): void {
    const offset = this.#camera.position.clone().sub(this.#target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    spherical.theta -= dx * ORBIT_RADIANS_PER_PIXEL;
    spherical.phi -= dy * ORBIT_RADIANS_PER_PIXEL;
    spherical.makeSafe();
    offset.setFromSpherical(spherical);
    this.#camera.position.copy(this.#target).add(offset);
    this.#camera.lookAt(this.#target);
  }

  #pan(dx: number, dy: number): void {
    const rect = this.#canvas.getBoundingClientRect();
    const distance = this.#camera.position.distanceTo(this.#target);
    const worldPerPixel =
      (2 * Math.tan(THREE.MathUtils.degToRad(this.#camera.fov * 0.5)) * distance) /
      Math.max(1, rect.height);

    this.#camera.updateMatrix();
    const right = new THREE.Vector3().setFromMatrixColumn(this.#camera.matrix, 0);
    const up = new THREE.Vector3().setFromMatrixColumn(this.#camera.matrix, 1);
    const delta = right.multiplyScalar(-dx * worldPerPixel).add(up.multiplyScalar(dy * worldPerPixel));
    this.#target.add(delta);
    this.#camera.position.add(delta);
    this.#camera.lookAt(this.#target);
  }

  #resize(): void {
    if (this.#disposed) return;
    const rect = this.#canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    this.#renderer.setSize(width, height, false);
    this.#camera.aspect = width / height;
    this.#camera.updateProjectionMatrix();
  }

  #emitInput(channel: "semantic" | "orbit" | "pan" | "zoom" | "focus"): void {
    this.#canvas.dispatchEvent(
      new CustomEvent("anvil-studio-input", {
        detail: { channel },
      }),
    );
  }

  readonly #render = (timestamp: number): void => {
    if (this.#disposed) return;
    try {
      this.#advanceRuntime(timestamp);
      this.#updateStopGhost(timestamp);
    } catch (error: unknown) {
      this.#handleRuntimeFault(error);
    }
    this.#renderer.render(this.#scene, this.#camera);
    this.#frame = requestAnimationFrame(this.#render);
  };
}
