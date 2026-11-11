# Belajar Bareng Lio: Petualangan Huruf (web aktivitas anak)

**Nama produk** (diputuskan 10 Nov 2026): **Belajar Bareng Lio: Petualangan Huruf**. "Belajar Bareng Lio" = brand/seri (nanti bisa ada "Petualangan Angka", dll.). Layar Start: judul "Belajar Bareng Lio", subjudul "Petualangan Huruf".

Ringkasan konteks dari percakapan perencanaan (9–11 November 2026). Baca file ini dulu sebelum mengerjakan apa pun.

## 0. RENCANA VERSI NEXT.JS (diputuskan 11 Nov 2026, BELUM dikerjakan; tunggu pemilik bilang mulai)
Versi tes gratis untuk dicoba keponakan pemilik. Bagian ini MENGGANTIKAN keputusan lama yang bertentangan (paywall, A–C saja, urutan wajib, emoji bawaan, Drizzle/Neon/Auth).
- **Repo**: `gilbertusnico/lio` (kosong saat dicek), clone di `/home/user/lio-app`. Push saja; **jangan urus Vercel** (pemilik menyambungkan sendiri nanti). gambar pose Lio ada di `assets/lio/` (pindahkan ke `public/` saat mulai).
- **Stack**: Next.js (App Router, TypeScript) + **Tailwind CSS** + **Motion (motion.dev)** untuk transisi/popup/reaksi + komponen **21st.dev** (sesuaikan ke tema hutan). Gerakan latar terus-menerus (awan, daun) tetap CSS. Papan tracing tetap `<canvas>`. Situs statis, **tanpa DB, tanpa login, tanpa Drizzle/Neon/Auth.js** untuk saat ini.
- **Progres**: `localStorage` (catat ke pemilik: per browser per HP; buka di Chrome, bukan browser dalam WhatsApp).
- **Semua A–Z terbuka**, bebas pilih tanpa urutan. Huruf yang 3 mini-gamenya selesai dapat **bintang**; tetap bisa dimainkan ulang dari awal.
- **Paywall disembunyikan total** (kode tetap ada, nyalakan lewat satu flag).
- **Reset progres**: tekan lama logo "Lio" di cover 3 detik → konfirmasi. Tag "PROTOTIPE" disembunyikan dari anak.
- **Mini-game 1**: papan bergaris buku tulis SD (garis atas, tengah putus-putus, dasar). Tebalkan **huruf kapital dulu**, lalu kapital mengecil ke kiri dan muncul **huruf kecil** untuk ditebalkan → akhirnya tampil "A a". Huruf kecil **bentuk tulisan tangan** (a satu tangkai, g ekor kait); font game juga harus a/g tulisan tangan.
- **Mini-game 2**: "Ketuk semua A dan a!": 9 gelembung = 2 kapital + 2 kecil + 5 pengecoh campuran besar/kecil yang mirip; pasangan yang ketemu diberi warna sama.
- **Mini-game 3**: **random** tiap main (tidak sama dengan terakhir untuk huruf itu) antara **hitung benda** dan **cocokkan bayangan** (bayangan hewan, pilih 1 dari 3 gambar). "Huruf awal" DIBATALKAN.
- **Keluar garis**: TETAP seperti sekarang (papan goyang + Lio sedih). Saran "tidak menghukum" dibatalkan.
- **UI/UX yang masuk**: (1) tangan penunjuk mencontohkan gerakan tiap awal mini-game, muncul lagi kalau anak diam 5 detik; (2) **Album stiker**: tombol 📒 di layar Pilih Huruf, halaman 26 kotak (belum didapat = bayangan abu-abu, sudah = berwarna + nama, diketuk bereaksi), saat menang hewan terbang masuk ke ikon album + "Stiker baru!"; (3) semua bisa diketuk (Lio, hewan, awan, daun bereaksi); (4) anti kepencet: kunci zoom & tarik-refresh, tombol back HP kembali ke layar sebelumnya.
- **Hewan A–Z (semua hewan, tema safari/hutan, badan utuh)**: A Ayam 🐓, B Badak 🦏, C Cicak 🦎, D Dinosaurus 🦕, E Elang 🦅, F Flamingo 🦩, G Gajah 🐘, H Harimau 🐅, I Ikan 🐟, J Jerapah 🦒, K Kupu-kupu 🦋, L **Lio** (pakai gambar Lio), M Monyet 🐒, N Nuri 🦜, O Orangutan 🦧, P Penyu 🐢, Q **Quokka** (gambar sendiri), R Rusa 🦌, S Semut 🐜, T Tupai 🐿️, U Ular 🐍, V Vikuna 🦙, W Walabi 🦘, X **Xerus** (gambar sendiri), Y **Yak** (gambar sendiri), Z Zebra 🦓.
- **Gambar hewan**: emoji **Google Noto Emoji dibundel sebagai file gambar** (lisensi bebas komersial; tampilan sama di semua HP). Quokka/Xerus/Yak sudah dibuat pemilik di ChatGPT dengan gaya Noto (datar, menghadap kiri), sudah dibersihkan: `assets/animals/{quokka,xerus,yak}.webp` (±20–28 KB). Referensi gaya: `assets/refs/referensi-gaya-noto.png`. Kupu-kupu/Lio/hewan non-jalan: animasi melayang/goyang, bukan jalan.

