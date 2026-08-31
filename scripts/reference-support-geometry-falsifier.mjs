import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import Box3DFactory from "box3d.js/inline";
import { jointFrameForAxis } from "../.test-build/src/experiments/anvil-02-bearing.js";
import { realizeFreedomSource } from "../.test-build/src/studio-recovery/realize.js";
import { FreedomWorkspace, createFreedomStarterSource } from "../.test-build/src/studio-recovery/source.js";

const DT = 1 / 60;
const ANCHOR_LIMIT_M = 0.003;
const ACTION_SPEED_RADPS = 1;
const GRAVITY = { x: 0, y: -10, z: 0 };
const GROUND_TOP_Y = -0.26;
const GROUND_HALF_H = 0.5;
const GROUND_HALF_EXTENT = 10;
const GROUND_FRICTION = 0.8;
const MAX_TORQUE_NM = 1000;
const QUALIFIED_SUBSTEPS = 24;
const TARGETS = [10, 20];
const TRANSFER_SUBSTEPS = [4, 8, 12, 16, 24, 32];
const DRIVE_S = 10;
const SETTLE_S = 1.5;
const RAMP_S = 1;

const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const scale = (v, s) => ({ x: v.x * s, y: v.y * s, z: v.z * s });
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a, b) => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
const mag = (v) => Math.hypot(v.x, v.y, v.z);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mean = (xs) => xs.length ? xs.reduce((s, v) => s + v, 0) / xs.length : 0;
const normalize = (v) => { const m = mag(v); assert.ok(m > 0); return scale(v, 1 / m); };
function rotate(q, v) { const qv = { x: q.x, y: q.y, z: q.z }; const t = cross(qv, v); const d = scale(t, 2); return add(v, add(scale(d, q.w), cross(qv, d))); }
function rq(q) { return { x: q.v.x, y: q.v.y, z: q.v.z, w: q.s }; }
function bq(q) { return { v: { x: q.x, y: q.y, z: q.z }, s: q.w }; }
function hullPoints(body, collider) {
  const center = sub(collider.centerWorld, body.centerOfMassWorld);
  const h = collider.halfExtentsM;
  const out = [];
  for (const dx of [-1, 1]) for (const dy of [-1, 1]) for (const dz of [-1, 1]) out.push(center.x + dx * h.x, center.y + dy * h.y, center.z + dz * h.z);
  return out;
}
function localCorners(body) {
  const out = [];
  for (const collider of body.colliders) {
    const center = sub(collider.centerWorld, body.centerOfMassWorld);
    const h = collider.halfExtentsM;
    for (const dx of [-1, 1]) for (const dy of [-1, 1]) for (const dz of [-1, 1]) out.push(add(center, { x: dx * h.x, y: dy * h.y, z: dz * h.z }));
  }
  return out;
}

function makeFixture(axis) {
  const workspace = new FreedomWorkspace(createFreedomStarterSource());
  const bearingId = workspace.addBearing({ cellId: "starter:a", face: "x+" }, { cellId: "starter:b", face: "x-" }, axis);
  workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, MAX_TORQUE_NM);
  const source = workspace.snapshot().source;
  const plan = realizeFreedomSource(source);
  assert.equal(plan.quality, "COMPLETE");
  const relation = plan.bearings.find((candidate) => candidate.sourceBearingId === bearingId);
  const torque = plan.torques[0];
  assert.ok(relation && torque);
  const bodyA = plan.physicalPlan.bodies.find((body) => body.id === relation.bodyAId);
  const bodyB = plan.physicalPlan.bodies.find((body) => body.id === relation.bodyBId);
  assert.ok(bodyA && bodyB);
  return { source, plan, relation, torque, bodyA, bodyB };
}

function predictedMinimumSweptY(fixture) {
  const axis = normalize(fixture.relation.axisWorld);
  const anchorWorldY = fixture.bodyB.centerOfMassWorld.y + fixture.relation.localAnchorB.y;
  const yProjectionInRotationPlane = Math.sqrt(Math.max(0, 1 - axis.y * axis.y));
  let minimum = Infinity;
  let maximumRadiusM = 0;
  for (const corner of localCorners(fixture.bodyB)) {
    const r = sub(corner, fixture.relation.localAnchorB);
    const parallelScalar = dot(r, axis);
    const parallel = scale(axis, parallelScalar);
    const perpendicular = sub(r, parallel);
    const radius = mag(perpendicular);
    maximumRadiusM = Math.max(maximumRadiusM, radius);
    const minimumYOffset = parallel.y - radius * yProjectionInRotationPlane;
    minimum = Math.min(minimum, anchorWorldY + minimumYOffset);
  }
  return { minimumSweptYAtZeroElevationM: minimum, maximumRadiusM };
}

