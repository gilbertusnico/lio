"use client";

import { useEffect, useRef, useState } from "react";
import { LETTERS, SHADOW_CONFUSABLE, type Letter } from "@/data/letters";
import { audio, sfx } from "@/lib/audio";
import { shuffle } from "@/lib/progress";
import Pop from "./Pop";
import Hand, { centerOf, type HandPoint } from "./Hand";
import type { PoseName } from "./Lio";

/**
 * Mini-game 3b: cocokkan bayangan, 3 ronde. Tiap ronde: satu bayangan hewan, pilih 1 dari 3 gambar.
 * Dua ronde pertama hewan lain (supaya tidak bisa ditebak dari hewan yang jalan-jalan di papan),
 * ronde terakhir hewan huruf ini.
 */
type Props = { letter: Letter; onDone: () => void; onSay: (t: string) => void; onPose: (p: PoseName) => void };
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

export default function ShadowGame({ letter, onDone, onSay, onPose }: Props) {
  const [rounds] = useState(() => makeRounds(letter));
  const [r, setR] = useState(0);
  const [wrong, setWrong] = useState<{ ch: string; n: number }[]>([]);
  const [solved, setSolved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const optsEls = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const { target, opts } = rounds[r];
  // Contoh gerakan tangan: menunjuk bayangannya, lalu gambar yang cocok.
  const demoPoints = () => {
    const pts: HandPoint[] = [];
    const a = centerOf(stage.current);
    const b = centerOf(optsEls.current[opts.findIndex((o) => o.ch === target.ch)]);
    if (a) pts.push(a);
    if (b) pts.push(b);
    return pts;
  };

  function pick(o: Letter) {
    audio();
    if (solved) return;
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
      onSay(r + 1 === ROUNDS - 1 ? "Yang terakhir! Bayangan siapa ini?" : "Kalau yang ini, bayangan siapa?");
    }, 1100);
  }

  return (
    <>
      <div className="shadow-stage" ref={stage} data-word={target.word}>
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
          return (
            <Pop key={`${r}${o.ch}`} i={i} step={0.08} delay={0.25}>
            <button
              key={w ? `w${w.n}` : "b"}
              ref={(node) => { optsEls.current[i] = node; }}
              className={`btn ghost qopt shadow-opt${w ? " wrong" : ""}${solved && o.ch === target.ch ? " right" : ""}`}
              onClick={() => pick(o)}
              aria-label={o.word}
            >
              <img src={o.img} alt="" draggable={false} />
            </button>
            </Pop>
          );
        })}
      </div>
      <Hand points={demoPoints} />
    </>
  );
}
