'use strict';
const KEY='lift.v1',$=s=>document.querySelector(s),V=$('#view');
const E=(n,s,mi,ma,inc,w)=>({name:n,sets:s,min:mi,max:ma,inc:inc,start:w});
const OLD_DEFAULT_V1={days:[
 {name:'Workout A',ex:[E('Back Squat',3,5,8,5,40),E('Bench Press',3,5,8,2.5,40),E('Barbell Row',3,6,10,2.5,35),E('Plank (sec)',3,30,60,0,0)]},
 {name:'Workout B',ex:[E('Romanian Deadlift',3,6,10,5,50),E('Overhead Press',3,5,8,2.5,25),E('Lat Pulldown',3,8,12,2.5,40),E('Dumbbell Lunge',2,8,12,2.5,10)]},
 {name:'Workout C',ex:[E('Deadlift',2,3,5,5,60),E('Incline DB Press',3,8,12,2.5,14),E('Pull-up / Assisted',3,5,10,2.5,0),E('Leg Press',2,10,15,5,80),E('Face Pull',2,12,15,2.5,15)]}]};
const OLD_DEFAULT_V2={days:[
 {name:'Workout A',ex:[E('Leg Press (moderate)',3,10,15,5,60),E('Flat DB Bench Press',3,8,12,2.5,14),E('Chest-Supported DB Row',3,8,12,2.5,14),E('Lying Leg Curl',2,10,15,2.5,25),E('Plank (sec)',3,30,60,0,0)]},
 {name:'Workout B',ex:[E('Romanian Deadlift (light)',3,10,15,2.5,20),E('Seated DB Shoulder Press',3,8,12,2.5,10),E('Lat Pulldown',3,8,12,2.5,40),E('Leg Extension',2,10,15,2.5,25),E('Glute Bridge',2,10,15,2.5,20)]},
 {name:'Workout C',ex:[E('Leg Press (moderate)',3,10,15,5,60),E('Incline DB Press',3,8,12,2.5,12),E('Seated Cable Row',3,8,12,2.5,35),E('Lying Leg Curl',2,10,15,2.5,25),E('Face Pull',2,12,15,2.5,15)]}]};
// v3: evidence-based, disc-friendly full body x3 (~60 min). rest = seconds; rir = RIR offset (0 compounds, -1 isolation = 1 closer to failure)
const X=(n,s,mi,ma,inc,w,rest,iso)=>({...E(n,s,mi,ma,inc,w),rest,rir:iso?-1:0});
const DEFAULT={days:[
 {name:'Day A – Bench',ex:[X('Barbell Bench Press',4,5,8,2.5,60,180),X('Leg Press',3,8,12,5,100,150),X('Chest-Supported DB Row',3,8,12,2,22,120),X('Lying Leg Curl',3,10,15,2.5,30,90,1),X('DB Lateral Raise',3,12,20,1,8,60,1),X('Farmer Carry (kg/hand, 40 m)',2,1,1,2,24,90)]},
 {name:'Day B – Pull',ex:[X('Pull-up (+kg)',4,5,10,1.25,0,150),X('Romanian Deadlift (light)',3,8,12,2.5,35,120),X('Seated DB Shoulder Press',3,8,12,2,16,120),X('Bulgarian Split Squat (DB/hand)',3,8,12,2,10,120),X('Incline DB Curl',2,10,15,1,10,60,1),X('Cable Triceps Pushdown',2,10,15,2.5,20,60,1)]},
 {name:'Day C – DB Press',ex:[X('Flat DB Bench Press (DB/hand)',3,8,12,2,22,150),X('Lat Pulldown',3,8,12,2.5,50,120),X('Leg Press (high rep)',3,12,20,5,85,120),X('Leg Extension',2,10,15,2.5,35,90,1),X('Seated Cable Row',3,10,12,2.5,50,90),X('Cable Crunch / Pallof',2,10,15,2.5,25,60,1)]}]};
