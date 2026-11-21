"use client";

import { useRef, useState } from "react";
import Leaves from "./Leaves";
import Pop from "./Pop";
import Icon from "./Icon";
import { lioSrc } from "./Lio";
import { audio, sfx } from "@/lib/audio";
import { poke } from "@/lib/poke";

const HOLD_MS = 3000;

/** Cover: pemandangan hutan, judul, Lio melambai, tombol Mulai Main. Semua hiasannya bisa diketuk. */
export default function Cover({ onStart, onAskReset }: { onStart: () => void; onAskReset: () => void }) {
  // Reset progres (untuk orang tua): tekan lama logo "Lio" 3 detik (ada lingkaran yang terisi), lalu konfirmasi.
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holding, setHolding] = useState(false);
  const cancel = () => { if (hold.current) clearTimeout(hold.current); hold.current = null; setHolding(false); };
  const press = () => {
    cancel();
    setHolding(true);
    hold.current = setTimeout(() => { setHolding(false); hold.current = null; onAskReset(); }, HOLD_MS);
  };
  /** Ketukan pada hiasan: bereaksi + bunyi kecil. */
  const tap = (cls: string, sound: () => void) => (e: React.PointerEvent) => { audio(); sound(); poke(e.currentTarget, cls); };

  return (
    <section id="start" className="screen on">
      <div className="scene" />
      <div className="cover-floor" />
      {["c1", "c2", "c3"].map((c) => <div key={c} className={`sky-cloud ${c} pokeable`} onPointerDown={tap("poke", sfx.pop)} />)}
      <div className="butterfly"><span className="pokeable" onPointerDown={tap("poke-big", sfx.tick)}><img src="/animals/kupu-kupu.webp" alt="" draggable={false} /></span></div>
      <div className="cover-leaf tr" /><div className="cover-leaf bl" /><div className="cover-leaf br" />
      <Leaves />
      <Pop className="cover-stage" delay={0.38} from={0.6} style={{ transformOrigin: "50% 100%" }}>
        <div className="bush l pokeable" onPointerDown={tap("poke", sfx.rustle)} />
        <div className="bush r pokeable" onPointerDown={tap("poke", sfx.rustle)} />
        <div className="dirt" />
        <div className="rock pokeable" onPointerDown={tap("poke", sfx.tick)} />
        <div className="lio start lio-wave pokeable" role="img" aria-label="Lio si Singa" onPointerDown={tap("poke-up", sfx.boing)}>
          <img className="lw-body" src={lioSrc("depan-melambai")} alt="" draggable={false} />
        </div>
      </Pop>
      <h1>
        <Pop className="t1" delay={0.05}>Belajar Bareng</Pop>
        <Pop
          delay={0.16} from={0.3}
          className={`t2 sparkle${holding ? " holding" : ""}`}
          onPointerDown={press} onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={cancel}
          onContextMenu={(e) => e.preventDefault()}
        >
          Lio
          {holding && <i className="hold-ring" style={{ animationDuration: `${HOLD_MS}ms` }} />}
        </Pop>
      </h1>
      <Pop className="start-wrap" delay={0.6}><button className="btn green" id="btnStart" onClick={onStart}><Icon name="play" /> Mulai Main</button></Pop>
    </section>
  );
}
