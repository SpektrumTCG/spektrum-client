"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { anteMatchmaking, cardToWageredCard, type WageredCard, type MatchFoundData, type BattleCompletedData } from '@/services/anteMatchmaking';
import type { Card } from '@/domain/game/types';
import { useDeckStore } from '@/stores/useDeckStore';
import { useAnteBattleStore } from '@/stores/useAnteBattleStore';
import { WagerCardSelector } from './WagerCardSelector';
import { MatchmakingScreen } from './MatchmakingScreen';
import { MatchConfirmationModal } from './MatchConfirmationModal';
import { AnteBattleResultScreen } from './AnteBattleResultScreen';
import { toast } from 'sonner';

interface AnteModeManagerProps {
  userCards: Card[];
  playerId: string;
  walletAddress: string;
  onClose: () => void;
}

type AnteState = 'selecting' | 'matchmaking' | 'match_found' | 'confirmed' | 'in_battle' | 'battle_complete';

export function AnteModeManager({ userCards, playerId, walletAddress, onClose }: AnteModeManagerProps) {
  const router = useRouter();
  const { addCard, removeCard, ownedCards, decks, activeDeckId } = useDeckStore();
  const { setAnteBattle } = useAnteBattleStore();
  const [state, setState] = useState<AnteState>('selecting');
  const [wageredCard, setWageredCard] = useState<WageredCard | null>(null);
  const [matchData, setMatchData] = useState<MatchFoundData | null>(null);
  const [battleId, setBattleId] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<{ won: boolean; data: BattleCompletedData } | null>(null);

  const wageredCardRef = useRef<WageredCard | null>(null);
  const matchDataRef = useRef<MatchFoundData | null>(null);

  useEffect(() => { wageredCardRef.current = wageredCard; }, [wageredCard]);
  useEffect(() => { matchDataRef.current = matchData; }, [matchData]);

  useEffect(() => {
    anteMatchmaking.connect();

    anteMatchmaking.setCallbacks({
      onMatchFound: (data) => {
        setMatchData(data);
        setBattleId(data.battleId);
        setState('match_found');
        toast.success('Opponent found!');
      },
      onBattleStart: (battleId) => {
        setState('in_battle');

        const currentWager = wageredCardRef.current;
        const currentMatch = matchDataRef.current;
        if (currentWager && currentMatch) {
          setAnteBattle(
            battleId,
            currentWager,
            currentMatch.opponent.wageredCard,
            playerId,
            currentMatch.opponent.playerId
          );
        }

        router.push('/game');
      },
      onBattleCompleted: (data) => {
        const won = data.winnerId === playerId;

        if (won && data.wonCard) {
          const wonCard = userCards.find(c => c.id === data.wonCard!.cardId || c.name === data.wonCard!.cardName);
          if (wonCard) addCard(wonCard);
        } else if (!won && data.lostCard) {
          const lostCard = ownedCards.find(c => c.id === data.lostCard!.cardId || c.name === data.lostCard!.cardName);
          if (lostCard) removeCard(lostCard.id);
        }

        setBattleResult({ won, data });
        setState('battle_complete');
      },
      onQueueJoined: (data) => {
        toast.info(`Searching for ${data.rarity} opponents...`);
      },
      onQueueCancelled: () => {
        setState('selecting');
        setWageredCard(null);
      },
      onError: (message) => {
        toast.error(message);
        setState('selecting');
      }
    });

    return () => {
      if (state === 'matchmaking') {
        anteMatchmaking.cancelQueue(playerId);
      }
      anteMatchmaking.disconnect();
    };
  }, [playerId, userCards, ownedCards, addCard, removeCard, router, setAnteBattle]);

  const handleCardSelect = (card: Card) => {
    const wager = cardToWageredCard(card, walletAddress);
    setWageredCard(wager);
    setState('matchmaking');

    try {
      anteMatchmaking.joinQueue(playerId, walletAddress, wager);
      toast.info('Joining matchmaking queue...');
    } catch (error: any) {
      toast.error(error.message);
      setState('selecting');
    }
  };

  const handleCancelMatchmaking = () => {
    anteMatchmaking.cancelQueue(playerId);
    setState('selecting');
    setWageredCard(null);
    toast.info('Matchmaking cancelled');
  };

  const handleConfirmMatch = () => {
    if (battleId) {
      const activeDeck = decks.find(d => d.id === activeDeckId);
      const deckCards = activeDeck?.cards || [];

      if (deckCards.length === 0) {
        toast.error('No active deck found. Please set an active deck before entering a wager battle.');
        return;
      }

      try {
        anteMatchmaking.confirmBattle(battleId, playerId, deckCards);
        setState('confirmed');
        toast.success('Battle confirmed! Waiting for opponent...');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleDeclineMatch = () => {
    if (battleId) anteMatchmaking.cancelQueue(playerId);
    setState('selecting');
    setMatchData(null);
    setBattleId(null);
    setWageredCard(null);
    toast.info('Match declined');
  };

  const handleClose = () => {
    if (state === 'matchmaking') anteMatchmaking.cancelQueue(playerId);
    onClose();
  };

  const handleBattleResultContinue = () => {
    setState('selecting');
    setWageredCard(null);
    setMatchData(null);
    setBattleId(null);
    setBattleResult(null);
  };

  return (
    <>
      {state === 'selecting' && (
        <WagerCardSelector
          cards={userCards}
          onSelectCard={handleCardSelect}
          onCancel={handleClose}
        />
      )}

      {state === 'matchmaking' && wageredCard && (
        <MatchmakingScreen
          wageredCard={wageredCard}
          onCancel={handleCancelMatchmaking}
        />
      )}

      {(state === 'match_found' || state === 'confirmed') && matchData && (
        <MatchConfirmationModal
          matchData={matchData}
          onConfirm={handleConfirmMatch}
          onCancel={handleDeclineMatch}
        />
      )}

      {state === 'confirmed' && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center max-w-md">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-spektrum-orange mx-auto mb-4"></div>
            <h3 className="text-xl font-bold mb-2">Waiting for opponent...</h3>
            <p className="text-gray-600">The battle will start soon</p>
          </div>
        </div>
      )}

      {state === 'battle_complete' && battleResult && wageredCard && matchData && (
        <AnteBattleResultScreen
          won={battleResult.won}
          playerCard={wageredCard}
          opponentCard={matchData.opponent.wageredCard}
          onContinue={handleBattleResultContinue}
        />
      )}
    </>
  );
}

export default AnteModeManager;
