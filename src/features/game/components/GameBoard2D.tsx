"use client"

import React, { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { useGameStore } from '@/features/game/stores/useGameStore'
import { useGameMode } from '@/features/game/stores/useGameMode'
import { useGameExitStore } from '@/features/game/stores/useGameExitStore'
import { useGameUIStore } from '@/features/game/stores/useGameUIStore'
import { useAnimationStore } from '@/features/game/stores/useAnimationStore'
import { useSpellEffectsStore } from '@/features/game/stores/useSpellEffectsStore'
import { useAnteBattleStore } from '@/stores/useAnteBattleStore'
import { useMultiplayerStore } from '@/stores/useMultiplayerStore'
import { useWalletStore } from '@/stores/useWalletStore'
import { useDeckStore } from '@/stores/useDeckStore'
import { useMultiplayerGameSync } from '@/features/game/hooks/useMultiplayerGameSync'
import { useAnteGameSync } from '@/features/game/hooks/useAnteGameSync'
import { AnteBattleResults } from '@/components/shared/ante/AnteBattleResults'
import { SafeCardImage } from '@/components/shared/SafeCardImage'
import { Card2D } from './Card2D'
import { SpellEffectAnimation } from './SpellEffectAnimation'
import { CardDrawEffect } from './CardDrawEffect'
import { CardPlacementEffect } from './CardPlacementEffect'
import { CardActivationPause } from './CardActivationPause'
import { DiscardSelectionModal } from './DiscardSelectionModal'
import { CardRevealModal } from './CardRevealModal'
import { PlacementModal } from './PlacementModal'
import { AnimatePresence } from 'framer-motion'
import { getFixedCardImagePath } from '@/lib/cardImageFixer'
import { getValidEvolutionTargets } from '@/domain/game/engine/getValidEvolutionTargets'
import type { AvatarCard, Card } from '@/domain/game/types'
import { api } from '@/services/api'

interface GameBoard2DProps {
  onAction?: (action: string, data?: any) => void
  onForfeit?: () => void
}

// CardPreview Component
const CardPreview = ({ card, onClose }: { card: Card; onClose: () => void }) => {
  const damageCounter = card.type === 'avatar' ? (card as AvatarCard).counters?.damage || 0 : 0
  const isAvatarCard = card.type === 'avatar'
  const modalWidth = isAvatarCard ? 'max-w-[450px]' : 'max-w-[390px]'

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-2"
      onClick={onClose}
    >
      <div
        className={`relative bg-gray-800 rounded-lg border-2 border-orange-500 shadow-lg ${modalWidth} max-h-[85vh] overflow-y-auto`}
        style={{ boxShadow: '0 0 30px rgba(249, 115, 22, 0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-1 right-1 text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-xs z-10"
          onClick={onClose}
        >
          X
        </button>

        <div className="p-1">
          <div className="mb-1 rounded overflow-hidden">
            {(card.art || (card as any).imagePath) && (
              <SafeCardImage
                src={getFixedCardImagePath(card)}
                alt={card?.name || 'Card'}
                className="max-w-full max-h-[45vh] object-cover"
              />
            )}
          </div>

          <h3 className="text-xs font-bold text-white mb-0.5 leading-tight">
            {card?.name || 'Unknown Card'}
          </h3>

          <div className="flex justify-between mb-0.5 text-[10px]">
            <div className="text-gray-300 leading-tight">
              {card?.type ? card.type.charAt(0).toUpperCase() + card.type.slice(1) : 'Card'} •{' '}
              {card?.element || 'unknown'}
              {card?.type === 'avatar' && ` • Lv${(card as AvatarCard)?.level || 1}`}
            </div>

            {card?.spektraCost && Array.isArray(card.spektraCost) && (
              <div className="flex items-center gap-0.5">
                {card.spektraCost.map((spektra, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      spektra === 'fire'
                        ? 'bg-red-500'
                        : spektra === 'water'
                        ? 'bg-blue-500'
                        : spektra === 'air'
                        ? 'bg-cyan-300'
                        : spektra === 'ground'
                        ? 'bg-amber-700'
                        : spektra === 'neutral'
                        ? 'bg-gray-400'
                        : 'bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {card.type === 'avatar' && (
            <div className="mb-1">
              <div className="flex justify-between items-center text-[10px] mb-0.5">
                <div>HP: {(card as AvatarCard).health}</div>
                {damageCounter > 0 && (
                  <div className="text-red-500 font-bold">
                    {Math.max(0, (card as AvatarCard).health - damageCounter)}
                  </div>
                )}
              </div>

              {(card as AvatarCard).skill1 && (
                <div className="mt-1 p-0.5 bg-gray-700 rounded">
                  <div className="text-[10px] font-medium leading-tight">
                    {(card as AvatarCard).skill1?.name || 'Skill 1'}
                  </div>
                  <div className="text-[10px] text-gray-300 leading-tight">
                    {(
                      (card as AvatarCard).skill1?.spektraCost || []
                    )
                      .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
                      .join(', ') || 'None'}{' '}
                    &bull; {(card as AvatarCard).skill1?.damage || 0} dmg
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-gray-400 text-[9px] mt-1 leading-tight truncate">{card.id}</div>
        </div>
      </div>
    </div>
  )
}

export function GameBoard2D({ onAction, onForfeit }: GameBoard2DProps) {
  // Get game state from the new domain store
  const gameStore = useGameStore()
  const game = gameStore.game

  const [showForfeitDialog, setShowForfeitDialog] = useState(false)

  const { showExitDialog: storeExitDialog, setShowExitDialog: setStoreExitDialog } =
    useGameExitStore()

  useEffect(() => {
    if (storeExitDialog) {
      setShowForfeitDialog(true)
      setStoreExitDialog(false)
    }
  }, [storeExitDialog, setStoreExitDialog])

  const anteBattle = useAnteBattleStore()
  const router = useRouter()
  const pathname = usePathname()
  const { isAnteMode, reportVictory, playerId, opponentId } = useAnteBattleStore()

  const { isMultiplayer, opponentName, sendActionToServer, waitingForGameStart, opponentDisconnected, opponentDisconnectedTurn } =
    useMultiplayerGameSync()

  const { isAnteGame, sendAnteAction, waitingForAnteStart } = useAnteGameSync()

  const { activeEffects, addEffect, removeEffect } = useSpellEffectsStore()

  const [isMobile, setIsMobile] = useState(false)
  const [cardWidth, setCardWidth] = useState(80)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1200
      setIsMobile(mobile)

      let gameCardWidth = 20
      if (window.innerWidth < 600) {
        gameCardWidth = 14
      } else if (window.innerWidth < 1200) {
        gameCardWidth = 17
      }
      setCardWidth(gameCardWidth)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const [previewCard, setPreviewCard] = useState<Card | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [showDiscardModal, setShowDiscardModal] = useState(false)
  const [discardCard, setDiscardCard] = useState<Card | null>(null)

  const {
    isTargetingEvolution,
    selectedHandIndex,
    validEvolutionTargets,
    evolutionCard,
    evolvableAvatars,
    startEvolutionTargeting,
    cancelTargeting,
  } = useGameUIStore()

  const [drawEffect, setDrawEffect] = useState<{
    fromX: number
    fromY: number
    toX: number
    toY: number
  } | null>(null)

  const [placementEffect, setPlacementEffect] = useState<{
    card: Card
    fromX: number
    fromY: number
    toX: number
    toY: number
  } | null>(null)

  const { activationPause, triggerActivationPause, clearActivationPause } = useAnimationStore()

  const gameLogRef = useRef<HTMLDivElement>(null)
  const prevPlayerHandSizeRef = useRef<number>(0)

  const gameMode = useGameMode()
  const [showSpektraPopup, setShowSpektraPopup] = React.useState(false)
  const [showUsedSpektraPopup, setShowUsedSpektraPopup] = React.useState(false)
  const [showOpponentSpektraPopup, setShowOpponentSpektraPopup] = React.useState(false)

  const hasInitialized = React.useRef(false)

  // For the new store, player is always index 0
  const playerState = game?.players?.[0]
  const opponentState = game?.players?.[1]
  const gamePhase = game?.phase || 'ready'
  const currentPlayerIndex = game?.currentPlayerIndex ?? 0
  const currentPlayer = currentPlayerIndex === 0 ? 'player' : 'opponent'
  const turn = (game as any)?.turn || 1
  const winner = game?.winner ?? null
  const playerWon = winner !== null && winner === playerState?.id
  const logs = (game as any)?.battleLog || []
  const isPlayerTurn = currentPlayer === 'player' || (gamePhase === 'setup' && playerState?.activeAvatar !== null)

  useEffect(() => {
    if (gameLogRef.current) {
      gameLogRef.current.scrollTop = gameLogRef.current.scrollHeight
    }
  }, [logs])

  useEffect(() => {
    if (game?.winner && isAnteMode) {
      const winnerId = game.winner === playerState?.id ? playerId : opponentId
      if (winnerId) {
        reportVictory(winnerId)
      }
    }
  }, [game?.winner, isAnteMode, reportVictory, playerId, opponentId, playerState?.id])

  const handleNextPhase = () => {
    if (isAnteGame) {
      sendAnteAction({ type: 'nextPhase' })
      return
    }
    if (isMultiplayer) {
      sendActionToServer({ type: 'nextPhase' })
      return
    }

    gameStore.endPhase()
  }

  const isCardPlayable = (card: Card) => {
    if (!playerState) return false

    if (gamePhase === 'setup') {
      return card.type === 'avatar' && Number((card as AvatarCard).level) === 1 && playerState.activeAvatar === null
    }

    if (card.type === 'quickSpell') {
      return playerState.activeAvatar !== null
    }

    if (currentPlayer !== 'player' || gamePhase !== 'main') {
      return false
    }

    if (card.type === 'avatar') {
      return true
    }

    return playerState.activeAvatar !== null
  }

  const handleCardAction = (card: Card, action: string) => {
    const isServerMode = isAnteGame || isMultiplayer
    const routeAction = isAnteGame ? sendAnteAction : sendActionToServer

    if (isServerMode) {
      const index = playerState?.hand.findIndex((c) => c.id === card.id) ?? -1
      if (index === -1) {
        toast.error('Card not found in your hand!')
        return
      }

      if (action === 'discard') {
        routeAction({ type: 'discardCard', data: { handIndex: index } })
      } else if (action === 'toSpektra') {
        routeAction({ type: 'addToSpektraPile', data: { handIndex: index } })
      } else if (action === 'active') {
        routeAction({ type: 'playCard', data: { handIndex: index, target: gamePhase === 'setup' ? 'setup_active' : 'active' } })
      } else if (action === 'reserve') {
        routeAction({ type: 'playCard', data: { handIndex: index, target: 'reserve' } })
      } else if (action === 'play') {
        routeAction({ type: 'playCard', data: { handIndex: index } })
      } else {
        routeAction({ type: 'playCard', data: { handIndex: index, target: action } })
      }
      return
    }

    // Single player
    if (card.id) {
      if (action === 'play' || action === 'active') {
        gameStore.playCard(card.id, 'active')
        // Auto-advance setup phase after placing avatar
        if (gamePhase === 'setup') {
          gameStore.endPhase()
        }
      } else if (action === 'reserve') {
        gameStore.playCard(card.id, 1)
      } else if (action === 'toSpektra') {
        gameStore.addToSpektra(card.id)
      }
    }
  }

  const handleSkillUse = (skillNumber: 1 | 2) => {
    if (!playerState?.activeAvatar) {
      toast.error('You need an active avatar to use skills!')
      return
    }

    const avatar = playerState.activeAvatar
    const skillIndex = skillNumber - 1

    if (isAnteGame) {
      sendAnteAction({ type: 'useAvatarSkill', data: { skillIndex: skillNumber, target: 'opponent-avatar' } })
      return
    }
    if (isMultiplayer) {
      sendActionToServer({ type: 'useAvatarSkill', data: { skillIndex: skillNumber, target: 'opponent-avatar' } })
      return
    }

    gameStore.useSkill(avatar.id, skillIndex as 0 | 1)
  }

  const handleAvatarClick = (avatar: AvatarCard, e?: React.MouseEvent) => {
    e?.stopPropagation()

    if (isTargetingEvolution) {
      cancelTargeting()
      return
    }

    setSelectedCard(avatar)
  }

  const handleEvolutionSelection = (targetLocation: 'active' | number) => {
    if (evolutionCard) {
      const handIndex = selectedHandIndex ?? playerState?.hand.findIndex((c) => c.id === evolutionCard.id) ?? -1
      if (isAnteGame) {
        sendAnteAction({ type: 'evolveAvatar', data: { handIndex, targetAvatar: targetLocation } })
      } else if (isMultiplayer) {
        sendActionToServer({ type: 'evolveAvatar', data: { handIndex, targetAvatar: targetLocation } })
      }
      cancelTargeting()
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTargetingEvolution) {
        cancelTargeting()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTargetingEvolution, cancelTargeting])

  useEffect(() => {
    if (hasInitialized.current) return

    const isMultiplayerDirect = useMultiplayerStore.getState().isMultiplayerSession
    const isAnteDirect = useAnteBattleStore.getState().isAnteMode

    if (gameMode.mode === 'playerVsAI') {
      useMultiplayerStore.getState().setIsMultiplayerSession(false)
      useMultiplayerStore.getState().setCurrentRoom(null)
    }

    if (isAnteDirect || isAnteGame) {
      hasInitialized.current = true
      return
    }

    if (isMultiplayerDirect || isMultiplayer) {
      hasInitialized.current = true
      return
    }

    if (gameMode.mode === 'playerVsPlayer' && gameMode.isOnline) {
      hasInitialized.current = true
      return
    }

    hasInitialized.current = true
  }, [isMultiplayer, isAnteGame, gameMode])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (currentPlayer === 'player' && gamePhase === 'end') {
      timeoutId = setTimeout(() => {
        if (isAnteGame) {
          sendAnteAction({ type: 'endTurn' })
        } else if (isMultiplayer) {
          sendActionToServer({ type: 'endTurn' })
        } else {
          gameStore.endPhase()
        }
      }, 3000)

      toast.info('End phase - auto-advancing in 3 seconds...', { duration: 3000 })
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [currentPlayer, gamePhase, isAnteGame, isMultiplayer, sendActionToServer, sendAnteAction])

  if (!game) {
    return (
      <div className="w-full h-full bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading game...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-2 pb-20 relative overflow-x-hidden mx-auto" style={{ paddingTop: 56, maxWidth: 480 }}>
      {/* Ante (Wager): Waiting overlay */}
      {isAnteGame && waitingForAnteStart && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100]">
          <div className="text-center p-8">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-orange-400 mb-3">Wager Battle Starting...</h2>
            <p className="text-gray-400 text-sm mb-2">Syncing with opponent. Hold tight!</p>
          </div>
        </div>
      )}

      {/* Multiplayer: Waiting overlay */}
      {waitingForGameStart && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100]">
          <div className="text-center p-8">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-orange-400 mb-3">Waiting for Opponent...</h2>
            <p className="text-gray-400 text-sm mb-2">Your deck has been submitted to the server.</p>
          </div>
        </div>
      )}

      {/* Opponent disconnected overlay */}
      {opponentDisconnected && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100]">
          <div className="text-center p-8 bg-gray-800 rounded-xl border-2 border-orange-500 max-w-md">
            {opponentDisconnectedTurn <= 1 ? (
              <>
                <h2 className="text-2xl font-bold text-gray-300 mb-3">
                  Your Opponent Exited the Game
                </h2>
                <p className="text-gray-400 mb-6">
                  Your opponent left before the game could begin.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-orange-400 mb-3">You Win!</h2>
                <p className="text-gray-300 mb-2 text-lg">Your opponent forfeited the game!</p>
              </>
            )}
            <button
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 px-8 py-3 rounded-lg font-bold text-lg"
              onClick={() => router.push('/home')}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

      {/* Card preview modal */}
      {selectedCard && (
        <CardPreview card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}

      {/* Game header */}
      <div
        className="relative z-40 mb-2 p-2 flex flex-wrap gap-2 justify-between items-center bg-gray-800 rounded-none md:rounded-lg border-b-2 md:border-2 border-orange-500"
        style={{ boxShadow: '0 0 20px rgba(249,115,22,0.2)' }}
      >
        <div className="flex flex-wrap gap-2 items-center">
          <span className="font-bold text-sm">Turn {turn}</span>
          <span className="bg-orange-600 px-2 py-0.5 rounded text-xs">{gamePhase}</span>
          {currentPlayer === 'opponent' && playerState?.hand.some((card) => card.type === 'quickSpell') && (
            <span className="bg-purple-700 px-2 py-0.5 rounded text-xs animate-pulse">Quick Spells</span>
          )}
          <span
            className="px-2 py-0.5 rounded text-xs"
            style={{
              backgroundColor: isMultiplayer ? '#FF6B35' : gameMode.mode === 'playerVsAI' ? '#8B0000' : gameMode.mode === 'singlePlayer' ? '#006400' : '#555',
            }}
          >
            {isMultiplayer ? `VS ${opponentName}` : gameMode.mode === 'playerVsAI' ? `VS AI - ${gameMode.aiDifficulty.charAt(0).toUpperCase() + gameMode.aiDifficulty.slice(1)}` : gameMode.mode === 'singlePlayer' ? 'Practice' : ''}
          </span>
        </div>
        <button onClick={() => setShowForfeitDialog(true)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">✕ Exit</button>
      </div>

      <div className="px-2 space-y-2">

        {/* ── OPPONENT ── */}
        <div>
          <h3 className="text-xs font-bold mb-1 text-orange-400 tracking-widest uppercase">Opponent</h3>

          {/* Opponent hand */}
          <div className="bg-gray-800 bg-opacity-30 p-2 rounded-lg mb-2 flex justify-center">
            <div className="flex relative">
              {opponentState?.hand.map((_, index) => (
                <img
                  key={`opponent-hand-${index}`}
                  src="/cards/card_back.png"
                  alt="Card Back"
                  className="rounded-md shadow-md object-cover"
                  style={{ width: '38px', height: '53px', marginLeft: index > 0 ? '-14px' : '0', transform: 'rotate(180deg)', zIndex: index, position: 'relative' }}
                />
              ))}
              {(!opponentState?.hand || opponentState.hand.length === 0) && (
                <div className="text-gray-400 text-xs">No cards in hand</div>
              )}
            </div>
          </div>

          {/* Opponent board */}
          <div
            className="flex justify-between bg-gray-800 bg-opacity-50 p-2 rounded-lg border border-orange-500 border-opacity-30"
            style={{ boxShadow: '0 0 15px rgba(249,115,22,0.1)' }}
          >
            {/* Deck + life */}
            <div className="flex flex-col gap-1.5">
              <div className="relative" style={{ width: '50px', height: '65px' }}>
                <img src="/cards/card_back.png" alt="Opponent Deck" className="w-full h-full object-cover rounded border-2 border-red-600 rotate-180" />
                <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{opponentState?.deck?.length || 0}</div>
              </div>
              <div className="text-[10px] text-red-400 font-semibold">Life ({opponentState?.lifeCards?.length || 0}):</div>
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: opponentState?.lifeCards?.length || 0 }).map((_, i) => (
                  <img key={i} src="/cards/card_back.png" alt="Life Card" className="object-cover rounded border border-red-600/70" style={{ width: '14px', height: '19px', transform: 'rotate(180deg)' }} />
                ))}
              </div>
              <div className="text-[10px] font-semibold text-red-400">Spektra: {opponentState?.spektraPile?.length || 0}</div>
            </div>

            {/* Opponent spektra pile */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-gray-700 bg-opacity-50 rounded p-2 text-center min-w-[80px]">
                <div className="text-[10px] font-bold text-gray-300">Spektra Pile:</div>
                {(opponentState?.spektraPile?.length || 0) > 0 ? (
                  <div className="flex items-center justify-center gap-0.5 mt-0.5 flex-wrap">
                    {opponentState?.spektraPile?.map((card, i) => (
                      <div key={i} className={`w-3 h-3 rounded-full ${card.element === 'fire' ? 'bg-red-500' : card.element === 'water' ? 'bg-blue-500' : card.element === 'ground' ? 'bg-amber-800' : card.element === 'air' ? 'bg-cyan-300' : 'bg-gray-400'}`} />
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-400">Empty</div>
                )}
              </div>
            </div>

            {/* Opponent active avatar */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Active Avatar</span>
              {opponentState?.activeAvatar ? (
                <div className="cursor-pointer" onClick={(e) => handleAvatarClick(opponentState.activeAvatar!, e)}>
                  <Card2D card={opponentState.activeAvatar} isPlayable={false} isInHand={false} isTapped={opponentState.activeAvatar.isTapped} counters={opponentState.activeAvatar.counters} scale={0.85} />
                  <div className="text-center text-[9px] text-yellow-300 font-bold mt-0.5">
                    HP {opponentState.activeAvatar.health - (opponentState.activeAvatar.counters?.damage || 0)}/{opponentState.activeAvatar.health}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-red-800 rounded-lg flex items-center justify-center" style={{ height: '90px', width: '65px' }}>
                  <span className="text-[10px] text-red-400 text-center">No Avatar</span>
                </div>
              )}
            </div>

            {/* Opponent reserves */}
            <div className="flex flex-col gap-1">
              <div className="text-[10px] text-gray-500">Reserves {opponentState?.reserveAvatars?.length || 0}/2</div>
              {opponentState?.reserveAvatars?.map((avatar, index) => (
                <div key={index} className="relative rounded cursor-pointer overflow-hidden ring-1 ring-red-700" style={{ width: '48px', height: '64px' }} onClick={(e) => handleAvatarClick(avatar, e)}>
                  {(avatar.imagePath || avatar.art) && <SafeCardImage src={getFixedCardImagePath(avatar)} alt={avatar.name} className="w-full h-full object-cover" />}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 px-0.5 py-0.5">
                    <div className="text-[9px] text-yellow-300 text-center">HP: {avatar.health - (avatar.counters?.damage || 0)}</div>
                  </div>
                </div>
              ))}
              {(!opponentState?.reserveAvatars || opponentState.reserveAvatars.length === 0) && (
                <div className="border border-dashed border-gray-700 rounded w-12 h-16 flex items-center justify-center opacity-30">
                  <span className="text-[9px] text-gray-500">Rsv</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── FIELD ── */}
        <div
          className="flex items-center justify-center bg-gray-800 bg-opacity-30 p-2 rounded-lg border border-orange-500 border-opacity-30"
          style={{ minHeight: '56px', boxShadow: '0 0 15px rgba(249,115,22,0.1)' }}
        >
          <div className="flex gap-3 items-center">
            <h3 className="text-xs font-bold text-orange-400 tracking-widest uppercase">Field</h3>
            {playerState?.field && playerState.field.length > 0 ? (
              <div className="text-xs text-center bg-purple-900 bg-opacity-70 p-2 rounded border border-purple-500 min-w-[80px]">
                <div className="font-bold truncate">{playerState.field[0].name}</div>
                <div className="text-[10px] text-gray-300">{playerState.field[0].type}</div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-600 rounded p-2 text-center min-w-[60px]">
                <span className="text-[10px] text-gray-400">Empty</span>
              </div>
            )}
            <button
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all duration-200 border-2 ${
                isPlayerTurn
                  ? 'bg-orange-600 border-orange-400 text-white hover:bg-orange-500'
                  : 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
              }`}
              onClick={handleNextPhase}
              disabled={!isPlayerTurn}
            >
              Next Phase →
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all duration-200 border-2 ${
                isPlayerTurn
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-orange-600 hover:border-orange-500'
                  : 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
              }`}
              onClick={() => {
                if (isAnteGame) { sendAnteAction({ type: 'endTurn' }) }
                else if (isMultiplayer) { sendActionToServer({ type: 'endTurn' }) }
                else { gameStore.endPhase() }
              }}
              disabled={!isPlayerTurn}
            >
              End Turn
            </button>
          </div>
        </div>

        {/* ── BATTLE LOG ── */}
        <div className="bg-gray-950 border border-gray-800 rounded-lg p-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Battle Log</div>
          <div className="max-h-16 overflow-y-auto" ref={gameLogRef}>
            {logs.map((log: string, index: number) => (
              <div key={index} className={`text-[10px] leading-relaxed ${index === logs.length - 1 ? 'text-orange-300' : 'text-gray-600'}`}>
                › {log}
              </div>
            ))}
          </div>
        </div>

        {/* ── PLAYER BOARD ── */}
        <div>
          <h3 className="text-xs font-bold mb-1 text-orange-400 tracking-widest uppercase">Your Board</h3>
          <div
            className="flex justify-between bg-gray-800 bg-opacity-50 p-2 rounded-lg border border-orange-500 border-opacity-30"
            style={{ boxShadow: '0 0 15px rgba(249,115,22,0.1)' }}
          >
            {/* Player stats + deck */}
            <div className="flex flex-col gap-1.5">
              <div className="relative" style={{ width: '50px', height: '65px' }}>
                <img src="/cards/card_back.png" alt="Player Deck" className="w-full h-full object-cover rounded border-2 border-blue-600" />
                <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{playerState?.deck?.length || 0}</div>
              </div>
              <div className="text-[10px] text-blue-400 font-semibold">Life ({playerState?.lifeCards?.length || 0}):</div>
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: playerState?.lifeCards?.length || 0 }).map((_, i) => (
                  <img key={i} src="/cards/card_back.png" alt="Life Card" className="object-cover rounded border border-blue-600/70" style={{ width: '14px', height: '19px' }} />
                ))}
              </div>
              <div>
                <div className="text-[10px] text-gray-400 mb-1">Spektra Pile:</div>
                {(playerState?.spektraPile?.length || 0) > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {playerState?.spektraPile?.map((card, i) => (
                      <div key={`spektra-${card.id}-${i}`} className="w-5 h-5 rounded-full border border-amber-500 flex items-center justify-center" title={`${card.name} (${card.element})`}>
                        <div className={`w-3 h-3 rounded-full ${card.element === 'fire' ? 'bg-red-500' : card.element === 'water' ? 'bg-blue-500' : card.element === 'ground' ? 'bg-amber-800' : card.element === 'air' ? 'bg-cyan-300' : 'bg-gray-400'}`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-gray-500">Empty</span>
                )}
              </div>
            </div>

            {/* Player active avatar */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Active Avatar</span>
              {playerState?.activeAvatar ? (
                <div
                  className={`cursor-pointer transition-all duration-200 ${isTargetingEvolution && validEvolutionTargets.includes('active') ? 'ring-4 ring-orange-400 rounded-lg animate-pulse' : ''}`}
                  onClick={(e) => {
                    if (isTargetingEvolution && validEvolutionTargets.includes('active')) { handleEvolutionSelection('active'); return }
                    handleAvatarClick(playerState.activeAvatar!, e)
                  }}
                >
                  <Card2D card={playerState.activeAvatar} isPlayable={true} isInHand={false} isTapped={playerState.activeAvatar.isTapped} counters={playerState.activeAvatar.counters} scale={0.85} />
                  <div className="text-center text-[9px] text-yellow-300 font-bold mt-0.5">
                    HP {playerState.activeAvatar.health - (playerState.activeAvatar.counters?.damage || 0)}/{playerState.activeAvatar.health}
                  </div>
                  {isPlayerTurn && gamePhase === 'battle' && !playerState.activeAvatar.isTapped && (() => {
                    const skill1 = playerState.activeAvatar!.skills?.[0] || (playerState.activeAvatar as any).skill1
                    const skill2 = playerState.activeAvatar!.skills?.[1] || (playerState.activeAvatar as any).skill2
                    return (skill1 || skill2) ? (
                      <div className="flex justify-center gap-1 mt-1">
                        {skill1 && <button className="text-[9px] px-2 py-0.5 rounded font-bold bg-red-600 hover:bg-red-500 text-white" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleSkillUse(1) }}>{skill1.name}</button>}
                        {skill2 && <button className="text-[9px] px-2 py-0.5 rounded font-bold bg-purple-600 hover:bg-purple-500 text-white" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleSkillUse(2) }}>{skill2.name}</button>}
                      </div>
                    ) : null
                  })()}
                </div>
              ) : (
                <div className="w-16 border-2 border-dashed border-blue-800 rounded-lg flex flex-col items-center justify-center cursor-pointer" style={{ height: '91px' }}>
                  <span className="text-[9px] text-blue-400 text-center px-1 leading-tight">Deploy Avatar here</span>
                </div>
              )}
            </div>

            {/* Player reserves */}
            <div className="flex flex-col gap-1">
              <div className="text-[10px] text-gray-500">Reserves {playerState?.reserveAvatars?.length || 0}/2</div>
              {playerState?.reserveAvatars?.map((avatar, index) => (
                <div
                  key={index}
                  className={`relative rounded cursor-pointer overflow-hidden transition-all ${isTargetingEvolution && validEvolutionTargets.includes(index) ? 'ring-2 ring-orange-400 animate-pulse' : 'ring-1 ring-blue-700'}`}
                  style={{ width: '48px', height: '64px' }}
                  onClick={(e) => { if (isTargetingEvolution && validEvolutionTargets.includes(index)) { handleEvolutionSelection(index); return } handleAvatarClick(avatar, e) }}
                >
                  {(avatar.imagePath || avatar.art) && <SafeCardImage src={getFixedCardImagePath(avatar)} alt={avatar.name} className="w-full h-full object-cover" />}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 px-0.5 py-0.5">
                    <div className="text-[9px] text-yellow-300 text-center">HP: {avatar.health - (avatar.counters?.damage || 0)}</div>
                  </div>
                </div>
              ))}
              {(!playerState?.reserveAvatars || playerState.reserveAvatars.length === 0) && (
                <>
                  <div className="border border-dashed border-gray-700 rounded w-12 h-16 flex items-center justify-center opacity-30"><span className="text-[9px] text-gray-500">Rsv</span></div>
                  <div className="border border-dashed border-gray-700 rounded w-12 h-16 flex items-center justify-center opacity-30"><span className="text-[9px] text-gray-500">Rsv</span></div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── PLAYER HAND ── */}
        <div>
          <h3 className="text-xs font-bold mb-1 text-orange-400 tracking-widest uppercase">
            Your Hand ({playerState?.hand?.length || 0} cards)
          </h3>
          <div
            className="bg-gray-800 bg-opacity-50 p-2 rounded-lg border border-orange-500 border-opacity-30 flex gap-2 flex-wrap"
            style={{ boxShadow: '0 0 15px rgba(249,115,22,0.1)', minHeight: '110px' }}
          >
            {(playerState?.hand as Card[] | undefined)?.map((card) => (
              <div key={card.id} className="transition-all duration-200 rounded-lg">
                <Card2D
                  card={card}
                  isPlayable={isCardPlayable(card)}
                  isInHand={true}
                  scale={0.85}
                  onClick={() => setSelectedCard(card)}
                  onAction={(action) => handleCardAction(card, action)}
                />
              </div>
            ))}
            {(!playerState?.hand || playerState.hand.length === 0) && (
              <span className="text-xs text-gray-500 italic self-center">Hand is empty</span>
            )}
          </div>
        </div>

      </div>


      {/* Discard Card Modal */}
      {showDiscardModal && discardCard && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg text-center max-w-md">
            <h2 className="text-xl font-bold mb-2">Discard Card</h2>
            <p className="mb-4">Discard {discardCard.name}?</p>
            <div className="flex gap-2 justify-center">
              <button
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                onClick={() => setShowDiscardModal(false)}
              >
                Discard
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
                onClick={() => setShowDiscardModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game winner notification */}
      {winner !== null && !isAnteMode && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-purple-900 p-4 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-2">
              {playerWon ? 'You Win!' : 'You Lose!'}
            </h2>
            <p className="mb-4">
              {playerWon
                ? 'Congratulations! You defeated your opponent!'
                : 'Better luck next time!'}
            </p>
            <button
              className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded"
              onClick={() => router.push('/home')}
            >
              Return to Home
            </button>
          </div>
        </div>
      )}

      {/* Ante Battle Results */}
      {winner !== null && isAnteMode && <AnteBattleResults />}

      {/* Evolution Targeting Banner */}
      {isTargetingEvolution && evolutionCard && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-orange-900 bg-opacity-90 border border-orange-400 rounded-lg px-4 py-2 shadow-lg">
          <span className="text-orange-300 text-sm font-semibold">
            Click a glowing avatar to evolve with{' '}
            <span className="text-white">{evolutionCard.name}</span>
          </span>
          <button
            className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
            onClick={() => cancelTargeting()}
          >
            Cancel (Esc)
          </button>
        </div>
      )}

      {/* Evolution Selection Modal */}
      {isTargetingEvolution && evolutionCard && evolvableAvatars.length > 1 && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Choose Avatar to Evolve</h2>
              <p className="text-sm text-gray-300">
                Select which avatar you want to evolve with {evolutionCard.name}
              </p>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                {evolvableAvatars.map(({ avatar, location }, index) => (
                  <div
                    key={`evolution-${avatar.id}-${location}`}
                    className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors border border-orange-700 hover:border-orange-400"
                    onClick={() => handleEvolutionSelection(location)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{avatar.name}</div>
                        <div className="text-sm text-gray-300">
                          Level {avatar.level} HP:{' '}
                          {avatar.health - (avatar.counters?.damage || 0)}/{avatar.health}
                        </div>
                        <div className="text-xs text-gray-400">
                          {location === 'active'
                            ? 'Active Avatar'
                            : `Reserve Position ${(location as number) + 1}`}
                        </div>
                      </div>
                      <div className="text-orange-400 text-sm font-semibold">Click to Evolve</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
                onClick={() => cancelTargeting()}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spell Effect Animations */}
      <AnimatePresence>
        {activeEffects.map((effect) => (
          <SpellEffectAnimation
            key={effect.id}
            type={effect.type}
            element={effect.element}
            position={effect.position}
            value={effect.value}
            onComplete={() => removeEffect(effect.id)}
          />
        ))}
      </AnimatePresence>

      {/* Card Draw Animation */}
      {drawEffect && (
        <CardDrawEffect
          fromX={drawEffect.fromX}
          fromY={drawEffect.fromY}
          toX={drawEffect.toX}
          toY={drawEffect.toY}
          onComplete={() => setDrawEffect(null)}
        />
      )}

      {/* Card Placement Animation */}
      {placementEffect && (
        <CardPlacementEffect
          cardName={placementEffect.card.name}
          element={placementEffect.card.element}
          fromX={placementEffect.fromX}
          fromY={placementEffect.fromY}
          toX={placementEffect.toX}
          toY={placementEffect.toY}
          onComplete={() => setPlacementEffect(null)}
        />
      )}

      {/* Card Activation Pause */}
      {activationPause && (
        <CardActivationPause
          card={activationPause.card}
          actionName={activationPause.actionName}
          duration={activationPause.duration}
          isPlayerAction={activationPause.isPlayerAction}
          onComplete={clearActivationPause}
        />
      )}

      {/* Forfeit confirmation dialog */}
      {showForfeitDialog && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-4 md:p-6 max-w-md w-[90%] md:w-full border-2 border-red-600">
            <h2 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">
              {anteBattle.isAnteMode ? 'Forfeit Ante Battle?' : 'Leave Match?'}
            </h2>
            <div className="text-gray-300 mb-4 md:mb-5 text-sm md:text-base">
              {anteBattle.isAnteMode ? (
                <>
                  <p className="mb-2">If you leave now, you will automatically lose.</p>
                  <p className="text-xs md:text-sm text-red-300">This action cannot be undone!</p>
                </>
              ) : (
                <p>
                  Are you sure you want to leave? You will automatically lose this match.
                </p>
              )}
            </div>
            <div className="flex gap-2 md:gap-3 justify-end">
              <button
                className="px-3 md:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                onClick={() => setShowForfeitDialog(false)}
              >
                Stay in Game
              </button>
              <button
                onClick={() => {
                  setShowForfeitDialog(false)
                  onForfeit?.()
                }}
                className="px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-sm"
              >
                {anteBattle.isAnteMode ? 'Forfeit & Lose Card' : 'Leave & Forfeit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameBoard2D
