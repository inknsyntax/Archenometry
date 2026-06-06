/* ============================================================
   ARCHMATH v2 — sim.js
   Full physics engine + custom bow builder
   ============================================================ */

const g = 9.81;

/* ════════════════════════════════════════════════════════════
   BOW PRESETS
   ════════════════════════════════════════════════════════════ */
const BOW_PRESETS = {
  compound:{name:'Compound Bow',speed:88,mass:.0255,cd:.003,diam:.0058,
    desc:'88 m/s · 405gr · Precision cam system',color:'#2a5a8c',color2:'#4080b8'},
  recurve:{name:'Recurve Bow',speed:58,mass:.0195,cd:.0055,diam:.0062,
    desc:'58 m/s · 300gr · Olympic standard',color:'#2e5c1e',color2:'#4a8030'},
  crossbow:{name:'Crossbow',speed:107,mass:.033,cd:.0025,diam:.0080,
    desc:'107 m/s · 520gr · Horizontal draw bolt',color:'#8b2e0a',color2:'#c04015'}
};

const TERRAIN = {
  flat:{name:'Flat Ground',slope:0},
  uphill:{name:'Uphill 20°',slope:20},
  downhill:{name:'Downhill 20°',slope:-20},
  cliff:{name:'Cliff 40°',slope:-40},
  valley:{name:'Valley 10°',slope:10},
  range:{name:'Archery Range',slope:0}
};

/* ════════════════════════════════════════════════════════════
   CUSTOM BOW BUILDER — material catalogue
   ════════════════════════════════════════════════════════════ */
const BODY_MATERIALS = {
  yew:     {name:'Yew Wood',      draw:.85, weight:1.0, cd_mod:1.0,  color:'#8B6914', desc:'Classic longbow wood, flexible & strong'},
  ash:     {name:'Ash Wood',      draw:.80, weight:1.05,cd_mod:1.0,  color:'#9C7A3C', desc:'Hard, shock-resistant, heavier'},
  bamboo:  {name:'Bamboo',        draw:.75, weight:.85, cd_mod:1.0,  color:'#7EA04A', desc:'Lightweight, springy, great for beginners'},
  oak:     {name:'Oak Wood',      draw:.70, weight:1.2, cd_mod:1.0,  color:'#6B4423', desc:'Very stiff, needs heavier arrows'},
  fiberglass:{name:'Fiberglass',  draw:.95, weight:.90, cd_mod:.97,  color:'#4A7090', desc:'Modern composite, high draw efficiency'},
  carbon:  {name:'Carbon Fiber',  draw:1.0, weight:.70, cd_mod:.95,  color:'#1A1A2E', desc:'Lightest, stiffest — professional grade'},
  bone:    {name:'Bone / Horn',   draw:.65, weight:1.1, cd_mod:1.02, color:'#D4C4A0', desc:'Ancient material, moderate efficiency'},
  steel:   {name:'Steel',         draw:.72, weight:2.5, cd_mod:1.05, color:'#708090', desc:'Heavy duty — extremely heavy limb weight'},
};

const STRING_MATERIALS = {
  vine:      {name:'Vine',        tension:.40, slip:.08, cd_mod:1.05, color:'#4A7A30', desc:'Primitive — low tension, quick wear'},
  sinew:     {name:'Animal Sinew',tension:.60, slip:.04, cd_mod:1.02, color:'#C8A060', desc:'Traditional, strong, weather-sensitive'},
  hemp:      {name:'Hemp Rope',   tension:.55, slip:.06, cd_mod:1.03, color:'#8B7355', desc:'Natural fiber, decent durability'},
  silk:      {name:'Silk',        tension:.75, slip:.02, cd_mod:.99,  color:'#E8D0F0', desc:'Historical high-end — low stretch'},
  linen:     {name:'Linen',       tension:.65, slip:.03, cd_mod:1.01, color:'#C8C0A0', desc:'Traditional European bowstring'},
  dacron:    {name:'Dacron',      tension:.85, slip:.015,cd_mod:.98,  color:'#F0F0E0', desc:'Modern beginner string — low creep'},
  fastflight:{name:'Fast Flight', tension:.98, slip:.005,cd_mod:.96,  color:'#F0F8FF', desc:'High-performance — very low stretch'},
  dyneema:   {name:'Dyneema',     tension:1.0, slip:.003,cd_mod:.95,  color:'#E8F4FF', desc:'Best modern string — nearly zero stretch'},
};

const ARROW_MATERIALS = {
  reed:    {name:'Reed / Cane',  mass:.012, cd:.010, diam:.009, color:'#9A8050', desc:'Ancient, lightweight, fragile'},
  wood:    {name:'Wood',         mass:.018, cd:.008, diam:.008, color:'#8B5E3C', desc:'Traditional wood shaft, heavier'},
  bamboo:  {name:'Bamboo Shaft', mass:.016, cd:.008, diam:.009, color:'#7EA04A', desc:'Natural, light, good for recurves'},
  aluminum:{name:'Aluminum',     mass:.022, cd:.005, diam:.007, color:'#A8B0C0', desc:'Durable modern metal shaft'},
  carbon:  {name:'Carbon Fiber', mass:.0165,cd:.003, diam:.0058,color:'#2A2A3E', desc:'Competition standard — fast and straight'},
  steelTip:{name:'Steel-Tipped', mass:.030, cd:.004, diam:.006, color:'#708090', desc:'Hunting heavy — maximum KE'},
  fiberglass:{name:'Fiberglass', mass:.020, cd:.006, diam:.0075,color:'#4A7090', desc:'Practice arrow — very durable'},
};

const FLETCHING = {
  natural: {name:'Natural Feathers',spin_mod:1.0, cd_mod:1.02, color:'#C8A060', desc:'Traditional — excellent stabilization'},
  plastic: {name:'Plastic Vanes',   spin_mod:.95, cd_mod:.99,  color:'#E06040', desc:'Modern standard — weather-proof'},
  carbon:  {name:'Carbon Vanes',    spin_mod:.92, cd_mod:.97,  color:'#1A1A2E', desc:'Competition — minimal drag'},
  helical: {name:'Helical Vanes',   spin_mod:1.1, cd_mod:1.03, color:'#204080', desc:'Max spin — best stability'},
  parabolic:{name:'Parabolic',      spin_mod:1.05,cd_mod:1.01, color:'#806020', desc:'Balanced speed & stabilization'},
  bare:    {name:'Bare Shaft',      spin_mod:.60, cd_mod:.95,  color:'#808080', desc:'No fletching — very low drag, unstable'},
};

const TIP_TYPES = {
  field:     {name:'Field Point',   mass_add:.002, cd_mod:1.0, color:'#888'},
  broadhead: {name:'Broadhead',     mass_add:.005, cd_mod:1.25,color:'#607080'},
  blunt:     {name:'Blunt Tip',     mass_add:.003, cd_mod:1.35,color:'#A08060'},
  bodkin:    {name:'Bodkin Point',  mass_add:.004, cd_mod:1.05,color:'#708090'},
  judo:      {name:'Judo Point',    mass_add:.003, cd_mod:1.2, color:'#607050'},
  bullet:    {name:'Bullet Point',  mass_add:.002, cd_mod:.98, color:'#909090'},
};

