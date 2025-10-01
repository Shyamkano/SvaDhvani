// components/CustomTabBar.tsx --- CORRECTED VERSION ---

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

// Import the full design system
import { Colors, Radius, Spacing, TextVariants } from '../constants/theme'; // Make sure this path is correct

type CustomTabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

export default function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const colorScheme = useColorScheme() ?? 'dark'; 
  const currentThemeColors = Colors[colorScheme];

  return (
    <View style={styles.tabBarContainer}>
      <BlurView
        intensity={80}
        tint="dark"
        style={styles.blurView}
      >
        {state.routes.map((route: any, index: number) => {
          // Safety Check: If a route has no corresponding descriptor, skip it.
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
          
          // Safety Check: If tabBarIcon is not defined for some reason, don't render this tab item.
          if (!Icon) {
            return null;
          }
          
          const color = isFocused ? currentThemeColors.tabIconSelected : currentThemeColors.tabIconDefault;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              <View style={[styles.iconContainer, isFocused && styles.iconContainerFocused]}>
                 {/* ✅ THE FIX: We are removing the 'focused' prop for now, as it's the most likely cause of the error. */}
                 <Icon color={color} />
              </View>
              <Text style={[{ color }, styles.label]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

// Your styles remain the same
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
  iconContainerFocused: {
    backgroundColor: Colors.dark.glow,
  },
  label: {
    ...TextVariants.label,
  },
});