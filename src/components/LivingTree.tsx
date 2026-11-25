"use client";

import { motion, useReducedMotion } from "framer-motion";

export type TreeLayer = "all" | "roots" | "trunk" | "branches" | "leaves";

interface LivingTreeProps {
  mode: "intro" | "ecosystem";
  activeLayer?: TreeLayer;
  onSelectLayer?: (layer: TreeLayer) => void;
  className?: string;
}

const LEAF_COORDS = [
  { cx: 145, cy: 138, r: 4.5, delay: 2.35 },
  { cx: 170, cy: 108, r: 5.5, delay: 2.45 },
  { cx: 205, cy: 88, r: 5, delay: 2.55 },
  { cx: 242, cy: 76, r: 6, delay: 2.6 },
  { cx: 280, cy: 96, r: 4.5, delay: 2.5 },
  { cx: 315, cy: 72, r: 5.5, delay: 2.65 },
  { cx: 356, cy: 86, r: 6, delay: 2.55 },
  { cx: 392, cy: 112, r: 5, delay: 2.48 },
  { cx: 418, cy: 146, r: 4.5, delay: 2.62 },
  { cx: 192, cy: 152, r: 4, delay: 2.7 },
  { cx: 365, cy: 150, r: 4.5, delay: 2.68 },
  { cx: 278, cy: 52, r: 6.5, delay: 2.75 },
  { cx: 230, cy: 122, r: 4, delay: 2.72 },
  { cx: 332, cy: 120, r: 4.2, delay: 2.76 },
];

const FRUIT_COORDS = [
  { cx: 175, cy: 176, label: "Foundations" },
  { cx: 382, cy: 168, label: "Demand Scale" },
  { cx: 215, cy: 115, label: "Strategy" },
  { cx: 345, cy: 112, label: "Advisory" },
];

