"use client";

import { useEffect, useState } from "react";
import type { PoseName } from "./Lio";
import { audio, sfx } from "@/lib/audio";

/**
 * Buah angka di atas papan tebalkan: tergantung di ujung sulur yang menjuntai dari atas layar, berayun pelan.
 * Bereaksi seperti hewan huruf (berayun kencang saat Lio memuji, gemetar saat salah, berayun saat diketuk).
 * Begitu angka selesai ditebalkan (`dropped`), buah lepas, jatuh ke papan, dan memantul: hadiah kecil.
 */
export default function FruitHang({ img, pose, n, dropped }: { img: string; pose: PoseName; n: number; dropped: boolean }) {
  const [kick, setKick] = useState(0);
  const react = pose === "sedih" ? "shake" : pose === "jempol" || pose === "tepuk-tangan" ? "kick" : "";

  useEffect(() => {
    if (!dropped) return;
    sfx.whoosh();
    const t = setTimeout(() => sfx.boing(), 430); // menyentuh papan
    return () => clearTimeout(t);
  }, [dropped]);

  return (
    <div className={`fruit-hang${dropped ? " dropped" : ""}`} aria-hidden>
      <div className="fh-swing">
        <img className="fh-vine" src="/ui/vine.svg" alt="" draggable={false} />
        <div className="fh-drop">
          <div key={`${n}-${kick}`} className={`fh-react ${kick ? "kick" : dropped ? "" : react}`}>
            <img
              className="fh-fruit" src={img} alt="" draggable={false}
              onPointerDown={() => { audio(); sfx.pop(); setKick((k) => k + 1); }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
