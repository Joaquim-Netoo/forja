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
  today, streakBlock, dayDoneBanner, countLabel,
} from './views/today.js';
import { course, guide } from './views/course.js';
import { lesson, notFound } from './views/lesson.js';
import { exam } from './views/exam.js';
import { medals } from './views/medals.js';
import { settings } from './views/settings.js';
import { enter, streakUp } from './ui/motion.js';
import { openMetronome, openTimer } from './ui/tools.js';
import { celebrate } from './ui/celebrate.js';
import { toastMedals, toastText } from './ui/toast.js';

let state = load();
const view = document.getElementById('view');

function derive() {
  const t = dayKey();
  const current = currentLesson(state, LESSONS);
  return {
    state,
    t,
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

// ── Roteamento ──────────────────────────────────────────────────────────
const TITLES = {
  hoje: 'Hoje', curso: 'Curso', aula: 'Aula', prova: 'Prova de palco', medalhas: 'Medalhas', ajustes: 'Ajustes', guia: 'Guia',
};

function parse() {
  const [, name = 'hoje', arg] = (location.hash || '#/hoje').split('/');
  return { name, arg };
}

function render({ animate = true, keepScroll = false } = {}) {
  const { name, arg } = parse();
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
  const y = window.scrollY;
  view.innerHTML = (screens[name] ?? notFound)();
  const tab = { aula: 'curso', prova: 'curso', guia: 'curso' }[name] ?? name;
  document.querySelectorAll('[data-tab]').forEach((a) => {
    if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  const l = name === 'aula' ? lessonById(arg) : null;
  document.title = `${l ? `Aula ${l.n}: ${l.title}` : TITLES[name] ?? 'Forja'} — Forja`;
  if (keepScroll) window.scrollTo(0, y);
  if (animate) enter(view);
}

window.addEventListener('hashchange', () => {
  const sheet = document.getElementById('sheet');
  if (sheet.open) sheet.close();
  render();
  window.scrollTo(0, 0);
  view.focus({ preventScroll: true });
});

// A virada do dia (4h) acontece com o app aberto: recalcula ao voltar.
let lastDay = dayKey();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && dayKey() !== lastDay) {
    lastDay = dayKey();
    render({ animate: false, keepScroll: true });
  }
});

// ── Treino do dia ───────────────────────────────────────────────────────
function onCheck(input) {
  const d = derive();
  const id = input.dataset.check;
  const before = d.streak.streak;
  const r = toggleExercise(state, d.t, d.current, d.exercises, id);
  persist();

  const after = derive();
  input.closest('.ex').classList.toggle('is-done', input.checked);
  const c = countLabel(after);
  const count = view.querySelector('[data-count]');
  count.textContent = c.text;
  count.classList.toggle('full', c.full);

  view.querySelector('[data-daydone]').innerHTML = after.streak.todayDone ? dayDoneBanner(after.sess.done) : '';
  if (r.dayCompleted || r.dayUndone) {
    const old = view.querySelector('#streak');
    old.outerHTML = streakBlock(after);
    if (r.dayCompleted) {
      streakUp(view.querySelector('#streak'), before, after.streak.streak);
      award();
      navigator.storage?.persist?.();
    }
  }
}

function onValue(input) {
  const d = derive();
  const ex = d.exercises.find((e) => e.id === input.dataset.value);
  const raw = input.value.trim().replace(',', '.');
  const value = raw === '' ? null : Number(raw);
  const record = setValue(state, d.t, d.current, ex, value);
  persist();
  if (record) toastText('Recorde novo', `${ex.name}: ${value} ${ex.unit}`);
  award();
  render({ animate: false, keepScroll: true });
}

function useResult(exId, value) {
  const d = derive();
  const ex = d.exercises.find((e) => e.id === exId);
  const record = setValue(state, d.t, d.current, ex, value);
  persist();
  if (record) toastText('Recorde novo', `${ex.name}: ${value} ${ex.unit}`);
  award();
  render({ animate: false, keepScroll: true });
}

// ── Aulas e provas ──────────────────────────────────────────────────────
async function onComplete(lessonId) {
  const l = lessonById(lessonId);
  completeLesson(state, dayKey(), l.id);
  persist();
  award({ defer: true });
  await celebrate({
    kicker: `${l.review ? 'Revisão concluída' : 'Aula concluída'} na fase ${phaseById(l.phase).n}`,
    title: `Aula ${l.n}`,
    sub: `${exercisesFor(l).length} exercícios entram no seu treino de cada dia até a próxima aula.`,
    paint: currentPaint(state),
  });
  location.hash = '#/hoje';
  flushMedals();
}

async function onExam(input) {
  const p = phaseById(input.dataset.exam);
  const wasPassed = Boolean(state.exams[p.id]?.passedAt);
  const { justPassed } = toggleExamItem(state, p.id, Number(input.dataset.idx), p.exam.length, dayKey());
  persist();
  input.closest('li').classList.toggle('is-done', input.checked);
  if (!justPassed) {
    // Desmarcou um item de uma prova já aprovada: tira o selo de aprovado.
    if (wasPassed) render({ animate: false, keepScroll: true });
    return;
  }
  award({ defer: true });
  const nextPhase = PHASES[p.n + 1];
  await celebrate({
    kicker: `Prova de palco da fase ${p.n} aprovada`,
    title: `Fase ${p.n}`,
    sub: nextPhase ? `A fase ${nextPhase.n}, ${nextPhase.name}, está aberta.` : 'Você fechou o curso inteiro. A guitarra está pronta para o palco.',
    paint: p.paint,
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
      sub: 'Arraste para girar a guitarra.',
      paint: currentPaint(state),
      action: 'Voltar',
    });
  } else {
    const p = phaseById(btn.dataset.phase);
    await celebrate({
      kicker: 'Pintura conquistada na prova de palco',
      title: `Fase ${p.n}`,
      sub: 'Arraste para girar a guitarra.',
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
  render({ animate: false, keepScroll: true });
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
  location.hash = '#/hoje';
  render();
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
  }
});

view.addEventListener('click', (ev) => {
  const btn = ev.target.closest('[data-action]');
  if (!btn) return;
  const d = derive();
  const ex = d.exercises.find((e) => e.id === btn.dataset.ex);
  switch (btn.dataset.action) {
    case 'metronome':
      openMetronome({ name: ex.name, target: ex.target, onUse: (v) => useResult(ex.id, v) });
      break;
    case 'timer':
      openTimer({ name: ex.name, onUse: (v) => useResult(ex.id, v) });
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
