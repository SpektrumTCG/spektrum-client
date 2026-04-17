import { create } from 'zustand';
import { Howl, Howler } from 'howler';

interface AudioState {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  currentMusic: Howl | null;
  isAudioInitialized: boolean;
  currentContext: 'menu' | 'game' | 'battle';

  // Controls
  toggleSfx: () => void;
  toggleMusic: () => void;
  setSfxVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  initializeAudio: () => void;
  setAudioContext: (context: 'menu' | 'game' | 'battle') => void;

  // Music
  playBackgroundMusic: (track?: string) => void;
  playContextMusic: (context?: 'menu' | 'game' | 'battle') => void;
  stopMusic: () => void;

  // Dev Tools
  getAllLoadedAudio: () => { src: string; sound: Howl }[];
  testPlayAudio: (src: string) => void;
  reloadAudio: (src: string) => void;

  // UI Sound Effects
  playButton: () => void;
  playSuccess: () => void;
  playError: () => void;
  playHover: () => void;

  // Game Sound Effects
  playCard: () => void;
  playDraw: () => void;
  playHit: () => void;
  playSkill: () => void;
  playSpell: () => void;
  playEvolution: () => void;
  playDamage: () => void;
  playHeal: () => void;
  playDeath: () => void;

  // Phase Transitions
  playPhaseChange: () => void;
  playTurnStart: () => void;
  playTurnEnd: () => void;
  playGameStart: () => void;
  playGameWin: () => void;
  playGameLose: () => void;
}

// Audio asset definitions
const AUDIO_ASSETS = {
  music: {
    background: '/sounds/background.mp3',
    menu: '/sounds/menu-theme.mp3',
    game: '/sounds/game-theme.mp3',
    battle: '/sounds/battle-theme.mp3',
    victory: '/sounds/victory-theme.mp3',
    defeat: '/sounds/defeat-theme.mp3',
  },
  sfx: {
    // UI sounds
    buttonClick: '/sounds/button-click.mp3',
    buttonHover: '/sounds/button-hover.mp3',
    success: '/sounds/success.mp3',
    error: '/sounds/error.mp3',

    // Game sounds
    cardPlay: '/sounds/card-play.mp3',
    cardDraw: '/sounds/card-draw.mp3',
    cardShuffle: '/sounds/card-shuffle.mp3',
    hit: '/sounds/hit.mp3',
    skill: '/sounds/skill-cast.mp3',
    spell: '/sounds/spell-cast.mp3',
    evolution: '/sounds/evolution.mp3',
    damage: '/sounds/damage.mp3',
    heal: '/sounds/heal.mp3',
    death: '/sounds/death.mp3',

    // Phase sounds
    phaseChange: '/sounds/phase-change.mp3',
    turnStart: '/sounds/turn-start.mp3',
    turnEnd: '/sounds/turn-end.mp3',
    gameStart: '/sounds/game-start.mp3',
    gameWin: '/sounds/game-win.mp3',
    gameLose: '/sounds/game-lose.mp3',
  },
};

let _legacyMusicStopCallback: (() => void) | null = null;

export function registerLegacyMusicStop(callback: () => void) {
  _legacyMusicStopCallback = callback;
}

const audioCache = new Map<string, Howl>();

// Audio loading function with fallback handling
const loadAudio = (src: string, options: Record<string, unknown> = {}): Howl => {
  if (audioCache.has(src)) {
    return audioCache.get(src)!;
  }

  const sound = new Howl({
    src: [src],
    preload: true,
    html5: false, // Use Web Audio API for better performance
    ...options,
  });

  audioCache.set(src, sound);
  return sound;
};

