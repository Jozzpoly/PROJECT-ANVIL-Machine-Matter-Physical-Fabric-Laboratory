import * as THREE from "three";
import { projectO1xRepresentation } from "../o1x-representation.js";
import type { StudioGridFace, StudioSourceV0 } from "../workspace.js";

export type O1xStudioLens = "surface" | "cells" | "meaning";

export interface O1xSemanticHit {
  readonly cellId: string;
  readonly face: StudioGridFace;
}

const FACE_NORMALS: Readonly<Record<StudioGridFace, THREE.Vector3>> = Object.freeze({
  "x-": new THREE.Vector3(-1, 0, 0),
  "x+": new THREE.Vector3(1, 0, 0),
  "y-": new THREE.Vector3(0, -1, 0),
  "y+": new THREE.Vector3(0, 1, 0),
  "z-": new THREE.Vector3(0, 0, -1),
  "z+": new THREE.Vector3(0, 0, 1),
});

function orientPlane(mesh: THREE.Object3D, face: StudioGridFace): void {
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), FACE_NORMALS[face]);
}

function gridPoint(
  value: readonly [number, number, number],
  cellSizeM: number,
): THREE.Vector3 {
  return new THREE.Vector3(
    value[0] * cellSizeM,
    value[1] * cellSizeM,
    value[2] * cellSizeM,
  );
}

function cellCenter(
  grid: { readonly x: number; readonly y: number; readonly z: number },
  cellSizeM: number,
): THREE.Vector3 {
  return new THREE.Vector3(
    (grid.x + 0.5) * cellSizeM,
    (grid.y + 0.5) * cellSizeM,
    (grid.z + 0.5) * cellSizeM,
  );
}

function endpointPoint(
  source: StudioSourceV0,
  cellId: string,
  face: StudioGridFace,
): THREE.Vector3 | null {
  const cell = source.matter.cells.find((candidate) => candidate.id === cellId);
  if (cell === undefined) return null;
  const size = source.matter.cellSizeM;
  return cellCenter(cell.grid, size).addScaledVector(FACE_NORMALS[face], size * 0.5);
}

