import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ============ 基础 ============ */
const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e1116);
scene.fog = new THREE.Fog(0x0e1116, 30, 70);

const camera = new THREE.PerspectiveCamera(46, innerWidth/innerHeight, 0.05, 200);
camera.position.set(9.5, 8.2, 11.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(5.3, 0.4, 3.6);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 1.2;
controls.maxDistance = 30;

/* 灯光：傍晚模式（实拍是傍晚） */
const hemi = new THREE.HemisphereLight(0xcfd8e6, 0x3a3226, 0.55);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0x8fb0e8, 0.5);   // 傍晚室外冷光
sun.position.set(-6, 9, -4);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left=-10; sun.shadow.camera.right=12;
sun.shadow.camera.top=10; sun.shadow.camera.bottom=-10;
sun.shadow.bias = -0.0004;
scene.add(sun);
const warm = new THREE.PointLight(0xffd9a0, 0.0, 0, 1.6); // 白天模式补光
warm.position.set(5.3, 2.4, 3.6);
scene.add(warm);

/* 室内灯组（可单独开关效果：夜晚亮/白天灭） */
const roomLights = [];
function roomLight(x, y, z, color=0xffd9a8, i=14, d=7){
  const L = new THREE.PointLight(color, i, d, 1.8);
  L.position.set(x, y, z);
  scene.add(L); roomLights.push(L);
  return L;
}

/* ============ 材质 ============ */
const M = {
  wall:   new THREE.MeshStandardMaterial({ color:0xf2efe8, roughness:0.94 }),
  wallIn: new THREE.MeshStandardMaterial({ color:0xf5f2ea, roughness:0.94 }),
  ceil:   new THREE.MeshStandardMaterial({ color:0xf7f5f0, roughness:0.95 }),
  floorW: new THREE.MeshStandardMaterial({ color:0xdcc39a, roughness:0.55, metalness:0.05 }),
  floorT: new THREE.MeshStandardMaterial({ color:0xb9b7b2, roughness:0.35 }),
  bathT:  new THREE.MeshStandardMaterial({ color:0xd8d5cf, roughness:0.3 }),
  white:  new THREE.MeshStandardMaterial({ color:0xf6f6f4, roughness:0.5 }),
  cabW:   new THREE.MeshStandardMaterial({ color:0xf4f4f2, roughness:0.42 }),
  woodD:  new THREE.MeshStandardMaterial({ color:0x5d3f28, roughness:0.55 }),
  woodM:  new THREE.MeshStandardMaterial({ color:0x8a6844, roughness:0.6 }),
  woodL:  new THREE.MeshStandardMaterial({ color:0xc9a06a, roughness:0.6 }),
  black:  new THREE.MeshStandardMaterial({ color:0x17181c, roughness:0.45, metalness:0.25 }),
  dark:   new THREE.MeshStandardMaterial({ color:0x232228, roughness:0.6 }),
  tvWall: new THREE.MeshStandardMaterial({ color:0x1e1c1a, roughness:0.7 }),
  glass:  new THREE.MeshStandardMaterial({ color:0x9fb6c9, roughness:0.08, metalness:0.1, transparent:true, opacity:0.32 }),
  glassD: new THREE.MeshStandardMaterial({ color:0x2c3844, roughness:0.06, metalness:0.2, transparent:true, opacity:0.55 }),
  steel:  new THREE.MeshStandardMaterial({ color:0xb9bec6, roughness:0.28, metalness:0.85 }),
  chrome: new THREE.MeshStandardMaterial({ color:0xd7dce2, roughness:0.12, metalness:0.95 }),
  counter:new THREE.MeshStandardMaterial({ color:0xfbfbfa, roughness:0.22 }),
  fabric: new THREE.MeshStandardMaterial({ color:0x9a9a96, roughness:0.95 }),
  fabricD:new THREE.MeshStandardMaterial({ color:0x6f6f6b, roughness:0.95 }),
  mattress:new THREE.MeshStandardMaterial({ color:0xf3f1ec, roughness:0.35 }),
  plastic:new THREE.MeshStandardMaterial({ color:0xf5f4f1, roughness:0.18, transparent:true, opacity:0.55 }),
  blue:   new THREE.MeshStandardMaterial({ color:0x2b4d8f, roughness:0.7 }),
  yellow: new THREE.MeshStandardMaterial({ color:0xe8b93c, roughness:0.5 }),
  green:  new THREE.MeshStandardMaterial({ color:0x3f7a4e, roughness:0.6 }),
  red:    new THREE.MeshStandardMaterial({ color:0xb03a2e, roughness:0.6 }),
  tile:   new THREE.MeshStandardMaterial({ color:0xcfd2d6, roughness:0.35 }),
  night:  new THREE.MeshBasicMaterial({ color:0x1b2740 }),
  led:    new THREE.MeshBasicMaterial({ color:0xfff2cf }),
  ledWarm:new THREE.MeshBasicMaterial({ color:0xffc978 }),
};
M.woodL = new THREE.MeshStandardMaterial({ color:0xc9a06a, roughness:0.6 });

/* ============ 部件注册（点击介绍） ============ */
const PARTS = [];
function reg(obj, name, desc){
  obj.traverse(o=>{ if(o.isMesh){ o.userData.part={name,desc}; PARTS.push(o); }});
  return obj;
}
function B(w,h,d,mat,x=0,y=0,z=0,ry=0){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  m.position.set(x,y,z); m.rotation.y = ry;
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function Cyl(rt,rb,h,mat,x=0,y=0,z=0,seg=20){
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg), mat);
  m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true;
  return m;
}
/* 带洞口的墙：沿 x 方向从 x0 到 x1，墙体中心 z，厚度 t，高 h；
   openings: [{a0,a1,y0,y1}] a 为沿墙方向坐标 */
function wallX(x0,x1,z,t,h,y0=0,openings=[],mat=M.wallIn){
  const g = new THREE.Group();
  const segs=[];
  let cur=x0;
  const ops=[...openings].sort((a,b)=>a.a0-b.a0);
  for(const o of ops){
    if(o.a0>cur) segs.push([cur,o.a0,y0,y0+h]);
    if(o.y0>y0) segs.push([o.a0,o.a1,y0,o.y0]);
    if(o.y1<y0+h) segs.push([o.a0,o.a1,o.y1,y0+h]);
    cur=Math.max(cur,o.a1);
  }
  if(cur<x1) segs.push([cur,x1,y0,y0+h]);
  for(const [a,b,c,d] of segs){
    if(b-a<0.005||d-c<0.005) continue;
    g.add(B(b-a,d-c,t,mat,(a+b)/2,(c+d)/2,z));
  }
  return g;
}
/* 沿 z 方向的墙 */
function wallZ(z0,z1,x,t,h,y0=0,openings=[],mat=M.wallIn){
  const g = new THREE.Group();
  const segs=[];
  let cur=z0;
  const ops=[...openings].sort((a,b)=>a.a0-b.a0);
  for(const o of ops){
    if(o.a0>cur) segs.push([cur,o.a0,y0,y0+h]);
    if(o.y0>y0) segs.push([o.a0,o.a1,y0,o.y0]);
    if(o.y1<y0+h) segs.push([o.a0,o.a1,o.y1,y0+h]);
    cur=Math.max(cur,o.a1);
  }
  if(cur<z1) segs.push([cur,z1,y0,y0+h]);
  for(const [a,b,c,d] of segs){
    if(b-a<0.005||d-c<0.005) continue;
    g.add(B(t,d-c,b-a,mat,x,(c+d)/2,(a+b)/2));
  }
  return g;
}
/* 房名标签 */
const labelGroup = new THREE.Group(); scene.add(labelGroup);
function roomLabel(text,x,z){
  const c=document.createElement('canvas'); c.width=256; c.height=72;
  const g=c.getContext('2d');
  g.fillStyle='rgba(14,16,20,0.72)';
  g.beginPath(); g.roundRect(28,8,200,56,14); g.fill();
  g.strokeStyle='rgba(216,198,144,0.65)'; g.lineWidth=2; g.stroke();
  g.fillStyle='#efe9d8'; g.font='600 30px "PingFang SC","Microsoft YaHei"';
  g.textAlign='center'; g.textBaseline='middle'; g.fillText(text,128,38);
  const t=new THREE.CanvasTexture(c);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));
  s.scale.set(1.5,0.42,1); s.position.set(x,2.55,z); s.renderOrder=5;
  labelGroup.add(s);
}

