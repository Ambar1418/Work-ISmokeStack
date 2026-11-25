"use client";

import { motion, useReducedMotion } from "framer-motion";

interface Spore {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  opacity: number;
}

// Deterministic pseudo-random spore coordinates to prevent SSR/CSR hydration mismatch
const SPORES: Spore[] = Array.from({ length: 28 }, (_, i) => {
  const s1 = ((i * 73 + 19) % 97) / 97;
  const s2 = ((i * 41 + 53) % 89) / 89;
  const s3 = ((i * 29 + 11) % 83) / 83;
  return {
    id: i,
    x: 4 + s1 * 92,
    y: 4 + s2 * 92,
    size: 1.5 + (i % 3) * 0.9,
    duration: 9 + s3 * 10,
    delay: (i % 7) * 0.9,
    driftX: ((i % 2 === 0 ? 1 : -1) * (10 + s2 * 18)),
    opacity: 0.16 + s3 * 0.36,
  };
});

export function AmbientParticles() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Subtle organic atmospheric radial vignettes */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 24%, rgba(56, 217, 150, 0.055) 0%, transparent 55%), radial-gradient(circle at 18% 72%, rgba(166, 242, 200, 0.03) 0%, transparent 45%), radial-gradient(circle at 82% 55%, rgba(56, 217, 150, 0.035) 0%, transparent 48%)",
        }}
      />

      {/* Continuous subtle central botanical light meridian */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#38D996]/10 to-transparent" />

      {SPORES.map((spore) =>
        prefersReducedMotion ? (
          <span
            key={spore.id}
            className="absolute rounded-full bg-[#A6F2C8]"
            style={{
              left: `${spore.x}%`,
              top: `${spore.y}%`,
              width: `${spore.size}px`,
              height: `${spore.size}px`,
              opacity: spore.opacity * 0.6,
            }}
          />
        ) : (
          <motion.span
            key={spore.id}
            className="absolute rounded-full bg-[#A6F2C8]"
            style={{
              left: `${spore.x}%`,
              top: `${spore.y}%`,
              width: `${spore.size}px`,
              height: `${spore.size}px`,
              boxShadow: "0 0 8px rgba(56, 217, 150, 0.45)",
            }}
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{
              opacity: [0, spore.opacity, spore.opacity * 0.4, 0],
              y: [0, -34, -68],
              x: [0, spore.driftX, spore.driftX * 0.4],
            }}
            transition={{
              duration: spore.duration,
              delay: spore.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )
      )}
    </div>
  );
}

