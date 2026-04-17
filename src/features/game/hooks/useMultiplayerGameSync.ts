'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useMultiplayerStore } from '@/stores/useMultiplayerStore'
import { toast } from 'sonner'
import { useDeckStore } from '@/stores/useDeckStore'

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

  const isMultiplayer =
    isMultiplayerSession ||
    (!!currentRoom && (currentRoom.status === 'ready' || currentRoom.status === 'playing'))

  const opponentName =
    isMultiplayer && currentRoom
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
    if (!isMultiplayer) {
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
  }, [isMultiplayer])

  useEffect(() => {
    if (!isMultiplayer || !socket || hasSentDeck.current) return

    let deckIdToSubmit = activeDeckId
    if (!deckIdToSubmit && decks.length > 0) {
      const fallbackDeck =
        decks.find((d) => d.cards && d.cards.length >= 40) || decks[0]
      if (fallbackDeck) {
        deckIdToSubmit = fallbackDeck.id
      }
    }

    const activeDeck = deckIdToSubmit ? decks.find((d) => d.id === deckIdToSubmit) : null
    const deckCards =
      pendingDeck && pendingDeck.length > 0
        ? pendingDeck
        : activeDeck && activeDeck.cards && activeDeck.cards.length >= 40
        ? activeDeck.cards
        : null

    if (deckIdToSubmit) {
      const payload: { deckId: string; deck?: any[] } = { deckId: deckIdToSubmit }
      if (deckCards) payload.deck = deckCards
      socket.emit('submit_deck', payload)
      if (pendingDeck) setPendingDeck(null)
    } else if (deckCards) {
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
        const applyFn = (useMultiplayerStore.getState() as any).applyServerGameState
        if (typeof applyFn === 'function') {
          if (data.gameState) applyFn(data.gameState)
          else applyFn(data)
        }
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
    socket.on('game_action_rejected', handleActionRejected)
    socket.on('game_state_sync', handleGameStateSync)
    socket.on('reconnect_failed', () => {})
    socket.on('game_started', handleGameStarted)
    socket.on('deck_rejected', handleDeckRejected)
    socket.on('opponent_disconnected', handleOpponentDisconnected)

    return () => {
      socket.off('game_state_updated', handleGameStateUpdated)
      socket.off('game_action_rejected', handleActionRejected)
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
