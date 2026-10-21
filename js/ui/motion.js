// Camada de movimento (GSAP 3.13 + ScrollTrigger + SplitText + Flip).
// Tudo é opcional: sem GSAP ou com prefers-reduced-motion, o conteúdo aparece
// direto, sem deslocamento.

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const G = () => (reduced() ? null : window.gsap);

let ctx = null;
let mm = null;

export function setup() {
  const g = window.gsap;
  if (!g) return;
  const plugins = [window.ScrollTrigger, window.SplitText, window.Flip].filter(Boolean);
  g.registerPlugin(...plugins);
  g.defaults({ ease: 'power3.out' });
}

export function cleanup() {
  ctx?.revert();
  mm?.revert();
  ctx = null;
  mm = null;
}

// Saída rápida da tela atual antes de trocar o conteúdo.
export function leave(view) {
  const g = G();
  if (!g || !view.children.length) return Promise.resolve();
  return new Promise((done) => {
    g.to(view, {
      autoAlpha: 0, y: -12, duration: 0.18, ease: 'power2.in',
      onComplete: () => { g.set(view, { clearProps: 'all' }); done(); },
    });
  });
}

// ── Utilidades das aberturas ────────────────────────────────────────────
const split = (el, vars) => (el && window.SplitText ? window.SplitText.create(el, vars) : null);

function headIntro(view, tl, at = 0) {
  const h1 = view.querySelector('.page-head h1');
  const s = split(h1, { type: 'chars', mask: 'chars' });
  if (s) tl.from(s.chars, { yPercent: 105, duration: 0.7, stagger: 0.035, ease: 'power4.out' }, at);
  tl.from(view.querySelectorAll('.page-head p'), { y: 14, autoAlpha: 0, duration: 0.5 }, at + 0.25);
}

// Esconde o que está fora da tela e revela em lote ao rolar.
function revealOnScroll(targets, vars = {}) {
  const g = window.gsap;
  const below = targets.filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.92);
  if (!below.length) return;
  g.set(below, { autoAlpha: 0, y: vars.y ?? 26 });
  window.ScrollTrigger.batch(below, {
    start: 'top 92%',
    once: true,
    onEnter: (els) => g.to(els, {
      autoAlpha: 1, y: 0, duration: vars.duration ?? 0.6, stagger: 0.08, overwrite: true,
    }),
  });
}

function chordFingers(fig) {
  const g = window.gsap;
  const fingers = [...fig.querySelectorAll('.finger')].sort((a, b) => (a.dataset.f || 9) - (b.dataset.f || 9));
  if (!fingers.length) return;
  g.set(fingers, { scale: 0, transformOrigin: '50% 50%' });
  window.ScrollTrigger.create({
    trigger: fig,
    start: 'top 88%',
    once: true,
    onEnter: () => g.to(fingers, {
      scale: 1, duration: 0.4, stagger: 0.16, ease: 'back.out(2.4)', delay: 0.15,
    }),
  });
}

