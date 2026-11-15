/**
 * Reaksi singkat saat sesuatu diketuk (butir 9: semua bisa diketuk).
 * Menambah kelas CSS sebentar; kelasnya hanya mengubah `scale`/`translate`/`rotate` (properti tersendiri),
 * jadi tidak mengganggu animasi `transform` yang sedang berjalan (awan melintas, daun melambai).
 */
export function poke(el: Element | null, cls = "poke", ms = 240) {
  if (!el) return;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
}
