import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type { ApiError } from '@/types';

/**
 * Frontend caching strategy
 * -------------------------
 * - Every API read goes through TanStack Query: in-memory cache, request de-duplication, background refetch.
 * - The cache is persisted to AsyncStorage, so the app opens instantly with the last-known data (also offline).
 * - `staleTime` 60 s: screens re-use fresh data and silently refetch once it is older than that.
 * - `networkMode: 'offlineFirst'`: while offline queries serve cached data instead of erroring out;
 *   they refetch automatically on reconnect and when the app returns to the foreground.
 * - Writes always go to the server (the backend is the source of truth) and then invalidate the cache.
 */
export const CACHE_KEY = 'ledgerly.rq-cache';
const DAY = 24 * 60 * 60 * 1000;
export const CACHE_MAX_AGE = 7 * DAY;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: CACHE_MAX_AGE, // must be >= the persister maxAge, otherwise entries are dropped before they are saved
      networkMode: 'offlineFirst',
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        const status = (error as ApiError).status;
        if (status && status < 500) return false; // 4xx will not fix itself
        return failureCount < 2;
      },
    },
    mutations: { networkMode: 'online' },
  },
});

export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: CACHE_KEY,
  throttleTime: 1000,
});

/** Wipes memory + disk cache (logout / session expiry) so one user's data is never shown to another. */
export async function clearCache() {
  queryClient.clear();
  await AsyncStorage.removeItem(CACHE_KEY);
}

let wired = false;
/** Connects React Query to React Native: connectivity (NetInfo) and app foreground/background (AppState). */
export function setupQueryEnvironment() {
  if (wired) return;
  wired = true;
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((s) => setOnline(Boolean(s.isConnected) && s.isInternetReachable !== false))
  );
  AppState.addEventListener('change', (status) => focusManager.setFocused(status === 'active'));
}