// ── Aberturas por tela ──────────────────────────────────────────────────
const INTROS = {
  hoje(view) {
    const g = window.gsap;
    const tl = g.timeline();
    const s = split(view.querySelector('[data-number]'), { type: 'chars' });
    if (s) tl.from(s.chars, { yPercent: 70, rotation: 10, autoAlpha: 0, duration: 0.95, stagger: 0.09, ease: 'power4.out' }, 0.1);
    tl.from(view.querySelectorAll('.hero-copy > *'), { y: 18, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 0.4)
      .from(view.querySelectorAll('.facts > div, .week li'), { y: 12, autoAlpha: 0, duration: 0.45, stagger: 0.025 }, 0.55);
    const paper = view.querySelector('[data-paper]');
    if (paper) {
      tl.from(paper, { y: 150, rotation: 5, autoAlpha: 0, duration: 1.05, ease: 'power4.out' }, 0.45)
        .from(paper.querySelectorAll('.tape'), { scaleX: 0, transformOrigin: 'left center', duration: 0.35, stagger: 0.12, ease: 'power2.out' }, 1.15)
        .from(paper.querySelectorAll('.song'), { x: -18, autoAlpha: 0, duration: 0.5, stagger: 0.07 }, 0.9);
    }
    view.querySelectorAll('[data-reveal]').forEach((el) => {
      g.from(el, {
        y: 50, rotation: -2, autoAlpha: 0, duration: 0.85,
        scrollTrigger: { trigger: el, start: 'top 94%', once: true },
      });
    });
    // No celular, o papel desliza por cima do palco: o palco afunda e escurece.
    mm = g.matchMedia();
    mm.add('(max-width: 979px)', () => {
      const st = { trigger: view.querySelector('.hero'), start: 'top top', end: 'bottom top', scrub: 0.5 };
      g.to(view.querySelector('.hero-canvas'), { yPercent: 18, scale: 0.9, autoAlpha: 0.45, ease: 'none', scrollTrigger: st });
      g.to(view.querySelector('[data-number]'), { yPercent: 40, autoAlpha: 0.3, ease: 'none', scrollTrigger: { ...st } });
    });
  },

  curso(view) {
    const g = window.gsap;
    headIntro(view, g.timeline());
    view.querySelectorAll('.album').forEach((album) => {
      const tl = g.timeline({ scrollTrigger: { trigger: album, start: 'top 88%', once: true } });
      tl.from(album.querySelector('.cover'), {
        rotationY: -50, x: -36, autoAlpha: 0, transformPerspective: 900, duration: 1, ease: 'power4.out',
      })
        .from(album.querySelectorAll('.album-meta > *'), { y: 16, autoAlpha: 0, stagger: 0.06, duration: 0.5 }, 0.15)
        .from(album.querySelector('.meter span'), { scaleX: 0, duration: 1.1, ease: 'power2.out' }, 0.35)
        .from(album.querySelectorAll('.track'), { y: 10, autoAlpha: 0, stagger: 0.03, duration: 0.4 }, 0.35);
    });
  },

  aula(view) {
    const g = window.gsap;
    const tl = g.timeline();
    const sn = split(view.querySelector('.lesson-num'), { type: 'chars' });
    if (sn) tl.from(sn.chars, { yPercent: -50, autoAlpha: 0, duration: 1, stagger: 0.09, ease: 'power4.out' }, 0);
    const sh = split(view.querySelector('.lesson-stage h1'), { type: 'lines,words', mask: 'lines' });
    if (sh) tl.from(sh.words, { yPercent: 110, duration: 0.75, stagger: 0.04, ease: 'power4.out' }, 0.12);
    tl.from(view.querySelectorAll('.lesson-stage .goal-line, .lesson-stage .meta'), { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.08 }, 0.45)
      .from(view.querySelector('.liner'), { y: 100, autoAlpha: 0, duration: 1, ease: 'power4.out' }, 0.4);
    const liner = view.querySelector('.liner');
    g.to(view.querySelector('[data-progress]'), {
      scaleX: 1, ease: 'none', scrollTrigger: { trigger: liner, start: 'top 30%', end: 'bottom bottom', scrub: 0.3 },
    });
    revealOnScroll(g.utils.toArray(view.querySelectorAll('.prose > :not(pre):not(.chords)')));
    view.querySelectorAll('.chord').forEach(chordFingers);
    view.querySelectorAll('pre.tab').forEach((pre) => {
      g.fromTo(pre, { clipPath: 'inset(0 100% 0 0)' }, {
        clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: pre, start: 'top 90%', once: true },
      });
    });
    const plan = view.querySelector('.plan-paper');
    if (plan) g.from(plan, { y: 60, rotation: 4, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: plan, start: 'top 94%', once: true } });
  },

  prova(view) {
    const g = window.gsap;
    const tl = g.timeline();
    tl.from(view.querySelector('.lanyard'), { scaleY: 0, transformOrigin: 'top center', duration: 0.5, ease: 'power2.out' })
      .from(view.querySelector('[data-pass]'), { y: -280, rotation: -16, autoAlpha: 0, duration: 1.5, ease: 'elastic.out(1, 0.5)' }, 0.15)
      .from(view.querySelector('.exam-paper'), { y: 110, rotation: 4, autoAlpha: 0, duration: 0.95, ease: 'power4.out' }, 0.45)
      .from(view.querySelectorAll('.exam-paper .song'), { x: -16, autoAlpha: 0, stagger: 0.06, duration: 0.45 }, 0.85);
    const stamp = view.querySelector('.pass-card .stamp');
    if (stamp) tl.from(stamp, { scale: 2.6, rotation: -26, autoAlpha: 0, duration: 0.45, ease: 'back.out(1.8)' }, 1.2);
  },

  medalhas(view) {
    const g = window.gsap;
    headIntro(view, g.timeline());
    const got = [...view.querySelectorAll('.patch:not(.locked) .patch-art')];
    const locked = [...view.querySelectorAll('.patch.locked')];
    g.set(got, { autoAlpha: 0 });
    window.ScrollTrigger.batch(got, { start: 'top 92%', once: true, onEnter: (els) => els.forEach((el, i) => sew(el, i * 0.12)) });
    revealOnScroll(locked, { y: 12 });
    view.querySelectorAll('.patch.locked').forEach((el) => {
      if (el.getBoundingClientRect().top <= window.innerHeight * 0.92) g.from(el, { autoAlpha: 0, y: 12, duration: 0.5, delay: 0.3 });
    });
  },

  ajustes(view) {
    const g = window.gsap;
    const tl = g.timeline();
    headIntro(view, tl);
    tl.from(view.querySelectorAll('.setting'), { y: 18, autoAlpha: 0, stagger: 0.06, duration: 0.5 }, 0.3);
  },

  guia(view) {
    const g = window.gsap;
    headIntro(view, g.timeline());
    revealOnScroll(g.utils.toArray(view.querySelectorAll('.prose > *')));
  },
};

