// Minimal Web Push (RFC 8291 aes128gcm payload encryption + RFC 8292 VAPID) using WebCrypto only.
const enc=new TextEncoder();
export const b64u={
 enc:b=>{let s='';new Uint8Array(b).forEach(c=>s+=String.fromCharCode(c));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')},
 dec:s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}};
const cat=(...a)=>{const o=new Uint8Array(a.reduce((n,x)=>n+x.length,0));let i=0;for(const x of a){o.set(x,i);i+=x.length}return o};
async function hkdf(salt,ikm,info,len){const k=await crypto.subtle.importKey('raw',ikm,'HKDF',false,['deriveBits']);return new Uint8Array(await crypto.subtle.deriveBits({name:'HKDF',hash:'SHA-256',salt,info},k,len*8))}
// vapid: {publicKey (b64url raw 65B), privateKey (b64url 32B d)}
export async function vapidAuth(endpoint,vapid,subject){
 const aud=new URL(endpoint).origin,pub=b64u.dec(vapid.publicKey);
 const jwk={kty:'EC',crv:'P-256',d:vapid.privateKey,x:b64u.enc(pub.slice(1,33)),y:b64u.enc(pub.slice(33,65))};
 const key=await crypto.subtle.importKey('jwk',jwk,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
 const h=b64u.enc(enc.encode(JSON.stringify({typ:'JWT',alg:'ES256'}))),p=b64u.enc(enc.encode(JSON.stringify({aud,exp:Math.floor(Date.now()/1000)+12*3600,sub:subject})));
 const sig=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,enc.encode(h+'.'+p));
 return`vapid t=${h}.${p}.${b64u.enc(sig)}, k=${vapid.publicKey}`}
export async function encrypt(sub,payload){
 const uaPub=b64u.dec(sub.keys.p256dh),auth=b64u.dec(sub.keys.auth);
 const as=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
 const asPub=new Uint8Array(await crypto.subtle.exportKey('raw',as.publicKey));
 const uaKey=await crypto.subtle.importKey('raw',uaPub,{name:'ECDH',namedCurve:'P-256'},false,[]);
 const shared=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:uaKey},as.privateKey,256));
 const ikm=await hkdf(auth,shared,cat(enc.encode('WebPush: info\0'),uaPub,asPub),32);
 const salt=crypto.getRandomValues(new Uint8Array(16));
 const cek=await hkdf(salt,ikm,enc.encode('Content-Encoding: aes128gcm\0'),16),nonce=await hkdf(salt,ikm,enc.encode('Content-Encoding: nonce\0'),12);
 const k=await crypto.subtle.importKey('raw',cek,'AES-GCM',false,['encrypt']);
 const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:nonce},k,cat(enc.encode(payload),new Uint8Array([2]))));
 const rs=new Uint8Array([0,0,16,0]);// 4096
 return cat(salt,rs,new Uint8Array([asPub.length]),asPub,ct)}
export async function sendPush(sub,payload,vapid,subject,fetchImpl=fetch){
 const body=await encrypt(sub,payload);
 return fetchImpl(sub.endpoint,{method:'POST',headers:{Authorization:await vapidAuth(sub.endpoint,vapid,subject),'Content-Encoding':'aes128gcm','Content-Type':'application/octet-stream',TTL:'120',Urgency:'high'},body})}
