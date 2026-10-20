// Palco: aparece ao concluir uma aula ou passar numa prova.
// A Flying V em 3D carrega só aqui; sem WebGL ou com movimento reduzido,
// entra uma silhueta estática no lugar.
import { icon } from './html.js';
import { reduced } from './motion.js';
import { escape } from '../markup.js';

const SWATCH = {
  'Madeira crua': '#b5824f',
  'Preto fosco': '#262626',
  'Vermelho-sangue': '#86070e',
  'Branco osso': '#e8dfcc',
  'Aço escovado': '#9da3ab',
  'Ouro velho': '#a07c34',
  'Obsidiana e ouro': '#0b0b0b',
};

const silhouette = (color) => `<svg viewBox="-1.25 -3.75 2.5 5.5" aria-hidden="true">
  <g transform="scale(1,-1) rotate(-24)">
    <path fill="${color}" stroke="#c9a45a" stroke-width="0.03" d="M-0.24 0.44 L-1.02 -1.38 Q-1.07 -1.58 -0.86 -1.61 L-0.66 -1.57 L-0.07 -0.66 Q0 -0.56 0.07 -0.66 L0.66 -1.57 L0.86 -1.61 Q1.07 -1.58 1.02 -1.38 L0.24 0.44 Q0 0.6 -0.24 0.44Z"/>
    <rect x="-0.1" y="0.3" width="0.2" height="2.5" fill="#24160f"/>
    <path fill="${color}" stroke="#c9a45a" stroke-width="0.03" d="M-0.11 2.8 L-0.22 3.42 L0 3.62 L0.22 3.42 L0.11 2.8Z"/>
    <rect x="-0.18" y="0.2" width="0.36" height="0.14" fill="#0d0d0d"/>
    <rect x="-0.18" y="-0.13" width="0.36" height="0.14" fill="#0d0d0d"/>
  </g></svg>`;

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function celebrate({
  kicker, title, sub, paint, newPaint = false, action = 'Bora treinar',
}) {
  const dlg = document.getElementById('stage');
  dlg.innerHTML = `<div class="stage-frame">
      <div class="fallback">${silhouette(SWATCH[paint] ?? '#b5824f')}</div>
      <canvas aria-hidden="true"></canvas>
    </div>
    <p class="stage-hint" hidden>Arraste para girar</p>
    <div class="stage-copy">
      <h2 class="stage-title" id="stage-title">${escape(title)}</h2>
      <p class="stage-sub"><strong>${escape(kicker)}.</strong> ${escape(sub)}</p>
      <p class="stage-paint"><i style="background:${SWATCH[paint] ?? '#b5824f'}"></i>${newPaint ? 'Pintura nova' : 'Pintura'}: ${escape(paint)}</p>
      <button class="btn" type="button" data-done>${escape(action)} ${icon('play')}</button>
    </div>`;

  const frame = dlg.querySelector('.stage-frame');
  const canvas = dlg.querySelector('canvas');
  const fallback = dlg.querySelector('.fallback');
  const copy = [...dlg.querySelectorAll('.stage-copy > *')];
  const gsap = reduced() ? null : window.gsap;
  let scene = null;
  let closed = false;

  canvas.style.opacity = '0';
  dlg.showModal();
  dlg.querySelector('[data-done]').focus({ preventScroll: true });

  if (gsap) {
    // Movimento-assinatura: o palco abre como uma persiana a partir do centro.
    gsap.timeline()
      .fromTo(frame, { clipPath: 'inset(50% 0% 50% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power4.out' }, 0)
      .fromTo(copy, { y: 26, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out', stagger: 0.08,
      }, 0.55)
      .fromTo(dlg.querySelector('.stage-title'), { scale: 1.08, transformOrigin: '0% 100%' }, { scale: 1, duration: 0.7, ease: 'back.out(2)' }, 0.63);
  }

  if (!reduced() && webglOk()) {
    import('./guitar3d.js').then(({ createGuitar }) => {
      if (closed) return;
      scene = createGuitar(canvas, paint);
      fallback.hidden = true;
      canvas.style.opacity = '1';
      dlg.querySelector('.stage-hint').hidden = false;
      scene.intro(gsap);
    }).catch(() => { /* sem 3D: a silhueta continua */ });
  }

  return new Promise((resolve) => {
    const onCancel = (e) => { e.preventDefault(); finish(); };
    // Navegar (botão voltar do celular, por exemplo) também fecha o palco.
    function finish() {
      if (closed) return;
      closed = true;
      window.removeEventListener('hashchange', finish);
      dlg.removeEventListener('cancel', onCancel);
      scene?.dispose();
      dlg.close();
      dlg.innerHTML = '';
      resolve();
    }
    dlg.querySelector('[data-done]').addEventListener('click', finish);
    dlg.addEventListener('cancel', onCancel);
    window.addEventListener('hashchange', finish);
  });
}