export function intro(name, view) {
  cleanup();
  const g = G();
  if (!g || !INTROS[name]) return;
  ctx = g.context(() => INTROS[name](view), view);
}

// ── Microinterações ─────────────────────────────────────────────────────
export function strike(li, on) {
  const g = G();
  if (!g) return;
  const path = li.querySelector('.strike path');
  const mark = li.querySelector('.mark');
  if (on) {
    g.fromTo(mark, { strokeDashoffset: 60 }, { strokeDashoffset: 0, duration: 0.28, ease: 'power2.out' });
    g.fromTo(path, { strokeDashoffset: 400 }, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut', delay: 0.08 });
  } else {
    g.to([path, mark], { strokeDashoffset: (i) => (i ? 60 : 400), duration: 0.22, ease: 'power2.in', clearProps: 'strokeDashoffset' });
  }
}

export function countFlip(el, text, full) {
  const g = G();
  const apply = () => { el.textContent = text; el.classList.toggle('full', full); };
  if (!g) { apply(); return; }
  g.timeline()
    .to(el, { yPercent: -60, autoAlpha: 0, duration: 0.12, ease: 'power2.in', onComplete: apply })
    .fromTo(el, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.28 });
}

export function stampIn(stamp, paper) {
  stamp.hidden = false;
  const g = G();
  if (!g) return;
  g.fromTo(stamp, { scale: 2.6, rotation: -26, autoAlpha: 0 }, { scale: 1, rotation: -9, autoAlpha: 1, duration: 0.45, ease: 'back.out(1.8)' });
  if (paper) g.fromTo(paper, { x: -7, rotation: -1.4 }, { x: 0, rotation: -0.6, duration: 0.7, ease: 'elastic.out(1, 0.3)', delay: 0.32 });
}

