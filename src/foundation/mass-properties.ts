import type { Vec3 } from "./spatial.js";

const EPSILON = 1e-12;

export interface MassElement {
  readonly id: string;
  readonly massKg: number;
  readonly center: Vec3;
  readonly halfExtents: Vec3;
}

export interface MassProperties {
  readonly massKg: number;
  readonly centerOfMass: Vec3;
  /**
   * Principal-axis diagonal only for the current axis-aligned box element model.
   * This is not a general inertia tensor contract for future arbitrary geometry.
   */
  readonly inertiaDiagonalKgM2: Vec3;
}

interface KahanAccumulator {
  sum: number;
  compensation: number;
}

function kahanAdd(accumulator: KahanAccumulator, value: number): void {
  const corrected = value - accumulator.compensation;
  const next = accumulator.sum + corrected;
  accumulator.compensation = (next - accumulator.sum) - corrected;
  accumulator.sum = next;
}

function requireFinite(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite`);
  return value;
}

function validateVector(value: Vec3, label: string, positive = false): void {
  for (const [axis, component] of [
    ["x", value.x],
    ["y", value.y],
    ["z", value.z],
  ] as const) {
    requireFinite(component, `${label}.${axis}`);
    if (positive && !(component > 0)) throw new RangeError(`${label}.${axis} must be > 0`);
  }
}

export function boxInertiaDiagonalKgM2(massKg: number, halfExtents: Vec3): Vec3 {
  requireFinite(massKg, "massKg");
  if (massKg < 0) throw new RangeError("massKg cannot be negative");
  validateVector(halfExtents, "halfExtents", true);
  const { x: hx, y: hy, z: hz } = halfExtents;
  return {
    x: (massKg * (hy * hy + hz * hz)) / 3,
    y: (massKg * (hx * hx + hz * hz)) / 3,
    z: (massKg * (hx * hx + hy * hy)) / 3,
  };
}

/**
 * Deterministic aggregate mass properties for axis-aligned box elements.
 * Elements are canonicalized by stable ID before compensated summation so
 * authored array order cannot change the result.
 */
export function computeMassProperties(rawElements: readonly MassElement[]): MassProperties {
  const elements = [...rawElements].sort((a, b) => a.id.localeCompare(b.id));
  const seenIds = new Set<string>();
  for (const element of elements) {
    if (seenIds.has(element.id)) throw new Error(`duplicate mass element id: ${element.id}`);
    seenIds.add(element.id);
    requireFinite(element.massKg, `mass element ${element.id}.massKg`);
    if (element.massKg < 0) throw new RangeError(`mass element ${element.id}.massKg cannot be negative`);
    validateVector(element.center, `mass element ${element.id}.center`);
    validateVector(element.halfExtents, `mass element ${element.id}.halfExtents`, true);
  }

  const positive = elements.filter((element) => element.massKg > 0);
  if (positive.length === 0) throw new Error("mass properties require positive mass");

  const mass = { sum: 0, compensation: 0 };
  const weighted = {
    x: { sum: 0, compensation: 0 },
    y: { sum: 0, compensation: 0 },
    z: { sum: 0, compensation: 0 },
  };

  for (const element of positive) {
    kahanAdd(mass, element.massKg);
    kahanAdd(weighted.x, element.center.x * element.massKg);
    kahanAdd(weighted.y, element.center.y * element.massKg);
    kahanAdd(weighted.z, element.center.z * element.massKg);
  }

  if (!(mass.sum > EPSILON)) throw new Error("aggregate mass is not positive");
  const centerOfMass: Vec3 = {
    x: weighted.x.sum / mass.sum,
    y: weighted.y.sum / mass.sum,
    z: weighted.z.sum / mass.sum,
  };

  const inertia = {
    x: { sum: 0, compensation: 0 },
    y: { sum: 0, compensation: 0 },
    z: { sum: 0, compensation: 0 },
  };

  for (const element of positive) {
    const local = boxInertiaDiagonalKgM2(element.massKg, element.halfExtents);
    const dx = element.center.x - centerOfMass.x;
    const dy = element.center.y - centerOfMass.y;
    const dz = element.center.z - centerOfMass.z;
    kahanAdd(inertia.x, local.x + element.massKg * (dy * dy + dz * dz));
    kahanAdd(inertia.y, local.y + element.massKg * (dx * dx + dz * dz));
    kahanAdd(inertia.z, local.z + element.massKg * (dx * dx + dy * dy));
  }

  return {
    massKg: mass.sum,
    centerOfMass,
    inertiaDiagonalKgM2: {
      x: inertia.x.sum,
      y: inertia.y.sum,
      z: inertia.z.sum,
    },
  };
}