function anchorError(b3, ids, relation) {
  const a = ids.get(relation.bodyAId), b = ids.get(relation.bodyBId); assert.ok(a && b);
  const pa = b3.b3Body_GetPosition(a), pb = b3.b3Body_GetPosition(b), qa = rq(b3.b3Body_GetRotation(a)), qb = rq(b3.b3Body_GetRotation(b));
  return mag(sub(add(pa, rotate(qa, relation.localAnchorA)), add(pb, rotate(qb, relation.localAnchorB))));
}
function relativeSpeed(b3, ids, relation) {
  const a = ids.get(relation.bodyAId), b = ids.get(relation.bodyBId); assert.ok(a && b);
  return dot(sub(b3.b3Body_GetAngularVelocity(b), b3.b3Body_GetAngularVelocity(a)), relation.axisWorld);
}
function bodyBottomY(b3, id, body) {
  const p = b3.b3Body_GetPosition(id), q = rq(b3.b3Body_GetRotation(id));
  let minY = Infinity;
  for (const collider of body.colliders) {
    const centerLocal = sub(collider.centerWorld, body.centerOfMassWorld), h = collider.halfExtentsM;
    for (const dx of [-1, 1]) for (const dy of [-1, 1]) for (const dz of [-1, 1]) {
      const local = add(centerLocal, { x: dx * h.x, y: dy * h.y, z: dz * h.z });
      minY = Math.min(minY, add(p, rotate(q, local)).y);
    }
  }
  return minY;
}
function finiteState(b3, ids) {
  for (const id of ids.values()) {
    const p = b3.b3Body_GetPosition(id), q = b3.b3Body_GetRotation(id), lv = b3.b3Body_GetLinearVelocity(id), av = b3.b3Body_GetAngularVelocity(id);
    if (![p.x, p.y, p.z, q.v.x, q.v.y, q.v.z, q.s, lv.x, lv.y, lv.z, av.x, av.y, av.z].every(Number.isFinite)) return false;
  }
  return true;
}

async function createWorldFixture(b3, condition) {
  const fixture = makeFixture(condition.axis);
  const materials = new Map(fixture.source.matter.materials.map((m) => [m.id, m]));
  const wd = b3.b3DefaultWorldDef(); wd.gravity = { ...GRAVITY }; wd.workerCount = 0;
  const world = b3.b3CreateWorld(wd), ids = new Map();
  if (condition.ground) {
    const gd = b3.b3DefaultBodyDef(); gd.position = { x: 0, y: GROUND_TOP_Y - GROUND_HALF_H, z: 0 };
    const ground = b3.b3CreateBody(world, gd); const gs = b3.b3DefaultShapeDef(); gs.baseMaterial.friction = GROUND_FRICTION;
    b3.b3CreateBoxShape(ground, gs, GROUND_HALF_EXTENT, GROUND_HALF_H, GROUND_HALF_EXTENT);
  }
  for (const body of fixture.plan.physicalPlan.bodies) {
    const bd = b3.b3DefaultBodyDef();
    const fixed = condition.fixedA && body.id === fixture.relation.bodyAId;
    if (!fixed) bd.type = b3.b3BodyType.b3_dynamicBody;
    bd.position = { ...body.centerOfMassWorld, y: body.centerOfMassWorld.y + condition.elevationM };
    if (!fixed) { bd.linearDamping = 0; bd.angularDamping = 0; bd.enableSleep = false; bd.isAwake = true; }
    const id = b3.b3CreateBody(world, bd); ids.set(body.id, id);
    for (const collider of body.colliders) {
      const material = materials.get(collider.materialId); assert.ok(material);
      const hull = b3.b3CreateHull(hullPoints(body, collider)); assert.ok(hull);
      const sd = b3.b3DefaultShapeDef(); sd.density = material.densityKgM3; sd.baseMaterial.friction = material.friction;
      try { b3.b3CreateHullShape(id, sd, hull); } finally { hull.delete?.(); }
    }
  }
  const a = ids.get(fixture.relation.bodyAId), b = ids.get(fixture.relation.bodyBId); assert.ok(a && b);
  const jd = b3.b3DefaultRevoluteJointDef(); jd.base.bodyIdA = a; jd.base.bodyIdB = b;
  jd.base.localFrameA = { p: { ...fixture.relation.localAnchorA }, q: bq(jointFrameForAxis(fixture.relation.axisWorld)) };
  jd.base.localFrameB = { p: { ...fixture.relation.localAnchorB }, q: bq(jointFrameForAxis(fixture.relation.axisWorld)) };
  jd.base.collideConnected = false; b3.b3CreateRevoluteJoint(world, jd);
  return { world, ids, fixture, a, b };
}

