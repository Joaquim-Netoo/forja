import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MEDALS, evaluate } from '../js/medals.js';

const ctx = (over = {}) => ({
  record: 0,
  totalDays: 0,
  completedLessons: 0,
  phasesPassed: new Set(),
  bests: {},
  doneEntries: [],
  savedDays: [],
  backups: 0,
  ...over,
});

const state = (medals = {}) => ({ medals });

test('ids das medalhas são únicos', () => {
  const ids = MEDALS.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('ofensiva de 3 e 7 dias pelo recorde', () => {
  const got = evaluate(state(), ctx({ record: 7 })).map((m) => m.id);
  assert.ok(got.includes('s3'));
  assert.ok(got.includes('s7'));
  assert.ok(!got.includes('s14'));
});

test('medalha já ganha não volta', () => {
  const got = evaluate(state({ s3: '2026-10-19' }), ctx({ record: 3 })).map((m) => m.id);
  assert.ok(!got.includes('s3'));
});

test('fase aprovada dá a medalha da fase', () => {
  const got = evaluate(state(), ctx({ phasesPassed: new Set(['F1']) })).map((m) => m.id);
  assert.ok(got.includes('f1'));
});

test('recorde de trocas por minuto', () => {
  const got = evaluate(state(), ctx({ bests: { trocas: 30 } })).map((m) => m.id);
  assert.ok(got.includes('trocas30'));
});

test('secreta: treino concluído de madrugada', () => {
  const got = evaluate(state(), ctx({ doneEntries: [{ day: '2026-10-19', hour: 2 }] })).map((m) => m.id);
  assert.ok(got.includes('coruja'));
});

test('secreta: treino no domingo', () => {
  const got = evaluate(state(), ctx({ doneEntries: [{ day: '2026-10-25', hour: 15 }] })).map((m) => m.id);
  assert.ok(got.includes('domingo'));
});
