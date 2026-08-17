import type { PhysicalPlan } from "../model.js";

export interface CompiledEntityProvenance {
  readonly id: string;
  readonly sourceIds: readonly string[];
}

export type LineageKind =
  | "continued"
  | "split"
  | "merge"
  | "repartitioned"
  | "appeared"
  | "disappeared";

export interface LineageComponent {
  readonly kind: LineageKind;
  readonly beforeEntityIds: readonly string[];
  readonly afterEntityIds: readonly string[];
  readonly sharedSourceIds: readonly string[];
}

export interface ProvenanceDelta {
  readonly components: readonly LineageComponent[];
  readonly addedSourceIds: readonly string[];
  readonly removedSourceIds: readonly string[];
}

interface NormalizedProvenance {
  readonly entities: readonly CompiledEntityProvenance[];
  readonly entityById: ReadonlyMap<string, CompiledEntityProvenance>;
  readonly sourceToEntityId: ReadonlyMap<string, string>;
}

function normalizeProvenance(raw: readonly CompiledEntityProvenance[]): NormalizedProvenance {
  const entityById = new Map<string, CompiledEntityProvenance>();
  const sourceToEntityId = new Map<string, string>();
  const entities: CompiledEntityProvenance[] = [];

  for (const rawEntity of [...raw].sort((a, b) => a.id.localeCompare(b.id))) {
    if (entityById.has(rawEntity.id)) throw new Error(`duplicate compiled entity id: ${rawEntity.id}`);
    const sourceIds = [...rawEntity.sourceIds].sort();
    for (let index = 1; index < sourceIds.length; index += 1) {
      if (sourceIds[index] === sourceIds[index - 1]) {
        throw new Error(`duplicate source id ${sourceIds[index]} inside ${rawEntity.id}`);
      }
    }
    const entity: CompiledEntityProvenance = { id: rawEntity.id, sourceIds };
    entityById.set(entity.id, entity);
    entities.push(entity);
    for (const sourceId of sourceIds) {
      const previous = sourceToEntityId.get(sourceId);
      if (previous !== undefined) {
        throw new Error(`source id ${sourceId} belongs to both ${previous} and ${entity.id}`);
      }
      sourceToEntityId.set(sourceId, entity.id);
    }
  }

  return { entities, entityById, sourceToEntityId };
}

export function bodyProvenanceFromPhysicalPlan(plan: PhysicalPlan): readonly CompiledEntityProvenance[] {
  return plan.bodies.map((body) => ({ id: body.id, sourceIds: body.sourceCellIds }));
}

export function colliderProvenanceFromPhysicalPlan(plan: PhysicalPlan): readonly CompiledEntityProvenance[] {
  return plan.bodies.flatMap((body) =>
    body.colliders.map((collider) => ({ id: collider.id, sourceIds: collider.sourceCellIds })),
  );
}

function classify(beforeCount: number, afterCount: number): LineageKind {
  if (beforeCount === 0) return "appeared";
  if (afterCount === 0) return "disappeared";
  if (beforeCount === 1 && afterCount === 1) return "continued";
  if (beforeCount === 1) return "split";
  if (afterCount === 1) return "merge";
  return "repartitioned";
}

/**
 * Compare two disposable compiled representations only through persistent source
 * provenance. Runtime/body IDs are allowed to change completely.
 *
 * The result is descriptive evidence: split/merge/continuation classification
 * does not prescribe how physical state should migrate between the entities.
 */
export function analyzeProvenanceLineage(
  beforeRaw: readonly CompiledEntityProvenance[],
  afterRaw: readonly CompiledEntityProvenance[],
): ProvenanceDelta {
  const before = normalizeProvenance(beforeRaw);
  const after = normalizeProvenance(afterRaw);
  const beforeSources = new Set(before.sourceToEntityId.keys());
  const afterSources = new Set(after.sourceToEntityId.keys());
  const removedSourceIds = [...beforeSources].filter((id) => !afterSources.has(id)).sort();
  const addedSourceIds = [...afterSources].filter((id) => !beforeSources.has(id)).sort();

  const adjacency = new Map<string, Set<string>>();
  const sharedPairs = new Map<string, readonly [string, string]>();
  const ensureNode = (key: string): Set<string> => {
    const existing = adjacency.get(key);
    if (existing !== undefined) return existing;
    const created = new Set<string>();
    adjacency.set(key, created);
    return created;
  };

  for (const sourceId of [...beforeSources].sort()) {
    const beforeId = before.sourceToEntityId.get(sourceId);
    const afterId = after.sourceToEntityId.get(sourceId);
    if (beforeId === undefined || afterId === undefined) continue;
    const beforeKey = `before:${beforeId}`;
    const afterKey = `after:${afterId}`;
    ensureNode(beforeKey).add(afterKey);
    ensureNode(afterKey).add(beforeKey);
    sharedPairs.set(sourceId, [beforeId, afterId]);
  }

  const components: LineageComponent[] = [];
  const visited = new Set<string>();
  for (const seed of [...adjacency.keys()].sort()) {
    if (visited.has(seed)) continue;
    const queue = [seed];
    visited.add(seed);
    const beforeIds = new Set<string>();
    const afterIds = new Set<string>();

    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const current = queue[cursor];
      if (current === undefined) continue;
      if (current.startsWith("before:")) beforeIds.add(current.slice("before:".length));
      if (current.startsWith("after:")) afterIds.add(current.slice("after:".length));
      for (const neighbor of adjacency.get(current) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    const sortedBefore = [...beforeIds].sort();
    const sortedAfter = [...afterIds].sort();
    const sharedSourceIds = [...sharedPairs.entries()]
      .filter(([, pair]) => beforeIds.has(pair[0]) && afterIds.has(pair[1]))
      .map(([sourceId]) => sourceId)
      .sort();
    components.push({
      kind: classify(sortedBefore.length, sortedAfter.length),
      beforeEntityIds: sortedBefore,
      afterEntityIds: sortedAfter,
      sharedSourceIds,
    });
  }

  const linkedBefore = new Set(components.flatMap((component) => component.beforeEntityIds));
  const linkedAfter = new Set(components.flatMap((component) => component.afterEntityIds));
  for (const entity of before.entities) {
    if (!linkedBefore.has(entity.id)) {
      components.push({
        kind: "disappeared",
        beforeEntityIds: [entity.id],
        afterEntityIds: [],
        sharedSourceIds: [],
      });
    }
  }
  for (const entity of after.entities) {
    if (!linkedAfter.has(entity.id)) {
      components.push({
        kind: "appeared",
        beforeEntityIds: [],
        afterEntityIds: [entity.id],
        sharedSourceIds: [],
      });
    }
  }

  components.sort((a, b) => {
    const aKey = `${a.beforeEntityIds.join(",")}|${a.afterEntityIds.join(",")}|${a.kind}`;
    const bKey = `${b.beforeEntityIds.join(",")}|${b.afterEntityIds.join(",")}|${b.kind}`;
    return aKey.localeCompare(bKey);
  });

  return { components, addedSourceIds, removedSourceIds };
}
