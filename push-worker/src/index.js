// Rest-timer push scheduler: one Durable Object per device, one alarm = one push at rest end.
import{sendPush}from'./webpush.js';
const ORIGINS=['https://danielkogannl.github.io','http://localhost:8765'];
const PUSH_HOSTS=/(^|\.)(push\.apple\.com|fcm\.googleapis\.com|googleapis\.com|push\.services\.mozilla\.com|notify\.windows\.com)$/;
const MAX_AHEAD=30*60*1000;
const cors=o=>({'Access-Control-Allow-Origin':ORIGINS.includes(o)?o:ORIGINS[0],'Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'});
const json=(d,s,o)=>new Response(JSON.stringify(d),{status:s||200,headers:{'Content-Type':'application/json',...cors(o)}});
export function validate(b,now=Date.now(),testPrefix){
 if(!b||typeof b.id!=='string'||!/^[a-z0-9-]{8,64}$/i.test(b.id))return'bad id';
 if(b.action==='cancel')return null;
 const s=b.sub;if(!s||typeof s.endpoint!=='string'||!s.keys||!s.keys.p256dh||!s.keys.auth)return'bad subscription';
 let u;try{u=new URL(s.endpoint)}catch(e){return'bad endpoint'}
 if(!(testPrefix&&s.endpoint.startsWith(testPrefix))&&(u.protocol!=='https:'||!PUSH_HOSTS.test(u.hostname)))return'endpoint not a push service';
 if(typeof b.at!=='number'||b.at<now-5000||b.at>now+MAX_AHEAD)return'bad time';
 return null}
export default{async fetch(req,env){const o=req.headers.get('Origin')||'';
 if(req.method==='OPTIONS')return new Response(null,{headers:cors(o)});
 const p=new URL(req.url).pathname;
 if(req.method==='GET'&&p==='/')return json({ok:true,vapidPublicKey:env.VAPID_PUBLIC_KEY},200,o);
 if(req.method!=='POST'||(p!=='/schedule'&&p!=='/cancel'))return json({error:'not found'},404,o);
 let b;try{b=await req.json()}catch(e){return json({error:'bad json'},400,o)}
 b.action=p.slice(1);const err=validate(b,Date.now(),env.TEST_ENDPOINT_PREFIX);if(err)return json({error:err},400,o);
 const stub=env.TIMER.get(env.TIMER.idFromName(b.id));
 return json(await(await stub.fetch('https://do/'+b.action,{method:'POST',body:JSON.stringify(b)})).json(),200,o)}};
export class RestTimer{constructor(state,env){this.state=state;this.env=env}
 async fetch(req){const b=await req.json(),st=this.state.storage;
  if(b.action==='cancel'){await st.deleteAlarm();await st.delete('job');return Response.json({ok:true,cancelled:true})}
  await st.put('job',{sub:b.sub,at:b.at,title:String(b.title||'Rest over').slice(0,60),body:String(b.body||'Time for your next set 💪').slice(0,120)});
  await st.setAlarm(b.at);return Response.json({ok:true,at:b.at})}
 async alarm(){const st=this.state.storage,j=await st.get('job');if(!j)return;
  const r=await sendPush(j.sub,JSON.stringify({title:j.title,body:j.body,at:j.at}),{publicKey:this.env.VAPID_PUBLIC_KEY,privateKey:this.env.VAPID_PRIVATE_KEY},this.env.VAPID_SUBJECT||'mailto:danielkogannl@users.noreply.github.com');
  await st.delete('job');if(r.status>=500)throw new Error('push service '+r.status)}}
