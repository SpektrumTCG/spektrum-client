"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Clock,
  Trophy,
  Gamepad2,
  Crown,
  Check,
  Layers,
  Eye,
  EyeOff,
  LogOut,
  Hourglass,
  Swords,
  Hash,
  Copy,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { ResponsiveGameLayout } from '@/components/ui/ResponsiveGameLayout';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Card3D } from '@/components/ui/Card3D';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { FadeInView } from '@/components/ui/FadeInView';
import { BackButton } from '@/components/shared/BackButton';
import { useMultiplayerStore, type Player } from '@/stores/useMultiplayerStore';
import { useAudio } from '@/stores/useAudioStore';
import { useDeckStore } from '@/stores/useDeckStore';
import { useGameMode } from '@/features/game/stores/useGameMode';
import { useWalletStore } from '@/stores/useWalletStore';
import { SolanaWalletConnect } from '@/components/shared/SolanaWalletConnect';
import { AnteModeManager } from '@/components/shared/ante/AnteModeManager';

export function MultiplayerFeature() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<'casual' | 'ranked' | null>(null);
  const [roomName, setRoomName] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [showAnteMode, setShowAnteMode] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const { playButton, playSuccess } = useAudio();
  const { decks, activeDeckId, ownedCards } = useDeckStore();
  const gameModePlayerName = useGameMode((s) => s.playerName);
  const walletProfileName = useWalletStore((s) => s.playerProfile?.displayName ?? null);

  const {
    socket,
    isConnected,
    connectionStatus,
    currentRoom,
    availableRooms,
    isSearchingForMatch,
    searchStartTime,
    currentPlayer,
    connect,
    disconnect,
    joinRoom,
    createRoom,
    leaveRoom,
    startMatchmaking,
    stopMatchmaking,
    setPlayerReady,
    setPendingDeck,
    setIsMultiplayerSession
  } = useMultiplayerStore();

  const [searchDuration, setSearchDuration] = useState(0);

  useEffect(() => {
    if (!isConnected && connectionStatus === 'disconnected') {
      connect().catch(() => {
        toast.error('Failed to connect to multiplayer server');
      });
    }

    return () => {
      if (isSearchingForMatch) stopMatchmaking();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleGameStarting = (room: any) => {
      toast.success('Game starting!');

      setIsMultiplayerSession(true);

      let deckIdToUse = selectedDeckId || activeDeckId;

      if (!deckIdToUse && decks.length > 0) {
        const validDeck = decks.find(d => d.cards && d.cards.length >= 40) || decks[0];
        if (validDeck) deckIdToUse = validDeck.id;
      }

      if (!deckIdToUse) {
        toast.error('Error: Please create a deck before playing');
        router.push('/cards');
        return;
      }

      const { setActiveDeck } = useDeckStore.getState();
      if (setActiveDeck && deckIdToUse !== activeDeckId) setActiveDeck(deckIdToUse);

      const selectedDeck = decks.find(d => d.id === deckIdToUse);
      if (selectedDeck && selectedDeck.cards && selectedDeck.cards.length >= 40) {
        setPendingDeck(selectedDeck.cards);
      }

      requestAnimationFrame(() => {
        router.push('/game');
      });
    };

    socket.on('game_starting', handleGameStarting);
    return () => { socket.off('game_starting', handleGameStarting); };
  }, [socket, router, currentPlayer, decks, activeDeckId, selectedDeckId, setPendingDeck, setIsMultiplayerSession]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isSearchingForMatch && searchStartTime) {
      interval = setInterval(() => {
        setSearchDuration(Math.floor((Date.now() - searchStartTime) / 1000));
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isSearchingForMatch, searchStartTime]);

  useEffect(() => {
    if (currentRoom && activeDeckId && !selectedDeckId) {
      setSelectedDeckId(activeDeckId);
    }
  }, [currentRoom, activeDeckId, selectedDeckId]);

  // If the user navigates away from /multiplayer while still parked in a waiting/ready
  // lobby (i.e. the game hasn't actually started), drop the room server-side. Without this,
  // bottom-nav navigation leaves the player attached to the room and the register_player
  // reconnection path will silently re-join them on return.
  useEffect(() => {
    return () => {
      const { currentRoom: roomAtUnmount, isMultiplayerSession, leaveRoom: leaveNow } =
        useMultiplayerStore.getState();
      if (roomAtUnmount && !isMultiplayerSession && roomAtUnmount.status !== 'playing') {
        leaveNow();
      }
    };
  }, []);

  // Push the latest custom name to the server whenever it changes (or on mount once connected).
  // The auto-registration in useMultiplayerStore only runs on the initial socket 'connect' event,
  // so a name typed on /game-mode after the socket already connected wouldn't reach the server otherwise.
  useEffect(() => {
    if (!socket || !isConnected) return;
    const persistentId = typeof window !== 'undefined' ? localStorage.getItem('multiplayer_player_id') : null;
    if (!persistentId) return;
    const resolved =
      walletProfileName?.trim() ||
      (gameModePlayerName?.trim() && gameModePlayerName.trim() !== 'Player' ? gameModePlayerName.trim() : null) ||
      `Player_${persistentId.substr(0, 8)}`;
    if (currentPlayer && currentPlayer.name === resolved) return;
    socket.emit('register_player', {
      playerId: persistentId,
      name: resolved,
      avatar: null,
      walletAddress: useWalletStore.getState().walletAddress,
    });
  }, [socket, isConnected, gameModePlayerName, walletProfileName, currentPlayer]);

  const handleQuickMatch = async (mode: 'casual' | 'ranked') => {
    playButton();
    if (!isConnected) {
      toast.error('Not connected to multiplayer server');
      return;
    }
    try {
      await startMatchmaking(mode);
      setSelectedMode(mode);
      toast.info(`Searching for ${mode} match...`);
    } catch {
      toast.error('Failed to start matchmaking');
    }
  };

  const handleStopSearch = () => {
    playButton();
    stopMatchmaking();
    setSelectedMode(null);
    setSearchDuration(0);
    toast.info('Search cancelled');
  };

  const handleCreateRoom = async () => {
    playButton();
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }
    try {
      await createRoom(roomName, { timeLimit: 1800, allowSpectators: true, deckRestrictions: [] });
      playSuccess();
      toast.success('Room created successfully!');
      setShowCreateRoom(false);
      setRoomName('');
    } catch {
      toast.error('Failed to create room');
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    playButton();
    try {
      await joinRoom(roomId);
      playSuccess();
      toast.success('Joined room successfully!');
    } catch {
      toast.error('Failed to join room');
    }
  };

  const handleAnteMode = () => {
    playButton();
    if (!walletAddress) {
      toast.error('Please connect your wallet first to play Ante Mode');
      return;
    }
    if (!activeDeckId) {
      toast.error('Please select a deck before starting Ante Mode');
      router.push('/cards');
      return;
    }
    setShowAnteMode(true);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (currentRoom) {
    const host = currentRoom.players.find((p) => p.isHost) ?? currentRoom.players[0];
    const guest = currentRoom.players.find((p) => !p.isHost) ?? currentRoom.players[1];
    const meId = currentPlayer?.id;
    const allReady = currentRoom.players.length === currentRoom.maxPlayers && currentRoom.players.every((p) => p.isReady);
    const opponentMissing = currentRoom.players.length < currentRoom.maxPlayers;

    let phaseLabel = 'WAITING FOR OPPONENT';
    let phaseTone = 'text-amber-300 bg-amber-500/10 border-amber-500/30';
    if (currentRoom.status === 'playing') {
      phaseLabel = 'MATCH IN PROGRESS';
      phaseTone = 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
    } else if (allReady) {
      phaseLabel = 'BOTH READY · LAUNCHING';
      phaseTone = 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
    } else if (!opponentMissing) {
      phaseLabel = 'READY CHECK';
      phaseTone = 'text-orange-300 bg-orange-500/10 border-orange-500/40';
    }

    const modeLabel = (currentRoom.gameMode || 'casual').toUpperCase();
    const modeAccent =
      currentRoom.gameMode === 'ranked'
        ? 'from-violet-500/20 to-fuchsia-500/10 text-violet-200 border-violet-400/40'
        : currentRoom.gameMode === 'tournament'
          ? 'from-amber-500/20 to-orange-500/10 text-amber-200 border-amber-400/40'
          : 'from-orange-500/20 to-orange-500/5 text-orange-200 border-orange-400/40';

    const tribeAccent: Record<string, { bar: string; chip: string; glow: string }> = {
      water: { bar: 'from-sky-400 to-cyan-500', chip: 'bg-sky-500/15 text-sky-200 border-sky-400/30', glow: 'shadow-[0_0_24px_-6px_rgba(56,189,248,0.55)]' },
      fire: { bar: 'from-orange-400 to-rose-500', chip: 'bg-orange-500/15 text-orange-200 border-orange-400/30', glow: 'shadow-[0_0_24px_-6px_rgba(251,113,133,0.55)]' },
      earth: { bar: 'from-amber-500 to-emerald-500', chip: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30', glow: 'shadow-[0_0_24px_-6px_rgba(16,185,129,0.55)]' },
      air: { bar: 'from-zinc-200 to-violet-300', chip: 'bg-violet-500/15 text-violet-200 border-violet-400/30', glow: 'shadow-[0_0_24px_-6px_rgba(167,139,250,0.55)]' },
    };
    const tribeOf = (t?: string) => tribeAccent[(t || '').toLowerCase()] ?? { bar: 'from-orange-400 to-amber-500', chip: 'bg-orange-500/15 text-orange-200 border-orange-400/30', glow: 'shadow-[0_0_24px_-6px_rgba(251,146,60,0.5)]' };

    const copyRoomCode = () => {
      try {
        navigator.clipboard?.writeText(currentRoom.id);
        toast.success('Room code copied');
        playButton();
      } catch {
        toast.error('Could not copy');
      }
    };

    const PlayerSlot = ({
      player,
      side,
    }: {
      player?: Player;
      side: 'left' | 'right';
    }) => {
      const ready = !!player?.isReady;
      const empty = !player;
      const isMe = player?.id === meId;
      const ringColor = empty
        ? 'ring-white/10'
        : ready
          ? 'ring-emerald-400/70'
          : 'ring-orange-400/60';
      const align = side === 'left' ? 'items-start text-left' : 'items-end text-right';
      const initial = player?.name?.charAt(0)?.toUpperCase() ?? '?';

      return (
        <div className={`flex flex-col ${align} gap-2 flex-1 min-w-0`}>
          <div className="relative">
            <motion.div
              className={`w-20 h-20 rounded-2xl ring-2 ${ringColor} bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden relative`}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            >
              {empty ? (
                <Hourglass size={26} className="text-white/30 animate-pulse" />
              ) : (
                <>
                  <span className="text-3xl font-black text-white tracking-tight">{initial}</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                </>
              )}
              {ready && !empty && (
                <motion.div
                  className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400/60"
                  animate={{ opacity: [0.3, 0.9, 0.3] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </motion.div>
            {player?.isHost && (
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/40 ring-2 ring-slate-900">
                <Crown size={14} className="text-slate-900" />
              </div>
            )}
          </div>

          <div className={`flex flex-col ${side === 'right' ? 'items-end' : 'items-start'} min-w-0 w-full`}>
            <div className="flex items-center gap-1.5 max-w-full">
              {empty ? (
                <span className="text-base font-semibold text-white/40 italic truncate">Searching…</span>
              ) : (
                <span className={`text-base font-bold tracking-tight truncate ${isMe ? 'text-orange-300' : 'text-white'}`}>
                  {player!.name}
                </span>
              )}
              {isMe && !empty && (
                <span className="text-[9px] font-semibold tracking-[0.15em] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-400/30">
                  YOU
                </span>
              )}
            </div>

            <div className="mt-1.5">
              {empty ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
                  empty slot
                </span>
              ) : ready ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-400/40">
                  <Check size={10} strokeWidth={3} /> Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-md bg-white/5 text-white/60 border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Not ready
                </span>
              )}
            </div>
          </div>
        </div>
      );
    };

    const selectedDeck = decks.find((d) => d.id === selectedDeckId);
    const tribe = tribeOf(selectedDeck?.tribe);

    return (
      <div className="flex flex-col items-center pb-40 overflow-y-auto pt-14 min-h-dvh" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="max-w-md mx-auto px-4 w-full relative">
          <BackButton />

          {/* Phase pill — what's actually happening */}
          <FadeInView>
            <div className="flex justify-center mt-2 mb-3">
              <motion.div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${phaseTone} backdrop-blur-sm`}
                animate={allReady ? { scale: [1, 1.04, 1] } : {}}
                transition={{ duration: 1.2, repeat: allReady ? Infinity : 0 }}
              >
                {allReady ? <Sparkles size={12} /> : <Hourglass size={12} />}
                <span className="text-[10px] font-bold tracking-[0.22em] font-mono">{phaseLabel}</span>
              </motion.div>
            </div>
          </FadeInView>

          {/* Title + room code */}
          <FadeInView delay={0.05}>
            <div className="text-center mb-5">
              <h1 className="text-3xl font-black tracking-tight bg-gradient-to-b from-orange-300 to-orange-500 bg-clip-text text-transparent leading-tight">
                {currentRoom.name}
              </h1>
              <button
                onClick={copyRoomCode}
                className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.18em] text-slate-500 hover:text-slate-700 transition-colors"
              >
                <Hash size={10} />
                {currentRoom.id.slice(0, 8).toUpperCase()}
                <Copy size={10} />
              </button>
            </div>
          </FadeInView>

          {/* VS Hero face-off */}
          <FadeInView delay={0.1}>
            <div className="relative rounded-3xl overflow-hidden mb-4 border-2 border-orange-500/80 bg-gradient-to-b from-slate-900 to-slate-950 shadow-[0_8px_32px_-12px_rgba(15,23,42,0.5)]">
              {/* Diagonal accent split */}
              <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  background:
                    'linear-gradient(115deg, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0.18) 45%, transparent 50%, rgba(56,189,248,0.18) 55%, rgba(56,189,248,0.18) 100%)',
                }}
                aria-hidden
              />
              <div className="absolute top-3 left-3">
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gradient-to-r ${modeAccent} border text-[9px] font-bold tracking-[0.2em] font-mono backdrop-blur-sm`}>
                  <Gamepad2 size={10} />
                  {modeLabel}
                </div>
              </div>
              <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-white/50">
                <Users size={11} />
                {currentRoom.players.length}/{currentRoom.maxPlayers}
              </div>

              <div className="relative px-5 pt-12 pb-5 flex items-center gap-3">
                <PlayerSlot player={host} side="left" />

                {/* VS clash mark */}
                <div className="relative flex flex-col items-center justify-center shrink-0 w-14">
                  <motion.div
                    className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-[0_0_24px_-4px_rgba(249,115,22,0.7)]"
                    initial={{ rotate: -10, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 240, damping: 16, delay: 0.15 }}
                  >
                    <Swords size={20} className="text-slate-900" strokeWidth={2.5} />
                    <div className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
                  </motion.div>
                  <span className="mt-1 text-[9px] font-black tracking-[0.3em] text-white/40 font-mono">VS</span>
                </div>

                <PlayerSlot player={guest} side="right" />
              </div>
            </div>
          </FadeInView>

          {/* Compact info strip */}
          <FadeInView delay={0.2}>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-2.5 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-slate-400 text-[9px] font-mono tracking-[0.18em] uppercase">
                  <Clock size={10} /> Time
                </div>
                <div className="mt-0.5 text-sm font-bold text-white tabular-nums">{formatTime(currentRoom.settings.timeLimit)}</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-2.5 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-slate-400 text-[9px] font-mono tracking-[0.18em] uppercase">
                  {currentRoom.settings.allowSpectators ? <Eye size={10} /> : <EyeOff size={10} />}
                  Spectators
                </div>
                <div className="mt-0.5 text-sm font-bold text-white">
                  {currentRoom.settings.allowSpectators ? 'Open' : 'Closed'}
                </div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-2.5 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-slate-400 text-[9px] font-mono tracking-[0.18em] uppercase">
                  <Trophy size={10} /> Mode
                </div>
                <div className="mt-0.5 text-sm font-bold text-white capitalize">{currentRoom.gameMode}</div>
              </div>
            </div>
          </FadeInView>

          {/* Deck loadout */}
          <FadeInView delay={0.3}>
            <div className="rounded-2xl border-2 border-orange-500/80 bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden shadow-[0_8px_32px_-12px_rgba(15,23,42,0.5)]">
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-orange-400" />
                  <h2 className="text-xs font-bold tracking-[0.18em] uppercase text-white/80">Battle Deck</h2>
                </div>
                {selectedDeck && (
                  <span className={`text-[9px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded border ${tribe.chip} font-mono`}>
                    {selectedDeck.tribe || 'Mixed'}
                  </span>
                )}
              </div>

              {decks.length === 0 ? (
                <div className="px-4 pb-4 pt-2 text-center">
                  <p className="text-white/50 text-sm mb-3">No decks yet — build one to enter battle.</p>
                  <AnimatedButton onClick={() => router.push('/cards')} variant="primary" size="sm">
                    Build a Deck
                  </AnimatedButton>
                </div>
              ) : (
                <div className="px-3 pb-3 space-y-1.5">
                  {decks.map((deck) => {
                    const active = selectedDeckId === deck.id;
                    const t = tribeOf(deck.tribe);
                    return (
                      <motion.button
                        key={deck.id}
                        onClick={() => { setSelectedDeckId(deck.id); playButton(); }}
                        whileTap={{ scale: 0.985 }}
                        className={`w-full text-left flex items-stretch rounded-xl overflow-hidden border transition-all ${
                          active
                            ? `bg-white/[0.06] border-orange-400/50 ${t.glow}`
                            : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className={`w-1.5 bg-gradient-to-b ${t.bar} ${active ? 'opacity-100' : 'opacity-60'}`} />
                        <div className="flex-1 flex items-center justify-between gap-3 px-3 py-2.5">
                          <div className="min-w-0">
                            <div className="font-bold text-white text-sm truncate">{deck.name}</div>
                            <div className="text-[11px] text-white/50 font-mono tracking-wide mt-0.5">
                              {deck.cards.length} cards
                              {deck.tribe && <span className="opacity-60"> · {deck.tribe}</span>}
                            </div>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              active
                                ? 'bg-orange-500 text-slate-900 ring-2 ring-orange-300/40'
                                : 'bg-white/5 text-white/30 ring-1 ring-white/10'
                            }`}
                          >
                            {active && <Check size={14} strokeWidth={3} />}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </FadeInView>

          {!selectedDeckId && decks.length > 0 && (
            <FadeInView delay={0.4}>
              <p className="text-center text-amber-400/90 text-xs mt-3 font-medium">
                Select a deck before readying up.
              </p>
            </FadeInView>
          )}
        </div>

        {/* Sticky CTA dock — anchored above the bottom nav */}
        <div className="fixed inset-x-0 bottom-[72px] z-30 pointer-events-none">
          <div className="max-w-md mx-auto px-4 pointer-events-auto">
            <div className="relative rounded-2xl border border-white/10 bg-slate-950/85 backdrop-blur-xl p-3 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { leaveRoom(); setSelectedDeckId(null); }}
                  className="shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-white/60 bg-white/5 hover:bg-rose-500/15 hover:text-rose-300 border border-white/10 hover:border-rose-400/40 transition-all"
                  aria-label="Leave room"
                >
                  <LogOut size={18} />
                </button>

                <motion.button
                  onClick={() => { setPlayerReady(!currentPlayer?.isReady); playButton(); }}
                  disabled={!selectedDeckId}
                  whileTap={!selectedDeckId ? undefined : { scale: 0.98 }}
                  className={`relative flex-1 h-12 rounded-xl font-black tracking-[0.18em] text-sm uppercase overflow-hidden transition-all ${
                    !selectedDeckId
                      ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                      : currentPlayer?.isReady
                        ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-emerald-950 shadow-[0_0_24px_-4px_rgba(16,185,129,0.7)] border border-emerald-300/50'
                        : 'bg-gradient-to-br from-orange-400 to-amber-600 text-slate-950 shadow-[0_0_24px_-4px_rgba(249,115,22,0.7)] border border-orange-300/50'
                  }`}
                >
                  {/* Shine sweep */}
                  {selectedDeckId && (
                    <motion.span
                      className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                      initial={{ x: '-50%' }}
                      animate={{ x: '450%' }}
                      transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
                    />
                  )}
                  <span className="relative inline-flex items-center justify-center gap-2">
                    {currentPlayer?.isReady ? (
                      <>
                        <Check size={16} strokeWidth={3} />
                        Locked In
                      </>
                    ) : (
                      <>
                        <Swords size={16} strokeWidth={2.5} />
                        Ready Up
                      </>
                    )}
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto pt-14" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
      <div className="max-w-md mx-auto p-4 w-full">
        <BackButton />
        <FadeInView>
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-orange-400 mb-1">Multiplayer</h1>
            <p className="text-gray-400 text-sm">Challenge players worldwide</p>
          </div>
        </FadeInView>

        {connectionStatus !== 'connected' && (
          <FadeInView delay={0.1}>
            <div className="mb-4 p-3 bg-gray-800 border-2 border-orange-500 rounded-lg text-center text-sm">
              {connectionStatus === 'connecting' && (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-white">Connecting to multiplayer server...</span>
                </div>
              )}
              {connectionStatus === 'error' && (
                <div className="text-red-400">Failed to connect to multiplayer server</div>
              )}
            </div>
          </FadeInView>
        )}

        {!isSearchingForMatch && isConnected && (
          <FadeInView delay={0.2}>
            <div className="grid grid-cols-1 gap-3 mb-4">
              <div
                onClick={() => handleQuickMatch('casual')}
                className="p-4 bg-gray-800 border-2 border-orange-500 rounded-xl cursor-pointer hover:border-orange-400 transition-all text-center"
              >
                <Gamepad2 className="mx-auto mb-2 text-orange-400" size={32} />
                <h2 className="text-base font-bold text-white mb-1">Casual Match</h2>
                <p className="text-gray-400 text-xs">Relaxed game, no pressure</p>
              </div>

              <div
                onClick={() => handleQuickMatch('ranked')}
                className="p-4 bg-gray-800 border-2 border-orange-500 rounded-xl cursor-pointer hover:border-orange-400 transition-all text-center"
              >
                <Trophy className="mx-auto mb-2 text-orange-400" size={32} />
                <h2 className="text-base font-bold text-white mb-1">Ranked Match</h2>
                <p className="text-gray-400 text-xs">Compete for ranking points</p>
              </div>

              <div
                onClick={handleAnteMode}
                className="p-4 bg-gray-800 border-2 border-red-500 rounded-xl cursor-pointer hover:border-red-400 transition-all text-center"
              >
                <div className="text-2xl mb-2 text-red-400 font-bold">!</div>
                <h2 className="text-base font-bold text-white mb-1">Ante Mode</h2>
                <p className="text-red-300 text-xs font-medium">Wager NFT cards</p>
              </div>
            </div>
          </FadeInView>
        )}

        <AnimatePresence>
          {isSearchingForMatch && (
            <motion.div
              className="mb-4 p-4 bg-gray-800 border-2 border-orange-500 rounded-lg text-center text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-center space-x-2 mb-4">
                <LoadingSpinner type="dots" />
                <span className="text-white text-lg">Searching for {selectedMode} match...</span>
              </div>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Clock size={16} className="text-gray-400" />
                <AnimatedCounter value={searchDuration} suffix="s" className="text-gray-400" />
              </div>
              <AnimatedButton onClick={handleStopSearch} variant="secondary" size="lg">
                Cancel Search
              </AnimatedButton>
            </motion.div>
          )}
        </AnimatePresence>

        {isConnected && (
          <FadeInView delay={0.4}>
            <div className="p-4 bg-gray-800 border-2 border-orange-500 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-orange-400">Custom Rooms</h2>
                <button
                  onClick={() => setShowCreateRoom(true)}
                  className="bg-gradient-to-r from-spektrum-orange to-orange-500 text-white hover:from-orange-600 hover:to-orange-700 px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  <Plus size={14} className="inline mr-1" />
                  Create
                </button>
              </div>

              <AnimatePresence>
                {showCreateRoom && (
                  <motion.div
                    className="mb-3 p-3 bg-gray-700 rounded border-2 border-orange-500"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Room Name"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 text-sm"
                        maxLength={50}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCreateRoom}
                          className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-2 rounded-lg text-sm font-semibold hover:from-orange-500 hover:to-orange-600"
                        >
                          Create
                        </button>
                        <button
                          onClick={() => { setShowCreateRoom(false); setRoomName(''); }}
                          className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableRooms.length === 0 ? (
                  <div className="text-center py-4 text-gray-400 text-xs">No rooms available</div>
                ) : (
                  availableRooms.slice(0, 4).map((room) => (
                    <motion.div
                      key={room.id}
                      className="flex items-center justify-between p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors text-xs"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{room.name}</h3>
                        <p className="text-gray-400 text-xs truncate">{room.players.length}/{room.maxPlayers}</p>
                      </div>
                      <button
                        onClick={() => handleJoinRoom(room.id)}
                        disabled={room.players.length >= room.maxPlayers}
                        className="ml-2 bg-gradient-to-r from-spektrum-orange to-orange-500 text-white hover:from-orange-600 hover:to-orange-700 disabled:bg-gray-600 disabled:text-gray-400 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
                      >
                        {room.players.length >= room.maxPlayers ? 'Full' : 'Join'}
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </FadeInView>
        )}

        <div className="mt-4">
          <SolanaWalletConnect onConnected={(address) => setWalletAddress(address)} />
        </div>

        {showAnteMode && walletAddress && (
          <AnteModeManager
            userCards={ownedCards}
            playerId={currentPlayer?.name || 'Player'}
            walletAddress={walletAddress}
            onClose={() => setShowAnteMode(false)}
          />
        )}
      </div>
    </div>
  );
}
