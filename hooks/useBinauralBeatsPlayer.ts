// import {  } from 'expo-audio';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import apiClient from '../lib/apiClient'; // Our secure API client

/**
 * Manages binaural beat playback by calling the backend API and streaming the generated audio.
 * @param onTimeUpdate A callback that receives the current playback time in seconds.
 */
export function useBinauralBeatsPlayer(onTimeUpdate: (timeInSeconds: number) => void) {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  /**
   * Main function to start playback. Calls the backend API and streams the resulting audio.
   * @param endpoint The API endpoint to call (e.g., '/play_manual').
   * @param payload The data to send in the request body.
   * @returns Data from the API needed for logging (frequency, mode).
   */
  const playFromApi = async (endpoint: string, payload: any) => {
    try {
      if (soundRef.current) await stop();

      // Call the Flask API using our secure client
      const response = await apiClient.post(endpoint, payload);
      const { audio_url, frequency, mode } = response;
      const beat_name = response.beat_name || response.state || response.predicted_state || "Unknown Beat";

      if (!audio_url) {
        throw new Error("API did not return an audio_url.");
      }
      
      console.log(`[API SUCCESS] Playing: ${beat_name} (${frequency} Hz), Streaming from: ${audio_url}`);

      // ✅ THE FIX: Create the sound object using the URI from the API response.
      const { sound } = await Audio.Sound.createAsync(
        { uri: audio_url },
        { shouldPlay: true, isLooping: true } // Loop the 30-second clip
      );
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
          if (status.isPlaying !== isPlaying) {
            setIsPlaying(status.isPlaying);
          }
          onTimeUpdate(status.positionMillis / 1000);
        }
      });
      
      return { frequency, mode };

    } catch (error) {
      console.error("Failed to play from API:", error);
      setIsPlaying(false);
      throw error;
    }
  };

  const stop = async () => {
    try {
      if (soundRef.current) {
        setIsPlaying(false); // Update state immediately for UI responsiveness
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    } catch (error) {
      console.error("Error during stop:", error);
    } finally {
      setIsPlaying(false);
      onTimeUpdate(0);
    }
  };
  
  const toggle = async () => {
    if (!soundRef.current) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Error during toggle:", error);
    }
  };

  return { isPlaying, playFromApi, stop, toggle };
}