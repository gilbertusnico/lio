/**
 * Goresan angka 1–10 untuk papan tracing (koordinat 0–100, garis buku sama dengan huruf kapital:
 * tinggi angka dari garis atas ke garis dasar). Urutan dan arah goresan mengikuti cara menulis angka di SD:
 *   1: topi kecil lalu turun · 2: lengkung atas lalu miring ke dasar lalu ke kanan · 3: dua lengkung
 *   4: miring + datar, lalu garis tegak · 5: tegak + perut, lalu topi · 6: turun melengkung lalu lingkaran
 *   7: datar lalu miring · 8: mulai dari tengah, kiri bawah, kanan bawah, kiri atas, kembali ke tengah · 9: lingkaran lalu tegak · 10: "1" lalu "0"
 * Titik putar balik dan sudut tajam harus benar-benar dicapai jari (lihat corners() di lib/trace.ts).
 */
import { LINE, build, ell, type Glyph, type Raw } from "./glyphs";

const T = LINE.top, B = LINE.base;

const DIGITS: Record<number, Raw> = {
  1: [[[34, 24], [52, T], [52, B]]],
  2: [[...ell(50, 30, 21, 22, 200, 400), [28, B], [74, B]]],
  3: [[...ell(50, 26, 19, 18, -160, 90), ...ell(50, 62, 22, 18, -90, 150)]],
  4: [[[62, T], [24, 62], [78, 62]], [[62, T], [62, B]]],
  5: [[[34, T], [34, 43], ...ell(48, 60, 22, 20, -125, 140)], [[34, T], [68, T]]],
  6: [[[64, T], [46, 22], [33, 46], ...ell(50, 60, 19, 20, 180, -180)]],
  7: [[[28, T], [72, T], [42, B]]],
  // 8: mulai dari titik tengah, turun ke kiri bawah, memutari lingkaran bawah ke kanan bawah,
  // naik menyilang lewat tengah ke kiri atas, memutari lingkaran atas, dan kembali ke tengah.
  8: [[
    [50, 44], [36, 49],
    ...ell(50, 62, 20, 18, 225, -45),
    [38.7, 38.7],
    ...ell(50, 26, 17, 18, 135, 450),
  ]],
  9: [[...ell(49, 28, 19, 20, -30, -360), [68, 18], [68, 56], [60, 74], [44, B]]],
  10: [
    [[18, 24], [30, T], [30, B]],
    ell(64, 44, 22, 36, -90, -450),
  ],
};

export const NUM_GLYPHS: Record<number, Glyph> = Object.fromEntries(
  Object.entries(DIGITS).map(([n, raw]) => [Number(n), build(String(n), raw)]),
);
