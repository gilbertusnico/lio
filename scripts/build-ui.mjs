// Ikon antarmuka dari Noto Emoji (Apache 2.0), dibundel sebagai WebP supaya tampil sama di semua HP.
// Jalankan: node scripts/build-ui.mjs  → public/ui/*.webp
import fs from "node:fs";
import { createRequire } from "node:module";
import sharp from "sharp";

const set = createRequire(import.meta.url)("@iconify-json/noto/icons.json");
const MAP = {
  hand: "backhand-index-pointing-up", album: "ledger", star: "star",
  map: "world-map", home: "house", music: "musical-note", mute: "muted-speaker",
  pencil: "pencil", find: "magnifying-glass-tilted-left", count: "input-numbers",
  herb: "herb", lock: "locked", trophy: "trophy", phone: "mobile-phone",
  basket: "basket", puzzle: "puzzle-piece",
};
fs.mkdirSync("public/ui", { recursive: true });
for (const [name, icon] of Object.entries(MAP)) {
  const ic = set.icons[icon];
  if (!ic) throw new Error("tidak ada ikon: " + icon);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">${ic.body}</svg>`;
  const out = `public/ui/${name}.webp`;
  await sharp(Buffer.from(svg), { density: 300 }).resize(192, 192).webp({ quality: 86 }).toFile(out);
  console.log(out, fs.statSync(out).size);
}
