"use client";

import Pop from "./Pop";
import Emo from "./Emo";
import { LETTERS } from "@/data/letters";
import { NUMBERS } from "@/data/numbers";

type Props = { letterStars: number; numberStars: number; onLetters: () => void; onNumbers: () => void };

/** Layar Pilih Pelajaran: dua kartu besar, Huruf dan Angka. Anak belum bisa membaca, jadi isinya ikon dan contoh besar. */
export default function LessonMenu({ letterStars, numberStars, onLetters, onNumbers }: Props) {
  return (
    <section id="menu" className="screen on">
      <Pop><h2><span className="sparkle">Pilih Pelajaran</span></h2></Pop>
      <div className="menu-cards">
        <Pop delay={0.08} from={0.8} className="menu-wrap">
          <button className="lesson-card letters" onClick={onLetters} aria-label="Pelajaran huruf">
            <span className="lc-stars"><Emo name="star" /> {letterStars}/{LETTERS.length}</span>
            <span className="lc-sample">A a</span>
            <span className="lc-pics">
              <img src="/animals/ayam.webp" alt="" draggable={false} />
              <img src="/animals/gajah.webp" alt="" draggable={false} />
              <img src="/animals/zebra.webp" alt="" draggable={false} />
            </span>
            <span className="lc-name">Huruf</span>
          </button>
        </Pop>
        <Pop delay={0.18} from={0.8} className="menu-wrap">
          <button className="lesson-card numbers" onClick={onNumbers} aria-label="Pelajaran angka">
            <span className="lc-stars"><Emo name="star" /> {numberStars}/{NUMBERS.length}</span>
            <span className="lc-sample">1 2 3</span>
            <span className="lc-pics">
              <img src="/fruits/apel.webp" alt="" draggable={false} />
              <img src="/fruits/pisang.webp" alt="" draggable={false} />
              <img src="/fruits/anggur.webp" alt="" draggable={false} />
            </span>
            <span className="lc-name">Angka</span>
          </button>
        </Pop>
      </div>
    </section>
  );
}
