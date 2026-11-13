"use client";

import { useState } from "react";
import { LETTERS } from "@/data/letters";
import type { Progress } from "@/lib/progress";
import { audio, sfx } from "@/lib/audio";
import Pop from "./Pop";

/**
 * Album stiker: 26 kotak, satu per huruf.
 * Belum didapat = bayangan abu-abu; sudah didapat = gambar berwarna + nama hewannya.
 * Semua kotak bisa diketuk dan bereaksi.
 */
export default function Album({ progress, onClose }: { progress: Progress; onClose: () => void }) {
  const [hit, setHit] = useState<{ i: number; n: number } | null>(null);
  const [hint, setHint] = useState("Ketuk stikernya ya!");
  const got = LETTERS.filter((l) => progress.done[l.ch]).length;

  function tap(i: number) {
    audio();
    const l = LETTERS[i];
    setHit({ i, n: (hit?.n ?? 0) + 1 });
    if (progress.done[l.ch]) {
      sfx.ding();
      setHint(l.word === "Lio" ? "Lio!" : `${l.word.toLowerCase()}!`);
    } else {
      sfx.tick();
      setHint(`Stiker ${l.ch} belum ada. Selesaikan huruf ${l.ch} ya!`);
    }
  }

  return (
    <section className="album-screen" id="album">
      <div className="album-head">
        <button className="btn ghost icon-btn" onClick={() => { audio(); onClose(); }} aria-label="Tutup album">↩</button>
        <h2>Album Stiker</h2>
        <div className="album-count">{got}/26</div>
      </div>
      <div className="album-grid">
        {LETTERS.map((l, i) => {
          const has = !!progress.done[l.ch];
          return (
            <Pop key={l.ch} i={i} step={0.012} from={0.8}>
              <button
                key={hit?.i === i ? `r${hit.n}` : "s"}
                className={`sticker${has ? "" : " locked"}${hit?.i === i ? " react" : ""}`}
                onClick={() => tap(i)}
                aria-label={has ? `Stiker ${l.word}, sudah didapat` : `Stiker huruf ${l.ch}, belum didapat`}
              >
                <img src={l.img} alt="" draggable={false} />
                {has && <span className="nm">{l.word === "Lio" ? "Lio" : l.word.toLowerCase()}</span>}
              </button>
            </Pop>
          );
        })}
      </div>
      <div className="album-hint" aria-live="polite">{hint}</div>
    </section>
  );
}
