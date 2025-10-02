import { Redirect } from 'expo-router';

/**
 * This component acts as the default route for the (tabs) layout.
 * It immediately redirects the user to the intended home screen, '/(app)/(tabs)/home'.
 * It is not a visible screen.
 */
export default function TabIndex() {
  return <Redirect href={'/(tabs)/home'} />;
}