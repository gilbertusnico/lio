// Membuat favicon dan ikon aplikasi dari wajah Lio (pose melambai) di atas latar kuning-hijau.
// Jalankan: node scripts/build-icons.mjs  → app/icon.png, app/apple-icon.png, app/favicon.ico
import fs from "node:fs";
import sharp from "sharp";

// Kotak wajah Lio pada public/lio/lio-depan-melambai.webp (359×505)
const FACE = { left: 48, top: 0, width: 262, height: 262 };

async function icon(size, rounded) {
  const r = rounded ? Math.round(size * 0.22) : 0;
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff08f"/><stop offset="1" stop-color="#8fdc6b"/></linearGradient></defs>
      <rect width="${size}" height="${size}" rx="${r}" fill="url(#g)"/></svg>`,
  );
  const inner = Math.round(size * 0.94);
  const face = await sharp("public/lio/lio-depan-melambai.webp").extract(FACE).resize(inner, inner).png().toBuffer();
  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}"/></svg>`);
  return sharp(bg)
    .composite([{ input: face, left: Math.round((size - inner) / 2), top: size - inner }, { input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

/** Membungkus PNG menjadi .ico (format ICO boleh berisi PNG). */
function ico(pngs) {
  const head = Buffer.alloc(6 + 16 * pngs.length);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(pngs.length, 4);
  let off = head.length;
  pngs.forEach(({ size, buf }, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(size >= 256 ? 0 : size, e);
    head.writeUInt8(size >= 256 ? 0 : size, e + 1);
    head.writeUInt16LE(1, e + 4);
    head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(buf.length, e + 8);
    head.writeUInt32LE(off, e + 12);
    off += buf.length;
  });
  return Buffer.concat([head, ...pngs.map((p) => p.buf)]);
}

fs.writeFileSync("app/icon.png", await icon(192, true));
fs.writeFileSync("app/apple-icon.png", await icon(180, false)); // iOS membulatkan sendiri
fs.writeFileSync("app/favicon.ico", ico([{ size: 32, buf: await icon(32, true) }, { size: 48, buf: await icon(48, true) }]));
console.log("ikon dibuat");
