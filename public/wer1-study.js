(() => {
  "use strict";
  const D = window.__WER1_STUDY_DATA__;
  if (!D) throw new Error("WER-1 study data missing");
  const STORE = "anvil.wer1.owner-study.v1";
  const overlay = document.getElementById("study-overlay");
  const frame = document.getElementById("anvil-frame");
  const badge = document.getElementById("study-badge");
  const F = {"x-":[-1,0,0],"x+":[1,0,0],"y-":[0,-1,0],"y+":[0,1,0],"z-":[0,0,-1],"z+":[0,0,1]};
  const O = {"x-":"x+","x+":"x-","y-":"y+","y+":"y-","z-":"z+","z+":"z-"};
  const add=(a,b)=>a.map((v,i)=>v+b[i]), scale=(a,s)=>a.map(v=>v*s), sub=(a,b)=>a.map((v,i)=>v-b[i]);
  const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0), cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm=v=>{const m=Math.hypot(...v); return m<1e-9?[0,0,0]:scale(v,1/m)};
  const key=g=>g.join(",");
  const blank=()=>({schema:"anvil-wer1-owner-study/v1",executable:D.executable,startedAt:null,completedAt:null,index:0,results:[],pairFeedback:[],recording:"not-requested"});
  const load=()=>{try{const v=JSON.parse(localStorage.getItem(STORE)||"null");return v?.schema==="anvil-wer1-owner-study/v1"?v:blank()}catch{return blank()}};
  let state=load(), active=null, recorder=null, stream=null, chunks=[], videoBlob=null;
  const save=()=>localStorage.setItem(STORE,JSON.stringify(state));
  const btn=(id,t,c="")=>`<button id="${id}" class="${c}">${t}</button>`;
  const card=h=>{overlay.hidden=false;overlay.innerHTML=`<div class="study-card">${h}</div>`};
  const hide=()=>{overlay.hidden=true;overlay.innerHTML=""};
  const wait=(el,n,v,ms=3000)=>new Promise((res,rej)=>{const t=performance.now();(function q(){if(el.dataset[n]===String(v))return res();if(performance.now()-t>ms)return rej(new Error(`timeout ${n}=${v}; got ${el.dataset[n]}`));setTimeout(q,20)})()});
  const raf2=w=>new Promise(r=>w.requestAnimationFrame(()=>w.requestAnimationFrame(r)));

  async function startRecording(){
    try{
      if(!navigator.mediaDevices?.getDisplayMedia||typeof MediaRecorder==="undefined")throw new Error("unavailable");
      stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:30},audio:false});
      chunks=[]; recorder=new MediaRecorder(stream,{mimeType:MediaRecorder.isTypeSupported("video/webm;codecs=vp9")?"video/webm;codecs=vp9":"video/webm"});
      recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)}; recorder.onstop=()=>videoBlob=new Blob(chunks,{type:recorder.mimeType||"video/webm"}); recorder.start(1000);
      state.recording="started";
    }catch(e){state.recording=`unavailable-or-declined:${e?.name||"error"}`}
    save();
  }
  function stopRecording(){if(recorder&&recorder.state!=="inactive")recorder.stop();stream?.getTracks().forEach(t=>t.stop())}
  function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
  const downloadJson=()=>download(new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),`ANVIL-WER1-${Date.now()}.json`);

  function intro(){
    card(`<div class="study-kicker">PROJECT ANVIL · WER-1</div><h1>Trained-Owner comparative gate</h1><p>16 krótkich prób. Działaj normalnie i nie próbuj zgadywać wariantu. Bez think-aloud podczas pomiaru; feedback pojawi się po każdej parze.</p><p class="study-small">Nagranie jest lokalne. Jeśli wybierzesz nagrywanie, przeglądarka poprosi o bieżącą kartę/okno.</p><div class="study-actions">${btn("rec","Start z nagrywaniem","primary")}${btn("norec","Start bez nagrania")}${btn("reset","Wyczyść run")}</div>`);
    document.getElementById("rec").onclick=async()=>{await startRecording();begin()};
    document.getElementById("norec").onclick=()=>{state.recording="not-captured";save();begin()};
    document.getElementById("reset").onclick=()=>{localStorage.removeItem(STORE);state=blank();intro()};
  }
  function begin(){state.startedAt ||= new Date().toISOString();save();loadTrial(state.index)}

  const model=()=>({next:2,cells:new Map([["0,0,0",{id:"matter:1",grid:[0,0,0]}]])});
  function camera(m){
    const cs=[...m.cells.values()].map(c=>c.grid.map(v=>(v+.5)*.5));
    const mn=[0,1,2].map(i=>Math.min(...cs.map(c=>c[i]))), mx=[0,1,2].map(i=>Math.max(...cs.map(c=>c[i]))), target=mn.map((v,i)=>(v+mx[i])/2);
    const extent=Math.max(mx[0]-mn[0],mx[1]-mn[1],mx[2]-mn[2],.5); return {yaw:-.72,pitch:.48,distance:Math.max(3,extent*2.4+2),target};
  }
  function project(p,rect,c){
    const co=Math.cos(c.pitch),pos=[c.target[0]+c.distance*co*Math.sin(c.yaw),c.target[1]+c.distance*Math.sin(c.pitch),c.target[2]+c.distance*co*Math.cos(c.yaw)];
    const f=norm(sub(c.target,pos)),r=norm(cross(f,[0,1,0])),u=norm(cross(r,f)),rel=sub(p,pos),dep=dot(rel,f),focal=rect.height/(2*Math.tan((Math.PI/3.2)/2));
    return {x:rect.width/2+dot(rel,r)/dep*focal,y:rect.height/2-dot(rel,u)/dep*focal};
  }
  const center=g=>g.map(v=>(v+.5)*.5), facePoint=(g,f)=>add(center(g),scale(F[f],.25));
  function patchCapture(c){
    Object.defineProperty(c,"setPointerCapture",{configurable:true,value:()=>{}});Object.defineProperty(c,"releasePointerCapture",{configurable:true,value:()=>{}});Object.defineProperty(c,"hasPointerCapture",{configurable:true,value:()=>false});
    return ()=>{delete c.setPointerCapture;delete c.releasePointerCapture;delete c.hasPointerCapture};
  }
  function ptr(ctx,type,x,y){const r=ctx.canvas.getBoundingClientRect();ctx.canvas.dispatchEvent(new ctx.win.PointerEvent(type,{bubbles:true,cancelable:true,pointerId:731,button:0,buttons:type==="pointerup"?0:1,clientX:r.left+x,clientY:r.top+y}))}
  const keydown=(ctx,k)=>ctx.win.dispatchEvent(new ctx.win.KeyboardEvent("keydown",{key:k,bubbles:true,cancelable:true}));
  function updateModel(m,from,f,count){
    for(let i=1;i<=count;i++){const g=add(from,scale(F[f],i)),s=key(g);if(m.cells.has(s))break;m.cells.set(s,{id:`matter:${m.next++}`,grid:g})}
  }
  async function extrude(ctx,m,from,f,count){
    ctx.doc.querySelector('[data-action="focus"]').click();await raf2(ctx.win);const r=ctx.canvas.getBoundingClientRect(),c=camera(m),p0=project(facePoint(from,f),r,c),p1=project(add(facePoint(from,f),scale(F[f],.5)),r,c),dx=p1.x-p0.x,dy=p1.y-p0.y;
    ptr(ctx,"pointerdown",p0.x,p0.y);ptr(ctx,"pointermove",p0.x+dx*(count-1),p0.y+dy*(count-1));ptr(ctx,"pointerup",p0.x+dx*(count-1),p0.y+dy*(count-1));updateModel(m,from,f,count);await wait(ctx.shell,"cells",m.cells.size);await raf2(ctx.win);
  }
  function target(m,pair){
    const a=m.cells.get(key(pair[0])),b=m.cells.get(key(pair[1]));if(!a||!b)throw new Error("target cells missing");const d=sub(pair[1],pair[0]);const fa=Object.keys(F).find(f=>F[f].every((v,i)=>v===d[i]));if(!fa)throw new Error("target nonadjacent");return {a,b,fa,fb:O[fa],tokens:[`${a.id}@${fa}`,`${b.id}@${O[fa]}`]};
  }
  async function clickTarget(ctx,m,t){ctx.doc.querySelector('[data-action="focus"]').click();await raf2(ctx.win);const p=project(facePoint(t.a.grid,t.fa),ctx.canvas.getBoundingClientRect(),camera(m));ptr(ctx,"pointerdown",p.x,p.y);ptr(ctx,"pointerup",p.x,p.y);await raf2(ctx.win)}

  async function setup(trial){
    frame.src=`./?wer1=${trial.policy}`;await new Promise((res,rej)=>{const x=setTimeout(()=>rej(new Error("iframe load timeout")),8000);frame.onload=()=>{clearTimeout(x);res()}});
    const win=frame.contentWindow,doc=frame.contentDocument,shell=doc?.querySelector(".r2-studio"),canvas=doc?.querySelector("canvas[data-r2-world]");if(!win||!doc||!shell||!canvas)throw new Error("R2 iframe incomplete");await wait(shell,"cells",3);
    const restore=patchCapture(canvas),ctx={win,doc,shell,canvas};try{
      doc.querySelector('[data-action="new"]').click();doc.querySelector('[data-action="seed"]').click();await wait(shell,"cells",1);const m=model(),s=D.scenes[trial.scene];for(const [from,f,n] of s.commands)await extrude(ctx,m,from,f,n);const t=target(m,s.target);
      if(trial.sub==="N"){keydown(ctx,"b");await raf2(win);await clickTarget(ctx,m,t);await wait(shell,"bearings",1);ptr(ctx,"pointerdown",8,8);ptr(ctx,"pointerup",8,8);await raf2(win)}
      doc.querySelector('[data-action="focus"]').click();await raf2(win);return{ctx,m,t,restore};
    }catch(e){restore();throw e}
  }
  function contextCorrect(ctx,t){const p=ctx.doc.querySelector("[data-r2-context]");if(!p||p.hidden)return false;const txt=p.textContent||"";return t.tokens.every(x=>txt.includes(x))&&!!p.querySelector("[data-bearing]")}
  const task=t=>D.tasks[t.sub];

  async function loadTrial(i){
    if(i>=D.trials.length)return finish();const tr=D.trials[i];active=null;badge.hidden=true;card(`<div class="study-kicker">Przygotowanie ${i+1}/${D.trials.length}</div><h2>Ładuję scenę…</h2>`);
    try{const p=await setup(tr);p.restore();active={...p,tr,i,start:null,last:null,path:0,events:[],rel:0,wrong:0,b:0,firstMs:null,firstOk:null};card(`<div class="study-kicker">Próba ${i+1}/${D.trials.length} · ${tr.sub}</div><h2>Gotowe</h2><p class="study-task">${task(tr)}</p><p class="study-small">Scena: ${p.m.cells.size} Matter. Pomiar zaczyna się po Start.</p><div class="study-actions">${btn("go","Start","primary")}</div>`);document.getElementById("go").onclick=startTrial}
    catch(e){card(`<div class="study-kicker">STUDY-HARNESS RED</div><h2>Fixture setup nie przeszedł</h2><p>${String(e?.message||e)}</p><p>Nie interpretuj tego jako wyniku UX.</p>`)}
  }
  function startTrial(){
    const t=active;if(!t)return;hide();badge.hidden=false;t.start=performance.now();t.ctx.canvas.addEventListener("pointermove",e=>{if(!t.start)return;if(t.last)t.path+=Math.hypot(e.clientX-t.last.x,e.clientY-t.last.y);t.last={x:e.clientX,y:e.clientY}},{passive:true});
    t.ctx.win.addEventListener("keydown",e=>{if(t.start&&e.key.toLowerCase()==="b")t.b++});t.ctx.shell.addEventListener("anvil-r2-input",e=>{if(!t.start)return;const ch=e.detail?.channel||"unknown",at=performance.now()-t.start;t.events.push({atMs:Math.round(at),channel:ch});if((t.tr.sub==="N"&&ch==="context")||(t.tr.sub==="A"&&ch==="bearing"))setTimeout(()=>relevant(t,at),0)});
  }
  function relevant(t,at){if(!t.start)return;t.rel++;t.firstMs??=Math.round(at);const ok=contextCorrect(t.ctx,t.t);t.firstOk??=ok;if(!ok){t.wrong++;return}complete(t)}
  function complete(t){
    const ms=Math.round(performance.now()-t.start);t.start=null;badge.hidden=true;const r={trialId:t.tr.id,subtest:t.tr.sub,pair:t.tr.pair,policy:t.tr.policy,scene:t.tr.scene,matterCount:t.m.cells.size,targetEndpoints:t.t.tokens,completionMs:ms,firstRelevantMs:t.firstMs,firstRelevantCorrect:t.firstOk,wrongRelevantActions:t.wrong,relevantActions:t.rel,bActivations:t.b,cursorPathPx:Math.round(t.path),events:t.events,localWakeRadiusPx:t.tr.policy==="local"?D.localWakeRadiusPx:null};state.results.push(r);state.index=t.i+1;save();if(t.i%2===1)feedback(t.tr.pair);else doneCard(r)
  }
  function doneCard(r){card(`<div class="study-kicker">Próba zakończona</div><h2>OK</h2><dl class="study-result-grid"><dt>Czas</dt><dd>${(r.completionMs/1000).toFixed(2)} s</dd><dt>Pierwsza akcja poprawna</dt><dd>${r.firstRelevantCorrect?"tak":"nie"}</dd><dt>Błędne akcje</dt><dd>${r.wrongRelevantActions}</dd></dl><div class="study-actions">${btn("next","Następna","primary")}</div>`);document.getElementById("next").onclick=()=>loadTrial(state.index)}
  function feedback(pair){
    card(`<div class="study-kicker">Para ${pair} zakończona</div><h2>Krótkie wrażenie</h2><p>Która z dwóch ostatnich prób lepiej wspierała zadanie?</p><div class="study-actions">${btn("p1","Pierwsza")}${btn("p2","Druga")}${btn("ps","Bez różnicy")}${btn("pu","Nie wiem")}</div><textarea id="note" placeholder="Opcjonalna uwaga: clutter, hunting, magnetyczność, naturalność…"></textarea>`);
    [["p1","first"],["p2","second"],["ps","same"],["pu","unsure"]].forEach(([id,choice])=>document.getElementById(id).onclick=()=>{state.pairFeedback.push({pair,choice,note:document.getElementById("note").value.trim()});save();loadTrial(state.index)})
  }
  function finish(){state.completedAt ||= new Date().toISOString();save();stopRecording();card(`<div class="study-kicker">WER-1 · Owner run complete</div><h1>Run zakończony</h1><p>Harness nie interpretuje wyniku. Pobierz JSON i prześlij go do analizy.</p><div class="study-actions">${btn("json","Pobierz JSON","primary")}${btn("video","Pobierz nagranie")}${btn("restart","Nowy run")}</div>`);document.getElementById("json").onclick=downloadJson;document.getElementById("video").onclick=()=>videoBlob&&download(videoBlob,`ANVIL-WER1-${Date.now()}.webm`);document.getElementById("restart").onclick=()=>{localStorage.removeItem(STORE);location.reload()}}

  window.__WER1_STUDY__={data:D,loadState:()=>state,loadTrial,getActive:()=>active?{trial:active.tr,index:active.i,matterCount:active.m.cells.size,targetEndpoints:active.t.tokens}:null,debugCompleteTarget:async()=>{if(!active)throw new Error("no active trial");if(!active.start)startTrial();if(active.tr.sub==="A")keydown(active.ctx,"b");await raf2(active.ctx.win);await clickTarget(active.ctx,active.m,active.t)}};
  if(state.completedAt)finish();else if(state.startedAt&&state.index>0)loadTrial(state.index);else intro();
})();