## 1. Konteks project

- **Produk**: web interaktif berisi buku aktivitas untuk **anak usia 5 tahun** (TK B), dengan sudut jual **"Siap Masuk SD"**.
- **Maskot**: **Lio si Singa** (menggantikan Oki si Orangutan; lihat bagian "Maskot" di bawah). Karakter buatan sendiri; jangan mirip karakter berhak cipta (misalnya Simba).
- **Tema visual**: hutan.
- **Struktur konten MVP**: **1 level = 1 huruf, berisi 3 mini-game** (lihat bagian "Aktivitas" di bawah). Inti tetap menebalkan huruf A–Z dengan jari, dengan suara instruksi, animasi, dan warna cerah.
- **Model bisnis**: produk sekali bayar seharga **Rp20.000**, dijual lewat **Lynk.id** (pemilik sudah punya akun Lynk.id).
  - **Trial gratis**: huruf **A, B, C** (3 level), bisa dimainkan tanpa login.
  - Setelah membayar, pembeli (orang tua) login dan semua level terbuka.
- **Pemilik**: berbasis di Indonesia, minat di bidang bisnis dan pendidikan. Laptop MacBook 2019 yang agak lemot, jadi build dan tooling sebaiknya ringan.
- **Tenggat**: akses Claude Fable 5.2 (promo Claude Pro) **sampai 16 November 2026**. Kerjakan bagian sulit sebelum tanggal itu.

### Ide yang ditunda (bukan untuk MVP)
- Versi PDF printable (32 halaman: menulis, membaca awal/suku kata, berhitung 1–20, logika, kreatif, sertifikat). Diganti ke web interaktif.
- Aktivitas lain: berhitung (ketuk/drag), mencocokkan, pola, labirin, mewarnai, huruf dan bunyi.
- Hadiah: peta petualangan, stiker koleksi, sertifikat yang bisa diunduh.
- Dashboard orang tua: progres per huruf, pengaturan suara, batas waktu main (misalnya 15 menit).
- Tema konten lain: "Aku Belajar Jualan" (mengenal uang), hewan Nusantara.

## 2. Keputusan yang sudah diambil

### Aktivitas (diputuskan 10 Nov 2026)
Dibangun di atas **2 mesin** supaya satu engine dipakai ulang untuk banyak aktivitas:
- **Mesin A: Telusuri garis** (engine tracing yang sudah ada): pemanasan goresan (lurus, zigzag, lengkung, spiral), menebalkan huruf A–Z, menebalkan angka 1–10, labirin, hubungkan titik 1→10.
- **Mesin B: Ketuk jawaban benar** (engine kuis generik; soal, gambar, dan suara bisa diganti): cari huruf ("Mana huruf B?"), huruf awal dari gambar, hitung benda (1–10), lebih banyak/sedikit, mana yang beda, cocokkan bayangan, lanjutkan pola.
- **Struktur level**: 1 level = 1 huruf = 3 mini-game. Contoh Level A: (1) tebalkan huruf A, (2) cari semua huruf A, (3) hitung ayam 🐔.
- **Ditunda**: Mesin C (seret dan lepas: sortir warna, susun suku kata, urutkan kegiatan), mewarnai, emosi, Aku Belajar Jualan, hewan Nusantara.

