"use client";

import { FilterBadge } from "@/components/ui/FilterBadge";
import { PlayPauseOverlay } from "@/components/ui/PlayPauseOverlay";
import { ProgressBar } from "./ProgressBar";
import { PlayerControls } from "./PlayerControls";
import { useSmartPlayer } from "@/hooks/useSmartPlayer";
import { SmartPlayerProps } from "@/lib/types";
import { API_BASE_URL } from "@/lib/constants";
import { STRINGS } from "@/lib/strings";
import type { SegmentType } from "@/lib/types";

const BADGE_LABELS: Record<SegmentType, string> = {
  romance: STRINGS.player.badge.romance,
  violence: STRINGS.player.badge.violence,
  language: STRINGS.player.badge.language,
  horror: STRINGS.player.badge.horror,
  epileptic: STRINGS.player.badge.epileptic,
};

export default function SmartPlayer({
  src,
  segments,
  ageGroup,
  activeFilters: activeFiltersOverride,
}: SmartPlayerProps) {
  const {
    mainRef,
    replRef,
    barRef,
    showRepl,
    badge,
    playing,
    duration,
    currentTime,
    hoverTime,
    setHoverTime,
    volume,
    setVolumeAndSync,
    filteredSegments,
    progress,
    onReplacementEnded,
    togglePlay,
    seek,
    getSegmentAtTime,
    formatTime,
  } = useSmartPlayer({ segments, ageGroup, activeFilters: activeFiltersOverride });

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
          src={`${API_BASE_URL}${src}`}
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
          <FilterBadge label={BADGE_LABELS[badge]} />
        )}

        <PlayPauseOverlay visible={!playing} />
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
        <ProgressBar
          barRef={barRef}
          duration={duration}
          progress={progress}
          currentTime={currentTime}
          hoverTime={hoverTime}
          filteredSegments={filteredSegments}
          getSegmentAtTime={getSegmentAtTime}
          formatTime={formatTime}
          onSeek={seek}
          onHoverTime={setHoverTime}
        />
        <PlayerControls
          playing={playing}
          volume={volume}
          currentTime={currentTime}
          duration={duration}
          filteredSegments={filteredSegments}
          formatTime={formatTime}
          onTogglePlay={togglePlay}
          onVolumeChange={setVolumeAndSync}
        />
      </div>
    </div>
  );
}
