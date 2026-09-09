import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/lib/api';

export type UserRole = 'maman' | 'etudiant' | 'artisan' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified?: boolean;
  profile?: { photo_url?: string; phone?: string; address?: string };
}

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  address?: string;
  role: 'maman' | 'etudiant' | 'artisan';
  category_ids?: (string | number)[];
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (credentials: { login: string; password: string }) => Promise<unknown>;
  register: (payload: RegisterPayload) => Promise<unknown>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  isAdmin: boolean;
  isMaman: boolean;
  isPrestataire: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('nafissa_token');
      if (!token) {
        setUser(null);
        return;
      }
      const { data } = await api.get<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch {
      await AsyncStorage.multiRemove(['nafissa_token', 'nafissa_user']);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (credentials: { login: string; password: string }) => {
    const { data } = await api.post<{ token: string; user: User }>('/auth/login', {
      login: credentials.login.trim(),
      password: credentials.password,
    });
    await AsyncStorage.setItem('nafissa_token', data.token);
    await AsyncStorage.setItem('nafissa_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { data } = await api.post<{ token: string; user: User }>('/auth/register', payload);
    await AsyncStorage.setItem('nafissa_token', data.token);
    await AsyncStorage.setItem('nafissa_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    }
    await AsyncStorage.multiRemove(['nafissa_token', 'nafissa_user']);
    setUser(null);
  }, []);

  const value = useMemo(
    (): AuthContextValue => ({
      user,
      loading,
      login,
      register,
      logout,
      loadUser,
      isAdmin: user?.role === 'admin',
      isMaman: user?.role === 'maman',
      isPrestataire: user?.role === 'etudiant' || user?.role === 'artisan',
    }),
    [user, loading, loadUser, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
