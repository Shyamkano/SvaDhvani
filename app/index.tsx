import { BrainIcon as Brain } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Radius, Spacing, TextVariants } from '../constants/theme'; // Adjust path

export default function SplashScreen() {
  const logoScale = useSharedValue(1);

  useEffect(() => {
    logoScale.value = withRepeat(
      withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[Colors.dark.background, Colors.dark.cardDarker]} style={styles.content}>
        
        <Animated.View
          entering={FadeIn.duration(800).springify()}
          exiting={FadeOut.duration(500)}
          style={[styles.logoContainer, animatedLogoStyle]}
        >
          <HugeiconsIcon icon={Brain} size={48} color={Colors.dark.primary} />
        </Animated.View>

        <Animated.View exiting={FadeOut.duration(500)} entering={FadeInDown.duration(800).delay(300)}>
          <MaskedView
            style={{ height: 60 }}
            maskElement={<Text style={styles.appNameMask}>Beatus</Text>}
          >
            <LinearGradient
              colors={[Colors.dark.primary, Colors.dark.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            />
          </MaskedView>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.duration(800).delay(600)}
          exiting={FadeOut.duration(500)}
          style={styles.tagline}
        >
          Your Mood, Your Rhythm
        </Animated.Text>

      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.l,
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.xl * 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  appNameMask: {
    // This style defines the shape of the mask
    fontFamily: 'Inter-Bold',
    fontSize: 52,
    textAlign: 'center',
    // ✅ THIS IS THE CRITICAL FIX: The mask needs a solid color to be visible to the renderer.
    color: 'black', 
  },
  tagline: {
    ...TextVariants.secondary,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.dark.textMedium,
    marginTop: Spacing.xs,
  },
});