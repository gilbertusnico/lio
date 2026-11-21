# Belajar Bareng Lio: Petualangan Huruf

Web aktivitas belajar huruf A–Z untuk **anak usia 5 tahun (TK B)**, sudut jual "Siap Masuk SD". "Belajar Bareng Lio" = brand/seri (nanti bisa ada "Petualangan Angka", dll.). Layar Start: judul "Belajar Bareng Lio", subjudul "Petualangan Huruf". Versi saat ini = **tes gratis untuk keponakan pemilik** (Next.js statis, tanpa DB dan login).

Baca file ini dulu sebelum mengerjakan apa pun. Bagian 1–3 adalah yang berlaku sekarang; bagian 4 adalah arsip rencana lama (versi berbayar) yang **tidak dipakai**.

## 1. Status dan aturan kerja (18 Nov 2026)

- Semua butir 1–12 (bagian 5) selesai. `main` = branch `claude/adoring-thompson-1l418n`. Vercel tersambung ke `main` (lio-huruf.vercel.app); pemilik yang mengurus Vercel, jangan diutak-atik.
- Sudah dicek pemilik di HP asli (18 Nov): seret bayangan, bunyi, dan cover oke.
- **Aturan dari pemilik**:
  - Bahasa Indonesia, santai.
  - Kerja di branch `claude/adoring-thompson-1l418n`, commit + push sering. **Jangan merge ke `main` sebelum pemilik bilang.**
  - Bunyi "salah" (`oops`) dan tombol musik **TETAP seperti semula** (tombol musik hanya mematikan musik, efek suara selalu menyala).
  - Sesi panjang dengan banyak tangkapan layar boros limit: satu model per sesi, tes secukupnya.
  - MacBook pemilik (2019) lemot: build dan tooling harus ringan.
  - Pembuatan gambar hanya tool gratis (ChatGPT/Gemini/Bing); jangan pakai Creative Claw atau Kling.
- **Menunggu keputusan pemilik** (ditunda, jangan dikerjakan dulu): suara rekaman asli untuk instruksi (anak 5 tahun belum bisa membaca; usulan: rekam 20–30 kalimat kunci, saya yang memasang); gambar bagian bawah mockup cover sebagai latar (opsional, pemilik perlu mengirim gambarnya).
- **Belum dikerjakan (opsional)**: ekspor/pindah progres antar HP (UX-07), indikator gulir album (di HP pendek 26 kotak muat tanpa menggulir, jadi tidak mendesak). Laporan QA lengkap: `docs/qa-2026-11-13.md`. Pembaca layar dan fokus keyboard (A11Y) sengaja dilewati (keputusan pemilik 18 Nov, anak 5 tahun pakai sentuhan).
- Catat ke pemilik/orang tua: progres di `localStorage` = per browser per HP; buka di Chrome atau Safari, bukan browser dalam WhatsApp.

## 1b. Petualangan Angka (branch `fitur/angka`, mulai 21 Nov 2026; BELUM di-merge ke `main`)

