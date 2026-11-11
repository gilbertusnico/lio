/**
 * Logika tracing murni (tanpa DOM), dipindah dari prototype/index.html.
 * Dipakai oleh komponen TraceBoard dan oleh tes otomatis.
 *
 * Progres `prog` = indeks titik pada goresan aktif.
 */
import type { Pt } from "@/data/glyphs";

/** Jarak maksimum jari → titik supaya titik dianggap terlewati. */
export const TOL = 11;
/** Lebih jauh dari ini dari semua titik di depan = keluar jalur. */
export const OFF = 19;
/** Jarak maksimum jari → titik berkedip supaya goresan boleh dimulai/dilanjutkan. */
export const TOL_START = 15;
/** Jendela titik ke depan yang diperiksa. */
export const LOOK = 12;

/** Belokan ≥ sudut ini (derajat) dianggap sudut tajam / putar balik. */
export const CORNER_DEG = 100;

export const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

const cornerCache = new WeakMap<Pt[], number[]>();
/**
 * Indeks sudut tajam dan titik putar balik pada goresan (puncak V, dasar tangkai n, ujung tangkai a).
 * Progres tidak boleh melompati titik ini sebelum jari benar-benar sampai di dekatnya. Tanpa ini,
 * goresan yang menapak ulang garisnya sendiri (naik lalu turun) akan "selesai sendiri" dan anak yang
 * menelusuri dengan benar malah dianggap keluar jalur.
 */
export function corners(pts: Pt[]): number[] {
  let c = cornerCache.get(pts);
  if (c) return c;
  c = [];
  const cos = Math.cos((CORNER_DEG * Math.PI) / 180);
  for (let i = 1; i < pts.length - 1; i++) {
    const ax = pts[i][0] - pts[i - 1][0], ay = pts[i][1] - pts[i - 1][1];
    const bx = pts[i + 1][0] - pts[i][0], by = pts[i + 1][1] - pts[i][1];
    const d = (ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by) || 1);
    if (d <= cos) c.push(i);
  }
  cornerCache.set(pts, c);
  return c;
}

/** Goresan 1 titik = titik (i, j): cukup diketuk. */
export const isDot = (pts: Pt[]) => pts.length === 1;

/** Boleh mulai menggores kalau jari cukup dekat dengan titik `prog`. */
export function canStart(pts: Pt[], prog: number, p: Pt): boolean {
  return dist(p, pts[prog]) <= TOL_START;
}

export type Advance = {
  /** Indeks progres baru (sama dengan sebelumnya kalau tidak maju). */
  prog: number;
  moved: boolean;
  /** Jari terlalu jauh dari jalur. */
  off: boolean;
  /** Goresan selesai. */
  done: boolean;
};

export function advance(pts: Pt[], prog: number, p: Pt): Advance {
  if (isDot(pts)) {
    const hit = dist(p, pts[0]) <= TOL_START;
    return { prog: 0, moved: hit, off: false, done: hit };
  }
  let end = Math.min(prog + LOOK, pts.length - 1);
  for (const c of corners(pts))
    if (c > prog) {
      end = Math.min(end, c);
      break;
    }
  let best = -1;
  let nearest = Infinity;
  // Jari boleh tertinggal sedikit di belakang titik progres tanpa dianggap keluar jalur.
  for (let j = Math.max(0, prog - LOOK); j <= end; j++) {
    const d = dist(p, pts[j]);
    if (d < nearest) nearest = d;
    if (j >= prog && d <= TOL) best = j;
  }
  if (best > prog) return { prog: best, moved: true, off: false, done: best >= pts.length - 2 };
  return { prog, moved: false, off: nearest > OFF, done: false };
}
