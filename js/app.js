import {
  load, save, exportJSON, importJSON, blankState,
} from './state.js';
import { dayKey, formatDay } from './dates.js';
import { computeStreak } from './streak.js';
import {
  LESSONS, lessonById, exercisesFor, phaseById, PHASES, currentPaint,
} from './curriculum.js';
import { currentLesson, nextLesson } from './progress.js';
import {
  doneDays, session, toggleExercise, setValue, completeLesson, awardMedals, toggleExamItem,
} from './game.js';
import {
  today, heroCopy, stats, countLabel, footText,
} from './views/today.js';
import { course, guide } from './views/course.js';
import { lesson, notFound } from './views/lesson.js';
import { exam } from './views/exam.js';
import { medals } from './views/medals.js';
import { settings } from './views/settings.js';
import {
  setup, cleanup, leave, intro, reduced, strike, countFlip, stampIn, stampOut, bumpNumber, sparks, expand, tabInk,
} from './ui/motion.js';
import { openMetronome, openTimer } from './ui/tools.js';
import { celebrate } from './ui/celebrate.js';
import { toastMedals, toastText } from './ui/toast.js';
import { loadStage } from './ui/stage.js';
import { powerChord } from './ui/audio.js';

setup();
let state = load();
const view = document.getElementById('view');
const nav = document.querySelector('.tabs');
let stage = null;

function derive() {
  const t = dayKey();
  const current = currentLesson(state, LESSONS);
  return {
    state,
    t,
    paint: currentPaint(state),
    streak: computeStreak(doneDays(state), t),
    current,
    exercises: current ? exercisesFor(current) : [],
    sess: current ? session(state, t, current.id) : null,
    next: nextLesson(state, LESSONS),
  };
}

function persist() {
  if (!save(state)) toastText('Não deu para salvar', 'O navegador recusou o armazenamento. Faça um backup em Ajustes.');
}

// Medalhas novas esperam o palco fechar para não ficarem escondidas atrás dele.
let pendingMedals = [];
function award({ defer = false } = {}) {
  const fresh = awardMedals(state, dayKey());
  if (!fresh.length) return;
  persist();
  if (defer) pendingMedals.push(...fresh);
  else toastMedals(fresh);
}
function flushMedals() {
  if (pendingMedals.length) toastMedals(pendingMedals);
  pendingMedals = [];
}

const chord = () => { if (state.settings.sound) powerChord(); };

// ── Guitarra no topo da tela Hoje ───────────────────────────────────────
async function mountHero(d, withIntro) {
  const host = view.querySelector('[data-guitar-host]');
  if (!host) return;
  stage = await loadStage();
  if (!stage || !host.isConnected) return;
  stage.mount(host, { mode: 'hero', paint: d.paint, onTap: chord });
  host.querySelector('.fallback')?.remove();
  const hint = view.querySelector('[data-hint]');
  if (hint) hint.hidden = false;
  if (withIntro) stage.heroIntro(reduced() ? null : window.gsap);
}

function detachHero() {
  if (stage?.mountedIn && !document.getElementById('stage').open) stage.unmount();
}

// ── Roteamento ──────────────────────────────────────────────────────────
const TITLES = {
  hoje: 'Hoje', curso: 'Discografia', aula: 'Aula', prova: 'Prova de palco', medalhas: 'Jaqueta', ajustes: 'Ajustes', guia: 'Guia',
};

function parse() {
  const [, name = 'hoje', arg] = (location.hash || '#/hoje').split('/');
  return { name, arg };
}

function updateTabs(name, animate) {
  const tab = { aula: 'curso', prova: 'curso', guia: 'curso' }[name] ?? name;
  let active = null;
  document.querySelectorAll('[data-tab]').forEach((a) => {
    if (a.dataset.tab === tab) {
      a.setAttribute('aria-current', 'page');
      active = a;
    } else a.removeAttribute('aria-current');
  });
  tabInk(nav, active, animate);
}

async function render({ transition = false, keepScroll = false, withIntro = true } = {}) {
  const { name, arg } = parse();
  if (transition) await leave(view);
  const y = window.scrollY;
  cleanup();
  detachHero();
  const d = derive();
  const screens = {
    hoje: () => today(d),
    curso: () => course(d),
    guia: () => guide(),
    aula: () => lesson(d, arg),
    prova: () => exam(d, arg),
    medalhas: () => medals(d),
    ajustes: () => settings(d),
  };
  view.innerHTML = (screens[name] ?? notFound)();
  document.body.dataset.route = name;
  updateTabs(name, transition);
  const l = name === 'aula' ? lessonById(arg) : null;
  document.title = `${l ? `Aula ${l.n}: ${l.title}` : TITLES[name] ?? 'Forja'} · Forja`;
  window.scrollTo(0, keepScroll ? y : 0);
  if (withIntro) intro(name, view);
  if (name === 'hoje') mountHero(d, withIntro);
}

