import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  practiceCount, isUnlocked, currentLesson, nextLesson, examAvailable, REQUIRED_DAYS,
} from '../js/progress.js';

const lessons = [
  { id: 'L1', phase: 'F0' },
  { id: 'L2', phase: 'F0' },
  { id: 'L3', phase: 'F1' },
];

const blank = () => ({ lessons: {}, log: {}, exams: {}, settings: { freeMode: false } });

const practise = (state, lesson, days) => {
  days.forEach((d) => { state.log[d] = { sessions: { [lesson]: { done: true } }, done: true }; });
};

test('a primeira aula está sempre liberada', () => {
  assert.equal(isUnlocked(blank(), lessons, 0), true);
});

test('aula seguinte bloqueada até concluir a anterior e treinar 3 dias', () => {
  const s = blank();
  s.lessons.L1 = { completedAt: '2026-10-19' };
  practise(s, 'L1', ['2026-10-19', '2026-10-20']);
  assert.equal(isUnlocked(s, lessons, 1), false);
  practise(s, 'L1', ['2026-10-21']);
  assert.equal(REQUIRED_DAYS, 3);
  assert.equal(isUnlocked(s, lessons, 1), true);
});

test('treinos incompletos não contam', () => {
  const s = blank();
  s.log['2026-10-19'] = { sessions: { L1: { done: false } }, done: false };
  practise(s, 'L1', ['2026-10-20']);
  assert.equal(practiceCount(s, 'L1'), 1);
});

test('primeira aula de uma fase exige a prova da fase anterior', () => {
  const s = blank();
  s.lessons.L1 = { completedAt: '2026-10-10' };
  s.lessons.L2 = { completedAt: '2026-10-14' };
  practise(s, 'L2', ['2026-10-14', '2026-10-15', '2026-10-16']);
  assert.equal(isUnlocked(s, lessons, 2), false);
  s.exams.F0 = { passedAt: '2026-10-16' };
  assert.equal(isUnlocked(s, lessons, 2), true);
});

test('modo livre libera tudo', () => {
  const s = blank();
  s.settings.freeMode = true;
  assert.equal(isUnlocked(s, lessons, 2), true);
});

test('aula atual é a última concluída', () => {
  const s = blank();
  assert.equal(currentLesson(s, lessons), null);
  s.lessons.L1 = { completedAt: '2026-10-10' };
  s.lessons.L2 = { completedAt: '2026-10-14' };
  assert.equal(currentLesson(s, lessons).id, 'L2');
});

test('nextLesson diz quantos treinos faltam', () => {
  const s = blank();
  s.lessons.L1 = { completedAt: '2026-10-10' };
  practise(s, 'L1', ['2026-10-10']);
  const n = nextLesson(s, lessons);
  assert.equal(n.lesson.id, 'L2');
  assert.equal(n.unlocked, false);
  assert.equal(n.daysLeft, 2);
});

test('prova disponível só com todas as aulas da fase concluídas', () => {
  const s = blank();
  s.lessons.L1 = { completedAt: '2026-10-10' };
  assert.equal(examAvailable(s, lessons, 'F0'), false);
  s.lessons.L2 = { completedAt: '2026-10-14' };
  assert.equal(examAvailable(s, lessons, 'F0'), true);
});
