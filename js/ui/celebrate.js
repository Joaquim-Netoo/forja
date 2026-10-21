// Palco de celebração: aula concluída, prova aprovada ou "ver a guitarra".
// Usa o mesmo palco 3D da tela Hoje (o canvas muda de lugar). Sem 3D,
// fica a silhueta estática.
import { icon } from './html.js';
import { reduced } from './motion.js';
import { escape } from '../markup.js';
import { loadStage } from './stage.js';
import { hexFor, silhouette } from './paints.js';

export function celebrate({
  kicker, title, sub, paint, fromPaint = null, newPaint = false, action = 'Bora treinar',
}) {
  const dlg = document.getElementById('stage');
  dlg.innerHTML = `<div class="stage-frame">
      <div class="fallback">${silhouette(paint)}</div>
      <div class="host"></div>
    </div>
    <p class="stage-hint" hidden>Arraste para girar · toque para tocar</p>
    <div class="stage-copy">
      <h2 class="stage-title" id="stage-title">${escape(title)}</h2>
      <p class="stage-sub"><strong>${escape(kicker)}.</strong> ${escape(sub)}</p>
      <p class="stage-paint"><i style="background:${hexFor(paint)}"></i>${newPaint ? 'Pintura nova' : 'Pintura'}: ${escape(paint)}</p>
      <button class="btn" type="button" data-done>${escape(action)} ${icon('play')}</button>
    </div>`;

  const frame = dlg.querySelector('.stage-frame');
  const host = dlg.querySelector('.host');
  const fallback = dlg.querySelector('.fallback');
  const copy = [...dlg.querySelectorAll('.stage-copy > *')];
  const gsap = reduced() ? null : window.gsap;
  let stage = null;
  let closed = false;
  let titleSplit = null;

  dlg.showModal();
  dlg.querySelector('[data-done]').focus({ preventScroll: true });

  if (gsap) {
    // Movimento-assinatura: o palco abre como uma persiana a partir do centro.
    const tl = gsap.timeline();
    tl.fromTo(frame, { clipPath: 'inset(50% 0% 50% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power4.out' }, 0);
    if (window.SplitText) {
      titleSplit = window.SplitText.create(dlg.querySelector('.stage-title'), { type: 'chars', mask: 'chars' });
      tl.from(titleSplit.chars, { yPercent: 110, duration: 0.8, stagger: 0.05, ease: 'power4.out' }, 0.7);
    }
    tl.fromTo(copy.slice(1), { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.1, ease: 'power3.out' }, 0.95);
  }

  loadStage().then((s) => {
    if (closed || !s) return;
    stage = s;
    stage.mount(host, { mode: 'stage', paint: fromPaint ?? paint });
    fallback.hidden = true;
    dlg.querySelector('.stage-hint').hidden = false;
    stage.stageIntro(gsap, { from: fromPaint, to: newPaint ? paint : null });
  });

  return new Promise((resolve) => {
    const onCancel = (e) => { e.preventDefault(); finish(); };
    // Navegar (botão voltar do celular, por exemplo) também fecha o palco.
    function finish() {
      if (closed) return;
      closed = true;
      window.removeEventListener('hashchange', finish);
      dlg.removeEventListener('cancel', onCancel);
      titleSplit?.revert();
      if (stage?.mountedIn === host) stage.unmount();
      dlg.close();
      dlg.innerHTML = '';
      resolve();
    }
    dlg.querySelector('[data-done]').addEventListener('click', finish);
    dlg.addEventListener('cancel', onCancel);
    window.addEventListener('hashchange', finish);
  });
}
