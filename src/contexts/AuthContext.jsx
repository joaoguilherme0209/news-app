import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await authApi.getProfile();
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const onLogout = () => {
      setUser(null);
    };
    window.addEventListener('auth-logout', onLogout);
    return () => window.removeEventListener('auth-logout', onLogout);
  }, []);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    if (data?.token && data?.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    }
    throw new Error(data?.message || 'Login falhou');
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    if (data?.token && data?.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    }
    throw new Error(data?.message || 'Registro falhou');
  };

  const updateProfile = async (payload) => {
    const { data } = await authApi.updateProfile(payload);
    if (data?.user) {
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    }
    throw new Error(data?.message || 'Atualização falhou');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('auth-logout'));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile: loadProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
