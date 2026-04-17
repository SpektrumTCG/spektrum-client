import { create } from 'zustand';
import { anteMatchmaking, type WageredCard } from '@/services/anteMatchmaking';

interface AnteBattleState {
  isAnteMode: boolean;
  battleId: string | null;
  playerWageredCard: WageredCard | null;
  opponentWageredCard: WageredCard | null;
  playerId: string | null;
  opponentId: string | null;
  battleResult: 'pending' | 'won' | 'lost' | null;

  setAnteBattle: (battleId: string, playerCard: WageredCard, opponentCard: WageredCard, playerId: string, opponentId: string) => void;
  reportVictory: (winnerId: string) => void;
  resetAnteMode: () => void;
}

export const useAnteBattleStore = create<AnteBattleState>()((set, get) => ({
  isAnteMode: false,
  battleId: null,
  playerWageredCard: null,
  opponentWageredCard: null,
  playerId: null,
  opponentId: null,
  battleResult: null,

  setAnteBattle: (battleId, playerCard, opponentCard, playerId, opponentId) => {
    set({
      isAnteMode: true,
      battleId,
      playerWageredCard: playerCard,
      opponentWageredCard: opponentCard,
      playerId,
      opponentId,
      battleResult: 'pending'
    });
  },

  reportVictory: (winnerId) => {
    const state = get();
    if (!state.isAnteMode || !state.battleId) return;
    const didPlayerWin = winnerId === state.playerId;
    set({ battleResult: didPlayerWin ? 'won' : 'lost' });
    anteMatchmaking.reportBattleResult(state.battleId, winnerId);
  },

  resetAnteMode: () => {
    set({
      isAnteMode: false,
      battleId: null,
      playerWageredCard: null,
      opponentWageredCard: null,
      playerId: null,
      opponentId: null,
      battleResult: null
    });
  }
}));
