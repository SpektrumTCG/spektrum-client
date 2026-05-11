"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SlideBackground from "../slide-background";

interface SlideProps {
  active: boolean;
}

const LINKS = [
  {
    name: "X",
    href: "https://x.com/spektrum_play",
    handle: "@spektrum_play",
    color: "#1a1a2e",
    underConstruction: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    href: "https://t.me/spektrumtcg",
    handle: "@spektrumtcg",
    color: "#26A5E4",
    underConstruction: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    name: "Discord",
    href: "#",
    handle: "",
    color: "#5865F2",
    underConstruction: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.74 19.74 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.11 13.11 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.3 12.3 0 01-1.873.892.076.076 0 00-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 00.084.028 19.84 19.84 0 006.002-3.03.077.077 0 00.031-.056c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "#",
    handle: "",
    color: "#FF0000",
    underConstruction: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default function CommunitySlide({ active }: SlideProps) {
  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Base geometric background */}
      <SlideBackground variant={3} />

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
                Connect
              </span>
              <h2 className="font-[family-name:var(--font-display)] font-black text-xl md:text-2xl tracking-[0.1em]  text-foreground">
                Community
              </h2>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="max-w-3xl w-full text-center">
          {active && (
            <>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="font-[family-name:var(--font-display)] font-black text-2xl md:text-5xl tracking-[0.08em] uppercase text-foreground mb-2 md:mb-3"
              >
                Join as{" "}
                <span className="text-[var(--spektrum-cyan)] text-glow-cyan">
                  Lore Builder
                </span>
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-foreground/40 text-sm md:text-lg font-[family-name:var(--font-display)] tracking-[0.05em] uppercase max-w-lg mx-auto mb-6 md:mb-12 px-4 md:px-0"
              >
                in World of Spektrum
              </motion.p>
            </>
          )}

          {/* Social cards */}
          <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-2 md:gap-3 px-2 md:px-0">
            {LINKS.map((link, i) => (
              <motion.a
                key={link.name}
                href={link.underConstruction ? undefined : link.href}
                target={link.underConstruction ? undefined : "_blank"}
                rel={link.underConstruction ? undefined : "noopener noreferrer"}
                initial={active ? { opacity: 0, y: 30 } : {}}
                animate={active ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                className={`group md:w-[160px] backdrop-blur-sm p-4 md:p-6 flex flex-col items-center text-center transition-all duration-300 relative overflow-hidden shadow-sm shadow-black/[0.03] ${
                  link.underConstruction
                    ? "bg-white/30 dark:bg-white/[0.03] cursor-default"
                    : "bg-white/60 dark:bg-white/[0.06] hover:bg-white/90 dark:hover:bg-white/10"
                }`}
              >
                <div
                  className={`mb-3 transition-opacity duration-300 ${
                    link.underConstruction
                      ? "opacity-15"
                      : "opacity-30 group-hover:opacity-70"
                  }`}
                  style={{ color: link.color }}
                >
                  {link.icon}
                </div>
                <span className={`font-[family-name:var(--font-display)] font-bold text-[10px] tracking-[0.15em] uppercase mb-1 ${
                  link.underConstruction ? "text-foreground/30" : "text-foreground"
                }`}>
                  {link.name}
                </span>
                {link.underConstruction ? (
                  <span className="text-[8px] font-mono tracking-[0.1em] uppercase text-foreground/20">
                    Under Construction
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-foreground/25">
                    {link.handle}
                  </span>
                )}

                {/* Top accent */}
                {!link.underConstruction && (
                  <div
                    className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${link.color}50, transparent)`,
                    }}
                  />
                )}
              </motion.a>
            ))}
          </div>

          {/* Newsletter */}
          {active && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-6 md:mt-12 flex justify-center px-2 md:px-0"
            >
              <div className="flex max-w-md w-full">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 min-w-0 px-3 md:px-4 py-2.5 md:py-3 bg-white/60 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] text-foreground text-xs font-mono placeholder:text-foreground/25 focus:outline-none focus:border-[var(--spektrum-cyan)]/40 transition-colors"
                />
                <button className="px-4 md:px-5 py-2.5 md:py-3 bg-[var(--spektrum-cyan)] text-white font-bold text-[10px] tracking-[0.2em] uppercase hover:bg-foreground transition-colors duration-300 flex-shrink-0">
                  Subscribe
                </button>
              </div>
            </motion.div>
          )}

          {/* Play the Game button */}
          {active && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-6 md:mt-10"
            >
              <Link
                href="/start"
                className="group relative px-8 py-3 text-white font-[family-name:var(--font-display)] font-bold text-sm tracking-[0.15em] uppercase rounded-2xl transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:brightness-110 overflow-hidden bg-gradient-to-r from-[#E8541E] to-[#f59e0b] inline-block"
              >
                Play the Game
              </Link>
            </motion.div>
          )}

          {/* Footer */}
          {active && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-6 md:mt-16 text-[9px] font-mono tracking-[0.2em] uppercase text-foreground/15"
            >
              &copy; 2025 Spektrum TCG. All Rights Reserved.
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
