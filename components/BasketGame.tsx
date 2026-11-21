"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { NUM } from "@/data/letters";
import type { NumberLevel } from "@/data/numbers";
import { audio, sfx } from "@/lib/audio";
import { basketTotal } from "@/lib/numGames";
import Pop from "./Pop";
import Hand, { centerOf, type HandDemo } from "./Hand";
import type { PoseName } from "./Lio";

/**
 * Mini-game 3 angka "ambilkan N": tumpukan buah (lebih banyak dari N), anak MENYERET buah satu per satu
 * ke keranjang Lio sambil dihitung. Begitu buah ke-N masuk, mini-game langsung selesai.
 */
type Props = { num: NumberLevel; onDone: () => void; onSay: (t: string) => void; onPose: (p: PoseName) => void; ask?: number };
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export default function BasketGame({ num, onDone, onSay, onPose, ask = 0 }: Props) {
  const { n } = num;
  const fruit = num.fruit.toLowerCase();
  const total = basketTotal(n);
  const [taken, setTaken] = useState<number[]>([]); // indeks buah yang sudah masuk keranjang
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState(false);
  const [hint, setHint] = useState(0);
  const [bump, setBump] = useState(0);
  const basket = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const done = taken.length >= n;

  const demo = (): HandDemo => {
    if (done) return { pts: [] };
    const i = Array.from({ length: total }, (_, k) => k).find((k) => !taken.includes(k));
    const from = i === undefined ? null : centerOf(items.current[i]);
    const to = centerOf(basket.current);
    return from && to ? { pts: [from, to], glide: true } : { pts: [] };
  };

  /** Jari (koordinat layar) ada di atas keranjang? Diberi kelonggaran supaya tidak harus pas. */
  const inBasket = (c: { x: number; y: number }) => {
    const b = basket.current?.getBoundingClientRect();
    return !!b && c.x > b.left - 16 && c.x < b.right + 16 && c.y > b.top - 24 && c.y < b.bottom + 16;
  };

  function drop(i: number, at: { x: number; y: number }) {
    const ok = inBasket(at);
    setDrag(null);
    setOver(false);
    if (done || taken.includes(i)) return;
    if (!ok) { sfx.back(); return; }
    const next = [...taken, i];
    setTaken(next);
    setBump((b) => b + 1);
    sfx.snap();
    sfx.step(next.length - 1); // nada naik tiap hitungan
    if (next.length >= n) {
      onPose("tepuk-tangan");
      onSay(`Pas! ${cap(NUM[n])} ${fruit}. Terima kasih!`);
      timer.current = setTimeout(onDone, 450);
      return;
    }
    onSay(cap(NUM[next.length]) + "!");
  }

  function tapOnly() {
    audio();
    if (done) return;
    sfx.tick();
    onPose("menunjuk");
    onSay(`Seret ${fruit}nya ke keranjang ya!`);
    setHint((h) => h + 1);
  }

  return (
    <>
      <div className={`pile${total > 8 ? " many" : ""}`}>
        {Array.from({ length: total }, (_, i) => {
          const used = taken.includes(i);
          return (
            <Pop key={i} i={i} step={0.04} className={`shadow-slot${drag === i ? " lifting" : ""}`}>
              <motion.button
                ref={(node) => { items.current[i] = node; }}
                className={`pile-item${used ? " used" : ""}`}
                aria-label={fruit}
                drag={!used && !done}
                dragSnapToOrigin
                dragMomentum={false}
                dragElastic={0}
                whileDrag={{ scale: 1.2, rotate: -6 }}
                onDragStart={() => { audio(); sfx.lift(); setDrag(i); }}
                onDrag={(_, info) => { const v = inBasket(info.point); if (v !== over) setOver(v); }}
                onDragEnd={(_, info) => drop(i, info.point)}
                onTap={tapOnly}
              >
                <img src={num.img} alt="" draggable={false} />
              </motion.button>
            </Pop>
          );
        })}
      </div>
      <div ref={basket} className={`basket${over ? " over" : ""}${drag !== null ? " waiting" : ""}`} data-count={taken.length}>
        <div className="basket-in">
          {taken.map((k, j) => (
            <motion.img
              key={k} src={num.img} alt="" draggable={false}
              initial={{ scale: 0, y: -30 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}
              style={{ zIndex: j }}
            />
          ))}
        </div>
        <img key={bump} className={`basket-img${bump ? " bump" : ""}`} src="/ui/basket.webp" alt="Keranjang Lio" draggable={false} />
        {taken.length > 0 && <span key={`n${bump}`} className="basket-n" style={{ background: num.color }}>{taken.length}</span>}
      </div>
      <Hand demo={demo} now={hint + ask} delay={1200} />
    </>
  );
}
