"use client";

import { useRef, useState } from "react";
import { NUM, type Letter } from "@/data/letters";
import { audio, sfx } from "@/lib/audio";
import { shuffle } from "@/lib/progress";
import Pop from "./Pop";
import Hand, { centerOf, type HandDemo, type HandPoint } from "./Hand";
import type { PoseName } from "./Lio";

/** Mini-game 3a: hitung hewan (3–6). Ketuk satu-satu untuk menghitung, lalu pilih angkanya. */
type Props = { letter: Letter; onDone: () => void; onSay: (t: string) => void; onPose: (p: PoseName) => void; ask?: number };
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export default function CountGame({ letter, onDone, onSay, onPose, ask = 0 }: Props) {
  const word = letter.word === "Lio" ? "Lio" : letter.word.toLowerCase();
  const [n] = useState(() => 3 + Math.floor(Math.random() * 4));
  // Dua pengecoh diambil acak dari n-2…n+2, supaya jawaban benar tidak selalu angka yang di tengah.
  const [opts] = useState(() => shuffle([n, ...shuffle([n - 2, n - 1, n + 1, n + 2].filter((v) => v >= 1)).slice(0, 2)]));
  const [order, setOrder] = useState<number[]>([]); // indeks hewan sesuai urutan diketuk
  const [wrong, setWrong] = useState<{ v: number; n: number }[]>([]);
  const [done, setDone] = useState(false);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const optsEls = useRef<(HTMLButtonElement | null)[]>([]);
  // Contoh gerakan tangan: mengetuk hewan yang belum dihitung (paling banyak tiga). Kalau semua sudah
  // dihitung, tangan mengetuk ketiga angka bergantian, tanpa menunjukkan mana jawabannya.
  const demo = (): HandDemo => {
    if (done) return { pts: [] };
    const left = Array.from({ length: n }, (_, i) => i).filter((i) => !order.includes(i)).slice(0, 3);
    const els = left.length ? left.map((i) => items.current[i]) : optsEls.current;
    return { pts: els.map((el) => centerOf(el)).filter((p): p is HandPoint => !!p) };
  };


  function count(i: number) {
    audio();
    if (done || order.includes(i)) return;
    const next = [...order, i];
    setOrder(next);
    sfx.step(next.length - 1); // nada naik tiap hitungan
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
            <Pop key={i} i={i} step={0.07}>
            <button
              ref={(node) => { items.current[i] = node; }}
              className={`qitem${k >= 0 ? " counted" : ""}`} onClick={() => count(i)} aria-label={word}
            >
              <img src={letter.img} alt="" draggable={false} />
              {k >= 0 && <span className="n">{k + 1}</span>}
            </button>
            </Pop>
          );
        })}
      </div>
      <div className="qopts">
        {opts.map((v, i) => {
          const w = wrong.find((x) => x.v === v);
          return (
            <Pop key={v} i={i} step={0.07} delay={0.45}>
            <button
              key={w ? `w${w.n}` : "b"}
              ref={(node) => { optsEls.current[i] = node; }}
              className={`btn ghost qopt${w ? " wrong" : ""}`} onClick={() => answer(v)}
            >
              {v}
            </button>
            </Pop>
          );
        })}
      </div>
      <Hand demo={demo} now={ask} />
    </>
  );
}
