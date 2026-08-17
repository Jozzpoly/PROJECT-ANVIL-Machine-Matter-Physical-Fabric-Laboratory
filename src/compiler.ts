import type {
  ColliderBoxPlan,
  GridPosition,
  MaterialDefinition,
  MatterCell,
  MatterDocument,
  PhysicalPlan,
  RigidBodyPlan,
  Vec3,
} from "./model.js";

const NEIGHBORS: readonly GridPosition[] = [
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
];

function coordKey(position: GridPosition): string {
  return `${position.x},${position.y},${position.z}`;
}

function compareCells(a: MatterCell, b: MatterCell): number {
  return (
    a.grid.y - b.grid.y ||
    a.grid.z - b.grid.z ||
    a.grid.x - b.grid.x ||
    a.id.localeCompare(b.id)
  );
}

function add(a: GridPosition, b: GridPosition): GridPosition {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function cellCenter(cell: MatterCell, cellSizeM: number): Vec3 {
  return {
    x: (cell.grid.x + 0.5) * cellSizeM,
    y: (cell.grid.y + 0.5) * cellSizeM,
    z: (cell.grid.z + 0.5) * cellSizeM,
  };
}

function validateDocument(document: MatterDocument): Map<string, MaterialDefinition> {
  if (!Number.isFinite(document.cellSizeM) || document.cellSizeM <= 0) {
    throw new Error("cellSizeM must be finite and positive");
  }

  const materials = new Map<string, MaterialDefinition>();
  for (const material of document.materials) {
    if (materials.has(material.id)) {
      throw new Error(`duplicate material id: ${material.id}`);
    }
    if (!Number.isFinite(material.densityKgM3) || material.densityKgM3 <= 0) {
      throw new Error(`invalid density for material ${material.id}`);
    }
    materials.set(material.id, material);
  }

  const ids = new Set<string>();
  const coordinates = new Set<string>();
  for (const cell of document.cells) {
    if (ids.has(cell.id)) {
      throw new Error(`duplicate cell id: ${cell.id}`);
    }
    ids.add(cell.id);
    const key = coordKey(cell.grid);
    if (coordinates.has(key)) {
      throw new Error(`two authored cells occupy ${key}`);
    }
    coordinates.add(key);
    if (!materials.has(cell.materialId)) {
      throw new Error(`cell ${cell.id} references unknown material ${cell.materialId}`);
    }
  }
  return materials;
}

function findRigidComponents(cells: readonly MatterCell[]): MatterCell[][] {
  const byCoord = new Map(cells.map((cell) => [coordKey(cell.grid), cell] as const));
  const unvisited = new Set(cells.map((cell) => cell.id));
  const ordered = [...cells].sort(compareCells);
  const components: MatterCell[][] = [];

  for (const seed of ordered) {
    if (!unvisited.has(seed.id)) continue;
    const component: MatterCell[] = [];
    const queue: MatterCell[] = [seed];
    unvisited.delete(seed.id);

    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const current = queue[cursor];
      if (current === undefined) continue;
      component.push(current);
      for (const offset of NEIGHBORS) {
        const neighbor = byCoord.get(coordKey(add(current.grid, offset)));
        if (neighbor !== undefined && unvisited.delete(neighbor.id)) {
          queue.push(neighbor);
        }
      }
    }
    component.sort(compareCells);
    components.push(component);
  }

  components.sort((a, b) => {
    const left = a[0]?.id ?? "";
    const right = b[0]?.id ?? "";
    return left.localeCompare(right);
  });
  return components;
}

function allAvailable(
  byCoord: ReadonlyMap<string, MatterCell>,
  remaining: ReadonlySet<string>,
  materialId: string,
  min: GridPosition,
  size: GridPosition,
): boolean {
  for (let y = min.y; y < min.y + size.y; y += 1) {
    for (let z = min.z; z < min.z + size.z; z += 1) {
      for (let x = min.x; x < min.x + size.x; x += 1) {
        const cell = byCoord.get(coordKey({ x, y, z }));
        if (cell === undefined || cell.materialId !== materialId || !remaining.has(cell.id)) {
          return false;
        }
      }
    }
  }
  return true;
}

