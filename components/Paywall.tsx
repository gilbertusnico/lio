"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { BUY_URL } from "@/lib/config";
import Leaves from "./Leaves";

/** Popup beli. Hanya tampil kalau PAYWALL_ENABLED = true (lib/config.ts). */
export default function Paywall({ fromWin, onClose }: { fromWin: boolean; onClose: () => void }) {
  const [info, setInfo] = useState("");
  return (
    <motion.div className="overlay light on" id="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Leaves />
      <div className="panel">
        <div className={`pay-lock${fromWin ? " win" : ""}`}>{fromWin ? "🏆" : "🔒"}</div>
        <h3 className="pay-title">{fromWin ? "Hore, 3 huruf selesai!" : "Huruf D–Z masih terkunci"}</h3>
        <ul className="pay-list">
          <li><b>✓</b> Semua huruf A–Z</li>
          <li><b>✓</b> 3 mini-game di setiap huruf</li>
          <li><b>✓</b> Sekali bayar, akses selamanya</li>
        </ul>
        <button
          className="play-btn"
          onClick={() => (BUY_URL ? window.open(BUY_URL, "_blank", "noopener") : setInfo("Link pembelian belum dipasang."))}
        >
          Beli Rp 20.000
        </button>
        <div className="pay-via">Pembayaran lewat Lynk.id</div>
        {info && <p className="small" style={{ marginTop: 10 }}>{info}</p>}
        <button className="mini-link" onClick={onClose}>Nanti saja</button>
      </div>
    </motion.div>
  );
}