/* 尺寸（米） */
const W=10.655, D=7.44, H=2.8, T=0.24, T2=0.12;
const ceilGroup = new THREE.Group(); scene.add(ceilGroup); ceilGroup.visible = false;

/* ============ 建筑外壳 ============ */
const shell = new THREE.Group(); scene.add(shell);
const Y0=0, HH=H;

/* 窗：框+玻璃+窗台 */
function makeWindow(w, h, opts={}){
  const g = new THREE.Group();
  const fw = 0.07, fd = 0.1;
  const fm = opts.frameMat || M.dark;
  g.add(B(w, fw, fd, fm, 0, h-fw/2, 0));
  g.add(B(w, fw, fd, fm, 0, fw/2, 0));
  g.add(B(fw, h, fd, fm, -w/2+fw/2, h/2, 0));
  g.add(B(fw, h, fd, fm, w/2-fw/2, h/2, 0));
  g.add(B(w/2-fw, h-2*fw, 0.02, fm, -w/4+fw/4, h/2, 0)); // 中梃
  const gl = B(w-2*fw, h-2*fw, 0.015, opts.frosted?M.glassD:M.glass, 0, h/2, 0);
  gl.castShadow=false; g.add(gl);
  if(opts.bars){ // 防盗网
    for(let i=-2;i<=2;i++) g.add(B(0.03,h-0.1,0.03,M.dark,i*w/6,h/2,0.06));
    g.add(B(w-0.1,0.03,0.03,M.dark,0,h-0.12,0.06));
    g.add(B(w-0.1,0.03,0.03,M.dark,0,0.12,0.06));
  }
  g.add(B(w+0.08, 0.04, 0.16, M.white, 0, -0.02, 0)); // 窗台
  return reg(g, opts.name||'窗户', opts.desc||'断桥铝窗框，深色铝合金。');
}
/* 推拉门：黑框玻璃，两扇（一扇错开=开启） */
function slideDoor(w, h, open=0.45, name='推拉门', desc='黑框玻璃推拉门。'){
  const g = new THREE.Group();
  const t=0.05;
  const frame=(ww,hh)=>{ const f=new THREE.Group();
    f.add(B(ww,0.06,t,M.black,0,hh-0.03,0)); f.add(B(ww,0.06,t,M.black,0,0.03,0));
    f.add(B(0.06,hh,t,M.black,-ww/2+0.03,hh/2,0)); f.add(B(0.06,hh,t,M.black,ww/2-0.03,hh/2,0));
    const gl=B(ww-0.08,hh-0.1,0.015,M.glass,0,hh/2,0); gl.castShadow=false; f.add(gl);
    f.add(B(0.03,0.25,0.06,M.black,ww/2-0.08,1.05,0)); return f; };
  const a=frame(w/2,h); a.position.x=-w/4; g.add(a);
  const b=frame(w/2,h); b.position.x=w/4 - open*(w/2); b.position.z=0.055; g.add(b);
  g.add(B(w+0.1,0.07,0.14,M.black,0,h+0.035,0)); // 吊轨
  return reg(g,name,desc);
}

/* --- 地板 --- */
function floorRect(x0,x1,z0,z1,mat,y=0){
  const f=B(x1-x0,0.06,z1-z0,mat,(x0+x1)/2,y-0.03,(z0+z1)/2);
  f.castShadow=false; shell.add(f); return f;
}
floorRect(0,10.655,0,3.54,M.floorW);            // 北条：卧室/客厅/书桌
floorRect(2.85,9.325,3.54,7.20,M.floorW);       // 玄关/餐厅/走廊
floorRect(0,2.85,5.10,7.20,M.floorT);           // 厨房
floorRect(0,3.82,3.54,5.10,M.bathT);            // 卫生间+干区

/* --- 外墙 --- */
shell.add(wallX(0,10.655,0.12,T,HH,0,[{a0:3.2,a1:4.3,y0:1.0,y1:2.2}],M.wall)); // 北
shell.add(wallX(0,9.325,7.32,T,HH,0,[{a0:7.3,a1:8.3,y0:0,y1:2.1}],M.wall));    // 南
shell.add(wallZ(0,7.44,0.12,T,HH,0,[ // 西
  {a0:1.2,a1:2.4,y0:1.0,y1:2.2},{a0:3.9,a1:4.6,y0:1.4,y1:2.0},{a0:5.6,a1:6.6,y0:1.0,y1:2.2}],M.wall));
shell.add(wallZ(0,3.54,10.535,T,HH,0,[{a0:0.8,a1:2.3,y0:1.0,y1:2.2}],M.wall)); // 东（北段）
shell.add(wallZ(3.54,7.44,9.445,T,HH,0,[],M.wall));                            // 缺口西墙
/* 外窗安装 */
function putWin(w,h,x,y,z,ry,opts){ const wn=makeWindow(w,h,opts); wn.position.set(x,y,z); wn.rotation.y=ry; shell.add(wn); return wn; }
putWin(1.1,1.2, 3.75,1.0,0.12, 0, {name:'书桌区窗',desc:'书桌正对的北窗，傍晚时窗外是蓝色暮色。'});
putWin(1.2,1.2, 0.12,1.0,1.8, Math.PI/2, {name:'次卧窗',desc:'西墙窗，装了防盗网——低楼层标配。',bars:true});
putWin(0.7,0.6, 0.12,1.4,4.25, Math.PI/2, {name:'卫生间小窗',desc:'磨砂玻璃小窗，透光不透人。',frosted:true});
putWin(1.0,1.2, 0.12,1.0,6.1, Math.PI/2, {name:'厨房窗',desc:'水槽正对的西窗，备菜时能看到窗外。'});
putWin(1.5,1.2, 10.535,1.0,1.55, -Math.PI/2, {name:'主卧窗',desc:'东墙大窗，窗外是裙楼屋顶：空调外机和管道。'});

