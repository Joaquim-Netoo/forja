# FORJA Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan.

**Goal:** App pessoal de treino de guitarra com ofensiva, medalhas, 52 aulas progressivas, visual heavy metal, animações GSAP e uma Flying V em 3D ao concluir aulas.

**Architecture:** Site estático sem build. Lógica pura (datas, ofensiva, progressão, medalhas) em módulos ES testados com `node --test`; telas renderizadas por template string com roteamento por hash; estado único em `localStorage`.

**Tech Stack:** HTML, CSS, JavaScript (ES modules), GSAP 3 (UMD em `vendor/`), Three.js (ESM em `vendor/` via import map), Web Audio, Service Worker.

---

## Estrutura de arquivos

```
index.html              casca, navegação, import map, overlays
manifest.webmanifest    PWA
sw.js                   cache offline
css/tokens.css          cores, tipografia, espaçamento
css/app.css             layout e componentes
js/app.js               boot, roteador, eventos
js/dates.js             dayKey com virada às 4h, dia da semana
js/streak.js            ofensiva (replay determinístico do histórico)
js/progress.js          liberação de aulas e fases
js/medals.js            definição e avaliação das medalhas
js/state.js             carregar, salvar, exportar, importar
js/curriculum.js        fases, aulas, exercícios, aquecimento progressivo
js/markup.js            renderizador do texto das aulas (parágrafo, lista, TAB, tabela)
js/views/*.js           hoje, curso, aula, prova, medalhas, ajustes
js/ui/icons.js          ícones SVG
js/ui/motion.js         helpers GSAP com prefers-reduced-motion
js/ui/metronome.js      metrônomo Web Audio
js/ui/timer.js          cronômetro de 1 minuto
js/ui/celebrate.js      overlay de aula concluída
js/ui/guitar3d.js       Flying V em Three.js (carregamento tardio)
vendor/                 gsap.min.js, three.module.min.js (+ core), RoomEnvironment.js
tests/*.test.js         testes da lógica pura
```

## Task 1: Datas (`js/dates.js`)

Testes (`tests/dates.test.js`):
- `dayKey(new Date(2026,9,20,3,59))` → `"2026-10-19"` (antes das 4h conta como ontem)
- `dayKey(new Date(2026,9,20,4,0))` → `"2026-10-20"`
- `addDays("2026-10-31", 1)` → `"2026-11-01"`
- `weekday("2026-10-25")` → `0` (domingo)

Rodar: `node --test tests/` → falha, implementar, passa.

## Task 2: Ofensiva (`js/streak.js`)

`computeStreak(doneDays: string[], today: string)` → `{ streak, record, reserves, savedDays, todayDone }`.
Replay dia a dia do primeiro treino até hoje:
- treinou: `streak++`, a cada 7 treinos seguidos `reserves = min(2, reserves+1)`
- domingo sem treino: nada muda
- hoje sem treino: ainda pendente, nada muda
- dia perdido com reserva: gasta 1, entra em `savedDays`
- dia perdido sem reserva: `streak = 0`

Testes: sequência simples, domingo não quebra, reserva salva um dia, sem reserva zera, máx. 2 reservas, recorde preservado após quebra, hoje pendente não quebra.

## Task 3: Progressão (`js/progress.js`)

- `practiceCount(state, lessonId)`: dias com treino completo daquela aula.
- `isUnlocked(state, lessons, idx)`: aula 0 sempre; modo livre libera tudo; senão aula anterior concluída + 3 treinos nela + se for a primeira aula de uma fase, prova da fase anterior aprovada.
- `currentLesson(state, lessons)`: última aula concluída (a lista do dia vem dela).
- `examAvailable(state, phase)`: todas as aulas da fase concluídas.

Testes para cada regra.

## Task 4: Medalhas (`js/medals.js`)

Lista de medalhas com `check(ctx)`; `evaluate(state, ctx)` devolve as novas. Testes: ofensiva 3 e 7, fase concluída, recorde de BPM, secreta de madrugada.

## Task 5: Estado (`js/state.js`)

`load()`, `save()`, `exportJSON()`, `importJSON(text)` com validação de `version`. Teste de import inválido.

## Task 6: Currículo (`js/curriculum.js`)

6 fases, 52 aulas, provas por fase. `warmup(n)` gera o aquecimento: aulas 1–11 uma nota por batida (60→100), 12–25 colcheias (60→112), 26–52 semicolcheias (56→120). Teste: BPM nunca cai dentro de um estágio e a última aula chega a 120.

## Task 7: Casca, estilos, roteador

`index.html`, `css/tokens.css`, `css/app.css`, `js/app.js`. Verificar no navegador: navegação entre as 5 telas sem erro no console.

## Task 8: Telas

Hoje → Curso → Aula → Prova → Medalhas → Ajustes. Uma por vez: implementar, screenshot no celular (375px) e no desktop, criticar, ajustar.

## Task 9: Ferramentas

Metrônomo (agendamento com lookahead de 100 ms, acento no tempo 1) e cronômetro de 60 s.

## Task 10: Animações e 3D

- GSAP: uma entrada por tela, contador da ofensiva, patch costurado (stroke-dashoffset), sequência de conclusão.
- Flying V: shape extrudado, braço, escala com 22 trastes pela regra 2^(n/12), headstock, captadores, cordas, pintura por fase, RoomEnvironment. DPR máx. 1.5 no celular. Fallback SVG. Sem 3D com reduced-motion.

## Task 11: PWA e README

Manifest, service worker com cache dos arquivos locais, README com passos do GitHub Pages.

## Verificação final

`node --test tests/` verde; navegação completa no navegador; sem erros no console; Lighthouse mobile.
