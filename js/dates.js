// O "dia" de treino vira às 4h: treino de madrugada conta no dia anterior.
export const CUTOFF_HOUR = 4;

const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function dayKey(date = new Date()) {
  return fmt(new Date(date.getTime() - CUTOFF_HOUR * 3600_000));
}

// Meio-dia evita qualquer surpresa de horário de verão nas contas.
export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function addDays(key, n) {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return fmt(d);
}

export function weekday(key) {
  return parseKey(key).getDay();
}

export function diffDays(a, b) {
  return Math.round((parseKey(b) - parseKey(a)) / 86_400_000);
}

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export const weekdayShort = (key) => WEEKDAYS[weekday(key)];

export function formatDay(key) {
  const d = parseKey(key);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}
