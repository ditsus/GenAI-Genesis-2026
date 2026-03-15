"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { Segment, AgeGroup, FILTERS, SegmentType } from "@/lib/types";

const BADGE_LABELS: Record<SegmentType, string> = {
  romance:   "Romance filtered",
  violence:  "Violence filtered",
  language:  "Language filtered",
  horror:    "Horror filtered",
  epileptic: "Epileptic content filtered",
};

export default function SmartPlayer({
  src,
  segments,
  ageGroup,
}: {
  src: string;
  segments: Segment[];
  ageGroup: AgeGroup;
}) {
  const mainRef = useRef<HTMLVideoElement>(null);
  const replRef = useRef<HTMLVideoElement>(null);
  const [showRepl, setShowRepl] = useState(false);
  const [badge, setBadge] = useState<string | null>(null);
  const activeSegRef = useRef<Segment | null>(null);
  const replacingRef = useRef(false);
  const activeFilters = FILTERS[ageGroup];

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [volume, setVolume] = useState(1);
  const barRef = useRef<HTMLDivElement>(null);

  const filteredSegments = segments.filter((s) =>
    activeFilters.includes(s.type)
  );

  useEffect(() => {
    setShowRepl(false);
    setBadge(null);
    activeSegRef.current = null;
    replacingRef.current = false;
    mainRef.current?.play().catch(() => {});
  }, [ageGroup]);

  const showReplacementAt = useCallback((seg: Segment, mainTime: number) => {
    const repl = replRef.current;
    const main = mainRef.current;
    if (!repl) return;
    const offset = Math.max(0, mainTime - seg.start);
    const replSrc = `http://localhost:8000${seg.replacement}`;
    const shouldPlay = main ? !main.paused : true;

    const loadAndSync = () => {
      repl.currentTime = offset;
      if (shouldPlay) repl.play().catch(() => {});
      else repl.pause();
    };

    if (repl.src !== replSrc || !repl.src) {
      repl.src = replSrc;
      repl.load();
      repl.addEventListener("loadeddata", loadAndSync, { once: true });
    } else {
      loadAndSync();
    }
    setShowRepl(true);
    setBadge(BADGE_LABELS[seg.type]);
    activeSegRef.current = seg;
    replacingRef.current = true;
  }, []);

  const checkTime = useCallback(() => {
    const video = mainRef.current;
    if (!video) return;
    const t = video.currentTime;
    setCurrentTime(t);

    if (replacingRef.current) return;

    const hit = segments.find(
      (s) => activeFilters.includes(s.type) && t >= s.start && t < s.end
    );

    if (hit) {
      showReplacementAt(hit, t);
    }
  }, [segments, activeFilters, showReplacementAt]);

  useEffect(() => {
    const video = mainRef.current;
    if (!video) return;
    video.addEventListener("timeupdate", checkTime);

    const onLoaded = () => {
      setDuration(video.duration);
      video.volume = volume;
    };
    const onPlay = () => {
      setPlaying(true);
      if (replacingRef.current) replRef.current?.play().catch(() => {});
    };
    const onPause = () => {
      setPlaying(false);
      if (replacingRef.current) replRef.current?.pause();
    };
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", checkTime);
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [checkTime, volume]);

  useEffect(() => {
    const v = mainRef.current;
    if (v) v.volume = volume;
  }, [volume]);

  const onReplacementEnded = () => {
    const seg = activeSegRef.current;
    const main = mainRef.current;
    if (seg && main) {
      main.currentTime = seg.end;
      setCurrentTime(seg.end);
    }
    setShowRepl(false);
    setBadge(null);
    activeSegRef.current = null;
    replacingRef.current = false;
  };

  const togglePlay = () => {
    const video = mainRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  const seek = (clientX: number) => {
    const bar = barRef.current;
    const video = mainRef.current;
    if (!bar || !video || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const target = pct * duration;
    video.currentTime = target;
    setCurrentTime(target);

    const hit = segments.find(
      (s) =>
        activeFilters.includes(s.type) && target >= s.start && target < s.end
    );
    if (hit) {
      showReplacementAt(hit, target);
    } else if (showRepl) {
      setShowRepl(false);
      setBadge(null);
      activeSegRef.current = null;
      replacingRef.current = false;
    }
  };

  const setVolumeAndSync = (v: number) => {
    const val = Math.max(0, Math.min(1, v));
    setVolume(val);
    if (mainRef.current) mainRef.current.volume = val;
  };

  const getSegmentAtTime = (t: number) =>
    filteredSegments.find((s) => t >= s.start && t < s.end);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{ width: "100%" }}>
      {/* Video container */}
      <div
        className="cursor-pointer"
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16/9",
          background: "#000",
          borderRadius: "12px 12px 0 0",
          overflow: "hidden",
        }}
        onClick={togglePlay}
      >
        <video
          ref={mainRef}
          src={`http://localhost:8000${src}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: showRepl ? 0 : 1,
            transition: "opacity 0.3s ease",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />

        <video
          ref={replRef}
          onEnded={onReplacementEnded}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: showRepl ? 1 : 0,
            pointerEvents: "none",
            transition: "opacity 0.3s ease",
            position: "absolute",
            top: 0,
            left: 0,
          }}
          muted
          playsInline
        />

        {showRepl && badge && (
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              fontSize: "11px",
              letterSpacing: "0.08em",
              padding: "5px 14px",
              borderRadius: "999px",
              textTransform: "uppercase",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
            }}
          >
            {badge}
          </div>
        )}

        {/* Play/pause overlay icon (brief) */}
        {!playing && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "999px",
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "10px solid transparent",
                  borderBottom: "10px solid transparent",
                  borderLeft: "16px solid #fff",
                  marginLeft: "3px",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Custom progress bar + controls */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: "0 0 12px 12px",
          border: "1px solid rgba(255,255,255,0.06)",
          borderTop: "none",
          padding: "10px 16px 12px",
        }}
      >
        {/* Progress bar */}
        <div
          ref={barRef}
          className="cursor-pointer"
          style={{
            position: "relative",
            height: "6px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: "99px",
            marginBottom: "8px",
          }}
          onClick={(e) => {
            e.stopPropagation();
            seek(e.clientX);
          }}
          onMouseMove={(e) => {
            const rect = barRef.current?.getBoundingClientRect();
            if (rect && duration) {
              const pct = (e.clientX - rect.left) / rect.width;
              setHoverTime(pct * duration);
            }
          }}
          onMouseLeave={() => setHoverTime(null)}
        >
          {/* Modification zones */}
          {duration > 0 &&
            filteredSegments.map((seg, i) => {
              const left = (seg.start / duration) * 100;
              const width = ((seg.end - seg.start) / duration) * 100;
              const isActive = getSegmentAtTime(currentTime)?.start === seg.start;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${left}%`,
                    width: `${width}%`,
                    top: 0,
                    bottom: 0,
                    background: isActive
                      ? "rgba(167,139,250,0.5)"
                      : "rgba(167,139,250,0.25)",
                    borderRadius: "99px",
                    transition: "background 0.2s ease",
                  }}
                />
              );
            })}

          {/* Played portion */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progress}%`,
              background: "rgba(255,255,255,0.45)",
              borderRadius: "99px",
              transition: "width 0.1s linear",
            }}
          />

          {/* Playhead dot */}
          <div
            style={{
              position: "absolute",
              left: `${progress}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "12px",
              height: "12px",
              borderRadius: "999px",
              background: "#fff",
              boxShadow: "0 0 8px rgba(255,255,255,0.3)",
              transition: "left 0.1s linear",
            }}
          />

          {/* Hover tooltip */}
          {hoverTime !== null && (
            <div
              style={{
                position: "absolute",
                left: `${(hoverTime / duration) * 100}%`,
                bottom: "14px",
                transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.8)",
                color: "#fff",
                fontSize: "10px",
                padding: "2px 6px",
                borderRadius: "4px",
                pointerEvents: "none",
                whiteSpace: "nowrap",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {formatTime(hoverTime)}
              {getSegmentAtTime(hoverTime) && (
                <span style={{ color: "rgba(167,139,250,0.9)", marginLeft: "4px" }}>
                  · Modified
                </span>
              )}
            </div>
          )}
        </div>

        {/* Time + controls row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: "14px",
                cursor: "pointer",
                padding: 0,
                width: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {playing ? "⏸" : "▶"}
            </button>
            <div
              className="cursor-pointer"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>🔊</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolumeAndSync(parseFloat(e.target.value))}
                style={{
                  width: "64px",
                  height: "5px",
                  accentColor: "rgba(150,150,150,0.9)",
                  cursor: "pointer",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.4)",
                fontVariantNumeric: "tabular-nums",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Legend */}
          {filteredSegments.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "10px",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "2px",
                  background: "rgba(167,139,250,0.4)",
                }}
              />
              <span>{filteredSegments.length} modified section{filteredSegments.length > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
