var shown=null,curId=0;const svg='<svg viewBox="0 0 200 70" aria-hidden="true"><path fill="#fff" fill-opacity=".92" d="M8 52Q10 41 30 39L52 23Q60 16 76 16H118Q132 16 142 26L160 39Q186 41 190 52V57H8Z"/><path fill="#0f1a33" fill-opacity=".55" d="M58 25L74 19H116Q126 19 133 27L142 37H50Z"/><circle cx="48" cy="57" r="12" fill="#0f1a33"/><circle cx="152" cy="57" r="12" fill="#0f1a33"/><circle cx="48" cy="57" r="5" fill="#ddd"/><circle cx="152" cy="57" r="5" fill="#ddd"/></svg>';
const cars=window.CARS||[];
const $=id=>document.getElementById(id),grid=$('grid'),fmt=n=>'AED '+n.toLocaleString('en-US');
function render(){
 const b=$('brand').value,t=$('body').value,m=+$('bud').value,o=$('sort').value;
 let l=cars.filter(c=>(b==='all'||c.b===b)&&(t==='all'||c.t===t)&&(!m||c.p<=m));
 const f={pa:(x,y)=>x.p-y.p,pd:(x,y)=>y.p-x.p,yd:(x,y)=>y.y-x.y,ka:(x,y)=>x.k-y.k}[o];
 if(f)l.sort(f);shown=l;
 $('count').textContent=l.length+(l.length===1?' car':' cars')+' found';
 grid.innerHTML=l.length?l.map(c=>`<article class="car"><div class="pic" style="--c1:${c.c[0]};--c2:${c.c[1]}">${c.img?`<img src="${c.img}" alt="${c.n} ${c.y}">`:svg}<small>${c.tag}</small></div><div class="body"><h3>${c.n}</h3><div class="meta">${c.y} · ${c.k.toLocaleString('en-US')} km · ${c.t}</div><div class="row"><span class="price">${fmt(c.p)}</span><button class="viewbtn" data-id="${c.id}">View</button></div></div></article>`).join(''):'<p>No cars match these filters. Try a wider budget or another brand.</p>';
}
cars.forEach((c,i)=>c.id=i);
['sort','brand','body','bud'].forEach(i=>$(i).addEventListener('change',render));render();

