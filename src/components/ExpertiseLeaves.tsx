"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CAREER_COMPANIES,
  EXPERTISE_LEAVES,
  type ExpertiseCluster,
} from "@/data/soniaData";
import { DetailPanel } from "./DetailPanel";

interface LeafCoord {
  id: string;
  x: number;
  y: number;
  angle: number;
  boughPath: string;
}

// 12 botanical leaf clusters arranged organically across the upper canopy (viewBox 800 x 430)
const LEAF_POSITIONS: LeafCoord[] = [
  // Left-lower bough (Strategy & Brand)
  {
    id: "brand-strategy",
    x: 138,
    y: 256,
    angle: -34,
    boughPath: "M 400 398 C 310 350 220 310 138 256",
  },
  {
    id: "product-marketing",
    x: 175,
    y: 172,
    angle: -22,
    boughPath: "M 400 398 C 315 320 245 245 175 172",
  },
  {
    id: "market-research",
    x: 96,
    y: 198,
    angle: -45,
    boughPath: "M 248 282 C 190 250 142 226 96 198",
  },

  // Left-upper bough (Communication & Digital)
  {
    id: "communication",
    x: 245,
    y: 108,
    angle: -16,
    boughPath: "M 400 398 C 350 280 296 190 245 108",
  },
  {
    id: "digital-marketing",
    x: 315,
    y: 68,
    angle: -8,
    boughPath: "M 400 398 C 378 265 346 165 315 68",
  },
  {
    id: "marketing-operations",
    x: 278,
    y: 204,
    angle: -26,
    boughPath: "M 355 292 C 325 256 300 228 278 204",
  },

  // Right-upper bough (Demand & Automation)
  {
    id: "demand-generation",
    x: 472,
    y: 66,
    angle: 12,
    boughPath: "M 400 398 C 425 262 450 162 472 66",
  },
  {
    id: "marketing-automation",
    x: 548,
    y: 106,
    angle: 22,
    boughPath: "M 400 398 C 454 282 504 188 548 106",
  },
  {
    id: "sales-alignment",
    x: 522,
    y: 204,
    angle: 28,
    boughPath: "M 445 292 C 474 256 498 228 522 204",
  },

  // Right-lower bough (Leadership & Advisory)
  {
    id: "team-leadership",
    x: 626,
    y: 170,
    angle: 24,
    boughPath: "M 400 398 C 485 320 558 244 626 170",
  },
  {
    id: "strategic-consulting",
    x: 696,
    y: 200,
    angle: 44,
    boughPath: "M 552 282 C 608 252 652 226 696 200",
  },
  {
    id: "growth-strategy",
    x: 656,
    y: 260,
    angle: 34,
    boughPath: "M 400 398 C 492 350 578 310 656 260",
  },
];

