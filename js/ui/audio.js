// Power chord de Mi (E5) com distorção, sintetizado na hora.
// Cordas por Karplus-Strong; distorção por waveshaper; "caixa" por filtros.
let ctx;
const buffers = new Map();

function ac() {
  ctx ??= new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function pluck(c, freq, seconds) {
  const key = `${freq}`;
  if (buffers.has(key)) return buffers.get(key);
  const sr = c.sampleRate;
  const period = Math.round(sr / freq);
  const length = Math.floor(sr * seconds);
  const buf = c.createBuffer(1, length, sr);
  const out = buf.getChannelData(0);
  const ring = new Float32Array(period);
  for (let i = 0; i < period; i += 1) ring[i] = Math.random() * 2 - 1;
  let idx = 0;
  for (let i = 0; i < length; i += 1) {
    const a = ring[idx];
    const b = ring[(idx + 1) % period];
    out[i] = a;
    ring[idx] = 0.4985 * (a + b);
    idx = (idx + 1) % period;
  }
  buffers.set(key, buf);
  return buf;
}

function curve(amount) {
  const n = 2048;
  const k = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const x = (i * 2) / n - 1;
    k[i] = ((1 + amount) * x) / (1 + amount * Math.abs(x));
  }
  return k;
}

export function powerChord() {
  const c = ac();
  const t = c.currentTime + 0.02;
  const drive = c.createGain();
  drive.gain.value = 5;
  const shaper = c.createWaveShaper();
  shaper.curve = curve(60);
  shaper.oversample = '4x';
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 90;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 3400;
  const out = c.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
  out.gain.exponentialRampToValueAtTime(0.0001, t + 2.3);
  drive.connect(shaper).connect(hp).connect(lp).connect(out).connect(c.destination);
  // Mi2, Si2, Mi3: palhetada para baixo, uma corda depois da outra.
  [82.41, 123.47, 164.81].forEach((f, i) => {
    const src = c.createBufferSource();
    src.buffer = pluck(c, f, 2.4);
    src.connect(drive);
    src.start(t + i * 0.016);
  });
}
