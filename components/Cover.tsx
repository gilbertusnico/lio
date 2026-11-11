"use client";

import { useRef } from "react";
import Leaves from "./Leaves";
import { lioSrc } from "./Lio";

/** Cover: pemandangan hutan, judul, Lio melambai, tombol Mulai Main. */
export default function Cover({ onStart, onReset }: { onStart: () => void; onReset: () => void }) {
  // Reset progres (untuk orang tua): tekan lama logo "Lio" 3 detik, lalu konfirmasi.
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = () => { if (hold.current) clearTimeout(hold.current); hold.current = null; };
  const press = () => {
    cancel();
    hold.current = setTimeout(() => {
      if (window.confirm("Hapus semua bintang dan mulai dari awal?")) onReset();
    }, 3000);
  };

  return (
    <section id="start" className="screen on">
      <div className="scene" />
      <div className="sky-cloud c1" /><div className="sky-cloud c2" /><div className="sky-cloud c3" />
      <div className="butterfly"><span><img src="/animals/kupu-kupu.webp" alt="" draggable={false} /></span></div>
      <div className="cover-leaf tr" /><div className="cover-leaf bl" /><div className="cover-leaf br" />
      <Leaves />
      <div className="cover-stage">
        <div className="bush l" /><div className="bush r" /><div className="rock" /><div className="ground" />
        <div className="lio start lio-wave" role="img" aria-label="Lio si Singa">
          <img className="lw-body" src={lioSrc("depan-melambai")} alt="" draggable={false} />
        </div>
      </div>
      <h1>
        <span className="t1">Belajar Bareng</span>
        <span
          className="t2 sparkle"
          onPointerDown={press} onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={cancel}
          onContextMenu={(e) => e.preventDefault()}
        >
          Lio
        </span>
      </h1>
      <div className="sub">🌿 Petualangan Huruf 🌿</div>
      <button className="btn green" id="btnStart" onClick={onStart}>▶ Mulai Main</button>
    </section>
  );
}
