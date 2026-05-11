"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SlideBackground from "../slide-background";

interface SlideProps {
  active: boolean;
}

const NEWS = [
  {
    date: "2025.04.20",
    tag: "ANNOUNCEMENT",
    title: "Genesis Expansion Live — 101 Cards Now Available on Solana Devnet",
    thumb: "var(--spektrum-cyan)",
  },
  {
    date: "2025.04.15",
    tag: "DEV LOG",
    title: "MagicBlock Integration Complete — Gasless Card Reveals with Ephemeral Rollups",
    thumb: "#3d8a3d",
  },
  {
    date: "2025.04.10",
    tag: "COMMUNITY",
    title: "The Ritual is Open — Choose Your Faction and Get Your Starter Deck Free",
    thumb: "var(--spektrum-magenta)",
  },
  {
    date: "2025.04.05",
    tag: "GAMEPLAY",
    title: "Deep Dive: The 9-Phase Turn Structure and Spektra Economy Explained",
    thumb: "var(--spektrum-gold)",
  },
];

export default function NewsSlide({ active }: SlideProps) {
  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Base geometric background */}
      <SlideBackground variant={1} />

      {/* Section header */}
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
                Updates
              </span>
              <h2 className="font-[family-name:var(--font-display)] font-black text-xl md:text-2xl tracking-[0.1em]  text-foreground">
                Spektrum Daily
              </h2>
            </div>
          </div>
        </motion.div>
      )}

      {/* "MORE >" button */}
      {active && (
        <motion.a
          href="#"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute top-7 right-6 z-10 text-[10px] font-[family-name:var(--font-display)] font-bold tracking-[0.2em] uppercase text-foreground/30 hover:text-[var(--spektrum-cyan)] transition-colors bg-white/60 dark:bg-white/[0.06] backdrop-blur-sm px-4 py-2"
        >
          MORE &gt;
        </motion.a>
      )}

      {/* News grid */}
      <div className="absolute inset-0 flex items-center justify-center px-4 md:px-6 pt-16 md:pt-0">
        <div className="max-w-4xl w-full grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
          {NEWS.map((item, i) => (
            <motion.a
              key={item.title}
              href="#"
              initial={active ? { opacity: 0, y: 30 } : {}}
              animate={active ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="group relative bg-white/60 dark:bg-white/[0.06] backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 overflow-hidden shadow-sm shadow-black/[0.03]"
            >
              <div className="flex">
                {/* Thumbnail */}
                <div className="w-[80px] md:w-[150px] flex-shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[var(--spektrum-surface)]" />
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background: `radial-gradient(circle, ${item.thumb}15 0%, transparent 70%)`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rotate-45 opacity-15"
                      style={{ backgroundColor: item.thumb }}
                    />
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 p-3 md:p-4 flex flex-col justify-between min-h-[80px] md:min-h-[100px]">
                  <div>
                    <span
                      className="inline-block text-[8px] font-mono tracking-[0.2em] uppercase px-1.5 py-0.5 mb-2"
                      style={{
                        color: item.thumb,
                        backgroundColor: `color-mix(in srgb, ${item.thumb} 8%, transparent)`,
                      }}
                    >
                      {item.tag}
                    </span>
                    <h3 className="font-[family-name:var(--font-display)] font-bold text-[11px] md:text-xs tracking-wider uppercase text-foreground leading-snug group-hover:text-[var(--spektrum-cyan)] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono text-foreground/20 mt-2">
                    {item.date}
                  </span>
                </div>
              </div>

              {/* Bottom accent line on hover */}
              <div
                className="absolute bottom-0 left-0 w-0 h-[2px] group-hover:w-full transition-all duration-500"
                style={{ backgroundColor: item.thumb }}
              />
            </motion.a>
          ))}
        </div>
      </div>

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

      {/* Decorative line */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[80%] max-w-3xl h-px bg-gradient-to-r from-transparent via-black/[0.04] to-transparent hidden md:block" />
    </div>
  );
}