Modul kedua setelah huruf. Keputusan pemilik (21 Nov):
- **Alur layar**: Cover (tanpa pita "Petualangan Huruf") → "Mulai Main" → **Pilih Pelajaran** (dua kartu besar: Huruf dan Angka, `components/LessonMenu.tsx`) → Pilih Huruf (`map`) atau Pilih Angka (`nummap`, `components/NumberMap.tsx`). Tombol 🏠 di menu = cover; di Pilih Huruf/Angka = menu. Tombol back HP mengikuti (map/nummap → menu → cover).
- **Rentang**: angka **1–10** (10 ditulis "1" lalu "0"). Semua terbuka, bebas pilih, bintang saat 3 mini-game selesai.
- **Satu level = satu angka = 3 mini-game**: (1) **tebalkan angka** (engine tracing yang sama), (2) **hitung benda** (ketuk satu-satu lalu pilih angka; dipakai ulang dari huruf), (3) **acak, tidak sama dengan main terakhir**: *cocokkan jumlah* (seret kartu angka ke kelompok benda yang sama banyak), *ambilkan N* (seret N buah ke keranjang Lio), atau *cari angka* (gelembung angka, pengecoh mirip 6/9, 2/5, 1/7; angka yang ketemu dipasangkan dengan kelompok titik). **"Hubungkan titik" tidak dipakai.**
- **Buah** (benda yang dihitung + stiker): 1 Apel, 2 Jeruk, 3 Pisang, 4 Mangga, 5 Anggur, 6 Semangka, 7 Nanas, 8 Stroberi, 9 Pir, 10 Kelapa. Gambar Noto Emoji di `public/fruits/` (`npm run fruits`), data di `data/numbers.ts`.
- **Album**: satu album, dua tab (Huruf | Angka). Stiker angka = buah.
- **Progres angka** terpisah: key `lio-progress-angka-v1` (`loadNumProgress`/`saveNumProgress` di `lib/progress.ts`); reset progres (tekan lama Lio) menghapus huruf dan angka.
- **Hati-hati tracing angka**: 8 satu goresan yang menyilang dirinya sendiri (jendela `LOOK` bisa meloncat di titik persilangan), 4 dan 5 punya dua goresan dengan urutan khusus. Wajib dites otomatis seperti 52 bentuk huruf (`tests/`).
- **Tahap kerja** (centang saat selesai, commit + push ke `fitur/angka`):
  - [x] 1. Menu Pilih Pelajaran, cover baru, progres angka terpisah, Pilih Angka (kotak 1–10 belum membuka level: tampil "segera hadir"), buah dibundel, tes e2e diperbarui.
  - [x] 2. Data goresan angka 1–10 (`data/numberGlyphs.ts`, ekspor `NUM_GLYPHS`) + 9 tes di `tests/numberGlyphs.test.ts` + lembar kontak `npm run sheet -- angka` → `docs/lembar-angka.png`. Bentuk: 1 topi+tegak; 2 lengkung+miring+datar; 3 dua lengkung; 4 miring+datar lalu tegak (2 goresan); 5 tegak+perut lalu topi (2 goresan); 6 turun lalu lingkaran; 7 datar+miring; 8 SATU goresan menyilang di tengah (aman: progres berbasis indeks dengan jendela `LOOK`, jadi persilangan tidak membuat loncat); 9 lingkaran lalu batang; 10 = "1" lalu "0" (2 goresan, goresan "1" dan "0" berdampingan dalam satu papan). `build`, `arc`, `Raw` kini diekspor dari `data/glyphs.ts`.
  - [ ] 3. Tiga mini-game angka + layar menang (generalisasi `Game.tsx`/`PlayScreen.tsx` yang sekarang terikat huruf).
  - [ ] 4. Tab angka di album + stiker buah + hewan/buah terbang ke album.
  - [ ] 5. Tes 360×640, 390×844, tablet; perbarui CLAUDE.md; tunggu pemilik bilang merge.

## 2. Keputusan produk (versi Next.js, diputuskan 11 Nov 2026)

