import { test } from 'node:test';
import assert from 'node:assert/strict';
import { render } from '../js/markup.js';

test('parágrafo com negrito e escape', () => {
  assert.equal(render('Toque **forte** <já>'), '<p>Toque <strong>forte</strong> &lt;já&gt;</p>');
});

test('lista e lista numerada', () => {
  assert.equal(render('- a\n- b'), '<ul><li>a</li><li>b</li></ul>');
  assert.equal(render('1. a\n2. b'), '<ol><li>a</li><li>b</li></ol>');
});

test('TAB preserva espaços e barras invertidas', () => {
  const html = render('```\ne|-7\\5-|\nB|-----|\n```');
  assert.ok(html.startsWith('<pre class="tab"><code>e|-7\\5-|\nB|-----|'));
});

test('tabela com cabeçalho', () => {
  const html = render('| A | B |\n| 1 | 2 |');
  assert.ok(html.includes('<th scope="col">A</th>'));
  assert.ok(html.includes('<td>2</td>'));
});

test('subtítulo seguido de texto no mesmo bloco', () => {
  assert.equal(render('## Título\nTexto'), '<h3>Título</h3><p>Texto</p>');
});

test('acordes viram diagramas', () => {
  const html = render('@acordes\nA x02220 x01230');
  assert.ok(html.includes('aria-label="Acorde A: x02220"'));
  assert.equal((html.match(/class="dot"/g) || []).length, 3);
});