export const useAudio = create<AudioState>((set, get) => ({
  sfxEnabled: true,
  musicEnabled: true,
  sfxVolume: 0.7,
  musicVolume: 0.5,
  currentMusic: null,
  isAudioInitialized: false,
  currentContext: 'menu',

  initializeAudio: () => {
    if (get().isAudioInitialized) return;

    Howler.volume(1.0);

    // Pre-load essential sounds
    loadAudio(AUDIO_ASSETS.music.background, { loop: true, volume: 0.5 });
    loadAudio(AUDIO_ASSETS.sfx.buttonClick, { volume: 0.3 });
    loadAudio(AUDIO_ASSETS.sfx.success, { volume: 0.4 });
    loadAudio(AUDIO_ASSETS.sfx.hit, { volume: 0.3 });

    set({ isAudioInitialized: true });
  },

  toggleSfx: () => {
    const newState = !get().sfxEnabled;
    set({ sfxEnabled: newState });

    if (!newState) {
      // Stop all currently playing SFX
      audioCache.forEach(sound => {
        if (!sound.loop()) { // Don't stop looping music
          sound.stop();
        }
      });
    }
  },

  toggleMusic: () => {
    const { musicEnabled, stopMusic, playBackgroundMusic } = get();
    const newState = !musicEnabled;
    set({ musicEnabled: newState });

    if (newState) {
      playBackgroundMusic();
    } else {
      stopMusic();
      if (_legacyMusicStopCallback) {
        _legacyMusicStopCallback();
      }
    }
  },

  setSfxVolume: (volume: number) => {
    const newVolume = Math.max(0, Math.min(1, volume));
    set({ sfxVolume: newVolume });

    // If SFX volume is 0, stop all currently playing SFX
    if (newVolume === 0) {
      audioCache.forEach(sound => {
        if (!sound.loop()) { // Don't stop looping music
          sound.stop();
        }
      });
    }
  },

  setMusicVolume: (volume: number) => {
    const newVolume = Math.max(0, Math.min(1, volume));
    set({ musicVolume: newVolume });

    const { currentMusic } = get();
    if (currentMusic) {
      if (newVolume === 0) {
        // Stop music completely when volume is 0
        currentMusic.stop();
      } else {
        // Set volume and play if not already playing
        currentMusic.volume(newVolume);
        if (!currentMusic.playing()) {
          currentMusic.play();
        }
      }
    }
  },

  setAudioContext: (context: 'menu' | 'game' | 'battle') => {
    const { currentContext } = get();
    if (currentContext !== context) {
      set({ currentContext: context });
      get().playContextMusic(context);
    }
  },

  playBackgroundMusic: (track: string = 'background') => {
    const { musicEnabled, musicVolume, currentMusic } = get();

    // Stop current music
    if (currentMusic) {
      currentMusic.stop();
    }

    if (!musicEnabled) return;

    const musicSrc = AUDIO_ASSETS.music[track as keyof typeof AUDIO_ASSETS.music] || AUDIO_ASSETS.music.background;
    const music = loadAudio(musicSrc, {
      loop: true,
      volume: musicVolume,
    });

    music.play();
    set({ currentMusic: music });
  },

  playContextMusic: (context?: 'menu' | 'game' | 'battle') => {
    const { musicEnabled, musicVolume, currentMusic, currentContext } = get();

    const targetContext = context || currentContext;
    let trackName = 'background';

    // Map context to appropriate track
    switch (targetContext) {
      case 'menu':
        trackName = 'menu';
        break;
      case 'game':
        trackName = 'game';
        break;
      case 'battle':
        trackName = 'battle';
        break;
    }

    // Stop current music
    if (currentMusic) {
      currentMusic.stop();
    }

    if (!musicEnabled) return;

    const musicSrc = AUDIO_ASSETS.music[trackName as keyof typeof AUDIO_ASSETS.music] || AUDIO_ASSETS.music.background;
    const music = loadAudio(musicSrc, {
      loop: true,
      volume: musicVolume,
    });

    music.play();
    set({ currentMusic: music });
  },

  stopMusic: () => {
    const { currentMusic } = get();
    if (currentMusic) {
      currentMusic.stop();
      set({ currentMusic: null });
    }
  },

  // UI Sound Effects
  playButton: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.buttonClick, { volume: sfxVolume * 0.3 }).play();
  },

  playSuccess: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.success, { volume: sfxVolume * 0.4 }).play();
  },

  playError: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.error, { volume: sfxVolume * 0.3 }).play();
  },

  playHover: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.buttonHover, { volume: sfxVolume * 0.2 }).play();
  },

  // Game Sound Effects
  playCard: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.cardPlay, { volume: sfxVolume * 0.4 }).play();
  },

  playDraw: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.cardDraw, { volume: sfxVolume * 0.3 }).play();
  },

  playHit: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.hit, { volume: sfxVolume * 0.3 }).play();
  },

  playSkill: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.skill, { volume: sfxVolume * 0.4 }).play();
  },

  playSpell: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.spell, { volume: sfxVolume * 0.4 }).play();
  },

  playEvolution: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.evolution, { volume: sfxVolume * 0.5 }).play();
  },

  playDamage: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.damage, { volume: sfxVolume * 0.3 }).play();
  },

  playHeal: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.heal, { volume: sfxVolume * 0.3 }).play();
  },

  playDeath: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.death, { volume: sfxVolume * 0.4 }).play();
  },

  // Phase Transition Sounds
  playPhaseChange: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.phaseChange, { volume: sfxVolume * 0.3 }).play();
  },

  playTurnStart: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.turnStart, { volume: sfxVolume * 0.4 }).play();
  },

  playTurnEnd: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.turnEnd, { volume: sfxVolume * 0.3 }).play();
  },

  playGameStart: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.gameStart, { volume: sfxVolume * 0.5 }).play();
  },

  playGameWin: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.gameWin, { volume: sfxVolume * 0.6 }).play();
  },

  playGameLose: () => {
    const { sfxEnabled, sfxVolume } = get();
    if (!sfxEnabled) return;
    loadAudio(AUDIO_ASSETS.sfx.gameLose, { volume: sfxVolume * 0.5 }).play();
  },

  // Dev Tools Methods
  getAllLoadedAudio: () => {
    return Array.from(audioCache.entries()).map(([src, sound]) => ({ src, sound }));
  },

  testPlayAudio: (src: string) => {
    const { sfxVolume } = get();
    loadAudio(src, { volume: sfxVolume * 0.5 }).play();
  },

  reloadAudio: (src: string) => {
    // Remove from cache and reload
    if (audioCache.has(src)) {
      const existingSound = audioCache.get(src)!;
      existingSound.unload();
      audioCache.delete(src);
    }
    // Force reload
    loadAudio(src);
  },
}));
