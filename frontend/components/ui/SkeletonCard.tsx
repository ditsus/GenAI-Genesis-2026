"use client";

import { GLASS_BORDER, GLASS_BG } from "@/lib/theme";

export function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: "16px",
        border: GLASS_BORDER,
        background: GLASS_BG,
        overflow: "hidden",
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset",
      }}
    >
      <div
        className="skeleton-pulse"
        style={{
          position: "relative",
          aspectRatio: "16/9",
          background: "rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "40px",
            height: "18px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.08)",
          }}
        />
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div
          className="skeleton-pulse"
          style={{
            height: "14px",
            width: "75%",
            marginBottom: "8px",
            borderRadius: "4px",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          className="skeleton-pulse-delay"
          style={{
            height: "11px",
            width: "50%",
            borderRadius: "4px",
            background: "rgba(255,255,255,0.06)",
          }}
        />
      </div>
    </div>
  );
}
