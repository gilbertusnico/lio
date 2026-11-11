/**
 * Data goresan huruf untuk papan tracing.
 *
 * Koordinat 0–100 (y ke bawah), mengikuti garis buku tulis SD:
 *   garis atas  y = 8   (tinggi huruf kapital dan tangkai b, d, h, k, l)
 *   garis tengah y = 44 (putus-putus; tinggi huruf kecil)
 *   garis dasar y = 80
 *   ekor (g, j, p, q, y) turun sampai y ≈ 98
 *
 * Tiap huruf = daftar goresan berurutan; tiap goresan = polyline titik kontrol
 * (arah = urutan titik). Goresan dengan SATU titik = titik (i, j) yang cukup diketuk.
 * Huruf kecil memakai bentuk tulisan tangan: a satu tangkai, g ekor kait, l dan t berekor.
 */
export type Pt = [number, number];

export const LINE = { top: 8, mid: 44, base: 80, desc: 98 } as const;
export const STEP = 1.5;

/** Busur elips; sudut dalam derajat (0 = kanan, 90 = bawah, -90 = atas). a0 < a1 = searah jarum jam. */
export function ell(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number): Pt[] {
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 5));
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    out.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]);
  }
  return out;
}
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => ell(cx, cy, r, r, a0, a1);

