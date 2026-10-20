// Metrônomo e cronômetro de 1 minuto, abertos na folha inferior (#sheet).
import { icon } from './html.js';
import { escape } from '../markup.js';

const sheet = () => document.getElementById('sheet');
let audio;

function ac() {
  audio ??= new (window.AudioContext || window.webkitAudioContext)();
  if (audio.state === 'suspended') audio.resume();
  return audio;
}

function blip(ctx, time, freq, peak, len = 0.045) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'square';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(peak, time + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, time + len);
  o.connect(g).connect(ctx.destination);
  o.start(time);
  o.stop(time + len + 0.01);
}

// Abre a folha e devolve um AbortSignal que limpa tudo ao fechar.
function openSheet(html, onClose) {
  const dlg = sheet();
  const ctrl = new AbortController();
  dlg.innerHTML = `<div class="sheet-body">${html}</div>`;
  dlg.addEventListener('close', () => { ctrl.abort(); onClose?.(); }, { once: true });
  dlg.addEventListener('click', (ev) => {
    if (ev.target === dlg || ev.target.closest('[data-close]')) dlg.close();
  }, { signal: ctrl.signal });
  dlg.showModal();
  return ctrl.signal;
}

const head = (title, sub) => `<div class="sheet-top"><div><h2 id="sheet-title">${title}</h2><p>${escape(sub)}</p></div>
  <button class="icon-btn" type="button" data-close aria-label="Fechar">${icon('close')}</button></div>`;

// ── Metrônomo ───────────────────────────────────────────────────────────
export function openMetronome({ name, target, onUse }) {
  let bpm = target || 60;
  let beat = 0;
  let next = 0;
  let loop = null;
  let lights = [];

  const stop = () => {
    clearTimeout(loop);
    lights.forEach(clearTimeout);
    lights = [];
    loop = null;
  };
  const signal = openSheet(`${head('Metrônomo', `${name} · meta ${target} BPM`)}
    <p class="big-num"><span data-bpm>${bpm}</span><small>batidas por minuto</small></p>
    <div class="beats" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
    <div class="stepper">
      <button type="button" data-step="-4" aria-label="Menos 4 BPM">−4</button>
      <button type="button" data-step="-1" aria-label="Menos 1 BPM">−1</button>
      <button type="button" data-step="1" aria-label="Mais 1 BPM">+1</button>
      <button type="button" data-step="4" aria-label="Mais 4 BPM">+4</button>
    </div>
    <input class="range" type="range" min="30" max="240" value="${bpm}" data-range aria-label="Andamento em BPM">
    <div class="sheet-actions">
      <button class="btn" type="button" data-toggle>${icon('play')} Tocar</button>
      <button class="btn ghost" type="button" data-use>Anotar <span data-bpm2>${bpm}</span></button>
    </div>`, stop);

  const dlg = sheet();
  const cells = [...dlg.querySelectorAll('.beats span')];
  const toggleBtn = dlg.querySelector('[data-toggle]');
  const light = (b) => cells.forEach((c, i) => {
    c.classList.toggle('on', i === b);
    c.classList.toggle('accent', i === 0 && b === 0);
  });
  const setBpm = (v) => {
    bpm = Math.max(30, Math.min(240, Math.round(v)));
    dlg.querySelector('[data-bpm]').textContent = bpm;
    dlg.querySelector('[data-bpm2]').textContent = bpm;
    dlg.querySelector('[data-range]').value = bpm;
  };
  const schedule = () => {
    const ctx = ac();
    while (next < ctx.currentTime + 0.1) {
      blip(ctx, next, beat === 0 ? 1760 : 1175, beat === 0 ? 0.5 : 0.28);
      const b = beat;
      lights.push(setTimeout(() => light(b), Math.max(0, (next - ctx.currentTime) * 1000)));
      next += 60 / bpm;
      beat = (beat + 1) % 4;
    }
    lights = lights.slice(-8);
    loop = setTimeout(schedule, 25);
  };
  const start = () => {
    const ctx = ac();
    beat = 0;
    next = ctx.currentTime + 0.06;
    schedule();
    toggleBtn.innerHTML = `${icon('stop')} Parar`;
  };
  const halt = () => {
    stop();
    light(-1);
    toggleBtn.innerHTML = `${icon('play')} Tocar`;
  };

  dlg.addEventListener('click', (ev) => {
    const step = ev.target.closest('[data-step]');
    if (step) setBpm(bpm + Number(step.dataset.step));
    if (ev.target.closest('[data-toggle]')) (loop ? halt() : start());
    if (ev.target.closest('[data-use]')) {
      onUse(bpm);
      dlg.close();
    }
  }, { signal });
  dlg.querySelector('[data-range]').addEventListener('input', (ev) => setBpm(Number(ev.target.value)), { signal });
}