/* --- 内墙 --- */
const IW=M.wallIn;
// 次卧南墙 / 卫生间北墙
shell.add(wallX(0.24,2.96,3.48,T2,HH));
shell.add(wallX(2.96,4.57,3.48,T2,HH)); // 卫生间北墙东段
shell.add(wallX(3.82,4.57,5.04,T2,HH)); // 卫生间南墙东段
shell.add(wallZ(3.54,4.98,4.57,T2,HH)); // 卫生间东墙
// 次卧东墙（推拉门洞口 z 1.0–2.0）
shell.add(wallZ(0.24,3.42,3.02,T2,HH,0,[{a0:1.0,a1:2.0,y0:0,y1:2.1}],IW));
{ const d=slideDoor(1.0,2.1,0.5,'次卧推拉门','次卧与书桌区之间的黑框玻璃推拉门，视频里开着。'); d.position.set(3.02,0,1.5); d.rotation.y=Math.PI/2; shell.add(d); }
// 卫生间南墙 / 厨房北墙
shell.add(wallX(0.24,2.96,5.04,T2,HH));
// 卫生间东墙（门洞 z 4.0–4.8）
shell.add(wallZ(3.54,4.98,3.02,T2,HH,0,[{a0:4.0,a1:4.8,y0:0,y1:2.05}],IW));
{ const d=slideDoor(0.8,2.05,0.4,'卫生间推拉门','白色框玻璃推拉门，干湿分区。'); d.position.set(3.02,0,4.4); d.rotation.y=Math.PI/2; shell.add(d); }
// 干区南墙
shell.add(wallX(2.96,3.82,5.04,T2,HH));
// 走廊东墙 = 客厅西墙（洞口 z 2.2–3.0）
shell.add(wallZ(0.24,3.42,4.57,T2,HH,0,[{a0:2.2,a1:3.0,y0:0,y1:2.1}],IW));
// 客厅南墙（洞口 x 4.8–5.8 通玄关）
shell.add(wallX(4.63,7.51,3.48,T2,HH,0,[{a0:4.8,a1:5.8,y0:0,y1:2.1}],IW));
// 客厅东墙 = 主卧西墙（推拉门洞 z 1.2–2.7）
shell.add(wallZ(0.24,3.42,7.57,T2,HH,0,[{a0:1.2,a1:2.7,y0:0,y1:2.15}],IW));
{ const d=slideDoor(1.5,2.15,0.75,'客厅-主卧推拉门','客厅与主卧之间的大推拉门，视频里完全敞开。'); d.position.set(7.57,0,1.95); d.rotation.y=Math.PI/2; shell.add(d); }
// 主卧南墙
shell.add(wallX(7.63,10.415,3.48,T2,HH));
// 厨房北墙已由卫生间南墙+干区南墙覆盖；补 x2.96–3.82? 不需要（干区南墙即是）
// 厨房东墙（推拉门洞 z 5.9–6.9）
shell.add(wallZ(5.22,7.20,2.79,T2,HH,0,[{a0:5.9,a1:6.9,y0:0,y1:2.1}],IW));
{ const d=slideDoor(1.0,2.1,0.55,'厨房推拉门','厨房与过道之间的黑框玻璃推拉门。'); d.position.set(2.79,0,6.4); d.rotation.y=Math.PI/2; shell.add(d); }
// 餐厅北墙（宽洞口 x 4.3–5.2）
shell.add(wallX(4.06,5.43,5.16,T2,HH,0,[{a0:4.3,a1:5.2,y0:0,y1:2.1}],IW));
// 餐厅东墙（洞口 z 5.7–6.7 通玄关）
shell.add(wallZ(5.22,7.20,5.57,T2+0.16,HH,0,[{a0:5.7,a1:6.7,y0:0,y1:2.1}],IW));
// 入户门
{
  const g=new THREE.Group();
  g.add(B(1.0,2.1,0.08,M.black,0,1.05,0));
  g.add(B(0.86,1.96,0.02,M.dark,0,1.0,0.05));
  g.add(B(0.16,0.03,0.04,M.steel,0.32,1.02,0.08)); // 把手
  const eye=Cyl(0.02,0.02,0.02,M.chrome,0,1.6,0.07,12); eye.rotation.x=Math.PI/2; g.add(eye);
  g.position.set(7.8,0,7.32);
  shell.add(reg(g,'入户门','黑色防盗门，猫眼+长把手。视频结尾回到玄关就是它。'));
}
/* 天花板（可隐藏） */
{
  const c1=B(10.655,0.1,3.78,M.ceil,10.655/2,HH+0.05,1.89);
  const c2=B(9.565,0.1,3.66,M.ceil,9.565/2,HH+0.05,5.61);
  c1.castShadow=false; c2.castShadow=false;
  ceilGroup.add(c1,c2);
}
/* 踢脚线（主要房间） */
function baseboard(x0,x1,z){
  const b=B(x1-x0,0.08,0.02,M.white,(x0+x1)/2,0.04,z);
  b.castShadow=false; shell.add(b);
}
/* 室外：地面、邻楼剪影、主卧窗外屋顶 */
{
  const ground=B(80,0.1,80,new THREE.MeshStandardMaterial({color:0x2a2d33,roughness:1}),0,-3.05,0);
  ground.receiveShadow=true; scene.add(ground);
  const bmat=new THREE.MeshStandardMaterial({color:0x232c3d,roughness:1});
  const nb=[[-8,2,-6,10,14,8],[14,3,-8,9,18,10],[-6,1,12,12,10,6]];
  for(const [x,y,z,w,h,d] of nb){ const b=B(w,h,d,bmat,x,y,z); b.castShadow=false; scene.add(b);
    for(let i=0;i<6;i++)for(let j=0;j<3;j++){ const win=B(0.8,0.9,0.1,M.ledWarm,x-w/2+1+i*1.4,y-2+j*2.2,z+d/2+0.01); win.castShadow=false; scene.add(win);} }
  // 主卧窗外屋顶
  const roof=B(16,0.15,14,new THREE.MeshStandardMaterial({color:0x3a3d42,roughness:1}),18.5,-2.6,1.5);
  roof.receiveShadow=true; scene.add(roof);
  for(let i=0;i<3;i++){ const ac=B(0.9,0.7,0.5,M.steel,13+i*2.2,-2.1,0.5+i*1.3); scene.add(ac);
    scene.add(B(0.08,0.08,6,M.dark,13+i*2.2,-2.45,3)); }
  scene.add(B(0.12,0.12,12,M.dark,16,-2.4,4));
  reg(roof,'裙楼屋顶','主卧窗外就是裙楼屋顶：空调外机、管道，视频里看得很清楚。');
}

/* ============ 材质补 ============ */
M.card = new THREE.MeshStandardMaterial({ color:0xb08d5a, roughness:0.9 });
M.pink = new THREE.MeshStandardMaterial({ color:0xe6b7bd, roughness:0.9 });

