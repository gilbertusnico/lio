/**
 * Konfigurasi 26 huruf: kata/hewan, gambar, warna, dan pengecoh untuk mini-game "cari huruf".
 * Bentuk goresan ada di data/glyphs.ts. Semua mini-game membaca dari file ini.
 */
export type Letter = {
  ch: string;
  /** Nama hewan (diawali huruf ini). */
  word: string;
  /** Gambar hewan badan utuh (Noto Emoji yang dibundel, atau gambar sendiri). */
  img: string;
  color: string;
  /** Huruf mirip (campuran besar/kecil) untuk pengecoh. Tidak boleh memuat huruf itu sendiri. */
  similar: string;
  /** Cara hewan bergerak di atas papan: jalan, atau melayang/goyang (kupu-kupu, Lio, burung, ikan). */
  motion: "walk" | "float";
};

const A = (name: string) => `/animals/${name}.webp`;

export const LETTERS: Letter[] = [
  { ch: "A", word: "Ayam", img: A("ayam"), color: "#ff6b4a", similar: "VHNMKoedqgu", motion: "walk" },
  { ch: "B", word: "Badak", img: A("badak"), color: "#3d8bff", similar: "DPREHdpqhk", motion: "walk" },
  { ch: "C", word: "Cicak", img: A("cicak"), color: "#22b573", similar: "GOQUSoeaus", motion: "walk" },
  { ch: "D", word: "Dinosaurus", img: A("dinosaurus"), color: "#c86bff", similar: "BOPQUbpqag", motion: "walk" },
  { ch: "E", word: "Elang", img: A("elang"), color: "#ff9a1f", similar: "FBLHTcoasu", motion: "float" },
  { ch: "F", word: "Flamingo", img: A("flamingo"), color: "#ff5fa2", similar: "EPTLHtljrk", motion: "walk" },
  { ch: "G", word: "Gajah", img: A("gajah"), color: "#14a6cc", similar: "COQSUqypja", motion: "walk" },
  { ch: "H", word: "Harimau", img: A("harimau"), color: "#ff8a1f", similar: "NMKAEnbkur", motion: "walk" },
  { ch: "I", word: "Ikan", img: A("ikan"), color: "#3d8bff", similar: "TJFHEjtrfu", motion: "float" },
  { ch: "J", word: "Jerapah", img: A("jerapah"), color: "#f2a900", similar: "LUTISilygt", motion: "walk" },
  { ch: "K", word: "Kupu-kupu", img: A("kupu-kupu"), color: "#7a6bff", similar: "HXRYNhxbft", motion: "float" },
  { ch: "L", word: "Lio", img: "/lio/lio-depan-melambai.webp", color: "#ff8a1f", similar: "TEFJUtfjbh", motion: "float" },
  { ch: "M", word: "Monyet", img: A("monyet"), color: "#b9783f", similar: "NWHAVnwurh", motion: "walk" },
  { ch: "N", word: "Nuri", img: A("nuri"), color: "#22b573", similar: "MHZAKmhurv", motion: "float" },
  { ch: "O", word: "Orangutan", img: A("orangutan"), color: "#ff6b4a", similar: "CQGDUcaedu", motion: "walk" },
  { ch: "P", word: "Penyu", img: A("penyu"), color: "#5bb536", similar: "BRDFEbqdgy", motion: "walk" },
  { ch: "Q", word: "Quokka", img: A("quokka"), color: "#b9783f", similar: "OGCDUpgdby", motion: "walk" },
  { ch: "R", word: "Rusa", img: A("rusa"), color: "#e0703a", similar: "PBKHAntfvc", motion: "walk" },
  { ch: "S", word: "Semut", img: A("semut"), color: "#7a6bff", similar: "CGZBOzceax", motion: "walk" },
  { ch: "T", word: "Tupai", img: A("tupai"), color: "#c8683a", similar: "IFLEYfljri", motion: "walk" },
  { ch: "U", word: "Ular", img: A("ular"), color: "#5bb536", similar: "VJOCDnvwya", motion: "walk" },
  { ch: "V", word: "Vikuna", img: A("vikuna"), color: "#14a6cc", similar: "AWYUNwyuxn", motion: "walk" },
  { ch: "W", word: "Walabi", img: A("walabi"), color: "#e0703a", similar: "MVNUXmvuyn", motion: "walk" },
  { ch: "X", word: "Xerus", img: A("xerus"), color: "#ff5fa2", similar: "KYZVNkyzvt", motion: "walk" },
  { ch: "Y", word: "Yak", img: A("yak"), color: "#8a5a3c", similar: "VXTKUvgjxu", motion: "walk" },
  { ch: "Z", word: "Zebra", img: A("zebra"), color: "#3d4a66", similar: "NSXETsxvne", motion: "walk" },
];

/** Pasangan hewan yang bayangannya terlalu mirip; tidak dijadikan pilihan bersama di "cocokkan bayangan". */
export const SHADOW_CONFUSABLE: [string, string][] = [
  ["T", "X"], // tupai & xerus
  ["Q", "W"], // quokka & walabi
  ["R", "V"], // rusa & vikuna
  ["M", "O"], // monyet & orangutan
];

export const NUM = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh"];
