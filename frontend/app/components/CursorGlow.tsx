"use client";

import { useEffect, useRef, useState } from "react";

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !ref.current) return;
    const g = ref.current;

    const onMouseMove = (e: MouseEvent) => {
      g.style.left = e.clientX + "px";
      g.style.top = e.clientY + "px";
      g.style.opacity = "1";
    };
    const onMouseLeave = () => {
      g.style.opacity = "0";
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={ref}
      id="cursor-glow"
      aria-hidden
      style={{ opacity: 0 }}
    />
  );
}
