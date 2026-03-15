"use client";

import { motion } from "framer-motion";

export interface FloatingCardProps {
  children: React.ReactNode;
  x: string;
  y: string;
  width: string;
  rotate: number;
  translateZ?: number;
  rotateX?: number;
  rotateY?: number;
  z: number;
  delay: number;
  driftY?: number;
  driftRotate?: number;
}

export function FloatingCard({
  children,
  x,
  y,
  width,
  rotate,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  z,
  delay,
  driftY = -6,
  driftRotate = 0.8,
}: FloatingCardProps) {
  const loadDelay = delay * 0.08;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        zIndex: z,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 0, rotate }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, driftY, 0],
          rotate: [rotate, rotate + driftRotate, rotate],
        }}
        transition={{
          opacity: { duration: 0.35, delay: loadDelay, ease: [0.22, 1, 0.36, 1] },
          scale: { duration: 0.35, delay: loadDelay, ease: [0.22, 1, 0.36, 1] },
          y: { duration: 6 + delay * 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
          rotate: { duration: 6 + delay * 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
        }}
        style={{
          rotateX,
          rotateY,
          translateZ,
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