- **Stack**: Next.js (App Router, TypeScript) + Tailwind + **Motion (motion.dev)** untuk transisi/popup/reaksi. Gerakan latar terus-menerus (awan, daun) = CSS. Papan tracing = `<canvas>` + Pointer Events. Situs statis (`out/`), tanpa DB, login, Drizzle/Neon/Auth.js. Komponen 21st.dev tidak dipakai (semua kebutuhan sudah ada dengan gaya hutan sendiri). PWA: manifest di `app/manifest.ts` (tampilan tegak).
- **Progres**: `localStorage`. **Semua A–Z terbuka**, bebas pilih tanpa urutan. Huruf yang 3 mini-gamenya selesai dapat bintang dan stiker; bisa dimainkan ulang dari awal.
- **Paywall mati** lewat satu flag `PAYWALL_ENABLED` di `lib/config.ts` (kodenya masih ada).
- **Reset progres**: tekan lama tulisan "Lio" di cover 3 detik (lingkaran terisi), lalu dialog konfirmasi bergaya game.
- **Mini-game 1 (tebalkan)**: papan bergaris buku tulis SD. Tebalkan huruf kapital, kapital mengecil ke kiri, lalu huruf kecil muncul untuk ditebalkan → tampil "A a". Huruf kecil **tulisan tangan** (a satu tangkai, g ekor kait); font game juga harus begitu.
- **Mini-game 2 (cari)**: "Ketuk semua A dan a!": 9 gelembung = 2 kapital + 2 kecil + 5 pengecoh campuran besar/kecil yang mirip; pasangan yang ketemu diberi warna sama.
- **Mini-game 3 (random, tidak sama dengan main terakhir untuk huruf itu)**: *hitung benda* (ketuk satu-satu, lalu pilih angka) atau *cocokkan bayangan* (3 ronde: 2 hewan lain, terakhir hewan huruf itu; gambar **diseret** ke bayangan, dilepas di dekat bayangan = benar, salah/jauh = kembali sendiri). "Huruf awal" dibatalkan.
- **Keluar garis**: papan goyang + Lio sedih (tetap). Keluar garis tidak mengulang dari kapital; Ulangi hanya mengulang bentuk yang sedang ditebalkan.
- **UI/UX**:
  - **Tangan penunjuk** (`components/Hand.tsx`, portal ke `body`): mencontohkan gerakan tiap awal mini-game, muncul lagi setelah 5 detik diam, muncul segera setelah keluar garis 2 kali di goresan yang sama atau mengetuk di luar titik mulai. Tidak membocorkan jawaban. Lio di layar main diketuk = contoh lagi.
  - **Album stiker** (`components/Album.tsx`): tombol di Pilih Huruf dan di layar menang; 26 kotak (belum = bayangan abu-abu, sudah = berwarna + nama, semua bisa diketuk). Stiker = `progress.done`. Saat huruf pertama kali selesai, kartu stiker "Stiker baru!" terbang ke ikon album.
  - **Semua bisa diketuk**: Lio, hewan, awan, daun, semak, batu, bintang bereaksi (`.pokeable` + `poke()` di `lib/poke.ts`, lewat properti `scale`/`translate`/`rotate` supaya tidak bentrok dengan animasi `transform`).
  - **Anti kepencet**: tombol back HP mundur satu layar (`backRef` + `history.pushState` di `components/Game.tsx`); menu tekan-lama, cubit-zoom, dan ketuk-dua-kali-zoom diblokir; `body` dikunci (`position: fixed`, `overscroll-behavior: none`). HP miring menampilkan "Putar HP-nya dulu ya!". Tombol 🗺️ saat main bertanya dulu "Berhenti main?".
  - Tiap mini-game selesai: centang hijau besar + `sfx.correct()`, layar menang muncul ±1,1 detik kemudian. Selesai 26 huruf: "Hebat! Semua huruf selesai!", piala, Lanjut membuka album.
  - **Jangan pakai karakter teks ↩ ↺ ▶ ➜ ✅ di tombol** (tampil beda di iOS/Android): pakai `components/Icon.tsx` (SVG) atau `components/Emo.tsx` (gambar Noto yang dibundel, `public/ui/`, dibuat `npm run ui`).
