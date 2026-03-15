"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AgeGroup, Trailer } from "@/lib/types";

const CARD_BORDER = "1px solid rgba(255,255,255,0.08)";
const GLASS_BG = "rgba(255,255,255,0.03)";
const GLASS_BLUR = "blur(12px)";

function FloatingCard({
  children,
  x,
  y,
  width,
  rotate,
  translateZ,
  rotateX,
  rotateY,
  z,
  delay,
  driftY,
  driftRotate,
}: {
  children: React.ReactNode;
  x: string;
  y: string;
  width: string;
  rotate: number;
  translateZ?: number;
  rotateX?: number;
  rotateY?: number;
  z: number;
  delay: number;
  driftY?: number;
  driftRotate?: number;
}) {
  const depth = translateZ ?? 0;
  const tiltBack = rotateX ?? 0;
  const tiltLeft = rotateY ?? 0; // negative = left edge into page, right edge out
  const loadDelay = delay * 0.08;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        zIndex: z,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 0, rotate }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, driftY ?? -6, 0],
          rotate: [rotate, rotate + (driftRotate ?? 0.8), rotate],
        }}
        transition={{
          opacity: { duration: 0.35, delay: loadDelay, ease: [0.22, 1, 0.36, 1] },
          scale: { duration: 0.35, delay: loadDelay, ease: [0.22, 1, 0.36, 1] },
          y: { duration: 6 + delay * 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
          rotate: { duration: 6 + delay * 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
        }}
        style={{
          rotateX: tiltBack,
          rotateY: tiltLeft,
          translateZ: depth,
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function GlassFrame({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
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

const PIC = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export default function Home() {
  const [age] = useState<AgeGroup>("kids");
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:8000/api/trailers")
      .then((r) => r.json())
      .then(setTrailers);
  }, []);

  const featured = trailers[0];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B0E14",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Radial glow */}
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

      {/* Top nav */}
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
          REEL
        </motion.span>
      </header>

      {/* Hero */}
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
        {/* Left copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxWidth: "380px", flexShrink: 0, marginTop: "-14vh", marginLeft: "-8px", zIndex: 20 }}
        >
          <h1
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "36px",
              fontWeight: 400,
              lineHeight: 1.15,
              color: "#ffffff",
              margin: "0 0 30px",
              letterSpacing: "-0.02em",
            }}
          >
            Optimized video for all
            <br />
            major platforms.
          </h1>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                background: "#ffffff",
                color: "#0B0E14",
                border: "none",
                padding: "11px 22px",
                borderRadius: "999px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                letterSpacing: "0.01em",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(255,255,255,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Get Started
            </button>
            <button
              style={{
                background: "transparent",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.18)",
                padding: "11px 22px",
                borderRadius: "999px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                cursor: "pointer",
                letterSpacing: "0.01em",
                transition: "border-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
              }}
            >
              Learn more
            </button>
          </div>
        </motion.div>

        {/* Right: Tiled cards receding into the page (3D perspective) */}
        <div
          style={{
            position: "relative",
            flex: 1,
            height: "100vh",
            maxWidth: "780px",
            perspective: "900px",
            perspectiveOrigin: "50% 45%",
            transformStyle: "preserve-3d",
          }}
        >

          {/* ══════ NETFLIX (back, tilted into page) ══════ */}
          <FloatingCard
            x="-2%"
            y="12%"
            width="54%"
            rotate={8}
            translateZ={-200}
            rotateX={6}
            rotateY={-10}
            z={8}
            delay={0.2}
            driftY={-6}
            driftRotate={-0.4}
          >
            <GlassFrame>
              <div style={{ background: "#141414", padding: "10px 12px 10px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      color: "#e50914",
                      fontSize: "13px",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                    }}
                  >
                    NETFLIX
                  </span>
                  {["Home", "TV Shows", "Movies", "New & Popular"].map((t) => (
                    <span
                      key={t}
                      style={{ fontSize: "8px", color: "rgba(255,255,255,0.45)" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    position: "relative",
                    borderRadius: "5px",
                    overflow: "hidden",
                    marginBottom: "8px",
                    aspectRatio: "21/9",
                  }}
                >
                  <img
                    src={PIC("mandalorian", 640, 274)}
                    alt="Featured"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(20,20,20,0.9) 0%, transparent 50%)" }} />
                  <div style={{ position: "absolute", bottom: "8px", left: "10px" }}>
                    <p style={{ color: "#fff", fontSize: "12px", fontWeight: 700, margin: "0 0 4px" }}>
                      The Mandalorian
                    </p>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <span style={{ background: "#fff", color: "#000", fontSize: "7px", fontWeight: 600, padding: "2px 7px", borderRadius: "3px" }}>
                        ▶ Play
                      </span>
                      <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: "7px", padding: "2px 7px", borderRadius: "3px" }}>
                        ℹ More Info
                      </span>
                    </div>
                  </div>
                </div>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "8px", fontWeight: 600, margin: "0 0 5px" }}>
                  Continue Watching
                </p>
                <div style={{ display: "flex", gap: "4px" }}>
                  {["western", "ocean", "mountains", "city"].map((s) => (
                    <div key={s} style={{ flex: 1, aspectRatio: "16/9", borderRadius: "3px", overflow: "hidden" }}>
                      <img src={PIC(s, 160, 90)} alt={s} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                  ))}
                </div>
              </div>
            </GlassFrame>
          </FloatingCard>

          {/* ══════ YOUTUBE (mid-depth) ══════ */}
          <FloatingCard
            x="10%"
            y="32%"
            width="56%"
            rotate={8}
            translateZ={-40}
            rotateX={6}
            rotateY={-10}
            z={12}
            delay={0.35}
            driftY={-7}
            driftRotate={-0.5}
          >
            <GlassFrame>
              <div style={{ background: "#0f0f0f" }}>
                <div style={{ position: "relative", aspectRatio: "16/9" }}>
                  <img
                    src={PIC("landscape-drone", 640, 360)}
                    alt="YouTube video"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                      padding: "14px 10px 7px",
                    }}
                  >
                    <div style={{ height: "3px", background: "rgba(255,255,255,0.2)", borderRadius: "99px", marginBottom: "5px", overflow: "hidden" }}>
                      <div style={{ width: "35%", height: "100%", background: "#ff0000", borderRadius: "99px" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <div style={{ width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: "8px solid #fff" }} />
                      <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "9px", fontFamily: "'Inter', sans-serif" }}>0:51 / 1:46</span>
                      <div style={{ flex: 1 }} />
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px" }}>⚙</span>
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px" }}>⛶</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "7px 10px 9px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "3px" }}>
                    <span style={{ color: "#ff0000", fontSize: "11px", fontWeight: 700 }}>▶</span>
                    <span style={{ color: "#fff", fontSize: "10px", fontWeight: 600 }}>YouTube</span>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "9px", fontWeight: 500, margin: "0 0 2px" }}>
                    Cinematic Aerial Landscapes — 4K Drone Footage
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "8px", margin: 0 }}>
                    2.4M views · 3 weeks ago
                  </p>
                </div>
              </div>
            </GlassFrame>
          </FloatingCard>

          {/* ══════ TIKTOK (forward) ══════ */}
          <FloatingCard
            x="50%"
            y="14%"
            width="21%"
            rotate={8}
            translateZ={80}
            rotateX={6}
            rotateY={-10}
            z={14}
            delay={0.5}
            driftY={-9}
            driftRotate={-0.6}
          >
            <GlassFrame style={{ borderRadius: "22px" }}>
              <div style={{ position: "relative", aspectRatio: "9/17", background: "#000" }}>
                <img
                  src={PIC("concert-lights", 270, 510)}
                  alt="TikTok"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%)" }} />
                <div style={{ position: "absolute", top: "8px", left: "8px" }}>
                  <span style={{ fontSize: "9px", fontWeight: 800, color: "#fff" }}>TikTok</span>
                </div>
                <div style={{ position: "absolute", top: "8px", left: 0, right: 0, display: "flex", justifyContent: "center", gap: "12px" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "8px", fontWeight: 500 }}>Following</span>
                  <span style={{ color: "#fff", fontSize: "8px", fontWeight: 700, borderBottom: "1px solid #fff", paddingBottom: "2px" }}>For You</span>
                </div>
                <div style={{ position: "absolute", right: "6px", bottom: "50px", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                  {[
                    { icon: "♥", label: "24.5K" },
                    { icon: "💬", label: "1,203" },
                    { icon: "↗", label: "Share" },
                  ].map(({ icon, label }, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ width: "18px", height: "18px", borderRadius: "999px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", margin: "0 auto 2px" }}>
                        {icon}
                      </div>
                      <span style={{ color: "#fff", fontSize: "6px" }}>{label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ position: "absolute", bottom: "12px", left: "8px", right: "30px" }}>
                  <p style={{ color: "#fff", fontSize: "7px", fontWeight: 600, margin: "0 0 2px" }}>@creator · 3h ago</p>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "6px", margin: 0 }}>Best footage ever #fyp #viral</p>
                </div>
              </div>
            </GlassFrame>
          </FloatingCard>

          {/* ══════ INSTAGRAM (front, out of page) ══════ */}
          <FloatingCard
            x="62%"
            y="30%"
            width="23%"
            rotate={8}
            translateZ={180}
            rotateX={6}
            rotateY={-10}
            z={16}
            delay={0.65}
            driftY={-6}
            driftRotate={-0.5}
          >
            <GlassFrame style={{ borderRadius: "22px" }}>
              <div style={{ background: "#fafafa", aspectRatio: "9/16" }}>
                <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #eee" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, color: "#262626", fontStyle: "italic" }}>
                    Instagram
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {["♡", "💬", "↗"].map((ic, i) => (
                      <span key={i} style={{ fontSize: "9px", color: "#262626" }}>{ic}</span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: "8px 8px 6px", display: "flex", gap: "6px", borderBottom: "1px solid #eee" }}>
                  {["sunset", "portrait", "flowers", "food", "travel"].map((s) => (
                    <div key={s} style={{ textAlign: "center" }}>
                      <div style={{ width: "22px", height: "22px", borderRadius: "999px", background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", padding: "1.5px" }}>
                        <div style={{ width: "100%", height: "100%", borderRadius: "999px", overflow: "hidden", border: "1.5px solid #fafafa" }}>
                          <img src={PIC(s, 44, 44)} alt={s} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ padding: "6px 10px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "999px", overflow: "hidden" }}>
                      <img src={PIC("avatar1", 32, 32)} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <span style={{ fontSize: "8px", fontWeight: 600, color: "#262626" }}>filmmaker.co</span>
                  </div>
                  <div style={{ aspectRatio: "1", overflow: "hidden" }}>
                    <img src={PIC("cinema-reel", 300, 300)} alt="Post" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                  <div style={{ padding: "6px 10px" }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "3px" }}>
                      {["♡", "💬", "↗"].map((ic, i) => (
                        <span key={i} style={{ fontSize: "10px", color: "#262626" }}>{ic}</span>
                      ))}
                    </div>
                    <p style={{ fontSize: "7px", fontWeight: 600, color: "#262626", margin: "0 0 2px" }}>1,847 likes</p>
                    <p style={{ fontSize: "7px", color: "#8e8e8e", margin: 0 }}>View all 42 comments</p>
                  </div>
                </div>
              </div>
            </GlassFrame>
          </FloatingCard>
        </div>
      </section>

      {/* Footer */}
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
        <span>Privacy</span>
        <span>Terms</span>
      </div>
    </div>
  );
}