window.addEventListener('hashchange', async () => {
  const sheet = document.getElementById('sheet');
  if (sheet.open) sheet.close();
  await render({ transition: true });
  view.focus({ preventScroll: true });
});

window.addEventListener('resize', () => updateTabs(parse().name, false));
document.fonts?.ready.then(() => { updateTabs(parse().name, false); window.ScrollTrigger?.refresh(); });

// A virada do dia (4h) acontece com o app aberto: recalcula ao voltar.
let lastDay = dayKey();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && dayKey() !== lastDay) {
    lastDay = dayKey();
    render({ keepScroll: true, withIntro: false });
  }
});

// ── Setlist do dia ──────────────────────────────────────────────────────
function onCheck(input) {
  const d = derive();
  const r = toggleExercise(state, d.t, d.current, d.exercises, input.dataset.check);
  persist();
  const after = derive();
  const li = input.closest('.song');
  li.classList.toggle('is-done', input.checked);
  strike(li, input.checked);
  const c = countLabel(after);
  countFlip(view.querySelector('[data-count]'), c.text, c.full);
  view.querySelector('[data-foot]').textContent = footText(after);

  const stamp = view.querySelector('[data-stamp]');
  if (after.sess.done && stamp.hidden) stampIn(stamp, view.querySelector('[data-paper]'));
  if (!after.sess.done && !stamp.hidden) stampOut(stamp);

  if (r.dayCompleted || r.dayUndone) {
    view.querySelector('[data-hero-copy]').innerHTML = heroCopy(after);
    view.querySelector('[data-stats]').outerHTML = stats(after);
    const num = view.querySelector('[data-number]');
    num.classList.toggle('cold', after.streak.streak === 0);
    if (r.dayCompleted) {
      bumpNumber(num, after.streak.streak);
      sparks(view.querySelector('[data-sparks]'), num);
      stage?.strum();
      chord();
      award();
      navigator.storage?.persist?.();
    } else {
      num.textContent = after.streak.streak;
    }
  }
}

function markHit(exId, ex, value) {
  const label = view.querySelector(`[data-value="${exId}"]`)?.closest('.result');
  if (!label) return;
  label.querySelector('.hit')?.remove();
  const ok = value !== null && ex.target !== undefined && (ex.lower ? value <= ex.target : value >= ex.target);
  if (ok) label.insertAdjacentHTML('beforeend', ' <span class="hit">bateu a meta</span>');
}

function saveValue(exId, value) {
  const d = derive();
  const ex = d.exercises.find((e) => e.id === exId);
  const record = setValue(state, d.t, d.current, ex, value);
  persist();
  const input = view.querySelector(`[data-value="${exId}"]`);
  if (input && value !== null) input.value = value;
  markHit(exId, ex, value);
  if (record) toastText('Recorde novo', `${ex.name}: ${value} ${ex.unit}`);
  award();
}

function onValue(input) {
  const raw = input.value.trim().replace(',', '.');
  saveValue(input.dataset.value, raw === '' ? null : Number(raw));
}

function onToggle(btn) {
  const open = btn.getAttribute('aria-expanded') !== 'true';
  btn.setAttribute('aria-expanded', String(open));
  expand(btn.closest('.song'), open);
}

// ── Aulas e provas ──────────────────────────────────────────────────────
async function onComplete(lessonId) {
  const l = lessonById(lessonId);
  completeLesson(state, dayKey(), l.id);
  persist();
  award({ defer: true });
  await celebrate({
    kicker: `${l.review ? 'Revisão concluída' : 'Aula concluída'} no disco ${phaseById(l.phase).n}`,
    title: `Aula ${l.n}`,
    sub: `${exercisesFor(l).length} exercícios entram no seu setlist de cada dia até a próxima aula.`,
    paint: currentPaint(state),
  });
  location.hash = '#/hoje';
  flushMedals();
}

