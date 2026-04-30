"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Clock, Trophy, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';

import { ResponsiveGameLayout } from '@/components/ui/ResponsiveGameLayout';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Card3D } from '@/components/ui/Card3D';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { FadeInView } from '@/components/ui/FadeInView';
import { BackButton } from '@/components/shared/BackButton';
import { useMultiplayerStore } from '@/stores/useMultiplayerStore';
import { useAudio } from '@/stores/useAudioStore';
import { useDeckStore } from '@/stores/useDeckStore';
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
    return (
      <div className="flex flex-col items-center pb-24 overflow-y-auto" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
        <div className="max-w-md mx-auto p-4 w-full">
          <BackButton />
          <FadeInView>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-orange-400 mb-1">{currentRoom.name}</h1>
              <p className="text-gray-400 text-sm">{currentRoom.players.length}/{currentRoom.maxPlayers} players</p>
            </div>
          </FadeInView>

          <div className="grid grid-cols-1 gap-4">
            <FadeInView delay={0.2}>
              <Card3D className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Users className="mr-2" size={20} />
                  Players
                </h2>
                <div className="space-y-3">
                  {currentRoom.players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-spektrum-orange rounded-full flex items-center justify-center text-spektrum-dark font-bold">
                          {player.name.charAt(0)}
                        </div>
                        <span className="text-white">{player.name}</span>
                        {player.isHost && (
                          <span className="text-xs bg-spektrum-orange text-spektrum-dark px-2 py-1 rounded">HOST</span>
                        )}
                      </div>
                      <div className={`w-3 h-3 rounded-full ${player.isReady ? 'bg-green-500' : 'bg-gray-500'}`} />
                    </motion.div>
                  ))}
                </div>
              </Card3D>
            </FadeInView>

            <FadeInView delay={0.4}>
              <Card3D className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time Limit:</span>
                    <span className="text-white">{formatTime(currentRoom.settings.timeLimit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Spectators:</span>
                    <span className="text-white">{currentRoom.settings.allowSpectators ? 'Allowed' : 'Not Allowed'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`capitalize ${
                      currentRoom.status === 'waiting' ? 'text-yellow-400' :
                      currentRoom.status === 'ready' ? 'text-blue-400' :
                      currentRoom.status === 'playing' ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {currentRoom.status}
                    </span>
                  </div>
                </div>
              </Card3D>
            </FadeInView>
          </div>

          <FadeInView delay={0.6}>
            <Card3D className="p-6 mt-6">
              <h2 className="text-xl font-bold text-white mb-4">Select Your Deck</h2>
              {decks.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-400 mb-3">You don't have any decks yet!</p>
                  <AnimatedButton onClick={() => router.push('/cards')} variant="primary" size="sm">
                    Create a Deck
                  </AnimatedButton>
                </div>
              ) : (
                <div className="space-y-3">
                  {decks.map((deck) => (
                    <motion.div
                      key={deck.id}
                      className={`p-3 rounded cursor-pointer transition-all ${
                        selectedDeckId === deck.id
                          ? 'bg-spektrum-orange text-spektrum-dark'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                      onClick={() => { setSelectedDeckId(deck.id); playButton(); }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold">{deck.name}</h3>
                          <p className={`text-sm ${selectedDeckId === deck.id ? 'text-spektrum-dark opacity-80' : 'text-gray-400'}`}>
                            {deck.cards.length} cards{deck.tribe && ` • ${deck.tribe}`}
                          </p>
                        </div>
                        {selectedDeckId === deck.id && (
                          <div className="w-6 h-6 bg-spektrum-dark rounded-full flex items-center justify-center">
                            <span className="text-spektrum-orange text-xs">&#10003;</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card3D>
          </FadeInView>

          <FadeInView delay={0.8}>
            <div className="flex justify-center space-x-4 mt-8">
              <AnimatedButton
                onClick={() => setPlayerReady(!currentPlayer?.isReady)}
                variant={currentPlayer?.isReady ? "success" : "primary"}
                size="lg"
                disabled={!selectedDeckId}
              >
                {currentPlayer?.isReady ? 'Ready!' : 'Ready Up'}
              </AnimatedButton>
              <AnimatedButton
                onClick={() => { leaveRoom(); setSelectedDeckId(null); router.push('/'); }}
                variant="danger"
                size="lg"
              >
                Leave Room
              </AnimatedButton>
            </div>
            {!selectedDeckId && decks.length > 0 && (
              <p className="text-center text-yellow-400 text-sm mt-3">
                Please select a deck before readying up
              </p>
            )}
          </FadeInView>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
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
