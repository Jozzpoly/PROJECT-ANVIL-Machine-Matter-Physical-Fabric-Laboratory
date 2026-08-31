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
const ZERO = { x: 0, y: 0, z: 0 };
const GROUND_TOP_Y = -0.26;
const GROUND_HALF_H = 0.5;
const GROUND_HALF_EXTENT = 10;
const MAX_TORQUE_NM = 1000;
const SUBSTEPS = [4, 24];
const TARGETS = [10, 20];
const DIRECT_FRICTIONS = [0, 0.8];
const DROP_ELEVATIONS_M = [0.1, 0.5, 2.0];

const add = (a,b) => ({ x:a.x+b.x, y:a.y+b.y, z:a.z+b.z });
const sub = (a,b) => ({ x:a.x-b.x, y:a.y-b.y, z:a.z-b.z });
const scale = (v,s) => ({ x:v.x*s, y:v.y*s, z:v.z*s });
const dot = (a,b) => a.x*b.x + a.y*b.y + a.z*b.z;
const cross = (a,b) => ({ x:a.y*b.z-a.z*b.y, y:a.z*b.x-a.x*b.z, z:a.x*b.y-a.y*b.x });
const mag = (v) => Math.hypot(v.x,v.y,v.z);
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const mean = (xs) => xs.length ? xs.reduce((s,v)=>s+v,0)/xs.length : 0;
function rotate(q,v){ const qv={x:q.x,y:q.y,z:q.z}; const t=cross(qv,v); const d=scale(t,2); return add(v,add(scale(d,q.w),cross(qv,d))); }
function rq(q){ return { x:q.v.x,y:q.v.y,z:q.v.z,w:q.s }; }
function bq(q){ return { v:{x:q.x,y:q.y,z:q.z}, s:q.w }; }
function hullPoints(body,c){ const center=sub(c.centerWorld,body.centerOfMassWorld),h=c.halfExtentsM,out=[]; for(const dx of[-1,1])for(const dy of[-1,1])for(const dz of[-1,1])out.push(center.x+dx*h.x,center.y+dy*h.y,center.z+dz*h.z); return out; }

function makeFixture(axis){
  const workspace = new FreedomWorkspace(createFreedomStarterSource());
  const bearingId = workspace.addBearing({cellId:"starter:a",face:"x+"},{cellId:"starter:b",face:"x-"},axis);
  workspace.addTorquePatch({cellId:"starter:a",face:"x+"},MAX_TORQUE_NM);
  const source = workspace.snapshot().source;
  const plan = realizeFreedomSource(source);
  assert.equal(plan.quality,"COMPLETE");
  const relation = plan.bearings.find(r=>r.sourceBearingId===bearingId);
  const torque = plan.torques[0];
  assert.ok(relation && torque);
  return { source, plan, relation, torque };
}

function anchorError(b3,ids,relation){
  const a=ids.get(relation.bodyAId), b=ids.get(relation.bodyBId); assert.ok(a&&b);
  const pa=b3.b3Body_GetPosition(a), pb=b3.b3Body_GetPosition(b), qa=rq(b3.b3Body_GetRotation(a)), qb=rq(b3.b3Body_GetRotation(b));
  return mag(sub(add(pa,rotate(qa,relation.localAnchorA)),add(pb,rotate(qb,relation.localAnchorB))));
}
function relativeSpeed(b3,ids,relation){
  const a=ids.get(relation.bodyAId), b=ids.get(relation.bodyBId); assert.ok(a&&b);
  return dot(sub(b3.b3Body_GetAngularVelocity(b),b3.b3Body_GetAngularVelocity(a)),relation.axisWorld);
}
function bodyBottomY(b3,id,body){
  const p=b3.b3Body_GetPosition(id), q=rq(b3.b3Body_GetRotation(id)); let minY=Infinity;
  for(const collider of body.colliders){
    const centerLocal=sub(collider.centerWorld,body.centerOfMassWorld),h=collider.halfExtentsM;
    for(const dx of[-1,1])for(const dy of[-1,1])for(const dz of[-1,1]){
      const local=add(centerLocal,{x:dx*h.x,y:dy*h.y,z:dz*h.z});
      minY=Math.min(minY,add(p,rotate(q,local)).y);
    }
  }
  return minY;
}
function minimumClearance(b3,ids,plan,relation){
  let min=Infinity;
  for(const bodyId of [relation.bodyAId,relation.bodyBId]){
    const id=ids.get(bodyId), body=plan.physicalPlan.bodies.find(x=>x.id===bodyId); assert.ok(id&&body);
    min=Math.min(min,bodyBottomY(b3,id,body)-GROUND_TOP_Y);
  }
  return min;
}
function finiteState(b3,ids){
  for(const id of ids.values()){
    const p=b3.b3Body_GetPosition(id),q=b3.b3Body_GetRotation(id),lv=b3.b3Body_GetLinearVelocity(id),av=b3.b3Body_GetAngularVelocity(id);
    if(![p.x,p.y,p.z,q.v.x,q.v.y,q.v.z,q.s,lv.x,lv.y,lv.z,av.x,av.y,av.z].every(Number.isFinite)) return false;
  }
  return true;
}

