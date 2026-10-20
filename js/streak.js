import { addDays, weekday } from './dates.js';

export const RESERVE_EVERY = 7;
export const RESERVE_MAX = 2;

// Refaz o histórico dia a dia. Nada de estado guardado: o resultado sai sempre
// igual a partir da lista de dias com treino completo.
export function computeStreak(doneDays, today) {
  const done = new Set(doneDays.filter((d) => d <= today));
  const result = {
    streak: 0, record: 0, reserves: 0, savedDays: [], todayDone: done.has(today), untilReserve: RESERVE_EVERY,
  };
  if (!done.size) return result;

  let streak = 0;
  let record = 0;
  let reserves = 0;
  let since = 0;
  const saved = [];

  for (let d = [...done].sort()[0]; d <= today; d = addDays(d, 1)) {
    if (done.has(d)) {
      streak += 1;
      since += 1;
      if (since === RESERVE_EVERY) {
        reserves = Math.min(RESERVE_MAX, reserves + 1);
        since = 0;
      }
    } else if (d === today || weekday(d) === 0) {
      // hoje ainda está em aberto; domingo é descanso
    } else if (reserves > 0) {
      reserves -= 1;
      saved.push(d);
    } else {
      streak = 0;
      since = 0;
    }
    record = Math.max(record, streak);
  }

  return {
    ...result, streak, record, reserves, savedDays: saved, untilReserve: RESERVE_EVERY - since,
  };
}