const PROGRAM_VERSION=3,CAPS={'romanian deadlift (light)':40};
// mesocycle: 4 build weeks (RIR 3,2,2,1) + 1 deload week; 3 sessions = 1 week
const MESO=[3,2,2,1,'deload'];
function mesoWeek(){const n=S.history.filter(h=>h.date>=(S.mesoStart||0)).length;return Math.floor(n/S.program.days.length)%MESO.length}
const isDeload=()=>MESO[mesoWeek()]==='deload';
const rirFor=e=>isDeload()?'4+':Math.max(0,MESO[mesoWeek()]+(e.rir||0));
const cond=`<b>Optional 4th day (pick 1, alternate weekly)</b><div class="muted">• Sprints: 10 min warm-up, 6–8 × 10–15 s hill/bike sprints @ ~90–95%, 2–3 min walk rest<br>• Norwegian 4×4: 4 × 4 min @ 85–95% HRmax, 3 min easy<br>• Zone 2 / bouldering: 45–60 min conversational pace<br>Plus: 7–10k steps daily. Avoid sprints within 24 h before Day B.</div>`;
const k=n=>n.trim().toLowerCase();
let S=load();
function load(){let s=null;try{s=JSON.parse(localStorage.getItem(KEY))}catch(e){}
 if(!s||!s.program)return{program:JSON.parse(JSON.stringify(DEFAULT)),next:0,st:{},history:[],active:null,rest:90,pv:PROGRAM_VERSION,mesoStart:Date.now()};
 if((s.pv||1)<PROGRAM_VERSION){s.oldPrograms=(s.oldPrograms||[]).concat([{pv:s.pv||1,program:s.program,at:Date.now()}]);s.program=JSON.parse(JSON.stringify(DEFAULT));s.next=0;s.migrated=PROGRAM_VERSION;s.mesoStart=Date.now();s.pv=PROGRAM_VERSION;localStorage.setItem(KEY,JSON.stringify(s))}
 return s}
function save(){localStorage.setItem(KEY,JSON.stringify(S))}
const r25=x=>Math.max(0,Math.round(x/2.5)*2.5);
function stat(e){return S.st[k(e.name)]||{w:e.start,fails:0,note:''}}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const e1rm=(w,r)=>w*(1+r/30);
let tab='home',sub=null;
function setTitle(t,back){$('#title').textContent=t;$('#back').classList.toggle('hidden',!back);$('#back').onclick=back||null}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{tab=b.dataset.t;sub=null;render()});
function render(){document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));
 ({home:S.active?vWork:vHome,history:vHistory,progress:vProgress,program:vProgram})[tab]();window.scrollTo(0,0)}

function vHome(){setTitle('Lift');const d=S.program.days[S.next%S.program.days.length],last=S.history[0];
 V.innerHTML=`<div class="card"><div class="muted">Next workout</div><div class="big">${esc(d.name)}</div><div class="muted">Meso week ${mesoWeek()+1}/5 · ${isDeload()?'<b>DELOAD</b>: half sets, same weights, easy':'target RIR '+MESO[mesoWeek()]+' (isolations 1 less)'}</div>
 ${d.ex.map(e=>{const s=stat(e);return`<div class="li"><span>${esc(e.name)}</span><span class="muted">${isDeload()?Math.ceil(e.sets/2):e.sets}×${e.min}–${e.max} @${rirFor(e)} RIR · ${s.w} kg${s.note?`<span class="tag">${s.note}</span>`:''}</span></div>`}).join('')}
 <button class="btn green" id="go">Start ${esc(d.name)}</button></div>
 <div class="card"><div class="muted">Rotation</div><div>${S.program.days.map((x,i)=>i===S.next%S.program.days.length?`<b>${esc(x.name)}</b>`:esc(x.name)).join(' → ')} → …</div>
 <div class="muted" style="margin-top:6px">Train 2–3×/week; the rotation simply continues.</div>
 <button class="btn sec" id="skip">Skip to next day</button></div><div class="card">${cond}</div>
 ${last?`<div class="card"><div class="muted">Last session</div><b>${esc(last.day)}</b> · ${new Date(last.date).toLocaleDateString()}</div>`:''}`;
 $('#go').onclick=start;$('#skip').onclick=()=>{S.next=(S.next+1)%S.program.days.length;save();render()}}

