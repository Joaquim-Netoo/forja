import { icon } from '../ui/html.js';
import { escape } from '../markup.js';
import { formatDay } from '../dates.js';
import { LESSONS, phaseById } from '../curriculum.js';
import { examAvailable } from '../progress.js';
import { notFound } from './lesson.js';

function item(p, i, checked, available) {
  return `<li class="song ${checked ? 'is-done' : ''}">
    <div class="song-row">
      <label class="song-check"><input type="checkbox" data-exam="${p.id}" data-idx="${i}" ${checked ? 'checked' : ''} ${available ? '' : 'disabled'} aria-labelledby="exi-${i}">
        <svg viewBox="0 0 34 34" aria-hidden="true"><path class="box" d="M4 5.5 30 4l-.5 26L5 29.2Z"/><path class="mark" pathLength="60" d="M8 18l6 7L27 7"/></svg></label>
      <span class="song-title"><span class="name" id="exi-${i}">${escape(p.exam[i])}</span></span>
      <svg class="strike" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true"><path pathLength="400" vector-effect="non-scaling-stroke" d="M2 9C60 4 120 12 180 7s80-2 118 1"/></svg>
    </div>
  </li>`;
}

export function exam(d, phaseId) {
  const p = phaseById(phaseId);
  if (!p) return notFound();
  const e = d.state.exams[p.id] ?? { checks: {} };
  const available = examAvailable(d.state, LESSONS, p.id);
  const items = p.exam.map((_, i) => item(p, i, Boolean(e.checks?.[i]), available)).join('');
  let status = '';
  if (e.passedAt) {
    status = `<div class="exam-actions"><p class="done-note">${icon('check')} Aprovado em ${formatDay(e.passedAt)}. Pintura ${p.paint} conquistada.</p>
      <button class="btn ghost" type="button" data-action="replay-paint" data-phase="${p.id}">${icon('guitar')} Ver a guitarra</button></div>`;
  } else if (!available) {
    status = `<p class="lock-note">${icon('lock')}<span>Conclua as faixas do disco ${p.n} para fazer a prova.</span></p>`;
  }
  return `<a class="link-back" href="#/curso">${icon('back')} Discografia</a>
    <div class="exam">
      <div class="lanyard" aria-hidden="true"></div>
      <div class="pass-card" data-pass>
        <div class="pass-band">Acesso total</div>
        <span class="pass-num" aria-hidden="true">${p.n}</span>
        <p class="pass-name">${p.name}</p>
        <p>Prova de palco do disco ${p.n} · rende a pintura ${p.paint}</p>
        ${e.passedAt ? '<div class="stamp">Aprovado</div>' : ''}
      </div>
      <section class="paper exam-paper" aria-labelledby="ex-title">
        <span class="tape l" aria-hidden="true"></span><span class="tape r" aria-hidden="true"></span>
        <h1 id="ex-title">Prova de palco</h1>
        <p>Marque cada item só quando conseguir de verdade. Passou em tudo, o próximo disco abre e a guitarra ganha pintura nova.</p>
        <ol class="songs">${items}</ol>
      </section>
      ${status}
    </div>`;
}
