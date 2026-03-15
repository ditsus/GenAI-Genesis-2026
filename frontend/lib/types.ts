export type AgeGroup = "kids" | "teen" | "adult";
export type SegmentType = "romance" | "violence" | "language" | "horror" | "epileptic";

export interface Segment {
  start: number;
  end: number;
  type: SegmentType;
  description: string;
  replacement: string;
}

/** Shape returned by GET /api/trailers (list endpoint). */
export interface TrailerListItem {
  id: string;
  title: string;
  thumbnail: string;
}

export interface Trailer {
  id: string;
  title: string;
  year: string;
  rating: string;
  genres: string[];
  description: string;
  file: string;
  thumbnail: string;
  segments: Segment[];
}

export const FILTERS: Record<AgeGroup, SegmentType[]> = {
  kids:  ["romance", "violence", "language", "horror", "epileptic"],
  teen:  ["romance", "horror", "epileptic"],
  adult: ["epileptic"],
};

// ─── Component prop interfaces ─────────────────────────────────────────────

export interface SmartPlayerProps {
  src: string;
  segments: Segment[];
  ageGroup: AgeGroup;
  /** When set, overrides age-based filters (e.g. from dashboard prefs in URL). */
  activeFilters?: SegmentType[];
}

export interface AgePickerProps {
  value: AgeGroup;
  onChange: (value: AgeGroup) => void;
}

/** Source for tab filtering (clearplay-style). */
export type CardSource = "youtube" | "netflix" | "disney" | "upload";

export interface VideoCardData {
  id?: string;
  title: string;
  subtitle?: string;
  image: string;
  badge: string;
  /** Optional source for dashboard tab filtering. */
  source?: CardSource;
}