/* ============ 厨房 ============ */
{
  const k = new THREE.Group(); scene.add(k);
  // 地柜：西（水槽） 南（灶） 北（备菜）
  k.add(B(0.6,0.82,1.2,M.woodD, 0.54,0.45,6.1));
  k.add(B(2.0,0.82,0.6,M.woodD, 1.50,0.45,6.90));
  k.add(B(1.7,0.82,0.6,M.woodD, 1.70,0.45,5.52));
  // 台面
  k.add(B(0.64,0.04,1.24,M.counter, 0.54,0.88,6.10));
  k.add(B(2.04,0.04,0.64,M.counter, 1.50,0.88,6.90));
  k.add(B(1.74,0.04,0.64,M.counter, 1.70,0.88,5.52));
  // 吊柜 + 灯带
  k.add(B(0.35,0.70,1.2,M.cabW, 0.42,1.95,6.10));
  k.add(B(1.70,0.70,0.35,M.cabW, 1.70,1.95,5.40));
  k.add(B(0.30,0.02,1.15,M.led, 0.42,1.59,6.10));
  k.add(B(1.65,0.02,0.30,M.led, 1.70,1.59,5.40));
  // 墙砖
  k.add(B(0.02,0.65,2.0,M.tile, 0.25,1.25,6.15));
  k.add(B(2.4,0.65,0.02,M.tile, 1.50,1.25,5.23));
  // 水槽+龙头（西墙窗下）
  const sink=new THREE.Group();
  sink.add(B(0.42,0.12,0.62,M.steel, 0,0,0));
  sink.add(B(0.36,0.02,0.56,M.dark, 0,0.05,0));
  const fa=new THREE.Group();
  fa.add(Cyl(0.022,0.022,0.34,M.chrome, 0,0.17,0));
  fa.add(B(0.26,0.035,0.035,M.chrome, 0.12,0.33,0));
  fa.add(Cyl(0.014,0.014,0.09,M.chrome, 0.24,0.28,0));
  fa.position.set(-0.12,0.02,0); sink.add(fa);
  sink.position.set(0.54,0.82,6.10); k.add(reg(sink,'水槽','台下式不锈钢水槽，正对西窗，鹅颈龙头。'));
  // 灶+锅（南）
  const stove=new THREE.Group();
  stove.add(B(0.72,0.025,0.46,M.black, 0,0,0));
  for(const sx of [-0.18,0.18]){
    stove.add(Cyl(0.09,0.09,0.02,M.dark, sx,0.02,0));
    stove.add(Cyl(0.05,0.05,0.03,M.black, sx,0.035,0));
  }
  const pot=new THREE.Group();
  pot.add(Cyl(0.11,0.10,0.12,M.steel, 0,0.09,0));
  pot.add(Cyl(0.115,0.115,0.02,M.dark, 0,0.16,0));
  pot.position.set(-0.18,0.04,0); stove.add(pot);
  stove.position.set(1.35,0.905,6.90); k.add(reg(stove,'燃气灶','双眼玻璃灶，左边还坐着一口锅。'));
  // 油烟机
  const hood=new THREE.Group();
  const panel=B(0.72,0.03,0.5,M.black, 0,0,0); panel.rotation.x=-0.45; panel.position.set(0,1.78,6.82); hood.add(panel);
  hood.add(B(0.4,0.6,0.3,M.steel, 0,2.2,6.95));
  k.add(reg(hood,'油烟机','侧吸式黑玻璃油烟机，烟道通到吊顶。'));
  // 热水器+燃气管（北墙）
  const wh=new THREE.Group();
  wh.add(B(0.55,0.45,0.26,M.white, 0,0,0));
  wh.add(Cyl(0.09,0.09,0.02,M.dark, 0,0.02,0.14));
  wh.add(B(0.03,0.5,0.03,M.yellow, -0.15,-0.45,0));   // 黄色燃气管
  for(let i=0;i<3;i++) wh.add(Cyl(0.025,0.025,0.06,i==1?M.red:M.blue, -0.08+i*0.08,-0.55,0));
  wh.add(B(0.02,0.35,0.02,M.steel, 0.15,-0.35,0));
  wh.position.set(2.05,1.80,5.38); k.add(reg(wh,'燃气热水器','白色恒温热水器，黄色燃气管+红蓝阀门，视频里很显眼。'));
  // 小吊灯
  const pl=new THREE.Group();
  pl.add(Cyl(0.008,0.008,0.45,M.black, 0,0.42,0));
  pl.add(Cyl(0.09,0.12,0.16,new THREE.MeshStandardMaterial({color:0xfff4dd,roughness:0.3,transparent:true,opacity:0.85}), 0,0.12,0));
  pl.add(new THREE.Mesh(new THREE.SphereGeometry(0.035,12,12), M.ledWarm));
  pl.children[2].position.y=0.1;
  pl.position.set(1.5,2.15,6.2); k.add(reg(pl,'厨房吊灯','暖光玻璃小吊灯，傍晚做饭的氛围担当。'));
  // 插座+小刷子
  k.add(B(0.15,0.09,0.02,M.white, 1.1,1.15,5.24));
  k.add(B(0.02,0.09,0.15,M.white, 0.26,1.15,6.6));
  const brush=new THREE.Group();
  brush.add(B(0.05,0.02,0.12,M.woodL,0,0.01,0)); brush.add(B(0.05,0.03,0.03,M.yellow,0,0.02,0.07));
  brush.position.set(2.2,0.92,5.55); brush.rotation.y=0.5; k.add(reg(brush,'小刷子','台面上的竹柄小刷子，细节拉满。'));
  roomLight(1.5,2.35,6.2,0xffd9a8,12,6);
  reg(k,'厨房','U 型橱柜：胡桃木地柜+白色吊柜，灶在南、水槽在西窗下、热水器在北。');
}

