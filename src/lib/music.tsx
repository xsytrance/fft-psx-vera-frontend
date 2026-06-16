import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';

export type MusicTrackId = 'feverbreak' | 'ember-between-wars' | 'steel-across-timelines';

export type MusicScreenId =
  | 'home'
  | 'campaigns'
  | 'settings'
  | 'party-ledger'
  | 'campfire'
  | 'timeline'
  | 'war-council'
  | 'character-chat'
  | 'dream-team'
  | 'inventory';

export type MusicTrack = {
  id: MusicTrackId;
  title: string;
  url: string;
  summary: string;
  tags: string[];
};

export type MusicScreen = {
  id: MusicScreenId;
  label: string;
  description: string;
  defaultTrackId: MusicTrackId;
};

type MusicPreferences = {
  enabled: boolean;
  volume: number;
  screenOverrides: Partial<Record<MusicScreenId, MusicTrackId>>;
};

type MusicContextValue = {
  tracks: MusicTrack[];
  screens: MusicScreen[];
  currentScreen: MusicScreen;
  currentTrack: MusicTrack;
  enabled: boolean;
  volume: number;
  isPlaying: boolean;
  blocked: boolean;
  screenOverrides: Partial<Record<MusicScreenId, MusicTrackId>>;
  setEnabled: (enabled: boolean) => void;
  toggleEnabled: () => void;
  setVolume: (volume: number) => void;
  setScreenTrack: (screenId: MusicScreenId, trackId: MusicTrackId) => void;
  setCurrentScreenTrack: (trackId: MusicTrackId) => void;
  clearScreenTrack: (screenId: MusicScreenId) => void;
  resetAllScreenTracks: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
};

const STORAGE_KEY = 'fft-psx-vera:music-preferences:v1';

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'feverbreak',
    title: 'FeverBreak',
    url: '/audio/feverbreak.mp3',
    summary: 'Loopable PS1-era tactical JRPG story-battle theme: tense strings, noble danger, decisive war drama.',
    tags: ['favorite', 'battle', 'tactical', 'heroic', 'urgent', 'orchestral'],
  },
  {
    id: 'ember-between-wars',
    title: 'Ember Between Wars',
    url: '/audio/ember-between-wars.mp3',
    summary: 'Loopable campfire reflection theme: warm strings, quiet drama, post-battle melancholy, safe but tense.',
    tags: ['campfire', 'reflective', 'melancholy', 'safe', 'story', 'orchestral'],
  },
  {
    id: 'steel-across-timelines',
    title: 'Steel Across Timelines',
    url: '/audio/steel-across-timelines.mp3',
    summary: 'Loopable high-energy battle-ready orchestral strategy theme with snares, timpani, brass, and cello pulse.',
    tags: ['battle', 'high-energy', 'combat', 'advisor', 'dangerous', 'orchestral'],
  },
];

export const MUSIC_SCREENS: MusicScreen[] = [
  {
    id: 'home',
    label: 'Home',
    description: 'Opening archive and upload landing.',
    defaultTrackId: 'ember-between-wars',
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    description: 'Save/project list and campaign archive.',
    defaultTrackId: 'ember-between-wars',
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Theme, music, and companion preferences.',
    defaultTrackId: 'ember-between-wars',
  },
  {
    id: 'party-ledger',
    label: 'Party Ledger',
    description: 'Core project workspace and save-truth party overview.',
    defaultTrackId: 'feverbreak',
  },
  {
    id: 'campfire',
    label: 'Campfire',
    description: 'Parser-grounded party memory and post-battle reflection.',
    defaultTrackId: 'ember-between-wars',
  },
  {
    id: 'timeline',
    label: 'Timeline',
    description: 'Save-memory chronology and campaign history.',
    defaultTrackId: 'ember-between-wars',
  },
  {
    id: 'war-council',
    label: 'War Council',
    description: 'Group chat and party strategy conversation.',
    defaultTrackId: 'feverbreak',
  },
  {
    id: 'character-chat',
    label: 'Character Chat',
    description: 'Longest sit-down character conversation screens.',
    defaultTrackId: 'feverbreak',
  },
  {
    id: 'dream-team',
    label: 'Dream Team',
    description: 'Roster building, tactical planning, and battle-party experiments.',
    defaultTrackId: 'steel-across-timelines',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    description: 'Equipment, item audit, and build inspection.',
    defaultTrackId: 'steel-across-timelines',
  },
];

const fallbackTrack = MUSIC_TRACKS[0];
const fallbackScreen = MUSIC_SCREENS[0];
const trackIds = new Set(MUSIC_TRACKS.map(track => track.id));
const screenIds = new Set(MUSIC_SCREENS.map(screen => screen.id));

const MusicContext = createContext<MusicContextValue | undefined>(undefined);

function clampVolume(volume: number) {
  if (!Number.isFinite(volume)) return 0.55;
  return Math.min(1, Math.max(0, volume));
}

