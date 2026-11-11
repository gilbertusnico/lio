/**
 * Lembar kontak semua huruf (kapital + kecil) untuk dicek dengan mata:
 * bentuk, urutan goresan (angka), titik mulai (bulatan), dan arah (panah).
 * Jalankan: npm run sheet  → docs/lembar-huruf.png
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { ALPHABET, GLYPHS, LINE, type Glyph } from "@/data/glyphs";

const COLORS = ["#e8452c", "#2f6fe0", "#1f9d55", "#a04be0"];

function cell(g: Glyph): string {
  let s = `<svg viewBox="-6 -4 112 112" width="150" height="150">`;
  s += `<line x1="-6" x2="106" y1="${LINE.top}" y2="${LINE.top}" stroke="#8fbfe8" stroke-width=".8"/>`;
  s += `<line x1="-6" x2="106" y1="${LINE.mid}" y2="${LINE.mid}" stroke="#8fbfe8" stroke-width=".8" stroke-dasharray="3 3"/>`;
  s += `<line x1="-6" x2="106" y1="${LINE.base}" y2="${LINE.base}" stroke="#5a9bd8" stroke-width="1"/>`;
  const d = (pts: number[][]) => pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join("");
  for (const st of g.strokes)
    s += st.length === 1
      ? `<circle cx="${st[0][0]}" cy="${st[0][1]}" r="5.5" fill="#dfe4ee"/>`
      : `<path d="${d(st)}" fill="none" stroke="#dfe4ee" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`;
  g.strokes.forEach((st, i) => {
    const c = COLORS[i % COLORS.length];
    if (st.length === 1) {
      s += `<circle cx="${st[0][0]}" cy="${st[0][1]}" r="3" fill="${c}"/>`;
    } else {
      s += `<path d="${d(st)}" fill="none" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/>`;
      // panah arah tiap ±16 titik
      for (let k = 8; k < st.length - 1; k += 16) {
        const a = st[k], b = st[k + 1];
        const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
        s += `<path d="M-2.6 -2.4 L2.6 0 L-2.6 2.4Z" fill="${c}" transform="translate(${a[0]} ${a[1]}) rotate(${ang})"/>`;
      }
      s += `<circle cx="${st[0][0]}" cy="${st[0][1]}" r="4.2" fill="${c}"/>`;
    }
    s += `<text x="${st[0][0]}" y="${st[0][1] + 2.2}" font-size="6" font-weight="700" fill="#fff" text-anchor="middle" font-family="sans-serif">${i + 1}</text>`;
  });
  return s + `</svg>`;
}

const html = `<html><body style="margin:12px;font-family:sans-serif;background:#fff">
<div style="display:grid;grid-template-columns:repeat(8,150px);gap:6px">
${ALPHABET.map((ch) => cell(GLYPHS[ch].upper) + cell(GLYPHS[ch].lower)).join("\n")}
</div></body></html>`;

async function main() {
  const out = path.resolve("docs/lembar-huruf.png");
  const tmp = path.resolve(".sheet.html");
  fs.writeFileSync(tmp, html);
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await pg.goto("file://" + tmp);
  await pg.screenshot({ path: out, fullPage: true });
  await b.close();
  fs.unlinkSync(tmp);
  console.log("tersimpan:", out);
}
main();
