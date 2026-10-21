// Flying V realista, modelada em código, e o palco 3D que a mostra.
// Um único renderer é criado e o canvas muda de lugar: topo da tela Hoje ou
// tela de celebração. Só renderiza quando algo se mexe (poupa bateria).
// Unidades ~ 1 = 19 cm. Braço aponta para +Y, frente da guitarra para +Z.
import * as THREE from 'three';
import { RoomEnvironment } from '../../vendor/RoomEnvironment.js';

export const PAINTS = {
  'Madeira crua': { wood: true, color: 0xffffff, roughness: 0.5, metalness: 0, clearcoat: 0.35, guard: 0xefe7da, hardware: 'chrome' },
  'Preto fosco': { color: 0x151515, roughness: 0.62, metalness: 0, clearcoat: 0.08, guard: 0xefe7da, hardware: 'chrome' },
  'Vermelho-sangue': { color: 0x8a0710, roughness: 0.32, metalness: 0, clearcoat: 1, guard: 0xf2ece2, hardware: 'chrome' },
  'Branco osso': { color: 0xe9e0cc, roughness: 0.3, metalness: 0, clearcoat: 1, guard: 0x121212, hardware: 'black' },
  'Aço escovado': { color: 0xa3a9b1, roughness: 0.3, metalness: 0.9, clearcoat: 0.6, flake: true, guard: 0x121212, hardware: 'black' },
  'Ouro velho': { color: 0xa98236, roughness: 0.28, metalness: 0.85, clearcoat: 0.8, flake: true, guard: 0x121212, hardware: 'chrome' },
  'Obsidiana e ouro': { color: 0x060606, roughness: 0.14, metalness: 0, clearcoat: 1, guard: 0x0a0a0a, hardware: 'gold' },
};

const HARDWARE = {
  chrome: { color: 0xdedede, metalness: 1, roughness: 0.16 },
  gold: { color: 0xd8aa4c, metalness: 1, roughness: 0.22 },
  black: { color: 0x1c1c1c, metalness: 0.7, roughness: 0.32 },
};

// ── Medidas ──────────────────────────────────────────────────────────────
const NUT_Y = 2.78;
const BRIDGE_Y = -0.3;
const SCALE_LEN = NUT_Y - BRIDGE_Y;
const FRETS = 22;
const fretY = (n) => NUT_Y - SCALE_LEN * (1 - 2 ** (-n / 12));
const BODY_D = 0.16;
const BEVEL = 0.03;
const FRONT = BODY_D / 2 + BEVEL;
const NECK_START = 0.2;
const NECK_TOP = FRONT + 0.045;
const BOARD_T = 0.028;
const BOARD_TOP = NECK_TOP + BOARD_T;
const BOARD_END = fretY(FRETS) - 0.05;
const SADDLE_Z = FRONT + 0.092;
const TAIL_Y = -0.41;
// Largura da escala: 0,18 na pestana, 0,215 no fim.
const boardHalf = (y) => THREE.MathUtils.lerp(0.1075, 0.09, (y - BOARD_END) / (NUT_Y - BOARD_END));

