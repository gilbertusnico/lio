/** Ikon antarmuka dari Noto Emoji yang dibundel (public/ui), supaya tampil sama di semua HP. */
export type EmoName = "hand" | "album" | "star" | "map" | "home" | "music" | "mute" | "pencil" | "find" | "count" | "herb" | "lock" | "trophy" | "phone";

export default function Emo({ name, className = "" }: { name: EmoName; className?: string }) {
  return <img className={`emo ${className}`} src={`/ui/${name}.webp`} alt="" draggable={false} />;
}
