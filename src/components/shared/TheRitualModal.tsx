"use client"

import React, { useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Shield, Skull, Flame, Droplets, Sparkles, Check, X } from 'lucide-react';
import { useWalletStore } from '@/stores/useWalletStore';
import { useDeckStore } from '@/stores/useDeckStore';
import { toast } from 'sonner';

type Faction = 'guardians' | 'corrupted';
type Element = 'fire' | 'water';

interface TheRitualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (faction: Faction, element: Element, deckId: string) => void;
}

const FACTION_INFO = {
  guardians: {
    name: 'The Guardians',
    tribes: 'Kobar & Borah',
    description: 'High defense, healing abilities, and physical prowess. Masters of protection and endurance.',
    icon: Shield,
    color: 'from-blue-500 to-cyan-400',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-900/30',
    textColor: 'text-blue-400',
  },
  corrupted: {
    name: 'The Corrupted',
    tribes: 'Kuhaka & Kujana',
    description: 'Dark magic, powerful debuffs, and aggressive combos. Masters of destruction and chaos.',
    icon: Skull,
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-900/30',
    textColor: 'text-purple-400',
  },
};

const ELEMENT_INFO = {
  fire: {
    name: 'Fire',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-900/50',
    borderColor: 'border-orange-500',
    gradient: 'from-orange-500 to-red-600',
  },
  water: {
    name: 'Water',
    icon: Droplets,
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/50',
    borderColor: 'border-blue-400',
    gradient: 'from-blue-400 to-cyan-500',
  },
};

const getDeckId = (faction: Faction, element: Element): string => {
  if (faction === 'guardians') {
    return element === 'fire' ? 'starter-genesis-fire-kobar-borah-deck' : 'starter-genesis-water-kobar-borah-deck';
  } else {
    return element === 'fire' ? 'starter-genesis-fire-kuhaka-kujana-deck' : 'starter-genesis-water-kuhaka-kujana-deck';
  }
};