/* ============ 餐厅 ============ */
function chairWood(x,z,ry){
  const g=new THREE.Group();
  g.add(B(0.42,0.05,0.42,M.woodL, 0,0.45,0));
  for(const [sx,sz] of [[-0.18,-0.18],[0.18,-0.18],[-0.18,0.18],[0.18,0.18]])
    g.add(Cyl(0.02,0.025,0.45,M.woodD, sx,0.22,sz));
  for(const sx of [-0.14,0,0.14]) g.add(Cyl(0.015,0.015,0.5,M.woodL, sx,0.72,-0.19));
  g.add(B(0.4,0.09,0.04,M.woodL, 0,0.98,-0.19));
  g.position.set(x,0,z); g.rotation.y=ry;
  return reg(g,'实木餐椅','浅木色实木椅，视频里东侧那把。');
}
function chairBlack(x,z,ry){
  const g=new THREE.Group();
  g.add(B(0.42,0.05,0.4,M.black, 0,0.45,0));
  for(const [sx,sz] of [[-0.18,-0.18],[0.18,-0.18],[-0.18,0.18],[0.18,0.18]])
    g.add(Cyl(0.018,0.018,0.45,M.black, sx,0.22,sz));
  const bk=B(0.4,0.45,0.04,M.black, 0,0.72,-0.19); bk.rotation.x=0.08; g.add(bk);
  g.position.set(x,0,z); g.rotation.y=ry;
  return reg(g,'黑色餐椅','黑色简约餐椅，围着餐桌。');
}
{
  const d=new THREE.Group(); scene.add(d);
  // 餐桌
  const t=new THREE.Group();
  t.add(B(1.4,0.05,0.7,M.white, 0,0.73,0));
  for(const [sx,sz] of [[-0.62,-0.27],[0.62,-0.27],[-0.62,0.27],[0.62,0.27]])
    t.add(Cyl(0.025,0.018,0.71,M.dark, sx,0.355,sz));
  t.position.set(4.75,0,6.1); d.add(reg(t,'餐桌','白色岩板（实为白色）餐桌+深色锥形腿，1.4×0.7。'));
  d.add(chairWood(5.55,6.1,-Math.PI/2));
  d.add(chairBlack(3.95,6.1,Math.PI/2));
  d.add(chairBlack(4.75,5.62,0));
  d.add(chairBlack(4.75,6.58,Math.PI));
  // 波浪吊灯
  const pts=[new THREE.Vector3(4.15,2.12,6.1),new THREE.Vector3(4.45,2.12,5.92),
             new THREE.Vector3(4.8,2.12,6.28),new THREE.Vector3(5.15,2.12,5.92),
             new THREE.Vector3(5.45,2.12,6.1)];
  const curve=new THREE.CatmullRomCurve3(pts);
  const lamp=new THREE.Group();
  lamp.add(new THREE.Mesh(new THREE.TubeGeometry(curve,48,0.028,10), M.black));
  const strip=new THREE.Mesh(new THREE.TubeGeometry(curve,48,0.012,8), M.led);
  strip.position.y=-0.032; lamp.add(strip);
  for(const px of [4.3,5.3]) lamp.add(Cyl(0.006,0.006,0.68,M.black, px,2.46,6.1));
  d.add(reg(lamp,'波浪吊灯','餐厅的灵魂：波浪形线性吊灯，视频里最出片的一盏。'));
  roomLight(4.8,2.0,6.1,0xffe7c0,16,7);
  // 餐边柜组合（东墙）：下柜+开放格+上柜，一扇门开着
  const sb=new THREE.Group();
  sb.add(B(0.4,0.78,1.6,M.cabW, 0,0.39,0));
  sb.add(B(0.4,0.72,1.6,M.cabW, 0,1.74,0));
  sb.add(B(0.03,0.56,1.6,M.woodL, 0.185,1.06,0)); // 开放格背板
  sb.add(B(0.36,0.03,1.56,M.woodL, 0,1.06,0));    // 层板
  for(const hz of [-0.4,0.4]) sb.add(B(0.02,0.5,0.02,M.black, -0.19,0.45,hz));
  const openDoor=B(0.02,0.74,0.5,M.cabW, 0,0,0);
  openDoor.position.set(-0.35,0.39,-0.55); openDoor.rotation.y=-1.1; sb.add(openDoor);
  sb.add(B(0.02,0.5,0.02,M.black, -0.19,1.7,0.5)); // 上柜拉手
  // 台面小物：相机、卷尺、纸
  const cam=new THREE.Group();
  cam.add(B(0.13,0.09,0.07,M.white,0,0.045,0)); cam.add(Cyl(0.03,0.03,0.05,M.black,0,0.045,0.06,12)).children;
  cam.children[1].rotation.x=Math.PI/2;
  cam.position.set(-0.05,0.78,0.45); sb.add(cam);
  sb.add(B(0.07,0.03,0.07,M.yellow, -0.05,0.795,-0.1));
  sb.add(B(0.2,0.005,0.28,M.white, -0.05,0.785,-0.35));
  sb.position.set(5.23,0,6.2); d.add(reg(sb,'餐边柜','东墙餐边柜：下柜+开放格+上柜，一扇门没关严；台面上有相机、卷尺和纸。'));
  // 南墙矮柜（按图纸）
  d.add(reg(B(1.0,0.5,0.35,M.cabW, 4.7,0.25,7.02),'南墙矮柜','图纸上的餐边矮柜。'));
  // 桌面杂物
  const cl=new THREE.Group();
  cl.add(B(0.24,0.1,0.12,M.blue, -0.15,0.06,0.1));
  cl.add(B(0.2,0.015,0.15,M.pink, 0.15,0.012,-0.1));
  cl.add(B(0.16,0.02,0.03,M.yellow, -0.05,0.012,-0.18));
  const bx=new THREE.Group(); // 纸箱
  bx.add(B(0.4,0.28,0.3,M.card, 0,0.14,0));
  const f1=B(0.4,0.02,0.2,M.card,0,0.3,0.18); f1.rotation.x=0.7; bx.add(f1);
  const f2=B(0.4,0.02,0.2,M.card,0,0.3,-0.18); f2.rotation.x=-0.7; bx.add(f2);
  bx.add(B(0.05,0.3,0.05,M.woodD, 0.1,0.4,0));
  bx.position.set(0.35,0,0.05); bx.rotation.y=0.3; cl.add(bx);
  cl.position.set(4.75,0.755,6.1); d.add(reg(cl,'桌面杂物','纸巾盒、粉色抹布、美工刀和一只开着的纸箱——刚搬完家的样子。'));
  // 筒灯
  for(const sx of [4.2,4.75,5.3]){
    const sp=new THREE.Group();
    sp.add(Cyl(0.05,0.05,0.03,M.white,0,0,0));
    const em=new THREE.Mesh(new THREE.CircleGeometry(0.035,16), M.led); em.rotation.x=Math.PI/2; em.position.y=-0.016; sp.add(em);
    sp.position.set(sx,2.79,6.1); d.add(sp);
  }
  reg(d,'餐厅','进门右手边就是餐厅：餐桌、波浪吊灯、餐边柜，还堆着没拆完的箱子。');
}

/* ============ 玄关 ============ */
{
  const e=new THREE.Group(); scene.add(e);
  // 纸箱+泡沫板（视频结尾玄关处）
  const b1=B(0.5,0.4,0.4,M.card, 8.7,0.2,6.9); b1.rotation.y=0.2; e.add(b1);
  const b2=B(0.4,0.3,0.35,M.card, 8.65,0.55,6.85); b2.rotation.y=-0.15; e.add(b2);
  const foam=B(0.9,1.4,0.04,M.white, 8.95,0.7,6.2); foam.rotation.y=-0.25; foam.rotation.z=0.06; e.add(foam);
  const foam2=B(0.7,1.1,0.04,M.white, 9.05,0.55,6.35); foam2.rotation.y=-0.3; e.add(foam2);
  e.add(reg(b1,'玄关纸箱','还没拆完的纸箱和泡沫板，靠墙放着。'));
  roomLight(7.5,2.4,5.5,0xffe2b8,10,7);
  reg(e,'玄关','黑色入户门进来就是玄关，右手边通往客厅和卧室。');
}

/* ============ 卫生间 ============ */
{
  const b=new THREE.Group(); scene.add(b);
  // 花洒（北墙）
  const sh=new THREE.Group();
  sh.add(B(0.06,0.06,0.25,M.chrome, 0,1.9,0.12));
  sh.add(Cyl(0.015,0.015,0.7,M.chrome, 0,1.55,0.12));
  sh.add(Cyl(0.07,0.05,0.05,M.chrome, 0,1.15,0.16));
  sh.add(B(0.12,0.05,0.05,M.chrome, 0,1.0,0.05));
  sh.position.set(0.8,0,3.56); b.add(reg(sh,'花洒','铬色升降花洒，墙面单把手。'));
  // 马桶
  const wc=new THREE.Group();
  wc.add(B(0.4,0.4,0.6,M.white, 0,0.2,0));
  wc.add(B(0.42,0.06,0.62,M.white, 0,0.43,0));
  const lid=B(0.4,0.04,0.5,M.white, 0,0.62,-0.28); lid.rotation.x=-1.9; wc.add(lid);
  wc.add(B(0.15,0.35,0.12,M.white, 0,0.55,0.32)); // 水箱
  wc.position.set(1.8,0,4.45); b.add(reg(wc,'马桶','白色马桶，盖子掀着——正在通风散味。'));
  // 小桶+地漏
  b.add(Cyl(0.14,0.11,0.25,M.white, 1.15,0.125,4.5));
  b.add(Cyl(0.06,0.06,0.01,M.steel, 0.9,0.005,4.0));
  // 温控器（门边）
  const th=B(0.09,0.13,0.02,M.white, 3.09,1.4,4.95); b.add(reg(th,'地暖温控器','门边的白色地暖温控面板。'));
  // 泡沫滚
  const fr=Cyl(0.16,0.16,1.1,M.white, 2.55,0.55,4.55,18); b.add(reg(fr,'泡沫包装滚','装修剩的白色泡沫滚，竖在墙角。'));
  // 浴霸灯
  b.add(B(0.3,0.02,0.3,M.led, 1.6,2.79,4.25));
  roomLight(1.6,2.4,4.25,0xfff0d8,8,5);
  reg(b,'卫生间','干湿分区：马桶+花洒，磨砂小窗，刚装完还散着味。');
}

