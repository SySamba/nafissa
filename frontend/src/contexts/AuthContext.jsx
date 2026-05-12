import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('nafissa_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authAPI.me();
      setUser(data.user);
    } catch {
      localStorage.removeItem('nafissa_token');
      localStorage.removeItem('nafissa_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('nafissa_token', data.token);
    localStorage.setItem('nafissa_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('nafissa_token', data.token);
    localStorage.setItem('nafissa_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      localStorage.removeItem('nafissa_token');
      localStorage.removeItem('nafissa_user');
      setUser(null);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isMaman = user?.role === 'maman';
  const isPrestataire = user?.role === 'etudiant' || user?.role === 'artisan';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isMaman, isPrestataire, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook utilisé hors arbre de composants
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
