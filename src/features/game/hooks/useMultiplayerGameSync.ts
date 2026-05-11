'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useMultiplayerStore } from '@/stores/useMultiplayerStore'
import { useGameStore } from '@/features/game/store'
import { toast } from 'sonner'
import { useDeckStore } from '@/stores/useDeckStore'
import { cardRegistry } from '@/domain/game/data/cardRegistry'

// Was used to short-circuit multiplayer into the local AI engine; left in
// place but disabled so the real server-driven path runs.
const DEMO_AS_AI = false

// Merge each deck card with its registry entry so the server receives full
// card data (type, element, art, skills) — required for the server-side
// engine to validate plays and for both clients to render artwork.
function enrichDeckForSubmit(cards: any[] | null | undefined): any[] {
  if (!Array.isArray(cards) || cards.length === 0) return []
  const all = cardRegistry.getAllCards()
  const byId = new Map<string, any>()
  for (const c of all) {
    byId.set(c.id, c)
    const num = (c as any).cardNumber
    if (num && !byId.has(num)) byId.set(num, c)
    const stripped = c.id.replace(/^(fire|water|red|blue|neutral|earth|air|ground)-/, '')
    if (stripped !== c.id && !byId.has(stripped)) byId.set(stripped, c)
  }
  const baseIdOf = (card: any): string => {
    const raw = (card?.cardId || card?.id || '').toString()
    return raw
      .replace(/^(owned-|deck-[^-]+-)/, '')
      .replace(/-copy-\d+(-\d+)?$/, '')
      .replace(/-pack-\d+(-\w+)?$/, '')
      .replace(/-\d+(-\d+)?$/, '')
  }
  return cards.map((c) => {
    const reg = byId.get(c?.id) || byId.get(c?.cardId) || byId.get(baseIdOf(c))
    if (!reg) return c
    const defined = Object.fromEntries(Object.entries(c).filter(([, v]) => v !== undefined))
    return {
      ...reg,
      ...defined,
      cardId: c?.cardId || reg.id,
      imagePath: c?.imagePath || (reg as any).imagePath || (reg as any).art,
      art: c?.art || (reg as any).art || (reg as any).imagePath,
      skills: (c as any)?.skills?.length ? (c as any).skills : (reg as any).skills,
    }
  })
}

interface GameAction {
  type:
    | 'playCard'
    | 'useAvatarSkill'
    | 'addToSpektraPile'
    | 'evolveAvatar'
    | 'nextPhase'
    | 'endTurn'
    | 'discardCard'
    | 'selectReserveAvatar'
  data?: any
}

