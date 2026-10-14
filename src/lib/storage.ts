import AsyncStorage from '@react-native-async-storage/async-storage';

/** Small JSON helpers over AsyncStorage that never throw (storage failures just fall back to defaults). */
export async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function writeJson(key: string, value: unknown) {
  try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

export async function removeKey(key: string) {
  try { await AsyncStorage.removeItem(key); } catch { /* storage unavailable */ }
}

export const KEYS = {
  user: 'ledgerly.user',
  prefs: 'ledgerly.prefs',
  budgetAlerts: 'ledgerly.budget-alerts',
};
