"use client";

import { FloatingCard } from "@/components/ui/FloatingCard";
import { GlassFrame } from "@/components/ui/GlassFrame";

const PIC = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export function PlatformCards() {
  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        height: "100vh",
        maxWidth: "780px",
        perspective: "900px",
        perspectiveOrigin: "50% 45%",
        transformStyle: "preserve-3d",
      }}
    >
      <FloatingCard
        x="-2%"
        y="12%"
        width="54%"
        rotate={8}
        translateZ={-200}
        rotateX={6}
        rotateY={-10}
        z={8}
        delay={0.2}
        driftY={-6}
        driftRotate={-0.4}
      >
        <GlassFrame>
          <div style={{ background: "#141414", padding: "10px 12px 10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  color: "#e50914",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                NETFLIX
              </span>
              {["Home", "TV Shows", "Movies", "New & Popular"].map((t) => (
                <span
                  key={t}
                  style={{ fontSize: "8px", color: "rgba(255,255,255,0.45)" }}
                >
                  {t}
                </span>
              ))}
            </div>
            <div
              style={{
                position: "relative",
                borderRadius: "5px",
                overflow: "hidden",
                marginBottom: "8px",
                aspectRatio: "21/9",
              }}
            >
              <img
                src={PIC("mandalorian", 640, 274)}
                alt="Featured"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to right, rgba(20,20,20,0.9) 0%, transparent 50%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  left: "10px",
                }}
              >
                <p
                  style={{
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: 700,
                    margin: "0 0 4px",
                  }}
                >
                  The Mandalorian
                </p>
                <div style={{ display: "flex", gap: "4px" }}>
                  <span
                    style={{
                      background: "#fff",
                      color: "#000",
                      fontSize: "7px",
                      fontWeight: 600,
                      padding: "2px 7px",
                      borderRadius: "3px",
                    }}
                  >
                    ▶ Play
                  </span>
                  <span
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      color: "#fff",
                      fontSize: "7px",
                      padding: "2px 7px",
                      borderRadius: "3px",
                    }}
                  >
                    ℹ More Info
                  </span>
                </div>
              </div>
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: "8px",
                fontWeight: 600,
                margin: "0 0 5px",
              }}
            >
              Continue Watching
            </p>
            <div style={{ display: "flex", gap: "4px" }}>
              {["western", "ocean", "mountains", "city"].map((s) => (
                <div
                  key={s}
                  style={{
                    flex: 1,
                    aspectRatio: "16/9",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={PIC(s, 160, 90)}
                    alt={s}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </GlassFrame>
      </FloatingCard>

      <FloatingCard
        x="10%"
        y="32%"
        width="56%"
        rotate={8}
        translateZ={-40}
        rotateX={6}
        rotateY={-10}
        z={12}
        delay={0.35}
        driftY={-7}
        driftRotate={-0.5}
      >
        <GlassFrame>
          <div style={{ background: "#0f0f0f" }}>
            <div style={{ position: "relative", aspectRatio: "16/9" }}>
              <img
                src={PIC("landscape-drone", 640, 360)}
                alt="YouTube video"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background:
                    "linear-gradient(transparent, rgba(0,0,0,0.8))",
                  padding: "14px 10px 7px",
                }}
              >
                <div
                  style={{
                    height: "3px",
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "99px",
                    marginBottom: "5px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "35%",
                      height: "100%",
                      background: "#ff0000",
                      borderRadius: "99px",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                  }}
                >
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderTop: "5px solid transparent",
                      borderBottom: "5px solid transparent",
                      borderLeft: "8px solid #fff",
                    }}
                  />
                  <span
                    style={{
                      color: "rgba(255,255,255,0.65)",
                      fontSize: "9px",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    0:51 / 1:46
                  </span>
                  <div style={{ flex: 1 }} />
                  <span
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "10px",
                    }}
                  >
                    ⚙
                  </span>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "10px",
                    }}
                  >
                    ⛶
                  </span>
                </div>
              </div>
            </div>
            <div style={{ padding: "7px 10px 9px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  marginBottom: "3px",
                }}
              >
                <span
                  style={{
                    color: "#ff0000",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  ▶
                </span>
                <span
                  style={{
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: 600,
                  }}
                >
                  YouTube
                </span>
              </div>
              <p
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: "9px",
                  fontWeight: 500,
                  margin: "0 0 2px",
                }}
              >
                Cinematic Aerial Landscapes — 4K Drone Footage
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: "8px",
                  margin: 0,
                }}
              >
                2.4M views · 3 weeks ago
              </p>
            </div>
          </div>
        </GlassFrame>
      </FloatingCard>

      <FloatingCard
        x="50%"
        y="14%"
        width="21%"
        rotate={8}
        translateZ={80}
        rotateX={6}
        rotateY={-10}
        z={14}
        delay={0.5}
        driftY={-9}
        driftRotate={-0.6}
      >
        <GlassFrame style={{ borderRadius: "22px" }}>
          <div
            style={{
              position: "relative",
              aspectRatio: "9/17",
              background: "#000",
            }}
          >
            <img
              src={PIC("concert-lights", 270, 510)}
              alt="TikTok"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "8px",
                left: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                TikTok
              </span>
            </div>
            <div
              style={{
                position: "absolute",
                top: "8px",
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "8px",
                  fontWeight: 500,
                }}
              >
                Following
              </span>
              <span
                style={{
                  color: "#fff",
                  fontSize: "8px",
                  fontWeight: 700,
                  borderBottom: "1px solid #fff",
                  paddingBottom: "2px",
                }}
              >
                For You
              </span>
            </div>
            <div
              style={{
                position: "absolute",
                right: "6px",
                bottom: "50px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                alignItems: "center",
              }}
            >
              {[
                { icon: "♥", label: "24.5K" },
                { icon: "💬", label: "1,203" },
                { icon: "↗", label: "Share" },
              ].map(({ icon, label }, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "8px",
                      margin: "0 auto 2px",
                    }}
                  >
                    {icon}
                  </div>
                  <span style={{ color: "#fff", fontSize: "6px" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                left: "8px",
                right: "30px",
              }}
            >
              <p
                style={{
                  color: "#fff",
                  fontSize: "7px",
                  fontWeight: 600,
                  margin: "0 0 2px",
                }}
              >
                @creator · 3h ago
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "6px",
                  margin: 0,
                }}
              >
                Best footage ever #fyp #viral
              </p>
            </div>
          </div>
        </GlassFrame>
      </FloatingCard>

      <FloatingCard
        x="62%"
        y="30%"
        width="23%"
        rotate={8}
        translateZ={180}
        rotateX={6}
        rotateY={-10}
        z={16}
        delay={0.65}
        driftY={-6}
        driftRotate={-0.5}
      >
        <GlassFrame style={{ borderRadius: "22px" }}>
          <div style={{ background: "#fafafa", aspectRatio: "9/16" }}>
            <div
              style={{
                padding: "8px 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #eee",
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#262626",
                  fontStyle: "italic",
                }}
              >
                Instagram
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                {["♡", "💬", "↗"].map((ic, i) => (
                  <span
                    key={i}
                    style={{ fontSize: "9px", color: "#262626" }}
                  >
                    {ic}
                  </span>
                ))}
              </div>
            </div>
            <div
              style={{
                padding: "8px 8px 6px",
                display: "flex",
                gap: "6px",
                borderBottom: "1px solid #eee",
              }}
            >
              {["sunset", "portrait", "flowers", "food", "travel"].map((s) => (
                <div key={s} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "999px",
                      background:
                        "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                      padding: "1.5px",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "999px",
                        overflow: "hidden",
                        border: "1.5px solid #fafafa",
                      }}
                    >
                      <img
                        src={PIC(s, 44, 44)}
                        alt={s}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div
                style={{
                  padding: "6px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={PIC("avatar1", 32, 32)}
                    alt="avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "8px",
                    fontWeight: 600,
                    color: "#262626",
                  }}
                >
                  filmmaker.co
                </span>
              </div>
              <div style={{ aspectRatio: "1", overflow: "hidden" }}>
                <img
                  src={PIC("cinema-reel", 300, 300)}
                  alt="Post"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
              <div style={{ padding: "6px 10px" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "3px",
                  }}
                >
                  {["♡", "💬", "↗"].map((ic, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "10px",
                        color: "#262626",
                      }}
                    >
                      {ic}
                    </span>
                  ))}
                </div>
                <p
                  style={{
                    fontSize: "7px",
                    fontWeight: 600,
                    color: "#262626",
                    margin: "0 0 2px",
                  }}
                >
                  1,847 likes
                </p>
                <p
                  style={{
                    fontSize: "7px",
                    color: "#8e8e8e",
                    margin: 0,
                  }}
                >
                  View all 42 comments
                </p>
              </div>
            </div>
          </div>
        </GlassFrame>
      </FloatingCard>
    </div>
  );
}
