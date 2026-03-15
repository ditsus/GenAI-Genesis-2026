"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { STRINGS } from "@/lib/strings";
import { StatsGrid } from "./StatsGrid";
import { PreferenceChips } from "./PreferenceChips";
import { DASHBOARD_STATS } from "./constants";

interface DashboardSidebarProps {
  prefs: Record<string, boolean>;
  onPrefToggle: (key: string) => void;
}

export function DashboardSidebar({ prefs, onPrefToggle }: DashboardSidebarProps) {
  const router = useRouter();

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: "260px",
        flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,0.06)",
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "15px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#ffffff",
            fontWeight: 500,
          }}
        >
          {STRINGS.app.name}
        </span>
        <button
          onClick={() => router.push("/")}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "none",
            borderRadius: "8px",
            width: "28px",
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.5)",
            fontSize: "14px",
            cursor: "pointer",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          }}
        >
          {STRINGS.nav.back}
        </button>
      </div>

      <h2
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "#ffffff",
          margin: 0,
          letterSpacing: "-0.01em",
        }}
      >
        {STRINGS.nav.videos}
      </h2>

      <StatsGrid stats={DASHBOARD_STATS} />

      <button
        style={{
          background: "#ffffff",
          color: "#0B0E14",
          border: "none",
          borderRadius: "999px",
          padding: "12px 0",
          fontSize: "14px",
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          cursor: "pointer",
          letterSpacing: "0.01em",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          width: "100%",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.02)";
          e.currentTarget.style.boxShadow =
            "0 0 20px rgba(255,255,255,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {STRINGS.nav.newVideo}
      </button>

      <PreferenceChips prefs={prefs} onPrefToggle={onPrefToggle} />
    </motion.aside>
  );
}
