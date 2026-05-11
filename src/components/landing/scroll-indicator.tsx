"use client";

import { motion } from "framer-motion";

interface ScrollIndicatorProps {
  currentSection: number;
  totalSections: number;
  onNext: () => void;
  onPrev: () => void;
}

export default function ScrollIndicator({
  currentSection,
  totalSections,
  onNext,
  onPrev,
}: ScrollIndicatorProps) {
  const isFirst = currentSection === 0;
  const isLast = currentSection === totalSections - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="fixed bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1"
    >
      {!isFirst && (
        <button
          onClick={onPrev}
          className="w-5 h-5 flex items-center justify-center text-foreground/25 hover:text-foreground/50 transition-colors"
        >
          <svg viewBox="0 0 12 8" fill="none" className="w-3 h-2">
            <path d="M1 7L6 2L11 7" stroke="currentColor" strokeWidth={1.5} />
          </svg>
        </button>
      )}

      {!isLast && (
        <button
          onClick={onNext}
          className="w-5 h-5 flex items-center justify-center"
        >
          <motion.svg
            viewBox="0 0 12 8"
            fill="none"
            className="w-3 h-2 text-foreground/30"
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth={1.5} />
          </motion.svg>
        </button>
      )}
    </motion.div>
  );
}
