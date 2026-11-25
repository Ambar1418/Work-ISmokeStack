"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { SONIA_IDENTITY } from "@/data/soniaData";
import { LivingTree } from "./LivingTree";

export function IntroScene() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const treeParallaxY = useTransform(scrollY, [0, 600], [0, 64]);
  const textOpacity = useTransform(scrollY, [0, 420], [1, 0.2]);

  const handleExploreClick = () => {
    const rootsEl = document.getElementById("scene-roots");
    if (rootsEl) {
      rootsEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="scene-seed"
      aria-label="Scene 01: The Seed and Identity"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#030D16] via-[#061725] to-[#061725] px-5 pt-16 pb-12 sm:px-8"
    >
      {/* Subtle radial seed aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[420px] sm:h-[580px] sm:w-[580px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#38D996]/[0.055] blur-3xl"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center">
        {/* Scene index */}
        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-3 font-mono text-[11px] uppercase tracking-[0.28em] text-[#38D996]/85"
        >
          Scene 01 · The Seed
        </motion.p>

        {/* Living Seed-to-Tree Growth Stage */}
        <motion.div
          style={prefersReducedMotion ? undefined : { y: treeParallaxY }}
          className="relative w-full max-w-[340px] sm:max-w-[430px] md:max-w-[470px]"
        >
          <LivingTree mode="intro" className="w-full h-auto" />
        </motion.div>

        {/* Editorial Identity Typography */}
        <motion.div
          style={prefersReducedMotion ? undefined : { opacity: textOpacity }}
          className="-mt-4 sm:-mt-8 flex max-w-2xl flex-col items-center text-center"
        >
          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.55, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-5xl sm:text-7xl md:text-8xl font-light tracking-[0.14em] text-[#F5F7F4] soft-emerald-text-glow"
          >
            {SONIA_IDENTITY.name}
          </motion.h1>

          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 1.85, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2 font-mono text-xs sm:text-sm uppercase tracking-[0.34em] text-[#38D996]"
          >
            {SONIA_IDENTITY.title}
          </motion.p>

          <motion.blockquote
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 2.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-serif text-2xl sm:text-3xl italic font-normal text-[#A6F2C8]"
          >
            &ldquo; {SONIA_IDENTITY.coreQuote}&rdquo;
          </motion.blockquote>

          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 2.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-[#A5B8B4]"
          >
            {SONIA_IDENTITY.supportingLine}
          </motion.p>

          {/* Scroll indicator */}
          <motion.button
            type="button"
            onClick={handleExploreClick}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.7 }}
            className="group mt-10 inline-flex items-center gap-2.5 rounded-full border border-[#38D996]/25 bg-[#0A2130]/55 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-[#A6F2C8] transition-all duration-300 hover:border-[#38D996]/65 hover:bg-[#0A2130] hover:shadow-[0_0_24px_rgba(56,217,150,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38D996]"
          >
            <span>{SONIA_IDENTITY.scrollCue}</span>
            <motion.span
              animate={
                prefersReducedMotion ? undefined : { y: [0, 4, 0] }
              }
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ArrowDown className="h-3.5 w-3.5 text-[#38D996]" />
            </motion.span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