export class O1xLensPresentation {
  readonly group = new THREE.Group();
  readonly #cellEdges = new THREE.Group();
  readonly #interfaces = new THREE.Group();
  readonly #semanticProxies = new THREE.Group();
  readonly #edgeGeometry: THREE.EdgesGeometry;
  readonly #interfaceGeometry = new THREE.PlaneGeometry(1, 1);
  readonly #candidateMaterial = new THREE.MeshBasicMaterial({
    color: 0x7f9eaa,
    transparent: true,
    opacity: 0.17,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  readonly #bearingMaterial = new THREE.MeshBasicMaterial({
    color: 0x4bc7c1,
    transparent: true,
    opacity: 0.36,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  readonly #torqueMaterial = new THREE.MeshBasicMaterial({
    color: 0xf2a65a,
    transparent: true,
    opacity: 0.4,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  readonly #edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x95a4af,
    transparent: true,
    opacity: 0.42,
    depthTest: true,
    depthWrite: false,
  });
  readonly #proxyMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthTest: false,
    depthWrite: false,
  });
  readonly #proxyGeometry = new THREE.SphereGeometry(1, 12, 8);
  readonly #canvas: HTMLCanvasElement;
  readonly #dock: HTMLDivElement;
  #source: StudioSourceV0;
  #lens: O1xStudioLens = "surface";
  #runtimeActive = false;
  #interfaceTargets: THREE.Mesh[] = [];
  #bearingTargets: THREE.Mesh[] = [];
  #torqueTargets: THREE.Mesh[] = [];

  constructor(canvas: HTMLCanvasElement, source: StudioSourceV0) {
    this.#canvas = canvas;
    this.#source = source;
    const unitBox = new THREE.BoxGeometry(1, 1, 1);
    this.#edgeGeometry = new THREE.EdgesGeometry(unitBox);
    unitBox.dispose();
    this.group.add(this.#cellEdges, this.#interfaces, this.#semanticProxies);

    this.#dock = document.createElement("div");
    this.#dock.className = "studio-lens-dock studio-island";
    this.#dock.dataset.o1xLensDock = "true";
    this.#dock.setAttribute("aria-label", "View lens");
    for (const lens of ["surface", "cells", "meaning"] as const) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.lens = lens;
      button.textContent = lens[0]?.toUpperCase() + lens.slice(1);
      button.addEventListener("click", () => this.setLens(lens));
      this.#dock.append(button);
    }
    canvas.parentElement?.append(this.#dock);

    this.setSource(source);
    this.setLens("surface");
  }

  get lens(): O1xStudioLens {
    return this.#lens;
  }

  setLens(lens: O1xStudioLens): void {
    this.#lens = lens;
    this.#canvas.dataset.o1xLens = lens;
    for (const button of this.#dock.querySelectorAll<HTMLButtonElement>("button[data-lens]")) {
      button.classList.toggle("active", button.dataset.lens === lens);
    }
    this.#refreshVisibility();
    this.#canvas.dispatchEvent(new CustomEvent("anvil-o1x-lens", { detail: { lens } }));
  }

  setRuntimeActive(active: boolean): void {
    this.#runtimeActive = active;
    for (const button of this.#dock.querySelectorAll<HTMLButtonElement>("button")) {
      button.disabled = active;
    }
    this.#refreshVisibility();
  }

  setSource(source: StudioSourceV0): void {
    this.#source = source;
    this.#cellEdges.clear();
    this.#interfaces.clear();
    this.#semanticProxies.clear();
    this.#interfaceTargets = [];
    this.#bearingTargets = [];
    this.#torqueTargets = [];

    const projection = projectO1xRepresentation(source);
    const size = source.matter.cellSizeM;
    this.#canvas.dataset.o1xSurfaceFaces = String(projection.surfaceFaces.length);
    this.#canvas.dataset.o1xSharedInterfaces = String(projection.sharedInterfaces.length);

    for (const cell of source.matter.cells) {
      const edges = new THREE.LineSegments(this.#edgeGeometry, this.#edgeMaterial);
      edges.position.copy(cellCenter(cell.grid, size));
      edges.scale.setScalar(size * 1.002);
      edges.renderOrder = 10;
      this.#cellEdges.add(edges);
    }

    for (const shared of projection.sharedInterfaces) {
      const material = shared.torquePatchIds.length > 0
        ? this.#torqueMaterial
        : shared.bearingIds.length > 0
          ? this.#bearingMaterial
          : this.#candidateMaterial;
      const plane = new THREE.Mesh(this.#interfaceGeometry, material);
      plane.position.copy(gridPoint(shared.centerGrid, size));
      plane.scale.setScalar(size * (shared.bearingIds.length > 0 ? 0.82 : 0.68));
      orientPlane(plane, shared.endpointA.face as StudioGridFace);
      plane.renderOrder = 11;
      plane.userData.o1xInterface = {
        cellId: shared.endpointA.cellId,
        face: shared.endpointA.face,
      } satisfies O1xSemanticHit;
      this.#interfaces.add(plane);
      this.#interfaceTargets.push(plane);

      if (shared.bearingIds.length > 0) {
        const proxy = new THREE.Mesh(this.#proxyGeometry, this.#proxyMaterial);
        proxy.position.copy(plane.position);
        proxy.scale.setScalar(size * 0.27);
        proxy.userData.o1xSemantic = {
          kind: "bearing",
          cellId: shared.endpointA.cellId,
          face: shared.endpointA.face,
        };
        this.#semanticProxies.add(proxy);
        this.#bearingTargets.push(proxy);
      }
    }

    for (const patch of source.torquePatches) {
      const point = endpointPoint(source, patch.target.cellId, patch.target.face as StudioGridFace);
      if (point === null) continue;
      const proxy = new THREE.Mesh(this.#proxyGeometry, this.#proxyMaterial);
      proxy.position.copy(point).addScaledVector(
        FACE_NORMALS[patch.target.face as StudioGridFace],
        size * 0.04,
      );
      proxy.scale.setScalar(size * 0.22);
      proxy.userData.o1xSemantic = {
        kind: "torque",
        cellId: patch.target.cellId,
        face: patch.target.face,
      };
      this.#semanticProxies.add(proxy);
      this.#torqueTargets.push(proxy);
    }
    this.#refreshVisibility();
  }

  pickMeaning(
    raycaster: THREE.Raycaster,
    tool: "bearing" | "torque",
  ): O1xSemanticHit | null {
    if (this.#runtimeActive) return null;
    const existingTargets = tool === "bearing" ? this.#bearingTargets : this.#torqueTargets;
    const existing = raycaster.intersectObjects(existingTargets, false)[0];
    if (existing !== undefined) {
      const semantic = existing.object.userData.o1xSemantic as
        | { readonly cellId: string; readonly face: StudioGridFace }
        | undefined;
      if (semantic !== undefined) return { cellId: semantic.cellId, face: semantic.face };
    }

    if (tool !== "bearing" || this.#lens !== "meaning") return null;
    const candidate = raycaster.intersectObjects(this.#interfaceTargets, false)[0];
    if (candidate === undefined) return null;
    const hit = candidate.object.userData.o1xInterface as O1xSemanticHit | undefined;
    return hit ?? null;
  }

  dispose(): void {
    this.#dock.remove();
    this.group.removeFromParent();
    this.#edgeGeometry.dispose();
    this.#interfaceGeometry.dispose();
    this.#proxyGeometry.dispose();
    this.#candidateMaterial.dispose();
    this.#bearingMaterial.dispose();
    this.#torqueMaterial.dispose();
    this.#edgeMaterial.dispose();
    this.#proxyMaterial.dispose();
  }

  #refreshVisibility(): void {
    this.#cellEdges.visible = !this.#runtimeActive && this.#lens === "cells";
    this.#interfaces.visible = !this.#runtimeActive && this.#lens === "meaning";
    this.#semanticProxies.visible = !this.#runtimeActive;
    this.#dock.classList.toggle("runtime-disabled", this.#runtimeActive);
  }
}
