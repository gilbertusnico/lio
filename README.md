# Belajar Bareng Lio: Petualangan Huruf

Web game belajar huruf A–Z untuk anak usia 5–6 tahun. Tiap huruf berisi 3 mini-game: menebalkan huruf (kapital lalu huruf kecil), mencari huruf, dan berhitung atau mencocokkan bayangan hewan.

Situs statis (Next.js, tanpa server dan tanpa database). Progres disimpan di `localStorage`, jadi berlaku per browser per perangkat.

## Menjalankan

Butuh Node 20 atau lebih baru.

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Untuk hasil akhir seperti di hosting: `npm run build`, lalu sajikan folder `out/` (misalnya `npx serve out`).

## Perintah

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build statis ke `out/` |
| `npm run lint` | ESLint |
| `npm test` | Tes goresan 52 bentuk huruf |
| `npm run sheet` | Lembar kontak semua huruf ke `docs/lembar-huruf.png` |
| `npm run e2e -- A G` | Memainkan huruf penuh di browser (lihat catatan) |
| `npm run animals` / `npm run ui` / `npm run icons` | Membuat ulang gambar hewan, ikon antarmuka, dan ikon aplikasi |

`npm run e2e` dan `npm run sheet` butuh Playwright, yang tidak dipasang bersama proyek supaya instalasinya ringan:

```bash
npm i -D playwright
npx playwright install chromium
```

Tes e2e juga butuh `out/` disajikan di port 4173 (`npx serve out -l 4173`).

## Struktur

- `app/` — layout, gaya, manifest
- `components/` — layar dan mini-game
- `data/letters.ts` — 26 huruf: hewan, warna, pengecoh
- `data/glyphs.ts` — goresan huruf kapital dan huruf kecil
- `lib/` — engine tracing, audio, progres, pengaturan (`lib/config.ts`)
- `CLAUDE.md` — semua keputusan produk dan catatan pengerjaan

## Untuk orang tua

- Buka di Chrome atau Safari, bukan browser di dalam WhatsApp, supaya progres tersimpan.
- Reset progres: tekan dan tahan tulisan "Lio" di halaman depan selama 3 detik.

Gambar hewan dan ikon memakai Noto Emoji (Google, lisensi Apache 2.0).
