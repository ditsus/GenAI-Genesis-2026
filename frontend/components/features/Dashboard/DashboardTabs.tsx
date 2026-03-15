"use client";

import { motion } from "framer-motion";
import { STRINGS } from "@/lib/strings";

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = STRINGS.dashboard.tabs;

export function DashboardTabs({
  activeTab,
  onTabChange,
}: DashboardTabsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      style={{
        display: "flex",
        gap: "24px",
        marginBottom: "28px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "12px",
      }}
    >
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          style={{
            background: "none",
            border: "none",
            padding: "0 0 8px",
            fontSize: "13px",
            fontWeight: activeTab === tab ? 500 : 400,
            color:
              activeTab === tab
                ? "#ffffff"
                : "rgba(255,255,255,0.35)",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "0.01em",
            borderBottom:
              activeTab === tab
                ? "2px solid #ffffff"
                : "2px solid transparent",
            transition: "color 0.15s ease, border-color 0.15s ease",
          }}
        >
          {tab}
        </button>
      ))}
    </motion.div>
  );
}
