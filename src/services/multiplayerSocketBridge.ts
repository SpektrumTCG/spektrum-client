// Bridge between socket.io and the multiplayer store.
//
// Previously useMultiplayerStore.connect() created the socket AND registered
// every `socket.on(...)` handler inline, so the store directly knew about
// network transport, message names, and the autoregister display-name
// resolution flow. That made the store harder to test in isolation and
// blurred the "store owns state, services own I/O" seam.
//
// This bridge owns the inbound side: socket creation, URL resolution, and
// every `socket.on` -> store-action mapping. Outbound calls (`socket.emit`
// inside joinRoom, createRoom, sendGameAction, …) stay in the store — they
// are user-driven domain actions that happen to send a network event.
//
// The bridge takes the zustand StoreApi as an injected dep, so it has no
// runtime import from the store module. Type-only import keeps the type
// surface aligned without creating a load cycle.

import { io, type Socket } from 'socket.io-client';
import type { GameAction, GameRoom, MultiplayerState, Player } from '@/stores/useMultiplayerStore';

/**
 * Minimal slice of zustand's StoreApi the bridge needs. Lets the store pass
 * either its own `{ set, get }` callback args or its full StoreApi instance.
 */
export interface MultiplayerStoreLike {
  setState(
    partial:
      | Partial<MultiplayerState>
      | ((s: MultiplayerState) => Partial<MultiplayerState>),
  ): void;
  getState(): MultiplayerState;
}

// Socket URL — by default we connect to the Express server. Default depends
// on where we're running:
//   1. `NEXT_PUBLIC_API_URL` env override always wins.
//   2. localhost / bare LAN IP -> direct connect on port 3001.
//   3. Replit dev (`*.replit.dev` / `*.replit.app`) -> sibling 3001 subdomain.
//   4. Any other domain -> same-origin (relies on /socket.io rewrite).
//   5. SSR fallback.
export function getMultiplayerSocketURL(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const { protocol, hostname, origin } = window.location;
    const isLocalDev =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
    if (isLocalDev) return `${protocol}//${hostname}:3001`;
    const isReplit = /\.replit\.(dev|app)$/i.test(hostname);
    if (isReplit) {
      const replitHost = hostname.replace(/^\d+-/, '');
      return `${protocol}//3001-${replitHost}`;
    }
    return origin;
  }
  return 'http://localhost:3001';
}

export interface CreateMultiplayerSocketOptions {
  /** Override the resolved URL — useful for tests / staging. */
  url?: string;
  /** Inject a custom socket factory for tests. */
  socketFactory?: (url: string) => Socket;
  /** Clerk session token (JWT) for socket auth. */
  token?: string;
}

/**
 * Create a socket.io client wired to the multiplayer store. Returns the
 * socket so the store can hold a reference for outbound emits.
 */
export function createMultiplayerSocket(
  store: MultiplayerStoreLike,
  opts: CreateMultiplayerSocketOptions = {},
): Socket {
  const url = opts.url ?? getMultiplayerSocketURL();
  const token = opts.token;
  const factory =
    opts.socketFactory ??
    ((u: string) =>
      io(u, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        autoConnect: true,
        auth: token ? { token } : undefined,
      }));
  const socket = factory(url);
  attachBridge(socket, store);
  return socket;
}

function attachBridge(socket: Socket, store: MultiplayerStoreLike) {
  socket.on('connect', () => {
    store.setState({
      socket,
      isConnected: true,
      connectionStatus: 'connected',
    });
  });

  socket.on('disconnect', () => {
    store.setState({
      isConnected: false,
      connectionStatus: 'disconnected',
      currentRoom: null,
    });
  });

  socket.on('connect_error', () => {
    store.setState({ connectionStatus: 'error' });
  });

  socket.on('room_joined', (room: GameRoom) => {
    store.getState().setCurrentRoom(room);
  });

  socket.on('room_left', () => {
    store.getState().setCurrentRoom(null);
  });

  socket.on('room_updated', (room: GameRoom) => {
    store.getState().setCurrentRoom(room);
  });

  socket.on('available_rooms', (rooms: GameRoom[]) => {
    store.getState().setAvailableRooms(rooms);
  });

  socket.on('game_state_updated', (gameState: unknown) => {
    store.getState().updateGameState(gameState);
  });

  socket.on('game_action', (action: GameAction) => {
    store.getState().addGameAction(action);
  });

  socket.on('match_found', (room: GameRoom) => {
    store.setState({ isSearchingForMatch: false, searchStartTime: null });
    store.getState().setCurrentRoom(room);
  });

  socket.on('matchmaking_cancelled', () => {
    store.setState({ isSearchingForMatch: false, searchStartTime: null });
  });

  // game_starting: both players ready, server about to deal cards.
  socket.on('game_starting', (room: GameRoom) => {
    store.setState({ isMultiplayerSession: true });
    store.getState().setCurrentRoom({ ...room, status: 'ready' });
  });

  // game_started: server has dealt; the gameState payload is authoritative.
  socket.on(
    'game_started',
    (data: { room: GameRoom; gameState: unknown }) => {
      store.setState({ isMultiplayerSession: true });
      store.getState().setCurrentRoom({ ...data.room, status: 'playing' });
      store.getState().updateGameState(data.gameState);
    },
  );

  // Second 'connect' listener: auto-register persistent player id +
  // resolved display name. Runs alongside the connection-state listener
  // above; socket.io fires every handler.
  socket.on('connect', () => {
    void registerPersistentPlayer(socket);
  });

  socket.on('player_registered', (player: Player) => {
    store.setState({ currentPlayer: player });
  });
}

async function registerPersistentPlayer(socket: Socket): Promise<void> {
  if (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') return;

  let persistentId = localStorage.getItem('multiplayer_player_id');
  if (!persistentId) {
    persistentId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('multiplayer_player_id', persistentId);
  }

  // Resolve display name: wallet profile > game-mode custom name > fallback.
  let walletAddress: string | null = null;
  let savedProfileName: string | null = null;
  let gameModeName: string | null = null;

  try {
    const { useWalletStore } = await import('@/stores/useWalletStore');
    const walletState = useWalletStore.getState();
    walletAddress = walletState.walletAddress;
    savedProfileName = walletState.playerProfile?.displayName?.trim() || null;
  } catch {
    // Wallet store unavailable; proceed.
  }

  try {
    const { useGameMode } = await import('@/features/game/stores/useGameMode');
    const name = useGameMode.getState().playerName?.trim();
    if (name) gameModeName = name;
  } catch {
    // Game-mode store unavailable; proceed.
  }

  const displayName =
    savedProfileName ||
    (gameModeName && gameModeName !== 'Player' ? gameModeName : null) ||
    `Player_${persistentId.substr(0, 8)}`;

  socket.emit('register_player', {
    playerId: persistentId,
    name: displayName,
    avatar: null,
    walletAddress,
  });
}
