"use client"

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card2D } from '@/features/game/components/Card2D'
import { newFireAvatarCards, newFireSpellCards } from '@/domain/game/data/cards/fire'
import type { AvatarCard, ActionCard } from '@/domain/game/types/card'

// ─── Card refs ────────────────────────────────────────────────────────────────
const KOBAR_TRAINEE   = newFireAvatarCards.find(c => c.id === 'fire-kobar-trainee-a')! as AvatarCard
const BORAH_TRAINEE   = newFireAvatarCards.find(c => c.id === 'fire-borah-trainee-a')! as AvatarCard
const BORAH_TRAINEE_B = newFireAvatarCards.find(c => c.id === 'fire-borah-trainee-b')! as AvatarCard
const RADJA           = newFireAvatarCards.find(c => c.id === 'fire-radja')!           as AvatarCard
const REPO_GIRL       = newFireAvatarCards.find(c => c.id === 'fire-repo-girl')!       as AvatarCard
const FLAME_FLICKER   = newFireSpellCards.find(c => c.id === 'flame-flicker')!         as ActionCard

// ─── Step definitions ─────────────────────────────────────────────────────────
interface StepDef {
  phase: string
  title: string
  instruction: string
  spotlit: string[]
}

const STEPS: StepDef[] = [
  {
    phase: 'Setup Phase',
    title: 'Deploy Your Avatar',
    instruction: 'Welcome to Spektrum! Those 4 face-down cards per side are your Life Cards. Click Kobar Trainee A in your hand, then click the Active Avatar slot to deploy.',
    spotlit: ['hand-fire-kobar-trainee-a', 'zone-active'],
  },
  {
    phase: 'Main Phase 1',
    title: 'Generate Spektra',
    instruction: 'To cast spells you need Spektra. Click Borah Trainee A, then click the Spektra Pile zone to sacrifice it and generate Fire Spektra.',
    spotlit: ['hand-fire-borah-trainee-a', 'zone-spektra'],
  },
  {
    phase: 'Main Phase 1',
    title: 'Cast a Spell',
    instruction: 'You have Spektra — use it! Click Flame Flicker, then click Repo Girl to deal 2 damage.',
    spotlit: ['hand-flame-flicker', 'opp-active-zone'],
  },
  {
    phase: 'End Phase',
    title: 'Pass the Turn',
    instruction: 'Avatars cannot evolve the same turn they enter play (Summoning Sickness). Click Next Turn to pass.',
    spotlit: ['btn-next-turn'],
  },
  {
    phase: 'Main Phase 1 — Turn 2',
    title: 'Generate Spektra (Turn 2)',
    instruction: "Turn 2! You drew Radja. But first, generate Spektra for Radja's skill. Click Borah Trainee B, then drop it in the Spektra Pile.",
    spotlit: ['hand-fire-borah-trainee-b', 'zone-spektra'],
  },
  {
    phase: 'Main Phase 1 — Turn 2',
    title: 'Evolve Your Avatar',
    instruction: 'Now evolve! Click Radja in your hand, then click your Kobar Trainee on the field.',
    spotlit: ['hand-fire-radja', 'zone-active'],
  },
  {
    phase: 'Battle Phase',
    title: 'Attack!',
    instruction: "Radja is ready! Click 'Pyro Punch' below Radja to use its skill, then click Repo Girl to attack!",
    spotlit: ['btn-pyro-punch', 'opp-active-zone'],
  },
  {
    phase: 'Victory',
    title: 'Tutorial Complete',
    instruction: 'You now know the true mechanics of Spektrum. You mastered Setup, Spektra, Spells, Evolution, and Battle. Ready for the Ritual?',
    spotlit: [],
  },
]

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

// ─── Element dot ──────────────────────────────────────────────────────────────
const elementDotClass = (el: string) => {
  switch (el) {
    case 'fire':   return 'bg-red-500'
    case 'water':  return 'bg-blue-500'
    case 'ground': return 'bg-amber-800'
    case 'air':    return 'bg-cyan-300'
    default:       return 'bg-gray-400'
  }
}

