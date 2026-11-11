"use client";

import type { Letter } from "@/data/letters";
import type { PoseName } from "./Lio";

/**
 * Hewan huruf yang jalan (atau melayang) bolak-balik di atas tepi papan.
 * Ikut bereaksi: lompat saat Lio memuji, goyang saat Lio sedih (`n` berubah tiap pose baru).
 */
export default function Critter({ letter, pose, n }: { letter: Letter; pose: PoseName; n: number }) {
  const react = pose === "sedih" ? "shake" : pose === "jempol" || pose === "tepuk-tangan" ? "hop" : "";
  return (
    <div className="critter on" aria-hidden>
      <div className="cw">
        <div key={n} className={`cr ${react}`}>
          <img className={`ce ${letter.motion}`} src={letter.img} alt="" draggable={false} />
        </div>
      </div>
    </div>
  );
}
