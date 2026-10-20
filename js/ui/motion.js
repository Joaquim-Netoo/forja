// Animações da interface. Todas são opcionais: sem GSAP ou com
// prefers-reduced-motion, o conteúdo aparece direto, sem movimento.

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const G = () => (reduced() ? null : window.gsap);

// Uma entrada por tela, curta: troca de aba acontece dezenas de vezes por dia.
export function enter(root) {
  const g = G();
  const items = root.querySelectorAll('[data-enter]');
  if (!g || !items.length) return;
  const tw = g.fromTo(items, { y: 10, autoAlpha: 0 }, {
    y: 0, autoAlpha: 1, duration: 0.28, ease: 'power3.out', stagger: 0.04, clearProps: 'transform,opacity,visibility',
  });
  // Trava de segurança: se o navegador segurar os quadros (aba em segundo
  // plano, aparelho lento), o conteúdo aparece mesmo assim.
  setTimeout(() => tw.progress(1), 1200);
}

// Ofensiva subindo: o número conta e dá um tranco, a chama acende.
export function streakUp(el, from, to) {
  const g = G();
  if (!g || !el) return;
  const num = el.querySelector('[data-streak]');
  // Anima o <span> em volta da chama: animar um <svg> solto faz o GSAP
  // reinseri-lo no DOM fora de ordem (ele mede o SVG fora da página).
  const flame = el.querySelector('.flame-box');
  const counter = { v: from };
  num.textContent = from;
  const tl = g.timeline();
  tl.to(counter, {
    v: to, duration: 0.5, ease: 'power2.out', onUpdate: () => { num.textContent = Math.round(counter.v); },
  })
    .fromTo(num, { scale: 1.12, transformOrigin: '20% 90%' }, { scale: 1, duration: 0.6, ease: 'back.out(2.2)', clearProps: 'transform' }, 0)
    .fromTo(flame, { scale: 0.4, transformOrigin: '50% 100%' }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.45)', clearProps: 'transform' }, 0.1);
}

// Patch sendo costurado: a linha percorre a borda, o patch assenta.
// `wrap` é o elemento HTML em volta do <svg> do patch.
export function sew(wrap, delay = 0) {
  const g = G();
  if (!g || !wrap) return;
  const path = wrap.querySelector('.sew');
  const tl = g.timeline({ delay });
  tl.fromTo(wrap, { scale: 1.3, rotation: -12, autoAlpha: 0, transformOrigin: '50% 50%' }, {
    scale: 1, rotation: 0, autoAlpha: 1, duration: 0.45, ease: 'back.out(1.7)', clearProps: 'transform,opacity,visibility',
  });
  if (path) {
    tl.fromTo(path, { strokeDasharray: 100, strokeDashoffset: 100 }, {
      strokeDashoffset: 0, duration: 1.1, ease: 'none', clearProps: 'strokeDasharray,strokeDashoffset',
    }, 0.15);
  }
}

export function fadeIn(el, y = 20) {
  const g = G();
  if (!g) return null;
  return g.fromTo(el, { y, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: 'power3.out' });
}

export function fadeOut(el, done) {
  const g = G();
  if (!g) { done(); return; }
  g.to(el, { y: 10, autoAlpha: 0, duration: 0.2, ease: 'power2.in', onComplete: done });
}
