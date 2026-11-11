// Daun tropis sudut layar (SVG inline dari prototipe). Versi cermin dibuat di dalam SVG, bukan CSS transform.
const LEAF_SRC = "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%20200%20200%27%3E%3Cg%20transform%3D%27translate%28-12%20-12%29%27%3E%3Cg%20transform%3D%27rotate%2862%29%27%3E%3Cpath%20d%3D%27M0%200%20C33%20-30%20108%20-30%20150%200%20C108%2030%2033%2030%200%200Z%27%20fill%3D%27%232f8f3e%27/%3E%3Cpath%20d%3D%27M4%200%20L142%200%27%20stroke%3D%27%238fd47f%27%20stroke-width%3D%273%27%20stroke-linecap%3D%27round%27%20opacity%3D%27.55%27/%3E%3C/g%3E%3Cg%20transform%3D%27rotate%288%29%27%3E%3Cpath%20d%3D%27M0%200%20C36%20-32%20119%20-32%20165%200%20C119%2032%2036%2032%200%200Z%27%20fill%3D%27%233fa34d%27/%3E%3Cpath%20d%3D%27M4%200%20L157%200%27%20stroke%3D%27%239fe08d%27%20stroke-width%3D%273%27%20stroke-linecap%3D%27round%27%20opacity%3D%27.55%27/%3E%3C/g%3E%3Cg%20transform%3D%27rotate%2835%29%27%3E%3Cpath%20d%3D%27M0%200%20C41%20-38%20133%20-38%20185%200%20C133%2038%2041%2038%200%200Z%27%20fill%3D%27%2357bd52%27/%3E%3Cpath%20d%3D%27M4%200%20L177%200%27%20stroke%3D%27%23b8ef9f%27%20stroke-width%3D%273%27%20stroke-linecap%3D%27round%27%20opacity%3D%27.55%27/%3E%3C/g%3E%3Cg%20transform%3D%27rotate%2884%29%27%3E%3Cpath%20d%3D%27M0%200%20C26%20-24%2086%20-24%20120%200%20C86%2024%2026%2024%200%200Z%27%20fill%3D%27%236fcf5c%27/%3E%3Cpath%20d%3D%27M4%200%20L112%200%27%20stroke%3D%27%23c9f5b2%27%20stroke-width%3D%273%27%20stroke-linecap%3D%27round%27%20opacity%3D%27.55%27/%3E%3C/g%3E%3Cg%20transform%3D%27rotate%2820%29%27%3E%3Cpath%20d%3D%27M0%200%20C21%20-20%2068%20-20%2095%200%20C68%2020%2021%2020%200%200Z%27%20fill%3D%27%2386dc6b%27/%3E%3Cpath%20d%3D%27M4%200%20L87%200%27%20stroke%3D%27%23d8fbc4%27%20stroke-width%3D%273%27%20stroke-linecap%3D%27round%27%20opacity%3D%27.55%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

const raw = decodeURIComponent(LEAF_SRC.slice(LEAF_SRC.indexOf(",") + 1));
const inner = raw.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
const mk = (t: string) =>
  "data:image/svg+xml," +
  encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><g transform='${t}'>${inner}</g></svg>`);

export const LEAF_SRCS = {
  tl: LEAF_SRC,
  tr: mk("translate(200 0) scale(-1 1)"),
  bl: mk("translate(0 200) scale(1 -1)"),
  br: mk("translate(200 200) scale(-1 -1)"),
} as const;