export function stampOut(stamp) {
  const g = G();
  if (!g) { stamp.hidden = true; return; }
  g.to(stamp, { autoAlpha: 0, scale: 1.2, duration: 0.2, ease: 'power2.in', onComplete: () => { stamp.hidden = true; g.set(stamp, { clearProps: 'all' }); } });
}

// Número da ofensiva rolando para o valor novo.
export function bumpNumber(el, value) {
  el.textContent = value;
  const g = G();
  const s = split(el, { type: 'chars' });
  if (!g || !s) return;
  g.timeline({ onComplete: () => s.revert() })
    .from(s.chars, { yPercent: 80, rotation: 12, autoAlpha: 0, duration: 0.7, stagger: 0.07, ease: 'back.out(1.6)' })
    .fromTo(el, { scale: 1.08 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.4)', transformOrigin: '20% 90%', clearProps: 'transform' }, 0);
}

// Faíscas de palco saindo de um ponto (dia completo).
export function sparks(container, from) {
  const g = G();
  if (!g || !container) return;
  const box = container.getBoundingClientRect();
  const o = from.getBoundingClientRect();
  const x0 = o.left - box.left + o.width * 0.6;
  const y0 = o.top - box.top + o.height * 0.4;
  for (let i = 0; i < 18; i += 1) {
    const s = document.createElement('i');
    s.style.left = `${x0}px`;
    s.style.top = `${y0}px`;
    container.append(s);
    const dx = g.utils.random(-170, 170);
    g.timeline({ onComplete: () => s.remove() })
      .to(s, { x: dx, y: g.utils.random(-230, -70), duration: g.utils.random(0.45, 0.7), ease: 'power2.out' })
      .to(s, { x: dx * 1.25, y: '+=170', autoAlpha: 0, scale: 0.3, duration: g.utils.random(0.6, 0.9), ease: 'power2.in' });
  }
}

// Abre/fecha os detalhes de uma linha do setlist; as outras linhas se ajustam (Flip).
export function expand(li, open) {
  const detail = li.querySelector('.song-detail');
  const g = G();
  const list = li.parentElement;
  if (!g || !window.Flip) { detail.hidden = !open; return; }
  const state = window.Flip.getState(list.children);
  detail.hidden = !open;
  window.Flip.from(state, { duration: 0.38, ease: 'power2.inOut', nested: true });
  if (open) g.from(detail.children, { y: -8, autoAlpha: 0, duration: 0.3, stagger: 0.06, delay: 0.12 });
}

export function tabInk(nav, active, animate) {
  const ink = nav.querySelector('.tab-ink');
  if (!ink || !active) return;
  const x = active.offsetLeft + active.offsetWidth / 2 - ink.offsetWidth / 2;
  const g = G();
  if (g && animate) g.to(ink, { x, duration: 0.45, ease: 'power3.inOut' });
  else if (window.gsap) window.gsap.set(ink, { x });
  else ink.style.transform = `translateX(${x}px)`;
}

// Patch sendo costurado: a linha percorre a borda e o patch assenta.
// `wrap` é o elemento HTML em volta do <svg> do patch.
export function sew(wrap, delay = 0) {
  const g = G();
  if (!g || !wrap) return;
  const path = wrap.querySelector('.sew');
  const tl = g.timeline({ delay });
  tl.fromTo(wrap, { scale: 1.3, rotation: -12, autoAlpha: 0, transformOrigin: '50% 50%' }, {
    scale: 1, rotation: 0, autoAlpha: 1, duration: 0.45, ease: 'back.out(1.7)', clearProps: 'transform',
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
  return g.fromTo(el, { y, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35 });
}

export function fadeOut(el, done) {
  const g = G();
  if (!g) { done(); return; }
  g.to(el, { y: 10, autoAlpha: 0, duration: 0.2, ease: 'power2.in', onComplete: done });
}
