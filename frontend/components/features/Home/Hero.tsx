"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { STRINGS } from "@/lib/strings";
import { LearnMoreModal } from "./LearnMoreModal";

export function Hero() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      style={{
        maxWidth: "380px",
        flexShrink: 0,
        marginTop: "-14vh",
        marginLeft: "-8px",
        zIndex: 20,
      }}
    >
      <h1
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "36px",
          fontWeight: 400,
          lineHeight: 1.15,
          color: "#ffffff",
          margin: "0 0 30px",
          letterSpacing: "-0.02em",
        }}
      >
        {STRINGS.home.heroTitleLine1}
        <br />
        {STRINGS.home.heroTitleLine2}
      </h1>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            background: "#ffffff",
            color: "#0B0E14",
            border: "none",
            padding: "11px 22px",
            borderRadius: "999px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            letterSpacing: "0.01em",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.boxShadow =
              "0 0 20px rgba(255,255,255,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {STRINGS.nav.getStarted}
        </button>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            background: "transparent",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.18)",
            padding: "11px 22px",
            borderRadius: "999px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            cursor: "pointer",
            letterSpacing: "0.01em",
            transition: "border-color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
          }}
        >
          {STRINGS.nav.learnMore}
        </button>
      </div>

      <LearnMoreModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </motion.div>
  );
}
