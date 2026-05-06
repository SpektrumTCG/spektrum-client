'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAnteBattleStore } from '@/stores/useAnteBattleStore'
import { anteMatchmaking } from '@/services/anteMatchmaking'
import { useGameStore } from '@/features/game/store'
import { toast } from 'sonner'

export const useAnteGameSync = () => {
  const isAnteGame = useAnteBattleStore((s) => s.isAnteMode)
  const battleId = useAnteBattleStore((s) => s.battleId)
  const playerId = useAnteBattleStore((s) => s.playerId)
  const [waitingForAnteStart, setWaitingForAnteStart] = useState(true)

  const sendAnteAction = useCallback(
    (action: any) => {
      if (!isAnteGame || !battleId) {
        return
      }
      anteMatchmaking.sendAnteAction(battleId, action)
    },
    [isAnteGame, battleId]
  )

  // Subscribe to server-authoritative ante game state updates. Without these
  // listeners the local game store never receives turn-by-turn updates, so
  // the GameBoard stays stuck on the loading screen even after the battle
  // has actually started server-side.
  useEffect(() => {
    if (!isAnteGame) {
      setWaitingForAnteStart(true)
      return
    }

    // Layer these handlers on top of any existing callbacks (e.g. the ones
    // AnteModeManager registered for battle_completed / wonCard handling)
    // by merging — setCallbacks already shallow-merges by design.
    anteMatchmaking.setCallbacks({
      // Re-emitted battle_start (from request_ante_state) lands here too.
      // AnteModeManager has unmounted by now, so override its handler with
      // one that just applies state — no router.push, no React setters on
      // the unmounted modal.
      onBattleStart: (_id, gameState) => {
        if (gameState) {
          try {
            useGameStore.getState().applyServerGameState(gameState)
            setWaitingForAnteStart(false)
          } catch {
            toast.error('Failed to sync wager battle state')
          }
        }
      },
      onGameStateUpdated: (gameState) => {
        try {
          useGameStore.getState().applyServerGameState(gameState)
          setWaitingForAnteStart(false)
        } catch {
          toast.error('Failed to sync wager battle state')
        }
      },
      onActionRejected: (data) => {
        toast.error(`Action failed: ${data.error}`)
      },
      onOpponentDisconnected: (data) => {
        toast.error(data.reason || 'Opponent disconnected from the battle')
      },
    })

    // If the local store already has a hydrated game (the initial state was
    // applied by AnteModeManager.onBattleStart before navigation), drop the
    // waiting flag immediately.
    if (useGameStore.getState().game) {
      setWaitingForAnteStart(false)
      return
    }

    // The initial battle_start payload was either missed (e.g. the socket
    // reconnected between queue and broadcast, leaving battle.playerN.socketId
    // stale) or arrived without a usable gameState. Ask the server for the
    // current state explicitly. The server's request_ante_state handler also
    // refreshes its stored socketId for this player so future broadcasts hit.
    if (battleId) {
      anteMatchmaking.requestState(battleId, playerId ?? undefined)
    }
  }, [isAnteGame, battleId, playerId])

  return { isAnteGame, sendAnteAction, waitingForAnteStart }
}
