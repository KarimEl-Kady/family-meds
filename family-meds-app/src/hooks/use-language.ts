/**
 * useLanguage hook
 *
 * Handles:
 * - Language switching
 * - RTL layout toggling via I18nManager
 * - Persisting the selected language to SecureStore (or memory on web)
 */
import { useCallback } from 'react';
import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from '../i18n';
import { getToken } from '../storage/token';

const LANG_KEY = 'app_language';

async function persistLanguage(lang: string): Promise<void> {
  // Reuse the same storage abstraction as token storage
  // We write a separate key via a simple async helper
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(LANG_KEY, lang);
  } else {
    const { default: SecureStore } = await import('expo-secure-store');
    await SecureStore.setItemAsync(LANG_KEY, lang);
  }
}

export async function getPersistedLanguage(): Promise<SupportedLanguage | null> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return (window.localStorage.getItem(LANG_KEY) as SupportedLanguage) ?? null;
    }
    const { default: SecureStore } = await import('expo-secure-store');
    const lang = await SecureStore.getItemAsync(LANG_KEY);
    return (lang as SupportedLanguage) ?? null;
  } catch {
    return null;
  }
}

export function useLanguage() {
  const { i18n } = useTranslation();

  const changeLanguage = useCallback(
    async (lang: SupportedLanguage) => {
      await i18n.changeLanguage(lang);
      const isRTL = lang === 'ar';

      if (I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL);
        // On native: app needs a reload to apply RTL properly.
        // We just persist here — the app will apply on next cold start.
      }

      await persistLanguage(lang);
    },
    [i18n],
  );

  return {
    currentLanguage: i18n.language as SupportedLanguage,
    changeLanguage,
    isRTL: i18n.language === 'ar',
  };
}
