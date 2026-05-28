"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { anteMatchmaking, cardToWageredCard, type WageredCard, type MatchFoundData, type BattleCompletedData } from '@/services/anteMatchmaking';
import type { Card } from '@spektrum/shared';
import { useDeckStore } from '@/stores/useDeckStore';
import { useAnteBattleStore } from '@/stores/useAnteBattleStore';
import { useGameStore } from '@/features/game/store';
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
  const { getToken } = useAuth();
  const { addCard, removeCard, ownedCards, decks, activeDeckId, syncCardsFromDatabase } = useDeckStore();

  // Pull fresh card ownership from the server when the modal opens. On alt
  // accounts (or any session where the deck store hasn't yet rehydrated +
  // synced) `userCards`/`ownedCards` can still be empty even though the player
  // owns Rare/Super Rare cards in the DB — without this re-sync the wager
  // selector renders "No eligible cards".
  useEffect(() => {
    syncCardsFromDatabase().catch(() => { /* sync is supplementary */ });
  }, [syncCardsFromDatabase, walletAddress]);

  // If the prop list is still empty after sync, fall back to the live store
  // value (which the sync will have just refreshed).
  const effectiveUserCards = userCards.length > 0 ? userCards : ownedCards;
  const { setAnteBattle } = useAnteBattleStore();
  const [state, setState] = useState<AnteState>('selecting');
  const [wageredCard, setWageredCard] = useState<WageredCard | null>(null);
  const [matchData, setMatchData] = useState<MatchFoundData | null>(null);
  const [battleId, setBattleId] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<{ won: boolean; data: BattleCompletedData } | null>(null);

  const wageredCardRef = useRef<WageredCard | null>(null);
  const matchDataRef = useRef<MatchFoundData | null>(null);
  const stateRef = useRef<AnteState>('selecting');

  useEffect(() => { wageredCardRef.current = wageredCard; }, [wageredCard]);
  useEffect(() => { matchDataRef.current = matchData; }, [matchData]);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Stable refs so the callback effect can stay mount-only without going stale.
  const effectiveUserCardsRef = useRef(effectiveUserCards);
  const ownedCardsRef = useRef(ownedCards);
  const addCardRef = useRef(addCard);
  const removeCardRef = useRef(removeCard);
  const setAnteBattleRef = useRef(setAnteBattle);
  const routerRef = useRef(router);
  useEffect(() => { effectiveUserCardsRef.current = effectiveUserCards; }, [effectiveUserCards]);
  useEffect(() => { ownedCardsRef.current = ownedCards; }, [ownedCards]);
  useEffect(() => { addCardRef.current = addCard; }, [addCard]);
  useEffect(() => { removeCardRef.current = removeCard; }, [removeCard]);
  useEffect(() => { setAnteBattleRef.current = setAnteBattle; }, [setAnteBattle]);
  useEffect(() => { routerRef.current = router; }, [router]);

  useEffect(() => {
    // Mount-only: connect once, register callbacks once, and only tear the
    // socket down on actual unmount. Re-running this effect on every change
    // to userCards/ownedCards would cancel the queue mid-search and bounce
    // the socket, which the server interprets as a forfeit (the battle would
    // be deleted and the opponent would see "battle not found").
    (async () => {
      const token = await getToken();
      if (!token) {
        toast.error('Sign in required for ante matches');
        return;
      }
      anteMatchmaking.connect(token);
    })();

    anteMatchmaking.setCallbacks({
      onMatchFound: (data) => {
        setMatchData(data);
        setBattleId(data.battleId);
        setState('match_found');
        toast.success('Opponent found!');
      },
      onBattleStart: (battleId, gameState) => {
        setState('in_battle');

        const currentWager = wageredCardRef.current;
        const currentMatch = matchDataRef.current;
        if (currentWager && currentMatch) {
          setAnteBattleRef.current(
            battleId,
            currentWager,
            currentMatch.opponent.wageredCard,
            playerId,
            currentMatch.opponent.playerId
          );
        }

        // Hydrate the local game store with the server's initial player view
        // BEFORE navigating. Without this the GameBoard mounts with `game ===
        // null` and stays on the "Loading Battle" screen forever, since the
        // ante socket sends gameState only inside `battle_start` and the
        // subsequent `ante_game_state_updated` events.
        if (gameState) {
          try {
            useGameStore.getState().applyServerGameState(gameState);
          } catch {
            // Falling through is non-fatal — useAnteGameSync will retry on
            // the next ante_game_state_updated payload.
          }
        }

        routerRef.current.push('/game');
      },
      onBattleCompleted: (data) => {
        const won = data.winnerId === playerId;

        if (won && data.wonCard) {
          const wonCard = effectiveUserCardsRef.current.find(c => c.id === data.wonCard!.cardId || c.name === data.wonCard!.cardName);
          if (wonCard) addCardRef.current(wonCard);
        } else if (!won && data.lostCard) {
          const lostCard = ownedCardsRef.current.find(c => c.id === data.lostCard!.cardId || c.name === data.lostCard!.cardName);
          if (lostCard) removeCardRef.current(lostCard.id);
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
      const liveState = stateRef.current;
      if (liveState === 'matchmaking') {
        anteMatchmaking.cancelQueue(playerId);
      }
      // Do NOT disconnect once we've handed off to /game. GameBoard reuses
      // this socket to send ante_game_action; tearing it down here is the
      // forfeit path the server logs as "Ante battle X forfeited — Y disconnected".
      const handingOffToGame = liveState === 'confirmed' || liveState === 'in_battle';
      if (!handingOffToGame) {
        anteMatchmaking.disconnect();
      }
    };
  }, [playerId]);

  const handleCardSelect = (card: Card) => {
    const wager = cardToWageredCard(card, walletAddress);
    setWageredCard(wager);
    setState('matchmaking');

    try {
      anteMatchmaking.joinQueue(playerId, wager);
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
          cards={effectiveUserCards}
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
