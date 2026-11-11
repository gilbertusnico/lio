/**
 * Efek bunyi + musik latar, semuanya dibuat dengan Web Audio (tanpa file).
 * Dipindah dari prototype/index.html. Tidak ada narasi suara.
 */
let ac: AudioContext | null = null;

/** Membuat/menghidupkan AudioContext. Panggil dari dalam handler sentuhan. */
export function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ac) {
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ac = new Ctor();
    } catch {}
  }
  if (ac && ac.state === "suspended") ac.resume();
  return ac;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.2, delay = 0) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  tick() { tone(880 + Math.random() * 240, 0.06, "sine", 0.05); },
  ding() { tone(784, 0.18, "triangle", 0.25); tone(1175, 0.3, "triangle", 0.2, 0.1); },
  oops() { tone(220, 0.18, "square", 0.06); tone(180, 0.2, "square", 0.05, 0.12); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, "triangle", 0.22, i * 0.12)); tone(1319, 0.5, "triangle", 0.2, 0.5); },
};

/* ---------- Musik latar: C mayor riang (C–Am–F–G), 104 BPM ---------- */
const MUSIC_KEY = "lio-music-on";
const BPM = 104, STEP16 = 60 / BPM / 4;
const CHORDS = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]];
const MEL = [
  72, -1, 76, -1, 79, -1, 76, -1, 74, -1, 72, -1, 74, 76, -1, -1,
  72, -1, 69, -1, 72, -1, 76, -1, 74, -1, -1, 72, 69, -1, -1, -1,
  69, -1, 72, -1, 74, -1, 72, -1, 69, -1, 67, -1, 69, 72, -1, -1,
  74, -1, 76, -1, 79, -1, 76, 74, 72, -1, 74, -1, 67, -1, -1, -1,
];
const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
let mGain: GainNode | null = null;
let mTimer: ReturnType<typeof setInterval> | null = null;
let mNext = 0, mStep = 0;

function note(t: number, midi: number, dur: number, type: OscillatorType, vol: number, dest: AudioNode) {
  const a = ac!, o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.value = hz(midi);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + dur + 0.05);
}
function shaker(t: number, vol: number, dest: AudioNode) {
  const a = ac!, len = Math.floor(a.sampleRate * 0.05), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  f.type = "highpass";
  f.frequency.value = 6000;
  g.gain.value = vol;
  s.buffer = buf;
  s.connect(f);
  f.connect(g);
  g.connect(dest);
  s.start(t);
}
function schedule() {
  if (!ac || !mGain) return;
  while (mNext < ac.currentTime + 0.2) {
    const i = mStep % 64, ch = CHORDS[Math.floor(i / 16)], t = mNext;
    if (MEL[i] >= 0) note(t, MEL[i], 0.35, "triangle", 0.22, mGain);
    if (i % 16 === 0 || i % 16 === 10) note(t, ch[0] - 12, 0.5, "sine", 0.35, mGain);
    if (i % 4 === 2) ch.forEach((m) => note(t, m + 12, 0.18, "sine", 0.05, mGain!));
    if (i % 2 === 0) shaker(t, i % 4 === 2 ? 0.05 : 0.025, mGain);
    mNext += STEP16;
    mStep++;
  }
}

export function musicPref(): boolean {
  try {
    return localStorage.getItem(MUSIC_KEY) !== "0";
  } catch {
    return true;
  }
}
export function setMusicPref(on: boolean) {
  try {
    localStorage.setItem(MUSIC_KEY, on ? "1" : "0");
  } catch {}
}
export function startMusic() {
  if (mTimer) return;
  const a = audio();
  if (!a) return;
  mGain = a.createGain();
  mGain.gain.value = 0.0001;
  mGain.connect(a.destination);
  mGain.gain.exponentialRampToValueAtTime(0.35, a.currentTime + 1.5);
  mNext = a.currentTime + 0.1;
  mStep = 0;
  mTimer = setInterval(schedule, 50);
  schedule();
}
export function stopMusic() {
  if (!mTimer) return;
  clearInterval(mTimer);
  mTimer = null;
  const g = mGain;
  try {
    g!.gain.cancelScheduledValues(ac!.currentTime);
    g!.gain.setTargetAtTime(0.0001, ac!.currentTime, 0.15);
  } catch {}
  setTimeout(() => { try { g!.disconnect(); } catch {} }, 800);
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (!ac) return;
    if (document.hidden) ac.suspend();
    else ac.resume();
  });
}
