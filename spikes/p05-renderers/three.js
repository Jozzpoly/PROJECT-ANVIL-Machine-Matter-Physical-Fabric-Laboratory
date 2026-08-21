import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createRuntimeHarness, faceFromNormal, makePerfGrid, median } from "./shared.js";

const bootAt = performance.now();
const canvas = document.querySelector("#viewport");
const status = document.querySelector("#status");
const selection = document.querySelector("#selection");
const metrics = window.__P05 = { candidate: "three", ready: false, lastPick: null };

const harness = await createRuntimeHarness();
const presentationJson = JSON.stringify(harness.presentation);
const grid = makePerfGrid();

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f14);
const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 100);
camera.position.set(4, -6, 5);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);
const controls = new OrbitControls(camera, canvas);
controls.target.set(0.25, 0.15, 0);
controls.enableDamping = false;
controls.update();
scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x26303a, 2.1));
const sun = new THREE.DirectionalLight(0xffffff, 2.4); sun.position.set(4, -4, 8); scene.add(sun);

const gridGeometry = new THREE.BoxGeometry(0.044, 0.044, 0.02);
const gridMaterial = new THREE.MeshLambertMaterial({ color: 0x607487 });
const cells = new THREE.InstancedMesh(gridGeometry, gridMaterial, grid.count);
cells.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
cells.frustumCulled = false;
const matrix = new THREE.Matrix4();
for (let i = 0; i < grid.count; i += 1) {
  const p = grid.positions[i]; matrix.makeTranslation(p.x, p.y, p.z); cells.setMatrixAt(i, matrix);
}
cells.instanceMatrix.needsUpdate = true;
scene.add(cells);

const updateStart = performance.now();
for (let i = 0; i < grid.count; i += 1) {
  const p = grid.positions[i]; matrix.makeTranslation(p.x, p.y, p.z); cells.setMatrixAt(i, matrix);
}
cells.instanceMatrix.needsUpdate = true;
metrics.update10kMs = performance.now() - updateStart;

const bodyMeshes = new Map();
for (const [index, body] of harness.presentation.compiled.bodies.entries()) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: index ? 0x76d3a6 : 0xf0a96b, roughness: 0.55 }));
  scene.add(mesh); bodyMeshes.set(body.id, mesh);
}
const pivot = harness.presentation.compiled.bearing.pivotWorld;
const axis = harness.presentation.compiled.bearing.axisWorld;
scene.add(new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 10), new THREE.MeshBasicMaterial({ color: 0xf4e36c })));
const pivotMarker = scene.children.at(-1); pivotMarker.position.set(pivot.x, pivot.y, pivot.z);
scene.add(new THREE.ArrowHelper(new THREE.Vector3(axis.x, axis.y, axis.z).normalize(), new THREE.Vector3(pivot.x, pivot.y, pivot.z), 0.8, 0x6de0ff, 0.16, 0.08));
const torque = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshBasicMaterial({ color: 0xff7b8b, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
torque.rotation.y = Math.PI / 2;
const tc = harness.presentation.compiled.torque.targetCenterWorld; torque.position.set(tc.x, tc.y, tc.z); scene.add(torque);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const highlight = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.052, 0.026), new THREE.MeshBasicMaterial({ color: 0xffdf73, wireframe: true }));
highlight.visible = false; scene.add(highlight);

function resize() {
  const width = innerWidth, height = innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height; camera.updateProjectionMatrix();
}
addEventListener("resize", resize); resize();

function targetScreen() {
  const p = new THREE.Vector3(grid.target.x, grid.target.y, grid.target.z + 0.011).project(camera);
  const rect = canvas.getBoundingClientRect();
  return { x: rect.left + (p.x + 1) * 0.5 * rect.width, y: rect.top + (1 - (p.y + 1) * 0.5) * rect.height };
}

function pickAt(pageX, pageY) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((pageX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -(((pageY - rect.top) / rect.height) * 2 - 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObject(cells, false)[0];
  if (!hit || hit.instanceId == null || !hit.face) return null;
  const p = grid.positions[hit.instanceId];
  const normal = hit.face.normal;
  return { index: hit.instanceId, cellId: p.id, face: faceFromNormal(normal), point: { x: hit.point.x, y: hit.point.y, z: hit.point.z } };
}

canvas.addEventListener("click", (event) => {
  const picked = pickAt(event.clientX, event.clientY);
  metrics.lastPick = picked;
  if (!picked) { selection.textContent = "none"; highlight.visible = false; return; }
  selection.textContent = `${picked.cellId} · ${picked.face}`;
  const p = grid.positions[picked.index]; highlight.position.set(p.x, p.y, p.z); highlight.visible = true;
});

renderer.render(scene, camera);
const target = targetScreen();
const pickStart = performance.now();
let benchmarkPick = null;
for (let i = 0; i < 20; i += 1) benchmarkPick = pickAt(target.x, target.y);
metrics.pick20Ms = performance.now() - pickStart;
metrics.benchmarkPick = benchmarkPick;

const gl = renderer.getContext();
const debug = gl.getExtension("WEBGL_debug_renderer_info");
metrics.gpuRenderer = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
metrics.libraryVersion = THREE.REVISION;
metrics.instanceCount = grid.count;
metrics.targetCellId = grid.target.id;
metrics.targetScreen = target;
metrics.presentationSerializable = JSON.parse(presentationJson).schema === harness.presentation.schema;
metrics.overlayKinds = ["bearing-pivot", "bearing-axis", "torque-face"];
metrics.runtime = { offSpeedRadps: harness.offSpeedRadps, onSpeedRadps: 0, bodyCount: 0 };

const frameTimes = [];
let previous = performance.now();
let frames = 0;
function frame(now) {
  const dt = now - previous; previous = now; if (frames > 8) frameTimes.push(dt);
  frames += 1;
  const runtimeFrame = harness.step(1);
  for (const body of runtimeFrame.bodies) {
    const mesh = bodyMeshes.get(body.planBodyId); if (!mesh) continue;
    mesh.position.set(body.position.x, body.position.y, body.position.z);
    mesh.quaternion.set(body.rotation.x, body.rotation.y, body.rotation.z, body.rotation.w);
  }
  controls.update(); renderer.render(scene, camera);
  if (!metrics.ready && frames >= 55) {
    metrics.runtime = { offSpeedRadps: harness.offSpeedRadps, onSpeedRadps: runtimeFrame.relativeAngularSpeedRadps, bodyCount: runtimeFrame.bodies.length };
    metrics.frameMedianMs = median(frameTimes.slice(-40));
    metrics.drawCalls = renderer.info.render.calls;
    metrics.bootToReadyMs = performance.now() - bootAt;
    metrics.ready = Math.abs(runtimeFrame.relativeAngularSpeedRadps) > 0.1;
    if (metrics.ready) { status.textContent = "ready"; status.dataset.state = "ready"; }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
addEventListener("beforeunload", () => harness.dispose());
