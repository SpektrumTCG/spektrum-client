"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useGameStore } from '@/features/game/stores/useGameStore'
import { useGameMode } from '@/features/game/stores/useGameMode'
import { useGameExitStore } from '@/features/game/stores/useGameExitStore'
import { useAnimationStore } from '@/features/game/stores/useAnimationStore'
import { useSpellEffectsStore } from '@/features/game/stores/useSpellEffectsStore'
import { useAnteBattleStore } from '@/stores/useAnteBattleStore'
import { useMultiplayerStore } from '@/stores/useMultiplayerStore'
import { useMultiplayerGameSync } from '@/features/game/hooks/useMultiplayerGameSync'
import { useAnteGameSync } from '@/features/game/hooks/useAnteGameSync'
import { AnteBattleResults } from '@/components/shared/ante/AnteBattleResults'
import { SafeCardImage } from '@/components/shared/SafeCardImage'
import { Card2D } from './Card2D'
import { CardPreview, elementDotClass, resolveCardName } from './CardPreview'
import { SpellEffectAnimation } from './SpellEffectAnimation'
import { CardDrawEffect } from './CardDrawEffect'
import { CardPlacementEffect } from './CardPlacementEffect'
import { CardActivationPause } from './CardActivationPause'
import { AnimatePresence } from 'framer-motion'
import { getFixedCardImagePath } from '@/lib/cardImageFixer'
import { getValidEvolutionTargets } from '@spektrum/shared'
import type { AvatarCard, Card } from '@spektrum/shared'

