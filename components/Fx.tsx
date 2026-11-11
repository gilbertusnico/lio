"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type FxHandle = { confetti: () => void };
type Bit = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; w: number; h: number; color: string };
const COLORS = ["#ff6b4a", "#ffc93c", "#3d8bff", "#22b573", "#c86bff", "#ff8ad8"];

/** Lapisan konfeti di atas semua layar. */
const Fx = forwardRef<FxHandle>(function Fx(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bits = useRef<Bit[]>([]);
  const raf = useRef(0);

  useImperativeHandle(ref, () => ({
    confetti() {
      const W = window.innerWidth, H = window.innerHeight;
      for (let i = 0; i < 140; i++)
        bits.current.push({
          x: Math.random() * W, y: -20 - Math.random() * H * 0.5,
          vx: -1.5 + Math.random() * 3, vy: 2 + Math.random() * 3.5,
          rot: Math.random() * 6, vr: -0.2 + Math.random() * 0.4,
          w: 7 + Math.random() * 7, h: 10 + Math.random() * 8, color: COLORS[i % COLORS.length],
        });
      if (!raf.current) raf.current = requestAnimationFrame(loop);
    },
  }));

  function loop() {
    const c = canvasRef.current;
    if (!c) return;
    const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    }
    const ctx = c.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const a = bits.current;
    for (let i = a.length - 1; i >= 0; i--) {
      const b = a[i];
      b.x += b.vx; b.y += b.vy; b.rot += b.vr;
      if (b.y > H + 30) { a.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.fillStyle = b.color;
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.restore();
    }
    raf.current = a.length ? requestAnimationFrame(loop) : 0;
  }

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return <canvas id="fx" ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
});
export default Fx;
