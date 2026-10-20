// Formato das aulas: blocos separados por linha em branco.
//   ## Título            → subtítulo
//   - item               → lista
//   1. item              → lista numerada
//   ~~~ ... ~~~          → TAB / bloco pré-formatado (``` também vale)
//   | a | b |            → tabela (primeira linha é o cabeçalho)
//   @acordes             → diagramas: uma linha por acorde "Nome casas dedos"
//   qualquer outra coisa → parágrafo. **negrito** funciona em todos.

export const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) => escape(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

function splitBlocks(src) {
  const lines = src.replace(/\r/g, '').split('\n');
  const blocks = [];
  let cur = [];
  let fenced = false;
  for (const line of lines) {
    if (line.trim().startsWith('```') || line.trim().startsWith('~~~')) {
      if (fenced) {
        blocks.push({ pre: cur.join('\n') });
        cur = [];
      } else if (cur.length) {
        blocks.push(cur);
        cur = [];
      }
      fenced = !fenced;
    } else if (fenced) {
      cur.push(line);
    } else if (!line.trim()) {
      if (cur.length) blocks.push(cur);
      cur = [];
    } else {
      cur.push(line.trim());
    }
  }
  if (cur.length) blocks.push(fenced ? { pre: cur.join('\n') } : cur);
  return blocks;
}

const cells = (row) => row.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

function table(rows) {
  const [head, ...body] = rows;
  return `<div class="table-wrap"><table><thead><tr>${cells(head).map((c) => `<th scope="col">${inline(c)}</th>`).join('')}</tr></thead>`
    + `<tbody>${body.map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

// Diagrama de acorde: cordas na vertical (6 à esquerda), trastes na horizontal.
export function chordSVG(name, frets, fingers = '') {
  const f = [...frets].map((c) => (c === 'x' ? -1 : Number(c)));
  const pressed = f.filter((n) => n > 0);
  const maxF = pressed.length ? Math.max(...pressed) : 0;
  const minF = pressed.length ? Math.min(...pressed) : 0;
  const base = maxF > 4 ? minF : 1;
  const w = 88; const h = 112; const x0 = 14; const y0 = 26; const gap = 12; const fretH = 16;
  const sx = (i) => x0 + i * gap;
  const fy = (n) => y0 + (n - base) * fretH + fretH / 2;
  let out = `<figure class="chord"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Acorde ${escape(name)}: ${frets}">`;
  out += `<rect x="${x0}" y="${y0 - (base === 1 ? 3 : 0)}" width="${gap * 5}" height="${base === 1 ? 3 : 0}" class="nut"/>`;
  for (let i = 0; i < 6; i += 1) out += `<line x1="${sx(i)}" y1="${y0}" x2="${sx(i)}" y2="${y0 + fretH * 5}" class="str"/>`;
  for (let j = 0; j <= 5; j += 1) out += `<line x1="${x0}" y1="${y0 + j * fretH}" x2="${x0 + gap * 5}" y2="${y0 + j * fretH}" class="fret"/>`;
  f.forEach((n, i) => {
    if (n < 0) out += `<text x="${sx(i)}" y="${y0 - 8}" class="mark">×</text>`;
    else if (n === 0) out += `<circle cx="${sx(i)}" cy="${y0 - 11}" r="3.4" class="open"/>`;
    else {
      out += `<circle cx="${sx(i)}" cy="${fy(n)}" r="5.4" class="dot"/>`;
      const fin = fingers[i];
      if (fin && /\d/.test(fin)) out += `<text x="${sx(i)}" y="${fy(n) + 3.4}" class="fin">${fin}</text>`;
    }
  });
  if (base > 1) out += `<text x="${x0 + gap * 5 + 6}" y="${fy(base) + 4}" class="base">${base}ª</text>`;
  out += `</svg><figcaption>${escape(name)}</figcaption></figure>`;
  return out;
}

function chords(rows) {
  return `<div class="chords">${rows.slice(1).map((r) => {
    const [name, frets, fingers] = r.split(/\s+/);
    return chordSVG(name, frets, fingers);
  }).join('')}</div>`;
}

export function render(src) {
  return splitBlocks(src).map((b) => {
    if (b.pre !== undefined) return `<pre class="tab"><code>${escape(b.pre)}</code></pre>`;
    if (b[0] === '@acordes') return chords(b);
    if (b[0].startsWith('## ')) {
      const rest = b.slice(1);
      return `<h3>${inline(b[0].slice(3))}</h3>${rest.length ? render(rest.join('\n')) : ''}`;
    }
    if (b.every((l) => l.startsWith('- '))) return `<ul>${b.map((l) => `<li>${inline(l.slice(2))}</li>`).join('')}</ul>`;
    if (b.every((l) => /^\d+\.\s/.test(l))) return `<ol>${b.map((l) => `<li>${inline(l.replace(/^\d+\.\s/, ''))}</li>`).join('')}</ol>`;
    if (b.every((l) => l.startsWith('|'))) return table(b);
    return `<p>${inline(b.join(' '))}</p>`;
  }).join('');
}
