import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { createRuntimeHarness, faceFromNormal, makePerfGrid, median } from "./shared.js";

const bootAt = performance.now();
const canvas = document.querySelector("#viewport");
const status = document.querySelector("#status");
const selection = document.querySelector("#selection");
const metrics = window.__P05 = { candidate: "babylon", ready: false, lastPick: null };
const harness = await createRuntimeHarness();
const presentationJson = JSON.stringify(harness.presentation);
const gridData = makePerfGrid();

const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0.043, 0.059, 0.078, 1);
const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(4, -6, 5), scene);
camera.upVector = new BABYLON.Vector3(0, 0, 1);
camera.setTarget(new BABYLON.Vector3(0.25, 0.15, 0));
camera.attachControl(canvas, true);
new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, -1, 1), scene).intensity = 1.6;
const light = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(-0.4, 0.5, -1), scene); light.intensity = 1.4;

const grid = BABYLON.MeshBuilder.CreateBox("perf-grid", { width: 0.044, height: 0.044, depth: 0.02 }, scene);
const gridMaterial = new BABYLON.StandardMaterial("grid-mat", scene); gridMaterial.diffuseColor = new BABYLON.Color3(0.38, 0.46, 0.53); grid.material = gridMaterial;
const matrices = new Float32Array(gridData.count * 16);
function writeMatrix(index, p) {
  const o = index * 16;
  matrices[o] = 1; matrices[o + 1] = 0; matrices[o + 2] = 0; matrices[o + 3] = 0;
  matrices[o + 4] = 0; matrices[o + 5] = 1; matrices[o + 6] = 0; matrices[o + 7] = 0;
  matrices[o + 8] = 0; matrices[o + 9] = 0; matrices[o + 10] = 1; matrices[o + 11] = 0;
  matrices[o + 12] = p.x; matrices[o + 13] = p.y; matrices[o + 14] = p.z; matrices[o + 15] = 1;
}
for (let i = 0; i < gridData.count; i += 1) writeMatrix(i, gridData.positions[i]);
grid.thinInstanceSetBuffer("matrix", matrices, 16, true);
grid.thinInstanceEnablePicking = true;
grid.isPickable = true;

const updateStart = performance.now();
for (let i = 0; i < gridData.count; i += 1) writeMatrix(i, gridData.positions[i]);
grid.thinInstanceBufferUpdated("matrix");
metrics.update10kMs = performance.now() - updateStart;