function start(){const di=S.next%S.program.days.length,d=S.program.days[di];
 S.active={di,deload:isDeload(),day:d.name,date:Date.now(),ex:d.ex.map(e=>{const w=stat(e).w;const ls=lastSets(e.name);return{name:e.name,min:e.min,max:e.max,inc:e.inc,rest:e.rest,rir:rirFor(e),last:ls,sets:Array.from({length:isDeload()?Math.ceil(e.sets/2):e.sets},()=>({w,r:e.max,done:false}))}})};save();render()}

function lastSets(n){const h=S.history.find(h=>h.ex.some(x=>k(x.name)===k(n)));return h?h.ex.find(x=>k(x.name)===k(n)).sets.map(s=>s.w+'×'+s.r).join(', '):''}
function vWork(){const a=S.active;setTitle(a.day);
 V.innerHTML=a.ex.map((e,i)=>`<div class="card"><div class="row"><b style="flex:3">${esc(e.name)}</b><span class="muted" style="text-align:right">${e.sets.length}×${e.min}–${e.max}${e.rir!=null?' @'+e.rir+' RIR':''}</span></div>${e.last?`<div class="muted" style="font-size:12px">Last: ${esc(e.last)}</div>`:''}
 <div class="set muted" style="font-size:12px;margin:4px 0"><span class="n">Set</span><span style="text-align:center">kg</span><span style="text-align:center">reps</span><span></span></div>
 ${e.sets.map((s,j)=>`<div class="set ${s.done?'done':''}"><span class="n">${j+1}</span><input inputmode="decimal" data-i="${i}" data-j="${j}" data-f="w" value="${s.w}"><input inputmode="numeric" data-i="${i}" data-j="${j}" data-f="r" value="${s.r}"><button class="chk ${s.done?'done':''}" data-i="${i}" data-j="${j}">✓</button></div>`).join('')}
 <div class="row"><button class="btn sec" data-add="${i}">+ Set</button><button class="btn sec" data-rm="${i}">− Set</button></div></div>`).join('')+
 `<div class="card"><label>Default rest (sec; exercises have their own)</label><input class="f" id="rest" inputmode="numeric" value="${S.rest}">
 <button class="btn green" id="fin">Finish workout</button><button class="btn red" id="cancel">Discard workout</button></div>`;
 V.querySelectorAll('input[data-f]').forEach(n=>n.onchange=()=>{const s=a.ex[n.dataset.i].sets[n.dataset.j];s[n.dataset.f]=parseFloat(n.value.replace(',','.'))||0;
  if(n.dataset.f==='w')a.ex[n.dataset.i].sets.forEach((x,j)=>{if(j>n.dataset.j&&!x.done)x.w=s.w});save();vWork()});
 V.querySelectorAll('.chk').forEach(b=>b.onclick=()=>{const s=a.ex[b.dataset.i].sets[b.dataset.j];s.done=!s.done;save();if(s.done)timer(a.ex[b.dataset.i].rest||S.rest);const y=scrollY;vWork();scrollTo(0,y)});
 V.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{const ss=a.ex[b.dataset.add].sets,l=ss[ss.length-1]||{w:0,r:0};ss.push({w:l.w,r:l.r,done:false});save();const y=scrollY;vWork();scrollTo(0,y)});
 V.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{a.ex[b.dataset.rm].sets.pop();save();const y=scrollY;vWork();scrollTo(0,y)});
 $('#rest').onchange=e=>{S.rest=parseInt(e.target.value)||90;save()};
 $('#fin').onclick=finish;$('#cancel').onclick=()=>{if(confirm('Discard this workout?')){S.active=null;save();render()}}}

