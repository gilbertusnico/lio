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

/** Menyeret satu elemen ke tengah elemen lain, seperti jari anak. */
async function dragTo(page: Page, from: ReturnType<Page["locator"]>, to: ReturnType<Page["locator"]>) {
  const a = (await from.boundingBox())!, b = (await to.boundingBox())!;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2 - 12, { steps: 3 });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  await page.waitForTimeout(80);
  await page.mouse.up();
  await page.waitForTimeout(250);
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
  // Tangan penunjuk mencontohkan goresan di awal, dan hilang begitu layar disentuh
  await page.locator(".hand").waitFor({ timeout: 4000 });
  await page.mouse.move(5, 5);
  await page.mouse.down();
  await page.mouse.up();
  if (await page.locator(".hand").count()) throw new Error(`${ch}: tangan penunjuk tidak hilang saat layar disentuh`);

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
  const lx = r.x + r.width * (PADR + ((lp.ox + lp.s * l0[0]) / 100) * (1 - 2 * PADR)), ly = r.y + r.height * (PADR + ((lp.oy + lp.s * l0[1]) / 100) * (1 - 2 * PADR));
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
  await page.locator(".done-check").waitFor({ timeout: 4000 }); // centang besar tanda mini-game selesai
  await page.waitForTimeout(350);
  await shot(`${ch}-4b-centang`);
  if (ch === letters[0]) {
    // 🗺️ ditekan tepat saat jeda pindah mini-game: dialog tampil, game TIDAK jalan diam-diam di baliknya,
    // dan "Lanjut main" meneruskan ke mini-game berikutnya.
    await page.locator("#btnBack").click({ force: true });
    await page.locator("#leave").waitFor();
    await page.waitForTimeout(3500);
    if (await page.locator(".qgrid").count()) throw new Error(`${ch}: game jalan terus di balik dialog "Berhenti main?"`);
    await page.locator("#leaveNo").click({ force: true });
  }

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
    for (let round = 0; round < 3; round++) {
      if ((await page.locator(".shadow-opt").count()) !== 3) throw new Error(`${ch}: pilihan bayangan bukan 3`);
      const word = await page.locator(".shadow-stage").getAttribute("data-word");
      if (round === 2 && word !== L.word) throw new Error(`${ch}: ronde terakhir bukan hewan huruf ini`);
      if (round === 0) await shot(`${ch}-6-bayangan`);
      const opt = page.locator(`.shadow-opt[aria-label="${word}"]`);
      // Hanya diketuk: belum selesai (harus diseret ke bayangan)
      await opt.click({ force: true });
      await page.waitForTimeout(250);
      if (await page.locator(".shadow-img.reveal").count()) throw new Error(`${ch}: bayangan selesai hanya dengan diketuk`);
      // Gambar yang salah diseret ke bayangan: tidak selesai
      if (round === 0) {
        const bad = page.locator(`.shadow-opt:not([aria-label="${word}"])`).first();
        await dragTo(page, bad, page.locator(".shadow-stage"));
        await page.waitForTimeout(500);
        if (await page.locator(".shadow-img.reveal").count()) throw new Error(`${ch}: gambar salah diterima`);
      }
      if (round === 1) {
        // Seret pelan sambil mengambil tangkapan layar di tengah gerakan, lalu lepas di bayangan
        const a = (await opt.boundingBox())!, b = (await page.locator(".shadow-stage").boundingBox())!;
        await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
        await page.mouse.down();
        await page.mouse.move(b.x + b.width / 2 + 30, b.y + b.height / 2 + 40, { steps: 10 });
        await page.waitForTimeout(150);
        await shot(`${ch}-6-seret`);
        await page.mouse.up();
        await page.waitForTimeout(250);
      } else await dragTo(page, opt, page.locator(".shadow-stage"));
      if (!(await page.locator(".shadow-img.reveal").count())) throw new Error(`${ch}: gambar benar yang diseret ke bayangan tidak diterima`);
      await page.waitForTimeout(1400);
    }
  }
  await page.locator("#win").waitFor({ timeout: 6000 });
  const firstTime = !(await page.evaluate((c) => (window as unknown as { __seen?: Record<string, boolean> }).__seen?.[c], ch));
  await page.evaluate((c) => { const w = window as unknown as { __seen?: Record<string, boolean> }; (w.__seen ||= {})[c] = true; }, ch);
  await page.waitForTimeout(1200);
  await shot(`${ch}-7-menang`);
  if (firstTime) {
    if (!(await page.locator(".new-sticker").count())) throw new Error(`${ch}: "Stiker baru!" tidak muncul`);
    await page.locator("#winAlbum.bump").waitFor({ timeout: 5000 }); // stiker sudah terbang masuk album
    await shot(`${ch}-8-stiker-masuk`);
    await page.locator("#winAlbum").click({ force: true });
    await page.locator("#album").waitFor();
    if ((await page.locator("#album .sticker").count()) !== 26) throw new Error(`${ch}: album bukan 26 kotak`);
    if (!(await page.locator(`#album .sticker.has[aria-label^="Stiker ${L.word}"]`).count())) throw new Error(`${ch}: stiker tidak masuk album`);
    await page.waitForTimeout(700);
    await shot(`${ch}-9-album`);
    await page.locator("#album .icon-btn").click({ force: true });
    await page.locator("#album").waitFor({ state: "detached" });
  } else if (await page.locator(".new-sticker").count()) throw new Error(`${ch}: "Stiker baru!" muncul lagi saat main ulang`);
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

  // Tombol back HP: mundur satu layar di dalam game (peta → cover, kartu pembuka → peta, main → "Berhenti main?")
  await page.goBack();
  await page.locator("#btnStart").waitFor();
  await page.locator("#btnStart").click({ force: true });
  await page.locator("#grid").waitFor();
  await page.locator(".tile").first().click({ force: true });
  await page.locator("#introGo").waitFor();
  await page.goBack();
  await page.locator("#intro").waitFor({ state: "detached" });
  await page.locator("#grid").waitFor();
  await page.locator(".tile").first().click({ force: true });
  await page.locator("#introGo").click({ force: true });
  await page.locator("#board").waitFor();
  await page.goBack();
  await page.locator("#leave").waitFor();
  await page.goBack(); // back lagi = "Lanjut main"
  await page.locator("#leave").waitFor({ state: "detached" });
  if (!(await page.locator("#board").count())) throw new Error("tombol back saat dialog malah keluar dari permainan");
  // Lio diketuk → tangan penunjuk mencontohkan lagi
  await page.waitForTimeout(300);
  await page.mouse.click(5, 5);
  const lio = (await page.locator(".lio-tap").boundingBox())!;
  await page.mouse.click(lio.x + lio.width / 2, lio.y + lio.height / 2);
  await page.locator(".hand").waitFor({ timeout: 3000 });
  await page.locator("#btnBack").click({ force: true });
  await page.locator("#leaveYes").click({ force: true });
  await page.locator("#grid").waitFor();
  if ((await page.locator(".tile").count()) !== 26) throw new Error("jumlah huruf bukan 26");
  if (await page.locator(".tile.locked").count()) throw new Error("ada huruf terkunci");

  for (const ch of letters) {
    const kind = await playLetter(page, ch, shot);
    // "Lagi" → mini-game 3 harus berbeda dari yang terakhir
    await page.locator("#winRetry").click({ force: true });
    await page.locator("#win").waitFor({ state: "detached" });
    await page.locator("#board").waitFor();
    // 🗺️ bertanya dulu: "Lanjut main" membatalkan, "Keluar" baru kembali ke Pilih Huruf
    await page.locator("#btnBack").click({ force: true });
    await page.locator("#leaveNo").click({ force: true });
    await page.locator("#leave").waitFor({ state: "detached" });
    if (!(await page.locator("#board").count())) throw new Error(`${ch}: "Lanjut main" malah keluar`);
    await page.locator("#btnBack").click({ force: true });
    await page.locator("#leaveYes").click({ force: true });
    await page.locator("#grid").waitFor();
    if (!(await page.locator(".tile", { hasText: new RegExp(`^${ch}`) }).locator(".badge").count())) throw new Error(`${ch}: bintang tidak muncul`);
    // Main ulang: jenis mini-game 3 berikutnya harus kebalikannya
    const kind2 = await playLetter(page, ch, (n) => shot(n + "-ulang"));
    if (kind2 === kind) throw new Error(`${ch}: mini-game 3 sama dengan yang terakhir (${kind})`);
    await page.locator("#winNext").click({ force: true });
    await page.locator("#win").waitFor({ state: "detached" });
    await page.waitForTimeout(400);
    if (await page.locator("#introGo").count()) await page.locator("#intro .btn.ghost").click({ force: true });
    await page.locator("#grid").waitFor();
    console.log(`✓ ${ch}: ${kind} lalu ${kind2}`);
  }
  await shot("peta-akhir");
  const map = await page.evaluate(() => {
    const g = document.querySelector("#grid")!, m = document.querySelector("#map")!;
    const last = [...document.querySelectorAll(".tile")].pop()!.getBoundingClientRect();
    return { scroll: g.scrollHeight - g.clientHeight, style: getComputedStyle(g).overflowY, mapScroll: m.scrollHeight - m.clientHeight, bottom: last.bottom, vh: innerHeight };
  });
  if (map.style !== "visible" || map.bottom > map.vh) throw new Error("Pilih Huruf: kotak huruf tidak muat / masih bisa digulir " + JSON.stringify(map));
  // Reset progres: tekan lama "Lio" 3 detik → konfirmasi bergaya game → "Jangan" membatalkan, "Ya, hapus" menghapus
  await page.locator("#btnHome").click({ force: true });
  await page.locator("#btnStart").waitFor();
  await page.waitForTimeout(900);
  const logo = (await page.locator("#start .t2").boundingBox())!;
  const hold = async () => {
    await page.mouse.move(logo.x + logo.width / 2, logo.y + logo.height / 2);
    await page.mouse.down();
    await page.locator(".hold-ring").waitFor({ timeout: 1000 });
    await page.locator("#reset").waitFor({ timeout: 5000 });
    await page.mouse.up();
  };
  await hold();
  await page.locator("#resetNo").click({ force: true });
  await page.locator("#reset").waitFor({ state: "detached" });
  if (!Object.keys((await page.evaluate(() => JSON.parse(localStorage.getItem("lio-progress-v1") || "{}"))).done || {}).length) throw new Error('"Jangan" malah menghapus progres');
  await hold();
  await page.locator("#resetYes").click({ force: true });
  await page.locator("#reset").waitFor({ state: "detached" });
  if (Object.keys((await page.evaluate(() => JSON.parse(localStorage.getItem("lio-progress-v1") || "{}"))).done || {}).length) throw new Error("reset tidak menghapus progres");
  await browser.close();
  if (errors.length) throw new Error("error JS:\n" + errors.join("\n"));
  console.log(`LULUS (${VW}x${VH}): ${letters.join(" ")}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
