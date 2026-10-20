// Flying V modelada em código. Carregada só quando uma aula é concluída.
// Unidades ~ decímetros; o braço aponta para +Y, a frente da guitarra para +Z.
import * as THREE from 'three';
import { RoomEnvironment } from '../../vendor/RoomEnvironment.js';

export const PAINTS = {
  'Madeira crua': { body: 0xb5824f, roughness: 0.62, metalness: 0, clearcoat: 0.05, hardware: 'chrome' },
  'Preto fosco': { body: 0x161616, roughness: 0.55, metalness: 0, clearcoat: 0.08, hardware: 'chrome' },
  'Vermelho-sangue': { body: 0x86070e, roughness: 0.22, metalness: 0, clearcoat: 1, hardware: 'chrome' },
  'Branco osso': { body: 0xe8dfcc, roughness: 0.28, metalness: 0, clearcoat: 1, hardware: 'black' },
  'Aço escovado': { body: 0x9da3ab, roughness: 0.34, metalness: 0.92, clearcoat: 0.25, hardware: 'black' },
  'Ouro velho': { body: 0xa07c34, roughness: 0.3, metalness: 0.88, clearcoat: 0.5, hardware: 'chrome' },
  'Obsidiana e ouro': { body: 0x050505, roughness: 0.1, metalness: 0, clearcoat: 1, hardware: 'gold' },
};

const HARDWARE = {
  chrome: { color: 0xd8d8d8, metalness: 1, roughness: 0.18 },
  gold: { color: 0xd6a849, metalness: 1, roughness: 0.24 },
  black: { color: 0x1b1b1b, metalness: 0.6, roughness: 0.35 },
};

const NUT_Y = 2.78;
const BRIDGE_Y = -0.3;
const SCALE = NUT_Y - BRIDGE_Y;
const FRETS = 22;
const fretY = (n) => NUT_Y - SCALE * (1 - 2 ** (-n / 12));

function bodyShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.24, 0.44);
  s.lineTo(-1.02, -1.38);
  s.quadraticCurveTo(-1.07, -1.58, -0.86, -1.61);
  s.lineTo(-0.66, -1.57);
  s.lineTo(-0.07, -0.66);
  s.quadraticCurveTo(0, -0.56, 0.07, -0.66);
  s.lineTo(0.66, -1.57);
  s.lineTo(0.86, -1.61);
  s.quadraticCurveTo(1.07, -1.58, 1.02, -1.38);
  s.lineTo(0.24, 0.44);
  s.quadraticCurveTo(0, 0.6, -0.24, 0.44);
  return s;
}

function headShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.11, 0);
  s.lineTo(-0.22, 0.62);
  s.lineTo(0, 0.82);
  s.lineTo(0.22, 0.62);
  s.lineTo(0.11, 0);
  s.lineTo(-0.11, 0);
  return s;
}

// Cilindro fino entre dois pontos (cordas).
function rod(a, b, r, mat) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const geo = new THREE.CylinderGeometry(r, r, dir.length(), 6, 1, true);
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}

