import { icon, plural } from '../ui/html.js';
import { escape, render } from '../markup.js';
import { formatDay } from '../dates.js';
import {
  LESSONS, PHASES, lessonsOf, GUIDE,
} from '../curriculum.js';
import { isUnlocked, examAvailable } from '../progress.js';
import { hexFor, inkFor } from '../ui/paints.js';

function track(d, l) {
  const { state, current } = d;
  const done = Boolean(state.lessons[l.id]?.completedAt);
  const open = isUnlocked(state, LESSONS, LESSONS.indexOf(l));
  let cls = 'locked';
  let status = icon('lock');
  let note = l.review ? 'Revisão' : '';
  let sr = 'bloqueada';
  if (current?.id === l.id) {
    cls = 'current'; status = icon('flame'); note = 'No setlist agora'; sr = 'em treino';
  } else if (done) {
    cls = 'done'; status = icon('check'); sr = 'concluída';
  } else if (open) {
    cls = 'open'; status = icon('play'); note = 'Liberada'; sr = 'liberada';
  }
  return `<li><a class="track ${cls}" href="#/aula/${l.id}" aria-label="Aula ${l.n}: ${escape(l.title)}, ${sr}">
    <span class="n" aria-hidden="true">${l.n}</span>
    <span class="t" aria-hidden="true">${escape(l.title)}${note ? `<small>${note}</small>` : ''}</span>
    <span class="s" aria-hidden="true">${status}</span>
  </a></li>`;
}

function passTrack(d, p) {
  const exam = d.state.exams[p.id];
  const available = examAvailable(d.state, LESSONS, p.id);
  let note = 'Abre quando as faixas do disco estiverem feitas';
  let status = icon('lock');
  let cls = 'locked';
  if (exam?.passedAt) {
    note = `Aprovado em ${formatDay(exam.passedAt)}`; status = icon('check'); cls = 'done';
  } else if (available) {
    note = `${p.exam.length} itens · rende a pintura ${p.paint}`; status = icon('play'); cls = 'open';
  }
  return `<li><a class="track pass ${cls}" href="#/prova/${p.id}">
    <span class="n" aria-hidden="true">${icon('patch')}</span>
    <span class="t">Passe de backstage<small>${note}</small></span>
    <span class="s" aria-hidden="true">${status}</span>
  </a></li>`;
}

export function course(d) {
  const activePhase = (d.current ?? LESSONS[0]).phase;
  const albums = PHASES.map((p) => {
    const ls = lessonsOf(p.id);
    const done = ls.filter((l) => d.state.lessons[l.id]?.completedAt).length;
    const anyOpen = ls.some((l) => isUnlocked(d.state, LESSONS, LESSONS.indexOf(l)));
    const cls = [p.id === activePhase ? 'current' : '', anyOpen || done ? '' : 'future'].join(' ');
    return `<section class="album ${cls}" style="--cover: ${hexFor(p.paint)}; --cover-ink: ${inkFor(p.paint)}" aria-labelledby="al-${p.id}">
      <div class="cover" aria-hidden="true"><span class="cover-name">${p.name}</span><span class="cover-num">${p.n}</span></div>
      <div class="album-meta">
        <h2 id="al-${p.id}">${p.name}</h2>
        <p>${escape(p.intro)}</p>
        <p class="progress">${done} de ${plural(ls.length, 'faixa', 'faixas')} · rende ${p.paint}</p>
        <div class="meter" aria-hidden="true"><span style="transform: scaleX(${done / ls.length})"></span></div>
      </div>
      <ol class="tracks">${ls.map((l) => track(d, l)).join('')}${passTrack(d, p)}</ol>
    </section>`;
  }).join('');
  return `<header class="page-head">
      <h1>Discografia</h1>
      <p>52 faixas em 6 discos. Cada disco fecha com um passe de backstage e rende uma pintura nova para a guitarra. Regras e recursos no <a href="#/guia">guia do curso</a>.</p>
    </header>
    <div class="albums">${albums}</div>`;
}

export function guide() {
  return `<a class="link-back" href="#/curso">${icon('back')} Discografia</a>
    <header class="page-head"><h1>Guia</h1><p>Como o curso funciona e como cuidar das mãos durante o ano.</p></header>
    <article class="paper liner"><div class="prose">${render(GUIDE)}</div></article>`;
}
