/**
 * Tes ujung-ke-ujung: memainkan satu huruf penuh di browser (tracing kapital + kecil → cari huruf →
 * hitung/bayangan → menang), lalu memeriksa bintang, localStorage, dan error JS.
 *
 * Pakai:  npm run build && npx serve out -l 4173   (atau server statis lain)
 *         npm run e2e -- A G J L        (huruf yang dites; bawaan: A)
 * Variabel: URL (bawaan http://localhost:4173), VIEW=390x844, SHOTS=folder tangkapan layar.
 */
import { chromium, type Page } from "playwright";
import { GLYPHS, type Glyph } from "@/data/glyphs";
import { LETTERS } from "@/data/letters";
import { PADR, layout, type Pose } from "@/lib/traceLayout";

const URL = process.env.URL || "http://localhost:4173";
const [VW, VH] = (process.env.VIEW || "390x844").split("x").map(Number);
const SHOTS = process.env.SHOTS;
const letters = process.argv.slice(2).length ? process.argv.slice(2) : ["A"];
const ID: Pose = { s: 1, ox: 0, oy: 0 };

async function traceGlyph(page: Page, g: Glyph, pose: Pose) {
  const r = (await page.locator("#board").boundingBox())!;
  const at = (p: number[]) => [
    r.x + r.width * (PADR + ((pose.ox + pose.s * p[0]) / 100) * (1 - 2 * PADR)),
    r.y + r.height * (PADR + ((pose.oy + pose.s * p[1]) / 100) * (1 - 2 * PADR)),
  ];
  for (const st of g.strokes) {
    const [x0, y0] = at(st[0]);
    await page.mouse.move(x0, y0);
    await page.mouse.down();
    for (let k = 2; k < st.length; k += 2) {
      const [x, y] = at(st[k]);
      await page.mouse.move(x, y);
    }
    const [x1, y1] = at(st[st.length - 1]);
    await page.mouse.move(x1, y1);
    await page.mouse.up();
    await page.waitForTimeout(120);
  }
}

