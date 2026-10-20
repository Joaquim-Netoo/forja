import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blankState, exportJSON, importJSON } from '../js/state.js';
import {
  toggleExercise, setValue, completeLesson, awardMedals, toggleExamItem, doneDays,
} from '../js/game.js';

const lesson = { id: 'L1' };
const exs = [{ id: 'a' }, { id: 'b', key: 'trocas' }];
const today = '2026-10-20';

test('o dia só completa quando todos os exercícios estão marcados', () => {
  const s = blankState();
  assert.equal(toggleExercise(s, today, lesson, exs, 'a').dayCompleted, false);
  const r = toggleExercise(s, today, lesson, exs, 'b', new Date(2026, 9, 20, 22));
  assert.equal(r.dayCompleted, true);
  assert.deepEqual(doneDays(s), [today]);
  assert.equal(s.log[today].hour, 22);
});

test('desmarcar um exercício desfaz o dia', () => {
  const s = blankState();
  toggleExercise(s, today, lesson, exs, 'a');
  toggleExercise(s, today, lesson, exs, 'b');
  assert.equal(toggleExercise(s, today, lesson, exs, 'a').dayUndone, true);
  assert.deepEqual(doneDays(s), []);
});

test('setValue guarda o recorde só quando sobe', () => {
  const s = blankState();
  setValue(s, today, lesson, exs[1], 20);
  assert.equal(setValue(s, today, lesson, exs[1], 25), true);
  setValue(s, today, lesson, exs[1], 18);
  assert.equal(s.bests.trocas, 25);
});

test('concluir aula e ganhar medalha de primeira aula', () => {
  const s = blankState();
  completeLesson(s, today, 'L1');
  const ids = awardMedals(s, today).map((m) => m.id);
  assert.ok(ids.includes('aula1'));
  assert.equal(awardMedals(s, today).length, 0);
});

test('prova aprovada só com todos os itens', () => {
  const s = blankState();
  toggleExamItem(s, 'F0', 0, 2, today);
  assert.equal(s.exams.F0.passedAt, null);
  assert.equal(toggleExamItem(s, 'F0', 1, 2, today).justPassed, true);
  assert.equal(s.exams.F0.passedAt, today);
});

test('backup vai e volta igual; arquivo estranho é recusado', () => {
  const s = blankState();
  completeLesson(s, today, 'L1');
  assert.deepEqual(importJSON(exportJSON(s)), s);
  assert.throws(() => importJSON('{"app":"outro"}'), /não é um backup/);
  assert.throws(() => importJSON('nada'), /JSON válido/);
});
