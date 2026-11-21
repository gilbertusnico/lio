"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { LETTERS } from "@/data/letters";
import { NUMBERS } from "@/data/numbers";
import { FREE_LETTERS, PAYWALL_ENABLED } from "@/lib/config";
import { audio, musicPref, setMusicPref, sfx, startMusic, stopMusic } from "@/lib/audio";
import {
  emptyNumProgress, emptyProgress, loadNumProgress, loadProgress, pickMini3, pickNumMini3, saveNumProgress, saveProgress,
  type Mini3, type NumMini3, type NumProgress, type Progress,
} from "@/lib/progress";
import Cover from "./Cover";
import LessonMenu from "./LessonMenu";
import LetterMap from "./LetterMap";
import NumberMap from "./NumberMap";
import PlayScreen, { type Level } from "./PlayScreen";
import Leaves from "./Leaves";
import Fx, { type FxHandle } from "./Fx";
import Paywall from "./Paywall";
import Album from "./Album";
import Icon from "./Icon";
import Emo from "./Emo";
import Pop from "./Pop";
import { poke } from "@/lib/poke";
import { LIO_POSES, lioSrc, type PoseName } from "./Lio";

type Screen = "start" | "menu" | "map" | "nummap" | "play";
const PRAISE = ["Bagus!", "Pintar!", "Hebat!", "Keren!"];
const praise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];
const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } };

/**
 * Mesin layar: Cover → Pilih Pelajaran (Huruf / Angka) → Pilih Huruf / Pilih Angka → (kartu pembuka)
 * → 3 mini-game → layar menang. `lesson` menentukan apakah `cur` menunjuk ke LETTERS atau NUMBERS.
 */
