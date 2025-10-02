import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

// Adjust these paths to match your project structure
import { PlayerProvider } from 'context/PlayerContext';
import FloatingPlayer from '../components/FloatingPlayer';

// This prevents the native splash screen from auto-hiding before our app is ready.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // This state will track when our entire startup sequence is complete.
  const [isAppReady, setAppReady] = useState(false);

  // Load custom fonts
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('assets/images/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('assets/images/fonts/Inter-Medium.ttf'),
    'Inter-Bold': require('assets/images/fonts/Inter-Bold.ttf'),
  });

  // Effect to handle font loading and the custom splash screen timer
  useEffect(() => {
    if (fontError) throw fontError;

    // We only proceed if fonts have been successfully loaded.
    if (fontsLoaded) {
      // Hide the native splash screen now that our React Native part is ready to render.
      SplashScreen.hideAsync();

      // Start a timer for the duration of our custom animated splash screen.
      const timer = setTimeout(() => {
        // After 4 seconds, mark the app as ready to navigate away.
        setAppReady(true);
      }, 4000); // 4-second duration for your custom splash screen

      // Cleanup function to clear the timer if the component unmounts.
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, fontError]);

  // Effect to perform the navigation once the app is ready
  useEffect(() => {
    // We only navigate if the app is marked as ready.
    if (isAppReady) {
      // Replace the current route (splash screen) with the main app layout.
      // This prevents the user from navigating back to the splash screen.
      router.replace('/home');
    }
  }, [isAppReady]);
  
  // If fonts are not loaded yet, we render nothing.
  // This keeps the native splash screen (defined in app.json) visible.
  if (!fontsLoaded) {
    return null;
  }

  return (
    <PlayerProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Defines the 'index' route which points to your custom SplashScreen component */}
        <Stack.Screen name="index" />
        
        {/* Defines the '(app)' group which contains your main app (tabs, etc.) */}
        <Stack.Screen name="(app)" />
      </Stack>
      
      {/* The FloatingPlayer sits on top of the Stack Navigator, making it globally persistent */}
      <FloatingPlayer />
    </PlayerProvider>
  );
}