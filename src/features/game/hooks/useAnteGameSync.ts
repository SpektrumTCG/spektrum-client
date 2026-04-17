'use client'

import { useCallback, useState } from 'react'
import { useAnteBattleStore } from '@/stores/useAnteBattleStore'
import { anteMatchmaking } from '@/services/anteMatchmaking'

export const useAnteGameSync = () => {
  const isAnteGame = useAnteBattleStore((s) => s.isAnteMode)
  const battleId = useAnteBattleStore((s) => s.battleId)
  const [waitingForAnteStart] = useState(false)

  const sendAnteAction = useCallback(
    (action: any) => {
      if (!isAnteGame || !battleId) {
        return
      }
      anteMatchmaking.sendAnteAction(battleId, action)
    },
    [isAnteGame, battleId]
  )

  return { isAnteGame, sendAnteAction, waitingForAnteStart }
}
