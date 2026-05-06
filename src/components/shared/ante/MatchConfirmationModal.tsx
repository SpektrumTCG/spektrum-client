"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MatchFoundData, WageredCard } from '@/services/anteMatchmaking';
import { AlertTriangle, Check, Coins, Skull, Swords, Trophy, Wallet, X } from 'lucide-react';
import { useAnteBattleStore } from '@/stores/useAnteBattleStore';

interface MatchConfirmationModalProps {
  matchData: MatchFoundData;
  onConfirm: () => void;
  onCancel: () => void;
}

const rarityMeta: Record<string, { label: string; bar: string; chip: string; ring: string; glow: string }> = {
  rare: {
    label: 'Rare',
    bar: 'from-sky-400 to-cyan-500',
    chip: 'bg-sky-500/15 text-sky-200 border-sky-400/40',
    ring: 'ring-sky-400/60',
    glow: 'shadow-[0_0_28px_-8px_rgba(56,189,248,0.6)]',
  },
  super_rare: {
    label: 'Super Rare',
    bar: 'from-violet-400 to-fuchsia-500',
    chip: 'bg-violet-500/15 text-violet-200 border-violet-400/40',
    ring: 'ring-violet-400/60',
    glow: 'shadow-[0_0_28px_-8px_rgba(167,139,250,0.6)]',
  },
  mythic: {
    label: 'Mythic',
    bar: 'from-amber-300 to-orange-500',
    chip: 'bg-amber-500/20 text-amber-200 border-amber-400/50',
    ring: 'ring-amber-400/70',
    glow: 'shadow-[0_0_32px_-6px_rgba(251,191,36,0.7)]',
  },
};

const rarityKey = (r: any) => (r || '').toString().toLowerCase().replace(/\s+/g, '_');
const metaFor = (r: any) => rarityMeta[rarityKey(r)] ?? rarityMeta.rare;

