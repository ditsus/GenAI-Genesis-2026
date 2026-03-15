import { STRINGS } from "@/lib/strings";
import { VideoCardData } from "@/lib/types";

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
  },
  {
    title: "YouTube — Creator Upload",
    subtitle: "",
    image: PIC("camera-lens", 600, 340),
    badge: STRINGS.cards.badge,
  },
  {
    title: "Upload — Raw Footage",
    subtitle: "",
    image: PIC("film-reel", 600, 340),
    badge: STRINGS.cards.badge,
  },
];
