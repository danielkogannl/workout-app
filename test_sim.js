// Simulated real use on an iPhone-sized viewport with a controllable clock. Run with: node test_sim.js (needs puppeteer-core, app served on :8765)
const p=require('puppeteer-core'),O='/workspace/workout-app-shots/',U='http://localhost:8765/',M=60e3,D=864e5;
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const ctx=b.defaultBrowserContext();await ctx.overridePermissions(U.slice(0,-1),['clipboard-read','clipboard-write','clipboard-sanitized-write']);
const g=await b.newPage();await g.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await g.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1');
g.on('dialog',d=>d.accept());const errs=[];g.on('pageerror',e=>errs.push(e.message));let fails=0;const ck=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c){fails++;process.exitCode=1}};
// clock shim: Date.now() = real + offset stored in localStorage
await g.evaluateOnNewDocument(()=>{const rn=Date.now.bind(Date);Date.now=()=>rn()+(+localStorage.getItem('sim.off')||0)});
const adv=ms=>g.evaluate(ms=>localStorage.setItem('sim.off',(+localStorage.getItem('sim.off')||0)+ms),ms);
const clickJS=sel=>g.$eval(sel,x=>x.click()),txt=()=>g.$eval('#view',e=>e.innerText),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const tickSets=async(gapMin,filter)=>{const n=await g.$$eval('.chk',a=>a.length);for(let i=0;i<n;i++){const ok=await g.evaluate((i,f)=>{const c=document.querySelectorAll('.chk')[i];if(!c||c.classList.contains('done'))return false;const a=S.active.ex[+c.dataset.i];if(f&&!new RegExp(f,'i').test(a.name))return false;c.click();return true},i,filter||'');if(ok)await adv(gapMin*M)}};
await g.goto(U+'manifest.json');await g.evaluate(()=>localStorage.clear());await g.goto(U);await g.waitForSelector('#go');
// --- Day 0: fresh install, Day A as planned
let t=await txt();ck(/~\d+ min/.test(t),'Home shows estimated session length: '+(t.match(/~\d+ min/)||[''])[0]);await g.screenshot({path:O+'14-sim-home.png'});
await clickJS('#go');await g.waitForSelector('.chk');await adv(4*M);await tickSets(2.5);
const hdr=await g.$eval('#hdr .hbtn:last-child',e=>e.textContent);ck(/^⏱ \d+:\d\d/.test(hdr),'live elapsed clock in header: '+hdr);
t=await txt();ck(t.includes('Plates per side: 20'),'plate math shown for barbell bench');
await g.evaluate(()=>{[...document.querySelectorAll('[data-q="rating"]')].find(b=>b.dataset.v==='4').click()});await g.evaluate(()=>{[...document.querySelectorAll('[data-q="sleep"]')].find(b=>b.dataset.v==='7–8 h').click()});
await g.focus('#notes');await g.keyboard.type('Good session, back fine.');await g.evaluate(()=>document.querySelector('.qk').scrollIntoView());await g.screenshot({path:O+'15-sim-quickcheck.png'});
await adv(3*M);await clickJS('#fin');await g.waitForSelector('.card.good');t=await txt();
let h=await g.evaluate(()=>S.history[0]);ck(h.dur>=45*M&&h.dur<=75*M&&!h.durAuto,'duration stored ('+Math.round(h.dur/M)+' min), start/end set: '+!!(h.start&&h.end));
ck(h.rating===4&&h.sleep==='7–8 h'&&h.notes.includes('back fine'),'rating, sleep, notes stored');ck(h.volume>3000&&h.ex[0].sets[0].t>0,'volume '+h.volume+' kg + per-set timestamps stored');
ck(h.restMed>=2*M&&h.restMed<=3*M,'median real rest ~'+Math.round(h.restMed/1000)+' s');ck(/\d+ min · [\d,.]+ kg lifted/.test(t),'summary card shows duration + volume');
await clickJS('#smx');
// --- Day 2: Day B with deviations: heavier RDL typed (cap), skip curls & pushdowns, mild low-back pain
await adv(2*D);await g.reload();await g.waitForSelector('#go');await clickJS('#go');await g.waitForSelector('.chk');
await g.evaluate(()=>{const i=S.active.ex.findIndex(e=>/romanian/i.test(e.name));const n=document.querySelector(`input[data-i="${i}"][data-j="0"][data-f="w"]`);n.value='45';n.dispatchEvent(new Event('change'))});await g.waitForSelector('.mbox');ck((await g.$eval('.mbox',e=>e.innerText)).includes('Max 40 kg'),'typing 45 kg on RDL shows back-safety cap message');await clickJS('#mclose');
await tickSets(2,'pull-up|romanian|shoulder|bulgarian|rear');
await g.evaluate(()=>{[...document.querySelectorAll('[data-q="pain"]')].find(b=>b.dataset.v==='mild').click()});await g.evaluate(()=>{[...document.querySelectorAll('[data-q="area"]')].find(b=>b.dataset.v==='Low back').click()});
await adv(2*M);await clickJS('#fin');await g.waitForSelector('.card.good');t=await txt();h=await g.evaluate(()=>S.history[0]);
ck(h.pain&&h.pain.level==='mild'&&h.pain.area==='Low back','pain flag + area stored');ck(!h.ex.some(e=>/curl|pushdown/i.test(e.name)),'skipped exercises not logged');
const rdl=await g.evaluate(()=>S.st['romanian deadlift (light)'].w);ck(rdl<=40&&h.ex.find(e=>/romanian/i.test(e.name)).sets.every(s=>s.w<=40),'RDL typed at 45 kg -> clamped to 40 kg with explanation; next target '+rdl);await clickJS('#smx');
ck(await g.evaluate(()=>!S.timer),'no rest timer after the very last set');
// --- Day 4: Day C, forgets to press Finish (4 h later)
await adv(2*D);await g.reload();await g.waitForSelector('#go');await clickJS('#go');await g.waitForSelector('.chk');await tickSets(2);
const lastSet=await g.evaluate(()=>Math.max(...S.active.ex.flatMap(e=>e.sets.map(s=>s.t||0))));await adv(4*3600e3);await g.reload();await g.waitForSelector('#fin');t=await txt();ck(t.includes('Still training?'),'stale-session banner after 4 h');
await g.screenshot({path:O+'16-sim-forgot-finish.png'});await clickJS('#fin');await g.waitForSelector('.card.good');h=await g.evaluate(()=>S.history[0]);
ck(h.durAuto&&h.end-lastSet<=6*M&&h.end-lastSet>=4*M,'forgotten finish: end = last set + 5 min ('+Math.round(h.dur/M)+' min, auto)');await clickJS('#smx');
// --- Day 18: long gap -> lighter re-entry; then PR on a later session
await adv(14*D);await g.reload();await g.waitForSelector('#go');t=await txt();ck(/It’s been 1\d days/.test(t),'gap guidance after 14 days');
await clickJS('#go');await g.waitForSelector('.chk');t=await txt();ck(t.includes('@ 57.5 kg'),'re-entry bench lighter (62.5 -> 57.5)');await tickSets(2);await clickJS('#fin');await g.waitForSelector('.card.good');await clickJS('#smx');
// PR: next Day A bench with a heavier top set
for(let i=0;i<2;i++){await adv(D);await g.reload();await g.waitForSelector('#go');await clickJS('#go');await g.waitForSelector('.chk');await tickSets(2);await clickJS('#fin');await g.waitForSelector('.card.good');await clickJS('#smx')}
await adv(D);await g.reload();await g.waitForSelector('#go');await clickJS('#go');await g.waitForSelector('.chk');
await g.evaluate(()=>{const n=document.querySelector('input[data-i="0"][data-j="0"][data-f="w"]');n.value='65';n.dispatchEvent(new Event('change'))});await tickSets(2);await clickJS('#fin');await g.waitForSelector('.card.good');t=await txt();
ck(/🏆 (New best: Barbell Bench Press 65 kg × 8|\d+ new bests: Barbell Bench Press 65×8)/.test(t),'PR highlight on summary card');await g.screenshot({path:O+'17-sim-summary-pr.png'});await clickJS('#smx');
// --- fast-forward to the easy (deload) round: quick partial sessions
for(let i=0;i<20;i++){const r=await g.evaluate(()=>mesoWeek());if(r===4)break;await adv(D);await g.reload();await g.waitForSelector('#go');await clickJS('#go');await g.waitForSelector('.chk');await g.$eval('.chk',x=>x.click());await clickJS('#fin');await g.waitForSelector('.card.good');await clickJS('#smx')}
await g.reload();await g.waitForSelector('#go');t=await txt();ck(t.includes('Round 5 of 5 · easy round'),'deload round reached via workouts count');
const dl=await g.evaluate(()=>S.program.days[S.next%3].ex[0].sets);ck(t.includes(Math.ceil(dl/2)+' × '),'deload shows half the sets');
// --- history + coach report
await g.evaluate(()=>{tab='history';render()});t=await txt();ck(/\d+ min · [\d,.]+ kg/.test(t)&&t.includes('pain: mild · Low back'),'history shows duration, volume, pain');await g.screenshot({path:O+'18-sim-history.png'});
await clickJS('#rep');await sleep(400);const clip=await g.evaluate(()=>navigator.clipboard.readText().catch(e=>'ERR '+e));ck(/Lift report: last 7 days/.test(clip)&&/vol \d+ kg/.test(clip),'coach report copied to clipboard ('+clip.split('\n').length+' lines)');
require('fs').writeFileSync(O+'coach-report-sample.txt',clip);
// export contains new fields
const ex=await g.evaluate(()=>JSON.parse(JSON.stringify(S)));ck(ex.history.every(h=>'dur'in h&&'volume'in h),'export contains dur/volume for all sessions');
ck(!errs.length,'no page errors '+errs.join(' | '));console.log(fails?fails+' FAILED':'all sim checks passed');await b.close()})();
