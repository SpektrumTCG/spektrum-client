"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  GENESIS_CARDS,
  type CardElement,
  type CardType,
  type GenesisCard,
} from "@/data/genesis-cards";
import SlideBackground from "../slide-background";

interface SlideProps {
  active: boolean;
}

const ELEMENT_FILTERS: { label: string; value: CardElement | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Fire", value: "Fire" },
  { label: "Water", value: "Water" },
  { label: "Neutral", value: "Neutral" },
];

const TYPE_FILTERS: { label: string; value: CardType | "All" }[] = [
  { label: "All Types", value: "All" },
  { label: "Avatar", value: "Avatar" },
  { label: "Spell", value: "Spell" },
  { label: "Quick Spell", value: "Quick Spell" },
  { label: "Ritual Armor", value: "Ritual Armor" },
  { label: "Field", value: "Field" },
  { label: "Equipment", value: "Equipment" },
  { label: "Item", value: "Item" },
];

const ELEMENT_COLORS: Record<CardElement, string> = {
  Fire: "#e03e3e",
  Water: "#0091a3",
  Neutral: "#6b6878",
};

const RARITY_COLORS: Record<string, string> = {
  Common: "#8a8a8a",
  Uncommon: "#3d8a3d",
  Rare: "#2563eb",
  "Super Rare": "#7c3aed",
  Mythic: "#d97706",
};

