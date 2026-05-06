"use client"

import React, { useState, useMemo } from 'react';
import type { Card } from '@/domain/game/types';
import { canWagerCard } from '@/services/anteMatchmaking';
import { AlertTriangle, Check, Coins, Search, X } from 'lucide-react';

interface WagerCardSelectorProps {
  cards: Card[];
  onSelectCard: (card: Card) => void;
  onCancel: () => void;
}

type RarityKey = 'all' | 'rare' | 'super_rare' | 'mythic';

const rarityMeta: Record<Exclude<RarityKey, 'all'>, { label: string; bar: string; chip: string; ring: string; glow: string }> = {
  rare: {
    label: 'Rare',
    bar: 'from-sky-400 to-cyan-500',
    chip: 'bg-sky-500/15 text-sky-200 border-sky-400/40',
    ring: 'ring-sky-400/60',
    glow: 'shadow-[0_0_24px_-8px_rgba(56,189,248,0.6)]',
  },
  super_rare: {
    label: 'Super Rare',
    bar: 'from-violet-400 to-fuchsia-500',
    chip: 'bg-violet-500/15 text-violet-200 border-violet-400/40',
    ring: 'ring-violet-400/60',
    glow: 'shadow-[0_0_24px_-8px_rgba(167,139,250,0.6)]',
  },
  mythic: {
    label: 'Mythic',
    bar: 'from-amber-300 to-orange-500',
    chip: 'bg-amber-500/20 text-amber-200 border-amber-400/50',
    ring: 'ring-amber-400/70',
    glow: 'shadow-[0_0_28px_-6px_rgba(251,191,36,0.7)]',
  },
};

function normalizeRarity(raw: any): Exclude<RarityKey, 'all'> | null {
  if (!raw) return null;
  const v = raw.toString().toLowerCase().replace(/\s+/g, '_');
  if (v === 'rare' || v === 'super_rare' || v === 'mythic') return v;
  return null;
}