function consumeBox(
  byCoord: ReadonlyMap<string, MatterCell>,
  remaining: Set<string>,
  min: GridPosition,
  size: GridPosition,
): string[] {
  const ids: string[] = [];
  for (let y = min.y; y < min.y + size.y; y += 1) {
    for (let z = min.z; z < min.z + size.z; z += 1) {
      for (let x = min.x; x < min.x + size.x; x += 1) {
        const cell = byCoord.get(coordKey({ x, y, z }));
        if (cell === undefined || !remaining.delete(cell.id)) {
          throw new Error("internal collider compaction overlap");
        }
        ids.push(cell.id);
      }
    }
  }
  ids.sort();
  return ids;
}

/**
 * Exact, deterministic cuboid compaction. It changes collision resolution but
 * not occupied volume. Different materials are never merged into one collider
 * because density and surface properties belong to the collider lowering.
 */
function compactComponent(
  component: readonly MatterCell[],
  cellSizeM: number,
): ColliderBoxPlan[] {
  const byCoord = new Map(component.map((cell) => [coordKey(cell.grid), cell] as const));
  const remaining = new Set(component.map((cell) => cell.id));
  const colliders: ColliderBoxPlan[] = [];

  for (const seed of [...component].sort(compareCells)) {
    if (!remaining.has(seed.id)) continue;
    const min = seed.grid;
    const materialId = seed.materialId;
    const size = { x: 1, y: 1, z: 1 };

    while (
      allAvailable(byCoord, remaining, materialId, min, {
        x: size.x + 1,
        y: size.y,
        z: size.z,
      })
    ) {
      size.x += 1;
    }
    while (
      allAvailable(byCoord, remaining, materialId, min, {
        x: size.x,
        y: size.y,
        z: size.z + 1,
      })
    ) {
      size.z += 1;
    }
    while (
      allAvailable(byCoord, remaining, materialId, min, {
        x: size.x,
        y: size.y + 1,
        z: size.z,
      })
    ) {
      size.y += 1;
    }

    const sourceCellIds = consumeBox(byCoord, remaining, min, size);
    colliders.push({
      id: `collider:${sourceCellIds[0] ?? "empty"}`,
      materialId,
      sourceCellIds,
      minGrid: { ...min },
      sizeCells: { ...size },
      centerWorld: {
        x: (min.x + size.x / 2) * cellSizeM,
        y: (min.y + size.y / 2) * cellSizeM,
        z: (min.z + size.z / 2) * cellSizeM,
      },
      halfExtentsM: {
        x: (size.x * cellSizeM) / 2,
        y: (size.y * cellSizeM) / 2,
        z: (size.z * cellSizeM) / 2,
      },
    });
  }
  return colliders;
}

function compileBody(
  component: readonly MatterCell[],
  materials: ReadonlyMap<string, MaterialDefinition>,
  cellSizeM: number,
): RigidBodyPlan {
  const volume = cellSizeM ** 3;
  let massKg = 0;
  const weighted = { x: 0, y: 0, z: 0 };

  for (const cell of component) {
    const material = materials.get(cell.materialId);
    if (material === undefined) throw new Error(`missing material ${cell.materialId}`);
    const mass = volume * material.densityKgM3;
    const center = cellCenter(cell, cellSizeM);
    massKg += mass;
    weighted.x += center.x * mass;
    weighted.y += center.y * mass;
    weighted.z += center.z * mass;
  }

  if (!(massKg > 0)) throw new Error("rigid component has no positive mass");
  const sourceCellIds = component.map((cell) => cell.id).sort();
  return {
    id: `body:${sourceCellIds[0] ?? "empty"}`,
    sourceCellIds,
    massKg,
    centerOfMassWorld: {
      x: weighted.x / massKg,
      y: weighted.y / massKg,
      z: weighted.z / massKg,
    },
    colliders: compactComponent(component, cellSizeM),
  };
}

export function compileMatter(document: MatterDocument): PhysicalPlan {
  const materials = validateDocument(document);
  const components = findRigidComponents(document.cells);
  const bodies = components.map((component) =>
    compileBody(component, materials, document.cellSizeM),
  );
  const cellToBody: Record<string, string> = {};
  let collisionBoxes = 0;
  for (const body of bodies) {
    collisionBoxes += body.colliders.length;
    for (const cellId of body.sourceCellIds) cellToBody[cellId] = body.id;
  }

  return {
    schema: "anvil-physical-plan/0",
    sourceRevision: document.revision,
    bodies,
    cellToBody,
    statistics: {
      authoredCells: document.cells.length,
      rigidBodies: bodies.length,
      collisionBoxes,
      reductionRatio: document.cells.length / Math.max(1, collisionBoxes),
    },
  };
}
