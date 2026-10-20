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
  if (left > 0) return `Abre depois de mais ${plural(left, 'treino completo', 'treinos completos')} da aula ${prev.n}. Pode ler à vontade.`;
  const phase = phaseById(prev.phase);
  return `Passe na prova de palco da fase ${phase.n} para abrir. Pode ler à vontade.`;
}

export function notFound() {
  return `<header class="screen-head"><h1>Não achei</h1><p>Essa página não existe. <a href="#/hoje">Voltar para hoje</a>.</p></header>`;
}

export function lesson(d, id) {
  const l = lessonById(id);
  if (!l) return notFound();
  const { state } = d;
  const idx = LESSONS.indexOf(l);
  const phase = phaseById(l.phase);
  const done = state.lessons[l.id]?.completedAt;
  const open = isUnlocked(state, LESSONS, idx);
  const plan = exercisesFor(l).map((e) => `<li><span class="ex-name">${escape(e.name)}</span>`
    + `${e.target !== undefined ? `<span class="goal">Meta ${e.lower ? 'até ' : ''}${fmtNum(e.target)} ${e.unit}</span>` : ''}</li>`).join('');

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

  return `<div class="lesson">
    <article>
      <a class="link-back" href="#/curso">${icon('back')} Curso</a>
      <header class="lesson-head" data-enter>
        <h1>${escape(l.title)}</h1>
        <p class="goal-line">${escape(l.goal)}</p>
        <p class="meta">Aula ${l.n} de ${LESSONS.length}${l.review ? ', revisão' : ''} · Fase ${phase.n}, ${phase.name}</p>
      </header>
      <div class="prose" data-enter>${render(l.body)}</div>
      ${pager}
    </article>
    <aside class="lesson-aside" aria-labelledby="plan-title" data-enter>
      <h2 id="plan-title">Treino até a próxima</h2>
      <p class="muted">Ao concluir, estes exercícios viram o seu treino de cada dia.</p>
      <ol class="plan">${plan}</ol>
      ${action}
    </aside>
  </div>`;
}
