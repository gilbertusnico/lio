/**
 * Logika murni mini-game angka (tanpa React), supaya bisa dites otomatis (tests/numGames.test.ts).
 */
import { shuffle } from "./progress";

/** Cari angka: 9 gelembung = 3 angka target + 6 pengecoh berbeda (angka mirip dulu, sisanya 0–9 acak). */
export const FIND_TARGETS = 3;
export function makeNumCells(n: number, similar: number[]): number[] {
  const sim = shuffle(similar.filter((v) => v !== n));
  const rest = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((v) => v !== n && !sim.includes(v)));
  const fakes = [...sim, ...rest].slice(0, 9 - FIND_TARGETS);
  return shuffle([...Array(FIND_TARGETS).fill(n), ...fakes]);
}

/**
 * Cocokkan jumlah: tiga kelompok benda, salah satunya sebanyak angka level. Ketiga jumlah 1–10 berbeda
 * paling sedikit 2, supaya anak 5 tahun bisa membedakannya dengan melihat bingkai sepuluh.
 */
export function makeMatchCounts(n: number): number[] {
  const others = shuffle(Array.from({ length: 10 }, (_, i) => i + 1).filter((v) => Math.abs(v - n) >= 2));
  const a = others[0];
  const b = others.find((v) => Math.abs(v - a) >= 2)!;
  return shuffle([n, a, b]);
}

/** Ambilkan N: jumlah buah di tumpukan (selalu lebih dari N, paling banyak 12 supaya muat di papan). */
export const basketTotal = (n: number) => Math.min(n + 3, 12);
