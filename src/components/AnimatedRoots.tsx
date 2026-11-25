"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ROOTS_DATA, type RootPhilosophy } from "@/data/soniaData";
import { DetailPanel } from "./DetailPanel";

interface RootPathConfig {
  id: string;
  path: string;
  nodeX: number;
  nodeY: number;
  labelX: number;
  labelY: number;
  align: "end" | "start" | "middle";
}

// Five organic root paths descending from the central trunk crown at (420, 26)
const ROOT_SVG_GEOMETRY: RootPathConfig[] = [
  {
    id: "observe",
    path: "M 414 26 C 370 92 260 116 142 218 C 110 246 86 278 68 310",
    nodeX: 142,
    nodeY: 218,
    labelX: 132,
    labelY: 198,
    align: "end",
  },
  {
    id: "understand",
    path: "M 417 26 C 392 110 330 172 268 274 C 248 308 232 338 220 368",
    nodeX: 268,
    nodeY: 274,
    labelX: 256,
    labelY: 256,
    align: "end",
  },
  {
    id: "simplify",
    path: "M 420 26 C 420 120 416 205 420 315 C 422 350 420 375 420 398",
    nodeX: 420,
    nodeY: 315,
    labelX: 420,
    labelY: 350,
    align: "middle",
  },
  {
    id: "connect",
    path: "M 423 26 C 448 110 510 172 572 274 C 592 308 608 338 620 368",
    nodeX: 572,
    nodeY: 274,
    labelX: 584,
    labelY: 256,
    align: "start",
  },
  {
    id: "align",
    path: "M 426 26 C 470 92 580 116 698 218 C 730 246 754 278 772 310",
    nodeX: 698,
    nodeY: 218,
    labelX: 708,
    labelY: 198,
    align: "start",
  },
];

