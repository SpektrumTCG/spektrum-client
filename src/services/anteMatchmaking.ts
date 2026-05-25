import { io, Socket } from 'socket.io-client';
import type { Card } from '@/domain/game/types';

export type CardRarity = 'rare' | 'super_rare' | 'mythic';

export interface WageredCard {
  cardId: string;
  cardName: string;
  rarity: CardRarity;
  nftMint: string;
  ownerWallet: string;
  imagePath?: string;
}

export interface MatchFoundData {
  battleId: string;
  opponent: {
    playerId: string;
    walletAddress: string;
    wageredCard: WageredCard;
  };
  yourCard: WageredCard;
}

export interface BattleCompletedData {
  battleId: string;
  winnerId: string;
  wonCard: WageredCard | null;
  lostCard: WageredCard | null;
}

class AnteMatchmakingService {
  private socket: Socket | null = null;
  private callbacks: {
    onMatchFound?: (data: MatchFoundData) => void;
    onBattleStart?: (battleId: string, gameState?: any) => void;
    onBattleCompleted?: (data: BattleCompletedData) => void;
    onQueueJoined?: (data: { rarity: CardRarity; position: number }) => void;
    onQueueCancelled?: () => void;
    onError?: (message: string) => void;
    onGameStateUpdated?: (gameState: any) => void;
    onActionRejected?: (data: { action: string; error: string }) => void;
    onOpponentDisconnected?: (data: { battleId: string; reason: string }) => void;
  } = {};

  connect(token: string) {
    if (this.socket?.connected) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    this.socket = io(socketUrl, {
      path: '/ante-socket',
      transports: ['websocket', 'polling'],
      auth: { token },
    });

    this.socket.on('match_found', (data: MatchFoundData) => {
      this.callbacks.onMatchFound?.(data);
    });

    this.socket.on('battle_start', (data: { battleId: string; gameState?: any }) => {
      this.callbacks.onBattleStart?.(data.battleId, data.gameState);
    });

    this.socket.on('battle_completed', (data: BattleCompletedData) => {
      this.callbacks.onBattleCompleted?.(data);
    });

    this.socket.on('ante_game_state_updated', (data: { gameState: any }) => {
      this.callbacks.onGameStateUpdated?.(data.gameState);
    });

    this.socket.on('ante_action_rejected', (data: { action: string; error: string }) => {
      this.callbacks.onActionRejected?.(data);
    });

    this.socket.on('battle_opponent_disconnected', (data: { battleId: string; reason: string }) => {
      this.callbacks.onOpponentDisconnected?.(data);
    });

    this.socket.on('queue_joined', (data: { rarity: CardRarity; position: number }) => {
      this.callbacks.onQueueJoined?.(data);
    });

    this.socket.on('queue_cancelled', () => {
      this.callbacks.onQueueCancelled?.();
    });

    this.socket.on('error', (data: { message: string }) => {
      this.callbacks.onError?.(data.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinQueue(playerId: string, wageredCard: WageredCard) {
    if (!this.socket?.connected) throw new Error('Not connected to matchmaking server');
    this.socket.emit('join_queue', { playerId, wageredCard });
  }

  cancelQueue(playerId: string) {
    if (!this.socket?.connected) throw new Error('Not connected to matchmaking server');
    this.socket.emit('cancel_queue', { playerId });
  }

  confirmBattle(battleId: string, playerId: string, deck: any[]) {
    if (!this.socket?.connected) throw new Error('Not connected to matchmaking server');
    this.socket.emit('confirm_battle', { battleId, playerId, deck });
  }

  reportBattleResult(battleId: string, winnerId: string) {
    if (!this.socket?.connected) throw new Error('Not connected to matchmaking server');
    this.socket.emit('battle_result', { battleId, winnerId });
  }

  sendAnteAction(battleId: string, action: any) {
    if (!this.socket?.connected) return;
    this.socket.emit('ante_game_action', { battleId, action });
  }

  requestState(battleId: string, playerId?: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('request_ante_state', { battleId, playerId });
  }

  setCallbacks(callbacks: typeof this.callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const anteMatchmaking = new AnteMatchmakingService();

export function cardToWageredCard(card: Card, walletAddress: string): WageredCard {
  const cardRarity = (card as any).rarity;
  let rarity: CardRarity = 'rare';
  if (cardRarity) {
    const normalized = cardRarity.toString().toLowerCase().replace(/\s+/g, '_');
    if (normalized === 'super_rare') rarity = 'super_rare';
    else if (normalized === 'mythic') rarity = 'mythic';
    else rarity = 'rare';
  }
  return {
    cardId: card.id,
    cardName: card.name,
    rarity,
    nftMint: (card as any).nftMint || `mock-mint-${card.id}`,
    ownerWallet: walletAddress,
    imagePath: (card as any).imagePath || card.art || undefined
  };
}

export function canWagerCard(card: Card): boolean {
  const rarity = (card as any).rarity;
  if (!rarity) return false;
  const normalizedRarity = rarity.toString().toLowerCase().replace(/\s+/g, '_');
  return normalizedRarity === 'rare' || normalizedRarity === 'super_rare' || normalizedRarity === 'mythic';
}
