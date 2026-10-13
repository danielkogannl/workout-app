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
const W='10 min: 2 min easy cardio · 90/90 hip breathing ×5 · foam-roller thoracic extension ×10 · cat-cow ×8 · bird-dog 2×6/side · dead bug 2×6/side · side plank 2×20 s/side · 2–3 ramp-up sets of first lift. Finish: hamstring stretch (supine strap or elevated-heel hinge) 3×30–45 s + hip-flexor (half-kneeling) 2×30 s/side.';
const DEFAULT={days:[
 {name:'Day A – Bench',ex:[X('Barbell Bench Press',4,5,8,2.5,60,180),X('Leg Press',3,8,12,5,100,150),X('Chest-Supported DB Row',3,8,12,2,22,120),X('Lying Leg Curl',3,10,15,2.5,30,90,1),X('DB Lateral Raise',3,12,20,1,8,60,1),X('Face Pull',2,12,20,2.5,15,60,1),X('Suitcase Carry (kg, 30 m/side)',2,1,1,2,20,90)],warm:W},
 {name:'Day B – Pull',ex:[X('Pull-up (+kg)',4,5,10,1.25,0,150),X('Romanian Deadlift (light)',3,8,12,2.5,35,120),X('Seated DB Shoulder Press',3,8,12,2,16,120),X('Bulgarian Split Squat (DB/hand)',3,8,12,2,10,120),X('Incline DB Curl',2,10,15,1,10,60,1),X('Cable Triceps Pushdown',2,10,15,2.5,20,60,1),X('Reverse Pec Deck / Rear Delt Fly',2,12,20,2.5,20,60,1)],warm:W},
 {name:'Day C – DB Press',ex:[X('Flat DB Bench Press (DB/hand)',3,8,12,2,22,150),X('Lat Pulldown',3,8,12,2.5,50,120),X('Leg Press (high rep)',3,12,20,5,85,120),X('Leg Extension',2,10,15,2.5,35,90,1),X('Seated Cable Row',3,10,12,2.5,50,90),X('Seated Leg Curl (3 s eccentric)',2,10,15,2.5,30,60,1),X('Pallof Press (reps/side)',2,10,12,2.5,10,60,1)],warm:W}]};
