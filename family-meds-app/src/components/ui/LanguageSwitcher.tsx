/**
 * Language Switcher button — shows EN | AR toggle.
 * Place anywhere in a header or settings panel.
 */
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const LANG_KEY = 'app_language';

async function saveLang(lang: string) {
  if (Platform.OS === 'web') {
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* */ }
  } else {
    await SecureStore.setItemAsync(LANG_KEY, lang);
  }
}

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const toggle = async () => {
    const next = isAr ? 'en' : 'ar';
    await i18n.changeLanguage(next);
    await saveLang(next);
    if (next === 'ar') {
      I18nManager.forceRTL(true);
    } else {
      I18nManager.forceRTL(false);
    }
  };

  return (
    <TouchableOpacity
      style={s.btn}
      onPress={toggle}
      accessibilityLabel="language-switcher"
    >
      <View style={s.pill}>
        <Text style={[s.opt, !isAr && s.optActive]}>EN</Text>
        <Text style={s.sep}>|</Text>
        <Text style={[s.opt, isAr && s.optActive]}>ع</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: { padding: 4 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 4,
  },
  opt: { fontSize: 13, fontWeight: '700', color: '#475569' },
  optActive: { color: '#818cf8' },
  sep: { color: '#334155', fontSize: 12 },
});
