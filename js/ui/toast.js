import { patchSVG } from './patch.js';
import { sew, fadeIn, fadeOut } from './motion.js';
import { escape } from '../markup.js';
import { plural } from './html.js';

const MAX_PATCHES = 3;
const box = () => document.getElementById('toasts');

function show(html, ms) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.innerHTML = html;
  box().append(el);
  const remove = () => fadeOut(el, () => el.remove());
  const timer = setTimeout(remove, ms);
  el.addEventListener('click', () => { clearTimeout(timer); remove(); });
  return el;
}

// Até 3 patches costurados na tela; o resto vira um resumo.
export function toastMedals(list) {
  list.slice(0, MAX_PATCHES).forEach((m, i) => setTimeout(() => {
    const el = show(`<span class="toast-art">${patchSVG(m, true)}</span><div><strong>${escape(m.name)}</strong><span>Patch novo · ${escape(m.rule)}</span></div>`, 5200);
    fadeIn(el);
    sew(el.querySelector('.toast-art'), 0.1);
  }, i * 900));
  const rest = list.length - MAX_PATCHES;
  if (rest > 0) {
    setTimeout(() => toastText(`E mais ${plural(rest, 'patch', 'patches')}`, 'Veja todos na jaqueta, em Medalhas.'), MAX_PATCHES * 900);
  }
}

export function toastText(title, text) {
  const el = show(`<span></span><div><strong>${escape(title)}</strong><span>${escape(text)}</span></div>`, 4200);
  el.style.gridTemplateColumns = '0 1fr';
  fadeIn(el);
}