async function playLetter(page: Page, ch: string, shot: (n: string) => Promise<void>) {
  const L = LETTERS.find((l) => l.ch === ch)!;
  const lo = ch.toLowerCase();
  const { upper, lower } = GLYPHS[ch];
  await page.locator(".tile", { hasText: new RegExp(`^${ch}`) }).click({ force: true });
  await page.locator("#introGo").waitFor();
  await page.waitForTimeout(350);
  await shot(`${ch}-1-intro`);
  await page.locator("#introGo").click({ force: true });
  await page.locator("#board").waitFor();
  await page.waitForTimeout(500);

  // Keluar garis: mulai di titik 1 lalu lari jauh → papan goyang
  const r = (await page.locator("#board").boundingBox())!;
  const s0 = upper.strokes[0][0];
  const sx = r.x + r.width * (PADR + (s0[0] / 100) * (1 - 2 * PADR)), sy = r.y + r.height * (PADR + (s0[1] / 100) * (1 - 2 * PADR));
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.mouse.move(sx > r.x + r.width / 2 ? r.x + 6 : r.x + r.width - 6, r.y + r.height - 6, { steps: 4 });
  await page.mouse.up();
  if (!(await page.locator("#card.shake").count())) throw new Error(`${ch}: papan tidak goyang saat keluar garis`);
  if (!(await page.locator("img.lio-talk.sad").count())) throw new Error(`${ch}: Lio tidak sedih saat keluar garis`);
  await page.locator("#btnRetry").click({ force: true });
  await page.waitForTimeout(400);

  await shot(`${ch}-2-kapital`);
  await traceGlyph(page, upper, ID);
  await page.waitForTimeout(1100);
  await shot(`${ch}-3-kecil`);
  // Keluar garis saat menebalkan huruf kecil: tetap di huruf kecil, kapital tidak diulang
  const lp = layout(upper, lower).lower, l0 = lower.strokes[0][0];
  const lx = r.x + r.width * (PADR + ((lp.ox + l0[0]) / 100) * (1 - 2 * PADR)), ly = r.y + r.height * (PADR + ((lp.oy + l0[1]) / 100) * (1 - 2 * PADR));
  const dotsLower = await page.locator("#dots .dot").count();
  if (dotsLower !== lower.strokes.length) throw new Error(`${ch}: belum masuk huruf kecil`);
  await page.mouse.move(lx, ly);
  await page.mouse.down();
  await page.mouse.move(r.x + 6, r.y + 6, { steps: 4 });
  await page.mouse.up();
  if (!(await page.locator("#card.shake").count())) throw new Error(`${ch}: papan tidak goyang di huruf kecil`);
  await page.waitForTimeout(500);
  if ((await page.locator("#bubble").textContent())?.includes("tebalkan huruf")) throw new Error(`${ch}: kembali ke kapital setelah keluar garis`);
  // Ulangi saat di huruf kecil mengulang huruf kecil saja
  await page.locator("#btnRetry").click({ force: true });
  await page.waitForTimeout(400);
  const say = (await page.locator("#bubble").textContent()) || "";
  if (!say.includes(`${lo} kecil`)) throw new Error(`${ch}: Ulangi tidak mengulang huruf kecil ("${say}")`);
  await traceGlyph(page, lower, layout(upper, lower).lower);
  await page.waitForTimeout(1500);
  await shot(`${ch}-4-berdua`);

  // Mini-game 2: cari huruf
  await page.locator(".qgrid").waitFor({ timeout: 6000 });
  await page.waitForTimeout(300);
  // Ketuk ikon langkah 1 (✅) → main tebalkan huruf lagi, lalu selesaikan lagi
  if (ch === letters[0]) {
    await page.locator("#steps .step").nth(0).click({ force: true });
    await page.locator("#board").waitFor();
    await page.waitForTimeout(400);
    await traceGlyph(page, upper, ID);
    await page.waitForTimeout(1100);
    await traceGlyph(page, lower, layout(upper, lower).lower);
    await page.locator(".qgrid").waitFor({ timeout: 6000 });
    await page.waitForTimeout(300);
  }
  const cells = await page.locator(".qb").allTextContents();
  if (cells.length !== 9) throw new Error(`${ch}: gelembung ${cells.length}, harusnya 9`);
  const nUp = cells.filter((c) => c === ch).length, nLo = cells.filter((c) => c === lo).length;
  if (nUp !== 2 || nLo !== 2) throw new Error(`${ch}: target ${nUp} kapital + ${nLo} kecil, harusnya 2 + 2`);
  const wrongIdx = cells.findIndex((c) => c !== ch && c !== lo);
  await page.locator(".qb").nth(wrongIdx).click({ force: true }); // salah dulu
  await shot(`${ch}-5-cari`);
  for (let i = 0; i < 9; i++) if (cells[i] === ch || cells[i] === lo) await page.locator(".qb").nth(i).click({ force: true });

  // Mini-game 3: hitung atau bayangan
  await page.locator(".qitems, .shadow-stage").first().waitFor({ timeout: 6000 });
  await page.waitForTimeout(300);
  let kind: string;
  if (await page.locator(".qitems").count()) {
    kind = "count";
    const n = await page.locator(".qitem").count();
    for (let i = 0; i < n; i++) await page.locator(".qitem").nth(i).click({ force: true });
    await shot(`${ch}-6-hitung`);
    await page.locator(".qopt", { hasText: new RegExp(`^${n}$`) }).click({ force: true });
  } else {
    kind = "shadow";
    if ((await page.locator(".shadow-opt").count()) !== 3) throw new Error(`${ch}: pilihan bayangan bukan 3`);
    await shot(`${ch}-6-bayangan`);
    await page.locator(`.shadow-opt[aria-label="${L.word}"]`).click({ force: true });
  }
  await page.locator("#win").waitFor({ timeout: 6000 });
  await page.waitForTimeout(600);
  await shot(`${ch}-7-menang`);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("lio-progress-v1") || "{}"));
  if (!saved.done?.[ch]) throw new Error(`${ch}: progres tidak tersimpan`);
  if (saved.last3?.[ch] !== kind) throw new Error(`${ch}: jenis mini-game 3 tidak tercatat`);
  return kind;
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  const shot = async (n: string) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${VW}-${n}.png` }); };

  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator("#btnStart").click({ force: true });
  await page.locator("#grid").waitFor();
  if ((await page.locator(".tile").count()) !== 26) throw new Error("jumlah huruf bukan 26");
  if (await page.locator(".tile.locked").count()) throw new Error("ada huruf terkunci");

  for (const ch of letters) {
    const kind = await playLetter(page, ch, shot);
    // "Lagi" → mini-game 3 harus berbeda dari yang terakhir
    await page.locator("#winRetry").click({ force: true });
    await page.locator("#win").waitFor({ state: "detached" });
    await page.locator("#board").waitFor();
    await page.locator("#btnBack").click({ force: true });
    await page.locator("#grid").waitFor();
    if (!(await page.locator(".tile", { hasText: new RegExp(`^${ch}`) }).locator(".badge").count())) throw new Error(`${ch}: bintang tidak muncul`);
    // Main ulang: jenis mini-game 3 berikutnya harus kebalikannya
    const kind2 = await playLetter(page, ch, async () => {});
    if (kind2 === kind) throw new Error(`${ch}: mini-game 3 sama dengan yang terakhir (${kind})`);
    await page.locator("#winNext").click({ force: true });
    await page.locator("#win").waitFor({ state: "detached" });
    await page.waitForTimeout(400);
    if (await page.locator("#introGo").count()) await page.locator("#intro .btn.ghost").click({ force: true });
    await page.locator("#grid").waitFor();
    console.log(`✓ ${ch}: ${kind} lalu ${kind2}`);
  }
  await shot("peta-akhir");
  await browser.close();
  if (errors.length) throw new Error("error JS:\n" + errors.join("\n"));
  console.log(`LULUS (${VW}x${VH}): ${letters.join(" ")}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