- **Audio**: **tanpa suara narasi/TTS** (keputusan 10 Nov); instruksi hanya teks di gelembung Lio + petunjuk visual. Efek bunyi dan musik latar dibuat dengan Web Audio (0 KB file) di `lib/audio.ts`: musik C mayor 104 BPM, marimba + bass + shaker, dua melodi + variasi oktaf (±37 detik per putaran), mulai saat "Mulai Main" diketuk, berhenti saat tab disembunyikan, pilihan di `localStorage` key `lio-music-on`. Efek: `tap` (semua tombol, pendengar global di `Game.tsx`; tombol jawaban dikecualikan), `step(n)`, `trace(frac)`, `hint`, `lift`/`snap`/`back`, `whoosh`, `stars`, `appear`, `correct`, `win`, `oops`.
- **Hewan A–Z** (semua **badan utuh**, bukan wajah saja; tema safari/hutan): A Ayam, B Badak, C Cicak, D Dinosaurus, E Elang, F Flamingo, G Gajah, H Harimau, I Ikan, J Jerapah, K Kupu-kupu, L **Lio** (gambar Lio), M Monyet, N Nuri, O Orangutan, P Penyu, Q **Quokka**, R Rusa, S Semut, T Tupai, U Ular, V Vikuna, W Walabi, X **Xerus**, Y **Yak**, Z Zebra. Gambar = **Noto Emoji (Apache 2.0)** dari `@iconify-json/noto`, WebP 256px (±250 KB total, `npm run animals`); Quokka/Xerus/Yak buatan pemilik di ChatGPT gaya Noto (`assets/animals/`). Hewan yang tidak berjalan (kupu-kupu, Lio) melayang/goyang. Untuk huruf/hewan baru: cek badan utuh.
- **Maskot Lio si Singa**: anak singa cowok, berdiri 2 kaki, gaya 3D animasi film; **kacamata bulat berframe hitam tebal** (bukan kacamata hitam), surai pendek oranye keemasan, rompi penjelajah khaki banyak kantong di atas kaos hijau daun, topi safari cokelat muda berpita cokelat tua, celana pendek khaki, bot cokelat, teropong di leher. Karakter buatan sendiri, jangan mirip karakter berhak cipta (mis. Simba). Pose WebP transparan di `public/lio/` (sumber: `assets/lio/`, 8 pose); gerakan di game pakai CSS. Tangan Lio TIDAK melambai (dicoba, jelek, dibatalkan); cover memakai pose melambai utuh.
- **Tema visual hutan**: daun tropis SVG di 4 sudut (versi cermin dibuat di dalam SVG lewat `LEAF_SRCS` di `lib/leaf.ts`, bukan CSS `transform`, karena `transform-origin` di sudut melempar daun ke luar layar). Cover: langit + awan bergerak, bukit/pohon, judul hijau tua `--ink:#1d4a2b` dengan "Lio" gradasi oranye + kilauan, pita kuning "Petualangan Huruf", Lio di gundukan tanah, tombol "Mulai Main" hijau tua berdenyut. Animasi dimatikan kalau `prefers-reduced-motion`.

## 3. Panduan kode