const PROGRAM_VERSION=3.1,CAPS={'romanian deadlift (light)':40};
function mesoWeek(){const n=S.history.filter(h=>h.date>=(S.mesoStart||0)).length;return Math.floor(n/S.program.days.length)%MESO.length}
const isDeload=()=>MESO[mesoWeek()]==='deload';
const rirFor=e=>isDeload()?'4+':Math.max(0,MESO[mesoWeek()]+(e.rir||0));
const WARM=['2 min easy cardio (bike, rower or brisk walk)','Cat-cow × 8','Bird-dog × 5 per side','1–2 light warm-up sets of the first exercise'];
const COOL=['Hamstring stretch (lying, strap or towel) 2 × 30–45 s per leg','Optional: kneeling hip-flexor stretch 30 s per side'];
const effort=e=>{if(isDeload())return'Easy week: stop with 4+ reps left';const r=rirFor(e);return r<=0?'Last set: go until you can’t do another clean rep':r===1?'Stop with ~1 rep left (very hard)':r===2?'Stop with ~2 reps left (hard)':'Stop with ~3 reps left (challenging, controlled)'};
const GLOSS=`<h3>How this works</h3><p><b>Set × reps</b>: “3 × 8–12” = 3 sets, each 8 to 12 repetitions.</p><p><b>Effort (“reps left”)</b>: stop each set when you could still do about that many more good reps. Coaches call this RIR (reps in reserve).</p><p><b>Getting stronger (automatic)</b>: keep the weight until you hit the top of the rep range on every set — then the app adds weight next time. If you fall short of the bottom of the range twice in a row, it lowers the weight 10%.</p><p><b>5-week cycle</b>: weeks 1–4 get a little harder each week (3 → 2 → 2 → 1 reps left). Week 5 is an easy week (half the sets) so your body recovers; weights don’t change. 3 workouts = 1 week.</p><p><b>Rest</b>: the timer starts when you tick a set; heavy lifts get longer rest.</p><p><b>Back safety</b>: no barbell squats or deadlifts; Romanian deadlift is capped at 40 kg.</p>`;
const CONDI=`<h3>Optional extra day</h3><p>Pick one, switch weekly:</p><ul><li><b>Sprints</b>: 10 min warm-up, then 6–8 × 10–15 s fast hill or bike sprints, 2–3 min walking between.</li><li><b>4×4 intervals</b>: 4 × 4 min hard (can say only a few words), 3 min easy between.</li><li><b>Easy cardio or bouldering</b>: 45–60 min at a pace you can still talk.</li></ul><p>Also aim for 7–10k steps a day. Avoid sprints the day before Day B.</p>`;
const I=(img,c,m,w)=>({img,c,m,w});
const INFO={'barbell bench press':I('bench',['Feet flat, shoulder blades squeezed together and down','Lower bar to mid-chest, elbows ~45° from body','Press up and slightly back'],['Bouncing the bar off the chest','Butt lifting off the bench'],'Main chest/triceps strength lift. Alternates with dumbbell bench on Day C.'),
'flat db bench press (db/hand)':I('dbbench',['Kick dumbbells up from thighs, then lie back','Lower to chest level, elbows ~45°','Press up, dumbbells come slightly together'],['Dropping too deep with shoulder pain','Flaring elbows straight out'],'Same muscles as barbell bench; more shoulder-friendly variety. Weight is per dumbbell.'),
'leg press':I('legpress',['Lower back stays flat on the pad the whole time','Feet shoulder-width, mid-platform','Lower until knees ~90°, push through whole foot'],['Going so deep the hips/lower back lift off the pad','Locking knees hard at the top'],'Quad and glute strength without loading the spine — replaces squats for your back.'),
'leg press (high rep)':I('legpress',['Same as leg press, lighter weight','Smooth, controlled reps','Lower back stays on the pad'],['Rushing the last reps with bad form','Hips rolling up at the bottom'],'Extra leg volume with less joint stress.'),
'chest-supported db row':I('csrow',['Chest on an incline bench, arms hanging','Pull elbows back toward hips','Squeeze shoulder blades, lower slowly'],['Lifting the chest off the pad','Shrugging up to the ears'],'Upper-back strength for posture; chest support keeps load off the lower back.'),
'lying leg curl':I('lyingcurl',['Pad just above heels, hips pressed down','Curl heels toward glutes','Lower slowly (2–3 s)'],['Hips lifting off the bench','Swinging the weight'],'Hamstring strength; slow lowering also helps hamstring flexibility.'),
'seated leg curl (3 s eccentric)':I('seatedcurl',['Sit tall, thigh pad snug','Pull heels down and back','Take 3 seconds to let it back up'],['Leaning forward / using momentum','Letting the weight drop fast'],'Hamstrings in a stretched position + slow lowering — good for tight hamstrings.'),
'db lateral raise':I('lateral',['Slight bend in elbows','Raise to shoulder height, lead with elbows','Lower slowly'],['Swinging the body','Raising above shoulder height with shrugging'],'Shoulder width and shoulder health.'),
'face pull':I('facepull',['Rope at face height','Pull toward your forehead, elbows high, hands apart','Squeeze the upper back for 1 s'],['Leaning back to move heavy weight','Elbows dropping low'],'Rear shoulders and upper back — counters the hunched posture.'),
'suitcase carry (kg, 30 m/side)':I('suitcase',['Heavy weight in one hand only','Walk tall, shoulders level, don’t lean','30 m, then switch hands'],['Leaning toward or away from the weight','Rushing'],'Side core (anti-lean) and grip; one-sided work is helpful with mild scoliosis. Weight = the one weight.'),
'pull-up (+kg)':I('pullup',['Hang with arms straight, shoulders down','Pull chest toward the bar','Lower all the way under control'],['Half reps / kipping','Shrugging at the bottom'],'Back and arm strength. Weight shown = extra kg on a belt (0 = bodyweight). Use assistance if needed.'),
'romanian deadlift (light)':I('rdl',['Soft knees, push hips back','Back flat, bar slides down thighs','Stop when you feel a hamstring stretch (around the knees), stand up'],['Rounding the back to reach lower','Going heavier than 40 kg'],'Hamstrings/glutes and controlled stretch for tight hamstrings. Capped at 40 kg for your back.'),
'seated db shoulder press':I('ohp',['Sit tall with back supported','Dumbbells start at shoulder height','Press overhead, don’t arch the lower back'],['Big lower-back arch','Bouncing out of the bottom'],'Shoulder strength with back supported.'),
'bulgarian split squat (db/hand)':I('bss',['Rear foot on a bench, front foot well forward','Drop the back knee straight down','Push through the front heel'],['Front knee caving inward','Leaning far forward'],'Single-leg strength and balance without loading the spine; trains each side evenly.'),
'incline db curl':I('incurl',['Lean back on an incline bench, arms hanging','Curl up without moving the elbows forward','Lower fully'],['Swinging','Half reps'],'Biceps, trained at a long muscle length.'),
'cable triceps pushdown':I('pushdown',['Elbows pinned at your sides','Push down until arms are straight','Control on the way up'],['Elbows drifting forward','Leaning over the weight'],'Triceps — helps the bench press.'),
'reverse pec deck / rear delt fly':I('reardelt',['Arms out wide, slight elbow bend','Move arms back in a wide arc','Squeeze shoulder blades together'],['Shrugging','Using momentum'],'Rear shoulders/upper back — posture work.'),
'lat pulldown':I('pulldown',['Grip slightly wider than shoulders','Chest up, pull bar to upper chest','Control it back up fully'],['Leaning far back','Pulling behind the neck'],'Back width; also builds toward more pull-ups.'),
'leg extension':I('legext',['Pad on lower shins, sit back','Straighten the knees fully, pause','Lower slowly'],['Kicking/swinging','Lifting hips off the seat'],'Extra quad work with no back load.'),
'seated cable row':I('cablerow',['Sit tall, slight knee bend','Pull handle to belly, squeeze shoulder blades','Let shoulders reach forward slowly, keep back straight'],['Rocking the torso back and forth','Rounding the lower back'],'Mid/upper back for posture.'),
'pallof press (reps/side)':I('pallof',['Stand side-on to the cable, handle at chest','Press arms straight out, hold 2 s','Don’t let the cable twist you'],['Twisting toward the cable','Arching the back'],'Anti-rotation core — strengthens the trunk evenly, useful with mild scoliosis.')};
function modal(h){let m=$('#modal');if(!m){m=document.createElement('div');m.id='modal';document.body.appendChild(m)}m.innerHTML=`<div class="mbox">${h}<button class="btn" id="mclose">Close</button></div>`;m.classList.remove('hidden');m.onclick=e=>{if(e.target===m)m.classList.add('hidden')};$('#mclose').onclick=()=>m.classList.add('hidden')}
function exInfo(n){const x=INFO[k(n)];if(!x)return modal(`<h3>${esc(n)}</h3><p class="muted">No info for this exercise.</p>`);
 modal(`<h3>${esc(n)}</h3><img class="exi" src="img/${x.img}.svg" alt="${esc(n)} diagram"><b>How to</b><ul>${x.c.map(c=>`<li>${esc(c)}</li>`).join('')}</ul><b>Avoid</b><ul>${x.m.map(c=>`<li>${esc(c)}</li>`).join('')}</ul><b>Why</b><p>${esc(x.w)}</p>`)}
