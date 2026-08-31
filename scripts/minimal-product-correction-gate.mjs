import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import Box3DFactory from "box3d.js/inline";
import { jointFrameForAxis } from "../.test-build/src/experiments/anvil-02-bearing.js";
import { realizeFreedomSource } from "../.test-build/src/studio-recovery/realize.js";
import { FreedomRuntimeSession } from "../.test-build/src/studio-recovery/runtime.js";
import { FreedomWorkspace, createFreedomStarterSource } from "../.test-build/src/studio-recovery/source.js";

const ZERO = Object.freeze({ x: 0, y: 0, z: 0 });
const GRAVITY = Object.freeze({ x: 0, y: -10, z: 0 });
const FIXED_DT_S = 1 / 60;
const PRODUCT_SUBSTEPS = 4;
const CANDIDATE_SUBSTEPS = Object.freeze([4, 8, 16, 24, 32, 48, 64]);
const ANCHOR_LIMIT_M = 0.003;
const GROUND_TOP_Y_M = -0.26;
const GROUND_HALF_HEIGHT_M = 0.5;
const GROUND_HALF_EXTENT_M = 10;
const GROUND_FRICTION = 0.8;

function add(a, b) { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
function subtract(a, b) { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
function scale(v, s) { return { x: v.x * s, y: v.y * s, z: v.z * s }; }
function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
function cross(a, b) { return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }; }
function magnitude(v) { return Math.hypot(v.x, v.y, v.z); }
function rotate(q, v) {
  const qv = { x: q.x, y: q.y, z: q.z };
  const t = cross(qv, v);
  const doubled = scale(t, 2);
  return add(v, add(scale(doubled, q.w), cross(qv, doubled)));
}
function runtimeQuat(q) { return { x: q.v.x, y: q.v.y, z: q.v.z, w: q.s }; }
function toB3Quat(q) { return { v: { x: q.x, y: q.y, z: q.z }, s: q.w }; }
function maxRecord(record) { return Math.max(0, ...Object.values(record)); }

function hullPoints(body, collider) {
  const center = subtract(collider.centerWorld, body.centerOfMassWorld);
  const h = collider.halfExtentsM;
  const out = [];
  for (const dx of [-1, 1]) for (const dy of [-1, 1]) for (const dz of [-1, 1]) {
    out.push(center.x + dx * h.x, center.y + dy * h.y, center.z + dz * h.z);
  }
  return out;
}

function singleSource(effortNm, freeAxis = "y") {
  const workspace = new FreedomWorkspace(createFreedomStarterSource());
  const bearing = workspace.addBearing(
    { cellId: "starter:a", face: "x+" },
    { cellId: "starter:b", face: "x-" },
    freeAxis,
  );
  workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, effortNm);
  return { source: workspace.snapshot().source, bearingIds: [bearing] };
}

function chainSource(effortNm) {
  const workspace = new FreedomWorkspace(createFreedomStarterSource());
  const added = workspace.extrudeMatterFromFace("starter:c", "x+", 4);
  assert.equal(added.length, 4, "chain fixture extrusion failed");
  const cells = ["starter:a", "starter:b", "starter:c", ...added];
  const bearingIds = [];
  for (let i = 0; i < cells.length - 1; i += 1) {
    const left = cells[i];
    const right = cells[i + 1];
    assert.ok(left && right);
    const bearing = workspace.addBearing(
      { cellId: left, face: "x+" },
      { cellId: right, face: "x-" },
      "y",
    );
    bearingIds.push(bearing);
    if (i % 2 === 0) workspace.addTorquePatch({ cellId: left, face: "x+" }, i % 4 === 0 ? effortNm : -effortNm);
  }
  return { source: workspace.snapshot().source, bearingIds };
}

const FIXTURES = Object.freeze([
  { id: "neutral-y-100", grounded: false, settleS: 0, driveS: 3, ...singleSource(100, "y") },
  { id: "grounded-y-500", grounded: true, settleS: 4, driveS: 3, ...singleSource(500, "y") },
  { id: "grounded-z-1000-prior", grounded: true, settleS: 1.5, driveS: 2, ...singleSource(1000, "z") },
  { id: "neutral-chain-7b-6j", grounded: false, settleS: 0, driveS: 3, ...chainSource(80) },
]);

