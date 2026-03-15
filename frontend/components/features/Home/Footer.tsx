"use client";

import { STRINGS } from "@/lib/strings";

export function Footer() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "24px",
        right: "48px",
        display: "flex",
        gap: "24px",
        fontSize: "11px",
        color: "rgba(255,255,255,0.25)",
        zIndex: 50,
      }}
    >
      <span>{STRINGS.nav.privacy}</span>
      <span>{STRINGS.nav.terms}</span>
    </div>
  );
}
