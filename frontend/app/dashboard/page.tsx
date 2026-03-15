"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const PIC = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const GLASS_BORDER = "1px solid rgba(255,255,255,0.08)";
const GLASS_BG = "rgba(255,255,255,0.03)";

const TABS = ["All Videos", "YouTube", "Netflix", "Disney+", "Uploads"];

const PREF_GROUPS = [
  {
    label: "Sensory",
    items: ["Epileptic", "Loud Volume", "Motion sickness", "Colour-blindness"],
  },
  {
    label: "Social Safety",
    items: ["Profanity", "Political bias", "Commercial neutral", "Intimacy"],
  },
];

const STATS = [
  { value: "6", label: "Total" },
  { value: "3", label: "Processed" },
  { value: "34", label: "Watched" },
  { value: "Veo-3.1", label: "Model" },
];

type Card = { id?: string; title: string; subtitle?: string; image: string; badge: string };

const PLACEHOLDER_CARDS: Card[] = [
  { title: "Netflix — Trending", subtitle: "", image: PIC("cinema-screen", 600, 340), badge: "CLIP" },
  { title: "YouTube — Creator Upload", subtitle: "", image: PIC("camera-lens", 600, 340), badge: "CLIP" },
  { title: "Upload — Raw Footage", subtitle: "", image: PIC("film-reel", 600, 340), badge: "CLIP" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("All Videos");
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [cards, setCards] = useState<Card[]>(PLACEHOLDER_CARDS);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:8000/api/trailers")
      .then((r) => r.json())
      .then((trailers: { id: string; title: string; thumbnail: string }[]) => {
        const fromApi = trailers.map((t) => ({
          id: t.id,
          title: t.title,
          subtitle: "",
          image: t.thumbnail?.startsWith("http") ? t.thumbnail : `http://localhost:8000${t.thumbnail || ""}`,
          badge: "CLIP",
        }));
        setCards([...fromApi, ...PLACEHOLDER_CARDS]);
      })
      .catch(() => {});
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B0E14",
        display: "flex",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ─── Sidebar ─── */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "260px",
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "28px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Logo / Back */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "15px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#ffffff",
              fontWeight: 500,
            }}
          >
            REEL
          </span>
          <button
            onClick={() => router.push("/")}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: "8px",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.5)",
              fontSize: "14px",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
          >
            ←
          </button>
        </div>

        {/* Section title */}
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#ffffff",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Videos
        </h2>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: GLASS_BORDER,
                borderRadius: "12px",
                padding: "12px",
                backdropFilter: "blur(8px)",
              }}
            >
              <p
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#ffffff",
                  margin: "0 0 2px",
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.4)",
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* New Clip button */}
        <button
          style={{
            background: "#ffffff",
            color: "#0B0E14",
            border: "none",
            borderRadius: "999px",
            padding: "12px 0",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            cursor: "pointer",
            letterSpacing: "0.01em",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            width: "100%",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow =
              "0 0 20px rgba(255,255,255,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          + New Video
        </button>

        {/* Preferences */}
        <div style={{ marginTop: "18px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#ffffff",
              margin: "0 0 12px",
              letterSpacing: "-0.01em",
            }}
          >
            Preferences
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {PREF_GROUPS.map((group) => (
              <div key={group.label}>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "rgba(255,255,255,0.6)",
                    margin: "0 0 6px",
                  }}
                >
                  {group.label}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {group.items.map((item) => {
                    const key = `${group.label}:${item}`;
                    const active = prefs[key];
                    return (
                      <button
                        key={item}
                        onClick={() =>
                          setPrefs((prev) => ({
                            ...prev,
                            [key]: !prev[key],
                          }))
                        }
                        style={{
                          borderRadius: "999px",
                          border: GLASS_BORDER,
                          background: "rgba(255,255,255,0.03)",
                          color: "rgba(255,255,255,0.65)",
                          textDecoration: active ? "line-through" : "none",
                          textDecorationThickness: active ? "3px" : undefined,
                          fontSize: "11px",
                          padding: "5px 10px",
                          cursor: "pointer",
                          fontFamily: "'Inter', sans-serif",
                          transition: "text-decoration 0.15s ease",
                        }}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div style={{ marginTop: "4px" }}>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.6)",
                  margin: "0 0 6px",
                }}
              >
                Custom Preferences
              </p>
              <textarea
                placeholder="Enter your preferences…"
                style={{
                  width: "100%",
                  height: "150px",
                  borderRadius: "12px",
                  border: GLASS_BORDER,
                  background: GLASS_BG,
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  color: "rgba(255,255,255,0.9)",
                  fontSize: "11px",
                  padding: "10px 12px",
                  resize: "none",
                  overflow: "hidden",
                  fontFamily: "'Inter', sans-serif",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        </div>

      </motion.aside>

      {/* ─── Main content ─── */}
      <main style={{ flex: 1, padding: "28px 32px", overflow: "auto" }}>
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            marginBottom: "24px",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#ffffff",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Videos
          </h1>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          style={{
            display: "flex",
            gap: "24px",
            marginBottom: "28px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            paddingBottom: "12px",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none",
                border: "none",
                padding: "0 0 8px",
                fontSize: "13px",
                fontWeight: activeTab === tab ? 500 : 400,
                color:
                  activeTab === tab
                    ? "#ffffff"
                    : "rgba(255,255,255,0.35)",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "0.01em",
                borderBottom:
                  activeTab === tab
                    ? "2px solid #ffffff"
                    : "2px solid transparent",
                transition: "color 0.15s ease, border-color 0.15s ease",
              }}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Card grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              className="cursor-pointer"
              onClick={() => {
                if ("id" in card && card.id) router.push(`/watch/${card.id}`);
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.2 + i * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                borderRadius: "16px",
                border: GLASS_BORDER,
                background: GLASS_BG,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                overflow: "hidden",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow =
                  "0 24px 70px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08) inset";
                const img = e.currentTarget.querySelector(
                  "img"
                ) as HTMLImageElement | null;
                if (img) img.style.filter = "brightness(0.85)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset";
                const img = e.currentTarget.querySelector(
                  "img"
                ) as HTMLImageElement | null;
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
          ))}
        </div>
      </main>
    </div>
  );
}
