import test from "node:test";
import assert from "node:assert/strict";
import { FreedomRuntimeSession } from "../.test-build/src/studio-recovery/runtime.js";
import { FreedomWorkspace, createFreedomStarterSource } from "../.test-build/src/studio-recovery/source.js";

const GROUND_TOP_Y_M = -0.26;
const GROUNDED_TORQUE_PROBE_NM = 1000;

function elevatedStarter(rows = 4) {
  const source = createFreedomStarterSource();
  return {
    ...source,
    matter: {
      ...source.matter,
      cells: source.matter.cells.map((cell) => ({
        ...cell,
        grid: { ...cell.grid, y: cell.grid.y + rows },
      })),
    },
  };
}

function createGroundedTorqueMechanism() {
  const workspace = new FreedomWorkspace(createFreedomStarterSource());
  const bearing = workspace.addBearing(
    { cellId: "starter:a", face: "x+" },
    { cellId: "starter:b", face: "x-" },
    "z",
  );
  workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, GROUNDED_TORQUE_PROBE_NM);
  return { source: workspace.snapshot().source, bearing };
}

test("Freedom runtime falls under gravity and settles on the physical ground", async () => {
  const source = elevatedStarter();
  const runtime = await FreedomRuntimeSession.create(source, 17);

  try {
    assert.equal(runtime.receipt.bodyCount, 1, "runtime receipt must count authored/realized bodies, not environment bodies");
    assert.equal(runtime.receipt.jointCount, 0);

    const before = runtime.snapshots()[0];
    assert.ok(before);

    runtime.step(30);
    const falling = runtime.snapshots()[0];
    assert.ok(falling);
    assert.ok(
      falling.position.y < before.position.y - 0.15,
      `gravity did not materially lower the body: ${before.position.y} -> ${falling.position.y}`,
    );

    runtime.step(240);
    const settled = runtime.snapshots()[0];
    assert.ok(settled);
    const expectedRestCenterY = GROUND_TOP_Y_M + source.matter.cellSizeM / 2;
    assert.ok(
      Math.abs(settled.position.y - expectedRestCenterY) < 0.08,
      `body did not settle on ground near ${expectedRestCenterY}; got ${settled.position.y}`,
    );
    assert.ok(
      Math.abs(settled.linearVelocity.y) < 0.2,
      `body still has excessive vertical speed after settling: ${settled.linearVelocity.y}`,
    );
  } finally {
    runtime.dispose();
  }
});

test("grounded product keeps explicitly authored Torque physically actionable at the current Matter mass scale", async () => {
  const { source, bearing } = createGroundedTorqueMechanism();
  const runtime = await FreedomRuntimeSession.create(source, 0);

  try {
    runtime.step(90);
    runtime.setForcesEnabled(true);
    runtime.step(120);
    const speed = Math.abs(runtime.relativeAngularSpeedRadps(bearing));
    assert.ok(
      speed > 0.05,
      `${GROUNDED_TORQUE_PROBE_NM} Nm Torque is effectively pinned by the grounded environment: ${speed} rad/s`,
    );
  } finally {
    runtime.dispose();
  }
});

test("grounded Runtime Hand can drag a settled mechanism across the ground", async () => {
  const source = createFreedomStarterSource();
  const runtime = await FreedomRuntimeSession.create(source, 0);

  try {
    runtime.step(90);
    const body = runtime.snapshots()[0];
    assert.ok(body);
    const initial = { ...body.position };
    runtime.beginHandGrab(body.planBodyId, initial);
    runtime.updateHandTarget({ x: initial.x + 0.2, y: initial.y, z: initial.z });
    runtime.step(60);
    const moved = runtime.handAnchorWorld();
    assert.ok(moved);
    assert.ok(
      moved.x - initial.x > 0.03,
      `Runtime Hand is effectively pinned by the grounded environment: moved ${moved.x - initial.x} m toward a 0.2 m target`,
    );
  } finally {
    runtime.dispose();
  }
});