async function runDriven(b3, condition) {
  const setup = await createWorldFixture(b3, condition);
  const { world, ids, fixture, a, b } = setup;
  try {
    let maxAnchorSettle = anchorError(b3, ids, fixture.relation);
    let minMovingClearance = bodyBottomY(b3, b, fixture.bodyB) - GROUND_TOP_Y;
    const settleSteps = Math.round(condition.settleS / DT);
    for (let i = 0; i < settleSteps; i++) {
      b3.b3World_Step(world, DT, condition.substeps);
      maxAnchorSettle = Math.max(maxAnchorSettle, anchorError(b3, ids, fixture.relation));
      if (condition.ground) minMovingClearance = Math.min(minMovingClearance, bodyBottomY(b3, b, fixture.bodyB) - GROUND_TOP_Y);
    }

    const driveSteps = Math.round(condition.driveS / DT), rampSteps = Math.max(1, Math.round(RAMP_S / DT));
    let maxAnchorDrive = anchorError(b3, ids, fixture.relation), peakSpeed = 0, maxAbsCommandScale = 0, firstRedTimeS = null;
    const tail = [];
    for (let i = 1; i <= driveSteps; i++) {
      const targetNow = condition.targetSpeedRadps * Math.min(1, i / rampSteps);
      const v = relativeSpeed(b3, ids, fixture.relation);
      const commandScale = clamp((targetNow - v) / Math.abs(condition.targetSpeedRadps), -1, 1);
      maxAbsCommandScale = Math.max(maxAbsCommandScale, Math.abs(commandScale));
      if (!condition.fixedA) b3.b3Body_ApplyTorque(a, scale(fixture.torque.torqueAWorld, commandScale), true);
      b3.b3Body_ApplyTorque(b, scale(fixture.torque.torqueBWorld, commandScale), true);
      b3.b3World_Step(world, DT, condition.substeps);
      const speed = Math.abs(relativeSpeed(b3, ids, fixture.relation));
      const anchor = anchorError(b3, ids, fixture.relation);
      maxAnchorDrive = Math.max(maxAnchorDrive, anchor); peakSpeed = Math.max(peakSpeed, speed);
      if (condition.ground) minMovingClearance = Math.min(minMovingClearance, bodyBottomY(b3, b, fixture.bodyB) - GROUND_TOP_Y);
      if (firstRedTimeS === null && anchor >= ANCHOR_LIMIT_M) firstRedTimeS = i * DT;
      if (i > driveSteps - 60) tail.push(speed);
    }
    const tailSpeed = mean(tail);
    const sweep = predictedMinimumSweptY(fixture);
    return {
      ...condition,
      predictedFullSweepClearanceM: sweep.minimumSweptYAtZeroElevationM + condition.elevationM - GROUND_TOP_Y,
      maximumMovingRadiusM: sweep.maximumRadiusM,
      maxAnchorSettleM: maxAnchorSettle,
      maxAnchorDriveM: maxAnchorDrive,
      minMovingClearanceM: condition.ground ? minMovingClearance : null,
      firstRedTimeS,
      peakAbsSpeedRadps: peakSpeed,
      meanTailAbsSpeedRadps: tailSpeed,
      maxAbsCommandScale,
      actionable: tailSpeed >= ACTION_SPEED_RADPS,
      integrityPass: maxAnchorDrive < ANCHOR_LIMIT_M,
      finite: finiteState(b3, ids),
    };
  } finally { if (b3.b3World_IsValid(world)) b3.b3DestroyWorld(world); }
}

async function runPassiveDrop(b3, axis) {
  const condition = { label: `passive-drop-${axis}`, axis, substeps: QUALIFIED_SUBSTEPS, targetSpeedRadps: 0, elevationM: 0.5, fixedA: false, ground: true, settleS: 0, driveS: 0, mode: "passive-drop" };
  const setup = await createWorldFixture(b3, condition);
  const { world, ids, fixture, b } = setup;
  try {
    let maxAnchor = anchorError(b3, ids, fixture.relation), minClearance = bodyBottomY(b3, b, fixture.bodyB) - GROUND_TOP_Y;
    const steps = Math.round(3 / DT);
    for (let i = 0; i < steps; i++) {
      b3.b3World_Step(world, DT, QUALIFIED_SUBSTEPS);
      maxAnchor = Math.max(maxAnchor, anchorError(b3, ids, fixture.relation));
      minClearance = Math.min(minClearance, bodyBottomY(b3, b, fixture.bodyB) - GROUND_TOP_Y);
    }
    return { ...condition, maxAnchorM: maxAnchor, minMovingClearanceM: minClearance, integrityPass: maxAnchor < ANCHOR_LIMIT_M, finite: finiteState(b3, ids) };
  } finally { if (b3.b3World_IsValid(world)) b3.b3DestroyWorld(world); }
}

