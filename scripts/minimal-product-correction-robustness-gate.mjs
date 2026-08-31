import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import Box3DFactory from "box3d.js/inline";
import { jointFrameForAxis } from "../.test-build/src/experiments/anvil-02-bearing.js";
import { realizeFreedomSource } from "../.test-build/src/studio-recovery/realize.js";
import { FreedomWorkspace, createFreedomStarterSource } from "../.test-build/src/studio-recovery/source.js";

const DT = 1 / 60;
const LIMIT = 0.003;
const GRAVITY = { x: 0, y: -10, z: 0 };
const GROUND_TOP = -0.26;
const GROUND_HALF_H = 0.5;
const GROUND_HALF_EXTENT = 10;
const GROUND_FRICTION = 0.8;
const SUBSTEPS = [4, 6, 8, 10, 12, 16, 24, 32];
const TARGETS = [18, 20, 22];
const DURATIONS = [2, 5, 10];

const add=(a,b)=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z});
const sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
const scale=(v,s)=>({x:v.x*s,y:v.y*s,z:v.z*s});
const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
const cross=(a,b)=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
const mag=(v)=>Math.hypot(v.x,v.y,v.z);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mean=(xs)=>xs.length?xs.reduce((s,v)=>s+v,0)/xs.length:0;
function rotate(q,v){const qv={x:q.x,y:q.y,z:q.z};const t=cross(qv,v);const d=scale(t,2);return add(v,add(scale(d,q.w),cross(qv,d)));}
function rq(q){return{x:q.v.x,y:q.v.y,z:q.v.z,w:q.s};}
function bq(q){return{v:{x:q.x,y:q.y,z:q.z},s:q.w};}
function hullPoints(body,c){const center=sub(c.centerWorld,body.centerOfMassWorld),h=c.halfExtentsM,out=[];for(const dx of[-1,1])for(const dy of[-1,1])for(const dz of[-1,1])out.push(center.x+dx*h.x,center.y+dy*h.y,center.z+dz*h.z);return out;}

const workspace=new FreedomWorkspace(createFreedomStarterSource());
const bearingId=workspace.addBearing({cellId:"starter:a",face:"x+"},{cellId:"starter:b",face:"x-"},"z");
workspace.addTorquePatch({cellId:"starter:a",face:"x+"},1000);
const source=workspace.snapshot().source;
const plan=realizeFreedomSource(source);
assert.equal(plan.quality,"COMPLETE");
const relation=plan.bearings.find(r=>r.sourceBearingId===bearingId);
const torque=plan.torques[0];
assert.ok(relation&&torque);
const materials=new Map(source.matter.materials.map(m=>[m.id,m]));

function anchor(b3,ids){
 const a=ids.get(relation.bodyAId),b=ids.get(relation.bodyBId);assert.ok(a&&b);
 const pa=b3.b3Body_GetPosition(a),pb=b3.b3Body_GetPosition(b),qa=rq(b3.b3Body_GetRotation(a)),qb=rq(b3.b3Body_GetRotation(b));
 return mag(sub(add(pa,rotate(qa,relation.localAnchorA)),add(pb,rotate(qb,relation.localAnchorB))));
}
function speed(b3,ids){const a=ids.get(relation.bodyAId),b=ids.get(relation.bodyBId);assert.ok(a&&b);return dot(sub(b3.b3Body_GetAngularVelocity(b),b3.b3Body_GetAngularVelocity(a)),relation.axisWorld);}

