import { icon, plural } from '../ui/html.js';
import { escape, render } from '../markup.js';
import { formatDay } from '../dates.js';
import {
  LESSONS, PHASES, lessonsOf, GUIDE,
} from '../curriculum.js';
import { isUnlocked, examAvailable } from '../progress.js';

function track(d, l) {
  const { state, current } = d;
  const idx = LESSONS.indexOf(l);
  const done = Boolean(state.lessons[l.id]?.completedAt);
  const isCurrent = current?.id === l.id;
  const open = isUnlocked(state, LESSONS, idx);
  let cls = '';
  let status = '';
  let note = l.review ? 'Revisão' : '';
  if (isCurrent) {
    cls = 'current'; status = icon('flame'); note = 'Em treino agora';
  } else if (done) {
    cls = 'done'; status = icon('check');
  } else if (open) {
    cls = 'open'; status = icon('play'); note = 'Liberada';
  } else {
    cls = 'locked'; status = icon('lock');
  }
  return `<li><a class="track ${cls}" href="#/aula/${l.id}">
    <span class="n">Aula ${l.n}</span>
    <span class="t">${escape(l.title)}${note ? `<small>${note}</small>` : ''}</span>
    <span class="s">${status}<span class="sr">${cls === 'locked' ? 'bloqueada' : ''}</span></span>
  </a></li>`;
}

function examTrack(d, p) {
  const exam = d.state.exams[p.id];
  const available = examAvailable(d.state, LESSONS, p.id);
  let note = 'Abre quando as aulas da fase estiverem concluídas';
  let status = icon('lock');
  let cls = 'locked';
  if (exam?.passedAt) {
    note = `Aprovado em ${formatDay(exam.passedAt)}`; status = icon('check'); cls = 'done';
  } else if (available) {
    note = `${p.exam.length} itens. Recompensa: pintura ${p.paint}`; status = icon('play'); cls = '';
  }
  return `<li><a class="track exam ${cls}" href="#/prova/${p.id}">
    <span class="n">Fase ${p.n}</span>
    <span class="t">Prova de palco<small>${note}</small></span>
    <span class="s">${status}</span>
  </a></li>`;
}

export function course(d) {
  const activePhase = (d.current ?? LESSONS[0]).phase;
  const phases = PHASES.map((p) => {
    const ls = lessonsOf(p.id);
    const done = ls.filter((l) => d.state.lessons[l.id]?.completedAt).length;
    return `<section class="phase ${p.id === activePhase ? 'current' : ''}" aria-labelledby="ph-${p.id}" data-enter>
      <div class="phase-head">
        <span class="phase-num" aria-hidden="true">${p.n}</span>
        <h2 id="ph-${p.id}">${p.name}</h2>
        <p>${escape(p.intro)}</p>
        <p>${done} de ${plural(ls.length, 'aula', 'aulas')} · Pintura ao passar: ${p.paint}</p>
        <div class="bar-progress" aria-hidden="true"><span style="transform: scaleX(${done / ls.length})"></span></div>
      </div>
      <ol class="tracklist">${ls.map((l) => track(d, l)).join('')}${examTrack(d, p)}</ol>
    </section>`;
  }).join('');
  return `<header class="screen-head" data-enter>
      <h1>Curso</h1>
      <p>52 aulas em 6 fases. Faça cada aula quando quiser; a seguinte abre depois de 3 treinos completos. Regras, cuidados com o corpo e recursos gratuitos estão no <a href="#/guia">guia</a>.</p>
    </header>
    <div class="phases">${phases}</div>`;
}

export function guide() {
  return `<a class="link-back" href="#/curso">${icon('back')} Curso</a>
    <header class="screen-head" data-enter><h1>Guia</h1><p>Como o curso funciona e como cuidar das mãos durante o ano.</p></header>
    <div class="prose" data-enter>${render(GUIDE)}</div>`;
}
