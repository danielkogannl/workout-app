const p=require('puppeteer-core'),O='/workspace/workout-app-shots/',U='http://localhost:8765/';
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const g=await b.newPage();
await g.setViewport({width:390,height:844,deviceScaleFactor:2});g.on('dialog',d=>d.accept());const errs=[];g.on('pageerror',e=>errs.push(e.message));
await g.goto(U+'manifest.json');
await g.evaluate(()=>localStorage.setItem('lift.v1',JSON.stringify({program:{days:[{name:'Workout A',ex:[]}]},next:0,st:{'barbell bench press':{w:60,fails:0,note:''},'lat pulldown':{w:45,fails:0}},history:[{id:1,date:Date.now()-2*864e5,day:'Workout A',ex:[{name:'Barbell Bench Press',sets:[{w:60,r:8}]}]}],active:null,rest:90,pv:2})));
await g.goto(U);await g.waitForSelector('#go');const ck=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
let t=await g.$eval('#view',e=>e.innerText);ck(t.includes('Day A – Bench')&&t.includes('60 kg'),'migrated old data, home shows Day A @60 kg');
await g.screenshot({path:O+'1-home.png'});
await g.$eval('[data-gl]',x=>x.click());await g.waitForSelector('.mbox');await g.screenshot({path:O+'2-glossary.png'});await g.$eval('#mclose',x=>x.click());
await g.$eval('#go',x=>x.click());await g.waitForSelector('.chk');t=await g.$eval('#view',e=>e.innerText);
ck(/4 × 5–8 @ 60 kg/.test(t)&&t.includes('reps left')&&t.includes('Last time: 60×8')&&!/RIR/.test(t),'workout shows target, plain effort cue, last time, no jargon');
await g.screenshot({path:O+'3-workout.png'});
await g.$eval('[data-info="Barbell Bench Press"]',x=>x.click());await g.waitForSelector('.exi');await new Promise(r=>setTimeout(r,500));
const nw=await g.$eval('.exi',i=>i.naturalWidth);ck(nw>0,'info popup image renders ('+nw+'px)');await g.screenshot({path:O+'4-exercise-info.png'});await g.$eval('#mclose',x=>x.click());
const names=await g.$$eval('[data-info]',b=>b.map(x=>x.dataset.info));let okAll=true;
for(const n of names){await g.evaluate(n=>exInfo(n),n);await g.waitForSelector('.exi');await g.waitForFunction(()=>document.querySelector('.exi').complete);if(!(await g.$eval('.exi',i=>i.naturalWidth)))okAll=false}
ck(okAll,'all '+names.length+' info images on Day A load');await g.evaluate(()=>$('#modal').classList.add('hidden'));
// tick all sets (prefilled at max reps)
for(;;){const c=await g.$('.chk:not(.done)');if(!c)break;await c.evaluate(x=>x.click());await new Promise(r=>setTimeout(r,60))}
await g.$eval('#fin',x=>x.click());await g.waitForSelector('.card.good');t=await g.$eval('#view',e=>e.innerText);
ck(t.includes('Next time: 62.5 kg'),'bench summary: Next time: 62.5 kg');ck(t.includes('Next time: 105 kg'),'leg press summary: 105 kg');
await g.screenshot({path:O+'5-after-workout.png',fullPage:true});
const st=await g.evaluate(()=>JSON.parse(localStorage.getItem('lift.v1')));
ck(st.st['barbell bench press'].w===62.5&&st.history.length===2&&st.next===1,'stored: bench 62.5, history kept (2), next=Day B');
await g.$eval('#smx',x=>x.click());t=await g.$eval('#view',e=>e.innerText);ck(t.includes('Day B'),'home now shows Day B');
// out-of-order: pick Day C instead of Day B, add an extra exercise, skip some
await g.select('#pick','2');await g.$eval('#go',x=>x.click());await g.waitForSelector('.chk');
await g.evaluate(()=>{window.prompt=()=>'Hack Squat Machine'});await g.$eval('#addx',x=>x.click());
await g.evaluate(()=>{const a=S.active;a.ex[0].sets.forEach(s=>s.done=true);a.ex[0].sets[0].w=20;a.ex[0].sets.forEach(s=>s.w=20);const x=a.ex[a.ex.length-1];x.sets.forEach(s=>{s.w=60;s.r=10;s.done=true});x.sets[2].r='';save()});
await g.$eval('#fin',x=>x.click());await g.waitForSelector('.card.good');t=await g.$eval('#view',e=>e.innerText);
ck(t.includes('Hack Squat Machine')&&t.includes('Next time: 60 kg'),'extra exercise logged + partial set ignored');
ck(t.includes('Flat DB Bench')&&t.includes('Next time: 22 kg'),'deviating lighter weight (20 kg, all reps) -> 22 kg next, based on logged');
ck(t.includes('out of order')&&t.includes('next is Day A'),'back-on-track guidance after out-of-order day');
const s2=await g.evaluate(()=>JSON.parse(localStorage.getItem('lift.v1')));ck(s2.st['lat pulldown'].w===45,'skipped exercise keeps previous weight');
await g.screenshot({path:O+'7-back-on-track.png',fullPage:true});
// long gap
await g.evaluate(()=>{S.summary=null;S.history.forEach(h=>h.date-=20*864e5);save()});await g.reload();await g.waitForSelector('#go');t=await g.$eval('#view',e=>e.innerText);
ck(/It’s been 2\d days/.test(t),'gap guidance shown');await g.screenshot({path:O+'8-long-gap.png'});
await g.$eval('#go',x=>x.click());await g.waitForSelector('.chk');t=await g.$eval('#view',e=>e.innerText);ck(t.includes('@ 57.5 kg'),'re-entry bench 62.5 -> 57.5 kg (~10% lighter)');
// ---- rest timer ----
await g.evaluate(()=>{S.active=null;S.summary=null;S.history.forEach(h=>h.date=Date.now()-864e5);save()});await g.reload();await g.waitForSelector('#go');
await g.evaluate(()=>{window.__f=[];const of=window.fetch;window.fetch=(u,o)=>{window.__f.push(String(u).split('/').pop());return of(u,o)};
 localStorage.setItem('lift.pushUrl','http://127.0.0.1:8787');S.push={sub:{endpoint:'http://localhost:9999/'+'e2e',keys:{p256dh:PUSH_CFG.vapidPublicKey,auth:'AAAAAAAAAAAAAAAAAAAAAA'}}};save()});
