import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import Box3DFactory from "box3d.js/inline";
import { jointFrameForAxis } from "../.test-build/src/experiments/anvil-02-bearing.js";
import { realizeFreedomSource } from "../.test-build/src/studio-recovery/realize.js";
import { FreedomWorkspace, createFreedomStarterSource } from "../.test-build/src/studio-recovery/source.js";

const ZERO = Object.freeze({ x: 0, y: 0, z: 0 });
const GRAVITY = Object.freeze({ x: 0, y: -10, z: 0 });
const GROUND_TOP_Y_M = -0.26;
const GROUND_HALF_HEIGHT_M = 0.5;
const GROUND_HALF_EXTENT_X_M = 10;
const GROUND_HALF_EXTENT_Z_M = 10;
const DEFAULT_GROUND_FRICTION = 0.8;
const DEFAULT_DT_S = 1 / 60;
const DEFAULT_SUBSTEPS = 4;
const ANCHOR_LIMIT_M = 0.003;
const HISTORICAL_ACTIONABLE_SPEED_RADPS = 0.05;
const SUSTAINED_ACTION_SPEED_RADPS = 1;

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(value, scalar) {
  return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar };
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function magnitude(value) {
  return Math.hypot(value.x, value.y, value.z);
}

function rotateVec3ByQuat(rotation, value) {
  const qv = { x: rotation.x, y: rotation.y, z: rotation.z };
  const t = cross(qv, value);
  const doubled = scale(t, 2);
  return add(value, add(scale(doubled, rotation.w), cross(qv, doubled)));
}

function toBox3DQuat(rotation) {
  return { v: { x: rotation.x, y: rotation.y, z: rotation.z }, s: rotation.w };
}

function runtimeQuat(rotation) {
  return { x: rotation.v.x, y: rotation.v.y, z: rotation.v.z, w: rotation.s };
}

function boxHullPoints(body, colliderIndex) {
  const collider = body.colliders[colliderIndex];
  assert.ok(collider, `missing collider ${colliderIndex}`);
  const center = subtract(collider.centerWorld, body.centerOfMassWorld);
  const h = collider.halfExtentsM;
  const points = [];
  for (const dx of [-1, 1]) {
    for (const dy of [-1, 1]) {
      for (const dz of [-1, 1]) {
        points.push(center.x + dx * h.x, center.y + dy * h.y, center.z + dz * h.z);
      }
    }
  }
  return points;
}

function maxValue(record) {
  return Math.max(0, ...Object.values(record));
}

