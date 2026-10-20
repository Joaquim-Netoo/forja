import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LESSONS, PHASES, warmup, exercisesFor, lessonsOf, GUIDE,
} from '../js/curriculum.js';
import { render } from '../js/markup.js';

test('52 aulas em 6 fases, todas com aulas', () => {
  assert.equal(LESSONS.length, 52);
  assert.equal(PHASES.length, 6);
  PHASES.forEach((p) => assert.ok(lessonsOf(p.id).length > 0, p.id));
});

test('aulas de uma fase são contíguas', () => {
  const order = LESSONS.map((l) => l.phase);
  const seen = new Set();
  order.forEach((p, i) => {
    if (i > 0 && p !== order[i - 1]) assert.ok(!seen.has(p), `fase ${p} reaparece`);
    seen.add(p);
  });
});

test('ids de exercício únicos dentro de cada aula', () => {
  LESSONS.forEach((l) => {
    const ids = exercisesFor(l).map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length, l.id);
  });
});

test('cada aula tem de 3 a 5 itens no treino', () => {
  LESSONS.forEach((l) => {
    const n = exercisesFor(l).length;
    assert.ok(n >= 3 && n <= 5, `${l.id} tem ${n}`);
  });
});

test('aquecimento nunca cai dentro de um estágio e termina em 120', () => {
  let prev = null;
  LESSONS.forEach((l) => {
    const w = warmup(l.n);
    if (prev && prev.key === w.key) assert.ok(w.target > prev.target, `${l.id}: ${w.target}`);
    prev = w;
  });
  assert.equal(warmup(52).target, 120);
  assert.equal(warmup(11).target, 100);
});

test('a mesma métrica nunca baixa a meta numa aula seguinte da mesma fase', () => {
  const last = {};
  LESSONS.forEach((l) => {
    l.exercises.filter((e) => e.key && e.target && !e.lower).forEach((e) => {
      // Trocas comparam o mesmo par de acordes: par novo começa mais baixo.
      const k = `${l.phase}:${e.key === 'trocas' ? e.id : e.key}:${e.unit}`;
      if (last[k] !== undefined) {
        assert.ok(e.target >= last[k], `${l.id} ${e.id}: ${e.target} < ${last[k]}`);
      }
      last[k] = Math.max(last[k] ?? 0, e.target);
    });
  });
});

test('todo texto renderiza e todo acorde tem 6 cordas', () => {
  [...LESSONS.map((l) => l.body), GUIDE].forEach((body) => {
    const html = render(body);
    assert.ok(html.length > 100);
    assert.ok(!html.includes('```'));
  });
  LESSONS.forEach((l) => {
    const m = l.body.match(/@acordes\n([\s\S]*?)(\n\n|$)/g) || [];
    m.forEach((block) => block.trim().split('\n').slice(1).forEach((row) => {
      const [, frets, fingers] = row.trim().split(/\s+/);
      assert.equal(frets.length, 6, `${l.id} ${row}`);
      assert.equal(fingers.length, 6, `${l.id} ${row}`);
    }));
  });
});
