"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PHILOSOPHY_STATEMENTS } from "@/data/soniaData";

export function PhilosophyScene() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="scene-philosophy"
      aria-label="Scene 06: Her Philosophy"
      className="relative z-10 mx-auto max-w-5xl px-5 py-28 sm:px-8 sm:py-36"
    >
      {/* Subtle luminous canopy backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#38D996]/[0.04] blur-3xl"
      />

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#38D996]">
          Scene 06 · The Philosophy
        </p>
        <h2 className="mt-3 font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-[#F5F7F4]">
          What she believes
        </h2>
        <p className="mt-4 text-sm sm:text-base text-[#A5B8B4]">
          In her own words — the quiet convictions that guide every decision,
          conversation, and system she builds.
        </p>
      </motion.div>

      {/* Staggered Editorial Statements */}
      <div className="relative mt-20 space-y-14 sm:space-y-20">
        {PHILOSOPHY_STATEMENTS.map((item, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <motion.article
              key={item.id}
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, y: 24, x: isEven ? -14 : 14 }
              }
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: 0.8,
                delay: 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`relative flex flex-col ${
                isEven
                  ? "md:items-start md:text-left md:pr-24"
                  : "md:items-end md:text-right md:pl-24"
              }`}
            >
              <div className="max-w-2xl">
                <div
                  className={`flex items-center gap-3 ${
                    isEven ? "md:justify-start" : "md:justify-end"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#38D996] shadow-[0_0_8px_#38D996]" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#38D996]/90">
                    0{idx + 1} · {item.context}
                  </span>
                </div>

                <blockquote className="mt-3 font-serif text-3xl sm:text-4xl md:text-[2.75rem] font-light leading-[1.2] tracking-tight text-[#F5F7F4]">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>

                <div
                  aria-hidden="true"
                  className={`mt-5 h-px w-28 bg-gradient-to-r ${
                    isEven
                      ? "from-[#38D996]/55 to-transparent"
                      : "from-transparent to-[#38D996]/55 md:ml-auto"
                  }`}
                />
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