const DRAW_WEIGHTS = [
  {lbs:20,label:'20 lb — Youth'},
  {lbs:30,label:'30 lb — Light'},
  {lbs:40,label:'40 lb — Beginner'},
  {lbs:50,label:'50 lb — Intermediate'},
  {lbs:60,label:'60 lb — Standard'},
  {lbs:70,label:'70 lb — Heavy'},
  {lbs:80,label:'80 lb — Competition Heavy'},
  {lbs:100,label:'100 lb — Warbow'},
  {lbs:150,label:'150 lb — Crossbow Light'},
  {lbs:200,label:'200 lb — Crossbow Heavy'},
];

const BOW_TYPES = {
  longbow:   {name:'Longbow',       eff:.75, desc:'Long single-piece body, traditional'},
  recurve:   {name:'Recurve',       eff:.82, desc:'Curved tips, more stored energy'},
  compound:  {name:'Compound',      eff:.92, desc:'Cam system, maximum efficiency'},
  crossbow:  {name:'Crossbow',      eff:.88, desc:'Horizontal, mechanically drawn'},
  shortbow:  {name:'Short Bow',     eff:.68, desc:'Compact, lower power, mobile'},
  warbow:    {name:'War Bow',       eff:.78, desc:'Heavy English warbow style'},
};

/* ════════════════════════════════════════════════════════════
   CUSTOM BOW STATE
   ════════════════════════════════════════════════════════════ */
let customBow = {
  name: 'My Custom Bow',
  bodyMat: 'yew',
  stringMat: 'dacron',
  arrowMat: 'carbon',
  fletching: 'plastic',
  tip: 'field',
  bowType: 'recurve',
  drawWeight: 50,
  drawLength: 28,
  arrowLength: 700,
};

/* ════════════════════════════════════════════════════════════
   PHYSICS ENGINE — RK4
   ════════════════════════════════════════════════════════════ */
function simulateArrow(params) {
  const {v0,angleDeg,h0,mass,cd,diam,windX=0,windY=0,useAir=true,dt=.005,maxT=40} = params;
  const theta = angleDeg * Math.PI / 180;
  const A = Math.PI * (diam/2)**2;
  const rho = 1.225;
  const k = useAir ? .5*rho*cd*A/mass : 0;

  let x=0, y=h0, vx=v0*Math.cos(theta), vy=v0*Math.sin(theta);
  const pts=[{x,y,vx,vy,t:0,speed:v0}];
  let t=0;

  function deriv(x,y,vx,vy){
    const rx=vx-windX, ry=vy-windY;
    const s=Math.sqrt(rx*rx+ry*ry);
    return {dx:vx,dy:vy,dvx:-k*s*rx,dvy:-g-k*s*ry};
  }

  function step(x,y,vx,vy){
    const k1=deriv(x,y,vx,vy);
    const k2=deriv(x+.5*dt*k1.dx,y+.5*dt*k1.dy,vx+.5*dt*k1.dvx,vy+.5*dt*k1.dvy);
    const k3=deriv(x+.5*dt*k2.dx,y+.5*dt*k2.dy,vx+.5*dt*k2.dvx,vy+.5*dt*k2.dvy);
    const k4=deriv(x+dt*k3.dx,y+dt*k3.dy,vx+dt*k3.dvx,vy+dt*k3.dvy);
    return {
      x:x+dt/6*(k1.dx+2*k2.dx+2*k3.dx+k4.dx),
      y:y+dt/6*(k1.dy+2*k2.dy+2*k3.dy+k4.dy),
      vx:vx+dt/6*(k1.dvx+2*k2.dvx+2*k3.dvx+k4.dvx),
      vy:vy+dt/6*(k1.dvy+2*k2.dvy+2*k3.dvy+k4.dvy),
    };
  }

  let maxSpeed=v0;
  while(y>=0&&t<maxT){
    const n=step(x,y,vx,vy);
    x=n.x; y=n.y; vx=n.vx; vy=n.vy; t+=dt;
    const sp=Math.sqrt(vx*vx+vy*vy);
    if(sp>maxSpeed)maxSpeed=sp;
    if(t%0.05<dt*1.5) pts.push({x,y,vx,vy,t,speed:sp});
  }

  const apex=pts.reduce((a,b)=>b.y>a.y?b:a);
  const p1=pts[pts.length-2]||pts[0], p2=pts[pts.length-1];
  const frac=p1.y>0&&p2.y<=0 ? p1.y/(p1.y-p2.y) : 1;
  const landX=p1.x+frac*(p2.x-p1.x);
  const landT=p1.t+frac*(p2.t-p1.t);
  const finalSpeed=Math.sqrt(vx*vx+vy*vy);
  const descentAngle=Math.atan2(Math.abs(vy),vx)*180/Math.PI;
  const ke0=.5*mass*v0*v0;
  const keI=.5*mass*finalSpeed*finalSpeed;

  return {
    pts,range:landX,flightT:landT,
    apexX:apex.x,apexY:apex.y,apexT:apex.t,
    maxSpeed,
    finalSpeed,finalVx:vx,finalVy:vy,
    descentAngle,
    ke0,keI,energyPct:keI/ke0*100,
    initialV0:v0,
  };
}

/* ════════════════════════════════════════════════════════════
   CUSTOM BOW PHYSICS — derive speed & params from parts
   ════════════════════════════════════════════════════════════ */
function computeCustomBow() {
  const b = customBow;
  const body  = BODY_MATERIALS[b.bodyMat];
  const str   = STRING_MATERIALS[b.stringMat];
  const arrow = ARROW_MATERIALS[b.arrowMat];
  const flet  = FLETCHING[b.fletching];
  const tip   = TIP_TYPES[b.tip];
  const btype = BOW_TYPES[b.bowType];

  // Draw length in meters
  const drawM = b.drawLength * 0.0254;

  // Energy stored (½ × draw_weight × draw_length)
  // drawWeight in lbs → N: 1 lb = 4.4482 N
  const drawN = b.drawWeight * 4.4482;
  const storedJ = 0.5 * drawN * drawM;

  // Efficiency chain: body × string × bowtype
  const eff = body.draw * str.tension * btype.eff;

  // Arrow mass (shaft + tip)
  const arrowMass = arrow.mass + tip.mass_add;

  // Speed from kinetic energy: ½mv² = storedJ × eff → v = √(2×storedJ×eff/m)
  const transferredJ = storedJ * eff;
  const v0 = Math.sqrt(2 * transferredJ / arrowMass);

  // Combined drag coefficient
  const effectiveCd = arrow.cd * tip.cd_mod * flet.cd_mod * str.cd_mod;

  // Arrow diameter
  const diam = arrow.diam;

  // FOC estimate (fletching/tip heavy)
  const arrowLenM = b.arrowLength / 1000;
  const frontMass = arrow.mass * .55 + tip.mass_add;
  const focPct = ((frontMass/arrowMass * arrowLenM - arrowLenM/2) / arrowLenM) * 100 + 12;

  // Spin RPM
  const offsetDeg = b.fletching==='helical'?4:b.fletching==='parabolic'?2.5:b.fletching==='bare'?.5:2;
  const spinRPS = v0 * Math.tan(offsetDeg*Math.PI/180) / (Math.PI*diam);
  const spinRPM = spinRPS * 60 * flet.spin_mod;

  return {
    v0: Math.min(v0, 180),   // cap at 180 m/s for sanity
    arrowMass, effectiveCd, diam,
    storedJ, transferredJ, eff,
    focPct, spinRPM,
    body, str, arrow, flet, tip, btype,
    drawN, drawM, arrowLenM,
  };
}

