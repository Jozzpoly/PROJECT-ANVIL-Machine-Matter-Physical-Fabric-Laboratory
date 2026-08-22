import * as THREE from "three";
import type {
  BearingAxis,
  BearingEndpoint,
  BearingMark,
} from "../../experiments/anvil-02-bearing.js";
import { resolveBearingTarget } from "../meaning.js";
import type { StudioGridFace, StudioSourceV0 } from "../workspace.js";

export interface StudioBearingDraftVisual {
  readonly endpointA: BearingEndpoint;
  readonly endpointB: BearingEndpoint;
  readonly freeAxis: BearingAxis;
}

export interface StudioMeaningHover {
  readonly cellId: string;
  readonly face: StudioGridFace;
}

const BEARING_COLOR = 0x4bc7c1;
const BEARING_DRAFT_COLOR = 0x8be5df;
const HOVER_COLOR = 0x72d8d2;

function axisVector(axis: BearingAxis): THREE.Vector3 {
  if (axis === "x") return new THREE.Vector3(1, 0, 0);
  if (axis === "y") return new THREE.Vector3(0, 1, 0);
  return new THREE.Vector3(0, 0, 1);
}

function faceVector(face: StudioGridFace): THREE.Vector3 {
  switch (face) {
    case "x-": return new THREE.Vector3(-1, 0, 0);
    case "x+": return new THREE.Vector3(1, 0, 0);
    case "y-": return new THREE.Vector3(0, -1, 0);
    case "y+": return new THREE.Vector3(0, 1, 0);
    case "z-": return new THREE.Vector3(0, 0, -1);
    case "z+": return new THREE.Vector3(0, 0, 1);
  }
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

function endpointPoint(source: StudioSourceV0, endpoint: BearingEndpoint): THREE.Vector3 | null {
  const cell = source.matter.cells.find((candidate) => candidate.id === endpoint.cellId);
  if (cell === undefined) return null;
  return cellCenter(cell.grid, source.matter.cellSizeM)
    .addScaledVector(faceVector(endpoint.face), source.matter.cellSizeM * 0.5);
}

function disposeObjectTree(group: THREE.Group): void {
  for (const child of [...group.children]) {
    group.remove(child);
    child.traverse((object) => {
      if ("geometry" in object) {
        const geometry = (object as THREE.Mesh).geometry;
        geometry?.dispose();
      }
      if ("material" in object) {
        const material = (object as THREE.Mesh).material;
        if (Array.isArray(material)) {
          for (const entry of material) entry.dispose();
        } else {
          material?.dispose();
        }
      }
    });
  }
}

function orientNormal(object: THREE.Object3D, normal: THREE.Vector3): void {
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal.clone().normalize());
}

export class StudioMeaningPresentation {
  readonly group = new THREE.Group();
  readonly #persistent = new THREE.Group();
  readonly #hover = new THREE.Group();
  readonly #draft = new THREE.Group();
  #source: StudioSourceV0;
  #bearingDraft: StudioBearingDraftVisual | null = null;

  constructor(source: StudioSourceV0) {
    this.#source = source;
    this.group.add(this.#persistent, this.#hover, this.#draft);
    this.#rebuildPersistent();
  }

  setSource(source: StudioSourceV0): void {
    this.#source = source;
    this.#rebuildPersistent();
    this.#rebuildDraft();
  }

  setBearingDraft(draft: StudioBearingDraftVisual | null): void {
    this.#bearingDraft = draft;
    this.#rebuildDraft();
  }

  setHover(hit: StudioMeaningHover | null, tool: "bearing" | "torque" | null): void {
    disposeObjectTree(this.#hover);
    if (tool !== "bearing" || hit === null) return;
    const target = resolveBearingTarget(this.#source, hit.cellId, hit.face);
    if (target === null) return;
    const point = endpointPoint(this.#source, target.endpointA);
    if (point === null) return;

    const size = this.#source.matter.cellSizeM;
    const geometry = new THREE.PlaneGeometry(size * 0.72, size * 0.72);
    const material = new THREE.MeshBasicMaterial({
      color: HOVER_COLOR,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.copy(point).addScaledVector(faceVector(target.endpointA.face), size * 0.006);
    orientNormal(plane, faceVector(target.endpointA.face));
    plane.renderOrder = 3;
    this.#hover.add(plane);
  }

  clearTransient(): void {
    disposeObjectTree(this.#hover);
    this.setBearingDraft(null);
  }

  dispose(): void {
    disposeObjectTree(this.#persistent);
    disposeObjectTree(this.#hover);
    disposeObjectTree(this.#draft);
    this.group.removeFromParent();
  }

  #rebuildPersistent(): void {
    disposeObjectTree(this.#persistent);
    for (const bearing of this.#source.bearings) {
      this.#addBearing(this.#persistent, bearing, BEARING_COLOR, 0.78);
    }
  }

  #rebuildDraft(): void {
    disposeObjectTree(this.#draft);
    if (this.#bearingDraft === null) return;
    this.#addBearing(this.#draft, {
      id: "studio:bearing-draft",
      endpointA: this.#bearingDraft.endpointA,
      endpointB: this.#bearingDraft.endpointB,
      freeAxis: this.#bearingDraft.freeAxis,
    }, BEARING_DRAFT_COLOR, 1);
  }

  #addBearing(
    group: THREE.Group,
    bearing: BearingMark,
    color: number,
    opacity: number,
  ): void {
    const pivotA = endpointPoint(this.#source, bearing.endpointA);
    const pivotB = endpointPoint(this.#source, bearing.endpointB);
    const pivot = pivotA ?? pivotB;
    if (pivot === null) return;

    const size = this.#source.matter.cellSizeM;
    const axis = axisVector(bearing.freeAxis);
    const ringGeometry = new THREE.TorusGeometry(size * 0.23, Math.max(size * 0.018, 0.006), 8, 36);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: opacity < 1,
      opacity,
      depthTest: true,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(pivot);
    orientNormal(ring, axis);
    ring.renderOrder = 4;
    group.add(ring);

    const half = size * 0.42;
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      pivot.clone().addScaledVector(axis, -half),
      pivot.clone().addScaledVector(axis, half),
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    line.renderOrder = 4;
    group.add(line);
  }
}
