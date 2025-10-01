import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
// Import the full design system
import { Colors, Radius, Spacing, TextVariants } from '../constants/theme';

type CustomTabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

export default function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  // Although your app is dark, this is the correct way to handle themes
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
          
          // Using the corrected, robust color paths
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
                 <Icon focused={isFocused} color={color} />
              </View>
              {/* Note: We apply the spread TextVariant style to the Text component itself */}
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

// Use the theme file to build the StyleSheet
const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: Spacing.l,
    left: Spacing.m,
    right: Spacing.m,
    // Add shadow for a floating effect
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
    borderColor: Colors.dark.border, // Explicitly using dark theme border
    borderWidth: 1,
    overflow: 'hidden', // CRITICAL for BlurView border radius
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
    backgroundColor: Colors.dark.glow, // Correct path for glow
  },
  // CORRECTLY using the spread operator for text styles
  label: {
    ...TextVariants.label,
  },
});