import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const rawExtra =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://127.0.0.1:3001/api';

/** Nettoie les espaces parasites (erreur fréquente dans app.config.js / .env) */
export const API_BASE_URL = rawExtra.trim().replace(/\s+/g, '').replace(/\/+$/, '');

/** Origine sans /api (pour les médias /storage/...) */
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/i, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(async (requestConfig) => {
  const token = await AsyncStorage.getItem('nafissa_token');
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url = typeof error.config?.url === 'string' ? error.config.url : '';
    const isAuthPublic = url.includes('/auth/login') || url.includes('/auth/register');
    if (status === 401 && !isAuthPublic) {
      await AsyncStorage.multiRemove(['nafissa_token', 'nafissa_user']);
    }
    return Promise.reject(error);
  }
);
