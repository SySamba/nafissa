import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_PORT = 3001;

/** L'utilisateur a-t-il défini une URL explicite (.env / app.config) ? */
function explicitUrl(): string | null {
  const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  const raw = (fromEnv || fromExtra || '').trim().replace(/\s+/g, '');
  // On ignore les valeurs par défaut « localhost » : injoignables depuis un
  // téléphone ou un émulateur. La détection automatique ci-dessous est meilleure.
  if (!raw) return null;
  if (/127\.0\.0\.1|localhost/.test(raw)) return null;
  return raw;
}

/**
 * Détection automatique de l'IP du PC de dev à partir de l'hôte Metro
 * (ex. « 192.168.1.20:8081 » → « http://192.168.1.20:3001/api »).
 * Évite d'avoir à configurer un .env : c'est la cause n°1 de « ça ne se connecte pas ».
 */
function autoDetectUrl(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants.expoGoConfig?.debuggerHost as string | undefined);
  if (!hostUri) return null;
  const host = String(hostUri).split('://').pop()?.split(':')[0];
  if (!host) return null;
  return `http://${host}:${API_PORT}/api`;
}

function resolveBaseUrl(): string {
  const explicit = explicitUrl();
  if (explicit) return explicit.replace(/\/+$/, '');

  const auto = autoDetectUrl();
  if (auto) return auto;

  // Derniers recours selon la plateforme.
  if (Platform.OS === 'android') return `http://10.0.2.2:${API_PORT}/api`;
  return `http://127.0.0.1:${API_PORT}/api`;
}

export const API_BASE_URL = resolveBaseUrl();

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
