"use client";

import { Segment } from "@/lib/types";
import { STRINGS } from "@/lib/strings";

interface PlayerControlsProps {
  playing: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  filteredSegments: Segment[];
  formatTime: (t: number) => string;
  onTogglePlay: () => void;
  onVolumeChange: (v: number) => void;
}

export function PlayerControls({
  playing,
  volume,
  currentTime,
  duration,
  filteredSegments,
  formatTime,
  onTogglePlay,
  onVolumeChange,
}: PlayerControlsProps) {
  return (
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
            onTogglePlay();
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
          <span
            style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}
          >
            🔊
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) =>
              onVolumeChange(parseFloat(e.target.value))
            }
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
          <span>
            {STRINGS.player.modifiedSections(filteredSegments.length)}
          </span>
        </div>
      )}
    </div>
  );
}
