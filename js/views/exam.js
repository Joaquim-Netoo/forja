import { icon, tick } from '../ui/html.js';
import { escape } from '../markup.js';
import { formatDay } from '../dates.js';
import { LESSONS, phaseById } from '../curriculum.js';
import { examAvailable } from '../progress.js';
import { notFound } from './lesson.js';

export function exam(d, phaseId) {
  const p = phaseById(phaseId);
  if (!p) return notFound();
  const e = d.state.exams[p.id] ?? { checks: {} };
  const available = examAvailable(d.state, LESSONS, p.id);
  const items = p.exam.map((item, i) => {
    const checked = Boolean(e.checks?.[i]);
    return `<li class="${checked ? 'is-done' : ''}">
      <label class="ex-check"><input type="checkbox" data-exam="${p.id}" data-idx="${i}" ${checked ? 'checked' : ''} ${available ? '' : 'disabled'} aria-labelledby="exi-${i}">${tick()}</label>
      <span id="exi-${i}">${escape(item)}</span>
    </li>`;
  }).join('');
  const status = e.passedAt
    ? `<div class="exam-pass"><p class="done-note">${icon('check')} Aprovado em ${formatDay(e.passedAt)}. Pintura ${p.paint} conquistada.</p>
       <button class="btn ghost" type="button" data-action="replay-paint" data-phase="${p.id}">${icon('guitar')} Ver a guitarra</button></div>`
    : available ? '' : `<p class="lock-note exam-pass">${icon('lock')}<span>Conclua as aulas da fase ${p.n} para fazer a prova.</span></p>`;
  return `<a class="link-back" href="#/curso">${icon('back')} Curso</a>
    <header class="screen-head" data-enter>
      <h1>Prova de palco</h1>
      <p>Fase ${p.n}, ${p.name}. Marque cada item só quando conseguir de verdade. Passou em tudo, a fase fecha, a próxima abre e a guitarra ganha a pintura ${p.paint}.</p>
    </header>
    <ol class="exam-list" data-enter>${items}</ol>
    ${status}`;
}