async function runProductBaseline(fixture) {
  const runtime = await FreedomRuntimeSession.create(fixture.source, 1, { grounded: fixture.grounded });
  try {
    if (fixture.settleS > 0) runtime.step(Math.round(fixture.settleS / FIXED_DT_S));
    runtime.setForcesEnabled(true);
    const driveSteps = Math.round(fixture.driveS / FIXED_DT_S);
    let maxAnchorErrorM = maxRecord(runtime.anchorErrorsM());
    let peakAbsRelativeSpeedRadps = 0;
    const started = performance.now();
    for (let i = 0; i < driveSteps; i += 1) {
      runtime.step(1);
      maxAnchorErrorM = Math.max(maxAnchorErrorM, maxRecord(runtime.anchorErrorsM()));
      for (const bearingId of fixture.bearingIds) {
        peakAbsRelativeSpeedRadps = Math.max(peakAbsRelativeSpeedRadps, Math.abs(runtime.relativeAngularSpeedRadps(bearingId)));
      }
    }
    const wallMs = performance.now() - started;
    return {
      fixture: fixture.id,
      path: "product-runtime",
      substeps: PRODUCT_SUBSTEPS,
      maxAnchorErrorM,
      peakAbsRelativeSpeedRadps,
      wallMs,
      msPerSimulatedSecond: wallMs / fixture.driveS,
      integrityPass: maxAnchorErrorM < ANCHOR_LIMIT_M,
    };
  } finally {
    runtime.dispose();
  }
}

function anchorErrorM(b3, bodyIds, relation) {
  const bodyA = bodyIds.get(relation.bodyAId);
  const bodyB = bodyIds.get(relation.bodyBId);
  assert.ok(bodyA && bodyB);
  const pa = b3.b3Body_GetPosition(bodyA);
  const pb = b3.b3Body_GetPosition(bodyB);
  const qa = runtimeQuat(b3.b3Body_GetRotation(bodyA));
  const qb = runtimeQuat(b3.b3Body_GetRotation(bodyB));
  const wa = add(pa, rotate(qa, relation.localAnchorA));
  const wb = add(pb, rotate(qb, relation.localAnchorB));
  return magnitude(subtract(wa, wb));
}

function relativeSpeed(b3, bodyIds, relation) {
  const bodyA = bodyIds.get(relation.bodyAId);
  const bodyB = bodyIds.get(relation.bodyBId);
  assert.ok(bodyA && bodyB);
  return dot(subtract(b3.b3Body_GetAngularVelocity(bodyB), b3.b3Body_GetAngularVelocity(bodyA)), relation.axisWorld);
}

async function runCandidate(b3, fixture, substeps) {
  const plan = realizeFreedomSource(fixture.source);
  assert.equal(plan.quality, "COMPLETE", `${fixture.id}: realization not COMPLETE`);
  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { ...(fixture.grounded ? GRAVITY : ZERO) };
  worldDef.workerCount = 0;
  const worldId = b3.b3CreateWorld(worldDef);
  const bodyIds = new Map();
  const materialById = new Map(fixture.source.matter.materials.map((m) => [m.id, m]));
  try {
    if (fixture.grounded) {
      const groundDef = b3.b3DefaultBodyDef();
      groundDef.position = { x: 0, y: GROUND_TOP_Y_M - GROUND_HALF_HEIGHT_M, z: 0 };
      const groundId = b3.b3CreateBody(worldId, groundDef);
      const shapeDef = b3.b3DefaultShapeDef();
      shapeDef.baseMaterial.friction = GROUND_FRICTION;
      b3.b3CreateBoxShape(groundId, shapeDef, GROUND_HALF_EXTENT_M, GROUND_HALF_HEIGHT_M, GROUND_HALF_EXTENT_M);
    }
    for (const body of plan.physicalPlan.bodies) {
      const bodyDef = b3.b3DefaultBodyDef();
      bodyDef.type = b3.b3BodyType.b3_dynamicBody;
      bodyDef.position = { ...body.centerOfMassWorld };
      bodyDef.linearDamping = 0;
      bodyDef.angularDamping = 0;
      bodyDef.enableSleep = false;
      bodyDef.isAwake = true;
      const bodyId = b3.b3CreateBody(worldId, bodyDef);
      bodyIds.set(body.id, bodyId);
      for (const collider of body.colliders) {
        const material = materialById.get(collider.materialId);
        assert.ok(material);
        const hull = b3.b3CreateHull(hullPoints(body, collider));
        assert.ok(hull);
        const shapeDef = b3.b3DefaultShapeDef();
        shapeDef.density = material.densityKgM3;
        shapeDef.baseMaterial.friction = material.friction;
        try { b3.b3CreateHullShape(bodyId, shapeDef, hull); } finally { hull.delete?.(); }
      }
    }
    for (const relation of plan.bearings) {
      const bodyA = bodyIds.get(relation.bodyAId);
      const bodyB = bodyIds.get(relation.bodyBId);
      assert.ok(bodyA && bodyB);
      const def = b3.b3DefaultRevoluteJointDef();
      def.base.bodyIdA = bodyA;
      def.base.bodyIdB = bodyB;
      def.base.localFrameA = { p: { ...relation.localAnchorA }, q: toB3Quat(jointFrameForAxis(relation.axisWorld)) };
      def.base.localFrameB = { p: { ...relation.localAnchorB }, q: toB3Quat(jointFrameForAxis(relation.axisWorld)) };
      def.base.collideConnected = false;
      b3.b3CreateRevoluteJoint(worldId, def);
    }
    const settleSteps = Math.round(fixture.settleS / FIXED_DT_S);
    for (let i = 0; i < settleSteps; i += 1) b3.b3World_Step(worldId, FIXED_DT_S, substeps);
    const driveSteps = Math.round(fixture.driveS / FIXED_DT_S);
    let maxAnchorErrorM = 0;
    let peakAbsRelativeSpeedRadps = 0;
    const started = performance.now();
    for (let i = 0; i < driveSteps; i += 1) {
      for (const torque of plan.torques) {
        const bodyA = bodyIds.get(torque.bodyAId);
        const bodyB = bodyIds.get(torque.bodyBId);
        assert.ok(bodyA && bodyB);
        b3.b3Body_ApplyTorque(bodyA, { ...torque.torqueAWorld }, true);
        b3.b3Body_ApplyTorque(bodyB, { ...torque.torqueBWorld }, true);
      }
      b3.b3World_Step(worldId, FIXED_DT_S, substeps);
      for (const relation of plan.bearings) {
        maxAnchorErrorM = Math.max(maxAnchorErrorM, anchorErrorM(b3, bodyIds, relation));
        peakAbsRelativeSpeedRadps = Math.max(peakAbsRelativeSpeedRadps, Math.abs(relativeSpeed(b3, bodyIds, relation)));
      }
    }
    const wallMs = performance.now() - started;
    return {
      fixture: fixture.id,
      path: "candidate-harness",
      substeps,
      maxAnchorErrorM,
      peakAbsRelativeSpeedRadps,
      wallMs,
      msPerSimulatedSecond: wallMs / fixture.driveS,
      integrityPass: maxAnchorErrorM < ANCHOR_LIMIT_M,
    };
  } finally {
    if (b3.b3World_IsValid(worldId)) b3.b3DestroyWorld(worldId);
  }
}

