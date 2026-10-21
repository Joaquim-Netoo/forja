# FORJA v2 — "Palco e papel"

Data: 2026-10-20. Substitui a camada visual da v1; lógica, currículo e dados ficam.

## Por que mudar

Na v1 o usuário apontou quatro problemas: caixas demais (tudo com o mesmo peso),
pouca cara de metal, ruim no celular e pesado de ler (escuro, muita caixa alta).

## Conceito

O app é o mundo de uma banda em turnê.

- **Palco** carrega a emoção: fundo escuro granulado, luz vermelha, a Flying V 3D,
  a ofensiva em letra gótica.
- **Papel impresso** carrega o que se lê e se faz: setlist colado com fita
  (treino do dia), encarte (aula), ingresso (próxima aula), passe de backstage
  (prova), patches na jaqueta (medalhas).

Tinta escura sobre papel osso resolve a leitura; um objeto forte por tela resolve
as caixas; o layout nasce no celular (polegar embaixo, alvos de 48px).

## Telas

- **Hoje:** palco no topo com a guitarra 3D girável (toque toca um power chord
  distorcido, som desligável) e o número da ofensiva atrás dela. Setlist em papel:
  linha por exercício; tocar abre detalhes; marcar risca com caneta. Dia completo:
  carimbo + faíscas. Próxima aula como ingresso.
- **Curso (discografia):** fase = disco com capa gerada (cor da pintura que dá,
  número gótico), tracklist, fases futuras em preto e branco. Prova = passe de
  backstage.
- **Aula (encarte):** papel claro, títulos em caixa normal, barra de leitura,
  TAB/acordes com rolagem lateral, dedos dos acordes aparecendo em ordem.
- **Medalhas:** jaqueta com textura de tecido; patches costurados na rolagem.
- **Ajustes:** som da guitarra liga/desliga, backup, modo livre.

## Guitarra realista

Corpo com borda arredondada e verniz (clearcoat), veios de madeira gerados em canvas,
braço arredondado, escala de jacarandá, trastes arredondados, marcações de
madrepérola iridescente, tarraxas com botão e bucha, captadores cromados com
parafusos e moldura, ponte com 6 rastilhos, placa em V, cordas até as tarraxas,
knobs, chave seletora, "Forja" dourado na mão. Celular: qualidade reduzida,
renderiza sob demanda, pausa fora da tela. Sem WebGL ou com movimento reduzido:
silhueta estática.

## Movimento (GSAP 3.13: core, ScrollTrigger, SplitText)

Transição entre telas, abertura do palco, títulos com SplitText, revelações e
scrub com ScrollTrigger (aula, discografia, jaqueta, papel sobre o palco), risco
de caneta, carimbo, faíscas, indicador da aba. `prefers-reduced-motion` desliga
deslocamentos e mantém só opacidade.

## Tipografia e cor

Grenze Gotisch (números e títulos de palco) + Chivo (todo o resto, caixa normal).
Palco #0b0908 / osso #efe7da / vermelho #d32730 / dourado #c9a45a.
Papel #ebe3d2 / tinta #1b1612 / tinta secundária #5a4f45 / caneta #c4161c.
