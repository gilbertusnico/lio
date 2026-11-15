/**
 * Ikon antarmuka sebagai SVG. Dipakai menggantikan karakter teks seperti ↩ ↺ ▶ ➜ ✅, yang oleh iOS
 * digambar sebagai emoji kotak biru dan oleh Android sebagai panah biasa, sehingga tampil beda.
 */
type Props = { name: "back" | "retry" | "play" | "next" | "check"; size?: number | string };

export default function Icon({ name, size = "1em" }: Props) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true, className: `ico ico-${name}` } as const;
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 3.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  switch (name) {
    case "back":
      return <svg {...common}><path {...stroke} d="M10 6 4.5 11.5 10 17M5 11.5h9.5a5 5 0 0 1 5 5V18" /></svg>;
    case "retry":
      return <svg {...common}><path {...stroke} d="M5.2 13.5a7 7 0 1 0 2-6.3M4.6 4.2l1.9 3.7 3.9-1.3" /></svg>;
    case "play":
      return <svg {...common}><path fill="currentColor" d="M7 4.6c0-1.2 1.3-2 2.4-1.3l11 7.4c.9.6.9 2 0 2.6l-11 7.4C8.300 21.400 7 20.600 7 19.400Z" /></svg>;
    case "next":
      return <svg {...common}><path {...stroke} d="M4 12h15M13 6l6 6-6 6" /></svg>;
    case "check":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="11" fill="#2fbf71" />
          <circle cx="12" cy="12" r="11" fill="none" stroke="#1f8f52" strokeWidth="1.2" />
          <path fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" d="M6.5 12.5 10.300 16.200 17.500 8.300" />
        </svg>
      );
  }
}
