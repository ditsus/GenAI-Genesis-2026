import { STRINGS } from "@/lib/strings";
import { VideoCardData, CardSource } from "@/lib/types";

const PIC = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const DASHBOARD_STATS = [
  { value: "6", label: STRINGS.dashboard.stats.total },
  { value: "3", label: STRINGS.dashboard.stats.processed },
  { value: "34", label: STRINGS.dashboard.stats.watched },
  { value: "Veo-3.1", label: STRINGS.dashboard.stats.model },
];

export const PLACEHOLDER_CARDS: VideoCardData[] = [
  {
    title: "Netflix — Trending",
    subtitle: "",
    image: PIC("cinema-screen", 600, 340),
    badge: STRINGS.cards.badge,
    source: "netflix",
  },
  {
    title: "YouTube — Creator Upload",
    subtitle: "",
    image: PIC("camera-lens", 600, 340),
    badge: STRINGS.cards.badge,
    source: "youtube",
  },
  {
    title: "Disney+ — Featured",
    subtitle: "",
    image: PIC("disney", 600, 340),
    badge: STRINGS.cards.badge,
    source: "disney",
  },
  {
    title: "Upload — Raw Footage",
    subtitle: "",
    image: PIC("film-reel", 600, 340),
    badge: STRINGS.cards.badge,
    source: "upload",
  },
];

/** Map tab label to filter by CardSource; null = show all. */
export const TAB_TO_SOURCE: Record<string, CardSource | null> = {
  [STRINGS.dashboard.tabs[0]]: null, // All Videos
  [STRINGS.dashboard.tabs[1]]: "youtube",
  [STRINGS.dashboard.tabs[2]]: "netflix",
  [STRINGS.dashboard.tabs[3]]: "disney",
  [STRINGS.dashboard.tabs[4]]: "upload",
};
