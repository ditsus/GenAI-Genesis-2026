export type AgeGroup = "kids" | "teen" | "adult";
export type SegmentType = "romance" | "violence" | "language" | "horror" | "epileptic";

export interface Segment {
  start: number;
  end: number;
  type: SegmentType;
  description: string;
  replacement: string;
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
}

export interface AgePickerProps {
  value: AgeGroup;
  onChange: (value: AgeGroup) => void;
}

export interface VideoCardData {
  id?: string;
  title: string;
  subtitle?: string;
  image: string;
  badge: string;
}
