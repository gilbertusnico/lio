import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { ALPHABET, GLYPHS, LINE, type Glyph, type Pt } from "@/data/glyphs";
import { LETTERS } from "@/data/letters";
import { advance, canStart, dist, isDot } from "@/lib/trace";

const all: Glyph[] = ALPHABET.flatMap((ch) => [GLYPHS[ch].upper, GLYPHS[ch].lower]);

/** Generator angka acak deterministik supaya tes bisa diulang. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

/**
 * Meniru jari anak: sentuh titik awal, lalu bergerak mengikuti `path` selangkah demi selangkah.
 * Mengembalikan apakah goresan selesai dan berapa kali keluar jalur.
 */
function follow(pts: Pt[], path: Pt[]) {
  if (isDot(pts)) return { done: advance(pts, 0, path[0]).done, offs: 0 };
  if (!canStart(pts, 0, path[0])) return { done: false, offs: 0, started: false };
  let prog = 0, offs = 0;
  for (const p of path) {
    const r = advance(pts, prog, p);
    prog = r.prog;
    if (r.off) offs++;
    if (r.done) return { done: true, offs, started: true };
  }
  return { done: false, offs, started: true };
}

test("ada 26 huruf, masing-masing kapital + kecil", () => {
  assert.equal(ALPHABET.length, 26);
  assert.equal(all.length, 52);
  for (const g of all) assert.ok(g.strokes.length >= 1, g.ch);
});

test("titik goresan rapat dan berada di dalam papan", () => {
  for (const g of all)
    for (const s of g.strokes) {
      for (const [x, y] of s) {
        assert.ok(x >= 12 && x <= 88, `${g.ch}: x=${x}`);
        assert.ok(y >= LINE.top - 0.01 && y <= LINE.desc + 0.5, `${g.ch}: y=${y}`);
      }
      for (let i = 1; i < s.length; i++) assert.ok(dist(s[i - 1], s[i]) <= 2.4, `${g.ch}: titik renggang`);
    }
});

test("huruf kapital duduk di antara garis atas dan garis dasar", () => {
  for (const ch of ALPHABET) {
    const { box } = GLYPHS[ch].upper;
    assert.ok(Math.abs(box.y0 - LINE.top) < 0.6, `${ch}: puncak ${box.y0}`);
    assert.ok(box.y1 >= LINE.base - 0.6, `${ch}: dasar ${box.y1}`);
    assert.ok(box.y1 <= (ch === "Q" ? 85 : LINE.base + 0.6), `${ch}: melewati garis dasar ${box.y1}`);
  }
});

test("huruf kecil memakai zona garis yang benar (tangkai, badan, ekor)", () => {
  const asc = "bdfhkl", desc = "gjpqy";
  for (const ch of ALPHABET) {
    const g = GLYPHS[ch].lower, c = g.ch;
    const ys = g.strokes.filter((s) => !isDot(s)).flat().map((p) => p[1]);
    const y0 = Math.min(...ys), y1 = Math.max(...ys);
    if (asc.includes(c)) assert.ok(Math.abs(y0 - LINE.top) < 0.6, `${c}: tangkai harus sampai garis atas (${y0})`);
    else if (c === "t") assert.ok(y0 > LINE.top + 4 && y0 < LINE.mid - 10, `t: ${y0}`);
    else assert.ok(Math.abs(y0 - LINE.mid) < 0.6, `${c}: badan harus mulai di garis tengah (${y0})`);
    if (desc.includes(c)) assert.ok(y1 >= LINE.desc - 1, `${c}: ekor harus turun (${y1})`);
    else assert.ok(Math.abs(y1 - LINE.base) < 0.6, `${c}: harus duduk di garis dasar (${y1})`);
  }
  // i dan j punya titik di atas garis tengah
  for (const c of ["I", "J"]) {
    const dots = GLYPHS[c].lower.strokes.filter(isDot);
    assert.equal(dots.length, 1);
    assert.ok(dots[0][0][1] < LINE.mid - 8);
  }
});

test("goresan pertama dimulai dari atas", () => {
  for (const ch of ALPHABET) {
    assert.ok(GLYPHS[ch].upper.strokes[0][0][1] <= LINE.mid, `${ch} kapital`);
    assert.ok(GLYPHS[ch].lower.strokes[0][0][1] <= 63, `${ch} kecil`);
  }
});

test("setiap huruf selesai kalau ditelusuri dengan rapi", () => {
  for (const g of all)
    g.strokes.forEach((s, i) => {
      const r = follow(s, s);
      assert.ok(r.done, `${g.ch} goresan ${i + 1} tidak selesai`);
      assert.equal(r.offs, 0, `${g.ch} goresan ${i + 1} dianggap keluar jalur`);
    });
});