// ── Texturas geradas no próprio app ─────────────────────────────────────
function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function grainLines(ctx, w, h, { count, color, alpha, amp, width }) {
  for (let i = 0; i < count; i += 1) {
    const x0 = Math.random() * w;
    const a = amp[0] + Math.random() * amp[1];
    const f = 0.002 + Math.random() * 0.006;
    ctx.strokeStyle = `rgba(${color}, ${alpha[0] + Math.random() * alpha[1]})`;
    ctx.lineWidth = width[0] + Math.random() * width[1];
    ctx.beginPath();
    for (let y = -8; y <= h + 8; y += 8) {
      const x = x0 + Math.sin(y * f + i) * a + Math.sin(y * f * 3.1 + i * 2) * a * 0.25;
      if (y < 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function woodTexture(maxAniso) {
  const [c, ctx] = canvas(512, 1024);
  ctx.fillStyle = '#b8834f';
  ctx.fillRect(0, 0, 512, 1024);
  grainLines(ctx, 512, 1024, { count: 260, color: '96, 52, 22', alpha: [0.05, 0.2], amp: [3, 12], width: [0.6, 2.6] });
  grainLines(ctx, 512, 1024, { count: 60, color: '226, 176, 120', alpha: [0.04, 0.12], amp: [3, 10], width: [1, 4] });
  for (let i = 0; i < 4000; i += 1) {
    ctx.fillStyle = `rgba(70, 36, 14, ${Math.random() * 0.22})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 1024, 1, 2 + Math.random() * 4);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(0.55, 0.32);
  t.anisotropy = maxAniso;
  return t;
}

function rosewoodTexture(maxAniso) {
  const [c, ctx] = canvas(256, 1024);
  ctx.fillStyle = '#2b1710';
  ctx.fillRect(0, 0, 256, 1024);
  grainLines(ctx, 256, 1024, { count: 120, color: '12, 6, 3', alpha: [0.15, 0.4], amp: [1, 5], width: [0.6, 2.4] });
  grainLines(ctx, 256, 1024, { count: 40, color: '92, 44, 26', alpha: [0.1, 0.25], amp: [1, 4], width: [1, 3] });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = maxAniso;
  return t;
}

// Normal map de "flocos" para as pinturas metálicas.
function flakeTexture() {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i += 1) {
    data[i * 4] = 128 + (Math.random() - 0.5) * 90;
    data[i * 4 + 1] = 128 + (Math.random() - 0.5) * 90;
    data[i * 4 + 2] = 255;
    data[i * 4 + 3] = 255;
  }
  const t = new THREE.DataTexture(data, size, size);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 6);
  t.needsUpdate = true;
  return t;
}

function logoTexture() {
  const [c, ctx] = canvas(512, 192);
  ctx.clearRect(0, 0, 512, 192);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 150px "Grenze Gotisch", Georgia, serif';
  ctx.fillText('Forja', 256, 104);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function glowTexture() {
  const [c, ctx] = canvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(214, 34, 26, 0.62)');
  g.addColorStop(0.45, 'rgba(140, 14, 12, 0.22)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ── Formas ──────────────────────────────────────────────────────────────
function shapeFrom(points) {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
}

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
  s.quadraticCurveTo(0, 0.62, -0.24, 0.44);
  return s;
}

function mirror(left) {
  return [...left, ...left.slice().reverse().map(([x, y]) => [-x, y])];
}

const PICKGUARD = mirror([[-0.2, 0.37], [-0.63, -0.6], [-0.53, -0.84], [-0.26, -0.86], [-0.11, -0.63], [-0.02, -0.53]]);
const HEAD = [[-0.11, 0], [-0.235, 0.5], [-0.2, 0.66], [0, 0.86], [0.2, 0.66], [0.235, 0.5], [0.11, 0]];

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

// Cilindro fino entre dois pontos (cordas).
function rod(a, b, r, mat, seg = 6) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const geo = new THREE.CylinderGeometry(r, r, dir.length(), seg, 1, true);
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}

const disc = (r, h, seg = 20) => new THREE.CylinderGeometry(r, r, h, seg).rotateX(Math.PI / 2);

// ── Guitarra ────────────────────────────────────────────────────────────
function buildGuitar(hq, maxAniso) {
  const seg = hq ? 24 : 12;
  const tex = { wood: woodTexture(maxAniso), rose: rosewoodTexture(maxAniso), flake: flakeTexture(), logo: logoTexture() };

  const mats = {
    paint: new THREE.MeshPhysicalMaterial({ clearcoatRoughness: 0.06 }),
    guard: new THREE.MeshPhysicalMaterial({ roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.1 }),
    metal: new THREE.MeshStandardMaterial(HARDWARE.chrome),
    nickel: new THREE.MeshStandardMaterial({ color: 0xcfcfcf, metalness: 1, roughness: 0.2 }),
    board: new THREE.MeshStandardMaterial({ map: tex.rose, roughness: 0.78 }),
    plastic: new THREE.MeshStandardMaterial({ color: 0x0f0f0f, roughness: 0.42 }),
    knob: new THREE.MeshStandardMaterial({ color: 0x0f0f0f, roughness: 0.4 }),
    bone: new THREE.MeshStandardMaterial({ color: 0xece3cf, roughness: 0.5 }),
    pearl: new THREE.MeshPhysicalMaterial({
      color: 0xf4efe6, roughness: 0.22, iridescence: 1, iridescenceIOR: 1.35, iridescenceThicknessRange: [180, 480],
    }),
    plain: new THREE.MeshStandardMaterial({ color: 0xe8e8e8, metalness: 1, roughness: 0.24 }),
    wound: new THREE.MeshStandardMaterial({ color: 0xc9c2b4, metalness: 1, roughness: 0.42 }),
    logo: new THREE.MeshStandardMaterial({ map: tex.logo, color: 0xd8aa4c, metalness: 0.9, roughness: 0.28, transparent: true, alphaTest: 0.35 }),
    cream: new THREE.MeshStandardMaterial({ color: 0xeee2c4, roughness: 0.4 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.6 }),
  };

  const g = new THREE.Group();
  const add = (geo, mat, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };

  // Corpo com borda arredondada
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape(), {
    depth: BODY_D, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: 0.028, bevelSegments: hq ? 7 : 3, curveSegments: seg,
  });
  bodyGeo.translate(0, 0, -BODY_D / 2);
  add(bodyGeo, mats.paint);

  // Escudo
  const guardGeo = new THREE.ExtrudeGeometry(shapeFrom(PICKGUARD), {
    depth: 0.008, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.004, bevelSegments: 2, curveSegments: 4,
  });
  add(guardGeo, mats.guard, 0, 0, FRONT);
  const gTop = FRONT + 0.014;

  // Braço com costas arredondadas e afinando para a pestana
  const neckLen = NUT_Y - NECK_START;
  const profile = new THREE.Shape();
  profile.moveTo(-0.1, 0);
  for (let i = 0; i <= 16; i += 1) {
    const a = (i / 16) * Math.PI;
    profile.lineTo(0.1 * Math.cos(a), 0.085 * Math.sin(a));
  }
  profile.lineTo(0.1, 0);
  const neckGeo = new THREE.ExtrudeGeometry(profile, { depth: neckLen, bevelEnabled: false, curveSegments: 4 });
  neckGeo.rotateX(-Math.PI / 2);
  const pos = neckGeo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const t = pos.getY(i) / neckLen;
    pos.setX(i, pos.getX(i) * (1 - 0.13 * t));
  }
  neckGeo.computeVertexNormals();
  add(neckGeo, mats.paint, 0, NECK_START, NECK_TOP);

  // Escala de jacarandá
  const boardLen = NUT_Y - BOARD_END;
  const boardGeo = new THREE.BoxGeometry(0.215, boardLen, BOARD_T, 1, 8, 1);
  const bp = boardGeo.attributes.position;
  for (let i = 0; i < bp.count; i += 1) {
    const y = bp.getY(i) + boardLen / 2 + BOARD_END;
    bp.setX(i, Math.sign(bp.getX(i)) * boardHalf(y));
  }
  boardGeo.computeVertexNormals();
  tex.rose.repeat.set(1, 1);
  add(boardGeo, mats.board, 0, BOARD_END + boardLen / 2, NECK_TOP + BOARD_T / 2);

  // Trastes arredondados (uma malha instanciada)
  const fretGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 1, hq ? 10 : 6).rotateZ(Math.PI / 2);
  const frets = new THREE.InstancedMesh(fretGeo, mats.nickel, FRETS);
  const m4 = new THREE.Matrix4();
  for (let n = 1; n <= FRETS; n += 1) {
    const y = fretY(n);
    m4.compose(new THREE.Vector3(0, y, BOARD_TOP), new THREE.Quaternion(), new THREE.Vector3(boardHalf(y) * 2 - 0.004, 1, 1));
    frets.setMatrixAt(n - 1, m4);
  }
  g.add(frets);

  // Marcações de madrepérola
  const dots = [3, 5, 7, 9, 15, 17, 19, 21].map((n) => [0, n]).concat([[-0.045, 12], [0.045, 12]]);
  const inlays = new THREE.InstancedMesh(disc(0.019, 0.004), mats.pearl, dots.length);
  dots.forEach(([x, n], i) => {
    m4.makeTranslation(x, (fretY(n) + fretY(n - 1)) / 2, BOARD_TOP);
    inlays.setMatrixAt(i, m4);
  });
  g.add(inlays);

  // Pestana
  add(new THREE.BoxGeometry(0.182, 0.03, 0.028), mats.bone, 0, NUT_Y + 0.005, BOARD_TOP + 0.008);

  // Mão em ponta de flecha, inclinada para trás
  const head = new THREE.Group();
  const headGeo = new THREE.ExtrudeGeometry(shapeFrom(HEAD), {
    depth: 0.055, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 4,
  });
  const headMesh = new THREE.Mesh(headGeo, mats.paint);
  headMesh.position.z = -0.03;
  head.add(headMesh);
  const face = 0.033;
  const back = -0.038;
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.1125), mats.logo);
  logo.position.set(0, 0.41, face + 0.002);
  head.add(logo);
  const truss = new THREE.Mesh(new THREE.ExtrudeGeometry(shapeFrom([[-0.03, 0.05], [0.03, 0.05], [0.045, 0.2], [-0.045, 0.2]]), { depth: 0.004, bevelEnabled: false }), mats.plastic);
  truss.position.z = face;
  head.add(truss);
  const edgeX = (y) => 0.11 + 0.25 * Math.min(y, 0.5);
  const posts = [];
  [0.16, 0.32, 0.48].forEach((y) => {
    [-1, 1].forEach((side) => {
      const ex = edgeX(y);
      const bush = new THREE.Mesh(disc(0.022, 0.008, 16), mats.metal);
      bush.position.set(side * (ex - 0.06), y, face + 0.004);
      const post = new THREE.Mesh(disc(0.011, 0.05, 12), mats.metal);
      post.position.set(side * (ex - 0.06), y, face + 0.03);
      const housing = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.06, 0.034), mats.metal);
      housing.position.set(side * (ex - 0.045), y, back - 0.018);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.07, 8).rotateZ(Math.PI / 2), mats.metal);
      shaft.position.set(side * (ex + 0.02), y, back - 0.018);
      const button = new THREE.Mesh(new THREE.SphereGeometry(0.036, 16, 10), mats.metal);
      button.scale.set(1, 0.3, 0.85);
      button.position.set(side * (ex + 0.075), y, back - 0.018);
      head.add(bush, post, housing, shaft, button);
      posts.push({ side, y, obj: post });
    });
  });
  head.position.set(0, NUT_Y + 0.02, NECK_TOP - 0.012);
  head.rotation.x = -0.24;
  g.add(head);

  // Captadores humbucker com moldura e capa
  const ringShape = roundedRect(0.44, 0.22, 0.03);
  ringShape.holes.push(roundedRect(0.37, 0.155, 0.015));
  const ringGeo = new THREE.ExtrudeGeometry(ringShape, { depth: 0.016, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 1, curveSegments: 4 });
  const coverGeo = new THREE.ExtrudeGeometry(roundedRect(0.36, 0.148, 0.012), {
    depth: 0.024, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: hq ? 3 : 1, curveSegments: 4,
  });
  const screwGeo = disc(0.008, 0.004, 8);
  [0.3, -0.1].forEach((y) => {
    add(ringGeo, mats.plastic, 0, y, gTop - 0.004);
    add(coverGeo, mats.metal, 0, y, gTop);
    [[-0.195, 0.085], [0.195, 0.085], [-0.195, -0.085], [0.195, -0.085]].forEach(([sx, sy]) => add(screwGeo, mats.metal, sx, y + sy, gTop + 0.014));
  });

  // Ponte com 6 rastilhos, parafusos de altura e placa em V
  add(new THREE.BoxGeometry(0.36, 0.032, 0.026), mats.metal, 0, BRIDGE_Y, FRONT + 0.062);
  const stringX = (i, half) => -half + (i * 2 * half) / 5;
  for (let i = 0; i < 6; i += 1) add(new THREE.BoxGeometry(0.024, 0.026, 0.016), mats.metal, stringX(i, 0.1), BRIDGE_Y, FRONT + 0.082);
  [-0.2, 0.2].forEach((x) => {
    add(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 10).rotateX(Math.PI / 2), mats.metal, x, BRIDGE_Y, FRONT + 0.035);
    add(disc(0.027, 0.012, 18), mats.metal, x, BRIDGE_Y, FRONT + 0.034);
  });
  const plate = new THREE.ExtrudeGeometry(shapeFrom([[-0.16, 0], [0.16, 0], [0.025, -0.17], [-0.025, -0.17]]), {
    depth: 0.005, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.004, bevelSegments: 1,
  });
  add(plate, mats.metal, 0, TAIL_Y + 0.025, FRONT);
  for (let i = 0; i < 6; i += 1) add(disc(0.009, 0.006, 10), mats.dark, stringX(i, 0.095), TAIL_Y, FRONT + 0.008);

  // Knobs "top hat" e chave seletora
  [[0.4, -0.62], [0.57, -0.76], [0.4, -0.84]].forEach(([x, y]) => {
    add(disc(0.06, 0.008, 24), mats.metal, x, y, gTop + 0.004);
    add(disc(0.05, 0.034, 24), mats.knob, x, y, gTop + 0.025);
    add(disc(0.042, 0.03, 24), mats.knob, x, y, gTop + 0.055);
    add(disc(0.03, 0.004, 20), mats.metal, x, y, gTop + 0.072);
  });
  add(new THREE.TorusGeometry(0.03, 0.006, 8, 24), mats.metal, -0.4, -0.3, gTop + 0.004);
  const sw = add(new THREE.CylinderGeometry(0.005, 0.005, 0.09, 8), mats.metal, -0.4, -0.3, gTop + 0.045);
  sw.rotation.x = Math.PI / 2;
  sw.rotation.z = 0.35;
  add(new THREE.SphereGeometry(0.015, 12, 10), mats.cream, -0.415, -0.3, gTop + 0.09);

  // Cordas: placa → rastilho → pestana → pino da tarraxa
  g.updateMatrixWorld(true);
  const vib = [];
  const radii = [0.0052, 0.0044, 0.0036, 0.0028, 0.0022, 0.0018];
  // Mi grave vai na tarraxa de cima à esquerda; Mi agudo na de cima à direita.
  const order = [[-1, 0.48], [-1, 0.32], [-1, 0.16], [1, 0.16], [1, 0.32], [1, 0.48]];
  for (let i = 0; i < 6; i += 1) {
    const mat = i < 3 ? mats.wound : mats.plain;
    const r = radii[i];
    const anchor = new THREE.Vector3(stringX(i, 0.095), TAIL_Y, FRONT + 0.012);
    const saddle = new THREE.Vector3(stringX(i, 0.1), BRIDGE_Y, SADDLE_Z);
    const nut = new THREE.Vector3(stringX(i, 0.074), NUT_Y + 0.005, BOARD_TOP + 0.022);
    const [side, y] = order[i];
    const target = posts.find((p) => p.side === side && p.y === y).obj;
    const postWorld = target.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0, 0.008));
    g.add(rod(anchor, saddle, r, mat));
    const speaking = rod(saddle, nut, r, mat, hq ? 6 : 4);
    speaking.userData.baseX = speaking.position.x;
    vib.push(speaking);
    g.add(speaking);
    g.add(rod(nut, postWorld, r, mat));
  }

  // Centraliza na origem
  const box = new THREE.Box3().setFromObject(g);
  const center = box.getCenter(new THREE.Vector3());
  g.position.sub(center);
  const pivot = new THREE.Group();
  pivot.add(g);
  return {
    pivot, vib, mats, tex, radius: box.getSize(new THREE.Vector3()).length() / 2,
  };
}

// ── Palco ───────────────────────────────────────────────────────────────
const POSES = {
  hero: { x: 0.16, y: -0.42, z: -0.62 },
  heroWide: { x: 0.14, y: -0.4, z: -1.2 },
  stage: { x: 0.12, y: -0.38, z: -0.42 },
};

export async function createStage() {
  try { await document.fonts.load('900 80px "Grenze Gotisch"'); } catch { /* sem a fonte, o logo usa Georgia */ }
  const hq = !matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  const canvasEl = document.createElement('canvas');
  canvasEl.setAttribute('aria-hidden', 'true');
  const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, hq ? 2 : 1.6));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.7;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const key = new THREE.DirectionalLight(0xfff0d8, 2.4);
  key.position.set(-3, 5, 6);
  const rim = new THREE.DirectionalLight(0xff2a1a, 2.4);
  rim.position.set(4, 2, -5);
  const fill = new THREE.DirectionalLight(0x9fb4ff, 0.4);
  fill.position.set(5, -2, 4);
  scene.add(key, rim, fill);

  const guitar = buildGuitar(hq, renderer.capabilities.getMaxAnisotropy());
  const { pivot, vib, mats } = guitar;
  scene.add(pivot);

  const glowTex = glowTexture();
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(guitar.radius * 2.6, guitar.radius * 2.6),
    // Mistura aditiva que não escreve alfa: o brilho soma luz sobre a página
    // (o número da ofensiva atrás continua claro) em vez de cobri-la.
    new THREE.MeshBasicMaterial({
      map: glowTex,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
      blendSrcAlpha: THREE.ZeroFactor,
      blendDstAlpha: THREE.OneFactor,
    }),
  );
  glow.position.set(0, 0.1, -3);
  scene.add(glow);

  // Estado
  let host = null;
  let mode = 'hero';
  let pose = POSES.hero;
  let raf = 0;
  let awakeUntil = 0;
  let visible = true;
  let userY = 0;
  let spin = 0;
  let drag = null;
  let strumAt = -10;
  let onTap = null;
  const clock = new THREE.Clock();
  const ro = new ResizeObserver(() => { resize(); wake(0.2); });
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(0.5); });

  function applyPaint(name) {
    const p = PAINTS[name] ?? PAINTS['Madeira crua'];
    const m = mats.paint;
    m.color.set(p.color);
    m.map = p.wood ? guitar.tex.wood : null;
    m.normalMap = p.flake ? guitar.tex.flake : null;
    m.normalScale = new THREE.Vector2(0.12, 0.12);
    m.roughness = p.roughness;
    m.metalness = p.metalness;
    m.clearcoat = p.clearcoat;
    m.needsUpdate = true;
    mats.guard.color.set(p.guard);
    const hw = HARDWARE[p.hardware];
    mats.metal.color.set(hw.color);
    mats.metal.metalness = hw.metalness;
    mats.metal.roughness = hw.roughness;
    const goldKnobs = p.hardware === 'gold';
    mats.knob.color.set(goldKnobs ? hw.color : 0x0f0f0f);
    mats.knob.metalness = goldKnobs ? 1 : 0;
    mats.knob.roughness = goldKnobs ? 0.24 : 0.4;
  }

  function resize() {
    if (!host) return;
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const wide = w > h * 1.1;
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
    let fit;
    let ox;
    let oy;
    if (mode === 'hero') {
      pose = wide ? POSES.heroWide : POSES.hero;
      fit = wide ? 0.66 : 0.74;
      ox = wide ? -w * 0.15 : -w * 0.16;
      oy = wide ? h * 0.2 : h * 0.05;
    } else {
      pose = POSES.stage;
      fit = wide ? 0.95 : 0.84;
      ox = wide ? -w * 0.16 : 0;
      oy = wide ? 0 : h * 0.12;
    }
    const dist = (guitar.radius * fit) / Math.sin(Math.min(vfov, hfov) / 2);
    camera.position.set(0, 0, dist);
    camera.setViewOffset(w, h, ox, oy, w, h);
    camera.updateProjectionMatrix();
  }

  function frame() {
    raf = 0;
    if (!host || !visible || document.hidden) return;
    const t = clock.getElapsedTime();
    if (drag === null) {
      userY += spin;
      spin *= 0.93;
    }
    pivot.rotation.y = pose.y + userY + Math.sin(t * 0.55) * 0.12;
    pivot.rotation.x = pose.x + Math.sin(t * 0.4) * 0.03;
    const since = t - strumAt;
    vib.forEach((s, i) => {
      const amp = since > 0 && since < 1.6 ? 0.0024 * (1 - since / 1.6) * (1 + i * 0.12) : 0;
      s.position.x = s.userData.baseX + Math.sin(t * (70 + i * 9)) * amp;
    });
    renderer.render(scene, camera);
    if (performance.now() < awakeUntil || drag !== null || Math.abs(spin) > 0.0005) raf = requestAnimationFrame(frame);
  }

  function wake(seconds = 1) {
    awakeUntil = Math.max(awakeUntil, performance.now() + seconds * 1000);
    if (!raf) raf = requestAnimationFrame(frame);
  }

  // Arrastar gira; toque rápido "toca" a guitarra.
  let downAt = 0;
  let downX = 0;
  let downY = 0;
  canvasEl.addEventListener('pointerdown', (e) => {
    drag = e.clientX;
    downAt = performance.now();
    downX = e.clientX;
    downY = e.clientY;
    spin = 0;
    wake(0.5);
  });
  canvasEl.addEventListener('pointermove', (e) => {
    if (drag === null) return;
    const dx = e.clientX - drag;
    drag = e.clientX;
    spin = dx * 0.011;
    userY += spin;
    wake(0.5);
  });
  const release = (e) => {
    if (drag === null) return;
    drag = null;
    const quick = performance.now() - downAt < 260;
    const still = Math.hypot(e.clientX - downX, e.clientY - downY) < 8;
    if (e.type === 'pointerup' && quick && still) {
      strum();
      onTap?.();
    }
    wake(1.5);
  };
  canvasEl.addEventListener('pointerup', release);
  canvasEl.addEventListener('pointercancel', release);
  canvasEl.addEventListener('pointerleave', release);

  function strum() {
    strumAt = clock.getElapsedTime();
    const gsap = window.gsap;
    if (gsap) {
      gsap.fromTo(pivot.rotation, { z: pose.z + 0.05 }, { z: pose.z, duration: 0.7, ease: 'elastic.out(1, 0.35)' });
      gsap.fromTo(rim, { intensity: 6 }, { intensity: 2.4, duration: 0.9, ease: 'power2.out' });
      gsap.fromTo(glow.scale, { x: 1.15, y: 1.15 }, { x: 1, y: 1, duration: 0.9, ease: 'power2.out' });
    }
    wake(1.8);
  }

  return {
    mount(el, opts = {}) {
      host = el;
      mode = opts.mode ?? 'hero';
      onTap = opts.onTap ?? null;
      if (opts.paint) applyPaint(opts.paint);
      el.appendChild(canvasEl);
      ro.disconnect();
      io.disconnect();
      ro.observe(el);
      io.observe(el);
      visible = true;
      userY = 0;
      spin = 0;
      resize();
      pivot.position.set(0, 0, 0);
      pivot.rotation.set(pose.x, pose.y, pose.z);
      wake(2);
    },
    unmount() {
      ro.disconnect();
      io.disconnect();
      canvasEl.remove();
      host = null;
      onTap = null;
    },
    get mountedIn() { return host; },
    setPaint: applyPaint,
    strum,
    wake,

    // Entrada no topo da tela Hoje: a guitarra sobe girando, o palco acende.
    heroIntro(gsap) {
      if (!gsap) return;
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(pivot.position, { y: -2.6, z: -2 }, { y: 0, z: 0, duration: 1.4 }, 0)
        .fromTo(pivot.rotation, { y: pose.y - 2.4, z: pose.z + 0.5 }, { y: pose.y, z: pose.z, duration: 1.6 }, 0)
        .fromTo(glow.material, { opacity: 0 }, { opacity: 1, duration: 0.9 }, 0.5)
        .fromTo(rim, { intensity: 0 }, { intensity: 6, duration: 0.15, ease: 'power2.out' }, 1.0)
        .to(rim, { intensity: 2.4, duration: 1.2, ease: 'power2.out' }, 1.15)
        .call(() => { strumAt = clock.getElapsedTime(); }, null, 1.0);
      wake(tl.duration() + 3);
    },

    // Celebração: vem do fundo do palco girando; opcionalmente troca a pintura no clarão.
    stageIntro(gsap, { from, to } = {}) {
      if (from) applyPaint(from);
      if (!gsap) {
        if (to) applyPaint(to);
        return;
      }
      const tl = gsap.timeline();
      tl.fromTo(pivot.position, { z: -16 }, { z: 0, duration: 1.5, ease: 'power4.out' }, 0)
        .fromTo(pivot.rotation, { y: pose.y - Math.PI * 3, x: pose.x + 0.5 }, { y: pose.y, x: pose.x, duration: 1.8, ease: 'power3.out' }, 0)
        .fromTo(glow.material, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 1.05)
        .fromTo(glow.scale, { x: 0.6, y: 0.6 }, { x: 1, y: 1, duration: 0.9, ease: 'power3.out' }, 1.05)
        .to(rim, { intensity: 7, duration: 0.18, ease: 'power2.out' }, 1.05)
        .to(rim, { intensity: 2.4, duration: 1.2, ease: 'power2.out' }, 1.23)
        .call(() => { strumAt = clock.getElapsedTime(); }, null, 1.05);
      if (to) {
        const target = new THREE.Color(PAINTS[to].color);
        tl.to(key, { intensity: 6, duration: 0.15 }, 2.0)
          .call(() => applyPaint(to), null, 2.15)
          .fromTo(mats.paint.color, { r: 1, g: 1, b: 1 }, { r: target.r, g: target.g, b: target.b, duration: 0.8, ease: 'power2.out' }, 2.15)
          .to(key, { intensity: 2.4, duration: 0.8, ease: 'power2.out' }, 2.15);
      }
      wake(tl.duration() + 4);
    },
  };
}
