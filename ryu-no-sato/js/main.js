/* ============ 共通の道具 ============ */
const rnd=s=>()=>{s=(s*16807)%2147483647;return(s-1)/2147483646};
let D=Math.min(2,devicePixelRatio||1);
const INK='36,35,31',PAPER='236,233,224';
const NZ={};
function vnoise(seed){if(NZ[seed])return NZ[seed];const r=rnd(seed+11),v=Array.from({length:1024},r);
  return NZ[seed]=x=>{const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return v[i&1023]*(1-u)+v[(i+1)&1023]*u}}
function fbm(n,x){return(n(x)+n(x*2.03)*.5+n(x*4.1)*.25+n(x*8.3)*.125)/1.875}
function mk(w,h){const c=document.createElement('canvas');c.width=Math.ceil(w*D);c.height=Math.ceil(h*D);const g=c.getContext('2d');g.scale(D,D);c.cssW=w;c.cssH=h;return[c,g]}

/* 筆：入り・抜き・太さの揺れ・かすれ・にじみ */
function brush(g,pts,w,a,o={}){
  const n=pts.length;if(n<2)return;
  const sd=o.seed||3,nz=vnoise(sd),r=rnd(sd*13+1),col=o.col||INK;
  const Lp=[],Rp=[],N=[];
  for(let i=0;i<n;i++){
    const p=pts[Math.max(0,i-1)],q=pts[Math.min(n-1,i+1)],dx=q[0]-p[0],dy=q[1]-p[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,t=i/(n-1);
    let tp=Math.min(1,t/(o.tin??.12),(1-t)/(o.tout??.3));tp=Math.max(0,tp);tp=tp*tp*(3-2*tp);
    const ww=w*(.1+.9*tp)*(.62+.76*nz(i*.17+sd))/2,ro=(nz(i*.8+33+sd)-.5)*w*.2;
    Lp.push([pts[i][0]+nx*(ww+ro),pts[i][1]+ny*(ww+ro)]);Rp.push([pts[i][0]-nx*(ww-ro),pts[i][1]-ny*(ww-ro)]);N.push([nx,ny,ww]);
  }
  const path=new Path2D();Lp.forEach((p,i)=>i?path.lineTo(p[0],p[1]):path.moveTo(p[0],p[1]));for(let i=n-1;i>=0;i--)path.lineTo(Rp[i][0],Rp[i][1]);path.closePath();
  if(o.bleed){g.save();g.shadowColor=`rgba(${col},${Math.min(1,a*.7)})`;g.shadowBlur=o.bleed;g.fillStyle=`rgba(${col},${a*.45})`;g.fill(path);g.restore()}
  g.fillStyle=`rgba(${col},${a})`;g.fill(path);
  if(o.dry){
    g.save();g.clip(path);g.lineCap='round';
    for(let k=0;k<o.dry;k++){
      const f=(r()-.5)*1.7,start=Math.floor(n*((o.dryFrom??.35)+r()*.25));
      g.strokeStyle=`rgba(${PAPER},${.3+r()*.55})`;g.lineWidth=.4+r()*Math.max(.6,w*.07);g.beginPath();
      let on=true;
      for(let i=start;i<n;i++){const[nx,ny,ww]=N[i],x=pts[i][0]+nx*ww*f,y=pts[i][1]+ny*ww*f;if(r()<.07)on=!on;on?g.lineTo(x,y):g.moveTo(x,y)}
      g.stroke();
    }
    g.restore();
  }
}
function curve(f,n){const p=[];for(let i=0;i<=n;i++)p.push(f(i/n));return p}

/* 金雲（すやり霞）：手で切った箔の雲 */
function goldCloud(seed,len,h){
  const r=rnd(seed),nz=vnoise(seed*7+3),pad=h*.7,tiers=[];
  let x=pad,w=len;const nT=r()<.65?3:2;
  for(let k=0;k<nT;k++){
    tiers.push({x,y:pad*.6+k*h*.6,w,h:h*(1-k*.07)});
    const nw=w*(.4+r()*.4);x=Math.max(pad*.6,x+(w-nw)*(.15+r()*.7)+(r()-.5)*w*.12);w=nw;
  }
  const W2=len*1.15+pad*2,H2=pad*1.2+h*(nT*.6+.5)+pad;
  const[c,g]=mk(W2,H2),path=new Path2D();
  tiers.forEach((t,ti)=>{
    const R=t.h/2,pts=[],e=t.h*.09;
    for(let xx=t.x+R;xx<=t.x+t.w-R;xx+=3)pts.push([xx,t.y+(nz(xx*.04+ti*9)-.5)*e*2]);
    for(let a=-Math.PI/2;a<=Math.PI/2+.01;a+=.15){const rr=R*(.9+nz(a*2+ti*5)*.2);pts.push([t.x+t.w-R+Math.cos(a)*rr*1.15,t.y+R+Math.sin(a)*rr])}
    for(let xx=t.x+t.w-R;xx>=t.x+R;xx-=3)pts.push([xx,t.y+t.h+(nz(xx*.04+ti*9+40)-.5)*e*2]);
    for(let a=Math.PI/2;a<=Math.PI*1.5+.01;a+=.15){const rr=R*(.9+nz(a*2+ti*5+20)*.2);pts.push([t.x+R+Math.cos(a)*rr*1.15,t.y+R+Math.sin(a)*rr])}
    pts.forEach((p,i)=>i?path.lineTo(p[0],p[1]):path.moveTo(p[0],p[1]));path.closePath();
  });
  g.save();g.shadowColor='rgba(150,112,52,.5)';g.shadowBlur=3;g.fillStyle='#cfa760';g.fill(path);g.restore();
  g.save();g.clip(path);
  // 金箔を一枚ずつ置く（箔足が少し見える）
  const s=Math.max(5,h*.4),G=[[216,180,106],[210,172,98],[222,188,116],[205,166,90],[214,177,102],[219,184,110]];
  for(let y=-2,row=0;y<H2;y+=s*.97,row++)for(let x=-(row%2)*s*.37-2;x<W2;x+=s*.97){
    const cc=G[Math.floor(r()*G.length)],v=(r()-.5)*9;
    g.fillStyle=`rgb(${cc[0]+v|0},${cc[1]+v|0},${cc[2]+v*.6|0})`;g.fillRect(x,y,s,s);
    g.strokeStyle=`rgba(130,96,44,${.08+r()*.12})`;g.lineWidth=.5;g.strokeRect(x+.3,y+.3,s-.6,s-.6);
  }
  const sh=g.createLinearGradient(0,0,W2*.6,H2);sh.addColorStop(0,'rgba(255,242,205,.32)');sh.addColorStop(.55,'rgba(255,242,205,0)');sh.addColorStop(1,'rgba(110,78,30,.2)');
  g.fillStyle=sh;g.fillRect(0,0,W2,H2);
  for(let k=0;k<W2*H2*.014;k++){const z=.4+r()*1.5;g.fillStyle=r()<.72?`rgba(255,245,212,${.3+r()*.6})`:`rgba(105,74,28,${.18+r()*.3})`;g.fillRect(r()*W2,r()*H2,z,z*(.5+r()*.7))}
  for(let k=0;k<len*.05;k++){g.fillStyle=`rgba(96,68,30,${.04+r()*.09})`;g.beginPath();g.arc(r()*W2,r()*H2,1+r()*5,0,7);g.fill()}
  g.globalCompositeOperation='destination-out';
  for(let k=0;k<len*.035;k++){g.fillStyle=`rgba(0,0,0,${.25+r()*.5})`;g.fillRect(r()*W2,r()*H2,.8+r()*2.6,.6+r()*1.8)}
  g.restore();
  g.globalCompositeOperation='source-over';
  g.strokeStyle='rgba(120,86,38,.42)';g.lineWidth=.9;g.stroke(path);
  return c;
}

/* ============ 里のデータ（ここを書き換えて増やす） ============ */
const VILLAGES = [
  {name:"最初の里", text:"ジーングの旅が始まる里。", x:90,  y:410},
  {name:"二の里",   text:"（未記録）", x:300, y:325},
  {name:"三の里",   text:"（未記録）", x:470, y:212},
  {name:"四の里",   text:"（未記録）", x:650, y:258},
  {name:"まだ見ぬ里", text:"（未記録）", x:745, y:330},
];
const KAN=["一","二","三","四","五","六","七","八","九","十"];

const pins=document.getElementById('pins'),list=document.getElementById('villageList'),NS="http://www.w3.org/2000/svg";
VILLAGES.forEach((v,i)=>{
  const g=document.createElementNS(NS,'g');g.setAttribute('class','pin');g.setAttribute('tabindex','0');
  g.innerHTML=`<circle cx="${v.x}" cy="${v.y}" r="15" fill="#b4432b" fill-opacity=".1"/>
    <circle class="dot" cx="${v.x}" cy="${v.y}" r="6" fill="#f2ede1" stroke="#b4432b" stroke-width="1.6"/>
    <text x="${v.x+12}" y="${v.y-40}" font-family="Shippori Mincho,serif" font-weight="600" font-size="14" fill="#24231f" writing-mode="tb" letter-spacing="3">${v.name}</text>`;
  pins.appendChild(g);
  const c=document.createElement('div');c.className='village';c.dataset.i=i;
  c.innerHTML=`<span class="no">第${KAN[i]||i+1}の里</span><span class="nm">${v.name}</span><span class="note">${v.text}</span>`;
  list.appendChild(c);
  const act=()=>document.querySelectorAll('.village').forEach(e=>e.classList.toggle('active',e.dataset.i==i));
  g.addEventListener('click',act);g.addEventListener('focus',act);
});

/* 筆文字の縦組み */
document.querySelectorAll('.scene-title,.sign b,.chapter-head h2').forEach(el=>{
  const t=el.textContent.trim();el.setAttribute('aria-label',t);el.classList.add('tate');
  el.innerHTML=[...t].map(c=>`<span aria-hidden="true">${c}</span>`).join('');
});

/* 頁を耳付きの和紙に */
document.querySelectorAll('.leaf').forEach((leaf,n)=>{
  const w=document.createElement('div');w.className='leaf-wrap';leaf.before(w);w.appendChild(leaf);
  const r=rnd(31+n*17),pts=[],J=()=>(r()*3.2).toFixed(1);
  for(let x=0;x<=100;x+=1.6)pts.push(`${x.toFixed(1)}% ${J()}px`);
  for(let y=0;y<=100;y+=1.6)pts.push(`calc(100% - ${J()}px) ${y.toFixed(1)}%`);
  for(let x=100;x>=0;x-=1.6)pts.push(`${x.toFixed(1)}% calc(100% - ${J()}px)`);
  for(let y=100;y>=0;y-=1.6)pts.push(`${J()}px ${y.toFixed(1)}%`);
  leaf.style.clipPath=`polygon(${pts.join(',')})`;
});

/* 巻の間の金雲 */
function placeGolds(){
  document.querySelectorAll('.kasumi-div').forEach(el=>{
    el.innerHTML='';const r=rnd(+el.dataset.seed||1),cw=el.clientWidth||600,n=r()<.5?2:3;
    for(let k=0;k<n;k++){
      const len=cw*(.18+r()*.26),h=Math.max(13,Math.min(22,cw*.022))*(.85+r()*.3),c=goldCloud((+el.dataset.seed)*31+k*7,len,h);
      c.style.width=c.cssW+'px';c.style.height=c.cssH+'px';c.style.left=(r()*(cw-c.cssW))+'px';c.style.top=(r()*Math.max(0,el.clientHeight-c.cssH))+'px';
      el.appendChild(c);
    }
  });
}
placeGolds();

/* 襖の金雲 */
document.querySelectorAll('.door').forEach((d,k)=>{
  [[.18,.2,.7,26],[.05,.68,.62,22]].forEach(([fx,fy,fl,h],j)=>{
    const len=Math.min(520,innerWidth*.5*fl),c=goldCloud(50+k*9+j,len,h);
    c.style.cssText=`position:absolute;left:${(k?.3-fx:fx)*100}%;top:${fy*100}%;width:${c.cssW}px;height:${c.cssH}px;opacity:.75`;
    d.appendChild(c);
  });
});

/* 古地図の金雲 */
[[150,30,240,22,61],[505,392,230,20,67]].forEach(([x,y,len,h,s])=>{
  const c=goldCloud(s,len,h),im=document.createElementNS(NS,'image');
  im.setAttribute('href',c.toDataURL());im.setAttribute('x',x);im.setAttribute('y',y);im.setAttribute('width',c.cssW);im.setAttribute('height',c.cssH);im.setAttribute('opacity','.9');
  document.getElementById('mapGold').appendChild(im);
});

/* 円相（掛軸の仮の絵）：一筆で */
(function(){
  const c=document.querySelector('.enso');if(!c)return;
  const draw=()=>{
    const w=c.clientWidth,h=c.clientHeight;if(!w)return;
    c.width=w*D;c.height=h*D;const g=c.getContext('2d');g.scale(D,D);
    const R=w*.33,x0=w/2,y0=h*.42,s=-1.25,e=s+Math.PI*1.84;
    brush(g,curve(t=>{const a=s+(e-s)*t;return[x0+Math.cos(a)*(R+Math.sin(t*9)*.8),y0+Math.sin(a)*(R*1.02)]},120),w*.1,.78,{seed:21,tin:.04,tout:.45,bleed:2,dry:9,dryFrom:.2});
  };
  draw();addEventListener('resize',draw);
})();

/* ============ ネタバレ切替と襖 ============ */
const spTag=document.getElementById('spTag'),spLabel=document.getElementById('spLabel'),fusuma=document.getElementById('fusuma');
function setSpoiler(on){
  document.body.dataset.spoiler=on?'on':'off';
  spTag.setAttribute('aria-pressed',on);spLabel.textContent=on?'ネタバレあり':'ネタバレなし';
  try{localStorage.setItem('ryu-spoiler',on?'on':'off')}catch(e){}
}
spTag.onclick=()=>setSpoiler(document.body.dataset.spoiler!=='on');
function enter(on){
  setSpoiler(on);
  if(document.getElementById('bgmAsk').checked)startBgm();
  document.body.classList.add('entering');
  fusuma.classList.add('open');setTimeout(()=>fusuma.hidden=true,2500);
}
document.getElementById('pickOff').onclick=()=>enter(false);
document.getElementById('pickOn').onclick=()=>enter(true);
let saved=null;try{saved=localStorage.getItem('ryu-spoiler')}catch(e){}
setSpoiler(saved==='on');

/* ============ 調べ：琴・尺八・ししおどし（WebAudioで生成） ============ */
let ac,master,wet,playing=false,tPhrase,tShishi;
const bgmTag=document.getElementById('bgmTag');
const SCALE=[146.83,164.81,196.00,220.00,261.63,293.66,329.63,392.00,440.00,523.25,587.33]; // 陽音階 D E G A C
function noiseBuf(sec){const b=ac.createBuffer(1,ac.sampleRate*sec,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b}
function setupAudio(){
  ac=new (window.AudioContext||window.webkitAudioContext)();
  master=ac.createGain();master.gain.value=0;master.connect(ac.destination);
  wet=ac.createDelay(2);wet.delayTime.value=.47;const fb=ac.createGain();fb.gain.value=.4;
  const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1600;
  wet.connect(lp);lp.connect(fb);fb.connect(wet);lp.connect(master);
  [73.42,110].forEach((f,i)=>{const o=ac.createOscillator();o.frequency.value=f;const g=ac.createGain();g.gain.value=.03;o.connect(g);g.connect(master);o.start();
    const l=ac.createOscillator();l.frequency.value=.04+i*.03;const lg=ac.createGain();lg.gain.value=.02;l.connect(lg);lg.connect(g.gain);l.start();});
  const n=ac.createBufferSource();n.buffer=noiseBuf(2);n.loop=true;
  const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=450;bp.Q.value=.7;
  const ng=ac.createGain();ng.gain.value=.011;n.connect(bp);bp.connect(ng);ng.connect(master);n.start();
  const wl=ac.createOscillator();wl.frequency.value=.06;const wg=ac.createGain();wg.gain.value=220;wl.connect(wg);wg.connect(bp.frequency);wl.start();
  const s=ac.createBufferSource();s.buffer=noiseBuf(3);s.loop=true;
  const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=2400;
  const sg=ac.createGain();sg.gain.value=.006;s.connect(hp);hp.connect(sg);sg.connect(master);s.start();
}
function koto(f,t,vol){
  const o=ac.createOscillator(),o2=ac.createOscillator(),o3=ac.createOscillator(),g=ac.createGain();
  o.type='triangle';o.frequency.value=f;o2.type='sine';o2.frequency.value=f*2.004;o3.type='sine';o3.frequency.value=f*3.01;
  const g2=ac.createGain();g2.gain.value=.3;const g3=ac.createGain();g3.gain.value=.08;
  o2.connect(g2);g2.connect(g);o3.connect(g3);g3.connect(g);o.connect(g);
  o.frequency.setValueAtTime(f*1.012,t);o.frequency.exponentialRampToValueAtTime(f,t+.08);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+2.8);
  g.connect(master);g.connect(wet);[o,o2,o3].forEach(x=>{x.start(t);x.stop(t+3)});
}
function shakuhachi(f,t,dur){
  const o=ac.createOscillator();o.type='sine';o.frequency.value=f;
  const vib=ac.createOscillator();vib.frequency.value=5;const vg=ac.createGain();vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(f*.012,t+dur*.6);
  vib.connect(vg);vg.connect(o.frequency);
  const br=ac.createBufferSource();br.buffer=noiseBuf(dur+.5);const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f*2;bp.Q.value=3;
  const bg=ac.createGain();bg.gain.value=.5;br.connect(bp);bp.connect(bg);
  const g=ac.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.7);g.gain.setValueAtTime(.05,t+dur-.9);g.gain.linearRampToValueAtTime(0,t+dur);
  o.connect(g);bg.connect(g);g.connect(master);g.connect(wet);
  o.frequency.setValueAtTime(f*.97,t);o.frequency.linearRampToValueAtTime(f,t+.5);
  o.start(t);vib.start(t);br.start(t);o.stop(t+dur);vib.stop(t+dur);br.stop(t+dur);
}
function shishiodoshi(){
  if(!playing)return;
  const t=ac.currentTime+.05;
  const o=ac.createOscillator();o.type='sine';o.frequency.setValueAtTime(260,t);o.frequency.exponentialRampToValueAtTime(140,t+.12);
  const g=ac.createGain();g.gain.setValueAtTime(.16,t);g.gain.exponentialRampToValueAtTime(.0001,t+.25);
  const n=ac.createBufferSource();n.buffer=noiseBuf(.2);const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1100;bp.Q.value=4;
  const ng=ac.createGain();ng.gain.setValueAtTime(.12,t);ng.gain.exponentialRampToValueAtTime(.0001,t+.08);
  o.connect(g);n.connect(bp);bp.connect(ng);[g,ng].forEach(x=>{x.connect(master);x.connect(wet)});
  o.start(t);o.stop(t+.3);n.start(t);
  tShishi=setTimeout(shishiodoshi,16000+Math.random()*14000);
}
let idx=5;
function phrase(){
  if(!playing)return;
  const t=ac.currentTime+.05,r=Math.random();
  if(r<.18){for(let k=0;k<6;k++)koto(SCALE[3+k],t+k*.06,.045);idx=8;}
  else if(r<.33){shakuhachi(SCALE[Math.floor(Math.random()*4)+3],t,3.5+Math.random()*2);}
  else{const n=1+Math.floor(Math.random()*3);
    for(let k=0;k<n;k++){idx=Math.max(2,Math.min(SCALE.length-1,idx+[-2,-1,-1,1,1,2][Math.floor(Math.random()*6)]));
      koto(SCALE[idx],t+k*(.4+Math.random()*.35),.08+Math.random()*.03);}}
  tPhrase=setTimeout(phrase,2200+Math.random()*2800);
}
function startBgm(){
  if(!ac)setupAudio();ac.resume();
  if(playing)return;playing=true;
  master.gain.cancelScheduledValues(ac.currentTime);master.gain.setValueAtTime(master.gain.value,ac.currentTime);master.gain.linearRampToValueAtTime(.9,ac.currentTime+3);
  bgmTag.setAttribute('aria-pressed','true');phrase();tShishi=setTimeout(shishiodoshi,6000);
}
function stopBgm(){
  playing=false;clearTimeout(tPhrase);clearTimeout(tShishi);bgmTag.setAttribute('aria-pressed','false');
  if(ac){master.gain.cancelScheduledValues(ac.currentTime);master.gain.setValueAtTime(master.gain.value,ac.currentTime);master.gain.linearRampToValueAtTime(0,ac.currentTime+1.5)}
}
bgmTag.onclick=()=>playing?stopBgm():startBgm();


