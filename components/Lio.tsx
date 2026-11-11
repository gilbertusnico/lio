"use client";

export type PoseName = "menunjuk" | "jempol" | "tepuk-tangan" | "sedih" | "lompat" | "depan-melambai";
export const lioSrc = (pose: PoseName) => `/lio/lio-${pose}.webp`;
export const LIO_POSES: PoseName[] = ["menunjuk", "jempol", "tepuk-tangan", "sedih", "lompat", "depan-melambai"];

/** Lio di samping gelembung teks; `n` berubah tiap pose baru supaya animasinya terulang. */
export function LioTalk({ pose, n }: { pose: PoseName; n: number }) {
  return <img key={n} className={`lio lio-talk ${pose === "sedih" ? "sad" : "pop"}`} src={lioSrc(pose)} alt="Lio" draggable={false} />;
}
