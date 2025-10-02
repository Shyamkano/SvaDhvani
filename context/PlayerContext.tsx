import { useBinauralBeatsPlayer } from 'hooks/useBinauralBeatsPlayer';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface Session {
  id: string;
  name: string;
  category: string;
  frequency: number;
  duration: number; // Total duration in seconds
}

interface PlayerContextType {
  isVisible: boolean;
  isPlaying: boolean;
  currentSession: Session | null;
  progress: number;
  currentTime: number;
  startSession: (session: Session) => void;
  closePlayer: () => void;
  togglePlayPause: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const { isPlaying, play, stop, toggle } = useBinauralBeatsPlayer(setCurrentTime);

  useEffect(() => {
    if (currentSession && currentSession.duration > 0) {
      const newProgress = currentTime / currentSession.duration;
      setProgress(newProgress > 1 ? 1 : newProgress);
      if (newProgress >= 1) {
        closePlayer();
      }
    }
  }, [currentTime, currentSession]);

  const startSession = (session: Session) => {
    setCurrentTime(0);
    setProgress(0);
    setCurrentSession(session);
    play(session.frequency);
  };

  const closePlayer = () => {
    stop();
    setCurrentSession(null);
  };

  const togglePlayPause = () => {
    if (!currentSession) return;
    toggle();
  };

  const value = {
    isVisible: currentSession !== null,
    isPlaying,
    currentSession,
    progress,
    currentTime,
    startSession,
    closePlayer,
    togglePlayPause,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};