/* ============ 墨絵の山里（canvas・視差つき） ============ */
const cv=document.getElementById('scene');let cx=cv.getContext('2d');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let W,H,U,P=48,L=[],mistSprite,golds=[],grain,lights=[],falls=[],tufts=[],birds=[],fg,sunImg;
let ptr={x:0,y:0,tx:0,ty:0};

/* 層の設計：山の位置（峰）を決めて構図をつくる。[位置, 高さ, 幅] */
const LAYERS=[
  {base:.50,amp:.2, f:300,a:.08,depth:.06,peaks:[[.16,.7,.1],[.47,.95,.09],[.9,.8,.12]]},
  {base:.60,amp:.3, f:220,a:.14,depth:.14,peaks:[[.62,1,.075],[.36,.55,.09],[.08,.4,.08]]},
  {base:.685,amp:.2,f:170,a:.23,depth:.28,peaks:[[.27,.85,.07],[.8,.75,.08]]},
  {base:.79,amp:.09,f:150,a:.34,depth:.48,peaks:[[.5,.6,.15],[.08,.3,.1]]},
  {base:.93,amp:.1, f:260,a:.52,depth:.8, peaks:[[.1,1.3,.11],[.97,1,.1]]},
];

function makeMist(){
  const[c,g]=mk(700,180),r=rnd(91);
  for(let k=0;k<80;k++){
    const x=60+r()*580,y=90+(r()-.5)*90*(1-Math.abs(x-350)/350),rad=26+r()*70;
    const gr=g.createRadialGradient(x,y,0,x,y,rad);gr.addColorStop(0,'rgba(238,235,227,.13)');gr.addColorStop(1,'rgba(238,235,227,0)');
    g.fillStyle=gr;g.fillRect(x-rad,y-rad,rad*2,rad*2);
  }
  return c;
}
function makeGrain(){
  const s=240,c=document.createElement('canvas');c.width=c.height=s;const g=c.getContext('2d'),im=g.createImageData(s,s),r=rnd(7);
  for(let i=0;i<im.data.length;i+=4){const v=214+r()*41;im.data[i]=v;im.data[i+1]=v-3;im.data[i+2]=v-10;im.data[i+3]=255}
  g.putImageData(im,0,0);
  g.strokeStyle='rgba(120,100,70,.16)';g.lineWidth=.5;
  for(let k=0;k<30;k++){g.beginPath();let x=r()*s,y=r()*s;g.moveTo(x,y);for(let j=0;j<6;j++){x+=(r()-.5)*16;y+=r()*12;g.lineTo(x,y)}g.stroke()}
  return c;
}
/* 日：にじんだ朱の円 */
function makeSun(R){
  const[c,g]=mk(R*3,R*3),nz=vnoise(77),cx0=R*1.5;
  g.save();g.shadowColor='rgba(196,98,70,.35)';g.shadowBlur=R*.35;g.beginPath();
  for(let a=0;a<=Math.PI*2+.01;a+=.05){const rr=R*(.97+nz(a*2.5)*.06);g.lineTo(cx0+Math.cos(a)*rr,cx0+Math.sin(a)*rr)}
  const gr=g.createRadialGradient(cx0-R*.2,cx0-R*.2,R*.1,cx0,cx0,R);gr.addColorStop(0,'rgba(198,104,76,.26)');gr.addColorStop(.8,'rgba(190,92,66,.32)');gr.addColorStop(1,'rgba(176,80,56,.4)');
  g.fillStyle=gr;g.fill();g.restore();
  return c;
}