type OppPhase = 'idle' | 'banner' | 'spektra' | 'attacking' | 'result' | 'player-banner'

// ─── Main component ───────────────────────────────────────────────────────────
export function InteractiveTutorialFeature() {
  const router = useRouter()

  const [step, setStep]                         = useState(0)
  const [selectedId, setSelectedId]             = useState<string | null>(null)
  const [shakingId, setShakingId]               = useState<string | null>(null)
  const [showVictory, setShowVictory]           = useState(false)
  const [oppPhase, setOppPhase]                 = useState<OppPhase>('idle')
  const animTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  const [playerHand, setPlayerHand]         = useState<(AvatarCard | ActionCard)[]>([
    KOBAR_TRAINEE, BORAH_TRAINEE, BORAH_TRAINEE_B, FLAME_FLICKER,
  ])
  const [activeAvatar, setActiveAvatar]       = useState<AvatarCard | null>(null)
  const [activeAvatarDmg, setActiveAvatarDmg] = useState(0)
  const [oppDmg, setOppDmg]                   = useState(0)
  const [oppDefeated, setOppDefeated]         = useState(false)
  const [oppHandCount, setOppHandCount]       = useState(4)
  const [oppSpektraPileCount, setOppSpektraPileCount] = useState(0)
  const [attackingField, setAttackingField]   = useState(false)
  const [spektraPile, setSpektraPile]         = useState<AvatarCard[]>([])
  const [playerLifeCards]                     = useState(4)
  const [opponentLifeCards, setOpponentLifeCards] = useState(4)
  const [turn, setTurn]                       = useState(1)
  const [battleLog, setBattleLog]             = useState<string[]>(['Tutorial started. Good luck!'])

  const addLog = (msg: string) =>
    setBattleLog(prev => [...prev.slice(-5), msg])

  const stepDef = STEPS[step]
  const spotlit = new Set(stepDef?.spotlit ?? [])
  const hasSpot = spotlit.size > 0 && oppPhase === 'idle'

  const isSpotlit = (id: string) => spotlit.has(id)
  const isDimmed  = (id: string) => hasSpot && !spotlit.has(id)

  const shake = useCallback((id: string, msg: string) => {
    setShakingId(id)
    setTimeout(() => setShakingId(null), 600)
    toast.error(msg, { duration: 2800 })
  }, [])

  const handleHandCardClick = useCallback((card: AvatarCard | ActionCard) => {
    const handId = `hand-${card.id}`
    if (step === 0) {
      if (card.id !== 'fire-kobar-trainee-a') {
        shake(handId, card.type === 'spell'
          ? 'Only Avatar cards can be placed as your Active Avatar.'
          : 'Deploy Kobar Trainee A as your Active Avatar first!')
        return
      }
      setSelectedId(handId)
    } else if (step === 1) {
      if (card.id !== 'fire-borah-trainee-a') {
        shake(handId, card.type === 'spell'
          ? 'Only Avatar cards can be placed in the Spektra Pile!'
          : 'Place Borah Trainee A in the Spektra Pile!')
        return
      }
      setSelectedId(handId)
    } else if (step === 2) {
      if (card.id !== 'flame-flicker') {
        shake(handId, 'Select Flame Flicker to cast it on the opponent!')
        return
      }
      setSelectedId(handId)
    } else if (step === 4) {
      if (card.id !== 'fire-borah-trainee-b') {
        shake(handId, card.type === 'spell'
          ? 'Only Avatar cards can be placed in the Spektra Pile!'
          : 'Select Borah Trainee B to generate Spektra!')
        return
      }
      setSelectedId(handId)
    } else if (step === 5) {
      if (card.id !== 'fire-radja') {
        shake(handId, 'Select Radja to evolve your Kobar Trainee!')
        return
      }
      setSelectedId(handId)
    } else {
      shake(handId, 'That action is not available right now.')
    }
  }, [step, shake])

  const handleActiveZoneClick = useCallback(() => {
    if (step === 0) {
      if (selectedId !== 'hand-fire-kobar-trainee-a') {
        shake('zone-active', 'Select Kobar Trainee A from your hand first!')
        return
      }
      setActiveAvatar({ ...KOBAR_TRAINEE })
      setActiveAvatarDmg(0)
      setPlayerHand(h => h.filter(c => c.id !== 'fire-kobar-trainee-a'))
      setSelectedId(null)
      setStep(1)
      addLog('Kobar Trainee A deployed as Active Avatar.')
      toast.success('Kobar Trainee A deployed!')
      return
    }
    if (step === 5) {
      if (selectedId !== 'hand-fire-radja') {
        if (activeAvatar && turn === 1) {
          shake('zone-active', 'Summoning Sickness! This avatar cannot evolve on its first turn.')
        } else {
          shake('zone-active', 'Select Radja from your hand first!')
        }
        return
      }
      setActiveAvatar({ ...RADJA })
      setPlayerHand(h => h.filter(c => c.id !== 'fire-radja'))
      setSelectedId(null)
      setStep(6)
      addLog('Kobar Trainee A evolved into Radja! Damage counters carry over.')
      toast.success('Evolution! Radja enters the field!')
      return
    }
    shake('zone-active', step === 3
      ? "Pass the turn first — your avatar can't evolve this turn (Summoning Sickness)."
      : step === 6
        ? 'Click the Pyro Punch button below Radja!'
        : 'This is not the right action right now.')
  }, [step, selectedId, shake, activeAvatar, turn])

  const handleSpektraPileClick = useCallback(() => {
    if (step === 1) {
      if (selectedId !== 'hand-fire-borah-trainee-a') {
        shake('zone-spektra', 'Select Borah Trainee A from your hand first!')
        return
      }
      setSpektraPile(p => [...p, { ...BORAH_TRAINEE }])
      setPlayerHand(h => h.filter(c => c.id !== 'fire-borah-trainee-a'))
      setSelectedId(null)
      setStep(2)
      addLog('Borah Trainee A added to Spektra Pile. Fire Spektra generated!')
      toast.success('Fire Spektra generated! 🔥')
      return
    }
    if (step === 4) {
      if (selectedId !== 'hand-fire-borah-trainee-b') {
        shake('zone-spektra', 'Select Borah Trainee B from your hand first!')
        return
      }
      setSpektraPile(p => [...p, { ...BORAH_TRAINEE_B }])
      setPlayerHand(h => h.filter(c => c.id !== 'fire-borah-trainee-b'))
      setSelectedId(null)
      setStep(5)
      addLog('Borah Trainee B added to Spektra Pile. 2 Fire Spektra ready!')
      toast.success('2nd Fire Spektra generated! 🔥🔥')
      return
    }
    if (selectedId === 'hand-flame-flicker') {
      shake('zone-spektra', 'Only Avatar cards can be placed in the Spektra Pile!')
      return
    }
    shake('zone-spektra', 'You can only add 1 Avatar card per turn to the Spektra Pile.')
  }, [step, selectedId, shake])

  const handleOppAvatarClick = useCallback(() => {
    if (oppDefeated) return
    if (step === 2) {
      if (selectedId !== 'hand-flame-flicker') {
        shake('opp-active-zone', 'Select Flame Flicker from your hand first!')
        return
      }
      setOppDmg(2)
      setPlayerHand(h => h.filter(c => c.id !== 'flame-flicker'))
      setSelectedId(null)
      setStep(3)
      addLog('Flame Flicker hits Repo Girl for 2 damage! HP 5 → 3.')
      toast.success('Flame Flicker cast! Repo Girl takes 2 damage.')
      return
    }
    if (step === 6) {
      if (!attackingField) {
        shake('opp-active-zone', 'Click the Pyro Punch button below Radja first!')
        return
      }
      setOppDmg(999)
      setOppDefeated(true)
      setAttackingField(false)
      setOpponentLifeCards(prev => Math.max(0, prev - 1))
      setStep(7)
      addLog('Radja uses Pyro Punch! 5 damage. Repo Girl is defeated!')
      addLog('Opponent loses 1 Life Card — it goes to their hand.')
      addLog('Opponent has no playable reserve avatar. The game has ended!')
      toast.success('Repo Girl defeated! Opponent loses a Life Card!')
      setTimeout(() => setShowVictory(true), 1500)
      return
    }
    shake('opp-active-zone', 'You cannot attack right now.')
  }, [step, selectedId, shake, oppDefeated, attackingField])

  const handleNextTurn = useCallback(() => {
    if (step !== 3) {
      shake('btn-next-turn', 'You cannot end your turn right now.')
      return
    }
    if (oppPhase !== 'idle') return
    animTimers.current.forEach(clearTimeout)
    animTimers.current = []
    const t1 = setTimeout(() => setOppPhase('banner'), 200)
    const t2 = setTimeout(() => {
      setOppPhase('spektra')
      setOppHandCount(3)
      setOppSpektraPileCount(1)
      addLog('Opponent puts an Avatar into Spektra Pile. Fire Spektra generated!')
    }, 1400)
    const t3 = setTimeout(() => {
      setOppPhase('attacking')
      setActiveAvatarDmg(prev => prev + 2)
      addLog('Repo Girl uses Kick! 2 damage to your Avatar.')
    }, 2600)
    const t4 = setTimeout(() => setOppPhase('result'), 3400)
    const t5 = setTimeout(() => setOppPhase('player-banner'), 4200)
    const t6 = setTimeout(() => {
      setOppPhase('idle')
      setTurn(2)
      setPlayerHand(h => [...h, { ...RADJA }])
      setStep(4)
      addLog('Turn 2 begins. Drew Radja from deck.')
      toast.success('Turn 2! Drew Radja from your deck.')
    }, 5200)
    animTimers.current = [t1, t2, t3, t4, t5, t6]
  }, [step, shake, oppPhase])

  const handleSkillButtonClick = useCallback(() => {
    if (step !== 6) {
      shake('btn-pyro-punch', 'This is not the right action right now.')
      return
    }
    if (attackingField) return
    setAttackingField(true)
    addLog('Radja charges Pyro Punch! Click Repo Girl to attack.')
    toast.success('Pyro Punch ready! Now click Repo Girl.')
  }, [step, shake, attackingField])

  useEffect(() => () => animTimers.current.forEach(clearTimeout), [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSelectedId(null); setAttackingField(false) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const activeAvatarCurrentHp = (activeAvatar?.health ?? 0) - activeAvatarDmg
  const oppCurrentHp = Math.max(0, REPO_GIRL.health - oppDmg)
  const isPlayerTurnBanner = oppPhase === 'player-banner'

  return (
    <div className="w-full">
      <style>{`
        @keyframes tut-shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-6px)}30%{transform:translateX(6px)}45%{transform:translateX(-5px)}60%{transform:translateX(5px)}75%{transform:translateX(-3px)}90%{transform:translateX(3px)}}
        .animate-shake{animation:tut-shake 0.5s ease-in-out;}
      `}</style>

      {/* Victory overlay */}
      {showVictory && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 pointer-events-auto">
          <div
            className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-2 border-orange-500 p-8 max-w-sm w-full mx-4 text-center"
            style={{ boxShadow: '0 0 60px rgba(249,115,22,0.5)' }}
          >
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-3xl font-bold text-orange-400 mb-2">You Win!</h1>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Repo Girl was defeated. You&apos;ve mastered Setup, Spektra, Spells,
              Summoning Sickness, Evolution, and Battle!
            </p>
            <button
              onClick={() => router.push('/tutorial')}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-lg transition-all border border-orange-400"
              style={{ boxShadow: '0 0 20px rgba(249,115,22,0.4)' }}
            >
              Exit
            </button>
          </div>
        </div>
      )}

      <div className="w-full min-h-screen bg-gray-900 text-white relative overflow-x-hidden pb-6">

        {/* Opponent-turn overlay */}
        {oppPhase !== 'idle' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 pointer-events-none">
            <div
              className={`border-2 rounded-xl px-10 py-6 text-center transition-all duration-300
                ${isPlayerTurnBanner ? 'border-blue-500 bg-gray-900' : 'border-red-500 bg-gray-900'}`}
              style={{ boxShadow: isPlayerTurnBanner ? '0 0 40px rgba(59,130,246,0.5)' : '0 0 40px rgba(239,68,68,0.5)' }}
            >
              {isPlayerTurnBanner ? (
                <>
                  <div className="text-2xl font-bold text-blue-400 mb-1">Your Turn — Turn 2</div>
                  <div className="text-sm text-gray-300">Drew Radja from deck</div>
                </>
              ) : oppPhase === 'result' ? (
                <>
                  <div className="text-2xl font-bold text-red-400 mb-1">2 Damage!</div>
                  <div className="text-sm text-gray-300">Your Avatar takes 2 damage from Kick!</div>
                </>
              ) : oppPhase === 'spektra' ? (
                <>
                  <div className="text-2xl font-bold text-red-400 mb-1">Opponent&apos;s Turn</div>
                  <div className="text-sm text-orange-300 animate-pulse">Placing Avatar into Spektra Pile… 🔥</div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-red-400 mb-1">Opponent&apos;s Turn</div>
                  {oppPhase === 'attacking' && (
                    <div className="text-sm text-gray-300 animate-pulse">Repo Girl uses Kick!</div>
                  )}
                </>
              )}
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
            <span className="bg-orange-600 px-2 py-0.5 rounded text-xs">{stepDef.phase}</span>
            <span className="bg-gray-700 px-2 py-0.5 rounded text-xs text-orange-300">
              Step {step + 1}/{STEPS.length} — {stepDef.title}
            </span>
          </div>
          <div className="flex gap-1 items-center">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < step ? 'bg-orange-500' : i === step ? 'bg-orange-300 ring-1 ring-orange-200' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => router.push('/tutorial')}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            ✕ Exit
          </button>
        </div>

        {/* Instruction banner */}
        <div className="mx-2 mb-2 px-3 py-2 bg-gray-800 border border-orange-500/50 rounded-lg">
          <p className="text-xs text-orange-200 leading-relaxed">{stepDef.instruction}</p>
        </div>

        {/* Selected card hint */}
        {(selectedId || attackingField) && (
          <div className="mx-2 mb-2 px-3 py-1.5 bg-orange-950/60 rounded-lg border border-orange-500/50 text-xs text-orange-300 animate-pulse flex justify-between items-center">
            <span>{attackingField ? 'Pyro Punch selected — now click Repo Girl!' : 'Card selected — now click the highlighted target zone.'}</span>
            <button onClick={() => { setSelectedId(null); setAttackingField(false) }} className="underline text-gray-400 ml-2 shrink-0">
              Cancel (Esc)
            </button>
          </div>
        )}

        <div className="px-2 space-y-2">

          {/* ── OPPONENT ── */}
          <div>
            <h3 className="text-xs font-bold mb-1 text-orange-400 tracking-widest uppercase">Opponent</h3>

            {/* Opponent hand */}
            <div className="bg-gray-800 bg-opacity-30 p-2 rounded-lg mb-2 flex justify-center">
              <div className="flex relative">
                {Array.from({ length: oppHandCount }).map((_, i) => (
                  <img
                    key={i}
                    src="/cards/card_back.png"
                    alt="Card Back"
                    className="rounded-md shadow-md object-cover"
                    style={{ width: '38px', height: '53px', marginLeft: i > 0 ? '-14px' : '0', transform: 'rotate(180deg)', zIndex: i, position: 'relative' }}
                  />
                ))}
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
                  <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">35</div>
                </div>
                <div className="text-[10px] text-red-400 font-semibold">Life ({opponentLifeCards}):</div>
                <div className="flex gap-0.5 mb-1">
                  {Array.from({ length: opponentLifeCards }).map((_, i) => (
                    <img key={i} src="/cards/card_back.png" alt="Life Card"
                      className="object-cover rounded border border-red-600/70"
                      style={{ width: '14px', height: '19px', transform: 'rotate(180deg)' }}
                    />
                  ))}
                </div>
                <div className="text-[10px] font-semibold text-red-400">Spektra: {oppSpektraPileCount}</div>
              </div>

              {/* Opponent spektra pile */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-gray-700 bg-opacity-50 rounded p-2 text-center min-w-[80px]">
                  <div className="text-[10px] font-bold text-gray-300">Spektra Pile:</div>
                  {oppSpektraPileCount > 0 ? (
                    <div className="flex items-center justify-center gap-0.5 mt-0.5">
                      {Array.from({ length: oppSpektraPileCount }).map((_, i) => (
                        <span key={i} className="text-orange-400 text-[12px]">🔥</span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-400">Empty</div>
                  )}
                </div>
              </div>

              {/* Opponent active avatar */}
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: isSpotlit('opp-active-zone') ? '#fb923c' : '#6b7280' }}
                >
                  Active Avatar
                </span>
                {!oppDefeated ? (
                  <div
                    id="opp-active-zone"
                    onClick={handleOppAvatarClick}
                    style={{ position: 'relative', zIndex: isSpotlit('opp-active-zone') ? 30 : 'auto', cursor: 'pointer' }}
                    className={`
                      transition-all duration-200
                      ${isSpotlit('opp-active-zone') ? 'ring-2 ring-orange-400 rounded-lg shadow-lg shadow-orange-500/60' : ''}
                      ${isDimmed('opp-active-zone') ? 'pointer-events-none' : ''}
                      ${shakingId === 'opp-active-zone' ? 'animate-shake' : ''}
                      ${oppPhase === 'attacking' ? 'ring-4 ring-red-500 shadow-red-500/80 animate-pulse' : ''}
                    `}
                  >
                    <Card2D
                      card={REPO_GIRL}
                      isPlayable={isSpotlit('opp-active-zone') || step === 6}
                      isInHand={false}
                      counters={{ damage: oppDmg }}
                      scale={0.85}
                    />
                    <HpBar current={oppCurrentHp} max={REPO_GIRL.health} />
                    <div className="text-center text-[9px] text-yellow-300 font-bold mt-0.5">
                      HP {oppCurrentHp}/{REPO_GIRL.health}
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-red-800 rounded-lg flex items-center justify-center" style={{ height: '90px', width: '65px' }}>
                    <span className="text-[10px] text-red-400 text-center">Defeated</span>
                  </div>
                )}
              </div>

              {/* Opponent reserves */}
              <div className="flex flex-col gap-1">
                <div className="text-[10px] text-gray-500">Reserves 0/2</div>
                <div className="border border-dashed border-gray-700 rounded w-12 h-16 flex items-center justify-center opacity-30">
                  <span className="text-[9px] text-gray-500">Rsv</span>
                </div>
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
              <div className="border-2 border-dashed border-gray-600 rounded p-2 text-center min-w-[80px]">
                <span className="text-[10px] text-gray-400">Empty</span>
              </div>
              <button
                id="btn-next-turn"
                onClick={handleNextTurn}
                style={{ position: 'relative', zIndex: isSpotlit('btn-next-turn') ? 30 : 'auto' }}
                className={`
                  px-3 py-1.5 rounded-lg font-bold text-xs transition-all duration-200 border-2
                  ${isSpotlit('btn-next-turn')
                    ? 'bg-orange-600 border-orange-400 text-white ring-4 ring-orange-400 shadow-lg shadow-orange-500/60 hover:bg-orange-500'
                    : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}
                  ${isDimmed('btn-next-turn') ? 'opacity-30 pointer-events-none' : ''}
                  ${shakingId === 'btn-next-turn' ? 'animate-shake' : ''}
                `}
              >
                Next Turn →
              </button>
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
                  <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {turn === 1 ? 36 : 35}
                  </div>
                </div>
                <div className="text-[10px] text-blue-400 font-semibold">Life ({playerLifeCards}):</div>
                <div className="flex gap-0.5 mb-1">
                  {Array.from({ length: playerLifeCards }).map((_, i) => (
                    <img key={i} src="/cards/card_back.png" alt="Life Card"
                      className="object-cover rounded border border-blue-600/70"
                      style={{ width: '14px', height: '19px' }}
                    />
                  ))}
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 mb-1">Spektra Pile:</div>
                  {spektraPile.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {spektraPile.map((card, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full border border-amber-500 flex items-center justify-center"
                          title={`${card.name} (${card.element})`}
                        >
                          <div className={`w-3 h-3 rounded-full ${elementDotClass(card.element)}`} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-500">Empty</span>
                  )}
                </div>
              </div>

              {/* Spektra drop zone */}
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: isSpotlit('zone-spektra') ? '#fb923c' : '#6b7280' }}
                >
                  Spektra Pile
                </span>
                <div
                  id="zone-spektra"
                  style={{ position: 'relative', zIndex: isSpotlit('zone-spektra') ? 30 : 'auto' }}
                  onClick={handleSpektraPileClick}
                  className={`
                    w-16 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center
                    cursor-pointer transition-all duration-200
                    ${isSpotlit('zone-spektra') ? 'border-orange-400 bg-orange-950/40 ring-2 ring-orange-400 shadow-lg shadow-orange-500/50' : 'border-gray-600 hover:border-gray-500'}
                    ${isDimmed('zone-spektra') ? 'opacity-30 pointer-events-none' : ''}
                    ${shakingId === 'zone-spektra' ? 'animate-shake' : ''}
                  `}
                >
                  {spektraPile.length > 0 ? (
                    <div className={`w-6 h-6 rounded-full ${elementDotClass(spektraPile[0].element)} border-2 border-amber-400`} />
                  ) : (
                    <span className="text-[9px] text-gray-500 text-center leading-tight px-1">Drop Avatar here</span>
                  )}
                  {spektraPile.length > 0 && (
                    <span className="text-[9px] text-orange-300 mt-1 font-bold">{spektraPile.length} Fire</span>
                  )}
                </div>
              </div>

              {/* Player active avatar */}
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: isSpotlit('zone-active') ? '#fb923c' : '#6b7280' }}
                >
                  Active Avatar
                </span>
                {activeAvatar ? (
                  <div
                    id="zone-active"
                    onClick={handleActiveZoneClick}
                    style={{ position: 'relative', zIndex: (isSpotlit('zone-active') || attackingField) ? 30 : 'auto', cursor: 'pointer' }}
                    className={`
                      transition-all duration-200
                      ${isSpotlit('zone-active') ? 'ring-2 ring-orange-400 rounded-lg shadow-lg shadow-orange-500/60' : ''}
                      ${attackingField ? 'ring-4 ring-white rounded-lg shadow-xl shadow-white/40 scale-105' : ''}
                      ${isDimmed('zone-active') ? 'pointer-events-none' : ''}
                      ${shakingId === 'zone-active' ? 'animate-shake' : ''}
                    `}
                  >
                    <Card2D
                      card={activeAvatar}
                      isPlayable={isSpotlit('zone-active') || attackingField}
                      isInHand={false}
                      counters={{ damage: activeAvatarDmg }}
                      scale={0.85}
                    />
                    <HpBar current={activeAvatarCurrentHp} max={activeAvatar.health} />
                    <div className="text-center text-[9px] text-yellow-300 font-bold mt-0.5">
                      HP {activeAvatarCurrentHp}/{activeAvatar.health}
                    </div>
                    {turn === 1 && step <= 3 && activeAvatar.level === 1 && (
                      <div className="text-center text-[9px] text-yellow-500 mt-0.5">⚠ Summoning Sickness</div>
                    )}
                  </div>
                ) : (
                  <div
                    id="zone-active"
                    style={{ position: 'relative', zIndex: isSpotlit('zone-active') ? 30 : 'auto', height: '91px' }}
                    onClick={handleActiveZoneClick}
                    className={`
                      w-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200
                      ${isSpotlit('zone-active') ? 'border-orange-400 bg-orange-950/30 ring-2 ring-orange-400 shadow-lg shadow-orange-500/50' : 'border-gray-600 hover:border-gray-500'}
                      ${isDimmed('zone-active') ? 'opacity-30 pointer-events-none' : ''}
                      ${shakingId === 'zone-active' ? 'animate-shake' : ''}
                    `}
                  >
                    <span className="text-[9px] text-gray-500 text-center px-1 leading-tight">Deploy Avatar here</span>
                  </div>
                )}
                {step === 6 && activeAvatar && (
                  <button
                    id="btn-pyro-punch"
                    onClick={handleSkillButtonClick}
                    style={{ position: 'relative', zIndex: isSpotlit('btn-pyro-punch') ? 30 : 'auto' }}
                    className={`
                      text-[9px] px-2 py-0.5 rounded font-bold w-full
                      ${isSpotlit('btn-pyro-punch') && !attackingField
                        ? 'bg-red-600 hover:bg-red-500 text-white ring-2 ring-orange-400 cursor-pointer'
                        : attackingField
                          ? 'bg-red-900/60 text-gray-500 cursor-default'
                          : 'bg-red-900/60 text-gray-300 cursor-pointer'}
                    `}
                    disabled={attackingField}
                  >
                    {attackingField ? '⚡ Pyro Punch ready…' : 'Pyro Punch [2]'}
                  </button>
                )}
              </div>

              {/* Player reserves */}
              <div className="flex flex-col gap-1">
                <div className="text-[10px] text-gray-500">Reserves 0/2</div>
                <div className="border border-dashed border-gray-700 rounded w-12 h-16 flex items-center justify-center opacity-30">
                  <span className="text-[9px] text-gray-500">Rsv</span>
                </div>
                <div className="border border-dashed border-gray-700 rounded w-12 h-16 flex items-center justify-center opacity-30">
                  <span className="text-[9px] text-gray-500">Rsv</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── PLAYER HAND ── */}
          <div>
            <h3 className="text-xs font-bold mb-1 text-orange-400 tracking-widest uppercase">
              Your Hand ({playerHand.length} cards)
            </h3>
            <div
              className="bg-gray-800 bg-opacity-50 p-2 rounded-lg border border-orange-500 border-opacity-30 flex gap-2 flex-wrap"
              style={{ boxShadow: '0 0 15px rgba(249,115,22,0.1)', minHeight: '110px' }}
            >
              {playerHand.map(card => {
                const hid = `hand-${card.id}`
                return (
                  <div
                    key={card.id}
                    id={hid}
                    style={{ position: 'relative', zIndex: isSpotlit(hid) ? 30 : 'auto' }}
                    className={`
                      transition-all duration-200 rounded-lg
                      ${isSpotlit(hid) ? 'ring-2 ring-orange-400 shadow-lg shadow-orange-500/70' : ''}
                      ${selectedId === hid ? 'ring-4 ring-white shadow-xl shadow-white/40 scale-110' : ''}
                      ${isDimmed(hid) ? 'pointer-events-none' : ''}
                      ${shakingId === hid ? 'animate-shake' : ''}
                    `}
                  >
                    <Card2D
                      card={card}
                      isPlayable={isSpotlit(hid) || selectedId === hid}
                      isInHand={false}
                      scale={0.85}
                      onClick={() => handleHandCardClick(card)}
                    />
                  </div>
                )
              })}
              {playerHand.length === 0 && (
                <span className="text-xs text-gray-500 italic self-center">Hand is empty</span>
              )}
            </div>
          </div>

          {/* ── BATTLE LOG ── */}
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-2">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Battle Log</div>
            {battleLog.map((entry, i) => (
              <div
                key={i}
                className={`text-[10px] leading-relaxed ${i === battleLog.length - 1 ? 'text-orange-300' : 'text-gray-600'}`}
              >
                › {entry}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
