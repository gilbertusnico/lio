"use client";

import { motion, type HTMLMotionProps } from "motion/react";

/**
 * Animasi muncul "bubble in": membesar dari kecil dengan pegas, sedikit memantul.
 * Dipakai sebagai PEMBUNGKUS, supaya tidak bentrok dengan transform CSS milik isinya
 * (tombol yang turun saat ditekan, goyang saat salah, denyut tombol Mulai Main).
 * `i` = urutan muncul (untuk efek beruntun), `step` = jeda antar urutan dalam detik.
 */
type Props = HTMLMotionProps<"div"> & { i?: number; step?: number; delay?: number; from?: number };

export default function Pop({ i = 0, step = 0.05, delay = 0, from = 0.4, ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: from }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: delay + i * step,
        scale: { type: "spring", stiffness: 420, damping: 17, mass: 0.8, delay: delay + i * step },
        opacity: { duration: 0.12, delay: delay + i * step },
      }}
      {...rest}
    />
  );
}