/* --- 景物 --- */
function cedar(g,x,y,h,a,r){
  const n=Math.max(5,Math.round(h/2.8));
  for(let j=0;j<n;j++){const p=j/n,w=h*.25*(1-p)+.5+r()*.8,yy=y-p*h;
    g.fillStyle=`rgba(${INK},${a*(.45+r()*.55)})`;g.beginPath();g.ellipse(x+(r()-.5)*1.4,yy,w,.9+h*.014,(r()-.5)*.25,0,Math.PI*2);g.fill()}
  g.fillStyle=`rgba(${INK},${a*.75})`;g.fillRect(x-.5,y-h*.12,1,h*.18);
}
function grove(g,Y,cx0,count,size,a,r,spread){ // 杉の林：中心ほど大きく、まばらに外へ
  const trees=[];
  for(let k=0;k<count;k++){const d=(r()-.5)*2,x=cx0+d*spread*(.5+r()*.5);trees.push([x,size*(1-Math.abs(d)*.45)*(.7+r()*.5),r()])}
  trees.sort((p,q)=>p[2]-q[2]).forEach(([x,h,z])=>cedar(g,x,Y(x)+4+z*size*.8,h,a*(.8+z*.3),r));
}
function pagoda(g,x,y,s){
  g.save();g.shadowColor=`rgba(${INK},.3)`;g.shadowBlur=2;
  for(let k=0;k<5;k++){
    const w=s*(1-k*.12),yy=y-k*s*.44;
    g.fillStyle=`rgba(${INK},.28)`;g.fillRect(x-w*.22,yy-s*.02,w*.44,s*.26);
    g.fillStyle=`rgba(${INK},.55)`;
    g.beginPath();g.moveTo(x-w*.72,yy-s*.16);g.quadraticCurveTo(x-w*.45,yy-s*.06,x-w*.3,yy-s*.14);g.quadraticCurveTo(x,yy-s*.26,x+w*.3,yy-s*.14);
    g.quadraticCurveTo(x+w*.45,yy-s*.06,x+w*.72,yy-s*.16);g.lineTo(x+w*.42,yy-s*.02);g.lineTo(x-w*.42,yy-s*.02);g.closePath();g.fill();
  }
  g.fillStyle=`rgba(${INK},.5)`;g.fillRect(x-.7,y-s*2.95,1.4,s*.9);
  for(let k=0;k<6;k++)g.fillRect(x-s*.06,y-s*2.2-k*s*.1,s*.12,.9);
  g.restore();
}
function minka(g,x,y,s,r){
  g.save();g.shadowColor=`rgba(${INK},.25)`;g.shadowBlur=1.5;
  g.fillStyle='rgba(214,208,192,.96)';g.fillRect(x-s*.46,y-s*.4,s*.92,s*.4);
  g.restore();
  brush(g,[[x-s*.46,y-s*.4],[x-s*.46,y]],1.4,.55,{seed:r()*90|0,tin:.1,tout:.1});
  brush(g,[[x+s*.46,y-s*.4],[x+s*.46,y]],1.4,.55,{seed:r()*90|0,tin:.1,tout:.1});
  brush(g,[[x-s*.48,y],[x+s*.48,y]],1.6,.6,{seed:r()*90|0,tin:.1,tout:.1});
  g.fillStyle='rgba(226,170,94,.85)';g.fillRect(x-s*.36,y-s*.33,s*.22,s*.15);g.fillRect(x+s*.08,y-s*.33,s*.22,s*.15);
  g.strokeStyle='rgba(110,74,36,.45)';g.lineWidth=.5;
  for(let k=1;k<3;k++){g.beginPath();g.moveTo(x-s*.36+k*s*.073,y-s*.33);g.lineTo(x-s*.36+k*s*.073,y-s*.18);g.moveTo(x+s*.08+k*s*.073,y-s*.33);g.lineTo(x+s*.08+k*s*.073,y-s*.18);g.stroke()}
  // 茅葺き：墨を置いてから筆で葺く
  const roof=new Path2D();roof.moveTo(x-s*.74,y-s*.36);roof.quadraticCurveTo(x-s*.5,y-s*.62,x-s*.27,y-s*.98);roof.lineTo(x+s*.27,y-s*.98);roof.quadraticCurveTo(x+s*.5,y-s*.62,x+s*.74,y-s*.36);roof.closePath();
  g.save();g.shadowColor=`rgba(${INK},.4)`;g.shadowBlur=2;const rg=g.createLinearGradient(0,y-s,0,y-s*.35);rg.addColorStop(0,`rgba(${INK},.72)`);rg.addColorStop(1,`rgba(${INK},.42)`);g.fillStyle=rg;g.fill(roof);g.restore();
  g.save();g.clip(roof);
  for(let k=0;k<22;k++){const p=r(),xb=x-s*.7+p*s*1.4,xt=x-s*.25+p*s*.5;g.strokeStyle=`rgba(${PAPER},${.08+r()*.14})`;g.lineWidth=.5+r()*.7;g.beginPath();g.moveTo(xb,y-s*.38);g.lineTo(xt+(r()-.5)*3,y-s*.96);g.stroke()}
  g.restore();
  brush(g,[[x-s*.32,y-s*.99],[x,y-s*1.01],[x+s*.32,y-s*.98]],s*.08,.9,{seed:r()*90|0,tin:.15,tout:.2,bleed:2});
  lights.push({x:x-s*.03,y:y-s*.26,r:s*.75,ph:r()*9});
}
function torii(g,x,y,s){
  g.save();g.shadowColor='rgba(150,52,32,.35)';g.shadowBlur=2;
  const pg=g.createLinearGradient(x-s*.4,0,x+s*.4,0);pg.addColorStop(0,'rgba(146,50,30,.92)');pg.addColorStop(.5,'rgba(190,78,52,.88)');pg.addColorStop(1,'rgba(146,50,30,.92)');
  g.fillStyle=pg;
  g.beginPath();g.moveTo(x-s*.37,y);g.lineTo(x-s*.325,y-s*.98);g.lineTo(x-s*.265,y-s*.98);g.lineTo(x-s*.285,y);g.fill();
  g.beginPath();g.moveTo(x+s*.37,y);g.lineTo(x+s*.325,y-s*.98);g.lineTo(x+s*.265,y-s*.98);g.lineTo(x+s*.285,y);g.fill();
  g.fillStyle='rgba(180,67,43,.9)';g.fillRect(x-s*.46,y-s*.76,s*.92,s*.055);g.fillRect(x-s*.03,y-s*.92,s*.06,s*.16);
  g.beginPath();g.moveTo(x-s*.64,y-s*1.0);g.quadraticCurveTo(x,y-s*.88,x+s*.64,y-s*1.0);g.lineTo(x+s*.58,y-s*.9);g.quadraticCurveTo(x,y-s*.81,x-s*.58,y-s*.9);g.closePath();g.fill();
  g.restore();
  brush(g,curve(t=>[x-s*.66+t*s*1.32,y-s*1.035-Math.pow(Math.abs(t-.5)*2,2.2)*s*.09],24),s*.045,.82,{seed:44,tin:.03,tout:.03,bleed:1.5,dry:3});
  // 風化：柱の下をかすらせる
  g.save();g.globalCompositeOperation='destination-out';const r=rnd(5);
  for(let k=0;k<40;k++){g.fillStyle=`rgba(0,0,0,${.2+r()*.4})`;g.fillRect(x+(r()<.5?-1:1)*s*(.28+r()*.08),y-r()*s*.35,1+r()*2,1+r()*3)}
  g.restore();
}
function toro(g,x,y,s){
  g.save();g.shadowColor=`rgba(${INK},.35)`;g.shadowBlur=2;g.fillStyle=`rgba(${INK},.6)`;
  g.fillRect(x-s*.08,y-s*.55,s*.16,s*.55);g.fillRect(x-s*.22,y-s*.06,s*.44,s*.06);g.fillRect(x-s*.18,y-s*.6,s*.36,s*.06);
  g.fillStyle='rgba(232,178,100,.9)';g.fillRect(x-s*.1,y-s*.78,s*.2,s*.18);
  g.fillStyle=`rgba(${INK},.7)`;g.beginPath();g.moveTo(x-s*.32,y-s*.76);g.quadraticCurveTo(x,y-s*.86,x,y-s*.98);g.quadraticCurveTo(x,y-s*.86,x+s*.32,y-s*.76);g.closePath();g.fill();
  g.fillRect(x-s*.03,y-s*1.06,s*.06,s*.1);g.restore();
  lights.push({x,y:y-s*.69,r:s*.95,ph:3});
}
function pineBranch(g,W,H,s){
  const r=rnd(12);
  const pts=curve(t=>[-20+t*W*.3,H*.03+Math.sin(t*3.2)*H*.025+t*H*.09],60);
  brush(g,pts,s*.045,.7,{seed:5,tin:.02,tout:.55,bleed:2,dry:7,dryFrom:.1});
  brush(g,curve(t=>[W*.13+t*W*.06,H*.07-t*H*.035],14),s*.035,.6,{seed:6,tin:.05,tout:.6,dry:3});
  const pads=[[W*.06,H*.075,1],[W*.115,H*.04,.8],[W*.17,H*.085,1.1],[W*.235,H*.115,.9],[W*.285,H*.125,.7],[W*.2,H*.055,.65]];
  pads.forEach(([px,py,sc])=>{
    const R=s*.22*sc;
    g.save();g.shadowColor=`rgba(${INK},.25)`;g.shadowBlur=2;
    for(let k=0;k<75;k++){
      const ang=Math.PI*(1.05+r()*.9),len=R*(.55+r()*.55),ox=(r()-.5)*R*.35;
      g.strokeStyle=`rgba(${INK},${.2+r()*.5})`;g.lineWidth=.7+r()*.8;
      g.beginPath();g.moveTo(px+ox,py);g.quadraticCurveTo(px+ox+Math.cos(ang)*len*.5,py+Math.sin(ang)*len*.3,px+ox+Math.cos(ang)*len,py+Math.sin(ang)*len*.55);g.stroke();
    }
    g.restore();
    brush(g,[[px-R*.5,py+1],[px,py+2],[px+R*.5,py]],R*.18,.5,{seed:px|0,tin:.2,tout:.3});
  });
}