/* ============ 干区（家政） ============ */
{
  const g=new THREE.Group(); scene.add(g);
  // 洗手台+镜柜（北墙）
  g.add(B(0.8,0.55,0.5,M.white, 3.39,0.375,3.85));
  g.add(B(0.7,0.12,0.42,M.white, 3.39,0.71,3.85));   // 台盆
  g.add(Cyl(0.02,0.02,0.22,M.chrome, 3.39,0.85,3.68));
  g.add(B(0.16,0.03,0.03,M.chrome, 3.39,0.95,3.75));
  g.add(B(0.08,0.18,0.06,M.blue, 3.15,0.86,3.85));   // 洗手液
  const mc=new THREE.Group(); // 镜柜
  mc.add(B(0.8,0.7,0.12,M.cabW, 0,0,0));
  const mir=B(0.74,0.64,0.01,M.glass, 0,0,0.065); mir.castShadow=false; mc.add(mir);
  mc.add(B(0.02,0.6,0.02,M.led, -0.38,0,0.07));
  mc.add(B(0.02,0.6,0.02,M.led, 0.38,0,0.07));
  const tb=B(0.08,0.05,0.01,M.dark, 0,-0.28,0.07); mc.add(tb); // 触摸键
  mc.position.set(3.39,1.75,3.62); g.add(reg(mc,'镜柜','镜面柜门+两侧灯带，触摸键一按就亮，视频里演示过。'));
  // 洗衣机+烘干机叠放（黑色）
  const wm=new THREE.Group();
  wm.add(B(0.62,0.85,0.62,M.black, 0,0.425,0));
  const dw=B(0.62,0.72,0.62,M.black, 0,1.21,0); wm.add(dw);
  for(const dy of [0.45,1.21]){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(0.21,0.025,10,24), M.dark);
    ring.position.set(0.315,dy,0); ring.rotation.y=Math.PI/2; ring.castShadow=true; wm.add(ring);
    const gl=new THREE.Mesh(new THREE.CircleGeometry(0.2,24), M.glassD);
    gl.position.set(0.32,dy,0); gl.rotation.y=Math.PI/2; wm.add(gl);
  }
  wm.add(B(0.5,0.06,0.02,M.dark, 0.32,0.78,0.2));
  wm.position.set(4.2,0,4.55); wm.rotation.y=Math.PI; g.add(reg(wm,'洗烘叠放','黑色洗烘一体叠放，阳台（干区）标配。'));
  g.add(B(0.7,0.5,0.62,M.cabW, 4.2,1.85,4.55)); // 上方吊柜
  roomLight(3.4,2.3,4.2,0xfff0d8,7,5);
  reg(g,'干区','洗手台+镜柜+洗烘叠放，动线紧凑。');
}

/* ============ 书桌区 ============ */
function industrialFan(x,z,ry=0){
  const g=new THREE.Group();
  g.add(Cyl(0.25,0.3,0.05,M.black, 0,0.025,0));
  g.add(Cyl(0.03,0.03,1.1,M.black, 0,0.6,0));
  const head=new THREE.Group();
  head.add(new THREE.Mesh(new THREE.SphereGeometry(0.09,14,14), M.black));
  for(let i=0;i<3;i++){
    const bl=B(0.5,0.09,0.015,M.dark, 0.28,0,0);
    const holder=new THREE.Group(); holder.add(bl); holder.rotation.z=i*Math.PI*2/3; head.add(holder);
  }
  for(const r of [0.32,0.52]){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(r,0.012,8,32), M.steel);
    ring.castShadow=true; head.add(ring);
  }
  for(let i=0;i<8;i++){ const sp=B(0.008,1.0,0.008,M.steel,0,0,0); sp.rotation.z=i*Math.PI/8; head.add(sp); }
  head.position.set(0,1.25,0); head.rotation.x=-0.06;
  g.add(head);
  g.position.set(x,0,z); g.rotation.y=ry;
  return reg(g,'工业风扇','大个头工业落地扇，风力生猛，家里有两台。');
}
{
  const s=new THREE.Group(); scene.add(s);
  // 书桌（北墙窗下）
  s.add(B(1.5,0.05,0.6,M.white, 3.7,0.73,0.62));
  s.add(B(0.4,0.6,0.55,M.cabW, 4.25,0.4,0.62));   // 抽屉柜
  s.add(B(0.05,0.7,0.55,M.white, 3.0,0.36,0.62));
  // 笔记本
  const lap=new THREE.Group();
  lap.add(B(0.32,0.02,0.22,M.dark, 0,0.01,0));
  const scr=B(0.32,0.21,0.015,M.black, 0,0.11,-0.1); scr.rotation.x=-0.35; lap.add(scr);
  const scn=new THREE.Mesh(new THREE.PlaneGeometry(0.29,0.18),
    new THREE.MeshBasicMaterial({color:0x3d5a80})); scn.position.set(0,0.115,-0.092); scn.rotation.x=-0.35; lap.add(scn);
  lap.position.set(3.85,0.755,0.62); lap.rotation.y=0.15; s.add(reg(lap,'笔记本','屏幕还亮着，视频里她正刷手机。'));
  // 水瓶+手机+文具
  s.add(Cyl(0.035,0.035,0.2,M.white, 3.35,0.86,0.55));
  s.add(B(0.07,0.14,0.005,M.blue, 3.35,0.86,0.55));
  s.add(B(0.08,0.005,0.16,M.black, 3.55,0.76,0.7));
  s.add(B(0.2,0.06,0.12,M.white, 4.05,0.79,0.6));
  // 黑椅+搭着的衣服
  const ch=new THREE.Group();
  ch.add(B(0.45,0.05,0.45,M.black, 0,0.45,0));
  ch.add(B(0.45,0.5,0.05,M.black, 0,0.72,0.2));
  for(const [sx,sz] of [[-0.19,-0.19],[0.19,-0.19],[-0.19,0.19],[0.19,0.19]])
    ch.add(Cyl(0.02,0.02,0.45,M.black, sx,0.22,sz));
  const clo=B(0.4,0.12,0.3,M.pink, 0,0.55,0.1); clo.rotation.y=0.3; ch.add(clo);
  ch.position.set(3.7,0,1.25); ch.rotation.y=Math.PI; s.add(reg(ch,'椅子','黑色餐椅客串书桌椅，搭着件粉色衣服。'));
  s.add(industrialFan(3.1,1.9,0.6));
  roomLight(3.7,2.35,1.2,0xffe2b8,9,6);
  reg(s,'书桌区','北窗下的小书桌：笔记本、水杯、手机， industrial 风扇在旁边吹。');
}

