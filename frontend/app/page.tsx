"use client";

import { motion } from "framer-motion";
import { Hero } from "@/components/features/Home/Hero";
import { PlatformCards } from "@/components/features/Home/PlatformCards";
import { Footer } from "@/components/features/Home/Footer";
import { STRINGS } from "@/lib/strings";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B0E14",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "55%",
          transform: "translate(-50%, -50%)",
          width: "140vw",
          height: "140vh",
          background:
            "radial-gradient(ellipse 45% 35% at 50% 50%, rgba(59,130,246,0.05) 0%, rgba(139,92,246,0.025) 30%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <header
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          padding: "28px 48px",
        }}
      >
        <motion.span
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            fontSize: "15px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#ffffff",
            fontWeight: 500,
          }}
        >
          {STRINGS.app.name}
        </motion.span>
      </header>

      <section
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "0 48px",
          gap: "20px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <Hero />
        <PlatformCards />
      </section>

      <Footer />
    </div>
  );
}
