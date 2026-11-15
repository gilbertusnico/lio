"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { LETTERS } from "@/data/letters";
import type { Progress } from "@/lib/progress";
import { audio, sfx } from "@/lib/audio";
import Pop from "./Pop";
import Icon from "./Icon";

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
      setHint(`${l.ch} untuk ${l.word}!`);
    } else {
      sfx.tick();
      setHint(`Stiker ${l.ch} belum ada. Selesaikan huruf ${l.ch} ya!`);
    }
  }

  return (
    <motion.section
      className="album-screen" id="album"
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="album-head">
        <button className="btn ghost icon-btn" onClick={() => { audio(); onClose(); }} aria-label="Tutup album"><Icon name="back" /></button>
        <h2><img src="/ui/album.webp" alt="" draggable={false} /> Album Stiker</h2>
        <div className="album-count">{got}/26</div>
      </div>
      <div className="album-grid">
        {LETTERS.map((l, i) => {
          const has = !!progress.done[l.ch];
          return (
            <Pop key={l.ch} i={i} step={0.018} delay={0.12} from={0.5}>
              <button
                key={hit?.i === i ? `r${hit.n}` : "s"}
                className={`sticker${has ? " has" : " locked"}${hit?.i === i ? " react" : ""}`}
                onClick={() => tap(i)}
                aria-label={has ? `Stiker ${l.word}, sudah didapat` : `Stiker huruf ${l.ch}, belum didapat`}
              >
                <span className="ch" style={has ? { background: l.color } : undefined}>{l.ch}</span>
                <img src={l.img} alt="" draggable={false} />
                {has && <span className="nm">{l.word === "Lio" ? "Lio" : l.word.toLowerCase()}</span>}
              </button>
            </Pop>
          );
        })}
      </div>
      <div className="album-hint" aria-live="polite">{hint}</div>
    </motion.section>
  );
}
