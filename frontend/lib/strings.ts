/**
 * Centralized copy and UI strings. Replace with i18n (e.g. next-intl) when adding locales.
 */
export const STRINGS = {
  app: {
    name: "REEL",
    tagline: "Optimized video for all major platforms.",
  },
  nav: {
    back: "←",
    getStarted: "Get Started",
    learnMore: "Learn more",
    newVideo: "+ New Video",
    privacy: "Privacy",
    terms: "Terms",
    videos: "Videos",
  },
  dashboard: {
    tabs: ["All Videos", "YouTube", "Netflix", "Disney+", "Uploads"] as const,
    preferences: "Preferences",
    customPreferences: "Custom Preferences",
    customPreferencesPlaceholder: "Enter your preferences…",
    connectionPending:
      "Backend connection pending. Running in Frontend-only mode.",
    retry: "Retry",
    stats: {
      total: "Total",
      processed: "Processed",
      watched: "Watched",
      model: "Model",
    },
    prefGroups: {
      sensory: "Sensory",
      sensoryItems: [
        "Epileptic",
        "Loud Volume",
        "Motion sickness",
        "Colour-blindness",
      ],
      socialSafety: "Social Safety",
      socialSafetyItems: [
        "Profanity",
        "Political bias",
        "Commercial neutral",
        "Intimacy",
      ],
    },
  },
  player: {
    modified: "Modified",
    modifiedSections: (n: number) =>
      `${n} modified section${n === 1 ? "" : "s"}`,
    modifications: "Modifications",
    modificationCount: (n: number) =>
      `${n} modification${n === 1 ? "" : "s"} active`,
    aiReplacementReady: "AI replacement ready",
    badge: {
      romance: "Romance filtered",
      violence: "Violence filtered",
      language: "Language filtered",
      horror: "Horror filtered",
      epileptic: "Epileptic content filtered",
    },
  },
  agePicker: {
    viewer: "Viewer",
    kids: "Kids",
    kidsSub: "All filtered",
    teen: "Teen",
    teenSub: "Partial filter",
    adult: "Adult",
    adultSub: "Unfiltered",
  },
  cards: {
    badge: "CLIP",
  },
  home: {
    heroTitleLine1: "Optimized video for all",
    heroTitleLine2: "major platforms.",
    learnMoreModal: {
      title: "Why REEL?",
      tagline:
        "Next-generation video accessibility and safety, powered by generative AI.",
      bullet1: "Real-time Video Modification",
      desc1:
        "Apply filters and replacements as you watch—no pre-processing delay.",
      bullet2: "Context-Aware Replacements",
      desc2:
        "Intelligently identifies scenes and objects to ensure seamless replacements.",
      bullet3: "Safety-First Content Filtering",
      desc3:
        "Age-appropriate and preference-driven filtering so content fits your audience.",
      close: "Close",
      footer: "Built for the GenAI Genesis 2026 by James Sheng & Damir Alibayev",
    },
  },
} as const;