function mean(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function createMechanism(effortNm, freeAxis = "y") {
  const workspace = new FreedomWorkspace(createFreedomStarterSource());
  const bearing = workspace.addBearing(
    { cellId: "starter:a", face: "x+" },
    { cellId: "starter:b", face: "x-" },
    freeAxis,
  );
  workspace.addTorquePatch({ cellId: "starter:a", face: "x+" }, effortNm);
  return { source: workspace.snapshot().source, bearing };
}

function relationFor(plan, bearingId) {
  const relation = plan.bearings.find((candidate) => candidate.sourceBearingId === bearingId);
  assert.ok(relation, `missing realized Bearing ${bearingId}`);
  return relation;
}

function relativeAngularSpeedRadps(b3, bodyIds, relation) {
  const bodyA = bodyIds.get(relation.bodyAId);
  const bodyB = bodyIds.get(relation.bodyBId);
  assert.ok(bodyA && bodyB, `missing bodies for ${relation.sourceBearingId}`);
  const angularA = b3.b3Body_GetAngularVelocity(bodyA);
  const angularB = b3.b3Body_GetAngularVelocity(bodyB);
  return dot(subtract(angularB, angularA), relation.axisWorld);
}

function anchorErrorM(b3, bodyIds, relation) {
  const bodyA = bodyIds.get(relation.bodyAId);
  const bodyB = bodyIds.get(relation.bodyBId);
  assert.ok(bodyA && bodyB, `missing bodies for ${relation.sourceBearingId}`);
  const positionA = b3.b3Body_GetPosition(bodyA);
  const positionB = b3.b3Body_GetPosition(bodyB);
  const rotationA = runtimeQuat(b3.b3Body_GetRotation(bodyA));
  const rotationB = runtimeQuat(b3.b3Body_GetRotation(bodyB));
  const worldA = add(positionA, rotateVec3ByQuat(rotationA, relation.localAnchorA));
  const worldB = add(positionB, rotateVec3ByQuat(rotationB, relation.localAnchorB));
  return magnitude(subtract(worldA, worldB));
}

function finiteWorldState(b3, bodyIds) {
  for (const bodyId of bodyIds.values()) {
    const position = b3.b3Body_GetPosition(bodyId);
    const rotation = b3.b3Body_GetRotation(bodyId);
    const linear = b3.b3Body_GetLinearVelocity(bodyId);
    const angular = b3.b3Body_GetAngularVelocity(bodyId);
    const values = [
      position.x, position.y, position.z,
      rotation.v.x, rotation.v.y, rotation.v.z, rotation.s,
      linear.x, linear.y, linear.z,
      angular.x, angular.y, angular.z,
    ];
    if (!values.every(Number.isFinite)) return false;
  }
  return true;
}

function commandScaleFor(condition, speedRadps) {
  if (condition.control === "constant") return 1;
  if (condition.control === "velocity-servo") {
    const target = condition.targetSpeedRadps;
    assert.ok(Number.isFinite(target) && Math.abs(target) > 1e-9, "velocity-servo needs non-zero targetSpeedRadps");
    const normalizedError = (target - speedRadps) / Math.abs(target);
    return Math.max(-1, Math.min(1, normalizedError));
  }
  throw new Error(`Unknown control ${condition.control}`);
}

async function runCondition(b3, condition) {
  const {
    label,
    grounded,
    effortNm,
    freeAxis = "y",
    dtS = DEFAULT_DT_S,
    substeps = DEFAULT_SUBSTEPS,
    groundFriction = DEFAULT_GROUND_FRICTION,
    angularDamping = 0,
    control = "constant",
    targetSpeedRadps = null,
    settleS = grounded ? 4 : 0,
    driveS = 3,
  } = condition;

  assert.ok(Number.isFinite(dtS) && dtS > 0, "dtS must be positive finite");
  assert.ok(Number.isInteger(substeps) && substeps >= 1, "substeps must be a positive integer");
  assert.ok(Number.isFinite(groundFriction) && groundFriction >= 0, "groundFriction must be non-negative finite");
  assert.ok(Number.isFinite(angularDamping) && angularDamping >= 0, "angularDamping must be non-negative finite");

  const { source, bearing } = createMechanism(effortNm, freeAxis);
  const plan = realizeFreedomSource(source);
  assert.equal(plan.quality, "COMPLETE", `${label}: fixture realization not COMPLETE`);
  assert.equal(plan.bearings.length, 1, `${label}: expected one Bearing`);
  assert.equal(plan.torques.length, 1, `${label}: expected one Torque`);
  const relation = relationFor(plan, bearing);
  const torque = plan.torques[0];
  assert.ok(torque, `${label}: missing realized Torque`);

  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { ...(grounded ? GRAVITY : ZERO) };
  worldDef.workerCount = 0;
  const worldId = b3.b3CreateWorld(worldDef);
  const bodyIds = new Map();
  const jointIds = [];
  const materialById = new Map(source.matter.materials.map((material) => [material.id, material]));

  try {
    if (grounded) {
      const groundDef = b3.b3DefaultBodyDef();
      groundDef.position = { x: 0, y: GROUND_TOP_Y_M - GROUND_HALF_HEIGHT_M, z: 0 };
      const groundId = b3.b3CreateBody(worldId, groundDef);
      const groundShape = b3.b3DefaultShapeDef();
      groundShape.baseMaterial.friction = groundFriction;
      b3.b3CreateBoxShape(
        groundId,
        groundShape,
        GROUND_HALF_EXTENT_X_M,
        GROUND_HALF_HEIGHT_M,
        GROUND_HALF_EXTENT_Z_M,
      );
    }

    for (const body of plan.physicalPlan.bodies) {
      const bodyDef = b3.b3DefaultBodyDef();
      bodyDef.type = b3.b3BodyType.b3_dynamicBody;
      bodyDef.position = { ...body.centerOfMassWorld };
      bodyDef.linearDamping = 0;
      bodyDef.angularDamping = angularDamping;
      bodyDef.enableSleep = false;
      bodyDef.isAwake = true;
      const bodyId = b3.b3CreateBody(worldId, bodyDef);
      bodyIds.set(body.id, bodyId);

      for (let colliderIndex = 0; colliderIndex < body.colliders.length; colliderIndex += 1) {
        const collider = body.colliders[colliderIndex];
        assert.ok(collider, `${label}: missing collider ${colliderIndex}`);
        const material = materialById.get(collider.materialId);
        assert.ok(material, `${label}: missing material ${collider.materialId}`);
        const hull = b3.b3CreateHull(boxHullPoints(body, colliderIndex));
        assert.ok(hull, `${label}: Box3D rejected collider ${collider.id}`);
        const shapeDef = b3.b3DefaultShapeDef();
        shapeDef.density = material.densityKgM3;
        shapeDef.baseMaterial.friction = material.friction;
        try {
          b3.b3CreateHullShape(bodyId, shapeDef, hull);
        } finally {
          hull.delete?.();
        }
      }
    }

    const bodyA = bodyIds.get(relation.bodyAId);
    const bodyB = bodyIds.get(relation.bodyBId);
    assert.ok(bodyA && bodyB, `${label}: Bearing lost bodies`);
    const jointDef = b3.b3DefaultRevoluteJointDef();
    jointDef.base.bodyIdA = bodyA;
    jointDef.base.bodyIdB = bodyB;
    jointDef.base.localFrameA = {
      p: { ...relation.localAnchorA },
      q: toBox3DQuat(jointFrameForAxis(relation.axisWorld)),
    };
    jointDef.base.localFrameB = {
      p: { ...relation.localAnchorB },
      q: toBox3DQuat(jointFrameForAxis(relation.axisWorld)),
    };
    jointDef.base.collideConnected = false;
    jointIds.push(b3.b3CreateRevoluteJoint(worldId, jointDef));

    const settleSteps = Math.round(settleS / dtS);
    for (let step = 0; step < settleSteps; step += 1) {
      b3.b3World_Step(worldId, dtS, substeps);
    }

    const anchorBeforeDriveM = anchorErrorM(b3, bodyIds, relation);
    const speedBeforeDriveRadps = relativeAngularSpeedRadps(b3, bodyIds, relation);

    const driveSteps = Math.round(driveS / dtS);
    let maxAnchorErrorM = anchorBeforeDriveM;
    let peakAbsSpeedRadps = Math.abs(speedBeforeDriveRadps);
    let firstAnchorRedStep = null;
    let firstHistoricalActionStep = null;
    let firstSustainedThresholdStep = null;
    let commandSignChanges = 0;
    let previousCommandSign = 0;
    const tailAbsSpeeds = [];
    const tailCommandScales = [];
    const samples = [];

    for (let step = 1; step <= driveSteps; step += 1) {
      const speedBefore = relativeAngularSpeedRadps(b3, bodyIds, relation);
      const commandScale = commandScaleFor({ ...condition, control, targetSpeedRadps }, speedBefore);
      const commandSign = Math.sign(commandScale);
      if (previousCommandSign !== 0 && commandSign !== 0 && commandSign !== previousCommandSign) commandSignChanges += 1;
      if (commandSign !== 0) previousCommandSign = commandSign;

      b3.b3Body_ApplyTorque(bodyA, scale(torque.torqueAWorld, commandScale), true);
      b3.b3Body_ApplyTorque(bodyB, scale(torque.torqueBWorld, commandScale), true);
      b3.b3World_Step(worldId, dtS, substeps);

      const speed = relativeAngularSpeedRadps(b3, bodyIds, relation);
      const absSpeed = Math.abs(speed);
      const anchor = anchorErrorM(b3, bodyIds, relation);
      maxAnchorErrorM = Math.max(maxAnchorErrorM, anchor);
      peakAbsSpeedRadps = Math.max(peakAbsSpeedRadps, absSpeed);
      if (firstAnchorRedStep === null && anchor >= ANCHOR_LIMIT_M) firstAnchorRedStep = step;
      if (firstHistoricalActionStep === null && absSpeed >= HISTORICAL_ACTIONABLE_SPEED_RADPS) firstHistoricalActionStep = step;
      if (firstSustainedThresholdStep === null && absSpeed >= SUSTAINED_ACTION_SPEED_RADPS) firstSustainedThresholdStep = step;

      const tailWindowSteps = Math.max(1, Math.round(1 / dtS));
      if (step > driveSteps - tailWindowSteps) {
        tailAbsSpeeds.push(absSpeed);
        tailCommandScales.push(Math.abs(commandScale));
      }

      const sampleEvery = Math.max(1, Math.round(0.25 / dtS));
      if (step === 1 || step === driveSteps || step % sampleEvery === 0) {
        samples.push({
          step,
          timeS: step * dtS,
          relativeSpeedRadps: speed,
          anchorErrorM: anchor,
          commandScale,
        });
      }
    }

    const finalSpeedRadps = relativeAngularSpeedRadps(b3, bodyIds, relation);
    const finalAnchorErrorM = anchorErrorM(b3, bodyIds, relation);
    const finite = finiteWorldState(b3, bodyIds);

    return {
      label,
      grounded,
      effortNm,
      freeAxis,
      dtS,
      substeps,
      effectiveSubstepDtS: dtS / substeps,
      groundFriction: grounded ? groundFriction : null,
      angularDamping,
      control,
      targetSpeedRadps,
      settleS,
      driveS,
      anchorBeforeDriveM,
      speedBeforeDriveRadps,
      finalSpeedRadps,
      finalAbsSpeedRadps: Math.abs(finalSpeedRadps),
      peakAbsSpeedRadps,
      meanTailAbsSpeedRadps: mean(tailAbsSpeeds),
      meanTailAbsCommandScale: mean(tailCommandScales),
      finalAnchorErrorM,
      maxAnchorErrorM,
      firstAnchorRedStep,
      firstAnchorRedTimeS: firstAnchorRedStep === null ? null : firstAnchorRedStep * dtS,
      firstHistoricalActionStep,
      firstSustainedThresholdStep,
      commandSignChanges,
      finite,
      samples,
    };
  } finally {
    if (b3.b3World_IsValid(worldId)) b3.b3DestroyWorld(worldId);
  }
}

function minimumSustainedTorque(rows) {
  const candidates = rows
    .filter((row) => row.meanTailAbsSpeedRadps >= SUSTAINED_ACTION_SPEED_RADPS)
    .sort((a, b) => a.effortNm - b.effortNm);
  return candidates[0]?.effortNm ?? null;
}

function summarizeSolverResolution(rows, effortNm) {
  const subset = rows.filter((row) => row.effortNm === effortNm);
  const baseline = subset.find((row) => row.dtS === DEFAULT_DT_S && row.substeps === DEFAULT_SUBSTEPS);
  assert.ok(baseline, `missing ${effortNm} Nm solver baseline`);
  return subset.map((row) => ({
    label: row.label,
    dtS: row.dtS,
    substeps: row.substeps,
    effectiveSubstepDtS: row.effectiveSubstepDtS,
    peakAbsSpeedRadps: row.peakAbsSpeedRadps,
    maxAnchorErrorM: row.maxAnchorErrorM,
    errorRatioVsBaseline: baseline.maxAnchorErrorM > 0 ? row.maxAnchorErrorM / baseline.maxAnchorErrorM : null,
    constraintSafe: row.maxAnchorErrorM < ANCHOR_LIMIT_M,
  }));
}

const b3 = await Box3DFactory();
const version = b3.b3GetVersion();
assert.equal(`${version.major}.${version.minor}.${version.revision}`, "0.1.0");

const conditions = [];

// A — numerical resolution at two known RED torque levels, environment neutral.
for (const effortNm of [60, 100]) {
  for (const resolution of [
    { name: "dt60_sub4", dtS: 1 / 60, substeps: 4 },
    { name: "dt60_sub8", dtS: 1 / 60, substeps: 8 },
    { name: "dt60_sub16", dtS: 1 / 60, substeps: 16 },
    { name: "dt60_sub32", dtS: 1 / 60, substeps: 32 },
    { name: "dt120_sub4", dtS: 1 / 120, substeps: 4 },
    { name: "dt240_sub4", dtS: 1 / 240, substeps: 4 },
  ]) {
    conditions.push({
      group: "solver-resolution",
      label: `solver_neutral_${effortNm}Nm_${resolution.name}`,
      grounded: false,
      effortNm,
      dtS: resolution.dtS,
      substeps: resolution.substeps,
      control: "constant",
      driveS: 3,
    });
  }
}

// B — quantify how ground friction moves the breakaway cliff without changing Torque semantics.
for (const groundFriction of [0.8, 0.4, 0.2, 0.1, 0.02]) {
  for (const effortNm of [20, 100, 200, 300, 350, 400, 450, 500]) {
    conditions.push({
      group: "friction-breakaway",
      label: `ground_f${groundFriction}_${effortNm}Nm_constant`,
      grounded: true,
      effortNm,
      groundFriction,
      control: "constant",
      settleS: 4,
      driveS: 3,
    });
  }
}

// C — disposable velocity-servo specimen. This is an instrument, not proposed Torque semantics.
for (const grounded of [false, true]) {
  for (const maxTorqueNm of [500, 1000]) {
    for (const targetSpeedRadps of [5, 10, 20, 30]) {
      conditions.push({
        group: "velocity-servo",
        label: `servo_${grounded ? "ground" : "neutral"}_${maxTorqueNm}Nm_target${targetSpeedRadps}`,
        grounded,
        effortNm: maxTorqueNm,
        groundFriction: DEFAULT_GROUND_FRICTION,
        control: "velocity-servo",
        targetSpeedRadps,
        settleS: grounded ? 4 : 0,
        driveS: 3,
      });
    }
  }
}

// D — passive damping discriminator: keep constant effort but bound accumulated speed through ordinary body damping.
for (const angularDamping of [0, 0.25, 0.5, 1, 2, 4]) {
  conditions.push({
    group: "damping-discriminator",
    label: `neutral_100Nm_damping${angularDamping}`,
    grounded: false,
    effortNm: 100,
    angularDamping,
    control: "constant",
    driveS: 6,
  });
}

const results = [];
for (const condition of conditions) {
  const result = await runCondition(b3, condition);
  results.push({ group: condition.group, ...result });
}

assert.equal(results.every((row) => row.finite), true, "one or more conditions produced non-finite state");

const baseline100 = results.find((row) => row.label === "solver_neutral_100Nm_dt60_sub4");
const baseline60 = results.find((row) => row.label === "solver_neutral_60Nm_dt60_sub4");
assert.ok(baseline100 && baseline60);
assert.ok(baseline100.maxAnchorErrorM >= ANCHOR_LIMIT_M, "instrument failed to reproduce 100 Nm neutral constraint RED");
assert.ok(baseline60.maxAnchorErrorM >= ANCHOR_LIMIT_M, "instrument failed to reproduce 60 Nm neutral constraint RED");

const solverRows = results.filter((row) => row.group === "solver-resolution");
const frictionRows = results.filter((row) => row.group === "friction-breakaway");
const servoRows = results.filter((row) => row.group === "velocity-servo");
const dampingRows = results.filter((row) => row.group === "damping-discriminator");

const frictionSummary = [0.8, 0.4, 0.2, 0.1, 0.02].map((friction) => {
  const rows = frictionRows.filter((row) => row.groundFriction === friction);
  const minimum = minimumSustainedTorque(rows);
  const safeActionRows = rows.filter(
    (row) => row.meanTailAbsSpeedRadps >= SUSTAINED_ACTION_SPEED_RADPS && row.maxAnchorErrorM < ANCHOR_LIMIT_M,
  );
  return {
    groundFriction: friction,
    minimumSustainedTorqueNm: minimum,
    minimumConstraintSafeSustainedTorqueNm: safeActionRows.sort((a, b) => a.effortNm - b.effortNm)[0]?.effortNm ?? null,
    maximumConstraintSafeSustainedTorqueNm: safeActionRows.sort((a, b) => b.effortNm - a.effortNm)[0]?.effortNm ?? null,
  };
});

const safeServoRows = servoRows.filter(
  (row) => row.meanTailAbsSpeedRadps >= SUSTAINED_ACTION_SPEED_RADPS && row.maxAnchorErrorM < ANCHOR_LIMIT_M,
);
const groundedSafeServoRows = safeServoRows.filter((row) => row.grounded);

const baselineDamping = dampingRows.find((row) => row.angularDamping === 0);
assert.ok(baselineDamping);
const firstSafeDamping = [...dampingRows]
  .filter((row) => row.maxAnchorErrorM < ANCHOR_LIMIT_M)
  .sort((a, b) => a.angularDamping - b.angularDamping)[0] ?? null;

const bestSolver100 = summarizeSolverResolution(solverRows, 100)
  .sort((a, b) => a.maxAnchorErrorM - b.maxAnchorErrorM)[0];
const bestSolver60 = summarizeSolverResolution(solverRows, 60)
  .sort((a, b) => a.maxAnchorErrorM - b.maxAnchorErrorM)[0];

const report = {
  schema: "anvil-constraint-safe-actuation-envelope/0",
  sourceSha: process.env.GITHUB_SHA ?? null,
  productBaseSha: "29c83ea3256a15923a7db648f2b03c7481223b42",
  engineVersion: `${version.major}.${version.minor}.${version.revision}`,
  fixture: "three starter cells; Bearing starter:a x+ <-> starter:b x-; freeAxis=y unless noted",
  invariant: { anchorLimitM: ANCHOR_LIMIT_M },
  referenceThresholds: {
    historicalActionableSpeedRadps: HISTORICAL_ACTIONABLE_SPEED_RADPS,
    sustainedActionSpeedRadps: SUSTAINED_ACTION_SPEED_RADPS,
  },
  methods: {
    productRuntimeModified: false,
    note: "Harness reproduces product body/ground/shape/revolute construction directly from realizeFreedomSource and box3d.js; parameter changes exist only inside this diagnostic script.",
  },
  summaries: {
    solver60Nm: summarizeSolverResolution(solverRows, 60),
    solver100Nm: summarizeSolverResolution(solverRows, 100),
    bestSolver60,
    bestSolver100,
    frictionBreakaway: frictionSummary,
    safeVelocityServoConditionCount: safeServoRows.length,
    groundedSafeVelocityServoConditionCount: groundedSafeServoRows.length,
    groundedSafeVelocityServoConditions: groundedSafeServoRows.map((row) => ({
      label: row.label,
      maxTorqueNm: row.effortNm,
      targetSpeedRadps: row.targetSpeedRadps,
      meanTailAbsSpeedRadps: row.meanTailAbsSpeedRadps,
      peakAbsSpeedRadps: row.peakAbsSpeedRadps,
      maxAnchorErrorM: row.maxAnchorErrorM,
      commandSignChanges: row.commandSignChanges,
    })),
    damping: dampingRows.map((row) => ({
      angularDamping: row.angularDamping,
      peakAbsSpeedRadps: row.peakAbsSpeedRadps,
      meanTailAbsSpeedRadps: row.meanTailAbsSpeedRadps,
      maxAnchorErrorM: row.maxAnchorErrorM,
      constraintSafe: row.maxAnchorErrorM < ANCHOR_LIMIT_M,
    })),
    firstSafeDamping: firstSafeDamping === null ? null : {
      angularDamping: firstSafeDamping.angularDamping,
      peakAbsSpeedRadps: firstSafeDamping.peakAbsSpeedRadps,
      meanTailAbsSpeedRadps: firstSafeDamping.meanTailAbsSpeedRadps,
      maxAnchorErrorM: firstSafeDamping.maxAnchorErrorM,
    },
  },
  results,
};

await mkdir("test-results", { recursive: true });
await writeFile("test-results/constraint-safe-actuation-envelope.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
