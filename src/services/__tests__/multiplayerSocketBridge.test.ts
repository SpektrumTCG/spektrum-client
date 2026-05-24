import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from 'events';
import { createMultiplayerSocket, getMultiplayerSocketURL } from '../multiplayerSocketBridge';
import type { GameRoom, MultiplayerState } from '@/stores/useMultiplayerStore';

class FakeSocket extends EventEmitter {
  emit = vi.fn((...args: any[]) => {
    // Don't actually broadcast — emit() on real socket.io-client sends to
    // server; here it's just a recorded outbound call. EventEmitter.emit is
    // used for inbound test triggers via fire().
    return true;
  });
  fire(event: string, ...args: any[]) {
    // EventEmitter.emit (super) actually fans out to listeners; that's how
    // the bridge sees a server-sent event.
    super.emit(event, ...args);
  }
}

function makeStore(initial: Partial<MultiplayerState> = {}) {
  let state: MultiplayerState = {
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
    connect: vi.fn(),
    disconnect: vi.fn(),
    joinRoom: vi.fn(),
    createRoom: vi.fn(),
    leaveRoom: vi.fn(),
    setPlayerReady: vi.fn(),
    sendGameAction: vi.fn(),
    startMatchmaking: vi.fn(),
    stopMatchmaking: vi.fn(),
    updateGameState: vi.fn((s) => {
      state = { ...state, gameState: s };
    }),
    addGameAction: vi.fn((a) => {
      state = { ...state, gameActions: [...state.gameActions, a] };
    }),
    setCurrentRoom: vi.fn((r) => {
      state = { ...state, currentRoom: r };
    }),
    setAvailableRooms: vi.fn((r) => {
      state = { ...state, availableRooms: r };
    }),
    setPendingDeck: vi.fn(),
    setIsMultiplayerSession: vi.fn(),
    ...initial,
  };
  return {
    setState: vi.fn((partial: any) => {
      const next = typeof partial === 'function' ? partial(state) : partial;
      state = { ...state, ...next };
    }),
    getState: () => state,
    _state: () => state,
  };
}

const room: GameRoom = {
  id: 'r1',
  name: 'lobby',
  players: [],
  maxPlayers: 2,
  gameMode: 'casual',
  status: 'waiting',
  settings: { timeLimit: 1800, deckRestrictions: [], allowSpectators: false },
};

describe('multiplayerSocketBridge', () => {
  let socket: FakeSocket;
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    socket = new FakeSocket();
    store = makeStore();
    createMultiplayerSocket(store, {
      url: 'http://test',
      socketFactory: () => socket as any,
    });
  });

  it('connect event hydrates connection state', () => {
    socket.fire('connect');
    const s = store._state();
    expect(s.isConnected).toBe(true);
    expect(s.connectionStatus).toBe('connected');
    expect(s.socket).toBe(socket);
  });

  it('disconnect event clears room + connection', () => {
    socket.fire('connect');
    store.setState({ currentRoom: room });
    socket.fire('disconnect');
    const s = store._state();
    expect(s.isConnected).toBe(false);
    expect(s.connectionStatus).toBe('disconnected');
    expect(s.currentRoom).toBeNull();
  });

  it('connect_error sets error status', () => {
    socket.fire('connect_error');
    expect(store._state().connectionStatus).toBe('error');
  });

  it('room_joined / room_updated route to setCurrentRoom', () => {
    socket.fire('room_joined', room);
    expect(store.getState().setCurrentRoom).toHaveBeenCalledWith(room);
    socket.fire('room_updated', { ...room, name: 'renamed' });
    expect(store.getState().setCurrentRoom).toHaveBeenLastCalledWith({
      ...room,
      name: 'renamed',
    });
  });

  it('room_left clears the room', () => {
    socket.fire('room_left');
    expect(store.getState().setCurrentRoom).toHaveBeenCalledWith(null);
  });

  it('available_rooms routes to setAvailableRooms', () => {
    socket.fire('available_rooms', [room]);
    expect(store.getState().setAvailableRooms).toHaveBeenCalledWith([room]);
  });

  it('game_state_updated routes to updateGameState', () => {
    socket.fire('game_state_updated', { turn: 3 });
    expect(store.getState().updateGameState).toHaveBeenCalledWith({ turn: 3 });
  });

  it('game_action routes to addGameAction', () => {
    const action = { type: 'play', playerId: 'p1', data: {}, timestamp: 0 };
    socket.fire('game_action', action);
    expect(store.getState().addGameAction).toHaveBeenCalledWith(action);
  });

  it('match_found clears matchmaking flags + sets room', () => {
    store.setState({ isSearchingForMatch: true, searchStartTime: 123 });
    socket.fire('match_found', room);
    const s = store._state();
    expect(s.isSearchingForMatch).toBe(false);
    expect(s.searchStartTime).toBeNull();
    expect(store.getState().setCurrentRoom).toHaveBeenCalledWith(room);
  });

  it('matchmaking_cancelled clears flags', () => {
    store.setState({ isSearchingForMatch: true, searchStartTime: 99 });
    socket.fire('matchmaking_cancelled');
    const s = store._state();
    expect(s.isSearchingForMatch).toBe(false);
    expect(s.searchStartTime).toBeNull();
  });

  it('game_starting marks session and forces room status=ready', () => {
    socket.fire('game_starting', { ...room, status: 'waiting' });
    expect(store._state().isMultiplayerSession).toBe(true);
    expect(store.getState().setCurrentRoom).toHaveBeenCalledWith({
      ...room,
      status: 'ready',
    });
  });

  it('game_started marks session, forces status=playing, hydrates gameState', () => {
    socket.fire('game_started', { room: { ...room, status: 'waiting' }, gameState: { x: 1 } });
    expect(store._state().isMultiplayerSession).toBe(true);
    expect(store.getState().setCurrentRoom).toHaveBeenCalledWith({
      ...room,
      status: 'playing',
    });
    expect(store.getState().updateGameState).toHaveBeenCalledWith({ x: 1 });
  });

  it('player_registered hydrates currentPlayer', () => {
    const player = { id: 'p1', name: 'A', isReady: false, isHost: false };
    socket.fire('player_registered', player);
    expect(store._state().currentPlayer).toEqual(player);
  });
});

describe('getMultiplayerSocketURL', () => {
  const origWindow = (globalThis as any).window;
  const origEnv = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    (globalThis as any).window = origWindow;
    if (origEnv === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = origEnv;
  });

  it('env override wins', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://override.test';
    expect(getMultiplayerSocketURL()).toBe('https://override.test');
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  it('SSR fallback when no window', () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    (globalThis as any).window = undefined;
    expect(getMultiplayerSocketURL()).toBe('http://localhost:3001');
  });

  it('localhost -> port 3001 direct', () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    (globalThis as any).window = {
      location: { protocol: 'http:', hostname: 'localhost', origin: 'http://localhost:3000' },
    };
    expect(getMultiplayerSocketURL()).toBe('http://localhost:3001');
  });

  it('replit dev host rewrites to 3001 subdomain', () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    (globalThis as any).window = {
      location: {
        protocol: 'https:',
        hostname: 'myapp.replit.dev',
        origin: 'https://myapp.replit.dev',
      },
    };
    expect(getMultiplayerSocketURL()).toBe('https://3001-myapp.replit.dev');
  });

  it('arbitrary prod host -> same-origin', () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    (globalThis as any).window = {
      location: {
        protocol: 'https:',
        hostname: 'spektrum.tcg',
        origin: 'https://spektrum.tcg',
      },
    };
    expect(getMultiplayerSocketURL()).toBe('https://spektrum.tcg');
  });
});
