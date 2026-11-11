"use client";

import { useEffect, useMemo, useRef } from "react";
import { GLYPHS, LINE, type Glyph, type Pt } from "@/data/glyphs";
import type { Letter } from "@/data/letters";
import { advance, canStart, dist, isDot } from "@/lib/trace";
import { audio, sfx } from "@/lib/audio";
import { PADR, layout, type Pose } from "@/lib/traceLayout";
import type { PoseName } from "./Lio";

/**
 * Mini-game 1: papan bergaris buku tulis SD.
 * Alur: tebalkan huruf KAPITAL → kapital mengecil ke kiri, muncul huruf KECIL untuk ditebalkan
 * → keduanya berjajar "A a".
 */
type Props = {
  letter: Letter;
  /** Sisi papan dalam px. */
  size: number;
  onDone: () => void;
  onSay: (text: string) => void;
  onPose: (pose: PoseName) => void;
  /** Keluar garis: papan goyang + Lio sedih (diurus induk). */
  onOops: () => void;
  onStrokes: (info: { total: number; done: number }) => void;
  /** Mulai langsung dari huruf kecil (dipakai tombol Ulangi saat anak sudah sampai huruf kecil). */
  startLower?: boolean;
  /** Dipanggil saat anak mulai menebalkan huruf kecil. */
  onLower?: () => void;
};

type Phase = "upper" | "toLower" | "lower" | "toBoth" | "both";
type Spark = { x: number; y: number; vx: number; vy: number; life: number; r: number };

const ID: Pose = { s: 1, ox: 0, oy: 0 };
const PRAISE = ["Bagus!", "Pintar!", "Hebat, terus!", "Keren!"];
/** Tebal garis dalam unit papan: [pemandu abu-abu, tinta berwarna]. */
const WIDTH = { upper: [14, 10], lower: [12, 8.5] } as const;
const T_LOWER = 800, T_BOTH = 900, T_HOLD = 1500;

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const mix = (a: Pose, b: Pose, k: number): Pose => ({ s: lerp(a.s, b.s, k), ox: lerp(a.ox, b.ox, k), oy: lerp(a.oy, b.oy, k) });
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