// ── Cronômetro de 1 minuto ──────────────────────────────────────────────
const R = 88;
const C = 2 * Math.PI * R;

export function openTimer({ name, onUse }) {
  let raf = null;
  let pre = [];
  const cancel = () => {
    cancelAnimationFrame(raf);
    pre.forEach(clearTimeout);
    pre = [];
    raf = null;
  };
  const signal = openSheet(`${head('Um minuto', name)}
    <svg class="timer-ring" viewBox="0 0 200 200" role="img" aria-label="Tempo restante">
      <circle class="track-c" cx="100" cy="100" r="${R}"/>
      <circle class="run-c" cx="100" cy="100" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="0"/>
      <text x="100" y="104" data-left>60</text>
    </svg>
    <p class="muted" data-hint style="text-align:center">Contagem de 3 antes de começar, para posicionar as mãos.</p>
    <label class="result" data-ask hidden style="justify-content:center">Trocas limpas
      <input type="number" inputmode="numeric" min="0" data-count aria-label="Trocas limpas em 1 minuto"></label>
    <div class="sheet-actions">
      <button class="btn" type="button" data-go>${icon('play')} Começar</button>
      <button class="btn ghost" type="button" data-save disabled>Salvar</button>
    </div>`, cancel);

  const dlg = sheet();
  const left = dlg.querySelector('[data-left]');
  const ring = dlg.querySelector('.run-c');
  const go = dlg.querySelector('[data-go]');
  const save = dlg.querySelector('[data-save]');
  const ask = dlg.querySelector('[data-ask]');
  const hint = dlg.querySelector('[data-hint]');

  const run = () => {
    const ctx = ac();
    const t0 = performance.now();
    blip(ctx, ctx.currentTime, 1760, 0.5, 0.12);
    const frame = (now) => {
      const remaining = Math.max(0, 60 - (now - t0) / 1000);
      left.textContent = Math.ceil(remaining);
      ring.setAttribute('stroke-dashoffset', String(C * (1 - remaining / 60)));
      if (remaining > 0) {
        raf = requestAnimationFrame(frame);
        return;
      }
      raf = null;
      const t = ctx.currentTime;
      [0, 0.18, 0.36].forEach((d) => blip(ctx, t + d, 1760, 0.5, 0.12));
      navigator.vibrate?.([200, 100, 200]);
      hint.textContent = 'Tempo! Quantas trocas soaram limpas?';
      ask.hidden = false;
      save.disabled = false;
      go.innerHTML = `${icon('play')} De novo`;
      go.disabled = false;
      ask.querySelector('input').focus();
    };
    raf = requestAnimationFrame(frame);
  };

  const begin = () => {
    cancel();
    const ctx = ac();
    go.disabled = true;
    ask.hidden = true;
    save.disabled = true;
    ring.setAttribute('stroke-dashoffset', '0');
    hint.textContent = 'Prepare a mão no primeiro acorde.';
    [3, 2, 1].forEach((n, i) => pre.push(setTimeout(() => {
      left.textContent = n;
      blip(ctx, ctx.currentTime, 1175, 0.3);
    }, i * 1000)));
    pre.push(setTimeout(() => { hint.textContent = 'Vai!'; run(); }, 3000));
  };

  go.addEventListener('click', begin, { signal });
  save.addEventListener('click', () => {
    const v = Number(dlg.querySelector('[data-count]').value);
    if (Number.isFinite(v) && v >= 0) onUse(v);
    dlg.close();
  }, { signal });
}
