import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useBinauralBeatsPlayer } from '../hooks/useBinauralBeatsPlayer';
import apiClient from '../lib/apiClient';

// This is the OBJECT we pass when we want to START a session.
// It contains all the info needed for the API call and UI.
export interface SessionPayload {
  mode: 'manual' | 'smart';
  apiEndpoint: string;
  apiPayload: object;
  displayName: string;
  displayCategory: string;
  totalDuration: number;
  sessionId?: string; // Optional custom ID (e.g., category ID)
}

// This is the object for the CURRENTLY playing session.
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
  startSession: (payload: SessionPayload) => Promise<void>;
  closePlayer: () => void;
  togglePlayPause: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);

  const { isPlaying, playFromApi, stop, toggle } = useBinauralBeatsPlayer(setCurrentTime);

  useEffect(() => {
    if (currentSession && currentSession.duration > 0) {
      const newProgress = currentTime / currentSession.duration;
      setProgress(newProgress > 1 ? 1 : newProgress);
      if (newProgress >= 1) {
        closePlayer();
      }
    }
  }, [currentTime, currentSession]);

  const startSession = async (payload: SessionPayload) => {
    try {
      // 1. Call the audio hook to get the audio from the API.
      const apiResponse = await playFromApi(payload.apiEndpoint, payload.apiPayload);

      if (apiResponse) {
        // 2. Set the current session for the UI.
        const sessionForUI: Session = {
          id: payload.sessionId || (payload.mode === 'manual' ? (payload.apiPayload as any).state : 'smart-session'),
          name: payload.displayName,
          category: payload.displayCategory,
          frequency: apiResponse.frequency,
          duration: payload.totalDuration,
        };
        setCurrentSession(sessionForUI);

        // 3. Log the session to Supabase in the background.
        await apiClient.post('/log_session', {
          frequency: apiResponse.frequency,
          mode: apiResponse.mode,
          duration: payload.totalDuration,
        });
        console.log("Session started and logged successfully!");
      }
    } catch (error) {
      console.error("Failed to start session:", error);
      closePlayer(); // Clean up on failure.
      throw error; // Propagate error to the UI to show an Alert.
    }
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