export const useMultiplayerGameSync = () => {
  const { socket, currentRoom, currentPlayer: multiplayerPlayer, isMultiplayerSession, pendingDeck, setPendingDeck } =
    useMultiplayerStore()
  const { decks, activeDeckId } = useDeckStore()
  const hasSentDeck = useRef(false)
  const gameStartReceived = useRef(false)
  const deckSubmitTimeout = useRef<NodeJS.Timeout | null>(null)
  const [waitingForGameStart, setWaitingForGameStart] = useState(true)
  const [opponentDisconnected, setOpponentDisconnected] = useState(false)
  const [opponentDisconnectedTurn, setOpponentDisconnectedTurn] = useState(1)
  const [submitAttempt, setSubmitAttempt] = useState(0)

  const isInMultiplayerLobby =
    isMultiplayerSession ||
    (!!currentRoom && (currentRoom.status === 'ready' || currentRoom.status === 'playing'))

  // When the demo override is on, hide the multiplayer flag from the rest of
  // the game UI so it falls through to the local AI dispatch path.
  const isMultiplayer = DEMO_AS_AI ? false : isInMultiplayerLobby

  const opponentName =
    isInMultiplayerLobby && currentRoom
      ? currentRoom.players.find((p) => p.id !== multiplayerPlayer?.id)?.name || 'Opponent'
      : null

  const sendActionToServer = useCallback(
    (action: GameAction) => {
      if (!socket || !isMultiplayer) {
        return
      }
      socket.emit('game_action', action)
    },
    [socket, isMultiplayer]
  )

  const requestGameState = useCallback(() => {
    if (!socket || !isMultiplayer) return
    socket.emit('request_game_state')
  }, [socket, isMultiplayer])

  useEffect(() => {
    if (!isInMultiplayerLobby) {
      hasSentDeck.current = false
      gameStartReceived.current = false
      setWaitingForGameStart(true)
      setOpponentDisconnected(false)
      setOpponentDisconnectedTurn(1)
      if (deckSubmitTimeout.current) {
        clearTimeout(deckSubmitTimeout.current)
        deckSubmitTimeout.current = null
      }
    }
  }, [isInMultiplayerLobby])

  // Demo override: when the player enters a multiplayer match, start a local
  // AI game using their selected deck. Skips the server submit/handshake so
  // the gameplay behaves exactly like the AI mode.
  useEffect(() => {
    if (!DEMO_AS_AI || !isInMultiplayerLobby) return
    if (useGameStore.getState().game) {
      setWaitingForGameStart(false)
      return
    }
    let deckCards: any[] | null = null
    if (pendingDeck && pendingDeck.length > 0) deckCards = pendingDeck
    else if (activeDeckId) deckCards = decks.find((d) => d.id === activeDeckId)?.cards || null
    if (!deckCards || deckCards.length === 0) {
      const fallback = decks.find((d) => d.cards && d.cards.length >= 5) || decks[0]
      if (fallback) deckCards = fallback.cards
    }
    if (deckCards && deckCards.length > 0) {
      useGameStore.getState().startGame(deckCards as any, 'regular')
      if (pendingDeck) setPendingDeck(null)
      setWaitingForGameStart(false)
      gameStartReceived.current = true
    }
  }, [isInMultiplayerLobby, pendingDeck, activeDeckId, decks, setPendingDeck])

  useEffect(() => {
    if (DEMO_AS_AI) return
    if (!isInMultiplayerLobby || !socket || hasSentDeck.current) return

    let deckIdToSubmit = activeDeckId
    if (!deckIdToSubmit && decks.length > 0) {
      const fallbackDeck =
        decks.find((d) => d.cards && d.cards.length >= 40) || decks[0]
      if (fallbackDeck) {
        deckIdToSubmit = fallbackDeck.id
      }
    }

    const activeDeck = deckIdToSubmit ? decks.find((d) => d.id === deckIdToSubmit) : null
    // Always send the full client deck (enriched from registry) so the server
    // has type/art for every card, even when the master DB doesn't know the
    // legacy IDs persisted in the deck. Threshold lowered from 40 to 1 so a
    // half-built demo deck still flows through.
    const rawCards =
      pendingDeck && pendingDeck.length > 0
        ? pendingDeck
        : activeDeck && activeDeck.cards && activeDeck.cards.length > 0
        ? activeDeck.cards
        : null
    const deckCards = rawCards ? enrichDeckForSubmit(rawCards) : null

    if (deckIdToSubmit) {
      const payload: { deckId: string; deck?: any[] } = { deckId: deckIdToSubmit }
      if (deckCards && deckCards.length > 0) payload.deck = deckCards
      socket.emit('submit_deck', payload)
      if (pendingDeck) setPendingDeck(null)
    } else if (deckCards && deckCards.length > 0) {
      socket.emit('submit_deck', { deck: deckCards })
      if (pendingDeck) setPendingDeck(null)
    } else {
      socket.emit('submit_deck', {})
    }

    hasSentDeck.current = true
    deckSubmitTimeout.current = setTimeout(() => {
      if (!gameStartReceived.current) {
        toast.error(
          'Waiting for opponent to submit their deck... If this persists, try returning to the lobby.',
          { duration: 8000 }
        )
      }
    }, 30000)

    return () => {
      if (deckSubmitTimeout.current) {
        clearTimeout(deckSubmitTimeout.current)
        deckSubmitTimeout.current = null
      }
    }
  }, [isMultiplayer, socket, pendingDeck, setPendingDeck, decks, activeDeckId, submitAttempt])

  useEffect(() => {
    if (!isMultiplayer || !socket) return

    const handleGameStateUpdated = (data: any) => {
      try {
        const serverView = data.gameState || data
        useGameStore.getState().applyServerGameState(serverView)
      } catch {
        toast.error('Failed to sync game state')
      }
    }

    const handleActionRejected = (data: { action: string; error: string }) => {
      toast.error(`Action failed: ${data.error}`)
      requestGameState()
    }

    const handleGameStateSync = (data: any) => {
      handleGameStateUpdated(data)
      toast.success('Reconnected to game')
    }

    const handleGameStarted = (data: { room: any; gameState: any }) => {
      gameStartReceived.current = true
      setWaitingForGameStart(false)
      if (deckSubmitTimeout.current) {
        clearTimeout(deckSubmitTimeout.current)
        deckSubmitTimeout.current = null
      }
      if (data.gameState) {
        handleGameStateUpdated(data)
        toast.success('Game initialized!')
      }
    }

    const handleDeckRejected = (data: { error: string }) => {
      hasSentDeck.current = false
      toast.error(`Deck rejected: ${data.error}`)
      setSubmitAttempt((prev) => prev + 1)
    }

    const handleOpponentDisconnected = (data: { turn: number }) => {
      setOpponentDisconnected(true)
      setOpponentDisconnectedTurn(data.turn || 1)
    }

    socket.on('game_state_updated', handleGameStateUpdated)
    socket.on('action_rejected', handleActionRejected)
    socket.on('game_state_sync', handleGameStateSync)
    socket.on('reconnect_failed', () => {})
    socket.on('game_started', handleGameStarted)
    socket.on('deck_rejected', handleDeckRejected)
    socket.on('opponent_disconnected', handleOpponentDisconnected)

    return () => {
      socket.off('game_state_updated', handleGameStateUpdated)
      socket.off('action_rejected', handleActionRejected)
      socket.off('game_state_sync', handleGameStateSync)
      socket.off('game_started', handleGameStarted)
      socket.off('deck_rejected', handleDeckRejected)
      socket.off('opponent_disconnected', handleOpponentDisconnected)
    }
  }, [isMultiplayer, socket, requestGameState])

  return {
    isMultiplayer,
    opponentName,
    sendActionToServer,
    requestGameState,
    waitingForGameStart: isMultiplayer && waitingForGameStart,
    opponentDisconnected,
    opponentDisconnectedTurn,
  }
}
