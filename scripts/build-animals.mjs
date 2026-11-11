// Mengubah emoji hewan Noto Emoji (Google, lisensi Apache 2.0) dari paket @iconify-json/noto
// menjadi WebP 256px di public/animals/. Hasilnya sudah di-commit; jalankan ulang hanya jika
// daftar hewan berubah:  node scripts/build-animals.mjs
import fs from "node:fs";
import { createRequire } from "node:module";
import sharp from "sharp";

const set = createRequire(import.meta.url)("@iconify-json/noto/icons.json");
const MAP = {
  ayam: "rooster", badak: "rhinoceros", cicak: "lizard", dinosaurus: "sauropod", elang: "eagle",
  flamingo: "flamingo", gajah: "elephant", harimau: "tiger", ikan: "fish", jerapah: "giraffe",
  "kupu-kupu": "butterfly", monyet: "monkey", nuri: "parrot", orangutan: "orangutan", penyu: "turtle",
  rusa: "deer", semut: "ant", tupai: "chipmunk", ular: "snake", vikuna: "llama",
  walabi: "kangaroo", zebra: "zebra",
};
fs.mkdirSync("public/animals", { recursive: true });
for (const [name, icon] of Object.entries(MAP)) {
  const ic = set.icons[icon];
  if (!ic) throw new Error("tidak ada ikon: " + icon);
  const w = ic.width || set.width || 128, h = ic.height || set.height || 128;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}">${ic.body}</svg>`;
  const out = `public/animals/${name}.webp`;
  await sharp(Buffer.from(svg), { density: 300 }).resize(256, 256).webp({ quality: 82 }).toFile(out);
  console.log(out, fs.statSync(out).size);
}