/* ════════════════════════════════════════════════════════════
   CANVAS RENDERER
   ════════════════════════════════════════════════════════════ */
class Renderer {
  constructor(id){ this.c=document.getElementById(id); this.ctx=this.c.getContext('2d'); this.af=null; this.trails=[]; }
  resize(){
    const dpr=devicePixelRatio||1;
    const r=this.c.getBoundingClientRect();
    this.c.width=r.width*dpr; this.c.height=r.height*dpr;
    this.ctx.scale(dpr,dpr);
    this.W=r.width; this.H=r.height;
  }
  viewport(){
    const all=this.trails.flatMap(t=>t.pts);
    if(!all.length) return {minX:0,maxX:10,minY:0,maxY:5};
    const mxX=Math.max(...all.map(p=>p.x))*1.08;
    const mxY=Math.max(Math.max(...all.map(p=>p.y))*1.3,3);
    return {minX:0,maxX:mxX,minY:0,maxY:mxY};
  }
  draw(animIdx){
    const ctx=this.ctx, W=this.W, H=this.H;
    if(!W) return;
    ctx.clearRect(0,0,W,H);

    // Sky gradient background
    const grad=ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0,'#d8eaf8'); grad.addColorStop(1,'#f7f0dc');
    ctx.fillStyle=grad; ctx.fillRect(0,0,W,H);

    const vp=this.viewport();
    const pad={l:54,r:22,t:26,b:42};
    const pw=W-pad.l-pad.r, ph=H-pad.t-pad.b;

    const tc=(wx,wy)=>({
      x:pad.l+(wx-vp.minX)/(vp.maxX-vp.minX)*pw,
      y:pad.t+ph-(wy-vp.minY)/(vp.maxY-vp.minY)*ph,
    });

    // Grid lines
    ctx.strokeStyle='rgba(0,0,0,.07)'; ctx.lineWidth=.7;
    for(let i=0;i<=6;i++){const gx=pad.l+i*pw/6;ctx.beginPath();ctx.moveTo(gx,pad.t);ctx.lineTo(gx,pad.t+ph);ctx.stroke()}
    for(let i=0;i<=5;i++){const gy=pad.t+i*ph/5;ctx.beginPath();ctx.moveTo(pad.l,gy);ctx.lineTo(pad.l+pw,gy);ctx.stroke()}

    // Ground fill + line
    const gndL=tc(0,0), gndR=tc(vp.maxX,0);
    const gGrad=ctx.createLinearGradient(0,gndL.y,0,pad.t+ph);
    gGrad.addColorStop(0,'rgba(100,70,20,.4)'); gGrad.addColorStop(1,'rgba(60,40,10,.1)');
    ctx.fillStyle=gGrad;
    ctx.beginPath(); ctx.moveTo(gndL.x,gndL.y); ctx.lineTo(gndR.x,gndR.y);
    ctx.lineTo(gndR.x,pad.t+ph); ctx.lineTo(gndL.x,pad.t+ph); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#7a5520'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(gndL.x,gndL.y); ctx.lineTo(gndR.x,gndR.y); ctx.stroke();

    // Axis labels
    ctx.fillStyle='#5c4520'; ctx.font='10px JetBrains Mono,monospace'; ctx.textAlign='center';
    for(let i=0;i<=6;i++){
      const wv=vp.minX+(vp.maxX-vp.minX)*i/6;
      ctx.fillText(fmt(wv,0)+'m',pad.l+i*pw/6,H-10);
    }
    ctx.textAlign='right';
    for(let i=0;i<=5;i++){
      const wv=vp.minY+(vp.maxY-vp.minY)*(5-i)/5;
      ctx.fillText(fmt(wv,1)+'m',pad.l-5,pad.t+i*ph/5+4);
    }
    ctx.textAlign='center'; ctx.fillStyle='#8a6b3a'; ctx.font='10px Cinzel,serif';
    ctx.fillText('Horizontal Distance (m)',W/2,H-1);
    ctx.save(); ctx.translate(11,pad.t+ph/2); ctx.rotate(-Math.PI/2);
    ctx.fillText('Height (m)',0,0); ctx.restore();

