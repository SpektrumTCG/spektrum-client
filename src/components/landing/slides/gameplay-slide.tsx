"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import SlideBackground from "../slide-background";

interface SlideProps {
  active: boolean;
}

const FEATURES = [
  {
    title: "Turn-Based Strategy",
    subtitle: "THINK BEFORE YOU STRIKE",
    desc: "Spektrum is a turn-based card game where every decision matters. Draw, summon, evolve, and attack in carefully planned phases. Outsmart your opponent by reading the board, managing tempo, and striking at the perfect moment.",
    icon: "⚔",
    color: "var(--spektrum-cyan)",
  },
  {
    title: "Personalize Your Lore",
    subtitle: "YOUR STORY, YOUR DECK",
    desc: "Build a 40-card deck that tells your story. Choose your tribe, pick your elemental affinity, and craft a strategy that reflects your playstyle. Every deck is a personal expression of your journey through the world of Spektrum.",
    icon: "✦",
    color: "var(--spektrum-purple)",
  },
  {
    title: "Spektra Resource System",
    subtitle: "FUEL YOUR STRATEGY",
    desc: "Every turn, place one Avatar card from your hand into your Spektra Pile to generate elemental energy. Fire Avatars produce Fire Spektra, Water produces Water. Manage your resource economy — spend Spektra to summon Avatars, cast Spells, and activate Equipment abilities.",
    icon: "◇",
    color: "var(--spektrum-magenta)",
  },
  {
    title: "Avatar Evolution",
    subtitle: "LEVEL UP YOUR FIGHTERS",
    desc: "Level 1 Avatars can evolve into powerful Level 2 forms. Evolution requires matching tribes — a Kobar Level 1 evolves into a Kobar Level 2. But beware: Summoning Sickness prevents evolution on the same turn an Avatar enters play. Time your evolutions carefully.",
    icon: "⬆",
    color: "var(--spektrum-gold)",
  },
  {
    title: "Life Card System",
    subtitle: "FOUR CHANCES TO SURVIVE",
    desc: "Each player begins with 4 Life Cards drawn face-down from their deck. When your Active Avatar is defeated, you lose one Life Card — but it goes to your hand, not the graveyard. Lose all 4 Life Cards or have your Active Avatar fall with no Reserves, and the match is over.",
    icon: "♡",
    color: "var(--spektrum-cyan)",
  },
];

export default function GameplaySlide({ active }: SlideProps) {
  const [activeFeat, setActiveFeat] = useState(0);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Base geometric background */}
      <SlideBackground variant={2} />

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
                Mechanics
              </span>
              <h2 className="font-[family-name:var(--font-display)] font-black text-xl md:text-2xl tracking-[0.1em] text-foreground">
                Gameplay
              </h2>
            </div>
          </div>
        </motion.div>
      )}

      {/* Two-column layout — desktop */}
      <div className="absolute inset-0 hidden lg:flex items-center justify-center px-6">
        <div className="max-w-5xl w-full grid grid-cols-2 gap-16 h-[480px]">
          {/* Left: feature tabs */}
          {active && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col gap-1"
            >
              {FEATURES.map((feat, i) => (
                <button
                  key={feat.title}
                  onClick={() => setActiveFeat(i)}
                  className={`text-left p-5 border-l-[2px] transition-all duration-400 ${
                    activeFeat === i
                      ? "border-l-[#E8541E] bg-white/40 dark:bg-white/[0.06]"
                      : "border-l-transparent hover:bg-white/20 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-2xl transition-opacity duration-300 ${
                        activeFeat === i ? "opacity-60" : "opacity-15"
                      }`}
                      style={{ color: feat.color }}
                    >
                      {feat.icon}
                    </span>
                    <div>
                      <span
                        className="text-[8px] font-mono tracking-[0.4em] uppercase block mb-0.5 transition-colors"
                        style={{
                          color:
                            activeFeat === i
                              ? feat.color
                              : "rgba(26,26,46,0.25)",
                        }}
                      >
                        {feat.subtitle}
                      </span>
                      <h3
                        className={`font-[family-name:var(--font-display)] font-bold text-sm tracking-wider uppercase transition-colors ${
                          activeFeat === i ? "text-foreground" : "text-foreground/30"
                        }`}
                      >
                        {feat.title}
                      </h3>
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {/* Right: detail */}
          {active && (
            <motion.div
              key={activeFeat}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className=""
            >
              {/* Visual box */}
              <div className="relative aspect-[16/10] border border-black/[0.06] overflow-hidden mb-6 shadow-sm">
                <div className="absolute inset-0 bg-white dark:bg-[var(--spektrum-card)]" />
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle, ${FEATURES[activeFeat].color}10 0%, transparent 60%)`,
                  }}
                >
                  <span
                    className="text-[140px] opacity-[0.08] animate-float"
                    style={{ color: FEATURES[activeFeat].color }}
                  >
                    {FEATURES[activeFeat].icon}
                  </span>
                </div>
                <div className="absolute inset-0 scanlines opacity-15" />
                <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-black/[0.06]" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-black/[0.06]" />
                <div className="absolute bottom-3 left-3">
                  <span
                    className="text-[8px] font-mono tracking-[0.3em] uppercase px-2 py-0.5 border bg-white/70"
                    style={{
                      color: FEATURES[activeFeat].color,
                      borderColor: `${FEATURES[activeFeat].color}25`,
                    }}
                  >
                    {FEATURES[activeFeat].subtitle}
                  </span>
                </div>
              </div>

              <h3 className="font-[family-name:var(--font-display)] font-bold text-xl lg:text-2xl tracking-wider uppercase text-foreground mb-3">
                {FEATURES[activeFeat].title}
              </h3>
              <p className="text-foreground/40 text-sm leading-relaxed">
                {FEATURES[activeFeat].desc}
              </p>
              <div
                className="mt-6 h-px w-16"
                style={{
                  background: `linear-gradient(90deg, ${FEATURES[activeFeat].color}, transparent)`,
                }}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile layout — tabs + detail below */}
      {active && (
        <div className="absolute inset-0 lg:hidden flex flex-col justify-center pt-20 pb-12 px-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-1"
          >
            {FEATURES.map((feat, i) => (
              <button
                key={feat.title}
                onClick={() => setActiveFeat(i)}
                className={`w-full text-left px-4 py-3 border-l-[2px] transition-all duration-400 ${
                  activeFeat === i
                    ? "border-l-[#E8541E] bg-white/40 dark:bg-white/[0.06]"
                    : "border-l-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-lg transition-opacity duration-300 ${
                      activeFeat === i ? "opacity-60" : "opacity-15"
                    }`}
                    style={{ color: feat.color }}
                  >
                    {feat.icon}
                  </span>
                  <h3
                    className={`font-[family-name:var(--font-display)] font-bold text-xs tracking-wider uppercase transition-colors ${
                      activeFeat === i ? "text-foreground" : "text-foreground/30"
                    }`}
                  >
                    {feat.title}
                  </h3>
                </div>
              </button>
            ))}
          </motion.div>

          {/* Description shown below all tabs */}
          <motion.div
            key={activeFeat}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="px-4 mt-3 border-l-[2px] border-l-[#E8541E] ml-0"
          >
            <p className="text-foreground/40 text-xs leading-relaxed">
              {FEATURES[activeFeat].desc}
            </p>
          </motion.div>
        </div>
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
