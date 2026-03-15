"use client";

interface FilterBadgeProps {
  label: string;
}

export function FilterBadge({ label }: FilterBadgeProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#fff",
        fontSize: "11px",
        letterSpacing: "0.08em",
        padding: "5px 14px",
        borderRadius: "999px",
        textTransform: "uppercase",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
      }}
    >
      {label}
    </div>
  );
}
