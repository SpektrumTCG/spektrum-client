import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  isReady: boolean;
  isHost: boolean;
  deck?: any[];
}

export interface GameRoom {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
  gameMode: 'casual' | 'ranked' | 'tournament';
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  settings: {
    timeLimit: number;
    deckRestrictions: string[];
    allowSpectators: boolean;
  };
}

export interface GameAction {
  type: string;
  playerId: string;
  data: any;
  timestamp: number;
}

interface MultiplayerState {
  // Connection
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';

  // Player
  currentPlayer: Player | null;

  // Room
  currentRoom: GameRoom | null;
  availableRooms: GameRoom[];

  // Game State
  gameState: any;
  gameActions: GameAction[];

  // UI State
  isSearchingForMatch: boolean;
  searchStartTime: number | null;

  // Multiplayer session flag - set when game_starting fires, prevents fallback to AI
  isMultiplayerSession: boolean;

  // Pending deck to submit after navigation to game page
  pendingDeck: any[] | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  joinRoom: (roomId: string) => Promise<void>;
  createRoom: (roomName: string, settings: Partial<GameRoom['settings']>) => Promise<void>;
  leaveRoom: () => void;
  setPlayerReady: (ready: boolean) => void;
  sendGameAction: (action: Omit<GameAction, 'playerId' | 'timestamp'>) => void;
  startMatchmaking: (gameMode: 'casual' | 'ranked') => void;
  stopMatchmaking: () => void;

  // Internal
  updateGameState: (newState: any) => void;
  addGameAction: (action: GameAction) => void;
  setCurrentRoom: (room: GameRoom | null) => void;
  setAvailableRooms: (rooms: GameRoom[]) => void;
  setPendingDeck: (deck: any[] | null) => void;
  setIsMultiplayerSession: (isSession: boolean) => void;
}

// Dynamic socket URL based on current host
const getSocketURL = () => {
  if (typeof window === 'undefined') return 'ws://localhost:5000';

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;

  return `${protocol}//${host}`;
};

