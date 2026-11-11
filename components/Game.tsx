"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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
  const [pay, setPay] = useState<null | "locked" | "win">(null);
  const [bubble, setBubble] = useState("…");
  const [pose, setPoseState] = useState<{ name: PoseName; n: number }>({ name: "menunjuk", n: 0 });
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [musicOn, setMusicOn] = useState(true);
  const fx = useRef<FxHandle>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const L = LETTERS[cur];

  // localStorage baru bisa dibaca setelah halaman statis dihidupkan di browser.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setProgress(loadProgress());
    setMusicOn(musicPref());
    LIO_POSES.forEach((p) => { new Image().src = lioSrc(p); }); // supaya ganti pose tidak berkedip
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

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
    setProgress(next);
    saveProgress(next);
    sfx.win();
    fx.current?.confetti();
    timer.current = setTimeout(() => setWin(true), 450);
  }

  function goMap() {
    clearTimer();
    setWin(false);
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
    <>
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
            <LetterMap progress={progress} onPick={startLetter} />
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
            <div className="panel">
              <div className="win-row"><img className="lio lio-win" src={lioSrc("lompat")} alt="Lio" draggable={false} /></div>
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
    </>
  );
}