export default function Game() {
  const [screen, setScreen] = useState<Screen>("start");
  const [lesson, setLesson] = useState<"huruf" | "angka">("huruf");
  const [cur, setCur] = useState(0);
  const [game, setGame] = useState(0);
  const [mini3, setMini3] = useState<Mini3 | NumMini3>("count");
  const [round, setRound] = useState(0); // naik tiap mini-game dimulai/diulang → komponen dibuat baru
  const [intro, setIntro] = useState(false);
  const [win, setWin] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [album, setAlbum] = useState(false);
  const [resetAsk, setResetAsk] = useState(false);
  const [newSticker, setNewSticker] = useState(false);
  const [fly, setFly] = useState<{ from: DOMRect; to: DOMRect } | null>(null);
  const [flash, setFlash] = useState({ round: -1, n: 0 }); // centang "selesai" untuk mini-game di ronde ini
  const [landed, setLanded] = useState(false); // stiker baru sudah sampai di ikon album
  const [pay, setPay] = useState<null | "locked" | "win">(null);
  const [bubble, setBubble] = useState("…");
  const [pose, setPoseState] = useState<{ name: PoseName; n: number }>({ name: "menunjuk", n: 0 });
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [numProgress, setNumProgress] = useState<NumProgress>(emptyNumProgress);
  const [musicOn, setMusicOn] = useState(true);
  const fx = useRef<FxHandle>(null);
  const stickerImg = useRef<HTMLImageElement>(null);
  const leavingRef = useRef(false);
  const pending = useRef<null | (() => void)>(null);
  const albumBtn = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNum = lesson === "angka";
  const L = LETTERS[isNum ? 0 : cur];
  const N = NUMBERS[isNum ? cur : 0];
  const level: Level = isNum ? { kind: "angka", num: N } : { kind: "huruf", letter: L };
  const stickerCount = LETTERS.filter((l) => progress.done[l.ch]).length;
  const numCount = NUMBERS.filter((l) => numProgress.done[l.n]).length;
  const allDone = isNum ? numCount === NUMBERS.length : stickerCount === LETTERS.length;
  /** Gambar dan nama stiker level ini: hewan (huruf) atau buah (angka). */
  const sticker = isNum ? { img: N.img, name: N.fruit } : { img: L.img, name: L.word };

  // localStorage baru bisa dibaca setelah halaman statis dihidupkan di browser.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setProgress(loadProgress());
    setNumProgress(loadNumProgress());
    setMusicOn(musicPref());
    LIO_POSES.forEach((p) => { new Image().src = lioSrc(p); }); // supaya ganti pose tidak berkedip
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Stiker baru: muncul di samping Lio, lalu terbang ke ikon album di pojok kanan atas.
  useEffect(() => {
    if (!win || !newSticker || isNum) return; // album angka belum ada (tahap 4): stiker buah tidak terbang
    const t = setTimeout(() => {
      const a = stickerImg.current?.getBoundingClientRect();
      const b = albumBtn.current?.getBoundingClientRect();
      if (a && b) { setFly({ from: a, to: b }); sfx.whoosh(); }
    }, 1700);
    return () => clearTimeout(t);
  }, [win, newSticker, isNum]);
  useEffect(() => { leavingRef.current = leaving; });

  // ---- Anti kepencet (butir 10) ----
  // Tombol back HP mundur satu layar di dalam game, tidak langsung keluar dari halaman.
  const backRef = useRef<() => boolean>(() => false);
  useEffect(() => {
    backRef.current = () => {
      if (resetAsk) { setResetAsk(false); return true; }
      if (album) { setAlbum(false); return true; }
      if (pay) { setPay(null); return true; }
      if (leaving) { setLeaving(false); const fn = pending.current; pending.current = null; fn?.(); return true; }
      if (win) { goMap(); return true; }
      if (intro) { setIntro(false); return true; }
      if (screen === "play") { setLeaving(true); return true; }
      if (screen === "map" || screen === "nummap") { setScreen("menu"); return true; }
      if (screen === "menu") { setScreen("start"); return true; }
      return false; // di cover: biarkan browser keluar seperti biasa
    };
  });
  useEffect(() => {
    history.pushState({ lio: 1 }, "");
    const onPop = () => { if (backRef.current()) history.pushState({ lio: 1 }, ""); };
    // Menu "Simpan gambar" saat ditekan lama, cubit-zoom dan ketuk-dua-kali-zoom di iPhone.
    const block = (e: Event) => e.preventDefault();
    const pinch = (e: TouchEvent) => { if (e.touches.length > 1) e.preventDefault(); };
    // Bunyi "tap" untuk semua tombol. Tombol jawaban (gelembung, hewan, angka, stiker, gambar seret)
    // tidak ikut, karena sudah punya bunyinya sendiri.
    const tapSound = (e: Event) => {
      const b = (e.target as Element | null)?.closest?.("button");
      if (b && !b.matches(".qb, .qitem, .qopt, .sticker, .shadow-opt, .pile-item, :disabled")) { audio(); sfx.tap(); }
    };
    document.addEventListener("click", tapSound, true);
    window.addEventListener("popstate", onPop);
    document.addEventListener("contextmenu", block);
    document.addEventListener("gesturestart", block);
    document.addEventListener("dblclick", block);
    document.addEventListener("touchmove", pinch, { passive: false });
    return () => {
      document.removeEventListener("click", tapSound, true);
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("gesturestart", block);
      document.removeEventListener("dblclick", block);
      document.removeEventListener("touchmove", pinch);
    };
  }, []);

  const say = useCallback((t: string) => setBubble(t), []);
  const setPose = useCallback((name: PoseName) => setPoseState((p) => ({ name, n: p.n + 1 })), []);
  const clearTimer = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; pending.current = null; };
  /**
   * Menjalankan langkah berikutnya setelah jeda. Kalau saat itu dialog "Berhenti main?" sedang terbuka,
   * langkahnya ditahan sampai anak memilih "Lanjut main" (dulu game jalan terus di balik dialog).
   */
  const after = (fn: () => void, ms: number) => {
    timer.current = setTimeout(() => {
      timer.current = null;
      if (leavingRef.current) pending.current = fn;
      else fn();
    }, ms);
  };
  const resetSticker = () => { setNewSticker(false); setFly(null); setLanded(false); };
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
    setLesson("huruf");
    setCur(i);
    setMini3(pickMini3(progress.last3[LETTERS[i].ch]));
    setWin(false);
    resetSticker();
    setIntro(true);
    setTimeout(() => sfx.appear(), 120); // kartu pembuka muncul
  }

  function startNumber(i: number) {
    audio();
    clearTimer();
    setLesson("angka");
    setCur(i);
    setMini3(pickNumMini3(numProgress.last3[NUMBERS[i].n]));
    setWin(false);
    resetSticker();
    setIntro(true);
    setTimeout(() => sfx.appear(), 120);
  }

  function startGame(g: number) {
    clearTimer();
    setGame(g);
    setRound((r) => r + 1);
    setScreen("play");
    setPose("menunjuk");
  }

  function gameDone() {
    // Tiap mini-game selesai: centang besar + bunyi "berhasil".
    setFlash((f) => ({ round, n: f.n + 1 }));
    sfx.correct();
    setPose("tepuk-tangan");
    if (game >= 2) return levelDone();
    say(praise() + " Ayo lanjut!");
    after(() => { sfx.appear(); startGame(game + 1); }, 1700);
  }

  function levelDone() {
    if (isNum) {
      const k = String(N.n);
      const next: NumProgress = { done: { ...numProgress.done, [k]: true }, last3: { ...numProgress.last3, [k]: mini3 as NumMini3 } };
      setNewSticker(!numProgress.done[k]);
      setNumProgress(next);
      saveNumProgress(next);
    } else {
      const next: Progress = { done: { ...progress.done, [L.ch]: true }, last3: { ...progress.last3, [L.ch]: mini3 as Mini3 } };
      setNewSticker(!progress.done[L.ch]);
      setProgress(next);
      saveProgress(next);
    }
    setLanded(false);
    setFly(null);
    // Beri waktu centangnya terlihat, baru layar menang dengan fanfare dan konfeti.
    after(() => { sfx.win(); sfx.stars(); fx.current?.confetti(); setWin(true); }, 1150);
  }

  function goMap() {
    clearTimer();
    setWin(false);
    resetSticker();
    setIntro(false);
    setLeaving(false);
    setScreen(lesson === "angka" ? "nummap" : "map");
  }

  function resetProgress() {
    const p = emptyProgress();
    setProgress(p);
    saveProgress(p);
    const n = emptyNumProgress();
    setNumProgress(n);
    saveNumProgress(n);
  }

  return (
    <MotionConfig reducedMotion="user">
      <Leaves />

      <AnimatePresence mode="wait">
        {screen === "start" && (
          <motion.div key="start" {...fade}>
            <Cover
              onStart={() => { audio(); if (musicOn) startMusic(); setScreen("menu"); }}
              onAskReset={() => setResetAsk(true)}
            />
          </motion.div>
        )}
        {screen === "menu" && (
          <motion.div key="menu" {...fade}>
            <LessonMenu
              letterStars={stickerCount} numberStars={Object.values(numProgress.done).filter(Boolean).length}
              onLetters={() => { audio(); setScreen("map"); }} onNumbers={() => { audio(); setScreen("nummap"); }}
            />
          </motion.div>
        )}
        {screen === "nummap" && (
          <motion.div key="nummap" {...fade}>
            <NumberMap progress={numProgress} onPick={startNumber} />
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
              level={level} game={game} mini3={mini3} round={round} flash={flash.round === round ? flash.n : 0}
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
                <div className="intro-letter" style={{ color: isNum ? N.color : L.color }}>{isNum ? N.n : `${L.ch} ${L.ch.toLowerCase()}`}</div>
                <img
                  className="big-emoji pokeable" src={sticker.img} alt={sticker.name} draggable={false}
                  onPointerDown={(e) => { audio(); sfx.pop(); poke(e.currentTarget, "poke"); }}
                />
              </div>
              <h3 className="intro-word">{isNum ? N.word : `${L.ch} untuk ${L.word}`}</h3>
              {isNum && (
                <div className={`intro-fruits${N.n > 5 ? " two" : ""}`} aria-label={`${N.n} ${N.fruit}`}>
                  {Array.from({ length: N.n }, (_, i) => (
                    <Pop key={i} i={i} step={0.06} delay={0.25}>
                      <img
                        className="pokeable" src={N.img} alt="" draggable={false}
                        onPointerDown={(e) => { audio(); sfx.step(i); poke(e.currentTarget, "poke"); }}
                      />
                    </Pop>
                  ))}
                </div>
              )}
              <div className="row" style={{ justifyContent: "center", marginTop: 12 }}>
                <button className="btn ghost" id="introBack" onClick={goMap} aria-label="Kembali"><Icon name="back" /></button>
                <button className="btn green" id="introGo" onClick={() => { audio(); setIntro(false); startGame(0); }}>Mulai <Icon name="play" /></button>
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
                <button className="btn green" id="leaveNo" onClick={() => { setLeaving(false); const fn = pending.current; pending.current = null; fn?.(); }}><Icon name="play" /> Lanjut main</button>
                <button className="btn ghost" id="leaveYes" onClick={goMap}><Emo name="map" /> Keluar</button>
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
                className="fly-sticker" src={sticker.img} alt="" draggable={false}
                style={{ left: fly.from.left, top: fly.from.top, width: fly.from.width, height: fly.from.height }}
                initial={{ x: 0, y: 0, scale: 1, rotate: -8, opacity: 1 }}
                animate={{
                  x: fly.to.left + fly.to.width / 2 - (fly.from.left + fly.from.width / 2),
                  y: [0, -50, fly.to.top + fly.to.height / 2 - (fly.from.top + fly.from.height / 2)],
                  scale: [1, 1.15, 0.3], rotate: [-8, 8, 24], opacity: [1, 1, 0.7],
                }}
                transition={{ duration: 0.9, ease: "easeInOut", times: [0, 0.3, 1] }}
                onAnimationComplete={() => { setFly(null); setLanded(true); sfx.pop(); }}
              />
            )}
            {!isNum && (
              <button
                ref={albumBtn} className={`album-chip win-album${landed ? " bump" : ""}`} id="winAlbum"
                onClick={() => { audio(); setAlbum(true); }} aria-label="Buka album stiker"
              >
                <img src="/ui/album.webp" alt="" draggable={false} /> <b>{stickerCount - (newSticker && !landed ? 1 : 0)}</b>
              </button>
            )}
            <button className={`btn ghost icon-btn music-btn win-music${musicOn ? "" : " off"}`} aria-label="Musik" onClick={toggleMusic}>
              <Emo name={musicOn ? "music" : "mute"} />
            </button>
            <div className="panel">
              <div className="win-row">
                <span className="pokeable" onPointerDown={(e) => { audio(); sfx.boing(); poke(e.currentTarget, "poke-up"); }}>
                  <img className="lio lio-win" src={lioSrc("lompat")} alt="Lio" draggable={false} />
                </span>
                {newSticker && (
                  <motion.div
                    className="new-sticker"
                    initial={{ scale: 0, rotate: -30, opacity: 0 }}
                    animate={{ scale: 1, rotate: -8, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.55 }}
                  >
                    <img ref={stickerImg} src={sticker.img} alt={sticker.name} draggable={false} />
                    <span>Stiker baru!</span>
                  </motion.div>
                )}
              </div>
              <h3 id="winText">
                {allDone ? `Hebat! Semua ${isNum ? "angka" : "huruf"} selesai!` : isNum ? `Angka ${N.n} selesai!` : `Huruf ${L.ch} selesai!`}
              </h3>
              <div className="stars">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="pokeable" onPointerDown={(e) => { audio(); sfx.ding(); poke(e.currentTarget, "poke-spin", 500); }}>
                    <Emo name={allDone && i === 1 ? "trophy" : "star"} />
                  </span>
                ))}
              </div>
              <div className="row" style={{ justifyContent: "center", marginTop: 16 }}>
                <button className="btn ghost" id="winRetry" onClick={() => { setWin(false); resetSticker(); setMini3(isNum ? pickNumMini3(mini3 as NumMini3) : pickMini3(mini3 as Mini3)); startGame(0); }}><Icon name="retry" /> Lagi</button>
                <button
                  className="btn green" id="winNext"
                  onClick={() => {
                    if (isNum) {
                      // Album angka menyusul di tahap 4; untuk sekarang semua angka selesai = kembali ke Pilih Angka.
                      if (!allDone && cur < NUMBERS.length - 1) startNumber(cur + 1);
                      else goMap();
                      return;
                    }
                    if (PAYWALL_ENABLED && cur + 1 >= FREE_LETTERS) { setWin(false); setScreen("map"); setPay("win"); }
                    else if (allDone) { goMap(); setAlbum(true); } // semua stiker terkumpul: tunjukkan albumnya
                    else if (cur < LETTERS.length - 1) startLetter(cur + 1);
                    else goMap();
                  }}
                >
                  Lanjut <Icon name="next" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{pay && <Paywall key="pay" fromWin={pay === "win"} onClose={() => setPay(null)} />}</AnimatePresence>

      <AnimatePresence>{album && <Album key="album" progress={progress} onClose={() => setAlbum(false)} />}</AnimatePresence>

      {(screen === "menu" || screen === "map" || screen === "nummap") && !intro && (
        <button
          className="btn ghost icon-btn home-float" id="btnHome" style={{ display: "block" }}
          aria-label={screen === "menu" ? "Kembali ke beranda" : "Kembali ke pilihan pelajaran"}
          onClick={() => { audio(); setScreen(screen === "menu" ? "start" : "menu"); }}
        >
          <Emo name="home" />
        </button>
      )}
      {screen !== "play" && (
        <button className={`btn ghost icon-btn music-btn music-float${musicOn ? "" : " off"}`} aria-label="Musik" onClick={toggleMusic}>
          <Emo name={musicOn ? "music" : "mute"} />
        </button>
      )}
      <Fx ref={fx} />

      {/* Konfirmasi reset progres (untuk orang tua; dibuka dengan menekan lama logo "Lio" 3 detik) */}
      <AnimatePresence>
        {resetAsk && (
          <motion.div key="reset" className="overlay on" id="reset" {...fade}>
            <div className="panel">
              <img className="leave-lio" src={lioSrc("sedih")} alt="" draggable={false} />
              <h3 className="leave-title">Hapus semua bintang dan stiker?</h3>
              <p className="small">Untuk orang tua: semua huruf dan angka akan kembali seperti baru.</p>
              <div className="leave-btns">
                <button className="btn green" id="resetNo" onClick={() => setResetAsk(false)}>Jangan</button>
                <button className="btn ghost" id="resetYes" onClick={() => { resetProgress(); setResetAsk(false); sfx.pop(); }}>Ya, hapus</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HP dimiringkan: minta diputar tegak (tampil lewat CSS, lihat .rotate-hint) */}
      <div className="rotate-hint" aria-hidden>
        <div className="rotate-phone"><Emo name="phone" /></div>
        <img src={lioSrc("menunjuk")} alt="" draggable={false} />
        <p>Putar HP-nya dulu ya!</p>
      </div>
    </MotionConfig>
  );
}
