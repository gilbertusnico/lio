import { LEAF_SRCS } from "@/lib/leaf";

/** Daun tropis di 4 sudut layar. */
export default function Leaves() {
  return (
    <div className="leaves" aria-hidden>
      {(["tl", "tr", "bl", "br"] as const).map((k) => (
        <img key={k} src={LEAF_SRCS[k]} alt="" className={`leaf ${k}`} draggable={false} />
      ))}
    </div>
  );
}
