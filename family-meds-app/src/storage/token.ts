import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

let memoryToken: string | null = null;

export const saveToken = async (token: string) => {
  if (isWeb) {
    memoryToken = token;
  } else {
    await SecureStore.setItemAsync('token', token);
  }
};

export const getToken = async () => {
  if (isWeb) {
    return memoryToken;
  } else {
    return await SecureStore.getItemAsync('token');
  }
};

export const deleteToken = async () => {
  if (isWeb) {
    memoryToken = null;
  } else {
    await SecureStore.deleteItemAsync('token');
  }
};