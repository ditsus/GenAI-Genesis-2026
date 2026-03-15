"use client";

const CARD_BORDER = "1px solid rgba(255,255,255,0.08)";
const GLASS_BG = "rgba(255,255,255,0.03)";
const GLASS_BLUR = "blur(12px)";

export interface GlassFrameProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function GlassFrame({ children, style }: GlassFrameProps) {
  return (
    <div
      style={{
        borderRadius: "16px",
        border: CARD_BORDER,
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
