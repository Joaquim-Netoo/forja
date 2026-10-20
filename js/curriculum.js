// Curso de Guitarra: do Zero ao Avançado — versão FORJA.
// 52 aulas em 6 fases. Cada aula traz exercícios com meta numérica que sobe
// de uma aula para a outra, mais um aquecimento que acompanha o ano inteiro.

const md = String.raw;

const bpm = (id, name, how, target, key) => ({
  id, name, how, unit: 'BPM', target, key, tool: 'metronome',
});
const swap = (id, a, b, target) => ({
  id,
  name: `Troca de um minuto: ${a} ↔ ${b}`,
  how: 'Uma palhetada para baixo em cada acorde, troca, repete. Conte só as trocas em que o acorde soou limpo.',
  unit: 'trocas',
  target,
  key: 'trocas',
  tool: 'minute',
});
const check = (id, name, how) => ({ id, name, how });
const count = (id, name, how, unit, target, key, lower = false) => ({
  id, name, how, unit, target, key, lower,
});

// ── Aquecimento progressivo ────────────────────────────────────────────────
// Aulas 1–11: aranha, uma nota por batida, 60 → 100 BPM.
// Aulas 12–25: aranha com permutações, colcheias, 60 → 112 BPM.
// Aulas 26–52: pentatônica em semicolcheias, 56 → 120 BPM.
// Hífens que não quebram linha (U+2011): "1‑2‑3‑4" fica sempre inteiro.
const PATTERNS = ['1‑2‑3‑4', '1‑3‑2‑4', '1‑4‑2‑3', '4‑3‑2‑1'];

export function warmup(n) {
  const base = { id: 'aquecimento', unit: 'BPM', tool: 'metronome', warm: true };
  if (n <= 11) {
    return {
      ...base,
      name: 'Aquecimento: aranha 1‑2‑3‑4',
      how: 'Um dedo por casa, da corda 6 até a 1 e de volta. Palhetada alternada, uma nota por batida.',
      target: 60 + 4 * (n - 1),
      key: 'aranha',
    };
  }
  if (n <= 25) {
    const p = PATTERNS[(n - 12) % PATTERNS.length];
    return {
      ...base,
      name: `Aquecimento: aranha ${p}`,
      how: `A mesma aranha com a ordem de dedos ${p}. Duas notas por batida (colcheias), palhetada alternada.`,
      target: 60 + 4 * (n - 12),
      key: 'aranha8',
    };
  }
  return {
    ...base,
    name: n < 37 ? 'Aquecimento: pentatônica, desenho 1' : 'Aquecimento: pentatônica, desenhos 1 a 5',
    how: 'Quatro notas por batida (semicolcheias), palhetada alternada, subindo e descendo sem parar.',
    target: Math.round(56 + ((n - 26) * 64) / 26),
    key: 'penta16',
  };
}

// ── Fases ──────────────────────────────────────────────────────────────────
export const PHASES = [
  {
    id: 'F0', n: 0, name: 'Fundamentos', paint: 'Preto fosco',
    intro: 'Afinar, segurar a guitarra e ler tablatura. Evita vícios que custam meses para corrigir.',
    exam: [
      'Afino a guitarra sozinho em menos de 2 minutos',
      'Sei o nome das 6 cordas soltas de cor',
      'Leio uma tablatura simples',
      'Faço a aranha limpa a 68 BPM',
      'Toco o primeiro riff a 70 BPM sem parar',
    ],
  },
  {
    id: 'F1', n: 1, name: 'Acordes abertos', paint: 'Vermelho-sangue',
    intro: 'Oito acordes abertos tocam centenas de músicas. O segredo é trocar sem parar o ritmo.',
    exam: [
      'Os 8 acordes soam limpos, corda por corda',
      '30 trocas por minuto nos pares principais',
      'Toco G – D – Em – C a 76 BPM sem parar o ritmo',
      'Toco pelo menos 2 músicas inteiras',
    ],
  },
  {
    id: 'F2', n: 2, name: 'Ritmo', paint: 'Branco osso',
    intro: 'A mão direita nunca para: desce no tempo, sobe no contratempo. Power chords, palm mute e galope.',
    exam: [
      'Faço a Batida 2 em 4 progressões diferentes sem perder o tempo',
      'Power chords limpos nas cordas 6 e 5, em qualquer casa',
      'Palm mute controlado: ligo e desligo no meio do riff',
      'Galope limpo a 90 BPM',
      'Toco o blues de 12 compassos inteiro a 80 BPM',
      'Toco 2 músicas de rock com power chords',
    ],
  },
  {
    id: 'F3', n: 3, name: 'Teoria e Solo I', paint: 'Aço escovado',
    intro: 'O mapa do braço e a pentatônica. Cinco técnicas de expressão que fazem a escala virar música.',
    exam: [
      'Acho qualquer nota nas cordas 6 e 5 em menos de 3 segundos',
      'Sei a fórmula da escala maior e dos acordes maiores e menores',
      'Monto o campo harmônico de C, G, D, A e E de cabeça',
      'Transponho uma música simples para outro tom',
      'Desenho 1 da pentatônica limpo a 92 BPM, duas notas por batida',
      'Bend de 1 tom afinado nas cordas 2 e 3',
      'Vibrato constante, sem tremer',
      'Toco os 3 licks no tempo',
      'Improviso 2 minutos sobre uma backing track sem travar',
    ],
  },
  {
    id: 'F4', n: 4, name: 'Pestana e Solo II', paint: 'Ouro velho',
    intro: 'Pestana, tétrades e CAGED de um lado; os 5 desenhos e o fraseado do outro. O braço inteiro vira mapa.',
    exam: [
      'Pestana de F (casa 1) soando limpa',
      'Troco entre pestanas de corda 6 e 5 sem parar o ritmo',
      'Sei os 4 desenhos de tétrades em 2 posições',
      'Toco o acorde de C nos 5 desenhos do CAGED',
      'Toco uma música com dedilhado',
      'Toco os 5 desenhos da pentatônica de Lá e ligo todos com slides',
      'Faço os 5 desenhos em Mi e em Sol',
      'Uso a blue note e a pentatônica maior num blues',
      'Termino frases nas notas dos acordes ao improvisar',
      'Aprendi 3 solos completos',
      'Tirei uma frase de ouvido',
    ],
  },
  {
    id: 'F5', n: 5, name: 'Avançado', paint: 'Obsidiana e ouro',
    intro: 'Escolhas conscientes: qual escala, qual nota, qual técnica. Dois tópicos por vez, nunca tudo junto.',
    exam: [
      'Improviso em qualquer tom, em qualquer região do braço',
      'Escolho a escala certa para cada acorde, inclusive modos',
      'Toco arpejos sobre uma progressão em tempo real',
      'Pentatônica com palhetada alternada a 120 BPM em semicolcheias',
      'Tiro músicas inteiras de ouvido',
      'Tenho pelo menos 3 músicas autorais',
    ],
  },
];

