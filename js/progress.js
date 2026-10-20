// Quantos dias de treino completo a aula atual pede antes de abrir a próxima.
export const REQUIRED_DAYS = 3;

export function practiceCount(state, lessonId) {
  return Object.values(state.log).filter((e) => e.sessions?.[lessonId]?.done).length;
}

const isDone = (state, id) => Boolean(state.lessons[id]?.completedAt);

export function isUnlocked(state, lessons, idx) {
  if (idx === 0 || state.settings.freeMode) return true;
  const prev = lessons[idx - 1];
  if (!isDone(state, prev.id)) return false;
  if (practiceCount(state, prev.id) < REQUIRED_DAYS) return false;
  if (lessons[idx].phase !== prev.phase && !state.exams[prev.phase]?.passedAt) return false;
  return true;
}

export function currentLesson(state, lessons) {
  for (let i = lessons.length - 1; i >= 0; i -= 1) {
    if (isDone(state, lessons[i].id)) return lessons[i];
  }
  return null;
}

// A primeira aula ainda não concluída e o que falta para abri-la.
export function nextLesson(state, lessons) {
  const idx = lessons.findIndex((l) => !isDone(state, l.id));
  if (idx === -1) return null;
  const lesson = lessons[idx];
  const prev = lessons[idx - 1];
  const daysLeft = prev ? Math.max(0, REQUIRED_DAYS - practiceCount(state, prev.id)) : 0;
  const examNeeded = prev && lesson.phase !== prev.phase && !state.exams[prev.phase]?.passedAt
    ? prev.phase : null;
  return {
    lesson, idx, unlocked: isUnlocked(state, lessons, idx), daysLeft, examNeeded,
  };
}

export function examAvailable(state, lessons, phaseId) {
  if (state.settings?.freeMode) return true;
  return lessons.filter((l) => l.phase === phaseId).every((l) => isDone(state, l.id));
}
