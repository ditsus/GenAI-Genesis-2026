"use client";

import { Segment } from "@/lib/types";
import { STRINGS } from "@/lib/strings";

interface ProgressBarProps {
  barRef: React.RefObject<HTMLDivElement | null>;
  duration: number;
  progress: number;
  currentTime: number;
  hoverTime: number | null;
  filteredSegments: Segment[];
  getSegmentAtTime: (t: number) => Segment | undefined;
  formatTime: (t: number) => string;
  onSeek: (clientX: number) => void;
  onHoverTime: (t: number | null) => void;
}

export function ProgressBar({
  barRef,
  duration,
  progress,
  currentTime,
  hoverTime,
  filteredSegments,
  getSegmentAtTime,
  formatTime,
  onSeek,
  onHoverTime,
}: ProgressBarProps) {
  return (
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
        onSeek(e.clientX);
      }}
      onMouseMove={(e) => {
        const rect = barRef.current?.getBoundingClientRect();
        if (rect && duration) {
          const pct = (e.clientX - rect.left) / rect.width;
          onHoverTime(pct * duration);
        }
      }}
      onMouseLeave={() => onHoverTime(null)}
    >
      {/* Modification zones */}
      {duration > 0 &&
        filteredSegments.map((seg, i) => {
          const left = (seg.start / duration) * 100;
          const width = ((seg.end - seg.start) / duration) * 100;
          const isActive =
            getSegmentAtTime(currentTime)?.start === seg.start;
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
      {hoverTime !== null && duration > 0 && (
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
            <span
              style={{
                color: "rgba(167,139,250,0.9)",
                marginLeft: "4px",
              }}
            >
              · {STRINGS.player.modified}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
