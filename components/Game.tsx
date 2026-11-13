"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { LETTERS } from "@/data/letters";
import { FREE_LETTERS, PAYWALL_ENABLED } from "@/lib/config";
import { audio, musicPref, setMusicPref, sfx, startMusic, stopMusic } from "@/lib/audio";
import { emptyProgress, loadProgress, pickMini3, saveProgress, type Mini3, type Progress } from "@/lib/progress";
import Cover from "./Cover";
import LetterMap from "./LetterMap";
import PlayScreen from "./PlayScreen";
import Leaves from "./Leaves";
import Fx, { type FxHandle } from "./Fx";
import Paywall from "./Paywall";
import Album from "./Album";
import { LIO_POSES, lioSrc, type PoseName } from "./Lio";

type Screen = "start" | "map" | "play";
const PRAISE = ["Bagus!", "Pintar!", "Hebat!", "Keren!"];
const praise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];
const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } };

/** Mesin layar: Cover → Pilih Huruf → (kartu pembuka) → 3 mini-game → layar menang. */
export default function Game() {
  const [screen, setScreen] = useState<Screen>("start");
  const [cur, setCur] = useState(0);
  const [game, setGame] = useState(0);
  const [mini3, setMini3] = useState<Mini3>("count");
  const [round, setRound] = useState(0); // naik tiap mini-game dimulai/diulang → komponen dibuat baru
  const [intro, setIntro] = useState(false);
  const [win, setWin] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [album, setAlbum] = useState(false);
  const [newSticker, setNewSticker] = useState(false);
  const [fly, setFly] = useState<{ from: DOMRect; to: DOMRect } | null>(null);
  const [pay, setPay] = useState<null | "locked" | "win">(null);
  const [bubble, setBubble] = useState("…");
  const [pose, setPoseState] = useState<{ name: PoseName; n: number }>({ name: "menunjuk", n: 0 });
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [musicOn, setMusicOn] = useState(true);
  const fx = useRef<FxHandle>(null);
  const winImg = useRef<HTMLImageElement>(null);
  const albumBtn = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const L = LETTERS[cur];
  const stickerCount = LETTERS.filter((l) => progress.done[l.ch]).length;

  // localStorage baru bisa dibaca setelah halaman statis dihidupkan di browser.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setProgress(loadProgress());
    setMusicOn(musicPref());
    LIO_POSES.forEach((p) => { new Image().src = lioSrc(p); }); // supaya ganti pose tidak berkedip
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Stiker baru: hewan terbang dari Lio ke ikon album.
  useEffect(() => {
    if (!win || !newSticker) { setFly(null); return; }
    const t = setTimeout(() => {
      const a = winImg.current?.getBoundingClientRect();
      const b = albumBtn.current?.getBoundingClientRect();
      if (a && b) setFly({ from: a, to: b });
    }, 520);
    return () => clearTimeout(t);
  }, [win, newSticker]);

  const say = useCallback((t: string) => setBubble(t), []);
  const setPose = useCallback((name: PoseName) => setPoseState((p) => ({ name, n: p.n + 1 })), []);
  const clearTimer = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };
  useEffect(() => clearTimer, []);

  function toggleMusic() {
    const on = !musicOn;
    setMusicOn(on);
    setMusicPref(on);
    if (on) startMusic(); else stopMusic();
  }

  function startLetter(i: number) {
    audio();
    if (PAYWALL_ENABLED && i >= FREE_LETTERS) return setPay("locked");
    clearTimer();
    setCur(i);
    setMini3(pickMini3(progress.last3[LETTERS[i].ch]));
    setWin(false);
    setNewSticker(false);
    setFly(null);
    setIntro(true);
  }

  function startGame(g: number) {
    clearTimer();
    setGame(g);
    setRound((r) => r + 1);
    setScreen("play");
    setPose("menunjuk");
  }

  function gameDone() {
    if (game >= 2) return levelDone();
    sfx.ding();
    setPose("tepuk-tangan");
    say(praise() + " Ayo lanjut!");
    timer.current = setTimeout(() => startGame(game + 1), 1600);
  }

  function levelDone() {
    const next: Progress = { done: { ...progress.done, [L.ch]: true }, last3: { ...progress.last3, [L.ch]: mini3 } };
    setNewSticker(!progress.done[L.ch]);
    setProgress(next);
    saveProgress(next);
    sfx.win();
    fx.current?.confetti();
    timer.current = setTimeout(() => setWin(true), 450);
  }

  function goMap() {
    clearTimer();
    setWin(false);
    setNewSticker(false);
    setFly(null);
    setIntro(false);
    setLeaving(false);
    setScreen("map");
  }

  function resetProgress() {
    const p = emptyProgress();
    setProgress(p);
    saveProgress(p);
  }

  return (
    <MotionConfig reducedMotion="user">
      <Leaves />

      <AnimatePresence mode="wait">
        {screen === "start" && (
          <motion.div key="start" {...fade}>
            <Cover
              onStart={() => { audio(); if (musicOn) startMusic(); setScreen("map"); }}
              onReset={resetProgress}
            />
          </motion.div>
        )}
        {screen === "map" && (
          <motion.div key="map" {...fade}>
            <LetterMap progress={progress} onPick={startLetter} onAlbum={() => { audio(); setAlbum(true); }} />
          </motion.div>
        )}
        {screen === "play" && (
          <motion.div key="play" {...fade}>
            <PlayScreen
              letter={L} game={game} mini3={mini3} round={round}
              bubble={bubble} pose={pose} musicOn={musicOn}
              onSay={say} onPose={setPose} onGameDone={gameDone}
              onBack={() => setLeaving(true)} onRetry={() => startGame(game)} onJump={(g) => { if (g < game) startGame(g); }} onToggleMusic={toggleMusic}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kartu pembuka: kenalan huruf + hewannya */}
      <AnimatePresence>
        {intro && (
          <motion.div key="intro" className="overlay on" id="intro" {...fade}>
            <div className="panel">
              <div className="intro-row">
                <div className="intro-letter" style={{ color: L.color }}>{L.ch} {L.ch.toLowerCase()}</div>
                <img className="big-emoji" src={L.img} alt={L.word} draggable={false} />
              </div>
              <h3 className="intro-word">{L.ch} untuk {L.word}</h3>
              <div className="row" style={{ justifyContent: "center", marginTop: 12 }}>
                <button className="btn ghost" onClick={goMap} aria-label="Kembali">↩</button>
                <button className="btn green" id="introGo" onClick={() => { audio(); setIntro(false); startGame(0); }}>Mulai ▶</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tombol 🗺️ saat main: tanya dulu, supaya tidak keluar karena kepencet */}
      <AnimatePresence>
        {leaving && screen === "play" && (
          <motion.div key="leave" className="overlay on" id="leave" {...fade}>
            <div className="panel">
              <img className="leave-lio" src={lioSrc("sedih")} alt="" draggable={false} />
              <h3 className="leave-title">Berhenti main?</h3>
              <div className="leave-btns">
                <button className="btn green" id="leaveNo" onClick={() => setLeaving(false)}>▶ Lanjut main</button>
                <button className="btn ghost" id="leaveYes" onClick={goMap}>🗺️ Keluar</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layar menang */}
      <AnimatePresence>
        {win && (
          <motion.div key="win" className="overlay light on" id="win" {...fade}>
            <Leaves />
            {fly && (
              <motion.img
                className="fly-sticker" src={L.img} alt="" draggable={false}
                initial={{ left: fly.from.left + fly.from.width / 2 - 44, top: fly.from.top + fly.from.height / 2 - 44, width: 88, height: 88, opacity: 1, rotate: 0 }}
                animate={{ left: fly.to.left + fly.to.width / 2 - 20, top: fly.to.top + fly.to.height / 2 - 20, width: 40, height: 40, opacity: 0.9, rotate: 18 }}
                transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
                onAnimationComplete={() => setFly(null)}
              />
            )}
            <button
              ref={albumBtn} className="album-chip win-album" id="winAlbum"
              onClick={() => { audio(); setAlbum(true); }} aria-label="Buka album stiker"
            >
              📒 <b>{stickerCount}</b>
            </button>
            {newSticker && <div className="stiker-baru">Stiker baru!</div>}
            <div className="panel">
              <div className="win-row"><img ref={winImg} className="lio lio-win" src={lioSrc("lompat")} alt="Lio" draggable={false} /></div>
              <h3 id="winText">Huruf {L.ch} selesai!</h3>
              <div className="stars"><span>⭐</span><span>⭐</span><span>⭐</span></div>
              <div className="row" style={{ justifyContent: "center", marginTop: 16 }}>
                <button className="btn ghost" id="winRetry" onClick={() => { setWin(false); setMini3(pickMini3(mini3)); startGame(0); }}>↺ Lagi</button>
                <button
                  className="btn green" id="winNext"
                  onClick={() => {
                    if (PAYWALL_ENABLED && cur + 1 >= FREE_LETTERS) { setWin(false); setScreen("map"); setPay("win"); }
                    else if (cur < LETTERS.length - 1) startLetter(cur + 1);
                    else goMap();
                  }}
                >
                  Lanjut ➜
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{pay && <Paywall key="pay" fromWin={pay === "win"} onClose={() => setPay(null)} />}</AnimatePresence>

      {album && <Album progress={progress} onClose={() => setAlbum(false)} />}

      {screen === "map" && !intro && (
        <button className="btn ghost icon-btn home-float" id="btnHome" style={{ display: "block" }} aria-label="Kembali ke beranda" onClick={() => { audio(); setScreen("start"); }}>
          🏠
        </button>
      )}
      {screen !== "play" && (
        <button className={`btn ghost icon-btn music-btn music-float${musicOn ? "" : " off"}`} aria-label="Musik" onClick={toggleMusic}>
          {musicOn ? "🎵" : "🔇"}
        </button>
      )}
      <Fx ref={fx} />

      {/* HP dimiringkan: minta diputar tegak (tampil lewat CSS, lihat .rotate-hint) */}
      <div className="rotate-hint" aria-hidden>
        <div className="rotate-phone">📱</div>
        <img src={lioSrc("menunjuk")} alt="" draggable={false} />
        <p>Putar HP-nya dulu ya!</p>
      </div>
    </MotionConfig>
  );
}
