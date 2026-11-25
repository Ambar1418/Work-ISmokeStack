"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TRUNK_DIMENSIONS, type TrunkDimension } from "@/data/soniaData";

interface NodePos {
  id: string;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  anchor: "start" | "end" | "middle";
}

// Five organic vascular nodes arranged symmetrically around the central trunk (cx = 360, cy = 220)
const TRUNK_NODES: NodePos[] = [
  { id: "brand", x: 360, y: 72, labelX: 360, labelY: 46, anchor: "middle" },
  { id: "demand", x: 516, y: 158, labelX: 540, labelY: 162, anchor: "start" },
  {
    id: "communication",
    x: 472,
    y: 332,
    labelX: 496,
    labelY: 342,
    anchor: "start",
  },
  { id: "operations", x: 248, y: 332, labelX: 224, labelY: 342, anchor: "end" },
  { id: "people", x: 204, y: 158, labelX: 180, labelY: 162, anchor: "end" },
];

const CONNECTIONS: Array<[string, string]> = [
  ["brand", "demand"],
  ["demand", "communication"],
  ["communication", "operations"],
  ["operations", "people"],
  ["people", "brand"],
  ["brand", "communication"],
  ["brand", "operations"],
  ["demand", "operations"],
  ["demand", "people"],
  ["communication", "people"],
];

