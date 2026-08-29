import test from "node:test";
import assert from "node:assert/strict";
import { FreedomRuntimeSession } from "../.test-build/src/studio-recovery/runtime.js";
import { createFreedomStarterSource } from "../.test-build/src/studio-recovery/source.js";

const GROUND_TOP_Y_M = -0.26;

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
