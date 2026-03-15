"use client";

import { motion } from "framer-motion";
import { VideoCardData } from "@/lib/types";
import { GLASS_BORDER, GLASS_BG } from "@/lib/theme";

const CARD_SHADOW =
  "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset";
const CARD_SHADOW_HOVER =
  "0 24px 70px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08) inset";

export interface VideoCardProps {
  card: VideoCardData;
  index?: number;
  onClick?: () => void;
}

export function VideoCard({ card, index = 0, onClick }: VideoCardProps) {
  return (
    <motion.div
      className="cursor-pointer"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.2 + index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        borderRadius: "16px",
        border: GLASS_BORDER,
        background: GLASS_BG,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        overflow: "hidden",
        boxShadow: CARD_SHADOW,
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.02)";
        e.currentTarget.style.boxShadow = CARD_SHADOW_HOVER;
        const img = e.currentTarget.querySelector("img");
        if (img) img.style.filter = "brightness(0.85)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = CARD_SHADOW;
        const img = e.currentTarget.querySelector("img");
        if (img) img.style.filter = "brightness(0.65)";
      }}
    >
      <div style={{ position: "relative", aspectRatio: "16/9" }}>
        <img
          src={card.image}
          alt={card.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            filter: "brightness(0.65)",
            transition: "filter 0.2s ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(11,14,20,0.9) 0%, transparent 50%)",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            fontSize: "9px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.6)",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "3px 9px",
            borderRadius: "999px",
            letterSpacing: "0.04em",
          }}
        >
          {card.badge}
        </span>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <p
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#ffffff",
            margin: "0 0 4px",
          }}
        >
          {card.title}
        </p>
        <p
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.35)",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {card.subtitle}
        </p>
      </div>
    </motion.div>
  );
}
