import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerNotifications(): Promise<boolean> {
  // expo-notifications permission is not needed on web
  if (Platform.OS === 'web') return false;

  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== 'granted') {
    console.log('Notification permission denied');
    return false;
  }

  return true;
}