"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { VideoCardData, TrailerListItem } from "@/lib/types";
import { STRINGS } from "@/lib/strings";
import { useTrailers } from "@/hooks/useTrailers";
import { API_BASE_URL } from "@/lib/constants";
import { DashboardSidebar } from "@/components/features/Dashboard/DashboardSidebar";
import { DashboardTabs } from "@/components/features/Dashboard/DashboardTabs";
import { VideoCard } from "@/components/ui/VideoCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { PLACEHOLDER_CARDS, DASHBOARD_STATS } from "@/components/features/Dashboard/constants";
import type { StatItem } from "@/components/features/Dashboard/StatsGrid";

const WATCHED_KEY = "reel-watched-count";

function trailersToCards(trailers: TrailerListItem[]): VideoCardData[] {
  return trailers.map((t) => ({
    id: t.id,
    title: t.title,
    subtitle: "",
    image: t.thumbnail?.startsWith("http")
      ? t.thumbnail
      : `${API_BASE_URL}${t.thumbnail || ""}`,
    badge: STRINGS.cards.badge,
  }));
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>(STRINGS.dashboard.tabs[0]);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [watchedCount, setWatchedCount] = useState(34);
  const [customPrefs, setCustomPrefs] = useState("");
  const [appliedCustomPrefs, setAppliedCustomPrefs] = useState("");
  const [showCheckmark, setShowCheckmark] = useState(false);
  const { data: trailers, isLoading, error, refetch } = useTrailers();
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem(WATCHED_KEY);
    if (stored) {
      const n = parseInt(stored, 10);
      if (!isNaN(n)) setWatchedCount(n);
    }
  }, []);

  const stats: StatItem[] = useMemo(
    () =>
      DASHBOARD_STATS.map((s) =>
        s.label === STRINGS.dashboard.stats.watched
          ? { ...s, value: String(watchedCount) }
          : s
      ),
    [watchedCount]
  );

  const cards: VideoCardData[] = useMemo(() => {
    if (!trailers?.length) return PLACEHOLDER_CARDS;
    return [...trailersToCards(trailers), ...PLACEHOLDER_CARDS];
  }, [trailers]);

  const handlePrefToggle = (key: string) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplyCustomPrefs = () => {
    const trimmed = customPrefs.trim();
    if (trimmed) setAppliedCustomPrefs(trimmed);
    setShowCheckmark(true);
    setTimeout(() => setShowCheckmark(false), 1500);
  };

  const handleCardClick = (card: VideoCardData) => {
    if (!card.id) return;
    setWatchedCount((c) => {
      const next = c + 1;
      if (typeof localStorage !== "undefined") localStorage.setItem(WATCHED_KEY, String(next));
      return next;
    });
    const activePrefNames = Object.entries(prefs)
      .filter(([, v]) => v)
      .map(([k]) => k.split(":")[1]);
    const params = new URLSearchParams();
    if (activePrefNames.length) params.set("prefs", activePrefNames.join(","));
    if (appliedCustomPrefs) params.set("custom", appliedCustomPrefs);
    const query = params.toString();
    router.push(`/watch/${card.id}${query ? `?${query}` : ""}`);
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
      <DashboardSidebar
        prefs={prefs}
        onPrefToggle={handlePrefToggle}
        stats={stats}
        customPrefs={customPrefs}
        onCustomPrefsChange={setCustomPrefs}
        appliedCustomPrefs={appliedCustomPrefs}
        onApplyCustomPrefs={handleApplyCustomPrefs}
        showCheckmark={showCheckmark}
      />

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

        {error && (
          <div
            style={{
              marginBottom: "24px",
              padding: "12px 16px",
              borderRadius: "12px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "rgba(254,226,226,0.95)",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <span>
              {error.message === "Failed to fetch"
                ? STRINGS.dashboard.connectionPending
                : error.message}
            </span>
            <button
              type="button"
              onClick={() => refetch()}
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                transition: "background 0.15s ease",
              }}
            >
              {STRINGS.dashboard.retry}
            </button>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {isLoading
            ? Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)
            : cards.map((card, i) => (
              <VideoCard
                key={card.id ?? card.title}
                card={card}
                index={i}
                onClick={() => handleCardClick(card)}
              />
            ))}
        </div>
      </main>
    </div>
  );
}