/* ============ 次卧 ============ */
{
  const r=new THREE.Group(); scene.add(r);
  // 床（床头朝北）
  r.add(B(1.8,0.22,2.1,M.woodD, 1.5,0.2,1.55));
  r.add(B(1.8,0.95,0.08,M.woodD, 1.5,0.55,0.55));
  r.add(B(1.7,0.22,2.0,M.mattress, 1.5,0.42,1.55));
  r.add(reg(B(1.74,0.26,2.04,M.plastic, 1.5,0.42,1.55),'覆膜床垫','新床垫的塑料膜还没撕，透着光。'));
  // 蓝背包
  const pk=new THREE.Group();
  pk.add(B(0.38,0.24,0.26,M.blue, 0,0.12,0));
  pk.add(B(0.2,0.1,0.05,M.dark, 0,0.28,0));
  pk.position.set(1.35,0.55,1.45); pk.rotation.y=0.4; r.add(reg(pk,'蓝色背包','扔在床上的蓝色双肩包。'));
  // 神奈川冲浪里（靠在床头）
  const cv=document.createElement('canvas'); cv.width=128; cv.height=96;
  const cx2=cv.getContext('2d');
  cx2.fillStyle='#e8e4da'; cx2.fillRect(0,0,128,96);
  cx2.strokeStyle='#1d3f8f'; cx2.lineWidth=5;
  cx2.beginPath(); cx2.arc(64,110,52,Math.PI,0); cx2.stroke();
  cx2.beginPath(); cx2.arc(40,96,20,Math.PI,0); cx2.stroke();
  cx2.fillStyle='#1d3f8f'; cx2.beginPath(); cx2.arc(96,26,11,0,7); cx2.fill();
  cx2.fillStyle='#b03a2e'; cx2.beginPath(); cx2.arc(96,26,7,0,7); cx2.fill();
  const wave=new THREE.Mesh(new THREE.PlaneGeometry(0.62,0.46),
    new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(cv),roughness:0.8}));
  wave.position.set(1.95,0.78,0.66); wave.rotation.x=-0.12; wave.castShadow=true; r.add(wave);
  r.add(B(0.66,0.5,0.02,M.woodD, 1.95,0.77,0.63));
  reg(wave,'神奈川冲浪里','靠在床头的《神奈川冲浪里》装饰画。');
  // 衣柜（南墙）
  const wd=new THREE.Group();
  wd.add(B(2.2,2.2,0.6,M.cabW, 0,1.1,0));
  for(const hx of [-0.75,-0.25,0.25,0.75]) wd.add(B(0.025,0.5,0.03,M.black, hx,1.15,0.31));
  wd.position.set(1.5,0,3.06); r.add(reg(wd,'衣柜','南墙整排白衣柜，黑色长拉手。'));
  // 床头小柜
  r.add(B(0.45,0.5,0.4,M.cabW, 2.62,0.25,0.75));
  // 吸顶灯
  r.add(Cyl(0.22,0.22,0.05,M.white, 1.5,2.77,1.8));
  r.add(new THREE.Mesh(new THREE.CircleGeometry(0.18,20), M.led)).children;
  r.children[r.children.length-1].position.set(1.5,2.74,1.8);
  r.children[r.children.length-1].rotation.x=Math.PI/2;
  roomLight(1.5,2.4,1.8,0xfff0d8,9,6);
  reg(r,'次卧','1.8 米大床+整排衣柜，西窗带防盗网，黑框推拉门通书桌区。');
}

/* ============ 客厅 ============ */
{
  const l=new THREE.Group(); scene.add(l);
  // 沙发（北墙）
  const sf=new THREE.Group();
  sf.add(B(1.8,0.32,0.8,M.fabric, 0,0.3,0));
  sf.add(B(1.8,0.55,0.22,M.fabric, 0,0.6,-0.32));
  for(const sx of [-0.85,0.85]) sf.add(B(0.22,0.55,0.8,M.fabric, sx,0.42,0));
  for(const sx of [-0.44,0.44]){ const c=B(0.8,0.14,0.68,M.fabricD, sx,0.52,0.03); c.rotation.z=sx>0?-0.03:0.03; sf.add(c); }
  sf.add(B(0.5,0.35,0.12,M.pink, -0.44,0.72,-0.25));
  sf.position.set(6.0,0,0.85); l.add(reg(sf,'沙发','浅灰色双人沙发，窝着看电视正好。'));
  // 边几
  const st=new THREE.Group();
  st.add(Cyl(0.26,0.26,0.03,M.white, 0,0.45,0));
  for(let i=0;i<3;i++){ const a=i*Math.PI*2/3; st.add(Cyl(0.02,0.02,0.45,M.woodL, Math.cos(a)*0.18,0.22,Math.sin(a)*0.18)); }
  st.position.set(4.95,0,1.7); l.add(reg(st,'小边几','白色小圆几，沙发搭档。'));
  l.add(industrialFan(5.35,2.35,-0.5));
  // 电视墙（南墙）：深色面板+圆孔+白抽屉
  const tv=new THREE.Group();
  tv.add(B(2.3,1.35,0.07,M.tvWall, 0,1.55,0));
  const hole=new THREE.Mesh(new THREE.CircleGeometry(0.07,20), M.black);
  hole.position.set(0,1.55,0.04); tv.add(hole);
  tv.add(B(2.3,0.34,0.42,M.cabW, 0,0.17,-0.1));
  for(let i=0;i<4;i++) tv.add(B(0.02,0.06,0.02,M.black, -0.8+i*0.53,0.2,0.12));
  tv.position.set(6.3,0,3.36); l.add(reg(tv,'电视墙','深色电视背景板，中间圆孔是挂架走线位，下面一排白抽屉。'));
  // 黑色半球吊灯（主卧门口）
  const dp=new THREE.Group();
  dp.add(Cyl(0.008,0.008,0.5,M.black, 0,0.45,0));
  const dome=new THREE.Mesh(new THREE.SphereGeometry(0.14,18,12,0,Math.PI*2,0,Math.PI/2), M.black);
  dome.position.y=0.2; dome.rotation.x=Math.PI; dome.castShadow=true; dp.add(dome);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.04,12,12), M.ledWarm); bulb.position.y=0.14; dp.add(bulb);
  dp.position.set(7.0,2.05,1.95); l.add(reg(dp,'半球吊灯','主卧门口的黑色半球吊灯。'));
  for(const sx of [5.3,6.0,6.7]){
    const sp=new THREE.Group();
    sp.add(Cyl(0.05,0.05,0.03,M.white,0,0,0));
    const em=new THREE.Mesh(new THREE.CircleGeometry(0.035,16), M.led); em.rotation.x=Math.PI/2; em.position.y=-0.016; sp.add(em);
    sp.position.set(sx,2.79,1.8); l.add(sp);
  }
  roomLight(6.1,2.3,1.8,0xffe2b8,12,7);
  reg(l,'客厅','沙发对电视墙，工业风扇+小边几，推拉门通主卧。');
}

/* ============ 主卧 ============ */
{
  const m=new THREE.Group(); scene.add(m);
  // 床（床头朝北）
  m.add(B(1.8,0.22,2.1,M.woodD, 8.98,0.2,1.45));
  m.add(B(1.8,0.95,0.08,M.woodD, 8.98,0.55,0.45));
  m.add(B(1.7,0.22,2.0,M.mattress, 8.98,0.42,1.45));
  m.add(reg(B(1.74,0.26,2.04,M.plastic, 8.98,0.42,1.45),'覆膜床垫','主卧床垫的膜也还没撕。'));
  // 床头柜
  m.add(reg(B(0.45,0.5,0.4,M.cabW, 7.85,0.25,0.7),'床头柜','白色床头柜。'));
  // 衣柜（南墙）
  const wd=new THREE.Group();
  wd.add(B(2.6,2.2,0.6,M.cabW, 0,1.1,0));
  for(const hx of [-0.95,-0.45,0.05,0.55]) wd.add(B(0.025,0.55,0.03,M.black, hx,1.15,0.31));
  wd.position.set(9.0,0,3.06); m.add(reg(wd,'主卧衣柜','南墙大衣柜，2.6 米宽。'));
  // 开放格（东窗旁）
  const sh=new THREE.Group();
  sh.add(B(0.35,2.0,0.8,M.woodL, 0,1.0,0));
  for(let i=0;i<4;i++) sh.add(B(0.3,0.03,0.74,M.cabW, 0,0.4+i*0.45,0));
  sh.add(B(0.12,0.1,0.2,M.white, 0,0.5,0.1));
  sh.add(B(0.2,0.14,0.15,M.card, 0,0.95,-0.1));
  sh.position.set(10.2,0,2.7); m.add(reg(sh,'开放格','窗边的原木开放格，放些杂物。'));
  // 东墙书桌（窗下）
  const dk=new THREE.Group();
  dk.add(B(0.55,0.05,1.05,M.white, 0,0.73,0));
  dk.add(B(0.5,0.68,0.05,M.white, -0.2,0.36,-0.45));
  dk.add(B(0.5,0.68,0.05,M.white, -0.2,0.36,0.45));
  const st2=new THREE.Group();
  st2.add(B(0.42,0.05,0.42,M.black, 0,0.45,0));
  st2.add(B(0.42,0.45,0.05,M.black, 0,0.7,0.19));
  st2.position.set(-0.55,0,0.1); st2.rotation.y=Math.PI/2+0.2; dk.add(st2);
  dk.add(Cyl(0.16,0.16,0.06,M.fabricD, -0.55,0.03,0.65)); // 圆凳
  dk.position.set(10.14,0,1.55); m.add(reg(dk,'窗下书桌','东窗下的小书桌+黑椅+圆凳，图纸上 1050 宽。'));
  // 绿十字小吊灯（视频里那盏旧灯）
  const gl=new THREE.Group();
  gl.add(Cyl(0.006,0.006,0.4,M.black, 0,0.35,0));
  const shade=new THREE.Mesh(new THREE.SphereGeometry(0.13,16,12), new THREE.MeshStandardMaterial({color:0xf5f0e0,roughness:0.4,transparent:true,opacity:0.9}));
  shade.position.y=0.12; shade.castShadow=true; gl.add(shade);
  const cr1=B(0.1,0.02,0.005,M.green, 0,0.12,0.125); gl.add(cr1);
  const cr2=B(0.02,0.1,0.005,M.green, 0,0.12,0.125); gl.add(cr2);
  const bulb2=new THREE.Mesh(new THREE.SphereGeometry(0.03,10,10), M.ledWarm); bulb2.position.y=0.08; gl.add(bulb2);
  gl.position.set(9.9,2.15,2.2); m.add(reg(gl,'绿十字吊灯','主卧这盏带绿十字的旧玻璃吊灯，房东留下的。'));
  // 吸顶灯
  m.add(Cyl(0.22,0.22,0.05,M.white, 8.9,2.77,1.6));
  roomLight(9.0,2.35,1.7,0xfff0d8,11,7);
  reg(m,'主卧','1.8 米大床+南墙衣柜+东窗书桌，窗外是裙楼屋顶。');
}