### Maskot: Lio si Singa (diputuskan 10 Nov 2026)
- Anak singa **cowok**, **berdiri dengan 2 kaki**, gaya **animasi 3D ala film layar lebar** (kepala besar, bentuk bulat, ekspresif).
- **Kacamata bulat berframe hitam tebal** (BUKAN kacamata hitam); mata besar cokelat hangat tetap terlihat, alis jelas.
- Surai pendek oranye keemasan, jambul keluar dari bawah topi.
- Pakaian: **rompi penjelajah khaki banyak kantong** di atas kaos hijau daun, **topi safari** cokelat muda dengan pita cokelat tua, celana pendek khaki, sepatu bot cokelat kecil, teropong kecil di leher.
- **Pembuatan gambar: hanya tool gratis** (ChatGPT / Gemini / Bing). Jangan pakai Creative Claw (tidak top up kredit) dan jangan pakai Kling.
- **Opsi B (dipilih)**: gambar 3D yang sama dipakai untuk promosi DAN di dalam game. Pose dari character sheet dipotong jadi **WebP transparan** (~30–60 KB/pose, target ~6 pose: melambai, menunjuk, tepuk tangan, jempol, sedih/"Ups", senang/menang). Gerakan di game pakai CSS (mantul, membesar, goyang). Cek konsistensi detail antar pose (kantong rompi, topi, kacamata).

### Database: Neon (serverless Postgres), region AWS Asia Pacific 1 (Singapore)
Alasan memilih Neon:
- Paket gratis (per Oktober 2026): 100 project, **1 GB storage per project**, 100 CU-hours per project, 10 branch per project.
- Di paket gratis, Neon **tidur setelah 5 menit idle** (tidak bisa dimatikan), tapi **bangun otomatis** saat ada query. Jedanya beberapa ratus milidetik sampai beberapa detik pada request pertama.
- Dibandingkan Supabase gratis: Supabase **di-pause setelah 7 hari aktivitas rendah** dan harus di-**restore manual** dari dashboard, sehingga aplikasi mati sampai di-restore. Neon lebih aman untuk aplikasi yang jarang dibuka.
- Alternatif yang dipertimbangkan: Turso (SQLite edge, tanpa cold start), MongoDB Atlas M0. PlanetScale tidak punya paket gratis lagi.

Alasan memilih region Singapore:
- Paling dekat dengan pengguna di Indonesia.
- **Server Next.js harus satu region dengan database.** Di Vercel, set **Project Settings → Functions → Function Region = Singapore (`sin1`)**. Default Vercel ada di AS, yang membuat setiap query lintas benua.
- Region project Neon **tidak bisa diganti** setelah dibuat.

### Stack
- **Next.js** (App Router) + **TypeScript**
- **Drizzle ORM** (sudah disetujui; lebih ringan dari Prisma, cocok dengan Neon). Driver: `@neondatabase/serverless`.
- **Auth.js** (credentials: email + password)
- **Deploy**: Vercel, function region `sin1`
- **PWA** supaya bisa dipasang di layar utama tablet atau HP
- **Tracing**: `<canvas>` + Pointer Events (jari dan stylus)
- **Animasi**: CSS / Framer Motion / Lottie (harus ringan untuk HP Android kelas bawah)

### Audio (diubah 10 Nov 2026): TANPA suara narasi, pakai musik latar
- **Keputusan pemilik**: suara narasi/instruksi (text-to-speech) **dihapus**. Instruksi hanya tampil sebagai teks di gelembung Lio. Efek bunyi pendek (tick, ding, oops, win) tetap ada.
- **Musik latar**: dibuat langsung dengan Web Audio (tanpa file, 0 KB): loop riang C mayor (C–Am–F–G), 104 BPM, marimba (triangle) + bass + ketukan akor + shaker. Mulai saat tombol "Mulai Main" diketuk (browser butuh sentuhan dulu). Tombol 🎵/🔇 (kanan atas di Start/Peta, dan di bar atas layar Main), pilihan disimpan di `localStorage` key `lio-music-on`. Musik berhenti saat tab disembunyikan.
- Nanti bisa diganti file musik bebas royalti (MP3/OGG kecil) kalau mau kualitas lebih bagus.
- **Risiko yang sudah disampaikan ke pemilik**: anak 5 tahun belum lancar membaca, jadi instruksi teks saja mungkin tidak dipahami tanpa didampingi orang tua. Opsi nanti: rekaman suara asli (MP3) untuk kalimat kunci saja.

### (Lama, tidak dipakai lagi) Suara: text-to-speech
- **Prototipe**: Web Speech API bawaan browser (`lang: id-ID`). Kekurangannya, kualitas beda-beda per perangkat, dan sebagian Android tidak punya suara bahasa Indonesia.
- **Sebelum jualan**: buat file **MP3 sekali di awal** dengan layanan TTS (rencana: **Google Cloud Text-to-Speech**, ada suara `id-ID` dan kuota gratis bulanan; cek kuota dan syarat terbarunya). Siapkan daftar kalimat dan skrip batch-generate, lalu pemilik menjalankannya dengan akun Google Cloud miliknya.

