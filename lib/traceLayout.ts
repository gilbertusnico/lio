import { LINE, type Glyph } from "@/data/glyphs";

/** Letak huruf di papan: titik huruf g → titik papan [ox + s·gx, oy + s·gy]. */
export type Pose = { s: number; ox: number; oy: number };

/** Bagian papan (0–1) yang dipakai sebagai tepi kosong di tiap sisi. */
export const PADR = 0.07;

/** Posisi huruf pada tiap tahap, dihitung dari kotak pembatas masing-masing bentuk. */
export function layout(up: Glyph, lo: Glyph) {
  // Huruf kecil yang sedang ditebalkan: DIPERBESAR sebesar yang muat di kanan papan (garis buku ikut
  // membesar), supaya badan huruf kecil cukup lega untuk jari anak. Huruf lebar (m, w) tetap skala 1.
  const m = 7; // setengah tebal garis pemandu + sedikit ruang
  const bw = lo.box.x1 - lo.box.x0 + 2 * m, bh = lo.box.y1 - lo.box.y0 + 2 * m;
  const sL = Math.max(1, Math.min(1.6, 62 / bw, 92 / bh));
  let ox = 66 - (sL * (lo.box.x0 + lo.box.x1)) / 2;
  if (sL * (lo.box.x0 - m) + ox < 33) ox = 33 - sL * (lo.box.x0 - m);
  if (sL * (lo.box.x1 + m) + ox > 99) ox = 99 - sL * (lo.box.x1 + m);
  const oyL = 50 - (sL * (lo.box.y0 + lo.box.y1)) / 2;
  const lower: Pose = { s: sL, ox, oy: oyL };
  // Kapital yang sudah selesai: mengecil, duduk di garis dasar (yang sudah ikut membesar), di kiri papan.
  const cs = 0.4;
  const chip: Pose = { s: cs, ox: 14 - (cs * (up.box.x0 + up.box.x1)) / 2, oy: oyL + sL * LINE.base - cs * LINE.base };
  // Akhir: "A a" berjajar dengan perbandingan ukuran yang benar; garis buku ikut mengecil.
  const gap = 24, wU = up.box.x1 - up.box.x0, wL = lo.box.x1 - lo.box.x0;
  const s = Math.min(0.62, 80 / (wU + wL + gap));
  const left = 50 - ((wU + gap + wL) * s) / 2;
  const oy = 50 - s * ((LINE.top + LINE.desc) / 2);
  return {
    chip,
    lower,
    linesLower: { s: sL, ox: 0, oy: oyL } as Pose,
    upperEnd: { s, ox: left - s * up.box.x0, oy } as Pose,
    lowerEnd: { s, ox: left + s * (wU + gap) - s * lo.box.x0, oy } as Pose,
    linesEnd: { s, ox: 0, oy } as Pose,
  };
}
