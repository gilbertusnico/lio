"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { LETTERS } from "@/data/letters";
import { NUMBERS } from "@/data/numbers";
import type { NumProgress, Progress } from "@/lib/progress";
import { audio, sfx } from "@/lib/audio";
import Pop from "./Pop";
import Icon from "./Icon";

export type AlbumTab = "huruf" | "angka";

/**
 * Album stiker, dua tab: Huruf (26 hewan) dan Angka (10 buah).
 * Belum didapat = bayangan abu-abu; sudah didapat = gambar berwarna + nama.
 * Semua kotak bisa diketuk dan bereaksi.
 */
export default function Album({ progress, numProgress, tab: tab0, onClose }: {
  progress: Progress; numProgress: NumProgress; tab: AlbumTab; onClose: () => void;
}) {
  const [tab, setTab] = useState<AlbumTab>(tab0);
  const [hit, setHit] = useState<{ i: number; n: number } | null>(null);
  const [hint, setHint] = useState("Ketuk stikernya ya!");
  const items = tab === "huruf"
    ? LETTERS.map((l) => ({ key: l.ch, ch: l.ch, img: l.img, color: l.color, name: l.word, has: !!progress.done[l.ch] }))
    : NUMBERS.map((l) => ({ key: String(l.n), ch: String(l.n), img: l.img, color: l.color, name: l.fruit, has: !!numProgress.done[l.n] }));
  const got = items.filter((s) => s.has).length;

  function pick(t: AlbumTab) {
    if (t === tab) return;
    setTab(t);
    setHit(null);
    setHint("Ketuk stikernya ya!");
  }

  function tap(i: number) {
    audio();
    const s = items[i];
    setHit({ i, n: (hit?.n ?? 0) + 1 });
    const what = tab === "huruf" ? "huruf" : "angka";
    if (s.has) {
      sfx.ding();
      setHint(tab === "huruf" ? `${s.ch} untuk ${s.name}!` : `${NUMBERS[i].word} ${s.name.toLowerCase()}!`);
    } else {
      sfx.tick();
      setHint(`Stiker ${s.ch} belum ada. Selesaikan ${what} ${s.ch} ya!`);
    }
  }

  const nameOf = (n: string) => (n === "Lio" ? "Lio" : n.toLowerCase());

  return (
    <motion.section
      className="album-screen" id="album"
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="album-head">
        <button className="btn ghost icon-btn" onClick={() => { audio(); onClose(); }} aria-label="Tutup album"><Icon name="back" /></button>
        <h2><img src="/ui/album.webp" alt="" draggable={false} /> Album Stiker</h2>
        <div className="album-count">{got}/{items.length}</div>
      </div>
      <div className="album-tabs" role="tablist">
        {(["huruf", "angka"] as const).map((t) => (
          <button
            key={t} role="tab" aria-selected={tab === t} className={`album-tab${tab === t ? " on" : ""}`} id={`albumTab-${t}`}
            onClick={() => pick(t)}
          >
            <span className="at-sample">{t === "huruf" ? "Aa" : "123"}</span> {t === "huruf" ? "Huruf" : "Angka"}
          </button>
        ))}
      </div>
      <div className={`album-grid${tab === "angka" ? " nums" : ""}`} key={tab}>
        {items.map((s, i) => (
          <Pop key={s.key} i={i} step={0.018} delay={0.08} from={0.5}>
            <button
              key={hit?.i === i ? `r${hit.n}` : "s"}
              className={`sticker${s.has ? " has" : " locked"}${hit?.i === i ? " react" : ""}`}
              onClick={() => tap(i)}
              aria-label={s.has ? `Stiker ${s.name}, sudah didapat` : `Stiker ${tab} ${s.ch}, belum didapat`}
            >
              <span className="ch" style={s.has ? { background: s.color } : undefined}>{s.ch}</span>
              <img src={s.img} alt="" draggable={false} />
              {s.has && <span className="nm">{nameOf(s.name)}</span>}
            </button>
          </Pop>
        ))}
      </div>
      <div className="album-hint" aria-live="polite">{hint}</div>
    </motion.section>
  );
}
