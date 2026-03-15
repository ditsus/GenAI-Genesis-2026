"use client";

import { AgePickerProps } from "@/lib/types";
import { STRINGS } from "@/lib/strings";

const OPTIONS = [
  { value: "kids" as const, label: STRINGS.agePicker.kids },
  { value: "teen" as const, label: STRINGS.agePicker.teen },
  { value: "adult" as const, label: STRINGS.agePicker.adult },
];

export default function AgePicker({ value, onChange }: AgePickerProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ color: "#666", fontSize: "13px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {STRINGS.agePicker.viewer}
      </span>
      <div
        style={{
          display: "flex",
          background: "#141414",
          border: "1px solid #2a2a2a",
          borderRadius: "100px",
          padding: "3px",
          gap: "2px",
        }}
      >
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: "6px 16px",
              borderRadius: "100px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: value === opt.value ? "500" : "300",
              background: value === opt.value ? "#e63946" : "transparent",
              color: value === opt.value ? "#fff" : "#888",
              transition: "all 0.15s ease",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