await g.$eval('#go',x=>x.click());await g.waitForSelector('.chk');await g.$eval('.chk',x=>x.click());await new Promise(r=>setTimeout(r,400));
t=await g.$eval('#tleft',e=>e.innerText);ck(/^(3:00|2:59)$/.test(t)&&await g.$eval('#timer',e=>!e.classList.contains('hidden')),'ticking bench set auto-starts 3:00 rest (exercise rest 180 s): '+t);
await g.screenshot({path:O+'9-rest-timer.png'});
await g.$eval('#tplus',x=>x.click());t=await g.$eval('#tleft',e=>e.innerText);ck(/^3:1[45]$/.test(t),'+15 s -> '+t);
await g.$eval('#tminus',x=>x.click());await g.$eval('#tminus',x=>x.click());t=await g.$eval('#tleft',e=>e.innerText);ck(/^2:(44|45)$/.test(t),'-15 s twice -> '+t);
const st1=await g.evaluate(()=>S.timer.end-Date.now());const st2=await g.evaluate(()=>JSON.parse(localStorage.getItem('lift.v1')).timer.end-Date.now());ck(Math.abs(st1-st2)<50,'timer persisted as timestamp in storage');
await g.$eval('#tstop',x=>x.click());await new Promise(r=>setTimeout(r,500));let f=await g.evaluate(()=>window.__f);
ck(await g.$eval('#timer',e=>e.classList.contains('hidden'))&&f.filter(x=>x==='schedule').length===4&&f.includes('cancel'),'schedule on start + each adjust, cancel on skip: '+f.join(','));
// foreground end: in-app alert + beep, server push cancelled
await g.evaluate(()=>{window.__beeps=0;const ob=beep;window.beep=()=>{window.__beeps++;ob()};window.__f=[];timer(5)});await new Promise(r=>setTimeout(r,6000));
f=await g.evaluate(()=>window.__f);const fg=await g.evaluate(()=>({over:$('#timer').classList.contains('over'),txt:$('#timer').innerText,beeps:window.__beeps}));
ck(fg.over&&fg.txt.includes('Next set')&&fg.beeps===1,'foreground end -> green "Next set!" banner + beep');ck(f.join()==='schedule,cancel','foreground: push scheduled then cancelled near end ('+f.join()+')');
await g.screenshot({path:O+'10-rest-over.png'});await g.$eval('#tstop',x=>x.click());
// background end (app hidden, JS timers frozen): server push must arrive
await g.evaluate(()=>{Object.defineProperty(document,'visibilityState',{get:()=>'hidden',configurable:true});timer(3);clearInterval(tI)});
await new Promise(r=>setTimeout(r,5000));const ml=require('fs').readFileSync('/tmp/mock.log','utf8');
ck(/POST \/e2e enc=aes128gcm/.test(ml)&&(ml.match(/\/e2e/g)||[]).length===1,'background: encrypted Web Push delivered by worker alarm at rest end (exactly once)');
// returning to the app after it ended
await g.evaluate(()=>{Object.defineProperty(document,'visibilityState',{get:()=>'visible',configurable:true});document.dispatchEvent(new Event('visibilitychange'))});await new Promise(r=>setTimeout(r,400));
ck(await g.$eval('#timer',e=>e.classList.contains('over')),'on return, app shows rest-over banner');await g.$eval('#tstop',x=>x.click());
// alerts card (desktop Chrome headless: not iOS) + help popup
await g.evaluate(()=>{tab='program';sub=null;render()});t=await g.$eval('#view',e=>e.innerText);ck(/Rest alerts|Notifications blocked/.test(t),'Program tab shows rest-alerts card (headless Chrome: notifications denied by default)');
await g.$eval('[data-ah]',x=>x.click());await g.waitForSelector('.mbox');t=await g.$eval('.mbox',e=>e.innerText);ck(t.includes('Add to Home Screen'),'iOS help popup');await g.screenshot({path:O+'11-alerts-help.png'});await g.$eval('#mclose',x=>x.click());
await g.evaluate(()=>localStorage.removeItem('lift.pushUrl'));
// ---- notes ----
await g.evaluate(()=>{S.active=null;S.summary=null;tab='home';save();render()});await g.$eval('#go',x=>x.click());await g.waitForSelector('#notes');
ck(await g.$eval('#notes',e=>e.placeholder.startsWith('How did it feel?')),'notes textarea with placeholder above Finish');
await g.focus('#notes');await g.keyboard.type('Felt strong, slight low-back tightness. Slept 6h.');
ck((await g.evaluate(()=>JSON.parse(localStorage.getItem('lift.v1')).active.notes)).includes('Slept 6h'),'notes autosaved to active session while typing');
await g.reload();await g.waitForSelector('#notes');ck((await g.$eval('#notes',e=>e.value)).includes('low-back'),'notes survive reload mid-workout');
await g.evaluate(()=>{const c=document.querySelector('.chk');c.click()});await g.screenshot({path:O+'12-workout-notes.png'});
await g.evaluate(()=>{const n=document.querySelector('#notes');n.scrollIntoView()});await g.screenshot({path:O+'12-workout-notes.png'});
await g.$eval('#tstop',x=>x.click());await g.$eval('#fin',x=>x.click());await g.waitForSelector('.card.good');
let hs=await g.evaluate(()=>JSON.parse(localStorage.getItem('lift.v1')).history[0]);ck(hs.notes==='Felt strong, slight low-back tightness. Slept 6h.','finish stores history[0].notes');
await g.evaluate(()=>{tab='history';render()});t=await g.$eval('[data-note="0"]',e=>e.value);ck(t.includes('Slept 6h'),'history shows notes');
await g.$eval('[data-note="0"]',e=>{e.value='Edited: back fine next day';e.dispatchEvent(new Event('input'))});
hs=await g.evaluate(()=>JSON.parse(localStorage.getItem('lift.v1')).history[0]);ck(hs.notes==='Edited: back fine next day','notes editable in history');
await g.screenshot({path:O+'13-history-notes.png'});
const exp=await g.evaluate(()=>JSON.parse(JSON.stringify(S)));ck(exp.history[0].notes==='Edited: back fine next day','export JSON (whole state) includes notes');
// import old backup without notes, plus junk notes type
await g.evaluate(()=>{const s=JSON.parse(JSON.stringify(S));s.history.forEach(h=>delete h.notes);s.history[1].notes=42;localStorage.setItem('lift.v1',JSON.stringify(s))});await g.reload();await g.waitForSelector('#view');
await g.evaluate(()=>{tab='history';render()});const nv=await g.$$eval('[data-note]',a=>a.map(e=>e.value));ck(nv.length>0&&nv.every(v=>v===''),'old data without notes (or non-string) renders, empty notes');
// all images contact sheet
await g.setContent('<body style="background:#000;margin:0;display:flex;flex-wrap:wrap">'+require('fs').readdirSync('/workspace/workout-app/img').map(f=>`<img src="${U}img/${f}" style="width:195px">`).join('')+'</body>');
await new Promise(r=>setTimeout(r,800));await g.setViewport({width:390*2,height:1100});await g.screenshot({path:O+'6-all-diagrams.png',fullPage:true});
ck(!errs.length,'no page errors '+errs.join('|'));await b.close()})();