export function WagerCardSelector({ cards, onSelectCard, onCancel }: WagerCardSelectorProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [rarityFilter, setRarityFilter] = useState<RarityKey>('all');

  const eligibleCards = useMemo(() => cards.filter(c => canWagerCard(c)), [cards]);

  const counts = useMemo(() => {
    const c = { all: 0, rare: 0, super_rare: 0, mythic: 0 } as Record<RarityKey, number>;
    eligibleCards.forEach(card => {
      c.all++;
      const r = normalizeRarity((card as any).rarity);
      if (r) c[r]++;
    });
    return c;
  }, [eligibleCards]);

  const filteredCards = useMemo(() => {
    if (rarityFilter === 'all') return eligibleCards;
    return eligibleCards.filter(card => normalizeRarity((card as any).rarity) === rarityFilter);
  }, [eligibleCards, rarityFilter]);

  const groupedCards = useMemo(() => {
    const groups = new Map<string, { card: Card; count: number }>();
    filteredCards.forEach(card => {
      const key = card.name + '|' + ((card as any).rarity || '');
      const existing = groups.get(key);
      if (existing) existing.count++;
      else groups.set(key, { card, count: 1 });
    });
    return Array.from(groups.values());
  }, [filteredCards]);

  const handleConfirm = () => {
    if (selectedCard) onSelectCard(selectedCard);
  };

  const tabs: { key: RarityKey; label: string; activeRing: string; activeText: string }[] = [
    { key: 'all', label: 'All', activeRing: 'bg-white text-slate-900', activeText: '' },
    { key: 'rare', label: 'Rare', activeRing: 'bg-sky-500 text-sky-950', activeText: 'sky' },
    { key: 'super_rare', label: 'Super', activeRing: 'bg-violet-500 text-violet-950', activeText: 'violet' },
    { key: 'mythic', label: 'Mythic', activeRing: 'bg-amber-400 text-amber-950', activeText: 'amber' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-end justify-center z-50 sm:items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div
        className="relative w-full sm:w-[400px] flex flex-col rounded-t-3xl border-x-2 border-t-2 border-red-500/50 bg-gradient-to-b from-slate-900 to-slate-950 shadow-[0_-12px_60px_-12px_rgba(220,38,38,0.45)] overflow-hidden"
        style={{
          maxHeight: 'calc(100dvh - 64px - env(safe-area-inset-top, 0px) - 24px)',
          marginBottom: '64px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Atmospheric overlay */}
        <div
          className="absolute inset-x-0 top-0 h-40 pointer-events-none opacity-60"
          style={{
            background: 'radial-gradient(ellipse 70% 100% at 50% 0%, rgba(220,38,38,0.25), transparent 70%)',
          }}
        />

        {/* Header */}
        <div className="relative shrink-0 px-4 pt-4 pb-3 border-b border-white/5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[9px] font-bold tracking-[0.22em] uppercase px-2 py-1 rounded-md bg-red-500/15 text-red-300 border border-red-500/40 font-mono mb-2">
                <AlertTriangle size={10} /> High-Stakes Wager
              </div>
              <h2 className="text-lg font-black tracking-tight text-white leading-tight">Select Your Stake</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Rare, Super Rare, or Mythic cards only.</p>
            </div>
            <button
              onClick={onCancel}
              aria-label="Close"
              className="shrink-0 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Rarity tabs */}
        <div className="shrink-0 px-3 py-2.5 border-b border-white/5 flex gap-1.5 overflow-x-auto">
          {tabs.map(tab => {
            const active = rarityFilter === tab.key;
            const count = counts[tab.key];
            return (
              <button
                key={tab.key}
                onClick={() => setRarityFilter(tab.key)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-[0.12em] uppercase font-mono transition-all ${
                  active
                    ? `${tab.activeRing} shadow-[0_0_18px_-6px_currentColor]`
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {tab.label}
                <span className={`text-[9px] px-1 rounded ${active ? 'bg-black/20' : 'bg-white/10 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Card grid */}
        <div className="flex-1 overflow-y-auto p-3 min-h-0">
          {groupedCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-3">
                <Search size={20} className="text-red-300/70" />
              </div>
              <p className="text-sm font-bold text-white">No eligible cards</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                You need at least one Rare, Super Rare, or Mythic card to enter Ante Mode.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {groupedCards.map(({ card, count }) => {
                const rarity = normalizeRarity((card as any).rarity);
                const meta = rarity ? rarityMeta[rarity] : null;
                const isSelected = selectedCard?.id === card.id;
                return (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className={`group relative flex flex-col rounded-xl overflow-hidden bg-slate-800/80 ring-2 transition-all text-left ${
                      isSelected
                        ? `${meta?.ring ?? 'ring-red-400/60'} ${meta?.glow ?? ''} scale-[1.03]`
                        : 'ring-white/5 hover:ring-white/20'
                    }`}
                  >
                    {/* Rarity stripe */}
                    {meta && (
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${meta.bar} z-10`} />
                    )}

                    {/* Count badge */}
                    {count > 1 && (
                      <div className="absolute top-1.5 right-1.5 z-20 inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-slate-900/90 backdrop-blur-sm text-white text-[10px] font-black ring-1 ring-white/20">
                        ×{count}
                      </div>
                    )}

                    {/* Selected check overlay */}
                    {isSelected && (
                      <div className="absolute top-1.5 left-1.5 z-20 w-6 h-6 rounded-full bg-red-500 ring-2 ring-slate-950 flex items-center justify-center">
                        <Check size={14} strokeWidth={3} className="text-white" />
                      </div>
                    )}

                    {/* Art */}
                    <div className="relative aspect-[2/3] bg-slate-900 flex items-center justify-center overflow-hidden">
                      {((card as any).imagePath || card.art) ? (
                        <img
                          src={(card as any).imagePath || card.art}
                          alt={card.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-slate-500 text-center p-1">
                          <div className="text-2xl">🎴</div>
                          <div className="text-[8px] leading-tight mt-1">{card.name}</div>
                        </div>
                      )}
                      {/* Bottom gradient for legibility */}
                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/95 to-transparent" />
                    </div>

                    {/* Footer label */}
                    <div className="relative px-2 py-1.5 bg-slate-900">
                      <div className="font-bold text-[11px] text-white truncate leading-tight">{card.name}</div>
                      {meta && (
                        <div className={`mt-0.5 inline-flex text-[8px] font-bold tracking-[0.16em] uppercase font-mono px-1.5 py-0.5 rounded border ${meta.chip}`}>
                          {meta.label}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/5 bg-slate-950/60 px-3 py-3 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            {selectedCard ? (
              <div className="flex items-center gap-2 min-w-0">
                <Coins size={14} className="text-red-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold tracking-[0.18em] uppercase text-slate-500 font-mono leading-none">Wagering</p>
                  <p className="text-[12px] font-bold text-white truncate leading-tight">{selectedCard.name}</p>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">Tap a card to wager.</p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="px-3 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-bold tracking-[0.16em] uppercase transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedCard}
            className={`relative overflow-hidden px-4 h-9 rounded-lg text-[11px] font-black tracking-[0.18em] uppercase transition-all ${
              selectedCard
                ? 'bg-gradient-to-br from-red-500 to-red-700 text-white border border-red-400/60 shadow-[0_0_18px_-4px_rgba(220,38,38,0.7)] hover:brightness-110'
                : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
            }`}
          >
            {selectedCard ? 'Wager It' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WagerCardSelector;
