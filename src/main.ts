import "./style.css";
import { compileMatter } from "./compiler.js";
import { createCollapseFixture } from "./fixture.js";
import type { MatterCell, MatterDocument, PhysicalPlan, Vec3 } from "./model.js";
import { CollapsePhysics, type RuntimeBodySnapshot } from "./physics.js";

const root = document.querySelector<HTMLDivElement>("#app");
if (root === null) throw new Error("missing #app");

root.innerHTML = `
  <header class="topbar">
    <div><p class="eyebrow">PROJECT ANVIL · ANVIL-00</p><h1>COLLAPSE</h1>
    <p class="subtitle">Persistent authored matter → disposable physical representation</p></div>
    <div class="status" id="status">BOOTING</div>
  </header>
  <main class="layout">
    <section class="viewport-card">
      <div class="viewport-head"><div><strong>AUTHORED TRUTH</strong><span>stable cell identity</span></div><div><strong>BOX3D RUNTIME</strong><span>compiled, disposable</span></div></div>
      <canvas id="viewport"></canvas>
      <div class="legend"><span><i class="cell-mark"></i> authored/source cells</span><span><i class="collider-mark"></i> compiled collision boxes</span></div>
    </section>
    <aside class="panel">
      <section><p class="section-label">TOPOLOGY PROBE</p><div class="segmented"><button id="intact" class="active">INTACT</button><button id="cut">REMOVE 1 BRIDGE CELL</button></div><p class="note">The edit changes authored topology. It is not runtime fracture yet; state migration belongs to the next experiment.</p></section>
      <section><p class="section-label">SIMULATION</p><div class="button-row"><button id="run">PAUSE</button><button id="step">STEP</button><button id="reset">RESET</button></div></section>
      <section><p class="section-label">COMPILER RECEIPT</p><dl id="metrics" class="metrics"></dl></section>
      <section><p class="section-label">FALSIFICATION GATES</p><ul id="gates" class="gates"></ul></section>
      <section class="boundary"><p class="section-label">BOUNDARY</p><p><code>MatterDocument</code> contains no physics handles. Runtime body IDs exist only after lowering and are never persisted back into authored truth.</p></section>
    </aside>
  </main>`;

const canvas = document.querySelector<HTMLCanvasElement>("#viewport");
const metrics = document.querySelector<HTMLDListElement>("#metrics");
const gates = document.querySelector<HTMLUListElement>("#gates");
const status = document.querySelector<HTMLDivElement>("#status");
const intactButton = document.querySelector<HTMLButtonElement>("#intact");
const cutButton = document.querySelector<HTMLButtonElement>("#cut");
const runButton = document.querySelector<HTMLButtonElement>("#run");
const stepButton = document.querySelector<HTMLButtonElement>("#step");
const resetButton = document.querySelector<HTMLButtonElement>("#reset");
if (!canvas || !metrics || !gates || !status || !intactButton || !cutButton || !runButton || !stepButton || !resetButton) throw new Error("ANVIL-00 UI failed to bind");
const context = canvas.getContext("2d");
if (context === null) throw new Error("2D canvas unavailable");

let cutBridge = false;
let documentState: MatterDocument = createCollapseFixture(false);
let plan: PhysicalPlan = compileMatter(documentState);
let physics: CollapsePhysics | null = null;
let running = true;
let lastFrame = performance.now();
let accumulator = 0;
let bootError: string | null = null;

function resizeCanvas(): void {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}
window.addEventListener("resize", resizeCanvas); resizeCanvas();

