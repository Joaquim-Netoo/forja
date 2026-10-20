import { icon, tick, plural, fmtNum } from '../ui/html.js';
import {
  addDays, weekday, weekdayShort, formatDay, diffDays,
} from '../dates.js';
import { escape } from '../markup.js';
import { RESERVE_MAX } from '../streak.js';
import { REQUIRED_DAYS } from '../progress.js';
import { phaseById } from '../curriculum.js';

function stateLine({ streak: s, t, current }) {
  if (!current) return '<p class="streak-state">Conclua a primeira aula para liberar o treino e acender a ofensiva.</p>';
  if (s.todayDone) return '<p class="streak-state done">Treino de hoje feito. <strong>A chama está acesa.</strong></p>';
  if (weekday(t) === 0) return '<p class="streak-state">Domingo é descanso. Treinar conta; não treinar não quebra nada.</p>';
  if (s.streak === 0) return '<p class="streak-state">Conclua o treino de hoje para acender a ofensiva.</p>';
  return '<p class="streak-state">Falta o treino de hoje para manter a chama.</p>';
}

function weekStrip({ t, state, streak }) {
  const saved = new Set(streak.savedDays);
  const items = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = addDays(t, -i);
    let cls = 'missed';
    let mark = '';
    let label = 'sem treino';
    if (state.log[d]?.done) {
      cls = 'done'; mark = '<svg viewBox="0 0 24 24"><use href="#i-check"/></svg>'; label = 'treinou';
    } else if (d === t) {
      cls = 'is-today'; label = 'hoje, ainda sem treino';
    } else if (saved.has(d)) {
      cls = 'saved'; mark = '<svg viewBox="0 0 24 24"><use href="#i-pick"/></svg>'; label = 'salvo pela palheta reserva';
    } else if (weekday(d) === 0) {
      cls = 'rest'; mark = '–'; label = 'descanso';
    }
    items.push(`<li class="${cls}"><span class="day" aria-hidden="true">${mark}</span>`
      + `<span aria-hidden="true">${weekdayShort(d)}</span><span class="sr">${formatDay(d)}: ${label}</span></li>`);
  }
  return `<ol class="week" aria-label="Últimos 7 dias">${items.join('')}</ol>`;
}

export function streakBlock(d) {
  const s = d.streak;
  const cold = s.streak === 0;
  const picks = Array.from({ length: RESERVE_MAX }, (_, i) => `<svg class="pick ${i < s.reserves ? '' : 'empty'}" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-pick"/></svg>`).join('');
  const nextPick = s.reserves >= RESERVE_MAX ? 'Bolso cheio' : plural(s.untilReserve, 'treino', 'treinos');
  return `<section class="streak" id="streak" aria-label="Ofensiva" data-enter>
    <div class="monument">
      <span class="monument-num ${cold ? 'cold' : ''}" data-streak style="--digits: ${Math.max(2, String(s.streak).length)}">${s.streak}</span>
      <p class="monument-label"><span class="flame-box"><svg class="flame ${cold ? 'cold' : ''}" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-flame"/></svg></span>${s.streak === 1 ? 'dia de' : 'dias de'}<br>ofensiva</p>
    </div>
    ${stateLine(d)}
    <dl class="facts">
      <div><dt>Recorde</dt><dd>${s.record}</dd></div>
      <div><dt>Palhetas reserva</dt><dd aria-label="${s.reserves} de ${RESERVE_MAX}">${picks}</dd></div>
      <div><dt>Próxima palheta</dt><dd>${nextPick}</dd></div>
    </dl>
    ${weekStrip(d)}
  </section>`;
}

const hit = (e, v) => v !== undefined && e.target !== undefined && (e.lower ? v <= e.target : v >= e.target);

function exRow(e, sess) {
  const checked = Boolean(sess.checks[e.id]);
  const v = sess.values[e.id];
  const goal = e.target !== undefined
    ? `<span class="goal"><small>Meta</small> ${e.lower ? 'até ' : ''}${fmtNum(e.target)} ${e.unit}</span>` : '';
  const result = e.unit
    ? `<label class="result">Hoje <input type="number" inputmode="decimal" min="0" step="any" value="${v ?? ''}" data-value="${e.id}" aria-label="Resultado de hoje, em ${e.unit}"> ${e.unit}${hit(e, v) ? ' <span class="hit">bateu</span>' : ''}</label>` : '';
  let tool = '';
  if (e.tool === 'metronome') tool = `<button class="tool" type="button" data-action="metronome" data-ex="${e.id}">${icon('metronome')} Metrônomo</button>`;
  if (e.tool === 'minute') tool = `<button class="tool" type="button" data-action="timer" data-ex="${e.id}">${icon('timer')} 1 minuto</button>`;
  return `<li class="ex ${checked ? 'is-done' : ''}" data-row="${e.id}">
    <label class="ex-check"><input type="checkbox" data-check="${e.id}" ${checked ? 'checked' : ''} aria-labelledby="exn-${e.id}">${tick()}</label>
    <div>
      <p class="ex-name" id="exn-${e.id}">${escape(e.name)}</p>
      <p class="ex-how">${escape(e.how)}</p>
      ${goal || result || tool ? `<div class="ex-tools">${goal}${result}${tool}</div>` : ''}
    </div>
  </li>`;
}