async function runCondition(b3, condition){
  const fixture=makeFixture(condition.axis);
  const {source,plan,relation,torque}=fixture;
  const materials=new Map(source.matter.materials.map(m=>[m.id,m]));
  const wd=b3.b3DefaultWorldDef(); wd.gravity={...(condition.gravity?GRAVITY:ZERO)}; wd.workerCount=0;
  const world=b3.b3CreateWorld(wd), ids=new Map();
  try{
    if(condition.ground){
      const gd=b3.b3DefaultBodyDef(); gd.position={x:0,y:GROUND_TOP_Y-GROUND_HALF_H,z:0};
      const ground=b3.b3CreateBody(world,gd); const gs=b3.b3DefaultShapeDef(); gs.baseMaterial.friction=condition.friction;
      b3.b3CreateBoxShape(ground,gs,GROUND_HALF_EXTENT,GROUND_HALF_H,GROUND_HALF_EXTENT);
    }
    for(const body of plan.physicalPlan.bodies){
      const bd=b3.b3DefaultBodyDef(); bd.type=b3.b3BodyType.b3_dynamicBody; bd.position={...body.centerOfMassWorld,y:body.centerOfMassWorld.y+condition.elevationM};
      bd.linearDamping=0; bd.angularDamping=0; bd.enableSleep=false; bd.isAwake=true;
      const id=b3.b3CreateBody(world,bd); ids.set(body.id,id);
      for(const c of body.colliders){
        const m=materials.get(c.materialId); assert.ok(m); const h=b3.b3CreateHull(hullPoints(body,c)); assert.ok(h);
        const sd=b3.b3DefaultShapeDef(); sd.density=m.densityKgM3; sd.baseMaterial.friction=m.friction;
        try{ b3.b3CreateHullShape(id,sd,h); } finally { h.delete?.(); }
      }
    }
    const a=ids.get(relation.bodyAId),b=ids.get(relation.bodyBId); assert.ok(a&&b);
    const jd=b3.b3DefaultRevoluteJointDef(); jd.base.bodyIdA=a; jd.base.bodyIdB=b;
    jd.base.localFrameA={p:{...relation.localAnchorA},q:bq(jointFrameForAxis(relation.axisWorld))};
    jd.base.localFrameB={p:{...relation.localAnchorB},q:bq(jointFrameForAxis(relation.axisWorld))};
    jd.base.collideConnected=false; b3.b3CreateRevoluteJoint(world,jd);

    let simStep=0, firstContactStep=null, firstRedStep=null, maxAnchorSettle=anchorError(b3,ids,relation);
    let maxAnchorBeforeContact=maxAnchorSettle, maxAnchorAfterContact=0, minClearance=minimumClearance(b3,ids,plan,relation);
    const contactThresholdM=0.001;
    const observe=()=>{
      const anchor=anchorError(b3,ids,relation), clearance=minimumClearance(b3,ids,plan,relation);
      minClearance=Math.min(minClearance,clearance);
      if(condition.ground && firstContactStep===null && clearance<=contactThresholdM) firstContactStep=simStep;
      if(firstContactStep===null) maxAnchorBeforeContact=Math.max(maxAnchorBeforeContact,anchor); else maxAnchorAfterContact=Math.max(maxAnchorAfterContact,anchor);
      if(firstRedStep===null && anchor>=ANCHOR_LIMIT_M) firstRedStep=simStep;
      return {anchor,clearance};
    };

    const settleSteps=Math.round(condition.settleS/DT);
    for(let i=0;i<settleSteps;i++){ simStep++; b3.b3World_Step(world,DT,condition.substeps); const o=observe(); maxAnchorSettle=Math.max(maxAnchorSettle,o.anchor); }

    const driveSteps=Math.round(condition.driveS/DT); let peakSpeed=0,maxAnchorDrive=anchorError(b3,ids,relation); const tail=[]; let firstDrivenRedStep=null;
    for(let i=1;i<=driveSteps;i++){
      const v=relativeSpeed(b3,ids,relation); const cmd=clamp((condition.targetSpeedRadps-v)/Math.abs(condition.targetSpeedRadps),-1,1);
      b3.b3Body_ApplyTorque(a,scale(torque.torqueAWorld,cmd),true); b3.b3Body_ApplyTorque(b,scale(torque.torqueBWorld,cmd),true);
      simStep++; b3.b3World_Step(world,DT,condition.substeps);
      const speed=Math.abs(relativeSpeed(b3,ids,relation)),o=observe(); peakSpeed=Math.max(peakSpeed,speed); maxAnchorDrive=Math.max(maxAnchorDrive,o.anchor);
      if(firstDrivenRedStep===null && o.anchor>=ANCHOR_LIMIT_M) firstDrivenRedStep=i;
      if(i>driveSteps-60) tail.push(speed);
    }
    const meanTailSpeed=mean(tail);
    return {
      ...condition,
      maxAnchorSettleM:maxAnchorSettle,
      maxAnchorDriveM:maxAnchorDrive,
      maxAnchorBeforeContactM:maxAnchorBeforeContact,
      maxAnchorAfterContactM:maxAnchorAfterContact,
      minClearanceM:minClearance,
      firstContactTimeS:firstContactStep===null?null:firstContactStep*DT,
      firstRedTimeS:firstRedStep===null?null:firstRedStep*DT,
      firstDrivenRedTimeS:firstDrivenRedStep===null?null:firstDrivenRedStep*DT,
      redBeforeContact:firstRedStep!==null && (firstContactStep===null || firstRedStep<firstContactStep),
      peakAbsSpeedRadps:peakSpeed,
      meanTailAbsSpeedRadps:meanTailSpeed,
      actionable:meanTailSpeed>=ACTION_SPEED_RADPS,
      integrityPass:maxAnchorDrive<ANCHOR_LIMIT_M,
      finite:finiteState(b3,ids),
    };
  } finally { if(b3.b3World_IsValid(world)) b3.b3DestroyWorld(world); }
}