function finish(){const a=S.active,done=a.ex.map(e=>({...e,sets:e.sets.filter(s=>s.done)})).filter(e=>e.sets.length);
 if(!done.length){alert('Tick at least one set (✓) first.');return}
 if(!confirm('Finish workout?'))return;
 done.forEach(e=>{const key=k(e.name),st=S.st[key]||{w:0,fails:0},w=Math.max(...e.sets.map(s=>s.w)),top=e.sets.filter(s=>s.w===w);
  if(a.deload){S.st[key]={w:Math.max(...e.sets.map(s=>s.w)),fails:0,note:''};return}const planned=a.ex.find(x=>x.name===e.name).sets.length,all=e.sets.length>=planned&&top.length===e.sets.length;
  if(all&&e.sets.every(s=>s.r>=e.max)){const cap=CAPS[key];st.w=r25(w+e.inc);if(cap&&st.w>cap){st.w=cap;st.note='cap '+cap+' kg'}else st.note=e.inc?'↑ +'+e.inc:'';st.fails=0}
  else if(e.sets.some(s=>s.r<e.min)){st.fails=(st.fails||0)+1;if(st.fails>=2){st.w=r25(w*0.9);st.fails=0;st.note='deload −10%'}else{st.w=w;st.note='hold'}}
  else{st.w=w;st.fails=0;st.note=''}S.st[key]=st});
 S.history.unshift({id:a.date,date:a.date,day:a.day,ex:done.map(e=>({name:e.name,sets:e.sets.map(s=>({w:s.w,r:s.r}))}))});
 S.next=(a.di+1)%S.program.days.length;S.active=null;save();stopT();render()}

let tI=null,tEnd=0;
function timer(sec){tEnd=Date.now()+sec*1000;$('#timer').classList.remove('hidden');clearInterval(tI);tI=setInterval(tick,250);tick()}
function tick(){const l=Math.round((tEnd-Date.now())/1000);if(l<=0){stopT();navigator.vibrate&&navigator.vibrate([200,100,200]);return}$('#tleft').textContent=Math.floor(l/60)+':'+String(l%60).padStart(2,'0')}
function stopT(){clearInterval(tI);$('#timer').classList.add('hidden')}
$('#tplus').onclick=()=>{tEnd+=15000;tick()};$('#tminus').onclick=()=>{tEnd-=15000;tick()};$('#tstop').onclick=stopT;

function vHistory(){setTitle('History');if(!S.history.length){V.innerHTML='<div class="card muted">No workouts yet.</div>';return}
 V.innerHTML=S.history.map((h,i)=>`<div class="card"><div class="row"><b>${esc(h.day)}</b><span class="muted" style="text-align:right">${new Date(h.date).toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'})}</span></div>
 ${h.ex.map(e=>`<div class="li"><span>${esc(e.name)}</span><span class="muted">${e.sets.map(s=>s.w+'×'+s.r).join(', ')}</span></div>`).join('')}
 <button class="x" data-del="${i}">Delete</button></div>`).join('');
 V.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(confirm('Delete this session?')){S.history.splice(+b.dataset.del,1);save();render()}})}

function series(name,mode){return S.history.slice().reverse().map(h=>{const e=h.ex.find(x=>k(x.name)===k(name));if(!e)return null;
 return{t:h.date,v:Math.max(...e.sets.map(s=>mode==='1rm'?e1rm(s.w,s.r):s.w))}}).filter(Boolean)}