function CardTile({ card, label, mine }: { card: WageredCard; label: string; mine: boolean }) {
  const meta = metaFor(card.rarity);
  return (
    <div className="flex flex-col items-center min-w-0 flex-1">
      <div className={`text-[9px] font-bold tracking-[0.22em] uppercase font-mono mb-2 ${mine ? 'text-orange-300' : 'text-rose-300'}`}>
        {label}
      </div>
      <div className={`relative w-full rounded-2xl overflow-hidden ring-2 ${meta.ring} ${meta.glow} bg-slate-900`}>
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${meta.bar} z-10`} />
        <div className="relative aspect-[2/3] bg-slate-800">
          {card.imagePath ? (
            <img src={card.imagePath} alt={card.cardName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
              <div className="text-3xl mb-1">🎴</div>
              <div className="text-[10px]">{card.cardName}</div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/95 to-transparent" />
        </div>
        <div className="px-2.5 py-2 bg-slate-950/80 border-t border-white/5">
          <h3 className="text-[13px] font-black text-white truncate leading-tight">{card.cardName}</h3>
          <div className={`mt-1 inline-flex text-[8px] font-bold tracking-[0.16em] uppercase font-mono px-1.5 py-0.5 rounded border ${meta.chip}`}>
            {meta.label}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MatchConfirmationModal({ matchData, onConfirm, onCancel }: MatchConfirmationModalProps) {
  const router = useRouter();
  const { setAnteBattle } = useAnteBattleStore();
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!confirmed) return;
    setAnteBattle(
      matchData.battleId,
      matchData.yourCard,
      matchData.opponent.wageredCard,
      'player',
      matchData.opponent.playerId
    );
    onConfirm();
    setTimeout(() => router.push('/game'), 500);
  };

  const opponentAddr = matchData.opponent.walletAddress;
  const truncatedAddr = `${opponentAddr.slice(0, 6)}…${opponentAddr.slice(-4)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/85 backdrop-blur-sm sm:items-center"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div
        className="relative w-full sm:w-[440px] flex flex-col rounded-t-3xl border-x-2 border-t-2 border-red-500/50 bg-gradient-to-b from-slate-900 to-slate-950 shadow-[0_-12px_60px_-12px_rgba(220,38,38,0.5)] overflow-hidden"
        style={{
          maxHeight: 'calc(100dvh - 64px - env(safe-area-inset-top, 0px) - 24px)',
          marginBottom: '64px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Atmospheric overlay */}
        <div
          className="absolute inset-x-0 top-0 h-48 pointer-events-none opacity-70"
          style={{
            background: 'radial-gradient(ellipse 70% 100% at 50% 0%, rgba(220,38,38,0.28), transparent 70%)',
          }}
        />

        {/* Header */}
        <div className="relative shrink-0 px-4 pt-4 pb-3 border-b border-white/5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[9px] font-bold tracking-[0.22em] uppercase px-2 py-1 rounded-md bg-red-500/15 text-red-300 border border-red-500/40 font-mono mb-2">
                <Skull size={10} /> Match Found
              </div>
              <h2 className="text-xl font-black tracking-tight text-white leading-tight">Review The Stakes</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Confirm to enter the wager battle.</p>
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

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {/* VS face-off */}
          <div className="relative">
            <div className="flex items-start gap-2">
              <CardTile card={matchData.yourCard} label="Your Stake" mine />
              <div className="self-stretch flex items-center justify-center pt-6 shrink-0 w-10">
                <div className="flex flex-col items-center gap-1">
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_20px_-4px_rgba(220,38,38,0.7)] ring-1 ring-white/20">
                    <Swords size={18} className="text-slate-950" strokeWidth={2.6} />
                  </div>
                  <span className="text-[9px] font-black tracking-[0.3em] text-white/40 font-mono">VS</span>
                </div>
              </div>
              <CardTile card={matchData.opponent.wageredCard} label="Their Stake" mine={false} />
            </div>
          </div>

          {/* Opponent identity */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 ring-1 ring-rose-400/30 flex items-center justify-center shrink-0">
              <Wallet size={16} className="text-rose-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-bold tracking-[0.22em] uppercase text-slate-500 font-mono leading-none">Opponent</div>
              <div className="font-mono text-[12px] text-white mt-1 truncate">{truncatedAddr}</div>
            </div>
            <div className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold tracking-[0.18em] uppercase font-mono px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Online
            </div>
          </div>

          {/* Stakes summary — win/lose ledger */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
              <div className="flex items-center gap-1.5 text-emerald-300 mb-1">
                <Trophy size={12} />
                <span className="text-[9px] font-bold tracking-[0.22em] uppercase font-mono">If You Win</span>
              </div>
              <p className="text-[12px] text-emerald-100/90 leading-snug">
                Take <span className="font-bold text-white">{matchData.opponent.wageredCard.cardName}</span> · keep yours
              </p>
            </div>
            <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-3">
              <div className="flex items-center gap-1.5 text-red-300 mb-1">
                <Skull size={12} />
                <span className="text-[9px] font-bold tracking-[0.22em] uppercase font-mono">If You Lose</span>
              </div>
              <p className="text-[12px] text-red-100/90 leading-snug">
                Lose <span className="font-bold text-white">{matchData.yourCard.cardName}</span> permanently
              </p>
            </div>
          </div>

          {/* Permanent loss warning */}
          <div className="rounded-xl border-2 border-red-500/40 bg-red-500/5 p-3.5">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-red-300 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-red-300 font-mono leading-none mb-1.5">
                  On-Chain Transfer Warning
                </p>
                <p className="text-[12px] text-red-100/90 leading-snug">
                  Losing transfers <span className="font-bold text-white">{matchData.yourCard.cardName}</span> to your opponent's wallet on Solana. This is irreversible.
                </p>
              </div>
            </div>
          </div>

          {/* Acknowledgement checkbox */}
          <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-3 transition-colors">
            <span className="relative shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="peer sr-only"
              />
              <span className="block w-5 h-5 rounded-md border-2 border-white/20 bg-slate-900 peer-checked:bg-red-500 peer-checked:border-red-400 transition-colors" />
              <Check
                size={14}
                strokeWidth={3.5}
                className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity"
              />
            </span>
            <span className="text-[12px] text-slate-200 leading-snug">
              I understand I may permanently lose my card if I lose this battle.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/5 bg-slate-950/60 px-3 py-3 flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-11 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-bold tracking-[0.18em] uppercase transition-colors"
          >
            <X size={14} />
            Decline
          </button>
          <button
            onClick={handleConfirm}
            disabled={!confirmed}
            className={`flex-1 relative overflow-hidden inline-flex items-center justify-center gap-1.5 h-11 rounded-lg text-[11px] font-black tracking-[0.18em] uppercase transition-all ${
              confirmed
                ? 'bg-gradient-to-br from-red-500 to-red-700 text-white border border-red-400/60 shadow-[0_0_20px_-4px_rgba(220,38,38,0.7)] hover:brightness-110'
                : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
            }`}
          >
            <Coins size={14} />
            {confirmed ? 'Accept & Battle' : 'Acknowledge to Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MatchConfirmationModal;