const ib=(attr)=>`<button class="ib" ${attr}>i</button>`;
function bindInfo(){V.querySelectorAll('[data-info]').forEach(b=>b.onclick=e=>{e.stopPropagation();exInfo(b.dataset.info)});V.querySelectorAll('[data-gl]').forEach(b=>b.onclick=()=>modal(GLOSS));V.querySelectorAll('[data-co]').forEach(b=>b.onclick=()=>modal(CONDI))}
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

const daysSince=()=>S.history.length?Math.floor((Date.now()-S.history[0].date)/864e5):0;
const progEx=n=>{for(const d of S.program.days)for(const e of d.ex)if(k(e.name)===k(n))return e;return null};
function guide(d){const g=daysSince(),m=[];if(g>GAP_DAYS)m.push(`It’s been ${g} days since your last workout. No problem — just do <b>${esc(d.name)}</b> next. Weights today are ~10% lighter to ease back in; normal progress resumes after.`);
 const h=S.history[0];if(h&&h.offPlan)m.push(`Last time you did <b>${esc(h.day)}</b> out of order. The rotation continues from there: next is <b>${esc(d.name)}</b>.`);
 return m.length?`<div class="card warn"><b>Back on track</b>${m.map(x=>`<p>${x}</p>`).join('')}</div>`:''}
