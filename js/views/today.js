import { icon, plural, fmtNum } from '../ui/html.js';
import {
  addDays, weekday, weekdayShort, formatDay, diffDays,
} from '../dates.js';
import { escape } from '../markup.js';
import { RESERVE_MAX } from '../streak.js';
import { REQUIRED_DAYS } from '../progress.js';
import { phaseById } from '../curriculum.js';
import { silhouette } from '../ui/paints.js';

// ── Palco ───────────────────────────────────────────────────────────────
function stateLine({ streak: s, t, current }) {
  if (!current) return 'Conclua a primeira aula para liberar o setlist e acender a chama.';
  if (s.todayDone) return 'Treino de hoje feito. <strong>A chama está acesa.</strong>';
  if (weekday(t) === 0) return 'Domingo é descanso. Treinar conta; não treinar não quebra nada.';
  if (s.streak === 0) return 'Feche o setlist de hoje para acender a chama.';
  return 'Falta fechar o setlist de hoje para manter a chama.';
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

export function heroCopy(d) {
  const n = d.streak.streak;
  const cold = n === 0;
  return `<p class="hero-label"><svg class="flame ${cold ? 'cold' : ''}" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-flame"/></svg>`
    + `<span class="sr">${n} </span>${n === 1 ? 'dia' : 'dias'} de ofensiva</p>`;
}

function hero(d) {
  const n = d.streak.streak;
  return `<section class="hero" aria-label="Ofensiva e guitarra">
    <div class="hero-number ${n === 0 ? 'cold' : ''}" aria-hidden="true" data-number>${n}</div>
    <div class="hero-canvas" data-guitar-host><div class="fallback">${silhouette(d.paint)}</div></div>
    <div class="hero-copy" data-hero-copy>${heroCopy(d)}</div>
    <p class="hero-hint" data-hint hidden>Arraste para girar · toque para tocar</p>
    <div class="sparks" aria-hidden="true" data-sparks></div>
  </section>`;
}

export function stats(d) {
  const s = d.streak;
  const picks = Array.from({ length: RESERVE_MAX }, (_, i) => `<svg class="pick ${i < s.reserves ? '' : 'empty'}" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-pick"/></svg>`).join('');
  const nextPick = s.reserves >= RESERVE_MAX ? 'Bolso cheio' : plural(s.untilReserve, 'treino', 'treinos');
  return `<div class="stats" data-stats>
    <p class="hero-state">${stateLine(d)}</p>
    <dl class="facts">
      <div><dt>Recorde</dt><dd>${s.record}</dd></div>
      <div><dt>Palhetas reserva</dt><dd aria-label="${s.reserves} de ${RESERVE_MAX}">${picks}</dd></div>
      <div><dt>Próxima palheta</dt><dd>${nextPick}</dd></div>
    </dl>
    ${weekStrip(d)}
  </div>`;
}

// ── Setlist ─────────────────────────────────────────────────────────────
const hit = (e, v) => v !== undefined && e.target !== undefined && (e.lower ? v <= e.target : v >= e.target);
const goalText = (e) => (e.target !== undefined ? `${e.lower ? 'até ' : ''}${fmtNum(e.target)} ${e.unit}` : '');

function song(e, sess) {
  const checked = Boolean(sess.checks[e.id]);
  const v = sess.values[e.id];
  const toolLabel = { metronome: 'metrônomo', minute: '1 minuto' }[e.tool] ?? '';
  const result = e.unit
    ? `<label class="result">Hoje <input type="number" inputmode="decimal" min="0" step="any" value="${v ?? ''}" data-value="${e.id}" aria-label="Resultado de hoje, em ${e.unit}"> ${e.unit}${hit(e, v) ? ' <span class="hit">bateu a meta</span>' : ''}</label>` : '';
  let tool = '';
  if (e.tool === 'metronome') tool = `<button class="tool" type="button" data-action="metronome" data-ex="${e.id}">${icon('metronome')} Metrônomo</button>`;
  if (e.tool === 'minute') tool = `<button class="tool" type="button" data-action="timer" data-ex="${e.id}">${icon('timer')} 1 minuto</button>`;
  return `<li class="song ${checked ? 'is-done' : ''}" data-row="${e.id}">
    <div class="song-row">
      <label class="song-check"><input type="checkbox" data-check="${e.id}" ${checked ? 'checked' : ''} aria-labelledby="sn-${e.id}">
        <svg viewBox="0 0 34 34" aria-hidden="true"><path class="box" d="M4 5.5 30 4l-.5 26L5 29.2Z"/><path class="mark" pathLength="60" d="M8 18l6 7L27 7"/></svg></label>
      <button class="song-title" type="button" aria-expanded="false" aria-controls="sd-${e.id}" data-toggle="${e.id}">
        <span class="name" id="sn-${e.id}">${escape(e.name)}</span>
        <span class="meta">${goalText(e) ? `<b>${goalText(e)}</b>` : ''}${toolLabel ? `<span>${toolLabel}</span>` : ''}<svg class="chev" aria-hidden="true"><use href="#i-chev"/></svg></span>
      </button>
      <svg class="strike" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true"><path pathLength="400" vector-effect="non-scaling-stroke" d="M2 9C60 4 120 12 180 7s80-2 118 1"/></svg>
    </div>
    <div class="song-detail" id="sd-${e.id}" hidden>
      <p class="how">${escape(e.how)}</p>
      ${result || tool ? `<div class="song-tools">${result}${tool}</div>` : ''}
    </div>
  </li>`;
}

export function countLabel(d) {
  const n = d.exercises.filter((e) => d.sess.checks[e.id]).length;
  return { text: `${n}/${d.exercises.length}`, full: n === d.exercises.length, n };
}

export function footText(d) {
  if (d.streak.todayDone && !d.sess.done) return 'A ofensiva de hoje já está garantida. Esta lista nova conta para a próxima aula.';
  if (d.sess.done) return 'Setlist fechado. Volte amanhã para manter a chama.';
  return 'Toque no nome para ver como fazer, a meta e as ferramentas.';
}

function setlist(d) {
  const { current, exercises, sess } = d;
  const c = countLabel(d);
  return `<section class="paper setlist" aria-labelledby="sl-title" data-paper>
    <span class="tape l" aria-hidden="true"></span><span class="tape r" aria-hidden="true"></span>
    <div class="setlist-head">
      <h2 id="sl-title">Setlist</h2>
      <span class="count ${c.full ? 'full' : ''}" data-count aria-live="polite">${c.text}</span>
      <p>Hoje, da <a href="#/aula/${current.id}">aula ${current.n}: ${escape(current.title)}</a></p>
    </div>
    <ol class="songs" data-songs>${exercises.map((e) => song(e, sess)).join('')}</ol>
    <p class="setlist-foot" data-foot>${footText(d)}</p>
    <div class="stamp" data-stamp ${sess.done ? '' : 'hidden'}>Treino feito</div>
  </section>`;
}

function start() {
  return `<section class="paper start" data-paper>
    <span class="tape l" aria-hidden="true"></span><span class="tape r" aria-hidden="true"></span>
    <h2>Primeiro show</h2>
    <p>A aula 1 ensina a conhecer a guitarra e afinar. Concluir a aula libera seu primeiro setlist, e o primeiro setlist fechado acende a chama.</p>
    <a class="btn ink" href="#/aula/L1">Abrir aula 1 ${icon('play')}</a>
  </section>`;
}

// ── Ingresso da próxima aula ────────────────────────────────────────────
function ticket(d) {
  const { next, state } = d;
  if (!d.current) return '';
  if (!next) {
    return `<div class="ticket" data-reveal><div class="ticket-main"><span class="ticket-kind">Turnê completa</span>
      <h2>As 52 faixas estão gravadas</h2><p>Mantenha a chama com o setlist atual e escolha um estilo para se aprofundar.</p></div>
      <div class="ticket-stub"><b>52</b><span>faixas</span></div></div>`;
  }
  const { lesson, unlocked, daysLeft, examNeeded } = next;
  if (unlocked) {
    return `<a class="ticket" href="#/aula/${lesson.id}" data-reveal><div class="ticket-main"><span class="ticket-kind">Ingresso liberado</span>
      <h2>${escape(lesson.title)}</h2><p>${escape(lesson.goal)}</p><span class="btn ink small">Abrir aula ${lesson.n} ${icon('play')}</span></div>
      <div class="ticket-stub"><b>${lesson.n}</b><span>aula</span></div></a>`;
  }
  if (daysLeft > 0) {
    const doneDays = REQUIRED_DAYS - daysLeft;
    const pips = Array.from({ length: REQUIRED_DAYS }, (_, i) => `<span class="${i < doneDays ? 'on' : ''}"></span>`).join('');
    return `<div class="ticket" data-reveal><div class="ticket-main"><span class="ticket-kind">Próximo show</span>
      <h2>${escape(lesson.title)}</h2>
      <div class="pips" role="img" aria-label="${doneDays} de ${REQUIRED_DAYS} treinos feitos">${pips}</div>
      <p>Abre depois de mais ${plural(daysLeft, 'setlist fechado', 'setlists fechados')}${examNeeded ? ' e da prova de palco' : ''}.</p></div>
      <div class="ticket-stub"><b>${lesson.n}</b><span>aula</span></div></div>`;
  }
  const phase = phaseById(examNeeded);
  const label = state.exams[examNeeded]?.checks ? 'Continuar a prova' : 'Fazer a prova';
  return `<a class="ticket" href="#/prova/${examNeeded}" data-reveal><div class="ticket-main"><span class="ticket-kind">Passe de backstage</span>
    <h2>Prova de palco: ${phase.name}</h2><p>Passou, abre a aula ${lesson.n} e a guitarra ganha a pintura ${phase.paint}.</p>
    <span class="btn ink small">${label} ${icon('play')}</span></div>
    <div class="ticket-stub"><b>${phase.n}</b><span>fase</span></div></a>`;
}

function nudge({ state, t }) {
  const days = Object.keys(state.log).filter((k) => state.log[k].done).length;
  const last = state.settings.lastBackup;
  const stale = last ? diffDays(last, t) >= 14 : days >= 3;
  if (!stale) return '';
  const msg = last ? `Último backup em ${formatDay(last)}.` : 'Você ainda não fez backup.';
  return `<div class="nudge" data-reveal><p>${msg} Seu progresso fica só neste navegador.</p>
    <button class="btn small ghost" type="button" data-action="export">${icon('download')} Fazer backup</button></div>`;
}

export function today(d) {
  return `<div class="today">
    <div class="hero-col">${hero(d)}${stats(d)}</div>
    <div class="today-paper">
      ${d.current ? setlist(d) : start()}
      ${ticket(d)}
      ${nudge(d)}
    </div>
  </div>`;
}