const conditions=[];
for(const substeps of SUBSTEPS) for(const axis of ["y","z"]) for(const targetSpeedRadps of TARGETS){
  conditions.push({label:`neutral-${axis}-s${substeps}-t${targetSpeedRadps}`,axis,substeps,targetSpeedRadps,gravity:false,ground:false,friction:null,elevationM:0,settleS:0,driveS:10,mode:"neutral"});
  conditions.push({label:`gravity-only-${axis}-s${substeps}-t${targetSpeedRadps}`,axis,substeps,targetSpeedRadps,gravity:true,ground:false,friction:null,elevationM:0,settleS:0,driveS:10,mode:"gravity-only"});
  for(const friction of DIRECT_FRICTIONS) conditions.push({label:`grounded-${axis}-f${friction}-s${substeps}-t${targetSpeedRadps}`,axis,substeps,targetSpeedRadps,gravity:true,ground:true,friction,elevationM:0,settleS:1.5,driveS:10,mode:"grounded-settled"});
  for(const elevationM of DROP_ELEVATIONS_M) conditions.push({label:`drop-${axis}-h${elevationM}-s${substeps}-t${targetSpeedRadps}`,axis,substeps,targetSpeedRadps,gravity:true,ground:true,friction:0.8,elevationM,settleS:0,driveS:10,mode:"drop-into-contact"});
}

