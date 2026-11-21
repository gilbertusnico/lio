/**
 * Tes ujung-ke-ujung Petualangan Angka: memainkan satu angka penuh (tebalkan → hitung buah → mini-game 3)
 * berulang lewat tombol "Lagi" sampai ketiga jenis mini-game 3 (cocokkan jumlah, ambilkan N, cari angka)
 * pernah keluar, lalu memeriksa bintang, localStorage, dan error JS.
 *
 * Pakai:  npm run build && npx serve out -l 4173
 *         npm run e2e:angka -- 1 8 10     (angka yang dites; bawaan: 5)
 * Variabel: URL (bawaan http://localhost:4173), VIEW=390x844, SHOTS=folder tangkapan layar.
 */
import { chromium, type Locator, type Page } from "playwright";
import type { Glyph } from "@/data/glyphs";
import { NUM_GLYPHS } from "@/data/numberGlyphs";
import { NUMBERS } from "@/data/numbers";
import { PADR } from "@/lib/traceLayout";

const URL = process.env.URL || "http://localhost:4173";
const [VW, VH] = (process.env.VIEW || "390x844").split("x").map(Number);
const SHOTS = process.env.SHOTS;
const nums = (process.argv.slice(2).length ? process.argv.slice(2) : ["5"]).map(Number);
const KEY = "lio-progress-angka-v1";

async function traceGlyph(page: Page, g: Glyph) {
  const r = (await page.locator("#board").boundingBox())!;
  const at = (p: number[]) => [r.x + r.width * (PADR + (p[0] / 100) * (1 - 2 * PADR)), r.y + r.height * (PADR + (p[1] / 100) * (1 - 2 * PADR))];
  for (const st of g.strokes) {
    const [x0, y0] = at(st[0]);
    await page.mouse.move(x0, y0);
    await page.mouse.down();
    for (let k = 2; k < st.length; k += 2) { const [x, y] = at(st[k]); await page.mouse.move(x, y); }
    const [x1, y1] = at(st[st.length - 1]);
    await page.mouse.move(x1, y1);
    await page.mouse.up();
    await page.waitForTimeout(120);
  }
}

async function dragTo(page: Page, from: Locator, to: Locator) {
  const a = (await from.boundingBox())!, b = (await to.boundingBox())!;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2 - 12, { steps: 3 });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  await page.waitForTimeout(80);
  await page.mouse.up();
  await page.waitForTimeout(250);
}

const bubble = async (page: Page) => (await page.locator("#bubble").textContent()) || "";