/* --- 山の層 --- */
function buildLayer(i){
  const d=LAYERS[i],Wd=W+P*2,Hd=H+P,[c,g]=mk(Wd,Hd),r=rnd(300+i*11),nz=vnoise(101+i*37),nz2=vnoise(500+i);
  const ys=[];
  for(let x=0;x<=Wd+3;x+=3){const sx=x-P,u=sx/W;let v=.32*Math.pow(fbm(nz,(sx+i*500)/d.f),1.4);
    const pwk=Math.sqrt(Math.max(1,900/W));d.peaks.forEach(([px,h,pw])=>{v+=h*Math.exp(-Math.pow((u-px)/(pw*pwk),2))*(.82+.36*nz2(sx/55))});
    ys.push(H*d.base-v*H*d.amp)}
  const Y=x=>{const k=Math.max(0,Math.min(ys.length-2,x/3)),i0=Math.floor(k),f=k-i0;return ys[i0]*(1-f)+ys[i0+1]*f};
  const S=x=>(Y(x+6)-Y(x-6))/12;
  const shape=new Path2D();shape.moveTo(0,Hd);for(let x=0;x<=Wd;x+=3)shape.lineTo(x,Y(x));shape.lineTo(Wd,Hd);shape.closePath();
  const top=Math.min(...ys);

  // 1. 墨の面（遠い山ほどにじむ）
  const gr=g.createLinearGradient(0,top,0,H*d.base+H*.2);
  gr.addColorStop(0,`rgba(${INK},${d.a})`);gr.addColorStop(.4,`rgba(${INK},${d.a*.55})`);gr.addColorStop(1,`rgba(${INK},${d.a*.1})`);
  g.save();if(i<2){g.shadowColor=`rgba(${INK},${d.a*.8})`;g.shadowBlur=i?6:12}g.fillStyle=gr;g.fill(shape);g.restore();

  g.save();g.clip(shape);
  // 2. 濡れた縁（稜線の下に墨がたまる）
  g.save();g.strokeStyle=`rgba(${INK},${d.a*.5})`;g.lineWidth=6+i*2;g.shadowColor=`rgba(${INK},${d.a})`;g.shadowBlur=10;
  g.beginPath();for(let x=0;x<=Wd;x+=3)x?g.lineTo(x,Y(x)+3):g.moveTo(x,Y(x)+3);g.stroke();g.restore();
  // 3. むら（墨だまりと抜け）
  for(let k=0;k<18+i*4;k++){const x=r()*Wd,y=Y(x)+r()*H*.18,rad=20+r()*90;
    const m=g.createRadialGradient(x,y,0,x,y,rad),lift=r()<.55;
    m.addColorStop(0,lift?`rgba(${PAPER},${.18+r()*.2})`:`rgba(${INK},${d.a*(.2+r()*.3)})`);m.addColorStop(1,lift?`rgba(${PAPER},0)`:`rgba(${INK},0)`);
    g.save();g.translate(x,y);g.scale(1.6,.6);g.translate(-x,-y);g.fillStyle=m;g.fillRect(x-rad,y-rad,rad*2,rad*2);g.restore()}
  // 4. 皴（峰の急な斜面に集めて打つ）
  if(i>=1){
    const clusters=[4,14,18,10,8][i];
    for(let k=0;k<clusters;k++){
      let x=0;for(let t=0;t<30;t++){x=r()*Wd;if(Math.abs(S(x))>.35||r()<.12)break}
      const sl=S(x),dir=sl>0?1:-1,m=5+Math.floor(r()*9),sc=(.6+i*.25)*(H/800+.4);
      for(let j=0;j<m;j++){
        const sx=x+(r()-.5)*34*sc,sy=Y(sx)+3+r()*22*sc,ssl=Math.abs(S(sx)),len=(7+r()*18)*sc;
        const vx=dir,vy=Math.max(.25,ssl)+.25+r()*.35,vl=Math.hypot(vx,vy);
        const pts=curve(t=>[sx+vx/vl*len*t,sy+vy/vl*len*t+Math.sin(t*3)*.8],7);
        brush(g,pts,(1.4+r()*2.6)*sc,d.a*(.3+r()*.35),{seed:i*100+k*10+j,tin:.04,tout:.7,dry:i>1?2:0,dryFrom:.15});
      }
    }
  }
  // 5. 霧の切れ間（白く抜く）
  g.globalCompositeOperation='destination-out';
  for(let k=0;k<3+i;k++){const yy=Y(r()*Wd)+H*(.03+r()*.12),xx=r()*Wd,w=Wd*(.18+r()*.3);
    const mg=g.createRadialGradient(xx,yy,0,xx,yy,w*.5);mg.addColorStop(0,`rgba(0,0,0,${.35+r()*.35})`);mg.addColorStop(1,'rgba(0,0,0,0)');
    g.save();g.translate(xx,yy);g.scale(1,.12+r()*.08);g.translate(-xx,-yy);g.fillStyle=mg;g.fillRect(xx-w,yy-w,w*2,w*2);g.restore()}
  g.globalCompositeOperation='source-over';
  g.restore();

  // 6. 米点（尾根の木々を点で）— 尾根の一部にだけ
  if(i>=1&&i<=3){
    const runs=[3,5,4][i-1];
    for(let k=0;k<runs;k++){const x0=r()*Wd,len=Wd*(.06+r()*.12);
      for(let j=0;j<len*.6;j++){const x=x0+r()*len,y=Y(x)+Math.pow(r(),2)*12-1,sz=(1.5+r()*3)*(1+i*.25);
        g.fillStyle=`rgba(${INK},${d.a*(.6+r()*.7)})`;g.beginPath();g.ellipse(x,y,sz,sz*.45,(r()-.5)*.4,0,Math.PI*2);g.fill()}}
  }
  // 7. 稜線：筆を何度か離して引く
  if(i>=1){
    let x=-10;
    while(x<Wd){
      const seg=(80+r()*260)*(i>2?1.3:1),x1=Math.min(Wd+10,x+seg);
      if(r()>.12){
        const pts=[];for(let xx=x;xx<=x1;xx+=4)pts.push([xx,Y(xx)+(r()-.5)*.6]);
        brush(g,pts,(.9+i*.7)*(H/800+.3),Math.min(.85,d.a*1.6),{seed:i*1000+(x|0),tin:.08,tout:.3,bleed:i>2?3:2,dry:i>=2?3:0,dryFrom:.4});
      }
      x=x1-(r()<.4?r()*12:-r()*14);
    }
  }
  // 8. 景物
  const cxp=fx=>P+W*fx;
  if(i===1){const fx=cxp(.575),fy=Y(fx)+H*.06,fh=H*.15;
    brush(g,curve(t=>[fx-6-Math.sin(t*4)*2,fy-4+t*fh],14),3.2,d.a*1.6,{seed:71,tin:.1,tout:.6,dry:2,bleed:2});
    brush(g,curve(t=>[fx+6+Math.sin(t*3)*2,fy+t*fh*.85],14),2.6,d.a*1.4,{seed:72,tin:.1,tout:.6,dry:2,bleed:2});
    falls.push({x:W*.575,y:fy,h:fh,layer:1})}
  if(i===2){
    [[.12,9,10,40],[.4,12,12,60],[.58,7,9,30],[.9,10,11,50]].forEach(([fx,n,sz,sp])=>grove(g,Y,cxp(fx),n,sz*(H/800+.3),d.a*1.2,r,sp));
    const px=cxp(.705);pagoda(g,px,Y(px)+H*.03,U*.055);
  }
  if(i===3){
    [[.05,14,16,60],[.44,18,18,90],[.78,16,17,80],[.97,8,14,40]].forEach(([fx,n,sz,sp])=>grove(g,Y,cxp(fx),n,sz*(H/800+.3),d.a*1.05,r,sp));
    [.2,.265,.335,.6,.665].forEach((fx,k)=>{const x=cxp(fx);minka(g,x,Y(x)+H*.045+(k%2)*6,Math.max(20,U*.062),r)});
  }
  if(i===4){
    [[.3,7,30,60],[.86,9,34,70]].forEach(([fx,n,sz,sp])=>grove(g,Y,cxp(fx),n,sz*(H/800+.3),.62,r,sp));
    const tx=cxp(.145),ty=Y(tx)+H*.07;
    for(let k=0;k<6;k++)brush(g,[[tx-U*.03-k*3,ty+k*5],[tx+U*.03+k*3,ty+k*5]],2,.22+k*.05,{seed:900+k,tin:.15,tout:.2});
    torii(g,tx,ty,U*.13);toro(g,tx+U*.12,ty+2,U*.065);
  }
  // 9. 裾を霧に溶かす
  if(i<4){g.globalCompositeOperation='destination-out';
    const fo=g.createLinearGradient(0,H*d.base-H*.02,0,H*d.base+H*.15);fo.addColorStop(0,'rgba(0,0,0,0)');fo.addColorStop(1,'rgba(0,0,0,.92)');
    g.fillStyle=fo;g.fillRect(0,0,Wd,Hd);g.globalCompositeOperation='source-over'}
  return{c,depth:d.depth,i};
}