await mkdir("artifacts/reference-support-geometry-falsifier", { recursive: true });
const b3 = await Box3DFactory(); const version = b3.b3GetVersion(); assert.deepEqual([version.major, version.minor, version.revision], [0, 1, 0]);

const zFixture = makeFixture("z");
const zSweep = predictedMinimumSweptY(zFixture);
const requiredElevationM = Math.max(0, GROUND_TOP_Y - zSweep.minimumSweptYAtZeroElevationM);
const elevations = {
  floor: 0,
  insufficient: Math.max(0, requiredElevationM - 0.05),
  boundary: requiredElevationM + 0.005,
  clear: requiredElevationM + 0.10,
};

const conditions = [];
for (const targetSpeedRadps of TARGETS) {
  conditions.push({ label: `dynamic-floor-z-t${targetSpeedRadps}`, axis: "z", substeps: QUALIFIED_SUBSTEPS, targetSpeedRadps, elevationM: 0, fixedA: false, ground: true, settleS: SETTLE_S, driveS: DRIVE_S, mode: "dynamic-floor" });
  conditions.push({ label: `fixed-floor-z-t${targetSpeedRadps}`, axis: "z", substeps: QUALIFIED_SUBSTEPS, targetSpeedRadps, elevationM: 0, fixedA: true, ground: true, settleS: SETTLE_S, driveS: DRIVE_S, mode: "fixed-floor" });
  conditions.push({ label: `fixed-insufficient-z-t${targetSpeedRadps}`, axis: "z", substeps: QUALIFIED_SUBSTEPS, targetSpeedRadps, elevationM: elevations.insufficient, fixedA: true, ground: true, settleS: SETTLE_S, driveS: DRIVE_S, mode: "fixed-insufficient" });
  conditions.push({ label: `fixed-boundary-z-t${targetSpeedRadps}`, axis: "z", substeps: QUALIFIED_SUBSTEPS, targetSpeedRadps, elevationM: elevations.boundary, fixedA: true, ground: true, settleS: SETTLE_S, driveS: DRIVE_S, mode: "fixed-boundary" });
  conditions.push({ label: `fixed-clear-z-t${targetSpeedRadps}`, axis: "z", substeps: QUALIFIED_SUBSTEPS, targetSpeedRadps, elevationM: elevations.clear, fixedA: true, ground: true, settleS: SETTLE_S, driveS: DRIVE_S, mode: "fixed-clear" });
  conditions.push({ label: `fixed-clear-noground-z-t${targetSpeedRadps}`, axis: "z", substeps: QUALIFIED_SUBSTEPS, targetSpeedRadps, elevationM: elevations.clear, fixedA: true, ground: false, settleS: SETTLE_S, driveS: DRIVE_S, mode: "fixed-clear-noground" });
  conditions.push({ label: `dynamic-floor-y-t${targetSpeedRadps}`, axis: "y", substeps: QUALIFIED_SUBSTEPS, targetSpeedRadps, elevationM: 0, fixedA: false, ground: true, settleS: SETTLE_S, driveS: DRIVE_S, mode: "y-dynamic-control" });
  conditions.push({ label: `fixed-floor-y-t${targetSpeedRadps}`, axis: "y", substeps: QUALIFIED_SUBSTEPS, targetSpeedRadps, elevationM: 0, fixedA: true, ground: true, settleS: SETTLE_S, driveS: DRIVE_S, mode: "y-fixed-control" });
}

const rows = [];
for (const condition of conditions) rows.push(await runDriven(b3, condition));

const transferRows = [];
for (const substeps of TRANSFER_SUBSTEPS) for (const targetSpeedRadps of TARGETS) {
  transferRows.push(await runDriven(b3, { label: `transfer-fixed-clear-z-s${substeps}-t${targetSpeedRadps}`, axis: "z", substeps, targetSpeedRadps, elevationM: elevations.clear, fixedA: true, ground: true, settleS: SETTLE_S, driveS: DRIVE_S, mode: "resolution-transfer" }));
}