export default function TraceBoard({ letter, size, onDone, onSay, onPose, onOops, onStrokes, startLower = false, onLower }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cb = useRef({ onDone, onSay, onPose, onOops, onStrokes, onLower });
  const sizeRef = useRef(size);
  useEffect(() => {
    cb.current = { onDone, onSay, onPose, onOops, onStrokes, onLower };
    sizeRef.current = size;
  });

  const { upper, lower } = GLYPHS[letter.ch];
  const lay = useMemo(() => layout(upper, lower), [upper, lower]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const color = letter.color;
    const st = { phase: (startLower ? "lower" : "upper") as Phase, stroke: 0, prog: 0, drawing: false, lastOops: 0, t0: 0 };
    const sparks: Spark[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));
    let raf = 0;
    let alive = true;

    const active = () => (st.phase === "upper" ? upper : st.phase === "lower" ? lower : null);
    const activePose = () => (st.phase === "lower" ? lay.lower : ID);
    const report = () => {
      const g = st.phase === "upper" || st.phase === "toLower" ? upper : lower;
      cb.current.onStrokes({ total: g.strokes.length, done: st.phase === "upper" || st.phase === "lower" ? st.stroke : g.strokes.length });
    };

    cb.current.onSay(startLower ? `Ayo tebalkan ${lower.ch} kecil! Mulai dari titik nomor satu ya.` : `Ayo tebalkan huruf ${letter.ch}! Mulai dari titik nomor satu ya.`);
    report();

    /* ---------- koordinat ---------- */
    const S = () => sizeRef.current;
    const unit = () => (S() * (1 - 2 * PADR)) / 100;
    const P = (b: Pt): Pt => [S() * PADR + b[0] * unit(), S() * PADR + b[1] * unit()];
    const place = (g: Pt, p: Pose): Pt => P([p.ox + p.s * g[0], p.oy + p.s * g[1]]);
    function toGlyph(e: PointerEvent): Pt {
      const r = canvas.getBoundingClientRect();
      const bx = ((e.clientX - r.left - r.width * PADR) / (r.width * (1 - 2 * PADR))) * 100;
      const by = ((e.clientY - r.top - r.height * PADR) / (r.height * (1 - 2 * PADR))) * 100;
      const p = activePose();
      return [(bx - p.ox) / p.s, (by - p.oy) / p.s];
    }

    /* ---------- alur ---------- */
    function spawn(g: Pt, n: number) {
      const c = place(g, activePose());
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, v = 1 + Math.random() * 3;
        sparks.push({ x: c[0], y: c[1], vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, r: 2 + Math.random() * 4 });
      }
    }

    function strokeDone() {
      const g = active()!;
      const pts = g.strokes[st.stroke];
      spawn(pts[pts.length - 1], 18);
      st.stroke++;
      st.prog = 0;
      st.drawing = false;
      report();
      if (st.stroke >= g.strokes.length) return glyphDone();
      sfx.ding();
      cb.current.onPose(Math.random() < 0.5 ? "jempol" : "tepuk-tangan");
      const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
      cb.current.onSay(isDot(g.strokes[st.stroke]) ? `${praise} Sekarang ketuk titiknya.` : `${praise} Sekarang garis nomor ${st.stroke + 1}.`);
    }

    function glyphDone() {
      sfx.ding();
      cb.current.onPose("tepuk-tangan");
      st.t0 = performance.now();
      if (st.phase === "upper") {
        st.phase = "toLower";
        cb.current.onSay(`Hebat! Itu ${letter.ch} besar. Sekarang ${lower.ch} kecil!`);
        later(() => {
          st.phase = "lower";
          cb.current.onLower?.();
          st.stroke = 0;
          st.prog = 0;
          report();
          cb.current.onPose("menunjuk");
        }, T_LOWER);
      } else {
        st.phase = "toBoth";
        cb.current.onSay(`${letter.ch} besar dan ${lower.ch} kecil. Keren!`);
        later(() => { st.phase = "both"; }, T_BOTH);
        later(() => cb.current.onDone(), T_BOTH + T_HOLD);
      }
    }

    function step(p: Pt) {
      const g = active();
      if (!g) return;
      const pts = g.strokes[st.stroke];
      const r = advance(pts, st.prog, p);
      if (r.moved) {
        if (r.prog - st.prog >= 2 || Math.random() < 0.3) spawn(pts[r.prog], 2);
        if (Math.floor(r.prog / 8) !== Math.floor(st.prog / 8)) sfx.tick();
        st.prog = r.prog;
        if (r.done) strokeDone();
      } else if (r.off) {
        st.drawing = false;
        sfx.oops();
        cb.current.onOops();
        const now = Date.now();
        if (now - st.lastOops > 3000) {
          cb.current.onSay("Ups! Ikuti garisnya ya.");
          st.lastOops = now;
        }
      }
    }

    /* ---------- sentuhan ---------- */
    const down = (e: PointerEvent) => {
      e.preventDefault();
      audio();
      const g = active();
      if (!g) return;
      const pts = g.strokes[st.stroke];
      const p = toGlyph(e);
      if (canStart(pts, st.prog, p)) {
        st.drawing = !isDot(pts);
        try { canvas.setPointerCapture(e.pointerId); } catch {}
        step(p);
      } else {
        sfx.tick();
        cb.current.onPose("menunjuk");
        cb.current.onSay(st.prog === 0 ? "Mulai dari titik bernomor ya! 👆" : "Lanjutkan dari titik yang berkedip ya!");
      }
    };
    const move = (e: PointerEvent) => {
      if (!st.drawing) return;
      e.preventDefault();
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      for (const ev of evs.length ? evs : [e]) {
        if (!st.drawing) break;
        step(toGlyph(ev));
      }
    };
    const stop = () => { st.drawing = false; };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointercancel", stop);
    canvas.addEventListener("lostpointercapture", stop);

    /* ---------- gambar ---------- */
    function path(pts: Pt[], upto: number, pose: Pose) {
      ctx.beginPath();
      const a = place(pts[0], pose);
      ctx.moveTo(a[0], a[1]);
      for (let i = 1; i <= upto; i++) {
        const b = place(pts[i], pose);
        ctx.lineTo(b[0], b[1]);
      }
      if (upto === 0) ctx.lineTo(a[0] + 0.01, a[1]);
      ctx.stroke();
    }
    /** Menggambar goresan penuh; titik (i, j) digambar sebagai bulatan. */
    function full(g: Glyph, from: number, to: number, pose: Pose, w: number, style: string) {
      ctx.strokeStyle = ctx.fillStyle = style;
      ctx.lineWidth = w * unit() * pose.s;
      for (let i = from; i < to; i++) {
        const pts = g.strokes[i];
        if (isDot(pts)) {
          const c = place(pts[0], pose);
          ctx.beginPath();
          ctx.arc(c[0], c[1], w * 0.62 * unit() * pose.s, 0, Math.PI * 2);
          ctx.fill();
        } else path(pts, pts.length - 1, pose);
      }
    }
    function lines(pose: Pose) {
      const x0 = S() * 0.03, x1 = S() * 0.97;
      const y = (v: number) => P([0, pose.oy + pose.s * v])[1];
      const draw = (v: number, style: string, w: number, dash: number[]) => {
        ctx.setLineDash(dash);
        ctx.strokeStyle = style;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(x0, y(v));
        ctx.lineTo(x1, y(v));
        ctx.stroke();
      };
      ctx.lineCap = "butt";
      draw(LINE.top, "#9cc9ee", Math.max(1.5, S() * 0.006), []);
      draw(LINE.mid, "#9cc9ee", Math.max(1.5, S() * 0.006), [S() * 0.025, S() * 0.02]);
      draw(LINE.base, "#5fa3df", Math.max(2, S() * 0.008), []);
      ctx.setLineDash([]);
      ctx.lineCap = "round";
    }
    /** Huruf yang sedang ditebalkan: pemandu abu-abu, garis putus-putus, tinta, titik target, panah. */
    function tracing(g: Glyph, pose: Pose, kind: "upper" | "lower", t: number) {
      const [gw, iw] = WIDTH[kind];
      const n = g.strokes.length;
      full(g, 0, n, pose, gw, "rgba(203,211,228,.6)");
      ctx.setLineDash([S() * 0.012, S() * 0.03]);
      ctx.strokeStyle = "#a7b2cc";
      ctx.lineWidth = S() * 0.012;
      for (let i = st.stroke; i < n; i++) if (!isDot(g.strokes[i])) path(g.strokes[i], g.strokes[i].length - 1, pose);
      ctx.setLineDash([]);
      full(g, 0, Math.min(st.stroke, n), pose, iw, color);
      if (st.stroke >= n) return;

      const pts = g.strokes[st.stroke];
      ctx.strokeStyle = color;
      ctx.lineWidth = iw * unit();
      if (st.prog > 0) path(pts, st.prog, pose);
      const a = pts[st.prog], b = pts[Math.min(st.prog + 10, pts.length - 1)];
      if (!st.drawing && !isDot(pts) && dist(a, b) > 1) {
        const pa = place(a, pose), pb = place(b, pose), ang = Math.atan2(pb[1] - pa[1], pb[0] - pa[0]);
        const wob = 4 * Math.sin(t / 200), sz = S() * 0.035;
        const tx = pb[0] + Math.cos(ang) * wob, ty = pb[1] + Math.sin(ang) * wob;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(tx + Math.cos(ang) * sz, ty + Math.sin(ang) * sz);
        ctx.lineTo(tx + Math.cos(ang + 2.5) * sz, ty + Math.sin(ang + 2.5) * sz);
        ctx.lineTo(tx + Math.cos(ang - 2.5) * sz, ty + Math.sin(ang - 2.5) * sz);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      const c = place(a, pose);
      const r = S() * 0.048 * (st.drawing ? 1.05 : 1 + 0.14 * Math.sin(t / 170));
      ctx.beginPath();
      ctx.arc(c[0], c[1], r + 4, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(c[0], c[1], r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      if (st.prog === 0) {
        ctx.fillStyle = "#fff";
        ctx.font = `800 ${Math.round(r * 1.2)}px "Grandstander Variable", system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(st.stroke + 1), c[0], c[1] + r * 0.1);
      }
    }

    function render(t: number) {
      if (!alive) return;
      raf = requestAnimationFrame(render);
      const s = S();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(s * dpr)) canvas.width = canvas.height = Math.round(s * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, s, s);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const k = ease(Math.min(1, (performance.now() - st.t0) / (st.phase === "toLower" ? T_LOWER : T_BOTH)));
      const ph = st.phase;
      lines(ph === "toBoth" ? mix(ID, lay.linesEnd, k) : ph === "both" ? lay.linesEnd : ID);

      if (ph === "upper") tracing(upper, ID, "upper", t);
      else {
        const up = ph === "toLower" ? mix(ID, lay.chip, k) : ph === "lower" ? lay.chip : ph === "toBoth" ? mix(lay.chip, lay.upperEnd, k) : lay.upperEnd;
        full(upper, 0, upper.strokes.length, up, WIDTH.upper[1], color);
        if (ph === "toLower") {
          ctx.globalAlpha = k;
          full(lower, 0, lower.strokes.length, lay.lower, WIDTH.lower[0], "rgba(203,211,228,.6)");
          ctx.globalAlpha = 1;
        } else if (ph === "lower") tracing(lower, lay.lower, "lower", t);
        else full(lower, 0, lower.strokes.length, ph === "toBoth" ? mix(lay.lower, lay.lowerEnd, k) : lay.lowerEnd, WIDTH.lower[1], color);
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.08; sp.life -= 0.03;
        if (sp.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.globalAlpha = sp.life;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r * sp.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    raf = requestAnimationFrame(render);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", stop);
      canvas.removeEventListener("pointercancel", stop);
      canvas.removeEventListener("lostpointercapture", stop);
    };
  }, [letter, upper, lower, lay, startLower]);

  return <canvas id="board" ref={canvasRef} style={{ width: size, height: size }} aria-label={`Papan menebalkan huruf ${letter.ch}`} />;
}
