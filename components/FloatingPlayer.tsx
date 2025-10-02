import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pause, Play, X } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeOutDown, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { Colors, Radius, Spacing, TextVariants } from '../constants/theme';
import { usePlayer } from '../context/PlayerContext';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const VisualizerBar = ({ index, isPlaying }: { index: number, isPlaying: boolean }) => {
  const height = useSharedValue(isPlaying ? 0.3 : 0.5); // Start at 30% or 50% height

  useEffect(() => {
    if (isPlaying) {
      height.value = withRepeat(
        withTiming(0.7, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        -1, true
      );
    } else {
      height.value = withTiming(0.3, { duration: 200 });
    }
  }, [isPlaying, height]);

  const animatedStyle = useAnimatedStyle(() => {
    const newHeight = interpolate(height.value, [0, 1], [0, 60]); // 60 is the max height in pixels
    return { height: newHeight };
  });

  return <Animated.View style={[styles.visualizerBar, animatedStyle]} />;
};

export default function FloatingPlayer() {
  const { isVisible, isPlaying, currentSession, progress, currentTime, closePlayer, togglePlayPause } = usePlayer();

  if (!isVisible || !currentSession) {
    return null;
  }

  return (
    <Animated.View entering={FadeInDown.duration(500).springify()} exiting={FadeOutDown.duration(300)} style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.blurView}>
        {/* Progress Bar */}
        <View style={styles.progressBarBackground}>
          <LinearGradient colors={[Colors.dark.primary, Colors.dark.secondary]} style={[styles.progressBarForeground, { width: `${progress * 100}%` }]} />
        </View>

        {/* Main Content */}
        <Pressable onPress={() => router.push({ pathname: '/(tabs)/player' })} style={styles.content}>
          <LinearGradient colors={[Colors.dark.primary, Colors.dark.secondary]} style={styles.visualizerContainer}>
            <View style={styles.visualizerInner}>
              {[0, 1, 2, 3].map(i => <VisualizerBar key={i} index={i} isPlaying={isPlaying} />)}
            </View>
          </LinearGradient>

          <View style={styles.infoContainer}>
            <Text style={styles.titleText} numberOfLines={1}>{currentSession.name}</Text>
            <Text style={styles.subtitleText}>{currentSession.frequency} Hz • {currentSession.category}</Text>
            <Text style={styles.timeText}>{formatTime(currentTime)} / {formatTime(currentSession.duration)}</Text>
          </View>
          
          <View style={styles.controls}>
            <Pressable onPress={togglePlayPause} style={styles.playButton}>
              {isPlaying ? <Pause size={20} color="white" fill="white"/> : <Play size={20} color="white" fill="white" style={{marginLeft: 2}}/>}
            </Pressable>
            <Pressable onPress={closePlayer} style={styles.closeButton}>
              <X size={16} color={Colors.dark.textMedium} />
            </Pressable>
          </View>
        </Pressable>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 96, left: Spacing.m, right: Spacing.m, zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  blurView: { borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.dark.border, overflow: 'hidden' },
  progressBarBackground: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)' },
  progressBarForeground: { height: '100%' },
  content: { flexDirection: 'row', alignItems: 'center', gap: Spacing.m, padding: Spacing.m },
  visualizerContainer: { width: 60, height: 60, borderRadius: Radius.l, justifyContent: 'center', alignItems: 'center' },
  visualizerInner: { flexDirection: 'row', alignItems: 'center', gap: 3, height: '40%' },
  visualizerBar: { width: 4, backgroundColor: 'white', borderRadius: 2 },
  infoContainer: { flex: 1 },
  titleText: { ...TextVariants.body, fontWeight: '600', color: Colors.dark.text },
  subtitleText: { ...TextVariants.secondary, color: Colors.dark.textMedium },
  timeText: { ...TextVariants.label, color: Colors.dark.secondary, marginTop: Spacing.xs },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.s },
  playButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  closeButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.dark.cardAccent, justifyContent: 'center', alignItems: 'center' },
});