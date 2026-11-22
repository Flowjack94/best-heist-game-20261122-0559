// Synthesised sound: every effect is built with WebAudio oscillators and
// noise — no audio files, no network. Started lazily on first user input
// (browsers block audio before a gesture).
let ctx = null;
let muted = false;
let drone = null;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  if (drone) drone.gain.value = muted ? 0 : 0.035;
  return muted;
}

export function ensureAudio() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  if (ctx && !drone) startDrone();
  return ctx;
}

function startDrone() {
  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  const g = ctx.createGain();
  o1.type = 'sine';
  o2.type = 'sine';
  o1.frequency.value = 55;
  o2.frequency.value = 55.7;
  g.gain.value = muted ? 0 : 0.035;
  o1.connect(g);
  o2.connect(g);
  g.connect(ctx.destination);
  o1.start();
  o2.start();
  drone = { gain: g.gain };
}

function tone(freq, dur, type, vol, when = 0, slideTo = null) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + when;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noiseBurst(dur, vol, when = 0, lowpass = 1200) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + when;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = lowpass;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(f);
  f.connect(g);
  g.connect(ctx.destination);
  src.start(t0);
}

export const sfx = {
  step() {
    tone(180 + Math.random() * 60, 0.05, 'triangle', 0.04);
  },
  coin() {
    tone(1250, 0.07, 'sine', 0.12);
    tone(1870, 0.12, 'sine', 0.1, 0.06);
  },
  coinLand() {
    noiseBurst(0.08, 0.12, 0, 3000);
    tone(900, 0.1, 'sine', 0.08, 0.02);
  },
  loop() {
    tone(660, 0.09, 'square', 0.06);
    tone(880, 0.09, 'square', 0.06, 0.09);
    tone(1320, 0.14, 'square', 0.05, 0.18);
  },
  disguise() {
    tone(440, 0.12, 'sine', 0.08, 0, 660);
  },
  loot() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'sine', 0.11, i * 0.07));
  },
  bonus() {
    tone(988, 0.1, 'sine', 0.09);
    tone(1319, 0.14, 'sine', 0.09, 0.08);
  },
  spotted() {
    tone(220, 0.18, 'sawtooth', 0.1, 0, 440);
    tone(220, 0.18, 'sawtooth', 0.1, 0.2, 440);
  },
  alarm() {
    tone(700, 0.22, 'square', 0.07, 0, 950);
    tone(700, 0.22, 'square', 0.07, 0.24, 950);
  },
  caught() {
    [330, 262, 196, 131].forEach((f, i) => tone(f, 0.22, 'sawtooth', 0.11, i * 0.16));
    noiseBurst(0.4, 0.1, 0, 800);
  },
  exitOpen() {
    tone(392, 0.12, 'sine', 0.1);
    tone(523, 0.2, 'sine', 0.1, 0.1);
  },
  clear() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.2, 'sine', 0.11, i * 0.09));
  },
  win() {
    [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) =>
      tone(f, 0.22, 'triangle', 0.11, i * 0.11),
    );
  },
  click() {
    tone(700, 0.05, 'square', 0.05);
  },
};
