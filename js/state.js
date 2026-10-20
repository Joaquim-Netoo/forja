export const STORAGE_KEY = 'forja:v1';
export const VERSION = 1;

export function blankState() {
  return {
    version: VERSION,
    lessons: {},
    log: {},
    exams: {},
    medals: {},
    bests: {},
    backups: 0,
    settings: { freeMode: false, sound: true, lastBackup: null },
  };
}

// Completa chaves que faltem (backup antigo, edição manual) sem perder nada.
function normalize(raw) {
  const base = blankState();
  return {
    ...base,
    ...raw,
    settings: { ...base.settings, ...(raw.settings || {}) },
  };
}

export function load(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    return raw ? normalize(JSON.parse(raw)) : blankState();
  } catch {
    return blankState();
  }
}

export function save(state, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function exportJSON(state) {
  return JSON.stringify({ app: 'forja', ...state }, null, 2);
}

export function importJSON(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('O arquivo não é um JSON válido.');
  }
  if (data?.app !== 'forja' || data.version !== VERSION) {
    throw new Error('Esse arquivo não é um backup do Forja.');
  }
  const { app, ...rest } = data;
  return normalize(rest);
}
