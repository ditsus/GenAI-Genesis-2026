"use client";

import { STRINGS } from "@/lib/strings";
import { GLASS_BORDER, GLASS_BG } from "@/lib/theme";

interface PreferenceChipsProps {
  prefs: Record<string, boolean>;
  onPrefToggle: (key: string) => void;
  /** Custom preferences text (controlled from parent for URL passing). */
  customPrefs?: string;
  onCustomPrefsChange?: (value: string) => void;
  /** Applied custom text (shown after clicking Enter). */
  appliedCustomPrefs?: string;
  onApplyCustomPrefs?: () => void;
  /** Show "Applied" checkmark state on the button. */
  showCheckmark?: boolean;
}

export function PreferenceChips({
  prefs,
  onPrefToggle,
  customPrefs = "",
  onCustomPrefsChange,
  appliedCustomPrefs,
  onApplyCustomPrefs,
  showCheckmark = false,
}: PreferenceChipsProps) {
  const groups = [
    {
      label: STRINGS.dashboard.prefGroups.sensory,
      items: STRINGS.dashboard.prefGroups.sensoryItems,
    },
    {
      label: STRINGS.dashboard.prefGroups.socialSafety,
      items: STRINGS.dashboard.prefGroups.socialSafetyItems,
    },
  ];

  return (
    <div style={{ marginTop: "18px" }}>
      <h2
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "#ffffff",
          margin: "0 0 12px",
          letterSpacing: "-0.01em",
        }}
      >
        {STRINGS.dashboard.preferences}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {groups.map((group) => (
          <div key={group.label}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.6)",
                margin: "0 0 6px",
              }}
            >
              {group.label}
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
              }}
            >
              {group.items.map((item) => {
                const key = `${group.label}:${item}`;
                const active = prefs[key];
                return (
                  <button
                    key={item}
                    onClick={() => onPrefToggle(key)}
                    style={{
                      borderRadius: "999px",
                      border: GLASS_BORDER,
                      background: "rgba(255,255,255,0.03)",
                      color: "rgba(255,255,255,0.65)",
                      textDecoration: active ? "line-through" : "none",
                      textDecorationThickness: active ? "3px" : undefined,
                      fontSize: "11px",
                      padding: "5px 10px",
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                      transition: "text-decoration 0.15s ease",
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ marginTop: "4px" }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.6)",
              margin: "0 0 6px",
            }}
          >
            {STRINGS.dashboard.customPreferences}
          </p>
          <textarea
            placeholder={STRINGS.dashboard.customPreferencesPlaceholder}
            value={customPrefs}
            onChange={(e) => onCustomPrefsChange?.(e.target.value)}
            style={{
              width: "100%",
              height: "120px",
              borderRadius: "12px",
              border: GLASS_BORDER,
              background: GLASS_BG,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              color: "rgba(255,255,255,0.9)",
              fontSize: "11px",
              padding: "10px 12px",
              resize: "none",
              overflow: "hidden",
              fontFamily: "'Inter', sans-serif",
              boxSizing: "border-box",
            }}
          />
          {onApplyCustomPrefs && (
            <button
              type="button"
              className={`enter-prefs-btn${showCheckmark ? " applied" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const trimmed = customPrefs?.trim() ?? "";
                if (trimmed) onApplyCustomPrefs();
              }}
            >
              <span>{showCheckmark ? "Applied" : "Enter"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
