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
camera.position.set(3.67, 9.5, 13.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(3.67, 0, 5.3);
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
floorRect(0.24,2.12,0.24,2.73,M.floorT);   // 厨房
floorRect(2.30,3.74,0.24,2.73,M.bathT);   // 卫生间
floorRect(4.02,7.10,0.24,2.96,M.floorW);  // 次卧
floorRect(0.24,2.80,3.59,4.96,M.floorW); // 餐厅
floorRect(5.20,7.10,3.02,4.40,M.floorW);  // 书房
floorRect(4.02,7.10,4.40,7.60,M.floorW);  // 客厅
floorRect(4.02,7.10,7.60,9.60,M.floorW);  // 主卧
floorRect(4.02,7.10,9.60,10.415,M.floorT); // 阳台
floorRect(0.24,4.02,2.73,3.59,M.floorW); // 北过厅
floorRect(2.80,4.02,3.59,7.60,M.floorW);  // 中过厅

/* --- 外墙（L形） --- */
shell.add(wallX(0,7.34,0.12,T,HH,0,[ // 北墙
  {a0:0.5,a1:1.5,y0:1.0,y1:2.2},{a0:2.6,a1:3.4,y0:1.2,y1:2.0},{a0:5.0,a1:6.5,y0:1.0,y1:2.2}],M.wall));
shell.add(wallZ(0,10.655,7.22,T,HH,0,[ // 东墙
  {a0:0.8,a1:2.2,y0:1.0,y1:2.2},{a0:3.3,a1:4.1,y0:1.0,y1:2.2},{a0:5.0,a1:6.8,y0:1.0,y1:2.2},{a0:8.0,a1:9.2,y0:1.0,y1:2.2}],M.wall));
shell.add(wallX(3.86,7.34,10.535,T,HH,0,[{a0:4.5,a1:6.5,y0:0.8,y1:2.2}],M.wall)); // 南墙（阳台）
shell.add(wallZ(0,5.24,0.12,T,HH,0,[ // 西墙北段
  {a0:0.6,a1:1.8,y0:1.0,y1:2.2},{a0:3.8,a1:4.7,y0:1.0,y1:2.2}],M.wall));
shell.add(wallZ(5.24,10.655,3.86,T,HH,0,[],M.wall)); // 西墙南段（缺口台阶）
shell.add(wallX(0,3.86,5.24,T,HH,0,[],M.wall));     // 缺口北墙
/* 外窗安装 */
function putWin(w,h,x,y,z,ry,opts){ const wn=makeWindow(w,h,opts); wn.position.set(x,y,z); wn.rotation.y=ry; shell.add(wn); return wn; }
putWin(1.0,1.2, 1.0,1.6,0.12, 0, {name:'厨房窗',desc:'北墙窗，水槽上方。'});
putWin(0.8,0.8, 3.0,1.6,0.12, 0, {name:'卫生间窗',desc:'磨砂小窗。',frosted:true});
putWin(1.5,1.2, 5.75,1.6,0.12, 0, {name:'次卧窗',desc:'北墙大窗。'});
putWin(1.4,1.2, 7.22,1.6,1.5, -Math.PI/2, {name:'次卧东窗',desc:'东墙窗。'});
putWin(0.9,1.2, 0.12,1.6,4.27, Math.PI/2, {name:'餐厅窗',desc:'西墙窗，餐桌旁。'});
putWin(0.8,1.2, 7.22,1.6,3.7, -Math.PI/2, {name:'书房窗',desc:'东墙窗，书桌旁。'});
putWin(1.8,1.2, 7.22,1.6,5.9, -Math.PI/2, {name:'客厅东窗',desc:'东墙大窗。'});
putWin(1.2,1.2, 7.22,1.6,8.6, -Math.PI/2, {name:'主卧窗',desc:'东墙窗。'});
putWin(2.0,1.4, 5.5,1.5,10.535, Math.PI, {name:'阳台窗',desc:'南墙大窗。'});

/* --- 内墙 --- */
const IW=M.wallIn;
// 厨房东墙（门洞）
shell.add(wallZ(0.24,2.73,2.21,T2,HH,0,[{a0:1.2,a1:2.0,y0:0,y1:2.1}],IW));
{ const d=slideDoor(0.8,2.1,0.4,'厨房推拉门','厨房东墙推拉门。'); d.position.set(2.21,0,1.6); d.rotation.y=Math.PI/2; shell.add(d); }
// 卫生间东墙
shell.add(wallZ(0.24,2.73,3.88,T2,HH,0,[],IW));
// 厨房南墙（门洞）
shell.add(wallX(0.24,2.21,2.79,T2,HH,0,[{a0:0.8,a1:1.6,y0:0,y1:2.1}],IW));
// 卫生间南墙（门洞）
shell.add(wallX(2.21,3.88,2.79,T2,HH,0,[{a0:2.8,a1:3.5,y0:0,y1:2.1}],IW));
// 次卧南墙（门洞）
shell.add(wallX(3.88,7.22,3.02,T2,HH,0,[{a0:5.5,a1:6.4,y0:0,y1:2.1}],IW));
// 餐厅东墙（开敞，用半墙）
shell.add(wallZ(3.59,4.96,2.86,T2,1.1,0,[],IW)); // 半高隔断
// 餐厅南墙
shell.add(wallX(0.24,2.86,5.02,T2,HH,0,[],IW));
// 书房南墙 / 客厅北墙
shell.add(wallX(5.20,7.22,4.46,T2,HH,0,[],IW));
// 客厅西墙（电视墙）
shell.add(wallZ(4.46,7.60,3.96,T2,HH,0,[],IW));
// 客厅南墙 / 主卧北墙（门洞）
shell.add(wallX(3.96,7.22,7.66,T2,HH,0,[{a0:5.0,a1:5.9,y0:0,y1:2.1}],IW));
// 主卧南墙 / 阳台北墙（推拉门）
shell.add(wallX(4.02,7.22,9.66,T2,HH,0,[{a0:5.0,a1:6.4,y0:0,y1:2.1}],IW));
{ const d=slideDoor(1.4,2.1,0.7,'阳台推拉门','主卧通阳台的推拉门。'); d.position.set(5.7,0,9.66); shell.add(d); }
// 过厅西墙（餐厅与过厅之间，开大洞口）
shell.add(wallZ(2.73,3.59,2.86,T2,HH,0,[{a0:2.9,a1:3.5,y0:0,y1:2.1}],IW));
/* 天花板（可隐藏，L形） */
{
  const c1=B(7.34,0.1,5.24,M.ceil,7.34/2,HH+0.05,2.62);
  const c2=B(3.48,0.1,5.415,M.ceil,3.86+3.48/2,HH+0.05,5.24+5.415/2);
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

/* ============ 厨房（北） ============ */
{
  const k = new THREE.Group(); scene.add(k);
  // 地柜：北（水槽） 西（灶）
  k.add(B(1.7,0.82,0.6,M.woodD, 1.15,0.45,0.54));   // 北地柜
  k.add(B(0.6,0.82,1.9,M.woodD, 0.54,0.45,1.45));    // 西地柜
  // 台面
  k.add(B(1.74,0.04,0.64,M.counter, 1.15,0.88,0.54));
  k.add(B(0.64,0.04,1.94,M.counter, 0.54,0.88,1.45));
  // 吊柜 + 灯带（北）
  k.add(B(1.5,0.70,0.35,M.cabW, 1.15,1.95,0.42));
  k.add(B(1.45,0.02,0.30,M.led, 1.15,1.59,0.42));
  // 墙砖（北）
  k.add(B(1.9,0.65,0.02,M.tile, 1.15,1.25,0.25));
  // 双槽水槽+龙头（北墙窗下）
  const sink=new THREE.Group();
  sink.add(B(0.62,0.12,0.42,M.steel, 0,0,0));
  sink.add(B(0.56,0.02,0.36,M.dark, 0,0.05,0));
  sink.add(B(0.02,0.06,0.36,M.steel, 0,0.05,0)); // 中隔
  const fa=new THREE.Group();
  fa.add(Cyl(0.022,0.022,0.34,M.chrome, 0,0.17,0));
  fa.add(B(0.035,0.035,0.26,M.chrome, 0,0.33,0.12));
  fa.add(Cyl(0.014,0.014,0.09,M.chrome, 0,0.28,0.24));
  fa.position.set(0,0.02,-0.12); sink.add(fa);
  sink.position.set(1.0,0.82,0.54); k.add(reg(sink,'双槽水槽','北墙窗下双槽不锈钢水槽，鹅颈龙头。'));
  // 灶+锅（西）
  const stove=new THREE.Group();
  stove.add(B(0.46,0.025,0.72,M.black, 0,0,0));
  for(const sz of [-0.18,0.18]){
    stove.add(Cyl(0.09,0.09,0.02,M.dark, 0,0.02,sz));
    stove.add(Cyl(0.05,0.05,0.03,M.black, 0,0.035,sz));
  }
  const pot=new THREE.Group();
  pot.add(Cyl(0.11,0.10,0.12,M.steel, 0,0.09,0)); pot.add(Cyl(0.115,0.115,0.02,M.dark, 0,0.16,0));
  pot.position.set(0,0.04,-0.18); stove.add(pot);
  stove.position.set(0.54,0.905,1.3); k.add(reg(stove,'燃气灶','西墙双眼玻璃灶，左边坐着一口锅。'));
  // 油烟机（西）
  const hood=new THREE.Group();
  const panel=B(0.5,0.03,0.72,M.black, 0,0,0); panel.rotation.z=0.45; panel.position.set(0.42,1.78,1.3); hood.add(panel);
  hood.add(B(0.3,0.6,0.4,M.steel, 0.35,2.2,1.3));
  k.add(reg(hood,'油烟机','侧吸式黑玻璃油烟机。'));
  // 双门冰箱（南）
  const fr=new THREE.Group();
  fr.add(B(0.9,1.9,0.7,M.steel, 0,0.95,0));
  fr.add(B(0.02,1.7,0.02,M.dark, 0,0.95,0.36));
  fr.add(B(0.04,0.3,0.04,M.chrome, -0.08,1.1,0.37)); fr.add(B(0.04,0.3,0.04,M.chrome, 0.08,1.1,0.37));
  fr.position.set(1.2,0,2.35); k.add(reg(fr,'双门冰箱','南墙双开门冰箱。'));
  // 燃气热水器+燃气管
  const wh=new THREE.Group();
  wh.add(B(0.55,0.45,0.26,M.white, 0,0,0));
  wh.add(Cyl(0.09,0.09,0.02,M.dark, 0,0.02,0.14));
  wh.add(B(0.03,0.5,0.03,M.yellow, -0.15,-0.45,0));
  for(let i=0;i<3;i++) wh.add(Cyl(0.025,0.025,0.06,i==1?M.red:M.blue, -0.08+i*0.08,-0.55,0));
  wh.position.set(1.85,1.80,0.38); k.add(reg(wh,'燃气热水器','白色恒温热水器，黄色燃气管。'));
  // 吊灯
  const pl=new THREE.Group();
  pl.add(Cyl(0.008,0.008,0.45,M.black, 0,0.42,0));
  pl.add(Cyl(0.09,0.12,0.16,new THREE.MeshStandardMaterial({color:0xfff4dd,roughness:0.3,transparent:true,opacity:0.85}), 0,0.12,0));
  pl.add(new THREE.Mesh(new THREE.SphereGeometry(0.035,12,12), M.ledWarm));
  pl.children[2].position.y=0.1;
  pl.position.set(1.18,2.15,1.5); k.add(reg(pl,'厨房吊灯','暖光小吊灯。'));
  roomLight(1.18,2.35,1.5,0xffd9a8,12,6);
  reg(k,'厨房','北：双槽水槽+吊柜；西：燃气灶+油烟机；南：双门冰箱。');
}

/* ============ 餐厅（西） ============ */
{
  const d=new THREE.Group(); scene.add(d);
  // 餐桌 1400x700（南北向）
  const tb=new THREE.Group();
  tb.add(B(0.7,0.05,1.4,M.woodL, 0,0.73,0));
  for(const sx of [-0.28,0.28]) for(const sz of [-0.6,0.6]) tb.add(B(0.06,0.73,0.06,M.woodD, sx,0.365,sz));
  tb.position.set(1.5,0,4.27); d.add(reg(tb,'餐桌','1400×700 实木餐桌。'));
  // 4把餐椅（东西各2）
  for(const [cx,cz,ry] of [[1.0,3.85,Math.PI/2],[1.0,4.69,Math.PI/2],[2.0,3.85,-Math.PI/2],[2.0,4.69,-Math.PI/2]]){
    const ch=new THREE.Group();
    ch.add(B(0.42,0.05,0.42,M.fabric, 0,0.45,0));
    ch.add(B(0.42,0.5,0.05,M.fabric, 0,0.72,-0.185));
    for(const sx of [-0.17,0.17]) for(const sz of [-0.17,0.17]) ch.add(B(0.04,0.45,0.04,M.woodD, sx,0.225,sz));
    ch.position.set(cx,0,cz); ch.rotation.y=ry; d.add(ch);
  }
  d.add(reg(d.children[1],'餐椅','四把布艺餐椅。'));
  // 餐边柜（西墙，350深）
  const sb=new THREE.Group();
  sb.add(B(0.35,0.9,1.6,M.woodD, 0,0.45,0));
  sb.add(B(0.33,0.04,1.56,M.counter, 0,0.92,0));
  for(let i=0;i<3;i++) sb.add(B(0.02,0.7,0.5,M.dark, 0.18,0.45,-0.5+i*0.53));
  sb.position.set(0.42,0,4.27); d.add(reg(sb,'餐边柜','西墙餐边柜，350深。'));
  // 波浪吊灯
  const wl=new THREE.Group();
  wl.add(Cyl(0.01,0.01,0.5,M.black, 0,2.55,0));
  for(let i=0;i<5;i++){
    const wv=new THREE.Mesh(new THREE.TorusGeometry(0.09,0.015,8,20,Math.PI*1.2), M.ledWarm);
    wv.position.set(-0.18+i*0.09,2.28,0); wv.rotation.z=Math.PI/2.3; wl.add(wv);
  }
  wl.position.set(1.5,0,4.27); d.add(reg(wl,'波浪吊灯','餐桌上方波浪形吊灯。'));
  roomLight(1.5,2.3,4.27,0xffe0b0,12,6);
  reg(d,'餐厅','1400餐桌+4椅，西墙餐边柜。');
}

/* ============ 入户门（西墙） ============ */
{
  const g=new THREE.Group();
  g.add(B(0.08,2.1,1.0,M.black,0,1.05,0));
  g.add(B(0.02,1.96,0.86,M.dark,0.05,1.0,0));
  g.add(B(0.04,0.03,0.16,M.steel,0.08,1.02,0.32));
  g.position.set(0.12,0,3.1); scene.add(reg(g,'入户门','西墙入户防盗门。'));
}

/* ============ 卫生间（北） ============ */
{
  const b=new THREE.Group(); scene.add(b);
  // 马桶（北）
  const wc=new THREE.Group();
  wc.add(B(0.4,0.38,0.6,M.white, 0,0.19,0));
  wc.add(B(0.42,0.08,0.18,M.white, 0,0.45,-0.22));
  wc.add(B(0.36,0.04,0.5,M.white, 0,0.40,0.02));
  wc.position.set(3.0,0,0.7); b.add(reg(wc,'马桶','北墙马桶。'));
  // 花洒（西墙）
  const sh=new THREE.Group();
  sh.add(Cyl(0.02,0.02,1.9,M.chrome, 0,0.95,0));
  sh.add(B(0.2,0.03,0.2,M.chrome, 0.1,1.95,0));
  sh.position.set(2.35,0,1.2); b.add(reg(sh,'花洒','西墙花洒。'));
  // 干区：圆台盆+镜柜（南）
  const vn=new THREE.Group();
  vn.add(Cyl(0.28,0.24,0.55,M.white, 0,0.275,0));
  vn.add(Cyl(0.26,0.26,0.1,M.white, 0,0.6,0));
  vn.add(Cyl(0.02,0.02,0.2,M.chrome, 0,0.75,0));
  vn.position.set(2.7,0,2.3); b.add(reg(vn,'台盆','干区圆台盆。'));
  const mc=new THREE.Group();
  mc.add(B(0.6,0.7,0.1,M.cabW, 0,0,0));
  const mir=B(0.54,0.64,0.01,M.glass, 0,0,0.055); mir.castShadow=false; mc.add(mir);
  mc.position.set(2.7,1.7,2.68); b.add(reg(mc,'镜柜','镜面柜。'));
  // 洗衣机（东南角）
  const wm=new THREE.Group();
  wm.add(B(0.6,0.85,0.6,M.white, 0,0.425,0));
  const dr=new THREE.Mesh(new THREE.TorusGeometry(0.2,0.025,10,24), M.dark);
  dr.position.set(0,0.45,0.31); wm.add(dr);
  const gl=new THREE.Mesh(new THREE.CircleGeometry(0.19,24), M.glassD);
  gl.position.set(0,0.45,0.315); wm.add(gl);
  wm.position.set(3.35,0,2.35); b.add(reg(wm,'洗衣机','干区洗衣机。'));
  roomLight(3.0,2.3,1.5,0xfff0d8,10,5);
  reg(b,'卫生间','北马桶+花洒，南干区台盆+洗衣机。');
}

/* ============ 书房（东北） ============ */
{
  const s=new THREE.Group(); scene.add(s);
  // 书桌 1910x550（东墙）
  s.add(B(0.55,0.05,1.91,M.white, 6.82,0.73,3.71));
  for(const sz of [2.85,4.57]) { s.add(B(0.5,0.7,0.06,M.cabW, 6.82,0.35,sz)); }
  // 两把椅子
  for(const cz of [3.35,4.07]){
    const ch=new THREE.Group();
    ch.add(B(0.42,0.05,0.42,M.fabric, 0,0.45,0));
    ch.add(B(0.42,0.5,0.05,M.fabric, 0,0.72,0.185));
    for(const sx of [-0.17,0.17]) for(const sz of [-0.17,0.17]) ch.add(B(0.04,0.45,0.04,M.woodD, sx,0.225,sz));
    ch.position.set(6.3,0,cz); ch.rotation.y=-Math.PI/2; s.add(ch);
  }
  s.add(reg(s.children[3],'书房椅','两把椅子，对墙坐。'));
  // 笔记本+台灯
  const nb=new THREE.Group();
  nb.add(B(0.32,0.02,0.22,M.dark, 0,0.01,0));
  const scr=B(0.32,0.2,0.015,M.black, 0,0.1,-0.1); scr.rotation.x=-0.25; nb.add(scr);
  const sc2=B(0.3,0.18,0.005,new THREE.MeshStandardMaterial({color:0x88aaff,roughness:0.2,emissive:0x223355}), 0,0.1,-0.093); sc2.rotation.x=-0.25; nb.add(sc2);
  nb.position.set(6.82,0.76,3.5); nb.rotation.y=-Math.PI/2; s.add(reg(nb,'笔记本','书桌上的笔记本。'));
  const lamp=new THREE.Group();
  lamp.add(Cyl(0.09,0.11,0.03,M.black, 0,0.015,0));
  lamp.add(Cyl(0.015,0.015,0.35,M.black, 0,0.2,0));
  lamp.add(B(0.2,0.08,0.12,M.black, 0.05,0.38,0));
  lamp.position.set(6.82,0.76,4.1); s.add(reg(lamp,'台灯','黑色台灯。'));
  roomLight(6.2,2.3,3.7,0xfff0d8,10,5);
  reg(s,'书房','1910长桌靠东墙，两把椅子。');
}

/* ============ 次卧（东北） ============ */
{
  const b2=new THREE.Group(); scene.add(b2);
  // 床 2100x1500，床头在东
  const bed=new THREE.Group();
  bed.add(B(1.5,0.25,2.1,M.woodD, 0,0.2,0));           // 床架（x宽1.5，z长2.1）
  bed.add(B(1.44,0.22,2.04,M.white, 0,0.43,0));         // 床垫
  bed.add(B(0.12,0.9,2.1,M.woodD, 0.75,0.55,0));        // 床头板（东）
  bed.add(B(0.6,0.12,0.35,M.fabric, 0.4,0.58,-0.6));    // 枕头
  bed.add(B(0.6,0.12,0.35,M.fabric, 0.4,0.58,0.6));
  bed.add(B(1.0,0.06,1.6,M.blue, -0.1,0.56,0));         // 毯子
  bed.position.set(6.2,0,1.6); b2.add(reg(bed,'次卧床','2100大床，床头靠东墙。'));
  // 衣柜（西墙，620深）
  const wd=new THREE.Group();
  wd.add(B(0.62,2.1,2.8,M.woodL, 0,1.05,0));
  for(let i=0;i<4;i++) wd.add(B(0.02,1.9,0.68,M.dark, 0.32,1.0,-1.05+i*0.7));
  wd.position.set(4.33,0,1.6); b2.add(reg(wd,'次卧衣柜','西墙大衣柜，620深。'));
  // 床头柜
  b2.add(B(0.45,0.5,0.45,M.woodL, 6.2,0.25,0.45));
  roomLight(5.6,2.3,1.6,0xffe8c8,10,6);
  reg(b2,'次卧','床头东靠，衣柜在西。');
}

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
  return reg(g,'工业风扇','大个头工业落地扇，风力生猛。');
}
/* ============ 客厅（东） ============ */
{
  const l=new THREE.Group(); scene.add(l);
  // 沙发 2000（东墙，朝西）
  const sf=new THREE.Group();
  sf.add(B(0.85,0.4,2.0,M.fabric, 0,0.2,0));
  sf.add(B(0.85,0.5,0.25,M.fabric, 0,0.55,-0.875));
  sf.add(B(0.85,0.5,0.25,M.fabric, 0,0.55,0.875));
  sf.add(B(0.2,0.6,2.0,M.fabric, 0.325,0.5,0)); // 靠背（东）
  sf.add(B(0.4,0.12,0.4,M.pink, -0.05,0.46,-0.4)); // 抱枕
  sf.add(B(0.4,0.12,0.4,M.blue, -0.05,0.46,0.4));
  sf.position.set(6.6,0,6.0); l.add(reg(sf,'沙发','东墙双人沙发，朝西看电视。'));
  // 电视墙（西）
  const tv=new THREE.Group();
  tv.add(B(0.08,1.2,1.6,M.dark, 0,1.3,0));
  tv.add(B(0.02,0.7,1.2,M.black, -0.05,1.3,0));
  tv.add(B(0.4,0.35,1.8,M.woodD, 0.15,0.175,0)); // 电视柜
  tv.position.set(4.1,0,6.0); l.add(reg(tv,'电视墙','西墙电视背景+电视柜。'));
  // 茶几
  const ct=new THREE.Group();
  ct.add(B(0.6,0.04,1.1,M.woodL, 0,0.4,0));
  for(const sx of [-0.25,0.25]) for(const sz of [-0.5,0.5]) ct.add(B(0.05,0.4,0.05,M.woodD, sx,0.2,sz));
  ct.position.set(5.5,0,6.0); l.add(reg(ct,'茶几','沙发前小茶几。'));
  // 工业风扇
  l.add(industrialFan(4.6,7.0,0.5));
  roomLight(5.6,2.3,6.0,0xffe8c8,12,7);
  reg(l,'客厅','沙发东靠看西墙电视。');
}

/* ============ 主卧（南） ============ */
{
  const m=new THREE.Group(); scene.add(m);
  // 床 2100x1500，床头在东
  const bed=new THREE.Group();
  bed.add(B(1.5,0.25,2.1,M.woodD, 0,0.2,0));
  bed.add(B(1.44,0.22,2.04,M.white, 0,0.43,0));
  bed.add(B(0.12,1.0,2.1,M.woodD, 0.75,0.6,0)); // 床头板
  bed.add(B(0.6,0.14,0.35,M.white, 0.4,0.60,-0.6));
  bed.add(B(0.6,0.14,0.35,M.white, 0.4,0.60,0.6));
  bed.add(B(1.05,0.07,1.65,M.pink, -0.1,0.58,0)); // 粉毯
  bed.position.set(6.2,0,8.6); m.add(reg(bed,'主卧床','2100大床，床头靠东。'));
  // 衣柜（西墙，620深）
  const wd=new THREE.Group();
  wd.add(B(0.62,2.2,3.0,M.woodL, 0,1.1,0));
  for(let i=0;i<4;i++) wd.add(B(0.02,2.0,0.72,M.dark, 0.32,1.05,-1.1+i*0.75));
  wd.position.set(4.33,0,8.6); m.add(reg(wd,'主卧衣柜','西墙衣柜。'));
  // 床头柜（南北各一）
  m.add(B(0.45,0.5,0.45,M.woodL, 6.2,0.25,7.35));
  m.add(B(0.45,0.5,0.45,M.woodL, 6.2,0.25,9.85));
  // 吊灯
  const ch=new THREE.Group();
  ch.add(Cyl(0.01,0.01,0.4,M.black, 0,2.6,0));
  ch.add(new THREE.Mesh(new THREE.SphereGeometry(0.16,16,16), new THREE.MeshStandardMaterial({color:0x222222,roughness:0.4})));
  ch.children[1].position.y=2.35;
  ch.position.set(5.6,0,8.6); m.add(reg(ch,'主卧吊灯','黑色半球吊灯。'));
  roomLight(5.6,2.3,8.6,0xffe8c8,12,7);
  reg(m,'主卧','床头东靠，西墙衣柜。');
}
/* ============ 阳台（南） ============ */
{
  const y=new THREE.Group(); scene.add(y);
  // 两把休闲椅+圆几
  for(const [cx,ry] of [[5.0,0.6],[6.4,-0.6]]){
    const ch=new THREE.Group();
    ch.add(B(0.55,0.08,0.55,M.rattan, 0,0.4,0));
    ch.add(B(0.55,0.5,0.08,M.rattan, 0,0.65,-0.24));
    for(const sx of [-0.22,0.22]) for(const sz of [-0.22,0.22]) ch.add(B(0.04,0.4,0.04,M.woodD, sx,0.2,sz));
    ch.position.set(cx,0,10.0); ch.rotation.y=ry; y.add(ch);
  }
  y.add(reg(y.children[0],'休闲椅','阳台藤椅。'));
  const tb=new THREE.Group();
  tb.add(Cyl(0.28,0.28,0.04,M.woodL, 0,0.5,0));
  tb.add(Cyl(0.03,0.03,0.5,M.woodD, 0,0.25,0));
  tb.position.set(5.7,0,10.0); y.add(reg(tb,'圆几','阳台小圆几。'));
  roomLight(5.7,2.3,10.0,0xfff0d8,8,5);
  reg(y,'阳台','南阳台，藤椅+圆几。');
}

/* ============ 房名标签 ============ */
roomLabel('厨房',1.18,1.5); roomLabel('卫生间',3.0,1.5); roomLabel('次卧',5.6,1.6);
roomLabel('餐厅',1.5,4.27); roomLabel('书房',6.15,3.7); roomLabel('客厅',5.6,6.0);
roomLabel('主卧',5.6,8.6); roomLabel('阳台',5.6,10.0);

/* ============ 视角 ============ */
const VIEWS=[
  ['鸟瞰',[3.67,9.5,13.5],[3.67,0,5.3]],
  ['厨房',[1.18,1.7,2.1],[1.18,0.7,0.8]],
  ['卫生间',[3.0,1.7,2.1],[3.0,0.7,0.8]],
  ['次卧',[5.6,1.8,2.4],[5.6,0.7,1.0]],
  ['餐厅',[1.5,1.8,3.6],[1.5,0.7,4.6]],
  ['书房',[6.15,1.7,3.1],[6.7,0.7,3.9]],
  ['客厅',[5.6,1.8,5.2],[5.6,0.7,6.8]],
  ['主卧',[5.6,1.8,8.0],[5.6,0.7,9.0]],
  ['阳台',[5.6,1.7,9.2],[5.6,0.7,10.1]],
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