test("setiap huruf selesai dengan jari yang goyang dan cepat (lompat 3 titik, goyang ±5)", () => {
  for (let seed = 1; seed <= 20; seed++) {
    const rnd = rng(seed);
    for (const g of all)
      g.strokes.forEach((s, i) => {
        const path: Pt[] = [];
        for (let k = 0; k < s.length; k += 3) path.push([s[k][0] + (rnd() * 10 - 5), s[k][1] + (rnd() * 10 - 5)]);
        path.push(s[s.length - 1]);
        const r = follow(s, path);
        assert.ok(r.done, `${g.ch} goresan ${i + 1} (seed ${seed}) tidak selesai`);
        assert.equal(r.offs, 0, `${g.ch} goresan ${i + 1} (seed ${seed}) keluar jalur`);
      });
  }
});

test("coretan asal tidak menyelesaikan huruf", () => {
  for (const g of all)
    g.strokes.forEach((s, i) => {
      if (isDot(s)) return;
      // Diam di titik awal saja
      assert.ok(!follow(s, [s[0], s[0], s[0]]).done, `${g.ch} goresan ${i + 1} selesai tanpa digerakkan`);
      // Mulai dari ujung yang salah (kalau kedua ujung berjauhan)
      const end = s[s.length - 1];
      if (dist(s[0], end) > 20) assert.equal(follow(s, [end, s[0]]).started, false, `${g.ch} goresan ${i + 1} bisa dimulai dari ujung`);
    });
  // Memotong lengkungan dengan garis lurus dari awal ke akhir tidak boleh menyelesaikan huruf bulat
  for (const [ch, kind] of [["C", "upper"], ["S", "upper"], ["U", "upper"], ["G", "upper"], ["C", "lower"], ["H", "lower"]] as const) {
    const s = GLYPHS[ch][kind].strokes[0];
    const a = s[0], b = s[s.length - 1];
    const line: Pt[] = Array.from({ length: 40 }, (_, k) => [a[0] + ((b[0] - a[0]) * k) / 39, a[1] + ((b[1] - a[1]) * k) / 39]);
    assert.ok(!follow(s, line).done, `${ch} ${kind} selesai dengan jalan pintas`);
  }
});

test("goresan naik-turun tidak selesai sendiri dan tidak menghukum anak yang benar", () => {
  // a kecil: lingkaran lalu langsung turun tanpa naik ke garis tengah → belum selesai
  const a = GLYPHS.A.lower.strokes[0];
  const top = a.findIndex((p) => p[0] === 64 && Math.abs(p[1] - LINE.mid) < 0.01);
  assert.ok(top > 0);
  const shortcut: Pt[] = [...a.slice(0, top - 12), ...Array.from({ length: 12 }, (_, k): Pt => [64, 63 + k * 1.5])];
  assert.ok(!follow(a, shortcut).done, "a selesai tanpa naik ke garis tengah");
  // n kecil: tangkai hanya diturunkan separuh lalu langsung melengkung → belum selesai
  const n = GLYPHS.N.lower.strokes[0];
  const bottom = n.findIndex((p) => Math.abs(p[1] - LINE.base) < 0.01);
  const half: Pt[] = [...n.slice(0, 10), ...n.slice(bottom + 14)];
  assert.ok(!follow(n, half).done, "n selesai tanpa menurunkan tangkai");
});

test("data 26 huruf lengkap dan konsisten", () => {
  assert.equal(LETTERS.length, 26);
  LETTERS.forEach((L, i) => {
    assert.equal(L.ch, ALPHABET[i]);
    assert.equal(L.word[0].toUpperCase(), L.ch, `${L.word} tidak diawali ${L.ch}`);
    assert.ok(fs.existsSync("public" + L.img), `gambar tidak ada: ${L.img}`);
    const sim = L.similar.split("");
    assert.equal(new Set(sim).size, sim.length, `${L.ch}: pengecoh ganda`);
    assert.ok(!sim.includes(L.ch) && !sim.includes(L.ch.toLowerCase()), `${L.ch}: pengecoh memuat huruf sendiri`);
    assert.ok(sim.filter((c) => c === c.toUpperCase()).length >= 3, `${L.ch}: pengecoh kapital kurang`);
    assert.ok(sim.filter((c) => c === c.toLowerCase()).length >= 3, `${L.ch}: pengecoh kecil kurang`);
    assert.match(L.color, /^#[0-9a-f]{6}$/);
  });
});