function add(a: Vec3, b: Vec3): Vec3 { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
function subtract(a: Vec3, b: Vec3): Vec3 { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
function cross(a: Vec3, b: Vec3): Vec3 { return { x: a.y*b.z-a.z*b.y, y: a.z*b.x-a.x*b.z, z: a.x*b.y-a.y*b.x }; }
function rotateByQuat(point: Vec3, rotation: RuntimeBodySnapshot["rotation"]): Vec3 {
  const uv = cross(rotation.v, point); const uuv = cross(rotation.v, uv);
  return { x: point.x + 2*(rotation.s*uv.x+uuv.x), y: point.y + 2*(rotation.s*uv.y+uuv.y), z: point.z + 2*(rotation.s*uv.z+uuv.z) };
}
function project(point: Vec3, originX: number, originY: number, scale: number): {x:number;y:number} {
  return { x: originX + (point.x-point.z)*scale, y: originY + (point.x+point.z)*scale*0.32 - point.y*scale };
}
const EDGES: readonly (readonly [number, number])[] = [[0,1],[0,2],[0,4],[1,3],[1,5],[2,3],[2,6],[3,7],[4,5],[4,6],[5,7],[6,7]];
function cubeVertices(center: Vec3, half: Vec3): Vec3[] {
  const out: Vec3[]=[]; for (const dx of [-1,1]) for (const dy of [-1,1]) for (const dz of [-1,1]) out.push({x:center.x+dx*half.x,y:center.y+dy*half.y,z:center.z+dz*half.z}); return out;
}
function drawWireBox(vertices: readonly Vec3[], originX:number, originY:number, scale:number, color:string, width:number, alpha=1): void {
  context.save(); context.strokeStyle=color; context.globalAlpha=alpha; context.lineWidth=width; context.beginPath();
  for (const [ai,bi] of EDGES) { const a=vertices[ai], b=vertices[bi]; if(!a||!b) continue; const pa=project(a,originX,originY,scale), pb=project(b,originX,originY,scale); context.moveTo(pa.x,pa.y); context.lineTo(pb.x,pb.y); }
  context.stroke(); context.restore();
}
function authoredCellCenter(cell: MatterCell): Vec3 { const s=documentState.cellSizeM; return {x:(cell.grid.x+0.5)*s,y:(cell.grid.y+0.5)*s,z:(cell.grid.z+0.5)*s}; }

function drawScene(): void {
  const rect=canvas.getBoundingClientRect(); context.clearRect(0,0,rect.width,rect.height); context.fillStyle="#070b12"; context.fillRect(0,0,rect.width,rect.height);
  const scale=Math.min(46,Math.max(25,rect.width/24)); const left={x:rect.width*0.25,y:rect.height*0.62}, right={x:rect.width*0.74,y:rect.height*0.66};
  const half=documentState.cellSizeM/2; const materials=new Map(documentState.materials.map(m=>[m.id,m] as const));
  for (const cell of documentState.cells) drawWireBox(cubeVertices(authoredCellCenter(cell),{x:half,y:half,z:half}),left.x,left.y,scale,materials.get(cell.materialId)?.displayColor??"#fff",1,0.55);
  for (const body of plan.bodies) { for (const collider of body.colliders) drawWireBox(cubeVertices(collider.centerWorld,collider.halfExtentsM),left.x,left.y,scale,"#b6ff9e",2.2,0.9); const p=project(body.centerOfMassWorld,left.x,left.y,scale); context.fillStyle="#fff"; context.beginPath(); context.arc(p.x,p.y,3.5,0,Math.PI*2); context.fill(); }
  const snapshots=physics?.snapshots()??[]; const snapshotByBody=new Map(snapshots.map(s=>[s.planBodyId,s] as const)); const bodyById=new Map(plan.bodies.map(b=>[b.id,b] as const));
  context.strokeStyle="#1d2b3d"; context.lineWidth=1; for(let line=-5;line<=5;line+=1){ const a=project({x:-4,y:0,z:line},right.x,right.y,scale),b=project({x:4,y:0,z:line},right.x,right.y,scale); context.beginPath();context.moveTo(a.x,a.y);context.lineTo(b.x,b.y);context.stroke(); }
  for(const cell of documentState.cells){ const bodyId=plan.cellToBody[cell.id]; if(!bodyId) continue; const body=bodyById.get(bodyId), snap=snapshotByBody.get(bodyId); if(!body||!snap) continue; const local=subtract(authoredCellCenter(cell),body.centerOfMassWorld); const verts=cubeVertices(local,{x:half,y:half,z:half}).map(v=>add(snap.position,rotateByQuat(v,snap.rotation))); drawWireBox(verts,right.x,right.y,scale,materials.get(cell.materialId)?.displayColor??"#fff",1,0.65); }
  for(const body of plan.bodies){ const snap=snapshotByBody.get(body.id); if(!snap) continue; for(const collider of body.colliders){ const local=subtract(collider.centerWorld,body.centerOfMassWorld); const verts=cubeVertices(local,collider.halfExtentsM).map(v=>add(snap.position,rotateByQuat(v,snap.rotation))); drawWireBox(verts,right.x,right.y,scale,"#b6ff9e",2.2,0.95); } }
}
function formatVec(v:Vec3):string{return `${v.x.toFixed(3)}, ${v.y.toFixed(3)}, ${v.z.toFixed(3)}`;}
function updateDiagnostics():void{
  const totalMass=plan.bodies.reduce((s,b)=>s+b.massKg,0); const maxMassError=physics===null?Number.NaN:Math.max(0,...Object.values(physics.receipt.bodyMassErrorsKg).map(Math.abs)); const first=plan.bodies[0];
  metrics.innerHTML=`<dt>authored cells</dt><dd>${plan.statistics.authoredCells}</dd><dt>rigid bodies</dt><dd>${plan.statistics.rigidBodies}</dd><dt>collision boxes</dt><dd>${plan.statistics.collisionBoxes}</dd><dt>cell / collider reduction</dt><dd>${plan.statistics.reductionRatio.toFixed(2)}×</dd><dt>compiled mass</dt><dd>${totalMass.toFixed(2)} kg</dd><dt>first COM</dt><dd>${first?formatVec(first.centerOfMassWorld):"—"}</dd><dt>Box3D</dt><dd>${physics?.receipt.engineVersion??"loading"}</dd><dt>max mass delta</dt><dd>${Number.isFinite(maxMassError)?`${maxMassError.toExponential(2)} kg`:"—"}</dd>`;
  const checks:readonly [string,boolean,string][]=[
    ["IDENTITY",documentState.cells.every(c=>plan.cellToBody[c.id]!==undefined),"every authored cell maps to a compiled body"],
    ["RIGIDIFICATION",cutBridge?plan.statistics.rigidBodies===2:plan.statistics.rigidBodies===1,cutBridge?"1-cell edit yields two islands":"connected matter yields one body"],
    ["REDUCTION",plan.statistics.collisionBoxes<plan.statistics.authoredCells,"collision representation is smaller than authored matter"],
    ["MASS CROSS-CHECK",Number.isFinite(maxMassError)&&maxMassError<0.05,"compiler mass agrees with independent Box3D shape mass"],
  ];
  gates.innerHTML=checks.map(([n,p,d])=>`<li class="${p?"pass":"fail"}"><strong>${p?"PASS":"FAIL"} · ${n}</strong><span>${d}</span></li>`).join("");
  if(bootError!==null){status.textContent="BLOCKED";status.className="status fail";}else if(checks.every(([,p])=>p)){status.textContent="LIVE EVIDENCE";status.className="status pass";}else{status.textContent="RUNNING";status.className="status";}
}
async function rebuild():Promise<void>{ physics?.dispose(); physics=null; bootError=null; documentState=createCollapseFixture(cutBridge); plan=compileMatter(documentState); try{physics=await CollapsePhysics.create(plan,documentState.materials);}catch(error:unknown){bootError=error instanceof Error?error.message:String(error);console.error(error);} accumulator=0;lastFrame=performance.now();updateDiagnostics();drawScene(); }
intactButton.addEventListener("click",()=>{cutBridge=false;intactButton.classList.add("active");cutButton.classList.remove("active");void rebuild();});
cutButton.addEventListener("click",()=>{cutBridge=true;cutButton.classList.add("active");intactButton.classList.remove("active");void rebuild();});
runButton.addEventListener("click",()=>{running=!running;runButton.textContent=running?"PAUSE":"RUN";});
stepButton.addEventListener("click",()=>{physics?.step();running=false;runButton.textContent="RUN";updateDiagnostics();drawScene();}); resetButton.addEventListener("click",()=>void rebuild());
function frame(now:number):void{const elapsed=Math.min(0.1,(now-lastFrame)/1000);lastFrame=now;if(running&&physics!==null){accumulator+=elapsed;let steps=0;while(accumulator>=1/60&&steps<6){physics.step();accumulator-=1/60;steps+=1;}}drawScene();updateDiagnostics();requestAnimationFrame(frame);}
void rebuild().then(()=>requestAnimationFrame(frame));