export function LivingTree({
  mode,
  activeLayer = "all",
  onSelectLayer,
  className = "",
}: LivingTreeProps) {
  const prefersReducedMotion = useReducedMotion();
  const isIntro = mode === "intro";
  const skipAnim = Boolean(prefersReducedMotion);

  const layerOpacity = (layer: Exclude<TreeLayer, "all">) => {
    if (isIntro || activeLayer === "all") return 1;
    return activeLayer === layer ? 1 : 0.2;
  };

  return (
    <svg
      viewBox="0 0 560 540"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Living botanical tree representing Sonia's professional identity from roots to canopy"
    >
      <defs>
        <radialGradient id="seedGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A6F2C8" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#38D996" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#38D996" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="trunkGrad" x1="280" y1="365" x2="280" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38D996" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#38D996" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#A6F2C8" stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id="rootGrad" x1="280" y1="355" x2="280" y2="505" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38D996" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#38D996" stopOpacity="0.18" />
        </linearGradient>

        <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Subtle horizon / soil boundary */}
      <motion.path
        d="M 70 356 Q 280 348 490 356"
        stroke="#38D996"
        strokeOpacity="0.18"
        strokeWidth="1"
        strokeDasharray="3 6"
        initial={isIntro && !skipAnim ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.4 }}
      />

      {/* STAGE 1: THE SEED & PULSE (centered at 280, 355) */}
      <g>
        <motion.circle
          cx="280"
          cy="355"
          r="34"
          fill="url(#seedGlow)"
          initial={isIntro && !skipAnim ? { scale: 0.2, opacity: 0 } : false}
          animate={
            skipAnim
              ? { scale: 1, opacity: 0.55 }
              : { scale: [0.8, 1.35, 0.95], opacity: [0.35, 0.75, 0.4] }
          }
          transition={{
            duration: 3.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.circle
          cx="280"
          cy="355"
          r="5"
          fill="#A6F2C8"
          filter="url(#softGlow)"
          initial={isIntro && !skipAnim ? { scale: 0, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </g>

      {/* STAGE 2: ORGANIC ROOTS GROWING DOWNWARD */}
      <g
        style={{
          opacity: layerOpacity("roots"),
          transition: "opacity 400ms ease",
          cursor: onSelectLayer ? "pointer" : "default",
        }}
        onClick={() => onSelectLayer?.("roots")}
      >
        {[
          "M 280 355 C 260 392 215 415 140 468",
          "M 276 355 C 258 408 240 452 212 496",
          "M 280 355 C 280 412 280 460 280 512",
          "M 284 355 C 304 408 324 452 352 496",
          "M 280 355 C 306 394 350 418 424 466",
          // Secondary rootlets
          "M 222 414 C 194 422 172 416 146 426",
          "M 340 416 C 366 424 390 418 418 430",
        ].map((d, idx) => (
          <motion.path
            key={d}
            d={d}
            stroke="url(#rootGrad)"
            strokeWidth={idx < 5 ? 1.8 : 1.05}
            strokeLinecap="round"
            initial={isIntro && !skipAnim ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: idx < 5 ? 0.85 : 0.48 }}
            transition={{
              duration: 1.15,
              delay: isIntro && !skipAnim ? 0.55 + idx * 0.08 : 0,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
      </g>

      {/* STAGE 3: THE FLUTED CENTRAL TRUNK */}
      <g
        style={{
          opacity: layerOpacity("trunk"),
          transition: "opacity 400ms ease",
          cursor: onSelectLayer ? "pointer" : "default",
        }}
        onClick={() => onSelectLayer?.("trunk")}
      >
        {/* Main central spine */}
        <motion.path
          d="M 280 355 C 276 296 284 246 280 176"
          stroke="url(#trunkGrad)"
          strokeWidth="4.2"
          strokeLinecap="round"
          filter="url(#softGlow)"
          initial={isIntro && !skipAnim ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 1.15,
            delay: isIntro && !skipAnim ? 1.15 : 0,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
        {/* Fluted vascular companion strands */}
        <motion.path
          d="M 271 354 C 271 300 274 252 276 185"
          stroke="#38D996"
          strokeOpacity="0.45"
          strokeWidth="1.3"
          strokeLinecap="round"
          initial={isIntro && !skipAnim ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 1.1,
            delay: isIntro && !skipAnim ? 1.25 : 0,
            ease: "easeOut",
          }}
        />
        <motion.path
          d="M 289 354 C 288 300 286 250 284 185"
          stroke="#A6F2C8"
          strokeOpacity="0.45"
          strokeWidth="1.3"
          strokeLinecap="round"
          initial={isIntro && !skipAnim ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 1.1,
            delay: isIntro && !skipAnim ? 1.3 : 0,
            ease: "easeOut",
          }}
        />
      </g>

      {/* STAGE 4: BRANCHES EXTENDING OUTWARD & INTERCONNECTING */}
      <g
        style={{
          opacity: layerOpacity("branches"),
          transition: "opacity 400ms ease",
          cursor: onSelectLayer ? "pointer" : "default",
        }}
        onClick={() => onSelectLayer?.("branches")}
      >
        {[
          // Main primary boughs
          { d: "M 278 248 C 240 225 196 198 145 142", w: 2.4, delay: 1.68 },
          { d: "M 282 238 C 324 214 366 192 418 148", w: 2.4, delay: 1.72 },
          { d: "M 278 206 C 242 172 214 134 172 108", w: 2.0, delay: 1.8 },
          { d: "M 282 200 C 318 166 350 132 390 112", w: 2.0, delay: 1.84 },
          { d: "M 280 182 C 266 142 252 108 242 78", w: 1.8, delay: 1.9 },
          { d: "M 280 182 C 296 140 310 106 316 74", w: 1.8, delay: 1.94 },
          { d: "M 280 176 C 280 130 279 92 278 54", w: 1.7, delay: 1.98 },
          // Smaller offshoots & interconnecting twigs
          { d: "M 218 202 C 206 182 198 168 192 152", w: 1.2, delay: 2.04 },
          { d: "M 342 198 C 352 178 360 165 365 150", w: 1.2, delay: 2.08 },
          { d: "M 255 138 C 232 122 216 104 205 88", w: 1.2, delay: 2.12 },
          { d: "M 306 135 C 330 116 346 102 356 86", w: 1.2, delay: 2.15 },
          // Subtle cross-branch connecting threads (connecting the dots)
          { d: "M 230 156 Q 280 138 332 156", w: 0.9, delay: 2.22 },
          { d: "M 200 118 Q 280 96 360 118", w: 0.9, delay: 2.26 },
        ].map((branch, idx) => (
          <motion.path
            key={branch.d}
            d={branch.d}
            stroke={idx >= 11 ? "#A6F2C8" : "#38D996"}
            strokeOpacity={idx >= 11 ? 0.34 : idx < 7 ? 0.85 : 0.55}
            strokeDasharray={idx >= 11 ? "3 4" : undefined}
            strokeWidth={branch.w}
            strokeLinecap="round"
            initial={isIntro && !skipAnim ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 0.9,
              delay: isIntro && !skipAnim ? branch.delay : 0,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}

        {/* Growth / Fruit points in ecosystem mode */}
        {!isIntro &&
          FRUIT_COORDS.map((fruit) => (
            <g key={fruit.label}>
              <circle
                cx={fruit.cx}
                cy={fruit.cy}
                r="8"
                fill="#38D996"
                fillOpacity="0.16"
              />
              <circle
                cx={fruit.cx}
                cy={fruit.cy}
                r="3.2"
                fill="#A6F2C8"
                filter="url(#softGlow)"
              />
            </g>
          ))}
      </g>

      {/* STAGE 5: GLOWING CANOPY LEAVES */}
      <g
        style={{
          opacity: layerOpacity("leaves"),
          transition: "opacity 400ms ease",
          cursor: onSelectLayer ? "pointer" : "default",
        }}
        onClick={() => onSelectLayer?.("leaves")}
      >
        {LEAF_COORDS.map((leaf, idx) => (
          <motion.g
            key={`${leaf.cx}-${leaf.cy}`}
            initial={isIntro && !skipAnim ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.55,
              delay: isIntro && !skipAnim ? leaf.delay : 0,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Outer soft aura */}
            <circle
              cx={leaf.cx}
              cy={leaf.cy}
              r={leaf.r * 2.5}
              fill="#38D996"
              fillOpacity={0.1}
            />
            {/* Botanical leaf silhouette */}
            <ellipse
              cx={leaf.cx}
              cy={leaf.cy}
              rx={leaf.r * 1.45}
              ry={leaf.r * 0.85}
              transform={`rotate(${idx % 2 === 0 ? -28 : 28} ${leaf.cx} ${leaf.cy})`}
              fill={idx % 3 === 0 ? "#A6F2C8" : "#38D996"}
              fillOpacity={0.85}
              filter="url(#softGlow)"
            />
          </motion.g>
        ))}
      </g>
    </svg>
  );
}

