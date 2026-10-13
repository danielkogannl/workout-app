'use strict';
// Pure progression logic (shared by app + tests).
const MESO=[3,2,2,1,'deload'];
function roundTo(x,step){step=step||1.25;return Math.max(0,Math.round(Math.round(x/step)*step*100)/100)}
// prev:{w,fails}, ex:{min,max,inc}, sets:[{w,r}] (completed), planned:int, deload:bool, cap:number|undefined
// keep only real, completed sets; tolerate strings/NaN/missing fields
function cleanSets(sets){return(sets||[]).map(s=>({w:Math.max(0,parseFloat(s&&s.w)||0),r:Math.max(0,parseInt(s&&s.r)||0)})).filter(s=>s.r>0)}
// after a long break (>10 days) start ~10% lighter
const GAP_DAYS=10;
function reentry(w,days,inc){return days>GAP_DAYS&&w>0?roundTo(w*0.9,inc||1.25):w}
function nextTarget(prev,ex,sets,planned,deload,cap){
 sets=cleanSets(sets);if(!ex||!ex.max){const w=sets.length?Math.max(...sets.map(s=>s.w)):(prev&&prev.w)||0;return{w,fails:0,msg:`Next time: ${w} kg (logged as you did it)`,kind:'hold'}}
 const mn=ex.min||1,mx=Math.max(ex.max||mn,mn);ex={min:mn,max:mx,inc:ex.inc==null?2.5:ex.inc};sets=cleanSets(sets);planned=planned||sets.length;
 prev=prev&&isFinite(prev.w)?prev:{w:sets.length?Math.max(...sets.map(s=>s.w)):0,fails:0};const fails=prev.fails||0;
 if(!sets.length)return{w:prev.w,fails,msg:`Next time: ${prev.w} kg`,kind:'hold'};
 const w=Math.max(...sets.map(s=>s.w)),top=sets.filter(s=>s.w===w);
 if(deload)return{w,fails,msg:`Easy week done. Next time: ${w} kg`,kind:'hold'};
 const allDone=sets.length>=planned&&top.length===sets.length;
 if(allDone&&sets.every(s=>s.r>=ex.max)){
  if(!ex.inc)return{w,fails:0,msg:`Great! Next time: ${w} kg, try a bit more`,kind:'up'};
  let nw=Math.round((w+ex.inc)*100)/100;
  if(cap&&nw>cap){nw=cap;if(w>=cap)return{w:cap,fails:0,msg:`At the ${cap} kg limit. Next time: ${cap} kg, lower it slower (3 s)`,kind:'cap'}}
  return{w:nw,fails:0,msg:`Next time: ${nw} kg (+${Math.round((nw-w)*100)/100})`,kind:'up'}}
 if(sets.some(s=>s.r<ex.min)){
  if(fails+1>=2){const nw=roundTo(w*0.9,ex.inc||1.25);return{w:nw,fails:0,msg:`Too heavy twice. Next time: ${nw} kg (−10%)`,kind:'down'}}
  return{w,fails:fails+1,msg:`Next time: ${w} kg again, aim for ${ex.min}+ reps every set`,kind:'hold'}}
 return{w,fails:0,msg:`Next time: ${w} kg again, add a rep (goal ${planned}×${ex.max})`,kind:'hold'}}
if(typeof module!=='undefined')module.exports={nextTarget,MESO,roundTo,cleanSets,reentry,GAP_DAYS};
