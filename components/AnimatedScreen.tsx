import { useFocusEffect } from 'expo-router';
import React from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';

interface AnimatedScreenProps {
  children: React.ReactNode;
}

const AnimatedScreen: React.FC<AnimatedScreenProps> = ({ children }) => {
  const scale = useSharedValue(0.95); // Start slightly smaller
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
      flex: 1,
      backgroundColor: Colors.dark.background,
    };
  });

  useFocusEffect(
    React.useCallback(() => {
      // Use a spring animation for a more natural and smooth feel
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
        overshootClamping: true, // Prevent the spring from overshooting
      });
      // Use a slightly longer duration for the fade-in
      opacity.value = withTiming(1, {
        duration: 600,
        easing: Easing.inOut(Easing.ease),
      });

      return () => {
        scale.value = 0.95; // Reset scale
        opacity.value = 0;
      };
    }, [])
  );

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
};

export default AnimatedScreen;