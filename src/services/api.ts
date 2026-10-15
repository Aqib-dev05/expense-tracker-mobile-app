import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { ApiError } from '@/types';

/**
 * Base URL of the Express API. On the Android emulator the host machine is reachable at 10.0.2.2,
 * so `localhost` / `127.0.0.1` are rewritten automatically. On a physical phone use your computer's
 * LAN IP (or a deployed https URL) in EXPO_PUBLIC_API_URL.
 */
const RAW_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
export const API_URL =
  Platform.OS === 'android' ? RAW_URL.replace(/\/\/(localhost|127\.0\.0\.1)(?=[:/]|$)/, '//10.0.2.2') : RAW_URL;

const TOKEN_KEY = 'et_token';
let memoryToken: string | null = null;

/** JWT lives in the Android Keystore-backed SecureStore; an in-memory copy keeps request interceptors synchronous. */
export const tokenStore = {
  get: () => memoryToken,
  async load() {
    try { memoryToken = await SecureStore.getItemAsync(TOKEN_KEY); } catch { memoryToken = null; }
    return memoryToken;
  },
  async set(token: string) {
    memoryToken = token;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clear() {
    memoryToken = null;
    try { await SecureStore.deleteItemAsync(TOKEN_KEY); } catch { /* nothing stored */ }
  },
};

const api = axios.create({ baseURL: API_URL, timeout: 30000 });

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => { onUnauthorized = fn; };

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const isAuthCall = AUTH_PATHS.some((p) => error.config?.url?.startsWith(p));
    if (status === 401 && !isAuthCall && tokenStore.get()) {
      await tokenStore.clear();
      onUnauthorized?.(); // session expired / invalid: drop to the login screen
    }
    return Promise.reject(normalizeError(error));
  }
);

export function normalizeError(error: AxiosError): ApiError {
  const body = error.response?.data as { message?: string; details?: ApiError['details'] } | undefined;
  let message = body?.message;
  if (!message) {
    if (error.code === 'ECONNABORTED') message = 'The request timed out. Please try again.';
    else if (error.request && !error.response) message = 'Cannot reach the server. Check your connection and try again.';
    else message = 'Something went wrong. Please try again.';
  }
  const err: ApiError = new Error(message);
  err.status = error.response?.status;
  err.details = body?.details;
  return err;
}

/** Drops empty values so they are not sent as blank query params. */
export const cleanParams = <T extends object>(params: T = {} as T) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined));

export default api;
