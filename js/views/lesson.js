import { icon, fmtNum, plural } from '../ui/html.js';
import { escape, render } from '../markup.js';
import { formatDay } from '../dates.js';
import {
  LESSONS, lessonById, phaseById, exercisesFor,
} from '../curriculum.js';
import { isUnlocked, practiceCount, REQUIRED_DAYS } from '../progress.js';

function lockReason(state, idx) {
  const prev = LESSONS[idx - 1];
  if (!state.lessons[prev.id]?.completedAt) return `Conclua a aula ${prev.n} antes. Pode ler esta à vontade.`;
  const left = REQUIRED_DAYS - practiceCount(state, prev.id);
  if (left > 0) return `Abre depois de mais ${plural(left, 'setlist fechado', 'setlists fechados')} da aula ${prev.n}. Pode ler à vontade.`;
  const phase = phaseById(prev.phase);
  return `Passe no backstage da fase ${phase.n} para abrir. Pode ler à vontade.`;
}

export function notFound() {
  return `<header class="page-head"><h1>Não achei</h1><p>Essa página não existe. <a href="#/hoje">Voltar para hoje</a>.</p></header>`;
}

export function lesson(d, id) {
  const l = lessonById(id);
  if (!l) return notFound();
  const { state } = d;
  const idx = LESSONS.indexOf(l);
  const phase = phaseById(l.phase);
  const done = state.lessons[l.id]?.completedAt;
  const open = isUnlocked(state, LESSONS, idx);
  const plan = exercisesFor(l).map((e) => `<li>${escape(e.name)}`
    + `${e.target !== undefined ? `<span>Meta ${e.lower ? 'até ' : ''}${fmtNum(e.target)} ${e.unit}</span>` : ''}</li>`).join('');

  let action;
  if (done) {
    action = `<div class="complete-bar">
      <p class="done-note">${icon('check')} Concluída em ${formatDay(done)}</p>
      <button class="btn ghost" type="button" data-action="replay" data-lesson="${l.id}">${icon('guitar')} Ver a guitarra</button>
    </div>`;
  } else if (open) {
    action = `<div class="complete-bar floating">
      <button class="btn" type="button" data-action="complete" data-lesson="${l.id}">Concluir aula ${l.n}</button>
    </div>`;
  } else {
    action = `<p class="lock-note">${icon('lock')}<span>${lockReason(state, idx)}</span></p>`;
  }

  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];
  const pager = `<nav class="pager" aria-label="Outras aulas">
    ${prev ? `<a class="link-back" href="#/aula/${prev.id}">${icon('back')} Aula ${prev.n}</a>` : '<span></span>'}
    ${next ? `<a class="link-back" href="#/aula/${next.id}">Aula ${next.n} ${icon('back', 'flip')}</a>` : ''}
  </nav>`;

  return `<div class="read-progress" data-progress aria-hidden="true"></div>
    <a class="link-back" href="#/curso">${icon('back')} Discografia</a>
    <header class="lesson-stage">
      <span class="lesson-num" aria-hidden="true">${l.n}</span>
      <h1>${escape(l.title)}</h1>
      <p class="goal-line">${escape(l.goal)}</p>
      <p class="meta">Faixa ${l.n} de ${LESSONS.length}${l.review ? ', revisão' : ''} · Disco ${phase.n}, ${phase.name}</p>
    </header>
    <div class="lesson-body">
      <article class="paper liner"><div class="prose">${render(l.body)}</div>${pager}</article>
      <aside class="lesson-side" aria-labelledby="plan-title">
        <section class="paper plan-paper">
          <span class="tape l" aria-hidden="true"></span>
          <h2 id="plan-title">Setlist</h2>
          <ol>${plan}</ol>
        </section>
        ${action}
      </aside>
    </div>`;
}
