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
import { computeMassProperties } from "./foundation/mass-properties.js";

const NEIGHBORS: readonly GridPosition[] = [
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
];

/**
 * Experimental compile-time seam used by ANVIL-01 / CUT.
 *
 * A blocked pair only suppresses one otherwise implicit face-adjacency rigid
 * connection. It is deliberately not persisted as a generic Bond/Joint model
 * and should not be promoted beyond the current cell dialect without evidence.
 */
export type BlockedFaceConnection = readonly [string, string];

export interface CompileMatterOptions {
  readonly blockedFaceConnections?: readonly BlockedFaceConnection[];
}

function coordKey(position: GridPosition): string {
  return `${position.x},${position.y},${position.z}`;
}

function connectionKey(aId: string, bId: string): string {
  return aId.localeCompare(bId) <= 0 ? `${aId}\u0000${bId}` : `${bId}\u0000${aId}`;
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

function blockedConnectionsFor(
  cells: readonly MatterCell[],
  connections: readonly BlockedFaceConnection[],
): ReadonlySet<string> {
  if (connections.length === 0) return new Set<string>();

  const byId = new Map(cells.map((cell) => [cell.id, cell] as const));
  const blocked = new Set<string>();
  for (const connection of connections) {
    const [aId, bId] = connection;
    if (aId === bId) throw new Error(`blocked face connection cannot reference one cell twice: ${aId}`);
    const a = byId.get(aId);
    const b = byId.get(bId);
    if (a === undefined || b === undefined) {
      throw new Error(`blocked face connection references unknown cell: ${aId} <-> ${bId}`);
    }
    const manhattanDistance =
      Math.abs(a.grid.x - b.grid.x) +
      Math.abs(a.grid.y - b.grid.y) +
      Math.abs(a.grid.z - b.grid.z);
    if (manhattanDistance !== 1) {
      throw new Error(`blocked connection is not face-adjacent: ${aId} <-> ${bId}`);
    }
    const key = connectionKey(aId, bId);
    if (blocked.has(key)) throw new Error(`duplicate blocked face connection: ${aId} <-> ${bId}`);
    blocked.add(key);
  }
  return blocked;
}

function findRigidComponents(
  cells: readonly MatterCell[],
  blockedConnections: ReadonlySet<string>,
): MatterCell[][] {
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
        if (neighbor === undefined) continue;
        if (blockedConnections.has(connectionKey(current.id, neighbor.id))) continue;
        if (unvisited.delete(neighbor.id)) queue.push(neighbor);
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
  const cellVolumeM3 = cellSizeM ** 3;
  const halfExtentM = cellSizeM / 2;
  const massProperties = computeMassProperties(
    component.map((cell) => {
      const material = materials.get(cell.materialId);
      if (material === undefined) throw new Error(`missing material ${cell.materialId}`);
      return {
        id: cell.id,
        massKg: cellVolumeM3 * material.densityKgM3,
        center: cellCenter(cell, cellSizeM),
        halfExtents: { x: halfExtentM, y: halfExtentM, z: halfExtentM },
      };
    }),
  );

  const sourceCellIds = component.map((cell) => cell.id).sort();
  return {
    id: `body:${sourceCellIds[0] ?? "empty"}`,
    sourceCellIds,
    massKg: massProperties.massKg,
    centerOfMassWorld: massProperties.centerOfMass,
    inertiaDiagonalKgM2: massProperties.inertiaDiagonalKgM2,
    colliders: compactComponent(component, cellSizeM),
  };
}

export function compileMatter(
  document: MatterDocument,
  options: CompileMatterOptions = {},
): PhysicalPlan {
  const materials = validateDocument(document);
  const blockedConnections = blockedConnectionsFor(
    document.cells,
    options.blockedFaceConnections ?? [],
  );
  const components = findRigidComponents(document.cells, blockedConnections);
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
