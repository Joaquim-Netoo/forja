import { weekday } from './dates.js';

// Cada medalha é um patch da jaqueta. `shape` define o recorte do patch,
// `glyph` o desenho bordado (ver ui/patch.js).
const streak = (id, days, name, glyph) => ({
  id, group: 'ofensiva', shape: 'round', glyph, name,
  rule: `${days} dias de ofensiva`,
  check: (c) => c.record >= days,
});

const phase = (n, name, glyph) => ({
  id: `f${n}`, group: 'fases', shape: 'shield', glyph, name,
  rule: `Passar na prova da fase ${n}`,
  check: (c) => c.phasesPassed.has(`F${n}`),
});

export const MEDALS = [
  streak('s3', 3, 'Primeira Faísca', 'spark'),
  streak('s7', 7, 'Semana em Chamas', 'flame'),
  streak('s14', 14, 'Quinzena de Aço', 'anvil'),
  streak('s30', 30, 'Mês de Fogo', 'flame'),
  streak('s60', 60, 'Dois Meses na Estrada', 'road'),
  streak('s100', 100, 'Centúria', 'skull'),
  streak('s200', 200, 'Duzentos Dias de Ruído', 'bolt'),
  streak('s365', 365, 'Um Ano Sem Silêncio', 'crown'),

  phase(0, 'Ritual de Iniciação', 'pick'),
  phase(1, 'Oito Acordes de Aço', 'chord'),
  phase(2, 'Martelo do Ritmo', 'hammer'),
  phase(3, 'Pentagrama de Fogo', 'star'),
  phase(4, 'Senhor do Braço', 'neck'),
  phase(5, 'Forjado no Fogo', 'anvil'),

  {
    id: 'aula1', group: 'marcos', shape: 'tab', glyph: 'amp', name: 'Amplificador Ligado',
    rule: 'Concluir a primeira aula', check: (c) => c.completedLessons >= 1,
  },
  {
    id: 't10', group: 'marcos', shape: 'tab', glyph: 'pick', name: 'Dez Ensaios',
    rule: '10 treinos completos', check: (c) => c.totalDays >= 10,
  },
  {
    id: 't50', group: 'marcos', shape: 'tab', glyph: 'pick', name: 'Cinquenta Ensaios',
    rule: '50 treinos completos', check: (c) => c.totalDays >= 50,
  },
  {
    id: 't100', group: 'marcos', shape: 'tab', glyph: 'skull', name: 'Cem Ensaios',
    rule: '100 treinos completos', check: (c) => c.totalDays >= 100,
  },
  {
    id: 'metade', group: 'marcos', shape: 'tab', glyph: 'vinyl', name: 'Metade da Discografia',
    rule: 'Concluir 26 aulas', check: (c) => c.completedLessons >= 26,
  },
  {
    id: 'trocas30', group: 'marcos', shape: 'tab', glyph: 'bolt', name: 'Mão Ligeira',
    rule: '30 trocas de acorde em 1 minuto', check: (c) => (c.bests.trocas ?? 0) >= 30,
  },
  {
    id: 'aranha100', group: 'marcos', shape: 'tab', glyph: 'spider', name: 'Aranha de Aço',
    rule: 'Aranha a 100 BPM, uma nota por batida', check: (c) => (c.bests.aranha ?? 0) >= 100,
  },
  {
    id: 'pent120', group: 'marcos', shape: 'tab', glyph: 'star', name: 'Pentatônica a 120',
    rule: 'Pentatônica a 120 BPM em semicolcheias', check: (c) => (c.bests.penta16 ?? 0) >= 120,
  },

  {
    id: 'coruja', group: 'secretas', shape: 'diamond', glyph: 'moon', name: 'Coruja do Metal',
    rule: 'Treinar depois da meia-noite', secret: true,
    check: (c) => c.doneEntries.some((e) => e.hour < 4),
  },
  {
    id: 'domingo', group: 'secretas', shape: 'diamond', glyph: 'horns', name: 'Domingo Profano',
    rule: 'Treinar num domingo de descanso', secret: true,
    check: (c) => c.doneEntries.some((e) => weekday(e.day) === 0),
  },
  {
    id: 'ressurreicao', group: 'secretas', shape: 'diamond', glyph: 'skull', name: 'Ressurreição',
    rule: 'Uma palheta reserva salvou sua ofensiva', secret: true,
    check: (c) => c.savedDays.length > 0,
  },
  {
    id: 'guardiao', group: 'secretas', shape: 'diamond', glyph: 'vault', name: 'Guardião do Arquivo',
    rule: 'Fazer o primeiro backup', secret: true,
    check: (c) => c.backups > 0,
  },
];

export const GROUPS = [
  { id: 'ofensiva', name: 'Ofensiva' },
  { id: 'fases', name: 'Fases' },
  { id: 'marcos', name: 'Marcos' },
  { id: 'secretas', name: 'Secretas' },
];

export const medalById = (id) => MEDALS.find((m) => m.id === id);

export function evaluate(state, ctx) {
  return MEDALS.filter((m) => !state.medals[m.id] && m.check(ctx));
}
