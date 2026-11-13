"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type HandPoint = { x: number; y: number };

/** Titik tengah sebuah elemen dalam koordinat layar. */
export function centerOf(el: Element | null | undefined): HandPoint | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

type Demo = { pts: HandPoint[]; times: number[]; dur: number };
type Props = {
  /** Titik yang dicontohkan (koordinat layar), dihitung saat contoh dimulai. */
  points: () => HandPoint[];
  /** Naikkan nilainya untuk memulai contoh lagi (mis. masuk huruf kecil). */
  restart?: number;
  /** Jeda sebelum contoh pertama. */
  delay?: number;
};

const IDLE_MS = 5000;
const SPEED = 300; // px per detik

/**
 * Tangan penunjuk: mencontohkan gerakan di awal mini-game, lalu muncul lagi kalau anak diam 5 detik.
 * Digambar di atas semua layar lewat portal (tidak ikut transform pembungkus animasi).
 */
export default function Hand({ points, restart = 0, delay = 800 }: Props) {
  const [mounted, setMounted] = useState(false);
  const [demo, setDemo] = useState<Demo | null>(null);
  const el = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const getPoints = useRef(points);
  getPoints.current = points;
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const end = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = useRef<() => void>(() => {});

  useEffect(() => setMounted(true), []);

  const arm = useCallback(() => {
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => start.current(), IDLE_MS);
  }, []);

  start.current = () => {
    if (busy.current) return;
    const gov = getPoints.current().filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
    // Buang titik yang (hampir) sama berurutan supaya gerakan tidak tersendat.
    const pts = gov.filter((p, i) => i === 0 || Math.hypot(p.x - gov[i - 1].x, p.y - gov[i - 1].y) > 6);
    if (pts.length < 2) return;
    const segs = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
    const total = segs.reduce((a, b) => a + b, 0);
    if (total < 12) return;
    let acc = 0;
    const times = [0, ...segs.map((s) => (acc += s) / total)];
    const dur = Math.max(1.1, Math.min(3, total / SPEED));
    busy.current = true;
    setDemo({ pts, times, dur });
    if (end.current) clearTimeout(end.current);
    end.current = setTimeout(() => {
      busy.current = false;
      setDemo(null);
      arm();
    }, dur * 1000 + 300);
  };

  // Contoh pertama (dan tiap `restart` berubah).
  useEffect(() => {
    const t = setTimeout(() => start.current(), delay);
    return () => clearTimeout(t);
  }, [restart, delay]);

  // Diam 5 detik tanpa sentuhan → contoh lagi.
  useEffect(() => {
    const act = () => { if (!busy.current) arm(); };
    arm();
    window.addEventListener("pointerdown", act, true);
    window.addEventListener("pointermove", act, true);
    window.addEventListener("keydown", act, true);
    return () => {
      window.removeEventListener("pointerdown", act, true);
      window.removeEventListener("pointermove", act, true);
      window.removeEventListener("keydown", act, true);
      if (idle.current) clearTimeout(idle.current);
      if (end.current) clearTimeout(end.current);
    };
  }, [arm]);

  // Gerakan tangan digerakkan sendiri (rAF) supaya tetap jalan walau perangkat minta gerak dikurangi.
  useEffect(() => {
    const node = el.current;
    if (!demo || !node) return;
    const { pts, times, dur } = demo;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / (dur * 1000));
      let i = 0;
      while (i < times.length - 2 && k > times[i + 1]) i++;
      const span = Math.max(1e-6, times[i + 1] - times[i]);
      const s = Math.min(1, Math.max(0, (k - times[i]) / span));
      const e = s < 0.5 ? 2 * s * s : 1 - Math.pow(-2 * s + 2, 2) / 2;
      const x = pts[i].x + (pts[i + 1].x - pts[i].x) * e;
      const y = pts[i].y + (pts[i + 1].y - pts[i].y) * e;
      node.style.transform = `translate(${x}px, ${y}px)`;
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    node.style.transform = `translate(${pts[0].x}px, ${pts[0].y}px)`;
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [demo]);

  if (!mounted || !demo) return null;

  return createPortal(
    <>
      {demo.pts.map((p, i) => (
        <span key={`r${i}`} className="hand-ring" style={{ left: p.x, top: p.y, animationDelay: `${demo.times[i] * demo.dur}s` }} />
      ))}
      <div ref={el} className="hand" aria-hidden>
        <div className="hand-in" style={{ animationDuration: `${demo.dur}s` }}>
          <HandArt />
        </div>
      </div>
    </>,
    document.body
  );
}

/** Tangan putih bergaris tepi, telunjuk di kiri atas (ujung jari = titik sentuh). */
function HandArt() {
  return (
    <svg viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22 3 h10 a5 5 0 0 1 5 5 v20 h3 a6 6 0 0 1 6 6 v3 h2 a6 6 0 0 1 6 6 v2 a6 6 0 0 1 6 6 v6 a14 14 0 0 1 -14 14 h-9 a14 14 0 0 1 -11 -5 l-9 -12 a6 6 0 0 1 8 -8 l3 3 V8 a5 5 0 0 1 5 -5 z"
        fill="#ffffff"
        stroke="#2f4f3a"
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      <path d="M32 8 v18" stroke="#dfe6ee" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M45 28 v6" stroke="#dfe6ee" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M54 34 v6" stroke="#dfe6ee" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
