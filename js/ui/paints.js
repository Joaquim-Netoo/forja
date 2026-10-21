// Cores das pinturas fora do 3D: capas dos discos, amostras e silhueta de reserva.
export const PAINT_HEX = {
  'Madeira crua': '#b5824f',
  'Preto fosco': '#262626',
  'Vermelho-sangue': '#8a0710',
  'Branco osso': '#e9e0cc',
  'Aço escovado': '#9da3ab',
  'Ouro velho': '#a98236',
  'Obsidiana e ouro': '#0d0d0d',
};

const LIGHT = new Set(['Madeira crua', 'Branco osso', 'Aço escovado', 'Ouro velho']);
export const inkFor = (paint) => (LIGHT.has(paint) ? '#1b1612' : '#efe7da');
export const hexFor = (paint) => PAINT_HEX[paint] ?? PAINT_HEX['Madeira crua'];

// Silhueta 2D da Flying V: aparece enquanto o 3D carrega e quando não há WebGL.
export const silhouette = (paint) => `<svg viewBox="-1.25 -3.75 2.5 5.5" aria-hidden="true">
  <g transform="scale(1,-1) rotate(-28)">
    <path fill="${hexFor(paint)}" stroke="#c9a45a" stroke-width="0.025" d="M-0.24 0.44 L-1.02 -1.38 Q-1.07 -1.58 -0.86 -1.61 L-0.66 -1.57 L-0.07 -0.66 Q0 -0.56 0.07 -0.66 L0.66 -1.57 L0.86 -1.61 Q1.07 -1.58 1.02 -1.38 L0.24 0.44 Q0 0.62 -0.24 0.44Z"/>
    <rect x="-0.1" y="0.3" width="0.2" height="2.5" fill="#2b1710"/>
    <path fill="${hexFor(paint)}" stroke="#c9a45a" stroke-width="0.025" d="M-0.11 2.8 L-0.235 3.3 L-0.2 3.46 L0 3.66 L0.2 3.46 L0.235 3.3 L0.11 2.8Z"/>
    <rect x="-0.18" y="0.19" width="0.36" height="0.15" fill="#d8d8d8"/>
    <rect x="-0.18" y="-0.17" width="0.36" height="0.15" fill="#d8d8d8"/>
  </g></svg>`;