async function onExam(input) {
  const p = phaseById(input.dataset.exam);
  const wasPassed = Boolean(state.exams[p.id]?.passedAt);
  const paintBefore = currentPaint(state);
  const { justPassed } = toggleExamItem(state, p.id, Number(input.dataset.idx), p.exam.length, dayKey());
  persist();
  const li = input.closest('.song');
  li.classList.toggle('is-done', input.checked);
  strike(li, input.checked);
  if (!justPassed) {
    // Desmarcou um item de uma prova já aprovada: tira o selo de aprovado.
    if (wasPassed) render({ keepScroll: true, withIntro: false });
    return;
  }
  award({ defer: true });
  const nextPhase = PHASES[p.n + 1];
  await celebrate({
    kicker: `Prova de palco do disco ${p.n} aprovada`,
    title: `Fase ${p.n}`,
    sub: nextPhase ? `O disco ${nextPhase.n}, ${nextPhase.name}, está aberto.` : 'Você fechou o curso inteiro. A guitarra está pronta para o palco.',
    paint: p.paint,
    fromPaint: paintBefore,
    newPaint: true,
    action: nextPhase ? 'Seguir' : 'Fechar',
  });
  render({ keepScroll: true });
  flushMedals();
}

async function replay(btn) {
  if (btn.dataset.lesson) {
    const l = lessonById(btn.dataset.lesson);
    await celebrate({
      kicker: `Concluída em ${formatDay(state.lessons[l.id].completedAt)}`,
      title: `Aula ${l.n}`,
      sub: 'Arraste para girar a guitarra; toque para tocar.',
      paint: currentPaint(state),
      action: 'Voltar',
    });
  } else {
    const p = phaseById(btn.dataset.phase);
    await celebrate({
      kicker: 'Pintura conquistada na prova de palco',
      title: `Fase ${p.n}`,
      sub: 'Arraste para girar a guitarra; toque para tocar.',
      paint: p.paint,
      action: 'Voltar',
    });
  }
}

// ── Backup ──────────────────────────────────────────────────────────────
function doExport() {
  const t = dayKey();
  state.settings.lastBackup = t;
  state.backups = (state.backups ?? 0) + 1;
  persist();
  const blob = new Blob([exportJSON(state)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `forja-backup-${t}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  award();
  render({ keepScroll: true, withIntro: false });
}

async function doImport(input) {
  const file = input.files?.[0];
  if (!file) return;
  try {
    const next = importJSON(await file.text());
    if (!window.confirm('Importar este backup substitui o progresso atual deste navegador. Continuar?')) return;
    state = next;
    persist();
    toastText('Backup importado', 'Seu progresso voltou.');
    render();
  } catch (err) {
    toastText('Não deu para importar', err.message);
  } finally {
    input.value = '';
  }
}

function doReset() {
  if (!window.confirm('Apagar todo o progresso deste navegador? Sem backup não tem volta.')) return;
  if (!window.confirm('Tem certeza? Ofensiva, aulas e patches vão zerar.')) return;
  state = blankState();
  persist();
  if (location.hash === '#/hoje') render();
  else location.hash = '#/hoje';
}

// ── Eventos ─────────────────────────────────────────────────────────────
view.addEventListener('change', (ev) => {
  const el = ev.target;
  if (el.matches('[data-check]')) onCheck(el);
  else if (el.matches('[data-value]')) onValue(el);
  else if (el.matches('[data-exam]')) onExam(el);
  else if (el.matches('[data-import]')) doImport(el);
  else if (el.matches('[data-free]')) {
    state.settings.freeMode = el.checked;
    persist();
  } else if (el.matches('[data-sound]')) {
    state.settings.sound = el.checked;
    persist();
    if (el.checked) powerChord();
  }
});

view.addEventListener('click', (ev) => {
  const toggle = ev.target.closest('[data-toggle]');
  if (toggle) {
    onToggle(toggle);
    return;
  }
  const btn = ev.target.closest('[data-action]');
  if (!btn) return;
  const d = derive();
  const ex = d.exercises.find((e) => e.id === btn.dataset.ex);
  switch (btn.dataset.action) {
    case 'metronome':
      openMetronome({ name: ex.name, target: ex.target, onUse: (v) => saveValue(ex.id, v) });
      break;
    case 'timer':
      openTimer({ name: ex.name, onUse: (v) => saveValue(ex.id, v) });
      break;
    case 'complete':
      btn.disabled = true;
      onComplete(btn.dataset.lesson);
      break;
    case 'replay':
    case 'replay-paint':
      replay(btn);
      break;
    case 'export':
      doExport();
      break;
    case 'reset':
      doReset();
      break;
    default:
  }
});

render();

if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !['localhost', '127.0.0.1'].includes(location.hostname)) {
  navigator.serviceWorker.register('sw.js');
}
