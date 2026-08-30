import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, apiErrorMessage } from '../services/api';
import {
  login as loginApi,
  register as registerApi,
  googleAuthenticate as googleAuthenticateApi,
  logout as logoutApi,
  getStoredSession,
  clearStoredSession,
} from '../services/authService';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'patient' | 'doctor', recoveryCodes: string[]) => Promise<void>;
  googleAuthenticate: (credential: string, role: 'patient' | 'doctor') => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Hook that must be used to read auth state or trigger login/register/logout. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session from localStorage on mount.
  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      setToken(session.token);
      setUser(session.user);
      api.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { token: newToken, user: newUser } = await loginApi(email, password);
      setToken(newToken);
      setUser(newUser);
    } catch (err) {
      setError(apiErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'patient' | 'doctor',
    recoveryCodes: string[],
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { token: newToken, user: newUser } = await registerApi(name, email, password, role, recoveryCodes);
      setToken(newToken);
      setUser(newUser);
    } catch (err) {
      setError(apiErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutApi();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((current) => {
      if (!current) return current;
      const updated = { ...current, ...updates };
      localStorage.setItem('docly_user', JSON.stringify(updated));
      return updated;
    });
  };

  const googleAuthenticate = async (credential: string, role: 'patient' | 'doctor'): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { token: newToken, user: newUser } = await googleAuthenticateApi(credential, role);
      setToken(newToken);
      setUser(newUser);
    } catch (err) {
      setError(apiErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    error,
    login,
    register,
    googleAuthenticate,
    updateUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
