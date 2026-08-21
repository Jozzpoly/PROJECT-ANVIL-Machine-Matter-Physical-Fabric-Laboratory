import * as THREE from "three";

type DragMode = "orbit" | "pan";

interface ActiveDrag {
  readonly pointerId: number;
  readonly mode: DragMode;
  x: number;
  y: number;
}

const FOCUS = new THREE.Vector3(0, 0, 0);
const INITIAL_CAMERA = new THREE.Vector3(5.5, 4.25, 6.5);
const MIN_DISTANCE = 1.25;
const MAX_DISTANCE = 80;
const ORBIT_RADIANS_PER_PIXEL = 0.006;

export class StudioViewport {
  readonly #canvas: HTMLCanvasElement;
  readonly #renderer: THREE.WebGLRenderer;
  readonly #scene = new THREE.Scene();
  readonly #camera = new THREE.PerspectiveCamera(45, 1, 0.05, 1000);
  readonly #target = FOCUS.clone();
  readonly #resizeObserver: ResizeObserver;
  #drag: ActiveDrag | null = null;
  #frame = 0;
  #disposed = false;

  constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
    const context = canvas.getContext("webgl2", {
      antialias: true,
      alpha: false,
      depth: true,
      powerPreference: "high-performance",
    });
    if (context === null) throw new Error("ANVIL Studio requires WebGL2");

    this.#renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true, alpha: false });
    this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.#renderer.setClearColor(0x111318, 1);
    this.#renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.#camera.position.copy(INITIAL_CAMERA);
    this.#camera.lookAt(this.#target);

    const grid = new THREE.GridHelper(40, 40, 0x434b57, 0x252a31);
    grid.position.y = 0;
    this.#scene.add(grid);

    this.#resizeObserver = new ResizeObserver(() => this.#resize());
    this.#resizeObserver.observe(canvas);
    this.#bindInput();
    this.#resize();
    this.#frame = requestAnimationFrame(this.#render);
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
    if (drag === null || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.x = event.clientX;
    drag.y = event.clientY;
    if (drag.mode === "orbit") this.#orbit(dx, dy);
    else this.#pan(dx, dy);
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
    this.#target.copy(FOCUS);
    this.#camera.position.copy(INITIAL_CAMERA);
    this.#camera.lookAt(this.#target);
    this.#emitInput("focus");
  };

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
