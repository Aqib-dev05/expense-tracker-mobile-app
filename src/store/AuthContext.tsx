import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authService from '@/services/authService';
import { setUnauthorizedHandler, tokenStore } from '@/services/api';
import { clearCache } from '@/lib/queryClient';
import { cancelDailyReminder } from '@/lib/notifications';
import { KEYS, readJson, removeKey, writeJson } from '@/lib/storage';
import type { User } from '@/types';

interface AuthValue {
  user: User | null;
  loading: boolean;
  login: (p: { email: string; password: string }) => Promise<void>;
  register: (p: { name: string; email: string; password: string; currency: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (p: Partial<Pick<User, 'name' | 'email' | 'avatar' | 'currency'>>) => Promise<User>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Keeps a copy of the user on disk so the app can open straight into the dashboard while offline.
  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    if (u) writeJson(KEYS.user, u);
    else removeKey(KEYS.user);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUserState(null);
      removeKey(KEYS.user);
      clearCache();
    });

    (async () => {
      const token = await tokenStore.load();
      if (!token) return setLoading(false);

      const cached = await readJson<User | null>(KEYS.user, null);
      if (cached) {
        setUserState(cached);
        setLoading(false); // show the app immediately, revalidate in the background
      }
      try {
        setUser(await authService.getMe());
      } catch {
        /* a 401 is handled by the Axios interceptor; network errors keep the cached session */
      } finally {
        setLoading(false);
      }
    })();
    return () => setUnauthorizedHandler(null);
  }, [setUser]);

  const login = useCallback(async (payload: { email: string; password: string }) => {
    const u = await authService.login(payload);
    await clearCache();
    setUser(u);
  }, [setUser]);

  const register = useCallback(async (payload: { name: string; email: string; password: string; currency: string }) => {
    const u = await authService.register(payload);
    await clearCache();
    setUser(u);
  }, [setUser]);

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {});
    await cancelDailyReminder();
    await clearCache();
    setUser(null);
  }, [setUser]);

  const updateProfile = useCallback(async (payload: Parameters<AuthValue['updateProfile']>[0]) => {
    const updated = await authService.updateProfile(payload);
    setUser(updated);
    return updated;
  }, [setUser]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile }),
    [user, loading, login, register, logout, updateProfile]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext)!;
