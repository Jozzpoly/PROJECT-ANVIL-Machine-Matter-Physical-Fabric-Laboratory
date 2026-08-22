import * as THREE from "three";
import type {
  BearingAxis,
  BearingEndpoint,
  BearingMark,
} from "../../experiments/anvil-02-bearing.js";
import type { TorquePatch } from "../../experiments/anvil-06-torque-patch.js";
import { resolveBearingTarget, resolveTorqueTarget } from "../meaning.js";
import type { StudioRuntimeFrame, StudioRuntimePlan } from "../runtime.js";
import type { StudioGridFace, StudioSourceV0 } from "../workspace.js";

export interface StudioBearingDraftVisual {
  readonly endpointA: BearingEndpoint;
  readonly endpointB: BearingEndpoint;
  readonly freeAxis: BearingAxis;
}

export interface StudioTorqueDraftVisual {
  readonly target: BearingEndpoint;
  readonly bearingAxis: BearingAxis;
  readonly effortNm: number;
}

export interface StudioMeaningHover {
  readonly cellId: string;
  readonly face: StudioGridFace;
}

const BEARING_COLOR = 0x4bc7c1;
const BEARING_DRAFT_COLOR = 0x8be5df;
const BEARING_HOVER_COLOR = 0x72d8d2;
const TORQUE_COLOR = 0xf2a65a;
const TORQUE_DRAFT_COLOR = 0xffbf78;
const TORQUE_HOVER_COLOR = 0xf2a65a;
const INVALID_COLOR = 0xe56a6a;
const RUNTIME_BEARING_COLOR = 0x9ff5ef;
const RUNTIME_TORQUE_COLOR = 0xffbf78;

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

function setMaterialOpacity(material: THREE.Material | THREE.Material[], opacity: number): void {
  const materials = Array.isArray(material) ? material : [material];
  for (const entry of materials) {
    entry.transparent = opacity < 1;
    entry.opacity = opacity;
    entry.needsUpdate = true;
  }
}

function orientNormal(object: THREE.Object3D, normal: THREE.Vector3): void {
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal.clone().normalize());
}

function faceTangents(normal: THREE.Vector3): readonly [THREE.Vector3, THREE.Vector3] {
  const seed = Math.abs(normal.x) < 0.9
    ? new THREE.Vector3(1, 0, 0)
    : new THREE.Vector3(0, 1, 0);
  const first = seed.sub(normal.clone().multiplyScalar(seed.dot(normal))).normalize();
  const second = normal.clone().cross(first).normalize();
  return [first, second];
}

function runtimeQuaternion(rotation: { readonly x: number; readonly y: number; readonly z: number; readonly w: number }): THREE.Quaternion {
  return new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
}

function runtimeVector(value: { readonly x: number; readonly y: number; readonly z: number }): THREE.Vector3 {
  return new THREE.Vector3(value.x, value.y, value.z);
}

function setLineEndpoints(line: THREE.Line, a: THREE.Vector3, b: THREE.Vector3): void {
  const position = line.geometry.getAttribute("position");
  if (!(position instanceof THREE.BufferAttribute) || position.count < 2) {
    throw new Error("Studio runtime line geometry lost its two endpoints");
  }
  position.setXYZ(0, a.x, a.y, a.z);
  position.setXYZ(1, b.x, b.y, b.z);
  position.needsUpdate = true;
  line.geometry.computeBoundingSphere();
}

export class StudioMeaningPresentation {
  readonly group = new THREE.Group();
  readonly #persistent = new THREE.Group();
  readonly #hover = new THREE.Group();
  readonly #draft = new THREE.Group();
  readonly #runtime = new THREE.Group();
  #source: StudioSourceV0;
  #bearingDraft: StudioBearingDraftVisual | null = null;
  #torqueDraft: StudioTorqueDraftVisual | null = null;
  #torqueHandle: THREE.Mesh | null = null;
  #runtimePlan: StudioRuntimePlan | null = null;
  #runtimeBearingRing: THREE.Mesh | null = null;
  #runtimeBearingAxis: THREE.Line | null = null;
  #runtimeTorquePatch: THREE.Mesh | null = null;
  #runtimeTorqueArrow: THREE.ArrowHelper | null = null;