async function run(b3,substeps,target,driveS){
 const wd=b3.b3DefaultWorldDef();wd.gravity={...GRAVITY};wd.workerCount=0;const world=b3.b3CreateWorld(wd),ids=new Map();
 try{
  const gd=b3.b3DefaultBodyDef();gd.position={x:0,y:GROUND_TOP-GROUND_HALF_H,z:0};const ground=b3.b3CreateBody(world,gd);const gs=b3.b3DefaultShapeDef();gs.baseMaterial.friction=GROUND_FRICTION;b3.b3CreateBoxShape(ground,gs,GROUND_HALF_EXTENT,GROUND_HALF_H,GROUND_HALF_EXTENT);
  for(const body of plan.physicalPlan.bodies){const bd=b3.b3DefaultBodyDef();bd.type=b3.b3BodyType.b3_dynamicBody;bd.position={...body.centerOfMassWorld};bd.linearDamping=0;bd.angularDamping=0;bd.enableSleep=false;bd.isAwake=true;const id=b3.b3CreateBody(world,bd);ids.set(body.id,id);for(const c of body.colliders){const m=materials.get(c.materialId);assert.ok(m);const h=b3.b3CreateHull(hullPoints(body,c));assert.ok(h);const sd=b3.b3DefaultShapeDef();sd.density=m.densityKgM3;sd.baseMaterial.friction=m.friction;try{b3.b3CreateHullShape(id,sd,h);}finally{h.delete?.();}}}
  const a=ids.get(relation.bodyAId),b=ids.get(relation.bodyBId);assert.ok(a&&b);const jd=b3.b3DefaultRevoluteJointDef();jd.base.bodyIdA=a;jd.base.bodyIdB=b;jd.base.localFrameA={p:{...relation.localAnchorA},q:bq(jointFrameForAxis(relation.axisWorld))};jd.base.localFrameB={p:{...relation.localAnchorB},q:bq(jointFrameForAxis(relation.axisWorld))};jd.base.collideConnected=false;b3.b3CreateRevoluteJoint(world,jd);
  for(let i=0;i<90;i++)b3.b3World_Step(world,DT,substeps);
  const steps=Math.round(driveS/DT);let maxAnchor=anchor(b3,ids),peak=0;const tail=[];let maxCmd=0;
  for(let i=1;i<=steps;i++){const v=speed(b3,ids);const cmd=clamp((target-v)/target,-1,1);maxCmd=Math.max(maxCmd,Math.abs(cmd));b3.b3Body_ApplyTorque(a,scale(torque.torqueAWorld,cmd),true);b3.b3Body_ApplyTorque(b,scale(torque.torqueBWorld,cmd),true);b3.b3World_Step(world,DT,substeps);const s=Math.abs(speed(b3,ids));peak=Math.max(peak,s);maxAnchor=Math.max(maxAnchor,anchor(b3,ids));if(i>steps-60)tail.push(s);}
  const tailSpeed=mean(tail);return{substeps,targetSpeedRadps:target,driveS,maxAnchorErrorM:maxAnchor,peakAbsSpeedRadps:peak,meanTailAbsSpeedRadps:tailSpeed,maxAbsCommandScale:maxCmd,integrityPass:maxAnchor<LIMIT,actionPass:tailSpeed>=1,pass:maxAnchor<LIMIT&&tailSpeed>=1};
 }finally{if(b3.b3World_IsValid(world))b3.b3DestroyWorld(world);}
}

await mkdir("artifacts/minimal-product-correction-gate",{recursive:true});
const b3=await Box3DFactory();const v=b3.b3GetVersion();assert.deepEqual([v.major,v.minor,v.revision],[0,1,0]);
const rows=[];for(const substeps of SUBSTEPS)for(const target of TARGETS)for(const driveS of DURATIONS)rows.push(await run(b3,substeps,target,driveS));
const settings=[];for(const substeps of SUBSTEPS)for(const targetSpeedRadps of TARGETS){const r=rows.filter(x=>x.substeps===substeps&&x.targetSpeedRadps===targetSpeedRadps);settings.push({substeps,targetSpeedRadps,allDurationsPass:r.every(x=>x.pass),worstAnchorErrorM:Math.max(...r.map(x=>x.maxAnchorErrorM)),minimumTailSpeedRadps:Math.min(...r.map(x=>x.meanTailAbsSpeedRadps))});}
const robust=settings.filter(s=>s.allDurationsPass);
const neighborRobust=robust.filter(s=>settings.some(o=>o.targetSpeedRadps===s.targetSpeedRadps&&o.substeps!==s.substeps&&Math.abs(o.substeps-s.substeps)<=2&&o.allDurationsPass));
const result={schema:"anvil-minimal-product-correction-robustness-gate/0",sourceSha:process.env.GITHUB_SHA??null,fixture:"grounded-z-1000-prior",anchorLimitM:LIMIT,rows,settings,robustSettings:robust,neighborRobustSettings:neighborRobust,verdict:neighborRobust.length?"MOTOR_ROBUST_REGION_FOUND":robust.length?"MOTOR_ISOLATED_PASS_ONLY":"MOTOR_NO_LONG_RUN_PASS"};
await writeFile("artifacts/minimal-product-correction-gate/robustness-result.json",`${JSON.stringify(result,null,2)}\n`,`utf8`);console.log(JSON.stringify(result,null,2));
