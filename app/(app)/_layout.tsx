import { Stack } from 'expo-router';

// This layout acts as a container for your main app experience,
// separating it from the initial splash/auth flow.
export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* This line tells the router to render the (tabs) layout inside this group */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}