  constructor(source: StudioSourceV0) {
    this.#source = source;
    this.#runtime.visible = false;
    this.group.add(this.#persistent, this.#hover, this.#draft, this.#runtime);
    this.#rebuildPersistent();
  }

  setSource(source: StudioSourceV0): void {
    this.#source = source;
    this.#rebuildPersistent();
    this.#rebuildDraft();
  }

  setBearingDraft(draft: StudioBearingDraftVisual | null): void {
    this.#bearingDraft = draft;
    if (draft !== null) this.#torqueDraft = null;
    this.#rebuildDraft();
  }

  setTorqueDraft(draft: StudioTorqueDraftVisual | null): void {
    this.#torqueDraft = draft;
    if (draft !== null) this.#bearingDraft = null;
    this.#rebuildDraft();
  }

  torqueDraftEffortNm(): number | null {
    return this.#torqueDraft?.effortNm ?? null;
  }

  hitTorqueHandle(raycaster: THREE.Raycaster): boolean {
    return this.#torqueHandle !== null && raycaster.intersectObject(this.#torqueHandle, false).length > 0;
  }

  setHover(hit: StudioMeaningHover | null, tool: "bearing" | "torque" | null): void {
    disposeObjectTree(this.#hover);
    if (hit === null || tool === null) return;

    if (tool === "bearing") {
      const target = resolveBearingTarget(this.#source, hit.cellId, hit.face);
      if (target === null) return;
      const point = endpointPoint(this.#source, target.endpointA);
      if (point === null) return;
      this.#addFacePreview(this.#hover, point, target.endpointA.face, BEARING_HOVER_COLOR);
      return;
    }

    const target = resolveTorqueTarget(this.#source, hit.cellId, hit.face);
    if (target === null) return;
    const point = endpointPoint(this.#source, target.target);
    if (point === null) return;
    this.#addFacePreview(this.#hover, point, target.target.face, TORQUE_HOVER_COLOR);
  }

  startRuntime(plan: StudioRuntimePlan, frame: StudioRuntimeFrame): void {
    this.clearTransient();
    this.#runtimePlan = plan;
    disposeObjectTree(this.#runtime);
    this.#runtimeBearingRing = null;
    this.#runtimeBearingAxis = null;
    this.#runtimeTorquePatch = null;
    this.#runtimeTorqueArrow = null;

    const size = this.#source.matter.cellSizeM;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(size * 0.25, Math.max(size * 0.022, 0.007), 10, 40),
      new THREE.MeshBasicMaterial({ color: RUNTIME_BEARING_COLOR, depthWrite: false }),
    );
    ring.renderOrder = 8;
    this.#runtime.add(ring);
    this.#runtimeBearingRing = ring;

    const axisGeometry = new THREE.BufferGeometry();
    axisGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
    const axisLine = new THREE.Line(
      axisGeometry,
      new THREE.LineBasicMaterial({ color: RUNTIME_BEARING_COLOR }),
    );
    axisLine.renderOrder = 8;
    this.#runtime.add(axisLine);
    this.#runtimeBearingAxis = axisLine;

    const patch = new THREE.Mesh(
      new THREE.PlaneGeometry(size * 0.38, size * 0.38),
      new THREE.MeshBasicMaterial({
        color: RUNTIME_TORQUE_COLOR,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    patch.renderOrder = 9;
    this.#runtime.add(patch);
    this.#runtimeTorquePatch = patch;

    const arrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(),
      size * 0.46,
      RUNTIME_TORQUE_COLOR,
      size * 0.13,
      size * 0.075,
    );
    setMaterialOpacity(arrow.line.material, 0.28);
    setMaterialOpacity(arrow.cone.material, 0.28);
    arrow.renderOrder = 9;
    this.#runtime.add(arrow);
    this.#runtimeTorqueArrow = arrow;

    this.#persistent.visible = false;
    this.#hover.visible = false;
    this.#draft.visible = false;
    this.#runtime.visible = true;
    this.updateRuntime(frame);
  }

  updateRuntime(frame: StudioRuntimeFrame): void {
    const plan = this.#runtimePlan;
    const ring = this.#runtimeBearingRing;
    const axisLine = this.#runtimeBearingAxis;
    const patchMesh = this.#runtimeTorquePatch;
    const arrow = this.#runtimeTorqueArrow;
    if (plan === null || ring === null || axisLine === null || patchMesh === null || arrow === null) {
      throw new Error("Studio runtime meaning presentation is not initialized");
    }

    const bodies = new Map(frame.bodies.map((body) => [body.planBodyId, body] as const));
    const bodyA = bodies.get(plan.bearing.bodyAId);
    if (bodyA === undefined) throw new Error("Studio runtime Bearing manifestation lost body A");
    const bodyRotation = runtimeQuaternion(bodyA.rotation);
    const bearingPivot = runtimeVector(plan.bearing.localAnchorA)
      .applyQuaternion(bodyRotation)
      .add(runtimeVector(bodyA.position));
    const bearingAxis = runtimeVector(plan.bearing.localAxisA).applyQuaternion(bodyRotation).normalize();

    ring.position.copy(bearingPivot);
    orientNormal(ring, bearingAxis);
    const axisHalf = this.#source.matter.cellSizeM * 0.44;
    setLineEndpoints(
      axisLine,
      bearingPivot.clone().addScaledVector(bearingAxis, -axisHalf),
      bearingPivot.clone().addScaledVector(bearingAxis, axisHalf),
    );

    const targetCell = this.#source.matter.cells.find((cell) => cell.id === plan.torque.target.cellId);
    if (targetCell === undefined) throw new Error("Studio runtime TorquePatch manifestation lost target cell");
    const targetBodyId = plan.cellToBody[targetCell.id];
    if (targetBodyId === undefined) throw new Error("Studio runtime TorquePatch target lost body provenance");
    const targetBody = bodies.get(targetBodyId);
    const planBody = plan.bodies.find((candidate) => candidate.planBodyId === targetBodyId);
    if (targetBody === undefined || planBody === undefined) {
      throw new Error("Studio runtime TorquePatch manifestation lost target body");
    }

    const targetRotation = runtimeQuaternion(targetBody.rotation);
    const authoredFacePoint = cellCenter(targetCell.grid, this.#source.matter.cellSizeM)
      .addScaledVector(faceVector(plan.torque.target.face), this.#source.matter.cellSizeM * 0.5);
    const localFacePoint = authoredFacePoint.sub(runtimeVector(planBody.centerOfMassWorld));
    const runtimeFacePoint = localFacePoint.applyQuaternion(targetRotation).add(runtimeVector(targetBody.position));
    const runtimeNormal = faceVector(plan.torque.target.face).applyQuaternion(targetRotation).normalize();
    const runtimeDirection = bearingAxis.clone().multiplyScalar(plan.torque.effortNm < 0 ? -1 : 1);
    const size = this.#source.matter.cellSizeM;
    const surfacePoint = runtimeFacePoint.clone().addScaledVector(runtimeNormal, size * 0.014);

    patchMesh.position.copy(surfacePoint);
    orientNormal(patchMesh, runtimeNormal);
    const arrowOrigin = surfacePoint.clone().addScaledVector(runtimeNormal, size * 0.08);
    arrow.position.copy(arrowOrigin);
    arrow.setDirection(runtimeDirection.normalize());
    arrow.setLength(size * 0.46, size * 0.13, size * 0.075);

    const torqueOpacity = frame.activation === "ON" ? 0.92 : 0.28;
    setMaterialOpacity(patchMesh.material, torqueOpacity);
    setMaterialOpacity(arrow.line.material, torqueOpacity);
    setMaterialOpacity(arrow.cone.material, torqueOpacity);
  }

  stopRuntime(): void {
    this.#runtimePlan = null;
    disposeObjectTree(this.#runtime);
    this.#runtimeBearingRing = null;
    this.#runtimeBearingAxis = null;
    this.#runtimeTorquePatch = null;
    this.#runtimeTorqueArrow = null;
    this.#runtime.visible = false;
    this.#persistent.visible = true;
    this.#hover.visible = true;
    this.#draft.visible = true;
    this.#rebuildPersistent();
  }

  clearTransient(): void {
    disposeObjectTree(this.#hover);
    this.#bearingDraft = null;
    this.#torqueDraft = null;
    this.#rebuildDraft();
  }

  dispose(): void {
    disposeObjectTree(this.#persistent);
    disposeObjectTree(this.#hover);
    disposeObjectTree(this.#draft);
    disposeObjectTree(this.#runtime);
    this.#torqueHandle = null;
    this.#runtimePlan = null;
    this.group.removeFromParent();
  }

  #rebuildPersistent(): void {
    disposeObjectTree(this.#persistent);
    for (const bearing of this.#source.bearings) {
      this.#addBearing(this.#persistent, bearing, BEARING_COLOR, 0.78);
    }
    for (const patch of this.#source.torquePatches) {
      const target = resolveTorqueTarget(this.#source, patch.target.cellId, patch.target.face);
      if (target === null) {
        this.#addUnresolvedTorquePatch(this.#persistent, patch);
        continue;
      }
      this.#addTorquePatch(this.#persistent, patch, target.bearing.freeAxis, TORQUE_COLOR, 0.82, false);
    }
  }

  #rebuildDraft(): void {
    disposeObjectTree(this.#draft);
    this.#torqueHandle = null;
    if (this.#bearingDraft !== null) {
      this.#addBearing(this.#draft, {
        id: "studio:bearing-draft",
        endpointA: this.#bearingDraft.endpointA,
        endpointB: this.#bearingDraft.endpointB,
        freeAxis: this.#bearingDraft.freeAxis,
      }, BEARING_DRAFT_COLOR, 1);
      return;
    }
    if (this.#torqueDraft !== null) {
      this.#addTorquePatch(this.#draft, {
        id: "studio:torque-draft",
        target: this.#torqueDraft.target,
        effortNm: this.#torqueDraft.effortNm,
      }, this.#torqueDraft.bearingAxis, TORQUE_DRAFT_COLOR, 1, true);
    }
  }

  #addFacePreview(group: THREE.Group, point: THREE.Vector3, face: StudioGridFace, color: number): void {
    const size = this.#source.matter.cellSizeM;
    const normal = faceVector(face);
    const geometry = new THREE.PlaneGeometry(size * 0.72, size * 0.72);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.copy(point).addScaledVector(normal, size * 0.006);
    orientNormal(plane, normal);
    plane.renderOrder = 3;
    group.add(plane);
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
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
    const lineMaterial = new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    setLineEndpoints(
      line,
      pivot.clone().addScaledVector(axis, -half),
      pivot.clone().addScaledVector(axis, half),
    );
    line.renderOrder = 4;
    group.add(line);
  }

  #addUnresolvedTorquePatch(group: THREE.Group, patch: TorquePatch): void {
    const point = endpointPoint(this.#source, patch.target);
    if (point === null) return;
    const size = this.#source.matter.cellSizeM;
    const normal = faceVector(patch.target.face);
    const surfacePoint = point.clone().addScaledVector(normal, size * 0.014);

    const patchGeometry = new THREE.PlaneGeometry(size * 0.36, size * 0.36);
    const patchMaterial = new THREE.MeshBasicMaterial({
      color: INVALID_COLOR,
      transparent: true,
      opacity: 0.46,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const patchMesh = new THREE.Mesh(patchGeometry, patchMaterial);
    patchMesh.position.copy(surfacePoint);
    orientNormal(patchMesh, normal);
    patchMesh.renderOrder = 5;
    group.add(patchMesh);

    const [first, second] = faceTangents(normal);
    const half = size * 0.16;
    const slashGeometry = new THREE.BufferGeometry().setFromPoints([
      surfacePoint.clone().addScaledVector(first, -half).addScaledVector(second, -half),
      surfacePoint.clone().addScaledVector(first, half).addScaledVector(second, half),
    ]);
    const slashMaterial = new THREE.LineBasicMaterial({ color: INVALID_COLOR });
    const slash = new THREE.Line(slashGeometry, slashMaterial);
    slash.renderOrder = 6;
    group.add(slash);
  }

  #addTorquePatch(
    group: THREE.Group,
    patch: TorquePatch,
    bearingAxis: BearingAxis,
    color: number,
    opacity: number,
    activeHandle: boolean,
  ): void {
    const point = endpointPoint(this.#source, patch.target);
    if (point === null) return;
    const size = this.#source.matter.cellSizeM;
    const normal = faceVector(patch.target.face);
    const axis = axisVector(bearingAxis);
    const direction = patch.effortNm < 0 ? axis.multiplyScalar(-1) : axis;
    const surfacePoint = point.clone().addScaledVector(normal, size * 0.012);

    const patchGeometry = new THREE.PlaneGeometry(size * 0.36, size * 0.36);
    const patchMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: opacity < 1,
      opacity,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const patchMesh = new THREE.Mesh(patchGeometry, patchMaterial);
    patchMesh.position.copy(surfacePoint);
    orientNormal(patchMesh, normal);
    patchMesh.renderOrder = 5;
    group.add(patchMesh);

    const arrowOrigin = surfacePoint.clone().addScaledVector(normal, size * 0.08);
    const arrow = new THREE.ArrowHelper(
      direction.clone().normalize(),
      arrowOrigin,
      size * 0.42,
      color,
      size * 0.12,
      size * 0.07,
    );
    setMaterialOpacity(arrow.line.material, opacity);
    setMaterialOpacity(arrow.cone.material, opacity);
    arrow.renderOrder = 5;
    group.add(arrow);

    if (!activeHandle) return;
    const handleGeometry = new THREE.SphereGeometry(size * 0.085, 16, 12);
    const handleMaterial = new THREE.MeshBasicMaterial({ color, depthTest: false });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.copy(arrowOrigin).addScaledVector(direction, size * 0.46);
    handle.userData.studioTorqueHandle = true;
    handle.renderOrder = 7;
    group.add(handle);
    this.#torqueHandle = handle;
  }
}
