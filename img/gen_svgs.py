# Simple stick-figure SVG generator. Coordinates in 200x150 box (y down).
F={}
def L(*p):return ' '.join(f'{x},{y}' for x,y in p)
def fig(name,cap,head,lines,props='',top=False):
    s=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160"><rect width="200" height="160" fill="#1c1c1e"/>'
    s+=props.replace('P','stroke="#8e8e93" stroke-width="4" fill="none" stroke-linecap="round"').replace('Q','fill="#0a84ff"')
    for l in lines: s+=f'<polyline points="{L(*l)}" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
    s+=f'<circle cx="{head[0]}" cy="{head[1]}" r="9" fill="#fff"/>'
    s+=f'<text x="100" y="155" fill="#8e8e93" font-family="sans-serif" font-size="11" text-anchor="middle">{cap}</text></svg>'
    F[name]=s
ln=lambda a,b,c,d:f'<line x1="{a}" y1="{b}" x2="{c}" y2="{d}" P/>'
db=lambda x,y:f'<rect x="{x-9}" y="{y-4}" width="18" height="8" rx="2" Q/>'
pl=lambda x,y,r=11:f'<circle cx="{x}" cy="{y}" r="{r}" Q/>'
fig('bench','Lie on bench, feet on floor, press up',(44,88),[[(58,92),(120,92),(146,92),(150,135)],[(66,92),(66,68),(66,46)]],ln(30,102,150,102)+ln(40,102,40,135)+ln(140,102,140,135)+pl(66,44))
fig('dbbench','Dumbbells over chest, press up',(44,88),[[(58,92),(120,92),(146,92),(150,135)],[(66,92),(66,68),(66,46)]],ln(30,102,150,102)+ln(40,102,40,135)+ln(140,102,140,135)+db(66,44))
fig('legpress','Back flat on pad, push sled away',(52,58),[[(62,70),(92,112),(118,80),(146,92)],[(64,74),(76,96),(90,110)]],ln(50,64,86,124)+ln(86,124,110,124)+ln(156,60,140,124))
fig('csrow','Chest on incline bench, pull elbows back',(142,50),[[(130,60),(72,104),(56,124),(46,138)],[(130,60),(112,68),(112,92)]],ln(48,126,132,66)+db(112,96))
fig('lyingcurl','Lie face down, curl heels to glutes',(36,86),[[(50,92),(110,92),(146,92),(130,60)],[(50,92),(42,104)]],ln(30,102,155,102)+pl(128,56,7))
fig('seatedcurl','Sit tall, pull pad down and back',(78,40),[[(80,54),(90,96),(132,96),(126,134)],[(80,58),(98,72),(116,78)]],ln(70,104,130,104)+ln(70,104,66,50)+pl(130,138,7))
fig('lateral','Raise arms out to shoulder height',(100,28),[[(100,40),(100,90)],[(100,90),(90,116),(88,140)],[(100,90),(110,116),(112,140)],[(100,46),(128,48),(154,50)],[(100,46),(72,48),(46,50)]],db(156,50)+db(44,50))
fig('facepull','Pull rope to face, elbows high',(110,28),[[(110,40),(110,90),(108,140)],[(110,90),(116,140)],[(110,44),(128,40),(98,34)]],ln(20,20,20,60)+ln(20,38,98,34))
fig('suitcase','One hand, walk tall, no lean',(100,28),[[(100,40),(100,90)],[(100,90),(92,116),(86,140)],[(100,90),(108,116),(116,140)],[(100,46),(110,70),(114,94)],[(100,46),(86,68),(80,88)]],f'<rect x="106" y="94" width="16" height="16" rx="4" fill="#0a84ff"/>')
fig('pullup','Hang, pull chest to bar',(100,32),[[(100,44),(100,96),(96,140)],[(100,96),(104,140)],[(100,48),(72,40),(78,16)],[(100,48),(128,40),(122,16)]],ln(50,14,150,14))
fig('rdl','Hips back, flat back',(68,56),[[(80,62),(130,60),(128,100),(126,140)],[(80,62),(86,86),(90,108)]],pl(90,110,12)+'<path d="M140 50 l18 0 m-6 -5 l6 5 l-6 5" stroke="#0a84ff" stroke-width="3" fill="none"/>')
fig('ohp','Sit tall, press dumbbells overhead',(100,32),[[(100,44),(100,96),(126,96),(126,136)],[(100,48),(76,34),(80,12)],[(100,48),(124,34),(120,12)]],ln(84,100,140,100)+db(80,10)+db(120,10))
fig('bss','Rear foot on bench, drop back knee',(102,36),[[(102,48),(104,96)],[(104,96),(76,100),(76,140)],[(104,96),(122,132),(150,110)],[(102,54),(108,76),(108,96)]],ln(140,112,182,112)+ln(160,112,160,140)+db(108,100))
fig('incurl','Lean back, curl without swinging',(90,34),[[(92,46),(76,104),(112,108),(116,140)],[(92,50),(88,82),(108,66)]],ln(60,120,100,38)+db(110,64))
fig('pushdown','Elbows pinned at sides, push down',(90,28),[[(90,40),(90,90),(88,140)],[(90,90),(96,140)],[(90,46),(92,72),(110,96)]],ln(120,6,110,96))
fig('reardelt','Arms wide, squeeze back (rear view)',(100,28),[[(100,40),(100,96)],[(100,96),(84,104),(84,136)],[(100,96),(116,104),(116,136)],[(100,46),(128,46),(156,44)],[(100,46),(72,46),(44,44)]],ln(76,104,124,104)+pl(156,44,6)+pl(44,44,6))
fig('pulldown','Pull bar to upper chest, chest up',(100,38),[[(100,50),(100,98),(70,100),(70,138)],[(100,98),(130,100),(130,138)],[(100,56),(76,72),(74,48)],[(100,56),(124,72),(126,48)]],ln(56,48,144,48)+ln(100,48,100,4)+ln(84,106,116,106))
fig('legext','Sit tall, straighten knees',(82,40),[[(84,54),(90,96),(126,96),(166,90)],[(84,58),(98,82),(110,96)]],ln(70,104,130,104)+ln(70,104,66,50)+pl(164,98,7))
fig('cablerow','Sit tall, pull handle to belly',(118,50),[[(118,62),(122,110),(92,96),(62,112)],[(118,66),(142,82),(114,88)]],ln(10,88,114,88)+ln(56,100,56,124)+ln(100,118,140,118))
fig('pallof','Top view: press out, resist turning',(100,64),[[(80,76),(120,76)],[(84,76),(94,104),(100,128)],[(116,76),(106,104),(100,128)]],ln(10,128,100,128)+ln(10,110,10,146))
for n,s in F.items(): open(n+'.svg','w').write(s)
