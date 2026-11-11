"use client";

import { useState } from "react";
import { NUM, type Letter } from "@/data/letters";
import { audio, sfx } from "@/lib/audio";
import { shuffle } from "@/lib/progress";
import type { PoseName } from "./Lio";

/** Mini-game 3a: hitung hewan (3–6). Ketuk satu-satu untuk menghitung, lalu pilih angkanya. */
type Props = { letter: Letter; onDone: () => void; onSay: (t: string) => void; onPose: (p: PoseName) => void };
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export default function CountGame({ letter, onDone, onSay, onPose }: Props) {
  const word = letter.word === "Lio" ? "Lio" : letter.word.toLowerCase();
  const [n] = useState(() => 3 + Math.floor(Math.random() * 4));
  const [opts] = useState(() => shuffle([n - 1, n, n + 1]));
  const [order, setOrder] = useState<number[]>([]); // indeks hewan sesuai urutan diketuk
  const [wrong, setWrong] = useState<{ v: number; n: number }[]>([]);
  const [done, setDone] = useState(false);

  function count(i: number) {
    audio();
    if (done || order.includes(i)) return;
    const next = [...order, i];
    setOrder(next);
    sfx.tick();
    onSay(cap(NUM[next.length]) + "!");
  }
  function answer(v: number) {
    audio();
    if (done) return;
    if (v === n) {
      setDone(true);
      onSay(`Betul! Ada ${NUM[n]} ${word}.`);
      onDone();
      return;
    }
    sfx.oops();
    onPose("sedih");
    setWrong((w) => [...w.filter((x) => x.v !== v), { v, n: w.length + 1 }]);
    setOrder([]);
    onSay(`Belum tepat. Ayo hitung ${word}nya satu-satu!`);
  }

  return (
    <>
      <div className="qitems">
        {Array.from({ length: n }, (_, i) => {
          const k = order.indexOf(i);
          return (
            <button key={i} className={`qitem${k >= 0 ? " counted" : ""}`} onClick={() => count(i)} aria-label={word}>
              <img src={letter.img} alt="" draggable={false} />
              {k >= 0 && <span className="n">{k + 1}</span>}
            </button>
          );
        })}
      </div>
      <div className="qopts">
        {opts.map((v) => {
          const w = wrong.find((x) => x.v === v);
          return (
            <button key={v + (w ? `w${w.n}` : "")} className={`btn ghost qopt${w ? " wrong" : ""}`} onClick={() => answer(v)}>
              {v}
            </button>
          );
        })}
      </div>
    </>
  );
}
