/**
 * i18n configuration
 *
 * Dependencies to install:
 *   npm install i18next react-i18next
 *
 * Note: react-i18next works on React Native via standard React context.
 * No special backend plugin needed since we import translations directly.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import ar from './locales/ar';

export const LANGUAGES = {
  en: 'English',
  ar: 'العربية',
} as const;

export type SupportedLanguage = keyof typeof LANGUAGES;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

export default i18n;
