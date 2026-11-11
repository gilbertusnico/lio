"use client";

import { useEffect, useRef, useState } from "react";
import type { Letter } from "@/data/letters";
import type { Mini3 } from "@/lib/progress";
import TraceBoard from "./TraceBoard";
import FindGame from "./FindGame";
import CountGame from "./CountGame";
import ShadowGame from "./ShadowGame";
import Critter from "./Critter";
import { LioTalk, type PoseName } from "./Lio";

type Props = {
  letter: Letter;
  game: number;
  mini3: Mini3;
  round: number;
  bubble: string;
  pose: { name: PoseName; n: number };
  musicOn: boolean;
  onSay: (t: string) => void;
  onPose: (p: PoseName) => void;
  onGameDone: () => void;
  onBack: () => void;
  onRetry: () => void;
  /** Ketuk ikon langkah yang sudah selesai (✅) untuk memainkan mini-game itu lagi. */
  onJump: (game: number) => void;
  onToggleMusic: () => void;
};

/** Sisi papan: sebesar mungkin, tetapi bar atas, langkah, Lio, dan tombol tetap muat di layar. */
function boardSize() {
  const avail = window.innerHeight - 330;
  return Math.round(Math.max(220, Math.min(window.innerWidth - 52, avail, 560)));
}

export default function PlayScreen(p: Props) {
  const { letter: L, game, mini3 } = p;
  const lo = L.ch.toLowerCase();
  const word = L.word === "Lio" ? "Lio" : L.word.toLowerCase();
  const [size, setSize] = useState(320);
  const [strokes, setStrokes] = useState({ total: 0, done: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  // Tombol Ulangi di mini-game 1 mengulang bentuk yang sedang ditebalkan (kapital ATAU kecil), bukan dari awal.
  const [trace, setTrace] = useState({ round: -1, lower: false, n: 0 });
  const tr = trace.round === p.round ? trace : { round: p.round, lower: false, n: 0 };
  const said = useRef(-1);

  useEffect(() => {
    const fit = () => setSize(boardSize());
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const steps = ["✏️", "🔍", mini3 === "count" ? "🔢" : "🌗"];
  const title = [
    `Tebalkan huruf ${L.ch}`,
    `Ketuk semua ${L.ch} dan ${lo}!`,
    mini3 === "count" ? `Hitung ${word}` : "Bayangan siapa ini?",
  ][game];

  // Instruksi awal mini-game 2 dan 3 (mini-game 1 mengucapkannya sendiri).
  const { onSay, round } = p;
  useEffect(() => {
    if (said.current === round) return;
    said.current = round;
    if (game === 1) onSay(`Cari dan ketuk semua huruf ${L.ch} besar dan ${lo} kecil! Ada empat.`);
    if (game === 2)
      onSay(mini3 === "count" ? `Ada berapa ${word}? Ketuk satu-satu untuk menghitung, lalu pilih angkanya.` : "Bayangan siapa ini? Pilih gambar yang cocok!");
  }, [round, game, mini3, L, lo, word, onSay]);

  const common = { letter: L, onDone: p.onGameDone, onSay: p.onSay, onPose: p.onPose };

  return (
    <section id="play" className="screen on">
      <div className="top">
        <button className="btn ghost icon-btn" id="btnBack" aria-label="Kembali ke Pilih Huruf" onClick={p.onBack}>🗺️</button>
        <div className="title" id="playTitle">{title}</div>
        <button className={`btn ghost icon-btn music-btn${p.musicOn ? "" : " off"}`} aria-label="Musik" onClick={p.onToggleMusic}>
          {p.musicOn ? "🎵" : "🔇"}
        </button>
      </div>
      <div className="steps" id="steps">
        {steps.map((icon, i) => (
          <button
            key={i}
            className={`step${i < game ? " done" : ""}${i === game ? " on" : ""}`}
            disabled={i >= game}
            onClick={() => p.onJump(i)}
            aria-label={i < game ? `Main lagi langkah ${i + 1}` : `Langkah ${i + 1}`}
          >
            {i < game ? "✅" : icon}
          </button>
        ))}
      </div>
      <div
        ref={cardRef}
        onAnimationEnd={(e) => { if (e.target === e.currentTarget) e.currentTarget.classList.remove("shake"); }}
        className={`card${game > 0 ? " q" : ""}`}
        id="card"
        style={{ ["--s" as string]: size + "px" }}
      >
        {/* Hewan tidak tampil di mini-game 3 supaya tidak ikut terhitung / membocorkan bayangan */}
        {game < 2 && <Critter key={`c${p.round}`} letter={L} pose={p.pose.name} n={p.pose.n} />}
        {game === 0 ? (
          <TraceBoard
            key={`${p.round}-${tr.n}`} letter={L} size={size}
            startLower={tr.lower} onLower={() => setTrace({ ...tr, lower: true })}
            onDone={p.onGameDone} onSay={p.onSay} onPose={p.onPose}
            onOops={() => {
              // Papan goyang tanpa membuat ulang papan, supaya goresan yang sudah jadi tidak hilang.
              const el = cardRef.current;
              if (el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
              p.onPose("sedih");
            }}
            onStrokes={setStrokes}
          />
        ) : (
          <div className="quiz" id="quiz" style={{ width: size, height: size }}>
            {game === 1 && <FindGame key={p.round} {...common} />}
            {game === 2 && mini3 === "count" && <CountGame key={p.round} {...common} />}
            {game === 2 && mini3 === "shadow" && <ShadowGame key={p.round} {...common} />}
          </div>
        )}
      </div>
      <div className="dots" id="dots" style={{ visibility: game === 0 ? "visible" : "hidden" }}>
        {Array.from({ length: strokes.total }, (_, i) => (
          <div key={i} className={`dot${i < strokes.done ? " done" : ""}`} style={i < strokes.done ? { background: L.color } : undefined} />
        ))}
      </div>
      <div className="talk">
        <LioTalk pose={p.pose.name} n={p.pose.n} />
        <div className="bubble" id="bubble">{p.bubble}</div>
        {/* Ulangi: ikon kecil di samping gelembung, jauh dari papan supaya tidak kepencet saat menggores */}
        <button
          className="btn ghost icon-btn retry-btn" id="btnRetry" aria-label="Ulangi"
          onClick={() => {
            if (game === 0 && tr.lower) { setTrace({ ...tr, n: tr.n + 1 }); p.onPose("menunjuk"); }
            else p.onRetry();
          }}
        >
          ↺
        </button>
      </div>
    </section>
  );
}