function vHome(){setTitle('Lift');const d=S.program.days[S.next%S.program.days.length],sm=S.summary;
 V.innerHTML=(sm?`<div class="card good"><div class="row"><b>Workout saved ✓</b><button class="x" id="smx">OK</button></div>${sm.map(x=>`<div class="li"><span>${esc(x.name)}</span><span class="nx ${x.kind}">${esc(x.msg)}</span></div>`).join('')}</div>`:'')+
 guide(d)+`<div class="card"><div class="row"><span class="muted">Week ${mesoWeek()+1} of 5${isDeload()?' · easy week':''}</span>${ib('data-gl')}</div><div class="big">${esc(d.name)}</div>
 ${d.ex.map(e=>{const st=stat(e);return`<div class="li"><span>${esc(e.name)} ${ib(`data-info="${esc(e.name)}"`)}</span><span class="muted">${isDeload()?Math.ceil(e.sets/2):e.sets} × ${e.min===e.max?e.min:e.min+'–'+e.max} · ${st.w} kg</span></div>`}).join('')}
 <div class="muted" style="margin-top:6px">Effort: ${effort({rir:0})}</div>
 <button class="btn green" id="go">Start ${esc(d.name)}</button><label class="muted" style="margin-top:10px;display:block">Want a different day today?</label><select class="f" id="pick">${S.program.days.map((x,i)=>`<option value="${i}" ${x===d?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div>
 <div class="card"><div class="row"><b>Optional extra day</b>${ib('data-co')}</div><div class="muted">Sprints, intervals or easy cardio — tap i.</div></div>`;
 $('#go').onclick=()=>start(+$('#pick').value);const x=$('#smx');if(x)x.onclick=()=>{S.summary=null;save();render()};bindInfo()}

function start(pick){const nd=S.next%S.program.days.length,di=pick==null||isNaN(pick)?nd:pick,d=S.program.days[di],gap=daysSince()>GAP_DAYS;
 S.summary=null;S.active={offPlan:di!==nd,gap,di,deload:isDeload(),day:d.name,date:Date.now(),ex:d.ex.map(e=>{const w=gap?reentry(stat(e).w,daysSince(),e.inc):stat(e).w;const ls=lastSets(e.name);return{name:e.name,min:e.min,max:e.max,inc:e.inc,rest:e.rest,cue:effort(e),last:ls,sets:Array.from({length:isDeload()?Math.ceil(e.sets/2):e.sets},()=>({w,r:e.max,done:false}))}})};save();render()}

function lastSets(n){const h=S.history.find(h=>h.ex.some(x=>k(x.name)===k(n)));return h?h.ex.find(x=>k(x.name)===k(n)).sets.map(s=>s.w+'×'+s.r).join(', '):''}
function vWork(){const a=S.active;setTitle(a.day);
 V.innerHTML=`<details class="card"><summary><b>Warm-up (3–5 min)</b></summary><ul>${WARM.map(x=>`<li>${x}</li>`).join('')}</ul></details>`+a.ex.map((e,i)=>`<div class="card"><div class="row"><b style="flex:3">${esc(e.name)}</b>${ib(`data-info="${esc(e.name)}"`)}</div><div class="tgt">${e.sets.length} × ${e.min===e.max?e.min:e.min+'–'+e.max} @ ${e.sets[0]?e.sets[0].w:0} kg</div><div class="muted">${esc(e.cue||'')}</div>${e.last?`<div class="muted" style="font-size:12px">Last time: ${esc(e.last)}</div>`:''}
 <div class="set muted" style="font-size:12px;margin:4px 0"><span class="n">Set</span><span style="text-align:center">kg</span><span style="text-align:center">reps</span><span></span></div>
 ${e.sets.map((s,j)=>`<div class="set ${s.done?'done':''}"><span class="n">${j+1}</span><input inputmode="decimal" data-i="${i}" data-j="${j}" data-f="w" value="${s.w}"><input inputmode="numeric" data-i="${i}" data-j="${j}" data-f="r" value="${s.r}"><button class="chk ${s.done?'done':''}" data-i="${i}" data-j="${j}">✓</button></div>`).join('')}
 <div class="row"><button class="btn sec" data-add="${i}">+ Set</button><button class="btn sec" data-rm="${i}">− Set</button></div></div>`).join('')+
 `<div class="card"><button class="btn sec" id="addx">+ Add an extra / swapped exercise</button></div><div class="card"><details><summary><b>Cool-down (2 min)</b></summary><ul>${COOL.map(x=>`<li>${x}</li>`).join('')}</ul></details>
 <button class="btn green" id="fin">Finish workout</button><button class="btn red" id="cancel">Discard workout</button></div>`;
 V.querySelectorAll('input[data-f]').forEach(n=>n.onchange=()=>{const s=a.ex[n.dataset.i].sets[n.dataset.j];s[n.dataset.f]=parseFloat(n.value.replace(',','.'))||0;
  if(n.dataset.f==='w')a.ex[n.dataset.i].sets.forEach((x,j)=>{if(j>n.dataset.j&&!x.done)x.w=s.w});save();vWork()});
 V.querySelectorAll('.chk').forEach(b=>b.onclick=()=>{const s=a.ex[b.dataset.i].sets[b.dataset.j];s.done=!s.done;save();if(s.done)timer(a.ex[b.dataset.i].rest||S.rest);const y=scrollY;vWork();scrollTo(0,y)});
 V.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{const ss=a.ex[b.dataset.add].sets,l=ss[ss.length-1]||{w:0,r:0};ss.push({w:l.w,r:l.r,done:false});save();const y=scrollY;vWork();scrollTo(0,y)});
 V.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{a.ex[b.dataset.rm].sets.pop();save();const y=scrollY;vWork();scrollTo(0,y)});
 bindInfo();$('#addx').onclick=()=>{const n=(prompt('Exercise name (e.g. the machine you used instead):')||'').trim();if(!n)return;const pe=progEx(n),w=pe?stat(pe).w:0;a.ex.push({name:pe?pe.name:n,min:pe?pe.min:8,max:pe?pe.max:12,inc:pe?pe.inc:2.5,rest:pe&&pe.rest||90,cue:'Log what you actually do',last:lastSets(n),sets:Array.from({length:3},()=>({w,r:pe?pe.max:10,done:false}))});save();vWork();scrollTo(0,document.body.scrollHeight)};
 $('#fin').onclick=finish;$('#cancel').onclick=()=>{if(confirm('Discard this workout?')){S.active=null;save();render()}}}

function finish(){const a=S.active,done=a.ex.map(e=>({...e,sets:cleanSets((e.sets||[]).filter(s=>s.done))})).filter(e=>e.sets.length);
 if(!done.length){alert('Tick at least one set (✓) first.');return}
 if(!confirm('Finish workout?'))return;
 S.summary=[];done.forEach(e=>{const key=k(e.name),pe=progEx(e.name)||{},prev=a.gap?{w:Math.max(...e.sets.map(s=>s.w)),fails:0}:S.st[key],planned=(a.ex.find(x=>x.name===e.name)||e).sets.length,cfg={min:e.min||pe.min,max:e.max||pe.max,inc:e.inc!=null?e.inc:pe.inc};
  const r=nextTarget(prev,cfg,e.sets,planned,!!a.deload,CAPS[key]);S.st[key]={w:r.w,fails:r.fails,note:''};S.summary.push({name:e.name,msg:r.msg,kind:r.kind})});
 S.history.unshift({id:a.date,date:a.date,day:a.day,offPlan:!!a.offPlan,ex:done.map(e=>({name:e.name,sets:e.sets.map(s=>({w:s.w,r:s.r}))}))});
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