const passiveRows = [await runPassiveDrop(b3, "y"), await runPassiveDrop(b3, "z")];

function row(mode, target) { const found = rows.find((candidate) => candidate.mode === mode && candidate.targetSpeedRadps === target); assert.ok(found); return found; }
const causalPairs = TARGETS.map((target) => ({
  targetSpeedRadps: target,
  dynamicFloorAnchorM: row("dynamic-floor", target).maxAnchorDriveM,
  fixedFloorAnchorM: row("fixed-floor", target).maxAnchorDriveM,
  fixedInsufficientAnchorM: row("fixed-insufficient", target).maxAnchorDriveM,
  fixedBoundaryAnchorM: row("fixed-boundary", target).maxAnchorDriveM,
  fixedClearAnchorM: row("fixed-clear", target).maxAnchorDriveM,
  fixedClearNoGroundAnchorM: row("fixed-clear-noground", target).maxAnchorDriveM,
  fixedClearMinMovingClearanceM: row("fixed-clear", target).minMovingClearanceM,
  fixedClearTailSpeedRadps: row("fixed-clear", target).meanTailAbsSpeedRadps,
}));

const fixedClearQualifiedPass = TARGETS.every((target) => row("fixed-clear", target).integrityPass && row("fixed-clear", target).actionable && row("fixed-clear", target).minMovingClearanceM > 0.02);
const fixedClearNoGroundPass = TARGETS.every((target) => row("fixed-clear-noground", target).integrityPass && row("fixed-clear-noground", target).actionable);
const dynamicFloorHasRed = TARGETS.some((target) => !row("dynamic-floor", target).integrityPass);
const fixedFloorHasRed = TARGETS.some((target) => !row("fixed-floor", target).integrityPass);
const insufficientHasRed = TARGETS.some((target) => !row("fixed-insufficient", target).integrityPass);
const yControlsPass = rows.filter((candidate) => candidate.axis === "y").every((candidate) => candidate.integrityPass && candidate.actionable);
const firstTransferPassingSubsteps = TRANSFER_SUBSTEPS.find((substeps) => TARGETS.every((target) => {
  const candidate = transferRows.find((r) => r.substeps === substeps && r.targetSpeedRadps === target); assert.ok(candidate); return candidate.integrityPass && candidate.actionable && candidate.minMovingClearanceM > 0.02;
})) ?? null;

let verdict = "REFERENCE_SUPPORT_RESULT_MIXED";
if (fixedClearQualifiedPass && fixedClearNoGroundPass && dynamicFloorHasRed && (fixedFloorHasRed || insufficientHasRed) && yControlsPass) verdict = "REFERENCE_PLUS_CLEARANCE_SUFFICIENT_IN_FIXTURE";
else if (fixedClearQualifiedPass && fixedClearNoGroundPass && !fixedFloorHasRed) verdict = "REFERENCE_SUFFICIENT_CLEARANCE_NOT_REQUIRED_IN_FIXTURE";
else if (!fixedClearQualifiedPass) verdict = "REFERENCE_PLUS_CLEARANCE_NOT_SUFFICIENT";

const result = {
  schema: "anvil-reference-support-geometry-falsifier/0",
  sourceSha: process.env.GITHUB_SHA ?? null,
  productBaseSha: "29c83ea3256a15923a7db648f2b03c7481223b42",
  anchorLimitM: ANCHOR_LIMIT_M,
  diagnosticMaxTorqueNm: MAX_TORQUE_NM,
  qualifiedSubsteps: QUALIFIED_SUBSTEPS,
  geometry: {
    movingBodyId: zFixture.relation.bodyBId,
    horizontalAxis: zFixture.relation.axisWorld,
    maximumMovingRadiusM: zSweep.maximumRadiusM,
    minimumSweptYAtZeroElevationM: zSweep.minimumSweptYAtZeroElevationM,
    requiredElevationForZeroFullSweepClearanceM: requiredElevationM,
    elevationsM: elevations,
  },
  rows,
  causalPairs,
  transferRows,
  firstTransferPassingSubsteps,
  passiveRows,
  checks: { fixedClearQualifiedPass, fixedClearNoGroundPass, dynamicFloorHasRed, fixedFloorHasRed, insufficientHasRed, yControlsPass },
  verdict,
};
assert.ok([...rows, ...transferRows, ...passiveRows].every((candidate) => candidate.finite));
await writeFile("artifacts/reference-support-geometry-falsifier/result.json", `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(JSON.stringify(result, null, 2));
