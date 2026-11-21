"use client";

import { useState } from "react";
import { NUMBERS } from "@/data/numbers";
import type { NumProgress } from "@/lib/progress";
import { audio, sfx } from "@/lib/audio";
import { poke } from "@/lib/poke";
import Pop from "./Pop";

/**
 * Layar Pilih Angka: 1–10 terbuka semua, bebas pilih. Angka yang selesai dapat bintang.
 * Tahap 1: levelnya belum ada, jadi mengetuk kotak hanya bereaksi dan menampilkan petunjuk "segera hadir".
 */
export default function NumberMap({ progress }: { progress: NumProgress }) {
  const [soon, setSoon] = useState(false);
  return (
    <section id="numap" className="screen on">
      <Pop><h2><span className="sparkle">Pilih Angka</span></h2></Pop>
      <div className="legend">{soon ? "Level angka segera hadir ya!" : "Pilih angka mana saja ya!"}</div>
      <div className="numgrid-fit">
        <div className="numgrid">
          {NUMBERS.map((l, i) => (
            <Pop key={l.n} i={i} step={0.03} delay={0.08} className="numtile-wrap">
              <button
                className="numtile" style={{ background: `linear-gradient(180deg, ${l.color}, ${l.color})`, ["--c" as string]: l.color }}
                aria-label={`Angka ${l.n}${progress.done[l.n] ? ", sudah selesai" : ""}`}
                onClick={(e) => { audio(); sfx.pop(); poke(e.currentTarget, "poke"); setSoon(true); }}
              >
                <span className="nt-num">{l.n}</span>
                <img className="nt-fruit" src={l.img} alt="" draggable={false} />
                {progress.done[l.n] && <img className="badge" src="/ui/star.webp" alt="" draggable={false} />}
              </button>
            </Pop>
          ))}
        </div>
      </div>
    </section>
  );
}