function vProgress(){setTitle('Progress');const names=[...new Set([...S.program.days.flatMap(d=>d.ex.map(e=>e.name)),...S.history.flatMap(h=>h.ex.map(e=>e.name))])];
 sub=sub||{n:names[0],m:'1rm'};
 V.innerHTML=`<div class="card"><select class="f" id="pn">${names.map(n=>`<option ${n===sub.n?'selected':''}>${esc(n)}</option>`).join('')}</select>
 <div class="row" style="margin-top:8px"><button class="btn ${sub.m==='1rm'?'':'sec'}" data-m="1rm">Est. 1RM</button><button class="btn ${sub.m==='top'?'':'sec'}" data-m="top">Top weight</button></div>
 <canvas id="cv"></canvas><div class="muted" id="cs"></div></div>`;
 $('#pn').onchange=e=>{sub.n=e.target.value;vProgress()};V.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{sub.m=b.dataset.m;vProgress()});
 draw($('#cv'),series(sub.n,sub.m))}
function draw(c,d){const dpr=devicePixelRatio||1,W=c.clientWidth,H=200;c.width=W*dpr;c.height=H*dpr;const g=c.getContext('2d');g.scale(dpr,dpr);g.font='12px -apple-system,sans-serif';
 if(!d.length){g.fillStyle='#8e8e93';g.fillText('No data yet — log a workout.',10,100);$('#cs').textContent='';return}
 const vs=d.map(p=>p.v),lo=Math.min(...vs)*0.95,hi=Math.max(...vs)*1.05||1,P=34,x=i=>d.length===1?W/2:P+i*(W-P-10)/(d.length-1),y=v=>H-24-(v-lo)/((hi-lo)||1)*(H-40);
 g.strokeStyle='#333';g.fillStyle='#8e8e93';for(let i=0;i<=3;i++){const v=lo+(hi-lo)*i/3,yy=y(v);g.beginPath();g.moveTo(P,yy);g.lineTo(W,yy);g.stroke();g.fillText(Math.round(v),0,yy+4)}
 g.strokeStyle='#0a84ff';g.lineWidth=2.5;g.beginPath();d.forEach((p,i)=>i?g.lineTo(x(i),y(p.v)):g.moveTo(x(i),y(p.v)));g.stroke();
 g.fillStyle='#0a84ff';d.forEach((p,i)=>{g.beginPath();g.arc(x(i),y(p.v),4,0,7);g.fill()});
 g.fillStyle='#8e8e93';const f=t=>new Date(t).toLocaleDateString(undefined,{day:'numeric',month:'short'});g.fillText(f(d[0].t),P,H-6);if(d.length>1){const s=f(d[d.length-1].t);g.fillText(s,W-g.measureText(s).width,H-6)}
 $('#cs').textContent=`${d.length} sessions · latest ${d[d.length-1].v.toFixed(1)} kg · best ${Math.max(...vs).toFixed(1)} kg`}

function vProgram(){if(sub&&sub.d!=null)return vDay(sub.d);setTitle('Program');
 V.innerHTML=S.program.days.map((d,i)=>`<div class="card"><div class="row"><b>${esc(d.name)}</b><button class="btn sec" style="margin:0;flex:0 0 90px;min-height:44px" data-ed="${i}">Edit</button></div>
 ${d.ex.map(e=>`<div class="muted">${esc(e.name)} — ${e.sets}×${e.min}–${e.max}</div>`).join('')}</div>`).join('')+
 `<div class="card"><button class="btn sec" id="addday">+ Add day</button>
 <button class="btn" id="exp">Export backup (JSON)</button><button class="btn sec" id="imp">Import backup</button><input type="file" id="file" accept="application/json,.json" class="hidden">
 <button class="btn red" id="reset">Reset program to default</button></div>`;
 V.querySelectorAll('[data-ed]').forEach(b=>b.onclick=()=>{sub={d:+b.dataset.ed};render()});
 $('#addday').onclick=()=>{S.program.days.push({name:'Workout '+String.fromCharCode(65+S.program.days.length),ex:[]});save();sub={d:S.program.days.length-1};render()};
 $('#exp').onclick=exportJSON;$('#imp').onclick=()=>$('#file').click();
 $('#file').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const s=JSON.parse(t);if(!s.program||!s.history)throw 0;if(confirm('Replace all data with this backup?')){S=s;save();render()}}catch(x){alert('Invalid backup file')}})};
 $('#reset').onclick=()=>{if(confirm('Reset program days/exercises to default? History is kept.')){S.program=JSON.parse(JSON.stringify(DEFAULT));S.next=0;S.pv=PROGRAM_VERSION;S.mesoStart=Date.now();save();render()}}}
