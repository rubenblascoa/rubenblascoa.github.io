/* Modelo 3D de ESP32 Blasco OS.
   Geometría y texturas portadas de la landing de Blasco OS (main/pages/page_landing.h);
   la cámara la mueven las timelines de cinematic.html a través de "vistas". */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// ── Placa: 124.968 × 64.516 mm, 1.6 mm de grosor ──
const W = 124.968, D = 64.516, T = 1.6, TOP = T / 2, FOV = 30;
const K = W / 1280;
const at = (px, py) => [px * K - W / 2, py * K - D / 2];

export async function createPCB3D(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  if (!renderer.getContext()) throw new Error('WebGL no disponible');
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 2000);
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(55, 150, 70); scene.add(key);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -85, right: 85, top: 85, bottom: -85, near: 20, far: 420 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03; key.shadow.radius = 4;
  const rim = new THREE.DirectionalLight(0xffffff, 0.7); rim.position.set(-120, 40, -90); scene.add(rim);
  const under = new THREE.DirectionalLight(0xffffff, 0.8); under.position.set(20, -120, 60); scene.add(under);

  const base = new URL('.', import.meta.url);
  const loadTex = (file) => new THREE.TextureLoader().loadAsync(new URL(file, base).href).then(t => {
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t;
  });
  const [topTex, botTex] = await Promise.all([loadTex('pcb3d-top.webp'), loadTex('pcb3d-bottom.webp')]);
  const edge = new THREE.MeshStandardMaterial({ color: 0x15171c, roughness: 0.6 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(W, T, D), [
    edge, edge,
    new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.42, metalness: 0.15 }),
    new THREE.MeshStandardMaterial({ map: botTex, roughness: 0.5, metalness: 0.1 }),
    edge, edge
  ]);
  const pcb = new THREE.Group();
  pcb.add(board);
  scene.add(pcb);

  // Sombra de contacto suave bajo la placa
  const sc = document.createElement('canvas'); sc.width = sc.height = 256;
  const sg = sc.getContext('2d'); const grd = sg.createRadialGradient(128, 128, 10, 128, 128, 128);
  grd.addColorStop(0, 'rgba(0,0,0,0.6)'); grd.addColorStop(1, 'rgba(0,0,0,0)'); sg.fillStyle = grd; sg.fillRect(0, 0, 256, 256);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.6, D * 1.9), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -14; scene.add(shadow);

  // ── Componentes (posiciones en px de la textura de 1280 px → mm) ──
  const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.55, metalness: 0 }, o));
  const MAT = {
    black: M(0x16181c, { roughness: 0.45 }), plastic: M(0x1b1d22, { roughness: 0.7 }),
    metal: M(0xd7dade, { metalness: 1, roughness: 0.28 }), tin: M(0xc9ccd1, { metalness: 1, roughness: 0.35 }),
    cream: M(0xe9e2cf, { roughness: 0.6 }), beige: M(0xb89d70, { roughness: 0.6 }), white: M(0xf2f2ee, { roughness: 0.4 }),
    amber: M(0xc48a18, { roughness: 0.35 }), gold: M(0xc8a64a, { metalness: 1, roughness: 0.3 }), modpcb: M(0x1d241f, { roughness: 0.5 })
  };
  const parts = [];
  function part(px, py, build, lift = 1) {
    const g = new THREE.Group(); build(g);
    const [x, z] = at(px, py); g.position.set(x, TOP, z);
    g.userData = { lift: lift * (8 + Math.random() * 10), spin: (Math.random() - 0.5) * 0.5 };
    pcb.add(g); parts.push(g); return g;
  }
  function box(g, w, h, d, mat, x = 0, y = 0, z = 0, r = 0.25) {
    const m = new THREE.Mesh(r > 0 ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, h / 2, w / 2, d / 2)) : new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y + h / 2, z); g.add(m); return m;
  }
  function textTex(lines, w, h, bg, fg) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
    x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.textBaseline = 'top';
    lines.forEach(([t, size, y, weight]) => { x.font = `${weight || 600} ${size}px Inter, Arial, sans-serif`; x.fillText(t, w * 0.08, y); });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  function header(px, py, pins, alongX, h = 8.5) {
    return part(px, py, g => {
      const L = pins * 2.54;
      const c = document.createElement('canvas'); c.width = 64 * pins; c.height = 64; const x = c.getContext('2d');
      x.fillStyle = '#1b1d22'; x.fillRect(0, 0, c.width, 64); x.fillStyle = '#050506';
      for (let i = 0; i < pins; i++) x.fillRect(i * 64 + 20, 20, 24, 24);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      if (!alongX) { t.rotation = Math.PI / 2; t.center.set(0.5, 0.5); }
      const topM = new THREE.MeshStandardMaterial({ map: t, roughness: 0.7 });
      const m = new THREE.Mesh(new THREE.BoxGeometry(alongX ? L : 2.54, h, alongX ? 2.54 : L), [MAT.plastic, MAT.plastic, topM, MAT.plastic, MAT.plastic, MAT.plastic]);
      m.position.y = h / 2; g.add(m);
    }, 1.3);
  }
  function smd(px, py, vertical, mat) {
    return part(px, py, g => {
      const [w, d] = vertical ? [1.25, 2.0] : [2.0, 1.25];
      box(g, w, 0.5, d, mat, 0, 0, 0, 0.05);
      const ew = vertical ? w : 0.35, ed = vertical ? 0.35 : d;
      box(g, ew + 0.02, 0.52, ed + 0.02, MAT.tin, vertical ? 0 : -0.83, 0, vertical ? -0.83 : 0, 0.05);
      box(g, ew + 0.02, 0.52, ed + 0.02, MAT.tin, vertical ? 0 : 0.83, 0, vertical ? 0.83 : 0, 0.05);
    }, 0.6);
  }

  // ESP32-S3-WROOM-1 (placa del módulo + blindaje metálico grabado)
  part(610, 217, g => {
    const mc = document.createElement('canvas'); mc.width = 360; mc.height = 510; const mx = mc.getContext('2d');
    mx.fillStyle = '#1b231d'; mx.fillRect(0, 0, 360, 510);
    mx.strokeStyle = '#b9a36a'; mx.lineWidth = 9; mx.lineJoin = 'round'; mx.beginPath();
    mx.moveTo(40, 120); mx.lineTo(40, 40); mx.lineTo(110, 40); mx.lineTo(110, 105); mx.lineTo(165, 105); mx.lineTo(165, 40);
    mx.lineTo(225, 40); mx.lineTo(225, 105); mx.lineTo(285, 105); mx.lineTo(285, 40); mx.lineTo(325, 40); mx.lineTo(325, 120); mx.stroke();
    mx.fillStyle = '#c9ccd1';
    for (let i = 0; i < 14; i++) { mx.fillRect(0, 150 + i * 25, 16, 14); mx.fillRect(344, 150 + i * 25, 16, 14); }
    for (let i = 0; i < 11; i++) mx.fillRect(40 + i * 26, 494, 14, 16);
    const mt = new THREE.CanvasTexture(mc); mt.colorSpace = THREE.SRGBColorSpace; mt.anisotropy = 8;
    const modTop = new THREE.MeshStandardMaterial({ map: mt, roughness: 0.45, metalness: 0.2 });
    const mod = new THREE.Mesh(new THREE.BoxGeometry(18, 0.8, 25.5), [MAT.modpcb, MAT.modpcb, modTop, MAT.modpcb, MAT.modpcb, MAT.modpcb]);
    mod.position.y = 0.4; g.add(mod);
    const canTop = textTex([['ESPRESSIF', 44, 40, 700], ['ESP32-S3-WROOM-1', 30, 98], ['N16R8 · 16MB · 8MB PSRAM', 22, 142, 500]], 512, 560, '#c9cdd2', '#3b3f45');
    const canMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: canTop, metalness: 0.9, roughness: 0.32 });
    const can = new THREE.Mesh(new RoundedBoxGeometry(15.8, 2.4, 17.6, 2, 0.35), [MAT.metal, MAT.metal, canMat, MAT.metal, MAT.metal, MAT.metal]);
    can.position.set(0, 0.8 + 1.2, 3.1); g.add(can);
  }, 1.6);
  // Condensador electrolítico C8
  part(880, 108, g => {
    box(g, 8.3, 1.0, 8.3, MAT.black, 0, 0, 0, 0.5);
    const cc = document.createElement('canvas'); cc.width = cc.height = 256; const cx = cc.getContext('2d');
    cx.fillStyle = '#c9ccd1'; cx.fillRect(0, 0, 256, 256);
    cx.fillStyle = '#16181c'; cx.beginPath(); cx.moveTo(128, 128); cx.arc(128, 128, 140, -0.75, 0.75); cx.closePath(); cx.fill();
    cx.strokeStyle = '#8d9096'; cx.lineWidth = 6; cx.beginPath(); cx.moveTo(70, 70); cx.lineTo(186, 186); cx.moveTo(186, 70); cx.lineTo(70, 186); cx.stroke();
    const ct = new THREE.CanvasTexture(cc); ct.colorSpace = THREE.SRGBColorSpace;
    const capTop = new THREE.MeshStandardMaterial({ map: ct, metalness: 0.85, roughness: 0.3 });
    const can = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.0, 5.6, 64), [M(0xc9ccd1, { metalness: 0.85, roughness: 0.3 }), capTop, MAT.metal]);
    can.position.y = 1.0 + 2.8; g.add(can);
    const mark = new THREE.Mesh(new THREE.CylinderGeometry(4.03, 4.03, 5.4, 48, 1, true, 0.85, 1.4), M(0x16181c, { roughness: 0.4 }));
    mark.position.y = 1.0 + 2.8; g.add(mark);
  }, 1.4);
  // Cabeceras de módulos
  header(1087, 89, 4, true);    // H2 pantalla
  header(1210, 291, 8, false);  // H1 NFC
  header(81, 127, 4, false);    // H3 ultrasonidos
  header(81, 308, 3, false);    // H5 clima
  header(488, 419, 10, true);   // H4 universal
  // Interruptor, pulsadores, regulador, CH340C, LED RGB
  part(802, 255, g => { box(g, 2.8, 1.6, 6.8, MAT.black, 0, 0, 0, 0.2); box(g, 1.2, 0.5, 2.2, MAT.white, 0, 1.6, -1.2, 0.1); }, 1);
  for (const py of [255, 340]) part(877, py, g => {
    box(g, 4.2, 1.4, 4.2, MAT.metal, 0, 0, 0, 0.25);
    for (const x of [-2.3, 2.3]) for (const z of [-1.6, 1.6]) box(g, 0.5, 0.25, 0.7, MAT.tin, x, 0, z, 0.05);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.5, 32), MAT.white); b.position.y = 1.65; g.add(b);
  }, 1.2);
  part(1068, 262, g => {
    box(g, 3.6, 1.7, 6.6, MAT.black, 0, 0, 0, 0.15);
    box(g, 1.6, 0.25, 3.2, MAT.tin, -2.6, 0, 0, 0.05);
    for (const z of [-2.3, 0, 2.3]) box(g, 1.8, 0.25, 0.7, MAT.tin, 2.6, 0, z, 0.05);
  }, 1.1);
  part(82, 468, g => {
    box(g, 10, 1.6, 4, MAT.black, 0, 0.1, 0, 0.12);
    for (let i = 0; i < 8; i++) for (const z of [-2.5, 2.5]) box(g, 0.42, 0.25, 1.1, MAT.tin, -4.45 + i * 1.27, 0, z, 0);
  }, 1.1);
  part(275, 307, g => { box(g, 5, 1.5, 5, MAT.white, 0, 0, 0, 0.2); const l = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.3, 32), M(0xf0e6d0, { roughness: 0.15, emissive: 0xe4a83c, emissiveIntensity: 0.25 })); l.position.y = 1.55; g.add(l); }, 1);
  for (const px of [190, 240]) part(px, 467, g => { box(g, 2.9, 1.0, 1.6, MAT.black, 0, 0.1, 0, 0.1); }, 0.7);
  part(88, 540, g => { box(g, 2.9, 1.0, 1.6, MAT.black, 0, 0.1, 0, 0.1); }, 0.7);
  for (const px of [420, 548]) part(px, 527, g => { box(g, 2.7, 1.1, 1.6, MAT.black, 0, 0, 0, 0.1); box(g, 0.5, 0.4, 1.0, MAT.tin, -1.7, 0, 0, 0); box(g, 0.5, 0.4, 1.0, MAT.tin, 1.7, 0, 0, 0); }, 0.7);
  // microSD y USB-C (sobresalen del borde, como en la placa real)
  part(778, 578, g => {
    const tex = textTex([['microSD', 26, 30, 600]], 256, 256, '#c3c7cc', '#6b7076');
    const top = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.9, roughness: 0.35 });
    const m = new THREE.Mesh(new RoundedBoxGeometry(15.4, 1.9, 15.2, 2, 0.2), [MAT.metal, MAT.metal, top, MAT.metal, MAT.metal, MAT.metal]);
    m.position.y = 0.95; g.add(m);
    box(g, 12.2, 1.0, 0.6, M(0x08090b, { roughness: 0.9 }), -0.6, 0.45, 7.35, 0.1);
    box(g, 11.0, 0.12, 0.8, MAT.tin, -0.6, 1.45, 7.2, 0);
    for (const x of [-8.0, 8.0]) box(g, 0.7, 0.6, 2.2, MAT.tin, x, 0, 5.4, 0.05);
  }, 1.1);
  for (const px of [82, 1197]) part(px, 618, g => {
    box(g, 8.9, 3.2, 7.4, MAT.metal, 0, 0, 0, 1.2);
    box(g, 7.7, 2.2, 0.5, M(0x08090b, { roughness: 0.9 }), 0, 0.5, 3.5, 0.9);
    box(g, 5.6, 0.6, 0.6, M(0x1d1e22), 0, 1.3, 3.55, 0.1);
    for (const x of [-4.7, 4.7]) box(g, 0.6, 1.4, 1.6, MAT.tin, x, 0, 1.6, 0.05);
  }, 1.2);
  for (const px of [265, 1010]) part(px, 607, g => {
    const Wd = 12.4, Dp = 8.6, Hh = 6.0, cream2 = M(0xd9d1bc, { roughness: 0.7 });
    box(g, Wd, 1.2, Dp, MAT.cream, 0, 0, 0, 0.3);
    box(g, Wd, Hh, 1.4, MAT.cream, 0, 0, -Dp / 2 + 0.7, 0.3);
    box(g, 1.3, Hh, Dp, MAT.cream, -Wd / 2 + 0.65, 0, 0, 0.3);
    box(g, 1.3, Hh, Dp, MAT.cream, Wd / 2 - 0.65, 0, 0, 0.3);
    box(g, Wd, 1.3, Dp, MAT.cream, 0, Hh - 1.3, 0, 0.3);
    for (const x of [-2.6, 2.6]) box(g, 1.7, 0.08, 3.2, cream2, x, Hh, -0.6, 0);
    box(g, Wd - 2.6, Hh - 2.5, Dp - 2.4, M(0x2b2721, { roughness: 0.95 }), 0, 1.2, -0.5, 0);
    for (let i = 0; i < 4; i++) box(g, 0.64, 0.64, 6.0, MAT.tin, -3.75 + i * 2.5, 2.4, 1.0, 0.05);
    for (const x of [-Wd / 2 - 0.3, Wd / 2 + 0.3]) box(g, 1.0, 1.6, 3.2, MAT.tin, x, 0, Dp / 2 - 2.0, 0.1);
  }, 1.2);
  // Pasivos 0805 y LEDs de estado
  const R = MAT.black, C = MAT.beige;
  [[128,103,R],[128,134,R],[410,132,R],[410,168,R],[410,200,R],[410,232,R],[410,263,R],[410,296,R],[410,333,R],
   [122,248,C],[122,282,C],[122,316,C],[122,345,C],[127,378,R],[372,463,C],[475,465,R],[508,465,R],[540,465,R],[572,465,R],[605,465,R],
   [540,496,R],[568,496,R],[385,496,R],[415,496,R],[718,468,R],[762,468,C],[797,468,R],[832,468,C],[930,340,R],[1185,515,C],[1215,515,C],[885,185,R]]
    .forEach(([x, y, m]) => smd(x, y, false, m));
  [[1075,128],[1105,128],[1160,545],[1245,545],[42,545],[140,545]].forEach(([x, y]) => smd(x, y, true, R));
  const glowC = document.createElement('canvas'); glowC.width = glowC.height = 64;
  const gx = glowC.getContext('2d'); const gg = gx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gg.addColorStop(0, 'rgba(255,255,255,1)'); gg.addColorStop(0.25, 'rgba(255,255,255,.55)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
  gx.fillStyle = gg; gx.fillRect(0, 0, 64, 64);
  const glowTex = new THREE.CanvasTexture(glowC);
  const leds = [];
  [[258, 145, 0x7dff8a], [258, 192, 0xffb347], [258, 238, 0xffb347], [275, 307, 0xffd29a]].forEach(([x, y, col], idx) => {
    const lm = M(0xffffff, { emissive: col, emissiveIntensity: 1.5, roughness: 0.2 });
    if (idx < 3) part(x, y, g => { box(g, 1.25, 0.6, 2.0, lm, 0, 0, 0, 0.1); box(g, 0.4, 0.62, 1.27, MAT.tin, -0.83, 0, 0, 0.05); box(g, 0.4, 0.62, 1.27, MAT.tin, 0.83, 0, 0, 0.05); }, 0.6);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    const [sx, sz] = at(x, y); sp.position.set(sx, TOP + (idx < 3 ? 1.2 : 2.2), sz); sp.scale.setScalar(idx < 3 ? 5 : 9);
    pcb.add(sp);
    leds.push({ mat: lm, sprite: sp, kind: idx === 0 ? 'on' : idx === 3 ? 'rgb' : 'blink', seed: idx * 7.3 });
  });
  pcb.traverse(o => { if (o.isMesh) { o.castShadow = o !== board; o.receiveShadow = true; } });

  // ── Vistas: números planos que GSAP puede animar ──
  // p* posición de cámara, t* objetivo, td 1 = cenital (placa como en el plano), ex = vista explosionada,
  // idle = balanceo, ox/oy = desplazamiento del encuadre en fracción de pantalla
  const view = (o = {}) => Object.assign({ px: 98, py: 142, pz: 186, tx: 0, ty: 0, tz: 2, td: 0, ex: 0, idle: 0, ox: 0, oy: 0 }, o);
  // Cámara cenital con la placa ocupando boardPx píxeles de ancho, centrada
  function topDown(boardPx) {
    const d = W * innerHeight / (boardPx * 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
    return { px: 0, py: TOP + d, pz: 0.001, tx: 0, ty: TOP, tz: 0, td: 1 };
  }
  const point = (px, py) => { const [x, z] = at(px, py); return { x, z }; };

  let current = null, active = false, raf = 0, w = 1, h = 1, mouseX = 0, mouseY = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  addEventListener('pointermove', e => { mouseX = e.clientX / innerWidth - 0.5; mouseY = e.clientY / innerHeight - 0.5; }, { passive: true });
  function resize() {
    w = innerWidth; h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();
  // Compila materiales, sube texturas y calcula sombras ahora, mientras la placa aún no se ve.
  // La cámara tiene que mirar a la placa: si no, Three.js descarta las piezas y deja ese trabajo para el primer fotograma visible
  camera.position.set(0, 160, 120); camera.lookAt(0, 0, 0);
  renderer.compile(scene, camera);
  renderer.render(scene, camera);

  const up = new THREE.Vector3();
  function render(time) {
    const v = current; if (!v) return;
    const idle = reduce ? 0 : v.idle;
    pcb.rotation.y = idle * Math.sin(time * 0.00035) * 0.14;
    pcb.position.y = idle * Math.sin(time * 0.0008) * 1.2;
    for (const p of parts) { p.position.y = TOP + v.ex * p.userData.lift; p.rotation.y = v.ex * p.userData.spin; }
    for (const l of leds) {
      let k = 1;
      if (l.kind === 'blink') { const b = Math.floor(time / 110 + l.seed); k = (Math.sin(b * 12.9898 + l.seed) * 43758.5453 % 1 + 1) % 1 > 0.55 ? 1 : 0.08; }
      if (l.kind === 'rgb') k = 0.55 + 0.45 * Math.sin(time * 0.0018);
      l.mat.emissiveIntensity = 0.2 + 1.6 * k;
      l.sprite.material.opacity = 0.15 + 0.75 * k;
    }
    const par = reduce || v.td > 0.5 ? 0 : 1 - v.td;
    camera.position.set(v.px + mouseX * 8 * par, v.py - mouseY * 5 * par, v.pz);
    camera.up.copy(up.set(0, 1 - v.td, -v.td).normalize());
    camera.lookAt(v.tx, v.ty, v.tz);
    camera.setViewOffset(w, h, -v.ox * w, -v.oy * h, w, h);
    shadow.material.opacity = (1 - v.ex * 0.4) * Math.min(1, Math.max(0, camera.position.y / 30));
    renderer.render(scene, camera);
  }
  function loop(t) { render(t); raf = active ? requestAnimationFrame(loop) : 0; }

  return {
    W, D, view, topDown, point,
    use(v) { current = v; },
    setActive(on) {
      if (on === active) return;
      active = on;
      if (on && !raf) raf = requestAnimationFrame(loop);
    },
    renderNow() { render(performance.now()); }
  };
}