export function IdentityTrunk() {
  const prefersReducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string>("brand");

  const activeDimension: TrunkDimension =
    TRUNK_DIMENSIONS.find((d) => d.id === activeId) ?? TRUNK_DIMENSIONS[0];

  const getNode = (id: string) =>
    TRUNK_NODES.find((n) => n.id === id) ?? TRUNK_NODES[0];

  return (
    <section
      id="scene-trunk"
      aria-label="Scene 03: The Trunk and Professional Identity"
      className="relative z-10 mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32"
    >
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-3xl text-center"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#38D996]">
          Scene 03 · The Trunk
        </p>
        <h2 className="mt-3 font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-[#F5F7F4]">
          Different businesses.{" "}
          <span className="italic text-[#A6F2C8]">One consistent approach.</span>
        </h2>
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#A5B8B4]">
          Across industries, roles, and stages of growth, Sonia’s trunk stays
          anchored in five interconnected disciplines that feed one another.
        </p>
      </motion.div>

      <div className="mt-14 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        {/* Interactive Vascular Trunk SVG */}
        <div className="lg:col-span-7">
          <div className="relative mx-auto max-w-2xl">
            <svg
              viewBox="0 0 720 420"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto overflow-visible"
              role="group"
              aria-label="Interconnected trunk dimensions: Brand, Demand, Communication, Operations, and People"
            >
              <defs>
                <radialGradient id="trunkCoreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38D996" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#38D996" stopOpacity="0" />
                </radialGradient>
                <filter id="trunkGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Central organic trunk column running vertically behind the lattice */}
              <motion.path
                d="M 342 415 C 348 310 348 130 344 12"
                stroke="#38D996"
                strokeOpacity="0.22"
                strokeWidth="2"
                initial={prefersReducedMotion ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.1 }}
              />
              <motion.path
                d="M 360 418 C 358 290 362 150 360 8"
                stroke="#38D996"
                strokeOpacity="0.55"
                strokeWidth="4.5"
                filter="url(#trunkGlow)"
                initial={prefersReducedMotion ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.15 }}
              />
              <motion.path
                d="M 378 415 C 372 310 372 130 376 12"
                stroke="#A6F2C8"
                strokeOpacity="0.22"
                strokeWidth="2"
                initial={prefersReducedMotion ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.1 }}
              />

              {/* Central heartwood pulse */}
              <circle cx="360" cy="216" r="105" fill="url(#trunkCoreGlow)" />
              <circle
                cx="360"
                cy="216"
                r="14"
                fill="#061725"
                stroke="#38D996"
                strokeOpacity="0.5"
                strokeWidth="1.5"
              />
              <circle
                cx="360"
                cy="216"
                r="4.5"
                fill="#A6F2C8"
                filter="url(#trunkGlow)"
              />

              {/* Animated thin green connections between all 5 dimensions */}
              {CONNECTIONS.map(([a, b], idx) => {
                const n1 = getNode(a);
                const n2 = getNode(b);
                const isConnected = a === activeId || b === activeId;
                const midX = (n1.x + n2.x) / 2;
                const midY = (n1.y + n2.y) / 2;
                const ctrlX = midX + (360 - midX) * 0.28;
                const ctrlY = midY + (216 - midY) * 0.28;
                const pathD = `M ${n1.x} ${n1.y} Q ${ctrlX} ${ctrlY} ${n2.x} ${n2.y}`;

                return (
                  <g key={`${a}-${b}`}>
                    <motion.path
                      d={pathD}
                      stroke={isConnected ? "#38D996" : "#38D996"}
                      strokeOpacity={isConnected ? 0.78 : 0.18}
                      strokeWidth={isConnected ? 1.8 : 1}
                      initial={prefersReducedMotion ? false : { pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.9, delay: idx * 0.05 }}
                    />
                    {isConnected && !prefersReducedMotion && (
                      <motion.path
                        d={pathD}
                        stroke="#A6F2C8"
                        strokeWidth="2"
                        strokeDasharray="10 90"
                        initial={{ strokeDashoffset: 100 }}
                        animate={{ strokeDashoffset: -100 }}
                        transition={{
                          duration: 2.2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Five Interactive Dimension Nodes */}
              {TRUNK_NODES.map((node) => {
                const dim = TRUNK_DIMENSIONS.find((d) => d.id === node.id)!;
                const isActive = activeId === node.id;

                return (
                  <g
                    key={node.id}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isActive}
                    aria-label={`${dim.label}: ${dim.summary}`}
                    onClick={() => setActiveId(dim.id)}
                    onMouseEnter={() => setActiveId(dim.id)}
                    onFocus={() => setActiveId(dim.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveId(dim.id);
                      }
                    }}
                    className="cursor-pointer focus:outline-none"
                  >
                    {/* Organic link back to central trunk heartwood */}
                    <line
                      x1="360"
                      y1="216"
                      x2={node.x}
                      y2={node.y}
                      stroke="#A6F2C8"
                      strokeOpacity={isActive ? 0.55 : 0.12}
                      strokeWidth={isActive ? 1.5 : 0.8}
                      strokeDasharray="3 5"
                    />

                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isActive ? 26 : 18}
                      fill="#38D996"
                      fillOpacity={isActive ? 0.2 : 0.06}
                      className="transition-all duration-300"
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isActive ? 10 : 7}
                      fill={isActive ? "#38D996" : "#0A2130"}
                      stroke={isActive ? "#A6F2C8" : "#38D996"}
                      strokeWidth={isActive ? 2.5 : 1.6}
                      filter={isActive ? "url(#trunkGlow)" : undefined}
                    />
                    <text
                      x={node.labelX}
                      y={node.labelY}
                      textAnchor={node.anchor}
                      className={`font-serif text-xl sm:text-2xl tracking-wide transition-colors duration-200 ${
                        isActive ? "fill-[#F5F7F4]" : "fill-[#A5B8B4]"
                      }`}
                    >
                      {dim.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Interactive Dimension Narrative & Selector */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick interactive pills for effortless touch/keyboard navigation */}
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Core identity dimensions"
          >
            {TRUNK_DIMENSIONS.map((dim) => {
              const isActive = dim.id === activeId;
              return (
                <button
                  key={dim.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveId(dim.id)}
                  className={`rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-all duration-200 border ${
                    isActive
                      ? "border-[#38D996] bg-[#38D996]/15 text-[#A6F2C8] shadow-[0_0_16px_rgba(56,217,150,0.2)]"
                      : "border-[#38D996]/20 bg-[#0A2130]/50 text-[#A5B8B4] hover:border-[#38D996]/50 hover:text-[#F5F7F4]"
                  }`}
                >
                  {dim.label}
                </button>
              );
            })}
          </div>

          {/* Active dimension synthesis */}
          <motion.div
            key={activeDimension.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="botanical-glass rounded-2xl p-6 sm:p-7"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#38D996]">
              Core Trunk Dimension
            </p>
            <h3 className="mt-2 font-serif text-3xl text-[#F5F7F4]">
              {activeDimension.label}
            </h3>
            <p className="mt-3 text-lg leading-relaxed text-[#A6F2C8]">
              {activeDimension.summary}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#38D996]/15 pt-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A5B8B4]/80">
                Directly feeds:
              </span>
              {activeDimension.connectedTo.map((targetId) => {
                const target = TRUNK_DIMENSIONS.find((d) => d.id === targetId);
                if (!target) return null;
                return (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => setActiveId(target.id)}
                    className="rounded-full border border-[#38D996]/25 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#A6F2C8] hover:border-[#38D996] hover:bg-[#38D996]/10"
                  >
                    {target.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 font-mono text-[10px] text-[#A5B8B4]/65">
              {activeDimension.interpretationNote}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