function loadPreferences(): MusicPreferences {
  if (typeof window === 'undefined') return { enabled: false, volume: 0.55, screenOverrides: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { enabled: false, volume: 0.55, screenOverrides: {} };
    const parsed = JSON.parse(raw) as Partial<MusicPreferences>;
    const overrides: Partial<Record<MusicScreenId, MusicTrackId>> = {};
    Object.entries(parsed.screenOverrides ?? {}).forEach(([screenId, trackId]) => {
      if (screenIds.has(screenId as MusicScreenId) && trackIds.has(trackId as MusicTrackId)) {
        overrides[screenId as MusicScreenId] = trackId as MusicTrackId;
      }
    });
    return {
      enabled: Boolean(parsed.enabled),
      volume: clampVolume(typeof parsed.volume === 'number' ? parsed.volume : 0.55),
      screenOverrides: overrides,
    };
  } catch {
    return { enabled: false, volume: 0.55, screenOverrides: {} };
  }
}

function resolveScreen(pathname: string): MusicScreen {
  if (pathname === '/') return MUSIC_SCREENS.find(screen => screen.id === 'home') ?? fallbackScreen;
  if (pathname.startsWith('/dashboard')) return MUSIC_SCREENS.find(screen => screen.id === 'campaigns') ?? fallbackScreen;
  if (pathname.startsWith('/settings')) return MUSIC_SCREENS.find(screen => screen.id === 'settings') ?? fallbackScreen;
  if (pathname.includes('/inventory')) return MUSIC_SCREENS.find(screen => screen.id === 'inventory') ?? fallbackScreen;
  if (pathname.includes('/campfire')) return MUSIC_SCREENS.find(screen => screen.id === 'campfire') ?? fallbackScreen;
  if (pathname.includes('/timeline')) return MUSIC_SCREENS.find(screen => screen.id === 'timeline') ?? fallbackScreen;
  if (pathname.includes('/group-chat')) return MUSIC_SCREENS.find(screen => screen.id === 'war-council') ?? fallbackScreen;
  if (pathname.includes('/character/') && pathname.includes('/chat')) return MUSIC_SCREENS.find(screen => screen.id === 'character-chat') ?? fallbackScreen;
  if (pathname.includes('/dream-team')) return MUSIC_SCREENS.find(screen => screen.id === 'dream-team') ?? fallbackScreen;
  if (pathname.startsWith('/project/')) return MUSIC_SCREENS.find(screen => screen.id === 'party-ledger') ?? fallbackScreen;
  return fallbackScreen;
}

function resolveTrack(trackId: MusicTrackId): MusicTrack {
  return MUSIC_TRACKS.find(track => track.id === trackId) ?? fallbackTrack;
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [preferences, setPreferences] = useState<MusicPreferences>(() => loadPreferences());
  const [isPlaying, setIsPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentScreen = useMemo(() => resolveScreen(pathname), [pathname]);
  const currentTrack = useMemo(() => {
    const trackId = preferences.screenOverrides[currentScreen.id] ?? currentScreen.defaultTrackId;
    return resolveTrack(trackId);
  }, [currentScreen, preferences.screenOverrides]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.preload = 'auto';
    }
    const audio = audioRef.current;
    audio.volume = preferences.volume;
  }, [preferences.volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const previousTime = audio.currentTime;
    audio.src = currentTrack.url;
    audio.loop = true;
    audio.currentTime = Math.min(previousTime, 8);
    if (!preferences.enabled) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    audio.play()
      .then(() => {
        setIsPlaying(true);
        setBlocked(false);
      })
      .catch(() => {
        setIsPlaying(false);
        setBlocked(true);
      });
  }, [currentTrack.url, preferences.enabled]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const updatePreferences = (updater: (previous: MusicPreferences) => MusicPreferences) => {
    setPreferences(previous => updater(previous));
  };

  const setEnabled = (enabled: boolean) => {
    setBlocked(false);
    updatePreferences(previous => ({ ...previous, enabled }));
  };

  const setVolume = (volume: number) => {
    updatePreferences(previous => ({ ...previous, volume: clampVolume(volume) }));
  };

  const setScreenTrack = (screenId: MusicScreenId, trackId: MusicTrackId) => {
    updatePreferences(previous => ({
      ...previous,
      screenOverrides: {
        ...previous.screenOverrides,
        [screenId]: trackId,
      },
    }));
  };

  const clearScreenTrack = (screenId: MusicScreenId) => {
    updatePreferences(previous => {
      const nextOverrides = { ...previous.screenOverrides };
      delete nextOverrides[screenId];
      return { ...previous, screenOverrides: nextOverrides };
    });
  };

  const resetAllScreenTracks = () => {
    updatePreferences(previous => ({ ...previous, screenOverrides: {} }));
  };

  const shiftTrack = (direction: 1 | -1) => {
    const currentIndex = MUSIC_TRACKS.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + direction + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
    const nextTrack = MUSIC_TRACKS[nextIndex] ?? fallbackTrack;
    setScreenTrack(currentScreen.id, nextTrack.id);
    setEnabled(true);
  };

  const value: MusicContextValue = {
    tracks: MUSIC_TRACKS,
    screens: MUSIC_SCREENS,
    currentScreen,
    currentTrack,
    enabled: preferences.enabled,
    volume: preferences.volume,
    isPlaying,
    blocked,
    screenOverrides: preferences.screenOverrides,
    setEnabled,
    toggleEnabled: () => setEnabled(!preferences.enabled),
    setVolume,
    setScreenTrack,
    setCurrentScreenTrack: trackId => setScreenTrack(currentScreen.id, trackId),
    clearScreenTrack,
    resetAllScreenTracks,
    nextTrack: () => shiftTrack(1),
    previousTrack: () => shiftTrack(-1),
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within MusicProvider');
  return context;
}