function buildGuitar(paintName, lowQuality) {
  const p = PAINTS[paintName] ?? PAINTS['Madeira crua'];
  const hw = HARDWARE[p.hardware];
  const seg = lowQuality ? 8 : 18;

  const paint = new THREE.MeshPhysicalMaterial({
    color: p.body, roughness: p.roughness, metalness: p.metalness, clearcoat: p.clearcoat, clearcoatRoughness: 0.08,
  });
  const metal = new THREE.MeshStandardMaterial(hw);
  const nickel = new THREE.MeshStandardMaterial({ color: 0xcfcfcf, metalness: 1, roughness: 0.22 });
  const board = new THREE.MeshStandardMaterial({ color: 0x24160f, roughness: 0.82 });
  const maple = new THREE.MeshStandardMaterial({ color: p.metalness > 0.5 ? 0x1a1a1a : p.body, roughness: 0.4 });
  const black = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.45 });
  const pearl = new THREE.MeshStandardMaterial({ color: 0xf1ece0, roughness: 0.3 });
  const bone = new THREE.MeshStandardMaterial({ color: 0xeae2cf, roughness: 0.5 });

  const g = new THREE.Group();

  // Corpo
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape(), {
    depth: 0.16, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: lowQuality ? 2 : 4, curveSegments: seg,
  });
  bodyGeo.translate(0, 0, -0.08);
  g.add(new THREE.Mesh(bodyGeo, paint));
  const front = 0.105;

  // Braço e escala
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.19, NUT_Y - 0.3, 0.07), maple);
  neck.position.set(0, (NUT_Y + 0.3) / 2, front + 0.0);
  g.add(neck);
  const boardTop = front + 0.035 + 0.03;
  const fb = new THREE.Mesh(new THREE.BoxGeometry(0.2, NUT_Y - fretY(FRETS) + 0.06, 0.03), board);
  fb.position.set(0, (NUT_Y + fretY(FRETS) - 0.06) / 2, front + 0.035 + 0.015);
  g.add(fb);

  const fretGeo = new THREE.BoxGeometry(0.2, 0.008, 0.012);
  for (let n = 1; n <= FRETS; n += 1) {
    const f = new THREE.Mesh(fretGeo, nickel);
    f.position.set(0, fretY(n), boardTop + 0.006);
    g.add(f);
  }
  const nut = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.03), bone);
  nut.position.set(0, NUT_Y, boardTop + 0.012);
  g.add(nut);

  const dotGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.004, 16);
  const dot = (x, n) => {
    const d = new THREE.Mesh(dotGeo, pearl);
    d.rotation.x = Math.PI / 2;
    d.position.set(x, (fretY(n) + fretY(n - 1)) / 2, boardTop + 0.001);
    g.add(d);
  };
  [3, 5, 7, 9, 15, 17, 19, 21].forEach((n) => dot(0, n));
  dot(-0.05, 12);
  dot(0.05, 12);

  // Mão (headstock) em ponta de flecha, inclinada para trás
  const headGeo = new THREE.ExtrudeGeometry(headShape(), {
    depth: 0.06, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2,
  });
  const head = new THREE.Group();
  const headMesh = new THREE.Mesh(headGeo, paint);
  headMesh.position.z = -0.03;
  head.add(headMesh);
  // Tarraxas: pino na frente, perto da borda; botão saindo pela lateral.
  const postGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.07, 10);
  const shaftGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.05, 8);
  const keyGeo = new THREE.BoxGeometry(0.05, 0.04, 0.016);
  const edgeX = (y) => 0.11 + (0.11 * y) / 0.62;
  [0.16, 0.32, 0.48].forEach((y) => {
    [-1, 1].forEach((side) => {
      const edge = edgeX(y);
      const post = new THREE.Mesh(postGeo, metal);
      post.rotation.x = Math.PI / 2;
      post.position.set(side * (edge - 0.045), y, 0.06);
      head.add(post);
      const shaft = new THREE.Mesh(shaftGeo, metal);
      shaft.rotation.z = Math.PI / 2;
      shaft.position.set(side * (edge + 0.02), y, 0);
      head.add(shaft);
      const key = new THREE.Mesh(keyGeo, metal);
      key.position.set(side * (edge + 0.065), y, 0);
      head.add(key);
    });
  });
  head.position.set(0, NUT_Y + 0.02, front + 0.05);
  head.rotation.x = -0.22;
  g.add(head);

  // Captadores
  const pickupGeo = new THREE.BoxGeometry(0.36, 0.14, 0.035);
  const poleGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.01, 8);
  [0.27, -0.06].forEach((y) => {
    const pu = new THREE.Mesh(pickupGeo, black);
    pu.position.set(0, y, front + 0.018);
    g.add(pu);
    for (let i = 0; i < 6; i += 1) {
      const pole = new THREE.Mesh(poleGeo, metal);
      pole.rotation.x = Math.PI / 2;
      pole.position.set(-0.125 + i * 0.05, y + 0.03, front + 0.04);
      g.add(pole);
    }
  });

  // Ponte e cordal em V
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.045), metal);
  bridge.position.set(0, BRIDGE_Y, front + 0.03);
  g.add(bridge);
  const tailShape = new THREE.Shape();
  tailShape.moveTo(-0.16, 0);
  tailShape.lineTo(0.16, 0);
  tailShape.lineTo(0, -0.2);
  tailShape.lineTo(-0.16, 0);
  const tail = new THREE.Mesh(new THREE.ExtrudeGeometry(tailShape, { depth: 0.01, bevelEnabled: false }), metal);
  tail.position.set(0, -0.4, front);
  g.add(tail);

  // Controles no corpo
  const knobGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.05, 20);
  [[0.5, -0.95], [0.72, -1.08], [0.62, -1.3]].forEach(([x, y]) => {
    const k = new THREE.Mesh(knobGeo, p.hardware === 'gold' ? metal : black);
    k.rotation.x = Math.PI / 2;
    k.position.set(x, y, front + 0.025);
    g.add(k);
  });
  const sw = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 16), metal);
  sw.rotation.x = Math.PI / 2;
  sw.position.set(-0.42, -0.42, front + 0.01);
  g.add(sw);
  const swTip = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 8), metal);
  swTip.rotation.x = Math.PI / 2;
  swTip.position.set(-0.42, -0.42, front + 0.06);
  g.add(swTip);

  // Cordas
  const strings = new THREE.Group();
  const stringMat = new THREE.MeshStandardMaterial({ color: 0xe6e6e6, metalness: 1, roughness: 0.25 });
  for (let i = 0; i < 6; i += 1) {
    const t = i / 5 - 0.5;
    const a = new THREE.Vector3(t * 0.15, NUT_Y, boardTop + 0.028);
    const b = new THREE.Vector3(t * 0.21, BRIDGE_Y, front + 0.055);
    strings.add(rod(a, b, 0.0035 + (5 - i) * 0.0009, stringMat));
  }
  g.add(strings);

  // Centraliza: o meio da guitarra fica na origem.
  const box = new THREE.Box3().setFromObject(g);
  const center = box.getCenter(new THREE.Vector3());
  const pivot = new THREE.Group();
  g.position.sub(center);
  pivot.add(g);
  return { pivot, strings, radius: box.getSize(new THREE.Vector3()).length() / 2 };
}