    // Trails
    this.trails.forEach(trail=>{
      const pts=trail.pts; if(!pts.length) return;
      const n=animIdx!==undefined ? Math.min(animIdx,pts.length) : pts.length;

      // Glow for primary trail
      if(!trail.dashed){
        ctx.shadowColor=trail.color; ctx.shadowBlur=6;
      }

      ctx.strokeStyle=trail.color; ctx.lineWidth=trail.dashed?2:2.8;
      if(trail.dashed) ctx.setLineDash([7,5]); else ctx.setLineDash([]);
      ctx.beginPath();
      for(let i=0;i<n;i++){
        const c=tc(pts[i].x,pts[i].y);
        i===0?ctx.moveTo(c.x,c.y):ctx.lineTo(c.x,c.y);
      }
      ctx.stroke();
      ctx.setLineDash([]); ctx.shadowBlur=0;

      // Apex dot
      if(!trail.dashed||n>=pts.length){
        const apex=pts.reduce((a,b)=>b.y>a.y?b:a);
        const ac=tc(apex.x,apex.y);
        ctx.fillStyle=trail.color;
        ctx.beginPath(); ctx.arc(ac.x,ac.y,5.5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(ac.x,ac.y,2.5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=trail.color; ctx.font='10px JetBrains Mono,monospace'; ctx.textAlign='center';
        ctx.fillText(fmt(apex.y,1)+'m',ac.x,ac.y-10);
      }

      // Landing marker
      if(n>=pts.length){
        const last=pts[pts.length-1];
        const lc=tc(last.x,0);
        ctx.strokeStyle=trail.color; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(lc.x,lc.y-12); ctx.lineTo(lc.x,lc.y+3); ctx.stroke();
        // label range
        ctx.fillStyle=trail.color; ctx.font='9px JetBrains Mono,monospace'; ctx.textAlign='center';
        const r=trail.result;
        if(r) ctx.fillText(fmt(r.range,1)+'m',lc.x,lc.y+13);
      }

      // Animated arrowhead
      if(animIdx!==undefined && n>1 && n<pts.length){
        const cur=tc(pts[n-1].x,pts[n-1].y);
        const prev=tc(pts[n-2].x,pts[n-2].y);
        const angle=Math.atan2(cur.y-prev.y,cur.x-prev.x);
        ctx.fillStyle=trail.color;
        ctx.save(); ctx.translate(cur.x,cur.y); ctx.rotate(angle);
        ctx.beginPath(); ctx.moveTo(9,0); ctx.lineTo(-6,4); ctx.lineTo(-6,-4); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    });
  }
  animate(trails){
    if(this.af) cancelAnimationFrame(this.af);
    this.trails=trails; this.resize();
    const maxLen=Math.max(...trails.map(t=>t.pts.length));
    let idx=0; const spd=Math.max(1,Math.floor(maxLen/180));
    const step=()=>{idx+=spd; this.draw(idx); if(idx<maxLen+80) this.af=requestAnimationFrame(step); else this.draw();};
    step();
  }
  setStatic(trails){ if(this.af) cancelAnimationFrame(this.af); this.trails=trails; this.resize(); this.draw(); }
}

/* ════════════════════════════════════════════════════════════
   BOW PREVIEW CANVAS
   ════════════════════════════════════════════════════════════ */
function drawBowPreview(){
  const c=document.getElementById('bow-canvas'); if(!c) return;
  const ctx=c.getContext('2d');
  const W=c.width=200, H=c.height=240;
  ctx.clearRect(0,0,W,H);

  const body=BODY_MATERIALS[customBow.bodyMat];
  const str=STRING_MATERIALS[customBow.stringMat];
  const arr=ARROW_MATERIALS[customBow.arrowMat];
  const flet=FLETCHING[customBow.fletching];
  const tip=TIP_TYPES[customBow.tip];
  const bt=BOW_TYPES[customBow.bowType];

  // Draw bow body based on type
  const cx=100, cy=120;
  const limbColor=body.color;
  const strColor=str.color;
  const arrowColor=arr.color;
  const tipColor=tip.color;
  const fletColor=flet.color;

  ctx.lineCap='round'; ctx.lineJoin='round';

  // Bow shape
  if(customBow.bowType==='compound'){
    // Compound: with cams
    ctx.strokeStyle=limbColor; ctx.lineWidth=7;
    ctx.beginPath(); ctx.moveTo(cx,cy+80); ctx.bezierCurveTo(cx-35,cy+50,cx-35,cy-50,cx,cy-80); ctx.stroke();
    // Cam circles
    ctx.strokeStyle=limbColor; ctx.lineWidth=4;
    ctx.beginPath(); ctx.arc(cx-8,cy-78,9,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx-8,cy+78,9,0,Math.PI*2); ctx.stroke();
    // String
    ctx.strokeStyle=strColor; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(cx-8,cy-78); ctx.lineTo(cx+18,cy); ctx.lineTo(cx-8,cy+78); ctx.stroke();
  } else if(customBow.bowType==='crossbow'){
    // Crossbow: horizontal limbs + stock
    ctx.strokeStyle=limbColor; ctx.lineWidth=7;
    ctx.beginPath(); ctx.moveTo(cx-80,cy); ctx.bezierCurveTo(cx-50,cy-25,cx+50,cy-25,cx+80,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx-80,cy); ctx.bezierCurveTo(cx-50,cy+25,cx+50,cy+25,cx+80,cy); ctx.stroke();
    // Stock
    ctx.strokeStyle=limbColor; ctx.lineWidth=9;
    ctx.beginPath(); ctx.moveTo(cx-30,cy); ctx.lineTo(cx+60,cy); ctx.stroke();
    // String
    ctx.strokeStyle=strColor; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(cx-80,cy); ctx.lineTo(cx,cy-18); ctx.lineTo(cx+80,cy); ctx.stroke();
  } else {
    // Longbow / recurve / shortbow
    const curve = customBow.bowType==='recurve' ? 45 : customBow.bowType==='shortbow' ? 30 : 20;
    ctx.strokeStyle=limbColor; ctx.lineWidth=6;
    ctx.beginPath();
    ctx.moveTo(cx,cy+85);
    ctx.bezierCurveTo(cx-curve,cy+50,cx-curve,cy-50,cx,cy-85);
    ctx.stroke();
    // Recurve tips
    if(customBow.bowType==='recurve'){
      ctx.strokeStyle=limbColor; ctx.lineWidth=5;
      ctx.beginPath(); ctx.moveTo(cx,cy-85); ctx.bezierCurveTo(cx+12,cy-95,cx+20,cy-88,cx+16,cy-78); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx,cy+85); ctx.bezierCurveTo(cx+12,cy+95,cx+20,cy+88,cx+16,cy+78); ctx.stroke();
    }
    // Bowstring
    ctx.strokeStyle=strColor; ctx.lineWidth=1.5;
    const strX = customBow.bowType==='recurve' ? cx+16 : cx;
    ctx.beginPath(); ctx.moveTo(strX,cy-78); ctx.lineTo(cx+22,cy); ctx.lineTo(strX,cy+78); ctx.stroke();
  }

  // Arrow (horizontal across)
  const arrowY=customBow.bowType==='crossbow' ? cy : cy;
  const arrowX1=customBow.bowType==='crossbow' ? cx-70 : cx+18;
  const arrowX2=customBow.bowType==='crossbow' ? cx+75 : cx+65;
  if(customBow.bowType!=='crossbow'){
    // Shaft
    ctx.strokeStyle=arrowColor; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(arrowX1,arrowY); ctx.lineTo(arrowX2,arrowY); ctx.stroke();
    // Tip
    ctx.strokeStyle=tipColor; ctx.fillStyle=tipColor; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(arrowX2,arrowY); ctx.lineTo(arrowX2+10,arrowY-4); ctx.lineTo(arrowX2+10,arrowY+4); ctx.closePath(); ctx.fill();
    // Fletching
    ctx.strokeStyle=fletColor; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(arrowX1,arrowY); ctx.lineTo(arrowX1-5,arrowY-7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(arrowX1,arrowY); ctx.lineTo(arrowX1-5,arrowY+7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(arrowX1+4,arrowY); ctx.lineTo(arrowX1+1,arrowY-5); ctx.stroke();
  }

  // Label
  ctx.fillStyle='rgba(255,255,255,.7)'; ctx.font='10px Cinzel,serif';
  ctx.textAlign='center';
  ctx.fillText(bt.name,cx,H-8);
}

/* ════════════════════════════════════════════════════════════
   CUSTOM BOW BUILDER UI
   ════════════════════════════════════════════════════════════ */
function buildOptionGrid(containerId, catalogue, stateKey, onChange){
  const el=document.getElementById(containerId); if(!el) return;
  el.innerHTML='';
  Object.entries(catalogue).forEach(([key,v])=>{
    const b=document.createElement('button');
    b.className='opt-btn'+(customBow[stateKey]===key?' selected':'');
    b.innerHTML=`<span class="opt-name">${v.name}</span><span class="opt-stat">${v.desc}</span>`;
    b.onclick=()=>{ customBow[stateKey]=key; buildOptionGrid(containerId,catalogue,stateKey,onChange); onChange && onChange(); updateBowStats(); drawBowPreview(); };
    el.appendChild(b);
  });
}

function buildDrawWeightSelect(){
  const sel=document.getElementById('dw-select'); if(!sel) return;
  sel.innerHTML=DRAW_WEIGHTS.map(d=>`<option value="${d.lbs}" ${d.lbs===customBow.drawWeight?'selected':''}>${d.label}</option>`).join('');
  sel.onchange=()=>{ customBow.drawWeight=+sel.value; updateBowStats(); };
}

function buildBowTypeSelect(){
  const el=document.getElementById('bow-type-grid'); if(!el) return;
  el.innerHTML='';
  Object.entries(BOW_TYPES).forEach(([key,v])=>{
    const b=document.createElement('button');
    b.className='opt-btn'+(customBow.bowType===key?' selected':'');
    b.innerHTML=`<span class="opt-name">${v.name}</span><span class="opt-stat">${v.desc}</span>`;
    b.onclick=()=>{ customBow.bowType=key; buildBowTypeSelect(); updateBowStats(); drawBowPreview(); };
    el.appendChild(b);
  });
}

function updateBowStats(){
  const cp=computeCustomBow();
  const setV=(id,v)=>{ const e=document.getElementById(id); if(e) e.textContent=v; };
  setV('bstat-speed', fmt(cp.v0,1)+' m/s  ('+fmt(cp.v0/0.3048,0)+' fps)');
  setV('bstat-mass',  fmt(cp.arrowMass*1000,1)+' g  ('+fmt(cp.arrowMass*1000/0.0648,0)+' gr)');
  setV('bstat-energy',fmt(cp.transferredJ,1)+' J');
  setV('bstat-eff',   fmt(cp.eff*100,1)+'%');
  setV('bstat-foc',   fmt(cp.focPct,1)+'%');
  setV('bstat-spin',  fmt(cp.spinRPM,0)+' RPM');

  // Mini stats in preview
  const mini=[
    ['bpm-speed',fmt(cp.v0,1)+' m/s'],
    ['bpm-mass', fmt(cp.arrowMass*1000,1)+' g'],
    ['bpm-eff',  fmt(cp.eff*100,1)+'%'],
    ['bpm-ke',   fmt(cp.transferredJ,1)+' J'],
  ];
  mini.forEach(([id,v])=>{ const e=document.getElementById(id); if(e) e.textContent=v; });
}

function initCustomBuilder(){
  buildBowTypeSelect();
  buildOptionGrid('body-grid',   BODY_MATERIALS, 'bodyMat',  null);
  buildOptionGrid('string-grid', STRING_MATERIALS,'stringMat',null);
  buildOptionGrid('arrow-grid',  ARROW_MATERIALS, 'arrowMat', null);
  buildOptionGrid('fletch-grid', FLETCHING,       'fletching',null);
  buildOptionGrid('tip-grid',    TIP_TYPES,       'tip',      null);
  buildDrawWeightSelect();

  // Draw length slider
  const dlSlider=document.getElementById('draw-length-slider');
  const dlOut=document.getElementById('draw-length-out');
  if(dlSlider){
    dlSlider.value=customBow.drawLength;
    dlOut.textContent=customBow.drawLength+' in';
    dlSlider.oninput=()=>{ customBow.drawLength=+dlSlider.value; dlOut.textContent=dlSlider.value+' in'; updateBowStats(); };
  }

  // Arrow length
  const alSlider=document.getElementById('arrow-length-slider');
  const alOut=document.getElementById('arrow-length-out');
  if(alSlider){
    alSlider.value=customBow.arrowLength;
    alOut.textContent=customBow.arrowLength+' mm';
    alSlider.oninput=()=>{ customBow.arrowLength=+alSlider.value; alOut.textContent=alSlider.value+' mm'; updateBowStats(); };
  }

  // Bow name
  const nameEl=document.getElementById('bow-name-input');
  if(nameEl){ nameEl.value=customBow.name; nameEl.oninput=()=>{ customBow.name=nameEl.value; }; }

  updateBowStats();
  drawBowPreview();
}

function fireCustomBow(){
  const cp=computeCustomBow();
  const ang=+document.getElementById('fire-angle').value;
  const h0=+document.getElementById('fire-height').value;
  const useAir=document.getElementById('fire-drag').checked;
  const manualV=document.getElementById('fire-manual').checked;
  const v0=manualV ? +document.getElementById('fire-speed').value : cp.v0;

  const R=simulateArrow({v0,angleDeg:ang,h0,mass:cp.arrowMass,cd:cp.effectiveCd,diam:cp.diam,useAir,dt:.005});

  // Draw on custom canvas
  customRenderer.animate([{pts:R.pts, color:'#c04015', dashed:false, result:R, label:customBow.name}]);

  const noAirR=simulateArrow({v0,angleDeg:ang,h0,mass:cp.arrowMass,cd:cp.effectiveCd,diam:cp.diam,useAir:false,dt:.005});
  customRenderer.animate([
    {pts:noAirR.pts,color:'#888',dashed:true,result:noAirR,label:'No air resist'},
    {pts:R.pts, color:'#c04015',dashed:false,result:R,label:customBow.name+(useAir?'':(` (no drag)`))}
  ]);

  // Results HTML
  const bow_=BOW_PRESETS; // just for reference labels
  document.getElementById('custom-results').innerHTML = `
    <div class="custom-result-card">
      <h3>🏹 "${customBow.name}" — Simulation Results</h3>
      <div class="stat-grid">
        <div class="stat-tile hi"><div class="s-label">RANGE</div><div class="s-value">${fmt(R.range,1)}</div><div class="s-unit">meters</div></div>
        <div class="stat-tile"><div class="s-label">FLIGHT TIME</div><div class="s-value">${fmt(R.flightT,3)}</div><div class="s-unit">seconds</div></div>
        <div class="stat-tile good"><div class="s-label">MAX HEIGHT</div><div class="s-value">${fmt(R.apexY,2)}</div><div class="s-unit">m at ${fmt(R.apexX,1)} m horiz</div></div>
        <div class="stat-tile gold"><div class="s-label">MAX SPEED</div><div class="s-value">${fmt(R.maxSpeed,1)}</div><div class="s-unit">m/s (${fmt(R.maxSpeed/0.3048,0)} fps)</div></div>
        <div class="stat-tile"><div class="s-label">IMPACT SPEED</div><div class="s-value">${fmt(R.finalSpeed,1)}</div><div class="s-unit">m/s</div></div>
        <div class="stat-tile hi"><div class="s-label">DESCENT ANGLE</div><div class="s-value">${fmt(R.descentAngle,1)}°</div><div class="s-unit">below horizontal</div></div>
        <div class="stat-tile"><div class="s-label">MUZZLE KE</div><div class="s-value">${fmt(R.ke0,1)}</div><div class="s-unit">Joules</div></div>
        <div class="stat-tile ${R.energyPct<80?'hi':'good'}"><div class="s-label">KE RETAINED</div><div class="s-value">${fmt(R.energyPct,1)}%</div><div class="s-unit">at impact</div></div>
      </div>

      <div class="sec-title" style="margin:1rem 0 .5rem;font-size:.9rem">📐 How the speed was calculated</div>
      ${buildMathSteps([
        {eq:`Draw weight = ${customBow.drawWeight} lb = ${customBow.drawWeight} × 4.4482 = ${fmt(cp.drawN,2)} N`,note:`${cp.body.name} body, ${cp.btype.name} bow type`},
        {eq:`Draw length = ${customBow.drawLength} in = ${fmt(cp.drawM,4)} m`,note:`User-set draw length`},
        {eq:`Energy stored = ½ × F × d = ½ × ${fmt(cp.drawN,2)} × ${fmt(cp.drawM,4)} = ${fmt(cp.storedJ,3)} J`,note:`Potential energy in drawn limbs`},
        {eq:`Efficiency = body(${fmt(cp.body.draw,2)}) × string(${fmt(cp.str.tension,2)}) × bow(${fmt(cp.btype.eff,2)}) = ${fmt(cp.eff,4)}  (${fmt(cp.eff*100,1)}%)`,note:`Each component multiplies transfer efficiency`},
        {eq:`Energy transferred = ${fmt(cp.storedJ,3)} × ${fmt(cp.eff,4)} = ${fmt(cp.transferredJ,3)} J`,note:`Energy actually given to arrow`},
        {eq:`Arrow mass = shaft(${fmt(cp.arrow.mass*1000,1)}g) + tip(${fmt(cp.tip.mass_add*1000,1)}g) = ${fmt(cp.arrowMass*1000,2)} g = ${fmt(cp.arrowMass,6)} kg`,note:``},
        {eq:`v₀ = √(2 × KE / m) = √(2 × ${fmt(cp.transferredJ,3)} / ${fmt(cp.arrowMass,6)}) = ${fmt(cp.v0,2)} m/s`,note:`Launch speed from stored energy`},
        {eq:`Range = ${fmt(R.range,2)} m  |  Max height = ${fmt(R.apexY,2)} m  |  Time = ${fmt(R.flightT,3)} s`,note:`Computed via RK4 numerical integration (${useAir?'with':'without'} air resistance)`},
        {eq:`Max speed occurs at ${useAir?'impact (gravity accelerates, drag decelerates)':'impact (gravity dominates)'}`,note:`Max speed = ${fmt(R.maxSpeed,2)} m/s = ${fmt(R.maxSpeed/0.3048,0)} fps`},
      ])}

      <div class="callout" style="margin-top:.9rem">
        Without air resistance, range would be <strong>${fmt(noAirR.range,1)} m</strong> — drag reduces this by <strong>${fmt((1-R.range/noAirR.range)*100,1)}%</strong>.
        The grey dashed line shows the no-drag trajectory.
      </div>
    </div>
  `;
}

/* ════════════════════════════════════════════════════════════
   MAIN SIMULATION (preset bows)
   ════════════════════════════════════════════════════════════ */
let mainRenderer, customRenderer;
let activeBow='compound', activeTerrain='flat';

function runSimulation(){
  const ang=+document.getElementById('sim-angle').value;
  const wind=+document.getElementById('sim-wind').value;
  const windA=+document.getElementById('sim-windangle').value;
  const useAir=document.getElementById('sim-drag').checked;
  const h0=+document.getElementById('sim-height').value;
  const terrain=TERRAIN[activeTerrain];
  const effAngle=ang+terrain.slope;
  const wX=wind*Math.cos(windA*Math.PI/180);

  const trails=[];
  Object.entries(BOW_PRESETS).forEach(([key,b])=>{
    const R=simulateArrow({v0:b.speed,angleDeg:effAngle,h0,mass:b.mass,cd:b.cd,diam:b.diam,windX:wX,useAir,dt:.005});
    trails.push({pts:R.pts,color:b.color,dashed:key!==activeBow,result:R,label:b.name});
  });
  // Selected bow on top
  const si=Object.keys(BOW_PRESETS).indexOf(activeBow);
  if(si>0){ const t=trails.splice(si,1)[0]; trails.push(t); }

  mainRenderer.animate(trails);

  // Stats for selected bow only
  const b=BOW_PRESETS[activeBow];
  const R=simulateArrow({v0:b.speed,angleDeg:effAngle,h0,mass:b.mass,cd:b.cd,diam:b.diam,windX:wX,useAir,dt:.005});

  document.getElementById('sim-results').innerHTML=`
    <div class="stat-grid">
      <div class="stat-tile hi"><div class="s-label">RANGE</div><div class="s-value">${fmt(R.range,1)}</div><div class="s-unit">m</div></div>
      <div class="stat-tile"><div class="s-label">FLIGHT TIME</div><div class="s-value">${fmt(R.flightT,3)}</div><div class="s-unit">s</div></div>
      <div class="stat-tile good"><div class="s-label">APEX HEIGHT</div><div class="s-value">${fmt(R.apexY,2)}</div><div class="s-unit">m</div></div>
      <div class="stat-tile gold"><div class="s-label">MAX SPEED</div><div class="s-value">${fmt(R.maxSpeed,1)}</div><div class="s-unit">m/s</div></div>
      <div class="stat-tile"><div class="s-label">IMPACT SPEED</div><div class="s-value">${fmt(R.finalSpeed,1)}</div><div class="s-unit">m/s</div></div>
      <div class="stat-tile hi"><div class="s-label">DESCENT ANGLE</div><div class="s-value">${fmt(R.descentAngle,1)}°</div><div class="s-unit">below horiz</div></div>
      <div class="stat-tile"><div class="s-label">MUZZLE KE</div><div class="s-value">${fmt(R.ke0,1)}</div><div class="s-unit">J</div></div>
      <div class="stat-tile"><div class="s-label">KE RETAINED</div><div class="s-value">${fmt(R.energyPct,1)}%</div><div class="s-unit">at impact</div></div>
    </div>
    ${buildMathSteps([
      {eq:`${b.name}: v₀=${b.speed} m/s, m=${b.mass*1000}g, θ_eff=${fmt(effAngle,1)}° (${ang}° + slope ${terrain.slope}°)`,note:`Terrain: ${terrain.name} | Air resist: ${useAir?'ON':'OFF'}`},
      {eq:`vₓ₀=${b.speed}·cos(${fmt(effAngle,1)}°)=${fmt(b.speed*Math.cos(effAngle*Math.PI/180),2)} m/s`,note:'Horizontal component'},
      {eq:`vᵧ₀=${b.speed}·sin(${fmt(effAngle,1)}°)=${fmt(b.speed*Math.sin(effAngle*Math.PI/180),2)} m/s`,note:'Vertical component'},
      {eq:`Range=${fmt(R.range,2)} m | Apex=${fmt(R.apexY,2)} m | t=${fmt(R.flightT,4)} s`,note:'RK4 numerical integration of equations of motion'},
      {eq:`KE₀=½×${b.mass}×${b.speed}²=${fmt(R.ke0,2)} J  →  KE_impact=${fmt(R.keI,2)} J (${fmt(R.energyPct,1)}% retained)`,note:`Kinetic energy ${useAir?'lost to drag':'fully retained (no drag)'}`},
      {eq:`Descent angle=arctan(${fmt(Math.abs(R.finalVy),2)}/${fmt(R.finalVx,2)})=${fmt(R.descentAngle,2)}° below horizontal`,note:'Angle of velocity vector at impact'},
    ])}
    <div class="compare-grid">
      ${Object.entries(BOW_PRESETS).map(([k,b])=>{
        const r=simulateArrow({v0:b.speed,angleDeg:effAngle,h0,mass:b.mass,cd:b.cd,diam:b.diam,windX:wX,useAir,dt:.005});
        return `<div class="compare-card" style="border-left:3px solid ${b.color}">
          <h4 style="color:${b.color}">${b.name}</h4>
          <div class="cc-row"><span>Range</span><span class="cc-val">${fmt(r.range,1)} m</span></div>
          <div class="cc-row"><span>Max Speed</span><span class="cc-val">${fmt(r.maxSpeed,1)} m/s</span></div>
          <div class="cc-row"><span>Apex</span><span class="cc-val">${fmt(r.apexY,2)} m</span></div>
          <div class="cc-row"><span>Impact</span><span class="cc-val">${fmt(r.finalSpeed,1)} m/s</span></div>
          <div class="cc-row"><span>KE Impact</span><span class="cc-val">${fmt(r.keI,1)} J</span></div>
        </div>`;
      }).join('')}
    </div>
  `;
}

/* ════════════════════════════════════════════════════════════
   DESCENT CALC
   ════════════════════════════════════════════════════════════ */
function calcDescent(){
  const v0=+document.getElementById('dc-speed').value;
  const ang=+document.getElementById('dc-angle').value;
  const h0=+document.getElementById('dc-launch').value;
  const ht=+document.getElementById('dc-target').value;
  const vy0=v0*Math.sin(ang*Math.PI/180);
  const A=0.5*g, B=-vy0, C=-(h0-ht);
  const disc=B*B-4*A*C;
  if(disc<0){ document.getElementById('dc-results').innerHTML='<div class="callout error">Arrow never reaches this height. Try increasing launch height or angle.</div>'; return; }
  const t1=(-B+Math.sqrt(disc))/(2*A), t2=(-B-Math.sqrt(disc))/(2*A);
  const tD=Math.max(t1,t2), tA=Math.min(t1,t2);
  const vyT=vy0-g*tD, vxT=v0*Math.cos(ang*Math.PI/180);
  const spd=Math.sqrt(vxT*vxT+vyT*vyT);
  const da=Math.atan2(Math.abs(vyT),vxT)*180/Math.PI;
  document.getElementById('dc-results').innerHTML=`
    <div class="stat-grid">
      <div class="stat-tile hi"><div class="s-label">DESCENT SPEED</div><div class="s-value">${fmt(Math.abs(vyT),2)}</div><div class="s-unit">m/s downward</div></div>
      <div class="stat-tile"><div class="s-label">HORIZ SPEED</div><div class="s-value">${fmt(vxT,2)}</div><div class="s-unit">m/s</div></div>
      <div class="stat-tile gold"><div class="s-label">TOTAL SPEED</div><div class="s-value">${fmt(spd,2)}</div><div class="s-unit">m/s</div></div>
      <div class="stat-tile hi"><div class="s-label">DESCENT ANGLE</div><div class="s-value">${fmt(da,1)}°</div><div class="s-unit">below horizontal</div></div>
      <div class="stat-tile"><div class="s-label">TIME ELAPSED</div><div class="s-value">${fmt(tD,3)}</div><div class="s-unit">s</div></div>
      <div class="stat-tile good"><div class="s-label">HORIZ DIST</div><div class="s-value">${fmt(vxT*tD,1)}</div><div class="s-unit">m</div></div>
    </div>
    ${buildMathSteps([
      {eq:`y(t) = h₀ + vᵧ₀·t − ½g·t²  →  set y = ${ht} m`, note:`h₀=${h0} m, v₀=${v0} m/s, θ=${ang}°`},
      {eq:`½g·t² − vᵧ₀·t + (${ht}−h₀) = 0  →  ${fmt(0.5*g,4)}t² ${fmt(B,3)>0?'+':''}${fmt(B,3)}t + ${fmt(C,3)} = 0`,note:'Quadratic in t'},
      {eq:`Δ = b²−4ac = ${fmt(disc,4)}  →  t₁=${fmt(tA,4)} s (ascending), t₂=${fmt(tD,4)} s (descending)`,note:'Two crossings; take descending'},
      {eq:`vᵧ(t₂) = vᵧ₀ − g·t = ${fmt(vy0,3)} − 9.81×${fmt(tD,4)} = ${fmt(vyT,4)} m/s  (negative = falling)`,note:''},
      {eq:`Descent speed = |vᵧ| = ${fmt(Math.abs(vyT),3)} m/s`,note:`Arrow falls this fast at ${ht} m height`},
      {eq:`Descent angle = arctan(${fmt(Math.abs(vyT),2)}/${fmt(vxT,2)}) = ${fmt(da,2)}°`,note:'Angle below horizontal'},
    ])}`;
}

/* ════════════════════════════════════════════════════════════
   ANGLE & RANGE CALCS
   ════════════════════════════════════════════════════════════ */
function calcRange(){
  const v0=+document.getElementById('rc-speed').value, ang=+document.getElementById('rc-angle').value, h0=+document.getElementById('rc-height').value;
  const vx=v0*Math.cos(ang*Math.PI/180), vy=v0*Math.sin(ang*Math.PI/180);
  const t=(vy+Math.sqrt(vy*vy+2*g*h0))/g, r=vx*t, aH=h0+vy*vy/(2*g);
  document.getElementById('rc-results').innerHTML=`
    <div class="stat-grid">
      <div class="stat-tile hi"><div class="s-label">RANGE</div><div class="s-value">${fmt(r,1)}</div><div class="s-unit">m</div></div>
      <div class="stat-tile"><div class="s-label">FLIGHT TIME</div><div class="s-value">${fmt(t,3)}</div><div class="s-unit">s</div></div>
      <div class="stat-tile good"><div class="s-label">APEX</div><div class="s-value">${fmt(aH,2)}</div><div class="s-unit">m</div></div>
    </div>
    ${buildMathSteps([
      {eq:`vₓ=${v0}·cos(${ang}°)=${fmt(vx,3)} m/s,  vᵧ=${v0}·sin(${ang}°)=${fmt(vy,3)} m/s`,note:''},
      {eq:`t=(vᵧ+√(vᵧ²+2gh₀))/g=(${fmt(vy,3)}+√(${fmt(vy*vy+2*g*h0,3)}))/9.81=${fmt(t,4)} s`,note:''},
      {eq:`R=vₓ·t=${fmt(vx,3)}×${fmt(t,4)}=${fmt(r,3)} m`,note:''},
    ])}`;
}

function calcAngleToHit(){
  const v0=+document.getElementById('ath-speed').value, d=+document.getElementById('ath-dist').value, ht=+document.getElementById('ath-height').value;
  const k=g*d*d/(2*v0*v0), A2=k, B2=-d, C2=ht+k, disc=B2*B2-4*A2*C2;
  if(disc<0){ document.getElementById('ath-results').innerHTML='<div class="callout error">Cannot reach target — arrow too slow or target too far/high.</div>'; return; }
  const u1=(-B2+Math.sqrt(disc))/(2*A2), u2=(-B2-Math.sqrt(disc))/(2*A2);
  document.getElementById('ath-results').innerHTML=`
    ${buildMathSteps([
      {eq:`y = x·tan(θ) − gx²/(2v₀²cos²θ)  →  set y=${ht}, x=${d}`,note:'Parabolic trajectory'},
      {eq:`k=gd²/(2v₀²)=${fmt(k,4)}  →  k·u²−d·u+(ht+k)=0,  u=tan(θ)`,note:''},
      {eq:`θ₁=arctan(${fmt(u1,4)})=${fmt(Math.atan(u1)*180/Math.PI,2)}°  (direct),  θ₂=arctan(${fmt(u2,4)})=${fmt(Math.atan(u2)*180/Math.PI,2)}°  (lobbed)`,note:''},
    ])}
    <div class="callout info">Shoot at <strong>${fmt(Math.atan(u1)*180/Math.PI,2)}°</strong> (direct) or <strong>${fmt(Math.atan(u2)*180/Math.PI,2)}°</strong> (high arc) to hit the target.</div>`;
}

function calcUphillDownhill(){
  const d=+document.getElementById('ud-dist').value, s=+document.getElementById('ud-slope').value;
  const dE=d*Math.cos(s*Math.PI/180);
  document.getElementById('ud-results').innerHTML=`
    ${buildMathSteps([
      {eq:`d_eff = d_LOS · cos(α) = ${d} · cos(${s}°) = ${fmt(dE,2)} m`,note:'Effective horizontal distance gravity acts on'},
      {eq:`Height diff = d · sin(${s}°) = ${fmt(d*Math.sin(s*Math.PI/180),2)} m`,note:`${s>0?'Uphill':'Downhill'} elevation`},
    ])}
    <div class="callout"><strong>Dial your sight for ${fmt(dE,1)} m</strong> — not ${d} m — when shooting ${s>0?'uphill':'downhill'} at ${Math.abs(s)}°.</div>`;
}

function calcWind(){
  const v0=+document.getElementById('wc-speed').value, d=+document.getElementById('wc-dist').value;
  const vw=+document.getElementById('wc-wind').value, wa=+document.getElementById('wc-angle').value;
  const t=d/v0, cross=vw*Math.sin(wa*Math.PI/180), drift=cross*t;
  const needle=document.getElementById('wind-needle'); if(needle) needle.style.transform=`rotate(${wa}deg)`;
  document.getElementById('wc-results').innerHTML=`
    <div class="stat-grid">
      <div class="stat-tile"><div class="s-label">FLIGHT TIME</div><div class="s-value">${fmt(t,3)}</div><div class="s-unit">s</div></div>
      <div class="stat-tile"><div class="s-label">CROSS-WIND</div><div class="s-value">${fmt(cross,2)}</div><div class="s-unit">m/s</div></div>
      <div class="stat-tile hi"><div class="s-label">DRIFT</div><div class="s-value">${fmt(drift*100,1)}</div><div class="s-unit">cm</div></div>
    </div>
    ${buildMathSteps([
      {eq:`t=d/v₀=${d}/${v0}=${fmt(t,4)} s`,note:''},
      {eq:`v_cross=v_wind·sin(ψ)=${vw}·sin(${wa}°)=${fmt(cross,3)} m/s`,note:''},
      {eq:`drift=v_cross·t=${fmt(cross,3)}×${fmt(t,4)}=${fmt(drift,4)} m = ${fmt(drift*100,2)} cm`,note:''},
    ])}
    <div class="callout">Aim <strong>${fmt(drift*100,1)} cm into the wind</strong> to compensate.</div>`;
}

function calcFOC(){
  const L=+document.getElementById('foc-len').value, BP=+document.getElementById('foc-bp').value;
  const foc=((BP-L/2)/L)*100;
  const rating=foc<7?'⚠️ Too low':foc<=15?'✅ Ideal (10–15%)':foc<=19?'🟡 Good':'🔴 High';
  document.getElementById('foc-results').innerHTML=`
    <div class="foc-bar-wrap"><div class="foc-bar" style="width:${Math.min(100,foc*3.5)}%"></div><div class="foc-ideal" style="left:35%"></div><div class="foc-ideal" style="left:52.5%"></div></div>
    ${buildMathSteps([{eq:`FOC%=((${BP}−${L}/2)/${L})×100=${fmt(foc,2)}%`,note:rating}])}
    <div class="callout ${foc>=10&&foc<=15?'':'warn'}">${rating} — FOC = <strong>${fmt(foc,2)}%</strong></div>`;
}

function calcSpin(){
  const v0=+document.getElementById('spin-speed').value, off=+document.getElementById('spin-offset').value, d=+document.getElementById('spin-diam').value/1000;
  const c=Math.PI*d, rps=v0*Math.tan(off*Math.PI/180)/c;
  document.getElementById('spin-results').innerHTML=`
    ${buildMathSteps([{eq:`ω=v₀·tan(α)/C=${v0}·tan(${off}°)/${fmt(c,6)}=${fmt(rps,2)} rev/s = ${fmt(rps*60,1)} RPM`,note:''}])}
    <div class="stat-grid">
      <div class="stat-tile hi"><div class="s-label">SPIN</div><div class="s-value">${fmt(rps*60,0)}</div><div class="s-unit">RPM</div></div>
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   REFERENCE TABLES
   ════════════════════════════════════════════════════════════ */
function buildTables(){
  const speeds=[40,50,58,60,70,80,88,90,107], dists=[10,20,30,40,50,60,70,80,100];
  let h=`<div class="table-wrap"><table class="data-table"><tr><th>v₀</th>`;
  dists.forEach(d=>h+=`<th>${d}m</th>`);
  h+='</tr>';
  speeds.forEach(v=>{
    h+=`<tr><td>${v} m/s</td>`;
    dists.forEach(d=>h+=`<td>${fmt(.5*g*(d/v)**2*100,1)} cm</td>`);
    h+='</tr>';
  });
  document.getElementById('drop-table').innerHTML=h+'</table></div>';

  let h2=`<div class="table-wrap"><table class="data-table"><tr><th>v₀</th>`;
  dists.forEach(d=>h2+=`<th>${d}m</th>`);
  h2+='</tr>';
  speeds.forEach(v=>{
    h2+=`<tr><td>${v} m/s</td>`;
    dists.forEach(d=>h2+=`<td>${fmt(d/v,3)} s</td>`);
    h2+='</tr>';
  });
  document.getElementById('tof-table').innerHTML=h2+'</table></div>';
}

/* ════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════ */
function fmt(n,d=2){ return isFinite(n)?(+n.toFixed(d)).toLocaleString():'—' }

function buildMathSteps(steps){
  return `<div class="math-steps">${steps.map((s,i)=>`<div class="math-step"><div class="step-num">${i+1}</div><div><div class="step-eq">${s.eq}</div><div class="step-note">${s.note}</div></div></div>`).join('')}</div>`;
}

function bindSlider(id,outId,suffix){
  const inp=document.getElementById(id), out=document.getElementById(outId);
  if(!inp||!out) return;
  const u=()=>out.textContent=inp.value+suffix;
  inp.addEventListener('input',u); u();
}

function switchTab(name){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active',p.id==='tab-'+name));
  if(name==='reference') buildTables();
  if(name==='simulator') setTimeout(()=>{ mainRenderer&&mainRenderer.resize()&&runSimulation(); },60);
  if(name==='builder') setTimeout(()=>{ customRenderer&&customRenderer.resize(); drawBowPreview(); },60);
}

function selectBow(t){ activeBow=t; document.querySelectorAll('.bow-card').forEach(c=>c.classList.toggle('selected',c.dataset.bow===t)); }
function selectTerrain(t){ activeTerrain=t; document.querySelectorAll('.terrain-btn').forEach(b=>b.classList.toggle('active',b.dataset.terrain===t)); }

/* ════════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  mainRenderer   = new Renderer('sim-canvas');
  customRenderer = new Renderer('custom-canvas');

  bindSlider('sim-angle','sim-angle-out','°');
  bindSlider('sim-wind','sim-wind-out',' m/s');
  bindSlider('sim-windangle','sim-windangle-out','°');
  bindSlider('sim-height','sim-height-out',' m');

  // Show/hide manual speed input
  const manualCb=document.getElementById('fire-manual');
  const manualRow=document.getElementById('fire-speed-row');
  if(manualCb) manualCb.onchange=()=>{ if(manualRow) manualRow.style.display=manualCb.checked?'':'none'; };

  setTimeout(()=>{
    mainRenderer.resize(); runSimulation();
    initCustomBuilder();
  },120);

  window.addEventListener('resize',()=>{
    const at=document.querySelector('.tab-btn.active');
    if(!at) return;
    if(at.dataset.tab==='simulator'){ mainRenderer.resize(); runSimulation(); }
    if(at.dataset.tab==='builder')  { customRenderer.resize(); drawBowPreview(); }
  });
});
