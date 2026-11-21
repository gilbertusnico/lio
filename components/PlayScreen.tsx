"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Letter } from "@/data/letters";
import type { NumberLevel } from "@/data/numbers";
import { GLYPHS } from "@/data/glyphs";
import { NUM_GLYPHS } from "@/data/numberGlyphs";
import type { Mini3, NumMini3 } from "@/lib/progress";
import TraceBoard from "./TraceBoard";
import FindGame from "./FindGame";
import CountGame from "./CountGame";
import ShadowGame from "./ShadowGame";
import MatchCountGame from "./MatchCountGame";
import BasketGame from "./BasketGame";
import FindNumberGame from "./FindNumberGame";
import Critter from "./Critter";
import FruitHang from "./FruitHang";
import { motion } from "motion/react";
import Pop from "./Pop";
import Icon from "./Icon";
import Emo from "./Emo";
import { audio, sfx } from "@/lib/audio";
import { poke } from "@/lib/poke";
import { LioTalk, type PoseName } from "./Lio";

/** Level yang dimainkan: satu huruf (Petualangan Huruf) atau satu angka (Petualangan Angka). */
export type Level = { kind: "huruf"; letter: Letter } | { kind: "angka"; num: NumberLevel };

type Props = {
  level: Level;
  game: number;
  mini3: Mini3 | NumMini3;
  round: number;
  /** > 0 saat mini-game ronde ini baru saja selesai: tampilkan centang besar. */
  flash: number;
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
  const { level, game, mini3 } = p;
  const L = level.kind === "huruf" ? level.letter : null;
  const N = level.kind === "angka" ? level.num : null;
  const color = L ? L.color : N!.color;
  const [size, setSize] = useState(320);
  const [strokes, setStrokes] = useState({ total: 0, done: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  // Tombol Ulangi di mini-game 1 mengulang bentuk yang sedang ditebalkan (kapital ATAU kecil), bukan dari awal.
  const [trace, setTrace] = useState({ round: -1, lower: false, n: 0 });
  const tr = trace.round === p.round ? trace : { round: p.round, lower: false, n: 0 };
  const said = useRef(-1);
  const [ask, setAsk] = useState(0); // naik tiap Lio diketuk → tangan penunjuk mencontohkan lagi

  useEffect(() => {
    const fit = () => setSize(boardSize());
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Teks per level: judul, ikon langkah, dan instruksi awal mini-game 2 dan 3 (mini-game 1 mengucapkannya sendiri).
  let steps: ReactNode[], title: string, intro: string;
  if (L) {
    const lo = L.ch.toLowerCase();
    const word = L.word === "Lio" ? "Lio" : L.word.toLowerCase();
    // Ikon langkah: pensil, kaca pembesar, lalu angka (hitung) atau bayangan hewan huruf ini (cocokkan bayangan).
    steps = [
      <Emo key="a" name="pencil" />,
      <Emo key="b" name="find" />,
      mini3 === "count" ? <Emo key="c" name="count" /> : <img key="c" className="emo step-shadow" src={L.img} alt="" draggable={false} />,
    ];
    title = [`Tebalkan huruf ${L.ch}`, `Ketuk semua ${L.ch} dan ${lo}!`, mini3 === "count" ? `Hitung ${word}` : "Bayangan siapa ini?"][game];
    intro = game === 1
      ? `Cari dan ketuk semua huruf ${L.ch} besar dan ${lo} kecil! Ada empat.`
      : mini3 === "count" ? `Ada berapa ${word}? Ketuk satu-satu untuk menghitung, lalu pilih angkanya.` : "Seret gambar yang cocok ke bayangannya!";
  } else {
    const fruit = N!.fruit.toLowerCase();
    steps = [
      <Emo key="a" name="pencil" />,
      <Emo key="b" name="count" />,
      <Emo key="c" name={mini3 === "match" ? "puzzle" : mini3 === "basket" ? "basket" : "find"} />,
    ];
    const t3 = { match: "Cocokkan jumlahnya", basket: `Ambilkan ${N!.n} ${fruit}`, findnum: `Ketuk semua angka ${N!.n}!` };
    const i3 = {
      match: "Seret tiap kartu angka ke kelompok buah yang sama banyak!",
      basket: `Lio minta ${N!.n} ${fruit}. Seret ${fruit}nya ke keranjang satu per satu!`,
      findnum: `Cari dan ketuk semua angka ${N!.n}! Ada tiga.`,
    };
    title = [`Tebalkan angka ${N!.n}`, `Hitung ${fruit}`, t3[mini3 as NumMini3] ?? ""][game];
    intro = game === 1 ? `Ada berapa ${fruit}? Ketuk satu-satu untuk menghitung, lalu pilih angkanya.` : i3[mini3 as NumMini3] ?? "";
  }

  const { onSay, round } = p;
  useEffect(() => {
    if (said.current === round) return;
    said.current = round;
    if (game > 0) onSay(intro);
  }, [round, game, intro, onSay]);

  const common = { onDone: p.onGameDone, onSay: p.onSay, onPose: p.onPose, ask };
  // Hewan/buah yang jalan di atas papan. Tidak tampil saat ada yang harus dihitung atau ditebak.
  // Hewan huruf jalan-jalan; buah angka tergantung di ranting (lihat FruitHang).
  const critter = L && game < 2 ? { img: L.img, motion: L.motion } : null;
  const glyph = L ? GLYPHS[L.ch] : { upper: NUM_GLYPHS[N!.n], lower: undefined };

  return (
    <section id="play" className="screen on">
      <Pop className="top" from={0.8}>
        <button className="btn ghost icon-btn" id="btnBack" aria-label={L ? "Kembali ke Pilih Huruf" : "Kembali ke Pilih Angka"} onClick={p.onBack}><Emo name="map" /></button>
        <div className="title" id="playTitle">{title}</div>
        <button className={`btn ghost icon-btn music-btn${p.musicOn ? "" : " off"}`} aria-label="Musik" onClick={p.onToggleMusic}>
          <Emo name={p.musicOn ? "music" : "mute"} />
        </button>
      </Pop>
      <div className="steps" id="steps">
        {steps.map((icon, i) => (
          <Pop key={i} i={i} step={0.07} delay={0.1}>
          <button
            className={`step${i < game ? " done" : ""}${i === game ? " on" : ""}`}
            disabled={i >= game}
            onClick={() => p.onJump(i)}
            aria-label={i < game ? `Main lagi langkah ${i + 1}` : `Langkah ${i + 1}`}
          >
            {i < game ? <Icon name="check" size={26} /> : icon}
          </button>
          </Pop>
        ))}
      </div>
      <Pop className="card-pop" delay={0.18} from={0.7}>
      <div
        ref={cardRef}
        onAnimationEnd={(e) => { if (e.target === e.currentTarget) e.currentTarget.classList.remove("shake"); }}
        className={`card${game > 0 ? " q" : ""}`}
        id="card"
        style={{ ["--s" as string]: size + "px" }}
      >
        {/* Hewan tidak tampil di mini-game 3 (buah angka: hanya saat menebalkan) supaya tidak ikut terhitung / membocorkan jawaban */}
        {critter && <Critter key={`c${p.round}`} img={critter.img} motion={critter.motion} pose={p.pose.name} n={p.pose.n} />}
        {N && game === 0 && <FruitHang key={`f${p.round}`} img={N.img} pose={p.pose.name} n={p.pose.n} dropped={p.flash > 0} />}
        {game === 0 ? (
          <Pop key={`t${p.round}-${tr.n}`} from={0.85}>
          <TraceBoard
            key={`${p.round}-${tr.n}`} upper={glyph.upper} lower={glyph.lower} kind={level.kind} color={color} size={size}
            ask={ask} startLower={tr.lower} onLower={() => setTrace({ ...tr, lower: true })}
            onDone={p.onGameDone} onSay={p.onSay} onPose={p.onPose}
            onOops={() => {
              // Papan goyang tanpa membuat ulang papan, supaya goresan yang sudah jadi tidak hilang.
              const el = cardRef.current;
              if (el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
              p.onPose("sedih");
            }}
            onStrokes={setStrokes}
          />
          </Pop>
        ) : (
          <div className="quiz" id="quiz" style={{ width: size, height: size }}>
            {L && game === 1 && <FindGame key={p.round} letter={L} {...common} />}
            {L && game === 2 && mini3 === "count" && (
              <CountGame key={p.round} img={L.img} word={L.word === "Lio" ? "Lio" : L.word.toLowerCase()} {...common} />
            )}
            {L && game === 2 && mini3 === "shadow" && <ShadowGame key={p.round} letter={L} {...common} />}
            {N && game === 1 && <CountGame key={p.round} img={N.img} word={N.fruit.toLowerCase()} n={N.n} {...common} />}
            {N && game === 2 && mini3 === "match" && <MatchCountGame key={p.round} num={N} {...common} />}
            {N && game === 2 && mini3 === "basket" && <BasketGame key={p.round} num={N} {...common} />}
            {N && game === 2 && mini3 === "findnum" && <FindNumberGame key={p.round} num={N} {...common} />}
          </div>
        )}
        {p.flash > 0 && (
          <motion.div
            key={p.flash} className="done-check" aria-hidden
            initial={{ scale: 0, opacity: 0, rotate: -25 }}
            animate={{ scale: [0, 1.25, 1, 1, 0.9], opacity: [0, 1, 1, 1, 0], rotate: [-25, 6, 0, 0, 0] }}
            transition={{ duration: 1.25, times: [0, 0.22, 0.34, 0.8, 1], ease: "easeOut" }}
          >
            <Icon name="check" size="100%" />
          </motion.div>
        )}
      </div>
      </Pop>
      <div className="dots" id="dots" style={{ visibility: game === 0 ? "visible" : "hidden" }}>
        {Array.from({ length: strokes.total }, (_, i) => (
          <div key={i} className={`dot${i < strokes.done ? " done" : ""}`} style={i < strokes.done ? { background: color } : undefined} />
        ))}
      </div>
      <Pop className="talk" delay={0.3} from={0.7}>
        {/* Lio bisa diketuk: melompat, dan tangan penunjuk mencontohkan lagi apa yang harus dilakukan */}
        <span className="pokeable lio-tap" onPointerDown={(e) => { audio(); sfx.boing(); poke(e.currentTarget, "poke-up"); setAsk((n) => n + 1); }}>
          <LioTalk pose={p.pose.name} n={p.pose.n} />
        </span>
        <div className="bubble" id="bubble">{p.bubble}</div>
        {/* Ulangi: ikon kecil di samping gelembung, jauh dari papan supaya tidak kepencet saat menggores */}
        <button
          className="btn ghost icon-btn retry-btn" id="btnRetry" aria-label="Ulangi"
          onClick={() => {
            if (game === 0 && tr.lower && L) { setTrace({ ...tr, n: tr.n + 1 }); p.onPose("menunjuk"); }
            else p.onRetry();
          }}
        >
          <Icon name="retry" />
        </button>
      </Pop>
    </section>
  );
}
