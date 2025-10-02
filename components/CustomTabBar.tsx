// components/CustomTabBar.tsx --- ANIMATED VERSION ---

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

// Import the full design system
import { Colors, Radius, Spacing, TextVariants } from '../constants/theme'; // Make sure this path is correct

type CustomTabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

// Create an animatable version of the Pressable component
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const currentThemeColors = Colors[colorScheme];

  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={80} tint="dark" style={styles.blurView}>
        {state.routes.map((route: any, index: number) => {
          if (!descriptors[route.key]) {
            return null;
          }

          const { options } = descriptors[route.key];
          const label = options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

          const Icon = options.tabBarIcon;
          if (!Icon) {
            return null;
          }

          const color = isFocused ? currentThemeColors.tabIconSelected : currentThemeColors.tabIconDefault;

          // Animated style for the icon container
          const animatedIconContainerStyle = useAnimatedStyle(() => {
            return {
              // Animate the background color with a timing function for a smooth fade
              backgroundColor: withTiming(isFocused ? Colors.dark.glow : 'transparent', {
                duration: 300,
              }),
              // Animate the scale with a spring for a bouncy effect
              transform: [{ scale: withSpring(isFocused ? 1 : 0.8, { damping: 15, stiffness: 200 }) }],
            };
          });

          return (
            <AnimatedPressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              <Animated.View style={[styles.iconContainer, animatedIconContainerStyle]}>
                <Icon color={color} />
              </Animated.View>
              <Text style={[{ color }, styles.label]}>
                {label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </BlurView>
    </View>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: Spacing.l,
    left: Spacing.m,
    right: Spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  blurView: {
    width: '100%',
    flexDirection: 'row',
    height: 85,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.s,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderColor: Colors.dark.border,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xs,
  },
  iconContainer: {
    width: 52,
    height: 42,
    borderRadius: Radius.l,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  // We no longer need the iconContainerFocused style, as Reanimated handles it
  label: {
    ...TextVariants.label,
  },
});