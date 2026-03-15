"use client";

interface PlayPauseOverlayProps {
  visible: boolean;
}

export function PlayPauseOverlay({ visible }: PlayPauseOverlayProps) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "999px",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: "10px solid transparent",
            borderBottom: "10px solid transparent",
            borderLeft: "16px solid #fff",
            marginLeft: "3px",
          }}
        />
      </div>
    </div>
  );
}