// ── Aulas ──────────────────────────────────────────────────────────────────
const RAW = [
  // ── Fase 0 ──
  {
    phase: 'F0',
    title: 'Conheça a guitarra e afine',
    goal: 'Saber o nome de cada parte e afinar sozinho.',
    body: md`
## Partes da guitarra
- **Headstock (mão):** onde ficam as tarraxas, que afinam as cordas.
- **Braço e escala:** onde a mão esquerda aperta as casas. As marcações ficam nas casas 3, 5, 7, 9, 12, 15, 17…
- **Corpo:** onde ficam os captadores, a ponte e os controles.
- **Captadores:** "microfones" magnéticos. O do braço soa grave e macio; o da ponte, agudo e agressivo. Quase todo riff de metal sai do captador da ponte.
- **Chave seletora:** escolhe qual captador está ligado.
- **Volume e tone:** volume controla o nível; tone deixa o som mais aberto ou mais abafado.

## Afinação padrão
Da corda mais grossa (6) para a mais fina (1): **E A D G B E** = Mi, Lá, Ré, Sol, Si, Mi. Para decorar: "Eu Amo Dar Gargalhadas Bem Escandalosas".

1. Abra um afinador gratuito no celular ou pesquise "afinador" no Google.
2. Toque uma corda solta e veja a nota na tela.
3. Gire a tarraxa devagar até o ponteiro ficar no centro.
4. Sempre afine subindo até a nota. Se passou, desça abaixo e suba de novo: a corda trava melhor.
5. Afine as 6 e repita, porque a tensão de uma mexe nas outras.

Afine toda vez que pegar a guitarra.

## Glossário rápido
- **Casa:** cada espaço entre dois trastes (os filetes de metal).
- **Corda 1** é a mais fina (Mi agudo); **corda 6** é a mais grossa (Mi grave).
- **Dedos da mão esquerda:** 1 indicador, 2 médio, 3 anelar, 4 mindinho.
- **BPM:** batidas por minuto, a velocidade do metrônomo.
- **Base:** tocar acordes e ritmo. **Solo:** tocar melodias nota a nota.

As 5 regras do curso, os cuidados com o corpo e os recursos gratuitos ficam no Guia, na tela Curso.
`,
    exercises: [
      count('afinar', 'Afinar as 6 cordas sozinho', 'Marque o tempo no relógio. Anote quantos minutos levou.', 'min', 3, 'afinacao', true),
      check('cordas', 'Dizer as 6 cordas soltas de cor', 'Da 6 para a 1 e de volta, sem olhar. Toque cada uma enquanto fala o nome.'),
    ],
  },
  {
    phase: 'F0',
    title: 'Postura e palheta',
    goal: 'Tocar relaxado, com a palheta firme e o movimento vindo do pulso.',
    body: md`
## Postura
- **Sentado:** guitarra apoiada na perna direita, corpo encostado na barriga, braço levemente inclinado para cima.
- Costas retas, ombros soltos. Se o ombro dói, você está tenso.
- **Mão esquerda:** polegar atrás do braço, mais ou menos atrás do dedo 2. Pulso relaxado, sem dobrar demais.
- Aperte a corda **logo antes do traste**, não no meio da casa. Ponta do dedo, dedo arqueado.
- Use só a força necessária. Teste: aperte até soar, depois alivie sem perder o som.

## Palheta
- Segure entre o polegar e a lateral do indicador, com só 2 a 3 mm para fora.
- Comece com palheta média (0,60 a 0,73 mm): serve para base e para solo.
- O movimento vem do **pulso**, não do braço inteiro.
- Palhetada para baixo (⊓) e para cima (V). Alternar baixo-cima é a base de tudo.
- Apoie levemente a mão na ponte ou o mindinho no corpo para ter referência.

## Novo nesta versão
Grave 30 segundos de vídeo de lado, tocando. Compare com a lista acima. O celular mostra o que o espelho esconde.
`,
    exercises: [
      count('afinar', 'Afinar as 6 cordas sozinho', 'Meta mais apertada que na aula 1.', 'min', 2.5, 'afinacao', true),
      bpm('palhetada', 'Palhetada alternada em corda solta', '⊓ V ⊓ V, oito notas em cada corda, da 6 até a 1. Uma nota por batida.', 60, 'palhetada'),
      check('postura', 'Conferir a postura num vídeo', 'Ombros soltos, polegar atrás do dedo 2, pulso reto, dedo arqueado.'),
    ],
  },
  {
    phase: 'F0',
    title: 'Tablatura e diagramas',
    goal: 'Ler TAB e diagrama de acorde sem travar.',
    body: md`
## Como ler tablatura (TAB)
As 6 linhas são as 6 cordas. A linha de cima é a corda mais fina. Os números são as casas; 0 é corda solta.

~~~
e|-----------------0---|   corda 1 (mais fina)
B|---------------1-----|
G|-------------0-------|
D|-----------2---------|
A|---------3-----------|
E|---------------------|   corda 6 (mais grossa)
~~~

Esse é o acorde de Dó (C) tocado nota a nota, da corda 5 até a 1.

## Símbolos comuns
| Símbolo | Nome | Significado |
| 5h7 | Hammer-on | Toca a 5 e "martela" a 7 sem palhetar |
| 7p5 | Pull-off | Toca a 7 e "puxa" o dedo para soar a 5 |
| 7b9 | Bend | Toca a 7 e empurra a corda até soar como a 9 |
| 5/7 e 7\5 | Slide | Desliza o dedo de uma casa até a outra |
| 7~ | Vibrato | Oscila a nota |
| x | Abafada | Som percussivo, sem nota |
| PM | Palm mute | Abafa com a lateral da mão direita |

## Como ler diagrama de acorde
O diagrama é o braço visto de frente, em pé. Linhas verticais são as cordas (esquerda = corda 6). Horizontais são os trastes. Bolinha com número = qual dedo usar. Círculo vazio em cima = corda solta toca; × = não toque essa corda.

@acordes
C x32010 x32010

## A aranha, por escrito
~~~
e|-------------------------------------1-2-3-4-|
B|---------------------------------1-2-3-4-----|
G|-------------------------1-2-3-4-------------|
D|-----------------1-2-3-4---------------------|
A|---------1-2-3-4-----------------------------|
E|-1-2-3-4-------------------------------------|
~~~

## Seu primeiro riff
Um riff original nas cordas graves. Conte "1, 2, 3, 4" e toque uma nota por batida.

~~~
A|-------3-------3-2-0---|
E|-0-0-------0-3-------0-|
~~~
`,
    exercises: [
      count('afinar', 'Afinar as 6 cordas sozinho', 'Agora a meta do checklist da fase.', 'min', 2, 'afinacao', true),
      bpm('tab', 'Tocar o Dó nota a nota pela TAB', 'Da corda 5 até a 1, depois de volta. Cada nota limpa antes de seguir.', 60, 'tab'),
      bpm('riff1', 'Primeiro riff', 'Uma nota por batida, sem parar entre as voltas.', 70, 'riff1'),
    ],
  },

  // ── Fase 1 ──
  {
    phase: 'F1',
    title: 'Lá e Ré: os primeiros acordes',
    goal: 'Montar A e D limpos e começar a troca de um minuto.',
    body: md`
## Notação em linha
Cada acorde vira 6 números, da corda 6 (grave) até a 1 (aguda). x = não toca, 0 = solta. Exemplo: **x02220** = corda 6 não toca, corda 5 solta, cordas 4, 3 e 2 na casa 2, corda 1 solta.

@acordes
A x02220 x01230
D xx0232 xx0132

- **A (Lá maior):** três dedos lado a lado na casa 2.
- **D (Ré maior):** forma um triângulo. Não toque as cordas 6 e 5.

## Como montar um acorde limpo
1. Posicione os dedos e toque corda por corda, de cima para baixo.
2. Nota abafada ou trastejando? Ache o culpado: dedo deitado encostando na corda vizinha, ou dedo longe do traste.
3. Corrija e repita. Só depois toque todas juntas.

## A troca de um minuto
1. Escolha dois acordes.
2. Ligue o cronômetro de 1 minuto.
3. Toque um acorde uma vez, troque, toque o outro uma vez, troque… o mais rápido que conseguir com o acorde soando limpo.
4. Conte as trocas e anote aqui no app.

A meta sobe a cada aula até chegar a 30 trocas por minuto.
`,
    exercises: [
      check('montar', 'Montar A e D limpos, corda por corda', 'Cada corda soando, nenhuma abafada. Três vezes cada acorde.'),
      swap('ad', 'A', 'D', 15),
    ],
  },
  {
    phase: 'F1',
    title: 'Mi maior e a batida para baixo',
    goal: 'Somar o E e manter quatro batidas sem parar.',
    body: md`
@acordes
E 022100 023100

- **E (Mi maior):** todas as 6 cordas soam.

## Primeiras batidas
Só palhetadas para baixo, uma por batida, contando em voz alta.

~~~
Contagem:  1   2   3   4
Palheta:   ⊓   ⊓   ⊓   ⊓
~~~

Toque 4 vezes cada acorde e troque sem parar a batida. Se não deu tempo de trocar, toque as cordas soltas na última batida e chegue no acorde novo no "1". **O ritmo nunca para.**
`,
    exercises: [
      swap('de', 'D', 'E', 18),
      swap('ae', 'A', 'E', 18),
      bpm('batida', 'Quatro batidas em A, D e E', 'Quatro para baixo em cada acorde, sem parar na troca.', 60, 'batida4'),
    ],
  },
  {
    phase: 'F1',
    title: 'Lá menor e Mi menor',
    goal: 'Ouvir a diferença entre maior e menor e trocar entre eles.',
    body: md`
@acordes
Am x02210 x02310
Em 022000 023000

- **Am (Lá menor):** mesmo desenho do E, uma corda abaixo.
- **Em (Mi menor):** o mais fácil de todos.

Maior soa alegre, menor (m) soa triste. Toque A e depois Am e ouça: só uma nota mudou.

## Progressão da aula
~~~
| E | A | D | A |   quatro batidas em cada
~~~
`,
    exercises: [
      swap('ame', 'Am', 'E', 20),
      check('ouvir', 'Ouvir maior × menor', 'A → Am e E → Em, cinco vezes cada. Diga em voz alta qual é qual sem olhar a mão.'),
      bpm('prog', 'E – A – D – A sem parar', 'Quatro batidas para baixo em cada acorde.', 64, 'progressao'),
    ],
  },
  {
    phase: 'F1',
    title: 'Ré menor e os truques de troca',
    goal: 'Trocar mais rápido usando dedo âncora e dedo guia.',
    body: md`
@acordes
Dm xx0231 xx0231

- **Dm (Ré menor):** parecido com o D.

## Truques de troca
- **Dedo âncora:** se um dedo fica na mesma casa nos dois acordes, não tire ele. De D para Dm, o dedo na corda 3 não sai.
- **Dedo guia:** deslize o dedo pela corda em vez de levantar.
- Mova os dedos juntos, como um bloco, não um de cada vez.
- Olhe para onde os dedos vão antes de chegar lá.
`,
    exercises: [
      swap('dma', 'Dm', 'A', 20),
      swap('ddm', 'D', 'Dm', 22),
      bpm('prog', 'Am – Dm – E – Am', 'Quatro batidas em cada. Use dedo âncora e dedo guia.', 66, 'progressao'),
    ],
  },
  {
    phase: 'F1',
    title: 'Revisão: seis acordes no ritmo',
    goal: 'Consolidar A, D, E, Am, Em e Dm acima das metas anteriores.',
    review: true,
    body: md`
Revisão é onde a técnica assenta. As metas aqui ficam **acima** das aulas anteriores de propósito.

@acordes
A x02220 x01230
D xx0232 xx0132
E 022100 023100
Am x02210 x02310
Em 022000 023000
Dm xx0231 xx0231

## Corrente de oito
~~~
| A | D | E | A | Am | Dm | E | Am |
~~~
Quatro batidas em cada, sem parar entre as voltas.
`,
    exercises: [
      swap('ad', 'A', 'D', 26),
      swap('ame', 'Am', 'E', 26),
      bpm('corrente', 'Corrente de oito acordes', 'A – D – E – A – Am – Dm – E – Am, quatro batidas cada.', 70, 'progressao'),
    ],
  },
  {
    phase: 'F1',
    title: 'Sol e Dó, os teimosos',
    goal: 'Montar G e C limpos. São os mais difíceis no começo.',
    body: md`
@acordes
G 320003 210003
C x32010 x32010

- **G (Sol maior):** abra bem a mão.
- **C (Dó maior):** o mais difícil no início. Não desanime: todo guitarrista passou por ele.

As metas de troca **caem** nesta aula porque os acordes são novos. Elas voltam a subir nas próximas.
`,
    exercises: [
      swap('emg', 'Em', 'G', 15),
      swap('cg', 'C', 'G', 15),
      check('c', 'C limpo, corda por corda', 'Dez vezes. Cuidado com o dedo 3 encostando na corda 4.'),
    ],
  },
  {
    phase: 'F1',
    title: 'Progressões que tocam centenas de músicas',
    goal: 'Levar os 8 acordes para progressões reais.',
    body: md`
## Progressões
- **D – A – G – D** (folk, rock clássico)
- **G – D – Em – C** (a progressão de centenas de músicas pop)
- **Am – G – C – D**
- **E – A – D – A**

Procure músicas com esses acordes no Cifra Club usando o filtro de nível "fácil". Boas para começar: "Knockin' on Heaven's Door" (G, D, Am, C) e o começo de "Nothing Else Matters" (Em em cordas soltas).
`,
    exercises: [
      swap('amc', 'Am', 'C', 22),
      swap('gd', 'G', 'D', 22),
      bpm('prog', 'G – D – Em – C', 'Quatro batidas para baixo em cada, sem parar.', 70, 'progressao'),
    ],
  },
  {
    phase: 'F1',
    title: 'Revisão: oito acordes e duas músicas',
    goal: 'Chegar nas metas da prova: 30 trocas e duas músicas inteiras.',
    review: true,
    body: md`
Última aula da fase. Depois dela vem a **Prova de palco**: o checklist abaixo da fase, na tela Curso.

@acordes
G 320003 210003
C x32010 x32010
Em 022000 023000

## Pares para a meta de 30
A↔D, D↔E, A↔E, Am↔E, Em↔G, C↔G, Am↔C, Dm↔A, G↔D, C↔Em.
`,
    exercises: [
      swap('cem', 'C', 'Em', 30),
      swap('cg', 'C', 'G', 30),
      bpm('prog', 'G – D – Em – C', 'A meta da prova.', 76, 'progressao'),
      check('musicas', 'Tocar 2 músicas inteiras', 'Do começo ao fim, sem parar, mesmo errando.'),
    ],
  },

  // ── Fase 2 ──
  {
    phase: 'F2',
    title: 'Contagem e subdivisão',
    goal: 'Mão direita em movimento constante: desce no tempo, sobe no "e".',
    body: md`
Ritmo separa quem "sabe uns acordes" de quem toca de verdade. A regra de ouro: **a mão direita nunca para de balançar**, mesmo quando não encosta nas cordas.

## Tempo e contratempo
Um compasso 4/4 tem 4 tempos. Cada tempo divide em dois: o tempo ("1") e o contratempo ("e").

~~~
Contagem:  1  e  2  e  3  e  4  e
Mão:       ⊓  V  ⊓  V  ⊓  V  ⊓  V
~~~

No tempo a mão desce, no "e" a mão sobe. Sempre. Para criar uma batida, você só escolhe em quais movimentos encosta nas cordas.

## Batida 1: colcheias
~~~
⊓ V ⊓ V ⊓ V ⊓ V
~~~
`,
    exercises: [
      bpm('b1', 'Batida 1 em G – D – Em – C', 'Oito movimentos por compasso, um compasso por acorde.', 60, 'batida1'),
      check('contar', 'Contar em voz alta tocando', '"1 e 2 e 3 e 4 e" durante uma música inteira.'),
    ],
  },
  {
    phase: 'F2',
    title: 'A batida pop',
    goal: 'Dominar baixo, baixo-cima, cima-baixo-cima.',
    body: md`
Nas batidas abaixo, - significa que a mão passa **sem tocar**.

~~~
Batida 2 ("a batida pop"):   ⊓ - ⊓ V - V ⊓ V
                             1 e 2 e 3 e 4 e
~~~

É a batida mais usada no pop e no rock acústico. A mão continua descendo no "3", só não encosta.
`,
    exercises: [
      bpm('b2', 'Batida 2 em G – D – Em – C', 'Um compasso por acorde.', 64, 'batida2'),
      bpm('b2b', 'Batida 2 em Am – G – C – D', 'Mesma batida, outra progressão.', 64, 'batida2'),
    ],
  },
  {
    phase: 'F2',
    title: 'Power chords',
    goal: 'O acorde do rock e do metal, em qualquer casa.',
    body: md`
Só duas ou três notas: a fundamental e a quinta. Soam ótimos com distorção.

@acordes
G5 355xxx 134xxx
A5 577xxx 134xxx
C5 x355xx x134xx

- Dedo 1 na fundamental, dedo 3 (ou 3 e 4 juntos) duas casas à frente na corda de baixo.
- O mesmo desenho move para qualquer casa. A nota do dedo 1 dá o nome do acorde.
- Abafe as cordas que não toca encostando levemente a parte de baixo do dedo 1 nelas.

## Mapa de notas
| Corda | 0 | 1 | 2 | 3 | 5 | 7 | 8 | 10 | 12 |
| 6 (Mi) | E | F | F# | G | A | B | C | D | E |
| 5 (Lá) | A | A# | B | C | D | E | F | G | A |

## Riff de power chords
~~~
D|-5-5-7-7-5-5-3-3-|
A|-5-5-7-7-5-5-3-3-|
E|-3-3-5-5-3-3-1-1-|
    G5  A5  G5  F5
~~~
`,
    exercises: [
      bpm('pc', 'Riff de power chords', 'Colcheias, todas para baixo.', 70, 'powerchord'),
      count('achar', 'Achar um power chord pela nota', 'Peça a alguém (ou sorteie) uma nota e ache nas cordas 6 e 5. Anote o tempo médio.', 's', 5, 'acharpc', true),
    ],
  },
  {
    phase: 'F2',
    title: 'Palm mute e o galope',
    goal: 'O "tchug tchug" e o ritmo de cavalgada do heavy metal.',
    body: md`
## Palm mute (PM)
Apoie a lateral da mão direita (a parte da palma perto do mindinho) em cima das cordas, logo na frente da ponte. O som fica curto e encorpado.

- Muito para dentro do braço: som totalmente abafado, sem nota.
- Muito em cima da ponte: sem efeito.
- Ache o ponto do meio.

~~~
   PM-----------|           PM----|
E|-0-0-0-0-0-0-0-0-|-3-3-5-5-0-0-0-0-|
~~~

## Novo nesta versão: o galope
O ritmo de cavalgada que é marca do heavy metal clássico: uma colcheia e duas semicolcheias, "tá-ca-tá".

~~~
Contagem:  1    e  a    2    e  a
Palheta:   ⊓    ⊓  V    ⊓    ⊓  V
   PM-------------------------|
E|-0----0--0----0----0--0-----|
~~~

Comece devagar. O segredo é a mão relaxada e o palm mute constante.
`,
    exercises: [
      bpm('pm', 'Palm mute em colcheias na corda 6', 'Oito notas por compasso, som curto e igual.', 80, 'palmmute'),
      bpm('galope', 'Galope na corda 6 solta', 'Tá-ca-tá contínuo, com palm mute.', 70, 'galope'),
    ],
  },
  {
    phase: 'F2',
    title: 'Revisão: riff com palm mute',
    goal: 'Ligar e desligar o palm mute no meio do riff.',
    review: true,
    body: md`
Riff original juntando power chords, palm mute e corda solta. Onde não tem PM, deixe soar.

~~~
   PM-----|       PM-----|       PM-----|
D|---------5-5-----------7-7-----------9-9-7-7-|
A|---------5-5-----------7-7-----------9-9-7-7-|
E|-0-0-0-0-3-3---0-0-0-0-5-5---0-0-0-0-7-7-5-5-|
~~~

Os power chords são G5 (casa 3), A5 (casa 5) e B5 (casa 7) na corda 6. Tire o palm mute na hora do acorde e ponha de volta na corda solta.
`,
    exercises: [
      bpm('riff', 'Riff da aula', 'PM onde está marcado, power chord aberto no resto.', 90, 'riffpm'),
      bpm('galope', 'Galope na corda 6', 'Acima da meta da aula anterior.', 80, 'galope'),
    ],
  },
  {
    phase: 'F2',
    title: 'Abafamento e novas batidas',
    goal: 'Groove: misturar acordes soando com batidas abafadas.',
    body: md`
## Abafamento com a mão esquerda
Alivie a pressão dos dedos sem tirá-los das cordas: o acorde vira um "tchk" percussivo. Misturar acordes soando com batidas abafadas é o que dá groove (funk, reggae).

## Batidas 3 e 4
~~~
Batida 3 (balada):        ⊓ - ⊓ - ⊓ V ⊓ V
Batida 4 (reggae/ska):    - V - V - V - V
                          1 e 2 e 3 e 4 e
~~~

Na batida 2 com abafado, troque as batidas do "2" e do "4" por "tchk".
`,
    exercises: [
      bpm('abaf', 'Batida 2 com abafado no 2 e no 4', 'Em Am – G – C – D.', 70, 'abafado'),
      bpm('b4', 'Batida 4 (reggae)', 'Só no contratempo, em A – D – E.', 80, 'batida4r'),
    ],
  },
  {
    phase: 'F2',
    title: 'Blues de 12 compassos',
    goal: 'A estrutura mais importante da música popular.',
    body: md`
## Em Lá (A)
~~~
| A  | A  | A  | A  |
| D  | D  | A  | A  |
| E  | D  | A  | E  |
~~~

## O shuffle
Alterne a casa 2 e a casa 4 na corda 4 enquanto a corda 5 soa solta. Para D e E, faça o mesmo desenho nas cordas 4–3 e 6–5.

~~~
D|-2-2-4-4-2-2-4-4-|
A|-0-0-0-0-0-0-0-0-|
~~~
`,
    exercises: [
      bpm('shuffle', 'Shuffle em A', 'Dois compassos de A sem parar.', 70, 'shuffle'),
      check('forma', 'Estrutura de memória', 'Tocar os 12 compassos sem olhar a tela.'),
    ],
  },
  {
    phase: 'F2',
    title: 'Revisão: blues e rock',
    goal: 'Chegar nas metas da prova da fase.',
    review: true,
    body: md`
Última aula da Fase 2. Revise o que travou e vá para a Prova de palco.

## Sugestões de músicas com power chords
Procure no Cifra Club ou no Songsterr versões fáceis de: "Smoke on the Water" (Deep Purple), "Paranoid" (Black Sabbath), "Breaking the Law" (Judas Priest), "Come As You Are" (Nirvana).
`,
    exercises: [
      bpm('blues', 'Blues de 12 compassos inteiro', 'Com shuffle, sem parar entre as voltas.', 80, 'blues'),
      bpm('b2', 'Batida 2 em 4 progressões', 'Uma volta de cada progressão da Fase 1.', 80, 'batida2'),
      bpm('galope', 'Galope com power chords', 'G5 – A5 – C5 – A5, um compasso cada.', 90, 'galope'),
    ],
  },

  // ── Fase 3 ──
  {
    phase: 'F3',
    title: 'As 12 notas e a técnica de solo',
    goal: 'Conhecer o mapa do braço e preparar as duas mãos para o solo.',
    body: md`
## As 12 notas
~~~
C  C#  D  D#  E  F  F#  G  G#  A  A#  B  (volta ao C)
Dó Dó# Ré Ré# Mi Fá Fá# Sol Sol# Lá Lá# Si
~~~
- De uma nota para a vizinha: **meio tom** = 1 casa.
- **Um tom** = 2 casas.
- Entre **E–F** e **B–C** não existe sustenido: é só meio tom.
- C# é a mesma nota que Db.
- Na casa 12 tudo se repete uma oitava acima.

## Mão esquerda para solo
- Um dedo por casa numa região de 4 casas.
- Dedos perto da escala, sem levantar demais.
- Polegar mais baixo atrás do braço para alcançar; para bends, ele sobe e "abraça" o braço.

## Mão direita para solo
- Palhetada alternada sempre, mesmo trocando de corda.
- Movimentos pequenos: a palheta mal passa da corda.
- Abafe as cordas que não tocam: palma da mão direita nas graves, dedos livres da esquerda nas agudas. Com distorção é obrigatório.

~~~
e|-5-5-5-5-7-7-7-7-8-8-8-8-7-7-7-7-|
   ⊓ V ⊓ V ⊓ V ⊓ V ...
~~~
`,
    exercises: [
      count('notas', 'Notas da corda 6, casa 0 à 12', 'Toque e fale o nome de cada nota. Anote os segundos.', 's', 20, 'notas6', true),
      bpm('pal', 'Palhetada em uma corda, 4 por batida', 'O exercício da TAB acima.', 60, 'palhetada16'),
    ],
  },
  {
    phase: 'F3',
    title: 'Pentatônica menor: desenho 1',
    goal: 'A escala de solo mais usada no rock, no blues e no metal.',
    body: md`
Cinco notas: 1 – b3 – 4 – 5 – b7. Em Lá menor: **A C D E G**.

~~~
Pentatônica de Lá menor, desenho 1 (casa 5)

e|-----------------------------5-8-|
B|-------------------------5-8-----|
G|-------------------5-7-----------|
D|-------------5-7-----------------|
A|-------5-7-----------------------|
E|-5-8-----------------------------|
~~~

- Dedo 1 na casa 5 o tempo todo, dedo 3 na casa 7, dedo 4 na casa 8.
- As notas **A** estão na corda 6 casa 5, corda 4 casa 7 e corda 1 casa 5. Terminar uma frase nelas soa "resolvido".
- Mover o desenho muda o tom: casa 5 = Lá menor, casa 8 = Dó menor, casa 12 = Mi menor, casa 3 = Sol menor.

Suba e desça com metrônomo. Nas próximas aulas a meta passa para 2 e depois 4 notas por batida.
`,
    exercises: [
      bpm('p1', 'Desenho 1, uma nota por batida', 'Subindo e descendo, palhetada alternada.', 70, 'penta4'),
      check('raiz', 'Achar as 3 notas Lá do desenho', 'Toque só as fundamentais, de olhos fechados.'),
    ],
  },
  {
    phase: 'F3',
    title: 'Intervalos, hammer-on e pull-off',
    goal: 'Entender distâncias entre notas e ligar notas sem palhetar.',
    body: md`
## Intervalos
| Intervalo | Casas | Som / uso |
| 2ª menor | 1 | Tensão (tubarão) |
| 2ª maior | 2 | Passo de escala |
| 3ª menor | 3 | Define o acorde menor |
| 3ª maior | 4 | Define o acorde maior |
| 4ª justa | 5 | Estável, aberto |
| Trítono | 6 | Muita tensão: blues e metal |
| 5ª justa | 7 | Base do power chord |
| 6ª maior | 9 | Doce |
| 7ª menor | 10 | Som de blues |
| 7ª maior | 11 | Som de jazz e MPB |
| Oitava | 12 | Mesma nota, mais aguda |

## Hammer-on e pull-off
**Hammer-on (h):** toque a nota grave e "martele" o outro dedo na casa aguda, sem palhetar.
**Pull-off (p):** com os dois dedos posicionados, toque a aguda e puxe o dedo levemente para baixo, "beliscando" a corda.

~~~
e|-5h8-8p5-------|
B|---------5h8p5-|
~~~
`,
    exercises: [
      bpm('lig', 'Hammer-on e pull-off em todas as cordas', '5h8 e 8p5 da corda 1 à 6. Volume igual ao da nota palhetada.', 60, 'ligados'),
      bpm('p2', 'Desenho 1, duas notas por batida', 'Colcheias, palhetada alternada.', 60, 'penta8'),
    ],
  },
  {
    phase: 'F3',
    title: 'Revisão: pentatônica e ligados',
    goal: 'Tirar o "subir e descer" da cabeça com sequências.',
    review: true,
    body: md`
## Sequência em grupos de 3
Em vez de só subir e descer, toque 3 notas, volte uma, toque 3 de novo. Quebra a memória "de escada" e é a base de muitos solos.

~~~
e|---------------------------5-|
B|---------------------5-8---8-|
G|---------------5-7---7-------|
D|---------5-7---7-------------|
A|---5-7---7-------------------|
E|-5-8-------------------------|
   (5-8-5) (8-5-7) (5-7-5) ...
~~~
`,
    exercises: [
      bpm('p2', 'Desenho 1, duas notas por batida', 'Acima da aula anterior.', 72, 'penta8'),
      bpm('lig', 'Ligados em todas as cordas', 'Volume igual nas notas ligadas.', 72, 'ligados'),
      bpm('seq3', 'Sequência em grupos de 3', 'Três notas por batida (tercinas).', 60, 'seq3'),
    ],
  },
  {
    phase: 'F3',
    title: 'A escala maior e o slide',
    goal: 'Ouvir o dó-ré-mi na guitarra e deslizar entre posições.',
    body: md`
## Escala maior
Fórmula: **T T S T T T S** (tom, tom, semitom…). Em Dó: C D E F G A B C, só as notas naturais.

Toque na corda 2 começando na casa 1 (C) seguindo a fórmula para ouvir o "dó-ré-mi".

~~~
G maior, uma oitava (dedo 2 na fundamental)
D|---------------------2-4-5-|
A|---------------2-3-5-------|
E|-3-5-----------------------|
~~~

## Slide
Toque a nota e deslize o dedo mantendo a pressão até a outra casa. / sobe, \ desce.

~~~
G|-5/7-7\5-|
D|-5/7-7\5-|
~~~
`,
    exercises: [
      bpm('maior', 'Escala de G maior, uma oitava', 'Subindo e descendo, uma nota por batida.', 70, 'maior'),
      check('slide', 'Slides 5/7 e 7\\5 nas cordas 3 e 4', 'Sem perder o som no meio do caminho.'),
      bpm('p2', 'Desenho 1, duas notas por batida', 'A pentatônica não para.', 76, 'penta8'),
    ],
  },
  {
    phase: 'F3',
    title: 'Bend afinado',
    goal: 'Empurrar a corda até a nota certa, não "mais ou menos".',
    body: md`
Empurre a corda para cima (cordas 1, 2 e 3) até a nota subir. Use **3 dedos juntos**: dedo 3 apoiado pelo 2 e pelo 1. Gire o pulso, como uma maçaneta. O bend mais comum sobe 1 tom (2 casas).

## Afinação do bend
1. Toque a casa 9 da corda 3: essa é a nota alvo.
2. Toque a casa 7 e empurre até soar igual.
3. Release (r): depois do bend, volte a corda devagar.

~~~
G|-9---7b9---7b9r7-|
~~~

Conte quantos bends em 10 tentativas chegaram na nota certa.
`,
    exercises: [
      count('bend3', 'Bend de 1 tom na corda 3 (7b9)', 'Confira com a casa 9. Acertos em 10 tentativas.', 'acertos', 6, 'bend'),
      count('bend2', 'Bend de 1 tom na corda 2 (8b10)', 'Confira com a casa 10. Acertos em 10 tentativas.', 'acertos', 6, 'bend'),
    ],
  },
  {
    phase: 'F3',
    title: 'Vibrato e o Lick 1',
    goal: 'A assinatura do guitarrista e a primeira frase de rock.',
    body: md`
## Vibrato (~)
Pequenos bends repetidos e regulares. Comece lento e largo, mantendo o ritmo constante. Use o metrônomo: 2 oscilações por batida, depois 4.

## Lick 1: o clássico do rock
~~~
e|---------5-----|
B|-8b10r8-5--5~--|
~~~
`,
    exercises: [
      bpm('vib', 'Vibrato no tempo', 'Duas oscilações por batida na corda 2, casa 8.', 60, 'vibrato'),
      bpm('lick1', 'Lick 1 no tempo', 'Bend afinado e vibrato no fim.', 70, 'lick1'),
      count('bend3', 'Bend de 1 tom na corda 3', 'Acertos em 10.', 'acertos', 8, 'bend'),
    ],
  },
  {
    phase: 'F3',
    title: 'Revisão: os licks 1 e 2',
    goal: 'Frases no tempo, com bend e vibrato.',
    review: true,
    body: md`
## Lick 2: bend de 1 tom na corda 3
~~~
G|-7b9--7b9r7-5---|
D|---------------7~|
~~~

## Lick 1, mais rápido
~~~
e|---------5-----|
B|-8b10r8-5--5~--|
~~~
`,
    exercises: [
      bpm('lick2', 'Lick 2 no tempo', 'Release devagar, vibrato no fim.', 70, 'lick2'),
      bpm('lick1', 'Lick 1', 'Acima da aula anterior.', 80, 'lick1'),
      bpm('p2', 'Desenho 1, duas notas por batida', 'Colcheias.', 84, 'penta8'),
    ],
  },
  {
    phase: 'F3',
    title: 'Como os acordes são formados',
    goal: 'Montar qualquer acorde pela fórmula, e o Lick 3.',
    body: md`
Acorde = notas empilhadas em terças.

| Tipo | Fórmula | Em C | Cifra |
| Maior | 1 – 3 – 5 | C E G | C |
| Menor | 1 – b3 – 5 | C Eb G | Cm |
| Diminuto | 1 – b3 – b5 | C Eb Gb | C° |
| Aumentado | 1 – 3 – #5 | C E G# | C+ |
| Sétima | 1 – 3 – 5 – b7 | C E G Bb | C7 |
| Sétima maior | 1 – 3 – 5 – 7 | C E G B | C7M |
| Menor com sétima | 1 – b3 – 5 – b7 | C Eb G Bb | Cm7 |
| Meio-diminuto | 1 – b3 – b5 – b7 | C Eb Gb Bb | Cm7(b5) |
| Suspenso | 1 – 4 – 5 | C F G | Csus4 |

## Lick 3: descida com pull-off
~~~
e|-8p5---------|
B|-----8p5-----|
G|---------7p5-|
D|------------7~|
~~~
`,
    exercises: [
      check('formula', 'Montar C, Cm e C7 pela fórmula', 'Ache as notas no braço antes de olhar o desenho pronto. Repita em G.'),
      bpm('lick3', 'Lick 3 no tempo', 'Pull-offs com volume igual.', 70, 'lick3'),
      bpm('p2', 'Desenho 1, duas notas por batida', 'Colcheias.', 86, 'penta8'),
    ],
  },
  {
    phase: 'F3',
    title: 'Campo harmônico maior',
    goal: 'Saber por que os acordes combinam e transpor qualquer música.',
    body: md`
Um acorde em cada nota da escala maior, usando só notas dela, sempre dá o mesmo padrão:

| Grau | I | ii | iii | IV | V | vi | vii° |
| Tipo | Maior | menor | menor | Maior | Maior | menor | dim |
| Em C | C | Dm | Em | F | G | Am | B° |
| Em G | G | Am | Bm | C | D | Em | F#° |
| Em D | D | Em | F#m | G | A | Bm | C#° |
| Em A | A | Bm | C#m | D | E | F#m | G#° |
| Em E | E | F#m | G#m | A | B | C#m | D#° |

G – D – Em – C funciona porque são os graus **I – V – vi – IV** de Sol.

- I – IV – V: rock, blues, sertanejo
- I – V – vi – IV: pop
- ii – V – I: jazz e bossa nova
- vi – IV – I – V: pop melancólico

Para transpor, troque os acordes pelos mesmos graus em outra linha da tabela.
`,
    exercises: [
      check('campo', 'Montar o campo de C, G, D, A e E de cabeça', 'Escreva num papel sem olhar a tabela. Confira.'),
      check('transpor', 'Transpor G – D – Em – C para A e tocar', 'Resposta: A – E – F#m – D. Toque com a Batida 2.'),
      bpm('p2', 'Desenho 1, duas notas por batida', 'Colcheias.', 88, 'penta8'),
    ],
  },
  {
    phase: 'F3',
    title: 'Relativo menor e o primeiro improviso',
    goal: 'Improvisar 1 minuto com frases que terminam em casa.',
    body: md`
## Tom relativo
Todo tom maior tem um relativo menor com as mesmas notas, começando no 6º grau. C maior e A menor usam as mesmas notas. Por isso a pentatônica de Lá menor serve para solar em Dó maior.

## Seu primeiro improviso
1. Procure no YouTube "A minor backing track blues" ou "Am backing track rock".
2. Use só o desenho 1 em Lá.
3. Comece com 3 notas. Frases curtas, com espaço: silêncio também é música.
4. Termine as frases na nota A.
5. Um bend e um vibrato em cada frase.
6. **Pergunta e resposta:** uma frase curta (pergunta), depois uma parecida que termina na fundamental (resposta).
`,
    exercises: [
      count('impro', 'Improviso sobre backing track em Am', 'Sem parar, sem travar. Anote os minutos.', 'min', 1, 'improviso'),
      check('pr', 'Cinco pares de pergunta e resposta', 'A resposta sempre termina na nota A.'),
    ],
  },
  {
    phase: 'F3',
    title: 'Revisão: improviso e ouvido',
    goal: 'Chegar nas metas da prova da Fase 3.',
    review: true,
    body: md`
## Ouvido, 5 minutos por dia
- Cante a nota antes de tocá-la.
- Tire melodias simples de ouvido ("Parabéns pra você", hinos de times, temas de jogos).
- Use o musictheory.net para treino de intervalos (gratuito).
`,
    exercises: [
      count('impro', 'Improviso sobre backing track', 'Use os 3 licks no meio das frases.', 'min', 2, 'improviso'),
      check('ouvido', 'Tirar "Parabéns pra você" de ouvido', 'Ache a primeira nota por tentativa e erro, depois as seguintes.'),
      bpm('p2', 'Desenho 1, duas notas por batida', 'A meta da prova.', 92, 'penta8'),
    ],
  },

  // ── Fase 4 ──
  {
    phase: 'F4',
    title: 'Pestana: a técnica',
    goal: 'Deitar o dedo 1 e fazer as 6 cordas soarem.',
    body: md`
- O dedo 1 deita sobre todas as cordas usando a **lateral óssea** (meio virado para o headstock), não a parte macia.
- Fique colado no traste.
- A força vem do **peso do braço** puxando para trás, não de esmagar com o polegar.
- Comece na casa 5 ou 7 e desça para a casa 1 aos poucos.
- Dói nas primeiras semanas. 5 minutos por dia, não 1 hora num dia só.

## Desenho de E (fundamental na corda 6)
@acordes
F 133211 134211
G 355433 134211

| Acorde | Casas | Em G (casa 3) |
| Maior | 133211 | 355433 |
| Menor | 133111 | 355333 |
| Sétima | 131211 | 353433 |
| Menor com 7 | 131111 | 353333 |
`,
    exercises: [
      check('p5', 'Pestana na casa 5, corda por corda', 'Desenho de E maior na casa 5 (A). Todas soando.'),
      count('f', 'F na casa 1: quantas cordas soam limpas', 'Toque corda por corda e conte.', 'cordas', 4, 'pestanaF'),
      swap('emg', 'Em', 'G (pestana casa 3)', 12),
    ],
  },
  {
    phase: 'F4',
    title: 'Pestana na corda 5 e o desenho 2',
    goal: 'Segundo desenho de pestana e o segundo pedaço do braço.',
    body: md`
## Desenho de A (fundamental na corda 5)
@acordes
C x35553 x13331
Cm x35543 x13421

| Acorde | Casas | Em C (casa 3) |
| Maior | x24442 | x35553 |
| Menor | x24432 | x35543 |
| Sétima | x24242 | x35353 |
| Menor com 7 | x24232 | x35343 |

No maior de corda 5 você pode fazer a casa de cima com o dedo 3 deitado. Quer Bm? B está na corda 5, casa 2: desenho de A menor na casa 2.

## Pentatônica, desenho 2 (casas 7-10)
~~~
e|-8---10-|
B|-8---10-|
G|-7---9--|
D|-7---10-|
A|-7---10-|
E|-8---10-|
~~~
Ligue ao desenho 1 com um slide da casa 7 à 9 na corda 3.
`,
    exercises: [
      swap('cg', 'C (x35553)', 'G (355433)', 15),
      bpm('d2', 'Pentatônica, desenho 2', 'Duas notas por batida.', 60, 'pentad2'),
      count('f', 'F na casa 1', 'Cordas soando limpas.', 'cordas', 5, 'pestanaF'),
    ],
  },
  {
    phase: 'F4',
    title: 'Tétrades e o desenho 3',
    goal: 'Os acordes de 4 notas da MPB, do jazz e do soul.',
    body: md`
Desenhos de 4 cordas, sem pestana. A corda com x é abafada.

| Tipo | Corda 6 (G) | Corda 5 (C) |
| 7M | 3x443x | x35453 |
| 7 | 3x343x | x35353 |
| m7 | 3x333x | x35343 |
| m7(b5) | 3x332x | x3434x |

@acordes
Dm7 x57565 x13121
G7 3x343x ------
C7M x35453 x13241

## ii – V – I em Dó
Dm7 → G7 → Cmaj7.

## Pentatônica, desenho 3 (casas 9-13)
~~~
e|-10---12-|
B|-10---13-|
G|-9----12-|
D|-10---12-|
A|-10---12-|
E|-10---12-|
~~~
`,
    exercises: [
      bpm('iivi', 'ii – V – I em Dó', 'Dm7 – G7 – Cmaj7, um compasso cada, batida 1.', 60, 'iivi'),
      bpm('d3', 'Pentatônica, desenho 3', 'Duas notas por batida.', 60, 'pentad3'),
      count('f', 'F na casa 1', 'Cordas soando limpas.', 'cordas', 6, 'pestanaF'),
    ],
  },
  {
    phase: 'F4',
    title: 'Revisão: pestanas no ritmo',
    goal: 'Pestana sem parar a batida e três desenhos ligados.',
    review: true,
    body: md`
## Progressão com pestanas
~~~
| F | Dm | Bb | C |   Batida 2, um compasso cada
~~~
@acordes
F 133211 134211
Dm x57765 x13421
Bb x13331 x12341
C x35553 x13331

F no desenho de E (casa 1). Dm, Bb e C no desenho de A (casas 5, 1 e 3). Repare como Bb e C são o mesmo desenho, duas casas de distância.

## Ligar desenhos
Suba o desenho 1, deslize para o 2, suba, deslize para o 3. Desça pelo mesmo caminho.
`,
    exercises: [
      bpm('pr', 'F – Dm – Bb – C com Batida 2', 'Sem parar na troca.', 70, 'pestanaRitmo'),
      bpm('ligar', 'Ligar os desenhos 1, 2 e 3', 'Com slides, duas notas por batida.', 66, 'ligar'),
      swap('fc', 'F', 'C (x35553)', 20),
    ],
  },
  {
    phase: 'F4',
    title: 'Outros sabores e os desenhos 4 e 5',
    goal: 'Sus, add9 e baixo invertido; o braço inteiro na pentatônica.',
    body: md`
@acordes
Asus2 x02200 x01200
Asus4 x02230 x01240
Cadd9 x32033 x21034
D/F# 200232 -00132

- **sus2 / sus4:** troque a terça pela 2ª ou 4ª.
- **add9:** muito usado no pop e rock acústico.
- **Slash (baixo invertido):** C/G = 332010, D/F# = 200232. Criam linhas de baixo entre os acordes.

## Desenhos 4 e 5
~~~
Desenho 4 (casas 12-15)     Desenho 5 (casas 14-17)
e|-12---15-|                e|-15---17-|
B|-13---15-|                B|-15---17-|
G|-12---14-|                G|-14---17-|
D|-12---14-|                D|-14---17-|
A|-12---15-|                A|-15---17-|
E|-12---15-|                E|-15---17-|
~~~
O desenho 5 também existe uma oitava abaixo, nas casas 2-5.
`,
    exercises: [
      bpm('slash', 'G – D/F# – Em – C', 'Batida 2. Ouça o baixo descendo.', 70, 'slash'),
      bpm('d45', 'Pentatônica, desenhos 4 e 5', 'Duas notas por batida.', 60, 'pentad45'),
    ],
  },
  {
    phase: 'F4',
    title: 'CAGED e a escala blues',
    goal: 'Ver o acorde em 5 lugares e usar a blue note.',
    body: md`
## CAGED
Todo acorde maior pode ser tocado com 5 desenhos que se encaixam ao longo do braço, sempre nessa ordem: C → A → G → E → D → C…

| Desenho | Onde fica | Casa (acorde de Dó) |
| C | Acorde aberto de C | 0 a 3 |
| A | Pestana de A, fundamental na corda 5 | 3 a 5 |
| G | Desenho de G deslocado | 5 a 8 |
| E | Pestana de E, fundamental na corda 6 | 8 a 10 |
| D | Desenho de D deslocado | 10 a 13 |

Cada desenho de acorde tem uma pentatônica ao redor. Estudar o CAGED liga acorde e solo no mesmo mapa.

## Escala blues
Pentatônica menor + a b5 (blue note). Em Lá: A C D Eb E G. No desenho 1, a blue note fica na corda 5 casa 6 e na corda 3 casa 8.

~~~
G|-5-7-8-|   use a casa 8 de passagem: 7-8-7 ou 5-7-8-7-5
D|-5-7---|
A|-5-6-7-|
~~~
Não pare em cima da blue note: ela é tensão, passe por ela.
`,
    exercises: [
      count('caged', 'Dó nos 5 desenhos do CAGED', 'Do aberto até a casa 13 e de volta. Anote os segundos.', 's', 30, 'caged', true),
      bpm('blues', 'Escala blues, desenho 1', 'Duas notas por batida.', 70, 'bluesEscala'),
    ],
  },
  {
    phase: 'F4',
    title: 'Tríades, inversões e pentatônica maior',
    goal: 'Acordes leves nas cordas agudas e o som doce do blues.',
    body: md`
## Tríades nas cordas 3, 2 e 1 (Dó maior)
| Inversão | Casas | Notas |
| Estado fundamental | 5 – 5 – 3 | C E G |
| 1ª inversão | 9 – 8 – 8 | E G C |
| 2ª inversão | 12 – 13 – 12 | G C E |

Faça o mesmo para Am, F e G e toque a progressão sem sair de uma região do braço.

## Pentatônica maior
A pentatônica de Lá menor tem as mesmas notas da de Dó maior. Para a pentatônica de **Lá maior**, use o desenho 1 três casas abaixo (casa 2).

No blues em Lá, misture: menor (casa 5) para som pesado, maior (casa 2) para som doce, country e B.B. King.
`,
    exercises: [
      bpm('triades', 'C – Am – F – G em tríades', 'Mesma região do braço, uma por compasso.', 60, 'triades'),
      count('mix', 'Blues em A misturando menor e maior', 'Improviso. Troque de desenho a cada volta.', 'min', 2, 'improviso'),
    ],
  },
  {
    phase: 'F4',
    title: 'Revisão: o braço inteiro em outros tons',
    goal: 'Os 5 desenhos em Mi e em Sol.',
    review: true,
    body: md`
O desenho 1 começa onde está a fundamental na corda 6:
- **Mi menor:** casa 12 (ou corda solta).
- **Sol menor:** casa 3.

Toque os 5 desenhos em cada tom. Depois atravesse o braço inteiro em **uma corda só**, e depois em duas.
`,
    exercises: [
      check('mi', 'Os 5 desenhos em Mi menor', 'Do desenho 1 ao 5, ligados.'),
      check('sol', 'Os 5 desenhos em Sol menor', 'Do desenho 1 ao 5, ligados.'),
      bpm('corda', 'Atravessar o braço numa corda só', 'Pentatônica de Lá na corda 3, da casa 2 à 14.', 70, 'umaCorda'),
    ],
  },
  {
    phase: 'F4',
    title: 'Dedilhado e notas-alvo',
    goal: 'Base com os dedos e solo que conversa com o acorde.',
    body: md`
## Dedilhado
- Polegar (p) nas cordas 6, 5 e 4; indicador (i) na 3; médio (m) na 2; anelar (a) na 1.
- Padrão básico: **p – i – m – a – m – i** (6 notas por acorde).
- Travis picking: o polegar alterna entre duas cordas graves sem parar enquanto os dedos tocam melodia em cima. Leva semanas.

## Notas-alvo
O salto de "tocar escala" para "fazer música" é mirar nas notas do acorde que está tocando.
- No blues em A, quando vai para D, termine frases em D ou F#.
- Quando vai para E, mire em E ou G#.

Grave (ou use backing track) Am – Dm – Em lento. Toque só as fundamentais quando o acorde muda. Depois só as terças. Depois misture com a escala.
`,
    exercises: [
      bpm('ded', 'p-i-m-a-m-i em Am – C – D – F', 'Um acorde por compasso.', 60, 'dedilhado'),
      check('fund', 'Notas-alvo: só fundamentais', 'Am – Dm – Em, uma volta inteira.'),
      check('terc', 'Notas-alvo: só terças', 'C, F e G nas mesmas trocas.'),
    ],
  },
  {
    phase: 'F4',
    title: 'Fraseado',
    goal: 'O que faz um solo soar bem.',
    body: md`
1. **Espaço:** silêncio entre frases. Respire como um cantor.
2. **Repetição com variação:** repita uma ideia mudando o final.
3. **Ritmo:** a mesma nota com ritmos diferentes já é uma frase nova. Tercinas e notas longas.
4. **Dinâmica:** varie a força da palhetada. Comece calmo, termine intenso.
5. **Construa:** comece grave e lento, suba de região e de intensidade no fim.
6. **Bends com intenção:** 1/2 tom, 1 tom, 1 tom e meio; pré-bend (empurre antes de palhetar e solte).
7. **Double stops:** duas notas juntas nas cordas 1 e 2 ou 2 e 3, estilo Chuck Berry.

~~~
e|-5--5--5-8-|
B|-5--5--5-8-|   double stops na pentatônica
~~~
`,
    exercises: [
      count('impro', 'Improviso com espaço entre as frases', 'Uma frase, uma pausa do mesmo tamanho.', 'min', 3, 'improviso'),
      bpm('ds', 'Double stops estilo Chuck Berry', 'Colcheias nas cordas 1 e 2.', 80, 'doublestop'),
      check('prebend', 'Pré-bend e bend de 1/2 tom', 'Cinco de cada, afinados.'),
    ],
  },
  {
    phase: 'F4',
    title: 'Revisão: solos de outros guitarristas',
    goal: 'Vocabulário dos mestres e o primeiro ouvido de verdade.',
    review: true,
    body: md`
Escolha solos curtos e famosos (Pink Floyd, Guns N' Roses, AC/DC, Iron Maiden, Legião Urbana, Charlie Brown Jr., Eric Clapton, B.B. King). Estude com a tablatura do Cifra Club ou do Songsterr e diminua a velocidade do vídeo no YouTube (configurações → velocidade 0,5×).

Depois de aprender, **roube 3 frases** de cada solo e use no seu improviso, mudando um detalhe.

## Tirar de ouvido
Escolha uma frase de 4 notas, ache a primeira no braço por tentativa e erro, depois as seguintes. É lento no começo e é o treino que mais desenvolve o músico.
`,
    exercises: [
      check('solo', 'Aprender um solo completo', 'Do começo ao fim, na velocidade original ou a 75%.'),
      check('ouvido', 'Tirar uma frase de 4 notas de ouvido', 'Sem tablatura.'),
      check('gravar', 'Gravar um improviso e ouvir', 'Anote uma coisa boa e uma para melhorar.'),
    ],
  },

  // ── Fase 5 ──
  {
    phase: 'F5',
    title: 'Escala maior em 3 notas por corda',
    goal: 'Os desenhos feitos para velocidade.',
    body: md`
Os 7 desenhos de 3 notas por corda cobrem o braço inteiro e deixam a palhetada sempre igual: 3 notas, troca de corda, 3 notas.

~~~
G maior, desenho 1 (3 notas por corda)
e|-------------------------------------5-7-8-|
B|-------------------------------5-7-8-------|
G|-------------------------4-5-7-------------|
D|-------------------4-5-7-------------------|
A|-------------3-5-7-------------------------|
E|-------3-5-7-------------------------------|
~~~

Corda por corda: 3-5-7, 3-5-7, 4-5-7, 4-5-7, 5-7-8, 5-7-8. Os próximos desenhos começam na nota seguinte da corda 6 (casa 5, depois casa 7).
`,
    exercises: [
      bpm('3n', 'G maior, 3 notas por corda, desenho 1', 'Colcheias, palhetada alternada.', 70, 'tres'),
      check('3n23', 'Desenhos 2 e 3', 'Começando na casa 5 e na casa 7 da corda 6.'),
    ],
  },
  {
    phase: 'F5',
    title: 'Modos: dórico e eólio',
    goal: 'Ouvir o que uma única nota muda no clima.',
    body: md`
Os modos são a mesma escala maior começando em outro grau.

| Modo | Grau | Fórmula | Clima | Use sobre |
| Jônio | I | = maior | Alegre, estável | Maior, 7M |
| Dórico | ii | menor com 6ª maior | Menor "pra cima", funk, Santana | m7, groove menor |
| Frígio | iii | menor com b2 | Espanhol, metal | m, metal, flamenco |
| Lídio | IV | maior com #4 | Sonhador, trilha de filme | 7M(#11) |
| Mixolídio | V | maior com b7 | Rock, blues, baião | Acordes 7 |
| Eólio | vi | = menor natural | Triste, épico | Menor comum |
| Lócrio | vii | menor com b2 e b5 | Instável | m7(b5) |

Grave um Am7 por 2 minutos. Improvise com A dórico (tem F#), depois A eólio (tem F). Ouça a diferença que uma nota faz.
`,
    exercises: [
      count('dor', 'Improviso em A dórico sobre Am7', 'Mire na nota F#.', 'min', 2, 'improviso'),
      count('eol', 'Improviso em A eólio sobre Am7', 'Mire na nota F.', 'min', 2, 'improviso'),
      bpm('3n', '3 notas por corda, desenho 1', 'Acima da aula anterior.', 80, 'tres'),
    ],
  },
  {
    phase: 'F5',
    title: 'Modos: mixolídio, frígio e lídio',
    goal: 'O som do metal (frígio), do rock (mixolídio) e do cinema (lídio).',
    body: md`
- **Mixolídio** sobre A7: escala maior com b7 (G natural). Rock, blues, baião.
- **Frígio** sobre Em: a b2 (F natural) é o som do metal e do flamenco. Experimente com palm mute na corda 6 solta e a casa 1.
- **Lídio** sobre Fmaj7: a #4 (B natural) soa sonhadora.

~~~
Riff frígio em E
   PM---------|
E|-0-0-0-1-0-0-3-1-0-|
~~~
`,
    exercises: [
      count('mix', 'Mixolídio sobre A7', 'Improviso.', 'min', 2, 'improviso'),
      count('fri', 'Frígio sobre Em, pegada metal', 'Riff + improviso.', 'min', 2, 'improviso'),
      check('lid', 'Lídio sobre Fmaj7', 'Uma frase que termina na #4 (B).'),
    ],
  },
  {
    phase: 'F5',
    title: 'Revisão: improviso modal',
    goal: 'Escolher o modo pelo acorde, sem pensar demais.',
    review: true,
    body: md`
## Menor harmônica
Menor natural com a 7ª maior (G#, em Lá). Som neoclássico e árabe, usado sobre o acorde V7 em tom menor (E7 em Lá menor).

## Desafio
Mesmo acorde, 3 modos, 1 minuto cada. Grave e ouça sem saber qual é qual.
`,
    exercises: [
      check('tres', 'Mesmo acorde, 3 modos, 1 minuto cada', 'Am7: dórico, eólio, frígio.'),
      bpm('3n', '3 notas por corda, desenho 1', 'Colcheias.', 90, 'tres'),
      check('harm', 'Menor harmônica em A sobre E7', 'Termine na nota A.'),
    ],
  },
  {
    phase: 'F5',
    title: 'Arpejos',
    goal: 'Fazer o solo desenhar a harmonia.',
    body: md`
Arpejo = notas do acorde tocadas uma a uma.

~~~
Arpejo de Lá menor (A C E), fundamental na corda 6
e|----------------------5-8-|
B|--------------------5-----|
G|------------------5-------|
D|--------------7-----------|
A|----------7---------------|
E|-5-8----------------------|
~~~

Aprenda arpejos de tríades (maior, menor) e de tétrades (7M, 7, m7, m7b5) nos 5 desenhos do CAGED. Sobre cada acorde de uma música, toque o arpejo dele.
`,
    exercises: [
      bpm('arp', 'Arpejo de Am, fundamental na corda 6', 'Colcheias, subindo e descendo.', 70, 'arpejo'),
      check('arp251', 'Arpejos sobre ii – V – I', 'Dm7, G7 e Cmaj7, um arpejo por acorde.'),
    ],
  },
  {
    phase: 'F5',
    title: 'Palhetada rápida e econômica',
    goal: 'Velocidade como consequência de precisão.',
    body: md`
- **Palhetada alternada rápida:** metrônomo, suba 4 BPM por dia só quando estiver 100% limpo. Grupos de 3, 4 e 6 notas por corda.
- **Palhetada econômica:** ao trocar de corda na mesma direção do movimento, aproveite o embalo (duas palhetadas seguidas para baixo).

~~~
Grupo de 6 (3 notas por corda, duas cordas)
B|-------5-7-8-|
G|-4-5-7-------|
   ⊓ V ⊓ V ⊓ V
~~~
`,
    exercises: [
      bpm('seis', 'Grupos de 6 em semicolcheias', '3 notas por corda, palhetada alternada.', 70, 'velocidade'),
      bpm('econ', 'Palhetada econômica em arpejo de 3 cordas', 'Duas para baixo na troca de corda.', 70, 'economica'),
    ],
  },
  {
    phase: 'F5',
    title: 'Sweep e tapping',
    goal: 'Duas técnicas de efeito, feitas devagar e limpas.',
    body: md`
## Sweep picking
Um único movimento "varrendo" as cordas, uma nota por corda. A mão esquerda solta cada nota logo após tocar.

~~~
Sweep de 3 cordas em Am
e|-------12h17p12------|
B|----13----------13---|
G|-14---------------14-|
   ⊓  ⊓  ⊓   (h  p)  V  V
~~~

## Tapping
Um dedo da mão direita "martela" uma nota aguda no braço.

~~~
Tapping em Am (t = toque com a mão direita)
e|-12t-5-8-12t-5-8-12t-5-8-|
~~~
`,
    exercises: [
      bpm('sweep', 'Sweep de 3 cordas em Am', 'Tercinas. Nenhuma nota pode soar junto com a outra.', 60, 'sweep'),
      bpm('tap', 'Tapping em Am', 'Tercinas, volume igual nas três notas.', 70, 'tapping'),
    ],
  },
  {
    phase: 'F5',
    title: 'Legato, harmônicos e bends avançados',
    goal: 'A mão esquerda fazendo quase todo o trabalho.',
    body: md`
- **Legato:** frases quase só com hammer-ons e pull-offs, palhetando só a primeira nota de cada corda. Treine a força dos dedos 3 e 4.
- **Harmônicos naturais:** encoste sem apertar sobre os trastes 12, 7 e 5.
- **Pinch harmonic:** a lateral do polegar encosta na corda logo após a palheta. O "grito" do metal.
- **Bends avançados:** 1 tom e meio, bend em uníssono, bend com vibrato.
`,
    exercises: [
      bpm('leg', 'Legato na pentatônica', 'Palhete só a primeira nota de cada corda.', 80, 'legato'),
      count('pinch', 'Pinch harmonic', 'Acertos em 10 tentativas.', 'acertos', 6, 'pinch'),
      count('bend15', 'Bend de 1 tom e meio na corda 2', 'Confira com a nota alvo. Acertos em 10.', 'acertos', 7, 'bend15'),
    ],
  },
  {
    phase: 'F5',
    title: 'Harmonia e ritmo avançados',
    goal: 'Acordes que puxam, ritmos que ninguém espera.',
    body: md`
## Harmonia
- **Extensões:** 9, 11, 13 (C7M(9), G13, Am7(11)).
- **Dominantes secundários:** um acorde 7 que "puxa" para qualquer grau. Em C, E7 leva para Am, A7 leva para Dm.
- **Empréstimo modal:** acordes do tom menor no tom maior. Em C, tocar Fm ou Bb.
- **Substituição de trítono:** trocar G7 por Db7.
- **Condução de vozes:** inversões em que as notas mudam o mínimo.

## Ritmo
- Semicolcheias (16 movimentos por compasso) para funk e soul.
- Ghost notes e abafamento percussivo constante.
- Compassos ímpares (5/4, 7/8).
- Gravar-se: o treino mais honesto que existe.
`,
    exercises: [
      bpm('funk', 'Semicolcheias com ghost notes', 'E9 parado, 16 movimentos por compasso.', 80, 'funk'),
      check('dom', 'C – A7 – Dm – G7', 'Ouça o A7 puxando para o Dm.'),
      check('sete', 'Riff em 7/8', 'Conte 1-2-3-4-5-6-7 e repita sem perder o 1.'),
    ],
  },
  {
    phase: 'F5',
    title: 'Criar seu estilo',
    goal: 'Compor, tocar com gente e escolher seu caminho.',
    review: true,
    body: md`
- Componha **um riff por semana** e **uma música por mês**.
- Toque com outras pessoas: amigos, igreja, jam sessions. Tocar em grupo acelera tudo.
- Estude um estilo novo a cada trimestre (blues, funk, jazz, metal, MPB, country) e leve 2 ou 3 ideias de cada para o seu jeito de tocar.

Depois desta aula vem a última prova. Passou nela, a guitarra recebe a pintura final.
`,
    exercises: [
      check('riff', 'Compor um riff', 'Grave no celular. Dê um nome.'),
      check('qualquer', 'Improvisar num tom sorteado', 'Sorteie uma nota e improvise 2 minutos nela.'),
      check('autoral', 'Tocar uma música sua do começo ao fim', 'Pode ser curta. Precisa ser sua.'),
    ],
  },
];

