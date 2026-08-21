import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { createRuntimeHarness, faceFromNormal, makePerfGrid } from "../p05-renderers/shared.js";

export async function createThreeViewport({ canvas, onReady, onSelection, onPreview }) {
  const harness = await createRuntimeHarness();
  const sourceSnapshot = JSON.stringify(harness.source);
  const grid = makePerfGrid(1_000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0f15);
  const camera = new THREE.PerspectiveCamera(44, 1, 0.01, 100);
  camera.position.set(4, -6, 4.5);
  camera.up.set(0, 0, 1);
  camera.lookAt(0.2, 0, 0);

  const orbit = new OrbitControls(camera, canvas);
  orbit.target.set(0.25, 0.1, -0.1);
  orbit.enableDamping = false;
  orbit.update();

  scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x202934, 2.0));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(4, -4, 8);
  scene.add(sun);

  const gridGeometry = new THREE.BoxGeometry(0.07, 0.07, 0.025);
  const gridMaterial = new THREE.MeshLambertMaterial({ color: 0x52697d });
  const cells = new THREE.InstancedMesh(gridGeometry, gridMaterial, grid.count);
  cells.frustumCulled = false;
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < grid.count; i += 1) {
    const p = grid.positions[i];
    matrix.makeTranslation(p.x, p.y, p.z);
    cells.setMatrixAt(i, matrix);
  }
  cells.instanceMatrix.needsUpdate = true;
  scene.add(cells);

  const bodyMeshes = new Map();
  for (const [index, body] of harness.presentation.compiled.bodies.entries()) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: index ? 0x72d0a4 : 0xe9a269, roughness: 0.55 }),
    );
    bodyMeshes.set(body.id, mesh);
    scene.add(mesh);
  }

  const pivot = harness.presentation.compiled.bearing.pivotWorld;
  const axis = harness.presentation.compiled.bearing.axisWorld;
  const pivotMarker = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 16, 10),
    new THREE.MeshBasicMaterial({ color: 0xf2df6b }),
  );
  pivotMarker.position.set(pivot.x, pivot.y, pivot.z);
  scene.add(pivotMarker);
  scene.add(new THREE.ArrowHelper(
    new THREE.Vector3(axis.x, axis.y, axis.z).normalize(),
    new THREE.Vector3(pivot.x, pivot.y, pivot.z),
    0.8,
    0x66dfff,
    0.16,
    0.08,
  ));

  const proxy = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.18, 0.18),
    new THREE.MeshBasicMaterial({ color: 0xffd767, wireframe: true }),
  );
  proxy.position.set(pivot.x, pivot.y, pivot.z + 0.35);
  scene.add(proxy);

  const transform = new TransformControls(camera, canvas);
  transform.setMode("translate");
  transform.setSize(0.7);
  transform.setTranslationSnap(0.05);
  transform.attach(proxy);
  scene.add(transform.getHelper());
  transform.addEventListener("dragging-changed", (event) => {
    orbit.enabled = !event.value;
  });
  transform.addEventListener("objectChange", () => {
    onPreview({ x: proxy.position.x, y: proxy.position.y, z: proxy.position.z });
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function pickAt(pageX, pageY) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((pageX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((pageY - rect.top) / rect.height) * 2 - 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(cells, false)[0];
    if (!hit || hit.instanceId == null || !hit.face) return null;
    const p = grid.positions[hit.instanceId];
    return {
      instanceIndex: hit.instanceId,
      cellId: p.id,
      face: faceFromNormal(hit.face.normal),
      point: { x: hit.point.x, y: hit.point.y, z: hit.point.z },
    };
  }

  canvas.addEventListener("click", (event) => {
    const picked = pickAt(event.clientX, event.clientY);
    if (picked) onSelection(picked);
  });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);
  resize();
  renderer.render(scene, camera);

  function targetScreen() {
    const target = grid.target;
    const projected = new THREE.Vector3(target.x, target.y, target.z + 0.014).project(camera);
    const rect = canvas.getBoundingClientRect();
    return {
      x: rect.left + (projected.x + 1) * 0.5 * rect.width,
      y: rect.top + (1 - (projected.y + 1) * 0.5) * rect.height,
    };
  }

  let disposed = false;
  let frameCount = 0;
  function frame() {
    if (disposed) return;
    frameCount += 1;
    const runtimeFrame = harness.step(1);
    for (const body of runtimeFrame.bodies) {
      const mesh = bodyMeshes.get(body.planBodyId);
      if (!mesh) continue;
      mesh.position.set(body.position.x, body.position.y, body.position.z);
      mesh.quaternion.set(body.rotation.x, body.rotation.y, body.rotation.z, body.rotation.w);
    }
    orbit.update();
    renderer.render(scene, camera);
    window.__P05B.rendererFrames = frameCount;
    window.__P05B.runtimeSpeedRadps = runtimeFrame.relativeAngularSpeedRadps;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  const ready = {
    targetCellId: grid.target.id,
    targetScreen: targetScreen(),
    sourceSnapshot,
    sourceUntouched: () => JSON.stringify(harness.source) === sourceSnapshot,
  };
  onReady(ready);

  return {
    nudgePreview() {
      proxy.position.x += 0.1;
      transform.dispatchEvent({ type: "objectChange" });
      return { x: proxy.position.x, y: proxy.position.y, z: proxy.position.z };
    },
    sourceUntouched: ready.sourceUntouched,
    dispose() {
      disposed = true;
      transform.detach();
      transform.dispose();
      orbit.dispose();
      renderer.dispose();
      harness.dispose();
    },
  };
}
