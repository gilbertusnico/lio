"use client";

import { LEAF_SRCS } from "@/lib/leaf";
import { audio, sfx } from "@/lib/audio";
import { poke } from "@/lib/poke";

/** Daun tropis di 4 sudut layar. Bergoyang dan berdesir kalau diketuk. */
export default function Leaves() {
  return (
    <div className="leaves" aria-hidden>
      {(["tl", "tr", "bl", "br"] as const).map((k) => (
        <img
          key={k} src={LEAF_SRCS[k]} alt="" className={`leaf ${k} pokeable`} draggable={false}
          onPointerDown={(e) => { audio(); sfx.rustle(); poke(e.currentTarget, "poke"); }}
        />
      ))}
    </div>
  );
}
