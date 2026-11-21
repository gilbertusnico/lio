/**
 * Konfigurasi angka 1–10 (Petualangan Angka): kata, buah (benda yang dihitung dan stiker), dan warna.
 * Bentuk goresan angka ada di data/numberGlyphs.ts. Angka 10 ditulis sebagai "1" lalu "0".
 */
export type NumberLevel = {
  n: number;
  /** Kata angka, mis. "Lima". */
  word: string;
  /** Nama buah yang dihitung di level ini (juga stikernya). */
  fruit: string;
  /** Gambar buah (Noto Emoji yang dibundel, `npm run fruits`). */
  img: string;
  color: string;
  /** Angka mirip untuk pengecoh mini-game "cari angka" (tidak boleh memuat angka itu sendiri). */
  similar: number[];
};

const F = (name: string) => `/fruits/${name}.webp`;

export const NUMBERS: NumberLevel[] = [
  { n: 1, word: "Satu", fruit: "Apel", img: F("apel"), color: "#ff5a4a", similar: [7, 4, 10] },
  { n: 2, word: "Dua", fruit: "Jeruk", img: F("jeruk"), color: "#ff9a1f", similar: [5, 7, 3] },
  { n: 3, word: "Tiga", fruit: "Pisang", img: F("pisang"), color: "#f2a900", similar: [8, 5, 2] },
  { n: 4, word: "Empat", fruit: "Mangga", img: F("mangga"), color: "#22b573", similar: [1, 9, 7] },
  { n: 5, word: "Lima", fruit: "Anggur", img: F("anggur"), color: "#8a6bf0", similar: [2, 6, 3] },
  { n: 6, word: "Enam", fruit: "Semangka", img: F("semangka"), color: "#14a6cc", similar: [9, 8, 5, 0] },
  { n: 7, word: "Tujuh", fruit: "Nanas", img: F("nanas"), color: "#ff7417", similar: [1, 2, 4] },
  { n: 8, word: "Delapan", fruit: "Stroberi", img: F("stroberi"), color: "#f25c9c", similar: [3, 0, 6, 9] },
  { n: 9, word: "Sembilan", fruit: "Pir", img: F("pir"), color: "#43b83a", similar: [6, 8, 4] },
  { n: 10, word: "Sepuluh", fruit: "Kelapa", img: F("kelapa"), color: "#3d8bff", similar: [1, 0, 6, 9] },
];
