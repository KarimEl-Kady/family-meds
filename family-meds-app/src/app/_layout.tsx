/**
 * Root layout — initialises i18n, handles auto-login, sets up navigation.
 *
 * Install required before running:
 *   npm install i18next react-i18next
 */

// Must import i18n before anything else so translations are ready
import '../i18n';

import { useEffect, useState } from 'react';
import { ActivityIndicator, I18nManager, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { getToken } from '../storage/token';
import { getPersistedLanguage } from '../hooks/use-language';

export default function RootLayout() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const boot = async () => {
      try {
        // Restore language preference
        const savedLang = await getPersistedLanguage();
        if (savedLang && savedLang !== i18n.language) {
          await i18n.changeLanguage(savedLang);
          I18nManager.forceRTL(savedLang === 'ar');
        }

        // Auto-login: if token exists skip login screen
        const token = await getToken();
        if (token) {
          router.replace('/home');
        }
      } catch {
        // Stay on login
      } finally {
        setIsBooting(false);
      }
    };

    boot();
  }, []);

  if (isBooting) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1e293b' },
        headerTintColor: '#f1f5f9',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#0f172a' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="register"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="home"
        options={{ title: 'My Medicines', headerShown: false }}
      />
      <Stack.Screen
        name="add-medicine"
        options={{ title: 'Add Medicine' }}
      />
      <Stack.Screen
        name="edit-medicine"
        options={{ title: 'Edit Medicine' }}
      />
      <Stack.Screen
        name="dose-logs"
        options={{ title: 'Dose History' }}
      />
      <Stack.Screen
        name="family"
        options={{ title: 'Family' }}
      />
    </Stack>
  );
}