export const LESSONS = RAW.map((l, i) => ({ ...l, id: `L${i + 1}`, n: i + 1, review: Boolean(l.review) }));

// A guitarra começa crua; cada prova aprovada pinta de novo (`paint` da fase).
export const BASE_PAINT = 'Madeira crua';
export function currentPaint(state) {
  const passed = PHASES.filter((p) => state.exams[p.id]?.passedAt);
  return passed.length ? passed[passed.length - 1].paint : BASE_PAINT;
}

export const lessonById = (id) => LESSONS.find((l) => l.id === id);
export const phaseById = (id) => PHASES.find((p) => p.id === id);
export const lessonsOf = (phaseId) => LESSONS.filter((l) => l.phase === phaseId);
export const exercisesFor = (lesson) => [warmup(lesson.n), ...lesson.exercises];

// ── Guia ───────────────────────────────────────────────────────────────────
export const GUIDE = md`
## As 5 regras do aprendiz
1. **Pouco todo dia vence muito no fim de semana.** 30 minutos diários rendem mais que 4 horas no domingo. Dedos e cérebro aprendem dormindo entre os treinos.
2. **Devagar e limpo antes de rápido.** Velocidade é consequência de precisão. Errou, diminua o andamento.
3. **Use metrônomo sempre.** O FORJA tem um em cada exercício. Suba de 4 em 4.
4. **Toque músicas desde a primeira semana.** Exercício sem música vira chatice; música sem exercício vira estagnação.
5. **Só avance de fase depois da Prova de palco.**

## Como o FORJA funciona
- Você faz a aula quando quiser. Concluir a aula libera a lista de exercícios.
- Treine essa lista até a próxima aula. A próxima abre depois de 3 dias de treino completo.
- O dia de treino conta quando todos os exercícios estão marcados. O dia vira às 4h da manhã.
- Domingo é descanso: não treinar não quebra a ofensiva.
- A cada 7 treinos seguidos você ganha uma palheta reserva (até 2). Ela salva sozinha um dia perdido.
- Cada fase termina numa Prova de palco. Passou, a guitarra ganha pintura nova.

## Cuidados com o corpo
- Dor nas pontas dos dedos nas primeiras semanas é normal: vira calo.
- Dor no pulso, antebraço ou ombro **não é normal**. Pare, relaxe, revise a postura e alongue.
- Pausa de 1 minuto a cada 20 minutos de treino.

## Recursos gratuitos
| Para quê | Recurso | Observação |
| Curso em vídeo | JustinGuitar | Site e YouTube, em inglês com legendas. O app é pago; use o site |
| Curso universitário | Berklee — Introdução à Guitarra (Coursera) | Legendas em português; escolha "auditar" |
| Aulas em português | Iniciantes do Violão e Guitarra (YouTube) | Passo a passo |
| Técnicas | Cursa | Bend, vibrato, slide, hammer-on, palm mute |
| Cifras e TABs | Cifra Club, Songsterr | Filtro por dificuldade |
| Afinador | Afinador Cifra Club, Pano Tuner, BOSS Tuner, gStrings | Ou pesquise "afinador" no Google |
| Backing tracks | YouTube | "A minor backing track", "blues in A backing track" |
| Ouvido e teoria | musictheory.net | No navegador |
| Simulador de amp (Linux) | Guitarix | sudo pacman -S guitarix, com JACK ou PipeWire |
| Simulador de amp (Windows) | Neural Amp Modeler | Código aberto |

Para ligar a guitarra no computador é preciso uma interface de áudio. É opcional: um amplificador comum ou um violão bastam para o curso inteiro.
`;
