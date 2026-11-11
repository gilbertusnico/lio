"use client";

import { useState } from "react";
import { NUM, type Letter } from "@/data/letters";
import { audio, sfx } from "@/lib/audio";
import { shuffle } from "@/lib/progress";
import type { PoseName } from "./Lio";

/**
 * Mini-game 2: "Ketuk semua A dan a!"
 * 9 gelembung = 2 kapital + 2 kecil + 5 pengecoh mirip (campuran besar/kecil).
 * Yang ketemu diberi warna yang sama (warna huruf) supaya terlihat A dan a itu satu huruf.
 */
const BUBBLE_COLORS = ["#ff9f6b", "#6bb6ff", "#5fd39a", "#c38bff", "#ffc94d", "#ff8ac4", "#4fd1c5", "#9aa8ff", "#ffb35c"];
const isUpper = (c: string) => c === c.toUpperCase();

export function makeCells(letter: Letter): string[] {
  const lo = letter.ch.toLowerCase();
  const sim = shuffle(letter.similar.split(""));
  const ups = sim.filter(isUpper), los = sim.filter((c) => !isUpper(c));
  const picked = [...ups.slice(0, 2), ...los.slice(0, 2)];
  const rest = shuffle([...ups.slice(2), ...los.slice(2)]);
  return shuffle([letter.ch, letter.ch, lo, lo, ...picked, rest[0]]);
}

type Props = { letter: Letter; onDone: () => void; onSay: (t: string) => void; onPose: (p: PoseName) => void };

export default function FindGame({ letter, onDone, onSay, onPose }: Props) {
  const lo = letter.ch.toLowerCase();
  const [cells] = useState(() => makeCells(letter));
  const [colors] = useState(() => shuffle(BUBBLE_COLORS.filter((c) => c !== letter.color)));
  const [found, setFound] = useState<number[]>([]);
  const [wrong, setWrong] = useState<{ i: number; n: number } | null>(null);
  const total = 4;

  function tap(i: number) {
    audio();
    if (found.length >= total || found.includes(i)) return;
    const c = cells[i];
    if (c === letter.ch || c === lo) {
      const next = [...found, i];
      setFound(next);
      if (next.length >= total) {
        onSay(`Hebat! Semua ${letter.ch} dan ${lo} ketemu!`);
        onDone();
        return;
      }
      sfx.tick();
      sfx.ding();
      onPose("jempol");
      onSay(`Bagus! Masih ada ${NUM[total - next.length]} lagi.`);
    } else {
      sfx.oops();
      onPose("sedih");
      setWrong({ i, n: (wrong?.n ?? 0) + 1 });
      onSay(`Itu huruf ${c}. Cari ${letter.ch} dan ${lo} ya!`);
    }
  }

  return (
    <div className="qgrid">
      {cells.map((c, i) => {
        const ok = found.includes(i);
        return (
          <button
            key={i + (wrong?.i === i ? `w${wrong.n}` : "")}
            className={`qb${ok ? " found" : ""}${wrong?.i === i ? " wrong" : ""}`}
            style={{ backgroundColor: ok ? letter.color : colors[i % colors.length] }}
            onClick={() => tap(i)}
            aria-label={`Huruf ${c}${isUpper(c) ? " besar" : " kecil"}`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
