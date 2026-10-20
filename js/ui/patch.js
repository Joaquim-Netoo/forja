// Patches bordados da jaqueta, desenhados em SVG (caixa de 120 × 120).
// A linha de costura fica numa máscara para poder ser "costurada" na animação.

const SHAPES = {
  round: { outer: 'M60 4a56 56 0 1 1 0 112a56 56 0 1 1 0-112Z', stitch: 'M60 13a47 47 0 1 1 0 94a47 47 0 1 1 0-94Z' },
  shield: {
    outer: 'M60 4 110 20v38c0 31-21 50-50 60C31 108 10 89 10 58V20Z',
    stitch: 'M60 13 101 26v32c0 26-17 42-41 51C36 100 19 84 19 58V26Z',
  },
  tab: {
    outer: 'M18 14h84l12 12v68l-12 12H18L6 94V26Z',
    stitch: 'M22 22h76l8 8v60l-8 8H22l-8-8V30Z',
  },
  diamond: { outer: 'M60 2 118 60 60 118 2 60Z', stitch: 'M60 14 106 60 60 106 14 60Z' },
};

const STAR = (cx, cy, r1, r2) => {
  const pts = [];
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 ? r2 : r1;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
};

// Cada glifo recebe a cor do bordado (g) e a cor do fundo (f) para recortes.
const GLYPHS = {
  spark: (g) => `<path fill="${g}" d="M60 24l7 27 27 9-27 9-7 27-7-27-27-9 27-9Z"/>`,
  flame: (g) => `<path fill="${g}" transform="translate(27 24) scale(2.75)" d="M12 2.5c.6 3.2-1.4 4.8-2.9 6.6C7.6 10.9 6.5 12.6 6.5 15a5.5 5.5 0 0 0 11 0c0-2.1-.9-3.7-2-5 .1 1.6-.5 2.7-1.6 3.2.4-3.6-.4-7.6-1.9-10.7Z"/>`,
  anvil: (g) => `<path fill="${g}" d="M22 42h62l12-6v10c0 8-7 13-16 13h-8v8l10 9H38l10-9v-8h-8c-11 0-18-6-18-17Z"/>`,
  road: (g, f) => `<path fill="${g}" d="M44 94 55 26h10l11 68Z"/><path stroke="${f}" stroke-width="3" d="M60 34v8m0 10v10m0 10v12"/>`,
  skull: (g, f) => `<path fill="${g}" d="M60 26c-17 0-28 12-28 27 0 9 4 15 10 18v11h36V71c6-3 10-9 10-18 0-15-11-27-28-27Z"/>`
    + `<circle cx="49" cy="54" r="7" fill="${f}"/><circle cx="71" cy="54" r="7" fill="${f}"/><path fill="${f}" d="m60 62 4 7h-8Z"/>`
    + `<path stroke="${f}" stroke-width="2.5" d="M53 75v7m7-7v7m7-7v7"/>`,
  bolt: (g) => `<path fill="${g}" d="M68 20 38 64h18l-6 36 32-48H64Z"/>`,
  crown: (g, f) => `<path fill="${g}" d="M28 82V42l16 15 16-25 16 25 16-15v40Z"/><circle cx="60" cy="70" r="5" fill="${f}"/>`,
  pick: (g) => `<path fill="${g}" d="M60 98C49 89 30 66 30 47c0-14 13-22 30-22s30 8 30 22c0 19-19 42-30 51Z"/>`,
  chord: (g) => `<path fill="none" stroke="${g}" stroke-width="4" d="M38 28h44M38 28v62M53 28v62M67 28v62M82 28v62M38 48h44M38 68h44"/>`
    + `<circle cx="53" cy="38" r="6" fill="${g}"/><circle cx="67" cy="58" r="6" fill="${g}"/><circle cx="82" cy="58" r="6" fill="${g}"/>`,
  hammer: (g) => `<g transform="rotate(-32 60 60)"><path fill="${g}" d="M36 30h46v20H36z"/><path fill="${g}" d="M55 50h10v48H55z"/></g>`,
  star: (g) => `<path fill="${g}" d="${STAR(60, 61, 36, 14)}"/>`,
  neck: (g, f) => `<path fill="${g}" d="M50 18h20l-3 22H53Z"/><path fill="${g}" d="M54 40h12v58H54Z"/>`
    + `<circle cx="45" cy="24" r="4" fill="${g}"/><circle cx="45" cy="34" r="4" fill="${g}"/><circle cx="75" cy="24" r="4" fill="${g}"/><circle cx="75" cy="34" r="4" fill="${g}"/>`
    + `<path stroke="${f}" stroke-width="2" d="M54 54h12M54 66h12M54 77h12M54 87h12"/>`,
  amp: (g, f) => `<path fill="${g}" d="M30 34h60v52H30Z"/><path fill="${f}" d="M36 50h48v30H36Z"/>`
    + `<circle cx="42" cy="42" r="3" fill="${f}"/><circle cx="52" cy="42" r="3" fill="${f}"/><circle cx="62" cy="42" r="3" fill="${f}"/>`
    + `<path stroke="${g}" stroke-width="2" d="M40 58h40M40 65h40M40 72h40"/>`,
  vinyl: (g, f) => `<circle cx="60" cy="60" r="32" fill="${g}"/><circle cx="60" cy="60" r="22" fill="none" stroke="${f}" stroke-width="1.5"/><circle cx="60" cy="60" r="11" fill="${f}"/><circle cx="60" cy="60" r="3" fill="${g}"/>`,
  spider: (g) => `<ellipse cx="60" cy="64" rx="11" ry="14" fill="${g}"/><circle cx="60" cy="46" r="8" fill="${g}"/>`
    + `<path fill="none" stroke="${g}" stroke-width="4" d="M50 56 34 44l-6 8M50 64H30l-4 10M50 70 36 82l2 10M52 75l-8 18M70 56l16-12 6 8M70 64h20l4 10M70 70l14 12-2 10M68 75l8 18"/>`,
  moon: (g, f) => `<circle cx="60" cy="60" r="30" fill="${g}"/><circle cx="74" cy="50" r="26" fill="${f}"/>`,
  horns: (g) => `<path fill="${g}" d="M38 94c-9-22-9-48 6-70-2 22 4 40 16 52Z"/><path fill="${g}" d="M82 94c9-22 9-48-6-70 2 22-4 40-16 52Z"/>`,
  vault: (g, f) => `<path fill="${g}" d="M30 30h60v14H30ZM34 48h52v42H34Z"/><path fill="${f}" d="M52 58h16v8H52Z"/>`,
};

