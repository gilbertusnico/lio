/**
 * Progres disimpan di localStorage (per browser, per perangkat).
 * done[ch] = huruf yang ketiga mini-gamenya sudah selesai (dapat bintang).
 * last3[ch] = jenis mini-game 3 yang terakhir dimainkan untuk huruf itu (supaya berikutnya berbeda).
 */
export type Mini3 = "count" | "shadow";
export type Progress = { done: Record<string, boolean>; last3: Record<string, Mini3> };

const KEY = "lio-progress-v1";
export const emptyProgress = (): Progress => ({ done: {}, last3: {} });

export function loadProgress(): Progress {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (s && typeof s === "object" && s.done) return { done: s.done || {}, last3: s.last3 || {} };
  } catch {}
  return emptyProgress();
}

export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

/** Mini-game 3 dipilih acak, tetapi tidak sama dengan yang terakhir dimainkan untuk huruf itu. */
export function pickMini3(last: Mini3 | undefined): Mini3 {
  if (last === "count") return "shadow";
  if (last === "shadow") return "count";
  return Math.random() < 0.5 ? "count" : "shadow";
}

export function shuffle<T>(a: T[]): T[] {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
