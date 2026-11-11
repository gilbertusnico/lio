import { LINE, type Glyph } from "@/data/glyphs";

/** Letak huruf di papan: titik huruf g → titik papan [ox + s·gx, oy + s·gy]. */
export type Pose = { s: number; ox: number; oy: number };

/** Bagian papan (0–1) yang dipakai sebagai tepi kosong di tiap sisi. */
export const PADR = 0.07;

/** Posisi huruf pada tiap tahap, dihitung dari kotak pembatas masing-masing bentuk. */
export function layout(up: Glyph, lo: Glyph) {
  // Kapital yang sudah selesai: mengecil, duduk di garis dasar, di kiri papan.
  const cs = 0.42;
  const chip: Pose = { s: cs, ox: 15 - (cs * (up.box.x0 + up.box.x1)) / 2, oy: LINE.base * (1 - cs) };
  // Huruf kecil yang sedang ditebalkan: ukuran penuh, agak ke kanan supaya tidak menabrak kapital kecil.
  let ox = 58 - (lo.box.x0 + lo.box.x1) / 2;
  if (lo.box.x0 + ox < 34) ox = 34 - lo.box.x0;
  if (lo.box.x1 + ox > 94) ox = 94 - lo.box.x1;
  const lower: Pose = { s: 1, ox, oy: 0 };
  // Akhir: "A a" berjajar dengan perbandingan ukuran yang benar; garis buku ikut mengecil.
  const gap = 14, wU = up.box.x1 - up.box.x0, wL = lo.box.x1 - lo.box.x0;
  const s = Math.min(0.62, 80 / (wU + wL + gap));
  const left = 50 - ((wU + gap + wL) * s) / 2;
  const oy = 50 - s * ((LINE.top + LINE.desc) / 2);
  return {
    chip,
    lower,
    upperEnd: { s, ox: left - s * up.box.x0, oy } as Pose,
    lowerEnd: { s, ox: left + s * (wU + gap) - s * lo.box.x0, oy } as Pose,
    linesEnd: { s, ox: 0, oy } as Pose,
  };
}
