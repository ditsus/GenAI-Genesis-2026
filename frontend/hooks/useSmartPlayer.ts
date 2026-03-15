"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Segment, AgeGroup, FILTERS, SegmentType } from "@/lib/types";
import { API_BASE_URL } from "@/lib/constants";

export interface UseSmartPlayerProps {
  segments: Segment[];
  ageGroup: AgeGroup;
  /** When set, overrides age-based filters (e.g. from dashboard prefs in URL). */
  activeFilters?: SegmentType[];
}

function buildReplacementUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export function useSmartPlayer({ segments, ageGroup, activeFilters: activeFiltersOverride }: UseSmartPlayerProps) {
  const mainRef = useRef<HTMLVideoElement>(null);
  const replRef = useRef<HTMLVideoElement>(null);
  const [showRepl, setShowRepl] = useState(false);
  const [badge, setBadge] = useState<SegmentType | null>(null);
  const activeSegRef = useRef<Segment | null>(null);
  const replacingRef = useRef(false);
  const activeFilters = activeFiltersOverride ?? FILTERS[ageGroup];
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [volume, setVolume] = useState(1);
  const barRef = useRef<HTMLDivElement>(null);

  const filteredSegments = segments.filter((s) =>
    activeFilters.includes(s.type)
  );

  const showReplacementAt = useCallback((seg: Segment, mainTime: number) => {
    const repl = replRef.current;
    const main = mainRef.current;
    if (!repl) return;
    const offset = Math.max(0, mainTime - seg.start);
    const replSrc = buildReplacementUrl(seg.replacement);
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
    setBadge(seg.type);
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
    setShowRepl(false);
    setBadge(null);
    activeSegRef.current = null;
    replacingRef.current = false;
    mainRef.current?.play().catch(() => {});
  }, [ageGroup, activeFilters]);

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

  const onReplacementEnded = useCallback(() => {
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
  }, []);

  const togglePlay = useCallback(() => {
    const video = mainRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, []);

  const seek = useCallback(
    (clientX: number) => {
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
    },
    [duration, segments, activeFilters, showRepl, showReplacementAt]
  );

  const setVolumeAndSync = useCallback((v: number) => {
    const val = Math.max(0, Math.min(1, v));
    setVolume(val);
    if (mainRef.current) mainRef.current.volume = val;
  }, []);

  const getSegmentAtTime = useCallback(
    (t: number) =>
      filteredSegments.find((s) => t >= s.start && t < s.end),
    [filteredSegments]
  );

  const formatTime = useCallback((t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return {
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
  };
}