const PALETTE = {
  ofensiva: { field: '#8e161c', thread: '#c9a45a', glyph: '#f2ece2' },
  fases: { field: '#14110e', thread: '#c9a45a', glyph: '#c9a45a' },
  marcos: { field: '#3a3f46', thread: '#c7ccd2', glyph: '#f2ece2' },
  secretas: { field: '#b48a3e', thread: '#14110e', glyph: '#14110e' },
};

let seq = 0;

export function patchSVG(medal, unlocked) {
  const shape = SHAPES[medal.shape] ?? SHAPES.round;
  const id = `st${(seq += 1)}`;
  if (!unlocked) {
    const glyph = medal.secret
      ? '<text x="60" y="76" text-anchor="middle" font-size="46" font-weight="900" fill="#3a332b" font-family="Chivo, sans-serif">?</text>'
      : `<g opacity="0.55">${GLYPHS[medal.glyph]('#3a332b', '#0c0a08')}</g>`;
    return `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="${shape.outer}" fill="#0c0a08"/>`
      + `<path d="${shape.stitch}" fill="none" stroke="#3a332b" stroke-width="2.5" stroke-dasharray="5 4"/>${glyph}</svg>`;
  }
  const c = PALETTE[medal.group];
  return `<svg viewBox="0 0 120 120" aria-hidden="true" class="patch-art">`
    + `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">`
    + `<path class="sew" d="${shape.stitch}" fill="none" stroke="#fff" stroke-width="8" pathLength="100"/></mask></defs>`
    + `<path d="${shape.outer}" fill="${c.field}"/>`
    + `<path d="${shape.outer}" fill="none" stroke="${c.thread}" stroke-width="5"/>`
    + `<path d="${shape.stitch}" fill="none" stroke="${c.thread}" stroke-width="2.5" stroke-dasharray="5 4" mask="url(#${id})"/>`
    + `<g class="glyph">${GLYPHS[medal.glyph](c.glyph, c.field)}</g></svg>`;
}