const B=["Hyundai","Kia","Genesis","Mercedes-Benz","KG Mobility"];
$('track').innerHTML=[...B,...B,...B,...B].map(b=>`<button data-b="${b}">${b}</button>`).join('');
$('track').addEventListener('click',e=>{const b=e.target.dataset.b;if(!b)return;const sel=$('brand');if([...sel.options].some(o=>o.value===b)){sel.value=b;render()}$('cars').scrollIntoView()});
const dlg=$('dlg');
function openCar(id){const c=cars[id];
 const d=$('dpic');d.style.setProperty('--c1',c.c[0]);d.style.setProperty('--c2',c.c[1]);d.innerHTML=c.img?`<img src="${c.img}" alt="${c.n}">`:svg;d.classList.remove('zoom');if(c.img)d.insertAdjacentHTML('beforeend','<span class="dzoom">Click to zoom</span>');
 $('dt').textContent=c.n;$('dp').textContent=fmt(c.p);
 $('ds').innerHTML=[['Brand',c.b],['Year',c.y],['Mileage',c.k.toLocaleString('en-US')+' km'],['Body type',c.t],['Highlight',c.tag],['Status','Available']].map(r=>`<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('');
 if(!dlg.open)dlg.showModal();curId=id;extra(c)}
grid.addEventListener('click',e=>{const v=e.target.closest('.viewbtn');if(v)openCar(+v.dataset.id)});
$('denq').addEventListener('click',()=>dlg.close());
$('dclose').addEventListener('click',()=>dlg.close());
dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
dlg.addEventListener('pointermove',e=>{const s=$('dpic').querySelector('svg');if(s)s.style.transform=`rotateY(${-14+(e.clientX/innerWidth-.5)*30}deg)`});

(function(){
const items=cars.filter(c=>c.img),n=items.length;if(!n){$('wheel').style.display='none';return}
const st=$('wst'),wh=$('wwheel'),lab=$('wlab'),ttl=$('wttl'),idx=$('widx');
const CARD_H=.38,CARD_W=.34,RATIO=1.45,STEP=40,DRUM=2.22,LENS=2.7,RING=1.14,BOW=1.82,CULL=1.6,EASE=.12,last=n-1;
const cl=(v,a,b)=>Math.min(b,Math.max(a,v)),rad=d=>d*Math.PI/180;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
wh.innerHTML=items.map((c,i)=>`<div class="wcard" data-i="${i}"><span><img src="${c.img}" alt="${c.n}" draggable="false"></span></div>`).join('');
idx.innerHTML=items.map((c,i)=>`<li><button data-i="${i}">${c.n}</button></li>`).join('');
const cards=[...wh.children],btns=[...idx.querySelectorAll('button')];
let turn=0,target=0,active=-1,M=null,timer;
const to=v=>{target=cl(v,0,last+1)};
function measure(){const w=st.clientWidth,h=st.clientHeight;if(!h)return;
 const cw=Math.min(h*CARD_H*RATIO,w*CARD_W),ch=cw/RATIO,ringR=ch*RING;
 M={drumR:ch*DRUM,ringR,bow:ch*BOW,ringScale:cl((2*Math.PI*ringR/n*.82)/cw,.16,1)};
 st.style.perspective=ch*LENS+'px';
 cards.forEach(c=>{c.style.cssText+=`width:${cw}px;height:${ch}px;margin-left:${-cw/2}px;margin-top:${-ch/2}px`});
 lab.style.fontSize=ttl.style.fontSize=ch*.124+'px';idx.style.fontSize=Math.max(12,ch*.05)+'px'}
new ResizeObserver(measure).observe(st);measure();
function draw(){requestAnimationFrame(draw);if(!M)return;
 const g=target-turn;turn=Math.abs(g)<.0005?target:turn+g*(reduce?1:EASE);
 const m=cl(turn,0,1),pos=Math.max(0,turn-1);
 wh.style.transform=`translateZ(${-m*M.drumR}px)`;
 cards.forEach((c,i)=>{const d=i-pos,dd=d*STEP;
  c.style.transform=`translateX(${-m*M.bow*(1-Math.cos(rad(dd)))}px) rotateZ(${(1-m)*d*(360/n)}deg) translateY(${-(1-m)*M.ringR}px) rotateX(${m*dd}deg) translateZ(${m*M.drumR}px)`;
  c.style.opacity=m>.5&&Math.abs(d)>CULL?'0':'1';c.style.zIndex=Math.round(100-Math.abs(d)*2);
  c.firstElementChild.style.transform=`scale(${M.ringScale+(1-M.ringScale)*m})`});
 lab.style.opacity=1-m;ttl.style.opacity=m;
 const a=cl(Math.round(pos),0,last);
 if(a!==active){active=a;const c=items[a];ttl.innerHTML=`${c.n}<small>${fmt(c.p)} · ${c.y}</small>`;btns.forEach((b,i)=>b.classList.toggle('on',i===a))}}
requestAnimationFrame(draw);
st.addEventListener('wheel',e=>{const nx=target+e.deltaY/900;if(nx>0&&nx<last+1)e.preventDefault();to(nx);clearTimeout(timer);timer=setTimeout(()=>to(Math.round(target)),140)},{passive:false});
let dy=null,moved=0;
st.addEventListener('pointerdown',e=>{dy=e.clientY;moved=0;st.setPointerCapture(e.pointerId)});
st.addEventListener('pointermove',e=>{if(dy===null)return;moved+=Math.abs(dy-e.clientY);to(target+(dy-e.clientY)/420);dy=e.clientY});
st.addEventListener('pointerup',e=>{dy=null;
 if(moved<6){const t=document.elementsFromPoint(e.clientX,e.clientY).find(x=>x.classList&&x.classList.contains('wcard'));
  if(t){const i=+t.dataset.i;if(turn>.95&&i===active)openCar(items[i].id);else to(i+1)}}
 else if(target>1)to(Math.round(target))});
st.addEventListener('keydown',e=>{if(e.key==='ArrowDown')to(Math.round(target)+1);else if(e.key==='ArrowUp')to(Math.round(target)-1);else return;e.preventDefault()});
idx.addEventListener('click',e=>{const b=e.target.closest('button');if(b)to(+b.dataset.i+1)});
})();

/* page life */
const nav=document.querySelector('.nav');addEventListener('scroll',()=>nav.classList.toggle('on',scrollY>40),{passive:true});
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rio.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.rv').forEach(x=>rio.observe(x));
if(matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches){
 grid.addEventListener('pointermove',e=>{const c=e.target.closest('.car');if(!c)return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`rotateY(${x*14}deg) rotateX(${-y*14}deg) translateZ(10px)`});
 grid.addEventListener('pointerout',e=>{const c=e.target.closest('.car');if(c)c.style.transform=''})}
/* black hole: one ray per pixel, bent through Schwarzschild space */
(function(){
const FRAG=`precision highp float;
#define IN 3.0
#define OUT 15.0
#define TH 0.26
#define SPIN 0.377
#define GR 0.48
#define CYC 46.0
#define SKY 36.0
const vec3 HOT=vec3(1.0,0.896,0.73),MIDC=vec3(1.0,0.314,0.04),COOL=vec3(0.27,0.042,0.003);
uniform vec2 uRes,uFocus;uniform float uT,uSteps,uTan;uniform vec3 uCam,uR,uU,uF;
float h13(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
return mix(mix(mix(h13(i),h13(i+vec3(1,0,0)),f.x),mix(h13(i+vec3(0,1,0)),h13(i+vec3(1,1,0)),f.x),f.y),mix(mix(h13(i+vec3(0,0,1)),h13(i+vec3(1,0,1)),f.x),mix(h13(i+vec3(0,1,1)),h13(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<3;i++){s+=a*vn(p);p=p*2.03+vec3(11.3,7.1,3.7);a*=.5;}return s;}
void gas(vec3 p,float rd,out float dens,out vec3 tint,out float heat){
float rn=clamp((rd-IN)/(OUT-IN),0.,1.);float tk=TH*(.35+1.25*rn);float v=p.y/tk;float sheet=exp(-v*v);
float phi=atan(p.z,p.x);float om=SPIN*pow(IN/rd,1.5);float lr=log(rd)*1.1+SPIN*uT*.05;
float u=uT/CYC,fA=fract(u),fB=fract(u+.5),w=abs(2.*fA-1.);float aA=phi+om*fA*CYC,aB=phi+om*fB*CYC;
float c=mix(fbm(vec3(vec2(cos(aA),sin(aA))*rd*GR,lr)),fbm(vec3(vec2(cos(aB),sin(aB))*rd*GR,lr+40.)),w);
float prof=smoothstep(0.,.07,rn)*(1.-smoothstep(.45,1.,rn))*pow(IN/rd,2.);
dens=max(0.,c*c*1.75*1.5-.3)*sheet*prof*4.6;heat=pow(IN/rd,.8)*(.72+.55*c);
tint=mix(COOL,MIDC,smoothstep(.1,.52,heat));tint=mix(tint,HOT,smoothstep(.52,1.05,heat));}
void main(){
vec2 uv=(gl_FragCoord.xy-uFocus*uRes)/uRes.y;
vec3 vel=normalize(uF+(uv.x*uR+uv.y*uU)*2.*uTan);vec3 pos=uCam;
vec3 hv=cross(pos,vel);float h2=dot(hv,hv),h=sqrt(h2),swept=0.;vec3 col=vec3(0.);float tr=1.;
float jit=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
for(int i=0;i<240;i++){
if(float(i)>=uSteps)break;
float r2=dot(pos,pos),r=sqrt(r2);
if(r<1.||tr<.004)break;if(r>SKY&&dot(pos,vel)>0.)break;
float dt=clamp(.14*(r-1.),.025,1.1);
if(r<OUT*1.25){float rn=clamp((r-IN)/(OUT-IN),0.,1.);float tk=TH*(.35+1.25*rn);dt=min(dt,max(tk*.38,abs(pos.y)*.5));}
swept+=h*dt/r2;float deep=exp(-1.3*max(0.,swept-4.6));
jit=fract(jit+.6180339887);vec3 mid=pos+vel*dt*jit;float rd=length(mid.xz);
if(rd>IN&&rd<OUT&&abs(mid.y)<TH*5.){float dens,heat;vec3 tint;gas(mid,rd,dens,tint,heat);
if(dens>.001){vec3 tang=normalize(cross(vec3(0,1,0),vec3(mid.x,0.,mid.z)));
float beta=min(.85,sqrt(.5/max(rd,1.5)));float gam=inversesqrt(1.-beta*beta);
float g=1./(gam*(1.-beta*dot(tang,-normalize(vel))));g*=sqrt(max(.05,1.-1./rd));
float boost=pow(max(g,.02),1.05);col+=tint*(.26+2.*heat*heat)*boost*dens*tr*dt*deep;tr*=exp(-dens*.3*dt);}}
vec3 acc=-1.5*h2*pos/(r2*r2*r);vel+=acc*dt;pos+=vel*dt;}
col*=.9;col=clamp((col*(2.51*col+.03))/(col*(2.43*col+.59)+.14),0.,1.);
gl_FragColor=vec4(pow(col,vec3(.4545)),1.);}`;
const cv=$('bh'),hero=$('hero'),gl=cv.getContext('webgl',{antialias:false,alpha:false});
if(!gl){hero.classList.add('nogl');return}
const mk=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x};
const pr=gl.createProgram();gl.attachShader(pr,mk(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));gl.attachShader(pr,mk(gl.FRAGMENT_SHADER,FRAG));gl.linkProgram(pr);
if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){hero.classList.add('nogl');return}
gl.useProgram(pr);gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
const U=n=>gl.getUniformLocation(pr,n),reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
let t=reduce?6:0,last=0,vis=true;
function setup(){const nar=innerWidth<768,D=24,el=(nar?-7:-5.5)*Math.PI/180,ce=Math.cos(el);
 const cam=[D*ce,D*Math.sin(el),0],f=cam.map(v=>-v/D);let r=[f[2],0,-f[0]];const rl=Math.hypot(...r);r=r.map(v=>v/rl);
 const u=[r[1]*f[2]-r[2]*f[1],r[2]*f[0]-r[0]*f[2],r[0]*f[1]-r[1]*f[0]],cr=Math.cos(-20*Math.PI/180),sr=Math.sin(-20*Math.PI/180);
 const R=r.map((v,i)=>v*cr+u[i]*sr),Up=r.map((v,i)=>-v*sr+u[i]*cr);
 const q=Math.min(devicePixelRatio||1,1.5)*(nar?.5:.6);cv.width=Math.max(2,Math.round(cv.clientWidth*q));cv.height=Math.max(2,Math.round(cv.clientHeight*q));gl.viewport(0,0,cv.width,cv.height);
 gl.uniform2f(U('uRes'),cv.width,cv.height);gl.uniform2f(U('uFocus'),...(nar?[.5,.24]:[.72,.54]));
 gl.uniform3f(U('uCam'),...cam);gl.uniform3f(U('uF'),...f);gl.uniform3f(U('uR'),...R);gl.uniform3f(U('uU'),...Up);
 gl.uniform1f(U('uTan'),Math.tan((nar?58:42)*.5*Math.PI/180));gl.uniform1f(U('uSteps'),nar?150:200);}
function frame(){gl.uniform1f(U('uT'),t);gl.drawArrays(gl.TRIANGLES,0,3)}
function tick(n){requestAnimationFrame(tick);if(!vis||document.hidden){last=n;return}t+=Math.min(.05,(n-(last||n))/1000);last=n;frame()}
setup();frame();if(!reduce)requestAnimationFrame(tick);
new ResizeObserver(()=>{setup();frame()}).observe(hero);
new IntersectionObserver(e=>{vis=e[0].isIntersecting}).observe(hero);
})();
/* intro, progress, scroll depth, cursor glow */
(function(){
const ld=$('ldn'),bar=$('ldb'),L=$('ld'),fast=matchMedia('(prefers-reduced-motion:reduce)').matches;let n=0;
const iv=setInterval(()=>{n=Math.min(100,n+(fast?50:4+Math.random()*7));ld.textContent=Math.round(n);bar.style.width=n+'%';if(n>=100){clearInterval(iv);setTimeout(()=>L.classList.add('done'),250)}},60);
const prog=$('prog'),bh=document.querySelector('.bhwrap'),hi=document.querySelector('.hero-in');
function sc(){const p=Math.min(1,scrollY/innerHeight),mx=Math.max(1,document.documentElement.scrollHeight-innerHeight);prog.style.width=(scrollY/mx*100)+'%';
 if(!fast){bh.style.transform=`translateY(${p*90}px) scale(${1+p*.14})`;hi.style.transform=`perspective(900px) translate3d(0,${-p*50}px,${-p*220}px)`;hi.style.opacity=1-p*1.25}}
addEventListener('scroll',sc,{passive:true});sc();
const g=$('glow');if(matchMedia('(hover:hover)').matches&&!fast)addEventListener('pointermove',e=>{g.style.left=e.clientX+'px';g.style.top=e.clientY+'px'},{passive:true});else g.remove();
})();
/* embers: three.js particles that drift up and lean with the mouse and scroll */
(function(){
const cv=$('fx');if(!window.THREE||matchMedia('(prefers-reduced-motion:reduce)').matches){cv.remove();return}
const r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:false});r.setPixelRatio(Math.min(devicePixelRatio,1.5));
const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(55,1,.1,100);cam.position.z=14;
const N=innerWidth<768?260:520,pos=new Float32Array(N*3),spd=new Float32Array(N);
for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*40;pos[i*3+1]=(Math.random()-.5)*26;pos[i*3+2]=(Math.random()-.5)*30;spd[i]=.15+Math.random()*.5}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
const pts=new THREE.Points(g,new THREE.PointsMaterial({color:0xFFA85A,size:.09,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending}));sc.add(pts);
let mx=0,vis=true,last=0;addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5},{passive:true});
function rs(){r.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}rs();addEventListener('resize',rs);
document.addEventListener('visibilitychange',()=>{vis=!document.hidden});
(function loop(t){requestAnimationFrame(loop);if(!vis)return;const dt=Math.min(.05,(t-last)/1000||0);last=t;
 const a=g.attributes.position.array;for(let i=0;i<N;i++){a[i*3+1]+=spd[i]*dt*2;a[i*3]+=Math.sin(t*.0004+i)*dt*.2;if(a[i*3+1]>13)a[i*3+1]=-13}
 g.attributes.position.needsUpdate=true;pts.rotation.y+=(mx*.5-pts.rotation.y)*.03;pts.position.z=Math.sin(scrollY*.0015)*3;cam.position.x+=(mx*2-cam.position.x)*.03;cam.lookAt(0,0,0);r.render(sc,cam)})(0);
})();
/* zoom in the car pop-up */
(function(){const d=$('dpic');
d.addEventListener('click',()=>{if(!d.querySelector('img'))return;d.classList.toggle('zoom');const h=d.querySelector('.dzoom');if(h)h.textContent=d.classList.contains('zoom')?'Move to pan · click to exit':'Click to zoom'});
d.addEventListener('pointermove',e=>{const i=d.querySelector('img');if(!i||!d.classList.contains('zoom'))return;const r=d.getBoundingClientRect();i.style.transformOrigin=((e.clientX-r.left)/r.width*100)+'% '+((e.clientY-r.top)/r.height*100)+'%'})})();
/* GTA-style car selector */
const ST={"Hyundai Tucson":[62,78,80,84,82],"Kia Sportage":[64,80,84,84,80],"Genesis G80":[82,95,92,80,66],"Hyundai Sonata":[60,80,82,78,86],"Kia Sorento":[66,82,82,94,78],"Genesis GV70":[84,92,92,82,70],"Mercedes-Benz C-Class":[80,90,90,70,68],"Mercedes-Benz GLC":[84,92,94,84,66]};
const SL=['Power','Comfort','Technology','Space','Value'];
const FT={Genesis:['Luxury cabin','Premium audio','Driver assist','Signature lighting'],'Mercedes-Benz':['Premium interior','Ambient lighting','Driver assist','Digital cockpit'],Hyundai:['Touchscreen display','Driver assist','Spacious cabin','Rear camera'],Kia:['Touchscreen display','Driver assist','Spacious cabin','Rear camera']};
const list=()=>shown&&shown.length?shown:cars;
function extra(c){
 $('dbrand').textContent=c.b+' · '+c.t;$('ddesc').textContent=c.desc||'';
 const v=c.st||ST[c.n]||[70,70,70,70,70];
 $('bars').innerHTML=SL.map((l,i)=>`<div class="bar"><span>${l}</span><i><b data-v="${v[i]}" style="transition-delay:${i*90+150}ms"></b></i><em>${v[i]}</em></div>`).join('');
 requestAnimationFrame(()=>requestAnimationFrame(()=>$('bars').querySelectorAll('b').forEach(b=>{b.style.width=b.dataset.v+'%'})));
 $('chips').innerHTML=[c.tag,...(FT[c.b]||[])].map(x=>`<span>${x}</span>`).join('');
 const L=list(),i=Math.max(0,L.findIndex(x=>x.id===c.id));
 $('dcount').textContent=String(i+1).padStart(2,'0')+' / '+String(L.length).padStart(2,'0');
 const t0=performance.now();(function s(t){const k=Math.min(1,(t-t0)/750);$('dp').textContent=fmt(Math.round(c.p*(1-Math.pow(1-k,3))));if(k<1)requestAnimationFrame(s)})(t0);
 const info=document.querySelector('.dinfo');info.classList.remove('go');void info.offsetWidth;info.classList.add('go');
}
function go(d){const L=list(),i=L.findIndex(x=>x.id===curId),n=L[(i+d+L.length)%L.length],p=$('dpic');
 p.style.setProperty('--dx',d>0?'70px':'-70px');openCar(n.id);p.classList.remove('sw');void p.offsetWidth;p.classList.add('sw')}
$('dprev').addEventListener('click',()=>go(-1));$('dnext').addEventListener('click',()=>go(1));
addEventListener('keydown',e=>{if(!dlg.open)return;if(e.key==='ArrowRight')go(1);else if(e.key==='ArrowLeft')go(-1)});

/* booking */
const bk=$('bk'),bf=$('bkf');
function book(c){bk.dataset.uid=c?c.uid:'';bk.dataset.name=c?c.n:'';$('bkt').textContent=c?'Book the '+c.n:'Book a viewing';$('bkm').textContent='';bf.date.min=new Date().toISOString().slice(0,10);bk.showModal()}
$('denq').addEventListener('click',()=>book(cars[curId]));$('genbook').addEventListener('click',()=>book(null));$('bkx').addEventListener('click',()=>bk.close());
bf.addEventListener('submit',async e=>{e.preventDefault();const m=$('bkm'),f=Object.fromEntries(new FormData(bf));f.carId=bk.dataset.uid;f.carName=bk.dataset.name;m.textContent='Sending...';
 try{const r=await fetch('/api/bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(f)});if(!r.ok)throw 0;bf.reset();m.textContent='Thank you! We received your request and will contact you soon.'}catch(x){m.textContent='Could not send. Please message us on Instagram or call.'}});
