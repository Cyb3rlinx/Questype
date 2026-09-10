'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import { Volume2, VolumeX } from 'lucide-react';
import { useLocale } from '../i18n-provider';

const START_EVENT = 'questype:journey-soundtrack-start';
const STOP_EVENT = 'questype:journey-soundtrack-stop';
const MUTED_STORAGE_KEY = 'questype:journey-soundtrack-muted';

type SoundtrackContextValue = {
  muted: boolean;
  playing: boolean;
  toggle: () => void;
};

const SoundtrackContext = createContext<SoundtrackContextValue>({
  muted: false,
  playing: false,
  toggle: () => undefined,
});

export function startJourneySoundtrack() {
  window.dispatchEvent(new Event(START_EVENT));
}

export function stopJourneySoundtrack() {
  window.dispatchEvent(new Event(STOP_EVENT));
}

export function JourneySoundtrackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);

  const rememberMuted = useCallback((next: boolean) => {
    setMuted(next);
    localStorage.setItem(MUTED_STORAGE_KEY, next ? '1' : '0');
    if (audioRef.current) audioRef.current.muted = next;
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || audio.muted) return;
    try {
      await audio.play();
    } catch {
      setPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.35;
    const storedMuted = localStorage.getItem(MUTED_STORAGE_KEY) === '1';
    audio.muted = storedMuted;
    setMuted(storedMuted);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  useEffect(() => {
    const onStart = () => void play();
    const onStop = () => stop();
    window.addEventListener(START_EVENT, onStart);
    window.addEventListener(STOP_EVENT, onStop);
    return () => {
      window.removeEventListener(START_EVENT, onStart);
      window.removeEventListener(STOP_EVENT, onStop);
    };
  }, [play, stop]);

  useEffect(() => {
    if (pathname === '/journey') void play();
    else stop();
  }, [pathname, play, stop]);

  const value = useMemo<SoundtrackContextValue>(
    () => ({
      muted,
      playing,
      toggle() {
        const audio = audioRef.current;
        if (!audio) return;
        if (muted || audio.paused) {
          rememberMuted(false);
          void audio.play().catch(() => setPlaying(false));
        } else {
          rememberMuted(true);
        }
      },
    }),
    [muted, playing, rememberMuted],
  );

  return (
    <SoundtrackContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src="/audio/pastoral-whispers.mp3"
        preload="metadata"
        loop
      />
    </SoundtrackContext.Provider>
  );
}

export function SoundtrackControl() {
  const { locale } = useLocale();
  const { muted, playing, toggle } = useContext(SoundtrackContext);
  const silent = muted || !playing;
  return (
    <button
      type="button"
      className="soundtrack-control"
      onClick={toggle}
      aria-pressed={silent}
      aria-label={
        silent
          ? locale === 'es'
            ? 'Activar música'
            : 'Unmute music'
          : locale === 'es'
            ? 'Silenciar música'
            : 'Mute music'
      }
    >
      {silent ? <VolumeX size={14} /> : <Volume2 size={14} />}
      <span>{silent ? 'UNMUTE' : 'MUTE'}</span>
    </button>
  );
}
