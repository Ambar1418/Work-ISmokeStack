"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp, ExternalLink } from "lucide-react";
import { SONIA_IDENTITY } from "@/data/soniaData";
import { LivingTree, type TreeLayer } from "./LivingTree";

const LAYER_OPTIONS: Array<{ id: TreeLayer; label: string; note: string }> = [
  {
    id: "all",
    label: "Complete System",
    note: "Roots, trunk, branches, fruits, and leaves operating as one living architecture.",
  },
  {
    id: "roots",
    label: "Roots",
    note: "Observation, deep understanding, simplification, systems thinking, and alignment.",
  },
  {
    id: "trunk",
    label: "Trunk",
    note: "Brand, Demand, Communication, Operations, and People held in balance.",
  },
  {
    id: "branches",
    label: "Branches",
    note: "Nearly two decades of progressive leadership plus concurrent advisory roles.",
  },
  {
    id: "leaves",
    label: "Leaves",
    note: "Twelve interconnected areas of marketing, operational, and leadership expertise.",
  },
];

export function ConnectionEnding() {
  const prefersReducedMotion = useReducedMotion();
  const [activeLayer, setActiveLayer] = useState<TreeLayer>("all");

  const activeLayerMeta =
    LAYER_OPTIONS.find((l) => l.id === activeLayer) ?? LAYER_OPTIONS[0];

  const scrollToTop = () => {
    const seed = document.getElementById("scene-seed");
    if (seed) {
      seed.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer
      id="scene-connection"
      aria-label="Scene 07: The Connection and Ending"
      className="relative z-10 overflow-hidden bg-gradient-to-b from-transparent via-[#061725] to-[#030D16] px-5 pt-24 pb-20 sm:px-8 sm:pt-32 sm:pb-24"
    >
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#38D996]">
            Scene 07 · The Connection
          </p>
          <h2 className="mt-4 mx-auto max-w-3xl font-serif text-3xl sm:text-5xl font-light leading-tight text-[#F5F7F4]">
            {SONIA_IDENTITY.closingStatementLine1}
            <br />
            <span className="italic text-[#A6F2C8]">
              {SONIA_IDENTITY.closingStatementLine2}
            </span>
          </h2>
        </motion.div>

        {/* Interactive Unified Tree Stage */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-10 max-w-[440px]"
        >
          <LivingTree
            mode="ecosystem"
            activeLayer={activeLayer}
            onSelectLayer={setActiveLayer}
            className="w-full h-auto"
          />
        </motion.div>

        {/* Interactive Ecosystem Layer Switcher */}
        <div className="mx-auto mt-4 max-w-2xl text-center">
          <div className="flex flex-wrap justify-center gap-2">
            {LAYER_OPTIONS.map((layer) => {
              const isActive = activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setActiveLayer(layer.id)}
                  className={`rounded-full px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-all border ${
                    isActive
                      ? "border-[#38D996] bg-[#38D996]/15 text-[#A6F2C8]"
                      : "border-[#38D996]/20 bg-[#0A2130]/45 text-[#A5B8B4] hover:border-[#38D996]/45 hover:text-[#F5F7F4]"
                  }`}
                >
                  {layer.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs sm:text-sm text-[#A5B8B4]">
            {activeLayerMeta.note}
          </p>
        </div>

        {/* Final Signature */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mt-16 flex flex-col items-center text-center"
        >
          <p className="font-serif text-4xl sm:text-5xl font-light tracking-[0.22em] text-[#F5F7F4] soft-emerald-text-glow">
            {SONIA_IDENTITY.name}
          </p>
          <p className="mt-2 font-serif text-xl italic text-[#A6F2C8]">
            &ldquo;{SONIA_IDENTITY.closingTagline}&rdquo;
          </p>
          <p className="mt-3 max-w-md text-xs leading-relaxed text-[#A5B8B4]/85">
            {SONIA_IDENTITY.mainStatement}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {SONIA_IDENTITY.linkedinUrl ? (
              <a
                href={SONIA_IDENTITY.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#38D996]/40 bg-[#0A2130]/75 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#A6F2C8] transition-all hover:border-[#38D996] hover:shadow-[0_0_20px_rgba(56,217,150,0.22)]"
              >
                <span>Connect on LinkedIn</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <span
                title="Verified LinkedIn profile URL can be attached in soniaData.ts"
                className="inline-flex items-center gap-2 rounded-full border border-[#38D996]/20 bg-[#0A2130]/45 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#A5B8B4]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#38D996]/70" />
                LinkedIn Profile Link · Ready upon URL confirmation
              </span>
            )}

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 rounded-full border border-[#38D996]/25 bg-transparent px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#A5B8B4] transition-colors hover:border-[#38D996]/60 hover:text-[#F5F7F4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38D996]"
            >
              <span>Return to Seed</span>
              <ArrowUp className="h-3.5 w-3.5 text-[#38D996]" />
            </button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