export default function CardsSlide({ active }: SlideProps) {
  const [elementFilter, setElementFilter] = useState<CardElement | "All">("All");
  const [typeFilter, setTypeFilter] = useState<CardType | "All">("All");
  const [search, setSearch] = useState("");
  const [selectedCard, setSelectedCard] = useState<GenesisCard | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = GENESIS_CARDS.filter((card) => {
    if (elementFilter !== "All" && card.element !== elementFilter) return false;
    if (typeFilter !== "All" && card.type !== typeFilter) return false;
    if (search && !card.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Prevent parent slide navigation when scrolling inside the gallery
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const atTop = scrollTop === 0 && e.deltaY < 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;
    if (!atTop && !atBottom) {
      e.stopPropagation();
    }
  }, []);

  // Close modal on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedCard(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Base geometric background */}
      <SlideBackground variant={4} />

      {/* Header area */}
      {active && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 pt-14 md:pt-6 px-3 md:px-8 pb-2 md:pb-3"
        >
          <div className="max-w-7xl mx-auto">
            {/* Title */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-[3px] h-12 bg-gradient-to-b from-[#E8541E] to-transparent mt-0.5" />
              <div>
                <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-[#E8541E]/60 block mb-0.5">
                  Genesis Collection
                </span>
                <h2 className="font-[family-name:var(--font-display)] font-black text-xl md:text-2xl tracking-[0.1em]  text-foreground">
                  Card Archive
                </h2>
              </div>
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
              {/* Element filters */}
              <div className="flex gap-1">
                {ELEMENT_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setElementFilter(f.value)}
                    className={`px-2 md:px-3 py-1 text-[9px] md:text-[10px] font-mono tracking-[0.15em] uppercase border transition-all duration-200 ${
                      elementFilter === f.value
                        ? "border-foreground/20 text-foreground bg-foreground/[0.06]"
                        : "border-foreground/[0.06] text-foreground/35 hover:text-foreground/55 hover:border-foreground/15"
                    }`}
                  >
                    {f.value !== "All" && (
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                        style={{ backgroundColor: ELEMENT_COLORS[f.value as CardElement] }}
                      />
                    )}
                    {f.label}
                  </button>
                ))}
              </div>

              <span className="w-px h-4 bg-foreground/10 mx-1 hidden md:block" />

              {/* Type filter dropdown */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as CardType | "All")}
                className="px-2 md:px-3 py-1 text-[9px] md:text-[10px] font-mono tracking-[0.15em] uppercase border border-foreground/[0.06] text-foreground/40 bg-transparent hover:border-foreground/15 transition-colors cursor-pointer appearance-none"
                style={{ backgroundImage: "none" }}
              >
                {TYPE_FILTERS.map((f) => (
                  <option key={f.value} value={f.value} className="bg-[var(--spektrum-deep)] text-foreground/60">
                    {f.label}
                  </option>
                ))}
              </select>

              {/* Card count + search — pushed to the right */}
              <div className="flex items-center gap-2 md:gap-3 ml-auto">
                <span className="text-[9px] md:text-[10px] font-mono text-foreground/60 whitespace-nowrap">
                  {filtered.length}
                </span>
                <div className="relative">
                  <svg viewBox="0 0 16 16" fill="none" className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-foreground/50">
                    <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth={1.5} />
                    <path d="M11 11l4 4" stroke="currentColor" strokeWidth={1.5} />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-28 md:w-44 h-7 pl-7 pr-2 text-[10px] font-mono tracking-[0.1em] border border-foreground/15 bg-transparent text-foreground/80 placeholder:text-foreground/40 focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Card Grid — scrollable */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="relative z-10 overflow-y-auto px-3 md:px-8"
        style={{ height: "calc(100% - 130px)" }}
      >
        <div className="max-w-7xl mx-auto pb-20">
          {active && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 md:gap-3"
            >
              {filtered.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.6) }}
                  onClick={() => setSelectedCard(card)}
                  className="group cursor-pointer"
                >
                  {/* Card image */}
                  <div className="relative aspect-[2.5/3.5] overflow-hidden bg-black/[0.02] border border-black/[0.06] dark:border-white/[0.06] transition-all duration-300 group-hover:border-black/15 dark:group-hover:border-white/15 group-hover:scale-[1.03] group-hover:z-10 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]">
                    <Image
                      src={card.image}
                      alt={card.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    />
                  </div>

                  {/* Card info below */}
                  <div className="mt-1.5 px-0.5">
                    <p className="text-[10px] font-[family-name:var(--font-display)] font-bold tracking-wider uppercase text-foreground/70 truncate">
                      {card.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="text-[8px] font-mono tracking-[0.15em] uppercase"
                        style={{ color: ELEMENT_COLORS[card.element] }}
                      >
                        {card.element}
                      </span>
                      <span className="w-0.5 h-0.5 rounded-full bg-foreground/15" />
                      <span
                        className="text-[8px] font-mono tracking-[0.1em] uppercase"
                        style={{ color: RARITY_COLORS[card.rarity] }}
                      >
                        {card.rarity}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="flex items-center justify-center h-60">
              <p className="text-foreground/25 text-sm font-mono">No cards match the current filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Play the Game button — bottom right */}
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-8 right-8 z-20 hidden md:block"
        >
          <Link
            href="/start"
            className="group relative px-8 py-3 text-white font-[family-name:var(--font-display)] font-bold text-sm tracking-[0.15em] uppercase rounded-2xl transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:brightness-110 overflow-hidden bg-gradient-to-r from-[#E8541E] to-[#f59e0b] inline-block"
          >
            Play the Game
          </Link>
        </motion.div>
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedCard(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative flex flex-col md:flex-row gap-4 md:gap-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-[var(--spektrum-deep)] p-4 md:p-6 border border-black/[0.08] dark:border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Large card image */}
            <div className="relative w-full md:w-[300px] flex-shrink-0 aspect-[2.5/3.5] mx-auto max-w-[200px] md:max-w-[300px]">
              <Image
                src={selectedCard.image}
                alt={selectedCard.name}
                fill
                className="object-cover"
                sizes="300px"
                priority
              />
            </div>

            {/* Card details */}
            <div className="flex-1 min-w-0">
              {/* Close button */}
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors"
              >
                <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
                  <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth={1.5} />
                </svg>
              </button>

              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[9px] font-mono tracking-[0.3em] uppercase px-2 py-0.5 border"
                  style={{
                    color: ELEMENT_COLORS[selectedCard.element],
                    borderColor: `${ELEMENT_COLORS[selectedCard.element]}30`,
                  }}
                >
                  {selectedCard.element}
                </span>
                <span
                  className="text-[9px] font-mono tracking-[0.2em] uppercase"
                  style={{ color: RARITY_COLORS[selectedCard.rarity] }}
                >
                  {selectedCard.rarity}
                </span>
              </div>

              <h3 className="font-[family-name:var(--font-display)] font-black text-2xl tracking-[0.1em] uppercase text-foreground mt-2">
                {selectedCard.name}
              </h3>

              <p className="text-foreground/40 text-xs font-mono mt-1 tracking-wide uppercase">
                {selectedCard.type}
                {selectedCard.tribe && ` \u2014 ${selectedCard.tribe}`}
                {selectedCard.level && ` \u2014 Level ${selectedCard.level}`}
              </p>

              <div className="w-12 h-px bg-foreground/10 mt-4 mb-4" />

              <p className="text-foreground/50 text-sm leading-relaxed">
                {selectedCard.description}
              </p>

              {/* Stats */}
              {(selectedCard.atk !== undefined || selectedCard.hp !== undefined) && (
                <div className="flex gap-4 mt-4">
                  {selectedCard.atk !== undefined && (
                    <div>
                      <span className="text-[8px] font-mono tracking-[0.3em] uppercase text-foreground/25 block">ATK</span>
                      <span className="font-[family-name:var(--font-display)] font-bold text-lg text-foreground/70">
                        {selectedCard.atk}
                      </span>
                    </div>
                  )}
                  {selectedCard.hp !== undefined && (
                    <div>
                      <span className="text-[8px] font-mono tracking-[0.3em] uppercase text-foreground/25 block">HP</span>
                      <span className="font-[family-name:var(--font-display)] font-bold text-lg text-foreground/70">
                        {selectedCard.hp}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="text-[9px] font-mono text-foreground/15 mt-6 tracking-[0.2em] uppercase">
                Genesis Expansion
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
