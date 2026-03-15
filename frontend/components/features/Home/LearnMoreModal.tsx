"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Brain, ShieldCheck } from "lucide-react";
import { STRINGS } from "@/lib/strings";

const MODAL = STRINGS.home.learnMoreModal;
const FEATURES = [
  {
    text: MODAL.bullet1,
    desc: MODAL.desc1,
    Icon: Video,
    circleBg: "rgba(99,102,241,0.15)",
    iconColor: "rgba(129,140,248,0.95)",
  },
  {
    text: MODAL.bullet2,
    desc: MODAL.desc2,
    Icon: Brain,
    circleBg: "rgba(168,85,247,0.15)",
    iconColor: "rgba(192,132,252,0.95)",
  },
  {
    text: MODAL.bullet3,
    desc: MODAL.desc3,
    Icon: ShieldCheck,
    circleBg: "rgba(16,185,129,0.15)",
    iconColor: "rgba(52,211,153,0.95)",
  },
] as const;

interface LearnMoreModalProps {
  open: boolean;
  onClose: () => void;
}

export function LearnMoreModal({ open, onClose }: LearnMoreModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <div
            role="presentation"
            aria-hidden
            onClick={onClose}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="learn-more-modal-title"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 300,
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              zIndex: 1,
              width: "min(440px, 100%)",
              maxHeight: "calc(100vh - 48px)",
              overflow: "auto",
              padding: "32px 28px 24px",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow:
                "0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06) inset",
            }}
          >
            <header style={{ marginBottom: "28px" }}>
              <h2
                id="learn-more-modal-title"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "22px",
                  fontWeight: 600,
                  margin: "0 0 8px",
                  letterSpacing: "-0.02em",
                  background:
                    "linear-gradient(90deg, #ffffff 0%, #e5e7eb 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {MODAL.title}
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: 1.5,
                  color: "rgba(255,255,255,0.65)",
                  margin: 0,
                }}
              >
                {MODAL.tagline}
              </p>
            </header>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {FEATURES.map(({ text, desc, Icon, circleBg, iconColor }, i) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.08 * (i + 1),
                    duration: 0.3,
                  }}
                  whileHover={{ x: 5 }}
                  style={{
                    borderRadius: "14px",
                    padding: "16px 18px",
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    cursor: "default",
                    transition: "border-color 0.2s ease",
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: circleBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      size={20}
                      strokeWidth={2}
                      style={{ color: iconColor }}
                    />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        lineHeight: 1.35,
                        color: "rgba(255,255,255,0.95)",
                        fontFamily: "'Inter', sans-serif",
                        marginBottom: "4px",
                      }}
                    >
                      {text}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        lineHeight: 1.45,
                        color: "rgba(255,255,255,0.6)",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {desc}
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
            <div style={{ marginTop: "28px" }}>
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: "0 0 0 0 rgba(255,255,255,0)",
                  transition:
                    "background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.35)";
                  e.currentTarget.style.boxShadow =
                    "0 0 20px rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.2)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 0 rgba(255,255,255,0)";
                }}
              >
                {MODAL.close}
              </motion.button>
            </div>
            <p
              style={{
                marginTop: "20px",
                marginBottom: 0,
                fontSize: "11px",
                lineHeight: 1.4,
                color: "rgba(255,255,255,0.35)",
                fontFamily: "'Inter', sans-serif",
                textAlign: "center",
              }}
            >
              {MODAL.footer}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