const bodyMeshes = new Map();
for (const [index, body] of harness.presentation.compiled.bodies.entries()) {
  const mesh = BABYLON.MeshBuilder.CreateBox(`body-${index}`, { size: 0.5 }, scene);
  const mat = new BABYLON.StandardMaterial(`body-mat-${index}`, scene);
  mat.diffuseColor = index ? new BABYLON.Color3(0.46, 0.83, 0.65) : new BABYLON.Color3(0.94, 0.66, 0.42);
  mesh.material = mat; mesh.rotationQuaternion = BABYLON.Quaternion.Identity(); bodyMeshes.set(body.id, mesh);
}
const pivot = harness.presentation.compiled.bearing.pivotWorld;
const axis = harness.presentation.compiled.bearing.axisWorld;
const pivotMarker = BABYLON.MeshBuilder.CreateSphere("pivot", { diameter: 0.11, segments: 12 }, scene); pivotMarker.position.set(pivot.x, pivot.y, pivot.z);
const pivotMat = new BABYLON.StandardMaterial("pivot-mat", scene); pivotMat.emissiveColor = new BABYLON.Color3(0.95, 0.88, 0.35); pivotMarker.material = pivotMat;
const axisLine = BABYLON.MeshBuilder.CreateLines("axis", { points: [new BABYLON.Vector3(pivot.x - axis.x * 0.4, pivot.y - axis.y * 0.4, pivot.z - axis.z * 0.4), new BABYLON.Vector3(pivot.x + axis.x * 0.4, pivot.y + axis.y * 0.4, pivot.z + axis.z * 0.4)] }, scene); axisLine.color = new BABYLON.Color3(0.4, 0.87, 1);
const torque = BABYLON.MeshBuilder.CreatePlane("torque", { size: 0.34, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene); torque.rotation.y = Math.PI / 2;
const tc = harness.presentation.compiled.torque.targetCenterWorld; torque.position.set(tc.x, tc.y, tc.z);
const torqueMat = new BABYLON.StandardMaterial("torque-mat", scene); torqueMat.diffuseColor = new BABYLON.Color3(1, 0.46, 0.54); torqueMat.alpha = 0.55; torque.material = torqueMat;
const highlight = BABYLON.MeshBuilder.CreateBox("highlight", { width: 0.052, height: 0.052, depth: 0.026 }, scene); highlight.isVisible = false;
const hiMat = new BABYLON.StandardMaterial("highlight-mat", scene); hiMat.emissiveColor = new BABYLON.Color3(1, 0.85, 0.35); hiMat.alpha = 0.55; highlight.material = hiMat;

function targetScreen() {
  const rect = canvas.getBoundingClientRect();
  const viewport = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
  const projected = BABYLON.Vector3.Project(new BABYLON.Vector3(gridData.target.x, gridData.target.y, gridData.target.z + 0.011), BABYLON.Matrix.Identity(), scene.getTransformMatrix(), viewport);
  return { x: rect.left + projected.x, y: rect.top + projected.y };
}

function pickAt(pageX, pageY) {
  const rect = canvas.getBoundingClientRect();
  const pick = scene.pick(pageX - rect.left, pageY - rect.top, (mesh) => mesh === grid, false, camera);
  if (!pick?.hit || pick.thinInstanceIndex == null || pick.thinInstanceIndex < 0) return null;
  const normal = pick.getNormal(true) ?? new BABYLON.Vector3(0, 0, 0);
  const p = gridData.positions[pick.thinInstanceIndex];
  return { index: pick.thinInstanceIndex, cellId: p.id, face: faceFromNormal(normal), point: pick.pickedPoint ? { x: pick.pickedPoint.x, y: pick.pickedPoint.y, z: pick.pickedPoint.z } : null };
}

canvas.addEventListener("click", (event) => {
  const picked = pickAt(event.clientX, event.clientY); metrics.lastPick = picked;
  if (!picked) { selection.textContent = "none"; highlight.isVisible = false; return; }
  selection.textContent = `${picked.cellId} · ${picked.face}`;
  const p = gridData.positions[picked.index]; highlight.position.set(p.x, p.y, p.z); highlight.isVisible = true;
});

engine.resize(); scene.render();
const target = targetScreen();
const pickStart = performance.now();
let benchmarkPick = null;
for (let i = 0; i < 20; i += 1) benchmarkPick = pickAt(target.x, target.y);
metrics.pick20Ms = performance.now() - pickStart;
metrics.benchmarkPick = benchmarkPick;
metrics.libraryVersion = BABYLON.Engine.Version;
metrics.instanceCount = gridData.count;
metrics.targetCellId = gridData.target.id;
metrics.targetScreen = target;
metrics.presentationSerializable = JSON.parse(presentationJson).schema === harness.presentation.schema;
metrics.overlayKinds = ["bearing-pivot", "bearing-axis", "torque-face"];
metrics.runtime = { offSpeedRadps: harness.offSpeedRadps, onSpeedRadps: 0, bodyCount: 0 };
try { metrics.gpuRenderer = engine.getGlInfo?.().renderer ?? null; } catch { metrics.gpuRenderer = null; }

const frameTimes = [];
let previous = performance.now();
let frames = 0;
engine.runRenderLoop(() => {
  const now = performance.now(); const dt = now - previous; previous = now; if (frames > 8) frameTimes.push(dt); frames += 1;
  const runtimeFrame = harness.step(1);
  for (const body of runtimeFrame.bodies) {
    const mesh = bodyMeshes.get(body.planBodyId); if (!mesh) continue;
    mesh.position.set(body.position.x, body.position.y, body.position.z);
    mesh.rotationQuaternion.set(body.rotation.x, body.rotation.y, body.rotation.z, body.rotation.w);
  }
  scene.render();
  if (!metrics.ready && frames >= 55) {
    metrics.runtime = { offSpeedRadps: harness.offSpeedRadps, onSpeedRadps: runtimeFrame.relativeAngularSpeedRadps, bodyCount: runtimeFrame.bodies.length };
    metrics.frameMedianMs = median(frameTimes.slice(-40));
    metrics.bootToReadyMs = performance.now() - bootAt;
    metrics.ready = Math.abs(runtimeFrame.relativeAngularSpeedRadps) > 0.1;
    if (metrics.ready) { status.textContent = "ready"; status.dataset.state = "ready"; }
  }
});
addEventListener("resize", () => engine.resize());
addEventListener("beforeunload", () => { engine.stopRenderLoop(); harness.dispose(); engine.dispose(); });