// Se o dia já contou com a lista de outra aula, a lista nova é bônus.
export const dayDoneBanner = (listDone = true) => `<p class="day-done">${icon('check')} ${listDone ? 'Treino do dia concluído' : 'Ofensiva de hoje garantida'}</p>`;

export function countLabel(d) {
  const n = d.exercises.filter((e) => d.sess.checks[e.id]).length;
  return { text: `${n} de ${d.exercises.length}`, full: n === d.exercises.length };
}

function setlist(d) {
  const { current, exercises, sess } = d;
  const c = countLabel(d);
  return `<section class="setlist" aria-labelledby="sl-title" data-enter>
    <div class="setlist-head">
      <div>
        <h2 id="sl-title">Treino de hoje</h2>
        <p>Exercícios da <a href="#/aula/${current.id}">aula ${current.n}: ${escape(current.title)}</a></p>
      </div>
      <span class="progress-count ${c.full ? 'full' : ''}" data-count>${c.text}</span>
    </div>
    <ol class="exercises">${exercises.map((e) => exRow(e, sess)).join('')}</ol>
    <div data-daydone>${d.streak.todayDone ? dayDoneBanner(sess.done) : ''}</div>
  </section>`;
}

function start() {
  return `<section class="start" data-enter>
    <h2>Primeira aula</h2>
    <p>Conheça a guitarra e afine. Concluir a aula libera seu primeiro treino, e o primeiro treino acende a ofensiva.</p>
    <a class="btn" href="#/aula/L1">Abrir aula 1 ${icon('play')}</a>
  </section>`;
}

function nextCard(d) {
  const { next, state } = d;
  if (!d.current) return '';
  if (!next) {
    return `<section class="next" data-enter><h2>Curso completo</h2>
      <p>As 52 aulas estão feitas. Continue a lista atual para manter a chama e escolha um estilo para se aprofundar.</p></section>`;
  }
  const { lesson, unlocked, daysLeft, examNeeded } = next;
  if (unlocked) {
    return `<section class="next" data-enter><h2>Aula ${lesson.n} liberada</h2>
      <p>${escape(lesson.title)}. ${escape(lesson.goal)}</p>
      <a class="btn" href="#/aula/${lesson.id}">Abrir aula ${lesson.n} ${icon('play')}</a></section>`;
  }
  if (daysLeft > 0) {
    const doneDays = REQUIRED_DAYS - daysLeft;
    const pips = Array.from({ length: REQUIRED_DAYS }, (_, i) => `<span class="${i < doneDays ? 'on' : ''}"></span>`).join('');
    return `<section class="next" data-enter><h2>Próxima: aula ${lesson.n}</h2>
      <div class="pips" role="img" aria-label="${doneDays} de ${REQUIRED_DAYS} treinos feitos">${pips}</div>
      <p>${escape(lesson.title)}. Abre depois de mais ${plural(daysLeft, 'treino completo', 'treinos completos')} com a lista atual${examNeeded ? ' e da prova de palco desta fase' : ''}.</p></section>`;
  }
  const phase = phaseById(examNeeded);
  const passedLabel = state.exams[examNeeded]?.checks ? 'Continuar a prova' : 'Fazer a prova';
  return `<section class="next" data-enter><h2>Prova de palco</h2>
    <p>Para abrir a aula ${lesson.n}, passe na prova da fase ${phase.n}: ${phase.name}. Passou, a guitarra ganha a pintura ${phase.paint}.</p>
    <a class="btn" href="#/prova/${examNeeded}">${passedLabel}</a></section>`;
}

function nudge({ state, t }) {
  const days = Object.keys(state.log).filter((k) => state.log[k].done).length;
  const last = state.settings.lastBackup;
  const stale = last ? diffDays(last, t) >= 14 : days >= 3;
  if (!stale) return '';
  const msg = last ? `Último backup em ${formatDay(last)}.` : 'Você ainda não fez backup.';
  return `<div class="nudge" data-enter><p>${msg} Seu progresso fica só neste navegador.</p>
    <button class="btn small ghost" type="button" data-action="export">${icon('download')} Fazer backup</button></div>`;
}

export function today(d) {
  return `<div class="today">
    ${streakBlock(d)}
    <div>
      ${d.current ? setlist(d) : start()}
      ${nextCard(d)}
      ${nudge(d)}
    </div>
  </div>`;
}
