"use client";

import { useRef, useState } from "react";
import { NUM } from "@/data/letters";
import type { NumberLevel } from "@/data/numbers";
import { audio, sfx } from "@/lib/audio";
import { shuffle } from "@/lib/progress";
import { FIND_TARGETS, makeNumCells } from "@/lib/numGames";
import Pop from "./Pop";
import Hand, { centerOf, type HandDemo } from "./Hand";
import type { PoseName } from "./Lio";

/**
 * Mini-game 3 angka "cari angka": 9 gelembung = 3 angka target + 6 pengecoh mirip (6/9, 2/5, 1/7, …).
 * Angka yang ketemu berwarna sama dan memperlihatkan titik sebanyak angkanya (pola bingkai sepuluh),
 * supaya lambang angka terpasang dengan jumlahnya.
 */
const BUBBLE_COLORS = ["#ff9f6b", "#6bb6ff", "#5fd39a", "#c38bff", "#ffc94d", "#ff8ac4", "#4fd1c5", "#9aa8ff", "#ffb35c"];

type Props = { num: NumberLevel; onDone: () => void; onSay: (t: string) => void; onPose: (p: PoseName) => void; ask?: number };

export function Dots({ n, color }: { n: number; color?: string }) {
  return (
    <span className={`ndots${n > 5 ? " two" : ""}`} aria-hidden>
      {Array.from({ length: n }, (_, i) => <i key={i} style={color ? { background: color } : undefined} />)}
    </span>
  );
}

export default function FindNumberGame({ num, onDone, onSay, onPose, ask = 0 }: Props) {
  const { n } = num;
  const [cells] = useState(() => makeNumCells(n, num.similar));
  const [colors] = useState(() => shuffle(BUBBLE_COLORS.filter((c) => c !== num.color)));
  const [found, setFound] = useState<number[]>([]);
  const [wrong, setWrong] = useState<{ i: number; n: number } | null>(null);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  // Contoh gerakan tangan: mengetuk SATU gelembung benar yang belum ketemu.
  const demo = (): HandDemo => {
    const i = cells.findIndex((c, k) => c === n && !found.includes(k));
    const p = i < 0 || found.length >= FIND_TARGETS ? null : centerOf(btns.current[i]);
    return { pts: p ? [p] : [] };
  };

  function tap(i: number) {
    audio();
    if (found.length >= FIND_TARGETS || found.includes(i)) return;
    const c = cells[i];
    if (c === n) {
      const next = [...found, i];
      setFound(next);
      if (next.length >= FIND_TARGETS) {
        onSay(`Hebat! Semua angka ${n} ketemu!`);
        onDone();
        return;
      }
      sfx.step(next.length - 1);
      onPose("jempol");
      onSay(`Bagus! Itu ${NUM[n]}. Masih ada ${NUM[FIND_TARGETS - next.length]} lagi.`);
    } else {
      sfx.oops();
      onPose("sedih");
      setWrong({ i, n: (wrong?.n ?? 0) + 1 });
      onSay(`Itu angka ${c}. Cari angka ${n} ya!`);
    }
  }

  return (
    <>
      <div className="qgrid">
        {cells.map((c, i) => {
          const ok = found.includes(i);
          return (
            <Pop key={i} i={i} step={0.045} className="qcell">
              <button
                key={i + (wrong?.i === i ? `w${wrong.n}` : "")}
                ref={(node) => { btns.current[i] = node; }}
                className={`qb qnum${ok ? " found" : ""}${wrong?.i === i ? " wrong" : ""}`}
                style={{ backgroundColor: ok ? num.color : colors[i % colors.length] }}
                onClick={() => tap(i)}
                aria-label={`Angka ${c}`}
              >
                <span className="qn">{c}</span>
                {ok && <Dots n={n} />}
              </button>
            </Pop>
          );
        })}
      </div>
      <Hand demo={demo} now={ask} />
    </>
  );
}
