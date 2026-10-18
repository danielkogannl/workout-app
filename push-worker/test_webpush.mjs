import{encrypt,vapidAuth,b64u}from'./src/webpush.js';import{validate}from'./src/index.js';import assert from'assert';
const S=crypto.subtle,te=new TextEncoder();let n=0;const ok=m=>{n++;console.log('ok -',m)};
async function hkdf(salt,ikm,info,len){const k=await S.importKey('raw',ikm,'HKDF',false,['deriveBits']);return new Uint8Array(await S.deriveBits({name:'HKDF',hash:'SHA-256',salt,info},k,len*8))}
const cat=(...a)=>Uint8Array.from(a.flatMap(x=>[...x]));
// fake browser subscription
const ua=await S.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']),uaPub=new Uint8Array(await S.exportKey('raw',ua.publicKey)),auth=crypto.getRandomValues(new Uint8Array(16));
const sub={endpoint:'https://web.push.apple.com/QAbc',keys:{p256dh:b64u.enc(uaPub),auth:b64u.enc(auth)}};
const body=await encrypt(sub,'{"title":"Rest over"}');
// decrypt as the browser would (RFC 8291)
const salt=body.slice(0,16),idlen=body[20],asPub=body.slice(21,21+idlen),ct=body.slice(21+idlen);
const asKey=await S.importKey('raw',asPub,{name:'ECDH',namedCurve:'P-256'},false,[]);
const shared=new Uint8Array(await S.deriveBits({name:'ECDH',public:asKey},ua.privateKey,256));
const ikm=await hkdf(auth,shared,cat(te.encode('WebPush: info\0'),uaPub,asPub),32);
const cek=await hkdf(salt,ikm,te.encode('Content-Encoding: aes128gcm\0'),16),nonce=await hkdf(salt,ikm,te.encode('Content-Encoding: nonce\0'),12);
const pt=new Uint8Array(await S.decrypt({name:'AES-GCM',iv:nonce},await S.importKey('raw',cek,'AES-GCM',false,['decrypt']),ct));
assert.equal(new TextDecoder().decode(pt.slice(0,-1)),'{"title":"Rest over"}');assert.equal(pt[pt.length-1],2);ok('aes128gcm payload decrypts (RFC 8291)');
// VAPID
const vk=await S.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']),jwk=await S.exportKey('jwk',vk.privateKey),vpub=b64u.enc(new Uint8Array(await S.exportKey('raw',vk.publicKey)));
const h=await vapidAuth(sub.endpoint,{publicKey:vpub,privateKey:jwk.d},'mailto:x@y.z');const[,t,k]=h.match(/^vapid t=([^,]+), k=(.+)$/);assert.equal(k,vpub);
const[a,b,c]=t.split('.');assert.ok(await S.verify({name:'ECDSA',hash:'SHA-256'},vk.publicKey,b64u.dec(c),te.encode(a+'.'+b)));
const claims=JSON.parse(new TextDecoder().decode(b64u.dec(b)));assert.equal(claims.aud,'https://web.push.apple.com');assert.ok(claims.exp>Date.now()/1000);ok('VAPID JWT valid ES256, aud = push origin');
const now=Date.now(),good={id:'dev-12345678',sub,at:now+90000};
assert.equal(validate(good,now),null);assert.equal(validate({...good,at:now+3600e3},now),'bad time');
assert.equal(validate({...good,sub:{...sub,endpoint:'https://evil.example.com/x'}},now),'endpoint not a push service');
assert.equal(validate({id:'x'},now),'bad id');assert.equal(validate({id:'dev-12345678',action:'cancel'},now),null);ok('request validation (time window, push-host allowlist, ids)');
console.log(n+' worker tests passed');
