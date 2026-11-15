"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { LETTERS, SHADOW_CONFUSABLE, type Letter } from "@/data/letters";
import { audio, sfx } from "@/lib/audio";
import { shuffle } from "@/lib/progress";
import Pop from "./Pop";
import Hand, { centerOf, type HandDemo } from "./Hand";
import type { PoseName } from "./Lio";

/**
 * Mini-game 3b: cocokkan bayangan, 3 ronde. Tiap ronde: satu bayangan hewan dan 3 gambar;
 * anak MENYERET gambar yang cocok ke bayangannya (bukan sekadar mengetuk).
 * Dua ronde pertama hewan lain (supaya tidak bisa ditebak dari hewan yang jalan-jalan di papan),
 * ronde terakhir hewan huruf ini.
 */
type Props = { letter: Letter; onDone: () => void; onSay: (t: string) => void; onPose: (p: PoseName) => void; ask?: number };
type Round = { target: Letter; opts: Letter[] };
const ROUNDS = 3;
const nameOf = (l: Letter) => (l.word === "Lio" ? "Lio" : l.word.toLowerCase());

function confusable(a: string, b: string) {
  return SHADOW_CONFUSABLE.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}
function makeRound(target: Letter): Round {
  const others = shuffle(LETTERS.filter((l) => l.ch !== target.ch && !confusable(l.ch, target.ch))).slice(0, 2);
  return { target, opts: shuffle([target, ...others]) };
}
export function makeRounds(letter: Letter): Round[] {
  const warmups = shuffle(LETTERS.filter((l) => l.ch !== letter.ch)).slice(0, ROUNDS - 1);
  return [...warmups, letter].map(makeRound);
}

export default function ShadowGame({ letter, onDone, onSay, onPose, ask = 0 }: Props) {
  const [rounds] = useState(() => makeRounds(letter));
  const [r, setR] = useState(0);
  const [wrong, setWrong] = useState<{ ch: string; n: number }[]>([]);
  const [solved, setSolved] = useState(false);
  const [drag, setDrag] = useState<string | null>(null); // huruf gambar yang sedang diseret
  const [over, setOver] = useState(false); // gambar sedang berada di atas bayangan
  const [hint, setHint] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const optsEls = useRef<(HTMLButtonElement | null)[]>([]);
  const demoIdx = useRef(0);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const { target, opts } = rounds[r];

  // Contoh gerakan tangan: menyeret satu gambar ke bayangan. Gambarnya bergantian tiap contoh,
  // jadi tangan menunjukkan CARANYA tanpa membocorkan gambar mana yang benar.
  const demo = (): HandDemo => {
    if (solved) return { pts: [] };
    const from = centerOf(optsEls.current[demoIdx.current++ % opts.length]);
    const to = centerOf(stage.current);
    return from && to ? { pts: [from, to], glide: true } : { pts: [] };
  };

  /** Titik (koordinat layar) ada di atas area bayangan? Diberi kelonggaran supaya tidak harus pas. */
  const onStage = (x: number, y: number) => {
    const b = stage.current?.getBoundingClientRect();
    return !!b && x > b.left - 16 && x < b.right + 16 && y > b.top - 16 && y < b.bottom + 24;
  };
  const centerOfBtn = (i: number) => centerOf(optsEls.current[i]);

  function drop(o: Letter, i: number) {
    const c = centerOfBtn(i);
    setDrag(null);
    setOver(false);
    if (solved || !c || !onStage(c.x, c.y)) return; // dilepas di luar bayangan: gambar kembali sendiri
    if (o.ch !== target.ch) {
      sfx.oops();
      onPose("sedih");
      setWrong((w) => [...w.filter((x) => x.ch !== o.ch), { ch: o.ch, n: w.length + 1 }]);
      onSay("Bukan itu. Lihat bentuknya baik-baik ya!");
      return;
    }
    setSolved(true);
    sfx.ding();
    onPose("jempol");
    onSay(`Betul! Itu bayangan ${nameOf(target)}.`);
    // beri waktu melihat bayangan berubah jadi gambar, lalu ronde berikutnya
    timer.current = setTimeout(() => {
      if (r + 1 >= ROUNDS) return onDone();
      setR(r + 1);
      setWrong([]);
      setSolved(false);
      onPose("menunjuk");
      onSay(r + 1 === ROUNDS - 1 ? "Yang terakhir! Seret gambarnya ke bayangan." : "Kalau yang ini? Seret gambarnya ke bayangan.");
    }, 1100);
  }

  /** Hanya diketuk (tidak diseret): gambar bergoyang dan tangan mencontohkan cara menyeret. */
  function tapOnly() {
    audio();
    if (solved) return;
    sfx.tick();
    onPose("menunjuk");
    onSay("Seret gambarnya ke bayangan ya!");
    setHint((n) => n + 1);
  }

  return (
    <>
      <div className={`shadow-stage${over ? " over" : ""}${drag ? " waiting" : ""}`} ref={stage} data-word={target.word}>
        <div className="shadow-rounds">
          {rounds.map((_, i) => <span key={i} className={i < r || (i === r && solved) ? "done" : i === r ? "on" : ""} />)}
        </div>
        <Pop key={r} className="shadow-pop" from={0.5}>
          <img className={`shadow-img${solved ? " reveal" : ""}`} src={target.img} alt="Bayangan hewan" draggable={false} />
        </Pop>
      </div>
      <div className="qopts shadow-opts">
        {opts.map((o, i) => {
          const w = wrong.find((x) => x.ch === o.ch);
          const used = solved && o.ch === target.ch;
          return (
            <Pop key={`${r}${o.ch}`} i={i} step={0.08} delay={0.25} className={`shadow-slot${drag === o.ch ? " lifting" : ""}`}>
              <motion.button
                ref={(node) => { optsEls.current[i] = node; }}
                className={`btn ghost qopt shadow-opt${w ? " wrong" : ""}${used ? " used" : ""}`}
                aria-label={o.word}
                drag={!solved}
                dragSnapToOrigin
                dragMomentum={false}
                dragElastic={0}
                whileDrag={{ scale: 1.16, rotate: -4 }}
                onDragStart={() => { audio(); setDrag(o.ch); }}
                onDrag={() => { const c = centerOfBtn(i); const v = !!c && onStage(c.x, c.y); if (v !== over) setOver(v); }}
                onDragEnd={() => drop(o, i)}
                onTap={tapOnly}
              >
                <img key={w ? `w${w.n}` : "b"} className={w ? "nope" : ""} src={o.img} alt="" draggable={false} />
              </motion.button>
            </Pop>
          );
        })}
      </div>
      <Hand demo={demo} restart={r} now={hint + ask} delay={1200} />
    </>
  );
}
