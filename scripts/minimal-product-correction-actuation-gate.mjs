import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import Box3DFactory from "box3d.js/inline";
import { jointFrameForAxis } from "../.test-build/src/experiments/anvil-02-bearing.js";
import { realizeFreedomSource } from "../.test-build/src/studio-recovery/realize.js";
import { FreedomWorkspace, createFreedomStarterSource } from "../.test-build/src/studio-recovery/source.js";

const ZERO = Object.freeze({ x: 0, y: 0, z: 0 });
const GRAVITY = Object.freeze({ x: 0, y: -10, z: 0 });
const DT_S = 1 / 60;
const ANCHOR_LIMIT_M = 0.003;
const ACTION_SPEED_RADPS = 1;
const GROUND_TOP_Y_M = -0.26;
const GROUND_HALF_HEIGHT_M = 0.5;
const GROUND_HALF_EXTENT_M = 10;
const GROUND_FRICTION = 0.8;
const SUBSTEP_SET = Object.freeze([4, 16, 24, 32]);
const TARGET_SET = Object.freeze([5, 10, 15, 20]);

function add(a, b) { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
function subtract(a, b) { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
function scale(v, s) { return { x: v.x * s, y: v.y * s, z: v.z * s }; }
function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
function cross(a, b) { return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }; }
function magnitude(v) { return Math.hypot(v.x, v.y, v.z); }
function mean(values) { return values.length === 0 ? 0 : values.reduce((sum, v) => sum + v, 0) / values.length; }
function rotate(q, v) {
  const qv = { x: q.x, y: q.y, z: q.z };
  const t = cross(qv, v);
  const doubled = scale(t, 2);
  return add(v, add(scale(doubled, q.w), cross(qv, doubled)));
}
function runtimeQuat(q) { return { x: q.v.x, y: q.v.y, z: q.v.z, w: q.s }; }
function toB3Quat(q) { return { v: { x: q.x, y: q.y, z: q.z }, s: q.w }; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function hullPoints(body, collider) {
  const center = subtract(collider.centerWorld, body.centerOfMassWorld);
  const h = collider.halfExtentsM;
  const out = [];
  for (const dx of [-1, 1]) for (const dy of [-1, 1]) for (const dz of [-1, 1]) {
    out.push(center.x + dx * h.x, center.y + dy * h.y, center.z + dz * h.z);
  }
  return out;
}

function fixture(id, effortNm, freeAxis, grounded, settleS, driveS) {
  const workspace = new FreedomWorkspace(createFreedomStarterSource());
  const bearingId = workspace.addBearing(
    { cellId: "starter:a", face: "x+" },
    { cellId: "starter:b", face: "x-" },
    freeAxis,
  );
  workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, effortNm);
  return { id, effortNm, freeAxis, grounded, settleS, driveS, bearingId, source: workspace.snapshot().source };
}

const FIXTURES = Object.freeze([
  fixture("neutral-y-100", 100, "y", false, 0, 3),
  fixture("grounded-y-500", 500, "y", true, 4, 3),
  fixture("grounded-z-1000-prior", 1000, "z", true, 1.5, 2),
]);

function anchorErrorM(b3, bodyIds, relation) {
  const aId = bodyIds.get(relation.bodyAId);
  const bId = bodyIds.get(relation.bodyBId);
  assert.ok(aId && bId);
  const pa = b3.b3Body_GetPosition(aId);
  const pb = b3.b3Body_GetPosition(bId);
  const qa = runtimeQuat(b3.b3Body_GetRotation(aId));
  const qb = runtimeQuat(b3.b3Body_GetRotation(bId));
  return magnitude(subtract(add(pa, rotate(qa, relation.localAnchorA)), add(pb, rotate(qb, relation.localAnchorB))));
}

function relativeSpeed(b3, bodyIds, relation) {
  const aId = bodyIds.get(relation.bodyAId);
  const bId = bodyIds.get(relation.bodyBId);
  assert.ok(aId && bId);
  return dot(subtract(b3.b3Body_GetAngularVelocity(bId), b3.b3Body_GetAngularVelocity(aId)), relation.axisWorld);
}

async function runCondition(b3, fixtureDef, substeps, mode, targetSpeedRadps = null) {
  const plan = realizeFreedomSource(fixtureDef.source);
  assert.equal(plan.quality, "COMPLETE");
  const relation = plan.bearings.find((r) => r.sourceBearingId === fixtureDef.bearingId);
  const torque = plan.torques[0];
  assert.ok(relation && torque);

  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { ...(fixtureDef.grounded ? GRAVITY : ZERO) };
  worldDef.workerCount = 0;
  const worldId = b3.b3CreateWorld(worldDef);
  const bodyIds = new Map();
  const materials = new Map(fixtureDef.source.matter.materials.map((m) => [m.id, m]));
  try {
    if (fixtureDef.grounded) {
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
      const id = b3.b3CreateBody(worldId, bodyDef);
      bodyIds.set(body.id, id);
      for (const collider of body.colliders) {
        const material = materials.get(collider.materialId);
        assert.ok(material);
        const hull = b3.b3CreateHull(hullPoints(body, collider));
        assert.ok(hull);
        const shapeDef = b3.b3DefaultShapeDef();
        shapeDef.density = material.densityKgM3;
        shapeDef.baseMaterial.friction = material.friction;
        try { b3.b3CreateHullShape(id, shapeDef, hull); } finally { hull.delete?.(); }
      }
    }
    const aId = bodyIds.get(relation.bodyAId);
    const bId = bodyIds.get(relation.bodyBId);
    assert.ok(aId && bId);
    const jointDef = b3.b3DefaultRevoluteJointDef();
    jointDef.base.bodyIdA = aId;
    jointDef.base.bodyIdB = bId;
    jointDef.base.localFrameA = { p: { ...relation.localAnchorA }, q: toB3Quat(jointFrameForAxis(relation.axisWorld)) };
    jointDef.base.localFrameB = { p: { ...relation.localAnchorB }, q: toB3Quat(jointFrameForAxis(relation.axisWorld)) };
    jointDef.base.collideConnected = false;
    b3.b3CreateRevoluteJoint(worldId, jointDef);

    for (let i = 0; i < Math.round(fixtureDef.settleS / DT_S); i += 1) b3.b3World_Step(worldId, DT_S, substeps);

    const driveSteps = Math.round(fixtureDef.driveS / DT_S);
    let maxAnchorErrorM = anchorErrorM(b3, bodyIds, relation);
    let peakAbsSpeedRadps = Math.abs(relativeSpeed(b3, bodyIds, relation));
    let maxAbsCommandScale = 0;
    const tailSpeeds = [];
    const tailCommands = [];
    for (let step = 1; step <= driveSteps; step += 1) {
      const currentSpeed = relativeSpeed(b3, bodyIds, relation);
      let commandScale = 1;
      if (mode === "motor") {
        assert.ok(targetSpeedRadps !== null && targetSpeedRadps > 0);
        commandScale = clamp((targetSpeedRadps - currentSpeed) / targetSpeedRadps, -1, 1);
      }
      maxAbsCommandScale = Math.max(maxAbsCommandScale, Math.abs(commandScale));
      b3.b3Body_ApplyTorque(aId, scale(torque.torqueAWorld, commandScale), true);
      b3.b3Body_ApplyTorque(bId, scale(torque.torqueBWorld, commandScale), true);
      b3.b3World_Step(worldId, DT_S, substeps);
      const speed = relativeSpeed(b3, bodyIds, relation);
      const anchor = anchorErrorM(b3, bodyIds, relation);
      maxAnchorErrorM = Math.max(maxAnchorErrorM, anchor);
      peakAbsSpeedRadps = Math.max(peakAbsSpeedRadps, Math.abs(speed));
      if (step > driveSteps - 60) {
        tailSpeeds.push(Math.abs(speed));
        tailCommands.push(Math.abs(commandScale));
      }
    }
    const meanTailAbsSpeedRadps = mean(tailSpeeds);
    return {
      fixture: fixtureDef.id,
      mode,
      substeps,
      maxEffortNm: fixtureDef.effortNm,
      targetSpeedRadps,
      maxAnchorErrorM,
      peakAbsSpeedRadps,
      meanTailAbsSpeedRadps,
      meanTailAbsCommandScale: mean(tailCommands),
      maxAbsCommandScale,
      integrityPass: maxAnchorErrorM < ANCHOR_LIMIT_M,
      actionPass: meanTailAbsSpeedRadps >= ACTION_SPEED_RADPS,
      candidatePass: maxAnchorErrorM < ANCHOR_LIMIT_M && meanTailAbsSpeedRadps >= ACTION_SPEED_RADPS,
    };
  } finally {
    if (b3.b3World_IsValid(worldId)) b3.b3DestroyWorld(worldId);
  }
}

await mkdir("artifacts/minimal-product-correction-gate", { recursive: true });
const b3 = await Box3DFactory();
const version = b3.b3GetVersion();
assert.deepEqual([version.major, version.minor, version.revision], [0, 1, 0]);

const controls = [];
for (const substeps of [4, 24]) {
  for (const fixtureDef of FIXTURES) controls.push(await runCondition(b3, fixtureDef, substeps, "constant"));
}

const motors = [];
for (const substeps of SUBSTEP_SET) {
  for (const target of TARGET_SET) {
    for (const fixtureDef of FIXTURES) motors.push(await runCondition(b3, fixtureDef, substeps, "motor", target));
  }
}

const viableBySetting = [];
for (const substeps of SUBSTEP_SET) {
  for (const targetSpeedRadps of TARGET_SET) {
    const rows = motors.filter((r) => r.substeps === substeps && r.targetSpeedRadps === targetSpeedRadps);
    viableBySetting.push({
      substeps,
      targetSpeedRadps,
      allCandidatePass: rows.every((r) => r.candidatePass),
      worstAnchorErrorM: Math.max(...rows.map((r) => r.maxAnchorErrorM)),
      minimumTailSpeedRadps: Math.min(...rows.map((r) => r.meanTailAbsSpeedRadps)),
    });
  }
}
const firstViable = viableBySetting.find((row) => row.allCandidatePass) ?? null;
const result = {
  schema: "anvil-minimal-product-correction-actuation-gate/0",
  sourceSha: process.env.GITHUB_SHA ?? null,
  inheritedProductSha: "29c83ea3256a15923a7db648f2b03c7481223b42",
  anchorLimitM: ANCHOR_LIMIT_M,
  actionSpeedRadps: ACTION_SPEED_RADPS,
  controls,
  motors,
  viableBySetting,
  firstViable,
  verdict: firstViable === null ? "BOUNDED_MOTOR_NOT_SUFFICIENT_IN_SWEEP" : "BOUNDED_MOTOR_CANDIDATE_FOUND",
  semanticBoundary: "Motor specimen is a separate bounded actuator control; it does not redefine authored Torque.",
};
await writeFile("artifacts/minimal-product-correction-gate/actuation-result.json", `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(JSON.stringify(result, null, 2));
