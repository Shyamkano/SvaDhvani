import { LinearGradient } from 'expo-linear-gradient';
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import your theme for consistent styling
import { Colors, Spacing, TextVariants } from '../constants/theme';

export default function NotFoundScreen() {
  return (
    <LinearGradient colors={[Colors.dark.background, Colors.dark.cardDarker]} style={styles.container}>
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Stack.Screen options={{ title: 'Oops!' }} />
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/(tabs)/home" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...TextVariants.h2,
    color: Colors.dark.text,
    marginBottom: Spacing.l,
  },
  link: {
    marginTop: Spacing.m,
    paddingVertical: Spacing.m,
  },
  linkText: {
    fontSize: 14,
    color: Colors.dark.primary,
  },
});