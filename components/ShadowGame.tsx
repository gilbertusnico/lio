"use client";

import { useEffect, useRef, useState } from "react";
import { LETTERS, SHADOW_CONFUSABLE, type Letter } from "@/data/letters";
import { audio, sfx } from "@/lib/audio";
import { shuffle } from "@/lib/progress";
import type { PoseName } from "./Lio";

/** Mini-game 3b: cocokkan bayangan. Bayangan hewan huruf ini, pilih 1 dari 3 gambar. */
type Props = { letter: Letter; onDone: () => void; onSay: (t: string) => void; onPose: (p: PoseName) => void };

export function makeOptions(letter: Letter): Letter[] {
  const banned = new Set([letter.ch]);
  for (const [a, b] of SHADOW_CONFUSABLE) {
    if (a === letter.ch) banned.add(b);
    if (b === letter.ch) banned.add(a);
  }
  const others = shuffle(LETTERS.filter((l) => !banned.has(l.ch))).slice(0, 2);
  return shuffle([letter, ...others]);
}

export default function ShadowGame({ letter, onDone, onSay, onPose }: Props) {
  const word = letter.word === "Lio" ? "Lio" : letter.word.toLowerCase();
  const [opts] = useState(() => makeOptions(letter));
  const [wrong, setWrong] = useState<{ ch: string; n: number }[]>([]);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function pick(o: Letter) {
    audio();
    if (done) return;
    if (o.ch === letter.ch) {
      setDone(true);
      sfx.ding();
      onPose("jempol");
      onSay(`Betul! Itu bayangan ${word}.`);
      timer.current = setTimeout(onDone, 1100); // beri waktu melihat bayangan berubah jadi gambar
      return;
    }
    sfx.oops();
    onPose("sedih");
    setWrong((w) => [...w.filter((x) => x.ch !== o.ch), { ch: o.ch, n: w.length + 1 }]);
    onSay("Bukan itu. Lihat bentuknya baik-baik ya!");
  }

  return (
    <>
      <div className="shadow-stage">
        <img className={`shadow-img${done ? " reveal" : ""}`} src={letter.img} alt="Bayangan hewan" draggable={false} />
      </div>
      <div className="qopts shadow-opts">
        {opts.map((o) => {
          const w = wrong.find((x) => x.ch === o.ch);
          return (
            <button
              key={o.ch + (w ? `w${w.n}` : "")}
              className={`btn ghost qopt shadow-opt${w ? " wrong" : ""}${done && o.ch === letter.ch ? " right" : ""}`}
              onClick={() => pick(o)}
              aria-label={o.word}
            >
              <img src={o.img} alt="" draggable={false} />
            </button>
          );
        })}
      </div>
    </>
  );
}
