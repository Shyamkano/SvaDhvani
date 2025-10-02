import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';

export function useBinauralBeatsPlayer(onTimeUpdate: (timeInSeconds: number) => void) {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const play = async (baseFrequency: number) => {
    try {
      if (soundRef.current) await stop();
      
      console.log(`Playing audio for frequency: ${baseFrequency} Hz`);
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/audio/placeholder-sound.mp3'),
        { shouldPlay: true, isLooping: true }
      );
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.isPlaying) {
          onTimeUpdate(status.positionMillis / 1000); // Report time in seconds
        }
      });
      
      setIsPlaying(true);
    } catch (error) { console.error("Failed to play sound", error); }
  };

  const stop = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
    onTimeUpdate(0);
  };
  
  const toggle = async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
    } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
    }
  };

  return { isPlaying, play, stop, toggle };
}