function exportJSON(){const b=new Blob([JSON.stringify(S,null,1)],{type:'application/json'}),n='lift-backup-'+new Date().toISOString().slice(0,10)+'.json',f=new File([b],n,{type:'application/json'});
 if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f]}).catch(()=>{});else{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;a.click()}}
function vDay(i){const d=S.program.days[i];setTitle(d.name,()=>{sub=null;render()});
 V.innerHTML=`<div class="card"><label>Day name</label><input class="f" id="dn" value="${esc(d.name)}"></div>`+d.ex.map((e,j)=>`<div class="card">
 <label>Exercise</label><input class="f" data-j="${j}" data-f="name" value="${esc(e.name)}">
 <div class="row"><div><label>Sets</label><input class="f" inputmode="numeric" data-j="${j}" data-f="sets" value="${e.sets}"></div><div><label>Min reps</label><input class="f" inputmode="numeric" data-j="${j}" data-f="min" value="${e.min}"></div><div><label>Max reps</label><input class="f" inputmode="numeric" data-j="${j}" data-f="max" value="${e.max}"></div></div>
 <div class="row"><div><label>Increment kg</label><input class="f" inputmode="decimal" data-j="${j}" data-f="inc" value="${e.inc}"></div><div><label>Current weight kg</label><input class="f" inputmode="decimal" data-j="${j}" data-f="cw" value="${stat(e).w}"></div></div>
 <div class="row"><button class="btn sec" data-up="${j}">↑</button><button class="btn sec" data-dn="${j}">↓</button><button class="btn red" data-rm="${j}">Remove</button></div></div>`).join('')+
 `<div class="card"><button class="btn" id="addex">+ Add exercise</button><button class="btn red" id="delday">Delete day</button></div>`;
 $('#dn').onchange=e=>{d.name=e.target.value||d.name;save();vDay(i)};
 V.querySelectorAll('input[data-f]').forEach(n=>n.onchange=()=>{const e=d.ex[n.dataset.j],f=n.dataset.f,v=n.value.trim();
  if(f==='name'){if(v)e.name=v}else if(f==='cw'){const s=stat(e);s.w=parseFloat(v.replace(',','.'))||0;s.note='';S.st[k(e.name)]=s}else e[f]=parseFloat(v.replace(',','.'))||0;
  if(e.min>e.max)e.max=e.min;save()});
 const mv=(j,t)=>{if(t<0||t>=d.ex.length)return;[d.ex[j],d.ex[t]]=[d.ex[t],d.ex[j]];save();vDay(i)};
 V.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>mv(+b.dataset.up,+b.dataset.up-1));
 V.querySelectorAll('[data-dn]').forEach(b=>b.onclick=()=>mv(+b.dataset.dn,+b.dataset.dn+1));
 V.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{if(confirm('Remove '+d.ex[b.dataset.rm].name+'?')){d.ex.splice(+b.dataset.rm,1);save();vDay(i)}});
 $('#addex').onclick=()=>{d.ex.push(E('New exercise',3,8,12,2.5,20));save();vDay(i);scrollTo(0,document.body.scrollHeight)};
 $('#delday').onclick=()=>{if(S.program.days.length<2)return alert('Keep at least one day.');if(confirm('Delete '+d.name+'?')){S.program.days.splice(i,1);S.next%=S.program.days.length;sub=null;save();render()}}}

render();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
