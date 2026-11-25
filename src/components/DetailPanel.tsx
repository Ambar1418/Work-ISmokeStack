"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface DetailPanelProps {
  isOpen: boolean;
  onClose?: () => void;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function DetailPanel({
  isOpen,
  onClose,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: DetailPanelProps) {
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.aside
          key={title}
          initial={{ opacity: 0, y: 12, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.985 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          role="region"
          aria-label={title}
          className={`botanical-glass relative rounded-2xl p-6 sm:p-7 text-left ${className}`}
        >
          {/* Subtle top luminous hairline */}
          <div
            aria-hidden="true"
            className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#38D996]/60 to-transparent"
          />

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              {eyebrow && (
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#38D996]">
                  {eyebrow}
                </p>
              )}
              <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#F5F7F4]">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-[#A6F2C8]/90 italic font-serif">
                  {subtitle}
                </p>
              )}
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label={`Close ${title} details`}
                className="shrink-0 rounded-full border border-[#38D996]/20 bg-[#061725]/60 p-1.5 text-[#A5B8B4] transition-colors hover:border-[#38D996]/50 hover:text-[#F5F7F4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38D996]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#A5B8B4]">
            {children}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

