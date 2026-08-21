import * as THREE from "three";
import {
  createEmptyStudioSource,
  previewAddMatterFromFace,
  previewSeedMatter,
  type StudioGridFace,
  type StudioSourceV0,
} from "../workspace.js";

export type StudioMatterTool = "add" | "remove" | "material";
export type StudioViewportTool = "select" | StudioMatterTool;

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
}

type DragMode = "orbit" | "pan";

interface ActiveDrag {
  readonly pointerId: number;
  readonly mode: DragMode;
  x: number;
  y: number;
}

const INITIAL_CAMERA = new THREE.Vector3(5.5, 4.25, 6.5);
const MIN_DISTANCE = 1.25;
const MAX_DISTANCE = 80;
const ORBIT_RADIANS_PER_PIXEL = 0.006;

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

export class StudioViewport {
  readonly #canvas: HTMLCanvasElement;
  readonly #callbacks: StudioViewportCallbacks;
  readonly #renderer: THREE.WebGLRenderer;
  readonly #scene = new THREE.Scene();
  readonly #camera = new THREE.PerspectiveCamera(45, 1, 0.05, 1000);
  readonly #target = new THREE.Vector3(0, 0.5, 0);
  readonly #raycaster = new THREE.Raycaster();
  readonly #matterGroup = new THREE.Group();
  readonly #cellGeometry = new THREE.BoxGeometry(1, 1, 1);
  readonly #ghostMaterial = new THREE.MeshBasicMaterial({
    color: 0xa8c1d4,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  readonly #resizeObserver: ResizeObserver;
  #source: StudioSourceV0 = createEmptyStudioSource();
  #tool: StudioViewportTool = "select";
  #selection: string | null = null;
  #cellMeshes: THREE.Mesh[] = [];
  #cellById = new Map<string, THREE.Mesh>();
  #cellMaterials: THREE.MeshStandardMaterial[] = [];
  #ghost: THREE.Mesh | null = null;
  #selectionHelper: THREE.BoxHelper | null = null;
  #removeHelper: THREE.BoxHelper | null = null;
  #hoverKey: string | null = null;
  #drag: ActiveDrag | null = null;
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
    this.#scene.add(hemisphere, key, grid, this.#matterGroup);

    this.#resizeObserver = new ResizeObserver(() => this.#resize());
    this.#resizeObserver.observe(canvas);
    this.#bindInput();
    this.#resize();
    this.#rebuildMatter();
    this.#frame = requestAnimationFrame(this.#render);
  }

  setSource(source: StudioSourceV0): void {
    this.#source = source;
    this.#rebuildMatter();
    this.#setHover(null);
    this.#refreshDraftOverlay();
    this.#refreshSelection();
  }

  setTool(tool: StudioViewportTool): void {
    this.#tool = tool;
    this.#setHover(null);
    this.#refreshDraftOverlay();
  }

  setSelection(cellId: string | null): void {
    this.#selection = cellId;
    this.#refreshSelection();
  }

  clearDraft(): void {
    this.#setHover(null);
    this.#removeGhost();
    this.#removeRemoveHelper();
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
    this.#removeGhost();
    this.#removeRemoveHelper();
    this.#selectionHelper?.geometry.dispose();
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
      this.#callbacks.onSelect(hit?.cellId ?? null);
      return;
    }
    if (event.button !== 1) return;

    event.preventDefault();
    const mode: DragMode = event.shiftKey ? "pan" : "orbit";
    this.#drag = { pointerId: event.pointerId, mode, x: event.clientX, y: event.clientY };
    this.#canvas.setPointerCapture(event.pointerId);
    this.#emitInput(mode);
  };

  readonly #onPointerMove = (event: PointerEvent): void => {
    const drag = this.#drag;
    if (drag !== null && drag.pointerId === event.pointerId) {
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      drag.x = event.clientX;
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

  #pickMatter(event: PointerEvent): StudioViewportHit | null {
    const rect = this.#canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.#raycaster.setFromCamera(pointer, this.#camera);
    const intersection = this.#raycaster.intersectObjects(this.#cellMeshes, false)[0];
    if (intersection === undefined || intersection.face === null) return null;
    const cellId = (intersection.object.userData.cellId as string | undefined) ?? null;
    if (cellId === null) return null;
    return { cellId, face: faceFromNormal(intersection.face.normal) };
  }

  #pickGhost(event: PointerEvent): boolean {
    const ghost = this.#ghost;
    if (ghost === null) return false;
    const rect = this.#canvas.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
      -((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1,
    );
    this.#raycaster.setFromCamera(pointer, this.#camera);
    return this.#raycaster.intersectObject(ghost, false).length > 0;
  }

  #setHover(hit: StudioViewportHit | null): void {
    const key = hit === null ? null : `${hit.cellId}@${hit.face}`;
    if (key !== this.#hoverKey) {
      this.#hoverKey = key;
      this.#callbacks.onHover(hit);
    }
    this.#removeGhost();
    this.#removeRemoveHelper();

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

  readonly #render = (): void => {
    if (this.#disposed) return;
    this.#renderer.render(this.#scene, this.#camera);
    this.#frame = requestAnimationFrame(this.#render);
  };
}