// ─── HP bar ───────────────────────────────────────────────────────────────────
const HpBar: React.FC<{ current: number; max: number }> = ({ current, max }) => {
  const pct = Math.max(0, Math.min(100, (current / max) * 100))
  return (
    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mt-0.5">
      <div
        className={`h-full rounded-full transition-all duration-500 ${pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-yellow-400' : 'bg-red-500'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
interface GameBoard2DProps {
  onAction?: (action: string, data?: any) => void
  onForfeit?: () => void
}

export function GameBoard2D({ onAction, onForfeit }: GameBoard2DProps) {
  const gameStore = useGameStore()
  const game = gameStore.game
  const router = useRouter()

  // ── Stores ──
  const { showExitDialog: storeExitDialog, setShowExitDialog: setStoreExitDialog } = useGameExitStore()
  const anteBattle = useAnteBattleStore()
  const { isAnteMode, reportVictory, playerId, opponentId } = useAnteBattleStore()
  const { isMultiplayer, opponentName, sendActionToServer, waitingForGameStart, opponentDisconnected, opponentDisconnectedTurn } = useMultiplayerGameSync()
  const { isAnteGame, sendAnteAction, waitingForAnteStart } = useAnteGameSync()
  const { activeEffects, removeEffect } = useSpellEffectsStore()
  const { activationPause, clearActivationPause } = useAnimationStore()
  const gameMode = useGameMode()
  const isAIThinking = useGameStore(s => s.isAIThinking)

  // ── UI state ──
  const [showForfeitDialog, setShowForfeitDialog] = useState(false)
  const [previewCard, setPreviewCard] = useState<Card | null>(null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [shakingId, setShakingId] = useState<string | null>(null)
  const [targetingSkill, setTargetingSkill] = useState<number | null>(null) // 0 or 1
  const [drawEffect, setDrawEffect] = useState<{ fromX: number; fromY: number; toX: number; toY: number } | null>(null)
  const [placementEffect, setPlacementEffect] = useState<{ card: Card; fromX: number; fromY: number; toX: number; toY: number } | null>(null)

  const gameLogRef = useRef<HTMLDivElement>(null)
  const handContainerRef = useRef<HTMLDivElement>(null)
  const [handContainerWidth, setHandContainerWidth] = useState(400)
  const hasInitialized = useRef(false)
  const lastAutoAdvanceKey = useRef('')

  // ── Derived state ──
  const playerState = game?.players?.[0]
  const opponentState = game?.players?.[1]
  const gamePhase = game?.phase || 'ready'
  const currentPlayerIndex = game?.currentPlayerIndex ?? 0
  const currentPlayer = currentPlayerIndex === 0 ? 'player' : 'opponent'
  const turn = game?.currentTurn || (game as any)?.turn || 1
  const winner = game?.winner ?? null
  const playerWon = winner !== null && winner === playerState?.id
  const logs = game?.battleLog || []
  const isPlayerTurn = currentPlayer === 'player'

  // ── Helpers ──
  const shake = useCallback((id: string, msg: string) => {
    setShakingId(id)
    setTimeout(() => setShakingId(null), 600)
    toast.error(msg, { duration: 2800 })
  }, [])

  const cancelSelection = useCallback(() => {
    setSelectedCardId(null)
    setTargetingSkill(null)
  }, [])

  const routeEndPhase = useCallback(() => {
    if (isAnteGame) sendAnteAction({ type: 'nextPhase' })
    else if (isMultiplayer) sendActionToServer({ type: 'nextPhase' })
    else gameStore.endPhase()
  }, [isAnteGame, isMultiplayer, sendAnteAction, sendActionToServer])

  const routeEndTurn = useCallback(() => {
    if (isAnteGame) sendAnteAction({ type: 'endTurn' })
    else if (isMultiplayer) sendActionToServer({ type: 'endTurn' })
    else gameStore.endTurn()
  }, [isAnteGame, isMultiplayer, sendAnteAction, sendActionToServer])

  // Shared neutral-wildcard spektra check matching engine logic
  const checkSpektraCost = useCallback((cost: string[]): boolean => {
    if (!cost || cost.length === 0 || !playerState) return true
    if (playerState.spektraPile.length < cost.length) return false

    const available: Record<string, number> = {}
    let neutralAvail = 0
    for (const sc of playerState.spektraPile) {
      const el = (sc as any).element ?? 'neutral'
      if (el === 'neutral') neutralAvail++
      else available[el] = (available[el] ?? 0) + 1
    }

    let neutralRem = neutralAvail
    let neutralNeeded = 0
    for (const el of cost) {
      if (el === 'neutral') { neutralNeeded++; continue }
      if ((available[el] ?? 0) > 0) { available[el]!-- }
      else if (neutralRem > 0) { neutralRem-- }
      else return false
    }
    const leftover = Object.values(available).reduce((s, v) => s + v, 0)
    return (leftover + neutralRem) >= neutralNeeded
  }, [playerState])

  const dispatchCardAction = useCallback((card: Card, action: string) => {
    const isServerMode = isAnteGame || isMultiplayer
    const routeAction = isAnteGame ? sendAnteAction : sendActionToServer

    if (isServerMode) {
      const index = playerState?.hand.findIndex(c => c.id === card.id) ?? -1
      if (index === -1) return
      if (action === 'toSpektra') routeAction({ type: 'addToSpektraPile', data: { handIndex: index } })
      else if (action === 'active') routeAction({ type: 'playCard', data: { handIndex: index, target: gamePhase === 'setup' ? 'setup_active' : 'active' } })
      else if (action === 'reserve') routeAction({ type: 'playCard', data: { handIndex: index, target: 'reserve' } })
      else if (action === 'play') routeAction({ type: 'playCard', data: { handIndex: index } })
      return
    }

    // Single player
    if (action === 'active' || action === 'play') {
      // Check spektra cost for spells and items
      if (card.type === 'spell' || card.type === 'quickSpell' || card.type === 'item') {
        const cost = ((card as any).spektraCost ?? []) as string[]
        if (cost.length > 0 && !checkSpektraCost(cost)) {
          toast.error(`Not enough spektra! Need: ${cost.join(', ')}`)
          return
        }
        if (card.type === 'item' && playerState?.hasPlayedItemThisTurn) {
          toast.error('You can only use 1 item per turn!')
          return
        }
      }
      gameStore.playCard(card.id, 'active')
      if (gamePhase === 'setup') gameStore.endPhase()
    } else if (action === 'reserve') {
      const reserveSlot = (playerState?.reserveAvatars?.length ?? 0) === 0 ? 0 : 1
      gameStore.playCard(card.id, reserveSlot)
    } else if (action === 'toSpektra') {
      if (playerState && playerState.avatarToSpektraCount >= 1) {
        toast.error('You can only add 1 card to spektra per turn!')
        return
      }
      gameStore.addToSpektra(card.id)
    }
  }, [isAnteGame, isMultiplayer, sendAnteAction, sendActionToServer, playerState, gamePhase, checkSpektraCost])

  const dispatchEvolve = useCallback((card: Card, targetSlot: 'active' | number) => {
    if (isAnteGame) {
      const idx = playerState?.hand.findIndex(c => c.id === card.id) ?? -1
      sendAnteAction({ type: 'evolveAvatar', data: { handIndex: idx, targetAvatar: targetSlot } })
    } else if (isMultiplayer) {
      const idx = playerState?.hand.findIndex(c => c.id === card.id) ?? -1
      sendActionToServer({ type: 'evolveAvatar', data: { handIndex: idx, targetAvatar: targetSlot } })
    } else {
      gameStore.evolveAvatar(card.id, targetSlot)
    }
  }, [isAnteGame, isMultiplayer, sendAnteAction, sendActionToServer, playerState])

  const dispatchSkill = useCallback((skillIndex: number) => {
    if (!playerState?.activeAvatar) return
    const avatar = playerState.activeAvatar
    const skills = avatar.skills ?? [(avatar as any).skill1, (avatar as any).skill2].filter(Boolean)
    const skill = skills[skillIndex]

    // Check spektra cost with neutral wildcard support
    if (skill?.spektraCost && skill.spektraCost.length > 0) {
      if (!checkSpektraCost(skill.spektraCost)) {
        toast.error(`Not enough spektra! Need: ${skill.spektraCost.join(', ')}`)
        return
      }
    }

    if (isAnteGame) sendAnteAction({ type: 'useAvatarSkill', data: { skillIndex: skillIndex + 1, target: 'opponent-avatar' } })
    else if (isMultiplayer) sendActionToServer({ type: 'useAvatarSkill', data: { skillIndex: skillIndex + 1, target: 'opponent-avatar' } })
    else gameStore.useSkill(skillIndex)
  }, [isAnteGame, isMultiplayer, sendAnteAction, sendActionToServer, playerState, checkSpektraCost])

  const isCardPlayable = useCallback((card: Card) => {
    if (!playerState) return false
    if (gamePhase === 'setup') return card.type === 'avatar' && (Number((card as AvatarCard).level) || 1) === 1 && playerState.activeAvatar === null
    if (card.type === 'quickSpell') return playerState.activeAvatar !== null
    if (currentPlayer !== 'player' || (gamePhase !== 'main1' && gamePhase !== 'main2' && gamePhase !== 'battle')) return false
    if (card.type === 'avatar') return true
    if (card.type === 'item') return playerState.activeAvatar !== null && !playerState.hasPlayedItemThisTurn
    return playerState.activeAvatar !== null
  }, [playerState, gamePhase, currentPlayer])

  // ── Interaction handlers ──

  const handleHandCardClick = useCallback((card: Card) => {
    // Clicking a selected item card plays it directly (items target self)
    if (selectedCardId === card.id) {
      if (card.type === 'item') {
        dispatchCardAction(card, 'play')
        setSelectedCardId(null)
        return
      }
      setSelectedCardId(null)
      return
    }
    // Setup is special: both players place their active avatar independently
    // (no turn order), so the "not your turn" guard is skipped during setup.
    if (gamePhase !== 'setup' && currentPlayer !== 'player' && card.type !== 'quickSpell') {
      shake(`hand-${card.id}`, "It's not your turn!")
      return
    }
    // During setup, only level 1 avatars
    if (gamePhase === 'setup') {
      if (card.type !== 'avatar' || (Number((card as AvatarCard).level) || 1) !== 1) {
        shake(`hand-${card.id}`, 'Deploy a Level 1 Avatar as your Active Avatar first!')
        return
      }
    }
    if (currentPlayer === 'player' && gamePhase !== 'setup' && gamePhase !== 'main1' && gamePhase !== 'main2' && gamePhase !== 'battle' && card.type !== 'quickSpell') {
      shake(`hand-${card.id}`, 'You cannot play cards in this phase.')
      return
    }
    setSelectedCardId(card.id)
    setTargetingSkill(null)
  }, [selectedCardId, currentPlayer, gamePhase, shake])

  const handleActiveZoneClick = useCallback(() => {
    if (!selectedCardId && targetingSkill === null) {
      if (playerState?.activeAvatar) setPreviewCard(playerState.activeAvatar as Card)
      else toast.info('Select a card from your hand first, then click here to deploy.')
      return
    }
    if (targetingSkill !== null) {
      shake('zone-active', "Skills target the opponent's avatar!")
      return
    }
    const card = playerState?.hand.find(c => c.id === selectedCardId)
    if (!card) { setSelectedCardId(null); return }
    if (card.type !== 'avatar') {
      shake('zone-active', 'Only Avatar cards can be placed here!')
      setSelectedCardId(null)
      return
    }
    const avatarCard = card as AvatarCard
    const level = Number(avatarCard.level) || 1

    if (gamePhase === 'setup') {
      if (level !== 1) { shake('zone-active', 'Only Level 1 Avatars can be deployed during setup!'); return }
      dispatchCardAction(card, 'active')
      toast.success(`${resolveCardName(card)} deployed as Active Avatar!`)
      setSelectedCardId(null)
      return
    }

    if (playerState?.activeAvatar) {
      // Evolution attempt
      if (level <= 1) { shake('zone-active', 'Cannot replace your active avatar! Try Reserve or Spektra Pile.'); setSelectedCardId(null); return }
      const targets = getValidEvolutionTargets(avatarCard, { activeAvatar: playerState.activeAvatar, reserveAvatars: playerState.reserveAvatars || [] }, turn)
      if (targets.includes('active')) {
        dispatchEvolve(card, 'active')
        toast.success(`${resolveCardName(card)} evolved!`)
      } else {
        shake('zone-active', 'Cannot evolve — check level, subType, or summoning sickness.')
      }
    } else {
      if (level !== 1) { shake('zone-active', 'Only Level 1 Avatars can be deployed!'); setSelectedCardId(null); return }
      dispatchCardAction(card, 'active')
      toast.success(`${resolveCardName(card)} deployed as Active Avatar!`)
    }
    setSelectedCardId(null)
  }, [selectedCardId, targetingSkill, playerState, gamePhase, turn, shake, dispatchCardAction, dispatchEvolve])

  const handleSpektraPileClick = useCallback(() => {
    if (gamePhase === 'setup') {
      shake('zone-spektra', 'Deploy your Active Avatar first!')
      return
    }
    if (!selectedCardId) { shake('zone-spektra', 'Select a card from your hand first!'); return }
    const card = playerState?.hand.find(c => c.id === selectedCardId)
    if (!card) { setSelectedCardId(null); return }
    if (card.type === 'spell' || card.type === 'quickSpell') {
      shake('zone-spektra', 'Only Avatar cards can be placed in the Spektra Pile!')
      setSelectedCardId(null)
      return
    }
    if (playerState && playerState.avatarToSpektraCount >= 1) {
      shake('zone-spektra', 'You can only add 1 Avatar card to Spektra per turn!')
      setSelectedCardId(null)
      return
    }
    dispatchCardAction(card, 'toSpektra')
    toast.success(`${resolveCardName(card)} added to Spektra Pile!`)
    setSelectedCardId(null)
  }, [selectedCardId, playerState, gamePhase, shake, dispatchCardAction])

  const handleOppAvatarClick = useCallback(() => {
    if (targetingSkill !== null) {
      dispatchSkill(targetingSkill)
      setTargetingSkill(null)
      setSelectedCardId(null)
      return
    }
    if (!selectedCardId) {
      if (opponentState?.activeAvatar) setPreviewCard(opponentState.activeAvatar as Card)
      return
    }
    const card = playerState?.hand.find(c => c.id === selectedCardId)
    if (!card) { setSelectedCardId(null); return }
    if (card.type === 'spell' || card.type === 'quickSpell') {
      dispatchCardAction(card, 'play')
      setSelectedCardId(null)
      return
    }
    shake('opp-active-zone', 'Only spells can target the opponent!')
    setSelectedCardId(null)
  }, [selectedCardId, targetingSkill, playerState, opponentState, shake, dispatchCardAction, dispatchSkill])

  const handleReserveClick = useCallback((slotIndex: number) => {
    if (gamePhase === 'setup') {
      shake(`zone-reserve-${slotIndex}`, 'Deploy your Active Avatar first!')
      return
    }
    if (!selectedCardId && targetingSkill === null) {
      const avatar = playerState?.reserveAvatars?.[slotIndex]
      if (avatar) setPreviewCard(avatar as Card)
      return
    }
    if (targetingSkill !== null) {
      shake(`zone-reserve-${slotIndex}`, "Skills target the opponent's avatar!")
      return
    }
    const card = playerState?.hand.find(c => c.id === selectedCardId)
    if (!card) { setSelectedCardId(null); return }
    if (card.type !== 'avatar') {
      shake(`zone-reserve-${slotIndex}`, 'Only Avatar cards can be placed as reserves!')
      setSelectedCardId(null)
      return
    }
    const avatarCard = card as AvatarCard
    const level = Number(avatarCard.level) || 1
    const existingAvatar = playerState?.reserveAvatars?.[slotIndex]

    if (existingAvatar) {
      // Evolution attempt on reserve
      if (level <= 1) { shake(`zone-reserve-${slotIndex}`, 'Cannot replace reserve avatar.'); setSelectedCardId(null); return }
      const targets = getValidEvolutionTargets(avatarCard, { activeAvatar: playerState?.activeAvatar || null, reserveAvatars: playerState?.reserveAvatars || [] }, turn)
      if (targets.includes(slotIndex)) {
        dispatchEvolve(card, slotIndex)
        toast.success(`${resolveCardName(card)} evolved!`)
      } else {
        shake(`zone-reserve-${slotIndex}`, 'Cannot evolve — check level, subType, or summoning sickness.')
      }
    } else {
      if (level !== 1) { shake(`zone-reserve-${slotIndex}`, 'Only Level 1 Avatars can be placed as reserves!'); setSelectedCardId(null); return }
      if ((playerState?.reserveAvatars?.length ?? 0) >= 2) { shake(`zone-reserve-${slotIndex}`, 'Reserve is full!'); setSelectedCardId(null); return }
      dispatchCardAction(card, 'reserve')
    }
    setSelectedCardId(null)
  }, [selectedCardId, targetingSkill, playerState, gamePhase, turn, shake, dispatchCardAction, dispatchEvolve])

  const handleSkillButtonClick = useCallback((skillIndex: number) => {
    if (targetingSkill === skillIndex) { setTargetingSkill(null); return }
    setTargetingSkill(skillIndex)
    setSelectedCardId(null)
    toast.success('Skill ready! Now click the opponent\'s avatar to attack.')
  }, [targetingSkill])

  const handleNextAction = useCallback(() => {
    if (gamePhase === 'main1' || gamePhase === 'battle' || gamePhase === 'main2') {
      routeEndPhase() // advance to next phase (main1→battle→main2→recheck→end)
    } else {
      routeEndTurn()
    }
  }, [gamePhase, routeEndPhase, routeEndTurn])

  // ── Effects ──

  // Forward exit store events
  useEffect(() => {
    if (storeExitDialog) { setShowForfeitDialog(true); setStoreExitDialog(false) }
  }, [storeExitDialog, setStoreExitDialog])

  // Ante victory reporting
  useEffect(() => {
    if (game?.winner && isAnteMode) {
      const winnerId = game.winner === playerState?.id ? playerId : opponentId
      if (winnerId) reportVictory(winnerId)
    }
  }, [game?.winner, isAnteMode, reportVictory, playerId, opponentId, playerState?.id])

  // Track hand container width for adaptive card layout
  useEffect(() => {
    const el = handContainerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setHandContainerWidth(entry.contentRect.width)
    })
    ro.observe(el)
    setHandContainerWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // Auto-scroll battle log
  useEffect(() => {
    gameLogRef.current?.scrollTo({ top: gameLogRef.current.scrollHeight, behavior: 'smooth' })
  }, [logs])

  // Escape key to cancel
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') cancelSelection() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [cancelSelection])

  // Auto-advance non-interactive phases (single player / AI only — server handles this in multiplayer)
  useEffect(() => {
    if (!game || currentPlayer !== 'player' || game.winner) return
    if (isMultiplayer || isAnteGame) return
    const key = `${gamePhase}-${turn}-${currentPlayerIndex}`
    if (lastAutoAdvanceKey.current === key) return
    if (['refresh', 'draw', 'recheck'].includes(gamePhase)) {
      lastAutoAdvanceKey.current = key
      const timer = setTimeout(() => routeEndPhase(), 300)
      return () => clearTimeout(timer)
    }
    if (gamePhase === 'end') {
      lastAutoAdvanceKey.current = key
      const timer = setTimeout(() => routeEndTurn(), 500)
      return () => clearTimeout(timer)
    }
  }, [gamePhase, turn, currentPlayer, currentPlayerIndex, game?.winner, isMultiplayer, isAnteGame, routeEndPhase, routeEndTurn])

  // Initialize game mode
  useEffect(() => {
    if (hasInitialized.current) return
    const isMultiplayerDirect = useMultiplayerStore.getState().isMultiplayerSession
    const isAnteDirect = useAnteBattleStore.getState().isAnteMode
    if (gameMode.mode === 'playerVsAI') {
      useMultiplayerStore.getState().setIsMultiplayerSession(false)
      useMultiplayerStore.getState().setCurrentRoom(null)
    }
    if (isAnteDirect || isAnteGame || isMultiplayerDirect || isMultiplayer || (gameMode.mode === 'playerVsPlayer' && gameMode.isOnline)) {
      hasInitialized.current = true
      return
    }
    hasInitialized.current = true
  }, [isMultiplayer, isAnteGame, gameMode])

  // ── Derived render values ──
  const selectedCard = selectedCardId ? playerState?.hand.find(c => c.id === selectedCardId) : null
  const activeAvatarHp = playerState?.activeAvatar ? playerState.activeAvatar.health - (playerState.activeAvatar.counters?.damage || 0) : 0
  const oppAvatar = opponentState?.activeAvatar
  const oppAvatarHp = oppAvatar ? oppAvatar.health - (oppAvatar.counters?.damage || 0) : 0

  // Contextual button label
  const nextActionLabel = gamePhase === 'main1' ? 'Battle \u2192' : gamePhase === 'battle' ? 'Main 2 \u2192' : gamePhase === 'main2' ? 'End Turn \u2192' : 'End Turn \u2192'

  // ── Loading ──
  if (!game) {
    return (
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950 overflow-hidden"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Atmospheric backdrop */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(249,115,22,0.18), transparent 70%), radial-gradient(ellipse 60% 50% at 50% 90%, rgba(15,23,42,0.5), transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='64' viewBox='0 0 56 64'><path d='M28 0L56 16v32L28 64L0 48V16z' fill='none' stroke='white' stroke-width='1'/></svg>\")",
            backgroundSize: '56px 64px',
          }}
        />

        <div className="relative flex flex-col items-center text-center px-6">
          {/* Spinner composition: outer orbital ring + inner pulse + center swords */}
          <div className="relative w-32 h-32 mb-6">
            {/* Outer orbital ring (orange) */}
            <div className="absolute inset-0 rounded-full border-2 border-orange-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-400 border-r-orange-500/60 animate-spin" style={{ animationDuration: '1.4s' }} />

            {/* Mid ring (slow reverse) */}
            <div className="absolute inset-3 rounded-full border border-white/5" />
            <div
              className="absolute inset-3 rounded-full border border-transparent border-b-amber-300/70"
              style={{ animation: 'spin 2.4s linear infinite reverse' }}
            />

            {/* Inner core */}
            <div className="absolute inset-7 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-600/10 ring-1 ring-orange-400/30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse shadow-[0_0_16px_4px_rgba(249,115,22,0.6)]" />
            </div>

            {/* Corner hex ticks for sci-fi feel */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-orange-400" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-orange-400/40" />
          </div>

          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.28em] uppercase px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-300 border border-orange-400/30 font-mono mb-3">
            <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse" />
            Preparing Match
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white leading-tight">Loading Battle</h1>
          <p className="text-sm text-slate-400 mt-1">Shuffling decks &amp; syncing arena…</p>

          {/* Bouncing dots */}
          <div className="flex items-center gap-1.5 mt-5">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" />
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </div>
    )
  }

  // ── Render ──
  return (
    <div className="w-full">
      <style>{`
        @keyframes tut-shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-6px)}30%{transform:translateX(6px)}45%{transform:translateX(-5px)}60%{transform:translateX(5px)}75%{transform:translateX(-3px)}90%{transform:translateX(3px)}}
        .animate-shake{animation:tut-shake 0.5s ease-in-out;}
      `}</style>

      {/* Card Preview Modal */}
      {previewCard && <CardPreview card={previewCard} onClose={() => setPreviewCard(null)} />}

      <div className="w-full min-h-screen bg-gray-900 text-white relative overflow-x-hidden pb-20 z-[25]" style={{ paddingTop: 56 }}>

        {/* Ante waiting overlay */}
        {isAnteGame && waitingForAnteStart && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100]">
            <div className="text-center p-8">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-orange-400 mb-3">Wager Battle Starting...</h2>
              <p className="text-gray-400 text-sm mb-2">Syncing with opponent. Hold tight!</p>
            </div>
          </div>
        )}

        {/* Multiplayer waiting overlay */}
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
                  <h2 className="text-2xl font-bold text-gray-300 mb-3">Your Opponent Exited the Game</h2>
                  <p className="text-gray-400 mb-6">Your opponent left before the game could begin.</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-orange-400 mb-3">You Win!</h2>
                  <p className="text-gray-300 mb-2 text-lg">Your opponent forfeited the game!</p>
                </>
              )}
              <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 px-8 py-3 rounded-lg font-bold text-lg" onClick={() => router.push('/home')}>
                Back to Home
              </button>
            </div>
          </div>
        )}

        {/* AI / Opponent turn overlay */}
        {isAIThinking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 pointer-events-none">
            <div className="border-2 border-red-500 bg-gray-900 rounded-xl px-10 py-6 text-center" style={{ boxShadow: '0 0 40px rgba(239,68,68,0.5)' }}>
              <div className="text-2xl font-bold text-red-400 mb-1">Opponent&apos;s Turn</div>
              <div className="text-sm text-gray-300 animate-pulse">Thinking...</div>
            </div>
          </div>
        )}

        {/* Header */}
        <div
          className="relative z-40 mb-2 p-2 flex flex-wrap gap-2 justify-between items-center bg-gray-800 rounded-none md:rounded-lg border-b-2 md:border-2 border-orange-500"
          style={{ boxShadow: '0 0 20px rgba(249,115,22,0.2)' }}
        >
          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-bold text-sm">Turn {turn}</span>
            <span className="bg-orange-600 px-2 py-0.5 rounded text-xs">{gamePhase}</span>
            {currentPlayer === 'opponent' && playerState?.hand.some(c => c.type === 'quickSpell') && (
              <span className="bg-purple-700 px-2 py-0.5 rounded text-xs animate-pulse">Quick Spells</span>
            )}
            <span
              className="px-2 py-0.5 rounded text-xs"
              style={{
                backgroundColor: isAnteGame ? '#B91C1C' : isMultiplayer ? '#FF6B35' : gameMode.mode === 'playerVsAI' ? '#8B0000' : gameMode.mode === 'singlePlayer' ? '#006400' : '#555',
              }}
            >
              {isAnteGame ? 'WAGER BATTLE' : isMultiplayer ? `VS ${opponentName}` : gameMode.mode === 'playerVsAI' ? `VS AI - ${gameMode.aiDifficulty.charAt(0).toUpperCase() + gameMode.aiDifficulty.slice(1)}` : gameMode.mode === 'singlePlayer' ? 'Practice' : ''}
            </span>
          </div>
        </div>

        {/* Selected card / skill hint banner */}
        {(selectedCardId || targetingSkill !== null) && (
          <div className="mx-2 mb-2 px-3 py-1.5 bg-orange-950/60 rounded-lg border border-orange-500/50 text-xs text-orange-300 animate-pulse flex justify-between items-center">
            <span>
              {targetingSkill !== null
                ? 'Skill ready \u2014 now click the opponent\'s avatar to attack!'
                : selectedCard
                  ? `${resolveCardName(selectedCard)} selected \u2014 click a target zone to play.`
                  : 'Card selected \u2014 click a target zone.'}
            </span>
            <button onClick={cancelSelection} className="underline text-gray-400 ml-2 shrink-0">Cancel (Esc)</button>
          </div>
        )}

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
                        <div key={i} className={`w-3 h-3 rounded-full ${elementDotClass((card as any).element || 'neutral')}`} />
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
                {oppAvatar ? (
                  <div
                    onClick={handleOppAvatarClick}
                    style={{ cursor: 'pointer' }}
                    className={`
                      transition-all duration-200
                      ${(selectedCardId && (selectedCard?.type === 'spell' || selectedCard?.type === 'quickSpell')) || targetingSkill !== null ? 'ring-2 ring-orange-400 rounded-lg shadow-lg shadow-orange-500/60' : ''}
                      ${shakingId === 'opp-active-zone' ? 'animate-shake' : ''}
                    `}
                  >
                    <Card2D card={oppAvatar} isPlayable={targetingSkill !== null || !!(selectedCardId && (selectedCard?.type === 'spell' || selectedCard?.type === 'quickSpell'))} isInHand={false} isTapped={oppAvatar.isTapped} counters={oppAvatar.counters} scale={0.85} />
                    <HpBar current={oppAvatarHp} max={oppAvatar.health} />
                    <div className="text-center text-[9px] text-yellow-300 font-bold mt-0.5">
                      HP {oppAvatarHp}/{oppAvatar.health}
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
                  <div key={index} className="relative rounded cursor-pointer overflow-hidden ring-1 ring-red-700" style={{ width: '48px', height: '64px' }} onClick={() => setPreviewCard(avatar as Card)}>
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
            <div className="flex gap-4 items-center">
              <h3 className="text-xs font-bold text-orange-400 tracking-widest uppercase">Field</h3>
              {playerState?.field && playerState.field.length > 0 ? (
                <div className="text-xs text-center bg-purple-900 bg-opacity-70 p-2 rounded border border-purple-500 min-w-[80px]">
                  <div className="font-bold truncate">{playerState.field[0].name}</div>
                  <div className="text-[10px] text-gray-300">{playerState.field[0].type}</div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-600 rounded p-2 text-center min-w-[80px]">
                  <span className="text-[10px] text-gray-400">Empty</span>
                </div>
              )}
            </div>
          </div>

          {/* ── BATTLE LOG ── */}
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-2">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Battle Log</div>
            <div className="max-h-16 overflow-y-auto" ref={gameLogRef}>
              {logs.map((log: string, index: number) => (
                <div key={index} className={`text-[10px] leading-relaxed ${index === logs.length - 1 ? 'text-orange-300' : 'text-gray-600'}`}>
                  &rsaquo; {log}
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
                        <div key={`spektra-${card.id}-${i}`} className="w-5 h-5 rounded-full border border-amber-500 flex items-center justify-center" title={`${(card as any).name} (${(card as any).element})`}>
                          <div className={`w-3 h-3 rounded-full ${elementDotClass((card as any).element || 'neutral')}`} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-500">Empty</span>
                  )}
                </div>
              </div>

              {/* Spektra Pile drop zone */}
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: selectedCardId && selectedCard?.type === 'avatar' ? '#fb923c' : '#6b7280' }}
                >
                  Spektra Pile
                </span>
                <div
                  onClick={handleSpektraPileClick}
                  className={`
                    w-16 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center
                    cursor-pointer transition-all duration-200
                    ${selectedCardId && selectedCard?.type === 'avatar' ? 'border-orange-400 bg-orange-950/40 ring-2 ring-orange-400 shadow-lg shadow-orange-500/50' : 'border-gray-600 hover:border-gray-500'}
                    ${shakingId === 'zone-spektra' ? 'animate-shake' : ''}
                  `}
                >
                  {(playerState?.spektraPile?.length || 0) > 0 ? (
                    <div className={`w-6 h-6 rounded-full ${elementDotClass((playerState!.spektraPile[0] as any).element || 'neutral')} border-2 border-amber-400`} />
                  ) : (
                    <span className="text-[9px] text-gray-500 text-center leading-tight px-1">Drop Avatar here</span>
                  )}
                  {(playerState?.spektraPile?.length || 0) > 0 && (
                    <span className="text-[9px] text-orange-300 mt-1 font-bold">{playerState!.spektraPile.length} Spektra</span>
                  )}
                </div>
              </div>

              {/* Player active avatar */}
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: selectedCardId && selectedCard?.type === 'avatar' ? '#fb923c' : '#6b7280' }}
                >
                  Active Avatar
                </span>
                {playerState?.activeAvatar ? (
                  <div
                    onClick={handleActiveZoneClick}
                    style={{ cursor: 'pointer' }}
                    className={`
                      transition-all duration-200
                      ${selectedCardId && selectedCard?.type === 'avatar' && Number((selectedCard as AvatarCard).level) > 1 ? 'ring-2 ring-orange-400 rounded-lg shadow-lg shadow-orange-500/60' : ''}
                      ${targetingSkill !== null ? 'ring-4 ring-white rounded-lg shadow-xl shadow-white/40 scale-105' : ''}
                      ${shakingId === 'zone-active' ? 'animate-shake' : ''}
                    `}
                  >
                    <Card2D card={playerState.activeAvatar} isPlayable={true} isInHand={false} isTapped={playerState.activeAvatar.isTapped} counters={playerState.activeAvatar.counters} scale={0.85} />
                    <HpBar current={activeAvatarHp} max={playerState.activeAvatar.health} />
                    <div className="text-center text-[9px] text-yellow-300 font-bold mt-0.5">
                      HP {activeAvatarHp}/{playerState.activeAvatar.health}
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={handleActiveZoneClick}
                    className={`
                      w-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200
                      ${selectedCardId && selectedCard?.type === 'avatar' ? 'border-orange-400 bg-orange-950/30 ring-2 ring-orange-400 shadow-lg shadow-orange-500/50' : 'border-gray-600 hover:border-gray-500'}
                      ${shakingId === 'zone-active' ? 'animate-shake' : ''}
                    `}
                    style={{ height: '91px' }}
                  >
                    <span className="text-[9px] text-gray-500 text-center px-1 leading-tight">Deploy Avatar here</span>
                  </div>
                )}
                {/* Skill buttons */}
                {isPlayerTurn && gamePhase === 'battle' && playerState?.activeAvatar && !playerState.activeAvatar.isTapped && (() => {
                  const avatar = playerState.activeAvatar!
                  const skill1 = avatar.skills?.[0] || (avatar as any).skill1
                  const skill2 = avatar.skills?.[1] || (avatar as any).skill2
                  if (!skill1 && !skill2) return null
                  return (
                    <div className="flex flex-col gap-1 mt-1 w-full">
                      {skill1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSkillButtonClick(0) }}
                          className={`
                            text-[9px] px-2 py-0.5 rounded font-bold w-full transition-all
                            ${targetingSkill === 0
                              ? 'bg-red-900/60 text-gray-400 cursor-default'
                              : 'bg-red-600 hover:bg-red-500 text-white ring-2 ring-orange-400 cursor-pointer'}
                          `}
                          disabled={targetingSkill === 0}
                        >
                          {targetingSkill === 0 ? `\u26A1 ${skill1.name} ready\u2026` : `${skill1.name} [${skill1.damage || 0}]`}
                        </button>
                      )}
                      {skill2 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSkillButtonClick(1) }}
                          className={`
                            text-[9px] px-2 py-0.5 rounded font-bold w-full transition-all
                            ${targetingSkill === 1
                              ? 'bg-purple-900/60 text-gray-400 cursor-default'
                              : 'bg-purple-600 hover:bg-purple-500 text-white ring-2 ring-purple-400 cursor-pointer'}
                          `}
                          disabled={targetingSkill === 1}
                        >
                          {targetingSkill === 1 ? `\u26A1 ${skill2.name} ready\u2026` : `${skill2.name} [${skill2.damage || 0}]`}
                        </button>
                      )}
                    </div>
                  )
                })()}
              </div>

              {/* Player reserves */}
              <div className="flex flex-col gap-1">
                <div className="text-[10px] text-gray-500">Reserves {playerState?.reserveAvatars?.length || 0}/2</div>
                {playerState?.reserveAvatars?.map((avatar, index) => (
                  <div
                    key={index}
                    className={`relative rounded cursor-pointer overflow-hidden transition-all ring-1 ring-blue-700 ${
                      selectedCardId && selectedCard?.type === 'avatar' && Number((selectedCard as AvatarCard).level) > 1 ? 'ring-2 ring-orange-400 animate-pulse' : ''
                    } ${shakingId === `zone-reserve-${index}` ? 'animate-shake' : ''}`}
                    style={{ width: '48px', height: '64px' }}
                    onClick={() => handleReserveClick(index)}
                  >
                    {(avatar.imagePath || avatar.art) && <SafeCardImage src={getFixedCardImagePath(avatar)} alt={avatar.name} className="w-full h-full object-cover" />}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 px-0.5 py-0.5">
                      <div className="text-[9px] text-yellow-300 text-center">HP: {avatar.health - (avatar.counters?.damage || 0)}</div>
                    </div>
                  </div>
                ))}
                {/* Empty reserve slots */}
                {Array.from({ length: Math.max(0, 2 - (playerState?.reserveAvatars?.length || 0)) }).map((_, i) => {
                  const slotIndex = (playerState?.reserveAvatars?.length || 0) + i
                  return (
                    <div
                      key={`empty-rsv-${i}`}
                      onClick={() => handleReserveClick(slotIndex)}
                      className={`
                        border border-dashed rounded w-12 h-16 flex items-center justify-center cursor-pointer transition-all
                        ${selectedCardId && selectedCard?.type === 'avatar' && Number((selectedCard as AvatarCard).level || 1) === 1 ? 'border-orange-400 bg-orange-950/30 ring-1 ring-orange-400' : 'border-gray-700 opacity-30'}
                        ${shakingId === `zone-reserve-${slotIndex}` ? 'animate-shake' : ''}
                      `}
                    >
                      <span className="text-[9px] text-gray-500">Rsv</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── PLAYER HAND ── */}
          <div>
            <h3 className="text-xs font-bold mb-1 text-orange-400 tracking-widest uppercase">
              Your Hand ({playerState?.hand?.length || 0} cards)
            </h3>
            <div
              ref={handContainerRef}
              className="bg-gray-800 bg-opacity-50 p-2 rounded-lg border border-orange-500 border-opacity-30 relative"
              style={{ boxShadow: '0 0 15px rgba(249,115,22,0.1)', minHeight: '130px' }}
            >
              {(playerState?.hand as Card[] | undefined)?.length ? (
                <div className="flex items-end" style={{ minHeight: '120px', paddingTop: '10px' }}>
                  {(playerState?.hand as Card[]).map((card, index) => {
                    const hid = `hand-${card.id}`
                    const isSelected = selectedCardId === card.id
                    const playable = isCardPlayable(card)
                    const total = playerState!.hand.length
                    const cardWidth = 102 // 120 * 0.85
                    const containerW = handContainerWidth - 16 // minus padding
                    // If all cards fit side-by-side with 6px gap, show them full width
                    const totalFullWidth = total * cardWidth + (total - 1) * 6
                    const fitsFullWidth = totalFullWidth <= containerW
                    return (
                      <div
                        key={card.id}
                        onClick={() => handleHandCardClick(card)}
                        className={`
                          relative transition-all duration-200 rounded-lg flex-shrink-0
                          ${shakingId === hid ? 'animate-shake' : ''}
                        `}
                        style={{
                          cursor: 'pointer',
                          width: fitsFullWidth
                            ? `${cardWidth}px`
                            : index === total - 1
                              ? `${cardWidth}px`
                              : `${Math.max(30, (containerW - cardWidth) / (total - 1))}px`,
                          marginRight: fitsFullWidth && index < total - 1 ? '6px' : '0px',
                          zIndex: isSelected ? 50 : index,
                          marginTop: isSelected ? '-16px' : '0',
                          filter: isSelected ? 'drop-shadow(0 0 12px rgba(255,255,255,0.5))' : undefined,
                        }}
                      >
                        <div
                          className={`
                            transition-all duration-200 rounded-lg
                            ${playable && !isSelected ? 'ring-1 ring-orange-500/40' : ''}
                            ${isSelected ? 'ring-4 ring-white shadow-xl shadow-white/40' : ''}
                          `}
                        >
                          <Card2D
                            card={card}
                            isPlayable={playable || isSelected}
                            isInHand={false}
                            scale={0.85}
                            onClick={() => {}}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center" style={{ minHeight: '110px' }}>
                  <span className="text-xs text-gray-500 italic">Hand is empty</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Game winner notification ── */}
        {winner !== null && !isAnteMode && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 pointer-events-auto">
            <div
              className={`bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-2 p-8 max-w-sm w-full mx-4 text-center ${playerWon ? 'border-orange-500' : 'border-red-500'}`}
              style={{ boxShadow: playerWon ? '0 0 60px rgba(249,115,22,0.5)' : '0 0 60px rgba(239,68,68,0.5)' }}
            >
              <div className="text-6xl mb-4">{playerWon ? '\uD83C\uDFC6' : '\uD83D\uDCA5'}</div>
              <h1 className={`text-3xl font-bold mb-2 ${playerWon ? 'text-orange-400' : 'text-red-400'}`}>
                {playerWon ? 'You Win!' : 'You Lose!'}
              </h1>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                {playerWon ? 'Congratulations! You defeated your opponent!' : 'Better luck next time!'}
              </p>
              <button
                onClick={() => router.push('/home')}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-lg transition-all border border-orange-400"
                style={{ boxShadow: '0 0 20px rgba(249,115,22,0.4)' }}
              >
                Return to Home
              </button>
            </div>
          </div>
        )}

        {/* Ante Battle Results */}
        {winner !== null && isAnteMode && <AnteBattleResults />}

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

        {/* ── Bottom Action Bar ── */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t-2 border-orange-500 px-4 py-3 flex items-center justify-between"
          style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.5)' }}
        >
          <button
            onClick={() => setShowForfeitDialog(true)}
            className="px-4 py-2 rounded-lg font-bold text-sm bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white transition-all"
          >
            Exit
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline">
              Turn {turn} &bull; {gamePhase}
            </span>
            <button
              onClick={handleNextAction}
              disabled={!isPlayerTurn || gamePhase === 'setup'}
              className={`
                px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200 border-2
                ${isPlayerTurn && gamePhase !== 'setup'
                  ? 'bg-orange-600 border-orange-400 text-white hover:bg-orange-500 active:scale-95'
                  : 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'}
              `}
            >
              {nextActionLabel}
            </button>
          </div>
        </div>

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
                  <p>Are you sure you want to leave? You will automatically lose this match.</p>
                )}
              </div>
              <div className="flex gap-2 md:gap-3 justify-end">
                <button className="px-3 md:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm" onClick={() => setShowForfeitDialog(false)}>
                  Stay in Game
                </button>
                <button
                  onClick={() => {
                    setShowForfeitDialog(false)
                    if (onForfeit) { onForfeit() }
                    else {
                      // Notify server of forfeit in multiplayer/ante modes, then drop the
                      // local room so revisiting /multiplayer shows mode selection (not the
                      // stale lobby).
                      const mpStore = useMultiplayerStore.getState()
                      const mpSocket = mpStore.socket
                      if ((isMultiplayer || isAnteGame) && mpSocket?.connected) {
                        mpSocket.emit('forfeit_game')
                      }
                      mpStore.leaveRoom()
                      gameStore.resetGame()
                      router.push('/home')
                    }
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
    </div>
  )
}

export default GameBoard2D