/** Satu putaran level angka mulai dari mini-game 1 (papan sudah tampil). Mengembalikan jenis mini-game 3. */
async function playRound(page: Page, n: number, shot: (s: string) => Promise<void>, first: boolean) {
  const lv = NUMBERS[n - 1];
  await page.locator("#board").waitFor();
  await page.waitForTimeout(300);
  if ((await page.locator("#dots .dot").count()) !== NUM_GLYPHS[n].strokes.length) throw new Error(`${n}: jumlah titik goresan salah`);
  await shot(`${n}-1-tebalkan`);
  await traceGlyph(page, NUM_GLYPHS[n]);
  if (!(await bubble(page)).includes(`Itu angka ${n}`)) throw new Error(`${n}: Lio tidak memuji angka ${n} ("${await bubble(page)}")`);
  await page.locator(".done-check").waitFor({ timeout: 4000 });

  // Mini-game 2: hitung buah, jumlahnya = angka level
  await page.locator(".qitems").waitFor({ timeout: 6000 });
  await page.waitForTimeout(300);
  const items = await page.locator(".qitem").count();
  if (items !== n) throw new Error(`${n}: buah yang dihitung ${items}, harusnya ${n}`);
  if (await page.locator(".critter").count()) throw new Error(`${n}: buah jalan-jalan ikut tampil saat menghitung`);
  for (let i = 0; i < n; i++) await page.locator(".qitem").nth(i).click({ force: true });
  await shot(`${n}-2-hitung`);
  const opts = (await page.locator(".qopt").allTextContents()).map(Number);
  if (opts.length !== 3 || !opts.includes(n) || opts.some((v) => v < 1 || v > 10)) throw new Error(`${n}: pilihan angka ${opts}`);
  await page.locator(".qopt", { hasText: new RegExp(`^${n}$`) }).click({ force: true });

  // Mini-game 3
  await page.locator(".match, .pile, .qgrid").first().waitFor({ timeout: 6000 });
  await page.waitForTimeout(500);
  let kind: string;
  if (await page.locator(".match").count()) {
    kind = "match";
    const counts = await page.locator(".match-row").evaluateAll((els) => els.map((e) => Number(e.getAttribute("data-count"))));
    if (counts.length !== 3 || !counts.includes(n)) throw new Error(`${n}: kelompok ${counts}`);
    // Kartu salah ke kelompok: kembali, tidak dipasangkan
    const v0 = counts[0], wrongRow = page.locator(".match-row").nth(1);
    await dragTo(page, page.locator(`.match-card[aria-label="Kartu angka ${v0}"]`), wrongRow);
    await page.waitForTimeout(400);
    if (await page.locator(".match-row.ok").count()) throw new Error(`${n}: kartu salah diterima`);
    // Hanya diketuk: tidak dipasangkan
    await page.locator(`.match-card[aria-label="Kartu angka ${v0}"]`).click({ force: true });
    await page.waitForTimeout(250);
    if (await page.locator(".match-row.ok").count()) throw new Error(`${n}: kartu dipasangkan hanya dengan diketuk`);
    await shot(`${n}-3-cocok`);
    for (const v of counts) {
      await dragTo(page, page.locator(`.match-card[aria-label="Kartu angka ${v}"]`), page.locator(`.match-row[data-count="${v}"]`));
      await page.waitForTimeout(250);
      if (!(await page.locator(`.match-row.ok[data-count="${v}"]`).count())) throw new Error(`${n}: kartu ${v} tidak diterima`);
    }
  } else if (await page.locator(".pile").count()) {
    kind = "basket";
    const total = await page.locator(".pile-item").count();
    if (total <= n) throw new Error(`${n}: tumpukan ${total} buah, harus lebih dari ${n}`);
    await page.locator(".pile-item").first().click({ force: true });
    await page.waitForTimeout(250);
    if ((await page.locator(".basket").getAttribute("data-count")) !== "0") throw new Error(`${n}: buah masuk hanya dengan diketuk`);
    for (let k = 1; k <= n; k++) {
      await dragTo(page, page.locator(".pile-item:not(.used)").first(), page.locator(".basket"));
      const c = Number(await page.locator(".basket").getAttribute("data-count"));
      if (c !== k) throw new Error(`${n}: isi keranjang ${c}, harusnya ${k}`);
      if (k === Math.ceil(n / 2)) await shot(`${n}-3-keranjang`);
    }
    if ((await page.locator(".pile-item:not(.used)").count()) !== total - n) throw new Error(`${n}: sisa buah salah`);
  } else {
    kind = "findnum";
    const cells = (await page.locator(".qb .qn").allTextContents()).map(Number);
    if (cells.length !== 9 || cells.filter((c) => c === n).length !== 3) throw new Error(`${n}: gelembung ${cells}`);
    if (!lv.similar.every((s) => cells.includes(s) || lv.similar.length > 6)) throw new Error(`${n}: pengecoh mirip tidak dipakai (${cells})`);
    await page.locator(".qb").nth(cells.findIndex((c) => c !== n)).click({ force: true });
    if (!(await bubble(page)).includes(`Cari angka ${n}`)) throw new Error(`${n}: pesan salah tidak tampil`);
    for (let i = 0; i < 9; i++) if (cells[i] === n) {
      await page.locator(".qb").nth(i).click({ force: true });
      if ((await page.locator(".qb.found").nth(0).locator(".ndots i").count()) !== n) throw new Error(`${n}: titik bukan ${n}`);
      if (i === cells.indexOf(n)) await shot(`${n}-3-cari`);
    }
  }

  await page.locator("#win").waitFor({ timeout: 6000 });
  await page.waitForTimeout(900);
  await shot(`${n}-4-menang-${kind}`);
  const t = (await page.locator("#winText").textContent()) || "";
  if (!t.includes(`Angka ${n} selesai`) && !t.includes("Semua angka")) throw new Error(`${n}: teks menang "${t}"`);
  if (first !== !!(await page.locator(".new-sticker").count())) throw new Error(`${n}: "Stiker baru!" ${first ? "tidak muncul" : "muncul lagi"}`);
  if (first && !(await page.locator(`.new-sticker img[alt="${lv.fruit}"]`).count())) throw new Error(`${n}: stiker bukan ${lv.fruit}`);
  const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "{}"), KEY);
  if (!saved.done?.[n]) throw new Error(`${n}: progres tidak tersimpan`);
  if (saved.last3?.[n] !== kind) throw new Error(`${n}: jenis mini-game 3 tidak tercatat`);
  if (Object.keys(JSON.parse((await page.evaluate(() => localStorage.getItem("lio-progress-v1"))) || "{}").done || {}).length)
    throw new Error(`${n}: progres huruf ikut berubah`);
  return kind;
}

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  const shot = async (n: string) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${VW}-angka-${n}.png` }); };

  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator("#btnStart").click({ force: true });
  await page.locator(".lesson-card.numbers").click({ force: true });
  await page.locator("#numap").waitFor();

  for (const n of nums) {
    const lv = NUMBERS[n - 1];
    await page.locator(".numtile").nth(n - 1).click({ force: true });
    await page.locator("#introGo").waitFor();
    await page.waitForTimeout(600);
    await shot(`${n}-0-pembuka`);
    if ((await page.locator(".intro-fruits img").count()) !== n) throw new Error(`${n}: kartu pembuka bukan ${n} buah`);
    if ((await page.locator(".intro-word").textContent()) !== lv.word) throw new Error(`${n}: kata angka salah`);
    await page.locator("#introGo").click({ force: true });
    const kinds: string[] = [];
    for (let k = 0; k < 8 && new Set(kinds).size < 3; k++) {
      if (k > 0) {
        await page.locator("#winRetry").click({ force: true });
        await page.locator("#win").waitFor({ state: "detached" });
      }
      const kind = await playRound(page, n, (s) => shot(k ? `${s}-r${k}` : s), k === 0);
      if (kinds.length && kinds[kinds.length - 1] === kind) throw new Error(`${n}: mini-game 3 sama dengan yang terakhir (${kind})`);
      kinds.push(kind);
    }
    if (new Set(kinds).size < 3) throw new Error(`${n}: tidak semua jenis mini-game 3 keluar (${kinds})`);
    // Lanjut → angka berikutnya (kartu pembuka), atau kembali ke Pilih Angka setelah 10
    await page.locator("#winNext").click({ force: true });
    await page.locator("#win").waitFor({ state: "detached" });
    await page.waitForTimeout(400);
    if (n < 10) {
      if ((await page.locator(".intro-word").textContent()) !== NUMBERS[n].word) throw new Error(`${n}: Lanjut tidak membuka angka ${n + 1}`);
      await page.locator("#introBack").click({ force: true });
    }
    await page.locator("#numap").waitFor();
    if (!(await page.locator(".numtile").nth(n - 1).locator(".badge").count())) throw new Error(`${n}: bintang tidak muncul`);
    console.log(`✓ ${n}: ${kinds.join(", ")}`);
  }
  // Tombol back HP saat main angka: tanya dulu, Keluar = kembali ke Pilih Angka
  await page.locator(".numtile").first().click({ force: true });
  await page.locator("#introGo").click({ force: true });
  await page.locator("#board").waitFor();
  await page.goBack();
  await page.locator("#leave").waitFor();
  await page.locator("#leaveYes").click({ force: true });
  await page.locator("#numap").waitFor();
  await browser.close();
  if (errors.length) throw new Error("error JS:\n" + errors.join("\n"));
  console.log(`LULUS (${VW}x${VH}): angka ${nums.join(" ")}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