await mkdir("artifacts/minimal-product-correction-gate", { recursive: true });
const baselines = [];
for (const fixture of FIXTURES) baselines.push(await runProductBaseline(fixture));

assert.equal(baselines.find((r) => r.fixture === "neutral-y-100")?.integrityPass, false, "gate calibration failed: product 4-substep neutral 100 Nm should reproduce RED");
assert.equal(baselines.find((r) => r.fixture === "grounded-z-1000-prior")?.integrityPass, false, "gate calibration failed: prior 1000 Nm fixture should reproduce RED");

const b3 = await Box3DFactory();
const version = b3.b3GetVersion();
assert.deepEqual([version.major, version.minor, version.revision], [0, 1, 0]);
const candidates = [];
for (const substeps of CANDIDATE_SUBSTEPS) {
  for (const fixture of FIXTURES) candidates.push(await runCandidate(b3, fixture, substeps));
}

const bySubsteps = CANDIDATE_SUBSTEPS.map((substeps) => {
  const rows = candidates.filter((r) => r.substeps === substeps);
  return {
    substeps,
    allIntegrityPass: rows.every((r) => r.integrityPass),
    worstAnchorErrorM: Math.max(...rows.map((r) => r.maxAnchorErrorM)),
    totalWallMs: rows.reduce((sum, r) => sum + r.wallMs, 0),
    rows,
  };
});
const minimumPassing = bySubsteps.find((row) => row.allIntegrityPass) ?? null;
const baselineCost = bySubsteps.find((row) => row.substeps === 4)?.totalWallMs ?? null;
const result = {
  schema: "anvil-minimal-product-correction-gate/0",
  sourceSha: process.env.GITHUB_SHA ?? null,
  inheritedProductSha: "29c83ea3256a15923a7db648f2b03c7481223b42",
  anchorLimitM: ANCHOR_LIMIT_M,
  productRuntimeCalibration: baselines,
  candidates,
  summary: bySubsteps.map((row) => ({
    substeps: row.substeps,
    allIntegrityPass: row.allIntegrityPass,
    worstAnchorErrorM: row.worstAnchorErrorM,
    totalWallMs: row.totalWallMs,
    relativeWallCostVs4: baselineCost === null ? null : row.totalWallMs / baselineCost,
  })),
  minimumPassingSubsteps: minimumPassing?.substeps ?? null,
  verdict: minimumPassing === null ? "NUMERICAL_ONLY_NOT_SUFFICIENT_IN_SWEEP" : "NUMERICAL_CANDIDATE_FOUND",
};

await writeFile("artifacts/minimal-product-correction-gate/result.json", `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(JSON.stringify(result, null, 2));
