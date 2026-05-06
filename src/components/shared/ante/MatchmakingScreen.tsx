"use client"

import React, { useEffect, useState } from 'react';
import type { WageredCard } from '@/services/anteMatchmaking';
import { AlertTriangle, Coins, Hourglass, Radar, X } from 'lucide-react';

interface MatchmakingScreenProps {
  wageredCard: WageredCard;
  onCancel: () => void;
}

const rarityMeta: Record<string, { label: string; bar: string; chip: string; ring: string; glow: string }> = {
  rare: {
    label: 'Rare',
    bar: 'from-sky-400 to-cyan-500',
    chip: 'bg-sky-500/15 text-sky-200 border-sky-400/40',
    ring: 'ring-sky-400/60',
    glow: 'shadow-[0_0_40px_-8px_rgba(56,189,248,0.65)]',
  },
  super_rare: {
    label: 'Super Rare',
    bar: 'from-violet-400 to-fuchsia-500',
    chip: 'bg-violet-500/15 text-violet-200 border-violet-400/40',
    ring: 'ring-violet-400/60',
    glow: 'shadow-[0_0_40px_-8px_rgba(167,139,250,0.65)]',
  },
  mythic: {
    label: 'Mythic',
    bar: 'from-amber-300 to-orange-500',
    chip: 'bg-amber-500/20 text-amber-200 border-amber-400/50',
    ring: 'ring-amber-400/70',
    glow: 'shadow-[0_0_44px_-6px_rgba(251,191,36,0.75)]',
  },
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export function MatchmakingScreen({ wageredCard, onCancel }: MatchmakingScreenProps) {
  const [elapsed, setElapsed] = useState(0);
  const rarityKey = (wageredCard.rarity || '').toString().toLowerCase().replace(/\s+/g, '_');
  const meta = rarityMeta[rarityKey] ?? rarityMeta.rare;

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Atmospheric backdrop layers */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(220,38,38,0.22), transparent 70%), radial-gradient(ellipse 60% 50% at 50% 80%, rgba(15,23,42,0.6), transparent 70%)',
        }}
      />
      {/* Hex mesh */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='64' viewBox='0 0 56 64'><path d='M28 0L56 16v32L28 64L0 48V16z' fill='none' stroke='white' stroke-width='1'/></svg>\")",
          backgroundSize: '56px 64px',
        }}
      />

      <div className="relative w-full max-w-sm px-4 py-6 flex flex-col items-center text-center">
        {/* Top status pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/40 text-[10px] font-bold tracking-[0.22em] uppercase font-mono mb-4">
          <Radar size={11} className="animate-pulse" />
          High-Stakes Matchmaking
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white leading-tight">Finding Opponent</h1>
        <p className="text-sm text-slate-400 mt-1 mb-6">Searching for a worthy challenger…</p>

        {/* Wagered card hero */}
        <div className="relative mb-6">
          {/* Concentric pulse rings */}
          <div className="absolute inset-0 -m-8 pointer-events-none flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" style={{ animationDuration: '2.6s' }} />
            <div className="absolute inset-4 rounded-full bg-red-500/15 animate-ping" style={{ animationDuration: '3.2s', animationDelay: '0.4s' }} />
          </div>

          <div className={`relative w-44 rounded-2xl overflow-hidden ring-2 ${meta.ring} ${meta.glow} bg-slate-900`}>
            {/* Rarity stripe */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${meta.bar} z-10`} />

            {/* Card art */}
            <div className="relative aspect-[2/3] bg-slate-800">
              {wageredCard.imagePath ? (
                <img
                  src={wageredCard.imagePath}
                  alt={wageredCard.cardName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                  <div className="text-3xl mb-1">🎴</div>
                  <div className="text-[10px] tracking-wide">{wageredCard.cardName}</div>
                </div>
              )}
              {/* Bottom gradient for legibility */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/95 to-transparent" />

              {/* Stake badge */}
              <div className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-950/80 backdrop-blur-sm border border-red-500/40 text-[9px] font-bold tracking-[0.16em] uppercase text-red-300 font-mono">
                <Coins size={10} /> Staked
              </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-2.5 bg-slate-950/80 border-t border-white/5">
              <p className="text-[9px] font-bold tracking-[0.22em] uppercase text-slate-500 font-mono leading-none">Wagered</p>
              <h3 className="text-base font-black text-white truncate mt-1 leading-tight">{wageredCard.cardName}</h3>
              <div className={`mt-1.5 inline-flex text-[9px] font-bold tracking-[0.18em] uppercase font-mono px-1.5 py-0.5 rounded border ${meta.chip}`}>
                {meta.label}
              </div>
            </div>
          </div>
        </div>

        {/* Timer + dot pulse */}
        <div className="flex items-center gap-3 mb-5">
          <Hourglass size={14} className="text-red-300" />
          <span className="text-2xl font-black tabular-nums tracking-tight text-white font-mono">
            {formatTime(elapsed)}
          </span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" />
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>

        {/* Warning callout */}
        <div className="w-full mb-5 flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/40 text-left">
          <AlertTriangle size={16} className="text-red-300 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-red-300 font-mono leading-none">Warning</p>
            <p className="text-xs text-red-100/90 mt-1 leading-snug">
              Lose this match and your <span className="font-bold">{wageredCard.cardName}</span> goes to the winner.
            </p>
          </div>
        </div>

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/15 text-white/70 hover:text-rose-300 border border-white/10 hover:border-rose-400/40 text-xs font-bold tracking-[0.18em] uppercase transition-all"
        >
          <X size={14} />
          Cancel Matchmaking
        </button>
      </div>
    </div>
  );
}

export default MatchmakingScreen;
