/**
 * explore.tsx — was the Expo template demo screen.
 * Replaced with a redirect to home since explore.tsx is not part of this app.
 * expo-image and expo-symbols are NOT installed (SDK 54 build).
 */
import { Redirect } from 'expo-router';

export default function ExploreScreen() {
  return <Redirect href="/home" />;
}