### Pembayaran dan akses: whitelist email
- Lynk.id mengirim **file atau link yang sama** ke email setiap pembeli secara otomatis. **Tidak ditemukan** fitur kode unik per pembeli maupun webhook. (Ide awal "upload CSV kode akses ke Lynk.id" dibatalkan.)
- **Alur yang dipilih**:
  1. Pembeli membayar di Lynk.id dan menerima link ke halaman daftar di web, dengan instruksi "daftar pakai email yang sama dengan email pembelian".
  2. Pemilik menyalin email pembeli dari dashboard Lynk.id, lalu **menempelkannya ke textarea di halaman admin** (satu email per baris), lalu klik Simpan. Email masuk ke tabel whitelist.
  3. Pembeli mendaftar dan membuat password sendiri. Kalau email ada di whitelist, semua level terbuka. Kalau belum, tampilkan "Pembayaranmu sedang diverifikasi".
  4. Opsional: admin bisa menerima upload CSV/Excel pesanan, kalau Lynk.id menyediakan ekspor.
- **Belum dicek**: tanyakan ke support Lynk.id apakah ada webhook atau API notifikasi penjualan. Kalau ada, aktivasi bisa otomatis.
- **Nanti**: payment gateway dengan webhook (Midtrans/Xendit) untuk aktivasi otomatis penuh.

### Aturan produk dan keamanan
- **Akun milik orang tua**, berisi 1–3 **profil anak** (nama panggilan saja; tanpa foto atau data lain).
- **Kunci konten dicek di server**, bukan hanya disembunyikan di UI. Huruf D–Z dan seterusnya hanya bisa diakses akun yang sudah dibayar.
- Batasi login bersamaan, misalnya **2 perangkat**, untuk mengurangi berbagi akun.
- ~~Parent gate~~ **dihapus** (keputusan pemilik, 10 Nov): huruf terkunci langsung membuka popup beli di Lynk.id. Risiko kecil karena pembelian tetap butuh bayar di Lynk.id di luar aplikasi.
- ~~Semua instruksi dibacakan~~: **dibatalkan** (10 Nov), lihat bagian Audio. Instruksi berupa teks + petunjuk visual (titik berkedip, panah, nomor).
- Tes di **HP Android murah**.

## 3. Yang sudah dibuat

### Prototipe: `index.html` (satu file, tanpa build)
- Live: https://claude.ai/artifact/JAg61UWr7kGKhEnowDSNwF
- Sudah dites dengan headless Chrome: menelusuri huruf A sampai selesai memunculkan layar "A untuk Ayam!", tanpa error JS.

Isi prototipe:
- **Layar**: Start, lalu Peta huruf (grid A–Z), lalu Main (papan tracing), lalu overlay Menang, plus overlay Paywall.
- **Data huruf**: koordinat 0–100. Tiap huruf = array **stroke**, tiap stroke = polyline titik kontrol (`arc()` untuk lengkungan), lalu `densify()` menjadi titik setiap `STEP = 1.5` unit.
  - A (🐔 Ayam, `#ff6b4a`): 3 stroke (dua diagonal dari puncak (50,12), lalu garis tengah y=62)
  - B (🦆 Bebek, `#3d8bff`): garis tegak, lengkung atas `arc(54,31,19,-90,90)`, lengkung bawah `arc(57,69,19,-90,90)`
  - C (🦎 Cicak, `#22b573`): `arc(52,50,36,-40,-320)`
- **Logika tracing**: progres `prog` = indeks titik di stroke aktif.
  - `pointerdown` hanya dimulai kalau jari ≤ `TOL_START = 15` unit dari titik `prog` (titik berkedip).
  - `pointermove`: cari indeks terjauh dalam jendela `LOOK = 12` titik ke depan yang jaraknya ≤ `TOL = 11`, lalu majukan `prog`. Kalau titik terdekat > `OFF = 19`, artinya keluar jalur: papan bergoyang, bunyi "oops", suara "Ups! Ikuti garisnya ya" (throttle 3 detik).
  - Angkat jari boleh; lanjut dari titik terakhir.
  - Stroke selesai saat `prog >= len - 2`. Semua stroke selesai berarti huruf selesai.
  - Memakai `getCoalescedEvents()` untuk gerakan cepat.
