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
import { PLACEHOLDER_CARDS, DASHBOARD_STATS, TAB_TO_SOURCE } from "@/components/features/Dashboard/constants";
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
  const [showUploadModal, setShowUploadModal] = useState(false);
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

  const allCards: VideoCardData[] = useMemo(() => {
    if (!trailers?.length) return PLACEHOLDER_CARDS;
    return [...trailersToCards(trailers), ...PLACEHOLDER_CARDS];
  }, [trailers]);

  const filteredCards: VideoCardData[] = useMemo(() => {
    const source = TAB_TO_SOURCE[activeTab];
    if (source === null) return allCards;
    return allCards.filter((c) => c.source === source);
  }, [allCards, activeTab]);

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
        position: "relative",
      }}
    >
      {showUploadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={() => setShowUploadModal(false)}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              background: "rgba(11,14,20,0.4)",
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "420px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(11,14,20,0.95)",
              backdropFilter: "blur(12px)",
              padding: "32px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#ffffff",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Upload Video
              </h2>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "4px",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <label
              htmlFor="upload-input"
              style={{
                display: "block",
                border: "2px dashed rgba(255,255,255,0.2)",
                borderRadius: "12px",
                padding: "40px 24px",
                textAlign: "center",
                cursor: "pointer",
                transition: "border-color 0.2s, background 0.2s",
                color: "rgba(255,255,255,0.7)",
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                e.currentTarget.style.background = "transparent";
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="file"
                accept="video/*"
                multiple
                style={{ display: "none" }}
                onChange={() => {}}
                id="upload-input"
              />
              <span style={{ display: "block", marginBottom: "8px", fontSize: "32px" }}>📁</span>
              Drop files here or click to browse
            </label>
          </motion.div>
        </motion.div>
      )}
      <DashboardSidebar
        prefs={prefs}
        onPrefToggle={handlePrefToggle}
        stats={stats}
        customPrefs={customPrefs}
        onCustomPrefsChange={setCustomPrefs}
        appliedCustomPrefs={appliedCustomPrefs}
        onApplyCustomPrefs={handleApplyCustomPrefs}
        showCheckmark={showCheckmark}
        onNewVideoClick={() => setShowUploadModal(true)}
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
            : filteredCards.map((card, i) => (
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
