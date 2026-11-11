"use client";

import { LETTERS } from "@/data/letters";
import { FREE_LETTERS, PAYWALL_ENABLED } from "@/lib/config";
import type { Progress } from "@/lib/progress";

const TILE_STYLE: [string, string][] = [
  ["linear-gradient(180deg,#ffa24f,#ff7417)", "#d4560a"],
  ["linear-gradient(180deg,#43d3ec,#14a6cc)", "#0b83a2"],
  ["linear-gradient(180deg,#82e15c,#43b83a)", "#2e8d29"],
  ["linear-gradient(180deg,#ff8fc0,#f25c9c)", "#c43d78"],
  ["linear-gradient(180deg,#b79cff,#8a6bf0)", "#6748c9"],
  ["linear-gradient(180deg,#ffd45a,#f5ae19)", "#c98605"],
];

/** Layar Pilih Huruf: semua A–Z terbuka, bebas pilih. Huruf yang selesai dapat bintang. */
export default function LetterMap({ progress, onPick }: { progress: Progress; onPick: (i: number) => void }) {
  const stars = LETTERS.filter((l) => progress.done[l.ch]).length;
  return (
    <section id="map" className="screen on">
      <h2><span className="sparkle">Pilih Huruf</span></h2>
      <div className="legend">{stars > 0 ? `⭐ ${stars} dari 26 huruf selesai` : "Pilih huruf mana saja ya!"}</div>
      <div className="grid" id="grid">
        {LETTERS.map((l, i) => {
          const locked = PAYWALL_ENABLED && i >= FREE_LETTERS;
          const [bg, shadow] = TILE_STYLE[i % TILE_STYLE.length];
          return (
            <button
              key={l.ch}
              className={`tile${locked ? " locked" : ""}`}
              style={locked ? undefined : { background: bg, boxShadow: `0 6px 0 ${shadow}` }}
              onClick={() => onPick(i)}
              aria-label={`Huruf ${l.ch}${progress.done[l.ch] ? ", sudah selesai" : ""}`}
            >
              {l.ch}
              {locked ? <span className="lock">🔒</span> : progress.done[l.ch] && <span className="badge">⭐</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
