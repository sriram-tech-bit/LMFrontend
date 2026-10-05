import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { LoginResponse } from '../types';

interface AuthContextValue {
  token: string | null;
  user: LoginResponse['user'] | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('shelflife-token'));
  const [user, setUser] = useState<LoginResponse['user'] | null>(() => {
    const saved = localStorage.getItem('shelflife-user');
    return saved ? (JSON.parse(saved) as LoginResponse['user']) : null;
  });

  const logout = useCallback(() => {
    localStorage.removeItem('shelflife-token');
    localStorage.removeItem('shelflife-user');
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password);
    const result = response.data;
    localStorage.setItem('shelflife-token', result.token);
    localStorage.setItem('shelflife-user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
  }, []);

  useEffect(() => {
    window.addEventListener('shelflife:unauthorized', logout);
    return () => window.removeEventListener('shelflife:unauthorized', logout);
  }, [logout]);

  const value = useMemo(() => ({ token, user, login, logout }), [token, user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