export const useMultiplayerStore = create<MultiplayerState>()((set, get) => ({
  // Initial state
  socket: null,
  isConnected: false,
  connectionStatus: 'disconnected',
  currentPlayer: null,
  currentRoom: null,
  availableRooms: [],
  gameState: null,
  gameActions: [],
  isSearchingForMatch: false,
  searchStartTime: null,
  isMultiplayerSession: false,
  pendingDeck: null,

  connect: async () => {
    const state = get();
    if (state.socket?.connected) {
      return;
    }

    set({ connectionStatus: 'connecting' });

    try {
      const socketUrl = getSocketURL();
      const socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        autoConnect: true,
      });

      // Connection events
      socket.on('connect', () => {
        set({
          socket,
          isConnected: true,
          connectionStatus: 'connected',
        });
      });

      socket.on('disconnect', () => {
        set({
          isConnected: false,
          connectionStatus: 'disconnected',
          currentRoom: null,
        });
      });

      socket.on('connect_error', () => {
        set({ connectionStatus: 'error' });
      });

      // Room events
      socket.on('room_joined', (room: GameRoom) => {
        get().setCurrentRoom(room);
      });

      socket.on('room_left', () => {
        get().setCurrentRoom(null);
      });

      socket.on('room_updated', (room: GameRoom) => {
        get().setCurrentRoom(room);
      });

      socket.on('available_rooms', (rooms: GameRoom[]) => {
        get().setAvailableRooms(rooms);
      });

      // Game events
      socket.on('game_state_updated', (gameState: any) => {
        get().updateGameState(gameState);
      });

      socket.on('game_action', (action: GameAction) => {
        get().addGameAction(action);
      });

      socket.on('match_found', (room: GameRoom) => {
        set({ isSearchingForMatch: false, searchStartTime: null });
        get().setCurrentRoom(room);
      });

      socket.on('matchmaking_cancelled', () => {
        set({ isSearchingForMatch: false, searchStartTime: null });
      });

      // Game starting event - emitted when both players are ready
      socket.on('game_starting', (room: GameRoom) => {
        // CRITICAL: Set persistent multiplayer session flag that won't be overwritten by room_updated
        set({ isMultiplayerSession: true });
        // Also update room status to 'ready' for consistency
        const roomWithReadyStatus = { ...room, status: 'ready' as const };
        get().setCurrentRoom(roomWithReadyStatus);
      });

      // Game started event - emitted when game has been initialized
      socket.on('game_started', (data: { room: GameRoom; gameState: any }) => {
        // CRITICAL: Also set multiplayer session flag here in case game_starting was missed
        set({ isMultiplayerSession: true });
        // Ensure room status is 'playing' for consistency
        const roomWithPlayingStatus = { ...data.room, status: 'playing' as const };
        get().setCurrentRoom(roomWithPlayingStatus);
        get().updateGameState(data.gameState);
      });

      // Auto-register player with persistent ID
      socket.on('connect', async () => {
        // Generate or retrieve a persistent player ID from localStorage
        let persistentId = localStorage.getItem('multiplayer_player_id');
        if (!persistentId) {
          persistentId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('multiplayer_player_id', persistentId);
        }

        // Try to get wallet address and display name
        let walletAddress: string | null = null;
        let displayName = `Player_${persistentId.substr(0, 8)}`;

        try {
          const { useWalletStore } = await import('@/stores/useWalletStore');
          const walletState = useWalletStore.getState();
          walletAddress = walletState.walletAddress;
          if (walletState.playerProfile?.displayName) {
            displayName = walletState.playerProfile.displayName;
          }
        } catch {
          // Wallet store unavailable; proceed with defaults
        }

        const playerData = {
          playerId: persistentId,
          name: displayName,
          avatar: null,
          walletAddress,
        };

        socket.emit('register_player', playerData);
      });

      socket.on('player_registered', (player: Player) => {
        set({ currentPlayer: player });
      });
    } catch (error) {
      set({ connectionStatus: 'error' });
      throw error;
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({
        socket: null,
        isConnected: false,
        connectionStatus: 'disconnected',
        currentRoom: null,
        currentPlayer: null,
        gameState: null,
        gameActions: [],
        isSearchingForMatch: false,
        searchStartTime: null,
        isMultiplayerSession: false,
      });
    }
  },

  joinRoom: async (roomId: string) => {
    const { socket } = get();
    if (!socket?.connected) {
      throw new Error('Not connected to multiplayer server');
    }

    return new Promise((resolve, reject) => {
      socket.emit('join_room', roomId);

      const timeout = setTimeout(() => {
        reject(new Error('Join room timeout'));
      }, 5000);

      socket.once('room_joined', () => {
        clearTimeout(timeout);
        resolve(void 0);
      });

      socket.once('join_room_error', (error: string) => {
        clearTimeout(timeout);
        reject(new Error(error));
      });
    });
  },

  createRoom: async (roomName: string, settings: Partial<GameRoom['settings']>) => {
    const { socket } = get();
    if (!socket?.connected) {
      throw new Error('Not connected to multiplayer server');
    }

    const roomData = {
      name: roomName,
      settings: {
        timeLimit: 1800, // 30 minutes
        deckRestrictions: [],
        allowSpectators: true,
        ...settings,
      },
    };

    return new Promise((resolve, reject) => {
      socket.emit('create_room', roomData);

      const timeout = setTimeout(() => {
        reject(new Error('Create room timeout'));
      }, 5000);

      socket.once('room_created', () => {
        clearTimeout(timeout);
        resolve(void 0);
      });

      socket.once('create_room_error', (error: string) => {
        clearTimeout(timeout);
        reject(new Error(error));
      });
    });
  },

  leaveRoom: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit('leave_room');
    }
    set({ currentRoom: null });
  },

  setPlayerReady: (ready: boolean) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit('set_ready', ready);
    }
  },

  sendGameAction: (action: Omit<GameAction, 'playerId' | 'timestamp'>) => {
    const { socket, currentPlayer } = get();
    if (socket?.connected && currentPlayer) {
      const fullAction: GameAction = {
        ...action,
        playerId: currentPlayer.id,
        timestamp: Date.now(),
      };

      socket.emit('game_action', fullAction);
      get().addGameAction(fullAction);
    }
  },

  startMatchmaking: (gameMode: 'casual' | 'ranked') => {
    const { socket } = get();
    if (!socket?.connected) {
      throw new Error('Not connected to multiplayer server');
    }

    socket.emit('start_matchmaking', { gameMode });
    set({
      isSearchingForMatch: true,
      searchStartTime: Date.now(),
    });
  },

  stopMatchmaking: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit('stop_matchmaking');
    }
    set({
      isSearchingForMatch: false,
      searchStartTime: null,
    });
  },

  // Internal methods
  updateGameState: (newState: any) => {
    set({ gameState: newState });
  },

  addGameAction: (action: GameAction) => {
    set((state) => ({
      gameActions: [...state.gameActions, action],
    }));
  },

  setCurrentRoom: (room: GameRoom | null) => {
    set({ currentRoom: room });
  },

  setAvailableRooms: (rooms: GameRoom[]) => {
    set({ availableRooms: rooms });
  },

  setPendingDeck: (deck: any[] | null) => {
    set({ pendingDeck: deck });
  },

  setIsMultiplayerSession: (isSession: boolean) => {
    set({ isMultiplayerSession: isSession });
  },
}));
