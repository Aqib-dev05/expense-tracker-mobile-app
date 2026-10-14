import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Appearance } from 'react-native';
import { useColorScheme } from 'nativewind';
import { KEYS, readJson, writeJson } from '@/lib/storage';
import type { DateFormat } from '@/constants';

export type Theme = 'light' | 'dark';

interface Prefs {
  theme: Theme;
  dateFormat: DateFormat;
  budgetAlerts: boolean;
  dailyReminder: boolean;
  reminderHour: number;
  reminderMinute: number;
}

interface PreferencesValue extends Prefs {
  ready: boolean;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setDateFormat: (f: DateFormat) => void;
  update: (patch: Partial<Prefs>) => void;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

const systemTheme = (): Theme => (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');
const defaults = (): Prefs => ({
  theme: systemTheme(),
  dateFormat: 'short',
  budgetAlerts: true,
  dailyReminder: false,
  reminderHour: 20,
  reminderMinute: 0,
});

/** Theme, date format and notification settings. Persisted on the device (AsyncStorage). */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(defaults);
  const [ready, setReady] = useState(false);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    readJson<Partial<Prefs>>(KEYS.prefs, {}).then((stored) => {
      setPrefs((p) => ({ ...p, ...stored }));
      setReady(true);
    });
  }, []);

  // Drives NativeWind's `dark:` variants (darkMode: 'class') and the native dialogs' appearance.
  useEffect(() => {
    if (!ready) return;
    setColorScheme(prefs.theme);
    Appearance.setColorScheme(prefs.theme);
  }, [ready, prefs.theme, setColorScheme]);

  const update = useCallback((patch: Partial<Prefs>) => {
    setPrefs((p) => {
      const next = { ...p, ...patch };
      writeJson(KEYS.prefs, next);
      return next;
    });
  }, []);

  const value = useMemo<PreferencesValue>(
    () => ({
      ...prefs,
      ready,
      update,
      setTheme: (theme) => update({ theme }),
      toggleTheme: () => update({ theme: prefs.theme === 'dark' ? 'light' : 'dark' }),
      setDateFormat: (dateFormat) => update({ dateFormat }),
    }),
    [prefs, ready, update]
  );
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export const usePreferences = () => useContext(PreferencesContext)!;