export function TheRitualModal({ isOpen, onClose, onComplete }: TheRitualModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [claiming, setClaiming] = useState(false);
  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
  const [assignedElement, setAssignedElement] = useState<Element | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinElement, setSpinElement] = useState<Element>('fire');
  const [showResult, setShowResult] = useState(false);

  const { walletAddress } = useWalletStore();

  const handleFactionSelect = useCallback((faction: Faction) => {
    setSelectedFaction(faction);
  }, []);

  const startElementSpin = useCallback(() => {
    setIsSpinning(true);
    const finalElement: Element = Math.random() < 0.5 ? 'fire' : 'water';
    let spinCount = 0;
    const maxSpins = 12;
    const spinInterval = setInterval(() => {
      setSpinElement(prev => prev === 'fire' ? 'water' : 'fire');
      spinCount++;
      if (spinCount >= maxSpins) {
        clearInterval(spinInterval);
        setSpinElement(finalElement);
        setAssignedElement(finalElement);
        setIsSpinning(false);
        setTimeout(() => setShowResult(true), 500);
      }
    }, 150 + spinCount * 30);
  }, []);

  const handleConfirmFaction = useCallback(() => {
    if (!selectedFaction) return;
    setStep(2);
    startElementSpin();
  }, [selectedFaction, startElementSpin]);

  const handleClaimDeck = useCallback(async () => {
    if (!selectedFaction || !assignedElement || claiming) return;
    setClaiming(true);

    const deckId = getDeckId(selectedFaction, assignedElement);

    try {
      if (!walletAddress) {
        toast.error('Wallet not connected. Please connect your wallet first.');
        setClaiming(false);
        return;
      }

      const connectResponse = await apiFetch('/api/player/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ walletAddress })
      });

      if (!connectResponse.ok) {
        await new Promise(r => setTimeout(r, 500));
        await apiFetch('/api/player/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ walletAddress })
        });
      }

      await new Promise(r => setTimeout(r, 300));

      let response = await apiFetch('/api/purchases/claim-starter-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ walletAddress, deckId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error === 'Starter deck already claimed') {
          await useDeckStore.getState().syncDecksFromDatabase();
          toast.success('Your starter deck is ready!', { duration: 5000 });
          onComplete(selectedFaction, assignedElement, deckId);
          setStep(3);
          return;
        }

        await new Promise(r => setTimeout(r, 1000));
        response = await apiFetch('/api/purchases/claim-starter-deck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ walletAddress, deckId })
        });

        if (!response.ok) {
          const retryError = await response.json().catch(() => ({}));
          if (retryError.error === 'Starter deck already claimed') {
            await useDeckStore.getState().syncDecksFromDatabase();
            toast.success('Your starter deck is ready!', { duration: 5000 });
            onComplete(selectedFaction, assignedElement, deckId);
            setStep(3);
            return;
          }
          throw new Error(retryError.error || 'Failed to claim starter deck');
        }
      }

      const result = await response.json();
      // Wait briefly for DB commit, then sync decks with retry
      await new Promise(r => setTimeout(r, 500));
      await useDeckStore.getState().syncDecksFromDatabase();
      // Retry if the deck didn't appear (DB replication delay)
      if (useDeckStore.getState().decks.length === 0) {
        await new Promise(r => setTimeout(r, 1500));
        await useDeckStore.getState().syncDecksFromDatabase();
      }
      toast.success(`You received: ${result.deckName} (${result.totalCards} cards)!`, { duration: 5000 });
      onComplete(selectedFaction, assignedElement, deckId);
      setStep(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to claim deck. Please try again.');
      setClaiming(false);
    }
  }, [selectedFaction, assignedElement, claiming, walletAddress, onComplete]);

  const handleFinish = useCallback(() => {
    onClose();
    router.push('/cards');
  }, [router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border-2 border-orange-500/50 rounded-2xl shadow-2xl max-w-sm w-full p-4 relative overflow-hidden max-h-[95vh] overflow-y-auto">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {step === 1 && (
          <div className="relative z-10">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-2 shadow-lg shadow-orange-500/30">
                <Sparkles className="text-white" size={26} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">The Ritual</h2>
              <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">
                You have proven yourself worthy. Choose the path that will define your destiny.
              </p>
            </div>

            <h3 className="text-xs font-semibold text-orange-400 text-center mb-3 uppercase tracking-[0.2em]">
              Choose Your Path
            </h3>

            <div className="flex flex-col gap-3 mb-5">
              {(['guardians', 'corrupted'] as Faction[]).map((faction) => {
                const info = FACTION_INFO[faction];
                const Icon = info.icon;
                const isSelected = selectedFaction === faction;
                return (
                  <button
                    key={faction}
                    onClick={() => handleFactionSelect(faction)}
                    className={`relative flex gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-300 ${
                      isSelected
                        ? `${info.borderColor} ${info.bgColor} shadow-lg`
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className={`shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} ${isSelected ? 'shadow-md' : ''}`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <div className="min-w-0 flex-1 pr-5">
                      <h4 className={`text-base font-bold leading-tight ${isSelected ? info.textColor : 'text-white'}`}>
                        {info.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 mb-1">{info.tribes}</p>
                      <p className="text-[11px] text-gray-400/80 leading-snug">{info.description}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${info.color} flex items-center justify-center`}>
                          <Check size={12} className="text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleConfirmFaction}
              disabled={!selectedFaction}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-base transition-all duration-300 ${
                selectedFaction
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedFaction ? 'Confirm Your Path' : 'Select a Faction'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="relative z-10">
            <div className="text-center mb-5">
              <h2 className="text-2xl font-bold text-white mb-1">Elemental Affinity</h2>
              <p className="text-gray-400 text-sm">
                {isSpinning ? 'The elements choose you…' : 'Your fate is sealed.'}
              </p>
            </div>

            <div className="flex justify-center mb-6">
              <div className={`relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-300 ${
                isSpinning ? 'animate-pulse' : ''
              } ${ELEMENT_INFO[spinElement].bgColor} border-4 ${ELEMENT_INFO[spinElement].borderColor}`}>
                {spinElement === 'fire' ? (
                  <Flame size={80} className={`${ELEMENT_INFO.fire.color} ${isSpinning ? 'animate-bounce' : ''}`} />
                ) : (
                  <Droplets size={80} className={`${ELEMENT_INFO.water.color} ${isSpinning ? 'animate-bounce' : ''}`} />
                )}
                {isSpinning && (
                  <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-spin" />
                )}
              </div>
            </div>

            {!isSpinning && assignedElement && selectedFaction && (
              <div className="animate-fade-in">
                <div className="text-center mb-4">
                  <h3 className={`text-2xl font-bold ${ELEMENT_INFO[assignedElement].color} mb-1`}>
                    {ELEMENT_INFO[assignedElement].name} Affinity!
                  </h3>
                  <p className="text-gray-400 text-sm">
                    The {ELEMENT_INFO[assignedElement].name.toLowerCase()} element has chosen you.
                  </p>
                </div>

                {showResult && (
                  <>
                    <div className="bg-gray-800/80 rounded-xl p-4 mb-5 border border-orange-500/30">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${FACTION_INFO[selectedFaction].color}`}>
                          {React.createElement(FACTION_INFO[selectedFaction].icon, { size: 24, className: 'text-white' })}
                        </div>
                        <div className="text-gray-500 text-xl font-light">+</div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${ELEMENT_INFO[assignedElement].gradient}`}>
                          {React.createElement(ELEMENT_INFO[assignedElement].icon, { size: 24, className: 'text-white' })}
                        </div>
                      </div>
                      <p className="text-[11px] font-semibold text-orange-400 text-center uppercase tracking-[0.2em] mb-1">
                        Your Starter Deck
                      </p>
                      <p className="text-white text-center text-lg font-bold leading-tight">
                        {ELEMENT_INFO[assignedElement].name} {FACTION_INFO[selectedFaction].tribes} Tribal
                      </p>
                      <p className="text-gray-400 text-center text-xs mt-1">40 cards ready for battle</p>
                    </div>

                    <button
                      onClick={handleClaimDeck}
                      disabled={claiming}
                      className={`w-full py-3.5 px-6 rounded-xl font-bold text-base transition-all duration-300 ${
                        claiming
                          ? 'bg-gray-700 text-gray-400 cursor-wait'
                          : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {claiming ? 'Claiming…' : 'Claim Your Deck'}
                    </button>
                  </>
                )}
              </div>
            )}

            {isSpinning && (
              <p className="text-center text-gray-500 text-sm animate-pulse">
                Determining your elemental affinity...
              </p>
            )}
          </div>
        )}

        {step === 3 && selectedFaction && assignedElement && (
          <div className="relative z-10 text-center animate-fade-in">
            <div className="mb-5">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-3 shadow-lg shadow-emerald-500/30">
                <Check size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">The Ritual is Complete!</h2>
              <p className="text-gray-400 text-sm">You have received your starter deck.</p>
            </div>

            <div className="bg-gray-800/80 rounded-xl p-4 mb-5 border border-orange-500/30">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${FACTION_INFO[selectedFaction].color}`}>
                  {React.createElement(FACTION_INFO[selectedFaction].icon, { size: 24, className: 'text-white' })}
                </div>
                <div className="text-gray-500 text-xl font-light">+</div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${ELEMENT_INFO[assignedElement].gradient}`}>
                  {React.createElement(ELEMENT_INFO[assignedElement].icon, { size: 24, className: 'text-white' })}
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 leading-tight">
                {ELEMENT_INFO[assignedElement].name} {FACTION_INFO[selectedFaction].tribes} Tribal
              </h3>
              <p className="text-orange-400 font-semibold text-sm">40 Cards</p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-base bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Building Your Deck
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default TheRitualModal;
