import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

// // Adjust these paths to match your project structure
// import { PlayerProvider } from '../context/PlayerContext';
// import FloatingPlayer from '../components/FloatingPlayer';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Your font loading logic (or other initial setup) can stay here
  const [loaded, error] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PlayerProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* This screen points to your app/index.tsx (Splash Screen) */}
        <Stack.Screen name="index" />
        
        {/* This screen points to the (app) layout group */}
        <Stack.Screen name="(app)" />
      </Stack>
      
      {/* The FloatingPlayer sits outside the Stack, so it can overlay everything */}
      <FloatingPlayer />
    </PlayerProvider>
  );
}