- **Gambar**: huruf pemandu abu-abu tebal (13% ukuran), garis putus-putus tengah untuk stroke tersisa, garis berwarna (9,5%) untuk progres, titik target berdenyut bernomor, panah arah, partikel kilau, konfeti saat menang.
- **Suara**: `say()` sekarang hanya menulis teks di gelembung Lio (TTS dihapus). Efek bunyi Web Audio (tick, ding, oops, win) + musik latar (lihat bagian Audio).
- **Progres**: `localStorage` key `oki-huruf-proto-v1` → `{ unlocked, done }`; level berikutnya terbuka berurutan; tombol "Reset progres" untuk tes.
- **Paywall mock** (desain 10 Nov): huruf terkunci langsung membuka kartu dengan ikon **gembok** 🔒, judul "Huruf D–Z masih terkunci", 3 poin manfaat (✓ semua huruf A–Z, ✓ 3 mini-game per huruf, ✓ sekali bayar akses selamanya), **tombol gaya Google Play** (hijau `#01875f`, pill, datar, font Roboto/system) bertuliskan **"Beli Rp 20.000"**, teks kecil "Pembayaran lewat Lynk.id", dan link "Nanti saja". Tanpa soal untuk orang tua; belum ada link sungguhan. Setelah level C selesai: kartu "Hore, 3 huruf selesai!" dengan harga yang sama.

## 4. Langkah berikutnya (MVP sebelum 16 November)

1. **Tes prototipe di HP atau tablet**, idealnya dengan anak 5 tahun. Sesuaikan `TOL`/`OFF`/ukuran garis kalau terlalu sulit atau terlalu mudah.
2. **Data stroke huruf D–Z** (kapital) dengan urutan goresan yang benar, ditambah kata dan emoji per huruf (pakai kata Indonesia yang dikenal anak).
3. **Setup project**: `create-next-app` (TypeScript, App Router), lalu Neon (Singapore), Drizzle + drizzle-kit migrations, lalu deploy Vercel dengan region `sin1`.
4. **Skema database** (usulan):
   - `users` (orang tua): id, email (unik), password_hash, is_paid, is_admin, created_at
   - `whitelist_emails`: email (unik), added_at, note
   - `children`: id, user_id, nickname
   - `progress`: child_id, activity (misalnya `trace`), item (misalnya `A`), stars, completed_at
   - `sessions` / `devices`: untuk batas 2 perangkat
5. **Auth**: daftar dan login (Auth.js credentials). Saat daftar atau login, cek `whitelist_emails` lalu set `is_paid`.
6. **Port komponen tracing ke React** (client component), data huruf di file terpisah. Trial A–C bisa tanpa login (progres di localStorage), dan **dipindah ke akun** setelah login.
7. **Gating di server**: API/route yang menyajikan data huruf D–Z hanya untuk `is_paid`.
8. **Halaman admin**: textarea tempel email (satu per baris), daftar pengguna, cari email, reset password, nonaktifkan akun.
9. **Audio**: ~~TTS MP3~~ dibatalkan. Opsional: ganti musik generatif dengan file musik bebas royalti.
10. **Produk di Lynk.id**: deskripsi, gambar preview, dan "file" berupa link ke halaman daftar beserta instruksinya.
11. **PWA** (manifest + ikon) dan tes di Android murah.

