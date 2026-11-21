import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { LINE, type Pt } from "@/data/glyphs";
import { NUM_GLYPHS } from "@/data/numberGlyphs";
import { NUMBERS } from "@/data/numbers";
import { advance, canStart, dist } from "@/lib/trace";

const nums = Object.keys(NUM_GLYPHS).map(Number);
const glyphs = nums.map((n) => NUM_GLYPHS[n]);

/** Generator angka acak deterministik supaya tes bisa diulang. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

/** Meniru jari anak: sentuh titik awal, lalu bergerak mengikuti `path`. */
function follow(pts: Pt[], path: Pt[]) {
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

test("ada angka 1–10 dan datanya konsisten dengan data/numbers.ts", () => {
  assert.deepEqual(nums, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(NUMBERS.length, 10);
  NUMBERS.forEach((L, i) => {
    assert.equal(L.n, i + 1);
    assert.ok(L.word.length > 2 && L.fruit.length > 2);
    assert.ok(fs.existsSync("public" + L.img), `gambar tidak ada: ${L.img}`);
    assert.match(L.color, /^#[0-9a-f]{6}$/);
  });
});

test("titik goresan rapat, di dalam papan, dan tingginya garis atas sampai garis dasar", () => {
  for (const g of glyphs) {
    for (const s of g.strokes) {
      for (const [x, y] of s) {
        assert.ok(x >= 12 && x <= 88, `${g.ch}: x=${x}`);
        assert.ok(y >= LINE.top - 0.01 && y <= LINE.base + 0.5, `${g.ch}: y=${y}`);
      }
      for (let i = 1; i < s.length; i++) assert.ok(dist(s[i - 1], s[i]) <= 2.4, `${g.ch}: titik renggang`);
    }
    assert.ok(Math.abs(g.box.y0 - LINE.top) < 0.6, `${g.ch}: puncak ${g.box.y0}`);
    assert.ok(Math.abs(g.box.y1 - LINE.base) < 0.6, `${g.ch}: dasar ${g.box.y1}`);
  }
});

test("jumlah goresan sesuai cara menulis (4 dan 5 dua goresan, 10 dua goresan, sisanya satu)", () => {
  const want: Record<number, number> = { 1: 1, 2: 1, 3: 1, 4: 2, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1, 10: 2 };
  for (const n of nums) assert.equal(NUM_GLYPHS[n].strokes.length, want[n], `angka ${n}`);
});

test("goresan pertama tiap angka dimulai dari bagian atas", () => {
  for (const g of glyphs) assert.ok(g.strokes[0][0][1] <= 26, `${g.ch}: mulai di y=${g.strokes[0][0][1]}`);
});

test("setiap angka selesai kalau ditelusuri dengan rapi", () => {
  for (const g of glyphs)
    g.strokes.forEach((s, i) => {
      const r = follow(s, s);
      assert.ok(r.done, `${g.ch} goresan ${i + 1} tidak selesai`);
      assert.equal(r.offs, 0, `${g.ch} goresan ${i + 1} dianggap keluar jalur`);
    });
});

test("setiap angka selesai dengan jari yang goyang dan cepat (lompat 3 titik, goyang ±5)", () => {
  for (let seed = 1; seed <= 20; seed++) {
    const rnd = rng(seed);
    for (const g of glyphs)
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

test("angka 8 (menyilang dirinya sendiri) selesai walau jari lambat dan rapat di titik persilangan", () => {
  const s = NUM_GLYPHS[8].strokes[0];
  // Tiap titik dilewati satu per satu dengan goyang kecil: tidak boleh meloncat ke cabang lain saat menyilang.
  const rnd = rng(7);
  const path: Pt[] = s.map((p): Pt => [p[0] + (rnd() * 4 - 2), p[1] + (rnd() * 4 - 2)]);
  const r = follow(s, path);
  assert.ok(r.done && r.offs === 0, "8 gagal selesai pada kecepatan lambat");
  // Titik persilangan memang dilewati dua kali: pastikan jari yang baru menyentuh persilangan belum menyelesaikan apa pun.
  const cross = s.findIndex((p) => dist(p, [44, 40]) < 6);
  assert.ok(cross > 0 && cross < s.length / 2, "persilangan pertama harus di paruh pertama goresan");
  assert.ok(!follow(s, s.slice(0, cross + 4)).done);
});

test("coretan asal tidak menyelesaikan angka", () => {
  for (const g of glyphs)
    g.strokes.forEach((s, i) => {
      assert.ok(!follow(s, [s[0], s[0], s[0]]).done, `${g.ch} goresan ${i + 1} selesai tanpa digerakkan`);
      const end = s[s.length - 1];
      if (dist(s[0], end) > 20) assert.equal(follow(s, [end, s[0]]).started, false, `${g.ch} goresan ${i + 1} bisa dimulai dari ujung`);
    });
  // Garis lurus dari awal ke akhir tidak boleh menyelesaikan angka yang melengkung
  for (const n of [2, 3, 5, 6, 9] as const) {
    const s = NUM_GLYPHS[n].strokes[0];
    const a = s[0], b = s[s.length - 1];
    const line: Pt[] = Array.from({ length: 40 }, (_, k) => [a[0] + ((b[0] - a[0]) * k) / 39, a[1] + ((b[1] - a[1]) * k) / 39]);
    assert.ok(!follow(s, line).done, `${n} selesai dengan jalan pintas`);
  }
});

test("sudut tajam tidak bisa dipotong (7, 4, 1, 9)", () => {
  // 7: dari ujung kiri atas langsung diagonal ke dasar tanpa melewati sudut kanan atas
  const seven = NUM_GLYPHS[7].strokes[0];
  const cut7: Pt[] = Array.from({ length: 40 }, (_, k): Pt => [28 + ((42 - 28) * k) / 39, 8 + ((80 - 8) * k) / 39]);
  assert.ok(!follow(seven, cut7).done, "7 selesai tanpa sudut kanan atas");
  // 4: miring lalu langsung selesai tanpa menyusuri bagian datar
  const four = NUM_GLYPHS[4].strokes[0];
  const cut4 = four.slice(0, Math.floor(four.length * 0.5));
  assert.ok(!follow(four, cut4).done, "4 selesai tanpa bagian datar");
  // 9: lingkaran lalu langsung turun tanpa naik ke batang
  const nine = NUM_GLYPHS[9].strokes[0];
  const top = nine.findIndex((p) => Math.abs(p[0] - 68) < 0.01 && Math.abs(p[1] - 18) < 0.01);
  assert.ok(top > 0);
  const shortcut: Pt[] = [...nine.slice(0, top - 10), ...Array.from({ length: 30 }, (_, k): Pt => [68, 28 + k * 1.8])];
  assert.ok(!follow(nine, shortcut).done, "9 selesai tanpa naik ke batang");
});
