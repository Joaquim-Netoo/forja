import { MEDALS, GROUPS } from '../medals.js';
import { patchSVG } from '../ui/patch.js';
import { formatDay, dayKey } from '../dates.js';

function patch(m, when) {
  if (when) {
    return `<li class="patch" data-medal="${m.id}">${patchSVG(m, true)}
      <span class="name">${m.name}</span><span class="rule">${m.rule}</span>
      <span class="when">${formatDay(dayKey(new Date(when)))}</span></li>`;
  }
  if (m.secret) {
    return `<li class="patch locked">${patchSVG(m, false)}
      <span class="name">Secreta</span><span class="rule">Continue treinando.</span></li>`;
  }
  return `<li class="patch locked">${patchSVG(m, false)}
    <span class="name">${m.name}</span><span class="rule">${m.rule}</span></li>`;
}

export function medals(d) {
  const got = MEDALS.filter((m) => d.state.medals[m.id]).length;
  const groups = GROUPS.map((g) => {
    const list = MEDALS.filter((m) => m.group === g.id);
    const n = list.filter((m) => d.state.medals[m.id]).length;
    return `<section class="patch-group" aria-labelledby="g-${g.id}" data-enter>
      <h2 id="g-${g.id}">${g.name}<span>${n} de ${list.length}</span></h2>
      <ul class="patches">${list.map((m) => patch(m, d.state.medals[m.id])).join('')}</ul>
    </section>`;
  }).join('');
  return `<header class="screen-head" data-enter>
      <h1>Jaqueta</h1>
      <p>${got} de ${MEDALS.length} patches costurados. Cada medalha é um patch: ofensiva, fases, marcos de técnica e algumas secretas.</p>
    </header>
    <div class="jacket">${groups}</div>`;
}
