import type { Metadata, Viewport } from "next";
import "@fontsource-variable/grandstander";
import "@fontsource/andika/700.css";
import "./globals.css";
import "./legacy.css";
import "./game.css";

export const metadata: Metadata = {
  title: "Belajar Bareng Lio: Petualangan Huruf",
  description: "Belajar huruf A–Z bersama Lio si Singa: menebalkan huruf, mencari huruf, berhitung, dan mencocokkan bayangan.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#e6f6ff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
