"use client";

import type { PoseName } from "./Lio";
import { audio, sfx } from "@/lib/audio";
import { poke } from "@/lib/poke";

/**
 * Hewan huruf (atau buah angka) yang jalan (atau melayang) bolak-balik di atas tepi papan.
 * Ikut bereaksi: lompat saat Lio memuji, goyang saat Lio sedih (`n` berubah tiap pose baru).
 */
export default function Critter({ img, motion, pose, n }: { img: string; motion: "walk" | "float"; pose: PoseName; n: number }) {
  const react = pose === "sedih" ? "shake" : pose === "jempol" || pose === "tepuk-tangan" ? "hop" : "";
  return (
    <div className="critter on" aria-hidden>
      <div className="cw">
        <div key={n} className={`cr ${react}`}>
          <img
            className={`ce ${motion} pokeable`} src={img} alt="" draggable={false}
            onPointerDown={(e) => { audio(); sfx.pop(); poke(e.currentTarget.parentElement, "hop", 650); }}
          />
        </div>
      </div>
    </div>
  );
}
