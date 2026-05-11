"use client";

import { motion } from "framer-motion";

interface BottomBarProps {
  currentSection: number;
}

export default function BottomBar({ currentSection }: BottomBarProps) {
  if (currentSection !== 0) return null;

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.2 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2"
    >
      <a
        href="#"
        className="flex items-center gap-2 h-[44px] px-5 bg-white/70 dark:bg-white/10 backdrop-blur-sm border border-black/[0.06] dark:border-white/[0.08] hover:border-[var(--spektrum-cyan)]/40 text-foreground text-[11px] font-semibold tracking-wider uppercase transition-all duration-300 shadow-sm"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-foreground/50">
          <path d="M17.523 2H6.477L0 12l6.477 10h11.046L24 12 17.523 2zM12 16a4 4 0 110-8 4 4 0 010 8z" />
        </svg>
        Play Free
      </a>

      <a
        href="#"
        className="flex items-center gap-2 h-[44px] px-5 bg-white/70 dark:bg-white/10 backdrop-blur-sm border border-black/[0.06] dark:border-white/[0.08] hover:border-[var(--spektrum-cyan)]/40 text-foreground text-[11px] font-semibold tracking-wider uppercase transition-all duration-300 shadow-sm"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-foreground/50">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        App Store
      </a>

      <a
        href="#"
        className="flex items-center gap-2 h-[44px] px-5 bg-white/70 dark:bg-white/10 backdrop-blur-sm border border-black/[0.06] dark:border-white/[0.08] hover:border-[var(--spektrum-cyan)]/40 text-foreground text-[11px] font-semibold tracking-wider uppercase transition-all duration-300 shadow-sm"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-foreground/50">
          <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.20l2.584 1.497c.678.393.678 1.033 0 1.426l-2.206 1.278-2.534-2.534 2.156-1.667zM5.864 2.658L16.8 9.291l-2.302 2.302-8.634-8.935z" />
        </svg>
        Google Play
      </a>
    </motion.div>
  );
}
