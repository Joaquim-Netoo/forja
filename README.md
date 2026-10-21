# Forja

App pessoal de treino de guitarra, do zero ao avançado. 52 aulas em 6 discos, com
ofensiva diária, patches de medalha numa jaqueta de batalha e uma Flying V em 3D
realista no topo da tela. Visual "palco e papel", inspirado em heavy metal: o palco
escuro carrega a emoção; setlist, encarte, ingresso e passe de backstage carregam
o que se lê e se faz.

**Abrir o app:** <https://joaquim-netoo.github.io/forja/>

Funciona no navegador, instala no celular como app (PWA) e roda offline.
Seus dados ficam só no seu navegador.

## Como funciona

- **Aulas no seu ritmo.** Faça a aula quando quiser. Ao concluir, ela libera de 3 a
  5 exercícios com meta numérica, que viram o seu treino diário até a próxima aula.
- **Mais difícil a cada aula.** As metas sobem (BPM, trocas por minuto, notas por
  batida, minutos de improviso). O aquecimento acompanha o ano todo: aranha a
  60 BPM na aula 1 até pentatônica a 120 BPM em semicolcheias na aula 52.
- **A próxima aula abre** depois de 3 dias de treino completo com a lista atual.
- **Prova de palco** no fim de cada fase: o checklist do módulo. Passou, a fase
  seguinte abre e a guitarra ganha pintura nova (madeira crua → preto fosco →
  vermelho-sangue → branco osso → aço escovado → ouro velho → obsidiana e ouro).
- **Ofensiva:** o dia conta quando todos os exercícios estão marcados. Domingo é
  descanso e não quebra nada. O dia vira às 4h da manhã. A cada 7 treinos seguidos
  você ganha uma palheta reserva (até 2), que salva sozinha um dia perdido.
- **Medalhas:** 26 patches em 4 grupos: ofensiva, fases, marcos de técnica e secretas.
- **Ferramentas:** metrônomo com acento no tempo 1 (abre já no BPM da meta) e
  cronômetro de 1 minuto com contagem 3-2-1 para a troca de acordes.
- **Guitarra 3D:** fica no topo da tela Hoje com a pintura atual. Arraste para
  girar; toque para soltar um power chord distorcido (som desligável em Ajustes).
  No celular ela usa qualidade menor e só renderiza quando algo se mexe.
- **Movimento:** transições entre telas, número da ofensiva rolando, caneta riscando
  o setlist, carimbo de "treino feito", discos e encarte animados na rolagem. Tudo
  desliga com a opção do sistema "reduzir movimento".
- **Modo livre** em Ajustes abre todas as aulas e provas.

## Rodar no computador

Módulos ES não abrem direto do arquivo; precisa de um servidor local qualquer:

```bash
python -m http.server 5173
```

Depois abra <http://localhost:5173>.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (pode ser privado se sua conta tiver Pages para
   privados; senão, público).
2. Envie esta pasta:

   ```bash
   git init
   git add .
   git commit -m "Forja: primeira versão"
   git branch -M main
   git remote add origin https://github.com/Joaquim-Netoo/forja.git
   git push -u origin main
   ```

3. No GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**,
   escolha `main` e a pasta `/ (root)`. Em um ou dois minutos o app fica em
   `https://joaquim-netoo.github.io/forja/`.
4. No celular, abra esse endereço e use **Adicionar à tela inicial**.

### Atualizar depois

Ao mudar arquivos, troque `VERSION` em `sw.js` (por exemplo `forja-v2`) antes de
enviar. Assim o celular baixa a versão nova em vez de usar o cache.

## Backup

Os dados ficam no `localStorage` do navegador. Em **Ajustes → Exportar** você baixa
um arquivo `forja-backup-AAAA-MM-DD.json`; em **Importar** você restaura. O app
lembra de fazer backup a cada 14 dias. Faça antes de trocar de celular ou limpar
o navegador.

## Testes

A lógica (ofensiva, liberação de aulas, medalhas, currículo, backup) tem testes
com o runner nativo do Node 22+:

```bash
node --test tests/*.test.js
```

## Estrutura

```
index.html            casca, navegação, import map
css/                  tokens (cores, tipos) e estilos
js/app.js             roteador e eventos
js/curriculum.js      as 52 aulas, provas, aquecimento progressivo e guia
js/streak.js          ofensiva e palhetas reserva
js/progress.js        liberação de aulas e provas
js/medals.js          os 26 patches
js/views/             telas: hoje, curso, aula, prova, medalhas, ajustes
js/ui/                metrônomo, cronômetro, patches, animações, guitarra 3D
vendor/               GSAP e Three.js (cópia local para funcionar offline)
tests/                testes da lógica
docs/                 design e plano
```

## Créditos

- [GSAP](https://gsap.com) 3.13 com ScrollTrigger, SplitText e Flip, licença padrão GreenSock (uso gratuito).
- [Three.js](https://threejs.org) r169, licença MIT (`vendor/LICENSE-three.txt`).
- Fontes Chivo e Grenze Gotisch via Google Fonts, licença SIL Open Font.
- Conteúdo das aulas baseado no curso "Curso de Guitarra: do Zero ao Avançado".