### Catatan
- **Redesign v2 tema hutan (11 Nov)**, mengikuti mockup pemilik: daun tropis SVG di 4 sudut semua layar (juga di overlay menang & beli), cover dengan bukit/pohon SVG, urutan cover = judul → pita kuning "Petualangan Huruf" → Lio → tombol Mulai Main. Warna judul hijau tua (`--ink:#1d4a2b`), "Lio" gradasi oranye + kilauan (`.sparkle`). Tombol huruf 3D (A oranye, B toska, C hijau; terkunci abu terang). Gelembung cari-huruf mengkilap. Layar menang = latar sinar matahari terang (bukan gelap). Layar beli = latar terang + kartu putih. Semua dekorasi berupa SVG inline (tanpa file).
- **Cover v3 (11 Nov)**, mengikuti mockup kedua pemilik: latar pemandangan hutan SVG (langit + cahaya matahari di belakang judul, awan, gunung samar, bukit, pohon jauh) di `.scene`; Lio berdiri di "panggung" `.cover-stage` dengan tanah berumput, semak daun kiri-kanan, dan batu (menempel ke Lio supaya kaki selalu di tanah). Judul lebih besar ("Lio" gradasi oranye bergaris tepi putih + kilauan), pita kuning lebar, tombol "Mulai Main" hijau tua lebar. Ada penyesuaian untuk HP layar pendek (`max-height:720px`, catatan prototipe disembunyikan) dan tablet (`min-width:600px` + `min-height:800px`). Dites di 390×844, 360×640, 768×1024.
- **Animasi cover (11 Nov, revisi)**: awan SVG bergerak melintas langit (`.sky-cloud`), daun sudut melambai (`leafSway`, semua layar), **daun rimbun ekstra** di kanan atas, kanan bawah, kiri bawah cover (`.cover-leaf`, ikut melambai), semak di samping Lio bergoyang, Lio "bernapas" pelan, kupu-kupu 🦋 terbang, tombol **Mulai Main berdenyut** (`btnPulse`). **Tangan Lio TIDAK melambai** (dicoba lalu dibatalkan pemilik: jelek); cover memakai pose melambai utuh. File `lio/lio-wave-*.webp` tidak dipakai lagi. Semua dimatikan kalau perangkat minta `prefers-reduced-motion`.
- **Cover v4 (11 Nov)**: judul dan Lio diperbesar; catatan "Prototipe…" disembunyikan di cover; judul mulai di bawah tombol musik (`padding-top:70px`).
- **Perbaikan bug daun sudut**: versi cermin (kanan atas, kiri bawah, kanan bawah) kini dibuat di dalam SVG (`LEAF_SRCS`), bukan CSS `transform`, karena `transform-origin` di sudut membuat daun terlempar ke luar layar.
- **Aturan gambar hewan (11 Nov)**: hewan setiap huruf harus **utuh (kepala, badan, kaki)**, bukan kepala saja. A = 🐓 (ayam utuh; 🐔 di Android hanya kepala). Hindari emoji wajah seperti 🐶🐱🐭🐰🐻🐼🐯🦁🐮🐷🐵; pakai versi badan utuh (🐕🐈🐁🐇🐅🐄🐖🐒, dst.). Catatan: emoji tampil beda per merek HP; untuk konsistensi penuh nanti bisa diganti gambar sendiri.
- **Navigasi**: layar Pilih Huruf punya tombol 🏠 (kiri atas, `#btnHome`) untuk kembali ke cover; layar Main punya tombol 🗺️ untuk kembali ke Pilih Huruf. Tombol 🏠 hanya tampil di layar Pilih Huruf.
- **Tombol beli** sekarang memakai font Baloo 2 + gaya 3D yang sama dengan tombol lain (hijau tua), teks "Beli Rp 20.000".
- **Hewan level jalan-jalan** (`#critter`): emoji hewan level (🐔/🦆/🦎) berjalan bolak-balik di atas tepi papan pada mini-game 1 (tebalkan) dan 2 (cari), menghadap arah jalan, sambil goyang. Ikut bereaksi: lompat saat Lio jempol/tepuk tangan, goyang saat Lio sedih. Disembunyikan di mini-game 3 (hitung) supaya tidak ikut terhitung. Kode: `setCritter(g)`, `critterReact(name)` (dipanggil dari `pose()`).
- **Mesin B sudah ada di prototipe** (10 Nov). Tiap level (A, B, C) = 3 mini-game berurutan dengan indikator langkah ✏️ 🔍 🔢 di atas papan:
  1. Tebalkan huruf (Mesin A).
  2. **Cari huruf**: 9 gelembung (3–4 target + pengecoh dari `LEVELS[ch].distract`), ketuk semua target. Salah: goyang + "Itu huruf X. Cari huruf A ya!". Benar: cincin kuning + bintang.
  3. **Hitung benda**: 3–6 emoji (`LEVELS[ch].count`), ketuk satu-satu untuk menghitung (badge angka + suara "Satu!", "Dua!"), lalu pilih dari 3 angka. Salah: hitungan direset + "Ayo hitung ...nya satu-satu!".
  - **Kartu pembuka level** (sebelum tracing): huruf besar berwarna + emoji + "A untuk Ayam", dibacakan "Ini huruf A. A, untuk Ayam!", tombol 🔊 dan Mulai ▶. Tujuannya mengenalkan kata/benda sebelum mini-game hitung.
  - **Popup menang**: hanya Lio (pose lompat) + "Huruf A selesai!" + 3 bintang; suara "Hebat! Kamu sudah belajar huruf A!". Tombol Lagi mengulang level tanpa kartu pembuka.
  - Selesai 1 mini-game: Lio tepuk tangan + "Ayo lanjut!", otomatis pindah setelah 1,6 detik. Selesai mini-game 3: layar menang (Lio lompat).
  - Kode: `LEVELS`, `GAMES`, `startGame(g)`, `gameDone()`, `levelDone()`, `startFind()`, `startCount()`. Tombol 🔊 mengulang instruksi (`qInstr`), tombol Ulangi mengulang mini-game yang sedang aktif.
  - Sudah dites headless (390×844): alur A lengkap (tracing → cari → hitung → menang → lanjut ke B), tanpa error JS.
  - Untuk huruf D–Z nanti: tiap huruf butuh entri `LEVELS` (pengecoh + emoji/kata untuk dihitung).