/* ============ 房名标签 ============ */
roomLabel('餐厅',4.75,6.15); roomLabel('厨房',1.5,6.2); roomLabel('卫生间',1.6,4.25);
roomLabel('书桌区',3.75,1.2); roomLabel('次卧',1.5,1.8);
roomLabel('客厅',6.0,1.8); roomLabel('主卧',9.0,1.7); roomLabel('玄关',7.5,5.6);

/* ============ 视角 ============ */
const VIEWS=[
  ['鸟瞰',[9.5,8.2,11.5],[5.3,0.4,3.6]],
  ['餐厅',[4.25,1.8,6.85],[5.1,0.7,5.9]],
  ['厨房',[0.7,1.7,6.85],[2.1,0.6,5.8]],
  ['卫生间',[3.15,1.5,4.85],[4.4,0.7,3.7]],
  ['书房',[3.8,1.8,3.0],[3.8,0.7,1.0]],
  ['次卧',[1.6,1.9,3.0],[1.5,0.6,1.2]],
  ['客厅',[6.3,1.6,3.0],[5.8,0.6,0.7]],
  ['主卧',[9.2,2.0,3.0],[8.3,0.7,1.3]],
];
let camTween=null;
function flyTo(p,t){
  camTween={p0:camera.position.clone(),t0:controls.target.clone(),
            p1:new THREE.Vector3(...p),t1:new THREE.Vector3(...t),k:0};
}
const viewsEl=document.getElementById('views');
VIEWS.forEach(([n,p,t],i)=>{
  const b=document.createElement('button'); b.textContent=n; if(i===0)b.classList.add('on');
  b.onclick=()=>{ viewsEl.querySelectorAll('button').forEach(x=>x.classList.remove('on')); b.classList.add('on'); flyTo(p,t); };
  viewsEl.appendChild(b);
});

/* ============ 开关 ============ */
const tgCeil=document.getElementById('tgCeil'), tgLabel=document.getElementById('tgLabel'),
      tgDay=document.getElementById('tgDay'), tgRot=document.getElementById('tgRot');
tgCeil.onclick=()=>{ ceilGroup.visible=!ceilGroup.visible; tgCeil.classList.toggle('on',ceilGroup.visible); };
tgLabel.onclick=()=>{ labelGroup.visible=!labelGroup.visible; tgLabel.classList.toggle('on',labelGroup.visible); };
tgRot.onclick=()=>{ controls.autoRotate=!controls.autoRotate; controls.autoRotateSpeed=0.8; tgRot.classList.toggle('on',controls.autoRotate); };
let isDay=false;
tgDay.onclick=()=>{
  isDay=!isDay; tgDay.classList.toggle('on',isDay); tgDay.textContent=isDay?'傍晚':'白天';
  if(isDay){
    scene.background.set(0x8fb4dd); scene.fog.color.set(0x8fb4dd);
    hemi.intensity=1.0; sun.intensity=1.7; sun.color.set(0xfff1d6);
    roomLights.forEach(l=>l.intensity=0); warm.intensity=0.9;
    renderer.toneMappingExposure=1.0;
  }else{
    scene.background.set(0x0e1116); scene.fog.color.set(0x0e1116);
    hemi.intensity=0.55; sun.intensity=0.5; sun.color.set(0x8fb0e8);
    roomLights.forEach((l,i)=>l.intensity=[12,16,10,8,7,9,9,12,11][i]||10); warm.intensity=0;
    renderer.toneMappingExposure=1.12;
  }
};

/* ============ 点击介绍 ============ */
const ray=new THREE.Raycaster(), ptr=new THREE.Vector2();
const info=document.getElementById('info'), infoT=document.getElementById('infoT'), infoD=document.getElementById('infoD');
document.getElementById('infoX').onclick=()=>info.classList.remove('show');
let downX=0,downY=0;
renderer.domElement.addEventListener('pointerdown',e=>{downX=e.clientX;downY=e.clientY;});
renderer.domElement.addEventListener('pointerup',e=>{
  if(Math.hypot(e.clientX-downX,e.clientY-downY)>6) return;
  ptr.x=(e.clientX/innerWidth)*2-1; ptr.y=-(e.clientY/innerHeight)*2+1;
  ray.setFromCamera(ptr,camera);
  const hits=ray.intersectObjects(PARTS,false);
  if(hits.length){
    const p=hits[0].object.userData.part;
    if(p){ infoT.textContent=p.name; infoD.textContent=p.desc; info.classList.add('show'); }
  } else info.classList.remove('show');
});

/* ============ 主循环 ============ */
addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),0.05);
  if(camTween){
    camTween.k=Math.min(1,camTween.k+dt*1.6);
    const e=1-Math.pow(1-camTween.k,3);
    camera.position.lerpVectors(camTween.p0,camTween.p1,e);
    controls.target.lerpVectors(camTween.t0,camTween.t1,e);
    if(camTween.k>=1)camTween=null;
  }
  controls.update();
  renderer.render(scene,camera);
}
animate();
/* QA 参数：?view=餐厅 &instant=1 直接定位 */
try{
  const qp=new URLSearchParams(location.search), qv=qp.get('view');
  if(qv){ const v=VIEWS.find(x=>x[0]===qv);
    if(v) setTimeout(()=>{
      if(qp.get('instant')){ camera.position.set(v[1][0],v[1][1],v[1][2]); controls.target.set(v[2][0],v[2][1],v[2][2]); }
      else flyTo(v[1],v[2]);
    },800); }
}catch(e){}
document.getElementById('loading').style.opacity=0;
setTimeout(()=>document.getElementById('loading').remove(),700);
