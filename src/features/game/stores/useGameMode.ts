import { create } from 'zustand'

export type GameMode = 'playerVsAI' | 'playerVsPlayer' | 'singlePlayer'
export type AIDifficulty = 'newbie' | 'regular' | 'advanced'

interface GameModeState {
  mode: GameMode
  aiDifficulty: AIDifficulty
  isOnline: boolean
  isWaitingForOpponent: boolean
  roomCode: string | null
  playerName: string
  opponentName: string | null

  setMode: (mode: GameMode) => void
  setAIDifficulty: (difficulty: AIDifficulty) => void
  setIsOnline: (isOnline: boolean) => void
  setWaitingForOpponent: (isWaiting: boolean) => void
  setRoomCode: (roomCode: string | null) => void
  setPlayerName: (name: string) => void
  setOpponentName: (name: string | null) => void

  createRoom: () => void
  joinRoom: (roomCode: string) => void
  startSinglePlayer: () => void
  startAIGame: () => void

  resetState: () => void
}

export const useGameMode = create<GameModeState>()((set) => ({
  mode: 'singlePlayer',
  aiDifficulty: 'regular',
  isOnline: false,
  isWaitingForOpponent: false,
  roomCode: null,
  playerName: 'Player',
  opponentName: null,

  setMode: (mode) => set({ mode }),
  setAIDifficulty: (difficulty) => set({ aiDifficulty: difficulty }),
  setIsOnline: (isOnline) => set({ isOnline }),
  setWaitingForOpponent: (isWaiting) => set({ isWaitingForOpponent: isWaiting }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setPlayerName: (name) => set({ playerName: name }),
  setOpponentName: (name) => set({ opponentName: name }),

  createRoom: () => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    set({
      mode: 'playerVsPlayer',
      isOnline: true,
      isWaitingForOpponent: true,
      roomCode,
    })
  },

  joinRoom: (roomCode) => {
    set({
      mode: 'playerVsPlayer',
      isOnline: true,
      isWaitingForOpponent: false,
      roomCode,
      opponentName: 'Opponent',
    })
  },

  startSinglePlayer: () => {
    set({
      mode: 'singlePlayer',
      isOnline: false,
      isWaitingForOpponent: false,
      roomCode: null,
      opponentName: null,
    })
  },

  startAIGame: () => {
    set({
      mode: 'playerVsAI',
      isOnline: false,
      isWaitingForOpponent: false,
      roomCode: null,
      opponentName: 'AI Opponent',
    })
  },

  resetState: () => {
    set({
      mode: 'singlePlayer',
      isOnline: false,
      isWaitingForOpponent: false,
      roomCode: null,
      opponentName: null,
    })
  },
}))
