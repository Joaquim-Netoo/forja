import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, addDays, weekday, diffDays } from '../js/dates.js';

test('antes das 4h ainda conta como o dia anterior', () => {
  assert.equal(dayKey(new Date(2026, 9, 20, 3, 59)), '2026-10-19');
});

test('a partir das 4h já é o dia novo', () => {
  assert.equal(dayKey(new Date(2026, 9, 20, 4, 0)), '2026-10-20');
});

test('addDays atravessa o fim do mês e do ano', () => {
  assert.equal(addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
});

test('weekday devolve 0 para domingo', () => {
  assert.equal(weekday('2026-10-25'), 0);
  assert.equal(weekday('2026-10-20'), 2);
});

test('diffDays conta dias entre duas datas', () => {
  assert.equal(diffDays('2026-10-01', '2026-10-15'), 14);
});
