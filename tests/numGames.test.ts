import { test } from "node:test";
import assert from "node:assert/strict";
import { NUMBERS } from "../data/numbers";
import { FIND_TARGETS, basketTotal, makeMatchCounts, makeNumCells } from "../lib/numGames";
import { NUM_MINI3, pickNumMini3 } from "../lib/progress";

test("data angka: pengecoh tidak memuat angka itu sendiri", () => {
  for (const l of NUMBERS) assert.ok(!l.similar.includes(l.n), `angka ${l.n}`);
});

test("cari angka: 9 gelembung, tepat 3 target, pengecoh berbeda-beda", () => {
  for (const l of NUMBERS)
    for (let k = 0; k < 50; k++) {
      const cells = makeNumCells(l.n, l.similar);
      assert.equal(cells.length, 9);
      assert.equal(cells.filter((c) => c === l.n).length, FIND_TARGETS);
      const fakes = cells.filter((c) => c !== l.n);
      assert.equal(new Set(fakes).size, fakes.length, `angka ${l.n}: pengecoh kembar ${fakes}`);
      for (const s of l.similar) assert.ok(fakes.includes(s) || l.similar.length > 6, `angka ${l.n}: pengecoh mirip ${s} tidak dipakai`);
    }
});

test("cocokkan jumlah: memuat angka level, 1–10, berbeda paling sedikit 2", () => {
  for (const l of NUMBERS)
    for (let k = 0; k < 50; k++) {
      const c = makeMatchCounts(l.n);
      assert.equal(c.length, 3);
      assert.ok(c.includes(l.n));
      for (const v of c) assert.ok(v >= 1 && v <= 10);
      for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) assert.ok(Math.abs(c[i] - c[j]) >= 2, `${c}`);
    }
});

test("ambilkan N: tumpukan selalu lebih banyak dari N", () => {
  for (const l of NUMBERS) assert.ok(basketTotal(l.n) > l.n && basketTotal(l.n) <= 12);
});

test("mini-game 3 angka tidak sama dengan yang terakhir", () => {
  for (const last of NUM_MINI3) for (let k = 0; k < 30; k++) assert.notEqual(pickNumMini3(last), last);
  const seen = new Set(Array.from({ length: 200 }, () => pickNumMini3(undefined)));
  assert.equal(seen.size, 3);
});
