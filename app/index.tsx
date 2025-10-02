import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, Waves } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

// Adjust path if needed to match your project structure
import { Colors, Radius, Spacing, TextVariants } from '../constants/theme';

// --- Reusable Animated Sub-Components ---

const AnimatedWave = ({ top, duration, direction = 'forward' }: { top: string, duration: number, direction?: 'forward' | 'backward' }) => {
  const { width } = useWindowDimensions();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: duration * 1000, easing: Easing.linear }), -1, true);
  }, [progress, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const start = direction === 'forward' ? -width : width;
    const end = direction === 'forward' ? width : -width;
    const translateX = interpolate(progress.value, [0, 1], [start, end]);
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0.2, 0.5, 0.2]);
    return { transform: [{ translateX }], opacity };
  });

  return (
    <Animated.View style={[{ position: 'absolute', top, left: 0, opacity: 0.3 }, animatedStyle]}>
      <LinearGradient colors={['transparent', Colors.dark.primary, 'transparent']} style={{ width: width, height: 128 }} />
    </Animated.View>
  );
};

const PulsingDot = ({ delay }: { delay: number }) => {
  const progress = useSharedValue(0.5);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [progress, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 0.5, 1], [1, 1.5, 1]);
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0.3, 1, 0.3]);
    return { transform: [{ scale }], opacity };
  });

  return <Animated.View style={styles.loadingDot} />;
};

// --- Main Splash Screen Component (UI Only) ---
export default function SplashScreen() {
  // All navigation logic has been moved to app/_layout.tsx
  // This component is now only responsible for displaying the UI.

  return (
    <LinearGradient colors={[Colors.dark.background, Colors.dark.cardDarker]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Background */}
      <View style={StyleSheet.absoluteFillObject}>
        <AnimatedWave top="25%" duration={4} direction="forward" />
        <AnimatedWave top="50%" duration={5} direction="backward" />
        <AnimatedWave top="75%" duration={6} direction="forward" />
      </View>

      <View style={styles.content}>
        {/* Logo */}
        <Animated.View entering={FadeIn.duration(800).springify()}>
          <View style={styles.logoContainer}>
            <View style={styles.logoGlow} />
            <LinearGradient colors={[Colors.dark.primary, Colors.dark.secondary]} style={styles.logoGradient}>
              <View style={styles.logoInner}>
                <Waves size={48} color={Colors.dark.primary} style={{ position: 'absolute' }} />
                <Brain size={40} color={Colors.dark.secondary} />
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* App Name (Gradient Text) */}
        <Animated.View entering={FadeInDown.duration(800).delay(300)}>
          <MaskedView
            style={{ height: 60 }}
            maskElement={<Text style={styles.appName}>BinauralMind</Text>}
          >
            <LinearGradient
              colors={[Colors.dark.primary, Colors.dark.secondary, Colors.dark.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            />
          </MaskedView>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text entering={FadeInDown.duration(800).delay(500)} style={styles.tagline}>
          Personalized Binaural Beats for Your Mind.
        </Animated.Text>

        {/* Loading Indicator */}
        <Animated.View entering={FadeIn.duration(800).delay(800)} style={styles.loadingContainer}>
          {[0, 1, 2].map((i) => <PulsingDot key={i} delay={i * 200} />)}
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

// --- StyleSheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.m,
  },
  logoContainer: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.l,
  },
  logoGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: Colors.dark.primary,
    borderRadius: Radius.xl * 2,
    opacity: 0.4,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.xl * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 112,
    height: 112,
    borderRadius: Radius.xl * 1.75,
    backgroundColor: Colors.dark.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    ...TextVariants.h1,
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tagline: {
    ...TextVariants.body,
    color: Colors.dark.textMedium,
    textAlign: 'center',
    maxWidth: '80%',
  },
  loadingContainer: {
    flexDirection: 'row',
    gap: Spacing.s,
    marginTop: Spacing.xl,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.primary,
  },
});