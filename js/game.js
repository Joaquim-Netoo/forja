import { computeStreak } from './streak.js';
import { evaluate } from './medals.js';

// Ações sobre o estado. Mutam `state` e devolvem o que mudou para a interface
// poder animar (medalhas novas, dia concluído).

export const doneDays = (state) => Object.keys(state.log).filter((d) => state.log[d].done);

export function medalContext(state, today) {
  const streak = computeStreak(doneDays(state), today);
  return {
    streak,
    record: streak.record,
    totalDays: doneDays(state).length,
    completedLessons: Object.values(state.lessons).filter((l) => l.completedAt).length,
    phasesPassed: new Set(Object.keys(state.exams).filter((k) => state.exams[k].passedAt)),
    bests: state.bests,
    doneEntries: doneDays(state).map((day) => ({ day, hour: state.log[day].hour ?? 12 })),
    savedDays: streak.savedDays,
    backups: state.backups,
  };
}

export function awardMedals(state, today, now = new Date()) {
  const fresh = evaluate(state, medalContext(state, today));
  fresh.forEach((m) => { state.medals[m.id] = now.toISOString(); });
  return fresh;
}

export function session(state, today, lessonId) {
  return state.log[today]?.sessions?.[lessonId] ?? { checks: {}, values: {}, done: false };
}

function ensureSession(state, today, lessonId) {
  const day = state.log[today] ?? (state.log[today] = { sessions: {}, done: false, hour: null });
  day.sessions ??= {};
  return day.sessions[lessonId] ?? (day.sessions[lessonId] = { checks: {}, values: {}, done: false });
}

// Marca ou desmarca um exercício. O dia fica completo quando todos os
// exercícios da lista daquela aula estão marcados.
export function toggleExercise(state, today, lesson, exercises, exId, now = new Date()) {
  const s = ensureSession(state, today, lesson.id);
  s.checks[exId] = !s.checks[exId];
  const wasDone = state.log[today].done;
  s.done = exercises.every((e) => s.checks[e.id]);
  const day = state.log[today];
  day.done = Object.values(day.sessions).some((x) => x.done);
  if (day.done && !wasDone) day.hour = now.getHours();
  if (!day.done) day.hour = null;
  return { dayCompleted: day.done && !wasDone, dayUndone: wasDone && !day.done };
}

// Registra o número alcançado (BPM, trocas...) e atualiza o recorde.
export function setValue(state, today, lesson, exercise, value) {
  const s = ensureSession(state, today, lesson.id);
  if (value === null || Number.isNaN(value)) {
    delete s.values[exercise.id];
    return false;
  }
  s.values[exercise.id] = value;
  if (!exercise.key || exercise.lower) return false;
  const prev = state.bests[exercise.key] ?? 0;
  if (value > prev) {
    state.bests[exercise.key] = value;
    return prev > 0;
  }
  return false;
}

export function completeLesson(state, today, lessonId) {
  state.lessons[lessonId] = { completedAt: today };
}

export function toggleExamItem(state, phaseId, idx, total, today) {
  const exam = state.exams[phaseId] ?? (state.exams[phaseId] = { checks: {}, passedAt: null });
  exam.checks[idx] = !exam.checks[idx];
  const all = Array.from({ length: total }, (_, i) => exam.checks[i]).every(Boolean);
  const justPassed = all && !exam.passedAt;
  exam.passedAt = all ? (exam.passedAt ?? today) : null;
  return { justPassed };
}
