'use strict';
// Pure session statistics (duration, rest, volume, PRs, estimates, plate math, coach report).
const ST={
 MAX_MS:3*3600e3, STALE_MS:30*60e3, TAIL_MS:5*60e3,
 // start, ticked-set timestamps, finish click time -> {start,end,dur,auto}
 times(start,setTs,finishAt){const ts=(setTs||[]).filter(x=>isFinite(x)&&x>=start).sort((a,b)=>a-b),last=ts[ts.length-1];let end=finishAt,auto=false;
  if(last&&finishAt-last>ST.STALE_MS){end=last+ST.TAIL_MS;auto=true}
  else if(!last&&finishAt-start>ST.MAX_MS){end=start+ST.MAX_MS;auto=true}
  if(end-start>ST.MAX_MS){end=start+ST.MAX_MS;auto=true}
  end=Math.max(end,start);return{start,end,dur:end-start,auto}},
 // median gap between consecutive ticked sets (ignores >15 min gaps)
 medianRest(setTs){const ts=(setTs||[]).filter(isFinite).sort((a,b)=>a-b),g=[];for(let i=1;i<ts.length;i++){const d=ts[i]-ts[i-1];if(d>0&&d<=15*60e3)g.push(d)}
  if(!g.length)return null;g.sort((a,b)=>a-b);const m=g.length>>1;return Math.round(g.length%2?g[m]:(g[m-1]+g[m])/2)},
 volume(ex){return Math.round((ex||[]).reduce((t,e)=>t+(e.sets||[]).reduce((u,s)=>u+(+s.w||0)*(+s.r||0),0),0))},
 e1rm:(w,r)=>w*(1+r/30),
 // PRs vs previous history (best estimated 1RM per exercise); first-ever logs are not PRs
 prs(session,prevHistory){const out=[],k=n=>String(n).trim().toLowerCase();
  for(const e of session.ex||[]){let prev=0,seen=false;for(const h of prevHistory||[])for(const x of h.ex||[])if(k(x.name)===k(e.name))for(const s of x.sets||[]){seen=true;if(s.w>0)prev=Math.max(prev,ST.e1rm(s.w,s.r))}
   let best=null;for(const s of e.sets||[])if(s.w>0&&(!best||ST.e1rm(s.w,s.r)>ST.e1rm(best.w,best.r)))best=s;
   if(seen&&best&&ST.e1rm(best.w,best.r)>prev+0.01)out.push({name:e.name,w:best.w,r:best.r})}return out},
 // estimated minutes: warm-up + per set ~40 s work + rest (not after last set of the session)
 estimate(day,deload){let s=5*60,n=0;for(const e of day.ex||[]){const sets=deload?Math.ceil(e.sets/2):e.sets;s+=sets*(40+(e.rest||90));n+=sets}return Math.round(s/60/5)*5},
 // barbell plates per side
 plates(total,bar,avail){bar=bar||20;avail=avail||[25,20,15,10,5,2.5,1.25];let side=(total-bar)/2;if(side<0)return null;const out=[];
  for(const p of avail)while(side>=p-1e-9){out.push(p);side=Math.round((side-p)*1000)/1000}return side>0.001?null:out},
 fmtDur(ms){const m=Math.round(ms/60e3);return m<1?'<1 min':m<60?m+' min':Math.floor(m/60)+' h '+String(m%60).padStart(2,'0')+' min'},
 clock(ms){const s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s/60)%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(s%60).padStart(2,'0')},
 // plain-text report for the coach, sessions within `days` (default 7)
 report(history,days,now){now=now||Date.now();const from=now-(days||7)*864e5,hs=(history||[]).filter(h=>h.date>=from).slice().reverse();
  const L=[`Lift report: last ${days||7} days, ${hs.length} workout${hs.length===1?'':'s'}`];
  for(const h of hs){const d=new Date(h.date),meta=[h.dur?ST.fmtDur(h.dur):null,'vol '+(h.volume!=null?h.volume:ST.volume(h.ex))+' kg',h.rating?'feel '+h.rating+'/5':null,h.sleep?'sleep '+h.sleep:null,h.pain&&h.pain.level&&h.pain.level!=='none'?'PAIN '+h.pain.level+(h.pain.area?' ('+h.pain.area+')':''):null,h.restMed?'rest ~'+Math.round(h.restMed/1000)+'s':null,h.offPlan?'off-plan':null].filter(Boolean).join(' · ');
   L.push('',`${d.toISOString().slice(0,10)} ${h.day}: ${meta}`);for(const e of h.ex||[])L.push(`  ${e.name}: ${(e.sets||[]).map(s=>s.w+'×'+s.r).join(', ')}`);
   if(h.prs&&h.prs.length)L.push('  PRs: '+h.prs.map(p=>p.name+' '+p.w+'×'+p.r).join('; '));if(h.notes)L.push('  Notes: '+h.notes)}
  return L.join('\n')}};
if(typeof module!=='undefined')module.exports=ST;
