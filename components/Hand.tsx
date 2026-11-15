"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { sfx } from "@/lib/audio";

export type HandPoint = { x: number; y: number };
/**
 * Contoh gerakan: `glide` = jari menempel dan meluncur mengikuti semua titik (menebalkan garis);
 * tanpa `glide` = jari melompat dari titik ke titik dan mengetuk tiap titik.
 */
export type HandDemo = { pts: HandPoint[]; glide?: boolean };

/** Titik tengah sebuah elemen dalam koordinat layar. */
export function centerOf(el: Element | null | undefined): HandPoint | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

type Key = { t: number; x: number; y: number };
type Plan = { keys: Key[]; taps: Key[]; dur: number; glide: boolean };
type Props = {
  /** Titik yang dicontohkan (koordinat layar), dihitung saat contoh dimulai. */
  demo: () => HandDemo;
  /** Naikkan nilainya untuk memulai contoh lagi (mis. masuk huruf kecil). */
  restart?: number;
  /** Jeda sebelum contoh pertama (ms). */
  delay?: number;
  /** Naikkan nilainya untuk minta contoh SEGERA (begitu jari diangkat), tanpa menunggu 5 detik. */
  now?: number;
};

const IDLE_MS = 5000;
const GLIDE_SPEED = 190; // px per detik: cukup pelan untuk diikuti mata anak
const HOP_SPEED = 420;
const DWELL = 0.55; // detik berhenti di tiap titik ketuk
const smooth = (s: number) => (s < 0.5 ? 2 * s * s : 1 - Math.pow(-2 * s + 2, 2) / 2);

function plan({ pts: raw, glide = false }: HandDemo): Plan | null {
  const ok = raw.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  const pts = ok.filter((p, i) => i === 0 || Math.hypot(p.x - ok[i - 1].x, p.y - ok[i - 1].y) > (glide ? 1 : 6));
  if (!pts.length) return null;
  const keys: Key[] = [];
  const taps: Key[] = [];
  let t = 0.25; // tangan muncul dulu
  if (glide && pts.length > 1) {
    taps.push({ t, ...pts[0] });
    t += 0.4; // menempel di titik mulai
    keys.push({ t, ...pts[0] });
    for (let i = 1; i < pts.length; i++) {
      t += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y) / GLIDE_SPEED;
      keys.push({ t, ...pts[i] });
    }
    t += 0.45;
  } else {
    pts.forEach((p, i) => {
      if (i) t += Math.min(0.8, Math.max(0.3, Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) / HOP_SPEED));
      keys.push({ t, ...p });
      taps.push({ t: t + 0.08, ...p });
      t += DWELL;
      keys.push({ t, ...p });
    });
    t += 0.2;
  }
  return { keys, taps, dur: t, glide: glide && pts.length > 1 };
}

/**
 * Tangan penunjuk: mencontohkan gerakan di awal mini-game, lalu muncul lagi kalau anak diam 5 detik.
 * Hilang begitu layar disentuh, dan tidak muncul selama jari masih menempel.
 * Digambar di atas layar lewat portal (tidak ikut transform pembungkus animasi).
 */
export default function Hand({ demo, restart = 0, delay = 900, now = 0 }: Props) {
  const [run, setRun] = useState<Plan | null>(null);
  const node = useRef<HTMLDivElement>(null);
  const getDemo = useRef(demo);
  const busy = useRef(false);
  const down = useRef(false);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wanted = useRef(false);
  useEffect(() => { getDemo.current = demo; });

  const stop = useCallback(() => {
    busy.current = false;
    setRun(null);
  }, []);
  const start = useCallback(() => {
    if (busy.current || down.current || document.hidden) return;
    const p = plan(getDemo.current());
    if (!p) return;
    busy.current = true;
    sfx.hint();
    setRun(p);
  }, []);
  const arm = useCallback(() => {
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(start, IDLE_MS);
  }, [start]);

  // Contoh pertama (dan tiap `restart` berubah).
  useEffect(() => {
    const t = setTimeout(start, delay);
    return () => clearTimeout(t);
  }, [restart, delay, start]);

  // Diminta segera (anak salah berulang atau mengetuk tempat yang salah): tampil begitu jari diangkat.
  useEffect(() => {
    if (!now) return;
    if (down.current) { wanted.current = true; return; }
    const t = setTimeout(start, 350);
    return () => clearTimeout(t);
  }, [now, start]);

  // Sentuhan menghentikan contoh; diam 5 detik setelah jari diangkat → contoh lagi.
  useEffect(() => {
    const press = () => {
      down.current = true;
      if (idle.current) clearTimeout(idle.current);
      stop();
    };
    const release = () => {
      down.current = false;
      arm();
      if (wanted.current) {
        wanted.current = false;
        if (idle.current) clearTimeout(idle.current);
        idle.current = setTimeout(start, 350);
      }
    };
    arm();
    window.addEventListener("pointerdown", press, true);
    window.addEventListener("pointerup", release, true);
    window.addEventListener("pointercancel", release, true);
    return () => {
      window.removeEventListener("pointerdown", press, true);
      window.removeEventListener("pointerup", release, true);
      window.removeEventListener("pointercancel", release, true);
      if (idle.current) clearTimeout(idle.current);
    };
  }, [arm, stop, start]);

  // Gerakan digerakkan sendiri (rAF) supaya tetap jalan walau perangkat minta gerak dikurangi:
  // tangan ini petunjuk utama untuk anak yang belum bisa membaca.
  useEffect(() => {
    const el = node.current;
    if (!run || !el) return;
    const { keys, taps, dur, glide } = run;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      if (t >= dur) {
        stop();
        arm();
        return;
      }
      let i = 0;
      while (i < keys.length - 2 && t > keys[i + 1].t) i++;
      const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
      const s = Math.min(1, Math.max(0, (t - a.t) / Math.max(1e-6, b.t - a.t)));
      const e = glide ? s : smooth(s);
      const x = a.x + (b.x - a.x) * e, y = a.y + (b.y - a.y) * e;
      // Jari menekan: saat meluncur menempel terus, saat mengetuk menekan sebentar di tiap titik.
      let pressed = glide && t > taps[0].t && t < dur - 0.3 ? 1 : 0;
      if (!glide) for (const k of taps) pressed = Math.max(pressed, 1 - Math.min(1, Math.abs(t - k.t - 0.12) / 0.16));
      const fade = Math.min(1, t / 0.2, (dur - t) / 0.2);
      el.style.opacity = String(Math.max(0, fade));
      el.style.transform = `translate(${x}px, ${y}px) scale(${1 - 0.14 * pressed})`;
      raf = requestAnimationFrame(tick);
    };
    el.style.opacity = "0";
    el.style.transform = `translate(${keys[0].x}px, ${keys[0].y}px)`;
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, stop, arm]);

  if (!run) return null;
  return createPortal(
    <>
      {run.taps.map((p, i) => (
        <span key={i} className="hand-ring" style={{ left: p.x, top: p.y, animationDelay: `${p.t}s` }} />
      ))}
      <div ref={node} className="hand" aria-hidden>
        <img src="/ui/hand.webp" alt="" draggable={false} />
      </div>
    </>,
    document.body,
  );
}
