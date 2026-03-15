"use client";

import { GLASS_BORDER } from "@/lib/theme";

export interface StatItem {
  value: string;
  label: string;
}

interface StatsGridProps {
  stats: StatItem[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px",
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: GLASS_BORDER,
            borderRadius: "12px",
            padding: "12px",
            backdropFilter: "blur(8px)",
          }}
        >
          <p
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "#ffffff",
              margin: "0 0 2px",
            }}
          >
            {s.value}
          </p>
          <p
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.4)",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}
