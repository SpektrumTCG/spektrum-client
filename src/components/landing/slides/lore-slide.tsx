"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useCallback } from "react";

interface SlideProps {
  active: boolean;
}

const LORE_PAGES = [
  {
    title: "The Five Spektra",
    text: "The world is built on five elemental energies called Spektra — Fire, Water, Ground, Air, and Neutral. Each Spektrum carries unique power and defines distinct playstyles, from aggressive burn to defensive control.",
    color: "var(--spektrum-cyan)",
    image: "/character-stocks/4.png",
  },
  {
    title: "The Tribes",
    text: "Five tribes inhabit this world: Kobar (masked male warriors), Borah (masked female guardians), Kuhaka (consumed males who embraced darkness), Kujana (consumed females transformed by chaos), and Kuku (pure monsters born from chaos itself).",
    color: "var(--spektrum-purple)",
    image: "/character-stocks/7.png",
  },
  {
    title: "The Ritual",
    text: "New wielders undergo The Ritual — choosing between The Guardians (Kobar & Borah) or The Corrupted (Kuhaka & Kujana), and receiving an elemental affinity. This defines your first 40-card battle-ready deck and your path forward.",
    color: "var(--spektrum-magenta)",
    image: "/character-stocks/12.png",
  },
];

export default function LoreSlide({ active }: SlideProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const goNext = useCallback(() => {
    setSlideDirection(1);
    setCurrentPage((p) => Math.min(p + 1, LORE_PAGES.length - 1));
  }, []);
  const goPrev = useCallback(() => {
    setSlideDirection(-1);
    setCurrentPage((p) => Math.max(p - 1, 0));
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only count as horizontal swipe if horizontal movement > vertical
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    }
  }, [goNext, goPrev]);

  // Mouse drag support for desktop
  const mouseStartX = useRef(0);
  const mouseDown = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
    mouseDown.current = true;
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!mouseDown.current) return;
    mouseDown.current = false;
    const dx = e.clientX - mouseStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) goNext();
      else goPrev();
    }
  }, [goNext, goPrev]);

  return (
    <div
      className="w-full h-full relative overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-white dark:bg-[#0a0a16]" />

      {/* Section title */}
      {active && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="absolute top-14 left-6 md:top-6 z-10"
        >
          <div className="flex items-start gap-2">
            <div className="w-[3px] h-16 bg-gradient-to-b from-[#E8541E] to-transparent mt-1" />
            <div>
              <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-[#E8541E]/60 block mb-1">
                Origins
              </span>
              <h2 className="font-[family-name:var(--font-display)] font-black text-xl md:text-2xl tracking-[0.1em]  text-foreground">
                The Lore
              </h2>
            </div>
          </div>
        </motion.div>
      )}

      {/* Character as full background */}
      {active && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 z-[1] pointer-events-none scale-[2] -translate-y-[10%] md:scale-100 md:translate-y-0"
          >
            <Image
              src={LORE_PAGES[currentPage].image}
              alt={LORE_PAGES[currentPage].title}
              fill
              className="object-contain object-center"
              sizes="100vw"
              priority
            />
            {/* Overlay fade so text is readable — stronger on mobile */}
            <div
              className="absolute inset-0 hidden md:block"
              style={{
                background: `linear-gradient(to left, rgba(255,255,255,0.85) 25%, transparent 60%)`,
              }}
            />
            <div
              className="absolute inset-0 md:hidden"
              style={{
                background: `linear-gradient(to top, rgba(255,255,255,0.92) 35%, rgba(255,255,255,0.4) 60%, transparent 80%)`,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, rgba(255,255,255,0.7) 0%, transparent 20%)`,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, transparent 15%)`,
              }}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Color glow behind character */}
      <div
        className="absolute inset-0 z-0 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 40% 50%, ${LORE_PAGES[currentPage].color}12 0%, transparent 60%)`,
        }}
      />

      {/* Text content — bottom on mobile, right side on desktop */}
      {active && (
        <div className="absolute inset-0 flex items-end md:items-center justify-center md:justify-end px-6 pb-28 md:pb-0 md:px-8 lg:px-16 z-[2]">
          <div className="w-full max-w-sm lg:max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: slideDirection >= 0 ? 60 : -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: slideDirection >= 0 ? -60 : 60 }}
                transition={{ duration: 0.35 }}
              >
                <span
                  className="text-[9px] font-mono tracking-[0.4em] uppercase block mb-3"
                  style={{ color: LORE_PAGES[currentPage].color }}
                >
                  Chapter {String(currentPage + 1).padStart(2, "0")}
                </span>
                <h3 className="font-[family-name:var(--font-display)] font-bold text-2xl md:text-3xl tracking-[0.1em] uppercase text-foreground mb-5">
                  {LORE_PAGES[currentPage].title}
                </h3>
                <p className="text-foreground/50 text-sm md:text-base leading-relaxed mb-8">
                  {LORE_PAGES[currentPage].text}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={goPrev}
                className="w-8 h-8 flex items-center justify-center border border-black/[0.08] dark:border-white/[0.08] hover:border-[var(--spektrum-cyan)]/40 hover:bg-white/50 dark:hover:bg-white/[0.06] transition-all duration-300"
              >
                <svg viewBox="0 0 8 14" fill="none" className="w-2.5 h-3.5 text-foreground/30">
                  <path d="M7 1L1 7L7 13" stroke="currentColor" strokeWidth={1.5} />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                {LORE_PAGES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setSlideDirection(i > currentPage ? 1 : -1); setCurrentPage(i); }}
                    className={`h-[3px] transition-all duration-500 ${
                      currentPage === i
                        ? "w-10 bg-[var(--spektrum-cyan)]"
                        : "w-4 bg-foreground/10 hover:bg-foreground/25"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={goNext}
                className="w-8 h-8 flex items-center justify-center border border-black/[0.08] dark:border-white/[0.08] hover:border-[var(--spektrum-cyan)]/40 hover:bg-white/50 dark:hover:bg-white/[0.06] transition-all duration-300"
              >
                <svg viewBox="0 0 8 14" fill="none" className="w-2.5 h-3.5 text-foreground/30">
                  <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth={1.5} />
                </svg>
              </button>

              <span className="text-[10px] font-mono text-foreground/20 ml-2">
                {currentPage + 1} / {LORE_PAGES.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chapter tabs — bottom center-left */}
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 z-10 flex gap-1"
        >
          {LORE_PAGES.map((page, i) => (
            <button
              key={i}
              onClick={() => { setSlideDirection(i > currentPage ? 1 : -1); setCurrentPage(i); }}
              className={`py-2.5 px-3 text-left transition-all duration-300 border-t-[2px] ${
                currentPage === i
                  ? "bg-white/60 dark:bg-white/[0.06] border-t-[var(--spektrum-cyan)]"
                  : "bg-black/[0.02] dark:bg-white/[0.02] border-t-transparent hover:bg-white/40 dark:hover:bg-white/[0.05]"
              }`}
            >
              <span
                className="text-[8px] font-mono tracking-[0.3em] uppercase block mb-0.5 transition-colors duration-300"
                style={{
                  color: currentPage === i ? LORE_PAGES[i].color : "rgba(26,26,46,0.25)",
                }}
              >
                CH.{String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`text-[9px] font-bold tracking-wider uppercase leading-tight transition-colors duration-300 block ${
                  currentPage === i ? "text-foreground" : "text-foreground/30"
                }`}
              >
                {page.title}
              </span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Play the Game button — bottom right (hidden on mobile) */}
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-8 right-8 z-10 hidden md:block"
        >
          <Link
            href="/start"
            className="group relative px-8 py-3 text-white font-[family-name:var(--font-display)] font-bold text-sm tracking-[0.15em] uppercase rounded-2xl transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:brightness-110 overflow-hidden bg-gradient-to-r from-[#E8541E] to-[#f59e0b] inline-block"
          >
            Play the Game
          </Link>
        </motion.div>
      )}
    </div>
  );
}
