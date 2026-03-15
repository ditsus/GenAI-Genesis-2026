"use client";

import { GLASS_BORDER, GLASS_BG, GLASS_BLUR } from "@/lib/theme";

export interface GlassFrameProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function GlassFrame({ children, style }: GlassFrameProps) {
  return (
    <div
      style={{
        borderRadius: "16px",
        border: GLASS_BORDER,
        background: GLASS_BG,
        backdropFilter: GLASS_BLUR,
        WebkitBackdropFilter: GLASS_BLUR,
        overflow: "hidden",
        boxShadow:
          "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
