import type { MetadataRoute } from "next";

export const dynamic = "force-static";

/** Supaya bisa dipasang di layar utama HP dan dibuka seperti aplikasi (tegak, tanpa bilah alamat). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Belajar Bareng Lio: Petualangan Huruf",
    short_name: "Lio Huruf",
    description: "Belajar huruf A–Z bersama Lio si Singa.",
    lang: "id",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#e6f6ff",
    theme_color: "#e6f6ff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
