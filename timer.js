'use strict';
// Pure, timestamp-based rest timer logic (survives backgrounding: always recomputed from Date.now()).
const RT={
 start(now,sec){sec=Math.max(1,Math.round(+sec||90));return{end:now+sec*1000,dur:sec*1000,started:now}},
 left(t,now){return t?Math.max(0,Math.ceil((t.end-now)/1000)):0},
 done(t,now){return!!t&&now>=t.end},
 adjust(t,deltaSec,now){if(!t)return t;const end=Math.max(now+1000,t.end+deltaSec*1000);return{...t,end,dur:Math.max(1000,t.dur+(end-t.end))}},
 frac(t,now){if(!t)return 0;return Math.min(1,Math.max(0,(t.end-now)/t.dur))},
 fmt(sec){sec=Math.max(0,Math.round(sec));return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')},
 // foreground handles the alert itself; cancel the server push when the app is visible this close to the end
 shouldCancelPush(t,now,visible,margin){return!!t&&visible&&t.pushed&&!t.pushCancelled&&(t.end-now)<=(margin||3000)}};
if(typeof module!=='undefined')module.exports=RT;
