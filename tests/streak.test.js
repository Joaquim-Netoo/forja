import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeStreak } from '../js/streak.js';
import { addDays } from '../js/dates.js';

// 2026-10-19 é segunda-feira; 2026-10-25 é domingo.
const run = (start, n) => Array.from({ length: n }, (_, i) => addDays(start, i));

test('sem treinos, tudo zerado', () => {
  const s = computeStreak([], '2026-10-20');
  assert.deepEqual([s.streak, s.record, s.reserves, s.todayDone], [0, 0, 0, false]);
});

test('três dias seguidos dão ofensiva 3', () => {
  const s = computeStreak(run('2026-10-19', 3), '2026-10-21');
  assert.equal(s.streak, 3);
  assert.equal(s.todayDone, true);
});

test('hoje ainda sem treino não quebra a ofensiva', () => {
  const s = computeStreak(run('2026-10-19', 2), '2026-10-21');
  assert.equal(s.streak, 2);
  assert.equal(s.todayDone, false);
});

test('domingo sem treino não quebra', () => {
  // seg a sáb treinou, domingo descansou, segunda treinou
  const days = [...run('2026-10-19', 6), '2026-10-26'];
  const s = computeStreak(days, '2026-10-26');
  assert.equal(s.streak, 7);
});

test('treinar no domingo também conta', () => {
  const s = computeStreak(run('2026-10-19', 7), '2026-10-25');
  assert.equal(s.streak, 7);
});

test('dia perdido sem palheta reserva zera a ofensiva e preserva o recorde', () => {
  const days = [...run('2026-10-19', 3), '2026-10-23'];
  const s = computeStreak(days, '2026-10-23');
  assert.equal(s.streak, 1);
  assert.equal(s.record, 3);
});

test('7 treinos seguidos rendem uma palheta reserva', () => {
  const s = computeStreak(run('2026-10-19', 7), '2026-10-25');
  assert.equal(s.reserves, 1);
});

test('a palheta reserva salva um dia perdido', () => {
  // 7 dias (seg 19 a dom 25), falta na seg 26, treina ter 27
  const days = [...run('2026-10-19', 7), '2026-10-27'];
  const s = computeStreak(days, '2026-10-27');
  assert.equal(s.streak, 8);
  assert.equal(s.reserves, 0);
  assert.deepEqual(s.savedDays, ['2026-10-26']);
});

test('no máximo 2 palhetas reserva', () => {
  const s = computeStreak(run('2026-10-19', 28), addDays('2026-10-19', 27));
  assert.equal(s.reserves, 2);
});

test('treinos futuros são ignorados', () => {
  const s = computeStreak(['2026-10-19', '2026-10-30'], '2026-10-19');
  assert.equal(s.streak, 1);
});
