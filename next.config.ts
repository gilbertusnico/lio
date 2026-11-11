import type { NextConfig } from "next";

// Situs statis (tanpa server, tanpa DB): `next build` menghasilkan folder `out/`.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
