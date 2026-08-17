import type { MatterCell, MatterDocument } from "./model.js";

function idFor(x: number, y: number, z: number): string {
  return `cell:${x}:${y}:${z}`;
}

export function createCollapseFixture(cutBridge = false): MatterDocument {
  const cells: MatterCell[] = [];

  const pushCell = (x: number, y: number, z: number): void => {
    const denseCore = x === -4 && y === 1 && z === 0;
    cells.push({
      id: idFor(x, y, z),
      grid: { x, y, z },
      materialId: denseCore ? "dense-core" : "structural",
    });
  };

  // Two rigid lobes. Their authored resolution is intentionally much higher
  // than the physical body/collider resolution we want at runtime.
  for (const x of [-5, -4, -3, -2, 2, 3, 4, 5]) {
    for (let y = 0; y < 2; y += 1) {
      for (let z = -1; z <= 1; z += 1) pushCell(x, y, z);
    }
  }

  // A one-cell-thick authored bridge. Removing only its center changes the
  // structural topology from one connected component to two.
  for (const x of [-1, 0, 1]) {
    if (cutBridge && x === 0) continue;
    pushCell(x, 0, 0);
  }

  return {
    schema: "anvil-matter/0",
    revision: cutBridge ? "collapse-fixture/cut" : "collapse-fixture/intact",
    cellSizeM: 0.35,
    materials: [
      {
        id: "structural",
        densityKgM3: 650,
        friction: 0.65,
        displayColor: "#8bd5ff",
      },
      {
        id: "dense-core",
        densityKgM3: 2500,
        friction: 0.65,
        displayColor: "#ffb86b",
      },
    ],
    cells,
  };
}