- Prototipe `index.html` sudah memakai Lio (5 pose WebP di-embed base64). Pose: melambai (Start), menunjuk (instruksi), jempol/tepuk tangan (stroke selesai), sedih ("Ups"), lompat senang (layar menang). File pose ada di folder `lio/` (8 pose, termasuk samping dan belakang).

### Pertanyaan terbuka
- Apakah Lynk.id punya webhook atau API notifikasi penjualan?
- Huruf kecil (a–z) ikut di MVP atau ditambahkan nanti?
- Domain (nama produk sudah diputuskan: **"Belajar Bareng Lio: Petualangan Huruf"**).

## 5. Isi repo saat ini (handoff, 11 Nov 2026)
- `CLAUDE.md`: file ini (semua keputusan). Baca bagian 0 dulu.
- `prototype/index.html`: prototipe HTML terakhir (sama dengan artifact v14: https://claude.ai/artifact/JAg61UWr7kGKhEnowDSNwF). Berisi logika tracing, Mesin B, cover, animasi; dipakai sebagai acuan saat memindahkan ke Next.js. Masih memakai emoji bawaan dan bentuk huruf kapital saja.
- `assets/lio/`: 8 pose Lio (WebP transparan). `assets/animals/`: quokka, xerus, yak (gaya Noto). `assets/refs/`: referensi gaya.
- Kode Next.js sudah ada di akar repo (lihat "Status versi Next.js" di bagian 6). Aset pindah: `public/lio/`, `public/animals/`, `docs/refs/`. Model boleh berganti (Fable/Opus/Sonnet) di tengah jalan: commit & push sering.

## 6. URUTAN KERJA & PEMBAGIAN MODEL (diputuskan 11 Nov 2026)
**Aturan**: kerjakan dari atas ke bawah. Tiap butir selesai: tes, **commit + push**, lalu centang `[x]` di sini (ini penanda posisi kalau model berganti di tengah jalan). Fable lebih dulu mengerjakan bagian SULIT (kuota Fable terbatas); sisanya boleh dilanjutkan Opus. Jangan mulai dev sebelum pemilik bilang "mulai dev".

### Tahap 1: bagian sulit (Fable)
- [x] 1. Kerangka Next.js (App Router, TS) + Tailwind + Motion, struktur **berbasis data** (satu file konfigurasi 26 huruf: bentuk huruf, hewan, pengecoh). Pindahkan aset dari `assets/` ke `public/`. Deploy statis (jangan urus Vercel).
- [x] 2. **Engine tracing React** (client component, canvas): papan bergaris buku tulis SD; alur kapital → mengecil ke kiri → huruf kecil; logika `prog/TOL/OFF/LOOK` dari `prototype/index.html`; keluar garis = papan goyang + Lio sedih (tetap).
- [x] 3. **Data goresan 49 bentuk baru**: kapital D–Z (23) + kecil a–z (26, bentuk tulisan tangan: a satu tangkai, g ekor kait). Urutan goresan benar dan arah benar. **Wajib diverifikasi otomatis**: tes yang menelusuri tiap polyline dan memastikan huruf selesai, plus screenshot kontak-sheet semua huruf untuk dicek mata.
- [x] 4. **Mini-game 2** (cari kapital + kecil, pasangan berwarna sama) dan **mini-game 3 random** (hitung benda / cocokkan bayangan: siluet dari gambar hewan, pilih 1 dari 3; tidak sama dengan main terakhir).
- [x] 5. **Progres localStorage** + semua A–Z terbuka + bintang saat 3 mini-game selesai + main ulang dari awal tetap bisa.

### Tahap 2: lebih mekanis (Opus boleh)
- [x] 6. Bundel **Noto Emoji** sebagai gambar (cek lisensi, unduh hanya 23 hewan yang dipakai, WebP kecil); pasang quokka/xerus/yak/Lio dari `assets/`.
- [ ] 7. **Album stiker** (tombol 📒, 26 kotak, bayangan abu-abu → berwarna, hewan terbang ke album saat menang).
- [ ] 8. **Tangan penunjuk** (contoh gerakan tiap awal mini-game; muncul lagi saat diam 5 detik).
- [ ] 9. **Semua bisa diketuk** (Lio, hewan, awan, daun bereaksi) + animasi Motion untuk transisi layar, popup, tombol.
- [ ] 10. **Anti kepencet**: kunci zoom/tarik-refresh, tombol back HP, reset progres lewat tekan-lama logo (3 detik + konfirmasi), sembunyikan tag PROTOTIPE.
- [x] 11. Pindahkan cover, peta huruf, kartu pembuka, layar menang dari prototipe (tema hutan, animasi cover); paywall disembunyikan lewat satu flag.
- [ ] 12. Polesan UI/UX, komponen 21st.dev seperlunya, tes di layar 360×640 / 390×844 / tablet, tanpa error JS.

### Status versi Next.js (11 Nov 2026, sesi "mulai dev")
Butir 1–6 dan 11 selesai, dites, dan di-push ke branch `claude/adoring-thompson-1l418n`. Sisa: 7, 8, 9, 10, 12.
- **Letak kode**: aplikasi Next.js ada di **akar repo** (bukan `/home/user/lio-app`). `app/` (layout, CSS), `components/` (layar + mini-game), `data/letters.ts` (26 huruf: hewan, warna, pengecoh), `data/glyphs.ts` (goresan kapital + kecil), `lib/` (engine tracing murni, audio, progres, flag).
- **Perintah**: `npm run dev`, `npm run build` (hasil statis di `out/`), `npm test` (tes goresan), `npm run sheet` (lembar kontak `docs/lembar-huruf.png`), `npm run e2e -- A G` (main penuh di browser; butuh `out/` disajikan di port 4173), `npm run animals` (buat ulang WebP hewan).
- **Font**: Grandstander (UI) + Andika (huruf belajar); keduanya a satu tangkai dan g ekor kait, dibundel lewat fontsource (tanpa Google Fonts saat runtime). Baloo 2 tidak dipakai lagi karena a-nya dua tingkat.
- **Garis buku tulis** (unit 0–100): atas 8, tengah 44, dasar 80, ekor sampai 98. Kapital I digambar dengan garis atas-bawah supaya beda dari l kecil (l dan t kecil berekor).
- **Perubahan engine dari prototipe**: sudut tajam dan titik putar balik (dasar tangkai n, ujung tangkai a, puncak V) harus benar-benar dicapai jari. Tanpa ini goresan naik-turun selesai sendiri dan anak yang menelusuri dengan benar malah dianggap keluar garis. Lihat `corners()` di `lib/trace.ts`.
- **Gambar hewan**: Noto Emoji (Apache 2.0) dari paket `@iconify-json/noto`, 256px WebP, total ±250 KB. Zebra versi baru sudah badan utuh.
- **Paywall**: `PAYWALL_ENABLED` di `lib/config.ts` (sekarang `false`).
- **Butir 10 baru sebagian**: tekan lama logo "Lio" 3 detik sudah mereset progres, tetapi konfirmasinya masih `window.confirm`; tag PROTOTIPE sudah tidak ada. Belum: kunci tarik-refresh, tombol back HP.
- **Perbaikan UX (11 Nov, setelah review)**: (a) HP miring menampilkan layar "Putar HP-nya dulu ya!" (CSS `.rotate-hint`, hanya saat tinggi layar < 520px); (b) saat menebalkan huruf kecil, huruf dan garis buku diperbesar sampai ±1,6× sesuai lebar huruf (`layout()` di `lib/traceLayout.ts`), papan sedikit lebih lebar; (c) tombol 🗺️ saat main bertanya dulu ("Berhenti main?"), Ulangi jadi ikon kecil ↺ di kanan gelembung Lio; (d) cocokkan bayangan jadi 3 ronde (2 hewan lain, terakhir hewan huruf itu) dan pilihan hitung tidak lagi selalu n−1/n/n+1; (e) keluar garis tidak mengulang dari kapital, Ulangi hanya mengulang bentuk yang sedang ditebalkan, ikon langkah ✅ bisa diketuk untuk main lagi.
- **Temuan review yang BELUM dikerjakan**: petunjuk masih teks saja (tangan penunjuk = butir 8; suara rekaman menunggu keputusan pemilik), goresan naik-turun membingungkan tanpa contoh, peta huruf datar, ikon UI masih emoji bawaan, musik berulang tiap ±9 detik.
- **Belum dites di HP asli.** Semua tes memakai Chromium headless (360×640, 390×844, 768×1024).

### Catatan untuk model berikutnya
- Bentuk huruf kecil a dan g harus **tulisan tangan**; font di game-nya juga.
- Untuk setiap huruf yang ditambah, cek hewannya **badan utuh** (bukan wajah saja).
- Jika kuota habis atau model berganti: baca daftar centang di atas, lanjutkan butir `[ ]` pertama.