export function AnimatedRoots() {
  const prefersReducedMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState<string | null>("observe");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeId = hoveredId ?? selectedId;
  const activeRoot: RootPhilosophy | undefined = ROOTS_DATA.find(
    (r) => r.id === activeId
  );

  return (
    <section
      id="scene-roots"
      aria-label="Scene 02: The Roots and Her Thinking"
      className="relative z-10 mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32"
    >
      {/* Editorial Scene Header */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#38D996]">
          Scene 02 · The Roots
        </p>
        <h2 className="mt-3 font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-[#F5F7F4]">
          Beneath the surface
        </h2>
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#A5B8B4]">
          Before anything grows outward, it anchors downward. Explore the five
          root principles that shape how Sonia observes, diagnoses, and connects
          complexity.
        </p>
      </motion.div>

      {/* Desktop / Tablet Interactive SVG Root Network */}
      <div className="mt-12 hidden md:block">
        <div className="relative mx-auto max-w-4xl">
          <svg
            viewBox="0 0 840 420"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto overflow-visible"
            role="group"
            aria-label="Interactive root thinking diagram"
          >
            <defs>
              <filter id="rootGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="soilLine" x1="0" y1="26" x2="840" y2="26" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38D996" stopOpacity="0" />
                <stop offset="50%" stopColor="#38D996" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#38D996" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Ground horizon line & trunk base collar */}
            <path
              d="M 40 26 Q 420 18 800 26"
              stroke="url(#soilLine)"
              strokeWidth="1.2"
              strokeDasharray="4 6"
            />
            <circle
              cx="420"
              cy="26"
              r={activeRoot ? 11 : 7}
              fill="#38D996"
              fillOpacity={activeRoot ? 0.25 : 0.14}
              className="transition-all duration-300"
            />
            <circle
              cx="420"
              cy="26"
              r="4.5"
              fill="#A6F2C8"
              filter="url(#rootGlow)"
            />
            <text
              x="420"
              y="10"
              textAnchor="middle"
              className="fill-[#A5B8B4] font-mono text-[10px] tracking-[0.22em] uppercase"
            >
              TOWARD THE TRUNK ↑
            </text>

            {/* Secondary fine rootlets for organic richness */}
            {[
              "M 278 124 C 235 135 206 128 175 148",
              "M 346 184 C 318 206 300 220 278 242",
              "M 562 124 C 605 135 634 128 665 148",
              "M 494 184 C 522 206 540 220 562 242",
            ].map((d) => (
              <motion.path
                key={d}
                d={d}
                stroke="#38D996"
                strokeOpacity="0.18"
                strokeWidth="1"
                strokeLinecap="round"
                initial={prefersReducedMotion ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            ))}

            {/* Five Interactive Root Paths */}
            {ROOT_SVG_GEOMETRY.map((geom, idx) => {
              const root = ROOTS_DATA[idx];
              const isSelected = activeId === root.id;

              return (
                <g
                  key={root.id}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedId === root.id}
                  aria-label={`${root.code} ${root.title}: ${root.statement}`}
                  onClick={() => setSelectedId(root.id)}
                  onMouseEnter={() => setHoveredId(root.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setSelectedId(root.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(root.id);
                    }
                  }}
                  className="cursor-pointer focus:outline-none"
                >
                  {/* Wide invisible hit target for easy hover/click */}
                  <path
                    d={geom.path}
                    stroke="transparent"
                    strokeWidth="26"
                    strokeLinecap="round"
                  />

                  {/* Base organic root stroke */}
                  <motion.path
                    d={geom.path}
                    stroke={isSelected ? "#38D996" : "#38D996"}
                    strokeOpacity={isSelected ? 0.95 : 0.34}
                    strokeWidth={isSelected ? 3 : 1.75}
                    strokeLinecap="round"
                    filter={isSelected ? "url(#rootGlow)" : undefined}
                    initial={prefersReducedMotion ? false : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 1.15,
                      delay: idx * 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />

                  {/* Animated upward energy connection towards the trunk when active */}
                  {isSelected && !prefersReducedMotion && (
                    <motion.path
                      d={geom.path}
                      stroke="#A6F2C8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="16 140"
                      initial={{ strokeDashoffset: -160 }}
                      animate={{ strokeDashoffset: 160 }}
                      transition={{
                        duration: 1.9,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  )}

                  {/* Interactive Root Node */}
                  <circle
                    cx={geom.nodeX}
                    cy={geom.nodeY}
                    r={isSelected ? 18 : 12}
                    fill="#38D996"
                    fillOpacity={isSelected ? 0.2 : 0.08}
                    className="transition-all duration-300"
                  />
                  <circle
                    cx={geom.nodeX}
                    cy={geom.nodeY}
                    r={isSelected ? 6.5 : 4.5}
                    fill={isSelected ? "#A6F2C8" : "#0A2130"}
                    stroke="#38D996"
                    strokeWidth="2"
                    filter={isSelected ? "url(#rootGlow)" : undefined}
                  />

                  {/* Root Code & Label */}
                  <text
                    x={geom.labelX}
                    y={geom.labelY - 14}
                    textAnchor={geom.align}
                    className={`font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-200 ${
                      isSelected ? "fill-[#38D996]" : "fill-[#A5B8B4]/75"
                    }`}
                  >
                    {root.code}
                  </text>
                  <text
                    x={geom.labelX}
                    y={geom.labelY + 4}
                    textAnchor={geom.align}
                    className={`font-serif text-lg tracking-wide transition-colors duration-200 ${
                      isSelected ? "fill-[#F5F7F4]" : "fill-[#A5B8B4]"
                    }`}
                  >
                    {root.title}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Mobile Interactive Root Selector */}
      <div className="mt-10 md:hidden">
        <div className="relative pl-6 space-y-3 border-l border-[#38D996]/30">
          {ROOTS_DATA.map((root) => {
            const isSelected = activeId === root.id;
            return (
              <button
                key={root.id}
                type="button"
                onClick={() =>
                  setSelectedId(selectedId === root.id ? null : root.id)
                }
                aria-expanded={isSelected}
                className={`relative w-full text-left rounded-xl px-4 py-3.5 transition-all duration-300 border ${
                  isSelected
                    ? "border-[#38D996]/55 bg-[#0A2130]/90 shadow-[0_0_24px_rgba(56,217,150,0.12)]"
                    : "border-[#38D996]/15 bg-[#0A2130]/40 hover:border-[#38D996]/35"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute -left-[29px] top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full transition-all ${
                    isSelected
                      ? "bg-[#A6F2C8] ring-4 ring-[#38D996]/25"
                      : "bg-[#061725] border border-[#38D996]/50"
                  }`}
                />
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] tracking-[0.2em] text-[#38D996]">
                      {root.code}
                    </span>
                    <p className="font-serif text-xl text-[#F5F7F4]">
                      {root.title}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-[#A5B8B4]">
                    {isSelected ? "Active" : "Tap"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Single Active Root Detail Panel (never shows all explanations at once) */}
      <div className="mx-auto mt-6 max-w-2xl min-h-[170px]">
        {activeRoot ? (
          <DetailPanel
            isOpen={true}
            onClose={() => {
              setHoveredId(null);
              setSelectedId(null);
            }}
            eyebrow={`${activeRoot.code} — ${activeRoot.title}`}
            title={`“${activeRoot.statement}”`}
            subtitle={activeRoot.sourceNote}
          >
            <p className="text-base text-[#F5F7F4]/90">
              {activeRoot.explanation}
            </p>
            <p className="pt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#38D996]/80">
              Energy channel connected upward to central trunk ↑
            </p>
          </DetailPanel>
        ) : (
          <div className="flex h-[150px] items-center justify-center rounded-2xl border border-dashed border-[#38D996]/20 bg-[#0A2130]/25 px-6 text-center">
            <p className="font-mono text-xs tracking-[0.16em] uppercase text-[#A5B8B4]">
              Select any root above to trace its thinking upward into the trunk
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