- **Letak kode** (di akar repo): `app/` (layout, `legacy.css` dari prototipe, `game.css` tambahan, manifest), `components/` (layar + mini-game), `data/letters.ts` (26 huruf: hewan, warna, pengecoh), `data/glyphs.ts` (goresan kapital + kecil), `lib/` (engine tracing murni, audio, progres, config), `scripts/` (e2e, lembar kontak, pembuat gambar), `tests/` (tes goresan), `public/` (lio, animals, ui, ikon), `prototype/index.html` (prototipe lama, acuan saja), `docs/` (QA, lembar huruf).
- **Perintah**: `npm run dev | build | lint | test | sheet | e2e -- A G | animals | fruits | ui | icons`. `build` menghasilkan `out/`. `e2e` butuh `out/` disajikan di port 4173 (`npx serve out -l 4173`) dan browser Chromium: `npx playwright install chromium`, atau set `PW_CHROMIUM=/jalan/ke/chromium` kalau sudah punya. `sheet` (lembar kontak `docs/lembar-huruf.png`) juga memakai Playwright. Playwright ada di `devDependencies` (paketnya kecil; browsernya diunduh terpisah).
- **CI**: `.github/workflows/ci.yml` menjalankan lint, `npm test`, dan build di tiap push ke `main` dan pull request. `package-lock.json` sengaja di-`.gitignore` (keputusan pemilik), jadi CI memakai `npm install`.
- **Font**: Grandstander (UI) + Andika (huruf belajar), dibundel lewat fontsource (tanpa Google Fonts saat runtime). Keduanya a satu tangkai dan g ekor kait; Baloo 2 tidak dipakai karena a-nya dua tingkat.
- **Engine tracing** (`lib/trace.ts`, `lib/traceLayout.ts`): koordinat 0–100; garis buku atas 8, tengah 44, dasar 80, ekor sampai 98. Tiap huruf = array stroke (polyline, `arc()` untuk lengkung, `densify()` tiap `STEP = 1.5`). Progres `prog` = indeks titik di stroke aktif. `pointerdown` hanya mulai kalau jari ≤ `TOL_START = 15` dari titik `prog`; `pointermove` memajukan `prog` ke indeks terjauh dalam jendela `LOOK = 12` yang jaraknya ≤ `TOL = 11`; titik terdekat > `OFF = 19` = keluar jalur. Sudut tajam dan titik putar balik harus benar-benar dicapai jari (`corners()`), kalau tidak goresan naik-turun selesai sendiri. Stroke selesai saat `prog >= len - 2`. Memakai `getCoalescedEvents()`; jari kedua di papan diabaikan. Saat menebalkan huruf kecil, huruf dan garis diperbesar sampai ±1,6× (`layout()`). Kapital I digambar dengan garis atas-bawah supaya beda dari l kecil. Tes `tests/glyphs.test.ts` menelusuri semua 52 bentuk huruf.
- **Layout**: Pilih Huruf 5 kolom (6 di tablet), tidak bisa digulir, kotak menyesuaikan tinggi layar lewat container query `.grid-fit` (dites sampai 360×560). Album 5 kolom di HP pendek.
- **Cover bagian bawah** (`app/game.css`, bagian "Cover bagian bawah" dan "Semak & daun bawah cover"): padang rumput `.cover-floor` (komponen `Cover.tsx`, dari commit pemilik `0dabb67`), gundukan tanah `.cover-stage .dirt`, semak hijau tua di belakang Lio (`.cover-floor::after`, `public/ui/cover-bushes.svg`), semak daun kiri-kanan (`.cover-stage .bush`, `public/ui/cover-bush.svg` yang punya ruang di bawah supaya daun tidak terpotong), rumput tepi bawah (`cover-grass.svg`), daun sudut bawah `.cover-leaf.bl/.br` di depan semak (z-index 2) tapi di belakang tombol Mulai Main.
- **CSS**: `legacy.css` (dipindah dari prototipe) dan `game.css` dimuat berurutan di `app/layout.tsx`. CSS mati sudah dibersihkan (18 Nov). Cek ulang bisa dengan membandingkan nama kelas/id di CSS dengan pemakaiannya di `components/`, `lib/`, `data/` (hati-hati kelas dinamis seperti ``ico-${name}`` di `Icon.tsx`).
- **Tes**: Chromium headless di 360×560, 360×640, 390×844, 412×748, 768×1024. Kalau mengubah tampilan, cek minimal 390×844, 360×640, dan tablet 768×1024.

## 4. Arsip: rencana versi berbayar (TIDAK dipakai sekarang)

Rencana awal (9–11 Nov) yang digantikan bagian 2. Disimpan kalau nanti produk dijual lagi. Diurutkan seperlunya, jangan dikerjakan tanpa pemilik minta.