await mkdir("artifacts/contact-constraint-geometry-falsifier",{recursive:true});
const b3=await Box3DFactory(); const ver=b3.b3GetVersion(); assert.deepEqual([ver.major,ver.minor,ver.revision],[0,1,0]);
const rows=[]; for(const condition of conditions) rows.push(await runCondition(b3,condition));

function group(mode,axis,substeps,target,friction=null){ return rows.filter(r=>r.mode===mode&&r.axis===axis&&r.substeps===substeps&&r.targetSpeedRadps===target&&(friction===null||r.friction===friction)); }
const discriminators=[];
for(const substeps of SUBSTEPS) for(const target of TARGETS){
  const nz=group("neutral","z",substeps,target)[0], gz=group("gravity-only","z",substeps,target)[0], g0=group("grounded-settled","z",substeps,target,0)[0], g8=group("grounded-settled","z",substeps,target,0.8)[0];
  const ny=group("neutral","y",substeps,target)[0], gy=group("grounded-settled","y",substeps,target,0.8)[0];
  discriminators.push({substeps,targetSpeedRadps:target,neutralZ:nz.maxAnchorDriveM,gravityOnlyZ:gz.maxAnchorDriveM,groundFriction0Z:g0.maxAnchorDriveM,groundFriction08Z:g8.maxAnchorDriveM,neutralY:ny.maxAnchorDriveM,groundY:gy.maxAnchorDriveM});
}
const dropRows=rows.filter(r=>r.mode==="drop-into-contact");
const airborneSafeThenContactRed=dropRows.filter(r=>r.firstContactTimeS!==null&&!r.redBeforeContact&&r.maxAnchorBeforeContactM<ANCHOR_LIMIT_M&&r.maxAnchorDriveM>=ANCHOR_LIMIT_M);
const zNeutralSafe=rows.filter(r=>r.axis==="z"&&r.mode==="neutral").every(r=>r.integrityPass);
const zGravityOnlySafe=rows.filter(r=>r.axis==="z"&&r.mode==="gravity-only").every(r=>r.integrityPass);
const zGroundHasRed=rows.some(r=>r.axis==="z"&&r.mode==="grounded-settled"&&!r.integrityPass);
const yGroundMostlySafe=rows.filter(r=>r.axis==="y"&&r.mode==="grounded-settled"&&r.friction===0.8).every(r=>r.integrityPass);
let verdict="MIXED_CONTACT_CONSTRAINT_RESULT";
if(zNeutralSafe&&zGravityOnlySafe&&zGroundHasRed&&airborneSafeThenContactRed.length>0) verdict="CONTACT_CONSTRAINT_CAUSAL_CONFIRMED";
else if(!zNeutralSafe) verdict="REVOLUTE_OR_ACTUATION_RED_WITHOUT_CONTACT";
else if(zNeutralSafe&&!zGravityOnlySafe) verdict="GRAVITY_AXIS_LOAD_RED_WITHOUT_CONTACT";
const result={schema:"anvil-contact-constraint-geometry-falsifier/0",sourceSha:process.env.GITHUB_SHA??null,productBaseSha:"29c83ea3256a15923a7db648f2b03c7481223b42",anchorLimitM:ANCHOR_LIMIT_M,maxTorqueNm:MAX_TORQUE_NM,rows,discriminators,airborneSafeThenContactRedCount:airborneSafeThenContactRed.length,airborneSafeThenContactRed:airborneSafeThenContactRed.map(r=>r.label),zNeutralSafe,zGravityOnlySafe,zGroundHasRed,yGroundMostlySafe,verdict};
await writeFile("artifacts/contact-constraint-geometry-falsifier/result.json",`${JSON.stringify(result,null,2)}\n`,`utf8`);
console.log(JSON.stringify(result,null,2));
