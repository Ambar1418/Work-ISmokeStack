"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { SCENES } from "@/data/soniaData";

export function ScrollProgress() {
  const [activeScene, setActiveScene] = useState<string>(SCENES[0].id);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001,
  });

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SCENES.forEach((scene) => {
      const el = document.getElementById(scene.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveScene(scene.id);
            }
          });
        },
        {
          rootMargin: "-35% 0px -45% 0px",
          threshold: 0.05,
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  const scrollToScene = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const currentMeta =
    SCENES.find((s) => s.id === activeScene) ?? SCENES[0];

  return (
    <>
      {/* Top whisper progress filament (all viewports) */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-40 h-[2px] bg-[#0A2130]/60 pointer-events-none"
      >
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-[#38D996]/60 via-[#38D996] to-[#A6F2C8]"
          style={{ scaleX: smoothProgress }}
        />
      </div>

      {/* Minimal mobile scene indicator pill */}
      <div className="fixed top-3 left-4 z-40 lg:hidden pointer-events-none">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#38D996]/20 bg-[#061725]/80 px-3 py-1 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[#38D996] shadow-[0_0_8px_#38D996]" />
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#A6F2C8]">
            {currentMeta.number} · {currentMeta.label}
          </span>
        </div>
      </div>

      {/* Desktop minimal vertical botanical spine indicator */}
      <nav
        aria-label="Story chapters"
        className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:flex flex-col items-end gap-3.5"
      >
        <div className="relative flex flex-col items-end gap-3.5 py-2">
          {/* Vertical delicate stem behind nodes */}
          <div
            aria-hidden="true"
            className="absolute right-[5px] top-3 bottom-3 w-px bg-gradient-to-b from-[#38D996]/10 via-[#38D996]/30 to-[#38D996]/10"
          />

          {SCENES.map((scene) => {
            const isActive = activeScene === scene.id;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => scrollToScene(scene.id)}
                aria-label={`Jump to ${scene.number} ${scene.label}`}
                aria-current={isActive ? "location" : undefined}
                className="group relative flex items-center gap-3 focus:outline-none"
              >
                <span
                  className={`font-mono text-[10px] tracking-[0.16em] uppercase transition-all duration-300 ${
                    isActive
                      ? "opacity-100 translate-x-0 text-[#A6F2C8]"
                      : "opacity-0 translate-x-2 text-[#A5B8B4] group-hover:opacity-90 group-hover:translate-x-0 group-focus-visible:opacity-90 group-focus-visible:translate-x-0"
                  }`}
                >
                  {scene.number} {scene.label}
                </span>

                <span
                  className={`relative z-10 flex items-center justify-center rounded-full transition-all duration-300 ${
                    isActive
                      ? "h-3 w-3 bg-[#38D996] shadow-[0_0_12px_rgba(56,217,150,0.85)] ring-4 ring-[#38D996]/15"
                      : "h-2.5 w-2.5 border border-[#38D996]/40 bg-[#061725] group-hover:border-[#A6F2C8] group-hover:bg-[#38D996]/40"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

