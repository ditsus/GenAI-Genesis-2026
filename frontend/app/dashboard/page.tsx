"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { VideoCardData } from "@/lib/types";
import { API_BASE_URL } from "@/lib/constants";
import { STRINGS } from "@/lib/strings";
import { DashboardSidebar } from "@/components/features/Dashboard/DashboardSidebar";
import { DashboardTabs } from "@/components/features/Dashboard/DashboardTabs";
import { VideoCard } from "@/components/ui/VideoCard";
import { PLACEHOLDER_CARDS } from "@/components/features/Dashboard/constants";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(STRINGS.dashboard.tabs[0]);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [cards, setCards] = useState<VideoCardData[]>(PLACEHOLDER_CARDS);
  const router = useRouter();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/trailers`)
      .then((r) => r.json())
      .then((trailers: { id: string; title: string; thumbnail: string }[]) => {
        const fromApi: VideoCardData[] = trailers.map((t) => ({
          id: t.id,
          title: t.title,
          subtitle: "",
          image: t.thumbnail?.startsWith("http")
            ? t.thumbnail
            : `${API_BASE_URL}${t.thumbnail || ""}`,
          badge: STRINGS.cards.badge,
        }));
        setCards([...fromApi, ...PLACEHOLDER_CARDS]);
      })
      .catch(() => {});
  }, []);

  const handlePrefToggle = (key: string) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B0E14",
        display: "flex",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <DashboardSidebar prefs={prefs} onPrefToggle={handlePrefToggle} />

      <main style={{ flex: 1, padding: "28px 32px", overflow: "auto" }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ marginBottom: "24px" }}
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
            {STRINGS.nav.videos}
          </h1>
        </motion.div>

        <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {cards.map((card, i) => (
            <VideoCard
              key={card.id ?? card.title}
              card={card}
              index={i}
              onClick={() => {
                if (card.id) router.push(`/watch/${card.id}`);
              }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