const paper=document.getElementById('paper');
let skyC,dragonC,lastT=0;
function bakeSky(){
  const[c,g]=mk(W,H);
  const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#e0dcd1');sky.addColorStop(.45,'#ebe8df');sky.addColorStop(1,'#e8e5dc');
  g.fillStyle=sky;g.fillRect(0,0,W,H);
  const sx=W*.47,sy=H*.12,R=U*.07;
  const gl=g.createRadialGradient(sx,sy,R*.5,sx,sy,R*4.5);gl.addColorStop(0,'rgba(244,220,194,.45)');gl.addColorStop(1,'rgba(244,220,194,0)');
  g.fillStyle=gl;g.fillRect(0,0,W,H*.8);
  return c;
}
function bakePaper(){ // 和紙の粒と周辺の陰り（静止したまま）
  paper.width=W*D;paper.height=H*D;const g=paper.getContext('2d');g.setTransform(D,0,0,D,0,0);
  g.clearRect(0,0,W,H);
  const s=200,gc=document.createElement('canvas');gc.width=gc.height=s;const gg=gc.getContext('2d'),im=gg.createImageData(s,s),r=rnd(7);
  for(let i=0;i<im.data.length;i+=4){im.data[i]=96;im.data[i+1]=84;im.data[i+2]=62;im.data[i+3]=r()*16}
  gg.putImageData(im,0,0);gg.strokeStyle='rgba(120,100,70,.08)';gg.lineWidth=.5;
  for(let k=0;k<26;k++){gg.beginPath();let x=r()*s,y=r()*s;gg.moveTo(x,y);for(let j=0;j<6;j++){x+=(r()-.5)*16;y+=r()*12;gg.lineTo(x,y)}gg.stroke()}
  g.fillStyle=g.createPattern(gc,'repeat');g.fillRect(0,0,W,H);
  const vg=g.createRadialGradient(W*.5,H*.45,U*.4,W*.5,H*.5,Math.max(W,H)*.85);vg.addColorStop(0,'rgba(150,132,100,0)');vg.addColorStop(1,'rgba(150,132,100,.2)');
  g.fillStyle=vg;g.fillRect(0,0,W,H);
}
function bakeDragon(){ // 龍は一度描いておき、ゆっくり漂わせる
  const pad=U*.12,[c,g]=mk(W*.5+pad*2,H*.16+pad*2),save=cx;
  cx=g;g.translate(pad-W*.27,pad-H*.215+H*.08);dragon(0,0,0);cx=save;
  c.pad=pad;return c;
}
function build(){try{buildScene()}catch(e){console.error('scene build failed',e)}}
function buildScene(){
  D=Math.min(1.5,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;U=Math.min(W,H);
  cv.width=W*D;cv.height=H*D;cx.setTransform(D,0,0,D,0,0);
  lights=[];falls=[];
  L=LAYERS.map((_,i)=>{const s=lights.length,l=buildLayer(i);lights.slice(s).forEach(o=>{o.x-=P;o.layer=i});return l});
  mistSprite=mistSprite||makeMist();
  sunImg=makeSun(U*.07);skyC=bakeSky();
  try{dragonC=bakeDragon()}catch(e){dragonC=null}
  try{bakePaper()}catch(e){}
  golds=[
    {img:goldCloud(3,W*.15,Math.max(12,U*.026)),x:W*.25,y:H*.17,depth:.1,a:.72},
    {img:goldCloud(8,W*.12,Math.max(11,U*.023)),x:W*.66,y:H*.2,depth:.12,a:.66},
    {img:goldCloud(14,W*.18,Math.max(12,U*.026)),x:-W*.02,y:H*.44,depth:.2,a:.6},
  ];
  const[fc,fg2]=mk(W*.34,H*.24);fg2.globalAlpha=.75;pineBranch(fg2,W*.85,H*.8,U*.42);fg=fc;
  const r=rnd(5);
  tufts=[];
  [[.03,6],[.09,4],[.92,5],[.98,4]].forEach(([fx,n])=>{
    const base=fx*W,blades=[];for(let k=0;k<n+3;k++)blades.push({ang:(r()-.5)*1.1,h:U*(.035+r()*.055),w:1.3+r()*1.3,ph:r()*6,a:.3+r()*.3});
    tufts.push({x:base,blades});
  });
  birds=Array.from({length:4},()=>({x:r()*W,y:H*(.08+r()*.14),s:.5+r()*.5,v:.01+r()*.012,ph:r()*6}));
}

/* 雲間の龍：一筆の胴、かすれ、跳ねるひれ。頭と尾は金雲に隠れる */
function dragon(t,ox,oy){
  const x0=W*.27+ox,L0=W*.43,y0=H*.215+oy,A=H*.045,ph=t*.00022;
  const pt=s=>[x0+s*L0,y0+Math.sin(s*Math.PI*2.4-ph)*A*(.6+.4*Math.sin(s*5+1))];
  const pts=curve(pt,110),w=U*.042;
  brush(cx,pts,w,.14,{seed:7,tin:.18,tout:.22,bleed:7,dry:9,dryFrom:.05});
  // 鱗：かすれた弧を少しだけ
  for(let k=12;k<100;k+=5){const s=k/110,[x1,y1]=pt(s),[x2,y2]=pt(s+.01),ang=Math.atan2(y2-y1,x2-x1);
    cx.strokeStyle=`rgba(${PAPER},.32)`;cx.lineWidth=.8;cx.beginPath();cx.arc(x1,y1,w*.22,ang+.6,ang+2.4);cx.stroke()}
  // 背びれ：筆を跳ね上げる
  for(let k=10;k<100;k+=7){
    const s=k/110,[x1,y1]=pt(s),[x2,y2]=pt(s+.01),ang=Math.atan2(y2-y1,x2-x1),nx=Math.cos(ang-Math.PI/2),ny=Math.sin(ang-Math.PI/2),ln=w*(.55+.25*Math.sin(k));
    brush(cx,curve(q=>[x1+nx*w*.35+nx*ln*q-Math.cos(ang)*ln*.7*q*q,y1+ny*w*.35+ny*ln*q-Math.sin(ang)*ln*.7*q*q],6),w*.22,.17,{seed:300+k,tin:.02,tout:.9});
  }
  // 腹
  brush(cx,curve(s=>{const[x,y]=pt(.08+s*.84);return[x,y+w*.32]},60),1.4,.18,{col:PAPER,seed:9,tin:.2,tout:.2});
  // 爪：雲の縁から一つだけ
  const[cxx,cyy]=pt(.44);
  brush(cx,curve(q=>[cxx+q*w*1.1,cyy+w*.35+Math.sin(q*2)*w*.55],10),w*.2,.22,{seed:41,tin:.1,tout:.35});
  for(let j=0;j<3;j++)brush(cx,curve(q=>[cxx+w*1.1+q*w*(.45-j*.05),cyy+w*.85+q*w*(j-1)*.28+q*q*w*.2],5),w*.08,.25,{seed:50+j,tin:.05,tout:.9});
}

function mist(t,y,h,a,v,seed,ox,oy){
  const w=W*.9,span=W+w*2;
  for(let k=0;k<3;k++){
    const x=(((seed*333+k*span/3+t*v)%span)+span)%span-w;
    cx.globalAlpha=a;cx.drawImage(mistSprite,x+ox,y+oy-h/2+Math.sin(t*.0002+k+seed)*6,w,h);
  }
  cx.globalAlpha=1;
}

function draw(t){
  ptr.x+=(ptr.tx-ptr.x)*.04;ptr.y+=(ptr.ty-ptr.y)*.04;
  const sc=Math.min(window.scrollY,H);
  const off=dep=>[-ptr.x*26*dep,-ptr.y*10*dep+sc*(1-dep)*.35];
  cx.drawImage(skyC,0,0,W,H);
  {const[ox,oy]=off(.04),sx=W*.47+ox,sy=H*.12+oy,R=U*.07;cx.globalAlpha=.8;cx.drawImage(sunImg,sx-R*1.5,sy-R*1.5,sunImg.cssW,sunImg.cssH);cx.globalAlpha=1;}
  birds.forEach(b=>{const[ox,oy]=off(.06),x=((b.x+t*b.v)%(W+80))-40+ox,y=b.y+Math.sin(t*.0008+b.ph)*6+oy,w=7*b.s,f=Math.sin(t*.006+b.ph)*3*b.s;
    cx.strokeStyle=`rgba(${INK},.5)`;cx.lineWidth=1.2;cx.lineCap='round';cx.beginPath();cx.moveTo(x-w,y-f);cx.quadraticCurveTo(x-w*.4,y-1.5,x,y);cx.quadraticCurveTo(x+w*.4,y-1.5,x+w,y-f);cx.stroke();});
  const drawLayer=l=>{const[ox,oy]=off(l.depth);cx.drawImage(l.c,-P+ox,oy,W+P*2,H+P)};
  const drawGold=gd=>{const[ox,oy]=off(gd.depth);cx.globalAlpha=gd.a;cx.drawImage(gd.img,gd.x+ox+Math.sin(t*.00006+gd.x)*W*.01,gd.y+oy,gd.img.cssW,gd.img.cssH);cx.globalAlpha=1};

  drawLayer(L[0]);
  if(dragonC){const[ox,oy]=off(.1);cx.drawImage(dragonC,W*.27-dragonC.pad+ox+Math.sin(t*.00015)*W*.012,H*.215-H*.08-dragonC.pad+oy+Math.sin(t*.0004)*H*.008,dragonC.cssW,dragonC.cssH);}
  drawGold(golds[0]);drawGold(golds[1]);
  {const[ox,oy]=off(.12);mist(t,H*.34,H*.16,.9,.012,1,ox,oy);}
  drawLayer(L[1]);
  falls.forEach(f=>{const[ox,oy]=off(LAYERS[f.layer].depth),x=f.x+ox,y=f.y+oy;
    const g_=cx.createLinearGradient(0,y,0,y+f.h);g_.addColorStop(0,'rgba(246,244,238,.95)');g_.addColorStop(1,'rgba(246,244,238,0)');
    g_.addColorStop(.08,'rgba(246,244,238,.9)');cx.fillStyle=g_;cx.fillRect(x-4,y,8,f.h);
    for(let k=0;k<9;k++){const yy=y+((t*.04+k*f.h/9)%f.h),xx=x-3+(k*2.3)%6;cx.fillStyle=`rgba(255,255,252,${.5*(1-(yy-y)/f.h)})`;cx.fillRect(xx,yy,1,7)}
    const sp=cx.createRadialGradient(x,y+f.h,0,x,y+f.h,f.h*.5);sp.addColorStop(0,'rgba(240,238,231,.85)');sp.addColorStop(1,'rgba(240,238,231,0)');
    cx.save();cx.translate(x,y+f.h);cx.scale(1.8,.5);cx.translate(-x,-y-f.h);cx.fillStyle=sp;cx.fillRect(x-f.h*.5,y+f.h*.5,f.h,f.h);cx.restore()});
  {const[ox,oy]=off(.2);mist(t,H*.5,H*.14,.9,-.016,2,ox,oy);}
  drawGold(golds[2]);
  drawLayer(L[2]);
  {const[ox,oy]=off(.32);mist(t,H*.62,H*.14,.95,.02,3,ox,oy);}
  drawLayer(L[3]);
  {const[ox,oy]=off(.5);mist(t,H*.76,H*.12,.85,-.024,4,ox,oy);}
  drawLayer(L[4]);
  lights.forEach(o=>{const[ox,oy]=off(LAYERS[o.layer].depth),f=.75+Math.sin(t*.003+o.ph)*.1+Math.sin(t*.011+o.ph)*.06;
    const g_=cx.createRadialGradient(o.x+ox,o.y+oy,0,o.x+ox,o.y+oy,o.r);g_.addColorStop(0,`rgba(240,180,96,${.3*f})`);g_.addColorStop(1,'rgba(240,180,96,0)');
    cx.fillStyle=g_;cx.fillRect(o.x+ox-o.r,o.y+oy-o.r,o.r*2,o.r*2)});
  const fog=cx.createLinearGradient(0,H*.76,0,H);fog.addColorStop(0,'rgba(230,227,218,0)');fog.addColorStop(1,'rgba(230,227,218,1)');
  cx.fillStyle=fog;cx.fillRect(0,H*.76,W,H*.24);
  {const[ox,oy]=off(.7);mist(t,H*.93,H*.12,.9,.03,5,ox,oy);}
  // 草むら：根元から筆を払う
  {const[ox,oy]=off(1);
    tufts.forEach(tf=>tf.blades.forEach(b=>{
      const sw=Math.sin(t*.0011+b.ph)*.08+Math.sin(t*.0026+b.ph)*.03,a=b.ang+sw,x0=tf.x+ox,y0=H+3+oy;
      const tx=x0+Math.sin(a)*b.h,ty=y0-Math.cos(a)*b.h,mx=x0+Math.sin(a*.4)*b.h*.5,my=y0-b.h*.55;
      cx.fillStyle=`rgba(${INK},${b.a})`;cx.beginPath();cx.moveTo(x0-b.w,y0);cx.quadraticCurveTo(mx-b.w*.4,my,tx,ty);cx.quadraticCurveTo(mx+b.w*.4,my,x0+b.w,y0);cx.fill();
    }));}
  {const[ox,oy]=off(1.25);cx.drawImage(fg,ox-8,oy-6,fg.cssW,fg.cssH);}
}
let raf,visible=true;
function loop(t){if(t-lastT>=31||reduce){lastT=t;try{draw(t)}catch(e){}}if(!reduce&&visible&&!document.hidden)raf=requestAnimationFrame(loop)}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&visible&&!reduce){cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}});
build();requestAnimationFrame(loop);
new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible&&!reduce){cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}}).observe(cv);
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{build();placeGolds();draw(performance.now())},150)});
addEventListener('pointermove',e=>{ptr.tx=e.clientX/innerWidth-.5;ptr.ty=e.clientY/innerHeight-.5},{passive:true});