/** Memadatkan polyline menjadi titik setiap ±STEP unit. */
export function densify(poly: Pt[]): Pt[] {
  const out: Pt[] = [poly[0]];
  for (let i = 1; i < poly.length; i++) {
    const [x0, y0] = poly[i - 1];
    const [x1, y1] = poly[i];
    const d = Math.hypot(x1 - x0, y1 - y0);
    if (d < 0.01) continue;
    const n = Math.max(1, Math.round(d / STEP));
    for (let k = 1; k <= n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
  }
  return out;
}

type Raw = Pt[][];
const T = LINE.top, M = LINE.mid, B = LINE.base, D = LINE.desc;

/* ---------- Huruf kapital ---------- */
const UPPER: Record<string, Raw> = {
  A: [[[50, T], [24, B]], [[50, T], [76, B]], [[33, 56], [67, 56]]],
  B: [
    [[30, T], [30, B]],
    [[30, T], [50, T], ...arc(50, 26, 18, -90, 90), [30, M]],
    [[30, M], [52, M], ...arc(52, 62, 18, -90, 90), [30, B]],
  ],
  C: [ell(54, 44, 30, 36, -45, -315)],
  D: [[[28, T], [28, B]], [[28, T], [40, T], ...ell(40, 44, 34, 36, -90, 90), [28, B]]],
  E: [[[30, T], [30, B]], [[30, T], [70, T]], [[30, M], [64, M]], [[30, B], [70, B]]],
  F: [[[32, T], [32, B]], [[32, T], [70, T]], [[32, M], [64, M]]],
  G: [[...ell(50, 44, 30, 36, -45, -360), [58, M]]],
  H: [[[28, T], [28, B]], [[72, T], [72, B]], [[28, M], [72, M]]],
  I: [[[50, T], [50, B]], [[36, T], [64, T]], [[36, B], [64, B]]],
  J: [[[66, T], [66, 58], ...ell(48, 58, 18, 22, 0, 150)]],
  K: [[[30, T], [30, B]], [[70, T], [30, 50]], [[44, 35.3], [72, B]]],
  L: [[[32, T], [32, B], [70, B]]],
  M: [[[22, T], [22, B]], [[22, T], [50, 62], [78, T]], [[78, T], [78, B]]],
  N: [[[26, T], [26, B]], [[26, T], [74, B]], [[74, T], [74, B]]],
  O: [ell(50, 44, 31, 36, -90, -450)],
  P: [[[30, T], [30, B]], [[30, T], [52, T], ...arc(52, 26, 18, -90, 90), [30, M]]],
  Q: [ell(50, 44, 31, 36, -90, -450), [[60, 60], [80, 84]]],
  R: [
    [[30, T], [30, B]],
    [[30, T], [52, T], ...arc(52, 26, 18, -90, 90), [30, M]],
    [[46, M], [72, B]],
  ],
  S: [[...ell(50, 26, 20, 18, -40, -270), ...ell(50, 62, 21, 18, -90, 140)]],
  T: [[[50, T], [50, B]], [[24, T], [76, T]]],
  U: [[[26, T], [26, 54], ...ell(50, 54, 24, 26, 180, 0), [74, T]]],
  V: [[[24, T], [50, B], [76, T]]],
  W: [[[14, T], [32, B], [50, 26], [68, B], [86, T]]],
  X: [[[26, T], [74, B]], [[74, T], [26, B]]],
  Y: [[[24, T], [50, 46]], [[76, T], [50, 46], [50, B]]],
  Z: [[[26, T], [74, T], [26, B], [74, B]]],
};

/* ---------- Huruf kecil (tulisan tangan) ---------- */
const LOWER: Record<string, Raw> = {
  a: [[...ell(47, 62, 17, 18, -30, -360), [64, M], [64, B]]],
  b: [[[34, T], [34, B], [34, 62], ...ell(51, 62, 17, 18, 180, 540)]],
  c: [ell(52, 62, 17, 18, -45, -315)],
  d: [[...ell(47, 62, 17, 18, -30, -360), [64, T], [64, B]]],
  e: [[[34, 62], ...ell(51, 62, 17, 18, 0, -315)]],
  f: [[...ell(56, 20, 10, 12, -20, -180), [46, B]], [[34, M], [60, M]]],
  g: [[...ell(47, 62, 17, 18, -30, -360), [64, M], [64, 86], ...ell(48, 86, 16, 12, 0, 150)]],
  h: [[[34, T], [34, B], [34, 60], ...arc(50, 60, 16, 180, 360), [66, B]]],
  i: [[[50, M], [50, B]], [[50, 28]]],
  j: [[[56, M], [56, 86], ...ell(42, 86, 14, 12, 0, 150)], [[56, 28]]],
  k: [[[36, T], [36, B]], [[62, M], [38, 63], [64, B]]],
  l: [[[48, T], [48, 70], ...arc(58, 70, 10, 180, 90)]],
  m: [[[22, M], [22, B], [22, 58], ...arc(36, 58, 14, 180, 360), [50, B], [50, 58], ...arc(64, 58, 14, 180, 360), [78, B]]],
  n: [[[34, M], [34, B], [34, 60], ...arc(50, 60, 16, 180, 360), [66, B]]],
  o: [ell(50, 62, 17, 18, -90, -450)],
  p: [[[34, M], [34, D], [34, 62], ...ell(51, 62, 17, 18, 180, 540)]],
  q: [[...ell(47, 62, 17, 18, -30, -360), [64, M], [64, D]]],
  r: [[[40, M], [40, B], [40, 60], ...ell(53, 60, 13, 16, 180, 315)]],
  s: [[...ell(50, 53, 14, 9, -40, -270), ...ell(50, 71, 15, 9, -90, 140)]],
  t: [[[46, 18], [46, 70], ...arc(56, 70, 10, 180, 70)], [[32, M], [62, M]]],
  u: [[[34, M], [34, 64], ...arc(50, 64, 16, 180, 0), [66, M], [66, B]]],
  v: [[[32, M], [50, B], [68, M]]],
  w: [[[20, M], [35, B], [50, 52], [65, B], [80, M]]],
  x: [[[34, M], [66, B]], [[66, M], [34, B]]],
  y: [[[34, M], [50, B]], [[66, M], [42, D]]],
  z: [[[34, M], [66, M], [34, B], [66, B]]],
};

export type Glyph = {
  ch: string;
  /** Goresan yang sudah dipadatkan. Goresan 1 titik = titik ketuk. */
  strokes: Pt[][];
  box: { x0: number; x1: number; y0: number; y1: number };
};

function build(ch: string, raw: Raw): Glyph {
  const strokes = raw.map((s) => (s.length === 1 ? [s[0]] : densify(s)));
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const s of strokes)
    for (const [x, y] of s) {
      x0 = Math.min(x0, x); x1 = Math.max(x1, x);
      y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
  return { ch, strokes, box: { x0, x1, y0, y1 } };
}

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const GLYPHS: Record<string, { upper: Glyph; lower: Glyph }> = Object.fromEntries(
  ALPHABET.map((ch) => [ch, { upper: build(ch, UPPER[ch]), lower: build(ch.toLowerCase(), LOWER[ch.toLowerCase()]) }]),
);
