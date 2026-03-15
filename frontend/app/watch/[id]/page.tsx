"use client";
import { useEffect, useState, use, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SmartPlayer from "@/components/SmartPlayer";
import AgePicker from "@/components/AgePicker";
import { AgeGroup, Trailer, FILTERS, SegmentType } from "@/lib/types";
import { API_BASE_URL } from "@/lib/constants";
import { STRINGS } from "@/lib/strings";

/** Map dashboard preference chip labels to segment types (clearplay-style). */
const PREF_TO_SEGMENT: Record<string, SegmentType> = {
  Intimacy: "romance",
  Profanity: "language",
  Epileptic: "epileptic",
  "Motion sickness": "epileptic",
  "Loud Volume": "epileptic",
};

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const [age, setAge] = useState<AgeGroup>(
    (searchParams.get("age") as AgeGroup) || "kids"
  );

  const activeFiltersFromPrefs = useMemo(() => {
    const prefsParam = searchParams.get("prefs");
    if (!prefsParam) return null;
    const prefNames = prefsParam.split(",").map((s) => s.trim());
    const types: SegmentType[] = [];
    for (const name of prefNames) {
      const segType = PREF_TO_SEGMENT[name];
      if (segType && !types.includes(segType)) types.push(segType);
    }
    return types;
  }, [searchParams]);

  const activeFilters = activeFiltersFromPrefs ?? FILTERS[age];

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/trailers`)
      .then((r) => r.json())
      .then((data: Trailer[]) => {
        const found = data.find((t) => t.id === id);
        setTrailer(found || null);
      });
  }, [id]);

  if (!trailer)
    return <div style={{ minHeight: "100vh", background: "#0B0E14" }} />;

  const filteredCount = trailer.segments.filter((s) =>
    activeFilters.includes(s.type)
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B0E14",
        padding: "28px 48px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "28px",
        }}
      >
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "none",
            borderRadius: "8px",
            width: "32px",
            height: "32px",
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
          {STRINGS.nav.back}
        </button>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ marginBottom: "20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 600,
              color: "#ffffff",
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}
          >
            {trailer.title}
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: "13px",
              margin: 0,
            }}
          >
            {trailer.year} · {trailer.rating} · {trailer.genres.join(", ")}
            {filteredCount > 0 && (
              <span style={{ color: "rgba(255,255,255,0.5)", marginLeft: "12px" }}>
                {STRINGS.player.modificationCount(filteredCount)}
              </span>
            )}
          </p>
          </div>
          {!activeFiltersFromPrefs && (
            <AgePicker value={age} onChange={setAge} />
          )}
        </div>

        <div
          style={{
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <SmartPlayer
            src={trailer.file}
            segments={trailer.segments}
            ageGroup={age}
            activeFilters={activeFiltersFromPrefs ?? undefined}
          />
        </div>

        <div style={{ marginTop: "32px" }}>
          <h2
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.35)",
              marginBottom: "14px",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            {STRINGS.player.modifications}
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {trailer.segments.map((seg, i) => {
              const isFiltered = activeFilters.includes(seg.type);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "10px",
                    opacity: isFiltered ? 1 : 0.4,
                  }}
                >
                  <span
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "12px",
                      minWidth: "80px",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {seg.start}s – {seg.end}s
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      padding: "3px 10px",
                      borderRadius: "999px",
                      textTransform: "capitalize",
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.5)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {seg.type}
                  </span>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.45)",
                      fontSize: "13px",
                      flex: 1,
                    }}
                  >
                    {seg.description}
                  </span>
                  {isFiltered && (
                    <span
                      style={{
                        color: "rgba(255,255,255,0.35)",
                        fontSize: "11px",
                        fontWeight: 500,
                      }}
                    >
                      {STRINGS.player.aiReplacementReady}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