export function createGuitar(canvas, paintName) {
  const lowQuality = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowQuality ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

  // Luz de palco: principal quente de cima, contra-luz vermelha atrás.
  const key = new THREE.DirectionalLight(0xfff1dc, 2.2);
  key.position.set(-3, 5, 6);
  const rim = new THREE.DirectionalLight(0xff2a1a, 0);
  rim.position.set(4, 2, -5);
  const fill = new THREE.DirectionalLight(0x9fb4ff, 0.35);
  fill.position.set(5, -2, 4);
  scene.add(key, rim, fill);

  const { pivot, strings, radius } = buildGuitar(paintName, lowQuality);
  scene.add(pivot);

  // Fundo do palco: um pano escuro e um canhão de luz vermelha atrás da guitarra.
  // Brilho de palco atrás da guitarra: textura sem luz, não tinge a pintura.
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 256;
  glowCanvas.height = 256;
  const gctx = glowCanvas.getContext('2d');
  const grad = gctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(210, 30, 24, 0.6)');
  grad.addColorStop(0.45, 'rgba(140, 14, 12, 0.22)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  gctx.fillStyle = grad;
  gctx.fillRect(0, 0, 256, 256);
  const glowTex = new THREE.CanvasTexture(glowCanvas);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 3.2, radius * 3.2),
    new THREE.MeshBasicMaterial({
      map: glowTex, transparent: true, depthWrite: false, opacity: 0, toneMapped: false,
    }),
  );
  glow.position.set(0, 0.1, -3);
  scene.add(glow);

  // Pose: inclinada como num pôster, um pouco de lado.
  const pose = { x: 0.12, y: -0.38, z: -0.42 };
  pivot.rotation.set(pose.x, pose.y, pose.z);

  let wide = true;
  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    wide = w > h * 1.1;
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
    const fit = radius * (wide ? 1.0 : 0.84);
    const dist = fit / Math.sin(Math.min(vfov, hfov) / 2);
    camera.position.set(0, 0, dist);
    // Deixa espaço para o texto: à esquerda no desktop, embaixo no celular.
    camera.setViewOffset(w, h, wide ? -w * 0.16 : 0, wide ? 0 : h * 0.12, w, h);
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  // Arrastar para girar, com inércia.
  let drag = null;
  let spin = 0;
  let userY = 0;
  const down = (e) => { drag = e.clientX; spin = 0; canvas.setPointerCapture(e.pointerId); };
  const move = (e) => {
    if (drag === null) return;
    const dx = e.clientX - drag;
    drag = e.clientX;
    spin = dx * 0.012;
    userY += spin;
  };
  const up = () => { drag = null; };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);

  const clock = new THREE.Clock();
  let introDone = false;
  let strumAt = -10;
  let raf = 0;
  const tick = () => {
    const t = clock.getElapsedTime();
    if (introDone) {
      if (drag === null) {
        userY += spin;
        spin *= 0.94;
      }
      pivot.rotation.y = pose.y + userY + Math.sin(t * 0.6) * 0.18;
      pivot.rotation.x = pose.x + Math.sin(t * 0.45) * 0.04;
    }
    // Cordas vibrando no "acorde" do flash de luz, apagando em 1,5 s.
    const since = t - strumAt;
    strings.position.x = since > 0 && since < 1.5 ? Math.sin(t * 90) * 0.0014 * (1 - since / 1.5) : 0;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  tick();

  // Entrada: a guitarra vem girando do fundo do palco; a contra-luz explode.
  function intro(gsap) {
    if (!gsap) {
      introDone = true;
      rim.intensity = 2.4;
      glow.material.opacity = 1;
      return;
    }
    pivot.position.z = -16;
    pivot.rotation.y = pose.y - Math.PI * 3;
    pivot.rotation.x = pose.x + 0.5;
    const tl = gsap.timeline({ onComplete: () => { introDone = true; } });
    tl.call(() => { strumAt = clock.getElapsedTime(); }, null, 1.05)
      .to(pivot.position, { z: 0, duration: 1.5, ease: 'power4.out' }, 0)
      .to(pivot.rotation, { y: pose.y, x: pose.x, duration: 1.8, ease: 'power3.out' }, 0)
      .to(rim, { intensity: 7, duration: 0.18, ease: 'power2.out' }, 1.05)
      .to(rim, { intensity: 2.4, duration: 1.2, ease: 'power2.out' }, 1.23)
      .fromTo(glow.scale, { x: 0.6, y: 0.6 }, { x: 1, y: 1, duration: 0.9, ease: 'power3.out' }, 1.05)
      .to(glow.material, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 1.05);
  }

  function dispose() {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    pivot.traverse((o) => {
      if (o.isMesh) {
        o.geometry.dispose();
        o.material.dispose();
      }
    });
    glow.geometry.dispose();
    glow.material.dispose();
    glowTex.dispose();
    envRT.dispose();
    pmrem.dispose();
    renderer.dispose();
  }

  return { intro, dispose };
}
