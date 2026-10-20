# FORJA — design do app de treino de guitarra

Data: 2026-10-20 · Uso pessoal, publicado no GitHub Pages.

## Objetivo

Transformar o "Curso de Guitarra: do Zero ao Avançado" num app diário com
ofensiva, medalhas e um plano de aulas que fica um pouco mais difícil a cada aula.
Visual inspirado em heavy metal, com leitura garantida.

## Ritmo flexível

- 52 aulas em 6 fases, sem calendário fixo:
  0 Fundamentos · 1 Acordes abertos · 2 Ritmo · 3 Teoria + Solo I ·
  4 Pestana + Solo II · 5 Avançado.
- Concluir a aula libera de 3 a 5 exercícios com meta numérica, que são o
  "treino" até a próxima aula.
- A próxima aula abre após 3 dias de treino na lista atual. "Modo livre" em
  Ajustes abre tudo.
- Fim de fase = Prova de palco (checklist do módulo). Precisa cumprir para abrir a
  próxima fase.

## Progressão de dificuldade

- Metas numéricas sobem aula a aula (BPM, trocas por minuto, notas por batida,
  duração de improviso).
- Aquecimento contínuo: aranha 60→100 BPM (aulas 1–11), aranha em colcheias 60→112 (12–25), pentatônica em semicolcheias 56→120 (26–52).
- Aulas de revisão ao longo de cada fase, com metas acima das originais.

## Ofensiva

- Conta o dia quando todos os exercícios da lista estão marcados.
- Domingo é descanso: não quebra a ofensiva; treinar no domingo conta.
- O dia vira às 4h.
- A cada 7 dias seguidos: +1 palheta reserva (máx. 2), gasta automaticamente
  num dia perdido.
- Recorde sempre preservado.

## Medalhas (patches da jaqueta de batalha)

Ofensiva (3, 7, 14, 30, 60, 100, 200, 365), uma por fase, marcos de técnica e
algumas secretas. Bloqueadas aparecem em contorno com a condição.

## Telas

Hoje · Curso · Aula · Medalhas · Ajustes. Metrônomo (Web Audio) que abre no BPM
da meta e cronômetro de 1 minuto.

## Animação e 3D

- GSAP: entrada de cada tela (uma por tela), contador da ofensiva, patch sendo
  costurado, sequência de conclusão de aula.
- Three.js: uma Flying V modelada em código aparece ao concluir uma aula e ao passar
  numa prova. Cada prova aprovada dá uma pintura nova (madeira crua → obsidiana e ouro). Carregamento tardio, qualidade menor no celular,
  imagem SVG estática de reserva, desligada com `prefers-reduced-motion`.

## Técnica

HTML, CSS e JavaScript puro (módulos ES), sem build. GSAP e Three.js copiados
para `vendor/` para funcionar offline. PWA com service worker. Dados em
`localStorage`, com exportar/importar backup e lembrete a cada 14 dias.

## Fora de escopo

Afinador, sincronização entre aparelhos, gráficos de progresso.
