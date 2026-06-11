import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'auth_token';
const isWeb = Platform.OS === 'web';

// Web: localStorage (persistent across page reloads)
// Native: SecureStore (encrypted)
export const saveToken = async (token: string): Promise<void> => {
  if (isWeb) {
    try { localStorage.setItem(KEY, token); } catch { /* */ }
  } else {
    await SecureStore.setItemAsync(KEY, token);
  }
};

export const getToken = async (): Promise<string | null> => {
  if (isWeb) {
    try { return localStorage.getItem(KEY); } catch { return null; }
  }
  return SecureStore.getItemAsync(KEY);
};

export const deleteToken = async (): Promise<void> => {
  if (isWeb) {
    try { localStorage.removeItem(KEY); } catch { /* */ }
  } else {
    await SecureStore.deleteItemAsync(KEY);
  }
};