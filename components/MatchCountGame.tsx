"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { NUM } from "@/data/letters";
import type { NumberLevel } from "@/data/numbers";
import { audio, sfx } from "@/lib/audio";
import { shuffle } from "@/lib/progress";
import { makeMatchCounts } from "@/lib/numGames";
import Pop from "./Pop";
import Hand, { centerOf, type HandDemo } from "./Hand";
import type { PoseName } from "./Lio";

/**
 * Mini-game 3 angka "cocokkan jumlah": tiga kelompok buah dalam bingkai sepuluh (2 baris × 5, diisi dari
 * baris atas kiri ke kanan) dan tiga kartu angka. Anak MENYERET tiap kartu ke kelompok yang sama banyak.
 * Salah atau dilepas jauh = kartu kembali sendiri.
 */
type Props = { num: NumberLevel; onDone: () => void; onSay: (t: string) => void; onPose: (p: PoseName) => void; ask?: number };

export default function MatchCountGame({ num, onDone, onSay, onPose, ask = 0 }: Props) {
  const [groups] = useState(() => makeMatchCounts(num.n));
  const [cards] = useState(() => shuffle(groups.slice()));
  const [matched, setMatched] = useState<number[]>([]); // nilai yang sudah dipasangkan
  const [wrong, setWrong] = useState<{ v: number; n: number } | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState(-1); // indeks kelompok yang sedang ditimpa kartu
  const [hint, setHint] = useState(0);
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const cardEls = useRef<(HTMLButtonElement | null)[]>([]);
  const demoIdx = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const done = matched.length >= groups.length;

  // Contoh gerakan: menyeret kartu yang belum dipasang ke salah satu kelompok (bergantian),
  // jadi tangan menunjukkan CARANYA tanpa membocorkan pasangannya.
  const demo = (): HandDemo => {
    if (done) return { pts: [] };
    const ci = cards.findIndex((v) => !matched.includes(v));
    const free = groups.map((v, i) => (matched.includes(v) ? -1 : i)).filter((i) => i >= 0);
    const from = centerOf(cardEls.current[ci]);
    const to = centerOf(rows.current[free[demoIdx.current++ % free.length]]);
    return from && to ? { pts: [from, to], glide: true } : { pts: [] };
  };

  /** Kelompok di bawah jari (koordinat layar, diberi kelonggaran), atau -1. */
  const rowAt = (c: { x: number; y: number }) => {
    return rows.current.findIndex((el) => {
      const b = el?.getBoundingClientRect();
      return !!b && c.x > b.left - 12 && c.x < b.right + 12 && c.y > b.top - 8 && c.y < b.bottom + 8;
    });
  };

  function drop(v: number, at: { x: number; y: number }) {
    const g = rowAt(at);
    setDrag(null);
    setOver(-1);
    if (done || matched.includes(v)) return;
    if (g < 0 || matched.includes(groups[g])) { sfx.back(); return; }
    if (groups[g] !== v) {
      sfx.oops();
      onPose("sedih");
      setWrong({ v, n: (wrong?.n ?? 0) + 1 });
      onSay(`Belum pas. Hitung buahnya dulu, lalu cari yang ${NUM[v]}!`);
      return;
    }
    const next = [...matched, v];
    setMatched(next);
    sfx.snap();
    if (next.length >= groups.length) {
      onSay(`Hebat! Semua jumlahnya cocok!`);
      timer.current = setTimeout(onDone, 500);
      return;
    }
    sfx.ding();
    onPose("jempol");
    onSay(`Betul! Itu ${NUM[v]}. Ayo kartu berikutnya!`);
  }

  function tapOnly() {
    audio();
    if (done) return;
    sfx.tick();
    onPose("menunjuk");
    onSay("Seret kartu angkanya ke kelompok buah ya!");
    setHint((h) => h + 1);
  }

  return (
    <>
      <div className="match">
        {groups.map((v, gi) => {
          const ok = matched.includes(v);
          return (
            <Pop key={gi} i={gi} step={0.08} className="match-pop">
              <div
                ref={(node) => { rows.current[gi] = node; }}
                className={`match-row${ok ? " ok" : ""}${over === gi ? " over" : ""}${drag !== null && !ok ? " waiting" : ""}`}
                data-count={v}
              >
                <div className="tframe">
                  {Array.from({ length: 10 }, (_, k) => (
                    <span key={k} className="tcell">{k < v && <img src={num.img} alt="" draggable={false} />}</span>
                  ))}
                </div>
                <div className="match-slot" style={ok ? { background: num.color, color: "#fff" } : undefined}>{ok ? v : ""}</div>
              </div>
            </Pop>
          );
        })}
      </div>
      <div className="qopts match-cards">
        {cards.map((v, i) => {
          const used = matched.includes(v);
          return (
            <Pop key={v} i={i} step={0.08} delay={0.3} className={`shadow-slot${drag === v ? " lifting" : ""}`}>
              <motion.button
                ref={(node) => { cardEls.current[i] = node; }}
                className={`btn ghost qopt shadow-opt match-card${used ? " used" : ""}`}
                aria-label={`Kartu angka ${v}`}
                drag={!used && !done}
                dragSnapToOrigin
                dragMomentum={false}
                dragElastic={0}
                whileDrag={{ scale: 1.16, rotate: -4 }}
                onDragStart={() => { audio(); sfx.lift(); setDrag(v); }}
                onDrag={(_, info) => { const g = rowAt(info.point); if (g !== over) setOver(g); }}
                onDragEnd={(_, info) => drop(v, info.point)}
                onTap={tapOnly}
              >
                <span key={wrong?.v === v ? `w${wrong.n}` : "b"} className={wrong?.v === v ? "nope" : ""}>{v}</span>
              </motion.button>
            </Pop>
          );
        })}
      </div>
      <Hand demo={demo} now={hint + ask} delay={1200} />
    </>
  );
}