export function ExpertiseLeaves() {
  const prefersReducedMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState<string>("brand-strategy");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeId = hoveredId ?? selectedId;
  const activeLeaf: ExpertiseCluster =
    EXPERTISE_LEAVES.find((l) => l.id === activeId) ?? EXPERTISE_LEAVES[0];

  return (
    <section
      id="scene-leaves"
      aria-label="Scene 05: The Leaves and Expertise"
      className="relative z-10 mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32"
    >
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#38D996]">
          Scene 05 · The Leaves
        </p>
        <h2 className="mt-3 font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-[#F5F7F4]">
          Canopy of expertise
        </h2>
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#A5B8B4]">
          No skill percentages, no isolated checklists—every capability grows as
          a living cluster of leaves nourished by real career chapters.
        </p>
      </motion.div>

      {/* Desktop Interactive Canopy SVG */}
      <div className="mt-12 hidden md:block">
        <div className="relative mx-auto max-w-4xl">
          <svg
            viewBox="0 0 800 410"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto overflow-visible"
            role="group"
            aria-label="Interactive canopy of twelve expertise leaf clusters"
          >
            <defs>
              <filter id="leafGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="4.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Canopy Crown Center */}
            <circle
              cx="400"
              cy="398"
              r="7"
              fill="#38D996"
              fillOpacity="0.45"
            />
            <text
              x="400"
              y="420"
              textAnchor="middle"
              className="fill-[#A5B8B4]/60 font-mono text-[9.5px] uppercase tracking-[0.22em]"
            >
              ↑ Nourished by Career Branches
            </text>

            {/* Connecting Boughs & Interactive Leaf Clusters */}
            {LEAF_POSITIONS.map((pos, idx) => {
              const cluster = EXPERTISE_LEAVES.find((l) => l.id === pos.id)!;
              const isActive = activeId === pos.id;

              return (
                <g
                  key={pos.id}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedId === pos.id}
                  aria-label={`${cluster.label}: ${cluster.description}`}
                  onClick={() => setSelectedId(pos.id)}
                  onMouseEnter={() => setHoveredId(pos.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setSelectedId(pos.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(pos.id);
                    }
                  }}
                  className="cursor-pointer focus:outline-none"
                >
                  {/* Branch vein from canopy core */}
                  <motion.path
                    d={pos.boughPath}
                    stroke={isActive ? "#A6F2C8" : "#38D996"}
                    strokeOpacity={isActive ? 0.85 : 0.2}
                    strokeWidth={isActive ? 2 : 1.1}
                    initial={prefersReducedMotion ? false : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.9, delay: idx * 0.04 }}
                  />

                  {/* Trio of botanical leaves forming each cluster */}
                  <motion.g
                    transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.angle})`}
                    initial={
                      prefersReducedMotion ? false : { scale: 0, opacity: 0 }
                    }
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.15 + idx * 0.04,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {/* Soft glow halo */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isActive ? 28 : 18}
                      fill="#38D996"
                      fillOpacity={isActive ? 0.22 : 0.07}
                      className="transition-all duration-300"
                    />

                    {/* Center primary leaf */}
                    <path
                      d="M 0 -16 C 9 -8 9 8 0 16 C -9 8 -9 -8 0 -16 Z"
                      fill={isActive ? "#A6F2C8" : "#0A2130"}
                      stroke={isActive ? "#A6F2C8" : "#38D996"}
                      strokeWidth={isActive ? 1.8 : 1.3}
                      filter={isActive ? "url(#leafGlow)" : undefined}
                    />
                    {/* Companion left leaf */}
                    <path
                      d="M -11 -4 C -5 -11 -2 -5 -5 4 C -10 2 -13 -1 -11 -4 Z"
                      fill={isActive ? "#38D996" : "#38D996"}
                      fillOpacity={isActive ? 0.9 : 0.38}
                    />
                    {/* Companion right leaf */}
                    <path
                      d="M 11 -4 C 5 -11 2 -5 5 4 C 10 2 13 -1 11 -4 Z"
                      fill={isActive ? "#38D996" : "#38D996"}
                      fillOpacity={isActive ? 0.9 : 0.38}
                    />
                  </motion.g>

                  {/* Cluster Label */}
                  <text
                    x={pos.x}
                    y={pos.y + (pos.y < 140 ? -24 : 30)}
                    textAnchor="middle"
                    className={`font-serif text-[15px] transition-colors duration-200 ${
                      isActive ? "fill-[#F5F7F4]" : "fill-[#A5B8B4]"
                    }`}
                  >
                    {cluster.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Mobile Organic Leaf Cluster Selector */}
      <div className="mt-10 flex flex-wrap justify-center gap-2.5 md:hidden">
        {EXPERTISE_LEAVES.map((leaf) => {
          const isActive = activeId === leaf.id;
          return (
            <button
              key={leaf.id}
              type="button"
              onClick={() => setSelectedId(leaf.id)}
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs transition-all border ${
                isActive
                  ? "border-[#38D996] bg-[#38D996]/15 text-[#F5F7F4] shadow-[0_0_16px_rgba(56,217,150,0.2)]"
                  : "border-[#38D996]/20 bg-[#0A2130]/55 text-[#A5B8B4]"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isActive ? "bg-[#A6F2C8]" : "bg-[#38D996]/50"
                }`}
              />
              <span className="font-serif text-sm">{leaf.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Leaf Cluster Detail Panel */}
      <div className="mx-auto mt-8 max-w-2xl">
        <DetailPanel
          isOpen={true}
          eyebrow={`Leaf Cluster · ${activeLeaf.category}`}
          title={activeLeaf.label}
          subtitle={activeLeaf.description}
        >
          <div className="pt-1 space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#38D996]">
              Where this grew in her journey
            </p>
            <ul className="space-y-1.5 text-sm text-[#F5F7F4]/90">
              {activeLeaf.examples.map((ex) => (
                <li key={ex} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A6F2C8]" />
                  <span>{ex}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#38D996]/15">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#A5B8B4] mr-1">
              Connected Branches:
            </span>
            {activeLeaf.companyIds.map((cid) => {
              const comp = CAREER_COMPANIES.find((c) => c.id === cid);
              if (!comp) return null;
              return (
                <button
                  key={cid}
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("sonia:select-branch", { detail: cid })
                    );
                    const el = document.getElementById("scene-branches");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="rounded-full border border-[#38D996]/25 bg-[#061725]/60 px-2.5 py-0.5 font-mono text-[10px] text-[#A6F2C8] transition-colors hover:border-[#38D996] hover:bg-[#38D996]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38D996]"
                >
                  {comp.company} ↑
                </button>
              );
            })}
          </div>
        </DetailPanel>
      </div>
    </section>
  );
}