- **Model bisnis lama**: sekali bayar Rp20.000 lewat **Lynk.id**; trial gratis huruf A–C tanpa login; setelah bayar, orang tua login dan semua huruf terbuka. Paywall mock: kartu dengan gembok, "Huruf D–Z masih terkunci", 3 poin manfaat, tombol hijau "Beli Rp 20.000", "Pembayaran lewat Lynk.id", link "Nanti saja" (tanpa parent gate; kodenya masih ada di balik flag).
- **Akses**: Lynk.id mengirim file/link yang sama ke semua pembeli (tidak ada kode unik atau webhook yang ditemukan). Alur pilihan: pembeli daftar dengan email pembelian; pemilik menempel email dari dashboard Lynk.id ke textarea di halaman admin (satu per baris) → tabel `whitelist_emails`; saat daftar/login cocok = `is_paid`, kalau belum "Pembayaranmu sedang diverifikasi". Belum dicek: apakah Lynk.id punya webhook/API penjualan. Nanti: Midtrans/Xendit dengan webhook.
- **Stack lama**: Neon (Postgres serverless, AWS Singapore; tidur 5 menit di paket gratis; region tidak bisa diganti) + Drizzle ORM (`@neondatabase/serverless`) + Auth.js (credentials) + Vercel function region `sin1` (harus satu region dengan DB). Dibanding Supabase gratis yang di-pause setelah 7 hari sepi.
- **Skema usulan**: `users` (id, email unik, password_hash, is_paid, is_admin, created_at), `whitelist_emails` (email unik, added_at, note), `children` (id, user_id, nickname; 1–3 profil, nama panggilan saja), `progress` (child_id, activity, item, stars, completed_at), `sessions/devices` (batas 2 perangkat).
- **Aturan**: kunci konten dicek di server, bukan hanya disembunyikan di UI; progres localStorage dipindah ke akun setelah login; halaman admin (tempel email, daftar pengguna, cari, reset password, nonaktifkan); produk Lynk.id berisi link ke halaman daftar.
- **TTS lama**: Web Speech API `id-ID` (kualitas beda per HP); rencana MP3 dari Google Cloud Text-to-Speech. Dibatalkan 10 Nov, tapi opsi suara rekaman asli masih terbuka (lihat bagian 1).
- **Ide yang ditunda**: versi PDF printable 32 halaman; aktivitas lain (labirin, mewarnai, pola, hubungkan titik, huruf dan bunyi, angka 1–10); Mesin C (seret-lepas: sortir warna, susun suku kata); sertifikat unduhan; dashboard orang tua (progres per huruf, batas waktu main); tema lain ("Aku Belajar Jualan", hewan Nusantara, "Petualangan Angka"); domain sendiri.
- **Prototipe** `prototype/index.html` (satu file tanpa build, artifact https://claude.ai/artifact/JAg61UWr7kGKhEnowDSNwF): sumber logika tracing, Mesin B, dan cover sebelum dipindah ke Next.js. Masih emoji bawaan dan huruf kapital saja.

## 5. Daftar pekerjaan (semua selesai)

Aturan lama: kerjakan dari atas ke bawah, tiap butir: tes, commit + push, centang. Kalau model berganti, baca daftar ini dan lanjutkan butir `[ ]` pertama (sekarang tidak ada).

- [x] 1. Kerangka Next.js + Tailwind + Motion, struktur berbasis data (26 huruf), aset ke `public/`.
- [x] 2. Engine tracing React (canvas), papan buku tulis SD, alur kapital → kecil.
- [x] 3. Data goresan 49 bentuk baru (kapital D–Z + kecil a–z) + tes otomatis + lembar kontak.
- [x] 4. Mini-game 2 (cari) dan mini-game 3 random (hitung / bayangan).
- [x] 5. Progres localStorage + semua terbuka + bintang.
- [x] 6. Bundel Noto Emoji + Quokka/Xerus/Yak/Lio.
- [x] 7. Album stiker, hewan terbang ke album.
- [x] 8. Tangan penunjuk.
- [x] 9. Semua bisa diketuk + animasi Motion.
- [x] 10. Anti kepencet (zoom, tarik-refresh, back HP, reset tekan-lama).
- [x] 11. Cover, peta huruf, kartu pembuka, layar menang; paywall di balik flag.
- [x] 12. Polesan UI/UX, ikon Noto, tes multi-ukuran layar.
- [x] Sesudahnya (15–18 Nov): efek suara tambahan, cover bagian bawah mengikuti mockup, perbaikan semak/daun cover yang terpotong, pembersihan CSS mati, CI, Playwright di `devDependencies`.
